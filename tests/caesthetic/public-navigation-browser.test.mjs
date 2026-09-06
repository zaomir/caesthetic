import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { test, before, after } from 'node:test';
import { chromium } from 'playwright';

// Local browser regression suite. Never contacts production APIs or submits real leads.
const root = resolve(import.meta.dirname, '../../site-caesthetic');
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
let server, browser, base;
before(async () => {
  server = createServer(async (req, res) => {
    try {
      let file = join(root, decodeURIComponent(new URL(req.url, 'http://local.test').pathname));
      if (!file.startsWith(root + '/') && file !== root) throw new Error('outside root');
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); await new Promise(r => server?.close(r)); });

async function pageAt(route, width = 390, options = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  page.qaErrors=[];
  page.on('pageerror',e=>page.qaErrors.push(String(e)));
  page.setDefaultTimeout(4000);
  await page.route('**/*', async request => {
    if (!request.request().url().startsWith(base + '/')) return request.abort();
    if (request.request().url().includes('/case-studies/intake/api/public-cases')) return request.fulfill({ json:{ cases:[] } });
    if (options.delayAdapter && request.request().url().endsWith('/salon-funnel-copy.js')) await new Promise(r => setTimeout(r, 350));
    return request.continue();
  });
  await page.goto(base + route);
  if (await page.locator('#cae-header-slot').count()) await page.waitForSelector('#cae-menu-btn[data-cae-nav-bound="1"]', { state:'attached' });
  return page;
}
async function shot(page, name) {
  if (!process.env.QA_EVIDENCE_DIR) return;
  await mkdir(process.env.QA_EVIDENCE_DIR, { recursive:true });
  await page.screenshot({ path:join(process.env.QA_EVIDENCE_DIR, name + '.png') });
}

test('shared header stays visible through scrolling and drawer restores body after resizing', async () => {
  const page = await pageAt('/');
  try {
    await page.evaluate(() => window.scrollTo({ top:900, behavior:'instant' }));
    const top = await page.locator('.cae-header').evaluate(el => el.getBoundingClientRect().top);
    await shot(page, 'home-scrolled-390');
    assert.ok(Math.abs(top) <= 1, `header top after scroll: ${top}`);
    const before = await page.evaluate(() => scrollY);
    // Use the visible button coordinates: locator auto-scroll can reposition a
    // sticky descendant before the click, which is not a user's interaction.
    const button = await page.locator('#cae-menu-btn').boundingBox();
    await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
    await page.mouse.wheel(0, 500);
    assert.equal(await page.evaluate(() => scrollY), before);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('.cae-header')), true, 'focus stays in menu');
    await page.setViewportSize({ width:1920, height:900 });
    await page.waitForFunction(() => document.getElementById('cae-menu-btn').getAttribute('aria-expanded') === 'false');
    assert.equal(await page.locator('#cae-menu-btn').getAttribute('aria-expanded'), 'false');
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden');
    await page.mouse.wheel(0, 500);
    await page.waitForFunction(y => scrollY > y, before);
  } finally { await page.close(); }
});

const salons = [
  ['/beauty-salons/', 'Ask a question', 'Ask CAESTHETIC a question'],
  ['/es/salones-de-belleza/', 'Hacer una pregunta', 'Haz una pregunta a CAESTHETIC'],
  ['/ru/salony-krasoty/', 'Задать вопрос', 'Задать вопрос CAESTHETIC'],
  ['/fr/salons-de-beaute/', 'Poser une question', 'Poser une question à CAESTHETIC'],
];
const publicRoutes = ['/', '/growth-score/', '/sprint/', '/growth-system/', '/pricing/', '/lead-to-revenue-check/', '/connect4/', '/about/', '/support/', '/case-studies/', '/case-studies/case/', '/legal/privacy/', '/legal/terms/', '/legal/cookies/', '/legal/payment-terms/', '/pay/', '/score/', ...salons.map(s => s[0]),
  '/score/demo-aesthetics-clinic-reputation-gap/', '/score/demo-injector-practice-booking-friction/', '/score/demo-medical-aesthetics-search-gap/', '/score/demo-multi-location-growth-score/', '/score/demo-multi-location-growth-score/focus-location/', '/score/demo-publish-control-plane-network/', '/score/demo-publish-control-plane-network/focus-location/'];

test('public pages scroll top-bottom-top and every request trigger opens at narrow and desktop widths', { timeout:600000 }, async () => {
  const results = [], failures = [];
  for (const width of [320,390,1440,1920]) for (const route of publicRoutes.filter(route => !process.env.QA_ROUTES || process.env.QA_ROUTES.split(',').includes(route))) {
    const page = await pageAt(route, width);
    const errors = page.qaErrors;
    try {
      // Let layout-affecting local assets settle; no third-party/API traffic.
      await page.waitForLoadState('networkidle');
      const samples = await page.evaluate(async () => {
        const out = [];
        const initialHeaderTop = document.querySelector('#cae-header-slot .cae-header')?.getBoundingClientRect().top ?? 0;
        const end = document.documentElement.scrollHeight - innerHeight;
        const positions = [];
        for (let y = 0; y < end; y += Math.floor(innerHeight * .75)) positions.push(y);
        positions.push(end);
        positions.push(...positions.slice(0, -1).reverse());
        for (const y of positions) {
          window.scrollTo({ top:y, behavior:'instant' });
          await new Promise(requestAnimationFrame);
          const header = document.querySelector('#cae-header-slot .cae-header');
          out.push({ y:scrollY, expectedHeaderTop:Math.max(0, initialHeaderTop - scrollY), headerTop:header?.getBoundingClientRect().top ?? null, overflow:document.documentElement.scrollWidth > innerWidth });
        }
        return out;
      });
      const bad = samples.filter(s => s.overflow || s.headerTop !== null && Math.abs(s.headerTop - s.expectedHeaderTop) > 1);
      if (bad.length) failures.push({ route,width,type:'scroll',samples:bad.slice(0,3) });
      await page.evaluate(() => window.scrollTo({ top:document.documentElement.scrollHeight / 2, behavior:'instant' }));
      await shot(page, `${width}-${route.replaceAll('/','_') || 'home'}-mid`);
      if (await page.locator('#cae-menu-btn').isVisible()) {
        const rect = await page.locator('#cae-menu-btn').boundingBox();
        if (rect.y >= 0) {
          const before = await page.evaluate(() => scrollY);
          await page.mouse.click(rect.x+rect.width/2,rect.y+rect.height/2);
          await page.keyboard.press('Escape');
          if (await page.evaluate(() => scrollY) !== before) failures.push({ route,width,type:'menu-position-restoration' });
          if (await page.locator('#cae-menu-btn').getAttribute('aria-expanded') !== 'false') failures.push({ route,width,type:'menu-close' });
        }
      }
      const selectors = '[data-cae-request], [data-cae-sprint-inquiry], [data-cae-check-inquiry], [data-cae-growth-system-inquiry], [data-cae-question]';
      const triggers = await page.locator(selectors).all();
      let tested = 0;
      for (const trigger of triggers) {
        if (!await trigger.isVisible()) continue;
        await trigger.click();
        const dialog = page.locator('dialog[open]');
        if (!await dialog.isVisible()) { failures.push({ route,width,type:'request-did-not-open',label:await trigger.textContent() }); continue; }
        const fields = await dialog.locator('input').evaluateAll(nodes => nodes.map(n => n.name));
        if (JSON.stringify(fields) !== '["name","email"]') failures.push({ route,width,type:'request-fields',fields });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.documentElement.style.overflow !== 'hidden');
        tested++;
      }
      if (errors.length) failures.push({ route,width,type:'runtime-error',errors });
      results.push({ route,width,samples:samples.length,requestTriggers:tested,errors });
    } catch (e) { failures.push({ route,width,error:String(e) }); }
    finally { await page.close(); }
    if (process.env.QA_EVIDENCE_DIR) await writeFile(join(process.env.QA_EVIDENCE_DIR,'page-coverage.json'), JSON.stringify({ results,failures },null,2));
  }
  if (process.env.QA_EVIDENCE_DIR) await writeFile(join(process.env.QA_EVIDENCE_DIR,'page-coverage.json'), JSON.stringify({ results,failures },null,2));
  assert.deepEqual(failures, []);
});

for (const [route, label, title] of salons) test(`late footer question opens localized two-field dialog: ${route}`, async () => {
  const page = await pageAt(route, 390, { delayAdapter:true });
  try {
    const trigger = page.getByRole('link', { name:label, exact:true });
    await trigger.waitFor();
    await trigger.click();
    const dialog = page.locator('dialog[open]');
    await dialog.waitFor({ timeout:3000 });
    assert.equal(await page.locator('#cae-request-modal-title').textContent(), title);
    assert.deepEqual(await dialog.locator('input').evaluateAll(nodes => nodes.map(n => n.name)), ['name','email']);
    assert.equal(new URL(page.url()).pathname, route);
    await shot(page, `salon-${route.split('/')[1]}-question-390`);
    const y = await page.evaluate(() => scrollY);
    await page.mouse.move(5, 5); await page.mouse.wheel(0, -600);
    assert.equal(await page.evaluate(() => scrollY), y);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state:'hidden' });
    await page.waitForFunction(() => document.documentElement.style.overflow !== 'hidden');
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden');
    assert.equal(await page.locator('body').evaluate(el => Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.includes('\\n'))), false);
  } finally { await page.close(); }
});

test('all commercial request kinds survive validation and close without losing scroll or focus', async () => {
  const cases = [['/','[data-cae-sprint-inquiry]'], ['/','[data-cae-check-inquiry]'], ['/growth-system/','[data-cae-growth-system-inquiry]'], ['/support/','[data-cae-question]']];
  for (const [route, selector] of cases) {
    const page = await pageAt(route, 320);
    try {
      const trigger = page.locator(selector).first();
      await trigger.click();
      const dialog = page.locator('dialog[open]');
      await dialog.waitFor();
      await dialog.locator('button[type=submit]').click();
      assert.equal(await dialog.locator('input[name=name]').evaluate(el => el === document.activeElement), true);
      assert.equal(await dialog.locator('input[name=name]').evaluate(el => el.validity.valueMissing), true);
      const rect = await dialog.boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= 320, 'dialog fits narrow viewport');
      await page.keyboard.press('Escape');
      assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
    } finally { await page.close(); }
  }
});

test('primary destinations, current state, Social dropdown and anchor clearance', async () => {
  for (const width of [390,1920]) {
    const page = await pageAt('/',width);
    try {
      for (const route of ['/growth-score/','/sprint/','/growth-system/','/case-studies/','/pricing/','/about/','/support/']) {
        if (width < 1600) await page.locator('#cae-menu-btn').click();
        await page.locator(`#cae-nav a[data-nav][href="${route}"]`).click();
        await page.waitForURL(base+route);
        await page.waitForSelector('#cae-menu-btn[data-cae-nav-bound="1"]', {state:'attached'});
        assert.equal(await page.locator(`#cae-nav a[data-nav][href="${route}"]`).getAttribute('aria-current'),'page');
        assert.equal(await page.locator('#cae-menu-btn').getAttribute('aria-expanded'),'false');
      }
      if (width < 1600) await page.locator('#cae-menu-btn').click();
      const toggle = page.locator('.cae-nav__dropdown-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');
      await shot(page, `social-${width}`);
      await page.locator('#cae-social-menu a').first().waitFor({state:'visible'});
      assert.equal(await page.locator('#cae-social-menu a:visible').count(),5);
      if (width < 1600) {
        const socialLink=page.locator('#cae-social-menu a').last();
        await socialLink.scrollIntoViewIfNeeded();
        assert.equal(await socialLink.evaluate(el=>{ const r=el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }),true,'consent banner cannot obscure social links');
      }
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      await page.goto(base+'/lead-to-revenue-check/');
      await page.waitForSelector('#cae-menu-btn[data-cae-nav-bound="1"]', {state:'attached'});
      assert.equal(await page.locator('.cae-header').evaluate(el=>el.getBoundingClientRect().top),0);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.cae-skip-link').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Enter');
      await page.waitForFunction(()=>document.querySelector('main').getBoundingClientRect().top >= document.querySelector('.cae-header').getBoundingClientRect().bottom);
    } finally { await page.close(); }
  }
});

test('request retry requires confirmed delivery and preserves two-field payload',async()=>{
  const page=await pageAt('/support/');
  try {
    await page.evaluate(()=>{ window.CAESTHETIC_API.request='/mock-request'; });
    const payloads=[];
    await page.route('**/mock-request',route=>{
      payloads.push(route.request().postDataJSON());
      return route.fulfill({json:{ok:true,notification_sent:payloads.length>1}});
    });
    await page.locator('[data-cae-question]').first().click();
    const dialog=page.locator('dialog[open]');
    await dialog.locator('[name=name]').fill('QA Owner');
    await dialog.locator('[name=email]').fill('qa@example.com');
    await dialog.locator('[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('dialog [type=submit]').disabled===false);
    assert.match(await dialog.textContent(),/could not|couldn't|failed/i);
    await dialog.locator('[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('dialog form').hidden);
    assert.equal(await dialog.locator('.cae-request-modal__check').isVisible(),true);
    assert.equal(await dialog.locator('[type=submit]').isVisible(),false);
    assert.equal(await dialog.locator('[role=status]').evaluate(el=>el===document.activeElement),true);
    assert.equal(await dialog.isVisible(),true);
    assert.equal(payloads.length,2);
    assert.equal(payloads[0].name,'QA Owner');
    assert.equal(payloads[0].email,'qa@example.com');
    assert.equal(new URL(payloads[0].page_url).pathname,'/support/');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.documentElement.style.overflow!=='hidden');
  } finally { await page.close(); }
});

test('catalog loads its hero and report-list layout', async()=>{
  for(const width of [390,1920]) {
    const page=await pageAt('/score/',width);
    try {
      await shot(page,`catalog-${width}-top`);
      assert.equal(await page.locator('.cae-demo-list a').first().evaluate(el=>getComputedStyle(el).display),'grid');
      assert.ok(await page.locator('.cae-hero-simple').evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)>20));
    } finally { await page.close(); }
  }
});

test('shared footer destinations and header brand/primary CTA navigate correctly',async()=>{
  for(const width of [390,1920]) {
    const page=await pageAt('/',width);
    try {
      await page.locator('[data-cae-consent-reject]').click();
      const destinations=['/connect4/','/growth-score/','/lead-to-revenue-check/','/sprint/','/growth-system/','/pricing/','/beauty-salons/','/about/','/support/','/legal/privacy/','/legal/terms/','/legal/payment-terms/','/legal/cookies/','/'];
      for(const destination of destinations) {
        // Salon pages intentionally use their own footer; start from shared footer.
        await page.goto(base+'/');
        const link=page.locator(`.cae-footer a[href="${destination}"]:not([data-cae-question])`).first();
        await link.click();
        await page.waitForURL(base+destination);
        assert.equal(new URL(page.url()).pathname,destination);
      }
      if(width<1600) await page.locator('#cae-menu-btn').click();
      await page.locator('.cae-nav-cta a').click();
      await page.waitForURL(base+'/growth-score/');
      await page.locator('.cae-header .cae-brand').click();
      await page.waitForURL(base+'/');
      assert.equal(await page.locator('[data-cae-consent]').count(),0,'consent rejection persists through navigation');
    } finally { await page.close(); }
  }
});
