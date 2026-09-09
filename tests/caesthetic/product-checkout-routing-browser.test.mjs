import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { test, before, after } from 'node:test';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = resolve(import.meta.dirname, '../../site-caesthetic');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
let server, browser, base;
before(async()=>{
  server=createServer(async(req,res)=>{ try { let file=join(root,decodeURIComponent(new URL(req.url,'http://local').pathname)); if ((await stat(file)).isDirectory()) file=join(file,'index.html'); res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'}); res.end(await readFile(file)); } catch { res.writeHead(404); res.end('Not found'); } });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  base=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true});
});
after(async()=>{ await browser?.close(); await new Promise(r=>server?.close(r)); });
async function open(route){ const context=await browser.newContext({viewport:{width:390,height:900}}); const page=await context.newPage(); await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort()); await page.goto(base+route); return page; }
async function checkOfferLayout(page, name) {
  const reject=page.getByRole('button',{name:'Reject analytics',exact:true});if(await reject.isVisible())await reject.click();
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
    assert.deepEqual(audit.violations.map(v=>v.id),[]);
    if(process.env.CAE_OFFER_QA_OUT){await mkdir(process.env.CAE_OFFER_QA_OUT,{recursive:true});await page.screenshot({path:join(process.env.CAE_OFFER_QA_OUT,`${name}-${width}.png`),fullPage:true});}
  }
}

test('paid-product CTAs route through product pages before checkout', async()=>{
  const page=await open('/?cae_product_routing_test=1');
  try {
    await page.locator('[data-cae-sprint-inquiry]').first().click();
    await page.waitForURL(base+'/sprint/');
    assert.equal(await page.locator('dialog[open]').count(),0);
    await page.goto(base+'/sprint/?cae_product_routing_test=1');
    await page.locator('[data-cae-sprint-inquiry]').first().click();
    await page.waitForURL(base+'/pay/?product=growth_sprint');
    assert.deepEqual(await page.locator('#product-order-form input').evaluateAll(nodes=>nodes.map(n=>n.name)),['practice_name','signer_name','signer_email']);

    await page.goto(base+'/?cae_product_routing_test=1');
    await page.locator('[data-cae-check-inquiry]').first().click();
    await page.waitForURL(base+'/lead-to-revenue-check/');
    await page.goto(base+'/lead-to-revenue-check/?cae_product_routing_test=1');
    await page.locator('[data-cae-check-inquiry]').first().click();
    await page.waitForURL(base+'/pay/?product=lead_to_revenue_check');
    assert.deepEqual(await page.locator('#product-order-form input').evaluateAll(nodes=>nodes.map(n=>n.name)),['practice_name','signer_name','signer_email']);
  } finally { await page.context().close(); }
});

test('three-field checkout creates an order before revealing the Wise step', async()=>{
  const page=await open('/pay/?product=lead_to_revenue_check');
  try {
    await page.evaluate(()=>{ window.CAESTHETIC_API.productOrder='/mock-product-order'; });
    await page.route('**/mock-product-order', async route=>{
      const body=route.request().postDataJSON();
      assert.equal(body.action,'create_order');
      assert.equal(body.product_code,'lead_to_revenue_check');
      assert.equal(body.terms_accepted,true);
      await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({ok:true,token:'qa-token',order_id:'qa-order',order_number:'CAE-CHECK-QA',product_code:'lead_to_revenue_check',amount_minor:50000,currency:'USD',wise_ready:true})});
    });
    await page.locator('[name=practice_name]').fill('QA Practice');
    await page.locator('[name=signer_name]').fill('QA Owner');
    await page.locator('[name=signer_email]').fill('qa@example.com');
    await page.locator('#product-order-form button[type=submit]').click();
    await page.locator('#payment-ready-panel').waitFor({state:'visible'});
    assert.equal(await page.locator('#checkout-panel').isVisible(),false);
    assert.match(await page.locator('#payment-ready-panel').textContent(),/payment step is ready/i);
  } finally { await page.context().close(); }
});

test('Spoken report retains its offer through product, order and a mocked order receipt',async()=>{
  const page=await open('/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v3/?cae_product_routing_test=1');
  try {
    await page.locator('[data-cae-sprint-inquiry]').click();
    await page.waitForURL(base+'/sprint/?offer=spoken-four-surface-sprint-v1');
    await page.locator('#spoken-offer').waitFor({state:'visible'});
    assert.match(await page.locator('#spoken-offer').innerText(),/Lead-to-Revenue Check is included/);
    assert.match(await page.locator('#spoken-offer').innerText(),/does not automatically apply a credit/);
    await checkOfferLayout(page,'spoken-product');
    await page.locator('[data-spoken-order-link]').click();
    await page.waitForURL(base+'/pay/?product=growth_sprint&offer=spoken-four-surface-sprint-v1');
    await page.locator('#order-offer-details').waitFor({state:'visible'});
    assert.match(await page.locator('#order-offer-details').innerText(),/enquiry, response, booking, visit, consultation and payment/);
    assert.equal(await page.locator('[name=practice_name]').inputValue(),'Private Aesthetic Practice');
    assert.equal(await page.locator('#order-price').textContent(),'$2,500 USD');
    await checkOfferLayout(page,'spoken-order');
    await page.locator('#order-offer-details summary').click();assert.match(await page.locator('#order-offer-details details').innerText(),/does not automatically apply a credit/);await page.locator('#order-offer-details summary').click();
    await page.evaluate(()=>{window.CAESTHETIC_API.productOrder='/mock-spoken-order';});
    await page.route('**/mock-spoken-order',async route=>{
      const b=route.request().postDataJSON();assert.equal(b.offer_id,'spoken-four-surface-sprint-v1');assert.equal(b.product_code,'growth_sprint');assert.equal(b.amount_minor,undefined);
      await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({ok:true,token:'synthetic-spoken-token',order_number:'SYNTHETIC-SPOKEN',product_code:'growth_sprint',amount_minor:250000,currency:'USD',wise_ready:true,offer_id:b.offer_id,offer_scope:'Synthetic retained Spoken scope'})});
    });
    await page.locator('[name=signer_name]').fill('Synthetic owner');await page.locator('[name=signer_email]').fill('qa@example.com');
    await page.locator('#product-order-form button[type=submit]').click();
    await page.locator('#payment-ready-panel').waitFor({state:'visible'});
    assert.match(await page.locator('#ready-offer-scope').innerText(),/retained Spoken scope/);
    assert.equal(await page.locator('#thank-you-panel').isVisible(),false);
  } finally {await page.context().close();}
});

test('unrecognized offers fail closed and a browser credit does not reprice a standard order',async()=>{
  const page=await open('/pay/?product=growth_sprint&offer=unknown');
  try {
    await page.locator('#payment-error').waitFor({state:'visible'});assert.equal(await page.locator('#checkout-panel').isVisible(),false);
    await page.goto(base+'/pay/?product=growth_sprint&credit=500&amount=2000');
    await page.locator('#checkout-panel').waitFor({state:'visible'});assert.equal(await page.locator('#order-price').textContent(),'$2,500 USD');
  } finally {await page.context().close();}
});
