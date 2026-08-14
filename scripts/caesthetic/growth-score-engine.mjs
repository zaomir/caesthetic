#!/usr/bin/env node
/**
 * Thin CLI for the canonical CAESTHETIC Growth Score engine and renderer.
 * The only scoring authority lives in site-caesthetic/assets/js/growth-score-engine.mjs.
 *
 * Usage:
 *   node scripts/caesthetic/growth-score-engine.mjs path/to/report.json
 *   node scripts/caesthetic/growth-score-engine.mjs path/to/report.json --out path/to/index.html
 */
import fs from "node:fs";
import path from "node:path";
import { scoreGrowthReport } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { renderReportFile } from "./render-growth-score.mjs";

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Usage: growth-score-engine.mjs <report.json> [--out <index.html>]");
  process.exit(2);
}

const reportPath = path.resolve(args[0]);
const outFlag = args.indexOf("--out");
const outputPath = outFlag >= 0
  ? path.resolve(args[outFlag + 1])
  : path.join(path.dirname(reportPath), "index.html");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const result = scoreGrowthReport(report);
renderReportFile(reportPath, { outputPath });

console.log(JSON.stringify({
  ok: true,
  report_kind: report.reportKind,
  out: outputPath,
  overall_score: result.overall.rawScore,
}, null, 2));
