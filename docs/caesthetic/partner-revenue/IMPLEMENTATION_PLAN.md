# CPRP — этапы реализации и definition of done

Документационный пакет v1 создан по запросу владельца. Дальнейшие работы — явный task graph, не утверждение выполненной реализации.

| Этап | Результат | Зависимость | Проверка |
|---|---|---|---|
| A. Canon/routing | Master, тематические контракты, templates, offer reuse, pilot adapter | Текущий запрос | Ссылки, scope/ownership, отсутствие дублирующих правил, main |
| B. Pilot operating setup | Client mandate, partner shortlist, program kit, роли/backup, финальная экономика | Выбранный клиент/рынок | Digital negotiation path и заполненные параметры |
| C. CRM capability discovery | Twenty schema/roles и SQNS capability report | Реальный доступ/ответ SQNS | Нужные IDs, fields, payments/refunds, export/API |
| D. Registry & entry | Общая ссылка, форма employee с паспортом, отдельный доступ участника/HR, manual verification, member/referral IDs, оплаченная квота и очередь выдачи | Program/Schedule/product binding; [role experience](PROGRAM_EXPERIENCE.md) | Прямая/семейная/referral ветки; HR scope; zero stock; параллельная последняя единица; source spoofing/duplicate |
| E. CRM sync & ledger | Client adapter, inbox/outbox, allocations, fee engine, Twenty projections | C/D + финансовый источник | Replay, out-of-order, cross-client isolation, refunds |
| F. Controlled pilot | Одно фактическое размещение, реальные обращения и сверка | Готовность B–E либо явно обозначенный C1 | End-to-end и measurable contribution |
| G. Event pilot | Отдельный bilateral или multiparty brief и P&L | Реальные audience/inventory commitments | Fulfillment, cost, source/influence, sponsor reconciliation |
| H. Scale | Второй клиент/партнёр/рынок без fork глобального кода/канона | Verified cohort и capacity | Новый adapter/profile, нет data/fee leakage |

Research/kit/templates и synthetic integration work можно вести параллельно с ожиданием SQNS. Contract signing, communication sending, paid events и production changes отражаются фактическими событиями; этот docs scope их не выполняет.

## Предлагаемый будущий технический layout

В существующей инфраструктуре:
- `supabase/migrations/`: CPRP program/attribution/ledger schemas + tenant isolation.
- `supabase/functions/` или действующий backend: entry/handoff/ingestion по подтверждённому deployment contract.
- `scripts/caesthetic/partner-revenue/`: adapter mappings, controlled imports, replay/reconciliation.
- `tests/caesthetic/partner-revenue/`: необходимые финансовые/tenancy/integration cases.
- Twenty: проверенная workspace schema/configuration, не неуправляемый набор ручных custom fields.

Эти каталоги — место будущей реализации, не созданные/развёрнутые компоненты. Не добавлять новый site root или runtime project ради хранения документации.

## Необходимые сценарии проверки реализации

New member; referral child/grandchild в заданном window; ineligible guest; repeated registration; family shared number; active legacy patient; reactivation without open deal; partially paid membership; sponsor-funded bulk inventory; complimentary issuance; mixed payment; partial/full refund; late chargeback; cross-client event IDs; missed webhook; Twenty outage; source correction; currency conversion; contract termination tail; sponsor cancellation.

Дополнительно для HR: регистрация при 0; подтверждение при 0 без выдачи; два запроса на последнюю единицу; повтор submit/approve; паспорт с буквами/ведущими нулями; смена паспорта; доступ чужого HR; исправление данных; пополнение/возврат квоты; отсутствие паспорта в логах/уведомлениях; отсутствие закупочного баланса в participant API; закрытие ожидания без ложной активации.

Проверки должны подтверждать бизнес-инварианты, а не только совпадение полей со схемой.

## Delivery states

- ARCHITECTURE_DEFINED: документы и route graph на main.
- CONFIGURED: реальные credentials/schema/program binding проверены; без утверждения business results.
- PILOT_ACTIVE: есть живое размещение, операционная готовность и разрешённые участники.
- VERIFIED: есть цепочка до подтверждённых оплат, двусторонняя сверка, contribution/capacity evidence.
- SCALE_READY: повторяемость на нескольких циклах/когортах и готовность нового клиента/рынка.

В ходе разработки текущий status, blocker owner и следующий исполнимый шаг хранятся в CAESTHETIC runtime journal. Evidence до main не означает shipped; docs-only release не требует production deploy.
