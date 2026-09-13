import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery"
if ROOT.exists():
    sys.path.insert(0, str(ROOT))
import outreach
from reply_state import ReplyState


class ReplyGuardTest(unittest.TestCase):
    def test_stale_queue_blocks_every_location_of_replied_company(self):
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            queue = {"items": [
                {"lead_id": "location-a", "company_id": "company-a", "channels": ["email"], "email": "a@example.org"},
                {"lead_id": "location-b", "company_id": "company-a", "channels": ["email"], "email": "b@example.org"},
                {"lead_id": "location-c", "company_id": "company-c", "channels": ["email"], "email": "c@example.org"},
            ]}
            outreach.write_json(store / "queues/q.json", queue)
            state = ReplyState(store)
            state.ingest({"provider": "test", "message_id": "reply-1", "campaign_id": "campaign", "company_id": "company-a", "direction": "inbound"})
            state.db.close()
            calls = []
            def api(method, path, payload):
                calls.append(payload["email"])
                return 201, {"id": "accepted-lead"}
            result = outreach.send_from_queue(store=store, repo=store, params={"queue_id": "q"}, instantly_fn=api, instantly_status={"ok": True}, campaign_id="campaign", mode="canary", request_id="test")
            self.assertEqual(calls, ["c@example.org"])
            self.assertEqual(result["import_accepted_count"], 1)
            self.assertEqual(result["sent_count"], 0)
            self.assertEqual(result["skipped_count"], 2)

    def test_missing_identity_and_corrupt_database_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            self.assertEqual(outreach.company_reply_block(store, {"lead_id": "maps-id"}), "canonical_company_id_missing")
            (store / "reply-state.sqlite3").write_bytes(b"corrupt state")
            self.assertEqual(outreach.company_reply_block(store, {"company_id": "company"}), "reply_state_unreadable")

    def test_prepare_preserves_company_and_excludes_reply(self):
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            outreach.write_json(store / "registry.json", {"locations": [
                {"lead_id": "a", "place_id": "place-a", "company_id": "a", "email_present": True},
                {"lead_id": "b", "place_id": "place-b", "company_id": "b", "email_present": True},
            ]})
            state = ReplyState(store)
            state.ingest({"provider": "test", "message_id": "reply", "campaign_id": "campaign", "company_id": "a", "direction": "inbound"})
            state.db.close()
            (store / "master_companies.csv").write_text("company_id,company_name,city,country,phone,map_url,do_not_contact\na,A,Miami,US,,https://maps.google.com/?query_place_id=place-a,false\nb,B,Miami,US,,https://maps.google.com/?query_place_id=place-b,false\n")
            (store / "master_contacts.csv").write_text("company_id,do_not_contact\n")
            result = outreach.prepare_outreach(store, store / "absent.json", {"queue_id": "q"}, master_dir=store)
            self.assertEqual(result["prepared_count"], 1)
            queue = json.loads((store / "queues/q.json").read_text())
            self.assertEqual(queue["items"][0]["company_id"], "b")


if __name__ == "__main__":
    unittest.main()
