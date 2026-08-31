# CAESTHETIC scripts

| Script | Job |
|--------|-----|
| `install-continuous-sync.sh` | Installs the free VPS2402 systemd timer for bidirectional `grainee-v2` ↔ `caesthetic` reconciliation every 15 seconds. |
| `sync-agents-bidirectional.sh` | One reconciliation pass; hashes both sides, propagates edits and deletions, records conflicts, commits and pushes when requested. |
| `../sync-caesthetic-docs.sh` | One-way Dropbox → `docs/caesthetic/` (`dropbox:` remote on VDS; see `docs/caesthetic/README.md`) |
| `seed-ig-students-w34.py` | **PHASE1_FAIL_CLOSE** — Seed `Audience_IG_Students` + W34 DRAFT (needs `CAE_PHASE0_STUDENT_VOC_ALLOW=1`) |
| `render-ig-voc-batch.py` | **PHASE1_FAIL_CLOSE** — student VOC carousels `COPY-VOC-*` |
| `sync-ig-voc-dropbox.sh` | **PHASE1_FAIL_CLOSE** — Dropbox sync for `COPY-VOC-*` |
| `lib/phase1_fail_close.py` / `.mjs` | Shared refuse helper (`PHASE1_FAIL_CLOSE`) |
| `render-ig-w34-visuals.py` | Render Clinical Editorial IG slides/reel/stories → `tmp/cae-ig-w34/` then rclone to Dropbox |
| `hooppy-creative-pipeline.py` | Render five platform video files, QA/checksum, sync Dropbox + `CAE_Creative_Pipeline`, then schedule only from the founder-approved Sheet row. |
| `entertainment-rotation.py` | Watch the permanent entertainment inbox, append new videos to `CAE_Entertainment_Rotation`, and select the next fully cleared item without publishing. |
| `growth-score-engine.mjs` | Thin CLI over the canonical Growth Score module and shared real/demo renderer; schema-v2 examples live under `site-caesthetic/score/demo-*/report.json` |
| `cae_ig_dolphin_current_dryrun.mjs` | Phase-1 dry-run against registry `CURRENT.json` / `CAE_MEDSPA_IG_FINAL_V1` (deny overlay + wave). `--dolphin-control-plane` = start/stop only. Instagram writes forbidden (DEC-819). |
| `cae_ig_promote_current.py` | The only governed `CURRENT.json` writer. Validates the protected release policy and `execution_allowed=false`, then uses Dropbox revision compare-and-swap so stale/parallel writers fail closed. |
| `cae_wave1_public_enrich.py` | Public first-party enrichment for a private Wave pack. Records visibly published email/source evidence only; never guesses addresses; row-level output must stay outside Git. |
| `cae_wave1_no_write.py` | Builds a private draft manifest only after row owner/email/verification/suppression checks and global email, Score, reply-capacity and Sprint-payment gates. Execution and cold IG DM remain off. |
| `cae_linkedin_master_audit.py` | Standard-library XLSX audit for private LinkedIn masters. Writes aggregate evidence in Git and an optional row-level registry only outside the repository; never calls LinkedIn or sends messages. |
| `cae_ig_build_dolphin_queue.mjs` | Build private SBO/Dolphin coverage queue from candidate **1441** (−deny) + TASK-814 strong-first ranking → `tmp/cae-ig-queue/` + Dropbox `cae-ig-dolphin-queue/`. Not CURRENT authority. |
| `cae_ig_run_coverage_day_guarded.sh` | Timer entry: flock + skip-on-block + AM/PM caps. |
| `cae_ig_run_coverage_day.sh` | Full DEC-824 day: rebuild queue → proxy-preflight → start → `run-cae-ig-coverage-day-833304152.mjs` (story/like/follow caps) → stop. |
| `../services/social-browser-operator/scripts/run-cae-ig-coverage-day-833304152.mjs` | SBO coverage runner (story-view first). Replaces follow-only day1 as default. |
| `us_spa_ig_dolphin_phase1_dryrun.mjs` | Legacy dated-export dry-run (DEC-818 fixtures). **Not** execution authority. |

**Project docs in git are read-only mirrors.** Edit via Dropbox `CAESTHETIC/feedback/FEEDBACK_LOG.md`, not in `docs/caesthetic/`.

Visuals are **not** committed to git. Legacy single-surface assets use Dropbox
`SIMON_OPS/content/B_CAE_IG/{copy_id}/`; cross-platform Hooppy packages use
`SIMON_OPS/content/B_CAE_IG/{content_id}/{version}/{platform}/`.

Safe build example (no Hooppy post):

```bash
python3 scripts/caesthetic/hooppy-creative-pipeline.py manifest.json \
  --sync-dropbox --sync-sheet
```

After the founder sets `approved_publish=TRUE` on the exact rendered row:

```bash
python3 scripts/caesthetic/hooppy-creative-pipeline.py \
  --from-sheet CAE-VIDEO-001 v1 --schedule --sync-sheet
```

To publish only an explicitly approved destination, repeat `--platform` for
the approved subset. The worker still builds and checksums the full five-file
package, but it will create Hooppy posts only for the selected destinations:

```bash
python3 scripts/caesthetic/hooppy-creative-pipeline.py \
  --from-sheet CAE-VIDEO-001 v1 --schedule --sync-sheet \
  --platform instagram
```

Set `expected_master_sha256` in the manifest when approval applies to one exact
master file. A checksum mismatch stops before rendering, Sheet writes or upload.

`HOOPPY_BEARER_TOKEN` and the Google service-account JSON exist only on the
runtime host. `--schedule-dry-run` validates routing and payloads without an API
write.

Entertainment inbox discovery and rotation selection:

```bash
python3 scripts/caesthetic/entertainment-rotation.py --sync-inbox --select-next
```

Inbox discovery is not approval. The selector fails closed until rights, audio,
privacy, claims, visual QA and `approved_publish` are all green and every
platform-specific asset/caption is present. Scheduling still goes through
`hooppy-creative-pipeline.py`.

Phase-1 IG canon: `docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md` §12.1. Student/VOC publish path is fail-closed by default.
