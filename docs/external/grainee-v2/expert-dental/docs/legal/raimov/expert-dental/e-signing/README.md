# Expert Dental electronic signing — runtime boundary

Status: `SYNTHETIC TEST ONLY / REAL PATIENT USE BLOCKED`.

The selected implementation is `apps/expert-esign/`, rebuilt from current
`main` with a provider-agnostic core. PR #1164 is the selected technical
ancestor; PR #1153 is not combined with it.

## Authority

- exact legal wording: `../package/markdown/`;
- legal and medical activation: `../VERSION_REGISTRY.md`;
- package approval overlay: `../package/APPROVAL_RECORD_2026-08-30.md`;
- clinic-wide architecture and vendor gates: `docs/ssot/EXPERT_DENTAL_INFRASTRUCTURE.md`.

`apps/expert-esign/generated/legal-templates.json` is generated output. Its
source hashes are checked against the tablet manifest and it cannot activate a
form. The current registry has no `IN_USE` row.

## Provider and CRM boundary

- Mock provider: full synthetic test path;
- Zoho Sign: preferred manual pilot and disabled adapter skeleton until the
  provider contract, credentials, region/DPA and webhook format are approved;
- DocuSign: disabled fallback skeleton under the same gates;
- SQNS: primary MIS/CRM. The service defines a small internal contract for
  patient, visit, doctor and service references plus a sealed-document
  callback. No SQNS endpoint is assumed.

## Runtime guarantees

- authenticated administrator starts the managed-iPad session;
- a doctor approval is required when the template class says so;
- webhook signatures have a time window and provider event idempotency;
- signed PDF, completion evidence and manifest are SHA-256 bound and written
  to versioned Object Lock storage;
- RFC3161 is optional technical evidence, not a qualified-signature claim;
- WAHA is a disabled delivery hook in TEST and is never the archive;
- TEST accepts only names beginning with `TEST`, `DEMO`, `ТЕСТ` or `ДЕМО`.

Open gates are tracked in `GO_LIVE_OPEN_GATES_2026-08-29.md`.
