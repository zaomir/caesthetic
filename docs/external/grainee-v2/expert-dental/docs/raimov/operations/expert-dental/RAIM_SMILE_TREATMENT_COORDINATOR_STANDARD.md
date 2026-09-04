---
title: RAIM SMILE — Treatment Coordinator operating standard
status: OWNER_APPROVED_STRATEGY / CLINIC_IMPLEMENTATION_GATED
version: 1.1
created: 2026-08-29
owner: Expert Dental operations
medical_owner: Expert Dental clinical lead
decision:
  - docs/founder-notes/DEC-858_raim-smile-permanent-brand-protocol.md
  - docs/founder-notes/DEC-862_raim-smile-caesthetic-partnership-economics-and-vip-access.md
links_to:
  - docs/ssot/EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md
  - docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
  - docs/raimov/patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md
  - docs/raimov/patient-funnel/RAIM_SMILE_SECOND_OPINION_PRODUCT.md
  - docs/raimov/partnerships/GULBARA_VIP_COORDINATOR.md
  - docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md
---

# RAIM SMILE Treatment Coordinator operating standard

## 1. Mission and trigger

Координатор помогает пациенту пройти организационно и финансово понятный путь после сложной диагностики/плана. Он не продаёт медицинское решение и не заменяет врача.

Стандарт применяется к RAIM SMILE и другим complex cases Expert Dental, когда выполняется хотя бы одно условие:

- план выше `150 000 KGS`;
- участвуют более двух клинических направлений;
- врач/clinical lead пометил случай как сложный;
- требуется несколько этапов, поездок или участие второго ЛПР;
- пациент проходит RAIM SMILE Second Opinion.

Порог `150 000 KGS` уже присутствует в Patient Motivation SSOT; клиника должна подтвердить его актуальность перед operational activation.

Этот clinic Treatment Coordinator standard не смешивает две organisational roles. В approved partner/VIP journey CAESTHETIC является отдельным Partnership Network Operator и employer/compensation owner Partner & VIP Coordinator; Expert Dental остаётся medical operator. Один человек может выполнять обе роли только при явном расписании, доступах, handoff and conflict controls, но partner compensation не превращается в clinic treatment incentive.

## 2. Responsibility boundary

| Question/objection | Coordinator may do | Must escalate to |
|---|---|---|
| расписание, этапы, контакты, документы | объяснить утверждённый процесс; предложить слоты | administrator/operations if exception |
| цена, состав сметы, способ оплаты | прочитать утверждённую смету; объяснить due dates и clinic-confirmed options | authorised finance/manager for discount, refund or exception |
| «почему эта процедура», риски, альтернативы, прогноз | записать вопрос дословно; не отвечать по существу | assigned clinician |
| «можно только передние зубы/пропустить этап» | признать вопрос и поставить clinical callback | assigned clinician/consilium |
| новые симптомы, боль, отёк, кровотечение, травма | не оценивать тяжесть самостоятельно; остановить sales flow | authorised clinician/emergency route immediately |
| второй план/другая клиника | предложить structured Second Opinion без дискредитации | clinician for comparison |
| privacy/consent/data recipient | остановить передачу до проверки | privacy owner/clinic manager |
| жалоба или конфликт | зафиксировать факты без спора/обещаний | clinic manager; clinician if medical |
| запрос на Атабека | не обещать его участие | clinical lead/capacity owner |

### Hard bans

Координатор не:

- интерпретирует снимки, диагноз или план;
- рекомендует/отменяет процедуру, лекарство или врача;
- обещает результат, срок лечения, «без боли», участие Атабека или одобрение financing;
- создаёт urgency, которой нет в записи врача;
- скрывает medical operator или выдаёт RAIM SMILE за клинику;
- отправляет медицинские данные родственнику без явного согласия пациента;
- хранит PHI/снимки в marketing CRM;
- давит на пациента ради оплаты или KPI.

## 3. Operating workflow

### Before plan presentation

1. Получить handoff с `lead_id/case reference`, assigned clinician, scope, статусом плана и следующим действием.
2. Проверить контактные предпочтения и consent; определить, есть ли второй ЛПР.
3. Убедиться, что медицинские вопросы направлены врачу до презентации.
4. Подготовить только утверждённые: этапы, расписание, смету, payment options, logistics и Family Decision Brief.

### During presentation

1. Врач объясняет diagnosis/reasoning, варианты, риски, альтернативы и consequences of no treatment.
2. Координатор повторяет организационный маршрут и финансовые условия без клинической интерпретации.
3. Все новые clinical questions фиксируются дословно и возвращаются врачу.
4. Пациенту дают время и понятный next step; no-pressure outcome допустим.

### After presentation

1. В CRM остаются только разрешённые commercial/status fields; clinical note — в medical system.
2. В каждой открытой карточке есть named owner, `next_action_at` и reason for pause.
3. Family Brief передаётся пациенту; родственнику — только по explicit consent.
4. Follow-up выполняется в согласованный срок и прекращается при opt-out.
5. `REDIRECTED`, `CONTINUE_WITH_CURRENT_DOCTOR` и `NO_ACTION` закрываются без попытки изменить клинический исход.

## 4. KPI and compensation

### Compensation rule

Базовая оплата координатора не зависит от collected medical revenue. Переменная часть, если клиника её вводит, **не может** зависеть от:

- суммы плана или среднего чека;
- депозита, оплаты, collected revenue или contribution;
- treatment start/acceptance rate;
- количества «закрытых» возражений;
- снижения `REDIRECTED`, возвратов или medical declines.

Это исключает конфликт между интересом пациента и доходом координатора.

Default treatment revenue share is exactly `0%` for coordinator and CAESTHETIC. Диагноз, `Perio` assignment, стоимость/принятие/оплата treatment plan не создают fee или bonus. В partner/VIP-контуре CAESTHETIC отдельно получает и распределяет Coordination Fee и применимую Partnership Distribution & Management Fee только по `DEC-862`/Commercial Schedule; clinic Treatment Coordinator не становится стороной этого расчёта.

### Process/quality scorecard

| KPI | Initial operating standard | Evidence |
|---|---:|---|
| open cases with named owner + next action | `100%` | weekly CRM audit |
| plan-presentation follow-up completed by agreed deadline | `≥95%` | task timestamps |
| required non-clinical fields complete | `≥95%` | CRM audit |
| clinical questions answered by coordinator | `0` | conversation QA |
| clinical questions escalated with exact wording | `100%` | escalation log |
| PHI stored in marketing CRM | `0` | privacy audit |
| unauthorised discounts/promises | `0` | finance/conversation QA |
| Family Brief offered when second LPR is relevant | `≥95%` | consent + delivery status |
| patient clarity after plan | baseline first; target approved after 30 cases | short CSAT question |
| complaints acknowledged/escalated within covered shift | `100%` | incident log |

Targets are an owner-approved operating design, not evidence of current performance. Before compensation use, clinic HR/operations confirms measurement quality, owner, audit sample and labour-law treatment. Revenue and conversion may be reported at cohort level for business learning, but not used as coordinator incentive.

## 5. Escalation rules

### Priority 0 — immediate stop and route

- acute symptoms/emergency language;
- suspected privacy incident or wrong recipient;
- threat to patient/staff safety;
- request to conceal operator, diagnosis or payment.

Action: stop commercial dialogue, preserve the minimal audit trail, contact the designated clinical/privacy/manager owner through the approved urgent path. No medical advice beyond the approved emergency routing text.

### Priority 1 — same covered shift

- question may change treatment scope, sequence, risk or consent;
- patient asks to remove a clinically required stage;
- discrepancy between written plan and quoted budget;
- complaint about medical care;
- request for discount/refund/financing exception;
- request for case-specific participation of Atabek.

### Priority 2 — before next scheduled contact

- schedule/logistics exception;
- missing family artifact or consent;
- incomplete non-clinical documentation;
- unclear owner or next action.

Every escalation records: patient/case reference, exact patient wording, category, time, owner, due time, response status. Medical substance stays in the medical system.

## 6. Scripts for five common objections

Scripts are safe scaffolds. Coordinator uses confirmed names, prices and policies only.

### 1. «Это слишком дорого»

> Понимаю, сумма значительная. Я могу спокойно пройти с вами по утверждённой смете: что входит в каждый этап, когда возникает платёж и какие организационные варианты оплаты подтверждены клиникой. Если вопрос в том, можно ли медицински изменить объём или последовательность, я запишу его дословно и верну врачу — это решение принимаю не я.

Next action: finance explanation → authorised finance exception if requested; any scope change → clinician.

### 2. «Можно лечиться поэтапно или в рассрочку?»

> По способам оплаты я могу назвать только действующие условия клиники. Медицински допустимую этапность определяет врач: не каждый этап можно безопасно перенести или поменять местами. Я уточню оба ответа отдельно и вернусь к вам с одним понятным графиком — лечения и платежей.

Next action: clinician confirms sequence; authorised finance confirms terms; coordinator combines without changing either.

### 3. «Мне нужно обсудить с супругом/семьёй»

> Конечно. Я передам вам краткий Family Decision Brief: варианты, этапы, подтверждённый бюджет и вопросы для обсуждения. По умолчанию документ получаете вы. Если хотите, чтобы мы отправили его родственнику или пригласили его на разговор, назовите контакт и подтвердите согласие; медицинские детали без вашего разрешения мы не раскрываем.

Next action: deliver to patient; record explicit consent before third-party contact; book optional family call with clinician for medical questions.

### 4. «В другой клинике план/цена другие»

> Это нормально, что планы могут различаться. Я не буду оценивать чужого врача. Мы можем оформить структурированное Second Opinion: врач сопоставит исходные данные, объяснит точки расхождения, недостающую диагностику и trade-offs. После этого решение остаётся за вами.

Next action: offer Second Opinion contract; clinical comparison only by clinician.

### 5. «Можно сделать только передние зубы / убрать этот этап?»

> Это медицинский вопрос, потому что изменение объёма может повлиять на функцию, риски и прогноз. Я не могу подтвердить или отклонить такой вариант. Запишу ваш приоритет дословно и организую ответ врача; затем помогу пересобрать только расписание и бюджет по утверждённому им варианту.

Next action: same-shift clinical escalation; no quote/rebooking until clinician response where scope changes.

## 7. Activation checklist

- named coordinator, backup, clinic manager, clinical lead and finance owner;
- confirmed trigger threshold and covered hours;
- approved CRM fields, permissions and medical-system handoff;
- approved price/payment/financing/refund vocabulary;
- clinician callback SLA and emergency routing text;
- Family Decision Brief template + consent workflow;
- five-script roleplay and QA pass;
- ten synthetic/no-PHI cases audited before real use;
- 30-case baseline before revising targets or pay design;
- incident, complaint and opt-out logs operational.

Until this checklist is complete, status remains `CLINIC_IMPLEMENTATION_GATED`; the document is not proof that a coordinator service is live.
