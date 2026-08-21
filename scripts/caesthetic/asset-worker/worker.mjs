#!/usr/bin/env node
/**
 * CAESTHETIC Asset Worker — Dropbox read → render → Dropbox Huck write.
 * SSOT: docs/ssot/CAESTHETIC_ASSET_WORKER.md
 *
 * Usage:
 *   node scripts/caesthetic/asset-worker/worker.mjs healthcheck --json
 *   node scripts/caesthetic/asset-worker/worker.mjs list_source --json
 *   node scripts/caesthetic/asset-worker/worker.mjs render_stories --job docs/projects/caesthetic/operations/ig-growth/editorial-story-card/huck-mvp-10.json
 *   node scripts/caesthetic/asset-worker/worker.mjs bridge --input docs/agent-api/requests/<id>.json
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_OPERATIONS,
  ALLOWED_SOURCES,
  AUDIT_LOG,
  MAX_CARDS,
  RCLONE_REMOTE,
  REPO_ROOT,
  STORAGE_PATH,
  assertCanonicalAgentHost,
  assertAllowedAssetRole,
  assertAllowedDestKind,
  assertAllowedFolder,
  assertAllowedOperation,
  assertAllowedTemplate,
  assertPhotoName,
  assertRequestId,
  findForbiddenFields,
  normalizeHeadline,
  runtimeHostInfo,
} from "./allowlist.mjs";

const RENDERER = path.join(REPO_ROOT, "scripts/caesthetic/render-editorial-story-card.py");
const POLLER_STATUS = path.join(STORAGE_PATH, "status", "poller.json");

function parseArgs(argv) {
  const out = { command: "", input: "", output: "", job: "", json: false, help: false };
  const rest = argv.slice(2);
  if (rest.length) out.command = rest[0];
  for (let i = 1; i < rest.length; i += 1) {
    const a = rest[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--json") out.json = true;
    else if (a === "--input" && rest[i + 1]) out.input = rest[++i];
    else if (a === "--output" && rest[i + 1]) out.output = rest[++i];
    else if (a === "--job" && rest[i + 1]) out.job = rest[++i];
  }
  return out;
}

function usage() {
  console.log(`CAESTHETIC Asset Worker (allowlisted only)
SSOT: docs/ssot/CAESTHETIC_ASSET_WORKER.md

Commands:
  healthcheck | list_source | render_stories | bridge

Examples:
  node scripts/caesthetic/asset-worker/worker.mjs healthcheck --json
  node scripts/caesthetic/asset-worker/worker.mjs render_stories --job <pack.json>
  node scripts/caesthetic/asset-worker/worker.mjs bridge --input docs/agent-api/requests/<id>.json
`);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: opts.timeout ?? 120_000,
    cwd: opts.cwd || REPO_ROOT,
    env: process.env,
  });
  if (result.error) {
    throw Object.assign(new Error(`spawn_failed:${cmd}`), { code: "spawn_failed", details: String(result.error) });
  }
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim().slice(0, 800);
    throw Object.assign(new Error(`${cmd}_failed:${result.status}`), { code: `${cmd}_failed`, details: err });
  }
  return (result.stdout || "").trim();
}

function rclone(args, opts = {}) {
  return run("rclone", args, { timeout: opts.timeout ?? 180_000 });
}

function remote(rel) {
  const prefix = RCLONE_REMOTE.endsWith(":") ? RCLONE_REMOTE : `${RCLONE_REMOTE}:`;
  return `${prefix}${rel}`;
}

function writeAudit(entry) {
  try {
    fs.mkdirSync(path.dirname(AUDIT_LOG), { recursive: true });
    fs.appendFileSync(AUDIT_LOG, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`);
  } catch {
    /* non-blocking */
  }
}

function currentRepoSha() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: 10_000,
  });
  const value = String(result.stdout || "").trim();
  return result.status === 0 && /^[a-f0-9]{40}$/i.test(value) ? value : null;
}

function readPollerStatus() {
  try {
    const parsed = JSON.parse(fs.readFileSync(POLLER_STATUS, "utf8"));
    return {
      state: String(parsed.state || "unknown"),
      last_heartbeat_at: parsed.last_heartbeat_at || null,
      current_request_id: parsed.current_request_id || null,
      last_request_id: parsed.last_request_id || null,
      last_result: parsed.last_result || null,
      last_error: parsed.last_error || null,
      repo_sha: parsed.repo_sha || null,
    };
  } catch {
    return { state: "unknown", last_heartbeat_at: null };
  }
}

function ensureStorage() {
  for (const rel of [
    "input",
    "processing",
    "output",
    "configs",
    "generated/stories",
    "generated/reels",
    "generated/thumbnails",
    "generated/archive",
  ]) {
    fs.mkdirSync(path.join(STORAGE_PATH, rel), { recursive: true });
  }
}

function healthcheck() {
  ensureStorage();
  const about = rclone(["about", RCLONE_REMOTE, "--json"]);
  let used = null;
  try {
    const parsed = JSON.parse(about);
    used = parsed.used ?? parsed.Used ?? null;
  } catch {
    used = "ok";
  }
  const folders = {};
  for (const [id, paths] of Object.entries({
    pose_library: "CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/01-pose-library",
    clean_plates: "CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/02-clean-plates",
    huck: "CAESTHETIC/CAESTHETIC MEDIA/Huck",
  })) {
    try {
      rclone(["lsd", remote(paths)]);
      folders[id] = "ok";
    } catch (err) {
      folders[id] = `fail:${err.message}`;
    }
  }
  const renderer = fs.existsSync(RENDERER);
  let host;
  try {
    host = assertCanonicalAgentHost();
  } catch (err) {
    host = { ...runtimeHostInfo(), canonical: false, error: err.message };
  }
  const ok = renderer && Object.values(folders).every((v) => v === "ok") && host.canonical === true;
  return {
    ok,
    host: {
      hostname: host.hostname,
      canonical_hostname: host.canonical_hostname,
      canonical_ip: host.canonical_ip,
      canonical: host.canonical === true,
      error: host.error || null,
    },
    storage_path: STORAGE_PATH,
    rclone_remote: "dropbox",
    dropbox_used: used,
    folders,
    renderer: renderer ? "ok" : "missing",
    poller: readPollerStatus(),
    write: "rclone files.content.write via existing VPS2402 remote",
  };
}

function listFolder(rel) {
  const out = rclone(["lsf", remote(rel), "--files-only"]);
  return out ? out.split("\n").map((s) => s.trim()).filter(Boolean) : [];
}

function listSource(folderId) {
  const paths = assertAllowedFolder(folderId);
  const files = [];
  for (const rel of paths) {
    for (const name of listFolder(rel)) {
      files.push({ folder: rel.split("/").pop(), name });
    }
  }
  return { ok: true, folder: folderId || "Valerie-avatar-plates", count: files.length, files };
}

function findPhotoRemote(name, folderId) {
  const photo = assertPhotoName(name);
  const paths = assertAllowedFolder(folderId);
  for (const rel of paths) {
    const names = listFolder(rel);
    if (names.includes(photo)) return { rel, photo };
  }
  throw Object.assign(new Error(`photo_not_found:${photo}`), { code: "photo_not_found" });
}

function normalizeCard(raw, index) {
  const photo = assertPhotoName(raw.photo);
  const headline = normalizeHeadline(raw.headline);
  if (!headline.length) {
    throw Object.assign(new Error(`missing_headline:${photo}`), { code: "missing_headline" });
  }
  const highlight = String(raw.highlight || "").trim().slice(0, 24);
  const support = String(raw.support || "").trim().slice(0, 160);
  const episode = Number(raw.episode || index + 1);
  if (!Number.isInteger(episode) || episode < 1 || episode > 999) {
    throw Object.assign(new Error(`invalid_episode:${photo}`), { code: "invalid_episode" });
  }
  const assetRole = assertAllowedAssetRole(raw.asset_role);
  const outputName = assetRole
    ? `${String(episode).padStart(3, "0")}-${assetRole}.png`
    : `${path.parse(photo).name}.png`;
  return { photo, headline, highlight, support, episode, asset_role: assetRole, output_name: outputName };
}

function cardsFromRequest(req) {
  const params = req.params && typeof req.params === "object" ? req.params : req;
  if (Array.isArray(params.cards) && params.cards.length) return params.cards;
  if (params.photo || params.headline) return [params];
  return [];
}

function renderStories(req, context = {}) {
  const setStage = typeof context.onStage === "function" ? context.onStage : () => {};
  setStage("validate_request");
  ensureStorage();
  const params = req.params && typeof req.params === "object" ? req.params : req;
  const requestId = assertRequestId(req.request_id || `cae-assets-${Date.now()}`);
  const template = assertAllowedTemplate(String(params.template || "VALERIE_EDITORIAL_STORY_CARD_V2"));
  const folderId = String(params.folder || "Valerie-avatar-plates");
  const dest = assertAllowedDestKind(params.dest_kind || "stories");
  const rawCards = cardsFromRequest(req);
  if (!rawCards.length) {
    throw Object.assign(new Error("missing_cards"), { code: "missing_cards" });
  }
  if (rawCards.length > MAX_CARDS) {
    throw Object.assign(new Error(`too_many_cards:${rawCards.length}`), { code: "too_many_cards" });
  }

  const jobDir = path.join(STORAGE_PATH, "processing", requestId);
  const inDir = path.join(jobDir, "input");
  const outDir = path.join(STORAGE_PATH, "generated", dest.kind, requestId);
  fs.rmSync(jobDir, { recursive: true, force: true });
  fs.mkdirSync(inDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const cards = rawCards.map((card, i) => normalizeCard(card, i));
  const outputNames = new Set();
  for (const card of cards) {
    if (outputNames.has(card.output_name)) {
      throw Object.assign(new Error(`duplicate_output_name:${card.output_name}`), { code: "duplicate_output_name" });
    }
    outputNames.add(card.output_name);
  }
  setStage("download_sources");
  for (const card of cards) {
    const found = findPhotoRemote(card.photo, folderId);
    rclone(["copyto", remote(`${found.rel}/${found.photo}`), path.join(inDir, found.photo)], {
      timeout: 180_000,
    });
    card.resolved_from = found.rel.split("/").pop();
  }

  const jobPath = path.join(jobDir, "job.json");
  fs.writeFileSync(
    jobPath,
    `${JSON.stringify({
      template,
      cards: cards.map(({ photo, headline, highlight, support, episode, asset_role, output_name }) => ({
        photo,
        headline,
        highlight,
        support,
        episode,
        asset_role,
        output_name,
      })),
    }, null, 2)}\n`,
  );

  setStage("render");
  run("python3", [RENDERER, "--job", jobPath, "--input-dir", inDir, "--out-dir", outDir], {
    timeout: 300_000,
  });

  const qaPath = path.join(outDir, "qa-report.json");
  const qa = fs.existsSync(qaPath) ? JSON.parse(fs.readFileSync(qaPath, "utf8")) : { cards: [] };
  const pngs = fs.readdirSync(outDir).filter((n) => n.endsWith(".png"));
  const dropboxDest = `${dest.remotePath}/${requestId}`;
  setStage("upload");
  rclone(
    [
      "copy",
      outDir,
      remote(dropboxDest),
      "--filter",
      "- _debug/**",
      "--filter",
      "+ *.png",
      "--filter",
      "+ qa-report.json",
      "--filter",
      "- *",
    ],
    { timeout: 300_000 },
  );
  setStage("complete");

  return {
    ok: true,
    request_id: requestId,
    template,
    folder: folderId,
    dest_kind: dest.kind,
    local_dir: outDir,
    dropbox_dir: dropboxDest,
    files: pngs,
    assets: cards.map(({ asset_role, output_name, photo, resolved_from }) => ({
      asset_role: asset_role || null,
      file: output_name,
      photo,
      resolved_from,
    })),
    qa: qa.cards || [],
    count: pngs.filter((n) => n !== "contact-sheet.png").length,
  };
}

export function buildBridgeResult(req, payload) {
  const generatedAt = new Date().toISOString();
  const terminal = payload.status === "success" || payload.status === "error";
  const host = payload.host || runtimeHostInfo();
  return {
    request_id: String(req.request_id || "unknown"),
    type: "caesthetic_assets",
    operation: String(req.operation || req.action || ""),
    status: payload.status,
    generated_at: generatedAt,
    ok: payload.ok !== false && payload.status === "success",
    worker: {
      channel: payload.channel || "caesthetic-asset-worker",
      host: host.hostname || host.canonical_hostname || "vps2402",
      canonical_host: "vps2402",
      state: payload.status,
      stage: payload.stage || (payload.status === "success" ? "complete" : payload.status),
      attempt: Number(payload.attempt || 1),
      started_at: payload.started_at || generatedAt,
      heartbeat_at: payload.heartbeat_at || generatedAt,
      completed_at: terminal ? payload.completed_at || generatedAt : null,
      duration_ms: terminal && Number.isFinite(payload.duration_ms) ? payload.duration_ms : null,
      repo_sha: payload.repo_sha || null,
    },
    data: payload.data ?? null,
    warnings: payload.warnings || ["channel: caesthetic-asset-worker", "forbidden: arbitrary_shell"],
    errors: payload.errors || [],
  };
}

function writeBridgeResult(outputPath, result) {
  const resolved = path.resolve(path.isAbsolute(outputPath) ? outputPath : path.join(REPO_ROOT, outputPath));
  const base = path.resolve(REPO_ROOT, "docs/agent-api/results");
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error("bridge_output_not_whitelisted");
  }
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(result, null, 2)}\n`);
  return resolved;
}

async function dispatch(req, context = {}) {
  const operation = String(req.operation || req.action || "render_stories");
  assertAllowedOperation(operation);
  const forbidden = findForbiddenFields(req);
  if (forbidden.length) {
    return { ok: false, operation, error: "forbidden_fields", details: forbidden };
  }
  const source = String(req.source || req.params?.source || "Dropbox");
  if (source && !ALLOWED_SOURCES.includes(source)) {
    return { ok: false, operation, error: `forbidden_source:${source}` };
  }

  if (operation === "healthcheck") return { ok: true, data: healthcheck() };
  if (operation === "list_source") {
    const folder = req.folder || req.params?.folder || "Valerie-avatar-plates";
    return { ok: true, data: listSource(folder) };
  }
  if (operation === "render_stories") return { ok: true, data: renderStories(req, context) };
  return { ok: false, error: `unknown_operation:${operation}` };
}

function resolveBridgeRequest(args) {
  const inputPath = path.resolve(path.isAbsolute(args.input) ? args.input : path.join(process.cwd(), args.input));
  const reqBase = path.resolve(REPO_ROOT, "docs/agent-api/requests");
  if (!inputPath.startsWith(reqBase + path.sep)) throw new Error("bridge_input_not_whitelisted");
  const req = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const requestId = assertRequestId(req.request_id || path.basename(inputPath, ".json"));
  req.request_id = requestId;
  const outputPath = path.resolve(args.output || path.join(REPO_ROOT, "docs/agent-api/results", `${requestId}.json`));
  return { inputPath, outputPath, req, requestId };
}

function readExistingResult(outputPath) {
  try {
    return JSON.parse(fs.readFileSync(outputPath, "utf8"));
  } catch {
    return null;
  }
}

function errorGuidance(err) {
  if (err.code === "missing_photo") {
    return { retryable: false, hint: "Set every cards[].photo to a basename returned by list_source, then use a new request_id." };
  }
  if (err.code === "forbidden_photo") {
    return { retryable: false, hint: "Use an allowlisted photo basename; random values and paths are forbidden." };
  }
  if (String(err.code || "").endsWith("_failed") || err.code === "spawn_failed" || err.code === "photo_not_found") {
    return { retryable: true, hint: "Check the VPS2402 poller healthcheck and source inventory before retrying with a new request_id." };
  }
  return { retryable: false, hint: "Correct the request contract and retry with a new request_id." };
}

function markBridgeProcessing(args) {
  const { outputPath, req } = resolveBridgeRequest(args);
  const existing = readExistingResult(outputPath);
  if (existing?.status === "success") return outputPath;
  const startedAt = new Date().toISOString();
  const attempt = existing?.status === "processing" ? Number(existing.worker?.attempt || 1) + 1 : 1;
  return writeBridgeResult(
    outputPath,
    buildBridgeResult(req, {
      status: "processing",
      ok: false,
      stage: "received",
      attempt,
      started_at: startedAt,
      heartbeat_at: startedAt,
      repo_sha: currentRepoSha(),
      warnings: ["channel: caesthetic-asset-worker", "forbidden: arbitrary_shell"],
      errors: [],
    }),
  );
}

async function cmdBridge(args) {
  const { outputPath, req, requestId } = resolveBridgeRequest(args);
  const existing = readExistingResult(outputPath);
  if (existing?.status === "success") return outputPath;
  const startedAt = existing?.worker?.started_at || new Date().toISOString();
  const attempt = Number(existing?.worker?.attempt || 1);
  const startedMs = Date.parse(startedAt) || Date.now();
  const repoSha = currentRepoSha();
  let stage = existing?.worker?.stage || "received";
  const onStage = (value) => {
    stage = value;
  };

  if (String(req.type || "") !== "caesthetic_assets") {
    return writeBridgeResult(
      outputPath,
      buildBridgeResult(req, {
        status: "error",
        ok: false,
        stage: "validate_request",
        attempt,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedMs,
        repo_sha: repoSha,
        errors: [{ message: `expected_type_caesthetic_assets_got:${req.type}`, code: "invalid_type", retryable: false }],
      }),
    );
  }

  try {
    const opResult = await dispatch(req, { onStage });
    const status = opResult.ok ? "success" : "error";
    const completedAt = new Date().toISOString();
    const result = buildBridgeResult(req, {
      status,
      ok: opResult.ok !== false,
      stage: status === "success" ? "complete" : stage,
      attempt,
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: Date.now() - startedMs,
      repo_sha: repoSha,
      data: opResult.data ?? opResult,
      errors: opResult.ok ? [] : [{ message: opResult.error || "render_failed", details: opResult.details }],
    });
    writeAudit({
      request_id: requestId,
      operation: req.operation || "render_stories",
      result: status,
      count: opResult.data?.count ?? 0,
    });
    return writeBridgeResult(outputPath, result);
  } catch (err) {
    const completedAt = new Date().toISOString();
    const guidance = errorGuidance(err);
    const result = buildBridgeResult(req, {
      status: "error",
      ok: false,
      stage,
      attempt,
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: Date.now() - startedMs,
      repo_sha: repoSha,
      errors: [{
        message: err.message,
        code: err.code || "internal",
        stage,
        retryable: guidance.retryable,
        hint: guidance.hint,
      }],
    });
    writeAudit({ request_id: requestId, result: "error", error: err.message });
    return writeBridgeResult(outputPath, result);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.command) {
    usage();
    process.exit(args.help ? 0 : 2);
  }

  try {
    if (args.command === "bridge") {
      if (!args.input) throw new Error("bridge_requires_--input");
      const written = await cmdBridge(args);
      console.log(JSON.stringify({ ok: true, output_path: written }));
      return;
    }

    let req = { request_id: `direct-${Date.now()}`, operation: args.command, params: {} };
    if (args.job) {
      const abs = path.isAbsolute(args.job) ? args.job : path.join(process.cwd(), args.job);
      const pack = JSON.parse(fs.readFileSync(abs, "utf8"));
      req = {
        request_id: `cae-assets-mvp-${new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)}Z`,
        operation: args.command,
        source: "Dropbox",
        params: pack,
      };
    }
    if (args.command === "healthcheck") req.operation = "healthcheck";
    if (args.command === "list_source") req.operation = "list_source";
    if (args.command === "render_stories") req.operation = "render_stories";
    if (!ALLOWED_OPERATIONS.includes(args.command)) throw new Error(`unknown_command:${args.command}`);

    const started = Date.now();
    const result = await dispatch(req);
    result.duration_ms = Date.now() - started;
    if (args.json || true) console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message, code: err.code || "internal" }));
    process.exit(1);
  }
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main();
}

export { dispatch, healthcheck, listSource, normalizeCard, renderStories, cmdBridge, markBridgeProcessing };
