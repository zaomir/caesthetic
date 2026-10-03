# AGENTS.md — root agent entry (Phase 1 slim + DEC-757 token budget)

<!-- durable-agent-execution:v1 -->
## Durable execution / restart
Before long-running work or retry, read `.agent-execution/README.md` and the
existing task checkpoint. Use bounded atomic iterations; persist pending intent
before side effects and verified evidence/next action after each significant
unit. UI stream is not state. Reconcile pending operations and skip matching
verified work on restart. Run `python3 .agent-execution/check.py` before ship.
This execution adapter preserves all project, privacy, merge, sync and deploy
authorities below; it does not activate scheduling or outreach.
<!-- /durable-agent-execution:v1 -->

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
| Skill | [`.cursor/skills/twenty-crm/SKILL.md`](.cursor/skills/twenty-crm/SKILL.md) |

Поиск «CRM twenty» без этого роутера = FAIL. Не открывать SENDER1 Intake вместо канона. MAP2 остаётся воронкой `ru.tc/money`.

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
| Skill | [`.cursor/skills/sender1/SKILL.md`](.cursor/skills/sender1/SKILL.md) |

Intake **overrides** «не спрашивай — делай». Mega-runner / Dolphin REST на `:13000` = FAIL (docs-guards).

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

### Knowledge domains (9)

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
3. Push to `main` (or feature branch → merge by integrator).
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
| Telegram desk (бот + человек) | `docs/ssot/TELEGRAM_BOT_DESK_STANDARD.md` |
| Archive policy | `docs/global/ARCHIVE_POLICY.md` |

*Phase 1 control plane — full legacy AGENTS preserved in git history pre-slim merge.*

