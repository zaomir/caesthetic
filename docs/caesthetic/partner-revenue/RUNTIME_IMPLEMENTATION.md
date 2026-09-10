# CPRP — рабочая реализация v1.2

2026-09-10. Source-пакет: LOCAL_VERIFIED / PRODUCTION_PENDING. Фактические production/CRM проверки фиксируются в release receipt; наличие кода не означает активный пилот.

## Рабочие страницы

| Путь | Назначение |
|---|---|
| `/program/?slug={slug}` | Одна общая ссылка для SMS партнёра |
| `/program/join/?slug={slug}` | Имя, фамилия, номер паспорта, телефон, согласие и ключ доступа |
| `/program/member/` | Личный статус, абонемент, referral-ссылка и повторный вход |
| `/program/access/#invite=...` | Одноразовый доступ сотрудника или восстановление участника |
| `/program/staff/` | HR/Caesthetic: проверка, остатки и выдача; ops: настройка/финансы |
| `/program/guide/` | Инструкция координатора |
| `https://evo.do/admin/cprp/` | Существующая авторизация администратора EVO → личный ключ CPRP |

Публичные HTML-оболочки не содержат реестр участников. API проверяет роль и scope каждой операции. Персональные ответы no-store; cookie Secure/HttpOnly/SameSite=Strict, 8 часов. HR и координатор видят только назначенные программы; ops управляет настройкой. Координатор не получает полный паспорт.

## Архитектура и учёт

Существующий Cloudflare Worker `grainee-caesthetic-public`, `/api/cprp/*`; SQLite Durable Object `CaestheticPartnerRegistry`, binding `CPRP`. В нём registry, quota, movements, ledger, audit, inbox/outbox и opaque client links. Первый data plane — EU jurisdiction; международные program IDs не разрешают автоматически трансграничную передачу. У реальной программы должен быть согласованный market/data binding. Нового site-root и медицинской CRM нет.

WebAuthn: resident credential + обязательная user verification; сервер проверяет challenge, origin, RP ID, подпись и счётчик. Challenge одноразовый, 5 минут. Первый вход создаёт ключ, последующие используют его. Телефон — контакт, `phone_verified=false`; SMS ownership не заявляется. HR может повторно проверить личность и создать восстановление: старые ключи/сеансы заменяются, participant ID сохраняется. Браузерные проверки используют виртуальный аутентификатор; это не аппаратная проверка всех моделей телефонов.

Паспорт и контакты зашифрованы AES-GCM; HMAC lookup ограничен программой и страной выдачи. Паспорт не пароль, не попадает в Twenty и не передаётся клиентской CRM. Фотография/скан не запрашиваются. Один телефон не объединяет людей.

Регистрация не резервирует квоту. Eligibility и выдача — разные состояния. HR проверяет и при нулевом остатке; участник видит корректное ожидание без бюджета банка. Выдача списывает одну единицу атомарно; повторы не списывают повторно. Купленная и бесплатная квоты различаются. Закупка создаёт membership revenue один раз, выдача не создаёт вторую продажу. Деньги — integer minor units, ставки — basis points, округление — целочисленное. Refund использует исходную ставку и Schedule; сумма возвратов не превышает исходный платёж.

## Twenty

Настройка считывает реальную metadata schema, добавляет отсутствующее и проверяет повторным чтением:

- `cprpProgram`, `cprpPlacement`, `cprpEvent`, `cprpParticipation`, `cprpAgreement`, `cprpSettlement`, `cprpSyncException`.
- Native Company/Person — организации и B2B-контакты. Пациентский Person не создаётся.
- Opportunity: `cprpClientId`, `cprpPartnerId`, `cprpProgramId`, `cprpMarket`, `cprpType`, `cprpStage`, `cprpBackup`, `cprpNextAction`. Существующая outreach воронка сохраняется.

Координатор связывает Company/Person/Opportunity, назначает владельца и заместителя, фиксирует следующее действие. `cprpType=partner|sponsor`. Этапы переговоров: identified → contacted → qualified → proposal → agreed → placement_live → active; paused/closed — отдельные исходы. Contacted требует фактического контакта; active требует действующего размещения.

В Twenty передаются B2B-атрибуты, остатки и финансовые агрегаты. Запись проверяется чтением. Outbox переживает недоступность CRM; alarm обновляет проекции, повтор через 5 минут, ручная сверка доступна ops. Редактирование проекции Twenty не меняет registry/ledger. Начисление Caesthetic не означает получение денег Caesthetic. B2B-переговоры и планы мероприятий ведутся в Twenty; клинические события остаются у клиента.

## Развёртывание

Штатный deploy-caesthetic: exact main SHA → design gate → VPS origin → Worker → production browser/HR/inventory/Twenty acceptance. Admin handler развёртывает штатный Supabase admin-api workflow; EVO static — production deploy target. Секреты не попадают в git, chat или artifacts.

VPS helper сохраняет identity/provisioning keys и Twenty credential в `/var/lib/caesthetic-partner-revenue/` с 0700/0600. CI получает временный приватный файл, загружает Cloudflare secrets и удаляет файл. Identity key нельзя менять при обычном deploy. Provisioning credential предназначен инфраструктуре; обычный admin вход проверяется существующим EVO admin-session endpoint. HMAC-секрет EVO не копируется в CPRP. SQLite migration добавлена после Amy migration.

## Граница выпуска

Реализован employee/HR контур: регистрация, авторизация/восстановление, manual eligibility, paid/complimentary quota, выдача, referral lineage, минимальный handoff, подтверждения оплаты/возвраты и Twenty projection. Vendor-specific SQNS adapter остаётся клиентской интеграцией: [CLIENT_CRM_API.md](CLIENT_CRM_API.md).

Конкретные условия абонемента, legal/data notices, срок действия, мандат, Commercial Schedule и реальная закупка задаются при заведении программы. «100 абонементов» из примера не является подтверждённой закупкой. QA-программы синтетические, после проверки архивируются; их записи не коммерческая выручка.

Автоматический bank eligibility API, SMS ownership, автоматические сообщения, универсальные appointment write commands, региональные data planes и полный автоматический event P&L не заявляются этим выпуском. Планирование автоматического expiry, reissue и возврат корпоративной закупки с корректировкой квоты требуют отдельного операционного сценария до использования; действующий refund API покрывает клиентские платежи. Не обещать незавершённые функции как live.

## Первичные источники

[Twenty API](https://docs.twenty.com/developers/extend/api), [SimpleWebAuthn server](https://simplewebauthn.dev/docs/packages/server), [browser](https://simplewebauthn.dev/docs/packages/browser), [Cloudflare SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).

[Инструкция координатора](COORDINATOR_GUIDE.md) · [Master](../../ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md).

Client CRM может передать redeemed/expired/revoked с основанием; портал отражает завершение, старое activation его не отменяет. Создание нового recovery приглашения атомарно отзывает прежние неиспользованные приглашения этого участника.
