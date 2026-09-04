import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts" / "caesthetic" / "expert_dental_mirror.py"
POLICY_PATH = ROOT / "docs" / "projects" / "caesthetic" / "EXPERT_DENTAL_MIRROR.yml"
SPEC = importlib.util.spec_from_file_location("expert_dental_mirror", MODULE_PATH)
MIRROR = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = MIRROR
SPEC.loader.exec_module(MIRROR)


def policy_list(key: str):
    values = []
    active = False
    for line in POLICY_PATH.read_text().splitlines():
        if active and line and not line[0].isspace():
            break
        if line == f"{key}:":
            active = True
            continue
        if active and line.strip().startswith("- "):
            values.append(line.strip()[2:].removesuffix("/**"))
    return values


class ExpertDentalMirrorTest(unittest.TestCase):
    def test_writeback_runtime_allowlist_matches_policy(self):
        self.assertEqual(list(MIRROR.WRITEBACK_TREES), policy_list("writeback_allowlist"))
        self.assertEqual(
            set(MIRROR.WRITEBACK_SUFFIXES),
            {f".{value}" for value in policy_list("writeback_file_types")},
        )

    def test_mirror_allowlist_excludes_phi_secrets_private_and_binary_archives(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            allowed = root / "docs/legal/raimov/expert-dental/package/markdown/form.md"
            phi = root / "docs/legal/raimov/expert-dental/patient-records/patient.md"
            secret = root / "apps/expert-esign/.env"
            binary = root / "docs/legal/raimov/expert-dental/package/forms.zip"
            credentials = root / "docs/raimov/operations/expert-dental/credentials-archive/license.jpg"
            media = root / "docs/raimov/operations/expert-dental/media/patient-before.png"
            for path in (allowed, phi, secret, binary, credentials, media):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("synthetic")
            self.assertTrue(MIRROR.is_allowed(allowed, root))
            self.assertFalse(MIRROR.is_allowed(phi, root))
            self.assertFalse(MIRROR.is_allowed(secret, root))
            self.assertFalse(MIRROR.is_allowed(binary, root))
            self.assertFalse(MIRROR.is_allowed(credentials, root))
            self.assertFalse(MIRROR.is_allowed(media, root))

    def test_allowlisted_project_edit_writes_back_to_grainee(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            rel = "docs/projects/raimovdental/strategy.md"
            source = grainee / rel
            source.parent.mkdir(parents=True)
            source.write_text("authority")
            MIRROR.sync_mirror(grainee, satellite, "sha-initial", True)
            destination = satellite / MIRROR.MIRROR_DEST / rel
            destination.write_text("satellite edit")

            plan = MIRROR.sync_mirror(grainee, satellite, "sha-writeback", False)
            self.assertEqual(plan["writeback_changed"], [rel])
            self.assertEqual(plan["conflicts"], [])
            result = MIRROR.sync_mirror(grainee, satellite, "sha-writeback", True)
            self.assertEqual(source.read_text(), "satellite edit")
            self.assertEqual(result["writeback_changed"], [rel])
            manifest = json.loads((satellite / MIRROR.MIRROR_DEST / ".mirror-manifest.json").read_text())
            self.assertEqual(manifest["direction"], "hybrid-bidirectional-allowlisted")
            self.assertIn("docs/projects/raimovdental", manifest["writeback"]["allowed_trees"])

    def test_new_allowlisted_project_file_writes_back(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            seed = grainee / "docs/projects/raimovdental/seed.md"
            seed.parent.mkdir(parents=True)
            seed.write_text("seed")
            MIRROR.sync_mirror(grainee, satellite, "sha-initial", True)
            rel = "docs/projects/raimovdental/new-plan.md"
            created = satellite / MIRROR.MIRROR_DEST / rel
            created.parent.mkdir(parents=True, exist_ok=True)
            created.write_text("new non-PHI plan")
            result = MIRROR.sync_mirror(grainee, satellite, "sha-new", True)
            self.assertEqual((grainee / rel).read_text(), "new non-PHI plan")
            self.assertEqual(result["writeback_changed"], [rel])

    def test_protected_legal_edit_is_blocked_without_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            rel = "docs/legal/raimov/expert-dental/package/markdown/form.md"
            source = grainee / rel
            source.parent.mkdir(parents=True)
            source.write_text("approved wording")
            MIRROR.sync_mirror(grainee, satellite, "sha-initial", True)
            destination = satellite / MIRROR.MIRROR_DEST / rel
            destination.write_text("unauthorized legal edit")

            result = MIRROR.sync_mirror(grainee, satellite, "sha-check", True)
            self.assertEqual(result["authority_violations"], [rel])
            self.assertEqual(source.read_text(), "approved wording")
            self.assertEqual(destination.read_text(), "unauthorized legal edit")

    def test_concurrent_allowlisted_edits_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            rel = "docs/raimov/operations/expert-dental/plan.md"
            source = grainee / rel
            source.parent.mkdir(parents=True)
            source.write_text("base")
            MIRROR.sync_mirror(grainee, satellite, "sha-initial", True)
            destination = satellite / MIRROR.MIRROR_DEST / rel
            source.write_text("authority edit")
            destination.write_text("satellite edit")
            result = MIRROR.sync_mirror(grainee, satellite, "sha-conflict", True)
            self.assertEqual(result["conflicts"], [rel])
            self.assertEqual(source.read_text(), "authority edit")
            self.assertEqual(destination.read_text(), "satellite edit")

    def test_secret_like_content_cannot_write_back(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            rel = "docs/projects/healthcare-ecosystem/vendor.md"
            source = grainee / rel
            source.parent.mkdir(parents=True)
            source.write_text("safe")
            MIRROR.sync_mirror(grainee, satellite, "sha-initial", True)
            destination = satellite / MIRROR.MIRROR_DEST / rel
            destination.write_text("api_key=abcdefghijklmnop123456")
            result = MIRROR.sync_mirror(grainee, satellite, "sha-secret", True)
            self.assertEqual(result["authority_violations"], [f"{rel}:unsafe_writeback"])
            self.assertEqual(source.read_text(), "safe")

    def test_caesthetic_contributions_are_outside_generated_mirror(self):
        self.assertFalse("docs/projects/caesthetic/expert-dental-contributions".startswith(MIRROR.MIRROR_DEST))


if __name__ == "__main__":
    unittest.main()
