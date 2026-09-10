#!/usr/bin/env python3
"""Provision CPRP secrets on VPS2402. Output is a chmod-600 file, never stdout or Git."""
import os,json,secrets,argparse
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--output',required=True);args=p.parse_args()
store=Path('/var/lib/caesthetic-partner-revenue');store.mkdir(mode=0o700,parents=True,exist_ok=True)
permanent=store/'runtime-secrets.json'
values=json.loads(permanent.read_text()) if permanent.exists() else {}
known=('TWENTY_API_KEY',)
for name in known:
 if os.environ.get(name):values[name]=os.environ[name]
for filename in ['/etc/evo/secrets.env','/etc/evo/deploy.env','/etc/grainee/edge.env','/var/www/grainee-v2/.env']:
 f=Path(filename)
 if not f.is_file():continue
 for line in f.read_text().splitlines():
  line=line.strip().removeprefix('export ')
  if '=' not in line or line.startswith('#'):continue
  name,value=line.split('=',1);name=name.strip()
  if name in known and not values.get(name):values[name]=value.strip().strip('\"').strip("'")
keyfile=Path('/root/.twenty_api_key')
if (not values.get('TWENTY_API_KEY') or values['TWENTY_API_KEY'].startswith('your_')) and keyfile.is_file():values['TWENTY_API_KEY']=keyfile.read_text().strip()
if not values.get('TWENTY_API_KEY') or values['TWENTY_API_KEY'].startswith('your_'):
 values.pop('TWENTY_API_KEY',None)
 print('Twenty credential not present on VPS; registry will start independently; live CRM acceptance still required')
values.setdefault('CPRP_IDENTITY_KEY',secrets.token_urlsafe(32))
values.setdefault('CPRP_PROVISIONING_KEY',secrets.token_urlsafe(48))
values={k:v for k,v in values.items() if k in ('CPRP_IDENTITY_KEY','CPRP_PROVISIONING_KEY','TWENTY_API_KEY')}
for file in [permanent,Path(args.output)]:
 fd=os.open(file,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as out:json.dump(values,out)
 os.chmod(file,0o600)
print('CPRP secret provisioning complete; values withheld')
