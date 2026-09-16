---
owner: CAESTHETIC
status: active
version: 1.0.0
created: 2026-09-16
updated: 2026-09-16
contract: connect4-client-sandbox/1.0.0
public_program_name: Connect4
product_name: Connect4 Client Sandbox
internal_aliases:
  - C4CS
  - Connect4 Sandbox
  - Connect4 тестовая экосистема
  - Connect4 песочница клиента
canonical_repository: zaomir/grainee-v2
canonical_branch: main
canonical_path: docs/ssot/CAESTHETIC_CONNECT4_CLIENT_SANDBOX.md
parent: docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md
decision: docs/founder-notes/DEC-890_connect4-client-sandbox.md
related:
  - docs/ssot/CAESTHETIC_4444_CONSISTENCY_STANDARD.md
  - docs/ssot/CAESTHETIC_PRODUCTS_AND_SERVICES.md
  - docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md
  - docs/ssot/WEBSITE_STUDIO_STANDARD.md
  - docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/NO_HUMAN_APPROVAL_GATES.md
scope: >
  SSOT создания переносимой тестовой экосистемы Connect4 на домене CAESTHETIC
  (без доступа к кабинетам клиента) с быстрым переносом на сайт клиента
  через design-token pack и live-adapters карт/соцсетей/репутации.
---

# Connect4 Client Sandbox

<a id="c4cs-routing"></a>

## 0. Маршрут

**Connect4 Client Sandbox / C4CS / «тестовая экосистема Connect4» / «песочница Connect4 для клиента» → этот документ на актуальном `zaomir/grainee-v2/main`.**

| Задача | Раздел |
|---|---|
| Имя, цель, границы | [§1](#c4cs-definition) |
| Архитектура страниц и CTA | [§2](#c4cs-ia) |
| Реестр НЧ-фраз и подсветка | [§3](#c4cs-phrases) |
| Mock-плоскости Maps / Social / Reputation | [§4](#c4cs-mocks) |
| Design Token Pack клиента | [§5](#c4cs-tokens) |
| Live Adapters и перенос на сайт клиента | [§6](#c4cs-transfer) |
| Манифест инстанса + путь runtime | [§7](#c4cs-manifest) |
| Compliance и запреты | [§8](#c4cs-compliance) |
| Пилот Royal Petrol | [§9](#c4cs-royal-petrol) |
| DoD создания инстанса | [§10](#c4cs-dod) |

Authority: master `CAESTHETIC.md` (продукт/цены) → `CAESTHETIC_CONNECT4_CONCEPT.md` (определение Connect4) → `CAESTHETIC_4444_CONSISTENCY_STANDARD.md` (метод 10 фраз) → **этот SSOT** (как собрать demo-экосистему и перенести её). Не заменяет Growth Score SOP и не создаёт новый headline-SKU.

Этот документ — **канон создания**. Публикация конкретного инстанса (`/connect4/sandbox/<slug>/`) — отдельная runtime-задача по Website Studio + Impeccable.

---

<a id="c4cs-definition"></a>

## 1. Определение и границы

**Connect4 Client Sandbox** — переносимая тестовая экосистема четырёх публичных плоскостей Connect4, размещённая сначала на `caesthetic.com`, которая показывает клиенту **полную модель работы без доступов** к их сайту-админке, Google Business Profile / картам, Instagram и репутационным кабинетам.

| Это | Это не |
|---|---|
| Клиентский walkthrough: сайт → каталог → фокус-локация → Maps / Social / Reputation | Боевой SEO-сайт клиента |
| Демо *соответствия* языка спроса на одной фокус-локации | Обещание позиций, рейтинга, трафика или выручки |
| Носитель Design Token Pack + Surface Adapters для быстрого переноса | Отдельный продукт с новой публичной ценой |
| Доказательство метода перед Sprint / доступом | Замена Free Growth Score или Lead-to-Revenue Check |

**Публичное имя программы** остаётся **Connect4**. Имя артефакта — **Connect4 Client Sandbox**. В клиентских текстах допустимо: «тестовая экосистема Connect4», «демо четырёх плоскостей».

**Без доступов клиента** все поверхности, кроме публично видимых скриншотов, — **mock на нашем домене**. После согласия и доступов те же страницы переключаются на live-URL карт/соцсетей/репутации и/или выкладываются на домен клиента с его токенами.

---

<a id="c4cs-ia"></a>

## 2. Информационная архитектура (обязательный минимум)

Каждый инстанс = одна сеть/бренд + **одна фокус-локация**. Остальные точки в каталоге могут быть списком без отдельных карточек.

```text
/connect4/sandbox/<client-slug>/
├── index.html                 # Home (клон главной клиента по токенам/контенту)
├── locations/index.html       # Каталог локаций сети
├── locations/<focus-id>/      # Карточка фокус-локации (контент + НЧ-фразы)
├── surfaces/maps/             # Mock Google Maps / GBP карточки
├── surfaces/instagram/        # Mock Instagram (скрин + пост/коммент/ответ)
└── surfaces/reputation/       # Mock локального репутационного ресурса
```

### 2.1 Home

- Визуально и по смыслу повторяет **главную страницу клиента** (структура + Design Token Pack, §5).
- **Ровно одна целевая кнопка (primary CTA):** «Каталог локаций» → `/locations/`.
- Допустимы декоративные/информационные блоки без конкурирующих CTA на другие поверхности.

### 2.2 Каталог локаций

- Перечень точек сети (для Royal Petrol — полный публичный список / ~97).
- **Одна целевая CTA / выделенный фокус:** переход на карточку фокус-локации.
- Остальные строки — visible list (disabled, anchor-only или «скоро») без увода с демо-пути.

### 2.3 Карточка фокус-локации

Обязательный контент:

1. Достоинства **этой** локации.
2. Достоинства **бренда/сети** целиком.
3. Что входит в экосистему бренда **кроме** основной услуги фокус-точки (отель, мойка, кафе, зарядка и т.д. — только проверяемые факты).
4. Блок **«Ключевые фразы этой страницы»** с визуальной подсветкой НЧ-фраз (§3), чтобы клиент понял цель страницы.

**Три целевые кнопки (и только они как surface-CTA):**

| CTA | Ведёт на | Режим без доступа |
|---|---|---|
| Карты | `/surfaces/maps/` | mock карточки Maps/GBP |
| Instagram | `/surfaces/instagram/` | mock ленты/поста |
| Репутация | `/surfaces/reputation/` | mock локального ресурса |

На фокус-странице не размещать четвёртую primary CTA «купить рекламу». Paid Ads остаётся Demand Layer и объясняется отдельно, если клиент спрашивал про рекламу.

---

<a id="c4cs-phrases"></a>

## 3. Реестр фраз и подсветка

Источник метода: `CAESTHETIC_4444_CONSISTENCY_STANDARD.md` (ровно до 10 фраз `K01`–`K10`).

В Sandbox:

1. Фиксируется **Phrase Registry** инстанса (JSON/YAML в манифесте §7).
2. На карточке локации и на всех трёх mock-поверхностях используются **одни и те же** выбранные НЧ-фразы (подмножество или полный набор).
3. UI обязан уметь **подсветить** фразы (mark/chip/legend), чтобы клиент видел *соответствие*, а не «просто текст».
4. Статус каждой фразы: `verified_query` | `candidate_query` (частотность не выдумывать).

Подсветка — педагогический слой демо. После переноса на сайт клиента pedagogy-слой (`data-c4-phrase`, легенда) можно отключить флагом `ui.phrase_highlight = false`, сами формулировки остаются.

---

<a id="c4cs-mocks"></a>

## 4. Mock-плоскости (без доступов)

### 4.1 Maps (`surfaces/maps/`)

Показать, как выглядит карточка фокус-локации в Google Maps / GBP:

- скрин или верный layout-mock карточки;
- описание с НЧ-фразами;
- **демо-отзыв** с фразой (помечен как *иллюстрация языка*, не реальный отзыв клиента);
- **ответ бренда** с НЧ-фразами.

Live-режим (§6): кнопка «Карты» открывает реальный Place URL / GBP.

### 4.2 Instagram (`surfaces/instagram/`)

Без доступа к их Instagram:

- скриншот реального публичного аккаунта (если есть) или нейтральный chrome-mock;
- **пост** с НЧ-фразой;
- **комментарий** с НЧ-фразой;
- **ответ от имени бренда** с НЧ-фразами.

Live-режим: deep-link на реальный пост/профиль.

### 4.3 Reputation (`surfaces/reputation/`)

Отдельная плоскость Reviews & Reputation, не дублирующая Google-отзыв из §4.1 как единственный носитель.

На странице mock:

- карточка компании бренда на выбранном локальном ресурсе;
- **статья / материал про фокус-локацию** с НЧ-фразами.

#### Выбор локального репутационного ресурса

Порядок выбора (зафиксировать в манифесте инстанса):

1. Доминирующая **локальная** площадка отзывов/справочника рынка (не только Google).
2. Возможность карточки компании + длинного текста (статья/новость/обзор).
3. Публичная индексируемость и привычность для ICP клиента.
4. Юридическая/ToS допустимость демо-карточки на нашем домене (mock) vs живой публикации.

**Для Казахстана (пилот АЗС) рекомендуемый primary:** **2ГИС** — карточка организации + текстовый материал о филиале.  
**Alternate:** отдельная статья на нашем sandbox (если площадка не даёт статью) с явной меткой «пример размещения на локальном репутационном ресурсе»; кандидаты на live позже — 2ГИС, профильные каталоги рынка, согласованный локальный медиа/форум.  
Не назначать Instagram или Google Reviews как единственный «репутационный ресурс» этой кнопки: они уже заняты Social и Maps.

---

<a id="c4cs-tokens"></a>

## 5. Design Token Pack (переносимость дизайна)

Каждый инстанс обязан иметь файл токенов, снятый с **исходного сайта клиента** (публичные CSS/computed styles + бренд-гайд, если есть).

Путь (канон):

```text
site-caesthetic/connect4/sandbox/<client-slug>/tokens/
  tokens.css          # CSS variables only
  client-tokens.json         # machine-readable mirror
  source.json                # URL съёма, дата, метод, ограничения
```

Минимальный набор переменных:

| Группа | Примеры |
|---|---|
| Color | `--c4cs-bg`, `--c4cs-surface`, `--c4cs-text`, `--c4cs-muted`, `--c4cs-primary`, `--c4cs-accent`, `--c4cs-border` |
| Type | `--c4cs-font-display`, `--c4cs-font-body`, размеры H1/H2/body |
| Shape | `--c4cs-radius`, `--c4cs-space-*` |
| Chrome | header/footer высоты, max-width |

Правила:

- В sandbox-страницах **только** `var(--c4cs-*)` (и при необходимости ограниченный набор CAESTHETIC chrome для «это демо на caesthetic.com»).
- Не хардкодить hex клиента вне token-файла.
- При переносе на сайт клиента (§6) token-файл становится единственным источником визуала; CAESTHETIC chrome снимается (`host_chrome: false`).
- Website Studio + Impeccable обязательны для нового визуального инстанса; анти-паттерны Impeccable не отменяют токены клиента — клиентский бренд побеждает в sandbox-теле страниц.

---

<a id="c4cs-transfer"></a>

## 6. Live Adapters и перенос на сайт клиента

Sandbox проектируется как **два режима одного манифеста**, без переписывания IA.

### 6.1 Surface Adapters

```json
{
  "surfaces": {
    "maps": {
      "mode": "mock",
      "mock_path": "./surfaces/maps/",
      "live_url": null,
      "place_id": null
    },
    "instagram": {
      "mode": "mock",
      "mock_path": "./surfaces/instagram/",
      "live_profile_url": null,
      "live_post_url": null
    },
    "reputation": {
      "mode": "mock",
      "mock_path": "./surfaces/reputation/",
      "platform": "2gis",
      "live_url": null,
      "article_url": null
    }
  }
}
```

Переключение `mode: mock → live` меняет только target кнопок и, при необходимости, заменяет mock-страницы редирект/deep-link. Контент фокус-страницы и Phrase Registry сохраняются.

### 6.2 Transfer Pack (на сайт клиента)

Артефакты переноса:

1. HTML/CSS/JS страниц IA §2 (или генератор из манифеста).
2. `tokens.css` / `.json`.
3. Phrase Registry.
4. Surface Adapters с заполненными live URL.
5. `TRANSFER.md` инстанса: что куда встроить (home CTA, locations route, focus page).

Шаги переноса:

1. Подключить `tokens.css` на домене клиента.
2. Выложить маршруты `/locations/` и фокус-страницу (или эквивалент в CMS).
3. Выставить `surfaces.*.mode = live` и URL карт/IG/репутации.
4. Выключить pedagogy-подсветку при желании клиента.
5. Убрать host-chrome CAESTHETIC и демо-дисклеймеры «это песочница».

**Простое подключение** = правка манифеста adapters + токены; не отдельный redesign и не новый набор фраз без версии Phrase Registry.

### 6.3 Hosting modes

| Mode | Где живёт | Когда |
|---|---|---|
| `sandbox_host` | `caesthetic.com/connect4/sandbox/<slug>/` | Демо без доступов |
| `client_host` | домен клиента | После transfer |
| `hybrid` | сайт на клиенте, часть surface ещё mock | Промежуточный доступ |

---

<a id="c4cs-manifest"></a>

## 7. Манифест инстанса

Канонический файл:

```text
site-caesthetic/connect4/sandbox/<client-slug>/sandbox.manifest.json
```

Обязательные поля:

| Поле | Смысл |
|---|---|
| `contract` | `connect4-client-sandbox/1.0.0` |
| `client_slug` | kebab-case |
| `brand_name` | публичное имя |
| `market` | страна/город |
| `source_site_url` | URL главной клиента для съёма |
| `focus_location` | id, display name, address, internal code (напр. RP-37) |
| `locations_count` | число в каталоге |
| `locations[]` | минимум id + label + address; focus помечен |
| `phrase_registry` | K01… с статусами |
| `tokens_path` | путь к token pack |
| `surfaces` | adapters §6.1 |
| `reputation_platform` | выбранная площадка + rationale |
| `hosting_mode` | `sandbox_host` \| `hybrid` \| `client_host` |
| `ui.phrase_highlight` | bool |
| `compliance.demo_reviews_labelled` | must be true in sandbox |
| `created_at` / `updated_at` | ISO dates |

Документация инстанса (коротко): `docs/caesthetic/connect4-sandbox/<client-slug>/README.md` — ссылка на манифест, Phrase Registry, статус transfer.

Runtime root: **только** `site-caesthetic/` (см. `SITE_ROOT_INVENTORY.md`). Новый `site-*` не создавать.

---

<a id="c4cs-compliance"></a>

## 8. Compliance и запреты

Наследует Connect4 concept §5 и 4444 consistency standard:

| Разрешено в Sandbox | Запрещено |
|---|---|
| Показывать согласованные НЧ-фразы в описаниях, постах бренда, ответах бренда | Обещать позиции, рейтинг, заявки, выручку |
| Подсвечивать фразы для обучения клиента | Выдавать mock за уже внедрённый live-результат клиента |
| Демо-отзыв с явной меткой «иллюстрация» | Учить клиента **вшивать ключи в реальные отзывы посетителей** |
| Скрин публичного IG / карт | Публиковать секреты, доступы, неопубликованные PHI/PII |
| Честный список того, что есть у бренда | Выдуманные отели/услуги/рейтинги без источника |

**Прод-правило (обязательно писать в демо-футере фокус-страницы):**  
в боевой работе язык спроса — в материалах бренда и естественных ответах; отзыв посетителя описывает свой опыт своими словами; покупка/стимуляция/gating отзывов запрещены.

Sandbox не является public SKU и не меняет цены Sprint / Growth System.

DEC-875: в манифесте и процессе **нет** `founder_approved` / wait-for-OK гейтов на создание или transfer. Останавливают только отсутствующие секреты/доступы и safety/compliance.

---

<a id="c4cs-royal-petrol"></a>

## 9. Пилот-инстанс: Royal Petrol (KZ)

| Поле | Значение |
|---|---|
| `client_slug` | `royal-petrol` |
| Бренд | Royal Petrol |
| Рынок | Казахстан (каталог с фокусом Алматы) |
| Source site | `https://royal-petrol.kz/` |
| Фокус | **RP-37** — Алматы, пр. Райымбека, 227 (`focus_id`: `rp-37`) |
| Каталог | публичный список АЗС (~97, сверять с сайтом) |
| Dataset (внутр.) | `docs/datasets/ROYAL_PETROL_DATASET_V1.md` — справочно; цифры рейтингов переснимать |
| Reputation primary | 2ГИС |
| Hosting | сначала `sandbox_host` |

Маршруты пилота:

```text
https://caesthetic.com/connect4/sandbox/royal-petrol/
https://caesthetic.com/connect4/sandbox/royal-petrol/locations/
https://caesthetic.com/connect4/sandbox/royal-petrol/locations/rp-37/
https://caesthetic.com/connect4/sandbox/royal-petrol/surfaces/maps/
https://caesthetic.com/connect4/sandbox/royal-petrol/surfaces/instagram/
https://caesthetic.com/connect4/sandbox/royal-petrol/surfaces/reputation/
```

Пилот доказывает контракт `connect4-client-sandbox/1.0.0`. Успех пилота ≠ измеренный impact у Royal Petrol.

---

<a id="c4cs-dod"></a>

## 10. Definition of Done — новый инстанс

- [ ] Манифест §7 заполнен; `contract = connect4-client-sandbox/1.0.0`.
- [ ] Token pack снят с `source_site_url`; страницы используют только `var(--c4cs-*)`.
- [ ] Home → одна CTA → Locations → focus.
- [ ] Focus содержит бренд + локацию + экосистему + подсветку фраз + ровно три surface-CTA.
- [ ] Maps / Instagram / Reputation mock-страницы с общими фразами.
- [ ] Reputation platform выбран с rationale; для KZ default = 2ГИС.
- [ ] Демо-отзывы помечены; футер с prod-правилом §8.
- [ ] Adapters поддерживают `mock|live`; transfer pack описан.
- [ ] Website Studio + Impeccable для визуала; docs/guards по зоне.
- [ ] Runtime: commit → main → deploy `caesthetic` → prod curl sandbox URL.
- [ ] `docs/caesthetic/connect4-sandbox/<slug>/README.md` + запись в CONTEXT_HANDOFF.

---

## 11. Версии

| Версия | Дата | Изменение |
|---|---|---|
| 1.0.0 | 2026-09-16 | Первый канон Connect4 Client Sandbox: IA, фразы, mocks, token pack, live adapters, transfer, пилот Royal Petrol RP-37 (DEC-890). |
