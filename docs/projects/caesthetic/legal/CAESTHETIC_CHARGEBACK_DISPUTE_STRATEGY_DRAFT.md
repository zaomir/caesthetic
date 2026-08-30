# CAESTHETIC — стратегия защиты от chargebacks и payment disputes (founder draft)

Статус: draft for consultant review
Дата: август 2026
Рынок: США
Основной процессинг: Stripe

Source: founder draft, pasted verbatim for consultant review. See companion review at
`docs/projects/caesthetic/legal/CAESTHETIC_CHARGEBACK_DISPUTE_STRATEGY_REVIEW.md`
(section references below, e.g. "§6", point into this file).

---

## 1. Что такое CAESTHETIC

CAESTHETIC — B2B-сервис и развивающаяся программная платформа для управления ростом эстетических клиник и medical aesthetic practices.

Мы не позиционируем себя как обычное рекламное агентство, CRM или рекламный dashboard.

Задача CAESTHETIC — определить, где бизнес клиники теряет рост, что необходимо исправлять первым, какие инвестиции пока делать преждевременно и привело ли выполненное изменение к измеримому результату.

Базовый цикл продукта:

Evidence → Constraint → Priority → Decision → Intervention → Adoption → Verified Impact → Learning.

Работа может включать:

* диагностику маркетинга;
* Growth Score / аудит;
* стратегию;
* управление digital marketing;
* сайты и landing pages;
* Google / Meta campaigns;
* Maps / Search;
* social media;
* reviews / reputation;
* analytics;
* tracking;
* creative production;
* маркетинговые эксперименты;
* управление подрядчиками;
* сопровождение внедрения изменений;
* периодическую отчётность;
* отдельные performance-based компоненты.

Основными клиентами предполагаются частные медицинские и эстетические клиники США.

Это B2B professional services. Покупатель обычно является владельцем клиники, директором, practice manager или иным лицом, уполномоченным компанией.

Типичный платёж может составлять около $2,500 и выше.

Часть отношений будет регулярной — ежемесячное обслуживание.

⸻

## 2. Экономическая модель

Мы хотим разделять деньги клиента минимум на три экономически разные категории.

### A. CAESTHETIC Base Fee

Вознаграждение CAESTHETIC за:

* professional services;
* agreed scope;
* deliverables;
* management;
* analytics;
* reserved team capacity;
* implementation support.

Base Fee не является гарантией количества лидов, продаж, выручки или ROAS.

### B. Growth Budget

Деньги клиента, предназначенные для:

* advertising;
* production;
* software;
* experiments;
* external contractors;
* других расходов непосредственно на рост.

Это не revenue CAESTHETIC.

По возможности мы хотим, чтобы рекламные кабинеты, SaaS и значимые внешние расходы клиент оплачивал непосредственно поставщикам.

### C. Performance Fee

Отдельное вознаграждение, если оно предусмотрено конкретным договором.

Performance Fee должен определяться отдельной заранее согласованной формулой и выставляться только после завершения measurement period и фиксации результата.

⸻

## 3. Почему мы рассматриваем chargebacks как отдельный системный риск

Digital marketing представляет собой нематериальную услугу.

В отличие от физического товара, нельзя показать UPS delivery confirmation как единственное доказательство выполнения обязательства.

Клиент потенциально может заявить:

* I did not authorize this transaction;
* I don't recognize the merchant;
* services were not received;
* services were not as described;
* service was unacceptable;
* subscription had been canceled;
* amount was incorrect;
* refund was promised but not received.

При карточном dispute Stripe списывает оспариваемую сумму и соответствующие fees с merchant balance, а окончательное решение принимает банк-эмитент клиента. Обычное окно инициирования карточного dispute составляет примерно до 120 дней, хотя отдельные обстоятельства могут увеличивать его; после возникновения chargeback продавцу обычно предоставляется около 7–21 дней для ответа. (Stripe Docs)

Поэтому наша задача — не просто «побеждать чарджбэки».

Нам нужна система, которая:

1. предотвращает часть disputes;
2. уменьшает долю платежей с высоким dispute risk;
3. делает клиенту максимально трудно добросовестно утверждать, что он не понимает, за что заплатил;
4. создаёт доказательства оказания услуги в процессе самой работы;
5. позволяет за несколько часов собрать качественный evidence packet;
6. не ухудшает при этом клиентский опыт.

⸻

## 4. Основной принцип

Мы предлагаем строить систему вокруг следующей цепочки:

Identified Business
→ Authorized Signer
→ Signed Contract
→ Defined SOW
→ Identified Invoice
→ Authorized Payment
→ Documented Delivery
→ Client Approvals
→ Acceptance / Cure Process
→ Evidence Ledger

Каждая денежная транзакция должна иметь однозначную связь:

Payment → Invoice → Service Period → SOW → Client → Evidence Bundle.

Мы не хотим защищаться одним аргументом:

«В договоре написано Non-Refundable».

Мы хотим иметь доказуемый ответ:

Клиент точно знал, что приобретает, уполномоченное лицо заключило договор, размер платежа был известен, услуги были фактически выполнены, клиент регулярно получал результаты, согласовывал работу и имел понятную процедуру предъявления претензий.

⸻

## 5. Предлагаемая payment hierarchy

### Уровень 1 — bank transfer / wire

Для первого крупного платежа или клиентов повышенного риска предпочтительным вариантом считаем push payment, инициированный самим клиентом из банковского интерфейса.

Stripe Bank Transfers позволяет выдавать конкретному клиенту virtual bank account details и автоматически связывать входящие деньги с Customer. (Stripe Docs)

Предлагаем рассматривать bank transfer как предпочтительный метод для:

* первого Sprint;
* setup fee;
* крупных разовых проектов;
* performance fee;
* unusually large invoice;
* клиента с предыдущей dispute history.

При этом мы не предполагаем, что любой банковский перевод абсолютно необратим. Консультант должен определить точную модель риска для используемых нами ACH credit / domestic wire rails.

⸻

## 6. ACH Direct Debit

Для регулярных B2B invoices хотим рассмотреть ACH Direct Debit с подтверждённого business bank account.

Преимущества:

* ниже processing cost;
* естественнее для B2B recurring payments;
* нет классического карточного friendly-fraud UX;
* можно связать mandate, банковский счёт и юридическое лицо.

Но считать ACH «неоспоримым» нельзя.

Stripe указывает, что для ACH Direct Debit спор обычно возможен:

* до 60 календарных дней для personal account;
* до двух business days для business account.

Stripe также указывает, что своевременные ACH disputes могут считаться final and uncontestable through the ACH network. (Stripe Docs)

Одновременно текущая документация Stripe далее описывает механизм загрузки evidence для ACH Direct Debit dispute. Мы хотим отдельно выяснить у консультанта практическое и юридическое значение этого несоответствия: когда evidence действительно может изменить результат и когда dispute фактически окончателен. (Stripe Docs)

**Предлагаемое правило**

ACH Direct Debit принимать только после:

* проверки юридического клиента;
* проверки business account;
* явного mandate;
* сохранения authorization record;
* определения fixed amount или agreed calculation method;
* уведомления клиента о recurring debit.

⸻

## 7. Карточные платежи

Карты мы не хотим запрещать полностью.

Но карта должна быть fallback / convenience payment method, а не единственным способом оплачивать high-ticket B2B services.

Для карточки предполагается:

* уникальный Stripe Customer;
* invoice вместо анонимного generic checkout;
* полный billing information;
* CVC;
* AVS;
* корпоративный email;
* понятный statement descriptor;
* 3D Secure там, где это рационально;
* Radar;
* manual review некоторых high-value transactions.

⸻

## 8. 3D Secure

3DS является сильным инструментом против категории Fraudulent, но не универсальной защитой от dispute.

При успешно аутентифицированном 3DS liability за fraud-related dispute обычно переходит от merchant к issuer.

Но если клиент заявляет, например, services not received, действует стандартный dispute process. (Stripe Docs)

Поэтому предлагаем использовать 3DS прежде всего для:

* первой карты клиента;
* новой карты;
* первого платежа;
* high-ticket card transaction;
* смены billing party;
* повышенного Radar risk;
* необычных географических сочетаний;
* иных risk signals.

Старое Radar rule:

Request 3D Secure if 3D Secure is supported for card

сейчас обозначено Stripe как deprecated.

Вместо него Stripe предлагает современные custom rules и параметры вроде:

* is_3d_secure;
* is_3d_secure_authenticated;
* has_liability_shift.

Stripe также приводит сценарий, в котором 3DS запрашивается для новых карт. (Stripe Docs)

Мы хотим, чтобы консультант подтвердил оптимальную risk policy: когда 3DS делать обязательным, а когда оставлять risk-based, чтобы не создавать ненужного payment friction.

⸻

## 9. AVS / CVC / Radar

Предлагаем:

**CVC failed** — Block или manual exception.

**AVS / ZIP failed** — Для первого high-value US payment: block; либо manual review.

**AVS unavailable / unchecked** — Не считать автоматически fraud.

Stripe прямо различает failure проверки и ситуацию, когда проверка отсутствует или не поддерживается. Radar способен учитывать риск вместе с CVC/AVS. (Stripe Docs)

**Additional manual risk signals**

* personal email вместо company domain;
* недавно созданный бизнес;
* payer name не соответствует клиенту;
* cardholder не совпадает с authorized signer;
* несколько неудачных карт;
* unusual IP geography;
* rush request;
* unwillingness to sign contract;
* просьба начать работу до оплаты;
* нестандартно крупный advance;
* использование personal bank account для business contract.

Наличие одного такого признака не означает fraud.

Задача — получить cumulative risk score.

⸻

## 10. Contract architecture

Предлагается использовать минимум:

1. **Master Services Agreement — MSA.** Регулирует общие отношения.
2. **Statement of Work — SOW.** Определяет конкретно: service period; scope; deliverables; dependencies; exclusions; approvals; price; Growth Budget; milestones; cancellation; acceptance.
3. **Invoice.** Каждый invoice содержит ссылку на: соответствующий SOW ID; service period; client; billing entity.
4. **Performance Fee Calculation Statement.** Если используется performance fee — отдельный документ.

⸻

## 11. За что именно платит клиент

Мы хотим отказаться от двух крайностей.

**Неправильно №1**: Клиент платит нам за X лидов / Y appointments / ROAS. Если это не отдельное performance agreement, такая формулировка превращает business outcome в contractual delivery requirement.

**Неправильно №2**: Клиент покупает 38 часов работы команды. Тогда спор смещается в область доказательства каждой отработанной минуты.

**Предлагаемая конструкция**

Base Fee оплачивает: professional services; перечисленный scope; agreed deliverables; reserved capacity; project management; analytics; implementation work; agreed service period.

Результаты вроде: leads; appointments; sales; revenue; ROAS — не гарантируются, если это прямо не предусмотрено отдельным agreement.

⸻

## 12. Acceptance + Cure вместо абсолютного Non-Refundable

Мы хотим обсудить отказ от агрессивной конструкции: Strictly Non-Refundable.

Вместо неё предлагаем:

Delivery → Acceptance Period → Written Objection → Opportunity to Cure → Earned Fee / appropriate credit where genuinely unperformed.

Пример экономического принципа:

* выполненная работа не refundable;
* approved deliverables не refundable;
* third-party commitments не refundable;
* фактически начатые и выполненные milestones считаются earned;
* если объективно определённая часть scope вообще не выполнена и не исправлена после cure period — возможен соответствующий credit/refund.

Такой подход представляется нам более сильным в dispute, поскольку merchant не выглядит пытающимся исключить любую ответственность независимо от фактического исполнения.

Хотим получить мнение консультанта.

⸻

## 13. Client dependencies

В digital marketing результат работы часто зависит от клиента.

Примеры: клиент не дал доступ к Meta; не утвердил creatives; не предоставил фотографии; не дал доступ к website; не утвердил offer; заблокировал campaign; не оплатил ad budget; администраторы клиники не отвечали на leads; CRM использовалась неправильно.

Поэтому SOW должен однозначно разделять:

* **CAESTHETIC Deliverables** — то, что обязаны сделать мы.
* **Client Dependencies** — то, без чего выполнение либо результат невозможны.
* **Third-Party Dependencies** — Google, Meta, hosting, software vendors и т. п.

Мы хотим, чтобы client-caused delay: автоматически переносил соответствующий срок; не превращался в non-delivery со стороны CAESTHETIC; фиксировался в Evidence Ledger.

⸻

## 14. Pre-payment client verification

До первого invoice предлагаем собирать: legal business name; DBA; business address; website; corporate email; authorized signer; signer title; подтверждение authority; billing contact; EIN / company information, если оправдано; payment method owner; relationship между payer и contracting company.

Главная цель — избежать ситуации: Договор подписала Jane Smith / ABC Aesthetics LLC, а $7,500 заплатил John Smith с личной карты, после чего John заявил card fraud.

Если payer отличается от contracting party, должно появляться отдельное подтверждение: I authorize this payment on behalf of [Company] for Invoice [X].

⸻

## 15. Electronic signature

MSA/SOW должны подписываться до первого значимого платежа.

Нужно сохранять: подписанный PDF; signer email; timestamp; audit trail; Certificate of Completion; IP, если поставщик подписи его фиксирует; document version; unique agreement ID.

IP рассматриваем как supporting evidence, а не как доказательство личности само по себе.

⸻

## 16. Invoice architecture

Мы предполагаем invoice-first B2B payment flow вместо открытой кнопки: Pay $2,500.

Invoice должен позволять однозначно понять: кто → кому → за что → за какой период → на основании какого SOW платит.

Пример:

```
CAESTHETIC Growth Operations — September 2026

SOW: CAE-ED-2026-09
Service period: Sep 1–30, 2026

Scope includes agreed growth operations, campaign management,
analytics, implementation management and deliverables defined
in SOW CAE-ED-2026-09.
```

Не использовать единственную строку: Marketing Services — $2,500.

⸻

## 17. Statement descriptor

Descriptor должен быть максимально узнаваемым: CAESTHETIC — или максимально близким вариантом, разрешённым Stripe/card networks.

Бренд в: договоре; invoice; email; payment page; receipt; bank statement — должен совпадать настолько, насколько это возможно.

Это снижает категорию: I don't recognize this charge.

⸻

## 18. Evidence Ledger

Это центральный элемент всей системы.

Для каждого клиента и каждого оплачиваемого периода создаётся отдельный: Evidence Bundle.

Пример ID: `EVD-CAE-CLIENT-2026-09`

Он связывается с: Client ID; Contract ID; SOW ID; Invoice ID; Payment ID; Service Period.

Evidence создаётся во время выполнения работы, а не после появления chargeback.

⸻

## 19. Что входит в Evidence Bundle

**Contract evidence** — MSA; SOW; signature certificate; agreement version; authorization.

**Payment evidence** — invoice; receipt; payment method; billing identity; 3DS status; AVS/CVC result; payment timestamp; statement descriptor.

**Service-start evidence** — kickoff meeting; onboarding; предоставленные доступы; initial audit; project activation.

**Delivery evidence** — выполненные deliverables; campaign launches; website changes; dashboards; reports; creatives; approved copy; analytics configuration; implementation records.

**Client-interaction evidence** — approvals; emails; meeting summaries; comments; requests; feedback; acknowledgment.

**Dependency evidence** — что было запрошено у клиента; когда; было ли предоставлено; какие сроки были затронуты.

**Acceptance evidence** — weekly receipt; monthly delivery statement; written approval; отсутствие своевременного objection, если такое договорное правило будет признано допустимым.

⸻

## 20. Weekly Service Receipt

Каждую неделю клиент получает короткое сообщение.

Пример:

```
Services completed this week
- Meta campaign structure approved and launched
- conversion tracking validated
- landing page revision delivered
- reputation workflow implemented

Client dependencies
- awaiting approval of September offer

Next intervention
- lead follow-up analysis
```

Просим сообщить в течение определённого договором срока, если приведённая информация фактически неверна.

Идеальный вариант — клиент нажимает: Approved / Acknowledged

Но даже delivery receipt без активного approval создаёт нормальную хронологию выполнения.

⸻

## 21. Monthly Delivery Statement

До следующего billing period клиент получает документ: Paid period; Scope delivered; Deliverables; Client approvals; Client-side blockers; Metrics; Remaining / carried work; Next billing date; Billing contact.

Цель — чтобы через шесть месяцев клиент не мог правдоподобно заявить: I have no idea what they did.

⸻

## 22. Approvals

Нужно системно сохранять explicit approvals для наиболее спорных вещей: ad budget; campaign launch; creative; offer; landing page; major website change; external contractor; significant Growth Budget expenditure.

Approval может происходить через: клиентский dashboard; email; официальную систему управления проектом.

Критически важные approvals не должны жить исключительно в неструктурированном WhatsApp-чате.

⸻

## 23. Growth Budget

Мы хотим максимально исключить сценарий: CAESTHETIC получает $20,000 на карту, из которых $15,000 затем самостоятельно перечисляет Meta.

Причины: увеличивается contested transaction; CAESTHETIC фактически финансирует third-party media; при полном chargeback можно потерять не только fee, но и уже потраченный ad budget.

Предпочтительная схема: Client → Meta/Google/software/vendor directly.

CAESTHETIC: управляет; согласовывает; контролирует; рекомендует allocation.

Если по конкретному проекту требуется pass-through Growth Budget, нужен отдельный порядок оплаты и юридическая конструкция.

⸻

## 24. Performance Fee

Performance Fee не должен неожиданно появляться внутри обычного recurring charge.

Предлагаем: Measurement period closes → Data reconciled → Calculation Statement → Client receives calculation → Invoice → Payment.

Calculation Statement содержит: baseline; period; data source; agreed exclusions; delta; formula; resulting fee.

Это должно существенно снижать dispute типа: Incorrect amount.

⸻

## 25. Cancellation

Cancellation policy должна быть простой и прозрачной.

Необходимо однозначно определить: notice period; когда прекращаются новые работы; что происходит с текущими milestones; какие fees уже earned; какие внешние commitments остаются обязательными; когда прекращается recurring billing; какие материалы передаются клиенту; что происходит с access.

После cancellation клиент должен получать письменное: Cancellation Confirmation — с последней billing date и final service period.

Это особенно важно для категории: Canceled recurring payment.

⸻

## 26. Complaint-before-chargeback mechanism

Мы хотим предложить клиенту максимально лёгкий способ решить billing problem без банка: billing@caesthetic.com или встроенная кнопка: Billing concern / Request review.

Обращение автоматически получает case ID.

В договоре можно предусмотреть просьбу: Before initiating a payment dispute, contact CAESTHETIC and provide a reasonable opportunity to investigate and cure.

Но мы не хотим формулировать это как незаконный отказ клиента от неотчуждаемых прав.

Просим консультанта определить допустимую формулировку.

⸻

## 27. Early dispute prevention

Не каждый конфликт нужно доводить до chargeback.

Если клиент: явно сообщает о неудовлетворённости; угрожает спором; требует отмены; перестал отвечать сразу после оплаты; отказывается предоставлять необходимые доступы; оспаривает размер invoice — создаётся: Payment Risk Case.

Далее account manager должен: 1) зафиксировать ситуацию; 2) собрать текущий evidence; 3) остановить новые discretionary commitments; 4) связаться с клиентом; 5) предложить cure; 6) при необходимости согласовать partial credit/refund; 7) получить письменное закрытие вопроса.

⸻

## 28. Stripe inquiries / early warnings

Stripe может присылать pre-dispute inquiries и Early Fraud Warnings.

Их нельзя оставлять без владельца процесса.

Stripe прямо предупреждает, что отсутствие ответа на inquiry в определённых случаях может привести к chargeback, который будет существенно труднее или невозможно выиграть. (Stripe Docs)

Поэтому нужен автоматический alert: Inquiry / EFW / Dispute → Finance + Account Owner + Risk Owner.

⸻

## 29. SOP при возникновении карточного dispute

**T0 — обнаружение.** Система получает Stripe notification/webhook. Создаётся: `DISPUTE-{ID}`.

Немедленно сохраняем: payment; invoice; customer; reason code; dispute amount; evidence deadline; Stripe risk data; 3DS; AVS/CVC; текущий Evidence Bundle.

**T0–4 часа — классификация.** Определяем: Fraudulent; Not received; Not as described; Canceled; Duplicate; Incorrect amount; Credit not processed; другое. Не используем generic evidence packet для всех случаев.

**День 1 — business review.** Account owner отвечает: что продавалось; что выполнено; что получил клиент; были ли complaints; были ли blockers; какие approvals есть; что является strongest evidence.

**День 1–2 — contact customer.** Если целесообразно: «We received a payment dispute regarding Invoice X. We want to understand whether this was filed intentionally or because the transaction was not recognized.» Не давить. Не просить клиента давать ложные показания. Не обещать что-то, что противоречит подаваемому evidence.

**День 2 — decision.**

*Accept*, если: мы действительно ошиблись; payment duplicate; service объективно не была оказана; refund был обещан; evidence крайне слабое; оспаривание экономически или репутационно неразумно.

*Contest*, если: transaction legitimate; scope определён; delivery доказана; evidence strong; claim materially false.

**День 2–3 — evidence packet.** Evidence должен отвечать точно reason code. Не отправлять 150 страниц Slack history.

Нужен короткий narrative: What was purchased → Who purchased it → How payment was authorized → What was delivered → When → How client received/approved it → Why the specific claim is inaccurate.

⸻

## 30. Dispute matrix

| Dispute | Основные evidence |
|---|---|
| Fraudulent | 3DS, liability shift, signer, payer authorization, AVS/CVC, billing details, IP, prior undisputed relationship |
| Unrecognized | recognizable descriptor, invoice, receipt, emails, contract |
| Services not received | SOW, kickoff, deliverables, campaign logs, URLs, emails, weekly receipts |
| Not as described | original scope, offer snapshot, deliverables, approvals, cure history |
| Unacceptable | defined deliverables, performance disclaimer, work product, approvals, complaints and cure |
| Canceled recurring | cancellation policy, date notice received, cancellation confirmation, exact billed service period |
| Incorrect amount | signed SOW, invoice breakdown, calculation statement |
| Duplicate | separate invoice/service periods or evidence of refund |
| Credit not processed | refund record or evidence explaining why no credit was due |

⸻

## 31. Особенность marketing services

Нельзя строить защиту только вокруг: We never guaranteed results. Это защищает только часть аргумента.

Если клиент заявляет: Services not received — нам нужно доказать фактическую delivery.

Если клиент заявляет: Not as described — нам нужно сопоставить: promised scope ↔ actual work.

Поэтому центральное доказательство для CAESTHETIC — не disclaimer.

Центральное доказательство: SOW + contemporaneous delivery records + client acknowledgment.

⸻

## 32. Screenshots и доказательства

Для digital marketing screenshots полезны, но их следует использовать как supporting evidence.

Более сильный набор: URL; publication timestamp; platform event; campaign ID; change log; analytics event; exported report; client approval; timestamped PDF snapshot.

Там, где возможно, предпочтительны system-generated records, а не вручную созданный screenshot после появления dispute.

⸻

## 33. Patient data / healthcare boundary

Поскольку наши клиенты — медицинские практики, Evidence Ledger может потенциально затронуть: patient names; phone numbers; appointment information; lead content; clinical information.

Мы предлагаем жёсткое правило: Stripe metadata и chargeback evidence не должны использоваться как хранилище patient data.

При доказательстве performance или delivery: aggregate; redact; anonymize; использовать campaign-level и service-level evidence.

Не передавать банку пациента вместе с его медицинской информацией только ради доказательства того, что marketing campaign работала.

Хотим отдельно получить от консультанта рекомендации по HIPAA/privacy boundary, retention и допустимым evidence.

⸻

## 34. Metadata

Stripe metadata предлагаем использовать только как индексы: client_id; contract_id; sow_id; invoice_id; service_period; evidence_bundle_id; risk_case_id.

Не помещать туда: весь договор; patient data; медицинские сведения; card data; лишние PII.

⸻

## 35. Internal risk scoring

Предлагаем каждому новому клиенту присваивать:

**Green** — established clinic; corporate email; authorized signer; business bank account; full contract; normal behavior.

**Yellow** — personal card; payer ≠ signer; new business; Gmail; unusual rush; incomplete business information. Требуется дополнительная проверка / bank payment / 3DS.

**Red** — отказывается подписывать SOW; identity mismatch; high-risk Stripe signals; несколько failed payment methods; просьба намеренно указать другое назначение платежа; подозрительные документы; предыдущий unresolved chargeback. Не начинать работу без risk approval.

⸻

## 36. Reserve policy

Так как даже хороший dispute можно проиграть, chargeback risk должен рассматриваться и как treasury risk.

Предлагаем определить: внутренний dispute reserve; maximum card exposure per client; maximum outstanding Growth Budget; лимит third-party commitments до окончательного settlement; правила для unusually large invoice.

Цель — один chargeback не должен создавать cash-flow problem.

⸻

## 37. Metrics

Каждый месяц отслеживать:

**Payment mix** — % bank transfer; % ACH; % card.

**Dispute rate** — count; amount; % transactions.

**Reason codes** — Fraud; Not received; Not as described; Canceled; etc.

**Prevention metrics** — inquiries resolved; billing complaints resolved before dispute; client recognition incidents.

**Evidence metrics** — % periods with complete evidence bundle; % weekly receipts delivered; % critical approvals documented.

**Outcomes** — won; lost; accepted; recovered directly.

⸻

## 38. Главные принципы предлагаемой системы

1. Не принимать крупную оплату раньше договора.
2. Не смешивать Base Fee, Growth Budget и Performance Fee в непонятный единый charge.
3. Не гарантировать KPI там, где клиент покупает professional services.
4. Не считать "Non-Refundable" основной защитой.
5. Использовать acceptance + cure + earned fee architecture.
6. Push bank payment предпочтителен для крупных/первых payments.
7. ACH — инструмент, а не абсолютная защита.
8. 3DS — защита прежде всего от fraud, а не non-delivery.
9. Evidence создаётся ежедневно в процессе работы.
10. Каждому charge соответствует SOW и service period.
11. Client dependencies документируются.
12. Patient information не используется как обычное chargeback evidence.

⸻

## 39. Что мы хотим получить от консультанта

Просим не просто оценить отдельные Stripe settings, а проверить всю систему как единый механизм.

### Contract

1. Какая governing law / venue наиболее разумна для B2B US clients?
2. Как лучше определить Base Fee: retainer, subscription, recurring professional service fee или иной термин?
3. Как сформулировать absence of KPI guarantee без чрезмерного disclaimer?
4. Как юридически правильно реализовать Acceptance Period?
5. Какой Cure Period разумен?
6. Можно ли считать fee earned после выполнения milestones?
7. Как сформулировать refund policy, которая защищает нас, но не выглядит unconscionable?
8. Имеет ли смысл obligation to contact merchant before chargeback и в какой форме?
9. Как доказать authority лица, подписавшего договор от имени clinic?
10. Нужен ли отдельный cardholder authorization, если payer ≠ signer?

### Payment rails

11. Какой rail вы считаете наиболее безопасным для первого $2,500–$10,000 B2B payment?
12. Что предпочтительнее: ACH credit / bank transfer / domestic wire / ACH Direct Debit?
13. Каков реальный dispute/return risk каждого из них?
14. Как следует интерпретировать текущую Stripe documentation по ACH Direct Debit, где одновременно говорится о final/uncontestable ACH disputes и предоставляется evidence workflow? (Stripe Docs)
15. Нужно ли различать personal и business bank account на уровне policy?

### Cards

16. Требовать ли 3DS для каждой первой карты?
17. Требовать ли 3DS для каждого платежа >$2,000?
18. Когда card without liability shift следует отклонять полностью, а когда достаточно manual review?
19. Какие AVS/CVC rules оптимальны для US B2B?
20. Насколько полезны Visa Compelling Evidence / prior undisputed transaction patterns именно для нашего business model?

### Evidence

21. Какие три-пять evidence являются самыми сильными для digital marketing services?
22. Насколько весом explicit client acceptance?
23. Насколько весом weekly service acknowledgment?
24. Следует ли хранить snapshots предложения/website на дату покупки?
25. Какой retention period установить?
26. Какие evidence не стоит подавать issuer, даже если они имеются?

### Medical/privacy

27. Какие HIPAA/privacy ограничения следует учитывать при подготовке dispute evidence?
28. Какие маркетинговые данные можно использовать после redaction?
29. Где проходит граница между business lead information и protected patient information?

### Chargeback SOP

30. Когда лучше самостоятельно вернуть деньги, а когда contest?
31. Нужна ли обязательная legal review для disputes выше определённой суммы?
32. Имеет ли смысл direct settlement agreement с клиентом после появления chargeback?
33. Какие действия могут ухудшить нашу позицию после открытия dispute?

⸻

## 40. Желаемый итог консультации

Мы хотим получить от консультанта не общие рекомендации, а утверждённую архитектуру:

**A. Contract package** — MSA clauses; SOW language; cancellation; acceptance; cure; refund; performance disclaimer; payer authorization.

**B. Payment Policy** — отдельно: first payment; recurring; high-ticket; Growth Budget; Performance Fee.

**C. Stripe/Radar Policy** — 3DS; AVS; CVC; Radar; manual review; alerts.

**D. Evidence Standard** — Что обязаны сохранять по каждому месяцу.

**E. Dispute SOP** — Кто, что и в какой срок делает после: inquiry; EFW; chargeback.

**F. Healthcare Privacy Standard** — Какие данные категорически нельзя использовать в payment/evidence infrastructure.

⸻

## 41. Наше предварительное целевое решение

До получения заключения консультанта мы видим целевую систему следующим образом:

```
New Client
→ Business Verification
→ MSA + SOW
→ Authorized Signer
→ Invoice
→ Bank Transfer preferred

Если bank transfer неудобен:
Verified Business Account
→ ACH Mandate
→ ACH Direct Debit

Если клиент выбирает card:
Card
→ AVS/CVC
→ Radar
→ 3DS / Risk Review
→ Payment

После payment:
Kickoff
→ Work
→ Evidence Ledger
→ Weekly Service Receipt
→ Client Approvals
→ Monthly Delivery Statement

При проблеме:
Complaint
→ Case
→ Cure / Resolution

При dispute:
Stripe Alert
→ Reason Classification
→ Evidence Bundle
→ Accept or Contest
→ Reason-specific Submission
→ Outcome Analysis
```

⸻

## Главная идея

Мы хотим построить не «набор хитростей против chargebacks», а бизнес-процесс, при котором возникновение необоснованного dispute становится исключением, а не операционным хаосом.

Главный актив системы — не Radar rule и не фраза Non-Refundable.

Главный актив: непрерывная доказуемая цепочка от осознанной покупки до фактически выполненной услуги.

Именно эту архитектуру мы просим консультанта проверить, скорректировать и юридически/платёжно валидировать до внедрения.
