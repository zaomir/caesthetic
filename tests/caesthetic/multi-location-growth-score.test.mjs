import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  approveDecisionViewsNotAssessed,
  createDecisionViewsTemplate,
  createMultiLocationGrowthScoreReportTemplate,
  MULTI_LOCATION_GROWTH_SCORE_LEGACY_PROFILE_VERSION,
  MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION,
} from "../../scripts/caesthetic/growth-score-report-template.mjs";
import {
  MULTI_LOCATION_DECISION_INTELLIGENCE_VERSION,
  MULTI_LOCATION_RUSSIAN_FIRST_WORKFLOW_VERSION,
  validateMultiLocationNetworkReport,
  validateMultiLocationPackage,
  validateMultiLocationRussianFirstTranslation,
} from "../../scripts/caesthetic/multi-location-growth-score.mjs";
import {
  buildMultiLocationPresentationModel,
} from "../../scripts/caesthetic/multi-location-growth-score-view-model.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";
import { createDecisionViewsFixture, createV5Report } from "./helpers/growth-score-v5-fixture.mjs";

const clone = (value) => structuredClone(value);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function networkScope(scope, affected) {
  const executionOwner = scope === "shared_asset" ? "hq" : scope === "focus_location" ? "local" : "shared";
  return {
    scope,
    affected_location_ids: affected,
    observed_in_reviewed_count: affected.length,
    rollout_plan: {
      pilot_location_id: "focus",
      replication_conditions: "Replicate only after the focus-location acceptance evidence passes.",
      done_when_focus_location: "The repaired public path passes the documented focus-location check.",
      done_when_network_rollout: "Every approved rollout location passes the same documented check.",
    },
    execution_owner: executionOwner,
    accountable_role: executionOwner === "hq" ? "VP Marketing" : executionOwner === "local" ? "Location Marketing Lead" : "VP Marketing and Location Leads",
    public_baseline: "The current public path and evidence state are captured before implementation.",
    day_30_public_check: "Repeat the same public route and confirm the documented acceptance evidence.",
  };
}

function locationDecisionViews(locationId, { notAssessed = false } = {}) {
  if (notAssessed) {
    return approveDecisionViewsNotAssessed(createDecisionViewsTemplate(), {
      reviewedBy: "Morgan Reed",
      reviewedAt: "2026-08-11T13:00:00Z",
    });
  }
  const artifact = clone(createDecisionViewsFixture());
  if (!["focus", "peer"].includes(locationId)) {
    artifact.providers = [];
    artifact.trust_chains[0].provider_id = null;
    artifact.promotion_holds = [];
  }
  if (locationId === "focus") {
    artifact.treatments.push({
      ...clone(artifact.treatments[0]),
      id: "laser",
      label: "Laser",
      priority: "secondary",
    });
  }
  if (locationId === "east") {
    artifact.treatments[0].surfaces.search.status = "watch";
  }
  return artifact;
}

function decisionIntelligence(reviewedLocationIds) {
  return {
    artifact_version: MULTI_LOCATION_DECISION_INTELLIGENCE_VERSION,
    assessment_status: "assessed",
    source_policy: "existing_growth_score_evidence_only",
    automatic_score_change: false,
    automatic_binding_constraint_selection: false,
    automatic_focus_selection: false,
    automatic_promotion_decision: false,
    location_projections: reviewedLocationIds.map((location_id) => ({
      location_id,
      decision_views: locationDecisionViews(location_id, { notAssessed: location_id === "remote" }),
    })),
    review: {
      status: "approved",
      reviewed_by: "Morgan Reed",
      reviewed_at: "2026-08-11T13:00:00Z",
      location_coverage_approved: true,
      treatment_identity_approved: true,
      provider_identity_approved: true,
      representative_chains_approved: true,
      friction_projection_approved: true,
      promotion_holds_approved: true,
    },
  };
}

export function packageFixture() {
  const parent = createV5Report(undefined, {
    practice: { name: "Fixture Network", location: "Two fictional markets", preparedAt: "2026-09-02", preparedFor: "Fixture owner" },
  });
  parent.audit = {
    format: "multi_location",
    profile_version: MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION,
    package_role: "network_parent",
    project_id: "fixture-network-project",
    access_group_id: "fixture-access-group",
    parent_route: "/score/fixture-network-parent-0123456789abcdef/",
    child_route: "/score/fixture-network-parent-0123456789abcdef/focus-location/",
  };
  parent.network = {
    id: "fixture-network",
    name: "Fixture Network",
    declared_location_count: 6,
    reviewed_location_count: 5,
    focus_location_id: "focus",
    focus_location_selection_rationale: "Focus has the highest-risk observed public journey among the reviewed locations; this is not a business-performance ranking.",
    focus_decision: {
      not_business_performance_ranking: true,
      manager_rationale: "Focus is the clearest 30-day pilot because public journey risk is observable and the repair can teach the network.",
      criteria: [
        { id: "public_journey_risk", assessment: "One fix-now discovery state is directly observable.", evidence_refs: ["search.map_visibility"] },
        { id: "evidence_confidence", assessment: "The priority route is supported by approved public evidence.", evidence_refs: ["search.map_visibility"] },
        { id: "thirty_day_feasibility", assessment: "The selected repair has a public Day 30 verification path.", evidence_refs: ["website.booking_friction"] },
        { id: "network_learning_value", assessment: "The location uses the shared booking route also observed at its peer.", evidence_refs: ["website.booking_friction"] },
      ],
    },
    executive_summary: {
      protect: "Keep the peer location’s strong local search pattern and both locations’ usable reputation proof.",
      fix_first: "Repair the focus location’s public discovery path before expanding lower-priority work.",
      shared_issue: "The shared booking route loses location context across both reviewed locations.",
      pilot: "Use Focus Location as the 30-day implementation pilot.",
      scale_rule: "Roll out only after the same public acceptance checks pass at the pilot.",
      decision_required: "Approve the Focus Location pilot and the accountable owners for the Top 3.",
    },
    locations: [
      { id: "focus", name: "Focus Location", public_location: "Market A", state: "reviewed" },
      { id: "peer", name: "Peer Location", public_location: "Market B", state: "reviewed" },
      { id: "east", name: "East Location", public_location: "Market C", state: "reviewed" },
      { id: "west", name: "West Location", public_location: "Market D", state: "reviewed" },
      { id: "remote", name: "Remote Location", public_location: "Market E", state: "reviewed" },
      { id: "unresolved", name: "Unresolved Location", public_location: "Market F", state: "ambiguous" },
    ],
    shared_assets: [
      { id: "shared-site", surface: "website", public_url: "https://example.test/", used_by_location_ids: ["focus", "peer", "east", "west", "remote"] },
    ],
    local_assets: [
      { id: "focus-gbp", location_id: "focus", surface: "search", public_url: "https://example.test/focus-gbp" },
      { id: "peer-gbp", location_id: "peer", surface: "search", public_url: "https://example.test/peer-gbp" },
      { id: "east-gbp", location_id: "east", surface: "search", public_url: "https://example.test/east-gbp" },
      { id: "west-gbp", location_id: "west", surface: "search", public_url: "https://example.test/west-gbp" },
      { id: "remote-gbp", location_id: "remote", surface: "search", public_url: "https://example.test/remote-gbp" },
    ],
    location_graph_refs: [
      { location_id: "focus", artifact_id: "journey-focus-v1" },
      { location_id: "peer", artifact_id: "journey-peer-v1" },
      { location_id: "east", artifact_id: "journey-east-v1" },
      { location_id: "west", artifact_id: "journey-west-v1" },
      { location_id: "remote", artifact_id: "journey-remote-v1-not-assessed" },
    ],
    repeated_patterns: [
      {
        id: "booking-pattern",
        title: "Shared booking route loses location context",
        surface: "cross_surface",
        affected_location_ids: ["focus", "peer", "east", "west"],
        observed_in_reviewed_count: 4,
        evidence_refs: ["website.booking_friction"],
      },
    ],
    comparison_matrix: ["focus", "peer", "east", "west", "remote"].map((location_id, row) => ({
      location_id,
      search: { state: row ? "protect" : "fix_now", summary: row ? "Search is the strongest observed local pattern." : "Discovery evidence supports repair.", evidence_refs: ["search.map_visibility"] },
      website: { state: "watch", summary: "Shared route needs location-context monitoring.", evidence_refs: ["website.booking_friction"] },
      social: { state: "needs_verification", summary: "Comparable local evidence is incomplete.", evidence_refs: [] },
      reputation: { state: "protect", summary: "Observed public proof is usable.", evidence_refs: ["reputation.rating"] },
    })),
    decision_intelligence: decisionIntelligence(["focus", "peer", "east", "west", "remote"]),
    propagation_candidates: [
      {
        id: "peer-search-pattern",
        title: "Preserve complete local search context",
        source_location_id: "peer",
        surface: "search",
        target_location_ids: ["focus"],
        evidence_refs: ["search.map_visibility"],
        standardize: "Use the peer’s observable location-context pattern as the checklist, without copying claims.",
        limitations: "Public evidence does not prove lead or revenue impact.",
      },
    ],
    publication_approval: {
      status: "approved",
      approved_by: "Morgan Reed",
      approved_at: "2026-08-11T13:00:00Z",
      focus_location_id: "focus",
      selected_gap_ids: ["search-gap", "booking-gap", "proof-gap"],
      public_sources_only: true,
    },
  };
  parent.humanDiagnosis.gap_inventory = parent.humanDiagnosis.gap_inventory.map((gap) => ({
    ...gap,
    ...(gap.id === "search-gap" ? { network_scope: networkScope("focus_location", ["focus"]) } : {}),
    ...(gap.id === "booking-gap" ? { network_scope: networkScope("shared_asset", ["focus", "peer", "east", "west", "remote"]) } : {}),
    ...(gap.id === "proof-gap" ? { network_scope: networkScope("repeated_pattern", ["focus", "peer", "east", "west", "remote"]) } : {}),
  }));

  const child = createV5Report(undefined, {
    practice: { name: "Focus Location", location: "Market A", preparedAt: "2026-09-02", preparedFor: "Fixture owner" },
  });
  child.audit = {
    format: "multi_location",
    profile_version: MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION,
    package_role: "focus_location",
    project_id: parent.audit.project_id,
    access_group_id: parent.audit.access_group_id,
    parent_route: parent.audit.parent_route,
    child_route: parent.audit.child_route,
    focus_location_id: "focus",
  };
  return { parent, child };
}

test("Multi-Location authoring profile extends schema v5 without a second score", () => {
  const parent = createMultiLocationGrowthScoreReportTemplate({ packageRole: "network_parent" });
  const child = createMultiLocationGrowthScoreReportTemplate({ packageRole: "focus_location" });
  assert.equal(parent.schemaVersion, 5);
  assert.equal(parent.audit.package_role, "network_parent");
  assert.equal(parent.audit.profile_version, MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION);
  assert.ok(parent.network);
  assert.equal(parent.network.decision_intelligence.artifact_version, MULTI_LOCATION_DECISION_INTELLIGENCE_VERSION);
  assert.equal(parent.network.decision_intelligence.assessment_status, "not_assessed");
  assert.equal(parent.network.decision_intelligence.location_projections[0].decision_views.assessment_status, "not_assessed");
  assert.equal(child.schemaVersion, 5);
  assert.equal(child.audit.package_role, "focus_location");
  assert.equal("network" in child, false);
  assert.equal("network_score" in parent, false);
});

test("validates one parent and one focus child with one shared ordered Top 3", () => {
  const { parent, child } = packageFixture();
  assert.equal(validateMultiLocationNetworkReport(parent), parent);
  assert.deepEqual(validateMultiLocationPackage(parent, child), { parent, child });
});

test("fails closed on coverage, package priority or aggregate-score drift", () => {
  const coverage = packageFixture();
  coverage.parent.network.reviewed_location_count = 3;
  assert.throws(() => validateMultiLocationNetworkReport(coverage.parent), /reviewed_location_count/);

  const priorities = packageFixture();
  priorities.child.humanDiagnosis.focus_selection.supporting_gap_ids.reverse();
  assert.throws(() => validateMultiLocationPackage(priorities.parent, priorities.child), /same ordered Top 3/);

  const score = packageFixture();
  score.parent.network.network_score = 71;
  assert.throws(() => validateMultiLocationNetworkReport(score.parent), /aggregate Network Score/);

  const facts = packageFixture();
  facts.child.verifiedFactSetVersion = "different-fact-set";
  assert.throws(() => validateMultiLocationPackage(facts.parent, facts.child), /verifiedFactSetVersion/);
});

test("network presentation model translates audit data without changing the approved priorities", () => {
  const { parent } = packageFixture();
  const view = buildMultiLocationPresentationModel(parent);
  assert.deepEqual(view.coverage, {
    declared: 6,
    reviewed: 5,
    not_reviewed: 1,
    method: "Public sources only",
  });
  assert.equal(view.locations[0].name, "Focus Location");
  assert.equal(view.locations.at(-1).state_label, "Not verified");
  assert.deepEqual(view.selected_gaps.map((gap) => gap.id), ["search-gap", "booking-gap", "proof-gap"]);
  assert.deepEqual(view.selected_gaps.map((gap) => gap.scope_label), ["Focus location", "Shared system", "Repeated pattern"]);
  assert.equal(view.primary_comparison_rows[0].location_name, "Focus Location");
  assert.deepEqual(view.risk_profile.totals, { protect: 9, watch: 5, fix_now: 1, needs_verification: 5 });
  assert.equal(view.focus_decision.criteria.length, 4);
  assert.equal(view.propagation_candidates[0].source_location_name, "Peer Location");
  assert.equal(view.sprint_plan.length, 4);
  assert.equal(view.decision_intelligence.coverage.assessed, 4);
  assert.equal(view.decision_intelligence.coverage.not_assessed, 1);
  assert.equal(view.decision_intelligence.primary_locations.length, 4);
  assert.equal(view.decision_intelligence.additional_locations.length, 1);
  const laser = view.decision_intelligence.treatment_matrix.find((treatment) => treatment.id === "laser");
  assert.equal(laser.cells.find((cell) => cell.location_id === "remote").status, "not_assessed");
  assert.equal(view.decision_intelligence.provider_visibility.groups.filter((group) => group.providers.length).length, 2);
  assert.equal(view.decision_intelligence.promotion_holds[0].affected_location_count, 2);
  assert.ok(view.decision_intelligence.trust_chains.representative.length <= 5);
});

test("network parent renders early comparison, one compact Top 3 and no network score navigator", () => {
  const { parent } = packageFixture();
  const html = renderGrowthReport(parent);
  assert.match(html, /Network overview/);
  assert.match(html, /Executive Network Decision Summary/);
  assert.match(html, /Network Risk Profile/);
  assert.match(html, /Not a performance ranking/);
  assert.match(html, /30-day operational plan/);
  assert.match(html, /HQ, local and shared responsibility/);
  assert.match(html, /What to replicate across the network/);
  assert.match(html, /What the named comparators change in the decision/);
  assert.match(html, /What this audit can prove — and what remains unassessed/);
  assert.match(html, /CMO decisions/);
  assert.match(html, /Network decision intelligence/);
  assert.match(html, /LOCATION × TREATMENT · UNSCORED/);
  assert.match(html, /PROVIDER × LOCATION · UNSCORED/);
  assert.match(html, /View 1 more locations/);
  assert.match(html, /No approved treatment-specific projection is available/);
  assert.match(html, /Affected locations:<\/strong> Focus Location, Peer Location/);
  assert.match(html, /Prepared September 2, 2026/);
  assert.doesNotMatch(html, /Morgan Reed/);
  assert.match(html, /Declared locations/);
  assert.match(html, /Internal network comparison/);
  assert.match(html, /Detailed location audit/);
  assert.match(html, /Observed in 4 of 5 reviewed locations/);
  assert.match(html, /No aggregate Network Score/);
  assert.doesNotMatch(html, /class="cae-report-score-nav"/);
  assert.doesNotMatch(html, /class="cae-focus-summary"/);
  assert.ok(html.indexOf('id="network-comparison"') < html.indexOf('id="focus-gaps"'));
  assert.equal((html.match(/class="cae-network-comparison"/g) || []).length, 1);
  assert.equal((html.match(/class="cae-report-disclosure-panel"/g) || []).length, 2);
  assert.equal((html.match(/Start the 30-Day Growth Sprint/g) || []).length, 1);
});

test("the structured Multi-Location profile fails closed until the manager publication card and public checks are complete", () => {
  const missingApproval = packageFixture();
  missingApproval.parent.network.publication_approval.status = "pending";
  assert.throws(() => validateMultiLocationNetworkReport(missingApproval.parent), /must be approved before publication/);

  const missingPublicCheck = packageFixture();
  delete missingPublicCheck.parent.humanDiagnosis.gap_inventory[0].network_scope.day_30_public_check;
  assert.throws(() => validateMultiLocationNetworkReport(missingPublicCheck.parent), /day_30_public_check/);
});

test("profile 1.1 remains readable without requiring network decision intelligence", () => {
  const { parent } = packageFixture();
  parent.audit.profile_version = MULTI_LOCATION_GROWTH_SCORE_LEGACY_PROFILE_VERSION;
  delete parent.network.decision_intelligence;
  assert.equal(validateMultiLocationNetworkReport(parent), parent);
  const html = renderGrowthReport(parent);
  assert.doesNotMatch(html, /Network decision intelligence/);
});

test("frozen Multi-Location parents without a profile marker remain valid", () => {
  const { parent } = packageFixture();
  delete parent.audit.profile_version;
  delete parent.network.decision_intelligence;
  delete parent.network.focus_decision;
  delete parent.network.executive_summary;
  delete parent.network.propagation_candidates;
  delete parent.network.publication_approval;
  parent.humanDiagnosis.gap_inventory.forEach((gap) => {
    if (!gap.network_scope) return;
    delete gap.network_scope.execution_owner;
    delete gap.network_scope.accountable_role;
    delete gap.network_scope.public_baseline;
    delete gap.network_scope.day_30_public_check;
  });
  assert.equal(validateMultiLocationNetworkReport(parent), parent);
});

test("profile 1.2 decision intelligence fails closed on coverage, sources, scores and review drift", () => {
  const missingLocation = packageFixture();
  missingLocation.parent.network.decision_intelligence.location_projections.pop();
  assert.throws(() => validateMultiLocationNetworkReport(missingLocation.parent), /every reviewed location requires exactly one approved decision-view projection/);

  const unreviewedLocation = packageFixture();
  unreviewedLocation.parent.network.decision_intelligence.location_projections[0].location_id = "unresolved";
  assert.throws(() => validateMultiLocationNetworkReport(unreviewedLocation.parent), /references unreviewed location/);

  const unsupportedEvidence = packageFixture();
  unsupportedEvidence.parent.network.decision_intelligence.location_projections[0].decision_views.treatments[0].surfaces.search.evidence_refs = ["linkedin.profile"];
  assert.throws(() => validateMultiLocationNetworkReport(unsupportedEvidence.parent), /unknown evidence reference linkedin\.profile/);

  const numericFriction = packageFixture();
  numericFriction.parent.network.decision_intelligence.friction_score = 62;
  assert.throws(() => validateMultiLocationNetworkReport(numericFriction.parent), /categorical and unscored/);

  const automaticPriority = packageFixture();
  automaticPriority.parent.network.decision_intelligence.automatic_focus_selection = true;
  assert.throws(() => validateMultiLocationNetworkReport(automaticPriority.parent), /automatic_focus_selection must be false/);

  const pendingReview = packageFixture();
  pendingReview.parent.network.decision_intelligence.review.status = "pending";
  assert.throws(() => validateMultiLocationNetworkReport(pendingReview.parent), /must be approved before publication/);

  const inconsistentProvider = packageFixture();
  inconsistentProvider.parent.network.decision_intelligence.location_projections[1].decision_views.providers[0].label = "Different identity";
  assert.throws(() => validateMultiLocationNetworkReport(inconsistentProvider.parent), /provider provider-a must resolve consistently/);
});

test("a selected network gap must affect the focus location directly or through its shared asset", () => {
  const fixture = packageFixture();
  fixture.parent.humanDiagnosis.gap_inventory.find((gap) => gap.id === "booking-gap").network_scope.affected_location_ids = ["peer"];
  assert.throws(() => validateMultiLocationNetworkReport(fixture.parent), /must affect the focus location/);
});

test("focus child keeps location presentation and returns to the parent without a second CTA", () => {
  const { child } = packageFixture();
  const html = renderGrowthReport(child);
  assert.match(html, /aria-label="Multi-Location package"/);
  assert.match(html, />Network analysis</);
  assert.match(html, /aria-current="page">Focus Location/);
  assert.match(html, /Return to the network implementation decision/);
  assert.doesNotMatch(html, /Start the 30-Day Growth Sprint/);
  assert.doesNotMatch(html, /Network overview/);
});

test("Multi-Location presentation localizes executive labels for the Russian pilot", () => {
  const { parent } = packageFixture();
  parent.reportContext.report_locale = "ru";
  const html = renderGrowthReport(parent);
  assert.match(html, /Краткое управленческое решение по сети/);
  assert.match(html, /Профиль рисков сети/);
  assert.match(html, /Операционный план на 30 дней/);
  assert.match(html, /Решения директора по маркетингу/);
  assert.equal(parent.network.executive_summary.fix_first, "Repair the focus location’s public discovery path before expanding lower-priority work.");
});

test("Multi-Location translation is blocked until the Russian parent-child package is approved and QA preserves frozen decisions", () => {
  const source = packageFixture();
  source.parent.reportContext.report_locale = "ru";
  source.child.reportContext.report_locale = "ru";

  const localized = {
    parent: clone(source.parent),
    child: clone(source.child),
  };
  localized.parent.reportContext.report_locale = "en";
  localized.child.reportContext.report_locale = "en";

  const release = {
    workflow_version: MULTI_LOCATION_RUSSIAN_FIRST_WORKFLOW_VERSION,
    source,
    localized,
    delivery_locale: "en",
    manager_approval: {
      status: "approved",
      approved_by: source.parent.humanDiagnosis.reviewer.name,
      approved_at: source.parent.humanDiagnosis.reviewer.approved_at,
    },
    translation_qa: {
      status: "approved",
      reviewed_by: "Taylor Quinn",
      reviewed_at: "2026-09-02T15:00:00Z",
    },
  };

  assert.deepEqual(validateMultiLocationRussianFirstTranslation(release), {
    workflow_version: MULTI_LOCATION_RUSSIAN_FIRST_WORKFLOW_VERSION,
    delivery_locale: "en",
    project_id: source.parent.audit.project_id,
    focus_location_id: source.parent.network.focus_location_id,
    approved_by: source.parent.humanDiagnosis.reviewer.name,
    translation_qa_by: "Taylor Quinn",
    status: "translation_qa_approved",
  });

  const changedDecision = clone(release);
  changedDecision.localized.parent.network.focus_location_id = "peer";
  assert.throws(() => validateMultiLocationRussianFirstTranslation(changedDecision), /focus location|frozen decision facts/);

  const pendingQa = clone(release);
  pendingQa.translation_qa.status = "pending";
  assert.throws(() => validateMultiLocationRussianFirstTranslation(pendingQa), /translation QA approval/);
});

test("published synthetic Multi-Location demo is one valid parent-child package", () => {
  const demoRoot = path.join(repoRoot, "site-caesthetic/score/demo-multi-location-growth-score");
  const parent = JSON.parse(fs.readFileSync(path.join(demoRoot, "report.json"), "utf8"));
  const child = JSON.parse(fs.readFileSync(path.join(demoRoot, "focus-location/report.json"), "utf8"));
  assert.deepEqual(validateMultiLocationPackage(parent, child), { parent, child });
  assert.equal(parent.schemaVersion, 5);
  assert.equal(parent.templateVersion, "growth-score-report-template/5.2.0");
  assert.equal((renderGrowthReport(parent).match(/Start the 30-Day Growth Sprint/g) || []).length, 1);
  assert.equal((renderGrowthReport(child).match(/Start the 30-Day Growth Sprint/g) || []).length, 0);
});
