# CAESTHETIC Private Growth Preview v1

Status: active acquisition mechanic. It is not a product, score, report, or diagnosis.

## Contract

`qualified account → issue opaque private link → deterministic factual Preview → explicit Continue → existing Growth Score intake/research/named-human approval → private Score → Sprint`

Issuance is O(1). It hashes a cryptographically random token and stores an approved, current pre-Score fact. It must not call an LLM, crawl, fetch an external URL, take a screenshot, or create a lead/Score case. The raw token exists only in the private wave export.

GET `/preview/<opaque-token>/` may render practice identity, one approved factual observation, the four locked/unassessed public surfaces, and a neutral cross-surface explanation. It may not render a numeric Score, binding constraint, Gap Inventory, Top 3, Repair Plans, Do Not Fund Yet, loss/ROI/causality claim, or imply that a report is ready. GET never creates a lead or Score case.

POST `Continue to My Free Growth Score` is explicit permission. The database RPC atomically and idempotently creates/resolves the canonical lead, case, initial status and outbox with `source_kind=outbound_preview`. Known recipient fields are resolved server-side; the page exposes practice identity, not recipient PII. Forwarded users can choose `Not you?` and use the regular intake.

Invalid, expired, stale-evidence and suppressed previews return the same generic fail-closed page. Internal suppression is checked synchronously against `outreach_suppression`; the system does not claim a real-time Instantly webhook that is unavailable.

Analytics are server-side and non-personal: `preview_issued`, `preview_opened`, `preview_rendered`, `preview_continued`, `score_case_created`. Allowed dimensions are campaign variant, non-PII sender reference/class, signal class, ICP, city, source kind and preview version.

## Private wave commands

```sh
node scripts/caesthetic/growth-preview-wave.mjs validate --input /private/path/wave.csv
node scripts/caesthetic/growth-preview-wave.mjs prepare --input /private/path/wave.csv --out-dir /private/path/prepared
node scripts/caesthetic/growth-preview-wave.mjs export --input /private/path/prepared/growth-preview-private.jsonl --output /private/path/instantly.csv
node scripts/caesthetic/growth-preview-wave.mjs reconcile --input /private/path/prepared/growth-preview-private.jsonl --output /private/path/reconcile.jsonl
```

The tool has no send command. Real prospect CSV/JSONL and raw tokens stay outside Git. Every row fails closed unless email verification, suppression/conflict clearance, approved current evidence, exactly one active narrative, and a supported copy variant are present.

## Release and smoke

Production smoke uses only the committed synthetic fixture. Its QA lead and Score case auto-close and must never remain a working lead. Acceptance checks HTTP 200, privacy headers/markers, zero case on GET, one closed case on Continue, and the same IDs after repeated Continue.
