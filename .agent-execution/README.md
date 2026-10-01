# Durable execution: repository adapter

Execution contract: [grainee-v2 operational standard](https://github.com/zaomir/grainee-v2/blob/main/docs/runtime/PROJECT_RUNTIME_STANDARD.md#bounded-atomic-iterations-and-stream-recovery-2026-10-01).
This package copies reusable execution logic only. This repository's current
AGENTS, business facts, privacy, release, merge, sync and deploy rules retain
authority. No outreach, publication, scheduler or production activation is added.

## Start and resume

Work from the current default branch. Read AGENTS and this file, then the
existing task's canonical checkpoint before any retry/restart. Default local
state is `.agent-execution/state/<stable-task>.checkpoint.json`; an existing
project journal/private store may remain canonical if its pointer is recorded
there. Never create parallel task truth; resume the recorded original journal.

```bash
# Repository root; same stable path across attempts:
python3 .agent-execution/atomic_checkpoint.py --state .agent-execution/state/<task>.checkpoint.json resume
# New task ONLY (not recovery):
python3 .agent-execution/atomic_checkpoint.py --state .agent-execution/state/<task>.checkpoint.json init \
  --task <stable-task-id> --base-sha <full-current-default-branch-sha> --next-action <first-unit>
# Durable pending intent BEFORE ONE authorized unit:
python3 .agent-execution/atomic_checkpoint.py --state .agent-execution/state/<task>.checkpoint.json begin \
  --revision <current-revision> --key <task-stage-target-input-version> \
  --input-sha256 <input-manifest-sha256> --action <unit-and-provider-request-id>
# Independently read back success; save sanitized evidence, then:
python3 .agent-execution/atomic_checkpoint.py --state .agent-execution/state/<task>.checkpoint.json verify \
  --revision <current-revision> --key <same-key> \
  --evidence <stable-repository-relative-evidence-path> --next-action <next-unit>
python3 .agent-execution/check.py
```

Before the first side effect, also retain the user's authorization, scope,
corrections and acceptance criteria in a sanitized task manifest linked by the
input digest. Private payloads remain in the approved private store.

## Bounded work and persistence

One iteration = one independently verifiable work unit; default <=300 seconds.
Split longer work into tracked worker jobs, save their IDs and poll <=60 seconds.
Persist pending intent before a side effect; verified evidence hashes and next
action after every significant iteration. Commit/push through this repo's normal
branch/PR rules before the next substantial unit, or use the linked durable store.
Chat/UI streaming is never the only state carrier. Persistence failure stops new
side effects until repaired.

Use stable keys tied to task/stage/target/input version, not fresh timestamps on
retry. Matching verified work is skipped; changed dependencies invalidate only
affected units and retain the prior receipts. Locks and revision checks prevent
conflicting journal writers. Coordinate external worker ownership separately.

While actively working, give one concise meaningful progress update about every
60 seconds, plus milestone changes. Persist worker heartbeat at roughly the same
cadence; do not stream raw logs or repeatedly report unchanged polling. Heartbeat
does not extend client cache lifetime or prove adoption/business impact.

## Stream cache expired recovery

1. Fetch current default branch. Read AGENTS, task manifest, continuation pointer
   and the existing checkpoint. Preserve authorization and corrections.
2. Run `resume`; validate evidence hashes, dependencies and any active worker ID.
3. Pending means reconcile the original provider/request/result ID, not replay.
   Observed success is verified with its receipt. Proven no effect permits
   `retry --no-effect-evidence <receipt> --next-action <unit>` with the same key.
   Timeout/unknown outcome remains pending; do independent work if possible.
4. Continue the canonical next action and skip verified units. Checkpoint/push
   before the next significant unit. Respect this repo's product/legal gates.
5. Close out with default-branch SHA, checks, evidence and remaining limits.
   Actual runtime changes additionally require the repo's deploy/smoke receipt.

## Verification and limits

`config.json` records canonical source/version hashes, budgets and state root.
`check.py` verifies copied code integrity, runs the six recovery scenarios and
validates all local `*.checkpoint.json` journals. Changing source/config hashes is
an explicit reviewed upgrade, not permission to bless arbitrary edits.
Policy budgets are validated defaults; the executor enforces time/volume limits.

Filesystem helper needs Python 3.9+ on Linux/Unix (`fcntl`, directory fsync).
CI runs on Ubuntu. Windows needs a worker/store with equivalent transactions.
Hashes validate evidence integrity, not truth or provider receipt authenticity.
Exactly-once external effects require provider idempotency or result readback.
A stopped agent needs restart or an authorized scheduler; none is installed here.
Completed journals retain history and may be archived by existing retention rules;
never delete pending journals or the sole evidence copy.

DoD: package integrity + recovery tests + journal validation + canonical branch
readback + this repo's release checks. No claim that ChatGPT cache is repaired.
