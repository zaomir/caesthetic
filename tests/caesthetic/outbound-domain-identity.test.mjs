import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const read = (file) => readFile(path.join(root, file), 'utf8');

const policyPath = 'docs/ssot/CAESTHETIC_OUTBOUND_DOMAIN_STANDARD.md';
const portfolioPath = 'infra/cloudflare/caesthetic-outreach/domains.json';
const workerPath = 'infra/cloudflare/caesthetic-outreach/index.mjs';

const expected = Object.freeze({
  'caesthetic.co': {
    campaign: 'direct-caesthetic',
    role: 'Direct CAESTHETIC',
    entry: 'https://caesthetic.co/',
    destination: 'https://caesthetic.com/outreach/direct-caesthetic/',
    page: 'site-caesthetic/outreach/direct-caesthetic/index.html',
    marker: 'DIRECT_CAESTHETIC_PAGE_V1',
    headline: 'Know what to fix before you add more demand.',
    fullHost: true,
  },
  'bebofix.com': {
    campaign: 'fix-before-you-fund',
    role: 'Fix Before You Fund',
    entry: 'https://bebofix.com/caesthetic/',
    destination: 'https://caesthetic.com/outreach/fix-before-you-fund/',
    page: 'site-caesthetic/outreach/fix-before-you-fund/index.html',
    marker: 'FIX_BEFORE_YOU_FUND_PAGE_V1',
    headline: 'Repair the first constraint before funding more traffic.',
  },
  'bebonow.com': {
    campaign: 'booking-readiness-now',
    role: 'Booking Readiness Now',
    entry: 'https://bebonow.com/caesthetic/',
    destination: 'https://caesthetic.com/outreach/booking-readiness-now/',
    page: 'site-caesthetic/outreach/booking-readiness-now/index.html',
    marker: 'BOOKING_READINESS_NOW_PAGE_V1',
    headline: 'Is the public booking journey ready for what changed now?',
  },
  'bototox.com': {
    campaign: 'professional-practice-growth',
    role: 'Professional Aesthetic Practice Growth',
    entry: 'https://bototox.com/caesthetic/',
    destination: 'https://caesthetic.com/outreach/professional-aesthetics-growth/',
    page: 'site-caesthetic/outreach/professional-aesthetics-growth/index.html',
    marker: 'PROFESSIONAL_AESTHETICS_GROWTH_PAGE_V1',
    headline: 'A strong treatment menu is not yet a connected growth system.',
  },
  'grainee.com': {
    campaign: 'search-reputation-evidence',
    role: 'Search and Reputation Evidence',
    entry: 'https://grainee.com/caesthetic/',
    destination: 'https://caesthetic.com/outreach/search-reputation-evidence/',
    page: 'site-caesthetic/outreach/search-reputation-evidence/index.html',
    marker: 'SEARCH_REPUTATION_EVIDENCE_PAGE_V1',
    headline: 'What do Search and Reviews tell a patient before they open your website?',
  },
});

async function portfolio() {
  return JSON.parse(await read(portfolioPath));
}

test('founder policy authorizes the five-domain portfolio and requires distinct pages', async () => {
  const policy = await read(policyPath);
  const registry = await read('docs/ssot/PROJECT_DOMAIN_REGISTRY.md');
  const config = await portfolio();
  const rows = new Map(config.domains.map((row) => [row.domain, row]));

  assert.equal(config.version, 3);
  assert.equal(config.worker, 'grainee-caesthetic-outreach');
  assert.equal(config.verification_hub_url, 'https://caesthetic.com/outreach/');
  assert.deepEqual([...rows.keys()].sort(), Object.keys(expected).sort());

  for (const [domain, contract] of Object.entries(expected)) {
    const row = rows.get(domain);
    assert.ok(row, `missing sender domain ${domain}`);
    assert.equal(row.status, 'approved_portfolio_sender_domain');
    assert.equal(row.campaign, contract.campaign);
    assert.equal(row.role, contract.role);
    assert.equal(row.entry_url, contract.entry);
    assert.equal(row.destination_url, contract.destination);
    assert.equal(row.content_marker, contract.marker);
    assert.equal(row.routes.length, 2);
    assert.ok(policy.includes(domain), `policy missing ${domain}`);
    assert.ok(policy.includes(contract.destination), `policy missing distinct destination for ${domain}`);
    assert.ok(registry.includes(domain), `domain registry missing ${domain}`);
  }

  assert.doesNotMatch(policy, /not_authorized_for_caesthetic_outbound/);
  assert.match(policy, /five distinct noindex verification pages/i);
  assert.match(policy, /one account[\s\S]*one active opening narrative[\s\S]*one assigned sender domain/i);
  assert.match(policy, /one unsubscribe[\s\S]*all five domains/i);
  assert.match(policy, /SPF, DKIM and DMARC/);
  assert.match(policy, /technical `HOLD` is a readiness state[\s\S]*not a product prohibition/i);
});

test('verification hub is short, noindex, and routes to five different pages', async () => {
  const hub = await read('site-caesthetic/outreach/index.html');
  assert.match(hub, /data-page="outreach-identity"/);
  assert.match(hub, /noindex,follow,noarchive,nosnippet/);
  assert.match(hub, /Five sender routes\. Five different reasons/);
  assert.match(hub, /CAESTHETIC_OUTREACH_HUB_V2/);
  for (const contract of Object.values(expected)) {
    assert.ok(hub.includes(new URL(contract.destination).pathname), `hub missing ${contract.destination}`);
  }
});

test('each sender route has unique copy and the same product/evidence boundaries', async () => {
  const titles = new Set();
  const headlines = new Set();
  const hashes = new Set();

  for (const [domain, contract] of Object.entries(expected)) {
    const html = await read(contract.page);
    assert.match(html, /data-page="outreach-domain"/);
    assert.ok(html.includes(`data-sender-domain="${domain}"`));
    assert.match(html, /noindex,follow,noarchive,nosnippet/);
    assert.ok(html.includes(`rel="canonical" href="${contract.destination}"`));
    assert.ok(html.includes(contract.marker));
    assert.ok(html.includes(contract.headline));
    assert.ok(html.includes(domain));
    assert.match(html, /free Growth Score/i);
    assert.match(html, /30-Day Growth Sprint/);
    assert.match(html, /does <strong>not<\/strong> mean that CAESTHETIC has already completed a diagnosis/);
    assert.match(html, /OXFORD PROJETS trading as CAESTHETIC/);
    assert.match(html, /#100, 600 W 7th St, Los Angeles, California 90017, US/);
    assert.match(html, /mailto:info@caesthetic\.com\?subject=Unsubscribe/);
    for (const surface of ['Search / Google Business Profile', 'Website', 'Social', 'Reputation / Reviews']) {
      assert.ok(html.includes(surface), `${contract.page} missing ${surface}`);
    }

    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const headline = html.match(/<h1 class="cae-h1">([^<]+)<\/h1>/)?.[1];
    assert.ok(title);
    assert.ok(headline);
    titles.add(title);
    headlines.add(headline);
    hashes.add(html);
  }

  assert.equal(titles.size, 5, 'sender-page titles must differ');
  assert.equal(headlines.size, 5, 'sender-page headlines must differ');
  assert.equal(hashes.size, 5, 'sender-page HTML must differ');
});

test('portfolio Worker sends each approved host to its own fixed canonical page', async () => {
  const workerUrl = `${pathToFileURL(path.join(root, workerPath)).href}?test=${Date.now()}`;
  const { default: worker, SENDER_DOMAINS, buildCanonicalTarget, resolveSender } = await import(workerUrl);
  assert.deepEqual(Object.keys(SENDER_DOMAINS).sort(), Object.keys(expected).sort());

  for (const [domain, contract] of Object.entries(expected)) {
    const pathName = contract.fullHost ? '/unexpected/path' : '/caesthetic/source-check';
    const source = `https://${domain}${pathName}?utm_campaign=pilot&utm_content=owner&ref=source&unsafe=https://evil.example`;
    const sender = resolveSender(source);
    assert.equal(sender.domain, domain);
    assert.equal(sender.campaign, contract.campaign);
    assert.equal(new URL(sender.destinationPath, 'https://caesthetic.com').toString(), contract.destination);

    const target = buildCanonicalTarget(source);
    assert.equal(target.origin, 'https://caesthetic.com');
    assert.equal(target.pathname, new URL(contract.destination).pathname);
    assert.equal(target.searchParams.get('sender_domain'), domain);
    assert.equal(target.searchParams.get('campaign'), contract.campaign);
    assert.equal(target.searchParams.get('utm_source'), domain);
    assert.equal(target.searchParams.get('utm_medium'), 'sender-domain');
    assert.equal(target.searchParams.get('utm_campaign'), 'pilot');
    assert.equal(target.searchParams.get('utm_content'), 'owner');
    assert.equal(target.searchParams.get('ref'), 'source');
    assert.equal(target.searchParams.has('unsafe'), false);

    const response = await worker.fetch(new Request(source));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), target.toString());
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive, nosnippet');
  }
});

test('portfolio Worker preserves existing product roots and blocks unregistered hosts', async () => {
  const workerUrl = `${pathToFileURL(path.join(root, workerPath)).href}?negative=${Date.now()}`;
  const { default: worker, resolveSender } = await import(workerUrl);

  for (const domain of ['bebofix.com', 'bebonow.com', 'bototox.com', 'grainee.com']) {
    assert.equal(resolveSender(`https://${domain}/`), null);
    const rootResponse = await worker.fetch(new Request(`https://${domain}/`));
    assert.equal(rootResponse.status, 404);
    const lookalike = await worker.fetch(new Request(`https://${domain}/caesthetic-fake`));
    assert.equal(lookalike.status, 404);
  }

  const unknown = await worker.fetch(new Request('https://example.com/caesthetic/'));
  assert.equal(unknown.status, 404);
  const post = await worker.fetch(new Request('https://caesthetic.co/', { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('release workflow deploys and smokes all five distinct sender destinations', async () => {
  const workflow = await read('.github/workflows/deploy-caesthetic.yml');
  const footer = await read('site-caesthetic/templates/footer.html');
  const siteMap = await read('site-caesthetic/SITE_MAP.md');
  const readme = await read('site-caesthetic/README.md');
  const smoke = await read('scripts/caesthetic-outreach-domain-smoke.sh');

  assert.match(workflow, /node --test tests\/caesthetic\/outbound-domain-identity\.test\.mjs/);
  assert.match(workflow, /bash scripts\/cf-caesthetic-outreach-domain\.sh/);
  assert.match(workflow, /bash scripts\/caesthetic-outreach-domain-smoke\.sh/);
  assert.match(workflow, /sender_domain_count=5/);
  assert.match(footer, /href="\/outreach\/">Sender portfolio/);
  assert.match(siteMap, /five distinct noindex pages/i);
  assert.match(readme, /five distinct noindex campaign pages/i);

  for (const [domain, contract] of Object.entries(expected)) {
    assert.ok(workflow.includes(domain), `workflow missing ${domain}`);
    assert.ok(siteMap.includes(domain), `site map missing ${domain}`);
    assert.ok(readme.includes(domain), `README missing ${domain}`);
    assert.ok(smoke.includes(new URL(contract.destination).pathname), `smoke missing ${contract.destination}`);
    assert.ok(smoke.includes(contract.marker), `smoke missing ${contract.marker}`);
  }
});
