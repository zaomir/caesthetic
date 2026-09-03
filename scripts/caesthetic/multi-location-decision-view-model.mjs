/**
 * Pure presentation projection for Multi-Location decision intelligence.
 *
 * Input is the already validated network envelope. This module only reshapes
 * approved per-location decisionViews; it never changes evidence, scores,
 * the binding constraint, the focus location or the approved Top 3.
 */

import { deriveGrowthScoreDecisionViews } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

export const MULTI_LOCATION_DECISION_INTELLIGENCE_VERSION = "multi-location-decision-intelligence/1.0.0";

export const DECISION_INTELLIGENCE_SURFACES = Object.freeze([
  "search",
  "website",
  "social",
  "reputation",
]);

const TREATMENT_RANK = Object.freeze({ not_assessed: 0, protect: 1, watch: 2, fix_now: 3 });
const PROVIDER_RANK = Object.freeze({ not_assessed: 0, visible: 1, partial: 2, not_visible: 3 });
const TRUST_RANK = Object.freeze({ not_assessed: 0, connected: 1, friction: 2, broken: 3 });
const FRICTION_RANK = Object.freeze({ not_assessed: 0, clear: 1, friction: 2, broken: 3 });

function worstState(items, rank, fallback = "not_assessed") {
  return items.reduce((current, item) => (
    (rank[item.status] ?? 0) > (rank[current] ?? 0) ? item.status : current
  ), fallback);
}

function orderedReviewedLocations(report) {
  const focusId = report.network.focus_location_id;
  return report.network.locations
    .filter((location) => location.state === "reviewed")
    .sort((left, right) => left.id === focusId ? -1 : right.id === focusId ? 1 : 0);
}

function missingCell(location) {
  return Object.freeze({
    location_id: location.id,
    location_name: location.name,
    is_focus: false,
    status: "not_assessed",
    status_label: "Needs verification",
    summary: "No approved treatment-specific projection is available for this location.",
    observed_surface_count: 0,
    surfaces: Object.freeze({}),
    evidence_refs: Object.freeze([]),
  });
}

function treatmentStateLabel(status) {
  return ({
    protect: "Protect",
    watch: "Watch",
    fix_now: "Fix now",
    not_assessed: "Needs verification",
  })[status] || "Needs verification";
}

function providerStateLabel(status) {
  return ({
    visible: "Visible",
    partial: "Partial",
    not_visible: "Not visible",
    not_assessed: "Needs verification",
  })[status] || "Needs verification";
}

function frictionStateLabel(status) {
  return ({
    clear: "Clear",
    friction: "Friction",
    broken: "Confirmed break",
    not_assessed: "Needs verification",
  })[status] || "Needs verification";
}

function treatmentScope(report, cells) {
  const affected = cells.filter((cell) => ["watch", "fix_now"].includes(cell.status));
  if (!affected.length) return Object.freeze({ id: "not_assessed", label: "No repeated gap established" });
  if (affected.length === 1) return Object.freeze({ id: "local", label: "Local" });

  const shared = report.network.shared_assets.some((asset) => {
    const usedBy = new Set(asset.used_by_location_ids);
    return affected.every((cell) => usedBy.has(cell.location_id))
      && affected.some((cell) => ["watch", "fix_now"].includes(cell.surfaces[asset.surface]?.status));
  });
  return Object.freeze(shared
    ? { id: "shared_asset", label: "Shared asset" }
    : { id: "repeated_pattern", label: "Repeated pattern" });
}

function treatmentCell(location, item, focusId) {
  if (!item) {
    const cell = missingCell(location);
    return Object.freeze({ ...cell, is_focus: location.id === focusId });
  }
  const surfaceItems = DECISION_INTELLIGENCE_SURFACES.map((surface) => item.surfaces[surface]);
  const status = worstState(surfaceItems, TREATMENT_RANK);
  const evidenceRefs = [...new Set(surfaceItems.flatMap((surface) => surface.evidence_refs || []))];
  return Object.freeze({
    location_id: location.id,
    location_name: location.name,
    is_focus: location.id === focusId,
    status,
    status_label: treatmentStateLabel(status),
    summary: status === "not_assessed"
      ? "Needs verification across the Four Surfaces."
      : `${item.observed_surface_count}/4 surfaces assessed; the most decision-relevant state is ${treatmentStateLabel(status).toLowerCase()}.`,
    observed_surface_count: item.observed_surface_count,
    surfaces: item.surfaces,
    evidence_refs: Object.freeze(evidenceRefs),
  });
}

function buildTreatmentMatrix(report, locations, projections) {
  const metadata = new Map();
  projections.forEach(({ derived }) => derived.treatment_opportunity_matrix.items.forEach((item) => {
    if (!metadata.has(item.id)) metadata.set(item.id, { id: item.id, label: item.label, priority: item.priority });
  }));
  const projectionByLocation = new Map(projections.map((projection) => [projection.location.id, projection]));
  const rows = [...metadata.values()].map((treatment) => {
    const cells = locations.map((location) => {
      const projection = projectionByLocation.get(location.id);
      const item = projection?.derived.treatment_opportunity_matrix.items.find((candidate) => candidate.id === treatment.id);
      return treatmentCell(location, item, report.network.focus_location_id);
    });
    const observedIn = cells.filter((cell) => cell.status !== "not_assessed").length;
    const affected = cells.filter((cell) => ["watch", "fix_now"].includes(cell.status));
    return Object.freeze({
      ...treatment,
      cells: Object.freeze(cells),
      observed_in_reviewed_count: observedIn,
      affected_location_ids: Object.freeze(affected.map((cell) => cell.location_id)),
      scope: treatmentScope(report, cells),
    });
  });
  return Object.freeze(rows);
}

function buildProviderVisibility(locations, projections, focusId) {
  const projectionByLocation = new Map(projections.map((projection) => [projection.location.id, projection]));
  const groups = locations.map((location) => {
    const providers = projectionByLocation.get(location.id)?.derived.provider_visibility_map.items || [];
    return Object.freeze({
      location_id: location.id,
      location_name: location.name,
      is_focus: location.id === focusId,
      status: providers.length ? "assessed" : "not_assessed",
      providers: Object.freeze(providers.map((provider) => {
        const surfaces = DECISION_INTELLIGENCE_SURFACES.map((surface) => provider.surfaces[surface]);
        const status = worstState(surfaces, PROVIDER_RANK);
        return Object.freeze({
          ...provider,
          status,
          status_label: providerStateLabel(status),
        });
      })),
    });
  });
  const unresolvedLocations = groups.filter((group) => (
    !group.providers.length || group.providers.some((provider) => ["partial", "not_visible", "not_assessed"].includes(provider.status))
  ));
  return Object.freeze({
    groups: Object.freeze(groups),
    unresolved_location_count: unresolvedLocations.length,
    reviewed_location_count: locations.length,
  });
}

function buildTrustChains(projections, focusId) {
  const items = projections.flatMap(({ location, derived }) => derived.trust_chain.items.map((chain) => Object.freeze({
    ...chain,
    location_id: location.id,
    location_name: location.name,
    is_focus: location.id === focusId,
  })));
  items.sort((left, right) => (
    (TRUST_RANK[right.status] - TRUST_RANK[left.status])
    || Number(right.is_focus) - Number(left.is_focus)
    || left.location_name.localeCompare(right.location_name)
  ));
  return Object.freeze({
    representative: Object.freeze(items.slice(0, 5)),
    additional: Object.freeze(items.slice(5)),
    total: items.length,
  });
}

function buildFrictionByLocation(locations, projections, focusId) {
  const stages = ["discovery", "trust", "enquiry", "booking"];
  const projectionByLocation = new Map(projections.map((projection) => [projection.location.id, projection]));
  return Object.freeze(locations.map((location) => {
    const paths = projectionByLocation.get(location.id)?.derived.patient_friction_index.items || [];
    const stageStates = Object.fromEntries(stages.map((stage) => {
      const state = worstState(paths.map((path) => path.stages[stage]), FRICTION_RANK);
      return [stage, Object.freeze({ status: state, status_label: frictionStateLabel(state) })];
    }));
    const overall = worstState(Object.values(stageStates), FRICTION_RANK);
    return Object.freeze({
      location_id: location.id,
      location_name: location.name,
      is_focus: location.id === focusId,
      status: overall,
      status_label: frictionStateLabel(overall),
      stages: Object.freeze(stageStates),
      paths: Object.freeze(paths),
    });
  }));
}

function buildPromotionHolds(projections, treatmentMatrix) {
  const treatmentById = new Map(treatmentMatrix.map((treatment) => [treatment.id, treatment]));
  const grouped = new Map();
  projections.forEach(({ location, derived }) => {
    derived.do_not_promote_yet_by_treatment.items.forEach((hold) => {
      if (!grouped.has(hold.treatment_id)) grouped.set(hold.treatment_id, []);
      grouped.get(hold.treatment_id).push(Object.freeze({
        ...hold,
        location_id: location.id,
        location_name: location.name,
      }));
    });
  });
  return Object.freeze([...grouped.entries()].map(([treatmentId, holds]) => Object.freeze({
    treatment_id: treatmentId,
    treatment_label: treatmentById.get(treatmentId)?.label || treatmentId,
    affected_location_count: holds.length,
    affected_location_names: Object.freeze(holds.map((hold) => hold.location_name)),
    holds: Object.freeze(holds),
  })));
}

export function buildMultiLocationDecisionViewModel(report) {
  const intelligence = report?.network?.decision_intelligence;
  if (!intelligence) return null;

  const locations = orderedReviewedLocations(report);
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const projections = intelligence.location_projections.map((projection) => Object.freeze({
    location: locationById.get(projection.location_id),
    source: projection.decision_views,
    derived: deriveGrowthScoreDecisionViews(projection.decision_views),
  }));
  const treatmentMatrix = buildTreatmentMatrix(report, locations, projections);
  const assessedLocationCount = projections.filter((projection) => projection.source.assessment_status === "assessed").length;

  return Object.freeze({
    artifact_version: intelligence.artifact_version,
    assessment_status: intelligence.assessment_status,
    coverage: Object.freeze({
      reviewed: locations.length,
      assessed: assessedLocationCount,
      not_assessed: locations.length - assessedLocationCount,
    }),
    locations: Object.freeze(locations),
    primary_locations: Object.freeze(locations.slice(0, 4)),
    additional_locations: Object.freeze(locations.slice(4)),
    treatment_matrix: treatmentMatrix,
    provider_visibility: buildProviderVisibility(locations, projections, report.network.focus_location_id),
    trust_chains: buildTrustChains(projections, report.network.focus_location_id),
    friction_by_location: buildFrictionByLocation(locations, projections, report.network.focus_location_id),
    promotion_holds: buildPromotionHolds(projections, treatmentMatrix),
  });
}
