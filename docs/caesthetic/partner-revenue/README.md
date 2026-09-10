# CPRP — файловая архитектура и маршрутизация

Старт: [глобальный канон](../../ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md). Версия пакета: 1.2.0, 2026-09-10. Владелец — CAESTHETIC. Каноны определяют модель; текущий код и проверяемая готовность описаны в RUNTIME_IMPLEMENTATION. Документ сам по себе не подтверждает production, outreach или договор.

## Навигация по задачам

| Намерение | Читать после master |
|---|---|
| Инструкция координатора, кабинеты и реализация | [Coordinator guide](COORDINATOR_GUIDE.md) → [Runtime](RUNTIME_IMPLEMENTATION.md) → [CRM API](CLIENT_CRM_API.md) |
| Как программа выглядит снаружи; участник, HR, сотрудник CAESTHETIC или клиники | [Program experience](PROGRAM_EXPERIENCE.md) → [Membership](MEMBERSHIP_AND_ELIGIBILITY.md) |
| Объяснить бизнес, границы, роли | [Architecture](ARCHITECTURE.md), [Economics](ECONOMICS.md) |
| Подготовить оффер Caesthetic любому клиенту | [Offer reuse](OFFER_REUSE.md) → [Program brief](templates/PARTNER_PROGRAM_BRIEF.md) |
| Найти партнёров, подготовить контакт, передать координатору | [Partner operations](PARTNER_OPERATIONS.md) |
| Продать/подарить абонемент | [Membership](MEMBERSHIP_AND_ELIGIBILITY.md) |
| Разработать регистрацию и рефералы | [Data model](DATA_MODEL.md) → [Attribution](ATTRIBUTION_AND_LEDGER.md) |
| Интегрировать Twenty с SQNS или иной CRM | [Sync](TWENTY_SYNC_CONTRACT.md) → [Markets](MARKETS_AND_DATA.md) |
| Рассчитать 30/10, платежи, возвраты, спор | [Economics](ECONOMICS.md) → [Ledger](ATTRIBUTION_AND_LEDGER.md) → [Schedule](templates/COMMERCIAL_SCHEDULE.md) |
| Подготовить Health Day, вебинар, экспозицию | [Events](EVENTS.md) → [Event brief](templates/EVENT_BRIEF.md) |
| Запустить Expert Dental | [KG pilot](PILOT_EXPERT_DENTAL_KG.md) |
| Новая страна / новый клиент | [Markets](MARKETS_AND_DATA.md) → локальные market/client bindings |
| Решить, что делать дальше | [Implementation](IMPLEMENTATION_PLAN.md), [Decisions](DECISIONS.md) |
| Проверить происхождение рекомендации | [Research](RESEARCH.md) |

## Файлы и иерархия

| Слой | Путь | Назначение |
|---|---|---|
| Глобальный мастер | `docs/ssot/CAESTHETIC.md` | Позиционирование и общая коммерческая модель Caesthetic |
| Канон CPRP | `docs/ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md` | Единая международная модель |
| Контракты реализации | `docs/caesthetic/partner-revenue/*.md` | Тематические правила из таблицы выше |
| Шаблоны | `docs/caesthetic/partner-revenue/templates/*.md` | Повторно используемые пустые briefs и Schedule |
| Машинный каталог | `docs/caesthetic/partner-revenue/registry.json` | Владельцы тем, точки входа, status и pilot binding |
| Текущий pilot binding | `PILOT_EXPERT_DENTAL_KG.md` | Только локальные различия, ссылки на медицинский/продуктовый канон |
| Будущие market bindings | `markets/{ISO-3166-1-alpha-2}/PROFILE.md` | Создаются при выборе следующего рынка |
| Будущие клиентские bindings | `clients/{client_id}/{market_id}/PROGRAM.md` | Только конфигурация без PII и подписанных приватных приложений |
| История решений | `DECISIONS.md` | Дата, источник решения, изменение, что замещено |
| Состояние разработки | `docs/runtime/projects/caesthetic/sessions/` | Проверяемая готовность документации/реализации; не правила продукта |
| Код v1.2 | `infra/cloudflare/router/src/cprp*.ts`, `site-caesthetic/program/`, `scripts/caesthetic/partner-revenue/` | Существующие runtime units; фактический release status отдельно |

В репозитории не лежат реальные контакты пациентов, партнёрские client lists, токены, подписанные договоры, счета с персональными данными или выгрузки платежей. Реестры Twenty, restricted identity store и ledger — runtime, а не Markdown/CSV в Git.

## Маршруты из всех контуров CAESTHETIC

| Исходный контур | Как использовать CPRP |
|---|---|
| Корневые AGENTS, docs/ROUTER, ChatGPT project instructions | Триггеры: Partner Revenue Platform, партнёрская программа, affinity/benefits, partner outreach, Twenty client sync, Health Day, sponsorship |
| CAESTHETIC domain/runtime router и manifest | Ссылка на master и эту таблицу без копии правил |
| Products & Services / B16 | Самостоятельная capability; ограниченный setup, ongoing operations и event SOW имеют отдельный scope |
| Growth Score / Multi-location Score | Можно отметить проверяемую возможность канала; не выводить дефицит партнёров из отсутствия публичной страницы |
| Check / Growth Economics | Проверить source/payment evidence, capacity, unit economics и возможное наложение performance fees |
| Sprint / Growth System | Принять конкретный этап по SOW; ongoing partner management не подразумевается автоматически |
| Connect4 | Партнёрская дистрибуция — источник спроса; не пятая поверхность и не новый scored dimension |
| Client offers / sales objections | Обязателен OFFER_REUSE; клиентская релевантность, стадия готовности, точный scope |
| Outbound / new-medspa discovery | Поиск будущих клиентов Caesthetic и поиск партнёров для клиента имеют разные pipelines и suppression scopes |
| Cases / reports / social | Упоминание возможности допустимо; результат требует измерений и права публикации |
| Healthcare / RAIM SMILE / Expert Dental | Глобальный CPRP → KG pilot → локальные продукт/оператор/eligibility документы |
| Platform / Twenty | CRM contract + sync contract; без копирования медицинского workflow |
| Supplier / Bototox / Toxifillers | Роль поставщика/спонсора только по релевантности события; не обязательный preferred supplier |

## Источники истины и зеркала

Authority: `zaomir/grainee-v2/main`. `zaomir/caesthetic` получает `docs/ssot/CAESTHETIC*.md` и `docs/caesthetic/**` через действующий SYNC_MANIFEST. Новое SSOT добавлено в protected-in-target: изменения канона разрешаются через main, а не случайным обратным overwrite.

Expert/RAIM satellite получает ссылку через его project routing; если глобального файла нет в зеркале, читать тот же путь на main. Не создавать отдельную RAIM-owned копию CPRP. Добавление страны или клиента — adapter, а не новый master.

Изменение правила: обновить тематический owner → при изменении бизнес-границы master → Decision log → registry version/consumer links при необходимости. Текущие договоры сохраняют зафиксированную версию; ретроактивный перерасчёт требует явного основания.
