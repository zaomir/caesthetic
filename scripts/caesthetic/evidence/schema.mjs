/**
 * CAESTHETIC Evidence Bank — manifest schema and lifecycle validation.
 * SSOT: docs/ssot/CAESTHETIC_EVIDENCE_BANK.md (DEC-842)
 *
 * Lifecycle: CAPTURED -> PUBLISHABLE -> USED (V3.2 §5).
 * This module is the only place that decides whether a unit may advance
 * lifecycle state. Nothing else should hand-roll that check.
 */

export const EPISTEMIC_LABELS = Object.freeze([
  "Observed",
  "Measured",
  "Calculated",
  "Benchmark",
  "Estimated",
  "Illustrative",
]);

export const LIFECYCLE_STATES = Object.freeze(["CAPTURED", "PUBLISHABLE", "USED"]);

export const RIGHTS_STATUSES = Object.freeze([
  "public_source",
  "anonymized_only",
  "client_consented",
]);

const REQUIRED_ALWAYS = Object.freeze([
  "unit_id",
  "source",
  "capture_date",
  "epistemic_label",
  "verified_observation",
  "allowed_public_wording",
  "rights_status",
  "redaction_status",
  "lifecycle_state",
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value));
}

/**
 * Validate a manifest object. Returns { ok, errors, missing } — never throws,
 * so callers (CLI, gates, tests) decide what to do with a failing manifest.
 */
export function validateManifest(manifest) {
  const errors = [];
  const missing = [];
  const m = manifest && typeof manifest === "object" ? manifest : {};

  for (const field of REQUIRED_ALWAYS) {
    if (!isNonEmptyString(m[field])) missing.push(field);
  }

  if (isNonEmptyString(m.capture_date) && !isIsoDate(m.capture_date)) {
    errors.push("capture_date must be an ISO 8601 date");
  }
  if (isNonEmptyString(m.epistemic_label) && !EPISTEMIC_LABELS.includes(m.epistemic_label)) {
    errors.push(`epistemic_label must be one of ${EPISTEMIC_LABELS.join(", ")}`);
  }
  if (isNonEmptyString(m.lifecycle_state) && !LIFECYCLE_STATES.includes(m.lifecycle_state)) {
    errors.push(`lifecycle_state must be one of ${LIFECYCLE_STATES.join(", ")}`);
  }
  if (isNonEmptyString(m.rights_status) && !RIGHTS_STATUSES.includes(m.rights_status)) {
    errors.push(`rights_status must be one of ${RIGHTS_STATUSES.join(", ")}`);
  }

  // method/scope required when the label is not a raw direct observation.
  if (["Calculated", "Benchmark", "Estimated"].includes(m.epistemic_label) && !isNonEmptyString(m.method_scope)) {
    missing.push("method_scope");
  }

  // Illustrative/model-example units never need a reviewer or PII redaction
  // decision because they carry no real client data by definition.
  const needsRedactionReview = m.epistemic_label !== "Illustrative";
  if (needsRedactionReview) {
    if (!isNonEmptyString(m.reviewer)) missing.push("reviewer");
    if (isNonEmptyString(m.redaction_status) && m.redaction_status === "not_applicable") {
      errors.push("redaction_status cannot be not_applicable for a non-Illustrative unit");
    }
  }

  // A client-derived observation (rights_status other than public_source)
  // must not sit at client_consented without an explicit consent record.
  if (m.rights_status === "client_consented" && !isNonEmptyString(m.consent_ref)) {
    missing.push("consent_ref");
  }

  return { ok: errors.length === 0 && missing.length === 0, errors, missing };
}

/**
 * Whether a manifest may advance from CAPTURED to PUBLISHABLE.
 * PUBLISHABLE additionally requires redaction_status to be a terminal,
 * reviewed value ("clean" or "not_applicable" for Illustrative units) —
 * "pending" or "raw_only" block promotion even if every field is present.
 */
export function canPromoteToPublishable(manifest) {
  const { ok, errors, missing } = validateManifest(manifest);
  if (!ok) return { ok: false, errors, missing };
  const redaction = manifest.redaction_status;
  const terminal = redaction === "clean" || redaction === "not_applicable";
  if (!terminal) {
    return { ok: false, errors: [`redaction_status "${redaction}" is not a terminal reviewed state`], missing: [] };
  }
  return { ok: true, errors: [], missing: [] };
}
