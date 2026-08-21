/**
 * The single production scoring authority for the CAESTHETIC Growth Score.
 *
 * Input uses evidence-oriented snake_case fields. Canonical weights are owned by
 * this module and can never be supplied by a caller. A metric with a draft score
 * is still unavailable until a human reviewer approves it.
 */

export const SURFACE_WEIGHTS = Object.freeze({
  search: 30,
  website: 25,
  social: 15,
  reputation: 30,
});

export const REQUIRED_SURFACES = Object.freeze(Object.keys(SURFACE_WEIGHTS));
export const CROSS_SURFACE_ID = "cross";
export const MIN_OBSERVED_WEIGHT = 70;
export const MIN_CLASS_A_RATIO = 0.8;

const metric = (weight, assessment) => Object.freeze({ weight, assessment });

/**
 * `anchored` metrics require a rubric-based human judgment. `objective` metrics
 * have deterministic raw observations. Publication is intentionally stricter:
 * both kinds require reviewer_status=approved before their normalized score is
 * final or contributes to coverage.
 */
export const CANONICAL_METRICS = Object.freeze({
  search: Object.freeze({
    map_visibility: metric(35, "objective"),
    gbp_treatment_category_completeness: metric(20, "anchored"),
    entity_integrity: metric(15, "anchored"),
    gbp_conversion_readiness: metric(15, "anchored"),
    freshness: metric(10, "objective"),
    branded_search_control: metric(5, "objective"),
  }),
  website: Object.freeze({
    booking_friction: metric(25, "anchored"),
    treatment_clarity: metric(20, "anchored"),
    mobile_performance: metric(15, "objective"),
    above_fold_conversion: metric(15, "anchored"),
    clinician_trust_proof: metric(10, "anchored"),
    mystery_shopper: metric(10, "anchored"),
    technical_booking_integrity: metric(5, "objective"),
  }),
  social: Object.freeze({
    priority_treatment_presence: metric(20, "anchored"),
    clinician_expertise: metric(20, "anchored"),
    proof_quality: metric(20, "anchored"),
    recency: metric(15, "objective"),
    profile_to_booking: metric(15, "objective"),
    local_offer_clarity: metric(10, "anchored"),
  }),
  reputation: Object.freeze({
    review_velocity_90d: metric(25, "objective"),
    rating: metric(10, "objective"),
    review_depth: metric(10, "anchored"),
    recency: metric(10, "objective"),
    response_coverage: metric(15, "objective"),
    response_speed: metric(10, "objective"),
    negative_review_handling: metric(10, "anchored"),
    treatment_clinician_proof: metric(10, "anchored"),
  }),
  cross: Object.freeze({
    treatment_presence: metric(30, "anchored"),
    positioning_coherence: metric(20, "anchored"),
    proof_continuity: metric(20, "anchored"),
    conversion_continuity: metric(20, "anchored"),
    identity_coherence: metric(10, "anchored"),
  }),
});

export const CANONICAL_METRIC_WEIGHTS = Object.freeze(Object.fromEntries(
  Object.entries(CANONICAL_METRICS).map(([surfaceId, definitions]) => [
    surfaceId,
    Object.freeze(Object.fromEntries(
      Object.entries(definitions).map(([metricId, definition]) => [metricId, definition.weight]),
    )),
  ]),
));

export const HUMAN_REVIEW_METRICS = Object.freeze(Object.fromEntries(
  Object.entries(CANONICAL_METRICS).map(([surfaceId, definitions]) => [
    surfaceId,
    Object.freeze(Object.entries(definitions)
      .filter(([, definition]) => definition.assessment === "anchored")
      .map(([metricId]) => metricId)),
  ]),
));

export const REGISTERED_HUMAN_REVIEWER_MONONYMS = Object.freeze(["Валерия"]);

const REVIEWER_STATUSES = Object.freeze(["approved", "pending", "ai_draft", "rejected"]);
const EVIDENCE_CLASSES = Object.freeze(["A", "B"]);
const PROBLEM_SURFACES = Object.freeze([...REQUIRED_SURFACES, "cross_surface"]);
const PROBLEM_STATUSES = Object.freeze(["diagnosed", "monitor", "not_actionable"]);
const NON_HUMAN_REVIEWER = /\b(?:ai|assistant|automation|automated|bot|model|system|anonymous|unknown|pending|unassigned)\b/i;

function invariant(condition, message) {
  if (!condition) throw new TypeError(message);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function nonEmptyString(value, label) {
  invariant(typeof value === "string" && value.trim(), `${label} is required`);
  return value;
}

function validDate(value, label) {
  nonEmptyString(value, label);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  invariant(dateOnly || timestamp, `${label} must be an ISO 8601 date or timestamp`);
  const calendarDate = value.slice(0, 10);
  const parsedDate = new Date(`${calendarDate}T00:00:00Z`);
  invariant(
    Number.isFinite(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === calendarDate,
    `${label} must contain a valid calendar date`,
  );
  invariant(!timestamp || Number.isFinite(Date.parse(value)), `${label} must be a valid ISO 8601 timestamp`);
}

function validTimestamp(value, label) {
  nonEmptyString(value, label);
  const calendarDate = value.slice(0, 10);
  const parsedDate = new Date(`${calendarDate}T00:00:00Z`);
  invariant(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      && Number.isFinite(Date.parse(value))
      && Number.isFinite(parsedDate.valueOf())
      && parsedDate.toISOString().slice(0, 10) === calendarDate,
    `${label} must be a valid ISO 8601 timestamp`,
  );
}

function namedHuman(value, label) {
  nonEmptyString(value, label);
  const canonicalName = value.trim().normalize("NFC");
  invariant(!NON_HUMAN_REVIEWER.test(canonicalName), `${label} must identify a named human reviewer`);
  const isRegisteredMononym = REGISTERED_HUMAN_REVIEWER_MONONYMS.includes(canonicalName);
  invariant(
    canonicalName.split(/\s+/).length >= 2 || isRegisteredMononym,
    `${label} must contain a named human's first and last name or a registered reviewer mononym`,
  );
}

function validRawValue(value, label) {
  try {
    invariant(JSON.stringify(value) !== undefined, `${label} must be a JSON value or null`);
  } catch (error) {
    if (error instanceof TypeError && error.message === `${label} must be a JSON value or null`) throw error;
    throw new TypeError(`${label} must be a JSON value or null`);
  }
}

function validateExplicitWeight(metricInput, canonicalWeight, context) {
  for (const key of ["weight", "canonical_weight"]) {
    if (!hasOwn(metricInput, key)) continue;
    invariant(
      typeof metricInput[key] === "number" && metricInput[key] === canonicalWeight,
      `${context}.${key} conflicts with canonical weight ${canonicalWeight}`,
    );
  }
}

function validateClassBDisclosure(value, context) {
  invariant(
    ["estimate", "inference"].includes(value.finding_type),
    `${context}.finding_type must explicitly be estimate or inference for Class B`,
  );
  nonEmptyString(value.method, `${context}.method`);
  invariant(
    (typeof value.assumptions === "string" && value.assumptions.trim())
      || (Array.isArray(value.assumptions) && value.assumptions.length > 0
        && value.assumptions.every((item) => typeof item === "string" && item.trim())),
    `${context}.assumptions is required for Class B`,
  );
}

function validateMetric(metricInput, definition, context) {
  invariant(metricInput && typeof metricInput === "object" && !Array.isArray(metricInput), `${context} must be an object`);
  nonEmptyString(metricInput.metric_id, `${context}.metric_id`);
  invariant(hasOwn(metricInput, "raw_value"), `${context}.raw_value is required`);
  validRawValue(metricInput.raw_value, `${context}.raw_value`);
  invariant(hasOwn(metricInput, "normalized_score"), `${context}.normalized_score is required`);
  invariant(EVIDENCE_CLASSES.includes(metricInput.evidence_class), `${context}.evidence_class must be A or B`);
  invariant(hasOwn(metricInput, "source"), `${context}.source is required`);
  invariant(hasOwn(metricInput, "collected_at"), `${context}.collected_at is required`);
  invariant(REVIEWER_STATUSES.includes(metricInput.reviewer_status), `${context}.reviewer_status is invalid`);
  validateExplicitWeight(metricInput, definition.weight, context);

  if (metricInput.normalized_score !== null) {
    invariant(
      typeof metricInput.normalized_score === "number" && Number.isFinite(metricInput.normalized_score),
      `${context}.normalized_score must be a finite number or null`,
    );
    invariant(
      metricInput.normalized_score >= 0 && metricInput.normalized_score <= 100,
      `${context}.normalized_score must be between 0 and 100`,
    );
  }

  // Raw evidence may move through pending, AI-draft, and rejected states for
  // review/audit. normalized_score is the final publication field: pre-scores
  // belong outside this schema and only approved evidence can populate it.
  const hasRawValue = metricInput.raw_value !== null;
  const hasFinalScore = metricInput.normalized_score !== null;

  if (hasRawValue) {
    nonEmptyString(metricInput.source, `${context}.source`);
    validDate(metricInput.collected_at, `${context}.collected_at`);
  } else {
    invariant(
      !hasFinalScore,
      `${context}.raw_value must not be null when normalized_score is published`,
    );
    if (metricInput.source !== null) nonEmptyString(metricInput.source, `${context}.source`);
    if (metricInput.collected_at !== null) validDate(metricInput.collected_at, `${context}.collected_at`);
  }

  if (metricInput.reviewer_status === "approved") {
    invariant(hasRawValue, `${context}.raw_value is required when reviewer_status is approved`);
    invariant(hasFinalScore, `${context}.normalized_score is required when reviewer_status is approved`);
  } else {
    invariant(
      !hasFinalScore,
      `${context}.normalized_score must be null while reviewer_status is ${metricInput.reviewer_status}`,
    );
  }

  if (metricInput.finding !== undefined) {
    nonEmptyString(metricInput.finding, `${context}.finding`);
    if (metricInput.evidence_class === "B") validateClassBDisclosure(metricInput, context);
  }

  const available = metricInput.reviewer_status === "approved" && hasRawValue && hasFinalScore;
  // Class B estimates and inferences may remain visible narrative evidence, but
  // only independently observed Class A metrics can fill coverage or a score.
  const coverageEligible = available && metricInput.evidence_class === "A";
  let availabilityReason = null;
  if (!available) {
    if (metricInput.reviewer_status === "rejected") availabilityReason = "rejected";
    else if (hasRawValue && metricInput.reviewer_status === "pending") availabilityReason = "pending_review";
    else if (hasRawValue && metricInput.reviewer_status === "ai_draft") availabilityReason = "ai_draft";
    else availabilityReason = "unavailable";
  }
  return Object.freeze({
    metric_id: metricInput.metric_id,
    canonical_weight: definition.weight,
    assessment: definition.assessment,
    available,
    coverageEligible,
    availability_reason: availabilityReason,
    normalized_score: available ? metricInput.normalized_score : null,
    evidence_class: metricInput.evidence_class,
  });
}

function scoreMetricGroup(metrics, surfaceId, context) {
  invariant(Array.isArray(metrics), `${context}.metrics must be an array`);
  const definitions = CANONICAL_METRICS[surfaceId];
  const expectedIds = Object.keys(definitions);
  invariant(metrics.length === expectedIds.length, `${context} must contain the exact canonical metric set`);

  const seen = new Set();
  const metricResults = [];
  let observedWeight = 0;
  let weightedScore = 0;

  metrics.forEach((metricInput, index) => {
    const metricId = metricInput?.metric_id;
    invariant(hasOwn(definitions, metricId), `${context} has unknown metric_id ${String(metricId)}`);
    invariant(!seen.has(metricId), `${context} has duplicate metric_id ${metricId}`);
    seen.add(metricId);
    const result = validateMetric(metricInput, definitions[metricId], `${context}.metrics[${index}]`);
    metricResults.push(result);
    if (result.coverageEligible) {
      observedWeight += result.canonical_weight;
      weightedScore += result.normalized_score * result.canonical_weight;
    }
  });
  for (const metricId of expectedIds) {
    invariant(seen.has(metricId), `${context} is missing canonical metric_id ${metricId}`);
  }

  const sufficient = observedWeight >= MIN_OBSERVED_WEIGHT;
  return Object.freeze({
    sufficient,
    status: sufficient ? "scored" : "insufficient_evidence",
    coverage: observedWeight / 100,
    observedWeight,
    rawScore: sufficient ? weightedScore / observedWeight : null,
    metricResults: Object.freeze(metricResults),
  });
}

function buildEvidenceIndex(report) {
  const index = new Map();
  for (const surface of report.surfaces) {
    for (const metricInput of surface.metrics) {
      index.set(`${surface.id}.${metricInput.metric_id}`, metricInput);
    }
  }
  for (const metricInput of report.crossSurface.metrics) {
    index.set(`${CROSS_SURFACE_ID}.${metricInput.metric_id}`, metricInput);
  }
  return index;
}

function validateEvidenceRefs(refs, context, evidenceIndex) {
  invariant(Array.isArray(refs) && refs.length > 0, `${context}.evidence_refs is required`);
  for (const ref of refs) {
    nonEmptyString(ref, `${context}.evidence_refs[]`);
    invariant(evidenceIndex.has(ref), `${context} has unknown evidence reference ${ref}`);
    const evidence = evidenceIndex.get(ref);
    invariant(
      evidence.raw_value !== null
        && evidence.normalized_score !== null
        && evidence.reviewer_status === "approved",
      `${context} references evidence that is not final and approved: ${ref}`,
    );
  }
}

function inferredEvidenceClass(refs, evidenceIndex) {
  return refs.every((ref) => evidenceIndex.get(ref).evidence_class === "A") ? "A" : "B";
}

function resolveClaimEvidenceClass(claim, context, evidenceIndex) {
  const inferredClass = inferredEvidenceClass(claim.evidence_refs, evidenceIndex);
  const evidenceClass = claim.evidence_class ?? inferredClass;
  invariant(EVIDENCE_CLASSES.includes(evidenceClass), `${context}.evidence_class must be A or B`);
  invariant(
    !(inferredClass === "B" && evidenceClass === "A"),
    `${context}.evidence_class cannot be A when an evidence reference is Class B`,
  );
  return evidenceClass;
}

function validateEvidenceBackedClaim(claim, context, evidenceIndex) {
  invariant(claim && typeof claim === "object" && !Array.isArray(claim), `${context} must be an object`);
  nonEmptyString(claim.title, `${context}.title`);
  validateEvidenceRefs(claim.evidence_refs, context, evidenceIndex);
  const evidenceClass = resolveClaimEvidenceClass(claim, context, evidenceIndex);
  if (evidenceClass === "B") validateClassBDisclosure({ ...claim, evidence_class: evidenceClass }, context);
  return evidenceClass;
}

function validatePriority(priority, context, evidenceIndex) {
  invariant(priority && typeof priority === "object" && !Array.isArray(priority), `${context} must be an object`);
  nonEmptyString(priority.id, `${context}.id`);
  nonEmptyString(priority.title, `${context}.title`);
  validateEvidenceRefs(priority.evidence_refs, context, evidenceIndex);
  nonEmptyString(priority.impact, `${context}.impact`);
  const evidenceClass = resolveClaimEvidenceClass(priority, context, evidenceIndex);
  if (evidenceClass === "B") validateClassBDisclosure({ ...priority, evidence_class: evidenceClass }, context);
  return evidenceClass;
}

function validateReferenceIds(refs, context, knownIds, { nonEmpty = false } = {}) {
  validateStringArray(refs, context, { nonEmpty });
  const seen = new Set();
  for (const ref of refs) {
    invariant(!seen.has(ref), `${context} has duplicate reference ${ref}`);
    invariant(knownIds.has(ref), `${context} has unknown reference ${ref}`);
    seen.add(ref);
  }
}

function validateSequence(sequence, context) {
  invariant(sequence && typeof sequence === "object" && !Array.isArray(sequence), `${context} must be an object`);
  invariant(Number.isInteger(sequence.order) && sequence.order > 0, `${context}.order must be a positive integer`);
  nonEmptyString(sequence.rationale, `${context}.rationale`);
}

function validateRemediationTasks(tasks, problems, evidenceIndex) {
  invariant(Array.isArray(tasks) && tasks.length > 0, "humanDiagnosis.remediation_tasks must be a non-empty array");
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const taskById = new Map();

  tasks.forEach((task, index) => {
    const context = `humanDiagnosis.remediation_tasks[${index}]`;
    invariant(task && typeof task === "object" && !Array.isArray(task), `${context} must be an object`);
    nonEmptyString(task.id, `${context}.id`);
    invariant(!taskById.has(task.id), `humanDiagnosis.remediation_tasks has duplicate id ${task.id}`);
    taskById.set(task.id, task);
    validateReferenceIds(task.problem_refs, `${context}.problem_refs`, new Set(problemById.keys()), { nonEmpty: true });
    nonEmptyString(task.outcome, `${context}.outcome`);
    validateStringArray(task.steps, `${context}.steps`, { nonEmpty: true });
    validateEvidenceRefs(task.evidence_refs, context, evidenceIndex);
    validateStringArray(task.prerequisites_access, `${context}.prerequisites_access`, { nonEmpty: true });
    invariant(Array.isArray(task.dependencies), `${context}.dependencies must be an array`);
    validateSequence(task.sequence, `${context}.sequence`);
    for (const field of [
      "owner_role",
      "effort_complexity",
      "implementation_risk",
      "horizon",
      "next_action",
    ]) nonEmptyString(task[field], `${context}.${field}`);
    validateStringArray(task.acceptance_evidence, `${context}.acceptance_evidence`, { nonEmpty: true });
  });

  const knownTaskIds = new Set(taskById.keys());
  tasks.forEach((task, index) => {
    const context = `humanDiagnosis.remediation_tasks[${index}]`;
    validateReferenceIds(task.dependencies, `${context}.dependencies`, knownTaskIds);
    invariant(!task.dependencies.includes(task.id), `${context}.dependencies must not reference itself`);
    for (const problemId of task.problem_refs) {
      invariant(
        problemById.get(problemId).task_refs.includes(task.id),
        `${context} is not referenced by problem ${problemId}.task_refs`,
      );
    }
  });

  for (const problem of problems) {
    validateReferenceIds(
      problem.task_refs,
      `humanDiagnosis.problem_inventory.${problem.id}.task_refs`,
      knownTaskIds,
      { nonEmpty: problem.status === "diagnosed" },
    );
    if (problem.task_refs.length === 0) {
      invariant(
        ["monitor", "not_actionable"].includes(problem.status),
        `humanDiagnosis.problem_inventory.${problem.id}.task_refs must not be empty for an actionable problem`,
      );
      nonEmptyString(problem.status_reason, `humanDiagnosis.problem_inventory.${problem.id}.status_reason`);
    }
    for (const taskId of problem.task_refs) {
      invariant(
        taskById.get(taskId).problem_refs.includes(problem.id),
        `humanDiagnosis.problem_inventory.${problem.id}.task_refs has no reverse problem_refs mapping in ${taskId}`,
      );
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (taskId) => {
    if (visited.has(taskId)) return;
    invariant(!visiting.has(taskId), `humanDiagnosis.remediation_tasks contains a dependency cycle at ${taskId}`);
    visiting.add(taskId);
    taskById.get(taskId).dependencies.forEach(visit);
    visiting.delete(taskId);
    visited.add(taskId);
  };
  knownTaskIds.forEach(visit);

  const orders = tasks.map((task) => task.sequence.order);
  invariant(new Set(orders).size === orders.length, "humanDiagnosis.remediation_tasks sequence.order values must be unique");
  return taskById;
}

function validateOwnerExecutionContract(report) {
  const paths = report.implementation_paths;
  invariant(paths && typeof paths === "object" && !Array.isArray(paths), "implementation_paths must be an object");
  for (const field of ["diy", "other_provider", "defer", "caesthetic"]) {
    nonEmptyString(paths[field], `implementation_paths.${field}`);
  }
  const why = report.why_caesthetic;
  invariant(why && typeof why === "object" && !Array.isArray(why), "why_caesthetic must be an object");
  for (const field of ["evidence_advantage", "coordination_advantage", "sprint_boundary", "ownership"]) {
    nonEmptyString(why[field], `why_caesthetic.${field}`);
  }
}

function validateOptionalEvidenceRefs(refs, context, evidenceIndex) {
  invariant(Array.isArray(refs), `${context}.evidence_refs must be an array`);
  if (refs.length > 0) validateEvidenceRefs(refs, context, evidenceIndex);
}

function validateCompetitiveSurfaceCell(cell, context, evidenceIndex) {
  invariant(cell && typeof cell === "object" && !Array.isArray(cell), `${context} must be an object`);
  invariant(["observed", "insufficient_evidence"].includes(cell.status), `${context}.status must be observed or insufficient_evidence`);
  nonEmptyString(cell.finding, `${context}.finding`);
  if (cell.status === "observed") {
    validateEvidenceRefs(cell.evidence_refs, context, evidenceIndex);
  } else {
    validateOptionalEvidenceRefs(cell.evidence_refs, context, evidenceIndex);
    nonEmptyString(cell.limitation, `${context}.limitation`);
  }
}

function validateReviewThemes(themes, context, evidenceIndex, limitations) {
  invariant(Array.isArray(themes), `${context} must be an array`);
  if (themes.length === 0) {
    invariant(/insufficient (?:repetition|evidence)/i.test(limitations), `${context} may be empty only when limitations state insufficient repetition`);
    return;
  }
  themes.forEach((theme, index) => {
    const itemContext = `${context}[${index}]`;
    invariant(theme && typeof theme === "object" && !Array.isArray(theme), `${itemContext} must be an object`);
    nonEmptyString(theme.theme, `${itemContext}.theme`);
    invariant(Number.isInteger(theme.mentions) && theme.mentions >= 2, `${itemContext}.mentions must be an integer of at least 2`);
    invariant(Number.isInteger(theme.sample_size) && theme.sample_size >= theme.mentions, `${itemContext}.sample_size must be at least mentions`);
    nonEmptyString(theme.window, `${itemContext}.window`);
    validateEvidenceRefs(theme.evidence_refs, itemContext, evidenceIndex);
  });
}

function validateDecisionItems(items, context, evidenceIndex) {
  invariant(Array.isArray(items) && items.length > 0, `${context} must be a non-empty array`);
  items.forEach((item, index) => {
    const itemContext = `${context}[${index}]`;
    invariant(item && typeof item === "object" && !Array.isArray(item), `${itemContext} must be an object`);
    nonEmptyString(item.title, `${itemContext}.title`);
    nonEmptyString(item.rationale, `${itemContext}.rationale`);
    validateEvidenceRefs(item.evidence_refs, itemContext, evidenceIndex);
  });
}

function validateMarketPracticeGap(gap, context, evidenceIndex) {
  invariant(gap && typeof gap === "object" && !Array.isArray(gap), `${context} must be an object`);
  invariant(["applicable", "no_material_gap", "insufficient_evidence"].includes(gap.status), `${context}.status is invalid`);
  nonEmptyString(gap.reason, `${context}.reason`);
  invariant(Array.isArray(gap.recommendations), `${context}.recommendations must be an array`);
  if (gap.status === "applicable") {
    invariant(gap.recommendations.length > 0, `${context}.recommendations must not be empty when applicable`);
  } else {
    invariant(gap.recommendations.length === 0, `${context}.recommendations must be empty unless applicable`);
  }
  gap.recommendations.forEach((item, index) => {
    const itemContext = `${context}.recommendations[${index}]`;
    invariant(item && typeof item === "object" && !Array.isArray(item), `${itemContext} must be an object`);
    for (const field of [
      "title", "current_state", "market_shift", "evidence_scope", "business_implication",
      "transition_economics", "specialist_validation", "limitations",
    ]) nonEmptyString(item[field], `${itemContext}.${field}`);
    validateStringArray(item.dependencies, `${itemContext}.dependencies`, { nonEmpty: true });
    invariant(["keep", "evaluate", "pilot", "replace", "do_not_adopt"].includes(item.decision), `${itemContext}.decision is invalid`);
    validateEvidenceRefs(item.evidence_refs, itemContext, evidenceIndex);
  });
}

function validateCompetitiveDecisionAnalysis(competitors, report, evidenceIndex) {
  invariant(competitors && typeof competitors === "object" && !Array.isArray(competitors), "humanDiagnosis.competitors must be an object");
  invariant(["applicable", "not_applicable"].includes(competitors.status), "humanDiagnosis.competitors.status must be applicable or not_applicable");
  if (competitors.status === "not_applicable") {
    nonEmptyString(competitors.reason, "humanDiagnosis.competitors.reason");
    return;
  }

  const base = "humanDiagnosis.competitors";
  nonEmptyString(competitors.selection_method, `${base}.selection_method`);
  nonEmptyString(competitors.sample_limitations, `${base}.sample_limitations`);
  nonEmptyString(competitors.review_sample_rule, `${base}.review_sample_rule`);
  nonEmptyString(competitors.branch_scope, `${base}.branch_scope`);
  invariant(competitors.comparison_window && typeof competitors.comparison_window === "object" && !Array.isArray(competitors.comparison_window), `${base}.comparison_window must be an object`);
  validDate(competitors.comparison_window.start, `${base}.comparison_window.start`);
  validDate(competitors.comparison_window.end, `${base}.comparison_window.end`);
  invariant(Date.parse(competitors.comparison_window.start) <= Date.parse(competitors.comparison_window.end), `${base}.comparison_window start must not be after end`);
  invariant(Array.isArray(competitors.entries) && competitors.entries.length > 0, `${base}.entries must contain named competitors when applicable`);

  const competitorIds = new Set();
  competitors.entries.forEach((competitor, index) => {
    const context = `${base}.entries[${index}]`;
    invariant(competitor && typeof competitor === "object" && !Array.isArray(competitor), `${context} must be an object`);
    nonEmptyString(competitor.id, `${context}.id`);
    invariant(!competitorIds.has(competitor.id), `${base}.entries has duplicate id ${competitor.id}`);
    competitorIds.add(competitor.id);
    nonEmptyString(competitor.name, `${context}.name`);
    invariant(["local", "category_leader", "positioning_reference", "other"].includes(competitor.competitor_type), `${context}.competitor_type is invalid`);
    for (const field of [
      "selection_reason", "branch_scope", "patient_choice_reason", "observable_advantage", "observable_gap",
      "repeat", "improve", "do_not_copy", "strategic_implication", "constraint_effect", "priority_effect",
      "modernization_implication", "limitations",
    ]) nonEmptyString(competitor[field], `${context}.${field}`);
    validateStringArray(competitor.strengths, `${context}.strengths`, { nonEmpty: true });
    validateStringArray(competitor.weaknesses_or_risks, `${context}.weaknesses_or_risks`, { nonEmpty: true });
    invariant(Array.isArray(competitor.sources) && competitor.sources.length > 0, `${context}.sources must be a non-empty array`);
    competitor.sources.forEach((source, sourceIndex) => {
      const sourceContext = `${context}.sources[${sourceIndex}]`;
      invariant(source && typeof source === "object" && !Array.isArray(source), `${sourceContext} must be an object`);
      nonEmptyString(source.url_or_snapshot, `${sourceContext}.url_or_snapshot`);
      invariant(["maps", "website", "social", "review_platform", "directory", "public_ad"].includes(source.source_type), `${sourceContext}.source_type is invalid`);
      validDate(source.collected_at, `${sourceContext}.collected_at`);
      nonEmptyString(source.sample_note, `${sourceContext}.sample_note`);
    });
    invariant(competitor.surface_evidence && typeof competitor.surface_evidence === "object" && !Array.isArray(competitor.surface_evidence), `${context}.surface_evidence must be an object`);
    REQUIRED_SURFACES.forEach((surface) => validateCompetitiveSurfaceCell(competitor.surface_evidence[surface], `${context}.surface_evidence.${surface}`, evidenceIndex));
    validateReviewThemes(competitor.repeated_positive_themes, `${context}.repeated_positive_themes`, evidenceIndex, competitor.limitations);
    validateReviewThemes(competitor.repeated_negative_themes, `${context}.repeated_negative_themes`, evidenceIndex, competitor.limitations);
    validateEvidenceRefs(competitor.evidence_refs, context, evidenceIndex);
  });

  const matrix = competitors.comparison_matrix;
  invariant(matrix && typeof matrix === "object" && !Array.isArray(matrix), `${base}.comparison_matrix must be an object`);
  nonEmptyString(matrix.subject_name, `${base}.comparison_matrix.subject_name`);
  invariant(matrix.subject_name === report.practice.name, `${base}.comparison_matrix.subject_name must match practice.name`);
  invariant(Array.isArray(matrix.rows) && matrix.rows.length === competitorIds.size + 1, `${base}.comparison_matrix.rows must contain the practice and every competitor exactly once`);
  const matrixRefs = new Set();
  matrix.rows.forEach((row, index) => {
    const context = `${base}.comparison_matrix.rows[${index}]`;
    invariant(row && typeof row === "object" && !Array.isArray(row), `${context} must be an object`);
    nonEmptyString(row.entity_ref, `${context}.entity_ref`);
    invariant(!matrixRefs.has(row.entity_ref), `${base}.comparison_matrix.rows has duplicate entity_ref ${row.entity_ref}`);
    matrixRefs.add(row.entity_ref);
    nonEmptyString(row.entity_name, `${context}.entity_name`);
    invariant(["subject", "competitor"].includes(row.entity_type), `${context}.entity_type is invalid`);
    REQUIRED_SURFACES.forEach((surface) => nonEmptyString(row[surface], `${context}.${surface}`));
    validateEvidenceRefs(row.evidence_refs, context, evidenceIndex);
  });
  invariant(matrixRefs.has("subject"), `${base}.comparison_matrix.rows must contain entity_ref subject`);
  competitorIds.forEach((id) => invariant(matrixRefs.has(id), `${base}.comparison_matrix.rows is missing competitor ${id}`));

  const summary = competitors.decision_summary;
  invariant(summary && typeof summary === "object" && !Array.isArray(summary), `${base}.decision_summary must be an object`);
  for (const field of ["defend", "close", "differentiate", "do_not_copy"]) validateDecisionItems(summary[field], `${base}.decision_summary.${field}`, evidenceIndex);
  validateMarketPracticeGap(competitors.market_practice_gap, `${base}.market_practice_gap`, evidenceIndex);
}

function validateHumanDiagnosis(report, evidenceIndex) {
  const diagnosis = report.humanDiagnosis;
  invariant(diagnosis && typeof diagnosis === "object" && !Array.isArray(diagnosis), "humanDiagnosis is required");
  invariant(diagnosis.reviewer_status === "approved", "humanDiagnosis.reviewer_status must be approved");
  invariant(
    diagnosis.reviewer && typeof diagnosis.reviewer === "object" && !Array.isArray(diagnosis.reviewer),
    "humanDiagnosis.reviewer is required",
  );
  namedHuman(diagnosis.reviewer.name, "humanDiagnosis.reviewer.name");
  validTimestamp(diagnosis.reviewer.approved_at, "humanDiagnosis.reviewer.approved_at");

  const objectiveClass = validateEvidenceBackedClaim(
    diagnosis.objective_strength,
    "humanDiagnosis.objective_strength",
    evidenceIndex,
  );
  invariant(
    REQUIRED_SURFACES.includes(diagnosis.strongest_surface),
    "humanDiagnosis.strongest_surface must be a Four-Surface id",
  );
  const bindingClass = validateEvidenceBackedClaim(
    diagnosis.binding_constraint,
    "humanDiagnosis.binding_constraint",
    evidenceIndex,
  );
  validateCompetitiveDecisionAnalysis(diagnosis.competitors, report, evidenceIndex);

  invariant(
    diagnosis.walkthrough && typeof diagnosis.walkthrough === "object" && !Array.isArray(diagnosis.walkthrough),
    "humanDiagnosis.walkthrough must be an object",
  );
  invariant(
    ["available", "pending"].includes(diagnosis.walkthrough.status),
    "humanDiagnosis.walkthrough.status must be available or pending",
  );
  if (diagnosis.walkthrough.status === "available") {
    nonEmptyString(diagnosis.walkthrough.url, "humanDiagnosis.walkthrough.url");
    invariant(URL.canParse(diagnosis.walkthrough.url), "humanDiagnosis.walkthrough.url must be a valid URL");
  } else {
    invariant(
      diagnosis.walkthrough.url === null || diagnosis.walkthrough.url === undefined,
      "humanDiagnosis.walkthrough.url must be null while pending",
    );
    nonEmptyString(diagnosis.walkthrough.placeholder, "humanDiagnosis.walkthrough.placeholder");
  }

  invariant(
    Array.isArray(diagnosis.problem_inventory) && diagnosis.problem_inventory.length > 0,
    "humanDiagnosis.problem_inventory must be a non-empty array",
  );
  const problemIds = new Set();
  const problems = diagnosis.problem_inventory;
  const problemClasses = problems.map((problem, index) => {
    const context = `humanDiagnosis.problem_inventory[${index}]`;
    invariant(problem && typeof problem === "object" && !Array.isArray(problem), `${context} must be an object`);
    nonEmptyString(problem.id, `${context}.id`);
    invariant(!problemIds.has(problem.id), `humanDiagnosis.problem_inventory has duplicate id ${problem.id}`);
    problemIds.add(problem.id);
    invariant(PROBLEM_SURFACES.includes(problem.surface), `${context}.surface is invalid`);
    nonEmptyString(problem.title, `${context}.title`);
    validateEvidenceRefs(problem.evidence_refs, context, evidenceIndex);
    nonEmptyString(problem.impact, `${context}.impact`);
    invariant(Array.isArray(problem.task_refs), `${context}.task_refs must be an array`);
    nonEmptyString(problem.suggested_horizon, `${context}.suggested_horizon`);
    invariant(PROBLEM_STATUSES.includes(problem.status), `${context}.status is invalid`);
    const evidenceClass = resolveClaimEvidenceClass(problem, context, evidenceIndex);
    if (evidenceClass === "B") validateClassBDisclosure({ ...problem, evidence_class: evidenceClass }, context);
    return evidenceClass;
  });

  validateRemediationTasks(diagnosis.remediation_tasks, problems, evidenceIndex);

  invariant(
    Array.isArray(diagnosis.top_priorities) && diagnosis.top_priorities.length === 3,
    "humanDiagnosis.top_priorities must contain exactly 3 items",
  );
  const priorityIds = new Set();
  const priorityClasses = diagnosis.top_priorities.map((priority, index) => {
    const context = `humanDiagnosis.top_priorities[${index}]`;
    const evidenceClass = validatePriority(priority, context, evidenceIndex);
    invariant(!priorityIds.has(priority.id), `humanDiagnosis.top_priorities has duplicate id ${priority.id}`);
    priorityIds.add(priority.id);
    validateReferenceIds(priority.problem_refs, `${context}.problem_refs`, problemIds, { nonEmpty: true });
    return evidenceClass;
  });
  const doNotDoClass = validateEvidenceBackedClaim(
    diagnosis.do_not_do,
    "humanDiagnosis.do_not_do",
    evidenceIndex,
  );

  return { objectiveClass, bindingClass, priorityClasses, doNotDoClass, problemClasses };
}

function validateEstimates(estimates) {
  invariant(Array.isArray(estimates), "estimates must be an array");
  return estimates.map((estimate, index) => {
    const context = `estimates[${index}]`;
    invariant(estimate && typeof estimate === "object" && !Array.isArray(estimate), `${context} must be an object`);
    invariant(estimate.evidence_class === "B", `${context}.evidence_class must be B`);
    nonEmptyString(estimate.title, `${context}.title`);
    validateClassBDisclosure(estimate, context);
    return "B";
  });
}

function validateStringArray(value, context, { nonEmpty = false } = {}) {
  invariant(Array.isArray(value), `${context} must be an array`);
  invariant(!nonEmpty || value.length > 0, `${context} must not be empty`);
  value.forEach((item, index) => nonEmptyString(item, `${context}[${index}]`));
}

/**
 * Validate the optional Growth Economics publication contract. Scoring stays in
 * this module; calculation stays in growth-economics-engine.mjs and is passed to
 * resolveGrowthEconomics as data, keeping the browser-safe authority pure.
 */
export function validateGrowthEconomicsContract(economics) {
  invariant(economics && typeof economics === "object" && !Array.isArray(economics), "report.economics must be an object");
  invariant(["aesthetics", "dental"].includes(economics.vertical), "report.economics.vertical must be aesthetics or dental");
  invariant(economics.input && typeof economics.input === "object" && !Array.isArray(economics.input), "report.economics.input must be an object");
  invariant(
    economics.verification && typeof economics.verification === "object" && !Array.isArray(economics.verification),
    "report.economics.verification must be an object",
  );
  for (const field of ["frozen_price_book", "completed_services", "attribution_evidence", "variable_costs", "human_verified"]) {
    invariant(typeof economics.verification[field] === "boolean", `report.economics.verification.${field} must be a boolean`);
  }
  validateStringArray(economics.verification.sources, "report.economics.verification.sources");
  if (economics.verification.human_verified) {
    validDate(economics.verification.verified_at, "report.economics.verification.verified_at");
    invariant(
      economics.verification.sources.length > 0,
      "report.economics.verification.sources must not be empty when human_verified is true",
    );
  }

  invariant(
    economics.assumptions && typeof economics.assumptions === "object" && !Array.isArray(economics.assumptions),
    "report.economics.assumptions must be an object",
  );
  validateStringArray(economics.assumptions.growth_budget, "report.economics.assumptions.growth_budget");
  validateStringArray(economics.assumptions.performance, "report.economics.assumptions.performance");

  const opportunity = economics.modeled_opportunity;
  invariant(opportunity && typeof opportunity === "object" && !Array.isArray(opportunity), "report.economics.modeled_opportunity must be an object");
  invariant(opportunity.evidence_class === "B", "report.economics.modeled_opportunity.evidence_class must be B");
  invariant(
    ["estimate", "insufficient_data"].includes(opportunity.status),
    "report.economics.modeled_opportunity.status must be estimate or insufficient_data",
  );
  for (const field of ["label", "currency", "data_quality", "method"]) {
    nonEmptyString(opportunity[field], `report.economics.modeled_opportunity.${field}`);
  }
  validateStringArray(
    opportunity.assumptions,
    "report.economics.modeled_opportunity.assumptions",
    { nonEmpty: opportunity.status === "estimate" },
  );
  if (opportunity.status === "estimate") {
    for (const field of ["low", "high"]) {
      invariant(
        typeof opportunity[field] === "number" && Number.isFinite(opportunity[field]) && opportunity[field] >= 0,
        `report.economics.modeled_opportunity.${field} must be a non-negative finite number`,
      );
    }
    invariant(
      opportunity.high >= opportunity.low,
      "report.economics.modeled_opportunity.high must be greater than or equal to low",
    );
  } else {
    validateStringArray(opportunity.missing, "report.economics.modeled_opportunity.missing", { nonEmpty: true });
  }
  return economics;
}

function validatePublishedEvidence(report, diagnosisClasses) {
  const classes = [];
  for (const surface of report.surfaces) {
    for (const metricInput of surface.metrics) {
      if (
        typeof metricInput.finding === "string"
        && metricInput.finding.trim()
        && metricInput.raw_value !== null
        && metricInput.normalized_score !== null
        && metricInput.reviewer_status === "approved"
      ) classes.push(metricInput.evidence_class);
    }
  }
  for (const metricInput of report.crossSurface.metrics) {
    if (
      typeof metricInput.finding === "string"
      && metricInput.finding.trim()
      && metricInput.raw_value !== null
      && metricInput.normalized_score !== null
      && metricInput.reviewer_status === "approved"
    ) classes.push(metricInput.evidence_class);
  }
  classes.push(
    diagnosisClasses.objectiveClass,
    diagnosisClasses.bindingClass,
    ...diagnosisClasses.priorityClasses,
    diagnosisClasses.doNotDoClass,
    ...diagnosisClasses.problemClasses,
  );
  classes.push(...validateEstimates(report.estimates));

  invariant(classes.length > 0, "at least one published finding is required");
  const classACount = classes.filter((evidenceClass) => evidenceClass === "A").length;
  const classARatio = classACount / classes.length;
  invariant(
    classARatio + Number.EPSILON >= MIN_CLASS_A_RATIO,
    `Class A published finding ratio ${(classARatio * 100).toFixed(1)}% is below required 80%`,
  );
  return Object.freeze({
    classACount,
    publishedFindingCount: classes.length,
    classARatio,
  });
}

function validateMethodology(methodology) {
  invariant(methodology && typeof methodology === "object" && !Array.isArray(methodology), "methodology must be an object");
  validateStringArray(methodology.sources, "methodology.sources", { nonEmpty: true });
  validDate(methodology.collectedAt, "methodology.collectedAt");
  nonEmptyString(methodology.competitorSelection, "methodology.competitorSelection");
  nonEmptyString(methodology.limitations, "methodology.limitations");
}

export function scoreGrowthReport(report) {
  invariant(report && typeof report === "object" && !Array.isArray(report), "report must be an object");
  invariant(report.schemaVersion === 4, "schemaVersion must be 4");
  invariant(report.reportState === "approved_report", "reportState must be approved_report; drafts cannot publish");
  nonEmptyString(report.reportVersion, "reportVersion");
  nonEmptyString(report.verifiedFactSetVersion, "verifiedFactSetVersion");
  invariant(["demo", "real"].includes(report.reportKind), "reportKind must be demo or real");
  if (report.reportKind === "demo") nonEmptyString(report.disclosure, "disclosure");
  validateMethodology(report.methodology);
  if (hasOwn(report, "economics")) validateGrowthEconomicsContract(report.economics);
  invariant(Array.isArray(report.surfaces), "surfaces must be an array");
  invariant(report.surfaces.length === REQUIRED_SURFACES.length, "report must contain exactly four surfaces");

  const seen = new Set();
  const surfaces = {};
  for (const surface of report.surfaces) {
    invariant(surface && typeof surface === "object" && !Array.isArray(surface), "each surface must be an object");
    invariant(REQUIRED_SURFACES.includes(surface.id), `Unknown surface: ${String(surface.id)}`);
    invariant(!seen.has(surface.id), `Duplicate surface: ${surface.id}`);
    seen.add(surface.id);
    surfaces[surface.id] = Object.freeze({
      id: surface.id,
      outerWeight: SURFACE_WEIGHTS[surface.id],
      ...scoreMetricGroup(surface.metrics, surface.id, `surface.${surface.id}`),
    });
  }
  invariant(REQUIRED_SURFACES.every((id) => seen.has(id)), "report is missing a required surface");

  invariant(report.crossSurface && typeof report.crossSurface === "object", "crossSurface is required");
  const crossSurface = scoreMetricGroup(report.crossSurface.metrics, CROSS_SURFACE_ID, "crossSurface");
  const evidenceIndex = buildEvidenceIndex(report);
  const diagnosisClasses = validateHumanDiagnosis(report, evidenceIndex);
  validateOwnerExecutionContract(report);
  const evidence = validatePublishedEvidence(report, diagnosisClasses);

  const allSufficient = REQUIRED_SURFACES.every((id) => surfaces[id].sufficient);
  const overallRaw = allSufficient
    ? REQUIRED_SURFACES.reduce(
      (total, id) => total + surfaces[id].rawScore * SURFACE_WEIGHTS[id] / 100,
      0,
    )
    : null;

  return Object.freeze({
    surfaces: Object.freeze(surfaces),
    crossSurface,
    overall: Object.freeze({
      sufficient: allSufficient,
      status: allSufficient ? "scored" : "insufficient_evidence",
      rawScore: overallRaw,
    }),
    evidence,
  });
}

// Renderer/CLI imports should use the same fail-closed production authority.
export const validateGrowthScoreReport = scoreGrowthReport;

/**
 * Apply the evidence/publication contract to a calculated Growth Economics
 * result. This does not calculate or alter Growth Score values.
 */
export function resolveGrowthEconomics(report, calculatedEconomics) {
  scoreGrowthReport(report);
  invariant(hasOwn(report, "economics"), "report.economics is required to resolve Growth Economics");
  invariant(
    calculatedEconomics && typeof calculatedEconomics === "object" && !Array.isArray(calculatedEconomics),
    "calculatedEconomics must be an object",
  );
  const contract = report.economics;
  const verification = contract.verification;
  const requiredChecks = [
    ["frozen price book", verification.frozen_price_book],
    ["completed services", verification.completed_services],
    ["attribution evidence", verification.attribution_evidence],
    ["variable costs", verification.variable_costs],
    ["human verification", verification.human_verified],
  ];
  const verificationMissing = requiredChecks.filter(([, complete]) => !complete).map(([label]) => label);
  const attributionInputMissing = (calculatedEconomics.missing || []).filter((field) => (
    field === "treatments" || field.startsWith("priceBook")
  ));
  const budgetInputMissing = (calculatedEconomics.missing || []).filter(
    (field) => field === "commercialSchedule" || field.startsWith("commercialSchedule."),
  );
  const attributionReady = verificationMissing.length === 0
    && calculatedEconomics.attribution?.status === "complete";
  const growthBudget = calculatedEconomics.growthBudget || {};
  const opportunity = contract.modeled_opportunity;

  return Object.freeze({
    status: calculatedEconomics.status,
    currency: calculatedEconomics.currency,
    disclosures: calculatedEconomics.disclosures,
    attribution: Object.freeze({
      ...calculatedEconomics.attribution,
      status: attributionReady ? "complete" : "insufficient_data",
      evidenceClass: attributionReady ? "A" : null,
      missing: attributionReady
        ? []
        : [...new Set([...verificationMissing, ...attributionInputMissing])],
      verifiedAt: attributionReady ? verification.verified_at : null,
      sources: attributionReady ? verification.sources : [],
    }),
    growthBudget: Object.freeze({
      ...growthBudget,
      evidenceClass: "B",
      dataQuality: calculatedEconomics.dataQuality,
      assumptions: contract.assumptions.growth_budget,
      missing: growthBudget.status === "complete" ? [] : budgetInputMissing,
    }),
    opportunity: Object.freeze({
      status: opportunity.status,
      evidenceClass: "B",
      label: opportunity.label,
      low: opportunity.status === "estimate" ? opportunity.low : null,
      high: opportunity.status === "estimate" ? opportunity.high : null,
      currency: opportunity.currency,
      dataQuality: opportunity.data_quality,
      method: opportunity.method,
      assumptions: opportunity.assumptions,
      missing: opportunity.status === "insufficient_data" ? opportunity.missing : [],
    }),
    performance: Object.freeze({
      ...calculatedEconomics.performance,
      evidenceClass: "B",
      dataQuality: calculatedEconomics.dataQuality,
      assumptions: contract.assumptions.performance,
    }),
  });
}

export function displayScore(value) {
  return value === null ? "Insufficient evidence" : `${Math.round(value)}/100`;
}
