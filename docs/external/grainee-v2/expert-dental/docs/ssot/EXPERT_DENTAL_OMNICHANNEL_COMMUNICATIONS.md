---
owner: Founder + Expert Dental operations
status: active — architecture approved for evaluation; vendor integration not yet implemented
type: ssot
layer: 2
version: 1.1
created: 2026-08-30
last_updated: 2026-08-30
applies_to: raim-smile, expert-dental, raimovdental
links_to:
  - docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md
  - docs/ssot/RAIMOV_ACCESS_CONTINUITY_SYSTEM.md
  - docs/ssot/TELEGRAM_BOT_DESK_STANDARD.md
  - docs/raimov/patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md
---

# EXPERT DENTAL / RAIM SMILE — OMNICHANNEL COMMUNICATIONS SSOT

## 0. Decision summary

This is the detailed communications component SSOT. The clinic-wide authority is `docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md`.

For the Expert Dental pilot:

- SQNS is the primary CRM/MIS and administrator interface;
- use managed Beeline VATS/SIP plus native SQNS/«Простые звонки» integration for ordinary calls;
- use an official WABA/BSP for WhatsApp messaging and WhatsApp Business Calling;
- do not build a custom Communication Router, call board, caller popup, Telegram Desk or second CRM;
- the generic router/render model in this document is future reference only and cannot expand the pilot scope.

Vendor-specific elements below retain epistemic status `CONFIRMED_PUBLIC_DOCS`, `PROPOSED` or `VENDOR_CONFIRMATION_PENDING`.

---

## 1. Five-operator operating model

The clinic needs five administrator operator seats and at least five concurrent call legs, subject to a measured capacity test.

This is not a requirement for five independent business identities, brands, CRMs or public numbers. Public PSTN numbers, WABA senders, operator seats and concurrent call legs are separate configuration dimensions.

Minimum access model:

- five named SQNS administrator accounts;
- one permitted telephony endpoint/headset per active operator;
- supervisor access only where operationally required;
- call and signing actions attributable to a named administrator.

---

## 2. Messaging architecture

### 2.1. Target

Для рабочих production-номеров, переведённых на official WhatsApp Business Platform, WAHA не является основным transport.

Target flow:

`WhatsApp message → Meta WhatsApp Business Platform → BSP/API (Infobip/Twilio or equivalent) → Communication Router → CRM + Telegram Desk + Web Render`

WAHA остаётся допустим только для номеров, которые не переведены на official WABA, например temporary/test/legacy sessions.

### 2.2. Conversation model

System of record должен хранить как минимум:

- `conversation_id`;
- `channel`;
- `line_id` / WhatsApp sender identity;
- `customer_phone`;
- `crm_contact_id`;
- `crm_lead_or_deal_id`;
- `assigned_to`;
- `status`;
- `unread`;
- `last_inbound_at`;
- `last_outbound_at`;
- `priority`;
- message audit events.

Telegram и Web Render получают один Presentation/ViewModel contract и не содержат независимую бизнес-логику.

---

## 3. Voice architecture

### 3.1. Ordinary mobile/PSTN calls

`CONFIRMED_PUBLIC_DOCS`: Beeline Kyrgyzstan offers SIP trunk / virtual PBX capabilities for business telephony, including multichannel call handling; exact contract for the clinic remains to be procured and tested.

Preferred ordinary-call path:

`Existing +996 business number → Beeline voice/SIP/PBX layer → queue/recording → operator softphone/headset`

### 3.2. WhatsApp Business Calling

`CONFIRMED_PUBLIC_DOCS`: official WhatsApp Business Calling can be delivered by supported BSP/CPaaS providers into SIP/PBX infrastructure. Infobip and Twilio are confirmed candidates from public documentation; 8x8 is technically compatible but migration/onboarding for existing +996 sender requires vendor confirmation.

Preferred WhatsApp-call path:

`WhatsApp caller → Meta WABA Calling → BSP/CPaaS → SIP → PBX → queue/recording → operator softphone/headset`

WAHA call events are not a production recording solution; WAHA does not provide the required audio media bridge/recording path for this architecture.

---

## 4. Preferred managed voice model

### 4.1. Clinic pilot

Use existing managed products rather than building PBX media or routing software:

- **Beeline Kyrgyzstan VATS/SIP candidate** — ordinary +996 voice, queues and recording;
- **native SQNS / «Простые звонки» bridge** — caller recognition, patient history popup and call log;
- **Infobip preferred candidate or Twilio alternate** — official WABA messaging and WhatsApp Business Calling;
- **SQNS** — call disposition, task and patient/visit workflow.

The administrator uses the native SQNS popup and one headset. The number of public numbers is independent of five operator seats.

### 4.2. Open integration gates

`VENDOR_CONFIRMATION_PENDING`:

- Beeline VATS/SIP support for clinic numbers, five operator seats/concurrent legs, recording and retrieval;
- native SQNS/«Простые звонки» matching for +996 formats and call IDs/links;
- whether the selected BSP can deliver WhatsApp Business Calling through SIP/PBX with caller identity, queueing, recording and events.

Requests were sent on 2026-08-30. Do not close a gate until written confirmation and an end-to-end test exist.

---

## 5. Call state ownership

The managed PBX/VATS owns media and low-level call state. SQNS owns the clinic-facing patient association, call log and disposition where the native integration supports it.

The pilot does not implement a custom call state manager. At minimum the vendor path must preserve:

- incoming, answered, missed and ended events;
- operator identity;
- caller number and call ID;
- recording status and protected retrieval;
- missed-call callback ownership.

---

## 6. Operator UX

The native SQNS popup is the primary caller context. The guidebook runs in a pinned browser side panel and contains no patient data.

A custom supervisor call board or general operator render is out of pilot scope. It may be reconsidered only after measured operational need and an approved architecture change.

---

## 7. CRM integration

SQNS is the clinic CRM/MIS and system of record for patient, visit, schedule, call disposition and treatment status.

Inbound flow:

1. managed voice layer receives the call;
2. native integration normalises the number and asks SQNS to resolve the patient;
3. SQNS shows caller history or the unknown-caller path;
4. the administrator books, changes or routes the request;
5. the administrator records one short outcome in SQNS.

Do not create a second lead card or duplicate the outcome elsewhere. Automatic API/webhook enrichment remains a vendor gate.

---

## 8. Recording and QA

### 8.1. Ordinary and WhatsApp voice

Target production requirement: voice should terminate through a PBX/voice layer that supports recording.

For WhatsApp Business Calling, recording is expected only when the call is delivered through official WABA Calling into SIP/PBX/CPaaS media infrastructure that supports recording.

Do not claim WAHA records WhatsApp call audio.

### 8.2. Future QA pipeline

Approved architectural direction, not yet implemented:

`Call recording → transcription → summary → administrator QA → CRM evidence`

Potential QA signals include greeting, issue discovery, booking attempt, objection handling, promised follow-up, disposition and missed-call recovery. These are operational quality controls, not medical diagnosis.

---

## 9. Provider findings as of 2026-08-30

### Infobip

Status: `PREFERRED_CANDIDATE / CONFIRMED_PUBLIC_DOCS`.

Public docs support:

- existing WhatsApp sender use/onboarding;
- WhatsApp Business Calling;
- SIP trunk/PBX delivery scenarios;
- call recording in voice infrastructure;
- Kyrgyzstan is not in the known published country restriction set referenced during research.

Commercial quote and exact +996 sender onboarding remain procurement items.

### Twilio

Status: `VALID_ALTERNATIVE / CONFIRMED_PUBLIC_DOCS`.

Public docs support:

- migration of existing WhatsApp senders;
- WhatsApp Business Calling;
- Programmable Voice/SIP integration;
- recording.

Twilio has relatively transparent public per-minute platform pricing and is a useful price benchmark.

### 8x8

Status: `TECHNICALLY_COMPATIBLE / VENDOR_CONFIRMATION_PENDING`.

Public docs support WhatsApp Calling → SIP/PBX/contact-center scenarios, but the exact migration/onboarding path for existing +996 numbers was not confirmed from public documentation.

### Telnyx

Status: `NOT_PREFERRED_FOR_EXISTING_PLUS996`.

Current public onboarding documentation reviewed during research ties WhatsApp Calling setup to Telnyx-owned/on-account numbers; therefore it is not the preferred path when preservation of existing Kyrgyz +996 identities is a hard requirement, unless Telnyx confirms another supported migration/porting path.

### CommPeak

Status: `TURNKEY_PBX_ALTERNATIVE`.

Public materials indicate cloud PBX, WhatsApp calls, routing, recording and analytics. Use as a possible turnkey alternative if Beeline VATS + external WhatsApp SIP integration is unavailable or operationally inferior.

---

## 10. Commercial findings — do not treat as contracted pricing

All prices below are research snapshots, not agreed commercial terms and must be re-verified before procurement.

- Twilio: public WhatsApp Calling platform pricing was used as a benchmark; recording and SIP legs are separately priced.
- Infobip: public add-on pricing exists for recording/voice features, but the exact WhatsApp Calling/SIP transport commercial quote for our +996 setup requires sales confirmation.
- Beeline Kyrgyzstan: public business SIP/VATS pricing exists, but exact clinic configuration, number portability/routing and external SIP interoperability require contract confirmation.
- CommPeak: public cloud PBX tiers exist; WhatsApp-specific full production cost still requires quote/validation.

No universal cost estimate is canonical until vendor quote + expected monthly minutes + concurrency are known.

---

## 11. Open gates before implementation

1. Beeline confirmation of external SIP delivery from Infobip into Beeline VATS.
2. Exact onboarding/migration procedure for each existing +996 WhatsApp number into WABA without unwanted loss of required PSTN identity/function.
3. Confirm same-number coexistence requirements for ordinary PSTN calling and WhatsApp Business Platform identity for each operator/number.
4. Confirm recording support and retrieval API for both PSTN and WhatsApp-call legs.
5. Confirm maximum concurrency for 5 lines and operator queue behavior.
6. Confirm PBX API/webhooks sufficient for Router/CRM/Render integration.
7. Define retention, consent/notification and access policy for call recordings before production recording is enabled.
8. Pilot one number end-to-end before migrating all five.

---

## 12. Canonical target diagram

```text
PSTN / mobile +996 ── Beeline voice/SIP ───────────────┐
                                                       │
WhatsApp Calling ─ Meta WABA ─ BSP/Infobip ─ SIP ─────┤
                                                       ▼
                                                   PBX/VATS
                                             queue / recording
                                                       │
                                                       ▼
                                              Communication Router
                                            ┌──────────┼──────────┐
                                            │          │          │
                                           CRM     Web Render  Telegram Desk
                                            │          │          │
                                            └──────────┼──────────┘
                                                       ▼
                                                   Operator
                                                 one headset

WhatsApp messages ─ Meta WABA ─ BSP API ───────────────→ Router
```

This diagram is the target architecture direction. Vendor-specific arrows marked by open gates are not production facts until confirmed and tested.
