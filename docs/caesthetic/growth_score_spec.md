---
owner: CAESTHETIC
status: active
version: 5.2.1
updated: 2026-09-02
scope: public intake, AI-assisted research, Cross-Surface Journey Graph evidence, named-human Focus Selection, controlled learning, scoring, an unnumbered Intro and a nine-section owner-cockpit contract
schema_contract: 5
template_contract: growth-score-report-template/5.2.0
intro_section: unnumbered
cockpit_sections: 9
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
---

# CAESTHETIC Growth Score — detailed specification

`docs/ssot/CAESTHETIC.md` is the master product and strategy authority. This document is its subordinate implementation specification. It defines the Four-Surface metric catalogue, evidence and review gates, scoring policy, and the content contract for real and synthetic reports. It must not create a competing product model.

Growth Score answers one owner question: **where is the practice losing patients, what should it fix first, and what should it not spend money on yet?** It is a self-contained diagnosis and remediation plan, not a Sprint scope, ranking guarantee, patient forecast, or revenue forecast. Competitive decisions inherit the global `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`; `docs/caesthetic/competitive_decision_analysis.md` is the CAESTHETIC source/evidence adapter, not a competing method.

## 0. Public intake and case creation

The canonical inbound entry is `/growth-score/`. It is a three-stage experience with only four required fields across the first two stages:

1. **Contact:** `Your name`, `Work email`.
2. **Practice basics:** `Practice name`, `City, State`.
3. **Thank you + optional enrichment:** begin with `Thank you — this is enough for us to start.` The required request is already accepted before any optional question is shown.

Optional enrichment may ask for website, Google Business Profile and Instagram URLs; priority treatments; booking URL/system; the owner's main concern; relevant competitors; preferred contact/phone; and permission for a truthful, non-clinical test of the public enquiry path. `Skip` is a successful completion, abandonment of enrichment does not cancel the case, and optional answers may not become a hidden eligibility gate.

Do not ask for revenue, marketing budget, patient-level data or PHI, credentials, account access or vendor access during the free intake. If the practice cannot be resolved unambiguously from the required fields, request one public identifier later by email instead of adding another required gate.

Intake answers are context, not external evidence. They remain `self_reported` and do not become Class A or increase score coverage until independently verified. Funnel analytics may record stage completion such as `view`, `contact_continue`, `required_submit_success` and `optional_saved`, but event payloads must not contain PII or field answers.

A proactive/outbound Score based only on public evidence remains a separate acquisition path. It must not be represented as a completed owner intake and follows the same evidence, human-review and private-delivery gates below.

### 0.1 Report context: vertical and locale

Growth Score remains one product, engine, report template and funnel. `reportContext` carries two independent adaptation dimensions; it does not create a vertical-specific Growth Score or change the CAESTHETIC product ladder:

```json
{
  "reportContext": {
    "vertical_context": "aesthetic_practice",
    "report_locale": "en",
    "vertical_source": "owner_intake",
    "locale_source": "user_selected"
  }
}
```

| Field | Allowed values | Meaning |
|---|---|---|
| `vertical_context` | `aesthetic_practice`, `dental_practice`, `beauty_salon`; `unresolved` only before research-brief freeze | Context for evidence rubrics, service/treatment vocabulary, examples and the comparable patient/client-choice market. It is not evidence. No additional vertical is allowed without separate approval. |
| `report_locale` | `en`, `ru`, `es`, `fr`, `uk` | Client-facing presentation and preferred walkthrough language. It is not evidence. |
| `vertical_source` | `owner_intake`, `route`, `referral_context`, `human_resolved`, `public_evidence`; `null` while unresolved | Provenance of vertical resolution, retained as context rather than promoted to Class A. |
| `locale_source` | `user_selected`, `route`, `campaign`, `human_resolved`; `null` only until a presentation locale is resolved | Provenance of the presentation-language decision. |

New reports start with `vertical_context: "unresolved"` and must resolve it before the research brief is frozen. Do not infer a vertical from a business name, a single service or a route alone when the entity remains ambiguous; use the clarification path. Existing schema-v4 reports without `reportContext` remain preserved as historical, read-only artifacts with their already-generated English copy. The current schema-v5 renderer does not regenerate or publish them as current reports. They are not retroactively assigned a vertical, rescored or rewritten. Any later migration must resolve context from retained case evidence and record the change through the normal review trail.

`vertical_context` changes only the interpretation context around the same canonical metric IDs. For example, `website.treatment_clarity` may examine injectables, laser, body and skin services for `aesthetic_practice`; implants, aligners, veneers, hygiene and emergency care for `dental_practice`; or hair, nails, brows, lashes, facials and packages for `beauty_salon`. These are illustrative vocabularies, not new metrics or required service catalogues. Competitors must come from the same patient/client-choice market and the same vertical and local geography where applicable. Facts, scores, competitors, benchmarks and conclusions may not be transferred between verticals, and vertical context alone cannot support a finding.

`report_locale` may localize headings, surface display labels, explanatory copy and walkthrough narration. Canonical machine IDs, metric IDs, source URLs and source identifiers remain unchanged. Original evidence language and source text remain preserved; a translated or paraphrased evidence excerpt is labelled as a CAESTHETIC translation/paraphrase where needed. Translation may not change verified facts, evidence references, scores, binding constraint, Focus Gaps or Do Not Fund Yet. If a regulated or clinical term is uncertain, retain the source term beside cautious translated wording and do not invent a medical claim.

The practice identity block may show the resolved type/context when useful, but never as a separate brand or product. Treatment/service examples and implementation-task nouns follow the resolved vertical while retaining the same task schema. Competitor Cards use the resolved comparable market. The optional Sprint CTA remains the same CAESTHETIC 30-Day Growth Sprint, not a vertical-specific commercial product.

Neither context field changes scoring weights, metric IDs, coverage, evidence classes, the unnumbered Intro plus nine-section cockpit order, the funnel or pricing. One approved fact set and human judgment remain the source of truth across every localized presentation; do not create 3 × 5 copies of the template.

## 1. Required owner outcome

Every publishable owner cockpit must make these items explicit:

- the four surface scores: Search, Website, Social and Reputation, as secondary navigation;
- Cross-Surface Consistency as a separate score;
- overall score as secondary navigation/tension only, with an approximate-weights disclosure;
- one evidence-backed objective strength;
- strongest surface;
- binding constraint;
- named competitors and their evidence where comparison is applicable;
- exactly three named-human-approved Focus Gaps: exactly one Primary and exactly two Supporting;
- at least two selected gaps classified `close_in_30_days`, with no more than one `start_in_30_days`;
- one `do_not_do` recommendation;
- the full evidence-backed Gap Inventory, including every reviewed gap and every `insufficient_evidence` state;
- an embedded Repair Plan for every gap, with outcome, DIY steps, dependencies, owner role and acceptance evidence;
- next actions that the owner, an alternative provider or CAESTHETIC can execute without hidden instructions;
- an honest `Why CAESTHETIC / Why the 30-Day Sprint` explanation and explicit no-lock-in/client-ownership language;
- methodology, limitations and Class A/Class B disclosure;
- a completed internal human-review state; reviewer/selector identity and the separate Valerie Petra walkthrough remain outside client-report HTML;
- one CTA to `/sprint/`.

The report must praise one objectively strong point. If no defensible strength exists, the practice does not pass the Growth Score ICP gate and the report is not published. Scores never outrank the human-approved Gap Inventory and Focus Selection: when a number and verified problem severity disagree, the evidence, dependencies and repair logic control the decision.

## 2. Scoring model

Patients evaluate a practice across exactly four decision surfaces. The current production engine owns these fixed **heuristic display weights**:

| Surface | Outer weight |
|---|---:|
| Search | 30% |
| Website | 25% |
| Social | 15% |
| Reputation | 30% |

**Cross-Surface Consistency is not a fifth surface.** It is scored separately and is excluded from the overall calculation to prevent double counting.

The weights make reports comparable and power a compact navigator. They are approximate, not absolute truth, causal attribution or a formula for Sprint priority/scope. Binding constraint, Focus Selection and repair order come from the verified Gap Inventory, dependencies, risk and implementation judgment.

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

`mystery_shopper` remains a canonical **metric/evidence capability** because the engine must preserve a permitted, human-executed observation when one exists. It is not part of the standard Free Score research or spoken walkthrough. In the normal outside-in Free Score it remains unavailable unless an explicit permission and compliant evidence workflow already produced the observation. Valerie must not discuss Mystery Shopper in the Free Score walkthrough; it may be introduced later only if the client continues and the applicable written scope permits it. The walkthrough authority is `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`.

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

### 2.6 Competitive Decision Analysis — cross-cutting, unscored

Competitive Decision Analysis follows `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`. It is mandatory when patients have meaningful alternatives and evidence can change the diagnosis. It is not a fifth surface and does not add a weighted competitor score.

Default set: 3–5 named competitors comprising relevant local alternatives plus, where useful, a category leader or positioning reference. Multi-location practices require a local set per branch when geography changes the patient decision.

Every comparison must preserve comparable query/geography/path/review windows and disclose sample sizes. Review themes require recurrence in at least two independent eligible observations; a single review remains a `single report` and cannot support a generalized weakness. Public ads show visible strategy, not effectiveness.

The required owner outputs are:

1. **Comparison Matrix** — practice plus competitor rows across Search, Website, Social and Reputation; unavailable cells remain `insufficient_evidence`.
2. **Competitor Cards** — selection reason, repeated positive/negative review themes, patient-choice reason, advantage/gap, repeat/improve/do-not-copy action, strategic implication and limitations.
3. **Decision Summary** — evidence-backed `Defend / Close / Differentiate / Do not copy`, with explicit effects on the binding constraint and selected Focus Gaps.
4. **Market Practice Gap** — `applicable`, `no_material_gap` or `insufficient_evidence`; applicable recommendations compare current practice with disclosed local/global signals and choose `keep`, `evaluate`, `pilot`, `replace` or `do_not_adopt` with transition economics, dependencies, specialist/regulatory validation, evidence and limitations.

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

### 3.3 Cross-Surface Journey Graph evidence artifact

Every newly approved or republished Growth Score after 2026-09-02 carries one optional-at-schema / required-at-authoring `journeyGraph` object using `artifact_version: "cross-surface-journey-graph/1.0.0"`. The field remains optional in the engine only so frozen schema-v5.2 reports created before this contract continue to render without silent rewriting. The canonical authoring template always emits the slot; a new report may publish it as reviewed `not_assessed` when evidence is unavailable, but it may not delete the slot to avoid the review gate.

The graph is a structured evidence artifact inside Cross-Surface diagnostics. It is **not** a fifth surface, score, competitor score, tracked-patient dataset or internal-conversion diagnosis. It does not alter a metric, surface score, Cross-Surface score, Overall score, binding constraint or Focus Selection automatically.

Top-level contract:

```json
{
  "journeyGraph": {
    "artifact_version": "cross-surface-journey-graph/1.0.0",
    "artifact_id": "<stable case-scoped id>",
    "assessment_status": "assessed | not_assessed",
    "max_hops": 3,
    "automatic_score_change": false,
    "evidence": [],
    "nodes": [],
    "edges": [],
    "entry_node_ids": [],
    "lead_intake_node_id": null,
    "metric_links": [],
    "representative_journeys": [],
    "review": {}
  }
}
```

`max_hops` is `2` or `3`. `lead_intake` is a boundary node, not a surface. `entry_node_ids` list only observable public entry assets. The artifact stores the asset graph; the surface graph, reachability and diagnostic collections are deterministic derived outputs.

#### Node contract

Each node contains:

| Field | Contract |
|---|---|
| `id` | Stable, unique asset id inside the artifact. |
| `kind` | `public_asset` or `lead_intake`. |
| `surface` | `search`, `website`, `social` or `reputation`; exactly `null` for `lead_intake`. |
| `asset_type` | Explicit machine type such as `gbp_listing`, `service_page`, `social_profile`, `review_listing`, `booking_destination` or `lead_intake_boundary`. |
| `label` | Short owner-readable label; may adapt vocabulary without changing the surface id. |
| `canonical_destination` | Normalized URL/action identity or `null` where not applicable. Redirect labels never replace the resolved destination. |
| `ownership` | `owned`, `third_party`, `unknown` or `not_applicable`. |
| `observability` | `observed` or `not_assessed`. |
| `evidence_refs` | References to the artifact evidence registry; required for an observed public asset. |

#### Edge contract

Every observed or expected source → destination transition contains:

```text
id · from · to
expectation = required | conditional | optional | observed
action_type = link | book | appointment | call | message | form | native_navigation | other
exists = true | false | null
status = clean | friction | broken | not_assessed
technical_integrity { status, observed_behavior }
context_integrity {
  status,
  observed_behavior,
  dimensions { identity, location, treatment, offer, proof }
}
next_action_available = true | false | null
source · collected_at · evidence_refs
why_it_matters · repair_implication
```

The edge and both integrity objects use only `clean`, `friction`, `broken` or `not_assessed`. Context dimensions preserve separate identity, location, treatment/service, offer, and proof continuity; the aggregate context state must not hide a broken dimension. An assessed edge retains a reproducible `source`, ISO collection date/time and at least one approved evidence reference. A gray `not_assessed` edge has `source=null`, `collected_at=null` and no invented evidence.

State rules:

- `clean`: the transition exists, technically works, preserves the relevant context and exposes a usable next action;
- `friction`: a viable path exists but adds material ambiguity, hops or partial context loss;
- `broken`: a dead/misdirected observed transition or an explicitly `required` / `conditional` missing route is confirmed;
- `not_assessed`: evidence is unavailable or the transition was not meaningfully assessed.

An absent optional cross-link is not a red edge. `exists=false` cannot be `broken` when the expectation is merely `optional` or `observed`.

#### Evidence, metric links and scoring isolation

Each `evidence[]` record retains `id`, `source`, `collected_at`, `method`, `evidence_class` (`A|B`) and `reviewer_status`; Class B semantic assessments also retain `finding_type`, method and assumptions. Nodes and edges reference these ids. Unapproved evidence cannot support a published graph.

`metric_links[]` may connect graph nodes/edges only to these existing metrics:

- `search.gbp_conversion_readiness`;
- `search.entity_integrity`;
- `website.booking_friction`;
- `website.technical_booking_integrity`;
- `social.profile_to_booking`;
- `cross.conversion_continuity`;
- `cross.identity_coherence`;
- `cross.positioning_coherence`;
- `cross.proof_continuity`.

Every link declares `effect: "evidence_only"`. Graph evidence can support a human assessment of those existing metrics, but the graph validator never writes `normalized_score`, changes weights, fills coverage or selects a gap.

#### Derived analysis contract

The production authority deterministically derives:

- per-entry `reachable_to_intake`, `route_status`, `shortest_clean_hops`, `alternate_clean_route` and `best_path_edge_ids` within `max_hops`;
- surface-level aggregate edges for the owner visual;
- `dead_ends`, `loops`, `orphans` and `technical_breaks`;
- aggregate `context_breaks` plus explicit `identity_breaks`, `location_breaks`, `treatment_breaks`, `offer_breaks` and `proof_breaks`.

Reachability asks whether each observable entry can reach `lead_intake` through a clean or friction route. It does not demand a complete 4×4 link matrix. A loop is a traversable cycle; an orphan is an observed public asset not reachable from any approved entry; a dead end is an observed public asset with no traversable outgoing next step.

`representative_journeys[]` contains no more than three continuous edge-id paths: `strongest`, `primary_constraint` and/or `supporting`, each assigned to one of the three fixed prospect slots. These are representative evidence-backed paths, never claims about tracked individual patients.

#### Human review gate

Publication requires:

```text
review.status = approved
review.reviewed_by = named human
review.reviewed_at = valid timestamp
entity_resolution_approved = true
expectation_policy_approved = true
semantic_integrity_approved = true
severity_approved = true
```

The named reviewer approves entity/location resolution, whether a missing route was genuinely expected, semantic/context findings and `friction` versus `broken` severity. This internal audit trail is not rendered as personal attribution in the client report. A pending/rejected graph, unapproved evidence or unsupported red edge fails publication.

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
- each selected gap referenced by `humanDiagnosis.focus_selection`;
- `humanDiagnosis.do_not_do`;
- each item in `humanDiagnosis.gap_inventory`;
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
- `binding_constraint`: `{ title, evidence_refs, gap_ref }`, the principal limiting problem, its non-empty evidence reference list and a `gap_ref` equal to the Primary Focus Gap;
- `gap_inventory`: the complete diagnostic array specified in §5.3;
- `focus_selection`: `{ primary_gap_id, supporting_gap_ids, selected_by, selected_at, rationale }`; publication requires exactly one Primary plus exactly two Supporting gaps selected by a named human;
- `do_not_do`: exactly one `{ title, evidence_refs }` recommendation;
- `competitors`: the Competitive Decision Analysis object below, or `{ status: "not_applicable", reason }` with a durable reason;
- `walkthrough`: either `{ status: "available", url }` with a valid URL, or `{ status: "pending", url: null, placeholder }`.

Focus Selection is a separate, append-only human decision over the complete inventory. AI may prepare candidates, but it cannot select or publish Focus Gaps. Selected gaps must be verified and actionable, at least two must be `close_in_30_days`, and no more than one may be `start_in_30_days`. No item may say that Sprint work is purchased, committed or guaranteed.

#### 5.2.1 Competitor contract

When `status: "applicable"`, `humanDiagnosis.competitors` contains `selection_method`, `sample_limitations`, `comparison_window`, `review_sample_rule`, `branch_scope`, `entries[]`, `comparison_matrix`, `decision_summary` and `market_practice_gap`.

Each competitor entry must include a stable id and name, competitor type and selection reason, branch scope, observed/insufficient-evidence cells for all four surfaces, recurring positive and negative review themes, patient-choice reason, observable advantage/gap, `repeat / improve / do_not_copy`, strategic/constraint/priority/modernization implications, evidence references, dated sources, strengths, weaknesses/risks and limitations. Theme arrays may be empty only when limitations explicitly state that recurrence was insufficient; a recurring theme requires at least two eligible mentions and may not exceed its disclosed sample size.

`comparison_matrix` contains the practice plus every competitor exactly once and gives a decision summary or `Insufficient evidence — …` for Search, Website, Social and Reputation. `decision_summary` contains non-empty evidence-backed arrays for `defend`, `close`, `differentiate` and `do_not_copy`, plus the effect on the binding constraint and Focus Selection.

`market_practice_gap` contains `{ status, reason, recommendations }`, with status `applicable`, `no_material_gap` or `insufficient_evidence`. Applicable recommendations include current state, market shift, evidence scope, business implication, transition economics, dependencies, decision (`keep`, `evaluate`, `pilot`, `replace` or `do_not_adopt`), specialist validation, evidence references and limitations. Any clinical/drug/device/protocol implication requires qualified clinical and regulatory validation before a practice change.

### 5.3 Full Gap Inventory

The inventory is mandatory and exhaustive for the evidence reviewed. It is not pruned when Focus Selection is made. Each item contains at least:

| Field | Requirement |
|---|---|
| `id` | Stable unique gap ID |
| `surfaces` | Non-empty array containing `search`, `website`, `social`, `reputation` and/or `cross_surface` |
| `title` | Specific problem statement, not a generic service recommendation |
| `diagnosis_state` | Verified diagnostic state; use `insufficient_evidence` when the evidence gate is not met |
| `journey_stage` | Where the gap affects the public client/patient choice journey |
| `evidence_refs` | Non-empty references to canonical metrics/findings |
| `why_it_matters` | Evidence-backed consequence and priority rationale; estimates labelled Class B |
| `sprint_fit.mode` | `close_in_30_days`, `start_in_30_days` or `backlog`; this is feasibility classification, not purchased scope |
| `repair_plan` | Embedded Repair Plan specified in §5.4 |

The inventory is an input to later Sprint scoping **only after purchase**. Growth Score does not assign, promise or pre-sell Sprint scope, completion dates or results. The practice may act in-house, use another provider, defer, or later purchase a Sprint.

### 5.4 Embedded Repair Plan

Every gap contains a concrete `repair_plan`. The plan must be sufficiently complete for a competent owner or alternative provider to implement it; instructions may not be hidden to manufacture a sale. Each plan contains at least:

| Field | Requirement |
|---|---|
| `outcome` | Specific desired state, not a service category |
| `diy_steps` | Concrete implementation steps or checkpoints |
| `dependencies` | Earlier gaps/tasks or external dependencies; empty only when independent |
| `owner_role` | Role/skill capable of doing and accepting the work; never assumed to be CAESTHETIC |
| `done_when` | Non-empty observable acceptance evidence: live URL/state, screenshot, export, test or other verifiable proof |
| `day_30_outcome` | Required for `start_in_30_days`: the bounded state that can truthfully exist by Day 30 |
| `beyond_day_30` | Required for `start_in_30_days`: work or maturation that explicitly continues after Day 30 |

Repair depth must reflect the real evidence. Do not invent remediation to make the engagement look larger. When evidence is insufficient, preserve the gap as `insufficient_evidence`, classify it as `backlog`, and make the missing research/verification action explicit rather than fabricating a fix.

## 6. Report content and renderer contract

The renderer must accept both `reportKind=real` and `reportKind=demo`; it must not depend on a `demo-*` directory name.

### 6.0 Canonical authoring and schema compatibility

The single production contract for every new approved report is **schema v5** with `templateVersion: "growth-score-report-template/5.2.0"`: `gap_inventory`, named-human `focus_selection`, an embedded `repair_plan` per gap, one unnumbered Intro and the exact nine-section renderer below. `site-caesthetic/assets/js/growth-score-engine.mjs` owns the metric/scoring, schema version, template version and schema-v5 validation authority; `scripts/caesthetic/render-growth-score.mjs` owns the client-facing presentation contract.

`scripts/caesthetic/growth-score-report-template.mjs` is the fail-closed **canonical schema-v5 authoring template**. It imports and re-exports the engine-owned version constant; current builders and fixtures must import or derive that shared constant instead of hardcoding a divergent string. Its metric sets are derived directly from the production `CANONICAL_METRICS` export; it is not a second metric catalogue and callers cannot supply weights. The current template contains `gap_inventory`, `focus_selection` and embedded `repair_plan` fields and must not emit `top_priorities`, `problem_inventory`, `remediation_tasks` or stored `selected_for_repair`.

Running the template module directly prints a draft schema-v5 JSON scaffold. It starts with `reportState=draft`; every metric has `raw_value=null`, `normalized_score=null` and `reviewer_status=pending`; named-human approval is absent; evidence references and case facts remain explicit placeholders. It cannot render or publish until case evidence, named-human Focus Selection, the applicable Competitive Decision Analysis and all evidence references pass the production gates and the report is promoted truthfully to `approved_report`.

The Nohy V Ruky report is the current production-approved schema-v5 example and uses the canonical template version. It follows the standard real-report access contract: server-side password protection, full noindex directives, an unguessable route, sitemap exclusion and no public case-catalogue listing. Aesthetemed remains a historical schema-v4 read-only example whose retained pre-rendered output is not evidence of current renderer compatibility. Legacy v4 data may be migrated only through an explicit reviewed conversion to the full v5 contract; it may never be relabelled or passed through as v5. Neither example supplies reusable facts, scores, sources, findings, Focus Selection, approval metadata or commercial language.

The canonical implementation chain is:

```text
growth_score_spec.md
→ canonical schema-v5 template or case-specific schema-v5 builder/data
→ growth-score-engine.mjs
→ render-growth-score.mjs
```

There is no other metric catalogue, scoring authority or renderer authority. A case builder may adapt verified case data and locale, but it cannot redefine the schema-v5 decision model or section order.

### 6.1 Canonical client-facing cockpit order

The current renderer is the presentation contract. Before the counted cockpit it renders one **unnumbered Intro**, then exactly these nine sections and IDs in this order. The 13-section presentation introduced by PR #1275 is superseded; its evidence and implementation content is consolidated below rather than removed.

The Intro appears immediately before `gap-map` and is not assigned a cockpit number or `data-cockpit-order`. It uses one shared template for every approved vertical and locale:

- kicker: `YOUR GROWTH SCORE · HOW TO READ THIS REPORT`;
- why the reader is here: the public journey was reviewed across Search, Website, Social and Reputation;
- what Growth Score is: not another marketing grade or service menu;
- what it answers: what works, what limits growth, what to fix first and what not to fund yet;
- how to read it: begin with the Primary Constraint and Focus Gaps, then use the Gap Inventory and Repair Paths; scores are secondary navigation;
- what happens next: implement in-house, use another provider, defer or ask CAESTHETIC, with no automatic service commitment;
- three orientation cards: `01 UNDERSTAND — Find the constraint`, `02 PRIORITIZE — See what to fix first`, `03 ACT — Choose how to implement it`.

`vertical_context` adapts only nouns and context in this shared Intro, while `report_locale` localizes its copy. Neither may change facts, the binding constraint, Focus Selection or Do Not Fund Yet. Multi-Location uses the same Intro with network/location wording; no per-vertical or per-language Intro file is allowed.

1. **Gap Map** (`gap-map`) — objective strength, strongest surface, human-approved binding constraint, complete reviewed opportunity landscape and competitive decision context, with verified and `insufficient_evidence` states kept distinct.
2. **Focus Gaps** (`focus-gaps`) — exactly one Primary and exactly two Supporting gaps, visibly identified as human-approved, with rationale and binding-constraint link; selector identity stays in the internal audit trail.
3. **Sprint Fit** (`sprint-fit`) — selected gaps classified by what can close within 30 days, what can only start and what remains backlog. At least two are `close_in_30_days`; no more than one is `start_in_30_days`. This is illustrative sequencing, not purchased scope.
4. **Repair Paths** (`repair-paths`) — complete DIY-capable remediation plans for every selected gap: outcome, steps, dependencies, accountable role and observable `done_when`. A `start_in_30_days` item separates Day-30 outcome from beyond-Day-30 work.
5. **Do Not Fund Yet** (`do-not-fund`) — exactly one named-human-approved recommendation, its evidence-backed rationale and explicit conditions for revisiting it.
6. **Full Gap Inventory** (`gap-inventory`) — every reviewed gap, including unselected, backlog and `insufficient_evidence` items, with stable evidence and Repair Plan links.
7. **Evidence and competitors** (`evidence-and-competitors`) — metric evidence, collection dates, Class A/B state, limitations, comparison matrix, competitor cards and Competitive Decision Analysis where applicable. Paid Ads remain a Demand Layer, not a fifth surface.
8. **Scores and methodology** (`scores-and-methodology`) — Search, Website, Social and Reputation with 30/25/15/30 heuristic display weights; Cross-Surface remains separate; Overall appears only with sufficient coverage. Sources, windows, unavailable evidence, Class A ratio and methodology/limitations are disclosed here.
9. **Next step** (`next-step`) — all four implementation paths: in-house, another provider, defer or a separately scoped CAESTHETIC engagement. It includes the honest `Why CAESTHETIC / Why the 30-Day Sprint` coordination rationale, client ownership/no-lock-in language and one optional Sprint CTA without implying purchased scope or guaranteed results.

The consolidation preserves every decision layer from v5.1: executive diagnosis moves into Gap Map; remediation stays in Repair Paths and Sprint Fit; the score navigator and methodology remain together; evidence and competitor detail remain together; and implementation paths plus the honest CAESTHETIC coordination case remain in Next step. No evidence, diagnosis, remediation, implementation or methodology content may be dropped merely because the cockpit has fewer counted sections.

Surface sections should carry the useful diagnostic evidence from the former long-form template:

- Search: Local Falcon maps, Entity Integrity and branded/GBP evidence;
- Website: conversion path, performance and the `mystery_shopper` metric only when the permissioned evidence capability was actually used; its existence in the catalogue does not make it part of the standard Free Score workflow or walkthrough;
- Reputation: 90-day review velocity, responses and named competitors;
- Cross-Surface: treatment/positioning/proof/conversion/identity continuity;
- Summary: objective strength, binding constraint, Focus Gaps, method, limitations and `do_not_do`; the separate walkthrough is not a report card or section.

Conditional reactivation arithmetic may appear as optional Class B context when grounded in client-supplied inputs. It is not a fifth surface and does not affect scores.

The owner owns the delivered report, evidence pack and task plan and may use them without CAESTHETIC. There is no lock-in. The cockpit should make real workload, specialist needs, dependencies, coordination cost and implementation risk visible, while preserving complete instructions; CAESTHETIC should look like the simplest executor because it already understands the case, not because information was withheld.

### 6.2 Privacy and truthfulness

- A real report is delivered only at `/score/<unguessable-slug>/`, must emit `noindex,nofollow,noarchive,nosnippet`, stay outside the sitemap, use a non-guessable slug and be protected by server-side password/access enforcement before delivery. Client secrets and passwords must never be committed to the repository or exposed in generated HTML.
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
→ internal AI draft diagnosis / Gap Inventory / Repair Plans
→ human verification and correction
→ frozen verified fact set
→ named-human Focus Selection
→ deterministic scores + final narrative compiled only from verified facts
→ named human approval
→ private owner cockpit + separately delivered Valerie Petra walkthrough
```

Logical records are `score_case`, `candidate_evidence`, `verified_fact_set`, `draft`, `review_event`, `approved_report`, `learning_candidate` and `rule_release`. They may share storage, but their states may not be collapsed in a way that makes an AI draft publishable.

1. Create the case from the versioned required intake, optional context or a clearly separate public-evidence outbound path.
2. Resolve the practice, priority treatments, market and named competitor-selection rule.
3. AI-assisted research collects all obtainable external evidence across Search, Website, Social and Reputation; Cross-Surface remains separate. Each candidate retains surface/metric, source URL or snapshot/reference, collection date, method/workflow version, proposed evidence class, verification state and supersession link. Unknowns remain `null`.
4. AI may propose pre-scores, objective strength, binding constraint, the full Gap Inventory, candidate Focus Gaps, Repair Plans, sequencing and draft language. This is an internal candidate only and cannot be compiled as a final report.
5. A named human reviewer checks source lineage, dates, method and competitor selection; verifies every proposed Class A fact; approves/rejects metric scores and anchored judgments; corrects the inventory, Repair Plans and wording; selects exactly one Primary plus exactly two Supporting gaps; approves the binding constraint and exactly one Do Not Fund Yet; and clears privacy/compliance issues. Focus Selection records the reviewer's name, timestamp and rationale.
6. Freeze the verified fact set and append-only Focus Selection. Final scores are calculated deterministically, and final narrative is compiled only from verified facts plus visibly labelled Class B items with method and assumptions.
7. Validate `≥80%` Class A published findings, the surface coverage rules, Focus Selection composition and every evidence reference. Pre-review AI content, an unnamed selection or a binding constraint that does not reference the Primary gap is a hard publication failure.
8. Render and visually verify the unnumbered Intro followed by all nine counted sections. A named human approves a versioned report with reviewer and timestamp before the protected private link is delivered.
9. Configure server-side access, verify unauthenticated denial and authenticated success, and only then deliver the report. Valerie Petra records the 3–8 minute walkthrough under `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`. That SSOT alone owns the spoken sequence, presenter/screen mix, subtitles and production rules; this detailed report spec must not duplicate or override them. The walkthrough may explain why the 30-Day Sprint is convenient, but may not imply guaranteed or already-purchased scope.

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
- generic human-reviewed state where useful, without client-visible reviewer/selector identity; metric collection dates remain attached to the evidence;
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
- a complete Gap Inventory and a named-human Focus Selection containing exactly one Primary plus exactly two Supporting gaps;
- at least two selected gaps are `close_in_30_days`, no more than one is `start_in_30_days`, and every selected gap is verified and actionable;
- every gap contains an executable Repair Plan; Day-30 and beyond-Day-30 outcomes are separated for `start_in_30_days` work;
- the shared unnumbered Intro renders immediately before `gap-map`, and the exact nine-section order and IDs render while Overall/surface scores remain a labelled approximate navigator;
- one `do_not_do`;
- DIY/alternative-provider use, client ownership, no lock-in and honest `Why CAESTHETIC / Why Sprint` language;
- real and demo rendering through the same authority;
- real-report `noindex,nofollow,noarchive,nosnippet`, unguessable route, sitemap exclusion and server-side password/access contract, including Nohy V Ruky;
- prominent synthetic/no-client-relationship demo disclosure;
- correction events do not activate a global rule; promoted rules require version, approver, changelog, validation and rollback;
- render-drift check against generated report artifacts.

Any legacy scorer may remain only as a thin CLI/import wrapper around the one production scoring authority. Two independent metric catalogues or scoring implementations are forbidden.
