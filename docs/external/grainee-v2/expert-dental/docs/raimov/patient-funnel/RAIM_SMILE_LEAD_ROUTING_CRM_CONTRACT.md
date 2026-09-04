---
title: RAIM SMILE — lead routing and CRM contract
status: PREIMPLEMENTATION
version: 1.2
created: 2026-08-29
updated: 2026-08-29
owner: RAIM SMILE acquisition + current/selected operator operations
decision:
  - docs/founder-notes/DEC-856_raim-smile-patient-acquisition-segment.md
  - docs/founder-notes/DEC-859_raim-smile-current-operator-and-qualified-lead-marketplace.md
links_to:
  - docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
  - docs/ssot/RAIM_SMILE_OPERATOR_NETWORK_AND_ROUTING_MODEL.md
  - docs/raimov/patient-funnel/RAIM_SMILE_MULTI_OPERATOR_ROUTING_CONTRACT.md
  - docs/raimov/operations/RAIM_SMILE_OPERATOR_REGISTRY_STANDARD.md
  - docs/raimov/clinic-growth/RAIM_SMILE_PROFITABILITY_INPUT.md
  - docs/raimov/patient-funnel/RAIM_SMILE_SECOND_OPINION_PRODUCT.md
  - docs/raimov/operations/expert-dental/RAIM_SMILE_TREATMENT_COORDINATOR_STANDARD.md
---

# RAIM SMILE — lead routing and CRM contract

## 1. Current binding

| Key | Canonical value |
|---|---|
| Acquisition brand | `raim_smile` |
| Current market | `Bishkek` |
| Current medical operator | `expert_dental_studio` |
| Routing mode | `DESIGNATED_OPERATOR` |
| Dedicated phone display | `+996 500 700 200` |
| Dedicated phone E.164 | `+996500700200` |
| WhatsApp deeplink base | `https://wa.me/996500700200` |
| Contract state | `PREIMPLEMENTATION` |

RAIM SMILE создаёт и квалифицирует маркетинговое обращение. Текущий selected operator — Expert Dental Studio — ведёт медицинскую запись, диагностику, лечение, медицинский договор, medical record, оплату и кассу.

`expert_dental_studio` — current operator record, а не вечная константа модели. После DEC-859 CRM должна поддерживать смену operator и multi-operator routing через отдельный contract.

`PREIMPLEMENTATION` означает: business binding принят, но фактическая активация SIM/WhatsApp Business, inbox access, CRM write, duty owner и production test lead ещё не подтверждены. Номер нельзя считать работающим каналом только потому, что он записан в документе.

## 2. Identity and attribution invariants

1. Каждая карточка получает immutable `lead_id` при первом сохранённом обращении.
2. `brand_origin=raim_smile` сохраняется до финального commercial outcome и не заменяется именем клиники при handoff.
3. `medical_operator_id` обязателен после operator acceptance. До выбора хранится `current_operator_id=expert_dental_studio` только для current designated mode.
4. История `medical_operator_id` и routing events append-only; operator change не переписывает прошлое.
5. UTM/source данные записываются при первом касании; последующие касания могут добавлять `last_touch_*`, но не перезаписывают first-touch.
6. Дубликаты связываются с исходной карточкой; новый `lead_id` для одного и того же обращения не создаётся без документированной причины.
7. Пересланное сообщение без CRM card, owner, selected operator and next action не является handoff.
8. Patient data не является собственностью RAIM SMILE или operator; access and transfer follow consent/legal basis.

## 3. Minimum marketing record

| Field | Rule |
|---|---|
| `lead_id` | required; generated once |
| `created_at` | required; UTC ISO 8601 |
| `brand_origin` | required; fixed `raim_smile` |
| `market_country`, `market_city` | required before operator selection |
| `routing_mode` | DESIGNATED_OPERATOR / QUALIFIED_ROTATION / QUALIFIED_MARKETPLACE / PATIENT_SELECTED |
| `current_operator_id` | default `expert_dental_studio` in current Bishkek mode |
| `selected_operator_id` | required before identifiable transfer |
| `selection_basis` | designated / patient_choice / rotation / capacity / highest_qualified_bid / manual_exception |
| `operator_pool_version` | required in multi-operator modes |
| `commercial_disclosure_version`, `commercial_disclosure_at` | required where applicable |
| `operator_transfer_consent_at` | required before transfer |
| `operator_acceptance_at` | required before booking handoff completion |
| `contact_phone` or `messenger_id` | one required; access-controlled |
| `consent_at`, `consent_version`, `consent_channel` | required before marketing follow-up |
| `program` | `second_opinion` / `full_mouth` / `functional_aesthetics` / `adult_bite_tmj` / `unknown` |
| `source`, `medium`, `campaign`, `creative` | source required; others nullable |
| `landing_page`, `first_touch_at` | required where digital |
| `first_response_at`, `owner` | required after contact attempt |
| `pipeline_status`, `status_changed_at` | required |
| `next_action_at` | required for every open status |
| `booked_at`, `booked_provider` | required when booked |
| `show_status` | required after appointment time |
| `commercial_outcome` | nullable until known; no clinical detail |
| `lost_reason` / `redirected_reason_code` | required on terminal status |
| `lead_fee_event_status` | none / pending / billable / credited / disputed / void |

Forbidden in marketing CRM: radiographs, intraoral files, medical images, diagnosis, full anamnesis, clinical free text, passport/identity documents, payment-card data, medical packet download URLs and multi-clinic PHI broadcast.

For `program=second_opinion`, marketing CRM may store only a non-sensitive medical-system reference/status (`packet_requested`, `packet_received`, `ready`, `more_data_required`, `in_person_required`). It must not store the packet, signed download URLs or a clinical summary.

## 4. Routing and clinical pipeline

### Current designated-operator path

```text
NEW_RAIM_SMILE
→ CONTACTED
→ NONCLINICALLY_QUALIFIED
→ OPERATOR_SELECTED (expert_dental_studio)
→ TRANSFER_CONSENTED
→ OPERATOR_ACCEPTED
→ BOOKED
→ CONFIRMED
→ SHOWED
→ DIAGNOSTIC_COMPLETE
→ PLAN_READY
→ PLAN_PRESENTED
→ FOLLOW_UP
→ DEPOSIT
→ TREATMENT_STARTED
→ WON / LOST / REDIRECTED
```

### Future multi-operator insertion

```text
NONCLINICALLY_QUALIFIED
→ ROUTING_CONSENT_PENDING
→ OPERATOR_POOL_FILTERED
→ BID_OR_ALLOCATION_PENDING
→ OPERATOR_SELECTED
→ PATIENT_DISCLOSURE_PENDING
→ TRANSFER_CONSENTED
→ OPERATOR_ACCEPTANCE_PENDING
→ OPERATOR_ACCEPTED
```

Full rules: `RAIM_SMILE_MULTI_OPERATOR_ROUTING_CONTRACT.md`.

## 5. Transition owners

| Transition | Accountable role | Required evidence |
|---|---|---|
| `NEW_RAIM_SMILE → CONTACTED` | RAIM SMILE duty owner | `first_response_at`, owner |
| `CONTACTED → NONCLINICALLY_QUALIFIED` | RAIM SMILE intake | program + market + non-clinical need + next action |
| `QUALIFIED → OPERATOR_POOL_FILTERED` | routing platform | registry snapshot and eligible pool |
| `OPERATOR_SELECTED → TRANSFER_CONSENTED` | RAIM SMILE coordinator | selected operator disclosure + patient consent |
| `TRANSFER_CONSENTED → OPERATOR_ACCEPTED` | selected operator intake owner | acceptance timestamp and operator reference |
| `OPERATOR_ACCEPTED → BOOKED` | selected operator administrator | slot, provider, booking reference |
| `BOOKED → SHOWED` | selected operator administrator | attended/missed status |
| `SHOWED → DIAGNOSTIC_COMPLETE` | authorised operator role | event only; clinical content stays in operator medical system |
| `PLAN_READY → PLAN_PRESENTED` | authorised operator role | event date only |
| `PLAN_PRESENTED → DEPOSIT` | selected operator finance/admin | receipt/payment reference under approved access policy |
| `DEPOSIT → TREATMENT_STARTED` | authorised operator role | treatment-start event only |
| any → `LOST` | current owner | standard lost reason + date |
| any → `REDIRECTED` | operator clinical role | non-diagnostic reason code; no pressure to keep in RAIM SMILE |

## 6. Handoff acceptance

A handoff to any operator is accepted only when all are present:

- `lead_id`, `brand_origin=raim_smile`, program, market and source;
- selected operator ID and registry eligibility at selection time;
- consent record appropriate to marketing/operator transfer;
- named platform current owner;
- explicit next action and deadline;
- operator acknowledgement or booking reference.

If the selected operator cannot accept the lead, the card remains with the platform owner and receives `next_action_at`. Rerouting requires patient disclosure/confirmation under the multi-operator contract; silent transfer is forbidden.

## 7. SLA contract

Target after staffing validation:

- machine acknowledgement: immediate;
- first human response: within 5 minutes during covered hours;
- platform escalation ceiling: 30 minutes;
- selected operator accept/reject: within 5 minutes during covered hours;
- two concrete slots when clinically and operationally possible;
- every open card has `next_action_at`.

SLA measurement remains `NOT_ACTIVE` until platform and current operator name duty owners, covered hours, escalation owner and backup. Outside covered hours the patient must receive honest hours/next-response wording, not a false instant-service claim.

## 8. Source taxonomy

Allowed first-touch values:

```text
direct
organic_instagram
paid_meta
paid_google_search
referral
partner
website
whatsapp_direct
phone_direct
unknown
```

`unknown` is a valid temporary value but must be resolved before closure when evidence exists. Source completeness gate for scaling: at least 95% of closed cards have a non-unknown source.

## 9. Commercial outcome and lead-fee boundary

Marketing analytics may receive only the minimum events and approved commercial fields needed for attribution, operator routing and cohort economics. Detailed treatment records remain in the selected operator's medical system.

Join key rules:

- marketing CRM uses `lead_id`;
- operator systems use internal patient/case references;
- the crosswalk is access-controlled and never committed to Git;
- reporting exports replace patient identifiers with anonymised `case_id`;
- operator clinical contribution follows `RAIM_SMILE_PROFITABILITY_INPUT.md`;
- platform fee/bid economics follow `RAIM_SMILE_OPERATOR_NETWORK_AND_ROUTING_MODEL.md`.

Recommended billable event is `QUALIFIED_LEAD_ACCEPTED`, not form submission. Final definition, exclusions, credits and dispute rules require a signed operator Commercial Schedule and counsel approval.

No percentage of medical revenue or treatment value is enabled by this CRM contract.

## 10. Existing patient / duplicate check

Use privacy-safe classes:

- `NET_NEW`;
- `REACTIVATED`;
- `RAIM_ASSISTED_EXISTING`;
- `DUPLICATE`;
- `UNKNOWN`.

The operator must not provide patient lists to advertising platforms. Existing-patient matching requires an approved protected mechanism and data-processing authority.

## 11. Follow-up and consent

- D0/D1/D3/D7/D14 sequence is a hypothesis, not active automation.
- Opt-out stops marketing follow-up immediately.
- No diagnosis, guarantee, discount pressure or invented urgency in messages.
- No patient-list ad audiences without a documented lawful basis.
- No onward transfer to another operator without new/valid consent where required.
- Retention/deletion periods remain blocked until privacy/legal approval.

## 12. Failure states

| Code | Meaning | Required action |
|---|---|---|
| `CHANNEL_NOT_VERIFIED` | SIM/WhatsApp/inbox not proven | no public CTA |
| `NO_DUTY_OWNER` | platform/operator response owner absent | SLA inactive; no paid traffic |
| `CRM_WRITE_UNVERIFIED` | card cannot be created/read back | no form/public intake activation |
| `CONSENT_CONTRACT_OPEN` | matching/transfer wording or retention not approved | no operator transfer |
| `OPERATOR_NOT_ELIGIBLE` | registry/licence/program/quality/capacity failure | exclude operator; no bid/transfer |
| `OPERATOR_TIMEOUT` | selected operator did not accept in SLA | retain platform ownership; ask before reroute |
| `CAPACITY_UNVERIFIED` | program slots/provider capacity unknown | no campaign scaling |
| `ATTRIBUTION_INCOMPLETE` | source completeness below 95% | fix capture before scaling |
| `MEDICAL_DATA_LEAK` | clinical/PHI data entered into marketing CRM or bid round | stop processing and invoke privacy incident procedure |
| `COMMERCIAL_DISCLOSURE_MISSING` | paid routing disclosure absent where required | no transfer/billability |
| `LEGAL_MARKETPLACE_HOLD` | CPL/bidding/referral model not cleared | current designated mode only |

## 13. Activation acceptance test

The contract may move from `PREIMPLEMENTATION` to `ACTIVE_CURRENT_OPERATOR` only after a non-patient test proves:

1. inbound call and WhatsApp reach the intended inbox;
2. authorised users can access the inbox and named owners cover declared hours;
3. a test lead creates exactly one CRM card with the binding fields;
4. first-touch attribution survives handoff to the current operator;
5. current operator acceptance, booking acknowledgement and next action are readable;
6. no clinical/PHI field is required in marketing CRM;
7. opt-out and access controls work;
8. test data is labelled and removed/archived under approved QA rule;
9. Second Opinion test proves secure medical upload without PHI/file leakage into marketing CRM;
10. remote Kazakhstan remains disabled until cross-border medical/privacy/legal approval is recorded.

Marketplace activation additionally requires every item in `RAIM_SMILE_MULTI_OPERATOR_ROUTING_CONTRACT.md`, including at least two approved operators, counsel clearance, anonymous envelope, shadow routing, disclosure/consent, billing/dispute ledger and owner GO.
