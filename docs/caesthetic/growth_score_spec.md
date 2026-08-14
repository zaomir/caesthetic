---
owner: CAESTHETIC
status: active
version: 3.0
updated: 2026-08-14
scope: public intake, AI-assisted research, human approval, controlled learning, scoring and owner-cockpit contract
parent: docs/ssot/CAESTHETIC.md
---

# CAESTHETIC Growth Score — detailed specification

`docs/ssot/CAESTHETIC.md` is the master product and strategy authority. This document is its subordinate implementation specification. It defines the Four-Surface metric catalogue, evidence and review gates, scoring policy, and the content contract for real and synthetic reports. It must not create a competing product model.

Growth Score answers one owner question: **where is the practice losing patients, what should it fix first, and what should it not spend money on yet?** It is a self-contained diagnosis and remediation plan, not a Sprint scope, ranking guarantee, patient forecast, or revenue forecast.

## 0. Public intake and case creation

The canonical inbound entry is `/growth-score/`. It is a three-stage experience with only four required fields across the first two stages:

1. **Contact:** `Your name`, `Work email`.
2. **Practice basics:** `Practice name`, `City, State`.
3. **Thank you + optional enrichment:** begin with `Thank you — this is enough for us to start.` The required request is already accepted before any optional question is shown.

Optional enrichment may ask for website, Google Business Profile and Instagram URLs; priority treatments; booking URL/system; the owner's main concern; relevant competitors; preferred contact/phone; and permission for a truthful, non-clinical test of the public enquiry path. `Skip` is a successful completion, abandonment of enrichment does not cancel the case, and optional answers may not become a hidden eligibility gate.

Do not ask for revenue, marketing budget, patient-level data or PHI, credentials, account access or vendor access during the free intake. If the practice cannot be resolved unambiguously from the required fields, request one public identifier later by email instead of adding another required gate.

Intake answers are context, not external evidence. They remain `self_reported` and do not become Class A or increase score coverage until independently verified. Funnel analytics may record stage completion such as `view`, `contact_continue`, `required_submit_success` and `optional_saved`, but event payloads must not contain PII or field answers.

A proactive/outbound Score based only on public evidence remains a separate acquisition path. It must not be represented as a completed owner intake and follows the same evidence, human-review and private-delivery gates below.

## 1. Required owner outcome

Every publishable owner cockpit must make these items explicit:

- the four surface scores: Search, Website, Social and Reputation, as secondary navigation;
- Cross-Surface Consistency as a separate score;
- overall score as secondary navigation/tension only, with an approximate-weights disclosure;
- one evidence-backed objective strength;
- strongest surface;
- binding constraint;
- named competitors and their evidence where comparison is applicable;
- exactly three human-approved top priorities;
- one `do_not_do` recommendation;
- the full evidence-backed Problem Inventory;
- a concrete remediation task list with sequence, dependencies, effort/complexity, implementation risk and acceptance evidence;
- next actions that the owner, an alternative provider or CAESTHETIC can execute without hidden instructions;
- an honest `Why CAESTHETIC / Why the 30-Day Sprint` explanation and explicit no-lock-in/client-ownership language;
- methodology, limitations and Class A/Class B disclosure;
- human reviewer state and, for a real report, a 4–6 minute Valerie Petra walkthrough link or an explicit pending placeholder;
- one CTA to `/sprint/`.

The report must praise one objectively strong point. If no defensible strength exists, the practice does not pass the Growth Score ICP gate and the report is not published. Scores never outrank the human-approved inventory: when a number and verified problem severity disagree, the evidence, dependencies and remediation logic control the decision.

## 2. Scoring model

Patients evaluate a practice across exactly four decision surfaces. The current production engine owns these fixed **heuristic display weights**:

| Surface | Outer weight |
|---|---:|
| Search | 30% |
| Website | 25% |
| Social | 15% |
| Reputation | 30% |

**Cross-Surface Consistency is not a fifth surface.** It is scored separately and is excluded from the overall calculation to prevent double counting.

The weights make reports comparable and power a compact navigator. They are approximate, not absolute truth, causal attribution or a formula for Sprint priority/scope. Binding constraint, priorities and task order come from the verified Problem Inventory, dependencies, risk and implementation judgment.

The engine, fixtures, renderer and documentation must use the exact `metric_id` values and weights below. Labels may be made reader-friendly; IDs and weights may not be renamed, omitted, added or reweighted without changing the master canon first.

### 2.1 Search — 30% outer weight

| `metric_id` | Component weight | What is measured | Primary method |
|---|---:|---|---|
| `map_visibility` | 35 | Geographic visibility for priority treatment intent | Local Falcon or equivalent 5×5 geo-grid, five-mile radius, priority city queries; record average position and top-3 coverage by query |
| `gbp_treatment_category_completeness` | 20 | Correct primary/secondary categories and treatment/service coverage in GBP | Direct GBP observation against current priority-treatment catalogue and named local competitors |
| `entity_integrity` | 15 | Identity resolution across GBP, website and major directories | Compare legal/trading name, address including suite/unit, phone and duplicates across GBP, website, Yelp/Facebook/Bing Places as available |
| `gbp_conversion_readiness` | 15 | Ability to move from GBP discovery to an enquiry or booking | Observe appointment URL, phone, relevant services, photos, hours and functioning destination paths |
| `freshness` | 10 | Current activity on the search surface | Date-stamped observation of recent GBP photos/posts/service changes or other approved freshness signals |
| `branded_search_control` | 5 | Accuracy and ownership of the branded results experience | Branded SERP inspection for correct site/profile, conflicting entities, outdated pages and obvious reputation/navigation distractions |

Local Falcon screenshots and exports are Class A evidence when the query, grid centre, radius, date and competitor set are retained. A single manually checked map position is not a substitute for the geo-grid.

`entity_integrity` concerns business identity, not wording similarity. Minor formatting differences are not failures; conflicting names, addresses, phones, duplicate profiles or stale post-move/rebrand entities are. Publish a clean result when no mismatch exists—clean evidence is part of the objective strength of a report.

### 2.2 Website — 25% outer weight

| `metric_id` | Component weight | What is measured | Primary method |
|---|---:|---|---|
| `booking_friction` | 25 | Friction from entry page to a usable booking/enquiry action | Reproducible mobile path, click count, dead ends, forced choices and requested fields; compare the same task with named competitors where useful |
| `treatment_clarity` | 20 | Clarity and completeness of priority-treatment information | Anchored rubric covering treatment naming, candidacy, expected process, clinician context and next step |
| `mobile_performance` | 15 | Performance on the dominant mobile journey | PageSpeed/Lighthouse or equivalent date-stamped measurement, including LCP and material blocking failures |
| `above_fold_conversion` | 15 | Immediate mobile comprehension and action | Anchored review of service/location clarity, phone/booking visibility and primary CTA before scroll |
| `clinician_trust_proof` | 10 | Verifiable clinician, credential and treatment proof | Anchored review with direct page/screenshot evidence; no inference from generic stock copy |
| `mystery_shopper` | 10 | Actual response to a permitted test enquiry | Human-executed submission with exact timestamp, channel, requested treatment and response checks at 24/48/72 hours |
| `technical_booking_integrity` | 5 | Whether the booking path functions end to end | Test destination, redirects, mobile controls, form submission acknowledgement and obvious tracking/path breakage without creating a real appointment |

Mystery shopping must use a real monitored inbox and truthful, non-clinical wording; it must not impersonate a patient with an urgent medical need or create an unwanted appointment. Record a positive result as a strength when response is fast and useful. An AI-generated draft or guessed response time is unavailable, not evidence.

### 2.3 Social — 15% outer weight

| `metric_id` | Component weight | What is measured | Primary method |
|---|---:|---|---|
| `priority_treatment_presence` | 20 | Whether priority treatments are visibly represented | Date-stamped sample of current profile, pinned content and recent posts against the priority-treatment catalogue |
| `clinician_expertise` | 20 | Whether real clinicians demonstrate relevant expertise | Anchored rubric using named clinician content, education and role clarity; generic brand claims do not count as clinician proof |
| `proof_quality` | 20 | Quality and verifiability of treatment/social proof | Anchored rubric for authentic, compliant, attributable proof; no fabricated outcomes or client relationship |
| `recency` | 15 | Current publishing activity | Date of most recent relevant content and cadence over the documented sample window |
| `profile_to_booking` | 15 | Continuity from social profile to a working booking path | Direct mobile test of bio link, location/service selection and final enquiry/booking destination |
| `local_offer_clarity` | 10 | Clear local practice, service and location proposition | Anchored observation of bio and current content, without treating keyword repetition as quality |

The social sample window, accounts inspected and collection date must be recorded. Inactive or inaccessible accounts are not assumed to perform poorly without evidence: inaccessible evidence is unavailable.

### 2.4 Reputation — 30% outer weight

| `metric_id` | Component weight | What is measured | Primary method |
|---|---:|---|---|
| `review_velocity_90d` | 25 | Reviews added during the last 90 days | Date-stamped review collection for the practice and named local competitors using the same window and source |
| `rating` | 10 | Current public rating | Direct platform observation with rating, review count and collection date |
| `review_depth` | 10 | Specificity and decision value of review content | Anchored sample rubric for treatment, clinician, experience and outcome/process detail; respect privacy and platform rules |
| `recency` | 10 | How current the review evidence is | Days since most recent eligible review and distribution over the sample window |
| `response_coverage` | 15 | Share of eligible reviews receiving an owner response | Deterministic count over a disclosed window/sample |
| `response_speed` | 10 | Delay between review and owner response | Date/timestamp comparison where platform data makes it observable; otherwise unavailable |
| `negative_review_handling` | 10 | Quality and safety of responses to negative reviews | Human anchored rubric covering acknowledgement, privacy, escalation and absence of argument or protected-health disclosure |
| `treatment_clinician_proof` | 10 | Treatment/clinician evidence present in reviews | Anchored count/sample with direct evidence references; do not infer unmentioned treatments |

Review velocity is a core observable comparison: name the real local competitors, preserve the selection rule, source and identical 90-day window, and show the practice and competitor counts. Do not write a future overtake date unless the method and assumptions are disclosed as Class B.

### 2.5 Cross-Surface Consistency — separate

| `metric_id` | Component weight | What is measured | Primary method |
|---|---:|---|---|
| `treatment_presence` | 30 | Priority-treatment presence across all four surfaces | Anchored matrix of treatment × surface; absence is scored only where the surface was observable |
| `positioning_coherence` | 20 | Coherence of the practice proposition | Anchored comparison of actual claims and emphasis, not literal keyword matching |
| `proof_continuity` | 20 | Whether proof follows the same priority treatments and clinicians | Anchored evidence chain across site, social, GBP and reviews |
| `conversion_continuity` | 20 | Whether each discovery surface reaches a functioning next step | Direct path tests from GBP/social/reviews context to website enquiry/booking |
| `identity_coherence` | 10 | Consistent identity and location presentation | Cross-check name, address, phone, clinician/practice identity and destination ownership |

Cross-Surface findings can explain a binding constraint, but the score never enters the 30/25/15/30 overall formula.

## 3. Production metric schema

Each canonical metric record validates at least these fields:

| Field | Contract |
|---|---|
| `metric_id` | Required exact ID from §2; unique within its surface |
| `raw_value` | Required; typed source value or `null` when unavailable. `0` is valid and must not be treated as missing |
| `normalized_score` | Required; number `0..100` or `null`. Preserve unrounded precision for calculation |
| `evidence_class` | Required enum `A` or `B` |
| `source` | Required non-empty source/reference for a scored metric; may be `null` only when unavailable |
| `collected_at` | Required valid collection timestamp/date for a scored metric; may be `null` only when unavailable |
| `reviewer_status` | Required enum: `ai_draft`, `pending`, `approved`, `rejected` |

Canonical weights are engine configuration, not client-controlled input. Input `weight` cannot change scoring. The production validator should reject a non-canonical supplied weight; a legacy adapter may drop the field only after verifying it equals the canonical value. The output may expose the engine-derived canonical weight for auditability.

Evidence references use `surface.metric_id`, for example `search.map_visibility`; Cross-Surface references use `cross.metric_id`, for example `cross.treatment_presence`. Unknown IDs or references are validation failures.

### 3.1 Evidence classes

- **Class A — observable fact:** direct, dated and reproducible evidence such as geo-grid results, public profile fields, review counts, click paths, measured performance or a recorded mystery-shopper event.
- **Class B — estimate/inference:** a conclusion requiring assumptions, sampling or modelling. It must say `estimate` or `inference`, disclose method and assumptions, and retain evidence references.
- Unknown, inaccessible, stale beyond the method window, unsupported or contradictory evidence is **unavailable**: `raw_value=null`, `normalized_score=null`. It is not silently converted to zero and Class B may not be invented to fill the gap.
- Intake assertions remain `self_reported`. They may inform research questions, but do not become Class A, supply a missing metric or increase coverage unless a human verifies them against an independent source.

The missed-enquiry estimate is optional Class B context. It is not a required headline, does not replace objective strength or binding constraint, and must never be presented as a patient/revenue forecast. When used, publish a conservative range, named inputs, collection dates, calculation and assumptions.

### 3.2 Objective and anchored normalization

Every metric has one documented normalization rubric/version in the production scoring authority:

- **objective metrics** normalize reproducible raw evidence with a deterministic rule;
- **anchored or human-review metrics** normalize against a documented rubric and anchor examples;
- an AI or deterministic draft/pre-score is not final and must remain outside the publishable `normalized_score` while `reviewer_status=ai_draft` or `pending`;
- every metric included in a published score—not only anchored metrics—requires `reviewer_status=approved`; `rejected` makes it unavailable until corrected;
- approval never repairs a missing source, collection date or raw value.

Therefore a publishable metric may have a non-null `normalized_score` only when it is approved. A pending record may retain its observed `raw_value`, source and collection date for review, but it contributes zero available weight until approval. At minimum, treatment clarity, above-fold conversion, clinician/trust proof, social expertise/proof/local clarity, review depth/negative handling/treatment proof and all Cross-Surface coherence rubrics use anchored human review.

## 4. Coverage and calculations

For one surface, let `available_weight` be the sum of canonical component weights whose metric has human-verified Class A evidence, a final normalized score, and required approval. Class B estimates/inferences and `self_reported` intake context may support narrative but never fill observable score coverage.

```text
coverage = available_weight / 100

if available_weight < 70:
    surface_score = null
    display = "Insufficient evidence"
else:
    surface_score = Σ(normalized_score × canonical_weight) / available_weight
```

Rules:

1. The `70%` boundary is inclusive: exactly 70 is sufficient.
2. Only available canonical weights are renormalized. Missing metrics do not become zero.
3. Calculate with full precision; round only for display.
4. Cross-Surface uses the same coverage and renormalization rule.
5. Overall is computed only when **all four** surfaces are sufficient. Otherwise overall is `null` / `Insufficient evidence`; the engine must not invent a partial overall number.
6. When all four are sufficient:

```text
overall = search × 0.30
        + website × 0.25
        + social × 0.15
        + reputation × 0.30
```

7. Cross-Surface is excluded from overall.

`/100` supports navigation between evidence sections; it does not replace the human diagnosis.

## 5. Findings and human diagnosis

### 5.1 Publication evidence gate

At least 80% of published findings must be Class A. There is no separate `report.findings` collection. The publication registry is built from these outward diagnostic items:

- each non-empty `finding` on a final, approved surface or Cross-Surface metric;
- `humanDiagnosis.objective_strength` and `humanDiagnosis.binding_constraint`;
- each of the three `humanDiagnosis.top_priorities`;
- `humanDiagnosis.do_not_do`;
- each item in `humanDiagnosis.problem_inventory`;
- each optional item in `estimates`.

An item is counted once from its schema location even when the renderer repeats it in a summary/card. Competitors, methodology prose and the walkthrough state are context, not additional findings. The ratio is:

```text
class_a_ratio = Class A published findings / all published findings
```

`class_a_ratio < 0.80` is a hard publication/render failure. Every Class B finding must be visibly labelled and include its method and assumptions. A report with no findings fails validation.

Metric `finding` is a non-empty string when that metric produces an outward finding; its Class A/B value comes from the metric record. Evidence-backed human-diagnosis items derive their class from `evidence_refs` unless `evidence_class` is explicitly supplied; any Class B reference makes the item Class B. Every Class B metric/diagnosis/estimate additionally requires:

```text
evidence_class: "B"
finding_type: "estimate" | "inference"
method: non-empty string
assumptions: non-empty string | non-empty string[]
```

An optional standalone `estimates[]` item has at least `{ title, evidence_class: "B", finding_type, method, assumptions }`. Evidence references may be added when applicable, but an estimate never supplies missing metric evidence or coverage.

### 5.2 `humanDiagnosis`

The report separates human synthesis from mechanical scoring. Required fields/sections are:

- `reviewer_status`: final report state; publication requires `approved`;
- `objective_strength`: `{ title, evidence_refs }`, one defensible positive conclusion with a non-empty evidence reference list;
- `strongest_surface`: a string containing one of `search`, `website`, `social`, `reputation`, supported by scores and human context;
- `binding_constraint`: `{ title, evidence_refs }`, the principal limiting problem with a non-empty evidence reference list;
- `top_priorities`: **exactly three** objects with at least `{ id, title, evidence_refs, impact }`, selected by a human;
- `problem_inventory`: the complete diagnostic array specified in §5.3, separate from `top_priorities`;
- `remediation_tasks`: the executable, dependency-aware plan specified in §5.4;
- `do_not_do`: exactly one `{ title, evidence_refs }` recommendation;
- `competitors`: either `{ status: "applicable", selection_method, entries: [{ name, evidence_refs }] }` with at least one named entry, or `{ status: "not_applicable", reason }`;
- `walkthrough`: either `{ status: "available", url }` with a valid URL, or `{ status: "pending", url: null, placeholder }`.

`top_priorities` are not a shortened substitute for the inventory or task list. Each priority references one or more inventory/evidence IDs and describes why it comes first. No item may say that Sprint work is purchased, committed or guaranteed.

### 5.3 Full Problem Inventory

The inventory is mandatory and exhaustive for the evidence reviewed. Each item contains at least:

| Field | Requirement |
|---|---|
| `id` | Stable unique problem ID |
| `surface` | `search`, `website`, `social`, `reputation` or `cross_surface` |
| `title` | Specific problem statement, not a generic service recommendation |
| `evidence_refs` | Non-empty references to canonical metrics/findings |
| `impact` | Evidence-backed consequence and priority rationale; estimates labelled Class B |
| `task_refs` | One or more remediation task IDs for an actionable problem; empty only with an explicit non-actionable/monitor reason |
| `suggested_horizon` | Diagnostic horizon such as immediate, 30–90 days, longer-term or defer |
| `status` | Diagnostic state such as `diagnosed`, `monitor` or `not_actionable`; never implied purchased scope |

The inventory is an input to later Sprint A/B/C scoping **only after purchase**. Growth Score does not assign, promise or pre-sell Sprint buckets, completion dates or results. The practice may act in-house, use another provider, defer, or later purchase a Sprint.

### 5.4 Remediation task list

Every actionable inventory problem maps to one or more concrete tasks. The plan must be sufficiently complete for a competent owner or alternative provider to implement it; instructions may not be hidden to manufacture a sale. Each task contains at least:

| Field | Requirement |
|---|---|
| `id` | Stable unique task ID |
| `problem_refs` | One or more Problem Inventory IDs |
| `outcome` | Specific desired state, not a service category |
| `steps` | Concrete implementation steps or checkpoints |
| `evidence_refs` | Evidence proving why the task exists |
| `prerequisites_access` | Accounts, approvals, inputs or skills required; `none` when genuinely none |
| `dependencies` | Earlier task IDs or external dependencies; empty only when independent |
| `sequence` | Human-approved order and rationale |
| `owner_role` | Role/skill capable of doing and accepting the work; never assumed to be CAESTHETIC |
| `effort_complexity` | Honest relative effort/complexity band with a short explanation, not false precision |
| `implementation_risk` | Material failure/privacy/platform/coordination risk and mitigation |
| `horizon` | Expected implementation or maturation horizon without a result guarantee |
| `acceptance_evidence` | Observable definition of done: live URL/state, screenshot, export, test or other verifiable proof |
| `next_action` | First executable action |

Task volume must reflect the real evidence. Do not invent remediation to make the engagement look larger. When evidence is insufficient, show the missing research/verification action and `Insufficient evidence` rather than a fabricated fix.

## 6. Report content and renderer contract

The renderer must accept both `reportKind=real` and `reportKind=demo`; it must not depend on a `demo-*` directory name.

### 6.1 Required presentation

Use this owner decision hierarchy:

1. Practice, market, collection/preparation date, human reviewer state and report disclosure; the Valerie Petra walkthrough is visible near the top.
2. Human diagnosis: objective strength, strongest surface, binding constraint and material named-competitor evidence.
3. Exactly three top priorities, followed by the complete remediation task list with order, dependencies, complexity, risks and acceptance evidence.
4. A compact overall/four-surface score navigator. Scores may create tension and link into evidence, but must be visually and verbally secondary; approximate weights are disclosed beside the score method.
5. Surface and Cross-Surface evidence drill-down, with `Insufficient evidence` where required, plus named competitor comparisons where applicable.
6. Full Problem Inventory and one `do_not_do`, without hiding lower-priority findings.
7. Immediate next actions and implementation paths: do it in-house, use another provider, defer, or ask CAESTHETIC to scope selected work.
8. `Why CAESTHETIC / Why the 30-Day Sprint`: CAESTHETIC has already assembled the evidence and diagnosis, understands dependency order, and can implement, coordinate and accept the selected changes within a written 30-day scope. This is an honest convenience argument, not exclusivity or a guarantee.
9. Methodology, data windows, sources, limitations, Class A ratio and labelled Class B methods/assumptions.
10. One calm link to `/sprint/`; state that scope is confirmed separately and every post-Sprint path is optional.

Surface sections should carry the useful diagnostic evidence from the former long-form template:

- Search: Local Falcon maps, Entity Integrity and branded/GBP evidence;
- Website: conversion path, performance and mystery shopper;
- Reputation: 90-day review velocity, responses and named competitors;
- Cross-Surface: treatment/positioning/proof/conversion/identity continuity;
- Summary: objective strength, constraints, priorities, walkthrough, method, limitations and `do_not_do`.

Conditional reactivation arithmetic may appear as optional Class B context when grounded in client-supplied inputs. It is not a fifth surface and does not affect scores.

The owner owns the delivered report, evidence pack and task plan and may use them without CAESTHETIC. There is no lock-in. The cockpit should make real workload, specialist needs, dependencies, coordination cost and implementation risk visible, while preserving complete instructions; CAESTHETIC should look like the simplest executor because it already understands the case, not because information was withheld.

### 6.2 Privacy and truthfulness

- A real report is delivered at `/score/<unguessable-slug>/`, must emit `noindex,nofollow,noarchive`, stay outside the sitemap and use a non-guessable slug. It is not password-gated by default.
- A real report names or redacts the practice only according to truthful permission and handling rules.
- Every demo is clearly marked **synthetic**, states that no client relationship is represented, and uses fictional practice/person data. Its score is calculated by the same production authority and exact metric catalogue as a real report.
- No fake logos, testimonials, patient claims, rankings, revenue outcomes or `as seen in` proof.
- No guarantee of rankings, patients, enquiries or revenue.
- No treatment-supply promotion and no prohibited review gating.

## 7. AI research, human approval and controlled learning

The canonical state flow is:

```text
versioned intake
→ unverified candidate evidence
→ internal AI draft diagnosis / inventory / remediation plan
→ human verification and correction
→ frozen verified fact set
→ deterministic scores + final narrative compiled only from verified facts
→ named human approval
→ private owner cockpit + Valerie Petra walkthrough
```

Logical records are `score_case`, `candidate_evidence`, `verified_fact_set`, `draft`, `review_event`, `approved_report`, `learning_candidate` and `rule_release`. They may share storage, but their states may not be collapsed in a way that makes an AI draft publishable.

1. Create the case from the versioned required intake, optional context or a clearly separate public-evidence outbound path.
2. Resolve the practice, priority treatments, market and named competitor-selection rule.
3. AI-assisted research collects all obtainable external evidence across Search, Website, Social and Reputation; Cross-Surface remains separate. Each candidate retains surface/metric, source URL or snapshot/reference, collection date, method/workflow version, proposed evidence class, verification state and supersession link. Unknowns remain `null`.
4. AI may propose pre-scores, objective strength, binding constraint, priorities, the full Problem Inventory, remediation tasks, sequencing and draft language. This is an internal candidate only.
5. A named human reviewer checks source lineage, dates, method and competitor selection; verifies every proposed Class A fact; approves/rejects metric scores and anchored judgments; corrects the constraint, priority, wording and every task's sequence, dependencies, role/skill, effort/complexity, risk and acceptance evidence; and clears privacy/compliance issues.
6. Freeze the verified fact set. Final scores are calculated deterministically, and final narrative is compiled only from verified facts plus visibly labelled Class B items with method and assumptions.
7. Validate `≥80%` Class A published findings, the surface coverage rules and every evidence reference. Pre-review AI content or an unnamed approval is a hard publication failure.
8. Render and visually verify the cockpit. A named human approves a versioned report with reviewer and timestamp before the private link is delivered.
9. Valerie Petra records the 4–6 minute walkthrough: objective strength → binding constraint → decisive evidence → top priorities/tasks and dependency order → what not to do → optional implementation path. It may explain why the 30-Day Sprint is convenient, but may not imply guaranteed or already-purchased scope.

### 7.1 Controlled learning layer

Human corrections improve later Scores only through an explicit, auditable learning layer—not through hidden chat/model memory.

- Every correction is an append-only `review_event` retaining before/after values, reviewer, reason code, timestamp and model/workflow/template/rule versions. The superseded draft remains auditable.
- A case-specific correction creates, at most, a de-identified `learning_candidate`; it never changes global behavior automatically.
- A named method owner may promote a candidate into a versioned extraction rule, checklist, rubric, taxonomy, priority heuristic, remediation template, approved example or eval only after review.
- Each `rule_release` records scope, approver, changelog, effective date, validation/eval result and rollback target. New cases resolve one approved bundle version; published historical reports are not silently rewritten.
- No automatic fine-tuning, uncontrolled model memory or cross-client transfer of raw client data, contact data, credentials, PHI or other sensitive content.
- Research-quality learning is separate from intervention/outcome learning. A better diagnosis may be learned from review corrections; task effectiveness may be generalized only after adoption and result evidence, never from the recommendation alone.

## 8. Methodology and limitations disclosure

`methodology` uses one renderer contract:

```text
{
  sources: non-empty string[],
  collectedAt: valid date/date-time,
  competitorSelection: non-empty string,
  limitations: non-empty string
}
```

This summary does not replace per-metric `source` and `collected_at`. Every report discloses:

- tools and source URLs/references;
- collection dates and sample windows;
- geo-grid centre/radius/queries when map visibility is used;
- named competitors and their selection rule;
- normalization/rubric version;
- unavailable metrics and resulting coverage;
- Class A ratio;
- method and assumptions for every Class B estimate/inference;
- human reviewer status; metric collection dates remain attached to the evidence;
- that results are not guaranteed and the report is not a revenue forecast.

The method must be inspectable enough for an owner to reproduce the material facts. Unsupported narrative, generic SEO advice and any metric the owner cannot trace to evidence are excluded.

## 9. Production acceptance gates

Growth Score is not complete until production tests prove all of the following:

- three-stage intake with exactly four required fields across stages 1–2, successful required submission before stage 3, and a successful `Skip` path;
- optional/self-reported inputs do not gate completion, become Class A or increase score coverage without independent human verification;
- exact canonical metric IDs and all component/outer weights;
- arbitrary or wrong input weight cannot change a score;
- exactly-70% renormalization and below-70% insufficient evidence;
- human approval for every scored metric, including the anchored-metric gate and no final AI-only diagnosis;
- no draft can publish without a named human approver and timestamp;
- hard failure below 80% Class A findings;
- 30/25/15/30 overall math only when all four surfaces are sufficient;
- Cross-Surface excluded from overall;
- exactly three top priorities, a separate valid full Problem Inventory and complete remediation task mappings;
- task dependencies, complexity, risk and acceptance evidence render before the score drill-down, while overall/surface scores remain a labelled approximate navigator;
- one `do_not_do`;
- DIY/alternative-provider use, client ownership, no lock-in and honest `Why CAESTHETIC / Why Sprint` language;
- real and demo rendering through the same authority;
- real-report `noindex` and unguessable route contract;
- prominent synthetic/no-client-relationship demo disclosure;
- correction events do not activate a global rule; promoted rules require version, approver, changelog, validation and rollback;
- render-drift check against generated report artifacts.

Any legacy scorer may remain only as a thin CLI/import wrapper around the one production scoring authority. Two independent metric catalogues or scoring implementations are forbidden.
