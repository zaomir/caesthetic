---
owner: CAESTHETIC / Marketing / Platform
status: proposed
type: ssot-proposal
version: 0.1.0
created: 2026-08-24
last_updated: 2026-08-24
parent_decision: DEC-851
related:
  - docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md
  - docs/ssot/CAESTHETIC_EVIDENCE_BANK.md
---

# CAESTHETIC Remotion Evidence Resolver — proposed production contract

## 1. Status and authority boundary

This document records the production-readiness audit and a proposed contract for the asynchronous PUBLISHABLE Evidence Resolver required by `FourSurfaceMap`.

It does **not** authorize production rendering, deployment or publication. `ValidatedFourSurfaceMap` must continue to reject every `render_purpose: "production"` input until this proposal is accepted by an explicit DEC-851 amendment or a new founder decision and the accepted implementation passes its gates.

The released `FourSurfaceMap v1.0.0` baseline, its 20 PNG snapshots and its design geometry remain locked.

## 2. Readiness audit — 2026-08-24

A trustworthy resolver cannot yet be implemented against the current contracts without inventing authority.

| Required production proof | Current state | Result |
|---|---|---|
| Evidence unit exists only in the clean bank | Storage separates `raw/` and `clean/`, but no resolver-safe clean artifact inventory exists | BLOCKED |
| Current `PUBLISHABLE` lifecycle | Present and re-validatable | AVAILABLE |
| Rights clearance | `rights_status` and conditional `consent_ref` exist | PARTIAL |
| Rights/evidence expiry | No explicit expiry or non-expiring declaration | BLOCKED |
| Evidence file integrity | No clean artifact SHA-256 or byte-size contract | BLOCKED |
| Evidence manifest integrity | No manifest version or manifest digest contract | BLOCKED |
| Claim-to-evidence binding | Scene carries `evidence_ids`, but headline/public wording is not bound to an evidence unit's `allowed_public_wording` | BLOCKED |
| Manifest content binding | No attestation envelope or canonical manifest hash | BLOCKED |
| Renderer isolation from private evidence | Runtime production throw currently prevents access | SAFE |
| Audit record without private contents | Not yet defined | BLOCKED |

Therefore the correct current state is unchanged:

```text
component_demo: ENABLED
editorial_preview: ENABLED
production: DISABLED
```

## 3. Required upstream contract changes

### 3.1 Versioned Evidence Unit manifest

A production-resolvable evidence unit needs an explicit version and these additional semantic/integrity fields:

```json
{
  "evidence_manifest_version": "cae-evidence-unit@2.0.0",
  "unit_id": "CAE-EV-001",
  "lifecycle_state": "PUBLISHABLE",
  "rights_status": "client_consented",
  "consent_ref": "private://consent/...",
  "rights_valid_until": "2027-08-24",
  "evidence_valid_until": "2027-08-24",
  "clean_artifacts": [
    {
      "artifact_id": "A01",
      "relative_path": "clean/map-screenshot.png",
      "media_type": "image/png",
      "byte_size": 123456,
      "sha256": "<64 lowercase hex>"
    }
  ]
}
```

Rules:

1. `clean_artifacts` may reference only normalized relative paths beginning with `clean/`.
2. Absolute paths, traversal, symlinks escaping the evidence-unit directory, URLs and any `raw/` path are rejected.
3. Every referenced artifact must exist, be a regular file, match `byte_size` and match SHA-256.
4. `rights_valid_until` and `evidence_valid_until` are ISO dates. If a source is intentionally non-expiring, the manifest must carry an explicit `null`; omission is forbidden.
5. Resolution uses the earlier non-null expiry. An expired unit fails closed.
6. Legacy evidence manifests without `evidence_manifest_version` are never production-resolvable.
7. The resolver re-runs the canonical Evidence Bank schema and lifecycle validation; it never trusts a stored `PUBLISHABLE` string alone.
8. Unknown fields are rejected by the production schema.

This is a proposed breaking Evidence Bank contract and requires separate migration policy for existing units.

### 3.2 Claim bindings in the render manifest

Scene-level evidence IDs are necessary but insufficient: they prove that evidence exists, not that the rendered wording is authorized by it.

A future manifest version must replace implicit scene-level association with typed claim bindings. Proposed semantic shape:

```json
{
  "claim_bindings": [
    {
      "claim_id": "CL01",
      "field": "headline",
      "evidence_id": "CAE-EV-001",
      "wording_ref": "allowed_public_wording"
    }
  ]
}
```

Rules:

1. `field` is an enum of renderer-owned textual claim slots, never an arbitrary JSON path.
2. Every evidence-bound public claim slot must have exactly one binding unless the accepted contract explicitly declares it non-claim metadata.
3. The resolved field value must equal the evidence unit's normalized `allowed_public_wording`; free paraphrase is forbidden in v1.
4. Every referenced evidence ID must be used by at least one claim binding.
5. Scene `epistemic_label` must be compatible with every bound unit; mixed-label policy must be decided explicitly.
6. This changes render-manifest meaning and therefore requires a versioned manifest decision, not an unversioned optional field.

## 4. Resolver architecture

The resolver is a Node-side pre-render gate. It must never run inside the Remotion browser component and must never expose evidence-bank filesystem access to `FourSurfaceMap`.

Canonical flow:

1. Accept the exact UTF-8 render-manifest bytes plus `scene_id`.
2. Parse with the exact supported render-manifest schema.
3. Reject non-production input at the production-resolver entry point.
4. Resolve every referenced unit beneath the configured clean Evidence Bank root.
5. Parse each unit with the accepted versioned Evidence Unit schema.
6. Re-validate lifecycle, rights, expiry, claim wording and artifact integrity.
7. Compute a manifest content digest using the accepted canonicalization rule.
8. Produce a signed or keyed attestation envelope bound to that digest, resolver version and exact evidence digests.
9. Persist an audit record containing IDs, hashes, timestamps, versions and decisions only—never private content, consent documents or raw artifacts.
10. Pass an opaque verified input to a separate render entry point.
11. Keep the existing unconditional production throw until the attested entry point and its authority are accepted.

No input boolean such as `evidenceResolved: true` is valid authority.

## 5. Proposed attestation envelope

```json
{
  "attestation_version": "cae-render-attestation@0.1.0",
  "resolver_version": "cae-evidence-resolver@0.1.0",
  "content_id": "CAE-4444-001",
  "scene_id": "S01",
  "render_manifest_sha256": "<64 lowercase hex>",
  "resolved_at": "2026-08-24T12:00:00.000Z",
  "evidence": [
    {
      "unit_id": "CAE-EV-001",
      "evidence_manifest_sha256": "<64 lowercase hex>",
      "clean_artifact_sha256": ["<64 lowercase hex>"]
    }
  ],
  "decision": "PUBLISHABLE"
}
```

The accepted decision must select the trust mechanism: detached digital signature, deployment-held HMAC, or another verifiable key-backed scheme. An unsigned JSON object is audit output, not render authority.

## 6. Mandatory negative tests

The resolver test suite must prove rejection of:

- unknown, missing, legacy or duplicated evidence IDs;
- `CAPTURED` evidence and hand-edited false `PUBLISHABLE` states;
- missing reviewer/redaction/consent requirements;
- expired rights or evidence;
- missing, changed, size-mismatched or hash-mismatched clean artifacts;
- all `raw/`, absolute, traversal and symlink-escape paths;
- unknown evidence-manifest fields;
- unbound claims, mismatched wording and unused evidence IDs;
- scene/evidence epistemic-label incompatibility;
- changed render manifest after attestation;
- changed evidence manifest or artifact after attestation;
- wrong resolver/attestation versions;
- missing, invalid or wrong-key attestation;
- replay outside the accepted validity window;
- any direct call to the legacy un-attested production renderer.

Positive fixtures must use synthetic evidence only and contain no private client material.

## 7. Acceptance gates for a future production unlock

Production may be considered only when all are true:

1. an explicit founder decision accepts the Evidence Unit v2, claim-binding, canonicalization and trust-mechanism contracts;
2. migration behavior for legacy Evidence Bank units is documented;
3. resolver code and negative tests are merged;
4. CI verifies artifact hashes and manifest mutation/replay failures;
5. runtime accepts only a cryptographically verifiable, manifest-bound attestation;
6. `FourSurfaceMap v1.0.0` visual baselines remain unchanged;
7. a synthetic production render passes end to end;
8. a named human reviews the audit record and rendered output;
9. deployment and publication remain separately gated.

Until then, the unconditional production rejection is the correct implementation.
