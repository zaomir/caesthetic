import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery"))
import outreach as o

class ImportReceipts(unittest.TestCase):
    def test_import_is_not_sent_and_replay_is_skipped(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory)
            o.write_json(p / "queues/q.json", {"items": [{"lead_id": "fixture-receipt", "company_id": "fixture-company", "name": "Test clinic", "email": "test@example.com", "channels": ["email"]}], "channels": ["email"]})
            calls = []
            def api(*args):
                calls.append(args)
                return 201, {"id": "test-lead"}
            kwargs = dict(store=p, repo=p, params={"queue_id": "q"}, instantly_fn=api, instantly_status={"ok": True, "quality": "ok"}, campaign_id="test-campaign", mode="canary", request_id="test-receipt")
            result = o.send_from_queue(**kwargs)
            self.assertEqual(result["sent_count"], 0)
            self.assertEqual(result["import_accepted_count"], 1)
            self.assertFalse((p / "canary/test-receipt.json").exists())
            o.send_from_queue(**kwargs)
            self.assertEqual(len(calls), 1)

    def test_legacy_receipt_and_corrupt_files(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory)
            o.write_json(p / "canary/old.json", {"ok": True, "sent_count": 1})
            self.assertFalse(o.resolve_canary_evidence(p, p, {"canary_result_id": "old"})["ok"])
            (p / "stop_flags.json").write_text("{")
            self.assertTrue(o.load_stop_flags(p)["active"])
            (p / "sent_ledger.json").write_text("{")
            with self.assertRaises(ValueError):
                o.load_sent_ledger(p)

if __name__ == "__main__":
    unittest.main()
