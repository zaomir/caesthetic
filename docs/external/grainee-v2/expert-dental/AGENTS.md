# AGENTS.md — root agent entry (Phase 1 slim + DEC-757 token budget)

All AI agents (Cursor, Codex, Eva, Roo) start here. **Humans are not the primary UI for this repo** — optimise for agent token economy (`docs/ssot/AGENT_TOKEN_ECONOMY.md`).

---

## Universal Growth Score audit pre-router (highest priority)

Apply this rule **before repository, project or knowledge-domain selection**. It is repository-independent and must behave identically in `grainee-v2`, `caesthetic`, `raimovdental` and `artemis`.

If there is no active `growth_score_audit` interview in the current thread and the user mentions **`Multi-Location Growth Score`**, **`Growth Score`** or Russian **`аудит`** (including ordinary grammatical forms), the first sentence of the response must be exactly:

> Вы создаёте новый аудит? Ответьте на вопросы.

In the same response, start the manager questionnaire: new or existing audit; business/project name and aliases; official public links; single or Multi-Location format; location list; business model, offer and audience; priority products/services; known competitors; client goal; report language, recipient and named approving manager; shared/local assets and focus-location candidate for a network; constraints. Use public/open sources only. Full research is blocked until named-manager Research Alignment approval. Canonical intent and runtime live in `zaomir/grainee-v2` → CAESTHETIC, regardless of the currently connected repo.

If the interview is already active, do not repeat the opening; treat the message as an answer and ask only the still-missing questions. No project-local instruction may suppress or replace this pre-router.

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

**Expert Dental from a CAESTHETIC-only workspace:** read the generated
`docs/external/grainee-v2/expert-dental/` reference tree in
`zaomir/caesthetic`. It mirrors this repository one-way and is never an
editable legal/runtime SSOT. Only non-PHI proposals under
`docs/projects/caesthetic/expert-dental-contributions/` may sync back through
DEC-829; patient records, PHI, secrets, private folders and raw recordings are
excluded.

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
4. **Runtime / site-* / public surface tasks (hard DoD, DEC-773):** `main` + production deploy + public prod curl smoke + recorded `deployed_sha` (or release marker). Incomplete if stopped at «код готов / PR / CI green / можно деплоить». ChatGPT without VDS: write allowlisted `docs/agent-api/requests/*.json` (`type=deploy`) → Agent API Bridge → read `docs/agent-api/results/*.json` (SSOT `docs/ssot/AGENT_API_ACCESS.md`). Agents with VDS/hook: `scripts/agent-deploy.sh --smoke …`.
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
