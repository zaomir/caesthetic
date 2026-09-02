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
 * have deterministic raw observations. Approved evidence may remain unscored;
 * only an approved metric with a normalized score contributes to coverage.
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

export const REGISTERED_HUMAN_REVIEWER_MONONYMS = Object.freeze(["Валерия", "Амир"]);
export const GROWTH_SCORE_SCHEMA_VERSION = 5;
export const GROWTH_SCORE_REPORT_TEMPLATE_VERSION = "growth-score-report-template/5.2.0";
export const GROWTH_SCORE_VERTICAL_CONTEXTS = Object.freeze([
  "aesthetic_practice",
  "dental_practice",
  "beauty_salon",
]);
export const GROWTH_SCORE_REPORT_LOCALES = Object.freeze(["en", "ru", "es", "fr", "uk"]);
export const JOURNEY_GRAPH_ARTIFACT_VERSION = "cross-surface-journey-graph/1.0.0";
export const JOURNEY_GRAPH_EDGE_STATUSES = Object.freeze(["clean", "friction", "broken", "not_assessed"]);
export const JOURNEY_GRAPH_CONTEXT_DIMENSIONS = Object.freeze([
  "identity",
  "location",
  "treatment",
  "offer",
  "proof",
]);
export const JOURNEY_GRAPH_METRIC_REFS = Object.freeze([
  "search.gbp_conversion_readiness",
  "search.entity_integrity",
  "website.booking_friction",
  "website.technical_booking_integrity",
  "social.profile_to_booking",
  "cross.conversion_continuity",
  "cross.identity_coherence",
  "cross.positioning_coherence",
  "cross.proof_continuity",
]);
export const VERTICAL_CONTEXTS = GROWTH_SCORE_VERTICAL_CONTEXTS;
export const REPORT_LOCALES = GROWTH_SCORE_REPORT_LOCALES;
export const GROWTH_SCORE_VERTICAL_SOURCES = Object.freeze([
  "owner_intake",
  "route",
  "referral_context",
  "human_resolved",
  "public_evidence",
]);
export const GROWTH_SCORE_LOCALE_SOURCES = Object.freeze([
  "user_selected",
  "route",
  "campaign",
  "human_resolved",
]);
export const DIAGNOSIS_STATES = Object.freeze([
  "working",
  "verified_gap",
  "monitor",
  "insufficient_evidence",
]);
export const SPRINT_FIT_MODES = Object.freeze([
  "close_in_30_days",
  "start_in_30_days",
  "backlog",
]);
export const JOURNEY_STAGES = Object.freeze([
  "discovery",
  "trust",
  "enquiry",
  "booking",
  "treatment",
]);
export const FOCUS_SELECTION_COUNT = 3;
export const FOCUS_SELECTION_MIN = FOCUS_SELECTION_COUNT;
export const FOCUS_SELECTION_MAX = FOCUS_SELECTION_COUNT;
export const MIN_CLOSE_IN_30_DAYS = 2;
export const MAX_START_IN_30_DAYS = 1;

const REVIEWER_STATUSES = Object.freeze(["approved", "pending", "ai_draft", "rejected"]);
const EVIDENCE_CLASSES = Object.freeze(["A", "B"]);
const GAP_SURFACES = Object.freeze([...REQUIRED_SURFACES, "cross_surface"]);
const JOURNEY_GRAPH_SURFACES = Object.freeze([...REQUIRED_SURFACES]);
const JOURNEY_GRAPH_NODE_KINDS = Object.freeze(["public_asset", "lead_intake"]);
const JOURNEY_GRAPH_OWNERSHIP = Object.freeze(["owned", "third_party", "unknown", "not_applicable"]);
const JOURNEY_GRAPH_OBSERVABILITY = Object.freeze(["observed", "not_assessed"]);
const JOURNEY_GRAPH_EXPECTATIONS = Object.freeze(["required", "conditional", "optional", "observed"]);
const JOURNEY_GRAPH_ACTION_TYPES = Object.freeze([
  "link",
  "book",
  "appointment",
  "call",
  "message",
  "form",
  "native_navigation",
  "other",
]);
const JOURNEY_GRAPH_JOURNEY_KINDS = Object.freeze(["strongest", "primary_constraint", "supporting"]);
const NON_HUMAN_REVIEWER = /\b(?:ai|assistant|automation|automated|bot|model|system|anonymous|unknown|pending|unassigned)\b/i;

export class EvidenceIncompleteError extends TypeError {
  constructor(message = "evidence_incomplete: fewer than 3 verified gaps; missing gaps must not be invented") {
    super(message);
    this.name = "EvidenceIncompleteError";
    this.code = "evidence_incomplete";
  }
}

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

export function isNamedHumanReviewer(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const canonicalName = value.trim().normalize("NFC");
  if (NON_HUMAN_REVIEWER.test(canonicalName)) return false;
  return canonicalName.split(/\s+/).length >= 2
    || REGISTERED_HUMAN_REVIEWER_MONONYMS.includes(canonicalName);
}

function namedHuman(value, label) {
  nonEmptyString(value, label);
  invariant(isNamedHumanReviewer(value), `${label} must contain a named human's first and last name or a registered reviewer mononym`);
}

export function selectedFocusGapIds(focus) {
  if (!focus || typeof focus !== "object" || Array.isArray(focus)) return [];
  return [focus.primary_gap_id, ...(Array.isArray(focus.supporting_gap_ids) ? focus.supporting_gap_ids : [])]
    .filter((id) => typeof id === "string" && id.trim());
}

export function isSelectedForRepair(gapId, focus) {
  return selectedFocusGapIds(focus).includes(gapId);
}

export function assessGapInventory(report) {
  const gaps = report?.humanDiagnosis?.gap_inventory;
  const verified = Array.isArray(gaps)
    ? gaps.filter((gap) => gap?.diagnosis_state === "verified_gap")
    : [];
  if (verified.length < FOCUS_SELECTION_MIN) {
    return Object.freeze({
      status: "evidence_incomplete",
      verified_count: verified.length,
      selected_count: selectedFocusGapIds(report?.humanDiagnosis?.focus_selection).length,
    });
  }
  const selected = selectedFocusGapIds(report?.humanDiagnosis?.focus_selection);
  return Object.freeze({
    status: selected.length ? "focus_selected" : "ready_for_focus_selection",
    verified_count: verified.length,
    selected_count: selected.length,
  });
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
  if (hasOwn(metricInput, "original_text")) {
    nonEmptyString(metricInput.original_text, `${context}.original_text`);
    nonEmptyString(metricInput.source_language, `${context}.source_language`);
  }
  if (hasOwn(metricInput, "translated_text")) {
    nonEmptyString(metricInput.translated_text, `${context}.translated_text`);
    nonEmptyString(metricInput.original_text, `${context}.original_text`);
    nonEmptyString(metricInput.source_language, `${context}.source_language`);
    nonEmptyString(metricInput.translation_note, `${context}.translation_note`);
  }

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
    if (metricInput.reviewer_status === "approved" && hasRawValue && !hasFinalScore) availabilityReason = "approved_unscored";
    else if (metricInput.reviewer_status === "rejected") availabilityReason = "rejected";
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

function validateJourneyGraphEvidenceRefs(refs, context, evidenceById, { nonEmpty = false } = {}) {
  invariant(Array.isArray(refs), `${context}.evidence_refs must be an array`);
  if (nonEmpty) invariant(refs.length > 0, `${context}.evidence_refs must not be empty`);
  for (const ref of refs) {
    nonEmptyString(ref, `${context}.evidence_refs[]`);
    invariant(evidenceById.has(ref), `${context} has unknown journey-graph evidence reference ${ref}`);
    invariant(
      evidenceById.get(ref).reviewer_status === "approved",
      `${context} references journey-graph evidence that is not approved: ${ref}`,
    );
  }
}

function validateJourneyGraphIntegrity(value, context, { withDimensions = false } = {}) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${context} must be an object`);
  invariant(JOURNEY_GRAPH_EDGE_STATUSES.includes(value.status), `${context}.status is invalid`);
  nonEmptyString(value.observed_behavior, `${context}.observed_behavior`);
  if (withDimensions) {
    invariant(value.dimensions && typeof value.dimensions === "object" && !Array.isArray(value.dimensions), `${context}.dimensions must be an object`);
    for (const dimension of JOURNEY_GRAPH_CONTEXT_DIMENSIONS) {
      invariant(
        JOURNEY_GRAPH_EDGE_STATUSES.includes(value.dimensions[dimension]),
        `${context}.dimensions.${dimension} is invalid`,
      );
    }
  }
}

function graphPathExists(
  startId,
  targetId,
  outgoing,
  allowedStatuses,
  maxHops,
  blockedFirstEdgeId = null,
  { allowUnknownExistence = false } = {},
) {
  const queue = [{ nodeId: startId, edgeIds: [] }];
  const bestDepth = new Map([[startId, 0]]);
  while (queue.length) {
    const current = queue.shift();
    if (current.nodeId === targetId && current.edgeIds.length > 0) return current.edgeIds;
    if (current.edgeIds.length >= maxHops) continue;
    for (const edge of outgoing.get(current.nodeId) || []) {
      if (edge.id === blockedFirstEdgeId && current.edgeIds.length === 0) continue;
      const traversableExistence = edge.exists === true || (allowUnknownExistence && edge.exists === null);
      if (!traversableExistence || !allowedStatuses.has(edge.status)) continue;
      const nextDepth = current.edgeIds.length + 1;
      if ((bestDepth.get(edge.to) ?? Infinity) < nextDepth) continue;
      bestDepth.set(edge.to, nextDepth);
      queue.push({ nodeId: edge.to, edgeIds: [...current.edgeIds, edge.id] });
    }
  }
  return null;
}

function journeyGraphLoops(nodes, outgoing) {
  let index = 0;
  const stack = [];
  const onStack = new Set();
  const indexes = new Map();
  const lowLinks = new Map();
  const components = [];

  const visit = (nodeId) => {
    indexes.set(nodeId, index);
    lowLinks.set(nodeId, index);
    index += 1;
    stack.push(nodeId);
    onStack.add(nodeId);
    for (const edge of outgoing.get(nodeId) || []) {
      if (edge.exists !== true || !["clean", "friction"].includes(edge.status)) continue;
      if (!indexes.has(edge.to)) {
        visit(edge.to);
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId), lowLinks.get(edge.to)));
      } else if (onStack.has(edge.to)) {
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId), indexes.get(edge.to)));
      }
    }
    if (lowLinks.get(nodeId) !== indexes.get(nodeId)) return;
    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== nodeId);
    const selfLoop = (outgoing.get(nodeId) || []).some((edge) => edge.to === nodeId && edge.exists === true && ["clean", "friction"].includes(edge.status));
    if (component.length > 1 || selfLoop) components.push(component.sort());
  };

  nodes.forEach((node) => {
    if (!indexes.has(node.id)) visit(node.id);
  });
  return components.sort((a, b) => a.join("|").localeCompare(b.join("|")));
}

function aggregateJourneyGraphEdges(artifact, nodeById) {
  const aggregated = new Map();
  // A surface summary must expose the most material supported problem. A clean
  // parallel route is useful reachability evidence, but it cannot hide a
  // confirmed broken transition between the same two surface groups.
  const statusRank = { clean: 1, not_assessed: 2, friction: 3, broken: 4 };
  for (const edge of artifact.edges) {
    // Optional relationships that were not assessed are not owner-facing
    // connections. Keeping them out of the aggregate prevents a symmetric
    // gray mesh from implying that every surface must link to every other one.
    if (edge.expectation === "optional" && edge.status === "not_assessed") continue;
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    const from = fromNode.kind === "lead_intake" ? "lead_intake" : fromNode.surface;
    const to = toNode.kind === "lead_intake" ? "lead_intake" : toNode.surface;
    if (from === to) continue;
    const key = `${from}->${to}`;
    const current = aggregated.get(key);
    if (!current || statusRank[edge.status] > statusRank[current.status]) {
      aggregated.set(key, { from, to, status: edge.status, edge_ids: [edge.id] });
    } else if (current.status === edge.status) {
      current.edge_ids.push(edge.id);
    }
  }
  return [...aggregated.values()].sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`));
}

export function analyzeJourneyGraph(artifact) {
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]));
  const outgoing = new Map(artifact.nodes.map((node) => [node.id, []]));
  artifact.edges.forEach((edge) => outgoing.get(edge.from).push(edge));
  const cleanStatuses = new Set(["clean"]);
  const viableStatuses = new Set(["clean", "friction"]);
  const cleanReachable = (startId, blockedFirstEdgeId = null) => graphPathExists(
    startId,
    artifact.lead_intake_node_id,
    outgoing,
    cleanStatuses,
    artifact.max_hops,
    blockedFirstEdgeId,
  );
  const viableReachable = (startId) => graphPathExists(
    startId,
    artifact.lead_intake_node_id,
    outgoing,
    viableStatuses,
    artifact.max_hops,
  );
  const uncertainReachable = (startId) => graphPathExists(
    startId,
    artifact.lead_intake_node_id,
    outgoing,
    new Set(["clean", "friction", "not_assessed"]),
    artifact.max_hops,
    null,
    { allowUnknownExistence: true },
  );
  const reachability = artifact.entry_node_ids.map((nodeId) => {
    const cleanPath = cleanReachable(nodeId);
    const viablePath = cleanPath || viableReachable(nodeId);
    const uncertainPath = viablePath ? null : uncertainReachable(nodeId);
    const alternateCleanRoute = Boolean(cleanPath && (outgoing.get(nodeId) || []).some((edge) => (
      edge.id !== cleanPath[0]
      && edge.exists === true
      && edge.status === "clean"
      && cleanReachable(nodeId, cleanPath[0])
    )));
    const assessed = nodeById.get(nodeId)?.observability === "observed";
    return Object.freeze({
      entry_node_id: nodeId,
      reachable_to_intake: Boolean(viablePath),
      route_status: cleanPath ? "clean" : viablePath ? "friction" : uncertainPath ? "not_assessed" : assessed ? "broken" : "not_assessed",
      shortest_clean_hops: cleanPath?.length ?? null,
      alternate_clean_route: alternateCleanRoute,
      best_path_edge_ids: viablePath || [],
    });
  });

  const traversableEdges = artifact.edges.filter((edge) => edge.exists === true && ["clean", "friction"].includes(edge.status));
  const deadEnds = artifact.nodes
    .filter((node) => node.kind !== "lead_intake" && node.observability === "observed")
    .filter((node) => !(outgoing.get(node.id) || []).some((edge) => traversableEdges.includes(edge)))
    .map((node) => node.id)
    .sort();
  const reachableFromEntry = new Set(artifact.entry_node_ids);
  const queue = [...artifact.entry_node_ids];
  while (queue.length) {
    const current = queue.shift();
    for (const edge of outgoing.get(current) || []) {
      if (!traversableEdges.includes(edge) || reachableFromEntry.has(edge.to)) continue;
      reachableFromEntry.add(edge.to);
      queue.push(edge.to);
    }
  }
  const orphans = artifact.nodes
    .filter((node) => node.kind !== "lead_intake" && node.observability === "observed" && !reachableFromEntry.has(node.id))
    .map((node) => node.id)
    .sort();
  const contextBreaks = artifact.edges
    .filter((edge) => edge.context_integrity.status === "broken" || JOURNEY_GRAPH_CONTEXT_DIMENSIONS.some((dimension) => edge.context_integrity.dimensions[dimension] === "broken"))
    .map((edge) => ({
      edge_id: edge.id,
      dimensions: JOURNEY_GRAPH_CONTEXT_DIMENSIONS.filter((dimension) => edge.context_integrity.dimensions[dimension] === "broken"),
    }));
  const technicalBreaks = artifact.edges
    .filter((edge) => edge.technical_integrity.status === "broken")
    .map((edge) => edge.id)
    .sort();
  const dimensionBreaks = Object.fromEntries(JOURNEY_GRAPH_CONTEXT_DIMENSIONS.map((dimension) => [
    `${dimension}_breaks`,
    Object.freeze(contextBreaks.filter((item) => item.dimensions.includes(dimension)).map((item) => item.edge_id).sort()),
  ]));

  return Object.freeze({
    reachability: Object.freeze(reachability),
    diagnostics: Object.freeze({
      dead_ends: Object.freeze(deadEnds),
      loops: Object.freeze(journeyGraphLoops(artifact.nodes, outgoing)),
      orphans: Object.freeze(orphans),
      technical_breaks: Object.freeze(technicalBreaks),
      context_breaks: Object.freeze(contextBreaks),
      ...dimensionBreaks,
    }),
    surface_edges: Object.freeze(aggregateJourneyGraphEdges(artifact, nodeById)),
  });
}

export function validateJourneyGraphArtifact(artifact, { publication = false } = {}) {
  invariant(artifact && typeof artifact === "object" && !Array.isArray(artifact), "journeyGraph must be an object");
  invariant(artifact.artifact_version === JOURNEY_GRAPH_ARTIFACT_VERSION, `journeyGraph.artifact_version must be ${JOURNEY_GRAPH_ARTIFACT_VERSION}`);
  nonEmptyString(artifact.artifact_id, "journeyGraph.artifact_id");
  invariant(["assessed", "not_assessed"].includes(artifact.assessment_status), "journeyGraph.assessment_status must be assessed or not_assessed");
  invariant(Number.isInteger(artifact.max_hops) && artifact.max_hops >= 2 && artifact.max_hops <= 3, "journeyGraph.max_hops must be 2 or 3");
  invariant(artifact.automatic_score_change === false, "journeyGraph.automatic_score_change must be false");

  invariant(Array.isArray(artifact.evidence), "journeyGraph.evidence must be an array");
  const evidenceById = new Map();
  artifact.evidence.forEach((item, index) => {
    const context = `journeyGraph.evidence[${index}]`;
    invariant(item && typeof item === "object" && !Array.isArray(item), `${context} must be an object`);
    nonEmptyString(item.id, `${context}.id`);
    invariant(!evidenceById.has(item.id), `journeyGraph.evidence has duplicate id ${item.id}`);
    nonEmptyString(item.source, `${context}.source`);
    validDate(item.collected_at, `${context}.collected_at`);
    nonEmptyString(item.method, `${context}.method`);
    invariant(EVIDENCE_CLASSES.includes(item.evidence_class), `${context}.evidence_class must be A or B`);
    invariant(REVIEWER_STATUSES.includes(item.reviewer_status), `${context}.reviewer_status is invalid`);
    if (publication) invariant(item.reviewer_status === "approved", `${context}.reviewer_status must be approved for publication`);
    if (item.evidence_class === "B") validateClassBDisclosure(item, context);
    evidenceById.set(item.id, item);
  });

  invariant(Array.isArray(artifact.nodes), "journeyGraph.nodes must be an array");
  const nodeById = new Map();
  artifact.nodes.forEach((node, index) => {
    const context = `journeyGraph.nodes[${index}]`;
    invariant(node && typeof node === "object" && !Array.isArray(node), `${context} must be an object`);
    nonEmptyString(node.id, `${context}.id`);
    invariant(!nodeById.has(node.id), `journeyGraph.nodes has duplicate id ${node.id}`);
    invariant(JOURNEY_GRAPH_NODE_KINDS.includes(node.kind), `${context}.kind is invalid`);
    if (node.kind === "lead_intake") invariant(node.surface === null, `${context}.surface must be null for lead_intake`);
    else invariant(JOURNEY_GRAPH_SURFACES.includes(node.surface), `${context}.surface must be a Four-Surface id`);
    nonEmptyString(node.asset_type, `${context}.asset_type`);
    nonEmptyString(node.label, `${context}.label`);
    invariant(JOURNEY_GRAPH_OWNERSHIP.includes(node.ownership), `${context}.ownership is invalid`);
    invariant(JOURNEY_GRAPH_OBSERVABILITY.includes(node.observability), `${context}.observability is invalid`);
    validateJourneyGraphEvidenceRefs(node.evidence_refs, context, evidenceById, { nonEmpty: node.observability === "observed" && node.kind !== "lead_intake" });
    nodeById.set(node.id, node);
  });

  invariant(Array.isArray(artifact.edges), "journeyGraph.edges must be an array");
  const edgeById = new Map();
  artifact.edges.forEach((edge, index) => {
    const context = `journeyGraph.edges[${index}]`;
    invariant(edge && typeof edge === "object" && !Array.isArray(edge), `${context} must be an object`);
    nonEmptyString(edge.id, `${context}.id`);
    invariant(!edgeById.has(edge.id), `journeyGraph.edges has duplicate id ${edge.id}`);
    invariant(nodeById.has(edge.from), `${context}.from references unknown node ${String(edge.from)}`);
    invariant(nodeById.has(edge.to), `${context}.to references unknown node ${String(edge.to)}`);
    invariant(edge.from !== edge.to, `${context} must not be a self-edge`);
    invariant(JOURNEY_GRAPH_EXPECTATIONS.includes(edge.expectation), `${context}.expectation is invalid`);
    invariant(JOURNEY_GRAPH_ACTION_TYPES.includes(edge.action_type), `${context}.action_type is invalid`);
    invariant(JOURNEY_GRAPH_EDGE_STATUSES.includes(edge.status), `${context}.status is invalid`);
    invariant(edge.exists === null || typeof edge.exists === "boolean", `${context}.exists must be boolean or null`);
    invariant(edge.next_action_available === null || typeof edge.next_action_available === "boolean", `${context}.next_action_available must be boolean or null`);
    validateJourneyGraphIntegrity(edge.technical_integrity, `${context}.technical_integrity`);
    validateJourneyGraphIntegrity(edge.context_integrity, `${context}.context_integrity`, { withDimensions: true });
    nonEmptyString(edge.why_it_matters, `${context}.why_it_matters`);
    nonEmptyString(edge.repair_implication, `${context}.repair_implication`);
    if (edge.status === "not_assessed") {
      invariant(edge.source === null && edge.collected_at === null, `${context} source/date must be null when not_assessed`);
      validateJourneyGraphEvidenceRefs(edge.evidence_refs, context, evidenceById);
    } else {
      nonEmptyString(edge.source, `${context}.source`);
      validDate(edge.collected_at, `${context}.collected_at`);
      validateJourneyGraphEvidenceRefs(edge.evidence_refs, context, evidenceById, { nonEmpty: true });
    }
    if (edge.status === "clean") {
      invariant(edge.exists === true, `${context}.exists must be true when clean`);
      invariant(edge.technical_integrity.status === "clean", `${context}.technical_integrity.status must be clean when edge is clean`);
      invariant(edge.context_integrity.status === "clean", `${context}.context_integrity.status must be clean when edge is clean`);
      invariant(
        JOURNEY_GRAPH_CONTEXT_DIMENSIONS.every((dimension) => edge.context_integrity.dimensions[dimension] === "clean"),
        `${context}.context_integrity dimensions must all be clean when edge is clean`,
      );
      invariant(edge.next_action_available === true, `${context}.next_action_available must be true when clean`);
    }
    if (JOURNEY_GRAPH_CONTEXT_DIMENSIONS.some((dimension) => edge.context_integrity.dimensions[dimension] === "broken")) {
      invariant(
        edge.context_integrity.status === "broken",
        `${context}.context_integrity.status must be broken when a context dimension is broken`,
      );
    }
    if (edge.status === "broken") {
      invariant(
        edge.exists === false
          || edge.technical_integrity.status === "broken"
          || edge.context_integrity.status === "broken"
          || edge.next_action_available === false,
        `${context} broken status requires an observed technical, context or next-action break`,
      );
      if (edge.exists === false) {
        invariant(
          ["required", "conditional"].includes(edge.expectation),
          `${context} cannot mark an optional or merely observed missing edge as broken`,
        );
      }
    }
    edgeById.set(edge.id, edge);
  });

  invariant(Array.isArray(artifact.entry_node_ids), "journeyGraph.entry_node_ids must be an array");
  invariant(new Set(artifact.entry_node_ids).size === artifact.entry_node_ids.length, "journeyGraph.entry_node_ids must be unique");
  artifact.entry_node_ids.forEach((nodeId) => {
    invariant(nodeById.has(nodeId), `journeyGraph.entry_node_ids references unknown node ${nodeId}`);
    invariant(nodeById.get(nodeId).kind === "public_asset", `journeyGraph.entry_node_ids must reference public_asset nodes: ${nodeId}`);
    invariant(nodeById.get(nodeId).observability === "observed", `journeyGraph.entry_node_ids must reference observed nodes: ${nodeId}`);
  });
  if (artifact.assessment_status === "assessed") {
    invariant(artifact.nodes.length > 0, "journeyGraph.nodes must not be empty when assessed");
    invariant(artifact.entry_node_ids.length > 0, "journeyGraph.entry_node_ids must not be empty when assessed");
    nonEmptyString(artifact.lead_intake_node_id, "journeyGraph.lead_intake_node_id");
    invariant(nodeById.get(artifact.lead_intake_node_id)?.kind === "lead_intake", "journeyGraph.lead_intake_node_id must reference the lead_intake node");
    invariant(artifact.nodes.filter((node) => node.kind === "lead_intake").length === 1, "journeyGraph must contain exactly one lead_intake node when assessed");
  } else {
    invariant(artifact.lead_intake_node_id === null, "journeyGraph.lead_intake_node_id must be null when not_assessed");
  }

  invariant(Array.isArray(artifact.metric_links), "journeyGraph.metric_links must be an array");
  const metricLinkRefs = new Set();
  artifact.metric_links.forEach((link, index) => {
    const context = `journeyGraph.metric_links[${index}]`;
    invariant(JOURNEY_GRAPH_METRIC_REFS.includes(link.metric_ref), `${context}.metric_ref is not an approved existing metric`);
    invariant(!metricLinkRefs.has(link.metric_ref), `journeyGraph.metric_links has duplicate metric_ref ${link.metric_ref}`);
    metricLinkRefs.add(link.metric_ref);
    invariant(link.effect === "evidence_only", `${context}.effect must be evidence_only`);
    validateStringArray(link.edge_ids, `${context}.edge_ids`);
    validateStringArray(link.node_ids, `${context}.node_ids`);
    invariant(link.edge_ids.length + link.node_ids.length > 0, `${context} must reference at least one node or edge`);
    link.edge_ids.forEach((edgeId) => invariant(edgeById.has(edgeId), `${context} references unknown edge ${edgeId}`));
    link.node_ids.forEach((nodeId) => invariant(nodeById.has(nodeId), `${context} references unknown node ${nodeId}`));
  });

  invariant(Array.isArray(artifact.representative_journeys) && artifact.representative_journeys.length <= 3, "journeyGraph.representative_journeys must contain at most 3 journeys");
  const journeyIds = new Set();
  const prospectSlots = new Set();
  artifact.representative_journeys.forEach((journey, index) => {
    const context = `journeyGraph.representative_journeys[${index}]`;
    nonEmptyString(journey.id, `${context}.id`);
    invariant(!journeyIds.has(journey.id), `journeyGraph.representative_journeys has duplicate id ${journey.id}`);
    journeyIds.add(journey.id);
    nonEmptyString(journey.label, `${context}.label`);
    invariant(JOURNEY_GRAPH_JOURNEY_KINDS.includes(journey.kind), `${context}.kind is invalid`);
    invariant(Number.isInteger(journey.prospect_slot) && journey.prospect_slot >= 0 && journey.prospect_slot <= 2, `${context}.prospect_slot must be 0, 1 or 2`);
    invariant(!prospectSlots.has(journey.prospect_slot), `${context}.prospect_slot must be unique`);
    prospectSlots.add(journey.prospect_slot);
    validateStringArray(journey.edge_ids, `${context}.edge_ids`, { nonEmpty: true });
    let priorTarget = null;
    journey.edge_ids.forEach((edgeId, edgeIndex) => {
      invariant(edgeById.has(edgeId), `${context}.edge_ids references unknown edge ${edgeId}`);
      const edge = edgeById.get(edgeId);
      if (edgeIndex > 0) invariant(edge.from === priorTarget, `${context}.edge_ids must form one continuous path`);
      priorTarget = edge.to;
    });
  });

  const review = artifact.review;
  invariant(review && typeof review === "object" && !Array.isArray(review), "journeyGraph.review must be an object");
  invariant(["pending", "approved", "rejected"].includes(review.status), "journeyGraph.review.status is invalid");
  if (publication) {
    invariant(review.status === "approved", "journeyGraph.review.status must be approved for publication");
    namedHuman(review.reviewed_by, "journeyGraph.review.reviewed_by");
    validTimestamp(review.reviewed_at, "journeyGraph.review.reviewed_at");
    for (const field of ["entity_resolution_approved", "expectation_policy_approved", "semantic_integrity_approved", "severity_approved"]) {
      invariant(review[field] === true, `journeyGraph.review.${field} must be true for publication`);
    }
  }

  return artifact.assessment_status === "assessed" ? analyzeJourneyGraph(artifact) : Object.freeze({
    reachability: Object.freeze([]),
    diagnostics: Object.freeze({
      dead_ends: Object.freeze([]),
      loops: Object.freeze([]),
      orphans: Object.freeze([]),
      technical_breaks: Object.freeze([]),
      context_breaks: Object.freeze([]),
      identity_breaks: Object.freeze([]),
      location_breaks: Object.freeze([]),
      treatment_breaks: Object.freeze([]),
      offer_breaks: Object.freeze([]),
      proof_breaks: Object.freeze([]),
    }),
    surface_edges: Object.freeze([]),
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
      evidence.raw_value !== null && evidence.reviewer_status === "approved",
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

function validateRepairPlan(plan, context, { longWork }) {
  invariant(plan && typeof plan === "object" && !Array.isArray(plan), `${context} must be an object`);
  nonEmptyString(plan.outcome, `${context}.outcome`);
  validateStringArray(plan.diy_steps, `${context}.diy_steps`, { nonEmpty: true });
  validateStringArray(plan.dependencies, `${context}.dependencies`);
  nonEmptyString(plan.owner_role, `${context}.owner_role`);
  validateStringArray(plan.done_when, `${context}.done_when`, { nonEmpty: true });
  if (longWork) {
    nonEmptyString(plan.day_30_outcome, `${context}.day_30_outcome`);
    nonEmptyString(plan.beyond_day_30, `${context}.beyond_day_30`);
  }
}

function hasApprovedClassAEvidence(refs, evidenceIndex) {
  return refs.some((ref) => evidenceIndex.get(ref)?.evidence_class === "A");
}

function validateGapInventory(gaps, evidenceIndex) {
  invariant(Array.isArray(gaps) && gaps.length > 0, "humanDiagnosis.gap_inventory must be a non-empty array");
  const gapById = new Map();
  const classes = gaps.map((gap, index) => {
    const context = `humanDiagnosis.gap_inventory[${index}]`;
    invariant(gap && typeof gap === "object" && !Array.isArray(gap), `${context} must be an object`);
    nonEmptyString(gap.id, `${context}.id`);
    invariant(!gapById.has(gap.id), `humanDiagnosis.gap_inventory has duplicate id ${gap.id}`);
    invariant(DIAGNOSIS_STATES.includes(gap.diagnosis_state), `${context}.diagnosis_state is invalid`);
    validateStringArray(gap.surfaces, `${context}.surfaces`, { nonEmpty: true });
    gap.surfaces.forEach((surface, surfaceIndex) => {
      invariant(GAP_SURFACES.includes(surface), `${context}.surfaces[${surfaceIndex}] is invalid`);
    });
    invariant(JOURNEY_STAGES.includes(gap.journey_stage), `${context}.journey_stage is invalid`);
    nonEmptyString(gap.title, `${context}.title`);
    nonEmptyString(gap.why_it_matters, `${context}.why_it_matters`);
    invariant(
      gap.sprint_fit && typeof gap.sprint_fit === "object" && !Array.isArray(gap.sprint_fit),
      `${context}.sprint_fit must be an object`,
    );
    invariant(SPRINT_FIT_MODES.includes(gap.sprint_fit.mode), `${context}.sprint_fit.mode is invalid`);

    if (gap.diagnosis_state === "insufficient_evidence") {
      invariant(Array.isArray(gap.evidence_refs), `${context}.evidence_refs must be an array`);
      if (gap.evidence_refs.length > 0) validateEvidenceRefs(gap.evidence_refs, context, evidenceIndex);
      invariant(gap.sprint_fit.mode === "backlog", `${context}.sprint_fit.mode must be backlog when evidence is insufficient`);
    } else {
      validateEvidenceRefs(gap.evidence_refs, context, evidenceIndex);
    }

    const longWork = gap.sprint_fit.mode === "start_in_30_days";
    validateRepairPlan(gap.repair_plan, `${context}.repair_plan`, { longWork });
    gapById.set(gap.id, gap);

    if (gap.diagnosis_state === "insufficient_evidence" && gap.evidence_refs.length === 0) return "A";
    const evidenceClass = resolveClaimEvidenceClass(gap, context, evidenceIndex);
    if (evidenceClass === "B") validateClassBDisclosure({ ...gap, evidence_class: evidenceClass }, context);
    return evidenceClass;
  });
  return { gapById, classes };
}

export function validateFocusSelectionContract(diagnosis, evidenceIndex) {
  const assessment = assessGapInventory({ humanDiagnosis: diagnosis });
  if (assessment.status === "evidence_incomplete") {
    throw new EvidenceIncompleteError();
  }

  const focus = diagnosis.focus_selection;
  invariant(focus && typeof focus === "object" && !Array.isArray(focus), "humanDiagnosis.focus_selection must be an object");
  nonEmptyString(focus.primary_gap_id, "humanDiagnosis.focus_selection.primary_gap_id");
  invariant(
    Array.isArray(focus.supporting_gap_ids) && focus.supporting_gap_ids.length === 2,
    "humanDiagnosis.focus_selection.supporting_gap_ids must contain exactly 2 items",
  );
  namedHuman(focus.selected_by, "humanDiagnosis.focus_selection.selected_by");
  validTimestamp(focus.selected_at, "humanDiagnosis.focus_selection.selected_at");
  nonEmptyString(focus.rationale, "humanDiagnosis.focus_selection.rationale");

  const selectedIds = selectedFocusGapIds(focus);
  invariant(
    selectedIds.length === FOCUS_SELECTION_COUNT,
    "humanDiagnosis.focus_selection must contain exactly 3 unique gaps",
  );
  invariant(new Set(selectedIds).size === selectedIds.length, "humanDiagnosis.focus_selection has duplicate gap ids");
  invariant(!focus.supporting_gap_ids.includes(focus.primary_gap_id), "supporting gaps must not repeat the Primary Gap");

  const gapById = new Map((diagnosis.gap_inventory || []).map((gap) => [gap.id, gap]));
  for (const gapId of selectedIds) {
    invariant(gapById.has(gapId), `humanDiagnosis.focus_selection references unknown gap ${gapId}`);
    const gap = gapById.get(gapId);
    const context = `humanDiagnosis.gap_inventory.${gapId}`;
    invariant(gap.diagnosis_state === "verified_gap", `${context} cannot be selected unless diagnosis_state is verified_gap`);
    invariant(
      !["insufficient_evidence", "monitor", "working"].includes(gap.diagnosis_state),
      `${context} diagnosis_state cannot enter Focus Selection`,
    );
    invariant(gap.sprint_fit.mode !== "backlog", `${context} with sprint_fit.mode=backlog cannot enter Focus Selection`);
    invariant(
      hasApprovedClassAEvidence(gap.evidence_refs, evidenceIndex),
      `${context} must include at least one final approved Class A evidence reference`,
    );
  }

  const selectedGaps = selectedIds.map((id) => gapById.get(id));
  const closeCount = selectedGaps.filter((gap) => gap.sprint_fit.mode === "close_in_30_days").length;
  const startCount = selectedGaps.filter((gap) => gap.sprint_fit.mode === "start_in_30_days").length;
  invariant(closeCount >= MIN_CLOSE_IN_30_DAYS, "Focus Selection requires at least two close_in_30_days gaps");
  invariant(startCount <= MAX_START_IN_30_DAYS, "Focus Selection allows at most one start_in_30_days gap");

  invariant(
    diagnosis.binding_constraint?.gap_ref === focus.primary_gap_id,
    "humanDiagnosis.binding_constraint.gap_ref must equal focus_selection.primary_gap_id",
  );

  return selectedGaps;
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
  nonEmptyString(diagnosis.binding_constraint.gap_ref, "humanDiagnosis.binding_constraint.gap_ref");
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
    !hasOwn(diagnosis, "top_priorities"),
    "humanDiagnosis.top_priorities is removed in schema v5; use focus_selection",
  );
  invariant(
    !hasOwn(diagnosis, "problem_inventory"),
    "humanDiagnosis.problem_inventory is removed in schema v5; use gap_inventory",
  );
  invariant(
    !hasOwn(diagnosis, "remediation_tasks"),
    "humanDiagnosis.remediation_tasks is removed in schema v5; use gap repair_plan",
  );
  invariant(
    !hasOwn(diagnosis, "selected_for_repair"),
    "selected_for_repair is derived from focus_selection and must not be stored",
  );

  const { classes: gapClasses } = validateGapInventory(diagnosis.gap_inventory, evidenceIndex);
  validateFocusSelectionContract(diagnosis, evidenceIndex);
  const doNotDoClass = validateEvidenceBackedClaim(
    diagnosis.do_not_do,
    "humanDiagnosis.do_not_do",
    evidenceIndex,
  );

  return { objectiveClass, bindingClass, doNotDoClass, gapClasses };
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
        && metricInput.reviewer_status === "approved"
      ) classes.push(metricInput.evidence_class);
    }
  }
  for (const metricInput of report.crossSurface.metrics) {
    if (
      typeof metricInput.finding === "string"
      && metricInput.finding.trim()
      && metricInput.raw_value !== null
      && metricInput.reviewer_status === "approved"
    ) classes.push(metricInput.evidence_class);
  }
  classes.push(
    diagnosisClasses.objectiveClass,
    diagnosisClasses.bindingClass,
    diagnosisClasses.doNotDoClass,
    ...diagnosisClasses.gapClasses,
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

function validateCurrentReportContract(report) {
  invariant(
    report.templateVersion === GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
    `templateVersion must be ${GROWTH_SCORE_REPORT_TEMPLATE_VERSION} for schemaVersion 5`,
  );
  const context = report.reportContext;
  invariant(context && typeof context === "object" && !Array.isArray(context), "reportContext is required for schemaVersion 5");
  invariant(
    GROWTH_SCORE_VERTICAL_CONTEXTS.includes(context.vertical_context),
    `reportContext.vertical_context must be one of ${GROWTH_SCORE_VERTICAL_CONTEXTS.join("|")}`,
  );
  invariant(
    GROWTH_SCORE_REPORT_LOCALES.includes(context.report_locale),
    `reportContext.report_locale must be one of ${GROWTH_SCORE_REPORT_LOCALES.join("|")}`,
  );
  invariant(
    GROWTH_SCORE_VERTICAL_SOURCES.includes(context.vertical_source),
    `reportContext.vertical_source must be ${GROWTH_SCORE_VERTICAL_SOURCES.join("|")}`,
  );
  invariant(
    GROWTH_SCORE_LOCALE_SOURCES.includes(context.locale_source),
    `reportContext.locale_source must be ${GROWTH_SCORE_LOCALE_SOURCES.join("|")}`,
  );
}

function validatePublicationLanguage(report) {
  const strings = [];
  const visit = (value) => {
    if (typeof value === "string") strings.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(report);
  const publicationText = strings.join("\n");
  const prohibited = [
    /\b(?:we\s+)?guarantee(?:d|s)?\s+(?:growth|ranking|rankings|patients?|revenue|roi)\b/i,
    /\b(?:only|send)\s+(?:happy|satisfied)\s+(?:clients?|patients?|customers?)\s+(?:to|for)\s+(?:google|public)\s+reviews?\b/i,
    /\b[1-3]\s*(?:star|stars).*\bprivate\b.*\b[4-5]\s*(?:star|stars).*\bpublic\b/i,
  ];
  invariant(
    prohibited.every((pattern) => !pattern.test(publicationText)),
    "report contains prohibited guarantee or selective review-routing language",
  );
}

export function scoreGrowthReport(report) {
  invariant(report && typeof report === "object" && !Array.isArray(report), "report must be an object");
  invariant(report.schemaVersion === GROWTH_SCORE_SCHEMA_VERSION, "schemaVersion must be 5");
  validateCurrentReportContract(report);
  invariant(report.reportState === "approved_report", "reportState must be approved_report; drafts cannot publish");
  nonEmptyString(report.reportVersion, "reportVersion");
  nonEmptyString(report.verifiedFactSetVersion, "verifiedFactSetVersion");
  invariant(["demo", "real"].includes(report.reportKind), "reportKind must be demo or real");
  if (report.reportKind === "demo") nonEmptyString(report.disclosure, "disclosure");
  validatePublicationLanguage(report);
  validateMethodology(report.methodology);
  const journeyGraph = hasOwn(report, "journeyGraph")
    ? validateJourneyGraphArtifact(report.journeyGraph, { publication: true })
    : null;
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
    journeyGraph,
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
