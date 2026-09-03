import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const pay = readFileSync(resolve(SITE, 'pay/index.html'), 'utf8');
const config = readFileSync(resolve(SITE, 'assets/js/caesthetic-config.js'), 'utf8');
const fn = readFileSync(resolve(REPO, 'supabase/functions/caesthetic-payment/index.ts'), 'utf8');
const email = readFileSync(resolve(REPO, 'supabase/functions/_shared/caesthetic-billing-email.ts'), 'utf8');
const migration = readFileSync(resolve(REPO, 'supabase/migrations/20260824113000_caesthetic_payment_runtime.sql'), 'utf8');
const checkProductMigration = readFileSync(resolve(REPO, 'supabase/migrations/20260903190000_caesthetic_lead_to_revenue_check_product.sql'), 'utf8');
const integrity = readFileSync(resolve(REPO, 'supabase/migrations/20260824114000_caesthetic_payment_integrity.sql'), 'utf8');
const supabaseConfig = readFileSync(resolve(REPO, 'supabase/config.toml'), 'utf8');
const cron = readFileSync(resolve(REPO, '.github/workflows/caesthetic-billing-cron.yml'), 'utf8');
const nginxOrigin = readFileSync(resolve(REPO, 'deploy/nginx/caesthetic.com.origin.conf'), 'utf8');
const stripeWebhook = readFileSync(resolve(REPO, 'supabase/functions/stripe-webhook/index.ts'), 'utf8');
const qr = resolve(SITE, 'assets/img/wise-qr-code.png');

test('public runtime exposes CAESTHETIC payment endpoint but no reusable provider URL', () => {
  assert.match(config, /functions\/v1\/caesthetic-payment/);
  assert.doesNotMatch(config + pay, /wise\.com\/pay\/business|buy\.stripe\.com/i);
  assert.match(config, /signed_order_then_controlled_payment_request/);
  assert.match(supabaseConfig, /\[functions\.caesthetic-payment\][\s\S]*verify_jwt\s*=\s*false/);
});

test('payment page shows exact amount and captures explicit payer authorization before redirect', () => {
  assert.match(pay, /Exact amount due/i);
  assert.match(pay, /Use the exact amount shown here/i);
  assert.match(pay, /Pay from your US bank account/i);
  assert.match(pay, /Recommended/i);
  assert.match(pay, /Continue with ACH/i);
  assert.match(pay, /Open Wise payment link/i);
  assert.match(pay, /wise-qr-code\.png/i);
  assert.match(pay, /@media \(min-width: 760px\)/i);
  assert.match(pay, /control the account used for payment/i);
  assert.match(pay, /business or personal account/i);
  assert.match(pay, /payer_relationship/);
  assert.match(pay, /payer_account_type/);
  assert.match(pay, /attestation_accepted/);
  assert.match(pay, /action,/);
  assert.match(pay, /noindex,nofollow,noarchive/i);
  assert.match(pay, /pathParts\[0\] === 'pay'/);
  assert.match(pay, /pathParts\[1\]/);
  assert.match(pay, /location\.assign\(data\.redirect_url\)/);
  assert.ok(nginxOrigin.includes('location ~ ^/pay/[^/]+/?$'));
  assert.match(nginxOrigin, /try_files \/pay\/index\.html/);
});

test('reusable Wise link remains server-side and redirect completion is never payment proof', () => {
  assert.match(fn, /Deno\.env\.get\("CAESTHETIC_WISE_PAYMENT_LINK"\)/);
  assert.match(fn, /action === "authorize_stripe"/);
  assert.match(fn, /payment_method_types\[0\].*us_bank_account/);
  assert.match(fn, /metadata\[caesthetic_payment_request_id\]/);
  assert.match(fn, /query_parameters_added:\s*false/);
  assert.match(fn, /hostname !== "wise\.com"/);
  assert.doesNotMatch(fn, /searchParams\.set\("amount"/);
  assert.doesNotMatch(fn, /searchParams\.set\("currency"/);
  assert.doesNotMatch(fn, /searchParams\.set\("description"/);
  assert.match(fn, /received_amount_minor/);
  assert.match(fn, /receivedReference/);
  assert.match(fn, /reference_missing/);
  assert.match(fn, /match === "exact"/);
  assert.match(fn, /payment_provider_not_configured/);
  assert.match(fn, /action === "authorize_wise"/);
  assert.doesNotMatch(fn, /CAESTHETIC_WISE_OPEN_LINK/);
  assert.doesNotMatch(fn, /wise\.com\/pay\/business/i);
  assert.doesNotMatch(fn, /status:\s*"credited"[\s\S]{0,180}wise_redirect/i);
});

test('Lead-to-Revenue Check payment is fixed-price, written-scope-first and product-aware', () => {
  assert.match(checkProductMigration, /'lead_to_revenue_check'/);
  assert.match(checkProductMigration, /amount_minor\s*=\s*50000/);
  assert.match(checkProductMigration, /upper\(currency\)\s*=\s*'USD'/);
  assert.match(checkProductMigration, /nullif\(btrim\(sow_id\),\s*''\)\s+IS\s+NOT\s+NULL/i);
  assert.match(fn, /lead_to_revenue_check:\s*"CAESTHETIC Lead-to-Revenue Check"/);
  assert.match(fn, /lead_to_revenue_check_price_invalid/);
  assert.match(fn, /lead_to_revenue_check_scope_not_confirmed/);
  assert.match(fn, /product_data\]\[name\]", productLabel\(/);
  assert.match(fn, /order\.product_code !== "growth_sprint"/);
  assert.doesNotMatch(fn, /product_data\]\[name\]", "CAESTHETIC 30-Day Growth Sprint"/);
});

test('opaque token is stored only as hash and never persisted in billing outbox', () => {
  assert.match(fn, /payment_token_hash:\s*tokenHash/);
  assert.match(fn, /sha256Hex\(token\)/);
  assert.doesNotMatch(fn, /payload:\s*\{\s*token\s*\}/);
  assert.doesNotMatch(migration, /payment_token\s+text/i);
});

test('payment reconciliation has explicit mismatch states and provider transaction uniqueness', () => {
  assert.match(migration, /payer_authorization_ip/);
  assert.match(migration, /provider_transaction_id/);
  assert.match(migration, /reference_missing/);
  assert.match(migration, /partial/);
  assert.match(migration, /overpaid/);
  assert.match(migration, /unmatched/);
  assert.match(integrity, /UNIQUE INDEX[\s\S]*provider_transaction_id/i);
  assert.match(fn, /provider_transaction_already_used/);
  assert.match(fn, /stripe_webhook/);
  assert.match(stripeWebhook, /checkout\.session\.async_payment_succeeded/);
  assert.ok(readFileSync(qr).length > 1000);
});

test('billing communications are CAESTHETIC-isolated and reminders are scheduled through service role', () => {
  assert.match(email, /CAESTHETIC <info@caesthetic\.com>/);
  assert.match(email, /replyTo[\s\S]*info@caesthetic\.com/);
  assert.doesNotMatch(email, /evo\.do/i);
  assert.match(cron, /schedule:/);
  assert.match(cron, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(cron, /"action":"drain_outbox"/);
  assert.match(fn, /Authorization|authorization/i);
  assert.match(fn, /SUPABASE_SERVICE_ROLE_KEY/);
});

test('payment evidence and billing outbox remain service-role-only', () => {
  assert.match(migration, /caesthetic_billing_outbox/);
  assert.match(migration, /caesthetic_payment_evidence_events/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.doesNotMatch(migration, /CREATE POLICY/i);
  assert.doesNotMatch(migration, /wise\.com\/pay\/business/i);
});
