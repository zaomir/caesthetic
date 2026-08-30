---
owner: Founder / CAESTHETIC / Marketing / Platform
status: accepted
type: decision-amendment-proposal
version: 0.2.0
created: 2026-08-24
last_updated: 2026-08-24
amends: DEC-851
authority_required: founder
implementation_authorized: phases-1-5-only
production_authorized: false
related:
  - docs/founder-notes/DEC-851.md
  - docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md
  - docs/ssot/CAESTHETIC_REMOTION_EVIDENCE_RESOLVER.md
  - docs/ssot/CAESTHETIC_EVIDENCE_BANK.md
  - scripts/caesthetic/evidence/drafts/evidence-unit-v2.schema.draft.json
---

# DEC-851 Evidence Unit v2 — founder approval packet

## 1. Decision boundary

This package records the founder-approved Evidence Unit v2 decision. Approval authorizes implementation phases 1–5 only; production activation, deploy, publication, legacy migration and removal of the unconditional production throw remain forbidden.

Before approval:

- the current Evidence Bank schema and tools remain unchanged;
- no legacy unit is migrated or modified;
- no HMAC key is provisioned;
- no resolver, signing service or production composition is enabled;
- `ValidatedFourSurfaceMap` continues to reject every production manifest;
- no deploy or publication is authorized.

The released `FourSurfaceMap v1.0.0`, release commit
`a8c7f6c4fa4babf5535d13066f7dd6c7c094c651` and twenty approved PNG
baselines remain locked.

## 2. Compact proposed amendment to DEC-851

The following text is proposed for insertion into
`docs/founder-notes/DEC-851.md`.

---

### Founder amendment — Evidence Unit v2 and attested production rendering

1. Only the CAESTHETIC Evidence Resolver, running under its dedicated service
   identity, may transition an Evidence Unit into `PUBLISHABLE` or issue a
   replacement `PUBLISHABLE` revision. Human reviewers approve source,
   wording, rights and redaction inputs; no human, CLI, editor, AI agent,
   publisher or renderer may write the `PUBLISHABLE` state directly.

2. Production resolution accepts only strict, explicitly versioned
   `cae-evidence-unit@2.0.0` records. Unknown fields are rejected. A stored
   lifecycle string alone is never authority: the Resolver re-validates the
   complete unit and its external attestation.

3. Every production Evidence Unit v2 has at least one clean artifact. Each
   clean artifact requires a normalized `clean/` relative path, MIME type,
   positive integer byte size, lowercase SHA-256, `created_at` and mandatory
   future `expires_at`. The unit also requires mandatory future
   `rights_valid_until`. Null, missing, malformed or expired values fail
   closed; v2 permits no non-expiring production evidence.

4. The Resolver reads no `raw/` evidence. It accepts only regular files whose
   lexical path and resolved realpath remain below the unit's `clean/`
   directory. Absolute paths, URLs as artifact paths, traversal, symlinks,
   containment escapes, missing files, size mismatches, MIME mismatches and
   SHA-256 mismatches are rejected.

5. Evidence Unit v2 exposes typed `authorized_public_claims`. Production
   render manifests expose typed `claim_bindings`. Every data-supplied public
   claim is bound to exactly one `evidence_unit_id` and
   `evidence_claim_id`, and the resolution is bound to the canonical render
   manifest hash. Arbitrary JSON paths, unbound evidence IDs and free
   paraphrase are forbidden.

6. Initial FourSurfaceMap production claim slots are
   `headline_text`, conditional `practice_label_text`,
   `binding_constraint_surface` and `growth_score_target_surface`.
   Text comparison uses Unicode NFC, CRLF-to-LF conversion and outer trim
   only; case, punctuation and internal whitespace remain significant.
   Surface claims exactly equal one canonical surface ID. One scene may not
   mix epistemic labels in v1.

7. The Resolver hashes RFC 8785-canonical render and Evidence Unit manifests
   with SHA-256 and hashes clean artifacts over exact file bytes. It copies
   verified artifacts to immutable, content-addressed per-request staging
   before attestation, preventing time-of-check/time-of-use substitution.

8. Attestations are strict, immutable and versioned
   `cae-render-attestation@1.0.0` records. They bind the resolver version,
   `key_id`, `render_request_id`, one-time nonce, content and scene IDs,
   render-manifest hash, Evidence Unit IDs/revisions/manifest hashes, clean
   artifact IDs/MIME/sizes/hashes/expiries, `issued_at`, `expires_at` and
   decision. They cannot be edited, extended or partially reused.

9. Attestations use HMAC-SHA-256 over the RFC 8785 canonical payload excluding
   the HMAC field. The secret is at least 32 cryptographically random bytes,
   stored outside the repository and accessible only to the signing service.
   The signing service performs both signing and verification; neither the
   Resolver caller, production orchestrator, Remotion input props nor Chromium
   receives the secret. Verification uses constant-time comparison.

10. Active HMAC keys rotate at least every 90 days and are addressed by
    `key_id`. Retired keys remain signing-disabled and verification-only
    inside the signing service for the audit-retention period; revoked keys
    fail all new render authorization immediately. Missing, empty, unknown,
    retired-for-signing or revoked keys fail closed. Rotation and revocation
    behavior require automated tests.

11. A render attestation is valid for at most 30 minutes and one
    `render_request_id`. Its nonce is consumed atomically at render start.
    Expired, replayed, wrong-request, wrong-version, wrong-key or
    signature-invalid attestations are rejected.

12. Any error in schema, source provenance, lifecycle, rights, expiry, claim
    binding, manifest hash, artifact path/MIME/size/hash, staging, signature,
    key status, nonce, replay state or audit persistence aborts the whole
    request. There is no fallback to illustrative mode, legacy evidence,
    unsigned rendering, partial rendering, default claims or manual override.

13. Existing unversioned Evidence Bank records are `legacy-v1`. They are
    never automatically migrated, mutated in place, batch-converted or admitted
    to production. Reuse requires manual re-attestation as a newly issued v2
    unit with a new `unit_id`, optional `supersedes_unit_id`, named-human
    review, explicit future expiries and freshly computed integrity fields.
    The legacy unit remains unchanged.

14. Attestations and resolver decision records are append-only audit metadata
    retained for seven years. Audit records contain IDs, versions, hashes,
    timestamps, key IDs, reason codes and decisions only—never claim text,
    evidence bodies, consent documents, secrets, signed URLs, raw paths or
    private artifact contents.

15. The current public `ValidatedFourSurfaceMap` keeps its unconditional
    production rejection. HMAC verification occurs at the Node/signing-service
    boundary; the secret never enters the visual renderer. A future private
    production entry point receives only the verified scene projection and
    immutable staged artifacts.

16. Approval of this amendment authorizes implementation of schemas, synthetic
    fixtures, negative tests, Resolver shadow mode, signing-service integration
    and synthetic end-to-end rendering only. Production remains disabled until
    a separate founder decision records: completed Resolver, key
    rotation/revocation tests, full negative matrix, clean-install CI, named
    human review, exact release commit and explicit production activation.

17. A valid render attestation authorizes one render attempt only. It does not
    grant `APPROVED_SCRIPT`, `APPROVED_PUBLISH`, account access, deployment
    or publication authority.

---

## 3. Contract invariants

1. Evidence precedes production rendering.
2. Only the Resolver service identity writes `PUBLISHABLE`.
3. Humans approve evidence inputs; they do not self-attest them.
4. No process in the render path reads `raw/`.
5. A path named `clean/` is not trusted until bytes and metadata verify.
6. Every dynamic public claim has exactly one typed evidence binding.
7. Visual styling never enters the evidence or render data contract.
8. HMAC authority never crosses the signing-service boundary.
9. Attestation binds exact canonical manifests and exact artifact bytes.
10. Resolution is all-or-nothing.
11. Legacy evidence never gains authority by inference.
12. Rendering, deployment and publication remain separate gates.

## 4. Trust boundaries

| Boundary | Trust | Authority |
|---|---|---|
| AI/editor/API input | untrusted | propose CAPTURED content only |
| Human reviewer | trusted editorial reviewer | approve wording, source, rights and redaction; cannot write PUBLISHABLE |
| CAPTURED Evidence Bank area | untrusted submission | no production authority |
| Evidence Resolver service identity | trusted policy gate | validate and atomically issue PUBLISHABLE v2 revision |
| `clean/` storage | untrusted until byte verification | artifact source only |
| `raw/` storage | prohibited | no resolver/render access |
| Signing service | highest-trust secret boundary | sole HMAC sign/verify and key-status authority |
| Verified staging | trusted by digest, read-only | production renderer artifact source |
| Render orchestrator | trusted consumer | request verification and invoke one private render |
| Remotion/Chromium | non-secret execution boundary | render verified projection only |
| Audit store | append-only metadata | retain attestations and decisions for seven years |
| Publication gate | separate human/platform authority | publish only after independent approvals |

Filesystem and IAM policy must make the Resolver service account the sole writer
of v2 `PUBLISHABLE` state. The signing service must be the sole principal able
to read HMAC key material.

## 5. Threat model

The accepted implementation must reject or contain:

- manual or forged `PUBLISHABLE` state;
- malformed, unknown-field, duplicate-ID or legacy manifests;
- missing or false source provenance;
- expired rights or artifacts;
- missing, changed, truncated or substituted clean evidence;
- MIME spoofing, directory substitution and unsupported types;
- absolute paths, traversal, `raw/` access, symlink and realpath escape;
- claim substitution, unbound wording and free paraphrase;
- manifest mutation after review or attestation;
- time-of-check/time-of-use artifact replacement;
- partial resolution followed by permissive rendering;
- HMAC forgery, truncation, wrong key, missing key and secret leakage;
- signing with a retired/revoked key;
- stale attestation and replay under another request;
- audit deletion, mutation or inclusion of private contents;
- direct invocation of an unattested production composition;
- automatic, inferred or in-place legacy migration.

## 6. Working transition policy

### Phase 0 — current state

- `FourSurfaceMap v1.0.0` remains available for demos/previews.
- Production remains unconditionally disabled.
- Evidence Bank stays on the current unversioned contract.
- Draft schema has no runtime or CI authority.

### Phase 1 — after formal amendment approval

- Freeze the accepted Evidence Unit v2 and render claim-binding contracts.
- Implement schemas and negative tests first.
- Disable direct v2 promotion in human-facing CLI; humans submit for resolution.
- Create only synthetic v2 fixtures.
- Do not touch any legacy unit.

### Phase 2 — shadow resolution

- Resolver validates synthetic/CAPTURED v2 submissions and emits decision
  records without renderer access.
- Signing service uses non-production keys.
- Rotation, revocation, expiry, replay and wrong-key tests must pass.
- Immutable staging and TOCTOU tests must pass.

### Phase 3 — synthetic render

- A private Node entry point verifies the attestation through the signing
  service and runs a synthetic render.
- Public/default Remotion compositions remain unable to render production.
- Existing twenty visual baselines must remain unchanged.

### Phase 4 — separate production decision

Production may be activated only after:

1. Resolver and signing-service boundary are complete;
2. IAM proves only Resolver writes PUBLISHABLE;
3. 90-day rotation and immediate revocation paths are tested;
4. full negative/security suite passes;
5. clean `npm ci`/clean-install CI passes;
6. synthetic end-to-end render passes;
7. named humans approve evidence, security and visual outputs;
8. exact commit, CI run, key owner and rollback are recorded;
9. Founder explicitly authorizes activation.

## 7. Read-only audit of current `main`

Audited commit: `6706af3b70c3da478109ac7763093c01a80dd6e8`.

| File | Current observation | Required future correction |
|---|---|---|
| `docs/founder-notes/DEC-851.md` | base decision accepted; status text still says rc.2 | append approved amendment and correct release status |
| `docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md` | v1.0.0 component released; production disabled | add versioned production claim-binding contract |
| `scripts/caesthetic/evidence/schema.mjs` | unversioned and unknown-field permissive | add strict v2 parsing and legacy classification |
| `scripts/caesthetic/evidence/new-unit.mjs` | human CLI can promote after basic validation | v2 CLI submits; only Resolver promotes |
| `scripts/caesthetic/evidence/from-score.mjs` | emits conservative legacy CAPTURED drafts | emit new v2 CAPTURED drafts only after approval |
| `scripts/caesthetic/asset-worker/publish-request.mjs` | trusts stored PUBLISHABLE/USED string | require verified v2 attestation |
| `src/render-manifest.schema.ts` | evidence IDs are not claim bindings | add versioned strict production bindings |
| `src/ValidatedFourSurfaceMap.tsx` | unconditional production throw | keep unchanged |
| FourSurfaceMap CI | visual package only | add separate Resolver clean-install/security gate |

Current code has no HMAC secret, signing service, Resolver production path,
migration or production composition.

## 8. Exact future file/change inventory

Nothing in this section is authorized before formal approval.

### Decision and SSOT

- `docs/founder-notes/DEC-851.md` — append the compact amendment.
- `docs/ssot/CAESTHETIC_REMOTION_EVIDENCE_RESOLVER.md` — activate accepted policy.
- `docs/ssot/CAESTHETIC_EVIDENCE_BANK.md` — define v2, Resolver-only promotion and legacy handling.
- `docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md` — define production claim bindings.
- `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` — align release gates.
- `docs/projects/caesthetic/PROJECT_STATUS.md` — record milestone, still production-disabled.
- `docs/CONTEXT_HANDOFF.md`, `docs/LAST_SYNC.md` — record completed implementation.

### Evidence Bank

- `scripts/caesthetic/evidence/schema.mjs` — strict versioned v2 validator.
- `scripts/caesthetic/evidence/new-unit.mjs` — submit-for-resolution; no direct v2 promote.
- `scripts/caesthetic/evidence/from-score.mjs` — new v2 CAPTURED drafts only.
- `scripts/caesthetic/evidence/evidence-unit-v2.schema.json` — accepted JSON Schema.
- `scripts/caesthetic/evidence/verify-clean-artifacts.mjs` — path/MIME/size/hash/expiry checks.
- `scripts/caesthetic/evidence/canonical-json.mjs` — reviewed RFC 8785 adapter.
- `scripts/caesthetic/evidence/resolver-service.mjs` — sole PUBLISHABLE transition.
- `scripts/caesthetic/evidence/signing-client.mjs` — sign/verify client without secret access.

### Signing, attestation and rendering

- `services/caesthetic-evidence-signing/**` — secret-isolated HMAC sign/verify, key registry and revocation.
- `scripts/caesthetic/remotion-four-surface-map/src/render-manifest.schema.ts` — versioned production bindings.
- `scripts/caesthetic/remotion-four-surface-map/server/evidence-resolver.ts` — all-or-nothing orchestration.
- `server/attestation.ts` — strict immutable attestation schema/client.
- `server/replay-store.ts` — atomic nonce consumption.
- `server/verified-staging.ts` — content-addressed staging.
- `server/render-production.ts` — private Node render entry.
- `src/ProductionRoot.tsx` — production-only verified projection.
- `src/ValidatedFourSurfaceMap.tsx` — retain unconditional throw.
- `src/Root.tsx` — keep private production composition unregistered.

### Downstream and tests

- `scripts/caesthetic/asset-worker/publish-request.mjs` — reject lifecycle-only/legacy clearance.
- `tests/caesthetic/evidence-bank.test.mjs` — strict v2, promotion ownership and filesystem tests.
- `tests/caesthetic/publish-request.test.mjs` — reject legacy/expired/unattested evidence.
- `tests/evidence-resolver.spec.ts` — complete negative matrix.
- `tests/attestation.spec.ts` — HMAC, mutation, rotation, revocation and replay.
- `tests/production-boundary.spec.ts` — prove public composition cannot bypass.
- `tests/fixtures/evidence-v2/**` — synthetic fixtures only.
- package manifest/lockfile — pin reviewed JCS/service dependencies under integrator ownership.
- `.github/workflows/caesthetic-evidence-resolver.yml` — new path-scoped clean-install/security gate.
- existing FourSurfaceMap workflow — remain the locked visual regression gate.

## 9. Draft JSON Schema boundary

`scripts/caesthetic/evidence/drafts/evidence-unit-v2.schema.draft.json` is a
non-authoritative review artifact. It is not imported by current code, current
tests or CI. Runtime rules that JSON Schema cannot prove—future-time checks,
MIME sniffing, filesystem containment, SHA-256 verification, promotion
ownership and HMAC verification—remain mandatory Resolver rules.
