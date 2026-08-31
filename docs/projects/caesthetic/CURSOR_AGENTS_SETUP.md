# Cursor Agents setup — CAESTHETIC

**DEC-829.** Satellite: [`zaomir/caesthetic`](https://github.com/zaomir/caesthetic).

## Goal

CAESTHETIC-only chats in Cursor Mobile / Cloud Agents without loading the full grainee-v2 monorepo.

## One-time: connect the repo in Cursor

### A. Cloud Agents Environment (recommended for Mobile/Cloud)

1. Open [Cursor Dashboard → Cloud Agents → Environments](https://cursor.com/dashboard/cloud-agents).
2. **Create environment** (or edit) with repository **`zaomir/caesthetic`** (not grainee-v2).
3. Install / start: use repo `.cursor/environment.json` (Node check only; no long-running start).
4. Secrets: none required for docs/HTML CAESTHETIC work. Add deploy/GitHub secrets only on **grainee-v2**.
5. Save → wait for environment build to succeed.

### B. Mobile / Agents picker

1. Start a new Agent.
2. Select project **`caesthetic`** / repo `zaomir/caesthetic`.
3. Do **not** select grainee-v2 for CAESTHETIC-only tasks.

### C. Desktop IDE

- Option 1: open cloned `zaomir/caesthetic` folder.
- Option 2 (multi-root from monorepo): open `caesthetic.code-workspace` inside grainee-v2.

## Daily flow

```
Edit in Cursor Agents (caesthetic)
        │
        ▼
  git commit + push (this repo)
        │
        ▼
  sync ↔ grainee-v2 (systemd timer ≤15 s or manual)
        │
        ▼
  deploy only from grainee-v2
```

Manual sync (on VDS / grainee checkout):

```bash
cd /var/www/grainee-v2
bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push
```

## Agent cold start in this repo

1. `START.md`
2. `AGENTS.md`
3. `docs/ssot/CAESTHETIC.md`
4. `docs/projects/caesthetic/AGENTS.md`

## Smoke after setup

- [ ] New Cloud Agent on **caesthetic** sees `site-caesthetic/`, `docs/projects/caesthetic/`, `docs/ssot/CAESTHETIC.md`
- [ ] Agent reads `START.md` without asking for grainee paths
- [ ] Commit lands on `zaomir/caesthetic` `main`
- [ ] Within 15 s plus Git fetch/push time (or after manual sync) the same files appear on grainee-v2 under mirrored paths
- [ ] `site-caesthetic/private/` is **absent** from the public satellite

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Agent opens huge monorepo | Wrong project — switch to `caesthetic` |
| Changes missing on prod | Sync ran? Deploy only from grainee after sync |
| Conflict on protected file | Protected paths prefer grainee (DEC-829) |
| Environment build fails | Check `.cursor/environment.json`; Node 22+ on snapshot |

## Related

- `docs/projects/caesthetic/AGENTS_SATELLITE.md`
- `docs/projects/caesthetic/AGENTS_REPO_SYNC.md`
- `docs/founder-notes/DEC-829.md`
