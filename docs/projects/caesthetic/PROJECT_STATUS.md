# CAESTHETIC — Project Status

**Updated:** 2026-09-04
**Phase:** Phase 1 — proof + outbound readiness

## Private Growth Preview v1 — production (2026-09-04)

- Private Growth Preview is live as an acquisition mechanic over approved pre-Score evidence, not a product or diagnosis. The permission boundary remains `Continue to My Free Growth Score`; only that atomic action creates or resolves the existing Growth Score lead, case, status and outbox.
- Canonical implementation merged at `99350cf9bc6ef1fd7ff8d156853b451730d14dd3`. The schema migration completed in Supabase Migrations Push run `33877615647`.
- The CAESTHETIC Worker deploy step completed for exact SHA `34389405d89bde0110f4c696e93ea3571b43ab92` in run `33878148159`. The shared post-deploy suite later failed on an unrelated stale marker for `/case-studies/intake/guide/`; this does not replace the dedicated Preview acceptance result.
- `submit-caesthetic-growth-score` was deployed from workflow head `8cb54de1ce050d984bb04c862665a7780a008ec9`. Dedicated production smoke run `33878630219` passed: synthetic Preview GET returned HTTP 200 with `noindex`, `no-referrer` and `no-store`; GET created no Score case; Continue and repeat Continue returned HTTP 200 and the same lead/case; all five non-personal funnel events were present.
- The synthetic QA lead `e0522cb0-9c97-45ef-af7a-ba0fdfda26c8` finished `declined` and QA case `1b5386c9-3d4a-4bbe-a029-442e2bdbc9b2` finished `closed`. No real prospect was used and no synthetic item remains a live working lead.
- Instantly sending was not performed. Internal suppression is fail-closed; synchronous real-time Instantly suppression remains an explicit integration gap until an authoritative webhook or read capability exists.
- Machine-readable acceptance evidence: `docs/audits/caesthetic/growth-preview/production-acceptance-20260904.json`.

## Lead-to-Revenue Map raster integrity (2026-09-04)

- The complete owner-approved raster is stored at `site-caesthetic/assets/img/growth-score/lead-to-revenue-map.png`: SHA-256 `9a2d659a52d26a1ea32626991856f7951e468a6602ff377e537155276480ccb6`, `1,528,541` bytes, `1536×1024`.
- Runtime uses this exact PNG. Do not crop, re-encode, redraw, reconstruct or substitute it without explicit owner approval.
- The report test locks the exact hash and dimensions and verifies the complete PNG chunk stream, terminal `IEND` and full image-data inflation so a truncated asset cannot ship again.

## Growth Score approved Hero asset lock (2026-09-03)

- The `Where Clients Are Gained - and Lost` section now displays only the latest owner-approved PNG at `site-caesthetic/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png`.
- Exact authority: SHA-256 `64d54a5a5fbb1aaddbfdc9f7641103a0beab53c09e8b79ff38892e8a3348ca05`, `1,056,049` bytes, `6912×3456`.
- The former adaptive HTML/SVG Hero reconstruction and mobile substitute are disabled. Replacement, redraw, translation, crop, recolor, overlay or transformed derivative requires explicit owner approval and a new canon/hash guard.
- Four Surfaces, schema v5, Journey Graph evidence, human review, Broken Connections and all scoring/priority isolation contracts remain unchanged.

## Multi-Location decision intelligence — implementation (2026-09-03)

- New authoring uses additive profile `multi-location-growth-score/1.2.0`; schema v5, template `growth-score-report-template/5.2.0`, Four Surfaces, weights, Overall, binding constraint and named-human Top 3 rules are unchanged.
- The network parent now validates one approved decision-view projection per reviewed location under `multi-location-decision-intelligence/1.0.0`, using existing approved Growth Score evidence only. Missing evidence remains explicit `not_assessed`; numeric treatment/provider/friction/network scores and every automatic decision flag are rejected.
- The pure network projection renders Treatment × Location, Provider × Location, representative Trust Chains, categorical Patient Friction by location and location-specific treatment promotion holds inside the existing nine sections. Mobile uses stacked cards and native disclosure; the first four locations stay visible.
- Frozen profile-1.1 and markerless Multi-Location packages remain readable without silent migration.

## Growth Score derived decision views — implementation (2026-09-03)

- Schema-v5 now supports five derived, unscored views over the existing approved evidence layer: Treatment Opportunity Matrix, Provider Visibility Map, Trust Chain, categorical Patient Friction Index and Do Not Promote Yet by Treatment.
- The first four views render inside `gap-map`; the fifth renders inside `do-not-fund`. The Intro plus exact nine-section cockpit, Four Surfaces and template version `growth-score-report-template/5.2.0` remain unchanged.
- Contract `growth-score-decision-views/1.0.0` is fail-closed: no new source registry, score/weight/Overall mutation, automatic binding-constraint/Focus Selection or automatic promotion decision. Human inference and treatment-specific holds require named-human approval; missing evidence remains `not_assessed`.
- Historical schema-v5 reports remain readable. New authoring always emits the artifact and may use an approved empty `not_assessed` state when the existing evidence does not support the views.
- Deferred next phase only: Patient Language Map, Objection Map, manual/free/paid source expansion, LinkedIn/Reddit and paid enrichment such as Apify. None is implemented or treated as current evidence here.

## Lead-to-Revenue Check — sitewide runtime (2026-09-03)

- Canonical route: `/lead-to-revenue-check/`; fixed price `$500` from the generated pricing SSOT.
- Product role: conditional internal-path diagnostic after public-evidence Growth Score, not a fifth surface, mandatory stage or primary-navigation item.
- Contextual entry points exist on Home, Growth Score, Pricing, Sprint, Growth System, About, Support, the audit catalog and four Beauty Salons locales; the global footer exposes the canonical product route.
- The route explains the eight-stage internal path, authorized non-clinical evidence boundary, least-privilege/PHI rule, deliverable and decision set, no-outcome-claim boundary and one-time direct-continuation Sprint credit.
- Scope request remains written-order-first. The private payment summary resolves an allowlisted product label and does not trust arbitrary backend text.
- Growth Score renderer is fail-closed: a commercial Check card requires `leadToRevenueCheck.recommendation="recommended"`, a reason and evidence references; otherwise only the gray internal boundary renders. A recommended Check replaces the Sprint CTA. Multi-Location focus children keep parent navigation and no second commercial CTA.
- New single-location and Multi-Location authoring now emits an explicit `not_recommended` Check decision with no evidence refs. A named-human-approved reason plus evidence refs is required to switch it to `recommended`; focus children reject that commercial state.
- Controlled payment runtime accepts `lead_to_revenue_check` only as a signed, written-scope-linked `$500 USD` order. Payment labels are product-aware, and only `growth_sprint` orders can trigger the automatic 30-day Sprint activation path.
- Analytics: `lead_to_revenue_check_page_viewed` and `lead_to_revenue_check_scope_requested`. Production smoke includes page, price, inquiry and sitemap markers.

## Beauty Salons vertical — production (2026-08-28)

Status: **live** as an isolated vertical adapter (footer only; not primary nav). DEC-856.

Live routes (HTTP 200, reciprocal `hreflang`, self-canonical, no `noindex`):

- https://caesthetic.com/beauty-salons/
- https://caesthetic.com/es/salones-de-belleza/
- https://caesthetic.com/ru/salony-krasoty/
- https://caesthetic.com/fr/salons-de-beaute/

Aliases keep safe query/UTM and 301 to `/beauty-salons/`: `/beauty/`, `/go/new-salon-launch/`, `/go/salon-growth/`.

| Item | Value |
|------|--------|
| Merged SHA | `2180d31d030cc9433842cf5d6d30823aeceabe95` |
| Deployed SHA | `70be5cfd8ae777b2943b503447057c2ca25c93f2` |
| Site request | `deploy-caesthetic-beauty-salons-20260828T2205Z` |
| Site result | `status=success`, `smoke.ok=true` |
| Functions request | `deploy-functions-caesthetic-beauty-salon-intake-20260828T2150Z` |
| Functions result | `status=success`, `smoke.ok=true` |
| Fast checks | PASS (PR #1084) |
| Independent prod smoke | PASS — four locales, sitemap, hreflang/canonical, language selector, pricing markers, synthetic disclosure, UTM-preserving redirects |
| Growth Score intake | PASS — QA POST `ok=true`, `qa_test=true`, `next_action=qa_archived`, `lead_id=4c7af246-358d-46ca-ac44-0bcba2d1c5e3`, `score_case_id=2f42bea4-3e42-47a6-8b71-732dce303dd3`. Payload sent `vertical=beauty_salon`, `locale=en`, `source_page=/beauty-salons/`. QA lead must not remain a working prospect. |

Known limits:

- Beauty Salons is a vertical adapter, not a fifth product or a change to the medical-aesthetics primary funnel.
- Internal CRM / reception / phones / chatbot / rebooking / staff operations stay **not assessed** without operational access.
- Growth System commercial terms remain client-specific; no universal recurring fee is published.
- This Cloud Agent environment could not query Supabase service-role to re-read `self_reported.vertical` after insert. Persistence code shipped in the functions deploy; intake HTTP contract returned QA-archived success.

## Agents satellite (DEC-829)

- Public GitHub project: [`zaomir/caesthetic`](https://github.com/zaomir/caesthetic) at `/var/www/caesthetic`.
- Bidirectional sync with grainee-v2 uses the isolated `caesthetic-repo-sync.timer` every 15 seconds; the retired 10-minute cron must not be installed.
- Deploy remains grainee-only. `site-caesthetic/private/` is not mirrored.


## Audience / outreach (2026-08-14)

- TASK-814 IG username harvest DONE: **746** across 9 Phase-1 cities ($14.90 / $15).
- Candidate `CAE_MEDSPA_IG_V1` rebuilt to **1441** on VDS masters; Dropbox `medspa-ig-outreach-v1/`.
- Registry incoming registered; execution still bootstrap `CURRENT.json` until next release.
- Agent card: `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`.

## Canonical product state
- Growth Score: free; one schema-v5 engine/template (`growth-score-report-template/5.2.0`); 3-stage minimal intake; AI-assisted four-surface research and draft; named-human-approved evidence, Gap Inventory, exact Top 3 Focus Selection and Repair Plans; one unnumbered Intro before the private exact nine-section owner cockpit plus Valerie Petra walkthrough.
- Sprint 1: $2,500 / 30 days; finite scoped implementation + longer-horizon processes started.
- Sprint Extension: $2,500 per additional 30 days; optional, unpublished, post-Day-30 finite implementation continuation.
- Growth System: optional recurring operating ownership under one client-specific Growth Budget; the visible Fixed Management Fee sits inside the budget, variable inputs use the remaining approved funds, and any contractually activated Performance Fee is separate above it. No reusable recurring amount, rate or cap.
- Sprint scope: approximately 3–6 Category A constraints and 1–5 Category B maturing processes, governed by access, before-evidence, live-evidence, revenue-recovery, Client Growth Statement and Build-vs-Configure gates; no artificial Month-2 backlog.
- Reporting: detailed internal operations/evidence plus a short mobile-first Client Growth Statement that separates shipped activity, adoption, verified impact and objectively maturing work.
- Economics and measurement authority: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`.
- Growth System operating/automation and request/add-on classification authority: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## Completed in repo
- Canonicalized `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md` as the single orchestration route from accepted Score case through research, named-human approval, private delivery and controlled learning. It delegates product, scoring, CDA, walkthrough and renderer rules to their existing authorities; runtime, scoring weights and renderer behaviour are unchanged.
- Canonicalized the schema-v5 Growth Score authoring template at `scripts/caesthetic/growth-score-report-template.mjs`: exact engine-derived metric sets, fail-closed draft defaults, one unnumbered Intro before the exact nine-section cockpit, named-human exact Top 3 Focus Selection, complete Gap Inventory with embedded Repair Plans, one Do Not Fund Yet, four implementation paths, a pending walkthrough and methodology/limitations. Aesthetemed remains a historical schema-v4 read-only artifact, not a source of reusable practice facts or a current renderer contract.
- Published CAESTHETIC site v2 positioning, owner problems, diagnosis-led Sprint scope and a dedicated Growth System page with the Growth Budget allocation model, Client Growth Statement and evidence-gated initiative lifecycle.
- Established Valerie Petra as the public CAESTHETIC business identity. The founder-confirmed LinkedIn URL and portrait now resolve from the reusable owner-facing point-of-contact component; `/about/` remains corporate and contains no Valerie identity block.
- Registered CAESTHETIC as its own knowledge domain and `caesthetic` runtime across the machine registry, indexes and runtime map.
- Prepared the dry-run-only Dolphin Phase-1 warm consumer for the canonical US spa IG master (`DEC-818`): warm rows only, aggregate counts by state/source, DM hard-off, student/VOC runner still fail-closed.
- Published the Four-Surface Growth Score landing-page explanation with fixed 30/25/15/30 outer weights and separate Cross-Surface Consistency.
- Consolidated Growth Score onto one reusable production scoring authority plus a thin CLI, with the exact canonical component IDs/weights, human approval for every final metric score, ≥70% surface coverage, all-four Overall policy and the ≥80% Class A publication gate.
- Published three clearly labeled Phase-1 synthetic demo routes from the same validated schema and renderer used for private real reports; real routes remain unguessable/noindex and demos disclose synthetic data and no client relationship.
- Separated named-human `humanDiagnosis.focus_selection` from the complete evidence-backed `humanDiagnosis.gap_inventory`, with embedded Repair Plans and one `humanDiagnosis.do_not_do`, without promising Sprint scope before purchase.
- Replaced School-era deploy smoke with Growth Score demo smoke.

## Growth Score correction gate — complete

The detailed subordinate specification now defines the exact component metrics/weights, metric-level evidence schema, human approval gate, ≥80% Class A publication gate, full Gap Inventory and shared real/demo renderer contract. The master authority remains `docs/ssot/CAESTHETIC.md`.

Release evidence:

- PR `#683` merged to `main` as product SHA `03646bf7deadc021c37178338b07c4bb4b731cb9`.
- `61/61` Growth Score, Growth Economics, real/demo renderer, lead-flow and Agent API allowlist tests passed; render drift and shell syntax checks passed; Impeccable reported zero anti-patterns.
- Agent API request `deploy-caesthetic-growth-score-canon-20260811T142406Z` returned `status=success`, `smoke.ok=true` and deployed SHA `a297b1e3a48a830d2e05110c6b81404fa1a235ef`.
- Bridge smoke returned HTTP 200 with required markers for `/growth-score/`, `/sprint/`, the home page and all three demo reports. Independent production smoke then passed `/growth-score/` and every demo route.

Lifecycle and route closeout evidence:

- PR `#685` merged to `main` as product SHA `5a09f1f18247bd7671f0e951cfc669272f4ff258`.
- Pending, AI-draft and rejected metrics may retain valid raw evidence for review/audit, but remain unavailable and contribute no canonical weight until an approved final `normalized_score` exists; truly unknown metrics remain nullable and unavailable.
- `72/72` targeted Growth Score, Growth Economics, lead-flow, route and Agent API tests passed; render drift, deploy/production-smoke shell syntax and diff checks passed.
- Agent API request `deploy-caesthetic-growth-score-closeout-20260811T191551Z` returned `status=success`, `smoke.ok=true` and deployed SHA `4d9fc479c14f1555889b6831fce5029567090cc6`.
- Production returned HTTP 200 for `/growth-score/` and the three current demo routes: `demo-medical-aesthetics-search-gap`, `demo-injector-practice-booking-friction` and `demo-aesthetics-clinic-reputation-gap`; both superseded demo routes returned HTTP 404.

## Founder-side launch work
- Collect contacts/evidence across Scottsdale, Nashville, Charlotte, Tampa, Raleigh, Austin, Naples, Charleston, Greenville; rank after full pass.
- Complete Instantly warm-up and deliverability approval for the registered outbound mailboxes.
- Establish Valerie Petra walkthrough recording and quality-assurance capacity for every approved Score.
- Complete Stripe/payment setup and funnel analytics.

## Growth Score ops contract (DEC-848 / TASK-853–855, 2026-08-21)

- Required intake is one Postgres transaction: lead + case + status event + outbox.
- Default owner `Valerie Petra`, next action, same-day triage (8h) and delivery SLA (5d; +7d if rolling open cases ≥ 3). Capacity never rejects a valid request.
- QA/TEST auto-closes. Customer acknowledgement is sent for non-QA leads. Notifications retry via outbox + `scripts/caesthetic/growth-score-ops.mjs`.
- Case state changes only through `transition_caesthetic_score_case`. GA4/Meta IDs remain empty.
- Operator runbook: `docs/projects/caesthetic/operations/GROWTH_SCORE_OPERATOR_RUNBOOK.md`.

## Conversion infrastructure (TASK-849, 2026-08-21)

- TASK-849 shipped to production Worker: `deployed_sha` `4986a91ca467dade73558e4b6bac85fc0c1525ac` (workflow `32437073960`). Growth Score smoke PASS including `/growth-score/` analytics marker.

- Public `/growth-score/` remains a 3-stage skippable intake; required capture writes `caesthetic_growth_score_leads` then creates `caesthetic_score_cases` (`source_kind=owner_intake`).
- UTM + referrer persist on the lead row; new Score requests notify `notifications@caesthetic.com` and admin Telegram. TEST/QA payloads are labelled `[TEST/QA]` and must be archived (`status=declined`, case `state=closed`) so they never sit in the owner working queue.
- Walkthrough lives on `/score/<slug>/` (Valerie Petra 3–8 min, evidence-led; demos use an explicit placeholder). `/sprint/` is the paid path from Score; canonical price is `$2,500` from `site-caesthetic/src/config/pricing.ts`.
- Stripe/checkout is **not wired** on the public Sprint page. Scope and payment instructions are requested by email. GA4/Meta pixel IDs remain empty (dataLayer-only until ads secrets are set).
- Public edge (2026-08-21): origin SHA `4986a91ca`; Worker `grainee-caesthetic-public` version `1b61b6f9-0856-4705-8f44-b95bb8b7bce7`. Production smoke `CAESTHETIC_GROWTH_SCORE_SMOKE_PASS=true`.

## Email readiness

| Role | Domain | Mailboxes | Status |
|---|---|---|---|
| Cold outbound | `caesthetic.co` | `valerie`, `harper`, `lana`, `aurora`, `scarlett`, `sienna`, `chloebennett`, `willow` | Registered; Instantly warm-up started. |
| Notifications | `caesthetic.com` | `notifications` | Registered; Instantly warm-up started; operational notifications only. |
| Website | `caesthetic.com` | `info` | Registered; Instantly warm-up started; designated website contact. |

Full addresses and sender-role rules are canonical in `docs/ssot/CAESTHETIC.md`.

## Current constraints
- No dedicated English-speaking employee before first paying client unless founder changes decision.
- Growth Score conclusions remain human-approved.
- No public Sprint 2 offer.

## Growth Score owner-cockpit runtime — current v5 contract

The founder-approved `5.2.0` contract corrects the 13-section presentation drift introduced by PR #1275 while retaining schema v5 and its evidence, privacy, locale/vertical and named-human approval gates. Current runtime authority is:

- `/growth-score/` is a mobile-first three-stage intake. The required case persists after the four contact/practice fields and before optional enrichment; Skip, optional-save failure and optional-stage abandonment preserve the successful request. Optional answers remain `self_reported`, permission is explicit, and stage analytics contain no PII or answers.
- Supabase storage separates versioned intake, score case, candidate evidence, frozen verified facts, AI draft, append-only review events, approved report, de-identified learning candidate and explicit rule release. Drafts are non-publishable; reviewer corrections never activate global memory, fine-tuning or rules automatically.
- Every new approved report is `schemaVersion=5` with canonical `templateVersion=growth-score-report-template/5.2.0`. The schema requires a complete `gap_inventory`, embedded `repair_plan` per gap and named-human exact Top 3 `focus_selection`; it rejects the former `top_priorities`, `problem_inventory`, `remediation_tasks` and stored `selected_for_repair` fields.
- The renderer contract is one unnumbered shared Intro followed by exactly nine counted sections: Gap Map, Focus Gaps, Sprint Fit, Repair Paths, Do Not Fund Yet, Full Gap Inventory, Evidence and competitors, Scores and methodology, Next step. Score remains secondary, the full v5 diagnosis/remediation/implementation/methodology content is consolidated without loss, and there is one Sprint CTA.
- Deterministic scoring still uses the canonical metric IDs/weights, Class A-only coverage, the inclusive 70% surface gate, all-four Overall and Cross-Surface exclusion; publication remains fail-closed below 80% Class A and without applicable Competitive Decision Analysis.
- The three public synthetic demos and the protected, noindex Nohy V Ruky Beauty/RU example use schema v5 and the same renderer authority. Nohy V Ruky requires server-side password access and remains outside the sitemap and public catalogue. Aesthetemed is retained only as a historical schema-v4 pre-rendered artifact; the current renderer rejects raw v4 and does not let it masquerade as v5.
- All real and demo reports emit noindex; real output requires an unguessable slug and server-side access protection unless a named release exception is recorded in the master SSOT. The 3–8 minute walkthrough follows `report_locale` without creating another video product.

## Reusable implementation asset
Raimov feedback capture may be adapted as a Reputation module only as a neutral request to every eligible client, subject to US platform/legal/privacy review. Incentives, sentiment filtering, selective public/private routing and review gating are prohibited.

## «Ноги в Руки» Growth Score — current v5 example and historical decision trail

Current repository artifact: the protected, noindex Beauty/RU report uses `schemaVersion=5`, `templateVersion=growth-score-report-template/5.2.0`, `vertical_context=beauty_salon`, `report_locale=ru`, the shared localized Intro, the complete Gap Inventory and named-human exact Top 3 Focus Selection. The entries below preserve the 2026-08-14 pre-v5 decision history; they are superseded as current contract/readiness statements.

As of 2026-08-14:

- The July assumption that no official website exists is superseded. `nogyvruky.com.ua` is live and self-identifies the business as a two-location medical-centre network.
- Public-only research is complete for the current decision draft. No call, message, form submission, appointment or mystery-shopper interaction was used.
- Live Maps evidence is frozen in `docs/agent-api/results/nogi-v-ruki-growth-score-20260814.json`. Google ratings/counts remain platform-specific and preserve match confidence.
- The proposed binding constraint is cross-surface medical-entity consistency plus booking continuity, not a generic lack of reviews.
- The client working set lives in `docs/projects/caesthetic/clients/nogi-v-ruki/`: completion plan, full review draft, Competitive Decision Analysis and Denis Valerievich conversation script.
- At that time, the report used the then-current schema-v4 Competitive Decision Analysis contract. Current authority is schema v5 under `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`, `docs/caesthetic/competitive_decision_analysis.md` and `docs/caesthetic/growth_score_spec.md`.
- The current Maps-led client draft remains explicitly partial until comparable fresh-review samples, website/booking paths, social, offers/prices and Market Practice Gap evidence are collected for each branch-relevant competitor.
- At that time, publication remained fail-closed until a named human reviewer approved the objective strength, binding constraint, exactly three priorities and `Do not fund yet`; this is historical gate state, not the current v5 report status.


### «Ноги в Руки» approval update — 2026-08-14

- User approved the proposed objective strength, binding constraint, exact Top 3 and `Do not fund yet`.
- The decision approval is recorded in the client draft and the Valerie Petra walkthrough brief is ready; final production follows the current 3–8 minute walkthrough SSOT.
- At that time, publication remained fail-closed until the reviewer provided a real name for the canonical approval record. This historical blocker was later superseded.


### Registered human-reviewer mononym — 2026-08-14

- Canonical reviewer display identity for the approved Nogi v Ruki decision is exactly `Валерия`.
- The then-current Growth Score spec v4.1 and CAESTHETIC master v3.10 allowed this exact registered mononym while keeping ordinary first+last validation and rejecting every unregistered one-word value; current schema-v5 validation preserves the accepted identity rule.
- Runtime validator and tests are updated. Valerie Petra remains the Growth Advisor/walkthrough presenter, not an inferred reviewer surname or alias.


### Reviewer mononym runtime release — 2026-08-14

- PR #751 shipped exact registered reviewer identity `Валерия` without surname/translation/persona expansion.
- Targeted Growth Score engine validation passed `32/32`; ordinary first+last names still pass and unregistered mononyms fail.
- Deploy request `deploy-caesthetic-valeria-reviewer-20260814T2156Z` returned `status=success`, `smoke.ok=true`; deployed SHA `6f8519fc3459e1482a154ae54efa630afcd89603`.
- Public satellite sync now excludes `docs/projects/caesthetic/clients/**`; real client packs remain private to `grainee-v2`.
