#!/usr/bin/env node
// Explicitly dispatched acceptance: two labelled QA enquiries to the existing
// operator notification route. Service credentials are used only for readback.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const supabase = 'https://lwyumrgygbuowndwcsvc.supabase.co';
const endpoint = `${supabase}/functions/v1/submit-caesthetic-growth-score`;
const out = process.env.CPP_PRODUCTION_OUT || '/tmp/partnerships-production.json';
const result = {status:'running', source_sha:process.env.CPP_EXPECTED_SHA,
  checked_at:new Date().toISOString(), byte_checks:[], enquiries:[]};
assert.match(result.source_sha || '', /^[0-9a-f]{40}$/);
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey && process.env.SUPABASE_ACCESS_TOKEN) {
  const response = await fetch('https://api.supabase.com/v1/projects/lwyumrgygbuowndwcsvc/api-keys', {
    headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`},
  });
  assert.equal(response.ok, true, `Readback credential lookup: HTTP ${response.status}`);
  serviceKey = (await response.json()).find(key => key.name === 'service_role')?.api_key;
}
assert.ok(serviceKey, 'Existing Supabase readback credential is required before submitting QA enquiries');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
let browser;
try {
  for (const route of ['/partnerships/', '/ru/partnerships/',
    '/assets/js/partnerships.js', '/assets/js/caesthetic-config.js', '/assets/css/partnerships.css']) {
    const response = await fetch(`https://caesthetic.com${route}`);
    assert.equal(response.status, 200, route);
    const actual = digest(Buffer.from(await response.arrayBuffer()));
    const expected = digest(fs.readFileSync(path.join(root, 'site-caesthetic', route,
      route.endsWith('/') ? 'index.html' : '')));
    assert.equal(actual, expected, `Production source drift: ${route}`);
    result.byte_checks.push({route, sha256:actual, status:'pass'});
  }
  browser = await chromium.launch({headless:true});
  for (const locale of ['ru', 'en']) {
    const route = locale === 'ru' ? '/ru/partnerships/' : '/partnerships/';
    const pageUrl = `https://caesthetic.com${route}?program=expert-dental-kg`;
    const page = await browser.newPage({viewport:{width:390,height:844}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${pageUrl}#request`, {waitUntil:'networkidle'});
    const decline = page.getByRole('button', {name:/^(Отклонить|Отказаться|Decline|Reject)$/});
    if (await decline.count()) await decline.click();
    assert.equal(await page.locator('[data-partnership-context]').isVisible(), true);
    const form = page.locator('[data-partnership-form]');
    const qaName = `[TEST/QA] Partnerships acceptance ${locale} ${result.checked_at}`;
    await form.locator('[name="name"]').fill(qaName);
    await form.locator('[name="email"]').fill('partnership-qa@example.invalid');
    await form.locator('[name="goal"]').selectOption('event');
    const responsePromise = page.waitForResponse(response =>
      response.url() === endpoint && response.request().method() === 'POST');
    await form.locator('button[type="submit"]').click();
    const response = await responsePromise;
    const sent = response.request().postDataJSON();
    assert.equal(response.request().headers().authorization, undefined, 'Submission must remain anonymous');
    assert.equal(response.request().headers().apikey, undefined, 'No service credential in browser');
    const body = await response.json();
    const receipt = {locale, route, http_status:response.status(), request_id:body.request_id,
      notification_sent:body.notification_sent === true,
      telegram_notification_sent:body.telegram_notification_sent === true,
      email_notification_sent:body.email_notification_sent === true,
      anonymous:true, qa_labelled:true, durable_row_verified:false};
    result.enquiries.push(receipt);
    assert.equal(response.status(), 201, `Anonymous enquiry ${locale}: ${body.error || response.status()}`);
    assert.equal(body.ok, true);
    assert.equal(receipt.notification_sent, true);
    assert.equal(receipt.telegram_notification_sent, true);
    assert.equal(receipt.email_notification_sent, true);
    assert.equal(sent.intent, `partnership:expert-dental-kg:event:${locale}`);
    assert.equal(sent.page_url, pageUrl);
    await page.waitForFunction(() => !document.querySelector('[data-partnership-form]').hasAttribute('aria-busy'));
    assert.equal(await form.locator('[data-partnership-status]').getAttribute('data-error'), 'false');
    assert.equal(await form.locator('button[type="submit"]').isDisabled(), true);
    const rowResponse = await fetch(`${supabase}/rest/v1/caesthetic_public_requests?id=eq.${encodeURIComponent(body.request_id)}&select=id,name,intent,page_url`, {
      headers:{apikey:serviceKey, Authorization:`Bearer ${serviceKey}`},
    });
    assert.equal(rowResponse.ok, true, `Durable readback: HTTP ${rowResponse.status}`);
    const rows = await rowResponse.json();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, body.request_id);
    assert.equal(rows[0].name, qaName);
    assert.equal(rows[0].intent, sent.intent);
    assert.equal(rows[0].page_url, pageUrl);
    receipt.durable_row_verified = true;
    receipt.visible_success = true;
    assert.deepEqual(errors, []);
    await page.close();
  }
  result.status = 'pass';
  result.delivery_boundary = 'Telegram API acknowledgement and email provider acceptance; not a claim of human reading or inbox placement.';
} catch (error) {
  result.status = 'fail';
  result.error = error.message;
  throw error;
} finally {
  await browser?.close();
  fs.mkdirSync(path.dirname(out), {recursive:true});
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({status:result.status, source_sha:result.source_sha, enquiries:result.enquiries.length, out}));
}
