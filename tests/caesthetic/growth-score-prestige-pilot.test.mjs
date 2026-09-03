import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { report, slug } from "../../scripts/caesthetic/build-prestige-growth-score-pilot.mjs";
import { renderGrowthReport, renderReportFile } from "../../scripts/caesthetic/render-growth-score.mjs";
import {
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  scoreGrowthReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "site-caesthetic", "score", slug);
const reportPath = path.join(directory, "report.json");
const htmlPath = path.join(directory, "index.html");

test("Prestige pilot is the deterministic schema v5 renderer artifact at the preserved route", () => {
  const storedReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const storedHtml = fs.readFileSync(htmlPath, "utf8");

  assert.deepEqual(storedReport, report);
  assert.equal(storedReport.schemaVersion, 5);
  assert.equal(storedReport.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(storedReport.templateVersion, "growth-score-report-template/5.2.0");
  assert.equal(storedReport.reportState, "approved_report");
  assert.equal(storedReport.reportKind, "real");
  assert.equal(storedReport.presentation.kind, "pilot");
  assert.equal(storedReport.reportContext.report_locale, "ru");
  assert.equal(storedHtml, renderGrowthReport(storedReport));
  assert.equal(renderReportFile(reportPath, { outputPath: htmlPath, check: true }), true);
  assert.match(storedHtml, /data-report-kind="pilot"/);
  assert.match(storedHtml, /data-template-version="growth-score-report-template\/5\.2\.0"/);
  assert.match(storedHtml, /noindex,nofollow,noarchive,nosnippet/);
  assert.doesNotMatch(storedHtml, /cae-header-slot|cae-footer-slot|analytics\.js|caesthetic\.js/);
});

test("Prestige pilot preserves the approved human Focus Selection and publishes no unsupported score", () => {
  assert.deepEqual(report.humanDiagnosis.focus_selection, {
    primary_gap_id: "PRE-26-01",
    supporting_gap_ids: ["PRE-26-02", "PRE-26-03"],
    selected_by: "Редакционная версия",
    selected_at: "2026-09-01T12:16:22Z",
    rationale: "PRE-26-01 закрывает основное несоответствие; PRE-26-02 начинает единое управляемое назначение; PRE-26-03 закрывает неоднозначность барбершопа, парикмахерской и академии.",
  });
  assert.equal(report.humanDiagnosis.binding_constraint.gap_ref, "PRE-26-01");
  assert.match(report.humanDiagnosis.binding_constraint.statement, /одним последовательным маршрутом/);
  assert.match(report.humanDiagnosis.do_not_do.title, /Paid Ads/);

  const selected = report.humanDiagnosis.gap_inventory
    .filter((gap) => ["PRE-26-01", "PRE-26-02", "PRE-26-03"].includes(gap.id))
    .map((gap) => [gap.id, gap.sprint_fit.mode]);
  assert.deepEqual(selected, [
    ["PRE-26-01", "close_in_30_days"],
    ["PRE-26-02", "start_in_30_days"],
    ["PRE-26-03", "close_in_30_days"],
  ]);

  const result = scoreGrowthReport(report);
  const metricScores = [
    ...report.surfaces.flatMap((surface) => surface.metrics),
    ...report.crossSurface.metrics,
  ].map((metric) => metric.normalized_score);
  assert.equal(metricScores.every((score) => score === null), true);
  Object.values(result.surfaces).forEach((surface) => assert.equal(surface.rawScore, null));
  assert.equal(result.crossSurface.rawScore, null);
  assert.equal(result.overall.rawScore, null);
  assert.doesNotMatch(renderGrowthReport(report), /\b\d+(?:\.\d+)?\/100\b/);
});
