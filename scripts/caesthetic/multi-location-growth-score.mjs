/**
 * Multi-Location Growth Score profile for the canonical schema-v5 report.
 *
 * The parent remains a Growth Score report. This module adds network topology,
 * coverage and parent/child invariants without creating a Network Score.
 */

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
  });

  forbidAggregateNetworkScore(report.network, "network");
  return report;
}

export function validateMultiLocationFocusLocationReport(report) {
  object(report, "report");
  invariant(report.schemaVersion === 5, "focus child requires schemaVersion=5");
  invariant(isMultiLocationFocusLocation(report), "report must be a multi_location focus_location");
  const audit = object(report.audit, "audit");
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
  invariant(parent.audit.access_group_id === child.audit.access_group_id, "parent and child access_group_id must match");
  invariant(parent.audit.parent_route === child.audit.parent_route, "parent route must match across the package");
  invariant(parent.audit.child_route === child.audit.child_route, "child route must match across the package");
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

function stateLabel(state) {
  return ({ protect: "Protect", watch: "Watch", fix_now: "Fix now", needs_verification: "Needs verification" })[state] || state;
}

export function networkCoverageHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const network = report.network;
  const focus = network.locations.find((location) => location.id === network.focus_location_id);
  return `<section class="cae-network-summary" aria-label="Multi-Location coverage">
    <div><span>Declared locations</span><strong>${escapeHtml(network.declared_location_count)}</strong></div>
    <div><span>Reviewed locations</span><strong>${escapeHtml(network.reviewed_location_count)}</strong></div>
    <div><span>Focus location</span><strong>${escapeHtml(focus?.name || network.focus_location_id)}</strong></div>
    <div><span>Method</span><strong>Public sources only</strong></div>
    <p>${escapeHtml(network.focus_location_selection_rationale)}</p>
    <a class="cae-report-inline-link" href="${escapeHtml(report.audit.child_route)}">View the full Growth Score for ${escapeHtml(focus?.name || network.focus_location_id)}</a>
  </section>`;
}

export function networkJourneyAtlasHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const network = report.network;
  const locationCards = network.locations.map((location) => `<li data-location-state="${escapeHtml(location.state)}"${location.id === network.focus_location_id ? ' data-focus-location="true"' : ""}>
    <strong>${escapeHtml(location.name)}</strong><span>${escapeHtml(location.public_location)}</span><small>${escapeHtml(location.state.replaceAll("_", " "))}</small>
  </li>`).join("");
  const patternCards = network.repeated_patterns.map((pattern) => `<article>
    <span>${escapeHtml(pattern.surface.replaceAll("_", " "))}</span><h4>${escapeHtml(pattern.title)}</h4>
    <p>Observed in ${escapeHtml(pattern.observed_in_reviewed_count)} of ${escapeHtml(network.reviewed_location_count)} reviewed locations.</p>
  </article>`).join("");
  return `<section class="cae-network-atlas" aria-labelledby="network-atlas-title">
    <p class="cae-kicker">Network Journey Atlas</p>
    <h3 class="cae-report-subhead" id="network-atlas-title">One network. Different public journeys.</h3>
    <p>The map separates shared assets from location-specific evidence. It does not calculate an aggregate Network Score.</p>
    <div class="cae-network-atlas__assets"><div><span>Shared assets</span><strong>${escapeHtml(network.shared_assets.length)}</strong></div><div><span>Local assets</span><strong>${escapeHtml(network.local_assets.length)}</strong></div><div><span>Reviewed journey graphs</span><strong>${escapeHtml(network.location_graph_refs.length)}</strong></div></div>
    <ul class="cae-network-atlas__locations">${locationCards}</ul>
    <div class="cae-network-patterns">${patternCards}</div>
  </section>`;
}

export function networkFocusScopeHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const gaps = selectedGaps(report);
  return `<div class="cae-network-focus-scopes">${gaps.map((gap) => `<article><span>${escapeHtml(gap.network_scope.scope.replaceAll("_", " "))}</span><strong>${escapeHtml(gap.title)}</strong><small>Affects ${escapeHtml(gap.network_scope.affected_location_ids.length)} reviewed location(s) · pilot: ${escapeHtml(report.network.focus_location_id)}</small></article>`).join("")}</div>`;
}

export function networkComparisonHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  const network = report.network;
  const names = new Map(network.locations.map((location) => [location.id, location.name]));
  const header = SURFACES.map((surface) => `<th scope="col">${escapeHtml(surface)}</th>`).join("");
  const rows = network.comparison_matrix.map((row) => `<tr${row.location_id === network.focus_location_id ? ' data-focus-location="true"' : ""}><th scope="row">${escapeHtml(names.get(row.location_id) || row.location_id)}</th>${SURFACES.map((surface) => `<td data-surface="${escapeHtml(surface)}" data-state="${escapeHtml(row[surface].state)}"><strong>${escapeHtml(stateLabel(row[surface].state))}</strong><span>${escapeHtml(row[surface].summary)}</span></td>`).join("")}</tr>`).join("");
  return `<section class="cae-network-comparison" aria-labelledby="network-comparison-title">
    <p class="cae-kicker">Internal network comparison</p>
    <h3 class="cae-report-subhead" id="network-comparison-title">What should be protected, repaired or propagated</h3>
    <p>Locations are compared only on equivalent public evidence. They are not ranked as businesses.</p>
    <div class="cae-table-scroll"><table><thead><tr><th scope="col">Location</th>${header}</tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

export function networkMethodHtml(report) {
  if (!isMultiLocationNetworkParent(report)) return "";
  return `<section class="cae-network-method" role="note"><strong>No aggregate Network Score.</strong><p>Use the location × Four Surfaces evidence matrix, declared-versus-reviewed coverage and individual location scores only where their normal schema-v5 coverage gates pass.</p></section>`;
}

export function focusChildNavigationHtml(report) {
  if (!isMultiLocationFocusLocation(report)) return "";
  return `<section class="cae-network-child-nav" role="navigation" aria-label="Multi-Location package"><p>This location report is part of one Multi-Location Growth Score package.</p><a class="cae-report-inline-link" href="${escapeHtml(report.audit.parent_route)}">Back to the network analysis</a></section>`;
}
