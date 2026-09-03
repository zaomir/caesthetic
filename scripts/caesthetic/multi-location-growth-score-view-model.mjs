/**
 * Client-facing presentation model for the Multi-Location Growth Score.
 *
 * The audit package remains the only source of truth. This module derives
 * labels, ordering and progressive-disclosure groups without changing facts,
 * scores, the binding constraint or the manager-approved Top 3.
 */

import { buildMultiLocationDecisionViewModel } from "./multi-location-decision-view-model.mjs";

export const NETWORK_SURFACES = Object.freeze(["search", "website", "social", "reputation"]);

const SURFACE_LABELS = Object.freeze({
  search: "Search",
  website: "Website",
  social: "Social",
  reputation: "Reputation",
  cross_surface: "Cross-Surface",
});

const LOCATION_STATE_LABELS = Object.freeze({
  reviewed: "Reviewed",
  not_found: "Not found in public sources",
  ambiguous: "Not verified",
  closed_or_moved_publicly_observed: "Publicly observed as closed or moved",
  excluded_by_approved_scope: "Outside the approved scope",
});

const CELL_STATE_LABELS = Object.freeze({
  protect: "Protect",
  watch: "Watch",
  fix_now: "Fix now",
  needs_verification: "Needs verification",
});

const GAP_SCOPE_LABELS = Object.freeze({
  shared_asset: "Shared system",
  repeated_pattern: "Repeated pattern",
  focus_location: "Focus location",
});

const OWNER_LABELS = Object.freeze({
  hq: "HQ-owned",
  local: "Location-owned",
  shared: "Shared ownership",
});

const FOCUS_CRITERION_LABELS = Object.freeze({
  public_journey_risk: "Public journey risk",
  evidence_confidence: "Evidence confidence",
  thirty_day_feasibility: "30-day feasibility",
  network_learning_value: "Network learning value",
});

function selectedGapIds(report) {
  const focus = report?.humanDiagnosis?.focus_selection;
  return focus ? [focus.primary_gap_id, ...(focus.supporting_gap_ids || [])] : [];
}

function orderedLocations(network) {
  return [...network.locations].sort((left, right) => {
    if (left.id === network.focus_location_id) return -1;
    if (right.id === network.focus_location_id) return 1;
    if (left.state === "reviewed" && right.state !== "reviewed") return -1;
    if (right.state === "reviewed" && left.state !== "reviewed") return 1;
    return left.name.localeCompare(right.name);
  });
}

export function buildMultiLocationPresentationModel(report) {
  if (report?.audit?.format !== "multi_location" || report.audit.package_role !== "network_parent") return null;

  const network = report.network;
  const locationById = new Map(network.locations.map((location) => [location.id, location]));
  const focusLocation = locationById.get(network.focus_location_id);
  const locations = orderedLocations(network).map((location) => ({
    ...location,
    is_focus: location.id === network.focus_location_id,
    state_label: LOCATION_STATE_LABELS[location.state] || "Needs verification",
  }));
  const selectedGaps = selectedGapIds(report)
    .map((id) => report.humanDiagnosis.gap_inventory.find((gap) => gap.id === id))
    .filter(Boolean)
    .map((gap, index) => ({
      ...gap,
      rank: index + 1,
      role_label: index === 0 ? "Primary Gap" : `Supporting Gap ${index + 1}`,
      scope_label: GAP_SCOPE_LABELS[gap.network_scope?.scope] || "Network finding",
      affected_location_count: gap.network_scope?.affected_location_ids?.length || 0,
      affected_location_label: `${gap.network_scope?.affected_location_ids?.length || 0} reviewed ${(gap.network_scope?.affected_location_ids?.length || 0) === 1 ? "location" : "locations"}`,
      pilot_location_name: locationById.get(gap.network_scope?.rollout_plan?.pilot_location_id)?.name || focusLocation?.name || network.focus_location_id,
      execution_owner_label: OWNER_LABELS[gap.network_scope?.execution_owner] || "Owner not assigned",
      accountable_role: gap.network_scope?.accountable_role || gap.repair_plan?.owner_role || "Not assigned",
      public_baseline: gap.network_scope?.public_baseline || "Not assessed",
      day_30_public_check: gap.network_scope?.day_30_public_check || "Not assessed",
      replication_conditions: gap.network_scope?.rollout_plan?.replication_conditions || "Not assessed",
      focus_acceptance: gap.network_scope?.rollout_plan?.done_when_focus_location || "Not assessed",
      network_acceptance: gap.network_scope?.rollout_plan?.done_when_network_rollout || "Not assessed",
    }));
  const comparisonRows = [...network.comparison_matrix]
    .sort((left, right) => left.location_id === network.focus_location_id ? -1 : right.location_id === network.focus_location_id ? 1 : 0)
    .map((row) => ({
      location_id: row.location_id,
      location_name: locationById.get(row.location_id)?.name || row.location_id,
      is_focus: row.location_id === network.focus_location_id,
      cells: NETWORK_SURFACES.map((surface) => ({
        surface,
        surface_label: SURFACE_LABELS[surface],
        state: row[surface].state,
        state_label: CELL_STATE_LABELS[row[surface].state] || "Needs verification",
        summary: row[surface].summary,
      })),
    }));

  const emptyStateCounts = () => ({ protect: 0, watch: 0, fix_now: 0, needs_verification: 0 });
  const totalRiskCounts = emptyStateCounts();
  const riskBySurface = NETWORK_SURFACES.map((surface) => ({ surface, surface_label: SURFACE_LABELS[surface], ...emptyStateCounts() }));
  comparisonRows.forEach((row) => row.cells.forEach((cell) => {
    totalRiskCounts[cell.state] += 1;
    riskBySurface.find((entry) => entry.surface === cell.surface)[cell.state] += 1;
  }));

  const propagationCandidates = (network.propagation_candidates || []).map((candidate) => ({
    ...candidate,
    surface_label: SURFACE_LABELS[candidate.surface] || "Cross-Surface",
    source_location_name: locationById.get(candidate.source_location_id)?.name || candidate.source_location_id,
    target_location_names: candidate.target_location_ids.map((id) => locationById.get(id)?.name || id),
  }));

  const focusCriteria = (network.focus_decision?.criteria || []).map((criterion) => ({
    ...criterion,
    label: FOCUS_CRITERION_LABELS[criterion.id] || criterion.id,
  }));

  const competitorSummary = (report.humanDiagnosis?.competitors?.entries || []).slice(0, 3).map((competitor) => ({
    id: competitor.id,
    name: competitor.name,
    type: competitor.competitor_type?.replaceAll("_", " ") || "comparator",
    choice_reason: competitor.patient_choice_reason,
    observable_advantage: competitor.observable_advantage,
    constraint_effect: competitor.constraint_effect,
  }));

  return Object.freeze({
    coverage: {
      declared: network.declared_location_count,
      reviewed: network.reviewed_location_count,
      not_reviewed: Math.max(0, network.declared_location_count - network.reviewed_location_count),
      method: "Public sources only",
    },
    focus_location: {
      id: network.focus_location_id,
      name: focusLocation?.name || network.focus_location_id,
      public_location: focusLocation?.public_location || "",
      route: report.audit.child_route,
      rationale: network.focus_location_selection_rationale,
    },
    locations,
    primary_locations: locations.slice(0, 4),
    additional_locations: locations.slice(4),
    asset_counts: {
      shared: network.shared_assets.length,
      local: network.local_assets.length,
      journey_graphs: network.location_graph_refs.length,
    },
    repeated_patterns: network.repeated_patterns.map((pattern) => ({
      ...pattern,
      surface_label: SURFACE_LABELS[pattern.surface] || "Cross-Surface",
    })),
    selected_gaps: selectedGaps,
    executive_summary: network.executive_summary || null,
    focus_decision: network.focus_decision ? {
      ...network.focus_decision,
      criteria: focusCriteria,
    } : null,
    risk_profile: {
      totals: totalRiskCounts,
      surfaces: riskBySurface,
      assessed_cells: comparisonRows.length * NETWORK_SURFACES.length,
    },
    propagation_candidates: propagationCandidates,
    competitor_summary: competitorSummary,
    sprint_plan: [
      { period: "Days 1–10", title: "Baseline and primary repair", gap: selectedGaps[0] || null },
      { period: "Days 11–20", title: "Supporting repair one", gap: selectedGaps[1] || null },
      { period: "Days 21–30", title: "Supporting repair two and verification", gap: selectedGaps[2] || null },
      { period: "Day 30 decision", title: "Protect, iterate or scale", gap: null, decision: network.executive_summary?.scale_rule || "Scale only after the public acceptance evidence passes." },
    ],
    decision_asks: network.executive_summary ? [
      network.executive_summary.decision_required,
      `Confirm ${selectedGaps.map((gap) => gap.execution_owner_label).join(", ")} accountability for the approved Top 3.`,
      `Authorize network rollout only when the focus-location public checks pass.`,
    ] : [],
    publication_approval: network.publication_approval || null,
    decision_intelligence: buildMultiLocationDecisionViewModel(report),
    primary_comparison_rows: comparisonRows.slice(0, 4),
    additional_comparison_rows: comparisonRows.slice(4),
  });
}

export function buildFocusLocationNavigationModel(report) {
  if (report?.audit?.format !== "multi_location" || report.audit.package_role !== "focus_location") return null;
  return Object.freeze({
    parent_route: report.audit.parent_route,
    location_name: report.practice?.name || "Focus location",
  });
}
