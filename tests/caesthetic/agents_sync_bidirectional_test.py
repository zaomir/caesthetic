import hashlib
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts" / "caesthetic" / "sync_agents_bidirectional.py"
SPEC = importlib.util.spec_from_file_location("caesthetic_repo_sync", MODULE_PATH)
SYNC = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = SYNC
SPEC.loader.exec_module(SYNC)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


class DecideDeletionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.g = root / "g"
        self.s = root / "s"
        self.g.mkdir()
        self.s.mkdir()

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, root: Path, rel: str, value: str):
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)

    def test_grainee_deletion_propagates(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.s, rel, "same")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("same")})
        self.assertEqual((action.direction, action.operation, action.reason),
                         ("g2s", "delete", "grainee_deleted"))

    def test_satellite_deletion_propagates(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.g, rel, "same")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("same")})
        self.assertEqual((action.direction, action.operation, action.reason),
                         ("s2g", "delete", "satellite_deleted"))

    def test_modification_wins_over_deletion(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.s, rel, "new")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("old")})
        self.assertEqual((action.direction, action.operation), ("s2g", "copy"))

    def test_protected_grainee_deletion_wins(self):
        rel = "site-caesthetic/example.html"
        self.write(self.s, rel, "new")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("old")})
        self.assertEqual((action.direction, action.operation), ("g2s", "delete"))

    def test_commit_helper_stages_tracked_deletion_and_ignores_unknown_path(self):
        repo = Path(self.tmp.name) / "repo"
        repo.mkdir()
        subprocess.run(["git", "init", "-b", "main"], cwd=repo, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
        tracked = repo / "docs" / "caesthetic" / "deleted.md"
        tracked.parent.mkdir(parents=True)
        tracked.write_text("old")
        subprocess.run(["git", "add", "."], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-m", "seed"], cwd=repo, check=True,
                       stdout=subprocess.DEVNULL)
        tracked.unlink()

        SYNC.git_commit_push(
            repo,
            "sync deletion",
            ["docs/caesthetic/deleted.md", "optional-never-created.md"],
            True,
            False,
        )

        self.assertEqual(
            subprocess.check_output(["git", "show", "--format=", "--name-status", "HEAD"],
                                    cwd=repo, text=True).strip(),
            "D\tdocs/caesthetic/deleted.md",
        )

    def test_canonical_sop_pointer_is_not_mirrored(self):
        rel = "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md"
        self.write(self.g, rel, "canonical")
        self.assertNotIn(rel, SYNC.collect_rels(self.g))

    def test_systemd_units_are_in_mirror_contract(self):
        for rel in (
            "deploy/systemd/caesthetic-repo-sync.service",
            "deploy/systemd/caesthetic-repo-sync.timer",
        ):
            self.write(self.g, rel, "unit")
            self.assertIn(rel, SYNC.collect_rels(self.g))


if __name__ == "__main__":
    unittest.main()
