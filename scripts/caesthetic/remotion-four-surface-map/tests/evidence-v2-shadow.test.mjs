import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

import {canonicalize, sha256Hex} from "../../evidence-v2-shadow/canonical-json.mjs";
import {validateEvidenceUnitV2} from "../../evidence-v2-shadow/evidence-unit-v2.mjs";
import {InMemoryReplayStore, resolveShadow, verifyShadowForSyntheticRender} from "../../evidence-v2-shadow/shadow-resolver.mjs";
import {SyntheticSigningService} from "../../evidence-v2-shadow/synthetic-signing-service.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "fixtures/evidence-v2");
const FIXED_NOW = new Date("2026-08-24T10:00:00.000Z");
const SECRET = "synthetic-only-secret-32-bytes-minimum-0001";

function tempContext() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cae-evidence-v2-"));
  const bank = path.join(root, "bank");
  fs.cpSync(path.join(FIXTURES, "bank"), bank, {recursive: true});
  return {
    root,
    bank,
    staging: path.join(root, "staging"),
    audit: path.join(root, "audit"),
    manifest: JSON.parse(fs.readFileSync(path.join(FIXTURES, "production-manifest.json"), "utf8")),
  };
}
function signing(status = "active") {
  return new SyntheticSigningService([{key_id: "synthetic-k1", secret: SECRET, status}]);
}
function resolve(context, overrides = {}) {
  return resolveShadow({
    manifest: context.manifest,
    sceneId: "S01",
    bankRoot: context.bank,
    stagingRoot: context.staging,
    auditRoot: context.audit,
    renderRequestId: overrides.renderRequestId || "SYNTH-RENDER-0001",
    nonce: overrides.nonce || "synthetic_nonce_00000001",
    signingService: overrides.signingService || signing(),
    keyId: overrides.keyId || "synthetic-k1",
    now: overrides.now || FIXED_NOW,
  });
}
function unitPath(context) {
  return path.join(context.bank, "SYNTH-EV-001", "manifest.json");
}
function mutateUnit(context, mutate) {
  const file = unitPath(context);
  const unit = JSON.parse(fs.readFileSync(file, "utf8"));
  mutate(unit);
  fs.writeFileSync(file, `${JSON.stringify(unit, null, 2)}\n`);
}

test("accepted JSON Schema is strict and versioned", () => {
  const schemaPath = path.resolve(HERE, "../../evidence/evidence-unit-v2.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.evidence_manifest_version.const, "cae-evidence-unit@2.0.0");
  assert.ok(schema.properties.clean_artifacts);
});

test("restricted canonicalizer matches the RFC 8785 object-order example", () => {
  const value = {from_account: "543 232 625-3", to_account: "321 567 636-4", amount: 500, currency: "USD"};
  assert.equal(canonicalize(value), '{"amount":500,"currency":"USD","from_account":"543 232 625-3","to_account":"321 567 636-4"}');
  assert.equal(sha256Hex({b: 2, a: 1}), sha256Hex({a: 1, b: 2}));
});

test("validator rejects legacy and unknown-field manifests", () => {
  assert.throws(() => validateEvidenceUnitV2({unit_id: "legacy-unit"}, {now: FIXED_NOW}), /unknown_field|missing_field/);
  const context = tempContext();
  mutateUnit(context, (unit) => { unit.unauthorized = true; });
  const unit = JSON.parse(fs.readFileSync(unitPath(context), "utf8"));
  assert.throws(() => validateEvidenceUnitV2(unit, {now: FIXED_NOW}), /unknown_field/);
});

test("validator rejects expired rights and clean evidence", () => {
  const context = tempContext();
  mutateUnit(context, (unit) => { unit.rights_valid_until = "2026-08-24T09:59:59.000Z"; });
  assert.throws(() => validateEvidenceUnitV2(JSON.parse(fs.readFileSync(unitPath(context), "utf8")), {now: FIXED_NOW}), /expired/);

  const context2 = tempContext();
  mutateUnit(context2, (unit) => { unit.clean_artifacts[0].expires_at = "2026-08-24T09:59:59.000Z"; });
  assert.throws(() => validateEvidenceUnitV2(JSON.parse(fs.readFileSync(unitPath(context2), "utf8")), {now: FIXED_NOW}), /expired/);
});

test("source provenance rejects raw or signed-secret references", () => {
  const context = tempContext();
  mutateUnit(context, (unit) => { unit.source.reference = "private://raw/client/export.json"; });
  assert.throws(() => resolve(context), /forbidden_source_reference/);

  const context2 = tempContext();
  mutateUnit(context2, (unit) => { unit.source.reference = "https://example.invalid/evidence?token=secret"; });
  assert.throws(() => resolve(context2), /forbidden_source_reference/);
});

test("shadow resolver rejects hash, size and MIME mismatch", () => {
  const hashContext = tempContext();
  fs.appendFileSync(path.join(hashContext.bank, "SYNTH-EV-001/clean/website.txt"), "tampered");
  assert.throws(() => resolve(hashContext), /artifact_size_mismatch|artifact_sha256_mismatch/);

  const sizeContext = tempContext();
  mutateUnit(sizeContext, (unit) => { unit.clean_artifacts[0].byte_size = 60; });
  assert.throws(() => resolve(sizeContext), /artifact_size_mismatch/);

  const mimeContext = tempContext();
  mutateUnit(mimeContext, (unit) => { unit.clean_artifacts[0].media_type = "image/png"; });
  assert.throws(() => resolve(mimeContext), /artifact_mime_mismatch/);
});

test("shadow resolver rejects symlink evidence", () => {
  const context = tempContext();
  const file = path.join(context.bank, "SYNTH-EV-001/clean/website.txt");
  const outside = path.join(context.root, "outside.txt");
  fs.writeFileSync(outside, "outside");
  fs.unlinkSync(file);
  fs.symlinkSync(outside, file);
  assert.throws(() => resolve(context), /artifact_symlink_forbidden|artifact_realpath_escape/);
});

test("claim binding is exact and manifest-bound", () => {
  const context = tempContext();
  context.manifest.scenes[0].headline = "WEBSITE MAY BLOCK GROWTH";
  assert.throws(() => resolve(context), /binding_value_mismatch/);

  const ok = tempContext();
  const service = signing();
  const resolution = resolve(ok, {signingService: service});
  const changed = structuredClone(ok.manifest);
  changed.scenes[0].headline = "WEBSITE MAY BLOCK GROWTH";
  assert.throws(() => verifyShadowForSyntheticRender({
    resolution, manifest: changed, renderRequestId: "SYNTH-RENDER-0001",
    signingService: service, replayStore: new InMemoryReplayStore(), now: FIXED_NOW,
  }), /render_manifest_hash_mismatch|binding_value_mismatch/);
});

test("only shadow Resolver decides; source unit remains CAPTURED byte-for-byte", () => {
  const context = tempContext();
  const before = fs.readFileSync(unitPath(context));
  const resolution = resolve(context);
  const after = fs.readFileSync(unitPath(context));
  assert.deepEqual(after, before);
  assert.equal(JSON.parse(after).lifecycle_state, "CAPTURED");
  assert.equal(resolution.attestation.decision, "SHADOW_PUBLISHABLE");
  assert.equal(resolution.attestation.mode, "shadow");
  assert.ok(Object.isFrozen(resolution.attestation));
  assert.ok(fs.existsSync(resolution.audit_path));
});

test("audit record contains metadata only", () => {
  const context = tempContext();
  const resolution = resolve(context);
  const audit = fs.readFileSync(resolution.audit_path, "utf8");
  assert.doesNotMatch(audit, /WEBSITE BLOCKS GROWTH/);
  assert.doesNotMatch(audit, /Synthetic clean evidence/);
  assert.doesNotMatch(audit, new RegExp(SECRET));
  assert.match(audit, /render_manifest_sha256/);
});

test("HMAC detects mutation and supports rotation/revocation policy", () => {
  const context = tempContext();
  const service = signing();
  const resolution = resolve(context, {signingService: service});
  const forged = structuredClone(resolution.attestation);
  forged.content_id = "FORGED";
  assert.throws(() => service.verify(forged), /invalid_hmac/);

  service.setStatus("synthetic-k1", "retired");
  assert.doesNotThrow(() => service.verify(resolution.attestation));
  assert.throws(() => service.sign({x: 1}, "synthetic-k1"), /retired_key_signing_forbidden/);

  service.setStatus("synthetic-k1", "revoked");
  assert.throws(() => service.verify(resolution.attestation), /revoked_key/);
});

test("attestation is single-request, time-bound and replay-protected", () => {
  const context = tempContext();
  const service = signing();
  const resolution = resolve(context, {signingService: service});
  const replay = new InMemoryReplayStore();
  const args = {
    resolution, manifest: context.manifest, renderRequestId: "SYNTH-RENDER-0001",
    signingService: service, replayStore: replay, now: FIXED_NOW,
  };
  assert.equal(verifyShadowForSyntheticRender(args).scene_id, "S01");
  assert.throws(() => verifyShadowForSyntheticRender(args), /attestation_replay/);

  const context2 = tempContext();
  const service2 = signing();
  const resolution2 = resolve(context2, {signingService: service2});
  assert.throws(() => verifyShadowForSyntheticRender({
    resolution: resolution2, manifest: context2.manifest, renderRequestId: "WRONG-REQUEST-0001",
    signingService: service2, replayStore: new InMemoryReplayStore(), now: FIXED_NOW,
  }), /render_request_mismatch/);
  assert.throws(() => verifyShadowForSyntheticRender({
    resolution: resolution2, manifest: context2.manifest, renderRequestId: "SYNTH-RENDER-0001",
    signingService: service2, replayStore: new InMemoryReplayStore(), now: new Date("2026-08-24T10:31:00.000Z"),
  }), /attestation_expired_or_not_yet_valid/);
});

test("shadow resolver rejects already-PUBLISHABLE input instead of trusting its state", () => {
  const context = tempContext();
  mutateUnit(context, (unit) => {
    unit.lifecycle_state = "PUBLISHABLE";
    unit.publishable_attestation_id = "manual-forgery";
  });
  assert.throws(() => resolve(context), /shadow_requires_captured_unit/);
});
