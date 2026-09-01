---
owner: CAESTHETIC
status: active
version: 2.1
updated: 2026-09-01
scope: Growth Score competitive evidence and owner decisions
parent: docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
product_parent: docs/ssot/CAESTHETIC.md
---

# Competitive Decision Analysis

This is the CAESTHETIC adapter of the global `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`. Competitive Decision Analysis is a mandatory decision layer inside every publishable CAESTHETIC Growth Score when a local comparison set is applicable. It is not a fifth surface and it does not receive a score. It interprets competitor evidence across Search, Website, Social and Reputation so the owner can decide what to defend, close, differentiate and avoid copying. Global evidence, review-recurrence and Market Practice Gap rules are inherited and are not redefined here.

## Owner question

The section must answer: **what are competitors doing objectively better or worse, what do customers repeatedly value or criticise in the reviewed sample, and what should this practice do differently?**

It may not stop at a ranking table, generic SWOT or review-count race.

## Required comparison set

Use three to five named competitors selected by a disclosed rule. Prefer a mix of:

- local direct alternatives for the same priority treatment and catchment;
- the visible category leader on the search/reputation surface;
- a useful positioning, conversion or proof benchmark.

Do not select competitors only because they make the client look good. Keep branches and platforms separate; never combine ratings or review counts from different platforms into one number.

## Required evidence

For each named competitor, inspect all publicly observable sources that materially affect the owner decision:

- Search/Maps/GBP identity, rating, review count, categories, services and conversion path;
- website positioning, treatment clarity, clinician proof, pricing visibility and booking path;
- public social identity, priority-treatment presence, proof, recency and profile-to-booking continuity;
- public review themes from a disclosed platform, sample and window;
- directories, branded search, public offers and ads when they expose an entity or positioning gap.

Public viewing is sufficient. No deceptive enquiry, appointment creation, impersonation or form submission is required. If a source is inaccessible, say so and leave the related claim unavailable.

## Review-theme rules

Review analysis reports patterns in the reviewed sample, not adjudicated facts about a business.

- Attribute every theme to its platform, sample/window and collection date.
- Write `reviewers in the inspected sample report...`, not `the clinic does...`.
- Separate recurring themes from a single reviewer report.
- Preserve material positive and negative themes; do not cherry-pick only complaints.
- A missing negative theme is reported as `no recurring negative theme found in the reviewed sample`, not proof that none exists.
- Health, privacy, safety, fraud or legal allegations require especially careful attribution and may not be repeated beyond what is necessary for the decision.

## Required report contract

The machine-enforced schema-v5 contract is owned by `docs/caesthetic/growth_score_spec.md` §5.2.1. This adapter adds the CAESTHETIC source fields that make each public comparison reproducible. When `humanDiagnosis.competitors.status` is `applicable`, the diagnosis contains at least:

```text
selection_method: non-empty string
sample_limitations: non-empty string
comparison_window / review_sample_rule / branch_scope
entries[]:
  id: stable id
  name: non-empty string
  competitor_type: local | category_leader | positioning_reference | other
  selection_reason / branch_scope
  evidence_refs: non-empty canonical evidence references
  sources[]:
    url_or_snapshot: non-empty string
    source_type: maps | website | social | review_platform | directory | public_ad
    collected_at: ISO date/date-time
    sample_note: non-empty string
  strengths: non-empty string[]
  weaknesses_or_risks: non-empty string[]
  surface_evidence: Search / Website / Social / Reputation cells
  repeated_positive_themes / repeated_negative_themes with mentions, sample size and window
  patient_choice_reason / observable_advantage / observable_gap
  repeat / improve / do_not_copy
  strategic_implication / constraint_effect / priority_effect / modernization_implication
decision_summary:
  defend / close / differentiate / do_not_copy: evidence-backed decision items
comparison_matrix: subject plus every competitor across the Four Surfaces
market_practice_gap: applicable | no_material_gap | insufficient_evidence
```

The four decision-summary lists and Market Practice Gap recommendations are decision context, not extra scored findings. Each statement must be traceable to the named source set and the verified Gap Inventory. Any drug, device, material or clinical-protocol implication requires qualified clinical and regulatory validation before a practice change.

## Presentation order

Show the layer in the schema-v5 `Evidence and competitors` section, with its decisions linked to the approved Focus Selection:

1. compact comparison matrix;
2. one short evidence card per named competitor;
3. `Defend / Close / Differentiate / Do not copy` decision summary;
4. explicit link from those decisions to the binding constraint, complete Gap Inventory, named-human Focus Selection and embedded Repair Plans.

## Acceptance gate

A competitor section fails publication when it:

- has unnamed or undisclosed selection logic;
- presents catalog or mixed-platform numbers as canonical Maps evidence;
- turns one negative review into a factual accusation;
- omits positive evidence or uses only a complaint reel;
- has no source date/sample limitation;
- produces no owner decision or no link to remediation;
- treats competitive analysis as a fifth scored surface.

Engine, renderer, current reports, demos and tests fail closed on this contract under report schema v5. Historical schema-v4 artifacts remain read-only and cannot be relabelled as current reports.
