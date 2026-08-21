---
owner: CAESTHETIC
status: active
updated: 2026-08-21
scope: Growth Score operator queue, SLA, transitions, delivery
related:
  - docs/founder-notes/DEC-848.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md
  - scripts/caesthetic/growth-score-ops.mjs
---

# Growth Score — operator runbook

Production authority stays in **grainee-v2** (DEC-829). The public satellite mirrors code; do not deploy from `zaomir/caesthetic`.

## Daily operator loop

Run from `/var/www/grainee-v2` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` loaded (host secrets or `/root/.cursor/secrets.env`):

```bash
node scripts/caesthetic/growth-score-ops.mjs drain
node scripts/caesthetic/growth-score-ops.mjs overdue
node scripts/caesthetic/growth-score-ops.mjs reconcile
```

| Command | Purpose |
|---------|---------|
| `drain` | Process due outbox jobs: internal email, Telegram, customer acknowledgement, manual JSONL board, funnel events |
| `overdue` | List cases past triage or delivery SLA (JSON; case/lead ids + owner only) |
| `reconcile` | Surface cases missing owner/next_action, dead-letter outbox rows, overdue counts |

Retry policy: failed jobs backoff `attempts²` minutes; dead-letter after 8 attempts. Missing Resend/Telegram secrets mark the job failed — the CLI does not crash.

## SLA and capacity

| Rule | Value |
|------|-------|
| Default owner | Valerie Petra (`CAESTHETIC_SCORE_DEFAULT_OWNER` override) |
| Same-day triage | Target within 8 hours of intake (`triage_due_at`) |
| Delivery window | 5 calendar days; +7 days when rolling 7-day open cases ≥ 3 |
| Weekly throughput | Plan for **2–3 Scores per week** |
| Backlog | Valid owner requests are **never rejected**. Capacity marks `capacity_state=backlogged` and extends delivery SLA |

Customer acknowledgement (outbox) states same-day triage expectation and **does not promise a delivery date** before capacity review.

## Operating board

**Asana is not the source of truth.** The durable queue is Supabase outbox + `docs/projects/caesthetic/operations/growth-score-board.jsonl` (appended by `queue_manual_board` drain jobs).

## Case lifecycle (transitions)

All state changes go through RPC — never direct `UPDATE state`:

```bash
node scripts/caesthetic/growth-score-ops.mjs transition \
  --case <score_case_id> \
  --to <state> \
  --actor "Valerie Petra" \
  --reason <reason_code>
```

Allowlisted path:

```text
created → researching | closed
researching → draft_review | closed
draft_review → fact_set_frozen | researching | closed
fact_set_frozen → report_review | draft_review | closed
report_review → approved | fact_set_frozen | closed
approved → delivered | closed
delivered → closed
```

Human-gated edges (`fact_set_frozen`, `approved`, `delivered`) require a named human actor (`First Last`). QA/TEST leads auto-close at intake — **do not re-queue `qa_test` or manually reopen QA cases for production triage.**

Typical operator flow:

1. **created → researching** — same-day triage complete; owner assigned
2. **researching → draft_review → fact_set_frozen → report_review → approved** — evidence and schema-v4 review
3. **deliver** — record private path and walkthrough readiness:

```bash
node scripts/caesthetic/growth-score-ops.mjs deliver \
  --case <score_case_id> \
  --path /score/<slug>/ \
  --actor "Valerie Petra" \
  [--walkthrough-ready] \
  [--report <approved_report_uuid>]
```

Delivery requires case state `approved`. The RPC writes delivery evidence and transitions to `delivered`.

4. **delivered → closed** — Sprint measurement complete or case archived

## Notifications

Outbox job types: `notify_internal_email`, `notify_admin_telegram`, `notify_customer_ack`, `queue_manual_board`, `emit_funnel_event`.

`notification_sent` on the lead means at least one internal channel (email or Telegram) was accepted by the provider during drain — not that a named owner accepted the case.

## Funnel measurement

Server-side funnel events are non-personal (source/UTM class, case id, lead id). No name, email, phone, or practice legal name in `caesthetic_score_funnel_events`.
