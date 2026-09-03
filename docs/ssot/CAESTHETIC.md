---
owner: CAESTHETIC
status: active
version: 3.24
updated: 2026-09-03
scope: CAESTHETIC master strategy and product-funnel canon
parent: docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md
marketing_parent: docs/ssot/MARKETING_SYSTEM_STANDARD.md
related:
  - docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
  - docs/ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md
  - docs/founder-notes/DEC-862_raim-smile-caesthetic-partnership-economics-and-vip-access.md
  - docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md
  - docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md
supersedes: docs/caesthetic/CAESTHETIC_SSOT.md
---

# CAESTHETIC — Master SSOT

**Market:** United States  
**Legal entity:** OXFORD PROJECTS LTD  
**Runtime project:** `caesthetic`  
**Production root:** `site-caesthetic/`

This is the single master strategy authority for CAESTHETIC. Detailed working specs may elaborate it but may not contradict it. The Dropbox mirror at `docs/caesthetic/`, including its legacy `CAESTHETIC_SSOT.md`, is provenance and working material rather than repository authority.

CAESTHETIC is the first **reference implementation** of the global Growth Control approach. Global rules live in `docs/ssot/MARKETING_SYSTEM_STANDARD.md`, `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md`, `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md` and `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`. This file specializes the aesthetic-practice funnel, offer ladder, roles and client-facing products. It does not silently fork those global principles.

## 1. Positioning
**The growth operating system for independent aesthetic practices.**

### Public identity

**Valerie Petra** is the public face of CAESTHETIC and leads the owner-facing Growth Score walkthroughs. Founder-confirmed on 2026-09-03, her canonical public LinkedIn profile is `https://www.linkedin.com/in/valeriia-petrova-uk/`. Public CAESTHETIC runtime may publish only this exact HTTPS profile URL for Valerie; any other, empty or unverified candidate remains fail-closed.

Practical owner question: **Where is my practice losing patients, what should I fix first, and what should I not spend money on yet?**

Vendor-independent: the practice can keep its EHR, medical director and suppliers. CAESTHETIC fixes the growth layer. Toxifillers/Bototox supply is isolated from the public US funnel.

Operationally, CAESTHETIC is an external **Growth + Patient Operations desk**, not an agency made broader by accepting unrelated work. Recurring ownership covers the acquisition, conversion, retention and patient-operations layer defined below. Recruitment and adjacent practice operations are eligible only as paid add-ons when they directly support that layer; their classification and operating boundaries are canonical in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## 2. One operating model: four surfaces
Patients evaluate one practice across four decision surfaces:
1. **Search / Google Business Profile**
2. **Website**
3. **Social**
4. **Reputation / Reviews**

**Canonical aliases:** `4444` and `Четверки` always mean this CAESTHETIC Four Surfaces model. They do not mean an arbitrary group of four and must not be expanded into a fifth surface.

**Cross-Surface Consistency** is a cross-surface metric, not a fifth surface. Every stage uses this same model.

When a local comparison set is applicable, every Growth Score also includes **Competitive Decision Analysis** across these same four surfaces. It names the selection method and public sources, preserves strengths and weaknesses/risks plus positive and negative review themes, and ends with `Defend / Close / Differentiate / Do not copy`. It is a decision layer, never a fifth scored surface. The global authority is `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`; the CAESTHETIC adapter is `docs/caesthetic/competitive_decision_analysis.md`.

### Paid Ads: Demand Layer, not a fifth surface

Paid Ads / paid acquisition is a **paid demand-generation mechanism** in the Demand Layer. It directs qualified demand into one or more of the four surfaces; it is not an additional patient-decision surface.

```text
Demand Layer (organic + outbound + paid)
→ 4444 (Search / GBP + Website + Social + Reputation / Reviews)
→ inquiry / booking
→ internal conversion and patient-operations layer
→ patient / revenue
```

Paid acquisition amplifies the current state of 4444. Strong, coherent surfaces can convert paid attention efficiently; weak or inconsistent surfaces can waste spend and accelerate leakage. Paid demand does not itself repair a verified constraint later in the journey.

**Intervention gate:**

- Do not increase paid demand when the verified binding constraint is downstream of 4444—for example inquiry handling, response or follow-up, attendance, capacity or another internal conversion/patient-operations dependency. Fund and verify the binding constraint first.
- Paid acquisition may be selected as the intervention when the relevant four-surface journey is sufficiently strong, delivery capacity and unit economics are verified, and the binding constraint is insufficient qualified demand.
- If the evidence does not distinguish a demand shortage from a downstream leak, keep the constraint `Insufficient evidence` and run the smallest validation needed before scaling spend.

Any paid intervention must name the audience, channel, destination surface, budget, measurement window, success/stop conditions and the capacity/economics evidence that justifies it. This specializes the global rule in `docs/ssot/MARKETING_SYSTEM_STANDARD.md`: paid acquisition without capacity and unit-economics checks is not a growth system.

### 2.1 Focus and staged disclosure: external surfaces first

The four surfaces are the complete **public patient-decision model**. CRM, telephony, chatbots, front desk, recruitment, training, call quality assurance and adjacent practice operations are not additional surfaces. They form an internal conversion, adoption and patient-operations layer. CAESTHETIC must not lead the Growth Score, public entry or pre-Sprint conversation with a broad catalogue of those capabilities: doing so dilutes the constraint-first category and makes the offer resemble a generic full-service agency.

**Growth Score is an outside-in diagnostic.** It evaluates observable evidence across Search, Website, Social and Reputation, plus Cross-Surface Consistency and applicable Competitive Decision Analysis. A truthful, permissioned non-clinical enquiry-path test may establish an observable fact such as whether a response occurred by a disclosed cutoff. It may not, without internal access and evidence, infer that the cause is a weak receptionist, broken CRM, inadequate training, staffing shortage or another internal defect. The internal layer is stated briefly as `Not assessed` or `Insufficient evidence — requires workflow/data access`; it is not scored and is not expanded into an entry-stage service menu.

**The 30-Day Growth Sprint is not a general business audit.** It implements the agreed priority constraint and observes only the minimum operational interface required to ship, adopt and measure that intervention—for example the accountable owner, access, inquiry capture, handoff or follow-up dependency. This observation may reveal evidence, but it does not silently expand Sprint scope or justify a broad in-Sprint capability pitch.

The **Day-30 evidence and report are the first standard point for a broader internal-operations discussion**. Only a verified next constraint that directly affects acquisition, conversion, attendance, retention, reputation/service recovery or adoption may be routed to the practice, another provider, optional Sprint 2, Growth System or an approved add-on. CRM, telephony, chatbots, recruitment, training and call QA are possible interventions against a verified constraint, not standalone public product categories.

Canonical client-facing sequence:

```text
Growth Score — see the constraint from the outside
→ verified external priority: 30-Day Sprint — fix it and verify adoption
OR
→ material internal uncertainty: Lead-to-Revenue Check — verify the permitted internal path
   → verified finite priority: optional 30-Day Sprint
→ after Day 30 — decide whether a deeper internal constraint deserves funding
```

This is a focus rule as well as an evidence rule: mention that the internal layer exists, but do not diagnose or sell it before the required access, workflow observation and real operating data exist.

### 2.2 Canonical client presentation script: 4444 / Four Surfaces

**Purpose:** use this master script and sketch language to explain the CAESTHETIC model in a live owner conversation, help the owner understand the problem before any product reveal, and make the later progression from **Growth Score** to the **30-Day Growth Sprint** understandable. It is a general sales/explainer narrative, not a substitute for the evidence-led, practice-specific Valerie Petra Growth Score walkthrough governed by `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`.

The delivery language may be adapted to the client, and examples may use verified practice context, but the model, sequence and claim boundaries below must remain intact.

#### Client-sketch visual grammar

The canonical `4444 / Four Surfaces` client sketch uses the following visual language:

1. Place **Search / GBP, Website, Social and Reputation / Reviews** as four distinct surfaces around the practice identity or logo.
2. Draw one **dashed line through all four surface blocks** so that it visibly intersects and stitches together Search / GBP, Website, Social and Reputation / Reviews. The dashed line means **one interconnected system**. It is not an outside perimeter, surrounding circle or external contour.
3. Draw a separate **thick solid outer frame around the complete four-surface system**. The outer frame means **one owner of the logic**: a single accountable strategic authority and source of truth across every surface. It does not require one person to execute every specialist task.
4. Draw **Growth Score** with a thin return arrow pointing back to one of the four surfaces. The returned-to surface is the human-verified priority constraint identified by the Score, not automatically the surface with the lowest displayed number. Mark that constraint with **burgundy hatching**; do not use the hatching as a general decoration across the system.

This sketch is a problem-first client explanation and sales sequence. First establish the four surfaces, show that the dashed line makes them one system, show that the outer frame gives the system one owner of logic, and use Growth Score to reveal the constraint. The client should first agree that the problem requires a concentrated, synchronizing intervention — the **synchronizing strike** in the live sketch. Do not lead the sketch with the product name, `$2,500` price or an ongoing relationship. Only after the need for the intervention is understood may the presenter circle/name that intervention and connect it to the commercial path: **30-Day Growth Sprint — $2,500**, followed later, if justified, by an optional ongoing relationship. The sale follows understanding of the problem; the product is not the premise of the drawing.

#### Spoken master script

Let me show you how we think about growth for an aesthetic practice.

A business has several growth layers. But when we focus specifically on how a new patient decides whether to choose a practice, nearly everything they can see from the outside can be organized into four decision surfaces. We call this model **4444**, or the **Four Surfaces**.

The first surface is **Search and Google Business Profile**. Can the patient find you for the treatment they need? What do they see in Google Search or Maps?

The second is your **Website**. Once they find you, can they understand who you are, what you offer, why they should trust you and how to book?

The third is **Social**. Does the practice look active and credible? Can the patient see clinicians, treatments, results, expertise and a point of view that supports the impression created elsewhere?

The fourth is **Reputation and Reviews**. Do other patients independently confirm the promise the practice makes about itself?

So the four surfaces are **Search, Website, Social and Reputation**. Together, they form the external system through which a patient evaluates the practice.

Paid Ads also matter, but they are **not a fifth surface**. Paid acquisition belongs to the **Demand Layer**. It can send more qualified people into the existing Four Surfaces, and the paid flow usually falls when the spending stops. What advertising cannot do by itself is repair what a person sees after the click.

If the website is weak, more advertising sends more people to the same weak website. If the reviews create doubt, advertising sends more people toward the same doubt. If Social says one thing, the Website says another and Google shows a third version of the practice, paid traffic does not resolve that contradiction. It amplifies the current system. That is why our rule is: **do not fund the leak**.

Patients do not move through these surfaces in an order we control. One may discover you on Instagram and then read reviews. Another may find you on Google Maps and then open the Website. A third may click an ad, visit a treatment page and check the rating immediately before booking. The route can be different every time, but patients commonly verify a first impression through other sources.

That is where **Cross-Surface Consistency** becomes critical.

Imagine that a patient finds you on Maps for a specific procedure, opens the Website and cannot find a clear page, current information or a booking path for it. They are unlikely to investigate the discrepancy; the next practice is one click away.

Or Social presents a modern premium practice, while the Website looks dated and uses a completely different language. That creates a break in trust. The same happens when the Website promises one experience but recurring review evidence points to another.

The four surfaces should not be literal copies of one another. Google, a Website, Social and Reviews have different jobs and formats. But they must describe the same business without contradictions: the same core service facts, positioning and strengths, with a clear and compatible next action. We call this **Cross-Surface Consistency**.

There is usually an ownership problem behind inconsistency. Google may be managed by one specialist, the Website by another, Social by a third, and reviews by the practice team. Each person may perform their individual task well while nobody owns the whole decision system. What is required is not necessarily one person who personally executes everything. It is **one owner of the logic**: one source of truth and one accountable view across all four surfaces.

That is why we do not begin with advertising or with a proposal to rebuild everything. We begin with the **Growth Score**. We examine all four surfaces, their consistency and the available evidence to answer a more useful question: **where is the main constraint now?**

The answer is not automatically the lowest visible score, and it is not a reason to fix everything at once. Search and Reputation may already be strong, Social may be sufficient, and the main loss may occur on the Website. In that case, spreading time and budget across every surface—or buying more demand before fixing the leak—would be the wrong first move.

After the Growth Score, the **30-Day Growth Sprint** implements the agreed priority constraint. If fixing it requires coordinated changes across more than one surface, we synchronize those changes so a treatment, claim, proof point or next action does not appear in one place and conflict with the others. The Sprint also establishes the shared logic and ownership needed to keep the surfaces aligned.

After the Sprint, the practice keeps agency. You can maintain the system with your own team, use separate specialists, or continue with CAESTHETIC. The foundational work completed in the Sprint is the diagnosis, prioritization, correction of the agreed constraint and creation of a coherent operating base. Ongoing work is a separate choice: maintain, measure, improve and identify the next constraint.

There is also an internal conversion and patient-operations layer: what happens to enquiries, calls, handoffs, follow-up, attendance and capacity after interest is created. We mention that this layer exists, but we do not diagnose a broken CRM, weak front desk or other internal cause from the outside. Growth Score records the internal layer as not assessed or insufficient evidence unless there is valid access and evidence. During the Sprint, we observe only the minimum operational interface required to implement and measure the agreed intervention. The Day-30 evidence is the first standard point at which we can responsibly say whether a verified internal constraint should be addressed next.

In short:

```text
Demand brings people into the system.
→ 4444 shapes the patient decision.
→ Growth Score finds the binding constraint.
→ 30-Day Growth Sprint fixes the agreed priority.
→ Then the practice decides what to maintain, improve or scale next.
```

So our first question is not, “How much more are you ready to spend on advertising?” It is: **“Where are we sending those people, and are we already losing them there?”**

## 3. Canonical funnel
Public funnel:

`Growth Score (free) → 30-Day Growth Sprint ($2,500) → optional Growth System`

The **Lead-to-Revenue Check ($500)** is a conditional paid diagnostic branch when the Growth Score cannot resolve material post-enquiry uncertainty from public evidence. It is not a mandatory stage or a fourth headline product. Its canonical public route is `/lead-to-revenue-check/`; it remains outside primary header navigation and appears in the footer plus contextually relevant decision boundaries. If it continues directly into the next CAESTHETIC Sprint for the verified constraint, its $500 fee is credited once toward the unchanged $2,500 Sprint total.

The currently approved public recurring product is Growth System. Do not publish Fixed Retainer, Hybrid or Performance Compensation as public SKUs unless separately approved.

Canonical continuation after Sprint:

```text
Growth Score
→ Sprint
→ optional ongoing relationship
```

No later stage is mandatory. After Sprint, an ongoing relationship may be:

```text
Fixed Retainer
OR
Growth Budget
OR
Hybrid
OR another specifically approved model
```

Growth Budget is **not** the obligatory continuation of a Sprint. The public Growth System currently uses the Growth Budget commercial architecture unless a signed client-specific schedule selects another approved model. Exact rates remain client-specific.

Operationally, after Sprint 1 there may be an **optional $2,500 second 30-day implementation Sprint**. It is not published as a standard product, is not promised upfront and is offered only after the Day-30 report when finite implementation work remains justified.

Full lifecycle:

`Diagnose → Sprint 1: fix main constraints + start longer work → optional Sprint 2: finish/extend finite implementation → optional ongoing relationship`

No later stage is mandatory.

## 4. Growth Score — diagnose
Growth Score diagnoses all four external decision surfaces before implementation. It does not score the internal conversion and patient-operations layer; section 2.1 controls what may be observed, stated and deferred.

### Public intake

The canonical inbound route is `/growth-score/`, presented as three stages:

1. **Contact:** `Your name` and `Work email`.
2. **Required practice basics:** `Practice name` and `City, State`.
3. **Thank you + optional enrichment:** the request is already complete; clearly say that the four required fields are enough to begin, then optionally ask for public website/GBP/Instagram/booking links, priority treatments, main concern, relevant competitors, preferred contact and permission for a truthful non-clinical enquiry-path test.

Stage 3 abandonment or `Skip` remains a successful submission. Optional answers never become a hidden eligibility gate. Do not ask for revenue, budget, patient-level data/PHI, credentials or account/vendor access in the free intake. If the practice is ambiguous, ask for one public identifier later by email rather than increasing mandatory friction. A proactive/outbound Score built from public evidence is a separate acquisition path and must not be represented as owner-submitted intake.

### Manager-assigned audit factory

The sole operating sequence for creating both Growth Score formats is `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md`. After a manager assigns an audit, the robot must interview the manager for all missing business, identity, location, competitor and delivery context; run only quick public reconnaissance; and return a Research Alignment Card explaining its understanding of the business, proposed scope, competitor set, method, unknowns and deliverables. Full research is blocked until a named manager approves or corrects that card.

After approval, AI-assisted research gathers public evidence and produces a non-publishable Internal AI Report with the complete Gap Inventory, candidate risk order, candidate Focus Selection and repair paths. A named manager verifies the evidence and manually selects exactly one Primary Gap plus exactly two Supporting Gaps. Those approved Top 3 highest-risk gaps appear first on the client page; every other verified, monitor or insufficient-evidence hole remains lower in the Full Gap Inventory. The robot may recommend and rank candidates, but it does not make the final publication decision or choose Sprint scope.

Reviewer identity is fail-closed. The normal form is a first and last name. The exact registered human-reviewer mononym **`Валерия`** is also canonical and must render exactly as written; it may not be expanded to a surname, translated to `Valerie`, or replaced by the Valerie Petra brand persona. Any other one-word reviewer value fails publication until explicitly added to canon and validator tests.

At least 80% of published findings are observable **Class A** facts. Class B estimates are explicit and disclose method and assumptions. Unknown, stale, unsupported or contradictory evidence remains unavailable; intake claims and Class B estimates do not fill metric coverage.

Reviewer corrections improve later Scores only through a controlled learning layer: append-only review events may be de-identified and deliberately promoted by a named method owner into versioned templates, extraction rules, rubrics, taxonomies, priority heuristics, remediation patterns or evals with changelog, test, effective date and rollback. Per-case edits never auto-generalize. No uncontrolled chat/model memory, silent fine-tuning or cross-client reuse of raw contact/client data or PHI.

### Scores are secondary; the remediation plan is primary

Current outer display weights are **Search 30% · Website 25% · Social 15% · Reputation 30%**. Cross-Surface Consistency is separate to avoid double counting. These weights are heuristic and approximate: they support consistent visual navigation and may create useful tension, but are not absolute truth, causal attribution or the authority for priorities/Sprint scope. Verified problems, dependencies, implementation risk and human judgment take precedence when they disagree with a score.

Detailed metric catalogue and collection/scoring rules: `docs/caesthetic/growth_score_spec.md`. Metric families are:
- **Search:** geo-grid visibility; GBP category/treatment completeness; entity integrity; conversion readiness; freshness; branded-search control.
- **Website:** booking friction; priority-treatment clarity; mobile performance; above-fold conversion; clinician/trust proof; mystery-shopper response; technical booking integrity.
- **Social:** priority-treatment presence; clinician expertise; proof quality; recency; profile-to-book path; local offer clarity.
- **Reputation:** 90-day review velocity; rating; review depth; recency; response coverage/speed; negative-review handling; treatment/clinician proof in reviews.

The **Cross-Surface Journey Graph** is the canonical evidence artifact for observable public asset/action routes to the `Lead Intake` boundary. It records nodes, edges, technical integrity, identity/location/treatment/offer/proof context integrity, evidence lineage, reachability, dead ends, loops and orphans. It renders the evidence-driven Broken Connections Map and supplies the Journey Graph evidence drill-down inside the existing nine-section report. The Hero visual is deliberately isolated from this dynamic artifact under the locked asset rule below. The graph remains Cross-Surface evidence only: not a fifth surface, not a separate score and never an automatic score, binding-constraint or Focus-Selection input. A named human approves entity resolution, route expectations, semantic findings and edge severity before publication. Contract: `docs/caesthetic/growth_score_spec.md` §3.3 and `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md` §3.1.

The same approved Four-Surface evidence may also be reorganized into five **derived, unscored decision views**: `Treatment Opportunity Matrix`, `Provider Visibility Map`, `Trust Chain`, a categorical `Patient Friction Index`, and `Do Not Promote Yet by Treatment`. These views introduce no new source, surface, weight or numeric score; they cannot change Overall, select the binding constraint/Top 3, or create an automatic promotion decision. Unsupported cells remain `not_assessed`; every inference and every treatment-specific promotion hold requires named-human review. The first four views stay inside `gap-map`, while the fifth stays inside `do-not-fund`, preserving the exact nine-section cockpit. Contract: `docs/caesthetic/growth_score_spec.md` §3.4 and `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md` §3.2.

The canonical Hero title is **`Where Clients Are Gained - and Lost`**. The sole approved visual for that section is the owner-uploaded raster at `site-caesthetic/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-6b0945610ff55196.png`, SHA-256 `6b0945610ff551967ea13f020c350231bcc354604e91b53e2ae1494291678e47`, dimensions `6912×3456`. Runtime must serve and display those exact PNG bytes. It must not generate, redraw, trace, translate, recolor, crop, reconstruct or substitute the visual in HTML, SVG, canvas, CSS or another image format. CSS may scale the intact image proportionally for the viewport; no alternate mobile composition or transformed derivative is allowed. Any replacement or exception requires explicit owner approval plus an updated hash guard and canon change. The Journey Graph machine/evidence contract, Four Surfaces and the separate evidence-driven Broken Connections Map remain unchanged.

When the unresolved decision sits after enquiry, the separate canonical branch is **Lead-to-Revenue Check · $500** under `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`. The $500 is credited once toward the next direct-continuation CAESTHETIC Sprint addressing the verified constraint; the Sprint total remains $2,500. This does not authorize any guaranteed enquiry, booking, patient, revenue, ROI or internal-cause claim. A report may render this offer only from an explicit approved recommendation with a reason and evidence references; the offer then replaces the Sprint CTA rather than being added beside it.

If less than 70% of a surface's metric weight is observable, publish `Insufficient evidence`, not a fabricated score. Overall and surface `/100` values are a compact navigator/tension layer, not the decision layer.

The private owner cockpit's primary product is the human-approved, evidence-backed decision package:

- objective strength and strongest surface;
- binding constraint and named-competitor evidence where applicable;
- Competitive Decision Analysis across Search, Website, Social and Reputation — Comparison Matrix, Competitor Cards, `Defend / Close / Differentiate / Do not copy` and a Market Practice Gap decision (`Keep / Evaluate / Pilot / Replace / Do not adopt`) where relevant; this is a cross-cutting decision layer, not a fifth surface;
- full Gap Inventory of confirmed, deferred and unproven holes, not a Sprint backlog;
- one Primary Gap, exactly two Supporting Gaps, and one `do not do`;
- a 30-day Repair Plan for each Focus Gap with DIY steps, dependencies, owner role, Day-30 result and `done_when`;
- clear `Insufficient evidence` and verification actions where a hole cannot yet be confirmed; and
- methodology, source dates, limitations and explicit Class B assumptions.

For an applicable market, competitor coverage is fail-closed. The report must disclose a useful 3–5 competitor set by default, selection reason/type, branch scope where relevant, comparable query/path/review windows, sample sizes, repeated positive and negative themes, why a patient may choose each competitor, observable advantage/gap, what to repeat/improve/not copy, and the effect on the binding constraint and the selected Focus Gaps. It must also test whether relevant local/global practice has materially shifted in technology, product/material, protocol, price/offer architecture or delivery model. A surface without comparable evidence remains visible as `insufficient_evidence`. One review is an episode; it cannot establish a weakness. Medical/drug/device/protocol modernization remains a market signal until qualified clinical and regulatory review approves any clinical conclusion or change.

### Two Growth Score delivery formats

- **Growth Score:** one protected schema-v5 cockpit for one resolved location.
- **Multi-Location Growth Score:** one protected parent network-analysis page plus one linked full schema-v5 Growth Score for the manager-selected focus location. The package has one shared final Top 3 Focus Selection total, one access group and no aggregate Network Score.

The cockpit must be self-contained enough for the owner to implement the plan internally or with another provider. Do not hide instructions to create sales dependency. The client owns the delivered report, evidence pack, task plan and completed outputs; there is no lock-in.

The honest `Why CAESTHETIC / Why the 30-Day Sprint` block explains convenience, not exclusivity: CAESTHETIC has already assembled the evidence and diagnosis, knows the dependency order and can implement, coordinate and accept the selected changes inside a separately confirmed written 30-day scope. It must show real workload, specialist needs, dependencies, coordination cost and implementation risks without implying that every Score task is included. After the Sprint the client may continue in-house, use another provider, choose an optional CAESTHETIC path or stop.

Delivery: a password-protected, private/noindex `/score/<unguessable-slug>/` owner cockpit plus a **3–8 minute Valerie Petra recorded walkthrough**. The route stays outside the sitemap; the simple package password is validated server-side and never embedded in client HTML, JavaScript, report JSON or the repository. Walkthrough content and production authority remain exclusively in `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`; the detailed report spec may reference but not override it.

The approved Nohy V Ruky report at `/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/` follows the standard real-report contract: server-side password protection, `noindex,nofollow,noarchive,nosnippet`, an unguessable route, sitemap exclusion and no public case-catalogue listing.

A successful form is not a finished Score. Every accepted request must have a `score_case_id`, a named owner, a next action, same-day triage SLA and a durable notification outbox. Status changes only through the allowlisted transition contract in `docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md` (DEC-848). Safe weekly capacity is 2–3 Scores until measured; backlog extends delivery SLA and does not reject a valid owner request.

The public site may link to representative synthetic Growth Score examples, but every `/score/` route remains `noindex` and outside the sitemap. Demo/synthetic examples must be conspicuously labelled, use fictional data and state that no client relationship is represented. Real examples require truthful attribution and permission/redaction as appropriate.

### 4.1 ManyChat username-first prefill

ManyChat may prefill Growth Score intake only from an exact normalized Instagram username already present in the canonical private CAESTHETIC registry. The read path is:

```text
docs/ssot/data/outreach-username-registries.yaml
→ dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json
→ CURRENT immutable canonical_master.csv minus CURRENT deny overlay
→ exact same-username enrichment from VDS master_companies.csv
→ private RLS read projection
→ lookup-caesthetic-instagram
```

The projection is replaceable infrastructure, not a third prospect master or outreach authority. Candidate exports, dated exports, biographies, names, domains, cities and similarity are never used to infer a username match. A missing or conflicting field remains an empty string.

Runtime contract for ManyChat External Request:

```text
POST https://evo.do/api/v1/lookup-caesthetic-instagram
Content-Type: application/json

{"instagram_username":"{{Instagram Username}}"}
```

Every POST outcome is HTTP `200` with exactly:

```json
{
  "status": "matched | not_found",
  "practice_name": "",
  "city_state": "",
  "website": ""
}
```

`matched` means exact normalized username equality in the active private projection; it does not mean owner identity, outreach approval or inferred practice affiliation. Invalid/missing input, absence, projection errors and source-field gaps never trigger fuzzy lookup. `not_found` and all missing fields use empty strings so ManyChat Response Mapping stays stable.

ManyChat mappings:

| JSON path | Custom Field |
|---|---|
| `$.status` | `cae_lookup_status` |
| `$.practice_name` | `cae_candidate_name` |
| `$.city_state` | `cae_candidate_city` |
| `$.website` | `cae_candidate_website` |

## 5. Sprint 1 — the only Sprint sold upfront
**$2,500 · fixed 30 days · No retainer · No contract beyond 30 days.**

Sprint 1 converts the diagnosis into a deliberately limited implementation scope across the same four surfaces.

At Day 0 classify the inventory:

**A — Main constraints to complete or materially resolve in Month 1.** Select roughly **3–6** highest-impact problems, but use judgment rather than a quota. If work can reasonably be finished in 30 days, finish it. Never hold back executable work to manufacture Month 2.

**B — Secondary problems to start in Month 1 but which objectively continue.** Select roughly **1–5** when justified. Launch the implementation/process and disclose the expected horizon. Examples: review velocity, map movement, content/treatment expansion, reactivation cycles, sustained response discipline.

**C — Real problems not started in Month 1.** Document them. They may be handled by the practice in parallel/afterward, another provider, optional Sprint 2, or Growth System where recurring.

Counts are planning ranges, not promises. Priority, feasibility and impact govern scope.

A reasonable Month-1 shape is a lean combination of: measurement foundation; the patient conversion path; maps/entity cleanup; one production-ready reputation loop; one or two high-ticket offer paths; and an administrator conversion kit. This is a prioritization example, not a promise that every practice receives every module.

Every Sprint must pass these delivery gates:

1. **Day-0 Access Gate** — confirm the accounts, owners, permissions and approvals needed for the selected scope; blocked access changes the plan transparently rather than creating fictional progress.
2. **Before Snapshot** — capture dated evidence for each selected constraint before changing it.
3. **One Revenue Recovery Loop, where applicable** — ship one executable reactivation, abandoned-lead, no-show or unclosed-consultation loop when recoverable demand is a diagnosed constraint.
4. **Live Evidence per task** — a completed item requires a live URL, system state, screenshot, export or other verifiable implementation evidence; a draft or recommendation is not shipped work.
5. **Client Growth Statement** — close the period with the owner-facing result layer defined in section 8, while preserving the detailed internal evidence record.
6. **Build-vs-Configure Gate** — custom internal software is permitted only after existing configuration, workflow and off-the-shelf options are evaluated and the build is explicitly justified and separately scoped when outside the Sprint.

The standard Sprint does not include deep 10–15-competitor research, full blog plus mass article production, recurring maps/review maintenance, full-team training or change management, custom internal software without the Build-vs-Configure decision, routine social management or paid-media management. A diagnosed need may still be documented and routed to an approved Growth Budget input, finite Sprint Extension, Growth System or paid add-on; exclusion from the standard Sprint is not an instruction to ignore it.

Typical work:
- **Search:** GBP cleanup, categories/services, appointment path, accessible entity corrections, Local Falcon baseline/recheck. No 30-day map-ranking promise.
- **Website:** booking friction, mobile CTA/phone, selected treatment pages, conversion integrity, performance bottlenecks, analytics events.
- **Social:** bio/location/booking path, treatment representation, clinician/proof structure, cross-surface alignment. Routine social management excluded by default.
- **Reputation:** compliant review capture, response backlog, privacy-safe templates, operating owner/SLA, measurement. Raimov feedback-hub infrastructure may be adapted, but prohibited review gating must not be copied.
- **Operational layer:** enquiry-response protocol, reactivation logic/materials and measurement when diagnosed; not a fifth surface.

Communication through Day 30 is **email-only / asynchronous**. No routine calls. Growth Score walkthrough is the only standard human-video asset before Day 30; no standard Day-30 video.

Day-30 written email report:
1. **Done / materially resolved** — before → after.
2. **Started & continuing** — current state, horizon, required owner.
3. **Not started** — backlog and why outside Month-1 scope.
4. **Next path** — in-house / optional Sprint 2 / Growth System / defer-do-not-do.

Report failures/no-movement honestly. The detailed inventory is the operating/evidence layer; the owner-facing summary uses the Client Growth Statement in section 8.

## 6. Optional Sprint 2 — finite implementation continuation
Sprint 2 is **$2,500 per additional 30 days; not public, not promised and not required**. Offer it after Day 30 only when remaining high-value work is predominantly finite implementation.

It may continue Bucket B work, take a next high-priority Bucket C problem or address a new constraint discovered during Sprint 1 only where the remaining implementation is finite and meets the justification below. It may not become a generalized second task bundle or bill for work deliberately left unfinished despite being reasonably completable in Sprint 1.

Sprint Extension is justified only for finite implementation blocked by access, client approval, a vendor dependency or an objective implementation horizon. Month 2 is not an artificial backlog. Review velocity, map movement, content expansion, reactivation cycles, attribution/CRM data discipline, administrator adoption and internal referrals may mature into Month 2 or Growth System only when the process was genuinely launched in Month 1 and needs an observable time horizon or recurring ownership.

At Sprint-2 end use the same `Done / continuing / remaining` report. If remaining need is recurring ownership, Growth System becomes the natural optional offer.

## 7. Growth System — optional recurring ownership
When Growth System is the selected public recurring product, it currently uses Growth Budget unless a signed client-specific schedule selects another approved model.

**The client-specific Fixed Management Fee inside the Growth Budget buys recurring operating ownership that must create owner-visible business improvement, not a bank of hours or a fixed quota of posts, campaigns, calls or tasks.** No reusable monthly Fixed Management Fee amount is canonical here: the amount comes only from the signed client-specific Commercial Schedule / SOW.

Each operating month must plan and deliver **multiple tangible improvements that a practice owner can recognize — normally at least three** — across the highest-value applicable categories: conversion; revenue recovery; reputation; administrator conversion; funnel/site optimization; experiments; patient journey; and IT management-to-adoption. This is a monthly value floor, not a revenue/patient guarantee or permission to manufacture low-value task volume. A change may be reported as business impact only when the applicable evidence gate is met; otherwise it is labelled truthfully as `Shipped`, `Adopted` or `Maturing`.

Monitoring, analytics, data cleanup, Growth Ledger maintenance, reporting mechanics and vendor/developer coordination are internal means used to choose, deliver and verify those improvements. They do not independently satisfy the Fixed Management Fee's client-value obligation. IT management qualifies as an owner-visible improvement only when a requirement reaches an accepted live change and intended workflow adoption; creating a brief, task or meeting does not qualify.

Even in a month with no Performance Fee, the minimum contractual enabling and ownership scope is:

1. growth management and prioritization for the next operating cycle;
2. measurement, attribution and maintenance of the agreed evidence discipline in support of implemented improvements;
3. one short owner-facing monthly Client Growth Statement led by business changes, not an activity inventory;
4. conversion optimization across the existing traffic → inquiry → booking → consultation → treatment path;
5. retention/reactivation ownership for the highest-priority applicable recovery loop;
6. compliant reputation operations and review-flow oversight;
7. Growth Budget recommendation, allocation management and reconciliation, including reallocation within client-approved limits; and
8. at least one active optimization cycle per month, plus the portfolio of cycles needed to support the monthly owner-visible improvement floor, with each hypothesis, change, evidence and keep/stop/continue decision recorded.

Growth System is for genuinely recurring execution: review flow, response discipline, cross-surface maintenance, focused treatment/content expansion, reactivation cadence, analytics review, competitor monitoring and similar operations. Exact monthly priorities follow evidence and capacity; the fixed management scope is an ownership floor, not a promise to execute every possible workstream simultaneously.

Excluded from the fixed management scope are ad spend; third-party SaaS and metered usage; production; external specialists; substantial custom development or integrations; a full redesign or new site; and legal or medical work. Approved growth inputs use the Variable Growth Budget, while a self-contained delivery module belongs in a separate SOW/add-on under the classification canon in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`. Legal and medical professional work remains with appropriately qualified providers and is not silently bundled into the recurring model.

It is not a completion fee. Client owns delivered materials and may continue in-house/elsewhere. A client may move directly from Sprint 1 to Growth System when finite implementation backlog is no longer the main need; Sprint 2 is not mandatory.

Commercial layers are explicit **when Growth Budget is the selected model**: **Committed Growth Budget = Fixed Management Fee + Variable Growth Budget**. The Fixed Management Fee is a separately visible, client-specific line inside the budget; the variable part funds media, content/production, software/usage, experiments and other approved inputs. Unused variable funds remain the client's growth funds. Any contractually activated Performance Fee is client-specific, earned separately above the Growth Budget and never taken from its unspent balance. Canonical definitions, rollover, revenue baseline, measurement and schedule activation: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`. Performance Compensation remains optional and gated by its signed schedule and evidence; it is not an automatic part of Growth System.

## 8. Dual-axis reporting and Client Growth Statement
CAESTHETIC manages every engagement on two explicit axes:

1. **Contractual scope** — what CAESTHETIC owns, with detailed tasks, status, evidence, blockers and controls in the internal operating layer.
2. **Client-visible value** — what became better in the business during the period, presented in a short, mobile-first owner-facing layer.

Monitoring, analytics and task volume are enabling work, not the main client product. The monthly **Client Growth Statement** answers: **What became better in this business in the last 30 days because of CAESTHETIC?** It shows, when applicable and verifiable:

- the three most important changes of the month;
- attributable or recovered patients and value, without converting estimates into facts;
- before → after conversion changes;
- reactivation movement and the active recovery loop;
- reputation-request, response and recovery flow;
- administrator response, follow-up and conversion performance;
- where the approved Growth Budget went and what each allocation is expected to produce;
- experiments as tested → kept/stopped;
- work already launched and now maturing; and
- the next three owner-relevant actions.

The Statement must not lead with “we monitored”, “we analysed”, “we coordinated”, “we held meetings”, “we updated the tracker”, task/hour/content counts or a tool launch without adoption. Those facts may support delivery evidence, but the owner summary begins with the live business change, before → after state, evidence and why it matters.

Initiatives move through **Shipped → Adopted → Impact → Maturing**, matching the global lifecycle in `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`. `Shipped` proves implementation, `Adopted` proves the workflow is being used, `Impact` records a verified business effect, and `Maturing` makes an objective longer horizon visible. Shipping is activity, not automatically impact; absence of verified impact must be stated honestly. Numbers and causal claims follow the Class A/Class B evidence rules in `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md` and the global evidence classes in `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`.

The detailed operations/status/evidence layer remains canonical for delivery and audit; it is not pasted wholesale into the owner surface. Growth Ledger automation, verified-facts → AI draft → human approval, Request Router and add-on operating logic are specified once in `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`.

## 9. Review-capture module
Reference implementation:
- `site-raimovdental/feedback-hub/`
- `docs/raimov/operations/expert-dental/reputation/POST_VISIT_FEEDBACK_LOOP.md`
- `docs/raimov/operations/expert-dental/reputation/IMPLEMENTATION_PLAN_ATOMIC.md`

Reusable: post-visit feedback, star UX, non-generated review-writing guidance, platform selection, recovery workflow, alerts/SLA, analytics, opt-out/frequency controls, no rewards, no AI-generated reviews.

For CAESTHETIC this is primarily a **Reputation** Sprint module. Do not copy 4–5★ public / 1–3★ private routing blindly. Adapt each US implementation to current platform rules, law and healthcare/privacy requirements; prohibited review gating is forbidden.

## 10. Commercial integrity

### RAIM SMILE client-specific partnership carve-out

Under `DEC-862` and its partial supersession by `DEC-866`, CAESTHETIC is the separate Partnership Network Operator and employer/compensation owner for the RAIM SMILE Partner & VIP Coordinator. This is a client-specific operating mandate, not a reusable public CAESTHETIC medical offer and not authority over diagnosis or treatment.

For approved partner/VIP SmileCare 12 activations, the owner-approved model is 30% of actually collected/non-refunded membership revenue as a Partnership Distribution & Management Fee plus 100% of a separate Coordination Fee to CAESTHETIC, subject to legal/fiscal/labour counsel, signed schedules and max-use economics.

`DEC-866` additionally permits an **Attributed Sales Performance Fee** for verified collected sales to customers sourced or documentably reactivated by CAESTHETIC. Medical and dental sales use the ordinary activation path: a signed Commercial Schedule plus source marker, attribution window, dedup, payment/refund evidence and bilateral reconciliation. There are no separate legal/fiscal/advertising/privacy/fee-splitting activation gates or healthcare-only `0% / NOT ACTIVE` state for CAESTHETIC. Coordinator medical sales percentage and clinician referral/sales percentage remain `0%`; diagnosis, `Perio` assignment, treatment-plan value/acceptance/collection are never their compensation events. Exact authority: `docs/ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md` and `docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md`.

This carve-out does not change CAESTHETIC public pricing, Growth Score/Sprint/Growth System economics or public runtime.
- Never manufacture unfinished work to force Month 2 or retainer.
- Never guarantee rankings, patients or revenue.
- No fake cases, logos or proof.
- Sprint→retainer conversion is not a delivery success metric.
- Client can stop after any purchased Sprint.
- Ongoing work must be distinguishable from finite implementation.

## 11. Current launch dependencies
Founder/operator dependencies before scalable outbound:
- complete Instantly warm-up and deliverability approval for registered sending accounts;
- Valerie Petra walkthrough recording and quality-assurance capacity for every approved Growth Score;
- Stripe/payment setup;
- funnel analytics.

Current research universe: **Scottsdale · Nashville · Charlotte · Tampa · Raleigh · Austin · Naples · Charleston · Greenville**. Collect contacts/evidence across all nine before final ranking/sequencing unless founder changes the plan.

### Email identity and sender-role registry

Founder-confirmed on 2026-08-11. All mailboxes below are registered and were added to Instantly warm-up.

| Role | Domain | Mailboxes | Operational boundary |
|---|---|---|---|
| Cold outbound | `caesthetic.co` | `valerie@caesthetic.co`, `harper@caesthetic.co`, `lana@caesthetic.co`, `aurora@caesthetic.co`, `scarlett@caesthetic.co`, `sienna@caesthetic.co`, `chloebennett@caesthetic.co`, `willow@caesthetic.co` | Cold campaigns only after warm-up and deliverability approval. |
| Notifications | `caesthetic.com` | `notifications@caesthetic.com` | Transactional/system notifications; never use for cold outreach. |
| Website | `caesthetic.com` | `info@caesthetic.com` | Designated public website contact. Updating live site copy is a separate runtime change and deploy. |

Sender-role separation is mandatory: cold outreach stays on `caesthetic.co`; the primary `caesthetic.com` domain remains reserved for the public site and operational mail. Credentials, provider tokens and DNS secrets remain outside Git.

### Public business identity

Founder-confirmed on 2026-08-12: **Valerie Petra** is the public face of CAESTHETIC, including its LinkedIn presence. This is the only current public CAESTHETIC identity label. Founder-confirmed on 2026-09-03, the canonical personal LinkedIn URL for that identity is `https://www.linkedin.com/in/valeriia-petrova-uk/`; the URL slug does not change the public identity label.

The reusable owner-facing point-of-contact component uses the founder-provided `08-portrait-glasses-office-blazer.png` source (SHA-256 `4b3e0574a6b2ebb3d29e0e0eebdfb72e7609c8c997190fbf06daa3566b987c56`) through the optimized public derivative `/assets/img/team/valerie-petra-office-portrait.webp`. The component belongs on accountable delivery and decision surfaces, not on `/about/`; About remains the corporate category, operating-model and evidence-standard page. Replacing the photo or LinkedIn URL requires a new founder-confirmed source and repository-authority update. Stable technical ids and service/file names containing `valeriia` remain unchanged unless a separately scoped migration is approved.

## 12. Authority map
- Global architecture: `docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md`
- Global marketing canon: `docs/ssot/MARKETING_SYSTEM_STANDARD.md`
- Productization / Growth Control: `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md`
- Evidence / Impact Ledger: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
- Domain/runtime registry: `docs/ssot/PROJECT_DOMAIN_REGISTRY.md`
- Master strategy: this file — CAESTHETIC is a reference implementation and project adapter, not the source of the global rules above
- Growth Score detailed spec: `docs/caesthetic/growth_score_spec.md`
- Valerie Growth Score walkthrough script and production rules: `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`
- Growth economics and measurement: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`
- Growth System operations, automation and request/add-on classification: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`
- Owner VOC, canonical marketing questions and first-carousel topic order: `docs/ssot/CAESTHETIC_OWNER_MARKETING_QUESTIONS.md`
- Reel production and evidence-driven acquisition authority: `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` v3.0 (DEC-838 V3 FREEZE)
- Parallel Reel Format B production authority: `docs/ssot/CAESTHETIC_REEL_FORMAT_B.md` v1.0; only explicitly tagged episodes use it, and Format A/V3.2 remains active
- Expert Dental/Raimov client history: `docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md` — client-specific legacy commercial arrangement; not reusable CAESTHETIC dental pricing, budget, attribution or performance-fee canon
- Historical Sprint working spec: `docs/caesthetic/growth_sprint_spec.md` — non-canonical where conflicting (including old price/retainer assumptions)
- Knowledge/runtime lane: `docs/projects/caesthetic/`
- Production root: `site-caesthetic/`

`docs/ssot/CAESTHETIC_DELIVERY_AND_COMMUNICATION.md` is deprecated after this consolidation and only points here.
