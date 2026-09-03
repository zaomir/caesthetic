import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const read = (file) => readFile(path.join(root, file), 'utf8');

const policyPath = 'docs/ssot/CAESTHETIC_OUTBOUND_DOMAIN_STANDARD.md';
const pagePath = 'site-caesthetic/outreach/index.html';
const workerPath = 'infra/cloudflare/caesthetic-outreach/index.mjs';

test('domain policy keeps one CAESTHETIC sender identity and explicit boundaries', async () => {
  const policy = await read(policyPath);
  const registry = await read('docs/ssot/PROJECT_DOMAIN_REGISTRY.md');
  assert.match(policy, /caesthetic\.co[\s\S]*approved_cold_outbound_sender/);
  assert.match(registry, /caesthetic\.co[\s\S]*approved cold-outbound sender and verification edge/);
  for (const domain of ['bebofix.com', 'bebonow.com', 'bototox.com', 'grainee.com']) {
    assert.match(policy, new RegExp(domain.replace('.', '\\.') + '[\\s\\S]{0,500}not_authorized_for_caesthetic_outbound'));
  }
  assert.match(policy, /caesthetic\.com[\s\S]*canonical public website/);
  assert.match(policy, /Reply-first/);
  assert.match(policy, /SPF, DKIM and DMARC/);
  assert.match(policy, /48 hours/);
});

test('public identity page is honest, noindex and product-canonical', async () => {
  const html = await read(pagePath);
  assert.match(html, /data-page="outreach-identity"/);
  assert.match(html, /noindex,follow,noarchive,nosnippet/);
  assert.match(html, /caesthetic\.co[\s\S]*dedicated cold-outreach email domain/);
  assert.match(html, /only domain currently designated for CAESTHETIC cold outreach/);
  assert.match(html, /does <strong>not<\/strong> mean that CAESTHETIC has already completed a diagnosis/);
  for (const surface of ['Search / Google Business Profile', 'Website', 'Social', 'Reputation / Reviews']) {
    assert.ok(html.includes(surface), `missing surface ${surface}`);
  }
  assert.match(html, /OXFORD PROJETS trading as CAESTHETIC/);
  assert.match(html, /#100, 600 W 7th St, Los Angeles, California 90017, US/);
  assert.match(html, /mailto:info@caesthetic\.com\?subject=Unsubscribe/);
});

test('sender-domain Worker redirects only to the canonical identity page', async () => {
  const workerUrl = pathToFileURL(path.join(root, workerPath)).href;
  const { default: worker } = await import(workerUrl);
  const response = await worker.fetch(new Request(
    'https://caesthetic.co/unexpected/path?utm_campaign=pilot&ref=owner&unsafe=https://evil.example',
  ));
  assert.equal(response.status, 308);
  const target = new URL(response.headers.get('location'));
  assert.equal(target.origin, 'https://caesthetic.com');
  assert.equal(target.pathname, '/outreach/');
  assert.equal(target.searchParams.get('utm_source'), 'caesthetic.co');
  assert.equal(target.searchParams.get('utm_medium'), 'sender-domain');
  assert.equal(target.searchParams.get('utm_campaign'), 'pilot');
  assert.equal(target.searchParams.get('ref'), 'owner');
  assert.equal(target.searchParams.has('unsafe'), false);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive, nosnippet');

  const post = await worker.fetch(new Request('https://caesthetic.co/', { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('release workflow deploys and smokes the sender-domain surface', async () => {
  const workflow = await read('.github/workflows/deploy-caesthetic.yml');
  const footer = await read('site-caesthetic/templates/footer.html');
  const siteMap = await read('site-caesthetic/SITE_MAP.md');
  assert.match(workflow, /node --test tests\/caesthetic\/outbound-domain-identity\.test\.mjs/);
  assert.match(workflow, /bash scripts\/cf-caesthetic-outreach-domain\.sh/);
  assert.match(workflow, /bash scripts\/caesthetic-outreach-domain-smoke\.sh/);
  assert.match(footer, /href="\/outreach\/">Sender verification/);
  assert.match(siteMap, /`\/outreach\/`[\s\S]*noindex/);
});
