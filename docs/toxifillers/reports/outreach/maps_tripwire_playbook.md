# Google Maps Cold Outreach & Tripwire Playbook: Toxifillers.com (`maps_tripwire_playbook.md`)
## Пошаговый регламент точечного сбора клиник, холодного контакта и допродажи (Upsell)

> **Проект:** [Toxifillers.com](https://toxifillers.com) (Прямые B2B-поставки корейских токсинов и филлеров из Сеула: Innotox, Botulax, Rejuran, Neuramis).  
> **Методологическая база:** Канал @solokumi (посты #147 «Рост конверсии и закономерности работы сильных продавцов», #453 «Партизанский малобюджетный маркетинг», #427 «Управление оффером»).  
> **Целевые рынки:** Дубай (ОАЭ), Лондон (Великобритания), Барселона (Испания), Варшава (Польша), Лима (Перу).

---

## 1. СХЕМА И АЛГОРИТМ ПАРСИНГА КЛИНИК ИЗ GOOGLE MAPS

```
   ┌──────────────────────────────────────────────────────────────┐
   │            ЭТАП 1: ПОИСКОВЫЕ КЛАСТЕРЫ В GOOGLE MAPS          │
   │  Дубай • Лондон • Барселона • Варшава • Лима                 │
   │  Запросы: "Aesthetic clinic", "Botox clinic", "Clínica Botox"│
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │            ЭТАП 2: ФИЛЬТРАЦИЯ И СЕЛЕКЦИЯ ЛИДОВ               │
   │  • Рейтинг >= 4.0 | Отзывов >= 15                            │
   │  • Наличие реального веб-сайта и номера телефона             │
   │  • Отсечение спа-салонов без инъекционных лицензий           │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │            ЭТАП 3: ОБОГАЩЕНИЕ ДАННЫХ (ENRICHMENT)            │
   │  • Скрейпинг сайта клиники: поиск WhatsApp Business, Email    │
   │  • Определение имени Главврача / Medical Director            │
   │  • Верификация мобильного номера в WhatsApp API / Checker    │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │            ЭТАП 4: СЕГМЕНТИРОВАННАЯ БАЗА В CRM               │
   │  Имя • Клиника • Город • Язык • WhatsApp • Инъектор/Владелец │
   └──────────────────────────────────────────────────────────────┘
```

### 1.1. Поисковые запросы по целевым городам

| Город | Языковой кластер | Поисковые запросы Google Maps | Приоритетные районы с высокой концентрацией клиник |
| :--- | :--- | :--- | :--- |
| **Дубай (ОАЭ)** | Английский | `aesthetic clinic Dubai`, `botox clinic Jumeirah`, `cosmetic dermatology clinic Dubai Marina`, `skin clinic Downtown Dubai` | Jumeirah 1-3, Dubai Marina, Downtown, Al Wasl, Business Bay |
| **Лондон (UK)** | Английский | `aesthetic clinic Harley Street`, `botox clinic London`, `doctor-led aesthetic clinic Chelsea`, `nurse injector clinic London` | Harley Street, Marylebone, Mayfair, Chelsea, Kensington, Richmond |
| **Барселона (Испания)** | Испанский | `clínica medicina estética Barcelona`, `inyecciones botox Barcelona`, `clínica dermatológica Eixample`, `ácido hialurónico Barcelona` | Eixample, Sarrià-Sant Gervasi, Gràcia, Les Corts |
| **Варшава (Польша)** | Польский | `klinika medycyny estetycznej Warszawa`, `botoks Warszawa Mokotów`, `lekarz medycyny estetycznej Śródmieście`, `kwas hialuronowy Warszawa` | Mokotów, Śródmieście, Wilanów, Wola |
| **Лима (Перу)** | Испанский | `clínica de medicina estética Lima`, `aplicación botox Miraflores`, `rejuvenecimiento facial San Isidro`, `medicina estética Surco` | Miraflores, San Isidro, Santiago de Surco, La Molina |

### 1.2. Критерии фильтрации и отсечения (Lead Qualification Criteria)
* **Включаем в базу:**
  1. Категории: `Aesthetic Clinic`, `Skin Care Clinic`, `Dermatologist`, `Plastic Surgeon`, `Medical Spa`.
  2. Рейтинг клиники: **$\ge 4.2$** при количестве отзывов **$\ge 15$** (свидетельствует о стабильном потоке платежеспособных пациентов).
  3. Наличие активного веб-сайта и прямого рабочего телефона / мобильного номера.
* **Исключаем (Blacklist):**
  1. Массажные салоны, парикмахерские, барбершопы, ногтевые студии без врачебного приема.
  2. Крупные многопрофильные государственные госпитальные комплексы (сложные тендерные процедуры, закрытые комитеты закупок).
  3. Закрытые клиники или карточки без сайта.

### 1.3. Технический алгоритм сбора и обогащения (No-Cost Stack)
* **Шаг A (Парсинг Maps):** Локальный скрипт Playwright / Selenium или экспорт через расширение Google Maps Scraper (сбор полей: Name, Category, Address, Phone, Website, Rating, ReviewsCount, Place_ID).
* **Шаг B (Обогащение через парсинг сайта клиники):** Автоматический переход на `Website` каждой клиники:
  * Поиск прямых ссылок `https://wa.me/...` и `api.whatsapp.com/...`.
  * Поиск корпоративных email-адресов (`info@...`, `clinic@...`, `dr...`).
  * Извлечение имени главного врача / ведущего инъекциониста со страниц `About Us`, `Team`, `Our Doctors`.
* **Шаг C (Валидация номеров):** Проверка номеров на наличие зарегистрированного аккаунта WhatsApp Business.

---

## 2. ШАБЛОНЫ ПЕРВОГО КАСАНИЯ: WHATSAPP / SMS / EMAIL (Tripwire Hook)

> **Базовый маркетинговый хук:**  
> *«Поставляем клиникам оригинальный Innotox 100U ($77) и Botulax ($61) напрямую из Сеула. Отправляем тестовый бокс от 2 флаконов по оптовой цене, чтобы вы проверили скорость и батчи перед крупным заказом».*

### 2.1. Английская версия (Лондон, Дубай, международные клиники)
*Канал: WhatsApp Business / SMS*

> *«Hello team {{ClinicName}}!*  
>  
> *We supply aesthetic practices with authentic **Innotox 100U ($77)** and **Botulax 100U ($61)** directly from Seoul, backed by guaranteed 2–8°C cold-chain logistics.*  
>  
> *To remove any supplier risk, we ship a **Pilot Box of just 2 vials at our wholesale tier**, so you can verify delivery speed, scan the manufacturer holograms, and inspect our temperature loggers before placing larger orders.*  
>  
> *Check our full catalog & specs: **toxifillers.com/innotox/** or reply here if you'd like us to dispatch a 2-vial pilot batch to {{City}} this week.*  
>  
> *Best regards,*  
> *Toxifillers Seoul B2B Order Desk»*

---

### 2.2. Испанская версия (Барселона, Лима, Испания и ЛАТАМ)
*Канал: WhatsApp Business / SMS*

> *«¡Hola equipo de {{ClinicName}}!*  
>  
> *Suministramos a clínicas estéticas **Innotox 100U ($77)** y **Botulax 100U ($61)** originales directamente desde Seúl, con control garantizado de cadena de frío a 2–8°C y envío DDP puerta a puerta.*  
>  
> *Para su total tranquilidad, enviamos una **Caja de Prueba desde solo 2 viales a precio mayorista**, para que puedan comprobar la rapidez de entrega, escanear los hologramas de fábrica y revisar los registradores de temperatura antes de un pedido mayor.*  
>  
> *Catálogo y especificaciones: **toxifillers.com/innotox/** o respondan a este mensaje si desean reservar su caja de prueba para {{City}} esta semana.*  
>  
> *Saludos cordiales,*  
> *Toxifillers Seoul Order Desk»*

---

### 2.3. Польская версия (Варшава, Краков, Вроцлав)
*Канал: WhatsApp Business / SMS*

> *«Dzień dobry, zespół {{ClinicName}}!*  
>  
> *Dostarczamy do klinik medycyny estetycznej oryginalny **Innotox 100U ($77)** oraz **Botulax 100U ($61)** bezpośrednio z Seulu, z gwarancją zachowania łańcucha chłodniczego 2–8°C.*  
>  
> *Aby wyeliminować ryzyko nowego dostawcy, wysyłamy **Pudełko Testowe od 2 fiolek w cenie hurtowej**, dzięki czemu mogą Państwo sprawdzić szybkość dostawy, zweryfikować kody seryjne producenta i odczytać rejestrator temperatury przed większym zamówieniem.*  
>  
> *Specyfikacja i katalog: **toxifillers.com/innotox/** lub prosimy o odpowiedź na tę wiadomość, jeśli chcą Państwo zarezerwować 2 fiolki testowe z dostawą do {{City}} w tym tygodniu.*  
>  
> *Z poważaniem,*  
> *Toxifillers Seoul Order Desk»*

---

### 2.4. Версия для Cold Email (для клиник с корпоративной почтой)
* **Тема:** B2B-поставка Innotox 100U ($77) и Botulax ($61) напрямую из Сеула: Тестовый бокс для {{ClinicName}}
* **Тело письма:**

```text
Здравствуйте, коллеги из {{ClinicName}},

Пишу вам из B2B Order Desk сервиса Toxifillers.com (Сеул, Южная Корея).

Мы поставляем ведущим клиникам эстетической медицины оригинальный жидкий ботулотоксин Innotox 100U ($77) и Botulax ($61) напрямую с заводов Medytox и Hugel.

Главная проблема при заказе из Кореи — страх нарваться на сомнительного посредника, получить подделку или испорченный при перелете препарат.

Чтобы снять этот риск для вашей клиники, мы внедрили протокол «Тестовый бокс от 2 флаконов»:
1. Оптовая цена на первый заказ: Innotox 100U — $77/шт., Botulax 100U — $61/шт. (партия от 2 флаконов).
2. Холодовая цепь: посылка пакуется в специализированный термобокс с одноразовым USB-термологгером Sensitech, фиксирующим температуру 2–8°C.
3. Официальное подтверждение: инвойс от корейского юрлица, оригинальные QR-голограммы производителя и сертификат анализа CoA.
4. Доставка DDP курьером DHL Express прямо в клинику (3–5 дней).

Ознакомиться со спецификацией препаратов: https://toxifillers.com/innotox/

Если вы готовы протестировать наш сервис на минимальной партии из 2 флаконов, просто ответьте на это письмо или напишите нам в WhatsApp: +82-10-xxxx-xxxx.

С уважением,
Отдел международных поставок Toxifillers.com
```

---

## 3. РЕГЛАМЕНТ ДОПРОДАЖИ (UPSELL В ORDER DESK)

> **Ключевой инсайт логистики @solokumi:** Термоконтейнер для авиаперевозки имеет фиксированный объем и вес (базовый тариф DHL/FedEx на медицинскую коробку с хладоэлементами рассчитывается до 1.5–2.0 кг). Положить туда 2 флакона токсина или добавить еще 2 коробки филлеров и полинуклеотидов стоит **ровно одинаково по доставке**.

### 3.1. Схема воронки в Order Desk

```
[Клиника соглашается на 2 флакона Innotox]
                   │
                   ▼
[Менеджер подтверждает адрес и реквизиты]
                   │
                   ▼
[ТРИГГЕР UPSELL: «Физика термобокса и нулевая доставка»]
                   │
                   ▼
┌──────────────────┴──────────────────┐
│ Предложение 1: Филлер Neuramis Deep │  ➔ +$32–$64 к чеку
│ Предложение 2: PDRN Rejuran Healer  │  ➔ +$115–$230 к чеку
└──────────────────┬──────────────────┘
                   │
                   ▼
[Итоговый инвойс вырастает со $154 до $280–$450 при нулевой стоимости привлечения]
```

---

### 3.2. Скрипт менеджера Order Desk при оформлении тестового бокса

*Когда клиент написал: «Да, мы хотим заказать 2 флакона Innotox 100U на пробу».*

* **Шаг 1: Фиксация и валидация основного заказа:**
  > *«Отлично, доктор! Зафиксировал за {{ClinicName}} 2 флакона Innotox 100U по оптовой цене $77 ($154 за партию). Мы подготовили к отправке партию со сроком годности до конца 2028 года, завод Medytox.*  
  > *Уточните, пожалуйста, точный адрес доставки и имя получателя для авианакладной DHL.»*

* **Шаг 2: Включение триггера логистической выгоды (Upsell Hook):**
  > *«И еще один важный практический момент по логистике:*  
  >  
  > *Мы отправляем ваш заказ в стандартном термобоксе со сверхплотной термоизоляцией и гелевыми аккумуляторами холода. По нормативам авиаперевозки минимальный оплаченный объем бокса вмещает до 6–8 упаковок препаратов без удорожания доставки.*  
  >  
  > *Сейчас у вас занято всего 2 слота под Innotox, и 4–5 слотов летят «пустыми». Чтобы вы получили максимальную выгоду от авиадоставки из Кореи, мы можем положить в эту же посылку со склада завода:*  
  >  
  > *1. **Филлер Neuramis Deep с лидокаином** (Medytox) — по оптовой цене **$32.00/шприц** (вместо обычных $48 у местных перекупщиков).*  
  > *2. **Полинуклеотидный биоревитализант Rejuran Healer (PDRN 2x2ml)** — оригинальный золотой стандарт анти-эйдж по заводской цене **$118.00**.*  
  >  
  > *Доставка этих позиций будет для вас **абсолютно бесплатной ($0)**, так как термобокс уже оплачен. Положить вам в бокс 1–2 упаковки Neuramis или Rejuran на пробу вместе с Innotox?»*

---

### 3.3. Варианты реакции клиента и алгоритм закрытия

| Реакция клиента | Скрипт дожатия менеджером | Итоговый чек |
| :--- | :--- | :--- |
| **«Да, давайте добавим 2 Neuramis Deep»** | *«Отличный выбор, доктор! Добавил 2 шприца Neuramis Deep ($64). Итого инвойс: 2 Innotox ($154) + 2 Neuramis ($64) = $218. Доставка бесплатная, логгер вложен. Формирую ссылку на оплату!»* | **$218** (LTV +42%) |
| **«А что такое Rejuran, он тоже оригинальный?»** | *«Да, 100% оригинал PharmaResearch с верификацией по QR-коду на упаковке. Это сейчас самый маржинальный препарат в клиниках Дубая и Лондона — себестоимость $118, а процедура пациенту продается по $400–$550. Положим один сет Rejuran Healer для оценки текстуры?»* | **$272** (LTV +76%) |
| **«Нет, пока ограничимся только 2 Innotox»** | *«Без проблем! Отправляем стартовые 2 флакона Innotox 100U. Убедитесь в скорости и свежести батчей, а филлеры добавим уже в ваш следующий регулярный плановый заказ. Высылаю инвойс на $154.»* | **$154** (Вход в воронку) |

---

## 4. ОПЕРАЦИОННЫЕ МЕТРИКИ И ВОРОНКА MAPS OUTREACH

* **Норматив сбора базы:** 150 новых верифицированных клиник еженедельно на менеджера.
* **Open Rate / Delivery WhatsApp:** $\ge 92\%$.
* **Ответ на первое касание (Reply Rate):** $8–12\%$.
* **Конверсия из диалога в тестовый бокс (Tripwire):** $18–25\%$.
* **Конверсия из Tripwire в Upsell (добавление филлеров/Rejuran):** $\ge 35\%$.
* **Переход из тестового бокса в постоянные ежемесячные закупки:** $\ge 60\%$.
