import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { test, before, after } from 'node:test';
import { chromium } from 'playwright';

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
async function open(route){ const page=await browser.newPage({viewport:{width:390,height:900}}); await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort()); await page.goto(base+route); return page; }

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
  } finally { await page.close(); }
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
  } finally { await page.close(); }
});
