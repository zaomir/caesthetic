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
const FOCUS_RANKS = Object.freeze(["1", "2", "3", "4"]);
const VALERIE = Object.freeze({
  name: "Valerie Petra",
  role: "CAESTHETIC Growth Advisor",
  photo: "/assets/img/team/valerie-petra.svg",
});

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

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
  if (selectedIds.length < 3 || selectedIds.length > 4) {
    throw new TypeError("humanDiagnosis.focus_selection must contain 3 or 4 unique gaps");
  }
  for (const pathId of ["diy", "other_provider", "defer", "caesthetic"]) {
    if (!report.implementation_paths?.[pathId]) throw new TypeError(`implementation_paths.${pathId} is required`);
  }
  for (const key of ["evidence_advantage", "coordination_advantage", "sprint_boundary", "ownership"]) {
    if (!report.why_caesthetic?.[key]) throw new TypeError(`why_caesthetic.${key} is required`);
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
  requireArray(diagnosis.focus_selection?.supporting_gap_ids, "humanDiagnosis.focus_selection.supporting_gap_ids", { min: 2, max: 3 });
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
                <small>${escapeHtml(surfaces)} · ${escapeHtml(sentenceCase(gap.journey_stage))} · ${escapeHtml(marker.label)}</small>
              </span>
            </a>
          </li>`;
  }).join("\n")}
        </ol>`;
}

function focusGapCards(gaps, focus) {
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
    return `
          <article class="cae-focus-gap" id="gap-${escapeHtml(gap.id)}" data-gap-role="${marker.kind}">
            <p class="cae-focus-gap__rank" aria-label="${escapeHtml(marker.label)}">${FOCUS_RANKS[index]} · ${escapeHtml(marker.label)}</p>
            <h3>${escapeHtml(gap.title)}</h3>
            <p><strong>Found on:</strong> ${escapeHtml(surfaces)} · ${escapeHtml(sentenceCase(gap.journey_stage))}</p>
            <p><strong>Evidence → Explanation:</strong> ${refs(gap.evidence_refs)}. ${escapeHtml(gap.why_it_matters)}</p>
            <p><strong>Why now:</strong> ${escapeHtml(focus.rationale)}</p>
            <p><strong>Primary dependency:</strong> ${escapeHtml(dependency)}</p>
            <p><strong>Sprint Fit:</strong> ${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</p>
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
          <article><p class="cae-kicker">Close in 30 days</p>${row(close, "None selected.")}</article>
          <article><p class="cae-kicker">Start in 30 days</p>${row(start, "No long initiative was started.")}</article>
          <article><p class="cae-kicker">Not now</p>${row(backlog, "No backlog holes.")}</article>
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
            <a class="cae-report-inline-link" href="#evidence-drilldown">View evidence</a>
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
            <p class="cae-kicker">${escapeHtml(gap.id)} · ${escapeHtml(surfaces)} · ${escapeHtml(marker.label)}</p>
            <h3>${escapeHtml(gap.title)}</h3>
            <p>${escapeHtml(gap.why_it_matters)}</p>
            <p><strong>Sprint Fit:</strong> ${escapeHtml(sprintFitLabel(gap.sprint_fit.mode))}</p>
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

function walkthroughHeroCard(walkthrough, isDemo) {
  const duration = walkthrough.duration ? escapeHtml(walkthrough.duration) : "4–6 min";
  const body = `
      <img src="${VALERIE.photo}" alt="${escapeHtml(VALERIE.name)}" width="72" height="72">
      <p class="cae-kicker">Your Growth Review</p>
      <strong>${escapeHtml(VALERIE.name)}</strong>
      <p>${escapeHtml(VALERIE.role)}</p>
      <p>${duration}</p>`;

  if (walkthrough.status === "available") {
    return `<a class="cae-report-walkthrough" href="${escapeHtml(walkthrough.url)}" rel="nofollow noopener">${body}<span>Watch your review →</span></a>`;
  }

  const pendingCopy = isDemo
    ? walkthrough.placeholder
    : "Your human-reviewed walkthrough is being prepared.";
  return `<div class="cae-report-walkthrough" role="note">${body}<p>${escapeHtml(pendingCopy)}</p></div>`;
}

function reviewerStatusLabel(status) {
  return sentenceCase(status);
}

function localizeReportHtml(html, locale) {
  if (locale !== "ru") return html;

  const replacements = [
    ["Private Growth Score", "Закрытый Growth Score"],
    ["Prepared by ", "Подготовила: "],
    ["Prepared ", "Подготовлено: "],
    [">Approved ·", ">Утверждено ·"],
    ["Primary constraint", "Главное ограничение"],
    ["⚠ Main constraint:", "⚠ Главное ограничение:"],
    ["Start with:", "Начать с:"],
    ["Scores are a secondary diagnostic navigator later on this page. They do not choose Focus Gaps.", "Баллы — вспомогательная навигация ниже на странице. Они не определяют фокусные разрывы."],
    ["Your Growth Review", "Ваш разбор Growth Score"],
    ["CAESTHETIC Growth Advisor", "Growth Advisor CAESTHETIC"],
    ["Watch your review →", "Смотреть разбор →"],
    ["Your human-reviewed walkthrough is being prepared.", "Видеоразбор после human review готовится."],
    ["Gap Map", "Карта разрывов"],
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
    [" holes chosen by ", " разрыва выбрал "],
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

export function renderGrowthReport(report) {
  requireReportContent(report);
  const result = scoreGrowthReport(report);
  const isDemo = report.reportKind === "demo";
  const diagnosis = report.humanDiagnosis;
  const methodology = report.methodology;
  const kicker = isDemo ? "SYNTHETIC DEMO" : "Private Growth Score";
  const pageTitle = `${isDemo ? "Growth Score" : "Private Growth Score"} — ${escapeHtml(report.practice.name)} | CAESTHETIC`;
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

  const html = `<!doctype html>
<html lang="${report.reportContext?.report_locale === "ru" ? "ru" : "en-US"}" data-page="growth-score-report" data-report-kind="${escapeHtml(report.reportKind)}">
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
<body class="cae-score-report">
${disclosure}
<div id="cae-header-slot"></div>
<main>
  <section class="cae-report-hero" id="report-overview">
    <div class="cae-wrap">
      <header class="cae-report-header">
        <p class="cae-kicker">${escapeHtml(kicker)}</p>
        <h1>${escapeHtml(report.practice.name)}</h1>
        <p class="cae-report-meta">${escapeHtml(report.practice.location)} · Prepared ${escapeHtml(report.practice.preparedAt)}</p>
        <p class="cae-report-meta">Prepared by ${escapeHtml(VALERIE.name)} · ${escapeHtml(VALERIE.role)}</p>
        <p class="cae-report-meta">${escapeHtml(reviewerStatusLabel(diagnosis.reviewer_status))} · ${escapeHtml(diagnosis.reviewer.name)} · ${escapeHtml(diagnosis.reviewer.approved_at)}</p>
      </header>
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
        ${walkthroughHeroCard(diagnosis.walkthrough, isDemo)}
      </div>
    </div>
  </section>

  <section class="cae-section" id="gap-map" data-cockpit-order="1">
    <div class="cae-wrap">
      <p class="cae-kicker">Gap Map</p>
      <h2 class="cae-h2">Every confirmed hole. Only ${focusCount} selected to start.</h2>
      <p>${escapeHtml(diagnosis.binding_constraint.statement)}</p>
      ${demandSystemHtml(diagnosis.binding_constraint.demand_stage)}
      <div class="cae-gap-map__legend" aria-label="Gap Map legend">
        <span><b class="cae-gap-map__symbol cae-gap-map__mark--primary" aria-hidden="true">1</b> Primary Gap</span>
        <span><b class="cae-gap-map__symbol cae-gap-map__mark--supporting" aria-hidden="true">2</b> Supporting Gaps</span>
        <span><b class="cae-gap-map__symbol cae-gap-map__mark--backlog" aria-hidden="true">•</b> Verified backlog</span>
        <span><b class="cae-gap-map__symbol cae-gap-map__mark--insufficient" aria-hidden="true">?</b> Insufficient evidence</span>
        <span><b class="cae-gap-map__symbol cae-gap-map__mark--working" aria-hidden="true">✓</b> Working / defend</span>
      </div>
      ${gapMapHtml(diagnosis.gap_inventory, focus)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="focus-gaps" data-cockpit-order="2">
    <div class="cae-wrap">
      <p class="cae-kicker">Focus Gaps</p>
      <h2 class="cae-h2">${focusCount} holes chosen by ${escapeHtml(focus.selected_by)}</h2>
      <p>${escapeHtml(focus.rationale)}</p>
      <div class="cae-focus-gaps">${focusGapCards(diagnosis.gap_inventory, focus)}</div>
    </div>
  </section>

  <section class="cae-section" id="sprint-fit" data-cockpit-order="3">
    <div class="cae-wrap">
      <p class="cae-kicker">Sprint Fit</p>
      <h2 class="cae-h2">What can honestly close, start, or wait</h2>
      ${sprintFitHtml(diagnosis.gap_inventory, focus)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="repair-paths" data-cockpit-order="4">
    <div class="cae-wrap">
      <p class="cae-kicker">Repair paths</p>
      <h2 class="cae-h2">Four valid ways forward</h2>
      <p>Want to implement the selected Focus Gaps yourself? You can.</p>
      <p><a class="cae-report-inline-link" href="#focus-gaps">View Focus Gap DIY steps</a></p>
      <div class="cae-report-paths">
        <article><span>Do it in-house</span><p>${escapeHtml(report.implementation_paths.diy)}</p></article>
        <article><span>Use another provider</span><p>${escapeHtml(report.implementation_paths.other_provider)}</p></article>
        <article><span>Defer</span><p>${escapeHtml(report.implementation_paths.defer)}</p></article>
        <article><span>Ask CAESTHETIC</span><p>${escapeHtml(report.implementation_paths.caesthetic)}</p></article>
      </div>
      <div class="cae-report-why">
        <p><strong>Sprint boundary:</strong> ${escapeHtml(report.why_caesthetic.sprint_boundary)}</p>
        <p><strong>Ownership:</strong> ${escapeHtml(report.why_caesthetic.ownership)}</p>
        <div class="cae-report-burden">${burdenRows}</div>
      </div>
    </div>
  </section>

  <section class="cae-section" id="do-not-fund" data-cockpit-order="5">
    <div class="cae-wrap cae-wrap--narrow">
      <article class="cae-report-do-not-do">
        <p class="cae-kicker">NOT YET</p>
        <h2 class="cae-h2">${escapeHtml(diagnosis.do_not_do.title)}</h2>
        <p>${escapeHtml(diagnosis.do_not_do.rationale)}</p>
        <p><strong>Revisit after:</strong></p>
        <ul>${diagnosis.do_not_do.revisit_after.map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="gap-inventory" data-cockpit-order="6">
    <div class="cae-wrap">
      <p class="cae-kicker">Full Gap Inventory</p>
      <h2 class="cae-h2">${inventoryCount} holes reviewed</h2>
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
      <h2 class="cae-h2">Why the selected holes are real</h2>
      <p><strong>Objective strength:</strong> ${escapeHtml(diagnosis.objective_strength.title)} <small>Evidence: ${refs(diagnosis.objective_strength.evidence_refs)}</small></p>
      <p><strong>Strongest surface:</strong> ${escapeHtml(surfaceLabels[diagnosis.strongest_surface] || diagnosis.strongest_surface)}</p>
      <h3 class="cae-report-subhead">Competitive Decision Analysis</h3>
${competitorRows(diagnosis.competitors)}
      <h3 class="cae-report-subhead">Metric drill-down</h3>
      ${evidenceAccordion(report, result)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="scores-and-methodology" data-cockpit-order="8">
    <div class="cae-wrap">
      <p class="cae-kicker">Approximate / secondary navigation</p>
      <h2 class="cae-h2">Scores and methodology</h2>
      <p class="cae-report-intro">Search 30% · Website 25% · Social 15% · Reputation 30%. Scores do not determine Sprint scope.</p>
      <div class="cae-report-score-nav" aria-label="Approximate Growth Score navigator">${surfaceNavigatorCards(report, result)}</div>
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
    <div class="cae-wrap cae-wrap--narrow">
      <p class="cae-kicker">Optional next step</p>
      <h2 class="cae-h2">Ask CAESTHETIC to take the selected Focus Gaps</h2>
      <p>Sprint scope is confirmed separately in writing. No Focus Gap or DIY step is included until that written scope exists.</p>
      <a class="cae-btn cae-btn--primary" href="/sprint/">Start the 30-Day Growth Sprint</a>
    </div>
  </section>
</main>
<a class="cae-sticky-sprint" href="#next-step" hidden>View Sprint</a>
<div id="cae-footer-slot"></div>
<script src="/assets/js/caesthetic-config.js"></script>
<script src="/assets/js/caesthetic.js" defer></script>
<script src="/assets/js/analytics.js" defer></script>
<script src="/assets/js/growth-cockpit.js" defer></script>
</body>
</html>
`;
  return localizeReportHtml(html, report.reportContext?.report_locale);
}

export function isUnguessableScoreSlug(slug) {
  return realScoreSlugPattern.test(String(slug));
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
  if (report.reportKind === "real" && !isUnguessableScoreSlug(path.basename(path.dirname(outputPath)))) {
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
