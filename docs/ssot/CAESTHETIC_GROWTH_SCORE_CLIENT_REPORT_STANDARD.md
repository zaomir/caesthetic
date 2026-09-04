---
owner: CAESTHETIC
status: active
version: 2.8
updated: 2026-09-04
scope: client-facing Growth Score report presentation, single-location and Multi-Location visual profiles, final visual narrative, approval/translation, competitive decision layer, Cross-Surface Journey Graph and five derived decision views, Lead-to-Revenue visual branch, walkthrough separation, commercial choice framing, privacy and production acceptance
commercial_contract: caesthetic-4444-commercial-core/1.0.0
parent: docs/ssot/CAESTHETIC.md
implementation_spec: docs/caesthetic/growth_score_spec.md
related:
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
  - docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
supersedes_scope:
  - client-visible reviewer/walkthrough requirements in older Growth Score report specs
  - report-presentation decisions that conflict with this standard
  - the proposed/next-version visual order in earlier Growth Score working material
  - client-visible Demand Journey requirements in older presentation profiles
---

# CAESTHETIC Growth Score — Client Report Standard

This is the active SSOT for the **client-facing Growth Score report**. It consolidates the approved report, mobile UX, competitive-analysis, Cross-Surface Journey Graph, final visual narrative and delivery decisions without changing the CAESTHETIC product model.

Authority order remains:

`active global/master SSOT → this standard → detailed Growth Score spec → active implementation profile → working docs / historical artifacts`.

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

The canonical visual story is:

`Owner tension → Client Journey Map → Four-Surface snapshot → Broken Connections Map → Top 3 → competitor decision → system synthesis → implementation decision → internal-conversion boundary → next path → founder note`.

This visual story is mapped inside the immutable machine contract below. It does not create a second report structure.

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
- one primary evidence-backed implementation CTA at most, plus exactly two always-visible Check500 placements on a single-location report or Multi-Location parent; a Multi-Location focus child has navigation only.

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

### 3.0.1 4444 commercial narrative

Every report explains that **4444 is the primary CAESTHETIC product**: coordinated demand language across Search / Google Business Profile, Website, Social and Reputation / Reviews including owner responses. The report determines from approved evidence whether and where those surfaces fail to operate as one patient-decision system; it may not manufacture inconsistency when the evidence does not support it.

The client-visible 4444 outcome includes:

- a demand-language map for priority services;
- precise long-tail queries with clearer booking intent;
- one service, provider and location vocabulary;
- intentional query allocation across website pages, blog, Google Business Profile, Social, reviews and owner responses;
- a regular content cadence;
- a compliant honest-review growth and owner-response system; and
- continuing Four-Surface consistency verification.

The primary commercial recommendation is to implement the approved 4444 priority. The primary paid action is the **30-Day Growth Sprint — $2,500**, with practice-specific scope confirmed separately. The report must explain which 4444 outcome the Sprint is intended to create without presenting the illustrative 30-day sequence as already purchased scope or promising results.

The optional **Lead-to-Revenue Check — $500** remains the secondary branch governed by `check500-two-placement/1.0.0`. It is appropriate for a person who wants more clarity about the post-enquiry path or prefers a smaller first engagement, but it does not displace 4444 or the Sprint.

Business-name changes, duplicate cleanup, redirects, schema and isolated technical repairs may remain in the Gap Inventory and complete implementation instructions when evidence supports them. They are prerequisites or tactics, not the center of the commercial story. Client copy must not turn one technical repair into the main CAESTHETIC product.

Reviews are not provider-authored keyword inventory. The report may recommend compliant requests for honest reviews, analysis of recurring patient language and natural, truthful, privacy-safe owner responses. It may not recommend review gating, scripted positive sentiment, incentives, purchased reviews or keyword stuffing in patient or owner language.

The report may explain the end-to-end journey as:

`Demand → Four Surfaces → enquiry / booking → internal conversion and patient-operations layer → patient / revenue`.

The internal conversion/patient-operations layer begins after the public decision path. CRM, telephony, front desk, chatbot, follow-up, training, call QA, hiring and similar functions are **not** report surfaces and are not diagnosed from outside-in evidence.

During the Free Growth Score, an observable public fact may be stated when permission and valid evidence exist—for example whether a truthful non-clinical enquiry received a response by a disclosed cutoff. Internal causes remain `Not assessed` or `Insufficient evidence — requires workflow/data access` unless the required evidence/access exists.

### 3.1 Cross-Surface Journey Graph evidence and renderer contract

The **Cross-Surface Journey Graph** is the canonical machine-readable evidence artifact for observable routes between public assets and the `Lead Intake` boundary. It deepens Cross-Surface Consistency without creating a fifth surface or a separate score.

Every newly approved or republished report uses one `journeyGraph` artifact under `cross-surface-journey-graph/1.0.0`. Frozen v5.2 reports created before 2026-09-02 may remain unchanged for deterministic historical rendering. New authoring may publish the artifact as reviewed `not_assessed` when evidence is unavailable; it may not omit the artifact or convert missing evidence to red.

The existing nine-section machine contract contains two related but deliberately separate client-facing views:

1. **Hero Client Journey Map** inside `gap-map`: the immutable owner-approved raster asset defined below. It is a fixed explanatory visual and is not dynamically rendered from report data.
2. **Broken Connections Map** also inside the visual `gap-map` chapter, after the Four-Surface snapshot and before the Focus Gaps presentation. It remains rendered from the reviewed `journeyGraph` artifact and uses one fixed canonical surface order for report-to-report comparability. Detailed source/destination/evidence drill-down remains in section 7 `evidence-and-competitors`. Aggregate arrows link the four surfaces and Lead Intake; every shown assessed edge resolves to source, destination, observed behavior, why it matters, evidence/date and repair implication.

Both views use one state system: green `clean`, amber `friction`, red `broken`, gray `not_assessed`. An absent optional cross-link is not drawn as a defect. Red requires either an observed technical/context/next-action failure or a human-approved route expectation whose absence was confirmed.

The canonical Hero title is exactly **`Where Clients Are Gained - and Lost`**. Its sole approved visual is `site-caesthetic/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png` with SHA-256 `64d54a5a5fbb1aaddbfdc9f7641103a0beab53c09e8b79ff38892e8a3348ca05`, `1,056,049` bytes and intrinsic dimensions `6912×3456`. The renderer must emit one ordinary `<img>` for this exact PNG and may only scale it proportionally. No HTML/SVG/canvas/CSS reconstruction, tracing, crop, recolor, translation, responsive redraw, generated substitute, `srcset` derivative or client-specific overlay is permitted. Replacement requires explicit owner approval and a canon plus hash-guard update. The image is explanatory; it does not override or invent report evidence.

Specific edge rules are fail-closed:

- Social → Lead Intake is `broken` only when approved evidence supports the actual technical/context/next-action failure, including an observed `no clear next step`;
- Reviews → Lead Intake is `not_assessed` when the route was not verified;
- no edge is drawn for an optional/irrelevant relationship that was not assessed;
- Broken Connections Map and section 7 evidence drill-down must expose the same edge IDs, states and evidence lineage from the one `journeyGraph` artifact; the immutable Hero image contains no runtime edge binding.

The artifact retains asset nodes, edges, `technical_integrity`, `context_integrity` across identity/location/treatment/offer/proof, evidence sources and dates, entry-to-Lead-Intake reachability, max 2–3 hop paths, dead ends, loops, orphans and break classifications. Exact schema and validation rules are owned by `docs/caesthetic/growth_score_spec.md` and `site-caesthetic/assets/js/growth-score-engine.mjs`.

Graph-to-metric links are `evidence_only` and may reference only existing `gbp_conversion_readiness`, `entity_integrity`, `booking_friction`, `technical_booking_integrity`, `profile_to_booking`, `conversion_continuity`, `identity_coherence`, `positioning_coherence` and `proof_continuity`. No graph output changes a score, coverage, weight, Primary Constraint or Top 3 automatically. Any later scoring change requires separate explicit SSOT approval.

Before publication, a named human must approve entity/location resolution, expectation rules, semantic integrity and edge severity. Reviewer identity remains in the internal artifact and is not rendered to the client.

### 3.2 Five derived, unscored decision views

The report may reorganize the same approved Growth Score metric evidence into exactly five views under `growth-score-decision-views/1.0.0`: **Treatment Opportunity Matrix**, **Provider Visibility Map**, **Trust Chain**, categorical **Patient Friction Index**, and **Do Not Promote Yet by Treatment**. They are decision intelligence, not additional evidence collection. They add no source, surface, metric, weight or score and cannot automatically change Overall, the binding constraint, Focus Selection, Top 3 or Sprint scope.

Treatment and provider matrices always use the exact Four Surfaces as columns. Trust Chain uses the reviewed identity, treatment, provider, proof and next-action links. Patient Friction Index uses categorical `clear / friction / broken / not_assessed` states across discovery, trust, enquiry and booking; it must not display a numeric score. A treatment-specific promotion hold is a named-human decision supported by existing evidence, blockers and revisit conditions. No approved hold is not equivalent to permission to promote.

The first four views render by progressive disclosure inside `gap-map`, after the Four-Surface/Journey Graph context and before Focus Gaps. `Do Not Promote Yet by Treatment` renders inside `do-not-fund`, after the one canonical global Do Not Fund Yet decision. Unsupported cells remain gray / `Needs verification`; the renderer must not manufacture red states or conclusions from missing evidence. All human inferences retain internal method, assumptions and named review, without exposing reviewer identity in client HTML.

### 3.3 Lead Intake boundary and Lead-to-Revenue Map

`Lead Intake` is a **boundary node**, not a fifth surface. In the Free Growth Score it is gray / `NOT ASSESSED` unless valid evidence exists for a specific observable public enquiry-path fact.

The mid-report **Lead-to-Revenue Map** is the canonical internal-conversion visual branch. It uses the stages:

`LEAD RECEIVED → RESPONSE → QUALIFICATION → BOOKING → CONFIRMATION → SHOW → CONSULTATION → PAYMENT`.

Optional post-payment `FOLLOW-UP / RETURN` may appear as a secondary tail when the report context requires it; it is not part of the required eight-stage spine.

State system:

- green `WORKING` — evidence supports a functioning stage;
- amber `FRICTION` — evidence supports material process friction;
- red `CONFIRMED LEAK` — evidence supports an actual drop-off/break at that stage;
- gray `NOT ASSESSED` — valid evidence is unavailable.

A red upstream stage does **not** automatically make downstream stages red. Downstream stages remain gray when they were not reached or assessed. The map must not infer a weak receptionist, broken CRM, poor training or other internal cause from a no-response or drop-off fact alone.

In the Free Growth Score, this map normally renders gray and explains that internal workflow/data access is required. After an approved internal conversion check or Sprint access, stages may be evidence-coloured. The active specific pricing, placement and copy authority is `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`. The first Check500 section appears immediately after this post-enquiry explanation or map. It states what the `$500` Check can examine and the direct-continuation credit toward the next qualifying `$2,500` Sprint; it is not a results promise, refund balance or automatic upsell.

The Check500 path is fail-closed for copy, evidence and placement. New authoring must not mark it `recommended` merely because the outside-in report cannot assess the internal path. Any case-specific recommendation or diagnostic statement requires approved evidence references and named-human approval. An absent or `not_recommended` report recommendation suppresses the recommendation claim, but it removes neither of the two standard placements. The Check never blocks or replaces a separate evidence-backed Sprint CTA because uncertainty reduction and implementation answer different decisions.

The locale-neutral `check500-two-placement/1.0.0` contract has two roles: middle context after the post-enquiry boundary, and a smaller optional first engagement immediately after the primary Sprint offer at the end. Every language version renders both sections, translates their meanings naturally and may not label the person as doubtful, afraid, confused, unqualified or unwilling to pay.

Both placements inherit `check500-style/1.0.0`: warm ivory paper texture, centered editorial hierarchy, deep-navy serif H2, deep-navy sans-serif supporting copy, thin navy rules, restrained burgundy accents and one wide burgundy CTA. The final placement uses the same family but remains one hierarchy step below the preceding primary Sprint offer. The hash-locked reference and responsive/no-decoration rules live in `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md` §7.1.

Page behavior may measure engagement with each placement, but it may not hide, delay, reorder or suppress either one. The UI must not automatically redirect, open checkout, change the approved diagnosis or interrupt a person who selects the Sprint. Behavior events must remain non-PII.

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

The owner-facing question is: **Why might a patient/client choose them instead of you?** The comparison is not introduced as a ranking or score.

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
- where the subject practice is stronger;
- what is worth repeating or adapting;
- what should be improved beyond the competitor rather than copied literally;
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
- **Fix / Fix now** — evidence supports a verified gap;
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

For **Multi-Location**, the Russian internal pilot is one indivisible review package: the network parent and selected focus-location report are both rendered in Russian, carry the same frozen fact set, ordered Top 3, binding constraint and Do Not Fund Yet, and are approved together by the named manager. Only then may both pages enter translation. Translation QA must validate the parent-child pair together and fail closed if package identity, evidence, scores, focus location or any frozen decision changes.

Vertical context and locale remain independent. Locale never changes metric IDs, scoring, evidence class, constraint or Focus Selection.

## 8. Mobile-first presentation and final visual canon

The report is designed for an owner reading first on mobile, while remaining fully usable on desktop.

Presentation rules:

- Primary Constraint dominates the hero / first decision screen;
- one objectively strong point is visible early so the report is not framed as a list of failures;
- Gap Map and Focus Gaps are scannable before evidence drill-down;
- long implementation and evidence content uses progressive disclosure / accordions where appropriate;
- evidence tables must remain readable and use contained horizontal overflow rather than causing body overflow;
- the body must not horizontally overflow at the production mobile acceptance width;
- the first Check500 section appears in the middle immediately after the Lead-to-Revenue Map; the second appears at the end immediately after the primary Sprint offer and remains visually secondary;
- do not duplicate Sprint CTAs across sections;
- do not create a third Check500 section or any Check500 section in a Multi-Location focus child;
- a sticky CTA may be used only late in the report when it does not interrupt reading; disable it on mobile when it degrades the decision flow.
- in the owner-brief audit template, place one clearly labelled report-share action near the beginning and one after the final report content; on supported mobile devices both use the native sharing sheet, with a clean-URL copy fallback elsewhere;
- render the owner-brief “studied links” block as a visually quiet list of ordinary text links without cards, borders or colored backgrounds; show at most one representative URL per source hostname and never repeat separate pages of the same site;
- render the “Studied links” / **«Изученные ссылки»** label with the same metadata typography role or design token as the report address/date line: the same font style, size and weight, without a separate heading accent;
- in the Russian greeting/Intro block, render the signature line **«Валерия Петра · CAESTHETIC»** in italic without changing its text or presenting it as reviewer/selector attribution;

Approved visual grammar:

- warm background `#F0EDE6`;
- navy `#0B2438`;
- burgundy signal/accent `#7B244B`;
- both Check500 placements follow `check500-style/1.0.0` and its hash-locked reference rather than inventing a separate card treatment;
- green/amber/red/gray reserved for diagnostic state, with text/icon duplication so color is never the only signal;
- Source Serif 4 / IBM Plex family pairing;
- content width approximately `1120px`;
- compact outlined status pills;
- editorial decision cards with restrained radius;
- strict rectangular evidence tables;
- Primary Constraint visually outweighs supporting context;
- the exact owner-approved PNG for the `Where Clients Are Gained - and Lost` Hero, with no substitute or redraw;
- deterministic HTML/SVG only for the separate evidence-driven diagnostic maps such as Broken Connections; no AI-generated raster may replace either contract.

Visual refinement must never alter the machine contract, Four Surfaces, evidence, Focus Selection or commercial truthfulness.

### 8.0.1 Design-feedback continuity

Explicit user/owner feedback about Growth Score presentation is an active design input for subsequent report work. The latest explicit instruction for the same element supersedes earlier design feedback; a newer or higher-authority SSOT rule wins if there is a conflict.

Reusable accepted feedback must be recorded in this standard or the active implementation profile before it is applied across reports; chat or model memory alone is not authority. Design feedback may refine hierarchy, typography, spacing, interaction and presentation copy, but it may not change evidence, scores, the Four Surfaces, the machine contract, privacy controls or commercial truthfulness.

### 8.1 Canonical owner-facing visual sequence

The final client-facing visual sequence is canonical even though it is composed inside the nine-section machine contract:

1. **Owner-first Hero + Client Journey Map.** Display only the exact owner-approved `Where Clients Are Gained - and Lost` PNG defined in §3.1, without a client-specific logo, overlay, caption, translation, redraw or mobile substitute. The preferred owner tension may remain in the surrounding report copy, e.g. `You have already invested in your practice. The question is: is that investment working as hard as it should?`. A stronger occupancy statement such as `why is it not filled with clients?` is allowed only when supported by owner-supplied context or evidence; it must not be fabricated from outside-in observation.
2. **Four-Surface snapshot.** Four cards summarize Search / Maps, Website, Social and Reviews with `Protect / Watch / Fix now / Needs verification` and one owner-language sentence each.
3. **Broken Connections Map + derived decision views.** Show technical and semantic route integrity between the four surfaces and Lead Intake from the canonical Journey Graph; do not require a complete 4×4 mesh. Then present the four unscored treatment/provider/trust/friction views from the existing evidence only.
4. **Top 3 leaks.** Exactly one Primary + two Supporting. Primary is open by default; Supporting are collapsed by default. Closed state already states the problem and owner consequence. Expanded state includes `What we found`, `Why it matters`, `What it affects`, `Evidence`, and the repair path/DIY detail at the next disclosure level.
5. **Competitive decision.** Lead with why a patient/client may choose another practice, then expose the deeper comparison matrix. End with `Defend / Close / Differentiate / Do not copy`.
6. **Thirty-day fit + Lead-to-Revenue boundary.** Explain what can realistically change in 30 days, then show the internal-conversion map and the first contextual Check500 section. The map shows what is and is not assessed after enquiry; it is a boundary/diagnostic branch, not a fifth surface or proof of a leak.
7. **Final system synthesis.** State whether the findings represent isolated issues or one connected patient-decision system, then explain the relevant 4444 outcome: a shared demand-language map, query allocation, content/review-response system and consistency verification. Cross-surface consistency may help people and search systems understand the business but must never be presented as a ranking guarantee.
8. **Implementation decision.** Preserve the legitimate choices `in-house / separate specialists or another provider / CAESTHETIC / defer`. The primary CAESTHETIC option is the 30-Day Growth Sprint at the canonical `$2,500` price, framed as implementation of the approved 4444 priority rather than an isolated technical task. Immediately after it, show the second Check500 section as a smaller optional first engagement. Any retail-equivalent comparison must pass §9.1.
9. **What happens next + founder note.** Show a branching continuation rather than a forced ladder, then close with a short real-founder note. Valerie Petra may be shown only in a truthful approved role; no fabricated biography or handwritten signature.

### 8.2 Mapping to the immutable nine-section machine contract

The visual sequence above does not reorder or add machine sections:

- `gap-map` contains owner-first hero, Hero Client Journey Map, Four-Surface snapshot, Broken Connections Map, Treatment Opportunity Matrix, Provider Visibility Map, Trust Chain and categorical Patient Friction Index;
- `focus-gaps` contains the Top 3 Focus Gaps;
- `sprint-fit` explains whether the verified Primary/Supporting work is suitable for a 30-day finite implementation without claiming purchase or results, then contains the Lead-to-Revenue Map and the first contextual `check500-two-placement/1.0.0` section;
- `repair-paths` contains complete DIY/implementation paths and coordination burden;
- `do-not-fund` contains the canonical one `Do Not Fund Yet` decision and the separate unscored human-approved `Do Not Promote Yet by Treatment` view;
- `gap-inventory` contains the exhaustive inventory; an earlier compact summary/link may point to it but does not replace it;
- `evidence-and-competitors` contains evidence drill-down, Journey Graph edge details and Competitive Decision Analysis;
- `scores-and-methodology` keeps scores/methodology secondary;
- `next-step` begins with the final system synthesis, may restate the Do Not Fund decision compactly, then presents implementation choices and the primary evidence-backed Sprint action. The second `check500-two-placement/1.0.0` section follows immediately as the smaller optional first engagement. A Multi-Location focus child has navigation back to its parent and no commercial section or CTA.

This mapping is the authoritative way to preserve both the owner-story order and the schema-v5 machine contract.

### 8.3 Review-mode anchors 1101–1109

Internal Russian review mode may display small low-emphasis review anchors at the lower edge of major visual blocks:

- `1101` — Hero / Client Journey Map;
- `1102` — Four-Surface snapshot / Broken Connections Map;
- `1103` — Top 3 Focus Gaps;
- `1104` — Competitive Decision Analysis;
- `1105` — Final system synthesis / Do Not Fund reminder;
- `1106` — Implementation decision / Sprint choice;
- `1107` — Lead-to-Revenue Map;
- `1108` — What happens next;
- `1109` — Founder note.

These are internal review anchors only. They are not cockpit numbers, are not stored as business evidence and must disappear after `APPROVE` from final client presentation/source.

### 8.4 Mobile behavior

At approximately `360–430px`:

- the hero does not shrink the desktop graph mechanically; it uses the same data with a mobile composition;
- only one representative journey is emphasized at a time, defaulting to the Primary Constraint path; switching journeys is progressive enhancement and the Primary path remains visible without JS;
- Four-Surface cards stack one per row;
- Broken Connections Map uses a mobile graph layout while preserving edge identity/state;
- Primary Focus Gap is open; Supporting are closed;
- competitor tabs may horizontal-scroll inside their own container;
- tables scroll inside contained wrappers rather than the body;
- Lead-to-Revenue Map becomes a vertical pipeline;
- touch targets are at least `44px`;
- no early sticky commercial CTA obscures diagnosis.
- the beginning and ending share controls remain full-width, readable and at least `44px` high; sharing never reveals credentials or report data beyond the current clean page URL and localized title.

### 8.5 Founder note

The report may close with a short, mostly editorial/italic founder note after the decision path. The purpose is reassurance and owner agency, not another sales pitch. The note may express the approved principle:

`We are not asking you to spend more. We are helping you decide what deserves funding next.`

Use a real approved founder identity/signature presentation only. Do not fabricate handwriting, identity or biography. Valerie Petra may appear separately only in her truthful approved role.


### 8.6 Multi-Location visual profile

Multi-Location is an additive profile of this same schema-v5 report, not a second visual system. The package contains:

1. one protected **network_parent** report as the delivery entry point;
2. one protected **focus_location** report using the complete current single-location profile;
3. one shared project ID, access group, frozen fact set, binding constraint, ordered Top 3 and Do Not Fund Yet.

The current network presentation profile is `multi-location-growth-score/1.2.0`. It is additive to schema v5 and template `growth-score-report-template/5.2.0`; those canonical versions do not change. Frozen packages without a profile marker and profile `multi-location-growth-score/1.1.0` remain deterministic read-only reports and are not silently migrated. Every newly authored network package uses 1.2.

The parent uses the same unnumbered Intro and nine machine sections. Its owner-facing sequence is:

**Executive Network Decision Summary → declared/reviewed coverage and focus-location link → Primary Constraint → derived Network Risk Profile → focus-location selection criteria → internal location comparison → network overview → network decision intelligence → exact Top 3 → 30-day operational plan → ownership/rollout → treatment promotion holds → propagation candidates → external competitor signal → evidence boundary → CMO decisions → one package CTA.**

The network parent must render:

- network name, public geography, research date and “N of M declared locations reviewed”;
- the named-human-selected focus location and its public-evidence rationale;
- one navigation link to the full focus-location report;
- a branch registry with explicit **reviewed / not_found / ambiguous / closed_or_moved_publicly_observed / excluded_by_approved_scope** state;
- shared versus location-specific public assets;
- one reviewed Journey Graph reference per reviewed location, including a reviewed **not_assessed** graph where evidence is unavailable;
- repeated patterns stated as “Observed in N of M reviewed locations”;
- a location × Four Surfaces comparison using **Protect / Watch / Fix now / Needs verification**;
- one approved decision-view projection per reviewed location, including an explicit approved `not_assessed` projection where evidence is unavailable;
- Treatment × Location, Provider × Location, representative Trust Chain and categorical location-friction views derived only from those projections;
- treatment-specific promotion holds grouped by affected location, each retaining its blocker, revisit condition and named-human approval;
- one best observed public-surface practice worth propagating, without calling that branch the best business performer;
- the same exact Primary plus two Supporting gaps as the focus child.

The first executive block answers exactly six questions: **Protect / Fix first / Shared issue / Pilot / Scale rule / Decision required**. It is a synthesis of approved fields, not a score or an AI-only recommendation.

Inside the immutable nine-section contract, the parent presentation is decision-first:

- section 1 renders a Network Risk Profile derived from the comparison matrix, the four focus-location selection criteria, then the internal location comparison and Network Overview; section 7 must not repeat that matrix;
- section 1 then renders the profile-1.2 network Decision Intelligence projection: Treatment Opportunity Matrix, Provider Visibility Map, no more than five initially visible representative Trust Chains and categorical Patient Friction by location; it persists no derived aggregate score;
- the Network Overview summarizes shared assets, local assets, reviewed journeys, branch state and repeated patterns; raw machine states remain in the package, while the page uses plain client-facing labels;
- section 2 renders the approved Top 3 exactly once as compact decision cards; each card states network scope, accountable owner, public baseline and Day-30 public check, while evidence, dependencies and implementation detail sit in a native disclosure control;
- section 3 translates the Top 3 into **Days 1–10 / Days 11–20 / Days 21–30 / Day 30 decision** without creating purchased scope;
- section 4 separates `hq`, `local` and `shared` ownership and shows the focus acceptance evidence plus replication gate;
- section 6 keeps branch-only/backlog gaps below the Top 3 and may show approved propagation candidates without calling their source location the best business;
- section 7 shows a compact competitor decision summary before keeping full Competitive Decision Analysis and metric/technical evidence in separate disclosure groups;
- section 8 states what public evidence can prove, what remains unassessed and that any authorized internal data belongs only to a later separate impact analysis and does not change the audit/score;
- section 9 shows explicit CMO decisions for pilot, accountability and scale gate before the single package CTA;
- the first four locations remain visible and any additional locations use progressive disclosure without being removed from the HTML or evidence package;
- the focus child uses a compact `Network analysis → Focus location` breadcrumb and no second commercial CTA.

The parent does not force every asset and every branch into one Journey Graph. It uses a network topology/asset registry, per-location graph references and a reviewed repeated-pattern index. The parent may emphasize the focus-location path and a small number of repeated paths, but must not render an unreadable all-branch graph or infer a network-wide pattern from partial coverage.

Each selected gap carries:

- scope: **shared_asset / repeated_pattern / focus_location**;
- affected reviewed location IDs and observed count;
- focus-location impact;
- pilot location;
- evidence-based replication conditions;
- separate done-when evidence for the focus-location repair and any later network rollout.
- execution owner: `hq / local / shared`;
- accountable role, public baseline and Day-30 public verification.

Focus-location selection uses exactly four human-approved criteria: **public journey risk, evidence confidence, 30-day feasibility and network learning value**. Every criterion retains evidence references. The page must explicitly say that the selection is not a business-performance ranking.

The Network Risk Profile is derived only from the approved matrix and counts `Protect / Watch / Fix now / Needs verification` states overall and by surface. Counts are never stored as a second source of truth and never become an aggregate Network Score.

Profile 1.2 stores `network.decision_intelligence` under `multi-location-decision-intelligence/1.0.0`. Its `source_policy` is exactly `existing_growth_score_evidence_only`; all score, binding-constraint, Focus Selection and promotion automation flags are `false`. Every reviewed location has exactly one embedded, engine-validated `decisionViews` artifact. Treatment and provider IDs must resolve consistently across locations, unreviewed locations cannot participate, and `not_assessed` never becomes a negative state. The network view-model may group and count categorical states for presentation, but it cannot write them back, introduce numeric treatment/provider/friction scores or change approved decisions.

A selected network gap must affect the focus location directly or through a shared asset used by it. Other branch-only problems remain in the Full Network Gap Inventory and do not silently enter Sprint scope.

Internal location comparison and external competitor comparison are separate. Locations are not competitors and are not ranked as businesses. Where geography changes the customer decision, each branch requires its own local external competitor set; the focus location receives the full 3–5 competitor decision drill-down.

There is no aggregate Network Score, average branch score, network-wide revenue conclusion or “best/worst branch” claim. Per-location scores may appear only where the normal schema-v5 coverage gate passes. Coverage is disclosed by location and surface; missing evidence remains **Needs verification / not assessed**.

The Lead-to-Revenue Map remains gray/not assessed for the network and each branch under the public-only Free Growth Score unless separately permitted internal evidence exists. A public observation cannot be converted into a receptionist, CRM, staffing, training, conversion or revenue diagnosis.

The package has exactly two network-level Check500 placements on the parent and may also have at most one evidence-backed implementation CTA there. The focus child replaces all commercial sections and CTAs with navigation back to the parent's implementation decision. The child may not create a second scope, second Top 3 or second commercial funnel.

Before publication, the internal `publication_approval` card must be `approved`, match the report's named-human reviewer, focus location and ordered Top 3, and confirm `public_sources_only=true`. The reviewer identity and timestamp remain outside client-facing HTML under §4.

At approximately **360–430px**, the parent defaults to the focus location, renders locations as stacked cards rather than a compressed wide matrix, shows one representative path at a time, contains table overflow and preserves all evidence/state IDs. Desktop may show the comparison matrix, but the body must never overflow horizontally. Interactive links and disclosure summaries use at least 44px targets, and the presentation remains useful when JavaScript is unavailable.

The progressive-enhancement layer may restyle or collapse approved content, but it may not replace network section titles with single-location copy, remove the CMO decision block, rebuild the network Repair Paths without ownership/rollout evidence, or add a Sprint CTA to the focus-location child. Demand Journey remains machine/evidence data and is not rendered as a client-visible section.

Internal review anchors remain **1101–1109** per page and are disambiguated by package role and location ID in review records. They still disappear from final client source.

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

### 9.4 Branching continuation

The client-facing continuation is a decision tree, not an automatic sales ladder:

- if the outside-in external constraint is verified and finite and the owner is ready → optional 30-Day Growth Sprint;
- at both standard report placements, the owner may choose the optional Lead-to-Revenue Check at `$500` to understand the post-enquiry path or begin with a smaller engagement;
- after Day 30, if the constraint is resolved → the client may take the system and stop;
- if a new/remaining finite verified constraint exists → optional Sprint 2 / Extension at `$2,500`;
- if recurring ownership is justified → optional Growth System under client-specific terms.

No later stage is mandatory.

## 10. Privacy and route rules

Every Growth Score route remains `noindex` and outside the sitemap.

Publication from `zaomir/caesthetic` uses only the pinned, allowlisted contract in `CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`. A single-location report is one approved artifact; Multi-Location is one atomic approved parent/focus-child package. Satellite authoring never changes production source authority or bypasses the production acceptance gates below.

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
4. at most one late evidence-backed implementation CTA for the `$2,500` Sprint implementing the approved 4444 priority, plus exactly two always-visible `check500-two-placement/1.0.0` sections on a single-location report or Multi-Location parent; the first follows the post-enquiry map and the second follows the primary Sprint offer; a focus child has neither;
5. source-level absence of client-visible reviewer/selector attribution and embedded walkthrough card/URL;
6. Four Surfaces unchanged; Cross-Surface remains separate; Lead Intake/internal conversion is not rendered as a fifth surface;
7. for new authoring: one reviewed `journeyGraph` artifact, both deterministic public views, identical edge state/evidence lineage, no automatic score mutation and no optional-link false positive;
8. one reviewed `decisionViews` artifact: all five views use only existing approved report evidence, retain the exact Four Surfaces, keep all automation flags false, render inference/hold review fail-closed and do not change Overall or Focus Selection;
9. Hero uses client-logo provenance/fallback rules, adaptive four-slot assignment and no invented success journey;
10. Hero uses the exact canonical title and composition, colors each segment from its own edge, and shows no false green Social/Reviews → Lead Intake relationship;
11. Broken Connections Map appears from the same graph artifact before Focus Gaps in the owner visual flow, shares the exact edge IDs/states, omits optional unassessed relationships and retains detailed evidence drill-down later;
12. Lead-to-Revenue Map keeps unassessed downstream states gray and contains no unsupported internal-cause diagnosis; both Check placements match their copy/placement contracts, remain visible without behavior gating, do not claim a leak and do not replace a separate evidence-backed Sprint CTA;
13. internal review anchors `1101–1109` are absent from final approved client source;
14. mobile and desktop smoke with no body overflow and usable graph/evidence drill-down;
15. privacy/noindex/sitemap gates;
16. live production URL;
17. deployed SHA;
18. successful exact production smoke.

For protected reports, acceptance also includes unauthenticated gate, wrong-password rejection, valid session issuance and authenticated report/JSON checks.

## 12. Anti-patterns

Do not:

- add a fifth surface;
- create a separate Journey Graph score, require every surface-to-surface link or label an optional missing link red;
- turn a decision view into a fifth surface, new source registry, numeric Patient Friction score or automatic promotion/priority decision;
- represent `Lead Intake` or Lead-to-Revenue as a fifth public surface;
- add a tenth machine section;
- turn competitor analysis into a ranking or score;
- expose reviewer/selector identity to prove human approval;
- embed the Valerie/walkthrough card back into the report;
- diagnose internal conversion causes without access/evidence;
- force Maps or Reputation into Top 3 without evidence;
- display a client occupancy/revenue problem as fact merely because an illustrative owner question is persuasive;
- hide DIY instructions to manufacture sales dependence;
- invent retail implementation prices, savings, ROI, patients or revenue;
- sell a business-name change, duplicate cleanup, schema, redirect or another isolated technical repair as the primary CAESTHETIC product instead of the evidence-backed 4444 outcome;
- script positive review sentiment, gate or incentivize reviewers, buy reviews, or force keywords into patient-authored reviews or owner responses;
- use fake scarcity, fake countdowns or implied price increases;
- omit either Check500 placement, add a third placement, hide or reorder one from behavior, label the person as doubtful or afraid, automatically route them to the Check, paraphrase `check500-section/en-US/1.0.0`, turn its `$500` price/credit rule into a guaranteed-outcome claim, or treat Check interest as evidence of an internal leak;
- publish a universal recurring fee that is not in current pricing/SSOT authority;
- translate or localize in a way that changes evidence or the approved diagnosis.

The report should make the owner feel **clearer and more capable of making the next decision**, while keeping CAESTHETIC's commercial value grounded in evidence, coordination and accountable implementation rather than information asymmetry.
