import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(new URL('../..', import.meta.url).pathname);
const site = resolve(root, 'site-caesthetic');
const router = readFileSync(resolve(site, 'assets/js/product-routing.js'), 'utf8');
const config = readFileSync(resolve(site, 'assets/js/caesthetic-config.js'), 'utf8');
const pay = readFileSync(resolve(site, 'pay/index.html'), 'utf8');
const checkout = readFileSync(resolve(site, 'assets/js/product-checkout.js'), 'utf8');
const success = readFileSync(resolve(site, 'payment-success/index.html'), 'utf8');
const successJs = readFileSync(resolve(site, 'assets/js/payment-success.js'), 'utf8');
const redirectJs = readFileSync(resolve(site, 'assets/js/payment-success-redirect.js'), 'utf8');
const edge = readFileSync(resolve(root, 'supabase/functions/caesthetic-product-order/index.ts'), 'utf8');
const nginx = readFileSync(resolve(root, 'deploy/nginx/caesthetic.com.origin.conf'), 'utf8');

test('paid CTAs route non-product surfaces to product pages and product pages to the three-field order', () => {
  assert.match(router, /path === SPRINT_PAGE \? "\/pay\/\?product=growth_sprint" : SPRINT_PAGE/);
  assert.match(router, /path === CHECK_PAGE \? "\/pay\/\?product=lead_to_revenue_check" : CHECK_PAGE/);
  const fields = [...pay.matchAll(/<input\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]).filter((name) => ['practice_name','signer_name','signer_email'].includes(name));
  assert.deepEqual(fields.slice(0, 3), ['practice_name','signer_name','signer_email']);
  assert.match(pay, /Continue to payment/);
  assert.match(checkout, /action:\s*"create_order"/);
  assert.match(checkout, /action:\s*"wise"/);
});

test('product order API stays same-origin on caesthetic.com', () => {
  assert.match(config, /productOrder:\s*"\/api\/v1\/caesthetic-product-order"/);
  assert.doesNotMatch(config, /productOrder:\s*"https?:\/\//);
  assert.match(nginx, /location = \/api\/v1\/caesthetic-product-order/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:54321\/caesthetic-product-order/);
});

test('payment received is evidence-gated and routes to a dedicated thank-you page', () => {
  assert.match(edge, /paid:\s*\["credited",\s*"delivery_started"\]\.includes\(row\.status\)/);
  assert.match(success, /Payment received\./);
  assert.match(success, /contact you within 24 hours/i);
  assert.match(success, /payment-success\.js/);
  assert.match(successJs, /if \(data\.paid === true\) paid\(data\)/);
  assert.match(successJs, /else confirming\(data\)/);
  assert.doesNotMatch(successJs, /paid\(data\)[\s\S]*else paid\(/);
  assert.match(pay, /payment-success-redirect\.js/);
  assert.match(redirectJs, /\/payment-success\/\?token=/);
  assert.match(redirectJs, /if \(panel\.hidden\) return/);
});
