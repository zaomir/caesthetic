#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CASES_REL = "docs/audits/caesthetic/growth-score/cases";
const INDEX_REL = "docs/audits/caesthetic/growth-score/index.generated.json";
const REPOSITORY_ACCESS = ["zaomir/grainee-v2", "zaomir/caesthetic"];
const FORBIDDEN_KEYS = /^(password|password_hash|secret|token|access_code|authorization|cookie)$/i;

const toPosix = (value) => value.split(path.sep).join("/");

function walkFiles(root, filename) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(target, filename));
    if (entry.isFile() && entry.name === filename) files.push(target);
  }
  return files.sort();
}

function assertRepoRelative(value, label) {
  if (typeof value !== "string" || !value || path.isAbsolute(value) || value.split("/").includes("..")) {
    throw new TypeError(`${label} must be a repository-relative path`);
  }
}

function assertNoSecretKeys(value, label) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecretKeys(item, `${label}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key)) throw new TypeError(`${label} contains forbidden key: ${key}`);
    assertNoSecretKeys(item, `${label}.${key}`);
  }
}

function projectIdFromReport(report, reportPath, scoreRoot, fallbackId) {
  if (typeof report.audit?.project_id === "string" && report.audit.project_id) {
    return report.audit.project_id;
  }
  if (reportPath.startsWith(scoreRoot)) return toPosix(path.relative(scoreRoot, reportPath)).split("/")[0];
  return fallbackId;
}

function readCases(repoRoot) {
  const casesRoot = path.join(repoRoot, CASES_REL);
  return walkFiles(casesRoot, "case.json").map((manifestPath) => {
    const rel = toPosix(path.relative(repoRoot, manifestPath));
    const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const folder = path.basename(path.dirname(manifestPath));
    assertNoSecretKeys(data, rel);
    if (data.schema_version !== 1) throw new TypeError(`${rel}: schema_version must be 1`);
    if (data.audit_id !== folder) throw new TypeError(`${rel}: audit_id must match folder name`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.audit_id)) throw new TypeError(`${rel}: invalid audit_id`);
    if (data.product !== "growth_score") throw new TypeError(`${rel}: product must be growth_score`);
    if (!data.title || !data.subject_type || !data.status) throw new TypeError(`${rel}: missing required metadata`);
    if (!['single_location', 'multi_location'].includes(data.audit_format)) throw new TypeError(`${rel}: invalid audit_format`);
    if (data.evidence_policy !== "public_sources_only") throw new TypeError(`${rel}: evidence_policy must be public_sources_only`);
    if (JSON.stringify(data.repository_access) !== JSON.stringify(REPOSITORY_ACCESS)) {
      throw new TypeError(`${rel}: repository_access must name both canonical repositories`);
    }
    if (!Array.isArray(data.authoring_source_paths) || data.authoring_source_paths.length === 0) {
      throw new TypeError(`${rel}: authoring_source_paths must be non-empty`);
    }
    if (!Array.isArray(data.report_paths)) throw new TypeError(`${rel}: report_paths must be an array`);
    if (!Array.isArray(data.production_report_paths)) throw new TypeError(`${rel}: production_report_paths must be an array`);
    if (data.report_paths.length !== data.production_report_paths.length) {
      throw new TypeError(`${rel}: report_paths and production_report_paths must have equal length`);
    }
    for (const source of data.authoring_source_paths) {
      assertRepoRelative(source, `${rel}: authoring source`);
      if (!fs.existsSync(path.join(repoRoot, source))) throw new TypeError(`${rel}: missing authoring source ${source}`);
    }
    for (const reportPath of data.report_paths) {
      assertRepoRelative(reportPath, `${rel}: report`);
      if (!/^docs\/audits\/caesthetic\/growth-score\/cases\/.+\/reports\/.+\.json$/.test(reportPath)) {
        throw new TypeError(`${rel}: invalid report path ${reportPath}`);
      }
      if (!fs.existsSync(path.join(repoRoot, reportPath))) throw new TypeError(`${rel}: missing report ${reportPath}`);
    }
    for (const reportPath of data.production_report_paths) {
      assertRepoRelative(reportPath, `${rel}: production report`);
      if (!/^site-caesthetic\/score\/.+\/report\.json$/.test(reportPath)) {
        throw new TypeError(`${rel}: invalid production report path ${reportPath}`);
      }
      if (!fs.existsSync(path.join(repoRoot, reportPath))) throw new TypeError(`${rel}: missing production report ${reportPath}`);
    }
    return { rel, data };
  });
}

export function buildAuditStorageIndex({ repoRoot = defaultRepoRoot } = {}) {
  const scoreRoot = path.join(repoRoot, "site-caesthetic/score");
  const cases = readCases(repoRoot);
  const ids = new Set();
  const productionReportOwners = new Map();

  for (const entry of cases) {
    if (ids.has(entry.data.audit_id)) throw new TypeError(`Duplicate audit_id: ${entry.data.audit_id}`);
    ids.add(entry.data.audit_id);
    for (let index = 0; index < entry.data.report_paths.length; index += 1) {
      const sharedRel = entry.data.report_paths[index];
      const productionRel = entry.data.production_report_paths[index];
      if (productionReportOwners.has(productionRel)) throw new TypeError(`Production report belongs to multiple audits: ${productionRel}`);
      const sharedPath = path.join(repoRoot, sharedRel);
      const productionPath = path.join(repoRoot, productionRel);
      const sharedText = fs.readFileSync(sharedPath, "utf8");
      const productionText = fs.readFileSync(productionPath, "utf8");
      const shared = JSON.parse(sharedText);
      const production = JSON.parse(productionText);
      assertNoSecretKeys(shared, sharedRel);
      const sharedProjectId = projectIdFromReport(shared, sharedPath, scoreRoot, entry.data.audit_id);
      const productionProjectId = projectIdFromReport(production, productionPath, scoreRoot, entry.data.audit_id);
      if (sharedProjectId !== entry.data.audit_id || productionProjectId !== entry.data.audit_id) {
        throw new TypeError(`${entry.rel}: report project_id does not match ${entry.data.audit_id}`);
      }
      if (sharedText !== productionText) throw new TypeError(`${entry.rel}: shared and production report records differ`);
      productionReportOwners.set(productionRel, entry.data.audit_id);
    }
  }

  const approvedReports = walkFiles(scoreRoot, "report.json")
    .filter((reportPath) => JSON.parse(fs.readFileSync(reportPath, "utf8")).reportState === "approved_report")
    .map((reportPath) => toPosix(path.relative(repoRoot, reportPath)));
  for (const reportRel of approvedReports) {
    if (!productionReportOwners.has(reportRel)) throw new TypeError(`Approved report has no audit case: ${reportRel}`);
  }

  return {
    schema_version: 1,
    authority: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
    generated_from: `${CASES_REL}/*/case.json`,
    counts: { audits: cases.length, approved_report_records: approvedReports.length },
    cases: cases
      .map(({ rel, data }) => ({
        audit_id: data.audit_id,
        title: data.title,
        subject_type: data.subject_type,
        audit_format: data.audit_format,
        status: data.status,
        evidence_policy: data.evidence_policy,
        repository_access: data.repository_access,
        authoring_source_paths: data.authoring_source_paths,
        report_paths: data.report_paths,
        production_report_paths: data.production_report_paths,
        manifest_path: rel,
      }))
      .sort((a, b) => a.audit_id.localeCompare(b.audit_id)),
  };
}

export function serializeAuditStorageIndex(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

export function checkAuditStorage({ repoRoot = defaultRepoRoot } = {}) {
  const expected = serializeAuditStorageIndex(buildAuditStorageIndex({ repoRoot }));
  const indexPath = path.join(repoRoot, INDEX_REL);
  const current = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
  if (current !== expected) throw new Error(`${INDEX_REL} is stale; run audit-storage.mjs --write`);
  return true;
}

function main() {
  const mode = process.argv[2] ?? "--check";
  const index = buildAuditStorageIndex();
  if (mode === "--write") {
    const indexPath = path.join(defaultRepoRoot, INDEX_REL);
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(indexPath, serializeAuditStorageIndex(index));
    console.log(`wrote ${INDEX_REL}`);
    return;
  }
  if (mode !== "--check") throw new TypeError(`Unknown mode: ${mode}`);
  checkAuditStorage();
  console.log(`audit storage ok: ${index.counts.audits} audits, ${index.counts.approved_report_records} report records`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
