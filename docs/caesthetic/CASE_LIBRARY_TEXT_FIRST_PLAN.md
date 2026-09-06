---
owner: CAESTHETIC
status: implementation
updated: 2026-09-06
issue: 1514
---

# Case library: atomic implementation plan

Owner request: implement the recommended image-free catalog and case detail design; remove erroneous `evidenceLevel: modeled` and `attribution: not_claimed` values. This supersedes the preceding design-only instruction.

Audience: owners of independent US aesthetic practices. Task: find a recognizable operating situation, understand the approach and inspect its source. Surface: browse/read. Visual thesis: wide ruled text rows with an approach or measured-result panel; clinical paper, navy, restrained burgundy, existing typography and spacing tokens.

1. Capture the current published export and exact main SHA. Keep stored revisions and original source/limitations reversible and intact.
2. Remove the deprecated values from current draft normalization and both public export boundaries, including nested metrics. Missing classification never defaults to verified or client-reported.
3. Add optional short title, situation and approach fields for manager-authored cards. Supply source-version-bound summaries for the existing 33 records.
4. Move the catalog before the existing method section. Replace duplicate goal controls and the featured duplicate with one set of filters; preserve shareable URLs, empty/error states and return position.
5. Render full-width image-free cards: context, short title, situation, approach and a clear detail link. Quantitative result display requires explicit verified/client-reported classification and source/period context.
6. Render the case detail as an executive brief, situation, approach, results where supported, sources/limits and applicability. Preserve related-case links and the existing request CTA.
7. Remove cover generation from publication requirements and update the manager form/guide and canonical documents. Keep private evidence attachments and asset history.
8. Run scoped data/renderer regression tests, responsive/keyboard/navigation QA and the canonical design/deploy gates. Ship exact main; confirm the live API and catalog-to-detail-to-catalog path; close the session with observed receipts.

No automatic factual upgrade: the initial 33-record snapshot explicitly described modeled figures. Removing the two erroneous classification values does not rewrite that source or transform the figures into observed client outcomes. Historical immutable snapshots remain historical; the active public view omits the deprecated fields.

Rollback: revert the task-scoped code/contract commit and redeploy the prior accepted main. Intake publishes versioned source; no destructive SQL update of immutable publication JSON is used.

During implementation, all 33 active publications were revised upstream by the publisher (separate from this task’s code deployment). Their source now attributes verification to the case publisher. The frontend identifies that as “Publisher-confirmed”; this task does not independently verify the numerical claims. Short text was rebound only after checking that the original title, situation, constraint and interventions were unchanged.
