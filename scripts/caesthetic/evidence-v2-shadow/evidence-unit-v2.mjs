const VERSION = "cae-evidence-unit@2.0.0";
const LABELS = new Set(["Observed", "Measured", "Calculated", "Benchmark", "Estimated", "Illustrative"]);
const RIGHTS = new Set(["public_source", "anonymized_only", "client_consented"]);
const STATES = new Set(["CAPTURED", "PUBLISHABLE", "USED"]);
const SOURCE_TYPES = new Set(["public_url", "private_reference", "first_party_system", "model_fixture"]);
const SURFACES = new Set(["search", "website", "social", "reputation"]);
const UNIT_ID_RE = /^[A-Za-z0-9._-]{6,80}$/;
const ID_RE = /^[A-Za-z0-9._-]{1,80}$/;
const SHA_RE = /^[a-f0-9]{64}$/;
const MIME_RE = /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/;

function fail(code, path, detail = "") {
  const suffix = detail ? `:${detail}` : "";
  throw Object.assign(new Error(`${code}:${path}${suffix}`), {code, path, detail});
}

function objectAt(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("invalid_object", path);
  return value;
}

function exactKeys(value, allowed, required, path) {
  objectAt(value, path);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail("unknown_field", `${path}.${key}`);
  for (const key of required) if (!Object.hasOwn(value, key)) fail("missing_field", `${path}.${key}`);
}

function text(value, path, {min = 1, max = Infinity, pattern} = {}) {
  if (typeof value !== "string" || value.length < min || value.length > max || (pattern && !pattern.test(value))) {
    fail("invalid_string", path);
  }
  return value;
}

function nullableText(value, path) {
  if (value !== null) text(value, path);
}

function integer(value, path, min = 0) {
  if (!Number.isInteger(value) || value < min) fail("invalid_integer", path);
}

function iso(value, path, {dateOnly = false, futureOf} = {}) {
  text(value, path);
  const re = dateOnly ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  if (!re.test(value)) fail("invalid_iso_time", path);
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) fail("invalid_iso_time", path);
  if (futureOf !== undefined && ms <= futureOf) fail("expired", path);
  return ms;
}

function unique(values, path) {
  if (new Set(values).size !== values.length) fail("duplicate_id", path);
}

export function normalizeClaimText(value) {
  return text(value, "claim.value").replace(/\r\n/g, "\n").normalize("NFC").trim();
}

export function validateEvidenceUnitV2(input, {now = new Date(), expectedUnitId} = {}) {
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs)) fail("invalid_now", "now");
  const unit = objectAt(input, "$");
  const allowed = new Set([
    "evidence_manifest_version", "unit_id", "unit_revision", "supersedes_unit_id",
    "source", "capture_date", "epistemic_label", "verified_observation",
    "method_scope", "authorized_public_claims", "rights_status", "consent_ref",
    "rights_valid_until", "redaction_status", "reviewer", "reviewed_at",
    "lifecycle_state", "publishable_attestation_id", "clean_artifacts", "reuse",
    "created_at", "updated_at",
  ]);
  const required = new Set([...allowed].filter((key) => key !== "supersedes_unit_id"));
  exactKeys(unit, allowed, required, "$");

  if (unit.evidence_manifest_version !== VERSION) fail("unsupported_evidence_version", "$.evidence_manifest_version");
  text(unit.unit_id, "$.unit_id", {min: 6, max: 80, pattern: UNIT_ID_RE});
  if (expectedUnitId !== undefined && unit.unit_id !== expectedUnitId) fail("unit_id_path_mismatch", "$.unit_id");
  integer(unit.unit_revision, "$.unit_revision", 1);
  if (unit.supersedes_unit_id !== undefined) {
    text(unit.supersedes_unit_id, "$.supersedes_unit_id", {min: 6, max: 80, pattern: UNIT_ID_RE});
    if (unit.supersedes_unit_id === unit.unit_id) fail("self_supersession", "$.supersedes_unit_id");
  }

  const source = objectAt(unit.source, "$.source");
  exactKeys(source, new Set(["source_type", "reference", "captured_at"]), new Set(["source_type", "reference", "captured_at"]), "$.source");
  if (!SOURCE_TYPES.has(source.source_type)) fail("invalid_source_type", "$.source.source_type");
  text(source.reference, "$.source.reference", {max: 2048});
  if (/([?&](?:token|signature|sig|key|secret)=)|(^|\/)raw\//i.test(source.reference)) {
    fail("forbidden_source_reference", "$.source.reference");
  }
  iso(source.captured_at, "$.source.captured_at");
  iso(unit.capture_date, "$.capture_date", {dateOnly: true});

  if (!LABELS.has(unit.epistemic_label)) fail("invalid_epistemic_label", "$.epistemic_label");
  text(unit.verified_observation, "$.verified_observation");
  nullableText(unit.method_scope, "$.method_scope");
  if (["Calculated", "Benchmark", "Estimated"].includes(unit.epistemic_label) && !unit.method_scope) {
    fail("method_scope_required", "$.method_scope");
  }

  if (!Array.isArray(unit.authorized_public_claims)) fail("invalid_array", "$.authorized_public_claims");
  const claimIds = [];
  for (let index = 0; index < unit.authorized_public_claims.length; index += 1) {
    const claim = objectAt(unit.authorized_public_claims[index], `$.authorized_public_claims[${index}]`);
    const base = new Set(["claim_id", "claim_type", "value"]);
    if (claim.claim_type === "text") base.add("locale");
    exactKeys(claim, base, base, `$.authorized_public_claims[${index}]`);
    text(claim.claim_id, `$.authorized_public_claims[${index}].claim_id`, {max: 80, pattern: ID_RE});
    claimIds.push(claim.claim_id);
    if (claim.claim_type === "text") {
      if (claim.locale !== "en-US") fail("invalid_claim_locale", `$.authorized_public_claims[${index}].locale`);
      if (normalizeClaimText(claim.value) !== claim.value) fail("claim_not_normalized", `$.authorized_public_claims[${index}].value`);
    } else if (claim.claim_type === "surface_id") {
      if (!SURFACES.has(claim.value)) fail("invalid_surface_claim", `$.authorized_public_claims[${index}].value`);
    } else {
      fail("invalid_claim_type", `$.authorized_public_claims[${index}].claim_type`);
    }
  }
  unique(claimIds, "$.authorized_public_claims.claim_id");

  if (!RIGHTS.has(unit.rights_status)) fail("invalid_rights_status", "$.rights_status");
  nullableText(unit.consent_ref, "$.consent_ref");
  if (unit.rights_status === "client_consented" && !unit.consent_ref) fail("consent_ref_required", "$.consent_ref");
  iso(unit.rights_valid_until, "$.rights_valid_until", {futureOf: nowMs});

  if (!["pending", "clean", "not_applicable"].includes(unit.redaction_status)) fail("invalid_redaction_status", "$.redaction_status");
  nullableText(unit.reviewer, "$.reviewer");
  if (unit.reviewed_at !== null) iso(unit.reviewed_at, "$.reviewed_at");
  if (unit.epistemic_label === "Illustrative") {
    if (source.source_type !== "model_fixture" || unit.reviewer !== null || unit.reviewed_at !== null || unit.redaction_status !== "not_applicable") {
      fail("invalid_illustrative_review_state", "$");
    }
  } else {
    if (source.source_type === "model_fixture") fail("model_fixture_forbidden", "$.source.source_type");
    if (!unit.reviewer || !unit.reviewed_at) fail("named_review_required", "$.reviewer");
    if (!["pending", "clean"].includes(unit.redaction_status)) fail("invalid_redaction_status", "$.redaction_status");
  }

  if (!STATES.has(unit.lifecycle_state)) fail("invalid_lifecycle_state", "$.lifecycle_state");
  nullableText(unit.publishable_attestation_id, "$.publishable_attestation_id");

  if (!Array.isArray(unit.clean_artifacts)) fail("invalid_array", "$.clean_artifacts");
  const artifactIds = [];
  const artifactPaths = [];
  for (let index = 0; index < unit.clean_artifacts.length; index += 1) {
    const artifact = objectAt(unit.clean_artifacts[index], `$.clean_artifacts[${index}]`);
    const keys = new Set(["artifact_id", "relative_path", "media_type", "byte_size", "sha256", "created_at", "expires_at"]);
    exactKeys(artifact, keys, keys, `$.clean_artifacts[${index}]`);
    text(artifact.artifact_id, `$.clean_artifacts[${index}].artifact_id`, {max: 80, pattern: ID_RE});
    artifactIds.push(artifact.artifact_id);
    text(artifact.relative_path, `$.clean_artifacts[${index}].relative_path`);
    if (!/^clean\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(artifact.relative_path)
      || /(?:^|\/)\.\.?(?:\/|$)/.test(artifact.relative_path)
      || artifact.relative_path.includes("//")) {
      fail("invalid_clean_relative_path", `$.clean_artifacts[${index}].relative_path`);
    }
    artifactPaths.push(artifact.relative_path);
    text(artifact.media_type, `$.clean_artifacts[${index}].media_type`, {pattern: MIME_RE});
    integer(artifact.byte_size, `$.clean_artifacts[${index}].byte_size`, 1);
    text(artifact.sha256, `$.clean_artifacts[${index}].sha256`, {min: 64, max: 64, pattern: SHA_RE});
    const created = iso(artifact.created_at, `$.clean_artifacts[${index}].created_at`);
    const expires = iso(artifact.expires_at, `$.clean_artifacts[${index}].expires_at`, {futureOf: nowMs});
    if (expires <= created) fail("artifact_expiry_before_creation", `$.clean_artifacts[${index}].expires_at`);
  }
  unique(artifactIds, "$.clean_artifacts.artifact_id");
  unique(artifactPaths, "$.clean_artifacts.relative_path");

  if (!Array.isArray(unit.reuse) || unit.reuse.some((item) => typeof item !== "string" || !item.trim())) {
    fail("invalid_reuse", "$.reuse");
  }
  unique(unit.reuse, "$.reuse");
  iso(unit.created_at, "$.created_at");
  iso(unit.updated_at, "$.updated_at");

  if (unit.lifecycle_state === "CAPTURED") {
    if (unit.publishable_attestation_id !== null) fail("captured_attestation_forbidden", "$.publishable_attestation_id");
  } else {
    if (!unit.publishable_attestation_id) fail("publishable_attestation_required", "$.publishable_attestation_id");
    if (unit.authorized_public_claims.length === 0) fail("claims_required", "$.authorized_public_claims");
    if (unit.clean_artifacts.length === 0) fail("clean_artifact_required", "$.clean_artifacts");
    if (!["clean", "not_applicable"].includes(unit.redaction_status)) fail("terminal_redaction_required", "$.redaction_status");
  }

  return unit;
}

export const EVIDENCE_UNIT_V2_VERSION = VERSION;
