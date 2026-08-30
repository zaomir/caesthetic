import importlib.util
import unittest
from datetime import datetime, timezone
from pathlib import Path


SCRIPT = Path(__file__).parents[2] / "scripts/caesthetic/entertainment-rotation.py"
SPEC = importlib.util.spec_from_file_location("entertainment_rotation", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def ready(rotation_id, position, count, last=""):
    row = {
        "rotation_id": rotation_id,
        "sequence_position": position,
        "times_published": count,
        "last_published_at": last,
        "next_eligible_at": "",
        "rotation_status": "READY",
        "approved_publish": "TRUE",
        "rights_status": "GO",
        "audio_status": "GO",
        "privacy_status": "GO",
        "claims_status": "GO",
        "visual_qa_status": "GO",
    }
    for platform in MODULE.PLATFORMS:
        row[f"{platform}_asset_url"] = f"dropbox:{rotation_id}/{platform}.mp4"
        row[f"{platform}_caption"] = f"{platform} caption"
        row[f"{platform}_status"] = "READY"
    return row


class RotationSelectionTest(unittest.TestCase):
    def test_default_inbox_is_founder_managed_top50_folder(self):
        self.assertEqual(
            MODULE.DROPBOX_INBOX,
            "dropbox:Projects/CAESTHETIC/CAESTHETIC MEDIA/Huck/reels/reels-inbox/top50_2026-08-19 2",
        )

    def test_new_item_is_served_before_cycle_restart(self):
        rows = [ready("old-a", 1, 1), ready("old-b", 2, 1), ready("new", 3, 0)]
        self.assertEqual(MODULE.select_next(rows)["rotation_id"], "new")

    def test_cycle_restarts_at_first_position(self):
        rows = [ready("first", 1, 1), ready("second", 2, 1)]
        self.assertEqual(MODULE.select_next(rows)["rotation_id"], "first")

    def test_rights_gate_fails_closed(self):
        row = ready("blocked", 1, 0)
        row["rights_status"] = "REVIEW_REQUIRED"
        self.assertIsNone(MODULE.select_next([row]))

    def test_cooldown_is_respected(self):
        row = ready("later", 1, 0)
        row["next_eligible_at"] = "2026-09-01T00:00:00Z"
        now = datetime(2026, 8, 22, tzinfo=timezone.utc)
        self.assertIsNone(MODULE.select_next([row], now=now))


if __name__ == "__main__":
    unittest.main()
