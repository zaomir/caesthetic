# ТЗ — BALAM Dental Stage 0 public landing

**Дата:** 2026-08-13  
**Статус:** canonical implementation brief / HOLD до Atabek commercial GO + evidence gate  
**Проект:** BALAM Dental inside Expert Dental Studio  
**Домен:** `balamdental.com`  
**Runtime до отделения:** healthcare / `raimovdental` contour; отдельный runtime `balam` пока не создавать  
**Связанные:** `DEC-817`, `RAIMOV_BALAM_STAGE0.md`, `BALAM.md`, counsel clearance 2026-08-13

## 0. Цель

Сделать **одностраничный mobile-first patient landing**, который начинает приносить обращения под брендом BALAM уже в существующую лицензированную инфраструктуру Expert Dental Studio и одновременно создаёт отдельно измеримую BALAM-когорту.

Это **не сайт новой отдельной клиники**. На Stage 0 медицинский исполнитель — Expert Dental Studio.

Главная пользовательская задача:

`родитель понял → доверился → увидел Чолпон/подход → понял первый визит → записался`

Главная бизнес-задача:

`BALAM lead → Expert booking/clinical flow → BALAM cohort → revenue + household/ortho evidence`.

## 1. Release gates

### До начала public implementation подтвердить

1. Atabek commercial/operational GO на BALAM как детское направление Expert Dental.
2. Точное юридическое наименование Expert Dental licensee.
3. Копию лицензии + приложения: адрес и фактически разрешённые виды помощи.
4. Номер/дату лицензии для disclosure.
5. Qualification/credential scope Чолпон и допустимый public title.
6. Какие детские услуги можно фактически заявить на Stage 0.
7. Existing Expert booking/WhatsApp phone and owner of responses.

Если любой пункт отсутствует, соответствующий claim/CTA **fail closed**; ничего не придумывать.

### Не является launch gate

- отдельное юрлицо BALAM;
- отдельное помещение;
- Gate 1.3A новой клиники;
- собственная касса BALAM;
- отдельная медицинская лицензия BALAM.

Они относятся к будущему отделению, не Stage 0.

## 2. Naming / legal model

### Header / hero brand

**BALAM Dental**

Canonical descriptor:

**`Детское направление Expert Dental Studio`**

### Запрещённые Stage 0 формулировки

Не писать:

- `новая клиника BALAM`;
- `клиника BALAM открылась`;
- `сеть BALAM`;
- отдельный юридический адрес/лицензия, которых нет;
- `главный врач BALAM` про Чолпон без подтверждения;
- любые services/claims шире licence + credentials.

### Mandatory disclosure

Footer и legal/info block:

`Медицинские услуги оказывает [EXACT LEGAL NAME] на основании лицензии №[EXACT] от [EXACT DATE].`

Также показать существующий адрес Expert Dental и контакты из подтверждённого SSOT/config.

Production build должен падать/не публиковать legal disclosure, если конфиг содержит placeholder `[EXACT]` / пустые значения.

## 3. Информационная архитектура — одна страница

Никакого service-page веера в первой версии.

### Section 1 — Hero

Цель: за 5 секунд объяснить бренд и снять тревогу родителя.

Контент:

- horizontal BALAM logo;
- descriptor `Детское направление Expert Dental Studio`;
- H1: **`Здесь детям спокойно.`**;
- короткая подводка: спокойный, понятный детский приём в существующей клинической команде Expert Dental;
- primary CTA: `Записаться на приём`;
- secondary CTA: `Познакомиться с врачом` → anchor Чолпон.

CTA не должен создавать отдельную «BALAM medical contract» механику: он ведёт в существующий Expert booking/WhatsApp flow с attribution `brand=BALAM`.

### Section 2 — Родителю понятно, что будет

3–4 коротких принципа:

- сначала знакомство и адаптация;
- объясняем родителю следующий шаг;
- не создаём лишней тревоги;
- лечение/профилактика только по медицинским показаниям.

Не обещать `без боли`, `без страха`, `100% спокойно` и другие абсолютные medical/experience claims.

### Section 3 — Чолпон

Крупная карточка врача.

Использовать только clinic/evidence-confirmed:

- имя;
- допустимую должность/специализацию;
- реальное фото с rights;
- короткую человеческую цитату/подход после согласования.

Не копировать старый рекламный текст про «талант», «определит диагноз сразу» и т.п. без medical/editorial review.

### Section 4 — Когда обращаться

Не делать огромный catalog. Показать 4–6 **только подтверждённых** задач/поводов обращения, сформированных из licence/credential-approved Stage 0 service registry.

Примеры структуры, не готовые claims:

- профилактический осмотр;
- кариес/лечение молочных зубов;
- гигиена/профилактика;
- консультация по развитию прикуса / маршрутизация к ортодонту.

Каждый пункт попадает в production только после verification.

### Section 5 — Первый визит

Простой сценарий:

`пришли → познакомились → осмотр → объяснили родителю → согласовали следующий шаг → записали следующий визит при необходимости`

Это один из главных conversion blocks.

### Section 6 — Почему BALAM связан с сильной взрослой стоматологией

Не продавать экосистемную стратегию пациенту в терминах feeder/LTV.

Patient-facing смысл:

- ребёнок может наблюдаться в одном понятном маршруте;
- при необходимости доступна ортодонтическая экспертиза Expert Dental;
- семье не нужно самостоятельно искать следующий уровень специалиста.

### Section 7 — Где принимаем

Stage 0 использует существующий лицензированный адрес Expert Dental.

Показать:

- адрес;
- часы Stage 0 только после подтверждения;
- телефон/WhatsApp;
- карта/навигация только с реальными данными;
- подпись `BALAM Dental — детское направление Expert Dental Studio`.

### Section 8 — Финальный CTA

H2 уровня:

**`Первый шаг — просто познакомиться.`**

CTA: `Записаться на детский приём`.

Рядом коротко: запись обрабатывает команда Expert Dental; юридические/медицинские документы оформляются действующим исполнителем медицинских услуг.

### Section 9 — Footer / legal

- BALAM brand;
- Expert Dental legal disclosure;
- licence number/date;
- фактический адрес;
- privacy/consent links при наличии форм/analytics;
- никаких фиктивных copyright entity `BALAM LLC`.

## 4. CTA / WhatsApp / booking

Использовать существующий clinic channel, не создавать новый неуправляемый номер.

### Attribution

BALAM CTA должен передавать/фиксировать:

- `brand=BALAM`;
- landing version;
- source;
- UTM allowlist;
- campaign.

Не передавать диагноз, имя ребёнка или другие medical/PII в URL/UTM.

### WhatsApp deeplink

Prefill допускается нейтральный:

`Здравствуйте! Хочу записать ребёнка на приём в BALAM Dental.`

Не включать medical condition в deeplink.

## 5. CRM / cohort contract

До paid traffic обязательна отдельная BALAM attribution.

Минимальные operational fields/events:

- brand `BALAM`;
- source / campaign;
- booking requested;
- booking confirmed;
- show/visited;
- clinician;
- paid revenue;
- next visit booked;
- recall;
- ortho handoff;
- sibling/parent conversion;
- household_id в разрешённом data perimeter;
- revenue 30/60/90.

Marketing analytics не хранит диагнозы/medical record.

## 6. Visual system

Источник истины: `docs/ssot/BALAM.md`.

### Canon

- navy `#1D2E4E`;
- mint `#82B7A8`;
- cream `#FCF9F4`;
- основной horizontal logo;
- rounded geometric typography;
- много воздуха;
- tactile/warm/medical.

### Anti-slop

Запрещено:

- cartoon tooth mascot;
- радужная детсадовская палитра;
- fake 3D blobs/AI gradients как основной дизайн;
- «волшебная страна зубиков»;
- сюсюканье;
- stock/AI дети вместо реальных assets с rights;
- luxury aesthetic-dentistry visual language.

### Фото

Приоритет:

1. реальная Чолпон;
2. реальный детский кабинет/клиника;
3. реальные врач+ребёнок/родитель только с достаточными rights/consent.

Если assets не готовы — использовать чистую типографику/brand geometry, а не генерировать фиктивные clinical scenes.

## 7. Mobile-first UX

Primary target: mobile / Instagram traffic.

Требования:

- hero + CTA читаются без скролла на типичном 390px viewport;
- sticky CTA допустим после первого экрана;
- tap targets ≥44px;
- без горизонтального overflow 360/390/430;
- основные CTA не прячутся в hamburger-only path;
- WhatsApp открывается корректно во встроенном Instagram browser;
- page load не зависит от тяжёлого JS framework ради одной страницы.

## 8. Performance / accessibility

- static-first;
- semantic headings;
- `lang=ru`;
- keyboard focus states;
- alt text на meaningful images;
- contrast AA;
- responsive images / webp/avif when practical;
- no CLS from unsized media;
- target Lighthouse mobile performance ≥90 where environment permits;
- no autoplay audio/video in v1.

## 9. SEO / indexation

### Preview

До release GO: `noindex,nofollow`, отсутствует в sitemap.

### Public Stage 0

После release GO:

- indexable;
- canonical `https://balamdental.com/`;
- one RU page initially;
- title/description factual, without unsupported superlatives;
- Organization/MedicalBusiness schema only with exact Expert/BALAM relationship represented correctly;
- no fake reviewAggregate;
- no unverified service schema.

Local `.kg/.kz/.uz` domains не покупать до Atabek GO.

## 10. Instagram → landing consistency

Instagram bio, pinned posts, signage and landing must use the same formula:

`BALAM Dental`  
`Детское направление Expert Dental Studio`

No split reality where Instagram looks like a separate licensed clinic while the website discloses Expert only in tiny footer.

## 11. Offline signage consistency

Website implementation must provide downloadable/export-ready brand references for offline vendor, but production print files are a separate design task.

Required wording matrix:

- facade big: `BALAM Dental`;
- facade/secondary: `детское направление Expert Dental Studio`;
- entrance legal plaque: confirmed Expert legal entity/provider + operating info;
- QR: `balamdental.com` after public activation.

## 12. Maps / directories

Do not create listings automatically from the website deploy.

Stage 0 listing is a separate ops action after:

- physical BALAM signage is installed;
- naming/disclosure is consistent;
- actual patient-facing operation exists;
- phone/address/hours are confirmed.

No duplicate/fake clinic entity solely for SEO.

## 13. Pricing

`site-raimovdental/src/config/pricing.ts` is protected.

V1 landing may omit prices entirely.

If founder later requests prices:

- only confirmed clinic prices;
- source from canonical pricing SSOT/config;
- no invented discount / `from` values;
- no edit to protected pricing without clinic confirmation.

## 14. Analytics

At minimum:

- page_view;
- hero_cta;
- doctor_anchor;
- booking_cta;
- whatsapp_open;
- phone_click;
- directions_click.

Attach allowlisted UTM/source, no PII.

Success is not clicks alone. Join to CRM cohort metrics where permitted.

## 15. Release / runtime architecture

### Pre-GO

Current presentation remains:

`https://raimovdental.com/ru/balam/` — protected/noindex Atabek decision artifact.

Do **not** repurpose this URL as patient landing.

### Stage 0 public implementation

Recommended repo root before separation:

`site-raimovdental/balam-stage0/`

Public domain:

`https://balamdental.com/`

Stage 0 still belongs to the `raimovdental` healthcare runtime/deploy governance. Do not create runtime id `balam` / `site-balam/` until separate-clinic architecture DEC.

Deploy through approved RAIMOV/Agent API bridge; no manual untracked VDS edits.

## 16. Tests / guards

Required automated checks:

1. page is one-page and builds deterministically;
2. no placeholder legal values in public build;
3. Stage 0 descriptor `детское направление Expert Dental Studio` present;
4. no banned `отдельная клиника/opened/new clinic/network` claims;
5. no unverified prices;
6. no patient PII in query strings;
7. CTA has `brand=BALAM` attribution;
8. mobile 360/390/430 no X overflow;
9. links/WhatsApp valid;
10. public build canonical = balamdental.com;
11. preview `/ru/balam/` stays protected/noindex and unchanged;
12. production smoke HTTP 200 + hero + legal disclosure + CTA.

## 17. DoD

Stage 0 landing is complete only when:

- Atabek GO recorded;
- licence/address/service scope evidence attached;
- Cholpon public credential/title confirmed;
- legal disclosure contains exact values;
- site is built and tested mobile-first;
- CRM attribution is live before paid traffic;
- `balamdental.com` DNS/deploy is intentional and recorded;
- production smoke passes;
- no change makes BALAM look like a separate medical licensee;
- deployed SHA and live URL are recorded in release evidence.
