import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from master_ingest import discovery_source_rows, package_rows

class DiscoverySourceTest(unittest.TestCase):
    def seed(self, root, status='success'):
        run='approved-run'
        raw=root/'raw'/run/'scottsdale.json';raw.parent.mkdir(parents=True)
        raw.write_text(json.dumps({'rows':[{'place_id':'actual-place','name':'Example Med Spa','city':'Scottsdale','type':'medical spa','site':'https://example.test'}]}))
        receipt={'run_id':run,'status':status,'dry_run':False,'markets_attempted':[{'id':'scottsdale','raw_sha256':hashlib.sha256(raw.read_bytes()).hexdigest()}]}
        folder=root/'run-results';folder.mkdir()
        (folder/(hashlib.sha256(run.encode()).hexdigest()+'.json')).write_text(json.dumps(receipt))
        return run,raw
    def test_verified_run_normalizes_for_existing_master_writer(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);run,_=self.seed(root)
            rows=discovery_source_rows(root,run)
            companies,skipped=package_rows(rows,[])
            self.assertEqual(len(companies),1)
            self.assertEqual(companies[0]['country'],'US')
            self.assertEqual(companies[0]['website'],'https://example.test')
            self.assertIn('not_send_ready',companies[0]['tags'])
    def test_modified_raw_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);run,raw=self.seed(root);raw.write_text('{}')
            with self.assertRaisesRegex(ValueError,'hash_mismatch'):
                discovery_source_rows(root,run)
    def test_unfinished_run_and_path_escape_are_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);run,_=self.seed(root,'blocked')
            with self.assertRaisesRegex(ValueError,'not_completed'):
                discovery_source_rows(root,run)
            with self.assertRaisesRegex(ValueError,'invalid_discovery_run_id'):
                discovery_source_rows(root,'../outside')
if __name__=='__main__':unittest.main()
