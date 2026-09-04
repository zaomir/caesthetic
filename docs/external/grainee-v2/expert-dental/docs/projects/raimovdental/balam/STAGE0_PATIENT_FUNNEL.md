---
owner: Total + Raimov/Expert Dental operators
status: active-design / activation-gated
type: operating-design
created: 2026-08-13
applies_to: balam, raimovdental, expert-dental
links_to:
  - docs/ssot/RAIMOV_BALAM_STAGE0.md
  - docs/ssot/RAIMOV_BALAM.md
  - docs/ssot/BALAM.md
  - docs/founder-notes/DEC-817_balam-stage0-inside-expert.md
  - docs/legal/raimov/clearances/BALAM_EXPERT_BRAND_COUNSEL_2026-08-13.md
  - docs/projects/raimovdental/balam/BALAM_STAGE0_WEBSITE_TZ.md
  - docs/projects/raimovdental/balam/LAUNCH_KIT.md
---

# BALAM Stage 0 — patient funnel

## 0. Канон

Stage 0 = **BALAM как брендированное детское направление внутри Expert Dental Studio**, не отдельная клиника/юрлицо/касса/медицинский исполнитель.

`BALAM brand → lead → Expert Dental booking/medical flow → BALAM cohort → household/ortho evidence → separate clinic later`

Public activation допускается только после:
1. commercial/operational GO Атабека;
2. проверки точного legal name, лицензии, приложения, адреса и разрешённых видов помощи Expert Dental;
3. подтверждения credentials/public title Чолпон и Stage 0 service allowlist;
4. применения counsel clearance по бренду BALAM внутри существующего licensee;
5. clearance применимых требований Gate 1.5 для конкретного medical-ad surface/copy.

Если данных нет — claim/CTA fail closed.

## 1. Неизменные юридические границы

На Stage 0 у Expert Dental остаются:
- medical executor / licensee;
- patient contract;
- ИДС;
- медкарта/clinical record;
- ККМ/фискальный чек;
- персонал и клиническая ответственность;
- лицензированный адрес и фактический scope услуг.

BALAM = brand/service-line/marketing/cohort layer.

Запрещено создавать впечатление отдельного лицензированного медпровайдера BALAM.

## 2. Funnel

### Awareness
Каналы после GO: существующие семьи Expert → Instagram BALAM → signage/reception → referral network → maps/local → paid acquisition после SLA/capacity gates.

### Entry
Patient CTA использует существующий подтверждённый канал Expert Dental.

Нейтральный WhatsApp prefill:
`Здравствуйте! Хочу записать ребёнка на приём в BALAM Dental.`

Не передавать диагноз, имя ребёнка или medical PII в URL/UTM.

### Booking
- appointment owner = Expert Dental;
- `brand=BALAM`;
- source/campaign/landing_version сохраняются;
- doctor/service/address только из подтверждённого availability + licence/service scope;
- booking confirmation и legal docs = Expert Dental.

### Visit
- договор/ИДС/ККМ/медкарта = Expert Dental;
- BALAM может фигурировать как бренд направления;
- диагноз/план лечения — только clinical staff.

### Continuity / household
После визита измерять:
- next visit booked;
- recall;
- ortho handoff;
- sibling conversion;
- parent conversion;
- household revenue 30/60/90.

Никакой передачи медицинских данных между членами семьи без допустимого consent/data perimeter.

## 3. Attribution contract

Минимум:
- `brand=BALAM`;
- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `utm_content`;
- `entry_surface`;
- `landing_version`;
- `medical_executor=expert_dental`.

Marketing analytics не хранит диагнозы/medical record.

## 4. CRM cohort

Минимальные события/поля:
- booking_requested;
- booking_confirmed;
- visited/show;
- clinician;
- paid_revenue;
- next_visit_booked;
- recall_due/completed;
- ortho_handoff;
- sibling_conversion;
- parent_conversion;
- `household_id` внутри approved CRM perimeter;
- household_revenue_30/60/90;
- pediatric chair hours / utilisation.

Primary strategic KPI: **Household Revenue per BALAM Child**.

Supporting KPI: lead→booking, booking→show, show→paid treatment, next-visit-booked, recall, ortho handoff, sibling/parent conversion, capacity utilisation.

Не фиксировать жёсткие graduation thresholds до появления baseline.

## 5. Public surface

Pre-GO presentation: `https://raimovdental.com/ru/balam/` — protected/noindex, не patient funnel.

Post-GO Stage 0 patient landing: `https://balamdental.com/` по `BALAM_STAGE0_WEBSITE_TZ.md`.

Не превращать `/ru/balam/` в production patient page.

Local `.kg/.kz/.uz` domains — HOLD до отдельного GO; не покупать/не активировать автоматически.

## 6. Pricing

Источник истины: `site-raimovdental/src/config/pricing.ts` + подтверждение клиники.

В первой версии цены можно не показывать. Нельзя придумывать пакеты, скидки, ranges, `от`, гарантии или installment terms.

## 7. Paid traffic gate

Paid acquisition HOLD, пока не доказаны:
- response owner;
- response SLA;
- pediatric slot capacity;
- booking attribution;
- legal/service disclosure;
- CRM cohort capture.

Первые доказательства спроса: existing Expert families + organic/referral/signage.

## 8. Graduation

Stage 0 → отдельная BALAM clinic только после evidence pack:
- стабильный спрос;
- direct + household economics;
- capacity constraint Expert location;
- doctor #2/team depth;
- premises requirement;
- capex/opex;
- licensing structure/timeline;
- Atabek/founder GO.

Далее: `premises → СЭЗ → staffing/equipment → licence/extension → readiness → separate clinic`.
