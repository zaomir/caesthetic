---
owner: Expert Dental legal owner + product owner
status: TABLET_RELEASE_1_0_0 / SELECTIVE_ACTIVATION_GATED
created: 2026-08-30
last_updated: 2026-08-30
---

# Expert Dental — tablet presentation layer

This folder contains the iPad-readable presentation layer for the counsel-approved patient-facing package.

## Canon

- approved wording: `../markdown/patient-facing/*.md`;
- approval record: `../APPROVAL_RECORD_2026-08-30.md`;
- tablet release mapping: [`RELEASE_MAPPING.md`](RELEASE_MAPPING.md);
- design and acceptance rules: [`TABLET_FORM_DESIGN_STANDARD.md`](TABLET_FORM_DESIGN_STANDARD.md);
- renderer: `scripts/legal/build-expert-dental-tablet-forms.mjs`;
- counsel/medical/evidence overlay: `scripts/legal/apply-expert-tablet-approval-overlay.mjs`;
- integrity guard: `scripts/legal/check-expert-dental-tablet-forms.mjs`;
- shared tablet presentation: `tablet-form.css`, `tablet-form-fields.css`, `tablet-form.js`;
- generated preview: [`index.html`](index.html) and `generated/*.html`;
- generated integrity map: [`manifest.json`](manifest.json).

The generated HTML is not a separate source of legal wording. Each file records the SHA256 of the exact approved Markdown source used for rendering.

## Versions

- immutable source package version: `0.1-draft`;
- tablet presentation release: `1.0.0`;
- source version remains available as `data-source-version` and in the manifest;
- the patient view and future sealed PDF use version `1.0.0`;
- an individual form is not effective until its activation row is recorded in `VERSION_REGISTRY.md`.

## Generate and validate

```bash
node scripts/legal/build-expert-dental-tablet-forms.mjs
node scripts/legal/apply-expert-tablet-approval-overlay.mjs
node scripts/legal/check-expert-dental-tablet-forms.mjs
```

The renderer processes all files in `package/markdown/patient-facing/`, builds a responsive page per document and produces an index plus SHA manifest. The overlay applies counsel approval, clean release versioning and remaining medical/licence/provider hard stops. The checker verifies source hashes, final HTML hashes, signing controls and fail-closed status.

## What the tablet layer does

- uses 19–21 px body text on iPad;
- presents one approved heading per section card;
- shows progress without shortening the document;
- provides large case-specific fields, 32 px checkboxes and a 290 px signature area;
- requires all sections, acknowledgements and a non-empty signature before enabling the final action;
- supports touch and Apple Pencil pointer events;
- emits an integration event instead of pretending that a static preview has created a legally sealed document;
- displays unresolved medical or licence/service/provider evidence as a blocking staff warning;
- removes duplicate legacy blank signature/copy fields from the patient flow;
- keeps provenance, no-backdating and version controls available as service information.

## What it does not do

The static package preview does not:

- identify the patient;
- provide doctor approval;
- create a server timestamp or final PDF;
- calculate the final signed-artifact hash;
- store evidence;
- place an object under legal hold;
- deliver a copy through WAHA;
- replace the protected Expert Signing service.

Production integration must listen for the `expert-form-sign-request` browser event, validate the administrator session, patient identity, doctor approval, exact source hash and release status, and submit the signature evidence to the signing backend.

## Activation boundary

Counsel approval is recorded. `MEDICAL_REVIEW_REQUIRED` and `BLOCKED_EVIDENCE` remain binding and fail-closed. Such forms can be generated and reviewed but may not be offered for a real-patient signing session until the relevant gate is closed.

Before a form becomes `IN_USE`:

1. generated source hash matches the approved source;
2. iPad portrait/landscape visual QA passes;
3. keyboard/focus/200% zoom QA passes;
4. medical owner approval is recorded where applicable;
5. service, licence and assigned-doctor clearance pass where applicable;
6. the form is connected to doctor approval, administrator-only session, immutable sealing and copy delivery;
7. exact version/effective date/hash activation is recorded in `VERSION_REGISTRY.md`.
