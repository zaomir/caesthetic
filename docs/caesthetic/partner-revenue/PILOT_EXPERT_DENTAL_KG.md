# CPRP — Expert Dental / Кыргызстан, pilot binding

Версия 1.1.0, 2026-09-10. Клиент выбран владельцем. Статус платформенного пилота: DESIGN_DEFINED; подтверждение запуска/интеграции оформляется отдельно по факту.

| Поле | Значение |
|---|---|
| platform owner / партнёрский оператор | CAESTHETIC |
| client binding | EXPERT_DENTAL_KG |
| медицинский оператор | Expert Dental Studio, Бишкек |
| market | KG / Бишкек; timezone Asia/Bishkek |
| расчётная валюта пилотной модели | KGS; итоговое invoicing/tax policy — в Schedule |
| продуктовая оболочка | RAIM SMILE · SmileCare 12 |
| CRM клиента | SQNS; capability/access ещё проверяются |
| CRM CAESTHETIC | Twenty; CPRP objects/projections ещё не настроены этим пакетом |
| первый координатор | Гульбара, сотрудник/представитель CAESTHETIC; backup назначается до запуска |
| membership fee | 30% eligible фактически полученной membership revenue |
| treatment fee | 10% eligible фактически полученной attributed treatment revenue |
| первый B2B partner | Не выбран/не подтверждён в этом пакете; названия банков в обсуждении — примеры |

## Источники локальных правил

[RAIM SMILE marketing strategy](../../ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md), [Partnership Network](../../ssot/RAIM_SMILE_PARTNERSHIP_NETWORK.md), [Economics adapter](../../raimov/partnerships/RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md), [Gulbara role](../../raimov/partnerships/GULBARA_VIP_COORDINATOR.md).

Expert Dental оказывает медицинские услуги; RAIM SMILE — программа/бренд/маршрут. Клинико-продуктовые цены, состав SmileCare, противопоказания и медицинские документы не переносятся в глобальный CPRP. Текущая публичная страница/ручной contact flow не является доказательством автоматической registry, eligibility, referral или SQNS sync.

## Согласованный сценарий employee benefit

Банк может разослать одну ссылку всем сотрудникам. Форма: имя, фамилия, номер паспорта, телефон. Номер паспорта — согласованный ID для проверки, не табельный номер. HR вручную подтверждает заявку, пока партнёр не предоставит иной механизм. Закупка 100 абонементов — сценарий, не подтверждённый контракт/оплата.

HR видит закуплено/выдано/доступно, новые заявки и подтверждённых ожидающих. При остатке 0 регистрация и проверка продолжаются, выдача ждёт пополнения. HR явно видит исчерпание, участник — корректное ожидание оформления без финансовых деталей банка. Подробности: [Program experience](PROGRAM_EXPERIENCE.md), [Membership](MEMBERSHIP_AND_ELIGIBILITY.md). Это проектируемые кабинеты, не описание уже работающего публичного сайта.

## Минимальная проверка бизнеса

Предлагается сохранить 60-дневный период уже существующего пилотного подхода. Это окно наблюдения после фактической активации, а не deadline на создание всей платформы и не окно attribution по умолчанию.

1. Выбрать одну релевантную программу клиента с одним audience partner и небольшим контролируемым benefit inventory.
2. Подготовить от CAESTHETIC digital kit и дистанционно согласовать channel placements.
3. Зафиксировать Commercial Schedule: 30/10, eligibility/new/reactivation, attribution/referral window, refundable base, taxes и non-overlap с Expert Growth Budget/PF.
4. Создать program-specific link, регистрацию, eligibility confirmation, personal referral и handoff в SQNS.
5. Проверить связку member ↔ конкретный SQNS patient. Пока доступ SQNS ожидается, готовить adapter contract/synthetic fixtures; не объявлять автоматическую интеграцию работающей.
6. Если согласована контролируемая выгрузка C1, проверить бизнес с batch reconciliation; это временный способ синхронизации, не новая patient CRM.
7. Пройти paid membership, complimentary benefit, referred participant и treatment payment/refund paths на разрешённых данных.
8. Провести первое небольшое bilateral событие онлайн, если оно полезно выбранной аудитории. MULTIPARTY Health Day — следующий отдельный event brief при подтверждённых anchor/distribution/sponsors и бюджете.
9. Сверить collected payments и fee; оформить keep/adjust/stop по contribution и нагрузке.

## Критерии принятия этапа

- Источник сохраняется без ручного выбора пациентом; нет передачи банковской базы.
- Прямая и referral цепочки воспроизводимы до конкретной оплаты.
- Shared phone не смешивает родственников.
- Нулевая оплаченная закупка бесплатного абонемента даёт нулевую membership commission.
- Refund уменьшает правильную прежнюю базу.
- Twenty показывает владельца/next action/агрегаты; clinical record остаётся в SQNS.
- Проверены duplicate delivery, tenancy, outage/replay и financial reconciliation.
- Зафиксированы effort, funded benefit exposure и contribution; пилот не объявляется успешным по числу встреч.

Параметры живой программы, которых пока нет: реальный partner_id/legal entity, eligibility evidence, signed Schedule/window/taxes, SQNS capability, initial inventory/budget, backup/часы обслуживания, success/stop thresholds. Их заполняют в ходе обычной подготовки договора и запуска; создание архитектуры не ждёт отдельного подтверждения каждого поля.
