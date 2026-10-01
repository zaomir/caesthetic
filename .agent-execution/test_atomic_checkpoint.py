import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

MODULE = Path(__file__).with_name("atomic_checkpoint.py")
spec = importlib.util.spec_from_file_location("checkpoint", MODULE)
checkpoint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checkpoint)

class RecoveryTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.state = Path(self.temp.name) / "state.json"
        self.proof = Path(self.temp.name) / "proof.json"
        self.proof.write_text('{"result":"observed success"}')
        self.call("init", "--task", "TEST", "--base-sha", "a"*40, "--next-action", "inspect")

    def call(self, *args, ok=True):
        result = subprocess.run([sys.executable, str(MODULE), "--state", str(self.state), *args],
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 0 if ok else 2, result.stdout + result.stderr)
        return json.loads(result.stdout)

    def begin(self):
        return self.call("begin", "--revision", "1", "--key", "stable-id",
                         "--action", "one unit", "--input-sha256", "b"*64)

    def verify(self):
        return self.call("verify", "--revision", "2", "--key", "stable-id",
                         "--evidence", str(self.proof), "--next-action", "next-unit")

    def test_restart_reconciles_then_skips_verified(self):
        self.begin()
        self.assertEqual(self.call("resume")["decision"], "reconcile")
        self.call("begin", "--revision", "2", "--key", "other",
                  "--action", "duplicate", "--input-sha256", "b"*64, ok=False)
        self.verify()
        self.assertEqual(self.call("resume")["next_action"], "next-unit")
        self.assertEqual(self.call("begin", "--revision", "3", "--key", "stable-id",
                                  "--action", "one unit", "--input-sha256", "b"*64)["decision"],
                         "skip_verified")
        self.call("begin", "--revision", "3", "--key", "stable-id",
                  "--action", "changed", "--input-sha256", "c"*64, ok=False)

    def test_stale_writer_and_missing_evidence(self):
        self.begin()
        self.call("heartbeat", "--revision", "1", ok=False)
        self.call("verify", "--revision", "2", "--key", "stable-id",
                  "--evidence", str(self.proof) + ".missing", "--next-action", "next", ok=False)
        self.assertIsNotNone(self.call("resume")["pending"])

    def test_tampered_evidence_blocks_resume(self):
        self.begin()
        self.verify()
        self.proof.write_text("changed")
        self.call("resume", ok=False)

    def test_interrupted_atomic_write_preserves_old_checkpoint(self):
        state = json.loads(self.state.read_text())
        state["_event"] = "fault injection"
        before = self.state.read_bytes()
        with patch.object(checkpoint.os, "replace", side_effect=OSError("interrupted before rename")):
            with self.assertRaises(OSError):
                checkpoint.save(self.state, state)
        self.assertEqual(self.state.read_bytes(), before)
        self.assertEqual(self.call("resume")["revision"], 1)

    def test_concurrent_writers_only_one_wins(self):
        command = [sys.executable, str(MODULE), "--state", str(self.state), "begin",
                   "--revision", "1", "--key", "stable-id", "--action", "one unit",
                   "--input-sha256", "b"*64]
        processes = [subprocess.Popen(command, stdout=subprocess.PIPE) for _ in range(2)]
        for process in processes:
            process.communicate()
        self.assertEqual(sorted(p.returncode for p in processes), [0, 2])
        self.assertEqual(self.call("resume")["revision"], 2)

    def test_no_effect_receipt_required_for_retry(self):
        self.begin()
        self.call("retry", "--revision", "2", "--key", "stable-id",
                  "--no-effect-evidence", str(self.proof) + ".missing", "--next-action", "retry", ok=False)
        self.call("retry", "--revision", "2", "--key", "stable-id",
                  "--no-effect-evidence", str(self.proof), "--next-action", "retry")
        self.assertIsNone(self.call("resume")["pending"])
        self.proof.write_text("tampered reconciliation")
        self.call("resume", ok=False)

if __name__ == "__main__":
    unittest.main()
