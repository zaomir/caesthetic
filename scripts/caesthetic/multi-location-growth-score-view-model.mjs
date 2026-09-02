/**
 * Client-facing presentation model for the Multi-Location Growth Score.
 *
 * The audit package remains the only source of truth. This module derives
 * labels, ordering and progressive-disclosure groups without changing facts,
 * scores, the binding constraint or the manager-approved Top 3.
 */

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
