import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts" / "caesthetic" / "expert_dental_mirror.py"
SPEC = importlib.util.spec_from_file_location("expert_dental_mirror", MODULE_PATH)
MIRROR = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = MIRROR
SPEC.loader.exec_module(MIRROR)


class ExpertDentalMirrorTest(unittest.TestCase):
    def test_one_way_allowlist_excludes_phi_secrets_private_and_binary_archives(self):
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

    def test_sync_overwrites_mirror_edits_and_deletes_stale_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            grainee = root / "g"
            satellite = root / "s"
            source = grainee / "docs/projects/raimovdental/AGENTS.md"
            source.parent.mkdir(parents=True)
            source.write_text("authority")
            destination = satellite / MIRROR.MIRROR_DEST / "docs/projects/raimovdental/AGENTS.md"
            destination.parent.mkdir(parents=True)
            destination.write_text("unauthorized edit")
            stale = satellite / MIRROR.MIRROR_DEST / "stale.md"
            stale.write_text("stale")
            result = MIRROR.sync_mirror(grainee, satellite, "sha-test", True)
            self.assertEqual(destination.read_text(), "authority")
            self.assertFalse(stale.exists())
            self.assertIn("docs/projects/raimovdental/AGENTS.md", result["changed"])
            manifest = json.loads((satellite / MIRROR.MIRROR_DEST / ".mirror-manifest.json").read_text())
            self.assertEqual(manifest["direction"], "grainee-v2-to-caesthetic-only")

    def test_caesthetic_contributions_are_outside_generated_mirror(self):
        self.assertFalse("docs/projects/caesthetic/expert-dental-contributions".startswith(MIRROR.MIRROR_DEST))


if __name__ == "__main__":
    unittest.main()
