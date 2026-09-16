import ast
import hashlib
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock


class RunReplayTest(unittest.TestCase):
    def load(self, root, stamp):
        class Clock:
            @classmethod
            def now(cls, tz):
                return stamp
        fn = next(n for n in ast.parse(Path(__file__).with_name('run.py').read_text()).body if isinstance(n, ast.FunctionDef) and n.name == 'op_run_discovery')
        collect = Mock(return_value={'ok':True, 'status':'success'})
        ns = {'Path':Path, 'PRIVATE':root, 'PUBLIC_INDEX':root/'public.json', 'load_secrets':lambda:None,
              'ensure_store':lambda:None, 'hashlib':hashlib, 'json':json, 'datetime':Clock,
              'timezone':timezone, 'run_recurring_discovery':collect}
        exec(compile(ast.Module(body=[fn], type_ignores=[]), 'run.py', 'exec'), ns)
        return ns['op_run_discovery'], collect

    def test_control_request_replays_receipt_without_second_purchase(self):
        with tempfile.TemporaryDirectory() as d:
            run, collect = self.load(Path(d), datetime(2026,9,16,12,tzinfo=timezone.utc))
            run({'run_id':'same-request'})
            result = run({'run_id':'same-request'})
            self.assertTrue(result['replayed_receipt'])
            self.assertEqual(collect.call_count, 1)

    def test_crash_claim_blocks_repurchase(self):
        with tempfile.TemporaryDirectory() as d:
            run, collect = self.load(Path(d), datetime(2026,9,16,12,tzinfo=timezone.utc))
            collect.side_effect = TimeoutError()
            with self.assertRaises(TimeoutError):
                run({'run_id':'crash'})
            self.assertEqual(run({'run_id':'crash'})['status'], 'blocked')
            self.assertEqual(collect.call_count, 1)

    def test_utc_slot_not_host_timezone_or_catchup(self):
        with tempfile.TemporaryDirectory() as d:
            for hour, minute in [(11,0),(12,5),(13,0)]:
                run, collect = self.load(Path(d), datetime(2026,9,16,hour,minute,tzinfo=timezone.utc))
                self.assertEqual(run({'scheduled':True})['status'], 'outside_utc_slot')
                collect.assert_not_called()
            run, collect = self.load(Path(d), datetime(2026,9,16,12,0,tzinfo=timezone.utc))
            run({'scheduled':True})
            run({'scheduled':True})
            self.assertEqual(collect.call_count, 1)
            self.assertEqual(collect.call_args.args[1]['run_id'], 'scheduled-20260916T120000Z')


if __name__ == '__main__':
    unittest.main()
