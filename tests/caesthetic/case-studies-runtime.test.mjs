import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
const root = resolve(new URL('../..', import.meta.url).pathname);
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const shared = read('site-caesthetic/assets/js/case-study-content.js');
const runtime = read('site-caesthetic/assets/js/case-studies.js');
const detail = read('site-caesthetic/assets/js/case-study-detail.js');
const catalogue = read('site-caesthetic/case-studies/index.html');
const detailPage = read('site-caesthetic/case-studies/case/index.html');
const router = read('infra/cloudflare/router/src/index.ts');
const context = { window: {}, location: { origin: 'https://caesthetic.com' }, URL, fetch: async () => { throw Error('No fixture'); } };
vm.runInNewContext(shared, context);
const cases = context.window.CAESTHETIC_CASES;
const metric = { evidenceLevel: 'verified', source: 'CRM export, reviewed 2026-08-31', timeframe: 'January–March → April–June 2026', before: { display: '18% (18/100)' }, after: { display: '24% (24/100)' } };

test('public records exclude TEST IDs and TEST titles', () => {
  assert.equal(cases.isPublic({ id: 'test-draft', title: 'Example' }), false);
  assert.equal(cases.isPublic({ id: 'normal', title: 'TEST publication' }), false);
  assert.equal(cases.isPublic({ id: 'normal', title: 'Consultation requests' }), true);
});
test('deprecated fields are omitted recursively without altering the source or upgrading evidence', () => {
  const source = { id: 'one', title: 'One', evidenceLevel: 'modeled', attribution: 'not_claimed', evidenceStatus: 'Modeled result', mediaId: 'old.cover', metrics: [{ ...metric, evidenceLevel: 'modeled' }, metric], headlineMetric: { evidenceLevel: 'modeled' }, dataSource: 'Original source', limitations: 'Original limitations' };
  const snapshot = JSON.stringify(source); const result = cases.clean(source);
  assert.equal(JSON.stringify(source), snapshot);
  for (const key of ['evidenceLevel', 'attribution', 'evidenceStatus', 'mediaId']) assert.equal(key in result, false);
  assert.equal('evidenceLevel' in result.metrics[0], false);
  assert.equal('evidenceLevel' in result.headlineMetric, false);
  assert.equal(result.metrics[1].evidenceLevel, 'verified');
  assert.equal(result.dataSource, source.dataSource); assert.equal(result.limitations, source.limitations);
});
test('results need an explicit classification, source, period and actual before/after', () => {
  const view = (m, rest = {}) => cases.view({ title: 'Example', metrics: [m], ...rest }).metrics;
  assert.equal(view(metric).length, 1);
  assert.equal(view({ ...metric, evidenceLevel: 'client_reported' }).length, 1);
  for (const key of ['source', 'timeframe', 'evidenceLevel']) assert.equal(view({ ...metric, [key]: '' }).length, 0);
  assert.equal(view({ ...metric, before: { display: 'Baseline documented' } }).length, 0);
  assert.equal(view({ ...metric, source: 'Modeled example' }).length, 0);
  assert.equal(view(metric, { caestheticRole: 'Prepared a modelled comparison' }).length, 0);
  assert.equal(view(metric, { limitations: 'Hypothetical figures' }).length, 0);
});
test('short editorial copy is bound to the published title and version', () => {
  const item = { id: 'one', title: 'Original', updatedAt: 17, before: 'Source situation', interventionSummary: 'Source approach' };
  const summaries = { one: { sourceTitle: 'Original', sourceUpdatedAt: 17, title: 'Short title', situation: 'Short situation', approach: 'Short approach' } };
  assert.equal(cases.view(item, summaries).title, 'Short title');
  assert.equal(cases.view({ ...item, updatedAt: 18 }, summaries).title, 'Original');
  assert.equal(cases.view({ ...item, title: 'Edited title' }, summaries).title, 'Edited title');
  assert.equal(cases.view({ ...item, card: { title: 'Manager title' } }, summaries).title, 'Manager title');
});
test('return navigation only accepts the public catalogue on this origin', () => {
  assert.equal(cases.safeReturn('/case-studies/?country=France'), '/case-studies/?country=France#case-library');
  for (const path of ['https://elsewhere.test/case-studies/', '/case-studies/intake/', '/case-studies/case/?id=x', 'javascript:alert(1)']) assert.equal(cases.safeReturn(path), '/case-studies/#case-library');
});
test('catalogue leads with cases and uses a single goal control and image-free case components', () => {
  assert.ok(catalogue.indexOf('id="case-library"') < catalogue.indexOf('id="how-we-work"'));
  assert.equal((catalogue.match(/data-filter="goal"/g) || []).length, 1);
  assert.doesNotMatch(catalogue, /data-featured-case|data-case-goal|data-mobile-filter/);
  assert.doesNotMatch(runtime + detail + detailPage, /coverMediaId|createElement\(['"]img|<img|<picture/);
  assert.match(catalogue, /data-connect4-picture="system"/);
  assert.match(runtime, /data-load-error/); assert.match(runtime, /data-library-content/);
});
test('internal intake routes stay protected while public JSON is projected and TEST-filtered', () => {
  const smoke = read('scripts/caesthetic-case-intake-production-smoke.sh');
  const intake = read('site-caesthetic/case-studies/intake/index.html');
  assert.match(router, /url\.pathname === `\$\{CASE_INTAKE_PREFIX\}\/api\/public-cases`/);
  assert.match(router, /protectedCaseIntakeResponse\(\)/);
  assert.match(router, /data\.cases\.filter\(isPublicCatalogCase\)\.map/);
  assert.match(router, /function projectPublicCase/);
  assert.match(smoke, /probe_closed "\$ROOT_URL\/guide" guide/);
  assert.match(smoke, /probe_closed "\$ROOT_URL\/api\/cases" internal-api/);
  assert.match(smoke, /probe_public_cases/);
  assert.doesNotMatch(intake, /webtra\.chatgpt\.site|location\.replace/);
});

test('publisher confirmation is identified as the source of the claim', () => {
  assert.equal(cases.evidenceLabel({ evidenceLevel: 'verified', source: 'CAESTHETIC case data; verified status confirmed by the case publisher.' }), 'Publisher-confirmed');
  assert.equal(cases.evidenceLabel(metric), 'Verified against source');
});
