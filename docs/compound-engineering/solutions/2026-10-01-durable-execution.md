# Durable iteration recovery

Reusable execution lesson: persist pending intent before a side effect; on restart
reconcile its provider/result ID before retry. Independently verified evidence and
next action share one checkpoint transaction. UI streaming is not task state.

Verified locally: six recovery scenarios, including writer conflict, interrupted
write, missing/tampered proof and verified-work skip. CI/main receipts are listed
in grainee-v2 docs/ops/agent-execution-rollout-2026-10-01.json.
No client facts, audit gates or production authority are transferred.
