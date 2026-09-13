# CAESTHETIC Events — operating router

Authority: [`docs/ssot/CAESTHETIC_EVENTS_AND_PARTNERSHIPS.md`](../../ssot/CAESTHETIC_EVENTS_AND_PARTNERSHIPS.md).

Events is a CAESTHETIC commercial direction. It is **not** a new runtime unit and does not replace the headline CAESTHETIC funnel. CPRP remains the shared partner/attribution/ledger engine.

## Read order

1. `docs/ssot/CAESTHETIC.md`
2. `docs/ssot/MARKETING_SYSTEM_STANDARD.md`
3. `docs/ssot/OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md` for partner origination
4. `docs/ssot/CAESTHETIC_EVENTS_AND_PARTNERSHIPS.md`
5. `docs/ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md`
6. task-specific CPRP contract: `EVENTS.md`, `ECONOMICS.md`, `TWENTY_SYNC_CONTRACT.md`, `ATTRIBUTION_AND_LEDGER.md`

## File architecture

```text
docs/ssot/
  CAESTHETIC_EVENTS_AND_PARTNERSHIPS.md    # direction/product canon
  CAESTHETIC_PARTNER_REVENUE_PLATFORM.md  # attribution/partner/settlement engine

docs/caesthetic/events/
  README.md                                # this router
  BISHKEK_PILOT.md                         # market operating adapter, no contact PII
  EVENT_CLUSTER_BRIEF.md                   # reusable partner-cluster brief
  LOCAL_OPERATOR_BRIEF.md                  # local production procurement brief

docs/caesthetic/partner-revenue/
  EVENTS.md                                # execution/evidence contract
  ECONOMICS.md                             # revenue and contribution rules
  TWENTY_SYNC_CONTRACT.md                  # CRM projection/sync
  ATTRIBUTION_AND_LEDGER.md                # lineage/settlement
  PILOT_EXPERT_DENTAL_KG.md                # Expert Dental client adapter
```

Only create the task-specific files above when there is content to own; do not create empty stubs.

## Operating separation

| Layer | Owner |
|---|---|
| Event direction, partner universe, cluster logic, talent/magnets, local operator model | Events canon |
| Partner identity, program scope, attribution, fee calculation, reconciliation, settlement | CPRP |
| Client service truth / clinical truth | Client CRM / service system |
| B2B partner contacts, conversations, next action | Twenty |
| Registration / ticket source / permissions | Event/CPRP registration layer |
| Local physical production | contracted Local Event Operator |

## Current pilot

Market: Bishkek, Kyrgyzstan.

Pilot advantages:
- Russian-speaking partner discovery is operationally convenient for early iteration;
- Expert Dental can participate as the first Health/Smile partner;
- the clinic pilot has measurable attributed-sales economics under its own client authority;
- memberships can be tested as Partner Value Assets;
- CAESTHETIC has practical access to clinic decision makers/admins for handoff validation.

The independent-direction milestone is a viable CAESTHETIC event/cluster that does not require Expert Dental.

## Data boundary

Do not store live partner contact lists, attendee lists, private emails, phone numbers, ticket-holder PII, patient data, signed schedules, payment exports or CRM dumps in this folder. Twenty/runtime systems own live contact state. Git stores rules, schemas, briefs and aggregate/evidence-safe conclusions.
