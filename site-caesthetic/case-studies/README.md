# CAESTHETIC case studies — visual prototype

This route is intentionally a protected, non-indexable visual prototype. Its 25 records, market labels, narratives and SVG visuals are placeholders and are not client evidence.

## Content source

- Case records: `/assets/data/case-studies.placeholder.json`
- Publication contract: `/assets/data/case-study.schema.json`
- Media registry: `/media/registry.json`
- Neutral preview assets: `/assets/case-studies/placeholders/`
- Rendering logic: `/assets/js/case-studies.js`
- Reusable case route: `/case-studies/case/?id=case-01`
- Case-detail rendering logic: `/assets/js/case-study-detail.js`
- Registry resolver: `/assets/js/media-registry.js`

The page and case data refer only to stable semantic `media_id` values. Replace an image by changing its registry entry; do not hardcode a new path into HTML or case data.

## Replace a placeholder

1. Confirm the case narrative, metric definition, baseline, denominator, timeframe, limitations, data source and CAESTHETIC relationship to the work.
2. Confirm image rights and, when people or clinical material are shown, documented consent and allowed channels.
3. Add the approved, versioned asset to the site asset library.
4. Update the existing `media_id` entry with the approved path, intrinsic dimensions, factual alt text, rights and consent status.
5. Change the case record from placeholder fields to approved content.
6. Run `node scripts/caesthetic/check-case-studies-media.mjs` while the route is still in preview mode.
7. Run `node scripts/caesthetic/check-case-study-contract.mjs`; records marked `publishable` fail closed unless evidence and media requirements are complete.
8. Complete desktop and mobile visual QA before removing the visible prototype notice and `noindex` directive.

## Release blockers

- Do not add this route to the sitemap while any required case field or media entry is a placeholder.
- Do not publish invented client names, patients, testimonials, dashboards, metrics or medical outcomes.
- `noindex` is not a substitute for access control during placeholder review.
- A record cannot become `publishable` without a clean slug, comparable baseline/outcome definitions, denominator, dates, budget context, practice contribution, limitations, data source, attribution class, approved client permission and public-approved media rights.
