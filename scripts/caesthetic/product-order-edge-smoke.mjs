#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { SPOKEN_OFFER } from '../../supabase/functions/caesthetic-product-order/spoken-offer.mjs';

const PROJECT_REF = 'lwyumrgygbuowndwcsvc';
const endpoint = process.env.CAESTHETIC_PRODUCT_ORDER_URL || 'https://caesthetic.com/api/v1/caesthetic-product-order';
const output = process.argv.includes('--output') ? process.argv[process.argv.indexOf('--output') + 1] : '';

async function resolveServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const managementToken = process.env.SUPABASE_ACCESS_TOKEN || '';
  if (!managementToken) return '';
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${managementToken}` },
  });
  if (!response.ok) throw new Error(`Supabase API-key lookup failed: ${response.status}`);
  const keys = await response.json();
  return String(keys.find((row) => row.name === 'service_role')?.api_key || '');
}

const service = await resolveServiceKey();
if (!service) throw new Error('A Supabase service-role credential could not be resolved');
const auth = { Authorization:`Bearer ${service}`, 'Content-Type':'application/json' };

async function getHealth() {
  const r = await fetch(endpoint + '?health=1');
  const data = await r.json();
  assert.equal(r.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.wise_ready.lead_to_revenue_check, true, 'canonical $500 Wise rail must be ready');
  assert.equal(data.wise_ready.growth_sprint, true, 'canonical $2,500 Wise rail must be ready');
  return data;
}
async function post(body) {
  const r = await fetch(endpoint, { method:'POST', headers:auth, body:JSON.stringify(body) });
  return { r, data:await r.json().catch(()=>({})) };
}
async function smokeProduct(product_code, expectedMinor, offer = null) {
  let orderId = '';
  try {
    const create = await post({ action:'create_order', qa_test:true, terms_accepted:true, product_code, offer_id:offer?.id, practice_name:offer ? offer.practice : '[TEST/QA] CAESTHETIC checkout smoke', signer_name:'QA Owner', signer_email:'qa+product-checkout@example.com', source_url:'https://caesthetic.com/pay/?qa=1' });
    assert.equal(create.r.status, 201, JSON.stringify(create.data));
    assert.equal(create.data.amount_minor, expectedMinor);
    assert.equal(create.data.qa_test, true);
    if(offer){assert.equal(create.data.sow_id,offer.sow_id);assert.equal(create.data.offer_id,offer.id);}
    assert.equal(create.data.wise_ready, true, `${product_code} Wise rail must be ready`);
    assert.ok(create.data.token && create.data.order_id);
    orderId = create.data.order_id;
    const wise = await post({ action:'wise', token:create.data.token });
    assert.equal(wise.r.status, 200, JSON.stringify(wise.data));
    const u = new URL(wise.data.redirect_url);
    assert.ok(u.hostname === 'wise.com' || u.hostname.endsWith('.wise.com'));
    const statusResponse = await fetch(endpoint + '?token=' + encodeURIComponent(create.data.token));
    const status = await statusResponse.json();
    assert.equal(statusResponse.status, 200);
    assert.equal(status.amount_minor, expectedMinor);
    assert.equal(status.currency, 'USD');
    assert.equal(status.paid, false);
    if(offer){assert.equal(status.offer_id,offer.id);assert.equal(status.sow_id,offer.sow_id);assert.equal(status.offer_scope,offer.scope);}
    const provider = await fetch(wise.data.redirect_url);
    assert.equal(provider.status, 200, 'Wise request page must be available');
    const providerHtml = await provider.text();
    assert.ok(providerHtml.includes('Rovlex International Ltd is requesting ' + (expectedMinor / 100) + ' USD'), 'Wise page must confirm the approved payee and exact product amount');
    return { order_created:true, order_id:orderId, payment_request_id:create.data.payment_request_id,
      wise_ready:true, wise_host:u.hostname, wise_http:provider.status, provider_amount_verified:true,
      amount_minor:status.amount_minor, currency:status.currency, status:status.status, paid:status.paid,
      provider_url_sha256:createHash('sha256').update(u.origin + u.pathname).digest('hex') };
  } finally {
    if (orderId) {
      const cleanup = await post({ action:'qa_cleanup', order_id:orderId });
      assert.equal(cleanup.r.status, 200, JSON.stringify(cleanup.data));
    }
  }
}

const health = await getHealth();
const check = await smokeProduct('lead_to_revenue_check', 50000);
const sprint = await smokeProduct('growth_sprint', 250000);
const spoken = await smokeProduct('growth_sprint', 250000, SPOKEN_OFFER);
const result = { ok:true, endpoint, spoken, checked_at:new Date().toISOString(), check, sprint, wise_ready:health.wise_ready };
if (output) fs.writeFileSync(output, JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
