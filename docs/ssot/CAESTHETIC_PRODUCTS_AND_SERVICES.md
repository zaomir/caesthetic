---
owner: CAESTHETIC
status: active
type: ssot
version: 1.2.0
created: 2026-09-06
updated: 2026-09-06
scope: internal products and implementation service catalog; eligibility, horizons and dependencies
parent: docs/ssot/CAESTHETIC.md
architecture_parent: docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md
marketing_parent: docs/ssot/MARKETING_SYSTEM_STANDARD.md
request_router: docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md
economics_authority: docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
source_register: docs/projects/caesthetic/product/PRODUCTS_AND_SERVICES_SOURCES.md
issue: "#1520"
---

# CAESTHETIC — Продукты и услуги

<a id="catalog-routing"></a>
## 0. Назначение и границы

Единственный внутренний implementation catalog CAESTHETIC: **какие работы мы можем предложить, на основании каких данных, когда начать и что именно завершить**. Запросы «продукты», «услуги», «implementation catalog», «Sprint services», «что мы делаем» в контексте CAESTHETIC ведут сюда. Объяснение Connect4 / «Как мы работаем» и его визуальные формы остаются в [Connect4 concept](CAESTHETIC_CONNECT4_CONCEPT.md).

Это специализированный адаптер [мастер-SSOT](CAESTHETIC.md), а не новая публичная линейка или пакет всех перечисленных услуг. Мастер сохраняет позиционирование, funnel и коммерческие границы; [Operating Model](CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md) §5 — классы запросов; [Economics Engine](CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md) — деньги, измерение и договорную экономику. При конфликте этих authorities с каталогом применяются authorities, каталог исправляется.

**The growth operating system for independent aesthetic practices.** Работа выбирается по цепочке Evidence → Constraint → Priority → Decision → Intervention → Adoption → Verified Impact → Learning.

Connect4 содержит ровно четыре публичные поверхности: **Search / Google Business Profile; Website; Social; Reputation / Reviews**. Блог относится к Website. Cross-Surface Consistency — *соответствие* между поверхностями, не пятая поверхность. Paid Ads — Demand Layer. CRM, телефония, chatbot, ресепшен, найм и автоматизация — внутренние interventions после evidence/access.

Каталог не является сметой: отдельные услуги перечислены без цен; цену и ресурсы определяют только для выбранного scope.

Наличие строки означает поддержанный предмет scoping, а не готовую интеграцию, свободную команду, включение в цену или доказанный результат. Источник каждой строки указан ниже; историческое предложение не становится выполненным кейсом.

<a id="products"></a>
## 1. Что продаём

| Продукт / ветка | Результат и граница | Коммерческая authority |
|---|---|---|
| Free Growth Score | Outside-in диагностика по публичным данным: Problem/Gap Inventory → binding constraint → Top 3 → Repair Plans → Do Not Fund Yet. AI исследует и готовит draft; финальные Class A facts, выбор Primary + двух Supporting Gaps и отчёт проверяет человек. | Бесплатно; мастер §4 и действующий production SOP. Не исследует CRM и команду. |
| 30-Day Growth Sprint | Внедрение согласованного priority constraint и необходимых зависимостей за 30 дней; законченные исправления плюс реально запущенная работа с более длинным горизонтом. | $2,500; мастер §5. Top 3 — приоритеты, а не обязанность продать ровно три услуги. |
| Lead-to-Revenue Check | Условная диагностика material post-enquiry неопределённости, которую нельзя разрешить публичными данными, с отдельным внутренним доступом. | $500; [Check SSOT](CAESTHETIC_LEAD_TO_REVENUE_CHECK.md). Не обязательный этап и не headline product; однократный credit в следующий qualifying Sprint только по его правилам. |
| Sprint Extension | Дополнительная конечная реализация, если её обосновывает Day-30 evidence, доступ, vendor dependency или объективный срок. | $2,500 за дополнительные 30 дней; только после Day 30, не обязательный upfront product. |
| Optional Growth System | Регулярное владение согласованными growth-процессами, adoption и измерением, с Client Growth Statement. | По мастер §7, Operating Model и подписанному соглашению. Отдельно выбранный annual engagement не возникает автоматически после Sprint. Универсальной recurring fee, ставки Performance Fee или cap здесь нет. |

Новый сайт, staffing, CRM и другие большие модули оформляются как finite add-on / отдельный SOW в существующей модели, если подтверждена потребность. Они не становятся headline products. Продукты самой клиники, включая обсуждавшиеся в Аризоне программы помощи, не являются услугами лечения от CAESTHETIC.

<a id="eligibility"></a>
## 2. Два уровня допуска и независимые горизонты

**Catalog A — Outside-in / First Sprint Eligible.** Потребность можно обосновать бесплатной диагностикой по публичным данным. Продавать согласованный scope можно после подтверждения внешнего priority constraint; для исполнения всё равно нужны права редактирования, материалы, ответственный и Day-0 Access Gate. Публично видимая ошибка записи не доказывает дефект CRM.

**Catalog B — Inside-out / Growth System Eligible = весь Catalog A + внутренние и расширенные модули §4.** Требует evidence/access: Check и/или ограниченное наблюдение необходимого интерфейса в первом Sprint. Check не является обязательной покупкой для каждого B-модуля и не заменяет доступ. Eligibility не означает включение в Growth System fixed fee.

| Метка | Точное значение |
|---|---|
| `30D` | Ограниченный deliverable можно полностью принять в течение 30 дней при выполненных зависимостях. Это оценка реализуемости, которую подтверждают в SOW, не обещание market outcome. |
| `LONG` | Полная реализация или наблюдение требуют больше 30 дней. В первом периоде принимается только явно названный этап; остаток, owner и следующая дата видимы заранее. |
| `ONGOING` | Повторяющаяся работа с периодом, SLA и ответственным. Настройка процесса может быть 30D, дальнейшее ведение не имеет честного «завершено навсегда». |
| `M2+` | Не брать обязательство реализации в стандартный первый Sprint, сформированный только из public Score. Широкий внутренний scope открывается после Day-30 review и выполнения gates. Само наступление второго месяца ничего не разрешает. |
| `DEP` | Работа ждёт конкретный принятый predecessor, доступ или vendor evidence; календарь не заменяет зависимость. |

Независимые оси: источник диагноза; допуск к старту; длительность реализации; горизонт evidence; регулярность; коммерческий класс. `30D + M2+` означает «один месяц реализации после допуска», а не «входит в первый месяц». `30D setup + LONG impact + ONGOING` означает законченный запуск и отдельно измеряемую дальнейшую работу.

**Исключение не создаёт расширения scope:** минимальную настройку handoff/учёта, без которой нельзя принять уже выбранное внешнее исправление, можно выполнить в Sprint 1 после проверки доступа и письменного scope. Это не разрешение обещать реконструкцию CRM, телефонию или автоматизацию. Если Check заранее подтвердил внутреннее ограничение, подходящий отдельный SOW оценивается по его фактическому состоянию; ярлык M2+ не создаёт искусственный месяц ожидания вне public-only первого Sprint.

<a id="report-value-gate"></a>
## 2.1. Допуск находок в отчёт и ценность первого Sprint

Решение владельца от 2026-09-06 (#1521): весь клиентский Growth Score строится
вокруг поддержанных работ этого каталога. Наличие ошибки ещё не делает её
основанием для продажи Sprint за $2,500. Сначала оценить проблему для пациента,
затем — целесообразность привлечения CAESTHETIC.

**Catalog gate.** Каждую публикуемую проблему, рекомендацию и предложенную работу
связать с конкретными `module_id` A01–A10 / B01–B17 и их фактическим scope,
eligibility, horizon и dependencies. Принадлежность Catalog B не разрешает
публичный диагноз внутренней проблемы или автоматическое включение в Sprint 1.
Если задача выходит за каталог, сохранить находку только во внутреннем реестре
и сначала обсудить её с менеджером CAESTHETIC. До его явно записанного решения
не публиковать её в клиентском отчёте, preview, repair plan или предложении.
Решение содержит имя менеджера, дату, конкретную находку/версию, допустимый текст,
объём и маршрут: исключить, согласовать исключение для этого клиента либо
предложить изменение каталога. Сообщение, отправленное менеджеру, молчание или
общая команда «внедряй» не являются решением по неизвестной ему новой задаче.
Одобрение единичного исключения не расширяет каталог для остальных клиентов.

**Две независимые оценки.**

1. Значимость для выбора/обращения: какой шаг затруднён, какой конкретный факт
   это подтверждает, насколько широко проблема проявляется в проверенной
   выборке. Различать фактически сломанный путь, обоснованное предположение о
   затруднении и измеренную потерю клиентов. Последнюю нельзя заявлять без данных.
2. Ценность исполнения CAESTHETIC: какая связанная работа требует нашей
   экспертизы, координации, внедрения, adoption и проверки; что разумно сделать
   самому клиенту; почему весь согласованный scope стоит $2,500 для этого бизнеса.
   Сложность, количество замечаний и часы сами по себе не доказывают ценность.

**Маршруты после оценки:**

| Маршрут | Требование | Место в отчёте |
|---|---|---|
| Первый Sprint | Существенная подтверждённая проблема в нашем scope; конкретное вмешательство, разумная ценность для клиента, реальная 30D-приёмка и зависимости. | Основной рассказ и предложение Sprint. Обычно три связанные приоритетные проблемы; четвёртая только при обосновании и в допустимом scope. Не менять машинный Primary + 2 Supporting контракт без отдельной версии; четвёртая может быть зависимостью/задачей. |
| Позже / продолжается | Значимая работа из каталога, но LONG, ONGOING, M2+ или DEP; назвать этап, причину и условие старта. | Короткий последующий план, без обещания закончить всё за первый месяц. |
| Небольшое исправление силами клиники | Локальная правка, которую команда может разумно выполнить сама и которая отдельно не оправдывает Sprint. | Последний компактный блок «Небольшие исправления для вашей команды», после основного решения; факт, источник и короткая инструкция. Не аргумент цены и не один из главных приоритетов. |
| Вне каталога | Нет честного module mapping или требуется неподдержанный scope. | Внутренний реестр и обсуждение с менеджером; до решения отсутствует во всех клиентских разделах. |

Устаревшее название бизнеса в одном тексте или профиле по умолчанию относится к
небольшим исправлениям. Нельзя повышать его значимость общей фразой «снижает
доверие», разбивать на несколько утечек или использовать как центральное
обоснование Sprint. Связанное *соответствие* важно только в контексте конкретного
пути и доказанного масштаба проблемы. Если быстрая правка действительно
восстанавливает сломанный путь, сообщить о срочном самостоятельном исправлении;
лёгкость исправления не отменяет ущерб, а высокий ущерб не делает разумной
продажу $2,500 только за эту правку.

Для каждого кандидата сохранять: evidence/date, module mapping, affected step,
обоснование materiality, границы уверенности, DIY alternative, CAESTHETIC added
value, 30D deliverable, dependencies, acceptance и решение о месте в отчёте.
Это качественное решение человека, не выдуманный балл/ROI или оценка потерь.
Если трёх существенных проблем пока не доказано, продолжить исследование либо
уменьшить вывод; не добивать количество косметическими ошибками. Check $500
остаётся меньшим входом для разрешённой post-enquiry диагностики, а не платой
за раскрытие публичных источников или набор мелких правок.

<a id="catalog-a"></a>
## 3. Catalog A — возможный scope первого Sprint

Для всех строк обязательны G0–G2 из §5. Объём задаётся поимённо: страницы, профили, статьи, ссылки, шаблоны и backlog; не «весь сайт» и не «все соцсети» без оценки. Evidence source: C1, C2, E1–E3 в [реестре](../projects/caesthetic/product/PRODUCTS_AND_SERVICES_SOURCES.md).

| ID / работа | Что полностью принимаем за 30 дней | Что длиннее / регулярно; зависимость | Основание |
|---|---|---|---|
| A01 Search / GBP / Maps | Исправленные категории, услуги, часы, контакты, ссылки, фото и назначение карточки; before/after и проверка доступного маршрута. | `30D`; внешняя модерация/восстановление — `DEP`, срок вне контроля; карта видимости — `LONG`, поддержание — `ONGOING`. Нельзя обещать позицию. | C1, E1, E3 |
| A02 Страницы услуг и специалистов | Выбранные существующие страницы: понятное предложение, актуальные сведения о специалистах, проверенный proof, география и следующий шаг. | `30D`; полный новый сайт — B12. Медицинские утверждения и медиа предоставляет/проверяет их authority. | C1, E1, E3 |
| A03 Публичный путь обращения | Рабочие ссылки, телефон/CTA, mobile UX, выбранные формы и переходы к записи; техническая приёмка с разрешённым тестовым режимом. | `30D`; delivery внутрь системы требует доступа. Free Score осматривает только public path без отправки; внутренний дефект остаётся Not assessed. | C1, E3 |
| A04 Блог / content repair | Обновлённые выбранные статьи, ссылки на service pages, CTA, редакционные правила и bounded content plan. | `30D`; полный блог с нуля/массовый выпуск не включены; расширение и поисковый эффект — `LONG`, публикации — `ONGOING`. | C1, E1, E2 |
| A05 Local SEO / demand-language map | Проверенная карта языка спроса, intent, услуги/специалиста/локации; распределение тем и запросов по поверхностям. | `30D`; частотность без источника не считается измеренной; обновление карты — `ONGOING`, search movement — `LONG`. | C1, C2 |
| A06 Social foundation | Исправленные bio, location, booking path; представление приоритетных услуг/специалистов; согласованный стартовый набор материалов и шаблонов. | `30D`; регулярный social management и производство больших объёмов не включены; cadence — `ONGOING`. | C1, C2, E1 |
| A07 Reputation launch | Нейтральная просьба об отзыве, инструкции, разрешённые QR/ссылки, privacy-safe ответы и согласованная часть backlog; owner/SLA. | `30D setup`; приёмка процесса с командой требует G3. Ответы/контроль — `ONGOING`, участие и review velocity — `LONG`; сложный hub — B13. | C1, E1, E2 |
| A08 Cross-Surface Consistency | Единый service/provider/location vocabulary, исправление подтверждённых расхождений и повторная проверка выбранных четырёх поверхностей. | `30D`; зависит от A01/A02/A05/A06/A07 по scope; повторная проверка *соответствия* — `ONGOING`. | C1, C2, E3 |
| A09 Public trust / offer clarity | Исправленные условия первого шага, FAQ, credentials и размещение разрешённых кейсов; только существующая подтверждённая услуга. | `30D`; производство новых доказательств/кейсов — `DEP/LONG`; разработка нового предложения — B10. | C1, E3 |
| A10 Measurement foundation | Before Snapshot, план событий и источников; ограниченная установка/исправление analytics только при доступе и допустимом data flow, техническая проверка. | `30D`; public baseline доступен снаружи, фактическая конверсия и attribution — B09 после G3; evidence horizon фиксируется отдельно. | C1, E1, E2 |

Не включать автоматически все десять модулей. Планировочные диапазоны мастера — примерно 3–6 Category A исправлений и 1–5 Category B запущенных процессов — не квоты и не те же сущности, что **Catalog A/B**. Их нельзя использовать для расширения одного согласованного priority constraint до general audit.

<a id="catalog-b"></a>
## 4. Catalog B — после evidence/access, включая отдельные add-ons

Все A-модули сохраняются. Для внутренних строк базовый маршрут — `M2+ + DEP` относительно стандартного public-only первого Sprint, G0–G3; для technology дополнительно G4. В предпроектном запуске нового бизнеса B10–B12/B15 могут выполняться отдельным SOW с первого календарного месяца: это не обещание включить полное создание практики в стандартный Sprint.

| ID / intervention | Конечный deliverable и горизонт | Предшественники / acceptance / recurring | Основание и коммерческий маршрут |
|---|---|---|---|
| B01 Приём заявок, CRM discipline | `30D` для одного принятого процесса: source, owner, contact outcome, next action, due date; пропущенные обращения и очереди исключений. | G3: наблюдение реальной работы, права, владелец данных; принять на разрешённых сценариях в существующей CRM. Контроль SLA — `ONGOING`. | C3, E2–E4; Included Optimization только в уже согласованном scope, иначе Practice Operations Add-on. |
| B02 CRM / practice-management configuration | Поля, статусы, роли, расписания, отчёты и один ограниченный workflow; `30D` если штатная настройка, миграция — `LONG`. | B01, G4; existing system of record сохраняется. Backup, rollback, data ownership и end-to-end acceptance. Не обещать вторую CRM. | E4, P2; Growth / Practice Operations Add-on + SaaS cost. |
| B03 Телефония и omnichannel | Проверенные номера/очереди, missed-call/callback, native CRM association; email и WhatsApp/WABA при применимости; `30D` bounded pilot или `LONG`. | B01/B02, G4, подтверждение vendor функций/портирования; доступ, нагрузка, consent и recording отдельно. Service health — `ONGOING`. | E4/E5, P2; add-on + provider cost; не заявлять конкретного вендора универсально готовым. |
| B04 Скрипты, обучение, call QA | Guidebook, SLA, сценарии цены/вопросов, escalation, onboarding и пилот выбранной роли — `30D`; изменение поведения всей команды — `LONG`. | B01; использовать согласованный материал и разрешённую QA-выборку. Adoption доказывает использование, не attendance на обучении. QA/coaching — `ONGOING`. | E2/E3/E4, P2; Practice Operations Add-on. |
| B05 Follow-up / revenue recovery | Один loop: missed inquiry, no-show, консультация без next action, незавершённый организационный маршрут или recare; `30D launch`. | B01 и допустимая аудитория/контакт; ручной pilot → B08. `LONG` наблюдение, `ONGOING` цикл; без недоказанного recovered revenue. | C3, E2/E3; scoped optimization либо operations add-on. |
| B06 Coordinator / handoff / patient journey | Named owner + backup, расписание, warm handoff, next action, понятное организационное сопровождение — `30D pilot`, `LONG` rollout. | B01/B04, подтверждённые роли и capacity. Диагноз и treatment decisions у клинициста. Concierge/координация — отдельная `ONGOING` нагрузка. | E2/E3, P2; Practice Operations Add-on. |
| B07 Документы, согласия и платежный путь | Реестр версий, настройка уже утверждённых форм/согласий, маршрута оплаты и передачи; `30D` ручной этап, e-sign/integrations — `LONG/DEP`. | Authority форм, permissions, хранение/доступ, vendor evidence; проверка exceptions. CAESTHETIC организует внедрение, не заменяет юриста/врача. | E3/E4, P2; отдельный add-on + external costs. |
| B08 Автоматизация, chatbot, API/integrations | Один подтверждённый повторяемый non-clinical workflow; `30D` bounded configuration либо `LONG` custom build. | Принятые B01–B07 по назначению, G4; schema/event ownership, retries, dedup, alerts, human handoff, rollback. Эксплуатация — `ONGOING`. | C3, E4/E5, P2; Growth Add-on; integrations не headline product. |
| B09 Funnel analytics / evidence / IT-to-adoption | Source/event map, baseline, согласованный отчёт/ledger и контроль качества; `30D` minimum setup, интеграции и attribution observation — `LONG`. | A10/B01, G3–G4; факты из разрешённого system of record, никаких копий PHI в git. IT task считается принятой после live change и adoption. | C3, E2/E3; ownership или отдельный существенный build; без двойной оплаты. |
| B10 Product / market validation | ICP/JTBD и конкурентные альтернативы, VOC, сравнение предложений, тестируемый product contract, сценарии экономики и рекомендация одного пилота — `30D` ограниченное исследование. | Вводные founder, специалист/компетенции и ресурсы; публичные сигналы не доказывают продажи. Интервью, покупки и повторный набор — `LONG`; это experiment/validation, не новый headline product. | P1/P2, global productization; отдельный research/pilot SOW. |
| B11 Бренд и launch identity | Позиционирование, сообщения, визуальная основа, оформление специалистов, запуск необходимых social/professional-directory profiles — `30D` bounded kit. | B10 или подтверждённое существующее предложение, факты, права/доступы; trademark/legal opinion не включены. Production/content — отдельный scope. | P2; Growth Add-on. |
| B12 Сайт с нуля / substantial redesign | Структура, тексты, дизайн, mobile, страницы программ/специалистов, SEO foundation и аналитика; `LONG` по умолчанию, bounded MVP — только после оценки. | B10/B11, материалы, G2/G4; live critical path, owner acceptance и handover. Регулярные правки — `ONGOING`. Не обычная A02-оптимизация. | P2, C3, E2; Growth Add-on, вне стандартного Sprint и fixed management scope. |
| B13 Review Hub / loyalty / membership | Отдельная система обратной связи или поддержанного retention-механизма; `LONG`, иногда ограниченный `30D pilot`. | A07/B01, G3–G4; no review gating/incentives; клинические продукты и чужие условия не переносить. Эксплуатация отдельно. | C3, E2; Growth Add-on, не автоматическое включение сложного hub. |
| B14 Recruitment / staffing support | Role profile, candidate pipeline, shortlist, организация проверки квалификации и onboarding; `30D` цикл отбора, срок найма не гарантирован. | Evidence staffing constraint, бюджет, работодатель и компетентный reviewer; hiring/payroll/clinical authority у практики. Дальнейший staffing — `ONGOING` отдельный scope. | E2, P2; Practice Operations Add-on. |
| B15 Scheduling / matching / telehealth setup | Настройка доступности, правил первичного распределения и подтверждения, reminders, protected video и payment path — `30D pilot` / `LONG` расширение. | B02/B07/B14 по scope, подтверждённые слоты и допустимый профессиональный scope. Clinical suitability и continuity принадлежат специалисту, не автоматическому matching. | P2; Practice Operations / Growth Add-on + vendor cost. |
| B16 Paid demand / partner acquisition | Ограниченный канал с destination, материалами, бюджетом, измерением и stop criteria; `30D setup`, `LONG` validation, `ONGOING` management. | G5: сначала устранить подтверждённую утечку, подтвердить capacity/economics. Referral материалы не означают медицинские referral commissions. | C1, E3, P2; add-on/approved ownership + отдельный media budget. |
| B17 Pilot operations / unit economics | План эксперимента, учёт фактических поступлений/затрат/времени/отказов, review и keep/stop/iterate; `LONG`, этапы принимаются отдельно. | B10 и необходимая минимальная инфраструктура, допустимый доступ к агрегатам, named owner. Первые случаи — сигнал, не PMF; масштабировать только после повторяемости. | P1/P2; отдельный pilot SOW, затем optional ownership. |

**Что переносится из Expert Dental:** правила ручного процесса, source of truth, intake/next action, администраторские материалы, coordinator/handoff, recovery, document operations, vendor verification и наблюдаемость. Не переносить legacy custom communication-router diagrams как обязательную архитектуру: актуальный infrastructure SSOT требует native/managed systems и ручной pilot; e-sign остаётся последующей волной. Наличие плана или vendor-кандидата не является shipped proof.

**Что добавляет Аризона:** B10–B12, B14–B15, B17 и расширение B03/B07/B16; источник — конкретное историческое предложение по запуску новой практики. Это перенос рабочего модуля, а не обещание результата, подтверждение PMF, готовая американская clinical/legal модель или универсальная стоимость запуска.

<a id="dependency-gates"></a>
## 5. Dependency gates и порядок выполнения

| Gate | Что должно быть установлено до зависимой работы | Кто отвечает / что служит evidence |
|---|---|---|
| G0 Evidence / priority | Подтверждённая проблема, источник/дата, unknowns, один priority constraint, граница AI/human decisions. | Delivery lead; финальные material diagnostic decisions — named human по действующим authorities. |
| G1 Scope / capacity | Именованный deliverable, non-goals, часы/ресурсы оценки, 30D milestone, внешние расходы, owner, коммерческий класс и согласованный SOW. | CAESTHETIC delivery lead и practice decision maker; нет включения «по соседству с маркетингом». |
| G2 Execution access | Права на нужные аккаунты, assets/proof, владелец данных, безопасный тест, даты vendor/client dependencies, before snapshot. | Practice owner + назначенный исполнитель; при отсутствии доступа передать instructions и записать blocker, не объявлять implementation Done. |
| G3 Internal evidence | Реальная работа наблюдалась с разрешением; понятны handoff, данные, роли, baseline и ограничения. | Practice operations/data owner; Check или минимальный interface review, но не предположение по публичной кнопке. |
| G4 Configure before build | Устойчивый manual process, vocabulary/schema, подтверждённая vendor capability, допустимый data flow, стоимость поддержки и rollback. | Technical owner + профильный reviewer. Автоматизировать только воспроизводимую часть; secrets/PHI/raw recordings вне git. |
| G5 Fund / scale readiness | Принят destination/путь, есть response discipline, capacity и economics, бюджет и измеримый stop criterion. | Delivery lead + budget owner; не финансировать подтверждённую утечку. |
| G6 Acceptance / observation | Live evidence, применение процесса, baseline, достаточный horizon, следующий review и решение. | Owner процесса; verified impact/causality — человеческая проверка по evidence authority. |

Типовые цепочки, а не обязательный комплект работ:

- Public truth / A05 → A01/A02/A06/A07 → A08 → G5 → B16.
- G3 → B01 → B04 → один ручной B05 → adoption → B08.
- B14 + подтверждённая capacity → B15; B07 разрешает только утверждённый document/payment path.
- B10 → минимальные B11/B12/B15 → B17 → evidence review → расширение команды/каналов.

Каждая незакрытая зависимость содержит blocker, owner и наблюдаемое условие снятия. Время не снимает gate; отсутствие данных обозначается `Insufficient evidence / Not assessed`. Не держать разумно завершимую работу до Month 2 ради продажи Extension.

<a id="service-contract"></a>
## 6. Карточка выбранной работы и приёмка

До реализации записать:

- `module_id`, client/ICP, decision maker/JTBD, классификацию идеи (existing product change; conditional diagnostic; Sprint intervention; Growth System capability/add-on; internal operator tool; experiment/validation; deferred/rejected);
- evidence refs/даты и gaps, constraint, deliverable/decision, место в funnel, scope/non-goals;
- Catalog A/B, `first_sprint_eligible`, `earliest_start`, причины M2+/DEP, predecessor и acceptance каждой зависимости;
- accountable human, executor, AI/human boundaries, privacy/compliance/data owner;
- estimate, pricing authority/SOW, включённые/внешние расходы и recurring owner;
- baseline, implementation deadline, adoption criterion, impact metric и evidence horizon;
- smallest validation/pilot, stop/kill criteria, handover и следующую дату решения.

`30D` принимает конкретный output: работающий исправленный маршрут, принятая настройка или переданный согласованный artifact. Рост ranking/reviews/patients/revenue/ROI не обещается. `LONG` принимает этап с честным остатком; `ONGOING` — исполнение за конкретный период и SLA. Состояния Shipped, Adopted и Impact Verified различаются; `Maturing` описывает реально запущенную работу, а не нетронутый backlog.

Day-30 email: **Done / materially resolved → Started & continuing → Not started + why → next path: in-house / optional Extension / Growth System / defer**. Коммуникация до Day 30 email-only по мастеру; каталог не добавляет обязательных звонков или видео. Клиент сохраняет результаты и возможность продолжить самостоятельно.

Нельзя: review gating, покупные/сгенерированные отзывы, выбор только довольных для публичной просьбы, навязывание ключевых слов пациентам; гарантии роста; clinical/legal/HR решения от имени практики; перенесённые между клиентами факты, цены и conclusions. Повторно используются только правила, схемы, шаблоны и операционные паттерны.

## 6.1. Публичная проекция каталога

На сайте показываем выбранные примеры работ в контексте существующих продуктов: [первый Sprint](https://caesthetic.com/sprint/#services), [горизонты исполнения](https://caesthetic.com/sprint/#delivery-horizons) и [дальнейшая работа](https://caesthetic.com/growth-system/#services). Решение и module mapping: [PUBLIC_SERVICE_EXAMPLES.md](../caesthetic/PUBLIC_SERVICE_EXAMPLES.md).

Публичные тексты объясняют услуги без построчных цен и без обещания включить весь каталог в Sprint или ежемесячное сопровождение. Четыре поверхности, scope до оплаты, коммерческая ценность и dependency gates сохраняются. CRM/телефония/автоматизация описываются отдельно как возможные interventions после evidence/access; не новые headline products. Внутренние коды A/B/M2+/DEP не нужны посетителю. Размещение примеров не превращает proposed источник в completed case и не заменяет этот SSOT вторым каталогом.

## 7. Источники и изменение канона

Проверенная карта provenance: [PRODUCTS_AND_SERVICES_SOURCES.md](../projects/caesthetic/product/PRODUCTS_AND_SERVICES_SOURCES.md). C1–C3 — действующие CAESTHETIC authorities; E1–E5 — Expert Dental history/implementation; P1/P2 — прошлые обсуждения Аризоны, **proposed**, не completed.

Первоначальный релиз 1.0 был documentation-only: routing знаний. Публичная проекция 1.2 реализуется на существующих продуктовых страницах по поручению #1523 с отдельной проверкой и deploy; scoring, клиентские выводы и vendor activation не меняются. Для нового модуля нужен источник, классификация, deliverable, eligibility, horizon и зависимости; новое неподтверждённое предложение хранится как experiment/deferred, а не готовая услуга.

| Версия | Дата | Изменение |
|---|---|---|
| 1.0.0 | 2026-09-06 | Консолидация по прямому поручению: 10 First Sprint модулей, 17 внутренних/расширенных модулей, 30D/LONG/ONGOING, M2+/DEP; source-backed расширение из Expert Dental и Аризоны; единый knowledge routing. |

| 1.1.0 | 2026-09-06 | Owner-directed catalog/publication gate, prior manager decision for out-of-catalog work, separate patient materiality and CAESTHETIC value, DIY findings at the end, Month-1 commercial justification. |
| 1.2.0 | 2026-09-06 | Curated public examples on existing Sprint/Growth System pages; no line-item prices, new products or blanket inclusion; evidence/access and delivery horizons remain visible. |
