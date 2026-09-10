# CPRP — модель данных v1.1

Authority: [architecture](ARCHITECTURE.md), [sync](TWENTY_SYNC_CONTRACT.md). Логические имена не равны автоматически доступным объектам установленного Twenty.

## Сущности и ключи

| Сущность | Ключ и основные поля | Источник истины |
|---|---|---|
| Organization | organization_id, legal entity, country, parent group, verified B2B domains | Twenty / коммерческий directory |
| ClientAccount | client_id, organization_id, service vertical, mandate_ref, owner | Twenty; исполняемый binding в CPRP |
| PartnerAccount | partner_id, organization_id, category, account owner, B2B contacts | Twenty |
| MarketProfile | market_id, country, currency, timezone, languages, residency region, version | Версионируемая конфигурация |
| Program | program_id, client_id, partner_id, market_id, product_version, Schedule ref, status | CPRP registry; Twenty projection |
| ProgramAgreement | agreement_id, parties/roles, version, effective dates, obligations, private document_ref | Договорное хранилище; Twenty metadata |
| CampaignPlacement | campaign_id, program_id, channel, placement_id, source_id, dates, distribution proof | Twenty план + CPRP events |
| Enrollment | program_member_id, program_id, source_partner_id, first_entry_at, eligibility_status, benefit_track, allocation_status, consent_ref, contact_ref, identity_ref | CPRP |
| ContactIdentity | contact_ref, scoped lookup HMAC, encrypted contact, contact-sharing scope, retention | Restricted store; не partner CRM |
| EmployeeIdentity | identity_ref, encrypted first/last name and passport number, issuing-country/type namespace, scoped lookup HMAC, retention | Restricted verification store; паспорт не в Twenty |
| EligibilityRequest / Decision | request_id, program_member_id, reviewer_scope, method, pending/verified/declined, reason, decided_by/at, evidence_ref | CPRP; HR или подтверждённый adapter |
| AllocationRequest | allocation_request_id, program_member_id, product/period, status, verified_at, priority, owner, next_contact_at | CPRP; ожидание не резервирует квоту |
| MembershipEntitlement | entitlement_id, batch_id, program_member_id, product/version, issued/active/redeemed/expired/revoked, issue_request_id | CPRP; исполнение подтверждает CRM клиента |
| InventoryMovement | movement_id, batch_id, quantity_delta, type, entitlement/refund ref, authorized_by, occurred_at, idempotency_key | CPRP; атомарный журнал квоты |
| PartnerReviewerGrant | user_ref, partner_id, allowed program_ids/markets/benefit_tracks, permissions, expiry/revocation | Access registry; не общая ссылка |
| Referral | referral_id/code, owner_member_id, root_partner_id, program_id, expiry, revocation | CPRP |
| ReferralEdge | child_member_id, parent_member_id, referral_id, depth, accepted_at | CPRP; ациклическая связь |
| CrmLink | client_id, connector_instance_id, external_person_ref, program_member_id, linked_at, confidence | Integration registry |
| JourneyEvent | event_id, enrollment, lead/booking/visit/service opaque refs, type, occurred_at | CRM клиента → event store |
| PaymentAllocation | allocation_id, payment_ref, line_ref, product_class, amount_minor, currency, evidence_ref | Финансовый источник клиента → ledger |
| AttributionDecision | decision_id, allocation_id, rule_version, source, confidence, window, reason, supersedes | CPRP ledger |
| FeeAccrual | fee_id, allocation_id, Schedule version, base, rate, accrued/reversed amounts | CPRP ledger |
| Settlement | settlement_id, counterparty, period, currency, accrued, reconciled, invoiced, collected | Ledger; read-only summary в Twenty |
| Event | event_id, beneficiary clients, market, composition, modality, audience, budget, owner | Twenty |
| EventParticipation | event_id, organization_id, role(s), package, obligation, fee, fulfillment | Twenty + ledger |
| BenefitInventory | batch_id, program_id, payer, unit count, collected funding, issue/redeem/expiry balances | CPRP |
| SyncCheckpoint / Exception | connector_id, scope, cursor, last success, error, retry, assigned owner | Integration runtime → Twenty task |

У Organization возможны роли partner, client, sponsor, exhibitor, supplier. Роль хранится на отношении/участии, а не единственным boolean. Company для филиала и юридического лица различаются.

## Дедупликация

- B2B-организация: verified legal identifier + country; домен — сигнал, не универсальный primary key для группы компаний.
- Программа: стабильный id и версия; уникальность активной конфигурации определяется client + partner + market + product/period.
- Человек не создаётся как один глобальный пациент всех клиентов. Сопоставление ограничено клиентом и разрешённой целью.
- Номер нормализуется для контакта с country context; одинаковый номер у семьи не объединяет пациентов. Перед financial linking подтверждается соответствие конкретной записи CRM.
- External ID уникален только вместе с `client_id + connector_instance_id`. При миграции CRM namespace новый.
- Twenty Opportunity: `cprp_opportunity_id`; виды `partner_program`, `sponsorship`, `client_sales` различаются. Старый token из массового outreach не ключ новой программы.

Паспорт сверяется только в разрешённой области программы с namespace страны выдачи/типа документа; совпадение — повод проверить дубль, не автоматическое объединение глобальных пациентов. При смене паспорта сохраняется program_member_id и история решения. В событиях/логах передаётся identity_ref, не номер документа. [Правила заявки и квоты](MEMBERSHIP_AND_ELIGIBILITY.md) разделяют eligibility, allocation и entitlement.

## Referral и attribution

Прямой участник имеет `referrer_member_id=null` и собственный referral code для будущих приглашений. Код не является обязательным шагом прямого входа. Реферал получает собственный program_member_id и свой новый код; его parent/root связь хранится отдельно.

Referral не даёт автоматически банковскую привилегию: source eligibility, membership entitlement и право на конкретную семейную льготу проверяются раздельно. Нет переноса пациентов между клиентами без нового участия и разрешённого handoff.

## Событийный конверт

Минимум: `event_id, event_type, schema_version, client_id, market_id, program_id, connector_instance_id, source_event_id, source_record_ref, occurred_at, received_at, source_version, correlation_id, causation_id, payload_hash`. Для денег дополнительно `allocation_id, currency, amount_minor, payment_status, evidence_ref`.

- Деньги — целые minor units по правилам валюты; ставка хранится точным decimal/rational, не floating point.
- occurred_at — UTC + исходная timezone для границ расчётного периода. received_at — время получения.
- source_version — версия провайдера; при её отсутствии retrieve-current + reconciliation, а не доверие порядку доставки.
- Уникальность события: source system namespace + stable source event id. При отсутствии event id — документированный deterministic business key/version; timestamp_bucket недостаточен для денег.
- `source_partner_id` не перезаписывается при повторном клике. Corrections создают новую decision/version.

Псевдонимные member/visit/payment IDs всё равно могут позволять связь с человеком. Их защищают как ограниченные данные; слово opaque не означает анонимность.
