import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const sprint = readFileSync(resolve(SITE, 'sprint/index.html'), 'utf8');
const growthScore = readFileSync(resolve(SITE, 'growth-score/index.html'), 'utf8');
const check = readFileSync(resolve(SITE, 'lead-to-revenue-check/index.html'), 'utf8');
const growthJs = readFileSync(resolve(SITE, 'assets/js/growth.js'), 'utf8');
const configJs = readFileSync(resolve(SITE, 'assets/js/caesthetic-config.js'), 'utf8');
const terms = readFileSync(resolve(SITE, 'legal/terms/index.html'), 'utf8');
const paymentTerms = readFileSync(resolve(SITE, 'legal/payment-terms/index.html'), 'utf8');

test('public Sprint delivery stays email-only and ends with a written Day-30 report', () => {
  assert.match(sprint, /3–6 main constraints/i);
  assert.match(sprint, /1–5 longer-horizon processes/i);
  assert.match(sprint, /ranges guide prioritization; they are not quotas or a fixed package/i);
  assert.match(sprint, /Day-0 Access Gate/i);
  assert.match(sprint, /Before Snapshot/i);
  assert.match(sprint, /Live evidence/i);
  assert.match(sprint, /Build-vs-Configure Gate/i);
  assert.match(sprint, /Client Growth Statement/i);
  assert.match(sprint, /email-only, asynchronous communication through day 30/i);
  assert.match(sprint, /written Day-30 email report/i);
  assert.match(sprint, /done or materially resolved work/i);
  assert.match(sprint, /started and continuing work/i);
  assert.match(sprint, /work not started and why/i);
  assert.match(sprint, /recommended next path/i);
  assert.doesNotMatch(sprint, /recorded|walkthrough|video/i);
});

test('Lead-to-Revenue Check remains conditional, finite and credit-safe', () => {
  assert.match(check, /not required after every Growth Score/i);
  assert.match(check, /authorized non-clinical internal evidence/i);
  assert.match(check, /No passwords are sent by email/i);
  assert.match(check, /No unnecessary patient names, medical records, treatment details or other protected health information/i);
  assert.match(check, /fixed \$500/i);
  assert.match(check, /credited once toward the Sprint's/i);
  assert.match(check, /Remaining Sprint balance:[\s\S]*\$2,000/i);
  assert.match(check, /not cash, a refund, a transferable balance or a recurring discount/i);
  assert.match(check, /private payment request only after the written scope/i);
  assert.doesNotMatch(check + growthJs, /data-cae-checkout|buy\.stripe\.com|wise\.com\/pay/i);
});

test('recorded walkthrough remains specific to the free Growth Score', () => {
  assert.match(growthScore, /private(?:, noindex)? \/score\/ page (?:with|and).*human-recorded walkthrough/i);
});

test('Sprint is diagnosis-led and does not manufacture a second-month backlog', () => {
  assert.match(sprint, /Bucket A[\s\S]*3–6 main constraints/i);
  assert.match(sprint, /Bucket B[\s\S]*1–5 longer-horizon processes/i);
  assert.match(sprint, /Bucket C[\s\S]*Not started/i);
  assert.match(sprint, /Day-0 Access Gate/i);
  assert.match(sprint, /Before Snapshot/i);
  assert.match(sprint, /Revenue Recovery Loop, where applicable/i);
  assert.match(sprint, /Live Evidence/i);
  assert.match(sprint, /Client Growth Statement/i);
  assert.match(sprint, /Build-vs-Configure Gate/i);
  assert.match(sprint, /no artificial Month-2 backlog/i);
  assert.match(sprint, /Patient operations is an operational layer informed by the four surfaces, not a fifth surface/i);
});

test('Sprint requests written scope and payment instructions instead of starting checkout', () => {
  assert.match(sprint, /data-cae-sprint-inquiry/);
  assert.match(sprint, /Request Sprint scope and payment instructions/);
  assert.match(sprint, /Practice-specific scope and payment instructions are confirmed in writing before purchase/i);
  assert.match(sprint, /written order states the practice-specific scope, access dependencies, payment terms, cancellation treatment and any applicable refund terms before payment/i);
  assert.match(growthJs, /function initSprintInquiry\(\)/);
  assert.match(growthJs, /Scope request — 30-Day Growth Sprint/);
  assert.match(growthJs, /track\("sprint_scope_requested"/);
  assert.doesNotMatch(sprint + growthJs, /data-cae-checkout|Start Stripe Checkout|Request a secure payment link|supports card and ACH|ACH refunds|PandaDoc|DocuSign|checkout_started|payment_link_requested/i);
});

test('public Sprint has no reusable provider URL; payment path is signed-order-first and controlled by CAESTHETIC', () => {
  assert.doesNotMatch(configJs, /buy\.stripe\.com|wise\.com\/pay/i);
  assert.doesNotMatch(sprint + growthJs, /buy\.stripe\.com|wise\.com\/pay|data-cae-checkout/i);
  assert.match(configJs, /approvedSprintPaymentPolicy:\s*"signed_order_then_controlled_payment_request"/);
  assert.match(configJs, /functions\/v1\/caesthetic-payment/);
  assert.match(sprint, /Sprint Start Date: the later of the signed Order, cleared payment, and completion of the Day-0 Access Gate/i);
  assert.match(sprint, /\/legal\/payment-terms\//);
});

test('Terms and Payment Terms cover signed-order payment request, authorized payer and dispute contact without waiving bank dispute rights', () => {
  assert.match(terms, /client-specific payment request is issued only after the applicable written order is signed/i);
  assert.match(terms, /Authorized payer/i);
  assert.match(paymentTerms, /does not publish an open or reusable provider payment URL/i);
  assert.match(paymentTerms, /does not limit any right you have to dispute a charge with your bank or card issuer/i);
  assert.match(paymentTerms, /protected health information/i);
  assert.match(paymentTerms, /missing reference, partial payment, overpayment/i);
  assert.match(paymentTerms, /personal account/i);
});
