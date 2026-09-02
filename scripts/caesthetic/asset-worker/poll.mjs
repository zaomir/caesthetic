#!/usr/bin/env node
/**
 * Poll origin/main for ChatGPT caesthetic_assets requests without results.
 * Intended for VPS2402 cron only (DEC-836). Uses flock via poll.sh.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { REPO_ROOT, STORAGE_PATH, assertCanonicalAgentHost, assertRequestId, runtimeHostInfo } from "./allowlist.mjs";
import { cmdBridge, markBridgeProcessing } from "./worker.mjs";
import { cmdVideoBridge, markVideoProcessing, supportsVideoOperation } from "./video-worker.mjs";
import { markRepoSyncProcessing, runRepoSyncBridge, writeRepoSyncFailure } from "./repo-sync-worker.mjs";
import { validateCaestheticRepoSyncRequest } from "../caesthetic-repo-sync-contract.mjs";

const REQUESTS = path.join(REPO_ROOT, "docs/agent-api/requests");
const RESULTS = path.join(REPO_ROOT, "docs/agent-api/results");
const REPO_SYNC_REQUESTS = path.join(REPO_ROOT, "docs/projects/caesthetic/publish-growth-score/server-requests");
const REPO_SYNC_RESULTS = path.join(REPO_ROOT, "docs/projects/caesthetic/publish-growth-score/server-results");
const POLLER_STATUS = path.join(STORAGE_PATH, "status", "poller.json");
const STALE_PROCESSING_MS = 30 * 60 * 1000;

function git(args) {
  const r = spawnSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || "git_failed").trim().slice(0, 400));
  return (r.stdout || "").trim();
}

function writePollerStatus(state, extra = {}) {
  fs.mkdirSync(path.dirname(POLLER_STATUS), { recursive: true });
  let previous = {};
  try {
    previous = JSON.parse(fs.readFileSync(POLLER_STATUS, "utf8"));
  } catch {
    /* first heartbeat */
  }
  const host = runtimeHostInfo();
  const status = {
    ...previous,
    state,
    last_heartbeat_at: new Date().toISOString(),
    hostname: host.hostname,
    canonical_host: host.canonical_hostname,
    repo_sha: (() => {
      try {
        return git(["rev-parse", "HEAD"]);
      } catch {
        return null;
      }
    })(),
    ...extra,
  };
  const tmp = `${POLLER_STATUS}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(status, null, 2)}\n`, { mode: 0o644 });
  fs.renameSync(tmp, POLLER_STATUS);
}

function shouldRun(file, resultsDir = RESULTS, nowMs = Date.now()) {
  if (typeof resultsDir !== "string") {
    nowMs = typeof resultsDir === "number" ? resultsDir : Date.now();
    resultsDir = RESULTS;
  }
  if (!file.endsWith(".json")) return false;
  const base = path.basename(file);
  if (base.startsWith("TEMPLATE") || base.startsWith(".")) return false;
  let req;
  try {
    req = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return false;
  }
  if (String(req.type || "") !== "caesthetic_assets" && !validateCaestheticRepoSyncRequest(req)) return false;
  let rid;
  try {
    rid = assertRequestId(req.request_id || path.basename(file, ".json"));
  } catch {
    return false;
  }
  const resultPath = path.join(resultsDir, `${rid}.json`);
  if (!fs.existsSync(resultPath)) return true;
  try {
    const existing = JSON.parse(fs.readFileSync(resultPath, "utf8"));
    if (existing.status === "queued" || existing.status === "queued_on_vds") return true;
    if (existing.status !== "processing") return false;
    const startedMs = Date.parse(existing.worker?.started_at || "");
    return !Number.isFinite(startedMs) || nowMs - startedMs >= STALE_PROCESSING_MS;
  } catch {
    return true;
  }
}

function commitAndPush(paths, message) {
  git(["add", ...paths]);
  const staged = spawnSync("git", ["diff", "--staged", "--quiet"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (staged.status === 0) return false;
  if (staged.status !== 1) {
    throw new Error((staged.stderr || staged.stdout || "git_diff_failed").trim().slice(0, 400));
  }
  git(["commit", "-m", message]);
  try {
    git(["push", "origin", "HEAD:main"]);
  } catch {
    git(["fetch", "origin", "main", "-q"]);
    git(["rebase", "origin/main"]);
    git(["push", "origin", "HEAD:main"]);
  }
  return true;
}

function syncMain() {
  git(["fetch", "origin", "main", "-q"]);
  const head = git(["rev-parse", "HEAD"]);
  const remote = git(["rev-parse", "origin/main"]);
  if (head === remote) return;
  git(["merge", "--ff-only", "origin/main"]);
}

async function main() {
  writePollerStatus("starting");
  try {
    assertCanonicalAgentHost();
  } catch (err) {
    writePollerStatus("error", { last_error: err.code || err.message });
    throw err;
  }
  try {
    syncMain();
  } catch (err) {
    writePollerStatus("error", { last_error: "git_pull_failed" });
    throw Object.assign(new Error(`git_pull_failed:${err.message}`), { code: "git_pull_failed" });
  }

  const queues = [
    { requests: REQUESTS, results: RESULTS },
    { requests: REPO_SYNC_REQUESTS, results: REPO_SYNC_RESULTS },
  ];
  const files = queues.flatMap(({ requests, results }) => {
    if (!fs.existsSync(requests)) return [];
    return fs.readdirSync(requests)
      .map((name) => path.join(requests, name))
      .filter((file) => shouldRun(file, results))
      .map((file) => ({ file, results }));
  });
  if (!files.length) {
    writePollerStatus("idle", { processed: 0, current_request_id: null, last_error: null });
    console.log(JSON.stringify({ ok: true, processed: 0 }));
    return;
  }

  const written = [];
  let lastResult = null;
  for (const { file, results } of files) {
    const rel = path.relative(REPO_ROOT, file);
    const req = JSON.parse(fs.readFileSync(file, "utf8"));
    const requestId = assertRequestId(req.request_id || path.basename(file, ".json"));
    const isRepoSyncOperation = req.type === "caesthetic_repo_sync";
    const isVideoOperation = supportsVideoOperation(req.operation || req.action);
    writePollerStatus("processing", { current_request_id: requestId });
    const processingOut = isRepoSyncOperation
      ? markRepoSyncProcessing({ request: req, outputPath: path.join(results, `${requestId}.json`) })
      : isVideoOperation
      ? markVideoProcessing({ input: rel })
      : markBridgeProcessing({ input: rel });
    const processingRel = path.relative(REPO_ROOT, processingOut);
    commitAndPush(
      [processingRel],
      `chore(caesthetic-assets): processing ${requestId} [skip ci]`,
    );
    let out;
    try {
      out = isRepoSyncOperation
        ? runRepoSyncBridge({ request: req, outputPath: path.join(results, `${requestId}.json`), repoRoot: REPO_ROOT })
        : isVideoOperation
        ? await cmdVideoBridge({ input: rel })
        : await cmdBridge({ input: rel });
    } catch (error) {
      if (!isRepoSyncOperation) throw error;
      out = writeRepoSyncFailure({ request: req, outputPath: path.join(results, `${requestId}.json`), error });
    }
    const outRel = path.relative(REPO_ROOT, out);
    commitAndPush(
      [outRel],
      `chore(caesthetic-assets): result ${requestId} [skip ci]`,
    );
    const finalResult = JSON.parse(fs.readFileSync(out, "utf8"));
    lastResult = finalResult.status;
    writePollerStatus("processing", {
      current_request_id: null,
      last_request_id: requestId,
      last_result: finalResult.status,
    });
    written.push(outRel);
  }

  writePollerStatus("idle", {
    processed: written.length,
    last_request_id: path.basename(written.at(-1), ".json"),
    last_result: lastResult,
    current_request_id: null,
    last_error: null,
  });
  console.log(JSON.stringify({ ok: true, processed: written.length, committed: true, files: written }));
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((err) => {
    writePollerStatus("error", { last_error: err.code || err.message });
    console.error(JSON.stringify({ ok: false, error: err.message }));
    process.exit(1);
  });
}

export { STALE_PROCESSING_MS, commitAndPush, main, shouldRun, syncMain, writePollerStatus };
