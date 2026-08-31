---
owner: CAESTHETIC
status: active
version: 2.2
created: 2026-08-30
updated: 2026-08-30
scope: unified manager-assigned audit platform for any eligible public-facing project, from mandatory manager interview to catalogued password-protected delivery on caesthetic.com
project_master: docs/ssot/CAESTHETIC.md
related:
  - docs/caesthetic/growth_score_spec.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/CARD_NETWORK_EXECUTIVE_SNAPSHOT.md
runtime_contracts:
  - scripts/caesthetic/growth-score-intent-router.mjs
  - scripts/caesthetic/growth-score-project-catalog.mjs
  - scripts/caesthetic/render-growth-score.mjs
---

# CAESTHETIC — Growth Score Audit Factory SSOT

> One controlled production method for **Growth Score v5**, **Multi-Location Growth Score** and **аудит**. These names resolve to one audit intent: manager assignment → mandatory manager interview → quick public reconnaissance → manager-approved research alignment → full public research → internal AI report → named-human Focus Selection → catalogued protected client pages on `caesthetic.com` → delivery.

This file is the sole operating SSOT for creating both audit formats. It owns sequence, roles, gates, inputs, outputs and fail-closed behaviour. It does not redefine Four-Surface metrics, weights, evidence classes, the current schema-v5 location report, the Valerie walkthrough or Sprint pricing.

## 0. Non-negotiable decisions

1. Both audit formats use **public/open sources only**.
2. The robot starts every manager-assigned audit by interviewing the manager. It must not wait for the manager to remember what to provide.
3. Before full research, the robot performs only quick public reconnaissance and presents a Research Alignment Card.
4. Full research is blocked until the manager confirms or corrects the robot's understanding of the business, locations, scope and competitor set.
5. The robot finds the complete Gap Inventory and proposes a risk order and candidate Focus Selection. That proposal is internal and non-publishable.
6. A named manager manually selects the final one Primary Gap plus two or three Supporting Gaps.
7. The selected 3–4 gaps appear first on the client page as the most dangerous approved gaps. All other verified, monitor and insufficient-evidence items remain lower in the Full Gap Inventory.
8. Risk order is not the same as score order. The lowest surface score never automatically becomes the Primary Gap.
9. Growth Score v5 remains the canonical detailed report for one location.
10. Multi-Location Growth Score adds a parent network-analysis page and links to one full Growth Score v5 for the manager-selected focus location.
11. A Multi-Location package has one shared final Focus Selection of 3–4 gaps total, not 3–4 network gaps plus another 3–4 location gaps.
12. Real client pages require a simple package password validated server-side, plus unguessable routes and noindex controls.
13. `Multi-Location Growth Score`, `Growth Score` and `аудит` are synonyms for the canonical `growth_score_audit` intent. Mentioning any synonym starts the same manager interview.
14. Every approved audit is registered automatically in the internal project catalog. Public listing is separate and requires a synthetic report or explicit client permission.
15. Every client audit page lives under `https://caesthetic.com/score/`; no satellite or third-party host is canonical.
16. Audit-intent detection runs before repository/project routing. The connected repository cannot suppress the mandatory opening or redirect the audit into its own product context.

## 1. Authority map

| Question | Authority |
|---|---|
| Product, Four Surfaces, funnel, human approval and owner promise | `docs/ssot/CAESTHETIC.md` |
| Metrics, weights, evidence, coverage, schema v5 and 9-section location cockpit | `docs/caesthetic/growth_score_spec.md` |
| Creation sequence for both audit formats | this file |
| Valerie Petra walkthrough | `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md` |
| Global competitor method | `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md` |
| Runtime records and validation | `scripts/caesthetic/growth-score-workflow.mjs` |
| Location report rendering | `scripts/caesthetic/render-growth-score.mjs` |
| Synonym detection and mandatory interview response | `scripts/caesthetic/growth-score-intent-router.mjs` |
| Approved-project discovery and safe catalog rendering | `scripts/caesthetic/growth-score-project-catalog.mjs` |

The Royal Petrol/CARD_NETWORK materials are reference prior art only. CAESTHETIC reuses the useful concepts of branch registry, declared-versus-reviewed coverage, branch competitor maps, confidence states and network-level repeated patterns. It does **not** inherit internal verified datasets, rating-only health labels, exact network claims not reproduced from current public evidence, CARD_NETWORK pricing or its product funnel.

## 2. Two output formats, one factory

The platform unit is an `audit_project`, not a clinic. Any public-facing business or project may enter the factory when its customer-choice journey has meaningful, publicly observable Search, Website, Social and Reputation surfaces. The Research Alignment Card must return `not_applicable` instead of inventing scores when those surfaces or a meaningful public decision journey do not exist.

The generic project wrapper does not fork Growth Score v5. It maps the approved subject name and public geography into the existing schema-v5 `practice` compatibility object for the detailed single-location renderer; its generic identity, subject type and audit format live in the audit project/catalog layer.

| Format | Internal research unit | Client deliverable |
|---|---|---|
| `single_location` | One resolved public business location | One protected Growth Score v5 page |
| `multi_location` | One declared network, its reviewed locations, shared assets and local assets | One protected network-analysis page plus one linked protected Growth Score v5 page for the focus location |

For Multi-Location:

- the deliverable is one parent network-analysis page plus one linked protected Growth Score v5 page;
- the network page is the delivery entry point;
- its hero says how many locations were declared and how many were actually reviewed;
- it explains shared versus location-specific gaps;
- it shows repeated patterns and the best observed public-surface practices inside the network;
- it names the manager-selected focus location;
- it contains one navigation link: `View the full Growth Score for [Location]`;
- the child location page links back to the network page;
- both pages use the same approved fact set, Focus Selection and access group;
- the link between pages is navigation, not a second commercial CTA;
- there is no aggregate Network Score `/100`.

Do not call a location the network's best or worst business performer. Public evidence supports only statements such as `strongest observed public Search surface among the reviewed locations` or `highest-risk observed public gap`.

## 3. Roles and decision rights

| Role | Must do | Must not do |
|---|---|---|
| Manager | assign the audit, answer the robot's intake, approve the Research Alignment Card, review evidence, select the focus location for Multi-Location, choose the final 3–4 Focus Gaps, approve the report and deliver it | rely on the robot's draft as final judgment; silently introduce unsupported facts |
| Robot / AI | interview the manager, run quick reconnaissance, propose competitors and scope, collect public evidence, build the complete inventory, propose risk order and repair paths, compile approved pages | start full research before alignment approval; use closed data; make final Focus Selection; publish or deliver without human approval |
| Method owner | approve global changes to rubrics, prompts, templates and learning releases | promote one client correction into global canon automatically |

The manager's information is `self_reported` context until independently verified through public evidence. It may guide entity resolution and research questions, but it cannot increase score coverage or become Class A evidence by itself.

## 4. Canonical gates and case progression

The existing machine states remain authoritative. The following mandatory gates are stored inside the case/draft/review trail and do not invent new record types:

```text
score_case created
→ Manager Interview complete
→ Research Alignment approved
→ researching
→ Internal AI Report ready
→ named-human evidence review
→ named-human Focus Selection
→ verified fact set frozen
→ report review
→ approved report
→ protected route QA
→ delivered
→ closed
```

No later gate may compensate for a missing earlier gate. In particular:

- no full research before `research_alignment.status=approved`;
- no final compilation before named-human Focus Selection;
- no render publication before approved report;
- no delivery before password/access QA.

## 5. Gate 1 — mandatory Manager Interview

Immediately after the manager assigns an audit, or whenever a user mentions `Multi-Location Growth Score`, `Growth Score` or `аудит`, the robot opens with the exact sentence: **`Вы создаёте новый аудит? Ответьте на вопросы.`** It then shows the structured interview. It must reuse facts already present in the assignment and ask only for missing information. It must continue with targeted follow-ups until the mandatory card is complete or explicitly blocked.

### 5.1 Questions for both formats

The robot asks for:

1. audit format: one location or multi-location;
2. business/trading name and known aliases;
3. official website and known public profiles;
4. exact city/region/country and public address for the target location;
5. what the business sells and how the manager understands its core offer;
6. priority services/treatments/products to use as research context;
7. target customer or patient-choice market as manager context;
8. relevant languages and final report locale;
9. known competitors and why the manager considers them relevant;
10. the client's stated concern, request or reason for the audit;
11. known rebrand, relocation, duplicate listing, closure or ownership ambiguity;
12. intended recipient, delivery language and manager responsible for approval;
13. any public URLs or prior public observations already collected;
14. explicit exclusions or scope constraints.

### 5.2 Additional Multi-Location questions

The robot also asks for:

1. the expected complete location list;
2. which locations are believed active, closed, moved or rebranded;
3. which website, booking, social and reputation assets are shared;
4. which assets are location-specific;
5. whether different locations serve materially different markets or service mixes;
6. any manager-suspected weak location, treated only as context;
7. any location that must not be included and the reason.

### 5.3 Forbidden intake

The robot must not request or use as audit evidence:

- CRM, EHR or patient records;
- GA4, GSC, ad-account or vendor credentials;
- revenue, profit, leads, bookings, conversion or show-rate data;
- call, WhatsApp, email or reception transcripts;
- internal staffing, training or workflow assertions;
- mystery-shopper calls, messages, form submissions or appointment creation;
- PHI or unnecessary personal data.

If the manager volunteers such information, record only the minimum necessary self-reported context, exclude it from evidence and explain that the audit conclusion must be reproducible from public sources.

### 5.4 Interview completion

The robot returns a Manager Intake Card showing:

- supplied fields;
- robot-resolved public identifiers;
- unanswered mandatory fields;
- self-reported assumptions;
- conflicts requiring clarification.

The gate passes only when the business can be resolved to at least one unambiguous public identifier and the requested audit format and scope are clear.

The context-resolution order remains: **resolve practice identity → resolve `vertical_context` → resolve `report_locale` → freeze research brief**. For Multi-Location, freeze also the approved branch scope and shared/local asset topology.

## 6. Gate 2 — quick reconnaissance and Research Alignment Card

After the interview, the robot performs a **quick**, non-scored public check. This is not the full audit.

The quick check may inspect:

- the official site and obvious service proposition;
- Maps/GBP identity and visible location list;
- public social-profile ownership;
- obvious shared versus local assets;
- branded search results;
- candidate local competitors;
- obvious ambiguity, duplicate or stale entities.

The robot then sends the manager one Research Alignment Card containing:

1. **Business understanding** — a plain-language statement of what the business is, what it sells, to whom and in which market.
2. **Resolved entities** — business, target location or proposed network registry and public URLs.
3. **Audit format** — single or Multi-Location and the exact deliverables.
4. **Research scope** — Four Surfaces, separate Cross-Surface layer and public-only limitations.
5. **Competitor proposal** — names, URLs, geography/type and why each is comparable.
6. **Multi-Location topology** — declared, found and unresolved locations; shared and local assets.
7. **Proposed comparison method** — query family, geography, observation windows, review sample and path checks.
8. **Unknowns and exclusions** — what cannot yet be verified and what will remain `Insufficient evidence`.
9. **Planned output** — what the robot will research and what the manager will later decide.

### 6.1 Competitor proposal rules

For one location, propose 3–5 competitors: relevant local alternatives plus a category or positioning reference only when useful.

For Multi-Location:

- identify a compact local comparison set for each reviewed location where geography materially changes customer choice;
- propose the full 3–5 competitor CDA set for the likely focus-location candidates;
- do not force one national competitor list onto every branch;
- preserve comparable geography, query, review window and customer task;
- public ads show visible strategy, not effectiveness.

### 6.2 Manager confirmation

The robot asks for one explicit decision:

- `APPROVE` — the business understanding, location scope, competitor proposal and research plan are correct; or
- `CLARIFY` — the manager supplies corrections.

Each clarification creates a new alignment version. The robot repeats the corrected card. Full research starts only after a named manager approves a specific version with timestamp.

## 7. Gate 3 — full public research

After alignment approval, collect dated, reproducible evidence across exactly:

1. Search / Google Business Profile;
2. Website;
3. Social;
4. Reputation / Reviews;
5. Cross-Surface Consistency as a separate, unweighted layer;
6. Competitive Decision Analysis as a cross-cutting, unscored decision layer.

Every candidate evidence item retains:

- business and location identity;
- surface and canonical metric id where applicable;
- source URL, screenshot/export reference or reproducible path;
- collection date/time;
- method and comparable window;
- proposed Class A or labelled Class B status;
- reviewer status;
- limitations and supersession link.

Unknown, inaccessible, stale, unsupported or contradictory evidence remains unavailable. Never convert missing evidence into zero.

### 7.1 Public-only boundaries

Allowed:

- public Maps/GBP, SERP, directories and reproducible public geo-grid evidence;
- public website pages and measured PageSpeed/Lighthouse data;
- public booking/enquiry navigation only up to non-submission;
- public social profiles and dated content samples;
- public ratings, reviews and owner responses under disclosed windows;
- public competitor surfaces using the same comparison task.

Forbidden:

- sending a form, message or test enquiry;
- making a call or appointment;
- claiming internal causes such as reception, CRM, staffing or training;
- claiming revenue, patient, lead, conversion or operational impact;
- presenting a public competitor's visible activity as proof of commercial effectiveness.

### 7.2 Multi-Location collection

For every declared location, record one of:

- `reviewed`;
- `not_found`;
- `ambiguous`;
- `closed_or_moved_publicly_observed`;
- `excluded_by_approved_scope`.

Build:

- a branch registry;
- a location × Four Surfaces comparison matrix;
- a shared/local asset map;
- repeated network patterns;
- location-specific gaps;
- best observed public-surface patterns inside the reviewed network;
- a focus-location shortlist.

One shared-site or shared-social defect is one systemic gap, not a duplicate gap for every location. Use `Observed in N of M reviewed locations` unless every declared active location was actually reviewed.

## 8. Gate 4 — Internal AI Report and candidate danger order

The robot compiles an internal, non-publishable report containing:

- resolved scope and coverage;
- one defensible objective strength;
- complete candidate evidence;
- proposed scores where coverage gates pass;
- complete Gap Inventory;
- proposed binding constraint;
- proposed competitor decisions;
- proposed `Do Not Fund Yet`;
- Repair Plan for every verified gap;
- candidate risk order;
- candidate Primary Gap and 2–3 candidate Supporting Gaps;
- for Multi-Location, a focus