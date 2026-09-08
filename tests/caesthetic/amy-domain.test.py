import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
p=Path(__file__).resolve().parents[2]/'scripts/configure-amy-domain.py'
spec=importlib.util.spec_from_file_location('amy_domain',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class DomainTest(unittest.TestCase):
 def run_case(self,dns,route):
  writes=[]
  def get(c,path):
   if path.startswith('/zones?'):result=[{'name':'caesthetic.com','id':'zone'}]
   elif '/dns_records?' in path:result=dns
   else:result=route
   return 200,{'success':True,'result':result}
  with patch.object(m.helper,'credentials',return_value=['test']),patch.object(m.helper,'api_get',side_effect=get),patch.object(m,'write',side_effect=lambda c,p,b:writes.append((p,b)) or True):m.main()
  return writes
 def test_create_only_amy(self):
  writes=self.run_case([],[]);self.assertEqual(len(writes),2);self.assertEqual(writes[0][1]['name'],m.HOST);self.assertEqual(writes[1][1]['pattern'],m.HOST+'/*')
 def test_idempotent(self):
  self.assertEqual(self.run_case([{'type':'CNAME','content':'caesthetic.com','proxied':True}],[{'pattern':m.HOST+'/*','script':m.WORKER}]),[])
 def test_conflict(self):
  with self.assertRaisesRegex(RuntimeError,'Conflicting'):self.run_case([{'type':'A','content':'127.0.0.1','proxied':True}],[])
if __name__=='__main__':unittest.main()
