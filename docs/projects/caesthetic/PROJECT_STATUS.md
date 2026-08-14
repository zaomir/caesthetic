# CAESTHETIC — Project Status

**Updated:** 2026-08-14
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
- Report schema v3 requires a named human approver and timestamp, complete Problem Inventory↔remediation-task mapping, full implementation fields, exact three priorities, owner implementation paths and honest Sprint/no-lock-in language. Deterministic scoring still uses the canonical metric IDs/weights, Class A-only coverage, the inclusive 70% surface gate, all-four Overall and Cross-Surface exclusion; publication remains fail-closed below 80% Class A.
- TASK-821 / DEC-828 owner cockpit: header + Valerie walkthrough + current state, binding-constraint statement and Demand System leak, Top 3, full remediation tasks, then compact Four-Surface navigator, evidence, inventory, one Do Not Fund, DIY, Why CAESTHETIC, illustrative roadmap, one Sprint CTA, methodology. Score remains secondary. All real and demo reports emit noindex; real output requires an unguessable slug; demos stay explicitly synthetic.
- All three public synthetic demos are schema-v3 fixtures rendered deterministically through the same production authority. The retired private placeholder remains noindex and outside the sitemap.

## Reusable implementation asset
Raimov feedback capture may be adapted as a Reputation module only as a neutral request to every eligible client, subject to US platform/legal/privacy review. Incentives, sentiment filtering, selective public/private routing and review gating are prohibited.
