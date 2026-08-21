#!/usr/bin/env node
/**
 * CAESTHETIC Growth Score operator CLI (DEC-848 / TASK-854).
 * SSOT: docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md
 *
 * Usage:
 *   node scripts/caesthetic/growth-score-ops.mjs drain [--limit N]
 *   node scripts/caesthetic/growth-score-ops.mjs overdue
 *   node scripts/caesthetic/growth-score-ops.mjs transition --case <uuid> --to <state> --actor "First Last" --reason <code>
 *   node scripts/caesthetic/growth-score-ops.mjs deliver --case <uuid> --path /score/<slug>/ --actor "First Last" [--walkthrough-ready] [--report <uuid>]
 *   node scripts/caesthetic/growth-score-ops.mjs reconcile
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OUTBOX_MAX_ATTEMPTS } from "./growth-score-ops-contract.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BOARD_PATH = resolve(ROOT, "docs/projects/caesthetic/operations/growth-score-board.jsonl");
const NOTIFY_TO = process.env.CAESTHETIC_GROWTH_SCORE_NOTIFY_TO || "notifications@caesthetic.com";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "EVO <orders@evo.do>";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

loadEnv();

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function loadEnv() {
  const files = [
    resolve(ROOT, ".env"),
    "/root/.cursor/secrets.env",
    "/etc/evo/secrets.env",
  ];
  for (const file of files) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function fail(message, extra) {
  console.error(JSON.stringify({ ok: false, error: message, extra: extra ?? null }));
  process.exit(1);
}

function headers(json = true) {
  if (!SERVICE_KEY) fail("SUPABASE_SERVICE_ROLE_KEY missing");
  const h = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers(init.method !== "GET" && init.body !== undefined),
      Prefer: init.prefer || "return=representation",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { res, body };
}

async function rpc(fn, payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { res, body };
}

function escHtml(s) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function backoffIso(attempts) {
  const minutes = attempts * attempts;
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

async function fetchLead(leadId) {
  const { res, body } = await rest(
    `caesthetic_growth_score_leads?id=eq.${leadId}&select=id,practice_name,city_state,name,email,source_page,referrer,source_domain,utm_source,utm_medium,utm_campaign,status`,
  );
  if (!res.ok || !Array.isArray(body) || !body[0]) {
    return { ok: false, error: "lead_not_found" };
  }
  return { ok: true, lead: body[0] };
}

async function fetchCase(caseId) {
  const { res, body } = await rest(
    `caesthetic_score_cases?id=eq.${caseId}&select=id,lead_id,state,owner_name,next_action,capacity_state,qa_test,triage_due_at,delivery_due_at`,
  );
  if (!res.ok || !Array.isArray(body) || !body[0]) {
    return { ok: false, error: "case_not_found" };
  }
  return { ok: true, scoreCase: body[0] };
}

async function sendResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY missing" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject,
      html,
      reply_to: ["support@evo.do"],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `resend_${res.status}`, detail: text.slice(0, 200) };
  }
  return { ok: true };
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId =
    process.env.TELEGRAM_EVO_ADMIN_CHAT_ID ||
    process.env.ADMIN_TELEGRAM_CHAT_ID ||
    process.env.ADMIN_TELEGRAM_ID;
  if (!token || !chatId) {
    return { ok: false, error: "telegram_secrets_missing" };
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const textBody = await res.text();
    return { ok: false, error: `telegram_${res.status}`, detail: textBody.slice(0, 200) };
  }
  return { ok: true };
}

function utmClass(lead) {
  return lead?.source_domain || lead?.utm_medium || lead?.utm_source || "direct";
}

async function patchOutbox(id, patch) {
  const { res, body } = await rest(`caesthetic_score_outbox?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return { ok: res.ok, body };
}

async function processNotifyInternalEmail(row, lead, scoreCase) {
  const qa = row.payload?.qa_test === true || scoreCase?.qa_test === true;
  const html = [
    `<h2>${qa ? "[TEST/QA] " : ""}CAESTHETIC · Growth Score request</h2>`,
    qa ? "<p><strong>QA marker:</strong> not a real prospect — archive after verification.</p>" : "",
    `<p><strong>Lead ID:</strong> ${escHtml(lead.id)}</p>`,
    `<p><strong>Score case:</strong> ${escHtml(row.score_case_id)}</p>`,
    `<p><strong>Practice:</strong> ${escHtml(lead.practice_name)}</p>`,
    `<p><strong>City, State:</strong> ${escHtml(lead.city_state)}</p>`,
    `<p><strong>Name:</strong> ${escHtml(lead.name)}</p>`,
    `<p><strong>Email:</strong> ${escHtml(lead.email)}</p>`,
    lead.source_page ? `<p><strong>Source page:</strong> ${escHtml(lead.source_page)}</p>` : "",
    lead.referrer ? `<p><strong>Referrer:</strong> ${escHtml(lead.referrer)}</p>` : "",
    lead.utm_source
      ? `<p><strong>UTM:</strong> ${escHtml(lead.utm_source)} / ${escHtml(lead.utm_medium || "—")} / ${escHtml(lead.utm_campaign || "—")}</p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  return sendResend({
    to: NOTIFY_TO,
    subject: `${qa ? "[TEST/QA] " : ""}Growth Score request · ${String(lead.practice_name).slice(0, 60)} · ${String(lead.id).slice(0, 8)}`,
    html,
  });
}

async function processNotifyAdminTelegram(row, lead, scoreCase) {
  const qa = row.payload?.qa_test === true || scoreCase?.qa_test === true;
  const lines = [
    qa ? "🦋 [TEST/QA] CAESTHETIC · Growth Score request" : "🦋 CAESTHETIC · Growth Score request",
    `Practice: ${lead.practice_name}`,
    `City: ${lead.city_state}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.source_page ? `Page: ${lead.source_page}` : "",
    `Lead ID: ${lead.id}`,
    `Score case: ${row.score_case_id}`,
    qa ? "QA marker: archive after verification — not a real prospect" : "",
  ].filter(Boolean);
  return sendTelegram(lines.join("\n"));
}

async function processNotifyCustomerAck(row, lead) {
  const email = row.payload?.email || lead.email;
  if (!email) return { ok: false, error: "customer_email_missing" };
  const html = [
    "<h2>We received your Growth Score request</h2>",
    `<p>Hi ${escHtml(lead.name)},</p>`,
    "<p>Thank you for requesting a CAESTHETIC Growth Score. Our team will triage your request the same business day.</p>",
    "<p>We will follow up when research begins. We do not promise a delivery date before capacity review.</p>",
    "<p>— CAESTHETIC</p>",
  ].join("\n");
  return sendResend({
    to: email,
    subject: "CAESTHETIC · Growth Score request received",
    html,
  });
}

async function processQueueManualBoard(row, lead, scoreCase) {
  mkdirSync(dirname(BOARD_PATH), { recursive: true });
  const entry = {
    ts: new Date().toISOString(),
    score_case_id: row.score_case_id,
    lead_id: row.lead_id,
    state: scoreCase?.state ?? null,
    owner_name: scoreCase?.owner_name ?? null,
    next_action: row.payload?.next_action ?? scoreCase?.next_action ?? null,
    capacity_state: scoreCase?.capacity_state ?? null,
    qa_test: row.payload?.qa_test === true || scoreCase?.qa_test === true,
    utm_source: lead.utm_source ?? null,
    utm_medium: lead.utm_medium ?? null,
    utm_campaign: lead.utm_campaign ?? null,
    source_page: lead.source_page ?? null,
  };
  appendFileSync(BOARD_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  return { ok: true, board: BOARD_PATH };
}

async function processEmitFunnelEvent(row, lead) {
  const eventName = row.payload?.event_name;
  if (!eventName) return { ok: false, error: "event_name_missing" };
  const payload = {
    score_case_id: row.score_case_id,
    lead_id: row.lead_id,
    event_name: eventName,
    source_class: utmClass(lead),
    utm_source: lead.utm_source ?? null,
    utm_medium: lead.utm_medium ?? null,
    utm_campaign: lead.utm_campaign ?? null,
  };
  const { res, body } = await rpc("emit_caesthetic_score_funnel_event", payload);
  if (!res.ok) {
    return { ok: false, error: body?.message || body?.code || `rpc_${res.status}`, detail: body };
  }
  return { ok: true, body };
}

async function processOutboxRow(row) {
  if (row.status === "sent") {
    return { skipped: true, reason: "already_sent" };
  }

  const leadResult = await fetchLead(row.lead_id);
  if (!leadResult.ok) return { ok: false, error: leadResult.error };

  const caseResult = await fetchCase(row.score_case_id);
  const scoreCase = caseResult.ok ? caseResult.scoreCase : null;
  const lead = leadResult.lead;

  let result;
  switch (row.job_type) {
    case "notify_internal_email":
      result = await processNotifyInternalEmail(row, lead, scoreCase);
      break;
    case "notify_admin_telegram":
      result = await processNotifyAdminTelegram(row, lead, scoreCase);
      break;
    case "notify_customer_ack":
      result = await processNotifyCustomerAck(row, lead);
      break;
    case "queue_manual_board":
      result = await processQueueManualBoard(row, lead, scoreCase);
      break;
    case "emit_funnel_event":
      result = await processEmitFunnelEvent(row, lead);
      break;
    default:
      result = { ok: false, error: `unknown_job_type:${row.job_type}` };
  }

  if (result.ok) {
    await patchOutbox(row.id, {
      status: "sent",
      processed_at: new Date().toISOString(),
      last_error: null,
    });
    if (row.job_type === "notify_internal_email" || row.job_type === "notify_admin_telegram") {
      await rest(`caesthetic_growth_score_leads?id=eq.${row.lead_id}`, {
        method: "PATCH",
        body: JSON.stringify({ notification_sent: true, updated_at: new Date().toISOString() }),
      });
    }
    return { ok: true, job_type: row.job_type, id: row.id };
  }

  const attempts = Number(row.attempts || 0) + 1;
  const maxAttempts = Number(row.max_attempts || OUTBOX_MAX_ATTEMPTS);
  const dead = attempts >= maxAttempts;
  await patchOutbox(row.id, {
    status: dead ? "dead" : "failed",
    attempts,
    last_error: String(result.error || "processing_failed").slice(0, 500),
    available_at: dead ? row.available_at : backoffIso(attempts),
    processed_at: dead ? new Date().toISOString() : null,
  });
  return { ok: false, job_type: row.job_type, id: row.id, attempts, dead, error: result.error };
}

async function cmdDrain(flags) {
  if (!SUPABASE_URL) fail("SUPABASE_URL missing");
  const limit = Math.max(1, Math.min(Number(flags.limit || 50), 200));
  const now = new Date().toISOString();
  const { res, body } = await rest(
    `caesthetic_score_outbox?status=in.(pending,failed)&available_at=lte.${encodeURIComponent(now)}&order=available_at.asc,created_at.asc&limit=${limit}&select=id,score_case_id,lead_id,job_type,payload,status,attempts,max_attempts,available_at`,
  );
  if (!res.ok) fail("outbox_fetch_failed", { status: res.status, body });

  const rows = Array.isArray(body) ? body : [];
  const results = [];
  for (const row of rows) {
    try {
      results.push(await processOutboxRow(row));
    } catch (error) {
      const attempts = Number(row.attempts || 0) + 1;
      const dead = attempts >= Number(row.max_attempts || OUTBOX_MAX_ATTEMPTS);
      await patchOutbox(row.id, {
        status: dead ? "dead" : "failed",
        attempts,
        last_error: String(error?.message || error).slice(0, 500),
        available_at: dead ? row.available_at : backoffIso(attempts),
      });
      results.push({ ok: false, id: row.id, error: "exception", detail: String(error?.message || error) });
    }
  }

  const summary = {
    ok: true,
    command: "drain",
    fetched: rows.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => r.ok === false).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
  };
  console.log(JSON.stringify(summary, null, 2));
}

async function cmdOverdue() {
  if (!SUPABASE_URL) fail("SUPABASE_URL missing");
  const { res, body } = await rest(
    "caesthetic_score_overdue?select=score_case_id,lead_id,state,owner_name,next_action,capacity_state,triage_overdue,delivery_overdue,triage_due_at,delivery_due_at&order=triage_due_at.asc",
  );
  if (!res.ok) fail("overdue_fetch_failed", { status: res.status, body });
  const rows = Array.isArray(body) ? body : [];
  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "overdue",
        count: rows.length,
        triage_overdue: rows.filter((r) => r.triage_overdue).length,
        delivery_overdue: rows.filter((r) => r.delivery_overdue).length,
        cases: rows,
      },
      null,
      2,
    ),
  );
}

async function cmdTransition(flags) {
  const caseId = flags.case;
  const toState = flags.to;
  const actor = flags.actor;
  const reason = flags.reason;
  if (!caseId || !UUID.test(caseId)) fail("case_uuid_required");
  if (!toState) fail("to_state_required");
  if (!actor) fail("actor_required");
  if (!reason) fail("reason_required");

  const { res, body } = await rpc("transition_caesthetic_score_case", {
    p_case_id: caseId,
    p_to_state: toState,
    p_actor_name: actor,
    p_reason: reason,
    p_payload: {},
  });
  if (!res.ok) fail("transition_failed", { status: res.status, body });
  console.log(JSON.stringify({ ok: true, command: "transition", result: body }, null, 2));
}

async function cmdDeliver(flags) {
  const caseId = flags.case;
  const privatePath = flags.path;
  const actor = flags.actor;
  const reportId = flags.report || null;
  const walkthroughReady = flags["walkthrough-ready"] === true || flags["walkthrough-ready"] === "true";
  if (!caseId || !UUID.test(caseId)) fail("case_uuid_required");
  if (!privatePath) fail("path_required");
  if (!actor) fail("actor_required");

  const payload = {
    p_case_id: caseId,
    p_private_path: privatePath,
    p_walkthrough_ready: walkthroughReady,
    p_actor_name: actor,
    p_evidence: {},
  };
  if (reportId) {
    if (!UUID.test(reportId)) fail("report_uuid_invalid");
    payload.p_approved_report_id = reportId;
  }

  const { res, body } = await rpc("record_caesthetic_score_delivery", payload);
  if (!res.ok) fail("delivery_failed", { status: res.status, body });
  console.log(JSON.stringify({ ok: true, command: "deliver", result: body }, null, 2));
}

async function cmdReconcile() {
  if (!SUPABASE_URL) fail("SUPABASE_URL missing");

  const [missingOwner, deadLetters, overdueRes] = await Promise.all([
    rest(
      "caesthetic_score_cases?or=(owner_name.is.null,next_action.is.null)&select=id,lead_id,state,owner_name,next_action&limit=100",
    ),
    rest(
      "caesthetic_score_outbox?status=eq.dead&select=id,score_case_id,lead_id,job_type,attempts,last_error,processed_at&order=processed_at.desc&limit=100",
    ),
    rest("caesthetic_score_overdue?select=score_case_id"),
  ]);

  const overdueRows = Array.isArray(overdueRes.body) ? overdueRes.body : [];

  console.log(
    JSON.stringify(
      {
        ok: true,
        command: "reconcile",
        missing_owner_or_next_action: {
          count: Array.isArray(missingOwner.body) ? missingOwner.body.length : 0,
          cases: missingOwner.body ?? [],
        },
        outbox_dead_letters: {
          count: Array.isArray(deadLetters.body) ? deadLetters.body.length : 0,
          jobs: deadLetters.body ?? [],
        },
        overdue: {
          count: overdueRows.length,
        },
      },
      null,
      2,
    ),
  );
}

function printUsage() {
  console.error(`Usage:
  node scripts/caesthetic/growth-score-ops.mjs drain [--limit N]
  node scripts/caesthetic/growth-score-ops.mjs overdue
  node scripts/caesthetic/growth-score-ops.mjs transition --case <uuid> --to <state> --actor "First Last" --reason <code>
  node scripts/caesthetic/growth-score-ops.mjs deliver --case <uuid> --path /score/<slug>/ --actor "First Last" [--walkthrough-ready] [--report <uuid>]
  node scripts/caesthetic/growth-score-ops.mjs reconcile`);
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const cmd = positional[0];
  if (!cmd) {
    printUsage();
    process.exit(1);
  }

  switch (cmd) {
    case "drain":
      await cmdDrain(flags);
      break;
    case "overdue":
      await cmdOverdue();
      break;
    case "transition":
      await cmdTransition(flags);
      break;
    case "deliver":
      await cmdDeliver(flags);
      break;
    case "reconcile":
      await cmdReconcile();
      break;
    default:
      printUsage();
      fail("unknown_command", { cmd });
  }
}

main().catch((error) => fail("unhandled", { message: String(error?.message || error) }));
