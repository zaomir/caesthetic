# CPRP — современные практики и решения

Проверено 2026-09-09. Исследование первичных источников проведено перед проектированием пакета. Это сопоставление рабочих подходов и capabilities, не доказательство, что поставщик уже внедрён у CAESTHETIC. Публикуемые вендорами показатели эффективности не перенесены в прогноз пилота.

| Источник | Что подтверждено источником | Применение / собственное решение CPRP |
|---|---|---|
| [PartnerStack](https://partnerstack.com/) — актуальная продуктовая страница | Раздельное управление типами партнёров, onboarding/enablement, analytics, commissions | Стадии recruit → qualify → enable → activate → measure → reconcile → renew. Автовыплаты банкам не копируем: здесь fee получает CAESTHETIC |
| [Crossbeam](https://www.crossbeam.com/) — актуальная продуктовая страница | Ecosystem context, company/account matching, CRM-linked workflows, измерение motions | Подбираем пару client–partner по аудитории и релевантности, фиксируем owner/next action. Подход account mapping переносим на B2B-контекст; обмен клиентскими базами банка не используем |
| [Cvent: Event Sponsorship](https://www.cvent.com/en/blog/events/event-sponsorship), 2023, доступен на дату проверки | Подбор спонсора по audience fit и целям; packages с явной ценностью; согласование условий и ROI | Отдельный event P&L, платный inventory, доказательство исполнения, sponsor follow-up. Отдельно защищаем согласие на контакт; право на attendee database не продаётся |
| [Twenty API](https://docs.twenty.com/developers/extend/api) | Workspace-generated REST/GraphQL, custom objects, metadata API, role-scoped keys | Schema discovery до adapter implementation; CRM projections и отдельные client namespaces |
| [Twenty webhooks](https://docs.twenty.com/developers/extend/webhooks) | Record-change notifications и signatures, включая custom objects | Durable intake, версия adapter, фильтрация разрешённых событий/полей |
| [Stripe webhook guidance](https://docs.stripe.com/webhooks) | Duplicate delivery, отсутствие гарантии порядка, async processing | Ledger с идемпотентностью, очередью, reconciliation и corrections вместо предположения exactly-once |

## Выводы для этого бизнеса

CPRP сочетает managed partner operations, affinity/benefits distribution и curated sponsorship/events. Название описывает собственную сборку этих практик; оно не обещает наличие полного PRM SaaS.

Дистанционное согласование выбрано по прямому требованию владельца. Стандартизированный program kit, общего владельца аккаунта, backup и измеримые обязательства можно организовать средствами Twenty и интеграционного слоя. Очные мероприятия остаются возможны как продаваемый формат, а личная поездка для переговоров не является обязательным этапом.

В операционных данных отдельно учитываем **source** и **influence**: совместный вебинар может помочь уже существующему клиенту, но не становится сам по себе основанием 10% комиссии. Это проектное правило, согласованное с действующим CAESTHETIC Attributed Sales Standard.

Спонсор платит за проверяемую организацию и участие, а не за обещание медицинских назначений. Для оборудования аудитория покупателей может состоять из клиник и специалистов; премиальный статус банка сам по себе не доказывает спрос на оборудование. Подбор состава начинается с задач участников.

## Что не установлено исследованием

- API, коммерческие/технические возможности и доступ к конкретной версии SQNS.
- Активные соглашения с Мбанк/МБанк, КМБанк, BAKAI или другими примерами.
- Готовность установленного Twenty к tenant isolation и нужному набору custom objects.
- Универсальная юридическая/налоговая применимость 30/10 во всех странах.
- Conversion, CAC, sponsor price, margin или срок окупаемости пилота.

Эти поля остаются unknown до фактических данных. Архитектура включает место для них и способ проверки.
