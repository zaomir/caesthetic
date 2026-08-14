#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { displayScore, scoreGrowthReport } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

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
const PRIORITY_RANKS = Object.freeze(["01 FIX FIRST", "02 NEXT", "03 THEN"]);
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
  if (report.schemaVersion !== 3) throw new TypeError("schemaVersion must be 3");
  if (!diagnosis?.reviewer?.name || !diagnosis.reviewer.approved_at) {
    throw new TypeError("humanDiagnosis.reviewer requires a named human and approval timestamp");
  }
  requireNonEmptyString(diagnosis.reviewer_status, "humanDiagnosis.reviewer_status");
  if (diagnosis.top_priorities?.length !== 3) {
    throw new TypeError("humanDiagnosis.top_priorities must contain exactly 3 items");
  }
  if (!Array.isArray(diagnosis.remediation_tasks) || diagnosis.remediation_tasks.length === 0) {
    throw new TypeError("humanDiagnosis.remediation_tasks must be a non-empty array");
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

  diagnosis.top_priorities.forEach((priority, index) => {
    for (const field of ["why_now", "expected_effect", "complexity", "impact"]) {
      requireNonEmptyString(priority[field], `humanDiagnosis.top_priorities[${index}].${field}`);
    }
    requireArray(priority.task_refs, `humanDiagnosis.top_priorities[${index}].task_refs`);
  });

  requireNonEmptyString(diagnosis.do_not_do?.title, "humanDiagnosis.do_not_do.title");
  requireArray(diagnosis.do_not_do?.evidence_refs, "humanDiagnosis.do_not_do.evidence_refs");
  requireNonEmptyString(diagnosis.do_not_do?.rationale, "humanDiagnosis.do_not_do.rationale");
  requireArray(diagnosis.do_not_do?.revisit_after, "humanDiagnosis.do_not_do.revisit_after");

  requireArray(diagnosis.roadmap_preview?.weeks, "humanDiagnosis.roadmap_preview.weeks");
  diagnosis.roadmap_preview.weeks.forEach((week, index) => {
    requireNonEmptyString(week.label, `humanDiagnosis.roadmap_preview.weeks[${index}].label`);
    requireNonEmptyString(week.title, `humanDiagnosis.roadmap_preview.weeks[${index}].title`);
  });
  requireNonEmptyString(diagnosis.roadmap_preview?.disclaimer, "humanDiagnosis.roadmap_preview.disclaimer");

  const burden = diagnosis.coordination_burden;
  for (const field of ["diagnosed_issues", "high_priority_fixes", "systems_involved", "dependencies", "specialist_roles"]) {
    if (burden?.[field] === undefined || burden[field] === null || burden[field] === "") {
      throw new TypeError(`humanDiagnosis.coordination_burden.${field} is required`);
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

  if (!Array.isArray(diagnosis.problem_inventory) || diagnosis.problem_inventory.length === 0) {
    throw new TypeError("humanDiagnosis.problem_inventory must be a non-empty array");
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

function problemPriority(problem) {
  if (problem.priority) return String(problem.priority).toLowerCase();
  const impact = String(problem.impact ?? "");
  if (/^High/i.test(impact) || /\bHigh\b/.test(impact)) return "high";
  return "medium";
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
  if (!sufficient) return '<p class="cae-report-note">Insufficient evidence</p>';
  return metrics.map((metric) => {
    const result = metricResults.find((candidate) => candidate.metric_id === metric.metric_id);
    const scoreValue = result?.normalized_score ?? metric.normalized_score;
    const raw = metric.raw_value === null || metric.raw_value === undefined ? "Not collected" : String(metric.raw_value);
    return `
              <li class="cae-report-metric">
                <div>
                  <p class="cae-kicker">${metricClassLabel(metric)}</p>
                  <strong>${escapeHtml(metric.label || sentenceCase(metric.metric_id))}</strong>
                  <p>${escapeHtml(metric.finding || "No published finding for this metric.")}</p>
                </div>
                <span>${displayScore(scoreValue)}</span>
                <small>Source: ${escapeHtml(metric.source || "No source: unavailable")} · Collected: ${escapeHtml(metric.collected_at || "No collection date")} · Raw: ${escapeHtml(raw)}</small>
              </li>`;
  }).join("");
}

function competitorRows(competitors) {
  if (competitors.status === "not_applicable") {
    return `<p><strong>Named comparison set:</strong> Not applicable. ${escapeHtml(competitors.reason)}</p>`;
  }
  return `
        <div class="cae-report-competitors">
${competitors.entries.map((competitor) => `          <article>
              <p class="cae-kicker">Named competitor</p>
              <h3>${escapeHtml(competitor.name)}</h3>
              <p>${escapeHtml(competitor.finding || "Included in the decisive comparison evidence for this diagnosis.")}</p>
              <small>Evidence: ${refs(competitor.evidence_refs)}</small>
            </article>`).join("\n")}
        </div>
        <p class="cae-report-note"><strong>Selection method:</strong> ${escapeHtml(competitors.selection_method)}</p>`;
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

function priorityCards(priorities) {
  return priorities.map((priority, index) => {
    const firstTaskRef = priority.task_refs[0];
    return `
          <article class="cae-report-priority">
            <p class="cae-report-priority__rank">${PRIORITY_RANKS[index]}</p>
            <h3>${escapeHtml(priority.title)}</h3>
            <p><strong>Why now:</strong> ${escapeHtml(priority.why_now)}</p>
            <p><strong>Expected effect:</strong> ${escapeHtml(priority.expected_effect)}</p>
            <p><strong>Complexity:</strong> ${escapeHtml(priority.complexity)}</p>
            <p><strong>Impact:</strong> ${escapeHtml(priority.impact)}</p>
            <a class="cae-report-inline-link" href="#${escapeHtml(firstTaskRef)}">See implementation</a>
          </article>`;
  }).join("");
}

function remediationRows(tasks) {
  return tasks.map((task) => `
        <article class="cae-report-task" id="${escapeHtml(task.id)}">
          <p class="cae-kicker">TASK ${escapeHtml(task.id)}</p>
          <h3>${escapeHtml(task.outcome)}</h3>
          <p><strong>WHY</strong> ${escapeHtml(task.sequence.rationale)}</p>
          <div>
            <p><strong>STEPS</strong></p>
            <ol>${stringList(task.steps)}</ol>
          </div>
          <p><strong>NEEDS</strong></p>
          <ul>${stringList(task.prerequisites_access)}</ul>
          <p><strong>DEPENDENCIES</strong> ${task.dependencies.length ? refs(task.dependencies) : "None"}</p>
          <p><strong>WHO CAN DO THIS</strong> ${escapeHtml(task.owner_role)}</p>
          <p><strong>COMPLEXITY</strong> ${escapeHtml(task.effort_complexity)}</p>
          <p><strong>RISK</strong> ${escapeHtml(task.implementation_risk)}</p>
          <p><strong>DONE WHEN</strong></p>
          <ul>${stringList(task.acceptance_evidence)}</ul>
          <p><strong>NEXT ACTION</strong> ${escapeHtml(task.next_action)}</p>
        </article>`).join("");
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

function inventoryRows(inventory) {
  return inventory.map((problem) => {
    const priority = problemPriority(problem);
    const complexity = problem.complexity ? `<p><strong>Complexity:</strong> ${escapeHtml(problem.complexity)}</p>` : "";
    return `
          <article class="cae-report-problem" id="problem-${escapeHtml(problem.id)}" data-surface="${escapeHtml(problem.surface)}" data-priority="${escapeHtml(priority)}">
            <p class="cae-kicker">${escapeHtml(problem.id)} · ${escapeHtml(surfaceLabels[problem.surface])} · ${escapeHtml(problem.status)}</p>
            <h3>${escapeHtml(problem.title)}</h3>
            <p><strong>Impact:</strong> ${escapeHtml(problem.impact)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(priority)}</p>
            ${complexity}
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
    : "";
  const strengths = diagnosis.current_state.strengths.slice(0, 2);
  const burden = diagnosis.coordination_burden;
  const inventoryCount = diagnosis.problem_inventory.length;

  return `<!doctype html>
<html lang="en-US" data-page="growth-score-report" data-report-kind="${escapeHtml(report.reportKind)}">
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
  <section class="cae-report-hero" id="report-overview" data-cockpit-order="1">
    <div class="cae-wrap">
      <header class="cae-report-header">
        <p class="cae-kicker">${escapeHtml(kicker)}</p>
        <h1>${escapeHtml(report.practice.name)}</h1>
        <p class="cae-report-meta">${escapeHtml(report.practice.location)} · Prepared ${escapeHtml(report.practice.preparedAt)}</p>
        <p class="cae-report-meta">Prepared by ${escapeHtml(VALERIE.name)} · ${escapeHtml(VALERIE.role)}</p>
        <p class="cae-report-meta">${escapeHtml(reviewerStatusLabel(diagnosis.reviewer_status))} · ${escapeHtml(diagnosis.reviewer.name)} · ${escapeHtml(diagnosis.reviewer.approved_at)}</p>
      </header>
      <div class="cae-report-hero__grid">
        <article class="cae-report-score-card">
          <p class="cae-kicker">Growth Score</p>
          <strong>${displayScore(result.overall.rawScore)}</strong>
          <p>Score is a guide, not the goal.</p>
          <p class="cae-report-note">Approximate diagnostic navigator. Priorities are based on verified problems, dependencies and human review.</p>
        </article>
        ${walkthroughHeroCard(diagnosis.walkthrough, isDemo)}
        <article class="cae-report-state">
          <ul>${strengths.map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul>
          <p><strong>⚠ Main constraint:</strong> ${escapeHtml(diagnosis.current_state.constraint_label)}</p>
          <p>${escapeHtml(diagnosis.current_state.constraint_detail)}</p>
          <p><strong>Priority:</strong> ${escapeHtml(diagnosis.current_state.priority_line)}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="cae-section" id="human-diagnosis" data-cockpit-order="2">
    <div class="cae-wrap">
      <p class="cae-kicker">Human-approved diagnosis</p>
      <h2 class="cae-h2">Binding constraint and demand leak</h2>
      <div class="cae-report-diagnosis">
        <div class="cae-report-diagnosis__statement">${escapeHtml(diagnosis.binding_constraint.statement)}</div>
        ${demandSystemHtml(diagnosis.binding_constraint.demand_stage)}
      </div>
      <div class="cae-report-diagnosis__facts">
        <p><strong>Objective strength:</strong> ${escapeHtml(diagnosis.objective_strength.title)} <small>Evidence: ${refs(diagnosis.objective_strength.evidence_refs)}</small></p>
        <p><strong>Strongest surface:</strong> ${escapeHtml(surfaceLabels[diagnosis.strongest_surface] || diagnosis.strongest_surface)}</p>
      </div>
      <h3 class="cae-report-subhead">Decisive named-competitor evidence</h3>
${competitorRows(diagnosis.competitors)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="top-priorities" data-cockpit-order="3">
    <div class="cae-wrap cae-wrap--narrow">
      <p class="cae-kicker">Exactly three priorities</p>
      <h2 class="cae-h2">Fix these in this order</h2>
      <div class="cae-report-priorities">${priorityCards(diagnosis.top_priorities)}</div>
    </div>
  </section>

  <section class="cae-section" id="remediation-plan" data-cockpit-order="4">
    <div class="cae-wrap">
      <p class="cae-kicker">Complete remediation plan</p>
      <h2 class="cae-h2">A plan you can implement with us, in-house or with another provider</h2>
      <div class="cae-report-tasks">${remediationRows(diagnosis.remediation_tasks)}</div>
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="score-navigator" data-cockpit-order="5">
    <div class="cae-wrap">
      <p class="cae-kicker">Approximate / secondary navigation</p>
      <h2 class="cae-h2">Four surfaces and overall</h2>
      <p class="cae-report-intro">Search 30% · Website 25% · Social 15% · Reputation 30%. Scores do not determine Sprint scope.</p>
      <div class="cae-report-score-nav" aria-label="Approximate Growth Score navigator">${surfaceNavigatorCards(report, result)}</div>
    </div>
  </section>

  <section class="cae-section" id="evidence-drilldown" data-cockpit-order="6">
    <div class="cae-wrap">
      <p class="cae-kicker">Verified evidence drill-down</p>
      <h2 class="cae-h2">Why each score is available—or withheld</h2>
      ${evidenceAccordion(report, result)}
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="problem-inventory" data-cockpit-order="7">
    <div class="cae-wrap">
      <p class="cae-kicker">Full Problem Inventory</p>
      <h2 class="cae-h2">${inventoryCount} problems identified</h2>
      <div class="cae-report-filters" role="toolbar" aria-label="Filter problems">
        <button type="button" data-filter="all">All</button>
        <button type="button" data-filter="high">High priority</button>
        <button type="button" data-filter="search">Search</button>
        <button type="button" data-filter="website">Website</button>
        <button type="button" data-filter="social">Social</button>
        <button type="button" data-filter="reputation">Reputation</button>
      </div>
      <div class="cae-report-problems">${inventoryRows(diagnosis.problem_inventory)}</div>
    </div>
  </section>

  <section class="cae-section" id="do-not-fund" data-cockpit-order="8">
    <div class="cae-wrap cae-wrap--narrow">
      <article class="cae-report-do-not-do">
        <p class="cae-kicker">DO NOT FUND YET</p>
        <h2 class="cae-h2">${escapeHtml(diagnosis.do_not_do.title)}</h2>
        <p>${escapeHtml(diagnosis.do_not_do.rationale)}</p>
        <p><strong>Revisit after:</strong></p>
        <ul>${diagnosis.do_not_do.revisit_after.map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="implementation-paths" data-cockpit-order="9">
    <div class="cae-wrap">
      <p class="cae-kicker">Immediate next actions</p>
      <h2 class="cae-h2">Four valid ways forward</h2>
      <p>Want to implement this yourself? You can.</p>
      <p><a class="cae-report-inline-link" href="#remediation-plan">Download / View implementation tasks</a></p>
      <div class="cae-report-paths">
        <article><span>Do it in-house</span><p>${escapeHtml(report.implementation_paths.diy)}</p></article>
        <article><span>Use another provider</span><p>${escapeHtml(report.implementation_paths.other_provider)}</p></article>
        <article><span>Defer</span><p>${escapeHtml(report.implementation_paths.defer)}</p></article>
        <article><span>Ask CAESTHETIC</span><p>${escapeHtml(report.implementation_paths.caesthetic)}</p></article>
      </div>
    </div>
  </section>

  <section class="cae-section" id="why-caesthetic" data-cockpit-order="10">
    <div class="cae-wrap cae-wrap--narrow cae-report-why">
      <p class="cae-kicker">Why CAESTHETIC / Why the 30-Day Sprint</p>
      <h2 class="cae-h2">YOU CAN IMPLEMENT THIS YOURSELF. The hard part is coordinating it.</h2>
      <div class="cae-report-burden">
        <p><strong>${escapeHtml(burden.diagnosed_issues)}</strong> diagnosed issues</p>
        <p><strong>${escapeHtml(burden.high_priority_fixes)}</strong> high-priority fixes</p>
        <p><strong>${escapeHtml(burden.systems_involved)}</strong> systems involved</p>
        <p><strong>${escapeHtml(burden.dependencies)}</strong> dependencies</p>
        <p><strong>${escapeHtml(burden.specialist_roles)}</strong> specialist roles</p>
      </div>
      <h3 class="cae-report-subhead">CAESTHETIC already knows:</h3>
      <ul>
        <li>✓ ${escapeHtml(report.why_caesthetic.evidence_advantage)}</li>
        <li>✓ ${escapeHtml(report.why_caesthetic.coordination_advantage)}</li>
        <li>✓ ${escapeHtml(report.why_caesthetic.sprint_boundary)}</li>
        <li>✓ ${escapeHtml(report.why_caesthetic.ownership)}</li>
      </ul>
      <p><strong>Sprint boundary:</strong> ${escapeHtml(report.why_caesthetic.sprint_boundary)}</p>
      <p><strong>Ownership:</strong> ${escapeHtml(report.why_caesthetic.ownership)}</p>
    </div>
  </section>

  <section class="cae-section cae-section--soft" id="roadmap-preview" data-cockpit-order="11">
    <div class="cae-wrap cae-wrap--narrow">
      <p class="cae-kicker">Illustrative roadmap</p>
      <h2 class="cae-h2">30-day sequencing preview</h2>
      <div class="cae-report-roadmap">
${diagnosis.roadmap_preview.weeks.map((week) => `        <article>
          <p class="cae-kicker">${escapeHtml(week.label)}</p>
          <h3>${escapeHtml(week.title)}</h3>
        </article>`).join("\n")}
      </div>
      <p class="cae-report-note">${escapeHtml(diagnosis.roadmap_preview.disclaimer)}</p>
    </div>
  </section>

  <section class="cae-section cae-report-final" id="next-step" data-cockpit-order="12">
    <div class="cae-wrap cae-wrap--narrow">
      <p class="cae-kicker">Optional next step</p>
      <h2 class="cae-h2">If you want one team to coordinate the selected work</h2>
      <p>Sprint scope is confirmed separately around the highest-value executable priorities.</p>
      <a class="cae-btn cae-btn--primary" href="/sprint/">Start the 30-Day Growth Sprint</a>
    </div>
  </section>

  <section class="cae-section cae-report-method" id="methodology" data-cockpit-order="13">
    <div class="cae-wrap">
      <p class="cae-kicker">Methodology, evidence classes and limitations</p>
      <h2 class="cae-h2">Observable evidence first. Human judgment explicit.</h2>
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
      renderReportFile(reportPath, { outputPath });
      console.log(`Rendered ${path.relative(repoRoot, outputPath)}`);
    }
  }
  if (!reportPaths.length) throw new Error(`No report.json files found under ${scoreRoot}`);
  if (drift) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) runCli();
