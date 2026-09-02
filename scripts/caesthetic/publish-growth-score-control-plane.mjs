#!/usr/bin/env node
/**
 * Fail-closed Growth Score publication bridge: zaomir/caesthetic -> grainee-v2.
 *
 * The satellite supplies immutable, human-approved JSON at an exact satellite
 * SHA. This process validates and renders with the canonical grainee-v2 code,
 * writes only deterministic Growth Score routes/catalog metadata, commits
 * grainee-v2/main, deploys CAESTHETIC, smokes the exact live routes, and writes
 * a durable result back to the satellite.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateApprovedReportRecord } from "./growth-score-workflow.mjs";
import { validateMultiLocationPackage } from "./multi-location-growth-score.mjs";
import { renderGrowthReport } from "./render-growth-score.mjs";
import { writeGrowthScoreProjectCatalog } from "./growth-score-project-catalog.mjs";

export const CONTRACT_VERSION = "caesthetic-growth-score-publish/1.0";
export const REQUEST_TYPE = "caesthetic_growth_score_publish";
export const PUBLISH_ROOT = "docs/projects/caesthetic/publish-growth-score";
export const REQUEST_ROOT = `${PUBLISH_ROOT}/requests`;
export const ARTIFACT_ROOT = `${PUBLISH_ROOT}/artifacts`;
export const RESULT_ROOT = `${PUBLISH_ROOT}/results`;
export const CANONICAL_RECORD_ROOT = `${PUBLISH_ROOT}/canonical-records`;

const SHA40 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const REQUEST_ID = /^publish-growth-score-[a-z0-9][a-z0-9-]{7,96}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{16,}$/;
const ALLOWED_FORMATS = new Set(["single_location", "multi_location"]);
const ALLOWED_VISIBILITY = new Set(["synthetic", "private"]);
const FORBIDDEN_KEY = /(?:password|passwd|password_hash|session_secret|secret|credential|api[_-]?key|access[_-]?token|private[_-]?key)/i;
const FORBIDDEN_HTML = [
  /Your Growth Review/i,
  /Ваш разбор Growth Score/i,
  /3[–-]8\s*(?:minutes?|минут)/i,
  /data-review-anchor=["']110[1-9]["']/i,
];
const SECRET_PATTERNS = [
  ["google_api_key", /AIza[0-9A-Za-z\-_]{20,}/],
  ["apify_token", /apify_api_[0-9A-Za-z]+/i],
  ["github_pat", /ghp_[0-9A-Za-z]{20,}/],
  ["github_pat_fine", /github_pat_[0-9A-Za-z_]+/],
  ["supabase_jwt", /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/],
  ["openai_key", /sk-[A-Za-z0-9]{20,}/],
  ["deploy_hook", /grainee-deploy-[0-9]{4}/],
];
const SECRET_ENV_KEYS = [
  "GOOGLE_MAPS_API_KEY", "GOOGLE_PLACES_API_KEY", "GOOGLE_PLACES_API_KEY_SERVER",
  "APIFY_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_ANON_KEY", "OPENAI_API_KEY", "GITHUB_TOKEN", "GITHUB_PAT",
  "DEPLOY_HOOK_SECRET", "TWOGIS_API_KEY",
];
const DRIFT_PATHS = Object.freeze([
  "site-caesthetic/assets/js/growth-score-engine.mjs",
  "scripts/caesthetic/growth-score-report-template.mjs",
  "scripts/caesthetic/multi-location-growth-score.mjs",
  "scripts/caesthetic/multi-location-growth-score-view-model.mjs",
  "scripts/caesthetic/render-growth-score.mjs",
]);
const TEST_FILES = Object.freeze([
  "tests/caesthetic/growth-score-engine.test.mjs",
  "tests/caesthetic/growth-score-journey-graph.test.mjs",
  "tests/caesthetic/growth-score-renderer.test.mjs",
  "tests/caesthetic/multi-location-growth-score.test.mjs",
  "tests/caesthetic/growth-score-routing-catalog.test.mjs",
  "tests/caesthetic/growth-score-publish-control-plane.test.mjs",
]);

function invariant(condition, message, code = "invalid_publish_request") {
  if (!condition) throw Object.assign(new TypeError(message), { code });
}

function object(value, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value;
}

function nonEmpty(value, label) {
  invariant(typeof value === "string" && value.trim(), `${label} is required`);
  return value;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function run(command, args, { cwd, env, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (!allowFailure && result.status !== 0) {
    const detail = `${result.stderr || ""}\n${result.stdout || ""}`.trim().slice(-4000);
    throw Object.assign(new Error(`${command}_failed:${detail}`), { code: "publish_command_failed" });
  }
  return result;
}

function git(repo, args, options = {}) {
  return run("git", args, { cwd: repo, ...options });
}

function gitText(repo, args) {
  return git(repo, args).stdout.trim();
}

function readJsonBytes(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw Object.assign(new TypeError(`${label} must be valid JSON`), { code: "invalid_json" });
  }
}

function readJsonFile(file, label = file) {
  return readJsonBytes(fs.readFileSync(file), label);
}

function gitBlob(repo, sha, rel) {
  const result = git(repo, ["show", `${sha}:${rel}`], { allowFailure: true });
  invariant(result.status === 0, `source artifact missing at ${sha}:${rel}`, "source_artifact_missing");
  return Buffer.from(result.stdout, "utf8");
}

function assertSafeArtifactPath(rel, requestId) {
  nonEmpty(rel, "artifact path");
  invariant(toPosix(rel) === rel && !path.isAbsolute(rel) && !rel.includes(".."), `unsafe artifact path: ${rel}`, "path_not_allowlisted");
  invariant(rel.startsWith(`${ARTIFACT_ROOT}/${requestId}/`), `artifact path outside request package: ${rel}`, "path_not_allowlisted");
  invariant(rel.endsWith(".json"), `artifact must be JSON: ${rel}`, "path_not_allowlisted");
  return rel;
}

function assertNoSensitiveKeys(value, label = "artifact") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveKeys(item, `${label}[${index}]`));
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    invariant(!FORBIDDEN_KEY.test(key), `${label}.${key} is forbidden in publication artifacts`, "secret_field_forbidden");
    assertNoSensitiveKeys(nested, `${label}.${key}`);
  }
}

function assertNoSecrets(value) {
  const serialized = JSON.stringify(value);
  for (const [name, pattern] of SECRET_PATTERNS) {
    invariant(!pattern.test(serialized), `secret pattern is forbidden: ${name}`, "secret_field_forbidden");
  }
  for (const key of SECRET_ENV_KEYS) {
    const secret = process.env[key];
    invariant(!secret || secret.length < 8 || !serialized.includes(secret), `runtime secret is forbidden: ${key}`, "secret_field_forbidden");
  }
}

function assertNoCredentialUrls(value, label = "artifact") {
  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    let url;
    try { url = new URL(value); } catch { return; }
    invariant(!url.username && !url.password, `${label} contains URL credentials`, "secret_field_forbidden");
    for (const key of url.searchParams.keys()) {
      invariant(!FORBIDDEN_KEY.test(key), `${label} contains secret-like URL query`, "secret_field_forbidden");
    }
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoCredentialUrls(item, `${label}[${index}]`));
  for (const [key, nested] of Object.entries(value)) assertNoCredentialUrls(nested, `${label}.${key}`);
}

function reportRoute(reportEntry) {
  return `/score/${reportEntry.slug}/`;
}

function validateReportEntry(entry, { requestId, sourceSha, satellite, visibility }) {
  object(entry, "package.reports[]");
  invariant(["single_location", "network_parent", "focus_location"].includes(entry.role), "report role is invalid");
  nonEmpty(entry.slug, "report slug");
  invariant(SLUG.test(entry.slug.split("/").at(-1)) && entry.slug.split("/").every((part) => SLUG.test(part)), `invalid report slug: ${entry.slug}`);
  invariant(!entry.slug.startsWith("/") && !entry.slug.endsWith("/") && !entry.slug.includes(".."), `unsafe report slug: ${entry.slug}`, "path_not_allowlisted");
  if (visibility === "synthetic") invariant(entry.slug.split("/")[0].startsWith("demo-"), "synthetic routes must start with demo-");
  if (visibility === "private") invariant(REAL_SLUG.test(entry.slug.split("/")[0]), "private route parent must be unguessable");
  const approvalPath = assertSafeArtifactPath(entry.approval_path, requestId);
  invariant(SHA256.test(entry.approval_sha256 || ""), "approval_sha256 must be 64 lowercase hex");
  const approvalBytes = gitBlob(satellite, sourceSha, approvalPath);
  invariant(sha256(approvalBytes) === entry.approval_sha256, `approval digest mismatch: ${approvalPath}`, "artifact_digest_mismatch");
  const approval = readJsonBytes(approvalBytes, approvalPath);
  assertNoSecrets(approval);
  assertNoSensitiveKeys(approval);
  assertNoCredentialUrls(approval);
  validateApprovedReportRecord(approval);
  const report = approval.report_json;
  invariant(approval.state === "approved", "approved_report.state must be approved", "human_approval_missing");
  invariant(report.reportState === "approved_report", "reportState must be approved_report", "human_approval_missing");
  invariant(report.schemaVersion === 5, "publication requires schemaVersion=5");
  invariant(report.templateVersion === "growth-score-report-template/5.2.0", "publication requires canonical template 5.2.0");
  invariant(report.journeyGraph?.review?.status === "approved", "journeyGraph review must be approved", "journey_graph_unapproved");
  invariant(report.journeyGraph?.automatic_score_change === false, "journeyGraph automatic_score_change must be false");
  invariant(report.humanDiagnosis?.focus_selection?.supporting_gap_ids?.length === 2, "report requires exactly two Supporting Gaps");
  const focusIds = [report.humanDiagnosis.focus_selection.primary_gap_id, ...report.humanDiagnosis.focus_selection.supporting_gap_ids];
  invariant(new Set(focusIds).size === 3, "report requires exactly one Primary plus two unique Supporting Gaps");
  const digest = sha256(Buffer.from(`${JSON.stringify(report)}\n`));
  invariant(approval.report_digest === `sha256:${digest}`, "approved_report.report_digest must match canonical report JSON", "artifact_digest_mismatch");
  if (visibility === "synthetic") {
    invariant(report.reportKind === "demo", "synthetic publication requires reportKind=demo", "demo_real_spoof_blocked");
    invariant(/synthetic|fictional|demonstration/i.test(report.disclosure || ""), "synthetic report disclosure is required");
    invariant(/no client relationship/i.test(report.disclosure || ""), "synthetic report must disclaim a client relationship");
  } else {
    invariant(report.reportKind === "real", "private publication requires reportKind=real", "demo_real_spoof_blocked");
  }
  return { entry, approval, report, route: reportRoute(entry), approvalPath };
}

export function validatePinnedPackage({ request, requestFile, satellite, canonical }) {
  object(request, "request");
  invariant(request.contract_version === CONTRACT_VERSION, `contract_version must be ${CONTRACT_VERSION}`);
  invariant(request.type === REQUEST_TYPE, `type must be ${REQUEST_TYPE}`);
  invariant(REQUEST_ID.test(request.request_id || ""), "request_id is invalid");
  invariant(path.basename(requestFile, ".json") === request.request_id, "request_id must match filename");
  invariant(SHA40.test(request.source_satellite_sha || ""), "source_satellite_sha must be 40 lowercase hex");
  invariant(SHA256.test(request.package_sha256 || ""), "package_sha256 must be 64 lowercase hex");
  invariant(request.deploy === true, "deploy must be true");
  invariant(!Object.hasOwn(request, "command") && !Object.hasOwn(request, "shell") && !Object.hasOwn(request, "script") && !Object.hasOwn(request, "exec"), "arbitrary execution fields are forbidden");
  assertNoSecrets(request);
  assertNoSensitiveKeys(request);
  assertNoCredentialUrls(request);

  git(satellite, ["cat-file", "-e", `${request.source_satellite_sha}^{commit}`]);
  const ancestry = git(satellite, ["merge-base", "--is-ancestor", request.source_satellite_sha, "origin/main"], { allowFailure: true });
  invariant(ancestry.status === 0, "source_satellite_sha must be an ancestor of satellite main", "source_sha_not_on_main");

  const packagePath = assertSafeArtifactPath(request.package_manifest_path, request.request_id);
  const packageBytes = gitBlob(satellite, request.source_satellite_sha, packagePath);
  invariant(sha256(packageBytes) === request.package_sha256, "package digest mismatch", "artifact_digest_mismatch");
  const packageManifest = readJsonBytes(packageBytes, packagePath);
  object(packageManifest, "package");
  invariant(packageManifest.contract_version === CONTRACT_VERSION, "package contract_version mismatch");
  invariant(packageManifest.request_id === request.request_id, "package request_id mismatch");
  invariant(ALLOWED_FORMATS.has(packageManifest.audit_format), "package audit_format is invalid");
  invariant(ALLOWED_VISIBILITY.has(packageManifest.visibility), "package visibility is invalid");
  invariant(["create", "republish"].includes(packageManifest.operation), "package operation is invalid");
  nonEmpty(packageManifest.project_id, "package.project_id");
  assertNoSecrets(packageManifest);
  assertNoSensitiveKeys(packageManifest);
  assertNoCredentialUrls(packageManifest);
  if (packageManifest.visibility === "private") nonEmpty(packageManifest.access_group_id, "package.access_group_id");
  else invariant(packageManifest.access_group_id == null, "synthetic packages cannot declare access_group_id");

  for (const rel of DRIFT_PATHS) {
    const sourceBytes = gitBlob(satellite, request.source_satellite_sha, rel);
    const canonicalBytes = fs.readFileSync(path.join(canonical, rel));
    invariant(sha256(sourceBytes) === sha256(canonicalBytes), `renderer drift: ${rel}`, "renderer_drift");
  }

  invariant(Array.isArray(packageManifest.reports), "package.reports must be an array");
  if (packageManifest.audit_format === "single_location") {
    invariant(packageManifest.reports.length === 1 && packageManifest.reports[0]?.role === "single_location", "single_location requires exactly one standalone report");
  } else {
    invariant(packageManifest.reports.length === 2, "multi_location requires exactly two reports");
    invariant(packageManifest.reports.some((entry) => entry.role === "network_parent"), "multi_location network_parent is required");
    invariant(packageManifest.reports.some((entry) => entry.role === "focus_location"), "multi_location focus_location is required");
  }

  const reports = packageManifest.reports.map((entry) => validateReportEntry(entry, {
    requestId: request.request_id,
    sourceSha: request.source_satellite_sha,
    satellite,
    visibility: packageManifest.visibility,
  }));
  invariant(new Set(reports.map((item) => item.entry.slug)).size === reports.length, "duplicate report slug");
  reports.forEach(({ report }) => {
    const auditFormat = report.audit?.format ?? "single_location";
    invariant(auditFormat === packageManifest.audit_format, "report audit format does not match package");
    const reportProject = report.audit?.project_id ?? packageManifest.project_id;
    invariant(reportProject === packageManifest.project_id, "report project_id does not match package");
    if (packageManifest.visibility === "private") invariant(report.audit?.access_group_id === packageManifest.access_group_id, "report access_group_id does not match package");
  });
  if (packageManifest.visibility === "private") {
    let accessConfig = {};
    let smokePasswords = {};
    try { accessConfig = JSON.parse(process.env.CAESTHETIC_SCORE_ACCESS_CONFIG || "{}"); } catch { /* fail below */ }
    try { smokePasswords = JSON.parse(process.env.CAESTHETIC_SCORE_PUBLISH_PASSWORDS || "{}"); } catch { /* fail below */ }
    const group = (accessConfig.access_groups || []).find((entry) => entry?.access_group_id === packageManifest.access_group_id);
    invariant(group && [group.salt, group.password_hash, group.session_secret].every((value) => typeof value === "string" && value), `access group is not provisioned: ${packageManifest.access_group_id}`, "access_group_unprovisioned");
    invariant(typeof smokePasswords[packageManifest.access_group_id] === "string" && smokePasswords[packageManifest.access_group_id], `protected smoke password is not provisioned: ${packageManifest.access_group_id}`, "access_group_unprovisioned");
  }
  if (packageManifest.audit_format === "multi_location") {
    const parent = reports.find((item) => item.entry.role === "network_parent");
    const child = reports.find((item) => item.entry.role === "focus_location");
    validateMultiLocationPackage(parent.report, child.report);
    invariant(parent.report.audit.parent_route === parent.route, "network parent route does not match requested slug");
    invariant(parent.report.audit.child_route === child.route, "focus child route does not match requested slug");
    invariant(child.report.audit.parent_route === parent.route && child.report.audit.child_route === child.route, "multi_location navigation routes do not match package");
  }
  return { request, packageManifest, reports, packagePath };
}

function checkExistingTargets(canonical, validated) {
  for (const { report, entry } of validated.reports) {
    const target = path.join(canonical, "site-caesthetic/score", entry.slug, "report.json");
    if (!fs.existsSync(target)) {
      invariant(validated.packageManifest.operation === "create", `republish target does not exist: ${entry.slug}`);
      continue;
    }
    invariant(validated.packageManifest.operation === "republish", `create target already exists: ${entry.slug}`);
    const current = readJsonFile(target);
    invariant(current.reportKind === report.reportKind, "republish cannot change demo/real class", "demo_real_spoof_blocked");
    invariant((current.audit?.project_id ?? validated.packageManifest.project_id) === validated.packageManifest.project_id, "republish cannot change project_id");
  }
}

function writeCanonicalArtifacts(canonical, validated) {
  checkExistingTargets(canonical, validated);
  const written = [];
  const reviewerTokens = new Set();
  for (const { report, approval, entry } of validated.reports) {
    const directory = path.join(canonical, "site-caesthetic/score", entry.slug);
    fs.mkdirSync(directory, { recursive: true });
    const reportPath = path.join(directory, "report.json");
    const htmlPath = path.join(directory, "index.html");
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    const html = renderGrowthReport(report);
    for (const token of [approval.approved_by, report.humanDiagnosis?.focus_selection?.selected_by, report.journeyGraph?.review?.reviewed_by].filter(Boolean)) reviewerTokens.add(token);
    for (const token of reviewerTokens) invariant(!html.includes(token), `reviewer attribution leaked to client HTML: ${token}`, "client_html_privacy_failure");
    FORBIDDEN_HTML.forEach((pattern) => invariant(!pattern.test(html), `forbidden client HTML marker: ${pattern}`, "client_html_privacy_failure"));
    invariant(/noindex,nofollow,noarchive,nosnippet/.test(html), "report HTML must be noindex");
    if (validated.packageManifest.visibility === "synthetic") invariant(/SYNTHETIC DEMO/.test(html), "synthetic HTML marker missing");
    fs.writeFileSync(htmlPath, html);
    written.push(toPosix(path.relative(canonical, reportPath)), toPosix(path.relative(canonical, htmlPath)));
  }

  if (validated.packageManifest.visibility === "private") {
    const manifestPath = path.join(canonical, "infra/cloudflare/brands/caesthetic.manifest.json");
    const manifest = readJsonFile(manifestPath);
    const entries = Array.isArray(manifest.scoreProtectedPaths) ? manifest.scoreProtectedPaths : [];
    for (const { route } of validated.reports) {
      const existing = entries.find((item) => item.prefix === route);
      invariant(!existing || existing.accessGroupId === validated.packageManifest.access_group_id, `protected route collision: ${route}`);
      if (!existing) entries.push({ prefix: route, accessGroupId: validated.packageManifest.access_group_id });
    }
    manifest.scoreProtectedPaths = entries.sort((a, b) => a.prefix.localeCompare(b.prefix));
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    written.push("infra/cloudflare/brands/caesthetic.manifest.json");
  }

  const catalog = writeGrowthScoreProjectCatalog({ repoRoot: canonical });
  written.push(...catalog.changed);
  run("node", ["scripts/caesthetic/render-growth-score.mjs", "--check"], { cwd: canonical });
  run("node", ["scripts/caesthetic/growth-score-project-catalog.mjs", "--check"], { cwd: canonical });
  run("node", ["--test", ...TEST_FILES], { cwd: canonical });
  const sitemap = fs.readFileSync(path.join(canonical, "site-caesthetic/sitemap.xml"), "utf8");
  validated.reports.forEach(({ route }) => invariant(!sitemap.includes(route), `private/noindex report leaked into sitemap: ${route}`));
  return [...new Set(written)].sort();
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function commitPush(repo, paths, message) {
  git(repo, ["add", "-A", "--", ...paths]);
  const diff = git(repo, ["diff", "--cached", "--quiet"], { allowFailure: true });
  if (diff.status === 0) return gitText(repo, ["rev-parse", "HEAD"]);
  invariant(diff.status === 1, "unable to inspect staged publication diff");
  git(repo, ["-c", "user.name=CAESTHETIC Publish Bridge", "-c", "user.email=publish-bridge@caesthetic.com", "commit", "-m", message]);
  const firstPush = git(repo, ["push", "origin", "HEAD:main"], { allowFailure: true });
  if (firstPush.status !== 0) {
    git(repo, ["fetch", "origin", "main", "-q"]);
    git(repo, ["rebase", "origin/main"]);
    git(repo, ["push", "origin", "HEAD:main"]);
  }
  return gitText(repo, ["rev-parse", "HEAD"]);
}

function canonicalRecordPath(canonical, requestId) {
  return path.join(canonical, CANONICAL_RECORD_ROOT, `${requestId}.json`);
}

function resultPath(satellite, requestId) {
  return path.join(satellite, RESULT_ROOT, `${requestId}.json`);
}

export function assertSameIdempotencyPayload(result, request) {
  invariant(
    result.source_satellite_sha === request.source_satellite_sha
      && result.package_sha256 === request.package_sha256,
    "request_id already used by different payload",
    "idempotency_conflict",
  );
  return result;
}

function failureResultFromRequest(request, requestId, error) {
  return {
    contract_version: CONTRACT_VERSION,
    request_id: requestId,
    type: REQUEST_TYPE,
    status: "error",
    source_satellite_sha: SHA40.test(request?.source_satellite_sha || "") ? request.source_satellite_sha : null,
    package_sha256: SHA256.test(request?.package_sha256 || "") ? request.package_sha256 : null,
    canonical_imported_sha: null,
    deployed_sha: null,
    live_urls: [],
    smoke: { ok: false, checks: [] },
    errors: [{ code: error.code || "publish_failed", message: String(error.message).slice(0, 1200) }],
    updated_at: new Date().toISOString(),
  };
}

function cleanUncommittedImport(canonical, validated) {
  const targets = [
    ...validated.reports.map(({ entry }) => `site-caesthetic/score/${entry.slug}`),
    "site-caesthetic/score/catalog.json",
    "site-caesthetic/score/index.html",
    "docs/audits/caesthetic/growth-score-projects.generated.json",
    "infra/cloudflare/brands/caesthetic.manifest.json",
    `${CANONICAL_RECORD_ROOT}/${validated.request.request_id}.json`,
  ];
  const tracked = [...new Set(targets.flatMap((rel) => gitText(canonical, ["ls-files", "--", rel]).split("\n").filter(Boolean)))];
  if (tracked.length) git(canonical, ["restore", "--staged", "--worktree", "--", ...tracked], { allowFailure: true });
  git(canonical, ["clean", "-fd", "--", ...targets], { allowFailure: true });
}

function makeResult(validated, status, extra = {}) {
  return {
    contract_version: CONTRACT_VERSION,
    request_id: validated.request.request_id,
    type: REQUEST_TYPE,
    status,
    source_satellite_sha: validated.request.source_satellite_sha,
    package_sha256: validated.request.package_sha256,
    audit_format: validated.packageManifest.audit_format,
    project_id: validated.packageManifest.project_id,
    visibility: validated.packageManifest.visibility,
    live_urls: validated.reports.map(({ route }) => `https://caesthetic.com${route}`),
    updated_at: new Date().toISOString(),
    ...extra,
  };
}

function syncRepoMain(repo) {
  git(repo, ["fetch", "origin", "main", "-q"]);
  invariant(!gitText(repo, ["status", "--porcelain"]), `dirty checkout: ${repo}`, "dirty_checkout");
  git(repo, ["checkout", "main"]);
  git(repo, ["merge", "--ff-only", "origin/main"]);
}

function deployCanonical(canonical, importedSha) {
  const result = run("bash", ["scripts/caesthetic/publish-growth-score-deploy.sh", importedSha], {
    cwd: canonical,
    env: { REPO_ROOT: canonical },
    allowFailure: true,
  });
  invariant(result.status === 0, `publication deploy failed: ${(result.stderr || result.stdout || "").slice(-3000)}`, "deploy_failed");
  return { output: `${result.stdout || ""}\n${result.stderr || ""}`.trim().slice(-6000) };
}

function smokeLive(validated) {
  const checks = [];
  for (const { route } of validated.reports) {
    const url = `https://caesthetic.com${route}`;
    const response = run("curl", ["-sS", "-D", "-", "--max-time", "30", url], { allowFailure: true });
    invariant(response.status === 0, `live smoke request failed: ${url}`, "smoke_failed");
    const raw = response.stdout;
    const status = Number(raw.match(/^HTTP\/\S+\s+(\d+)/m)?.[1] || 0);
    if (validated.packageManifest.visibility === "synthetic") {
      invariant(status === 200 && /SYNTHETIC DEMO/.test(raw) && /noindex,nofollow,noarchive,nosnippet/.test(raw), `synthetic live smoke failed: ${url}`, "smoke_failed");
      checks.push({ url, status, ok: true, mode: "synthetic_noindex" });
    } else {
      invariant(status === 200 && /Закрытый Growth Score/.test(raw), `private unauthenticated gate failed: ${url}`, "smoke_failed");
      const wrong = run("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "30", "-X", "POST", "--data", "password=definitely-wrong-publication-smoke", url], { allowFailure: true });
      invariant(wrong.status === 0 && wrong.stdout.trim() === "401", `private wrong-password smoke failed: ${url}`, "smoke_failed");
      const passwords = JSON.parse(process.env.CAESTHETIC_SCORE_PUBLISH_PASSWORDS || "{}");
      const password = passwords[validated.packageManifest.access_group_id];
      invariant(typeof password === "string" && password, `private valid-session smoke password is unavailable for ${validated.packageManifest.access_group_id}`, "access_group_unprovisioned");
      const cookie = path.join(os.tmpdir(), `cae-score-cookie-${process.pid}.txt`);
      try {
        const login = run("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "-c", cookie, "--max-time", "30", "-X", "POST", "--data-urlencode", `password=${password}`, url], { allowFailure: true });
        invariant(login.status === 0 && login.stdout.trim() === "303", `private valid-password smoke failed: ${url}`, "smoke_failed");
        const auth = run("curl", ["-sS", "-b", cookie, "-D", "-", "--max-time", "30", url], { allowFailure: true });
        invariant(auth.status === 0 && /^HTTP\/\S+\s+200/m.test(auth.stdout) && /data-report-kind="real"/.test(auth.stdout), `private authenticated report smoke failed: ${url}`, "smoke_failed");
      } finally {
        try { fs.unlinkSync(cookie); } catch { /* absent */ }
      }
      checks.push({ url, status, wrong_password_status: 401, valid_session_status: 200, ok: true, mode: "protected" });
    }
  }
  return checks;
}

export function processRequest({ canonical, satellite, requestFile, noDeploy = false }) {
  syncRepoMain(canonical);
  syncRepoMain(satellite);
  const absoluteRequest = path.isAbsolute(requestFile) ? requestFile : path.join(satellite, requestFile);
  const request = readJsonFile(absoluteRequest, requestFile);
  const fallbackId = path.basename(requestFile, ".json");
  const requestId = REQUEST_ID.test(request.request_id || "") ? request.request_id : fallbackId;
  invariant(REQUEST_ID.test(requestId), "request filename is not a safe publication id");
  const existingResult = resultPath(satellite, requestId);
  if (fs.existsSync(existingResult)) {
    const result = readJsonFile(existingResult);
    return assertSameIdempotencyPayload(result, request);
  }
  let validated;
  try {
    validated = validatePinnedPackage({ request, requestFile: absoluteRequest, satellite, canonical });
  } catch (error) {
    const failure = failureResultFromRequest(request, requestId, error);
    writeJson(existingResult, failure);
    commitPush(satellite, [toPosix(path.relative(satellite, existingResult))], `chore(caesthetic): publish error ${requestId}`);
    throw error;
  }
  const canonicalRecord = canonicalRecordPath(canonical, request.request_id);
  let record = fs.existsSync(canonicalRecord) ? readJsonFile(canonicalRecord) : null;
  let importedSha = record?.canonical_imported_sha || null;
  try {
    if (!record) {
      const written = writeCanonicalArtifacts(canonical, validated);
      record = makeResult(validated, "imported", {
        canonical_imported_sha: null,
        deployed_sha: null,
        imported_paths: written,
        validation: { ok: true, renderer_drift: false, canonical_tests: "passed" },
        smoke: { ok: false, checks: [] },
      });
      writeJson(canonicalRecord, record);
      written.push(toPosix(path.relative(canonical, canonicalRecord)));
      importedSha = commitPush(canonical, written, `feat(caesthetic): publish Growth Score ${request.request_id}`);
      record.canonical_imported_sha = importedSha;
    } else {
      invariant(record.source_satellite_sha === request.source_satellite_sha && record.package_sha256 === request.package_sha256, "request_id already used by different payload", "idempotency_conflict");
      if (record.status === "success") {
        writeJson(existingResult, record);
        commitPush(satellite, [toPosix(path.relative(satellite, existingResult))], `chore(caesthetic): publish result ${request.request_id}`);
        return record;
      }
      importedSha = record.canonical_imported_sha || gitText(canonical, ["log", "-1", "--format=%H", "--", toPosix(path.relative(canonical, canonicalRecord))]);
      invariant(SHA40.test(importedSha || ""), "unable to recover canonical imported SHA", "idempotency_state_invalid");
    }
    if (noDeploy) return { ...record, status: "validated_no_deploy" };
    deployCanonical(canonical, importedSha);
    const checks = smokeLive(validated);
    const success = makeResult(validated, "success", {
      canonical_imported_sha: importedSha,
      deployed_sha: importedSha,
      imported_paths: record.imported_paths,
      validation: record.validation,
      smoke: { ok: true, checked_at: new Date().toISOString(), checks },
    });
    writeJson(canonicalRecord, success);
    commitPush(canonical, [toPosix(path.relative(canonical, canonicalRecord))], `chore(caesthetic): record publish success ${request.request_id} [skip ci]`);
    writeJson(existingResult, success);
    commitPush(satellite, [toPosix(path.relative(satellite, existingResult))], `chore(caesthetic): publish result ${request.request_id}`);
    return success;
  } catch (error) {
    if (!importedSha) cleanUncommittedImport(canonical, validated);
    const failure = makeResult(validated, "error", {
      canonical_imported_sha: importedSha,
      deployed_sha: null,
      smoke: { ok: false, checks: [] },
      errors: [{ code: error.code || "publish_failed", message: String(error.message).slice(0, 1200) }],
    });
    writeJson(existingResult, failure);
    commitPush(satellite, [toPosix(path.relative(satellite, existingResult))], `chore(caesthetic): publish error ${request.request_id}`);
    throw error;
  }
}

export function pendingRequestFiles(satellite) {
  const requestDirectory = path.join(satellite, REQUEST_ROOT);
  if (!fs.existsSync(requestDirectory)) return [];
  return fs.readdirSync(requestDirectory)
    .filter((name) => name.endsWith(".json") && !name.startsWith("TEMPLATE") && !name.startsWith("."))
    .filter((name) => !fs.existsSync(path.join(satellite, RESULT_ROOT, name)))
    .map((name) => path.join(requestDirectory, name))
    .sort();
}

export function poll({ canonical, satellite, noDeploy = false }) {
  const files = pendingRequestFiles(satellite);
  const results = [];
  for (const requestFile of files) results.push(processRequest({ canonical, satellite, requestFile, noDeploy }));
  return results;
}

export function sealPackage({ repository, packagePath }) {
  const absolutePackage = path.resolve(repository, packagePath);
  const packageManifest = readJsonFile(absolutePackage, packagePath);
  invariant(packageManifest.contract_version === CONTRACT_VERSION, `package contract_version must be ${CONTRACT_VERSION}`);
  invariant(REQUEST_ID.test(packageManifest.request_id || ""), "package.request_id is invalid");
  invariant(Array.isArray(packageManifest.reports) && packageManifest.reports.length > 0, "package.reports is required");
  for (const entry of packageManifest.reports) {
    const approvalPath = assertSafeArtifactPath(entry.approval_path, packageManifest.request_id);
    const absoluteApproval = path.resolve(repository, approvalPath);
    const approval = readJsonFile(absoluteApproval, approvalPath);
    object(approval.report_json, "approved_report.report_json");
    approval.report_digest = `sha256:${sha256(Buffer.from(`${JSON.stringify(approval.report_json)}\n`))}`;
    writeJson(absoluteApproval, approval);
    entry.approval_sha256 = sha256(fs.readFileSync(absoluteApproval));
  }
  writeJson(absolutePackage, packageManifest);
  return { package_path: toPosix(path.relative(repository, absolutePackage)), package_sha256: sha256(fs.readFileSync(absolutePackage)) };
}

export function createRequest({ repository, packagePath }) {
  const rel = toPosix(path.relative(repository, path.resolve(repository, packagePath)));
  const packageManifest = readJsonFile(path.resolve(repository, packagePath), packagePath);
  invariant(REQUEST_ID.test(packageManifest.request_id || ""), "package.request_id is invalid");
  invariant(rel.startsWith(`${ARTIFACT_ROOT}/${packageManifest.request_id}/`), "package must live in its request artifact directory");
  invariant(!gitText(repository, ["status", "--porcelain"]), "commit the sealed artifact package before creating a request");
  const sourceSha = gitText(repository, ["rev-parse", "HEAD"]);
  const remoteSha = gitText(repository, ["rev-parse", "origin/main"]);
  invariant(sourceSha === remoteSha, "push the sealed artifact commit to satellite main before creating a request", "source_sha_not_on_main");
  const bytes = gitBlob(repository, sourceSha, rel);
  const request = {
    contract_version: CONTRACT_VERSION,
    request_id: packageManifest.request_id,
    type: REQUEST_TYPE,
    created_at: new Date().toISOString(),
    requested_by: "caesthetic-repository-agent",
    source_satellite_sha: sourceSha,
    package_manifest_path: rel,
    package_sha256: sha256(bytes),
    deploy: true,
  };
  const target = path.join(repository, REQUEST_ROOT, `${packageManifest.request_id}.json`);
  invariant(!fs.existsSync(target), `request already exists: ${target}`);
  writeJson(target, request);
  return { request_path: toPosix(path.relative(repository, target)), source_satellite_sha: sourceSha, package_sha256: request.package_sha256 };
}

function parseArgs(argv) {
  const command = argv[0] || "poll";
  const take = (name, fallback) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    command,
    canonical: path.resolve(take("--grainee", process.env.GRAINEE_ROOT || "/var/lib/caesthetic-repo-sync/grainee")),
    satellite: path.resolve(take("--satellite", process.env.CAESTHETIC_AGENTS_DIR || "/var/lib/caesthetic-repo-sync/satellite")),
    requestFile: take("--request", null),
    packagePath: take("--package", null),
    noDeploy: argv.includes("--no-deploy"),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let result;
  if (args.command === "process") {
    invariant(args.requestFile, "process requires --request");
    result = processRequest(args);
  } else if (args.command === "poll") result = poll(args);
  else if (args.command === "seal") {
    invariant(args.packagePath, "seal requires --package");
    result = sealPackage({ repository: args.satellite, packagePath: args.packagePath });
  } else if (args.command === "request") {
    invariant(args.packagePath, "request requires --package");
    result = createRequest({ repository: args.satellite, packagePath: args.packagePath });
  }
  else throw new Error(`unknown command: ${args.command}`);
  process.stdout.write(`${JSON.stringify({ ok: true, result }, null, 2)}\n`);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  try { main(); } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, code: error.code || "publish_failed", error: error.message })}\n`);
    process.exit(1);
  }
}
