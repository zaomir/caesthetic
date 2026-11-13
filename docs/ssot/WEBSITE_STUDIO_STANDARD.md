---
owner: Marketing + Design + Engineering
status: active
version: 1.1
created: 2026-07-23
last_updated: 2026-08-30
decision: docs/founder-notes/DEC-737_website-studio-standard.md
review_cycle: quarterly
scope: new public marketing websites, new public pages, major redesigns, campaign sites, content hubs and client websites created with AI agents
---

# WEBSITE_STUDIO_STANDARD — SSOT создания уникальных сайтов с AI

## 0. Назначение и решение

Этот документ — единый, независимый от конкретного AI-инструмента стандарт создания публичных сайтов и страниц.

Канон строится в три слоя:

1. `docs/ssot/WEBSITE_STUDIO_STANDARD.md` — общие требования студии: стратегия, anti-slop, архитектура страниц, контент, дизайн, изображения, адаптив, motion, производительность, доступность, SEO/AEO, безопасность и QA.
2. `DESIGN.md` внутри каждого сайта — уникальный визуальный язык конкретного бренда: design thesis, палитра, типографика, сетка, изображения, компоненты, motion и запреты.
3. `.cursor/skills/website-studio/SKILL.md` — инструкция агенту: что прочитать, в каком порядке работать и какие гейты пройти. Skill не дублирует SSOT.

**Skill не является источником истины.** Источник истины должен оставаться обычным Markdown-документом, понятным людям и любому approved AI-инструменту.

Для EVO/ROVLEX этот стандарт не заменяет `START.md`, `docs/ROUTER.md`, продуктовые DEC/SSOT и `docs/ssot/DESIGN_SYSTEM_KIT.md`. Он является зонтичным стандартом. Точные факты, токены, компоненты, домены, тексты, legal и compliance всегда берутся из более специфичного канона проекта.

## 1. Когда этот SSOT обязателен

Читать документ целиком до плана, дизайна, текста и реализации при любой задаче про:

- новый публичный сайт или microsite;
- новую публичную страницу или URL;
- landing page, homepage, service/product/case/contact/legal page;
- blog, resources hub, knowledge hub, article template;
- новую family of pages или page template;
- крупный redesign, rebuild или migration публичного сайта;
- новый `DESIGN.md`, UI Kit, visual system или component system;
- массовое создание SEO/content pages;
- AI-assisted генерацию интерфейса или сайта.

Не применять как замену специализированному product/runtime SSOT для checkout, auth, `/m/`, dashboard, admin или других защищённых зон.

## 2. Иерархия источников истины

При конфликте применять порядок:

1. Governance, legal, privacy, security, product и domain DEC/SSOT.
2. Действующий product/brand/project SSOT конкретного проекта.
3. Непереговорные нормы этого стандарта: достоверность, anti-slop, accessibility, performance, SEO integrity и release QA.
4. Проектный `DESIGN.md` и утверждённая дизайн-система.
5. Реальные tokens, components, page templates и typed content.
6. Skills, prompts и локальные инструкции агента.

Ослабить достоверность, доступность, безопасность или release-гейты можно только отдельным явным решением владельца проекта с зафиксированным риском.

## 3. Базовые принципы

### 3.1 Человек задаёт смысл и вкус

Человек утверждает аудиторию, позиционирование, оффер, доказательства, информационную архитектуру, design thesis и финальный визуальный отбор. AI исследует, предлагает, собирает, адаптирует, проверяет и ускоряет исполнение.

Запрещено отдавать агенту задачу «сделай красивый современный сайт целиком» без утверждённых входных данных.

### 3.2 Сначала факт и структура, потом оформление

Порядок всегда такой:

`факты → аудитория → задача пользователя → оффер → доказательства → карта страниц → контент → визуальная система → компоненты → representative page → остальные страницы → polish`

Красивый экран не компенсирует слабое предложение, выдуманный proof или бессмысленную страницу.

### 3.3 Уникальность — свойство системы

Уникальный сайт — не одна необычная hero-секция. Уникальность должна одновременно проявляться в:

- композиции и ритме страниц;
- типографике;
- голосе бренда;
- реальных продуктовых или операционных доказательствах;
- языке изображений и диаграмм;
- характере компонентов;
- одной узнаваемой visual signature;
- одном умеренном motion-мотиве;
- деталях взаимодействия.

### 3.4 Сайт — многостраничная среда

Главная ориентирует и распределяет трафик. Она не обязана вместить весь продукт, всю экспертизу и все аргументы. Глубина раскрывается отдельными полезными страницами.

### 3.5 Static/server-first по умолчанию

Публичный текст, изображения, навигация и основные CTA должны быть доступны в семантическом HTML без обязательного выполнения клиентского JavaScript. Интерактивность подключается точечно, как islands/progressive enhancement.

### 3.6 Качество измеряется

«Выглядит нормально» не является критерием готовности. У сайта должны быть performance budgets, accessibility checks, route smoke, visual regression, проверка форм, schema, ссылок и мобильных состояний.

### 3.7 Сайт развивается как система

Новая страница использует существующий shell, tokens, components, copy sources и templates. Новый pattern сначала становится частью системы, затем размножается.

## 4. Обязательные входные данные

До визуального дизайна должны быть зафиксированы:

1. **Цель бизнеса:** какой измеримый результат должен давать сайт.
2. **Основная аудитория:** кто принимает решение, кто влияет, кто пользуется.
3. **JTBD посетителя:** что он пытается понять, сравнить или сделать.
4. **Основная конверсия:** анализ, заявка, звонок, demo, покупка, бронирование или другой конкретный шаг.
5. **Оффер:** проблема, результат, механизм, границы и цена/формат, если публичны.
6. **Proof inventory:** реальные кейсы, цифры, screenshots, документы, отзывы, лицензии, публикации, команда и источники.
7. **Content inventory:** существующие тексты, статьи, FAQ, исследования, изображения и видео.
8. **Ограничения:** языки, рынки, legal, compliance, CMS, интеграции, analytics, сроки и media rights.
9. **Конкурентный контекст:** отраслевой стандарт и требуемое отличие бренда.
10. **Факты и гипотезы:** неподтверждённые утверждения помечаются и не публикуются как факт.

Если нет доказательств, нельзя компенсировать пробел фейковыми logos, testimonials, counters или «примерными» результатами.

### 4.1. Разведка и валидация воронки (Competitor Ad Spy Gate — Solokumi Canon)

Для любых коммерческих страниц, performance-лендингов и воронок продаж **запрещено проектировать структуру «из головы»** без предварительного шпионажа за рыночными победителями:

1. **Автоматизированный шпионаж:** перед разработкой запустить локальный скрипт `scripts/spy_landing.py` (или вызвать `python3 scripts/spy_landing.py "<запрос>" "<ГЕО>"`).
2. **Критерий коммерческой валидации ($\ge 30–60$ дней):** анализируются только те посадочные страницы конкурентов в Meta Ads Library и Google Ads Transparency, на которые непрерывно откручивается платный трафик более одного месяца. Длительный открут — математическое доказательство окупаемости воронки.
3. **LLM-декомпозиция по 6 осям:** через DeepSeek/Claude извлечь:
   - оффер и H1 первого экрана (снятие главного барьера);
   - JTBD и отработку скрытых сомнений целевой аудитории;
   - screen-by-screen сетку блоков и последовательность аргументов;
   - социальные доказательства (лабораторные тесты, протоколы, сертификаты, реальные цифры);
   - конверсионный рычаг (калькулятор, Tripwire, оптовая спецификация);
   - готовый адаптирующий промпт для связки Figma MCP / Claude Code / Cursor.
4. **Векторизация в Figma:** проверенный лендинг конкурента импортируется через плагин `html.to.design` в Figma в виде редактируемых auto-layouts и подключается к агенту через Figma MCP (`claude mcp add --transport http figma https://mcp.figma.com/mcp`). Сохраняется победная архитектура убеждения, но полностью заменяются брендбук, оффер, тексты и доказательства.

## 5. Обязательные проектные артефакты

### 5.1 Project Brief

Аудитория, JTBD, оффер, conversion goal, proof, markets, languages, risks и constraints.

### 5.2 Site Map

Для каждого URL фиксируются:

- аудитория;
- search/user intent;
- этап решения;
- уникальный ответ страницы;
- обязательные доказательства;
- основной CTA;
- внутренние ссылки;
- owner контента;
- дата последней проверки.

### 5.3 Project `DESIGN.md`

Описывает уникальный визуальный язык проекта. Минимальный шаблон находится в приложении A.

### 5.4 Content Model / Copy SSOT

Повторяющиеся офферы, названия продуктов, CTA, факты и юридические формулировки не должны жить в десятках HTML-файлов. Они хранятся в одном утверждённом источнике и попадают в страницы через build/data layer или контролируемый перенос.

### 5.5 Real UI Kit

`/ui-kit/`, Storybook или другой каталог показывает **реальные production-компоненты и состояния**, а не идеализированную демонстрацию «по мотивам».

### 5.6 QA Manifest

Фиксирует обязательные URL, формы, языки, breakpoints, browser matrix, performance budgets, analytics events и release smoke.

### 5.7 Media Registry и Asset Inventory

Каждый новый сайт обязан иметь машинно-проверяемый media registry и человеческий asset inventory/contact sheet. Реестр связывает страницы с визуалами через стабильные смысловые ID, хранит release-state, технические требования, provenance/rights references и позволяет заменить исходник без изменения страницы.

Минимальный набор:

- путь к media registry и его schema/version;
- единый MediaSlot/framework-equivalent component;
- список обязательных и optional media IDs;
- placeholder/approval state каждого ID;
- ingest, check, inventory/contact-sheet и rollback commands;
- rights/consent/provenance references без публикации чувствительных документов;
- правила derivative generation, crop, focal point, alt/caption и cache versioning.

Project DESIGN.md и QA Manifest указывают эти пути и команды. Стандарт реализации определён в разделе 10.

## 6. Информационная архитектура

### 6.1 Стандарт глубины

Для серьёзного B2B/service-сайта одна длинная homepage не считается полноценной архитектурой.

Базовый полезный набор, если подтверждён бизнесом:

- Home;
- Services/Solutions hub;
- отдельные pages ключевых услуг/продуктов;
- Process / How it works;
- Cases / Work;
- отдельные case studies;
- About / Company / Team с реальными данными;
- Resources / Blog / Guides;
- Contact / Request analysis;
- FAQ;
- Privacy, Terms, Cookies и иные обязательные legal pages;
- 404/500 и system states.

`12–20` полезных URL — стартовая эвристика для содержательного B2B-сайта, а не квота. Страница существует только при уникальном intent и полезном ответе.

### 6.2 Критерий существования страницы

Новая страница нужна, если одновременно:

- есть отдельный user/search intent;
- есть уникальный ответ;
- есть достаточный proof/content;
- есть место в user journey;
- она не является near-duplicate;
- есть owner и план обновления.

Если условия не выполнены, материал объединяется с существующей страницей.

### 6.3 Роль homepage

Homepage должна быстро ответить:

1. Кто вы.
2. Для кого.
3. Какую проблему решаете.
4. Почему вам можно верить.
5. Какие направления доступны.
6. Какой следующий шаг.

### 6.4 Service/Product page

Обязательный каркас:

- конкретный H1;
- ситуация/проблема;
- результат и механизм;
- что входит и что не входит;
- proof/demo/sample output;
- процесс;
- ограничения/compliance;
- FAQ;
- related pages;
- один основной CTA.

### 6.5 Case study

Обязательный каркас:

- контекст и relationship disclosure;
- исходная проблема;
- ограничения;
- действия;
- проверяемые артефакты/evidence;
- результат без завышения причинности;
- lessons;
- следующий шаг.

Неподтверждённые case drafts допускаются только в protected/noindex preview с явной маркировкой и publication gate.

### 6.6 Expert article

Статья должна быть редакционным экспертным материалом, а не SEO-полотном:

- живой вход;
- конкретная проблема;
- факты и sources;
- практические действия;
- visual pauses;
- internal links;
- compliance, если релевантно;
- выводы и мягкий CTA.

### 6.7 Матрица моно-лендингов и архитектура Aesthetic Direct-Response

Для B2B-продаж, платного трафика и товарных направлений создание десятков разрозненных страниц каталога или многостраничных лабиринтов запрещено: это размывает рекламный бюджет и снижает конверсию. Вместо этого применяется **Матрица моно-лендингов на поддиректориях основного домена** (`domain.com/hero-product/`):

1. **Фокус на 3–4 Hero-продуктах:**
   - *Флагман / Локомотив:* продукт с максимальным поисковым спросом, решающий главную боль клиента и служащий крючком для знакомства с компанией (пример: `/innotox/`).
   - *Потоковый / Эконом-продукт:* рабочая лошадка с минимальной ценой за единицу для оптовых клиентов с большим расходом (пример: `/botulax/`).
   - *Премиальный высокочековый продукт:* регенеративная эстетика / топовый уровень маржи (пример: `/rejuran/`).
   - *Order Desk / Консолидация:* сервис сборного комплексного заказа со ступенчатой скидкой от объема.

2. **Обязательная 7-блочная архитектура Aesthetic Direct-Response:**
   Каждый моно-лендинг проектируется как автономная машина продаж по методологии СПИН (Пост 147 @solokumi):
   - **Блок 1. Hero с микро-интерактивом:** конкретный H1 + снятие барьера в подзаголовке + переключатель дозировок/конфигураций прямо на первом экране (вовлечение в клики в первые 3 секунды) + траст-бейдж (оригинальность, температурный контроль).
   - **Блок 2. Продуктовая физика и снятие страхов:** технические и клинические доказательства безопасности (отсутствие альбумина, батч-коды, холодовая цепь 2–8°C), отвечающие на скрытые фобии клиентов.
   - **Блок 3. Сравнительная таблица (Clear Contrast):** объективное сопоставление нашего решения с традиционными альтернативами рынка по 4–5 критериям (скорость, риск брака, диффузия, чистая маржа).
   - **Блок 4. Интерактивный калькулятор тиража и маржинальности:** динамический ползунок объема заказа со ступенчатыми оптовыми скидками, мгновенным расчетом экономии и прямой привязкой к кнопке CTA («Зафиксировать оптовую цену $X»).
   - **Блок 5. Социальные доказательства (Social Proof):** отзывы с реальными именами, клиниками и конкретными измеримыми результатами, подтвержденные лабораторными сертификатами.
   - **Блок 6. FAQ как скрипт закрытия возражений:** ответы на топ-5 причин отказа у живых менеджеров по продажам (логистика, юридический инвойс, проверка подлинности).
   - **Блок 7. Low-Friction Tripwire CTA:** легкий первый шаг (тестовая партия от 1–2 флаконов по оптовой цене), снимающий страх крупного первого платежа.

## 7. Уникальный визуальный язык

### 7.1 Design thesis

До макетов утверждается одна фраза:

> Сайт должен ощущаться как [характер], потому что [правда о бренде], и помогать [аудитории] принять [решение].

Дополнительно фиксируются:

- три свойства, которые дизайн должен выражать;
- три свойства, которых в дизайне быть не должно;
- один основной visual register;
- один главный proof visual;
- одна visual signature;
- один motion motif.

### 7.2 Источники уникальности

Приоритет:

1. Реальный продукт, процесс, объект, команда или результат.
2. Отраслевая специфика: maps, documents, data, drawings, materials, equipment, spaces, interfaces — в зависимости от бизнеса.
3. Собственная редакционная позиция и voice.
4. Собственный набор photography, illustrations, icons, diagrams и screenshot frames.
5. Необычная, но функциональная композиционная логика.

### 7.3 Reference decomposition

Референс разбирается по отдельным решениям: navigation, hero, typography, long-form reading, cards, cases, forms, motion, mobile.

Для каждого референса фиксируется:

- что берём;
- зачем;
- как трансформируем под бренд;
- что запрещено копировать.

Запрещено копировать чужой trade dress, CSS, assets, fonts, copy или структуру страницы один-в-один.

### 7.4 Visual signature

У каждого сайта должна быть одна повторяемая сигнатура, например:

- собственный способ показывать реальные данные;
- характерная editorial grid;
- фирменный before/after;
- собственный screenshot frame;
- особая линия, рамка, подпись или numbering;
- единый переход между состояниями.

Сигнатура усиливает смысл, а не является декоративным трюком.

## 8. Anti-slop

### 8.1 Запрещённые визуальные дефолты

Без отдельного обоснования нельзя использовать:

- purple/blue gradients как автоматический фон «технологичности»;
- glassmorphism на каждом блоке;
- абстрактные glowing spheres, waves и grids без связи с продуктом;
- одинаковые cards «icon — title — paragraph» во всех секциях;
- три cards в ряд как единственную композиционную модель;
- emoji вместо системных icons;
- excessive pills и badges;
- одинаковое большое скругление у каждого элемента;
- всё по центру и одинаковые section gaps на всей странице;
- decorative dashboards с выдуманными данными;
- stock handshakes, call-centre и улыбающиеся office teams;
- AI-людей в роли реальных клиентов, сотрудников или экспертов;
- fake testimonials, client logos, ratings и counters;
- «премиальность» только через black/gold/serif;
- копирование эстетики Stripe, Linear, Vercel, Apple или другого бренда без собственной причины.

### 8.2 Запрещённый AI-copy

Удалять формулировки вида:

- «в современном быстро меняющемся мире»;
- «революционное решение»;
- «раскройте потенциал»;
- «выведите бизнес на новый уровень»;
- «комплексный инновационный подход»;
- «бесшовный опыт» без механизма;
- необоснованные проценты роста;
- симметричные пустые абзацы и списки.

Текст должен демонстрировать знание бизнеса, а не способность генерировать гладкие слова.

### 8.3 Anti-attractor check

Перед визуальным направлением агент перечисляет пять наиболее вероятных шаблонных решений для категории и сознательно исключает их из default direction.

### 8.4 Стандарт эстетичной визуальной геометрии (Dark Modern & Functional Lighting)

Для технологичных, медицинских и B2B-продуктов разрешен и рекомендуется визуальный стиль **Dark Modern / Controlled Ambient Glow**:
1. **Базовый фон:** глубокий графитовый оттенок (`#090B0E`), исключающий «слепящий» или «грязный» черный.
2. **Поверхности карточек:** полупрозрачный темный фон (`#12161C`) с деликатной границей `1px solid rgba(255, 255, 255, 0.08)`.
3. **Фоновое световое пространство (Ambient Glow):** вместо плоских разноцветных градиентов разрешены крупные мягкие радиальные пятна подложкой (`radial-gradient` с размытием `filter: blur(80px)`), создающие ощущение глубины и оптики без шума и падения контрастности текста.
4. **Типографическая иерархия:**
   - Заголовки H1–H3: технологичный гротеск (`Space Grotesk`, `Geist`, `Syne`) с плотным кернингом (`-0.02em`..`-0.03em`) и начертаниями 700/800.
   - Наборный текст: нейтральный высокочитаемый гротеск (`Plus Jakarta Sans`, `Inter`, `Geist`) с `line-height: 1.6`.
   - Моноширинные бейджи: микро-плашки статусов, дозировок, батчей и артикулов в моно-шрифте с полупрозрачной цветной заливкой (`rgba(45, 224, 165, 0.1)`).
5. **Интерактивные Dev-слайдеры отступов (Пост 466):** на этапе прототипирования разрешено встраивать в макет временную панель ползунков для точной визуальной калибровки отступов и скруглений человеком перед фиксацией в CSS.

## 9. Контентная система

### 9.1 Логика текста

Базовая последовательность:

`факт/ситуация → проблема → последствие → механизм → proof → действие`

### 9.2 Редакционные правила

- Один paragraph — одна мысль.
- Конкретные nouns и verbs вместо общих adjectives.
- Short и medium sentences чередуются.
- H1 описывает реальную задачу, не generic category.
- CTA называет следующий business step.
- Claim отделяется от proof.
- Fact имеет source/owner/date.
- RU и EN — адаптация, не механический перевод.
- Raw LLM output не публикуется без human edit.

### 9.3 Content density

Страница должна содержать достаточно информации для решения, но не повторять один аргумент в разных формулировках. Long-form content разбивается headings, visuals, lists, tables, quotes, checklists и CTA cards.

### 9.4 Proof policy

Разрешено:

- verified cases;
- product screenshots;
- source-linked facts;
- named people с consent;
- real documents и samples с разрешением;
- clearly labelled illustrative examples в protected preview.

Запрещено:

- fake proof;
- anonymous invented testimonials;
- invented client logos;
- fake `AggregateRating`;
- vanity counters без source;
- AI-generated «product screenshots» как факт.

## 10. Система изображений и canonical media-slot contract

### 10.1 Приоритет визуалов

1. Реальный продукт, объект, process или result.
2. Data visualisation и diagrams из реальных данных.
3. Rights-cleared project photography.
4. Purpose-built illustration.
5. Rights-cleared stock для supporting context.
6. AI-generated art только как явно не-документальный supporting visual.

Placeholder не является proof и не занимает место реального кейса, результата, человека, продукта или интерфейса при оценке content readiness.

### 10.2 Единый язык

На одном сайте фиксируются palette, line weight, crop policy, light/shadow, icon family, illustration style, screenshot frame, captions/credits, provenance и rights owner. Смешение unrelated styles запрещено.

### 10.3 AI-generated assets

AI-asset допустим, если он не изображает вымышленного клиента, employee или expert как реального, не подменяет evidence, не нарушает права, соответствует image brief и project DESIGN.md, не содержит единственную копию важного текста и проходит human art-direction review.

На medical, legal, financial и других high-trust surfaces AI-человек, fake before/after, fake diagnostic image, fake document и fake interface запрещены как proof независимо от подписи.

### 10.4 Image brief

Для каждого ключевого visual фиксируются purpose, message, subject, composition, aspect ratio, mobile crop, style constraints, prohibited elements, source/rights, alt/caption, required/optional release status, allowed routes/channels/markets/operators и review/expiry/withdrawal owner.

### 10.5 Техническая подача

- width/height или aspect-ratio резервируют место;
- responsive images используют srcset/sizes или framework equivalent;
- hero получает отдельную mobile art direction, если crop теряет смысл;
- modern formats AVIF/WebP имеют fallback;
- below-fold media lazy-load;
- изображения не содержат единственную копию важного текста;
- alt описывает функцию и смысл, а не SEO keywords;
- asset URL получает content hash/version;
- исходник не upscale-ится для имитации требуемого разрешения.

### 10.6 Обязательная архитектура для всех новых сайтов

Все новые сайты, page families и major redesigns используют три уровня:

~~~text
page/content
  → stable semantic media_id
  → media registry
  → versioned source + generated derivatives
~~~

Страница ссылается на смысловой ID через один component/helper:

~~~tsx
<MediaSlot id="person.gulbara.portrait.primary" />
<MediaSlot id="place.expert-dental.exterior" />
<MediaSlot id="scene.consultation.primary" />
~~~

Запрещено:

- hardcode replaceable file paths в page/component copy;
- ID вида image-1, photo-final-2 или new-banner;
- вручную заменять generated derivative;
- молча перезаписывать исходник и терять rollback;
- использовать asset одного operator/team/patient как evidence другого;
- сохранять raw PII, PHI или EXIF location в public derivative.

Допустимое имя ID: lower-case semantic namespace из стабильного subject/scene/role, например person.atabek.portrait.primary. Placement-specific crop и art direction хранятся в registry, а не в filename. Legacy-сайт без build layer использует equivalent resolver: page знает ID, не physical path.

### 10.7 Минимальная schema media registry

~~~yaml
person.gulbara.portrait.primary:
  schema_version: 1
  kind: photo
  state: placeholder
  required_for_release: false
  purpose: coordinator-role portrait
  subject: person.gulbara
  operator_scope: bishkek
  allowed_routes:
    - /partners/{approved-partner}/
  allowed_channels:
    - protected-preview
  ratio: 4/5
  minimum_source_px: 1600x2000
  focal_point: [50, 35]
  alt: null
  caption: null
  source_ref: placeholders/person.gulbara.portrait.primary.svg
  source_sha256: null
  rights_ref: null
  consent_ref: null
  reviewer: null
  reviewed_at: null
  expires_at: null
~~~

Обязательные state:

| State | Значение | Public release |
|---|---|---|
| placeholder | композиционная заглушка без claim/proof | запрещён для required slot |
| candidate | источник загружен, проверки не завершены | запрещён |
| approved | technical, rights/consent и применимые human reviews закрыты | разрешён в recorded scope |
| expired | review, rights, role или operator scope истёк | запрещён |
| withdrawn | approval/consent отозван | запрещён и удаляется по runbook |
| missing | обязательный source отсутствует | build/release blocker |

Approval всегда ограничен routes/channels/markets/operators и не переносится автоматически.

### 10.8 Плейсхолдеры

Placeholder нужен только для layout, crop и content-composition review. Он обязан:

- быть purpose-built в visual language проекта;
- иметь точное aspect ratio и safe zones;
- не изображать вымышленного пациента, клиента, врача, employee, результат, документ, metric или product screen;
- не содержать lorem, fake testimonial, fake logo или fake clinical data;
- показывать media ID и назначение в local/protected review mode;
- иметь пустой alt на public-like render, если он декоративный;
- оставаться state=placeholder до реального approval.

Placeholder разрешён в local development, UI Kit и access-controlled/no-store protected preview. Noindex без access control не превращает публичный production URL в protected preview.

Для public production каждый required_for_release slot обязан быть approved. Optional slot без approved asset не показывает заглушку: section схлопывается или использует отдельно approved abstract illustration. Кейс, before/after, testimonial, doctor profile, partner logo, metric, certificate и product screenshot нельзя временно заменять вымышленным proof.

### 10.9 Безошибочная замена через inbox/ingest

Каждый новый project документирует equivalent четырёх команд:

~~~bash
media:inventory
media:ingest
media:check
media:contact-sheet
~~~

Для Node-проектов это рекомендуемые package-script aliases; другой stack документирует эквивалент в project DESIGN.md.

Human workflow:

1. узнать ID и требования в contact sheet;
2. назвать файл <media_id>.<approved-extension>;
3. положить его в media-inbox или передать ID + source ingest-команде;
4. подтвердить rights, consent, route/channel scope и alt/caption;
5. запустить ingest;
6. проверить contact sheet и representative mobile/desktop render;
7. перевести asset в approved только после применимых reviews;
8. commit manifest, versioned source reference, metadata и evidence вместе.

Ingest атомарно проверяет ID, MIME, decode, размер и ориентацию; применяет EXIF orientation и удаляет public GPS/device metadata; считает SHA-256; создаёт immutable source version; проверяет crop/focal point; создаёт AVIF/WebP/JPEG derivatives, srcset metadata, intrinsic dimensions и cache hash; обновляет manifest; формирует status report, contact sheet и visual-regression input.

Ошибка не меняет текущий approved binding. Старый source сохраняется до принятия новой версии; rollback восстанавливает manifest binding без ручной правки страниц.

### 10.10 Validation и fail-closed rules

Media check и release guard блокируют:

- unknown/duplicate ID;
- missing required ID/source;
- direct replaceable image path outside approved resolver;
- invalid MIME/decode/orientation;
- source ниже minimum size или accidental upscaling;
- missing intrinsic dimensions или responsive derivative;
- missing alt для informative asset или non-empty alt для purely decorative asset;
- отсутствующий rights/consent/provenance reference;
- expired/withdrawn approval;
- subject/operator/channel/market scope mismatch;
- raw PII/PHI/unsafe EXIF в public output;
- orphan generated assets или reference to missing file;
- public required slot не в состоянии approved;
- cache version, не совпадающий с current source hash.

Непроверяемое автоматически условие остаётся blocker или approved exception с owner и review date, а не silent pass.

### 10.11 Derivative и performance policy

Default width set для обычной photography: 480, 768, 1280 и 1920 px; project меняет его только на основании layout/CWV budget. Не генерировать размеры, которые не используются в sizes.

Обязательны отдельный LCP/hero preset, mobile crop при потере смысла, no upscaling, predictable quality, fallback format, immutable cache, derivative budget в QA Manifest, below-fold lazy load и visual comparison после смены focal point/crop policy.

### 10.12 Rights, consent, sensitive data и withdrawal

Media registry хранит ссылку/ID approval, а не публикует consent document или персональные данные. Для людей, patients, employees, partners, locations, documents и screens фиксируются rights owner/source, consent scope, subject/operator/program, routes/channels/markets, capture/review dates, reviewer, expiry, withdrawal owner и removal SLA.

Одно разрешение не расширяется автоматически с site на social/video, с одной страны/клиники на другую или с protected preview на public release.

Withdrawn/expired asset имеет reverse index media_id → routes/builds/CDN derivatives, чтобы удалить его из всех поверхностей и подтвердить replacement/rollback.

### 10.13 Inventory, contact sheet и handoff

Generated inventory/contact sheet показывает preview, state, required/optional, placements, ratio/minimum size/focal point, alt/caption readiness, rights/consent/reviewer status, current source hash/version, expiry, exact replacement filename/command и blocker reason.

Каждый PR/release, меняющий media, содержит before/after inventory delta и число approved, candidate, placeholder, expired, withdrawn и missing.

### 10.14 Release environment matrix

| Surface | Placeholder policy |
|---|---|
| local/UI Kit | разрешён, ID/status видим reviewer |
| access-controlled protected preview + no-store | разрешён, но не считается proof/content readiness |
| staging | разрешён только с blocker report и закрытым indexing/access policy |
| public production, включая noindex | required placeholder запрещён; optional slot скрывается |
| case/testimonial/doctor/partner-logo/result evidence | fictional placeholder proof запрещён на любой public surface |
| abstract supporting illustration | допустима только как отдельный approved asset |

### 10.15 Media system Definition of Done

- media registry schema/version и owner определены;
- все replaceable assets доступны только через semantic media IDs;
- inventory/ingest/check/contact-sheet workflow воспроизводим;
- dry-run заменяет один placeholder реальным candidate, генерирует derivatives, показывает preview и безопасно откатывается;
- required/optional и release state проверяются автоматически;
- rights/consent/operator/channel scope fail closed;
- 320 px и desktop crops проверены;
- asset 404, CLS, LCP budget и cache invalidation проверены;
- public release не содержит unresolved required placeholders или fictional proof.

## 11. Дизайн-система

### 11.1 Обязательные слои

- semantic tokens: color, type, spacing, radius, shadow, motion, z-index;
- base styles;
- production components;
- states: hover, focus, active, disabled, loading, error, success, empty;
- shared shell;
- page templates;
- real UI Kit;
- visual baselines.

### 11.2 Семантика вместо хардкодов

Новые colors, spacing, radii и effects сначала получают semantic role в системе. Page-specific one-off values требуют обоснования и не должны размножаться.

Для EVO/ROVLEX действуют более строгие правила `DESIGN_SYSTEM_KIT.md`: только approved tokens/classes, no inline styles, no arbitrary hex.

### 11.3 Component governance

Новый component добавляется только если:

- существующий не решает задачу;
- use case повторяем;
- определены states и responsive behavior;
- accessibility проверена;
- component добавлен в real UI Kit;
- docs и visual baseline обновлены вместе.

## 12. Responsive

### 12.1 Подход

Mobile — не уменьшенный desktop. Сначала определяется content priority, затем layout.

Использовать:

- fluid type/spacing через approved tokens;
- content-driven breakpoints;
- CSS grid/flex;
- container queries для reusable components, когда они упрощают поведение;
- art direction для images;
- progressive disclosure без потери важных фактов.

### 12.2 Обязательная матрица

Проверять минимум:

- 320 CSS px;
- 375/390 px;
- tablet portrait;
- tablet landscape/small laptop;
- desktop;
- wide desktop;
- 200% zoom;
- landscape mobile, если есть forms/media.

### 12.3 Непереговорные правила

- no horizontal scroll at 320 px;
- no text clipping;
- touch targets project default ≥44×44 px;
- inputs на mobile имеют font-size не меньше 16 px;
- nav/menu/modal/form работают touch и keyboard;
- tables имеют approved mobile strategy;
- sticky/fixed elements не перекрывают content/focus;
- hover не является единственным способом доступа;
- content order остаётся логичным в DOM.

## 13. Motion system

### 13.1 Назначение

Motion используется для:

- подтверждения действия;
- объяснения relationship/state change;
- orientation;
- мягкого hierarchy emphasis;
- одной brand signature.

### 13.2 Интенсивность

Default public marketing site: **3/10**.

Больше возможно только при отдельном design thesis и performance/accessibility review.

### 13.3 Timing policy

Стартовые ranges:

- micro feedback: 100–180 ms;
- component transition: 160–260 ms;
- section reveal: 250–450 ms;
- page-level transition: только при доказанной пользе.

Это policy, не повод анимировать каждый элемент.

### 13.4 Ограничения

- преимущественно `transform` и `opacity`;
- no layout-thrashing animation;
- reveal не скрывает content без JS;
- no scroll hijacking;
- autoplay media только muted и при реальной пользе;
- heavy animation libraries требуют approval и budget impact;
- interaction не зависит от precise pointer movement.

### 13.5 Reduced motion

`prefers-reduced-motion` обязателен. При reduced motion content, state и navigation сохраняются; movement отключается или заменяется instant/subtle transition.

## 14. Техническая архитектура

### 14.1 Выбор стека

Стек выбирается по требованиям, а не моде.

Для content/marketing surfaces предпочтителен static/server-first output. Framework допустим, если он даёт измеримую пользу: typed content, templates, build pipeline, i18n, component reuse или approved integrations.

Не мигрировать стабильный сайт только ради framework.

### 14.2 Progressive enhancement

Без client JS должны оставаться доступны:

- основная copy;
- navigation links;
- images;
- contact details;
- crawlable internal links;
- basic forms, если architecture позволяет.

Client JS используется для search, filters, calculators, maps, forms enhancement и other real interactions.

### 14.3 Content model

Предпочитать typed blocks вместо raw HTML от LLM:

- heading;
- paragraph;
- list;
- media_slot;
- quote;
- fact/source;
- FAQ;
- comparison;
- CTA;
- warning/compliance;
- case evidence;
- related links.

### 14.4 Shared shell

Header, footer, navigation, consent, locale, analytics bootstrap и common metadata не дублируются вручную во всех pages.

### 14.5 Third-party policy

Каждый third-party script имеет:

- business owner;
- purpose;
- privacy/legal basis;
- performance cost;
- loading strategy;
- failure behavior;
- removal path.

Неиспользуемый script удаляется.

## 15. Производительность

### 15.1 Field targets

На 75-м percentile real users, где доступны field data:

- LCP ≤ 2.5 s;
- INP ≤ 200 ms;
- CLS ≤ 0.1.

Lab results используются как gate и диагностика, но не подменяют field data.

### 15.2 Стартовые budgets студии

Это внутренняя policy, а не универсальная норма поисковиков. До отдельного project approval:

- initial compressed HTML: ≤100 KB на обычной page;
- critical/initial CSS: ≤150 KB compressed;
- initial JS marketing page: ≤170 KB compressed;
- total fonts: ≤250 KB для first view;
- hero media: target ≤250 KB, hard review >400 KB;
- initial transfer обычной marketing page: target ≤1.5 MB;
- third-party JS: минимальный, с отдельным owner.

Если page требует больше, фиксируются причина, измерение и approval.

### 15.3 Обязательные практики

- remove unused JS/CSS;
- defer non-critical scripts;
- preload только реально critical assets;
- self-host approved fonts;
- subset fonts и ограничивать weights;
- reserve media dimensions;
- optimize hero/LCP resource;
- avoid autoplay heavy video above fold;
- cache immutable assets;
- Brotli/Gzip;
- monitor 404 asset failures;
- prevent hydration всего сайта ради одного widget.

## 16. Accessibility

Целевой уровень — **WCAG 2.2 AA**.

Обязательные требования:

- semantic headings и landmarks;
- one primary `main`;
- keyboard access ко всем actions;
- visible focus;
- focus не перекрывается sticky UI;
- skip link для больших pages;
- labels и instructions для forms;
- errors связаны через accessible name/description;
- no color-only meaning;
- contrast соответствует AA;
- reflow at 320 CSS px;
- usable at 200% zoom;
- dialogs имеют focus management, Escape policy и restore focus;
- media имеет captions/transcript, когда нужно;
- decorative images имеют empty alt;
- reduced motion supported;
- auto-updating content не создаёт unexpected focus/context changes.

Accessibility является P0/P1 quality gate, а не финальным cosmetic pass.

## 17. SEO и AEO/GEO

### 17.1 Search foundation

Для каждой indexable page:

- unique title и meta description;
- one clear H1;
- self canonical;
- correct language/hreflang;
- crawlable internal links;
- breadcrumb where useful;
- inclusion in sitemap;
- intentional robots/noindex;
- Open Graph metadata;
- correct redirects and status codes;
- no orphan/thin/duplicate pages.

### 17.2 Structured data

Schema соответствует visible content и реальному entity:

- Organization/LocalBusiness/Service/Product/Article/FAQ/Breadcrumb только когда применимо;
- no fake ratings/reviews;
- no facts hidden only in JSON-LD;
- brand/domain/entity совпадают с visible page;
- validation без critical errors.

### 17.3 AI-readable content & GEO Standard (Generative Engine Optimization)

Для индексации и цитирования в поисковых нейросетях (ChatGPT Search, Perplexity AI, Claude):
- **Выделенный эндпоинт `/for-llm` (или `llms.txt`):** чистый Markdown-файл в корне домена без скриптов, стилей и рекламы. Содержит структурированные факты: юрлицо, производители, SKU каталога, оптовые цены, протоколы холодовой цепи, правила доставки и гарантии. Ссылка на эндпоинт дублируется в футере и sitemap.xml.
- **Политика `robots.txt`:** для поисковых AI-ботов (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`) публичные контентные и товарные разделы открываются явно (`Allow: /`), а служебные и персональные маршруты закрываются.
- **Микроразметка Schema.org:** разметка `Product`, `MedicalBusiness`, `WholesaleStore`, `FAQPage` с реальными ценами и характеристиками.
- **Семантический HTML:** full content доступен без выполнения клиентского JS, термины и утверждения имеют источники.
- Content отвечает на реальные профессиональные вопросы закупщиков (JTBD).

### 17.4 Массовый AI-content запрещён

Нельзя создавать pages только ради keyword variants. Масштабирование разрешено после representative template gate и при наличии уникального intent, evidence, owner и update plan.

## 18. Security, privacy и legal

Обязательные требования:

- secrets never in repository/client bundle;
- server-side validation для forms;
- spam/rate-limit/Turnstile или approved equivalent;
- CSP и security headers по project platform;
- dependency/source policy;
- no PII in analytics URLs/events;
- consent до non-essential tracking;
- privacy/cookie/terms/disclosure соответствуют рынку и actual processors;
- form delivery failure is observable;
- protected drafts are noindex and access-controlled;
- media rights/provenance recorded;
- rollback documented.

Legal pages не могут быть lorem или generic template, не соответствующим реальному business/processors.

## 19. Протокол работы с AI

### 19.1 Обязательный порядок

1. Прочитать `START.md`, `ROUTER.md`, этот SSOT и project canon.
2. Провести discovery и fact/proof audit.
3. Создать Site Map.
4. Утвердить design thesis и reference decomposition.
5. Создать/обновить project `DESIGN.md`.
6. Создать tokens, shell и real UI Kit.
7. Сделать один representative page template.
8. Проверить mobile, accessibility, performance и anti-slop.
9. Только после Gate 4 масштабировать patterns.
10. Добавить real assets/copy.
11. Пройти pre-ship gauntlet.
12. Обновить docs, UI Kit и baselines вместе с implementation.

### 19.2 Размер задачи

Агент получает одну проверяемую единицу:

- IA;
- navigation;
- hero;
- component family;
- form;
- case/article/service template;
- one page;
- responsive pass;
- accessibility pass;
- performance pass;
- polish/release pass.

Запрос «сделай весь сайт» разрешён как orchestration plan, но не как единичная uncontrolled generation финального production UI.

### 19.3 Что AI запрещено придумывать

- facts;
- prices;
- legal claims;
- testimonials;
- cases;
- client names;
- metrics;
- licences;
- partners;
- offices;
- awards;
- product screenshots;
- analytics results.

Неизвестное помечается как gap/placeholder, блокирующий production.

### 19.4 Vibe-Coding Toolchain (Solokumi Canon)

Для быстрой и безошибочной сборки страниц с AI агенты следуют регламенту:
1. **Текст ДО дизайна (Text Before Design):** запрещено генерировать дизайн с lorem ipsum или смысловыми заглушками. Сначала в LLM пишется и шлифуется финальный текст (оффер, физика продукта, сравнительная таблица, калькулятор, FAQ по СПИН), и только затем этот готовый текст передается в верстку.
2. **Связка Figma MCP + Auto-layouts:** макет победителя переносится через `html.to.design` в Figma, подключается через Figma MCP (`claude mcp add --transport http figma https://mcp.figma.com/mcp`) и служит точным структурным референсом для агента.
3. **Пакетные правки (Batch Prompts):** замечания к макету группируются пачками (типографика + отступы + интерактив), чтобы не вызывать деградации CSS-кода частыми мелкими промптами.
4. **Визуальная упаковка:** готовые интерфейсы оформляются в 3D-мокапы через [shots.so](https://shots.so/), а интерактивные калькуляторы и скрипты записываются через [Screen Studio](https://www.screen.studio/).

### 19.5 Visual review loop

После каждого representative component/page обязательны screenshots минимум mobile и desktop.

Review отвечает:

- Узнаваем ли бренд без logo?
- Есть ли real main visual?
- Понятна ли hierarchy?
- Отличаются ли sections по composition, оставаясь одной системой?
- Нет ли AI-default patterns?
- Читается ли page без animation?
- Сохраняется ли смысл на mobile?

## 20. Project gates

### Gate 0 — Strategy ready

Есть audience, offer, conversion goal, facts, proof inventory и constraints.

### Gate 1 — IA ready

Есть route inventory, page purpose, internal linking и content owners. Нет thin/duplicate pages.

### Gate 2 — Visual direction ready

Утверждены design thesis, reference decomposition, visual signature, image language, media-slot inventory/briefs и anti-attributes.

### Gate 3 — System ready

Есть `DESIGN.md`, tokens, shell, representative components, states, real UI Kit, media registry, resolver/component и воспроизводимые inventory/ingest/check/contact-sheet commands.

### Gate 4 — Template ready

Одна representative service/content/case page полностью проходит responsive, accessibility, performance и visual review. До этого массовая генерация pages запрещена.

### Gate 5 — Content ready

Facts verified, proof real, copy human-edited, schema matches visible content; intended-release media имеют approved rights/consent/scope, а required slots не остаются placeholder/candidate/expired/withdrawn/missing.

### Gate 6 — Release ready

Route smoke, forms, analytics, SEO, accessibility, CWV budgets, security headers, legal, visual regression и rollback подтверждены.

## 21. Pre-ship gauntlet

### 21.1 Content and truth

- [ ] Нет invented facts, cases, testimonials, logos или counters.
- [ ] Key claims имеют source/owner/date.
- [ ] CTA соответствует реальному process после click.
- [ ] Нет unresolved required placeholder/lorem/mock data в public production; protected-preview placeholders учтены в registry и не выдаются за proof.
- [ ] Copy звучит как expertise конкретной отрасли.

### 21.2 Visual and anti-slop

- [ ] Design thesis виден в interface.
- [ ] Есть собственный main visual и signature.
- [ ] Sections не повторяют один template.
- [ ] Нет prohibited AI-default patterns.
- [ ] UI Kit отражает production.
- [ ] Нет random one-off tokens/components.
- [ ] Replaceable media подключены по semantic ID через registry/resolver.
- [ ] Contact sheet показывает approved/candidate/placeholder/expired/withdrawn/missing states.

### 21.3 Responsive and interaction

- [ ] 320 px без horizontal scroll.
- [ ] Keyboard flow полный.
- [ ] Focus visible и not obscured.
- [ ] Menu/modal/form работают mobile и desktop.
- [ ] Hover не единственный access path.
- [ ] Reduced motion сохраняет meaning.

### 21.4 Performance

- [ ] CWV targets подтверждены lab/field baseline.
- [ ] JS/CSS/images/fonts укладываются в budgets или есть approval.
- [ ] Hero/LCP optimized.
- [ ] Media reserves space.
- [ ] Responsive derivatives, crop/focal point и cache hash соответствуют media registry.
- [ ] Third-party scripts inventoried.

### 21.5 SEO/AEO

- [ ] Full content доступен без mandatory JS.
- [ ] Title/H1/description/canonical correct.
- [ ] Sitemap, robots, hreflang, redirects checked.
- [ ] Schema valid и соответствует visible content.
- [ ] Нет orphan/thin pages.
- [ ] Internal links поддерживают decision journey.

### 21.6 Security/privacy/legal

- [ ] Forms server-validated.
- [ ] Нет secrets/PII leak.
- [ ] CSP/security headers checked.
- [ ] Consent/privacy соответствуют market/processors.
- [ ] Legal/disclosure pages production-ready.
- [ ] Rollback exists.

## 22. Blocking P0

Release запрещён при любом пункте:

- broken primary CTA/form;
- fake proof;
- unresolved required placeholder/candidate/expired/withdrawn/missing media на public production;
- missing rights/consent/provenance для intended media scope;
- PII/secret leak;
- blocking keyboard/accessibility error;
- mobile overflow key page;
- core public content unavailable without JS без product reason;
- wrong canonical/noindex/redirect with indexation risk;
- schema with invented ratings/reviews;
- missing mandatory legal/privacy surface;
- broken payment/auth/data flow;
- no rollback for major migration.

## 23. Quality score

| Category | Points |
|---|---:|
| Strategy and IA | 15 |
| Brand uniqueness and visual system | 15 |
| Content, proof and editing | 15 |
| UX, interaction and responsive | 15 |
| Accessibility | 10 |
| Performance | 10 |
| SEO/AEO and information connectivity | 10 |
| Reliability, security and privacy | 10 |

Ship conditions:

- total ≥85/100;
- no category below 70% of its maximum;
- no P0;
- all required gates closed.

## 24. After launch

### First 30 days

Monitor:

- field CWV and JS errors;
- form completion/delivery;
- CTA click-through;
- search/index coverage;
- 404/broken links;
- mobile conversion gap;
- top landing pages;
- actual buyer questions for new pages.

### Ongoing cycle

- monthly: links, forms, indexation, field performance, third-party scripts;
- quarterly: content freshness, proof, visual consistency, accessibility spot-check, design-system debt;
- after systemic change: update `DESIGN.md`, UI Kit, baselines and QA Manifest;
- deprecated patterns are marked and not used in new pages.

## 25. Связь с grainee-v2

Этот SSOT зарегистрирован в:

- `docs/ROUTER.md`;
- `docs/ssot/INDEX.md`;
- `docs/READING_ORDER.md`;
- `.cursor/rules/00-website-studio-read-first.mdc`;
- `.cursor/skills/website-studio/SKILL.md`.

Продолжают действовать более specific sources:

- `docs/ssot/DESIGN_SYSTEM_KIT.md` — exact EVO/ROVLEX tokens/components и anti-slop;
- `docs/ssot/ROVLEX_HUMAN_REWRITE.md` — human B2B copy;
- `docs/ssot/ROVLEX_BLOG_ARTICLE_CANON.md` — long-form article structure;
- `docs/ssot/ROVLEX_BLOG_ARCHITECTURE.md` — blog URL/i18n/SEO;
- `docs/founder-notes/DEC-698_aeo-geo-architecture-rovlex.md` и `docs/ssot/AEO_GEO_OPS.md` — AEO/GEO;
- `docs/ssot/TESTING.md` и `docs/ssot/AB_TESTING.md` — QA/experiments;
- project-specific SSOT: DIROCO, VOLA, RAIMOV и другие.

Новый standard не копирует их детали. Он задаёт общий production method для новых сайтов/pages/redesigns.

## 26. Нормативная база

Внешние references:

- pimenov.ai — interfaces/visual systems, AI design process и `DESIGN.md` approach;
- W3C WCAG 2.2;
- web.dev Core Web Vitals;
- Google Search Essentials и structured data guidelines;
- MDN responsive images, container queries, reduced motion и CSP;
- Astro islands architecture.

Внутренние references:

- `START.md`;
- `docs/ROUTER.md`;
- `docs/ssot/INDEX.md`;
- `docs/ssot/DESIGN_SYSTEM_KIT.md`;
- `docs/ssot/DESIGN_SYSTEM_ENFORCEMENT.md`;
- `docs/ssot/UI_INTERACTION_RULES.md`;
- `docs/ssot/INPUT_RULES.md`;
- `docs/ssot/ROVLEX_HUMAN_REWRITE.md`;
- `docs/ssot/ROVLEX_BLOG_ARTICLE_CANON.md`;
- `docs/founder-notes/DEC-698_aeo-geo-architecture-rovlex.md`;
- `docs/ssot/AEO_GEO_OPS.md`;
- `docs/ssot/TESTING.md`;
- `docs/ssot/AB_TESTING.md`;
- `docs/tasks/TASK-730_evo_astro_pimenov_inspired_rebuild.md`;
- `docs/ssot/DIROCO_SITE_BUILD_PROMPT.md`;
- `.cursor/skills/monya-cto/SKILL.md`.

# Appendix A — project DESIGN.md template

```markdown
---
owner: Design + Brand
status: active
version: 1.0
project: <PROJECT>
updated: YYYY-MM-DD
---

# DESIGN.md — visual system <PROJECT>

## 1. Design thesis
Сайт должен ощущаться как [...], потому что [...], и помогать [...] принять [...].

## 2. Audience and decision
- Primary audience:
- Visit context:
- Main decision:
- Primary CTA:

## 3. Character
Must be:
1. ...
2. ...
3. ...

Must not be:
1. ...
2. ...
3. ...

## 4. Visual signature
- Main proof visual:
- Repeated composition pattern:
- Screenshot/data pattern:
- Motion motif:

## 5. Reference decomposition
| Reference | What we take | Why | Transformation | What must not be copied |
|---|---|---|---|---|

## 6. Color
- Semantic tokens:
- Light/dark policy:
- Contrast rules:
- Prohibited combinations:

## 7. Typography
- Display:
- Body:
- Mono/data:
- Scale:
- Line length:
- Font loading/licence:

## 8. Grid and spacing
- Container widths:
- Columns:
- Spacing scale:
- Section rhythm:
- Editorial width:

## 9. Components
- Buttons/links:
- Cards:
- Forms:
- Navigation:
- Modals/drawers:
- Tables/data:
- Content blocks:
- States:

## 10. Imagery
- Real evidence priority:
- Photography direction:
- Illustration direction:
- Icon system:
- Screenshot frame:
- Diagram style:
- AI asset restrictions:
- Media registry path/schema:
- MediaSlot/resolver source:
- Semantic ID grammar:
- Required-for-release slots:
- Placeholder policy:
- Inbox/ingest/check/contact-sheet commands:
- Derivative/crop/focal-point policy:
- Rights/consent/provenance references:
- Expiry/withdrawal/rollback:

## 11. Motion
- Intensity 1–10:
- Timing tokens:
- Allowed patterns:
- Signature motion:
- Reduced-motion behavior:
- Prohibited motion:

## 12. Responsive
- Content-driven breakpoints:
- Component container queries:
- Mobile art direction:
- Table strategy:
- Touch/focus rules:

## 13. Accessibility
- WCAG target:
- Contrast:
- Focus:
- Keyboard:
- Media alternatives:

## 14. Page templates
- Home:
- Service/Product:
- Case:
- Article:
- Contact/Form:
- Legal:

## 15. Anti-slop project list
- Prohibited:
- Deprecated:
- Approved exceptions:

## 16. Real UI Kit
- Route/path:
- Component source:
- Visual baseline path:

## 17. Change governance
Every systemic change updates DESIGN.md, implementation tokens/components, UI Kit and visual baseline in one change set.
```
