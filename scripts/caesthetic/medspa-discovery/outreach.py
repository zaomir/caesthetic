"""Allowlisted CAESTHETIC medspa outreach helpers. No arbitrary shell. No secrets in public JSON."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path

FORBIDDEN_CLAIM_RE = re.compile(
    r"\b(rank(?:ing)?|#1|patients?|revenue|roi|guaranteed?)\b",
    re.I,
)
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
SECRET_RE = re.compile(
    r"(sk-[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]+|gho_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|"
    r"apify_api_[A-Za-z0-9]+|AIza[0-9A-Za-z_-]{20,}|Bearer\s+[A-Za-z0-9._-]{12,})",
    re.I,
)
FORBIDDEN_KEYS = frozenset({"command", "shell", "exec", "bash", "ssh", "script"})
ALLOWED_CHANNELS = ("email", "linkedin", "instagram", "facebook")
CANARY_HARD_MAX = 5
CANARY_DEFAULT_LIMIT = 3
SOCIAL_NO_COLD = frozenset({"instagram", "facebook"})
MARKET_MARKERS = {
    "FL": ("fl", "florida", "naples", "miami", "orlando", "tampa"),
    "NYC": ("nyc", "new york", "manhattan", "brooklyn", "queens"),
    "LA": ("la", "los angeles", "hollywood", "santa monica"),
}
MESSAGE_PROFILES = {
    "growth_score_v6": {
        "email_subject": "quick question",
        "email_body": (
            "Hi,\n\nWould you like a Free Growth Score for {practice}?\n\n"
            "Valerie Petra\nCAESTHETIC"
        ),
        "linkedin": "Would a Free Growth Score help your practice?",
        "instagram": "Would a Free Growth Score help here?",
        "facebook": "Would a Free Growth Score help this location?",
        "next_step": "Free Growth Score -> 30-Day Sprint",
    }
}
SEND_ATTEMPTS: list[dict] = []
FIXTURE_PLACE_IDS = frozenset({"chijtest"})
FIXTURE_NAMES = frozenset({"recovery spa"})
FIXTURE_SOURCE_FILES = frozenset({"recovery-dummy.csv"})


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def forbidden_keys(payload: dict | None) -> list[str]:
    found: list[str] = []
    if not isinstance(payload, dict):
        return found
    for key in payload:
        if str(key).lower() in FORBIDDEN_KEYS:
            found.append(str(key))
    params = payload.get("params") if isinstance(payload.get("params"), dict) else {}
    for key in params:
        if str(key).lower() in FORBIDDEN_KEYS:
            found.append(f"params.{key}")
    return sorted(set(found))


def redact_text(text: str) -> str:
    cleaned = EMAIL_RE.sub("[email]", text or "")
    return SECRET_RE.sub("[redacted]", cleaned)


def assert_public_payload(payload: dict) -> dict:
    blob = json.dumps(payload, ensure_ascii=False)
    if SECRET_RE.search(blob):
        raise ValueError("secret_leak")
    if EMAIL_RE.search(blob):
        payload = json.loads(EMAIL_RE.sub("[email]", blob))
    return payload


def mask_sample(text: str) -> str:
    return redact_text(text)


def sha_contact(value: str) -> str:
    return hashlib.sha256(value.lower().encode()).hexdigest()[:16]


def normalize_channels(raw) -> list[str]:
    if not raw:
        return ["email"]
    if isinstance(raw, str):
        raw = [part.strip() for part in raw.split(",")]
    out = []
    for item in raw:
        name = str(item or "").strip().lower()
        if name in ALLOWED_CHANNELS and name not in out:
            out.append(name)
    return out or ["email"]


def market_of(row: dict) -> str | None:
    blob = " ".join(
        str(row.get(key) or "")
        for key in ("market", "cohort", "city", "state", "name", "address", "note")
    ).lower()
    loc = row.get("location") if isinstance(row.get("location"), dict) else {}
    blob += " " + " ".join(str(loc.get(key) or "") for key in ("state", "city", "address"))
    for market, markers in MARKET_MARKERS.items():
        if any(marker in blob for marker in markers):
            return market
    cohort = str(row.get("cohort") or "").lower()
    if "nyc" in cohort:
        return "NYC"
    if "la" in cohort:
        return "LA"
    if "florida" in cohort or "canary" in cohort:
        return "FL"
    return None


def in_markets(row: dict, markets: list[str] | None) -> bool:
    if not markets:
        return True
    wanted = {str(item).upper() for item in markets}
    found = market_of(row)
    return found in wanted if found else False


def channel_flags(row: dict) -> dict[str, bool]:
    contacts = row.get("channels") if isinstance(row.get("channels"), dict) else {}
    business = row.get("business") if isinstance(row.get("business"), dict) else {}
    source = row.get("source") if isinstance(row.get("source"), dict) else {}
    observations = source.get("source_observations") or []
    email_present = bool(contacts.get("email") or row.get("email_present"))
    if not email_present:
        email_present = any(bool(item.get("email_present") or item.get("email_sha256")) for item in observations if isinstance(item, dict))
    return {
        "email": email_present,
        "website": bool(contacts.get("website") or business.get("website") or row.get("website")),
        "instagram": bool(contacts.get("instagram") or row.get("instagram")),
        "facebook": bool(contacts.get("facebook") or row.get("facebook")),
        "linkedin": bool(contacts.get("linkedin") or row.get("linkedin")),
        "phone": bool(contacts.get("phone") or business.get("phone") or row.get("phone")),
    }


def read_csv_rows(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for raw in reader:
        name = (raw.get("name") or raw.get("title") or "unknown").strip()
        email = (raw.get("email") or raw.get("emails") or "").strip()
        rows.append(
            {
                "name": name,
                "lead_id": (raw.get("place_id") or raw.get("google_place_id") or sha_contact(name)),
                "place_id": (raw.get("place_id") or raw.get("google_place_id") or None),
                "website": raw.get("site") or raw.get("website") or raw.get("website_url"),
                "phone": raw.get("phone") or raw.get("phone_1"),
                "instagram": raw.get("instagram") or raw.get("instagram_url"),
                "facebook": raw.get("facebook") or raw.get("facebook_url"),
                "linkedin": raw.get("linkedin") or raw.get("linkedin_url"),
                "city": raw.get("city"),
                "state": raw.get("state"),
                "address": raw.get("full_address") or raw.get("address"),
                "email_present": bool(email and "@" in email),
                "email": email if email and "@" in email else None,
                "source_file": path.name,
            }
        )
    return rows


def load_stop_flags(store: Path) -> dict:
    path = store / "stop_flags.json"
    if not path.exists():
        return {"active": False, "flags": []}
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"active": False, "flags": ["stop_flags_unreadable"]}
    flags = [str(item) for item in (doc.get("flags") or []) if item]
    active = bool(doc.get("active") or flags)
    return {"active": active, "flags": flags}


def load_sent_ledger(store: Path) -> dict:
    path = store / "sent_ledger.json"
    if not path.exists():
        return {"items": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"items": {}}


def save_sent_ledger(store: Path, ledger: dict) -> None:
    ledger["updated_at"] = now()
    (store / "sent_ledger.json").write_text(json.dumps(ledger, indent=2) + "\n", encoding="utf-8")


def ledger_key(contact_id: str, channel: str, campaign_id: str) -> str:
    return f"{contact_id}:{channel}:{campaign_id}"


def load_records(store: Path, public_index: Path) -> list[dict]:
    records: dict[str, dict] = {}
    registry = store / "registry.json"
    if registry.exists():
        try:
            doc = json.loads(registry.read_text(encoding="utf-8"))
        except Exception:
            doc = {}
        for lead in doc.get("locations") or []:
            name = ((lead.get("business") or {}).get("name") or lead.get("name") or "unknown")
            key = (lead.get("lead_id") or ((lead.get("identity") or {}).get("place_id")) or sha_contact(name))
            merged = dict(lead)
            merged["name"] = name
            merged["lead_id"] = key
            records[key] = merged
    for folder in ("ingested", "inbox"):
        root = store / folder
        if not root.exists():
            continue
        for path in sorted(root.glob("*.csv")):
            for row in read_csv_rows(path):
                key = row["lead_id"]
                current = records.get(key, {})
                current.update({k: v for k, v in row.items() if v})
                records[key] = current
    if public_index.exists():
        try:
            public = json.loads(public_index.read_text(encoding="utf-8"))
        except Exception:
            public = {}
        for row in public.get("locations") or []:
            name = row.get("name") or "unknown"
            key = row.get("place_id") or sha_contact(name)
            current = records.get(key, {"name": name, "lead_id": key})
            current.setdefault("name", name)
            current.setdefault("lead_id", key)
            current["cohort"] = row.get("cohort")
            current["stage"] = row.get("stage")
            current["blocker"] = row.get("blocker")
            records[key] = current
    return list(records.values())


def is_test_fixture(row: dict | None) -> bool:
    if not isinstance(row, dict):
        return False
    identity = row.get("identity") if isinstance(row.get("identity"), dict) else {}
    source = row.get("source") if isinstance(row.get("source"), dict) else {}
    place = str(identity.get("place_id") or row.get("place_id") or row.get("lead_id") or "").strip().lower()
    name = str(row.get("name") or (row.get("business") or {}).get("name") or "").strip().lower()
    source_file = str(source.get("source_file") or row.get("source_file") or "").strip().lower()
    if place in FIXTURE_PLACE_IDS or place.startswith("chijtest"):
        return True
    if Path(source_file).name in FIXTURE_SOURCE_FILES:
        return True
    if name in FIXTURE_NAMES and (not place or place.startswith("chijtest") or Path(source_file).name in FIXTURE_SOURCE_FILES):
        return True
    return False


def record_status(row: dict, flags: dict[str, bool]) -> str:
    if is_test_fixture(row):
        return "test_fixture"
    if row.get("stage") == "excluded" or row.get("blocker"):
        return "suppressed"
    found = sum(1 for present in flags.values() if present)
    if found >= 3:
        return "enriched"
    if found:
        return "partial"
    return "empty"


def build_message(profile: str, channel: str, practice: str) -> dict:
    spec = MESSAGE_PROFILES.get(profile) or MESSAGE_PROFILES["growth_score_v6"]
    practice_name = practice or "your practice"
    if channel == "email":
        subject = spec["email_subject"]
        body = spec["email_body"].format(practice=practice_name)
        text = f"{subject}\n{body}"
    else:
        text = spec[channel].format(practice=practice_name) if "{practice}" in spec[channel] else spec[channel]
        subject = None
        body = text
    if FORBIDDEN_CLAIM_RE.search(text):
        raise ValueError("forbidden_claim_in_message")
    return {
        "channel": channel,
        "subject": subject,
        "body": body,
        "word_count": len(body.split()),
        "profile": profile if profile in MESSAGE_PROFILES else "growth_score_v6",
        "next_step": spec["next_step"],
    }


def write_json(path: Path, payload: dict) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def discover_channels(store: Path, public_index: Path, params: dict) -> dict:
    batch_id = str(params.get("batch_id") or params.get("source_id") or "public-index")
    limit = int(params.get("limit") or 0)
    markets = params.get("markets") or []
    dry_run = bool(params.get("dry_run"))
    records = [row for row in load_records(store, public_index) if in_markets(row, markets)]
    if limit > 0:
        records = records[:limit]
    summaries = []
    counts = {key: 0 for key in ("email", "website", "instagram", "facebook", "linkedin", "phone")}
    for row in records:
        flags = channel_flags(row)
        for key, present in flags.items():
            if present:
                counts[key] += 1
        summaries.append(
            {
                "lead_id": row.get("lead_id"),
                "name": row.get("name"),
                "market": market_of(row),
                "channels": flags,
                "status": record_status(row, flags),
                "stop": bool(is_test_fixture(row) or row.get("stage") == "excluded" or row.get("blocker")),
            }
        )
    payload = {
        "batch_id": batch_id,
        "dry_run": dry_run,
        "source_id": params.get("source_id"),
        "markets": markets,
        "record_count": len(summaries),
        "counts": counts,
        "records": summaries,
        "generated_at": now(),
    }
    out = store / "enrichment" / f"{batch_id}.json"
    if not dry_run:
        write_json(out, payload)
    else:
        out = store / "enrichment" / f"{batch_id}.dry-run.json"
        write_json(out, payload)
    return {
        "ok": True,
        "dry_run": dry_run,
        "batch_id": batch_id,
        "counts": counts,
        "record_count": len(summaries),
        "records": summaries,
        "output_path": str(out),
    }


def prepare_outreach(store: Path, public_index: Path, params: dict) -> dict:
    batch_id = str(params.get("batch_id") or "public-index")
    channels = normalize_channels(params.get("channels"))
    profile = str(params.get("message_profile") or "growth_score_v6")
    limit = int(params.get("limit") or 0)
    dry_run = bool(params.get("dry_run"))
    enrichment_path = store / "enrichment" / f"{batch_id}.json"
    if not enrichment_path.exists():
        discover_channels(store, public_index, {"batch_id": batch_id, "limit": limit or 0, "markets": params.get("markets")})
    stops = load_stop_flags(store)
    records = load_records(store, public_index)
    if enrichment_path.exists():
        try:
            enriched = {row.get("lead_id"): row for row in json.loads(enrichment_path.read_text(encoding="utf-8")).get("records") or []}
        except Exception:
            enriched = {}
    else:
        enriched = {}
    items = []
    skipped = 0
    for row in records:
        if limit and len(items) >= limit:
            break
        summary = enriched.get(row.get("lead_id"), {})
        flags = summary.get("channels") or channel_flags(row)
        if is_test_fixture(row) or row.get("stage") == "excluded" or row.get("blocker") or summary.get("stop") or stops["active"]:
            skipped += 1
            continue
        selected = [channel for channel in channels if flags.get(channel) or channel != "email"]
        if "email" in channels and not flags.get("email"):
            selected = [channel for channel in selected if channel != "email"]
        if not selected:
            skipped += 1
            continue
        messages = [build_message(profile, channel, row.get("name") or "your practice") for channel in selected]
        private_email = row.get("email")
        items.append(
            {
                "lead_id": row.get("lead_id"),
                "name": row.get("name"),
                "channels": selected,
                "email_sha256": sha_contact(private_email) if private_email else None,
                "email": private_email,
                "messages": messages,
                "suppressed": False,
            }
        )
    queue_id = str(params.get("queue_id") or f"q-{batch_id}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}")
    queue = {
        "queue_id": queue_id,
        "batch_id": batch_id,
        "channels": channels,
        "message_profile": profile if profile in MESSAGE_PROFILES else "growth_score_v6",
        "dry_run": dry_run,
        "stop_flags": stops,
        "items": items,
        "generated_at": now(),
    }
    path = store / "queues" / f"{queue_id}.json"
    write_json(path, queue)
    samples = []
    for item in items[:3]:
        for message in item["messages"]:
            samples.append(
                {
                    "lead_id": item["lead_id"],
                    "name": item["name"],
                    "channel": message["channel"],
                    "subject": message["subject"],
                    "body": mask_sample(message["body"]),
                    "word_count": message["word_count"],
                }
            )
    counts = {channel: 0 for channel in ALLOWED_CHANNELS}
    for item in items:
        for channel in item["channels"]:
            counts[channel] += 1
    return {
        "ok": True,
        "dry_run": dry_run,
        "queue_id": queue_id,
        "batch_id": batch_id,
        "counts": counts,
        "prepared_count": len(items),
        "skipped_count": skipped,
        "stop_flags": stops,
        "sample_messages": samples,
        "output_path": str(path),
    }


def load_queue(store: Path, queue_id: str) -> dict | None:
    if not queue_id:
        return None
    path = store / "queues" / f"{queue_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def provider_account_status(instantly_status: dict | None) -> dict:
    status = instantly_status or {}
    http = status.get("http") or {}
    quality = status.get("quality")
    campaign_status = status.get("status")
    healthy = quality == "ok" and int(campaign_status or 0) in {0, 1, 2} and all(int(v or 0) in {0, 200} for v in http.values())
    if status.get("ok") is False:
        healthy = False
    return {
        "healthy": bool(status.get("ok")) and (quality in {None, "ok"} or healthy),
        "campaign_status": campaign_status,
        "quality": quality,
        "authorized": bool(status.get("ok")),
    }


def record_send_attempt(payload: dict) -> None:
    SEND_ATTEMPTS.append(payload)


def send_email_lead(instantly_fn, campaign_id: str, item: dict) -> dict:
    email = item.get("email")
    record_send_attempt({"channel": "email", "lead_id": item.get("lead_id")})
    if not email:
        return {"ok": False, "skipped": True, "reason": "email_absent_in_private_queue"}
    code, body = instantly_fn(
        "POST",
        "/api/v2/leads",
        {
            "campaign": campaign_id,
            "email": email,
            "company_name": item.get("name"),
            "skip_if_in_workspace": True,
        },
    )
    ok = int(code or 0) in {200, 201}
    return {"ok": ok, "http": code, "reason": None if ok else "instantly_lead_rejected"}


def resolve_canary_evidence(store: Path, repo: Path, params: dict) -> dict:
    result_id = str(params.get("canary_result_id") or params.get("approved_canary_result_id") or "")
    if result_id:
        receipt = store / "canary" / f"{result_id}.json"
        if receipt.exists():
            doc = json.loads(receipt.read_text(encoding="utf-8"))
            if int(doc.get("sent_count") or 0) >= 1 and doc.get("ok"):
                return {"ok": True, "source": "private_receipt", "canary_result_id": result_id}
        public = repo / "docs/agent-api/results" / f"{result_id}.json"
        if public.exists():
            doc = json.loads(public.read_text(encoding="utf-8"))
            data = doc.get("data") or {}
            sent = int(data.get("sent_count") or doc.get("sent_count") or 0)
            if doc.get("operation") == "send_canary" and doc.get("status") == "success" and sent >= 1:
                return {"ok": True, "source": "agent_api_result", "canary_result_id": result_id}
        return {"ok": False, "error": "canary_evidence_invalid", "canary_result_id": result_id}
    if params.get("canary_passed") is True:
        return {"ok": False, "error": "canary_passed_without_result_id"}
    return {"ok": False, "error": "canary_evidence_required"}


def send_from_queue(*, store: Path, repo: Path, params: dict, instantly_fn, instantly_status: dict, campaign_id: str, mode: str, request_id: str | None) -> dict:
    queue_id = str(params.get("queue_id") or "")
    queue = load_queue(store, queue_id)
    if not queue:
        return {"ok": False, "status": "error", "error": "missing_or_unknown_queue_id", "queue_id": queue_id or None}
    channels = normalize_channels(params.get("channels") or queue.get("channels"))
    dry_run = bool(params.get("dry_run"))
    try:
        limit = int(params.get("limit") if params.get("limit") is not None else (CANARY_DEFAULT_LIMIT if mode == "canary" else 25))
    except (TypeError, ValueError):
        return {"ok": False, "status": "error", "error": "invalid_limit"}
    if mode == "canary" and limit > CANARY_HARD_MAX:
        return {
            "ok": False,
            "status": "blocked",
            "blocked": True,
            "error": "canary_limit_exceeds_hard_max",
            "hard_max": CANARY_HARD_MAX,
            "requested_limit": limit,
        }
    if mode == "canary":
        limit = max(1, min(limit, CANARY_HARD_MAX))
    rate_limit = params.get("rate_limit")
    stops = load_stop_flags(store)
    if queue.get("stop_flags", {}).get("active"):
        stops = {"active": True, "flags": sorted(set((stops.get("flags") or []) + (queue.get("stop_flags", {}).get("flags") or []) + ["queue_stop_flag"]))}
    account = provider_account_status(instantly_status)
    if stops["active"]:
        return {
            "ok": False,
            "status": "blocked",
            "blocked": True,
            "error": "stop_flag_active",
            "stop_flags": stops,
            "sent_count": 0,
            "skipped_count": 0,
        }
    if "email" in channels and not account.get("authorized") and not dry_run:
        return {
            "ok": False,
            "status": "blocked",
            "blocked": True,
            "error": "provider_account_unhealthy",
            "provider_status": account,
            "sent_count": 0,
        }
    evidence = {"ok": True, "source": "canary"}
    if mode == "batch":
        evidence = resolve_canary_evidence(store, repo, params)
        if not evidence.get("ok"):
            return {
                "ok": False,
                "status": "blocked",
                "blocked": True,
                "error": evidence.get("error"),
                "sent_count": 0,
                "skipped_count": 0,
            }
    ledger = load_sent_ledger(store)
    sent = 0
    skipped = 0
    errors = 0
    per_channel = {channel: 0 for channel in ALLOWED_CHANNELS}
    actions = []
    candidates = []
    for item in queue.get("items") or []:
        for channel in item.get("channels") or []:
            if channel not in channels:
                continue
            if is_test_fixture(item):
                skipped += 1
                actions.append({"lead_id": item.get("lead_id"), "channel": channel, "result": "skipped_test_fixture"})
                continue
            candidates.append((item, channel))
    for item, channel in candidates:
        if sent >= limit:
            skipped += 1
            continue
        contact_id = item.get("lead_id") or sha_contact(item.get("name") or "unknown")
        key = ledger_key(contact_id, channel, campaign_id)
        if (ledger.get("items") or {}).get(key):
            skipped += 1
            actions.append({"lead_id": contact_id, "channel": channel, "result": "idempotent_skip"})
            continue
        if channel in SOCIAL_NO_COLD:
            skipped += 1
            actions.append({"lead_id": contact_id, "channel": channel, "result": "skipped_no_cold_social"})
            continue
        if channel == "linkedin":
            skipped += 1
            actions.append({"lead_id": contact_id, "channel": channel, "result": "skipped_action_time_confirmation"})
            continue
        if dry_run:
            skipped += 1
            actions.append({"lead_id": contact_id, "channel": channel, "result": "dry_run_no_send"})
            continue
        if channel == "email":
            result = send_email_lead(instantly_fn, campaign_id, item)
            if result.get("ok"):
                sent += 1
                per_channel["email"] += 1
                ledger.setdefault("items", {})[key] = {"at": now(), "request_id": request_id, "mode": mode}
                actions.append({"lead_id": contact_id, "channel": channel, "result": "sent"})
            elif result.get("skipped"):
                skipped += 1
                actions.append({"lead_id": contact_id, "channel": channel, "result": result.get("reason")})
            else:
                errors += 1
                actions.append({"lead_id": contact_id, "channel": channel, "result": result.get("reason"), "http": result.get("http")})
            continue
        skipped += 1
        actions.append({"lead_id": contact_id, "channel": channel, "result": "skipped_unsupported_channel"})
    if not dry_run:
        save_sent_ledger(store, ledger)
    audit = {
        "mode": mode,
        "queue_id": queue_id,
        "dry_run": dry_run,
        "sent_count": sent,
        "skipped_count": skipped,
        "errors_count": errors,
        "per_channel": per_channel,
        "stop_flags": stops,
        "provider_status": account,
        "rate_limit": rate_limit,
        "canary_evidence": evidence if mode == "batch" else None,
        "actions": actions,
        "generated_at": now(),
        "request_id": request_id,
    }
    audit_path = store / "audit" / f"{mode}-{queue_id}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.json"
    write_json(audit_path, {**audit, "actions": [{**row, "lead_id": row.get("lead_id")} for row in actions]})
    if mode == "canary" and sent >= 1 and request_id:
        write_json(store / "canary" / f"{request_id}.json", {"ok": True, "sent_count": sent, "queue_id": queue_id})
    status = "dry_run_ok" if dry_run else ("success" if errors == 0 else "error")
    return {
        "ok": errors == 0,
        "status": status,
        "dry_run": dry_run,
        "queue_id": queue_id,
        "sent_count": sent,
        "skipped_count": skipped,
        "errors_count": errors,
        "per_channel": per_channel,
        "stop_flags": stops,
        "provider_status": account,
        "output_path": str(audit_path),
        "canary_evidence": evidence if mode == "batch" else None,
        "send_attempted": bool(SEND_ATTEMPTS) and not dry_run,
    }
