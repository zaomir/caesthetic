---
title: CAESTHETIC — Attributed Sales Compensation Standard
status: OWNER_APPROVED_COMMERCIAL_OPTION / CLIENT_SCHEDULE_AND_JURISDICTION_GATED
type: ssot
version: 1.0
created: 2026-09-03
last_updated: 2026-09-03
owner: CAESTHETIC commercial operations
parent:
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
decision: docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md
applies_to:
  - caesthetic
  - raim-smile-partnership-network
  - approved-client-partnership-programs
  - future-non-medical-verticals
---

# CAESTHETIC — Attributed Sales Compensation Standard

## 0. Каноническое решение

**CAESTHETIC может получать согласованный процент от продаж клиентам, которых CAESTHETIC привёл или документированно реактивировал.**

Каноническое название модели:

**Attributed Sales Performance Fee**
`плата CAESTHETIC как процент от атрибутированных фактически полученных продаж`.

Это разрешённая коммерческая модель, а не автоматическое условие любого проекта. Она становится начисляемой только после подписанного Commercial Schedule, проверяемой атрибуции, определения базы, ставки, окна, возвратов, налогов и применимых юридических ограничений.

Для медицинских, стоматологических и иных регулируемых услуг owner approval разрешает модель **в принципе**, но не активирует её. До письменного country-specific legal/fiscal approval:

```text
medical_attributed_sales_fee_status = LEGAL_FISCAL_ACTIVATION_GATED
current_payable_rate = 0%
```

## 1. Роль CAESTHETIC

CAESTHETIC может выступать как:

- growth operator;
- Partnership Network Operator;
- marketing integrator;
- lead/acquisition source;
- оператор co-branded программы;
- владелец non-clinical coordination и attribution contour.

Получение процента не делает CAESTHETIC продавцом медицинской услуги, клиникой, лечащим лицом или владельцем клинического решения. Поставщик услуги сохраняет договор с клиентом, кассу, исполнение, возвраты, профессиональную ответственность и обязательные записи своей отрасли.

## 2. Допустимые базы расчёта

Commercial Schedule выбирает **одну** базу для конкретной продажи или когорты.

### 2.1. Net Collected Attributed Sales

Базовая модель, соответствующая решению владельца:

```text
NetCollectedAttributedSales
× AgreedPerformanceRate
= AttributedSalesPerformanceFee
```

`NetCollectedAttributedSales` — денежные средства, фактически полученные и сохранённые поставщиком по eligible sale после вычета:

- возвратов, reversal и chargeback;
- отменённых и неоплаченных счетов;
- налогов с продаж / НДС, если договор определяет их как исключаемые;
- pass-through расходов и финансирования, ещё не полученного поставщиком;
- продаж существующим клиентам, не подпадающим под утверждённую reactivation model;
- иных contract-defined exclusions.

### 2.2. Attributable Contribution Margin

Когда себестоимость существенно различается, стороны могут выбрать более безопасную базу из `CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`:

```text
PositiveAttributableContributionMargin
× AgreedPerformanceRate
= AttributedSalesPerformanceFee
```

Нельзя после окончания периода менять выбранную базу в пользу одной стороны без письменного двустороннего amendment.

## 3. Кто считается клиентом, привлечённым CAESTHETIC

Продажа может попасть в базу только если одновременно выполнены все применимые условия:

1. источник зафиксирован до или в момент первого квалифицированного контакта;
2. существует immutable `source_id`, `partner_id`, campaign reference или другой проверяемый маркер;
3. клиент является новым либо подпадает под заранее определённую reactivation rule;
4. продажа произошла внутри подписанного attribution window;
5. поставщик фактически получил оплату;
6. продажа не была отменена, возвращена или оспорена;
7. dedup не показывает, что клиент уже находился в активной воронке до источника CAESTHETIC;
8. multi-touch rule и priority источников применены одинаково ко всей когорте;
9. разрешённый audit trail достаточен для воспроизводимого расчёта.

Просмотр страницы, клик, лид, звонок, запись, смета, намерение оплатить или неподтверждённый CRM source сами по себе не являются продажей.

## 4. Reactivation

Существующий клиент может считаться документированно реактивированным только если Commercial Schedule заранее определяет:

- минимальный период отсутствия покупок/визитов;
- отсутствие активной сделки или открытого follow-up на дату входа;
- конкретное вмешательство CAESTHETIC;
- новое согласие/обращение, если оно требуется;
- отдельный source marker;
- срок, в течение которого последующая продажа атрибутируется реактивации.

Нельзя задним числом объявлять всю существующую базу «приведённой CAESTHETIC».

## 5. Attribution confidence и спорные случаи

Допустимые уровни:

- `DETERMINISTIC` — уникальная partner/campaign/eligibility метка и подтверждённая цепочка;
- `CORROBORATED` — несколько согласованных first-party источников подтверждают происхождение;
- `ASSISTED` — CAESTHETIC materially assisted, но не является единственным источником;
- `UNRESOLVED` — данных недостаточно или источники конфликтуют.

По умолчанию в процентную базу входят `DETERMINISTIC` и, если это прямо разрешено договором, `CORROBORATED`. `ASSISTED` требует отдельного правила или фиксированной платы. `UNRESOLVED` не начисляется до документированного решения.

Любая human adjustment хранит исходное значение, новое значение, причину, дату и двухстороннее подтверждение.

## 6. Commercial Schedule — обязательные поля

До запуска стороны письменно фиксируют:

- юридические лица и роли;
- продукт/услугу и допустимую территорию;
- выбранную базу расчёта;
- ставку или tiered rates;
- new-customer и reactivation definitions;
- attribution window;
- dedup и multi-touch priority;
- исключения;
- налоги и валюту;
- refund/chargeback/cancellation treatment;
- settlement cadence;
- audit evidence и право на проверку;
- dispute deadline;
- termination и post-termination tail;
- privacy/data-controller boundary;
- для регулируемой отрасли — ссылку на письменный legal/fiscal clearance.

Отсутствие любого обязательного поля означает `NO_FEE_ACCRUAL`, а не право заполнить его задним числом.

## 7. Запрет двойного начисления

Одна и та же денежная база оплачивается CAESTHETIC только один раз.

Если для продажи уже действует:

- SmileCare 12 `30% Partnership Distribution & Management Fee`;
- отдельный CPL/activation fee;
- другая performance compensation;
- reseller/affiliate commission,

Commercial Schedule обязан определить replacement, offset или непересекающиеся базы.

Запрещено начислять одновременно 30% membership fee и второй attributed-sales percentage на одну и ту же фактически полученную сумму без явного non-overlap calculation.

Fixed management, launch, marketing integration и Coordination Fee могут существовать параллельно, если они оплачивают отдельную выполненную работу и не маскируют повторную комиссию с той же продажи.

## 8. Медицинские и стоматологические продажи

Для healthcare применяются дополнительные fail-closed условия.

### 8.1. Что разрешено каноном

CAESTHETIC **может** быть получателем договорного процента от Net Collected Attributed Sales, включая продажи медицинского оператора привлечённым CAESTHETIC пациентам, только после закрытия всех применимых legal/fiscal/advertising/privacy/fee-splitting gates.

### 8.2. Что остаётся неизменным

- диагноз, показания, состав плана, врач и лечение определяет licensed medical operator;
- пациенту раскрывается фактический medical operator;
- ставка CAESTHETIC не влияет на clinical routing, procedure choice или operator eligibility;
- врач, администратор и координатор не получают процент за диагноз, план, процедуру или treatment acceptance;
- medical record и PHI не входят в attribution ledger;
- партнёр не получает диагноз, план, снимки или индивидуальную выручку пациента;
- медицинский оператор выставляет медицинский счёт и отвечает за возврат;
- запрещена скрытая paid ranking или передача пациента менее подходящему оператору ради большей комиссии.

### 8.3. Текущий activation state

До письменного заключения по конкретной юрисдикции и подписанного Commercial Schedule:

```text
CAESTHETIC medical attributed-sales fee = PERMITTED_IN_CANON / NOT ACTIVE
Coordinator medical sales percentage = 0%
Clinician medical sales percentage = 0%
```

## 9. Независимость координатора

Решение относится к доходу юридического/коммерческого контура CAESTHETIC, а не к мотивации Partner & VIP Coordinator.

Компенсация координатора может зависеть от:

- covered hours;
- response SLA;
- полноты handoff;
- отсутствия privacy incidents;
- качества partner portfolio и service recovery;
- соблюдения процесса.

Она не зависит от:

- суммы лечения;
- назначения определённой процедуры;
- принятия плана;
- депозита или collected treatment revenue;
- отказа пациента от second opinion или alternative operator.

## 10. Privacy-safe ledger

Минимальные поля:

- pseudonymous customer/account reference;
- source and partner/campaign reference;
- first qualified contact timestamp;
- new/reactivated classification and rule version;
- attribution confidence;
- eligible sale reference;
- gross collected amount, exclusions and net basis;
- currency;
- refund/reversal/chargeback status;
- rate, calculated fee and schedule version;
- settlement status and timestamps;
- dispute/correction reason and approvers.

Не хранить диагноз, clinical tier, снимки, медицинский текст, содержание жалобы или treatment plan в partnership/performance ledger.

## 11. Settlement и доказательство

Начисление проходит стадии:

```text
sale recorded
→ payment collected
→ attribution verified
→ exclusion/refund window applied
→ fee calculated
→ bilateral reconciliation
→ invoice/settlement
→ append-only correction if required
```

Неоплаченная смета, депозит с правом полного возврата, pending financing или disputed attribution не признаются заработанным fee до contract-defined settlement event.

## 12. Статусы

- `OWNER_APPROVED_OPTION` — модель может предлагаться и включаться в draft Commercial Schedule.
- `CONTRACTED` — подписаны база, ставка, атрибуция и расчёт.
- `LEGAL_FISCAL_CLEARED` — закрыты применимые отраслевые/юрисдикционные gates.
- `ACTIVE` — data path и settlement test пройдены на тестовой записи.
- `SUSPENDED` — конфликт данных, legal change, privacy incident или просроченная сверка.
- `CLOSED` — расчёт завершён, tail и corrections закрыты.

Нельзя называть модель действующей только потому, что она утверждена в этом документе.

## 13. Публичная граница

Публичные страницы могут сообщать, что CAESTHETIC работает по fixed, managed и performance-based моделям, только если это соответствует текущему публичному позиционированию.

Не публикуются без отдельного решения:

- ставка конкретного клиента;
- база и attribution window;
- медицинская комиссия;
- размер продаж и settlement;
- персональные данные клиентов;
- договорные исключения и споры.

---

**Owner decision 2026-09-03:** CAESTHETIC may earn an agreed percentage of verified sales to customers it sourced or documentably reactivated. Healthcare activation remains fail-closed until jurisdiction-specific legal/fiscal approval; coordinator and clinician sales incentives remain zero.
