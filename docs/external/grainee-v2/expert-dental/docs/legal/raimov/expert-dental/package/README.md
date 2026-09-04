---
owner: Expert Dental legal owner + clinic medical director
status: counsel-approved-baseline / tablet-formatting / selective-activation-gated
type: canonical-p0-form-package
created: 2026-08-30
last_updated: 2026-08-30
---

# Expert Dental / RAIMOV — P0 legal & e-signing package

## Current decision

Local counsel approval of all 27 package documents was reported by the owner on 2026-08-30. The decision and its boundaries are recorded in [`APPROVAL_RECORD_2026-08-30.md`](APPROVAL_RECORD_2026-08-30.md).

The approved wording baseline is the exact set of Markdown and DOCX artifacts indexed by `manifest.json` at package merge SHA `4ce597eb46145c496920adb5a5f5ab678d6bae76`. Existing source frontmatter still contains the historical `COUNSEL_REVIEW_REQUIRED` labels so that the approved files and their SHA256 values are not silently rewritten. The approval record and tablet manifest provide the current release overlay.

Counsel approval does not clear medical-template review, licence scope, service/equipment clearance or credentials of the assigned doctor. `BLOCKED_EVIDENCE` remains a hard stop. No patient form is automatically `IN_USE` merely because it has been formatted or uploaded.

## Подтверждённая фактическая база

ИП Раимова Камилла Саидовна; лицензия №4879 от 15.01.2026; г. Бишкек, проспект Эркиндик, 43; подтверждённый scope на представленном листе: стоматологическая помощь общей практики амбулаторно; 5 стоматологических кресел. Иные профили, приложения, разрешения и credentials: OPEN GAP.

## Структура

- `markdown/patient-facing/` и `docx/patient-facing/` — approved-wording baseline пациентских форм;
- `markdown/operational/` и `docx/operational/` — approved-wording baseline SOP и операционных форм;
- [`tablet/`](tablet/) — iPad-readable presentation layer, generated HTML, shared CSS/JS and SHA manifest;
- [`tablet/TABLET_FORM_DESIGN_STANDARD.md`](tablet/TABLET_FORM_DESIGN_STANDARD.md) — canonical tablet readability and signing standard;
- `manifest.json` — machine index and SHA256 of the original package artifacts;
- `Expert_Dental_RAIMOV_P0_Legal_Package_v0.1-draft.zip` — immutable package snapshot retained under its original filename and hash.

## Индекс

`Source gates` below reflect the original generated source metadata. Current legal approval is recorded separately; medical and evidence gates remain applicable.

| DOC-ID | Документ | Source gates | SSOT | Editable | Tablet |
|---|---|---|---|---|---|
| ED-CON-001 | Рамочный договор платных стоматологических услуг | COUNSEL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-CON-001_framework-services-agreement.md) | [DOCX](docx/patient-facing/ED-CON-001_framework-services-agreement.docx) | [HTML](tablet/generated/ED-CON-001_framework-services-agreement.html) |
| ED-PAT-002 | Анкета состояния здоровья, лекарств и аллергий | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PAT-002_health-questionnaire.md) | [DOCX](docx/patient-facing/ED-PAT-002_health-questionnaire.docx) | [HTML](tablet/generated/ED-PAT-002_health-questionnaire.html) |
| ED-PAT-003 | План лечения и смета — входит / не входит | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PAT-003_treatment-plan-estimate.md) | [DOCX](docx/patient-facing/ED-PAT-003_treatment-plan-estimate.docx) | [HTML](tablet/generated/ED-PAT-003_treatment-plan-estimate.html) |
| ED-IDS-002 | ИДС — терапия и реставрация | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-IDS-002_consent-therapy.md) | [DOCX](docx/patient-facing/ED-IDS-002_consent-therapy.docx) | [HTML](tablet/generated/ED-IDS-002_consent-therapy.html) |
| ED-IDS-003 | ИДС — эндодонтическое лечение | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-IDS-003_consent-endodontics.md) | [DOCX](docx/patient-facing/ED-IDS-003_consent-endodontics.docx) | [HTML](tablet/generated/ED-IDS-003_consent-endodontics.html) |
| ED-IDS-009 | ИДС — ортодонтия | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE | [MD](markdown/patient-facing/ED-IDS-009_consent-orthodontics.md) | [DOCX](docx/patient-facing/ED-IDS-009_consent-orthodontics.docx) | [HTML](tablet/generated/ED-IDS-009_consent-orthodontics.html) |
| ED-IDS-008 | ИДС — ортопедия | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE | [MD](markdown/patient-facing/ED-IDS-008_consent-prosthodontics.md) | [DOCX](docx/patient-facing/ED-IDS-008_consent-prosthodontics.docx) | [HTML](tablet/generated/ED-IDS-008_consent-prosthodontics.html) |
| ED-IDS-004 | ИДС — хирургия / удаление зуба | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE | [MD](markdown/patient-facing/ED-IDS-004_consent-surgery-extraction.md) | [DOCX](docx/patient-facing/ED-IDS-004_consent-surgery-extraction.docx) | [HTML](tablet/generated/ED-IDS-004_consent-surgery-extraction.html) |
| ED-IDS-005 | ИДС — имплантация | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE | [MD](markdown/patient-facing/ED-IDS-005_consent-implantation.md) | [DOCX](docx/patient-facing/ED-IDS-005_consent-implantation.docx) | [HTML](tablet/generated/ED-IDS-005_consent-implantation.html) |
| ED-PAT-005 | Изменение плана лечения и стоимости | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PAT-005_change-plan-cost.md) | [DOCX](docx/patient-facing/ED-PAT-005_change-plan-cost.docx) | [HTML](tablet/generated/ED-PAT-005_change-plan-cost.html) |
| ED-PAT-006 | Отказ от вмешательства / диагностики / рекомендации | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PAT-006_refusal.md) | [DOCX](docx/patient-facing/ED-PAT-006_refusal.docx) | [HTML](tablet/generated/ED-PAT-006_refusal.html) |
| ED-CLI-004 | Подтверждение получения рекомендаций | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-CLI-004_aftercare-acknowledgment.md) | [DOCX](docx/patient-facing/ED-CLI-004_aftercare-acknowledgment.docx) | [HTML](tablet/generated/ED-CLI-004_aftercare-acknowledgment.html) |
| ED-MKT-001 | Согласие на медицинскую фото-/видеофиксацию | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-MKT-001_medical-photo-consent.md) | [DOCX](docx/patient-facing/ED-MKT-001_medical-photo-consent.docx) | [HTML](tablet/generated/ED-MKT-001_medical-photo-consent.html) |
| ED-MKT-002 | Отдельное согласие на маркетинговое использование фото/видео | COUNSEL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-MKT-002_marketing-media-consent.md) | [DOCX](docx/patient-facing/ED-MKT-002_marketing-media-consent.docx) | [HTML](tablet/generated/ED-MKT-002_marketing-media-consent.html) |
| ED-PAT-007 | Несовершеннолетний пациент / представитель | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PAT-007_minor-representative.md) | [DOCX](docx/patient-facing/ED-PAT-007_minor-representative.docx) | [HTML](tablet/generated/ED-PAT-007_minor-representative.html) |
| ED-PRV-001 | Уведомление и применимое согласие на персональные данные | COUNSEL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-PRV-001_privacy-notice-consent.md) | [DOCX](docx/patient-facing/ED-PRV-001_privacy-notice-consent.docx) | [HTML](tablet/generated/ED-PRV-001_privacy-notice-consent.html) |
| ED-CON-002 | Соглашение об электронном документообороте и планшетной подписи | COUNSEL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-CON-002_electronic-signing-agreement.md) | [DOCX](docx/patient-facing/ED-CON-002_electronic-signing-agreement.docx) | [HTML](tablet/generated/ED-CON-002_electronic-signing-agreement.html) |
| ED-CMP-001 | Форма претензии / обращения пациента | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-CMP-001_complaint-form.md) | [DOCX](docx/patient-facing/ED-CMP-001_complaint-form.docx) | [HTML](tablet/generated/ED-CMP-001_complaint-form.html) |
| ED-CMP-005 | Возврат / соглашение об урегулировании | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/patient-facing/ED-CMP-005_refund-settlement.md) | [DOCX](docx/patient-facing/ED-CMP-005_refund-settlement.docx) | [HTML](tablet/generated/ED-CMP-005_refund-settlement.html) |
| ED-POL-006 | SOP администратора: подписная сессия | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-POL-006_admin-signing-sop.md) | [DOCX](docx/operational/ED-POL-006_admin-signing-sop.docx) | — |
| ED-PRV-005 | Политика хранения и уничтожения документов | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-PRV-005_document-retention-policy.md) | [DOCX](docx/operational/ED-PRV-005_document-retention-policy.docx) | — |
| ED-AUD-003 | Реестр шаблонов и версий — рабочая форма | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-AUD-003_template-version-register.md) | [DOCX](docx/operational/ED-AUD-003_template-version-register.docx) | — |
| ED-POL-008 | SOP legal hold и evidence export | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-POL-008_legal-hold-evidence-export-sop.md) | [DOCX](docx/operational/ED-POL-008_legal-hold-evidence-export-sop.docx) | — |
| ED-PRV-008 | Уведомление и контроль доставки через WAHA / WhatsApp | COUNSEL_REVIEW_REQUIRED | [MD](markdown/operational/ED-PRV-008_waha-delivery-notice.md) | [DOCX](docx/operational/ED-PRV-008_waha-delivery-notice.docx) | — |
| ED-STF-004 | Полномочия и делегирование сотрудников | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-STF-004_staff-authorization-delegation.md) | [DOCX](docx/operational/ED-STF-004_staff-authorization-delegation.docx) | — |
| ED-POL-007 | SOP врачебного утверждения ИДС и документов | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-POL-007_doctor-approval-sop.md) | [DOCX](docx/operational/ED-POL-007_doctor-approval-sop.docx) | — |
| ED-CLI-005 | Инцидент / исправление / датированное дополнение | COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED | [MD](markdown/operational/ED-CLI-005_incident-correction-addendum.md) | [DOCX](docx/operational/ED-CLI-005_incident-correction-addendum.docx) | — |

## Activation gate

Legal review is closed for the exact package baseline. Before any patient-facing version is activated, the clinic still records: applicable medical approval; licence/service/provider clearance; privacy/retention decision; iPad visual/accessibility QA; managed devices/RBAC; exact version and blank-artifact SHA; synthetic pilot; registry activation and go-live record.

The tablet renderer is fail-closed: unresolved `MEDICAL_REVIEW_REQUIRED` or `BLOCKED_EVIDENCE` prevents a real-patient signing action. The source archive `../kronis/` remains unchanged and is not part of this package.
