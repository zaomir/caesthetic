#!/usr/bin/env node
/**
 * Poll origin/main for type=caesthetic_social and commit sanitised results.
 * VPS2402 cron only. Isolated git index — does not rebase the live checkout.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { REPO_ROOT, REQUEST_TYPE, assertCanonicalAgentHost, assertRequestId } from "./allowlist.mjs";
import { dispatch, markProcessing, writeResultFile } from "./worker.mjs";

const REQUESTS = path.join(REPO_ROOT, "docs/agent-api/requests");
const RESULTS = path.join(REPO_ROOT, "docs/agent-api/results");
const POLLER_STATUS = path.join(process.env.CAE_SOCIAL_PRIVATE_ROOT || "/var/lib/caesthetic-social", "status.json");
const RETRY = new Set(["queued", "queued_on_vds", "processing"]);
const STALE_PROCESSING_MS = 30 * 60 * 1000;

function gitSoft(args, env = process.env) {
  return spawnSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", env });
}

function recoverStaleLock() {
  const helper = path.join(REPO_ROOT, "scripts/lib/git-stale-lock.sh");
  if (fs.existsSync(helper)) spawnSync("bash", [helper, REPO_ROOT], { encoding: "utf8" });
}

function materializeOriginRequests() {
  const listing = gitSoft(["ls-tree", "--name-only", "origin/main:docs/agent-api/requests"]);
  if (listing.status !== 0) return;
  fs.mkdirSync(REQUESTS, { recursive: true });
  for (const name of String(listing.stdout || "").split("\n")) {
    if (!name.endsWith(".json") || name.startsWith("TEMPLATE")) continue;
    const blob = gitSoft(["show", `origin/main:docs/agent-api/requests/${name}`]);
    if (blob.status !== 0) continue;
    const text = blob.stdout.endsWith("\n") ? blob.stdout : `${blob.stdout}\n`;
    fs.writeFileSync(path.join(REQUESTS, name), text);
  }
}

function syncMain() {
  recoverStaleLock();
  let fetchErr = null;
  for (let i = 0; i < 2; i += 1) {
    const fetch = gitSoft(["fetch", "origin", "main", "-q"]);
    if (fetch.status === 0) {
      fetchErr = null;
      break;
    }
    fetchErr = `fetch:${fetch.status}`;
  }
  if (fetchErr) return fetchErr;
  const head = gitSoft(["rev-parse", "HEAD"]);
  const remote = gitSoft(["rev-parse", "origin/main"]);
  if (head.status === 0 && remote.status === 0 && head.stdout.trim() === remote.stdout.trim()) {
    materializeOriginRequests();
    return null;
  }
  const merge = gitSoft(["merge", "--ff-only", "origin/main"]);
  materializeOriginRequests();
  if (merge.status === 0) return null;
  return `merge_fallback:${merge.status}`;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function shouldRun(file, resultsDir = RESULTS, nowMs = Date.now()) {
  if (!file.endsWith(".json")) return false;
  const base = path.basename(file);
  if (base.startsWith("TEMPLATE") || base.startsWith(".")) return false;
  const req = readJson(file);
  if (!req || String(req.type || "") !== REQUEST_TYPE) return false;
  let rid;
  try {
    rid = assertRequestId(req.request_id || path.basename(file, ".json"));
  } catch {
    return false;
  }
  const resultPath = path.join(resultsDir, `${rid}.json`);
  if (!fs.existsSync(resultPath)) return true;
  const existing = readJson(resultPath);
  if (!existing) return true;
  if (RETRY.has(existing.status)) {
    if (existing.status !== "processing") return true;
    const startedMs = Date.parse(existing.worker?.started_at || existing.generated_at || "");
    return !Number.isFinite(startedMs) || nowMs - startedMs >= STALE_PROCESSING_MS;
  }
  return false;
}

function commitPushIsolated(relPath, message) {
  if (!relPath.startsWith("docs/agent-api/results/") || relPath.includes("..") || !relPath.endsWith(".json")) {
    throw new Error("receipt_publication_path_rejected");
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cae-social-index-"));
  const env = { ...process.env, GIT_INDEX_FILE: path.join(tmp, "index") };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const fetch = gitSoft(["fetch", "origin", "main", "-q"], env);
    if (fetch.status !== 0) continue;
    const parent = gitSoft(["rev-parse", "origin/main"], env);
    if (parent.status !== 0) continue;
    const parentSha = parent.stdout.trim();
    if (gitSoft(["read-tree", parentSha], env).status !== 0) continue;
    if (gitSoft(["add", "--", relPath], env).status !== 0) continue;
    const tree = gitSoft(["write-tree"], env);
    if (tree.status !== 0) continue;
    const treeSha = tree.stdout.trim();
    const parentTree = gitSoft(["rev-parse", `${parentSha}^{tree}`], env);
    if (parentTree.status === 0 && parentTree.stdout.trim() === treeSha) {
      fs.rmSync(tmp, { recursive: true, force: true });
      return true;
    }
    const commit = gitSoft(["commit-tree", treeSha, "-p", parentSha, "-m", message], env);
    if (commit.status !== 0) continue;
    const push = gitSoft(["push", "origin", `${commit.stdout.trim()}:refs/heads/main`], env);
    if (push.status === 0) {
      fs.rmSync(tmp, { recursive: true, force: true });
      return true;
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return false;
}

function writePollerStatus(extra) {
  fs.mkdirSync(path.dirname(POLLER_STATUS), { recursive: true, mode: 0o700 });
  const previous = readJson(POLLER_STATUS) || {};
  fs.writeFileSync(
    POLLER_STATUS,
    `${JSON.stringify({ ...previous, last_heartbeat_at: new Date().toISOString(), ...extra }, null, 2)}\n`,
    { mode: 0o600 },
  );
}

export async function main() {
  try {
    assertCanonicalAgentHost();
  } catch (err) {
    writePollerStatus({ state: "error", last_error: err.code || err.message });
    throw err;
  }
  let syncError = null;
  try {
    syncError = syncMain();
  } catch (err) {
    syncError = `sync:${err.message}`;
  }
  if (syncError) writePollerStatus({ state: "degraded", sync_error: syncError });

  const files = fs.existsSync(REQUESTS)
    ? fs.readdirSync(REQUESTS).map((name) => path.join(REQUESTS, name)).filter((file) => shouldRun(file))
    : [];
  if (!files.length) {
    writePollerStatus({ state: "idle", processed: 0, current_request_id: null, sync_error: syncError });
    console.log(JSON.stringify({ ok: true, processed: 0, sync_error: syncError }));
    return;
  }

  let processed = 0;
  let lastId = null;
  for (const file of files) {
    const req = JSON.parse(fs.readFileSync(file, "utf8"));
    const requestId = assertRequestId(req.request_id || path.basename(file, ".json"));
    lastId = requestId;
    const out = path.join(RESULTS, `${requestId}.json`);
    writePollerStatus({ state: "processing", current_request_id: requestId });
    markProcessing(req, out);
    commitPushIsolated(path.relative(REPO_ROOT, out), `chore(caesthetic-social): processing ${requestId} [skip ci]`);
    let result;
    try {
      result = await dispatch(req);
    } catch (err) {
      result = {
        request_id: requestId,
        type: REQUEST_TYPE,
        status: "error",
        generated_at: new Date().toISOString(),
        processor: "vps2402",
        errors: [{ code: err.code || "internal_error", message: err.message }],
        error: { code: err.code || "internal_error", message: err.message },
        data: {},
        warnings: [],
      };
    }
    writeResultFile(out, result);
    if (commitPushIsolated(path.relative(REPO_ROOT, out), `chore(caesthetic-social): result ${requestId} [skip ci]`)) {
      processed += 1;
    }
  }
  writePollerStatus({
    state: "idle",
    processed,
    last_request_id: lastId,
    current_request_id: null,
    sync_error: syncError,
  });
  console.log(JSON.stringify({ ok: true, processed, last_id: lastId, sync_error: syncError }));
}

export { STALE_PROCESSING_MS };

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((err) => {
    console.error(JSON.stringify({ ok: false, error: err.message }));
    process.exit(1);
  });
}
