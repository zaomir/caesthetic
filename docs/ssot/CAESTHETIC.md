---
owner: CAESTHETIC
status: active
version: 3.8
updated: 2026-08-14
scope: CAESTHETIC master strategy and product-funnel canon
parent: docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md
marketing_parent: docs/ssot/MARKETING_SYSTEM_STANDARD.md
related:
  - docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
supersedes: docs/caesthetic/CAESTHETIC_SSOT.md
---

# CAESTHETIC — Master SSOT

**Market:** United States  
**Legal entity:** OXFORD PROJECTS LTD  
**Runtime project:** `caesthetic`  
**Production root:** `site-caesthetic/`

This is the single master strategy authority for CAESTHETIC. Detailed working specs may elaborate it but may not contradict it. The Dropbox mirror at `docs/caesthetic/`, including its legacy `CAESTHETIC_SSOT.md`, is provenance and working material rather than repository authority.

CAESTHETIC is the first **reference implementation** of the global Growth Control approach. Global rules live in `docs/ssot/MARKETING_SYSTEM_STANDARD.md`, `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md` and `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`. This file specializes the aesthetic-practice funnel, offer ladder, roles and client-facing products. It does not silently fork those global principles.

## 1. Positioning
**The growth operating system for independent aesthetic practices.**

### Public identity

**Valerie Petra** is the public face of CAESTHETIC and leads the owner-facing Growth Score walkthroughs. Public CAESTHETIC surfaces use her name and role without a LinkedIn link until a canonical Valerie Petra profile URL is confirmed in repository authority. Unconfirmed legacy profile links must not appear in public runtime or current CAESTHETIC identity material.

Practical owner question: **Where is my practice losing patients, what should I fix first, and what should I not spend money on yet?**

Vendor-independent: the practice can keep its EHR, medical director and suppliers. CAESTHETIC fixes the growth layer. Toxifillers/Bototox supply is isolated from the public US funnel.

Operationally, CAESTHETIC is an external **Growth + Patient Operations desk**, not an agency made broader by accepting unrelated work. Recurring ownership covers the acquisition, conversion, retention and patient-operations layer defined below. Recruitment and adjacent practice operations are eligible only as paid add-ons when they directly support that layer; their classification and operating boundaries are canonical in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## 2. One operating model: four surfaces
Patients evaluate one practice across four decision surfaces:
1. **Search / Google Business Profile**
2. **Website**
3. **Social**
4. **Reputation / Reviews**

**Cross-Surface Consistency** is a cross-surface metric, not a fifth surface. Every stage uses this same model.

## 3. Canonical funnel
Public funnel:

`Growth Score (free) → 30-Day Growth Sprint ($2,500) → optional Growth System`

The currently approved public recurring product is Growth System. Do not publish Fixed Retainer, Hybrid or Performance Compensation as public SKUs unless separately approved.

Canonical continuation after Sprint:

```text
Growth Score
→ Sprint
→ optional ongoing relationship
```

No later stage is mandatory. After Sprint, an ongoing relationship may be:

```text
Fixed Retainer
OR
Growth Budget
OR
Hybrid
OR another specifically approved model
```

Growth Budget is **not** the obligatory continuation of a Sprint. The public Growth System currently uses the Growth Budget commercial architecture unless a signed client-specific schedule selects another approved model. Exact rates remain client-specific.

Operationally, after Sprint 1 there may be an **optional $2,500 second 30-day implementation Sprint**. It is not published as a standard product, is not promised upfront and is offered only after the Day-30 report when finite implementation work remains justified.

Full lifecycle:

`Diagnose → Sprint 1: fix main constraints + start longer work → optional Sprint 2: finish/extend finite implementation → optional ongoing relationship`

No later stage is mandatory.

## 4. Growth Score — diagnose
Growth Score diagnoses all four surfaces before implementation.

### Public intake

The canonical inbound route is `/growth-score/`, presented as three stages:

1. **Contact:** `Your name` and `Work email`.
2. **Required practice basics:** `Practice name` and `City, State`.
3. **Thank you + optional enrichment:** the request is already complete; clearly say that the four required fields are enough to begin, then optionally ask for public website/GBP/Instagram/booking links, priority treatments, main concern, relevant competitors, preferred contact and permission for a truthful non-clinical enquiry-path test.

Stage 3 abandonment or `Skip` remains a successful submission. Optional answers never become a hidden eligibility gate. Do not ask for revenue, budget, patient-level data/PHI, credentials or account/vendor access in the free intake. If the practice is ambiguous, ask for one public identifier later by email rather than increasing mandatory friction. A proactive/outbound Score built from public evidence is a separate acquisition path and must not be represented as owner-submitted intake.

### AI-assisted research and human approval

1. Intake/context creates a versioned case. Client assertions remain self-reported context until independently verified.
2. AI-assisted research resolves the practice and gathers date-stamped candidate evidence across Search, Website, Social and Reputation; Cross-Surface Consistency stays separate.
3. AI normalizes and compares evidence and drafts pre-scores, diagnosis, binding constraint, full Problem Inventory, Top priorities and remediation tasks with proposed sequence/dependencies.
4. A named human verifies every proposed Class A fact and its source/date/method, approves or rejects metric judgments, checks competitor selection, corrects priorities/language/tasks and freezes the verified fact set.
5. Deterministic scores and the final narrative compile only from the verified fact set and explicitly labelled Class B items. A named human approves the versioned report before publication. No autonomous AI final diagnosis.

At least 80% of published findings are observable **Class A** facts. Class B estimates are explicit and disclose method and assumptions. Unknown, stale, unsupported or contradictory evidence remains unavailable; intake claims and Class B estimates do not fill metric coverage.

Reviewer corrections improve later Scores only through a controlled learning layer: append-only review events may be de-identified and deliberately promoted by a named method owner into versioned templates, extraction rules, rubrics, taxonomies, priority heuristics, remediation patterns or evals with changelog, test, effective date and rollback. Per-case edits never auto-generalize. No uncontrolled chat/model memory, silent fine-tuning or cross-client reuse of raw contact/client data or PHI.

### Scores are secondary; the remediation plan is primary

Current outer display weights are **Search 30% · Website 25% · Social 15% · Reputation 30%**. Cross-Surface Consistency is separate to avoid double counting. These weights are heuristic and approximate: they support consistent visual navigation and may create useful tension, but are not absolute truth, causal attribution or the authority for priorities/Sprint scope. Verified problems, dependencies, implementation risk and human judgment take precedence when they disagree with a score.

Detailed metric catalogue and collection/scoring rules: `docs/caesthetic/growth_score_spec.md`. Metric families are:
- **Search:** geo-grid visibility; GBP category/treatment completeness; entity integrity; conversion readiness; freshness; branded-search control.
- **Website:** booking friction; priority-treatment clarity; mobile performance; above-fold conversion; clinician/trust proof; mystery-shopper response; technical booking integrity.
- **Social:** priority-treatment presence; clinician expertise; proof quality; recency; profile-to-book path; local offer clarity.
- **Reputation:** 90-day review velocity; rating; review depth; recency; response coverage/speed; negative-review handling; treatment/clinician proof in reviews.

If less than 70% of a surface's metric weight is observable, publish `Insufficient evidence`, not a fabricated score. Overall and surface `/100` values are a compact navigator/tension layer, not the decision layer.

The private owner cockpit's primary product is the human-approved, evidence-backed decision package:

- objective strength and strongest surface;
- binding constraint and named-competitor evidence where applicable;
- full Problem Inventory, not only a Top 3 summary;
- exactly three Top priorities and one `do not do`;
- concrete remediation tasks mapped to problems, with steps, sequence, dependencies, required access/skills, accountable role, honest effort/complexity, implementation risk, horizon, next action and acceptance evidence;
- clear `Insufficient evidence` and verification actions where a task cannot yet be justified; and
- methodology, source dates, limitations and explicit Class B assumptions.

The cockpit must be self-contained enough for the owner to implement the plan internally or with another provider. Do not hide instructions to create sales dependency. The client owns the delivered report, evidence pack, task plan and completed outputs; there is no lock-in.

The honest `Why CAESTHETIC / Why the 30-Day Sprint` block explains convenience, not exclusivity: CAESTHETIC has already assembled the evidence and diagnosis, knows the dependency order and can implement, coordinate and accept the selected changes inside a separately confirmed written 30-day scope. It must show real workload, specialist needs, dependencies, coordination cost and implementation risks without implying that every Score task is included. After the Sprint the client may continue in-house, use another provider, choose an optional CAESTHETIC path or stop.

Delivery: private/noindex `/score/<unguessable-slug>/` owner cockpit plus a **4–6 minute Valerie Petra recorded walkthrough** covering the strength, binding constraint, decisive evidence, priorities/tasks, dependency order, `do not do` and optional Sprint path without a guaranteed-results claim.

Public site should show several representative browsable Growth Score examples. Demo/synthetic examples must be labelled; real examples require truthful attribution and permission/redaction as appropriate.

### 4.1 ManyChat username-first prefill

ManyChat may prefill Growth Score intake only from an exact normalized Instagram username already present in the canonical private CAESTHETIC registry. The read path is:

```text
docs/ssot/data/outreach-username-registries.yaml
→ dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json
→ CURRENT immutable canonical_master.csv minus CURRENT deny overlay
→ exact same-username enrichment from VDS master_companies.csv
→ private RLS read projection
→ lookup-caesthetic-instagram
```

The projection is replaceable infrastructure, not a third prospect master or outreach authority. Candidate exports, dated exports, biographies, names, domains, cities and similarity are never used to infer a username match. A missing or conflicting field remains an empty string.

Runtime contract for ManyChat External Request:

```text
POST https://evo.do/api/v1/lookup-caesthetic-instagram
Content-Type: application/json

{"instagram_username":"{{Instagram Username}}"}
```

Every POST outcome is HTTP `200` with exactly:

```json
{
  "status": "matched | not_found",
  "practice_name": "",
  "city_state": "",
  "website": ""
}
```

`matched` means exact normalized username equality in the active private projection; it does not mean owner identity, outreach approval or inferred practice affiliation. Invalid/missing input, absence, projection errors and source-field gaps never trigger fuzzy lookup. `not_found` and all missing fields use empty strings so ManyChat Response Mapping stays stable.

ManyChat mappings:

| JSON path | Custom Field |
|---|---|
| `$.status` | `cae_lookup_status` |
| `$.practice_name` | `cae_candidate_name` |
| `$.city_state` | `cae_candidate_city` |
| `$.website` | `cae_candidate_website` |

## 5. Sprint 1 — the only Sprint sold upfront
**$2,500 · fixed 30 days · No retainer · No contract beyond 30 days.**

Sprint 1 converts the diagnosis into a deliberately limited implementation scope across the same four surfaces.

At Day 0 classify the inventory:

**A — Main constraints to complete or materially resolve in Month 1.** Select roughly **3–6** highest-impact problems, but use judgment rather than a quota. If work can reasonably be finished in 30 days, finish it. Never hold back executable work to manufacture Month 2.

**B — Secondary problems to start in Month 1 but which objectively continue.** Select roughly **1–5** when justified. Launch the implementation/process and disclose the expected horizon. Examples: review velocity, map movement, content/treatment expansion, reactivation cycles, sustained response discipline.

**C — Real problems not started in Month 1.** Document them. They may be handled by the practice in parallel/afterward, another provider, optional Sprint 2, or Growth System where recurring.

Counts are planning ranges, not promises. Priority, feasibility and impact govern scope.

A reasonable Month-1 shape is a lean combination of: measurement foundation; the patient conversion path; maps/entity cleanup; one production-ready reputation loop; one or two high-ticket offer paths; and an administrator conversion kit. This is a prioritization example, not a promise that every practice receives every module.

Every Sprint must pass these delivery gates:

1. **Day-0 Access Gate** — confirm the accounts, owners, permissions and approvals needed for the selected scope; blocked access changes the plan transparently rather than creating fictional progress.
2. **Before Snapshot** — capture dated evidence for each selected constraint before changing it.
3. **One Revenue Recovery Loop, where applicable** — ship one executable reactivation, abandoned-lead, no-show or unclosed-consultation loop when recoverable demand is a diagnosed constraint.
4. **Live Evidence per task** — a completed item requires a live URL, system state, screenshot, export or other verifiable implementation evidence; a draft or recommendation is not shipped work.
5. **Client Growth Statement** — close the period with the owner-facing result layer defined in section 8, while preserving the detailed internal evidence record.
6. **Build-vs-Configure Gate** — custom internal software is permitted only after existing configuration, workflow and off-the-shelf options are evaluated and the build is explicitly justified and separately scoped when outside the Sprint.

The standard Sprint does not include deep 10–15-competitor research, full blog plus mass article production, recurring maps/review maintenance, full-team training or change management, custom internal software without the Build-vs-Configure decision, routine social management or paid-media management. A diagnosed need may still be documented and routed to an approved Growth Budget input, finite Sprint Extension, Growth System or paid add-on; exclusion from the standard Sprint is not an instruction to ignore it.

Typical work:
- **Search:** GBP cleanup, categories/services, appointment path, accessible entity corrections, Local Falcon baseline/recheck. No 30-day map-ranking promise.
- **Website:** booking friction, mobile CTA/phone, selected treatment pages, conversion integrity, performance bottlenecks, analytics events.
- **Social:** bio/location/booking path, treatment representation, clinician/proof structure, cross-surface alignment. Routine social management excluded by default.
- **Reputation:** compliant review capture, response backlog, privacy-safe templates, operating owner/SLA, measurement. Raimov feedback-hub infrastructure may be adapted, but prohibited review gating must not be copied.
- **Operational layer:** enquiry-response protocol, reactivation logic/materials and measurement when diagnosed; not a fifth surface.

Communication through Day 30 is **email-only / asynchronous**. No routine calls. Growth Score walkthrough is the only standard human-video asset before Day 30; no standard Day-30 video.

Day-30 written email report:
1. **Done / materially resolved** — before → after.
2. **Started & continuing** — current state, horizon, required owner.
3. **Not started** — backlog and why outside Month-1 scope.
4. **Next path** — in-house / optional Sprint 2 / Growth System / defer-do-not-do.

Report failures/no-movement honestly. The detailed inventory is the operating/evidence layer; the owner-facing summary uses the Client Growth Statement in section 8.

## 6. Optional Sprint 2 — finite implementation continuation
Sprint 2 is **$2,500 per additional 30 days; not public, not promised and not required**. Offer it after Day 30 only when remaining high-value work is predominantly finite implementation.

It may continue Bucket B work, take a next high-priority Bucket C problem or address a new constraint discovered during Sprint 1 only where the remaining implementation is finite and meets the justification below. It may not become a generalized second task bundle or bill for work deliberately left unfinished despite being reasonably completable in Sprint 1.

Sprint Extension is justified only for finite implementation blocked by access, client approval, a vendor dependency or an objective implementation horizon. Month 2 is not an artificial backlog. Review velocity, map movement, content expansion, reactivation cycles, attribution/CRM data discipline, administrator adoption and internal referrals may mature into Month 2 or Growth System only when the process was genuinely launched in Month 1 and needs an observable time horizon or recurring ownership.

At Sprint-2 end use the same `Done / continuing / remaining` report. If remaining need is recurring ownership, Growth System becomes the natural optional offer.

## 7. Growth System — optional recurring ownership
When Growth System is the selected public recurring product, it currently uses Growth Budget unless a signed client-specific schedule selects another approved model.

**The client-specific Fixed Management Fee inside the Growth Budget buys recurring operating ownership that must create owner-visible business improvement, not a bank of hours or a fixed quota of posts, campaigns, calls or tasks.** No reusable monthly Fixed Management Fee amount is canonical here: the amount comes only from the signed client-specific Commercial Schedule / SOW.

Each operating month must plan and deliver **multiple tangible improvements that a practice owner can recognize — normally at least three** — across the highest-value applicable categories: conversion; revenue recovery; reputation; administrator conversion; funnel/site optimization; experiments; patient journey; and IT management-to-adoption. This is a monthly value floor, not a revenue/patient guarantee or permission to manufacture low-value task volume. A change may be reported as business impact only when the applicable evidence gate is met; otherwise it is labelled truthfully as `Shipped`, `Adopted` or `Maturing`.

Monitoring, analytics, data cleanup, Growth Ledger maintenance, reporting mechanics and vendor/developer coordination are internal means used to choose, deliver and verify those improvements. They do not independently satisfy the Fixed Management Fee's client-value obligation. IT management qualifies as an owner-visible improvement only when a requirement reaches an accepted live change and intended workflow adoption; creating a brief, task or meeting does not qualify.

Even in a month with no Performance Fee, the minimum contractual enabling and ownership scope is:

1. growth management and prioritization for the next operating cycle;
2. measurement, attribution and maintenance of the agreed evidence discipline in support of implemented improvements;
3. one short owner-facing monthly Client Growth Statement led by business changes, not an activity inventory;
4. conversion optimization across the existing traffic → inquiry → booking → consultation → treatment path;
5. retention/reactivation ownership for the highest-priority applicable recovery loop;
6. compliant reputation operations and review-flow oversight;
7. Growth Budget recommendation, allocation management and reconciliation, including reallocation within client-approved limits; and
8. at least one active optimization cycle per month, plus the portfolio of cycles needed to support the monthly owner-visible improvement floor, with each hypothesis, change, evidence and keep/stop/continue decision recorded.

Growth System is for genuinely recurring execution: review flow, response discipline, cross-surface maintenance, focused treatment/content expansion, reactivation cadence, analytics review, competitor monitoring and similar operations. Exact monthly priorities follow evidence and capacity; the fixed management scope is an ownership floor, not a promise to execute every possible workstream simultaneously.

Excluded from the fixed management scope are ad spend; third-party SaaS and metered usage; production; external specialists; substantial custom development or integrations; a full redesign or new site; and legal or medical work. Approved growth inputs use the Variable Growth Budget, while a self-contained delivery module belongs in a separate SOW/add-on under the classification canon in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`. Legal and medical professional work remains with appropriately qualified providers and is not silently bundled into the recurring model.

It is not a completion fee. Client owns delivered materials and may continue in-house/elsewhere. A client may move directly from Sprint 1 to Growth System when finite implementation backlog is no longer the main need; Sprint 2 is not mandatory.

Commercial layers are explicit **when Growth Budget is the selected model**: **Committed Growth Budget = Fixed Management Fee + Variable Growth Budget**. The Fixed Management Fee is a separately visible, client-specific line inside the budget; the variable part funds media, content/production, software/usage, experiments and other approved inputs. Unused variable funds remain the client's growth funds. Any legally available Performance Fee is client-specific, earned separately above the Growth Budget and never taken from its unspent balance. Canonical definitions, rollover, revenue baseline, measurement and legal gates: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`. Performance Compensation remains optional and gated; it is not an automatic part of Growth System.

## 8. Dual-axis reporting and Client Growth Statement
CAESTHETIC manages every engagement on two explicit axes:

1. **Contractual scope** — what CAESTHETIC owns, with detailed tasks, status, evidence, blockers and controls in the internal operating layer.
2. **Client-visible value** — what became better in the business during the period, presented in a short, mobile-first owner-facing layer.

Monitoring, analytics and task volume are enabling work, not the main client product. The monthly **Client Growth Statement** answers: **What became better in this business in the last 30 days because of CAESTHETIC?** It shows, when applicable and verifiable:

- the three most important changes of the month;
- attributable or recovered patients and value, without converting estimates into facts;
- before → after conversion changes;
- reactivation movement and the active recovery loop;
- reputation-request, response and recovery flow;
- administrator response, follow-up and conversion performance;
- where the approved Growth Budget went and what each allocation is expected to produce;
- experiments as tested → kept/stopped;
- work already launched and now maturing; and
- the next three owner-relevant actions.

The Statement must not lead with “we monitored”, “we analysed”, “we coordinated”, “we held meetings”, “we updated the tracker”, task/hour/content counts or a tool launch without adoption. Those facts may support delivery evidence, but the owner summary begins with the live business change, before → after state, evidence and why it matters.

Initiatives move through **Shipped → Adopted → Impact → Maturing**, matching the global lifecycle in `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`. `Shipped` proves implementation, `Adopted` proves the workflow is being used, `Impact` records a verified business effect, and `Maturing` makes an objective longer horizon visible. Shipping is activity, not automatically impact; absence of verified impact must be stated honestly. Numbers and causal claims follow the Class A/Class B evidence rules in `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md` and the global evidence classes in `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`.

The detailed operations/status/evidence layer remains canonical for delivery and audit; it is not pasted wholesale into the owner surface. Growth Ledger automation, verified-facts → AI draft → human approval, Request Router and add-on operating logic are specified once in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## 9. Review-capture module
Reference implementation:
- `site-raimovdental/feedback-hub/`
- `docs/raimov/operations/expert-dental/reputation/POST_VISIT_FEEDBACK_LOOP.md`
- `docs/raimov/operations/expert-dental/reputation/IMPLEMENTATION_PLAN_ATOMIC.md`

Reusable: post-visit feedback, star UX, non-generated review-writing guidance, platform selection, recovery workflow, alerts/SLA, analytics, opt-out/frequency controls, no rewards, no AI-generated reviews.

For CAESTHETIC this is primarily a **Reputation** Sprint module. Do not copy 4–5★ public / 1–3★ private routing blindly. Adapt each US implementation to current platform rules, law and healthcare/privacy requirements; prohibited review gating is forbidden.

## 10. Commercial integrity
- Never manufacture unfinished work to force Month 2 or retainer.
- Never guarantee rankings, patients or revenue.
- No fake cases, logos or proof.
- Sprint→retainer conversion is not a delivery success metric.
- Client can stop after any purchased Sprint.
- Ongoing work must be distinguishable from finite implementation.

## 11. Current launch dependencies
Founder/operator dependencies before scalable outbound:
- complete Instantly warm-up and deliverability approval for registered sending accounts;
- Valerie Petra walkthrough recording and quality-assurance capacity for every approved Growth Score;
- Stripe/payment setup;
- funnel analytics.

Current research universe: **Scottsdale · Nashville · Charlotte · Tampa · Raleigh · Austin · Naples · Charleston · Greenville**. Collect contacts/evidence across all nine before final ranking/sequencing unless founder changes the plan.

### Email identity and sender-role registry

Founder-confirmed on 2026-08-11. All mailboxes below are registered and were added to Instantly warm-up.

| Role | Domain | Mailboxes | Operational boundary |
|---|---|---|---|
| Cold outbound | `caesthetic.co` | `valerie@caesthetic.co`, `harper@caesthetic.co`, `lana@caesthetic.co`, `aurora@caesthetic.co`, `scarlett@caesthetic.co`, `sienna@caesthetic.co`, `chloebennett@caesthetic.co`, `willow@caesthetic.co` | Cold campaigns only after warm-up and deliverability approval. |
| Notifications | `caesthetic.com` | `notifications@caesthetic.com` | Transactional/system notifications; never use for cold outreach. |
| Website | `caesthetic.com` | `info@caesthetic.com` | Designated public website contact. Updating live site copy is a separate runtime change and deploy. |

Sender-role separation is mandatory: cold outreach stays on `caesthetic.co`; the primary `caesthetic.com` domain remains reserved for the public site and operational mail. Credentials, provider tokens and DNS secrets remain outside Git.

### Public business identity

Founder-confirmed on 2026-08-12: **Valerie Petra** is the public face of CAESTHETIC, including its LinkedIn presence. This is the only current public CAESTHETIC identity label. No LinkedIn URL may be published until a canonical profile URL is confirmed in the repository.

No canonical Valerie Petra personal LinkedIn URL is verified in the repository yet. The legacy name-bearing URL must not be published or redirected by assumption. Public runtime and identity registries keep the profile URL empty until the approved canonical URL is verified; stable technical ids and service/file names containing `valeriia` remain unchanged unless a separately scoped migration is approved.

## 12. Authority map
- Global architecture: `docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md`
- Global marketing canon: `docs/ssot/MARKETING_SYSTEM_STANDARD.md`
- Productization / Growth Control: `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md`
- Evidence / Impact Ledger: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
- Domain/runtime registry: `docs/ssot/PROJECT_DOMAIN_REGISTRY.md`
- Master strategy: this file — CAESTHETIC is a reference implementation and project adapter, not the source of the global rules above
- Growth Score detailed spec: `docs/caesthetic/growth_score_spec.md`
- Valerie Growth Score walkthrough script and production rules: `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`
- Growth economics and measurement: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`
- Growth System operations, automation and request/add-on classification: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`
- Owner VOC, canonical marketing questions and first-carousel topic order: `docs/ssot/CAESTHETIC_OWNER_MARKETING_QUESTIONS.md`
- Expert Dental/Raimov client history: `docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md` — client-specific legacy commercial arrangement; not reusable CAESTHETIC dental pricing, budget, attribution or performance-fee canon
- Historical Sprint working spec: `docs/caesthetic/growth_sprint_spec.md` — non-canonical where conflicting (including old price/retainer assumptions)
- Knowledge/runtime lane: `docs/projects/caesthetic/`
- Production root: `site-caesthetic/`

`docs/ssot/CAESTHETIC_DELIVERY_AND_COMMUNICATION.md` is deprecated after this consolidation and only points here.
