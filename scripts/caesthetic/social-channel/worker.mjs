/**
 * CAESTHETIC social channel worker — ChatGPT Agent API type=caesthetic_social.
 * Executes on VPS2402 only. Uses existing SBO/Hooppy/fleet locks. No second scheduler.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_OPERATIONS,
  DOLPHIN_EXECUTOR,
  DOLPHIN_LOCAL_API,
  DOLPHIN_PROFILE_ID,
  HOOPPY_CAESTHETIC_PAGES,
  PRIVATE_ROOT,
  PROJECT_ID,
  REPO_ROOT,
  REQUEST_TYPE,
  SURFACES,
  assertAllowedOperation,
  assertCanonicalAgentHost,
  assertExecuteAction,
  assertHooppyPageId,
  assertPrivateRef,
  assertRequestId,
  assertSurface,
  findForbiddenFields,
  findPiiFields,
  hooppyTokenPresent,
  loadHooppyToken,
  normalizeOperation,
  remainingInMail,
  runtimeHostInfo,
} from "./allowlist.mjs";
import { assertNoSecretPayload, contentRefHash, stripSecrets } from "./sanitize.mjs";
import { listSanitizedPages } from "./hooppy.mjs";
import { cancelOwnedJob, findFleetJob, readFleetSnapshot } from "./fleet-status.mjs";
import {
  executeExistingItem,
  inspectSurfaceQueue,
  listReadyPackages,
  probeIdentity,
  publishExistingPackage,
  readInbox,
  reconcileUncertain,
  surfaceIdentity,
} from "./operators.mjs";
import { windowState } from "./window.mjs";

const INTENT_DIR = path.join(PRIVATE_ROOT, "intents");
const INBOX_DIR = path.join(PRIVATE_ROOT, "inbox");
const IDEMPOTENCY_DIR = path.join(PRIVATE_ROOT, "idempotency");

function nowIso() {
  return new Date().toISOString();
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  mkdirp(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tmp, file);
}

function hashKey(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 40);
}

function intentPath(key) {
  return path.join(INTENT_DIR, `${hashKey(key)}.json`);
}

function idempotencyPath(requestId, operation) {
  return path.join(IDEMPOTENCY_DIR, `${hashKey(`${requestId}|${operation}`)}.json`);
}

export function writeIntent(record) {
  const file = intentPath(record.idempotency_key);
  writeJson(file, { ...record, recorded_at: nowIso() });
  return { ref: file, hash: hashKey(record.idempotency_key) };
}

export function readIntent(idempotencyKey) {
  return readJson(intentPath(idempotencyKey), null);
}

function buildResult(req, payload) {
  const host = runtimeHostInfo();
  const result = stripSecrets({
    request_id: String(req.request_id || ""),
    type: REQUEST_TYPE,
    operation: payload.operation || normalizeOperation(req.operation || req.action),
    status: payload.status,
    generated_at: nowIso(),
    ok: payload.status === "success" || payload.status === "already_completed" || payload.status === "NO_ACTION_PROVEN",
    processor: "vps2402",
    worker: {
      host: host.hostname,
      canonical_host: "vps2402",
      executor: DOLPHIN_EXECUTOR,
      dolphin_profile_id: DOLPHIN_PROFILE_ID,
      project_id: PROJECT_ID,
    },
    data: payload.data || {},
    warnings: payload.warnings || [],
    errors: payload.errors || [],
    error: payload.error || (payload.errors && payload.errors[0]) || null,
  });
  assertNoSecretPayload(result);
  return result;
}

function errorResult(req, code, message, extra = {}) {
  return buildResult(req, {
    operation: extra.operation,
    status: extra.status || "error",
    errors: [{ code, message: message || code }],
    error: { code, message: message || code },
    data: extra.data || {},
    warnings: extra.warnings || [],
  });
}

export function validateRequest(req) {
  const errors = [];
  if (!req?.request_id) errors.push({ code: "invalid_request_id", message: "missing_request_id" });
  else {
    try {
      assertRequestId(req.request_id);
    } catch (err) {
      errors.push({ code: err.code || "invalid_request_id", message: err.message });
    }
  }
  if (String(req.type || "") !== REQUEST_TYPE) {
    errors.push({ code: "unknown_type", message: `unknown_type:${req.type || ""}` });
  }
  const forbidden = findForbiddenFields(req);
  errors.push(...forbidden);
  const pii = findPiiFields(req);
  for (const field of pii) {
    errors.push({ code: "pii_in_git_request", message: field });
  }
  try {
    assertAllowedOperation(req.operation || req.action);
  } catch (err) {
    errors.push({ code: err.code || "unsupported_operation", message: err.message });
  }
  return errors;
}

function dolphinLocalHealth() {
  try {
    const res = spawnSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "3", `${DOLPHIN_LOCAL_API}/`], {
      encoding: "utf8",
    });
    const code = String(res.stdout || "").trim();
    return { reachable: code !== "000" && Boolean(code), http_status: code || null };
  } catch {
    return { reachable: false, http_status: null };
  }
}

function systemdActive(unit) {
  const res = spawnSync("systemctl", ["is-active", unit], { encoding: "utf8" });
  return String(res.stdout || "").trim() === "active";
}

async function opHealth(req) {
  const token = hooppyTokenPresent();
  const dolphin = dolphinLocalHealth();
  const fleet = readFleetSnapshot();
  return buildResult(req, {
    operation: "health",
    status: "success",
    data: {
      host: runtimeHostInfo(),
      hooppy_token_present: token.present,
      hooppy_token_source: token.present ? "host_secret_store" : null,
      dolphin_local_api: { url: "http://127.0.0.1:3001", reachable: dolphin.reachable },
      dolphin_executor: DOLPHIN_EXECUTOR,
      social_fleet_active: systemdActive("social-fleet.service"),
      hold: fleet.hold,
      raw_accounts_endpoint: "forbidden",
    },
  });
}

function surfaceReadiness(id, fleet, pages, probe) {
  const surface = SURFACES[id];
  const page = surface.hooppy_page_id
    ? (pages || []).find((row) => row.id === surface.hooppy_page_id) || null
    : null;
  const identity = surfaceIdentity(id, probe);
  const blockers = [];
  if (surface.blocked_code) blockers.push(surface.blocked_code);
  if (surface.dolphin_forbidden) blockers.push("YOUTUBE_DOLPHIN_FORBIDDEN");
  if (!surface.profile_id && surface.platform !== "youtube") blockers.push("NO_DOLPHIN_BINDING");
  if (fleet.hold.active && surface.profile_id === DOLPHIN_PROFILE_ID) blockers.push(fleet.hold.code || "HOLD");
  if (surface.execute === false && !surface.hooppy_page_id) blockers.push("EXECUTE_DISABLED");
  if (surface.hooppy_page_id && pages && !page) blockers.push("HOOPPY_PAGE_NOT_CONNECTED");
  if (identity.identity_verified !== true && surface.profile_id === DOLPHIN_PROFILE_ID) {
    blockers.push(identity.code || "IDENTITY_UNCHECKED");
  }
  return {
    surface_account_id: id,
    platform: surface.platform,
    expected_url: surface.expected_url,
    profile_id: surface.profile_id,
    execute_allowed: surface.execute === true && blockers.length === 0,
    registry_execute: surface.execute === true,
    identity_verified: identity.identity_verified === true,
    identity_state: identity.identity_state,
    messaging_open: identity.messaging_open || false,
    hooppy_page: page
      ? {
          id: page.id,
          source_id: page.source_id,
          is_admin: page.is_admin,
          connection_checked: page.connection_checked,
          name: page.social_page_name,
        }
      : null,
    blockers: [...new Set(blockers)],
  };
}

async function opReadiness(req, { fetchImpl } = {}) {
  const fleet = readFleetSnapshot();
  let pages = [];
  const warnings = [];
  try {
    const listed = await listSanitizedPages({ fetchImpl, token: loadHooppyToken() });
    pages = listed.allowlisted;
  } catch (err) {
    warnings.push(err.code || err.message);
  }
  const selected = Array.isArray(req.params?.surfaces) && req.params.surfaces.length
    ? req.params.surfaces.map(String)
    : Object.keys(SURFACES);
  const probe = await probeIdentity({ force: Boolean(req.params?.force_probe) });
  const surfaces = [];
  for (const id of selected) {
    if (!SURFACES[id]) {
      surfaces.push({
        surface_account_id: id,
        execute_allowed: false,
        identity_verified: false,
        identity_state: "unknown_surface",
        blockers: ["unknown_surface"],
      });
      continue;
    }
    surfaces.push(surfaceReadiness(id, fleet, pages, probe));
  }
  return buildResult(req, {
    operation: "readiness",
    status: "success",
    warnings,
    data: {
      hold: fleet.hold,
      window: windowState(),
      identity_probe: {
        probed: Boolean(probe.probed),
        identity_state: probe.identity_state,
        identity_verified: probe.identity_verified === true,
        cached: Boolean(probe.cached),
        code: probe.code || null,
      },
      surfaces,
      youtube_via_dolphin: "denied",
      robertas_viktorija: "blocked_until_real_profiles",
    },
  });
}

async function opStatus(req) {
  const fleet = readFleetSnapshot();
  return buildResult(req, {
    operation: "status",
    status: "success",
    data: {
      ...fleet,
      inmail_caps: remainingInMail(fleet.inmail_remaining.used).ceiling,
    },
  });
}

async function opInbox(req) {
  const fleet = readFleetSnapshot();
  mkdirp(INBOX_DIR);
  const surfaceId = String(req.params?.surface_account_id || "valeria-lana-linkedin");
  if (fleet.hold.active) {
    return buildResult(req, {
      operation: "inbox",
      status: "blocked",
      errors: [{ code: fleet.hold.code || "HOLD", message: "inbox_blocked_by_hold" }],
      data: {
        hold: fleet.hold,
        ...aggregateUnreadUnknown(),
        note: "HOLD blocks a live inbox read. Counts are not invented.",
      },
    });
  }
  const inbox = await readInbox(surfaceId);
  return buildResult(req, {
    operation: "inbox",
    status: inbox.read ? "success" : "NO_ACTION_PROVEN",
    data: {
      surface_account_id: surfaceId,
      ...inbox,
      note: "Conversation bodies stay on the host. Git receives counts and refs only. unread_count is null unless the operator actually read the inbox.",
    },
  });
}

function aggregateUnreadUnknown() {
  return {
    private_store: INBOX_DIR,
    thread_count: null,
    unread_count: null,
    drafts_prepared: null,
    read: false,
  };
}

function listJsonSafe(dir) {
  try {
    return fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }
}

function gateWrite(surface, action, fleet) {
  if (surface.blocked_code) {
    return { code: surface.blocked_code, message: surface.blocked_code };
  }
  if (surface.dolphin_forbidden) {
    return { code: "YOUTUBE_DOLPHIN_FORBIDDEN", message: "YouTube via Dolphin is denied" };
  }
  if (!surface.profile_id && action !== "publish") {
    return { code: "NO_DOLPHIN_BINDING", message: "No verified Dolphin profile" };
  }
  if (surface.execute !== true && action !== "publish") {
    return { code: "EXECUTE_DISABLED", message: `execute_false:${surface.surface_account_id}` };
  }
  if (fleet.hold.active && surface.profile_id === DOLPHIN_PROFILE_ID) {
    return { code: fleet.hold.code || "HOLD", message: "profile_hold_blocks_write" };
  }
  if (action === "inmail") {
    const remaining = fleet.inmail_remaining;
    if (remaining.day <= 0 || remaining.week <= 0 || remaining.month <= 0) {
      return { code: "RATE_CAP", message: "inmail_ceiling_reached" };
    }
  }
  if (action === "message" && surface.platform === "instagram" && surface.cold_dm === false) {
    return { code: "COLD_DM_DISABLED", message: "instagram_cold_dm_zero" };
  }
  return null;
}

export function alreadyCompleted(idempotencyKey) {
  const intent = readIntent(idempotencyKey);
  if (!intent) return null;
  if (["intended", "queued", "uncertain", "succeeded", "ACTION_VERIFIED", "LIVE_VERIFIED", "already_completed"].includes(intent.status)) {
    return intent;
  }
  return null;
}

async function opExecute(req) {
  const params = req.params || {};
  const surface = assertSurface(params.surface_account_id);
  const action = assertExecuteAction(params.action);
  const idempotencyKey = String(params.idempotency_key || req.request_id);
  const prior = alreadyCompleted(idempotencyKey);
  if (prior) {
    return buildResult(req, {
      operation: "execute",
      status: "already_completed",
      data: { idempotency_key: idempotencyKey, prior_status: prior.status, resent: false },
    });
  }
  const fleet = readFleetSnapshot();
  const blocked = gateWrite(surface, action, fleet);
  const contentRef = params.content_ref || params.queue_item_id || params.package_id || null;
  let privateRef = null;
  if (contentRef) privateRef = assertPrivateRef(contentRef, "content_ref");
  if (blocked) {
    writeIntent({
      idempotency_key: idempotencyKey,
      request_id: req.request_id,
      surface_account_id: surface.surface_account_id,
      action,
      status: "blocked",
      code: blocked.code,
    });
    return errorResult(req, blocked.code, blocked.message, {
      operation: "execute",
      status: "blocked",
      data: { hold: fleet.hold, surface_account_id: surface.surface_account_id, action, resent: false },
    });
  }
  if (!privateRef && !params.queue_item_id) {
    return errorResult(req, "missing_content_ref", "Writes require a private content_ref or queue_item_id", {
      operation: "execute",
      status: "error",
    });
  }
  const executed = await executeExistingItem({
    surface,
    action,
    contentRef: privateRef,
    queueItemId: params.queue_item_id,
    idempotencyKey,
    requestId: req.request_id,
  });
  if (executed.terminal === "ACTION_VERIFIED" || executed.status === "already_completed") {
    writeIntent({
      idempotency_key: idempotencyKey,
      request_id: req.request_id,
      surface_account_id: surface.surface_account_id,
      action,
      status: executed.terminal === "ACTION_VERIFIED" ? "ACTION_VERIFIED" : "already_completed",
      content_ref_hash: executed.content_ref_hash || (privateRef ? contentRefHash(privateRef) : null),
      candidate_ref: executed.candidate_ref || null,
    });
  } else if (executed.status === "blocked" && executed.code === "WINDOW_CLOSED") {
    writeIntent({
      idempotency_key: idempotencyKey,
      request_id: req.request_id,
      surface_account_id: surface.surface_account_id,
      action,
      status: "deferred",
      code: "WINDOW_CLOSED",
    });
  } else if (executed.terminal === "uncertain") {
    writeIntent({
      idempotency_key: idempotencyKey,
      request_id: req.request_id,
      surface_account_id: surface.surface_account_id,
      action,
      status: "uncertain",
      code: executed.code || "uncertain",
    });
  }
  if (executed.status === "blocked") {
    return errorResult(req, executed.code, executed.code, {
      operation: "execute",
      status: "blocked",
      data: { ...executed, hold: fleet.hold },
    });
  }
  return buildResult(req, {
    operation: "execute",
    status: executed.status,
    data: { ...executed, hold: fleet.hold },
  });
}

async function opPublish(req, { fetchImpl } = {}) {
  const params = req.params || {};
  const pageId = assertHooppyPageId(params.page_id || params.hooppy_page_id);
  const route = HOOPPY_CAESTHETIC_PAGES[pageId];
  const idempotencyKey = String(params.idempotency_key || req.request_id);
  const prior = alreadyCompleted(idempotencyKey);
  if (prior) {
    return buildResult(req, {
      operation: "publish",
      status: "already_completed",
      data: { idempotency_key: idempotencyKey, prior_status: prior.status, resent: false, page_id: pageId },
    });
  }
  const published = await publishExistingPackage({
    pageId,
    contentRef: params.content_ref,
    packageId: params.package_id,
    fetchImpl,
    token: loadHooppyToken(),
  });
  if (published.hooppy_post_id || published.terminal === "LIVE_VERIFIED") {
    writeIntent({
      idempotency_key: idempotencyKey,
      request_id: req.request_id,
      action: "publish",
      status: published.terminal || published.status,
      page_id: pageId,
      hooppy_post_id: published.hooppy_post_id || null,
    });
  }
  return buildResult(req, {
    operation: "publish",
    status: published.status,
    data: {
      ...published,
      platform: route.platform,
    },
  });
}

async function opFullRun(req, deps) {
  const selected = Array.isArray(req.params?.surfaces) && req.params.surfaces.length
    ? req.params.surfaces.map(String)
    : Object.keys(SURFACES);
  const readiness = await opReadiness({ ...req, params: { surfaces: selected } }, deps);
  const window = windowState();
  const packages = listReadyPackages();
  const surfaces = [];
  let verifiedSends = 0;
  for (const row of readiness.data.surfaces) {
    const queue = inspectSurfaceQueue(row.surface_account_id);
    let terminal;
    if (row.blockers.includes("NO_DOLPHIN_BINDING")) terminal = "BLOCKER(NO_DOLPHIN_BINDING)";
    else if (row.blockers.includes("YOUTUBE_DOLPHIN_FORBIDDEN") && queue.ready_n === 0) {
      terminal = "NO_ACTION_PROVEN(youtube_hooppy_only_no_due_package)";
    } else if (row.blockers.some((code) => code === readiness.data.hold.code || code === "HOLD" || code === "automatic_safety_hold" || code === "CHALLENGE_OR_RESTRICTION")) {
      terminal = `BLOCKER(${readiness.data.hold.code || row.blockers[0]})`;
    } else if (!queue.queue_checked) {
      terminal = "NO_ACTION_PROVEN(queue_unchecked)";
    } else if (queue.ready_n > 0 && !window.open) {
      terminal = "NO_ACTION_PROVEN(WINDOW_CLOSED)";
    } else if (queue.ready_n === 0) {
      terminal = "NO_ACTION_PROVEN(queue_checked_empty)";
    } else if (row.execute_allowed && window.open && row.surface_account_id === "valeria-lana-linkedin") {
      const one = await opExecute({
        ...req,
        request_id: `${req.request_id}-li-one`,
        params: {
          surface_account_id: "valeria-lana-linkedin",
          action: "inmail",
          idempotency_key: `${req.request_id}-li-one`,
          content_ref: "/var/lib/social-fleet/protected/caesthetic-inmail-production-queue.json",
        },
      });
      terminal = one.data?.terminal || one.status;
      if (terminal === "ACTION_VERIFIED") verifiedSends += 1;
    } else {
      terminal = `BLOCKER(${row.blockers[0] || "not_execute_allowed"})`;
    }
    surfaces.push({
      surface_account_id: row.surface_account_id,
      terminal,
      blockers: row.blockers,
      execute_allowed: row.execute_allowed,
      inventory_size: queue.inventory_size,
      ready_n: queue.ready_n,
      queue_checked: queue.queue_checked,
      independent: true,
    });
  }
  return buildResult(req, {
    operation: "full_run",
    status: "success",
    data: {
      hold: readiness.data.hold,
      window,
      packages_seen: packages.length,
      packages_ready: packages.filter((row) => row.ready).length,
      surfaces,
      verified_sends: verifiedSends,
      independent_failures_do_not_stop_others: true,
      scheduler: "existing_social_fleet_only",
    },
  });
}

async function opReconcile(req, { fetchImpl } = {}) {
  const params = req.params || {};
  const targetId = String(params.previous_request_id || params.idempotency_key || req.request_id);
  const intent = readIntent(params.idempotency_key || targetId);
  const previous = readJson(path.join(REPO_ROOT, "docs/agent-api/results", `${targetId}.json`), null);
  const data = await reconcileUncertain({
    previous,
    intent,
    params,
    fetchImpl,
    token: loadHooppyToken(),
  });
  return buildResult(req, {
    operation: "reconcile",
    status: "success",
    data,
  });
}

async function opStop(req) {
  const jobId = String(req.params?.job_id || "");
  if (!jobId) return errorResult(req, "missing_job_id", "params.job_id required", { operation: "stop" });
  try {
    const cancelled = cancelOwnedJob(jobId);
    return buildResult(req, { operation: "stop", status: "success", data: cancelled });
  } catch (err) {
    return errorResult(req, err.code || "stop_failed", err.message, { operation: "stop", status: "error" });
  }
}

async function opRecoverHold(req) {
  const fleet = readFleetSnapshot();
  if (!fleet.hold.active) {
    return buildResult(req, {
      operation: "recover_hold",
      status: "success",
      data: { hold_cleared: false, reason: "hold_not_present", hold: fleet.hold },
    });
  }
  return buildResult(req, {
    operation: "recover_hold",
    status: "blocked",
    errors: [{ code: fleet.hold.code || "HOLD", message: "hold_retained_until_authenticated_health" }],
    data: {
      hold_cleared: false,
      hold: fleet.hold,
      note: "recover_hold never lifts HOLD just because a start was requested. Owner must clear the checkpoint in Dolphin 833304152, then a later readiness check can recover through the existing path.",
    },
  });
}

const HANDLERS = {
  health: opHealth,
  readiness: opReadiness,
  status: opStatus,
  inbox: opInbox,
  execute: opExecute,
  publish: opPublish,
  full_run: opFullRun,
  reconcile: opReconcile,
  stop: opStop,
  recover_hold: opRecoverHold,
};

export async function dispatch(req, deps = {}) {
  const errors = validateRequest(req);
  if (errors.length) {
    const unsupported = errors.find((row) => row.code === "unsupported_operation" || row.message?.startsWith("unsupported_operation"));
    return errorResult(req, errors[0].code, errors[0].message, {
      status: unsupported ? "unsupported" : "error",
      operation: req.operation || req.action || null,
      data: { errors },
    });
  }
  const operation = assertAllowedOperation(req.operation || req.action);
  if (process.env.CAE_SOCIAL_SKIP_HOST_GUARD !== "1") assertCanonicalAgentHost();
  const marker = idempotencyPath(req.request_id, operation);
  const priorMarker = readJson(marker, null);
  if (priorMarker?.status && !["queued", "queued_on_vds", "processing"].includes(priorMarker.status)) {
    if (["execute", "publish", "full_run"].includes(operation)) {
      return buildResult(req, {
        operation,
        status: "already_completed",
        data: { resent: false, previous_status: priorMarker.status, request_id: req.request_id },
      });
    }
  }
  const handler = HANDLERS[operation];
  let result;
  try {
    result = await handler(req, deps);
  } catch (err) {
    result = errorResult(req, err.code || "internal_error", err.message, { operation });
  }
  writeJson(marker, { status: result.status, generated_at: result.generated_at, operation });
  return result;
}

export function writeResultFile(outputPath, result) {
  mkdirp(path.dirname(outputPath));
  assertNoSecretPayload(result);
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return outputPath;
}

export async function handleBridge({ input, output } = {}) {
  const inputPath = path.isAbsolute(input) ? input : path.join(REPO_ROOT, input);
  const req = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const rid = assertRequestId(req.request_id || path.basename(inputPath, ".json"));
  const outputPath = output
    ? path.isAbsolute(output) ? output : path.join(REPO_ROOT, output)
    : path.join(REPO_ROOT, "docs/agent-api/results", `${rid}.json`);
  let result;
  try {
    result = await dispatch(req);
  } catch (err) {
    result = errorResult(req, err.code || "internal_error", err.message);
  }
  return writeResultFile(outputPath, result);
}

export function markProcessing(req, outputPath) {
  const result = buildResult(req, {
    operation: normalizeOperation(req.operation || req.action),
    status: "processing",
    data: { stage: "received" },
  });
  return writeResultFile(outputPath, result);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");
  if (inputIdx >= 0) {
    handleBridge({ input: args[inputIdx + 1], output: args[args.indexOf("--output") + 1] || undefined })
      .then((out) => {
        console.log(JSON.stringify({ ok: true, output: out }));
      })
      .catch((err) => {
        console.error(JSON.stringify({ ok: false, error: err.message }));
        process.exit(1);
      });
  }
}

export { ALLOWED_OPERATIONS, REQUEST_TYPE, findFleetJob };
