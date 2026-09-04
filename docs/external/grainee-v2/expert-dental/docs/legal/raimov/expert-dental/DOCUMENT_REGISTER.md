---
owner: Expert Dental legal owner
status: active-register / counsel-approved-package / no-in-use-forms
type: legal-document-register
created: 2026-08-29
last_updated: 2026-08-30
applies_to: expert-dental, raimov
---

# Expert Dental — master-register юридических документов

Реестр определяет минимальный комплект. Канонический статус конкретной редакции, её effective date и допуск к новым подписаниям появляются только в `VERSION_REGISTRY.md`.

Письменные тексты 27 документов P0-пакета одобрены местным юристом по сообщению владельца от 30.08.2026; границы решения зафиксированы в [`package/APPROVAL_RECORD_2026-08-30.md`](package/APPROVAL_RECORD_2026-08-30.md). Юридическое согласование не закрывает медицинское утверждение шаблона, лицензионный профиль услуги, допуск конкретного врача, tablet QA и per-form activation. Поэтому в реестре пока нет статуса `IN_USE`.

## P0 — право лечить и доказать конкретный эпизод

| ID | Папка | Документ | Когда нужен | Статус |
|---|---|---|---|---|
| ED-CON-001 | `contracts/` | Рамочный договор платных стоматологических услуг | один раз до начала платных услуг; обновление при смене стороны/условий | COUNSEL_APPROVED / TABLET_QA_PENDING |
| ED-PAT-001 | `patient-forms/` | Регистрационная/identity form пациента | до первой медицинской записи | DRAFT_REQUIRED |
| ED-PAT-002 | `patient-forms/` | Анкета состояния здоровья и лекарств | до первого вмешательства; актуализация по trigger/перед рисковыми вмешательствами | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-PAT-003 | `patient-forms/` | План лечения + смета `входит / не входит` | после диагностики, до принятия плана | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-PAT-004 | `patient-forms/` | Лист информирования/вопросов пациента | при обсуждении существенных альтернатив/рисков | DRAFT_REQUIRED |
| ED-PAT-005 | `patient-forms/` | Change-plan form + дополнительная смета | любое существенное изменение метода, объёма, стоимости, срока или прогноза | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-PAT-006 | `patient-forms/` | Refusal form | отказ от вмешательства, диагностики, рекомендации или продолжения лечения | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-PAT-007 | `patient-forms/` | Minor/representative verification form | пациент несовершеннолетний либо действует представитель | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-IDS-001 | `informed-consent/` | ИДС: диагностика/общая практика | перед соответствующим эпизодом | DRAFT_REQUIRED |
| ED-IDS-002 | `informed-consent/` | ИДС: терапия/реставрация | перед соответствующим эпизодом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-IDS-003 | `informed-consent/` | ИДС: эндодонтия | перед соответствующим эпизодом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-IDS-004 | `informed-consent/` | ИДС: хирургия/удаление | перед соответствующим эпизодом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-IDS-005 | `informed-consent/` | ИДС: имплантация | перед хирургическим этапом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-IDS-006 | `informed-consent/` | ИДС: костная пластика/синус-лифтинг | отдельное вмешательство, не скрывать внутри имплантации | BLOCKED_EVIDENCE / DRAFT_REQUIRED |
| ED-IDS-007 | `informed-consent/` | ИДС: анестезия/седация | по применимому виду обезболивания | DRAFT_REQUIRED |
| ED-IDS-008 | `informed-consent/` | ИДС: ортопедия | перед соответствующим этапом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-IDS-009 | `informed-consent/` | ИДС: ортодонтия | перед соответствующим эпизодом | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-IDS-010 | `informed-consent/` | ИДС: детская стоматология | с корректным representative/assent workflow | BLOCKED_EVIDENCE / DRAFT_REQUIRED |
| ED-CLI-001 | `clinical-records/` | Медицинская карта стоматологического пациента | весь период лечения и хранения | DRAFT_REQUIRED |
| ED-CLI-002 | `clinical-records/` | Запись визита/вмешательства | каждый визит, в дату оказания | DRAFT_REQUIRED |
| ED-CLI-003 | `clinical-records/` | Протокол операции/имплантации + material/device traceability | каждое применимое вмешательство | BLOCKED_EVIDENCE |
| ED-CLI-004 | `clinical-records/` | Aftercare/recommendations + подтверждение выдачи | после вмешательства | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-CLI-005 | `clinical-records/` | Correction/addendum record | только для новой датированной корректирующей записи | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |

## P0/P1 — данные, фото, претензии и внутренний контроль

| ID | Папка | Документ | Назначение | Статус |
|---|---|---|---|---|
| ED-PRV-001 | `privacy-data/` | Уведомление об обработке персональных данных | прозрачность целей, ролей, мест, сроков, получателей и прав | COUNSEL_APPROVED / PRIVACY_IMPLEMENTATION_GATE / TABLET_QA_PENDING |
| ED-PRV-002 | `privacy-data/` | Реестр целей, данных и правовых оснований | data map: clinical, fiscal, service, marketing, security | DRAFT_REQUIRED |
| ED-PRV-003 | `privacy-data/` | Согласие на обработку, когда consent — применимое основание | отдельное, понятное, доказуемое и отзывное | DRAFT_REQUIRED |
| ED-PRV-004 | `privacy-data/` | Политика прав субъекта/принципала данных | доступ, исправление, ограничение, возражение, удаление где применимо | DRAFT_REQUIRED |
| ED-PRV-005 | `privacy-data/` | Retention/deletion/legal-hold schedule | сроки по категориям и исключения из удаления | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
| ED-PRV-006 | `privacy-data/` | Реестр обработчиков/передач/локаций | CRM, облако, лаборатория, мессенджеры, analytics, cross-border | DRAFT_REQUIRED |
| ED-PRV-007 | `privacy-data/` | Incident/breach response plan | обнаружение, containment, оценка, уведомление, evidence | DRAFT_REQUIRED |
| ED-MKT-001 | `marketing-consents/` | Согласие на медицинскую фото-/видеофиксацию | документирование лечения; не разрешает рекламу | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-MKT-002 | `marketing-consents/` | Отдельное согласие на публикацию/маркетинг | конкретные каналы, материалы, срок, право отзыва | COUNSEL_APPROVED / TABLET_QA_PENDING |
| ED-MKT-003 | `marketing-consents/` | Согласие/релиз на отзыв, testimonial или UGC | не обусловливает лечение, скидку или возврат | DRAFT_REQUIRED |
| ED-MKT-004 | `marketing-consents/` | Отзыв/изменение marketing consent | прекращение будущего использования и журнал исполнения | DRAFT_REQUIRED |
| ED-CMP-001 | `complaints-disputes/` | Реестр претензий и acknowledgment | единый intake, owner, SLA, связи с картой | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-CMP-002 | `complaints-disputes/` | Legal-hold notice/checklist | блокирует удаление/ретро-изменение evidence | DRAFT_REQUIRED |
| ED-CMP-003 | `complaints-disputes/` | Clinical/legal review form | факты, timeline, документы, независимый reviewer | DRAFT_REQUIRED |
| ED-CMP-004 | `complaints-disputes/` | Расчёт возврата/корректировки | услуги, оплаты, прямые расходы, основания, approvals | DRAFT_REQUIRED |
| ED-CMP-005 | `complaints-disputes/` | Complaint/refund settlement form | письменное урегулирование без незаконного отказа от прав | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-POL-001 | `internal-policies/` | Гарантийная политика | гарантия vs прогноз, условия, exclusions, statutory rights | DRAFT_REQUIRED |
| ED-POL-002 | `internal-policies/` | Политика informed-consent workflow | timing, роли, проверка понимания, запрет подписания пачкой | DRAFT_REQUIRED |
| ED-POL-003 | `internal-policies/` | Политика ведения/исправления медкарты | contemporaneous entry, addendum, audit log, legal hold | DRAFT_REQUIRED |
| ED-POL-004 | `internal-policies/` | Политика несовершеннолетних | identity, authority, consent/assent, privacy, emergency path | DRAFT_REQUIRED |
| ED-POL-005 | `internal-policies/` | Политика доступа и врачебной тайны | role-based access и конфиденциальность | DRAFT_REQUIRED |

## P0/P1 — лицензирование, сотрудники, vendors, insurance и audit

| ID | Папка | Документ | Назначение | Статус |
|---|---|---|---|---|
| ED-LIC-001 | `licensing/` | Полный dossier лицензии №4879 | оригинал, все приложения, registry extract, адрес, 5 chairs | BLOCKED_EVIDENCE |
| ED-LIC-002 | `licensing/` | Матрица услуга → лицензионный профиль → врач | hard stop для расписания/продажи/рекламы | BLOCKED_EVIDENCE |
| ED-LIC-003 | `licensing/` | СЭЗ/помещение/оборудование dossier | адрес, мощности и оборудование | BLOCKED_EVIDENCE |
| ED-LIC-004 | `licensing/` | Рентген/КЛКТ dossier или внешний маршрут | разрешения либо договор с лицензированным центром | BLOCKED_EVIDENCE |
| ED-STF-001 | `staff-credentials/` | Индивидуальное legal dossier врача | диплом, postgrad, specialist, attestation, registration, employment | BLOCKED_EVIDENCE |
| ED-STF-002 | `staff-credentials/` | Credential expiry/register | сроки действия, уведомления и suspension rule | DRAFT_REQUIRED |
| ED-STF-003 | `staff-credentials/` | Матрица врач → разрешённый scope | scheduling hard stop | BLOCKED_EVIDENCE |
| ED-VEN-001 | `vendors/` | Data-processing / service agreement | обработчик, инструкции, безопасность, возврат/удаление, audit | DRAFT_REQUIRED |
| ED-VEN-002 | `vendors/` | Договор с зуботехнической лабораторией | заказы, traceability, сроки, remake, confidentiality | DRAFT_REQUIRED |
| ED-VEN-003 | `vendors/` | Referral/imaging agreement | лицензированный provider, результаты, transfer, responsibility | DRAFT_REQUIRED |
| ED-INS-001 | `insurance/` | Professional liability policy dossier | insured persons/services/limits/exclusions/claims notice | BLOCKED_EVIDENCE |
| ED-INS-002 | `insurance/` | Property/equipment/business interruption | scope определяет owner | BLOCKED_EVIDENCE |
| ED-INS-003 | `insurance/` | Cyber/privacy coverage | breach/response/forensics/third-party claims | BLOCKED_EVIDENCE |
| ED-AUD-001 | `compliance-audits/` | Monthly chart/IDS audit | дата/время, врач, version, plan, signatures, no retro edits | DRAFT_REQUIRED |
| ED-AUD-002 | `compliance-audits/` | License/credential expiry audit | профиль, адрес, врач, срок, gaps | DRAFT_REQUIRED |
| ED-AUD-003 | `compliance-audits/` | Version-control audit | только текущие формы доступны для новых подписаний | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
| ED-AUD-004 | `compliance-audits/` | Privacy/security/processor audit | access, logs, transfers, incidents, retention | DRAFT_REQUIRED |

## Правило добавления

Новый документ получает уникальный `ED-<DOMAIN>-<NNN>`, owner, trigger, legal basis, required signers, retention class, effective version и путь к approval evidence. Запрещено присваивать `IN_USE` только по факту загрузки файла в CRM или печати бланка.

## P0 counsel-approved wording package — 2026-08-30

Канонический индекс и editable mirrors: [`package/README.md`](package/README.md). Точный approved-wording baseline сохранён в исходных artifacts `0.1-draft` и связан с SHA256 в `package/manifest.json`. Для 19 patient-facing форм создан tablet release `1.0.0`; его HTML и hashes находятся в [`package/tablet/manifest.json`](package/tablet/manifest.json). Ни одна форма не становится `IN_USE`, пока не закрыты её medical/evidence/tablet/activation gates.

| ID | Package artifact | Текущий статус |
|---|---|---|
| ED-CON-001 | [`framework-services-agreement`](package/markdown/patient-facing/ED-CON-001_framework-services-agreement.md) | COUNSEL_APPROVED / TABLET_QA_PENDING |
| ED-PAT-002 | [`health-questionnaire`](package/markdown/patient-facing/ED-PAT-002_health-questionnaire.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-PAT-003 | [`treatment-plan-estimate`](package/markdown/patient-facing/ED-PAT-003_treatment-plan-estimate.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-IDS-002/003 | [`therapy`](package/markdown/patient-facing/ED-IDS-002_consent-therapy.md) · [`endodontics`](package/markdown/patient-facing/ED-IDS-003_consent-endodontics.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-IDS-004/005 | [`surgery`](package/markdown/patient-facing/ED-IDS-004_consent-surgery-extraction.md) · [`implantation`](package/markdown/patient-facing/ED-IDS-005_consent-implantation.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-IDS-008/009 | [`prosthodontics`](package/markdown/patient-facing/ED-IDS-008_consent-prosthodontics.md) · [`orthodontics`](package/markdown/patient-facing/ED-IDS-009_consent-orthodontics.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING |
| ED-PAT-005/006/007 | [`change-plan`](package/markdown/patient-facing/ED-PAT-005_change-plan-cost.md) · [`refusal`](package/markdown/patient-facing/ED-PAT-006_refusal.md) · [`minor/representative`](package/markdown/patient-facing/ED-PAT-007_minor-representative.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-CLI-004/005 | [`aftercare acknowledgment`](package/markdown/patient-facing/ED-CLI-004_aftercare-acknowledgment.md) · [`incident/correction/addendum`](package/markdown/operational/ED-CLI-005_incident-correction-addendum.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED; patient form also TABLET_QA_PENDING |
| ED-MKT-001/002 | [`medical photo`](package/markdown/patient-facing/ED-MKT-001_medical-photo-consent.md) · [`marketing media`](package/markdown/patient-facing/ED-MKT-002_marketing-media-consent.md) | COUNSEL_APPROVED; medical photo also MEDICAL_REVIEW_REQUIRED; both TABLET_QA_PENDING |
| ED-PRV-001/005 | [`privacy notice/consent`](package/markdown/patient-facing/ED-PRV-001_privacy-notice-consent.md) · [`retention`](package/markdown/operational/ED-PRV-005_document-retention-policy.md) | COUNSEL_APPROVED; privacy notice TABLET_QA_PENDING; retention MEDICAL_REVIEW_REQUIRED |
| ED-CMP-001/005 | [`complaint`](package/markdown/patient-facing/ED-CMP-001_complaint-form.md) · [`refund/settlement`](package/markdown/patient-facing/ED-CMP-005_refund-settlement.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING |
| ED-AUD-003 | [`template/version register form`](package/markdown/operational/ED-AUD-003_template-version-register.md) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |

### Новые P0 control IDs

| ID | Документ | Назначение | Статус |
|---|---|---|---|
| ED-CON-002 | [`Electronic records / tablet-signature agreement`](package/markdown/patient-facing/ED-CON-002_electronic-signing-agreement.md) | document binding, ceremony, fallback, copy delivery | COUNSEL_APPROVED / TABLET_QA_PENDING |
| ED-PRV-008 | [`WAHA delivery notice`](package/markdown/operational/ED-PRV-008_waha-delivery-notice.md) | минимизация, recipient check, delivery evidence, incident trigger | COUNSEL_APPROVED / OPERATIONAL_ACTIVATION_PENDING |
| ED-STF-004 | [`Staff authorization/delegation form`](package/markdown/operational/ED-STF-004_staff-authorization-delegation.md) | role/purpose scope, training, MFA, revocation | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
| ED-POL-006 | [`Admin signing SOP`](package/markdown/operational/ED-POL-006_admin-signing-sop.md) | управляемая signing ceremony и fail-closed exception path | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
| ED-POL-007 | [`Doctor approval SOP`](package/markdown/operational/ED-POL-007_doctor-approval-sop.md) | template/case approval, named-doctor signature, no delegation | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
| ED-POL-008 | [`Legal hold / evidence export SOP`](package/markdown/operational/ED-POL-008_legal-hold-evidence-export-sop.md) | preservation, manifest, hashes, redaction, delivery, release | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / OPERATIONAL_ACTIVATION_PENDING |
