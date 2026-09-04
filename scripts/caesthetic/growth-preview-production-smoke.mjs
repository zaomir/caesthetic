#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://lwyumrgygbuowndwcsvc.supabase.co").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BASE_URL = (process.env.CAESTHETIC_BASE_URL || "https://caesthetic.com").replace(/\/$/, "");
const outputIndex = process.argv.indexOf("--output");
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : "";
if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

const auth = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
async function rpc(name, payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${name} failed: ${data.message || response.status}`);
  return data;
}
async function select(table, query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: auth });
  if (!response.ok) throw new Error(`${table} query failed: ${response.status}`);
  return await response.json();
}
function check(condition, message) { if (!condition) throw new Error(message); }

const now = new Date();
const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
const token = crypto.randomBytes(32).toString("base64url");
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
const email = `qa+growth-preview-${stamp}@caesthetic.com`;
const emailHash = crypto.createHash("sha256").update(email).digest("hex");
const previewUrl = `${BASE_URL}/preview/${token}/`;
const issue = await rpc("issue_caesthetic_growth_preview", { p: {
  account_id: `qa-growth-preview-${stamp}`, contact_id: `qa-contact-${stamp}`,
  campaign_id: "qa-synthetic-production-smoke", campaign_variant: "synthetic-smoke-v1",
  sender_id: "qa-operator", sender_class: "operator", token_hash: tokenHash,
  email, email_hash: emailHash, first_name: "QA", practice_name: "CAESTHETIC Synthetic Practice",
  city: "Austin", state: "TX", site_url: "https://example.com",
  verified_signal: "The public practice website identifies Austin as its location.",
  signal_class: "website_identity", evidence_ref: `synthetic://growth-preview/${stamp}`,
  evidence_observed_at: new Date(now.valueOf() - 60_000).toISOString(), evidence_approved_at: now.toISOString(),
  evidence_expires_at: new Date(now.valueOf() + 7 * 864e5).toISOString(), evidence_approved: true,
  verified_email: email, suppression_clear: true, conflict_clear: true, opening_narrative: "synthetic_website_identity",
  icp_segment: "synthetic", preview_version: "caesthetic-growth-preview/1.0", preview_payload: {},
  qa_test: true, expires_at: new Date(now.valueOf() + 864e5).toISOString(),
}});
check(issue.ok && issue.preview_id, "issue did not return preview_id");

const before = (await select("caesthetic_growth_previews", `preview_id=eq.${issue.preview_id}&select=state,lead_id,score_case_id`))[0];
check(before && before.lead_id === null && before.score_case_id === null, "issuance created a lead or case");

const opened = await fetch(previewUrl, { redirect: "manual" });
const html = await opened.text();
check(opened.status === 200, `preview GET status ${opened.status}`);
check(html.includes("Private Growth Preview") && html.includes("Continue to My Free Growth Score"), "preview markers missing");
check(html.includes("Locked · not assessed in this preview"), "unassessed marker missing");
check((opened.headers.get("x-robots-tag") || "").includes("noindex"), "noindex header missing");
check(opened.headers.get("referrer-policy") === "no-referrer", "no-referrer header missing");
check(opened.headers.get("cache-control")?.includes("no-store"), "no-store header missing");

const afterGet = (await select("caesthetic_growth_previews", `preview_id=eq.${issue.preview_id}&select=state,lead_id,score_case_id`))[0];
check(afterGet.state === "rendered" && afterGet.lead_id === null && afterGet.score_case_id === null, "GET created a lead/case or did not render");

const firstContinue = await fetch(previewUrl, { method: "POST", redirect: "manual" });
const continuedHtml = await firstContinue.text();
check(firstContinue.status === 200 && continuedHtml.includes("Free Growth Score requested"), "Continue failed");
const afterContinue = (await select("caesthetic_growth_previews", `preview_id=eq.${issue.preview_id}&select=state,lead_id,score_case_id`))[0];
check(afterContinue.state === "continued" && afterContinue.lead_id && afterContinue.score_case_id, "Continue did not create canonical refs");

const secondContinue = await fetch(previewUrl, { method: "POST", redirect: "manual" });
check(secondContinue.status === 200, "repeated Continue failed");
const afterRepeat = (await select("caesthetic_growth_previews", `preview_id=eq.${issue.preview_id}&select=state,lead_id,score_case_id`))[0];
check(afterRepeat.lead_id === afterContinue.lead_id && afterRepeat.score_case_id === afterContinue.score_case_id, "repeated Continue duplicated refs");

const cases = await select("caesthetic_score_cases", `id=eq.${afterContinue.score_case_id}&select=id,state,qa_test,source_kind`);
const leads = await select("caesthetic_growth_score_leads", `id=eq.${afterContinue.lead_id}&select=id,status,source_kind,source_preview_id`);
const outbox = await select("caesthetic_score_outbox", `score_case_id=eq.${afterContinue.score_case_id}&select=id`);
const events = await select("caesthetic_growth_preview_events", `preview_id=eq.${issue.preview_id}&select=event_name`);
check(cases.length === 1 && cases[0].qa_test === true && cases[0].state === "closed" && cases[0].source_kind === "outbound_preview", "synthetic case is not closed QA");
check(leads.length === 1 && leads[0].status === "declined" && leads[0].source_kind === "outbound_preview", "synthetic lead remains working");
check(leads[0].source_preview_id === issue.preview_id, "preview attribution missing");
check(outbox.length === 5, `expected 5 QA outbox jobs, got ${outbox.length}`);
check(new Set(events.map((event) => event.event_name)).size === 5, "preview event sequence incomplete");

const result = {
  ok: true, checked_at: new Date().toISOString(), preview_url: previewUrl, preview_id: issue.preview_id,
  get: { status: opened.status, noindex: true, no_referrer: true, no_store: true, case_created: false },
  continue: { status: firstContinue.status, repeat_status: secondContinue.status, idempotent: true,
    lead_id: afterContinue.lead_id, score_case_id: afterContinue.score_case_id,
    qa_lead_status: leads[0].status, qa_case_state: cases[0].state, outbox_jobs: outbox.length },
  analytics_events: [...new Set(events.map((event) => event.event_name))].sort(),
};
if (outputPath) fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
