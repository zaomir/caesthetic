import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { webcrypto } from 'node:crypto';
import { SPOKEN_OFFER, resolveSpokenOffer } from '../../supabase/functions/caesthetic-product-order/spoken-offer.mjs';
const root = new URL('../../', import.meta.url);
const source = fs.readFileSync(new URL('supabase/functions/caesthetic-product-order/index.ts', root), 'utf8');
function harness() {
  const tables = new Map(), calls = [];
  let handler;
  const env = { SUPABASE_URL:'https://db.invalid', SUPABASE_SERVICE_ROLE_KEY:'TEST-ONLY-SERVICE', CAESTHETIC_WISE_OPEN_LINK:'https://wise.com/pay/business/test-only' };
  const fakeFetch = async (url, init = {}) => {
    const u = new URL(url); assert.equal(u.origin, 'https://db.invalid', 'no real network or notifications');
    const table = u.pathname.split('/').at(-1), rows = tables.get(table) || [];
    const method = init.method || 'GET';
    calls.push({table, method});
    if (method === 'POST') { const row = { id: String(calls.length), ...JSON.parse(init.body) }; rows.push(row); tables.set(table, rows); return Response.json([row]); }
    const matches = rows.filter(row => [...u.searchParams].every(([key, value]) => key === 'select' || !value.startsWith('eq.') || String(row[key]) === value.slice(3)));
    if (method === 'PATCH') { for (const row of matches) Object.assign(row, JSON.parse(init.body)); return Response.json(matches); }
    assert.equal(method, 'GET');
    return Response.json(matches);
  };
  const code = stripTypeScriptTypes(source.replace(/^import .*;\n/gm, ''));
  new Function('serve','Deno','fetch','crypto','SPOKEN_OFFER','resolveSpokenOffer',code)(fn=>{handler=fn;},{env:{get:key=>env[key]}},fakeFetch,webcrypto,SPOKEN_OFFER,resolveSpokenOffer);
  const post = body => handler(new Request('https://evo.do/api/v1/caesthetic-product-order',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer TEST-ONLY-SERVICE'},body:JSON.stringify(body)}));
  return { tables, handler, post };
}
const body = () => ({ action:'create_order', qa_test:true, terms_accepted:true, product_code:'growth_sprint', offer_id:SPOKEN_OFFER.id, practice_name:'Spoken Med Spa, LLC', signer_name:'Synthetic QA', signer_email:'qa@example.com' });

test('Spoken order persists the server-owned offer and restores it from the stored order', async()=>{
  const h=harness();
  const response=await h.post({...body(), amount_minor:1, discount:50000, credit:50000, sow_id:'forged'});
  const result=await response.json();assert.equal(response.status,201);
  assert.equal(result.amount_minor,250000);assert.equal(result.sow_id,SPOKEN_OFFER.sow_id);
  const order=h.tables.get('caesthetic_commercial_orders')[0];assert.equal(order.amount_minor,250000);assert.equal(order.sow_id,SPOKEN_OFFER.sow_id);
  const event=h.tables.get('caesthetic_payment_evidence_events')[0].event_data;
  assert.deepEqual(event.offer_snapshot,SPOKEN_OFFER);assert.match(event.offer_sha256,/^[a-f0-9]{64}$/);
  const status=await h.handler(new Request('https://evo.do/api/v1/caesthetic-product-order?token='+result.token));
  const restored=await status.json();assert.equal(restored.offer_id,SPOKEN_OFFER.id);assert.equal(restored.paid,false);assert.equal(restored.offer_scope,SPOKEN_OFFER.scope);
});
for(const [label,change,error] of [
  ['unknown offer',{offer_id:'invented'},'unsupported_offer'],
  ['wrong product',{product_code:'lead_to_revenue_check'},'unsupported_offer'],
  ['different practice',{practice_name:'Another Med Spa'},'offer_practice_mismatch']
]) test(`reject ${label} before writing a commercial order`,async()=>{
  const h=harness(),r=await h.post({...body(),...change});assert.equal(r.status,400);assert.equal((await r.json()).error,error);assert.equal(h.tables.size,0);
});
test('generic products keep standard terms and price; a browser credit cannot change them',async()=>{
  const h=harness();const r=await h.post({...body(),offer_id:undefined,practice_name:'Other Practice',credit:50000});const x=await r.json();assert.equal(r.status,201);assert.equal(x.offer_id,null);assert.equal(x.amount_minor,250000);assert.equal(x.sow_id,'CAESTHETIC-SPRINT-STANDARD-2026-09-07');
});
test('Wise uses the stored fixed product price and a redirect never marks payment received',async()=>{
  const h=harness(), created=await (await h.post({...body(),amount_minor:1})).json();
  const response=await h.post({action:'wise',token:created.token,amount_minor:1,currency:'EUR',credit:50000});
  assert.equal(response.status,200);
  const destination=new URL((await response.json()).redirect_url);
  assert.equal(destination.searchParams.get('amount'),'2500.00');
  assert.equal(destination.searchParams.get('currency'),'USD');
  const status=await (await h.handler(new Request('https://caesthetic.com/api/v1/caesthetic-product-order?token='+created.token))).json();
  assert.equal(status.paid,false);assert.equal(status.status,'payment_pending');assert.equal(status.amount_minor,250000);
});
test('public and server offer bytes match exactly',()=>{
  assert.equal(fs.readFileSync(new URL('site-caesthetic/assets/js/spoken-offer-data.js',root),'utf8'),fs.readFileSync(new URL('supabase/functions/caesthetic-product-order/spoken-offer.mjs',root),'utf8'));
});
