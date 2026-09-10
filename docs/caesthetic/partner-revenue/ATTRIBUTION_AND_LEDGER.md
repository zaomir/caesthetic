# CPRP — сквозная атрибуция и ledger

Authority: [Attributed Sales Standard](../../ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md). Параметры окна/исключений берутся только из подписанного [Commercial Schedule](templates/COMMERCIAL_SCHEDULE.md).

## 1. Цепочка доказательств

`client + market + program + partner + placement → program_member_id → lead/contact → client CRM person/patient ref → booking/visit/service refs → payment allocation → attribution decision → fee accrual → reconciliation → invoice → money received by Caesthetic`.

Referral — дополнительная ветка: child member → code → parent member → root partner. У прямого участника нет входящего referrer. Продажа абонемента и лечение — разные ветки выручки: лечение не требует предварительной покупки абонемента, если Schedule не устанавливает это условие.

Система должна уметь от каждого fee вернуться к collected payment и правилу, а от регистрации — показать все связанные события. Счёт/план лечения/визит/booking не равны оплате.

## 2. Приоритет правил

1. Определить клиент/программу/страну и действующую версию договора.
2. Проверить достоверность источника, eligibility и разрешённую связь с конкретной CRM записью.
3. Проверить new vs existing/re-activated. Уже существовавшая активная сделка не становится sourced из-за нового QR.
4. Применить frozen first eligible source. Last touch/event influence хранить отдельно.
5. Проверить referral depth/window и выбранную multi-touch priority.
6. Проверить contract attribution window, начало отсчёта, sale vs payment date и tail.
7. Применить exclusion и non-overlap с другими выплатами Caesthetic.
8. Если не хватает evidence — UNRESOLVED, без начисления до разрешения. Запись и обслуживание пациента при этом продолжаются.

Уровни `DETERMINISTIC / CORROBORATED / ASSISTED / UNRESOLVED` наследуются из глобального стандарта. Assisted event attendance не становится billable sourced revenue автоматически. Обнаруженный позднее source не переписывает закрытый период без correction record.

## 3. Платежи и аллокации

Платёж может включать membership и treatment. Он разбивается на не пересекающиеся allocation lines по подтверждённым продуктам/суммам. До разделения fee unresolved; нельзя применить 30% и 10% ко всему платежу.

Сумма аллокаций не превышает retained collected payment. Discount не вычитается повторно из уже оплаченной суммы; taxes/fees применяются ровно как определено Schedule. Рассрочка учитывает полученные части, а не весь план. Неаллоцированный депозит ожидает основания; subsequent allocation не является второй оплатой. Межфилиальный перевод не новая выручка.

Refund/chargeback/reversal ссылается на original allocation и создаёт отрицательную корректировку по **исходной** ставке/валюте. Смена текущей ставки не меняет историю. Recovery по ранее возвращённой сумме имеет отдельное связанное событие.

## 4. Ledger и сверка

Append-only события: collection, allocation, refund, attribution_decision, accrual, reversal, reconciliation_adjustment, invoice_issued, fee_received. Изменение исходного факта отражается correction/supersedes; удаление строки не исправление.

Состояния accrual: provisional → evidence_complete → reconciled → invoiced → collected; disputed/held/reversed — отдельные состояния. Раздельны expected fee, earned/accrued, invoiced, actual cash и outstanding.

Monthly close для каждой стороны/валюты/program:
1. Зафиксировать batch/cutoff/timezone и source totals.
2. Сверить received payments, allocations, refunds, исключённые и unresolved строки.
3. Рассчитать базу и fee по сохранённым версиям.
4. Сформировать statement с opaque refs/evidence, а не clinical chart.
5. Зафиксировать двустороннюю сверку и discrepancies.
6. Выставить счёт по договору; отметить реально полученную Caesthetic оплату.
7. Late adjustments отразить отдельной строкой следующего периода со ссылкой назад.

## 5. Сценарии, которые нельзя потерять

| Сценарий | Результат |
|---|---|
| Один callback/import повторён | Одно событие, одно начисление |
| Две CRM имеют patient_id=123 | Разные namespace/client links |
| Врач отметил treatment complete, денег нет | Fee не возникает |
| Участник пришёл на бесплатное событие, затем оплатил | Eligibility/source/window проверяются до fee |
| Пациент видел два партнёрских размещения | Один billable source по заранее заданному правилу; influence обоих сохраняется |
| Семья использует один телефон | Раздельные members/patients после подтверждения mapping |
| Прежний пациент зарегистрировал referral сам себе | Не считается новым привлечением |
| Договор завершён, позже получена оплата | Только contract-defined tail; автоматического lifetime attribution нет |
| Возврат после закрытия месяца | Reversal прежней базы/ставки и settlement adjustment |
| Спонсор одновременно клиент CPRP | Event contract и revenue-share contract раздельны; нет автоматического удержания со всех его продаж |

Банк получает агрегаты своей программы, клиент — свои разрешённые финансовые доказательства, Caesthetic finance — нужный subledger. Наличие root partner не даёт ему права видеть платежи конкретного пациента.
