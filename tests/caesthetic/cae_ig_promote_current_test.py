import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts/caesthetic/cae_ig_promote_current.py"
POLICY_PATH = ROOT / "scripts/caesthetic/cae_ig_current_policy.json"
SPEC = importlib.util.spec_from_file_location("cae_ig_promote_current", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class PromoteCurrentTest(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads(POLICY_PATH.read_text())
        self.release = self.policy["protected_release_id"]
        self.candidate = {
            "release_id": self.release,
            "canonical_master": (
                "dropbox:Projects/CAESTHETIC/audience/us-spa-ig-master/releases/"
                f"{self.release}/canonical_master.csv"
            ),
            "execution_allowed": False,
        }

    def test_canonical_candidate_uses_revision_compare_and_swap(self):
        calls = []

        def fetch(path):
            return ({"release_id": self.release}, "rev-646")

        def upload(path, body, revision):
            calls.append((path, json.loads(body), revision))

        MODULE.guarded_promote(
            self.candidate, self.policy, fetch, upload, self.release
        )
        self.assertEqual(calls[0][2], "rev-646")
        self.assertEqual(calls[0][1]["execution_allowed"], False)

    def test_stale_writer_is_rejected_before_upload(self):
        uploaded = False

        def upload(*_args):
            nonlocal uploaded
            uploaded = True

        with self.assertRaisesRegex(MODULE.CurrentConflict, "STALE_RELEASE"):
            MODULE.guarded_promote(
                self.candidate,
                self.policy,
                lambda _path: ({"release_id": "parallel-release"}, "new-rev"),
                upload,
                self.release,
            )
        self.assertFalse(uploaded)

    def test_660_is_historical_only(self):
        self.candidate["release_id"] = "r20260821T014017Z-qualified-660"
        self.candidate["canonical_master"] = (
            "dropbox:Projects/CAESTHETIC/audience/us-spa-ig-master/releases/"
            "r20260821T014017Z-qualified-660/canonical_master.csv"
        )
        with self.assertRaisesRegex(ValueError, "historical-only"):
            MODULE.validate_candidate(self.candidate, self.policy)

    def test_execution_stays_disabled(self):
        self.candidate["execution_allowed"] = True
        with self.assertRaisesRegex(ValueError, "execution_allowed must be False"):
            MODULE.validate_candidate(self.candidate, self.policy)

    def test_release_path_must_match_release_id(self):
        self.candidate["canonical_master"] = (
            "dropbox:Projects/CAESTHETIC/audience/us-spa-ig-master/releases/other/"
            "canonical_master.csv"
        )
        with self.assertRaisesRegex(ValueError, "must be immutable"):
            MODULE.validate_candidate(self.candidate, self.policy)

    def test_qualifier_routes_current_updates_through_guard(self):
        source = (ROOT / "scripts/caesthetic/cae_ig_qualify_candidate_pool.py").read_text()
        self.assertIn("guarded_promote(", source)
        self.assertNotIn('copyto(str(tmp / "CURRENT.json"), CURRENT)', source)


if __name__ == "__main__":
    unittest.main()
