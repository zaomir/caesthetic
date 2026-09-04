---
title: RAIM SMILE — multi-operator lead routing contract
status: PREIMPLEMENTATION / LEGAL_PRIVACY_GATED
version: 1.0
created: 2026-08-29
owner: RAIM SMILE acquisition and routing
medical_owner: selected licensed operator
decision: docs/founder-notes/DEC-859_raim-smile-current-operator-and-qualified-lead-marketplace.md
links_to:
  - docs/ssot/RAIM_SMILE_OPERATOR_NETWORK_AND_ROUTING_MODEL.md
  - docs/raimov/patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md
  - docs/raimov/operations/RAIM_SMILE_OPERATOR_REGISTRY_STANDARD.md
  - docs/legal/raimov/RAIM_SMILE_OPERATOR_MARKETPLACE_LEGAL_GATES.md
---

# RAIM SMILE — multi-operator lead routing contract

## 1. Purpose

Этот контракт расширяет исходный single-operator CRM contract. Он позволяет сохранить Expert Dental Studio текущим оператором и одновременно подготовить смену оператора, weighted rotation или commercial bidding между несколькими клиниками.

Он не активирует marketplace и не разрешает передачу данных без применимого consent/legal basis.

## 2. Current binding

```text
routing_mode = DESIGNATED_OPERATOR
market = Bishkek
current_operator_id = expert_dental_studio
marketplace_state = DESIGNED_NOT_ACTIVE
```

`expert_dental_studio` больше не является константой data model. Это текущая запись operator registry.

## 3. Required CRM fields

### Lead identity

| Field | Rule |
|---|---|
| `lead_id` | immutable |
| `brand_origin` | fixed `raim_smile` |
| `created_at` | UTC ISO 8601 |
| `program` | second_opinion / full_mouth / functional_aesthetics / adult_bite_tmj / unknown |
| `market_country`, `market_city` | required before operator selection |
| `source`, `medium`, `campaign`, `creative` | first-touch preserved |

### Routing state

| Field | Rule |
|---|---|
| `routing_mode` | DESIGNATED_OPERATOR / QUALIFIED_ROTATION / QUALIFIED_MARKETPLACE / PATIENT_SELECTED |
| `operator_pool_version` | immutable registry snapshot reference |
| `eligible_operator_ids` | system-generated IDs; no public medical detail |
| `bid_round_id` | nullable; required for marketplace |
| `selected_operator_id` | required before transfer |
| `selection_basis` | designated / patient_choice / rotation / capacity / highest_qualified_bid / manual_exception |
| `selection_reason_code` | non-clinical reason code |
| `commercial_disclosure_version` | required where applicable |
| `commercial_disclosure_at` | timestamp |
| `operator_transfer_consent_at` | timestamp |
| `operator_acceptance_at` | timestamp |
| `operator_acceptance_deadline` | timestamp |
| `operator_rejected_reason` | standard code |
| `lead_fee_event_status` | none / pending / billable / credited / disputed / void |
| `lead_fee_schedule_id` | signed commercial schedule reference, not amount if access-restricted |

### Medical boundary

| Field | Rule |
|---|---|
| `medical_operator_id` | equals selected operator after acceptance |
| `medical_record_reference` | optional access-controlled opaque reference |
| `medical_transfer_consent_at` | separate from marketing transfer where required |
| `medical_packet_status` | not_requested / requested / received / more_data_required / ready / in_person_required |

Marketing CRM must not store medical packet contents or downloadable file URLs.

## 4. Anonymous lead envelope

The bid/rotation service may process only:

- lead ID pseudonym;
- program;
- market;
- preferred language;
- availability window;
- remote/in-person preference;
- existing plan yes/no;
- travel readiness yes/no;
- non-clinical budget/payment preference only if volunteered and legally allowed.

It may not expose:

- name;
- contact;
- exact address;
- diagnosis;
- symptom narrative;
- radiograph/scan/photo;
- medical document;
- prescribed treatment detail;
- family/member contact;
- payment card or identity document.

## 5. Routing state machine

```text
NEW_RAIM_SMILE
→ CONTACTED
→ NONCLINICALLY_QUALIFIED
→ ROUTING_CONSENT_PENDING
→ OPERATOR_POOL_FILTERED
→ BID_OR_ALLOCATION_PENDING
→ OPERATOR_SELECTED
→ PATIENT_DISCLOSURE_PENDING
→ TRANSFER_CONSENTED
→ OPERATOR_ACCEPTANCE_PENDING
→ OPERATOR_ACCEPTED
→ BOOKING_PENDING
→ BOOKED
```

Terminal/exception states:

```text
NO_ELIGIBLE_OPERATOR
PATIENT_DECLINED_TRANSFER
OPERATOR_REJECTED
OPERATOR_TIMEOUT
ROUTED_URGENT_LOCAL
DUPLICATE
EXISTING_PATIENT
PRIVACY_HOLD
LEGAL_HOLD
```

After `OPERATOR_ACCEPTED`, the existing medical journey states continue under the selected operator.

## 6. Eligibility filter

The system returns `eligible=true` only if all configured rules pass:

```text
registry_status == APPROVED
licence_status == ACTIVE
program_capability == true
market_scope == true
capacity_status == OPEN
acceptance_sla_status == GREEN
privacy_contract_status == ACTIVE
quality_status in [GREEN, AMBER_ALLOWED]
commercial_schedule_status == ACTIVE
```

An operator with `SUSPENDED`, `EXPIRED`, `CAPACITY_CLOSED`, `PRIVACY_HOLD` or `QUALITY_RED` cannot bid.

## 7. Allocation rules

### DESIGNATED_OPERATOR

Use the current operator if eligible. If it fails, route to `NO_ELIGIBLE_OPERATOR` or a preapproved backup; never silently change clinic.

### QUALIFIED_ROTATION

Apply signed deterministic weights. Store rule version and selection reason.

### QUALIFIED_MARKETPLACE

1. freeze eligible pool;
2. create anonymous bid round;
3. collect valid bids before deadline;
4. reject bids from newly ineligible operators;
5. select highest qualified bid unless patient preference or signed rule overrides;
6. disclose selected operator and required commercial relationship;
7. receive patient consent;
8. reveal contact only to selected operator;
9. require acceptance within SLA;
10. if timeout/reject, ask patient before rerouting to the next eligible operator.

No operator receives identifiable contact merely for bidding.

### PATIENT_SELECTED

Patient chooses from disclosed eligible options. Commercial bid may influence display only if legally permitted and transparently disclosed; it cannot hide requested alternatives.

## 8. Billable lead definition

Default proposed event:

```text
QUALIFIED_LEAD_ACCEPTED
```

All must be true:

- unique valid contact;
- correct market/program;
- consent to selected operator transfer;
- selected operator was eligible at selection time;
- operator accepted within SLA;
- not excluded as an existing patient under signed schedule;
- no platform-caused duplicate or routing error.

Not automatically refundable:

- patient later no-shows;
- clinician redirects treatment;
- patient chooses no treatment;
- clinical plan value is lower than expected;
- financing is declined.

Potential credit/refund reasons:

- invalid/fake contact;
- duplicate within contractual window;
- wrong market/program caused by platform data;
- operator already had the patient and contract excludes existing patients;
- patient did not consent to transfer;
- platform shared outside signed scope;
- operator never received the lead because of platform failure;
- legal/privacy hold invalidated the transfer.

Final rules live in operator Commercial Schedule.

## 9. Existing patient and cannibalisation rule

Before billability, check the selected operator's privacy-safe existing-patient signal.

Recommended classes:

- `NET_NEW` — no operator relationship within agreed lookback;
- `REACTIVATED` — old inactive patient under agreed rule;
- `RAIM_ASSISTED_EXISTING` — existing patient influenced by RAIM SMILE;
- `DUPLICATE` — already active lead/case;
- `UNKNOWN` — unresolved, not billable until resolved if contract requires.

The operator must not upload its patient list into advertising platforms. Matching uses an approved protected mechanism.

## 10. Patient disclosure and choice

Before transfer, communicate at minimum:

- selected clinic's legal/public name;
- location;
- that it is the medical operator;
- that RAIM SMILE is the brand/acquisition/routing layer;
- that RAIM SMILE may receive commercial compensation where required;
- that payment did not bypass licence/quality/capacity gates;
- right to decline transfer or request available alternatives.

The final wording must be counsel-approved.

## 11. Operator acceptance SLA

Proposed starting target:

- automated receipt: immediate;
- operator accept/reject: ≤5 minutes in covered hours;
- marketplace bid validity: configurable, default 15 minutes;
- if acceptance timeout: no identifiable reroute without patient confirmation;
- every pending lead has named platform owner and `next_action_at`.

Targets remain inactive until real staffing and systems pass synthetic tests.

## 12. Audit trail

Persist immutable events:

- registry snapshot/version;
- eligible pool;
- bid request and responses;
- selected bid/rule;
- quality/capacity status at selection;
- patient disclosure version;
- transfer consent;
- operator acceptance/rejection;
- lead fee event and dispute outcome;
- manual override actor/reason.

Do not commit patient-level records to Git.

## 13. Manual override

Allowed only for:

- patient explicit choice;
- safety/emergency routing;
- disability/accessibility need;
- language/logistics requirement;
- operator outage;
- privacy/legal hold;
- documented service-recovery case.

Manual override cannot be used to route to an ineligible clinic or conceal a commercial relationship.

## 14. Activation checklist

- at least two registry-approved operators for marketplace mode;
- counsel answer on per-lead/referral/bidding compensation;
- approved public disclosure and consent text;
- operator agreements and Commercial Schedules;
- protected existing-patient/dedup mechanism;
- anonymous envelope validated to contain no PHI;
- operator capacity/API or manual acknowledgement path;
- billing/credit/dispute ledger;
- synthetic end-to-end tests;
- shadow routing with no real transfers;
- privacy/security review;
- owner GO for live market and program.

Until complete, `routing_mode=DESIGNATED_OPERATOR` and `current_operator_id=expert_dental_studio` remain active defaults.
