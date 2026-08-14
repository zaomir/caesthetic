# caesthetic — Cursor Agents satellite

**Purpose:** Isolated GitHub project for Cursor Agents (Desktop/Mobile/Cloud) on CAESTHETIC.

**Production SSOT:** [`zaomir/grainee-v2`](https://github.com/zaomir/grainee-v2) at `/var/www/grainee-v2`.  
Deploy, DNS, forms and live site always ship from **grainee-v2** `main`.

**Live site:** https://caesthetic.com

## Cursor setup (one-time)

See **[`docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md`](docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md)**.

Short version: create a Cloud Agents Environment for **`zaomir/caesthetic`**, then always pick project **caesthetic** for CAESTHETIC chats.

## Flow

```
Cursor Agents (this repo)  ↔sync↔  grainee-v2  --deploy-->  caesthetic.com
```

Bidirectional sync (DEC-829) — VDS cron every 10 min or:

```bash
cd /var/www/grainee-v2
bash scripts/caesthetic/sync-agents-bidirectional.sh                 # dry-run
bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push
```

## Layout

Paths mirror grainee-v2 relative roots (see `SYNC_MANIFEST.yml`).

## Hard rules

- Do not put secrets or client-identifiable data here.
- `site-caesthetic/src/config/pricing.ts` is protected — same gates as grainee.
- `site-caesthetic/private/` is **not** mirrored (other brands).
- Do not deploy from this repo. Sync → grainee → existing deploy channels.

## Cold start

1. `START.md`
2. `AGENTS.md`
3. `docs/ssot/CAESTHETIC.md`
4. `docs/projects/caesthetic/AGENTS.md`
5. `agents/manifests/caesthetic.yaml`
