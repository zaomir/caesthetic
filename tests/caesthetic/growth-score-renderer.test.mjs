import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isUnguessableScoreSlug, renderGrowthReport, renderReportFile } from "../../scripts/caesthetic/render-growth-score.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixturePath = path.join(root, "site-caesthetic/score/demo-medical-aesthetics-search-gap/report.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const demoRoutes = [
  "demo-medical-aesthetics-search-gap",
  "demo-injector-practice-booking-friction",
  "demo-aesthetics-clinic-reputation-gap",
];
const orderedSections = [
  "report-overview",
  "human-diagnosis",
  "top-priorities",
  "remediation-plan",
  "score-navigator",
  "evidence-drilldown",
  "problem-inventory",
  "do-not-fund",
  "implementation-paths",
  "why-caesthetic",
  "roadmap-preview",
  "next-step",
  "methodology",
];

function loadDemo(route) {
  return JSON.parse(fs.readFileSync(path.join(root, "site-caesthetic/score", route, "report.json"), "utf8"));
}

test("owner cockpit renders the canonical decision order with remediation before scores", () => {
  const html = renderGrowthReport(fixture);
  let previousIndex = -1;
  orderedSections.forEach((sectionId, index) => {
    const sectionIndex = html.indexOf(`id="${sectionId}" data-cockpit-order="${index + 1}"`);
    assert.ok(sectionIndex > previousIndex, `${sectionId} must follow the prior cockpit section`);
    previousIndex = sectionIndex;
  });
  assert.ok(html.indexOf("id=\"remediation-plan\"") < html.indexOf("id=\"score-navigator\""));
  assert.ok(html.indexOf("Complete remediation plan") < html.indexOf("Approximate / secondary navigation"));
  assert.ok(html.indexOf("Decisive named-competitor evidence") < html.indexOf("Exactly three priorities"));
  assert.equal((html.match(/class="cae-report-task"/g) || []).length, fixture.humanDiagnosis.remediation_tasks.length);
  assert.equal((html.match(/class="cae-report-priority"/g) || []).length, 3);
  assert.equal((html.match(/class="cae-report-do-not-do"/g) || []).length, 1);
  assert.match(html, /Implementation steps|STEPS/);
  assert.match(html, /Prerequisites \/ access|NEEDS/);
  assert.match(html, /Owner role|WHO CAN DO THIS/);
  assert.match(html, /Implementation risk|RISK/);
  assert.match(html, /Acceptance evidence|DONE WHEN/);
  assert.match(html, /NEXT ACTION|next action/i);
  assert.match(html, /client|owner/i);
});

test("score navigation is compact, four-surface, approximate and secondary", () => {
  const html = renderGrowthReport(fixture);
  const navStart = html.indexOf('class="cae-report-score-nav"');
  const navEnd = html.indexOf("id=\"evidence-drilldown\"", navStart);
  const nav = html.slice(navStart, navEnd);
  assert.match(html, /Approximate \/ secondary navigation/);
  assert.match(nav, /SEARCH/);
  assert.match(nav, /WEBSITE/);
  assert.match(nav, /SOCIAL/);
  assert.match(nav, /REPUTATION/);
  assert.match(nav, /Secondary navigator only/);
  assert.match(html, /Score is a guide, not the goal/);
  assert.match(html, /do not determine Sprint scope/i);
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
  real.disclosure = "Independent public-evidence diagnostic prepared as a CAESTHETIC test; no client relationship is implied.";
  real.practice.name = "Synthetic Private Route Test";
  real.humanDiagnosis.competitors.comparison_matrix.subject_name = real.practice.name;
  real.humanDiagnosis.competitors.comparison_matrix.rows.find((row) => row.entity_ref === "subject").entity_name = real.practice.name;
  real.disclosure = "Synthetic private-route contract fixture. No client relationship or real practice is represented.";
  real.humanDiagnosis.reviewer = {
    name: "Alex Contract Reviewer",
    approved_at: "2026-08-11T17:00:00Z",
  };
  real.humanDiagnosis.walkthrough = { status: "available", url: "https://example.com/private-walkthrough" };
  const html = renderGrowthReport(real);
  assert.match(html, /data-report-kind="real"/);
  assert.match(html, /Private Growth Score/);
  assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(html, /https:\/\/example\.com\/private-walkthrough/);
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

test("real reports omit coordination counts that cannot be derived", () => {
  const real = structuredClone(fixture);
  real.reportKind = "real";
  real.disclosure = "Independent public-evidence diagnostic prepared as a CAESTHETIC test; no client relationship is implied.";
  real.practice.name = "Synthetic Private Route Test";
  real.humanDiagnosis.competitors.comparison_matrix.subject_name = real.practice.name;
  real.humanDiagnosis.competitors.comparison_matrix.rows.find((row) => row.entity_ref === "subject").entity_name = real.practice.name;
  real.humanDiagnosis.reviewer = { name: "Alex Contract Reviewer", approved_at: "2026-08-21T12:00:00Z" };
  real.humanDiagnosis.coordination_burden = {
    diagnosed_issues: real.humanDiagnosis.problem_inventory.length,
    high_priority_fixes: 3,
    systems_involved: null,
    dependencies: null,
    specialist_roles: null,
  };
  const html = renderGrowthReport(real);
  assert.match(html, />3<\/strong> high-priority fixes/);
  assert.doesNotMatch(html, /systems involved|specialist roles/);
});

test("Aesthetemed public-evidence test stays private, evidence-limited and reproducible", () => {
  const route = "aesthetemed-public-evidence-7c3e91b4a8f26d50";
  const directory = path.join(root, "site-caesthetic/score", route);
  const report = JSON.parse(fs.readFileSync(path.join(directory, "report.json"), "utf8"));
  const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");

  assert.equal(report.reportKind, "real");
  assert.equal(report.practice.name, "Aesthetemed Beauty & Wellness Clinic");
  assert.equal(report.humanDiagnosis.reviewer.name, "Alex Goldman");
  assert.equal(report.humanDiagnosis.top_priorities.length, 3);
  assert.equal(report.humanDiagnosis.competitors.entries.length, 3);
  assert.equal(report.humanDiagnosis.walkthrough.status, "pending");
  assert.equal(report.surfaces.find(({ id }) => id === "search").metrics.find(({ metric_id }) => metric_id === "map_visibility").normalized_score, null);
  assert.equal(report.surfaces.find(({ id }) => id === "website").metrics.find(({ metric_id }) => metric_id === "above_fold_conversion").normalized_score, null);
  assert.equal(html, renderGrowthReport(report));
  assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(html, /no client relationship is implied/);
  assert.match(html, /Insufficient evidence/);
  assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
  assert.equal(isUnguessableScoreSlug(route), true);
});

test("real and demo score routes stay out of the sitemap", () => {
  const sitemap = fs.readFileSync(path.join(root, "site-caesthetic/sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/score\//);
  const retired = fs.readFileSync(path.join(root, "site-caesthetic/score/aurora-medspa-x7k9m2/index.html"), "utf8");
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

test("demo banner, Valerie Petra, single Sprint CTA, DIY link and Class A/B labels render", () => {
  const html = renderGrowthReport(fixture);
  assert.match(html, /SYNTHETIC DEMO — Demonstration only\. Fictional practice, synthetic data, no client relationship/);
  assert.match(html, /Valerie Petra/);
  assert.match(html, /CAESTHETIC Growth Advisor/);
  assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
  assert.match(html, /class="cae-sticky-sprint" href="#next-step"/);
  assert.match(html, /href="#remediation-plan"/);
  assert.match(html, /CLASS A · VERIFIED|Class A/);
  assert.match(html, /CLASS B|Class B/);
});

test("Insufficient evidence path still renders for the booking-constrained demo", () => {
  const report = loadDemo("demo-injector-practice-booking-friction");
  const html = renderGrowthReport(report);
  assert.match(html, /Insufficient evidence/);
});
