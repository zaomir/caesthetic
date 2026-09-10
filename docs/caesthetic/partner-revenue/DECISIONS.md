# CPRP — журнал решений

## 2026-09-09 · CPRP-001 · Owner-defined business scope

Источник: текущие прямые сообщения владельца в Work; документационная задача [#1593](https://github.com/zaomir/grainee-v2/issues/1593).

Принято: Caesthetic Partner Revenue Platform — самостоятельный международный коммерческий слой для разных клиентов/партнёров. Expert Dental — пилот. Twenty — CRM CAESTHETIC с синхронизацией клиентских CRM. Все партнёрские взаимодействия от CAESTHETIC в интересах конкретного релевантного клиента. Дистанционные договорённости — основной путь; роль сотрудника заменяема. Продажи и бесплатная выдача абонементов; bilateral и multiparty мероприятия с платными участниками/спонсорами. Возможность включается в релевантные офферы Caesthetic.

Сохранено из предыдущего сообщения: 30% membership + 10% attributed treatment в пилоте, actual collections, Commercial Schedule, bank does not transfer client list, program IDs, personal referrals, SQNS system of record, ledger/reconciliation. Получатель % — CAESTHETIC; не банк и не координатор.

Замещено по предмету: трактовка всей платформы как RAIM SMILE-only инициативы; обязательная очная встреча как этап подключения; невозможность Caesthetic treatment fee в ранних решениях до DEC-866. Продуктовые/медицинские правила Expert сохраняют свой scope.

## 2026-09-09 · CPRP-002 · Architecture decisions v1

Архитектурные решения исполнителя для реализации принятой модели: tenant scope client/market/program; общая B2B organization directory; Twenty operating console; отдельные identity boundary, attribution/financial subledger; fields-owned directional sync; inbox/outbox, dedup, reconciliation; source vs influence; product-level payment allocations; scoped immutable referral lineage; regional deployment configuration.

Эти решения проектирования не утверждают работоспособность runtime. Глобальные ставки, referral duration/depth, tax/FX policy, sponsor prices и новый клиент/банк не выдуманы — задаются конкретными договорами/configuration.

## 2026-09-09 · CPRP-003 · Packaging and economics boundaries

Бесплатность для получателя отличается от отсутствия финансирования. Paid bulk procurement, zero-cash complimentary, sponsor organization fee и pass-through funds имеют разные ledger entries. CAESTHETIC не входит в счёт организаций event composition. Remote-first переговоры совместимы с очным событием при обоснованной ценности формата.

CPRP получает единый master + topic owners + ссылки из Caesthetic/healthcare/platform/offer routes. Старые документы уточнены как локальные adapters. Документационная готовность не означает запущенный партнёрский бизнес; runtime и реальные продажи проверяются следующими задачами.

## 2026-09-10 · CPRP-004 · Common link, passport, HR and funded inventory

Источник: явные уточнения владельца в текущем обсуждении и запрос актуализировать программу снаружи/по ролям. Один SMS/link для аудитории допустим; индивидуальные токены и передача банковской базы не обязательны. Employee registration: имя, фамилия, номер паспорта, телефон. ID означает паспорт, не employee ID. HR проверяет вручную, если иной механизм партнёром не предоставлен.

Eligibility и выдача разделены. При нулевой квоте сотрудник регистрируется, HR может подтвердить его и видит исчерпание/очередь; сотрудник видит правдивое ожидание оформления без бюджета банка. Купленные единицы учитываются атомарно, повторная выдача запрещена. Старый общий lifecycle inventory в версии 1.0 заменён раздельными закупкой, заявкой и entitlement; правила четырёх источников финансирования сохранены.

PROGRAM_EXPERIENCE.md владеет описанием внешнего предложения, интерфейсов и работы ролей; Membership — правилами проверки/выдачи. Маскирование паспорта, outbox/idempotency, suggested verified_at queue и next-contact ownership — проектные способы исполнения, не новые договорные обещания. Обновление документации не означает запуск кабинетов или проверенную SQNS-интеграцию.
