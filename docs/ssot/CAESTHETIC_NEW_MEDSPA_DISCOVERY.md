# CAESTHETIC New Med Spa Discovery SSOT

## First recurring UTC slot accepted — 2026-09-16

This section supersedes the pending recurring-slot statements below. It accepts the scheduled collector execution, not unreviewed downstream outreach.

- VPS2402 completed the durable run `scheduled-20260916T120000Z` from the Wednesday 12:00 UTC slot. The observed collection windows run from 12:00:01Z through 12:05:37Z; next slot is 2026-09-18 12:00 UTC.
- All 139 configured market/niche tiles completed with 139 distinct synchronous request IDs and 139 distinct raw SHA-256 hashes; 0 raw hashes or request IDs are missing and 0 markets were skipped.
- 48 provider rows were ingested: 34 new unique companies, 14 updates/duplicates, 0 test fixtures. Catalog Added Date remains discovery evidence, not a confirmed opening date.
- Conservative cost upper bound is $0.72; ISO-week reserved/spent upper bound is $1.08 with $7.92 remaining. `actual_usd`/provider invoice remains unknown. The $208.50 sum of per-tile catalog quotes is not expenditure.
- An idempotent replay at 12:20:25Z returned the same durable receipt with `replayed_receipt=true`; it performed no second purchase. The manual expanded run `cae-medspa-expanded-20260915T212200Z` was not repeated.
- Reply polling recovered in PR #1685. Live poll and the 12:30 heartbeat are `ok:true`: 0 mapped replies, 0 new events/actions, 1 provider message quarantined as `reply_sender_identity_unresolved`, and 0 runtime errors. The quarantined message did not trigger handoff, DNC, classification or follow-up stop.
- This scheduled collector does not import recipients into Instantly or send outreach. Therefore no slot-originated outbound send is claimed. The earlier six-send receipt remains the only accepted new-cohort outbound evidence until the 34 new records pass ownership/opening review and recipient-specific Instantly outbound receipts exist.
- Berk Beauty and SYR remain held; FiDi and fixtures were not reimported; no automatic Growth Score was issued.
- Evidence: [scheduled receipt](../agent-api/results/scheduled-20260916T120000Z.json), [live reply recovery](../agent-api/results/cae-medspa-reply-poll-recovery-20260916T122900Z.json), [latest runtime](../ops/caesthetic-new-medspa-discovery/control/autonomous-runtime-latest.json), [launch receipt](../ops/caesthetic-new-medspa-discovery/control/launch-receipts-20260915.json).

## Geography and beauty niches — founder expansion 2026-09-15

Authority: user in this conversation: “расширь гео и ниши”; preceding city/niche proposal accepted for implementation. This section supersedes the Medical Spa-only query/import restrictions below; it does not reclassify historical receipts or automatically clear prior holds.

- Active config: [discovery-geography.json](../ops/caesthetic-new-medspa-discovery/discovery-geography.json). 31 geographical clusters, 9 source-category cohorts, 139 market/niche tiles. All are selected ZIPs, never full-metro coverage.
- Queue D adds Orlando, Jacksonville/Ponte Vedra/St. Johns, San Antonio/Boerne, Charlotte outer suburbs, Franklin/Brentwood, McKinney/Prosper/Celina, Chandler/Gilbert/Paradise Valley, Seattle Eastside, North New Jersey, Sarasota/Lakewood Ranch. Original pilot ZIPs and existing market IDs are preserved.
- Medical Spa, Skin Care Clinic, Laser Hair Removal Service and Tattoo Removal Service are eligible across all 31 clusters.
- Hair Salon, Permanent Make-up Clinic, Cosmetic Dentist, Plastic Surgeon and Dermatologist begin as distinct cohorts in Dallas North, Tampa and Orlando. Hair/PMU require service specialization and a team; dermatology requires evidenced aesthetic services. Category membership is not qualification.
- Each market/niche has its own cursor, raw file, request identity and receipt. Original medspa cursor IDs stay intact; new niches begin with the existing 14-day Added Date window and 3-day overlap. Rotation is oldest successful tile first across queues, with queue/niche priorities breaking ties.
- Quote and reserve under the same $3/run and $9/ISO-week caps before each purchase. Expansion does not authorize a second collector, higher budget, larger sender capacity or a replay of completed requests.
- Import preserves the actual source category. Cross-category place-ID duplicates are one company; identity conflicts and known holds remain blocked. Adjacent contacts require recorded niche-fit review plus existing first-party ownership evidence. No salon is called a medical clinic by virtue of import.
- Discovery remains Added Date-based catalog collection. Public-event research and historical comparison are a separate evidence step described in [public-signals.md](../ops/caesthetic-new-medspa-discovery/public-signals.md). No autonomous event crawler is claimed by this change.
- Generic Free Growth Score invitations remain possible with unknown opening date. Event-based wording requires exact evidence; no fabricated loss, capacity, revenue or opening claims.
- Runtime acceptance PASSED 2026-09-15 22:50 UTC: VPS2402 reported beauty-expansion-v1, matching config/seven code hashes and 31/9/139 scope. Dry-run enumerated all 139 tiles with zero skips and no purchase; previous real-run receipt preserved. 25 focused tests pass. [Runtime evidence](../research/caesthetic-new-medspa-discovery/2026-09-15/beauty-expansion-runtime.json). Actual new-category provider counts require subsequent paid-run receipts.

## Expanded manual launch — 2026-09-15 22:20 UTC

This observation supersedes the earlier empty-cohort status below. The manual end-to-end run is complete; actual recurring-slot acceptance remains pending.

- Run `cae-medspa-expanded-20260915T212200Z`: 18 markets / 166 selected ZIPs, including NYC and LA; 24 new records, 0 duplicates. Selected ZIPs are not full metro coverage.
- Canonical writer added 20 source-category Medical Spa companies; 4 adjacent categories excluded. Companies 228,499; contacts unchanged at 130,732; private outreach queues contain the six reviewed emails. Drive mirror succeeded.
- All 24 records reviewed: 6 business-owned contacts prepared, imported and actually sent; 14 held; 4 category exclusions. MATERA opened September 9. Soulshine James Island is announced for late September, not already open. Catalog dates are not opening dates.
- New canary MATERA was reconciled before the remaining five imports. All six new recipient-specific provider IDs/timestamps/rendered-body hashes are verified. FiDi/test sends excluded; 0 new bounces/replies/unsubscribes at the post-send check.
- Cost upper bound $0.36, actual invoice unknown; remaining same-run budget $2.64 and ISO-week budget $8.64. Sum of sequential quotes $27 is not expenditure.
- Account cap remains 15/day; this campaign limit/max-new-leads 6, minimum gap 5 minutes, weekdays 10:00–20:00 America/Detroit. Reply/company/auto-reply stops, unsubscribe and bounce protection remain enabled.
- Native UTC cron repair and independent readback passed. Existing collector runs only Mon/Wed/Fri 12:00 UTC under its UTC guard, durable slot identity and shared operation lock. Two clean runtime heartbeats at 22:15/22:20; current retry code verified at `36daec154e194d758c0fa500e3273af03614af03`.
- EmailVerifier remains `not_performed_by_policy`; Berk Beauty/SYR stay held. No duplicate purchases/imports, manual Gmail substitute or automatic Score issuance.
- [Full run report](../research/caesthetic-new-medspa-discovery/2026-09-15/expanded-launch-report.md), [immutable six-send evidence](../research/caesthetic-new-medspa-discovery/2026-09-15/manual-run-receipts.json), [runtime proof](../research/caesthetic-new-medspa-discovery/2026-09-15/runtime-checks.json), [launch receipt](../ops/caesthetic-new-medspa-discovery/control/launch-receipts-20260915.json).
- Remaining acceptance: observe the actual 2026-09-16 12:00 UTC collector slot. Follow-up scheduled 12:10 UTC. Internal full-body Gmail/replay gate remains passed; no new customer handoff is claimed.

Status: active
Owner: CAESTHETIC
Source authority: docs/ssot/CAESTHETIC.md and icp-collector/config/cities.json

## Autonomous factory override (2026-09-12)

[CAESTHETIC_AUTONOMOUS_OUTREACH_FACTORY.md](CAESTHETIC_AUTONOMOUS_OUTREACH_FACTORY.md) is the latest founder authority for this motion. EmailVerifier is excluded for all future discovery cohorts; email outreach has standing authorization through interested-reply handoff; no founder daily recipient cap applies. Historical six-recipient-only verification waivers and per-wave human approval requirements below are superseded for this motion. Provider constraints, identity/conflict checks, known suppression, truthful copy and reply stops remain binding. Runtime readiness must be verified separately.

## Standing downstream policy (2026-09-08)

Founder decision in issue #1580; permanent for CAESTHETIC discovery-sourced outreach, not a one-wave waiver.

- Offer to receive a **Free Growth Score**. Do not issue a Private Growth Preview or claim a Preview/Score already exists before work is performed.
- A live VDS master/suppression/conflict lookup is no longer a mandatory pre-send gate for this motion, including its LinkedIn outreach. Missing VDS access or master IDs alone must not block execution. This supersedes conflicting master-lookup requirements in the factory and historical decision.
- Preserve source identity and provenance; keep unknown master fields null and record the lookup as `not_required_by_policy`, never as a successful clearance. Do not manufacture master IDs or clearance receipts.
- Honor known refusals, unsubscribes, complaints and do-not-contact flags, including those known from another brand/channel. Keep channel blocklists, recipient identity checks, cohort/channel deduplication and stop-on-any-reply. No unblocking or erasing refusal history.
- Email verification, truthful sender identity, legal footer, rendered-message QA and canary controls still apply. The founder's separate catch-all exception covers only the six recipients recorded in #1580; it does not authorize invalid addresses or unrelated cohorts.
- Discovery remains read-only; sending is a separately authorized downstream action. No cold Instagram DMs.
- Fresh-event claims require evidence for the exact business. A generic Free Growth Score invitation does not assert a new opening; retain unknown age rather than fabricate an event.
- Existing Preview infrastructure and its validator remain unchanged for other workflows. Do not route this invitation through `growth-preview-wave.mjs` or require Preview issuance, tokens, endpoint checks or Preview-validator acceptance.
- Positive interest routes into the existing Free Growth Score intake/review process, not a Preview page. Do not promise a delivery date without confirmed capacity.

Operating details: [downstream-growth-score-handoff.md](../ops/caesthetic-new-medspa-discovery/downstream-growth-score-handoff.md).

## Goal
Regularly find newly added aesthetic-practice / med-spa business records in CAESTHETIC target markets for review. This is lead discovery only. Do not start outreach from this workflow.

## Source and filters
Use Outscraper Data -> Business Catalog.

Required filters:
- Category/type: Medical Spa. Adjacent acceptable categories for review only: Skin Care Clinic, Aesthetic Clinic, Wellness Center, IV Therapy Service, Weight Loss Service, Dermatology/Plastic Surgery only when Medical Spa/aesthetic services are present.
- Country: US.
- Geography: Queue A uses the canonical pilot ZIP tiles from `icp-collector/config/cities.json` (unchanged). Expansion Queues B and C use the selected city/ZIP list in `docs/ops/caesthetic-new-medspa-discovery/discovery-geography.json`. Do not call a city-only dump a full metro. Not a broad US search.
- Freshness: use Added Date Range, never Updated Date Range, for the discovery window.
- Do not filter by rating, review count, website, email, phone, or claimed status at the discovery stage.

Canonical September 2026 UI/API mapping:
- types: ["medical spa"]
- country_codes: ["US"]
- postal_codes: all ZIP tiles from icp-collector/config/cities.json
- added_from / added_to: Unix seconds for the local discovery window

## Cost rule
Outscraper Business Data Export is priced per exported record, not per confirmed new business. Standing paid collection is authorized without a second confirmation:

- **$3 USD maximum per run**, including geography expansion, retries, and any paid enrichment in that run.
- **$9 USD maximum per ISO calendar week** (Mon–Sun UTC).
- Unused run or week budget does **not** roll over and does not raise the next run cap.
- Schedule: Monday, Wednesday, Friday **12:00 UTC** on VPS2402. One collector: `scripts/caesthetic/medspa-discovery/`.
- Quote from current Outscraper terms before every paid request. If the upper bound is unknown, do not start the request. Cap volume in advance; do not rely on a post-facto counter.
- Already-paid NYC/LA city-filter CSVs are not repurchased.

Published catalog rate (2026-09): first 500 records free on the observed public tier, then about $3 / 1,000 records. The worker uses a conservative upper bound (at least the 2026-09-08 observed $0.01/row) unless the live `/profile/balance` invoice confirms a cheaper unit. Free remaining rows are assumed **0** unless the provider confirms unused free rows.

## Live collection status (2026-09-15)

- Worker + cron are installed on VPS2402: `/etc/cron.d/caesthetic-medspa-recurring` → `0 12 * * 1,3,5` UTC. Poller cron `/etc/cron.d/caesthetic-medspa-discovery` is `*/5` and follows `origin/main` with #1664 reconcile.
- `OUTSCRAPER_API_KEY` is on the host (`/etc/evo/secrets.env`, `root:root 600`). `load_secrets()` sees it; `/profile` authorizes. No key in Git or chat.
- Authorized bounded live run `cae-medspa-bounded-launch-20260915T202518Z` (Scottsdale six ZIPs, 14-day window) completed at 20:30:21Z: 0 new / 0 duplicates, quote $1.50, cost upper bound $0, `actual_usd` unknown (reservation is not an invoice). Raw SHA `beb8e2febf3cde94669b4e605fff6aa0933a6ff2414e6f0fcf340df362c77e30`. Do not repeat that request.
- Next scheduled collector fire: **2026-09-16T12:00:00Z**. Tuesday ticks correctly report `outside_utc_slot` / `paid_ops: none`. Actual Wednesday execution is not yet proven.
- Starter `disc-20260911Tstarter` remains $0 and does not replace a scheduled slot. Already-paid NYC/LA city-filter CSVs are not repurchased.

## Storage
Private raw CSV/JSON, provider job IDs, spend ledger, and contacts live under `/var/lib/caesthetic-medspa/` (not Git). Public run notes (no emails) may be summarized under `docs/research/caesthetic-new-medspa-discovery/YYYY-MM-DD/`.

Each private run folder must keep: raw response/CSV, provider job ID, geography, window, quoted and actual USD, UTC time, SHA-256. Do not overwrite prior runs.

Dedup: `place_id`, then company/branch. Do not overwrite existing statuses, exclusions, or contact/outreach history. Exclude Recovery Spa / `ChIJtest` / `test_fixture`.

Distinguish: first seen by this process; added to catalog; confirmed business opening. Do not assign `new opening` without separate evidence.

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
- `docs/ops/caesthetic-new-medspa-discovery/discovery-geography.json` - Queues A/B/C, selected ZIPs, rotation.

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

## Immediate full-run observation (2026-09-15 21:10 UTC)

Founder requested execution now. Run `cae-medspa-full-20260915T210300Z-collect` completed on VPS at 21:05:26Z: Nashville and Charlotte, six ZIPs each, Sep 1–15 Added Date window, 0 new / 0 duplicates. Quote $3 total, conservative result cost $0; actual per-run invoice unknown. Profile balance at 21:10:24Z remains $51.06; Business Data Export invoice remains 17 paid records at $0.015 (no observed increase).

Hash-verified canonical source readback `cae-medspa-full-20260915T210300Z-ingest` passed at 21:10:40Z with 0 candidates and no master apply. Live reply poll passed, 0 new events/actions. Existing provider history remains 12 sends / 6 leads in legacy and 1 send / 1 lead in NYLA, with 0 replies/bounces/unsubscribes. Those are prior sends, not sends from this run.

New canary/send/handoff count: 0 because the new cohort is empty. Full launch is not accepted. No Scottsdale request replay, fixture/FiDi re-import, or renewed test email. Berk Beauty/SYR remain excluded. Next scheduled slot unchanged: 2026-09-16 12:00 UTC. Detailed raw hashes and operation receipts: [launch receipts](../ops/caesthetic-new-medspa-discovery/control/launch-receipts-20260915.json).
