# Cursor Agents setup — raimovdental clinic

**DEC-783 / DEC-784.** Satellite: [`zaomir/raimovdental`](https://github.com/zaomir/raimovdental).

## Goal

Clinic-only chats in Cursor Mobile / Cloud Agents without loading the full grainee-v2 monorepo.

## One-time: connect the repo in Cursor

### A. Cloud Agents Environment (recommended for Mobile/Cloud)

1. Open [Cursor Dashboard → Cloud Agents → Environments](https://cursor.com/dashboard/cloud-agents).
2. **Create environment** (or edit) with repository **`zaomir/raimovdental`** (not grainee-v2).
3. Install / start: use repo `.cursor/environment.json` (Node check only; no long-running start).
4. Secrets: none required for docs/HTML clinic work. Add deploy/GitHub secrets only on **grainee-v2** environment if needed for deploy agents.
5. Save → wait for environment build to succeed.

### B. Mobile / Agents picker

1. Start a new Agent.
2. Select project **`raimovdental`** / repo `zaomir/raimovdental`.
3. Do **not** select grainee-v2 for clinic-only tasks.

### C. Desktop IDE

- Option 1: open cloned `zaomir/raimovdental` folder.
- Option 2 (multi-root from monorepo): open `raimovdental.code-workspace` inside grainee-v2.

## Daily flow

```
Edit in Cursor Agents (raimovdental)
        │
        ▼
  git commit + push (this repo)
        │
        ▼
  sync ↔ grainee-v2 (cron 10 min or manual)
        │
        ▼
  deploy only from grainee-v2
```

Manual sync (on VDS / grainee checkout):

```bash
cd /var/www/grainee-v2
bash scripts/raimov/sync-agents-bidirectional.sh --apply --commit --push
```

## Agent cold start in this repo

1. `START.md`
2. `AGENTS.md`
3. `docs/expert-clinic-reference.md`

## Smoke after setup

- [ ] New Cloud Agent on **raimovdental** sees `site-raimovdental/`, `docs/raimov/`, `research/raimov-profile/`
- [ ] Agent reads `START.md` without asking for grainee paths
- [ ] Commit lands on `zaomir/raimovdental` `main`
- [ ] Within ~10 min (or after manual sync) same files appear on grainee-v2 under mirrored paths

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Agent opens huge monorepo | Wrong project — switch to `raimovdental` |
| Changes missing on prod | Sync ran? Deploy only from grainee after sync |
| Conflict on protected file | Protected paths prefer grainee (DEC-784) |
| Environment build fails | Check `.cursor/environment.json`; Node 22+ on snapshot |

## Related

- `docs/raimov/AGENTS_SATELLITE.md`
- `docs/raimov/AGENTS_REPO_SYNC.md`
- `docs/expert-clinic-reference.md` § Cursor Agents satellite
