# CPRP v1 — контракт клиентского обмена

Base: `https://caesthetic.com/api/cprp/connector`. `Authorization: Bearer <key>`; ops создаёт credential для одной программы. Ключ показывается один раз, в базе только hash. Для ротации создать новый, настроить adapter, отозвать старый. Связи patient_ref ограничены connector: после ротации повторить patient_link.

## Передача участников

`GET /handoff?after=0` → `items`, `next`. Item: cursor, program_id, client_id, program_member_id, first_name, last_name, phone, phone_verified=false, entitlement_id, entitlement_status, product. Только выданные абонементы. Сохранить cursor после успешной записи в CRM; дедупликация по program_member_id/entitlement_id. Телефон не уникальный человек. Паспорт не передаётся.

## Подтверждённые события

`POST /events`, JSON. Общие поля: event_id, kind, member_id (наш program_member_id), patient_ref (opaque CRM ID), occurred_at (ISO 8601 с timezone). Сначала patient_link. Один patient_ref не связывается с двумя участниками одной программы/connector.

| kind | Дополнительные поля | Результат |
|---|---|---|
| patient_link | — | Связь с CRM |
| visit | — | Событие визита |
| membership_activated | — | Активация выданного абонемента |
| membership_redeemed / membership_expired / membership_revoked | evidence_ref | Исполнение, окончание срока или отзыв без возврата единицы в квоту |
| membership_payment | payment_ref, amount_minor, eligible_minor, currency, evidence_ref | Отдельная продажа; не повторная продажа оплаченной квоты |
| treatment_payment | те же | Фактически полученная оплата лечения |
| refund | те же + reverses | Корректировка исходного ledger ID, полученного через сверку ops |

Деньги — положительные целые minor units. eligible_minor ≤ amount_minor, нулевая база допустима. Знак refund выставляет CPRP. Валюта совпадает с программой, ставки и окно атрибуции берутся из Schedule конфигурации. Новое начисление требует verified eligibility и дату в окне от регистрации. Возврат следует исходным условиям, включая возврат после конца окна. Membership из корпоративной квоты не принимается как новая membership_payment.

200 означает durable acceptance. Повтор event_id/содержимого → 200 duplicate; изменённое содержимое → 409. Неизвестные поля отклоняются. При missing patient link/original payment устранить причину и повторить. 429/5xx: backoff, тот же event_id, затем сверка/backfill. 400/401/403/409 нельзя объявлять успешной доставкой.

```json
{"event_id":"crm-payment-001","kind":"treatment_payment","member_id":"<program_member_id>","patient_ref":"<opaque_client_id>","occurred_at":"2026-09-10T10:00:00Z","payment_ref":"receipt-001","amount_minor":100000,"eligible_minor":100000,"currency":"KGS","evidence_ref":"receipt-source-001"}
```

До SQNS подключения подтвердить vendor/version, auth, external IDs, финансовые allocation/refund exports, timestamps, pagination, rate limits и staging. Vendor endpoints не выдуманы. API не принимает диагнозы, анамнез, снимки или clinical notes и не является медицинской CRM. В текущем subset нет универсальных команд изменения записей на приём.

События завершения абонемента сравниваются по occurred_at; старое activation не восстанавливает истёкший абонемент. Продление и повторная выдача требуют нового согласованного entitlement-сценария, а не переписывания истории.

Финансовая запись сохраняет evidence_ref и source_event_ref; их возвращает ops сверка. Для ручной корпоративной закупки основание — указанный подтверждённый payment_ref и audit оператора.

Ops-кабинет показывает записи сверки, исходные основания и ссылки на корректируемую оплату. `/staff/finance?program_id=...&before=...` возвращает до 100 записей, `next` — cursor более ранних записей; totals охватывают весь ledger программы.
