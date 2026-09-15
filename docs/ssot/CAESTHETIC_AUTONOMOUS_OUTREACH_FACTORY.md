# CAESTHETIC autonomous discovery outreach factory

Status: approved policy; runtime integration incomplete.
Authority: founder instructions in the CAESTHETIC discovery conversation, confirmed 2026-09-12; issue #1580.

## Standing authorization

Applies only to CAESTHETIC discovery-sourced outreach; supersedes historical six-address-only EmailVerifier exceptions and per-wave human approval language for this motion.

- EmailVerifier.io is excluded for ALL future discovery cohorts. Use supplied business email addresses without a deliverability verifier. Record verification as not_performed_by_policy, never PASS. Keep recipient ownership checks, missing/malformed-address handling, conflict review, shared refusals and deduplication.
- No founder-imposed daily recipient cap. Provider/account capacity, throttling, bounce protection, rendered QA and canary quality controls remain. This is not permission to bypass service limits or to invent sender capacity.
- Standing authorization covers the email pipeline through receipt of interested reply. No repeated general GO is required for this approved flow.
- Interested replies and their private lead/context handoff go to wsc8eq@gmail.com. Any reply stops automatic follow-ups for the company across connected channels. Unclear replies require review, not an invented interested classification. Refusals/opt-outs persist across CAESTHETIC, BOTOTOX, TOXIFILLERS and ROVLEX.
- Factory ends at interested-reply handoff. Do not automatically issue a Score, promise delivery, sell a Sprint or send substantive commercial replies.
- Sender: Valerie Petra, caesthetic.co. Offer to receive a Free Growth Score, not a completed Preview/Score. Required truthful identity, commercial disclosure, postal address and opt-out footer; one reminder then soft close.
- Paid discovery: Mon/Wed/Fri 12:00 UTC; $3/run including expansion/retries/paid enrichment, $9/ISO-week, no rollover. First paid run remains 2026-09-14T12:00:00Z. Do not buy manually before that slot.
- No cold Instagram/Facebook DMs. Social automation must use supported integrations and shared reply/suppression state.

## Acceptance

Provider import acceptance, campaign activation and queued leads are NOT sent emails. Record import_accepted separately; accept canary evidence only with recipient/campaign-specific provider outgoing receipts. Persist attempts before external mutation; uncertain results require reconciliation before retry. Real end-to-end acceptance requires a controlled inbound reply, company-level stop and confirmed handoff notification delivery. Static tests and historical six sends do not establish this.

## Implementation review 2026-09-12

Current worker discover_channels only inventories existing fields; no live discovery of missing channels. send_email_lead imports a lead and previously incremented sent_count; receipts therefore do not establish delivered/sent canary evidence. No reply poller/classification/handoff notification implementation exists in this worker. These gaps must be completed before unattended expansion.

Primary routing: CAESTHETIC_NEW_MEDSPA_DISCOVERY.md -> this policy -> CODEX_PROCESS_HANDOFF.md. Runtime data remain private under /var/lib/caesthetic-medspa/. No recipient email exports or secrets in Git.

## Reply guard implementation — 2026-09-12

PR #1616 (`aaa1632e89a254c5bb827fe90d01cd86b0bf5dd7`) connects private company_stops to queue preparation and pre-import checks. Queues carry canonical company_id; missing identity, explicit suppression or unreadable reply state are skipped. Five local tests passed. This guard does not ingest provider replies or cancel provider-side followups; those integrations and the company mapping remain incomplete.

Poller handler imports moved after repository sync (`be8759437af2882c87ec4c3e39acd5b96f1343f1`). VDS dry-run request: `cae-medspa-reply-guard-smoke-20260912T181700Z`; require result marker `reply_guard_version=canonical-company-v1` before claiming runtime adoption. Instantly MCP returned no inbound emails for the canary in this pass. No paid buy or live import was performed.

## Canonical company ingestion — 2026-09-12

VPS2402 applied four companies from the existing paid NY/LA exports in `cae-medspa-master-apply-20260912T191204Z` at 19:16:15Z. Companies: 228475 -> 228479; contacts: 130732 unchanged; unmatched/orphans/rejected: 0. Five source identity/category exclusions remain. Private backups and before/after hashes are retained. Post-apply exact Maps linkage succeeded for four records; three email candidates were prepared in a dry-run-only queue. This is not import/send clearance, a verified email result, or a completed autonomous factory.

Implementation: #1617 canonical read-only master resolution; #1619 pinned-source adapter to existing `scripts/outreach/ingest.py`; #1621 standard-library CSV fallback when pandas is unavailable. Existing `ingest_inbox` accepts `master_ingest_mode=dry_run|apply`; no arbitrary source path/command. Empty shared master baselines block apply and Drive sync. Package SHA: `4b4694d6ed49b8bb32a63adc615feec588ed8c47701039b9f82edaa0d60a9460`.

Drive sync returned error; the VDS master write succeeded. Redacted diagnostics requested through existing `logs` operation. Do not reapply the master package to repair a mirror error. Remaining outreach integrations: current recipient ownership/narrative checks, provider reply ingestion, provider-side followup cancellation and interested-reply delivery. No new Instantly import/send or paid buy occurred.

## Mirror recovered and replay verified — 2026-09-12

Drive mirror recovery succeeded at 19:30:44Z in `cae-medspa-drive-runtime-20260912T192839Z`: SDK interpreter `/var/lib/caesthetic-medspa/drive-venv/bin/python`, exit 0, master_apply_attempted=false. Application-local venv was provisioned through a fixed operation; no global Python packages or worker cron were changed. Runtime package lock is private under `master-ingest/drive-runtime-requirements.lock`. Future canonical ingests reuse this interpreter. Drive uploads now check non-public permissions before writing.

VPS2402 replay `cae-medspa-master-replay-20260912T193349Z` at 19:35:35Z confirms `canonical-ingest-v2`: companies 228479 -> 228479, contacts 130732 -> 130732, added/enriched/rejected/unmatched/orphans all zero; applied=false. Thus the same paid package is idempotent. This closes the company-linkage/import/mirror work for the four accepted NY/LA companies, not the full outreach factory.

Existing `ingest_inbox` optional modes: `master_ingest_mode=dry_run|apply|sync_drive|setup_drive_runtime`. Sync/setup modes never reapply the master package. Three email candidates remain in a dry-run-only queue; five source conflicts remain excluded. Recipient ownership/narrative clearance, complete rendered footer QA, provider reply processing and interested-reply notification are still required before a new live wave. No new Instantly import/send or paid collection occurred.


## Runtime execution status — 2026-09-14 (current)

This section supersedes earlier statements in this file that the NY/LA runtime integration is wholly incomplete. It is a factual execution record; it does not relax policy gates for future recipients.

### Scope and data

- Initial source cohort: 11 rows, 10 unique nonempty Maps place IDs; 7 source-email rows / 6 entities, enriched to 8 rows / 7 entities. Three entities lacked email. DeeTox remained excluded because two different emails conflict. Filename dates did not prove a new opening.
- All source ZIPs matched the CAESTHETIC pilot configuration. NY/LA paid exports were ingested privately on VPS2402, not repurchased and not committed to Git.
- Canonical company ingestion accepted four NY/LA company identities. Of the three email candidates, only FiDi Aesthetics and Plastics passed the documented source-ownership review. Berk Beauty and SYR Men's Med Spa Studio remain unresolved and are not send-clear.
- EmailVerifier remains permanently excluded by policy. Record this as `not_performed_by_policy`, never as a PASS.

### Provider and VDS control plane

- VDS runtime: `/var/www/grainee-v2` + private store `/var/lib/caesthetic-medspa`; typed Agent API request/result bridge is the supported remote path.
- Poller recovery is deployed: `0a6c1ca17` prevents an interrupted push/rebase from losing a local result; `570bfd35c` restores the Agent↔repo sync contract and ensures a queued placeholder is not treated as an execution receipt.
- Current NY/LA campaign: `bb82c55d-3c27-4697-ab78-ecc2e5f01e83`, internally `caesthetic-discovery-20260914-nyla`. Sender is Valerie Petra via `valerie@caesthetic.co`.
- Guardrails deployed:
  - `f36944f`: only the manifest-pinned NY/LA campaign may be used; explicit lead IDs are required.
  - `61d5fb2`: queue construction filters to explicit lead IDs before a live queue exists.
  - `1a7609307` + `64d180c`: activation requires campaign/copy/control readback, exactly one directly listed lead, and zero contacted/sent/bounced/replied/unsubscribed metrics. Aggregate analytics lag alone cannot bypass the direct lead-count check.
- Campaign control readback: Draft → Active only after the activation gate. Settings currently required and verified: `stop_for_company=true`, stop on reply and auto-reply, unsubscribe header, BounceProtect, text-only, tracking off, weekday 10:00–17:00 America/Detroit, daily limit 3.

### NY/LA one-recipient canary

| Stage | UTC result | Evidence |
| --- | --- | --- |
| Explicit live queue | 2026-09-14 19:15:21 | `cae-medspa-fidi-live-queue-20260914T190400Z`: exactly 1 email, 0 stop flags |
| Provider import | 2026-09-14 19:20:10 | `cae-medspa-fidi-draft-import-20260914T191700Z`: `import_accepted_count=1`; this was not a send |
| Activation | 2026-09-14 19:48:16 | `cae-medspa-fidi-activate-retry-20260914T192700Z`: gated activation success; no duplicate import |
| Provider outgoing receipt | 2026-09-14 19:54:49 | Instantly sent-email list: exactly one first-touch, subject `quick question` |
| Fresh provider check | 2026-09-14 20:00 | 1 lead / 1 contacted / 1 sent / 0 bounce / 0 reply / 0 unsubscribe |

The rendered sent message had no raw variables and had the required commercial disclosure, postal address and opt-out footer. Provider outgoing-mail evidence, not Active/queued/import status, is the only send proof. The recipient email and other private contact details are intentionally not stored in Git.

### Reply-control test and current boundary

- VDS receipt `cae-medspa-reply-smoke-20260914T200100Z`, generated 2026-09-14 20:05:09 UTC: **success**.
- Isolated no-provider-I/O test proved:
  - interested inbound event → company stop + handoff task;
  - unsubscribe event → company stop + shared-DNC task.
- This did **not** create a fabricated reply, modify FiDi, poll a provider inbox, deliver an external notification or execute a DNC write against a real recipient.
- Provider-side reply/auto-reply/company stops are verified on the NY/LA campaign. Real inbound polling, mapping an actual provider reply to a canonical company, provider-side cancellation reconciliation and confirmed delivery of the interested-reply handoff to `wsc8eq@gmail.com` remain the required end-to-end work before unattended expansion.

### Operational state and next actions

- Do not expand this wave while its reply-chain is unobserved.
- Any real reply: stop all company follow-ups; negative/unsubscribe enters shared CAESTHETIC/BOTOTOX/TOXIFILLERS/ROVLEX DNC; interested routes to `wsc8eq@gmail.com`; unclear is review-only. Never auto-issue a Growth Score or substantive sales response.
- One reminder then soft close remains the only sequence. No cold Instagram/Facebook DMs. LinkedIn actions require identity/history review and action-time confirmation.
- Paid Outscraper discovery remains Mon/Wed/Fri 12:00 UTC with $3/run and $9 ISO-week caps. Treat collection, recipient verification, and new campaign activation as separate gates.
- Instantly workspace billing was checked on 2026-09-14: the outreach subscription was active (not cancelled), base lead allowance 25,000 and 10,277 current leads. This is an observation, not permission to add volume. CAESTHETIC continues with the single visible Valerie sender; do not switch an active chain to another mailbox.

### Evidence index

- Issue record: [#1580](https://github.com/zaomir/grainee-v2/issues/1580).
- Agent results: `docs/agent-api/results/cae-medspa-fidi-live-queue-20260914T190400Z.json`, `cae-medspa-fidi-draft-import-20260914T191700Z.json`, `cae-medspa-fidi-activate-retry-20260914T192700Z.json`, `cae-medspa-reply-smoke-20260914T200100Z.json`.
- Campaign manifest: `docs/ops/caesthetic-new-medspa-discovery/campaign-20260914-nyla.json` is historical creation metadata; this SSOT section holds the authoritative post-execution state.
