---
owner: CAESTHETIC
status: done
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
7. Remove cover instructions from the manager form/guide and update canonical documents. The existing publish gate already allowed image-free cases. Keep private evidence attachments and asset history.
8. Run scoped data/renderer regression tests, responsive/keyboard/navigation QA and the canonical design/deploy gates. Ship exact main; confirm the live API and catalog-to-detail-to-catalog path; close the session with observed receipts.

No automatic factual upgrade: the initial 33-record snapshot explicitly described modeled figures. Removing the two erroneous classification values does not rewrite that source or transform the figures into observed client outcomes. Historical immutable snapshots remain historical; the active public view omits the deprecated fields.

Rollback: revert the task-scoped runtime commits listed below and redeploy the prior accepted main. Intake publishes versioned source; no destructive SQL update of immutable publication JSON is used.

During implementation, all 33 active publications were revised upstream by the publisher (separate from this task’s code deployment). Their source now attributes verification to the case publisher. The frontend identifies that as “Publisher-confirmed”; this task does not independently verify the numerical claims. Short text was rebound only after checking that the original title, situation, constraint and interventions were unchanged.

## Atomic acceptance checklist

Each row has one observable outcome. All 26 rows are complete; production evidence is recorded in the session receipts.

| # | Change | Acceptance |
|---|---|---|
| 1 | Record the baseline | Original 33-record export and starting main SHA are recorded. |
| 2 | Normalize obsolete classifications | Deprecated values become empty; normalization does not assign a stronger classification. |
| 3 | Project active public records | Both export boundaries omit deprecated values, including nested metrics. |
| 4 | Add optional card copy fields | Intake saves a short title, situation and approach independently of long case content. |
| 5 | Bind existing short copy | All 33 summaries match the source title and updatedAt; stale summaries are not applied. |
| 6 | Put browsing first | The catalog follows the introduction and precedes Connect4. |
| 7 | Simplify filter controls | One goal selector is visible; secondary parameters are inside More filters. |
| 8 | Replace the case card | A wide text row contains context, title, situation, approach and one detail link, with no cover slot. |
| 9 | Gate numerical results | Rendered metrics have supported classification, values, source and period without contradicting caveats. |
| 10 | Identify publisher confirmation | The current 99 supported metrics receive the Publisher-confirmed label from their source context. |
| 11 | Restructure case detail | The reading order is brief, situation, approach, results, sources and applicability. |
| 12 | Preserve case-to-case links | Previous and Next resolve to existing cases and preserve the return URL. |
| 13 | Persist URL filters | Reloading a filtered URL restores the selected controls and matching list. |
| 14 | Restore catalog position | Returning from a case restores filters, expanded count and scroll position. |
| 15 | Recover from no matches | Clear filters restores the list and moves keyboard focus to the catalog. |
| 16 | Recover from API errors | Retry reloads data after a failed request; regression verifies successful recovery. |
| 17 | Handle unavailable cases | Missing and TEST records show an unavailable state with a catalog link. |
| 18 | Align manager guidance | Form and guide describe image-free cards; private evidence attachments and history remain available. |
| 19 | Verify responsive layout | 320, 390 and 1440 px layouts have no horizontal overflow; mobile cards use one column. |
| 20 | Pass regression gates | Runtime, editor and canonical design checks pass. |
| 21 | Publish the editor | Intake version 13 has a successful source-bound deployment receipt. |
| 22 | Refresh cached resources | Final HTML, scripts and summary fetch use text-cases-20260906-r4 asset versions. |
| 23 | Publish final source | Deployment receipt identifies the exact deployed commit on main. |
| 24 | Check the production API | The active export contains 33 cases and neither deprecated value at case or metric level. |
| 25 | Check production navigation | Catalog, detail and return work on the deployed version with real published records. |
| 26 | Record completion | Hash-bound receipts are stored and the session and issue are closed. |

## Task source history

- Main design and contracts: `c22b7e62e5c2a673d2a122e734ae1782ccf769c7`.
- Source-version binding and publisher labels: `51be3a49af811f1d12cae51c0503b752c0b5b1e3`.
- Scroll/retry recovery and compact hero: `a444d436fb65355aa19cb21499196a03914ee8d3`.
- Final cache versions: `4f4940329f0becf3ec60bd4d786e01afab378af7`.
- Final deployment request (same runtime): `9c2f1750fa1ad331b553d14addf8b0779684144c`.
- Intake source: `84a83f5546e9eaccb39a0e2d283ab76d85433ab9`, published version 13.

Production receipts: `docs/runtime/projects/caesthetic/evidence/2026-09-06-case-library-*.json`.

Real-data review: four Charlotte med-spa records have the same original title and story pattern, so their short copy is also the same; their numerical results distinguish them. This implementation preserves those source records. The new manager-authored card fields allow meaningful distinctions when the publisher supplies different context.
