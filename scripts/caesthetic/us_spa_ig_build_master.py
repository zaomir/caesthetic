#!/usr/bin/env python3
"""Build the private CAESTHETIC US spa Instagram canonical master.

Private row-level outputs stay outside git. Git-safe docs may use only the
aggregate manifest written by ``--manifest-json``.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


PROJECT = "caesthetic"
COUNTRY = "US"
SURFACE = "B_CAE_IG"
MOTION = "motion_d"
AUDIENCE = "caesthetic_us_aesthetic_business"
DM_ELIGIBLE = "false"

READY_SEGMENT = "medspa_owner_practice"
READY_NARRATIVE = "GROWTH_SCORE"

BUCKETS = {
    "medspa_aesthetic_practice",
    "generic_beauty_spa",
    "individual_practitioner",
    "chain",
    "academy_student",
    "uncertain",
}

REQUIRED_TAGS = (
    "project",
    "country",
    "surface",
    "motion",
    "audience",
    "source",
    "market",
    "dm_eligible",
)

USERNAME_RE = re.compile(r"^[a-z0-9_](?:[a-z0-9._]{0,28}[a-z0-9_])?$")
INSTAGRAM_URL_RE = re.compile(
    r"(?:https?://)?(?:www\.)?instagram\.com/([a-zA-Z0-9._]{1,30})(?:[/?#].*)?$",
    re.IGNORECASE,
)
AT_HANDLE_RE = re.compile(r"@([a-zA-Z0-9._]{1,30})")
RESERVED_IG_PATHS = {
    "about",
    "accounts",
    "api",
    "developer",
    "directory",
    "explore",
    "graphql",
    "legal",
    "oauth",
    "p",
    "privacy",
    "reel",
    "reels",
    "stories",
    "terms",
}

USERNAME_KEYS = {
    "username",
    "user_name",
    "handle",
    "ig",
    "ig_handle",
    "ig_username",
    "instagram",
    "instagram_handle",
    "instagram_username",
    "instagram_user",
    "profile",
    "profile_url",
    "url",
    "social_url",
    "instagram_url",
    "instagram_profile",
}

CITY_KEYS = ("city", "market_city", "locality", "town")
STATE_KEYS = ("state", "market_state", "region", "province", "state_code")
COUNTRY_KEYS = ("country", "country_code", "market_country")
NAME_KEYS = (
    "business_name",
    "company",
    "company_name",
    "name",
    "display_name",
    "full_name",
    "title",
)
CATEGORY_KEYS = ("category", "categories", "business_category", "type")
BIO_KEYS = ("bio", "biography", "description", "about", "snippet", "caption")

STATE_NAME_TO_CODE = {
    "alabama": "AL",
    "alaska": "AK",
    "arizona": "AZ",
    "arkansas": "AR",
    "california": "CA",
    "colorado": "CO",
    "connecticut": "CT",
    "delaware": "DE",
    "florida": "FL",
    "georgia": "GA",
    "hawaii": "HI",
    "idaho": "ID",
    "illinois": "IL",
    "indiana": "IN",
    "iowa": "IA",
    "kansas": "KS",
    "kentucky": "KY",
    "louisiana": "LA",
    "maine": "ME",
    "maryland": "MD",
    "massachusetts": "MA",
    "michigan": "MI",
    "minnesota": "MN",
    "mississippi": "MS",
    "missouri": "MO",
    "montana": "MT",
    "nebraska": "NE",
    "nevada": "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    "ohio": "OH",
    "oklahoma": "OK",
    "oregon": "OR",
    "pennsylvania": "PA",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    "tennessee": "TN",
    "texas": "TX",
    "utah": "UT",
    "vermont": "VT",
    "virginia": "VA",
    "washington": "WA",
    "west virginia": "WV",
    "wisconsin": "WI",
    "wyoming": "WY",
    "district of columbia": "DC",
}
STATE_CODES = set(STATE_NAME_TO_CODE.values())

ACADEMY_TERMS = (
    "academy",
    "aesthetic school",
    "beauty school",
    "cosmetology school",
    "course",
    "courses",
    "educator",
    "institute",
    "school",
    "student",
    "students",
    "trainee",
    "training",
    "certification",
)
CHAIN_TERMS = (
    "chain",
    "franchise",
    "franchising",
    "locations nationwide",
    "multiple locations",
    "national locations",
    "nationwide",
    "our locations",
)
KNOWN_CHAIN_NAMES = (
    "aestheticare",
    "american laser med spa",
    "bodybar",
    "dermatology partners",
    "european wax center",
    "ever/body",
    "ideal image",
    "laseraway",
    "milan laser",
    "ovme",
    "remedy place",
    "sev laser",
    "skin laundry",
    "skinspirit",
    "sono bello",
)
MEDSPA_TERMS = (
    "aesthetic clinic",
    "aesthetic medicine",
    "aesthetic practice",
    "aesthetic studio",
    "aesthetics clinic",
    "anti-aging",
    "body contouring",
    "botox",
    "cosmetic dermatology",
    "dermal filler",
    "fillers",
    "injectable",
    "injectables",
    "injector practice",
    "laser hair removal",
    "laser treatment",
    "medical aesthetics",
    "medical spa",
    "med spa",
    "med-spa",
    "medspa",
    "tox",
    "wellness and aesthetics",
)
INJECTOR_TERMS = (
    "aesthetic injector",
    "cosmetic injector",
    "injector",
    "nurse injector",
)
PRACTICE_TERMS = (
    "clinic",
    "collective",
    "group",
    "medical",
    "practice",
    "spa",
    "studio",
    "wellness",
)
INDIVIDUAL_TERMS = (
    "aesthetician",
    "esthetician",
    "licensed esthetician",
    "master esthetician",
    "nurse injector",
    "pa-c",
    "physician assistant",
    "rn",
    "np",
    "aprn",
)
GENERIC_BEAUTY_TERMS = (
    "barber",
    "beauty",
    "brow",
    "brows",
    "day spa",
    "facial",
    "facials",
    "hair",
    "lash",
    "lashes",
    "makeup",
    "massage",
    "nail",
    "nails",
    "salon",
    "skincare",
    "waxing",
)
NON_US_COUNTRY_TERMS = (
    "australia",
    "canada",
    "france",
    "germany",
    "india",
    "mexico",
    "russia",
    "spain",
    "uk",
    "united arab emirates",
    "united kingdom",
)


def norm_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")


def clean(value: object) -> str:
    return str(value or "").strip()


def first_value(row: dict[str, str], keys: Iterable[str]) -> str:
    for key in keys:
        value = clean(row.get(key))
        if value:
            return value
    return ""


def normalise_state(value: str) -> str:
    raw = clean(value)
    if not raw:
        return ""
    upper = raw.upper()
    if upper in STATE_CODES:
        return upper
    return STATE_NAME_TO_CODE.get(raw.lower(), raw)


def normalise_username(candidate: str) -> str:
    value = clean(candidate)
    if not value:
        return ""
    value = value.strip().strip('"').strip("'")
    value = value.splitlines()[0].strip()
    value = value.rstrip("/").split("?")[0].split("#")[0].strip()
    if "instagram.com/" in value.lower():
        match = INSTAGRAM_URL_RE.search(value)
        if not match:
            return ""
        value = match.group(1)
    elif value.startswith("@"):
        value = value[1:]
    else:
        at_match = AT_HANDLE_RE.search(value)
        if at_match and not USERNAME_RE.match(value.lower()):
            value = at_match.group(1)
    username = value.lower().strip().strip("@")
    if username in RESERVED_IG_PATHS:
        return ""
    if not USERNAME_RE.match(username):
        return ""
    if ".." in username:
        return ""
    return username


def username_candidates(row: dict[str, str]) -> list[str]:
    values: list[str] = []
    for key, value in row.items():
        key_norm = norm_key(key)
        text = clean(value)
        if not text:
            continue
        if key_norm in USERNAME_KEYS or "instagram" in key_norm or key_norm.endswith("_url"):
            values.append(text)
        elif "instagram.com/" in text.lower():
            values.append(text)
    return values


def row_username(row: dict[str, str]) -> tuple[str, bool]:
    had_candidate = False
    for candidate in username_candidates(row):
        had_candidate = True
        username = normalise_username(candidate)
        if username:
            return username, had_candidate
    return "", had_candidate


def lower_blob(row: dict[str, str]) -> str:
    fields = list(NAME_KEYS) + list(CATEGORY_KEYS) + list(BIO_KEYS)
    values = [first_value(row, fields)]
    values.extend(clean(v) for v in row.values())
    return " ".join(v.lower() for v in values if v)


def has_any(blob: str, terms: Iterable[str]) -> bool:
    return any(term in blob for term in terms)


def classify(row: dict[str, str], source_id: str) -> tuple[str, str, str]:
    blob = lower_blob(row)
    if has_any(blob, ACADEMY_TERMS):
        return "academy_student", "student_or_academy_signal", "high"
    if has_any(blob, CHAIN_TERMS) or has_any(blob, KNOWN_CHAIN_NAMES):
        return "chain", "chain_or_multi_location_signal", "high"

    medspa_signal = has_any(blob, MEDSPA_TERMS)
    injector_signal = has_any(blob, INJECTOR_TERMS)
    practice_signal = has_any(blob, PRACTICE_TERMS)
    individual_signal = has_any(blob, INDIVIDUAL_TERMS)
    generic_signal = has_any(blob, GENERIC_BEAUTY_TERMS)

    if medspa_signal or (injector_signal and practice_signal):
        return "medspa_aesthetic_practice", "medspa_or_injector_practice_signal", "high"
    if source_id == "task814_9_city" and not generic_signal and not individual_signal:
        return "medspa_aesthetic_practice", "task814_prefiltered_medspa_icp_proxy", "medium"
    if individual_signal or (injector_signal and not practice_signal):
        return "individual_practitioner", "individual_professional_signal", "medium"
    if generic_signal:
        return "generic_beauty_spa", "generic_beauty_spa_signal", "medium"
    return "uncertain", "insufficient_practice_signal", "low"


def infer_geo(row: dict[str, str], source_id: str) -> tuple[str, str, str, bool, str]:
    city = first_value(row, CITY_KEYS)
    state = normalise_state(first_value(row, STATE_KEYS))
    country_raw = first_value(row, COUNTRY_KEYS)
    country_l = country_raw.lower()
    blob = lower_blob(row)

    country_is_us = False
    reason = ""
    if country_l in {"us", "usa", "u.s.", "u.s.a.", "united states", "united states of america"}:
        country_is_us = True
        reason = "explicit_us_country"
    elif state in STATE_CODES:
        country_is_us = True
        reason = "us_state"
    elif country_l and (country_l in NON_US_COUNTRY_TERMS or country_l not in {"us", "usa"}):
        country_is_us = False
        reason = "explicit_non_us_country"
    elif has_any(blob, NON_US_COUNTRY_TERMS):
        country_is_us = False
        reason = "non_us_text_signal"
    elif "us" in source_id.lower() or source_id == "task814_9_city":
        country_is_us = True
        reason = "us_source_context"

    if city and state:
        market = f"{city}, {state}"
    elif state:
        market = state
    elif city:
        market = city
    else:
        market = "US-unknown" if country_is_us else "unknown"
    return city, state, market, country_is_us, reason


def route(bucket: str, market: str, country_is_us: bool) -> tuple[str, str, str, str, str]:
    if not country_is_us:
        return "", "", "none", "suppressed", "non_us_or_unknown_country"
    if bucket in {"academy_student", "chain"}:
        return "", "", "none", "suppressed", bucket
    if bucket == "medspa_aesthetic_practice" and market not in {"US-unknown", "unknown"}:
        return READY_SEGMENT, READY_NARRATIVE, "warm", "ready_for_warm", ""
    if bucket == "medspa_aesthetic_practice":
        return "", "", "research", "needs_qualification", "missing_city_state_market"
    return "", "", "research", "needs_qualification", ""


def source_priority(source_id: str) -> int:
    if source_id == "lane_a_extract":
        return 30
    if source_id == "task814_9_city":
        return 20
    return 10


def row_score(row: dict[str, str]) -> tuple[int, int, int]:
    status_score = {
        "ready_for_warm": 4,
        "needs_qualification": 2,
        "suppressed": 1,
    }.get(row.get("status", ""), 0)
    market_score = 1 if row.get("market") not in {"", "unknown", "US-unknown"} else 0
    return status_score, market_score, source_priority(row.get("source", ""))


@dataclass
class SourceStats:
    source_id: str
    path: str
    rows: int = 0
    rows_with_instagram_url: int = 0
    valid_instagram_usernames: int = 0
    invalid_instagram_rows: int = 0


@dataclass
class BuildState:
    records: dict[str, dict[str, str]] = field(default_factory=dict)
    raw_duplicate_occurrences: int = 0
    stats: dict[str, SourceStats] = field(default_factory=dict)


def read_csv_rows(path: Path) -> Iterable[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        dialect = csv.Sniffer().sniff(sample) if sample.strip() else csv.excel
        reader = csv.DictReader(handle, dialect=dialect)
        for raw in reader:
            row = {norm_key(k or ""): clean(v) for k, v in raw.items() if k}
            yield row


def build_record(row: dict[str, str], username: str, source_id: str) -> dict[str, str]:
    city, state, market, country_is_us, geo_reason = infer_geo(row, source_id)
    bucket, class_reason, confidence = classify(row, source_id)
    segment, narrative, action_queue, status, suppression_reason = route(
        bucket, market, country_is_us
    )
    business_name = first_value(row, NAME_KEYS)
    category = first_value(row, CATEGORY_KEYS)
    profile_url = f"https://www.instagram.com/{username}/"
    return {
        "username": username,
        "profile_url": profile_url,
        "classification_bucket": bucket,
        "segment": segment,
        "narrative": narrative,
        "action_queue": action_queue,
        "status": status,
        "project": PROJECT,
        "country": COUNTRY,
        "surface": SURFACE,
        "motion": MOTION,
        "audience": AUDIENCE,
        "source": source_id,
        "market": market,
        "dm_eligible": DM_ELIGIBLE,
        "source_ids": source_id,
        "source_row_count": "1",
        "markets": market,
        "city": city,
        "state": state,
        "business_name": business_name,
        "category": category,
        "classification_confidence": confidence,
        "classification_reason": class_reason,
        "geo_reason": geo_reason,
        "suppression_reason": suppression_reason,
        "notes": "",
    }


def merge_record(existing: dict[str, str], candidate: dict[str, str]) -> dict[str, str]:
    merged = dict(existing)
    winner = candidate if row_score(candidate) > row_score(existing) else existing
    loser = existing if winner is candidate else candidate

    for key, value in winner.items():
        merged[key] = value
    for field_name in ("source_ids", "markets"):
        values = []
        for part in (existing.get(field_name, ""), candidate.get(field_name, "")):
            values.extend(x.strip() for x in part.split("|") if x.strip())
        merged[field_name] = "|".join(sorted(set(values)))

    merged["source_row_count"] = str(
        int(existing.get("source_row_count") or "1")
        + int(candidate.get("source_row_count") or "1")
    )
    for key in ("business_name", "category", "city", "state"):
        if not merged.get(key) and loser.get(key):
            merged[key] = loser[key]
    return merged


def ingest_source(state: BuildState, source_id: str, path: Path) -> None:
    stats = SourceStats(source_id=source_id, path=str(path))
    state.stats[source_id] = stats
    if not path.exists():
        raise FileNotFoundError(f"source not found: {source_id}={path}")

    for row in read_csv_rows(path):
        stats.rows += 1
        username, had_candidate = row_username(row)
        if had_candidate:
            stats.rows_with_instagram_url += 1
        if not username:
            if had_candidate:
                stats.invalid_instagram_rows += 1
            continue
        stats.valid_instagram_usernames += 1
        candidate = build_record(row, username, source_id)
        if username in state.records:
            state.raw_duplicate_occurrences += 1
            state.records[username] = merge_record(state.records[username], candidate)
        else:
            state.records[username] = candidate


def audit_for(rows: list[dict[str, str]], state: BuildState) -> dict[str, object]:
    username_counts = Counter(r["username"] for r in rows)
    duplicate_usernames = sum(1 for _, count in username_counts.items() if count > 1)
    untagged = sum(
        1
        for row in rows
        if any(not clean(row.get(tag)) for tag in REQUIRED_TAGS)
        or row.get("classification_bucket") not in BUCKETS
        or row.get("action_queue") not in {"warm", "research", "none"}
        or row.get("status") not in {"ready_for_warm", "needs_qualification", "suppressed"}
    )

    def counter_for(key: str) -> dict[str, int]:
        return dict(sorted(Counter(clean(r.get(key)) or "unknown" for r in rows).items()))

    source_breakdown: dict[str, dict[str, int]] = {}
    for row in rows:
        source = row.get("source") or "unknown"
        source_breakdown.setdefault(
            source,
            {
                "unique_usernames": 0,
                "medspa_ready_for_warm": 0,
                "needs_qualification": 0,
                "suppressed": 0,
            },
        )
        source_breakdown[source]["unique_usernames"] += 1
        if row["status"] == "ready_for_warm":
            source_breakdown[source]["medspa_ready_for_warm"] += 1
        elif row["status"] == "needs_qualification":
            source_breakdown[source]["needs_qualification"] += 1
        elif row["status"] == "suppressed":
            source_breakdown[source]["suppressed"] += 1

    audit = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "project": PROJECT,
        "surface": SURFACE,
        "sources_found": sorted(state.stats),
        "source_stats": {
            source_id: {
                "path": stats.path,
                "raw_business_rows": stats.rows,
                "rows_with_instagram_url": stats.rows_with_instagram_url,
                "valid_instagram_usernames": stats.valid_instagram_usernames,
                "invalid_instagram_rows": stats.invalid_instagram_rows,
            }
            for source_id, stats in sorted(state.stats.items())
        },
        "raw_business_rows": sum(s.rows for s in state.stats.values()),
        "rows_with_instagram_url": sum(s.rows_with_instagram_url for s in state.stats.values()),
        "valid_instagram_usernames": sum(s.valid_instagram_usernames for s in state.stats.values()),
        "raw_duplicate_occurrences": state.raw_duplicate_occurrences,
        "unique_usernames": len(rows),
        "medspa_ready_for_warm": sum(1 for r in rows if r["status"] == "ready_for_warm"),
        "needs_qualification": sum(1 for r in rows if r["status"] == "needs_qualification"),
        "suppressed": sum(1 for r in rows if r["status"] == "suppressed"),
        "untagged": untagged,
        "duplicate_usernames": duplicate_usernames,
        "breakdown": {
            "by_state": counter_for("state"),
            "by_city": counter_for("city"),
            "by_source": source_breakdown,
            "by_classification_bucket": counter_for("classification_bucket"),
            "by_status": counter_for("status"),
        },
        "assertions": {
            "untagged_eq_0": untagged == 0,
            "duplicate_usernames_eq_0": duplicate_usernames == 0,
        },
    }
    return audit


def manifest_for(audit: dict[str, object], output_csv: Path, audit_json: Path) -> dict[str, object]:
    return {
        "task": "caesthetic-us-spa-ig-master-2026-08-lane-b",
        "status": "DONE"
        if audit["untagged"] == 0 and audit["duplicate_usernames"] == 0
        else "FAILED_ASSERT",
        "generated_at": audit["generated_at"],
        "private_outputs": {
            "canonical_master_csv": "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv",
            "lane_b_audit_json": "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/lane_b_audit.json",
        },
        "local_output_paths": {
            "canonical_master_csv": str(output_csv),
            "lane_b_audit_json": str(audit_json),
        },
        "counts": {
            "sources_found": audit["sources_found"],
            "raw_business_rows": audit["raw_business_rows"],
            "rows_with_instagram_url": audit["rows_with_instagram_url"],
            "valid_instagram_usernames": audit["valid_instagram_usernames"],
            "unique_usernames": audit["unique_usernames"],
            "medspa_ready_for_warm": audit["medspa_ready_for_warm"],
            "needs_qualification": audit["needs_qualification"],
            "suppressed": audit["suppressed"],
            "untagged": audit["untagged"],
            "duplicate_usernames": audit["duplicate_usernames"],
        },
        "breakdown": audit["breakdown"],
        "assertions": audit["assertions"],
        "git_safe": "Aggregate counts only; no row-level usernames in git.",
    }


def combined_manifest(existing: dict[str, object], lane_b: dict[str, object]) -> dict[str, object]:
    """Preserve Lane A aggregate manifest and add Lane B classification results."""
    lane_a: dict[str, object] | None = None
    if existing.get("task") == "caesthetic-us-spa-ig-master-2026-08-lane-a":
        lane_a = existing
    elif isinstance(existing.get("lane_a_extract"), dict):
        lane_a = existing["lane_a_extract"]  # type: ignore[assignment]

    status = lane_b.get("status", "DONE")
    if lane_a and lane_a.get("status") not in {None, "DONE"}:
        status = lane_a.get("status")

    private_outputs = {
        "base": "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/",
        "canonical_master_csv": lane_b["private_outputs"]["canonical_master_csv"],  # type: ignore[index]
        "lane_b_audit_json": lane_b["private_outputs"]["lane_b_audit_json"],  # type: ignore[index]
    }
    if lane_a and isinstance(lane_a.get("private_outputs"), dict):
        private_outputs.update(lane_a["private_outputs"])  # type: ignore[arg-type]
        private_outputs["canonical_master_csv"] = lane_b["private_outputs"]["canonical_master_csv"]  # type: ignore[index]
        private_outputs["lane_b_audit_json"] = lane_b["private_outputs"]["lane_b_audit_json"]  # type: ignore[index]

    git_outputs = {
        "classify_markdown": "docs/research/caesthetic-us-spa-ig-master-2026-08/CLASSIFY.md",
        "manifest_json": "docs/research/caesthetic-us-spa-ig-master-2026-08/manifest.json",
        "master_builder_script": "scripts/caesthetic/us_spa_ig_build_master.py",
    }
    if lane_a and isinstance(lane_a.get("git_outputs"), dict):
        git_outputs.update(lane_a["git_outputs"])  # type: ignore[arg-type]
        git_outputs["classify_markdown"] = "docs/research/caesthetic-us-spa-ig-master-2026-08/CLASSIFY.md"
        git_outputs["master_builder_script"] = "scripts/caesthetic/us_spa_ig_build_master.py"

    manifest = {
        "task": "caesthetic-us-spa-ig-master-2026-08",
        "status": status,
        "branch": "cursor/caesthetic-us-spa-ig-master-1757",
        "generated_at": lane_b["generated_at"],
        "privacy": "git-safe aggregates only; no raw usernames, profile URLs, emails, phone numbers or row-level contact data committed",
        "private_outputs": private_outputs,
        "git_outputs": git_outputs,
        "lane_b_master": lane_b,
    }
    if lane_a:
        manifest["lane_a_extract"] = lane_a
    return manifest


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "username",
        "profile_url",
        "classification_bucket",
        "segment",
        "narrative",
        "action_queue",
        "status",
        "project",
        "country",
        "surface",
        "motion",
        "audience",
        "source",
        "market",
        "dm_eligible",
        "source_ids",
        "source_row_count",
        "markets",
        "city",
        "state",
        "business_name",
        "category",
        "classification_confidence",
        "classification_reason",
        "geo_reason",
        "suppression_reason",
        "notes",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def parse_source(value: str) -> tuple[str, Path]:
    if "=" not in value:
        raise argparse.ArgumentTypeError("sources must be source_id=/path/to/file.csv")
    source_id, raw_path = value.split("=", 1)
    source_id = norm_key(source_id)
    if not source_id:
        raise argparse.ArgumentTypeError("source_id is empty")
    return source_id, Path(raw_path)


def sort_rows(rows: Iterable[dict[str, str]]) -> list[dict[str, str]]:
    status_order = {"ready_for_warm": 0, "needs_qualification": 1, "suppressed": 2}
    return sorted(
        rows,
        key=lambda r: (
            status_order.get(r.get("status", ""), 9),
            r.get("state", ""),
            r.get("city", ""),
            r.get("username", ""),
        ),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Normalize, dedupe, classify, tag, and audit CAESTHETIC US spa IG rows."
    )
    parser.add_argument("--lane-a-csv", type=Path, help="Lane A extracted_ig_rows.csv")
    parser.add_argument("--task814-csv", type=Path, help="TASK-814 master_usernames.csv")
    parser.add_argument(
        "--source",
        action="append",
        type=parse_source,
        default=[],
        help="Additional source_id=/path/to/file.csv input. Repeatable.",
    )
    parser.add_argument("--output-csv", type=Path, required=True)
    parser.add_argument("--audit-json", type=Path, required=True)
    parser.add_argument("--manifest-json", type=Path)
    parser.add_argument("--print-summary", action="store_true")
    args = parser.parse_args(argv)

    sources: list[tuple[str, Path]] = []
    if args.lane_a_csv:
        sources.append(("lane_a_extract", args.lane_a_csv))
    if args.task814_csv:
        sources.append(("task814_9_city", args.task814_csv))
    sources.extend(args.source)
    if not sources:
        parser.error("at least one source is required")

    state = BuildState()
    for source_id, path in sources:
        ingest_source(state, source_id, path)

    rows = sort_rows(state.records.values())
    if not rows:
        raise SystemExit("no valid Instagram usernames found")

    audit = audit_for(rows, state)
    write_csv(args.output_csv, rows)
    write_json(args.audit_json, audit)
    lane_b_manifest = manifest_for(audit, args.output_csv, args.audit_json)
    if args.manifest_json:
        existing_manifest: dict[str, object] = {}
        if args.manifest_json.exists():
            try:
                existing_manifest = json.loads(args.manifest_json.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                existing_manifest = {}
        write_json(args.manifest_json, combined_manifest(existing_manifest, lane_b_manifest))

    if args.print_summary:
        print(json.dumps(lane_b_manifest["counts"], indent=2))

    if audit["untagged"] != 0 or audit["duplicate_usernames"] != 0:
        print(
            f"ASSERT FAIL: untagged={audit['untagged']} "
            f"duplicate_usernames={audit['duplicate_usernames']}",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
