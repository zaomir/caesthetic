import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_METRICS,
  CANONICAL_METRIC_WEIGHTS,
  EvidenceIncompleteError,
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  HUMAN_REVIEW_METRICS,
  REGISTERED_HUMAN_REVIEWER_MONONYMS,
  resolveGrowthEconomics,
  scoreGrowthReport,
  SURFACE_WEIGHTS,
  validateFocusSelectionContract,
  validateGrowthEconomicsContract,
  validateGrowthScoreReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { createGap, createV5Report } from "./helpers/growth-score-v5-fixture.mjs";

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
  return createV5Report(scores);
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

test("publication is v5 approved-report only with named human and frozen fact-set versions", () => {
  const valid = report();
  assert.equal(validateGrowthScoreReport(valid).overall.sufficient, true);

  const draft = report();
  draft.reportState = "draft";
  assert.throws(() => scoreGrowthReport(draft), /drafts cannot publish/);

  const oldSchema = report();
  oldSchema.schemaVersion = 4;
  assert.throws(() => scoreGrowthReport(oldSchema), /schemaVersion must be 5/);

  const missingTemplate = report();
  delete missingTemplate.templateVersion;
  assert.throws(() => scoreGrowthReport(missingTemplate), /templateVersion must be growth-score-report-template\/5\.1\.0/);

  const mismatchedTemplate = report();
  mismatchedTemplate.templateVersion = "growth-score-report-template/4.1.0";
  assert.throws(() => scoreGrowthReport(mismatchedTemplate), /templateVersion must be growth-score-report-template\/5\.1\.0/);

  assert.equal(valid.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);

  const missingContext = report();
  delete missingContext.reportContext;
  assert.throws(() => scoreGrowthReport(missingContext), /reportContext is required/);

  const unresolvedVertical = report();
  unresolvedVertical.reportContext.vertical_context = "unresolved";
  assert.throws(() => scoreGrowthReport(unresolvedVertical), /reportContext\.vertical_context/);

  const unapprovedVertical = report();
  unapprovedVertical.reportContext.vertical_context = "generic_public_business";
  assert.throws(() => scoreGrowthReport(unapprovedVertical), /reportContext\.vertical_context/);

  const unsupportedLocale = report();
  unsupportedLocale.reportContext.report_locale = "de";
  assert.throws(() => scoreGrowthReport(unsupportedLocale), /reportContext\.report_locale/);

  const unnamed = report();
  unnamed.humanDiagnosis.reviewer.name = "AI assistant";
  assert.throws(() => scoreGrowthReport(unnamed), /named human/);

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
    ...getSurface(value, "reputation").metrics.filter((item) => item.metric_id !== "rating").slice(0, 4),
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

test("requires one do-not-do and rejects leftover v4 diagnosis fields", () => {
  const noGuardrail = report();
  noGuardrail.humanDiagnosis.do_not_do = null;
  assert.throws(() => scoreGrowthReport(noGuardrail), /do_not_do must be an object/);

  const leftover = report();
  leftover.humanDiagnosis.top_priorities = [];
  assert.throws(() => scoreGrowthReport(leftover), /top_priorities is removed/);
});

test("validates the full gap inventory and all evidence references", () => {
  const missingField = report();
  delete missingField.humanDiagnosis.gap_inventory[0].why_it_matters;
  assert.throws(() => scoreGrowthReport(missingField), /why_it_matters is required/);

  const badRef = report();
  badRef.humanDiagnosis.gap_inventory[0].evidence_refs = ["search.not_canonical"];
  assert.throws(() => scoreGrowthReport(badRef), /unknown evidence reference/);

  const noGaps = report();
  noGaps.humanDiagnosis.gap_inventory = [];
  assert.throws(() => scoreGrowthReport(noGaps), /evidence_incomplete|non-empty array/);

  const crossSurface = report();
  crossSurface.humanDiagnosis.gap_inventory[0].surfaces = ["cross_surface"];
  crossSurface.humanDiagnosis.gap_inventory[0].evidence_refs = ["cross.treatment_presence"];
  assert.equal(scoreGrowthReport(crossSurface).overall.sufficient, true);

  const wrongCrossName = report();
  wrongCrossName.humanDiagnosis.gap_inventory[0].surfaces = ["cross"];
  assert.throws(() => scoreGrowthReport(wrongCrossName), /surfaces\[0\] is invalid/);
});

test("requires Focus Gap DIY steps, done_when and binding-constraint alignment", () => {
  const noDiy = report();
  noDiy.humanDiagnosis.gap_inventory[0].repair_plan.diy_steps = [];
  assert.throws(() => scoreGrowthReport(noDiy), /diy_steps must not be empty/);

  const noDone = report();
  delete noDone.humanDiagnosis.gap_inventory[0].repair_plan.done_when;
  assert.throws(() => scoreGrowthReport(noDone), /done_when must be an array/);

  const mismatch = report();
  mismatch.humanDiagnosis.binding_constraint.gap_ref = "booking-gap";
  assert.throws(() => scoreGrowthReport(mismatch), /gap_ref must equal focus_selection.primary_gap_id/);
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

test("requires canonical vertical_context and report_locale values", () => {
  const valid = report();
  assert.doesNotThrow(() => scoreGrowthReport(valid));

  const badVertical = report();
  badVertical.reportContext.vertical_context = "medical_spa_copy";
  assert.throws(() => scoreGrowthReport(badVertical), /vertical_context must be one of/);

  const badLocale = report();
  badLocale.reportContext.report_locale = "de";
  assert.throws(() => scoreGrowthReport(badLocale), /report_locale must be one of/);
});

test("translated evidence preserves original text, source language and translation label", () => {
  const valid = report();
  const metric = valid.surfaces[0].metrics[0];
  metric.original_text = "Оригінальний текст джерела";
  metric.source_language = "uk";
  metric.translated_text = "Original source text";
  metric.translation_note = "CAESTHETIC translation; original retained.";
  assert.doesNotThrow(() => scoreGrowthReport(valid));

  const missingOriginal = report();
  missingOriginal.surfaces[0].metrics[0].translated_text = "Translated only";
  assert.throws(() => scoreGrowthReport(missingOriginal), /original_text is required/);
});

test("publication rejects guarantees and selective review routing", () => {
  const guaranteed = report();
  guaranteed.executiveSummary = "We guarantee revenue.";
  assert.throws(() => scoreGrowthReport(guaranteed), /prohibited guarantee or selective review-routing/);

  const gated = report();
  gated.implementation_paths.diy = "Send only happy patients to Google reviews.";
  assert.throws(() => scoreGrowthReport(gated), /prohibited guarantee or selective review-routing/);
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

test("Focus Selection rejects two, five, unproven, backlog and two long initiatives", () => {
  const two = report();
  two.humanDiagnosis.focus_selection.supporting_gap_ids = ["booking-gap"];
  assert.throws(() => scoreGrowthReport(two), /exactly 2 items|exactly 3/);

  const five = report();
  five.humanDiagnosis.gap_inventory.push(createGap({
    id: "extra-verified",
    title: "Extra verified gap",
    surfaces: ["website"],
    journey_stage: "enquiry",
    evidence_refs: ["website.treatment_clarity"],
    why_it_matters: "Extra verified finding.",
  }));
  five.humanDiagnosis.focus_selection.supporting_gap_ids = ["booking-gap", "proof-gap", "response-backlog", "extra-verified"];
  assert.throws(() => scoreGrowthReport(five), /exactly 2 items|exactly 3/);

  const unproven = report();
  unproven.humanDiagnosis.gap_inventory[0].diagnosis_state = "insufficient_evidence";
  unproven.humanDiagnosis.gap_inventory[0].sprint_fit.mode = "backlog";
  assert.throws(() => scoreGrowthReport(unproven), /verified_gap|evidence_incomplete|cannot be selected/);

  const backlogFocus = report();
  backlogFocus.humanDiagnosis.gap_inventory[1].sprint_fit.mode = "backlog";
  assert.throws(() => scoreGrowthReport(backlogFocus), /backlog cannot enter Focus Selection/);

  const twoLong = report();
  twoLong.humanDiagnosis.gap_inventory.push(createGap({
    id: "extra-close",
    title: "Extra closeable gap",
    surfaces: ["website"],
    journey_stage: "enquiry",
    evidence_refs: ["website.treatment_clarity"],
    why_it_matters: "Extra closeable finding.",
  }));
  twoLong.humanDiagnosis.gap_inventory[0].sprint_fit.mode = "start_in_30_days";
  twoLong.humanDiagnosis.gap_inventory[0].repair_plan.day_30_outcome = "Baseline exists.";
  twoLong.humanDiagnosis.gap_inventory[0].repair_plan.beyond_day_30 = "Continue later.";
  twoLong.humanDiagnosis.gap_inventory[1].sprint_fit.mode = "start_in_30_days";
  twoLong.humanDiagnosis.gap_inventory[1].repair_plan.day_30_outcome = "First page ships.";
  twoLong.humanDiagnosis.gap_inventory[1].repair_plan.beyond_day_30 = "Continue later.";
  twoLong.humanDiagnosis.focus_selection.supporting_gap_ids = ["booking-gap", "proof-gap"];
  assert.throws(() => scoreGrowthReport(twoLong), /at least two close_in_30_days|at most one start_in_30_days/);
});

test("score does not automatically choose Focus Gaps", () => {
  const lowScore = report({ search: 10, website: 90, social: 90, reputation: 90, cross: 80 });
  const highSearch = report({ search: 90, website: 10, social: 10, reputation: 10, cross: 10 });
  assert.deepEqual(
    lowScore.humanDiagnosis.focus_selection,
    highSearch.humanDiagnosis.focus_selection,
  );
  assert.equal(scoreGrowthReport(lowScore).surfaces.search.rawScore < scoreGrowthReport(highSearch).surfaces.search.rawScore, true);
  const evidenceIndex = new Map([
    ["search.map_visibility", { evidence_class: "A", raw_value: "x", normalized_score: 10, reviewer_status: "approved" }],
    ["website.booking_friction", { evidence_class: "A", raw_value: "x", normalized_score: 90, reviewer_status: "approved" }],
    ["social.proof_quality", { evidence_class: "A", raw_value: "x", normalized_score: 90, reviewer_status: "approved" }],
    ["search.freshness", { evidence_class: "A", raw_value: "x", normalized_score: 40, reviewer_status: "approved" }],
    ["reputation.response_speed", { evidence_class: "A", raw_value: "x", normalized_score: 40, reviewer_status: "approved" }],
  ]);
  assert.doesNotThrow(() => validateFocusSelectionContract(lowScore.humanDiagnosis, evidenceIndex));
});

test("fewer than three verified gaps is evidence_incomplete and cannot be approved", () => {
  const incomplete = report();
  incomplete.humanDiagnosis.gap_inventory = incomplete.humanDiagnosis.gap_inventory.slice(0, 2);
  incomplete.humanDiagnosis.focus_selection.supporting_gap_ids = ["booking-gap"];
  assert.throws(() => scoreGrowthReport(incomplete), EvidenceIncompleteError);
  assert.throws(() => scoreGrowthReport(incomplete), /evidence_incomplete/);
});
