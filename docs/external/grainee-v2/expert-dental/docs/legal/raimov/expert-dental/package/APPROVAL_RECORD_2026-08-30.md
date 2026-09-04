---
owner: Expert Dental legal owner
status: COUNSEL_APPROVED_OWNER_CONFIRMED / TABLET_FORMATTING
created: 2026-08-30
last_updated: 2026-08-30
jurisdiction: Kyrgyz Republic
scope: docs/legal/raimov/expert-dental/package/
---

# Approval record — Expert Dental / RAIMOV P0 package

## Decision recorded

On 2026-08-30 the owner reported that local counsel reviewed and approved all documents in the P0 package and authorised their use.

This record closes the package-level `COUNSEL_REVIEW_REQUIRED` gate for the exact source artifacts indexed by `manifest.json` at merge SHA `4ce597eb46145c496920adb5a5f5ab678d6bae76`.

## Evidence status

- counsel decision: `APPROVED`;
- source of this record: owner instruction in the project working session on 2026-08-30;
- counsel name, signed opinion, email or approval letter: `PENDING_ARCHIVE_ATTACHMENT`;
- approved wording baseline: the 27 Markdown and 27 DOCX artifacts in the package identified by their existing SHA256 values;
- wording changes after this approval require a new legal impact review and a new version.

## What approval does not change

Counsel approval of a form does not by itself prove that every clinical service is within licence №4879, that the address/equipment profile is cleared, or that every assigned doctor has the required professional credential. Existing `BLOCKED_EVIDENCE` and licence/provider hard stops remain binding until the evidence matrix is closed.

For clinical templates, the clinic medical owner remains responsible for confirming medical accuracy and applicability to the specific service and patient episode. The treating doctor must approve the case-specific document before the administrator opens a patient signing session.

## Tablet formatting authority

The approved wording may be reformatted for a tablet without changing legal meaning. Permitted presentation changes include:

- typography, spacing, grouping and visual hierarchy;
- section cards, progress indication and sticky navigation;
- larger fields, checkboxes and signature area;
- moving control-plane metadata into a clearly labelled service-information appendix;
- generating an accessible HTML representation and a print/PDF representation from the same source;
- displaying licence/provider clearance warnings outside the patient-signed substantive text.

Not permitted without a new review:

- deleting or paraphrasing substantive clauses;
- adding promises, guarantees, waivers or new patient obligations;
- changing the list of risks, alternatives, purposes, recipients or withdrawal rules;
- reusing an image of a signature separately from the sealed document;
- backdating or silently replacing an approved version.

## Activation state

The package moves to `COUNSEL_APPROVED / TABLET_FORMATTING`. A form becomes `IN_USE` only after:

1. its tablet rendering passes visual and accessibility QA;
2. its exact approved empty artifact is assigned a release version and SHA256;
3. required medical and service/provider clearances are present;
4. the signing workflow records doctor approval, administrator identity verification, patient signature, timestamp, final hash and copy delivery;
5. the activated version is entered in `VERSION_REGISTRY.md`.
