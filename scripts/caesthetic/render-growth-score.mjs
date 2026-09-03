#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  displayScore,
  isSelectedForRepair,
  scoreGrowthReport,
  selectedFocusGapIds,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import {
  executiveNetworkDecisionHtml,
  focusChildNavigationHtml,
  isMultiLocationFocusLocation,
  isMultiLocationNetworkParent,
  networkCompetitorSummaryHtml,
  networkComparisonHtml,
  networkCoverageHtml,
  networkEvidenceBoundaryHtml,
  networkExecutiveDecisionHtml,
  networkFocusDecisionHtml,
  networkJourneyAtlasHtml,
  networkMethodHtml,
  networkOperationalPlanHtml,
  networkOwnershipRolloutHtml,
  networkPropagationHtml,
  networkRiskProfileHtml,
  validateMultiLocationNetworkReport,
} from "./multi-location-growth-score.mjs";
import { buildMultiLocationPresentationModel } from "./multi-location-growth-score-view-model.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scoreRoot = path.join(repoRoot, "site-caesthetic/score");
const realScoreSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{16,}$/;
const DEMAND_STAGES = Object.freeze([
  { id: "discovery", label: "Discovery" },
  { id: "trust", label: "Trust" },
  { id: "enquiry", label: "Enquiry" },
  { id: "booking", label: "Booking" },
  { id: "treatment", label: "Treatment" },
]);
const SURFACE_NAV = Object.freeze([
  { id: "search", label: "SEARCH" },
  { id: "website", label: "WEBSITE" },
  { id: "social", label: "SOCIAL" },
  { id: "reputation", label: "REPUTATION" },
]);
const surfaceLabels = Object.freeze({
  search: "Search",
  website: "Website",
  social: "Social",
  reputation: "Reputation",
  cross_surface: "Cross-Surface",
});
const FOCUS_RANKS = Object.freeze(["1", "2", "3"]);
const VALERIE = Object.freeze({
  name: "Valerie Petra",
  role: "CAESTHETIC Growth Advisor",
});

let protectedRenderValues = null;
const escapeHtml = (value) => {
  const escaped = String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  if (!protectedRenderValues) return escaped;
  const token = `@@CAE_REPORT_VALUE_${protectedRenderValues.length}@@`;
  protectedRenderValues.push([token, escaped]);
  return token;
};

const sentenceCase = (value) => String(value ?? "")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const refs = (items = []) => escapeHtml(items.join(", "));
const stringList = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${label} is required`);
}

function requireArray(value, label, { min = 1, max = Infinity } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new TypeError(`${label} must be an array with ${min}${max === Infinity ? "+" : `–${max}`} items`);
  }
}

function requireReportContent(report) {
  const diagnosis = report.humanDiagnosis;
  if (report.schemaVersion !== 5) throw new TypeError("schemaVersion must be 5");
  if (report.reportKind === "real") {
    requireNonEmptyString(report.disclosure, "disclosure");
  }
  if (!diagnosis?.reviewer?.name || !diagnosis.reviewer.approved_at) {
    throw new TypeError("humanDiagnosis.reviewer requires a named human and approval timestamp");
  }
  requireNonEmptyString(diagnosis.reviewer_status, "humanDiagnosis.reviewer_status");
  if (!Array.isArray(diagnosis.gap_inventory) || diagnosis.gap_inventory.length === 0) {
    throw new TypeError("humanDiagnosis.gap_inventory must be a non-empty array");
  }
  const selectedIds = selectedFocusGapIds(diagnosis.focus_selection);
  if (selectedIds.length !== 3) {
    throw new TypeError("humanDiagnosis.focus_selection must contain exactly 3 unique gaps");
  }
  for (const pathId of ["diy", "other_provider", "defer", "caesthetic"]) {
    if (!report.implementation_paths?.[pathId]) throw new TypeError(`implementation_paths.${pathId} is required`);
  }
  for (const key of ["evidence_advantage", "coordination_advantage", "sprint_boundary", "ownership"]) {
    if (!report.why_caesthetic?.[key]) throw new TypeError(`why_caesthetic.${key} is required`);
  }

  const checkDecision = report.leadToRevenueCheck;
  if (checkDecision !== undefined) {
    if (!["recommended", "not_recommended"].includes(checkDecision?.recommendation)) {
      throw new TypeError("leadToRevenueCheck.recommendation must be recommended or not_recommended");
    }
    requireNonEmptyString(checkDecision.reason, "leadToRevenueCheck.reason");
    if (checkDecision.recommendation === "recommended") {
      requireArray(checkDecision.evidence_refs, "leadToRevenueCheck.evidence_refs");
      checkDecision.evidence_refs.forEach((ref, index) => requireNonEmptyString(ref, `leadToRevenueCheck.evidence_refs[${index}]`));
    }
    if (
      report.audit?.format === "multi_location"
      && report.audit?.package_role === "focus_location"
      && checkDecision.recommendation === "recommended"
    ) {
      throw new TypeError("Multi-Location focus child cannot recommend Lead-to-Revenue Check; the network parent owns the commercial decision");
    }
  }

  requireNonEmptyString(diagnosis.objective_strength?.title, "humanDiagnosis.objective_strength.title");
  requireArray(diagnosis.objective_strength?.evidence_refs, "humanDiagnosis.objective_strength.evidence_refs");
  requireNonEmptyString(diagnosis.strongest_surface, "humanDiagnosis.strongest_surface");
  requireNonEmptyString(diagnosis.binding_constraint?.title, "humanDiagnosis.binding_constraint.title");
  requireArray(diagnosis.binding_constraint?.evidence_refs, "humanDiagnosis.binding_constraint.evidence_refs");
  requireNonEmptyString(diagnosis.binding_constraint?.statement, "humanDiagnosis.binding_constraint.statement");
  if (!DEMAND_STAGES.some((stage) => stage.id === diagnosis.binding_constraint?.demand_stage)) {
    throw new TypeError("humanDiagnosis.binding_constraint.demand_stage must be discovery|trust|enquiry|booking|treatment");
  }

  const currentState = diagnosis.current_state;
  requireArray(currentState?.strengths, "humanDiagnosis.current_state.strengths", { min: 1, max: 2 });
  currentState.strengths.forEach((item, index) => requireNonEmptyString(item, `humanDiagnosis.current_state.strengths[${index}]`));
  requireNonEmptyString(currentState?.constraint_label, "humanDiagnosis.current_state.constraint_label");
  requireNonEmptyString(currentState?.constraint_detail, "humanDiagnosis.current_state.constraint_detail");
  requireNonEmptyString(currentState?.priority_line, "humanDiagnosis.current_state.priority_line");

  diagnosis.gap_inventory.forEach((gap, index) => {
    requireNonEmptyString(gap.id, `humanDiagnosis.gap_inventory[${index}].id`);
    requireNonEmptyString(gap.title, `humanDiagnosis.gap_inventory[${index}].title`);
    requireNonEmptyString(gap.diagnosis_state, `humanDiagnosis.gap_inventory[${index}].diagnosis_state`);
    requireNonEmptyString(gap.journey_stage, `humanDiagnosis.gap_inventory[${index}].journey_stage`);
    requireNonEmptyString(gap.why_it_matters, `humanDiagnosis.gap_inventory[${index}].why_it_matters`);
    requireArray(gap.surfaces, `humanDiagnosis.gap_inventory[${index}].surfaces`);
    requireNonEmptyString(gap.sprint_fit?.mode, `humanDiagnosis.gap_inventory[${index}].sprint_fit.mode`);
    requireNonEmptyString(gap.repair_plan?.outcome, `humanDiagnosis.gap_inventory[${index}].repair_plan.outcome`);
    requireArray(gap.repair_plan?.diy_steps, `humanDiagnosis.gap_inventory[${index}].repair_plan.diy_steps`);
    requireArray(gap.repair_plan?.done_when, `humanDiagnosis.gap_inventory[${index}].repair_plan.done_when`);
    requireNonEmptyString(gap.repair_plan?.owner_role, `humanDiagnosis.gap_inventory[${index}].repair_plan.owner_role`);
  });
  requireNonEmptyString(diagnosis.focus_selection?.primary_gap_id, "humanDiagnosis.focus_selection.primary_gap_id");
  requireArray(diagnosis.focus_selection?.supporting_gap_ids, "humanDiagnosis.focus_selection.supporting_gap_ids", { min: 2, max: 2 });
  requireNonEmptyString(diagnosis.focus_selection?.selected_by, "humanDiagnosis.focus_selection.selected_by");
  requireNonEmptyString(diagnosis.focus_selection?.selected_at, "humanDiagnosis.focus_selection.selected_at");
  requireNonEmptyString(diagnosis.focus_selection?.rationale, "humanDiagnosis.focus_selection.rationale");
  requireNonEmptyString(diagnosis.binding_constraint?.gap_ref, "humanDiagnosis.binding_constraint.gap_ref");

  requireNonEmptyString(diagnosis.do_not_do?.title, "humanDiagnosis.do_not_do.title");
  requireArray(diagnosis.do_not_do?.evidence_refs, "humanDiagnosis.do_not_do.evidence_refs");
  requireNonEmptyString(diagnosis.do_not_do?.rationale, "humanDiagnosis.do_not_do.rationale");
  requireArray(diagnosis.do_not_do?.revisit_after, "humanDiagnosis.do_not_do.revisit_after");

  if (!diagnosis.coordination_burden || typeof diagnosis.coordination_burden !== "object") {
    throw new TypeError("humanDiagnosis.coordination_burden is required");
  }
  for (const field of ["diagnosed_issues", "high_priority_fixes", "systems_involved", "dependencies", "specialist_roles"]) {
    const value = diagnosis.coordination_burden[field];
    if (value !== undefined && value !== null && (!Number.isInteger(value) || value < 0)) {
      throw new TypeError(`humanDiagnosis.coordination_burden.${field} must be a non-negative integer or null`);
    }
  }

  if (!diagnosis.walkthrough || typeof diagnosis.walkthrough !== "object") {
    throw new TypeError("humanDiagnosis.walkthrough is required");
  }
  if (!["available", "pending"].includes(diagnosis.walkthrough.status)) {
    throw new TypeError("humanDiagnosis.walkthrough.status must be available or pending");
  }
  if (diagnosis.walkthrough.status === "available") {
    requireNonEmptyString(diagnosis.walkthrough.url, "humanDiagnosis.walkthrough.url");
  }
  if (diagnosis.walkthrough.status === "pending") {
    requireNonEmptyString(diagnosis.walkthrough.placeholder, "humanDiagnosis.walkthrough.placeholder");
  }

  for (const surface of report.surfaces ?? []) {
    const card = surface.owner_card;
    if (!card) throw new TypeError(`surfaces.${surface.id}.owner_card is required`);
    requireNonEmptyString(card.strength, `surfaces.${surface.id}.owner_card.strength`);
    requireNonEmptyString(card.problem, `surfaces.${surface.id}.owner_card.problem`);
    if (!["HIGH", "MEDIUM", "LOW"].includes(card.priority)) {
      throw new TypeError(`surfaces.${surface.id}.owner_card.priority must be HIGH|MEDIUM|LOW`);
    }
    if (card.status !== undefined && !["protect", "watch", "fix_now", "needs_verification"].includes(card.status)) {
      throw new TypeError(`surfaces.${surface.id}.owner_card.status must be protect|watch|fix_now|needs_verification`);
    }
  }
}

function metricClassLabel(metric) {
  if (metric.evidence_class === "A") return "CLASS A · VERIFIED";
  const extras = [];
  if (metric.method) extras.push(`Method: ${escapeHtml(metric.method)}`);
  if (metric.assumptions) {
    const assumptions = Array.isArray(metric.assumptions) ? metric.assumptions.join("; ") : metric.assumptions;
    extras.push(`Assumptions: ${escapeHtml(assumptions)}`);
  }
  const suffix = extras.length ? ` · ${extras.join(" · ")}` : "";
  return `ESTIMATE · CLASS B${suffix}`;
}

function metricEvidenceRows(metrics, metricResults, sufficient) {
  const coverageNote = sufficient ? "" : '<li class="cae-report-note">Insufficient evidence for a surface score. Available and unavailable metric states are shown below.</li>';
  return coverageNote + metrics.map((metric) => {
    const result = metricResults.find((candidate) => candidate.metric_id === metric.metric_id);
    const scoreValue = result?.normalized_score ?? metric.normalized_score;
    const raw = metric.raw_value === null || metric.raw_value === undefined
      ? "Not collected"
      : typeof metric.raw_value === "object" ? JSON.stringify(metric.raw_value) : String(metric.raw_value);
    return `
              <li class="cae-report-metric">
                <div>
                  <p class="cae-kicker">${metricClassLabel(metric)}</p>
                  <strong>${escapeHtml(metric.label || sentenceCase(metric.metric_id))}</strong>
                  <p>${escapeHtml(metric.finding || metric.unavailable_reason || "No published finding for this metric.")}</p>
                </div>
                <span>${displayScore(scoreValue)}</span>
                <small>Source: ${escapeHtml(metric.source || "No source: unavailable")} · Collected: ${escapeHtml(metric.collected_at || "No collection date")} · Raw: ${escapeHtml(raw)}</small>
              </li>`;
  }).join("");
}

function reviewThemeRows(themes, emptyLabel) {
  if (themes.length === 0) return `<li>${escapeHtml(emptyLabel)}</li>`;
  return themes.map((theme) => `<li>${escapeHtml(theme.theme)} <small>${theme.mentions}/${theme.sample_size} eligible reviews · ${escapeHtml(theme.window)} · Evidence: ${refs(theme.evidence_refs)}</small></li>`).join("");
}

function decisionRows(items) {
  return items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.rationale)}</p><small>Evidence: ${refs(item.evidence_refs)}</small></li>`).join("");
}

function comparisonMatrixHtml(matrix) {
  return `
        <div class="cae-report-comparison-wrap" role="region" aria-label="Competitive comparison matrix" tabindex="0">
          <table class="cae-report-comparison-matrix">
            <caption>Comparison Matrix — subject and named alternatives across the same Four Surfaces</caption>
            <thead><tr><th>Business</th>${SURFACE_NAV.map((surface) => `<th>${surface.label}</th>`).join("")}</tr></thead>
            <tbody>
${matrix.rows.map((row) => `              <tr>
                <th scope="row">${escapeHtml(row.entity_name)}${row.entity_type === "subject" ? " <small>Subject</small>" : ""}</th>
                ${SURFACE_NAV.map((surface) => `<td>${escapeHtml(row[surface.id])}</td>`).join("")}
              </tr>`).join("\n")}
            </tbody>
          </table>
        </div>`;
}

function marketPracticeGapHtml(gap) {
  if (gap.status !== "applicable") {
    return `<div class="cae-report-market-gap"><p class="cae-kicker">Market Practice Gap · ${escapeHtml(gap.status)}</p><p>${escapeHtml(gap.reason)}</p></div>`;
  }
  return `<div class="cae-report-market-gap">
          <p class="cae-kicker">Market Practice Gap · Strategic Modernization</p>
          <h3>Newer is not automatically better. Test the decision and validation gates.</h3>
          <p>${escapeHtml(gap.reason)}</p>
          <div class="cae-report-market-gap__grid">
${gap.recommendations.map((item) => `            <article>
              <p class="cae-report-market-gap__decision">${escapeHtml(item.decision.replaceAll("_", " "))}</p>
              <h4>${escapeHtml(item.title)}</h4>
              <p><strong>Current:</strong> ${escapeHtml(item.current_state)}</p>
              <p><strong>Observed shift:</strong> ${escapeHtml(item.market_shift)}</p>
              <p><strong>Scope:</strong> ${escapeHtml(item.evidence_scope)}</p>
              <p><strong>Business implication:</strong> ${escapeHtml(item.business_implication)}</p>
              <p><strong>Transition economics:</strong> ${escapeHtml(item.transition_economics)}</p>
              <p><strong>Dependencies:</strong> ${escapeHtml(item.dependencies.join("; "))}</p>
              <p><strong>Validation gate:</strong> ${escapeHtml(item.specialist_validation)}</p>
              <p class="cae-report-note"><strong>Limitations:</strong> ${escapeHtml(item.limitations)}</p>
              <small>Evidence: ${refs(item.evidence_refs)}</small>
            </article>`).join("\n")}
          </div>
        </div>`;
}

function competitorRows(competitors) {
  if (competitors.status === "not_applicable") {
    return `<p><strong>Competitive Decision Analysis:</strong> Not applicable. ${escapeHtml(competitors.reason)}</p>`;
  }
  const summary = competitors.decision_summary;
  return `
        <p class="cae-report-note"><strong>Selection method:</strong> ${escapeHtml(competitors.selection_method)}<br>
        <strong>Window:</strong> ${escapeHtml(competitors.comparison_window.start)} to ${escapeHtml(competitors.comparison_window.end)} · <strong>Branch scope:</strong> ${escapeHtml(competitors.branch_scope)}<br>
        <strong>Review sample rule:</strong> ${escapeHtml(competitors.review_sample_rule)}<br>
        <strong>Sample limitations:</strong> ${escapeHtml(competitors.sample_limitations)}</p>
${comparisonMatrixHtml(competitors.comparison_matrix)}
        <div class="cae-report-competitor-cards">
${competitors.entries.map((competitor) => `          <article class="cae-report-competitor-card">
              <p class="cae-kicker">Competitor Card · ${escapeHtml(competitor.competitor_type.replaceAll("_", " "))}</p>
              <h3>${escapeHtml(competitor.name)}</h3>
              <p><strong>Why included:</strong> ${escapeHtml(competitor.selection_reason)}</p>
              <p><strong>Why a patient may choose it:</strong> ${escapeHtml(competitor.patient_choice_reason)}</p>
              <p><strong>Observed strengths:</strong> ${escapeHtml(competitor.strengths.join("; "))}</p>
              <p><strong>Weaknesses / risks:</strong> ${escapeHtml(competitor.weaknesses_or_risks.join("; "))}</p>
              <div class="cae-report-competitor-card__themes">
                <div><h4>Repeated positive themes</h4><ul>${reviewThemeRows(competitor.repeated_positive_themes, "Insufficient repetition for a positive theme.")}</ul></div>
                <div><h4>Repeated negative themes</h4><ul>${reviewThemeRows(competitor.repeated_negative_themes, "Insufficient repetition for a negative theme.")}</ul></div>
              </div>
              <dl>
                <div><dt>Observable advantage</dt><dd>${escapeHtml(competitor.observable_advantage)}</dd></div>
                <div><dt>Observable gap</dt><dd>${escapeHtml(competitor.observable_gap)}</dd></div>
                <div><dt>Repeat</dt><dd>${escapeHtml(competitor.repeat)}</dd></div>
                <div><dt>Improve</dt><dd>${escapeHtml(competitor.improve)}</dd></div>
                <div><dt>Do not copy</dt><dd>${escapeHtml(competitor.do_not_copy)}</dd></div>
                <div><dt>Strategic implication</dt><dd>${escapeHtml(competitor.strategic_implication)}</dd></div>
                <div><dt>Constraint effect</dt><dd>${escapeHtml(competitor.constraint_effect)}</dd></div>
                <div><dt>Priority effect</dt><dd>${escapeHtml(competitor.priority_effect)}</dd></div>
                <div><dt>Modernization implication</dt><dd>${escapeHtml(competitor.modernization_implication)}</dd></div>
              </dl>
              <p class="cae-report-note"><strong>Limitations:</strong> ${escapeHtml(competitor.limitations)}</p>
              <p class="cae-report-note"><strong>Sources:</strong> ${competitor.sources.map((source) => `${escapeHtml(source.source_type)} · ${escapeHtml(source.collected_at)} · ${escapeHtml(source.url_or_snapshot)} · ${escapeHtml(source.sample_note)}`).join("<br>")}</p>
              <small>Evidence: ${refs(competitor.evidence_refs)}</small>
            </article>`).join("\n")}
        </div>
        <div class="cae-report-competitive-decisions">
          <article><p class="cae-kicker">Defend</p><ul>${decisionRows(summary.defend)}</ul></article>
          <article><p class="cae-kicker">Close</p><ul>${decisionRows(summary.close)}</ul></article>
          <article><p class="cae-kicker">Differentiate</p><ul>${decisionRows(summary.differentiate)}</ul></article>
          <article><p class="cae-kicker">Do not copy</p><ul>${decisionRows(summary.do_not_copy)}</ul></article>
        </div>
${marketPracticeGapHtml(competitors.market_practice_gap)}`;
}

function demandSystemHtml(demandStage) {
  return `
        <div class="cae-report-demand" aria-label="Demand System">
          <p class="cae-kicker">Demand System</p>
          <ol>
${DEMAND_STAGES.map((stage) => {
    const isLeak = stage.id === demandStage;
    return `            <li class="cae-report-demand__stage${isLeak ? " is-leak" : ""}">
              <span>${escapeHtml(stage.label)}</span>${isLeak ? " <strong>LEAK HERE ↓</strong>" : ""}
            </li>`;
  }).join("\n")}
          </ol>
        </div>`;
}

function gapMarkerKind(gap, focus) {
  if (gap.id === focus.primary_gap_id) return { kind: "primary", mark: "1", label: "Primary Gap" };
  const supportIndex = focus.supporting_gap_ids.indexOf(gap.id);
  if (supportIndex >= 0) return { kind: "supporting", mark: String(supportIndex + 2), label: `Supporting Gap ${supportIndex + 2}` };
  if (gap.diagnosis_state === "insufficient_evidence") return { kind: "insufficient", mark: "?", label: "Insufficient evidence" };
  if (gap.diagnosis_state === "working") return { kind: "working", mark: "✓", label: "Working / defend" };
  return { kind: "backlog", mark: "•", label: "Verified backlog" };
}

function sprintFitLabel(mode) {
  if (mode === "close_in_30_days") return "Close in 30 days";
  if (mode === "start_in_30_days") return "Start in 30 days";
  return "Backlog — not now";
}

function inventoryFilter(gap, focus) {
  if (gap.diagnosis_state === "insufficient_evidence") return "insufficient";
  if (gap.diagnosis_state === "monitor") return "monitor";
  if (gap.sprint_fit?.mode === "close_in_30_days" && isSelectedForRepair(gap.id, focus)) return "fix-now";
  if (gap.sprint_fit?.mode === "start_in_30_days" && isSelectedForRepair(gap.id, focus)) return "fix-next";
  return "monitor";
}

function gapMapHtml(gaps, focus) {
  return `
        <ol class="cae-gap-map" aria-label="Gap Map">
${gaps.map((gap) => {
    const marker = gapMarkerKind(gap, focus);
    const surfaces = gap.surfaces.map((surface) => surfaceLabels[surface] || surface).join(", ");
    return `          <li>
            <a class="cae-gap-map__mark cae-gap-map__mark--${marker.kind}" href="#gap-${escapeHtml(gap.id)}" aria-label="${escapeHtml(marker.label)}: ${escapeHtml(gap.title)}. Surface ${escapeHtml(surfaces)}. Journey ${escapeHtml(gap.journey_stage)}.">
              <span class="cae-gap-map__symbol" aria-hidden="true">${escapeHtml(marker.mark)}</span>
              <span class="cae-gap-map__copy">
                <strong>${escapeHtml(gap.title)}</strong>
                <small>${escapeHtml(surfaces)} · ${escapeHtml(sentenceCase(gap.journey_stage))} · <span class="cae-status-pill">${escapeHtml(marker.label)}</span></small>
              </span>
            </a>
          </li>`;
  }).join("\n")}
        </ol>`;
}

function focusGapCards(gaps, focus, { networkView = null } = {}) {
  const selected = selectedFocusGapIds(focus)
    .map((id) => gaps.find((gap) => gap.id === id))
    .filter(Boolean);
  return selected.map((gap, index) => {
    const marker = gapMarkerKind(gap, focus);
    const surfaces = gap.surfaces.map((surface) => surfaceLabels[surface] || surface).join(", ");
    const longWork = gap.sprint_fit.mode === "start_in_30_days"
      ? `<p><strong>Day-30 result:</strong> ${escapeHtml(gap.repair_plan.day_30_outcome)}</p><p><strong>After Day 30:</strong> ${escapeHtml(gap.repair_plan.beyond_day_30)}</p>`
      : `<p><strong>Reachable result:</strong> ${escapeHtml(gap.repair_plan.outcome)}</p>`;
    const dependency = gap.id === focus.primary_gap_id
      ? "This is the Primary Gap. Supporting repairs depend on it."
      : `Depends on the Primary Gap: it should not be treated as a separate Sprint commitment.`;
    const networkGap = networkView?.selected_gaps.find((item) => item.id === gap.id);
    if (networkGap) {
      return `
          <article class="cae-focus-gap" id="gap-${escapeHtml(gap.id)}" data-gap-role="${marker.kind}" data-network-scope="${escapeHtml(gap.network_scope.scope)}">
            <p class="cae-focus-gap__rank" aria-label="${escapeHtml(marker.label)}">${FOCUS_RANKS[index]} · ${escapeHtml(marker.label)}</p>
            <p class="cae-focus-gap__scope"><span>${escapeHtml(networkGap.scope_label)}</span> Affects ${escapeHtml(networkGap.affected_location_label)} · pilot: ${escapeHtml(networkGap.pilot_location_name)}</p>
            <h3>${escapeHtml(gap.title)}</h3>
            <p><strong>Observed on:</strong> ${escapeHtml(surfaces)} · ${escapeHtml(sentenceCase(gap.journey_stage))}</p>
            <p><strong>Why it matters:</strong> ${escapeHtml(gap.why_it_matters)}</p>
            ${longWork}
            <p><strong>Owner:</strong> ${escapeHtml(networkGap.execution_owner_label)} · ${escapeHtml(networkGap.accountable_role)}</p>
            <p><strong>Public baseline:</strong> ${escapeHtml(networkGap.public_baseline)}</p>
            <p><strong>Day 30 public check:</strong> ${escapeHtml(networkGap.day_30_public_check)}</p>
            <details class="cae-focus-gap__details">
              <summary>Evidence, dependencies and implementation details</summary>
              <div>
                <p><strong>Evidence references:</strong> ${refs(gap.evidence_refs)}</p>
                <p><strong>Why this priority:</strong> ${escapeHtml(focus.rationale)}</p>
                <p><strong>Primary dependency:</strong> ${escapeHtml(dependency)}</p>
                <p><strong>Sprint Fit:</strong> <span class="cae-status-pill">${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</span></p>
                <p><strong>Done when:</strong></p>
                <ul>${stringList(gap.repair_plan.done_when)}</ul>
                <h4>DIY instruction</h4>
                <ol>${stringList(gap.repair_plan.diy_steps)}</ol>
                <p class="cae-report-note">CAESTHETIC can separately confirm written Sprint scope for the selected Focus Gaps. These DIY steps are not Sprint commitments.</p>
              </div>
            </details>
          </article>`;
    }
    return `
          <article class="cae-focus-gap" id="gap-${escapeHtml(gap.id)}" data-gap-role="${marker.kind}">
            <p class="cae-focus-gap__rank cae-status-pill" aria-label="${escapeHtml(marker.label)}">${FOCUS_RANKS[index]} · ${escapeHtml(marker.label)}</p>
            <h3>${escapeHtml(gap.title)}</h3>
            <p><strong>Found on:</strong> ${escapeHtml(surfaces)} · ${escapeHtml(sentenceCase(gap.journey_stage))}</p>
            <p><strong>Evidence → Explanation:</strong> ${refs(gap.evidence_refs)}. ${escapeHtml(gap.why_it_matters)}</p>
            <p><strong>Why now:</strong> ${escapeHtml(focus.rationale)}</p>
            <p><strong>Primary dependency:</strong> ${escapeHtml(dependency)}</p>
            <p><strong>Sprint Fit:</strong> <span class="cae-status-pill">${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</span></p>
            ${longWork}
            <p><strong>Done when:</strong></p>
            <ul>${stringList(gap.repair_plan.done_when)}</ul>
            <p><strong>Who can do this:</strong> ${escapeHtml(gap.repair_plan.owner_role)}</p>
            <details class="cae-focus-gap__diy">
              <summary>DIY instruction</summary>
              <ol>${stringList(gap.repair_plan.diy_steps)}</ol>
            </details>
            <p class="cae-report-note">CAESTHETIC can separately confirm written Sprint scope for the selected Focus Gaps. These DIY steps are not Sprint commitments.</p>
          </article>`;
  }).join("");
}

function focusGapSummary(gaps, focus) {
  return selectedFocusGapIds(focus).map((id, index) => {
    const gap = gaps.find((item) => item.id === id);
    if (!gap) return "";
    const role = index === 0 ? "Primary Gap" : `Supporting Gap ${index + 1}`;
    return `<li><a href="#gap-${escapeHtml(gap.id)}"><strong>${index + 1}. ${escapeHtml(gap.title)}</strong><span class="cae-status-pill">${role} · ${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</span></a></li>`;
  }).join("");
}

function sprintFitHtml(gaps, focus) {
  const selected = selectedFocusGapIds(focus).map((id) => gaps.find((gap) => gap.id === id)).filter(Boolean);
  const close = selected.filter((gap) => gap.sprint_fit.mode === "close_in_30_days");
  const start = selected.filter((gap) => gap.sprint_fit.mode === "start_in_30_days");
  const backlog = gaps.filter((gap) => !isSelectedForRepair(gap.id, focus));
  const row = (items, empty) => items.length
    ? `<ul>${items.map((gap) => `<li><a href="#gap-${escapeHtml(gap.id)}">${escapeHtml(gap.title)}</a></li>`).join("")}</ul>`
    : `<p class="cae-report-note">${empty}</p>`;
  return `
        <div class="cae-sprint-fit">
          <article><p class="cae-kicker cae-status-pill">Close in 30 days</p>${row(close, "None selected.")}</article>
          <article><p class="cae-kicker cae-status-pill">Start in 30 days</p>${row(start, "No long initiative was started.")}</article>
          <article><p class="cae-kicker cae-status-pill">Not now</p>${row(backlog, "No backlog holes.")}</article>
        </div>
        <p class="cae-report-note">This roadmap is generated from Sprint Fit. It is not purchased scope, a delivery promise or a results guarantee.</p>`;
}

function surfaceNavigatorCards(report, result) {
  const cards = SURFACE_NAV.map(({ id, label }) => {
    const surface = report.surfaces.find((item) => item.id === id);
    const score = result.surfaces[id];
    const card = surface.owner_card;
    return `
          <article class="cae-report-surface-card">
            <header>
              <span>${label}</span>
              <strong>${displayScore(score.rawScore)}</strong>
            </header>
            <p><strong>Strength:</strong> ${escapeHtml(card.strength)}</p>
            <p><strong>Problem:</strong> ${escapeHtml(card.problem)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(card.priority)}</p>
            <a class="cae-report-inline-link" href="#surface-${id}">View evidence</a>
          </article>`;
  }).join("");

  const cross = `
          <article class="cae-report-surface-card cae-report-surface-card--cross">
            <header>
              <span>CROSS-SURFACE</span>
              <strong>${displayScore(result.crossSurface.rawScore)}</strong>
            </header>
            <p>${escapeHtml(report.crossSurface.summary)}</p>
            <p class="cae-report-note">Separate diagnostic · excluded from Overall</p>
            <a class="cae-report-inline-link" href="#surface-cross">View evidence</a>
          </article>`;

  const overall = `
          <article class="cae-report-surface-card cae-report-surface-card--overall">
            <header>
              <span>OVERALL</span>
              <strong>${displayScore(result.overall.rawScore)}</strong>
            </header>
            <p class="cae-report-note">Secondary navigator only</p>
            <a class="cae-report-inline-link" href="#evidence-and-competitors">View evidence</a>
          </article>`;

  return cards + cross + overall;
}

function evidenceAccordion(report, result) {
  const surfaceBlocks = report.surfaces.map((surface) => {
    const score = result.surfaces[surface.id];
    return `
        <details class="cae-report-evidence" id="surface-${surface.id}">
          <summary>${escapeHtml(surfaceLabels[surface.id])} · ${displayScore(score.rawScore)}</summary>
          <p>${escapeHtml(surface.summary)}</p>
          <ul class="cae-report-metrics">${metricEvidenceRows(surface.metrics, score.metricResults, score.sufficient)}</ul>
        </details>`;
  }).join("");

  const cross = result.crossSurface;
  const crossBlock = `
        <details class="cae-report-evidence" id="surface-cross">
          <summary>Cross-Surface Consistency · ${displayScore(cross.rawScore)}</summary>
          <p>${escapeHtml(report.crossSurface.summary)}</p>
          <p class="cae-report-note">Approved Class A coverage: ${Math.round(cross.coverage * 100)}%. Excluded from Overall.</p>
          <ul class="cae-report-metrics">${metricEvidenceRows(report.crossSurface.metrics, cross.metricResults, cross.sufficient)}</ul>
        </details>`;

  return surfaceBlocks + crossBlock;
}

function inventoryRows(inventory, focus) {
  return inventory.map((gap) => {
    const marker = gapMarkerKind(gap, focus);
    const surfaces = gap.surfaces.map((surface) => surfaceLabels[surface] || surface).join(", ");
    return `
          <article class="cae-report-problem" id="inventory-${escapeHtml(gap.id)}" data-filter-group="${inventoryFilter(gap, focus)}" data-surface="${escapeHtml(gap.surfaces[0] || "")}">
            <p class="cae-kicker">${escapeHtml(gap.id)} · ${escapeHtml(surfaces)} · <span class="cae-status-pill">${escapeHtml(marker.label)}</span></p>
            <h3>${escapeHtml(gap.title)}</h3>
            <p>${escapeHtml(gap.why_it_matters)}</p>
            <p><strong>Sprint Fit:</strong> <span class="cae-status-pill">${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</span></p>
            ${isSelectedForRepair(gap.id, focus) ? `<p><a class="cae-report-inline-link" href="#gap-${escapeHtml(gap.id)}">Open Focus Gap card</a></p>` : "<p class=\"cae-report-note\">Not now.</p>"}
          </article>`;
  }).join("");
}

function estimateRows(estimates = []) {
  if (!estimates.length) return '<p class="cae-report-note">No Class B estimates are used in this report.</p>';
  return estimates.map((estimate) => `
          <article class="cae-report-assumption">
            <p class="cae-kicker">ESTIMATE · CLASS B · ${escapeHtml(sentenceCase(estimate.finding_type))}</p>
            <h3>${escapeHtml(estimate.title)}</h3>
            <p><strong>Method:</strong> ${escapeHtml(estimate.method)}</p>
            <p><strong>Assumptions:</strong> ${escapeHtml(Array.isArray(estimate.assumptions) ? estimate.assumptions.join("; ") : estimate.assumptions)}</p>
          </article>`).join("");
}

const DECISION_VIEW_STATUS_LABELS = Object.freeze({
  protect: "Protect",
  watch: "Watch",
  fix_now: "Fix now",
  visible: "Visible",
  partial: "Partial",
  not_visible: "Not visible",
  connected: "Connected",
  friction: "Friction",
  broken: "Confirmed break",
  clear: "Clear",
  not_assessed: "Needs verification",
});

function decisionViewCellHtml(item) {
  const evidence = item.evidence_refs?.length ? `<small>Evidence: ${refs(item.evidence_refs)}</small>` : "";
  const inference = item.assessment_basis === "human_inference" ? '<small class="cae-decision-view__inference">Human-reviewed inference</small>' : "";
  return `<strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[item.status] || sentenceCase(item.status))}</strong><span>${escapeHtml(item.summary)}</span>${evidence}${inference}`;
}

function decisionViewNotAssessedHtml(title, description) {
  return `<details class="cae-decision-view" data-view-status="not_assessed">
    <summary>${escapeHtml(title)} <span class="cae-status-pill">Needs verification</span></summary>
    <div><p>${escapeHtml(description)}</p><p class="cae-report-note">Missing evidence stays unscored and does not create a gap, funding decision or promotion approval.</p></div>
  </details>`;
}

function treatmentOpportunityMatrixHtml(view) {
  if (view.status !== "assessed") return decisionViewNotAssessedHtml("Treatment Opportunity Matrix", "Treatment-by-surface evidence has not been reviewed.");
  return `<details class="cae-decision-view" data-decision-view="treatment-opportunity-matrix" open>
    <summary>Treatment Opportunity Matrix <span class="cae-status-pill">UNSCORED</span></summary>
    <div class="cae-table-scroll"><table><thead><tr><th>Treatment</th>${SURFACE_NAV.map((surface) => `<th>${escapeHtml(surface.label)}</th>`).join("")}</tr></thead><tbody>
      ${view.items.map((treatment) => `<tr><th><strong>${escapeHtml(treatment.label)}</strong><small>${escapeHtml(sentenceCase(treatment.priority))} · ${treatment.observed_surface_count}/4 surfaces assessed</small></th>${SURFACE_NAV.map((surface) => `<td data-status="${escapeHtml(treatment.surfaces[surface.id].status)}">${decisionViewCellHtml(treatment.surfaces[surface.id])}</td>`).join("")}</tr>`).join("")}
    </tbody></table></div>
  </details>`;
}

function providerVisibilityMapHtml(view) {
  if (view.status !== "assessed") return decisionViewNotAssessedHtml("Provider Visibility Map", "Provider identity and proof have not been reviewed across the Four Surfaces.");
  return `<details class="cae-decision-view" data-decision-view="provider-visibility-map">
    <summary>Provider Visibility Map <span class="cae-status-pill">UNSCORED</span></summary>
    <div class="cae-table-scroll"><table><thead><tr><th>Provider</th>${SURFACE_NAV.map((surface) => `<th>${escapeHtml(surface.label)}</th>`).join("")}</tr></thead><tbody>
      ${view.items.map((provider) => `<tr><th><strong>${escapeHtml(provider.label)}</strong><small>${escapeHtml(provider.role)} · ${provider.observed_surface_count}/4 surfaces assessed</small></th>${SURFACE_NAV.map((surface) => `<td data-status="${escapeHtml(provider.surfaces[surface.id].status)}">${decisionViewCellHtml(provider.surfaces[surface.id])}</td>`).join("")}</tr>`).join("")}
    </tbody></table></div>
  </details>`;
}

function trustChainHtml(view) {
  if (view.status !== "assessed") return decisionViewNotAssessedHtml("Trust Chain", "No treatment-specific identity, provider, proof and next-action chain has been reviewed.");
  const labels = { identity: "Identity", treatment: "Treatment", provider: "Provider", proof: "Proof", next_action: "Next action" };
  return `<details class="cae-decision-view" data-decision-view="trust-chain">
    <summary>Trust Chain <span class="cae-status-pill">UNSCORED</span></summary>
    <div class="cae-decision-view__cards">${view.items.map((chain) => `<article data-status="${escapeHtml(chain.status)}"><h4>${escapeHtml(chain.label)}</h4><p>${chain.assessed_link_count}/5 links assessed · <strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[chain.status] || sentenceCase(chain.status))}</strong></p><ol>${Object.entries(chain.links).map(([id, link]) => `<li data-status="${escapeHtml(link.status)}"><span>${escapeHtml(labels[id])}</span>${decisionViewCellHtml(link)}</li>`).join("")}</ol></article>`).join("")}</div>
  </details>`;
}

function patientFrictionIndexHtml(view) {
  if (view.status !== "assessed") return decisionViewNotAssessedHtml("Patient Friction Index", "No treatment-specific public path has enough reviewed evidence for a categorical friction signal.");
  const labels = { discovery: "Discovery", trust: "Trust", enquiry: "Enquiry", booking: "Booking" };
  return `<details class="cae-decision-view" data-decision-view="patient-friction-index">
    <summary>Patient Friction Index <span class="cae-status-pill">CATEGORICAL · UNSCORED</span></summary>
    <div class="cae-decision-view__cards">${view.items.map((path) => `<article data-status="${escapeHtml(path.status)}"><h4>${escapeHtml(path.treatment_id)}</h4><p><strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[path.status] || sentenceCase(path.status))}</strong> · ${path.assessed_stage_count}/4 stages assessed · ${escapeHtml(sentenceCase(path.coverage_status))} coverage</p><ol>${Object.entries(path.stages).map(([id, stage]) => `<li data-status="${escapeHtml(stage.status)}"><span>${escapeHtml(labels[id])}</span>${decisionViewCellHtml(stage)}</li>`).join("")}</ol></article>`).join("")}</div>
    <p class="cae-report-note">This index is a categorical view of reviewed public-path states. It is not a score and does not change Overall or Focus Selection.</p>
  </details>`;
}

function growthScoreDecisionViewsHtml(decisionViews) {
  return `<section class="cae-decision-views" data-artifact-version="${escapeHtml(decisionViews.artifact_version)}">
    <p class="cae-kicker">Derived decision intelligence · Existing evidence only</p>
    <h3 class="cae-report-subhead">Treatment, provider, trust and friction views</h3>
    <p>These views reorganize the reviewed Growth Score evidence. They add no source, surface, weight, score or automatic priority decision.</p>
    ${treatmentOpportunityMatrixHtml(decisionViews.treatment_opportunity_matrix)}
    ${providerVisibilityMapHtml(decisionViews.provider_visibility_map)}
    ${trustChainHtml(decisionViews.trust_chain)}
    ${patientFrictionIndexHtml(decisionViews.patient_friction_index)}
  </section>`;
}

function doNotPromoteYetByTreatmentHtml(view) {
  if (view.status !== "assessed") return `<section class="cae-do-not-promote" data-view-status="not_assessed"><p class="cae-kicker">Do Not Promote Yet by Treatment · UNSCORED</p><h3>Needs verification</h3><p>No treatment-specific promotion hold has been approved. This is not permission to promote a treatment.</p></section>`;
  return `<section class="cae-do-not-promote" data-decision-view="do-not-promote-yet-by-treatment">
    <p class="cae-kicker">Do Not Promote Yet by Treatment · Human-approved</p>
    <h3>Hold promotion until the named public-evidence blockers are closed</h3>
    <div>${view.items.map((hold) => `<article><h4>${escapeHtml(hold.treatment_id)}</h4><p>${escapeHtml(hold.rationale)}</p><p><strong>Blockers:</strong></p><ul>${stringList(hold.blockers)}</ul><p><strong>Revisit when:</strong></p><ul>${stringList(hold.revisit_when)}</ul><small>Evidence: ${refs(hold.evidence_refs)} · Human-reviewed inference</small></article>`).join("")}</div>
  </section>`;
}

function networkTreatmentCellHtml(cell) {
  const surfaceDetails = Object.entries(cell.surfaces || {}).map(([surface, value]) => (
    `<li data-status="${escapeHtml(value.status)}"><span>${escapeHtml(surfaceLabels[surface] || sentenceCase(surface))}</span><strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[value.status] || sentenceCase(value.status))}</strong></li>`
  )).join("");
  return `<strong>${escapeHtml(cell.status_label)}</strong><span>${escapeHtml(cell.summary)}</span>${surfaceDetails ? `<details><summary>Four Surfaces</summary><ul>${surfaceDetails}</ul></details>` : ""}`;
}

function networkTreatmentMatrixHtml(view) {
  if (!view.treatment_matrix.length) {
    return decisionViewNotAssessedHtml("Treatment Opportunity Matrix", "No reviewed location has an approved treatment projection.");
  }
  const table = (locations, label) => `<div class="cae-table-scroll cae-network-treatment-table"><table aria-label="${escapeHtml(label)}"><thead><tr><th scope="col">Treatment</th>${locations.map((location) => `<th scope="col">${escapeHtml(location.name)}${location.id === view.locations[0]?.id ? "<small>Focus location</small>" : ""}</th>`).join("")}</tr></thead><tbody>${view.treatment_matrix.map((treatment) => `<tr><th scope="row"><strong>${escapeHtml(treatment.label)}</strong><small>${escapeHtml(sentenceCase(treatment.priority))} · ${escapeHtml(treatment.scope.label)} · observed in ${escapeHtml(treatment.observed_in_reviewed_count)} of ${escapeHtml(view.coverage.reviewed)} reviewed</small></th>${locations.map((location) => {
    const cell = treatment.cells.find((candidate) => candidate.location_id === location.id);
    return `<td data-status="${escapeHtml(cell.status)}" data-location="${escapeHtml(location.name)}">${networkTreatmentCellHtml(cell)}</td>`;
  }).join("")}</tr>`).join("")}</tbody></table></div>`;
  return `<details class="cae-decision-view cae-network-decision-view" data-decision-view="network-treatment-opportunity-matrix" open>
    <summary>Treatment Opportunity Matrix <span class="cae-status-pill">LOCATION × TREATMENT · UNSCORED</span></summary>
    ${table(view.primary_locations, "Treatment Opportunity Matrix for the first reviewed locations")}
    ${view.additional_locations.length ? `<details class="cae-network-more"><summary>View ${escapeHtml(view.additional_locations.length)} more locations</summary>${table(view.additional_locations, "Treatment Opportunity Matrix for additional reviewed locations")}</details>` : ""}
  </details>`;
}

function networkProviderVisibilityHtml(view) {
  const groups = view.provider_visibility.groups;
  if (!groups.some((group) => group.providers.length)) {
    return decisionViewNotAssessedHtml("Provider Visibility Map", "No reviewed location has an approved provider projection.");
  }
  return `<details class="cae-decision-view cae-network-decision-view" data-decision-view="network-provider-visibility-map">
    <summary>Provider Visibility Map <span class="cae-status-pill">PROVIDER × LOCATION · UNSCORED</span></summary>
    <p>Provider proof is unresolved in ${escapeHtml(view.provider_visibility.unresolved_location_count)} of ${escapeHtml(view.provider_visibility.reviewed_location_count)} reviewed locations.</p>
    <div class="cae-network-provider-groups">${groups.map((group) => `<article${group.is_focus ? ' data-focus-location="true"' : ""}><p class="cae-kicker">${escapeHtml(group.location_name)}${group.is_focus ? " · Focus location" : ""}</p>${group.providers.length ? group.providers.map((provider) => `<div class="cae-network-provider"><h4>${escapeHtml(provider.label)}</h4><p>${escapeHtml(provider.role)} · <strong data-status="${escapeHtml(provider.status)}">${escapeHtml(provider.status_label)}</strong></p><small>Treatments: ${escapeHtml(provider.treatment_ids.join(", ") || "Needs verification")}</small><ul>${Object.entries(provider.surfaces).map(([surface, cell]) => `<li data-status="${escapeHtml(cell.status)}"><span>${escapeHtml(surfaceLabels[surface] || sentenceCase(surface))}</span><strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[cell.status] || sentenceCase(cell.status))}</strong></li>`).join("")}</ul></div>`).join("") : '<p class="cae-report-note">Needs verification — no provider finding is inferred.</p>'}</article>`).join("")}</div>
  </details>`;
}

function networkTrustChainsHtml(view) {
  if (!view.trust_chains.total) return decisionViewNotAssessedHtml("Trust Chain", "No treatment/provider chain has been reviewed at any location.");
  const card = (chain) => `<article data-status="${escapeHtml(chain.status)}"${chain.is_focus ? ' data-focus-location="true"' : ""}><p class="cae-kicker">${escapeHtml(chain.location_name)}${chain.is_focus ? " · Focus location" : ""}</p><h4>${escapeHtml(chain.label)}</h4><p><strong>${escapeHtml(DECISION_VIEW_STATUS_LABELS[chain.status] || sentenceCase(chain.status))}</strong> · ${escapeHtml(chain.assessed_link_count)}/5 links assessed</p><ol>${Object.entries(chain.links).map(([id, link]) => `<li data-status="${escapeHtml(link.status)}"><span>${escapeHtml(sentenceCase(id))}</span>${decisionViewCellHtml(link)}</li>`).join("")}</ol></article>`;
  return `<details class="cae-decision-view cae-network-decision-view" data-decision-view="network-trust-chain">
    <summary>Trust Chain <span class="cae-status-pill">REPRESENTATIVE · UNSCORED</span></summary>
    <div class="cae-decision-view__cards">${view.trust_chains.representative.map(card).join("")}</div>
    ${view.trust_chains.additional.length ? `<details class="cae-network-more"><summary>View ${escapeHtml(view.trust_chains.additional.length)} more reviewed chains</summary><div class="cae-decision-view__cards">${view.trust_chains.additional.map(card).join("")}</div></details>` : ""}
  </details>`;
}

function networkPatientFrictionHtml(view) {
  const stages = ["discovery", "trust", "enquiry", "booking"];
  return `<details class="cae-decision-view cae-network-decision-view" data-decision-view="network-patient-friction-index">
    <summary>Patient Friction Index <span class="cae-status-pill">LOCATION · CATEGORICAL · UNSCORED</span></summary>
    <div class="cae-network-friction-grid">${view.friction_by_location.map((location) => `<article data-status="${escapeHtml(location.status)}"${location.is_focus ? ' data-focus-location="true"' : ""}><p class="cae-kicker">${escapeHtml(location.location_name)}${location.is_focus ? " · Focus location" : ""}</p><h4>${escapeHtml(location.status_label)}</h4><ol>${stages.map((stage) => `<li data-status="${escapeHtml(location.stages[stage].status)}"><span>${escapeHtml(sentenceCase(stage))}</span><strong>${escapeHtml(location.stages[stage].status_label)}</strong></li>`).join("")}</ol></article>`).join("")}</div>
    <p class="cae-report-note">Categorical public-path states only. No average, numeric index or business-performance ranking is calculated.</p>
  </details>`;
}

function networkDecisionIntelligenceHtml(view) {
  if (!view) return "";
  return `<section class="cae-decision-views cae-network-decision-intelligence" data-artifact-version="${escapeHtml(view.artifact_version)}">
    <p class="cae-kicker">Network decision intelligence · Existing approved Growth Score evidence only</p>
    <h3 class="cae-report-subhead">Treatment, provider, trust and friction across reviewed locations</h3>
    <p>${escapeHtml(view.coverage.assessed)} of ${escapeHtml(view.coverage.reviewed)} reviewed locations have an assessed projection; ${escapeHtml(view.coverage.not_assessed)} remain explicitly not assessed. These views add no source, surface, weight, score or automatic decision.</p>
    ${networkTreatmentMatrixHtml(view)}
    ${networkProviderVisibilityHtml(view)}
    ${networkTrustChainsHtml(view)}
    ${networkPatientFrictionHtml(view)}
  </section>`;
}

function networkDoNotPromoteHtml(view) {
  if (!view) return "";
  if (!view.promotion_holds.length) return `<section class="cae-do-not-promote" data-view-status="not_assessed"><p class="cae-kicker">Do Not Promote Yet by Treatment · Network projection · UNSCORED</p><h3>No treatment-specific hold was approved</h3><p>This is not permission to promote a treatment. Each location still requires sufficient reviewed evidence and an explicit decision.</p></section>`;
  return `<section class="cae-do-not-promote cae-network-promotion-holds" data-decision-view="network-do-not-promote-yet-by-treatment">
    <p class="cae-kicker">Do Not Promote Yet by Treatment · Network projection · Human-approved</p>
    <h3>Hold promotion only where the approved public-evidence blocker applies</h3>
    <div>${view.promotion_holds.map((group) => `<article><h4>${escapeHtml(group.treatment_label)}</h4><p><strong>Affected locations:</strong> ${escapeHtml(group.affected_location_names.join(", "))}</p>${group.holds.map((hold) => `<div class="cae-network-hold"><p>${escapeHtml(hold.location_name)} — ${escapeHtml(hold.rationale)}</p><p><strong>Blockers:</strong></p><ul>${stringList(hold.blockers)}</ul><p><strong>Revisit when:</strong></p><ul>${stringList(hold.revisit_when)}</ul><small>Evidence: ${refs(hold.evidence_refs)} · Human-reviewed inference</small></div>`).join("")}</article>`).join("")}</div>
    <p class="cae-report-note">A hold is location- and treatment-specific. It is not a universal prohibition and it does not change the global Do Not Fund Yet decision above.</p>
  </section>`;
}

const JOURNEY_GRAPH_SURFACE_ORDER = Object.freeze(["search", "website", "social", "reputation"]);
const JOURNEY_GRAPH_SLOTS = Object.freeze([
  Object.freeze({ x: 380, y: 82 }),
  Object.freeze({ x: 650, y: 260 }),
  Object.freeze({ x: 380, y: 438 }),
  Object.freeze({ x: 110, y: 260 }),
]);
const JOURNEY_GRAPH_PROSPECTS = Object.freeze([
  Object.freeze({ x: 42, y: 66 }),
  Object.freeze({ x: 718, y: 66 }),
  Object.freeze({ x: 380, y: 502 }),
]);
const JOURNEY_GRAPH_CENTER = Object.freeze({ x: 380, y: 260 });
const journeySurfaceLabels = Object.freeze({
  search: "Search / Maps",
  website: "Website",
  social: "Social",
  reputation: "Reviews",
  lead_intake: "Lead Intake",
});
const JOURNEY_GRAPH_STATUS_LABELS = Object.freeze({
  clean: "CLEAN",
  friction: "FRICTION",
  broken: "BROKEN",
  not_assessed: "NOT ASSESSED",
});
const SURFACE_STATUS_LABELS = Object.freeze({
  protect: "PROTECT",
  watch: "WATCH",
  fix_now: "FIX NOW",
  needs_verification: "NEEDS VERIFICATION",
});

function permutations(values) {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) => permutations(values.filter((_, itemIndex) => itemIndex !== index))
    .map((rest) => [value, ...rest]));
}

function segmentCrosses(a, b, c, d) {
  const orientation = (p, q, r) => Math.sign((q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y));
  return orientation(a, b, c) !== orientation(a, b, d) && orientation(c, d, a) !== orientation(c, d, b);
}

function journeySurfaceSequence(artifact, journey) {
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]));
  const edgeById = new Map(artifact.edges.map((edge) => [edge.id, edge]));
  const sequence = [];
  const appendNode = (nodeId) => {
    const node = nodeById.get(nodeId);
    const id = node?.kind === "lead_intake" ? "lead_intake" : node?.surface;
    if (id && sequence.at(-1) !== id) sequence.push(id);
  };
  journey.edge_ids.forEach((edgeId, index) => {
    const edge = edgeById.get(edgeId);
    if (!edge) return;
    if (index === 0) appendNode(edge.from);
    appendNode(edge.to);
  });
  return sequence;
}

export function selectJourneyGraphLayout(artifact) {
  const candidates = permutations(JOURNEY_GRAPH_SURFACE_ORDER);
  const scored = candidates.map((order) => {
    const coordinates = Object.fromEntries(order.map((surface, index) => [surface, JOURNEY_GRAPH_SLOTS[index]]));
    coordinates.lead_intake = JOURNEY_GRAPH_CENTER;
    const journeySegments = artifact.representative_journeys.map((journey) => {
      const sequence = journeySurfaceSequence(artifact, journey);
      const points = [JOURNEY_GRAPH_PROSPECTS[journey.prospect_slot], ...sequence.map((surface) => coordinates[surface])].filter(Boolean);
      return points.slice(1).map((point, index) => [points[index], point]);
    });
    let crossings = 0;
    for (let left = 0; left < journeySegments.length; left += 1) {
      for (let right = left + 1; right < journeySegments.length; right += 1) {
        journeySegments[left].forEach(([a, b]) => journeySegments[right].forEach(([c, d]) => {
          if ([a, b].includes(c) || [a, b].includes(d)) return;
          if (segmentCrosses(a, b, c, d)) crossings += 1;
        }));
      }
    }
    const length = journeySegments.flat().reduce((sum, [a, b]) => sum + Math.hypot(b.x - a.x, b.y - a.y), 0);
    const preferredDeviation = order.reduce((sum, surface, index) => sum + Math.abs(JOURNEY_GRAPH_SURFACE_ORDER.indexOf(surface) - index), 0);
    return { order, coordinates, cost: [crossings, Math.round(length), preferredDeviation] };
  });
  scored.sort((a, b) => {
    for (let index = 0; index < a.cost.length; index += 1) {
      if (a.cost[index] !== b.cost[index]) return a.cost[index] - b.cost[index];
    }
    return a.order.join("|").localeCompare(b.order.join("|"));
  });
  return Object.freeze(scored[0]);
}

function journeyStatus(artifact, journey) {
  const edgeById = new Map(artifact.edges.map((edge) => [edge.id, edge]));
  const statuses = journey.edge_ids.map((edgeId) => edgeById.get(edgeId)?.status).filter(Boolean);
  if (statuses.includes("broken")) return "broken";
  if (statuses.includes("friction")) return "friction";
  if (statuses.includes("not_assessed")) return "not_assessed";
  return "clean";
}

function surfaceStatus(report, result, surfaceId) {
  if (!result.surfaces[surfaceId]?.sufficient) return "needs_verification";
  const surface = report.surfaces.find((item) => item.id === surfaceId);
  if (surface?.owner_card?.status) return surface.owner_card.status;
  if (surface?.owner_card?.priority === "HIGH") return "fix_now";
  if (surface?.owner_card?.priority === "LOW") return "protect";
  return "watch";
}

function practiceIdentitySvg(report) {
  const logo = report.practice?.logo;
  if (logo?.src && ["approved", "verified"].includes(logo.provenance)) {
    return `<image class="cae-journey-graph__logo" href="${escapeHtml(logo.src)}" x="-44" y="-44" width="88" height="88" preserveAspectRatio="xMidYMid meet"><title>${escapeHtml(logo.alt || `${report.practice.name} logo`)}</title></image>`;
  }
  const initials = String(report.practice?.name || "Practice")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return `<text class="cae-journey-graph__wordmark" text-anchor="middle" dominant-baseline="middle"><title>Practice identity fallback: ${escapeHtml(report.practice.name)}</title><tspan data-brand>${escapeHtml(initials)}</tspan></text>`;
}

function graphSurfaceNodeSvg(report, result, surface, point) {
  const status = surfaceStatus(report, result, surface);
  return `<g class="cae-journey-graph__surface" data-surface="${surface}" data-surface-status="${status}" transform="translate(${point.x} ${point.y})">
    <circle r="56"></circle>
    <text class="cae-journey-graph__surface-label" y="-7" text-anchor="middle">${escapeHtml(journeySurfaceLabels[surface])}</text>
    <text class="cae-journey-graph__surface-status" y="17" text-anchor="middle">${escapeHtml(SURFACE_STATUS_LABELS[status])}</text>
  </g>`;
}

function graphNodeCoordinate(node, layout) {
  if (!node) return null;
  return node.kind === "lead_intake" ? JOURNEY_GRAPH_CENTER : layout.coordinates[node.surface];
}

function brokenMarkerSvg(from, to, edgeId) {
  const x = (from.x + to.x) / 2;
  const y = (from.y + to.y) / 2;
  return `<g class="cae-journey-graph__break" data-edge-break="${escapeHtml(edgeId)}" transform="translate(${x} ${y})"><line x1="-8" y1="-8" x2="8" y2="8"></line><line x1="8" y1="-8" x2="-8" y2="8"></line></g>`;
}

function journeyEdgeSvg(edge, from, to, markerPrefix) {
  if (!from || !to || (from.x === to.x && from.y === to.y)) return "";
  const marker = `url(#${markerPrefix}-${edge.status})`;
  return `<line class="cae-journey-graph__route" data-edge-id="${escapeHtml(edge.id)}" data-status="${edge.status}" data-expectation="${edge.expectation}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" marker-end="${marker}"><title>${escapeHtml(edge.id)} · ${escapeHtml(JOURNEY_GRAPH_STATUS_LABELS[edge.status])}</title></line>${edge.status === "broken" ? brokenMarkerSvg(from, to, edge.id) : ""}`;
}

function graphMarkersSvg(prefix) {
  return `<defs>${Object.keys(JOURNEY_GRAPH_STATUS_LABELS).map((status) => `<marker id="${prefix}-${status}" class="cae-journey-graph__marker" data-status="${status}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>`).join("")}</defs>`;
}

function primaryJourneyMobileHtml(artifact) {
  const journey = artifact.representative_journeys.find((item) => item.kind === "primary_constraint")
    || artifact.representative_journeys[0];
  if (!journey) return `<p class="cae-report-note">No representative route was assessed. No connection is inferred.</p>`;
  const edgeById = new Map(artifact.edges.map((edge) => [edge.id, edge]));
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]));
  const rows = journey.edge_ids.map((edgeId) => {
    const edge = edgeById.get(edgeId);
    if (!edge) return "";
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    const from = fromNode?.kind === "lead_intake" ? "Lead Intake" : journeySurfaceLabels[fromNode?.surface];
    const to = toNode?.kind === "lead_intake" ? "Lead Intake" : journeySurfaceLabels[toNode?.surface];
    return `<li data-edge-id="${escapeHtml(edge.id)}" data-status="${edge.status}"><span>${escapeHtml(from)}</span><b aria-hidden="true">→</b><span>${escapeHtml(to)}</span><strong>${escapeHtml(JOURNEY_GRAPH_STATUS_LABELS[edge.status])}</strong></li>`;
  }).join("");
  return `<div class="cae-journey-graph__mobile" data-mobile-primary-journey><p class="cae-kicker">Primary representative route</p><ol>${rows}</ol></div>`;
}

function graphLegendHtml(report, result, graphAnalysis) {
  const counts = Object.fromEntries(Object.keys(JOURNEY_GRAPH_STATUS_LABELS).map((status) => [
    status,
    graphAnalysis.surface_edges.filter((edge) => edge.status === status).length,
  ]));
  const surfaceRows = JOURNEY_GRAPH_SURFACE_ORDER.map((surface) => {
    const status = surfaceStatus(report, result, surface);
    return `<li><span data-surface-status="${status}"></span><b>${escapeHtml(journeySurfaceLabels[surface])}</b><em>${escapeHtml(SURFACE_STATUS_LABELS[status])}</em></li>`;
  }).join("");
  return `<aside class="cae-journey-graph__panel" aria-label="Journey map legend">
    <section><h4>Surface health</h4><ul>${surfaceRows}</ul></section>
    <section><h4>Journey paths</h4><div class="cae-journey-graph__legend"><span data-status="clean">CLEAN</span><span data-status="friction">FRICTION</span><span data-status="broken">BROKEN</span><span data-status="not_assessed">NOT ASSESSED</span></div></section>
    <section><h4>Cross-Surface Connections Overview</h4><p><strong>${counts.clean}</strong> clean · <strong>${counts.friction}</strong> friction · <strong>${counts.broken}</strong> broken · <strong>${counts.not_assessed}</strong> not assessed</p><p>${escapeHtml(report.crossSurface.summary)}</p></section>
  </aside>`;
}

function heroJourneyMapHtml(report, result, graphAnalysis) {
  const artifact = report.journeyGraph;
  if (!artifact) return "";
  const layout = selectJourneyGraphLayout(artifact);
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]));
  const edgeById = new Map(artifact.edges.map((edge) => [edge.id, edge]));
  const seenEdges = new Set();
  const routes = artifact.representative_journeys.map((journey) => {
    const firstEdge = edgeById.get(journey.edge_ids[0]);
    const firstPoint = graphNodeCoordinate(nodeById.get(firstEdge?.from), layout);
    const prospect = JOURNEY_GRAPH_PROSPECTS[journey.prospect_slot];
    const entry = firstPoint ? `<line class="cae-journey-graph__entry" x1="${prospect.x}" y1="${prospect.y}" x2="${firstPoint.x}" y2="${firstPoint.y}"><title>${escapeHtml(journey.label)} · representative entry</title></line>` : "";
    const edges = journey.edge_ids.map((edgeId) => {
      if (seenEdges.has(edgeId)) return "";
      seenEdges.add(edgeId);
      const edge = edgeById.get(edgeId);
      if (!edge) return "";
      return journeyEdgeSvg(edge, graphNodeCoordinate(nodeById.get(edge.from), layout), graphNodeCoordinate(nodeById.get(edge.to), layout), "cae-hero-arrow");
    }).join("");
    return entry + edges;
  }).join("");
  const remainingPublishedEdges = artifact.edges
    .filter((edge) => !(edge.expectation === "optional" && edge.status === "not_assessed"))
    .filter((edge) => !seenEdges.has(edge.id))
    .map((edge) => journeyEdgeSvg(
      edge,
      graphNodeCoordinate(nodeById.get(edge.from), layout),
      graphNodeCoordinate(nodeById.get(edge.to), layout),
      "cae-hero-arrow",
    ))
    .join("");
  const reachability = graphAnalysis.reachability.map((route) => `<li><strong>${escapeHtml(artifact.nodes.find((node) => node.id === route.entry_node_id)?.label || route.entry_node_id)}:</strong> ${escapeHtml(route.route_status)}${route.shortest_clean_hops === null ? "" : ` · ${route.shortest_clean_hops} clean hop${route.shortest_clean_hops === 1 ? "" : "s"}`}</li>`).join("");
  return `<figure class="cae-journey-graph" data-graph-view="hero" data-artifact-id="${escapeHtml(artifact.artifact_id)}">
    <figcaption><strong>Where Clients Are Gained - and Lost</strong><span>Evidence-backed public paths across exactly four surfaces. These are representative routes, not tracked individual patients.</span></figcaption>
    <div class="cae-journey-graph__layout">
      <div>
      <div class="cae-journey-graph__canvas cae-journey-graph__canvas--desktop">
      <svg viewBox="0 0 760 540" role="img" aria-labelledby="cae-journey-hero-title cae-journey-hero-desc">
        <title id="cae-journey-hero-title">Where Clients Are Gained - and Lost</title>
        <desc id="cae-journey-hero-desc">Evidence-backed public routes through Search, Website, Social and Reviews toward the gray Lead Intake boundary.</desc>
        ${graphMarkersSvg("cae-hero-arrow")}
        <circle class="cae-journey-graph__intake-ring" cx="380" cy="260" r="88"></circle>
        ${routes}${remainingPublishedEdges}
        ${artifact.representative_journeys.map((journey) => {
          const point = JOURNEY_GRAPH_PROSPECTS[journey.prospect_slot];
          return `<g class="cae-journey-graph__prospect" transform="translate(${point.x} ${point.y})"><circle r="18"></circle><text y="34" text-anchor="middle">Prospect ${journey.prospect_slot + 1}</text></g>`;
        }).join("")}
        ${JOURNEY_GRAPH_SURFACE_ORDER.map((surface) => graphSurfaceNodeSvg(report, result, surface, layout.coordinates[surface])).join("")}
        <text class="cae-journey-graph__intake-label" x="380" y="166" text-anchor="middle">LEAD INTAKE</text>
        <text class="cae-journey-graph__intake-state" x="380" y="361" text-anchor="middle">NOT ASSESSED</text>
        <g class="cae-journey-graph__intake" transform="translate(380 260)"><circle r="58"></circle>${practiceIdentitySvg(report)}</g>
      </svg>
      </div>
      ${primaryJourneyMobileHtml(artifact)}
      </div>
      ${graphLegendHtml(report, result, graphAnalysis)}
    </div>
    ${reachability ? `<ul class="cae-journey-graph__routes">${reachability}</ul>` : ""}
    <div class="cae-journey-graph__decision-grid"><article><span>Primary Constraint</span><strong>${escapeHtml(report.humanDiagnosis.binding_constraint.title)}</strong></article><article><span>What This Means</span><p>${escapeHtml(report.humanDiagnosis.binding_constraint.statement)}</p></article><article><span>Impact</span><p>${escapeHtml(report.humanDiagnosis.gap_inventory.find((gap) => gap.id === report.humanDiagnosis.focus_selection.primary_gap_id)?.why_it_matters || report.humanDiagnosis.current_state.constraint_detail)}</p></article></div>
    <div class="cae-journey-graph__outside-in"><strong>OUTSIDE-IN DIAGNOSIS</strong><span>Public evidence only · Lead Intake and internal conversion remain NOT ASSESSED without authorized internal evidence.</span></div>
  </figure>`;
}

function surfaceSnapshotHtml(report, result) {
  return `<section class="cae-surface-snapshot" aria-labelledby="surface-snapshot-title"><p class="cae-kicker">Four-Surface snapshot</p><h3 class="cae-report-subhead" id="surface-snapshot-title">What to protect, watch, fix or verify</h3><div>${JOURNEY_GRAPH_SURFACE_ORDER.map((surfaceId) => {
    const surface = report.surfaces.find((item) => item.id === surfaceId);
    const status = surfaceStatus(report, result, surfaceId);
    return `<article data-surface="${surfaceId}" data-surface-status="${status}"><header><strong>${escapeHtml(journeySurfaceLabels[surfaceId])}</strong><span>${escapeHtml(SURFACE_STATUS_LABELS[status])}</span></header><p>${escapeHtml(surface.summary || surface.owner_card.problem)}</p></article>`;
  }).join("")}</div></section>`;
}

function brokenConnectionsMobileHtml(graphAnalysis) {
  if (!graphAnalysis.surface_edges.length) return `<div class="cae-journey-graph__mobile"><p class="cae-report-note">No public relationship was assessed, so no edge is drawn.</p></div>`;
  return `<div class="cae-journey-graph__mobile"><ol>${graphAnalysis.surface_edges.map((edge) => `<li data-status="${edge.status}" data-edge-ids="${escapeHtml(edge.edge_ids.join(" "))}"><span>${escapeHtml(journeySurfaceLabels[edge.from])}</span><b aria-hidden="true">→</b><span>${escapeHtml(journeySurfaceLabels[edge.to])}</span><strong>${escapeHtml(JOURNEY_GRAPH_STATUS_LABELS[edge.status])}</strong></li>`).join("")}</ol></div>`;
}

function brokenConnectionsMapHtml(report, result, graphAnalysis) {
  const artifact = report.journeyGraph;
  if (!artifact) return "";
  const coordinates = Object.fromEntries(JOURNEY_GRAPH_SURFACE_ORDER.map((surface, index) => [surface, JOURNEY_GRAPH_SLOTS[index]]));
  coordinates.lead_intake = JOURNEY_GRAPH_CENTER;
  const lines = graphAnalysis.surface_edges.map((edge) => {
    const from = coordinates[edge.from];
    const to = coordinates[edge.to];
    if (!from || !to) return "";
    const displayEdge = { id: edge.edge_ids.join(" "), status: edge.status, expectation: "aggregate" };
    return journeyEdgeSvg(displayEdge, from, to, "cae-system-arrow");
  }).join("");
  const counts = Object.fromEntries(["clean", "friction", "broken", "not_assessed"].map((status) => [status, graphAnalysis.surface_edges.filter((edge) => edge.status === status).length]));
  return `<section class="cae-journey-graph-block" aria-labelledby="broken-connections-title" data-graph-view="connections" data-artifact-id="${escapeHtml(artifact.artifact_id)}">
    <p class="cae-kicker">Cross-Surface Connections Overview</p>
    <h3 class="cae-report-subhead" id="broken-connections-title">Broken Connections Map</h3>
    <p>${counts.clean} clean · ${counts.friction} friction · ${counts.broken} broken · ${counts.not_assessed} not assessed. Optional or irrelevant relationships are not drawn.</p>
    <div class="cae-journey-graph__canvas cae-journey-graph__canvas--desktop">
      <svg viewBox="0 0 760 520" role="img" aria-labelledby="cae-broken-title cae-broken-desc">
        <title id="cae-broken-title">Broken Connections Map</title>
        <desc id="cae-broken-desc">Fixed-order system view from the same Journey Graph artifact used by the Hero.</desc>
        ${graphMarkersSvg("cae-system-arrow")}
        ${lines}
        ${JOURNEY_GRAPH_SURFACE_ORDER.map((surface) => graphSurfaceNodeSvg(report, result, surface, coordinates[surface])).join("")}
        <g class="cae-journey-graph__intake cae-journey-graph__intake--boundary" transform="translate(380 260)"><circle r="58"></circle><text y="-4" text-anchor="middle">LEAD INTAKE</text><text y="16" text-anchor="middle">NOT ASSESSED</text></g>
      </svg>
    </div>
    ${brokenConnectionsMobileHtml(graphAnalysis)}
    <div class="cae-journey-graph__legend"><span data-status="clean">CLEAN</span><span data-status="friction">FRICTION</span><span data-status="broken">BROKEN</span><span data-status="not_assessed">NOT ASSESSED</span></div>
  </section>`;
}

function journeyGraphEvidenceDetailsHtml(report) {
  const artifact = report.journeyGraph;
  if (!artifact || !artifact.edges.length) return `<p class="cae-report-note">Journey Graph edge detail: not assessed. No route or failure is inferred.</p>`;
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]));
  const publishedEdges = artifact.edges.filter((edge) => !(edge.expectation === "optional" && edge.status === "not_assessed"));
  if (!publishedEdges.length) return `<p class="cae-report-note">Journey Graph edge detail: not assessed. No required route or failure is inferred.</p>`;
  const details = publishedEdges.map((edge) => `<details class="cae-journey-graph__edge" data-edge-id="${escapeHtml(edge.id)}" data-status="${edge.status}">
    <summary>${escapeHtml(nodeById.get(edge.from)?.label)} → ${escapeHtml(nodeById.get(edge.to)?.label)} · ${escapeHtml(edge.status)}</summary>
    <p><strong>Observed:</strong> ${escapeHtml(edge.technical_integrity.observed_behavior)}</p>
    <p><strong>Context:</strong> ${escapeHtml(edge.context_integrity.observed_behavior)}</p>
    <p><strong>Why it matters:</strong> ${escapeHtml(edge.why_it_matters)}</p>
    <p><strong>Repair implication:</strong> ${escapeHtml(edge.repair_implication)}</p>
    <p><small>Source: ${escapeHtml(edge.source || "Not assessed")} · Collected: ${escapeHtml(edge.collected_at || "Not assessed")} · Evidence: ${refs(edge.evidence_refs)}</small></p>
  </details>`).join("");
  return `<section class="cae-journey-graph__details" aria-labelledby="journey-edge-evidence-title"><h3 class="cae-report-subhead" id="journey-edge-evidence-title">Journey edge evidence</h3>${details}</section>`;
}

const LEAD_TO_REVENUE_STAGES = Object.freeze([
  "LEAD RECEIVED",
  "RESPONSE",
  "QUALIFICATION",
  "BOOKING",
  "CONFIRMATION",
  "SHOW",
  "CONSULTATION",
  "PAYMENT",
]);

function isLeadToRevenueCheckRecommended(report) {
  return report.leadToRevenueCheck?.recommendation === "recommended";
}

function leadToRevenueMapHtml(report) {
  const checkDecision = report.leadToRevenueCheck;
  const recommendation = isLeadToRevenueCheckRecommended(report)
    ? `<div class="cae-lead-revenue__check" data-cae-check-recommended="true">
      <div><span>Lead-to-Revenue Check</span><strong>$500</strong></div>
      <p><strong>Why recommended:</strong> ${escapeHtml(checkDecision.reason)}</p>
      <p><strong>Supporting evidence:</strong> ${refs(checkDecision.evidence_refs)}</p>
      <p>An evidence-gated review of the authorized internal path. If the Check continues directly into the next CAESTHETIC 30-Day Growth Sprint for the verified constraint, the $500 is credited once toward the <span data-cae-sprint-price>$2,500</span> Sprint total.</p>
      <small>No enquiry, booking, patient, revenue or ROI outcome is promised.</small>
      <a class="cae-report-inline-link" href="/lead-to-revenue-check/">Review the Lead-to-Revenue Check</a>
    </div>`
    : "";
  return `<section class="cae-lead-revenue" aria-labelledby="lead-revenue-title">
    <p class="cae-kicker">Internal conversion boundary</p>
    <h3 class="cae-report-subhead" id="lead-revenue-title">What happens after the enquiry?</h3>
    <p>Growth Score ends at Lead Intake. It does not infer response, booking, attendance, consultation or payment performance from public evidence.</p>
    <ol>${LEAD_TO_REVENUE_STAGES.map((stage) => `<li data-status="not_assessed"><span>${escapeHtml(stage)}</span><strong>NOT ASSESSED</strong></li>`).join("")}</ol>
    ${recommendation}
  </section>`;
}

function commercialNextStepHtml(report) {
  if (isLeadToRevenueCheckRecommended(report)) {
    return `
        <p class="cae-kicker">Conditional diagnostic CTA</p>
        <h2 class="cae-h2">Verify the internal path before choosing the fix</h2>
        <p>The Growth Score identified internal uncertainty that public evidence cannot resolve. Confirm the evidence boundary and request written Check scope before selecting implementation.</p>
        <a class="cae-btn cae-btn--primary" href="/lead-to-revenue-check/">Review the Lead-to-Revenue Check</a>
      `;
  }
  return `
        <p class="cae-kicker">Optional Sprint CTA</p>
        <h2 class="cae-h2">Ask CAESTHETIC to take the selected Focus Gaps</h2>
        <p>Sprint scope is confirmed separately in writing. No Focus Gap or DIY step is included until that written scope exists.</p>
        <a class="cae-btn cae-btn--primary" href="/sprint/">Start the 30-Day Growth Sprint</a>
      `;
}

function growthScoreIntroHtml(report) {
  const locale = report.reportContext?.report_locale || "en";
  const vertical = report.reportContext?.vertical_context || "aesthetic_practice";
  const isMultiLocation = report.audit?.format === "multi_location";
  const subjects = {
    en: {
      aesthetic_practice: "aesthetic practice",
      dental_practice: "dental practice",
      beauty_salon: "beauty salon",
      network: "practice network and its locations",
    },
    ru: {
      aesthetic_practice: "эстетической практики",
      dental_practice: "стоматологической практики",
      beauty_salon: "салона красоты",
      network: "сети практик и её локаций",
    },
    es: {
      aesthetic_practice: "práctica estética",
      dental_practice: "clínica dental",
      beauty_salon: "salón de belleza",
      network: "red de centros y sus ubicaciones",
    },
    fr: {
      aesthetic_practice: "cabinet esthétique",
      dental_practice: "cabinet dentaire",
      beauty_salon: "salon de beauté",
      network: "réseau de cabinets et ses sites",
    },
    uk: {
      aesthetic_practice: "естетичної практики",
      dental_practice: "стоматологічної практики",
      beauty_salon: "салону краси",
      network: "мережі практик та її локацій",
    },
  };
  const subject = isMultiLocation
    ? subjects[locale]?.network || subjects.en.network
    : subjects[locale]?.[vertical] || subjects.en[vertical] || subjects.en.aesthetic_practice;
  const copy = {
    en: {
      kicker: "YOUR GROWTH SCORE · HOW TO READ THIS REPORT",
      title: "Use this report to make one clear growth decision",
      reviewed: `We reviewed the public journey for this ${subject} across Search, Website, Social and Reputation.`,
      definition: "Growth Score is not another marketing grade or a menu of services.",
      answers: "It shows what works, what limits growth, what to fix first and what not to fund yet.",
      read: "Start with the Primary Constraint and Focus Gaps. Then use the Gap Inventory and Repair Paths to understand the work. Scores are secondary navigation.",
      next: "You can implement in-house, use another provider, defer the work or ask CAESTHETIC. The report creates no automatic service commitment.",
      cards: [
        ["01", "UNDERSTAND", "Find the constraint"],
        ["02", "PRIORITIZE", "See what to fix first"],
        ["03", "ACT", "Choose how to implement it"],
      ],
    },
    ru: {
      kicker: "ВАШ GROWTH SCORE · КАК ЧИТАТЬ ОТЧЁТ",
      title: "Используйте отчёт, чтобы принять одно ясное решение о росте",
      reviewed: `Мы проверили публичный путь клиента для ${subject} по Search, Website, Social и Reputation.`,
      definition: "Growth Score — не очередная маркетинговая оценка и не меню услуг.",
      answers: "Он показывает, что работает, что ограничивает рост, что исправлять первым и что пока не финансировать.",
      read: "Начните с главного ограничения и фокусных разрывов. Затем изучите полный реестр разрывов и пути исправления. Баллы — только вспомогательная навигация.",
      next: "Можно внедрить изменения внутри команды, привлечь другого подрядчика, отложить работу или обратиться к CAESTHETIC. Отчёт не создаёт автоматического обязательства по услугам.",
      cards: [
        ["01", "ПОНЯТЬ", "Найти ограничение"],
        ["02", "ВЫБРАТЬ ПРИОРИТЕТ", "Увидеть, что исправлять первым"],
        ["03", "ДЕЙСТВОВАТЬ", "Выбрать способ внедрения"],
      ],
    },
    es: {
      kicker: "TU GROWTH SCORE · CÓMO LEER ESTE INFORME",
      title: "Usa este informe para tomar una decisión clara de crecimiento",
      reviewed: `Revisamos el recorrido público de esta ${subject} en Search, Website, Social y Reputation.`,
      definition: "Growth Score no es otra nota de marketing ni un menú de servicios.",
      answers: "Muestra qué funciona, qué limita el crecimiento, qué corregir primero y qué no financiar todavía.",
      read: "Empieza por la restricción principal y las brechas prioritarias. Después revisa el inventario de brechas y las vías de corrección. Las puntuaciones son navegación secundaria.",
      next: "Puedes implementarlo internamente, usar otro proveedor, aplazarlo o pedir ayuda a CAESTHETIC. El informe no crea ningún compromiso automático de servicio.",
      cards: [
        ["01", "COMPRENDER", "Encontrar la restricción"],
        ["02", "PRIORIZAR", "Ver qué corregir primero"],
        ["03", "ACTUAR", "Elegir cómo implementarlo"],
      ],
    },
    fr: {
      kicker: "VOTRE GROWTH SCORE · COMMENT LIRE CE RAPPORT",
      title: "Utilisez ce rapport pour prendre une décision de croissance claire",
      reviewed: `Nous avons examiné le parcours public de ce ${subject} sur Search, Website, Social et Reputation.`,
      definition: "Growth Score n'est ni une nouvelle note marketing ni un catalogue de services.",
      answers: "Il montre ce qui fonctionne, ce qui limite la croissance, quoi corriger d'abord et quoi ne pas financer pour l'instant.",
      read: "Commencez par la contrainte principale et les écarts prioritaires. Consultez ensuite l'inventaire des écarts et les voies de correction. Les scores ne sont qu'une navigation secondaire.",
      next: "Vous pouvez mettre en œuvre en interne, choisir un autre prestataire, différer ou demander à CAESTHETIC. Le rapport ne crée aucun engagement de service automatique.",
      cards: [
        ["01", "COMPRENDRE", "Trouver la contrainte"],
        ["02", "PRIORISER", "Voir quoi corriger d'abord"],
        ["03", "AGIR", "Choisir comment mettre en œuvre"],
      ],
    },
    uk: {
      kicker: "ВАШ GROWTH SCORE · ЯК ЧИТАТИ ЦЕЙ ЗВІТ",
      title: "Використайте звіт, щоб ухвалити одне чітке рішення щодо зростання",
      reviewed: `Ми перевірили публічний шлях клієнта для ${subject} у Search, Website, Social та Reputation.`,
      definition: "Growth Score — не чергова маркетингова оцінка і не меню послуг.",
      answers: "Він показує, що працює, що обмежує зростання, що виправляти першим і що поки не фінансувати.",
      read: "Почніть із головного обмеження та пріоритетних розривів. Потім перегляньте повний реєстр розривів і шляхи виправлення. Бали — лише допоміжна навігація.",
      next: "Можна впровадити зміни всередині команди, залучити іншого підрядника, відкласти роботу або звернутися до CAESTHETIC. Звіт не створює автоматичного зобов'язання щодо послуг.",
      cards: [
        ["01", "ЗРОЗУМІТИ", "Знайти обмеження"],
        ["02", "РОЗСТАВИТИ ПРІОРИТЕТИ", "Побачити, що виправляти першим"],
        ["03", "ДІЯТИ", "Обрати спосіб впровадження"],
      ],
    },
  }[locale] || null;
  const resolved = copy || {
    kicker: "YOUR GROWTH SCORE · HOW TO READ THIS REPORT",
    title: "Use this report to make one clear growth decision",
    reviewed: `We reviewed the public journey for this ${subject} across Search, Website, Social and Reputation.`,
    definition: "Growth Score is not another marketing grade or a menu of services.",
    answers: "It shows what works, what limits growth, what to fix first and what not to fund yet.",
    read: "Start with the Primary Constraint and Focus Gaps. Then use the Gap Inventory and Repair Paths to understand the work. Scores are secondary navigation.",
    next: "You can implement in-house, use another provider, defer the work or ask CAESTHETIC. The report creates no automatic service commitment.",
    cards: [["01", "UNDERSTAND", "Find the constraint"], ["02", "PRIORITIZE", "See what to fix first"], ["03", "ACT", "Choose how to implement it"]],
  };

  return `
  <section class="cae-section cae-section--soft" id="report-intro" data-report-intro>
    <div class="cae-wrap">
      <p class="cae-kicker">${escapeHtml(resolved.kicker)}</p>
      <h2 class="cae-h2">${escapeHtml(resolved.title)}</h2>
      <div class="cae-report-method__grid">
        <div>
          <p>${escapeHtml(resolved.reviewed)}</p>
          <p><strong>${escapeHtml(resolved.definition)}</strong> ${escapeHtml(resolved.answers)}</p>
        </div>
        <div>
          <p>${escapeHtml(resolved.read)}</p>
          <p>${escapeHtml(resolved.next)}</p>
        </div>
      </div>
      <div class="cae-report-paths" aria-label="Growth Score orientation">
${resolved.cards.map(([number, label, detail]) => `        <article><span>${escapeHtml(number)} ${escapeHtml(label)}</span><p>${escapeHtml(detail)}</p></article>`).join("\n")}
      </div>
    </div>
  </section>`;
}

function localizeReportHtml(html, locale) {
  if (!locale || locale === "en") return html;

  const presentationTranslations = {
    es: [
      ["Executive Overview", "Resumen ejecutivo"],
      ["Human-approved diagnosis", "Diagnóstico aprobado por una persona"],
      ["Exactly Top 3 Focus Gaps", "Exactamente 3 brechas prioritarias"],
      ["Complete Remediation Plan", "Plan completo de corrección"],
      ["Four-Surface score navigator", "Navegador de las cuatro superficies"],
      ["Evidence drill-down", "Detalle de evidencias"],
      ["Full Problem / Gap Inventory", "Inventario completo de problemas y brechas"],
      ["Do Not Fund Yet", "No financiar todavía"],
      ["Four implementation paths", "Cuatro vías de implementación"],
      ["Why CAESTHETIC / coordination burden", "Por qué CAESTHETIC y la carga de coordinación"],
      ["Illustrative 30-day sequencing preview", "Secuencia ilustrativa de 30 días"],
      ["Optional Sprint CTA", "Siguiente paso opcional"],
      ["Methodology and limitations", "Metodología y limitaciones"],
      ["Start the 30-Day Growth Sprint", "Iniciar el Growth Sprint de 30 días"],
      ["Private Growth Score", "Growth Score privado"],
      ["Exactly Top 3", "Exactamente 3"],
      ["Representative client journeys", "Recorridos representativos del cliente"],
      ["Broken Connections Map", "Mapa de conexiones rotas"],
      ["Cross-Surface evidence artifact", "Artefacto de evidencia entre superficies"],
    ],
    fr: [
      ["Executive Overview", "Synthèse"],
      ["Human-approved diagnosis", "Diagnostic approuvé par une personne"],
      ["Exactly Top 3 Focus Gaps", "Exactement 3 écarts prioritaires"],
      ["Complete Remediation Plan", "Plan de correction complet"],
      ["Four-Surface score navigator", "Navigation sur les quatre surfaces"],
      ["Evidence drill-down", "Détail des preuves"],
      ["Full Problem / Gap Inventory", "Inventaire complet des problèmes et écarts"],
      ["Do Not Fund Yet", "Ne pas financer pour l'instant"],
      ["Four implementation paths", "Quatre voies de mise en œuvre"],
      ["Why CAESTHETIC / coordination burden", "Pourquoi CAESTHETIC et la coordination"],
      ["Illustrative 30-day sequencing preview", "Séquence indicative sur 30 jours"],
      ["Optional Sprint CTA", "Étape suivante facultative"],
      ["Methodology and limitations", "Méthodologie et limites"],
      ["Start the 30-Day Growth Sprint", "Démarrer le Growth Sprint de 30 jours"],
      ["Private Growth Score", "Growth Score privé"],
      ["Exactly Top 3", "Exactement 3"],
      ["Representative client journeys", "Parcours clients représentatifs"],
      ["Broken Connections Map", "Carte des connexions rompues"],
      ["Cross-Surface evidence artifact", "Artefact de preuve inter-surfaces"],
    ],
    uk: [
      ["Executive Overview", "Короткий огляд"],
      ["Human-approved diagnosis", "Діагноз, затверджений людиною"],
      ["Exactly Top 3 Focus Gaps", "Рівно 3 пріоритетні розриви"],
      ["Complete Remediation Plan", "Повний план виправлення"],
      ["Four-Surface score navigator", "Навігація чотирма поверхнями"],
      ["Evidence drill-down", "Деталізація доказів"],
      ["Full Problem / Gap Inventory", "Повний реєстр проблем і розривів"],
      ["Do Not Fund Yet", "Поки не фінансувати"],
      ["Four implementation paths", "Чотири шляхи впровадження"],
      ["Why CAESTHETIC / coordination burden", "Навіщо CAESTHETIC і координаційне навантаження"],
      ["Illustrative 30-day sequencing preview", "Орієнтовна послідовність на 30 днів"],
      ["Optional Sprint CTA", "Необов'язковий наступний крок"],
      ["Methodology and limitations", "Методологія та обмеження"],
      ["Start the 30-Day Growth Sprint", "Розпочати 30-денний Growth Sprint"],
      ["Private Growth Score", "Приватний Growth Score"],
      ["Exactly Top 3", "Рівно 3"],
      ["Representative client journeys", "Репрезентативні шляхи клієнта"],
      ["Broken Connections Map", "Карта розірваних зв'язків"],
      ["Cross-Surface evidence artifact", "Evidence-артефакт між поверхнями"],
    ],
  };

  if (locale !== "ru") {
    return (presentationTranslations[locale] || [])
      .reduce((localized, [source, target]) => localized.replaceAll(source, target), html)
      .replace(/[ \t]+$/gm, "");
  }

  const replacements = [
    ["Where Clients Are Gained - and Lost", "Где клиенты приходят — и где теряются"],
    ["Evidence-backed public paths across exactly four surfaces. These are representative routes, not tracked individual patients.", "Публичные пути с подтверждающими evidence по ровно четырём поверхностям. Это репрезентативные маршруты, а не отслеживание отдельных клиентов."],
    ["Evidence-backed public routes through Search, Website, Social and Reviews toward the gray Lead Intake boundary.", "Публичные маршруты с подтверждающими evidence через Search, Website, Social и отзывы к серой границе приёма обращения."],
    ["Practice identity fallback:", "Резервное обозначение практики:"],
    ["No representative route was assessed. No connection is inferred.", "Репрезентативный маршрут не оценён. Связь не предполагается."],
    ["No public relationship was assessed, so no edge is drawn.", "Публичная связь не оценена, поэтому линия не показана."],
    ["Journey Graph edge detail: not assessed. No required route or failure is inferred.", "Детали связей Journey Graph не оценены. Обязательный маршрут или разрыв не предполагается."],
    ["Journey Graph edge detail: not assessed. No route or failure is inferred.", "Детали связей Journey Graph не оценены. Маршрут или разрыв не предполагается."],
    ["Fixed-order system view from the same Journey Graph artifact used by the Hero.", "Системный вид с фиксированным порядком из того же артефакта Journey Graph, который использует Hero."],
    ["Optional or irrelevant relationships are not drawn.", "Необязательные и нерелевантные связи не показываются."],
    ["Public evidence only · Lead Intake and internal conversion remain NOT ASSESSED without authorized internal evidence.", "Только публичные evidence · приём обращения и внутренняя конверсия остаются НЕ ОЦЕНЕНЫ без разрешённых внутренних evidence."],
    ["Growth Score ends at Lead Intake. It does not infer response, booking, attendance, consultation or payment performance from public evidence.", "Growth Score заканчивается на приёме обращения. Он не делает выводов об ответе, записи, явке, консультации или оплате по публичным evidence."],
    ["An evidence-gated review of the authorized internal path. If the Check continues directly into the next CAESTHETIC 30-Day Growth Sprint for the verified constraint, the $500 is credited once toward the <span data-cae-sprint-price>$2,500</span> Sprint total.", "Проверка разрешённого внутреннего пути только при наличии evidence. Если Check непосредственно продолжается следующим 30-дневным Growth Sprint CAESTHETIC по подтверждённому ограничению, $500 один раз засчитываются в общую стоимость Sprint <span data-cae-sprint-price>$2,500</span>."],
    ["No enquiry, booking, patient, revenue or ROI outcome is promised.", "Результат по обращениям, записям, пациентам, выручке или окупаемости не обещается."],
    ["What to protect, watch, fix or verify", "Что сохранить, наблюдать, исправить или проверить"],
    ["Derived decision intelligence · Existing evidence only", "Производная аналитика решений · Только существующие evidence"],
    ["Treatment, provider, trust and friction views", "Разрезы по услугам, специалистам, доверию и трению"],
    ["These views reorganize the reviewed Growth Score evidence. They add no source, surface, weight, score or automatic priority decision.", "Эти представления систематизируют проверенные evidence Growth Score. Они не добавляют источник, поверхность, вес, балл или автоматический выбор приоритета."],
    ["Treatment Opportunity Matrix", "Матрица возможностей по услугам"],
    ["Treatment-by-surface evidence has not been reviewed.", "Evidence по услугам и поверхностям не проверены."],
    ["Provider Visibility Map", "Карта видимости специалистов"],
    ["Provider identity and proof have not been reviewed across the Four Surfaces.", "Идентичность и подтверждения специалистов не проверены по четырём поверхностям."],
    ["Trust Chain", "Цепочка доверия"],
    ["No treatment-specific identity, provider, proof and next-action chain has been reviewed.", "Цепочка идентичности, услуги, специалиста, подтверждений и следующего действия не проверена."],
    ["Patient Friction Index", "Индекс трения на пути пациента"],
    ["No treatment-specific public path has enough reviewed evidence for a categorical friction signal.", "Для категориального сигнала трения по услуге недостаточно проверенных evidence публичного пути."],
    ["Do Not Promote Yet by Treatment · Human-approved", "Пока не продвигать по услугам · Утверждено человеком"],
    ["Do Not Promote Yet by Treatment · UNSCORED", "Пока не продвигать по услугам · БЕЗ БАЛЛА"],
    ["Hold promotion until the named public-evidence blockers are closed", "Не продвигать, пока указанные блокеры по публичным evidence не закрыты"],
    ["No treatment-specific promotion hold has been approved. This is not permission to promote a treatment.", "Ограничение на продвижение конкретной услуги не утверждено. Это не разрешение продвигать услугу."],
    ["Missing evidence stays unscored and does not create a gap, funding decision or promotion approval.", "Недостающие evidence остаются без оценки и не создают разрыв, решение о финансировании или разрешение на продвижение."],
    ["This index is a categorical view of reviewed public-path states. It is not a score and does not change Overall or Focus Selection.", "Этот индекс — категориальное представление проверенных состояний публичного пути. Это не балл; он не меняет Overall или Focus Selection."],
    ["Human-reviewed inference", "Вывод проверен человеком"],
    ["Needs verification", "Нужна проверка"],
    ["CATEGORICAL · UNSCORED", "КАТЕГОРИЯ · БЕЗ БАЛЛА"],
    ["UNSCORED", "БЕЗ БАЛЛА"],
    ["Revisit when:", "Вернуться, когда:"],
    ["Blockers:", "Блокеры:"],
    ["Cross-Surface Connections Overview", "Обзор связей между поверхностями"],
    ["Primary representative route", "Главный репрезентативный маршрут"],
    ["Surface health", "Состояние поверхностей"],
    ["Journey paths", "Пути клиента"],
    ["Primary Constraint", "Главное ограничение"],
    ["What This Means", "Что это означает"],
    ["Outside-In Diagnosis", "Диагностика снаружи внутрь"],
    ["Four-Surface snapshot", "Сводка по четырём поверхностям"],
    ["Journey edge evidence", "Evidence связей пути"],
    ["Final system synthesis", "Итоговый системный вывод"],
    ["One connected decision system", "Единая связанная система решений"],
    ["Internal conversion boundary", "Граница внутренней конверсии"],
    ["What happens after the enquiry?", "Что происходит после обращения?"],
    ["Lead-to-Revenue Check", "Проверка Lead-to-Revenue"],
    ["Search / Maps", "Поиск / Карты"],
    ["Reviews", "Отзывы"],
    ["Lead Intake", "Приём обращения"],
    ["LEAD INTAKE", "ПРИЁМ ОБРАЩЕНИЯ"],
    ["NEEDS VERIFICATION", "НУЖНА ПРОВЕРКА"],
    ["NOT ASSESSED", "НЕ ОЦЕНЕНО"],
    ["CLEAN", "ИСПРАВНО"],
    ["FRICTION", "ТРЕНИЕ"],
    ["BROKEN", "РАЗРЫВ"],
    ["PROTECT", "СОХРАНИТЬ"],
    ["WATCH", "НАБЛЮДАТЬ"],
    ["FIX NOW", "ИСПРАВИТЬ СЕЙЧАС"],
    ["LEAD RECEIVED", "ОБРАЩЕНИЕ ПОЛУЧЕНО"],
    ["RESPONSE", "ОТВЕТ"],
    ["QUALIFICATION", "КВАЛИФИКАЦИЯ"],
    ["BOOKING", "ЗАПИСЬ"],
    ["CONFIRMATION", "ПОДТВЕРЖДЕНИЕ"],
    ["SHOW", "ЯВКА"],
    ["CONSULTATION", "КОНСУЛЬТАЦИЯ"],
    ["PAYMENT", "ОПЛАТА"],
    ["OUTSIDE-IN DIAGNOSIS", "ДИАГНОСТИКА СНАРУЖИ ВНУТРЬ"],
    ["SURFACE HEALTH", "СОСТОЯНИЕ ПОВЕРХНОСТЕЙ"],
    ["JOURNEY PATHS", "ПУТИ КЛИЕНТА"],
    ["PRIMARY CONSTRAINT", "ГЛАВНОЕ ОГРАНИЧЕНИЕ"],
    ["WHAT THIS MEANS", "ЧТО ЭТО ОЗНАЧАЕТ"],
    ["IMPACT", "ВЛИЯНИЕ"],
    ["Impact", "Влияние"],
    [" clean", " исправных"],
    [" friction", " с трением"],
    [" broken", " разорванных"],
    [" not assessed", " не оценено"],
    ["Executive Overview", "Краткий обзор"],
    ["Executive Network Decision Summary", "Краткое управленческое решение по сети"],
    ["The five-minute implementation view", "Решение по внедрению за пять минут"],
    ["Network Risk Profile", "Профиль рисков сети"],
    ["What the public evidence says across reviewed locations", "Что показывают публичные доказательства по проверенным локациям"],
    ["Why this focus location", "Почему выбрана эта фокусная локация"],
    ["Pilot selection criteria", "Критерии выбора пилота"],
    ["Not a performance ranking.", "Это не рейтинг эффективности бизнеса."],
    ["30-day operational plan", "Операционный план на 30 дней"],
    ["HQ, local and shared responsibility", "Ответственность центральной команды, локации и совместных владельцев"],
    ["Who owns the repair — and when it can roll out", "Кто отвечает за исправление и когда его можно тиражировать"],
    ["What to replicate across the network", "Что стоит тиражировать по сети"],
    ["Observed strengths worth standardizing", "Наблюдаемые сильные стороны для стандартизации"],
    ["Competitive signal", "Конкурентный сигнал"],
    ["What the named comparators change in the decision", "Как выбранные конкуренты влияют на решение"],
    ["Public evidence boundary", "Граница публичных доказательств"],
    ["What this audit can prove — and what remains unassessed", "Что этот аудит подтверждает, а что остаётся неоценённым"],
    ["CMO decisions", "Решения директора по маркетингу"],
    ["Approve the pilot, owners and scale gate", "Утвердить пилот, владельцев и условие тиражирования"],
    [">Protect<", ">Защитить<"],
    [">Fix first<", ">Исправить в первую очередь<"],
    [">Shared issue<", ">Общая проблема<"],
    [">Pilot<", ">Пилот<"],
    [">Scale rule<", ">Правило тиражирования<"],
    [">Decision required<", ">Требуемое решение<"],
    [">Criterion<", ">Критерий<"],
    [">Assessment<", ">Оценка<"],
    [">Public evidence<", ">Публичные доказательства<"],
    ["Human-approved diagnosis", "Диагноз, утверждённый человеком"],
    ["Exactly Top 3 Focus Gaps", "Ровно 3 фокусных разрыва"],
    ["Exactly Top 3", "Ровно 3"],
    ["Complete Remediation Plan", "Полный план исправления"],
    ["Four-Surface score navigator", "Навигатор по четырём поверхностям"],
    ["Evidence drill-down", "Детализация evidence"],
    ["Full Problem / Gap Inventory", "Полный реестр проблем и разрывов"],
    ["Do Not Fund Yet", "Пока не финансировать"],
    ["Four implementation paths", "Четыре пути внедрения"],
    ["Why CAESTHETIC / coordination burden", "Зачем CAESTHETIC и нагрузка координации"],
    ["Illustrative 30-day sequencing preview", "Ориентировочная последовательность на 30 дней"],
    ["Optional Sprint CTA", "Необязательный следующий шаг"],
    ["Methodology and limitations", "Методология и ограничения"],
    ["Private Growth Score", "Закрытый Growth Score"],
    ["Prepared by ", "Подготовила: "],
    ["Prepared ", "Подготовлено: "],
    [">Approved ·", ">Утверждено ·"],
    ["Primary constraint", "Главное ограничение"],
    ["⚠ Main constraint:", "⚠ Главное ограничение:"],
    ["Start with:", "Начать с:"],
    ["Scores are a secondary diagnostic navigator later on this page. They do not choose Focus Gaps.", "Баллы — вспомогательная навигация ниже на странице. Они не определяют фокусные разрывы."],
    ["CAESTHETIC Growth Advisor", "Growth Advisor CAESTHETIC"],
    ["Watch your review →", "Смотреть разбор →"],
    ["Gap Map", "Карта разрывов"],
    ["Representative client journeys", "Репрезентативные пути клиента"],
    ["Evidence-backed paths, not tracked individual patients.", "Пути, подтверждённые evidence, а не отслеживаемые отдельные пациенты."],
    ["Cross-Surface evidence artifact", "Cross-Surface evidence-артефакт"],
    ["Broken Connections Map", "Карта разорванных связей"],
    ["No graph result changes a score automatically.", "Ни один результат графа не меняет балл автоматически."],
    ["Every confirmed hole. Only ", "Все подтверждённые разрывы. Для старта выбрано только "],
    [" selected to start.", "."],
    ["Demand System", "Путь спроса"],
    [">Discovery<", ">Обнаружение<"],
    [">Trust<", ">Доверие<"],
    [">Enquiry<", ">Обращение<"],
    [">Booking<", ">Запись<"],
    [">Treatment<", ">Услуга<"],
    ["LEAK HERE ↓", "УТЕЧКА ЗДЕСЬ ↓"],
    ["Primary Gap", "Главный разрыв"],
    ["Supporting Gaps", "Поддерживающие разрывы"],
    ["Supporting Gap ", "Поддерживающий разрыв "],
    ["Verified backlog", "Подтверждённый backlog"],
    ["Insufficient evidence", "Недостаточно evidence"],
    ["Working / defend", "Работает / сохранить"],
    ["Found on:", "Обнаружено на:"],
    ["Evidence → Explanation:", "Evidence → объяснение:"],
    ["Why now:", "Почему сейчас:"],
    ["Primary dependency:", "Главная зависимость:"],
    ["This is the Главный разрыв. Supporting repairs depend on it.", "Это главный разрыв. Поддерживающие исправления зависят от него."],
    ["Depends on the Главный разрыв: it should not be treated as a separate Sprint commitment.", "Зависит от главного разрыва и не должно считаться отдельным обязательством Sprint."],
    ["Reachable result:", "Достижимый результат:"],
    ["Day-30 result:", "Результат к 30-му дню:"],
    ["After Day 30:", "После 30-го дня:"],
    ["Done when:", "Готово, когда:"],
    ["Who can do this:", "Кто может выполнить:"],
    ["DIY instruction", "Инструкция для самостоятельной работы"],
    ["CAESTHETIC can separately confirm written Sprint scope for the selected Focus Gaps. These DIY steps are not Sprint commitments.", "CAESTHETIC может отдельно письменно подтвердить scope Sprint для выбранных фокусных разрывов. Эти самостоятельные шаги не являются обязательствами Sprint."],
    ["Backlog — not now", "Backlog — не сейчас"],
    [" · Enquiry ·", " · Обращение ·"],
    [" · Discovery ·", " · Обнаружение ·"],
    [" · Trust ·", " · Доверие ·"],
    [" · Booking ·", " · Запись ·"],
    [" · Enquiry<", " · Обращение<"],
    [" · Discovery<", " · Обнаружение<"],
    [" · Trust<", " · Доверие<"],
    [" · Booking<", " · Запись<"],
    ["Focus Gaps", "Фокусные разрывы"],
    ["Exactly three human-approved holes", "Ровно три разрыва, утверждённых человеком"],
    ["Sprint Fit", "Пригодность для Sprint"],
    ["What can honestly close, start, or wait", "Что реально закрыть, начать или отложить"],
    ["Close in 30 days", "Закрыть за 30 дней"],
    ["Start in 30 days", "Начать за 30 дней"],
    ["Not now", "Не сейчас"],
    ["This roadmap is generated from Пригодность для Sprint. It is not purchased scope, a delivery promise or a results guarantee.", "Эта дорожная карта сформирована по Sprint Fit. Это не оплаченный scope, не обещание поставки и не гарантия результата."],
    ["Repair paths", "Пути исправления"],
    ["Four valid ways forward", "Четыре допустимых пути"],
    ["Want to implement the selected Фокусные разрывы yourself? You can.", "Выбранные фокусные разрывы можно исправить самостоятельно."],
    ["View Focus Gap DIY steps", "Открыть шаги для самостоятельной работы"],
    ["Do it in-house", "Сделать внутри команды"],
    ["Use another provider", "Привлечь другого подрядчика"],
    [">Defer<", ">Отложить<"],
    ["Ask CAESTHETIC", "Поручить CAESTHETIC"],
    ["Sprint boundary:", "Граница Sprint:"],
    ["Ownership:", "Ответственность:"],
    ["diagnosed issues", "диагностированных проблем"],
    ["high-priority fixes", "приоритетных исправления"],
    ["systems involved", "затронутых поверхности"],
    ["dependencies", "зависимостей"],
    ["specialist roles", "ролей специалистов"],
    ["NOT YET", "ПОКА НЕ ФИНАНСИРОВАТЬ"],
    ["Revisit after:", "Вернуться после:"],
    ["Full Gap Inventory", "Полный реестр разрывов"],
    [" holes reviewed", " разрыва проверено"],
    ["Filter gaps", "Фильтр разрывов"],
    [">All<", ">Все<"],
    [">Fix now<", ">Исправить сейчас<"],
    [">Fix next<", ">Исправить далее<"],
    [">Monitor<", ">Наблюдать<"],
    ["Evidence and competitors", "Evidence и конкуренты"],
    ["Why the selected holes are real", "Почему выбранные разрывы подтверждены"],
    ["Objective strength:", "Объективная сильная сторона:"],
    ["Strongest surface:", "Самая сильная поверхность:"],
    ["Competitive Decision Analysis", "Конкурентный анализ решений"],
    ["Metric drill-down", "Детализация метрик"],
    ["Approximate / secondary navigation", "Приблизительная / вспомогательная навигация"],
    ["Scores and methodology", "Баллы и методология"],
    ["Scores do not determine Sprint scope.", "Баллы не определяют scope Sprint."],
    ["Strength:", "Сильная сторона:"],
    ["Problem:", "Проблема:"],
    ["Priority:", "Приоритет:"],
    ["View evidence", "Открыть evidence"],
    ["Separate diagnostic · excluded from Overall", "Отдельная диагностика · не входит в Overall"],
    ["Secondary navigator only", "Только вспомогательная навигация"],
    ["CLASS A · VERIFIED", "CLASS A · ПОДТВЕРЖДЕНО"],
    ["ESTIMATE · CLASS B", "ОЦЕНКА · CLASS B"],
    ["Insufficient evidence for a surface score. Available and unavailable metric states are shown below.", "Недостаточно evidence для оценки поверхности. Ниже показаны доступные и недоступные состояния метрик."],
    ["Not collected", "Не собрано"],
    ["No published finding for this metric.", "По этой метрике нет опубликованного вывода."],
    ["Недостаточно evidence for a surface score. Available and unavailable metric states are shown below.", "Недостаточно evidence для оценки поверхности. Ниже показаны доступные и недоступные состояния метрик."],
    ["No source: unavailable", "Источник отсутствует: недоступно"],
    ["No collection date", "Дата сбора отсутствует"],
    ["Source:", "Источник:"],
    ["Collected:", "Собрано:"],
    ["Raw:", "Исходное значение:"],
    ["Approved Class A coverage:", "Покрытие утверждёнными Class A:"],
    ["Excluded from Overall.", "Не входит в Overall."],
    ["Selection method:", "Метод отбора:"],
    ["Window:", "Период:"],
    ["Branch scope:", "Scope филиала:"],
    ["Review sample rule:", "Правило выборки отзывов:"],
    ["Sample limitations:", "Ограничения выборки:"],
    ["eligible reviews", "подходящих отзывов"],
    ["Evidence:", "Evidence:"],
    ["Comparison Matrix — subject and named alternatives across the same Four Surfaces", "Матрица сравнения — объект и выбранные альтернативы по тем же четырём поверхностям"],
    [">Business<", ">Бизнес<"],
    [" <small>Subject</small>", " <small>Объект</small>"],
    ["Competitor Card", "Карточка конкурента"],
    ["Why included:", "Почему включён:"],
    ["Why a patient may choose it:", "Почему клиент может выбрать:"],
    ["Observed strengths:", "Наблюдаемые сильные стороны:"],
    ["Weaknesses / risks:", "Слабости / риски:"],
    ["Repeated positive themes", "Повторяющиеся позитивные темы"],
    ["Repeated negative themes", "Повторяющиеся негативные темы"],
    ["Observable advantage", "Наблюдаемое преимущество"],
    ["Observable gap", "Наблюдаемый разрыв"],
    [">Repeat<", ">Повторить<"],
    [">Improve<", ">Улучшить<"],
    ["Do not copy", "Не копировать"],
    ["Strategic implication", "Стратегическое следствие"],
    ["Constraint effect", "Влияние на constraint"],
    ["Priority effect", "Влияние на приоритет"],
    ["Modernization implication", "Следствие для модернизации"],
    ["Limitations:", "Ограничения:"],
    ["Sources:", "Источники:"],
    [">Defend<", ">Защитить<"],
    [">Close<", ">Закрыть<"],
    [">Differentiate<", ">Дифференцировать<"],
    ["Market Practice Gap · Strategic Modernization", "Разрыв с рыночной практикой · стратегическая модернизация"],
    ["Newer is not automatically better. Test the decision and validation gates.", "Новее не означает автоматически лучше. Нужно проверить решение и validation gates."],
    ["Current:", "Текущее состояние:"],
    ["Observed shift:", "Наблюдаемый сдвиг:"],
    ["Scope:", "Scope:"],
    ["Business implication:", "Следствие для бизнеса:"],
    ["Transition economics:", "Экономика перехода:"],
    ["Dependencies:", "Зависимости:"],
    ["Validation gate:", "Validation gate:"],
    ["No Class B estimates are used in this report.", "В этом отчёте нет оценок Class B."],
    ["Class B assumptions", "Допущения Class B"],
    ["Class A:</strong> directly observable and approved.", "Class A:</strong> наблюдается напрямую и утверждено."],
    ["Class B:</strong> an explicit estimate or inference with its method and assumptions disclosed.", "Class B:</strong> явная оценка или inference с раскрытыми методом и допущениями."],
    ["Class A ratio:", "Доля Class A:"],
    ["published findings", "опубликованных выводов"],
    ["Comparison method:", "Метод сравнения:"],
    ["Scores use heuristic diagnostic weights. They do not determine Sprint scope automatically.", "Баллы используют эвристические диагностические веса и не определяют scope Sprint автоматически."],
    ["Conditional diagnostic CTA", "Условный диагностический следующий шаг"],
    ["Verify the internal path before choosing the fix", "Проверьте внутренний путь до выбора решения"],
    ["The Growth Score identified internal uncertainty that public evidence cannot resolve. Confirm the evidence boundary and request written Check scope before selecting implementation.", "Growth Score выявил внутреннюю неопределённость, которую нельзя разрешить публичными evidence. До выбора способа внедрения подтвердите границы evidence и запросите письменный scope Check."],
    ["Why recommended:", "Почему рекомендовано:"],
    ["Supporting evidence:", "Подтверждающие evidence:"],
    ["Review the Lead-to-Revenue Check", "Открыть Lead-to-Revenue Check"],
    ["View Check", "Открыть Check"],
    ["Optional next step", "Необязательный следующий шаг"],
    ["Поручить CAESTHETIC to take the selected Фокусные разрывы", "Поручить CAESTHETIC выбранные фокусные разрывы"],
    ["Sprint scope is confirmed separately in writing. No Focus Gap or DIY step is included until that written scope exists.", "Scope Sprint отдельно подтверждается письменно. Ни один фокусный разрыв или самостоятельный шаг не входит в работу до такого подтверждения."],
    ["Start the 30-Day Growth Sprint", "Запустить 30-Day Growth Sprint"],
    ["View Sprint", "Открыть Sprint"],
    ["</strong> HIGH", "</strong> ВЫСОКИЙ"],
    ["</strong> MEDIUM", "</strong> СРЕДНИЙ"],
    ["</strong> LOW", "</strong> НИЗКИЙ"],
    ["Open Focus Gap card", "Открыть карточку фокусного разрыва"],
    ["Not now.", "Не сейчас."],
  ];

  return replacements
    .reduce((localized, [source, target]) => localized.replaceAll(source, target), html)
    .replace(/[ \t]+$/gm, "");
}

const PILOT_VISIBLE_TEXT_REPLACEMENTS = Object.freeze([
  ["Treatment Opportunity Matrix", "Матрица возможностей по услугам"],
  ["Treatment-by-surface evidence has not been reviewed.", "Evidence по услугам и поверхностям не проверены."],
  ["Provider Visibility Map", "Карта видимости специалистов"],
  ["Provider identity and proof have not been reviewed across the Four Surfaces.", "Идентичность и подтверждения специалистов не проверены по четырём поверхностям."],
  ["Trust Chain", "Цепочка доверия"],
  ["No treatment-specific identity, provider, proof and next-action chain has been reviewed.", "Цепочка идентичности, услуги, специалиста, подтверждений и следующего действия не проверена."],
  ["Patient Friction Index", "Индекс трения на пути пациента"],
  ["No treatment-specific public path has enough reviewed evidence for a categorical friction signal.", "Для категориального сигнала трения по услуге недостаточно проверенных evidence публичного пути."],
  ["Do Not Promote Yet by Treatment", "Пока не продвигать по услугам"],
  ["No treatment-specific promotion hold has been approved. This is not permission to promote a treatment.", "Ограничение на продвижение конкретной услуги не утверждено. Это не разрешение продвигать услугу."],
  ["Missing evidence stays unscored and does not create a gap, funding decision or promotion approval.", "Недостающие evidence остаются без оценки и не создают разрыв, решение о финансировании или разрешение на продвижение."],
  ["Derived decision intelligence", "Производная аналитика решений"],
  ["Existing evidence only", "Только существующие evidence"],
  ["Treatment, provider, trust and friction views", "Разрезы по услугам, специалистам, доверию и трению"],
  ["These views reorganize the reviewed Growth Score evidence. They add no source, surface, weight, score or automatic priority decision.", "Эти представления систематизируют проверенные evidence Growth Score. Они не добавляют источник, поверхность, вес, балл или автоматический выбор приоритета."],
  ["Needs verification", "Нужна проверка"],
  ["UNSCORED", "БЕЗ БАЛЛА"],
  ["Playa de las Americas", "Плая-де-лас-Америкас"],
  ["Las Americas", "Лас-Америкас"],
  ["San Isidro", "Сан-Исидро"],
  ["Tenerife", "Тенерифе"],
  ["Exactly three", "Ровно три"],
  ["Close In 30 Days", "Закрыть за 30 дней"],
  ["Start In 30 Days", "Начать за 30 дней"],
  ["Close in 30 days", "Закрыть за 30 дней"],
  ["Start in 30 days", "Начать за 30 дней"],
  ["This is the Primary Gap. Supporting repairs depend on it.", "Это главный разрыв. Поддерживающие исправления зависят от него."],
  ["Depends on the Primary Gap: it should not be treated as a separate Sprint commitment.", "Зависит от главного разрыва и не считается отдельным обязательством спринта."],
  ["Insufficient repetition for a positive theme", "Недостаточно повторений позитивной темы"],
  ["Insufficient repetition for a negative theme", "Недостаточно повторений негативной темы"],
  ["Market Practice Gap", "Разрыв с рыночной практикой"],
  ["Positioning Reference", "Ориентир позиционирования"],
  ["positioning reference", "ориентир позиционирования"],
  ["Category Leader", "Лидер категории"],
  ["category leader", "лидер категории"],
  ["Primary Gap", "Главный разрыв"],
  ["Supporting Gap", "Поддерживающий разрыв"],
  ["Cross-Surface Consistency", "Согласованность четырёх поверхностей"],
  ["Cross-Surface", "Согласованность поверхностей"],
  ["Cross Surface", "Согласованность поверхностей"],
  ["CROSS SURFACE", "СОГЛАСОВАННОСТЬ ПОВЕРХНОСТЕЙ"],
  ["SEARCH", "ПОИСК"],
  ["WEBSITE", "САЙТ"],
  ["SOCIAL", "СОЦИАЛЬНЫЕ СЕТИ"],
  ["REPUTATION", "РЕПУТАЦИЯ"],
  ["OVERALL", "ОБЩАЯ ОЦЕНКА"],
  ["Search", "Поиск"],
  ["Website", "Сайт"],
  ["Social", "Социальные сети"],
  ["Reputation", "Репутация"],
  ["Discovery", "Обнаружение"],
  ["Trust", "Доверие"],
  ["Enquiry", "Обращение"],
  ["Booking", "Запись"],
  ["Treatment", "Услуга"],
  ["Verified", "Подтверждено"],
  ["Insufficient", "Недостаточно доказательств"],
  ["insufficient", "недостаточно доказательств"],
  ["CROSS-SURFACE", "СОГЛАСОВАННОСТЬ ПОВЕРХНОСТЕЙ"],
  ["HIGH", "ВЫСОКИЙ"],
  ["MEDIUM", "СРЕДНИЙ"],
  ["LOW", "НИЗКИЙ"],
  ["not now", "не сейчас"],
  ["Not now", "Не сейчас"],
  ["mobile-first", "сначала для мобильных устройств"],
  ["Why ", "Почему "],
  ["constraint", "ограничение"],
  ["GROWTH SCORE", "ОТЧЁТ О РОСТЕ"],
  ["Проверка Lead-to-Revenue", "Проверка пути от обращения к выручке"],
  ["NEEDS VERIFICATION", "НУЖНА ПРОВЕРКА"],
  ["LEAD RECEIVED", "ОБРАЩЕНИЕ ПОЛУЧЕНО"],
  ["RESPONSE", "ОТВЕТ"],
  ["QUALIFICATION", "КВАЛИФИКАЦИЯ"],
  ["BOOKING", "ЗАПИСЬ"],
  ["CONFIRMATION", "ПОДТВЕРЖДЕНИЕ"],
  ["SHOW", "ЯВКА"],
  ["CONSULTATION", "КОНСУЛЬТАЦИЯ"],
  ["PAYMENT", "ОПЛАТА"],
  ["Journey Graph", "граф путей"],
  ["Hero", "главная карта"],
  ["Maps", "Карты"],
  ["Reviews", "Отзывы"],
  ["Growth Score orientation", "Навигация по отчёту"],
  ["Growth Score", "Growth Score"],
  ["Evidence", "доказательства"],
  ["evidence", "доказательства"],
  ["Sprint Fit", "пригодность для спринта"],
  ["Sprint", "спринт"],
  ["Growth спринт", "спринт роста"],
  ["Check", "проверка"],
  ["scope", "объём работ"],
  ["Scope", "Объём"],
  ["Backlog", "Отложено"],
  ["backlog", "отложено"],
  ["Overall", "общую оценку"],
  ["Class A", "класс А"],
  ["CLASS A", "КЛАСС А"],
  ["Class B", "класс Б"],
  ["CLASS B", "КЛАСС Б"],
  ["human review", "проверки человеком"],
  ["inference", "выводом"],
  ["validation gates", "условия подтверждения"],
  ["close in 30 days", "закрыть за 30 дней"],
  ["start in 30 days", "начать за 30 дней"],
  ["local", "локальный"],
  ["subject", "объект"],
  ["directory", "каталог"],
  ["website", "сайт"],
  ["social", "социальные сети"],
  ["maps", "карты"],
  ["review platform", "площадка отзывов"],
  ["review_platform", "площадка отзывов"],
  ["public ad", "публичное объявление"],
  ["public_ad", "публичное объявление"],
  ["insufficient repetition", "недостаточно повторений"],
  ["Insufficient repetition", "Недостаточно повторений"],
  ["repetition", "повторений"],
  ["Unidad", "помещение"],
  ["insufficient evidence", "недостаточно доказательств"],
  ["Insufficient evidence", "Недостаточно доказательств"],
  ["Valerie Petra", "Валери Петра"],
  ["Growth Advisor", "консультант по росту"],
]);

const PILOT_EVIDENCE_LABELS = Object.freeze({
  "search.entity_integrity": "поиск: целостность сущности",
  "website.booking_friction": "сайт: путь к записи",
  "social.local_offer_clarity": "социальные сети: ясность предложения",
  "social.profile_to_booking": "социальные сети: путь к записи",
  "reputation.rating": "репутация: публичный рейтинг",
  "cross.positioning_coherence": "согласованность: позиционирование",
  "cross.conversion_continuity": "согласованность: путь к записи",
  "cross.identity_coherence": "согласованность: идентичность",
});

function finalizePilotHtml(html, report) {
  const officialNames = [...new Set(report.presentation?.official_names || [])]
    .sort((left, right) => right.length - left.length);
  const replaceTextNode = (text) => {
    let output = text;
    const protectedUrls = [];
    output = output.replace(/https?:\/\/[^\s<,;]+/g, (url) => {
      const token = `@@CAE_SOURCE_URL_${protectedUrls.length}@@`;
      protectedUrls.push([token, url]);
      return token;
    });
    const protectedNames = officialNames.map((name, index) => {
      const escapedName = name.replaceAll("&", "&amp;");
      const token = `@@CAE_OFFICIAL_${index}@@`;
      output = output.replaceAll(escapedName, token);
      return [token, escapedName];
    });
    for (const [ref, label] of Object.entries(PILOT_EVIDENCE_LABELS)) {
      output = output.replaceAll(ref, label);
    }
    for (const [source, target] of PILOT_VISIBLE_TEXT_REPLACEMENTS) {
      output = output.replaceAll(source, target);
    }
    output = output
      .replace(/\b\d+(?:\.\d+)?\/100\b/g, "не публикуется")
      .replace(/\s+to\s+/g, " — ");
    for (const [token, url] of protectedUrls) {
      output = output.replaceAll(token, `<a href="${url}">Открыть источник</a>`);
    }
    for (const [token, escapedName] of protectedNames) {
      output = output.replaceAll(token, `<span data-brand>${escapedName}</span>`);
    }
    return output;
  };
  const withoutRawMetricPayloads = html.replace(
    /(<li class="cae-report-metric">[\s\S]*?)<small>[\s\S]*?<\/small>([\s\S]*?<\/li>)/g,
    "$1<small>Источники и исходные значения сохранены в проверяемом отчёте.</small>$2",
  );
  const bodyStart = withoutRawMetricPayloads.indexOf("<body");
  const head = withoutRawMetricPayloads.slice(0, bodyStart);
  const body = withoutRawMetricPayloads.slice(bodyStart)
    .replace(/(\d)T(?=\d)/g, "$1 ")
    .replace(/(\d)Z\b/g, "$1 по всемирному координированному времени")
    .replace(/>([^<]*)</g, (_match, text) => `>${replaceTextNode(text)}<`);
  return `${head}${body}`;
}

export function renderGrowthReport(report) {
  requireReportContent(report);
  const isNetworkParent = isMultiLocationNetworkParent(report);
  const isFocusLocationChild = isMultiLocationFocusLocation(report);
  if (isNetworkParent) validateMultiLocationNetworkReport(report);
  const networkView = isNetworkParent ? buildMultiLocationPresentationModel(report) : null;
  const result = scoreGrowthReport(report);
  const isDemo = report.reportKind === "demo";
  const isPilot = report.presentation?.kind === "pilot";
  const diagnosis = report.humanDiagnosis;
  const methodology = report.methodology;
  protectedRenderValues = [];
  const reportLabel = isDemo ? "Growth Score" : "Private Growth Score";
  const kicker = isDemo ? "SYNTHETIC DEMO" : reportLabel;
  const pageTitle = `${reportLabel} — ${escapeHtml(report.practice.name)} | CAESTHETIC`;
  const disclosure = isDemo
    ? `<div class="cae-demo-banner" role="note">SYNTHETIC DEMO — ${escapeHtml(report.disclosure)}</div>`
    : `<div class="cae-report-disclosure" role="note">${escapeHtml(report.disclosure)}</div>`;
  const strengths = diagnosis.current_state.strengths.slice(0, 2);
  const burden = diagnosis.coordination_burden;
  const burdenLabels = Object.freeze({
    diagnosed_issues: "diagnosed issues",
    high_priority_fixes: "high-priority fixes",
    systems_involved: "systems involved",
    dependencies: "dependencies",
    specialist_roles: "specialist roles",
  });
  const burdenRows = Object.entries(burdenLabels)
    .filter(([field]) => Number.isInteger(burden[field]))
    .map(([field, label]) => `<p><strong>${escapeHtml(burden[field])}</strong> ${label}</p>`)
    .join("");
  const inventoryCount = diagnosis.gap_inventory.length;
  const focus = diagnosis.focus_selection;
  const focusCount = selectedFocusGapIds(focus).length;
  const preparedDate = (() => {
    const raw = report.practice.preparedAt;
    if (!isNetworkParent && !isFocusLocationChild) return raw;
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00Z`) : null;
    if (!parsed || !Number.isFinite(parsed.valueOf())) return raw;
    const locale = ({ en: "en-US", ru: "ru-RU", es: "es-ES", fr: "fr-FR", uk: "uk-UA" })[report.reportContext?.report_locale] || "en-US";
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(parsed);
  })();

  const html = `<!doctype html>
<html lang="${report.reportContext?.report_locale === "en" ? "en-US" : report.reportContext?.report_locale}" data-page="growth-score-report" data-report-kind="${isPilot ? "pilot" : escapeHtml(report.reportKind)}"${isPilot ? ` data-template-version="${escapeHtml(report.templateVersion)}"` : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <title>${pageTitle}</title>
  <meta name="description" content="${isDemo ? "Fictional, synthetic Growth Score demonstration with no client relationship." : "Private CAESTHETIC Four-Surface Growth Score."}">
  <link rel="icon" href="/assets/brand/logo-square.png">
  <link rel="stylesheet" href="/assets/css/caesthetic.css">
  <link rel="stylesheet" href="/assets/css/growth-report.css">
</head>
<body class="cae-score-report${isNetworkParent ? " cae-score-report--multi-location" : ""}${isFocusLocationChild ? " cae-score-report--focus-location" : ""}">
${disclosure}
${isPilot ? "" : '<div id="cae-header-slot"></div>'}
<main>
  <section class="cae-report-hero" id="report-overview">
    <div class="cae-wrap">
      <header class="cae-report-header">
        <p class="cae-kicker">Executive Overview · ${kicker}</p>
        <h1>${escapeHtml(report.practice.name)}</h1>
        <p class="cae-report-meta">${escapeHtml(report.practice.location)} · Prepared ${escapeHtml(preparedDate)}</p>
        <p class="cae-report-meta">Prepared by ${escapeHtml(VALERIE.name)} · ${VALERIE.role}</p>
      </header>
      ${executiveNetworkDecisionHtml(report)}
      ${networkCoverageHtml(report)}
      ${focusChildNavigationHtml(report)}
      <div class="cae-report-hero__grid">
        <article class="cae-report-state">
          <p class="cae-kicker">Primary constraint</p>
          <h2 class="cae-h2">${escapeHtml(diagnosis.binding_constraint.title)}</h2>
          <ul>${strengths.map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul>
          <p><strong>⚠ Main constraint:</strong> ${escapeHtml(diagnosis.current_state.constraint_label)}</p>
          <p>${escapeHtml(diagnosis.current_state.constraint_detail)}</p>
          <p><strong>Start with:</strong> ${escapeHtml(diagnosis.current_state.priority_line)}</p>
          <p class="cae-report-note">Scores are a secondary diagnostic navigator later on this page. They do not choose Focus Gaps.</p>
        </article>
      </div>
    </div>
  </section>

${growthScoreIntroHtml(report)}

  <section class="cae-section" id="gap-map" data-cockpit-order="1">
    <div class="cae-wrap">
      <p class="cae-kicker">Gap Map · Human-approved diagnosis</p>
      <h2 class="cae-h2">${isNetworkParent ? "Where growth is currently constrained" : `Every confirmed hole. Only ${focusCount} selected to start.`}</h2>
      <p>${escapeHtml(diagnosis.binding_constraint.statement)}</p>
      ${demandSystemHtml(diagnosis.binding_constraint.demand_stage)}
      ${isNetworkParent ? `${networkRiskProfileHtml(report)}${networkFocusDecisionHtml(report)}${networkComparisonHtml(report)}${networkJourneyAtlasHtml(report)}` : (result.journeyGraph ? heroJourneyMapHtml(report, result, result.journeyGraph) : "")}
      ${isNetworkParent ? "" : surfaceSnapshotHtml(report, result)}
      ${isNetworkParent ? "" : (result.journeyGraph ? brokenConnectionsMapHtml(report, result, result.journeyGraph) : "")}
      ${isNetworkParent && networkView.decision_intelligence
        ? networkDecisionIntelligenceHtml(networkView.decision_intelligence)
        : growthScoreDecisionViewsHtml(result.decisionViews)}
      <div class="cae-gap-map__legend" aria-label="Gap Map legend">
        <span class="cae-status-pill"><b class="cae-gap-map__symbol cae-gap-map__mark--primary" aria-hidden="true">1</b> Primary Gap</span>
        <span class="cae-status-pill"><b class="cae-gap-map__symbol cae-gap-map__mark--supporting" aria-hidden="true">2</b> Supporting Gaps</span>
        <span class="cae-status-pill"><b class="cae-gap-map__symbol cae-gap-map__mark--backlog" aria-hidden="true">•</b> Verified backlog</span>
        <span class="cae-status-pill"><b class="cae-gap-map__symbol cae-gap-map__mark--insufficient" aria-hidden="true">?</b> Insufficient evidence</span>
        <span class="cae-status-pill"><b class="cae-gap-map__symbol cae-gap-map__mark--working" aria-hidden="true">✓</b> Working / defend</span>
      </div>
      ${gapMapHtml(diagnosis.gap_inventory, focus)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="focus-gaps" data-cockpit-order="2">
    <div class="cae-wrap">
      <p class="cae-kicker">Focus Gaps · Exactly Top 3</p>
      <h2 class="cae-h2">${isNetworkParent ? "Three validated priorities" : "Exactly three human-approved holes"}</h2>
      <p>${escapeHtml(focus.rationale)}</p>
      ${isNetworkParent ? "" : `<ol class="cae-focus-summary">${focusGapSummary(diagnosis.gap_inventory, focus)}</ol>`}
      <div class="cae-focus-gaps${isNetworkParent ? " cae-focus-gaps--network" : ""}">${focusGapCards(diagnosis.gap_inventory, focus, { networkView })}</div>
    </div>
  </section>

  <section class="cae-section" id="sprint-fit" data-cockpit-order="3">
    <div class="cae-wrap">
      <p class="cae-kicker">Sprint Fit</p>
      <h2 class="cae-h2">${isNetworkParent ? "30-day operational plan" : "What can honestly close, start, or wait"}</h2>
      ${isNetworkParent ? networkOperationalPlanHtml(report) : sprintFitHtml(diagnosis.gap_inventory, focus)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="repair-paths" data-cockpit-order="4">
    <div class="cae-wrap">
      <p class="cae-kicker">Repair paths</p>
      <h2 class="cae-h2">${isNetworkParent ? "Ownership and rollout logic" : "Four valid ways forward"}</h2>
      ${isNetworkParent ? networkOwnershipRolloutHtml(report) : ""}
      <p>Want to implement the selected Focus Gaps yourself? You can.</p>
      <p><a class="cae-report-inline-link" href="#focus-gaps">View Focus Gap DIY steps</a></p>
      <div class="cae-report-paths">
        <article><span>Do it in-house</span><p>${escapeHtml(report.implementation_paths.diy)}</p></article>
        <article><span>Use another provider</span><p>${escapeHtml(report.implementation_paths.other_provider)}</p></article>
        <article><span>Defer</span><p>${escapeHtml(report.implementation_paths.defer)}</p></article>
        <article><span>Ask CAESTHETIC</span><p>${escapeHtml(report.implementation_paths.caesthetic)}</p></article>
      </div>
      <div class="cae-report-why">
        <p><strong>Why CAESTHETIC:</strong> ${escapeHtml(report.why_caesthetic.evidence_advantage)}</p>
        <p>${escapeHtml(report.why_caesthetic.coordination_advantage)}</p>
        <p><strong>Sprint boundary:</strong> ${escapeHtml(report.why_caesthetic.sprint_boundary)}</p>
        <p><strong>Ownership:</strong> ${escapeHtml(report.why_caesthetic.ownership)}</p>
        <div class="cae-report-burden">${burdenRows}</div>
      </div>
    </div>
  </section>

  <section class="cae-section" id="do-not-fund" data-cockpit-order="5">
    <div class="cae-wrap cae-wrap--narrow">
      <article class="cae-report-do-not-do">
        <p class="cae-kicker">Do Not Fund Yet</p>
        <h2 class="cae-h2">${escapeHtml(diagnosis.do_not_do.title)}</h2>
        <p>${escapeHtml(diagnosis.do_not_do.rationale)}</p>
        <p><strong>Revisit after:</strong></p>
        <ul>${diagnosis.do_not_do.revisit_after.map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
      ${isNetworkParent && networkView.decision_intelligence
        ? networkDoNotPromoteHtml(networkView.decision_intelligence)
        : doNotPromoteYetByTreatmentHtml(result.decisionViews.do_not_promote_yet_by_treatment)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="gap-inventory" data-cockpit-order="6">
    <div class="cae-wrap">
      <p class="cae-kicker">Full Problem / Gap Inventory</p>
      <h2 class="cae-h2">${inventoryCount} ${isNetworkParent ? "findings" : "holes"} reviewed</h2>
      ${isNetworkParent ? networkPropagationHtml(report) : ""}
      <div class="cae-report-filters" role="toolbar" aria-label="Filter gaps">
        <button type="button" data-filter="all">All</button>
        <button type="button" data-filter="fix-now">Fix now</button>
        <button type="button" data-filter="fix-next">Fix next</button>
        <button type="button" data-filter="monitor">Monitor</button>
        <button type="button" data-filter="insufficient">Insufficient evidence</button>
      </div>
      <div class="cae-report-problems">${inventoryRows(diagnosis.gap_inventory, focus)}</div>
    </div>
  </section>

  <section class="cae-section" id="evidence-and-competitors" data-cockpit-order="7">
    <div class="cae-wrap">
      <p class="cae-kicker">Evidence and competitors</p>
      <h2 class="cae-h2">${isNetworkParent ? "Evidence behind the priorities" : "Why the selected holes are real"}</h2>
      <p><strong>Objective strength:</strong> ${escapeHtml(diagnosis.objective_strength.title)} ${isNetworkParent ? "" : `<small>Evidence: ${refs(diagnosis.objective_strength.evidence_refs)}</small>`}</p>
      <p><strong>Strongest surface:</strong> ${escapeHtml(surfaceLabels[diagnosis.strongest_surface] || diagnosis.strongest_surface)}</p>
      ${isNetworkParent ? networkCompetitorSummaryHtml(report) : ""}
      ${isNetworkParent ? `
      <details class="cae-report-disclosure-panel">
        <summary>Competitive Decision Analysis</summary>
        <div>${competitorRows(diagnosis.competitors)}</div>
      </details>
      <details class="cae-report-disclosure-panel">
        <summary>Metric evidence and technical references</summary>
        <div>${evidenceAccordion(report, result)}</div>
      </details>` : `
      ${result.journeyGraph ? journeyGraphEvidenceDetailsHtml(report) : ""}
      <h3 class="cae-report-subhead">Competitive Decision Analysis</h3>
${competitorRows(diagnosis.competitors)}
      <h3 class="cae-report-subhead">Metric drill-down</h3>
      ${evidenceAccordion(report, result)}`}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="scores-and-methodology" data-cockpit-order="8">
    <div class="cae-wrap">
      <p class="cae-kicker">Approximate / secondary navigation</p>
      <h2 class="cae-h2">Scores and methodology</h2>
      <p class="cae-report-intro">Search 30% · Website 25% · Social 15% · Reputation 30%. Scores do not determine Sprint scope.</p>
      ${isNetworkParent ? networkEvidenceBoundaryHtml(report) : ""}
      ${isNetworkParent ? networkMethodHtml(report) : `<div class="cae-report-score-nav" aria-label="Approximate Growth Score navigator">${surfaceNavigatorCards(report, result)}</div>`}
      <div class="cae-report-method__grid">
        <div>
          <p><strong>Class A:</strong> directly observable and approved. <strong>Class B:</strong> an explicit estimate or inference with its method and assumptions disclosed.</p>
          <p><strong>Class A ratio:</strong> ${result.evidence.classACount}/${result.evidence.publishedFindingCount} published findings (${Math.round(result.evidence.classARatio * 100)}%).</p>
          <p><strong>Collected:</strong> ${escapeHtml(methodology.collectedAt)}</p>
          <p><strong>Sources:</strong> ${escapeHtml(methodology.sources.join(", "))}</p>
          <p><strong>Comparison method:</strong> ${escapeHtml(methodology.competitorSelection)}</p>
          <p><strong>Limitations:</strong> ${escapeHtml(methodology.limitations)}</p>
          <p>Scores use heuristic diagnostic weights. They do not determine Sprint scope automatically.</p>
        </div>
        <div><h3>Class B assumptions</h3>${estimateRows(report.estimates)}</div>
      </div>
      ${isDemo ? '<p><a class="cae-report-inline-link" href="/growth-score/#demo-growth-scores">View all synthetic demos</a></p>' : ""}
    </div>
  </section>

  <section class="cae-section cae-report-final" id="next-step" data-cockpit-order="9">
    <div class="cae-wrap">
      <div class="cae-report-synthesis">
        <p class="cae-kicker">Final system synthesis</p>
        <h2 class="cae-h2">One connected decision system</h2>
        <p>${escapeHtml(report.crossSurface.summary)}</p>
        <p><strong>Do Not Fund Yet:</strong> ${escapeHtml(diagnosis.do_not_do.title)}</p>
      </div>
      ${leadToRevenueMapHtml(report)}
      ${isNetworkParent ? networkExecutiveDecisionHtml(report) : ""}
      ${isFocusLocationChild ? `
        <p class="cae-kicker">Multi-Location package</p>
        <h2 class="cae-h2">Return to the network implementation decision</h2>
        <p>This detailed location page does not add a second commercial decision.</p>
        ${focusChildNavigationHtml(report)}
      ` : commercialNextStepHtml(report)}
    </div>
  </section>

</main>
<a class="cae-sticky-sprint" href="#next-step" hidden>${isLeadToRevenueCheckRecommended(report) ? "View Check" : "View Sprint"}</a>
${isPilot ? "" : '<div id="cae-footer-slot"></div>\n<script src="/assets/js/caesthetic-config.js"></script>\n<script src="/assets/js/caesthetic.js" defer></script>\n<script src="/assets/js/analytics.js" defer></script>'}
<script src="/assets/js/growth-cockpit.js" defer></script>
</body>
</html>
`;
  const values = protectedRenderValues;
  protectedRenderValues = null;
  const rendered = values.reduce(
    (rendered, [token, value]) => rendered.replaceAll(token, value),
    localizeReportHtml(html, report.reportContext?.report_locale),
  ).replace(/[ \t]+$/gm, "");
  return isPilot ? finalizePilotHtml(rendered, report) : rendered;
}

export function isUnguessableScoreSlug(slug) {
  return realScoreSlugPattern.test(String(slug));
}

export function isAllowedRealScoreOutput(report, outputPath) {
  const outputDirectory = path.dirname(outputPath);
  const outputSlug = path.basename(outputDirectory);
  if (isUnguessableScoreSlug(outputSlug)) return true;
  if (
    report?.audit?.format === "multi_location"
    && report.audit.package_role === "focus_location"
    && isUnguessableScoreSlug(path.basename(path.dirname(outputDirectory)))
    && report.audit.child_route === `/score/${path.basename(path.dirname(outputDirectory))}/${outputSlug}/`
    && report.audit.parent_route === `/score/${path.basename(path.dirname(outputDirectory))}/`
  ) return true;
  return false;
}

function findReportPaths(root) {
  const reports = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(directory, entry.name);
      const reportPath = path.join(child, "report.json");
      if (fs.existsSync(reportPath)) reports.push(reportPath);
      visit(child);
    }
  };
  visit(root);
  return reports.sort();
}

export function renderReportFile(reportPath, { outputPath = path.join(path.dirname(reportPath), "index.html"), check = false } = {}) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  if (report.schemaVersion !== 5) {
    if (check) return true;
    return null;
  }
  const isApprovedPilot = report.reportKind === "real" && report.presentation?.kind === "pilot";
  if (report.reportKind === "real" && !isApprovedPilot && !isAllowedRealScoreOutput(report, outputPath)) {
    throw new TypeError("Real Growth Score output must use an unguessable /score/<slug>/ directory");
  }
  const output = renderGrowthReport(report);
  if (check) return fs.existsSync(outputPath) && fs.readFileSync(outputPath, "utf8") === output;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  return outputPath;
}

function runCli() {
  const args = process.argv.slice(2);
  const checking = args.includes("--check");
  const reportFlag = args.indexOf("--report");
  const outFlag = args.indexOf("--out");
  const reportPaths = reportFlag >= 0 ? [path.resolve(args[reportFlag + 1])] : findReportPaths(scoreRoot);
  let drift = false;
  for (const reportPath of reportPaths) {
    const outputPath = outFlag >= 0 ? path.resolve(args[outFlag + 1]) : path.join(path.dirname(reportPath), "index.html");
    if (checking) {
      if (!renderReportFile(reportPath, { outputPath, check: true })) {
        console.error(`Growth Score render drift: ${path.relative(repoRoot, outputPath)}`);
        drift = true;
      }
    } else {
      const rendered = renderReportFile(reportPath, { outputPath });
      if (rendered) console.log(`Rendered ${path.relative(repoRoot, outputPath)}`);
    }
  }
  if (!reportPaths.length) throw new Error(`No report.json files found under ${scoreRoot}`);
  if (drift) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) runCli();
