import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('amy_db',Path(__file__).resolve().parents[2]/'scripts/configure-amy-cal-db.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class Provision(unittest.TestCase):
    def test_existing_binding_preserved_without_secret(self):
        with patch.dict(os.environ,{'CLOUDFLARE_ACCOUNT_ID':'test','AMY_CAL_WEBHOOK_SECRET':''}), patch.object(m.helper,'credentials',return_value=['candidate']), patch.object(m.helper,'api_get',return_value=(200,{'success':True,'result':{'bindings':[{'name':'AMY_CAL_DB','type':'d1','id':'test-id'}]}})):
            self.assertEqual(m.provision(),'test-id')
    def test_existing_db_migrated_without_duplicate_creation(self):
        with patch.dict(os.environ,{'CLOUDFLARE_ACCOUNT_ID':'test','AMY_CAL_WEBHOOK_SECRET':'test'}), patch.object(m.helper,'credentials',return_value=['candidate']), patch.object(m.helper,'api_get',return_value=(200,{'success':True,'result':[{'name':m.NAME,'uuid':'test-id'}]})), patch.object(m,'post',return_value={'success':True,'result':[{'success':True}]}) as post:
            self.assertEqual(m.provision(),'test-id')
            self.assertEqual(post.call_count,1)
            self.assertTrue(post.call_args.args[1].endswith('/test-id/query'))
    def test_denial_is_explicit(self):
        with patch.dict(os.environ,{'CLOUDFLARE_ACCOUNT_ID':'test','AMY_CAL_WEBHOOK_SECRET':'test'}), patch.object(m.helper,'credentials',return_value=['candidate']), patch.object(m.helper,'api_get',return_value=(403,{})):
            with self.assertRaisesRegex(RuntimeError,'D1 Edit required'):m.provision()

if __name__=='__main__':unittest.main()
