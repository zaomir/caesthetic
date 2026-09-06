#!/usr/bin/env node
/**
 * Production smoke for CAESTHETIC Wise Invoice cockpit.
 * Does not treat evo.do homepage 200 as proof.
 * HTTP admin-api is cookie-gated. Unauthenticated 401 JSON proves the route.
 * Concurrent Prepare protection and Wise persist are checked on the same
 * Postgres unique index / columns the handler uses.
 */

const PAGE = "https://evo.do/admin/caesthetic-billing/";
const API = "https://evo.do/functions/v1/admin-api/admin-caesthetic-billing";
const DIRECT = "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/admin-api/admin-caesthetic-billing";
const REST = "https://lwyumrgygbuowndwcsvc.supabase.co/rest/v1";
const UA = "grainee-wise-cockpit-smoke/1";

async function get(url) {
  const r = await fetch(url, { redirect: "follow", headers: { "user-agent": UA } });
  const text = await r.text();
  return { status: r.status, type: r.headers.get("content-type") || "", text };
}

async function post(url, { body, bearer } = {}) {
  const headers = { "content-type": "application/json", "user-agent": UA };
  if (bearer) headers.authorization = "Bearer " + bearer;
  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body || { action: "list_orders" }),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: r.status, type: r.headers.get("content-type") || "", text, json };
}

function fail(msg) {
  console.error("FAIL", msg);
  process.exit(1);
}

async function rest(path, { method = "GET", body } = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!key) fail("SUPABASE_SERVICE_ROLE_KEY missing for authenticated smoke");
  const r = await fetch(REST + path, {
    method,
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: method === "POST" || method === "PATCH" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!r.ok) fail(`rest ${method} ${path} ${r.status} ${text.slice(0, 240)}`);
  return json;
}

const page = await get(PAGE);
if (page.status !== 200) fail(`${PAGE} http ${page.status}`);
if (!page.text.includes("Wise Invoice")) fail("page missing Wise Invoice title");
if (!page.text.includes("caesthetic-billing/billing.js")) fail("page missing billing.js (stale cockpit HTML)");
console.log("PASS page", PAGE, page.status);

const evoApi = await post(API);
if (!/json/i.test(evoApi.type)) fail(`evo api not json: ${evoApi.status} ${evoApi.type}`);
if (evoApi.status === 404 && /admin_route_not_found/.test(evoApi.text)) {
  fail("admin-caesthetic-billing not deployed on admin-api");
}
if (![401, 200].includes(evoApi.status)) fail(`evo api unexpected ${evoApi.status} ${evoApi.text.slice(0, 180)}`);
if (evoApi.status === 401 && !/unauthorized|Forbidden/.test(evoApi.text)) {
  fail(`evo api 401 body unexpected: ${evoApi.text.slice(0, 180)}`);
}
console.log("PASS evo api", evoApi.status);

const direct = await post(DIRECT);
if (!direct.json) fail("direct api not json");
if (direct.status === 404 && direct.json.error === "admin_route_not_found") {
  fail("admin-caesthetic-billing missing from deployed admin-api");
}
if (![401, 200].includes(direct.status)) fail(`direct api unexpected ${direct.status}`);
console.log("PASS direct api", direct.status);

const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
const orderNumber = `SMOKE-WISE-${stamp}`;
const created = await rest("/caesthetic_commercial_orders", {
  method: "POST",
  body: {
    practice_name: "SMOKE Wise cockpit (not a client)",
    product_code: "growth_sprint",
    order_number: orderNumber,
    amount_minor: 250000,
    currency: "USD",
    signed_at: new Date().toISOString(),
    signer_name: "Smoke Operator",
    signer_email: "ops+wise-cockpit-smoke@evo.do",
    billing_address_line1: "1 Smoke Street",
    billing_city: "London",
    billing_postal_code: "SW1A 1AA",
    billing_country: "GB",
  },
});
const order = Array.isArray(created) ? created[0] : created;
if (!order?.id) fail("smoke order insert failed");

async function insertRequest() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const issuedAt = new Date();
  const dueAt = new Date(issuedAt);
  dueAt.setUTCDate(dueAt.getUTCDate() + 3);
  const r = await fetch(REST + "/caesthetic_payment_requests", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      order_id: order.id,
      provider: "wise",
      invoice_number: orderNumber.slice(0, 80),
      payment_reference: orderNumber.slice(0, 80),
      amount_minor: 250000,
      currency: "USD",
      payer_account_type: "unknown",
      payer_relationship: "contracting_entity",
      status: "invoice_created",
      issued_at: issuedAt.toISOString(),
      due_at: dueAt.toISOString(),
    }),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return { ok: r.ok, status: r.status, text, json };
}

try {
  const [a, b] = await Promise.all([insertRequest(), insertRequest()]);
  const oks = [a, b].filter((row) => row.ok);
  const dups = [a, b].filter((row) => !row.ok && /duplicate|23505/i.test(row.text));
  if (oks.length !== 1) fail(`unique index expected 1 insert, got ${oks.length} ok / ${dups.length} dup: ${(a.text + b.text).slice(0, 240)}`);
  if (dups.length !== 1) fail("unique index did not reject the concurrent duplicate");
  const request = Array.isArray(oks[0].json) ? oks[0].json[0] : oks[0].json;
  const wiseId = `SMOKE-${stamp}`;
  const wiseLink = "https://wise.com/pay/r/grainee-cockpit-smoke";
  await rest(`/caesthetic_payment_requests?id=eq.${request.id}`, {
    method: "PATCH",
    body: { provider_invoice_id: wiseId, provider_payment_link: wiseLink },
  });
  const saved = await rest(
    `/caesthetic_payment_requests?id=eq.${request.id}&select=provider_invoice_id,provider_payment_link`,
  );
  const row = Array.isArray(saved) ? saved[0] : saved;
  if (row.provider_invoice_id !== wiseId) fail("saved Wise ID not persisted");
  if (row.provider_payment_link !== wiseLink) fail("saved Wise link not persisted");
  console.log("PASS unique-index and Wise persist", orderNumber);
} finally {
  await rest(`/caesthetic_commercial_orders?id=eq.${order.id}`, { method: "DELETE" });
}

console.log("OK wise-cockpit smoke");
