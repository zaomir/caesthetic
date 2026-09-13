import importlib.util
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

source = Path(__file__).resolve().parents[2] / "scripts/outreach/sync_master_to_drive.py"
if not source.exists():
    source = Path(__file__).with_name("drive_sync.py")
spec = importlib.util.spec_from_file_location("test_master_drive_sync", source)
sync = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = sync
spec.loader.exec_module(sync)


class DrivePrivacyTest(unittest.TestCase):
    def test_public_or_unknown_permissions_block_before_upload(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "master_companies.csv"
            path.write_text("company_id\nsynthetic\n")
            for permissions, error in [
                ({"has_anyone": True, "permission_count": 2}, "public_anyone_permission_detected"),
                ({"has_anyone": False, "permission_count": None}, "drive_permissions_unverified"),
            ]:
                client = Mock()
                client.get_file.return_value = sync.DriveStat("file", name=path.name)
                client.permissions_summary.return_value = permissions
                with patch.object(sync, "resolve_file_id", return_value=("file", "configured")):
                    result = sync.sync_one(client, "folder", path, "file", apply=True, allow_create=True)
                self.assertEqual(result["error"], error)
                client.update_content.assert_not_called()
                client.create_in_folder.assert_not_called()


if __name__ == "__main__":
    unittest.main()
