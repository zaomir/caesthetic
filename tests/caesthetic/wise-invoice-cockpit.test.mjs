import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const handler = readFileSync(resolve(REPO, "supabase/functions/_shared/admin_handlers/admin-caesthetic-billing.ts"), "utf8");
const migration = readFileSync(resolve(REPO, "supabase/migrations/20260906120000_caesthetic_wise_invoice_cockpit.sql"), "utf8");
const unique = readFileSync(resolve(REPO, "supabase/migrations/20260906140000_caesthetic_wise_one_active_request.sql"), "utf8");
const page = readFileSync(resolve(REPO, "site-evo/admin/caesthetic-billing/index.html"), "utf8");
const js = readFileSync(resolve(REPO, "site-evo/admin/caesthetic-billing/billing.js"), "utf8");
const origin = readFileSync(resolve(REPO, "deploy/nginx/evo.do.2402.origin.conf"), "utf8");
const cfHeaders = readFileSync(resolve(REPO, "infra/cloudflare/router/src/headers.ts"), "utf8");
const agentDeploy = readFileSync(resolve(REPO, "scripts/agent-deploy.sh"), "utf8");

test("Wise cockpit contract is manual and provider-safe", () => {
  assert.match(handler, /action === "prepare"/);
  assert.match(handler, /action === "attach"/);
  assert.match(handler, /billing_address_required/);
  assert.match(handler, /wise_invoice_prepared/);
  assert.match(handler, /wise_invoice_attached/);
  assert.match(handler, /payment_status_unchanged/);
  assert.doesNotMatch(handler, /CAESTHETIC_WISE_OPEN_LINK/);
  assert.match(migration, /provider_payment_link/);
  assert.match(js, /Prepare Wise Invoice/);
  assert.match(js, /Wise invoice ID/);
  assert.match(js, /Wise payment link/);
  assert.match(page, /noindex,nofollow/);
});

test("concurrent Prepare cannot insert a second active request", () => {
  assert.match(unique, /idx_caesthetic_payment_requests_one_active_per_order/);
  assert.match(unique, /WHERE status NOT IN \('refunded', 'returned', 'cancelled'\)/);
  assert.match(handler, /insert\.error\.code === "23505"/);
  assert.match(handler, /latestActiveRequest/);
});

test("saved Wise details are returned and prefilled", () => {
  assert.match(handler, /attached: \{/);
  assert.match(handler, /wise_invoice_id: request\.provider_invoice_id/);
  assert.match(js, /invoice\.value = payload\.attached\?\.wise_invoice_id/);
  assert.match(js, /link\.value = payload\.attached\?\.wise_payment_link/);
});

test("Sprint name and tax-none are not applied to every product", () => {
  assert.match(handler, /productLabel\(order\.product_code\)/);
  assert.match(handler, /unsupported_product/);
  assert.match(handler, /productCode === "growth_sprint" \? "None"/);
  assert.match(handler, /confirm before issuing/);
  assert.doesNotMatch(handler, /const SERVICE = "CAESTHETIC 30-Day Growth Sprint"/);
});

test("EVO origin proxies admin-api for the cockpit", () => {
  assert.match(origin, /location \^~ \/functions\/v1\//);
  assert.match(page, /\/admin\/caesthetic-billing\//);
  assert.match(page, /caesthetic-billing\/billing\.js/);
  assert.match(js, /window\.adminAuth\.fetch/);
  assert.doesNotMatch(page, /#[0-9A-Fa-f]{6}/);
  assert.match(cfHeaders, /'\/functions\/v1\/'/);
  assert.match(agentDeploy, /DEPLOY_FUNCTIONS_SCOPE="\$\{DEPLOY_FUNCTIONS_SCOPE:-\$\{DEPLOY_FUNCTIONS:-changed\}\}"/);
});
