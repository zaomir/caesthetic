import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildRussianReport,
  htmlPath,
  report,
  reportPath,
  slug,
  sourceReportPath,
} from "../../scripts/caesthetic/build-spoken-medspa-russian.mjs";
import { isAllowedRealScoreOutput, renderGrowthReport, renderReportFile } from "../../scripts/caesthetic/render-growth-score.mjs";
import { scoreGrowthReport } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = JSON.parse(fs.readFileSync(sourceReportPath, "utf8"));
const stored = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const storedHtml = fs.readFileSync(htmlPath, "utf8");

const metricFingerprint = (value) => ({
  surfaces: value.surfaces.map((surface) => ({
    id: surface.id,
    metrics: surface.metrics.map((metric) => ({
      metric_id: metric.metric_id,
      raw_value: metric.raw_value,
      normalized_score: metric.normalized_score,
      evidence_class: metric.evidence_class,
      source: metric.source,
      collected_at: metric.collected_at,
      reviewer_status: metric.reviewer_status,
    })),
  })),
  crossSurface: value.crossSurface.metrics.map((metric) => ({
    metric_id: metric.metric_id,
    raw_value: metric.raw_value,
    normalized_score: metric.normalized_score,
    evidence_class: metric.evidence_class,
    source: metric.source,
    collected_at: metric.collected_at,
    reviewer_status: metric.reviewer_status,
  })),
});

test("Russian Spoken report is a separate public direct-link route with deterministic output", () => {
  assert.equal(slug, "spoken-medspa-snellville-9d7f3a5c2e184b61-rus");
  assert.equal(report.reportContext.report_locale, "ru");
  assert.equal(report.presentation.kind, "localized_client");
  assert.equal(report.presentation.strict_locale, "ru");
  assert.equal(report.presentation.copy_profile, "plain_owner_ru");
  assert.equal(report.presentation.hide_unassessed, true);
  assert.equal(report.audit.public_direct_link, true);
  assert.equal(report.audit.access_group_id, null);
  assert.equal(isAllowedRealScoreOutput(report, htmlPath), true);
  assert.deepEqual(stored, report);
  assert.deepEqual(buildRussianReport(source), report);
  assert.equal(storedHtml, renderGrowthReport(stored));
  assert.equal(renderReportFile(reportPath, { outputPath: htmlPath, check: true }), true);
  assert.doesNotMatch(storedHtml, /cae-header-slot|cae-footer-slot|caesthetic\.js/);
  assert.doesNotMatch(storedHtml, /Введите пароль|Пароль|Log in|Login|PIN/i);
});

test("Russian Spoken report preserves the approved fact set, evidence and Top 3", () => {
  assert.equal(report.verifiedFactSetVersion, source.verifiedFactSetVersion);
  assert.deepEqual(metricFingerprint(report), metricFingerprint(source));
  assert.equal(report.humanDiagnosis.binding_constraint.gap_ref, source.humanDiagnosis.binding_constraint.gap_ref);
  assert.deepEqual(
    {
      primary_gap_id: report.humanDiagnosis.focus_selection.primary_gap_id,
      supporting_gap_ids: report.humanDiagnosis.focus_selection.supporting_gap_ids,
      selected_by: report.humanDiagnosis.focus_selection.selected_by,
      selected_at: report.humanDiagnosis.focus_selection.selected_at,
    },
    {
      primary_gap_id: source.humanDiagnosis.focus_selection.primary_gap_id,
      supporting_gap_ids: source.humanDiagnosis.focus_selection.supporting_gap_ids,
      selected_by: source.humanDiagnosis.focus_selection.selected_by,
      selected_at: source.humanDiagnosis.focus_selection.selected_at,
    },
  );
  assert.deepEqual(report.humanDiagnosis.do_not_do.evidence_refs, source.humanDiagnosis.do_not_do.evidence_refs);
  assert.deepEqual(scoreGrowthReport(report), scoreGrowthReport(source));
  assert.equal(source.reportContext.report_locale, "en");
  assert.match(source.executiveSummary, /binding constraint/i);
});

test("Russian Spoken client text contains no English terms outside approved proper names", () => {
  let visible = storedHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<span\b[^>]*data-brand[^>]*>[\s\S]*?<\/span>/gi, " ")
    .replace(/https?:\/\/[^\s<]+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+);/gi, " ");
  for (const name of report.presentation.official_names) visible = visible.replaceAll(name, " ");
  visible = visible.replace(/SMS-\d{2}-\d{2}/g, " ").replace(/\bM\b/g, " ");
  const englishTerms = [...new Set(visible.match(/[A-Za-z][A-Za-z0-9-]*/g) || [])].sort();
  assert.deepEqual(englishTerms, []);
  let accessibleText = [...storedHtml.matchAll(/\b(?:aria-label|alt|title)="([^"]*)"/g)]
    .map((match) => match[1])
    .join(" ");
  for (const name of report.presentation.official_names) accessibleText = accessibleText.replaceAll(name, " ");
  accessibleText = accessibleText.replace(/SMS-\d{2}-\d{2}/g, " ").replace(/\bM\b/g, " ");
  const accessibleEnglishTerms = [...new Set(accessibleText.match(/[A-Za-z][A-Za-z0-9-]*/g) || [])].sort();
  assert.deepEqual(accessibleEnglishTerms, []);
  assert.match(storedHtml, /Оценка роста/);
  assert.match(storedHtml, /Убрать старое название/);
  assert.match(storedHtml, /Разделить путь пациента и путь специалиста/);
  assert.match(storedHtml, /Усилить страницу филлеров/);
  const mobileCss = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report-mobile.css"), "utf8");
  assert.match(
    mobileCss,
    /html\[lang="ru"\][^{]*\.cae-report-do-not-do::before\s*\{[^}]*content:\s*"СТОП"/s,
  );
});

test("Russian Spoken report presents the approved owner-first sequence without empty or duplicate blocks", () => {
  assert.match(storedHtml, /Приветствие от Валерии/);
  assert.match(storedHtml, /Валерия Петра/);
  assert.match(storedHtml, /Пять ответов, которые помогут принять решение/);
  assert.match(storedHtml, /data-owner-competitors/);
  assert.match(storedHtml, /data-owner-internal-boundary/);
  assert.match(storedHtml, /Инструкции по самостоятельному внедрению/);
  assert.match(storedHtml, /Четыре допустимых пути/);

  const focusIndex = storedHtml.indexOf('id="focus-gaps"');
  const competitorsIndex = storedHtml.indexOf("data-owner-competitors");
  const thirtyDayIndex = storedHtml.indexOf('id="sprint-fit"');
  const internalBoundaryIndex = storedHtml.indexOf("data-owner-internal-boundary");
  const doNotFundIndex = storedHtml.indexOf('id="do-not-fund"');
  assert.ok(focusIndex < competitorsIndex && competitorsIndex < thirtyDayIndex);
  assert.ok(thirtyDayIndex < internalBoundaryIndex && internalBoundaryIndex < doNotFundIndex);

  assert.equal(report.humanDiagnosis.gap_inventory.filter((gap) => gap.diagnosis_state === "insufficient_evidence").length, 3);
  assert.equal((storedHtml.match(/<article class="cae-report-problem/g) || []).length, 4);
  assert.equal((storedHtml.match(/data-cae-request/g) || []).length, 1);
  assert.doesNotMatch(storedHtml, /Недостаточно доказательств|Нужна проверка|Не оценивалось|Не оценено/);
  assert.doesNotMatch(storedHtml, /Матрица возможностей|Карта видимости|Цепочка доверия|Индекс трения|Согласованность поверхностей/);
  assert.doesNotMatch(storedHtml, /\$500|500 долларов|cae-report-burden/);
  assert.doesNotMatch(storedHtml.replace(/<[^>]+>/g, " "), /SMS-\d{2}-\d{2}/);
  const cockpitJs = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/growth-cockpit.js"), "utf8");
  assert.match(cockpitJs, /function rebuildHero\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function enhanceFocusGaps\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function rebuildRepairPaths\(\) \{\s*if \(isNetworkParent\(\)\) return;\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function enhanceInventory\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  const reportCss = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report.css"), "utf8");
  assert.match(reportCss, /\.cae-owner-offer \.cae-btn\s*\{[^}]*width:\s*100%;[^}]*white-space:\s*normal;/s);
});

test("Russian route is noindex and the English route remains unchanged and protected", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "infra/cloudflare/brands/caesthetic.manifest.json"), "utf8"));
  assert.ok(manifest.scorePublicPaths.includes(`/score/${slug}/`));
  assert.ok(manifest.scoreProtectedPaths.some((entry) => entry.prefix === "/score/spoken-medspa-snellville-9d7f3a5c2e184b61/"));
  assert.doesNotMatch(JSON.stringify(manifest.scoreProtectedPaths), new RegExp(`${slug}/`));
  assert.match(storedHtml, /noindex,nofollow,noarchive,nosnippet/);
  assert.equal(source.reportContext.report_locale, "en");
});
