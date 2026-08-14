# CAESTHETIC scripts

| Script | Job |
|--------|-----|
| `../sync-caesthetic-docs.sh` | One-way Dropbox → `docs/caesthetic/` (`dropbox:` remote on VDS; see `docs/caesthetic/README.md`) |
| `seed-ig-students-w34.py` | **PHASE1_FAIL_CLOSE** — Seed `Audience_IG_Students` + W34 DRAFT (needs `CAE_PHASE0_STUDENT_VOC_ALLOW=1`) |
| `render-ig-voc-batch.py` | **PHASE1_FAIL_CLOSE** — student VOC carousels `COPY-VOC-*` |
| `sync-ig-voc-dropbox.sh` | **PHASE1_FAIL_CLOSE** — Dropbox sync for `COPY-VOC-*` |
| `lib/phase1_fail_close.py` / `.mjs` | Shared refuse helper (`PHASE1_FAIL_CLOSE`) |
| `render-ig-w34-visuals.py` | Render Clinical Editorial IG slides/reel/stories → `tmp/cae-ig-w34/` then rclone to Dropbox |
| `growth-score-engine.mjs` | Thin CLI over the canonical Growth Score module and shared real/demo renderer; schema-v2 examples live under `site-caesthetic/score/demo-*/report.json` |
| `cae_ig_dolphin_current_dryrun.mjs` | Phase-1 dry-run against registry `CURRENT.json` / `CAE_MEDSPA_IG_FINAL_V1` (deny overlay + wave). `--dolphin-control-plane` = start/stop only. Instagram writes forbidden (DEC-819). |
| `cae_ig_build_dolphin_queue.mjs` | Build private SBO/Dolphin coverage queue from candidate **1441** (−deny) + TASK-814 strong-first ranking → `tmp/cae-ig-queue/` + Dropbox `cae-ig-dolphin-queue/`. Not CURRENT authority. |
| `cae_ig_run_coverage_day_guarded.sh` | Timer entry: flock + skip-on-block + AM/PM caps. |
| `cae_ig_run_coverage_day.sh` | Full DEC-824 day: rebuild queue → proxy-preflight → start → `run-cae-ig-coverage-day-833304152.mjs` (story/like/follow caps) → stop. |
| `../services/social-browser-operator/scripts/run-cae-ig-coverage-day-833304152.mjs` | SBO coverage runner (story-view first). Replaces follow-only day1 as default. |
| `us_spa_ig_dolphin_phase1_dryrun.mjs` | Legacy dated-export dry-run (DEC-818 fixtures). **Not** execution authority. |

**Project docs in git are read-only mirrors.** Edit via Dropbox `CAESTHETIC/feedback/FEEDBACK_LOG.md`, not in `docs/caesthetic/`.

Visuals are **not** committed to git — Dropbox `SIMON_OPS/content/B_CAE_IG/{copy_id}/`.

Phase-1 IG canon: `docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md` §12.1. Student/VOC publish path is fail-closed by default.
