import ast
import unittest
from pathlib import Path

SOURCE = Path("scripts/caesthetic/medspa-discovery/poll.py")

class PollerRequestRecoveryTest(unittest.TestCase):
    def test_materializes_origin_requests_before_merge(self):
        source = SOURCE.read_text(encoding="utf-8")
        start = source.index("def sync_main()")
        end = source.index("\ndef read_json", start)
        body = source[start:end]
        self.assertIn('materialize_origin_requests()', body)
        self.assertLess(
            body.index('materialize_origin_requests()'),
            body.index('git("merge", "--ff-only", "origin/main")'),
        )

    def test_push_retry_uses_autostash_rebase(self):
        source = SOURCE.read_text(encoding="utf-8")
        self.assertIn("--autostash", source)
        self.assertIn("def push_main_with_retry", source)

    def test_queued_on_vds_placeholder_is_retryable(self):
        source = SOURCE.read_text(encoding="utf-8")
        body = source[source.index("def should_run"):source.index("def terminal_local_result")]
        self.assertIn("origin_result(rid)", body)
        self.assertIn("queued_on_vds", source)
        self.assertNotIn(
            "if existing is None and origin_has(result):\n        return False",
            body,
        )

if __name__ == "__main__":
    unittest.main()
