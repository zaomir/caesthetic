#!/usr/bin/env node
/** Fixed VPS2402 bootstrap/status bridge for the DEC-829 repository timer. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { validateCaestheticRepoSyncRequest } from "../caesthetic-repo-sync-contract.mjs";
import { assertCanonicalAgentHost, assertRequestId, runtimeHostInfo } from "./allowlist.mjs";

function execute(command, args, { cwd, timeout = 600_000 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout,
    env: { ...process.env, REPO_ROOT: cwd },
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = `${result.stderr || ""}\n${result.stdout || ""}`.trim().slice(-2000);
    throw Object.assign(new Error(`${path.basename(command)}_failed:${detail}`), { code: "repo_sync_command_failed" });
  }
  return `${result.stdout || ""}\n${result.stderr || ""}`.trim().slice(-4000);
}

export function markRepoSyncProcessing({ request, outputPath }) {
  const requestId = assertRequestId(request.request_id);
  const host = runtimeHostInfo();
  const result = {
    contract_version: "caesthetic-repo-sync/1.0",
    request_id: requestId,
    type: "caesthetic_repo_sync",
    operation: request.operation,
    status: "processing",
    worker: { host: host.hostname, started_at: new Date().toISOString() },
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return outputPath;
}

export function writeRepoSyncFailure({ request, outputPath, error }) {
  const host = runtimeHostInfo();
  const result = {
    contract_version: "caesthetic-repo-sync/1.0",
    request_id: assertRequestId(request.request_id),
    type: "caesthetic_repo_sync",
    operation: request.operation,
    status: "error",
    worker: { host: host.hostname, completed_at: new Date().toISOString() },
    errors: [{ code: error.code || "repo_sync_failed", message: String(error.message || error).slice(0, 2000) }],
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return outputPath;
}

export function runRepoSyncBridge({ request, outputPath, repoRoot }) {
  const requestId = assertRequestId(request.request_id);
  if (!validateCaestheticRepoSyncRequest(request)) {
    throw Object.assign(new TypeError("invalid caesthetic_repo_sync request"), { code: "invalid_repo_sync_request" });
  }
  const host = assertCanonicalAgentHost();
  let output;
  if (request.operation === "install_and_start") {
    output = execute("bash", ["scripts/caesthetic/install-continuous-sync.sh"], { cwd: repoRoot });
  } else if (request.operation === "run_once") {
    output = execute("bash", ["/opt/caesthetic-repo-sync/continuous-sync-runner.sh"], { cwd: repoRoot });
  } else {
    output = execute("systemctl", ["is-active", "caesthetic-repo-sync.timer"], { cwd: repoRoot, timeout: 30_000 });
  }
  const result = {
    contract_version: "caesthetic-repo-sync/1.0",
    request_id: requestId,
    type: "caesthetic_repo_sync",
    operation: request.operation,
    status: "success",
    source_sha: execute("git", ["rev-parse", "HEAD"], { cwd: repoRoot, timeout: 30_000 }).trim(),
    worker: { host: host.hostname, completed_at: new Date().toISOString() },
    evidence: output,
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return outputPath;
}
