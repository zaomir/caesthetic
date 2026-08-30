---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-30
updated: 2026-08-30
scope: Growth Score production orchestration from accepted case to private delivery and closeout
project_master: docs/ssot/CAESTHETIC.md
related:
  - docs/caesthetic/growth_score_spec.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/caesthetic/competitive_decision_analysis.md
  - docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md
runtime_contracts:
  - scripts/caesthetic/growth-score-workflow.mjs
  - scripts/caesthetic/render-growth-score.mjs
---

# CAESTHETIC — Growth Score Production SOP

> One controlled route from an accepted Growth Score case to an approved private owner cockpit, walkthrough, delivery record and closeout.

This file is an **orchestration/router authority only**. It does not redefine the CAESTHETIC product, Four Surfaces, scoring metrics or weights, evidence classes, Competitive Decision Analysis, the Valerie walkthrough, the report schema, renderer behaviour or Sprint scope.

When rules conflict, use the higher authority named below. Do not resolve a conflict by copying a specialist rule into this SOP.

## 0. Authority map

| Question | Authority |
|---|---|
| Product, positioning, Four Surfaces, funnel and human-approval canon | `docs/ssot/CAESTHETIC.md` |
| Metrics, weights, evidence, coverage, report schema and 13-section cockpit contract | `docs/caesthetic/growth_score_spec.md` |
| Valerie Petra walkthrough content and production rules | `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md` |
| Global competitive decision rules | `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md` |
| CAESTHETIC competitor evidence adapter | `docs/caesthetic/competitive_decision_analysis.md` |
| Intake, routing, tooling, capacity and launch readiness | `docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md` |
| Runtime workflow records and validation | `scripts/caesthetic/growth-score-workflow.mjs` |
| Client cockpit rendering | `scripts/caesthetic/render-growth-score.mjs` |

Authority order:

```text
CAESTHETIC.md
→ applicable specialist SSOT/spec
→ runtime validator or renderer for its owned machine contract
→ this production SOP
→ working documents
```

## 1. Entry contract

Production begins only from one of two valid triggers:

1. `owner_intake` — the required Growth Score intake was accepted. Optional enrichment may be absent and remains self-reported context until independently verified.
2. `public_evidence_outbound` — an explicitly authorised proactive path based on public evidence. It must never be represented as owner intake and must pass the same evidence, human-review, privacy and private-delivery gates.

Create one `score_case` with a stable case id, source kind, intake/workflow versions, timestamps and self-reported context. Detect duplicate intake before research: link the duplicate to the existing active case, preserve the new receipt/audit event and do not create two competing reports.

Canonical case progression:

```text
created
→ researching
→ draft_review
→ fact_set_frozen
→ report_review
→ approved
→ delivered
→ closed
```

No state name implies publication by itself. Only a valid `approved_report` may enter rendering and delivery.

## 2. Identity resolution and research-brief freeze

Before collecting scored evidence, resolve the practice as a real public entity:

- trading/practice name and known aliases;
- exact location and branch scope;
- website, GBP/Maps entity, public social profiles and booking destination;
- priority treatments or service intent;
- relevant market/catchment;
- owner-supplied competitors, if any, as unverified selection context.

If two or more plausible entities remain, stop diagnosis and request one public identifier. Do not merge branches, ratings, review counts, social accounts or websites to manufacture a complete identity.

Freeze a versioned research brief before substantive collection. It records the resolved identity, branch scope, priority-treatment/query family, geography, observation windows, collection methods, competitor-selection method, applicable permissions, exclusions and workflow/rubric versions. Changes after freeze require an append-only review event and a new brief version.

## 3. Evidence collection

Move the case to `researching` and collect candidate evidence across exactly:

1. Search / Google Business Profile;
2. Website;
3. Social;
4. Reputation / Reviews.

Collect Cross-Surface Consistency separately; it is not a fifth surface and is excluded from the Overall calculation under the scoring spec.

Each `candidate_evidence` record retains its canonical surface/metric, raw value, source reference or snapshot, collection date, method, workflow version, proposed evidence class, verification state and supersession link. Self-reported context cannot enter the verified fact set without independent verification.

Normalize only through the metric/evidence contract in `growth_score_spec.md`. Unavailable, blocked, stale, ambiguous or non-comparable evidence remains unavailable and is stated as `Insufficient evidence — <reason>`; unknown values remain `null`. Never substitute an inference merely to complete a score.

### 3.1 Competitive Decision Analysis

Run Competitive Decision Analysis when the global standard says it is applicable. Use a disclosed 3–5 competitor set, comparable sources/windows/paths, all four CAESTHETIC surfaces, recurring review-theme rules, the Comparison Matrix, Competitor Cards, `Defend / Close / Differentiate / Do not copy`, and Market Practice Gap decision.

If no meaningful comparison set is applicable, record the durable reason. Lack of coverage is `insufficient_evidence`, not `not_applicable`, and creates a collection task. CDA informs the constraint and priorities but never becomes a fifth scored surface or composite competitor score.

## 4. Internal AI draft — non-publishable

AI may create a `draft` containing proposed scores, evidence normalization, objective strength, Problem Inventory, binding constraint, Top 3, Do Not Fund Yet, remediation tasks and narrative. The draft must remain explicitly non-publishable and must carry the workflow/model/template/rule versions used.

The draft must propose:

- at least one defensible objective strength; without one, fail the publishable ICP gate defined by the scoring spec;
- the full evidence-backed Problem Inventory, including dependencies and unavailable areas;
- one binding constraint derived from verified severity, dependencies, risk and owner decision impact—not automatically the lowest displayed score;
- exactly three priorities in implementation order;
- exactly one `Do Not Fund Yet`, with evidence-backed rationale and revisit conditions;
- a complete remediation task for every mapped problem.

Each remediation task must include at minimum:

```text
problem reference
→ task / intervention
→ sequence
→ dependencies
→ accountable owner or required role/skill
→ effort / complexity
→ implementation risk
→ acceptance evidence / done_when
→ immediate next_action
```

Do not diagnose internal CRM, telephony, reception, staffing, training or patient-operations causes without corresponding access and evidence. Record the internal layer as `Not assessed` or `Insufficient evidence — requires workflow/data access` when appropriate.

## 5. Named-human review and fact-set freeze

Move the case to `draft_review`. A named human reviewer must:

1. verify practice identity, source lineage, dates, collection method, branch scope and competitor selection;
2. approve or reject every proposed Class A fact and every publishable metric score;
3. review labelled Class B methods and assumptions;
4. correct the objective strength, Problem Inventory, binding constraint, exact Top 3, exact one Do Not Fund Yet and all remediation-task fields;
5. clear privacy, compliance, clinical-claim and client-boundary issues.

Every correction is an append-only `review_event` with before/after values, reviewer, reason code, timestamp and model/workflow/template/rule versions. Never overwrite the superseded draft as if it had always contained the approved decision.

When review is complete, create a versioned `verified_fact_set` in `frozen` state, with approved candidate-evidence ids, a named human freezer and timestamp. Move the case to `fact_set_frozen`. No later narrative or score may introduce a new fact outside that frozen set; new evidence requires review, a new freeze version and reapproval.

## 6. Final compilation and report approval

Calculate scores deterministically from the frozen verified facts. Compile final narrative only from those facts and visibly labelled Class B items whose methods and assumptions passed review. Validate the current scoring spec in full, including coverage, Class A ratio, evidence references, Problem Inventory↔task completeness, applicable CDA, exact Top 3 and exact one Do Not Fund Yet.

Move the case to `report_review`. Create a versioned report candidate and render it for visual QA. A named human must approve the final version, digest, verified-fact-set version, reviewer identity and timestamp. Only then create `approved_report` and move the case to `approved`.

AI approval, an unnamed reviewer, a draft flag or a visually plausible render is never sufficient.

## 7. Cockpit, private route and walkthrough

Render through the shared `scripts/caesthetic/render-growth-score.mjs` authority. The owner cockpit follows the 13-section contract in `growth_score_spec.md`; this SOP does not restate or reorder those sections.

A real report route must be:

- `/score/<unguessable-slug>/`;
- private by obscurity and not password-gated by default;
- outside every sitemap;
- emitted with `noindex,nofollow,noarchive,nosnippet`.

Do not publish client packs, evidence bundles or real score routes to the CAESTHETIC satellite. DEC-829 exclusions remain binding.

Produce the Valerie Petra walkthrough only from the approved report and frozen fact set, following `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`. That file alone owns duration, spoken sequence, presenter/screen mix, captions, CTA and production QA; do not duplicate those rules here.

## 8. Delivery and closeout

Deliver only after route QA and walkthrough readiness pass. Record delivery in the case audit/status history with case/report versions, private route, delivery channel, intended recipient, sender/operator, timestamp, walkthrough status and any acknowledged delivery failure. This is not a ninth logical machine-record type. Do not log PHI, credentials or unnecessary client data.

Move the case to `delivered` only after the delivery attempt is recorded against the approved report. Resolve bounces, wrong-recipient risk or inaccessible assets before closeout. Move to `closed` when delivery is confirmed or the case is explicitly dispositioned with a reason and next-action owner.

Historical approved reports remain immutable. Later implementation, Day-30 review or recurring review is a new business state and artifact, not a silent rewrite of the Free Growth Score.

## 9. Controlled learning

A case-specific correction may create only a de-identified `learning_candidate`; it must have `global_activation=false`. It does not change prompts, scoring, rubrics, templates, taxonomies, heuristics, examples, evals or model behaviour automatically.

Only a named method owner may promote a candidate through a versioned, human-approved `rule_release` that records scope, approver, changelog, effective date, passed validation/eval result and rollback target. New cases resolve an approved bundle version. Raw client facts, contact data, credentials, PHI and case conclusions never transfer across clients.

## 10. Exceptions and recovery

| Exception | Fail-closed response |
|---|---|
| Ambiguous practice identity | Hold in `created`/`researching`; request one public identifier; do not combine entities. |
| Insufficient surface or CDA coverage | Mark unavailable evidence explicitly, create collection tasks and do not publish until the scoring/evidence gates pass. |
| No named reviewer | Keep in `draft_review` or `report_review`; no fact freeze, approval, render delivery or walkthrough publication. |
| Renderer or visual-QA failure | Keep the approved data immutable, block delivery, repair/re-run the shared renderer and record the failure. |
| Post-approval correction | Append a review event, supersede with a new draft/fact-set/report version, re-run all gates and reapprove; never edit the delivered artifact silently. Notify the recipient when the correction is material. |
| Duplicate intake | Link to the active case, preserve receipt/audit history and avoid duplicate research/report delivery. If the prior case is closed and evidence is stale, open a new versioned case rather than mutating history. |

## 11. Machine-record contract

The current runtime validator confirms exactly these logical record types:

```text
score_case
candidate_evidence
verified_fact_set
draft
review_event
approved_report
learning_candidate
rule_release
```

Their schemas and validation remain owned by `scripts/caesthetic/growth-score-workflow.mjs`. This list is descriptive routing, not a second machine schema. If runtime changes through an approved release, update this SOP to match rather than inventing an extra record type here.

## 12. Production acceptance checklist

A case is deliverable only when all are true:

- valid trigger and resolved, non-duplicate practice identity;
- frozen research brief and complete collection log;
- Four Surfaces plus separate Cross-Surface handled under the scoring spec;
- applicable CDA complete, or a valid documented `not_applicable` reason;
- unavailable evidence stated as Insufficient Evidence rather than guessed;
- named-human-approved objective strength, Problem Inventory, binding constraint, exactly Top 3 and exactly one Do Not Fund Yet;
- every problem maps to a complete, dependency-aware remediation task;
- frozen verified fact set and append-only review history exist;
- current evidence/coverage/Class A/report-schema gates pass;
- approved report renders through the shared 13-section cockpit and passes visual QA;
- real route is unguessable, outside sitemap and carries the complete robots directive;
- Valerie walkthrough follows its specialist SSOT;
- delivery is logged; controlled learning remains separate and human-released.

**Canonical operating loop:**

```text
Evidence
→ Constraint
→ Priority
→ Decision
→ Intervention
→ Adoption
→ Verified Impact
→ Learning
```
