# CAESTHETIC project docs (read-only mirror)

**Do not edit files in this directory in git.** They are a one-way mirror from Dropbox.

| Role | Location |
|------|----------|
| **Repository master authority** | `docs/ssot/CAESTHETIC.md` |
| **Dropbox working source / provenance** | Dropbox `CAESTHETIC/docs/` (+ `CAESTHETIC/00_PIPELINE_PROTOCOL.md`) |
| **Feedback / change requests** | Dropbox `CAESTHETIC/feedback/FEEDBACK_LOG.md` |
| **Git mirror (this folder)** | `docs/caesthetic/` — for agents, search, and code review only |

Edits made here (except this README) are overwritten on the next `rclone sync`. Pipeline rules: `00_PIPELINE_PROTOCOL.md`.

## Sync from Dropbox (VDS)

```bash
./scripts/sync-caesthetic-docs.sh          # manual: sync + commit if changed
CAESTHETIC_SYNC_AUTO_PUSH=1 ./scripts/sync-caesthetic-docs.sh   # also git push
```

**rclone remote on VDS:** `dropbox:` (not `caesthetic-dropbox`). Override only if needed:

```bash
CAESTHETIC_RCLONE_REMOTE='dropbox:' ./scripts/sync-caesthetic-docs.sh
```

Config: `/root/.config/rclone/rclone.conf` — never commit. SSOT: `docs/ssot/RCLONE_CLOUD_STORAGE.md`.

## Automated sync

Daily cron on VDS `.121`: `vds/cron/caesthetic-docs-crontab.txt` → `/etc/cron.d/grainee-caesthetic-docs` (06:00 UTC).

- `CAESTHETIC_SYNC_AUTO_PUSH=1` — **intentional**: commits/pushes to `main` without PR review. Scope is this Dropbox-owned markdown only.
- Failure observability:
  - `/var/log/grainee/caesthetic-docs-sync.ok` / `.fail` heartbeats
  - Telegram via `notification-channels-probe` + `evo-promote-notify` (needs `TELEGRAM_BOT_TOKEN` + admin chat on edge/VDS — currently empty on host; until restored, rely on smoke log)
  - `scripts/cron/smoke-monitor.sh` (every 5 min) flags `CAESTHETIC_DOCS_SYNC_FAIL` / `_STALE` / `_MISSING_OK` in `/var/log/evo/smoke.log`

Logs: `/var/log/grainee/caesthetic-docs-sync.log`

## Index

Use this mirror for provenance and working detail only. Start repository product and architecture decisions at `docs/ssot/CAESTHETIC.md`; the mirrored `CAESTHETIC_SSOT.md` is legacy and may be overwritten by sync.
