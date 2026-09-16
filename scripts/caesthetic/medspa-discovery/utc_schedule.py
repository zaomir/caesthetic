"""Repair only the owned recurring cron entry; the worker enforces the UTC slot."""
import hashlib
import os
from pathlib import Path

CRON_PATH = Path('/etc/cron.d/caesthetic-medspa-recurring')
SCRIPT = '/var/www/grainee-v2/scripts/caesthetic/medspa-discovery/schedule.sh'

def render(content):
    output=[]
    matches=0
    for line in content.splitlines():
        parts=line.split(None,5)
        if not line.lstrip().startswith('#') and len(parts)==6 and SCRIPT in parts[5]:
            if parts[:5] not in [['0','12','*','*','1,3,5'], ['0','*','*','*','*']]:
                raise ValueError('unexpected_owned_cron_schedule')
            matches+=1
            line='0 * * * * '+parts[5]
        output.append(line)
    if matches!=1:
        raise ValueError('owned_cron_entry_unresolved')
    return '\n'.join(output)+'\n'

def repair(store, expected_sha):
    path=CRON_PATH
    if path.is_symlink() or not path.is_file():
        return {'ok':False,'status':'blocked','error':'owned_cron_file_unresolved'}
    before=path.read_bytes()
    before_sha=hashlib.sha256(before).hexdigest()
    after=render(before.decode()).encode()
    if after != before and before_sha != expected_sha:
        return {'ok':False,'status':'blocked','error':'cron_changed_since_review'}
    if after != before:
        backup=store/'schedules'/('cron-before-'+before_sha)
        backup.parent.mkdir(parents=True,exist_ok=True)
        if not backup.exists():
            backup.write_bytes(before)
        stat=path.stat()
        temporary=path.with_name('.caesthetic-medspa-recurring.tmp')
        temporary.write_bytes(after)
        os.chmod(temporary,0o644)
        os.chown(temporary,stat.st_uid,stat.st_gid)
        temporary.replace(path)
    return {'ok':True,'status':'success','changed':after!=before,'before_sha256':before_sha,
            'after_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'cron_schedule':'0 * * * *','effective_utc_slot':'Mon/Wed/Fri 12:00 UTC',
            'utc_slot_guard':'op_run_discovery scheduled=True',
            'deduplication':'scheduled-YYYYMMDDT120000Z durable receipt and operation lock',
            'paid_ops':'none','scheduled_execution_observed':False}
