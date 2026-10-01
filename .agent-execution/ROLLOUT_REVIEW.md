# Durable execution rollout — plan and structured review

Scope: generic .agent-execution package, root routing and path-scoped CI only.
Preserve Growth Score gates, pricing, privacy, sync manifests, protected mirrors
and production origin. No deploy or new scheduling. Source code hashes are pinned.

Verification: six recovery failure-path tests passed locally; package checker
validates hashes and task journals. PR CI is required before merge.
Review against CODING_STANDARDS: authority unchanged; no client payloads, secrets,
provider actions or audit decisions; AGENTS content preserved; fail-closed evidence
and revision checks retained. Exactly-once/Windows/automatic restart limits stated.
No unresolved scope findings; external CI outcome is recorded in rollout receipts.
