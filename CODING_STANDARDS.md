# CAESTHETIC Coding & Agent Review Standards

These are enforceable review criteria for code, configuration, agent instructions, workflow files, and generated engineering artifacts in this repository. They supplement, but never override, the canonical SSOT and mandatory Growth Score enforcement rules.

## Authority and routing

- A changed file must not weaken or bypass `AGENTS.md`, `START.md`, the mandatory Growth Score enforcement adapter, or a canonical SSOT gate.
- Growth Score/audit handling must preserve the universal pre-router and fail closed on policy drift.
- Generated plans, solutions, or Compound Engineering artifacts are advisory/execution artifacts; they must never become a competing source of product truth.

## Evidence integrity

- Never fabricate clinic facts, rankings, reviews, outcomes, revenue, conversion, patient volume, or proof.
- Unknown or contradictory audit evidence must remain `Insufficient evidence`; absence of evidence is not zero.
- Any public-evidence claim intended for an audit must retain reproducible provenance according to the canonical audit SOP.
- Never introduce client-identifiable data, credentials, secrets, PHI, patient records, or private operational data into tracked repository artifacts.

## Growth Score gates

- Full audit research must remain blocked until the exact Research Alignment version is approved by the named manager.
- AI must not auto-select the final Primary Gap or Supporting Gaps when the canonical workflow reserves that decision for a human.
- No audit compilation, publication, or delivery may bypass its applicable human approval, access, password, `noindex`, or catalog gate.
- Single-location and Multi-Location behavior must remain traceable to the canonical SOP; aliases must route to the same governed workflow.

## Software change discipline

- Non-trivial behavior changes must have explicit verification evidence before they are considered complete.
- Risk-bearing changes (routing, auth/access, pricing, publication, deployment, sync, data handling, integrations, audit gates) require an implementation plan or equivalent durable guardrails and a review before merge.
- Tests must assert observable behavior and failure paths, not merely exercise lines of code.
- A change that can silently make a gate pass while the real workflow is broken is a high-risk change and requires adversarial review.
- Do not silently change public routes, redirects, canonical URLs, synchronization contracts, deployment origin, or protected pricing.

## Git, sync, and deployment

- `zaomir/caesthetic` is the agent-working surface; production SSOT/deploy authority remains where `AGENTS.md` declares it.
- A non-trivial Compound Engineering run should produce a branch/PR with review and verification before merge; sync/deploy happens only after the approved change reaches the canonical branch.
- Trivial, mechanical, low-risk changes may use the existing direct fast path if all higher-priority repository rules allow it.
- Never deploy from this repository when the declared production workflow requires deployment from `zaomir/grainee-v2`.

## Institutional learning

- After a verified non-trivial fix or workflow discovery with reusable value, capture the learning under the configured Compound Engineering `solutions/` store.
- A learning record must distinguish verified facts from assumptions and should include what did not work when that information would prevent repeat investigation.
- Prefer updating/consolidating an overlapping solution over creating contradictory duplicate guidance.
