---
owner: Expert Dental legal owner
status: active-register / counsel-approved-baseline / paper-wave-1-draft / no-in-use-yet
type: controlled-form-version-registry
created: 2026-08-29
last_updated: 2026-09-05
---

# Expert Dental — реестр версий форм

Этот файл является единственным реестром редакций, разрешённых для новых подписаний.

## Первая волна — бумага, решение от 05.09.2026

Канон первого маршрута: [EXPERT_DENTAL_DOCUMENT_FLOW_WAVE_1.md](../../../ssot/EXPERT_DENTAL_DOCUMENT_FLOW_WAVE_1.md). Подготовленный Word-выпуск и контрольные суммы: [paper-wave-1/README.md](paper-wave-1/README.md) и [SOURCE_MANIFEST.json](paper-wave-1/SOURCE_MANIFEST.json).

PAPER-0.1 — новая бумажная компоновка, не дословная копия прежнего approved baseline. Решение о бумажном процессе не переносит старое одобрение юриста на новые клинические/трудовые условия и не подтверждает фактический старт. P-/D-/S- являются локальными кодами выпуска, не новыми каноническими ED-ID.

| Локальный код PAPER-0.1 | Назначение | Текущий статус | Effective |
|---|---|---|---|
| P-01 | Договор + регистрация + уведомление о данных | NEW_PAPER_DRAFT / REVIEW_REQUIRED | NOT EFFECTIVE |
| P-02 | Анкета/ограниченный осмотр → план/смета/ИДС → рекомендации | NEW_PAPER_DRAFT / LEGAL_AND_MEDICAL_REVIEW_REQUIRED | NOT EFFECTIVE |
| P-03 | Событие: изменение, отказ/отзыв или существенное исправление | NEW_PAPER_DRAFT / LEGAL_AND_MEDICAL_REVIEW_REQUIRED | NOT EFFECTIVE |
| D-01 / D-02 | Новый трудовой договор ИЛИ допсоглашение к существующему | NEW_LABOUR_DRAFT / REVIEW_REQUIRED | NOT EFFECTIVE |
| D-03 | Приём нового врача и отдельная проверка допуска | NEW_STAFF_DRAFT / COMPLETION_REQUIRED | NOT EFFECTIVE |
| S-01 / S-02 / инструкция | Приказ, утверждение/ознакомление, внутренний контроль, действия сотрудников | PAPER_OPERATIONS_DRAFT / ADOPTION_NOT_EVIDENCED | NOT EFFECTIVE |

Для бумажного ввода фиксируются точная редакция/артефакт, дата, проверка новых условий, заполненные реквизиты, применимость услуги/врача и внутреннее оформление. Tablet QA, доступы Zoho/DocuSign и электронная интеграция не являются условиями бумажного маршрута. Бумажный допуск должен быть отделён от электронного: запись о бумаге не разрешает ACTIVE/IN_USE в signing runtime. При последующей технической интеграции учитывается формат `paper` отдельно, не только код формы.

## Ранее одобренная основа и планшетная редакция

На 2026-08-30 local counsel approval of the complete P0 package was reported by the owner and recorded in [`package/APPROVAL_RECORD_2026-08-30.md`](package/APPROVAL_RECORD_2026-08-30.md). The approved wording baseline consists of the exact `0.1-draft` source artifacts and SHA256 values already recorded in [`package/manifest.json`](package/manifest.json). Their historical filename/version labels are retained to preserve provenance and hashes.

The 19 patient-facing tablet presentations are assigned clean release version `1.0.0` under [`package/tablet/RELEASE_MAPPING.md`](package/tablet/RELEASE_MAPPING.md). This is a controlled presentation release of unchanged approved wording, not automatic activation.

Counsel approval and release numbering are not the same as `IN_USE`. Medical-template approval, licence/service/provider clearance, tablet QA for the electronic route and exact per-form activation remain independent gates. The following tablet statuses do not supersede the selected first paper wave.

## Обязательные поля версии

Каждая форма должна содержать на самом документе и в реестре:

- document ID из `DOCUMENT_REGISTER.md`; для PAPER-0.1 — явная связь локального кода с выпуском и базовыми ED-функциями;
- название;
- номер версии;
- дату утверждения и effective date;
- owner;
- legal reviewer and medical reviewer where applicable;
- язык;
- SHA256 утверждённого пустого артефакта;
- required signers;
- retention class;
- формат и применимость: бумага либо конкретный электронный способ;
- статус;
- ссылку на superseded version and migration note;
- дату следующего review.

## Реестр редакций, разрешённых для новых подписаний

| Document ID | Release version | Effective | Status | Legal review | Medical review | Release SHA256 | Supersedes | Next review |
|---|---|---|---|---|---|---|---|---|
| — | — | — | **NO IN_USE FORMS YET** | — | — | — | — | — |

A version appears in this table only after the exact format-specific artifact, applicable review/clearance, operational preparation and recorded adoption. The paper format does not require tablet QA. This release adds no active row and does not modify runtime configuration.

## Tablet release candidate register

| Scope | Release version | Source baseline | Status | Effective |
|---|---|---|---|---|
| 19 patient-facing forms in `package/tablet/manifest.json` | 1.0.0 | exact package source `0.1-draft` + per-form source SHA256 | GENERATED / COUNSEL_APPROVED / SELECTIVE_ACTIVATION_GATED | NOT EFFECTIVE BY DEFAULT |

Each form’s final generated HTML SHA256 and remaining gates are recorded in `package/tablet/manifest.json`. Activation occurs per form, not by blanket package status.

## Counsel-approved baseline and remaining release gates

| Document ID | Source version | Tablet release | Artifact | Current controlled status | Legal review | Medical review | Effective |
|---|---|---|---|---|---|---|---|
| ED-CON-001 / ED-CON-002 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / TABLET_QA_PENDING | APPROVED 2026-08-30; evidence attachment pending archive | N/A unless later required | NOT EFFECTIVE |
| ED-MKT-002 / ED-PRV-001 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / TABLET_QA_PENDING / PRIVACY_IMPLEMENTATION_GATE | APPROVED 2026-08-30; evidence attachment pending archive | N/A | NOT EFFECTIVE |
| ED-PAT-002 / ED-PAT-003 / ED-PAT-005 / ED-PAT-006 / ED-PAT-007 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING | APPROVED 2026-08-30 | OPEN | NOT EFFECTIVE |
| ED-IDS-002 / ED-IDS-003 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING | APPROVED 2026-08-30 | OPEN | NOT EFFECTIVE |
| ED-IDS-004 / ED-IDS-005 / ED-IDS-008 / ED-IDS-009 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / BLOCKED_EVIDENCE / TABLET_QA_PENDING | APPROVED 2026-08-30 | OPEN | NOT EFFECTIVE |
| ED-CLI-004 / ED-MKT-001 / ED-CMP-001 / ED-CMP-005 | 0.1-draft | 1.0.0 | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / MEDICAL_REVIEW_REQUIRED / TABLET_QA_PENDING | APPROVED 2026-08-30 | OPEN | NOT EFFECTIVE |
| ED-PRV-005 / ED-PRV-008 / ED-STF-004 / ED-POL-006 / ED-POL-007 / ED-POL-008 / ED-AUD-003 / ED-CLI-005 | 0.1-draft | N/A operational | [`package`](package/README.md#индекс) | COUNSEL_APPROVED / OPERATIONAL_OR_MEDICAL_OWNER_APPROVAL_PENDING | APPROVED 2026-08-30 | OPEN where applicable | NOT EFFECTIVE |

The approval applies only to the exact baseline identified by package hashes. A wording change creates a new controlled version and requires impact review.

## Tablet release overlay

Tablet presentations are generated under [`package/tablet/`](package/tablet/). The generated [`tablet/manifest.json`](package/tablet/manifest.json) records for each form:

- source file, source version and exact SHA256;
- tablet release version `1.0.0`;
- generated final HTML SHA256;
- counsel approval overlay;
- whether medical review is pending;
- whether licence/service/provider evidence blocks signing;
- tablet release status.

Current tablet statuses:

- `COUNSEL_APPROVED_TABLET_QA` — legal wording approved; tablet and operational activation still pending;
- `COUNSEL_APPROVED_MEDICAL_REVIEW_PENDING` — real-patient signing remains disabled until medical approval;
- `COUNSEL_APPROVED_EVIDENCE_BLOCKED` — real-patient signing remains disabled until licence/service/provider evidence closes.

## Правила эксплуатации

1. Новая версия не заменяет старый файл «на месте»; она получает новый immutable artifact and a new registry row.
2. После `effective date` only the current `IN_USE` version for the approved format is available for new signing sessions.
3. Подписанный экземпляр связан с той версией и способом, которые применялись при подписании.
4. `SUPERSEDED` запрещает новое использование, но не удаляет ранее подписанные экземпляры.
5. Любое изменение реквизитов лицензиата, адреса, scope, врача, рисков, способа подписи, целей обработки или получателей данных требует review impact.
6. Emergency hotfix допускается только с owner, причиной, датой, reviewer и последующим полным review; тихая замена файла запрещена.
7. CRM/DMS rejects an unknown, blocked, expired or non-effective electronic version ID and stores the final signed-artifact hash; paper records keep their own original and provenance.
8. A treating doctor’s case approval does not replace medical approval of the template; both are recorded where applicable.
