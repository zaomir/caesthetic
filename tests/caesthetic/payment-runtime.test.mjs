import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const pay = readFileSync(resolve(SITE, 'pay/index.html'), 'utf8');
const checkout = readFileSync(resolve(SITE, 'assets/js/product-checkout.js'), 'utf8');
const config = readFileSync(resolve(SITE, 'assets/js/caesthetic-config.js'), 'utf8');
const productOrder = readFileSync(resolve(REPO, 'supabase/functions/caesthetic-product-order/index.ts'), 'utf8');
const fn = readFileSync(resolve(REPO, 'supabase/functions/caesthetic-payment/index.ts'), 'utf8');
const email = readFileSync(resolve(REPO, 'supabase/functions/_shared/caesthetic-billing-email.ts'), 'utf8');
const migration = readFileSync(resolve(REPO, 'supabase/migrations/20260824113000_caesthetic_payment_runtime.sql'), 'utf8');
const checkProductMigration = readFileSync(resolve(REPO, 'supabase/migrations/20260903190000_caesthetic_lead_to_revenue_check_product.sql'), 'utf8');
const integrity = readFileSync(resolve(REPO, 'supabase/migrations/20260824114000_caesthetic_payment_integrity.sql'), 'utf8');
const supabaseConfig = readFileSync(resolve(REPO, 'supabase/config.toml'), 'utf8');
const cron = readFileSync(resolve(REPO, '.github/workflows/caesthetic-billing-cron.yml'), 'utf8');
const stripeWebhook = readFileSync(resolve(REPO, 'supabase/functions/stripe-webhook/index.ts'), 'utf8');

test('public paid-product runtime uses electronic order then controlled Wise rail without exposing reusable provider URLs', () => {
  assert.match(config, /productOrder:\s*"\/api\/v1\/caesthetic-product-order"/);
  assert.doesNotMatch(config, /productOrder:\s*"https?:\/\//);
  assert.match(config, /product_page_then_electronic_order_then_wise/);
  assert.doesNotMatch(config + pay + checkout, /wise\.com\/pay\/business|buy\.stripe\.com/i);
  assert.match(pay, /Practice or business name/i);
  assert.match(pay, /name="practice_name"/);
  assert.match(pay, /name="signer_name"/);
  assert.match(pay, /name="signer_email"/);
  assert.match(pay, /Continue to payment/i);
  assert.match(pay, /electronically accept the standard product order/i);
  assert.match(pay, /noindex,nofollow,noarchive/i);
  assert.match(checkout, /action:\s*"create_order"/);
  assert.match(checkout, /action:\s*"wise"/);
  assert.match(checkout, /location\.assign\(result\.data\.redirect_url\)/);
  assert.match(supabaseConfig, /\[functions\.caesthetic-payment\][\s\S]*verify_jwt\s*=\s*false/);
});

test('product order fixes product and amount before Wise and never treats provider redirect as proof of payment', () => {
  assert.match(productOrder, /growth_sprint:[\s\S]*250000/);
  assert.match(productOrder, /lead_to_revenue_check:[\s\S]*50000/);
  assert.match(productOrder, /payment_token_hash:\s*tokenHash/);
  assert.match(productOrder, /action === "wise"/);
  assert.match(productOrder, /paid:\s*\["credited",\s*"delivery_started"\]\.includes\(row\.status\)/);
  assert.doesNotMatch(productOrder, /status:\s*"credited"[\s\S]{0,180}wise_redirect/i);
  assert.match(productOrder, /searchParams\.set\("amount", \(spec\.amount_minor \/ 100\)\.toFixed\(2\)\)/);
  assert.match(productOrder, /searchParams\.set\("currency", spec\.currency\)/);
  assert.doesNotMatch(productOrder, /searchParams\.set\("(?:amount|currency)",\s*body\./);
});

test('legacy private payment requests remain server-controlled compatibility only', () => {
  assert.match(fn, /const wisePaymentLink = row\.provider_payment_link/);
  assert.doesNotMatch(fn, /Deno\.env\.get\("CAESTHETIC_WISE_PAYMENT_LINK"\)/);
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
  assert.doesNotMatch(fn, /status:\s*"credited"[\s\S]{0,180}wise_redirect/i);
});

test('Lead-to-Revenue Check remains fixed at $500 and product-aware in both new and legacy rails', () => {
  assert.match(checkProductMigration, /'lead_to_revenue_check'/);
  assert.match(checkProductMigration, /amount_minor\s*=\s*50000/);
  assert.match(checkProductMigration, /upper\(currency\)\s*=\s*'USD'/);
  assert.match(productOrder, /lead_to_revenue_check:[\s\S]*50000/);
  assert.match(fn, /lead_to_revenue_check:\s*"CAESTHETIC Lead-to-Revenue Check"/);
  assert.match(fn, /lead_to_revenue_check_price_invalid/);
  assert.match(fn, /product_data\]\[name\]", productLabel\(/);
  assert.match(fn, /order\.product_code !== "growth_sprint"/);
});

test('opaque payment tokens are stored only as hashes and never persisted in billing outbox', () => {
  assert.match(fn, /payment_token_hash:\s*tokenHash/);
  assert.match(fn, /sha256Hex\(token\)/);
  assert.match(productOrder, /payment_token_hash:\s*tokenHash/);
  assert.match(productOrder, /sha256Hex\(token\)/);
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
