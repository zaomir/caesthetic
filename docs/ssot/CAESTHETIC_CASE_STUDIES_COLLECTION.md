---
owner: CAESTHETIC
status: active
version: 1.1
updated: 2026-09-06
scope: Content and publication contract for the text-first CAESTHETIC case catalog and case pages
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md
  - docs/caesthetic/case_study_intake_template.md
  - site-caesthetic/case-studies/README.md
---

# CAESTHETIC case studies collection

The catalog helps a practice owner recognize a relevant situation, understand the approach and decide whether to read the case. The case page explains the work, its applicability and the basis for any result claims. Both use the same published record and editorial summary.

## Public source and history

- The only public source is `/case-studies/intake/api/public-cases`: active publication snapshots. Drafts, review records and TEST fixtures must never become a fallback.
- Saving a draft or review does not replace an active publication. Existing publication revisions and their original source text remain unchanged for audit and rollback.
- The active public projection omits the deprecated values `evidenceLevel: modeled` and `attribution: not_claimed`, including nested metric classifications. It also omits the derived `Modeled result` status. Missing or deprecated values stay unclassified; they must never default to `client_reported` or `verified`.
- Removing a classification does not change what happened or prove a result. Retain `dataSource`, `limitations`, `caestheticRole` and material metric caveats. Do not rewrite modeled source material as measured client work.

## Short editorial fields

Case Intake supports optional `cardTitle`, `cardSituation` and `cardApproach`. The public representation groups them under `card.title`, `card.situation` and `card.approach`.

| Field | Purpose | Writing rule |
| --- | --- | --- |
| `cardTitle` | Name the relevant decision or change | Use a concrete, readable phrase; no unsupported success claim. |
| `cardSituation` | Help the owner recognize the starting situation | Describe the obstacle in one or two short sentences. |
| `cardApproach` | Explain what the work addresses | Name the action and its scope; distinguish proposed work from completed work. |

These fields are optional editorial improvements, not a new publication gate. Use manager-entered short fields first. For existing records, `/assets/data/case-study-summaries.json` supplies source-grounded summaries only when both `sourceTitle` and `sourceUpdatedAt` match the active record. Otherwise use that record's own title, situation and approach. Do not carry a summary forward after its source changes without review.

## Catalog and case page

- Put the case library immediately after a compact introduction. Explain Connect4 later on the page.
- Use one column of wide text cards, with situation and context beside approach on desktop and stacked on mobile. Show practice type, location and scale only when available.
- Do not render cover images, image placeholders or reserved image columns in cards or case-page summaries. A case does not require a generated cover or media-registry entry. Existing evidence attachments and archived assets remain available; approved method and contact imagery outside the case presentation is unaffected.
- Use one goal selector and one practice-type selector. Put country, scale and sorting under additional filters. Preserve filter URLs, return position and loaded results when returning from a case.
- Each card has one descriptive case link. Loading, empty and error states provide a clear next action. Controls remain usable with a keyboard and at narrow widths.
- Structure the detail page as an executive brief, situation, approach, supported results where available, sources and limitations, then applicability. Use the existing Growth Score next step.

## Result claims

Show a numerical before-and-after result only when the metric explicitly has `verified` or `client_reported` evidence, comparable values, a source and a timeframe. Show the source and timeframe with the result. When the source explicitly says the case publisher confirms verification, label the displayed result “Publisher-confirmed”; do not imply an independent source check. Relevant modeled, hypothetical or synthetic caveats exclude the metric from this result treatment. Where those conditions are absent, present the situation and approach without inventing a result or a replacement evidence badge.

Definitions, denominators, dates, budget context and practice contribution belong beside the claim when material. Publication permissions and the factual relationship to the work must remain accurate. Do not invent client names, patients, testimonials, dashboards, metrics or medical outcomes.

## Operating sequence

1. Check the narrative, source, limitations, relationship to the work and permissions for the claims being published.
2. Add or review the optional short editorial fields; retain the full explanation and evidence context.
3. Publish through the authenticated Case Intake workflow. Confirm `catalogVisible: true` and the case URL.
4. Check the active API and catalog/detail rendering, including filters, return navigation, mobile layout and missing-result states.
5. Preserve existing `noindex` and sitemap policy until the separately required publication criteria are met. This redesign does not itself change indexing policy.

Implementation scope and rollback: `docs/caesthetic/CASE_LIBRARY_TEXT_FIRST_PLAN.md`.

