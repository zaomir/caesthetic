# CAESTHETIC New Med Spa Discovery SSOT

Status: active
Owner: CAESTHETIC
Source authority: docs/ssot/CAESTHETIC.md and icp-collector/config/cities.json

## Goal
Regularly find newly added aesthetic-practice / med-spa business records in CAESTHETIC target markets for review. This is lead discovery only. Do not start outreach from this workflow.

## Source and filters
Use Outscraper Data -> Business Catalog.

Required filters:
- Category/type: Medical Spa. Adjacent acceptable categories for review only: Skin Care Clinic, Aesthetic Clinic, Wellness Center, IV Therapy Service, Weight Loss Service, Dermatology/Plastic Surgery only when Medical Spa/aesthetic services are present.
- Country: US.
- Geography: use the canonical target ZIP tiles from icp-collector/config/cities.json, not a broad US search and not only city names.
- Freshness: use Added Date Range, never Updated Date Range, for the discovery window.
- Do not filter by rating, review count, website, email, phone, or claimed status at the discovery stage.

Canonical September 2026 UI/API mapping:
- types: ["medical spa"]
- country_codes: ["US"]
- postal_codes: all ZIP tiles from icp-collector/config/cities.json
- added_from / added_to: Unix seconds for the local discovery window

## Cost rule
Outscraper Business Data Export is priced per exported record, not per confirmed new business. First 50 records are free in the observed tier. If the export modal shows Total Price above $0.00, stop before checkout and ask for approval. Record the shown quantity, regular price, discount, and total price screenshot.

## Storage
Save every run under docs/research/caesthetic-new-medspa-discovery/YYYY-MM-DD/ with:
- raw/outscraper_business_catalog_raw.csv
- verification/verified_records.csv
- README.md containing run date, Added Date Range, ZIP list source commit/path, category filters, Outscraper estimated count, exported rows, price, and operator notes.

Do not overwrite prior runs. Preserve raw CSV exactly as exported.

## Verification classification
Each exported record must be checked against public Google Maps/card evidence and, when useful, the business website/socials. Classify each row as one of:
- fresh_card
- new_location
- relocation
- old_company
- duplicate
- age_unknown
- out_of_niche

Low review count or recent Outscraper added_at alone does not prove opening. confirmed_fresh_event requires public evidence supporting a new card, new location, or relocation.

Check: niche fit, address accuracy, business-owned website/phone/email, duplicate rows created by multiple contacts, and whether the contact belongs to the business.

## Telegram notification rule
Notify Telegram after each completed run only when at least one candidate is actionable or when export would cost money.

Telegram message must include:
- run date and Added Date Range
- total exported rows and unique businesses
- confirmed fresh events, duplicates, age_unknown, out_of_niche
- count with business-owned phone/email/website
- export cost and cost per actionable candidate
- link/path to the run folder or verification table
- explicit caveat: weekly inflow and detection lag are not proven from a single run

Do not send outreach messages to businesses from this workflow.

## Project file architecture
Discovery implementation and operating docs should live in these paths:

- `docs/ssot/CAESTHETIC_NEW_MEDSPA_DISCOVERY.md` - active authority and non-negotiable rules.
- `docs/ops/caesthetic-new-medspa-discovery/PIPELINE.md` - execution pipeline from Outscraper export to verified records and Telegram notification.
- `docs/ops/caesthetic-new-medspa-discovery/lead.schema.json` - canonical normalized record schema for discovered businesses.
- `docs/ops/caesthetic-new-medspa-discovery/runbook.md` - weekly operator checklist and QA rules.
- `docs/ops/caesthetic-new-medspa-discovery/downstream-growth-score-handoff.md` - optional handoff contract to a separate human-approved Growth Score workflow.
- `docs/ops/caesthetic-new-medspa-discovery/backlog.md` - implementation backlog.

Per-run artifacts must stay under `docs/research/caesthetic-new-medspa-discovery/YYYY-MM-DD/` and must not overwrite prior runs.

## Pipeline summary
The canonical pipeline is:

1. Raw import: preserve Outscraper CSV exactly as exported.
2. Normalize: trim fields, parse booleans/numbers/dates, normalize URL/domain/phone/category arrays.
3. Deduplicate: merge records by `place_id`, then `cid`, `google_id`, `os_id`, domain+phone, then name+city+state+phone.
4. Verify: check public Maps/card evidence and website/socials when useful.
5. Classify: assign one of the seven verification classes listed above.
6. Score actionability: prioritize human review; never trigger outreach.
7. Write run outputs: `verified_records.csv`, README, and optional `handoff/actionable_candidates.jsonl`.
8. Notify Telegram only when SSOT notification conditions are met.

## Downstream boundary
This workflow may produce an actionable-candidate handoff after verification, but the receiving workflow must be separate. Any Free Growth Score invitation, message drafting, sending, follow-up, or sales action requires its own human approval and must not be executed by discovery automation.

Discovery output is a lead signal, not a diagnosis. Do not claim a binding constraint, expected impact, ranking improvement, patient growth, revenue growth, or ROI from this workflow.

## First export observations
The first reviewed export file, `medical_spa_US_2026_Sep_07-10.csv`, contained 11 rows across TX, FL, NC, and SC. Website and phone were present for all rows; email was present for 7/11; Instagram for 8/11; Facebook for 6/11; LinkedIn for 3/11; booking links for 2/11. One entity appeared as a duplicate by Maps/business identity with conflicting email values, confirming that entity-level deduplication must run before any verification table or downstream handoff.
