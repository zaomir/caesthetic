/**
 * Existing-operator adapters for the CAESTHETIC social channel.
 * Unknown identity/inbox is never reported as verified or unread_count=0.
 */
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {cachedSessionMatches,localDebuggerEndpoint} from "../../../services/social-browser-operator/scripts/chatgpt-session-supervisor.mjs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  DOLPHIN_PROFILE_ID,
  FLEET_STATE_DIR,
  HOOPPY_CAESTHETIC_PAGES,
  PRIVATE_ROOT,
  REPO_ROOT,
  SURFACES,
  assertPrivateRef,
} from "./allowlist.mjs";
import { aggregateInbox, contentRefHash } from "./sanitize.mjs";
import { createScheduledPost, listSanitizedPosts, reconcileHooppyPost } from "./hooppy.mjs";
import { findFleetJob } from "./fleet-status.mjs";
import { windowState } from "./window.mjs";
import { acquireProfileLease as acquireCanonicalProfileLease, releaseProfileLease } from "../../../services/social-browser-operator/scripts/lib/delfin-profile-lease.mjs";

const PROBE_SOURCE_SHA=createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex');

const DOLPHIN = process.env.DOLPHIN_OPERATOR_PACKAGE || "/opt/dolphin-profile-control/current";
const SBO = process.env.SBO_OPERATOR_PACKAGE || process.env.SBO_PKG_ROOT || "/opt/social-browser-operator/current";
const DRAIN = path.join(
  REPO_ROOT,
  "services/social-browser-operator/scripts/run-caesthetic-sales-lead-inmail-drain-v3-833304152.mjs",
);
const INMAIL_QUEUE = path.join(FLEET_STATE_DIR, "protected", "caesthetic-inmail-production-queue.json");
const SUPPRESSION = path.join(FLEET_STATE_DIR, "protected", "caesthetic-linkedin-suppression.json");
const IDENTITY_CACHE = path.join(PRIVATE_ROOT, "identity-cache.json");
const INBOX_DIR = path.join(PRIVATE_ROOT, "inbox");
const PACKAGE_DIRS = [
  path.join(PRIVATE_ROOT, "packages"),
  path.join(FLEET_STATE_DIR, "packages"),
  path.join(FLEET_STATE_DIR, "protected"),
];
const IDENTITY_TTL_MS = 20 * 60 * 1000;
const ASIDE_IDS = ["9Fc98ODiSIyIxqNF", "je6h6NNzyT1jamDo"];

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tmp, file);
}

function skipBrowser() {
  return process.env.CAE_SOCIAL_SKIP_BROWSER === "1" || process.env.CAE_SOCIAL_SKIP_HOST_GUARD === "1";
}

export function loadInmailQueue(file = INMAIL_QUEUE) {
  const doc = readJson(file, null);
  const rows = Array.isArray(doc?.rows) ? doc.rows : [];
  const byStatus = {};
  for (const row of rows) {
    const status = String(row.status || row.state || "unknown");
    byStatus[status] = (byStatus[status] || 0) + 1;
  }
  return {
    path_present: fs.existsSync(file),
    schema: doc?.schema || null,
    writes_allowed: doc?.writes_allowed === true,
    total: rows.length,
    by_status: byStatus,
    ready: rows.filter((row) => String(row.status || "") === "ready"),
    sent: rows.filter((row) => String(row.status || "") === "sent"),
    rows,
  };
}

export function findQueueItem({ queue_item_id, idempotency_key, content_ref } = {}) {
  const queue = loadInmailQueue();
  const wanted = [queue_item_id, idempotency_key].map((v) => String(v || "").trim()).filter(Boolean);
  const match = queue.rows.find((row) => {
    const keys = [row.candidate_id, row.idempotency_key, row.queue_item_id, row.id].map((v) => String(v || ""));
    return wanted.some((value) => keys.includes(value));
  });
  return {
    queue,
    item: match || null,
    content_ref: content_ref || (queue.path_present ? INMAIL_QUEUE : null),
  };
}

export function suppressionChecked(candidateId) {
  const doc = readJson(SUPPRESSION, { entries: [] });
  const entries = Array.isArray(doc.entries) ? doc.entries : [];
  const id = String(candidateId || "");
  return entries.some((row) => String(row.candidate_id || row.id || "") === id);
}

export function asideConflict({ now = new Date() } = {}) {
  const running = fs.existsSync(path.join(FLEET_STATE_DIR, "queue", "running"))
    ? fs.readdirSync(path.join(FLEET_STATE_DIR, "queue", "running")).filter((name) => name.endsWith(".json"))
    : [];
  for (const name of running) {
    const job = readJson(path.join(FLEET_STATE_DIR, "queue", "running", name), {});
    const source = String(job.source || job.worker || "");
    if (source && source !== "caesthetic-social" && source !== "chatgpt") {
      return { conflict: true, code: "ASIDE_OR_FOREIGN_SESSION", job_id: job.job_id || name, source };
    }
  }
  const events = path.join(FLEET_STATE_DIR, "events.jsonl");
  if (fs.existsSync(events)) {
    const tail = fs.readFileSync(events, "utf8").split(/\n/).slice(-80);
    const recent = tail.filter((line) => ASIDE_IDS.some((id) => line.includes(id)));
    if (recent.length) {
      const last = recent[recent.length - 1];
      const ts = Date.parse(last.match(/"ts_utc":"([^"]+)"/)?.[1] || "");
      if (Number.isFinite(ts) && now.getTime() - ts < 30 * 60 * 1000) {
        return { conflict: true, code: "ASIDE_RECENT_ACTIVITY", visible_from_vps: true };
      }
    }
  }
  return { conflict: false, visible_from_vps: false, ids: ASIDE_IDS };
}

function classifySnapshot(url, title, text) {
  const blob = `${url}\n${title}\n${text}`;
  if (/\/login|\/uas\/login|\/authwall/i.test(url) || (/log in|sign in/i.test(text) && /password/i.test(text))) {
    return "login_required";
  }
  if (
    /\/(?:challenge|checkpoint|captcha|account-restricted)/i.test(url) ||
    /security (?:check|verification)|account restricted|temporarily locked|suspicious activity|unusual activity/i.test(blob)
  ) {
    return "challenge";
  }
  return "ok";
}

export function canAdoptSupervisorSession(parked,running,command,version) {
  try {
    return parked?.holder==='sbo-chatgpt-sessions' &&
      cachedSessionMatches(parked,running,command,DOLPHIN_PROFILE_ID) &&
      localDebuggerEndpoint(version,Number(parked.debug_port))===parked.cdp_endpoint;
  } catch {return false;}
}

export function verifiedLinkedInSelf(snapshot) {
  // The self route may stay /in/me in the live SPA; require the observed account heading too.
  return /^https:\/\/www\.linkedin\.com\/in\/(?:me|valerie-petra-uk)\/?(?:[?#]|$)/i.test(snapshot.url || '') &&
    /^(valeriia petrova|valerie petra|валерия петрова)$/i.test(String(snapshot.heading || '').trim());
}

export function validLinkedInAttestation(cached, { now = Date.now(), sourceSha = PROBE_SOURCE_SHA } = {}) {
  const age = now - Date.parse(cached?.generated_at || '');
  return Number.isFinite(age) && age >= 0 && age <= IDENTITY_TTL_MS &&
    cached.platform === 'linkedin' && cached.profile_id === DOLPHIN_PROFILE_ID &&
    cached.surface_account_id === 'valeria-lana-linkedin' && cached.identity_proof === 'linkedin_in_me_v1' &&
    cached.probe_source_sha256 === sourceSha && ['www.linkedin.com', 'linkedin.com'].includes(cached.observed_url_host);
}

function readIdentityCache(now = Date.now()) {
  const cached = readJson(IDENTITY_CACHE, null);
  return validLinkedInAttestation(cached, { now }) ? cached : null;
}

export function listReadyPackages() {
  const found = [];
  for (const dir of PACKAGE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const file = path.join(dir, name);
      const doc = readJson(file, null);
      if (!doc || typeof doc !== "object") continue;
      const ready =
        doc.production_status === "PLATFORM_VARIANTS_READY" &&
        doc.qa_status === "PASS" &&
        !doc.hooppy_post_id;
      found.push({
        path: file,
        ready,
        production_status: doc.production_status || null,
        qa_status: doc.qa_status || null,
        hooppy_post_id: doc.hooppy_post_id || doc.platforms?.instagram?.hooppy_post_id || null,
        page_id: doc.page_id || doc.hooppy_page_id || null,
      });
    }
  }
  return found;
}

async function runLinkedInProbe({ holder = "cae-social-readiness", onVerified = null } = {}) {
  const holdFile=path.join(FLEET_STATE_DIR,"profiles/valeriia-lana/HOLD");
  const holdHash=fs.existsSync(holdFile)?createHash("sha256").update(fs.readFileSync(holdFile)).digest("hex"):null;
  if (skipBrowser()) {
    return {
      probed: false,
      identity_state: "unchecked",
      identity_verified: false,
      messaging_open: false,
      unread_count: null,
      code: "BROWSER_SKIPPED",
    };
  }
  // Retain the supervisor's protected handoff before it voluntarily clears ownership.
  const {readOperatorState,writeOperatorState}=await import(pathToFileURL(path.join(DOLPHIN,'dist/browser/state.js')).href);
  const directHandoff=await readOperatorState(DOLPHIN_PROFILE_ID).catch(()=>null);
  const handoffs=[{source:'operator_state',state:directHandoff},
    {source:'supervisor_cache',state:(!directHandoff||directHandoff.holder==='sbo-chatgpt-sessions')?readJson(`/var/lib/sbo-chatgpt-sessions/${DOLPHIN_PROFILE_ID}.json`):null}].filter(r=>r.state);
  const adoptionDiagnostics={candidates:handoffs.map(r=>({source:r.source,supervisor:r.state.holder==='sbo-chatgpt-sessions',has_browser_pid:!!r.state.browser_pid,has_run_id:!!r.state.dolphin_run_id})),adopted:false};
  // Own the cross-project operation lock before any lifecycle action, including a failed start's cleanup.
  const {acquireProfileOpLock}=await import(pathToFileURL(path.join(SBO,'dist/browser/profile-op-lock.js')).href);
  let operationLock;
  try {operationLock=await acquireProfileOpLock(DOLPHIN_PROFILE_ID,{holder,waitMs:0});}
  catch {return {probed:false,identity_verified:false,messaging_open:false,code:'PROFILE_OPERATION_BUSY'};}
  // Cooperatively request the read-only supervisor to yield; never reclaim a live writer's lease.
  const acquired = acquireCanonicalProfileLease(DOLPHIN_PROFILE_ID, {
    ownerPid: process.pid, holder, jobId: `cae-social-probe-${process.pid}`, ttlMs: 20 * 60 * 1000,
    leaseDir: path.join(FLEET_STATE_DIR, 'leases'),
  });
  const lease = acquired.acquired ? {lease: acquired.record, path: acquired.path,
    release: () => releaseProfileLease(DOLPHIN_PROFILE_ID, {ownerPid: process.pid, leaseId: acquired.record.lease_id, leaseDir: path.join(FLEET_STATE_DIR, 'leases')})} : null;
  if (!lease) {
    await operationLock.release();
    return {
      probed: false,
      identity_state: "unchecked",
      identity_verified: false,
      messaging_open: false,
      unread_count: null,
      code: "PROFILE_LEASE_BUSY",
    };
  }
  const startScript = path.join(DOLPHIN, "scripts/operator-start.mjs");
  const stopScript = path.join(DOLPHIN, "scripts/operator-stop.mjs");
  const env = {
    ...process.env,
    SBO_PROFILE_LEASE_ID: lease.lease.lease_id,
    SBO_PROFILE_LEASE_PATH: lease.path,
    DOLPHIN_OPERATOR_PACKAGE: DOLPHIN,
    SBO_OPERATOR_PACKAGE: SBO,
  };
  let adopted=false;
  try {
    const {loadDolphinOperatorEnv}=await import(pathToFileURL(path.join(DOLPHIN,'scripts/lib/env.mjs')).href);
    const {loginDolphinLocal,getRunningProfiles}=await import(pathToFileURL(path.join(DOLPHIN,'dist/browser/dolphin-local-client.js')).href);
    const e=loadDolphinOperatorEnv(),c={localApiUrl:e.DOLPHIN_LOCAL_API_URL||'http://127.0.0.1:3001',apiToken:e.DOLPHIN_API_TOKEN};
    const token=await loginDolphinLocal(c),running=(await getRunningProfiles(c,token))[DOLPHIN_PROFILE_ID];
    for(const candidate of handoffs) {
      try {
      const parked=candidate.state;
      if(!running || !Number(parked.browser_pid) || Number(parked.browser_pid)!==Number(running.pid))continue;
      const command=fs.readFileSync(`/proc/${Number(running.pid)}/cmdline`,'utf8');
      const response=await fetch(`http://127.0.0.1:${Number(parked.debug_port)}/json/version`,{signal:AbortSignal.timeout(3000),redirect:'error'});
      const version=await response.json();
      if(canAdoptSupervisorSession(parked,running,command,version)) {
        await writeOperatorState({...parked,owner_pid:process.pid,holder,lease_id:lease.lease.lease_id,updated_at:new Date().toISOString()});
        adopted=true;adoptionDiagnostics.adopted=true;adoptionDiagnostics.source=candidate.source;break;
      }
      } catch {} // A stale logical handoff must not hide a valid preserved supervisor cache.
    }
  } catch {}
  const started = adopted ? {status:0} : spawnSync(process.execPath, [startScript, DOLPHIN_PROFILE_ID, `--holder=${holder}`], {
    encoding: "utf8",
    env,
    timeout: 180_000,
  });
  if (started.status !== 0) {
    lease.release();
    await operationLock.release();
    return {
      probed: false,
      identity_state: "unchecked",
      identity_verified: false,
      messaging_open: false,
      unread_count: null,
      code: "PROFILE_START_FAILED",
      adoption_diagnostics:adoptionDiagnostics,
      detail: String(started.stderr || started.stdout || "").slice(0, 240),
    };
  }
  let session = null, selfDiagnostics = null;
  let result = {
    probed: true,
    identity_state: "unchecked",
    identity_verified: false,
    messaging_open: false,
    unread_count: null,
    code: null,
  };
  try {
    const { connectSocialSession } = await import(pathToFileURL(path.join(SBO, "dist/browser/connect.js")).href);
    session = await connectSocialSession(DOLPHIN_PROFILE_ID, /linkedin\.com/i);
    const page = session.page;
    await page.goto("https://www.linkedin.com/in/me/", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    }).catch(() => null);
    await page.locator("main h1, main section h2").first().waitFor({state:"visible", timeout:15000}).catch(() => null);
    const identitySnap = await page.evaluate(() => ({
      heading: (document.querySelector("main")?.querySelector("section") || document.querySelector("main"))?.querySelector("h1,h2")?.textContent || "",
      url: location.href,
      title: document.title,
      text: (document.body?.innerText || "").slice(0, 8000),
    }));
    const observedPath=new URL(identitySnap.url).pathname.replace(/\/$/,'');
    selfDiagnostics={known_path:['/in/me','/in/valerie-petra-uk','/in/valeriia-petrova-uk','/feed','/login','/checkpoint'].includes(observedPath)?observedPath:'other',
      heading_present:!!identitySnap.heading,heading_exact:/^(valeriia petrova|valerie petra|валерия петрова)$/i.test(String(identitySnap.heading||'').trim()),
      heading_contains_known:/valeriia petrova|valerie petra|валерия петрова/i.test(identitySnap.heading||''),title_contains_known:/valeriia petrova|valerie petra|валерия петрова/i.test(identitySnap.title||'')};
    const identityClass = classifySnapshot(identitySnap.url, identitySnap.title, identitySnap.text);
    if (identityClass !== "ok") {
      result = {
        ...result,
        identity_state: identityClass,
        code: identityClass === "challenge" ? "CHALLENGE_OR_RESTRICTION" : "LOGIN_REQUIRED",
        observed_url_host: safeHost(identitySnap.url),
      };
    } else if (!verifiedLinkedInSelf(identitySnap)) {
      result = { ...result, identity_state: "mismatch", code: "IDENTITY_MISMATCH" };
    } else {
      await page.goto("https://www.linkedin.com/messaging/", {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      }).catch(() => null);
      const inboxSnap = await page.evaluate(() => ({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || "").slice(0, 8000),
        unread: document.querySelectorAll(
          "[aria-label*='unread' i], .msg-conversation-card--unread, [class*='unread']",
        ).length,
      }));
      const inboxClass = classifySnapshot(inboxSnap.url, inboxSnap.title, inboxSnap.text);
      result = {
        probed: true,
        identity_state: inboxClass === "ok" ? "verified" : inboxClass,
        identity_verified: inboxClass === "ok",
        messaging_open: inboxClass === "ok" && /linkedin\.com\/messaging/i.test(inboxSnap.url),
        unread_count: inboxClass === "ok" ? Number(inboxSnap.unread || 0) : null,
        code: inboxClass === "challenge" ? "CHALLENGE_OR_RESTRICTION" : inboxClass === "login_required" ? "LOGIN_REQUIRED" : null,
        observed_url_host: safeHost(inboxSnap.url),
      };
      if (result.identity_verified && result.messaging_open && onVerified) await onVerified(page);
    }
  } catch (err) {
    result = {
      probed: false,
      identity_state: "unchecked",
      identity_verified: false,
      messaging_open: false,
      unread_count: null,
      code: err.code || "PROBE_FAILED",
      detail: String(err.message || err).slice(0, 240),
    };
  } finally {
    spawnSync(process.execPath, [stopScript, DOLPHIN_PROFILE_ID], {
      encoding: "utf8",
      env,
      timeout: 120_000,
    });
    if (session) await session.release().catch(() => {});
    lease.release();
    await operationLock.release();
  }
  // Independently verify Local API stop; operator-stop itself uses best-effort cleanup.
  let profileStopped=false;
  try {
    const {loadDolphinOperatorEnv}=await import(pathToFileURL(path.join(DOLPHIN,'scripts/lib/env.mjs')).href);
    const {loginDolphinLocal,getRunningProfiles}=await import(pathToFileURL(path.join(DOLPHIN,'dist/browser/dolphin-local-client.js')).href);
    const e=loadDolphinOperatorEnv(),c={localApiUrl:e.DOLPHIN_LOCAL_API_URL||'http://127.0.0.1:3001',apiToken:e.DOLPHIN_API_TOKEN};
    const t=await loginDolphinLocal(c);profileStopped=!(await getRunningProfiles(c,t))[DOLPHIN_PROFILE_ID];
  } catch {}
  result.identity_proof='linkedin_in_me_v1';
  result.platform='linkedin';
  result.profile_id=DOLPHIN_PROFILE_ID;
  result.surface_account_id='valeria-lana-linkedin';
  result.self_diagnostics=selfDiagnostics;
  result.adoption_diagnostics=adoptionDiagnostics;
  result.profile_stopped=profileStopped;
  result.hold_sha256=holdHash;
  result.probe_source_sha256=PROBE_SOURCE_SHA;
  result.generated_at = new Date().toISOString();
  writeJson(IDENTITY_CACHE, result);
  if (result.identity_verified) {
    const privateInbox = {
      surface_account_id: "valeria-lana-linkedin",
      unread: result.unread_count > 0,
      unread_count: result.unread_count,
      thread_ref: "host:linkedin-messaging",
      platform: "linkedin",
      draft_ref: null,
      observed_at: result.generated_at,
    };
    writeJson(path.join(INBOX_DIR, "valeria-lana-linkedin.json"), privateInbox);
  }
  return result;
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export async function probeIdentity({ force = false, onVerified = null } = {}) {
  if (!force && !onVerified) {
    const cached = readIdentityCache();
    if (cached) return { ...cached, cached: true };
  }
  return runLinkedInProbe({onVerified});
}

export function surfaceIdentity(surfaceId, probe) {
  const surface = SURFACES[surfaceId];
  if (!surface) {
    return { identity_verified: false, identity_state: "unknown_surface" };
  }
  if (surface.blocked_code) {
    return { identity_verified: false, identity_state: "blocked", code: surface.blocked_code };
  }
  if (surface.dolphin_forbidden) {
    return { identity_verified: false, identity_state: "youtube_hooppy_only", code: "YOUTUBE_DOLPHIN_FORBIDDEN" };
  }
  if (!probe?.probed) {
    return { identity_verified: false, identity_state: "unchecked", code: probe?.code || "IDENTITY_UNCHECKED" };
  }
  if (surfaceId === "valeria-lana-linkedin") {
    if (!validLinkedInAttestation(probe)) return { identity_verified: false, identity_state: 'unchecked', code: 'SURFACE_ATTESTATION_INVALID' };
    return {
      identity_verified: probe.identity_verified === true,
      identity_state: probe.identity_state,
      messaging_open: probe.messaging_open === true,
      code: probe.code || null,
    };
  }
  return { identity_verified: false, identity_state: "unchecked", code: "SURFACE_NOT_PROBED" };
}

export async function readInbox(surfaceId = "valeria-lana-linkedin") {
  const probe = await probeIdentity();
  if (surfaceId === "valeria-lana-linkedin" && probe.identity_verified) {
    const stored = readJson(path.join(INBOX_DIR, "valeria-lana-linkedin.json"), null);
    const threads = stored
      ? [{ thread_ref: stored.thread_ref, platform: "linkedin", unread: stored.unread === true, draft_ref: stored.draft_ref }]
      : [{ thread_ref: "host:linkedin-messaging", platform: "linkedin", unread: Number(probe.unread_count || 0) > 0, draft_ref: null }];
    return {
      ...aggregateInbox(threads, { read: true }),
      unread_count: probe.unread_count,
      identity_state: probe.identity_state,
      probed: true,
    };
  }
  return {
    ...aggregateInbox(null, { read: false }),
    identity_state: probe.identity_state || "unchecked",
    probed: Boolean(probe.probed),
    reason: probe.code || "INBOX_NOT_READ",
  };
}

export function inspectSurfaceQueue(surfaceId) {
  const surface = SURFACES[surfaceId] || { surface_account_id: surfaceId };
  const window = windowState();
  if (surfaceId === "valeria-lana-linkedin") {
    const queue = loadInmailQueue();
    return {
      surface_account_id: surfaceId,
      inventory_size: queue.total,
      ready_n: queue.ready.length,
      sent_n: queue.sent.length,
      writes_allowed: queue.writes_allowed,
      queue_checked: queue.path_present,
      window,
    };
  }
  if (surfaceId === "caesthetic-instagram") {
    return {
      surface_account_id: surfaceId,
      inventory_size: null,
      ready_n: 0,
      queue_checked: true,
      registry_execute: surface.execute === true,
      cold_dm: surface.cold_dm,
      note: "CURRENT/wave stay on host; cold DM remains 0",
      window,
    };
  }
  if (surface.hooppy_page_id) {
    const packages = listReadyPackages().filter((row) => !row.page_id || row.page_id === surface.hooppy_page_id);
    return {
      surface_account_id: surfaceId,
      inventory_size: packages.length,
      ready_n: packages.filter((row) => row.ready).length,
      queue_checked: true,
      hooppy_page_id: surface.hooppy_page_id,
      window,
    };
  }
  return {
    surface_account_id: surfaceId,
    inventory_size: 0,
    ready_n: 0,
    queue_checked: true,
    window,
  };
}

function runDrainOne({ candidateId, requestId }) {
  const output = path.join(
    FLEET_STATE_DIR,
    "runs",
    "cae-social-execute",
    `${requestId}.json`,
  );
  const env = {
    ...process.env,
    SBO_CAESTHETIC_INMAIL_ONLY_CANDIDATE_ID: candidateId,
    SBO_CAESTHETIC_INMAIL_MAX_SENDS: "1",
    SBO_CAESTHETIC_SALES_LEAD_INMAIL_OUTPUT: output,
    SBO_CAESTHETIC_SALES_LEAD_INMAIL_BUDGET_MS: String(12 * 60 * 1000),
    SBO_FLEET_STATE_DIR: FLEET_STATE_DIR,
    DOLPHIN_OPERATOR_PACKAGE: DOLPHIN,
    SBO_PKG_ROOT: SBO,
  };
  const spawned = spawnSync(process.execPath, [DRAIN], {
    encoding: "utf8",
    env,
    timeout: 15 * 60 * 1000,
    maxBuffer: 4 * 1024 * 1024,
  });
  const report = readJson(output, null);
  return {
    exit_code: spawned.status,
    report,
    output,
    stderr: String(spawned.stderr || "").slice(0, 400),
  };
}

export async function executeExistingItem({
  surface,
  action,
  contentRef,
  queueItemId,
  idempotencyKey,
  requestId,
}) {
  const window = windowState();
  const aside = asideConflict();
  if (aside.conflict) {
    return {
      status: "blocked",
      code: aside.code,
      resent: false,
      window,
      terminal: `BLOCKER(${aside.code})`,
    };
  }
  if (!window.open) {
    return {
      status: "blocked",
      code: "WINDOW_CLOSED",
      resent: false,
      window,
      retained_in_existing_queue: true,
      terminal: "NO_ACTION_PROVEN(WINDOW_CLOSED)",
    };
  }
  const resolved = findQueueItem({
    queue_item_id: queueItemId || idempotencyKey,
    idempotency_key: idempotencyKey,
    content_ref: contentRef,
  });
  if (contentRef) assertPrivateRef(contentRef, "content_ref");
  if (!resolved.item) {
    return {
      status: "NO_ACTION_PROVEN",
      code: "QUEUE_ITEM_NOT_FOUND",
      resent: false,
      queue_checked: true,
      inventory_size: resolved.queue.total,
      ready_n: resolved.queue.ready.length,
      terminal: "NO_ACTION_PROVEN(QUEUE_ITEM_NOT_FOUND)",
    };
  }
  if (resolved.item.status === "sent") {
    return {
      status: "already_completed",
      code: "already_sent",
      resent: false,
      candidate_ref: contentRefHash(resolved.item.candidate_id),
      terminal: "already_completed",
    };
  }
  if (suppressionChecked(resolved.item.candidate_id) && resolved.item.suppression_checked !== true) {
    return {
      status: "blocked",
      code: "SUPPRESSION",
      resent: false,
      terminal: "BLOCKER(SUPPRESSION)",
    };
  }
  if (skipBrowser()) {
    return {
      status: "blocked",
      code: "BROWSER_SKIPPED",
      resent: false,
      terminal: "NO_ACTION_PROVEN(BROWSER_SKIPPED)",
    };
  }
  const drain = runDrainOne({
    candidateId: resolved.item.candidate_id,
    requestId,
  });
  const actionRow = Array.isArray(drain.report?.actions) ? drain.report.actions[0] : null;
  const accepted = actionRow?.accepted_state === "SENT" && actionRow?.evidence_url;
  if (accepted) {
    return {
      status: "success",
      terminal: "ACTION_VERIFIED",
      resent: false,
      action,
      surface_account_id: surface.surface_account_id,
      candidate_ref: contentRefHash(resolved.item.candidate_id),
      accepted_state: "SENT",
      accepted_at: actionRow.accepted_at || null,
      evidence_host: safeHost(actionRow.evidence_url),
      content_ref_hash: contentRefHash(resolved.content_ref || INMAIL_QUEUE),
      report_ref: drain.output,
    };
  }
  return {
    status: drain.report?.blocked ? "blocked" : "error",
    code: drain.report?.stop_reason || drain.report?.error || "ACCEPTED_STATE_UNVERIFIED",
    resent: false,
    terminal: drain.report?.blocked
      ? `BLOCKER(${drain.report.stop_reason || "uncertain"})`
      : "uncertain",
    report_ref: drain.output,
    queue_checked: true,
  };
}

export async function publishExistingPackage({
  pageId,
  contentRef,
  packageId,
  fetchImpl,
  token,
}) {
  const packages = listReadyPackages();
  let file = contentRef || packageId || null;
  if (file) file = assertPrivateRef(file, "content_ref");
  if (!file) {
    const ready = packages.find((row) => row.ready && (!row.page_id || row.page_id === pageId));
    if (!ready) {
      let posts = { total_rows: 0, posts: [] };
      try {
        posts = await listSanitizedPosts({ fetchImpl, pageId, token });
      } catch (err) {
        posts = { total_rows: 0, posts: [], error: err.code || err.message };
      }
      return {
        status: "NO_ACTION_PROVEN",
        reason: "no_due_package",
        queue_checked: true,
        packages_seen: packages.length,
        page_id: pageId,
        hooppy_queue: posts,
        resent: false,
      };
    }
    file = ready.path;
  }
  const pkg = readJson(file, null);
  if (!pkg) {
    return { status: "blocked", code: "PACKAGE_NOT_FOUND", page_id: pageId, resent: false };
  }
  if (pkg.hooppy_post_id || pkg.platforms && Object.values(pkg.platforms).some((row) => row?.hooppy_post_id)) {
    const existingId = pkg.hooppy_post_id || Object.values(pkg.platforms).find((row) => row?.hooppy_post_id)?.hooppy_post_id;
    const rec = await reconcileHooppyPost({ fetchImpl, token, hooppyPostId: existingId, pageId });
    return {
      status: rec.status === "LIVE_VERIFIED" ? "already_completed" : "success",
      terminal: rec.status,
      resent: false,
      hooppy_post_id: existingId,
      page_id: pageId,
    };
  }
  if (pkg.production_status !== "PLATFORM_VARIANTS_READY" || pkg.qa_status !== "PASS") {
    return {
      status: "NO_ACTION_PROVEN",
      reason: "package_not_ready",
      page_id: pageId,
      production_status: pkg.production_status || null,
      qa_status: pkg.qa_status || null,
      resent: false,
    };
  }
  const route = HOOPPY_CAESTHETIC_PAGES[pageId];
  const platformName = Object.keys(pkg.platforms || {}).find((name) => {
    const row = pkg.platforms[name];
    return String(row?.page_id || "") === String(pageId) || name === route?.platform;
  });
  const variant = platformName ? pkg.platforms[platformName] : null;
  if (!variant?.media_id && !variant?.hooppy_media_id) {
    return {
      status: "NO_ACTION_PROVEN",
      reason: "package_missing_media_id",
      page_id: pageId,
      resent: false,
    };
  }
  const created = await createScheduledPost({
    token,
    fetchImpl,
    pageId,
    sourceId: route.source_id,
    caption: variant.caption,
    mediaId: variant.media_id || variant.hooppy_media_id,
    publicationDate: pkg.publication_date || variant.publication_date,
  });
  const rec = await reconcileHooppyPost({
    fetchImpl,
    token,
    hooppyPostId: created.hooppy_post_id,
    pageId,
  });
  return {
    status: rec.status === "LIVE_VERIFIED" ? "success" : "success",
    terminal: rec.status === "LIVE_VERIFIED" ? "LIVE_VERIFIED" : rec.status === "queued" ? "QUEUED_NOT_LIVE" : rec.status,
    resent: false,
    hooppy_post_id: created.hooppy_post_id,
    page_id: pageId,
    published_url: rec.post?.published_url || null,
    live_verified: rec.status === "LIVE_VERIFIED",
  };
}

export async function reconcileUncertain({ previous, intent, params, fetchImpl, token }) {
  if (params?.hooppy_post_id) {
    const rec = await reconcileHooppyPost({
      fetchImpl,
      token,
      hooppyPostId: params.hooppy_post_id,
      pageId: params.page_id,
    });
    return { resent: false, resolution: rec.status, hooppy: rec, previous_status: previous?.status || intent?.status || null };
  }
  if (intent?.job_id) {
    const job = findFleetJob(intent.job_id);
    if (job?.job?.result) {
      return {
        resent: false,
        resolution: job.job.result.terminal_state || job.job.result.accepted_state || job.bucket,
        job_bucket: job.bucket,
        previous_status: previous?.status || intent.status,
      };
    }
  }
  if (intent?.candidate_ref || params?.idempotency_key || params?.queue_item_id) {
    const found = findQueueItem({
      queue_item_id: params.queue_item_id,
      idempotency_key: params.idempotency_key || intent?.idempotency_key,
    });
    if (found.item?.status === "sent") {
      return {
        resent: false,
        resolution: "ACTION_VERIFIED",
        previous_status: previous?.status || intent?.status,
        candidate_ref: contentRefHash(found.item.candidate_id),
      };
    }
    if (found.item) {
      return {
        resent: false,
        resolution: found.item.status === "ready" ? "NOT_SENT" : found.item.status,
        previous_status: previous?.status || intent?.status,
        queue_checked: true,
      };
    }
  }
  if (intent?.status === "intended" || intent?.status === "uncertain" || previous?.data?.terminal === "uncertain") {
    return {
      resent: false,
      resolution: "STILL_UNCERTAIN",
      previous_status: previous?.status || intent?.status,
      note: "No platform receipt found. Do not resend.",
    };
  }
  return {
    resent: false,
    resolution: previous?.status || intent?.status || "nothing_to_reconcile",
    previous_status: previous?.status || intent?.status || null,
  };
}

export { IDENTITY_CACHE, INBOX_DIR, INMAIL_QUEUE };
