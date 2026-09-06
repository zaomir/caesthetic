import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.CAE_POPUP_BASE || 'https://caesthetic.com';
const local = process.env.CAE_POPUP_LOCAL === '1';
const out = process.env.CAE_POPUP_OUTPUT || '/tmp/cae-popup-browser';
fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch();
const results = [];
const routes = ['/', '/sprint/', '/lead-to-revenue-check/', '/growth-system/', '/support/', '/growth-score/', '/beauty-salons/', '/es/salones-de-belleza/', '/ru/salony-krasoty/', '/fr/salons-de-beaute/'];
const selector = '[data-cae-sprint-inquiry], [data-cae-check-inquiry], [data-cae-growth-system-inquiry], [data-cae-question], [data-cae-request]';
try {
for (const width of [1440,390,320]) {
  for (const route of routes) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.addInitScript(() => localStorage.setItem('cae_consent', 'denied'));
    if (local) {
      for (const file of ['assets/js/caesthetic.js','assets/css/caesthetic.css']) {
        await page.route(`**/${file}*`, r=>r.fulfill({path:path.resolve('site-caesthetic',file),contentType:file.endsWith('.js')?'text/javascript':'text/css'}));
      }
    }
    let reply = {ok:false, notification_sent:false};
    let httpStatus = 503;
    let pending;
    let hold = false;
    await page.route('**/functions/v1/submit-caesthetic-growth-score', async r => {
      if (hold) await new Promise(resolve=>{pending=resolve;});
      await r.fulfill({status:httpStatus,contentType:'application/json',body:JSON.stringify(reply)});
    });
    const response = await page.goto(base+route,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    // Dismiss consent through its visible button when present.
    const reject = page.getByRole('button',{name:/reject|decline|necessary only/i}).first();
    if(await reject.isVisible()) await reject.click();
    const trigger=page.locator(selector).filter({visible:true}).first();
    await trigger.click();
    const dialog=page.locator('dialog.cae-request-modal');
    const form=dialog.locator('form');
    const status=dialog.locator('[role=status]');
    const check=dialog.locator('svg');
    assert.equal(await dialog.getAttribute('open'),'');
    await form.locator('[name=name]').fill('[TEST/QA] Popup visual check');
    await form.locator('[name=email]').fill('qa-popup@example.com');
    await form.locator('[type=submit]').click();
    await page.waitForFunction(()=>!document.querySelector('.cae-request-modal button[type=submit]').disabled);
    assert.equal(await check.isVisible(),false);
    assert.equal(await form.isVisible(),true);
    // An HTTP-200 false success must also retain the form.
    httpStatus=200; reply={ok:true,notification_sent:false};
    await form.locator('[type=submit]').click();
    await page.waitForFunction(()=>!document.querySelector('.cae-request-modal button[type=submit]').disabled);
    assert.equal(await check.isVisible(),false);
    httpStatus=201; reply={ok:true,notification_sent:true,telegram_notification_sent:true,email_notification_sent:true,request_id:'synthetic-ui-only'};
    hold=true;
    await form.locator('[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('.cae-request-modal button[type=submit]').disabled);
    assert.equal(await form.isVisible(),true); assert.equal(await check.isVisible(),false);
    while(!pending) await new Promise(r=>setTimeout(r,10));
    hold=false; pending(); pending=null;
    await check.waitFor({state:'visible'});
    assert.equal(await form.isVisible(),false);
    assert.equal(await form.locator('[type=submit]').isVisible(),false);
    assert.equal(await status.getAttribute('aria-live'),'polite');
    assert.equal(await status.evaluate(e=>e===document.activeElement),true);
    assert.equal(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth),true);
    await page.waitForTimeout(800);
    assert.equal(await dialog.isVisible(),true);
    const shot=`${width}-${route.replace(/[^a-z0-9]+/g,'-')||'home'}.png`;
    await dialog.screenshot({path:path.join(out,shot)});
    await page.keyboard.press('Tab');
    assert.equal(await dialog.locator('button.cae-request-modal__close').evaluate(e=>e===document.activeElement),true);
    await dialog.locator('.cae-request-modal__close').click();
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
    await trigger.click();
    assert.equal(await form.isVisible(),true); assert.equal(await check.isVisible(),false);
    assert.equal(await form.locator('[name=name]').inputValue(),'');
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    // A late result from the previous opening must not produce success in a new one.
    await trigger.click();
    await form.locator('[name=name]').fill('[TEST/QA] Late result');
    await form.locator('[name=email]').fill('qa-late@example.com');
    hold=true;
    await form.locator('[type=submit]').click();
    while(!pending) await new Promise(r=>setTimeout(r,10));
    await page.keyboard.press('Escape'); await trigger.click();
    hold=false; pending(); pending=null;
    await page.waitForTimeout(200);
    assert.equal(await form.isVisible(),true); assert.equal(await check.isVisible(),false);
    results.push({route,width,locale:await page.locator('html').getAttribute('lang'),status:'pass',screenshot:shot,error:true,false_success_rejected:true,pending_fields_visible:true,success_fields_hidden:true,status_focused:true,persistent:true,close:true,escape:true,reset:true,late_response_ignored:true,mode:local?'local-assets-on-live-page':'live-assets-intercepted-api'});
    await page.close();
    console.log(`PASS ${width} ${route}`);
  }
}
} finally {
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checked_at:new Date().toISOString(),local,base,results},null,2)+'\n');
  await browser.close();
}
