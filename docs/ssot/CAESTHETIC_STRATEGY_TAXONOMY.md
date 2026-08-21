---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-20
updated: 2026-08-20
authority: DEC-846
scope: information architecture and classification of the CAESTHETIC strategy
parent: docs/ssot/CAESTHETIC_ACQUISITION_DIAGNOSTIC_GROWTH_CONTROL_SYSTEM.md
project_master: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_LAUNCH_PRIORITIES.md
---

# CAESTHETIC Strategy Taxonomy

> Каноническая структура, по которой команда раскладывает стратегию, задачи и визуальную карту системы.

Этот документ **не создаёт новую конкурирующую стратегию** и не заменяет продуктовые, channel или runtime SSOT. Он определяет, к какой категории относится каждый объект и как показывать связи между объектами.

Порядок запуска категорий, first cohort, Wave approval и намеренно отложенные элементы определяет `docs/ssot/CAESTHETIC_LAUNCH_PRIORITIES.md`.

---

# 1. Три этажа системы

```text
┌──────────────────────────────────────────────┐
│ ЭТАЖ 1. ЧТО МЫ СТРОИМ И ЧЕМ РАБОТАЕМ        │
│                                              │
│ Products → Audiences & Data → Tools          │
│                              → Materials      │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ ЭТАЖ 2. КАК МЫ ПОЛУЧАЕМ КЛИЕНТОВ             │
│                                              │
│ Signals → Mechanics → Channels → Funnels     │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ ЭТАЖ 3. КАК МЫ ЭТИМ УПРАВЛЯЕМ                │
│                                              │
│ Processes → Governance                       │
│              roles / rules / metrics / gates │
└──────────────────────────────────────────────┘
```

Канонические десять категорий:

```text
1. PRODUCTS
2. AUDIENCES & DATA
3. TOOLS & INFRASTRUCTURE
4. MATERIALS & ASSETS
5. SIGNALS
6. PROMOTION MECHANICS
7. CHANNELS
8. FUNNELS
9. PROCESSES
10. GOVERNANCE
```

---

# 2. Главное правило классификации

Каждый объект получает **одну первичную категорию**.

Он может быть связан с другими категориями, но нельзя использовать одно слово в разных смыслах без явной связи.

Например:

```text
Instantly
= TOOL

Cold Email
= CHANNEL

Signal-Based Outreach
= MECHANIC

Email sequence
= MATERIAL

Email → Growth Score → Sprint
= FUNNEL

Email verification / sending / reply handling
= PROCESS

Send limits / suppression / owner / KPI
= GOVERNANCE
```

Если объект выполняет несколько функций, фиксируется:

```text
PRIMARY CATEGORY
+ RELATED CATEGORIES
```

Пример:

```text
CITY CHECK
Primary: MECHANIC
Related: MATERIALS, CHANNELS, FUNNELS, PROCESSES
```

---

# 3. PRODUCTS — что мы продвигаем и продаём

В этой категории находятся только клиентские продукты и коммерческие уровни.

## CAESTHETIC products

```text
FREE GROWTH SCORE
↓
30-DAY GROWTH SPRINT — $2,500
↓
OPTIONAL GROWTH SYSTEM
```

## Для каждого продукта фиксируется

- ICP / decision-maker;
- обещанный результат;
- состав deliverable;
- цена или принцип цены;
- entry condition;
- следующий шаг;
- exclusions;
- owner;
- proof / evidence boundary.

## Не относится к Products

- Instantly;
- Instagram;
- Reel;
- email template;
- CITY CHECK;
- Meta Ad Library;
- Growth Score production workflow.

## Важные продуктовые границы

- Growth Score — публичный entry product.
- Sprint не является cold first-touch offer.
- Growth System не продаётся до Day-30 evidence.
- CRM, telephony, reception, chatbots, hiring, training и call QA не являются отдельными public entry products; они возможны как later interventions против verified constraint.

---

# 4. AUDIENCES & DATA — кому мы продвигаемся и какие данные о них имеем

Эта категория отвечает на вопрос:

> Кто является потенциальным клиентом, партнёром или first-party lead?

## Основные аудитории

- independent US aesthetic practices;
- owner / founder;
- Medical Director;
- Practice Manager;
- Director of Operations;
- device reps;
- injectables/product reps;
- trainers / academies;
- EHR / booking / financing vendors;
- existing clients;
- referred owners;
- event attendees / speakers;
- first-party Score leads.

## Текущий candidate universe

- 1,441 candidate accounts;
- далее AI qualification;
- FINAL CURRENT без заранее заданного количества;
- execution только через immutable release / approved wave.

## Состояния данных

```text
Candidate
→ Qualified
→ Tier A / B / C
→ Research
OR Reject / Suppress / Route Elsewhere
```

## Обязательные объекты/поля

- account_id;
- contact_id;
- practice name;
- city/state/country;
- website;
- owner / decision-maker;
- Instagram / LinkedIn / email;
- source;
- qualification evidence/confidence;
- signal;
- tier;
- suppression / DNC;
- last touch;
- current narrative;
- next action.

## Не относится к Audiences & Data

- Email как канал;
- Instagram как канал;
- Growth Score как продукт;
- Meta Ad Library как сервис/source;
- Tiering algorithm как process/governance.

---

# 5. TOOLS & INFRASTRUCTURE — что нужно иметь для работы

Эта категория отвечает на вопрос:

> Какие аккаунты, сайты, сервисы, хранилища и технические контуры позволяют системе работать?

## Accounts / surfaces

- `@caesthetic.growth`;
- authorised LinkedIn profiles;
- sending email inboxes;
- Meta Business / Ads account;
- Google Ads account;
- domains;
- `caesthetic.com`;
- Stripe account;
- analytics accounts.

## Services / software

- Instantly;
- EmailVerifier;
- Dolphin / Social Control Plane;
- ManyChat;
- Apify;
- Supabase;
- Asana;
- Stripe;
- GA4 / PostHog or current analytics adapter;
- Local Falcon / BrightLocal when justified;
- PageSpeed / Lighthouse;
- Kling / ElevenLabs / HeyGen under production canon;
- Dropbox;
- GitHub.

## Storage / system-of-record infrastructure

- Git SSOT;
- VDS master companies / contacts;
- Dropbox immutable releases;
- `CURRENT.json`;
- suppression registry;
- Growth Score cases;
- Growth Ledger / Impact Ledger;
- Evidence Bank;
- analytics event store.

## Optional adapters

- Clay;
- n8n;
- Airtable;
- Pipedrive.

Они не становятся обязательными masters автоматически. Подключаются только при доказанном capability gap.

## Важные различия

```text
Meta Ad Library
= TOOL / SIGNAL SOURCE
не promotion channel

Google Maps data
= TOOL / DATA SOURCE для discovery и diagnosis

Google Search
= CHANNEL, когда пользователь приходит из поиска
```

---

# 6. MATERIALS & ASSETS — что аудитория видит, читает или получает

Эта категория отвечает на вопрос:

> Какие конкретные материалы доставляют позиционирование, evidence и CTA?

## Public materials

- homepage;
- `/growth-score/`;
- `/sprint/`;
- `/growth-system/`;
- pinned Instagram posts;
- Reels;
- Stories;
- carousels;
- LinkedIn posts/documents;
- SEO articles;
- CITY CHECK publication;
- FAQ;
- partner brief;
- newsletter;
- webinar/checklist;
- paid creative.

## Personal / client materials

- completed Growth Score;
- private owner cockpit;
- 3–8 minute walkthrough;
- Sprint proposal / scope;
- Day-30 report;
- Client Growth Statement;
- Impact report.

## Internal materials

- email sequences;
- outreach copy library;
- reply playbook;
- signal library;
- owner question bank;
- Creative Pattern Library / existing reference systems;
- research pack;
- screenshots;
- evidence manifests;
- content briefs;
- Growth Score templates.

## Important classifications

```text
Growth Score
Primary: PRODUCT
Delivered report/cockpit/walkthrough: MATERIALS

Evidence Bank
Primary: TOOL / INFRASTRUCTURE
Its publishable evidence units: MATERIALS / EVIDENCE ASSETS
```

---

# 7. SIGNALS — почему конкретный account интересен сейчас

Эта категория отвечает на вопрос:

> Почему мы должны смотреть на эту practice и активировать её именно сейчас?

## Canonical signals

- Active Meta Ads;
- visible Google Ads;
- new device;
- new provider / injector;
- new location;
- new service / procedure;
- hiring front desk / operations;
- hiring provider;
- new website;
- new owner / manager;
- expanded hours;
- content acceleration;
- review acceleration;
- competitor review acceleration;
- competitor new location/service;
- event attendance / speaking;
- partner introduction;
- follow-back / inbound engagement;
- Score form start / first-party intent.

## Signal sources

- Meta Ad Library;
- Google Maps / Search;
- Instagram;
- LinkedIn / Sales Navigator;
- website;
- job boards;
- event programs/posts;
- partner/referral context;
- first-party analytics.

## Critical distinction

```text
SIGNAL
= почему обращаться сейчас

LEAK / GAP
= возможная проблема

BINDING CONSTRAINT
= что надо исправлять первым
```

До запроса Free Growth Score система массово ищет **signals**, а не выполняет дорогую персональную диагностику leaks.

---

# 8. PROMOTION MECHANICS — как мы используем данные и каналы

Механика — это повторяемый способ привлечь внимание или получить permission.

## Canonical mechanics

### Signal-Based Outreach

```text
Qualified account
→ current signal
→ contextual message
→ Free Growth Score
```

### Instagram Warming

```text
Story view
→ profile open
→ limited like / scarce follow / approved comment
→ familiarity
→ email or inbound
```

### Partner Growth Score

```text
Partner
→ useful insight
→ complimentary independent Growth Score for a practice
→ warm introduction
```

### Client Referral

```text
Verified value
→ referral request
→ owner introduction
→ Growth Score
```

### Event-Based ABM

```text
Event signal
→ attendee / speaker / exhibitor
→ contextual outreach
→ Growth Score
```

### CITY CHECK

```text
Market research
→ qualification/signals
→ outreach
→ requested Scores
→ aggregate learning
→ publication/reuse
```

### Evidence-to-Content

```text
Score / Sprint evidence
→ Evidence Bank
→ Reel / Story / LinkedIn / SEO / email / partner brief
```

### Retargeting

```text
First-party visitor / Score lead
→ paid reminder / evidence content
→ return to Score funnel
```

## Important classification

`CITY CHECK` is primarily a **mechanic / work package**, not a channel.

---

# 9. CHANNELS — где находим аудиторию и доставляем сообщение

Канал отвечает на вопрос:

> Через какую внешнюю поверхность человек получает сообщение или приходит к нам?

## Outbound channels

- Cold Email;
- Instagram;
- LinkedIn;
- partner outreach;
- event outreach;
- selected Facebook context where approved.

## Inbound channels

- website;
- organic Google Search;
- Instagram content;
- LinkedIn content;
- referrals;
- partner introductions;
- ManyChat inbound;
- newsletter;
- event-generated inbound.

## Paid channels

- Google Search Ads;
- Meta B2B ads;
- Meta retargeting;
- evidence/CITY CHECK amplification.

## Supporting / contextual channels

- Facebook;
- WhatsApp;
- Telegram;
- calls after interest / Score;
- no cold SMS/autodialer in MVP.

## One-account rule

```text
Email + Instagram + LinkedIn
≠ three independent campaigns

ONE ACCOUNT
→ ONE REASON FOR RELEVANCE
→ ONE OPENING NARRATIVE
→ coordinated channel touches
```

---

# 10. FUNNELS — откуда человек пришёл и куда его ведём

Воронка — последовательность переходов между состояниями и продуктами.

## Master funnel

```text
Traffic / Outreach / Referral
↓
Interest / Permission
↓
Free Growth Score Request
↓
Growth Score
↓
3–8 minute Walkthrough
↓
“Should we fix this?”
↓
$2,500 Sprint
↓
Adoption
↓
Verified Impact
↓
Optional Growth System
```

## Email funnel

```text
IG familiarity where eligible
→ Email 1
→ Email 2
→ Email 3
→ Score request
```

## Instagram funnel

```text
Warming / Story / Reel / Carousel
→ profile
→ pins / Highlights / bio
→ link or ManyChat
→ Growth Score
```

## Partner funnel

```text
Partner
→ Partner Growth Score proposition
→ warm introduction
→ Score
→ Sprint if justified
```

## Referral funnel

```text
Verified client value
→ referral ask
→ owner intro
→ Score
```

## Search funnel

```text
Google query / ad
→ article or landing
→ Growth Score
```

## CITY CHECK funnel contribution

CITY CHECK does not replace the master funnel. It feeds awareness, credibility, outreach context and Score requests into it.

---

# 11. PROCESSES — как работа выполняется регулярно

Процесс отвечает на вопрос:

> Какие повторяемые действия превращают стратегию в исполнение?

## Core operating processes

- candidate ingest;
- deduplication / identity resolution;
- AI qualification;
- signal detection / refresh;
- tier assignment;
- owner/contact enrichment;
- email verification;
- immutable release / CURRENT / wave preparation;
- suppression/conflict check;
- email activation;
- Instagram warming;
- LinkedIn research/touch where approved;
- reply classification and stop-on-reply;
- Growth Score intake;
- Score research pack;
- human diagnostic approval;
- walkthrough production;
- Sprint onboarding;
- intervention execution;
- adoption verification;
- Impact verification;
- Evidence Bank capture/promotion/reuse;
- content production/distribution;
- weekly review.

## Weekly rhythm

```text
MONDAY
qualification + signals + tiers

TUESDAY
owner/email enrichment + verification + preparation

WEDNESDAY–THURSDAY
activation + replies + Score production + commercial decisions

FRIDAY
pipeline + signal/channel performance + capacity + SCALE/CHANGE/STOP
```

## Process quality rule

Every production process should have:

- named owner;
- trigger;
- required inputs;
- output;
- SLA where justified;
- Definition of Done;
- failure/stop condition;
- audit evidence.

---

# 12. GOVERNANCE — кто отвечает, какие правила действуют и как измеряем

Governance объединяет четыре связанные области:

```text
ROLES
+ RULES
+ METRICS
+ STAGE GATES
```

## Roles

Operating model:

```text
1 human operator
+ AI
+ services
+ bounded freelancers
```

Human owns:

- substantive replies;
- final Growth Score judgement;
- binding constraint;
- priority decision;
- pricing/commercial decision;
- Sprint decision;
- key partner relationship;
- Verified Impact.

AI owns/prepares:

- qualification;
- enrichment;
- signals;
- tiers;
- drafts;
- reply classification;
- Score research pack;
- analytics;
- experiment proposals.

Freelancers receive narrow exception packets:

- deliverability;
- ambiguous data verification;
- production engineering;
- web/analytics implementation;
- legal review;
- design/video templates.

## Rules

- no prospect-specific mini-audit before explicit Score request;
- `1-Minute Leak` is not a product/stage;
- cold Instagram DM OFF;
- candidate pool is not execution authority;
- CURRENT only through immutable release and approved wave;
- one account = one opening narrative;
- global suppression across channels/projects;
- no fabricated evidence or revenue-loss claims;
- Signal ≠ Leak ≠ Constraint;
- human final diagnostic/constraint/impact approval;
- fail closed;
- no public internal-operations catalogue before evidence;
- do not scale nine markets simultaneously.

## Metrics

North Star:

> **Paid Sprints per 100 activated qualified accounts.**

Supporting metrics:

- qualified accounts;
- A/B/C/Research distribution;
- activated accounts;
- verified emails;
- positive replies;
- Score requests;
- Scores delivered;
- qualified dialogues;
- Sprint opportunities;
- paid Sprints;
- Score→Sprint;
- channel assist;
- best signal / best market;
- human hours per Score;
- human minutes per qualified dialogue;
- suppression failures;
- runtime blocks;
- adoption / impact;
- evidence reuse.

## Stage gates

```text
Qualification Ready
→ Activation Ready
→ Conversion Ready
→ Pilot Passed
→ Scale
```

Current preferred Pilot Passed evidence:

```text
≥5 human-approved Growth Scores
≥3 qualified dialogues
≥1 paid Sprint
measured Score production hours
0 wrong-release execution
0 suppression failures
```

---

# 13. Cross-category examples

## Example A — Cold Email

```text
TOOL        Instantly
DATA        qualified account + verified owner email
SIGNAL      new provider
MECHANIC    Signal-Based Outreach
CHANNEL     Cold Email
MATERIAL    three-touch email sequence
FUNNEL      Email → Score request → Score → Sprint
PROCESS     verify → suppress → send → stop on reply
GOVERNANCE  limits, claims, DNC, owner, KPI
```

## Example B — Instagram inbound

```text
TOOL        ManyChat + Instagram + lookup service
DATA        commenter / username / role match
SIGNAL      comment / reply / follow-back
MECHANIC    Comment → Context DM → Role Qualification
CHANNEL     Instagram inbound
MATERIAL    response script + FAQ
FUNNEL      Comment → Owner identified → Growth Score
PROCESS     ack → DM → classify → route → human handoff
GOVERNANCE  no cold DM, no PHI, no diagnosis by bot
```

## Example C — CITY CHECK

```text
DATA        city account set + market evidence
TOOLS       Maps / Meta Ad Library / web / social sources
SIGNALS     ads, capacity, competitor moves, hiring
MECHANIC    CITY CHECK
MATERIALS   report, Reel, carousel, LinkedIn document, article
CHANNELS    email, IG, LinkedIn, SEO, partners, paid later
FUNNEL      awareness/outreach → Score request
PROCESS     research → qualify → activate → requested Scores → publish
GOVERNANCE  anonymize by default, pipeline value over views
```

## Example D — Growth Score

```text
PRODUCT     Free Growth Score
TOOLS       Growth Score runtime / Supabase / evidence sources
DATA        requested practice information + 4444 evidence
MATERIALS   owner cockpit + walkthrough
CHANNELS    received via website/email/IG/partner/search
FUNNEL      request → Score → Sprint
PROCESS     research → draft → human approval → delivery
GOVERNANCE  evidence labels, Top 3, Do Not Fund, no unsupported claims
```

---

# 14. How to use this taxonomy in tasks and visual maps

Every strategic task or card should include:

```text
Primary Category
Object / Deliverable
Why it exists
Related funnel
Owner
Status
Source of Truth
Next action
Definition of Done
```

Recommended category labels:

```text
PRODUCT
AUDIENCE_DATA
TOOL_INFRA
MATERIAL
SIGNAL
MECHANIC
CHANNEL
FUNNEL
PROCESS
GOVERNANCE
```

Recommended visual reading order:

```text
PRODUCTS
   ↑
FUNNELS ← CHANNELS ← MECHANICS ← SIGNALS ← AUDIENCES
   │
   ├── supported by MATERIALS
   ├── executed through TOOLS
   ├── repeated through PROCESSES
   └── controlled by GOVERNANCE
```

---

# 15. Canonical short rule

> **Продукт — что продаём. Аудитория — кому. Инструмент — чем работаем. Материал — что показываем. Сигнал — почему сейчас. Механика — как привлекаем. Канал — где доставляем. Воронка — куда ведём. Процесс — как выполняем. Governance — кто отвечает, по каким правилам и как понимаем, что система работает.**
