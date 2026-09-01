/**
 * Auditable runtime contracts for CAESTHETIC Growth Score case/review records.
 *
 * These records deliberately keep candidate evidence, drafts, verified facts,
 * final reports and reusable method releases separate. Validation never mutates
 * a case and never activates a correction globally.
 */
import {
  CANONICAL_METRICS,
  GROWTH_SCORE_SCHEMA_VERSION,
  isNamedHumanReviewer,
  selectedFocusGapIds,
  validateGrowthScoreReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

export const WORKFLOW_RECORD_TYPES = Object.freeze([
  "score_case",
  "candidate_evidence",
  "verified_fact_set",
  "draft",
  "review_event",
  "focus_selection",
  "approved_report",
  "learning_candidate",
  "rule_release",
]);

const CASE_STATES = Object.freeze([
  "created",
  "researching",
  "draft_review",
  "fact_set_frozen",
  "gap_review",
  "report_review",
  "approved",
  "delivered",
  "closed",
]);
const SURFACES = Object.freeze(Object.keys(CANONICAL_METRICS));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const SENSITIVE_LEARNING_KEYS = /^(?:email|phone|name|contact|patient|phi|credential|password|secret|token|api_key|address)$/i;
const RESERVED_SELF_REPORTED_KEYS = new Set([
  "evidence_class",
  "normalized_score",
  "reviewer_status",
  "coverage",
  "class_a",
]);

function invariant(condition, message) {
  if (!condition) throw new TypeError(message);
}

function object(value, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value;
}

function string(value, label) {
  invariant(typeof value === "string" && value.trim(), `${label} is required`);
  return value;
}

function uuid(value, label) {
  string(value, label);
  invariant(UUID.test(value), `${label} must be a UUID`);
}

function timestamp(value, label) {
  string(value, label);
  const calendarDate = value.slice(0, 10);
  const parsedDate = new Date(`${calendarDate}T00:00:00Z`);
  invariant(
    ISO_TIMESTAMP.test(value)
      && Number.isFinite(Date.parse(value))
      && Number.isFinite(parsedDate.valueOf())
      && parsedDate.toISOString().slice(0, 10) === calendarDate,
    `${label} must be an ISO 8601 timestamp`,
  );
}

function namedHuman(value, label) {
  string(value, label);
  invariant(isNamedHumanReviewer(value), `${label} must contain a named human's first and last name or a registered reviewer mononym`);
}

function jsonValue(value, label) {
  try {
    invariant(JSON.stringify(value) !== undefined, `${label} must be JSON-serializable`);
  } catch (error) {
    if (error instanceof TypeError && error.message === `${label} must be JSON-serializable`) throw error;
    throw new TypeError(`${label} must be JSON-serializable`);
  }
}

function stringList(value, label, { nonEmpty = false } = {}) {
  invariant(Array.isArray(value), `${label} must be an array`);
  invariant(!nonEmpty || value.length > 0, `${label} must not be empty`);
  const seen = new Set();
  value.forEach((item, index) => {
    string(item, `${label}[${index}]`);
    invariant(!seen.has(item), `${label} has duplicate value ${item}`);
    seen.add(item);
  });
}

function common(record, type) {
  object(record, type);
  invariant(record.record_type === type, `record_type must be ${type}`);
  uuid(record.id, `${type}.id`);
  timestamp(record.created_at, `${type}.created_at`);
}

function assertNoReservedSelfReportedKeys(value, path = "score_case.self_reported_context") {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    invariant(!RESERVED_SELF_REPORTED_KEYS.has(key), `${path}.${key} cannot promote self-reported context into evidence`);
    assertNoReservedSelfReportedKeys(nested, `${path}.${key}`);
  }
}

function assertDeidentified(value, path = "learning_candidate.content") {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    invariant(!SENSITIVE_LEARNING_KEYS.test(key), `${path}.${key} is not allowed in de-identified learning content`);
    assertDeidentified(nested, `${path}.${key}`);
  }
}

export function validateScoreCaseRecord(record) {
  common(record, "score_case");
  invariant(["owner_intake", "public_evidence_outbound"].includes(record.source_kind), "score_case.source_kind is invalid");
  string(record.intake_version, "score_case.intake_version");
  string(record.workflow_version, "score_case.workflow_version");
  invariant(CASE_STATES.includes(record.state), "score_case.state is invalid");
  object(record.self_reported_context, "score_case.self_reported_context");
  jsonValue(record.self_reported_context, "score_case.self_reported_context");
  assertNoReservedSelfReportedKeys(record.self_reported_context);
  timestamp(record.updated_at, "score_case.updated_at");
  return record;
}

export function validateCandidateEvidenceRecord(record) {
  common(record, "candidate_evidence");
  uuid(record.score_case_id, "candidate_evidence.score_case_id");
  invariant(SURFACES.includes(record.surface), "candidate_evidence.surface is invalid");
  invariant(
    Object.hasOwn(CANONICAL_METRICS[record.surface], record.metric_id),
    `candidate_evidence.metric_id is not canonical for ${record.surface}`,
  );
  invariant(Object.hasOwn(record, "raw_value"), "candidate_evidence.raw_value is required");
  jsonValue(record.raw_value, "candidate_evidence.raw_value");
  invariant(
    ["public_observation", "verified_tool", "human_test", "self_reported", "estimate"].includes(record.source_kind),
    "candidate_evidence.source_kind is invalid",
  );
  invariant(["A", "B"].includes(record.proposed_evidence_class), "candidate_evidence.proposed_evidence_class must be A or B");
  invariant(
    ["unverified", "approved", "rejected", "superseded"].includes(record.verification_state),
    "candidate_evidence.verification_state is invalid",
  );
  string(record.collection_method, "candidate_evidence.collection_method");
  string(record.workflow_version, "candidate_evidence.workflow_version");
  if (record.raw_value === null) {
    invariant(record.source_ref === null, "candidate_evidence.source_ref must be null when unavailable");
    invariant(record.collected_at === null, "candidate_evidence.collected_at must be null when unavailable");
    invariant(record.verification_state !== "approved", "unavailable candidate evidence cannot be approved");
  } else {
    string(record.source_ref, "candidate_evidence.source_ref");
    timestamp(record.collected_at, "candidate_evidence.collected_at");
  }
  if (record.source_kind === "self_reported") {
    invariant(record.proposed_evidence_class !== "A", "self-reported context cannot be proposed as Class A evidence");
    invariant(record.verification_state !== "approved", "self-reported context cannot enter the verified fact set");
  }
  if (record.supersedes_candidate_id !== null) uuid(record.supersedes_candidate_id, "candidate_evidence.supersedes_candidate_id");
  return record;
}

export function validateVerifiedFactSetRecord(record) {
  common(record, "verified_fact_set");
  uuid(record.score_case_id, "verified_fact_set.score_case_id");
  invariant(record.state === "frozen", "verified_fact_set.state must be frozen");
  string(record.version, "verified_fact_set.version");
  stringList(record.candidate_evidence_ids, "verified_fact_set.candidate_evidence_ids", { nonEmpty: true });
  record.candidate_evidence_ids.forEach((id, index) => uuid(id, `verified_fact_set.candidate_evidence_ids[${index}]`));
  namedHuman(record.frozen_by, "verified_fact_set.frozen_by");
  timestamp(record.frozen_at, "verified_fact_set.frozen_at");
  return record;
}

export function validateDraftRecord(record) {
  common(record, "draft");
  uuid(record.score_case_id, "draft.score_case_id");
  invariant(record.state === "ai_draft", "draft.state must be ai_draft");
  invariant(record.publishable === false, "draft.publishable must be false");
  string(record.version, "draft.version");
  string(record.model_version, "draft.model_version");
  for (const field of ["workflow_version", "template_version", "rule_bundle_version"]) {
    string(record[field], `draft.${field}`);
  }
  object(record.content, "draft.content");
  jsonValue(record.content, "draft.content");
  return record;
}

export function validateReviewEventRecord(record) {
  common(record, "review_event");
  uuid(record.score_case_id, "review_event.score_case_id");
  uuid(record.draft_id, "review_event.draft_id");
  invariant(record.append_only === true, "review_event.append_only must be true");
  namedHuman(record.reviewer_name, "review_event.reviewer_name");
  string(record.reason_code, "review_event.reason_code");
  string(record.field_path, "review_event.field_path");
  invariant(Object.hasOwn(record, "before_value"), "review_event.before_value is required");
  invariant(Object.hasOwn(record, "after_value"), "review_event.after_value is required");
  jsonValue(record.before_value, "review_event.before_value");
  jsonValue(record.after_value, "review_event.after_value");
  timestamp(record.reviewed_at, "review_event.reviewed_at");
  for (const field of ["model_version", "workflow_version", "template_version", "rule_bundle_version"]) {
    string(record[field], `review_event.${field}`);
  }
  return record;
}

export function validateFocusSelectionRecord(record) {
  common(record, "focus_selection");
  uuid(record.score_case_id, "focus_selection.score_case_id");
  uuid(record.verified_fact_set_id, "focus_selection.verified_fact_set_id");
  invariant(record.append_only === true, "focus_selection.append_only must be true");
  namedHuman(record.selected_by, "focus_selection.selected_by");
  timestamp(record.selected_at, "focus_selection.selected_at");
  string(record.rationale, "focus_selection.rationale");
  string(record.primary_gap_id, "focus_selection.primary_gap_id");
  stringList(record.supporting_gap_ids, "focus_selection.supporting_gap_ids", { nonEmpty: true });
  stringList(record.gap_ids, "focus_selection.gap_ids", { nonEmpty: true });
  const selected = [record.primary_gap_id, ...record.supporting_gap_ids];
  invariant(selected.length === 3, "focus_selection must contain exactly 3 unique gaps");
  invariant(new Set(selected).size === selected.length, "focus_selection has duplicate selected gap ids");
  invariant(
    record.gap_ids.length >= selected.length,
    "focus_selection.gap_ids must include the full inventory reviewed",
  );
  selected.forEach((id) => invariant(record.gap_ids.includes(id), `focus_selection.gap_ids is missing selected gap ${id}`));
  if (record.report_json_focus) {
    invariant(
      record.report_json_focus.primary_gap_id === record.primary_gap_id,
      "focus_selection does not match report focus_selection.primary_gap_id",
    );
    invariant(
      selectedFocusGapIds(record.report_json_focus).join("|") === selected.join("|"),
      "focus_selection does not match report focus_selection ids",
    );
  }
  return record;
}

export function validateApprovedReportRecord(record) {
  common(record, "approved_report");
  uuid(record.score_case_id, "approved_report.score_case_id");
  uuid(record.draft_id, "approved_report.draft_id");
  uuid(record.verified_fact_set_id, "approved_report.verified_fact_set_id");
  uuid(record.focus_selection_id, "approved_report.focus_selection_id");
  invariant(record.state === "approved", "approved_report.state must be approved");
  string(record.report_version, "approved_report.report_version");
  string(record.verified_fact_set_version, "approved_report.verified_fact_set_version");
  string(record.report_digest, "approved_report.report_digest");
  namedHuman(record.approved_by, "approved_report.approved_by");
  timestamp(record.approved_at, "approved_report.approved_at");
  object(record.report_json, "approved_report.report_json");
  validateGrowthScoreReport(record.report_json);
  invariant(record.report_json.schemaVersion === GROWTH_SCORE_SCHEMA_VERSION, "new approved reports require schemaVersion=5");
  invariant(record.report_json.reportVersion === record.report_version, "approved_report report version does not match report_json");
  invariant(
    record.report_json.verifiedFactSetVersion === record.verified_fact_set_version,
    "approved_report fact-set version does not match report_json",
  );
  invariant(
    record.report_json.humanDiagnosis.reviewer.name === record.approved_by,
    "approved_report approver does not match report_json reviewer",
  );
  invariant(
    record.report_json.humanDiagnosis.reviewer.approved_at === record.approved_at,
    "approved_report approval timestamp does not match report_json",
  );
  return record;
}

export function validateLearningCandidateRecord(record) {
  common(record, "learning_candidate");
  uuid(record.score_case_id, "learning_candidate.score_case_id");
  uuid(record.source_review_event_id, "learning_candidate.source_review_event_id");
  invariant(
    ["extraction_rule", "checklist", "rubric", "taxonomy", "priority_heuristic", "remediation_template", "approved_example", "eval"].includes(record.candidate_type),
    "learning_candidate.candidate_type is invalid",
  );
  invariant(["proposed", "rejected", "promoted"].includes(record.state), "learning_candidate.state is invalid");
  invariant(record.deidentified === true, "learning_candidate.deidentified must be true");
  invariant(record.global_activation === false, "learning_candidate.global_activation must remain false");
  namedHuman(record.created_by, "learning_candidate.created_by");
  object(record.content, "learning_candidate.content");
  jsonValue(record.content, "learning_candidate.content");
  assertDeidentified(record.content);
  return record;
}

export function validateRuleReleaseRecord(record) {
  common(record, "rule_release");
  invariant(["approved", "retired", "rolled_back"].includes(record.state), "rule_release.state is invalid");
  invariant(record.activation_mode === "explicit_human_release", "rule_release.activation_mode must be explicit_human_release");
  string(record.release_type, "rule_release.release_type");
  string(record.scope, "rule_release.scope");
  string(record.version, "rule_release.version");
  namedHuman(record.approved_by, "rule_release.approved_by");
  string(record.changelog, "rule_release.changelog");
  timestamp(record.effective_at, "rule_release.effective_at");
  stringList(record.source_learning_candidate_ids, "rule_release.source_learning_candidate_ids", { nonEmpty: true });
  record.source_learning_candidate_ids.forEach((id, index) => uuid(id, `rule_release.source_learning_candidate_ids[${index}]`));
  object(record.validation_eval_result, "rule_release.validation_eval_result");
  invariant(record.validation_eval_result.status === "passed", "rule_release.validation_eval_result.status must be passed");
  string(record.validation_eval_result.suite, "rule_release.validation_eval_result.suite");
  string(record.validation_eval_result.result, "rule_release.validation_eval_result.result");
  timestamp(record.validation_eval_result.tested_at, "rule_release.validation_eval_result.tested_at");
  object(record.rollback, "rule_release.rollback");
  string(record.rollback.target_version, "rule_release.rollback.target_version");
  string(record.rollback.instructions, "rule_release.rollback.instructions");
  return record;
}

export function validateWorkflowRecord(record) {
  object(record, "workflow record");
  const validators = {
    score_case: validateScoreCaseRecord,
    candidate_evidence: validateCandidateEvidenceRecord,
    verified_fact_set: validateVerifiedFactSetRecord,
    draft: validateDraftRecord,
    review_event: validateReviewEventRecord,
    focus_selection: validateFocusSelectionRecord,
    approved_report: validateApprovedReportRecord,
    learning_candidate: validateLearningCandidateRecord,
    rule_release: validateRuleReleaseRecord,
  };
  invariant(Object.hasOwn(validators, record.record_type), "workflow record_type is invalid");
  return validators[record.record_type](record);
}

/**
 * Validate an explicit promotion. The function returns a new audit summary only;
 * it does not alter either record or activate model memory/fine-tuning.
 */
export function validateLearningPromotion(candidate, release) {
  validateLearningCandidateRecord(candidate);
  validateRuleReleaseRecord(release);
  invariant(candidate.state === "promoted", "learning candidate must be explicitly marked promoted");
  invariant(
    release.source_learning_candidate_ids.includes(candidate.id),
    "rule release must reference the promoted learning candidate",
  );
  invariant(release.release_type === candidate.candidate_type, "rule release type must match learning candidate type");
  return Object.freeze({
    candidate_id: candidate.id,
    release_id: release.id,
    version: release.version,
    approved_by: release.approved_by,
    activation_mode: release.activation_mode,
  });
}
