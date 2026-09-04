---
title: Expert Dental Studio — операционный индекс проекта
status: CANON
version: 1.7
created: 2026-08-03
last_updated: 2026-08-30
project: expert-dental-bishkek
repository: zaomir/grainee-v2
branch: main
---

# Expert Dental Studio — операционный индекс проекта

Это точка входа во все планы, отчёты, материалы, интерфейсы и ссылки по текущей работе с клиникой **«Эксперт Дентал Студия», Бишкек**.

Общая архитектура экосистемы уже существует в `docs/ssot/RAIMOV_ECOSYSTEM_PROJECT_ARCHITECTURE.md`. Этот каталог не дублирует стратегию RAIMOV: он является отдельным операционным контуром действующей клиники Expert Dental.

## Канонические источники

| Предмет | Источник истины |
|---|---|
| Общая стратегия клиники и экосистемы | `docs/ssot/EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md` |
| RAIM SMILE patient acquisition | `docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md` · DEC-856 |
| RAIM SMILE lead routing / CRM | `docs/raimov/patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md` |
| RAIM SMILE 90-day case economics input | `docs/raimov/clinic-growth/RAIM_SMILE_PROFITABILITY_INPUT.md` |
| RAIM SMILE visual source audit | `docs/raimov/content/RAIM_SMILE_ASSET_AUDIT.md` |
| Access & Continuity (срочный вход / Паспорт) | `docs/ssot/RAIMOV_ACCESS_CONTINUITY_SYSTEM.md` |
| Мотивация пациентов (Care 12 / Points / referral) | `docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md` |
| Post-Visit Feedback Loop (CSAT → отзывы / recovery) | `reputation/POST_VISIT_FEEDBACK_LOOP.md` · DEC-787 |
| Атомарный план внедрения Review Hub | `reputation/IMPLEMENTATION_PLAN_ATOMIC.md` · pilot `clinic.raimovdental.com` |
| Прайс ala-carte + Care 12 SKU | `pricing/PRICE_CATALOG.json` · `pricing/PRICE_TABLE.md` |
| Прайс из FAQ-брифа (110 строк, не override каталога) | `pricing/MARKETING_FAQ_PRICE_WORKBOOK.md` |
| Врачи / роли на сайте | `DOCTORS_REGISTER.md` · `tilda/doctors/` |
| Маркетинг FAQ: кто что лечит, консультации, слоты | `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md` |
| CRM/MIS, телефония, WhatsApp, подписание, evidence и pilot gates | `docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md` |
| Детализация managed voice/WABA (подчинена master SSOT) | `docs/ssot/EXPERT_DENTAL_OMNICHANNEL_COMMUNICATIONS.md` |
| Гайдбук администратора: обучение, сложные ситуации, суфлёр, PDF | `scripts/ADMIN_GUIDEBOOK_SSOT.json` · ED-MAT-073 |
| План первого месяца | `docs/ssot/EXPERT_DENTAL_MONTH_1_PLAN_AND_REPORTS.md` |
| Lessons/retrospective для будущих Sprint и add-ons | `docs/ssot/EXPERT_DENTAL_MONTH_1_RETROSPECTIVE.md` |
| Сайт `expertdental.kg` и блог | `docs/ssot/EXPERT_DENTAL_WEBSITE_SSOT.md` |
| Архитектура файлов Expert Dental | `FILE_ARCHITECTURE.md` |
| Правила планирования и отчётности | `PLANNING_AND_REPORTING.md` |
| Все созданные материалы | `MATERIALS_REGISTER.md` |
| Все известные ссылки | `LINKS_REGISTER.md` |
| История изменений контура | `CHANGELOG.md` |

## Периоды работы

| Период | План | Текущий статус | Отчёты |
|---|---|---|---|
| Первый месяц | `periods/month-01/PLAN.md` | `periods/month-01/STATUS.md` | `periods/month-01/reports/` |

## Клиентская витрина планов и отчётов

- периоды: `https://raimovdental.com/ru/valeria/`;
- первый месяц: `https://raimovdental.com/ru/valeria/month-1/`;
- план: `https://raimovdental.com/ru/valeria/month-1/plan/`;
- отчёты: `https://raimovdental.com/ru/valeria/month-1/reports/`.

Доступ: открытый URL (`noindex`); парольный gate снят 2026-08-07.

---

# Архитектура демонстрационных интерфейсов Expert Dental

## Назначение

Демонстрационный контур используется для промежуточной презентации владельцу клиники. Он показывает сквозную операционную логику:

`обновление → обучение → тест → допуск → начало смены → обращение → передача ответственности → контроль руководителя`.

Это демонстрационный MVP без CRM, телефонии и реальных данных пациентов. Временное отключение паролей относится только к перечисленным ниже demo-маршрутам и не отменяет защиту других внутренних разделов сайта.

## Публичные demo-маршруты

| Поверхность | Production URL | Назначение |
|---|---|---|
| Стартовая презентационная страница | `https://raimovdental.com/assets/img/workspace/` | Карточки ролей и инструкция по презентации владельцу |
| Презентация для Атабека (со скриншотами) | `https://raimovdental.com/assets/img/workspace/presentation/` | Функционал, результаты, скриншоты 4 ролей + `/render/` |
| План закрытия пунктов месяца-1 через UI | `periods/month-01/WORKSPACE_INTERFACE_CLOSURE_PLAN.md` | Пункты 1, 4, 5, 7, 8, 10, 11 |
| Атомарный план UI-закрытия | `periods/month-01/WORKSPACE_INTERFACE_ATOMIC_PLAN.md` | Атомы I0.* … IP.* |
| Общий ролевой runtime | `https://raimovdental.com/assets/img/workspace/app.html` | Общий интерфейс, загружаемый ролевыми оболочками |
| Администратор | `https://raimovdental.com/assets/img/workspace/admin/` | Обращения, обучение, смена и маршрутизация |
| Врач | `https://raimovdental.com/assets/img/workspace/doctor/` | Принятие обращения, медицинские задачи и дежурство |
| Управляющий | `https://raimovdental.com/assets/img/workspace/manager/` | Команда, допуски, обучение и пересдачи |
| Руководитель клиники | `https://raimovdental.com/assets/img/workspace/owner/` | Сводка, стандарты, риски и контроль |
| Подробный рендер администратора | `https://raimovdental.com/render/` | Пошаговый сценарий звонка и передачи врачу |
| Печатная версия гайдбука | `https://raimovdental.com/assets/img/workspace/content/admin-guidebook.print.html` | Версия для браузерной печати из того же SSOT; noindex |

Все demo-маршруты должны оставаться `noindex`. На период презентации `app.html` и `/render/` открываются без пароля.

## Канонические исходники

```text
site-raimovdental/public/assets/img/workspace/
├── index.html                 # стартовая презентационная страница
├── app.html                   # общий passwordless runtime
├── admin/index.html           # оболочка роли администратора
├── doctor/index.html          # оболочка роли врача
├── manager/index.html         # оболочка роли управляющего
├── owner/index.html           # оболочка роли руководителя
├── motion.css
└── motion.js

site-raimovdental/public/assets/img/admin/
├── index.html                 # подробный /render/
├── app.js
├── app.css
└── ...                        # модули журнала, передачи врачу и UX
```

Изменения в production нельзя делать только прямой загрузкой файлов на сервер. Сначала меняется источник в `site-raimovdental/public/**`, затем изменения проходят каноническую сборку.

## Канонический жизненный цикл

```text
source в site-raimovdental/public
        ↓
build:raimovdental
        ↓
site-raimovdental/dist
        ↓
локальные обязательные тесты
        ↓
полный rollback-safe deploy
        ↓
origin smoke
        ↓
public edge smoke
        ↓
зафиксированный audit result
```

### 1. Сборка

Основная команда:

```bash
npm run build:raimovdental
```

После генерации стратегических страниц builder обязан сохранить оба операционных контура:

```text
site-raimovdental/dist/assets/img/admin/
site-raimovdental/dist/assets/img/workspace/
```

Workspace копируется в `dist` через:

```text
scripts/raimov/preserve-demo-assets.mjs
```

Это обязательная часть сборки, а не временный post-deploy workaround.

### 2. Защита сборки

Обязательные проверки:

```text
tests/raimovdental/admin-render.test.mjs
tests/raimovdental/admin-guidebook-ssot.test.mjs
tests/raimovdental/workspace-mvp.test.mjs
tests/raimovdental/run-all.mjs
```

`workspace-mvp.test.mjs` должен проверять как исходники, так и итоговый `dist` после полного build. Минимальный обязательный набор:

```text
assets/img/workspace/index.html
assets/img/workspace/app.html
assets/img/workspace/admin/index.html
assets/img/workspace/doctor/index.html
assets/img/workspace/manager/index.html
assets/img/workspace/owner/index.html
assets/img/workspace/motion.css
assets/img/workspace/motion.js
```

Тест также обязан подтверждать:

- наличие инструкции «Как презентовать владельцу»;
- наличие четырёх ролевых карточек;
- загрузку ролевыми оболочками `../app.html`;
- отсутствие password-поля и встроенных ролевых паролей в demo-runtime;
- сохранение `noindex`;
- наличие мобильной адаптации.

### 3. Production deploy

Канонический workflow:

```text
.github/workflows/deploy-raimovdental.yml
```

Канонический deploy script:

```text
scripts/ci/cutover-raimovdental.sh
```

Полный deploy использует `rsync --delete`. Поэтому **любая production-поверхность, которой нет в `site-raimovdental/dist`, будет удалена с сервера**. Нельзя полагаться на файлы, вручную загруженные в webroot.

Production workflow использует общую concurrency-группу:

```text
deploy-raimovdental-production
```

Новый запуск должен отменять незавершённый старый запуск. Это снижает риск того, что параллельный агент задеплоит устаревший snapshot после более нового.

### 4. Обязательный production smoke

Полный deploy не считается успешным, пока не проверены:

```text
/assets/img/workspace/
/assets/img/workspace/app.html
/assets/img/workspace/admin/
/assets/img/workspace/doctor/
/assets/img/workspace/manager/
/assets/img/workspace/owner/
/render/
```

Для каждой страницы проверяются:

1. HTTP `200`;
2. уникальный ожидаемый marker страницы;
3. отсутствие password-поля на временно открытых demo-поверхностях;
4. корректная загрузка `app.html` ролевыми оболочками;
5. отсутствие утечки секретов.

Актуальные evidence-файлы:

```text
docs/audits/raimovdental-links/ALL_LINKS_LAST_CHECK.md
docs/audits/raimovdental-workspace/LAST_RUN.md
docs/audits/raimovdental-workspace/RESTORE_LAST_RUN.md
docs/audits/raimovdental-render/DEPLOY_LAST_RUN.md
```

## Защита от параллельных агентов

### Обнаруженный failure mode

Параллельный агент выполнил полный deploy сайта после точечного размещения workspace. Старый builder сохранял `/assets/img/admin`, но не включал `/assets/img/workspace` в `dist`. Полный `rsync --delete` удалил workspace с production, и шесть URL стали отдавать `404`.

### Постоянное исправление

1. Workspace включён в каноническую сборку `dist`.
2. Добавлен обязательный тест сохранности workspace после полного build.
3. Основной deploy проверяет все demo-маршруты после синхронизации.
4. Все полные deploy используют одну concurrency-группу с `cancel-in-progress: true`.
5. Точечный deploy допускается только как аварийное восстановление и не заменяет исправление builder-а.

### Правило для любого агента

Перед изменением или деплоем `site-raimovdental/**` агент обязан:

1. обновить локальную ветку из `origin/main`;
2. проверить последние коммиты других агентов;
3. не использовать старый SHA как источник полного deploy;
4. убедиться, что новая поверхность попадает в `dist`;
5. запустить обязательные тесты;
6. после deploy проверить весь fixed URL set, а не только изменённую страницу;
7. не завершать задачу без production evidence.

Если параллельно идёт другая работа по `site-raimovdental`, предпочтительны:

- согласованный один владелец полного deploy;
- точечные deploy для независимых каталогов;
- финальный полный deploy только с актуального `main`;
- повторный all-links smoke после последнего параллельного запуска.

## Аварийное восстановление

Если workspace снова возвращает `404`:

1. Не копировать исходники напрямую из `public` как окончательное решение.
2. Выполнить канонический build.
3. Убедиться, что workspace существует в:

```text
site-raimovdental/dist/assets/img/workspace/
```

4. Создать backup текущего production-каталога.
5. Синхронизировать workspace из `dist`.
6. Проверить шесть workspace URL и `/render/`.
7. Зафиксировать результат и backup path в audit-файле.
8. Проверить builder и основной workflow, чтобы следующий полный deploy не повторил удаление.

Резервные копии workspace создаются на production-хосте в каталоге вида:

```text
/root/raimov-workspace-backups/<UTC_TIMESTAMP>/
```

Резервные копии `/render/` создаются отдельно:

```text
/root/raimov-render-backups/<UTC_TIMESTAMP>/
```

## Definition of Done для интерфейсов

Изменение интерфейса Expert Dental завершено только когда выполнены все условия:

- исходник находится в каноническом `site-raimovdental/public/**`;
- полный build переносит его в `site-raimovdental/dist/**`;
- обязательные тесты проходят;
- изменение находится в `main`;
- production deploy завершён;
- все семь обсуждаемых URL проверены после последнего deploy;
- passwordless-статус demo-поверхностей соответствует текущему решению;
- audit evidence записан;
- `MATERIALS_REGISTER.md`, `LINKS_REGISTER.md` и `CHANGELOG.md` актуализированы при изменении состава материалов или маршрутов.

---

## Обязательное правило учёта

Каждый новый документ, страница, статья, интерфейс, QR-материал, таблица, отчёт, презентация, файл, опубликованный маршрут или внешняя ссылка по Expert Dental должен быть внесён:

1. в `MATERIALS_REGISTER.md` — как материал;
2. в `LINKS_REGISTER.md` — если у него есть URL;
3. в отчёт соответствующего периода — если материал создан в рамках плана;
4. в `CHANGELOG.md` — если меняется архитектура, канон или состав реестров.

Материал считается переданным только после фиксации источника, статуса и ссылки либо явной отметки, что URL отсутствует.

## Неизменные ограничения

- Первый месяц состоит строго из 16 утверждённых пунктов.
- Новые задачи нельзя добавлять в первый месяц, объединять с существующими или выдавать за согласованный объём без прямой команды пользователя.
- Активность нельзя выдавать за бизнес-результат без данных.
- Публикация отзывов, рейтинг и позиции на картах не гарантируются.
- Реальные пациентские данные, медицинские файлы, пароли и секреты в Git не помещаются.
- Cursor не использовать и не запускать без прямой команды пользователя.
