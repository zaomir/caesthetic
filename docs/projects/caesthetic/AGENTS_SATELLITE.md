# CAESTHETIC Agents satellite

**DEC-829 / TASK-822** (pattern: DEC-783 / DEC-784)

| Role | Repo | Path |
|------|------|------|
| Cursor Agents (Mobile/Cloud) | `zaomir/caesthetic` | `/var/www/caesthetic` |
| Production SSOT + deploy | `zaomir/grainee-v2` | `/var/www/grainee-v2` |

## Cursor setup

**Full guide:** [`CURSOR_AGENTS_SETUP.md`](./CURSOR_AGENTS_SETUP.md)

1. Cursor Dashboard → Cloud Agents → Environment for repo **`zaomir/caesthetic`**
2. Mobile/Agents: always pick project **caesthetic** (not grainee-v2) for CAESTHETIC-only
3. Desktop: this repo folder **or** grainee `caesthetic.code-workspace`

## Sync (bidirectional)

Updates flow **both ways**. Edit in either repo — the VPS2402 systemd timer detects remote changes within 15 seconds and reconciles them without GitHub Actions.

```bash
cd /var/www/grainee-v2
bash scripts/caesthetic/sync-agents-bidirectional.sh                 # dry-run
bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push
bash scripts/caesthetic/install-continuous-sync.sh                   # VPS2402: systemd timer, 15 s
```

Runtime canon: `caesthetic-repo-sync.timer` + `caesthetic-repo-sync.service` (15 seconds, `flock /run/lock/caesthetic-repo-sync.lock`). Reconciliation uses isolated checkouts under `/var/lib/caesthetic-repo-sync/`, never the production checkout. The installer removes the retired 10-minute cron so the two schedulers cannot race.

Policy: per-file hash vs last state; one-side change wins; true conflicts → protected paths prefer grainee, else newer mtime. See DEC-829.

Not mirrored (public-safe exclusions): `site-caesthetic/private/`, unlisted real score slug, `docs/projects/caesthetic/clients/`, and IG footage binaries.

## Daily use

1. Agents / Mobile: project **caesthetic**
   Desktop IDE: `caesthetic.code-workspace` or the Agents repo folder
2. Commit in that repo (or in grainee under CAESTHETIC paths)
3. Wait up to 15 seconds **or** run the sync command above
4. Deploy **only** from grainee-v2
