---
owner: RAIMOV / CAESTHETIC
status: active-negotiation
version: 1.3
created: 2026-08-12
updated: 2026-09-03
scope: Expert Dental Studio / Raimov recurring Growth Budget and Performance Fee negotiation parameters
parent: docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
attributed_sales_authority: docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md
supersedes_commercial_terms_in: docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md
---

# Expert Dental Commercial Schedule

This is the active internal negotiation authority for Expert Dental Studio / Raimov. It is not a signed agreement and does not activate invoicing or Performance Fee by itself.

The values below belong only to this client negotiation. They are not reusable CAESTHETIC prices or percentages, and they are not global marketing-canon defaults.

Global commercial-model and rate rules: `docs/ssot/MARKETING_SYSTEM_STANDARD.md`, `docs/ssot/MARKETING_NEGOTIATION_STRATEGY.md`. This client's negotiated model is Growth Budget plus an optional Commercial-Schedule-and-measurement-gated Performance Fee. `$2,000`, `12%`, `10%` and `20%` remain Expert Dental-only.

## 1. Negotiation position

| Term | Expert Dental position |
|---|---:|
| Fixed Management Fee | **$2,000 per month**, inside the Growth Budget |
| Opening Growth Budget rate | **12%** |
| Owner-approved negotiation floor | **10%** |
| Opening Performance Fee rate | **20%** |
| Performance basis | Entire positive monthly revenue difference against the frozen three-month baseline |
| Channel attribution | Not required |
| Unused budget | Rolls forward |
| Client top-up | Allowed |
| Unilateral budget reduction | Not allowed |

The `$2,000`, `12%`, `10%` and `20%` values must not be copied to another client schedule.

## 2. Growth Budget calculation

For negotiation, the proposed budget rate is applied to the agreed revenue reference. The preferred reference is the same average revenue for the three full calendar months before measurement starts.

```text
Frozen3MonthAverageRevenue =
  (MonthMinus3 + MonthMinus2 + MonthMinus1) / 3

ProposedCommittedGrowthBudget =
  Frozen3MonthAverageRevenue * NegotiatedGrowthBudgetRate
```

At signature, the calculated amount becomes the minimum monthly Growth Budget for the agreed term. Expert Dental may add funds but may not reduce that minimum unilaterally. Any reduction requires a written amendment and corresponding change to scope and operating expectations.

The schedule is not signable if the resulting Growth Budget cannot contain the `$2,000` Fixed Management Fee and a workable non-fixed growth reserve. The absolute signed minimum must be written into the final schedule.

## 3. Allocation

After the total Growth Budget and allowed categories are approved, CAESTHETIC decides how the available non-fixed balance is allocated and reallocated.

Permitted uses include:

- advertising and placements;
- content and production;
- CRM, messaging, phone, analytics and other software;
- external specialists and contractors;
- tests and conversion assets;
- complex IT, infrastructure, development and integrations;
- separately approved Additional Work Fees;
- other documented growth inputs.

The client receives transparent reconciliation but does not approve every routine transaction. Material commitment thresholds, privacy-sensitive systems and legally restricted expenses remain subject to the final signed approval rules.

## 4. What the $2,000 Fixed Management Fee includes

The `$2,000` Fixed Management Fee is the fixed part of the Growth Budget. Its purpose is to cover the recurring cost of keeping the team operating the clinic growth system. It is not positioned as the main reward for revenue growth; the performance-linked reward is the separate Performance Fee.

Keeping the team available is the economic basis of the fee, not the owner-facing deliverable. Each operating month must plan and deliver **multiple tangible improvements that the clinic owner can recognize — normally at least three** — against the highest-value current constraints. The portfolio may include conversion, revenue recovery, reputation, administrator conversion, funnel/site optimization, experiments, patient journey and IT management-to-adoption outcomes. This is not a revenue/patient guarantee and may not be satisfied by splitting one change into small tasks.

Monitoring, analytics, data cleanup, reporting mechanics, meetings, trackers and contractor/developer coordination are internal means. They support selection, implementation and verification; none is the main monthly result by itself. The Client Growth Statement must lead with the live business change, before → after state, evidence and why it matters. A longer-horizon result must be labelled honestly as `Shipped`, `Adopted`, `Impact` or `Maturing` rather than turning activity into implied impact.

The monthly enabling and ownership scope covers:

- growth strategy and monthly priorities;
- management of the integrated growth system;
- allocation and reconciliation of the Growth Budget;
- measurement, analytics and monthly management reporting in support of implemented improvements;
- optimization of the existing website/booking path, reputation surfaces, CRM/follow-up, retention/reactivation and current campaigns;
- coordination and quality control of approved contractors through acceptance of live work;
- routine project management and regular optimization inside the current system;
- IT management for approved initiatives: translating clinic/business requirements into technical tasks, defining acceptance criteria, controlling intermediate deliverables and response cadence, accepting completed work, coordinating implementation and integrating the result into clinic operations. IT management counts as an owner-visible outcome only after the accepted change is live and the intended workflow is adopted.

It does not include unlimited output or every new task requested by the clinic.

## 5. Additional work

The following require a separate written scope and price:

- a new website or full redesign;
- a substantial custom IT product or complex integration;
- a new location, brand or independently valuable module;
- large standalone production;
- recruitment, HR or a separate practice-operations project;
- work outside the signed growth program.

For IT the rule is: **management is included in the fixed fee; direct software implementation is variable spend.** The `$2,000` covers business analysis, task formation, specification, developer coordination, intermediate control, acceptance, rollout coordination and integration into clinic operations for approved Growth System initiatives. Programming, technical build, developer labor, specialist configuration, migration, deployment, licenses, hosting, APIs and infrastructure are paid from the variable part of the Growth Budget. If the available variable balance is insufficient, Expert Dental must approve a top-up or the initiative is deferred.

A genuinely separate new product, platform or major expansion of management scope may still require a separate written management/additional-work scope. One and the same work may not be charged twice.

## 6. Rollover

Unused funds do not expire and do not become CAESTHETIC revenue. The reconciled closing balance moves into the next period.

At termination, earned fees, actual spend and non-cancellable commitments are reconciled first. The remaining free balance stays with or is returned to Expert Dental according to the final payment/custody method.

## 7. Performance Fee

The opening negotiation rate is **20%**.

```text
PositiveRevenueDelta = max(
  0,
  CurrentMonthRevenue - Frozen3MonthAverageRevenue
)

PerformanceFee = 20% * PositiveRevenueDelta
```

The fee is calculated from the entire positive difference for the agreed clinic scope. It is not limited to advertising leads or patients attributed to an individual channel.

If current-month revenue does not exceed the baseline, Performance Fee is zero. A negative month does not create negative carryforward under the opening proposal.

Performance Fee is paid above the Growth Budget and does not reduce the rollover balance.

## 8. Items required before signature

The final client documents must still specify:

- clinic legal entity and exact revenue perimeter;
- source of truth for all revenue, including cash, cards, transfers and financing;
- revenue recognition/collection basis and month-closing date;
- treatment of taxes, refunds, discounts, chargebacks and non-operating income;
- measurement currency and USD/KGS exchange-rate rule where required;
- signed minimum Growth Budget amount and contract term;
- custody/payment mechanics and material commitment thresholds;
- audit/correction/dispute procedure;
- signed Commercial Schedule or Performance Compensation Rider containing the complete measurement terms above.

Until those fields are complete and the client-specific schedule is signed, the Performance Fee is a negotiation position, not an active invoice right. Under `DEC-866`, an Attributed Sales Performance Fee for medical/dental sales does not require a separate legal/fiscal/advertising/privacy/fee-splitting clearance state.

## 9. Historical terms

The earlier setup fee, `$1,500` retainer, `$2,500` working budget and `10% + $15` success-fee structure in `EXPERT_DENTAL_GROWTH_OFFER.md` are preserved only as history. They must not be quoted as the current proposal.
