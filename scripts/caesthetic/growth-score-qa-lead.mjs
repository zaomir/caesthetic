#!/usr/bin/env node
/**
 * TASK-849 — submit a marked TEST/QA Growth Score lead, verify storage +
 * score case, then archive it so it cannot sit in an owner working queue.
 *
 * Usage:
 *   node scripts/caesthetic/growth-score-qa-lead.mjs           # submit + verify
 *   node scripts/caesthetic/growth-score-qa-lead.mjs --archive  # archive after verify
 *   LEAD_ID=... node scripts/caesthetic/growth-score-qa-lead.mjs --archive
 */
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SUPABASE_URL = (process.env.SUPABASE_URL || "https://lwyumrgygbuowndwcsvc.supabase.co").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUBMIT_URL =
  process.env.CAESTHETIC_GROWTH_SCORE_SUBMIT_URL ||
  `${SUPABASE_URL}/functions/v1/submit-caesthetic-growth-score`;
const STAMP = new Date().toISOString().slice(0, 10);
const RUN_ID = process.env.QA_RUN_ID || `task849-${Date.now()}`;
const ARCHIVE_NOTE = "TASK-849 TEST Lane B archived — not a real prospect";

function fail(message, extra) {
  console.error(JSON.stringify({ ok: false, error: message, extra: extra || null }));
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
    headers: { ...headers(init.method !== "GET"), Prefer: "return=representation", ...(init.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { res, body };
}

async function submitLead() {
  const idempotencyKey = randomUUID();
  const payload = {
    name: "TEST Lane B",
    email: `qa.task849.laneb.${STAMP.replace(/-/g, "")}@example.com`,
    practice_name: `TEST Lane B ${STAMP} QA Practice`,
    city_state: "Scottsdale, AZ",
    intake_version: "caesthetic-growth-score/2.0",
    intake_stage: "required",
    required_submitted_at: new Date().toISOString(),
    source_page: "/growth-score/",
    source_domain: "caesthetic.com",
    referrer: "https://caesthetic.com/sprint/?utm_source=qa",
    idempotency_key: idempotencyKey,
    utm_source: "qa",
    utm_medium: "cursor-lane-b",
    utm_campaign: "task-849",
    utm_content: RUN_ID,
    qa_marker: true,
  };

  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok !== true || !body.lead_id) {
    fail("submit_failed", { status: res.status, body });
  }
  return { payload, body, idempotencyKey };
}

async function verify(leadId) {
  const { res: leadRes, body: leads } = await rest(
    `caesthetic_growth_score_leads?id=eq.${leadId}&select=id,status,intake_state,notification_sent,utm_source,utm_campaign,referrer,practice_name,name,email,source_page`,
  );
  if (!leadRes.ok || !Array.isArray(leads) || !leads[0]) {
    fail("lead_not_found", { status: leadRes.status, body: leads });
  }
  const { res: caseRes, body: cases } = await rest(
    `caesthetic_score_cases?lead_id=eq.${leadId}&select=id,state,source_kind,intake_version,workflow_version`,
  );
  const scoreCase = Array.isArray(cases) ? cases[0] || null : null;
  return { lead: leads[0], scoreCase, caseStatus: caseRes.status };
}

async function archive(leadId) {
  const archivedAt = new Date().toISOString();
  const { res: leadRes, body: leads } = await rest(
    `caesthetic_growth_score_leads?id=eq.${leadId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "declined",
        updated_at: archivedAt,
      }),
    },
  );
  if (!leadRes.ok) fail("lead_archive_failed", { status: leadRes.status, body: leads });

  const { res: caseRes } = await rest(
    `caesthetic_score_cases?lead_id=eq.${leadId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        state: "closed",
        self_reported_context: {
          _ops_archive: ARCHIVE_NOTE,
          archived_at: archivedAt,
          qa_run: RUN_ID,
        },
        updated_at: archivedAt,
      }),
    },
  );
  if (!caseRes.ok) {
    console.warn(JSON.stringify({ warn: "score_case_archive_failed", status: caseRes.status }));
  }
  return { archived_at: archivedAt, lead_status: "declined", score_case_state: "closed" };
}

function writeEvidence(doc) {
  const outDir = resolve(ROOT, "docs/audits/caesthetic");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "TASK-849_TEST_LEAD_2026-08-21.json");
  const safe = {
    ...doc,
    lead: doc.lead
      ? {
          id: doc.lead.id,
          status: doc.lead.status,
          intake_state: doc.lead.intake_state,
          notification_sent: doc.lead.notification_sent,
          utm_source: doc.lead.utm_source,
          utm_campaign: doc.lead.utm_campaign,
          source_page: doc.lead.source_page,
          practice_marked_test: /test/i.test(doc.lead.practice_name || ""),
        }
      : null,
  };
  writeFileSync(outPath, JSON.stringify(safe, null, 2) + "\n");
  return outPath;
}

const archiveOnly = process.argv.includes("--archive");
const existingId = process.env.LEAD_ID || "";

if (archiveOnly && existingId) {
  const before = await verify(existingId);
  const archived = await archive(existingId);
  const after = await verify(existingId);
  const evidence = writeEvidence({
    ok: true,
    action: "archive",
    run_id: RUN_ID,
    lead_id: existingId,
    score_case_id: after.scoreCase?.id || before.scoreCase?.id || null,
    before_status: before.lead.status,
    after_status: after.lead.status,
    after_case_state: after.scoreCase?.state || null,
    archived,
  });
  console.log(JSON.stringify({ ok: true, action: "archive", lead_id: existingId, evidence }, null, 2));
  process.exit(0);
}

const submitted = await submitLead();
const verified = await verify(submitted.body.lead_id);
const qaAutoClosed = submitted.body.qa_test === true || submitted.payload.qa_marker === true;
if (qaAutoClosed) {
  if (verified.lead.status !== "declined") fail("qa_not_auto_archived", verified.lead);
} else if (verified.lead.status !== "new") {
  fail("unexpected_status", verified.lead);
}
if (verified.lead.utm_source !== "qa") fail("utm_not_persisted", verified.lead);
if (!verified.scoreCase?.id) fail("score_case_missing", { caseStatus: verified.caseStatus, scoreCase: verified.scoreCase });
if (verified.scoreCase.source_kind !== "owner_intake") fail("score_case_source", verified.scoreCase);

let archived = null;
if (archiveOnly || process.argv.includes("--submit-and-archive")) {
  archived = await archive(submitted.body.lead_id);
}

const after = archived ? await verify(submitted.body.lead_id) : verified;
const evidence = writeEvidence({
  ok: true,
  action: archived ? "submit_and_archive" : "submit",
  run_id: RUN_ID,
  lead_id: submitted.body.lead_id,
  score_case_id: after.scoreCase?.id || submitted.body.score_case_id || null,
  qa_test: submitted.body.qa_test === true,
  notification_sent: after.lead.notification_sent,
  duplicate: submitted.body.duplicate === true,
  lead: after.lead,
  scoreCase: after.scoreCase,
  archived,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      action: archived ? "submit_and_archive" : "submit",
      lead_id: submitted.body.lead_id,
      score_case_id: after.scoreCase?.id || submitted.body.score_case_id || null,
      qa_test: submitted.body.qa_test === true,
      notification_sent: after.lead.notification_sent,
      status: after.lead.status,
      case_state: after.scoreCase?.state || null,
      evidence,
    },
    null,
    2,
  ),
);
