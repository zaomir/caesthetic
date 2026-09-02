#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import {
  CANONICAL_METRICS,
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  GROWTH_SCORE_SCHEMA_VERSION,
  JOURNEY_GRAPH_ARTIFACT_VERSION,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

export { GROWTH_SCORE_REPORT_TEMPLATE_VERSION };
export const LEGACY_GROWTH_SCORE_V4_TEMPLATE_VERSION = "growth-score-report-template/4.0.0";

const labels = Object.freeze({
  search: "Search",
  website: "Website",
  social: "Social",
  reputation: "Reputation",
  cross: "Cross-Surface",
});

const sentenceCase = (value) => value
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function createUnavailableMetricTemplate(surfaceId, metricId) {
  if (!CANONICAL_METRICS[surfaceId]?.[metricId]) {
    throw new TypeError(`Unknown canonical Growth Score metric: ${surfaceId}.${metricId}`);
  }
  return {
    metric_id: metricId,
    label: sentenceCase(metricId),
    raw_value: null,
    normalized_score: null,
    evidence_class: "A",
    source: null,
    collected_at: null,
    reviewer_status: "pending",
    unavailable_reason: "Insufficient evidence — replace only after source capture and named-human approval.",
  };
}

export function createMetricSetTemplate(surfaceId) {
  const definitions = CANONICAL_METRICS[surfaceId];
  if (!definitions) throw new TypeError(`Unknown Growth Score surface: ${surfaceId}`);
  return Object.keys(definitions).map((metricId) => createUnavailableMetricTemplate(surfaceId, metricId));
}

const createSurface = (id) => ({
  id,
  summary: `Insufficient evidence — replace with the approved ${labels[id]} summary.`,
  owner_card: {
    strength: `Insufficient evidence — add one approved ${labels[id]} strength.`,
    problem: `Insufficient evidence — add one approved ${labels[id]} problem or monitoring statement.`,
    priority: "MEDIUM",
  },
  metrics: createMetricSetTemplate(id),
});

const insufficientCell = (surface) => ({
  status: "insufficient_evidence",
  finding: `Insufficient evidence — collect comparable ${labels[surface]} evidence.`,
  evidence_refs: [],
  limitation: "No approved comparable evidence has been inserted into this template slot.",
});

const createCompetitorSlot = (number) => ({
  id: `__COMPETITOR_${number}_ID__`,
  name: `__COMPETITOR_${number}_NAME__`,
  competitor_type: "local",
  selection_reason: "__PATIENT_CHOICE_SELECTION_REASON__",
  branch_scope: "__BRANCH_SCOPE__",
  patient_choice_reason: "__PATIENT_CHOICE_REASON__",
  observable_advantage: "__OBSERVABLE_ADVANTAGE_OR_INSUFFICIENT_EVIDENCE__",
  observable_gap: "__OBSERVABLE_GAP_OR_INSUFFICIENT_EVIDENCE__",
  repeat: "__DEFENSIBLE_PATTERN_TO_REPEAT__",
  improve: "__HOW_TO_IMPROVE_WITHOUT_COPYING__",
  do_not_copy: "__PATTERN_NOT_TO_COPY__",
  strategic_implication: "__STRATEGIC_IMPLICATION__",
  constraint_effect: "__EFFECT_ON_BINDING_CONSTRAINT__",
  priority_effect: "__EFFECT_ON_TOP_3__",
  modernization_implication: "__KEEP_EVALUATE_PILOT_REPLACE_OR_DO_NOT_ADOPT_CONTEXT__",
  strengths: ["__OBSERVABLE_STRENGTH__"],
  weaknesses_or_risks: ["__OBSERVABLE_RISK_OR_LIMITATION__"],
  limitations: "Insufficient evidence until the named sources, window and comparable sample are inserted.",
  sources: [],
  surface_evidence: {
    search: insufficientCell("search"),
    website: insufficientCell("website"),
    social: insufficientCell("social"),
    reputation: insufficientCell("reputation"),
  },
  repeated_positive_themes: [],
  repeated_negative_themes: [],
  evidence_refs: [],
});

const createPrioritySlot = (number) => ({
  id: `PR${number}`,
  title: `__TOP_${number}_TITLE__`,
  evidence_refs: ["__SURFACE.METRIC_ID__"],
  impact: "__EVIDENCE_BACKED_IMPACT__",
  problem_refs: [`P${number}`],
  task_refs: [`T${number}`],
  why_now: "__WHY_NOW__",
  expected_effect: "__EXPECTED_EFFECT_WITHOUT_GUARANTEE__",
  complexity: "__LOW_MEDIUM_OR_HIGH__",
});

const createProblemSlot = (number) => ({
  id: `P${number}`,
  surface: "__SEARCH_WEBSITE_SOCIAL_REPUTATION_OR_CROSS_SURFACE__",
  title: "__PROBLEM_TITLE__",
  evidence_refs: ["__SURFACE.METRIC_ID__"],
  impact: "__EVIDENCE_BACKED_IMPACT__",
  task_refs: [`T${number}`],
  suggested_horizon: "__HORIZON__",
  status: "diagnosed",
  priority: "__HIGH_MEDIUM_OR_LOW__",
  complexity: "__LOW_MEDIUM_OR_HIGH__",
});

const createTaskSlot = (number) => ({
  id: `T${number}`,
  problem_refs: [`P${number}`],
  outcome: "__OUTCOME__",
  steps: ["__STEP_1__", "__STEP_2__"],
  evidence_refs: ["__SURFACE.METRIC_ID__"],
  prerequisites_access: ["__NEEDED_ACCESS_OR_APPROVAL__"],
  dependencies: [],
  sequence: { order: number, rationale: "__SEQUENCE_RATIONALE__" },
  owner_role: "__OWNER_ROLE__",
  effort_complexity: "__EFFORT_AND_COMPLEXITY__",
  implementation_risk: "__IMPLEMENTATION_RISK__",
  horizon: "__HORIZON__",
  acceptance_evidence: ["__DONE_WHEN_EVIDENCE__"],
  next_action: "__NEXT_ACTION__",
});

const createGapSlot = (number) => ({
  id: `G${number}`,
  title: `__GAP_${number}_TITLE__`,
  diagnosis_state: "insufficient_evidence",
  surfaces: ["__SEARCH_WEBSITE_SOCIAL_REPUTATION_OR_CROSS_SURFACE__"],
  journey_stage: "__DISCOVERY_TRUST_ENQUIRY_BOOKING_OR_TREATMENT__",
  evidence_refs: [],
  why_it_matters: "Insufficient evidence — replace only after the relevant public evidence is approved.",
  sprint_fit: { mode: "backlog" },
  repair_plan: {
    outcome: `__GAP_${number}_OBSERVABLE_OUTCOME__`,
    diy_steps: ["__DIY_STEP_1__", "__DIY_STEP_2__"],
    dependencies: [],
    owner_role: "__OWNER_ROLE__",
    done_when: ["__ACCEPTANCE_EVIDENCE__"],
  },
});

export function createJourneyGraphTemplate() {
  return {
    artifact_version: JOURNEY_GRAPH_ARTIFACT_VERSION,
    artifact_id: "__CASE_ID__-journey-graph-v1",
    assessment_status: "not_assessed",
    max_hops: 3,
    automatic_score_change: false,
    evidence: [],
    nodes: [],
    edges: [],
    entry_node_ids: [],
    lead_intake_node_id: null,
    metric_links: [],
    representative_journeys: [],
    review: {
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      entity_resolution_approved: false,
      expectation_policy_approved: false,
      semantic_integrity_approved: false,
      severity_approved: false,
    },
  };
}

export function approveJourneyGraphNotAssessed(graph, { artifactId, reviewedBy, reviewedAt }) {
  if (!graph || typeof graph !== "object") throw new TypeError("journeyGraph template is required");
  return {
    ...graph,
    artifact_id: artifactId,
    assessment_status: "not_assessed",
    evidence: [],
    nodes: [],
    edges: [],
    entry_node_ids: [],
    lead_intake_node_id: null,
    metric_links: [],
    representative_journeys: [],
    review: {
      status: "approved",
      reviewed_by: reviewedBy,
      reviewed_at: reviewedAt,
      entity_resolution_approved: true,
      expectation_policy_approved: true,
      semantic_integrity_approved: true,
      severity_approved: true,
    },
  };
}

export function createLegacyGrowthScoreV4ReportTemplate() {
  const competitors = [1, 2, 3].map(createCompetitorSlot);
  return {
    schemaVersion: 4,
    reportState: "draft",
    reportVersion: "__REPORT_VERSION__",
    verifiedFactSetVersion: "__VERIFIED_FACT_SET_VERSION__",
    reportKind: "real",
    templateVersion: LEGACY_GROWTH_SCORE_V4_TEMPLATE_VERSION,
    reportContext: {
      vertical_context: "unresolved",
      report_locale: "en",
      vertical_source: null,
      locale_source: null,
    },
    disclosure: "__TRUTHFUL_PRIVACY_OR_TEST_DISCLOSURE__",
    practice: {
      name: "__PRACTICE_NAME__",
      location: "__CITY_STATE_COUNTRY__",
      preparedAt: "__YYYY_MM_DD__",
      preparedFor: "__PREPARED_FOR__",
    },
    executiveSummary: "__HUMAN_APPROVED_EXECUTIVE_SUMMARY__",
    surfaces: ["search", "website", "social", "reputation"].map(createSurface),
    crossSurface: {
      summary: "Insufficient evidence — replace with the approved Cross-Surface summary.",
      metrics: createMetricSetTemplate("cross"),
    },
    humanDiagnosis: {
      reviewer_status: "pending",
      reviewer: { name: null, approved_at: null },
      objective_strength: { title: "__OBJECTIVE_STRENGTH__", evidence_refs: ["__SURFACE.METRIC_ID__"] },
      strongest_surface: "__SEARCH_WEBSITE_SOCIAL_OR_REPUTATION__",
      binding_constraint: {
        title: "__BINDING_CONSTRAINT__",
        statement: "__PUBLIC_EVIDENCE_DIAGNOSIS_WITHOUT_INTERNAL_CAUSAL_CLAIM__",
        demand_stage: "__DISCOVERY_TRUST_ENQUIRY_BOOKING_OR_TREATMENT__",
        evidence_refs: ["__SURFACE.METRIC_ID__"],
      },
      current_state: {
        strengths: ["__APPROVED_STRENGTH__"],
        constraint_label: "__CONSTRAINT_LABEL__",
        constraint_detail: "__CONSTRAINT_DETAIL__",
        priority_line: "__FIRST_PRIORITY_LINE__",
      },
      top_priorities: [1, 2, 3].map(createPrioritySlot),
      problem_inventory: [1, 2, 3].map(createProblemSlot),
      remediation_tasks: [1, 2, 3].map(createTaskSlot),
      do_not_do: {
        title: "__ONE_DO_NOT_FUND_YET__",
        rationale: "__EVIDENCE_BACKED_RATIONALE__",
        evidence_refs: ["__SURFACE.METRIC_ID__"],
        revisit_after: ["__REVISIT_CONDITION__"],
      },
      competitors: {
        status: "applicable",
        selection_method: "__NAMED_PATIENT_CHOICE_SET_SELECTION_METHOD__",
        sample_limitations: "__COMPARABLE_SAMPLE_LIMITATIONS__",
        comparison_window: { start: "__YYYY_MM_DD__", end: "__YYYY_MM_DD__" },
        review_sample_rule: "__DISCLOSED_WINDOW_SAMPLE_AND_RECURRENCE_RULE__",
        branch_scope: "__SUBJECT_BRANCH_SCOPE__",
        entries: competitors,
        comparison_matrix: {
          subject_name: "__PRACTICE_NAME__",
          rows: [
            { entity_ref: "subject", entity_name: "__PRACTICE_NAME__", entity_type: "subject", search: "Insufficient evidence", website: "Insufficient evidence", social: "Insufficient evidence", reputation: "Insufficient evidence", evidence_refs: [] },
            ...competitors.map((entry) => ({ entity_ref: entry.id, entity_name: entry.name, entity_type: "competitor", search: "Insufficient evidence", website: "Insufficient evidence", social: "Insufficient evidence", reputation: "Insufficient evidence", evidence_refs: [] })),
          ],
        },
        decision_summary: {
          defend: [], close: [], differentiate: [], do_not_copy: [],
        },
        market_practice_gap: {
          status: "insufficient_evidence",
          reason: "No approved Market Practice Gap evidence has been inserted.",
          recommendations: [],
        },
      },
      walkthrough: {
        status: "pending",
        url: null,
        placeholder: "Valerie Petra walkthrough pending. No recording is implied until an approved human video exists.",
      },
      coordination_burden: {
        diagnosed_issues: null,
        high_priority_fixes: null,
        systems_involved: null,
        dependencies: null,
        specialist_roles: null,
      },
      roadmap_preview: {
        weeks: [
          { label: "Days 1–7", title: "__ILLUSTRATIVE_SEQUENCE_1__" },
          { label: "Days 8–21", title: "__ILLUSTRATIVE_SEQUENCE_2__" },
          { label: "Days 22–30", title: "__ILLUSTRATIVE_SEQUENCE_3__" },
        ],
        disclaimer: "Illustrative sequencing only. It is not purchased scope, a delivery promise or a results guarantee.",
      },
    },
    implementation_paths: {
      diy: "Use the evidence and complete task plan in-house.",
      other_provider: "Give the evidence and complete task plan to another qualified provider.",
      defer: "Defer implementation while preserving evidence, limitations and revisit conditions.",
      caesthetic: "Ask CAESTHETIC to scope selected work separately after the report.",
    },
    why_caesthetic: {
      evidence_advantage: "__EVIDENCE_ASSEMBLY_ADVANTAGE__",
      coordination_advantage: "__DEPENDENCY_AND_COORDINATION_ADVANTAGE__",
      sprint_boundary: "No task is automatically included; written Sprint scope is confirmed separately.",
      ownership: "The report, evidence and task plan may be used without CAESTHETIC.",
    },
    methodology: {
      sources: [],
      collectedAt: "__YYYY_MM_DD__",
      competitorSelection: "__COMPETITOR_SELECTION_METHOD__",
      limitations: "__UNAVAILABLE_EVIDENCE_AND_METHOD_LIMITATIONS__",
    },
    estimates: [],
  };
}

export function createGrowthScoreReportTemplate() {
  const report = createLegacyGrowthScoreV4ReportTemplate();
  report.schemaVersion = GROWTH_SCORE_SCHEMA_VERSION;
  report.templateVersion = GROWTH_SCORE_REPORT_TEMPLATE_VERSION;
  report.humanDiagnosis.binding_constraint.gap_ref = "__PRIMARY_GAP_ID__";
  delete report.humanDiagnosis.top_priorities;
  delete report.humanDiagnosis.problem_inventory;
  delete report.humanDiagnosis.remediation_tasks;
  delete report.humanDiagnosis.roadmap_preview;
  report.humanDiagnosis.gap_inventory = [1, 2, 3].map(createGapSlot);
  report.humanDiagnosis.focus_selection = {
    primary_gap_id: null,
    supporting_gap_ids: [],
    selected_by: null,
    selected_at: null,
    rationale: "Pending named-human Focus Selection after the complete Gap Inventory is reviewed.",
  };
  report.journeyGraph = createJourneyGraphTemplate();
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.stdout.write(`${JSON.stringify(createGrowthScoreReportTemplate(), null, 2)}\n`);
}
