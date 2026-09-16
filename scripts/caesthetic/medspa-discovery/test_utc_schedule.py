import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import utc_schedule as s

class ScheduleTest(unittest.TestCase):
    def test_only_owned_schedule_changes_and_backup_retained(self):
        content='# owned collector\n0 12 * * 1,3,5 root '+s.SCRIPT+'\n0 6 * * * root /unrelated\n'
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);cron=root/'cron';cron.write_text(content)
            with patch.object(s,'CRON_PATH',cron):
                self.assertFalse(s.repair(root,'wrong')['ok'])
                self.assertEqual(cron.read_text(),content)
                result=s.repair(root,hashlib.sha256(content.encode()).hexdigest())
                self.assertTrue(result['ok'])
                self.assertIn('0 * * * * root '+s.SCRIPT,cron.read_text())
                self.assertIn('0 6 * * * root /unrelated',cron.read_text())
                self.assertEqual(next((root/'schedules').iterdir()).read_text(),content)
                self.assertFalse(s.repair(root,'old')['changed'])
    def test_unknown_schedule_not_rewritten(self):
        with self.assertRaises(ValueError):
            s.render('30 11 * * * root '+s.SCRIPT+'\n')
