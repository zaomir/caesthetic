# CAESTHETIC case studies


The catalog and Full Case Page render only immutable snapshots returned by Case Intake's published-case API. Drafts, review records and TEST fixtures never appear as a public fallback.


Operating program (search → fill → niche cover → publish → smoke): `docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md`.


## Content source


- Published records: `/case-studies/intake/api/public-cases`
- Legacy publication contract: `/assets/data/case-study.schema.json`
- Media registry: `/media/registry.json`
- Neutral editorial assets: resolved through `/media/registry.json`
- Rendering logic: `/assets/js/case-studies.js`
- Reusable case route: `/case-studies/case/?id=<published-slug>`
- Case-detail rendering logic: `/assets/js/case-study-detail.js`
- Registry resolver: `/assets/js/media-registry.js`


The page and case data refer only to stable semantic `media_id` values. Replace an image by changing its registry entry; do not hardcode a new path into HTML or public case JSON.


## Publish a case


1. Follow `docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md` (Track A permissioned work or Track B modeled study).
2. Confirm the case narrative, metric definition, baseline, denominator, timeframe, limitations, data source and CAESTHETIC relationship to the work.
3. Generate a niche-relevant 4:3 editorial still life (no people, logos, or readable text). Save `site-caesthetic/assets/case-studies/covers/{slug}.webp` and register `case.{slug}.cover`.
4. Run `node scripts/caesthetic/check-case-cover.mjs {slug}`.
5. Complete the Russian Case Intake form and choose “Опубликовать”.
6. Confirm the response contains `catalogVisible: true` and a public URL.
7. Confirm desktop and mobile visual QA. Keep `noindex` until a permissioned Track A case is live.


## Release blockers


- Do not add these routes to the sitemap until the first real, approved case and public-approved media are live.
- Do not publish invented client names, patients, testimonials, dashboards, metrics or medical outcomes.
- A save to draft or review must never overwrite the active public snapshot.
- A record cannot become a shipped catalog case without a clean slug, comparable baseline/outcome definitions, denominator, dates, budget context, practice contribution, limitations, data source, attribution class, the correct evidence label, and a registered niche cover. Track A also requires approved client permission. Published cases must be real and approved for publication.
