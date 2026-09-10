# CPRP — страны, полномочия и границы данных

## Market profile до живой программы

Каждая программа привязана к market_id и договорным юридическим лицам. Минимальные поля: country/service territory; contracting entities; invoicing/payee; currency/minor units; timezone; languages; product/operator qualifications; permitted benefit/advertising/outreach modes; tax treatment; customer-service rules; data roles; processing region; cross-border transfers; retention; access; controller/processor contacts; complaint/escalation; Schedule version.

Это конфигурация конкретной страны, не утверждение о международной юридической допустимости ставки 30/10. Обычные местные договорные, налоговые, рекламные и data obligations проверяются при подготовке соответствующей программы. Существующий DEC-866 не вводит отдельный healthcare-only статус 0%; он также не заменяет применимые требования страны.

## Data boundary

| Область | Что допускается | Кто видит |
|---|---|---|
| Global B2B directory | Организация, публичные бизнес-контакты, роли | Назначенные Caesthetic commercial staff |
| Client/program context | Договорные metadata, placements, tasks, benefit inventory | Команда конкретной программы |
| Identity/contact | Минимальный контакт, purpose/recipient consent, scoped lookup | Restricted operations и выбранный клиент |
| Attribution/finance | Opaque member/CRM refs, dates/statuses, payment amounts, rule evidence | Ограниченные integration/finance roles |
| Clinical record | Анамнез, диагноз, изображения, treatment narrative | Клиентская медицинская система |
| Employee verification | Имя, фамилия, телефон, защищённый номер паспорта, решение и allocation status только заявившихся сотрудников | Уполномоченный HR своей программы и назначенные restricted operations; не все B2B-контакты |
| Partner report | Агрегаты своей программы | Partner contact |
| Sponsor report | Исполненные inventory items и разрешённые follow-ups | Спонсор своего пакета |

Opaque IDs и HMAC телефонов — псевдонимизация, а не автоматическая анонимизация. Связь участия с визитом/оплатой медицинской услуги может оставаться чувствительной. Минимизацию дополняют права доступа, purpose limitation, retention и защищённое хранение.

Hash телефона не должен быть простым unsalted hash: ограниченное пространство номеров позволяет подбор. Используется scoped keyed lookup и encrypted contact; ключи не помещаются в Git/Twenty fields.

## Согласия и доступ

- Bank/customer list не импортируется. Регистрация инициирована участником.
- Eligibility не раскрывает принадлежность человека банку постороннему пользователю.
- Общая программа не даёт согласия на маркетинг всех sponsors/clients.
- Private document_ref не является публичной ссылкой; авторизация проверяется при чтении.
- Гранулярное разделение по клиенту/рынку/роли распространяется на exports, queues, logs и backup.
- Reports подавляют слишком малые ячейки по market/program policy; «агрегат» из одного пациента не обеспечивает privacy.
- Ретенция раздельная для контактов, маркетинга, ledger evidence, audit logs; удаление/ограничение учитывает договорные/законные обязанности хранения без безусловного forever.
- Revocation прекращает будущие нежелательные контакты и отзывает tokens/access, сохраняя лишь разрешённый финансовый evidence.
- Семейные/детские варианты задаются продуктом и guardian flow; телефон родителя не делает всех детей одной записью.

## Passport и HR portal

Employee flow использует номер паспорта по решению владельца, без скана. Хранение раздельное от общих Twenty contacts: encrypted value, scoped keyed lookup, маскирование и аудит раскрытия. Номер паспорта не попадает в email/SMS, URL, analytics, финансовый ledger или обычные integration logs. Хеш без ключа не используется. Минимальные сроки хранения verification evidence и документа определяются раздельно. Паспорт не является паролем или универсальным глобальным ID.

PartnerReviewerGrant ограничивает HR по partner/program/market/benefit track. Авторизация действует и на API, поиск и экспорт; общая регистрационная ссылка не открывает HR. Нулевой stock возвращается внутренней HR/ops проекции; публичный endpoint не раскрывает закупочный баланс. Участник получает свой правдивый status. HR доступны eligibility и выдача, но не индивидуальные медицинские визиты, назначения и платежи. В клинику паспорт из HR flow автоматически не переносится.

## При добавлении страны

Создать market profile из этой структуры → конкретный client/program binding → проверенный connector capability → versioned Schedule → ограниченная когорта → reconciliation → измеренная readiness к расширению. Shared global partner directory не разрешает автоматически экспорт enrollment между регионами.
