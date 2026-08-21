import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_METRICS,
  CANONICAL_METRIC_WEIGHTS,
  HUMAN_REVIEW_METRICS,
  REGISTERED_HUMAN_REVIEWER_MONONYMS,
  resolveGrowthEconomics,
  scoreGrowthReport,
  SURFACE_WEIGHTS,
  validateGrowthEconomicsContract,
  validateGrowthScoreReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

const metricInput = (metric_id, normalized_score = 50, overrides = {}) => ({
  metric_id,
  raw_value: normalized_score === null ? null : `observed:${metric_id}`,
  normalized_score,
  evidence_class: "A",
  source: normalized_score === null ? null : `fixture://${metric_id}`,
  collected_at: normalized_score === null ? null : "2026-08-11T12:00:00Z",
  reviewer_status: normalized_score === null ? "pending" : "approved",
  finding: `${metric_id} fixture finding`,
  ...overrides,
});

const metricSet = (surfaceId, score = 50, overrides = {}) => Object.keys(CANONICAL_METRICS[surfaceId])
  .map((metricId) => metricInput(metricId, score, overrides[metricId]));

function competitiveFixture(subjectName, competitorName = "Named Competitor A") {
  const evidence = ["search.map_visibility", "website.booking_friction", "social.proof_quality", "reputation.rating"];
  const competitor = {
    id: "named-competitor-a",
    name: competitorName,
    competitor_type: "local",
    selection_reason: "Direct local alternative for the same priority treatment.",
    branch_scope: "Single-market fixture.",
    sources: [{ url_or_snapshot: "fixture://competitor", source_type: "maps", collected_at: "2026-08-11", sample_note: "Synthetic comparable sample." }],
    strengths: ["Clear first step."],
    weaknesses_or_risks: ["No verified outcome superiority."],
    surface_evidence: Object.fromEntries(["search", "website", "social", "reputation"].map((surface, index) => [surface, {
      status: "observed",
      finding: `${surface} fixture comparison`,
      evidence_refs: [evidence[index]],
    }])),
    repeated_positive_themes: [{ theme: "Clear first step", mentions: 3, sample_size: 10, window: "2026-05-14 to 2026-08-11", evidence_refs: ["reputation.rating"] }],
    repeated_negative_themes: [{ theme: "Price uncertainty", mentions: 2, sample_size: 10, window: "2026-05-14 to 2026-08-11", evidence_refs: ["reputation.rating"] }],
    patient_choice_reason: "The competitor presents a clearer first step.",
    observable_advantage: "Clearer discovery-to-booking continuity.",
    observable_gap: "No verified superiority in clinical outcome.",
    repeat: "Repeat the clear explanation pattern.",
    improve: "Connect it to verified proof and price conditions.",
    do_not_copy: "Do not copy unsupported clinical claims.",
    strategic_implication: "Close the decision-path gap before adding spend.",
    constraint_effect: "Confirms the discovery constraint.",
    priority_effect: "Confirms the existing Top 3 order.",
    modernization_implication: "Pilot the clearer path; do not infer that newer clinical inputs are superior.",
    evidence_refs: evidence,
    limitations: "Synthetic fixture; no real competitor or clinical conclusion.",
  };
  return {
    status: "applicable",
    selection_method: "Nearest practices offering the same priority treatment.",
    sample_limitations: "Synthetic fixture; no real business conclusion.",
    comparison_window: { start: "2026-05-14", end: "2026-08-11" },
    review_sample_rule: "Same 90-day window and ten eligible reviews; recurrence requires two mentions.",
    branch_scope: "Single-market fixture.",
    entries: [competitor],
    comparison_matrix: {
      subject_name: subjectName,
      rows: [
        { entity_ref: "subject", entity_name: subjectName, entity_type: "subject", search: "Subject search baseline.", website: "Subject website baseline.", social: "Subject social baseline.", reputation: "Subject reputation baseline.", evidence_refs: evidence },
        { entity_ref: competitor.id, entity_name: competitor.name, entity_type: "competitor", search: "Competitor search comparison.", website: "Competitor website comparison.", social: "Competitor social comparison.", reputation: "Competitor reputation comparison.", evidence_refs: evidence },
      ],
    },
    decision_summary: {
      defend: [{ title: "Defend verified reputation", rationale: "Preserve the existing strength.", evidence_refs: ["reputation.rating"] }],
      close: [{ title: "Close discovery gap", rationale: "It remains the binding constraint.", evidence_refs: ["search.map_visibility"] }],
      differentiate: [{ title: "Own clear continuity", rationale: "Connect proof to booking.", evidence_refs: ["website.booking_friction"] }],
      do_not_copy: [{ title: "Avoid unsupported claims", rationale: "Activity is not proof.", evidence_refs: ["social.proof_quality"] }],
    },
    market_practice_gap: {
      status: "applicable",
      reason: "A clearer decision-path pattern is observable and suitable for a bounded pilot.",
      recommendations: [{
        title: "Pilot the clearer decision path",
        current_state: "The fixture separates proof and booking.",
        market_shift: "The comparison joins them into one path.",
        evidence_scope: "Synthetic local comparison only.",
        business_implication: "The path may reduce decision friction.",
        transition_economics: "Run a bounded test before replacement spend.",
        dependencies: ["Owner approval", "Baseline metric"],
        decision: "pilot",
        specialist_validation: "A qualified clinician and regulatory authority validate any clinical, drug, device or protocol change.",
        evidence_refs: ["website.booking_friction"],
        limitations: "Adoption does not prove superiority or profitability.",
      }],
    },
  };
}

function report(scores = { search: 40, website: 60, social: 80, reputation: 100, cross: 5 }) {
  const surfaces = Object.keys(SURFACE_WEIGHTS).map((id) => ({ id, metrics: metricSet(id, scores[id]) }));
  return {
    schemaVersion: 4,
    reportState: "approved_report",
    reportVersion: "fixture-report/1.0.0",
    verifiedFactSetVersion: "fixture-facts/1.0.0",
    reportKind: "demo",
    practice: { name: "Fixture Practice" },
    surfaces,
    crossSurface: { metrics: metricSet("cross", scores.cross) },
    humanDiagnosis: {
      reviewer_status: "approved",
      reviewer: { name: "Morgan Reed", approved_at: "2026-08-11T13:00:00Z" },
      objective_strength: { title: "Strong reputation proof", evidence_refs: ["reputation.rating"] },
      strongest_surface: "reputation",
      binding_constraint: { title: "Search constraint", evidence_refs: ["search.map_visibility"] },
      top_priorities: [
        { id: "priority-search", title: "Fix discovery", problem_refs: ["search-gap"], evidence_refs: ["search.map_visibility"], impact: "Recover discovery demand." },
        { id: "priority-booking", title: "Reduce booking friction", problem_refs: ["search-gap"], evidence_refs: ["website.booking_friction"], impact: "Improve enquiry completion." },
        { id: "priority-proof", title: "Unify proof", problem_refs: ["search-gap"], evidence_refs: ["social.proof_quality"], impact: "Strengthen decision confidence." },
      ],
      do_not_do: { title: "Do not increase paid media before fixing the measured constraint.", evidence_refs: ["search.map_visibility"] },
      competitors: competitiveFixture("Fixture Practice"),
      walkthrough: { status: "pending", url: null, placeholder: "Human walkthrough recording pending." },
      problem_inventory: [{
        id: "search-gap",
        surface: "search",
        title: "Weak local discovery",
        evidence_refs: ["search.map_visibility"],
        impact: "Priority-treatment demand is missed.",
        task_refs: ["task-search-gap"],
        suggested_horizon: "0-30 days",
        status: "diagnosed",
      }],
      remediation_tasks: [{
        id: "task-search-gap",
        problem_refs: ["search-gap"],
        outcome: "The practice is accurately represented for priority-treatment searches.",
        steps: ["Verify the current GBP category and services.", "Correct the approved public profile fields."],
        evidence_refs: ["search.map_visibility"],
        prerequisites_access: ["GBP manager access", "Owner approval"],
        dependencies: [],
        sequence: { order: 1, rationale: "Resolve discovery before adding acquisition spend." },
        owner_role: "Local-search operator with owner approval",
        effort_complexity: "Medium — profile changes and verification may require coordination.",
        implementation_risk: "Platform edits can trigger reverification; preserve a before snapshot and owner access.",
        horizon: "Implementation in 1–2 weeks; visibility maturation is not guaranteed.",
        acceptance_evidence: ["Live GBP screenshot", "Dated follow-up geo-grid export"],
        next_action: "Export current GBP fields and confirm the owner-approved category set.",
      }],
    },
    implementation_paths: {
      diy: "Use the complete task steps and acceptance evidence with the internal team.",
      other_provider: "Share the owned evidence pack and task plan with another qualified provider.",
      defer: "Defer lower-priority work while preserving the evidence baseline.",
      caesthetic: "Ask CAESTHETIC to scope selected tasks separately; no work is pre-purchased.",
    },
    why_caesthetic: {
      evidence_advantage: "CAESTHETIC already understands the reviewed evidence and problem map.",
      coordination_advantage: "CAESTHETIC can coordinate the dependency order and acceptance checks.",
      sprint_boundary: "Any 30-Day Sprint scope is confirmed separately and cannot include every Score task by default.",
      ownership: "The client owns the report, evidence and task plan and may use another provider without lock-in.",
    },
    estimates: [],
    disclosure: "Fictional practice, synthetic data, no client relationship.",
    methodology: {
      sources: ["Synthetic fixture"],
      collectedAt: "2026-08-11T12:00:00Z",
      competitorSelection: "Nearest fictional peers offering the same priority treatment.",
      limitations: "Synthetic data; no client outcome or guarantee.",
    },
  };
}

function getSurface(value, id) {
  return value.surfaces.find((surface) => surface.id === id);
}

function getMetric(value, surfaceId, metricId) {
  return getSurface(value, surfaceId).metrics.find((metric) => metric.metric_id === metricId);
}

function getMetricResult(scored, surfaceId, metricId) {
  return scored.surfaces[surfaceId].metricResults.find((metric) => metric.metric_id === metricId);
}

function economicsContract(overrides = {}) {
  return {
    vertical: "aesthetics",
    input: {},
    verification: {
      frozen_price_book: false,
      completed_services: false,
      attribution_evidence: false,
      variable_costs: false,
      human_verified: false,
      sources: [],
    },
    assumptions: {
      growth_budget: ["Fixture planning assumptions"],
      performance: ["Fixture performance assumptions"],
    },
    modeled_opportunity: {
      status: "insufficient_data",
      evidence_class: "B",
      label: "Modeled monthly contribution opportunity",
      currency: "USD",
      data_quality: "low",
      method: "No range is published without verified inputs.",
      assumptions: [],
      missing: ["verified inputs"],
    },
    ...overrides,
  };
}

test("owns the exact canonical metric ids and weights", () => {
  assert.deepEqual(SURFACE_WEIGHTS, { search: 30, website: 25, social: 15, reputation: 30 });
  assert.deepEqual(CANONICAL_METRIC_WEIGHTS, {
    search: { map_visibility: 35, gbp_treatment_category_completeness: 20, entity_integrity: 15, gbp_conversion_readiness: 15, freshness: 10, branded_search_control: 5 },
    website: { booking_friction: 25, treatment_clarity: 20, mobile_performance: 15, above_fold_conversion: 15, clinician_trust_proof: 10, mystery_shopper: 10, technical_booking_integrity: 5 },
    social: { priority_treatment_presence: 20, clinician_expertise: 20, proof_quality: 20, recency: 15, profile_to_booking: 15, local_offer_clarity: 10 },
    reputation: { review_velocity_90d: 25, rating: 10, review_depth: 10, recency: 10, response_coverage: 15, response_speed: 10, negative_review_handling: 10, treatment_clinician_proof: 10 },
    cross: { treatment_presence: 30, positioning_coherence: 20, proof_continuity: 20, conversion_continuity: 20, identity_coherence: 10 },
  });
  assert.ok(HUMAN_REVIEW_METRICS.website.includes("mystery_shopper"));
  assert.ok(!HUMAN_REVIEW_METRICS.website.includes("mobile_performance"));
});

test("calculates the fixed Four-Surface overall and excludes Cross-Surface", () => {
  const value = report();
  assert.equal(scoreGrowthReport(value).overall.rawScore, 69);
  value.crossSurface.metrics.forEach((item) => { item.normalized_score = 99; });
  assert.equal(scoreGrowthReport(value).overall.rawScore, 69);
});

test("rejects wrong explicit weights and never lets caller weights alter a score", () => {
  const wrong = report();
  getSurface(wrong, "search").metrics[0].weight = 99;
  assert.throws(() => scoreGrowthReport(wrong), /conflicts with canonical weight 35/);

  const exact = report();
  getSurface(exact, "search").metrics[0].canonical_weight = 35;
  assert.equal(scoreGrowthReport(exact).surfaces.search.rawScore, 40);
});

test("requires the exact complete canonical metric set", () => {
  const missing = report();
  getSurface(missing, "social").metrics.pop();
  assert.throws(() => scoreGrowthReport(missing), /exact canonical metric set/);

  const unknown = report();
  getSurface(unknown, "social").metrics[0].metric_id = "followers";
  assert.throws(() => scoreGrowthReport(unknown), /unknown metric_id followers/);

  const duplicate = report();
  getSurface(duplicate, "social").metrics[1].metric_id = getSurface(duplicate, "social").metrics[0].metric_id;
  assert.throws(() => scoreGrowthReport(duplicate), /duplicate metric_id/);
});

test("renormalizes available canonical weights at 70% coverage", () => {
  const value = report();
  const search = getSurface(value, "search");
  // 35 + 20 + 15 = exactly 70 available, renormalized over those weights.
  search.metrics = metricSet("search", null, {
    map_visibility: metricInput("map_visibility", 20),
    gbp_treatment_category_completeness: metricInput("gbp_treatment_category_completeness", 50),
    entity_integrity: metricInput("entity_integrity", 100),
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 70);
  assert.equal(scored.surfaces.search.rawScore, 3200 / 70);
  assert.equal(scored.overall.sufficient, true);
});

test("approved Class B metrics remain visible but never fill score coverage", () => {
  const value = report();
  const search = getSurface(value, "search");
  // 35 + 20 + 10 Class A = 65. The approved 15-weight Class B item must not
  // move the surface over the 70% publication boundary.
  search.metrics = metricSet("search", null, {
    map_visibility: metricInput("map_visibility", 80),
    gbp_treatment_category_completeness: metricInput("gbp_treatment_category_completeness", 80),
    freshness: metricInput("freshness", 80),
    entity_integrity: metricInput("entity_integrity", 80, {
      evidence_class: "B",
      finding_type: "inference",
      method: "Fixture inference",
      assumptions: ["The sampled directory set is representative"],
    }),
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 65);
  assert.equal(scored.surfaces.search.sufficient, false);
  assert.equal(getMetricResult(scored, "search", "entity_integrity").available, true);
  assert.equal(getMetricResult(scored, "search", "entity_integrity").coverageEligible, false);
});

test("pending raw evidence is accepted, identified, and excluded from 70% coverage", () => {
  const value = report();
  const search = getSurface(value, "search");
  // 35 + 20 + 15 = exactly 70 final; the remaining 30 carries raw evidence
  // pending review and must not lift observed weight above that boundary.
  search.metrics = metricSet("search", null, {
    map_visibility: metricInput("map_visibility", 20),
    gbp_treatment_category_completeness: metricInput("gbp_treatment_category_completeness", 50),
    entity_integrity: metricInput("entity_integrity", 100),
    gbp_conversion_readiness: metricInput("gbp_conversion_readiness", null, {
      raw_value: "Observed booking link needs human verification",
      source: "fixture://pending-booking",
      collected_at: "2026-08-11",
      reviewer_status: "pending",
    }),
    freshness: metricInput("freshness", null, {
      raw_value: "Observed latest GBP update 37 days ago",
      source: "fixture://pending-freshness",
      collected_at: "2026-08-11T12:00:00Z",
      reviewer_status: "pending",
    }),
    branded_search_control: metricInput("branded_search_control", null, {
      raw_value: "Observed branded result set",
      source: "fixture://pending-brand",
      collected_at: "2026-08-11",
      reviewer_status: "pending",
    }),
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 70);
  assert.equal(scored.surfaces.search.sufficient, true);
  assert.equal(getMetricResult(scored, "search", "gbp_conversion_readiness").available, false);
  assert.equal(getMetricResult(scored, "search", "gbp_conversion_readiness").availability_reason, "pending_review");
});

test("AI-draft raw evidence is accepted but cannot carry or contribute a final score", () => {
  const value = report();
  Object.assign(getMetric(value, "search", "freshness"), {
    raw_value: { latest_update_days_ago: 37 },
    normalized_score: null,
    source: "fixture://ai-draft-freshness",
    collected_at: "2026-08-11T12:00:00Z",
    reviewer_status: "ai_draft",
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 90);
  assert.equal(getMetricResult(scored, "search", "freshness").availability_reason, "ai_draft");

  const leakedDraft = report();
  getMetric(leakedDraft, "search", "map_visibility").reviewer_status = "ai_draft";
  assert.throws(() => scoreGrowthReport(leakedDraft), /normalized_score must be null while reviewer_status is ai_draft/);
});

test("rejected raw evidence is retained for audit but excluded from scoring", () => {
  const value = report();
  Object.assign(getMetric(value, "search", "freshness"), {
    raw_value: "Observed update rejected because the timestamp was stale",
    normalized_score: null,
    source: "fixture://rejected-freshness",
    collected_at: "2026-08-11",
    reviewer_status: "rejected",
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 90);
  assert.equal(getMetricResult(scored, "search", "freshness").available, false);
  assert.equal(getMetricResult(scored, "search", "freshness").availability_reason, "rejected");
});

test("marks a surface below 70% insufficient and refuses to invent an overall", () => {
  const value = report();
  const search = getSurface(value, "search");
  // 35 + 20 + 10 = 65.
  search.metrics = metricSet("search", null, {
    map_visibility: metricInput("map_visibility", 100),
    gbp_treatment_category_completeness: metricInput("gbp_treatment_category_completeness", 100),
    freshness: metricInput("freshness", 100),
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.search.observedWeight, 65);
  assert.equal(scored.surfaces.search.rawScore, null);
  assert.equal(scored.overall.rawScore, null);
  assert.equal(scored.overall.status, "insufficient_evidence");
});

test("applies the same 70% coverage policy to Cross-Surface", () => {
  const value = report();
  value.crossSurface.metrics = metricSet("cross", null, {
    treatment_presence: metricInput("treatment_presence", 80),
    positioning_coherence: metricInput("positioning_coherence", 80),
    identity_coherence: metricInput("identity_coherence", 80),
  });
  assert.equal(scoreGrowthReport(value).crossSurface.rawScore, null);
});

test("still requires the report-level human diagnosis approval", () => {
  const diagnosedByAi = report();
  diagnosedByAi.humanDiagnosis.reviewer_status = "ai_draft";
  assert.throws(() => scoreGrowthReport(diagnosedByAi), /reviewer_status must be approved/);
});

test("publication is v4 approved-report only with named human and frozen fact-set versions", () => {
  const valid = report();
  assert.equal(validateGrowthScoreReport(valid).overall.sufficient, true);

  const draft = report();
  draft.reportState = "draft";
  assert.throws(() => scoreGrowthReport(draft), /drafts cannot publish/);

  const oldSchema = report();
  oldSchema.schemaVersion = 3;
  assert.throws(() => scoreGrowthReport(oldSchema), /schemaVersion must be 4/);

  const unnamed = report();
  unnamed.humanDiagnosis.reviewer.name = "AI assistant";
  assert.throws(() => scoreGrowthReport(unnamed), /named human reviewer/);

  assert.deepEqual(REGISTERED_HUMAN_REVIEWER_MONONYMS, ["Валерия"]);

  const registeredMononym = report();
  registeredMononym.humanDiagnosis.reviewer.name = "Валерия";
  assert.equal(scoreGrowthReport(registeredMononym).overall.sufficient, true);

  const unregisteredMononym = report();
  unregisteredMononym.humanDiagnosis.reviewer.name = "Morgan";
  assert.throws(() => scoreGrowthReport(unregisteredMononym), /registered reviewer mononym/);

  const dateOnlyApproval = report();
  dateOnlyApproval.humanDiagnosis.reviewer.approved_at = "2026-08-11";
  assert.throws(() => scoreGrowthReport(dateOnlyApproval), /timestamp/);

  const impossibleApproval = report();
  impossibleApproval.humanDiagnosis.reviewer.approved_at = "2026-02-30T12:00:00Z";
  assert.throws(() => scoreGrowthReport(impossibleApproval), /timestamp/);

  const noFactVersion = report();
  noFactVersion.verifiedFactSetVersion = "";
  assert.throws(() => scoreGrowthReport(noFactVersion), /verifiedFactSetVersion is required/);
});

test("unknown evidence remains unavailable with nullable source and collection date", () => {
  const value = report();
  const unknown = getSurface(value, "website").metrics.find((item) => item.metric_id === "technical_booking_integrity");
  Object.assign(unknown, { raw_value: null, normalized_score: null, source: null, collected_at: null, reviewer_status: "pending" });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.surfaces.website.observedWeight, 95);
  assert.equal(getMetricResult(scored, "website", "technical_booking_integrity").availability_reason, "unavailable");
});

test("approved evidence requires a final score, raw value, valid source, and valid date", () => {
  const noScore = report();
  getMetric(noScore, "website", "booking_friction").normalized_score = null;
  assert.throws(() => scoreGrowthReport(noScore), /normalized_score is required when reviewer_status is approved/);

  const noRaw = report();
  getMetric(noRaw, "website", "booking_friction").raw_value = null;
  assert.throws(() => scoreGrowthReport(noRaw), /raw_value must not be null when normalized_score is published/);

  const noSource = report();
  getMetric(noSource, "website", "booking_friction").source = null;
  assert.throws(() => scoreGrowthReport(noSource), /source is required/);

  const noDate = report();
  getMetric(noDate, "website", "booking_friction").collected_at = null;
  assert.throws(() => scoreGrowthReport(noDate), /collected_at is required/);

  const badDate = report();
  getMetric(badDate, "website", "booking_friction").collected_at = "2026-02-30";
  assert.throws(() => scoreGrowthReport(badDate), /valid calendar date/);
});

test("raw evidence in any review state requires a valid source and collection date", () => {
  for (const reviewer_status of ["pending", "ai_draft", "rejected"]) {
    const noSource = report();
    Object.assign(getMetric(noSource, "website", "booking_friction"), {
      normalized_score: null,
      reviewer_status,
      source: null,
    });
    assert.throws(() => scoreGrowthReport(noSource), /source is required/);

    const noDate = report();
    Object.assign(getMetric(noDate, "website", "booking_friction"), {
      normalized_score: null,
      reviewer_status,
      collected_at: null,
    });
    assert.throws(() => scoreGrowthReport(noDate), /collected_at is required/);
  }
});

test("rejects non-JSON raw evidence", () => {
  const nonJson = report();
  getSurface(nonJson, "website").metrics[0].raw_value = 1n;
  assert.throws(() => scoreGrowthReport(nonJson), /must be a JSON value or null/);
});

test("enforces at least 80% Class A across outward published findings", () => {
  const value = report();
  // Eight unreferenced metric findings become Class B; the aggregate outward
  // ratio falls below 80% without first changing diagnosis claim classes.
  const classBMetrics = [
    ...value.crossSurface.metrics,
    ...getSurface(value, "reputation").metrics.filter((item) => item.metric_id !== "rating").slice(0, 3),
  ];
  for (const item of classBMetrics) {
    Object.assign(item, {
      evidence_class: "B",
      finding_type: "inference",
      method: "Anchored fixture rubric",
      assumptions: ["Synthetic input remains representative"],
    });
  }
  assert.throws(() => scoreGrowthReport(value), /below required 80%/);
});

test("accepts the inclusive exactly-80% Class A publication boundary", () => {
  const value = report();
  const classBMetrics = [
    ...value.crossSurface.metrics,
    ...getSurface(value, "reputation").metrics.filter((item) => item.metric_id !== "rating").slice(0, 3),
  ];
  classBMetrics.forEach((item) => Object.assign(item, {
    evidence_class: "B",
    finding_type: "inference",
    method: "Anchored fixture rubric",
    assumptions: ["Synthetic input remains representative"],
  }));
  value.humanDiagnosis.problem_inventory.push({
    id: "booking-gap",
    surface: "website",
    title: "Booking path gap",
    evidence_refs: ["website.booking_friction"],
    impact: "The observed path adds avoidable friction.",
    task_refs: ["task-booking-gap"],
    suggested_horizon: "Immediate",
    status: "diagnosed",
  });
  value.humanDiagnosis.remediation_tasks.push({
    ...structuredClone(value.humanDiagnosis.remediation_tasks[0]),
    id: "task-booking-gap",
    problem_refs: ["booking-gap"],
    dependencies: ["task-search-gap"],
    sequence: { order: 2, rationale: "Follow the discovery correction with conversion-path repair." },
  });
  const scored = scoreGrowthReport(value);
  assert.equal(scored.evidence.publishedFindingCount, 40);
  assert.equal(scored.evidence.classACount, 32);
  assert.equal(scored.evidence.classARatio, 0.8);
});

test("requires Class B disclosures with type, method and assumptions", () => {
  const value = report();
  const item = getSurface(value, "search").metrics[0];
  item.evidence_class = "B";
  assert.throws(() => scoreGrowthReport(value), /finding_type/);
});

test("does not allow an outward claim to downgrade Class B evidence to Class A", () => {
  const value = report();
  const evidence = getSurface(value, "search").metrics.find((item) => item.metric_id === "map_visibility");
  Object.assign(evidence, {
    evidence_class: "B",
    finding_type: "inference",
    method: "Fixture inference method",
    assumptions: ["Fixture assumption"],
  });
  value.humanDiagnosis.binding_constraint.evidence_class = "A";
  assert.throws(() => scoreGrowthReport(value), /cannot be A when an evidence reference is Class B/);
});

test("requires exactly three top priorities and one do-not-do", () => {
  const two = report();
  two.humanDiagnosis.top_priorities.pop();
  assert.throws(() => scoreGrowthReport(two), /exactly 3/);

  const noGuardrail = report();
  noGuardrail.humanDiagnosis.do_not_do = null;
  assert.throws(() => scoreGrowthReport(noGuardrail), /do_not_do must be an object/);
});

test("validates the full problem inventory and all evidence references", () => {
  const missingField = report();
  delete missingField.humanDiagnosis.problem_inventory[0].suggested_horizon;
  assert.throws(() => scoreGrowthReport(missingField), /suggested_horizon is required/);

  const badRef = report();
  badRef.humanDiagnosis.problem_inventory[0].evidence_refs = ["search.not_canonical"];
  assert.throws(() => scoreGrowthReport(badRef), /unknown evidence reference/);

  const noProblems = report();
  noProblems.humanDiagnosis.problem_inventory = [];
  assert.throws(() => scoreGrowthReport(noProblems), /non-empty array/);

  const crossSurface = report();
  crossSurface.humanDiagnosis.problem_inventory[0].surface = "cross_surface";
  crossSurface.humanDiagnosis.problem_inventory[0].evidence_refs = ["cross.treatment_presence"];
  assert.equal(scoreGrowthReport(crossSurface).overall.sufficient, true);

  const wrongCrossName = report();
  wrongCrossName.humanDiagnosis.problem_inventory[0].surface = "cross";
  assert.throws(() => scoreGrowthReport(wrongCrossName), /surface is invalid/);
});

test("requires complete bidirectional remediation mappings and auditable execution fields", () => {
  const noTasks = report();
  noTasks.humanDiagnosis.remediation_tasks = [];
  assert.throws(() => scoreGrowthReport(noTasks), /remediation_tasks must be a non-empty array/);

  const missingField = report();
  delete missingField.humanDiagnosis.remediation_tasks[0].acceptance_evidence;
  assert.throws(() => scoreGrowthReport(missingField), /acceptance_evidence must be an array/);

  const badProblemRef = report();
  badProblemRef.humanDiagnosis.remediation_tasks[0].problem_refs = ["not-a-problem"];
  assert.throws(() => scoreGrowthReport(badProblemRef), /unknown reference not-a-problem/);

  const oneWay = report();
  oneWay.humanDiagnosis.problem_inventory[0].task_refs = ["task-search-gap"];
  oneWay.humanDiagnosis.remediation_tasks[0].problem_refs = [];
  assert.throws(() => scoreGrowthReport(oneWay), /problem_refs must not be empty/);

  const cycle = report();
  const second = structuredClone(cycle.humanDiagnosis.remediation_tasks[0]);
  second.id = "task-proof";
  second.sequence = { order: 2, rationale: "Follow the discovery correction." };
  second.dependencies = ["task-search-gap"];
  second.problem_refs = ["search-gap"];
  cycle.humanDiagnosis.remediation_tasks[0].dependencies = ["task-proof"];
  cycle.humanDiagnosis.remediation_tasks.push(second);
  cycle.humanDiagnosis.problem_inventory[0].task_refs.push("task-proof");
  assert.throws(() => scoreGrowthReport(cycle), /dependency cycle/);

  const badPriority = report();
  badPriority.humanDiagnosis.top_priorities[0].problem_refs = ["missing-problem"];
  assert.throws(() => scoreGrowthReport(badPriority), /unknown reference missing-problem/);
});

test("requires complete DIY, alternative-provider and honest CAESTHETIC execution paths", () => {
  const noAlternative = report();
  noAlternative.implementation_paths.other_provider = "";
  assert.throws(() => scoreGrowthReport(noAlternative), /implementation_paths\.other_provider is required/);

  const noOwnership = report();
  delete noOwnership.why_caesthetic.ownership;
  assert.throws(() => scoreGrowthReport(noOwnership), /why_caesthetic\.ownership is required/);
});

test("validates objective strength, binding constraint and strongest surface", () => {
  const badConstraint = report();
  badConstraint.humanDiagnosis.binding_constraint.evidence_refs = [];
  assert.throws(() => scoreGrowthReport(badConstraint), /evidence_refs is required/);

  const badStrongest = report();
  badStrongest.humanDiagnosis.strongest_surface = "cross";
  assert.throws(() => scoreGrowthReport(badStrongest), /Four-Surface id/);
});

test("accepts both real and demo report kinds and rejects any other kind", () => {
  const real = report();
  real.reportKind = "real";
  assert.equal(scoreGrowthReport(real).overall.sufficient, true);
  const invalid = report();
  invalid.reportKind = "internal";
  assert.throws(() => scoreGrowthReport(invalid), /demo or real/);
});

test("validates named competitors and real-report walkthrough state", () => {
  const noCompetitorEvidence = report();
  noCompetitorEvidence.humanDiagnosis.competitors.entries[0].evidence_refs = [];
  assert.throws(() => scoreGrowthReport(noCompetitorEvidence), /evidence_refs is required/);

  const real = report();
  real.reportKind = "real";
  real.humanDiagnosis.walkthrough = { status: "available", url: "https://example.com/private-walkthrough" };
  assert.equal(scoreGrowthReport(real).overall.sufficient, true);

  const invalidWalkthrough = report();
  invalidWalkthrough.humanDiagnosis.walkthrough = { status: "available", url: "not a URL" };
  assert.throws(() => scoreGrowthReport(invalidWalkthrough), /valid URL/);
});

test("requires the complete Competitive Decision Analysis and safe modernization gate", () => {
  const missingMatrix = report();
  delete missingMatrix.humanDiagnosis.competitors.comparison_matrix;
  assert.throws(() => scoreGrowthReport(missingMatrix), /comparison_matrix must be an object/);

  const oneReview = report();
  oneReview.humanDiagnosis.competitors.entries[0].repeated_negative_themes[0].mentions = 1;
  assert.throws(() => scoreGrowthReport(oneReview), /mentions must be an integer of at least 2/);

  const missingDecision = report();
  missingDecision.humanDiagnosis.competitors.decision_summary.differentiate = [];
  assert.throws(() => scoreGrowthReport(missingDecision), /differentiate must be a non-empty array/);

  const unsafeModernization = report();
  unsafeModernization.humanDiagnosis.competitors.market_practice_gap.recommendations[0].specialist_validation = "";
  assert.throws(() => scoreGrowthReport(unsafeModernization), /specialist_validation is required/);
});

test("validates methodology and real calendar dates", () => {
  const noSources = report();
  noSources.methodology.sources = [];
  assert.throws(() => scoreGrowthReport(noSources), /methodology\.sources must not be empty/);

  const impossibleDate = report();
  impossibleDate.methodology.collectedAt = "2026-02-31";
  assert.throws(() => scoreGrowthReport(impossibleDate), /valid calendar date/);

  const badMetricDate = report();
  getSurface(badMetricDate, "search").metrics[0].collected_at = "11 August 2026";
  assert.throws(() => scoreGrowthReport(badMetricDate), /ISO 8601/);
});

test("validates the optional pure Growth Economics publication contract", () => {
  const value = report();
  value.economics = economicsContract();
  assert.equal(validateGrowthEconomicsContract(value.economics), value.economics);
  assert.equal(scoreGrowthReport(value).overall.rawScore, 69);

  const wrongClass = report();
  wrongClass.economics = economicsContract();
  wrongClass.economics.modeled_opportunity.evidence_class = "A";
  assert.throws(() => scoreGrowthReport(wrongClass), /modeled_opportunity\.evidence_class must be B/);

  const assumptionlessEstimate = report();
  assumptionlessEstimate.economics = economicsContract({
    modeled_opportunity: {
      status: "estimate",
      evidence_class: "B",
      label: "Modeled range",
      currency: "USD",
      data_quality: "medium",
      method: "Fixture model",
      assumptions: [],
      low: 1000,
      high: 2000,
    },
  });
  assert.throws(() => scoreGrowthReport(assumptionlessEstimate), /assumptions must not be empty/);
});

test("resolves Growth Economics without changing Growth Score thresholds", () => {
  const value = report();
  value.economics = economicsContract();
  const calculated = {
    status: "insufficient_data",
    currency: "USD",
    dataQuality: "low",
    disclosures: { estimate: "Fixture disclosure" },
    missing: ["treatments", "commercialSchedule"],
    attribution: { status: "complete", agv: 1000, agc: 750 },
    growthBudget: {
      status: "insufficient_data",
      committedGrowthBudget: null,
      fixedManagementFee: null,
      variableGrowthBudget: null,
    },
    performance: { status: "not_activated" },
  };

  const gated = resolveGrowthEconomics(value, calculated);
  assert.equal(scoreGrowthReport(value).overall.rawScore, 69);
  assert.equal(gated.attribution.status, "insufficient_data");
  assert.equal(gated.attribution.evidenceClass, null);
  assert.equal(gated.growthBudget.evidenceClass, "B");
  assert.deepEqual(gated.growthBudget.missing, ["commercialSchedule"]);
  assert.equal(gated.opportunity.evidenceClass, "B");
  assert.equal(gated.performance.evidenceClass, "B");

  Object.assign(value.economics.verification, {
    frozen_price_book: true,
    completed_services: true,
    attribution_evidence: true,
    variable_costs: true,
    human_verified: true,
    verified_at: "2026-08-11T12:00:00Z",
    sources: ["fixture://economics-review"],
  });
  const approved = resolveGrowthEconomics(value, calculated);
  assert.equal(approved.attribution.status, "complete");
  assert.equal(approved.attribution.evidenceClass, "A");
  assert.deepEqual(approved.attribution.sources, ["fixture://economics-review"]);
});
