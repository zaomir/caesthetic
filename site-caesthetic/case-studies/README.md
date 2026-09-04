# CAESTHETIC case studies

The catalog and Full Case Page render only immutable snapshots returned by Case Intake's published-case API. Drafts and review records never appear as a public fallback.

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

1. Confirm the case narrative, metric definition, baseline, denominator, timeframe, limitations, data source and CAESTHETIC relationship to the work.
2. Confirm image rights and, when people or clinical material are shown, documented consent and allowed channels.
3. Add the approved, versioned asset to the site asset library.
4. Update the existing `media_id` entry with the approved path, intrinsic dimensions, factual alt text, rights and consent status.
5. Complete the Russian Case Intake form and choose “Опубликовать”.
6. Confirm the response contains `catalogVisible: true` and a public URL.
7. Run `node scripts/caesthetic/check-case-study-contract.mjs`.
8. Complete desktop and mobile visual QA before adding the routes to the sitemap or removing `noindex`.

## Release blockers

- Do not add these routes to the sitemap until the first real, approved case and public-approved media are live.
- Do not publish invented client names, patients, testimonials, dashboards, metrics or medical outcomes.
- A save to draft or review must never overwrite the active public snapshot.
- A record cannot become `publishable` without a clean slug, comparable baseline/outcome definitions, denominator, dates, budget context, practice contribution, limitations, data source, attribution class, approved client permission and public-approved media rights.
