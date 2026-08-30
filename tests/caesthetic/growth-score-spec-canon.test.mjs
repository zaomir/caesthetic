import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { CANONICAL_METRICS, scoreGrowthReport } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import {
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  createGrowthScoreReportTemplate,
} from "../../scripts/caesthetic/growth-score-report-template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("detailed spec follows the current 13-section cockpit instead of the legacy block model", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const sections = [
    "Executive Overview",
    "Human-approved diagnosis",
    "Exactly Top 3 priorities",
    "Complete Remediation Plan",
    "Four-Surface score navigator",
    "Evidence drill-down",
    "Full Problem Inventory",
    "Do Not Fund Yet",
    "Four implementation paths",
    "Why CAESTHETIC / coordination burden",
    "Illustrative 30-day sequencing preview",
    "Optional Sprint CTA",
    "Methodology and limitations",
  ];

  let cursor = -1;
  for (const section of sections) {
    const next = spec.indexOf(`**${section}**`, cursor + 1);
    assert.ok(next > cursor, `${section} must appear in canonical cockpit order`);
    cursor = next;
  }

  assert.doesNotMatch(spec, /12 \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u0445|\u0411\u043b\u043e\u043a 10|Block 10|\u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0431\u043b\u043e\u043a\u043e\u0432 \u043d\u0435 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u0432\u043b\u044f\u0442\u044c/i);
  assert.doesNotMatch(spec, /The first two items above are what the 30-Day Sprint covers/i);
});
test("Free Score route, walkthrough and Mystery Shopper boundaries remain explicit", () => {
  const master = read("docs/ssot/CAESTHETIC.md");
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const walkthrough = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md");

  assert.match(master, /\/score\/<unguessable-slug>\/.*outside the sitemap.*not password-gated/is);
  assert.match(master, /every `\/score\/` route remains `noindex` and outside the sitemap/i);
  assert.match(spec, /3\u20138 minute Valerie Petra walkthrough/);
  assert.match(spec, /metric\/evidence capability/);
  assert.match(spec, /not part of the standard Free Score research or spoken walkthrough/i);
  assert.match(walkthrough, /3\u20138 minutes/);
  assert.match(walkthrough, /must not:[\s\S]*Mystery Shopper as part of the Free Score/i);
});

test("canonical authoring template derives exact metrics and fails closed", () => {
  const report = createGrowthScoreReportTemplate();

  assert.equal(report.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
  assert.equal(report.schemaVersion, 4);
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
  assert.equal(report.humanDiagnosis.top_priorities.length, 3);
  assert.equal(report.humanDiagnosis.competitors.entries.length, 3);
  assert.equal(report.humanDiagnosis.walkthrough.status, "pending");

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

test("report context adapts vocabulary and presentation without splitting the product or scoring model", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const sop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
  const walkthrough = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md");

  assert.match(spec, /`vertical_context`/);
  assert.match(spec, /`report_locale`/);
  assert.match(spec, /`aesthetic_practice`, `dental_practice`, `beauty_salon`/);
  assert.match(spec, /`en`, `ru`, `es`, `fr`, `uk`/);
  assert.match(spec, /Neither context field changes scoring weights, metric IDs, coverage, evidence classes, the 13-section cockpit order, the funnel or pricing/i);
  assert.match(spec, /do not create 3 × 5 copies of the template/i);
  assert.match(sop, /resolve practice identity → resolve `vertical_context` → resolve `report_locale` → freeze research brief/i);
  assert.match(walkthrough, /narration and subtitles use `report_locale`/i);
  assert.match(walkthrough, /cannot change the approved objective strength, binding constraint, Top 3, Do Not Fund Yet/i);
});

test("spec names one reusable template and keeps the approved report as example only", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  assert.match(spec, /single reusable schema-v4 authoring scaffold is `scripts\/caesthetic\/growth-score-report-template\.mjs`/i);
  assert.match(spec, /Aesthetemed public-evidence report is the first production-approved example/i);
  assert.match(spec, /none of its facts, sources, findings or approval metadata are reusable defaults/i);
  assert.match(spec, /There is no other reusable Growth Score report template, metric catalogue or renderer authority/i);
});
