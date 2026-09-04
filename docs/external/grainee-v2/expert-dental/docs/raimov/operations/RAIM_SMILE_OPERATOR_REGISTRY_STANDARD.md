---
title: RAIM SMILE — operator registry and transition standard
status: PREIMPLEMENTATION
version: 1.0
created: 2026-08-29
owner: RAIM SMILE network operations
clinical_owner: RAIM SMILE protocol governance + operator clinical lead
decision: docs/founder-notes/DEC-859_raim-smile-current-operator-and-qualified-lead-marketplace.md
links_to:
  - docs/ssot/RAIM_SMILE_OPERATOR_NETWORK_AND_ROUTING_MODEL.md
  - docs/raimov/patient-funnel/RAIM_SMILE_MULTI_OPERATOR_ROUTING_CONTRACT.md
  - docs/legal/raimov/RAIM_SMILE_OPERATOR_MARKETPLACE_LEGAL_GATES.md
---

# RAIM SMILE — operator registry and transition standard

## 1. Purpose

Registry is the fail-closed source of truth for which clinics may receive RAIM SMILE leads, in which market/program, under which contract and with what current capacity/quality status.

A clinic cannot become eligible merely by offering a higher lead fee.

## 2. Operator statuses

```text
CANDIDATE
→ DUE_DILIGENCE
→ CONDITIONALLY_APPROVED
→ APPROVED
→ ACTIVE
→ CAPACITY_CLOSED / AMBER / SUSPENDED
→ TERMINATED / EXPIRED
```

Definitions:

- `CANDIDATE` — commercial interest only; no leads.
- `DUE_DILIGENCE` — evidence collection; no leads.
- `CONDITIONALLY_APPROVED` — missing explicit activation item; no live leads unless narrowly approved in writing.
- `APPROVED` — due diligence passed but route may not be active.
- `ACTIVE` — may receive leads for exact approved scope.
- `CAPACITY_CLOSED` — structurally approved, temporarily excluded.
- `AMBER` — restricted scope/monitoring; eligibility depends on explicit rule.
- `SUSPENDED` — no new leads.
- `TERMINATED` / `EXPIRED` — no new leads and transition/retention rules apply.

## 3. Canonical operator record

### Identity and legal

- `operator_id` immutable slug;
- legal entity name;
- public clinic name;
- registration/tax identifiers in protected system;
- jurisdiction;
- licensed address(es);
- licence number, scope, issue/expiry dates and evidence reference;
- authorised signatory;
- insurance/other mandatory cover where applicable.

### Market and program scope

- country/city;
- languages;
- approved RAIM SMILE programs;
- services explicitly excluded;
- remote/in-person scope;
- travel/aftercare capability;
- age restrictions.

### Clinical governance

- named clinical lead;
- named providers by program;
- credential evidence references;
- protocol training/version;
- consilium process;
- medical escalation path;
- emergency routing;
- treatment-plan and document SLA;
- case-review/quality cadence.

### Capacity

- intake slots/week;
- diagnostics slots/week;
- treatment chair-hours by program;
- current capacity status;
- next available slot;
- blackout dates;
- backup/provider coverage.

### Patient operations

- named admin/coordinator owner;
- covered hours;
- lead acceptance SLA;
- booking channel;
- complaint owner;
- Family Brief and second-LPR process;
- financing/payment options as factual attributes, not clinical ranking.

### Data/privacy/security

- controller/processor roles;
- DPA status;
- consent version;
- approved marketing transfer channel;
- approved medical upload channel;
- retention/deletion rule;
- access review date;
- incident-response contact;
- cross-border status.

### Quality and trust

- evidence/claims status;
- review/complaint trends;
- material incidents;
- remake/service-recovery indicators;
- audit score;
- last audit date;
- current `quality_status`;
- suspension reason/history.

### Commercial

- Commercial Schedule ID;
- mode: designated / rotation / marketplace;
- fixed lead fee or bid permission;
- bid floor/ceiling where approved;
- territory/program terms;
- invoicing and tax status;
- invalid lead/credit rules;
- payment status;
- term, renewal, termination and transition dates.

Commercial amounts and confidential evidence do not belong in public Git.

## 4. Approval scorecard

Hard failures cannot be offset by points.

### Mandatory pass

- licence and address valid;
- program is within legal/clinical scope;
- named qualified provider;
- privacy/data contract active;
- capacity above zero;
- complaint/safety status not red;
- operator agreement active;
- patient disclosure can be truthful;
- emergency and continuity process available.

### Weighted quality score after hard pass

Suggested internal weights:

| Dimension | Weight |
|---|---:|
| clinical governance and documented protocol | 25% |
| verified outcome/process evidence | 20% |
| patient safety/complaint handling | 15% |
| capacity and SLA reliability | 15% |
| privacy/security maturity | 10% |
| patient experience/coordination | 10% |
| reporting and audit cooperation | 5% |

Commercial bid has **0%** in operator quality score. It is applied only after quality eligibility.

Thresholds remain owner-approved configuration, not public claims.

## 5. Current operator record

Provisional canonical binding:

```yaml
operator_id: expert_dental_studio
public_name: Expert Dental Studio
market: Bishkek
role: CURRENT_OPERATOR
routing_mode: DESIGNATED_OPERATOR
registry_status: ACTIVE_STRATEGY_BINDING
live_marketplace_eligibility: NOT_EVALUATED
```

`ACTIVE_STRATEGY_BINDING` records the current operating relationship; it is not evidence that full multi-operator due diligence has already been completed.

Before marketplace activation, Expert Dental must pass the same registry evidence standard as every other operator.

## 6. Suspension triggers

Immediate or urgent suspension may follow:

- licence lapse or scope conflict;
- material patient safety event;
- misleading operator/doctor claim;
- privacy/security incident;
- unauthorised data onward transfer;
- lead resale;
- repeated non-response;
- capacity misrepresentation;
- unauthorised discount/financing promise;
- refusal to provide required audit evidence;
- material complaint pattern;
- non-payment under operator contract if contract permits commercial suspension.

Commercial non-payment may stop new lead delivery but must never disrupt ongoing patient care.

## 7. Operator transition gate

### Preconditions

- replacement/backup operator approved for exact scope;
- owner decision and effective date;
- legal disclosure and consent versions updated;
- routing rule and CRM operator IDs updated;
- phone/inbox/booking test passed;
- finance/lead reconciliation ready;
- patient continuity plan approved by clinical owner.

### Lead categories at cutover

| Category | Default handling |
|---|---|
| not yet transferred | route under new rule after effective date |
| transferred but not accepted | obtain patient confirmation before reroute |
| accepted/booked | remain with accepted operator unless patient chooses otherwise |
| diagnosed/plan presented | remain with medical operator; no commercial forced transfer |
| treatment started | continuity with treating operator; transfer only clinical/legal/patient-led |
| closed/lost | retain according to contract/privacy; no automatic revival at new operator |

### Public change

Update all applicable surfaces:

- city/operator disclosure;
- legal/footer details;
- forms and consent;
- phone/WhatsApp owner;
- booking location;
- map/review source;
- privacy controller/recipient;
- invoice/payment wording;
- clinician/team claims.

## 8. Marketplace onboarding sequence

1. commercial pre-screen;
2. NDA/data-room boundary if needed;
3. licence/entity validation;
4. program and provider validation;
5. privacy/security review;
6. quality/evidence review;
7. capacity/SLA test;
8. synthetic lead acceptance test;
9. Commercial Schedule;
10. shadow routing;
11. owner GO;
12. limited live cohort;
13. 30-case/defined-horizon review;
14. expand, restrict or suspend.

## 9. Operator commercial comparison

When multiple operators pass quality gates, compare:

- qualified lead fee/bid;
- acceptance reliability;
- available capacity;
- patient travel/logistics;
- financing/payment options;
- plan SLA;
- complaint/remake risk;
- platform support cost;
- operator concentration risk.

The recommended commercial choice maximises sustainable **platform contribution after operator-support/quality cost**, not headline bid alone.

However, the signed marketplace rule may use highest qualified bid as the final allocation criterion after all hard and quality gates pass.

## 10. Audit and governance

- registry changes are versioned;
- licence expiry alerts are fail-closed;
- quality/suspension decisions record actor, evidence and scope;
- manual eligibility override requires named owner and expiry;
- no secrets or patient data in Git;
- operator contracts/evidence stay in protected storage;
- public claim status remains separate from internal registry approval.

## 11. Activation blockers

- no approved operator agreement template;
- no counsel answer on per-lead and bidding model;
- no live registry system;
- no independent licence verification workflow;
- no quality audit owner/cadence;
- no privacy/DPA templates;
- no operator transition smoke procedure;
- no billing/dispute ledger.

Until closed, this standard governs design only; Expert Dental remains the current designated operator.
