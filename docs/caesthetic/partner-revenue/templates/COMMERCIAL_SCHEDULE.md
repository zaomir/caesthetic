# CPRP — Commercial Schedule, шаблон параметров

Версия шаблона 1.0.0. Это заполняемая коммерческая спецификация, не подписанный договор и не юридическое заключение. Используется с [Attributed Sales Standard](../../../ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md).

## Parties and scope

| Параметр | Заполнить |
|---|---|
| agreement_id / version / effective date | [значение] |
| CAESTHETIC legal entity / payee / invoice details | [значение] |
| Client legal entity / operator / payer | [значение] |
| Audience partner / program / market / territory | [значение] |
| Mandate / negotiation and signature authority | [значение] |
| Eligible product/service IDs and product version | [значение] |
| Term / renewal / termination / surviving obligations | [значение] |

## Compensation and funding

| Линия | Получатель | Rate/price | База и условия |
|---|---|---|---|
| Membership fee | CAESTHETIC | [в Expert pilot 30%; иные — договор] | [eligible collected membership allocations] |
| Attributed sales fee | CAESTHETIC | [в Expert pilot 10%; иные — договор] | [eligible collected treatment/service allocations] |
| Setup/management/coordination, если выбран | CAESTHETIC | [отдельный scope/цена] | [deliverables/period; без двойной оплаты] |
| Event/sponsor/exhibitor, если выбран | CAESTHETIC | [отдельный SOW/price] | [inventory, fulfillment, refund] |
| Funded membership procurement | [клиент/агент] | [units/payment] | [payer, cash vs pass-through, no duplicate resale counting] |

Обязательные уточнения денежной базы:
- collected definition: источник денег, settlement date, неоплаченные счета/депозиты/рассрочка;
- refund/void/reversal/chargeback, late adjustments и bad debt;
- discounts и bundles: считать фактическую сумму, не вычитать скидку повторно;
- taxes inclusive/exclusive, indirect/withholding taxes, invoice VAT/sales tax и responsibility;
- processing fees, lab/material costs: явно включены/исключены; revenue vs contribution base;
- currency/minor units, rounding point/mode, FX source/date, settlement currency;
- non-overlap membership/treatment, existing Growth Budget/PF, CPL/other commissions;
- complimentary, partner-funded/co-funded и bulk allocation/refund policy.

## Attribution

| Правило | Заполнить до начисления |
|---|---|
| Source markers / proof / eligibility | [значение] |
| Window start, duration, renewal | [значение; не бессрочно по умолчанию] |
| Sale date vs payment date and post-termination tail | [значение] |
| New customer definition | [значение] |
| Existing customer/reactivation inactivity/open-deal exclusions | [значение] |
| First-source, multi-touch, overlap/conflict priority | [значение] |
| Referral recipients, depth, root inheritance, window | [значение] |
| Confidence allowed for accrual | [DETERMINISTIC; CORROBORATED если явно принят] |
| Pre-existing pipeline / employee/self referral / products excluded | [значение] |
| Evidence, correction, bilateral dispute procedure | [значение] |

## Operations and settlement

Клиентский financial SoR и разрешённые поля; CRM linking method; integration freshness; counterparties/roles; statement cadence/cutoff; evidence access; reconciliation deadline; dispute deadline; invoice/payment term; payment confirmation; refunds after close; access termination; retention и return/deletion.

## Acceptance record

Подписанты/полномочия сторон, дата, действующая версия, защищённая ссылка на документ. В Git остаётся template и metadata, а не подпись/банковские реквизиты/пациентские данные.

Незаполненные обязательные параметры означают NO_FEE_ACCRUAL по глобальному стандарту. Draft forecast может быть рассчитан отдельно и явно помечен provisional.
