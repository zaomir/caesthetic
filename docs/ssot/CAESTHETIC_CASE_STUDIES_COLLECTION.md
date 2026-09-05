---
owner: CAESTHETIC
status: active
version: 1.0
updated: 2026-09-05
scope: Operating program for finding, filling, covering and publishing CAESTHETIC case studies
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md
  - docs/caesthetic/case_study_intake_template.md
  - site-caesthetic/case-studies/README.md
---

# CAESTHETIC case studies collection

This is the operating program for the public library at `https://caesthetic.com/case-studies/`. It does not weaken `docs/ssot/CAESTHETIC.md`: **no fake client proof**. Invented US client results must never be labeled Verified or Client-reported.

## 1. Two tracks

| Track | What it is | Evidence label | Attribution | Public name |
|---|---|---|---|---|
| **A — Real case** | CAESTHETIC did the work; written permission exists | `verified` or `client_reported` | claimed only to the evidence | Full name, city-type, or anonymized per permission |
| **B — Pattern study** | Public-path reconstruction; CAESTHETIC diagnosed and modeled, did not run the clinic CRM | `modeled` | `not_claimed` | Anonymized practice. Internal legal name stays off the public snapshot |

Track B may fill missing public-path fields with a **modeled** operating scenario. It may not present that scenario as a client win. Catalog copy must keep the Modeled label visible.

Do not whitelist a single slug. Future Track A cases must appear. Hide only synthetic records (`id` matching `/^test[-_]/i` or title matching `/^TEST\b/i`).

## 2. Collection loop

1. **Search** public sources in the geo/niche queue. Use open sources only.
2. **Qualify.** Aesthetics / dermatology / dental / adjacent legal. No realty, beauty-salon-as-category, infobusiness, e-commerce, Toxifillers/supply.
3. **Fill** the intake field map (`docs/caesthetic/case_study_intake_template.md` for Track A; this file’s Track B rules for modeled studies).
4. **Generate and place the niche cover** (mandatory before the case is done — §3).
5. **Publish** through Case Intake `mode=publish`. Confirm `catalogVisible: true` and the public URL.
6. **Smoke** catalog, public-cases JSON, detail URL, cover `200`, `img[src]` is the case WebP, no TEST titles, no withheld names.

Internal intake UI is not public on `caesthetic.com`. Working origin is the configured `caseIntakeOrigin`. Public reads go through `GET /case-studies/intake/api/public-cases` (Cloudflare proxy strips TEST records).

## 3. Cover generation and placement (mandatory)

Images are optional for the intake *publish-barrier*. They are **required in this program** before a case is considered shipped.

After the public slug exists:

1. Generate a **4:3 editorial still life** relevant to the niche (med spa, derm, dental, adjacent legal).
2. Save `site-caesthetic/assets/case-studies/covers/{slug}.webp`.
3. Register `case.{slug}.cover` in `site-caesthetic/media/registry.json` (`state: approved`, `allowed_channels` includes `public`, routes `/case-studies/` and `/case-studies/case/`).
4. Bump `media-registry.js` and case-study script `?v=`.
5. Run `node scripts/caesthetic/check-case-cover.mjs {slug}`.
6. Deploy CAESTHETIC (static + Worker if the router changed).

Frontend resolves `case.{slug}.cover` first, then `item.mediaId`. Do not retarget shared `case.placeholder.*` IDs — TEST and live cases must not share a documentary cover.

### Prompt (generate this image)

Use an image model. Keep the same constraints every time:

```text
Photoreal editorial still life, 4:3 landscape. Quiet professional interior for a {niche} practice in {city}.
Empty room. No people, no faces, no hands, no bodies, no mannequins.
No logos, no brand marks, no letters, no numbers, no readable screens, no fake dashboards.
No clinical before/after, no treatment on skin, no identifiable clinic exterior or street number.
Metaphor of the case constraint: {one visual metaphor, objects only}.
Soft daylight, restrained palette, no watermark, no caption.
```

Print a filled prompt with `node scripts/caesthetic/check-case-cover.mjs {slug} --prompt --niche "…" --city "…" --metaphor "…"`.

Reject and regenerate if the file contains people, logos, or readable text.

## 4. Geo and niche queue

Priority geos: United States first, then United Kingdom, then Paris / France. Niches: med spa / aesthetics, dermatology, dental, adjacent legal only when the operating pattern transfers and the vertical is labeled.

Current public library: one Track B case, `miami-concierge-medspa-consult-path` (CASE-2026-E66B0DF7). Catalog stays `noindex` until a permissioned Track A case exists.

## 5. Evidence and QA

- Headline metric needs definition, baseline, after, denominator, windows, source, limitations, CAESTHETIC role.
- Track A: permission, typicality/FTC note, no invented quotes.
- Track B: `modeled` + `not_claimed`; strip the internal legal name, owner names, review counts, price quotes, and other identifiers from the public snapshot.
- Public JSON must not leak withheld names.
- TEST / fixture records must not appear on `caesthetic.com/case-studies/` or `/case-studies/case/?id=`.

## 6. Done

A case is done only when: published snapshot is live, TEST filter holds, niche cover WebP is `200` on the case page `img[src]`, and production smoke is recorded.
