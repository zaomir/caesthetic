#!/usr/bin/env python3
"""Map Outscraper catalog rows to the CAESTHETIC lead schema.

Quote before every paid request. Recover unfinished jobs by provider ID.
Raw CSV/JSON stays under /var/lib/caesthetic-medspa/, never in git.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from budget import conservative_unit_usd, quote_rows

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


UA = "Mozilla/5.0 (compatible; GraineeAgent/1.0)"
API_ROOT = "https://api.outscraper.com"
JOBS_DIRNAME = "jobs"
RAW_DIRNAME = "raw"
FIXTURE_PLACE_IDS = frozenset({"chijtest"})
FIXTURE_NAMES = frozenset({"recovery spa"})
PROTECTED_LEAD_KEYS = frozenset(
    {
        "status",
        "stage",
        "blocker",
        "verification",
        "contacts",
        "outreach",
        "exclusions",
        "exclusion",
        "sent",
        "queue",
    }
)


def is_test_fixture_row(row: dict | None) -> bool:
    if not isinstance(row, dict):
        return False
    identity = row.get("identity") if isinstance(row.get("identity"), dict) else {}
    business = row.get("business") if isinstance(row.get("business"), dict) else {}
    source = row.get("source") if isinstance(row.get("source"), dict) else {}
    place = str(identity.get("place_id") or row.get("place_id") or row.get("lead_id") or "").strip().lower()
    name = str(business.get("name") or row.get("name") or "").strip().lower()
    source_file = str(source.get("source_file") or row.get("source_file") or "").strip().lower()
    if place.startswith("chijtest") or place in FIXTURE_PLACE_IDS:
        return True
    if "recovery-dummy" in source_file:
        return True
    if name in FIXTURE_NAMES:
        return True
    return False


def _api_key() -> str:
    return os.environ.get("OUTSCRAPER_API_KEY") or ""


def outscraper_request(method: str, path: str, body: dict | None = None, *, timeout: int = 45) -> tuple[int, dict | list | str]:
    key = _api_key()
    if not key:
        return 0, {"error": "OUTSCRAPER_API_KEY_absent_on_vds"}
    headers = {"X-API-KEY": key, "User-Agent": UA, "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(API_ROOT + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode(errors="replace")
            try:
                return resp.status, json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                return resp.status, raw
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode(errors="replace")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {"raw": raw[:300]}
        return exc.code, parsed
    except Exception as exc:
        return 0, {"error": exc.__class__.__name__}


def live_pricing() -> dict:
    """Read current provider terms. Refuse paid work if the upper bound is unknown."""
    code, payload = outscraper_request("GET", "/profile/balance")
    if code != 200 or not isinstance(payload, dict):
        return {
            "ok": False,
            "error": "provider_pricing_unavailable",
            "http": code,
            "stop_reason": "unknown_cost_upper_bound",
        }
    unit = None
    free_remaining = 0
    invoice = payload.get("upcoming_invoice") if isinstance(payload.get("upcoming_invoice"), dict) else {}
    for line in invoice.get("products_lines") or []:
        if not isinstance(line, dict):
            continue
        name = str(line.get("product_name") or "").lower()
        if "map" not in name and "business" not in name and "place" not in name:
            continue
        for sub in line.get("lines") or []:
            price = str((sub or {}).get("unit_price") or "")
            digits = "".join(ch for ch in price if ch.isdigit() or ch == ".")
            if digits:
                try:
                    unit = float(digits)
                except ValueError:
                    unit = unit
            if unit == 0:
                free_remaining = max(free_remaining, int((sub or {}).get("quantity") or 0))
    return {
        "ok": True,
        "http": code,
        "balance": payload.get("balance"),
        "account_status": payload.get("account_status"),
        "live_unit_usd": unit,
        "free_remaining": free_remaining if unit == 0 else 0,
        "unit_usd": conservative_unit_usd(unit if unit and unit > 0 else None),
        "source": "profile/balance+published_conservative",
    }


def catalog_filters(*, postal_codes: list[str], added_from: int, added_to: int) -> dict:
    return {
        "country_code": "US",
        "postal_codes": list(postal_codes),
        "types": ["medical spa"],
        "added_from": int(added_from),
        "added_to": int(added_to),
        "business_only": True,
    }


def quote_live(*, postal_codes: list[str], added_from: int, added_to: int, budget_usd: float, estimated_rows: int | None = None) -> dict:
    pricing = live_pricing()
    if not pricing.get("ok"):
        return {**pricing, "would_checkout": False}
    if estimated_rows is None:
        body = {
            "filters": catalog_filters(postal_codes=postal_codes, added_from=added_from, added_to=added_to),
            "limit": 1,
            "include_total": True,
            "fields": ["place_id", "name", "added_at"],
        }
        code, payload = outscraper_request("POST", "/businesses", body)
        if code not in {200, 202} or not isinstance(payload, dict):
            return {
                "ok": False,
                "would_checkout": False,
                "error": "count_quote_failed",
                "http": code,
                "stop_reason": "unknown_cost_upper_bound",
                "pricing": pricing,
            }
        estimated_rows = int(payload.get("total") or payload.get("count") or 0)
        if estimated_rows <= 0 and isinstance(payload.get("data"), list):
            estimated_rows = len(payload.get("data") or [])
        if estimated_rows <= 0:
            return {
                "ok": False,
                "would_checkout": False,
                "error": "estimated_rows_unknown",
                "http": code,
                "stop_reason": "unknown_cost_upper_bound",
                "pricing": pricing,
            }
    quote = quote_rows(
        int(estimated_rows),
        budget_usd,
        live_unit=pricing.get("live_unit_usd") if (pricing.get("live_unit_usd") or 0) > 0 else None,
        free_remaining=int(pricing.get("free_remaining") or 0),
    )
    quote["pricing"] = pricing
    quote["postal_code_count"] = len(postal_codes)
    quote["overlapping_window_days"] = OVERLAP_DAYS
    quote["paid_ops"] = "quote_only" if quote.get("ok") else "blocked"
    return quote


def jobs_dir(store: Path) -> Path:
    path = store / JOBS_DIRNAME
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_job(store: Path, job: dict) -> Path:
    path = jobs_dir(store) / f"{job['job_id']}.json"
    path.write_text(json.dumps(job, indent=2) + "\n", encoding="utf-8")
    return path


def load_job(store: Path, job_id: str) -> dict | None:
    path = jobs_dir(store) / f"{job_id}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def unfinished_jobs(store: Path) -> list[dict]:
    rows = []
    for path in jobs_dir(store).glob("*.json"):
        try:
            job = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if job.get("status") in {"pending", "unknown", "processing"}:
            rows.append(job)
    return rows


def flatten_businesses(payload) -> list[dict]:
    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict):
        rows = payload.get("data") or payload.get("results") or payload.get("items") or []
    else:
        return []
    if rows and isinstance(rows[0], list):
        flat = []
        for block in rows:
            if isinstance(block, list):
                flat.extend(item for item in block if isinstance(item, dict))
            elif isinstance(block, dict):
                flat.append(block)
        return flat
    return [item for item in rows if isinstance(item, dict)]


def start_or_recover_catalog(*, store: Path, filters: dict, limit: int, job_id: str | None = None) -> dict:
    if job_id:
        existing = load_job(store, job_id) or {"job_id": job_id, "status": "unknown"}
        code, payload = outscraper_request("GET", f"/requests/{job_id}")
        existing["last_poll_http"] = code
        if code == 200 and isinstance(payload, dict):
            existing["status"] = str(payload.get("status") or "unknown").lower()
            existing["payload_keys"] = sorted(payload.keys())
            if str(payload.get("status") or "").lower() in {"success", "ok"}:
                existing["rows"] = flatten_businesses(payload)
                existing["status"] = "success"
            elif str(payload.get("status") or "").lower() in {"failure", "failed"}:
                existing["status"] = "failure"
            else:
                existing["status"] = "pending"
        elif code in {0, 401, 402, 404, 422}:
            existing["status"] = "unknown"
            existing["error"] = payload if isinstance(payload, dict) else {"raw": str(payload)[:200]}
        save_job(store, existing)
        return existing
    body = {
        "filters": filters,
        "limit": max(1, min(int(limit), 1000)),
        "include_total": False,
        "fields": [
            "place_id",
            "name",
            "full_address",
            "city",
            "state",
            "postal_code",
            "site",
            "phone",
            "email",
            "type",
            "subtypes",
            "google_id",
            "cid",
            "os_id",
            "instagram",
            "facebook",
            "linkedin",
            "added_at",
            "updated_at",
            "business_status",
            "latitude",
            "longitude",
        ],
    }
    code, payload = outscraper_request("POST", "/businesses", body)
    job = {
        "job_id": None,
        "status": "unknown",
        "http": code,
        "started_at": now(),
        "filters": {"postal_codes": filters.get("postal_codes"), "added_from": filters.get("added_from"), "added_to": filters.get("added_to")},
        "limit": body["limit"],
    }
    if code in {200, 202} and isinstance(payload, dict) and payload.get("id"):
        job["job_id"] = str(payload.get("id"))
        job["status"] = str(payload.get("status") or "pending").lower()
        if job["status"] in {"success", "ok"}:
            job["rows"] = flatten_businesses(payload)
            job["status"] = "success"
        else:
            job["status"] = "pending"
        save_job(store, job)
        return job
    if code == 200 and isinstance(payload, (dict, list)):
        rows = flatten_businesses(payload)
        job["job_id"] = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()[:16]
        job["status"] = "success"
        job["rows"] = rows
        job["sync"] = True
        save_job(store, job)
        return job
    job["error"] = payload if isinstance(payload, dict) else {"raw": str(payload)[:200]}
    job["status"] = "failure"
    return job


def wait_for_job(store: Path, job_id: str, *, timeout_s: int = 180, delay_s: float = 4.0) -> dict:
    last = load_job(store, job_id) or {"job_id": job_id, "status": "unknown"}
    if not _api_key():
        last["status"] = "unknown"
        last["error"] = {"error": "OUTSCRAPER_API_KEY_absent_on_vds"}
        save_job(store, last)
        return last
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        last = start_or_recover_catalog(store=store, filters={}, limit=1, job_id=job_id)
        if last.get("status") in {"success", "failure"}:
            return last
        time.sleep(delay_s)
        delay_s = min(delay_s * 1.5, 20)
    last["status"] = last.get("status") or "unknown"
    last["timeout"] = True
    save_job(store, last)
    return last


def save_raw(store: Path, *, run_id: str, market_id: str, rows: list[dict], extra: dict) -> dict:
    folder = store / RAW_DIRNAME / run_id
    folder.mkdir(parents=True, exist_ok=True)
    blob = json.dumps({"rows": rows, "meta": extra}, ensure_ascii=False).encode()
    digest = hashlib.sha256(blob).hexdigest()
    json_path = folder / f"{market_id}.json"
    json_path.write_bytes(blob)
    csv_path = folder / f"{market_id}.csv"
    fieldnames = sorted({key for row in rows if isinstance(row, dict) for key in row.keys()})
    with csv_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames or ["place_id", "name"])
        writer.writeheader()
        for row in rows:
            if isinstance(row, dict):
                writer.writerow({key: row.get(key) for key in writer.fieldnames})
    return {
        "json_path": str(json_path),
        "csv_path": str(csv_path),
        "sha256": digest,
        "bytes": len(blob),
        "rows": len(rows),
    }


def merge_lead(existing: dict | None, incoming: dict) -> dict:
    if not existing:
        incoming.setdefault("discovery", {})
        incoming["discovery"]["first_seen_by_process"] = True
        incoming["discovery"]["added_to_catalog"] = True
        incoming["discovery"]["confirmed_opening"] = False
        incoming["verification"] = incoming.get("verification") or {}
        incoming["verification"]["classification"] = "age_unknown"
        return incoming
    merged = dict(existing)
    for key in PROTECTED_LEAD_KEYS:
        if key in existing:
            merged[key] = existing[key]
    incoming_source = incoming.get("source") if isinstance(incoming.get("source"), dict) else {}
    existing_source = merged.get("source") if isinstance(merged.get("source"), dict) else {}
    existing_source["last_seen_at"] = incoming_source.get("last_seen_at") or now()
    if incoming_source.get("added_at"):
        existing_source["added_at"] = existing_source.get("added_at") or incoming_source.get("added_at")
    observations = list(existing_source.get("source_observations") or [])
    observations.extend(incoming_source.get("source_observations") or [])
    existing_source["source_observations"] = observations
    merged["source"] = existing_source
    business = merged.get("business") if isinstance(merged.get("business"), dict) else {}
    incoming_business = incoming.get("business") if isinstance(incoming.get("business"), dict) else {}
    for key in ("website", "domain", "phone"):
        if not business.get(key) and incoming_business.get(key):
            business[key] = incoming_business[key]
    merged["business"] = business
    discovery = merged.get("discovery") if isinstance(merged.get("discovery"), dict) else {}
    discovery["first_seen_by_process"] = bool(discovery.get("first_seen_by_process"))
    discovery["added_to_catalog"] = True
    discovery["confirmed_opening"] = bool(discovery.get("confirmed_opening"))
    merged["discovery"] = discovery
    return merged


def ingest_rows(store: Path, rows: list[dict], *, source_file: str, first_seen_at: str | None = None) -> dict:
    registry_path = store / "registry.json"
    if registry_path.exists():
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    else:
        registry = {"locations": [], "updated_at": None}
    existing_rows = [row for row in (registry.get("locations") or []) if isinstance(row, dict)]
    by_place = {}
    leftovers = []
    for row in existing_rows:
        if is_test_fixture_row(row):
            continue
        place = ((row.get("identity") or {}).get("place_id") or "").strip()
        if place:
            by_place[place] = row
        else:
            leftovers.append(row)
    parsed = []
    excluded = 0
    for raw in rows:
        lead = map_row(raw, source_file=source_file, first_seen_at=first_seen_at)
        if is_test_fixture_row(lead):
            excluded += 1
            continue
        parsed.append(lead)
    added = 0
    updated = 0
    for lead in parsed:
        place = ((lead.get("identity") or {}).get("place_id") or "").strip()
        if not place:
            leftovers.append(lead)
            added += 1
            continue
        if place in by_place:
            by_place[place] = merge_lead(by_place[place], lead)
            updated += 1
        else:
            by_place[place] = merge_lead(None, lead)
            added += 1
    registry["locations"] = list(by_place.values()) + leftovers
    registry["updated_at"] = now()
    registry_path.write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")
    return {
        "added": added,
        "updated": updated,
        "excluded_fixtures": excluded,
        "unique_place_ids": len(by_place),
        "total": len(registry["locations"]),
    }
