export const OWNER_BRIEF_LAYOUT_CONTRACT = "owner-brief/2.1.0";
export const PREVIOUS_OWNER_BRIEF_LAYOUT_CONTRACT = "owner-brief/2.0.0";
export const LEGACY_SPOKEN_OWNER_BRIEF_LAYOUT_CONTRACT = "spoken-owner-brief/1.0.0";
export const OWNER_BRIEF_COMMERCIAL_CONTRACT = "caesthetic-4444-commercial-core/1.0.0";
export const OWNER_BRIEF_CHECK500_PLACEMENT_CONTRACT = "check500-two-placement/1.0.0";
export const OWNER_BRIEF_CHECK500_COPY_CONTRACT = "check500-section/en-US/1.0.0";

export const OWNER_BRIEF_SECTION_IDS = Object.freeze([
  "gap-map",
  "focus-gaps",
  "sprint-fit",
  "repair-paths",
  "do-not-fund",
  "gap-inventory",
  "evidence-and-competitors",
  "scores-and-methodology",
  "next-step",
]);

export const OWNER_BRIEF_VERTICAL_PROFILES = Object.freeze([
  "med_spa",
  "beauty_salon",
]);

const REQUIRED_UI_LABELS = Object.freeze([
  "header_kicker",
  "prepared_label",
  "assessment_label",
  "constraint_label",
  "observed_label",
  "impact_label",
  "outcome_label",
  "done_label",
  "open_sources_label",
  "open_source_label",
  "cross_surface_label",
  "competitor_sources_label",
  "why_included_label",
  "why_chosen_label",
  "observed_advantage_label",
  "source_date_label",
  "repair_intro",
  "repair_outcome_label",
  "repair_steps_label",
  "repair_dependencies_label",
  "repair_owner_label",
  "repair_done_label",
  "revisit_label",
  "paths_coordination_label",
  "paths_risk_label",
  "sprint_client_input_label",
  "sprint_acceptance_label",
  "conclusion_title",
  "strength_label",
  "check_aria_label",
  "check_mid_placement_label",
  "check_final_placement_label",
]);

function invariant(condition, message) {
  if (!condition) throw new TypeError(message);
}

function requireText(value, label) {
  invariant(typeof value === "string" && value.trim().length > 0, `${label} is required`);
}

function requireTupleItems(items, label, { min = 1 } = {}) {
  invariant(Array.isArray(items) && items.length >= min, `${label} must contain at least ${min} items`);
  for (const [index, item] of items.entries()) {
    invariant(Array.isArray(item) && item.length === 2, `${label}[${index}] must be a title/body pair`);
    requireText(item[0], `${label}[${index}][0]`);
    requireText(item[1], `${label}[${index}][1]`);
  }
}

function requireLinkItems(items, label, { min = 1 } = {}) {
  invariant(Array.isArray(items) && items.length >= min, `${label} must contain at least ${min} items`);
  for (const [index, item] of items.entries()) {
    invariant(Array.isArray(item) && item.length === 2, `${label}[${index}] must be a label/URL pair`);
    requireText(item[0], `${label}[${index}][0]`);
    requireText(item[1], `${label}[${index}][1]`);
    const url = new URL(item[1]);
    invariant(["http:", "https:"].includes(url.protocol), `${label}[${index}][1] must use HTTP(S)`);
    invariant(!url.username && !url.password, `${label}[${index}][1] must not contain credentials`);
  }
}

export function isOwnerBriefLayout(report) {
  return [
    OWNER_BRIEF_LAYOUT_CONTRACT,
    PREVIOUS_OWNER_BRIEF_LAYOUT_CONTRACT,
    LEGACY_SPOKEN_OWNER_BRIEF_LAYOUT_CONTRACT,
  ].includes(report?.presentation?.layout_contract);
}

export function validateOwnerBriefPresentation(report) {
  if (!isOwnerBriefLayout(report)) return true;

  const presentation = report.presentation;
  const copy = presentation.owner_copy;
  invariant(copy && typeof copy === "object", "presentation.owner_copy is required for an owner brief");
  invariant(Array.isArray(copy.section_titles) && copy.section_titles.length === OWNER_BRIEF_SECTION_IDS.length, "owner brief requires exactly nine section titles");
  invariant(Array.isArray(copy.section_kickers) && copy.section_kickers.length === OWNER_BRIEF_SECTION_IDS.length, "owner brief requires exactly nine section kickers");

  if (presentation.layout_contract === LEGACY_SPOKEN_OWNER_BRIEF_LAYOUT_CONTRACT) return true;

  invariant(presentation.hide_unassessed === true, "owner brief must hide unassessed client-facing modules");
  invariant(presentation.strict_locale === report.reportContext?.report_locale, "owner brief strict locale must match report locale");
  invariant(OWNER_BRIEF_VERTICAL_PROFILES.includes(presentation.vertical_profile), "owner brief vertical profile is unsupported");
  invariant(presentation.commercial_contract === OWNER_BRIEF_COMMERCIAL_CONTRACT, "owner brief commercial contract is invalid");
  invariant(presentation.check500_placement_contract === OWNER_BRIEF_CHECK500_PLACEMENT_CONTRACT, "owner brief Check500 placement contract is invalid");
  invariant(copy.check500?.copy_contract === OWNER_BRIEF_CHECK500_COPY_CONTRACT, "owner brief Check500 copy contract is invalid");

  if (presentation.layout_contract === OWNER_BRIEF_LAYOUT_CONTRACT) {
    requireText(copy.research_scope?.kicker, "owner_copy.research_scope.kicker");
    requireText(copy.research_scope?.title, "owner_copy.research_scope.title");
    requireLinkItems(copy.research_scope?.links, "owner_copy.research_scope.links", { min: 4 });
    const approvedSources = new Set([
      ...report.surfaces.flatMap((surface) => surface.metrics),
      ...report.crossSurface.metrics,
    ]
      .filter((metric) => metric.reviewer_status === "approved" && metric.source)
      .flatMap((metric) => metric.source.split(";").map((source) => source.trim()).filter(Boolean)));
    for (const [, source] of copy.research_scope.links) {
      invariant(approvedSources.has(source), `owner_copy.research_scope.links contains an unapproved source: ${source}`);
    }
  } else {
    requireTupleItems(copy.research_scope?.items, "owner_copy.research_scope.items", { min: 4 });
  }
  invariant(copy.surface_labels && typeof copy.surface_labels === "object", "owner_copy.surface_labels is required");
  for (const surface of ["search", "website", "social", "reputation", "cross_surface"]) {
    requireText(copy.surface_labels[surface], `owner_copy.surface_labels.${surface}`);
  }
  invariant(Array.isArray(copy.implementation_options) && copy.implementation_options.length === 3, "owner brief requires exactly three implementation options");
  for (const [index, option] of copy.implementation_options.entries()) {
    for (const field of ["title", "body", "coordination", "risk"]) requireText(option?.[field], `owner_copy.implementation_options[${index}].${field}`);
  }

  invariant(copy.ui && typeof copy.ui === "object", "owner_copy.ui is required");
  for (const label of REQUIRED_UI_LABELS) requireText(copy.ui[label], `owner_copy.ui.${label}`);

  for (const field of ["kicker", "title", "body", "price", "cta", "client_input", "acceptance", "boundary"]) {
    requireText(copy.sprint_offer?.[field], `owner_copy.sprint_offer.${field}`);
  }
  for (const field of ["asset_src", "asset_alt", "asset_caption"]) requireText(copy.internal_boundary?.[field], `owner_copy.internal_boundary.${field}`);
  requireText(copy.thirty_day_note, "owner_copy.thirty_day_note");
  requireText(copy.check500.final_intro, "owner_copy.check500.final_intro");
  invariant(Array.isArray(copy.sprint_offer.items) && copy.sprint_offer.items.length > 0, "owner_copy.sprint_offer.items is required");
  for (const placement of ["mid", "final"]) requireText(copy.check500?.[placement]?.kicker, `owner_copy.check500.${placement}.kicker`);
  return true;
}
