# CAESTHETIC case studies


The catalog and Full Case Page render only immutable snapshots returned by Case Intake's published-case API. Drafts, review records and TEST fixtures never appear as a public fallback.


Content and publication contract: `docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md`.


## Content source


- Published records: `/case-studies/intake/api/public-cases`
- Legacy publication contract: `/assets/data/case-study.schema.json`
- Shared presentation and public-value normalization: `/assets/js/case-study-content.js`
- Source-bound summaries for existing records: `/assets/data/case-study-summaries.json`
- Rendering logic: `/assets/js/case-studies.js`
- Reusable case route: `/case-studies/case/?id=<published-slug>`
- Case-detail rendering logic: `/assets/js/case-study-detail.js`


Case cards and case-page summaries contain no cover images or image placeholders. A cover, `media_id` or registry entry is not required to publish a case. Existing evidence attachments and archived cover assets are retained. Approved Connect4 and contact imagery outside the case presentation keeps its existing contract.

Case Intake's optional `cardTitle`, `cardSituation` and `cardApproach` become public `card.title`, `card.situation` and `card.approach`. They take precedence over legacy editorial summaries. A legacy summary is used only while its `sourceTitle` and `sourceUpdatedAt` exactly match the active record; otherwise rendering falls back to the record itself.

The active public projection omits `evidenceLevel: modeled`, `attribution: not_claimed` and the derived `Modeled result` label without changing historical revisions. Empty classifications stay empty; never infer `client_reported` or `verified`. Source descriptions, limitations and material caveats remain visible. A numerical result requires explicit supported evidence, a source, a timeframe and comparable values; modeled or synthetic source material must not appear as a measured outcome.


## Publish a case


1. Follow `docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md`.
2. Confirm the case narrative, metric definition, baseline, denominator, timeframe, limitations, data source and CAESTHETIC relationship to the work.
3. Add concise, source-grounded short fields when useful; they are optional and do not replace the full narrative.
4. Complete the Russian Case Intake form and choose “Опубликовать”.
5. Confirm the response contains `catalogVisible: true` and a public URL.
6. Check desktop and mobile rendering, supported-result and no-result states, filter URLs, keyboard controls and return navigation. Keep the existing `noindex` policy until a permissioned case meets the indexing criteria.


## Release blockers


- Do not add these routes to the sitemap until the first real, approved case meets the existing indexing criteria; this visual redesign does not change indexing policy.
- Do not publish invented client names, patients, testimonials, dashboards, metrics or medical outcomes.
- A save to draft or review must never overwrite the active public snapshot.
- Preserve the authenticated publication workflow and its required narrative fields. Short editorial fields, result metrics, evidence classifications and cover assets are not new blanket publication requirements.
- Claims must reflect the source, limitations and actual relationship to the work. Client work requires appropriate publication permission. Missing evidence must not become an invented result or an automatic evidence classification.
