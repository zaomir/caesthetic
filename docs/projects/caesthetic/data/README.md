# Data

Schemas, scoring fixtures and measurement definitions; synthetic data must remain clearly labeled.

Checked-in CAESTHETIC audience artifacts are aggregate or company-level public control data only. Raw people, LinkedIn profile URLs, emails, verification results and suppression records remain in private canonical storage and must not be committed.

| Artifact | Purpose |
|---|---|
| `linkedin-partner-approval-queue.json` | Fail-closed company-level research queue for the DEC-849 partner motion; it is not send authority. |
| `linkedin-master-audit-2026-08-22.json` | Aggregate, hash-bound audit of the four private LinkedIn source worksheets and clinic-master overlap. |
| `partner-public-enrichment-2026-08-22.json` | Company-level public crawl result; email values stay private and unverified. |
