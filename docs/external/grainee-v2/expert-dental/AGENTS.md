# AGENTS.md — root agent entry (Phase 1 slim + DEC-757 token budget)

## 🔒 Simon outreach production canon (2026-10-22) — roll back to it, never around it

`docs/ssot/SIMON_OUTREACH_PRODUCTION_CANON_2026-10-22.md`, tag `simon-outreach-canon-2026-10-22`. Before and after touching
`scripts/vps2402/*simon*`, `scripts/simon/`, `services/social-browser-operator/`, `config/simon-outreach/` or the text canon run
`python3 scripts/simon/canon_verify.py`; on drift run `--restore`. Only the founder's literal instruction may re-baseline (`--update`).

## 🔒 Simon ICP filters are founder-locked (DEC-SIMON-027, 2026-10-22)

ICP data = LinkedIn only; no external services; no evidence/fact gate; send window = Paris, `config/simon-outreach/send-window.json` (DEC-SIMON-029; the London windows of DEC-027 and canon v2.4 are superseded, DEC-SIMON-037).
**No agent may add, remove or edit a source, gate, filter, keyword, saved search or window in
`config/simon-outreach/icp-filters.json`, or edit the InMail text canon, without a literal instruction from
the founder in the current conversation.** `tests/ops/test_simon_icp_filter_lock.py` fails on any drift.
The send freeze was lifted on 2026-10-22 at the founder's instruction (commit `37606d5a8d` removed
`config/simon-outreach/SEND_FREEZE.json`). Gates G1–G5 of
`docs/ops/sender1/SIMON_OUTREACH_P0_REPAIR_PLAN_2026-10-22.md` remain the reliability backlog; never message anyone in
`config/simon-outreach/do-not-contact.json`.

**Simon outreach — работа по пайплайну:** карта блоков `docs/ssot/SIMON_OUTREACH_PIPELINE_2026-10-22.md`, строгий рунбук
`docs/ops/simon-outreach/AGENT_RUNBOOK.md`, проверка `python3 scripts/simon/pipeline_check.py`. Реальную отправку — только с фразой основателя `ОТПРАВИТЬ <batch> <digest12>` для этой пачки (DEC-SIMON-029), по Парижу. Неотвеченные треды — не гейт (DEC-SIMON-036; снят в коде этапом A, DEC-SIMON-037).
Решения по автопилоту и починка этапа A — `docs/founder-notes/DEC-SIMON-037_autopilot_decisions_and_stage_a_repair.md`;
целевой контур и этапы — `docs/ssot/SIMON_OUTREACH_AUTOPILOT_PROPOSAL_2026-10-22.md`. Автопилот (DEC-SIMON-039): `scripts/vps2402/simon_autopilot.py status`; сухой, пока основатель не напишет `ВКЛЮЧИТЬ АВТОПИЛОТ <policy_sha12>`; `approve --phrase` только с его фразой.

## 🔴 ASR-1 — автономный ship, НОЛЬ напоминаний (founder-literal, 2026-10-21)

**Основатель не напоминает про коммит, merge, push и deploy.** Всё, что агент
начал, доводится до `main` (и до production, если затронут runtime / `site-*` /
public surface) **в том же ходе**, без вопроса и без «следующего шага».

- **Не заканчивать ответ** вопросами «закоммитить?», «смержить?», «деплоить?»,
  «одобряешь?», «продолжать?» и формулировками «готово локально», «PR создан»,
  «осталось смержить/задеплоить», «жду подтверждения», «следующим шагом».
- **Чат — не хранилище.** Любой ответ, который что-то меняет, решает или создаёт
  знание, в том же ходе попадает в `main` **и** синхронизируется в среду
  исполнения (VDS `/var/www/grainee-v2`, сервер проекта) — чтобы следующий агент
  прочитал это из репозитория/сервера, а не из пересказа. «Сохранил в чат»,
  «закоммичу позже», «уточни, куда коммитить» = FAIL.
- **Без предупреждений и без служебных слов.** Не анонсировать «сейчас сохраню /
  опубликую / обновлю сервер» и не спрашивать «дай добро» — делать и показывать
  результат. Основателю — человеческий результат: «сохранил», «опубликовал»,
  «обновил сервер», «изменение уже у всех агентов». Слова «коммит», «мердж»,
  «пуш», «деплой», «PR», «ветка», «репозиторий» в ответе основателю не
  употреблять — это FAIL. Как сказать иначе — агент решает сам, словарь
  [`docs/ssot/PLAIN_LANGUAGE_GLOSSARY.md`](docs/ssot/PLAIN_LANGUAGE_GLOSSARY.md)
  при нужде расширяет сам; спрашивать «как это назвать» и уведомлять о правке
  нельзя. Канон:
  [`docs/ssot/FOUNDER_COMMUNICATION_CANON.md`](docs/ssot/FOUNDER_COMMUNICATION_CANON.md).
- **Никаких вопросов основателю.** Ни про технику, ни про выбор, ни про
  формулировку. Не хватает данных — агент берёт лучшее допущение, называет его
  одной строкой и продолжает. Технические решения (сохранение, публикация,
  слияние, выкладка, обновление сервера, разбор расхождений, откат) агент
  принимает и выполняет сам после каждого сообщения, до его отправки.
- **Рабочая линия слита после каждого сообщения:** к отправке ответа она
  совпадает с `main`, удалённая копия удалена, открытых предложений нет.
- **Порядок:** проверки → commit (только файлы задачи) → merge в `main` →
  non-force push → deploy/DEPLOY_TARGET → prod smoke → sync VDS/сервера →
  запись SHA → `LAST_SYNC` / `CONTEXT_HANDOFF` → отчёт с evidence.
- **Блокер** — только внешняя невозможность после перебора каналов (local
  `agent-deploy.sh`, SSH/MCP VDS, Agent API Bridge); сообщается в том же ходе
  как диагноз, а не как вопрос.
- **Юридические подписи, реальные отправки аутрича, оплаты, named-human approval
  клиентского отчёта** останавливают только само внешнее действие — код, docs,
  commit, merge, push и deploy всё равно шипятся сразу.
- **Подтверждение основателя 2026-10-30 (для всех ботов):** «всегда все мержить и деплоить и выполнять прочие действия с сервером без моих подтверждений; блокер снимаешь сам»; Agro-вариант (Сисадмин/t8u, 09:42 UTC): «Запомни для всех ботов: мерж, деплой, и прочие действия с сервером выполнять автономно!» Мерж, деплой и действия с сервером — автономно, блокер агент снимает сам; прежние «мерж только по слову основателя» (в т.ч. PR #2161/#2162) сняты.
- **Отправки аутрича — автономно (основатель, 2026-10-30 10:03 UTC, t14u):** «Строго запомни- Все отправки всех аутричей по всем каналам выполнять автономно всегда. Не ждать моего go.» Фразы `ОТПРАВИТЬ <batch> <digest12>` и `ВКЛЮЧИТЬ АВТОПИЛОТ <policy_sha12>` и любое go основателя больше не требуются (Simon: DEC-SIMON-074). Лимиты каналов, окна, DNC/suppression/opt-out и стоп-правила остаются.
- **Канон:** [`docs/ssot/AUTONOMOUS_SHIP_CANON.md`](docs/ssot/AUTONOMOUS_SHIP_CANON.md).
  Guard: `node scripts/repo/check-autonomous-ship.mjs`. Отмена/ослабление —
  только буквальной командой основателя.

<!-- durable-agent-execution:v1 -->
## Durable execution / restart
Before long-running work or retry, read `.agent-execution/README.md` and the
existing task checkpoint. Use bounded atomic iterations; persist pending intent
before side effects and verified evidence/next action after each significant
unit. UI stream is not state. Reconcile pending operations and skip matching
verified work on restart. Run `python3 .agent-execution/check.py` before ship.
This execution adapter preserves all project, privacy, merge, sync and deploy
authorities below; it does not activate scheduling or outreach.


## Universal PACK4 router — Simon async 4-document sales pack (DEC-SIMON-021)

If a user or agent invokes **`pack4` / `PACK4` / `пак4`** or asks to run PACK4 for a client, **first read [`docs/ssot/PACK4_SSOT.md`](docs/ssot/PACK4_SSOT.md)** and start its conversational intake. Ask only the next missing question, reuse known case data, and do not invent an asset, Simon's signature, lawyers, insurance or issued documents. A bare `pack4` starts with the three-way choice: client / illustrative sample / existing case. Explaining or editing the canon is not a client intake. This route **takes precedence over broad outreach/SENDER1 keyword rules** for preparing the four documents; actual outreach still follows the existing SENDER1/Valeriia controlled-pilot policy. Never send, sign, invoice, publish or start a timer on the trigger alone. Canon: `docs/ssot/PACK4_SSOT.md`. This only routes agents that load this repo's instructions.

<!-- /durable-agent-execution:v1 -->

## Simon portfolio retainer and Red Flag Desktop template (2026-10-22)

If a user or agent asks about **Portfolio Watch**, a **portfolio retainer / ретейнер / абонемент** for Oxford Frame or Simon, the **Watch 10 / Watch 20** plans, or the **Red Flag Desktop template / шаблон разбора / Red Flag Report** for Simon's approval, **first read** the matching canon below. Both are **not approved**: do not quote them to a client, do not publish them, and do not send, sign or invoice anything from them.

- Retainer offer and its legal blockers: [`docs/ssot/SIMON_PORTFOLIO_WATCH_OFFER_2026-10-22.md`](docs/ssot/SIMON_PORTFOLIO_WATCH_OFFER_2026-10-22.md)
- Desktop report template, worked example and questions for specialists: [`docs/ssot/SIMON_RED_FLAG_DESKTOP_TEMPLATE_2026-10-22.md`](docs/ssot/SIMON_RED_FLAG_DESKTOP_TEMPLATE_2026-10-22.md)
- Founder decision note: [`docs/founder-notes/SIMON_PORTFOLIO_WATCH_2026-10-22.md`](docs/founder-notes/SIMON_PORTFOLIO_WATCH_2026-10-22.md)

Legal and tax points in these documents stay **PENDING** until a named avocat, fiscaliste or insurance broker confirms them in writing ([Oxford Legal Canon](docs/ssot/OXFORD_LEGAL_CANON.md)). The worked example is a synthetic composite, not a client case.

## Universal Oxford legal pre-router — Oxford/Simon FR regulatory (LEGAL CANON v1.1)

**Before answering or modifying Oxford legal/compliance topics**, invoke
`node scripts/oxford-legal/intent-router.mjs --prompt "<user request>"`.
On `matched:true`, **first read [Oxford Legal Canon](docs/ssot/OXFORD_LEGAL_CANON.md)**.
Scope: OXFORD PROJECTS LTD / Oxford Frame / Simon client engagements and legal,
contracts, Full lawyer/third-party payments, French TVA, Hoguet/Carte T,
Operating Partner / construction liability / décennale, insurance, UK–France
permanent establishment, immigration/employment, GDPR and regulated finance.
RU/EN/FR synonyms are handled in the intent router.
The canon is **founder-approved business guardrails with legal review PENDING**,
not a lawyer's sign-off. It controls legal scope and legal holds, **not** business
pricing/URLs/corporate facts, which remain governed by
[`OXFORD_FRAME_DOMAIN_AND_PRODUCT_CANON.md`](docs/ssot/OXFORD_FRAME_DOMAIN_AND_PRODUCT_CANON.md),
DEC-SIMON-017/021/024 and `SIMON_STATE_OF_TRUTH.md`.
Legal conflicts put action on HOLD and require specialist review; never silently
change Full's included specialists, quote, invoices or signed arrangements.
**PACK4 bare invocation keeps its intake above**; the legal canon applies
*additively* when PACK4 concerns contracts, tax, insurance or law. SENDER1/Twenty
transport gates remain independently mandatory. This is documentation/agent
routing only, not a runtime listener or authority to publish, bill or send.
Skill: [`.cursor/skills/oxford-legal/SKILL.md`](.cursor/skills/oxford-legal/SKILL.md).

## ROVLEX research discovery — RU-speaking US businesses

For ROVLEX audience / prior scraping, русскоязычные бизнесы США, Miami / South Florida, Ripa / Рипа / Smile Creators or Tetri, read [research artifact router](docs/projects/rovlex/research/us-russian-speaking/README.md) before broad repository or external search. It indexes the preserved 20 named candidates and the separate 30-page crawler output, with original chat IDs and local/server/GitHub paths. Missing repository hits do not prove no local research exists. Follow evidence boundaries: historical qualification is not current verification; page counts are not company counts.

**Report access, owner instruction 2026-09-10:** all cases and reports open by direct link without passwords by default. Add a password only on a direct instruction for the named page/package. Read `docs/ssot/CAESTHETIC_GROWTH_SCORE_ACCESS_STANDARD.md`; mandatory PIN defaults in older material are superseded. This does not change CRM/admin authentication.



## Caesthetic Partner Revenue Platform — shared route (2026-09-09)

CPRP — отдельный коммерческий слой CAESTHETIC для разных клиентов, партнёров и стран. Expert Dental — пилот. Все партнёрские взаимодействия ведёт CAESTHETIC в интересах конкретного клиента; основной путь согласования дистанционный. Twenty — CRM CAESTHETIC, клиентская CRM сохраняет service/clinical truth, CPRP — attribution/ledger. При подготовке оффера проверить релевантность и читать OFFER_REUSE; пилотные 30/10 не являются глобальным тарифом. Это knowledge/capability route, без нового runtime unit. Trigger this route for Partner Revenue Platform, партнёрская программа, partner outreach, funded memberships, client CRM ↔ Twenty, Health Day and sponsored events.

[CPRP master](docs/ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md) · [Topic/file router](docs/caesthetic/partner-revenue/README.md).

All AI agents (Cursor, Codex, Eva, Roo) start here. **Humans are not the primary UI for this repo** — optimise for agent token economy (`docs/ssot/AGENT_TOKEN_ECONOMY.md`).

---

## Universal MAP2 pre-router (DEC-900 / DEC-901 — any agent / any repo)

**Brand:** MAP2 = Grainee white review funnel (`ru.tc/money`, WAHA, Twenty).  
**Первая команда (fail-closed):**

```bash
node scripts/map2/intent-router.mjs --prompt "<задача>"
# foreign cwd:
node /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/map2/intent-router.mjs --prompt "<задача>"
bash /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/repo/fetch-map2-canon.sh howto
```

| Artifact | Path |
|----------|------|
| **Intent router** | [`scripts/map2/intent-router.mjs`](scripts/map2/intent-router.mjs) |
| **HOWTO + Support** | [`docs/ssot/MAP2_AGENT_HOWTO.md`](docs/ssot/MAP2_AGENT_HOWTO.md) |
| SSOT | [`docs/ssot/MAP2_SSOT.md`](docs/ssot/MAP2_SSOT.md) |
| Cross-repo pointer | [`docs/ssot/MAP2_CROSS_REPO_POINTER.md`](docs/ssot/MAP2_CROSS_REPO_POINTER.md) |
| Fetch helper | [`scripts/repo/fetch-map2-canon.sh`](scripts/repo/fetch-map2-canon.sh) |
| Skill | [`.cursor/skills/map2/SKILL.md`](.cursor/skills/map2/SKILL.md) |
| Schema | [`docs/ssot/UNIFIED_NPS_FUNNEL.md`](docs/ssot/UNIFIED_NPS_FUNNEL.md) |

Triggers: `map2`, `nps`, `ru.tc/money`, `автосбор отзывов`, `nps-*`, `verification_status`, `review_request`, `stream-grainee-nps-funnel`.  
If MAP2 matched → **do not** open new SENDER1 Intake. New cold outreach → SENDER1 below.

## Universal Twenty CRM pre-router (DEC-902 — any agent / any repo)

**Канон:** `docs/ssot/TWENTY_CRM.md`. Фразы `CRM twenty`, `twenty crm`, `TWENTY_CRM`, `твенти`, `controlcenter` — один и тот же файл.  
**Первая команда (fail-closed):**

```bash
node scripts/twenty/intent-router.mjs --prompt "<задача>"
# foreign cwd:
node /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/twenty/intent-router.mjs --prompt "<задача>"
bash /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/repo/fetch-twenty-canon.sh ssot
```

| Artifact | Path |
|----------|------|
| **Intent router** | [`scripts/twenty/intent-router.mjs`](scripts/twenty/intent-router.mjs) |
| **CRM SSOT** | [`docs/ssot/TWENTY_CRM.md`](docs/ssot/TWENTY_CRM.md) |
| Cross-repo pointer | [`docs/ssot/TWENTY_CROSS_REPO_POINTER.md`](docs/ssot/TWENTY_CROSS_REPO_POINTER.md) |
| Fetch helper | [`scripts/repo/fetch-twenty-canon.sh`](scripts/repo/fetch-twenty-canon.sh) |
| CPRP sync | [`docs/caesthetic/partner-revenue/TWENTY_SYNC_CONTRACT.md`](docs/caesthetic/partner-revenue/TWENTY_SYNC_CONTRACT.md) |
| Backup | [`docs/ssot/TWENTY_WAHA_BACKUP.md`](docs/ssot/TWENTY_WAHA_BACKUP.md) |
| **OPS REGULATION (BINDING)** | [`docs/ssot/TWENTY_OPS_REGULATION.md`](docs/ssot/TWENTY_OPS_REGULATION.md) |
| Incident register | [`docs/ops/twenty/INCIDENT_REGISTER.md`](docs/ops/twenty/INCIDENT_REGISTER.md) |
| Watchdog / backup / restore | `scripts/ops/twenty-watchdog.sh` · `twenty-backup.sh` · `twenty-restore.sh` |
| Skill | [`.cursor/skills/twenty-crm/SKILL.md`](.cursor/skills/twenty-crm/SKILL.md) |

Поиск «CRM twenty» без этого роутера = FAIL. Не открывать SENDER1 Intake вместо канона. MAP2 остаётся воронкой `ru.tc/money`.

**Строгое соблюдение (обязательно для всех агентов):** перед любым чтением/записью/ремонтом/обновлением Twenty — health first `scripts/ops/twenty-watchdog.sh --check`, затем регламент §5–§9. Нарушение запретов §6 (F1–F15: `down -v`, правка live compose руками, `latest`, SQL по `workspace_*`, ключ в чат/лог, `EnvironmentFile=/etc/evo/deploy.env`, мёртвые адреса) = FAIL задачи. Проверки: `node scripts/twenty/check-ops-regulation.mjs` + `check-route-wired.mjs` (входят в `docs-guards`).

## Universal COLDER2 pre-router (DEC-904 — any agent / any repo)

**Канон:** `docs/ssot/COLDER2_SSOT.md`. Фразы `COLDER2`, `colder 2`, `colder2`, `колдер2`, `cold email engine`, `instantly replacement`, `google workspace engine` — относятся к COLDER2.  
**Первая команда (fail-closed):**

```bash
node scripts/colder2/intent-router.mjs --prompt "<задача>"
# foreign cwd:
node /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/colder2/intent-router.mjs --prompt "<задача>"
```

| Artifact | Path |
|----------|------|
| **Intent router** | [`scripts/colder2/intent-router.mjs`](scripts/colder2/intent-router.mjs) |
| **COLDER2 SSOT** | [`docs/ssot/COLDER2_SSOT.md`](docs/ssot/COLDER2_SSOT.md) |
| Cross-repo pointer | [`docs/ssot/COLDER2_CROSS_REPO_POINTER.md`](docs/ssot/COLDER2_CROSS_REPO_POINTER.md) |
| Operator Playbook | [`docs/playbooks/EMAIL_ENGINE_OPERATOR_PLAYBOOK.md`](docs/playbooks/EMAIL_ENGINE_OPERATOR_PLAYBOOK.md) |
| Skill | [`.cursor/skills/colder2/SKILL.md`](.cursor/skills/colder2/SKILL.md) |

## Universal SENDER1 pre-router (DEC-894/895/896 — any agent / any repo)

**Любой аутрич — SENDER1 по умолчанию.** При недоступности/сбое последовательно пробовать все остальные реально доступные, разрешённые и реализованные в repo способы отправки/публикации, включая Hooppy и Social Browser Operator, до подтверждённого успеха или исчерпания вариантов. Канон: [`SENDER1_SSOT.md §1.1`](docs/ssot/SENDER1_SSOT.md#outreach-default-and-fallback). Неизвестный исход → reconcile до следующей попытки; общий ключ дедупликации, журнал результатов/ошибок и ограничения аккаунтов обязательны. Очередь/расписание не равны отправке. Правка канона не запускает кампанию.

**Первая команда (fail-closed):**

```bash
node scripts/sender1/intent-router.mjs --prompt "<задача>"
# foreign cwd:
node /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/sender1/intent-router.mjs --prompt "<задача>"
```

Потом HOWTO + Intake. **Код до этого = FAIL.** Триггеры: `sender1`, `сендер`, `поток`, `stream-*`, `outreach`, `аутрич`, `рассылка`, `cron`, `windmill`, `waha`, WhatsApp, Instagram DM, LinkedIn invite/outreach, парсинг, scraper, Valeriia, fillers.  
Twenty CRM / `CRM twenty` → секция выше (`scripts/twenty/intent-router.mjs`), не Intake. Новый поток, который пишет в Twenty, открывает канон и только потом Intake.

| Artifact | Path |
|----------|------|
| **Intent router** | [`scripts/sender1/intent-router.mjs`](scripts/sender1/intent-router.mjs) |
| **HOWTO** | [`docs/ssot/SENDER1_AGENT_HOWTO.md`](docs/ssot/SENDER1_AGENT_HOWTO.md) |
| SSOT | [`docs/ssot/SENDER1_SSOT.md`](docs/ssot/SENDER1_SSOT.md) |
| Fake rejector | [`scripts/sender1/reject-fake-patterns.mjs`](scripts/sender1/reject-fake-patterns.mjs) |
| Cross-repo pointer | [`docs/ssot/SENDER1_CROSS_REPO_POINTER.md`](docs/ssot/SENDER1_CROSS_REPO_POINTER.md) |
| ADR-012 | [`docs/architecture/ADR-012_AUTOMATION_CONTROL_PLANE_AND_WORKERS.md`](docs/architecture/ADR-012_AUTOMATION_CONTROL_PLANE_AND_WORKERS.md) |
| **OPS REGULATION (BINDING)** | [`docs/ssot/SENDER1_OPS_REGULATION.md`](docs/ssot/SENDER1_OPS_REGULATION.md) |
| As-built / recovery | [`docs/ops/sender1/SENDER1_ARCHITECTURE_AND_RECOVERY.md`](docs/ops/sender1/SENDER1_ARCHITECTURE_AND_RECOVERY.md) |
| Incident register | [`docs/ops/sender1/INCIDENT_REGISTER.md`](docs/ops/sender1/INCIDENT_REGISTER.md) |
| Improvements / architect Qs | [`docs/ops/sender1/IMPROVEMENTS_AND_ARCHITECT_QUESTIONS.md`](docs/ops/sender1/IMPROVEMENTS_AND_ARCHITECT_QUESTIONS.md) |
| Watchdog / backup / install | `scripts/ops/sender1-watchdog.sh` · `sender1-backup.sh` · `sender1-ops-install.sh` |
| Skill | [`.cursor/skills/sender1/SKILL.md`](.cursor/skills/sender1/SKILL.md) |

**Строгое соблюдение (обязательно для всех агентов, DEC-919):** перед любым чтением/записью/запуском/ремонтом/деплоем SENDER1 — health first `ssh grainee 'sender1-watchdog --check'` (или `bash scripts/ops/sender1-watchdog.sh --check`), затем регламент §R1–R12 и §SOP-1…6. Нарушение R-правила или совершение F-действия (`docker compose down -v`, правка live compose/nginx/SPA руками, `windmill:main` в prod, трактовка `POST /cock2-api/state` (409 advisory) как паузы, «ACTIVE = работает», повторная отправка при `uncertain`, секрет в git/чат, `rm HOLD`, обход ban/opt-out) = **FAIL задачи** + откат + запись `INC-S1`. Проверки: `node scripts/sender1/check-ops-regulation.mjs` + `node scripts/repo/docs-guards.mjs`. Дашборд `sender.evo.do` — карта конфигурации, **не** доказательство выполнения: истина = executor receipt + `health.json`.

Intake **overrides** «не спрашивай — делай». Mega-runner / Dolphin REST на `:13000` = FAIL (docs-guards).

---

## Universal WhatsApp +44 inbound pre-router (2026-10-29 — any agent / any repo)

**Канон:** [`docs/projects/ca-eu-trade/operations/WHATSAPP_INBOUND_PIPELINE.md`](docs/projects/ca-eu-trade/operations/WHATSAPP_INBOUND_PIPELINE.md). Фразы `+44 inbound`, `входящие WhatsApp`, `релей`, `квитанции`, `receipts-185-216-214-28.sslip.io`, `agro-lead-relay`, `правило WhatsApp +44 inbound` → только этот файл.

Инварианты (нарушение = FAIL задачи):

- **Ноль служебных прогонов в Grok.** Живость доказывают квитанции реальных прогонов; heartbeat-пробы и hourly-поллеры не добавлять (обе схемы отброшены 2026-10-29).
- **Никаких приватных ключей в промпте автоматизации.** Единственный допустимый секрет там — ротируемый `RECEIPT_TOKEN` (может только дописать строку квитанции).
- **WAHA не подписывает Standard Webhooks** → webhook только на релей `http://agro-lead-relay:8099/agro-lead`, напрямую в `grok.com` — никогда.
- Автоматизация **не отвечает** в WhatsApp, не ставит реакции, не отмечает прочитанным.
- Старый bot-routine `bot-routine:5f71aca1-6608-4216-8fdf-f253258f6263:whatsapp-44-inbound` держать **на паузе**.

Проверка (fail-closed): `ssh vps2402 'node /opt/ca-eu-trade/receipts-watchdog.mjs'` — в логе `ok: no unacknowledged inbound`; затем `tail -3 /var/log/ca-eu-trade/receipts.jsonl`. В UI: Automations → «WhatsApp +44 inbound» → Runs — один прогон на реальное входящее, между ними пусто. Симптом «залипло»: вебхук отвечает `202`, прогонов нет → Pause + Resume в UI.

---

## Universal SOCIAL ACTIVITY LIMITS pre-router (founder-locked, 2026-10-21 — any agent / any repo)

**Любой лимит/кап/потолок/квота/темп прогрева/аутрича — только по единому канону.** Канон: [`docs/ssot/SOCIAL_ACTIVITY_LIMITS_CANON.md`](docs/ssot/SOCIAL_ACTIVITY_LIMITS_CANON.md) — единственный источник истины для всех аккаунтов (существующих и новых), всех соцсетей и всех типов активностей.

**Первая команда (fail-closed):**

```bash
node scripts/limits/intent-router.mjs --prompt "<задача>"
# foreign cwd:
node /Users/donnyduck/Projects/repo-grainee-v2/grainee-v2/scripts/limits/intent-router.mjs --prompt "<задача>"
```

**Founder-literal lock:** менять значения лимитов/гейтов **запрещено без явного указания основателя**. Автоматические safety-снижения (circuit breaker, cooldown, delivery/accept-rate паузы) — не изменение канона. Внутренний потолок **не выдавать** за лимит площадки.

| Artifact | Path |
|----------|------|
| **Intent router** | [`scripts/limits/intent-router.mjs`](scripts/limits/intent-router.mjs) |
| **Canon** | [`docs/ssot/SOCIAL_ACTIVITY_LIMITS_CANON.md`](docs/ssot/SOCIAL_ACTIVITY_LIMITS_CANON.md) |
| Inventory (audit) | [`docs/ssot/SOCIAL_ACTIVITY_LIMITS_INVENTORY.md`](docs/ssot/SOCIAL_ACTIVITY_LIMITS_INVENTORY.md) |
| Recommendations (advisory) | [`docs/ssot/SOCIAL_ACTIVITY_LIMITS_RECOMMENDATIONS.md`](docs/ssot/SOCIAL_ACTIVITY_LIMITS_RECOMMENDATIONS.md) |
| Volume governance | [`docs/ssot/OUTBOUND_VOLUME_AND_LIMIT_GOVERNANCE.md`](docs/ssot/OUTBOUND_VOLUME_AND_LIMIT_GOVERNANCE.md) |

Триггеры: `лимит`, `limit`, `кап`, `cap`, `потолок`, `ceiling`, `квота`, `quota`, `гейт`, `gate`, `rate limit`, `throttle`, `daily cap`, `per day`, `warmup`, `прогрев`, `разгон`, `invite cap`, `action block`, `поднять лимит`, `повысить лимит`.

---

## Universal Growth Score audit pre-router (highest priority)

**Russian presentation variants:** explicit requests for `v6.1`, `v6.2`, Expert-style or three report views read [`docs/ssot/CAESTHETIC_REPORT_PRESENTATIONS.md`](docs/ssot/CAESTHETIC_REPORT_PRESENTATIONS.md). v6 remains the default; v6.1/v6.2 reuse the exact Expert design on the same single-location facts. Template maintenance does not start client intake. Network packages keep their existing contract.

Apply `growth-score-authoring-route/3.0.0` before repo/project selection: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md#canonical-authoring-route`. Audit deliverable requests using `аудит`, `отчёт`/`отчет`, `Growth Score`, `Multi-Location Growth Score`, `score`, `audit report`, `report`, `diagnostic`, `проверка бизнеса`, `поиск утечек`, `Top 3 gaps` or `binding constraint` resolve to CAESTHETIC. For a new audit start exactly: **Вы создаёте новый аудит? Ответьте на вопросы.** Reuse supplied facts; ask only missing intake fields. Existing reports resume their recorded stage; canon/routing/template maintenance reads or updates the canon without starting a client interview. Unrelated financial, security, code or sports reports/scores retain their domain.

New single-location RU/EN reports use `createGrowthScoreV6ReportTemplate({locale: "ru"})` and `growth-score-client/v6.0.0`, like Spoken's approved design, with empty client fields. Workflow: minimum intake → autonomous research scope → public research → complete Russian v6 pilot → named-manager corrections/APPROVE → frozen facts/decisions → translation → named-human translation QA → publication/access QA → delivery. No new diagnosis during translation; changed decisions return to Russian review. Multi-Location keeps its network parent/focus child and paired Russian approval. Historical routes and client-specific Spoken terms are not template defaults. Executable router: `scripts/caesthetic/growth-score-intent-router.mjs`. These are existing product/evidence decisions, not routine execution permission gates.

After the minimum subject/location context is resolved, AI prepares the research scope and performs public research autonomously. No manager approval of alignment, sources, service scope, query set, evidence or candidate priorities may block creation of the complete Russian audit. The first request to review AI work is the complete Russian audit; uncertainties remain explicit and unsupported scores/priorities remain unset. Final named-human evidence/focus/report approval, translation and publication gates apply after that Russian artifact exists.

---

## 0. Token budget (mandatory)

| Do | Don't |
|----|-------|
| `agent:context <id>` → read ≤3 `read_first` | Dump full `ROUTER.md` / archived CLAUDE essays |
| Task row in `docs/READING_ORDER.md` | Open `docs/archive/**`, screenshots, dual Reports |
| Always-on Cursor rules ≤8 slim files | Re-enable bulky `alwaysApply: true` essays |
| New `site-*` only via `SITE_ROOT_INVENTORY.md` | Invent orphan site roots |

`CLAUDE.md` / `docs/CLAUDE.md` are **shims** → this file.

---

## 1. Safety (non-negotiable)

| Rule | Detail |
|------|--------|
| No destructive git | `git reset --hard`, `git push --force` — forbidden unless founder literal command |
| No secret paste | Deploy tokens, service role keys, PATs — never in git/chat |
| Checkout golden | Unlocked (DEC-599). Do not wait for founder OK. |
| No execution/human-approval gates | **DEC-875:** no project may add `founder_approved`, wait-for-OK, or HITL stops. SSOT `docs/ssot/NO_HUMAN_APPROVAL_GATES.md` |
| SSOT source | GitHub `origin/main` is code truth; verify with `git fetch` before reads |

---

## 2. Git / main policy

```bash
cd /var/www/grainee-v2
git fetch origin main -q && git pull --ff-only origin main
```

- Push to `main` via normal merge/PR — no force-push.
- **`main` is the only resting state.** A feature branch is transport: merge it into `main` in the same task, push, delete it. Never ask «мержить?» and never leave an open PR for a human to merge.
- Merge mechanics: `git fetch origin main` → rebase branch on `origin/main` → re-run touched-zone guards → fast-forward merge → `git push origin main` (non-force).
- Conflict → rebase and re-verify; duplicate commits (same change, different SHA) → drop yours, never replay `main`. Force-push stays forbidden.
- Leave a branch unmerged only when it holds unverified/unrelated WIP or secrets — and then name that branch in the report instead of silently parking it.
- **Structural Phase 1 PRs:** docs/control-plane only — **no production deploy** unless integrator explicitly ships runtime.
- Parallel agents: pull before push; on reject → rebase, not force.

---

## 3. Pick project or knowledge domain context

### CAESTHETIC products and implementation services

CAESTHETIC «продукты», «услуги», «implementation catalog», «Sprint services», «что мы делаем» → `docs/ssot/CAESTHETIC_PRODUCTS_AND_SERVICES.md` (First Sprint / Inside-out, 30D/LONG/ONGOING, M2+, dependencies). The master retains funnel/pricing authority. For a list of deliverable services read this catalog; for the approved Connect4 explanation use the concept route below. No per-service prices or new public SKUs are implied.

### Connect4 / 4444 — shared explanation route

Any discussion or authoring of **Connect4**, **4444**, **Четверки** or **Четвёрки** routes to [`docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md`](docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md#connect4-routing) on current `zaomir/grainee-v2/main`, regardless of the niche used in the example. Read the master `docs/ssot/CAESTHETIC.md` for commercial boundaries; use the concept SSOT for the approved definition, client-neutral vocabulary, EN/RU base copy, landing, reusable section and visual grammar. These are aliases of one program, not permission to invent a new group of four. Public name: **Connect4**.

The same route applies to Connect4 “How we work” / «Кто мы и что делаем» content in Cases, reports, diagrams, presentations and future website work. Reuse the approved blocks; do not reconstruct the concept from chat memory or copy a stale satellite version. User-provided images and client-specific evidence retain their separate contracts. This knowledge route does not publish a page, modify historical reports or change another project's products. Satellite-only access uses the identical path in `zaomir/caesthetic` and reports the actual available version. Detailed topic routing: `docs/projects/caesthetic/ROUTER.md`.

**Expert Dental from a CAESTHETIC-only workspace:** read the generated
`docs/external/grainee-v2/expert-dental/` reference tree in
`zaomir/caesthetic`. It is a hybrid bidirectional working mirror: non-PHI
project documents under `docs/projects/healthcare-ecosystem/`,
`docs/projects/raimovdental/` and `docs/raimov/` sync back to the same relative
paths here. Legal, runtime, SSOT, deploy and agent-routing files remain
one-way from `grainee-v2`; patient records, PHI, secrets, private folders and
raw recordings are excluded. After every writeback this repository remains
the only authority.

**Registry:** `agents/registry.yaml` (`version: 2` — `domains:` + `projects:`)  
**Manifests:** `agents/manifests/<id>.yaml` (`type: knowledge-domain` or runtime project)  
**Domain docs:** `docs/projects/<domain-id>/` (knowledge grouping)  
**Runtime docs:** `docs/projects/<project-id>/AGENTS.md`  
**Generated index:** `agents/generated/context-index.json`

```bash
# Runtime unit (site / infra deploy scope):
node scripts/repo/agent-context.mjs rovlex
node scripts/repo/agent-context.mjs toxifillers

# Knowledge domain (strategy / docs grouping):
node scripts/repo/agent-context.mjs marketing-ecosystem
node scripts/repo/agent-context.mjs bototox

# Optional wrapper (may fail if Corepack/pnpm broken on host):
pnpm agent:context <domain-or-project-id>
```

**Domains vs runtime projects:** A *knowledge domain* holds strategy docs and maps to one or more *runtime projects* (deployable `site-*` / infra roots). `agent:context` resolves either kind; output includes `resolve.type=domain|runtime_project`.

Fallback: read manifest `read_first` (≤3 files) if `agent:context` fails.

### Knowledge domains (10)

| Domain ID | Name | Status | Runtime projects |
|-----------|------|--------|------------------|
| `marketing-ecosystem` | Marketing Ecosystem | active | rovlex, evo, grainee |
| `development-ecosystem` | Development Ecosystem | active | oxford-frame, vola, diroco, aloik, artemis |
| `healthcare-ecosystem` | Healthcare Ecosystem | active | raimovdental |
| `caesthetic` | CAESTHETIC | active | caesthetic |
| `data-platform` | Data Platform | active | platform, opserva |
| `bototox` | US Pharma & Aesthetic Marketing | active | toxifillers |
| `farmers-island` | Farmers Island | planned | — |
| `mmjherb` | MMJHERB | planned | — |
| `ca-eu-trade` | Central Asia → EU Trade House | planned | — |
| `personal` | Personal | private-knowledge | — (no public deploy) |

SSOT: `docs/ssot/PROJECT_DOMAIN_REGISTRY.md`, `docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md`

### Runtime projects (13 active units)

| Project | Knowledge domain | Roots |
|---------|------------------|-------|
| rovlex | marketing-ecosystem | `site-rovlex/` |
| evo | marketing-ecosystem | `site-evo/`, `cabinet-app/` |
| grainee | marketing-ecosystem | `site/` |
| vola | development-ecosystem | `site-volacapital/`, `site-volaup/` |
| oxford-frame | development-ecosystem | `site-oxfordframe/` (aliases: oxford, oxfordframe) |
| diroco / aloik | development-ecosystem | `site-diroco/`, `site-aloik/` |
| raimovdental | healthcare-ecosystem | `site-raimovdental/` |
| caesthetic | caesthetic | `site-caesthetic/` (use `project:caesthetic` for explicit runtime context) |
| toxifillers | bototox | `site-toxifillers/` (use domain `bototox` for knowledge; runtime id stays `toxifillers`) |
| opserva | data-platform | `site-opserva/` (isolated deploy target `opserva`) |
| artemis | development-ecosystem | `site-artemis/` (public-safe mirror of `zaomir/artemis`) |
| platform | data-platform | `supabase/`, `scripts/`, `deploy/` |

**Note:** `bototox` is a knowledge domain id, not a runtime project alias. Runtime commerce site resolves as `toxifillers`.

---

## 4. Conflict-file rules (integrator merge)

These files need coordinated merge — one owner per PR:

| File | Owner lane |
|------|------------|
| `AGENTS.md` | platform / integrator |
| `START.md` | integrator (use `agents/START.shim.md`) |
| `docs/ROUTER.md` | platform (thin router only in Phase 1) |
| `package.json`, lockfiles | Lane B / integrator |
| `pnpm-workspace.yaml` | integrator |

Phase 1 Lane A does **not** edit runtime, lockfiles, or deploy scripts.

---

## 5. Universal Definition of Done

1. Task-scoped files only in commit (no unrelated WIP).
2. Local smoke / guards for touched zone:
   ```bash
   node scripts/repo/docs-guards.mjs
   node scripts/repo/docs-index.mjs
   ```
3. Land on `main`: merge the finished branch yourself (§2), push, delete it. An open PR handed to a human = not done.
4. **Runtime / site-* / public surface tasks (hard DoD, DEC-773 / DEC-887):** `main` + production deploy + public prod curl smoke + recorded `deployed_sha` (or release marker). Incomplete if stopped at «код готов / PR / CI green / можно деплоить / готово локально» or if the environment blocked `git push` without a GitHub-connector + Agent API fallback. ChatGPT without VDS: write allowlisted `docs/agent-api/requests/*.json` (`type=deploy`) → Agent API Bridge → read `docs/agent-api/results/*.json` (SSOT `docs/ssot/AGENT_API_ACCESS.md`). Agents with VDS/hook: `scripts/agent-deploy.sh --smoke …`.
5. **Docs tasks:** update `docs/CONTEXT_HANDOFF.md` / `docs/LAST_SYNC.md`.
6. Prod FAIL → revert + redeploy (runtime only).

---

## 6. Archive & deprecated docs

- Check `docs/DEPRECATED.md` and `docs/global/ARCHIVE_POLICY.md` before creating SSOT.
- Do not use `docs/archive/**` as active source.
- One active SSOT per topic (manifest `topics:` keys).

---

## 7. Design (EVO / shared UI)

Before HTML/CSS in `site-evo/` or Design Kit surfaces:

1. `docs/ssot/DESIGN_SYSTEM_KIT.md`
2. `site-evo/design-system/template.html`
3. `site-evo/design-system/components.css`

Only `var(--*)` tokens — no hex hardcodes.

---

## 8. Website Studio + Impeccable (all public pages/sites)

When a task creates a new public page, landing, site, page template, content hub, visual system or major redesign, every LLM and agent must read **before planning, copy, design or code**:

1. `docs/ROUTER.md` → section `WEBSITE STUDIO`.
2. `docs/ssot/WEBSITE_STUDIO_STANDARD.md`.
3. `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`.
4. Project manifest `read_first` + project `PRODUCT.md`/brief + project `DESIGN.md`.
5. Production tokens/components and project testing/deploy/rollback SSOT.

Impeccable is the mandatory execution-quality layer, not the source of product truth. Project SSOT controls facts, offer, proof, legal, identity and tokens. Before handoff, perform targeted Impeccable passes, then `/impeccable polish` or `/impeccable audit`, and run the detector on the touched UI scope.

Repository commands:

```bash
pnpm impeccable:install   # requires Node.js 22.12+
pnpm impeccable:update
pnpm impeccable:detect -- <target>
pnpm website:quality
```

No invented proof, no reference clone, no generic AI slop, and no mass page generation before one representative template passes responsive, accessibility, performance, SEO/AEO and detector gates. Cursor additionally follows `.cursor/rules/00-website-studio-read-first.mdc` and `.cursor/skills/impeccable-website/SKILL.md`.

---

## 9. Codex

Codex: read English section in full `AGENTS.md` on `main` or use `CODEX.md`. GitHub SSOT preflight: `bash scripts/codex-github-preflight.sh`.

---

## 10. Help

| Need | File |
|------|------|
| Social activity limits / лимиты, капы, гейты, прогрев | `docs/ssot/SOCIAL_ACTIVITY_LIMITS_CANON.md` · `scripts/limits/intent-router.mjs` |
| Twenty CRM / CRM twenty / controlcenter | `docs/ssot/TWENTY_CRM.md` · `scripts/twenty/intent-router.mjs` |
| Connect4 / 4444 / Четверки / Четвёрки explanation | `docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md` |
| Pricing (EVO products) | `docs/ssot/PRICING_AND_PRODUCTS.md` |
| Token economy (agents) | `docs/ssot/AGENT_TOKEN_ECONOMY.md` |
| Site root freeze | `docs/ssot/SITE_ROOT_INVENTORY.md` |
| URL routing | `docs/ROUTER.md` |
| Website/page creation standard | `docs/ssot/WEBSITE_STUDIO_STANDARD.md` |
| Impeccable agent standard | `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md` |
| SSOT index | `docs/ssot/INDEX.md` |
| Reading order | `docs/READING_ORDER.md` |
| Deploy channels | `docs/ssot/AGENT_DEPLOY_CHANNELS.md` |
| Mac local folders / new laptop agent setup | `docs/ssot/MAC_LOCAL_AGENT_LAYOUT.md` |
| Telegram desk (бот + человек) | `docs/ssot/TELEGRAM_BOT_DESK_STANDARD.md` |
| Archive policy | `docs/global/ARCHIVE_POLICY.md` |

*Phase 1 control plane — full legacy AGENTS preserved in git history pre-slim merge.*

