---
owner: CAESTHETIC
status: on_hold_legacy_adapter
version: 1.0
updated: 2026-08-15
scope: Daily Template Reel factory for @caesthetic.growth
parent: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
authority: DEC-831
---

# CAESTHETIC IG Template Reel Factory

> **V3 HOLD (DEC-838, 2026-08-18):** this DEC-831 factory is not authorized for
> new production until a versioned revalidation aligns it with Reel System V3.
> Its fixed `24–30s` timing, continuous Valerie circle, `4–6s` end card,
> bio-only/comment-keyword prohibition, daily volume and no-per-Reel review
> rules cannot override
> `CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` v3.0. Existing artifacts may
> remain archived/traceable; do not use this file to start or change a batch.

Daily Reels for `@caesthetic.growth` (`B_CAE_IG`). One locked composition. Only background video and weekly-approved texts change.

This line does **not** replace carousels, L5/L7 still-cards, city L8, or weekday Stories.

## 1. Locked composition (do not change per Reel)

Canvas: **1080×1920**, 24–30s, 24fps, H.264.

| Slot | Frozen value |
|------|----------------|
| Logo | Wordmark `CAESTHETIC`, x=80, y=96. IBM Plex Sans 600, 22px, tracking 0.18em, uppercase. Color: `--cae-accent` on light / `--cae-text-strong-on-dark` on dark. |
| Text block | Lower third, left x=80. Headline starts ≈ **y=1180–1240**. Face stays clear above the type. Bottom of type above **y=1700**. |
| Type | IBM Plex Sans Bold, 78–92px, **all caps**. White body. **Accent words** in burnt sienna `#C45C32` (the one or two words that carry the hook). Kicker: IBM Plex Sans 20px. End URL: IBM Plex Sans 28px. |
| Primary stills | Same Valerie, new pose/setting each beat. Full-frame photograph, not a paper card. Lower-third gradient so type reads. |
| Name chip | `// VALERIE PETRA` navy plate, bottom-left, above IG UI. |
| Avatar circle | Diameter **280**. Left **64**. Bottom edge at **y=1640** (above 280px IG caption/UI). 3px cream ring. Valerie Petra head+shoulders only. |
| Right rail | Keep x>960 clear (IG like/comment). Avatar stays left. |
| End card | Last 4–6s: `Free Growth Score` + `caesthetic.com/growth-score`. Same type and insets. |
| Audio | One spoken track: HeyGen Valerie = voiceover. Optional music bed ≤ −20 dB. No trending-audio dependence. No second voice. |

Visual canon remains Clinical Editorial Intelligence (`site-caesthetic/DESIGN.md`). No spa pink, gold, AI glow, fake dashboards, beauty-treatment stock.

## 2. What changes

| Slot | Source |
|------|--------|
| Background / pose | New Valerie still (or short generated plate of the same Valerie) per beat. Same face, new pose and setting. |
| On-screen lines | Weekly pack. One sentence on screen at a time. Hook readable at 0:00 with sound off. |
| VO / avatar speech | Same weekly script. Avatar lip-syncs this track for the full duration. |
| Caption + first comment + 3–5 hashtags | Weekly pack. English. CTA = bio Growth Score. |

## 3. Weekly pack → daily publish

```text
Sunday   agent drafts 5–7 units from OWNER_MARKETING_QUESTIONS / locked L-scripts
         founder APPROVED = texts + background prompts only
Mon–Sun  one assemble + publish per calendar day from the pack
         no per-Reel visual review (gate C)
Stories  unchanged: 1–4 weekday frames; may clip yesterday’s Reel
```

Default pack size: **5** (Mon–Fri). 6–7 only if the approved pack has extra units. Never two Template Reels on the same day.

US-hours publish window. Account: Dolphin `833304152`.

## 4. Unit schema

```yaml
id: CAE-TR-YYYY-MM-DD
publish_date: YYYY-MM-DD
question_id: Q05          # or L5 / L7
objective: one owner question
hook_text: "…"            # on screen 0:00
lines:
  - { t: "0.0-3.5", text: "…" }
vo_script: |
  …
bg_prompt: |
  …
caption: |
  …
first_comment: "Free Growth Score — link in bio."
hashtags: [medspa, practicegrowth, aestheticclinic]
do_not_say: []
status: draft | approved | assembled | published
```

Pack files: `docs/projects/caesthetic/operations/ig-growth/template-reels/WXX-YYYY-MM-DD.yaml`.

## 5. Background prompts — hard reject

Allowed: cream/off-white office, paper, desk, laptop (no readable UI), dusk city glass, empty corridor, phone on desk with no UI text, soft daylight, slow camera, no faces, no logos, no clinic names.

Reject and regenerate: spa pink, gold, neon SaaS, glowing charts, invented dashboards, injectables, before/after, smiling patients, readable Google/IG UI, watermarks, extra faces besides the locked avatar circle.

Engine: short text-to-video (Seedance-class or equivalent). Prompt is part of the weekly APPROVED pack.

## 6. Compliance (still automatic after APPROVED)

Gate `08` production/thumbnail founder review is **waived for this line** once the weekly pack is APPROVED. Still fail-closed:

- `scripts/guards/cae-phase1-banned-terms.mjs`
- no invented ratings, revenue, ranks, client names, or results
- no PHI, no Toxifillers/SKU, no student VOC, no Comment FIRST/NEXT
- estimates labeled; Class A only when the line is an observable public pattern
- CTA = `https://caesthetic.com/growth-score/` via bio

## 7. Assembly order (after APPROVED)

1. Generate background from locked `bg_prompt`.
2. Generate HeyGen Valerie take from locked `vo_script` (circle crop).
3. Composite into the frozen template: bg → dim → texts → logo → avatar circle → end card.
4. Burn the on-screen lines (they are the captions). Export 1080×1920.
5. Publish caption from the pack. Log IG URL + UTC on the unit.
6. Next day: optional Story clip from the published Reel.

First W34 render calibrates pixels. Drift is a template fix, not a per-Reel exception.

## 8. What this is not

- Not a replacement for launch-grid pins or Monday diagnostic carousels.
- Not a Valerie walkthrough (`CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`).
- Not a continuous full-frame avatar (HeyGen still produces only the circle plate).
