---
doc_id: ED-CON-002
version: 0.1-draft
title: Соглашение об электронном документообороте и планшетной подписи
owner: Expert Dental legal owner
status: COUNSEL_REVIEW_REQUIRED
effective_date: "[EFFECTIVE DATE — AFTER COUNSEL/MEDICAL APPROVAL]"
jurisdiction: Kyrgyz Republic
language: ru
approved_for_real_patient_use: false
---

# Соглашение об электронном документообороте и планшетной подписи

> **COUNSEL_REVIEW_REQUIRED. НЕ ДЛЯ РЕАЛЬНЫХ ПАЦИЕНТОВ И НЕ IN_USE.** Требуются письменные approvals, evidence gates, регистрация версии и go-live акт.

## Контроль документа

- DOC-ID: **ED-CON-002**
- Version: **0.1-draft**
- Owner: **Expert Dental legal owner**
- Effective date: **[EFFECTIVE DATE — AFTER COUNSEL/MEDICAL APPROVAL]**
- Required approvals: **COUNSEL_REVIEW_REQUIRED**
- Empty-template SHA256: `[CALCULATE AFTER APPROVAL; current draft hash is recorded in package manifest]`
- Supersedes: none
- Retention class/period: `[OPEN GAP — COUNSEL-APPROVED SCHEDULE REQUIRED]`

## Подтверждённые реквизиты и границы

ИП Раимова Камилла Саидовна; лицензия №4879 от 15.01.2026; г. Бишкек, проспект Эркиндик, 43; подтверждённый scope на представленном листе: стоматологическая помощь общей практики амбулаторно; 5 стоматологических кресел. Иные профили, приложения, разрешения и credentials: OPEN GAP.

## Статус

Это проект соглашения. Стилус на планшете не называется ОЭП/квалифицированной подписью и не применяется к реальным пациентам до письменного заключения юриста КР по конкретной ceremony.

## Ceremony

Очная проверка личности; показ полного финального документа; binding к DOC-ID/version/hash; server timestamp; device/session; подпись пациента/представителя и врача; immutable artifact; audit trail; выдача копии.

## Согласие на способ

Пациент выбирает допустимый counsel-approved способ и может запросить бумажный fallback. Отказ от электронного канала не лишает медицинской помощи в пределах применимого процесса.

## Ошибки и изменения

После подписи документ не переписывается. Ошибка исправляется датированным addendum/superseding version. Backdating и повторное использование изображения подписи запрещены.

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
- Medical reviewer / date / decision: N/A unless counsel requires
- Owner release decision / date: ____________________
- Registry entry / effective version: ____________________
- Go-live evidence: ____________________
