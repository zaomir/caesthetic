---
owner: CAESTHETIC
status: active
version: 2.6
created: 2026-08-30
updated: 2026-09-02
scope: unified manager-assigned audit platform for approved CAESTHETIC verticals, from mandatory manager interview to catalogued password-protected delivery on caesthetic.com
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
  - scripts/caesthetic/multi-location-growth-score.mjs
---

# CAESTHETIC — Growth Score Audit Factory SSOT

> One controlled production method for **Growth Score v5**, **Multi-Location Growth Score** and **аудит**. These names resolve to one audit intent: manager assignment → mandatory manager interview → quick public reconnaissance → manager-approved research alignment → full public research → internal AI report → named-human Focus Selection → catalogued protected client pages on `caesthetic.com` → delivery.

This file is the sole operating SSOT for creating both audit formats. It owns sequence, roles, gates, inputs, outputs and fail-closed behaviour. It does not redefine Four-Surface metrics, weights, evidence classes, the current schema-v5 location report, the Valerie walkthrough or Sprint pricing. CAESTHETIC production eligibility is limited to `aesthetic_practice`, `dental_practice` and `beauty_salon`; a generic audit wrapper cannot add a fourth vertical or a second product contract.

## 0. Non-negotiable decisions

1. Both audit formats use **public/open sources only**.
2. The robot starts every manager-assigned audit by interviewing the manager. It must not wait for the manager to remember what to provide.
3. Before full research, the robot performs only quick public reconnaissance and presents a Research Alignment Card.
4. Full research is blocked until the manager confirms or corrects the robot's understanding of the business, locations, scope and competitor set.
5. The robot finds the complete Gap Inventory and proposes a risk order and candidate Focus Selection. That proposal is internal and non-publishable.
6. A named manager manually selects the final one Primary Gap plus exactly two Supporting Gaps.
7. The selected Top 3 gaps appear first on the client page as the most dangerous approved gaps. All other verified, monitor and insufficient-evidence items remain lower in the Full Gap Inventory.
8. Risk order is not the same as score order. The lowest surface score never automatically becomes the Primary Gap.
9. The current schema-v5 visual profile remains the canonical detailed report for one location; “v5” never means an older frozen visual presentation.
10. Multi-Location Growth Score adds a parent network profile and links to one full current schema-v5 report for the manager-selected focus location.
11. A Multi-Location package has one shared final Focus Selection of exactly three gaps total, not a second network or location priority set.
12. Every real client page requires a simple package password validated server-side, plus an unguessable route and noindex controls. Nohy V Ruky follows this same protected contract.
13. `Multi-Location Growth Score`, `Growth Score` and `аудит` are synonyms for the canonical `growth_score_audit` intent. Mentioning any synonym starts the same manager interview.
14. Every approved audit is registered automatically in the internal project catalog. Public listing is separate and requires a synthetic report or explicit client permission.
15. Every client audit page lives under `https://caesthetic.com/score/`; no satellite or third-party host is canonical.
16. Audit-intent detection runs before repository/project routing. The connected repository cannot suppress the mandatory opening or redirect the audit into its own product context.
17. Every current location report uses `schemaVersion=5`, `templateVersion=growth-score-report-template/5.2.0`, one unnumbered Intro and the exact nine-section cockpit. Schema v4 is historical/read-only and cannot be approved, regenerated or delivered as a current v5 report.

## 1. Authority map

| Question | Authority |
|---|---|
| Product, Four Surfaces, funnel, human approval and owner promise | `docs/ssot/CAESTHETIC.md` |
| Metrics, weights, evidence, coverage, schema v5, template `5.2.0`, the unnumbered Intro and nine-section location cockpit | `docs/caesthetic/growth_score_spec.md` |
| Creation sequence for both audit formats | this file |
| Valerie Petra walkthrough | `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md` |
| Global competitor method | `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md` |
| Runtime records and validation | `scripts/caesthetic/growth-score-workflow.mjs` |
| Location report rendering | `scripts/caesthetic/render-growth-score.mjs` |
| Synonym detection and mandatory interview response | `scripts/caesthetic/growth-score-intent-router.mjs` |
| Approved-project discovery and safe catalog rendering | `scripts/caesthetic/growth-score-project-catalog.mjs` |
| Satellite-to-production publication | `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md` |

The Royal Petrol/CARD_NETWORK materials are reference prior art only. CAESTHETIC reuses the useful concepts of branch registry, declared-versus-reviewed coverage, branch competitor maps, confidence states and network-level repeated patterns. It does **not** inherit internal verified datasets, rating-only health labels, exact network claims not reproduced from current public evidence, CARD_NETWORK pricing or its product funnel.

## 2. Two output formats, one factory

The platform unit is an `audit_project`, not a clinic, but the approved CAESTHETIC production vertical remains mandatory. A project may enter production only when `vertical_context` resolves to `aesthetic_practice`, `dental_practice` or `beauty_salon` and its customer-choice journey has meaningful, publicly observable Search, Website, Social and Reputation surfaces. The Research Alignment Card must return `not_applicable` instead of inventing scores when those surfaces or a meaningful public decision journey do not exist.

The generic audit wrapper remains an internal platform capability only and is **not approved for CAESTHETIC production without explicit vertical approval**. An unsupported `subject_type` cannot bypass the `vertical_context` enum, freeze a research brief, create an approved report, enter the completed catalog or reach protected delivery. Adding a vertical requires a versioned product decision plus coordinated schema, rubric, template, renderer and test release; it is not achieved by mapping an arbitrary subject into the `practice` object.

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
| Manager | assign the audit, answer the robot's intake, approve the Research Alignment Card, review evidence, select the focus location for Multi-Location, choose the final Top 3 Focus Gaps, approve the report and deliver it | rely on the robot's draft as final judgment; silently introduce unsupported facts |
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

An approved report authored in `zaomir/caesthetic` enters production only through the exact-SHA, allowlisted control plane in `CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`. Ordinary DEC-829 mirror sync is not publication. Both single-location and the atomic Multi-Location parent/focus-child package use the same gate.

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
- candidate Primary Gap and exactly two candidate Supporting Gaps;
- for Multi-Location, a focus-location recommendation and the alternative shortlist.

### 8.1 Candidate risk order

The robot may rank candidates as `critical`, `high`, `medium` or `monitor` and assign an internal `candidate_rank`. The explanation must cite approved candidate evidence and separately address:

1. observable obstruction of discovery, trust, enquiry or booking;
2. evidence strength, recurrence and freshness;
3. breadth across surfaces or locations;
4. shared-asset/systemic scope;
5. observable disadvantage against the approved competitor set;
6. dependency or binding-constraint role;
7. remediation dependency and 30-day feasibility.

Risk order is a decision aid, not a financial-loss model. Do not estimate lost patients or revenue. Do not derive the order mechanically from the lowest surface score.

The Top 3 candidate gaps are visually separated in the internal report as `Robot recommendation — manager approval required`. The internal report must never look like a delivered client cockpit.

## 9. Gate 5 — named-human review and final Focus Selection

The named manager reviews the internal report and must:

1. verify entity and branch scope;
2. approve or reject source lineage, dates and collection method;
3. approve or reject every proposed Class A fact and publishable metric score;
4. review Class B methods and assumptions;
5. confirm or correct the competitor set and decision summary;
6. group duplicate observations into repair initiatives;
7. for Multi-Location, select exactly one focus location;
8. select exactly one Primary Gap and exactly two Supporting Gaps;
9. ensure every selected gap is verified and has approved Class A evidence;
10. assign at least two `close_in_30_days` gaps;
11. allow at most one `start_in_30_days` gap;
12. confirm the Primary Gap as the binding constraint;
13. approve exactly one `Do Not Fund Yet`;
14. record rationale, name and timestamp.

The manager normally chooses from the robot's highest-risk candidates. The manager may reject or reorder them when evidence, dependency or 30-day feasibility requires it, but must record the reason. Human approval, not AI rank, controls publication.

After approval:

- the selected Primary Gap is displayed first and marked `1`;
- Supporting Gaps are displayed next as `2–3`;
- every remaining verified gap moves below into `Fix next` or backlog;
- monitor and insufficient-evidence items remain visible lower in the inventory;
- the risk labels and ordering shown to the client are the human-approved version.

For Multi-Location, the one shared Top 3 selection must affect the focus location directly or affect a shared network asset used by that location. Other branch-only problems stay in the network inventory and do not silently become Sprint scope.

## 10. Gate 6 — fact-set freeze and final compilation

Create an append-only review trail and freeze a versioned verified fact set. Final scores are calculated deterministically. Final narrative may use only:

- facts in the frozen set;
- visibly labelled Class B items whose method and assumptions were approved;
- the named-human Focus Selection;
- the approved competitor decisions and Do Not Fund Yet.

Any new fact requires a new review event, fact-set version and approval. AI approval, an unnamed reviewer or a visually plausible draft is insufficient.

## 11. Client page contracts

### 11.1 Growth Score v5

Render one unnumbered Intro immediately before the counted cockpit. Its kicker is `YOUR GROWTH SCORE · HOW TO READ THIS REPORT`; it explains the four public surfaces reviewed, the constraint-first purpose, the recommended reading order and the four implementation choices without creating a service commitment. It also shows the shared orientation cards `01 UNDERSTAND`, `02 PRIORITIZE` and `03 ACT`. `vertical_context` adapts nouns/context and `report_locale` localizes the copy inside this one shared Intro; neither changes approved facts or decisions.

Then render exactly nine counted sections in this order:

1. Gap Map (`gap-map`);
2. Focus Gaps (`focus-gaps`);
3. Sprint Fit (`sprint-fit`);
4. Repair Paths (`repair-paths`);
5. Do Not Fund Yet (`do-not-fund`);
6. Full Gap Inventory (`gap-inventory`);
7. Evidence and competitors (`evidence-and-competitors`);
8. Scores and methodology (`scores-and-methodology`);
9. Next step (`next-step`).

The nine sections preserve the full v5 decision package: diagnosis and executive context live in Gap Map; complete remediation stays in Sprint Fit and Repair Paths; evidence, competitors, scores and limitations retain their dedicated combined sections; and Next step carries all four implementation paths, honest `Why CAESTHETIC / Why the 30-Day Sprint`, client ownership/no lock-in and the one optional CTA.

The page shows the exactly three human-approved highest-risk Focus Gaps first. Scores remain secondary, `/100` is absent from the hero, and there is one Sprint CTA.

### 11.2 Multi-Location Growth Score

Render the same shared unnumbered Intro first, adapted only to network/locations wording, then one parent network cockpit with the same nine-section narrative order:

1. Network Gap Map;
2. Focus Gaps;
3. Sprint Fit;
4. Repair Paths;
5. Do Not Fund Yet;
6. Full Network Gap Inventory;
7. Locations, evidence and competitor comparison;
8. Scores, coverage and methodology;
9. Next step.

The hero must state:

- network name;
- `N of M declared locations reviewed`;
- research date;
- public-only method;
- selected focus location;
- `View the full Growth Score for [Location]`.

The child page is a complete current schema-v5 Growth Score for that focus location. Each selected gap carries `shared_asset`, `repeated_pattern` or `focus_location` scope. The parent and child show the same ordered Top 3, one shared binding constraint and one Do Not Fund Yet. The parent may compare per-location surface evidence where coverage passes, but it must not create an aggregate Network Score.

The parent profile additionally requires:

- a validated branch registry and declared-versus-reviewed count;
- a shared/local public-asset registry;
- one reviewed Journey Graph reference for each reviewed location, including explicit `not_assessed` artifacts;
- repeated-pattern records with affected location IDs, evidence references and exact `N of M reviewed` counts;
- a location × Four Surfaces matrix using `Protect | Watch | Fix now | Needs verification`;
- separate internal location comparison and external local-competitor comparison;
- network-scope and pilot/replication acceptance fields on every selected gap.

The parent does not merge every location into one graph. In section 1 it renders the internal location × Four Surfaces comparison immediately after the Demand System, followed by a Network Overview derived from the approved topology, graph references and repeated-pattern index. Section 7 retains external competitor and metric/technical evidence in separate disclosure groups and does not repeat the internal matrix. The parent then links to the ordinary detailed Journey Graph of the focus location. The focus child uses single-location wording, not the network Intro.

The parent renders its exact approved Top 3 once in section 2 as compact decision cards. Client-visible card summaries show scope, affected-location count, pilot, observed surface/journey, why the issue matters, reachable result and accountable role. Evidence IDs, dependencies, sprint detail and implementation instructions remain available under native progressive disclosure. The first four locations are visible; larger registries and matrices retain additional rows under native disclosure. Raw package states and evidence references remain unchanged and auditable.

A selected gap must affect the focus location directly or through a shared asset used by it. Other branch-only gaps remain below in the Full Network Gap Inventory. The package has one commercial CTA on the parent; the child replaces its CTA with navigation back to the parent implementation decision.

## 12. Password, privacy and access group

Every real audit package is delivered through:

- unguessable route slugs;
- `noindex,nofollow,noarchive,nosnippet`;
- exclusion from every sitemap;
- a simple package password validated at the server/edge;
- rate limiting or cooldown for repeated failures;
- an `HttpOnly`, `Secure`, `SameSite` access cookie after success.

The Nohy V Ruky route `/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/` is a real client report and therefore uses the same server-side password/access control as every other real report. Its unguessable slug, full noindex directives, sitemap exclusion and private catalogue state remain mandatory.

Never embed the password, password hash or comparison secret in HTML, client JavaScript, report JSON or the repository. Store only a salted password hash in the protected runtime. Do not use the business name alone as the password.

For Multi-Location, the parent and child share one `access_group_id`; the client enters the password once. Demo/synthetic reports may remain public when clearly labelled synthetic and excluded from real-client routing.

## 13. Walkthrough

The walkthrough is compiled only from the approved report and frozen fact set under `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`.

- A single-location package uses the normal approved location walkthrough.
- A Multi-Location package uses one package walkthrough that begins with network coverage and repeated public patterns, then explains the focus location, shared binding constraint, approved Top 3 Focus Gaps and one Do Not Fund Yet.
- The same package walkthrough may be embedded or linked from both pages; a second video is not mandatory.
- The walkthrough never introduces a gap, competitor claim or priority absent from the approved pages.

## 14. Delivery

After render, route, password, mobile, link, evidence and walkthrough QA:

1. record case/report/fact-set/focus-selection versions;
2. record private route and access group;
3. record intended recipient and manager/operator;
4. record delivery channel and timestamp;
5. record walkthrough status and any delivery failure;
6. for single-location, send the location page link plus password;
7. for Multi-Location, send only the parent network page link plus password; the focus-location link is inside it.

The case becomes `delivered` only after the attempt is recorded. Historical approved reports remain immutable. A Sprint, Day-30 review or later review is a new business state and artifact.

## 15. Fail-closed exceptions

| Exception | Required response |
|---|---|
| Manager has not completed the interview | keep case blocked; ask the missing targeted questions |
| Business or branch identity is ambiguous | request one public identifier; do not merge entities |
| Manager has not approved Research Alignment | do not start full research |
| Competitor set is disputed | issue a corrected Alignment Card version |
| Public evidence is missing | show `Insufficient evidence`; do not guess or use internal data |
| Fewer than three verified eligible gaps | keep `evidence_incomplete`; do not invent Focus Gaps |
| No named-human Focus Selection | no fact freeze, render approval or delivery |
| Multi-Location coverage is partial | disclose `N of M reviewed`; prohibit network-wide claims |
| No approved focus location | block Multi-Location publication |
| Password/access QA fails | block delivery |
| Post-approval correction | supersede through a new draft/fact-set/report version and reapprove |

## 16. Record mapping

The current logical record types remain:

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

Store the new factory checkpoints without inventing parallel truth:

- `score_case`: audit format, manager intake, declared locations, alignment version/status and manager owner;
- `candidate_evidence`: public evidence and location/asset scope;
- `draft`: Internal AI Report, candidate risk order and candidate Focus Selection;
- `review_event`: alignment approval, evidence decisions, focus-location decision and final Focus Selection;
- `verified_fact_set`: approved public facts and competitor evidence;
- `approved_report`: single page or Multi-Location package references, access group and delivery state.

Runtime schema changes require implementation and tests in `scripts/caesthetic/growth-score-workflow.mjs`; this document does not make an unimplemented field silently operational.

## 17. Audit project architecture

Every approved project resolves to this minimum platform record:

| Field | Contract |
|---|---|
| `project_id` | Stable non-secret identifier; unique across the catalog |
| `subject_type` | Internal classification only; it cannot expand the approved `vertical_context` enum or change v5 scoring weights |
| `audit_format` | `single_location` or `multi_location` |
| `display_name` | Internal resolved entity name |
| `locations` | One resolved location or the declared/reviewed network registry |
| `report_state` | Only `approved_report` enters the completed-project catalog |
| `report_refs` | Parent and child routes as applicable, all under `caesthetic.com/score/` |
| `catalog_visibility` | `private`, `synthetic` or explicitly approved `public_case` |
| `access_group_id` | Runtime reference for real packages; never a password or hash |
| `prepared_at` | Report evidence/preparation date |

Single-location projects have one standalone v5 report reference. Multi-Location projects have one parent network reference and one child v5 focus-location reference. The parent and child share the same project/package identity and access group.

Projects outside the three approved verticals may be retained only as internal research candidates with `production_eligibility=not_approved`. They stop before Research Alignment approval and cannot receive a current template version, protected route or catalog entry until explicit vertical approval is released.

## 18. Canonical intent routing

### 18.1 Repository-independent pre-routing

The pre-router is loaded at the root entry point of every supported repository: `zaomir/grainee-v2`, `zaomir/caesthetic`, `zaomir/raimovdental` and `zaomir/artemis`. It runs before local `read_first`, project manifest or knowledge-domain selection. Therefore a Growth Score/audit mention inside another repository still resolves to the CAESTHETIC `growth_score_audit` intent and begins with the same mandatory sentence. Routing starts the interview; it does not establish vertical eligibility. Unsupported verticals remain blocked under §2 before research or production.

The trigger is state-aware. When an audit interview is already active, a message such as `это новый аудит` is an answer, not a new trigger: the robot continues with missing questions and does not repeat the opening. Repository-independent routing does not authorize copying CAESTHETIC audit runtime into satellite repositories; production remains in `zaomir/grainee-v2` and on `caesthetic.com`.

The router normalizes case, Unicode dashes and spacing, then resolves all of these to `growth_score_audit`:

- `Growth Score`;
- `Multi-Location Growth Score` and its dash/spacing variants;
- Russian `аудит` and ordinary grammatical forms;
- English `audit` may be accepted as a convenience alias, but does not create a second intent.

The only allowed initial action is `start_manager_interview`. The router returns the exact Russian opening, the complete questionnaire, `public_open_sources_only` and the `named_manager_research_alignment_approval` gate. It does not start research, select competitors or create a draft report from a bare mention.

## 19. Catalog and site route contract

| Route/artifact | Purpose | Visibility |
|---|---|---|
| `/growth-score/` | Canonical product explainer and external request intake | public |
| `/audit/`, `/audits/`, `/multi-location-growth-score/` | Synonym aliases to `/growth-score/` | noindex redirect |
| `/score/` | Safe catalog of synthetic demos and explicitly approved public cases | noindex |
| `/score/<unguessable-slug>/` | Real standalone report or Multi-Location parent | private/protected |
| `/score/<unguessable-parent>/<unguessable-child>/` | Optional Multi-Location focus-location v5 child | private/protected |
| `docs/audits/caesthetic/growth-score-projects.generated.json` | Complete internal catalog of approved audits | repository/internal only |
| `site-caesthetic/score/catalog.json` | Sanitized public listing data | synthetic or consented only |

`scripts/caesthetic/growth-score-project-catalog.mjs` recursively discovers every `approved_report` in `site-caesthetic/score/**/report.json`. The CAESTHETIC build regenerates the internal catalog, the sanitized public JSON and `/score/index.html`; `--check` fails CI on drift. Therefore a newly approved report enters the internal catalog without a second manual registry edit.

Real projects default to `private`. A real client appears publicly only when the report declares `catalog.visibility=public_case`, `catalog.public_listing_approved=true` and a separate safe `catalog.display_name`. Private names, locations and unguessable routes must not enter either public catalog artifact. Catalog generation is fail-closed on leakage, duplicate `project_id`, invalid format or a route outside `https://caesthetic.com/score/`.

## 20. Production acceptance checklist

An audit is deliverable only when all are true:

- manager interview completed without relying on the manager to remember the required inputs;
- business, location/network scope, vertical and locale resolved;
- vertical is one of `aesthetic_practice`, `dental_practice` or `beauty_salon`; unsupported verticals are `not_approved` for production;
- Research Alignment Card version approved by a named manager;
- competitor proposal approved or corrected before full research;
- only public, dated and reproducible evidence used;
- Four Surfaces, Cross-Surface and applicable competitor analysis complete;
- full Gap Inventory exists;
- internal AI candidate risk order exists and is marked non-publishable;
- named manager selected one Primary plus exactly two Supporting Gaps;
- at least two selected gaps can close in 30 days and at most one can only start;
- exactly one Do Not Fund Yet approved;
- verified fact set frozen and Class A/coverage gates pass;
- Growth Score uses schema v5, template `growth-score-report-template/5.2.0`, the shared unnumbered Intro and the exact nine-section detailed location report;
- Multi-Location, when used, has a validated parent network profile and one linked current schema-v5 focus-location page;
- parent and child share project/access identity, ordered Top 3, binding constraint and Do Not Fund Yet;
- every reviewed location has a registry record, comparison row and reviewed Journey Graph reference;
- every repeated pattern declares exact affected locations, evidence and N-of-M coverage;
- every selected gap has approved scope plus focus-location pilot and later-replication acceptance evidence;
- internal location comparison is separate from external competitor analysis;
- internal location comparison appears once, before the Top 3, while external competitor and technical evidence remain progressive disclosures in section 7;
- the Top 3 appears once as decision cards with complete detail available under native disclosure;
- focus-child navigation clearly returns to the parent network analysis and the parent implementation decision;
- the package exposes one commercial CTA on the parent and navigation-only return on the child;
- no aggregate Network Score, average location score, revenue inference or best/worst-business label is shown;
- protected routes, common password session and robots controls pass QA;
- walkthrough uses only approved content;
- manager delivery is recorded.

**Canonical factory loop:**

```text
Manager Assignment
→ Manager Interview
→ Quick Reconnaissance
→ Research Alignment Approval
→ Full Public Evidence
→ AI Candidate Risk Order
→ Human Focus Selection
→ Approved Client Pages
→ Protected Delivery
```
