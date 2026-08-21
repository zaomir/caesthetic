---
owner: CAESTHETIC / platform ops
status: active
created: 2026-08-16
authority: DEC-834
---

# CAESTHETIC Asset Worker — Dropbox → VDS renderer → Huck

**Runner:** `scripts/caesthetic/asset-worker/worker.mjs`  
**Storage:** `/opt/caesthetic-assets/` on **VPS2402** (`185.216.214.28`, hostname `vps2402`)  
**Cloud:** existing rclone remote `dropbox:` (no new Dropbox App, no tokens in GitHub)  
**Forbidden host:** Grainee VDS `.121` / `vdska` (DEC-836)

## Pipeline

```
Dropbox
  CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/{01-pose-library,02-clean-plates}
  (pose library = 8 canonical situations; clean plates = 31 scene warehouse;
   full inventory: docs/ssot/CAESTHETIC_VALERIE_AVATAR_LIBRARY.md)
        │ read (rclone)
        ▼
VPS2402  /opt/caesthetic-assets/{input,processing,output,generated}
        │ VALERIE_EDITORIAL_STORY_CARD_V2
        ▼
Dropbox
  CAESTHETIC/CAESTHETIC MEDIA/Huck/{stories,reels,thumbnails,archive}/<request_id>/
```

Google Drive is **not** the write target. Client preview stays Drive if needed; production write is server + Dropbox mirror.

## ChatGPT (no SSH, no Dropbox tokens)

Write on `main`:

`docs/agent-api/requests/{request_id}.json`

```json
{
  "request_id": "cae-assets-week-20260817",
  "type": "caesthetic_assets",
  "created_at": "2026-08-16T00:00:00Z",
  "requested_by": "chatgpt",
  "operation": "render_stories",
  "source": "Dropbox",
  "params": {
    "folder": "Valerie-avatar-plates",
    "template": "VALERIE_EDITORIAL_STORY_CARD_V2",
    "dest_kind": "stories",
    "cards": [
      {
        "photo": "vcp-001-bookshelf-smile.png",
        "asset_role": "editorial_opener",
        "headline": "DON'T BUY MORE LEADS YET",
        "highlight": "LEADS",
        "support": "Check what happens to the demand you already have.",
        "episode": 1
      }
    ]
  }
}
```

Then read `docs/agent-api/results/{request_id}.json` (`status=success`, `data.dropbox_dir`, `data.files`).

`cards[].photo` is mandatory and must be an exact basename returned by `list_source`. The worker never interprets `random`, a path, or a missing photo as permission to choose an image. For pipeline assembly, use one of the allowlisted `asset_role` values: `editorial_opener`, `evidence_explanation`, `pause_trigger`, `closing_card`; output names are then stable (`001-editorial_opener.png`, and so on).

Template: `docs/agent-api/templates/TEMPLATE.caesthetic_assets_render.json`

| Channel | Role |
|---------|------|
| VPS2402 cron `*/2` | Polls `type=caesthetic_assets` requests, runs worker, commits result. Refuses to run on `.121`. |
| Cursor on VPS2402 | `node scripts/caesthetic/asset-worker/worker.mjs …` directly |
| `target=caesthetic` deploy | Installs `/etc/cron.d/grainee-caesthetic-assets` on VPS2402 |
| Agent API Bridge GHA | Skips this type on GitHub-hosted runners (no rclone there) |

## Operations

| operation | Params | What |
|-----------|--------|------|
| `healthcheck` | — | rclone + folders + renderer |
| `list_source` | `folder` | File names in allowlisted plates dirs |
| `render_stories` | `cards[]`, `template`, `folder` | Pull, render PNG, write Huck |

## Observability and retry

- The poller first publishes `status=processing` with `worker.stage=received`, `started_at`, `heartbeat_at`, `attempt`, and `repo_sha`; the same result then becomes `success` or `error`.
- Final results include the terminal stage, duration, and an actionable error hint. `missing_photo` is a request-contract failure, not a sleeping worker.
- VPS2402 heartbeat: `/opt/caesthetic-assets/status/poller.json` (`idle`, `processing`, or `error`; includes `hostname`; no secrets). `healthcheck` returns this poller state together with rclone folder, renderer, and `host.canonical`.
- A `processing` result older than 30 minutes is eligible for one recovery pass on the next cron tick. Terminal `error` results are immutable evidence: correct the request and submit a new `request_id` rather than looping the same invalid job.
- Poller commit/push failures are terminal non-zero errors and are recorded in the local heartbeat; it never reports `committed: true` unless Git commit and push succeeded.

On-demand heartbeat request: `docs/agent-api/templates/TEMPLATE.caesthetic_assets_healthcheck.json`.

## Allowlist (deny-by-default)

- Source folders: `Valerie-avatar-plates` / `pose-library` / `clean-plates`
- Dest: `stories` \| `reels` \| `thumbnails` \| `archive` under `Huck/`
- Template: `VALERIE_EDITORIAL_STORY_CARD_V2` only
- Photo: basename `*.png`/`*.jpg` only, no `..`
- Asset role: optional allowlisted enum; no arbitrary output filename/path
- Max 20 cards / job
- Forbidden request keys: `command`, `shell`, `exec`, `path`, `url`, `rclone_flags`, `dest`, …

## Cursor / VPS2402

```bash
# Must be hostname vps2402 / 185.216.214.28
bash scripts/caesthetic/asset-worker/install-vps2402.sh
node scripts/caesthetic/asset-worker/worker.mjs healthcheck --json
node scripts/caesthetic/asset-worker/worker.mjs list_source --json
node scripts/caesthetic/asset-worker/worker.mjs render_stories \
  --job docs/projects/caesthetic/operations/ig-growth/editorial-story-card/huck-mvp-10.json
```

Secrets stay on VPS2402 (`rclone.conf`). Do not put `DROPBOX_TOKEN` in git, ChatGPT, or GitHub Secrets. Do not send `target=all` to “wake .121”.

## Related

- Geometry: `docs/ssot/CAESTHETIC_IG_EDITORIAL_STORY_CARD.md` (DEC-833)
- rclone: `docs/ssot/RCLONE_CLOUD_STORAGE.md`
- ChatGPT ops: `docs/ssot/CHATGPT_SERVER_OPS.md`
