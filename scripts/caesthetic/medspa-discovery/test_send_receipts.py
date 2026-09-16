import json
import tempfile
import unittest
from pathlib import Path
from send_receipts import reconcile

class ReceiptTest(unittest.TestCase):
    def test_batch_receipt_does_not_create_canary_evidence(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            (root/'queues').mkdir()
            (root/'queues/q.json').write_text(json.dumps({'items':[{'lead_id':'p','name':'Clinic & Wellness','email':'office@clinic.example'}]}))
            (root/'sent_ledger.json').write_text(json.dumps({'items':{'p:email:c':{'request_id':'batch','mode':'batch','state':'import_accepted','at':'2026-09-15T21:00:00Z'}}}))
            message={'id':'id','message_id':'smtp','campaign_id':'c','ue_type':1,'to_address_email_list':'office@clinic.example','timestamp_email':'2026-09-15T21:01:00Z','body':{'html':'Clinic &amp; Wellness Commercial outreach from CAESTHETIC 600 W 7th unsubscribe'}}
            result=reconcile(root,'c',{'queue_id':'q','lead_ids':['p'],'import_result_id':'batch'},lambda *a:(200,{'items':[message]}),mode='batch')
            self.assertTrue(result['provider_send_verified'])
            self.assertFalse((root/'canary/batch.json').exists())
            self.assertTrue((root/'send-receipts/batch.json').exists())

    def test_only_new_matching_outbound_canary_passes(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            (root/'queues').mkdir()
            (root/'queues/q.json').write_text(json.dumps({'items':[{'lead_id':'p','name':'Clinic','email':'office@clinic.example'}]}))
            (root/'sent_ledger.json').write_text(json.dumps({'items':{'p:email:c':{'request_id':'canary','mode':'canary','state':'import_accepted','at':'2026-09-15T21:00:00Z'}}}))
            params={'queue_id':'q','lead_ids':['p'],'canary_result_id':'canary'}
            message={'id':'provider-id','message_id':'smtp-id','campaign_id':'c','ue_type':1,'to_address_email_list':'office@clinic.example','timestamp_email':'2026-09-15T21:01:00Z','body':{'text':'Clinic Commercial outreach from CAESTHETIC 600 W 7th unsubscribe'}}
            for field,value in [('campaign_id','other'),('ue_type',2),('to_address_email_list','other@clinic.example'),('timestamp_email','2026-09-14T21:00:00Z')]:
                bad={**message,field:value}
                self.assertFalse(reconcile(root,'c',params,lambda *a:(200,{'items':[bad]}))['ok'])
                self.assertFalse((root/'canary/canary.json').exists())
            result=reconcile(root,'c',params,lambda *a:(200,{'items':[message]}))
            self.assertTrue(result['provider_send_verified'])
            self.assertEqual(result['sent_count'],1)
            self.assertNotIn('office@',json.dumps(result))
            self.assertTrue((root/'canary/canary.json').exists())
            params['canary_result_id']='unrelated'
            self.assertFalse(reconcile(root,'c',params,lambda *a:self.fail('must not call provider'))['ok'])
