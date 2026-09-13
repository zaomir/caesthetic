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
