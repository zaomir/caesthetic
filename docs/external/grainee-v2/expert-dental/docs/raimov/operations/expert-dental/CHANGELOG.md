---
title: Expert Dental Studio — журнал изменений операционного контура
status: ACTIVE
version: 2.3
created: 2026-08-03
last_updated: 2026-08-30
---

# Журнал изменений

## 2026-08-30 — единый infrastructure/CRM SSOT

- Добавлен `docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md`: SQNS закреплён как единственный основной CRM/MIS и ежедневный интерфейс 10 врачей и 5 администраторов.
- Пилот ограничен managed VATS/SIP, native SQNS popup/log, guidebook browser side panel без PHI/API, Zoho Sign `Use Template` на одном iPad и независимым evidence-export.
- Воронка сокращена до обязательного milestone `Лечение начато`; call outcomes остаются короткими операционными статусами SQNS.
- Исправлена модель ёмкости: пять operator seats / минимум пять concurrent call legs не означают пять брендов, бизнес-идентичностей или CRM.
- Omnichannel SSOT подчинён master-файлу; custom router, PBX, caller popup, call board, second CRM и generative live-call copilot исключены из пилота.
- Интеграционный контракт `ADMIN_GUIDEBOOK_SSOT.json` обновлён без смены версии учебного контента `2026.08.30.1`.
- Документация/control plane only; production runtime не менялся.


## 2026-08-30 — единый гайдбук администратора

- ED-MAT-073 фиксирует `ADMIN_GUIDEBOOK_SSOT.json` как единственный редактируемый источник для обучения, сложных неоперативных ситуаций и суфлёра звонка.
- Builder генерирует runtime, три совместимых JSON, Markdown, печатный HTML, manifest с SHA-256 и PDF A4; ручное редактирование производных файлов запрещено.
- `/render/` загружает карточки U01–U07 / R01–R13 из единого runtime; каталог S01–S25 и двухдневный онбординг читают тот же файл и показывают версию `2026.08.30.1`.
- Прогресс онбординга получил версионный контракт и adapter hooks; при смене версии требуется повторная аттестация. В demo остаётся `localStorage`, реальные данные пациентов не используются.
- Интеграция с SQNS остаётся в режиме companion app до подтверждения возможности встроенного виджета; API/вебхуки не считаются доказательством iframe/widget capability.
- Печатная HTML-версия зарегистрирована как ED-LINK-042; PDF остаётся репозиторным учебником.
- Production: deploy workflow #569 и RAIMOV Workspace Live Smoke #86 — success; `/render/`, workspace/role routes, runtime, manifest и print HTML отвечают HTTP 200.

## 2026-08-29 — безопасный naming cutover SmileCare 12

- DEC-861 фиксирует owner-approved публичное имя `RAIM SMILE · SmileCare 12`
  только для существующей подтверждённой связки Adult / Additional Adult / Kids.
- SKU `care12-adult`, `care12-family-addon`, `care12-kids`, цены 9 900 / 7 900 /
  5 500 сом и границы benefits сохранены без изменений.
- Канонические маршруты: `/services/smilecare-12/` и `/blog/smilecare-12/`;
  прежние маршруты переводятся постоянными redirect.
- Medical operator disclosure остаётся явным: Expert Dental Studio
  (`ИП Раимова Камилла Саидовна`, лицензия `№ 4879`).
- Essential, Perio, Kids & Teens, Family Account, checkout и partner-funded
  activation не включены; G1-G6 и trademark clearance остаются fail-closed.

## 2026-08-29 — RAIM SMILE operator, number, CRM and source discovery

- DEC-856 amended: Expert Dental Studio is sole medical operator; RAIM SMILE dedicated phone/WhatsApp is `+996 500 700 200`.
- Lead-routing CRM contract added as ED-MAT-070 with fail-closed `PREIMPLEMENTATION` status.
- 90-day economics export feasibility confirmed; source systems/export owner/data remain `BLOCKED_ACCESS_DETAILS` (ED-MAT-071).
- Visual audit now records 91 repo items (9 patient-site rights-marked), two verified Dropbox Instagram archives and five Google Drive brand/team files; no blanket RAIM SMILE case approval (ED-MAT-072).
- No public intake, paid media, form or patient-facing cutover activated.

## 2026-08-14 — Marketing FAQ price workbook (110 rows)

- PDF + RTF of the same Pages file: reliable service↔price pairs.
- Extract: `pricing/MARKETING_FAQ_PRICE_WORKBOOK.json` + `.md`.
- Does not overwrite `PRICE_CATALOG.json`. New vs catalog: All-on-4/6, named braces, КЛКТ 6 500, сплинт 55 000, ortho activations.

## 2026-08-14 — Marketing FAQ briefing (врачи / слоты)

- Canon: `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md` — расшифровка Pages «Ответы на вопросы».
- Roster: TM-009 Исакулов, TM-010 Акрамов, TM-011 Гусейнов (`clinic_brief`, не на сайте 2026-07-21).
- Не переписывает `PRICE_CATALOG.json`. Мир-Али 1 500 / роль гнатолог остаются новее брифа.

## 2026-08-09 — Call scripts SSOT + /render/ panel

- SSOT: `call-scripts-urgent-routine.json` (7 срочных U01–U07, 13 обычных R01–R13) · ядро + развёртка · нейтральный род · RAIMOV DENTAL.
- Док: `scripts/CALL_SCRIPTS_URGENT_ROUTINE.md`.
- `/render/`: `call-guidance.js` грузит JSON и показывает панель «Скрипт звонка» по экрану и приоритету.
- Каталог S01/S16 выровнен с новыми формулировками.

## 2026-08-08 — G1 Place ID + G4 W32 log + G3 worksheet

- Google Place ID `ChIJq-8xG8a3njgR-Jz17KDbaKw` → **ED-LINK-041** writereview (smoke 200).
- Бриф унификации названия: `G1_NAME_UNIFY_BRIEF.md`; проход ответов: `G1_REVIEW_REPLY_PASS.md` (Яндекс 3/3).
- G3 worksheet: `G3_AUDIT_WORKSHEET.md` (без PHI).
- Старт каденции G4: **ED-MAT-068** · `g4-logs/2026-W32.md`.
- Следующие свободные ID: **ED-MAT-069** · **ED-LINK-042**.
- STATUS: п.3 Place ID закрыт; пункт не повышен (название + 2ГИС скрин).

## 2026-08-08 — G1 maps audit-fill (продолжение outside-UI)

- Скриншоты Overview: Google + Яндекс; 2ГИС — evidence из m.2gis HTML (desktop antibot на VPS).
- `G1_MAPS_AUDIT_FILL.md`: телефон/адрес/сайт OK; 3 варианта названия; рейтинги 4.8 / 4.2 / 4.9.
- `G2_APPROVAL_SHEET.md` — лист для подписи клиники.
- Evidence: `media/maps-packaging-2026-08-08/`.

## 2026-08-08 — outside-UI groups G1–G4 (после IP.6)

- Индекс исполнения: **ED-MAT-062** · `periods/month-01/outside-ui/`.
- G1 карты/офферы: **ED-MAT-063–064** · Google resolved place **ED-LINK-040**.
- G2 утверждение маркеров 10–11: **ED-MAT-065**.
- G3 WhatsApp/CRM: **ED-MAT-066**.
- G4 каденция репутации 12/14/16: **ED-MAT-067**.
- STATUS.md v1.4 — фокус сгруппирован; статусы пунктов не завышены.
- Следующие свободные ID: **ED-MAT-068** · **ED-LINK-041**.

## 2026-08-08 — prod smoke и STATUS interface closure (IP.5–IP.6)

- Prod smoke workspace + `/render/` + presentation (IP.5): HTTP 200, noindex, ключевые строки на месте.
- **STATUS.md** v1.3 (IP.6): колонка и блок «закрыто интерфейсом» для пунктов 1/4/5/7/8/10/11; статусы пунктов не завышены там, где вне-UI часть открыта.
- `WORKSPACE_INTERFACE_ATOMIC_PLAN.md` и `WORKSPACE_INTERFACE_CLOSURE_PLAN.md` → COMPLETE.
- `content/gaps.md`: IP.1–IP.6 ✅.

## 2026-08-08 — workspace content pack и упаковка месяца-1 (IP.1–IP.4)

- Content pack в `site-raimovdental/public/assets/img/workspace/content/`:
  `scripts-25.json`, `recontact-9.json`, `patient-path.json`, `admin-feedback-sop.json`,
  `sources.json`, `internal-marketing.json`, `speech-markers-before.json`, `speech-markers-chair.json`, `gaps.md`.
- Материал: **ED-MAT-060** · тест-маркеры: **ED-MAT-061** (`workspace-mvp.test.mjs`).
- Презентация Атабека (IP.2): shots 01–12, секция `#plan-map` — **ED-MAT-059** · **ED-LINK-038**.
- Hub «Как презентовать» (IP.3): сценарий 7→5→4→1→10→11→8, `#present` — **ED-MAT-026** · **ED-LINK-037**.
- Deep-links `/render/#scripts`, `#recontact`, `#markers` — **ED-LINK-039**.
- Статусы ролевых интерфейсов workspace (ED-MAT-028–031, ED-MAT-032) обновлены до production verified по атомам I1–I11 / I8.
- Канон атомов: `periods/month-01/WORKSPACE_INTERFACE_ATOMIC_PLAN.md`.

## 2026-08-07 — презентация рабочей системы для Атабека

- HTML-презентация со скриншотами 4 ролей и модуля `/render/`:
  `https://raimovdental.com/assets/img/workspace/presentation/`
- Материал: ED-MAT-059 · ссылка: ED-LINK-036.
- Хаб интерфейсов получил кнопку перехода к презентации.
- Канон: `docs/ssot/EXPERT_DENTAL_WORKSPACE_MVP.md`.

## 2026-08-07 — Care 12 publication boundary и homepage v2 (DEC-800)

- Care 12 получил статус `clinic_confirmed_public`: Adult 9 900, Family 7 900, Kids 5 500 сом.
- Patient-site публикует `/services/care-12/`, статью и контекстный WhatsApp inquiry.
- Checkout и автоматическая активация не добавлены; договорные условия подтверждает администратор.
- Главная перестроена по 15-блочной v2-карте: нейтральный hero, карточки маршрута на позиции 2,
  trust после цен.
- Операционный SSOT фиксирует 4 слота примерки, free/paid boundary, депозит диагностики,
  `NEXT_VISIT_BOOKED`, `REDIRECTED`, координатора и метрики.
- Админский скрипт B.0–B.13: `scripts/WHATSAPP_SMILE_PREVIEW_ADMIN.md`.

## 2026-08-06 — атомарный план Review Hub на clinic.raimovdental.com

- План: `reputation/IMPLEMENTATION_PLAN_ATOMIC.md` (фазы A–E, атомы A1…E3).
- Пилот-host: `https://clinic.raimovdental.com/feedback/<token>`.
- Граница с параллельным patient-site агентом: только namespace `/feedback/*`.
- Код/деплой patient-site — через grainee-v2, не из satellite.

## 2026-08-05 — Post-Visit Feedback Loop (DEC-787)

Схема сбора отзывов в системе мотивации пациентов (Layer A):

- WhatsApp → трекаемый **Review Hub** (`/feedback/<token>`), CSAT 1–5★ на сайте;
- 4–5 → `/write` (подсказки) → `/maps` (Яндекс / 2ГИС / Google); кликнутая «серая»; дожимы на 2–3 площадки;
- лестница N0–N4 (anti-spam), затем STOP; клик ≠ публикация;
- 1–3 → закрытая форма recovery + алерт (без карт);
- `/feedback/` без токена → звёзды (не shortcut на карты);
- запрет reward-for-review и предварительного отбора «только довольных»;
- SSOT: `EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md` §4.1;
- SOP: `reputation/POST_VISIT_FEEDBACK_LOOP.md` v1.1;
- решение: `docs/founder-notes/DEC-787_post-visit-feedback-loop.md`.

## 2026-08-05 — Мир-Али как гнатолог (Tilda update pack)

- Канон роли TM-002: **Гнатолог · хирург-имплантолог, ортопед**
- Инструкция для Tilda: `docs/projects/raimovdental/tilda/doctors/MIR_ALI_GNATHOLOGIST_TILDA.md`
- Реестр врачей: `DOCTORS_REGISTER.md`
- Фото-исходник: `media/team/talyshhanov-mir-ali.png`
- Homepage Zero Block: карточка Мир-Али вместо placeholder
- **Прод:** сменить specialization в блоке Persons на Tilda и опубликовать

## 2026-08-05 — консультации по врачам (clinic update)

Зафиксированы тарифы консультаций:

| Кто | Цена |
|---|---|
| Общие врачи (терапевт, ортодонт, ортопед, хирург) | 550 сом |
| Д-р Мир Али — ортопедия, имплантация | 1 500 сом |
| Д-р Атабек — ортодонтия | 3 000 сом |
| Гнатология — Атабек / Мир Али | 5 000 сом |

Диапазон «консультация 550–2 000» снят. Обновлены каталог (`consultationFees`), таблица, Zero Block; анкета вопросов актуализирована (остались Care, диапазоны лечения, аксиография, публикация).

## 2026-08-05 — аксиография ВНЧС в прайсе

Добавлена услуга диагностики:

- Электронная аксиография (диагностика ВНЧС) — **80 000 сом**;
- направление «Диагностика»; вне Expert Care 12;
- обновлены `PRICE_CATALOG.json`, `PRICE_TABLE.md`, Zero Block.

## 2026-08-05 — Expert Care 12 в прайсе (proposed)

Интеграция абонемента в расценки без колонки глобальных скидок:

- `PRICE_CATALOG.json`: блок `membership` + direction `care12` (Adult 9 900 / Family 7 900 / Kids 5 500);
- гигиена: `careEligible` + правило доплаты 2 200 за тяжёлую;
- `PRICE_TABLE.md` + Zero Block + Tilda AI prompt переписаны (запрет ≤2000=0 / −20%);
- SSOT мотивации v1.1 + DEC-786 уточнение;
- статус Care: **proposed** — не live на `/price` без clinic_confirmed.

## 2026-08-05 — система мотивации пациентов (DEC-786)

Принята единая трёхслойная система:

- SSOT: `docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md`;
- решение: `docs/founder-notes/DEC-786_expert-dental-patient-motivation-system.md`;
- слои: Continuity (DEC-774) → Expert Care 12 → Expert Points;
- запрет баллов/скидок за отзывы;
- фазы 0–3; Care/Points operationally deferred.

Обновлены индексы: `RAIMOV.md`, ops README, patient-funnel, clinic-growth, PROJECT_STATUS.

## 2026-08-04 — прайс-каталог clinic_confirmed → таблица `/price`

Получен полный прайс клиники (направление / услуга / цена). Зафиксировано:

- SSOT JSON: `pricing/PRICE_CATALOG.json` (9 направлений, 77 позиций);
- Markdown-таблица: `pricing/PRICE_TABLE.md`;
- Zero Block для Tilda: `docs/projects/raimovdental/tilda/price-table-zero-block.html`;
- реестры: `ED-MAT-053`, `ED-LINK-033`.

Публикация на Tilda `/price` — вставка Zero Block + удаление дублирующих карточек T847. Production smoke после публикации.

## 2026-08-03 — версия 1.1 опубликована как продолжение отчёта за первые две недели

Переданные пользователем DOCX, XLSX и Markdown-документы получены и использованы как источники.

Выполнено:

- подтверждён управленческий DOCX на 28 страниц;
- подтверждена рабочая XLSX-база с конкурентами, путём пациента, скриптами, KPI и источниками;
- получены полный веб-контент, blueprint, README и исторический агентский промпт;
- создан единый data layer версии 1.1;
- собраны восемь закрытых веб-страниц;
- подробный разбор размещён как прямое продолжение промежуточного отчёта за первые две недели;
- переход добавлен в родительский отчёт и список отчётов первого месяца;
- отдельный параллельный маршрут `/ru/valeria/expert-dental/` не используется;
- все страницы закрыты от индексации;
- сохранены ровно 16 утверждённых пунктов первого месяца;
- обновлены `ED-MAT-043…052` и `ED-LINK-025…032`;
- точные ссылки 2ГИС и Яндекс Карт внесены в реестр;
- ZIP-пакет честно оставлен в статусе `source not received`, поскольку отдельно не передавался.

Production подтверждён отдельным read-only smoke:

- без сессии — HTTP `302`;
- вход паролем `0726` — HTTP `303`;
- username отсутствует;
- родительский отчёт и список отчётов — HTTP `200`;
- все восемь страниц продолжения — HTTP `200` на origin и public edge.

Evidence: `docs/audits/raimovdental-expert-dental-report/LAST_RUN.md`.

Cursor не использовался.

## 2026-08-03 — первичная интеграция резюме агента в промежуточный отчёт

Исторический этап до получения исходных файлов.

Были выполнены:

- создание handoff-файла;
- первичная фиксация заявленного состава версии 1.1;
- добавление формулировки **«Это первая версия живой системы, а не окончательный отчёт»**;
- временная регистрация `ED-MAT-043…050` со статусами ожидания исходников.

Этот статус закрыт последующей записью: источники получены, проверены и использованы; подробное продолжение опубликовано.

## 2026-08-03 — клиентская витрина переведена под бренд CAESTHETIC

Обновлены существующие материалы `ED-MAT-011…020` без создания нового дублирующего контура:

- клиентское название изменено на **«Планы и отчёты CAESTHETIC»**;
- имя Валерии удалено из названия продукта, заголовков страниц и метаданных;
- имя оставлено только в корректной роли: **«Руководитель проекта — Валерия Петрова»** на главной странице пространства;
- кнопка **«Карта стратегии»** переименована в **«Стратегия Дмитрия»**;
- тексты стали более уважительными, доброжелательными и сервисными;
- факты, цифры, 16 пунктов плана и пять смысловых блоков не изменены;
- production-smoke и автоматические тесты обновлены, чтобы старое название не вернулось.

## 2026-08-03 — зафиксирована архитектура доставки демонстрационных интерфейсов

В `README.md` добавлена каноническая архитектура demo-контура Expert Dental:

- стартовая презентационная страница;
- общий ролевой runtime;
- интерфейсы администратора, врача, управляющего и руководителя;
- подробный `/render/` администратора;
- канонические исходники в `site-raimovdental/public/**`;
- обязательное попадание demo-ресурсов в `site-raimovdental/dist/**`;
- полный rollback-safe deploy;
- fixed URL smoke для семи production-маршрутов;
- временный passwordless-режим demo-поверхностей;
- защита от параллельных и устаревших deploy;
- аварийное восстановление из канонического `dist`;
- backup и audit evidence;
- Definition of Done для будущих изменений интерфейсов.

Отдельно зафиксирован обнаруженный failure mode: полный deploy с `rsync --delete` удалял `/assets/img/workspace/`, потому что старый builder не включал workspace в `dist`. Постоянное исправление — включение workspace в каноническую сборку, обязательный build-test и all-links production smoke.

## 2026-08-03 — создан операционный контур Expert Dental

Созданы:

- операционный индекс проекта;
- каноническая архитектура файлов;
- система планирования и отчётности;
- реестр материалов;
- реестр ссылок;
- период `month-01`;
- операционное представление строгого плана из 16 пунктов;
- текущий статус исполнения;
- архив промежуточного отчёта за первые две недели;
- шаблон отчёта;
- шаблон регистрации нового материала;
- автоматический guard архитектуры и реестров.

Зафиксированы:

- 5 смысловых блоков первого месяца без изменения 16 пунктов;
- клиентские страницы планов и отчётов;
- страницы `expertdental.kg`, созданные в первые две недели;
- 9 статей как пакет с отсутствующим пока перечнем прямых URL;
- интерфейсы владельца, управляющего, врача и администратора;
- 11 новых отзывов Google Maps и 20 новых отзывов 2ГИС;
- обязательное правило регистрации каждого будущего материала и URL.

Автоматическая проверка контролирует:

- наличие канонических файлов;
- ровно 16 пунктов в 5 блоках;
- уникальность и непрерывность `ED-MAT-###` и `ED-LINK-###`;
- наличие ключевых URL;
- факты промежуточного отчёта;
- сохранение запрета на Cursor без прямой команды пользователя.

## Политика изменений

В этот журнал вносятся только изменения:

- структуры файлов;
- канонического маршрута документов;
- состава реестров;
- правил планирования и отчётности;
- добавления или закрытия периода;
- клиентского брендинга и канонического тона отчётности.

Ежедневные действия и результаты фиксируются в `STATUS.md` и периодных отчётах, а не здесь.
