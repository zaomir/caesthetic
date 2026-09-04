# Raimovdental Agents satellite

**DEC-783 / DEC-784 / TASK-777**

| Role | Repo | Path |
|------|------|------|
| Cursor Agents (Mobile/Cloud) | `zaomir/raimovdental` | `/var/www/raimovdental` |
| Production SSOT + deploy | `zaomir/grainee-v2` | `/var/www/grainee-v2` |

## Cursor setup

**Full guide:** [`CURSOR_AGENTS_SETUP.md`](./CURSOR_AGENTS_SETUP.md)

1. Cursor Dashboard → Cloud Agents → Environment for repo **`zaomir/raimovdental`**
2. Mobile/Agents: always pick project **raimovdental** (not grainee-v2) for clinic-only
3. Desktop: this repo folder **or** grainee `raimovdental.code-workspace`

## Sync (bidirectional)

Updates flow **both ways**. Edit in either repo — cron (every 10 min on VDS) or manual sync keeps them aligned.

```bash
cd /var/www/grainee-v2
bash scripts/raimov/sync-agents-bidirectional.sh                 # dry-run
bash scripts/raimov/sync-agents-bidirectional.sh --apply --commit --push
bash scripts/raimov/install-agents-sync-cron.sh                  # VDS: /etc/cron.d/raimov-agents-sync
```

Cron canon: `deploy/cron.d/raimov-agents-sync` (every 10 min, `flock /tmp/raimov-agents-sync.lock`, log `/var/log/raimov-agents-sync.log`).

Policy: per-file hash vs last state; one-side change wins; true conflicts → protected paths prefer grainee, else newer mtime. See DEC-784.

## Daily use

1. Agents / Mobile: project **raimovdental**  
   Desktop IDE: `raimovdental.code-workspace` or the Agents repo folder  
2. Commit in that repo (or in grainee under Raimov paths)  
3. Wait for cron **or** run the sync command above  
4. Deploy **only** from grainee-v2

## Desktop IDE only

`raimovdental.code-workspace` — multi-root without Cloud Agents split.
