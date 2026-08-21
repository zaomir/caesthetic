---
owner: CAESTHETIC
status: active
version: 2.0
updated: 2026-08-16
scope: Instagram Story still-card on Valerie pose-library plates
parent: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
authority: DEC-833
---

# CAESTHETIC · Valerie Editorial Story Card V2

Canonical still-card for `@caesthetic.growth` Daily Growth Note photos. Separate from the video Text Card (DEC-832).

## Files

| Role | Path |
|------|------|
| Locked geometry | `docs/projects/caesthetic/operations/ig-growth/editorial-story-card/VALERIE_EDITORIAL_STORY_CARD_V2.json` |
| Preview copy | `editorial-story-card/pose-library-preview.json` |
| Renderer | `scripts/caesthetic/render-editorial-story-card.py` |
| Asset worker | `scripts/caesthetic/asset-worker/` (Dropbox → `/opt/caesthetic-assets` → `Huck`) |
| Source plates | Dropbox `Valerie-avatar-plates` — inventory `docs/ssot/CAESTHETIC_VALERIE_AVATAR_LIBRARY.md` |
| Renders | `footage/valerie-pose-library/_editorial-v2/` · production write: Dropbox `Huck/stories/` |

```bash
python3 scripts/caesthetic/render-editorial-story-card.py
node scripts/caesthetic/asset-worker/worker.mjs render_stories \
  --job docs/projects/caesthetic/operations/ig-growth/editorial-story-card/huck-mvp-10.json
```

## Layouts

Only two:

1. `SIDE_EDITORIAL_LEFT` / `SIDE_EDITORIAL_RIGHT` — preferred when a side has ≥32% safe negative space.
2. `BOTTOM_EDITORIAL` — fallback when the subject fills the width (close-up, two people, raised arm).

Brand lockup is fixed: **x=72, y=92**. Do not shift it per photo.

## Frozen vs episode

Do not change between episodes: logo position/size, series label position, fonts, navy `#0B2438`, burgundy `#7B244B`, accent-line 48×3, SIDE `headlineY=430`, BOTTOM panel ratio and `headlineY=1424`.

Change only: photo, headline, one highlighted phrase, supporting text, episode number, SIDE vs BOTTOM by composition.

## Priority

`PHOTO → PERSON → MESSAGE → BRAND`

Text never covers face, eyes, or a second person. Cream gradient/panel is editorial, not a Canva card.

Daily Growth Note video Text Card remains `daily-growth-note/config/text-card.v1.json`.
