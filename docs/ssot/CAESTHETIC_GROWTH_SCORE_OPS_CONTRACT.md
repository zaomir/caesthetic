---
owner: CAESTHETIC
status: active
version: 1.0
updated: 2026-08-21
scope: Growth Score intake, queue, status, notification and funnel contract
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/founder-notes/DEC-848.md
  - docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md
  - docs/ssot/CAESTHETIC_ACQUISITION_DIAGNOSTIC_GROWTH_CONTROL_SYSTEM.md
  - scripts/caesthetic/growth-score-ops-contract.mjs
---

# CAESTHETIC Growth Score — ops contract

Executable constants live in `scripts/caesthetic/growth-score-ops-contract.mjs`. This file is the human SSOT. Product diagnosis rules stay in `docs/ssot/CAESTHETIC.md` and `docs/caesthetic/growth_score_spec.md`.

## Identity

One `score_case_id` is the join key for lead, status events, outbox jobs, evidence, drafts, approved report, delivery evidence and Sprint inquiry.

## Intake transaction

Required POST `intake_version=caesthetic-growth-score/2.0` + `intake_stage=required` must atomically create:

1. `caesthetic_growth_score_leads`
2. `caesthetic_score_cases` (`source_kind=owner_intake`, `state=created`)
3. first `caesthetic_score_status_events` row (`created`)
4. outbox jobs: internal email, Telegram, customer acknowledgement (non-QA), manual-board task, funnel `lead_created`

Optional enrichment updates context only. It never creates a second case, never re-notifies, never changes eligibility.

## Owner, SLA, capacity

| Field | Rule |
|---|---|
| `owner_name` | Default `Valerie Petra`; override `CAESTHETIC_SCORE_DEFAULT_OWNER` |
| `next_action` | `triage_same_day` on create; `qa_archived` for TEST/QA; `capacity_hold_triage` when backlogged |
| `triage_due_at` | `created_at + 8h` (same-business-day target) |
| `delivery_due_at` | `created_at + 5d`; `+7d` more if rolling 7-day open cases ≥ 3 |
| Capacity | Accept the request; mark `capacity_state=backlogged`; do not 429 a valid owner |

Overdue = `now() > triage_due_at` while state is `created`, or `now() > delivery_due_at` while state is not `delivered`/`closed`.

## Transitions

Only via `transition_caesthetic_score_case` RPC / `scripts/caesthetic/growth-score-ops.mjs`. Direct `UPDATE state` is forbidden.

```text
created → researching | closed
researching → draft_review | closed
draft_review → fact_set_frozen | researching | closed
fact_set_frozen → report_review | draft_review | closed
report_review → approved | fact_set_frozen | closed
approved → delivered | closed
delivered → closed
```

Human-gated edges (`fact_set_frozen`, `approved`, `delivered`) require a named human actor and reason. QA auto-close is `created → closed` with reason `qa_archive`.

## Notifications

Outbox job types: `notify_internal_email`, `notify_admin_telegram`, `notify_customer_ack`, `queue_manual_board`, `emit_funnel_event`.

Retry visible to the operator. Dead-letter after bounded attempts. Customer acknowledgement states the same-day triage target and does not promise a delivery date before capacity check.

## Funnel events (no PII)

`lead_created` → `case_created` → `triaged` → `approved` → `delivered` → `sprint_inquiry`

Store source/UTM class, case id, timestamps. Do not store name, email, phone or practice legal name in the analytics table.

## CORS and abuse

Public submit CORS allowlist: `https://caesthetic.com`, `https://www.caesthetic.com`, plus local `http://127.0.0.1` / `http://localhost` for tests. Rate limit required-stage inserts per IP and per email. Do not add CAPTCHA until an ads/abuse DEC says so.

## Deploy and satellite

Production authority: `zaomir/grainee-v2`. Satellite `zaomir/caesthetic` mirrors via DEC-829. Do not deploy from the satellite.
