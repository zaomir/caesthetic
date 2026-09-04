---
doc_id: ED-POL-006
version: 0.1-draft
title: SOP администратора: подписная сессия
owner: Expert Dental legal owner + clinic medical director
status: COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED
effective_date: "[EFFECTIVE DATE — AFTER COUNSEL/MEDICAL APPROVAL]"
jurisdiction: Kyrgyz Republic
language: ru
approved_for_real_patient_use: false
---

# SOP администратора: подписная сессия

> **COUNSEL_REVIEW_REQUIRED / MEDICAL_REVIEW_REQUIRED. НЕ ДЛЯ РЕАЛЬНЫХ ПАЦИЕНТОВ И НЕ IN_USE.** Требуются письменные approvals, evidence gates, регистрация версии и go-live акт.

## Контроль документа

- DOC-ID: **ED-POL-006**
- Version: **0.1-draft**
- Owner: **Expert Dental legal owner + clinic medical director**
- Effective date: **[EFFECTIVE DATE — AFTER COUNSEL/MEDICAL APPROVAL]**
- Required approvals: **COUNSEL_REVIEW_REQUIRED, MEDICAL_REVIEW_REQUIRED**
- Empty-template SHA256: `[CALCULATE AFTER APPROVAL; current draft hash is recorded in package manifest]`
- Supersedes: none
- Retention class/period: `[OPEN GAP — COUNSEL-APPROVED SCHEDULE REQUIRED]`

## Подтверждённые реквизиты и границы

ИП Раимова Камилла Саидовна; лицензия №4879 от 15.01.2026; г. Бишкек, проспект Эркиндик, 43; подтверждённый scope на представленном листе: стоматологическая помощь общей практики амбулаторно; 5 стоматологических кресел. Иные профили, приложения, разрешения и credentials: OPEN GAP.

## До сессии

Проверить identity/representative authority, язык, patient/case ID, service/provider clearance, актуальность health form и назначение только active version. Администратор не объясняет медицинские риски.

## Сессия

Передать врачу clinical explanation; показать весь финальный документ; не пролистывать автоматически; не подписывать пачкой; не оставлять пустые поля; зафиксировать questions/answers acknowledgement.

## После подписи

Проверить обе подписи, server time, version/hash, immutable save и выдачу копии. Не сохранять PNG подписи и не использовать личное устройство.

## Сбой

Остановить процесс при mismatch/старой версии/чужом документе/отсутствии врача. Использовать только approved paper fallback; создать incident при wrong recipient или integrity error.

## Подписи и временные метки

Пациент / представитель: ____________________  ФИО: ____________________  Роль/основание: ____________________

Врач / уполномоченный сотрудник (по применимости): ____________________  ФИО/роль: ____________________

Дата/время сервера (UTC): ____________________  Местное время и timezone: ____________________

Device/session ID или номер бумажного экземпляра: ____________________

DOC-ID / version / final document hash: ____________________

## Выдача копии

Копия выдана/отправлена способом: ____________________  Получатель: ____________________

Дата/время отправки: ____________________  Дата/время получения/подтверждения: ____________________

Я подтверждаю получение доступной мне копии: ____________________

## Запрет backdating и управление версиями

Подпись относится только к полному финальному документу с указанными DOC-ID, version и hash. Документ нельзя датировать задним числом, переписывать после подписи или заменять «на месте». Исправление создаётся текущей датой как отдельное дополнение/новая версия со ссылкой на исходный объект. Изображение подписи нельзя хранить или повторно использовать отдельно от подписанного документа.

## Approval block

- Legal reviewer / date / decision: ____________________
- Medical reviewer / date / decision: ____________________
- Owner release decision / date: ____________________
- Registry entry / effective version: ____________________
- Go-live evidence: ____________________
