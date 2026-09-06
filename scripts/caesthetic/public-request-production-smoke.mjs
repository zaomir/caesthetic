#!/usr/bin/env node
import fs from "node:fs";

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://lwyumrgygbuowndwcsvc.supabase.co").replace(/\/$/, "");
const PROJECT_REF = "lwyumrgygbuowndwcsvc";
const REQUIRE_EMAIL_NOTIFICATION = process.env.REQUIRE_EMAIL_NOTIFICATION === "true";
const outputIndex = process.argv.indexOf("--output");
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : "";

async function resolveServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const managementToken = process.env.SUPABASE_ACCESS_TOKEN || "";
  if (!managementToken) return "";
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${managementToken}` },
  });
  if (!response.ok) throw new Error(`Supabase API-key lookup failed: ${response.status}`);
  const keys = await response.json();
  return String(keys.find((row) => row.name === "service_role")?.api_key || "");
}

const serviceKey = await resolveServiceKey();
if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
const auth = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
const checkedAt = new Date().toISOString();
const stamp = checkedAt.replace(/\D/g, "").slice(0, 14);
const endpoint = `${SUPABASE_URL}/functions/v1/submit-caesthetic-growth-score`;
const payload = {
  action: "caesthetic_public_request",
  qa_test: true,
  name: "[TEST/QA] CAESTHETIC CTA production smoke",
  email: `qa+cta-${stamp}@example.com`,
  intent: "question",
  page_url: "https://caesthetic.com/support/?qa=production-smoke",
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: { ...auth, Origin: "https://caesthetic.com", "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const body = await response.json().catch(() => ({}));
if (
  response.status !== 201 ||
  body.ok !== true ||
  !body.request_id ||
  body.notification_sent !== true ||
  body.telegram_notification_sent !== true ||
  (REQUIRE_EMAIL_NOTIFICATION && body.email_notification_sent !== true)
) {
  throw new Error(
    `request capture failed closed: status=${response.status} error=${body.error || "invalid_response"}`
    + ` ok=${body.ok === true} request_id=${Boolean(body.request_id)}`
    + ` notification_sent=${body.notification_sent === true}`
    + ` telegram_notification_sent=${body.telegram_notification_sent === true}`
    + ` email_notification_sent=${body.email_notification_sent === true}`
    + ` require_email_notification=${REQUIRE_EMAIL_NOTIFICATION}`
    + ` qa_test=${body.qa_test === true}`,
  );
}

const select = await fetch(
  `${SUPABASE_URL}/rest/v1/caesthetic_public_requests?id=eq.${encodeURIComponent(body.request_id)}&select=id,intent,page_url,created_at`,
  { headers: auth },
);
const rows = await select.json().catch(() => []);
if (!select.ok || rows.length !== 1 || rows[0].id !== body.request_id || rows[0].intent !== payload.intent) {
  throw new Error(`request row verification failed: status=${select.status}`);
}

// Exercise both canonical Score intake variants and verify persisted outbox outcomes.
const scoreNotifications = [];
for (const vertical of ["aesthetic_practice", "beauty_salon"]) {
  const scoreResponse = await fetch(endpoint, {
    method: "POST", headers: { ...auth, Origin: "https://caesthetic.com", "Content-Type": "application/json" },
    body: JSON.stringify({
      intake_version: "caesthetic-growth-score/2.0", intake_stage: "required", qa_marker: true,
      idempotency_key: `qa-notification-${vertical}-${stamp}`,
      required_submitted_at: checkedAt, name: "[TEST/QA] Notification smoke",
      email: "notifications@caesthetic.com", practice_name: `[TEST/QA] ${vertical}`,
      city_state: "Austin, TX", source_domain: "caesthetic.com",
      source_page: vertical === "beauty_salon" ? "https://caesthetic.com/beauty-salons/" : "https://caesthetic.com/growth-score/",
      vertical_context: vertical,
    }),
  });
  const score = await scoreResponse.json();
  if (!scoreResponse.ok || score.ok !== true || !score.lead_id || !score.score_case_id || score.qa_test !== true) {
    throw new Error(`Score notification smoke failed: HTTP ${scoreResponse.status}, ${score.error || "missing QA refs"}`);
  }
  const jobsResponse = await fetch(`${SUPABASE_URL}/rest/v1/caesthetic_score_outbox?score_case_id=eq.${score.score_case_id}&select=job_type,status`, { headers: auth });
  const jobs = await jobsResponse.json();
  const sent = (type) => jobsResponse.ok && Array.isArray(jobs) && jobs.some((job) => job.job_type === type && job.status === "sent");
  const receipt = { vertical, lead_id: score.lead_id, score_case_id: score.score_case_id,
    telegram_notification_sent: sent("notify_admin_telegram"), email_notification_sent: sent("notify_internal_email"),
    customer_ack_sent: sent("notify_customer_ack"),
    customer_ack_suppressed_for_qa: jobsResponse.ok && Array.isArray(jobs) && !jobs.some((job) => job.job_type === "notify_customer_ack"), qa_marker: true };
  scoreNotifications.push(receipt);
  if (!receipt.telegram_notification_sent || !receipt.email_notification_sent || !receipt.customer_ack_suppressed_for_qa) {
    throw new Error(`Score outbox notification failure: ${JSON.stringify(receipt)}`);
  }
}

const result = {
  ok: true,
  growth_score_notifications: scoreNotifications,
  checked_at: checkedAt,
  endpoint,
  response_status: response.status,
  request_id: body.request_id,
  request_row_created: true,
  telegram_notification_sent: true,
  email_notification_sent: body.email_notification_sent === true,
  email_notification_required: REQUIRE_EMAIL_NOTIFICATION,
  notify_to_contract: "CAESTHETIC_NOTIFY_TO -> CAESTHETIC_GROWTH_SCORE_NOTIFY_TO -> notifications@caesthetic.com",
  qa_marker: payload.name.startsWith("[TEST/QA]"),
  qa_rate_limit_bypass_authenticated: body.qa_test === true,
};
if (outputPath) fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
