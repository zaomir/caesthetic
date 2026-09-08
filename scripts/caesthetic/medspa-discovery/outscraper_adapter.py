#!/usr/bin/env python3
"""Map Outscraper catalog rows to the CAESTHETIC lead schema.

Does not checkout, repurchase, or write raw emails to git-tracked files.
Paid recurring collection stays off until an explicit numeric budget is set.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

SCHEMA_PROVIDER = "outscraper"
OVERLAP_DAYS = 3
FREE_TIER_ROWS = 50
OBSERVED_PAID_USD_PER_ROW = 0.01


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _s(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _domain(url: str | None) -> str | None:
    raw = _s(url)
    if not raw:
        return None
    if "://" not in raw:
        raw = "https://" + raw
    host = urlparse(raw).hostname
    return host.lower() if host else None


def _email_hash(value: str | None) -> str | None:
    email = _s(value)
    if not email or "@" not in email:
        return None
    return hashlib.sha256(email.lower().encode()).hexdigest()


def quote_catalog(*, postal_codes: list[str], estimated_rows: int, budget_usd: float) -> dict:
    """Estimate cost before any paid checkout. Never starts a paid job."""
    billable = max(0, int(estimated_rows) - FREE_TIER_ROWS)
    quoted = round(billable * OBSERVED_PAID_USD_PER_ROW, 4)
    allowed = float(budget_usd or 0.0)
    return {
        "ok": True,
        "paid_ops": "blocked" if quoted > allowed else "quote_only",
        "would_checkout": False,
        "geography": "canonical_zip_tiles" if postal_codes else "unspecified",
        "postal_code_count": len(postal_codes),
        "overlapping_window_days": OVERLAP_DAYS,
        "estimated_rows": estimated_rows,
        "free_tier_rows": FREE_TIER_ROWS,
        "quoted_usd": quoted,
        "budget_usd": allowed,
        "stop_reason": None if quoted <= allowed else "quoted_price_exceeds_budget",
        "note": "City-name filters are not metro coverage. $0.13 covered completed NYC/LA checkouts only.",
    }


def map_row(row: dict, *, source_file: str, first_seen_at: str | None = None) -> dict:
    website = _s(row.get("site") or row.get("website") or row.get("website_url"))
    email = _s(row.get("email") or row.get("emails"))
    place_id = _s(row.get("place_id") or row.get("google_place_id"))
    name = _s(row.get("name") or row.get("title")) or "unknown"
    categories = []
    raw_cats = row.get("subtypes") or row.get("categories") or row.get("type")
    if isinstance(raw_cats, list):
        categories = [str(item).strip() for item in raw_cats if str(item).strip()]
    elif _s(raw_cats):
        categories = [part.strip() for part in str(raw_cats).split(",") if part.strip()]
    lead_id = place_id or _s(row.get("google_id")) or hashlib.sha256(name.encode()).hexdigest()[:16]
    seen = first_seen_at or now()
    return {
        "lead_id": lead_id,
        "status": "raw_imported",
        "identity": {
            "place_id": place_id,
            "cid": _s(row.get("cid")),
            "google_id": _s(row.get("google_id")),
            "os_id": _s(row.get("os_id") or row.get("id")),
            "google_maps_link": _s(row.get("google_maps_url") or row.get("link")),
        },
        "business": {
            "name": name,
            "category": categories[0] if categories else _s(row.get("type")),
            "categories": categories,
            "business_status": _s(row.get("business_status") or row.get("status")),
            "website": website,
            "domain": _domain(website),
            "phone": _s(row.get("phone") or row.get("phone_1")),
            "email": None,
            "verified": None,
        },
        "location": {
            "country_code": _s(row.get("country_code") or row.get("country")),
            "state": _s(row.get("state")),
            "city": _s(row.get("city")),
            "county": _s(row.get("us_county") or row.get("county")),
            "street": _s(row.get("street")),
            "postal_code": _s(row.get("postal_code") or row.get("zip")),
            "address": _s(row.get("full_address") or row.get("address")),
            "latitude": float(row["latitude"]) if _s(row.get("latitude")) else None,
            "longitude": float(row["longitude"]) if _s(row.get("longitude")) else None,
        },
        "contacts": [],
        "verification": {
            "classification": "age_unknown",
            "evidence_notes": [],
            "recommended_route": "record_only",
            "reviewed_by": None,
            "review_notes": None,
        },
        "source": {
            "provider": SCHEMA_PROVIDER,
            "source_file": source_file,
            "first_seen_at": seen,
            "last_seen_at": seen,
            "added_at": _s(row.get("added_at")),
            "updated_at": _s(row.get("updated_at")),
            "source_observations": [
                {
                    "email_present": bool(email),
                    "email_sha256": _email_hash(email),
                    "contact_scope": _s(row.get("contact_scope")) or "unresolved",
                }
            ],
        },
    }


def dedupe(leads: list[dict]) -> dict:
    by_place: dict[str, dict] = {}
    conflicts = []
    leftovers = []
    for lead in leads:
        place_id = (lead.get("identity") or {}).get("place_id")
        if not place_id:
            leftovers.append(lead)
            continue
        if place_id not in by_place:
            by_place[place_id] = lead
            continue
        existing = by_place[place_id]
        if existing.get("business", {}).get("name") != lead.get("business", {}).get("name"):
            conflicts.append({"place_id": place_id, "reason": "name_mismatch"})
        existing.setdefault("source", {}).setdefault("source_observations", []).extend(
            lead.get("source", {}).get("source_observations") or []
        )
    return {
        "unique_place_ids": len(by_place),
        "without_place_id": len(leftovers),
        "conflicts": conflicts,
        "leads": list(by_place.values()) + leftovers,
    }


def parse_csv_text(text: str, *, source_file: str) -> dict:
    reader = csv.DictReader(io.StringIO(text))
    leads = [map_row(row, source_file=source_file) for row in reader]
    return dedupe(leads)


def checkpoint_path(store: Path) -> Path:
    return store / "checkpoints.json"


def load_checkpoints(store: Path) -> dict:
    path = checkpoint_path(store)
    if not path.exists():
        return {"files": {}, "updated_at": None}
    return json.loads(path.read_text(encoding="utf-8"))


def remember_hash(store: Path, name: str, digest: str) -> bool:
    """Return True if this exact file was already ingested."""
    doc = load_checkpoints(store)
    files = doc.setdefault("files", {})
    known = files.get(name)
    if known and known.get("sha256") == digest:
        return True
    files[name] = {"sha256": digest, "seen_at": now()}
    doc["updated_at"] = now()
    store.mkdir(parents=True, exist_ok=True)
    path = checkpoint_path(store)
    path.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
    return False
