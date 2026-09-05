---
title: Expert Dental — Patient Conversion & Continuity Implementation
status: OWNER_APPROVED / ACTIVE IMPLEMENTATION SSOT
version: 1.0
created: 2026-09-05
last_updated: 2026-09-05
owner: project owner + Expert Dental operating leadership
applies_to: expert-dental, raimovdental, raim-smile current-operator flows
parent_strategy: docs/ssot/EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md
architecture_parent: docs/ssot/RAIMOV_ECOSYSTEM_PROJECT_ARCHITECTURE.md
infrastructure_authority: docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md
patient_motivation_authority: docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md
raim_smile_authority: docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
whole_person_authority: docs/ssot/RAIMOV_WHOLE_PERSON_BRAND.md
runtime_unit: raimovdental
runtime_root: site-raimovdental/
runtime_change: false
---

# Expert Dental — Patient Conversion & Continuity Implementation

## 0. Назначение и authority

Этот документ фиксирует owner-approved обновлённую стратегию применения конкурентного аудита к Expert Dental и переводит её из набора маркетинговых рекомендаций в единую программу внедрения по всему patient journey.

Это **узкий implementation SSOT**, а не второй общий стратегический канон. Он специализирует `EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md` по следующим вопросам:

- что менять после конкурентного аудита;
- в какой последовательности внедрять изменения;
- как разделить зоны офиса, patient operations, документов, IT, сайтов, контента, репутации и paid demand;
- какой Definition of Done считать реальным внедрением;
- что входит в персональную зону ответственности IT-архитектора.

При конфликте действует порядок:

1. medical / legal / privacy / evidence authority;
2. `RAIMOV.md`, `RAIMOV_WHOLE_PERSON_BRAND.md`, RAIM SMILE master и общая стратегия Expert Dental по своим предметам;
3. `EXPERT_DENTAL_INFRASTRUCTURE.md` по системной архитектуре и данным;
4. этот файл по implementation sequencing, RACI и adoption/impact criteria;
5. рабочие планы, задачи, макеты и runtime.

Этот документ не активирует медицинские продукты, e-sign, Second Opinion, SmileCare 12 expanded v2, paid media или новый публичный claim сам по себе.

---

# 1. Канонический вывод

Конкурентный аудит Expert Dental используется **не как список правок сайта**, а как основание для перестройки полной системы:

> **Expert Dental должна конкурировать не количеством услуг, скидками или абстрактной “современностью”, а способностью превратить сложную стоматологическую ситуацию в понятный, согласованный и доведённый до лечения план.**

Канонический путь:

```text
RAIMOV WHOLE PERSON
экспертность, доверие, клиническое мышление
        ↓
RAIM SMILE
привлечение, квалификация, Second Opinion после activation gates
        ↓
EXPERT DENTAL
диагностика, междисциплинарный план, лечение, оплата
        ↓
CONTINUITY
следующий визит, продолжение лечения, recare, рекомендация
```

Expert Dental остаётся действующим операционным бизнесом и текущим медицинским оператором RAIM SMILE в Бишкеке. RAIM SMILE не становится второй клиникой или второй медицинской CRM.

---

# 2. Что именно берём из конкурентного аудита

Применяется decision-framework `Defend / Close / Differentiate / Do not copy`.

## 2.1. Defend

Защищаем реальные сильные стороны Expert Dental:

- сложные случаи и междисциплинарное планирование;
- способность объединять ортодонтию, имплантацию, ортопедию, терапию и эстетику в один последовательный маршрут;
- клиническое мышление Атабека как архитектора сложных случаев;
- командную модель, а не зависимость от одной процедуры;
- долгосрочную continuity после первого вмешательства.

## 2.2. Close

Закрываем только разрывы, которые реально мешают пациенту выбрать и пройти маршрут:

1. противоречивые публичные сведения;
2. недостаточно проверяемого proof по врачам и кейсам;
3. разрыв сайт → обращение → запись → визит;
4. непонятный первый шаг для сложного пациента;
5. отсутствие подтверждённого follow-up после консультации или плана;
6. неполная фиксация source / outcome / next action;
7. потерю пациента при внутренней передаче между врачами;
8. недостаточно системную репутацию и service recovery.

## 2.3. Differentiate

Целевая рыночная позиция:

> **Сложный случай под контролем: сначала понять ситуацию, затем сравнить варианты, получить согласованный план и пройти лечение с одним организационным владельцем маршрута.**

Пациенту продаётся не процедура по телефону, а ясный следующий milestone:

`ясность → диагностика → варианты → последовательность → финансовая понятность → координация`.

## 2.4. Do not copy

Не копировать:

- ценовую войну и постоянные скидки;
- обезличенную premium-риторику;
- `best / №1 / лучшие врачи` без evidence;
- гарантии результата и безболезненности без допустимого клинического основания;
- оборудование как самоцель без связи с patient decision;
- массовые SEO-страницы без реального маршрута;
- неподтверждённые системные/психологические медицинские claims;
- reward-for-review;
- процент администратора или treatment coordinator от стоимости медицинского лечения.

---

# 3. P0 — Public Truth и единая фактическая база

До масштабирования paid demand действует P0 gate публичной достоверности.

Нужен **Public Truth Register**:

```text
entity / claim
→ canonical value
→ source/evidence
→ evidence class
→ medical/legal clearance where applicable
→ owner
→ public surfaces
→ last checked
→ next review
```

Минимум реестра:

- юридическое лицо / лицензиат;
- бренд и naming;
- фактические пациентские контакты;
- адреса по их реальной роли;
- часы;
- врачи и текущий roster;
- специализации / credentials;
- лицензия и применимые виды деятельности;
- услуги;
- текущие цены и price authority;
- оборудование и допустимые claims;
- гарантии / условия;
- SLA;
- кейсы;
- отзывы;
- медиа и права.

**P0 DoD:** на индексируемых и пациентских поверхностях нет тестовых врачей, вымышленных кейсов, тестовых телефонов, конфликтующих адресов или неподтверждённых медицинских/сервисных обещаний; одна и та же сущность имеет одно утверждённое значение на всех поверхностях.

---

# 4. Операционная модель внедрения

Главный переход следующего этапа:

```text
Designed → Shipped → Adopted → Impact Verified
```

`Shipped` не означает `Adopted`. Обучение, интерфейс, скрипт, интеграция или страница не считаются бизнес-результатом без доказанного использования.

Каждая интервенция фиксирует:

- constraint;
- baseline / `insufficient_evidence`;
- owner;
- зависимости;
- change;
- adoption criterion;
- impact criterion;
- evidence horizon;
- next decision.

---

# 5. Зоны ответственности клиники

## 5.1. Управление и аналитика

Цель: один operating board, а не ещё один интерфейс для сотрудников.

Еженедельный review рассматривает:

- потерянные обращения;
- обращения без source/next action;
- запись и no-show;
- диагностики;
- планы без follow-up;
- internal referrals без завершённого handoff;
- публичные factual inconsistencies;
- interventions в статусах Shipped / Adopted / Maturing / Impact Verified.

Primary CRM/MIS остаётся SQNS. Наш слой может держать rules, агрегаты, evidence, analytics и decisions, но не копирует patient CRM.

## 5.2. Офис и физический patient journey

Канонический маршрут офиса:

```text
arrival
→ identity / visit purpose / document check
→ clinician encounter
→ clear next clinical step
→ warm handoff
→ booking / coordinator / planned callback
→ patient leaves with named next action
```

Обязательные элементы:

- privacy-safe reception interaction;
- единый first-visit checklist по утверждённому клиническому scope;
- тёплая передача `врач → администратор/координатор`;
- отсутствие `сам позвонит` без owner и даты;
- понятный маршрут после плана;
- отдельное основание для clinical photo и marketing use.

Главные metrics: `NEXT_ACTION_PRESENT`, `NEXT_VISIT_BOOKED`, completed warm handoff, patient lost between clinician and reception.

## 5.3. Администратор

Guidebook, onboarding и scripts уже существуют; следующий этап — adoption.

Администратор:

- не диагностирует;
- не продаёт точное лечение по телефону;
- ведёт к безопасному следующему milestone;
- предлагает конкретные слоты;
- фиксирует исход, owner и next action;
- эскалирует clinical question врачу.

Минимальные operational data:

- source;
- new/repeat;
- intent;
- urgency;
- owner;
- call/contact outcome;
- next action;
- due date;
- refusal/pause reason where applicable.

В начале/конце смены проверяются missed calls, callbacks, карточки без следующего действия, no-show и обещания без исполнения.

KPI администратора основаны на response discipline, CRM completeness, follow-up, handoff quality и show-up support; не на проценте от medical revenue.

## 5.4. Врачи и внутренние направления

Врач первичного входа:

1. видит клинически релевантный сигнал;
2. объясняет необходимость профильной оценки без агрессивной продажи;
3. делает named handoff;
4. направление фиксируется;
5. пациент получает конкретный next step.

`Вам надо к ортодонту/имплантологу` без записи/передачи не считается завершённым handoff.

Для сложного плана стандартизируется patient-facing объяснение:

- что известно;
- что ещё нужно узнать;
- варианты;
- рекомендация врача и логика;
- риски/ограничения;
- последовательность;
- inclusions/exclusions;
- факторы стоимости;
- следующий шаг.

Capacity matrix поддерживает: направление → врач → approved scope → доступные слоты → diagnostic resource → pilot capacity → backup.

## 5.5. Treatment Coordinator

Для сложных маршрутов назначаются primary coordinator + backup + clinical escalation owner.

Координатор владеет только организационным continuity:

- расписание;
- approved documents;
- approved estimate/payment options;
- Family Decision Brief;
- сбор вопросов;
- follow-up;
- next action.

Diagnosis, indications, risks, alternatives, prognosis и treatment-scope changes всегда принадлежат врачу.

Компенсация координатора не зависит от стоимости медицинского лечения или его принятия.

## 5.6. Документооборот

До отдельного e-sign go-live используются только legally/medically approved действующие формы.

Document Register:

```text
form code
→ procedure
→ version
→ effective date
→ legal approval
→ medical approval
→ required signers
→ retention
→ original/archive location
→ superseded version
```

Разделяются как минимум:

- medical services contract;
- health history;
- procedure-specific informed consent;
- treatment plan / estimate;
- plan change;
- refusal/interruption;
- aftercare;
- privacy/data processing;
- clinical photography;
- separate marketing/media consent;
- authorised relative/second decision-maker communication.

Git не хранит patient records, signed originals, PHI или raw recordings.

## 5.7. Репутация и continuity

Review Hub — отдельный reputation loop без reward-for-review.

Каждый визит должен завершаться одним явным состоянием:

- next visit booked;
- clinician callback;
- coordinator follow-up;
- patient considering until a named date;
- treatment complete + recare;
- refusal;
- do-not-contact.

Recovery loops внедряются последовательно, по одному до adoption:

1. missed inquiry;
2. booked-not-showed;
3. diagnosis without plan presentation;
4. presented plan without next action;
5. interrupted staged treatment;
6. overdue recare.

## 5.8. Сайты, Search/Maps и Social

Роли поверхностей сохраняются:

- `expertdental.kg` — operating clinic surface: real services, real doctors, current prices, contacts, booking, cases, patient preparation/continuity;
- `raimovdental.com` — Atabek expert/Whole-Person platform; не direct-response каталог Expert Dental;
- `raimsmile.com` — acquisition/qualification/partner surface; Second Opinion и public CTA только после activation gates;
- `clinic.raimovdental.com` — utility/service routes, не отдельный competing patient brand.

Content производственная единица — не количество постов, а один проверенный clinical story, который может дать: case page → clinician video → social cut → FAQ → admin guidance, при consent/rights/medical review.

Social и сайт измеряются по переходу к правильному next step, source capture, booking, show, diagnosis, plan и treatment start — не только по просмотрам.

## 5.9. Paid acquisition

Paid scale запрещён до подтверждения funnel/CRM/SLA/capacity/economics.

Минимальный gate:

1. P0 Public Truth closed;
2. approved first step;
3. source completeness измеряется и соответствует применимому канону;
4. response SLA измеряется;
5. duty owner + backup;
6. SQNS handoff проверен;
7. capacity подтверждена;
8. после консультации есть follow-up owner;
9. coordinator назначен для complex flow;
10. доступна измеримая cohort economics или явно `insufficient_evidence` с bounded pilot;
11. medical/legal copy gates закрыты;
12. synthetic end-to-end test пройден.

Первый paid pilot: **один сегмент → одна проблема → один first step → один operator → один coordinator → один измеримый маршрут**.

---

# 6. 90-дневная последовательность

## Days 0–7 · Truth + baseline

- закрыть публичные factual conflicts;
- создать Public Truth Register;
- сверить doctors/licence/contact/pricing/claims;
- назначить zone owners;
- зафиксировать минимальный SQNS event/data contract;
- начать baseline без заявления о “плохой конверсии” до evidence.

Exit: публичная правда едина, данные для baseline собираются.

## Days 8–30 · Adoption inside clinic

- supervised admin adoption;
- daily exception review;
- office patient-journey walkthrough;
- approved internal-referral mechanics;
- warm handoff log;
- treatment-plan presentation standard;
- approved document flow;
- voice/SQNS synthetic pilot;
- baseline inquiry/visit dataset.

Exit: процессы реально используются в смене, а не только существуют в документах.

## Days 31–60 · First managed complex route

- Second Opinion exact scope/price/credit/deliverable/upload/SLA only after applicable authority confirms;
- coordinator + backup;
- synthetic no-PHI scenarios;
- bounded live cohort;
- one representative compliant patient route/page;
- cleared clinician proof and case package;
- one recovery loop adopted.

Exit: один end-to-end complex journey прослеживается от inquiry до next clinical/economic milestone.

## Days 61–90 · Measured demand

- cohort economics review;
- admin/coordinator adoption review;
- limited paid or partner pilot;
- channel comparison by downstream quality, not lead count alone;
- keep / continue observing / stop decision;
- no scale until quality/capacity/privacy/clinical guardrails remain green.

---

# 7. Core measurement set

Минимальный управленческий набор:

| Layer | Metrics |
|---|---|
| Demand | inquiries, source completeness |
| Response | first response time, contact rate |
| Booking | inquiry→booking, refusal/pause reason |
| Attendance | showed, no-show, cancellation |
| Clinical journey | diagnostics completed, plan ready/presented |
| Decision | next action after plan, pause reason |
| Economics | proposed value, paid value, contribution when available |
| Treatment | treatment started, staged continuation |
| Continuity | next visit booked, recare |
| Internal growth | internal referral → booked → showed → treatment milestone |
| Reputation | feedback cycle, recovery SLA, public-platform click/publication evidence class |
| Safety | missing consent, wrong form version, PHI incident, unsupported claim |

Нет данных = `INSUFFICIENT_EVIDENCE`, а не отрицательная baseline и не обвинение сотрудников.

---

# 8. ОТДЕЛЬНАЯ ЗОНА ОТВЕТСТВЕННОСТИ IT-АРХИТЕКТОРА

## 8.1. Миссия

IT-архитектор отвечает за то, чтобы утверждённый patient journey был **технически исполним, наблюдаем и отказоустойчив**, не создавал параллельную CRM и не размывал medical/privacy boundaries.

IT-архитектор не является “программистом по всем просьбам”. Его результат — работающая системная архитектура, принятые интеграции и доказуемый end-to-end путь.

## 8.2. Что IT-архитектор OWNS

### A. System architecture

- поддерживает каноническую карту `SQNS ↔ telephony ↔ guidebook ↔ signing ↔ analytics/evidence`;
- обеспечивает принцип `one datum → one owner`;
- не допускает появления второй patient CRM без отдельного Build-vs-Configure decision;
- определяет sync vs link/reference, system-of-record и failure behavior для каждой интеграции.

### B. SQNS integration architecture

- SQNS остаётся primary daily workspace;
- определяет минимальные поля, outcomes, events и deep-link/API/webhook contracts;
- проверяет caller recognition, patient matching, call log, next-action visibility;
- проектирует автоматизацию только после устойчивого manual route;
- не помещает clinical record в marketing/guidebook layer.

### C. Telephony

- vendor capability verification для +996, очередей, concurrency, recording и SQNS matching;
- end-to-end тест входящего звонка;
- call ID / recording locator / patient association;
- missed-call recovery event;
- recording access controls, retention implementation и retrieval test после legal/privacy rule approval;
- WhatsApp Calling возвращается в pilot только после отдельного verified SIP/PBX recording path.

### D. Administrator guidebook delivery

- обеспечивает доступность guidebook на пяти рабочих местах без PHI;
- browser side panel / pinned view — допустимый пилот;
- native SQNS placement — только после vendor confirmation;
- guidebook получает coarse intent, но не patient chart, снимки или transcript;
- контролирует versioning, rollback и доступность fallback `/render/`.

### E. E-sign technical architecture

IT-архитектор **не активирует legal forms сам**, но после legal/medical clearance отвечает за:

- managed device / kiosk / account model;
- provider integration pattern;
- template/version IDs;
- technical audit trail;
- status/readback into SQNS where supported;
- evidence export;
- integrity/backup/restore;
- device loss/recovery;
- vendor exit path.

`legal approval` и `medical approval` остаются hard dependencies outside IT authority.

### F. Data architecture and privacy-by-design

- data classification: medical / operational / marketing / evidence / secret;
- PHI boundary diagram;
- minimum-context transfer;
- no PHI in ChatGPT, guidebook analytics or public analytics;
- role-based access and named staff identities;
- technical enforcement of retention/deletion rules after counsel/owner approval;
- protected links, authentication, audit logging;
- vendor DPA/hosting/export facts recorded as verified vendor evidence, not assumptions.

### G. Event and measurement architecture

IT-архитектор обеспечивает техническую возможность получить и связать минимум:

```text
inquiry_created
first_response_at
appointment_booked
appointment_confirmed
appointment_showed
diagnostic_completed
plan_presented
treatment_started
paid_value
next_visit_booked
referral_source
feedback_cycle_started
```

Он отвечает за event definition, IDs, deduplication, timestamp/source consistency и техническую traceability.

IT-архитектор **не интерпретирует** эти события как “плохая работа администратора” или “рост выручки” без business analysis.

### H. Observability and exception routing

- integration health;
- failed webhooks/API jobs where applicable;
- missing source/next action reports where technically available;
- failed recording retrieval;
- signing/export failures;
- form delivery failures;
- alert ownership;
- audit trail.

Цель — показывать операционные исключения, а не строить тяжёлый новый dashboard ради dashboard.

### I. Vendor architecture

IT-архитектор:

- формирует vendor requirements;
- проверяет capabilities по официальным источникам/письменным ответам;
- ведёт `confirmed / vendor-gate / rejected`;
- сравнивает configure vs custom build;
- фиксирует portability и exit risk;
- не объявляет интеграцию выполненной до end-to-end acceptance.

### J. Release and technical acceptance

Для каждой технической интервенции фиксируются:

- current state;
- target state;
- owner/dependency;
- security/privacy boundary;
- test plan;
- acceptance criteria;
- rollback;
- evidence;
- adoption check.

Runtime считается готовым только после реального integration/smoke evidence, а не после mockup, task или vendor promise.

## 8.3. Что IT-архитектор НЕ OWNS

Не входит в полномочия IT-архитектора самостоятельно утверждать:

- диагноз, clinical route, показания и treatment plan;
- медицинские claims и clinical content;
- лицензионную достаточность;
- юридическую действительность consent/contract/e-sign;
- HR decisions, зарплату и дисциплину администратора;
- clinical capacity без подтверждения clinic management;
- treatment pricing/economics;
- paid-media budget и marketing positioning;
- partner economics;
- решение о том, что observed metric означает business impact.

Он реализует approved rules технически и эскалирует отсутствие authority как dependency.

## 8.4. IT architect deliverables

Обязательный пакет:

1. Current/Target System Map.
2. System-of-Record / Data Ownership Matrix.
3. SQNS integration contract.
4. Telephony end-to-end acceptance sheet.
5. Guidebook delivery/runbook.
6. E-sign technical readiness checklist.
7. Data/PHI boundary diagram.
8. Event dictionary + source/ID/timestamp rules.
9. Access-control matrix.
10. Vendor capability/evidence register.
11. Integration observability + exception runbook.
12. Backup/restore/vendor-exit proof where applicable.
13. Release/smoke/rollback record for every runtime change.

## 8.5. IT architect acceptance criteria

IT-архитекторская зона считается `Adopted`, когда:

- пять администраторов работают в SQNS без второй CRM;
- обычный входящий звонок проходит verified path `number → patient match → operator → call record → outcome/next action`;
- guidebook доступен в рабочем контексте и не получает PHI;
- critical events имеют однозначные definitions/source IDs;
- доступы персонализированы и least-privilege;
- запись/документ можно найти по разрешённому ID без ручного поиска по личным устройствам;
- failure имеет owner и recovery path;
- e-sign, WhatsApp Calling и другие gated функции не изображаются live до соответствующего acceptance;
- одна synthetic end-to-end сессия и затем bounded live acceptance проходят с evidence;
- rollback проверяем для затронутого runtime.

IT-архитекторская работа становится `Impact Verified` только если её adoption приводит к измеримому бизнес/операционному эффекту, например сокращению missed-call leakage, большей полноте source/next-action, улучшению retrieval success или уменьшению document failure. Сам факт интеграции — не impact.

---

# 9. RACI по ключевым зонам

| Zone | Accountable | Responsible / technical or operating owner | Mandatory consult |
|---|---|---|---|
| Public Truth | project/clinic owner | marketing/evidence owner | medical + legal + IT for propagation |
| Reception/admin workflow | clinic management | Patient Operations / senior admin | IT + medical owner |
| Clinical routing/internal referrals | medical owner | clinicians | Patient Operations |
| Treatment Coordinator | clinic/RAIM SMILE operating owner | coordinator + backup | medical owner + Patient Operations |
| SQNS/data model | clinic operating owner | **IT architect** | Patient Operations + SQNS vendor |
| Telephony | clinic operating owner | **IT architect** | admin lead + provider + legal/privacy |
| Guidebook delivery | Patient Operations | **IT architect for delivery**, Patient Ops for content/adoption | admin lead |
| E-sign | clinic owner | **IT architect for technical layer** | counsel + medical owner + records owner |
| Website runtime/tracking | marketing/product owner | **IT architect / delivery owner for technical implementation** | medical/legal/evidence |
| Reputation runtime | Patient Operations | IT for runtime, ops owner for recovery | legal/privacy |
| Paid acquisition | growth owner | marketing | clinic capacity + Patient Ops + IT measurement |
| Business impact decision | clinic/project owner | growth/operations analysis | IT provides evidence, not conclusion |

---

# 10. Canonical next action

До нового paid scale и до добавления новых сложных систем выполняется следующий порядок:

1. P0 Public Truth.
2. Baseline + minimum SQNS data discipline.
3. Admin adoption + exception review.
4. Warm handoff + treatment-plan continuity.
5. IT end-to-end voice/SQNS proof.
6. Coordinator bounded pilot.
7. One complex route end-to-end.
8. One recovery loop.
9. Cohort measurement.
10. Only then limited paid/partner demand and `scale / observe / stop` decision.

**Canonical principle:** не финансировать утечку и не путать поставленную систему с принятой системой или подтверждённым эффектом.
