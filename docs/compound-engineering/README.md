# CAESTHETIC Compound Engineering Profile

This folder is the execution-memory layer for AI-assisted engineering in `zaomir/caesthetic`.

It does **not** replace the CAESTHETIC SSOT, Growth Score production SOP, mandatory agent enforcement, project agent instructions, or explicit user decisions. Those remain authoritative.

## Execution loop

For non-trivial software/product changes use this shape:

`brainstorm (when product shape is unsettled) → plan → work → simplify → review → verify → PR → compound`

Well-bounded autonomous software work may use the Compound Engineering `lfg` pipeline **only after** requirements are sufficiently settled and only when all repository-specific gates remain enforceable.

## Artifact layout

Because `.compound-engineering/config.yaml` sets `docs_root: docs/compound-engineering`, CE artifacts live here:

- `plans/` — requirements and implementation guardrails;
- `solutions/` — reusable verified learnings;
- `ideation/` — optional early exploration;
- `pulse-reports/` — observation reports when product telemetry is later connected.

## Required grounding before work

Every agent must still follow the repository cold start in `START.md` and `AGENTS.md`. For Growth Score/audit work the mandatory pre-router and `docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md` run **before** any Compound Engineering skill or workflow.

## Risk-bearing changes

Treat these as requiring a durable plan, verification, and review before merge:

- Growth Score routing, scoring, evidence, approval, publication, or catalog logic;
- authentication, access, password, privacy, or client data handling;
- pricing and commercial gates;
- deployment, synchronization, canonical-repo routing, or CI gates;
- CRM, telephony, payments, medical/clinical workflow, or third-party integrations;
- changes that can silently report success while the real production path is broken.

## Cross-model review

Cross-provider review is disabled by checkout config by default. It may be enabled for a specific run only when the task owner explicitly requests it or the agent has confirmed that the review payload contains no secrets, PII/PHI, client-identifiable private data, or other material that must remain inside the active provider boundary.

## Completion model

### Non-trivial work

1. Work on a branch/worktree.
2. Produce implementation/verification evidence.
3. Run structured review against `CODING_STANDARDS.md` and the governing plan.
4. Apply eligible fixes and preserve unresolved findings.
5. Open/update a PR and require CI/review to be decided.
6. Merge through the repository's normal authority path.
7. Only after merge: perform the Agents↔grainee synchronization and canonical deployment path required by `AGENTS.md`.
8. Capture reusable learning in `solutions/` when the work produced one.

### Trivial fast path

Purely mechanical, low-risk changes already specified down to the affected files may use the existing direct completion path when no higher-priority rule requires a branch/PR. The fast path must not be used to avoid review for behavior, policy, routing, pricing, privacy, publication, sync, or deployment changes.

## Installing the upstream plugin

The repository profile is useful even when a host cannot install plugins, because the authority, standards, and artifact conventions are committed here. On supported hosts, install the official `EveryInc/compound-engineering-plugin` using that host's documented plugin mechanism, then run its setup command in this checkout. Do not let setup overwrite or weaken this committed profile.
