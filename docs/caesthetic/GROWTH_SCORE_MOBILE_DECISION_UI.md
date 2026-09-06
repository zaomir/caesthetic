---
owner: CAESTHETIC
status: active
version: 1.1.6
updated: 2026-09-04
scope: mobile-first client presentation for Growth Score schema v5 reports
parent: docs/caesthetic/growth_score_spec.md
runtime:
  - site-caesthetic/assets/js/growth-cockpit.js
  - site-caesthetic/assets/css/growth-report-mobile.css
---

# CAESTHETIC Growth Score — Mobile Decision UI

This document is a subordinate presentation contract. It does not change Growth Score evidence, scoring, Four Surfaces, named-human approval, privacy, report ownership or Sprint economics.

## 1. Decision story

The report must support three reading depths:

1. **30 seconds:** understand the main constraint.
2. **2 minutes:** understand the exact Top 3 and Do Not Fund Yet.
3. **5 minutes:** understand 30-day feasibility, complete Repair Paths and the available implementation choices.

The client-facing sequence remains one unnumbered Intro and exactly nine machine sections:

| Machine ID | Client-facing purpose |
|---|---|
| `gap-map` | Where demand breaks |
| `focus-gaps` | What to fix first |
| `sprint-fit` | What can change in 30 days |
| `repair-paths` | How to fix it |
| `do-not-fund` | What not to fund yet |
| `gap-inventory` | Every diagnosed gap |
| `evidence-and-competitors` | Why the decision is supported |
| `scores-and-methodology` | State of the four surfaces |
| `next-step` | Who will implement it |

The machine IDs, evidence model and order remain canonical even when visible titles are localized.

## 2. Mobile-first rules

- Base viewport: 360–430 px.
- One primary thought per screen.
- One card per row by default; desktop columns are progressive enhancement at `min-width: 900px`.
- The fixed progress counter follows the section crossing the reading line, including sections taller than the viewport, and selects section 9 at the document end.
- Executive support cards use one aligned reading column; positive list items receive one presentation-layer check marker and must not include a second literal check in report HTML.
- Touch targets are at least 44×44 px.
- Body copy is 17–18 px with 1.5–1.6 line height.
- The first screen shows practice identity, the main constraint, one strength and the first action.
- Scores are not shown as the primary hero decision.
- Evidence, competitors, methodology and full Repair Paths use progressive disclosure.
- The commercial CTA appears only after the reader reaches the 30-day feasibility section.
- The owner-brief audit template has one native share button near the beginning and one after the final report content.
- The share action uses the device sharing sheet when available and otherwise copies the clean report URL without a fragment. It never exposes report JSON, access credentials or evidence payloads.

## 3. Client-visible attribution

Named-human approval remains mandatory and auditable in report data and workflow records. Client HTML must not display:

- reviewer, approver, manager or selector names;
- `selected_by` or reviewer timestamps;
- claims such as `Approved by Amir` or `Selected by Amir`;
- Valerie Petra / Growth Advisor cards;
- a pending video or walkthrough message.

The walkthrough may remain a separate delivery artifact and internal workflow field. Removing it from the report UI does not weaken the approval gate.

## 4. Demand journey data

`humanDiagnosis.demand_journey` and the canonical stages remain available to the machine/evidence contract. They are not rendered as a client-visible section. The Gap Map, approved Hero asset, Four-Surface snapshot and evidence-driven Journey Graph carry the client-facing diagnosis without a duplicate Demand Journey block.

## 5. Commercial presentation

The report sells implementation through clarity, not withheld information.

- Every selected gap retains a complete DIY-capable Repair Path.
- The four choices remain equally visible: in-house, another provider, defer, CAESTHETIC.
- CAESTHETIC is presented as the simplest coordinator because it already understands evidence, sequence, dependencies and acceptance criteria.
- The single CTA is the separately scoped **30-Day Growth Sprint — $2,500**.
- No ranking, patient, revenue, ROI or guaranteed-growth claim is allowed.
- Sprint Fit is feasibility classification, not purchased scope.

## 6. Localization

One presentation layer supports `en`, `ru`, `es`, `fr`, `uk` and the approved vertical contexts. Locale changes visible copy; vertical context changes nouns and service vocabulary. Neither changes facts, evidence references, scores, binding constraint, Focus Selection or Do Not Fund Yet.

## 7. Analytics

Client interaction events may include only non-PII fields such as report kind, vertical context, locale, section ID and gap ID. Practice name, email, reviewer identity and evidence text must not be sent.

## 8. Versioning

This UI is identified as `growth-score-mobile-ui/1.1.6`. It is a presentation layer over the current schema-v5 report contract. A report-template version bump is not required because no report field, validation rule, metric, evidence or section order changes.


## Multi-Location preservation rules

The responsive enhancement must detect `audit.format=multi_location` and `audit.package_role` before changing section copy or navigation.

- The network parent keeps its server-rendered network titles, CMO decisions, ownership/rollout evidence and single package CTA.
- The focus-location child keeps its link back to the network implementation decision and never receives another Sprint offer or sticky Sprint CTA.
- The enhancement may collapse dense evidence, but it must not replace approved network content with the generic single-location story.
- Demand Journey is not rendered as a client-visible block; filter and navigation controls use at least 44px targets.
- Russian internal-review pages use Russian interface labels, including evidence counts and distinct `Позже` / `Наблюдать` inventory states.

## 2026-09-05 — Spoken versioned owner decision view

User-authorized presentation revision `owner-decision-report/2.0.0` is limited to the existing approved Spoken case. RU and EN `/v2/` child routes share the same nine-section semantics and read their parent approved fact sets. Parent URLs are preserved as v1; shared v1 assets remain unchanged. The new view makes the public-evidence qualification visible in the opening constraint, displays primary priority expanded, restores all seven inventory entries and exposes source traceability. Four implementation choices include Defer; one Sprint and the secondary final Check live in section 9. The mid-report Check remains after the external/internal boundary.

This is not a new audit, new approval or new measurement. The consistency matrix lacks an approved ten-query set and is explicitly unpopulated; empty journey/decision views remain not assessed. The independent website, search, social and reputation surfaces remain exactly four. Version-specific CSS and JS isolate typography and source-link disclosure behavior. Builder: `scripts/caesthetic/build-spoken-medspa-v2.mjs`; regression and browser QA: `tests/caesthetic/spoken-medspa-v2.test.mjs`, `scripts/caesthetic/spoken-v2-browser-qa.mjs`.

### 2026-09-05 — Owner correction to the v2 opening

The owner explicitly removed the opening Primary constraint and What to protect blocks from both Spoken v2 presentations. Their source data and priority detail remain intact. Welcome and studied links are now a permanently visible section, not a disclosure. The msha.ke link is labelled Link-in-bio page / Страница ссылок; it is not evidence of a completed social-channel audit. This instruction supersedes the earlier opening-constraint presentation requirement for this version only. Parent v1 documents remain unchanged.


## 2026-09-05 — Spoken v3: isolated evidence-bound review preview

Owner authorizations: the v3 UX/architecture plan and implementation request at
2026-09-05T17:56:58Z. Profile `owner-decision-report/3.0.0` applies only to paired
Spoken `/v3/` descendants. Parents and `/v2/` are historical, byte-preserved views;
no redirect, new case/catalog record, rescoring or automatic priority change.

Build inputs live in the private case `revisions/v3/` packet. It pins RU/EN approved
report snapshots, paired copy, the source register, query matrix, approved image
hashes and the versioned Check500 US copy. The renderer uses one view model; it
never fetches the parent report or an outside source at build/page-load time.

Current release stage is **review_preview**; both pages identify the observed
source research separately from approved diagnosis. Ten phrases retain the
inherited Botox/filler topic; they are not measured low-frequency queries.
The 2026-09-06 source-observation package replaces the initially empty forty
cells with bounded source results. Other draft packages remain masked.
`--client-release` refuses publication until the query set, evidence, matrix and
whole input release have current named-human content-bound approvals. Hashes
prevent stale review reuse; they do not authenticate a human identity against a
malicious repository administrator. No approval is inferred from an engineering
request or from the older Valerie review of the original fact set.

The first content block remains open welcome/studied links; do not restore the
removed opening constraint/protect cards. How-to-use → unnumbered method intro
(left reviewed contents/right exact approved image) → nine canonical sections.
The full seven-gap inventory and the original three selected IDs remain. Sources
open native disclosures, and keyboard focus lands below the sticky bar. Text and
native disclosure remain usable without JavaScript. Two share controls, three
request intents (two name/email fields), one Sprint and two Check placements.
No generic payment link is invented; orders/payment remain in existing runtime.

Presentation uses 14/18/32px and two approved fonts, 20px minimum mobile gutters;
Check500 keeps its scoped style. The signature is italic and studied links share
the address metadata role. US spelling opt-in is `check500-section/en-US/1.1.0`;
frozen 1.0.0 pages remain untouched.

**V3-only image replacement authorization:** the owner explicitly required only
the supplied Dropbox collection for this revision. Use exact registered system,
journey, paid-traffic and engagement desktop/mobile PNG pairs from
`assets/connect4/{owner,engagement}-20260905/`. This profile supersedes the old
mandatory Hero/Lead-to-Revenue raster placement only inside v3. Do not change,
remove, crop or re-encode those old originals or any v1/v2 image contracts. The
new images explain the method, never client-specific measured losses. The matrix
is semantic HTML with linked evidence, not a newly generated illustration.

Builder: `scripts/caesthetic/build-spoken-medspa-v3.mjs` (`--check` verifies paired
determinism). Contract/model: `consistency-contract.mjs`,
`growth-score-owner-v3-model.mjs`. Tests: `tests/caesthetic/spoken-medspa-v3.test.mjs`.
Browser QA: `scripts/caesthetic/spoken-v3-browser-qa.mjs`; it must mock every lead
submission and keep raw screenshots in private workflow artifacts, not a public
mirror. Release evidence and the research blocker belong to the existing case,
not new fake client evidence.

2026-09-06 Spoken v3 correction: every matrix cell links to its observed source
records, with bounded sample language and separately labelled authorship.
Native source disclosures include excerpt, URL, context, collection date,
method and access limitations. The Russian keyword *соответствие* and noun
inflections are italicized at render time without changing attributes, scripts,
source text or approved images. The `source_observations` presentation is
research within the existing review stage, not a replacement for human approval.


## 2026-09-06 — Spoken 3.1 four answers and Connect4 synthesis

The scoped paired `/v3/` routes implement `caesthetic-choice-synthesis/1.0.0`.
Four open answers retain What observed → Why it matters → Change → Verification.
An unnumbered Connect4 conclusion follows the fourth answer; the method picture
remains inside a native disclosure. The source matrix stays in section seven.
A dated observation result may be positive. Source links open their native
containers, with the target below the sticky bar. Full answers work without JS.

The September 6 booking follow-through disproved the proposed missing-terms
claim: the public consultation card discloses the fee before personal details.
The new sample does not justify a paid Top 3. Show this actual result rather than
reusing archived priorities or inserting empty priority cards. One generic Sprint
inquiry remains primary; two exact Check500 blocks remain conditional on the
internal enquiry boundary. Do not present the generic product as purchased or
personalized scope. Put the minor policy-name correction in the final disclosure.

Retain nine section IDs, four surfaces, approved 14/18/32px type roles, all eight
PNG bytes, request/share flows and immutable parent/v2 artifacts. Catalog input,
paired copy, sources, independent review identities and selection state are
validated before either language is written. Client release remains fail-closed.

## 2026-09-06 — Spoken question navigation

The paired v3 opening omits the redundant “Sources reviewed” overview links.
“How to use this report” introduces four questions; each complete numbered row
is a native link with a decorative arrow to its corresponding `choice-*` answer.
A separate, unnumbered conclusions row links to `connect4-conclusion`. Question
labels come from the same frozen narrative as the answer headings. The closed
“Contents” disclosure immediately follows this navigation. Preserve evidence
links alongside observations and all existing source disclosures.

Keyboard activation focuses the answer and places it below the sticky bar.
Native links also work without JavaScript. Targets stay at least 44px high and
wrap within mobile width. This presentation change does not alter research,
commercial selection, approval state, pricing or approved images.

## Scoped Spoken reading update — 2026-09-06

Owner request: display the approved Connect4 system picture and explanation before
Contents, then four H2 questions with six H3 analysis parts. The Stop picture now
opens `focus-gaps` / «Ваш срочный план». Its accompanying explanation is a general
infrastructure-before-advertising principle, with no invented Spoken spend or loss.

Authority: Client Report Standard v2.10 and Design System §10. Keep the warm
14/18/32px profile, one narrative column, four responsive pictures/eight immutable
PNGs, all nine section IDs, real inline provenance, two exact Check sections,
conditional paid selection and final DIY disclosure. Full-page hash navigation
must still reveal nested evidence and keep the target below the sticky bar.

Criterion sources are dated and scoped; practitioner claims remain self-reports.
Niche guidance is not an automatic defect, a regulatory audit or proof of paid
scope. Current source observations remain distinct from final content approval.
