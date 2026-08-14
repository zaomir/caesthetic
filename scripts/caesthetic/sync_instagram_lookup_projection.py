#!/usr/bin/env python3
"""Sync the CAESTHETIC ManyChat lookup projection without persisting private rows in git.

Authority chain:
  Dropbox CURRENT.json -> immutable canonical_master.csv
  + exact-username enrichment from VDS data/master/master_companies.csv
  -> private Supabase read projection

The adapter never matches on business name, city, domain, biography, or similarity.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

REPO = Path(__file__).resolve().parents[2]
DEFAULT_CURRENT_REMOTE = "dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json"
EXPECTED_RELEASE_PREFIX = "dropbox:CAESTHETIC/audience/us-spa-ig-master/releases/"
DEFAULT_MASTER = Path("/var/www/grainee-v2/data/master/master_companies.csv")
DEFAULT_SUPABASE_URL = "https://lwyumrgygbuowndwcsvc.supabase.co"
USERNAME_RE = re.compile(r"^[a-z0-9._]{1,30}$")
INSTAGRAM_HOSTS = {"instagram.com", "www.instagram.com", "m.instagram.com"}
RESERVED_PATHS = {"accounts", "direct", "explore", "p", "reel", "reels", "stories"}


def normalize_username(value: Any) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    if re.match(r"^(?:https?://)?(?:www\.|m\.)?instagram\.com/", raw, re.I):
        candidate = raw if re.match(r"^https?://", raw, re.I) else f"https://{raw}"
        parsed = urllib.parse.urlparse(candidate)
        if parsed.hostname is None or parsed.hostname.lower() not in INSTAGRAM_HOSTS:
            return ""
        segments = [part for part in parsed.path.split("/") if part]
        if len(segments) != 1 or segments[0].lower() in RESERVED_PATHS:
            return ""
        raw = segments[0]
    else:
        raw = raw[1:] if raw.startswith("@") else raw
    lowered = raw.lower()
    return lowered if USERNAME_RE.fullmatch(lowered) else ""


def clean(value: Any, limit: int) -> str:
    return str(value or "").strip()[:limit]


def exact_consensus(values: Iterable[str]) -> str:
    """Return a field only when all non-empty exact values agree (case-insensitive)."""
    by_key: dict[str, str] = {}
    for raw in values:
        value = str(raw or "").strip()
        if value:
            by_key.setdefault(value.casefold(), value)
    return next(iter(by_key.values())) if len(by_key) == 1 else ""


def clean_website(value: Any) -> str:
    raw = clean(value, 500)
    if not raw:
        return ""
    try:
        parsed = urllib.parse.urlparse(raw)
    except ValueError:
        return ""
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return ""
    return raw


def city_state(city: Any, state: Any) -> str:
    parts = [clean(city, 80), clean(state, 40)]
    return ", ".join(part for part in parts if part)[:120]


def load_env() -> None:
    candidates = [
        REPO / ".cloud-agent.local.env",
        REPO / ".env",
        Path.home() / ".cursor_env",
        Path("/etc/evo/secrets.env"),
        Path("/etc/evo/deploy.env"),
    ]
    for path in candidates:
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.removeprefix("export ").strip()
            value = value.strip().strip('"').strip("'")
            if key:
                os.environ.setdefault(key, value)


def rclone_copyto(remote: str, local: Path) -> None:
    subprocess.run(
        ["rclone", "copyto", remote, str(local), "--quiet"],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )


def resolve_current(temp_dir: Path, current_remote: str) -> tuple[dict[str, Any], Path]:
    current_path = temp_dir / "CURRENT.json"
    rclone_copyto(current_remote, current_path)
    current = json.loads(current_path.read_text(encoding="utf-8"))
    release_id = clean(current.get("release_id"), 160)
    release_remote = clean(current.get("canonical_master"), 600)
    expected_prefix = f"{EXPECTED_RELEASE_PREFIX}{release_id}/"
    if not release_id or not release_remote.startswith(expected_prefix):
        raise RuntimeError("CURRENT release pointer is outside the canonical immutable release")
    if not release_remote.endswith("/canonical_master.csv"):
        raise RuntimeError("CURRENT canonical_master must point to canonical_master.csv")
    if current.get("execution_allowed") is not True:
        raise RuntimeError("CURRENT is not enabled; refusing to replace the projection")
    release_path = temp_dir / "canonical_master.csv"
    rclone_copyto(release_remote, release_path)
    return current, release_path


def load_release_rows(release_path: Path, deny_values: Iterable[Any]) -> list[dict[str, str]]:
    denies = {normalize_username(value) for value in deny_values}
    denies.discard("")
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    with release_path.open(newline="", encoding="utf-8", errors="strict") as handle:
        for source in csv.DictReader(handle):
            username = normalize_username(source.get("username") or source.get("instagram_username"))
            if not username:
                raise RuntimeError("canonical release contains an invalid username")
            if username in seen:
                raise RuntimeError("canonical release contains a duplicate normalized username")
            seen.add(username)
            if username in denies:
                continue
            rows.append(
                {
                    "username_normalized": username,
                    "practice_name": clean(source.get("business_name"), 160),
                    "city_state": city_state(source.get("city"), source.get("state")),
                    "website": "",
                }
            )
    return rows


def exact_master_enrichment(
    rows: list[dict[str, str]], master_path: Path
) -> tuple[list[dict[str, str]], int]:
    targets = {row["username_normalized"] for row in rows}
    exact: dict[str, list[dict[str, str]]] = defaultdict(list)
    with master_path.open(newline="", encoding="utf-8", errors="replace") as handle:
        for company in csv.DictReader(handle):
            username = normalize_username(company.get("instagram"))
            if username in targets:
                exact[username].append(company)

    matched = 0
    enriched: list[dict[str, str]] = []
    for row in rows:
        companies = exact.get(row["username_normalized"], [])
        if companies:
            matched += 1
        practice_name = row["practice_name"]
        if not practice_name:
            candidate = exact_consensus(company.get("company_name", "") for company in companies)
            placeholder = f"ig @{row['username_normalized']}"
            practice_name = "" if candidate.casefold() == placeholder.casefold() else clean(candidate, 160)
        website = exact_consensus(
            clean_website(company.get("website", "")) for company in companies
        )
        enriched.append(
            {
                **row,
                "practice_name": practice_name,
                "website": clean(website, 500),
            }
        )
    return enriched, matched


def rpc_replace(
    rows: list[dict[str, str]], release_id: str, source_pointer: str
) -> int:
    load_env()
    supabase_url = (os.environ.get("SUPABASE_URL") or DEFAULT_SUPABASE_URL).rstrip("/")
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_SERVICE_KEY")
        or ""
    ).strip()
    if not key:
        raise RuntimeError("Supabase service role is unavailable")
    payload = json.dumps(
        {
            "p_source_release_id": release_id,
            "p_source_pointer": source_pointer,
            "p_rows": rows,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{supabase_url}/rest/v1/rpc/replace_caesthetic_instagram_lookup_projection",
        data=payload,
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        error.read()
        raise RuntimeError(f"projection RPC failed with HTTP {error.code}") from error
    count = json.loads(body)
    if not isinstance(count, int):
        raise RuntimeError("projection RPC returned an invalid count")
    return count


def post_lookup(url: str, username: str, token: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps({"instagram_username": username}).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Lookup-Token": token,
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"lookup smoke returned HTTP {response.status}")
        payload = json.loads(response.read().decode("utf-8"))
    expected_keys = {"status", "practice_name", "city_state", "website"}
    if set(payload) != expected_keys:
        raise RuntimeError("lookup smoke response keys do not match the ManyChat contract")
    return payload


def smoke_live(url: str, rows: list[dict[str, str]]) -> dict[str, str]:
    if not rows:
        raise RuntimeError("cannot run matched smoke against an empty projection")
    load_env()
    token = (os.environ.get("CAESTHETIC_IG_LOOKUP_TOKEN") or "").strip()
    if not token:
        raise RuntimeError("CAESTHETIC_IG_LOOKUP_TOKEN is unavailable for live smoke")
    expected = rows[0]
    matched: dict[str, Any] | None = None
    last_error: Exception | None = None
    for _ in range(20):
        try:
            candidate = post_lookup(url, expected["username_normalized"], token)
            if candidate.get("status") == "matched":
                matched = candidate
                break
        except (RuntimeError, urllib.error.URLError, json.JSONDecodeError) as error:
            last_error = error
        time.sleep(3)
    if matched is None:
        raise RuntimeError("live matched smoke did not become ready") from last_error
    if matched != {
        "status": "matched",
        "practice_name": expected["practice_name"],
        "city_state": expected["city_state"],
        "website": expected["website"],
    }:
        raise RuntimeError("live matched response differs from the exact projected row")
    not_found = post_lookup(url, "__cae_lookup_smoke_not_found__", token)
    if not_found != {
        "status": "not_found",
        "practice_name": "",
        "city_state": "",
        "website": "",
    }:
        raise RuntimeError("live not_found response is not stable")
    return {"matched": "pass", "not_found": "pass"}


def build_projection(
    current: dict[str, Any], release_path: Path, master_path: Path
) -> tuple[list[dict[str, str]], dict[str, int]]:
    release_rows = load_release_rows(release_path, current.get("deny_usernames") or [])
    rows, master_matches = exact_master_enrichment(release_rows, master_path)
    stats = {
        "projection_rows": len(rows),
        "master_exact_matches": master_matches,
        "practice_name_present": sum(bool(row["practice_name"]) for row in rows),
        "city_state_present": sum(bool(row["city_state"]) for row in rows),
        "website_present": sum(bool(row["website"]) for row in rows),
    }
    return rows, stats


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--current-remote", default=DEFAULT_CURRENT_REMOTE)
    parser.add_argument("--master-file", type=Path, default=DEFAULT_MASTER)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--smoke-url", default="")
    args = parser.parse_args()

    if not args.master_file.is_file():
        raise SystemExit("canonical VDS master_companies.csv is unavailable")

    with tempfile.TemporaryDirectory(prefix="cae-ig-lookup-") as temp:
        current, release_path = resolve_current(Path(temp), args.current_remote)
        rows, stats = build_projection(current, release_path, args.master_file)
        if not rows:
            raise SystemExit("projection is empty; refusing to replace production data")
        release_id = clean(current.get("release_id"), 160)
        pointer = clean(current.get("canonical_master"), 600)
        synced_count = 0 if args.dry_run else rpc_replace(rows, release_id, pointer)
        if not args.dry_run and synced_count != len(rows):
            raise SystemExit("projection row count differs after atomic replacement")
        smoke = {}
        if args.smoke_url:
            if args.dry_run:
                raise SystemExit("--smoke-url cannot be combined with --dry-run")
            smoke = smoke_live(args.smoke_url, rows)

    print(
        json.dumps(
            {
                "ok": True,
                "release_id": release_id,
                **stats,
                "synced_rows": synced_count,
                "dry_run": args.dry_run,
                "smoke": smoke,
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
