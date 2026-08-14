---
owner: Founder + Marketing
status: active
type: ssot
created: 2026-07-15
last_updated: 2026-07-15
applies_to: caesthetic, high-ticket aesthetic acquisition, paid-patient partnerships
links_to:
  - docs/ssot/CAESTHETIC.md
  - docs/founder-notes/DEC-CAESTHETIC-DEPOSIT-AS-ACQUISITION-FEE-20260714.md
---

# CAESTHETIC TRANSFORMATION NETWORK — SSOT

## 0. Решение

CAESTHETIC развивает отдельный high-ticket acquisition-контур для дорогих плановых изменений внешности.

Рабочее название категории:

> **CAESTHETIC Transformation Network**

Это не маркетинговое агентство для клиник, не продажа лидов и не замена действующих подрядчиков клиента.

CAESTHETIC создаёт дополнительный канал привлечения новых пациентов. Клиника платит только за подтверждённое коммерческое событие после собственной медицинской оценки и продажи лечения.

Операционный инвариант:

> **Со стороны CAESTHETIC контур должен обслуживаться одним сотрудником.**

Не создавать собственный call-центр, медицинский отдел, отдел продаж, CRM, booking-систему или платёжную платформу. Клиника проводит консультацию, определяет пригодность, формирует предложение, принимает оплату и исполняет услугу.

---

## 1. Единая категория

Фокус — дорогие плановые продукты, связанные с изменением внешности, для которых:

1. Средний чек позволяет клинике платить CAESTHETIC не менее **€300 за одного нового оплаченного пациента**.
2. Первичную квалификацию можно начать дистанционно через анкету и фотографии.
3. Пациент осознанно ищет конкретное решение, врача или клинику.
4. Карты, поисковая реклама, репутация врача, кейсы и визуальные доказательства влияют на выбор.
5. Клиника может подтвердить событие `deposit_paid` или `treatment_started`.
6. CAESTHETIC не участвует в медицинском решении и не обещает результат лечения.

Общий путь:

```text
Проблема внешности
→ поиск и изучение вариантов
→ анкета / фотографии
→ предварительная оценка клиникой
→ консультация клиники
→ персональное предложение
→ депозит или первый платёж
→ подтверждённое коммерческое событие
→ вознаграждение CAESTHETIC
```

---

## 2. Приоритетный продуктовый портфель

### Tier 1 — запускать первыми

| Вертикаль | Основные продукты | Рабочее событие оплаты CAESTHETIC | Стартовая CPA-гипотеза |
|---|---|---|---:|
| **Hair** | FUE/DHI hair transplant, female hair transplant, beard transplant, eyebrow transplant, corrective transplant | Новый пациент внёс депозит на операцию; refund window завершён | **€700** |
| **Smile — implants** | All-on-4 / All-on-6, full-arch implants, full-mouth rehabilitation, комплексная имплантация | Пациент принял treatment plan и внёс первый платёж | **€1 000** |
| **Smile — aesthetics** | Full smile makeover, полный комплект виниров, комплексные veneers cases | Пациент принял план и внёс депозит | **€500** |
| **Face — rhinoplasty** | Primary rhinoplasty, revision rhinoplasty | Пациент внёс хирургический депозит; refund window завершён | **€900** |
| **Face — blepharoplasty** | Upper, lower, combined blepharoplasty; blepharoplasty + brow lift | Пациент внёс хирургический депозит | **€500** |

Ставки — коммерческие гипотезы для переговоров. Они не являются публичным прайсом и должны проверяться по рынку, валовой марже клиники, сумме депозита и стоимости привлечения.

### Tier 2 — подключать после подтверждения Tier 1

- VASER liposuction и surgical body contouring.
- Tummy tuck / mini tummy tuck / post-weight-loss body contouring.
- Breast augmentation, breast lift, augmentation + lift, implant replacement.
- Facelift, deep-plane facelift, neck lift, facelift + blepharoplasty.
- Medical weight-management programmes сроком 6–12 месяцев.

Для Tier 2 ставка определяется отдельно; ориентир — **€500–2 000** за подтверждённый treatment start в зависимости от продукта.

### Не использовать как основной коммерческий продукт

- Разовая skin consultation без самостоятельной ценности.
- Hydrafacial, одиночный laser session и другие услуги, экономика которых не поддерживает CPA €300+.
- Депозит как плата за лид без подтверждённого дорогого treatment start.
- Botox, fillers и prescription-only продукты как первая вертикаль.
- Неопределённый «beauty lead» без конкретного SKU и события оплаты.

---

## 3. Коммерческое событие

CAESTHETIC не получает оплату за форму, звонок, заявку или назначенную консультацию.

Единый стандарт оплачиваемого результата:

```text
new_patient = true
AND clinic_assessment_completed = true
AND offer_accepted = true
AND deposit_paid = true
AND refund_window_expired = true
```

Допустимый эквивалент для стоматологии:

```text
new_patient = true
AND treatment_plan_accepted = true
AND first_treatment_payment_captured = true
```

### Новый пациент

Пациент считается новым, если в группе клиента не было оплаченного лечения по этому человеку за предыдущие 12 месяцев.

Проверка дубля выполняется клиникой по телефону, email и внутреннему patient/customer ID. CAESTHETIC не требует доступа к клинической карте.

### Минимальные статусы от клиники

```text
received
assessed
offer_sent
deposit_paid
refund_window_expired
cancelled
refunded
procedure_completed
```

Минимальные поля:

```text
rovlex_patient_id
clinic_id
location_id
product_sku
status
deposit_amount
payment_date
refund_status
```

Источник истины — платёжное событие или подтверждённый CRM/payment export, а не устное сообщение менеджера.

---

## 4. Позиционирование для клиники

Не использовать:

- «Мы будем вести ваш маркетинг».
- «Заменим ваше агентство».
- «Нужен setup и retainer, потом попробуем привести пациентов».
- «Платите за лид».

Использовать:

> **CAESTHETIC — дополнительный канал оплаченных пациентов для конкретных high-ticket процедур. Ваш текущий маркетинг остаётся без изменений. Вы платите только после того, как новый пациент прошёл вашу оценку, принял предложение и внёс согласованный депозит.**

CAESTHETIC отвечает за собственный acquisition channel. Клиника отвечает за медицинскую оценку, предложение, продажу, оплату, исполнение и последующее обслуживание.

---

## 5. Одно-сотрудниковая операционная модель

Со стороны CAESTHETIC работает один performance/operator сотрудник.

Он управляет:

- одним набором шаблонных страниц;
- Google Maps и search acquisition;
- Meta/YouTube creatives и retargeting при необходимости;
- одной анкетой по каждой вертикали;
- автоматической маршрутизацией заявок клиникам;
- уникальными `rovlex_patient_id`;
- сверкой подтверждённых депозитов;
- отключением неэффективных клиник или каналов.

Он не выполняет:

- медицинскую квалификацию;
- телефонные консультации;
- продажи treatment plan;
- обработку клинических возражений;
- aftercare;
- ручное ведение CRM клиента;
- производство индивидуального маркетинга для каждой клиники.

### Технологический минимум

- Шаблонные посадочные страницы.
- Анкета и безопасная передача данных партнёру.
- CRM/booking/payment система клиента.
- Make/Zapier/webhook либо регулярный CSV на пилоте.
- Общий reconciliation sheet.
- Уникальные source, clinic, location и product IDs.

Собственная сложная платформа не является условием запуска.

---

## 6. Географии

### Приоритет 1 — Испания

Города:

1. Madrid
2. Barcelona
3. Málaga / Marbella
4. Alicante
5. Valencia

Лучшие продукты:

- hair transplant;
- veneers / smile makeover;
- full-arch implants;
- rhinoplasty;
- blepharoplasty;
- затем body contouring.

Испания подходит для локальных жителей, экспатов и части международного спроса.

### Приоритет 2 — Великобритания

Города:

1. London
2. Manchester
3. Birmingham
4. Leeds
5. Glasgow

Лучшие продукты:

- hair transplant;
- rhinoplasty;
- blepharoplasty;
- veneers;
- full-arch implants;
- facelift и breast surgery после правовой проверки рекламы.

Преимущество — высокий чек и британское юрлицо ROVLEX. Ограничения — дорогой трафик и строгие правила рекламы cosmetic procedures.

### Приоритет 3 — Dubai

Лучшие продукты:

- hair transplant;
- premium veneers;
- rhinoplasty;
- blepharoplasty;
- body contouring;
- facelift;
- medical weight management.

Запуск разрешён только после локальной юридической проверки лицензирования, рекламы и допустимости success/performance compensation.

### Турция — не первый рынок

Использовать позднее для hair transplant, veneers и rhinoplasty только при наличии проверенных клиник, aftercare, прозрачной ответственности и compliant international patient journey.

---

## 7. Карты и локации

### Единый сайт — да

Допустима общая consumer/content-архитектура:

```text
CAESTHETIC
├── Hair
├── Smile
├── Face
└── Body
```

Примеры страниц:

```text
/london/hair-transplant/
/london/rhinoplasty/
/madrid/veneers/
/malaga/full-arch-implants/
/dubai/blepharoplasty/
```

### Универсальная карта для всех процедур — нет

Google Business Profile должен соответствовать реальному основному бизнесу и фактически оказываемым услугам.

Допустимая связь:

| Реальная категория точки | Допустимые продукты |
|---|---|
| Hair transplant clinic | Hair transplant, beard/eyebrow transplant, PRP и post-transplant care при фактическом наличии |
| Dental clinic | Implants, veneers, Invisalign и другие реальные стоматологические услуги |
| Cosmetic surgery clinic | Rhinoplasty, blepharoplasty, liposuction, breast/facial surgery при наличии лицензии и специалистов |
| Medical aesthetics clinic | Skin, laser, non-surgical body treatments, но не стоматология или хирургия без соответствующего подразделения |

Правила:

1. Не создавать фиктивные точки.
2. Не менять категорию существующей beauty-точки ради чужой high-ticket процедуры.
3. Не направлять карточку одной клиники на несвязанных провайдеров.
4. Новые map-assets возможны только для реальных партнёрских локаций или публично обособленных подразделений.
5. CAESTHETIC может использовать карты как источник спроса, но медицинское исполнение всегда принадлежит конкретному лицензированному партнёру.

---

## 8. Каналы привлечения

Каналы выбираются по продукту, но остаются внутри одного операционного контура.

### Hair transplant

- Google Search.
- Google Maps.
- YouTube education/cases.
- Meta retargeting.
- Content and comparison pages.

### Full-arch implants

- Google Search и Maps.
- Local and international procedure pages.
- Educational video.
- Retargeting.

### Veneers / smile makeover

- Google Search.
- Instagram/Meta visual content.
- YouTube.
- Influencer/affiliate traffic с уникальной атрибуцией.

### Rhinoplasty / blepharoplasty

- Google Search.
- Maps and surgeon reputation.
- YouTube education.
- Instagram/Meta при соблюдении рекламных правил.
- Case-led organic content.

Нельзя оптимизироваться на дешёвый CPL. Главная метрика:

```text
media_cost / confirmed_paid_patients
```

Вторая метрика:

```text
CPA_revenue_to_CAESTHETIC - media_cost - tools - refunds = contribution_margin
```

---

## 9. Отношения с партнёром

Рекомендуемый договор:

> **Paid Patient Acquisition & Attribution Agreement**

Не marketing retainer и не договор управления всем маркетингом клиники.

Обязательные положения:

1. Конкретные продукты/SKU.
2. Фиксированная CPA по каждому SKU.
3. Определение нового пациента.
4. Событие, при котором CPA заработана.
5. Refund window.
6. Правила отмены и возврата.
7. Минимальные статусы и сроки передачи данных.
8. Уникальный `rovlex_patient_id`.
9. Запрет скрывать атрибутированную продажу или выводить пациента из учёта.
10. Право выборочной сверки payment/CRM events.
11. Клиника остаётся medical provider и merchant of record.
12. CAESTHETIC не принимает клинических решений и не гарантирует результат лечения.
13. Текущие агентства и маркетологи клиники не затрагиваются.

### Платёжная модель пилота

```text
setup = 0
retainer = 0
media = по согласованной модели
CPA = только подтверждённый paid patient
```

До подтверждения unit economics предпочтительно, чтобы media финансировал партнёр. После подтверждения допускается media arbitrage за счёт CAESTHETIC при положительной contribution margin.

---

## 10. Юридический и compliance gate

До запуска каждой страны и продукта обязательна локальная проверка:

- правил рекламы medical/cosmetic procedures;
- лицензий клиники и врача;
- ограничений на referral fees, fee splitting и success compensation;
- обработки medical/special-category data;
- international patient rules;
- обязательных disclosures, risks и cooling/refund terms.

Коммерческое вознаграждение должно быть оформлено как согласованная acquisition/marketing fee за подтверждённое событие и не должно превращаться в участие CAESTHETIC в медицинском решении или незаконное разделение врачебного гонорара.

При запрете CPA/revenue-linked compensation в конкретной юрисдикции продукт не запускается в этой форме до получения допустимой альтернативной структуры.

---

## 11. Последовательность запуска

```text
1. Hair transplant — один город, 2–3 проверенных партнёра
2. Full-arch implants — один город, 2–3 партнёра
3. Veneers / smile makeover
4. Rhinoplasty
5. Blepharoplasty
6. Только затем Tier 2
```

Для каждого нового SKU сначала доказать:

- стоимость квалифицированного пациента;
- конверсию assessment → offer;
- конверсию offer → deposit;
- refund rate;
- фактическую CPA collection;
- contribution margin;
- способность одного сотрудника обслуживать контур.

Не масштабировать SKU или город, если модель требует ручного участия второго сотрудника со стороны CAESTHETIC.

---

## 12. Главный инвариант

> **CAESTHETIC не продаёт лиды и не становится агентством клиники. CAESTHETIC строит независимый канал новых high-ticket пациентов и получает не менее €300 только после подтверждённого платёжного события. Клиника сохраняет свой маркетинг, проводит медицинскую оценку, закрывает продажу и исполняет услугу. Весь контур со стороны CAESTHETIC должен управляться одним сотрудником.**
