/** Focused browser checks for the text-first case library.
 * node scripts/caesthetic/case-library-browser.mjs
 * Optional CAE_CASE_BASE uses an existing preview/live URL; default serves site-caesthetic.
 * CAE_CASE_FIXTURE=/absolute/public-cases.json overrides API with a supplied snapshot.
 * The default local fixture is synthetic and deliberately includes one TEST record.
 * CAE_CASE_ASSET_ROOT may supply missing shared assets in sparse checkouts.
 * CAE_CASE_OUTPUT controls evidence location (default /tmp/caesthetic-case-browser).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules', 'playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = process.env.CAE_CASE_OUTPUT || '/tmp/caesthetic-case-browser';
fs.mkdirSync(output, { recursive: true });
const synthetic = { schemaVersion: 3, cases: Array.from({ length: 18 }, (_, i) => ({
  id: 'qa-situation-' + (i + 1), title: 'A clearer first consultation request ' + (i + 1),
  industry: i % 2 ? 'Aesthetic clinic' : 'Medical spa', country: i % 3 ? 'United States' : 'United Kingdom',
  city: i % 3 ? 'Boston' : 'London', locationCount: i % 2 + 1,
  goals: [i % 3 ? 'bookings' : 'retention'], relevanceTier: 'closest-match',
  card: { title: 'A clearer first consultation request ' + (i + 1), situation: 'Visitors encounter several possible first steps before contacting the practice.', approach: 'Name one consultation request and the team responsible for responding.' },
  ownerQuestion: 'How can we make the next step clearer?', situationBefore: 'The public path presents competing calls to action.',
  bindingConstraint: 'The first consultation step is difficult to distinguish.', interventions: ['Explain the first consultation step.', 'Name the response owner.'],
  caestheticRole: 'Illustrative workflow review.', practiceContribution: 'Review the proposed handoff with the front desk.',
  dataSource: 'Synthetic browser fixture; no client performance claims.', limitations: 'Synthetic test data.',
  applicability: 'Practices with competing contact paths.',
  evidenceLevel: 'modeled', attribution: 'not_claimed',
  metrics: [{ name: 'Consultation requests', evidenceLevel: 'modeled', source: 'Synthetic browser fixture.', timeframe: 'Test period', before: { display: '10' }, after: { display: '20' } }],
})) };
synthetic.cases.push({ id: 'TEST_hidden-record', title: 'TEST internal record', goals: ['bookings'] }, { id: 'internal-qa-record', title: 'TEST second internal record', goals: ['bookings'] });
const fixture = process.env.CAE_CASE_FIXTURE ? JSON.parse(fs.readFileSync(process.env.CAE_CASE_FIXTURE, 'utf8')) : process.env.CAE_CASE_BASE ? null : synthetic;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
let server;
if (!process.env.CAE_CASE_BASE) {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    for (const dir of [path.join(root, 'site-caesthetic'), process.env.CAE_CASE_ASSET_ROOT].filter(Boolean)) {
      let file = path.resolve(dir, '.' + pathname);
      if (!file.startsWith(dir + path.sep)) continue;
      try {
        if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
        res.end(fs.readFileSync(file)); return;
      } catch { /* try optional shared-assets directory */ }
    }
    // Shared runtime is outside this focused test's responsibility in sparse snapshots.
    if (/\.(js|css)$/.test(pathname)) { res.writeHead(200, { 'Content-Type': mime[path.extname(pathname)] }); res.end('/* shared asset unavailable in local snapshot */'); return; }
    res.writeHead(404); res.end('Not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
}
const base = (process.env.CAE_CASE_BASE || `http://127.0.0.1:${server.address().port}`).replace(/\/$/, '');
const browser = await playwright.chromium.launch({ headless: true });
const checks = [], screenshots = [], errors = [];
async function check(name, fn) {
  try { const detail = await fn(); checks.push({ name, status: 'pass', ...(detail ? { detail } : {}) }); }
  catch (error) { checks.push({ name, status: 'fail', error: error.message }); }
}
async function context(width = 1440) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  if (fixture) await ctx.route('**/case-studies/intake/api/public-cases**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }));
  const page = await ctx.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return { ctx, page };
}
async function catalog(page, query = '') {
  await page.goto(base + '/case-studies/' + query, { waitUntil: 'networkidle' });
  await page.locator('.cae-case-row').first().waitFor();
  var reject = page.getByRole('button', { name: 'Reject analytics', exact: true });
  if (await reject.isVisible()) await reject.click();
}
async function capture(page, name) {
  const destination = path.join(output, name + '.png');
  await page.screenshot({ path: destination }); screenshots.push(destination);
}
async function settleScroll(page) {
  await page.evaluate(() => new Promise(resolve => {
    let last = scrollY, stable = 0;
    const timer = setInterval(() => { stable = Math.abs(scrollY - last) < 1 ? stable + 1 : 0; last = scrollY; if (stable >= 4) { clearInterval(timer); resolve(); } }, 80);
  }));
}
async function geometry(page, rowSelector) {
  return page.evaluate(selector => {
    const rows = [...document.querySelectorAll(selector)];
    const overflow = [...document.querySelectorAll('main *')].filter(el => {
      const style = getComputedStyle(el), r = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && r.width && (r.right > innerWidth + 1 || r.left < -1);
    }).slice(0, 10).map(el => ({ selector: el.tagName.toLowerCase() + '.' + el.className, right: el.getBoundingClientRect().right, left: el.getBoundingClientRect().left }));
    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, overflow, rows: rows.slice(0, 2).map(el => { const r = el.getBoundingClientRect(); return { x: r.x, top: r.top, bottom: r.bottom, width: r.width }; }), columns: rows[0] ? getComputedStyle(rows[0]).gridTemplateColumns : '' };
  }, rowSelector);
}
try {
  for (const width of [1440, 390, 320]) {
    const { ctx, page } = await context(width);
    await check(`Catalog ${width}px: image-free, single column and no horizontal overflow`, async () => {
      await catalog(page);
      await capture(page, `catalog-top-${width}`);
      assert.equal(await page.locator('[data-filter="goal"]').count(), 1);
      assert.equal(await page.locator('.cae-case-row img, .cae-case-row picture, .cae-case-row video, .cae-case-row canvas').count(), 0);
      const result = await geometry(page, '.cae-case-row');
      assert.ok(result.documentWidth <= width, JSON.stringify(result));
      assert.deepEqual(result.overflow, [], JSON.stringify(result));
      assert.equal(result.rows[0].x, result.rows[1].x);
      assert.ok(result.rows[1].top >= result.rows[0].bottom - 1);
      assert.equal(result.columns.split(' ').length, width < 768 ? 1 : 2);
      await page.locator('.cae-case-row').first().evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' })); await settleScroll(page);
      await capture(page, `catalog-${width}`);
      return result;
    });
    await check(`Detail ${width}px: executive brief has no cover or overflow`, async () => {
      await page.locator('.cae-case-row a').first().click();
      await page.locator('[data-case-content]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.cae-case-detail__hero img, .cae-case-detail__hero picture, .cae-case-detail__hero video, .cae-case-detail__hero canvas').count(), 0);
      const result = await geometry(page, '.cae-case-executive');
      assert.ok(result.documentWidth <= width, JSON.stringify(result)); assert.deepEqual(result.overflow, [], JSON.stringify(result));
      assert.equal(result.columns.split(' ').length, width < 768 ? 1 : 2);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await capture(page, `detail-${width}`); return result;
    });
    await ctx.close();
  }
  const { ctx, page } = await context();
  await check('Filter changes are shareable and survive reload', async () => {
    await catalog(page);
    const goal = await page.locator('[data-filter="goal"] option').nth(1).getAttribute('value');
    await page.locator('[data-filter="goal"]').selectOption(goal);
    const before = await page.locator('[data-result-count]').textContent();
    assert.equal(new URL(page.url()).searchParams.get('goal'), goal);
    await page.reload({ waitUntil: 'networkidle' }); await page.locator('.cae-case-row').first().waitFor();
    assert.equal(await page.locator('[data-filter="goal"]').inputValue(), goal);
    assert.equal(await page.locator('[data-result-count]').textContent(), before);
    return { goal, count: before, url: page.url() };
  });
  await check('Load more → case → back restores visible count, filter URL and scroll', async () => {
    await catalog(page); await page.locator('[data-load-more]').click();
    const expanded = await page.locator('.cae-case-row').count(); assert.ok(expanded > 8);
    await page.locator('.cae-case-row a').nth(expanded - 1).click();
    await page.locator('[data-case-content]').waitFor({ state: 'visible' });
    const saved = await page.evaluate(() => ({ scroll: Number(sessionStorage.getItem('cae.caseCatalogScroll')), visible: Number(sessionStorage.getItem('cae.caseCatalogVisible')), url: sessionStorage.getItem('cae.caseCatalogReturn') }));
    assert.ok(saved.scroll > 0);
    await page.locator('[data-case-back]').first().click();
    await page.locator('.cae-case-row').first().waitFor();
    await page.waitForFunction(expected => Math.abs(scrollY - expected) <= 12, saved.scroll, { timeout: 5000 });
    await settleScroll(page);
    assert.equal(await page.locator('.cae-case-row').count(), expanded);
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash, saved.url);
    assert.ok(Math.abs((await page.evaluate(() => scrollY)) - saved.scroll) <= 12, `Expected scroll ${saved.scroll}, got ${await page.evaluate(() => scrollY)}`);
    return { expanded, restored: saved };
  });
  await check('Unsupported numbers stay out of cards and results; provenance remains readable', async () => {
    await catalog(page);
    const state = await page.evaluate(async () => {
      const data = await window.CAESTHETIC_CASES.load();
      return { count: data.cases.length, supported: data.cases.reduce((n, item) => n + window.CAESTHETIC_CASES.view(item, data.summaries).metrics.length, 0), deprecated: data.cases.some(item => item.evidenceLevel === 'modeled' || item.attribution === 'not_claimed'), source: data.cases[0]?.dataSource };
    });
    if (fixture && fixture.cases.every(item => !item.metrics?.some(metric => ['verified', 'client_reported'].includes(metric.evidenceLevel)))) assert.equal(state.supported, 0);
    assert.equal(state.deprecated, false);
    if (!state.supported) assert.equal(await page.locator('.cae-case-result-value').count(), 0);
    await page.locator('.cae-case-row a').first().click(); await page.locator('[data-case-content]').waitFor({ state: 'visible' });
    assert.ok((await page.locator('[data-data-source]').textContent()).trim().length > 0);
    if (!state.supported) { assert.equal(await page.locator('.cae-case-metric').count(), 0); assert.match(await page.locator('[data-results-note]').textContent(), /No sourced before-and-after result/); }
    return state;
  });
  await check('Empty filter state can reset and returns keyboard focus to the library', async () => {
    await catalog(page);
    const combination = await page.evaluate(async () => {
      const { cases } = await window.CAESTHETIC_CASES.load();
      for (const goal of new Set(cases.flatMap(item => item.goals || []))) for (const country of new Set(cases.map(item => item.country))) {
        if (!cases.some(item => (item.goals || []).includes(goal) && item.country === country)) return { goal, country };
      }
      return null;
    });
    assert.ok(combination, 'Fixture must contain an empty cross-filter combination.');
    await page.locator('[data-filter="goal"]').selectOption(combination.goal);
    await page.locator('.cae-case-more-filters summary').click();
    await page.locator('[data-filter="country"]').selectOption(combination.country);
    await page.locator('[data-empty-state]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.cae-case-row').count(), 0);
    assert.ok(await page.locator('[data-case-list]').isHidden(), 'The empty case list must not keep its grid border.');
    await page.locator('[data-empty-clear]').click();
    assert.equal(await page.locator('[data-filter="goal"]').inputValue(), '');
    assert.ok(await page.locator('.cae-case-row').count() > 0);
    assert.ok(await page.locator('[data-library-content]').evaluate(el => el === document.activeElement));
    return combination;
  });
  await check('TEST records are excluded and direct TEST detail links are unavailable', async () => {
    await catalog(page);
    assert.equal(await page.locator('.cae-case-row[data-case-id^="TEST"]').count(), 0);
    assert.equal(await page.locator('.cae-case-row[data-case-id="internal-qa-record"]').count(), 0);
    await page.goto(base + '/case-studies/case/?id=TEST_hidden-record', { waitUntil: 'networkidle' });
    await page.locator('[data-case-error]').waitFor({ state: 'visible' });
    assert.ok(await page.locator('[data-case-content]').isHidden());
  });
  await check('External return URLs fall back to the case catalog', async () => {
    await page.goto(base + '/case-studies/case/?id=TEST_hidden-record&return=https%3A%2F%2Fexample.com%2F', { waitUntil: 'networkidle' });
    const href = await page.locator('[data-case-back]').first().getAttribute('href'); assert.equal(href, '/case-studies/#case-library');
  });
  await check('API errors have a readable retry state on both routes', async () => {
    await page.route('**/case-studies/intake/api/public-cases**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"temporary"}' }));
    await page.goto(base + '/case-studies/', { waitUntil: 'networkidle' }); await page.locator('[data-load-error]').waitFor({ state: 'visible' });
    assert.ok(await page.locator('[data-library-content]').isHidden());
    await page.unroute('**/case-studies/intake/api/public-cases**');
    await page.locator('[data-retry-cases]').click();
    await page.locator('.cae-case-row').first().waitFor();
    assert.ok(await page.locator('[data-load-error]').isHidden());
    await page.route('**/case-studies/intake/api/public-cases**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"temporary"}' }));
    await page.goto(base + '/case-studies/case/?id=qa-situation-1', { waitUntil: 'networkidle' }); await page.locator('[data-case-error]').waitFor({ state: 'visible' });
    assert.match(await page.locator('[data-error-title]').textContent(), /couldn’t load/);
  });
  await ctx.close();
  await check('No JavaScript runtime errors', async () => assert.deepEqual(errors, []));
} finally {
  await browser.close(); if (server) await new Promise(resolve => server.close(resolve));
  const report = { base, fixture: process.env.CAE_CASE_FIXTURE ? path.basename(process.env.CAE_CASE_FIXTURE) : fixture ? 'synthetic' : 'live', browser: 'chromium', generatedAt: new Date().toISOString(), checks, screenshots, errors, status: checks.some(item => item.status === 'fail') ? 'fail' : 'pass' };
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'pass') process.exitCode = 1;
}
