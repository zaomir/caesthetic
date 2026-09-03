# AGENTS.md — caesthetic Cursor Agents satellite

## 0. Universal Growth Score audit pre-router (highest priority)

Apply this rule before repository/project routing. Minimal trigger: after
case/dash/spacing normalization, any whole Russian or English synonym in
`docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`, standalone English
`audit` form or ordinary Russian `аудит` form routes to `growth_score_audit`.

Before any substantive work, resolve the current `zaomir/caesthetic` `main`
and read the following authorities from that same current ref, in order:

1. `docs/ssot/CAESTHETIC.md`
2. `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`
3. `docs/caesthetic/growth_score_spec.md`
4. `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md`
5. `docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md`
6. `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`
7. for competitor work: `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`
8. for evidence or impact work: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
9. for publication work: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`

Items 1–6 are mandatory for every matched task; items 7–9 are mandatory when
their stated scope applies. If a required authority is missing, unreadable or
unavailable on the resolved current `main`, stop and report `BLOCKED: missing
authority <path>`. Do not reconstruct canon from chat/model memory or a lower
authority.

Authority order is:

`active master SSOT → Client Report Standard → growth_score_spec → Production SOP → implementation profile → working docs`.

Four Surfaces means exactly Search/Google Business Profile, Website, Social,
and Reputation/Reviews. Cross-Surface Consistency, Lead Intake,
Lead-to-Revenue and Paid Ads are not a fifth surface.

If there is no active `growth_score_audit` interview, the first sentence must
be exactly: **`Вы создаёте новый аудит? Ответьте на вопросы.`** In the same
response ask for: new/existing audit; business/project name and aliases;
official public links; single/Multi-Location format and location list; business
model, offer and audience; priority services/products; known competitors;
client goal; language, recipient and approving manager; network shared/local
assets and focus-location candidate; constraints. Use open sources only and
block full research until Research Alignment approval. If the interview is
already active, continue with missing questions without repeating the opening.
For a request as simple as `сделай аудит X`, the first operational action is
the authority preflight above and launch of the canonical audit workflow, not
research into X. This rule is identical in every supported repo and always
routes to the one CAESTHETIC Growth Score SSOT/template/pipeline; never create
an ad-hoc audit. Production remains in `zaomir/grainee-v2`.

Before taking any audit action, read and enforce
`docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`. It is the
mandatory local adapter pinned to the canonical Growth Score production SSOT.
Any conflict is fail-closed: report `BLOCKED: audit policy drift`; never choose
the weaker rule.

**Compound Engineering never runs before or around this pre-router.** Any CE
skill, plan, autonomous pipeline, reviewer or generated artifact is subordinate
to this section and to the mandatory audit adapter.

This repository is the **Cursor Agents** surface for CAESTHETIC.

| | |
|--|--|
| Knowledge domain | `caesthetic` |
| Agents project | `zaomir/caesthetic` (this repo) |
| Production SSOT + deploy | `zaomir/grainee-v2` → `site-caesthetic/` → https://caesthetic.com |
| Sync | Bidirectional DEC-829 — see `docs/projects/caesthetic/AGENTS_SATELLITE.md` |

## Read first

1. `START.md`
2. `docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`
3. `docs/ssot/CAESTHETIC.md`
4. `docs/projects/caesthetic/AGENTS.md`
5. `agents/manifests/caesthetic.yaml`
6. `STRATEGY.md` for the short agent-facing strategy index
7. `CODING_STANDARDS.md` for review criteria
8. `docs/compound-engineering/README.md` when using Compound Engineering

## Compound Engineering execution layer

Compound Engineering is an **execution and institutional-memory layer**, not a
new source of product truth. Configuration lives in
`.compound-engineering/config.yaml`; its artifacts live under
`docs/compound-engineering/`.

Authority order for any CE-enabled task:

1. current explicit user instruction, subject to mandatory safety/policy gates;
2. this universal pre-router plus the mandatory Growth Score adapter/canonical SOP;
3. canonical CAESTHETIC SSOT and project agent instructions;
4. repository routing/sync/deploy rules in `AGENTS.md` and `START.md`;
5. `STRATEGY.md` as a short index;
6. CE plans, solutions, pulse reports and other generated artifacts.

A lower layer must never silently weaken a higher one. Stop the affected action
and report the conflict when necessary.

For non-trivial software changes, prefer the governed loop:

`brainstorm (if needed) → plan → work → simplify → review → verify → PR → compound`

Risk-bearing changes — audit gates, routing, access/privacy, pricing,
publication, sync/deploy, integrations, data handling, or any silent-pass
verification mechanism — require durable guardrails, verification evidence and
review before merge. Well-bounded autonomous pipelines such as `lfg` are
allowed only after requirements are settled and only while every repository
specific gate remains enforceable. They must not merge or deploy around human
or canonical-repo gates.

Cross-provider model review is opt-in by default (`cross_model_review_mode:
off`). Do not enable it for secrets, credentials, PII/PHI, client-identifiable
private data or other material that must stay inside the active provider
boundary.

After a verified non-trivial fix or workflow discovery with reusable value,
capture the learning in the configured CE `solutions/` store. Prefer updating
or consolidating overlapping guidance instead of creating contradictory docs.

## Do

- Edit CAESTHETIC site, SSOT, working docs, scripts and tests under mirrored trees (`SYNC_MANIFEST.yml`)
- Keep four-surface model, human approval on Growth Score, no fabricated proof
- For trivial, mechanical, low-risk changes: existing direct completion path remains allowed when no higher-priority gate requires a PR
- For non-trivial/risk-bearing changes: branch → plan/guardrails → implementation → verification → structured review → PR/CI → merge through normal authority → sync Agents↔grainee → deploy from grainee if runtime
- After merge/completion, capture reusable learning when the task produced a non-trivial verified lesson

## Do not

- Deploy from this repo
- Invent clinic/practice facts or outcome guarantees
- Edit protected pricing without gates
- Commit secrets or client-identifiable data
- Mirror or recreate `site-caesthetic/private/`
- Open `grainee-v2` for CAESTHETIC-only chats (use **this** project in Cursor Agents picker)
- Let a CE artifact, autonomous pipeline or reviewer bypass Research Alignment, Focus Selection, publication, access, sync, deployment or other canonical gates
- Use the trivial fast path for behavior, policy, routing, pricing, privacy, publication, sync or deployment changes merely to avoid review

## Desktop IDE

Open multi-root workspace from grainee: `caesthetic.code-workspace`  
Or open this repo folder alone in Cursor Desktop.

## Cloud / Mobile Agents

1. Cursor → Cloud Agents → Environment for **`zaomir/caesthetic`**
2. Start agent chats on project **caesthetic** (not grainee-v2)
3. Setup guide: `docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md`
