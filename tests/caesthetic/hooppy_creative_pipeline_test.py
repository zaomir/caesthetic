from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts/caesthetic/hooppy-creative-pipeline.py"
SPEC = importlib.util.spec_from_file_location("cae_hooppy_pipeline", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class HooppyCreativePipelineTest(unittest.TestCase):
    def manifest(self, master: str) -> dict:
        return {
            "content_id": "CAE-VIDEO-001",
            "version": "1",
            "copy_id": "COPY-CAE-VIDEO-001",
            "topic_id": "TOP-MKT-01A",
            "pain_cluster": "booking friction",
            "master_asset_url": master,
            "approved_script": True,
            "approved_publish": True,
            "claims_ok": True,
            "rights_ok": True,
            "privacy_ok": True,
            "scheduled_at": "2026-08-25T15:30:00+01:00",
            "timezone": "Europe/London",
            "captions": {name: f"{name} caption" for name in MODULE.PLATFORMS},
        }

    def make_video(self, path: Path) -> None:
        subprocess.run(
            [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-f", "lavfi", "-i", "color=c=navy:s=720x1280:d=1",
                "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
                "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(path),
            ],
            check=True,
        )

    def test_headers_have_separate_platform_cells(self):
        for platform in MODULE.PLATFORMS:
            for suffix in ("asset_url", "spec", "sha256", "caption", "status", "hooppy_post_id", "live_url"):
                self.assertIn(f"{platform}_{suffix}", MODULE.SHEET_HEADERS)

    def test_publish_gate_fails_closed(self):
        raw = self.manifest("master.mp4")
        raw["rights_ok"] = False
        with self.assertRaisesRegex(ValueError, "publish_gate_incomplete:rights_ok"):
            MODULE.validate_manifest(raw)

    def test_expected_master_checksum_is_enforced(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            master = root / "master.mp4"
            self.make_video(master)
            raw = self.manifest(str(master))
            raw["expected_master_sha256"] = "0" * 64
            manifest = MODULE.validate_manifest(raw)
            with self.assertRaisesRegex(RuntimeError, "master_checksum_mismatch"):
                MODULE.build_package(manifest, root / "out", sync_dropbox=False)

    def test_builds_and_records_all_platform_variants(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            master = root / "master.mp4"
            self.make_video(master)
            manifest = MODULE.validate_manifest(self.manifest(str(master)))
            package = MODULE.build_package(manifest, root / "out", sync_dropbox=False)
            self.assertEqual(set(package["platforms"]), set(MODULE.PLATFORMS))
            for name, cfg in MODULE.PLATFORMS.items():
                variant = package["platforms"][name]
                self.assertTrue(Path(variant["local_path"]).is_file())
                self.assertEqual(variant["spec"], f"{cfg.width}x{cfg.height} h264/aac mp4")
                self.assertRegex(variant["sha256"], r"^[a-f0-9]{64}$")
                self.assertTrue(variant["asset_url"].startswith("dropbox:SIMON_OPS/content/B_CAE_IG/"))
            row = MODULE.sheet_row(package)
            self.assertEqual(row["instagram_status"], "READY_FOR_APPROVAL")
            self.assertEqual(row["linkedin_spec"], "1080x1920 h264/aac mp4")
            saved = json.loads(Path(package["publish_manifest"]).read_text())
            self.assertEqual(saved["master_sha256"], package["master_sha256"])

    def test_schedule_dry_run_uses_exact_allowlist_and_platform_copy(self):
        package = MODULE.validate_manifest(self.manifest("master.mp4"))
        package["production_status"] = "PLATFORM_VARIANTS_READY"
        package["qa_status"] = "PASS"
        package["platforms"] = {
            name: {
                "caption": f"copy-{name}",
                "hooppy_post_id": "",
                "local_path": "x",
                "asset_url": f"dropbox:test/{name}.mp4",
                "sha256": "x",
            }
            for name in MODULE.PLATFORMS
        }
        planned = MODULE.schedule_package(package, execute=False)
        for name, cfg in MODULE.PLATFORMS.items():
            payload = planned[name]["payload"]
            self.assertEqual(payload["publication_when_type"], 2)
            self.assertEqual(payload["selected_pages_ids"], [cfg.page_id])
            self.assertEqual(payload["texts"], [{"text": f"copy-{name}", "source_id": cfg.source_id}])
        youtube_settings = planned["youtube"]["payload"]["attachments"][1]
        self.assertEqual(youtube_settings, {"type": "settings", "data": {"publish_as_shorts": True}})

    def test_delivery_unverified_is_never_retried_blindly(self):
        package = MODULE.validate_manifest(self.manifest("master.mp4"))
        package["production_status"] = "PLATFORM_VARIANTS_READY"
        package["qa_status"] = "PASS"
        package["platforms"] = {
            name: {
                "caption": f"copy-{name}",
                "hooppy_post_id": "",
                "asset_url": f"dropbox:test/{name}.mp4",
                "sha256": "x",
                "status": "DELIVERY_UNVERIFIED" if name == "instagram" else "READY_FOR_APPROVAL",
            }
            for name in MODULE.PLATFORMS
        }
        with self.assertRaisesRegex(RuntimeError, "reconcile_required_before_retry:instagram"):
            MODULE.schedule_package(package, execute=False)

    def test_schedule_can_be_limited_to_one_approved_destination(self):
        package = MODULE.validate_manifest(self.manifest("master.mp4"))
        package["production_status"] = "PLATFORM_VARIANTS_READY"
        package["qa_status"] = "PASS"
        package["platforms"] = {
            name: {
                "caption": f"copy-{name}",
                "hooppy_post_id": "",
                "asset_url": f"dropbox:test/{name}.mp4",
                "sha256": "x",
                "status": "READY_FOR_APPROVAL",
            }
            for name in MODULE.PLATFORMS
        }
        planned = MODULE.schedule_package(package, execute=False, platform_names=["instagram"])
        self.assertEqual(list(planned), ["instagram"])
        self.assertEqual(
            planned["instagram"]["payload"]["selected_pages_ids"],
            [MODULE.PLATFORMS["instagram"].page_id],
        )


if __name__ == "__main__":
    unittest.main()
