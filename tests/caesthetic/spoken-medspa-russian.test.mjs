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
const sharedRuntime = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/caesthetic.js"), "utf8");
const pointOfContactRuntime = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/point-of-contact.js"), "utf8");
const analyticsRuntime = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/analytics.js"), "utf8");

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
  assert.equal(report.presentation.commercial_contract, "caesthetic-4444-commercial-core/1.0.0");
  assert.equal(report.presentation.check500_placement_contract, "check500-two-placement/1.0.0");
  assert.equal(report.presentation.check500_style_contract, "check500-style/1.0.0");
  assert.equal(report.audit.public_direct_link, true);
  assert.equal(report.audit.access_group_id, null);
  assert.equal(isAllowedRealScoreOutput(report, htmlPath), true);
  assert.deepEqual(stored, report);
  assert.deepEqual(buildRussianReport(source), report);
  assert.equal(storedHtml, renderGrowthReport(stored));
  assert.equal(renderReportFile(reportPath, { outputPath: htmlPath, check: true }), true);
  assert.doesNotMatch(storedHtml, /cae-header-slot|cae-footer-slot/);
  assert.match(storedHtml, /\/assets\/js\/caesthetic\.js/);
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
  assert.match(pointOfContactRuntime, /isRussian \? "Портрет Валерии Петры"/);
  assert.match(pointOfContactRuntime, /Ваш контакт в CAESTHETIC/);
  assert.match(pointOfContactRuntime, /Валерия объяснит выводы/);
  assert.match(analyticsRuntime, /isRussian \? "Настройки аналитики"/);
  assert.match(analyticsRuntime, /Мы используем аналитику, чтобы улучшать сайт/);
  assert.match(analyticsRuntime, />Отказаться<\/button>/);
  assert.match(analyticsRuntime, />Разрешить<\/button>/);
  assert.match(sharedRuntime, /Мы ответим по электронной почте/);
  assert.match(sharedRuntime, /Нужны только имя и электронная почта/);
  assert.doesNotMatch(sharedRuntime, /russian \? "[^"\n]*(?:email|Order)[^"\n]*"/i);
  assert.match(storedHtml, /Оценка роста/);
  assert.match(storedHtml, /Согласовать слова и данные во всех четырёх каналах/);
  assert.match(storedHtml, /Разделить путь пациента и путь специалиста/);
  assert.match(storedHtml, /Усилить страницу филлеров/);
  const mobileCss = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report-mobile.css"), "utf8");
  assert.match(
    mobileCss,
    /html\[lang="ru"\][^{]*\.cae-report-do-not-do::before\s*\{[^}]*content:\s*"СТОП"/s,
  );
});

test("Russian Spoken report presents the approved owner-first sequence without empty or duplicate blocks", () => {
  assert.equal(report.presentation.layout_contract, "owner-brief/2.1.0");
  assert.equal(report.presentation.vertical_profile, "med_spa");
  assert.match(storedHtml, /Приветствие от Валерии/);
  assert.match(storedHtml, /Валерия Петра/);
  assert.match(storedHtml, /data-owner-research-scope/);
  assert.match(storedHtml, /<h2>Изученные ссылки<\/h2>/);
  const researchStart = storedHtml.indexOf('data-owner-research-scope');
  const researchEnd = storedHtml.indexOf('</article>', researchStart);
  const researchHtml = storedHtml.slice(researchStart, researchEnd);
  assert.equal((researchHtml.match(/<li><a /g) || []).length, 8);
  assert.equal((researchHtml.match(/target="_blank"/g) || []).length, 8);
  assert.match(researchHtml, />Главная страница <span data-brand>Spoken<\/span><\/a>/);
  assert.match(researchHtml, />Страница <span data-brand>Botox<\/span><\/a>/);
  assert.match(researchHtml, />Блог о переходе к <span data-brand>Spoken<\/span><\/a>/);
  assert.doesNotMatch(researchHtml, /cae-owner-research__cards|cae-owner-research__sources/);
  assert.doesNotMatch(researchHtml, /Мы изучили только открытые источники/);
  assert.match(storedHtml, /Как пользоваться отчётом/);
  assert.match(storedHtml, /Три главные ограничения/);
  assert.match(storedHtml, /data-owner-constraint-accordion/);
  assert.equal((storedHtml.match(/<details class="cae-focus-gap cae-focus-gap--plain cae-owner-constraint"/g) || []).length, 3);
  assert.equal((storedHtml.match(/<summary><h3><span class="cae-focus-gap__rank cae-status-pill">Проблема [123]<\/span>/g) || []).length, 3);
  assert.equal((storedHtml.match(/class="cae-owner-constraint__body"/g) || []).length, 3);
  assert.doesNotMatch(storedHtml, /<details class="cae-focus-gap cae-focus-gap--plain cae-owner-constraint"[^>]*\sopen(?:\s|>)/);
  assert.equal((storedHtml.match(/class="cae-focus-gap__evidence"/g) || []).length, 3);
  assert.equal((storedHtml.match(/<h4>Что нашли<\/h4>/g) || []).length, 3);
  assert.equal((storedHtml.match(/<strong>Почему это мешает:<\/strong>/g) || []).length, 3);
  assert.equal((storedHtml.match(/<h4>Как понять, что готово<\/h4>/g) || []).length, 3);
  assert.match(storedHtml, /Краткая карта пути пациента/);
  assert.match(storedHtml, /data-owner-competitors/);
  assert.match(storedHtml, /data-owner-internal-boundary/);
  assert.match(storedHtml, />Что происходит после обращения пациента</);
  assert.match(storedHtml, /lead-to-revenue-map-ru\.svg/);
  assert.match(storedHtml, /Путь пациента после обращения: от ответа до оплаты/);
  assert.match(storedHtml, /Исследование конкурентов/);
  assert.match(storedHtml, /Почему включён/);
  assert.match(storedHtml, /Почему пациент может выбрать/);
  assert.match(storedHtml, /Проверено/);
  assert.equal((storedHtml.match(/Понятный путь: услуга → запись\./g) || []).length, 1);
  assert.match(storedHtml, />СТОП</);
  assert.match(storedHtml, />ВЫВОДЫ</);
  assert.match(storedHtml, /Выберите, кто внедрит изменения/);
  assert.match(storedHtml, /Порядок работ/);
  assert.match(storedHtml, /Пошаговые инструкции/);
  assert.match(storedHtml, /class="cae-report-note cae-owner-thirty-day-note">Это рекомендуемый порядок самостоятельной работы/);
  assert.doesNotMatch(storedHtml, /data-owner-commercial-priority/);
  assert.doesNotMatch(storedHtml, /Главный продукт <span data-brand>CAESTHETIC<\/span> — 4444/);
  assert.doesNotMatch(storedHtml, /Один язык спроса на четырёх поверхностях/);
  assert.doesNotMatch(storedHtml, /Один главный и два поддерживающих приоритета/);
  assert.doesNotMatch(storedHtml, /Четыре допустимых пути/);
  assert.doesNotMatch(storedHtml, /Полный реестр подтверждённых разрывов/);
  assert.doesNotMatch(storedHtml, /data-owner-reputation-service/);
  assert.match(storedHtml, /без отбора, оплаты и готового текста/);
  assert.match(storedHtml, /Не подтверждать лечение и не раскрывать личные данные/);
  assert.equal(report.humanDiagnosis.gap_inventory.find((gap) => gap.id === "SMS-26-03").title, "Усилить страницу филлеров");
  assert.match(report.humanDiagnosis.gap_inventory.find((gap) => gap.id === "SMS-26-03").repair_plan.day_30_outcome, /Сбор отзывов и ответы владельца/);

  const constraintsIndex = storedHtml.indexOf('id="gap-map"');
  const journeyIndex = storedHtml.indexOf('id="focus-gaps"');
  const internalIndex = storedHtml.indexOf('id="sprint-fit"');
  const competitorsIndex = storedHtml.indexOf("data-owner-competitors");
  const internalBoundaryIndex = storedHtml.indexOf("data-owner-internal-boundary");
  const doNotFundIndex = storedHtml.indexOf('id="do-not-fund"');
  const conclusionIndex = storedHtml.indexOf('id="gap-inventory"');
  const choicesIndex = storedHtml.indexOf('id="evidence-and-competitors"');
  const workOrderIndex = storedHtml.indexOf('id="scores-and-methodology"');
  const instructionsIndex = storedHtml.indexOf('id="next-step"');
  assert.ok(constraintsIndex < journeyIndex && journeyIndex < internalIndex);
  assert.ok(internalIndex < internalBoundaryIndex && internalBoundaryIndex < competitorsIndex);
  assert.ok(competitorsIndex < doNotFundIndex && doNotFundIndex < conclusionIndex);
  assert.ok(conclusionIndex < choicesIndex && choicesIndex < workOrderIndex && workOrderIndex < instructionsIndex);

  assert.equal(report.humanDiagnosis.gap_inventory.filter((gap) => gap.diagnosis_state === "insufficient_evidence").length, 3);
  assert.equal((storedHtml.match(/<div class="cae-owner-paths"><article/g) || []).length, 1);
  assert.equal((storedHtml.match(/<div class="cae-owner-paths">[\s\S]*?<\/div>/g) || []).length, 1);
  const pathsHtml = storedHtml.slice(storedHtml.indexOf('<div class="cae-owner-paths">'), storedHtml.indexOf('</div>', storedHtml.indexOf('<div class="cae-owner-paths">')));
  assert.equal((pathsHtml.match(/<article/g) || []).length, 3);
  assert.doesNotMatch(pathsHtml, /Отложить/);
  assert.match(pathsHtml, /главный приоритет 4444: согласовать четыре канала/i);
  assert.match(pathsHtml, /один смысл и одни названия в <span data-brand>Google<\/span>, на сайте, в социальных сетях, отзывах и ответах владельца/);
  assert.equal(report.leadToRevenueCheck.recommendation, "recommended");
  assert.ok(report.leadToRevenueCheck.reason.length > 0);
  assert.deepEqual(report.leadToRevenueCheck.evidence_refs, [
    "website.above_fold_conversion",
    "cross.positioning_coherence",
  ]);
  assert.equal((storedHtml.match(/data-cae-check-inquiry/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-cae-check-placement="(?:mid|final)"/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-cae-check-placement="mid"/g) || []).length, 1);
  assert.equal((storedHtml.match(/data-cae-check-placement="final"/g) || []).length, 1);
  assert.equal((storedHtml.match(/data-check500-contract="check500-two-placement\/1\.0\.0"/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-check500-copy-contract="check500-section\/en-US\/1\.0\.0"/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-check500-style-contract="check500-style\/1\.0\.0"/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-style-reference-sha256="1d8d9d0732176f0f459e8ddd76fbd50ed2425baea3e7bda3c83559836a22a375"/g) || []).length, 2);
  assert.equal((storedHtml.match(/Все ли обращения доходят до записи\?/g) || []).length, 2);
  assert.equal((storedHtml.match(/Проверка пути от обращения до оплаты · \$500/g) || []).length, 2);
  assert.equal((storedHtml.match(/Проверить обращения за \$500/g) || []).length, 2);
  assert.equal((storedHtml.match(/\$500 войдут в его стоимость \$2,500/g) || []).length, 2);
  assert.equal((storedHtml.match(/data-cae-sprint-inquiry/g) || []).length, 1);
  assert.equal((storedHtml.match(/data-cae-question/g) || []).length, 1);
  assert.equal((storedHtml.match(/href="#request"/g) || []).length, 3);
  assert.doesNotMatch(storedHtml, /href="\/(?:lead-to-revenue-check|sprint)\/"/);
  assert.match(storedHtml, /data-owner-sprint-offer/);
  assert.doesNotMatch(storedHtml, /Если сначала нужен меньший шаг|Она не обязательна перед спринтом|Проверку за \$500 можно заказать отдельно/);
  assert.doesNotMatch(storedHtml, /С чего начать:<\/strong>.*начинаем с проверки за \$500/);
  assert.equal((storedHtml.match(/class="cae-mobile-repair"/g) || []).length, 3);
  assert.doesNotMatch(storedHtml, /<details class="cae-mobile-repair" open>/);
  assert.doesNotMatch(storedHtml, /data-cae-request/);
  assert.match(storedHtml, /\/assets\/js\/caesthetic-config\.js/);
  assert.match(storedHtml, /\/assets\/js\/caesthetic\.js/);
  assert.doesNotMatch(storedHtml, /growth-report-funnel\.js/);
  assert.doesNotMatch(storedHtml, /Недостаточно доказательств|Нужна проверка|Не оценивалось|Не оценено/);
  assert.doesNotMatch(storedHtml, /Матрица возможностей|Карта видимости|Цепочка доверия|Индекс трения|Согласованность поверхностей/);
  assert.match(storedHtml, /\$500/);
  assert.match(storedHtml, /\$500 войдут в его стоимость \$2,500/);
  assert.match(storedHtml, /\$2,500 · 30 дней/);
  assert.match(storedHtml, /Согласовать четыре канала за 30 дней/);
  assert.match(storedHtml, /Что нужно от <span data-brand>Spoken<\/span>/);
  assert.match(storedHtml, /Что проверим на 30-й день/);
  assert.match(storedHtml, /не обещаем конкретные позиции в поиске, число пациентов, выручку или окупаемость/);
  assert.doesNotMatch(storedHtml, /боится|сомневается/i);
  const middleCheckIndex = storedHtml.indexOf('data-cae-check-placement="mid"');
  const sprintOfferIndex = storedHtml.indexOf("data-owner-sprint-offer");
  const finalCheckIndex = storedHtml.indexOf('data-cae-check-placement="final"');
  assert.ok(internalBoundaryIndex < middleCheckIndex && middleCheckIndex < doNotFundIndex);
  assert.ok(sprintOfferIndex < finalCheckIndex);
  assert.doesNotMatch(storedHtml, /cae-report-burden/);
  assert.doesNotMatch(storedHtml.replace(/<[^>]+>/g, " "), /SMS-\d{2}-\d{2}/);
  const cockpitJs = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/growth-cockpit.js"), "utf8");
  assert.match(cockpitJs, /function rebuildHero\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function enhanceFocusGaps\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function rebuildRepairPaths\(\) \{\s*if \(isNetworkParent\(\)\) return;\s*if \(isPlainOwnerProfile\(\)\) return;/);
  assert.match(cockpitJs, /function enhanceInventory\(\) \{\s*if \(isPlainOwnerProfile\(\)\) return;/);
  const reportCss = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report.css"), "utf8");
  assert.match(reportCss, /\.cae-owner-offer \.cae-btn,\s*\.cae-owner-check500 \.cae-btn\s*\{[^}]*width:\s*100%;[^}]*white-space:\s*normal;/s);
  assert.match(reportCss, /\.cae-owner-paths > article > span/);
  assert.match(reportCss, /\.cae-score-report--plain-owner \[data-brand\]\s*\{\s*display:\s*inline;/s);
  assert.match(reportCss, /\.cae-score-report--plain-owner \.cae-status-pill\s*\{[^}]*white-space:\s*normal;/s);
  assert.match(reportCss, /\.cae-score-report--plain-owner \.cae-report-problem\s*\{[^}]*padding:\s*clamp\(1\.15rem, 2\.5vw, 1\.75rem\);/s);
  assert.match(reportCss, /\.cae-owner-repair-accordions\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/s);
  assert.match(reportCss, /\.cae-owner-research__links\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s);
  assert.match(reportCss, /\.cae-score-report--brief \.cae-owner-constraint-accordion\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s);
  assert.match(reportCss, /\.cae-owner-constraint > summary::after\s*\{[^}]*content:\s*"\+";/s);
  assert.match(reportCss, /\.cae-owner-constraint\[open\] > summary::after\s*\{[^}]*content:\s*"−";/s);
  assert.match(reportCss, /Check500 reusable section — check500-style\/1\.0\.0/);
  assert.match(reportCss, /\.cae-score-report \.cae-check500-section,\s*\n\.cae-score-report \.cae-owner-check500\s*\{[^}]*border-top:\s*2px solid #0B2438;[^}]*border-bottom:\s*2px solid #0B2438;[^}]*background:\s*#F0EDE6;[^}]*text-align:\s*center;/s);
  assert.match(reportCss, /\.cae-score-report \.cae-check500-section \.cae-btn,\s*\n\.cae-score-report \.cae-owner-check500 \.cae-btn\s*\{[^}]*background:\s*#7B244B;[^}]*color:\s*#FFFFFF;/s);
});

test("Russian route is noindex and the English route remains unchanged and protected", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "infra/cloudflare/brands/caesthetic.manifest.json"), "utf8"));
  assert.ok(manifest.scorePublicPaths.includes(`/score/${slug}/`));
  assert.ok(manifest.scoreProtectedPaths.some((entry) => entry.prefix === "/score/spoken-medspa-snellville-9d7f3a5c2e184b61/"));
  assert.doesNotMatch(JSON.stringify(manifest.scoreProtectedPaths), new RegExp(`${slug}/`));
  assert.match(storedHtml, /noindex,nofollow,noarchive,nosnippet/);
  assert.equal(source.reportContext.report_locale, "en");
});
