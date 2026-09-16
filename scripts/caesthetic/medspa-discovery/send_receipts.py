"""Reconcile a private import ledger against actual provider outbound messages."""
import hashlib
import html
import json
import re
from datetime import datetime
from urllib.parse import urlencode
from outreach import load_queue, load_sent_ledger, ledger_key, write_json

def reconcile(store, campaign_id, params, instantly, mode="canary"):
    queue = load_queue(store, str(params.get("queue_id") or ""))
    ids = params.get("lead_ids")
    original = params.get("import_result_id") or params.get("canary_result_id")
    if not queue or not isinstance(ids, list) or not ids or not isinstance(original, str) or not re.fullmatch(r"[A-Za-z0-9_-]+", original):
        return {"ok": False, "status": "blocked", "error": "invalid_receipt_scope"}
    ledger = load_sent_ledger(store).get("items", {})
    targets = []
    for pid in ids:
        matches = [row for row in queue.get("items", []) if row.get("lead_id") == pid]
        event = ledger.get(ledger_key(pid, "email", campaign_id), {})
        if len(matches) != 1 or event.get("request_id") != original or event.get("mode") != mode or event.get("state") != "import_accepted":
            return {"ok": False, "status": "blocked", "error": "accepted_canary_import_required"}
        targets.append((matches[0], event))
    messages = []
    cursor = None
    for _ in range(10):
        query = {"campaign_id": campaign_id, "email_type": "sent", "limit": 100}
        if cursor:
            query["starting_after"] = cursor
        code, body = instantly("GET", "/api/v2/emails?" + urlencode(query))
        if code != 200 or not isinstance(body, dict):
            return {"ok": False, "status": "error", "error": "provider_receipt_read_failed"}
        messages.extend(body.get("items") or [])
        new_cursor = body.get("next_starting_after")
        if not new_cursor or new_cursor == cursor or not body.get("items"):
            break
        cursor = new_cursor
    verified = []
    for row, event in targets:
        for msg in messages:
            recipient = str(msg.get("to_address_email_list") or "").strip().lower()
            timestamp = msg.get("timestamp_email") or msg.get("timestamp_created")
            if msg.get("campaign_id") != campaign_id or msg.get("ue_type") != 1 or recipient != str(row.get("email") or "").lower():
                continue
            try:
                if datetime.fromisoformat(timestamp.replace("Z", "+00:00")) < datetime.fromisoformat(event["at"].replace("Z", "+00:00")):
                    continue
            except (ValueError, TypeError, AttributeError, KeyError):
                continue
            body = msg.get("body") or {}
            rendered = " ".join(str(body.get(k) or "") for k in ("text", "html")) if isinstance(body, dict) else str(body)
            visible = html.unescape(rendered)
            valid = bool(msg.get("id") and msg.get("message_id") and "600 W 7th" in visible and "unsubscribe" in visible.lower() and "Commercial outreach from CAESTHETIC" in visible and row.get("name") in visible and not re.search(r"\{\{[^}]+\}\}", visible))
            if not valid:
                continue
            verified.append({"lead_id": row["lead_id"], "provider_message_id": msg["id"], "sent_at": timestamp, "rendered_body_sha256": hashlib.sha256(rendered.encode()).hexdigest(), "rendered_qa_passed": True})
            break
    complete = len(verified) == len(targets)
    result = {"ok": complete, "status": "success" if complete else "blocked", "campaign_id": campaign_id, "queue_id": params["queue_id"], "import_result_id": original, "sent_count": len(verified), "provider_send_verified": complete, "receipts": verified, "send_attempted": False, "paid_ops": "none"}
    if mode == "canary":
        result["canary_result_id"] = original
    if complete:
        write_json(store / ("canary" if mode == "canary" else "send-receipts") / (original + ".json"), result)
    else:
        result["error"] = "provider_send_not_yet_observed"
    return result
