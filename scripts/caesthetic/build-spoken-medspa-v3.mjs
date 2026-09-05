#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderGrowthReport } from "./render-growth-score.mjs";
import { OWNER_V3, SPOKEN_CASE } from "./growth-score-owner-v3-model.mjs";
import { check500USCopy } from "./check500-copy.mjs";
import { digest, assertReviewed, validateConsistency } from "./consistency-contract.mjs";
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const V3_PACKAGE = `docs/audits/caesthetic/growth-score/cases/${SPOKEN_CASE}/revisions/v3`;
export const V3_PARENTS = Object.freeze({ ru: "spoken-medspa-snellville-9d7f3a5c2e184b61-rus", "en-US": "spoken-medspa-snellville-9d7f3a5c2e184b61" });
const readJSON = p => JSON.parse(fs.readFileSync(p, "utf8"));
const confined = (base, rel) => {
  const target = path.resolve(base, rel);
  if (!target.startsWith(path.resolve(base) + path.sep)) throw new Error(`V3_INVALID: nonlocal input ${rel}`);
  return target;
};
export function loadV3Package({ root = ROOT, packageDir = path.join(root, V3_PACKAGE), clientRelease = false } = {}) {
  const release = readJSON(path.join(packageDir, "release.json"));
  if (release.contract !== "spoken-v3-release/1.0.0" || release.case_id !== SPOKEN_CASE) throw new Error("V3_INVALID: release contract/case");
  for (const [name, hash] of Object.entries(release.inputs || {})) {
    if (digest(fs.readFileSync(confined(packageDir, name))) !== hash) throw new Error(`V3_INPUT_CHANGED: ${name}`);
  }
  for (const name of ["approved-report.ru.json", "approved-report.en-US.json", "copy.ru.json", "copy.en-US.json", "consistency.json", "source-register.json"]) if (!release.inputs?.[name]) throw new Error(`V3_INVALID: missing pinned input ${name}`);
  const reports = Object.fromEntries(Object.keys(V3_PARENTS).map(l => [l, readJSON(path.join(packageDir, `approved-report.${l}.json`))]));
  const copies = Object.fromEntries(Object.keys(V3_PARENTS).map(l => [l, readJSON(path.join(packageDir, `copy.${l}.json`))]));
  if (JSON.stringify(Object.keys(copies.ru).sort()) !== JSON.stringify(Object.keys(copies["en-US"]).sort())) throw new Error("V3_INVALID: paired copy keys differ");
  if (JSON.stringify(reports.ru.humanDiagnosis.focus_selection.primary_gap_id) !== JSON.stringify(reports["en-US"].humanDiagnosis.focus_selection.primary_gap_id) || JSON.stringify(reports.ru.humanDiagnosis.focus_selection.supporting_gap_ids) !== JSON.stringify(reports["en-US"].humanDiagnosis.focus_selection.supporting_gap_ids)) throw new Error("V3_INVALID: paired priority IDs differ");
  // Asset bytes are release inputs. Legacy-route hashes are regression evidence,
  // not floating build dependencies: changing a parent cannot silently change v3.
  for (const pair of Object.values(release.assets)) for (const asset of Object.values(pair)) {
    if (digest(fs.readFileSync(confined(root, "site-caesthetic" + asset.src))) !== asset.sha256) throw new Error(`V3_ASSET_CHANGED: ${asset.src}`);
  }
  if (digest(check500USCopy()) !== release.check500_us_copy_digest) throw new Error("V3_INPUT_CHANGED: Check500 US copy");
  for (const [name, origin] of Object.entries(release.source_files)) if (digest(fs.readFileSync(path.join(packageDir, name))) !== origin.sha256) throw new Error(`V3_SOURCE_SNAPSHOT_CHANGED: ${name}`);
  const matrix = readJSON(path.join(packageDir, "consistency.json"));
  const registry = readJSON(path.join(packageDir, "source-register.json"));
  const final = clientRelease || release.stage === "client_release";
  if (final && release.stage !== "client_release") throw new Error("REVIEW_REQUIRED: v3 is a working preview, not a client release");
  validateConsistency(matrix, registry, { clientRelease: final });
  if (final) { assertReviewed(release.research_alignment, "Research Alignment"); assertReviewed(release, "client release"); }
  return { release, reports, copies, matrix, registry };
}
export function buildV3(locale, options = {}) {
  const key = locale === "en" ? "en-US" : locale;
  if (!Object.hasOwn(V3_PARENTS, key)) throw new Error("V3_INVALID: unsupported locale");
  const p = loadV3Package(options), report = structuredClone(p.reports[key]);
  report.presentation = { ...report.presentation, layout_contract: OWNER_V3, revision: "3", v3: { release: p.release, copy: p.copies[key], matrix: p.matrix, registry: p.registry } };
  return report;
}
export function generateV3(options = {}) {
  const result = new Map();
  for (const locale of Object.keys(V3_PARENTS)) {
    const report = buildV3(locale, options), release = report.presentation.v3.release;
    const dir = `site-caesthetic/score/${V3_PARENTS[locale]}/v3`;
    const html = renderGrowthReport(report);
    if (locale === "en-US" && /[А-Яа-яЁё]/.test(html)) throw new Error("V3_INVALID: Cyrillic leaked into English HTML");
    result.set(`${dir}/index.html`, html);
    result.set(`${dir}/presentation.json`, JSON.stringify({ layout_contract: OWNER_V3, revision: "3", stage: release.stage, source_ref: release.source_ref, source_input_digest: digest(release.inputs), matrix_status: release.stage === "client_release" ? "reviewed" : "pending_review" }, null, 2) + "\n");
  }
  return result;
}
export function writeV3({ check = false, outputRoot = ROOT, ...options } = {}) {
  const generated = generateV3(options); // Validate and render both locales before any output write.
  if (check) {
    for (const [rel, content] of generated) if (!fs.existsSync(path.join(outputRoot, rel)) || fs.readFileSync(path.join(outputRoot, rel), "utf8") !== content) throw new Error(`V3_BUILD_DRIFT: ${rel}`);
    return generated;
  }
  const staged = [], backups = [];
  try {
    for (const [rel, content] of generated) {
      const dest = confined(outputRoot, rel); fs.mkdirSync(path.dirname(dest), { recursive: true });
      const temp = `${dest}.v3-${process.pid}.tmp`; fs.writeFileSync(temp, content);
      staged.push([temp, dest]); backups.push([dest, fs.existsSync(dest) ? fs.readFileSync(dest) : null]);
    }
    for (const [temp, dest] of staged) fs.renameSync(temp, dest);
  } catch (e) {
    for (const [dest, value] of backups) { if (value !== null) fs.writeFileSync(dest, value); else fs.rmSync(dest, { force: true }); }
    throw e;
  } finally { for (const [temp] of staged) fs.rmSync(temp, { force: true }); }
  return generated;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    writeV3({ check: process.argv.includes("--check"), clientRelease: process.argv.includes("--client-release") });
    console.log(`Spoken v3 ${process.argv.includes("--check") ? "deterministic check" : "paired build"}: PASS (release stage is recorded in presentation.json)`);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
