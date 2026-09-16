import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import outreach

class ReviewHoldTest(unittest.TestCase):
    def test_held_legacy_queue_cannot_import(self):
        items=[{'name':name,'lead_id':str(i),'email':'held@example.test','channels':['email']} for i,name in enumerate(['Berk Beauty',"SYR Men's Med Spa Studio"])]
        with tempfile.TemporaryDirectory() as d,patch.object(outreach,'load_queue',return_value={'items':items}),patch.object(outreach,'provider_account_status',return_value={'authorized':True}),patch.object(outreach,'company_reply_block',return_value=None):
            result=outreach.send_from_queue(store=Path(d),repo=Path(d),params={'queue_id':'legacy'},instantly_fn=lambda *a:self.fail('held contact reached provider'),instantly_status={},campaign_id='c',mode='canary',request_id='r')
            self.assertEqual(result['import_accepted_count'],0)
            self.assertEqual(result['skipped_count'],2)
