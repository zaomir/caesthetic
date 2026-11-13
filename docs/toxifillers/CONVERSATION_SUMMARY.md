# Полный скрипт и материалы сессии: AI-маркетинг, лендинги и стратегия Toxifillers.com

> **Дата сессии:** 13 ноября 2026 г.  
> **Методологическая основа:** канал [Kumar & Solo (@solokumi)](https://t.me/solokumi) (Роман Кумар Виас, Александр Соловьев) + Best Practices B2B-маркетинга эстетической медицины.  
> **Проект / Домен:** [toxifillers.com](https://toxifillers.com) (B2B Order Desk оригинальных токсинов, филлеров и препаратов эстетической медицины).  
> **Локальный репозиторий:** `Infrastructure`

---

## ОГЛАВЛЕНИЕ
1. [Транскрибация и выжимка ключевых постов @solokumi](#1-транскрибация-и-выжимка-ключевых-постов-solokumi)
   - Пост 147: Рост конверсии и закономерности работы сильных продавцов
   - Пост 466: Как создавать лендинги в Claude Design без нейрослопа
   - Пост 362: Пошаговый гайд по настройке Cursor для вайбкодинга
   - Пост 427: Копирование и адаптация лучшего лендинга конкурента
   - Пост 467: Применение модели Astra в Codex
   - Пост 307: Архитектура агента для парсинга рекламы конкурентов
   - Посты 453, 449, 205, 360: Малобюджетный трафик, контент-машинка, LinkedIn, GEO/AI SEO
2. [Реализованная автоматизация Шага-1 (Шпионаж & Анализ посадочных)](#2-реализованная-автоматизация-шага-1-шпионаж--анализ-посадочных)
   - Архитектура без сторонних платных API (Playwright + DeepSeek via OpenRouter)
   - Исходный код: `src/spy_landing.py`
   - Результаты боевого теста по нише «филлеры ботокс»
3. [Исследование сайта toxifillers.com и выявление Hero-продукта](#3-исследование-сайта-toxifillerscom-и-выявление-hero-продукта)
   - Структура каталога и бизнес-модель
   - Обоснование выбора флагмана: Innotox 100U / 50U (Medytox)
   - Кластеризация поисковых запросов (Search Intent)
4. [Созданный конверсионный моно-лендинг под Innotox 100U & 50U](#4-созданный-конверсионный-моно-лендинг-под-innotox-100u--50u)
   - Архитектура и конверсионные триггеры
   - Интерактивный калькулятор тиража и маржинальности
   - Локальные файлы лендинга и скриншот-превью
5. [План внедрения (п.1 Матрица посадочных + п.2 Доменная архитектура)](#5-план-внедрения-п1-матрица-посадочных--п2-доменная-архитектура)
6. [Атомарное описание стратегии малобюджетного трафика для консультанта (п.3)](#6-атомарное-описание-стратегии-малобюджетного-трафика-для-консультанта-п3)
   - Модуль 1: LinkedIn B2B Outreach
   - Модуль 2: Контент-машинка коротких экспертных видео
   - Модуль 3: GEO / AI SEO (ChatGPT, Perplexity, Claude)
   - Модуль 4: Партнерства со школами инъекций и тренерами
   - Модуль 5: Точечный парсинг клиник (Google Maps) + Tripwire

---

## 1. Транскрибация и выжимка ключевых постов @solokumi

### Пост 147 ([t.me/solokumi/147](https://t.me/solokumi/147))
* **Тема:** Простые действия для роста конверсии и увеличения продаж.
* **Ключевые тезисы:**
  1. *Анализ лучших продавцов (Secret Sauce):* выделить 15–20% топ-менеджеров и детально разобрать их звонки. В Qmarketing успехом было отзеркаливание, эмпатия и похвала клиентов; в Refocus — закрытие на оплату прямо на звонке (в Азии отказ считается конфликтом, поэтому уход «подумать» — это скрытое возражение).
  2. *Кастомизация питча:* нельзя делать один и тот же питч всем подряд. Презентация должна отталкиваться от выявленных болей конкретного сегмента.
  3. *Рекомендованные книги:* «СПИН-продажи» (Нил Рекхэм) и «Психология продаж» (Брайан Трейси).

### Пост 466 ([t.me/solokumi/466](https://t.me/solokumi/466))
* **Тема:** Создание конверсионных лендингов в Claude Design без шаблонного «нейрослопа».
* **Правила антислоп-дизайна:**
  1. *Бриф с жесткими негативными ограничениями:* «Без сине-фиолетовых градиентов, трех карточек в ряд и гигантского заголовка по центру».
  2. *3–5 референсов с четкой задачей:* с сайта А — типографика, с сайта B — отступы, с сайта C — анимации (сервис: [styles.refero.design](https://styles.refero.design/)).
  3. *Пакетные правки:* собирать замечания по элементам и отправлять одной пачкой во избежание деградации кода и расхода токенов.
  4. *Интерактивные ползунки:* просить нейросеть внедрить временную панель с ползунками размеров и отступов для точной ручной настройки.
  5. *Текст ДО дизайна:* тексты и офферы готовятся заранее в обычном Claude/Codex через маркетинговые скиллы.

### Пост 362 ([t.me/solokumi/362](https://t.me/solokumi/362))
* **Тема:** Пошаговая настройка Cursor для вайбкодинга и маркетинга.
* **Шаги:**
  1. Установка Pro-подписки для доступа к ведущим моделям (Sonnet).
  2. Настройка `Project Rules` (`.cursorrules`): правила работы с файлами, стилями и структурой проекта.
  3. Загрузка базы знаний: мета-промпт о компании, брендбук, JTBD, фреймворки Алекса Хормози.
  4. Режимы работы: *Ask* (консультации), *Plan* (архитектура), *Agent* (автономное написание кода и правка файлов).

### Пост 427 ([t.me/solokumi/427](https://t.me/solokumi/427))
* **Тема:** Копирование и адаптация лендинга конкурента за несколько часов.
* **Пайплайн:**
  1. *Проверка эффективности воронки:* объявление должно крутиться в Meta Ads Library / TikTok Creative Center / Google Ads Transparency более 1–2 месяцев.
  2. *Импорт макета:* плагин [html.to.design](https://html.to.design/) переносит страницу в Figma в виде векторных редактируемых автолейаутов.
  3. *Подключение Figma к Claude Code:* через команду `claude mcp add --transport http figma https://mcp.figma.com/mcp`.
  4. *Адаптирующий промпт:* сохранить структуру и аргументацию, заменив тексты, оффер и брендбук на свои.
  5. *Визуал:* мокапы в [shots.so](https://shots.so/), видео-демо в [Screen Studio](https://www.screen.studio/).

### Пост 307 ([t.me/solokumi/307](https://t.me/solokumi/307))
* **Тема:** Архитектура AI-агента для парсинга Meta Ads Library и разбора креативов.
* **Схема:** выгрузка через Apify Scraper $\rightarrow$ фильтр срока открута $\ge 30$ дней $\rightarrow$ скачивание лендингов и креативов $\rightarrow$ LLM с JSON Schema (разбор хуков, УТП, офферов, JTBD).

### Посты 453, 449, 205, 360 (Малобюджетные B2B-каналы)
* **Пост 453:** Партизанский маркетинг (HR-скидки, бартер с микроблогерами, Threads, экспертный контент).
* **Пост 449:** Контент-завод (ежедневное производство Reels/Shorts без человеко-часов: трендвотчинг, говорящие головы, CapCut).
* **Пост 205:** B2B Sales в LinkedIn (Social Selling Index $>70$, многократные касания, комментинг, точечный аутрич по лицам принимающим решения).
* **Пост 360:** Оптимизация под поиск в нейросетях — GEO (страница `yoursite.com/for-llm`, Trustpilot, Reddit, чистота robots.txt).

---

## 2. Реализованная автоматизация Шага-1 (Шпионаж & Анализ посадочных)

Пользователь поставил задачу автоматизировать сбор и анализ посадочных страниц конкурентов **локально, без использования внешних платных сервисов (Apify, Firecrawl)**, с использованием **Playwright** и модели **DeepSeek через OpenRouter** (ключ взят из `~/.env.litellm`).

### Архитектура скрипта: `src/spy_landing.py`
Скрипт выполняет полный автономный цикл:
1. Запускает локальный headless-браузер Chromium через Playwright с эмуляцией реального Mac-окружения.
2. Открывает Meta Ads Library по заданному запросу и гео (например, «филлеры ботокс», страна `ALL`).
3. Скроллит выдачу, находит активные рекламные объявления, распутывает внутренние редиректы Meta (`l.facebook.com/l.php?u=...`) и достает внешние целевые URL лендингов.
4. Переходит на найденный лендинг, ждет выполнения JS/DOM, делает полностраничный скриншот высокого разрешения и извлекает чистый текст с заголовками H1–H3.
5. Отправляет данные в `deepseek/deepseek-chat` через OpenRouter с промптом по методологии @solokumi.
6. Сохраняет структурированное маркетинговое досье в формате Markdown.

### Локальный код скрипта
Файл: [`src/spy_landing.py`](file:///Users/donnyduck/Projects/Antigravity_folders/Infrastructure/src/spy_landing.py)

### Результат боевого теста
* **Запрос:** `филлеры ботокс`
* **Обнаруженный лендинг конкурента:** `https://ho-me-so.com/ru/nc` (набор для безыгольной мезотерапии с гиалуроновой кислотой).
* **Скриншот посадочной:** [`reports/competitors/ho_me_so_com_ru_nc.png`](file:///Users/donnyduck/Projects/Antigravity_folders/Infrastructure/reports/competitors/ho_me_so_com_ru_nc.png)
* **Готовое досье:** [`reports/competitors/ho_me_so_com_ru_nc_report.md`](file:///Users/donnyduck/Projects/Antigravity_folders/Infrastructure/reports/competitors/ho_me_so_com_ru_nc_report.md)

---

## 3. Исследование сайта toxifillers.com и выявление Hero-продукта

### Анализ сайта
* **Сайт:** [toxifillers.com](https://toxifillers.com)
* **Позиционирование:** Профессиональный заказ эстетических препаратов для клиник и практикующих специалистов (Order Desk).
* **Ключевые УТП сервиса:**
  1. Подлинность препаратов и прямые поставки из Южной Кореи.
  2. Консолидированный заказ (разные бренды и категории в один инвойс).
  3. Строгий температурный контроль холодовой цепи (Cold Chain 2–8°C).
* **Ассортимент:** 126 позиций в каталоге (Toxins, Dermal Fillers, PDRN & Skin Boosters, Collagen Stimulators, Lipolytics).

### Обоснование выбора флагмана: INNOTOX 100U / 50U (Medytox)
* **Уникальность:** Первый и единственный в мире готовый жидкий ботулотоксин (не требует разведения физраствором NaCl, исключает ошибки дозирования персоналом).
* **Фактура на сайте:** Вынесен на первый экран в демо-ордер (`$77.00`, SKU: `TF-TOX-INNOTOX-100U`), на сайте ему посвящены отдельные клинические гайды («Innotox 50U vs 100U: Choosing the Right Pack for Your Clinic»).
* **Коммерческий потенциал:** Самый высокий объем поискового спроса среди врачей и клиник. Вторым по объему идет **Botulax 100U/200U** ($61/$87), а в филлерах — **Neuramis Deep** ($32).

### Кластеризация поисковых запросов (Search Intent)
1. **Транзакционные запросы клиник (High-Intent B2B):**
   * `innotox 100u buy online` / `купить innotox 100u оптом`
   * `innotox wholesale supplier` / `иннотокс цена для косметологов`
   * `botulax 100u / 200u купить оригинальный`
   * `купить корейские филлеры neuramis deep оптом`
2. **Сравнительные запросы (Mid-Funnel):**
   * `innotox 50u vs 100u разница`
   * `иннотокс нужно ли разводить физраствором` *(конверсионная точка входа)*
   * `innotox vs botox сравнение диффузии и безопасности`
   * `как проверить оригинальность innotox партия срок годности`
   * `температурный режим доставки ботулотоксинов холодовая цепь`

---

## 4. Созданный конверсионный моно-лендинг под Innotox 100U & 50U

* **Файл лендинга:** [`reports/innotox_landing/index.html`](file:///Users/donnyduck/Projects/Antigravity_folders/Infrastructure/reports/innotox_landing/index.html)
* **Скриншот-превью:** [`reports/innotox_landing/preview.png`](file:///Users/donnyduck/Projects/Antigravity_folders/Infrastructure/reports/innotox_landing/preview.png)

### Структура страницы:
1. **Header:** Логотип Toxifillers Order Desk, навигация по якорям, прямая кнопка связи с персональным менеджером.
2. **Hero (Первый экран):**
   * Оффер: *«Оригинальный Innotox 100U & 50U для клиник и практикующих врачей»*.
   * Буллеты доверия: 100% жидкая фаза без NaCl, контроль холодовой цепи 2–8°C, официальный инвойс на юридическое лицо.
   * Виджет быстрого выбора дозировки (100U — $77 / 50U — $48) с динамической сменой цены и артикула SKU.
3. **Клинические и операционные преимущества:**
   * Устранение риска человеческого фактора при разведении.
   * Отсутствие человеческого сывороточного альбумина (HSA) и аллергенов.
   * Точечная фиксация и минимальная диффузия в смежные мышечные волокна.
4. **Сравнительная таблица:**
   * Детальное сопоставление Innotox с традиционными порошковыми токсинами (Botox, Botulax).
5. **Интерактивный B2B-калькулятор объема и маржинальности:**
   * Ползунок выбора количества флаконов (1–50 шт.).
   * Автоматический расчет оптовой скидки тиража (5%, 10%, 15%), себестоимости одного флакона и итоговой суммы инвойса с кнопкой запроса спецификации.
6. **FAQ:** Ответы на вопросы о температурных датчиках в термоконтейнерах, проверке голограмм Medytox, стабильности вскрытого флакона до 72 часов и сборных заказах с филлерами.

---

## 5. План внедрения (п.1 Матрица посадочных + п.2 Доменная архитектура)

### п.1. Матрица посадочных: почему 4 лендинга, а не 126
* **Отказ от 126 лендингов:** создание посадочных под каждый товар приводит к каннибализации поискового трафика, распылению рекламных бюджетов и путанице закупщиков.
* **Матрица из 4 фокусных страниц:**
  1. `Innotox 100U/50U` — флагманский локомотив (главный крючок для привлечения новых клиник).
  2. `Botulax 100U/200U` — эконом-объем для потоковых клиник с большими расходами препарата.
  3. `Rejuran (Healer / Tone-Up / Black)` — премиальная регенеративная эстетика и PDRN с высоким чеком.
  4. `Order Desk (Консолидация)` — посадочная сервиса единой сборной закупки со скидкой до 20%.

### п.2. Размещение на домене
* **Рекомендованный формат:** Вложенные директории основного домена (`Subfolders`):
  * `toxifillers.com/innotox/` (или `toxifillers.com/en/innotox/`)
  * `toxifillers.com/botulax/`
  * `toxifillers.com/rejuran/`
  * `toxifillers.com/order-desk/`
* **Преимущества:**
  * Аккумулирование 100% SEO-авторитета на основном домене `toxifillers.com`.
  * Быстрая индексация поисковыми роботами и нейросетями (ChatGPT, Perplexity).
  * Высокое доверие B2B-клиентов к основному домену при оплате инвойсов.

---

## 6. Атомарное описание стратегии малобюджетного трафика для консультанта (п.3)

Стратегия сформирована в виде **5 независимых модулей**.

```
                           [TOXIFILLERS GROWTH ENGINE]
                                        │
     ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
     ▼                  ▼                               ▼                  ▼
1. LinkedIn B2B    2. Машинка видео              3. GEO / AI SEO     4. Партнерства
   Outreach           (Reels/Shorts)                (ChatGPT/Perpl)     со школами
     │                  │                               │                  │
     └──────────────────┼───────────────────────────────┴──────────────────┘
                        ▼
            [Моно-лендинг Innotox]
                        │
                        ▼
      [Toxifillers Order Desk: Допродажа корзины]
```

### Модуль 1. LinkedIn B2B Outreach (Прямой выход на закупщиков)
* **Гипотеза:** Владельцы клиник и главврачи за рубежом открыты к оптимизации костов на 20–35%, если им гарантируют оригинальность корейских батчей и холодовую цепь 2–8°C.
* **Целевая аудитория (ICP):** Medical Directors, Clinic Owners, Aesthetic Practitioners, Procurement Managers (Европа, ОАЭ, ЛАТАМ, СНГ).
* **Стек:** LinkedIn Sales Navigator, Waalaxy / Expandi / PhantomBuster.
* **Механика:**
  1. Экспертная упаковка профиля представителя Toxifillers.
  2. Автосбор базы (500–1000 целевых контактов в месяц).
  3. Мягкое двухшаговое касание: коннект $\rightarrow$ лаконичный вопрос: *«Доктор [Имя], поставляем оригинальный Innotox и Botulax напрямую из Сеула с контролем 2–8°C. Отправить вам свежий B2B-прайс для сравнения с вашими текущими дистрибьюторами?»*.
* **KPI:** Acceptance Rate $\ge 25\%$; Reply Rate $\ge 15\%$; генерация 50–80 квалифицированных B2B-лидов в месяц.

### Модуль 2. Машинка экспертного видеоконтента (Reels / Shorts / TikTok)
* **Гипотеза:** Алгоритмы коротких видео бесплатно находят косметологов, если контент бьет в их профессиональные страхи (подделки, осложнения, холодовая цепь).
* **Форматы роликов:**
  1. *Анти-фейк:* «Как отличить оригинальный Innotox от подделки за 15 секунд» (показ голограмм, микрошрифтов и батч-кода).
  2. *Клиническая физика:* «Почему жидкая форма Innotox снижает риск диффузии и птоза».
  3. *Краш-тест доставки:* «Вскрытие медицинского термобокса с температурным логгером после 48 часов перелета».
* **Конверсионный мостик:** Ссылка в Bio ведет на `toxifillers.com/innotox/` с лид-магнитом: *«Чек-лист проверки корейских батчей 2026 + оптовая спецификация»*.
* **KPI:** 30 000 – 70 000 целевых просмотров в месяц; 500–1200 переходов на моно-лендинг без затрат на рекламу.

### Модуль 3. GEO / AI SEO (Оптимизация под выдачу в ChatGPT, Perplexity, Claude)
* **Гипотеза:** Закупщики клиник нового поколения ищут поставщиков через запросы к LLM: *«Where to buy authentic Innotox 100U wholesale with cold chain shipping?»*.
* **Механика:**
  1. Создание страницы `toxifillers.com/for-llm` со структурированной текстовой фактурой: бренды (Medytox, Hugel, PharmaResearch), SKU, температурные режимы, условия оплаты, страны экспорта.
  2. Внедрение микроразметки Schema.org (`MedicalOrganization`, `WholesaleStore`, `Product`).
  3. Размещение профилей и карточек компании на внешних ресурсах, которые цитируют нейросети (Trustpilot, Reddit в сабреддитах r/AestheticMedicine и r/DIYcosmetics, профильные медицинские каталоги).
* **KPI:** Попадание Toxifillers в топ-3 рекомендаций ChatGPT и Perplexity по целевым англоязычным промптам оптовой закупки.

### Модуль 4. Партнерский триггер со школами инъекций и тренерами
* **Гипотеза:** Начинающие косметологи после курсов контурной пластики не имеют проверенных поставщиков и закупают препараты там, где рекомендует преподаватель.
* **Целевые партнеры:** Частные школы контурной пластики, тренеры по ботулинотерапии (онлайн и оффлайн).
* **Оффер:** Именной промокод для учеников со скидкой 5% на первый заказ; тренеру — реферальный кэшбек (3–5% с оборота) либо закрытая льготная цена на препараты для личной практики.
* **KPI:** 3–5 активных школ-партнеров $\rightarrow$ регулярный приток 20–40 новых практикующих клиентов ежемесячно.

### Модуль 5. Точечный парсинг клиник (Google Maps) + Tripwire-рассылка
* **Гипотеза:** Холодное предложение тестовой партии от 1–3 флаконов по оптовой цене снимает барьер недоверия к новому поставщику.
* **Механика:** Автосбор контактов клиник через Google Maps в целевых странах $\rightarrow$ точечный оффер:  
  *«Коллеги, добрый день. Поставляем Innotox 100U ($77) и Botulax ($61) напрямую из Кореи. Предлагаем заказать тестовую партию от 2 флаконов по оптовой цене, чтобы проверить скорость доставки и убедиться в оригинальности батча перед крупным заказом. Спецификация: toxifillers.com/innotox/»*.
* **KPI:** Открытие диалога: 8–12%; конверсия в тестовый заказ: 2–4%.

---

## 7. Файловый индекс проекта (Полная матрица 5 лендингов + AI SEO + Outreach)

| Назначение | Путь к файлу |
| :--- | :--- |
| **Сводная стратегия и скрипт беседы** | [`TOXIFILLERS_STRATEGY_SUMMARY.md`](file:///Users/donnyduck/Projects/caesthetic/TOXIFILLERS_STRATEGY_SUMMARY.md) |
| **Скрипт автоматизации шпионажа (Playwright + DeepSeek)** | [`docs/toxifillers/src/spy_landing.py`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/src/spy_landing.py) |
| **1. Моно-лендинг Innotox 100U & 50U (HTML + Preview)** | [`docs/toxifillers/reports/innotox_landing/index.html`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/innotox_landing/index.html) · [Превью](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/innotox_landing/preview.png) |
| **2. Моно-лендинг Botulax 100U & 200U (HTML + Preview)** | [`docs/toxifillers/reports/botulax_landing/index.html`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/botulax_landing/index.html) · [Превью](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/botulax_landing/preview.png) |
| **3. Моно-лендинг Neuramis Deep Lido (HTML + Preview)** | [`docs/toxifillers/reports/neuramis_landing/index.html`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/neuramis_landing/index.html) · [Превью](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/neuramis_landing/preview.png) |
| **4. Моно-лендинг Rejuran c-PDRN (HTML + Preview)** | [`docs/toxifillers/reports/rejuran_landing/index.html`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/rejuran_landing/index.html) · [Превью](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/rejuran_landing/preview.png) |
| **5. Сервисный лендинг Toxifillers Order Desk (HTML + Preview)** | [`docs/toxifillers/reports/order_desk_landing/index.html`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/order_desk_landing/index.html) · [Превью](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/order_desk_landing/preview.png) |
| **GEO / AI SEO: Машиночитаемая фактура для LLM** | [`docs/toxifillers/reports/ai_seo/for-llm.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/ai_seo/for-llm.md) · [HTML](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/ai_seo/for-llm.html) |
| **GEO / AI SEO: Микроразметка Schema.org JSON-LD** | [`docs/toxifillers/reports/ai_seo/schema_org.json`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/ai_seo/schema_org.json) |
| **GEO / AI SEO: Стандарт llms.txt для AI-агентов** | [`docs/toxifillers/reports/ai_seo/llms.txt`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/ai_seo/llms.txt) |
| **GEO / AI SEO: Стратегия цитирований (Reddit/Trustpilot)** | [`docs/toxifillers/reports/ai_seo/citations_plan.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/ai_seo/citations_plan.md) |
| **Outreach: Плейбук LinkedIn B2B** | [`docs/toxifillers/reports/outreach/linkedin_playbook.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/outreach/linkedin_playbook.md) |
| **Outreach: Партнерская программа для школ и тренеров** | [`docs/toxifillers/reports/outreach/trainers_partnership.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/outreach/trainers_partnership.md) |
| **Outreach: Google Maps + Tripwire плейбук** | [`docs/toxifillers/reports/outreach/maps_tripwire_playbook.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/outreach/maps_tripwire_playbook.md) |
| **Досье конкурента HoMEso** | [`docs/toxifillers/reports/competitors/ho_me_so_com_ru_nc_report.md`](file:///Users/donnyduck/Projects/caesthetic/docs/toxifillers/reports/competitors/ho_me_so_com_ru_nc_report.md) |
