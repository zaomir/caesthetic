---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-21
updated: 2026-08-21
authority: DEC-847
scope: first-lead funnel, stage tooling, account/service audit, launch readiness and ownership allocation
parents:
  - docs/ssot/CAESTHETIC_ACQUISITION_DIAGNOSTIC_GROWTH_CONTROL_SYSTEM.md
  - docs/ssot/CAESTHETIC_STRATEGY_TAXONOMY.md
project_master: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_EMAIL_TO_IG.md
  - docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
  - docs/ssot/CAESTHETIC_IG_LOOKUP.md
  - docs/ssot/CAESTHETIC_IG_COMMENT_INBOUND_ROUTING.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md
  - docs/ssot/CAESTHETIC_EVIDENCE_BANK.md
  - docs/projects/caesthetic/PROJECT_STATUS.md
  - docs/projects/caesthetic/operations/first-lead/README.md
  - docs/copy/caesthetic/en/first-lead/email-3touch.md
---

# CAESTHETIC — Funnel, Tooling & First-Lead Readiness

> Куда ведём prospect по воронке, какие инструменты нужны на каждом переходе, что уже готово, что требует live verification и кто закрывает каждый пробел.

Этот SSOT — операционный companion к общей acquisition-архитектуре. Он не создаёт новый продукт и не меняет решение DEC-845: до явного запроса Free Growth Score не делается персональный mini-audit / `1-Minute Leak` / deep 4444 diagnosis.

---

# 1. Единая master funnel

Все быстрые первые каналы сходятся в один продукт и одну воронку:

```text
QUALIFIED ACCOUNT / WARM INTRO / CONTENT VISITOR
                         ↓
              COORDINATED TRUST SURFACES
            Email + Instagram + LinkedIn + Site
                         ↓
               FREE GROWTH SCORE REQUEST
                         ↓
                 LEAD RECEIPT / TRIAGE
                         ↓
                  AI RESEARCH PACK
                         ↓
             HUMAN-APPROVED GROWTH SCORE
                         ↓
          PRIVATE /score/ PAGE + 4–6m WALKTHROUGH
                         ↓
                   SHOULD WE FIX THIS?
                         ↓
                WRITTEN SPRINT SCOPE
                         ↓
                  $2,500 PAYMENT
                         ↓
                  30-DAY SPRINT
                         ↓
              ADOPTION / VERIFIED IMPACT
                         ↓
          EVIDENCE BANK / REFERRAL / NURTURE
                         ↺
```

Правило:

> **Канал меняет источник и контекст входа, но не создаёт собственный продукт.**

Cold Email, Instagram, LinkedIn, Partners, Referrals, Events, Search и Paid ведут прежде всего к `/growth-score/` либо к human-controlled Score conversation, которая заканчивается тем же intake.

---

# 2. Четыре быстрых канала и куда они ведут

## 2.1 Cold Email

```text
Qualified Tier A/B account
→ verified owner/practice email
→ Instantly 3-touch sequence
→ `/growth-score/?utm_source=cold_email...`
→ Score request
```

Инструменты:
- canonical account/contact masters;
- EmailVerifier;
- secondary sending domains/inboxes;
- Instantly;
- suppression/conflict gate;
- UTM convention;
- reply inbox / named human owner.

Материалы:
- signal/context opening library;
- 3-touch sequence;
- reply playbook;
- Growth Score explainer link;
- not-now / wrong-person / unsubscribe responses.

## 2.2 Instagram

```text
Story/profile touch OR Reel/Story/Carousel discovery
→ `@caesthetic.growth` trust check
→ bio/pins/Highlights
→ link in bio OR inbound comment/DM
→ `/growth-score/` or ManyChat route
→ Score request
```

Инструменты:
- live `@caesthetic.growth` account;
- Dolphin / Social Control for permitted low-risk actions;
- Instagram app / Meta Business Suite for manual publish fallback;
- ManyChat for inbound routing;
- exact-match lookup endpoint;
- tagged Growth Score bio link.

Материалы:
- 3 canonical pins;
- owner-facing bio;
- START/SCORE Highlights;
- weekday Stories;
- evidence/framework Reels and carousels;
- comment/reply scripts.

Cold DM remains OFF.

## 2.3 LinkedIn ABM

```text
Qualified account
→ owner/decision-maker identified
→ profile view / relevant professional touch
→ Valerie/CAESTHETIC authority check
→ Growth Score invitation
→ `/growth-score/`
```

Инструменты:
- canonical Valerie LinkedIn surface;
- Sales Navigator optional for research/saved signals;
- account/contact identity matching;
- social write controls / human approval.

Материалы:
- aligned headline/About/Experience/Featured;
- 3–5 authority posts/documents;
- contextual connection/follow-up scripts;
- Growth Score explainer.

## 2.4 Partners / Referrals

```text
Device rep / trainer / vendor / client
→ Partner Growth Score or referral message
→ warm introduction
→ `/growth-score/`
→ Score request
```

Инструменты:
- partner/contact list;
- email and LinkedIn;
- account/source tracking;
- simple partner pipeline in masters/Asana.

Материалы:
- Partner Growth Score one-pager;
- first partner approach;
- forwardable intro template;
- client referral request;
- CITY CHECK / Four Surfaces asset.

---

# 3. Funnel stage → required tools

| Funnel stage | Required tools | Required output | Launch status rule |
|---|---|---|---|
| Account qualification | masters, AI, public sources, optional Apify | A/B/C/R/Reject + source/confidence | No activation from unqualified candidate data |
| Signal/timing | AI signal scanner, Maps/Meta/website/social sources | current signal + date + source | Signal is not diagnosis |
| Email activation | EmailVerifier, sending inboxes, Instantly, suppression | delivered sequence / reply | No send before deliverability GO |
| Instagram familiarity | IG account, CURRENT release, Dolphin/manual app | permitted touch / trust content | Candidate pool is not write authority |
| LinkedIn reinforcement | LinkedIn profile, optional Sales Navigator | role validation / professional touch | Public profile must support CAESTHETIC narrative |
| Partner/referral | email/LinkedIn, partner list | warm introduction | No unapproved revenue-share promises |
| Score intake | website `/growth-score/`, Supabase function | lead ID + UTM/referrer | Required fields saved before optional context |
| Lead notification | Resend internal receipt, Telegram, Asana/manual queue | named owner + next action | Form success is not enough without ownership |
| Score production | AI research pack, Growth Score engine, evidence schema | draft report | Deep diagnosis begins only after request |
| Score approval | named human reviewer | final constraint / Top 3 / Do Not Fund | AI cannot finalise binding constraint |
| Score delivery | private `/score/<slug>/`, recorder | 4–6m walkthrough + written link | Delivery capacity must be capped |
| Sprint conversion | `/sprint/`, written scope/SOW, Stripe | accepted scope + payment | Mailto alone is not completed checkout |
| Sprint delivery | Asana, access gate, evidence/Impact Ledger | Shipped/Adopted/Impact/Maturing | Activity is not impact |
| Learning | Evidence Bank, analytics, cockpit | signal/channel/product learning | Reuse only after rights/claims gate |

---

# 4. Tool criticality

## Mandatory before first cold cohort

- qualified first cohort;
- suppression/conflict checks;
- verified owner/practice emails;
- warmed/healthy sending inboxes;
- Instantly sequence;
- live Growth Score page/form/backend;
- named human reply owner;
- real Score production capacity;
- written Sprint scope process;
- payment path before attempting to close.

## Important but not a blocker for the first message

- ManyChat — manual IG inbound can temporarily substitute;
- Sales Navigator — useful, not mandatory;
- Meta Pixel — later paid/retargeting;
- automatic Instagram Reel publishing — manual publish can substitute;
- large SEO library;
- newsletter;
- new CRM;
- Clay/n8n/Pipedrive/Airtable.

## Later / scale

- Meta B2B ads;
- Google Search Ads;
- first-party retargeting;
- automated content factory;
- advanced partner automation;
- second market/city;
- multi-user delivery team.

---

# 5. Factual readiness audit — 2026-08-21

Status vocabulary:

```text
READY                 usable now
READY / LIVE REVERIFY built and previously smoke-tested; current live visual/state needs fresh check
MANUAL GATE           usable with named human/manual step
BLOCKED               should not launch this function
LATER                 intentionally deferred
```

## 5.1 Public website

**Status: READY / LIVE REVERIFY**

What exists:
- homepage with CAESTHETIC positioning;
- `/growth-score/` page and three-stage intake;
- three explicitly synthetic demo Scores;
- `/sprint/` with published $2,500 scope/boundaries;
- `/growth-system/`, pricing, about and legal pages;
- prior production smoke recorded HTTP 200 across main routes.

How it currently presents in repository source:
- premium analytical/editorial rather than beauty-spa styling;
- strong first CTA to Growth Score;
- clear Four Surfaces and human-verification explanation;
- transparent synthetic-demo labels.

Gaps / improvements:
1. The homepage gives `Explore the Growth System` equal hero prominence to the primary Growth Score. For first-lead conversion, Growth Score should be visually dominant; Growth System may remain secondary/lower.
2. Recurring/internal operations appear early. Keep them as credibility, but do not let them dilute the entry product.
3. Current production source changed after the last recorded full deploy evidence; run a fresh production smoke after any readiness edits.
4. First real evidence/case is still missing; synthetic demos prove format, not market outcome.

## 5.2 Growth Score intake and backend

**Status: READY / LIVE REVERIFY**

What exists:
- two required stages with four required fields;
- request saved before optional enrichment;
- idempotency;
- UTM/referrer capture;
- Supabase lead table;
- internal Resend receipt;
- Telegram alert;
- optional self-reported links/context and explicit enquiry-path permission.

Gaps / improvements:
1. Run one controlled end-to-end production smoke using an explicitly marked test lead and remove/archive it afterward.
2. Confirm internal email and Telegram notification delivery to the actual operating owner.
3. Add an owner-facing transactional confirmation email if response expectations cannot be met manually immediately.
4. Define internal response SLA and Score-status states.
5. Create an Asana/manual task automatically or through daily triage so no lead remains only in Supabase.

## 5.3 Sprint page and payment

**Status: MANUAL GATE / BLOCKED FOR SELF-SERVE PAYMENT**

What exists:
- clear $2,500 price;
- clear scope, exclusions and async model;
- CTA requests scope/payment instructions by email.

Gap:
- no canonical direct Stripe checkout/payment link in current runtime config;
- no verified end-to-end `Score → written scope → payment → paid status` flow.

Required:
- Stripe Payment Link or Checkout;
- written order/SOW and payment/refund terms;
- paid event/status route;
- test payment or verified checkout smoke.

A manual invoice/payment link can close the first deal, but the owner must be ready to issue it immediately.

## 5.4 Valerie public identity on the website

**Status: NEEDS TRUST UPGRADE**

What exists:
- About and homepage identify Valerie Petra as public face / Growth Analyst;
- legal entity and contact email are present.

Current visual:
- a `VP` monogram SVG, not a real portrait or independently verifiable professional image.

Required founder decision:
- keep institutional/monogram approach intentionally;
- or replace with an approved real professional portrait / consistent canonical Valerie asset.

For personalised B2B outreach, a real and consistent identity generally provides stronger trust than a monogram.

## 5.5 Instagram `@caesthetic.growth`

**Status: READY FOR MANUAL CONTENT / BLOCKED FOR SAFE FULL AUDIENCE EXECUTION**

Verified/documented:
- live account/session;
- Phase-1 grid documented as 10 posts;
- three pins documented live;
- Highlights documented live;
- old irrelevant feed documented archived/deleted;
- account is registered on Dolphin profile `833304152`.

Live visual recheck 2026-08-21 (TASK-850, public web, no profile writes):
- display name `CAESTHETIC · Growth Score` — matches canonical package;
- bio CTA is Free Growth Score; link `https://caesthetic.com/growth-score/?utm_source=instagram&utm_medium=organic_social&utm_campaign=phase1_launch&utm_content=bio` returns HTTP 200;
- bio text uses emoji and drops the word `US` vs `02-CANONICAL_PROFILE_PACKAGE.md` — founder/external account action, not this docs pack;
- Highlights live as `START · SCORE · 30 DAYS · PAY · PROOF`. `PAY` conflicts with “do not lead with price”; rename is an external account action;
- grid is populated (not the empty post-archive state). Sprint education tiles may appear; header CTA remains Score.

Audit file: `docs/projects/caesthetic/operations/first-lead/AUDIT_TRUST_SURFACES.md`.

Execution blocker:
- current Dropbox `CURRENT.json` still points to `r20260813T154900Z-bootstrap` with `ready_for_warm: 161` and historical `candidate_pool_reference: 869`;
- full 1,441 candidate qualification / immutable FINAL release is not complete;
- automatic Reels publish adapter remains unaccepted/open; manual publish remains available.

Required:
1. live header screenshot and link click test;
2. finish 1,441 classification;
3. build immutable FINAL release without forced count;
4. switch CURRENT last;
5. fail-closed dry-run;
6. use manual content publishing until Reel adapter is LIVE_VERIFIED;
7. maintain fresh Stories and 2–3 evidence/framework assets; no need for 50 Reels.

## 5.6 LinkedIn — Valerie / Valeriia profile

**Status: TECHNICALLY LIVE, COMMERCIAL NARRATIVE NOT READY**

Verified:
- canonical browser surface is live/logged in;
- registered URL uses the existing Valeriia Petrova profile;
- session passed recent Dolphin readiness.

Publicly indexed presentation at audit time:
- name appears as `VALERIIA PETROVA`;
- headline/company context is ROVLEX;
- About presents her as Founder of ROVLEX INT / reputation management;
- services are broad marketing/SEO/consulting;
- CAESTHETIC is not the dominant public narrative.

This creates a trust mismatch with the CAESTHETIC website, which uses `Valerie Petra` as public face.

Founder decision required:

```text
OPTION A — one personal profile supports both brands
Headline/About/Experience/Featured explicitly explain ROVLEX + CAESTHETIC,
with CAESTHETIC Growth Score as a current professional role.

OPTION B — keep the personal profile ROVLEX-only
Do not use it as the main CAESTHETIC ABM trust surface; create/use a proper
CAESTHETIC company surface and restrict personal outreach accordingly.
```

Before LinkedIn ABM:
- resolve public name/identity convention;
- align headline/About/current role;
- add Growth Score to Featured;
- publish 3–5 CAESTHETIC authority posts;
- add LinkedIn URL to CAESTHETIC site only after alignment.

## 5.7 Email domains / eight CAESTHETIC inboxes / Instantly

**Status: INFRASTRUCTURE EXISTS / GO BLOCKED PENDING DELIVERABILITY ACCEPTANCE**

Documented:
- eight `caesthetic.co` cold mailboxes registered;
- Instantly warmup started;
- Instantly workspace/account is active.

Not independently verified in this audit:
- current warmup score per mailbox;
- SPF/DKIM/DMARC pass;
- inbox placement;
- reply routing;
- per-mailbox send limits;
- global unsubscribe/suppression execution;
- current bounce risk.

Historical Instantly notifications in the connected mailbox show other campaigns were previously auto-paused for high bounce rates. That does not prove a CAESTHETIC problem, but it raises the acceptance standard.

Before GO:
1. DNS/authentication acceptance;
2. seed/inbox placement test;
3. one test email and reply through each mailbox;
4. verify unsubscribe and suppression;
5. approve conservative daily caps;
6. confirm Unibox owner/SLA;
7. load only qualified/verified contacts.

## 5.8 ManyChat

**Status: BACKEND READY / UI FLOW NEEDS LIVE TEST**

Verified:
- live exact-match lookup endpoint;
- stable `matched/not_found` contract;
- CURRENT deny overlay respected;
- canonical routing: comment → acknowledgement → context DM → role → route.

Lookup backend recheck 2026-08-21 (TASK-850):
- `OPTIONS/POST https://evo.do/api/v1/lookup-caesthetic-instagram` live (204 / 200) with stable `status/practice_name/city_state/website` keys.

Still not independently verified in the ManyChat UI:
- current ManyChat workspace connection;
- keywords/triggers;
- response mapping;
- AI Replies state;
- human handoff;
- Growth Score link/UTM inside the live flow;
- end-to-end comment → DM → lead creation.

Inbound copy (not a UI proof): `docs/copy/caesthetic/en/first-lead/manychat-inbound.md`.

Before enabling AI Replies:
- test 20–30 scenarios, including owner, future founder, observer, wrong person, already has agency, pricing, guarantee request, complaint, medical question, unsubscribe and human request;
- verify no PHI collection;
- verify substantive handoff;
- verify owner route ends at Growth Score.

ManyChat is not a blocker for the first email/partner leads; manual IG inbox handling can substitute temporarily.

## 5.9 Dolphin / Social Control

**Status: CORE SESSION READY / CAESTHETIC AUDIENCE WRITE PATH BLOCKED UNTIL CURRENT FIX**

Verified:
- CAESTHETIC IG and Valerie LinkedIn sessions passed readiness;
- low-risk policy-controlled actions and identity routing exist;
- fail-closed doctrine is canonical.

Gaps:
- CURRENT still stale bootstrap;
- 1,441 classification run did not produce accepted final results;
- automated Instagram Reel publishing remains not LIVE_VERIFIED.

No activation should read candidate pool as write authority.

## 5.10 Candidate data / A-B-C-Research-Reject / FINAL CURRENT

**Status: BLOCKED**

Current facts:
- 1,441 candidates exist;
- old qualification dry-run result recorded `unknown_type:caesthetic_candidate_qualification`;
- no accepted A/B/C/R/Reject counts or immutable new FINAL release were found;
- CURRENT still points to 161 ready bootstrap rows.

This is the main data/control-plane blocker.

Required:
1. repair qualification runner/transport;
2. produce row-level classification with source/confidence;
3. QA samples and false-positive rate;
4. apply suppression;
5. create immutable release + manifest/count/hash;
6. switch CURRENT last;
7. no-write dry-run;
8. select a small activation cohort from the qualified universe.

## 5.11 Analytics

**Status: CODE READY / PROVIDER IDs MISSING**

Implemented:
- UTM session persistence;
- dataLayer;
- funnel events for Score and Sprint pages/actions;
- optional GA4/Meta loaders.

Missing:
- GA4 Measurement ID;
- Meta Pixel ID;
- accepted dashboard/cockpit projection.

Minimum for first cohort:
- GA4 ID or another accepted server-side analytics source;
- UTM naming convention;
- source fields preserved through lead → Score → Sprint;
- weekly funnel report.

Meta Pixel can remain LATER until paid/retargeting.

## 5.12 Asana

**Status: NOT READY AS OPERATING BOARD**

Audit result:
- existing CAESTHETIC project contains only one incomplete task about collecting reference Reels;
- no launch-readiness tasks, owners, gates or lead/Score operating queue are present.

Required:
- add P0 launch tasks;
- distinguish founder / ChatGPT / freelancer ownership;
- create lead/Score/Sprint status tasks or automation;
- weekly project status update.

## 5.13 Partner and referral materials

**Status: PACK DRAFTED (TASK-850) / NOT YET USED IN LIVE PARTNER SENDS**

Internal pack (no new public page):
- Partner Growth Score one-pager — `docs/copy/caesthetic/en/first-lead/partner-onepager.md`
- partner first-touch + forwardable intro + client referral — `docs/copy/caesthetic/en/first-lead/partner-intro-referral.md`
- source attribution — `docs/projects/caesthetic/operations/first-lead/UTM_CONVENTION.md`

Still required before live partner sends:
- founder list of first 10–20 warm relationships;
- no unapproved revenue-share promises;
- named intro owner.

---

# 6. What must be ready before the first cohort

## P0 — no launch without these

```text
1. Valid qualified cohort
2. Correct suppression and account identity
3. Instantly deliverability accepted
4. Growth Score form/backend live-smoked
5. Named reply owner + response SLA
6. Score production capacity named
7. Sprint payment method ready
8. Basic source attribution working
```

## P1 — trust/conversion improvements

```text
1. Instagram bio/link live QA
2. LinkedIn identity/narrative alignment
3. Real Valerie identity asset decision
4. ManyChat end-to-end inbound test
5. Partner pack
6. First real Evidence Bank unit / case
```

## P2 — scale

```text
1. Automatic lead→Asana routing
2. Auto-confirmation email
3. Meta Pixel / retargeting
4. Search Ads
5. automatic Reel publish acceptance
6. second market
```

---

# 7. Human capacity and SLA

Before activation, name the actual capacity:

```text
Score request acknowledgement: same business day
Qualification / request triage: same business day
Score delivery target: stated only after request and capacity check
Substantive reply owner: founder / named operator
Initial safe capacity: 2–3 high-quality Scores per week until measured
```

Do not activate more accounts than downstream can serve without degrading human review or walkthrough quality.

---

# 8. Ownership matrix

## 8.1 ChatGPT / AI / connected tools

ChatGPT owns or can execute:

- maintain this SSOT, DEC and router;
- repair/operate the 1,441 qualification pipeline;
- produce A/B/C/R/Reject outputs and QA reports;
- prepare immutable release artifacts and fail-closed tests;
- draft email sequence, signal openings and reply playbook;
- draft Partner Growth Score pack and referral templates;
- draft LinkedIn profile package and authority posts;
- draft Instagram bio/header QA and content assets;
- write ManyChat scenario tests and flow copy;
- implement repository changes for GA4, Stripe link, confirmation email and lead→Asana routing after founder supplies external IDs/authority;
- run code tests, deploy/smoke through canonical tools where available;
- build weekly cockpit/report;
- create and maintain Asana task structure.

ChatGPT cannot independently:
- access an unconnected ManyChat/Instantly/Stripe/Meta UI;
- choose public identity on founder’s behalf;
- approve legal/commercial terms;
- perform the human diagnostic judgement;
- negotiate/close the Sprint.

## 8.2 Founder

Founder owns:

1. **LinkedIn identity decision** — ROVLEX+CAESTHETIC personal profile or ROVLEX-only + separate CAESTHETIC surface.
2. **Valerie identity asset** — approve real portrait/identity convention or intentionally keep institutional monogram.
3. **Stripe/payment** — create/authorize payment link/account and payment/refund handling.
4. **Commercial authority** — final Sprint scope, MSA/SOW/order terms and pricing decisions.
5. **Analytics credentials** — provide GA4 ID; Meta Pixel later when paid is approved.
6. **Instantly GO** — only after deliverability acceptance.
7. **External account actions** — approve final Instagram bio/link, LinkedIn edits, ManyChat connection/settings when UI access is required.
8. **Human delivery** — substantive replies, final Score approval, English walkthrough, “Should we fix this?” decision and close.
9. **Capacity** — set safe Scores/week and response SLA.
10. **Partners** — identify first 10–20 warm relationships and make/approve introductions.

## 8.3 Freelancer — only if trigger occurs

### Deliverability specialist — conditionally required

Use a one-off specialist if the founder/ChatGPT cannot obtain and verify current DNS, mailbox-health and inbox-placement evidence directly.

Bounded deliverable:
- SPF/DKIM/DMARC;
- inbox placement/seed report;
- mailbox-by-mailbox health;
- tracking-domain setup;
- bounce/suppression policy;
- launch caps;
- emergency shutdown SOP.

No permanent retainer is required.

### US commercial/privacy lawyer — required before first paid Sprint unless existing reviewed templates exist

Bounded review:
- MSA/SOW/order;
- payment/refund/cancellation language;
- CAN-SPAM/privacy/processor disclosure;
- partner compensation if introduced later.

The lawyer does not need to review every email or free Score.

### Native-English presenter — conditional

Only if the founder cannot deliver a credible owner-facing English walkthrough.

Use per-Score/per-recording, not a full-time hire before demand.

### Not required for first leads

- general VA;
- full-time SDR;
- ManyChat specialist;
- designer;
- video editor;
- new CRM implementer;
- broad automation agency.

---

# 9. Definition of “first-lead ready”

CAESTHETIC may declare first-lead readiness only when:

```text
[ ] qualified cohort exists
[ ] wrong CURRENT/candidate execution is impossible
[ ] email domain/inboxes pass acceptance
[ ] Instagram header/link is live-verified
[ ] LinkedIn is either aligned or deliberately excluded from the first cohort
[ ] Growth Score form creates a lead and notifies named owner
[ ] owner has a response SLA
[ ] 2–3 Scores/week can be produced and walked through
[ ] Sprint scope/payment can be issued immediately
[ ] source→reply→Score→Sprint is measurable
```

A beautiful profile, a working form or warmed inboxes alone do not equal readiness.

---

# 10. Immediate launch order

```text
P0. Repair qualification + FINAL CURRENT
P0. Accept email deliverability
P0. Live-smoke Score lead route
P0. Prepare Stripe/manual payment authority
P0. Name reply + walkthrough capacity

P1. Fix LinkedIn identity/narrative (OPEN_DECISION — first cohort may exclude LinkedIn)
P1. Instagram header/link live-checked 2026-08-21; bio emoji/US wording and PAY highlight remain founder/external
P1. Load first 30–50 qualified accounts
P1. Launch email + IG familiarity; LinkedIn only after identity decision
P1. Start partner outreach in parallel (copy pack ready)

P2. ManyChat Test AI / handoff
P2. GA4 cockpit and auto-confirmation
P2. First real evidence/case and CITY CHECK
```

---

# 11. One-sentence operating rule

> **Каждый источник трафика ведёт к одному Free Growth Score; каждый Score должен попасть к именованному человеку, превратиться в проверенную диагностику и иметь готовый путь к письменному $2,500 Sprint — иначе канал ещё не готов, даже если аккаунт или сервис технически включён.**
