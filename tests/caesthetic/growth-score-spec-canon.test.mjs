import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_METRICS,
  DECISION_VIEWS_ARTIFACT_VERSION,
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  JOURNEY_GRAPH_ARTIFACT_VERSION,
  scoreGrowthReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import {
  LEGACY_GROWTH_SCORE_V4_TEMPLATE_VERSION,
  createGrowthScoreReportTemplate,
  createLeadToRevenueCheckDecisionTemplate,
  createLegacyGrowthScoreV4ReportTemplate,
  createMultiLocationGrowthScoreReportTemplate,
} from "../../scripts/caesthetic/growth-score-report-template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("detailed spec follows the unnumbered Intro and current 9-section schema-v5 cockpit", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const sections = [
    "Gap Map",
    "Focus Gaps",
    "Sprint Fit",
    "Repair Paths",
    "Do Not Fund Yet",
    "Full Gap Inventory",
    "Evidence and competitors",
    "Scores and methodology",
    "Next step",
  ];

  const introIndex = spec.indexOf("unnumbered Intro");
  let cursor = -1;
  for (const section of sections) {
    const next = spec.indexOf(`**${section}**`, cursor + 1);
    assert.ok(next > cursor, `${section} must appear in canonical cockpit order`);
    cursor = next;
  }
  assert.ok(introIndex >= 0 && introIndex < spec.indexOf("**Gap Map**"));

  assert.doesNotMatch(spec, /cockpit_sections:\s*13|current(?:ly)?[^\n]{0,80}13-section|12 \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u0445|\u0411\u043b\u043e\u043a 10|Block 10|\u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0431\u043b\u043e\u043a\u043e\u0432 \u043d\u0435 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u0432\u043b\u044f\u0442\u044c/i);
  assert.doesNotMatch(spec, /The first two items above are what the 30-Day Sprint covers/i);
  assert.match(spec, /exactly one Primary and exactly two Supporting/i);
  assert.match(spec, /at least two.*`close_in_30_days`/i);
  assert.match(spec, /no more than one.*`start_in_30_days`/i);
});
test("Free Score route, separate walkthrough and Mystery Shopper boundaries remain explicit", () => {
  const master = read("docs/ssot/CAESTHETIC.md");
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const walkthrough = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md");

  assert.match(master, /password-protected, private\/noindex `\/score\/<unguessable-slug>\/` owner cockpit/is);
  assert.match(master, /every `\/score\/` route remains `noindex` and outside the sitemap/i);
  assert.match(spec, /server-side password\/access enforcement/i);
  assert.match(spec, /separately delivered Valerie Petra walkthrough/);
  assert.match(spec, /reviewer\/selector identity and the separate Valerie Petra walkthrough remain outside client-report HTML/);
  assert.match(spec, /metric\/evidence capability/);
  assert.match(spec, /not part of the standard Free Score research or spoken walkthrough/i);
  assert.match(walkthrough, /3\u20138 minutes/);
  assert.match(walkthrough, /must not:[\s\S]*Mystery Shopper as part of the Free Score/i);
});

test("canonical authoring template derives exact metrics and fails closed", () => {
  const report = createGrowthScoreReportTemplate();

  assert.equal(report.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(report.schemaVersion, 5);
  assert.equal(report.reportState, "draft");
  assert.deepEqual(report.reportContext, {
    vertical_context: "unresolved",
    report_locale: "en",
    vertical_source: null,
    locale_source: null,
  });
  assert.equal(report.humanDiagnosis.reviewer_status, "pending");
  assert.equal(report.humanDiagnosis.reviewer.name, null);
  assert.equal(report.humanDiagnosis.reviewer.approved_at, null);
  assert.equal(report.humanDiagnosis.gap_inventory.length, 3);
  assert.equal(report.humanDiagnosis.focus_selection.primary_gap_id, null);
  assert.equal(report.humanDiagnosis.focus_selection.selected_by, null);
  assert.equal("top_priorities" in report.humanDiagnosis, false);
  assert.equal("problem_inventory" in report.humanDiagnosis, false);
  assert.equal("remediation_tasks" in report.humanDiagnosis, false);
  assert.equal(report.humanDiagnosis.competitors.entries.length, 3);
  assert.equal(report.humanDiagnosis.walkthrough.status, "pending");
  assert.equal(report.journeyGraph.artifact_version, JOURNEY_GRAPH_ARTIFACT_VERSION);
  assert.equal(report.journeyGraph.assessment_status, "not_assessed");
  assert.equal(report.journeyGraph.automatic_score_change, false);
  assert.equal(report.journeyGraph.review.status, "pending");
  assert.equal(report.decisionViews.artifact_version, DECISION_VIEWS_ARTIFACT_VERSION);
  assert.equal(report.decisionViews.assessment_status, "not_assessed");
  assert.equal(report.decisionViews.source_policy, "existing_growth_score_evidence_only");
  assert.equal(report.decisionViews.automatic_score_change, false);
  assert.equal(report.decisionViews.automatic_binding_constraint_selection, false);
  assert.equal(report.decisionViews.automatic_focus_selection, false);
  assert.equal(report.decisionViews.automatic_promotion_decision, false);
  assert.equal(report.decisionViews.review.status, "pending");
  assert.equal(report.leadToRevenueCheck.recommendation, "not_recommended");
  assert.match(report.leadToRevenueCheck.reason, /No case-specific Lead-to-Revenue Check recommendation/);
  assert.deepEqual(report.leadToRevenueCheck.evidence_refs, []);
  assert.deepEqual(report.leadToRevenueCheck, createLeadToRevenueCheckDecisionTemplate());
  assert.equal(report.presentation.check500_copy_contract, "check500-section/en-US/1.0.0");
  assert.equal(report.presentation.check500_placement_contract, "check500-two-placement/1.0.0");
  assert.equal(report.presentation.check500_style_contract, "check500-style/1.0.0");
  assert.equal(report.presentation.check500_style_reference, "docs/ssot/assets/caesthetic/check500-section-style-v1.png");
  assert.equal(report.presentation.check500_style_reference_sha256, "1d8d9d0732176f0f459e8ddd76fbd50ed2425baea3e7bda3c83559836a22a375");
  assert.deepEqual(report.presentation.check500_placements, ["mid_report", "final_alternative"]);
  assert.equal(report.presentation.check500_placement_owner, "this_report");

  for (const surface of report.surfaces) {
    assert.deepEqual(
      surface.metrics.map((metric) => metric.metric_id),
      Object.keys(CANONICAL_METRICS[surface.id]),
    );
    for (const metric of surface.metrics) {
      assert.equal(metric.raw_value, null);
      assert.equal(metric.normalized_score, null);
      assert.equal(metric.reviewer_status, "pending");
    }
  }
  assert.deepEqual(
    report.crossSurface.metrics.map((metric) => metric.metric_id),
    Object.keys(CANONICAL_METRICS.cross),
  );

  assert.throws(() => scoreGrowthReport(report));
  assert.doesNotMatch(JSON.stringify(report), /Aesthetemed|Alex Goldman|aesthetemed\.com/i);
});

test("Multi-Location templates keep Check500 on the network parent only", () => {
  const parent = createMultiLocationGrowthScoreReportTemplate({ packageRole: "network_parent" });
  const child = createMultiLocationGrowthScoreReportTemplate({ packageRole: "focus_location" });
  assert.deepEqual(parent.presentation.check500_placements, ["mid_report", "final_alternative"]);
  assert.equal(parent.presentation.check500_placement_owner, "this_report");
  assert.equal(parent.presentation.check500_style_contract, "check500-style/1.0.0");
  assert.deepEqual(child.presentation.check500_placements, []);
  assert.equal(child.presentation.check500_placement_owner, "network_parent");
  assert.equal(child.presentation.check500_style_contract, "check500-style/1.0.0");
});

test("legacy v4 scaffold is explicit and cannot masquerade as the current template", () => {
  const report = createLegacyGrowthScoreV4ReportTemplate();
  assert.equal(report.schemaVersion, 4);
  assert.equal(report.templateVersion, LEGACY_GROWTH_SCORE_V4_TEMPLATE_VERSION);
  assert.notEqual(report.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(report.humanDiagnosis.top_priorities.length, 3);
  assert.throws(() => scoreGrowthReport(report), /schemaVersion must be 5/);
});

test("current real report builders derive the shared v5 template version", (t) => {
  const nohyBuilder = read("scripts/caesthetic/build-nohy-v-ruky-growth-score.mjs");
  const nohyReportPath = "site-caesthetic/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/report.json";
  if (!fs.existsSync(path.join(root, nohyReportPath))) {
    t.skip("private Nohy fixture is intentionally absent from the public satellite repository");
    return;
  }
  const nohyReport = JSON.parse(read(nohyReportPath));
  const aesthetemedReport = JSON.parse(read("site-caesthetic/score/aesthetemed-public-evidence-7c3e91b4a8f26d50/report.json"));

  assert.match(nohyBuilder, /createGrowthScoreReportTemplate\(\)/);
  assert.doesNotMatch(nohyBuilder, /templateVersion\s*:/);
  assert.equal(nohyReport.schemaVersion, 5);
  assert.equal(nohyReport.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(nohyReport.audit.access_group_id, "nvr-odesa-2026-08-31");
  assert.equal(nohyReport.catalog.visibility, "private");
  assert.equal(nohyReport.catalog.public_listing_approved, false);
  assert.equal(aesthetemedReport.schemaVersion, 4);
  assert.equal(aesthetemedReport.templateVersion, LEGACY_GROWTH_SCORE_V4_TEMPLATE_VERSION);
});

test("report context adapts vocabulary and presentation without splitting the product or scoring model", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const sop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
  const walkthrough = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md");

  assert.match(spec, /`vertical_context`/);
  assert.match(spec, /`report_locale`/);
  assert.match(spec, /`aesthetic_practice`, `dental_practice`, `beauty_salon`/);
  assert.match(spec, /`en`, `ru`, `es`, `fr`, `uk`/);
  assert.match(spec, /Neither context field changes scoring weights, metric IDs, coverage, evidence classes, the unnumbered Intro plus (?:exact )?(?:9|nine)-section cockpit order, the funnel or pricing/i);
  assert.match(spec, /do not create 3 × 5 copies of the template/i);
  assert.match(sop, /resolve practice identity → resolve `vertical_context` → resolve `report_locale` → freeze research brief/i);
  assert.match(walkthrough, /narration and subtitles use `report_locale`/i);
  assert.match(walkthrough, /cannot change the approved objective strength, binding constraint, spoken Top 3 derived from the named-human Focus Selection, Do Not Fund Yet/i);
});

test("spec makes schema v5 authoritative and keeps v4 as historical read-only compatibility", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  assert.match(spec, /production contract for every new approved report is \*\*schema v5\*\*/i);
  assert.match(spec, /growth-score-report-template\/5\.2\.0/i);
  assert.match(spec, /historical(?:,|\/|-)?\s*read-only/i);
  assert.match(spec, /must not emit `top_priorities`, `problem_inventory`, `remediation_tasks` or stored `selected_for_repair`/i);
  assert.match(spec, /Nohy V Ruky report is the current production-approved schema-v5 example/i);
  assert.match(spec, /Nohy V Ruky[\s\S]{0,400}(?:server-side password|access_group_id|protected)/i);
  assert.match(spec, /Neither example supplies reusable facts, scores, sources, findings, Focus Selection, approval metadata or commercial language/i);
  assert.match(spec, /There is no other metric catalogue, scoring authority or renderer authority/i);
});

test("canon defines five unscored views over existing evidence without a fifth surface or automatic decision", () => {
  const master = read("docs/ssot/CAESTHETIC.md");
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const client = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md");
  const sop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
  const combined = [master, spec, client, sop].join("\n");

  for (const view of [
    "Treatment Opportunity Matrix",
    "Provider Visibility Map",
    "Trust Chain",
    "Patient Friction Index",
    "Do Not Promote Yet by Treatment",
  ]) assert.match(combined, new RegExp(view));
  assert.match(spec, /growth-score-decision-views\/1\.0\.0/);
  assert.match(spec, /existing_growth_score_evidence_only/);
  assert.match(spec, /automatic_score_change[\s\S]{0,100}false/);
  assert.match(spec, /automatic_binding_constraint_selection[\s\S]{0,100}false/);
  assert.match(spec, /automatic_focus_selection[\s\S]{0,100}false/);
  assert.match(spec, /automatic_promotion_decision[\s\S]{0,100}false/);
  assert.match(client, /first four views render[\s\S]{0,160}`gap-map`/i);
  assert.match(client, /Do Not Promote Yet by Treatment[\s\S]{0,160}`do-not-fund`/i);
  assert.match(sop, /existing approved evidence only/i);
  assert.match(spec, /LinkedIn\/Reddit ingestion/);
});
