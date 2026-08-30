import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const migration = readFileSync(resolve(REPO, 'supabase/migrations/20260824153000_caesthetic_dispute_evidence_runtime.sql'), 'utf8');
const riskMigration = readFileSync(resolve(REPO, 'supabase/migrations/20260824153100_caesthetic_payment_risk_status.sql'), 'utf8');
const fn = readFileSync(resolve(REPO, 'supabase/functions/caesthetic-dispute-evidence/index.ts'), 'utf8');
const paymentFn = readFileSync(resolve(REPO, 'supabase/functions/caesthetic-payment/index.ts'), 'utf8');
const stripeWebhook = readFileSync(resolve(REPO, 'supabase/functions/stripe-webhook/index.ts'), 'utf8');
const config = readFileSync(resolve(REPO, 'supabase/config.toml'), 'utf8');
const canon = readFileSync(resolve(REPO, 'docs/projects/caesthetic/legal/CAESTHETIC_PAYMENT_EVIDENCE_RUNTIME.md'), 'utf8');

test('CAESTHETIC commercial chain remains the payment SSOT', () => {
  assert.match(canon, /Commercial Order → CAESTHETIC Invoice → Payment Request/);
  assert.match(canon, /payment rails, not the commercial SSOT/i);
  assert.match(migration, /provider_customer_id/);
  assert.match(migration, /provider_payment_id/);
  assert.match(migration, /provider_payment_method_id/);
  assert.match(migration, /provider_authorization_id/);
  assert.match(migration, /provider_session_id/);
  assert.match(fn, /attach_provider_objects/);
  assert.match(fn, /settlement_status_unchanged/);
});

test('Stripe ACH is code-prepared but fail-closed until Stripe is configured', () => {
  assert.match(paymentFn, /action === "authorize_stripe"/);
  assert.match(paymentFn, /payment_method_types\[0\].*us_bank_account/s);
  assert.match(paymentFn, /STRIPE_SECRET_KEY/);
  assert.match(paymentFn, /stripe_not_configured/);
  assert.match(fn, /code_prepared_fail_closed_until_stripe_configured/);
});

test('Stripe ACH does not treat Checkout completion as cleared payment', () => {
  assert.match(stripeWebhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(stripeWebhook, /record_credit/);
  assert.match(stripeWebhook, /verification_source:\s*"stripe_webhook"/);
  const asyncBlock = stripeWebhook.slice(stripeWebhook.indexOf('checkout.session.async_payment_succeeded'), stripeWebhook.indexOf('checkout.session.completed'));
  assert.match(asyncBlock, /caesthetic_payment_request_id/);
  assert.match(stripeWebhook, /checkout\.session\.completed/);
});

test('provider events are idempotent evidence and cannot credit a payment', () => {
  assert.match(migration, /caesthetic_payment_provider_events/);
  assert.match(migration, /UNIQUE INDEX[\s\S]*provider_event_unique/i);
  assert.match(fn, /record_provider_event/);
  assert.match(fn, /credited:\s*false/);
  const block = fn.slice(fn.indexOf('action === "record_provider_event"'), fn.indexOf('action === "attach_provider_objects"'));
  assert.doesNotMatch(block, /status:\s*["']credited["']/);
});

test('risk lifecycle is provider-neutral and separate from settlement lifecycle', () => {
  assert.match(migration, /caesthetic_payment_cases/);
  assert.match(migration, /'return', 'dispute', 'inquiry', 'early_warning', 'refund', 'reversal'/);
  assert.match(riskMigration, /risk_status/);
  assert.match(riskMigration, /'none', 'open', 'under_review', 'won', 'lost'/);
  assert.doesNotMatch(riskMigration, /payment_risk_open/);
  assert.match(fn, /open_case/);
  assert.match(fn, /update_case/);
  assert.match(fn, /risk_status:\s*"open"/);
  assert.match(fn, /funds_returned === true/);
});

test('delivery, dependency and acceptance evidence are structured', () => {
  assert.match(migration, /caesthetic_service_receipts/);
  assert.match(migration, /'weekly', 'monthly', 'milestone', 'dependency', 'approval'/);
  assert.match(migration, /acknowledgement_state/);
  assert.match(fn, /record_service_receipt/);
  assert.match(fn, /client_dependencies/);
  assert.match(fn, /deliverables/);
});

test('evidence bundles are versioned, hashed and immutable after freeze', () => {
  assert.match(migration, /caesthetic_evidence_bundles/);
  assert.match(migration, /caesthetic_evidence_items/);
  assert.match(migration, /manifest_sha256/);
  assert.match(migration, /frozen_evidence_bundle_is_immutable/);
  assert.match(migration, /submitted_evidence_bundle_is_immutable/);
  assert.match(fn, /build_bundle/);
  assert.match(fn, /freeze_bundle/);
  assert.match(fn, /sha256Hex/);
  assert.match(fn, /missing_core/);
});

test('bundle coverage includes authorization, delivery and communications', () => {
  assert.match(fn, /contract:\s*Boolean/);
  assert.match(fn, /invoice:\s*Boolean/);
  assert.match(fn, /payer_authorization:\s*Boolean/);
  assert.match(fn, /payment_reconciliation:\s*Boolean/);
  assert.match(fn, /service_start:/);
  assert.match(fn, /delivery:/);
  assert.match(fn, /client_interaction:/);
  assert.match(fn, /dependencies:/);
  assert.match(fn, /acceptance:/);
  assert.match(fn, /communications:/);
  assert.match(fn, /payment_evidence_events/);
  assert.match(fn, /provider_events/);
  assert.match(fn, /service_receipts/);
  assert.match(fn, /payment_cases/);
});

test('operator mutations are authenticated while public GET is health-only', () => {
  assert.match(config, /\[functions\.caesthetic-dispute-evidence\][\s\S]*verify_jwt\s*=\s*false/);
  assert.match(fn, /if \(req\.method === "GET"\)/);
  assert.match(fn, /if \(!adminAllowed\(req\)\) return json\(401/);
  assert.match(fn, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(fn, /CAESTHETIC_BILLING_ADMIN_KEY/);
});

test('evidence storage excludes sensitive payment and patient data by contract', () => {
  assert.match(migration, /Never store PHI, card numbers, bank login credentials/i);
  assert.match(migration, /Stripe client_secret/i);
  assert.doesNotMatch(migration, /card_number\s+text|bank_password|patient_name\s+text/i);
});
