---
owner: Expert Dental legal owner + records custodian
status: TABLET_RELEASE_MAPPING / NOT_EFFECTIVE_UNTIL_FORM_ACTIVATION
created: 2026-08-30
last_updated: 2026-08-30
release_version: 1.0.0
---

# Tablet release mapping — version 1.0.0

## Decision

The tablet presentation layer uses release version `1.0.0` for the 19 patient-facing forms generated from the counsel-approved P0 wording baseline.

This mapping is a metadata and presentation release. It does not change substantive wording.

For every form:

```text
source artifact: package/markdown/patient-facing/<file>.md
source version: 0.1-draft
source SHA256: tablet/manifest.json → forms[].sourceSha256
counsel approval: package/APPROVAL_RECORD_2026-08-30.md
tablet release version: 1.0.0
generated HTML SHA256: tablet/manifest.json → forms[].htmlSha256
```

The historical source version is retained in `data-source-version` and in the manifest. The patient-facing tablet screen and future sealed PDF show the clean release version `1.0.0`.

## Why the source files are not renamed

The original Markdown/DOCX package and ZIP are an immutable approved evidence snapshot. Renaming or regenerating those files would change package hashes and obscure the exact artifacts reviewed by counsel.

The tablet release therefore adds a controlled version layer rather than silently replacing the source archive.

## Activation rule

`1.0.0` is not automatically effective for every form.

A form becomes `IN_USE` only when its registry row records:

- effective date;
- exact generated empty-artifact SHA256;
- medical owner approval where applicable;
- licence/service/provider clearance where applicable;
- tablet visual/accessibility QA;
- signing-workflow integration and audit evidence;
- owner go-live decision.

Until those gates are satisfied, the relevant tablet status is one of:

- `COUNSEL_APPROVED_TABLET_QA`;
- `COUNSEL_APPROVED_MEDICAL_REVIEW_PENDING`;
- `COUNSEL_APPROVED_EVIDENCE_BLOCKED`.

## Change control

A substantive wording change requires:

1. a new source version;
2. legal impact review;
3. medical impact review where applicable;
4. new source and generated hashes;
5. a new tablet release version or patch version;
6. a supersedes/migration record.

Pure CSS/accessibility changes that do not affect displayed wording or signature meaning may be released as presentation patches, but the resulting HTML/PDF hash must still be updated in the manifest and activation evidence.
