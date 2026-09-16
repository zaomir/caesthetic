import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import outreach
import ast
from unittest.mock import Mock

class ScopeTests(unittest.TestCase):
    def test_queue_selection_and_empty_allowlist(self):
        queue = {'channels':['email'], 'items':[{'lead_id':x,'channels':['email'],'name':x} for x in ['alpha','beta']]}
        with tempfile.TemporaryDirectory() as root, patch.object(outreach,'load_queue',return_value=queue), patch.object(outreach,'load_stop_flags',return_value={'active':False}), patch.object(outreach,'company_reply_block',return_value=None), patch.object(outreach,'load_sent_ledger',return_value={}):
            for ids, expected in [(['beta'],['beta']),([],[])]:
                result=outreach.send_from_queue(store=Path(root),repo=Path(root),params={'queue_id':'q','dry_run':True,'lead_ids':ids},instantly_fn=lambda *a: self.fail('provider call'),instantly_status={},campaign_id='pinned',mode='canary',request_id='test')
                self.assertEqual([x['lead_id'] for x in json.loads(Path(result['output_path']).read_text())['actions']],expected)
    def test_invalid_scope_blocks(self):
        with patch.object(outreach,'load_queue',return_value={'channels':['email']}):
            result=outreach.send_from_queue(store=Path('/unused'),repo=Path('/unused'),params={'queue_id':'q','lead_ids':'beta'},instantly_fn=None,instantly_status={},campaign_id='pinned',mode='canary',request_id=None)
            self.assertEqual(result['error'],'invalid_lead_ids')
    def test_named_campaign_requires_nonempty_scope(self):
        nodes=[n for n in ast.parse(Path(__file__).with_name('run.py').read_text()).body if isinstance(n,ast.FunctionDef) and n.name in ['op_send_canary','op_send_batch']]
        send=Mock()
        ns={'ensure_store':lambda:None,'factory_campaign_id':lambda p:'nyla','CID':'legacy','send_from_queue':send}
        exec(compile(ast.Module(body=nodes,type_ignores=[]),'run.py','exec'),ns)
        for name in ['op_send_canary','op_send_batch']:
            for ids in [None,[]]:
                self.assertEqual(ns[name]({'lead_ids':ids})['error'],'explicit_lead_ids_required')
        send.assert_not_called()
