---
owner: CAESTHETIC
status: active
version: 2.2
created: 2026-08-11
updated: 2026-09-03
scope: growth economics, Growth Budget, fixed management scope, revenue baseline and performance compensation
parent: docs/ssot/CAESTHETIC.md
client_schedule_pattern: docs/ssot/*_COMMERCIAL_SCHEDULE.md
global_commercial_parent: docs/ssot/MARKETING_SYSTEM_STANDARD.md
---

# CAESTHETIC Growth Economics Engine

This document is the canonical reusable policy for CAESTHETIC commercial economics **when Growth Budget, or a Hybrid that uses these layers, is the selected commercial model**. It defines the meaning of Growth Budget, the boundary of the Fixed Management Fee, budget rollover, additional work and the reusable Performance Fee formula.

It is a project adapter of `docs/ssot/MARKETING_SYSTEM_STANDARD.md`. It is not the global commercial-model authority and does not make Growth Budget the default or obligatory continuation after a Sprint. Fixed Retainer, Hybrid or another specifically approved model may be selected under the global canon. This engine then applies only if the signed schedule uses these layers.

It is an operating specification, not legal, tax or accounting advice and not a signature-ready agreement. Every amount, percentage, negotiation floor, billing currency, revenue source and activation status is client-specific. No number in one client schedule may be copied to another client by default, and none of those numbers becomes a global default.

Historical documents may preserve earlier structures for audit, but they do not override this file or an active client-specific Commercial Schedule.

## 1. Product and money layers

| Layer | Reusable treatment |
|---|---|
| Growth Score | Free diagnosis under the product SSOT. |
| 30-Day Growth Sprint | Finite implementation product under the current product/pricing SSOT. It does not by itself activate the recurring model below. |
| Committed Growth Budget | The client's signed minimum monthly budget for marketing and growth. It already contains the Fixed Management Fee. |
| Client Top-up | Additional client funding above the signed minimum. The client may add it voluntarily or approve it when a planned initiative requires more funds. |
| Fixed Management Fee | A mandatory, separately visible line inside the Growth Budget. Its amount is defined per client. |
| External Growth Spend | Media, software, production, vendors, experiments and other approved inputs paid from the Growth Budget. |
| Additional Work Fee | A separately scoped and priced fee for work outside the fixed management scope. It may be funded as an approved Growth Budget line or through a client top-up, but it is never silently included in the Fixed Management Fee. |
| Performance Fee | Separate optional compensation above the Growth Budget, earned only under the signed client-specific formula and verified measurement/attribution rule. Default OFF until that schedule is signed. |

The former reusable construction `base fee + Growth Budget` is superseded. The Fixed Management Fee is not added on top of the Growth Budget because it is already one of its required lines.

Economically, the Growth Budget has two parts:

- **Fixed part — Fixed Management Fee.** Covers the recurring cost of keeping the operating team in place and continuously managing the growth system.
- **Variable part — Variable Growth Budget.** Pays for direct execution and external inputs: media, production, software usage, contractors, direct software development, infrastructure and other approved growth costs.

CAESTHETIC's intended upside for measurable value creation is the **Performance Fee**, not markup on unused variable budget. The Fixed Management Fee therefore covers team capacity and operating ownership; the Performance Fee rewards verified positive business growth under the signed measurement rule.

```text
PeriodFunding = CarryIn + CommittedGrowthBudget + ClientTopUps

ClosingUnspentGrowthBalance =
  PeriodFunding
  - FixedManagementFee
  - ApprovedAdditionalWorkFees
  - ActualExternalGrowthSpend

CarryOut = max(0, ClosingUnspentGrowthBalance)

TotalCommercialAmount =
  CommittedGrowthBudget
  + ClientTopUps
  + EarnedPerformanceFee
```

An Additional Work Fee is counted only once. When it is paid from the Committed Growth Budget or a top-up, it is not added again outside `PeriodFunding`.

## 2. Growth Budget contract

### 2.1 Definition

Growth Budget is the complete monthly budget that the client commits to marketing and growth. It finances both management of the growth system and the inputs needed to operate it.

The Commercial Schedule must define either:

- a signed minimum amount; or
- a percentage and an agreed revenue reference from which a signed minimum amount is calculated.

A negotiation percentage is not an automatic universal spend target. Once the parties sign a minimum amount for the agreed term, the client may increase it but may not reduce it unilaterally. A reduction requires a written amendment that also revises scope, priorities and expected operating capacity.

### 2.2 Allocation authority

The client approves the total budget, permitted categories, material commitment limits and prohibited uses. Within those boundaries, CAESTHETIC controls allocation and reallocation because CAESTHETIC is responsible for operating the integrated growth system.

Routine allocation does not require approval of every individual transaction. Separate approval remains required where the Commercial Schedule, law, privacy/compliance policy or a material commitment threshold requires it.

### 2.3 Permitted categories

The Growth Budget may fund:

- paid media and placements;
- content, photography, video, design and production;
- CRM, SMS, phone, email, API, analytics and other approved software or usage;
- external specialists and vendors;
- tests, experiments and conversion assets;
- printing, events and sponsorships;
- complex IT, infrastructure, custom development and integrations;
- separately approved Additional Work Fees;
- other signed inputs directly connected to the growth program.

Ordinary CAESTHETIC staff time inside the fixed management scope is paid by the Fixed Management Fee and may not be charged again as an external or additional cost.

### 2.4 Rollover

Unused funds remain the client's growth funds. They do not expire and do not become CAESTHETIC revenue. The reconciled closing balance becomes `CarryIn` for the next period.

At termination, the parties reconcile:

1. earned Fixed Management Fees;
2. completed or accepted Additional Work Fees;
3. actual external spend;
4. non-cancellable commitments;
5. the remaining free balance.

The free balance remains with or is returned to the client according to the signed custody and payment method.

The Growth Budget may not go negative. A planned commitment above available funds requires a client top-up or written reprioritization before the commitment is made.

## 3. Fixed Management Fee

The amount is client-specific. It pays primarily to cover the recurring cost of maintaining the team that operates the client growth system. It is not positioned as the primary reward for business growth, and it does not buy unlimited hours, unlimited production or every request made by the client. The economic reward for measurable value created is the separately earned Performance Fee.

### 3.1 Minimum included scope

Unless a client schedule narrows or expands it, the Fixed Management Fee covers:

- growth strategy and monthly prioritization;
- management of the approved Growth System and active initiatives;
- allocation, reallocation and reconciliation of the Growth Budget;
- measurement governance, analytics and maintenance of the agreed revenue/baseline method;
- optimization of existing growth paths, including approved website, booking, forms, calls, messaging, CRM, reputation, retention and reactivation surfaces;
- coordination and quality control of approved vendors and external specialists;
- routine campaign, funnel and process optimization inside the current system;
- one approved monthly Client Growth Statement;
- ordinary project management, review and decision documentation required to operate the above scope;
- IT management for approved growth initiatives: translating business requirements into technical tasks, defining acceptance criteria and dependencies, supervising intermediate deliverables and response cadence, accepting or rejecting completed work, coordinating rollout, and integrating accepted technology into the client's operating workflow.

### 3.2 Not included automatically

The Fixed Management Fee does not automatically include:

- a new website, full redesign or independently valuable digital asset;
- substantial custom software, complex integration or new technical platform;
- a new brand, location, vertical or major additional channel;
- large standalone photo/video/content production;
- recruitment, staffing, HR or a separate practice-operations project;
- legal, tax, accounting or medical services;
- unlimited revisions, unlimited deliverables or work unrelated to the signed growth program.

Such work requires a written scope, acceptance criteria, price and funding treatment before work starts.

For IT, the boundary is explicit: **management is included; software production is variable spend.** Business analysis, task formation, technical briefing, intermediate-control cadence, acceptance, rollout coordination and integration into the client's business are included in the Fixed Management Fee when they relate to an approved Growth System initiative. Direct software implementation — programming, technical build, developer labor, specialist configuration, data migration, deployment work, licenses, hosting, APIs and infrastructure — is paid from the Variable Growth Budget or a separately approved top-up. The same work may not be charged twice.

## 4. Client-specific commercial schedule

No reusable dollar amount, percentage, cap or negotiation floor exists for the recurring model.

Every client schedule must contain:

- billing and measurement currencies plus any exchange-rate rule;
- Fixed Management Fee;
- proposed and signed Growth Budget method;
- signed minimum Growth Budget amount and term;
- permitted categories, allocation authority and material approval thresholds;
- rollover and termination reconciliation rules;
- fixed-scope additions or exclusions;
- Additional Work pricing/approval method;
- Performance Fee rate and signed-schedule activation status;
- baseline period, revenue definition, source of truth and closing procedure;
- treatment of refunds, taxes, discounts, financing, extraordinary income and structural business changes;
- dispute, audit and correction procedure.

Missing required data produces `Insufficient data` or `Not activated`; it never triggers a reusable default.

## 5. Frozen three-month revenue baseline

Where a client schedule selects the standard revenue-growth method, the baseline is the arithmetic average of the three full calendar months immediately preceding the agreed measurement start date.

```text
Frozen3MonthAverageRevenue =
  (RevenueMonthMinus3 + RevenueMonthMinus2 + RevenueMonthMinus1) / 3
```

The baseline is frozen before the first measured month. The same revenue definition, accounting basis, currency treatment, source system and closing procedure apply to all three baseline months and every measured month.

Revenue includes the full ordinary business revenue within the agreed entity/scope, including all ordinary payment methods such as cash, card, bank transfer and approved financing. Non-operating items are included or excluded only under the signed Measurement Schedule; the rule may not be changed after seeing a result.

A structural event such as an acquisition, disposal, new location, business combination or material scope change may alter the baseline only through a prospective written amendment. No party may make a retrospective adjustment merely because the formula produced an unfavorable result.

## 6. Performance Fee

Performance Fee is separate from and payable above the Growth Budget. The rate is client-specific.

For the standard method:

```text
PositiveRevenueDelta = max(
  0,
  CurrentMeasuredMonthRevenue - Frozen3MonthAverageRevenue
)

PerformanceFee = AgreedPerformanceRate * PositiveRevenueDelta
```

The calculation uses the entire positive difference for the agreed business scope. Channel-level attribution is not required. Growth from reputation, website, administrators, CRM, reactivation, content, paid media and other parts of the integrated system is not split into separate invoice claims.

If the measured month is equal to or below the baseline, Performance Fee is zero. A negative difference does not create client credit, debt or negative carryforward unless a client schedule explicitly says otherwise.

Performance Fee never becomes part of the Growth Budget, never reduces the rollover balance and is not paid from unspent Growth Budget unless the signed documents explicitly authorize a separate top-up for payment.

Legacy AGV/AGC calculations may remain available as operational analytics where useful, but they are not the reusable invoice basis for this revenue-delta Performance Fee and may not override the client schedule.

### 6.1 Evidence and closing

Before invoicing Performance Fee, the monthly fact set must contain:

- the frozen baseline and its three source months;
- the measured month's closed revenue;
- the agreed revenue definition and currency method;
- source-of-truth evidence or a client-certified revenue statement;
- refunds/corrections required by the signed schedule;
- arithmetic and applied rate;
- human approval and invoice status.

Patient names or clinical details are not required for this calculation. Use the minimum financial evidence needed to verify the number.

## 7. Commercial Schedule activation

Performance Fee remains `disabled` or `pending` until the client-specific Commercial Schedule is signed and defines the formula, rate, measurement or attribution rule, source of truth, refunds/corrections and closing procedure.

Medical and dental clients use this same activation contract. No additional legal/fiscal/advertising/privacy/fee-splitting clearance status is required by this engine. Ordinary clinical, data-handling and contracting responsibilities remain outside the fee calculation and do not replace the signed schedule or evidence requirements.

## 8. Reporting

The Client Growth Statement must show separately:

1. opening rollover balance;
2. committed monthly Growth Budget;
3. client top-ups;
4. Fixed Management Fee;
5. Additional Work Fees;
6. external spend by category;
7. closing rollover balance;
8. baseline revenue;
9. measured-month revenue;
10. positive revenue difference;
11. Performance Fee rate and amount, or `Not activated`;
12. data quality, unresolved corrections and schedule activation status.

Activity is not presented as impact. Missing or disputed numbers remain `Insufficient data` until resolved.

## 9. Agreement architecture

The commercial document stack is:

1. master Growth Management Services Agreement;
2. client- and term-specific SOW;
3. Commercial Schedule / Growth Budget Schedule;
4. Measurement Schedule;
5. Additional Work SOWs, when required;
6. client-specific Performance Compensation Schedule or rider, when selected.

The absence or invalidity of a Performance Schedule or rider does not remove the client's Growth Budget obligation or convert unused Growth Budget into CAESTHETIC revenue.

## 10. Runtime status

The deterministic runtime must receive all recurring commercial values from a client-specific schedule. It may not use reusable Fixed Management Fee, Growth Budget rate, Performance Fee rate or cap defaults.

Runtime and tests must require a signed performance schedule and must not require a separate healthcare legal-activation flag. Any incompatible legacy runtime preview must be labeled `superseded` and must not be used as an invoice calculation.
