# CAESTHETIC — Project Status

**Updated:** 2026-08-21
**Phase:** Phase 1 — proof + outbound readiness

## Agents satellite (DEC-829)

- Public GitHub project: [`zaomir/caesthetic`](https://github.com/zaomir/caesthetic) at `/var/www/caesthetic`.
- Bidirectional sync with grainee-v2 every 10 min (`scripts/caesthetic/sync-agents-bidirectional.sh`).
- Deploy remains grainee-only. `site-caesthetic/private/` is not mirrored.


## Audience / outreach (2026-08-14)

- TASK-814 IG username harvest DONE: **746** across 9 Phase-1 cities ($14.90 / $15).
- Candidate `CAE_MEDSPA_IG_V1` rebuilt to **1441** on VDS masters; Dropbox `medspa-ig-outreach-v1/`.
- Registry incoming registered; execution still bootstrap `CURRENT.json` until next release.
- Agent card: `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`.

## Canonical product state
- Growth Score: free; 3-stage minimal intake; AI-assisted four-surface research and draft; named-human-approved evidence, diagnosis and remediation plan; private owner cockpit plus Valerie Petra walkthrough.
- Sprint 1: $2,500 / 30 days; finite scoped implementation + longer-horizon processes started.
- Sprint Extension: $2,500 per additional 30 days; optional, unpublished, post-Day-30 finite implementation continuation.
- Growth System: optional recurring operating ownership under one client-specific Growth Budget; the visible Fixed Management Fee sits inside the budget, variable inputs use the remaining approved funds, and any legally available Performance Fee is separate above it. No reusable recurring amount, rate or cap.
- Sprint scope: approximately 3–6 Category A constraints and 1–5 Category B maturing processes, governed by access, before-evidence, live-evidence, revenue-recovery, Client Growth Statement and Build-vs-Configure gates; no artificial Month-2 backlog.
- Reporting: detailed internal operations/evidence plus a short mobile-first Client Growth Statement that separates shipped activity, adoption, verified impact and objectively maturing work.
- Economics and measurement authority: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`.
- Growth System operating/automation and request/add-on classification authority: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## Completed in repo
- Published CAESTHETIC site v2 positioning, owner problems, diagnosis-led Sprint scope and a dedicated Growth System page with the Growth Budget allocation model, Client Growth Statement and evidence-gated initiative lifecycle.
- Established Valerie Petra as the public CAESTHETIC business identity and removed the unverified legacy personal LinkedIn URL from public runtime and the active identity registry.
- Registered CAESTHETIC as its own knowledge domain and `caesthetic` runtime across the machine registry, indexes and runtime map.
- Prepared the dry-run-only Dolphin Phase-1 warm consumer for the canonical US spa IG master (`DEC-818`): warm rows only, aggregate counts by state/source, DM hard-off, student/VOC runner still fail-closed.
- Published the Four-Surface Growth Score landing-page explanation with fixed 30/25/15/30 outer weights and separate Cross-Surface Consistency.
- Consolidated Growth Score onto one reusable production scoring authority plus a thin CLI, with the exact canonical component IDs/weights, human approval for every final metric score, ≥70% surface coverage, all-four Overall policy and the ≥80% Class A publication gate.
- Published three clearly labeled Phase-1 synthetic demo routes from the same validated schema and renderer used for private real reports; real routes remain unguessable/noindex and demos disclose synthetic data and no client relationship.
- Separated exactly three `humanDiagnosis.top_priorities`, the full evidence-backed `humanDiagnosis.problem_inventory` and one `humanDiagnosis.do_not_do` without promising Sprint scope before purchase.
- Replaced School-era deploy smoke with Growth Score demo smoke.

## Growth Score correction gate — complete

The detailed subordinate specification now defines the exact component metrics/weights, metric-level evidence schema, human approval gate, ≥80% Class A publication gate, full Problem Inventory and shared real/demo renderer contract. The master authority remains `docs/ssot/CAESTHETIC.md`.

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

## Growth Score owner-cockpit runtime — aligned

The approved 2026-08-14 owner-cockpit canon is implemented in runtime:

- `/growth-score/` is a mobile-first three-stage intake. The required case persists after the four contact/practice fields and before optional enrichment; Skip, optional-save failure and optional-stage abandonment preserve the successful request. Optional answers remain `self_reported`, permission is explicit, and stage analytics contain no PII or answers.
- Supabase storage separates versioned intake, score case, candidate evidence, frozen verified facts, AI draft, append-only review events, approved report, de-identified learning candidate and explicit rule release. Drafts are non-publishable; reviewer corrections never activate global memory, fine-tuning or rules automatically.
- Report schema v4 requires a named human approver and timestamp, complete Problem Inventory↔remediation-task mapping, full implementation fields, exact three priorities, owner implementation paths and honest Sprint/no-lock-in language. Applicable reports now fail closed without Competitive Decision Analysis: four-surface Comparison Matrix, Competitor Cards, repeated-review themes, `Defend / Close / Differentiate / Do not copy`, binding-constraint/priority effects and an evidence-gated Market Practice Gap decision. Deterministic scoring still uses the canonical metric IDs/weights, Class A-only coverage, the inclusive 70% surface gate, all-four Overall and Cross-Surface exclusion; publication remains fail-closed below 80% Class A.
- TASK-821 / DEC-828 owner cockpit: header + Valerie walkthrough + current state, binding-constraint statement and Demand System leak, Top 3, full remediation tasks, then compact Four-Surface navigator, evidence, inventory, one Do Not Fund, DIY, Why CAESTHETIC, illustrative roadmap, one Sprint CTA, methodology. Score remains secondary. All real and demo reports emit noindex; real output requires an unguessable slug; demos stay explicitly synthetic.
- All three public synthetic demos are schema-v4 fixtures rendered deterministically through the same production authority. The retired private placeholder remains noindex and outside the sitemap.
- 2026-08-21 docs cleanup removed the conflicting legacy 12-block report contract, restored the referenced CAESTHETIC Competitive Decision Analysis adapter and aligned active product docs to the renderer's 13-section cockpit plus the 3–8 minute walkthrough SSOT. Runtime and scoring logic were unchanged.

## Reusable implementation asset
Raimov feedback capture may be adapted as a Reputation module only as a neutral request to every eligible client, subject to US platform/legal/privacy review. Incentives, sentiment filtering, selective public/private routing and review gating are prohibited.

## «Ноги в Руки» Growth Score — decision package ready, publication gated

As of 2026-08-14:

- The July assumption that no official website exists is superseded. `nogyvruky.com.ua` is live and self-identifies the business as a two-location medical-centre network.
- Public-only research is complete for the current decision draft. No call, message, form submission, appointment or mystery-shopper interaction was used.
- Live Maps evidence is frozen in `docs/agent-api/results/nogi-v-ruki-growth-score-20260814.json`. Google ratings/counts remain platform-specific and preserve match confidence.
- The proposed binding constraint is cross-surface medical-entity consistency plus booking continuity, not a generic lack of reviews.
- The client working set lives in `docs/projects/caesthetic/clients/nogi-v-ruki/`: completion plan, full review draft, Competitive Decision Analysis and Denis Valerievich conversation script.
- Global canon now requires the Competitive Decision Analysis defined in `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`; `docs/caesthetic/competitive_decision_analysis.md` is the CAESTHETIC adapter. The report schema v4, engine, renderer, demo fixtures and tests enforce the expanded contract.
- The current Maps-led client draft remains explicitly partial until comparable fresh-review samples, website/booking paths, social, offers/prices and Market Practice Gap evidence are collected for each branch-relevant competitor.
- Publication remains fail-closed until a named human reviewer approves the objective strength, binding constraint, exactly three priorities and `Do not fund yet`. The unguessable noindex report route and 3–8 minute Valerie Petra walkthrough are therefore not yet released.


### «Ноги в Руки» approval update — 2026-08-14

- User approved the proposed objective strength, binding constraint, exact Top 3 and `Do not fund yet`.
- The decision approval is recorded in the client draft and the Valerie Petra walkthrough brief is ready; final production follows the current 3–8 minute walkthrough SSOT.
- Publication remains fail-closed until the reviewer provides a real name for the canonical approval record. No private route or production deploy has been released.


### Registered human-reviewer mononym — 2026-08-14

- Canonical reviewer display identity for the approved Nogi v Ruki decision is exactly `Валерия`.
- Growth Score spec v4.1 and CAESTHETIC master v3.10 allow this exact registered mononym while keeping ordinary first+last validation and rejecting every unregistered one-word value.
- Runtime validator and tests are updated. Valerie Petra remains the Growth Advisor/walkthrough presenter, not an inferred reviewer surname or alias.


### Reviewer mononym runtime release — 2026-08-14

- PR #751 shipped exact registered reviewer identity `Валерия` without surname/translation/persona expansion.
- Targeted Growth Score engine validation passed `32/32`; ordinary first+last names still pass and unregistered mononyms fail.
- Deploy request `deploy-caesthetic-valeria-reviewer-20260814T2156Z` returned `status=success`, `smoke.ok=true`; deployed SHA `6f8519fc3459e1482a154ae54efa630afcd89603`.
- Public satellite sync now excludes `docs/projects/caesthetic/clients/**`; real client packs remain private to `grainee-v2`.
