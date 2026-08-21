---
owner: CAESTHETIC
status: active
version: 1.1
updated: 2026-08-17
scope: Instagram Story Daily Growth Note series and reusable video template
parent: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
authority: DEC-832
---

# CAESTHETIC · Daily Growth Note

Canonical Instagram Story video series for `@caesthetic.growth`. Episode 001 is the first published unit and the reusable template.

## Scene types (locked order)

`AVATAR_STATIC_HOOK` → `GENERATED_VIDEO` → `TEXT_CARD` → `GENERATED_VIDEO` → `TEXT_CARD_CLOSE`

## Shared files

| Role | Path |
|------|------|
| Text Card component | `docs/projects/caesthetic/operations/ig-growth/daily-growth-note/config/text-card.v1.json` |
| Series defaults | `docs/projects/caesthetic/operations/ig-growth/daily-growth-note/config/series.v1.json` |
| Episode | `docs/projects/caesthetic/operations/ig-growth/daily-growth-note/episodes/NNN-*.yaml` |
| Renderer | `scripts/caesthetic/render-daily-growth-note.py` |

Next episode: copy the YAML, change `episode_number`, `avatar_asset`, hook, prompts, two card texts, `cta`. Do **not** copy Text Card visual values into the episode.

## Episode 001 rules

- One CTA on the final card only: `GET YOUR GROWTH SCORE`.
- No CTA on opener, Motion Insight, Evidence or Pause Trigger cards.
- No named clinic, no recognizable patient, no invented loss/revenue.
- Contrarian hook: `DON'T BUY MORE LEADS YET.`
- Path shown: Search → Website → Booking → Response.

## Evidence / Explanation lock

- Default is a cream editorial information card with headline, explanatory
  text, logo and episode marker.
- Add a diagram, chart or real redacted artifact only when it materially
  explains or proves the point.
- If no relevant artifact exists, use headline + explanatory text only.
- Valerie portraits are not filler for Evidence cards.
- One card contains one takeaway; burgundy highlights one phrase.
- Final CTA remains separate on `TEXT_CARD_CLOSE`.

## Visual lock

Text Card v1: cream `#F0EDE6`, navy `#0B2438`, burgundy accent `#7B244B`, IBM Plex Sans Semibold, headline top offset **520px**, margins **88px**. Change only by cutting `text-card.v2.json` + a new DEC.
