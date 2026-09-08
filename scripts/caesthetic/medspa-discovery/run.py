#!/usr/bin/env python3
"""Typed CAESTHETIC medspa discovery/outreach control. No raw emails in stdout or git public files."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from inbox_transfer import needs_transfer, stage_inbox
from outscraper_adapter import parse_csv_text, quote_catalog, remember_hash
from outreach import (
    assert_public_payload,
    discover_channels,
    forbidden_keys,
    prepare_outreach,
    redact_text,
    send_from_queue,
)

REPO = Path(os.environ.get("CAESTHETIC_MEDSPA_REPO", "/var/www/grainee-v2"))
PRIVATE = Path(os.environ.get("CAESTHETIC_MEDSPA_STORE", "/var/lib/caesthetic-medspa"))
PUBLIC_INDEX = Path(
    os.environ.get(
        "CAESTHETIC_MEDSPA_PUBLIC_INDEX",
        str(REPO / "docs/ops/caesthetic-new-medspa-discovery/public-index.json"),
    )
)
CID = "7a7421b3-4d7a-4756-a60a-c19c10b0ad8c"
UA = "Mozilla/5.0 (compatible; GraineeAgent/1.0)"
PAID_HASHES = {
    "medical_spa_new_york_US_2026_Sep_08-7.csv": "0f6f68bd86d814354679d45b0737715cea5c967d9f784a4c0d9bfe6235979e71",
    "medical_spa_los_angeles_US_2026_Sep_08-2.csv": "498a1f07dadca32923e7ec14e55ad0f3c055c91959726f30a2a1c35d7f259e6c",
}
OPERATION_ALIASES = {
    "healthcheck": "health",
    "ingest_csv": "ingest_inbox",
    "stage_inbox": "ingest_inbox",
}
ALLOWED_OPS = {
    "status",
    "instantly_status",
    "instantly_control",
    "dry_run",
    "ingest_inbox",
    "quote_discovery",
    "logs",
    "health",
    "healthcheck",
    "ingest_csv",
    "stage_inbox",
    "discover_channels",
    "prepare_outreach",
    "send_canary",
    "send_batch",
}
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_secrets() -> None:
    for path in (
        Path("/etc/evo/secrets.env"),
        Path("/root/.cursor/secrets.env"),
        Path.home() / ".cursor/secrets.env",
        Path.home() / ".cursor_env",
    ):
        try:
            if not path.is_file():
                continue
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except PermissionError:
            continue
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            if line.startswith("export "):
                line = line[7:]
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip("'").strip('"')
            if key and key not in os.environ:
                os.environ[key] = value


def redact(text: str) -> str:
    return EMAIL_RE.sub("[email]", text or "")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_store() -> None:
    for sub in ("inbox", "locks", "ingested", "enrichment", "queues", "canary", "audit"):
        (PRIVATE / sub).mkdir(parents=True, exist_ok=True)
    for name, default in (
        ("registry.json", {"locations": [], "updated_at": None}),
        ("queue.json", {"items": [], "updated_at": None}),
        ("status.json", {"created_at": now()}),
    ):
        path = PRIVATE / name
        if not path.exists():
            path.write_text(json.dumps(default, indent=2) + "\n", encoding="utf-8")
    journal = PRIVATE / "journal.jsonl"
    if not journal.exists():
        journal.write_text("", encoding="utf-8")


def lock(name: str):
    ensure_store()
    lock_path = PRIVATE / "locks" / f"{name}.lock"
    fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR, 0o666)
    try:
        import fcntl

        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError as exc:
        os.close(fd)
        raise SystemExit(json.dumps({"ok": False, "error": f"locked:{name}"})) from exc
    return fd


def journal(event: str, payload: dict) -> None:
    ensure_store()
    row = {"at": now(), "event": event, **payload}
    with (PRIVATE / "journal.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def instantly(method: str, path: str, body: dict | None = None):
    load_secrets()
    key = os.environ.get("INSTANTLY_API_KEY", "")
    if not key:
        return 0, {"error": "INSTANTLY_API_KEY_absent"}
    headers = {"Authorization": f"Bearer {key}", "User-Agent": UA, "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request("https://api.instantly.ai" + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return resp.status, json.loads(resp.read().decode() or "null")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode(errors="replace")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {"raw": raw[:200]}
        return exc.code, parsed


def op_health() -> dict:
    load_secrets()
    instantly_present = bool(os.environ.get("INSTANTLY_API_KEY"))
    outscraper_present = bool(os.environ.get("OUTSCRAPER_API_KEY"))
    instantly_auth = False
    if instantly_present:
        code, _ = instantly("GET", "/api/v2/campaigns?limit=1")
        instantly_auth = code == 200
    outscraper_auth = False
    if outscraper_present:
        req = urllib.request.Request(
            "https://api.outscraper.com/profile",
            headers={"X-API-KEY": os.environ["OUTSCRAPER_API_KEY"], "User-Agent": UA, "Accept": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                outscraper_auth = resp.status == 200
        except Exception:
            outscraper_auth = False
    return {
        "ok": True,
        "host": subprocess.check_output(["hostname"], text=True).strip(),
        "instantly": {"present": instantly_present, "authorized": instantly_auth},
        "outscraper": {"present": outscraper_present, "authorized": outscraper_auth, "paid_ops": "blocked_until_budget"},
        "private_store": str(PRIVATE),
        "public_index": str(PUBLIC_INDEX.relative_to(REPO)) if PUBLIC_INDEX.is_relative_to(REPO) else str(PUBLIC_INDEX),
        "codex_path": "Agent API type=caesthetic_medspa; SSH vds2402 is optional and often unreachable from Codex cloud",
    }


def op_instantly_status() -> dict:
    code, camp = instantly("GET", f"/api/v2/campaigns/{CID}")
    a_code, analytics = instantly("GET", f"/api/v2/campaigns/analytics?ids={CID}")
    s_code, sending = instantly("GET", f"/api/v2/campaigns/{CID}/sending-status")
    e_code, emails = instantly("GET", f"/api/v2/emails?campaign_id={CID}&limit=50")
    an = analytics[0] if isinstance(analytics, list) and analytics else {}
    items = (emails or {}).get("items") if isinstance(emails, dict) else []
    http = {"campaign": code, "analytics": a_code, "sending": s_code, "emails": e_code}
    quality = "ok" if all(int(v or 0) == 200 for v in http.values()) else "uncertain"
    rendered = []
    for item in items or []:
        body = item.get("body")
        if isinstance(body, dict):
            text = " ".join(str(body.get(k) or "") for k in ("text", "html", "body", "content"))
        else:
            text = body or ""
        text = text if isinstance(text, str) else ""
        rendered.append(
            {
                "subject": item.get("subject"),
                "has_raw_var": bool(re.search(r"\{\{[^}]+\}\}", f"{item.get('subject') or ''}\n{text}")),
                "has_footer": "600 W 7th" in text and "unsubscribe" in text.lower(),
                "has_disclosure": "Commercial outreach from CAESTHETIC" in text,
                "timestamp": item.get("timestamp_email") or item.get("timestamp_created"),
                "step": item.get("step"),
            }
        )
    listed = len(items or [])
    analytics_sent = an.get("emails_sent_count")
    return {
        "ok": code == 200,
        "quality": quality,
        "http": http,
        "campaign_id": CID,
        "name": camp.get("name") if isinstance(camp, dict) else None,
        "status": camp.get("status") if isinstance(camp, dict) else None,
        "settings": {
            "disable_bounce_protect": camp.get("disable_bounce_protect") if isinstance(camp, dict) else None,
            "insert_unsubscribe_header": camp.get("insert_unsubscribe_header") if isinstance(camp, dict) else None,
            "stop_for_company": camp.get("stop_for_company") if isinstance(camp, dict) else None,
            "stop_on_reply": camp.get("stop_on_reply") if isinstance(camp, dict) else None,
            "stop_on_auto_reply": camp.get("stop_on_auto_reply") if isinstance(camp, dict) else None,
            "daily_limit": camp.get("daily_limit") if isinstance(camp, dict) else None,
            "daily_max_leads": camp.get("daily_max_leads") if isinstance(camp, dict) else None,
        },
        "counts": {
            "leads": an.get("leads_count"),
            "imported": an.get("leads_count"),
            "queued_or_remaining": None if not an else max(0, int(an.get("leads_count") or 0) - int(an.get("contacted_count") or 0)),
            "contacted": an.get("contacted_count"),
            "sent": analytics_sent,
            "emails_listed": listed,
            "bounced": an.get("bounced_count"),
            "replied": an.get("reply_count"),
            "unsubscribed": an.get("unsubscribed_count"),
        },
        "count_source": {
            "analytics_sent": analytics_sent,
            "emails_listed": listed,
            "note": "analytics can lag the email list; report both; activation/queued is not sent",
        },
        "sending": (sending or {}).get("summary") if isinstance(sending, dict) else None,
        "rendered_qa": rendered,
        "note": "activation/queued is not sent; do not treat listed emails and analytics as one number",
    }


def op_instantly_control() -> dict:
    status = op_instantly_status()
    counts = status.get("counts") or {}
    sent = int(counts.get("sent") or 0)
    bounced = int(counts.get("bounced") or 0)
    bounce_rate = (bounced / sent) if sent else 0.0
    raw = any(row.get("has_raw_var") for row in status.get("rendered_qa") or [])
    reasons = []
    if sent and bounce_rate > 0.03:
        reasons.append("bounce_rate_gt_3pct")
    if raw:
        reasons.append("raw_variable_in_sent_message")
    paused = False
    if reasons and status.get("status") == 1:
        p_code, _ = instantly("POST", f"/api/v2/campaigns/{CID}/pause")
        paused = p_code == 200
        journal("instantly_pause", {"reasons": reasons, "paused": paused})
    return {"ok": True, "paused": paused, "reasons": reasons, "status": status}


def seed_public_index() -> dict:
    locations = [
        {"name": "Restored by Jenny", "cohort": "us_source_canary", "stage": "email_canary", "blocker": None, "place_id": None},
        {"name": "Oceans Weight Loss & Med Spa", "cohort": "us_source_canary", "stage": "email_canary", "blocker": None, "place_id": None},
        {"name": "Serenity Medical & Spa Naples", "cohort": "us_source_canary", "stage": "email_canary", "blocker": "naples_vs_miami_entity_unresolved", "place_id": None},
        {"name": "Bodenvy CoolSculpting, Weight Loss & Body Sculpting Raleigh", "cohort": "us_source_canary", "stage": "email_canary", "blocker": "franchise_vs_local_operator", "place_id": None},
        {"name": "Bruce Wellness and Aesthetics", "cohort": "us_source_canary", "stage": "email_canary", "blocker": None, "place_id": None},
        {"name": "Drip Refresh Mobile IV Therapy - Greenville", "cohort": "us_source_canary", "stage": "email_canary", "blocker": "marketing_agency_domain", "place_id": None},
        {"name": "DeeTox", "cohort": "us_source", "stage": "excluded", "blocker": "two_source_emails_unresolved", "place_id": None},
        {"name": "SYR Men's Med Spa Studio", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "paid_csv_not_on_vds", "place_id": None, "note": "official site Coming Soon NYC branch"},
        {"name": "FiDi Aesthetics and Plastics", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "paid_csv_not_on_vds", "place_id": None},
        {"name": "THE HUE WELLNESS", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "north_york_canada_name_collision", "place_id": None},
        {"name": "Glowelle", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "paid_csv_not_on_vds", "place_id": None},
        {"name": "Newyork Medical Spa", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "same_building_duplicate_review", "place_id": None},
        {"name": "NY Aesthetics & Wellness", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "jeniva_144_w37_is_wrong_match", "place_id": None, "address_note": "65 W36th Suite1103"},
        {"name": "JLoo Beauty Experts Admin", "cohort": "nyc_city_filter", "stage": "ingest_pending", "blocker": "admin_duplicate_review", "place_id": None},
        {"name": "Berk Beauty", "cohort": "la_city_filter", "stage": "ingest_pending", "blocker": "paid_csv_not_on_vds", "place_id": None},
        {"name": "Peptides supplies", "cohort": "la_city_filter", "stage": "ingest_pending", "blocker": "confirm_target_clinic", "place_id": None},
        {"name": "Jubilee LA", "cohort": "public_supplement", "stage": "not_exported_row", "blocker": "soft_vs_grand_opening_dates_unresolved", "place_id": None},
        {"name": "Bel Ange Manhattan", "cohort": "public_supplement", "stage": "not_exported_row", "blocker": "event_date_unproven", "place_id": None},
        {"name": "NakedMD NYC", "cohort": "public_supplement", "stage": "not_exported_row", "blocker": "network_vs_local_authority", "place_id": None},
    ]
    counts = {
        "locations": len(locations),
        "canary": sum(1 for row in locations if row["cohort"] == "us_source_canary"),
        "excluded": sum(1 for row in locations if row["stage"] == "excluded"),
        "nyc_city_filter": sum(1 for row in locations if row["cohort"] == "nyc_city_filter"),
        "la_city_filter": sum(1 for row in locations if row["cohort"] == "la_city_filter"),
        "public_supplement_not_export": sum(1 for row in locations if row["cohort"] == "public_supplement"),
    }
    doc = {
        "updated_at": now(),
        "no_raw_emails": True,
        "master_lookup": "not_required_by_policy",
        "paid_csv_on_vds": False,
        "counts": counts,
        "known_controls": {
            "us_florida_unique_maps_locations_reported": 46,
            "nyc_csv_rows": 7,
            "la_csv_rows": 2,
            "nyc_la_unique_place_ids_reported": 9,
            "nyc_la_source_emails_reported": 3,
        },
        "locations": locations,
    }
    PUBLIC_INDEX.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_INDEX.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return doc


def op_status() -> dict:
    ensure_store()
    health = op_health()
    instantly = op_instantly_status()
    public = seed_public_index()
    inbox = list((PRIVATE / "inbox").glob("*"))
    ingested = list((PRIVATE / "ingested").glob("*"))
    cron_canary = Path("/etc/cron.d/caesthetic-instantly-canary").exists()
    cron_poller = Path("/etc/cron.d/caesthetic-medspa-discovery").exists()
    return {
        "ok": True,
        "health": health,
        "instantly": instantly,
        "public_index_counts": public.get("counts"),
        "inbox_files": [p.name for p in inbox],
        "ingested_files": [p.name for p in ingested],
        "schedules": {
            "canary_cron": cron_canary,
            "discovery_poller_cron": cron_poller,
            "paid_recurring_discovery": False,
            "paid_budget_usd": 0.0,
        },
        "missing": [
            *([] if health["outscraper"]["present"] else ["OUTSCRAPER_API_KEY_on_vds"]),
            *([] if inbox or ingested else ["paid_nyc_la_csv_on_vds"]),
            *([] if inbox or ingested else ["chatgpt_enriched_artifacts_on_vds"]),
        ],
    }


def op_dry_run() -> dict:
    public = seed_public_index()
    expected = {
        "canary_ready": 6,
        "excluded_conflicts": 1,
        "nyc_catalog_names": 7,
        "la_catalog_names": 2,
        "public_supplements_not_export": 3,
    }
    return {
        "ok": True,
        "dry_run": True,
        "expected": expected,
        "public_counts": public.get("counts"),
        "repurchase": False,
        "reimport": False,
        "send": False,
    }


def op_ingest_inbox(params: dict | None = None) -> dict:
    ensure_store()
    params = params if isinstance(params, dict) else {}
    transfer = None
    if needs_transfer(params):
        transfer = stage_inbox(params, PRIVATE / "inbox", allowed_hashes=PAID_HASHES)
        if not transfer.get("ok"):
            return {
                "ok": False,
                "accepted": [],
                "rejected": transfer.get("rejected") or [],
                "transfer": {key: value for key, value in transfer.items() if key != "content"},
                "error": transfer.get("error") or "inbox_transfer_failed",
                "note": transfer.get("note")
                or "Private transfer rejected. Use github_release, github_gist, or dropbox. Do not put CSV bytes in git.",
            }
    accepted = []
    rejected = []
    for path in sorted((PRIVATE / "inbox").glob("*")):
        if not path.is_file():
            continue
        digest = sha256_file(path)
        expected = PAID_HASHES.get(path.name)
        if expected and digest != expected:
            rejected.append({"file": path.name, "reason": "hash_mismatch"})
            continue
        dest = PRIVATE / "ingested" / path.name
        already = remember_hash(PRIVATE, path.name, digest)
        dest.write_bytes(path.read_bytes())
        normalized = None
        if path.suffix.lower() == ".csv":
            parsed = parse_csv_text(path.read_text(encoding="utf-8", errors="replace"), source_file=path.name)
            registry = json.loads((PRIVATE / "registry.json").read_text(encoding="utf-8"))
            existing = {((row.get("identity") or {}).get("place_id") or row.get("lead_id")): row for row in registry.get("locations") or []}
            for lead in parsed.get("leads") or []:
                key = (lead.get("identity") or {}).get("place_id") or lead.get("lead_id")
                existing[key] = lead
            registry["locations"] = list(existing.values())
            registry["updated_at"] = now()
            (PRIVATE / "registry.json").write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")
            normalized = {
                "unique_place_ids": parsed.get("unique_place_ids"),
                "without_place_id": parsed.get("without_place_id"),
                "conflicts": parsed.get("conflicts"),
            }
        accepted.append(
            {
                "file": path.name,
                "sha256": digest,
                "bytes": path.stat().st_size,
                "hash_matched": bool(expected),
                "already_ingested": already,
                "normalized": normalized,
            }
        )
        journal("ingest", {"file": path.name, "sha256": digest, "already": already})
    return {
        "ok": True,
        "accepted": accepted,
        "rejected": rejected,
        "transfer": transfer,
        "expected_missing": [name for name in PAID_HASHES if not (PRIVATE / "inbox" / name).exists() and not (PRIVATE / "ingested" / name).exists()],
        "note": "No repurchase. Stage via github_release / github_gist / dropbox, then ingest. Registry stays private; public index has no emails.",
    }


def op_quote_discovery() -> dict:
    load_secrets()
    cities = json.loads((REPO / "icp-collector/config/cities.json").read_text(encoding="utf-8"))
    zips = []
    for city in cities.get("cities") or []:
        for tile in city.get("tiles") or []:
            zips.append(str(tile).split()[0])
    quote = quote_catalog(postal_codes=zips, estimated_rows=50, budget_usd=0.0)
    if not os.environ.get("OUTSCRAPER_API_KEY"):
        return {
            "ok": False,
            "error": "OUTSCRAPER_API_KEY_absent_on_vds",
            "paid_ops": "blocked",
            "quote": quote,
            "next_action": "Install the existing Outscraper key into /etc/evo/secrets.env from the same store used by check-reviews. Do not paste the key into chat.",
        }
    return {
        "ok": True,
        "authorized": True,
        "paid_ops": "blocked_until_explicit_budget",
        "quote": quote,
        "completed_purchase_budget_usd": 0.13,
        "recurring_budget_usd": 0.0,
        "note": "The $0.13 approval covered completed NYC/LA checkouts only. Do not treat it as a standing budget.",
    }


def op_logs() -> dict:
    ensure_store()
    lines = []
    journal_path = PRIVATE / "journal.jsonl"
    if journal_path.exists():
        for line in journal_path.read_text(encoding="utf-8").splitlines()[-50:]:
            lines.append(json.loads(redact(line)))
    cron_log = Path("/var/log/grainee/instantly-canary-day1.log")
    tail = []
    if cron_log.exists():
        tail = [redact(line) for line in cron_log.read_text(encoding="utf-8", errors="replace").splitlines()[-20:]]
    return {"ok": True, "journal_tail": lines, "canary_cron_tail": tail}


def resolve_operation(operation: str) -> str:
    return OPERATION_ALIASES.get(operation, operation)


def worker_info() -> dict:
    host = subprocess.check_output(["hostname", "-s"], text=True).strip() or "unknown"
    return {"host": host, "canonical_host": "vps2402"}


def op_discover_channels(params: dict) -> dict:
    ensure_store()
    return discover_channels(PRIVATE, PUBLIC_INDEX, params)


def op_prepare_outreach(params: dict) -> dict:
    ensure_store()
    return prepare_outreach(PRIVATE, PUBLIC_INDEX, params)


def op_send_canary(params: dict, request_id: str | None = None) -> dict:
    ensure_store()
    return send_from_queue(
        store=PRIVATE,
        repo=REPO,
        params=params,
        instantly_fn=instantly,
        instantly_status=op_instantly_status(),
        campaign_id=CID,
        mode="canary",
        request_id=request_id,
    )


def op_send_batch(params: dict, request_id: str | None = None) -> dict:
    ensure_store()
    return send_from_queue(
        store=PRIVATE,
        repo=REPO,
        params=params,
        instantly_fn=instantly,
        instantly_status=op_instantly_status(),
        campaign_id=CID,
        mode="batch",
        request_id=request_id,
    )


def dispatch(operation: str, params: dict | None = None, request: dict | None = None) -> dict:
    params = params if isinstance(params, dict) else {}
    request = request if isinstance(request, dict) else {}
    blocked = forbidden_keys(request) or forbidden_keys({"params": params})
    if blocked:
        return {
            "ok": False,
            "status": "error",
            "error": f"forbidden_keys:{','.join(blocked)}",
            "allowed": sorted(ALLOWED_OPS),
        }
    if operation not in ALLOWED_OPS:
        return {"ok": False, "error": f"unsupported_operation:{operation}", "allowed": sorted(ALLOWED_OPS)}
    canonical = resolve_operation(operation)
    fd = lock(canonical)
    try:
        request_id = request.get("request_id")
        if canonical == "discover_channels":
            result = op_discover_channels(params)
        elif canonical == "prepare_outreach":
            result = op_prepare_outreach(params)
        elif canonical == "send_canary":
            result = op_send_canary(params, request_id)
        elif canonical == "send_batch":
            result = op_send_batch(params, request_id)
        elif canonical == "ingest_inbox":
            result = op_ingest_inbox(params)
        else:
            result = {
                "health": op_health,
                "status": op_status,
                "instantly_status": op_instantly_status,
                "instantly_control": op_instantly_control,
                "dry_run": op_dry_run,
                "quote_discovery": op_quote_discovery,
                "logs": op_logs,
            }[canonical]()
        result["operation"] = canonical
        result["alias"] = operation if operation != canonical else None
        result["generated_at"] = now()
        return result
    finally:
        os.close(fd)


def bridge_status(result: dict) -> str:
    if result.get("status") in {"success", "error", "dry_run_ok", "blocked"}:
        return str(result["status"])
    if result.get("blocked"):
        return "blocked"
    if result.get("dry_run") and result.get("ok"):
        return "dry_run_ok"
    return "success" if result.get("ok") else "error"


def handle_bridge(request: dict, output: Path) -> dict:
    operation = str(request.get("operation") or request.get("action") or "status")
    params = request.get("params") if isinstance(request.get("params"), dict) else {}
    result = dispatch(operation, params, request)
    status = bridge_status(result)
    warnings = []
    for item in result.get("missing") or []:
        warnings.append(str(item))
    if result.get("dry_run"):
        warnings.append("dry_run: no provider send")
    data = {key: value for key, value in result.items() if key not in {"email", "emails"}}
    bridge = {
        "request_id": request.get("request_id"),
        "type": "caesthetic_medspa",
        "operation": result.get("operation") or resolve_operation(operation),
        "status": status,
        "generated_at": now(),
        "ok": bool(result.get("ok")) and status in {"success", "dry_run_ok"},
        "worker": worker_info(),
        "data": data,
        "warnings": warnings,
        "errors": [] if result.get("ok") or status == "blocked" else [{"code": "operation_failed", "message": result.get("error")}],
        "providers_used": ["instantly_api_v2"] if "instantly" in operation or resolve_operation(operation) in {"status", "health", "send_canary", "send_batch"} else [],
    }
    if status == "blocked" and result.get("error"):
        bridge["errors"] = [{"code": "blocked", "message": result.get("error")}]
        bridge["ok"] = False
    try:
        bridge = assert_public_payload(bridge)
    except ValueError:
        bridge = {
            **bridge,
            "data": {"redacted": True},
            "status": "error",
            "ok": False,
            "errors": [{"code": "secret_leak", "message": "result_redacted"}],
        }
    blob = redact_text(json.dumps(bridge, ensure_ascii=False))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(json.loads(blob), indent=2) + "\n", encoding="utf-8")
    return json.loads(blob)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", nargs="?", default="status")
    parser.add_argument("--request-file")
    parser.add_argument("--output")
    args = parser.parse_args()
    if args.request_file:
        req = json.loads(Path(args.request_file).read_text(encoding="utf-8"))
        out = Path(args.output or (REPO / "docs/agent-api/results" / f"{req.get('request_id') or 'medspa'}.json"))
        print(json.dumps(handle_bridge(req, out), indent=2))
        return 0
    print(json.dumps(dispatch(args.operation), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
