import unittest
from pathlib import Path
from unittest.mock import patch
from launch_capacity import configure

class CapacityTest(unittest.TestCase):
    def test_no_verified_canary_no_capacity_change(self):
        with patch('launch_capacity.resolve_canary_evidence', return_value={'ok':False,'error':'gate'}):
            result=configure(Path('/unused'),Path('/unused'),'c',{'campaign_daily_limit':4},lambda *a:self.fail('provider must not be called'))
            self.assertFalse(result['ok'])
    def test_account_cap_is_preserved(self):
        writes=[]
        cap=3
        def api(method,path,body=None):
            if '/accounts/' in path:
                return 200,{'status':1,'daily_limit':cap}
            if method=='PATCH':
                writes.append(body)
                return 200,{}
            return 200,{'email_list':['sender@example.test'],'daily_limit':4,'daily_max_leads':4}
        with patch('launch_capacity.resolve_canary_evidence', return_value={'ok':True}):
            self.assertFalse(configure(Path('/unused'),Path('/unused'),'c',{'campaign_daily_limit':4},api)['ok'])
            self.assertEqual(writes,[])
            cap=15
            result=configure(Path('/unused'),Path('/unused'),'c',{'campaign_daily_limit':4},api)
            self.assertTrue(result['ok'])
            self.assertFalse(result['account_limit_changed'])
            self.assertEqual(writes,[{'daily_limit':4,'daily_max_leads':4}])
