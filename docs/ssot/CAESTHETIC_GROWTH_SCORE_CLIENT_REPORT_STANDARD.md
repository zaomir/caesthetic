---
owner: CAESTHETIC
status: active
version: 1.0
updated: 2026-09-02
scope: client-facing Growth Score report presentation, approval/translation, competitive decision layer, walkthrough separation, commercial choice framing, privacy and production acceptance
parent: docs/ssot/CAESTHETIC.md
implementation_spec: docs/caesthetic/growth_score_spec.md
related:
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
supersedes_scope:
  - client-visible reviewer/walkthrough requirements in older Growth Score report specs
  - report-presentation decisions that conflict with this standard
---

# CAESTHETIC Growth Score — Client Report Standard

This is the active SSOT for the **client-facing Growth Score report**. It consolidates the approved report, mobile UX, competitive-analysis and delivery decisions without changing the CAESTHETIC product model.

Authority order remains:

`active global/master SSOT → this standard → detailed Growth Score spec → working docs / historical artifacts`.

If this document conflicts with `docs/ssot/CAESTHETIC.md`, the master SSOT wins. Evidence, clinical/regulatory, privacy and commercial rules may only be tightened here, never weakened.

## 1. Product purpose and owner story

The Growth Score report is a **decision instrument**, not a vanity score, generic marketing audit, service menu or sales deck.

The owner should understand, in this order:

1. what is already working and should be protected;
2. where the current binding constraint is;
3. what must be fixed first;
4. what should **not** be funded yet;
5. what the complete implementation work looks like;
6. which legitimate implementation path the owner wants to use.

The first screen must make the **Primary Constraint** dominant. Scores are secondary navigation and never select the Focus Gaps automatically.

The narrative follows the canonical loop:

`Evidence → Constraint → Priority → Decision → Intervention → Adoption → Verified Impact → Learning`.

Use progressive disclosure: **decision first, evidence and methodology drill-down later**. Do not force the owner to read raw evidence tables before understanding the decision.

## 2. Immutable report structure

The schema-v5 client report keeps one shared renderer/template across all supported verticals, locales and single/multi-location contexts.

Canonical contract:

- `schemaVersion = 5`;
- `templateVersion = growth-score-report-template/5.2.0` until a later approved version explicitly supersedes it;
- Overview / report header may appear before Intro;
- Intro is separate and **unnumbered**;
- the cockpit has exactly **9 numbered canonical sections**;
- exactly **1 Primary Gap + 2 Supporting Gaps**;
- no tenth report section;
- no fifth surface;
- one commercial CTA only.

The nine sections are exactly:

1. `gap-map` — Gap Map
2. `focus-gaps` — Focus Gaps
3. `sprint-fit` — Sprint Fit
4. `repair-paths` — Repair Paths
5. `do-not-fund` — Do Not Fund Yet
6. `gap-inventory` — Full Gap Inventory
7. `evidence-and-competitors` — Evidence and competitors
8. `scores-and-methodology` — Scores and methodology
9. `next-step` — Next step

Visual or commercial storytelling is composed **inside this machine structure**. It may not create a parallel template, a separate vertical product, a competitor score, a network score or an extra report surface.

## 3. Four Surfaces and the internal conversion boundary

The public patient-decision model remains exactly:

1. Search / Google Business Profile
2. Website
3. Social
4. Reputation / Reviews

Cross-Surface Consistency is a diagnostic between these surfaces, not a fifth surface.

Paid acquisition remains the Demand Layer, not a fifth surface.

The report may explain the end-to-end journey as:

`Demand → Four Surfaces → enquiry / booking → internal conversion and patient-operations layer → patient / revenue`.

The internal conversion/patient-operations layer begins after the public decision path. CRM, telephony, front desk, chatbot, follow-up, training, call QA, hiring and similar functions are **not** report surfaces and are not diagnosed from outside-in evidence.

During the Free Growth Score, an observable public fact may be stated when permission and valid evidence exist—for example whether a truthful non-clinical enquiry received a response by a disclosed cutoff. Internal causes remain `Not assessed` or `Insufficient evidence — requires workflow/data access` unless the required evidence/access exists.

## 4. Client-visible human attribution and walkthrough separation

Named-human approval remains mandatory internally where required by the Growth Score contract. The reviewer/selector identity, approval timestamp and audit trail remain in the internal evidence/review layer.

**The client report itself must not render reviewer or selector personal attribution.**

The client-facing report HTML/source must not contain a reviewer card, selector card, reviewer name, selector name or a personal-approval presentation block merely to prove that the internal gate occurred.

The Valerie Petra walkthrough remains a **separate delivery artifact** governed by `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`; it is not a report section or report card.

Therefore the report body/source must not render:

- `Your Growth Review` / `Ваш разбор Growth Score`;
- a Valerie Petra walkthrough card;
- `3–8 minutes` / `3–8 минут` as a walkthrough card element;
- a pending walkthrough placeholder;
- a walkthrough URL or button embedded inside the report UI.

Walkthrough status, URL and presenter metadata may remain in the internal case/delivery workflow when needed, but they are not client-report presentation fields.

This rule does **not** remove the human approval gate and does **not** abolish the separate walkthrough delivery artifact.

## 5. Competitive Decision Analysis

When a comparable market exists, Competitive Decision Analysis is integrated inside section 7, `evidence-and-competitors`, and uses the same Four Surfaces.

Default useful comparison set: **3–5 named competitors**, unless the evidence or market structure justifies fewer/more under the global standard.

The report must disclose, where applicable:

- why each competitor was included;
- competitor type / role in the set;
- geographic / branch scope;
- source and collection date;
- comparable query, path or review window;
- review sample size and recurrence rule;
- repeated positive review themes;
- repeated negative review themes;
- why a patient may choose that competitor;
- observable advantage;
- observable gap / risk;
- what is worth repeating or adapting;
- what should not be copied;
- effect on the existing binding constraint and Top 3.

The owner-facing decision layer ends with exactly these four actions:

- **Defend** — preserve the subject practice's verified advantage;
- **Close** — close the clearest evidence-backed patient-decision gap;
- **Differentiate** — own a stronger evidence-to-decision position rather than merely copying activity;
- **Do not copy** — do not imitate visible activity whose effectiveness, economics, safety or clinical superiority is unverified.

Competitive evidence is a decision layer, **not** a competitor ranking, fifth surface or automatic new priority.

A modern-looking competitor, newer technology, product/material, protocol or delivery model is a market signal only. Medical/drug/device/protocol implications require the qualified clinical/regulatory gate before any clinical conclusion or change.

## 6. Maps / GBP and Reputation prominence

Search / Maps / GBP and Reputation / Reviews are mandatory high-salience checks in every Growth Score owner presentation.

Allowed owner statuses:

- **Protect** — evidence shows the surface is currently strong;
- **Watch** — evidence shows a material monitoring/risk need;
- **Fix** — evidence supports a verified gap;
- **Needs verification** — evidence is insufficient.

Prominence does not force either surface into the Top 3. A strong surface must not be labelled a leak merely because it is strategically important. Focus Selection still follows evidence, dependency and named-human judgment.

## 7. Russian-first review and translation workflow

For every **new non-Russian client report**, the internal discussion pilot is Russian before the final presentation is translated.

Canonical flow:

`Research → Russian internal pilot → named employee review/corrections → APPROVE → freeze decision facts → translate presentation → translation QA → client report`.

Rules:

- `internal_pilot_locale = ru`;
- delivery locale may be `en | ru | es | fr | uk`;
- no non-Russian client presentation is released before the Russian internal pilot is approved;
- after approval, freeze the facts, evidence references, scores, binding constraint, Top 3 Focus Gaps, Do Not Fund Yet and Repair Plans;
- translation may change presentation language only;
- if diagnosis, priority or repair logic changes after review, return to the Russian pilot, review again and re-approve before translation;
- final localized presentation receives translation QA;
- original evidence language remains preserved; translations/paraphrases are labelled where required;
- historical reports created before this workflow are not retroactively represented as having passed it.

Vertical context and locale remain independent. Locale never changes metric IDs, scoring, evidence class, constraint or Focus Selection.

## 8. Mobile-first presentation and visual precedence

The report is designed for an owner reading first on mobile, while remaining fully usable on desktop.

Presentation rules:

- Primary Constraint dominates the hero / first decision screen;
- one objectively strong point is visible early so the report is not framed as a list of failures;
- Gap Map and Focus Gaps are scannable before evidence drill-down;
- long implementation and evidence content uses progressive disclosure / accordions where appropriate;
- evidence tables must remain readable and use contained horizontal overflow rather than causing body overflow;
- the body must not horizontally overflow at the production mobile acceptance width;
- the single commercial CTA appears late, after the owner has seen Sprint Fit; canonical action resolves through section 9 `next-step`;
- do not duplicate Sprint CTAs across sections;
- a sticky CTA may be used only late in the report when it does not interrupt reading; disable it on mobile when it degrades the decision flow.

Approved visual grammar:

- warm background `#F0EDE6`;
- navy `#0B2438`;
- burgundy signal/accent `#7B244B`;
- Source Serif 4 / IBM Plex family pairing;
- content width approximately `1120px`;
- compact outlined status pills;
- editorial decision cards with restrained radius;
- strict rectangular evidence tables;
- Primary constraint visually outweighs supporting context.

Visual refinement must never alter the machine contract, Four Surfaces, evidence, Focus Selection or commercial truthfulness.

## 9. Implementation choice and commercial decision story

The report preserves owner agency. It must show legitimate implementation choices rather than manufacturing dependence on CAESTHETIC:

1. implement in-house;
2. use another provider / separate specialists;
3. ask CAESTHETIC to implement the selected work;
4. defer work that is genuinely not justified now.

DIY instructions must be complete enough to execute. Do not hide steps, duplicate work or inflate task count to make CAESTHETIC appear necessary.

The report may expose **real coordination burden** derived from the approved plan—for example number of tasks, dependencies, specialist roles and systems/surfaces involved. This is an implementation-management fact, not a fear device.

### 9.1 Retail-equivalent comparison — fail closed

A directional comparison with buying selected implementation separately is allowed only when the **exact Top 3** has a complete, dated costing basis.

The basis must cover all selected gaps and disclose roles/work packages, method or rate basis, source/date and arithmetic. Coordination/QA may be counted once; it may not be double-counted.

If evidence is incomplete, do not invent `$3,000–4,000`, a saving claim or a fake vendor quote. Show the coordination burden without a money comparison.

If a documented retail range overlaps the canonical Sprint price, do not claim a saving; the defensible commercial difference is coordinated implementation, dependency management, QA and one owner of the logic.

### 9.2 Seven-calendar-day scope hold

A final approved report may state that the **current written Sprint scope** is held for seven calendar days from report approval.

This is an operational validity window, not a discount mechanic:

- show a concrete expiry date;
- never use a resetting countdown;
- after expiry, recheck relevant surfaces and delivery capacity before reconfirming the same scope;
- the canonical Sprint price does not automatically increase when the hold expires;
- never claim false scarcity or a false future price.

### 9.3 Canonical prices and continuation

Current canonical commercial facts remain:

- Growth Score: **$0**;
- 30-Day Growth Sprint: **$2,500**;
- optional Sprint 2 / Extension: **$2,500 per additional 30 days**, only after Day 30 when a finite remaining/new verified constraint justifies it;
- Growth System: optional recurring ownership; exact recurring economics remain **client-specific** under the active master/economics SSOT and signed Commercial Schedule / SOW.

There is **no universal `$1,500/month Sprint Alumni` fee in the current canon**. A reusable recurring amount may become canonical only through an explicit later pricing/SSOT decision that updates the applicable pricing authority. Do not publish or infer it from a working document.

The owner keeps the delivered report, evidence pack, task plan and completed outputs and may continue in-house, with another provider, with CAESTHETIC or stop. No lock-in framing is allowed.

## 10. Privacy and route rules

Every Growth Score route remains `noindex` and outside the sitemap.

Real client reports use the applicable protected-delivery contract:

- unguessable/private route;
- server-side access protection where required;
- no password, password hash, session secret or access configuration embedded in client HTML, JavaScript, report JSON or repository artifacts;
- no client report added to a public case catalogue without explicit permission/redaction under the master rules.

Public demos must be conspicuously synthetic, fictional and explicit that no client relationship is represented.

Client-report source privacy additionally requires that reviewer/selector personal attribution and walkthrough URLs/cards are absent from generated client report HTML.

## 11. Production acceptance

A Growth Score client-report change is not production-accepted merely because a PR is ready, CI is green or merge is complete.

Acceptance requires:

1. canonical renderer validation and deterministic render-drift check;
2. exact Intro + nine numbered sections;
3. exactly one Primary + two Supporting Focus Gaps;
4. one late commercial CTA;
5. source-level absence of client-visible reviewer/selector attribution and embedded walkthrough card/URL;
6. Four Surfaces unchanged; Cross-Surface remains separate;
7. mobile and desktop smoke with no body overflow and usable evidence drill-down;
8. privacy/noindex/sitemap gates;
9. live production URL;
10. deployed SHA;
11. successful exact production smoke.

For protected reports, acceptance also includes unauthenticated gate, wrong-password rejection, valid session issuance and authenticated report/JSON checks.

## 12. Anti-patterns

Do not:

- add a fifth surface;
- add a tenth machine section;
- turn competitor analysis into a ranking or score;
- expose reviewer/selector identity to prove human approval;
- embed the Valerie/walkthrough card back into the report;
- diagnose internal conversion causes without access/evidence;
- force Maps or Reputation into Top 3 without evidence;
- hide DIY instructions to manufacture sales dependence;
- invent retail implementation prices, savings, ROI, patients or revenue;
- use fake scarcity, fake countdowns or implied price increases;
- publish a universal recurring fee that is not in current pricing/SSOT authority;
- translate or localize in a way that changes evidence or the approved diagnosis.

The report should make the owner feel **clearer and more capable of making the next decision**, while keeping CAESTHETIC's commercial value grounded in evidence, coordination and accountable implementation rather than information asymmetry.