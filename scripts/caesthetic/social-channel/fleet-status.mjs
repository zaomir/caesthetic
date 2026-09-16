import fs from "node:fs";
import path from "node:path";
import { FLEET_STATE_DIR, VALERIE_INMAIL_CAPS, remainingInMail } from "./allowlist.mjs";

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function listJson(dir) {
  try {
    return fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }
}

function readHold(file) {
  if (!file || !fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8").trim();
  try {
    const parsed = JSON.parse(text);
    return {
      present: true,
      code: parsed.code || parsed.reason_code || parsed.reason || "HOLD",
      since: parsed.since || parsed.created_at || parsed.ts || null,
    };
  } catch {
    return { present: true, code: text.split("\n")[0].slice(0, 80) || "HOLD", since: null };
  }
}

function countQueue(stateDir) {
  const root = path.join(stateDir, "queue");
  return {
    pending: listJson(path.join(root, "pending")).length,
    running: listJson(path.join(root, "running")).length,
    completed: listJson(path.join(root, "completed")).length,
  };
}

function protectedQueueCounts(stateDir) {
  const file = path.join(stateDir, "protected", "caesthetic-inmail-production-queue.json");
  const doc = readJson(file, { items: [] });
  const items = Array.isArray(doc.rows)
    ? doc.rows
    : Array.isArray(doc.items)
      ? doc.items
      : Array.isArray(doc)
        ? doc
        : [];
  const byStatus = {};
  for (const item of items) {
    const status = String(item.status || item.state || "unknown");
    byStatus[status] = (byStatus[status] || 0) + 1;
  }
  return {
    path_present: fs.existsSync(file),
    total: items.length,
    by_status: byStatus,
    ready: byStatus.ready || byStatus.pending || 0,
  };
}

function inmailUsedFromJournal(stateDir) {
  const drain = path.join(stateDir, "runs", "cae-social-full-20260915-01", "inmail-drain-v3.json");
  const doc = readJson(drain, null);
  const sent = Number(doc?.verified || doc?.sent || 0);
  return {
    day: sent,
    week: sent,
    month: sent,
    source: fs.existsSync(drain) ? "private_journal_ref" : "none",
  };
}

export function readFleetSnapshot({
  stateDir = FLEET_STATE_DIR,
  now = new Date(),
} = {}) {
  const globalHold = readHold(path.join(stateDir, "HOLD"));
  const profileHold =
    readHold(path.join(stateDir, "profiles", "valeriia-lana", "HOLD")) ||
    readHold(path.join(stateDir, "profiles", "valeria-lana", "HOLD")) ||
    readHold(path.join(stateDir, "profiles", "833304152", "HOLD"));
  const queue = countQueue(stateDir);
  const inmailQueue = protectedQueueCounts(stateDir);
  const used = inmailUsedFromJournal(stateDir);
  const remaining = remainingInMail(used, VALERIE_INMAIL_CAPS);
  const leaseFiles = listJson(path.join(stateDir, "leases"));
  return {
    generated_at: now.toISOString(),
    state_dir_present: fs.existsSync(stateDir),
    hold: {
      global: globalHold,
      profile_valeria_lana: profileHold,
      active: Boolean(globalHold || profileHold),
      code: (profileHold || globalHold)?.code || null,
    },
    queue,
    inmail_queue: inmailQueue,
    inmail_remaining: remaining,
    leases: { count: leaseFiles.length },
    aside_routines: {
      visible_from_vps: false,
      ids: ["9Fc98ODiSIyIxqNF", "je6h6NNzyT1jamDo"],
      note: "Do not disable foreign routines. Valerie writes require one executor.",
    },
  };
}

export function findFleetJob(jobId, stateDir = FLEET_STATE_DIR) {
  const id = String(jobId || "").trim();
  if (!id) return null;
  for (const bucket of ["pending", "running", "completed"]) {
    const file = path.join(stateDir, "queue", bucket, `${id}.json`);
    const job = readJson(file, null);
    if (job) return { bucket, path: file, job };
  }
  return null;
}

export function cancelOwnedJob(jobId, { stateDir = FLEET_STATE_DIR, owner = "caesthetic-social" } = {}) {
  const found = findFleetJob(jobId, stateDir);
  if (!found) {
    throw Object.assign(new Error("job_not_found"), { code: "job_not_found" });
  }
  const source = String(found.job.source || found.job.worker || "");
  if (found.bucket === "completed") {
    return { status: "already_completed", job_id: found.job.job_id, bucket: found.bucket };
  }
  if (source !== owner && source !== "chatgpt" && found.job.worker !== owner) {
    throw Object.assign(new Error("foreign_job_not_cancelled"), { code: "foreign_job_not_cancelled" });
  }
  const cancelled = {
    ...found.job,
    status: "cancelled",
    finished_at: new Date().toISOString(),
    result: { status: "cancelled", by: owner },
  };
  const dest = path.join(stateDir, "queue", "completed", `${found.job.job_id}.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
  fs.writeFileSync(dest, `${JSON.stringify(cancelled, null, 2)}\n`, { mode: 0o600 });
  fs.rmSync(found.path, { force: true });
  return { status: "cancelled", job_id: found.job.job_id, previous_bucket: found.bucket };
}
