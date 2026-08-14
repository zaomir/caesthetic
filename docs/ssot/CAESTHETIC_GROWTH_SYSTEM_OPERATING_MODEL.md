---
owner: CAESTHETIC
status: active
version: 1.1
created: 2026-08-12
updated: 2026-08-13
scope: Growth System operations, Growth Ledger, client-visible reporting and request routing
parent: docs/ssot/CAESTHETIC.md
economics_authority: docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
global_productization: docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md
global_evidence: docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
---

# CAESTHETIC Growth System Operating Model

This document is the canonical internal operating policy for running the CAESTHETIC Growth System. It defines how evidence becomes an approved client-facing result statement and how new client requests are classified. It does not replace the product, Sprint or recurring-scope authority in `docs/ssot/CAESTHETIC.md`, and it does not redefine the measurement or commercial formulas in `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`.

CAESTHETIC is a **reference implementation** of `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md` and `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`. This file keeps aesthetic-practice funnel, Client Growth Statement, Growth Ledger, clinic-specific metrics, data sources and roles. It does not silently fork the global growth-control loop, cockpit canon, evidence classes or Impact Ledger contract.

This is an architecture and operating-policy decision only. It does **not** authorize a new runtime service, vendor, integration, database migration or healthcare-data flow. Each implementation still requires a separately approved scope plus privacy, security and compliance review appropriate to the client and jurisdiction.

## 1. Operating outcome and two reporting layers

Growth System owns recurring growth operations; it is not a package of staff hours, posts or campaign quotas. The operating system has two distinct layers:

1. **Internal operations and evidence layer.** Detailed tasks, owners, source records, dependencies, approvals, costs, exceptions, evidence and initiative status. This layer supports delivery, audit and truthful attribution.
2. **Client Growth Statement.** A short, mobile-first, owner-facing monthly surface organized around business change. It answers: **What became better in the practice during the last 30 days because of CAESTHETIC?**

Monitoring, analysis, data cleanup and vendor coordination remain necessary internal work, but activity is not presented as the primary client result. Every published claim must distinguish an action from an observed result. When no verified result exists, report the implementation state and expected observation horizon; never convert activity into implied impact.

The client-specific Fixed Management Fee must operate as a **monthly owner-visible improvement portfolio**. Plan and deliver multiple tangible improvements per month — normally at least three — selected against the practice's highest-value constraints. The portfolio may span:

| Outcome category | Qualifying CAESTHETIC result |
|---|---|
| Conversion | A live, evidenced improvement to inquiry, booking, consultation or treatment-path conversion. |
| Revenue recovery | An executable reactivation, lost-lead, no-show, unclosed-consultation or retention loop with verified movement where available. |
| Reputation | An implemented review-request, response, service-recovery or proof-flow improvement without review gating. |
| Administrator conversion | An adopted SLA, script, follow-up, CRM or handoff change that improves inquiry-to-booking discipline. |
| Funnel / site optimization | A live CTA, form, page, booking, messaging or tracking-path improvement. |
| Experiments | A completed test with evidence and a `keep`, `stop` or `continue observing` decision. |
| Patient journey | A live improvement to expectations, reminders, handoffs, experience or recovery across the patient journey. |
| IT management-to-adoption | An accepted configuration or technical change integrated into the practice workflow and evidenced as used. |

The floor is not a guarantee of revenue or patient volume and is not satisfied by splitting one change into small tasks. If access, approval, seasonality or an objective maturation horizon prevents verified impact, the Client Growth Statement must show the honest `Shipped`, `Adopted`, `Impact` or `Maturing` state, the blocker or horizon and the next owner decision.

Activity-only claims are prohibited as headline outcomes. “Monitored rankings”, “analysed data”, “coordinated the developer”, “held meetings”, “updated the tracker”, “prepared the monthly report”, “published N posts” and “launched a tool/training” without acceptance or adoption belong only in the internal evidence layer. The owner surface starts with the business change, before → after state, evidence and business relevance.

### 1.1 Client Growth Statement contract

The monthly owner surface contains, in this order:

1. the **three most important changes** shipped or advanced during the month;
2. attributable or recovered patients and attributable/recovered value **only where verifiable**;
3. before → after conversion changes for website, booking, forms, calls, WhatsApp or another approved path;
4. reactivation/recovery flow: audience reached, responses, bookings and completed qualifying events where verified;
5. reputation flow: requests, feedback, public reviews, response discipline and recovery state without review gating;
6. administration performance: response SLA, follow-up discipline, lost-lead recovery and booking conversion where evidenced;
7. Growth Budget: approved allocation, actual client-funded cost and intended/observed output by category;
8. experiments: hypothesis, tested change, evidence and `kept` / `stopped` / `continue observing` decision;
9. maturing work: what is live, why the outcome horizon exceeds the month and who owns the next dependency;
10. the **next three actions**, expressed as business actions rather than an internal task dump.

An unavailable metric is `Insufficient data` or `Not yet verifiable`, not an invented estimate or an assumed zero. Failures, stopped tests and no movement are reported plainly.

### 1.2 Initiative lifecycle

Each owner-visible initiative uses the same evidence-gated lifecycle:

`Shipped → Adopted → Impact → Maturing`

| State | Meaning | Minimum evidence |
|---|---|---|
| `Shipped` | The change or process is live and its acceptance checks pass. | Live artifact, timestamp and acceptance evidence. |
| `Adopted` | The intended team or patient workflow is actually being used. | Source-system usage or approved operational evidence, not only training completion. |
| `Impact` | A result attributable under the applicable measurement rules is observable. | Verified fact set and linked methodology; estimates remain Class B. |
| `Maturing` | The change has reached initial impact or stable adoption but needs a longer objective horizon for review velocity, map movement, content expansion, reactivation cycles, attribution discipline, internal referrals or similar cumulative effects. | Current verified state, explicit horizon, owner and next review date. |

The lifecycle is not a progress-performance device. A stage may remain unchanged, and an initiative may be marked internally as `blocked`, `stopped` or `reversed`. `Maturing` may be used only after the process was genuinely launched and evidenced; it may not hide an unstarted backlog.

## 2. Growth Ledger

The **Growth Ledger** is CAESTHETIC's project implementation of the global **Impact Ledger** plus the normalized event/evidence model shared by the internal operations layer, attribution workflow and Client Growth Statement. The global logical contract is `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`. This file specializes sources, entities and clinic operating fields. It is not a dashboard and not a copy of every source system.

Canonical flow:

```text
website / ads / CRM / forms / WhatsApp / calls / reviews / email / payments / internal workflows
  → source adapters and consent/access gates
  → normalized append-only Growth Ledger events
  → deduplication, identity resolution and evidence verification
  → verified fact sets
  → canonical budget reconciliation, revenue-delta Performance Fee and initiative-status calculations
  → AI narrative draft from approved facts
  → human review and approval
  → Client Growth Statement
```

Growth Budget, its Fixed Management Fee and variable lines, rollover, revenue baseline, Performance Fee and any legacy AGV/AGC analytics are calculated only under `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`. This document defines their operating inputs and lineage, not duplicate formulas.

### 2.1 Ledger entities

The minimum logical entities are:

- **source connection** — client, system, data owner, approved purpose, access basis, privacy class and synchronization health;
- **ledger event** — one normalized business event with immutable source lineage;
- **evidence record** — reference to the source artifact or approved proof, verification state and verifier;
- **identity link** — privacy-minimized mapping used to deduplicate a patient, lead, conversation or transaction across approved systems;
- **initiative** — intended outcome, owner, scope, dates, lifecycle state, experiment decision and evidence links;
- **allocation line** — approved Growth Budget category, supplier, client-funded amount, period and reconciliation state;
- **fact set** — versioned collection of verified inputs used for one calculation or published statement;
- **client request** — intake, router classification, approval, price/SOW linkage and resulting initiative;
- **statement** — reporting period, selected fact-set versions, draft version, human approver and publication timestamp.

### 2.2 Required ledger-event fields

Every normalized event requires the following fields or an explicit `not_applicable` value where the schema permits it:

| Field | Requirement |
|---|---|
| `ledger_event_id` | Globally unique, stable internal id. |
| `client_id` / `practice_id` | Tenant boundary; no cross-client aggregation into a client report. |
| `event_type` / `funnel_stage` | Controlled taxonomy such as inquiry, contact attempt, booking, consultation, treatment completion, reactivation, review request, review or payment adjustment. |
| `occurred_at` / `observed_at` | Source occurrence time and ingestion/observation time with timezone. |
| `source_system` / `source_record_id` | Immutable lineage and idempotency key; source URL or evidence pointer where appropriate. |
| `subject_ref` | Privacy-minimized pseudonymous lead/patient/entity reference; never a display name in an owner report. |
| `initiative_id` | Linked initiative or explicit `unassigned`; later assignment is versioned. |
| `status` | Source status plus normalized status; qualifying completion is never inferred from a booking or consultation. |
| `attribution_class` / `attribution_rule_version` | Applied only under the signed Measurement Schedule; otherwise `unattributed`. |
| `service_code` / `currency` / relevant value fields | Required only for an eligible economics event; values retain source type and price-book version. |
| `evidence_ref` / `evidence_class` | Approved evidence pointer and `A` or `B`; no unsupported narrative evidence. |
| `verification_status` | `unverified`, `verified`, `rejected` or `superseded`, with verifier and timestamp. |
| `schema_version` / `transform_version` | Reproducible normalization and calculation lineage. |
| `privacy_class` / `retention_policy` | Access, minimization, deletion and retention controls for the event. |

Raw message bodies, call recordings, clinical notes and other sensitive content do not belong in the general ledger by default. Store the minimum normalized fact and a permission-controlled evidence reference. Any need for protected health information or another sensitive class requires a documented purpose, data-processing authority, access model and retention/deletion policy before ingestion.

### 2.3 Event integrity rules

- Ingestion is idempotent on client, source system and source record/version.
- Normalized events are append-only. Corrections use `supersedes_event_id`, reversal or adjustment events; published history is not silently overwritten.
- Identity resolution records method and confidence. Low-confidence links cannot create Class A attribution.
- Every fact published in a statement resolves to its fact set, ledger events, evidence and transformation versions.
- The source of truth for completion, payment, review or communication status is declared per client; the most convenient source never wins by assumption.
- A source outage, incomplete access or schema drift lowers data quality and blocks affected claims; it does not license interpolation.
- Tenant separation, least-privilege access and auditable approval are mandatory.

### 2.4 Source-specific boundaries

| Source | Allowed operating use | Gate |
|---|---|---|
| Website/forms | Consent-safe inquiries, source, conversion path and approved analytics events. | Disclose collection; minimize free-text and health data. |
| Ads | Spend, campaign/source metadata and platform conversion evidence. | Reconcile with source records; platform attribution alone is not completed-patient proof. |
| CRM | Lead state, activity, booking and approved attribution evidence. | Define status ownership and required staff discipline. |
| WhatsApp/email/calls | Contact attempts, response timestamps, disposition and approved conversion facts. | Consent, account authority, retention and privacy review; no unrestricted raw-content ingestion. |
| Reviews | Requests, public review facts, response/recovery state. | Platform-policy, privacy and anti-review-gating controls. |
| Payments/practice management | Approved completion, adjustment and value evidence. | Signed measurement source, role-limited access and reconciliation. |
| Internal workflows | Task completion, QA, approvals and initiative adoption. | Internal activity is not business impact without external result evidence. |

## 3. Evidence, calculation and AI controls

The existing Class A / Class B evidence policy applies end to end:

- **Class A** — observable, source-linked and human-verifiable facts plus reproducible calculations over approved verified inputs. Examples: a live CTA, a timestamped response, a verified completed qualifying event, a published review, a reconciled Growth Budget expense.
- **Class B** — modeled opportunity, forecast, interpretation, low-confidence identity match or another estimate. It must be labeled `estimate`, state assumptions and method, show data quality and remain visually distinct from verified results.

No output may upgrade Class B evidence to Class A through repetition, aggregation or AI wording. Missing required evidence produces `Insufficient data`.

### 3.1 Fact-set and publication gate

Before narrative generation, the reporting workflow freezes a versioned fact set containing:

1. reporting period and client boundary;
2. included ledger-event ids and verification state;
3. excluded/rejected events with reason;
4. source and data-quality summary;
5. measurement, price-book, attribution and transformation versions;
6. precomputed approved metrics and their Class A/Class B label;
7. initiative lifecycle evidence;
8. Growth Budget allocation and reconciliation facts;
9. unresolved exceptions and prohibited claims.

Only verified facts and explicitly approved Class B fields are exposed to narrative generation.

### 3.2 AI role

AI may organize, summarize and draft plain-language narrative from the approved fact set. AI may not:

- invent, interpolate, round into a stronger claim or independently source a number;
- calculate new commercial or attribution amounts outside the canonical deterministic calculation layer;
- infer treatment completion from inquiry, booking, consultation, payment intent or staff commentary;
- hide assumptions, failed experiments, missing evidence or adverse movement;
- publish, send or approve the Client Growth Statement.

Every AI draft records model/workflow version, fact-set id and generation timestamp. A named human checks source lineage, numbers, claim class, privacy, commercial language and the action/result distinction. Publication requires that human's approval and timestamp. A later correction creates a new statement version and preserves the superseded version for audit.

## 4. Preferred implementation architecture

If implementation is separately approved, **Supabase is the preferred source-of-truth and controlled data layer** for normalized ledger entities, row/tenant access, evidence lineage and statement versions. This preference is architectural, not authorization to create or change a Supabase project.

- **n8n** may be used as an optional integration/orchestration layer for source synchronization, retries, alerts and approval routing. It is not the ledger source of truth and may not contain ungoverned long-lived copies of sensitive data.
- **PostHog** may be used for consented web product/conversion analytics only where the client's privacy and compliance review permits it. Healthcare-sensitive properties must be minimized or excluded.
- **Session replay for healthcare-sensitive journeys is off by default** and requires a separate documented privacy/compliance gate, data-masking validation, consent/legal basis, retention decision and client approval. Ordinary analytics approval does not activate replay.

No external service is a mandatory dependency of this canon. Configure or reuse approved client systems before proposing a custom build. Secrets and raw production data remain outside Git.

## 5. Client Request Router

Every new request enters one router before work starts. The default behavior is to understand and classify the request, not automatically reject it and not silently absorb it into the fixed management scope.

### 5.1 Fixed management routing context

The client-specific Fixed Management Fee is a separately visible line inside the Growth Budget. It pays for recurring operating ownership, not a time bank. For routing purposes its minimum operating scope is:

- multiple tangible owner-visible business improvements per month, normally at least three, across the canonical outcome categories in section 1;

- growth management and monthly prioritization;
- measurement and attribution maintenance;
- one approved monthly Client Growth Statement;
- conversion optimization of existing growth paths;
- retention/reactivation operation;
- reputation operation;
- management and reconciliation of the approved Growth Budget;
- enough active optimization cycles to support the monthly owner-visible improvement floor.

It does not promise fixed hours, post volume, campaign volume or a permanently fixed task list. No reusable monthly Fixed Management Fee amount is defined by this operating model; the signed client-specific Commercial Schedule / SOW controls it. The authoritative product wording remains in `docs/ssot/CAESTHETIC.md`.

Ad spend, external SaaS/usage, production, external specialists, substantial custom development/integrations, a full redesign/new site, and legal or medical work are not silently included in the Fixed Management Fee. They route to the Variable Growth Budget, an add-on/SOW or the appropriate external adviser as defined below. Canonical money-layer treatment remains in `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`.

### 5.2 Four request classes

| Class | Decision test | Commercial treatment | Examples |
|---|---|---|---|
| `Included Optimization` | A finite, proportionate improvement to an existing approved growth surface or active cycle that requires no material external cost, standalone system or substantial build. | Included in the fixed management scope; reprioritize transparently and record the displaced action, if any. | CTA/text adjustment, form-field reduction, script refinement, small tracking repair. |
| `Growth Budget Cost` | A client-funded input is needed to execute the approved growth program, but the input itself is not CAESTHETIC service revenue. | Prior client approval, budget category and pass-through/reconciliation treatment under the economics SSOT. | Ad spend, usage-based software, printing, production vendor, approved external specialist. |
| `Growth Add-on` | A bounded growth deliverable is outside ordinary recurring ownership because it is a substantial build, new asset/system, expanded channel or independently valuable module. | Fixed-price add-on/SOW plus separately identified external pass-through. | New site/full redesign, substantial integration, custom growth workspace, complex Review Hub, loyalty/patient-motivation module. |
| `Practice Operations Add-on` | The request primarily changes staffing or practice operations while directly supporting patient acquisition, conversion, retention or service operations. | Fixed-price finite add-on or a separate monthly operations add-on when ongoing. | Recruitment Hub, staffing workflow, concierge/VIP operations, internal training infrastructure, administrator workflow/QA design. |

A request may be split into more than one class—for example, a fixed-price build plus third-party software as Growth Budget Cost. Classification never changes a clinical, legal, HR or employer responsibility into CAESTHETIC authority. Practice Operations Add-ons require appropriate employment, healthcare, privacy and jurisdiction-specific review.

### 5.3 Router record and decision sequence

Each request record contains:

- `request_id`, client, requester and intake date;
- desired business outcome and urgency;
- affected surface/process and link to an active initiative;
- requested deliverable, acceptance evidence and explicit non-goals;
- finite versus ongoing treatment, dependencies and required approvals;
- selected class, classification rationale and fixed-scope conflict check;
- internal delivery estimate, Module Floor, Target Gross Margin and external pass-through;
- owner-approved fixed client price or approved Growth Budget amount;
- SOW/add-on/budget authorization, delivery owner and lifecycle linkage;
- status, outcome evidence and statement/reporting destination.

Decision sequence:

1. clarify the intended business result and required evidence;
2. test whether it is a proportionate optimization inside the active fixed management priorities;
3. separate external client-funded inputs from CAESTHETIC delivery;
4. determine whether the remaining delivery is a Growth Add-on or Practice Operations Add-on;
5. split mixed requests, define acceptance and dependencies, and quote/approve before work;
6. create or link the initiative and report it through the same ledger lifecycle.

No task becomes included merely because it is urgent, requested during a retainer month or adjacent to marketing. Conversely, a useful out-of-scope task receives a clear route and offer instead of an automatic refusal.

## 6. Internal add-on pricing policy

For finite add-ons, the internal pricing orientation is:

```text
Price = max(Module Floor, Direct Delivery Cost / (1 - Target Gross Margin))
        + external pass-through
```

`Target Gross Margin` must be a documented value from `0` up to but not including `1`. `Direct Delivery Cost` includes the scoped internal and contracted delivery cost. External pass-through is disclosed separately and never hidden inside a success-fee or Growth Budget result claim.

Internal working bands:

| Size | Working fixed-price band |
|---|---:|
| Small | $500–900 |
| Medium | $1,250–2,500 |
| Large | $3,000–7,500+ |
| Ongoing operations | Separate monthly add-on scoped to ownership, SLA and volume. |

These bands are a commercial working grid, not public pricing, not an automatic quote and not authority to alter a signed SOW. The public/site pricing canon remains `site-caesthetic/src/config/pricing.ts`; this document does not change it. A quote is fixed-price externally even when CAESTHETIC estimates cost and margin internally.

## 7. Monthly operating cadence and controls

1. **Intake and health check:** source access, synchronization, consent/compliance state and open exceptions.
2. **Reconciliation:** deduplicate events, resolve corrections, verify evidence and freeze the monthly fact set.
3. **Initiative review:** assign evidence-gated lifecycle states; stop weak experiments rather than preserving activity.
4. **Economics and allocation:** run only canonical deterministic calculations; reconcile the Fixed Management Fee, variable spend and rollover as distinct lines inside the Growth Budget, with any earned Performance Fee separately above it.
5. **Request review:** classify new asks, approve included reprioritization, budget cost or fixed-price add-on routing.
6. **Draft:** AI creates a concise narrative only from the approved fact set.
7. **Human approval:** verify numbers, attribution, privacy, Class A/Class B labels and action/result wording.
8. **Publish:** issue the mobile-first Client Growth Statement and record its version.
9. **Next cycle:** select the next owner-visible improvement portfolio and enough active optimization cycles to support the normal three-improvement monthly floor.

Minimum monthly controls:

- no published number without source lineage and fact-set membership;
- no qualifying/completed-patient claim from a proxy funnel event;
- no AI-autonomous publication;
- no Class B estimate presented as achieved value;
- no review gating or health-sensitive replay by default;
- no unapproved external spend or vendor activation;
- no silent scope expansion or artificial backlog;
- no client-identifiable data in cross-client reporting.

## 8. Authority and references

- Product positioning, funnel, Sprint and Growth System authority: `docs/ssot/CAESTHETIC.md`
- Global productization / Growth Control: `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md`
- Global evidence, adoption, impact and Impact Ledger: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
- Economics, Growth Budget, revenue baseline, Performance Fee, legacy operational AGV/AGC analytics and legal-mode authority: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`
- Expert Dental historical plan/report source: `docs/ssot/EXPERT_DENTAL_MONTH_1_PLAN_AND_REPORTS.md`
- Expert Dental/Raimov detailed operations and evidence layer: `docs/raimov/operations/expert-dental/PLANNING_AND_REPORTING.md`
- Expert Dental client-specific legacy commercial history: `docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md`
- Public/site pricing runtime canon: `site-caesthetic/src/config/pricing.ts`

Where a client-specific SOW or signed Measurement Schedule is stricter, it controls that client's permitted data sources and delivery. It may specialize this model but may not make unsupported claims or override the repository's master/economics authorities.
