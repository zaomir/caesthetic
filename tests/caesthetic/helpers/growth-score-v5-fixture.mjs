import {
  CANONICAL_METRICS,
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  JOURNEY_GRAPH_ARTIFACT_VERSION,
  SURFACE_WEIGHTS,
} from "../../../site-caesthetic/assets/js/growth-score-engine.mjs";

export const metricInput = (metric_id, normalized_score = 50, overrides = {}) => ({
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

export const metricSet = (surfaceId, score = 50, overrides = {}) => Object.keys(CANONICAL_METRICS[surfaceId])
  .map((metricId) => metricInput(metricId, score, overrides[metricId]));

export function competitiveFixture(subjectName, competitorName = "Named Competitor A") {
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
    priority_effect: "Confirms the selected Focus Gaps.",
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

export function createGap({
  id,
  title,
  surfaces,
  journey_stage,
  evidence_refs,
  why_it_matters,
  diagnosis_state = "verified_gap",
  sprint_fit = "close_in_30_days",
  extra = {},
} = {}) {
  const longWork = sprint_fit === "start_in_30_days";
  return {
    id,
    title,
    diagnosis_state,
    surfaces,
    journey_stage,
    evidence_refs,
    why_it_matters,
    sprint_fit: { mode: sprint_fit },
    repair_plan: {
      outcome: `${title} is repaired to an observable public state.`,
      diy_steps: [
        "Capture the current public evidence and the owner-approved destination state.",
        "Apply the smallest accurate correction that the evidence supports.",
        "Recheck the same public path and keep the before/after record.",
      ],
      dependencies: [],
      owner_role: "Practice owner or a named operator with access",
      done_when: ["The same public path shows the accepted correction."],
      ...(longWork ? {
        day_30_outcome: "The first public correction is live and the remaining work is scoped.",
        beyond_day_30: "Continue the remaining public-path work after Day 30; it is not Sprint scope by default.",
      } : {}),
    },
    ...extra,
  };
}

export function defaultGapInventory() {
  return [
    createGap({
      id: "search-gap",
      title: "Weak local discovery",
      surfaces: ["search"],
      journey_stage: "discovery",
      evidence_refs: ["search.map_visibility"],
      why_it_matters: "Priority-treatment demand is missed before any booking path can work.",
    }),
    createGap({
      id: "booking-gap",
      title: "Booking path friction",
      surfaces: ["website"],
      journey_stage: "booking",
      evidence_refs: ["website.booking_friction"],
      why_it_matters: "Patients who find the practice still stall before enquiry.",
    }),
    createGap({
      id: "proof-gap",
      title: "Proof loses continuity",
      surfaces: ["social", "website"],
      journey_stage: "trust",
      evidence_refs: ["social.proof_quality"],
      why_it_matters: "Existing clinician proof is not present at the decision point.",
    }),
    createGap({
      id: "freshness-monitor",
      title: "Profile freshness is intermittent",
      surfaces: ["search"],
      journey_stage: "discovery",
      evidence_refs: ["reputation.rating"],
      why_it_matters: "Freshness is worth watching after the discovery leak is closed.",
      diagnosis_state: "monitor",
      sprint_fit: "backlog",
    }),
    createGap({
      id: "response-backlog",
      title: "Review response speed is slower than peers",
      surfaces: ["reputation"],
      journey_stage: "trust",
      evidence_refs: ["reputation.rating"],
      why_it_matters: "Response speed can wait until the discovery leak is closed.",
      sprint_fit: "backlog",
    }),
  ];
}

export function defaultFocusSelection(overrides = {}) {
  return {
    primary_gap_id: "search-gap",
    supporting_gap_ids: ["booking-gap", "proof-gap"],
    selected_by: "Morgan Reed",
    selected_at: "2026-08-11T13:00:00Z",
    rationale: "Discovery is the binding leak; booking and proof continuity are the related 30-day repairs.",
    ...overrides,
  };
}

const integrity = (status, observed_behavior) => ({ status, observed_behavior });
const contextIntegrity = (status, observed_behavior, dimensions = {}) => ({
  status,
  observed_behavior,
  dimensions: Object.fromEntries(["identity", "location", "treatment", "offer", "proof"].map((dimension) => [
    dimension,
    dimensions[dimension] || status,
  ])),
});

export function createJourneyGraphFixture() {
  const source = (id) => ({
    id,
    source: `fixture://${id}`,
    collected_at: "2026-08-11T12:00:00Z",
    method: "Reproducible public-path fixture observation.",
    evidence_class: "A",
    reviewer_status: "approved",
  });
  return {
    artifact_version: JOURNEY_GRAPH_ARTIFACT_VERSION,
    artifact_id: "fixture-journey-graph-v1",
    assessment_status: "assessed",
    max_hops: 3,
    automatic_score_change: false,
    evidence: [source("search-path"), source("website-booking"), source("social-path"), source("reviews-path")],
    nodes: [
      { id: "search-listing", kind: "public_asset", surface: "search", asset_type: "gbp_listing", label: "Maps listing", canonical_destination: "fixture://maps", ownership: "owned", observability: "observed", evidence_refs: ["search-path"] },
      { id: "website-service", kind: "public_asset", surface: "website", asset_type: "service_page", label: "Priority service page", canonical_destination: "fixture://site/service", ownership: "owned", observability: "observed", evidence_refs: ["website-booking"] },
      { id: "social-profile", kind: "public_asset", surface: "social", asset_type: "social_profile", label: "Social profile", canonical_destination: "fixture://social", ownership: "owned", observability: "observed", evidence_refs: ["social-path"] },
      { id: "reviews-listing", kind: "public_asset", surface: "reputation", asset_type: "review_listing", label: "Reviews listing", canonical_destination: "fixture://reviews", ownership: "third_party", observability: "observed", evidence_refs: ["reviews-path"] },
      { id: "lead-intake", kind: "lead_intake", surface: null, asset_type: "lead_intake_boundary", label: "Lead Intake", canonical_destination: null, ownership: "not_applicable", observability: "observed", evidence_refs: [] },
    ],
    edges: [
      {
        id: "search-to-website", from: "search-listing", to: "website-service", expectation: "observed", action_type: "link", exists: true, status: "clean",
        technical_integrity: integrity("clean", "The Maps website action resolves to the owned service page."),
        context_integrity: contextIntegrity("clean", "Identity, location, treatment, offer and proof context are preserved."),
        next_action_available: true, source: "fixture://search-path", collected_at: "2026-08-11T12:00:00Z", evidence_refs: ["search-path"],
        why_it_matters: "A high-intent discovery can continue on an owned destination.", repair_implication: "Protect and periodically recheck the destination.",
      },
      {
        id: "website-to-intake", from: "website-service", to: "lead-intake", expectation: "required", action_type: "book", exists: true, status: "clean",
        technical_integrity: integrity("clean", "The booking action resolves and remains usable."),
        context_integrity: contextIntegrity("clean", "The selected service and location stay visible at intake."),
        next_action_available: true, source: "fixture://website-booking", collected_at: "2026-08-11T12:00:00Z", evidence_refs: ["website-booking"],
        why_it_matters: "The owned path reaches Lead Intake without another public-surface detour.", repair_implication: "Keep this route stable and monitored.",
      },
      {
        id: "social-to-website", from: "social-profile", to: "website-service", expectation: "observed", action_type: "link", exists: true, status: "friction",
        technical_integrity: integrity("clean", "The bio link resolves."),
        context_integrity: contextIntegrity("friction", "Identity and location persist, but treatment and offer context are diluted.", { identity: "clean", location: "clean", treatment: "friction", offer: "friction", proof: "friction" }),
        next_action_available: true, source: "fixture://social-path", collected_at: "2026-08-11T12:00:00Z", evidence_refs: ["social-path"],
        why_it_matters: "A social visitor must reconstruct the service decision on arrival.", repair_implication: "Route the profile to the relevant owned service context.",
      },
      {
        id: "social-to-intake-missing", from: "social-profile", to: "lead-intake", expectation: "required", action_type: "book", exists: false, status: "broken",
        technical_integrity: integrity("broken", "The claimed direct booking route is absent."),
        context_integrity: contextIntegrity("broken", "No destination exists to preserve the selected offer.", { identity: "not_assessed", location: "not_assessed", treatment: "broken", offer: "broken", proof: "not_assessed" }),
        next_action_available: false, source: "fixture://social-path", collected_at: "2026-08-11T12:00:00Z", evidence_refs: ["social-path"],
        why_it_matters: "The expected direct next step cannot be completed.", repair_implication: "Add and verify one truthful direct booking or enquiry action.",
      },
      {
        id: "reviews-to-website", from: "reviews-listing", to: "website-service", expectation: "conditional", action_type: "native_navigation", exists: true, status: "friction",
        technical_integrity: integrity("clean", "The listing can return to the owned site."),
        context_integrity: contextIntegrity("friction", "Business identity persists but the reviewed treatment context is not carried forward.", { identity: "clean", location: "clean", treatment: "friction", offer: "friction", proof: "clean" }),
        next_action_available: true, source: "fixture://reviews-path", collected_at: "2026-08-11T12:00:00Z", evidence_refs: ["reviews-path"],
        why_it_matters: "Trust exists, but the continuation path requires another service search.", repair_implication: "Preserve the relevant service context on the owned destination.",
      },
    ],
    entry_node_ids: ["search-listing", "social-profile", "reviews-listing"],
    lead_intake_node_id: "lead-intake",
    metric_links: [
      { metric_ref: "search.gbp_conversion_readiness", edge_ids: ["search-to-website"], node_ids: ["search-listing"], effect: "evidence_only" },
      { metric_ref: "website.booking_friction", edge_ids: ["website-to-intake"], node_ids: ["website-service"], effect: "evidence_only" },
      { metric_ref: "social.profile_to_booking", edge_ids: ["social-to-website", "social-to-intake-missing"], node_ids: ["social-profile"], effect: "evidence_only" },
      { metric_ref: "cross.conversion_continuity", edge_ids: ["search-to-website", "website-to-intake", "reviews-to-website"], node_ids: [], effect: "evidence_only" },
      { metric_ref: "cross.proof_continuity", edge_ids: ["social-to-website", "reviews-to-website"], node_ids: [], effect: "evidence_only" },
    ],
    representative_journeys: [
      { id: "strongest-search", label: "Strongest observable path", kind: "strongest", prospect_slot: 0, edge_ids: ["search-to-website", "website-to-intake"] },
      { id: "primary-social-break", label: "Primary constraint path", kind: "primary_constraint", prospect_slot: 1, edge_ids: ["social-to-intake-missing"] },
      { id: "supporting-review", label: "Supporting continuity path", kind: "supporting", prospect_slot: 2, edge_ids: ["reviews-to-website", "website-to-intake"] },
    ],
    review: {
      status: "approved",
      reviewed_by: "Morgan Reed",
      reviewed_at: "2026-08-11T13:00:00Z",
      entity_resolution_approved: true,
      expectation_policy_approved: true,
      semantic_integrity_approved: true,
      severity_approved: true,
    },
  };
}

export function createV5Report(scores = { search: 40, website: 60, social: 80, reputation: 100, cross: 5 }, overrides = {}) {
  const practiceName = overrides.practice?.name || "Fixture Practice";
  const surfaces = Object.keys(SURFACE_WEIGHTS).map((id) => ({
    id,
    summary: `${id} fixture summary.`,
    owner_card: { strength: `${id} strength`, problem: `${id} problem`, priority: "MEDIUM" },
    metrics: metricSet(id, scores[id]),
  }));
  return {
    schemaVersion: 5,
    templateVersion: GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
    reportState: "approved_report",
    reportVersion: "fixture-report/1.0.0",
    verifiedFactSetVersion: "fixture-facts/1.0.0",
    reportKind: "demo",
    reportContext: {
      vertical_context: "aesthetic_practice",
      report_locale: "en",
      vertical_source: "human_resolved",
      locale_source: "user_selected",
    },
    practice: { name: practiceName, location: "Fictional market", preparedAt: "2026-08-11", preparedFor: "Fixture" },
    executiveSummary: "Fixture diagnosis for schema v5 publication gates.",
    surfaces,
    crossSurface: { metrics: metricSet("cross", scores.cross), summary: "Cross-surface fixture summary." },
    humanDiagnosis: {
      reviewer_status: "approved",
      reviewer: { name: "Morgan Reed", approved_at: "2026-08-11T13:00:00Z" },
      objective_strength: { title: "Strong reputation proof", evidence_refs: ["reputation.rating"] },
      strongest_surface: "reputation",
      binding_constraint: {
        title: "Search constraint",
        statement: "Local discovery is the binding public leak.",
        demand_stage: "discovery",
        evidence_refs: ["search.map_visibility"],
        gap_ref: "search-gap",
      },
      current_state: {
        strengths: ["Reputation proof is already usable."],
        constraint_label: "Discovery leak",
        constraint_detail: "High-intent local demand does not reliably encounter the practice.",
        priority_line: "Close the Search discovery gap first.",
      },
      gap_inventory: defaultGapInventory(),
      focus_selection: defaultFocusSelection(),
      do_not_do: { title: "Do not increase paid media before fixing the measured constraint.", evidence_refs: ["search.map_visibility"], rationale: "More traffic would amplify the same discovery leak.", revisit_after: ["Geo-grid cells recover"] },
      competitors: competitiveFixture(practiceName),
      walkthrough: { status: "pending", url: null, placeholder: "Human walkthrough recording pending." },
      coordination_burden: { diagnosed_issues: 4, high_priority_fixes: 3, systems_involved: 2, dependencies: 1, specialist_roles: 2 },
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
    ...overrides,
  };
}

const SIXTEEN_GAP_SPECS = [
  { id: "search-map-coverage", title: "Geo-grid coverage is weak", surfaces: ["search"], journey_stage: "discovery", evidence_refs: ["search.map_visibility"], why_it_matters: "Priority-treatment demand is missed first.", sprint_fit: "close_in_30_days" },
  { id: "booking-step-friction", title: "Booking path stalls", surfaces: ["website"], journey_stage: "booking", evidence_refs: ["website.booking_friction"], why_it_matters: "Found demand still fails to enquire.", sprint_fit: "close_in_30_days" },
  { id: "proof-continuity-gap", title: "Proof drops before the decision", surfaces: ["social"], journey_stage: "trust", evidence_refs: ["social.proof_quality"], why_it_matters: "Existing clinician proof is not present at the decision point.", sprint_fit: "close_in_30_days" },
  { id: "identity-rebuild", title: "Public identity needs a longer rebuild", surfaces: ["cross_surface"], journey_stage: "enquiry", evidence_refs: ["cross.identity_coherence"], why_it_matters: "Conflicting identity fields will take more than 30 days to finish.", sprint_fit: "start_in_30_days" },
  { id: "search-freshness-watch", title: "Profile freshness is intermittent", surfaces: ["search"], journey_stage: "discovery", evidence_refs: ["search.freshness"], why_it_matters: "Watch after the discovery leak is closed.", diagnosis_state: "monitor", sprint_fit: "backlog" },
  { id: "search-branded-backlog", title: "Branded search control is incomplete", surfaces: ["search"], journey_stage: "discovery", evidence_refs: ["search.branded_search_control"], why_it_matters: "Brand SERP work is real but not this month.", sprint_fit: "backlog" },
  { id: "website-clarity-backlog", title: "Treatment pages omit logistics", surfaces: ["website"], journey_stage: "enquiry", evidence_refs: ["website.treatment_clarity"], why_it_matters: "Page detail can wait until booking friction is gone.", sprint_fit: "backlog" },
  { id: "website-mobile-backlog", title: "Mobile performance is slower than peers", surfaces: ["website"], journey_stage: "booking", evidence_refs: ["website.mobile_performance"], why_it_matters: "Speed work is verified but not the binding leak.", sprint_fit: "backlog" },
  { id: "social-recency-watch", title: "Social cadence is uneven", surfaces: ["social"], journey_stage: "trust", evidence_refs: ["social.recency"], why_it_matters: "Cadence is worth watching, not starting now.", diagnosis_state: "monitor", sprint_fit: "backlog" },
  { id: "reputation-velocity-backlog", title: "90-day review velocity is thin", surfaces: ["reputation"], journey_stage: "trust", evidence_refs: ["reputation.review_velocity_90d"], why_it_matters: "Velocity recovery is a later reputation programme.", sprint_fit: "backlog" },
  { id: "reputation-response-backlog", title: "Review replies lag", surfaces: ["reputation"], journey_stage: "trust", evidence_refs: ["reputation.response_speed"], why_it_matters: "Reply speed is verified and deferred.", sprint_fit: "backlog" },
  { id: "cross-positioning-backlog", title: "Positioning is not coherent across surfaces", surfaces: ["cross_surface"], journey_stage: "discovery", evidence_refs: ["cross.positioning_coherence"], why_it_matters: "Positioning cleanup is not the first 30-day repair.", sprint_fit: "backlog" },
  { id: "gbp-conversion-unknown", title: "GBP conversion readiness is unproven", surfaces: ["search"], journey_stage: "enquiry", evidence_refs: [], why_it_matters: "No approved conversion-field evidence exists yet.", diagnosis_state: "insufficient_evidence", sprint_fit: "backlog" },
  { id: "mystery-shopper-unknown", title: "Mystery Shopper was not run", surfaces: ["website"], journey_stage: "booking", evidence_refs: [], why_it_matters: "The capability exists but was not used.", diagnosis_state: "insufficient_evidence", sprint_fit: "backlog" },
  { id: "social-offer-watch", title: "Local offer clarity is thin", surfaces: ["social"], journey_stage: "enquiry", evidence_refs: ["social.local_offer_clarity"], why_it_matters: "Offer copy can be monitored after proof continuity.", diagnosis_state: "monitor", sprint_fit: "backlog" },
  { id: "reputation-rating-working", title: "Public rating is already usable", surfaces: ["reputation"], journey_stage: "trust", evidence_refs: ["reputation.rating"], why_it_matters: "This strength should be defended, not repaired.", diagnosis_state: "working", sprint_fit: "backlog" },
];

export function createSixteenToFourReport() {
  const report = createV5Report();
  report.reportVersion = "focus-selection-16-to-4/1.0.0";
  report.verifiedFactSetVersion = "focus-selection-16-to-4-facts/1.0.0";
  report.executiveSummary = "Sixteen confirmed or deferred holes; a named reviewer selected exactly three.";
  report.humanDiagnosis.gap_inventory = SIXTEEN_GAP_SPECS.map((spec) => createGap(spec));
  report.humanDiagnosis.focus_selection = defaultFocusSelection({
    primary_gap_id: "search-map-coverage",
    supporting_gap_ids: ["booking-step-friction", "proof-continuity-gap"],
    rationale: "Discovery is the binding leak; booking and proof are the two supporting repairs that can close in 30 days.",
  });
  report.humanDiagnosis.binding_constraint.gap_ref = "search-map-coverage";
  report.humanDiagnosis.coordination_burden = {
    diagnosed_issues: 16,
    high_priority_fixes: 3,
    systems_involved: 4,
    dependencies: 3,
    specialist_roles: 3,
  };
  return report;
}
