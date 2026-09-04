# START

Read `/AGENTS.md`, then the nearest project-level `AGENTS.md` (or run `pnpm agent:context <project>`).

## Token budget (DEC-757)

Repo primary users = AI agents. Read `docs/ssot/AGENT_TOKEN_ECONOMY.md`. Prefer `agent:context` over dumping `ROUTER.md` / CLAUDE. Site roots: `docs/ssot/SITE_ROOT_INVENTORY.md`. **DEC-875:** no execution gates / human-approval in any current or future project (`docs/ssot/NO_HUMAN_APPROVAL_GATES.md`).

## Session bootstrap

```bash
cd /var/www/grainee-v2
git fetch origin main -q && git pull --ff-only origin main
git rev-list --left-right --count HEAD...origin/main  # expect 0 0 before edits
```

## Operational runtime state

Before continuing any existing project or interpreting a completed Work report, read:

1. `docs/runtime/PROJECT_RUNTIME_STANDARD.md`.
2. `docs/runtime/projects.json`.
3. Root runtime files, including `CURRENT_STATE.md`, `NEXT_ACTIONS.md`, `OPEN_DECISIONS.md`, `LAST_SHIP.md`, `WORK_LOG.md`, `PROJECT_HEALTH.md`, `TASKS.md`, `BACKLOG.md`, `DECISIONS.md`, `METRICS.md`, `CONTINUE_FROM.md` and `PENDING_COMMANDS.md`.
4. Project `CONTINUE_FROM.md` and `TASKS.md` under `docs/runtime/projects/<project_id>/`.
5. Remaining project runtime files and linked SSOT/report evidence.

Runtime files are the operational handoff source for ChatGPT and Work. `projects.json` is authoritative for aliases and state directories. A Work session must start from the task marked `Canonical=yes` in project `TASKS.md` unless the user explicitly selects another task, then finish by updating the full runtime packet before final report. Validate with:

```bash
python3 scripts/runtime/validate_runtime_state.py
```

## Pick project context

1. Identify project from task (domain, `site-*` path, or keyword).
2. Open `agents/registry.yaml` → find `manifest`.
3. Read manifest `read_first` (max 3 files).
4. Or: `pnpm agent:context <project>` (e.g. `rovlex`, `evo`, `vola`).

An Expert Dental task started from the CAESTHETIC satellite must read
`docs/external/grainee-v2/expert-dental/.mirror-manifest.json` and the mirrored
RAIMOV/Expert Dental authorities. That path is generated read-only. Only
non-PHI proposals under `docs/projects/caesthetic/expert-dental-contributions/`
are eligible for satellite-to-grainee writeback; legal and runtime authority
remains here in `grainee-v2`.

## Global cross-project routing

Before any task involving **outbound, cold outreach, prospecting, lead generation, demand generation, Instantly, Sales Navigator, LinkedIn/Instagram/TikTok/Reddit/Facebook outreach or content, multiprofile work, WhatsApp/Telegram commercial outreach, account-based marketing, partner origination or professional buyer acquisition**, read:

1. `docs/ssot/OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md`.
2. `docs/ssot/SOCIAL_ACCOUNT_CONTROL_PLANE.md` + `docs/ssot/data/social-account-registry.yaml` when any personal/authorised social account is involved.
3. `docs/ssot/SOCIAL_GROWTH_OPERATING_SYSTEM.md` for multi-network factory / content / inbox / approval layers; then the matching `docs/ssot/SOCIAL_ADAPTER_<PLATFORM>.md`.
4. Relevant domain/project SSOT (from registry `project_ssot` when set).
5. `docs/ssot/MASTER_CONTACTS.md`, `docs/ssot/OUTREACH_V4.md` and `docs/ssot/OUTREACH_SELECTIONS.md` as applicable.
6. `docs/ssot/LINKEDIN_MULTIPROFILE_OPERATING_MODEL.md` whenever a personal LinkedIn profile / Truth Pack allocation is involved.
7. ChatGPT social ops (inbox / calendar / approvals): `docs/ssot/ROVLEX_SOCIAL_CONTROL_MCP.md` + security companion — not Dolphin writes. Lifecycle remains `docs/ssot/DOLPHIN_PROFILE_CONTROL.md`.

Hard routing rules: one account receives one opening narrative; assign `project_origin` and a human owner before drafting; resolve owner → Dolphin workspace → surface before writes; personal social actions keep the named owner accountable (Agent Factory may execute only when registry `factory.status` allows); PII stays outside Git; no campaign bypasses evidence, compliance, suppression or GO/NO-GO; AI public text routes remain `/ru/text` and `/en/text`; Telegram CTA remains deeplink-only under `docs/ssot/TELEGRAM.md`; продажный бот + человек — `docs/ssot/TELEGRAM_BOT_DESK_STANDARD.md` (DEC-852).

## Where long-form entry docs went

| Topic | Path |
|-------|------|
| Deploy / secrets | `docs/ssot/AGENT_DEPLOY_CHANNELS.md`, `docs/ssot/AGENT_LOCAL_ENV.md`, `docs/ssot/GITHUB_SECRETS.md` |
| Outbound-led demand generation | `docs/ssot/OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md` |
| Archive policy | `docs/global/ARCHIVE_POLICY.md` |
| Generated docs index | `agents/generated/context-index.json` |
| Pre-Phase-1 START (full) | `docs/archive/entry/START.md.pre-phase1.md` |

**Phase 1 structural PRs:** no production deploy unless the task explicitly ships runtime.
