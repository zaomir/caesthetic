---
owner: CAESTHETIC
status: active
version: 1.0
updated: 2026-09-01
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
- Touch targets are at least 44×44 px.
- Body copy is 17–18 px with 1.5–1.6 line height.
- The first screen shows practice identity, the main constraint, evidence-based demand journey, one strength and the first action.
- Scores are not shown as the primary hero decision.
- Evidence, competitors, methodology and full Repair Paths use progressive disclosure.
- The commercial CTA appears only after the reader reaches the 30-day feasibility section.

## 3. Client-visible attribution

Named-human approval remains mandatory and auditable in report data and workflow records. Client HTML must not display:

- reviewer, approver, manager or selector names;
- `selected_by` or reviewer timestamps;
- claims such as `Approved by Amir` or `Selected by Amir`;
- Valerie Petra / Growth Advisor cards;
- a pending video or walkthrough message.

The walkthrough may remain a separate delivery artifact and internal workflow field. Removing it from the report UI does not weaken the approval gate.

## 4. Demand journey

The demand journey uses exactly five stages:

`discovery → trust → enquiry → booking → treatment`

Allowed client-visible states:

- `strong` — green, evidence-backed working stage;
- `friction` — amber, evidence-backed friction;
- `constraint` — red, exactly the binding-constraint stage;
- `unknown` — grey, not assessed or insufficient evidence.

Colour is never the only signal. Every state includes a text label and accessible name.

If the report does not yet contain explicit `humanDiagnosis.demand_journey`, the presentation layer derives only defensible states from the binding constraint and Gap Inventory. It must never mark earlier stages green solely because they occur before the constraint.

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

This UI is identified as `growth-score-mobile-ui/1.0.0`. It is a presentation layer over the current schema-v5 report contract. A report-template version bump is not required because no report field, validation rule, metric, evidence or section order changes.
