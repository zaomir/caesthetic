import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { GROWTH_SCORE_REPORT_TEMPLATE_VERSION } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { isAllowedRealScoreOutput, isUnguessableScoreSlug, renderGrowthReport, renderReportFile } from "../../scripts/caesthetic/render-growth-score.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixturePath = path.join(root, "site-caesthetic/score/demo-medical-aesthetics-search-gap/report.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const demoRoutes = [
  "demo-medical-aesthetics-search-gap",
  "demo-injector-practice-booking-friction",
  "demo-aesthetics-clinic-reputation-gap",
];
const orderedSections = [
  "gap-map",
  "focus-gaps",
  "sprint-fit",
  "repair-paths",
  "do-not-fund",
  "gap-inventory",
  "evidence-and-competitors",
  "scores-and-methodology",
  "next-step",
];
const allReportSections = ["report-overview", "report-intro", ...orderedSections];

function loadDemo(route) {
  return JSON.parse(fs.readFileSync(path.join(root, "site-caesthetic/score", route, "report.json"), "utf8"));
}

function heroHtml(html) {
  const start = html.indexOf('id="report-overview"');
  const end = html.indexOf('id="report-intro"');
  return html.slice(start, end);
}

function sectionOpeningTags(html) {
  return [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>/g)].map((match) => ({
    id: match[1],
    tag: match[0],
  }));
}

test("owner cockpit renders an unnumbered Intro followed by the exact 9-section order", () => {
  const html = renderGrowthReport(fixture);
  const sections = sectionOpeningTags(html);
  assert.deepEqual(sections.map(({ id }) => id), allReportSections);
  assert.doesNotMatch(sections[0].tag, /data-cockpit-order/);
  assert.doesNotMatch(sections[1].tag, /data-cockpit-order/);
  const introIndex = html.indexOf('id="report-intro" data-report-intro');
  assert.ok(introIndex > html.indexOf('id="report-overview"'));
  assert.ok(introIndex < html.indexOf('id="gap-map" data-cockpit-order="1"'));
  assert.doesNotMatch(html.slice(introIndex, html.indexOf("</section>", introIndex)), /data-cockpit-order/);
  assert.match(html, /YOUR GROWTH SCORE · HOW TO READ THIS REPORT/);
  assert.match(html, /01 UNDERSTAND/);
  assert.match(html, /02 PRIORITIZE/);
  assert.match(html, /03 ACT/);
  let previousIndex = -1;
  orderedSections.forEach((sectionId, index) => {
    const sectionIndex = html.indexOf(`id="${sectionId}" data-cockpit-order="${index + 1}"`);
    assert.ok(sectionIndex > previousIndex, `${sectionId} must follow the prior cockpit section`);
    previousIndex = sectionIndex;
  });
  assert.equal((html.match(/data-cockpit-order=/g) || []).length, 9);
  assert.ok(html.indexOf("id=\"gap-map\"") < html.indexOf("id=\"focus-gaps\""));
  assert.ok(html.indexOf("id=\"focus-gaps\"") < html.indexOf("id=\"scores-and-methodology\""));
  for (const retiredId of ["executive-overview", "human-approved-diagnosis", "remediation-plan", "score-navigator", "evidence-drilldown", "implementation-paths", "why-caesthetic", "methodology-and-limitations"]) {
    assert.doesNotMatch(html, new RegExp(`id="${retiredId}"`));
  }
  const selectedCount = 1 + fixture.humanDiagnosis.focus_selection.supporting_gap_ids.length;
  assert.equal(selectedCount, 3);
  assert.equal((html.match(/class="cae-focus-gap"/g) || []).length, selectedCount);
  assert.equal((html.match(/class="cae-gap-map"/g) || []).length, 1);
  assert.equal((html.match(/class="cae-report-do-not-do"/g) || []).length, 1);
  assert.match(html, /DIY instruction/);
  assert.match(html, /Done when/);
  assert.match(html, /Who can do this/);
  assert.match(html, /Close in 30 days|Start in 30 days/);
  assert.doesNotMatch(html, /class="cae-report-priority"/);
  assert.doesNotMatch(heroHtml(html), /\/100/);
});

test("numbered cockpit sections expose one visible number derived from their canonical order", () => {
  const html = renderGrowthReport(fixture);
  const css = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report.css"), "utf8");
  const sections = sectionOpeningTags(html);

  sections.slice(2).forEach(({ id, tag }, index) => {
    assert.match(tag, new RegExp(`data-cockpit-order="${index + 1}"`), `${id} must retain its canonical order attribute`);
  });

  assert.match(
    css,
    /\.cae-score-report\s+\.cae-section\[data-cockpit-order\]::before\s*\{[\s\S]*?content:\s*attr\(data-cockpit-order\)\s*"\s*·"\s*;/,
    "section numbering must be visibly derived from data-cockpit-order rather than duplicated in report data",
  );
});

test("Focus Selection remains exactly one Primary and two Supporting gaps", () => {
  const html = renderGrowthReport(fixture);
  const focus = fixture.humanDiagnosis.focus_selection;
  const selectedIds = [focus.primary_gap_id, ...focus.supporting_gap_ids];

  assert.equal(focus.supporting_gap_ids.length, 2);
  assert.equal(new Set(selectedIds).size, 3);
  assert.ok(selectedIds.every((id) => fixture.humanDiagnosis.gap_inventory.some((gap) => gap.id === id)));
  assert.equal((html.match(/class="cae-focus-gap"[^>]*data-gap-role="primary"/g) || []).length, 1);
  assert.equal((html.match(/class="cae-focus-gap"[^>]*data-gap-role="supporting"/g) || []).length, 2);
  assert.equal((html.match(/class="cae-focus-gap"/g) || []).length, 3);
  assert.doesNotMatch(html, new RegExp(fixture.humanDiagnosis.focus_selection.selected_by));
  assert.doesNotMatch(html, new RegExp(fixture.humanDiagnosis.reviewer.name));
});

test("score navigation is compact, four-surface, approximate and secondary", () => {
  const html = renderGrowthReport(fixture);
  const navStart = html.indexOf('class="cae-report-score-nav"');
  const navEnd = html.indexOf("id=\"next-step\"", navStart);
  const nav = html.slice(navStart, navEnd);
  assert.match(html, /Approximate \/ secondary navigation/);
  assert.match(nav, /SEARCH/);
  assert.match(nav, /WEBSITE/);
  assert.match(nav, /SOCIAL/);
  assert.match(nav, /REPUTATION/);
  assert.match(html, /do not determine Sprint scope/i);
});

test("Lead-to-Revenue Check renders only after an explicit evidence-backed recommendation", () => {
  const defaultHtml = renderGrowthReport(fixture);
  assert.doesNotMatch(defaultHtml, /cae-lead-revenue__check/);
  assert.doesNotMatch(defaultHtml, /href="\/lead-to-revenue-check\/"/);
  assert.equal((defaultHtml.match(/href="\/sprint\/"/g) || []).length, 1);

  const recommended = structuredClone(fixture);
  recommended.leadToRevenueCheck = {
    recommendation: "recommended",
    reason: "Public evidence cannot resolve the post-enquiry booking handoff.",
    evidence_refs: [recommended.humanDiagnosis.binding_constraint.evidence_refs[0]],
  };
  const recommendedHtml = renderGrowthReport(recommended);
  assert.match(recommendedHtml, /data-cae-check-recommended="true"/);
  assert.match(recommendedHtml, /Public evidence cannot resolve the post-enquiry booking handoff/);
  assert.equal((recommendedHtml.match(/class="cae-btn cae-btn--primary" href="\/lead-to-revenue-check\/"/g) || []).length, 1);
  assert.doesNotMatch(recommendedHtml, /href="\/sprint\/"/);
  assert.match(recommendedHtml, />View Check<\/a>/);

  const incomplete = structuredClone(recommended);
  delete incomplete.leadToRevenueCheck.evidence_refs;
  assert.throws(() => renderGrowthReport(incomplete), /leadToRevenueCheck\.evidence_refs/);
});

test("Multi-Location focus child cannot create a second Lead-to-Revenue Check decision", () => {
  const child = structuredClone(fixture);
  child.audit = {
    format: "multi_location",
    profile_version: "multi-location-growth-score/1.2.0",
    package_role: "focus_location",
    project_id: "private-network",
    access_group_id: "private-network-access",
    parent_route: "/score/private-network-0123456789abcdef/",
    child_route: "/score/private-network-0123456789abcdef/focus-location/",
    focus_location_id: "focus",
  };
  child.leadToRevenueCheck = {
    recommendation: "recommended",
    reason: "The internal handoff requires separate evidence.",
    evidence_refs: [child.humanDiagnosis.binding_constraint.evidence_refs[0]],
  };

  assert.throws(
    () => renderGrowthReport(child),
    /focus child cannot recommend Lead-to-Revenue Check/,
  );
});

test("demo HTML is exact output of the reportKind-independent renderer", () => {
  for (const route of demoRoutes) {
    const directory = path.join(root, "site-caesthetic/score", route);
    const report = JSON.parse(fs.readFileSync(path.join(directory, "report.json"), "utf8"));
    const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");
    assert.equal(html, renderGrowthReport(report));
    assert.match(html, /href="\/assets\/css\/growth-report\.css"/);
    assert.doesNotMatch(html, /href="\/assets\/css\/growth\.css"/);
  }
});

test("the same renderer accepts an approved real report and enforces private route rules", () => {
  const real = structuredClone(fixture);
  real.reportKind = "real";
  real.disclosure = "Synthetic private-route contract fixture. No client relationship or real practice is represented.";
  real.practice.name = "Synthetic Private Route Test";
  real.humanDiagnosis.competitors.comparison_matrix.subject_name = real.practice.name;
  real.humanDiagnosis.competitors.comparison_matrix.rows.find((row) => row.entity_ref === "subject").entity_name = real.practice.name;
  real.humanDiagnosis.reviewer = {
    name: "Alex Contract Reviewer",
    approved_at: "2026-08-11T17:00:00Z",
  };
  real.humanDiagnosis.walkthrough = { status: "available", url: "https://example.com/private-walkthrough" };
  const html = renderGrowthReport(real);
  assert.match(html, /data-report-kind="real"/);
  assert.match(html, /Private Growth Score/);
  assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
  assert.doesNotMatch(html, /https:\/\/example\.com\/private-walkthrough/);
  assert.doesNotMatch(html, /Alex Contract Reviewer/);
  assert.doesNotMatch(html, /Your Growth Review|3–8 min|human-reviewed walkthrough/i);
  assert.match(html, /Valerie Petra/);
  assert.match(html, /CAESTHETIC Growth Advisor/);
  assert.doesNotMatch(html, /cae-demo-banner/);
  assert.doesNotMatch(html, /SYNTHETIC DEMO/);
  assert.match(html, /Synthetic private-route contract fixture\. No client relationship or real practice is represented\./);
  assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
  assert.equal(isUnguessableScoreSlug("private-practice-9f3c7a2d1b6e4c80"), true);
  assert.equal(isUnguessableScoreSlug("private-practice"), false);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cae-growth-score-real-"));
  try {
    const reportPath = path.join(tempRoot, "report.json");
    fs.writeFileSync(reportPath, JSON.stringify(real));
    assert.throws(
      () => renderReportFile(reportPath, { outputPath: path.join(tempRoot, "guessable", "index.html") }),
      /unguessable/,
    );
    const privatePath = path.join(tempRoot, "private-practice-9f3c7a2d1b6e4c80", "index.html");
    renderReportFile(reportPath, { outputPath: privatePath });
    assert.match(fs.readFileSync(privatePath, "utf8"), /noindex,nofollow,noarchive,nosnippet/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("a protected Multi-Location focus child is allowed only below its unguessable parent route", () => {
  const report = structuredClone(fixture);
  report.reportKind = "real";
  report.audit = {
    format: "multi_location",
    package_role: "focus_location",
    project_id: "private-network",
    access_group_id: "private-network-access",
    parent_route: "/score/private-network-0123456789abcdef/",
    child_route: "/score/private-network-0123456789abcdef/focus-location/",
    focus_location_id: "focus",
  };
  const allowed = path.join(root, "site-caesthetic/score/private-network-0123456789abcdef/focus-location/index.html");
  const wrongParent = path.join(root, "site-caesthetic/score/guessable/focus-location/index.html");
  assert.equal(isAllowedRealScoreOutput(report, allowed), true);
  assert.equal(isAllowedRealScoreOutput(report, wrongParent), false);
});

test("Russian real reports render a Russian cockpit without changing English demos", (t) => {
  const route = "nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8";
  const reportPath = path.join(root, "site-caesthetic/score", route, "report.json");
  if (!fs.existsSync(reportPath)) {
    t.skip("private Nohy fixture is intentionally absent from the public satellite repository");
    return;
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const html = renderGrowthReport(report);

  assert.equal(report.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(report.schemaVersion, 5);
  assert.deepEqual(report.reportContext, {
    vertical_context: "beauty_salon",
    report_locale: "ru",
    vertical_source: "human_resolved",
    locale_source: "user_selected",
  });
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /Краткий обзор · Закрытый Growth Score/);
  assert.match(html, /Private CAESTHETIC Four-Surface Growth Score/);
  assert.match(html, /Закрытый Growth Score/);
  assert.match(html, /ВАШ GROWTH SCORE · КАК ЧИТАТЬ ОТЧЁТ/);
  assert.match(html, /Карта разрывов · Диагноз, утверждённый человеком/);
  assert.match(html, /Фокусные разрывы · Ровно 3/);
  assert.match(html, /Баллы и методология/);
  assert.match(html, /Поручить CAESTHETIC выбранные фокусные разрывы/);
  assert.doesNotMatch(html, />Private Growth Score</);
  assert.doesNotMatch(html, />Human-approved diagnosis</);
  assert.doesNotMatch(html, />Exactly Top 3 Focus Gaps</);
});

test("all five locales use one renderer and never translate source evidence", () => {
  const headings = {
    en: "Executive Overview",
    ru: "Краткий обзор",
    es: "Resumen ejecutivo",
    fr: "Synthèse",
    uk: "Короткий огляд",
  };
  const introKickers = {
    en: "YOUR GROWTH SCORE · HOW TO READ THIS REPORT",
    ru: "ВАШ GROWTH SCORE · КАК ЧИТАТЬ ОТЧЁТ",
    es: "TU GROWTH SCORE · CÓMO LEER ESTE INFORME",
    fr: "VOTRE GROWTH SCORE · COMMENT LIRE CE RAPPORT",
    uk: "ВАШ GROWTH SCORE · ЯК ЧИТАТИ ЦЕЙ ЗВІТ",
  };
  for (const [locale, heading] of Object.entries(headings)) {
    const localized = structuredClone(fixture);
    localized.reportContext.report_locale = locale;
    localized.reportContext.locale_source = "human_resolved";
    localized.surfaces[0].metrics[0].finding = "Private Growth Score — исходный evidence факт";
    const html = renderGrowthReport(localized);
    assert.match(html, new RegExp(`<html lang="${locale === "en" ? "en-US" : locale}"`));
    assert.ok(html.includes(heading));
    assert.ok(html.includes(introKickers[locale]));
    assert.ok(html.includes("Private Growth Score — исходный evidence факт"));
  }
});

test("deterministic Intro adapts vertical and Multi-Location nouns without changing report facts", () => {
  const dental = structuredClone(fixture);
  dental.reportContext.vertical_context = "dental_practice";
  const dentalHtml = renderGrowthReport(dental);
  assert.match(dentalHtml, /public journey for this dental practice/);
  assert.equal(dental.humanDiagnosis.binding_constraint.statement, fixture.humanDiagnosis.binding_constraint.statement);

  const network = structuredClone(fixture);
  network.audit = { format: "multi_location" };
  const networkHtml = renderGrowthReport(network);
  assert.match(networkHtml, /public journey for this practice network and its locations/);
  assert.equal(network.humanDiagnosis.focus_selection.primary_gap_id, fixture.humanDiagnosis.focus_selection.primary_gap_id);
});

test("real reports omit coordination counts that cannot be derived", () => {
  const real = structuredClone(fixture);
  real.reportKind = "real";
  real.disclosure = "Independent public-evidence diagnostic prepared as a CAESTHETIC test; no client relationship is implied.";
  real.practice.name = "Synthetic Private Route Test";
  real.humanDiagnosis.competitors.comparison_matrix.subject_name = real.practice.name;
  real.humanDiagnosis.competitors.comparison_matrix.rows.find((row) => row.entity_ref === "subject").entity_name = real.practice.name;
  real.humanDiagnosis.reviewer = { name: "Alex Contract Reviewer", approved_at: "2026-08-21T12:00:00Z" };
  real.humanDiagnosis.coordination_burden = {
    diagnosed_issues: real.humanDiagnosis.gap_inventory.length,
    high_priority_fixes: 3,
    systems_involved: null,
    dependencies: null,
    specialist_roles: null,
  };
  const html = renderGrowthReport(real);
  assert.match(html, />3<\/strong> high-priority fixes/);
  assert.doesNotMatch(html, /systems involved|specialist roles/);
});

test("Aesthetemed public-evidence test stays v4 historical, private and evidence-limited", (t) => {
  const route = "aesthetemed-public-evidence-7c3e91b4a8f26d50";
  const directory = path.join(root, "site-caesthetic/score", route);
  if (!fs.existsSync(path.join(directory, "report.json"))) return t.skip("private historical fixture is intentionally absent from the public satellite repository");
  const report = JSON.parse(fs.readFileSync(path.join(directory, "report.json"), "utf8"));
  const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");

  assert.equal(report.schemaVersion, 4);
  assert.equal(report.reportKind, "real");
  assert.equal(report.practice.name, "Aesthetemed Beauty & Wellness Clinic");
  assert.equal(report.humanDiagnosis.reviewer.name, "Alex Goldman");
  assert.equal(report.humanDiagnosis.top_priorities.length, 3);
  assert.equal(report.humanDiagnosis.competitors.entries.length, 3);
  assert.equal(report.humanDiagnosis.walkthrough.status, "pending");
  assert.equal(report.surfaces.find(({ id }) => id === "search").metrics.find(({ metric_id }) => metric_id === "map_visibility").normalized_score, null);
  assert.equal(report.surfaces.find(({ id }) => id === "website").metrics.find(({ metric_id }) => metric_id === "above_fold_conversion").normalized_score, null);
  assert.equal(renderReportFile(path.join(directory, "report.json"), { check: true }), true);
  assert.throws(() => renderGrowthReport(report), /schemaVersion must be 5/);
  assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(html, /no client relationship is implied/);
  assert.match(html, /Insufficient evidence/);
  assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
  assert.equal(isUnguessableScoreSlug(route), true);
});

test("real and demo score routes stay out of the sitemap", (t) => {
  const sitemap = fs.readFileSync(path.join(root, "site-caesthetic/sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/score\//);
  const retiredPath = path.join(root, "site-caesthetic/score/aurora-medspa-x7k9m2/index.html");
  if (!fs.existsSync(retiredPath)) return t.skip("private retired fixture is intentionally absent from the public satellite repository");
  const retired = fs.readFileSync(retiredPath, "utf8");
  assert.match(retired, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(retired, /Retired sample/);
});

test("approved report HTML has no deterministic render drift", () => {
  execFileSync(process.execPath, ["scripts/caesthetic/render-growth-score.mjs", "--check"], { cwd: root, stdio: "pipe" });
});

test("demand leak is driven by fixture demand_stage and is not hardcoded to Booking", () => {
  const cases = [
    ["demo-medical-aesthetics-search-gap", "discovery", "Discovery"],
    ["demo-injector-practice-booking-friction", "booking", "Booking"],
    ["demo-aesthetics-clinic-reputation-gap", "trust", "Trust"],
  ];
  for (const [route, stage, label] of cases) {
    const report = loadDemo(route);
    assert.equal(report.humanDiagnosis.binding_constraint.demand_stage, stage);
    const html = renderGrowthReport(report);
    const leakMatch = html.match(/cae-report-demand__stage is-leak[\s\S]*?<span>([^<]+)<\/span>/);
    assert.equal(leakMatch?.[1], label, `${route} must mark ${label} as the demand leak`);
    assert.equal((html.match(/cae-report-demand__stage is-leak/g) || []).length, 1);
  }
});

test("demo banner, CAESTHETIC byline, single Sprint CTA, DIY link and Class A/B labels render", () => {
  const html = renderGrowthReport(fixture);
  assert.match(html, /SYNTHETIC DEMO — Demonstration only\. Fictional practice, synthetic data, no client relationship/);
  assert.match(html, /Valerie Petra/);
  assert.match(html, /CAESTHETIC Growth Advisor/);
  assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
  assert.match(html, /class="cae-sticky-sprint" href="#next-step"/);
  assert.match(html, /href="#gap-/);
  assert.match(html, /CLASS A · VERIFIED|Class A/);
  assert.match(html, /CLASS B|Class B/);
});

test("Insufficient evidence path still renders for the booking-constrained demo", () => {
  const report = loadDemo("demo-injector-practice-booking-friction");
  const html = renderGrowthReport(report);
  assert.match(html, /Insufficient evidence/);
});
