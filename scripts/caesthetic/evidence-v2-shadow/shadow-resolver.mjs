import fs from "node:fs";
import path from "node:path";
import {canonicalize, sha256Hex} from "./canonical-json.mjs";
import {normalizeClaimText, validateEvidenceUnitV2} from "./evidence-unit-v2.mjs";
import {validateRenderManifestV1} from "./render-manifest-v1.mjs";
import {stageVerifiedArtifacts, verifyCleanArtifacts} from "./verify-clean-artifacts.mjs";

function fail(code, detail = "") {
  throw Object.assign(new Error(`${code}${detail ? `:${detail}` : ""}`), {code, detail});
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}
function readJson(file, code) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch (error) { fail(code, error.message); }
  try { return JSON.parse(text); } catch (error) { fail("invalid_json", `${file}:${error.message}`); }
}
function sceneValue(scene, slot) {
  if (slot === "headline_text") return {type: "text", value: normalizeClaimText(scene.headline)};
  if (slot === "practice_label_text") return {type: "text", value: normalizeClaimText(scene.practice_label)};
  if (slot === "binding_constraint_surface") return {type: "surface_id", value: scene.binding_constraint.surface_id};
  if (slot === "growth_score_target_surface") return {type: "surface_id", value: scene.growth_score_return.target_surface_id};
  fail("unknown_claim_slot", slot);
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

export class InMemoryReplayStore {
  #consumed = new Set();
  consume(renderRequestId, nonce) {
    const key = `${renderRequestId}:${nonce}`;
    if (this.#consumed.has(key)) fail("attestation_replay", key);
    this.#consumed.add(key);
  }
}

export function resolveShadow({
  manifest: manifestInput,
  sceneId,
  bankRoot,
  stagingRoot,
  auditRoot,
  renderRequestId,
  nonce,
  signingService,
  keyId,
  now = new Date(),
}) {
  if (!signingService || typeof signingService.sign !== "function") fail("signing_service_required");
  if (!/^[A-Za-z0-9._-]{8,120}$/.test(renderRequestId || "")) fail("invalid_render_request_id");
  if (!/^[A-Za-z0-9_-]{16,120}$/.test(nonce || "")) fail("invalid_nonce");
  const current = now instanceof Date ? new Date(now) : new Date(now);
  if (!Number.isFinite(current.getTime())) fail("invalid_now");

  const manifest = validateRenderManifestV1(structuredClone(manifestInput));
  const scene = manifest.scenes.find((item) => item.scene_id === sceneId);
  if (!scene) fail("scene_not_found", sceneId);

  const unitIds = [...new Set(scene.evidence.claim_bindings.map((binding) => binding.evidence_unit_id))].sort();
  const resolvedUnits = new Map();
  const evidenceAttestation = [];
  const allVerifiedArtifacts = [];

  for (const unitId of unitIds) {
    const unitDirectory = path.resolve(bankRoot, unitId);
    const manifestPath = path.join(unitDirectory, "manifest.json");
    const unit = validateEvidenceUnitV2(readJson(manifestPath, "evidence_unit_missing"), {
      now: current,
      expectedUnitId: unitId,
    });
    if (unit.lifecycle_state !== "CAPTURED") fail("shadow_requires_captured_unit", unitId);
    if (unit.publishable_attestation_id !== null) fail("captured_attestation_forbidden", unitId);
    if (unit.epistemic_label !== scene.evidence.epistemic_label) fail("epistemic_label_mismatch", unitId);
    if (unit.redaction_status !== "clean") fail("terminal_redaction_required", unitId);
    const artifacts = verifyCleanArtifacts(unit, unitDirectory);
    if (artifacts.length === 0) fail("clean_artifact_required", unitId);
    allVerifiedArtifacts.push(...artifacts);
    const evidence_manifest_sha256 = sha256Hex(unit);
    resolvedUnits.set(unitId, {unit, artifacts, evidence_manifest_sha256});
    evidenceAttestation.push({
      unit_id: unit.unit_id,
      unit_revision: unit.unit_revision,
      evidence_manifest_sha256,
      clean_artifacts: artifacts.map((artifact) => ({
        artifact_id: artifact.artifact_id,
        media_type: artifact.media_type,
        byte_size: artifact.byte_size,
        sha256: artifact.sha256,
        created_at: artifact.created_at,
        expires_at: artifact.expires_at,
      })).sort((a, b) => a.artifact_id.localeCompare(b.artifact_id)),
    });
  }

  for (const binding of scene.evidence.claim_bindings) {
    const resolved = resolvedUnits.get(binding.evidence_unit_id);
    if (!resolved) fail("binding_unit_unresolved", binding.binding_id);
    const claim = resolved.unit.authorized_public_claims.find((item) => item.claim_id === binding.evidence_claim_id);
    if (!claim) fail("binding_claim_missing", binding.binding_id);
    const expected = sceneValue(scene, binding.claim_slot);
    if (claim.claim_type !== expected.type) fail("binding_claim_type_mismatch", binding.binding_id);
    const claimValue = claim.claim_type === "text" ? normalizeClaimText(claim.value) : claim.value;
    if (claimValue !== expected.value) fail("binding_value_mismatch", binding.binding_id);
  }

  fs.mkdirSync(stagingRoot, {recursive: true, mode: 0o700});
  const staged = stageVerifiedArtifacts(allVerifiedArtifacts, stagingRoot, renderRequestId);

  const evidenceIds = unitIds;
  const verifiedSceneProjection = freeze({
    scene_id: scene.scene_id,
    type: scene.type,
    mode: scene.mode,
    locale: scene.locale,
    start_frame: scene.start_frame,
    end_frame: scene.end_frame,
    headline: scene.headline,
    practice_label: scene.practice_label,
    binding_constraint: structuredClone(scene.binding_constraint),
    growth_score_return: structuredClone(scene.growth_score_return),
    timeline_cues: structuredClone(scene.timeline_cues),
    evidence: {
      epistemic_label: scene.evidence.epistemic_label,
      evidence_ids: evidenceIds,
      public_label: `EVIDENCE — ${scene.evidence.epistemic_label.toUpperCase()}`,
    },
  });

  const issuedAt = current.toISOString();
  const expiresAt = addMinutes(current, 30).toISOString();
  const payload = {
    attestation_version: "cae-render-attestation@1.0.0",
    mode: "shadow",
    resolver_version: "cae-evidence-resolver-shadow@1.0.0",
    key_id: keyId,
    render_request_id: renderRequestId,
    nonce,
    content_id: manifest.content_id,
    scene_ids: [scene.scene_id],
    render_manifest_sha256: sha256Hex(manifest),
    verified_scene_projection_sha256: sha256Hex(verifiedSceneProjection),
    evidence: evidenceAttestation.sort((a, b) => a.unit_id.localeCompare(b.unit_id)),
    staged_artifacts: staged.map(({artifact_id, media_type, byte_size, sha256, expires_at}) => ({
      artifact_id, media_type, byte_size, sha256, expires_at,
    })).sort((a, b) => a.artifact_id.localeCompare(b.artifact_id)),
    issued_at: issuedAt,
    expires_at: expiresAt,
    decision: "SHADOW_PUBLISHABLE",
  };
  const attestation = signingService.sign(payload, keyId);

  const audit = freeze({
    audit_version: "cae-render-audit@1.0.0",
    mode: "shadow",
    render_request_id: renderRequestId,
    content_id: manifest.content_id,
    scene_ids: [scene.scene_id],
    attestation_sha256: sha256Hex(attestation),
    render_manifest_sha256: payload.render_manifest_sha256,
    evidence: evidenceAttestation.map((item) => ({
      unit_id: item.unit_id,
      unit_revision: item.unit_revision,
      evidence_manifest_sha256: item.evidence_manifest_sha256,
      clean_artifact_sha256: item.clean_artifacts.map((artifact) => artifact.sha256),
    })),
    key_id: keyId,
    issued_at: issuedAt,
    expires_at: expiresAt,
    decision: "SHADOW_PUBLISHABLE",
  });
  fs.mkdirSync(auditRoot, {recursive: true, mode: 0o700});
  const auditPath = path.join(auditRoot, `${renderRequestId}.json`);
  fs.writeFileSync(auditPath, `${canonicalize(audit)}\n`, {flag: "wx", mode: 0o400});

  return freeze({
    attestation,
    verified_scene_projection: verifiedSceneProjection,
    staged_artifacts: staged,
    audit_path: auditPath,
  });
}

export function verifyShadowForSyntheticRender({
  resolution,
  manifest,
  renderRequestId,
  signingService,
  replayStore,
  now = new Date(),
}) {
  if (!replayStore || typeof replayStore.consume !== "function") fail("replay_store_required");
  const payload = signingService.verify(resolution.attestation);
  if (payload.mode !== "shadow" || payload.decision !== "SHADOW_PUBLISHABLE") fail("non_shadow_attestation_forbidden");
  if (payload.render_request_id !== renderRequestId) fail("render_request_mismatch");
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs) || nowMs < Date.parse(payload.issued_at) || nowMs >= Date.parse(payload.expires_at)) {
    fail("attestation_expired_or_not_yet_valid");
  }
  const validatedManifest = validateRenderManifestV1(structuredClone(manifest));
  if (sha256Hex(validatedManifest) !== payload.render_manifest_sha256) fail("render_manifest_hash_mismatch");
  if (sha256Hex(resolution.verified_scene_projection) !== payload.verified_scene_projection_sha256) {
    fail("verified_projection_hash_mismatch");
  }
  replayStore.consume(renderRequestId, payload.nonce);
  return resolution.verified_scene_projection;
}
