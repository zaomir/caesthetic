# CPRP — синхронизация Twenty и CRM клиента

Authority: [TWENTY_CRM](../../ssot/TWENTY_CRM.md), [Data model](DATA_MODEL.md). Статус: канон полного обмена; реализованный v1 subset см. [Runtime](RUNTIME_IMPLEMENTATION.md) / [CRM API](CLIENT_CRM_API.md). Для SQNS API/события/доступ ещё должны быть подтверждены поставщиком и проверены в пилоте.

## 1. Существующий код и новое расширение

На baseline main `5b78b02d68b3afee2794fb976a56dcc75c0c8e9e` уже существует `supabase/functions/twenty-sync/index.ts`: передача событий orders/wallet в VDS sync. Это инфраструктурный precedent, а не готовая интеграция CPRP/SQNS. Текущие Opportunity/token правила старого outreach не распространяются на CPRP автоматически.

Twenty — операционная CRM CAESTHETIC. Client CRM ↔ CPRP integration ↔ Twenty — управляемая синхронизация отдельных полей с явным владельцем каждого поля; не двустороннее копирование всей базы.

## 2. Владельцы данных и направления

| Данные | Владелец | Синхронизация |
|---|---|---|
| Партнёр, B2B-контакт, переговоры, next action, owner, backup | Twenty | Twenty → registry/execution, разрешённые metadata |
| Program/Schedule effective version | CPRP registry после договорного evidence | → Twenty, → source tags CRM |
| Регистрация, eligibility, referral lineage, transfer permission | CPRP | → CRM клиента минимальный разрешённый handoff; → Twenty opaque state |
| Паспорт и HR verification evidence | Restricted CPRP verification store | В Twenty только identity_ref/status; в клиентскую CRM паспорт автоматически не передаётся |
| Оплаченная квота, ожидание и выданный entitlement | CPRP inventory/registry | → защищённый HR portal; → Twenty summary/task; → CRM клиента только разрешённый entitlement handoff |
| Пациент/контакт, booking, cancellation, visit, fulfilment | CRM клиента | → CPRP normalized events → Twenty summary |
| Оплата, возврат, allocation к продукту | Финансовый SoR клиента / подтверждённый CRM feed | → ledger → Twenty summary |
| Fee, attribution decision, reconciliation, paid-to-Caesthetic | CPRP ledger + платежный evidence | → Twenty read-only projection |
| Изменение записи/контакта из Twenty | Только разрешённая command со ссылкой на запрос | → adapter → CRM; результат подтверждает CRM |
| Диагноз, анамнез, снимки, назначения, clinical notes | Медицинская система клиента | Не синхронизируются в Twenty/партнёрскую отчётность |

Никакой last-write-wins между CRM и Twenty. CRM-owned поля в Twenty не могут исправить underlying fact; ручное исправление создаёт exception/command и получает отдельный result.

## 3. Twenty mapping

Native Company/Person — организации и **B2B-контакты**. Пациентская identity не превращается в доступный всем Person. Native Opportunity имеет тип и связи client/partner/program/market. Custom objects: Program, Placement, Event, Participation, AgreementRef, SettlementSummary, SyncException; ProgramMemberSummary допускается только с opaque IDs и разрешённой областью доступа.

Официальная документация подтверждает API на базе workspace schema и custom objects. До разработки читать schema конкретного установленного workspace, версию, доступные relations, service role и реальные API limits. Имена logical fields не являются проверенными endpoints. [Twenty API](https://docs.twenty.com/developers/extend/api).

Ключ ограничивается service role. Поля, которым нельзя дать требуемое разграничение, не помещаются в общий workspace.

## 4. Надёжность

1. Connector authenticates source; при webhook проверяет подпись и допустимый возраст/replay согласно конкретному провайдеру.
2. Durable inbox сохраняет событие и dedup key; успешный ACK только после надёжного приёма.
3. Worker нормализует allowlisted поля и scope, выполняет идемпотентную запись.
4. Transactional outbox создаёт проекцию Twenty и разрешённую downstream command.
5. Retry с backoff/jitter, ограничением параллелизма и провайдерскими лимитами. После исчерпания — dead-letter + owner + причина + next action.
6. `origin_system, source_version, causation_id` и checksum предотвращают echo loops.
7. Cursor/checkpoint и периодическая сверка выявляют пропущенные webhook events. Не предполагается exactly-once доставка.
8. Events out of order не отменяют подтверждённый payment новым старым статусом. Missing parent/payment links ждут обработки; денежная база пока unresolved.
9. Реплей той же пачки не создаёт второй lead, payment или fee.

Twenty документирует подписанные webhook notifications, включая custom objects; характеристики установленной версии проверяются отдельно. [Twenty webhooks](https://docs.twenty.com/developers/extend/webhooks). Повторы и отсутствие гарантии порядка — штатные условия event integrations; механизм очереди и dedup соответствует [Stripe webhook guidance](https://docs.stripe.com/webhooks), но это не утверждение, что SQNS ведёт себя как Stripe.

## 5. Capability matrix каждого CRM adapter

Зафиксировать: vendor/version; API/export/auth; external ID/custom source fields; создание lead или только linking; контакты/appointments/visits/membership/paid/refund data; financial allocation; webhook/revision/delete support; pagination; backfill; rate limit; timezone/currency; staging; residency; scopes; evidence URL/date.

Уровни:
- C0: specification only.
- C1: контролируемый минимальный export/import со стабильными IDs, batch checksum, проверенной сверкой и журналом.
- C2: scheduled API sync + reconciliation.
- C3: события + backfill + регулярная сверка.

C1 может проверить бизнес при отсутствии API, но не называется автоматической синхронизацией. Если нет достоверных payments/refunds, расчёт остаётся provisional. Не создаём вторую CRM ради обхода ожидания SQNS.

## 6. Ops и acceptance

Pilot targets как параметры, а не обещанный SLA: daily reconciliation; sync freshness ≤24h при C1; для C2/C3 lag target устанавливается после capacity test. Dashboard содержит last success, lag, pending, failed, unmatched, scoped record counts и сверенные суммы по валюте.

Обязательные проверки до live: две компании с одинаковым external ID; shared family phone; duplicate и out-of-order event; partial refund; source merge; Twenty outage/recovery; unauthorized cross-client read/write; replay after timeout; revoked access; reconciliation after missed webhook.

Disconnect прекращает команды, отзывает credential, сохраняет разрешённый audit trail/settlement tail и выполняет retention rules. Нельзя удалением CRM записи терять финансовую историю или самовольно сохранять её бесконечно.
