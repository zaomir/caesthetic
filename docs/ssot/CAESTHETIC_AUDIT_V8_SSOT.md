---
owner: CAESTHETIC
status: experimental
version: 8.0.0
created: 2026-09-11
updated: 2026-09-11
scope: personal Growth Decision Audit based on the Expert Dental presentation
authority: experimental presentation; production route remains v6 until explicit release
evidence_policy: public_sources_only
---

# CAESTHETIC — Audit v8 SSOT

## 1. Purpose

v8 is a personalized, decision-ready audit for the owner or decision maker of an aesthetic practice. It explains how the business appears to a prospective patient before first contact, where uncertainty or distrust appears, what system constraint limits choice, and what should be accepted as the first intervention.

The core narrative is:

> specific practice → patient decision risk → evidence → one binding constraint → Top 3 priorities → Current / Intended state → owner decision.

v8 evolves the Expert Dental format. It is not a new scoring model, product, or replacement for Growth Score v6. Until separately released, v8 is for synthetic tests, design review, and controlled experiments only.

## 2. Scope

The audit covers exactly four public surfaces:

1. Search / Google Business Profile and maps;
2. Website;
3. Social;
4. Reviews & Reputation.

Lead Intake, WhatsApp, calls, administrators, CRM, follow-up and booking are internal conversion / patient-operations. They may be shown only as `not_assessed` or as a separately evidence-gated branch when access exists. Never claim that they create losses without direct evidence.

For 2+ locations use the existing Multi-Location contract: network parent + manager-selected focus location + separate full mono-location report. No Network Score, average network score, or best/worst-business labels.

## 3. Evidence language

Every material statement is one of:

- `fact` — directly visible in a public source;
- `gap` — observed difference from the required standard;
- `inference` — conclusion from several facts;
- `hypothesis` — possible effect on choice, not a proven loss;
- `recommendation` — proposed change;
- `not_assessed` — evidence unavailable;
- `verified_impact` — only after baseline, metric, period, source and human review.

Do not write “loses patients”, “loses money”, “kills marketing”, or similar causal claims without valid outcome data.

## 4. Authoring and release

The current factory gates remain authoritative:

`Manager Interview → public research → complete Russian draft → named-human evidence review → Focus Selection → frozen fact set → approval → QA → delivery`.

Synthetic tests use `catalog_visibility: synthetic`, `publication_status: not_published`, `manager_review: not_requested`, and `human_focus_selection: not_done`. They cannot enter the approved catalog.

Real reports require confirmed business identity, exact location, decision maker, locale, format, and target priority. Unknown values remain `unknown`; they are never invented.

## 5. Page structure

### 0. Cover

Practice, city, date, decision maker, scope, confidentiality or synthetic label, and boundaries.

### 1. Executive diagnosis

One strong thesis: what the practice has, what the patient cannot read, where uncertainty appears, and what decision is required.

### 2. Decision summary

Three to five decision cards. Each card includes evidence, constraint, action, accountable role and a Day-30 public check.

### 3. Patient decision context

For each priority service: patient concern, public proof needed, current evidence, and next step. No medical-quality assessment or treatment promise.

### 4. Evidence and scope

Date, public URLs, coverage, dynamic-source limitations, missing sources, and evidence status.

### 5. Four-surface review

Every surface uses the same sequence: what the patient sees → facts → gap → meaning → recommendation → verification.

### 6. Surface deep dives

Expert-style source/platform panels with optional screenshot, observation list, summary and limitations. Screenshot never replaces URL and date.

### 7. Cross-Surface Consistency

Required 10 × 4 matrix for name, location, category, promise, priority services, price/consultation framing, provider authority, proof, CTA and next step. Each cell is `aligned`, `inconsistent`, `missing`, or `not_assessed` with evidence refs.

### 8. Gap Inventory

Use trust, visibility, clarity, proof, consistency, reputation-response, price-clarity and education gaps. Every item has severity, confidence, affected surface and evidence refs.

### 9. Binding constraint

Exactly one system constraint, not a list of symptoms:

> [Practice] has [assets], but [patient uncertainty] appears at [choice moment] because [confirmed system gap].

### 10. Top 3 priorities

Exactly one Primary and up to two Supporting priorities, unless evidence is insufficient. Each has evidence, intervention, dependency, accountable role, acceptance criteria and Day-30 public check.

### 11. Repair plan

Days 1–10 clarify and repair; Days 11–20 publish and connect; Days 21–30 observe and adjust; Day 30 protect / iterate / scale.

### 12. Do Not Fund Yet

One consolidated block. Typical sequencing: do not buy more traffic, content volume or automation before the priority pathway, message consistency, four-surface coverage and baseline are ready.

### 13. Current / Intended state

`Current → Intended state → Check`. Intended state is not verified impact.

### 14. Implementation offer

Only scope connected to approved priorities. Price is confirmed after scope review:

> Точная стоимость Sprint зависит от объёма работ, числа интервенций и зависимостей. Сделайте запрос — после подтверждения scope мы назовём точную цену.

No fixed Sprint price is embedded in the v8 template.

### 15. Final decision

Repeat binding constraint, Top 3, Do Not Fund Yet, first action and the owner decision required.

## 6. Data contract

Minimum fields:

`schemaVersion`, `presentationVersion`, `audit_format`, `status`, `publication_status`, `business`, `scope`, `evidence`, `consistency_matrix`, `gap_inventory`, `binding_constraint`, `priorities`, `repair_plans`, `do_not_fund_yet`, `before_after`, `implementation_offer`, and `review`.

`business` contains name, aliases, vertical, decision maker, location and website. `scope` contains four surfaces, date, limitations and explicit internal-layer boundary. Every evidence item has id, URL, title, checked date, source type, surface, observation and status.

## 7. Visual contract

Retain the Expert Dental visual language: dark editorial background, large hero typography, numbered sections, sticky horizontal navigation, rounded evidence panels, platform panels, responsive tables, Current / Intended table, and print/PDF support.

Do not copy Expert Dental facts, prices, passwords, client identity, or client-specific commercial terms. This is a presentation layer, not a new global design system.

## 8. QA and release

Check 320, 390, 768 and 1440 px; anchors; keyboard focus; table containment; print; source links; evidence refs; labels for inference and hypothesis; exactly one binding constraint; one Primary and up to two Supporting; no unsupported causality; no Lead Intake conclusion without access; and synthetic exclusion from the approved catalog.

v8 becomes a production route only after explicit owner release, schema/renderer implementation, fixtures, browser/print QA and compatibility review with v6 and Multi-Location.
