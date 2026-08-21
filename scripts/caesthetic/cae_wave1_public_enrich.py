#!/usr/bin/env python3
"""Enrich a private CAESTHETIC activation pack from public first-party pages.

The tool never guesses email addresses. It records only addresses visibly
published on fetched pages and optional human-reviewed overrides with sources.
All row-level input/output stays outside Git.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import ssl
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

EMAIL_RE = re.compile(r"(?i)(?<![\w.+-])([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})(?![\w.-])")
BAD_EMAIL_PARTS = ("example.", "domain.", "sentry.", "wixpress.", "godaddy.", "@email.com")
LINK_HINTS = ("about", "team", "contact", "staff", "provider", "our-story")
OWNER_RE = re.compile(
    r"(?i:founder|owner|practice manager|medical director|chief executive officer|CEO)"
    r"[^A-Za-z]{0,18}([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){1,3})"
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href)

    def handle_data(self, data: str) -> None:
        value = " ".join(data.split())
        if value:
            self.text.append(value)


def fetch(url: str, timeout: int) -> tuple[str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 CAESTHETIC public-source research"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
        ctype = response.headers.get("content-type", "")
        if "text/html" not in ctype and "text/plain" not in ctype:
            return response.geturl(), ""
        return response.geturl(), response.read(2_000_000).decode("utf-8", "replace")


def allowed_email(value: str) -> bool:
    lower = value.lower().strip(".,;:()[]<>")
    return (
        not lower.startswith(("u0022", "test@", "user123@"))
        and not any(part in lower for part in BAD_EMAIL_PARTS)
        and not lower.endswith((".png", ".jpg"))
    )


def crawl(start: str, max_pages: int, timeout: int) -> dict[str, object]:
    if not start:
        return {"pages": [], "emails": [], "owner_candidates": [], "errors": ["no_public_url"]}
    if not urllib.parse.urlparse(start).scheme:
        start = "https://" + start
    queue = [start]
    seen: set[str] = set()
    pages: list[str] = []
    emails: dict[str, str] = {}
    owners: dict[str, str] = {}
    errors: list[str] = []
    base_host = urllib.parse.urlparse(start).netloc.lower().removeprefix("www.")
    while queue and len(pages) < max_pages:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            final, html = fetch(url, timeout)
        except Exception as exc:  # network evidence is best-effort and recorded
            errors.append(f"{url}: {type(exc).__name__}")
            continue
        pages.append(final)
        parser = PageParser()
        parser.feed(html)
        text = " ".join(parser.text)
        for email in EMAIL_RE.findall(html + " " + text):
            email = email.lower().strip(".,;:()[]<>")
            if allowed_email(email):
                emails.setdefault(email, final)
        for match in OWNER_RE.finditer(text):
            owners.setdefault(match.group(1).strip(), final)
        for href in parser.links:
            absolute = urllib.parse.urljoin(final, href)
            parsed = urllib.parse.urlparse(absolute)
            host = parsed.netloc.lower().removeprefix("www.")
            if host == base_host and any(h in parsed.path.lower() for h in LINK_HINTS):
                clean = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
                if clean not in seen and clean not in queue:
                    queue.append(clean)
    return {
        "pages": pages,
        "emails": [{"value": k, "source": v} for k, v in emails.items()],
        "owner_candidates": [{"value": k, "source": v} for k, v in owners.items()],
        "errors": errors,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--csv-output", type=Path)
    ap.add_argument("--overrides", type=Path)
    ap.add_argument("--max-pages", type=int, default=5)
    ap.add_argument("--timeout", type=int, default=12)
    ap.add_argument("--workers", type=int, default=10)
    args = ap.parse_args()
    overrides = json.loads(args.overrides.read_text()) if args.overrides and args.overrides.exists() else {}
    rows = list(csv.DictReader(args.input.open(encoding="utf-8-sig", newline="")))
    observed_at = datetime.now(timezone.utc).isoformat()
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        evidence_rows = list(pool.map(
            lambda row: crawl(row.get("external_url", "").strip(), args.max_pages, args.timeout),
            rows,
        ))
    results = []
    for row, evidence in zip(rows, evidence_rows):
        username = row.get("username", "").strip().lower().lstrip("@")
        override = overrides.get(username, {})
        owner = override.get("owner", "").strip()
        owner_source = override.get("owner_source", "").strip()
        owner_confidence = override.get("owner_confidence", "").strip()
        published = evidence["emails"]
        email = override.get("email", "").strip().lower()
        email_source = override.get("email_source", "").strip()
        if not email and published:
            email = published[0]["value"]
            email_source = published[0]["source"]
        results.append({
            **row,
            "confirmed_decision_maker": owner,
            "owner_source": owner_source,
            "owner_confidence": owner_confidence,
            "public_work_email": email,
            "email_source": email_source,
            "email_publicly_observed": bool(email and email_source),
            "email_verification_status": "unverified",
            "suppression_checked": "false",
            "enrichment_observed_at": observed_at,
            "crawl_evidence": evidence,
        })
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"schema": "caesthetic-wave1-public-enrichment/v1", "generated_at": observed_at, "rows": results}, indent=2) + "\n")
    if args.csv_output:
        args.csv_output.parent.mkdir(parents=True, exist_ok=True)
        flat_rows = []
        for item in results:
            flat = {key: value for key, value in item.items() if key != "crawl_evidence"}
            flat["decision_maker"] = item["confirmed_decision_maker"]
            flat["work_email"] = item["public_work_email"]
            flat["signal_class"] = item.get("opening_narrative", "")
            flat["signal_observed_at"] = item.get("observed_at", "")
            flat["dm_eligible"] = "false"
            flat_rows.append(flat)
        with args.csv_output.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(flat_rows[0]))
            writer.writeheader(); writer.writerows(flat_rows)
    print(json.dumps({
        "rows": len(results),
        "confirmed_decision_makers": sum(bool(r["confirmed_decision_maker"]) for r in results),
        "public_work_emails": sum(bool(r["public_work_email"]) for r in results),
        "verified_emails": 0,
    }))


if __name__ == "__main__":
    main()
