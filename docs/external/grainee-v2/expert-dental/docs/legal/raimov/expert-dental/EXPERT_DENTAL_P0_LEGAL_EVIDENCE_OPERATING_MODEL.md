---
owner: Expert Dental licensed operator + medical director
status: PROPOSED SSOT / NOT IMPLEMENTED / COUNSEL AND EVIDENCE GATED
type: legal-evidence-operating-model
version: 0.1
created: 2026-08-29
last_updated: 2026-08-29
applies_to: expert-dental, raimov, raim-smile-current-operator
production_state: no software, form, signature or patient workflow activation is authorised by this document
sources:
  - docs/legal/raimov/expert-dental/README.md
  - docs/legal/raimov/expert-dental/DOCUMENT_REGISTER.md
  - docs/legal/raimov/expert-dental/VERSION_REGISTRY.md
  - docs/ssot/EXPERT_DENTAL_LICENSE_COMPLIANCE.md
  - docs/ssot/RAIMOV_LEGAL_GATES.md
  - docs/legal/raimov/expert-dental/LOCAL_COUNSEL_BRIEF_CONTRACTS_LICENSE_2026-08-24.md
  - docs/legal/raimov/kronis/
  - docs/ssot/EXPERT_DENTAL_WORKSPACE_MVP.md
---

# Expert Dental — P0 legal and evidence operating model

## 0. Решение, статус и граница доказанности

Это целевая операционная модель юридической и доказательственной защиты Expert Dental. Она превращает P0-документы в обязательный клинический workflow:

`идентичность → право клиники и врача → актуальное состояние здоровья → диагноз → план и смета → ИДС → лечение → рекомендации → follow-up → complaint/legal hold → evidence export`.

Главный принцип: **система не просто хранит подписанные бланки, а не даёт начать или продолжить плановое лечение без действующего юридического и клинического основания и автоматически производит проверяемую цепочку доказательств**.

Статус на 2026-08-29:

- это `PROPOSED SSOT`, а не описание уже внедрённой CRM или действующего ЭДО;
- формы Кронис — read-only источник для анализа, не шаблоны Expert Dental;
- лицензия и допуски врачей имеют открытые evidence gaps; отсутствие файла не считается доказательством отсутствия права;
- планшетная подпись не считается автоматически равной цифровой/квалифицированной подписи;
- доступность API Түндүк/ОЭП, условия подключения частной клиники и допустимость конкретного сценария не подтверждены;
- сроки хранения, точная форма ИДС, правила для несовершеннолетних, допустимый вид подписи и возвратов должны быть письменно подтверждены местным юристом КР;
- документ не разрешает включение patient data, публичного intake, реальных подписей или production workflow.

### 0.1. Fail-closed статусы

| Статус | Значение |
|---|---|
| `DRAFT` | рабочий объект, не действует |
| `COUNSEL_REQUIRED` | требуется письменное толкование юриста КР |
| `BLOCKED_EVIDENCE` | первичный документ не получен или не проверен |
| `READY_FOR_BUILD` | требования подтверждены, но система не реализована |
| `PILOT` | ограниченный клинический пилот с указанным scope |
| `ACTIVE` | утверждено, внедрено, обучено и прошло acceptance tests |
| `SUSPENDED` | применение остановлено владельцем/медицинским руководителем |
| `LEGAL_HOLD` | удаление и обычное изменение доказательств запрещены |

Ни наличие файла, ни значение `approved` в интерфейсе, ни успешная генерация PDF сами по себе не переводят объект в `ACTIVE`.

### 0.2. Текущая подтверждённая исходная точка

По имеющемуся скану подтверждены только:

- лицензиат — **ИП Раимова Камилла Саидовна**;
- лицензия — **№ 4879** от **15.01.2026**;
- адрес — **г. Бишкек, проспект Эркиндик, 43**;
- вид помощи на представленном листе — диагностика и лечение стоматологических заболеваний общей практики амбулаторно;
- мощность — **5 стоматологических кресел**.

Полный комплект приложений, актуальная выписка МЗ КР, матрица профилей, СЭЗ и полный legal credential pack врачей в SSOT отсутствуют. Поэтому ортодонтия, детская стоматология, хирургия/имплантация, ортопедия, терапия/эндо, собственная лучевая и функциональная диагностика сохраняют статусы из `EXPERT_DENTAL_LICENSE_COMPLIANCE.md`, а не считаются разрешёнными по умолчанию.

## 1. Состав P0-контура

P0 состоит из шести взаимосвязанных контуров. Каждый имеет владельца, первичный evidence и hard gate.

| Контур | Минимальный состав | P0-результат |
|---|---|---|
| Право клиники работать | полная лицензия и приложения; лицензиат; адрес; профили; кресла; СЭЗ; оборудование; рентген/КЛКТ; касса и сторона договора | каждая продаваемая услуга привязана к разрешённому профилю, месту и юридическому исполнителю |
| Право врача лечить | диплом; последипломная подготовка; сертификат специалиста; аттестация; регистрация; срок; профиль; трудовой статус; ограничения | система допускает врача только к подтверждённым услугам, адресу и дате |
| Право лечить пациента | идентификация; представитель; анкета здоровья; жалобы/ожидания; диагноз; альтернативы; план; смета; ИДС; договор; согласования | до процедуры есть конкретное, датированное и подписанное основание |
| Доказательство лечения | запись каждого визита; исполнитель; фактическая процедура; материалы/партии; снимки; изменения плана; рекомендации; неявки; follow-up | по каждому эпизоду восстанавливается хронология без устных пробелов |
| Спор и возврат | intake; adverse-event triage; legal hold; единый spokesperson; клиническая проверка; расчёт; решение; settlement; выдача копий | доказательства заморожены, решение отделено от ретро-редактирования карты |
| Data/security | RBAC; MFA; versioned forms; tamper-evident audit; WORM/archive; backup; retention; vendor controls; evidence export | доступ, изменение, подпись, выдача и удаление воспроизводимы и проверяемы |

### 1.1. P0-реестр форм

Единственный authority по ID и составу документов — `DOCUMENT_REGISTER.md`; единственный authority по разрешённым редакциям — `VERSION_REGISTRY.md`. Этот operating model не создаёт параллельные `ED-FRM-*` коды.

| Workflow bundle | Канонические ID | Содержание |
|---|---|---|
| Contract/identity | `ED-CON-001`, `ED-PAT-001`, `ED-PAT-007` | рамочный договор, identity и представитель/minors |
| Health/diagnosis/plan | `ED-PAT-002`–`ED-PAT-005` | анкета здоровья, план/смета, информирование, change-plan |
| Refusal | `ED-PAT-006` | отказ от диагностики, рекомендации, вмешательства или продолжения |
| Informed consent | `ED-IDS-001`–`ED-IDS-010` | отдельные ИДС по профилю/вмешательству |
| Clinical evidence | `ED-CLI-001`–`ED-CLI-005` | карта, визит, procedure/material trace, aftercare, correction/addendum |
| Privacy/data | `ED-PRV-001`–`ED-PRV-007` | notice, legal bases, rights, retention, processors/transfers, incidents |
| Medical/marketing media | `ED-MKT-001`–`ED-MKT-004` | медицинская фиксация отдельно от публикации/marketing/UGC |
| Complaint/refund | `ED-CMP-001`–`ED-CMP-005` | intake, legal hold, review, расчёт и settlement |
| Licence/credentials | `ED-LIC-*`, `ED-STF-*` | licence dossier/service matrix и индивидуальные doctor dossiers |
| Policies/vendors/insurance/audit | `ED-POL-*`, `ED-VEN-*`, `ED-INS-*`, `ED-AUD-*` | внутренние правила и доказательства поддерживающего контроля |

Каждая действующая форма обязана иметь поля из `VERSION_REGISTRY.md`, включая ID, version, effective date, owner, legal/medical reviewers, language, SHA256, required signers, retention class, status, supersedes и next review. До внесения утверждённой версии в реестр patient-facing форма не может быть назначена пациенту; на 2026-08-29 реестр фиксирует `NO APPROVED FORMS`.

## 2. Patient journey и hard gates

### 2.1. Машина состояний

```text
LEAD_MINIMAL
  → PATIENT_IDENTIFIED
  → REPRESENTATION_VALIDATED
  → CASE_OPENED
  → CLINIC_SERVICE_CLEARED
  → PROVIDER_CLEARED
  → HEALTH_FORM_CURRENT
  → DIAGNOSIS_RECORDED
  → PLAN_AND_ESTIMATE_SIGNED
  → CONSENT_SIGNED
  → FINANCIAL_AUTHORISED
  → TREATMENT_ALLOWED
  → ENCOUNTER_CLOSED
  → AFTERCARE_DELIVERED
  → FOLLOW_UP_CLOSED
  → CASE_CLOSED

Любой complaint/adverse event:
  → COMPLAINT_OPEN
  → LEGAL_HOLD
  → REVIEW / RESOLUTION / EVIDENCE_EXPORT
```

### 2.2. Обязательные gate checks

| Переход | Машинная проверка | Hard stop |
|---|---|---|
| `LEAD → PATIENT` | уникальный patient ID; подтверждённые ФИО/дата рождения/контакт; способ проверки | нет лечения по карточке-дублю или неустановленному лицу |
| `PATIENT → CASE` | представитель и полномочия для несовершеннолетнего/недееспособного; язык и коммуникационные потребности | нет подписи неуполномоченного сопровождающего |
| `CASE → SERVICE_CLEARED` | лицензиат, адрес, профиль, мощность/кресло, оборудование/СЭЗ, service code | неподтверждённая связка блокирует плановое назначение |
| `SERVICE → PROVIDER_CLEARED` | специальность, сертификат/аттестация/регистрация, срок, трудовой статус, ограничения | врач не назначается вне подтверждённого профиля или после срока |
| `PROVIDER → HEALTH_CURRENT` | анкета заполнена; critical alerts просмотрены врачом; актуализация перед рисковым вмешательством | администратор не может снять clinical alert |
| `HEALTH → DIAGNOSIS` | осмотр/диагностика/прогноз и врач-автор | ИДС не подписывается пустым или до осмотра |
| `DIAGNOSIS → PLAN` | альтернативы; этапы; `входит / не входит`; цена/основание изменения; сроки/прогноз | нельзя брать оплату за несогласованный этап |
| `PLAN → CONSENT` | окончательный текст формы; версия; patient + doctor signature; дата/время; вопросы/ответы | нет процедуры по общему согласию вместо профильного ИДС |
| `CONSENT → TREATMENT` | все предыдущие gates действуют на фактическое время процедуры; consent не отозван | проверка повторяется непосредственно перед началом |
| `TREATMENT → ENCOUNTER_CLOSED` | что сделано; кем; время; зуб/область; материалы/партии; осложнения; снимки; следующий шаг | незакрытый визит не считается завершённым и попадает в supervisor queue |
| `ENCOUNTER → AFTERCARE` | рекомендации, способ и доказательство доставки, red flags, follow-up | значимое вмешательство не закрывается без aftercare record |
| `COMPLAINT → LEGAL_HOLD` | trigger, scope, custodian, frozen objects, hold timestamp | запрет удаления, overwrite и обычного исправления |

### 2.3. Исключение для неотложной помощи

Административный hard stop не должен препятствовать клинически необходимой экстренной стабилизации. `BREAK_GLASS` доступен только квалифицированному врачу/медицинскому руководителю, требует reason code, минимально необходимого scope, автоматического уведомления и проверки не позднее следующего рабочего дня. Он не разрешает плановое лечение вне лицензии или профиля.

## 3. Data model и audit trail

### 3.1. Принцип CRM-first без смешивания контуров

CRM является оркестратором статусов, задач и handoff, но **не универсальным хранилищем медицинских данных**.

- marketing/RAIM SMILE CRM: источник, consent на контакт, программа, стадия, owner, SLA, booking/show и коммерческий outcome;
- clinical legal record: диагноз, анамнез, снимки, клинические фото, ИДС, план, процедуры, лекарства, врачебные записи;
- finance: счёт, чек, оплата, возврат, но не клиническая история;
- evidence vault: финальные подписанные документы, audit и legal-hold copies.

Между контурами передаются только opaque IDs, минимально необходимые статусы и контролируемые ссылки. Диагноз, снимки, КЛКТ, полный анамнез и clinical narrative не попадают в partner/marketing CRM.

### 3.2. Канонические сущности

| Сущность | Ключевые поля |
|---|---|
| `patient_identity` | `patient_id`, verified attributes, verification method, verified_at, source |
| `representative` | person, authority type/evidence, patient link, validity dates |
| `clinical_case` | case ID, patient, service line, location, status, opened/closed timestamps |
| `encounter` | case, appointment, provider, location/chair, start/end, note status |
| `service_definition` | service code, description, required licence profile, device/room rules, required forms |
| `licence_artifact` | licence number, licensee, issuer, address, dates, file hash, source, verification status |
| `licence_scope` | licence artifact, profile/service, location, capacity, valid dates, restrictions |
| `provider_credential` | provider, credential type, specialty, issuer, number, issue/expiry, verified source |
| `provider_clearance` | provider + service + location + period, decision, evidence set, approver |
| `form_template_version` | form code/version, content hash, approvals, effective dates, language, scope |
| `document_instance` | patient/case/form version, rendered hash, status, signed object URI, supersedes |
| `signature_event` | signer identity/role, method, document hash, timestamp, device/session, evidence |
| `treatment_plan` | diagnosis, alternatives, prognosis, stages, version, status |
| `estimate_line` | stage/service, included/excluded, price, currency, assumptions, approval |
| `procedure_record` | encounter, procedure/service code, tooth/site, provider, outcome, complications |
| `material_device_trace` | manufacturer, product, lot/serial, expiry, patient passport handoff |
| `diagnostic_asset` | type, capture time, author/device, hash, clinical link, storage class |
| `aftercare_delivery` | version, recipient, channel, sent/received/acknowledged timestamps |
| `complaint_case` | intake, allegations, severity, owner, deadlines, communications, outcome |
| `legal_hold` | trigger, scope, custodians, objects, start/release authority, status |
| `refund_case` | requested amount, services delivered, documented expenses, calculation, approvals, payment evidence |
| `access_grant` | subject, role, purpose, scope, granted/revoked/expiry, approver |
| `audit_event` | actor, role, action, object/version, server time, device/session, reason, hashes, correlation ID |
| `export_manifest` | case, included objects/versions, hashes, created by/at, purpose, recipient, delivery evidence |

### 3.3. Неизменяемость

`immutable` означает не обещание, что администратор БД технически никогда ничего не сможет изменить, а комбинацию проверяемых мер:

1. подписанный экземпляр хранится как write-once object;
2. content hash вычисляется после финального render и относится ко всему документу;
3. audit events append-only и выводятся во второе независимое хранилище;
4. версия не перезаписывается: исправление создаёт `superseding_version` или датированное дополнение;
5. удаление запрещено при `LEGAL_HOLD`;
6. backup и hash-verification регулярно тестируются;
7. экспорт содержит manifest и контрольные суммы каждого объекта.

Отдельный PNG подписи, пригодный для повторной вставки, хранить и использовать запрещено.

### 3.4. Минимальный audit event

```json
{
  "event_id": "uuid",
  "occurred_at_utc": "RFC3339",
  "actor_id": "staff-or-patient-id",
  "actor_role": "doctor|patient|admin|system|counsel",
  "action": "view|create|sign|supersede|export|hold|release|break_glass",
  "object_type": "document_instance",
  "object_id": "uuid",
  "object_version": "3",
  "before_hash": null,
  "after_hash": "sha256:...",
  "reason_code": "CONSENT_SIGNATURE",
  "device_id": "managed-device-id",
  "session_id": "uuid",
  "correlation_id": "case-or-workflow-id"
}
```

Серверное UTC-время является каноном; интерфейс дополнительно показывает местное время и timezone.

## 4. Роли и ответственность

| Роль | Отвечает | Не вправе |
|---|---|---|
| Лицензированный исполнитель / owner | юридическое лицо/ИП, бюджет, назначение владельцев, final risk acceptance | объявлять evidence gap закрытым без первичного документа |
| Медицинский директор / главврач | clinical scope, формы ИДС, врачебные допуски, emergency override, clinical complaint review | делегировать клиническое решение администратору |
| Licensing & Credential Owner | реестр лицензии/врачей, проверка источников, сроки, clearance matrix | утверждать собственный credential без второго reviewer |
| Treating doctor | диагноз, информирование, план, ИДС, encounter record, рекомендации | подписывать за пациента или лечить вне clearance |
| Администратор | identity intake, запись, выдача копий, tasks, non-clinical handoff | снимать clinical alerts, обещать результат/возврат, менять врачебную запись |
| Treatment Coordinator | организационный и финансовый путь, подтверждённые next steps | интерпретировать диагноз, риски или медицинские возражения |
| Finance | чеки, сверка оплаты, расчёт и исполнение утверждённого возврата | решать клиническую обоснованность претензии |
| Privacy/Security Owner | RBAC, vendors, incidents, retention register, access reviews | читать clinical records без purpose-bound доступа |
| Complaint Owner | intake, timeline, communications, legal hold coordination | единолично менять карту или признавать ответственность |
| External KG counsel | применимое право, формы, подпись, retention/refund/minors, legal-hold release advice | подменять медицинское решение |
| System administrator | availability, backup, keys, monitoring | иметь обычный клинический доступ; privileged access только logged/break-glass |
| Internal auditor | выборочная проверка gates, logs, exports, segregation of duties | исправлять проверяемые записи |

### 4.1. Separation of duties

- form author ≠ final legal approver;
- credential subject ≠ credential verifier;
- refund requester ≠ sole refund approver ≠ payment executor;
- system administrator ≠ legal-hold release authority;
- treating doctor may add a correction, but cannot overwrite the signed/original note;
- marketing consent owner has no authority над medical photo consent.

## 5. Электронное подписание и планшет

### 5.1. Обязательная ceremony

1. Система идентифицирует пациента/представителя и врача.
2. Пациенту показывается весь финальный документ с номером версии и языком.
3. Врач объясняет диагноз, альтернативы, риски, план и отвечает на вопросы.
4. Фиксируется acknowledgement: документ прочитан/объяснён, вопросы и ответы.
5. До подписи вычисляется canonical document hash.
6. Пациент подписывает именно эту версию; врач подписывает получение ИДС/свою запись.
7. Система фиксирует server timestamp, method, device, session и signer identity.
8. После подписи PDF и structured data блокируются от overwrite.
9. Пациент получает копию; канал, delivery и получение фиксируются.
10. Любое изменение — новая версия/дополнение с новой подписью, если это требует scope формы.

### 5.2. Допустимые уровни только после counsel mapping

| Уровень | Возможный механизм | Статус |
|---|---|---|
| A | стилус на managed tablet + очная identity verification + full-document binding + hash/audit | `COUNSEL_REQUIRED`; не считать ОЭП |
| B | подтверждённый patient account + OTP/другой согласованный идентификатор + document binding | `COUNSEL_REQUIRED`; риск зависит от идентификации и соглашения |
| C | цифровая подпись через признанный trust service/удостоверяющий центр | `INTEGRATION_REQUIRED`; проверить сертификат и validation evidence |
| D | Түндүк/ОЭП identity/signature | `INTEGRATION_GATE`; доступность и договор не подтверждены |

Старая практика по Закону КР №128 «Об электронной подписи» не может использоваться как текущий legal basis без повторной проверки: официальный ЦБД Минюста помечает этот закон утратившим силу; текущую конструкцию необходимо сопоставить с Цифровым кодексом КР №178 и специальными медицинскими требованиями.

### 5.3. Түндүк/ОЭП integration gate

До выполнения всех пунктов интеграция не включается в critical patient journey:

1. официальный владелец сервиса письменно подтверждает доступный сценарий для частной клиники;
2. получены актуальные API/SDK, sandbox, требования к сертификатам и validation;
3. подписан необходимый договор/оферта/соглашение и назначены стороны;
4. counsel подтверждает применимость к ИДС и конкретным документам;
5. privacy/security review закрывает data flow, логирование, хранение и трансграничность;
6. проверены revocation, timestamp, архивная проверка подписи и evidence export;
7. есть SLA, мониторинг, outage/fallback и reconciliation;
8. пройдены negative tests: чужая identity, expired certificate, revoked certificate, modified PDF, replay, offline failure.

### 5.4. Offline fallback

До устойчивого digital flow применяется counsel-approved бумажная форма с уникальным номером. После восстановления она сканируется, хэшируется и связывается с case record; оригинал хранится по утверждённому графику. Скан не превращает бумажную подпись в цифровую и не разрешает уничтожить оригинал без retention clearance.

## 6. License/doctor clearance и hard stops

### 6.1. Clearance decision

Плановая процедура доступна только если одновременно истинны:

```text
licensed_operator.active
AND licence.active_on(procedure_time)
AND licence.address_covers(location)
AND licence.profile_covers(service)
AND facility_clearance.covers(room_or_chair)
AND equipment_clearance.covers(required_device)
AND provider.employment_or_contract.active
AND provider.credential_covers(service)
AND provider.registration.active_on(procedure_time)
AND no_provider_restriction
AND required_forms.active_and_signed
```

Неизвестное значение трактуется как `BLOCKED_EVIDENCE`, а не как `true`.

### 6.2. Credential lifecycle

| Статус | Поведение |
|---|---|
| `VERIFIED_ACTIVE` | разрешены только mapped services/location/date |
| `EXPIRING` | предупреждение по настраиваемым 90/60/30-дневным окнам; назначение после expiry невозможно |
| `BLOCKED_MISSING` | нет записи/primary evidence — нет нового планового назначения |
| `BLOCKED_EXPIRED` | срок истёк — немедленный hard stop |
| `BLOCKED_SCOPE` | credential не покрывает услугу — hard stop |
| `SUSPENDED` | hard stop независимо от даты документа |
| `REVIEW_REQUIRED` | конфликт источников — hard stop до второго reviewer |

Система ежедневно пересчитывает clearance и повторно проверяет его в момент записи, подтверждения визита и начала процедуры. Назначенные визиты, затронутые новым блоком, попадают в supervised continuity queue, а не исчезают.

### 6.3. P0 evidence pack для закрытия текущих gaps

1. Лицензия №4879 целиком и все приложения.
2. Актуальная выписка/карточка МЗ КР.
3. Документ по адресу Эркиндик, 43 и действующее СЭЗ.
4. Матрица `профиль → услуга → кабинет/кресло/оборудование`.
5. Список специалистов в лицензионном контуре.
6. По каждому врачу — полный credential stack и действующий трудовой/договорный статус.
7. По иностранным дипломам — применимый документ признания.
8. По собственному рентгену/КЛКТ — разрешения, СЭЗ, оборудование и персонал; при внешнем исследовании — договор и licensed-provider route.
9. Сверка договора, чека, сайта и CRM с одним лицензированным исполнителем.
10. Письменная counsel matrix: `service → covered / not covered / document required / action`.

## 7. Complaint, adverse event, legal hold и refund workflow

### 7.1. Trigger events

Legal hold создаётся при любом из событий:

- письменная/устная претензия о качестве, вреде, согласии, цене или возврате;
- adverse event или сообщение о возможном вреде;
- запрос полной карты/снимков в контексте спора;
- chargeback, претензия страховой, адвокатский/судебный/регуляторный запрос;
- угроза публикации не является самостоятельным основанием признать претензию, но не отменяет hold при наличии спора;
- внутреннее расследование возможной ошибки, удаления или несанкционированного доступа.

### 7.2. Workflow

1. `INTAKE`: любой сотрудник создаёт запись без оценки виновности; пациент получает подтверждение получения по утверждённому каналу.
2. `SAFETY_TRIAGE`: врач оценивает срочность и continuity; помощь не ставится в зависимость от спора.
3. `LEGAL_HOLD`: система фиксирует scope, запрещает deletion/overwrite и создаёт preservation snapshot.
4. `OWNER`: назначается один Complaint Owner и один patient-facing spokesperson.
5. `CLINICAL_REVIEW`: отдельный медицинский review исходной карты, диагностики, плана, ИДС и факта лечения.
6. `FINANCIAL_REVIEW`: отдельно сверяются согласованные этапы, чеки, фактически оказанные услуги и документированные расходы.
7. `DECISION`: ответ, remediation, продолжение/передача лечения, refund/no refund и основания.
8. `SETTLEMENT`: только утверждённая counsel форма; возврат сам по себе не маркируется признанием нарушения.
9. `EXPORT/DELIVERY`: выдача пациенту/юристу фиксируется manifest, recipient и proof of delivery.
10. `CLOSE`: hold снимает только назначенная authority после counsel/retention check; закрытие не удаляет evidence автоматически.

### 7.3. Запрет ретро-редактирования

После complaint/hold исходная карта, подписи, изображения, сообщения, финансовые документы и логи не перезаписываются. Уточнение врача оформляется отдельной записью с текущей датой, автором, причиной, ссылкой на исходную запись и собственным hash. Backdating запрещён.

### 7.4. Refund controls

- ни администратор, ни врач не обещают сумму возврата;
- расчёт показывает этапы, фактически оказанные услуги, только документированные расходы и уже полученные платежи;
- clinical conclusion и commercial settlement — разные поля/решения;
- минимум два согласования: authorised business owner + finance; для medical harm/high-value/regulatory case — counsel/insurer gate;
- платёж связывается с refund decision, расчётом, банковским/кассовым evidence и уведомлением пациента;
- сроки ответа/возврата берутся только из утверждённой counsel policy, не из интерфейсного default.

### 7.5. Evidence export

Стандартный пакет содержит:

```text
00_manifest.json + 00_manifest.pdf
01_identity_and_authority/
02_contract_and_finance/
03_health_and_diagnostics/
04_plan_estimate_consents/
05_encounters_materials_aftercare/
06_communications_and_delivery/
07_complaint_review_resolution/
08_audit_log/
09_hashes.sha256
```

Manifest фиксирует case ID, purpose, requester, exporter, time, source objects, versions, omissions, redactions, hashes и delivery. Экспорт не даёт получателю больше данных, чем разрешено purpose/authority.

## 8. Security, privacy и retention

### 8.1. Минимальные controls

- уникальные staff accounts, MFA и запрет общих логинов;
- role- and purpose-based access, clinic/location/service scope;
- managed tablets: MDM, encryption, screen lock, remote wipe, no local patient gallery/files;
- encryption in transit/at rest и отдельное управление ключами;
- privileged access только just-in-time с audit;
- tamper-evident central logs и независимый WORM/archive copy;
- ежедневные backups и регулярная проверка восстановления;
- vendor register, processor terms, breach duties, subprocessor/data-location disclosure;
- data minimisation и отделение marketing CRM от medical record;
- контролируемая передача лаборатории/рентген-центру/элайнер-производителю только по purpose и approved route;
- запрет clinical files в личных WhatsApp, email, облаках и camera roll сотрудников;
- incident response с сохранением evidence и уведомлениями по counsel-approved правилам;
- квартальный access review и немедленный offboarding.

### 8.2. Retention register

Для каждого класса данных задаются:

`record_class`, `legal_basis`, `purpose`, `owner`, `system_of_record`, `start_trigger`, `retention_period`, `hold_override`, `disposal_method`, `reviewer`, `source_of_rule`.

До письменного ответа юриста КР:

- не придумывать единый срок хранения;
- не включать автоматическое удаление clinical/legal evidence;
- не обещать пациенту удаление медицинской записи, если этому препятствует обязанность хранения;
- маркетинговые данные и clinical record не наследуют сроки друг друга;
- любой legal hold приостанавливает плановое уничтожение;
- каждое уничтожение после clearance оставляет disposal event без содержимого удалённой записи.

### 8.3. Минимальные resilience targets для выбора платформы

| Контроль | Целевой acceptance target |
|---|---|
| Backup RPO | не более 15 минут для новых подписей/записей либо документированный compensating control |
| Restore RTO | не более 4 часов для critical record access |
| Availability | не менее 99.9% в рабочее время, с offline fallback |
| Hash verification | 100% подписанных объектов при создании и каждом export |
| Access review | ежеквартально и при каждом увольнении/смене роли |
| Restore drill | не реже одного раза в квартал до full rollout |

Targets являются требованиями закупки/архитектуры, а не утверждением о текущем SLA.

## 9. Rollout 30/60/90 дней

### Дни 0–30 — truth, ownership, manual safe lane

1. Назначить accountable owner, меддиректора, Licensing/Credential Owner, Privacy/Security Owner и Complaint Owner.
2. Получить P0 evidence pack из §6.3; каждый документ проверить по первичному источнику и hash.
3. Построить матрицы `услуга → лицензия → адрес/кресло/оборудование → врач → required forms`.
4. Получить counsel answers по ИДС, подписи, minors, data, retention, complaint/refund и электронным копиям.
5. Создать form registry; выбрать одну каноническую версию каждой формы; старые формы перевести в `RETIRED` без удаления.
6. Немедленно внедрить ручной минимум после counsel confirmation: дата/время/врач в ИДС, актуальная health form, signed estimate, change/refusal/aftercare records.
7. Описать paper fallback, legal hold и evidence export; провести tabletop complaint drill.
8. Выбрать платформу по fit-gap, security, exportability и data location; не покупать только ради tablet signature.
9. Установить interim owner decision для `BLOCKED_EVIDENCE` услуг; отсутствие документа не закрывать устным подтверждением.

**Exit 30:** владельцы назначены; gaps инвентаризированы; нет неизвестной услуги/врача; counsel backlog и service matrix подписаны; manual complaint hold работает.

### Дни 31–60 — controlled pilot

1. Настроить identity, RBAC/MFA, form versioning, document hash, append-only audit и evidence vault.
2. Импортировать только verified licence/credential data с вторым reviewer.
3. Запустить shadow gates на всех сервисах и enforced gates на одном полностью cleared pilot-scope.
4. Провести tablet signing pilot только после counsel approval конкретной ceremony.
5. Настроить patient copy delivery, aftercare confirmation и duplicate identity handling.
6. Включить complaint trigger → legal hold → export на synthetic cases.
7. Провести негативные тесты подписи, expired credential, wrong provider/profile, modified PDF, unauthorised access, device loss и outage.
8. Обучить пилотную команду; critical questions — 100%, общий pass — не менее 90%.

**Exit 60:** один end-to-end cleared service проходит без ручных пробелов; все gate bypass видимы; export и restore drill успешны; реальных patient errors P0 нет.

### Дни 61–90 — phased enforcement

1. Расширять только на услуги со статусом `COVERED` и врачей `VERIFIED_ACTIVE`.
2. Включить enforced hard stops при booking, visit confirmation и procedure start.
3. Перенести действующие формы на version registry; запретить obsolete template selection.
4. Включить expiry alerts, access review, legal-hold dashboard и retention register.
5. Провести независимый sample audit и второй complaint/evidence-export drill.
6. Подтвердить vendor/DPA/security, backup restore и offboarding.
7. Решить Түндүк/ОЭП gate отдельно; отсутствие интеграции не блокирует counsel-approved fallback.
8. Неподтверждённые профили остаются `BLOCKED_EVIDENCE`, а не включаются для достижения rollout KPI.

**Exit 90:** P0 работает на всех и только cleared services; unsupported scope физически не запускается; audit/export воспроизводимы; owners подписали go-live record.

## 10. Acceptance criteria и KPI

### 10.1. Release acceptance — все обязательны

- 100% active service codes имеют однозначную связь с licensed operator, адресом, профилем, facility/equipment requirements и provider specialty;
- 100% active providers имеют verified primary credential evidence и clearance dates;
- 100% patient-facing forms выбираются только из active version registry;
- 100% P0 signatures связаны с полным document hash, signer identity, method и server timestamp;
- 0 reusable signature images и 0 overwrite подписанного документа;
- 100% плановых процедур проходят повторный clearance непосредственно перед началом;
- 100% plan changes имеют новую согласованную версию до изменённого этапа;
- 100% significant procedures имеют encounter note, material/device trace по применимости и aftercare delivery evidence;
- 100% complaint/adverse-event triggers создают legal hold и preservation event;
- 100% standard evidence exports проходят checksum verification;
- 100% break-glass events имеют reason, минимальный scope и review следующего рабочего дня;
- 0 patient/clinical data в marketing/partner CRM, кроме явно разрешённых non-clinical statuses;
- успешны restore, device-loss, unauthorised-access, credential-expiry, modified-document и legal-hold tests;
- counsel approval и go-live record приложены к release evidence.

### 10.2. Операционные KPI после запуска

| KPI | Цель | Красный сигнал |
|---|---:|---|
| clearance completeness | 100% active services/providers | любой `UNKNOWN` в active scope |
| hard-stop bypass | 0 обычных; только logged `BREAK_GLASS` | bypass без review |
| signed-document integrity | 100% hash-valid | любой hash mismatch |
| obsolete form use | 0 | подписана retired/superseded form |
| encounter closure by next shift | ≥ 98%; P0 procedures 100% | незакрытая P0 запись |
| aftercare delivery | 100% applicable encounters | нет proof of delivery |
| complaint hold coverage | 100% triggers | объект удалён/изменён после trigger |
| standard evidence export | ≤ 2 часа и 100% checksum-valid | missing object/version/hash |
| credential expiry prevention | 100% blocked at expiry | визит начат после expiry |
| access review completion | 100% quarterly/offboarding | active orphan/shared account |
| staff certification | ≥ 90% overall, 100% critical | доступ к P0 workflow без pass |
| backup/restore | quarterly pass | неподтверждённый restore |

KPI не должны улучшаться путём снятия hard stops, удаления complaint triggers или исключения сложных случаев из denominator.

## 11. Acceptance test pack

До `ACTIVE` обязательны как минимум сценарии:

1. попытка назначить ортодонтическую услугу врачу без mapped credential;
2. действующий врач, но профиль отсутствует в licence scope;
3. правильный профиль, но другой адрес/кабинет;
4. истечение credential между записью и процедурой;
5. несовершеннолетний без подтверждённого представителя;
6. ИДС подписан до диагноза или на старой версии формы;
7. изменение PDF после подписи;
8. изменение плана/цены без нового согласования;
9. emergency `BREAK_GLASS` и последующий review;
10. complaint через телефон с немедленным hold;
11. попытка удалить объект под hold;
12. датированное дополнение врача без overwrite;
13. refund с undocumented expense;
14. evidence export с redaction и неизменными source hashes;
15. потеря планшета и remote wipe;
16. outage digital signing и бумажный reconciliation;
17. revoked/expired digital certificate, если используется trust service;
18. увольнение сотрудника и немедленный revoke;
19. duplicate patient identity и controlled merge;
20. восстановление case record из backup с повторной hash verification.

## 12. Реестр открытых решений

| Gate | Что требуется | Владелец | Статус |
|---|---|---|---|
| `G-LIC-01` | полный файл лицензии №4879 и service matrix | Licensing Owner + counsel | `BLOCKED_EVIDENCE` |
| `G-CRED-01` | legal credential pack всех активных врачей | Medical Director + Licensing Owner | `BLOCKED_EVIDENCE` |
| `G-FORM-01` | counsel-approved договор/ИДС/plan/refusal/minors/refund forms | KG counsel + Medical Director | `COUNSEL_REQUIRED` |
| `G-SIGN-01` | допустимость tablet ceremony для ИДС и договора | KG counsel | `COUNSEL_REQUIRED` |
| `G-DATA-01` | lawful basis, notices, processors, transfer, rights | Privacy Owner + KG counsel | `COUNSEL_REQUIRED` |
| `G-RET-01` | retention schedule по record class | KG counsel + Medical Director | `COUNSEL_REQUIRED` |
| `G-COMP-01` | complaint/refund SLA, settlement and legal-hold release | KG counsel + owner | `COUNSEL_REQUIRED` |
| `G-PLAT-01` | platform security/export/WORM/backup fit-gap | Security Owner | `NOT STARTED` |
| `G-TUND-01` | официальный API/договор/сценарий Түндүк/ОЭП | Owner + service operator + counsel | `INTEGRATION_GATE` |

## 13. Источники и правило актуализации

Внутренние authority:

- `EXPERT_DENTAL_LICENSE_COMPLIANCE.md` — подтверждённые реквизиты и open gaps;
- `LOCAL_COUNSEL_BRIEF_CONTRACTS_LICENSE_2026-08-24.md` — вопросы по формам, ИДС, лицензии, врачам, complaint/refund;
- `RAIMOV_LEGAL_GATES.md` — counsel и execution gates;
- `kronis/` — read-only source archive, не approved templates.

Официальные источники, перепроверенные 2026-08-29:

- Цифровой кодекс КР №178: `https://cbd.minjust.gov.kg/3-48/edition/35412/ru?lang=ru`;
- ввод в действие Цифрового кодекса: `https://cbd.minjust.gov.kg/4-5604/edition/35394/ru`;
- Положение о лицензировании к постановлению №678, редакция 03.06.2026: `https://cbd.minjust.gov.kg/230000631/edition/23775/ru`;
- реестр нормативных актов Агентства по защите персональных данных: `https://reestr.dpa.gov.kg/ru/npa`;
- Закон КР №128 «Об электронной подписи» в ЦБД отмечен утратившим силу: `https://cbd.minjust.gov.kg/4-2446/edition/36816/ru`.

Перед каждым изменением формы, signature method, retention или licence clearance ответственный обязан перепроверить актуальную редакцию и приложить counsel/evidence. Этот SSOT обновляется только после решения владельца и не подменяет первичные документы.

---

*v0.1 · 2026-08-29 · proposed target operating model; no patient-data, signature, Tүндүк/ОЭП or production activation.*
