import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  ARTIFACT_ROOT,
  CONTRACT_VERSION,
  REQUEST_TYPE,
  assertSameIdempotencyPayload,
  validatePinnedPackage,
} from "../../scripts/caesthetic/publish-growth-score-control-plane.mjs";
import { packageFixture } from "./multi-location-growth-score.test.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const driftPaths = [
  "site-caesthetic/assets/js/growth-score-engine.mjs",
  "scripts/caesthetic/growth-score-report-template.mjs",
  "scripts/caesthetic/multi-location-growth-score.mjs",
  "scripts/caesthetic/multi-location-growth-score-view-model.mjs",
  "scripts/caesthetic/render-growth-score.mjs",
];
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function copyFileTree(sourceRoot, targetRoot, rel) {
  const target = path.join(targetRoot, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, rel), target);
}

function approvedRecord(report, seed = 1) {
  const uuid = (n) => `00000000-0000-4000-8000-${String(seed * 10 + n).padStart(12, "0")}`;
  return {
    record_type: "approved_report",
    id: uuid(1),
    created_at: report.humanDiagnosis.reviewer.approved_at,
    score_case_id: uuid(2),
    draft_id: uuid(3),
    verified_fact_set_id: uuid(4),
    focus_selection_id: uuid(5),
    state: "approved",
    report_version: report.reportVersion,
    verified_fact_set_version: report.verifiedFactSetVersion,
    report_digest: `sha256:${hash(Buffer.from(`${JSON.stringify(report)}\n`))}`,
    approved_by: report.humanDiagnosis.reviewer.name,
    approved_at: report.humanDiagnosis.reviewer.approved_at,
    report_json: report,
  };
}

function makeRepos(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "cae-publish-control-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const canonical = path.join(temp, "canonical");
  const satellite = path.join(temp, "satellite");
  const bare = path.join(temp, "satellite.git");
  fs.mkdirSync(canonical, { recursive: true });
  fs.mkdirSync(satellite, { recursive: true });
  driftPaths.forEach((rel) => {
    copyFileTree(root, canonical, rel);
    copyFileTree(root, satellite, rel);
  });
  execFileSync("git", ["init", "-b", "main"], { cwd: satellite });
  execFileSync("git", ["config", "user.name", "Test"] , { cwd: satellite });
  execFileSync("git", ["config", "user.email", "test@example.test"], { cwd: satellite });
  execFileSync("git", ["init", "--bare", bare]);
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: satellite });
  return { canonical, satellite };
}

function commitPackage({ canonical, satellite, requestId, packageManifest, approvals }) {
  const artifactDir = path.join(satellite, ARTIFACT_ROOT, requestId);
  fs.mkdirSync(artifactDir, { recursive: true });
  packageManifest.reports.forEach((entry, index) => {
    const approvalBytes = Buffer.from(json(approvals[index]));
    fs.writeFileSync(path.join(satellite, entry.approval_path), approvalBytes);
    entry.approval_sha256 = hash(approvalBytes);
  });
  const packagePath = path.join(artifactDir, "package.json");
  const packageBytes = Buffer.from(json(packageManifest));
  fs.writeFileSync(packagePath, packageBytes);
  execFileSync("git", ["add", "."], { cwd: satellite });
  execFileSync("git", ["commit", "-m", "test package"], { cwd: satellite });
  execFileSync("git", ["push", "-u", "origin", "main"], { cwd: satellite });
  const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: satellite, encoding: "utf8" }).trim();
  const requestFile = path.join(satellite, `${requestId}.json`);
  const request = {
    contract_version: CONTRACT_VERSION,
    request_id: requestId,
    type: REQUEST_TYPE,
    created_at: "2026-09-02T22:00:00Z",
    requested_by: "test-agent",
    source_satellite_sha: sourceSha,
    package_manifest_path: `${ARTIFACT_ROOT}/${requestId}/package.json`,
    package_sha256: hash(packageBytes),
    deploy: true,
  };
  fs.writeFileSync(requestFile, json(request));
  return { request, requestFile, sourceSha, canonical, satellite };
}

test("accepts a pinned approved schema-v5 single-location synthetic package", (t) => {
  const repos = makeRepos(t);
  const report = JSON.parse(fs.readFileSync(path.join(root, "site-caesthetic/score/demo-injector-practice-booking-friction/report.json"), "utf8"));
  report.audit = { format: "single_location", project_id: "publish-control-single" };
  const requestId = "publish-growth-score-control-single-20260902";
  const approvalPath = `${ARTIFACT_ROOT}/${requestId}/approved-report.json`;
  const packageManifest = {
    contract_version: CONTRACT_VERSION,
    request_id: requestId,
    operation: "create",
    audit_format: "single_location",
    visibility: "synthetic",
    project_id: "publish-control-single",
    access_group_id: null,
    reports: [{ role: "single_location", slug: "demo-control-plane-single", approval_path: approvalPath, approval_sha256: "" }],
  };
  const input = commitPackage({ ...repos, requestId, packageManifest, approvals: [approvedRecord(report)] });
  const validated = validatePinnedPackage(input);
  assert.equal(validated.packageManifest.audit_format, "single_location");
  assert.equal(validated.reports.length, 1);
  assert.equal(validated.reports[0].route, "/score/demo-control-plane-single/");
});

test("accepts one atomic Multi-Location parent and focus child package", (t) => {
  const repos = makeRepos(t);
  const { parent, child } = packageFixture();
  const graphSource = JSON.parse(fs.readFileSync(path.join(root, "site-caesthetic/score/demo-injector-practice-booking-friction/report.json"), "utf8"));
  parent.journeyGraph = structuredClone(graphSource.journeyGraph);
  child.journeyGraph = structuredClone(graphSource.journeyGraph);
  parent.journeyGraph.artifact_id = "publish-control-network-parent-journey";
  child.journeyGraph.artifact_id = "publish-control-network-focus-journey";
  parent.audit.project_id = child.audit.project_id = "publish-control-network";
  parent.audit.parent_route = child.audit.parent_route = "/score/demo-control-plane-network/";
  parent.audit.child_route = child.audit.child_route = "/score/demo-control-plane-network/focus-location/";
  const requestId = "publish-growth-score-control-network-20260902";
  const parentApproval = `${ARTIFACT_ROOT}/${requestId}/approved-parent.json`;
  const childApproval = `${ARTIFACT_ROOT}/${requestId}/approved-focus.json`;
  const packageManifest = {
    contract_version: CONTRACT_VERSION,
    request_id: requestId,
    operation: "create",
    audit_format: "multi_location",
    visibility: "synthetic",
    project_id: "publish-control-network",
    access_group_id: null,
    reports: [
      { role: "network_parent", slug: "demo-control-plane-network", approval_path: parentApproval, approval_sha256: "" },
      { role: "focus_location", slug: "demo-control-plane-network/focus-location", approval_path: childApproval, approval_sha256: "" },
    ],
  };
  const input = commitPackage({ ...repos, requestId, packageManifest, approvals: [approvedRecord(parent, 2), approvedRecord(child, 3)] });
  const validated = validatePinnedPackage(input);
  assert.equal(validated.packageManifest.audit_format, "multi_location");
  assert.deepEqual(validated.reports.map((item) => item.entry.role), ["network_parent", "focus_location"]);
});

test("rejects draft approval, demo-to-real spoofing, renderer drift and arbitrary artifact paths", (t) => {
  const report = JSON.parse(fs.readFileSync(path.join(root, "site-caesthetic/score/demo-injector-practice-booking-friction/report.json"), "utf8"));
  report.audit = { format: "single_location", project_id: "publish-control-deny" };
  const cases = [
    { name: "draft", mutateApproval: (approval) => { approval.state = "draft"; }, expected: /state must be approved/ },
    { name: "real-spoof", mutatePackage: (pkg) => { pkg.visibility = "private"; pkg.access_group_id = "not-provisioned"; pkg.reports[0].slug = "private-spoof-0123456789abcdef"; }, expected: /reportKind=real/ },
    { name: "arbitrary-path", mutatePackage: (pkg) => { pkg.reports[0].approval_path = "site-caesthetic/index.html"; }, expected: /outside request package/ },
    { name: "secret-field", mutatePackage: (pkg) => { pkg.api_key = "forbidden-even-if-not-a-real-key"; }, expected: /api_key is forbidden/ },
  ];
  for (const [index, item] of cases.entries()) {
    const repos = makeRepos(t);
    const requestId = `publish-growth-score-deny-${item.name}-20260902`;
    const approval = approvedRecord(structuredClone(report), index + 4);
    item.mutateApproval?.(approval);
    const packageManifest = {
      contract_version: CONTRACT_VERSION,
      request_id: requestId,
      operation: "create",
      audit_format: "single_location",
      visibility: "synthetic",
      project_id: "publish-control-deny",
      access_group_id: null,
      reports: [{ role: "single_location", slug: `demo-deny-${item.name}`, approval_path: `${ARTIFACT_ROOT}/${requestId}/approved.json`, approval_sha256: "" }],
    };
    item.mutatePackage?.(packageManifest);
    const input = commitPackage({ ...repos, requestId, packageManifest, approvals: [approval] });
    assert.throws(() => validatePinnedPackage(input), item.expected);
  }

  const repos = makeRepos(t);
  fs.appendFileSync(path.join(repos.canonical, driftPaths[0]), "\n// drift\n");
  const requestId = "publish-growth-score-deny-renderer-drift-20260902";
  const packageManifest = {
    contract_version: CONTRACT_VERSION,
    request_id: requestId,
    operation: "create",
    audit_format: "single_location",
    visibility: "synthetic",
    project_id: "publish-control-deny",
    access_group_id: null,
    reports: [{ role: "single_location", slug: "demo-deny-renderer-drift", approval_path: `${ARTIFACT_ROOT}/${requestId}/approved.json`, approval_sha256: "" }],
  };
  const input = commitPackage({ ...repos, requestId, packageManifest, approvals: [approvedRecord(report, 9)] });
  assert.throws(() => validatePinnedPackage(input), /renderer drift/);
});

test("idempotency accepts an exact replay and rejects request-id payload reuse", () => {
  const request = { source_satellite_sha: "a".repeat(40), package_sha256: "b".repeat(64) };
  assert.equal(assertSameIdempotencyPayload({ ...request, status: "success" }, request).status, "success");
  assert.throws(
    () => assertSameIdempotencyPayload({ ...request, package_sha256: "c".repeat(64) }, request),
    (error) => error.code === "idempotency_conflict",
  );
});

test("server timer uses one lock and a fixed publication command without paid Actions", () => {
  const runner = fs.readFileSync(path.join(root, "scripts/caesthetic/continuous-sync-runner.sh"), "utf8");
  const service = fs.readFileSync(path.join(root, "deploy/systemd/caesthetic-repo-sync.service"), "utf8");
  const workflowPath = path.join(root, ".github/workflows/agent-api-bridge.yml");
  assert.match(runner, /publish-growth-score-control-plane\.mjs" poll/);
  assert.match(runner, /flock -n "\$LOCK"/);
  assert.match(service, /TimeoutStartSec=1800/);
  if (fs.existsSync(workflowPath)) {
    assert.doesNotMatch(fs.readFileSync(workflowPath, "utf8"), /caesthetic_growth_score_publish/);
  }
});
