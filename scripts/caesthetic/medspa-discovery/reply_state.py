"""Private reply state/outbox. Requires authenticated provider adapter upstream.

This module does not fetch replies, stop provider campaigns or send mail itself.
Those adapters must acknowledge outbox tasks before handoff is complete.
"""
import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

KINDS = {"interested", "request_information", "referral", "negative", "unsubscribe", "out_of_office", "unclear"}


class ReplyState:
    def __init__(self, store):
        root = Path(store)
        root.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(root / "reply-state.sqlite3")
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript('''
            CREATE TABLE IF NOT EXISTS replies (
                event_key TEXT PRIMARY KEY, company_id TEXT NOT NULL,
                kind TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS company_stops (
                company_id TEXT PRIMARY KEY, reason TEXT NOT NULL, do_not_contact INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS outbox (
                task_id TEXT PRIMARY KEY, event_key TEXT NOT NULL, company_id TEXT NOT NULL,
                action TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
                receipt TEXT, UNIQUE(event_key, action));
        ''')

    def ingest(self, event):
        required = ("provider", "message_id", "company_id", "campaign_id")
        if any(not isinstance(event.get(k), str) or not event[k].strip() for k in required):
            raise ValueError("missing_verified_event_identity")
        if event.get("direction") != "inbound":
            raise ValueError("not_inbound")
        kind = event.get("classification", "unclear")
        if kind not in KINDS:
            kind = "unclear"
        # Never infer positive interest from quoted outbound text.
        if kind != "unclear" and event.get("classification_source") not in {"provider", "human"}:
            kind = "unclear"
        key = hashlib.sha256(json.dumps([event['provider'], event['message_id']]).encode()).hexdigest()
        company = event["company_id"]
        with self.db:
            cursor = self.db.execute("INSERT OR IGNORE INTO replies VALUES (?,?,?,?,?)", (
                key, company, kind, json.dumps(event), datetime.now(timezone.utc).isoformat()))
            if not cursor.rowcount:
                return {"duplicate": True, "event_key": key}
            self.db.execute('''INSERT INTO company_stops VALUES (?,?,?)
                ON CONFLICT(company_id) DO UPDATE SET
                do_not_contact=MAX(company_stops.do_not_contact, excluded.do_not_contact)''',
                (company, "inbound_reply", int(kind in {"unsubscribe", "negative"})))
            actions = ["stop_company_all_channels"]
            if kind in {"unsubscribe", "negative"}:
                actions.append("sync_shared_do_not_contact")
            if kind in {"interested", "request_information", "referral", "unclear"}:
                actions.append("notify_interested" if kind == "interested" else "notify_review")
            for action in actions:
                task = hashlib.sha256((key + action).encode()).hexdigest()
                self.db.execute("INSERT INTO outbox(task_id,event_key,company_id,action) VALUES (?,?,?,?)",
                                (task, key, company, action))
        return {"duplicate": False, "event_key": key, "classification": kind, "tasks": actions}

    def stopped(self, company_id):
        return bool(self.db.execute("SELECT 1 FROM company_stops WHERE company_id=?", (company_id,)).fetchone())

    def claim(self, task_id):
        # Unknown network outcomes remain processing, never automatically retried.
        with self.db:
            return bool(self.db.execute("UPDATE outbox SET state='processing' WHERE task_id=? AND state='pending'", (task_id,)).rowcount)

    def acknowledge(self, task_id, provider_receipt):
        if not isinstance(provider_receipt, str) or not provider_receipt.strip():
            raise ValueError("provider_receipt_required")
        with self.db:
            return bool(self.db.execute("UPDATE outbox SET state='completed',receipt=? WHERE task_id=? AND state='processing'", (provider_receipt, task_id)).rowcount)

    def counts(self):
        return dict(self.db.execute("SELECT state, COUNT(*) FROM outbox GROUP BY state"))
