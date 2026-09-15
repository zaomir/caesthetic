import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import {runInNewContext} from 'node:vm';

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

test('Sprint preserves scoped offers and Check routes to the fixed-price three-field order', () => {
  const navigate=(pathname,kind,offer='',search='')=>{
    let click,destination;
    const window={location:{pathname,hostname:'caesthetic.com',search,assign(value){destination=value;}}};
    const document={readyState:'complete',querySelectorAll:()=>[],addEventListener(type,handler){if(type==='click')click=handler;}};
    runInNewContext(router,{window,document,URLSearchParams});
    const trigger={hasAttribute:name=>kind==='sprint'&&name==='data-cae-sprint-inquiry',getAttribute:()=>offer};
    click({target:{closest:()=>trigger},preventDefault(){},stopImmediatePropagation(){}});
    return destination;
  };
  assert.equal(navigate('/score/example/','sprint'),'/sprint/');
  assert.equal(navigate('/sprint/','sprint'),'/sprint/');
  assert.equal(navigate('/score/example/','sprint','spoken-four-surface-sprint-v1'),'/sprint/?offer=spoken-four-surface-sprint-v1');
  assert.equal(navigate('/sprint/','sprint','','?offer=spoken-four-surface-sprint-v1'),'/sprint/?offer=spoken-four-surface-sprint-v1');
  assert.equal(navigate('/sprint/','sprint','','?offer=unapproved-price'),'/sprint/');
  assert.equal(navigate('/score/example/','check'),'/lead-to-revenue-check/');
  assert.equal(navigate('/lead-to-revenue-check/','check'),'/pay/?product=lead_to_revenue_check');
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
