"""Authenticated reply ingestion and durable provider handoff.

No arbitrary campaign/recipient input. Unknown external outcomes stay processing
and require reconciliation; a provider acceptance is never called delivery.
"""
import csv
import hashlib
import json
import os
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlencode

from reply_state import ReplyState

CAMPAIGNS = ("7a7421b3-4d7a-4756-a60a-c19c10b0ad8c", "bb82c55d-3c27-4697-ab78-ecc2e5f01e83")
TEST_CAMPAIGN = "40099ff0-23e5-458f-be3d-8cef383fc0f3"
TEST_LEAD = "01a0a688-daf8-7359-9c60-8fca64663bdd"
TEST_COMPANY = "internal-e2e-20260915"
HOLD_LIST = "c9fc2206-2df5-49e8-b19f-78d7fc128294"
HANDOFF = "wsc8eq@gmail.com"
SENDER = "valerie@caesthetic.co"
VERSION = "provider-reply-runtime-v2"


def pages(api, method, path, body=None):
    rows, cursor, seen = [], None, set()
    for _ in range(100):
        args = dict(body or {})
        args["limit"] = 100
        if cursor:
            args["starting_after"] = cursor
        code, data = api(method, path + ("?" + urlencode(args) if method == "GET" else ""),
                         None if method == "GET" else args)
        if code != 200 or not isinstance(data, dict) or not isinstance(data.get("items"), list):
            raise ValueError("provider_list_failed_" + str(code))
        items = data["items"]
        rows.extend(items)
        nxt = data.get("next_starting_after")
        if not items or not nxt:
            return rows
        if nxt in seen:
            raise ValueError("provider_cursor_repeated")
        seen.add(nxt)
        cursor = nxt
    raise ValueError("provider_page_limit")


def identities(repo, store):
    """Exact address anchors from canonical masters and previously built queues."""
    by_email, by_company = defaultdict(set), defaultdict(set)
    company_ids = set()
    for filename in ("master_companies.csv", "master_contacts.csv"):
        with (repo / "data/master" / filename).open(newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            if not {"company_id", "email", "do_not_contact"} <= set(reader.fieldnames or []):
                raise ValueError("canonical_master_schema_invalid")
            for row in reader:
                cid, address = row["company_id"].strip(), row["email"].strip().lower()
                if filename == "master_companies.csv":
                    company_ids.add(cid)
                if cid and address and "@" in address and not any(c in address for c in ",; "):
                    by_email[address].add(cid)
                    by_company[cid].add(address)
    for path in (store / "queues").glob("*.json"):
        doc = json.loads(path.read_text())
        for row in doc.get("items") or []:
            cid, address = row.get("company_id"), str(row.get("email") or "").strip().lower()
            if cid in company_ids and address and "@" in address:
                by_email[address].add(cid)
                by_company[cid].add(address)
    return by_email, by_company


def classify(message):
    # No keyword matching against quoted outbound text.
    return {1: "interested", -1: "negative"}.get(message.get("i_status"), "unclear")


def verified_event(message, campaign, mapping, test=False):
    if message.get("campaign_id") != campaign or message.get("eaccount") != SENDER:
        raise ValueError("reply_scope_mismatch")
    address = str(message.get("from_address_email") or "").strip().lower()
    if not address or address != str(message.get("lead") or "").strip().lower():
        raise ValueError("reply_sender_identity_unresolved")
    if not message.get("id") or not message.get("message_id"):
        raise ValueError("reply_provider_identity_missing")
    if test:
        if campaign != TEST_CAMPAIGN or message.get("lead_id", TEST_LEAD) != TEST_LEAD or address != HANDOFF:
            raise ValueError("test_identity_mismatch")
        company = TEST_COMPANY
    else:
        candidates = mapping.get(address, set())
        if len(candidates) != 1:
            raise ValueError("canonical_reply_company_unresolved")
        company = next(iter(candidates))
    return {"provider": "instantly", "message_id": message["id"],
            "campaign_id": campaign, "company_id": company, "direction": "inbound",
            "classification": classify(message), "classification_source": "provider",
            "provider_message": message, "test_only": test}


def verified_unsubscribe(lead, campaign, mapping):
    address = str(lead.get("email") or "").strip().lower()
    candidates = mapping.get(address, set())
    if lead.get("campaign") != campaign or not lead.get("id") or len(candidates) != 1:
        raise ValueError("unsubscribe_company_unresolved")
    return {"provider": "instantly_lead", "message_id": "unsubscribe:" + lead["id"],
            "campaign_id": campaign, "company_id": next(iter(candidates)),
            "direction": "inbound", "classification": "unsubscribe",
            "classification_source": "provider", "provider_signal": "unsubscribe_filter"}


def sync_dnc(repo, store, company):
    """Set only DNC=true; retain byte backup and reject concurrent master edits."""
    if company == TEST_COMPANY:
        raise ValueError("test_never_writes_shared_master")
    import fcntl
    root = store / "reply-master-backups"
    root.mkdir(parents=True, exist_ok=True)
    with (root / "write.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        counts = {}
        for name in ("master_companies.csv", "master_contacts.csv"):
            path = repo / "data/master" / name
            before = path.read_bytes()
            with path.open(newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                fields, rows = reader.fieldnames, list(reader)
            if not fields or not {"company_id", "do_not_contact"} <= set(fields):
                raise ValueError("canonical_dnc_schema_invalid")
            affected = [row for row in rows if row["company_id"].strip() == company]
            if name == "master_companies.csv" and len(affected) != 1:
                raise ValueError("canonical_dnc_company_unresolved")
            counts[name] = len(affected)
            if not affected or all(row["do_not_contact"].lower() == "true" for row in affected):
                continue
            digest = hashlib.sha256(before).hexdigest()
            backup = root / (name + "." + digest)
            if not backup.exists():
                backup.write_bytes(before)
                backup.chmod(0o600)
            for row in affected:
                row["do_not_contact"] = "true"
            temp = path.with_name(path.name + ".medspa-dnc.tmp")
            with temp.open("w", newline="", encoding="utf-8") as f:
                csv.DictWriter(f, fieldnames=fields).writeheader()
                csv.DictWriter(f, fieldnames=fields).writerows(rows)
                f.flush()
                os.fsync(f.fileno())
            temp.chmod(path.stat().st_mode & 0o777)
            if path.read_bytes() != before:
                temp.unlink()
                raise ValueError("canonical_master_changed_retry_required")
            os.replace(temp, path)
        return counts


def original_reply_text(message):
    body = message.get("body") or {}
    text = body.get("text")
    if not text and body.get("html"):
        from html.parser import HTMLParser
        class TextParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.chunks = []
            def handle_data(self, data):
                self.chunks.append(data)
        parser = TextParser()
        parser.feed(body["html"])
        text = " ".join(parser.chunks)
    if not text or not text.strip():
        raise ValueError("original_reply_body_unavailable")
    return text


def process_outbox(state, api, repo, store, company_emails):
    results = []
    tasks = state.db.execute("SELECT task_id,event_key,company_id,action,state,receipt FROM outbox WHERE state!='completed'").fetchall()
    for tid, key, company, action, status, receipt in tasks:
        event = json.loads(state.db.execute("SELECT payload FROM replies WHERE event_key=?", (key,)).fetchone()[0])
        message = event.get("provider_message") or {}
        try:
            if action == "stop_company_all_channels":
                # Moving exact matching leads into a non-sending list cancels the
                # provider sequence without labelling interested people as opt-outs.
                addresses = sorted(company_emails.get(company, set()))
                if not addresses:
                    raise ValueError("company_contacts_missing")
                current = pages(api, "POST", "/api/v2/leads/list", {"contacts": addresses, "in_campaign": True})
                current = [x for x in current if x.get("campaign") and str(x.get("email") or "").lower() in addresses]
                if event.get("test_only"):
                    current = [x for x in current if x["campaign"] == TEST_CAMPAIGN]
                if status == "processing":
                    if current:
                        raise ValueError("stop_pending_reconciliation")
                    if not receipt:
                        raise ValueError("stop_receipt_missing")
                    for move in json.loads(receipt):
                        code, job = api("GET", "/api/v2/background-jobs/" + move["job_id"])
                        if code != 200 or job.get("status") != "success":
                            raise ValueError("stop_job_not_completed")
                        held = pages(api, "POST", "/api/v2/leads/list", {"list_id": HOLD_LIST, "ids": [move["lead_id"]]})
                        if not any(x.get("id") == move["lead_id"] and x.get("list_id") == HOLD_LIST for x in held):
                            raise ValueError("stop_hold_readback_missing")
                    state.acknowledge(tid, receipt)
                    results.append({"action": action, "state": "completed", "company_id": company})
                    continue
                if not state.claim(tid):
                    continue
                moves = []
                for lead in current:
                    code, result = api("POST", "/api/v2/leads/move", {
                        "campaign": lead["campaign"], "ids": [lead["id"]],
                        "to_list_id": HOLD_LIST, "copy_leads": False,
                        "reset_interest_status": False})
                    if code != 200 or not isinstance(result, dict) or not result.get("id"):
                        raise ValueError("stop_move_unconfirmed_" + str(code))
                    moves.append({"lead_id": lead["id"], "job_id": result["id"]})
                    with state.db:
                        state.db.execute("UPDATE outbox SET receipt=? WHERE task_id=?", (json.dumps(moves), tid))
                if not current:
                    state.acknowledge(tid, json.dumps({"no_campaign_leads": True}))
                results.append({"action": action, "state": "processing" if current else "completed", "company_id": company})
            elif action == "sync_shared_do_not_contact":
                if status == "pending" and not state.claim(tid):
                    continue
                result = sync_dnc(repo, store, company)
                from master_ingest import sync_master_mirror
                mirror = sync_master_mirror(repo, store)
                if not mirror.get("ok"):
                    raise ValueError("shared_dnc_local_saved_mirror_pending")
                state.acknowledge(tid, json.dumps({"master_rows": result, "drive_sync": "success"}))
                results.append({"action": action, "state": "completed", "company_id": company})
            elif action in {"notify_interested", "notify_review"}:
                if status != "pending":
                    results.append({"action": action, "state": "processing", "reason": "notification_requires_reconciliation"})
                    continue
                if message.get("eaccount") != SENDER or not message.get("id"):
                    raise ValueError("handoff_source_invalid")
                original = original_reply_text(message)
                if not state.claim(tid):
                    continue
                marker = "CAESTHETIC handoff " + tid[:16]
                code, sent = api("POST", "/api/v2/emails/forward", {
                    "eaccount": SENDER, "reply_to_uuid": message["id"],
                    "to_address_email_list": HANDOFF, "subject": marker,
                    "body": {"text": "Company: " + company + "\nClassification: " + event["classification"] +
                             "\n" + ("INTERNAL TEST ONLY\n" if event.get("test_only") else "") +
                             "Automatic follow-ups stopped locally. Review original reply below.\nReceipt: " + tid +
                             "\n\nOriginal reply from: " + str(message.get("from_address_email") or "") +
                             "\nSubject: " + str(message.get("subject") or "") + "\n\n" + original},
                    "include_original_body": False})
                if code not in {200, 201} or not isinstance(sent, dict) or not sent.get("id"):
                    raise ValueError("handoff_acceptance_unconfirmed_" + str(code))
                state.acknowledge(tid, json.dumps({"provider_email_id": sent["id"], "delivery_verified": False}))
                results.append({"action": action, "state": "provider_accepted", "provider_email_id": sent["id"], "marker": marker})
        except Exception as exc:
            # Never expose provider bodies or retry a possibly completed mutation.
            results.append({"action": action, "state": "blocked", "reason": str(exc) if isinstance(exc, ValueError) else type(exc).__name__})
    return results


def poll_replies(repo, store, api, *, test=False, dry_run=True):
    root = store / "internal-e2e" if test else store
    mapping, company_emails = ({}, {TEST_COMPANY: {HANDOFF}}) if test else identities(repo, store)
    # Moving a lead out of a campaign removes campaign_id from later replies.
    # Keep attribution using the previously authenticated thread + exact sender.
    import sqlite3
    history = {}
    database = root / "reply-state.sqlite3"
    if database.exists():
        db = sqlite3.connect("file:" + str(database) + "?mode=ro", uri=True)
        try:
            for (payload,) in db.execute("SELECT payload FROM replies"):
                event = json.loads(payload)
                message = event.get("provider_message") or {}
                if message.get("thread_id"):
                    history[(message["thread_id"], message.get("from_address_email"))] = event
        finally:
            db.close()
    candidates, quarantined = [], []
    campaigns = (TEST_CAMPAIGN,) if test else CAMPAIGNS
    for message in pages(api, "GET", "/api/v2/emails", {"eaccount": SENDER, "email_type": "received"}):
        campaign = message.get("campaign_id")
        previous = history.get((message.get("thread_id"), message.get("from_address_email")))
        inherited = not campaign and previous and previous.get("campaign_id") in campaigns
        if campaign not in campaigns and not inherited:
            continue
        try:
            campaign = previous["campaign_id"] if inherited else campaign
            checked = {**message, "campaign_id": campaign} if inherited else message
            event = verified_event(checked, campaign, mapping, test)
            if inherited and event["company_id"] != previous["company_id"]:
                raise ValueError("reply_thread_company_conflict")
            event["provider_message"] = message
            event["campaign_attribution"] = "durable_reply_thread" if inherited else "provider_campaign"
            candidates.append(event)
        except ValueError as exc:
            quarantined.append({"provider_email_id": message.get("id"), "reason": str(exc)})
    if not test:
        for campaign in campaigns:
            for lead in pages(api, "POST", "/api/v2/leads/list", {"campaign": campaign, "filter": "FILTER_VAL_UNSUBSCRIBED"}):
                try:
                    candidates.append(verified_unsubscribe(lead, campaign, mapping))
                except ValueError as exc:
                    quarantined.append({"provider_lead_id": lead.get("id"), "reason": str(exc)})
    if dry_run:
        return {"ok": True, "dry_run": True, "version": VERSION, "mapped": len(candidates),
                "quarantined_count": len(quarantined), "quarantined": quarantined, "errors": []}
    state = ReplyState(root)
    try:
        ingested = [state.ingest(event) for event in candidates]
        actions = process_outbox(state, api, repo, root, company_emails)
        counts = state.counts()
        result = {"ok": not any(x.get("state") == "blocked" for x in actions),
                  "version": VERSION, "test_only": test, "mapped": len(candidates),
                  "new_events": sum(not x["duplicate"] for x in ingested), "outbox": counts,
                  "actions": actions, "quarantined_count": len(quarantined),
                  "quarantined": quarantined, "errors": [],
                  "delivery_verified": False, "scope": "email_and_local_company_guard"}
        root.mkdir(parents=True, exist_ok=True)
        (root / "reply-runtime-last.json").write_text(json.dumps(result, indent=2) + "\n")
        return result
    finally:
        state.db.close()
