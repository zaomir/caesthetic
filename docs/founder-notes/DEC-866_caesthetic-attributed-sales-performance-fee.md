---
id: DEC-866
title: CAESTHETIC attributed-sales performance fee
status: accepted / owner-approved commercial option / commercial-schedule-and-attribution gated
date: 2026-09-03
owner: Total / CAESTHETIC
applies_to:
  - caesthetic
  - raim-smile-partnership-network
  - expert-dental
  - approved-partner-programs
  - future-caesthetic-verticals
links_to:
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
  - docs/ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md
  - docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
  - docs/ssot/RAIM_SMILE_PARTNERSHIP_NETWORK.md
  - docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md
supersedes_in_part:
  - docs/founder-notes/DEC-862_raim-smile-caesthetic-partnership-economics-and-vip-access.md
---

# DEC-866: CAESTHETIC может получать процент от атрибутированных продаж

## Контекст

CAESTHETIC уже может получать fixed launch/management fees, 100% отдельного Coordination Fee и, для оплаченного SmileCare 12, 30% фактически полученной и не возвращённой membership revenue после applicable gates.

DEC-862 одновременно зафиксировал `treatment revenue share = 0% by default`. Это было безопасной стартовой границей до определения атрибуции, расчётной базы и правового режима.

Владелец уточнил коммерческую модель: **CAESTHETIC может получать процент от продаж клиентам, которых CAESTHETIC привёл.**

## Решение

### 1. Разрешённая модель

В канон вводится **Attributed Sales Performance Fee**:

```text
Net Collected Attributed Sales
× agreed rate
= fee payable to CAESTHETIC
```

CAESTHETIC может получать согласованный процент от фактически полученных и сохранённых продаж новым клиентам, которых CAESTHETIC привёл, а также существующим клиентам, которых CAESTHETIC документированно реактивировал по заранее утверждённому правилу.

Ставка не фиксируется этим DEC. Она определяется отдельно для каждого клиента, продукта, рынка или партнёрской программы в подписанном Commercial Schedule.

### 2. Что считается продажей

В базу входят только денежные средства, фактически полученные и сохранённые после contract-defined refunds, reversals, chargebacks, cancellations, taxes/pass-through exclusions и dedup.

Не являются продажей:

- показ, клик или лид;
- звонок или заявка;
- запись;
- выставленная, но не оплаченная смета;
- обещание оплаты;
- pending financing;
- продажа клиенту, который уже находился в активной воронке до источника CAESTHETIC, если reactivation rule не подписана.

### 3. Attribution gate

Для начисления обязательны:

- source marker до или в момент первого квалифицированного контакта;
- определение new customer / reactivated customer;
- attribution window;
- dedup;
- multi-touch priority;
- payment/refund evidence;
- bilateral reconciliation;
- audit trail.

Неразрешённый или спорный source получает `UNRESOLVED` и не начисляется до документированного решения.

### 4. Изменение DEC-862

Пункт DEC-862 о нулевой доле CAESTHETIC в treatment revenue переопределяется так:

```text
CAESTHETIC attributed-sales percentage:
  owner-approved commercial option

Healthcare payable status:
  ACTIVATABLE
  under the ordinary signed Commercial Schedule and attribution rules
```

То есть `0%` перестаёт быть запретом или специальным activation state для CAESTHETIC. Медицинские и стоматологические продажи активируются по тем же обычным условиям, что и другие отрасли: подписанный Commercial Schedule, проверяемая атрибуция и расчёт по фактически полученной и сохранённой денежной базе.

Отдельные `legal`, `fiscal`, `advertising`, `privacy` и `fee-splitting` clearances не являются специальными предварительными gates этой fee-модели. Обычные обязательства сторон и клинические/данные границы продолжают действовать в своих операционных контурах, но не создают дополнительный статус `0% / NOT ACTIVE` для Attributed Sales Performance Fee.

Остальные границы DEC-862 сохраняются.

### 5. Медицинская независимость

После договорной активации:

- clinical eligibility, diagnosis, plan, procedure and clinician остаются у licensed medical operator;
- CAESTHETIC не получает полномочий влиять на медицинское решение;
- процент не применяется как вознаграждение врачу, администратору или координатору;
- оператор, которому направляется пациент, сохраняет обязательные licence/quality/capacity требования программы;
- коммерческая ставка не может сделать менее подходящего оператора «предпочтительным»;
- PHI и medical record не входят в attribution ledger;
- пациенту раскрывается фактический medical operator.

### 6. Координатор и клиницисты

```text
Coordinator medical sales percentage = 0%
Clinician referral/sales percentage = 0%
```

Компенсация координатора остаётся process/quality-based. Этот DEC разрешает доход CAESTHETIC как отдельного commercial operator, а не личную комиссию за склонение пациента к лечению.

### 7. No double counting

Одна денежная база оплачивается CAESTHETIC только один раз.

Если фактически полученная сумма уже является базой 30% SmileCare 12 Partnership Distribution & Management Fee, generic attributed-sales percentage на ту же сумму не начисляется, если Commercial Schedule прямо не определяет replacement/offset/non-overlap.

Fixed management, launch, marketing integration и Coordination Fee могут существовать параллельно только как оплата отдельной выполненной работы.

### 8. База может быть sales или contribution

По умолчанию решение владельца разрешает процент от `Net Collected Attributed Sales`.

Если у продукта существенно различается себестоимость, стороны могут вместо выручки выбрать `Positive Attributable Contribution Margin` по CAESTHETIC Growth Economics Engine. В одном расчётном контуре база не меняется задним числом.

### 9. Public boundary

Процент, ставка, база, окно атрибуции и settlement являются contract-only information. Этот DEC не разрешает публиковать их на generic `/partners/` или иных публичных страницах.

### 10. Текущий статус

Этот DEC:

- вводит коммерческую возможность в канон;
- разрешает готовить предложения и договорные schedules;
- не создаёт уже начисленную комиссию;
- разрешает активировать medical/dental Attributed Sales Performance Fee по обычному подписанному Commercial Schedule и атрибуции без специальных отраслевых activation gates;
- не меняет клинический договор, кассу, medical record или ответственность оператора;
- требует синхронизации канона, tests/router и economics runtime.

## Canonical implementation

- `docs/ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md`
- `docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md`
- `agents/manifests/caesthetic.yaml`
- `agents/manifests/raimovdental.yaml`
- `tests/caesthetic/attributed-sales-compensation-canon.test.mjs`
- `tests/raimovdental/raim-smile-partnership-vip-canon.test.mjs`

---

**Owner instruction amended 2026-09-03:** CAESTHETIC may receive an agreed percentage of verified collected sales to customers it sourced or documentably reactivated. Medical and dental settlement is activatable under the ordinary signed Commercial Schedule and attribution rules, without separate legal/fiscal/advertising/privacy/fee-splitting activation gates. Coordinator and clinician medical-sales percentages remain zero.
