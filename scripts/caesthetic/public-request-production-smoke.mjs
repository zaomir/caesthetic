#!/usr/bin/env node
import fs from "node:fs";

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://lwyumrgygbuowndwcsvc.supabase.co").replace(/\/$/, "");
const PROJECT_REF = "lwyumrgygbuowndwcsvc";
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
if (response.status !== 201 || body.ok !== true || !body.request_id || body.notification_sent !== true) {
  throw new Error(
    `request capture failed closed: status=${response.status} error=${body.error || "invalid_response"}`
    + ` ok=${body.ok === true} request_id=${Boolean(body.request_id)}`
    + ` notification_sent=${body.notification_sent === true} qa_test=${body.qa_test === true}`,
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

const result = {
  ok: true,
  checked_at: checkedAt,
  endpoint,
  response_status: response.status,
  request_id: body.request_id,
  request_row_created: true,
  operator_notification_sent: true,
  qa_marker: payload.name.startsWith("[TEST/QA]"),
  qa_rate_limit_bypass_authenticated: body.qa_test === true,
};
if (outputPath) fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
