import json
import tempfile
import unittest
from pathlib import Path
from reply_state import ReplyState
import reply_runtime as r


class ReplyRuntimeTest(unittest.TestCase):
    def message(self):
        return dict(id="message-1", message_id="<message-1>", lead_id=r.TEST_LEAD,
                    eaccount=r.SENDER, lead=r.HANDOFF, from_address_email=r.HANDOFF,
                    campaign_id=r.TEST_CAMPAIGN, i_status=1, body={"text": "Yes, interested in the Free Growth Score."})

    def test_live_inbound_without_lead_id(self):
        message = self.message()
        del message["lead_id"]
        event = r.verified_event(message, r.TEST_CAMPAIGN, {}, True)
        self.assertEqual(event["company_id"], r.TEST_COMPANY)

    def test_followup_keeps_identity_after_lead_move(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            first = {**self.message(), "thread_id": "verified-thread"}
            state = ReplyState(root / "internal-e2e")
            state.ingest(r.verified_event(first, r.TEST_CAMPAIGN, {}, True))
            state.db.close()
            later = {**first, "id": "reply-2"}
            del later["campaign_id"]
            def api(method, path, body=None):
                return 200, {"items": [later]}
            result = r.poll_replies(root, root, api, test=True, dry_run=True)
            self.assertEqual(result["mapped"], 1)
            self.assertTrue(result["ok"])

    def test_native_unsubscribe_creates_company_stop_and_shared_dnc(self):
        with tempfile.TemporaryDirectory() as d:
            event = r.verified_unsubscribe({"id":"lead-1", "campaign":r.CAMPAIGNS[0], "email":"contact@example.test"}, r.CAMPAIGNS[0], {"contact@example.test":{"company-1"}})
            state = ReplyState(d)
            state.ingest(event)
            actions = {row[0] for row in state.db.execute("SELECT action FROM outbox")}
            self.assertEqual(actions, {"stop_company_all_channels", "sync_shared_do_not_contact"})
            self.assertTrue(state.stopped("company-1"))
            state.db.close()

    def test_ambiguous_identity_rejected(self):
        with self.assertRaisesRegex(ValueError, "unresolved"):
            r.verified_event(self.message(), r.TEST_CAMPAIGN, {r.HANDOFF: {"a", "b"}})

    def test_unverified_sender_is_quarantined_without_disabling_poll(self):
        with tempfile.TemporaryDirectory() as d:
            message = {**self.message(),
                       "from_address_email": "alias@example.test", "lead": "lead@example.test"}
            def api(method, path, body=None):
                if method == "GET" and path.startswith("/api/v2/emails"):
                    return 200, {"items": [message]}
                if method == "POST" and path == "/api/v2/leads/list":
                    return 200, {"items": []}
                raise AssertionError((method, path))
            result = r.poll_replies(Path(d), Path(d), api, test=True, dry_run=True)
            self.assertTrue(result["ok"])
            self.assertEqual(result["mapped"], 0)
            self.assertEqual(result["quarantined_count"], 1)
            self.assertEqual(result["quarantined"][0]["reason"], "reply_sender_identity_unresolved")
            self.assertEqual(result["errors"], [])

    def test_quoted_outbound_not_classified(self):
        self.assertEqual(r.classify({"body": {"text": "Interested? unsubscribe"}}), "unclear")

    def test_test_scope_and_no_duplicate_send(self):
        with tempfile.TemporaryDirectory() as d:
            state = ReplyState(d)
            event = r.verified_event(self.message(), r.TEST_CAMPAIGN, {}, True)
            state.ingest(event)
            calls = []
            active = [dict(id=r.TEST_LEAD, campaign=r.TEST_CAMPAIGN, email=r.HANDOFF),
                      dict(id="other", campaign="unrelated", email=r.HANDOFF)]
            def api(method, path, body=None):
                calls.append((method, path, body))
                if path == "/api/v2/leads/list":
                    if body.get("list_id"):
                        return 200, {"items": [{"id": r.TEST_LEAD, "list_id": r.HOLD_LIST}]}
                    return 200, {"items": list(active)}
                if path == "/api/v2/background-jobs/move-job":
                    return 200, {"status": "success"}
                if path == "/api/v2/leads/move":
                    self.assertEqual(body["ids"], [r.TEST_LEAD])
                    active.pop(0)
                    return 200, {"id": "move-job"}
                if path == "/api/v2/emails/forward":
                    self.assertEqual(body["to_address_email_list"], r.HANDOFF)
                    self.assertIn("Yes, interested in the Free Growth Score.", body["body"]["text"])
                    self.assertFalse(body["include_original_body"])
                    return 200, {"id": "sent-id"}
                raise AssertionError(path)
            r.process_outbox(state, api, Path(d), Path(d), {r.TEST_COMPANY: {r.HANDOFF}})
            self.assertTrue(state.ingest(event)["duplicate"])
            r.process_outbox(state, api, Path(d), Path(d), {r.TEST_COMPANY: {r.HANDOFF}})
            self.assertEqual(state.counts(), {"completed": 2})
            self.assertEqual(sum(x[1] == "/api/v2/emails/forward" for x in calls), 1)
            self.assertTrue(state.stopped(r.TEST_COMPANY))
            state.db.close()

    def test_uncertain_forward_not_retried(self):
        with tempfile.TemporaryDirectory() as d:
            state = ReplyState(d)
            state.ingest(r.verified_event(self.message(), r.TEST_CAMPAIGN, {}, True))
            count = []
            def api(method, path, body=None):
                if path == "/api/v2/leads/list":
                    return 200, {"items": []}
                count.append(path)
                raise TimeoutError()
            for _ in range(2):
                r.process_outbox(state, api, Path(d), Path(d), {r.TEST_COMPANY: {r.HANDOFF}})
            self.assertEqual(count, ["/api/v2/emails/forward"])
            self.assertEqual(state.counts(), {"completed": 1, "processing": 1})
            state.db.close()

    def test_dnc_updates_only_target_and_replays(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            master = root / "data/master"
            master.mkdir(parents=True)
            for name in ("master_companies.csv", "master_contacts.csv"):
                (master/name).write_text("company_id,do_not_contact,email\na,false,a@example.com\nb,false,b@example.com\n")
            r.sync_dnc(root, root/"store", "a")
            before = (master/"master_companies.csv").read_bytes()
            r.sync_dnc(root, root/"store", "a")
            self.assertEqual(before, (master/"master_companies.csv").read_bytes())
            self.assertIn(b"b,false,b@example.com", before)
            self.assertIn(b"a,true,a@example.com", before)


if __name__ == "__main__":
    unittest.main()
