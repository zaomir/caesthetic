/**
 * Multi-Location Growth Score profile for the canonical schema-v5 report.
 *
 * The parent remains a Growth Score report. This module adds network topology,
 * coverage and parent/child invariants without creating a Network Score.
 */

import {
  buildFocusLocationNavigationModel,
  buildMultiLocationPresentationModel,
  NETWORK_SURFACES,
} from "./multi-location-growth-score-view-model.mjs";
import { MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION } from "./growth-score-report-template.mjs";

export { MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION };

const LOCATION_STATES = new Set([
  "reviewed",
  "not_found",
  "ambiguous",
  "closed_or_moved_publicly_observed",
  "excluded_by_approved_scope",
]);

const NETWORK_GAP_SCOPES = new Set(["shared_asset", "repeated_pattern", "focus_location"]);
const SURFACES = Object.freeze(["search", "website", "social", "reputation"]);
const CELL_STATES = new Set(["protect", "watch", "fix_now", "needs_verification"]);
const EXECUTION_OWNERS = new Set(["hq", "local", "shared"]);
const FOCUS_DECISION_CRITERIA = Object.freeze([
  "public_journey_risk",
  "evidence_confidence",
  "thirty_day_feasibility",
  "network_learning_value",
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

function integer(value, label) {
  invariant(Number.isInteger(value) && value >= 0, `${label} must be a non-negative integer`);
  return value;
}

function uniqueStrings(value, label, { nonEmpty = false } = {}) {
  invariant(Array.isArray(value), `${label} must be an array`);
  if (nonEmpty) invariant(value.length > 0, `${label} must not be empty`);
  const seen = new Set();
  value.forEach((item, index) => {
    string(item, `${label}[${index}]`);
    invariant(!seen.has(item), `${label} contains duplicate ${item}`);
    seen.add(item);
  });
  return value;
}

function selectedGapIds(report) {
  const focus = object(report.humanDiagnosis?.focus_selection, "humanDiagnosis.focus_selection");
  return [focus.primary_gap_id, ...(focus.supporting_gap_ids || [])];
}

function selectedGaps(report) {
  const ids = selectedGapIds(report);
  const inventory = report.humanDiagnosis?.gap_inventory || [];
  return ids.map((id) => inventory.find((gap) => gap.id === id));
}

function forbidAggregateNetworkScore(value, path = "report") {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    invariant(!/^(?:network_?score|aggregate_?score|overall_?network)$/i.test(key), `${path}.${key} is forbidden; Multi-Location has no aggregate Network Score`);
    forbidAggregateNetworkScore(nested, `${path}.${key}`);
  }
}

export function isMultiLocationNetworkParent(report) {
  return report?.audit?.format === "multi_location" && report.audit.package_role === "network_parent";
}

export function isMultiLocationFocusLocation(report) {
  return report?.audit?.format === "multi_location" && report.audit.package_role === "focus_location";
}

export function validateMultiLocationNetworkReport(report) {
  object(report, "report");
  invariant(report.schemaVersion === 5, "Multi-Location requires schemaVersion=5");
  invariant(isMultiLocationNetworkParent(report), "report must be a multi_location network_parent");

  const audit = object(report.audit, "audit");
  string(audit.project_id, "audit.project_id");
  string(audit.access_group_id, "audit.access_group_id");
  string(audit.parent_route, "audit.parent_route");
  string(audit.child_route, "audit.child_route");
  invariant(audit.parent_route !== audit.child_route, "parent and child routes must differ");
  if (audit.profile_version !== undefined) {
    invariant(audit.profile_version === MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION, `audit.profile_version must be ${MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION}`);
  }

  const network = object(report.network, "network");
  string(network.id, "network.id");
  string(network.name, "network.name");
  integer(network.declared_location_count, "network.declared_location_count");
  integer(network.reviewed_location_count, "network.reviewed_location_count");
  string(network.focus_location_id, "network.focus_location_id");
  string(network.focus_location_selection_rationale, "network.focus_location_selection_rationale");
  invariant(Array.isArray(network.locations) && network.locations.length > 1, "network.locations must contain at least two locations");
  invariant(network.declared_location_count === network.locations.length, "declared_location_count must equal the location registry length");

  const locationIds = new Set();
  network.locations.forEach((location, index) => {
    object(location, `network.locations[${index}]`);
    string(location.id, `network.locations[${index}].id`);
    string(location.name, `network.locations[${index}].name`);
    string(location.public_location, `network.locations[${index}].public_location`);
    invariant(LOCATION_STATES.has(location.state), `network.locations[${index}].state is invalid`);
    invariant(!locationIds.has(location.id), `duplicate location id ${location.id}`);
    locationIds.add(location.id);
  });
  const reviewedIds = network.locations.filter((location) => location.state === "reviewed").map((location) => location.id);
  invariant(network.reviewed_location_count === reviewedIds.length, "reviewed_location_count must match reviewed location records");
  invariant(reviewedIds.includes(network.focus_location_id), "focus location must be reviewed");

  invariant(Array.isArray(network.shared_assets), "network.shared_assets must be an array");
  network.shared_assets.forEach((asset, index) => {
    object(asset, `network.shared_assets[${index}]`);
    string(asset.id, `network.shared_assets[${index}].id`);
    invariant(SURFACES.includes(asset.surface), `network.shared_assets[${index}].surface is invalid`);
    string(asset.public_url, `network.shared_assets[${index}].public_url`);
    uniqueStrings(asset.used_by_location_ids, `network.shared_assets[${index}].used_by_location_ids`, { nonEmpty: true });
    asset.used_by_location_ids.forEach((id) => invariant(locationIds.has(id), `shared asset references unknown location ${id}`));
  });

  invariant(Array.isArray(network.local_assets), "network.local_assets must be an array");
  network.local_assets.forEach((asset, index) => {
    object(asset, `network.local_assets[${index}]`);
    string(asset.id, `network.local_assets[${index}].id`);
    invariant(SURFACES.includes(asset.surface), `network.local_assets[${index}].surface is invalid`);
    string(asset.location_id, `network.local_assets[${index}].location_id`);
    invariant(locationIds.has(asset.location_id), `local asset references unknown location ${asset.location_id}`);
    string(asset.public_url, `network.local_assets[${index}].public_url`);
  });

  invariant(Array.isArray(network.location_graph_refs), "network.location_graph_refs must be an array");
  const graphLocations = new Set();
  network.location_graph_refs.forEach((entry, index) => {
    object(entry, `network.location_graph_refs[${index}]`);
    string(entry.location_id, `network.location_graph_refs[${index}].location_id`);
    string(entry.artifact_id, `network.location_graph_refs[${index}].artifact_id`);
    invariant(reviewedIds.includes(entry.location_id), `graph ref requires a reviewed location: ${entry.location_id}`);
    invariant(!graphLocations.has(entry.location_id), `duplicate graph ref for ${entry.location_id}`);
    graphLocations.add(entry.location_id);
  });
  invariant(reviewedIds.every((id) => graphLocations.has(id)), "every reviewed location requires one journeyGraph reference, including not_assessed artifacts");

  invariant(Array.isArray(network.repeated_patterns), "network.repeated_patterns must be an array");
  network.repeated_patterns.forEach((pattern, index) => {
    object(pattern, `network.repeated_patterns[${index}]`);
    string(pattern.id, `network.repeated_patterns[${index}].id`);
    string(pattern.title, `network.repeated_patterns[${index}].title`);
    invariant(SURFACES.includes(pattern.surface) || pattern.surface === "cross_surface", `network.repeated_patterns[${index}].surface is invalid`);
    uniqueStrings(pattern.affected_location_ids, `network.repeated_patterns[${index}].affected_location_ids`, { nonEmpty: true });
    pattern.affected_location_ids.forEach((id) => invariant(reviewedIds.includes(id), `pattern references unreviewed location ${id}`));
    integer(pattern.observed_in_reviewed_count, `network.repeated_patterns[${index}].observed_in_reviewed_count`);
    invariant(pattern.observed_in_reviewed_count === pattern.affected_location_ids.length, `pattern ${pattern.id} count must match affected locations`);
    invariant(pattern.observed_in_reviewed_count <= network.reviewed_location_count, `pattern ${pattern.id} exceeds reviewed coverage`);
    uniqueStrings(pattern.evidence_refs, `network.repeated_patterns[${index}].evidence_refs`, { nonEmpty: true });
  });

  invariant(Array.isArray(network.comparison_matrix), "network.comparison_matrix must be an array");
  const matrixLocations = new Set();
  network.comparison_matrix.forEach((row, index) => {
    object(row, `network.comparison_matrix[${index}]`);
    string(row.location_id, `network.comparison_matrix[${index}].location_id`);
    invariant(reviewedIds.includes(row.location_id), `comparison row requires reviewed location ${row.location_id}`);
    invariant(!matrixLocations.has(row.location_id), `duplicate comparison row for ${row.location_id}`);
    matrixLocations.add(row.location_id);
    SURFACES.forEach((surface) => {
      object(row[surface], `network.comparison_matrix[${index}].${surface}`);
      invariant(CELL_STATES.has(row[surface].state), `network.comparison_matrix[${index}].${surface}.state is invalid`);
      string(row[surface].summary, `network.comparison_matrix[${index}].${surface}.summary`);
      uniqueStrings(row[surface].evidence_refs, `network.comparison_matrix[${index}].${surface}.evidence_refs`);
    });
  });
  invariant(reviewedIds.every((id) => matrixLocations.has(id)), "every reviewed location requires one comparison row");

  const focusIds = selectedGapIds(report);
  invariant(focusIds.length === 3 && new Set(focusIds).size === 3, "Multi-Location requires exactly one Primary plus two Supporting gaps");
  selectedGaps(report).forEach((gap, index) => {
    object(gap, `selected gap ${focusIds[index]}`);
    object(gap.network_scope, `selected gap ${gap.id}.network_scope`);
    invariant(NETWORK_GAP_SCOPES.has(gap.network_scope.scope), `selected gap ${gap.id}.network_scope.scope is invalid`);
    uniqueStrings(gap.network_scope.affected_location_ids, `selected gap ${gap.id}.network_scope.affected_location_ids`, { nonEmpty: true });
    gap.network_scope.affected_location_ids.forEach((id) => invariant(reviewedIds.includes(id), `selected gap ${gap.id} references unreviewed location ${id}`));
    invariant(gap.network_scope.affected_location_ids.includes(network.focus_location_id), `selected gap ${gap.id} must affect the focus location directly or through a shared asset it uses`);
    object(gap.network_scope.rollout_plan, `selected gap ${gap.id}.network_scope.rollout_plan`);
    string(gap.network_scope.rollout_plan.pilot_location_id, `selected gap ${gap.id}.network_scope.rollout_plan.pilot_location_id`);
    invariant(gap.network_scope.rollout_plan.pilot_location_id === network.focus_location_id, `selected gap ${gap.id} pilot must be the focus location`);
    string(gap.network_scope.rollout_plan.replication_conditions, `selected gap ${gap.id}.network_scope.rollout_plan.replication_conditions`);
    string(gap.network_scope.rollout_plan.done_when_focus_location, `selected gap ${gap.id}.network_scope.rollout_plan.done_when_focus_location`);
    string(gap.network_scope.rollout_plan.done_when_network_rollout, `selected gap ${gap.id}.network_scope.rollout_plan.done_when_network_rollout`);
    if (audit.profile_version === MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION) {
      invariant(EXECUTION_OWNERS.has(gap.network_scope.execution_owner), `selected gap ${gap.id}.network_scope.execution_owner must be hq, local or shared`);
      string(gap.network_scope.accountable_role, `selected gap ${gap.id}.network_scope.accountable_role`);
      string(gap.network_scope.public_baseline, `selected gap ${gap.id}.network_scope.public_baseline`);
      string(gap.network_scope.day_30_public_check, `selected gap ${gap.id}.network_scope.day_30_public_check`);
    }
  });

  if (audit.profile_version === MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION) {
    const focusDecision = object(network.focus_decision, "network.focus_decision");
    invariant(focusDecision.not_business_performance_ranking === true, "network.focus_decision must state that focus selection is not a business-performance ranking");
    string(focusDecision.manager_rationale, "network.focus_decision.manager_rationale");
    invariant(Array.isArray(focusDecision.criteria) && focusDecision.criteria.length === FOCUS_DECISION_CRITERIA.length, "network.focus_decision.criteria must contain exactly four criteria");
    const criterionIds = new Set();
    focusDecision.criteria.forEach((criterion, index) => {
      object(criterion, `network.focus_decision.criteria[${index}]`);
      invariant(FOCUS_DECISION_CRITERIA.includes(criterion.id), `network.focus_decision.criteria[${index}].id is invalid`);
      invariant(!criterionIds.has(criterion.id), `duplicate focus decision criterion ${criterion.id}`);
      criterionIds.add(criterion.id);
      string(criterion.assessment, `network.focus_decision.criteria[${index}].assessment`);
      uniqueStrings(criterion.evidence_refs, `network.focus_decision.criteria[${index}].evidence_refs`, { nonEmpty: true });
    });
    FOCUS_DECISION_CRITERIA.forEach((id) => invariant(criterionIds.has(id), `network.focus_decision.criteria is missing ${id}`));

    const executiveSummary = object(network.executive_summary, "network.executive_summary");
    ["protect", "fix_first", "shared_issue", "pilot", "scale_rule", "decision_required"].forEach((field) => {
      string(executiveSummary[field], `network.executive_summary.${field}`);
    });

    invariant(Array.isArray(network.propagation_candidates), "network.propagation_candidates must be an array");
    network.propagation_candidates.forEach((candidate, index) => {
      object(candidate, `network.propagation_candidates[${index}]`);
      string(candidate.id, `network.propagation_candidates[${index}].id`);
      string(candidate.title, `network.propagation_candidates[${index}].title`);
      string(candidate.source_location_id, `network.propagation_candidates[${index}].source_location_id`);
      invariant(reviewedIds.includes(candidate.source_location_id), `propagation candidate ${candidate.id} source must be reviewed`);
      invariant(SURFACES.includes(candidate.surface) || candidate.surface === "cross_surface", `propagation candidate ${candidate.id} surface is invalid`);
      uniqueStrings(candidate.target_location_ids, `network.propagation_candidates[${index}].target_location_ids`, { nonEmpty: true });
      candidate.target_location_ids.forEach((id) => invariant(reviewedIds.includes(id), `propagation candidate ${candidate.id} target must be reviewed`));
      uniqueStrings(candidate.evidence_refs, `network.propagation_candidates[${index}].evidence_refs`, { nonEmpty: true });
      string(candidate.standardize, `network.propagation_candidates[${index}].standardize`);
      string(candidate.limitations, `network.propagation_candidates[${index}].limitations`);
    });

    const approval = object(network.publication_approval, "network.publication_approval");
    invariant(approval.status === "approved", "network.publication_approval.status must be approved before publication");
    string(approval.approved_by, "network.publication_approval.approved_by");
    string(approval.approved_at, "network.publication_approval.approved_at");
    invariant(approval.public_sources_only === true, "network.publication_approval.public_sources_only must be true");
    invariant(approval.focus_location_id === network.focus_location_id, "network.publication_approval.focus_location_id must match the focus location");
    uniqueStrings(approval.selected_gap_ids, "network.publication_approval.selected_gap_ids", { nonEmpty: true });
    invariant(JSON.stringify(approval.selected_gap_ids) === JSON.stringify(focusIds), "network.publication_approval.selected_gap_ids must match the ordered Top 3");
    invariant(approval.approved_by === report.humanDiagnosis?.reviewer?.name, "network.publication_approval approver must match humanDiagnosis.reviewer");
    invariant(approval.approved_at === report.humanDiagnosis?.reviewer?.approved_at, "network.publication_approval timestamp must match humanDiagnosis.reviewer");
  }

  forbidAggregateNetworkScore(report.network, "network");
  return report;
}

export function validateMultiLocationFocusLocationReport(report) {
  object(report, "report");
  invariant(report.schemaVersion === 5, "focus child requires schemaVersion=5");
  invariant(isMultiLocationFocusLocation(report), "report must be a multi_location focus_location");
  const audit = object(report.audit, "audit");
  if (audit.profile_version !== undefined) {
    invariant(audit.profile_version === MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION, `audit.profile_version must be ${MULTI_LOCATION_GROWTH_SCORE_PROFILE_VERSION}`);
  }
  string(audit.project_id, "audit.project_id");
  string(audit.access_group_id, "audit.access_group_id");
  string(audit.parent_route, "audit.parent_route");
  string(audit.child_route, "audit.child_route");
  string(audit.focus_location_id, "audit.focus_location_id");
  invariant(audit.parent_route !== audit.child_route, "parent and child routes must differ");
  forbidAggregateNetworkScore(audit, "audit");
  return report;
}

export function validateMultiLocationPackage(parent, child) {
  validateMultiLocationNetworkReport(parent);
  object(child, "child");
  validateMultiLocationFocusLocationReport(child);
  invariant(parent.audit.project_id === child.audit.project_id, "parent and child project_id must match");
  invariant(parent.audit.profile_version === child.audit.profile_version, "parent and child profile_version must match");
  invariant(parent.audit.access_group_id === child.audit.access_group_id, "parent and child access_group_id must match");
  invariant(parent.audit.parent_route === child.audit.parent_route, "parent route must match across the package");
  invariant(parent.audit.child_route === child.audit.child_route, "child route must match across the package");
  invariant(parent.verifiedFactSetVersion === child.verifiedFactSetVersion, "parent and child verifiedFactSetVersion must match");
  invariant(child.audit.focus_location_id === parent.network.focus_location_id, "child must resolve to the selected focus location");
  invariant(JSON.stringify(selectedGapIds(parent)) === JSON.stringify(selectedGapIds(child)), "parent and child must show the same ordered Top 3");
  invariant(parent.humanDiagnosis.binding_constraint.gap_ref === child.humanDiagnosis.binding_constraint.gap_ref, "parent and child binding constraint must match");
  invariant(parent.humanDiagnosis.do_not_do.title === child.humanDiagnosis.do_not_do.title, "parent and child Do Not Fund Yet must match");
  forbidAggregateNetworkScore(child.audit, "child.audit");
  return { parent, child };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[character]);
}

function evidenceRefsHtml(refs = []) {
  return refs.map((ref) => `<code>${escapeHtml(ref)}</code>`).join(", ");
}

export function executiveNetworkDecisionHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  if (!view.executive_summary) return "";
  const items = [
    ["Protect", view.executive_summary.protect],
    ["Fix first", view.executive_summary.fix_first],
    ["Shared issue", view.executive_summary.shared_issue],
    ["Pilot", view.executive_summary.pilot],
    ["Scale rule", view.executive_summary.scale_rule],
    ["Decision required", view.executive_summary.decision_required],
  ];
  return `<section class="cae-network-decision-summary" aria-labelledby="network-decision-summary-title">
    <p class="cae-kicker">Executive Network Decision Summary</p>
    <h2 class="cae-h2" id="network-decision-summary-title">The five-minute implementation view</h2>
    <div>${items.map(([label, value]) => `<article><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></article>`).join("")}</div>
  </section>`;
}

export function networkRiskProfileHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  const states = [
    ["fix_now", "Fix now"],
    ["watch", "Watch"],
    ["protect", "Protect"],
    ["needs_verification", "Needs verification"],
  ];
  return `<section class="cae-network-risk-profile" aria-labelledby="network-risk-profile-title">
    <p class="cae-kicker">Network Risk Profile</p>
    <h3 class="cae-report-subhead" id="network-risk-profile-title">What the public evidence says across reviewed locations</h3>
    <p>Counts are derived from the location × Four Surfaces matrix below. They are evidence states, not a network score.</p>
    <div class="cae-network-risk-profile__totals">${states.map(([state, label]) => `<article data-state="${state}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(view.risk_profile.totals[state])}</strong><small>of ${escapeHtml(view.risk_profile.assessed_cells)} reviewed cells</small></article>`).join("")}</div>
    <div class="cae-network-risk-profile__surfaces">${view.risk_profile.surfaces.map((surface) => `<article><strong>${escapeHtml(surface.surface_label)}</strong>${states.map(([state, label]) => `<span data-state="${state}">${escapeHtml(label)} <b>${escapeHtml(surface[state])}</b></span>`).join("")}</article>`).join("")}</div>
  </section>`;
}

export function networkFocusDecisionHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  if (!view.focus_decision) return "";
  return `<section class="cae-network-focus-decision" aria-labelledby="network-focus-decision-title">
    <p class="cae-kicker">Why this focus location</p>
    <h3 class="cae-report-subhead" id="network-focus-decision-title">Pilot selection criteria</h3>
    <p>${escapeHtml(view.focus_decision.manager_rationale)}</p>
    <div class="cae-table-scroll"><table><thead><tr><th scope="col">Criterion</th><th scope="col">Assessment</th><th scope="col">Public evidence</th></tr></thead><tbody>${view.focus_decision.criteria.map((criterion) => `<tr><th scope="row">${escapeHtml(criterion.label)}</th><td>${escapeHtml(criterion.assessment)}</td><td>${evidenceRefsHtml(criterion.evidence_refs)}</td></tr>`).join("")}</tbody></table></div>
    <p class="cae-report-note"><strong>Not a performance ranking.</strong> The focus location was selected as the most useful public-evidence pilot, not labeled the network’s weakest business.</p>
  </section>`;
}

export function networkOperationalPlanHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<div class="cae-network-sprint-plan">${view.sprint_plan.map((phase) => `<article><span>${escapeHtml(phase.period)}</span><h3>${escapeHtml(phase.title)}</h3>${phase.gap ? `<p><strong>${escapeHtml(phase.gap.title)}</strong></p><p>${escapeHtml(phase.gap.day_30_public_check)}</p><small>${escapeHtml(phase.gap.execution_owner_label)} · ${escapeHtml(phase.gap.accountable_role)}</small>` : `<p>${escapeHtml(phase.decision)}</p>`}</article>`).join("")}</div>
  <p class="cae-report-note">The sequence is an operational recommendation, not purchased scope. Every checkpoint is verified through public evidence available to the audit.</p>`;
}

export function networkOwnershipRolloutHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<section class="cae-network-ownership" aria-labelledby="network-ownership-title">
    <p class="cae-kicker">HQ, local and shared responsibility</p>
    <h3 class="cae-report-subhead" id="network-ownership-title">Who owns the repair — and when it can roll out</h3>
    <div>${view.selected_gaps.map((gap) => `<article><span>${escapeHtml(gap.execution_owner_label)}</span><h4>${escapeHtml(gap.title)}</h4><p><strong>Accountable:</strong> ${escapeHtml(gap.accountable_role)}</p><p><strong>Pilot proof:</strong> ${escapeHtml(gap.focus_acceptance)}</p><p><strong>Rollout gate:</strong> ${escapeHtml(gap.replication_conditions)}</p></article>`).join("")}</div>
  </section>`;
}

export function networkPropagationHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  if (!view.propagation_candidates.length) return "";
  return `<section class="cae-network-propagation" aria-labelledby="network-propagation-title">
    <p class="cae-kicker">What to replicate across the network</p>
    <h3 class="cae-report-subhead" id="network-propagation-title">Observed strengths worth standardizing</h3>
    <div>${view.propagation_candidates.map((candidate) => `<article><span>${escapeHtml(candidate.surface_label)} · from ${escapeHtml(candidate.source_location_name)}</span><h4>${escapeHtml(candidate.title)}</h4><p><strong>Standardize:</strong> ${escapeHtml(candidate.standardize)}</p><p><strong>Candidate locations:</strong> ${escapeHtml(candidate.target_location_names.join(", "))}</p><p><small>Public evidence: ${evidenceRefsHtml(candidate.evidence_refs)} · Limitation: ${escapeHtml(candidate.limitations)}</small></p></article>`).join("")}</div>
  </section>`;
}

export function networkCompetitorSummaryHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<section class="cae-network-competitor-summary" aria-labelledby="network-competitor-summary-title">
    <p class="cae-kicker">Competitive signal</p>
    <h3 class="cae-report-subhead" id="network-competitor-summary-title">What the named comparators change in the decision</h3>
    <div>${view.competitor_summary.map((competitor) => `<article><span>${escapeHtml(competitor.type)}</span><h4>${escapeHtml(competitor.name)}</h4><p><strong>Why a client may choose it:</strong> ${escapeHtml(competitor.choice_reason)}</p><p><strong>Observable advantage:</strong> ${escapeHtml(competitor.observable_advantage)}</p><p><strong>Decision effect:</strong> ${escapeHtml(competitor.constraint_effect)}</p></article>`).join("")}</div>
  </section>`;
}

export function networkEvidenceBoundaryHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  const approval = view.publication_approval;
  return `<section class="cae-network-evidence-boundary" aria-labelledby="network-evidence-boundary-title">
    <p class="cae-kicker">Public evidence boundary</p>
    <h3 class="cae-report-subhead" id="network-evidence-boundary-title">What this audit can prove — and what remains unassessed</h3>
    <div><article><span>Proven here</span><p>Public visibility, public journey friction, observable proof, review patterns and comparable location-level surface states.</p></article><article><span>Not assessed here</span><p>Lead handling, booking conversion, attendance, treatment conversion, revenue, margin and ROI.</p></article><article><span>Optional later input</span><p>Authorized internal data may support a separate impact analysis. It is not evidence for this audit and does not change this Growth Score.</p></article></div>
    ${approval ? `<p class="cae-report-note"><strong>Publication gate passed.</strong> The internal named-human approval record confirms public sources only; personal reviewer attribution remains outside client-facing HTML.</p>` : ""}
  </section>`;
}

export function networkExecutiveDecisionHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<section class="cae-network-decision-asks" aria-labelledby="network-decision-asks-title">
    <p class="cae-kicker">CMO decisions</p>
    <h3 class="cae-report-subhead" id="network-decision-asks-title">Approve the pilot, owners and scale gate</h3>
    <ol>${view.decision_asks.map((decision) => `<li>${escapeHtml(decision)}</li>`).join("")}</ol>
  </section>`;
}

export function networkCoverageHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<section class="cae-network-summary" aria-label="Multi-Location coverage">
    <div><span>Declared locations</span><strong>${escapeHtml(view.coverage.declared)}</strong></div>
    <div><span>Reviewed locations</span><strong>${escapeHtml(view.coverage.reviewed)}</strong></div>
    <div><span>Focus location</span><strong>${escapeHtml(view.focus_location.name)}</strong></div>
    <div><span>Method</span><strong>${escapeHtml(view.coverage.method)}</strong></div>
    <p>${escapeHtml(view.focus_location.rationale)}</p>
    <a class="cae-network-focus-link" href="${escapeHtml(view.focus_location.route)}">
      <span>Detailed location audit</span>
      <strong>${escapeHtml(view.focus_location.name)}</strong>
      <small>Open the complete location evidence and repair plan →</small>
    </a>
    <nav class="cae-network-jump" aria-label="Network report sections">
      <a href="#network-risk-profile-title">Risk profile</a>
      <a href="#focus-gaps">Top 3 priorities</a>
      <a href="#sprint-fit">30-day plan</a>
      <a href="#network-ownership-title">Owners</a>
      <a href="#next-step">Decisions</a>
    </nav>
  </section>`;
}

export function networkJourneyAtlasHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  const locationCard = (location) => `<li data-location-state="${escapeHtml(location.state)}"${location.is_focus ? ' data-focus-location="true"' : ""}>
    <strong>${escapeHtml(location.name)}</strong><span>${escapeHtml(location.public_location)}</span><small>${escapeHtml(location.state_label)}</small>
  </li>`;
  const locationCards = view.primary_locations.map(locationCard).join("");
  const additionalLocations = view.additional_locations.length ? `<details class="cae-network-more"><summary>View ${escapeHtml(view.additional_locations.length)} more locations</summary><ul class="cae-network-atlas__locations">${view.additional_locations.map(locationCard).join("")}</ul></details>` : "";
  const patternCards = view.repeated_patterns.map((pattern) => `<article>
    <span>${escapeHtml(pattern.surface_label)}</span><h4>${escapeHtml(pattern.title)}</h4>
    <p>Observed in ${escapeHtml(pattern.observed_in_reviewed_count)} of ${escapeHtml(view.coverage.reviewed)} reviewed locations.</p>
  </article>`).join("");
  return `<section class="cae-network-atlas" aria-labelledby="network-overview-title">
    <p class="cae-kicker">Network overview</p>
    <h3 class="cae-report-subhead" id="network-overview-title">What is shared, local and repeated</h3>
    <p>Only equivalent evidence visible in public sources is compared across locations.</p>
    <div class="cae-network-atlas__assets"><div><span>Shared assets</span><strong>${escapeHtml(view.asset_counts.shared)}</strong></div><div><span>Local assets</span><strong>${escapeHtml(view.asset_counts.local)}</strong></div><div><span>Reviewed journeys</span><strong>${escapeHtml(view.asset_counts.journey_graphs)}</strong></div></div>
    <ul class="cae-network-atlas__locations">${locationCards}</ul>
    ${additionalLocations}
    <div class="cae-network-patterns">${patternCards}</div>
  </section>`;
}

export function networkFocusScopeHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  return `<div class="cae-network-focus-scopes">${view.selected_gaps.map((gap) => `<article><span>${escapeHtml(gap.scope_label)}</span><strong>${escapeHtml(gap.title)}</strong><small>Affects ${escapeHtml(gap.affected_location_label)} · pilot: ${escapeHtml(gap.pilot_location_name)}</small></article>`).join("")}</div>`;
}

export function networkComparisonHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const view = buildMultiLocationPresentationModel(report);
  const header = NETWORK_SURFACES.map((surface) => `<th scope="col">${escapeHtml(surface === "search" ? "Search" : surface[0].toUpperCase() + surface.slice(1))}</th>`).join("");
  const rowsHtml = (rows) => rows.map((row) => `<tr${row.is_focus ? ' data-focus-location="true"' : ""}><th scope="row">${escapeHtml(row.location_name)}${row.is_focus ? "<small>Focus location</small>" : ""}</th>${row.cells.map((cell) => `<td data-surface="${escapeHtml(cell.surface_label)}" data-state="${escapeHtml(cell.state)}"><strong>${escapeHtml(cell.state_label)}</strong><span>${escapeHtml(cell.summary)}</span></td>`).join("")}</tr>`).join("");
  const tableHtml = (rows, label) => `<div class="cae-table-scroll"><table aria-label="${escapeHtml(label)}"><thead><tr><th scope="col">Location</th>${header}</tr></thead><tbody>${rowsHtml(rows)}</tbody></table></div>`;
  const additionalRows = view.additional_comparison_rows.length ? `<details class="cae-network-more"><summary>Compare ${escapeHtml(view.additional_comparison_rows.length)} more reviewed locations</summary>${tableHtml(view.additional_comparison_rows, "Additional reviewed locations")}</details>` : "";
  return `<section class="cae-network-comparison" id="network-comparison" aria-labelledby="network-comparison-title">
    <p class="cae-kicker">Internal network comparison</p>
    <h3 class="cae-report-subhead" id="network-comparison-title">Where each location needs protection, attention or repair</h3>
    <p>Locations are compared only on equivalent public evidence. They are not ranked as businesses.</p>
    ${tableHtml(view.primary_comparison_rows, "Location comparison across the Four Surfaces")}
    ${additionalRows}
  </section>`;
}

export function networkMethodHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  return `<section class="cae-network-method" role="note"><strong>No aggregate Network Score.</strong><p>Use the location × Four Surfaces evidence matrix, declared-versus-reviewed coverage and individual location scores only where their normal schema-v5 coverage gates pass.</p></section>`;
}

export function focusChildNavigationHtml(report) {
  if (!isMultiLocationFocusLocation(report)) return "";
  const view = buildFocusLocationNavigationModel(report);
  return `<nav class="cae-network-child-nav" aria-label="Multi-Location package"><ol><li><a href="${escapeHtml(view.parent_route)}">Network analysis</a></li><li aria-current="page">${escapeHtml(view.location_name)}</li></ol></nav>`;
}
