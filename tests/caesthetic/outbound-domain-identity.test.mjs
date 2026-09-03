import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const read = (file) => readFile(path.join(root, file), 'utf8');
const portfolioPath = 'infra/cloudflare/caesthetic-outreach/domains.json';
const policyPath = 'docs/ssot/CAESTHETIC_OUTBOUND_DOMAIN_STANDARD.md';
const pagePath = 'site-caesthetic/outreach/index.html';
const workerPath = 'infra/cloudflare/caesthetic-outreach/index.mjs';

const expected = Object.freeze({
  'caesthetic.co': {
    campaign: 'direct-caesthetic',
    role: 'Direct CAESTHETIC',
    entry: 'https://caesthetic.co/',
    fullHost: true,
  },
  'bebofix.com': {
    campaign: 'fix-before-you-fund',
    role: 'Fix Before You Fund',
    entry: 'https://bebofix.com/caesthetic/',
  },
  'bebonow.com': {
    campaign: 'booking-readiness-now',
    role: 'Booking Readiness Now',
    entry: 'https://bebonow.com/caesthetic/',
  },
  'bototox.com': {
    campaign: 'professional-practice-growth',
    role: 'Professional Aesthetic Practice Growth',
    entry: 'https://bototox.com/caesthetic/',
  },
  'grainee.com': {
    campaign: 'search-reputation-evidence',
    role: 'Search and Reputation Evidence',
    entry: 'https://grainee.com/caesthetic/',
  },
});

async function portfolio() {
  return JSON.parse(await read(portfolioPath));
}

test('founder policy authorizes exactly the five-domain CAESTHETIC sender portfolio', async () => {
  const policy = await read(policyPath);
  const master = await read('docs/ssot/CAESTHETIC.md');
  const registry = await read('docs/ssot/PROJECT_DOMAIN_REGISTRY.md');
  const config = await portfolio();
  const rows = new Map(config.domains.map((row) => [row.domain, row]));

  assert.equal(config.version, 2);
  assert.equal(config.worker, 'grainee-caesthetic-outreach');
  assert.equal(config.canonical_url, 'https://caesthetic.com/outreach/');
  assert.deepEqual([...rows.keys()].sort(), Object.keys(expected).sort());

  for (const [domain, contract] of Object.entries(expected)) {
    const row = rows.get(domain);
    assert.ok(row, `missing sender domain ${domain}`);
    assert.equal(row.status, 'approved_portfolio_sender_domain');
    assert.equal(row.campaign, contract.campaign);
    assert.equal(row.role, contract.role);
    assert.equal(row.entry_url, contract.entry);
    assert.equal(row.routes.length, 2);
    assert.match(policy, new RegExp(domain.replaceAll('.', '\\.') + '[\\s\\S]{0,600}approved_portfolio_sender_domain'));
    assert.ok(registry.includes(domain), `domain registry missing ${domain}`);
  }

  assert.equal(rows.get('caesthetic.co').provision_web_dns, true);
  assert.deepEqual(rows.get('caesthetic.co').routes, ['caesthetic.co/*', 'www.caesthetic.co/*']);
  for (const domain of ['bebofix.com', 'bebonow.com', 'bototox.com', 'grainee.com']) {
    const row = rows.get(domain);
    assert.equal(row.provision_web_dns, false);
    assert.deepEqual(row.routes, [`${domain}/caesthetic/*`, `www.${domain}/caesthetic/*`]);
    assert.equal(row.routes.includes(`${domain}/*`), false, `root route must remain preserved for ${domain}`);
  }
  assert.deepEqual(rows.get('grainee.com').proxy_existing_web_records, ['www.grainee.com']);

  assert.doesNotMatch(policy, /not_authorized_for_caesthetic_outbound/);
  assert.match(master, /Cold outbound \| approved five-domain portfolio/);
  assert.match(master, /five-domain portfolio approved by `CAESTHETIC_OUTBOUND_DOMAIN_STANDARD\.md`/);
  assert.match(policy, /one account[\s\S]*one active opening narrative[\s\S]*one assigned sender domain/i);
  assert.match(policy, /one unsubscribe[\s\S]*all five domains/i);
  assert.match(policy, /SPF, DKIM and DMARC/);
  assert.match(policy, /technical `HOLD` is a readiness state[\s\S]*not a ban/i);
});

test('canonical verification page explains all roles without changing the product canon', async () => {
  const html = await read(pagePath);
  assert.match(html, /data-page="outreach-identity"/);
  assert.match(html, /noindex,follow,noarchive,nosnippet/);
  assert.match(html, /approved CAESTHETIC sender portfolio/);
  assert.match(html, /One product, five campaign doors/);
  assert.match(html, /free outside-in Growth Score/);
  assert.match(html, /30-Day Growth Sprint/);
  assert.match(html, /optional Growth System/);

  for (const [domain, contract] of Object.entries(expected)) {
    assert.ok(html.includes(domain), `page missing ${domain}`);
    assert.ok(html.includes(contract.role), `page missing role ${contract.role}`);
  }
  for (const surface of ['Search / Google Business Profile', 'Website', 'Social', 'Reputation / Reviews']) {
    assert.ok(html.includes(surface), `missing surface ${surface}`);
  }

  assert.match(html, /does <strong>not<\/strong> mean that CAESTHETIC has already completed a diagnosis/);
  assert.match(html, /One unsubscribe suppresses future CAESTHETIC marketing outreach across all five sender domains/);
  assert.match(html, /OXFORD PROJETS trading as CAESTHETIC/);
  assert.match(html, /#100, 600 W 7th St, Los Angeles, California 90017, US/);
  assert.match(html, /mailto:info@caesthetic\.com\?subject=Unsubscribe/);
  assert.match(html, /Product procurement and CAESTHETIC growth work remain separate/);
});

test('portfolio Worker maps every approved host to a fixed canonical campaign', async () => {
  const workerUrl = `${pathToFileURL(path.join(root, workerPath)).href}?test=${Date.now()}`;
  const { default: worker, SENDER_DOMAINS, buildCanonicalTarget, resolveSender } = await import(workerUrl);
  assert.deepEqual(Object.keys(SENDER_DOMAINS).sort(), Object.keys(expected).sort());

  for (const [domain, contract] of Object.entries(expected)) {
    const pathName = contract.fullHost ? '/unexpected/path' : '/caesthetic/source-check';
    const source = `https://${domain}${pathName}?utm_campaign=pilot&utm_content=owner&ref=source&unsafe=https://evil.example`;
    const sender = resolveSender(source);
    assert.equal(sender.domain, domain);
    assert.equal(sender.campaign, contract.campaign);

    const target = buildCanonicalTarget(source);
    assert.equal(target.origin, 'https://caesthetic.com');
    assert.equal(target.pathname, '/outreach/');
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

test('deployment scripts use the fixed portfolio registry and preserve mail DNS', async () => {
  const deployer = await read('scripts/deploy-caesthetic-outreach-edge.py');
  const zoneConfig = await read('scripts/configure-caesthetic-outreach-dns.py');
  const wrapper = await read('scripts/cf-caesthetic-outreach-domain.sh');
  const wrangler = await read('infra/cloudflare/caesthetic-outreach/wrangler.toml');

  assert.match(deployer, /REGISTRY_PATH/);
  assert.match(deployer, /EXPECTED_DOMAINS/);
  assert.match(deployer, /grouped\.setdefault\(access\.account_id/);
  assert.match(deployer, /deploy Worker for account_domains/);
  assert.match(deployer, /incomplete sender-domain portfolio/);
  assert.match(zoneConfig, /provision_web_dns/);
  assert.match(zoneConfig, /proxy_existing_web_record/);
  assert.match(zoneConfig, /"PATCH"/);
  assert.match(deployer, /proxy_existing_web_records/);
  assert.match(deployer, /"proxy_existing"/);
  assert.match(deployer, /CAESTHETIC_OUTREACH_DNS_PROXY=externally_managed/);
  assert.match(deployer, /reason=no_configured_dns_permission/);
  assert.doesNotMatch(deployer, /DNS proxy authority is unavailable/);
  assert.match(zoneConfig, /CAESTHETIC_OUTREACH_OPERATION/);
  assert.match(zoneConfig, /MX, TXT, DKIM, DMARC/);
  assert.match(zoneConfig, /for pattern in row\["routes"\]/);
  assert.match(wrapper, /deploy-caesthetic-outreach-edge\.py/);
  assert.doesNotMatch(wrapper, /DOMAIN.*caesthetic\.co/);
  assert.doesNotMatch(wrangler, /\[\[routes\]\]/);
});

test('release workflow deploys and smokes all five sender entries', async () => {
  const workflow = await read('.github/workflows/deploy-caesthetic.yml');
  const footer = await read('site-caesthetic/templates/footer.html');
  const siteMap = await read('site-caesthetic/SITE_MAP.md');
  const readme = await read('site-caesthetic/README.md');

  assert.match(workflow, /five-domain sender portfolio/);
  assert.match(workflow, /python3 -m json\.tool infra\/cloudflare\/caesthetic-outreach\/domains\.json/);
  assert.match(workflow, /node --test tests\/caesthetic\/outbound-domain-identity\.test\.mjs/);
  assert.match(workflow, /bash scripts\/cf-caesthetic-outreach-domain\.sh/);
  assert.match(workflow, /bash scripts\/caesthetic-outreach-domain-smoke\.sh/);
  assert.match(workflow, /sender_domain_count=5/);
  for (const domain of Object.keys(expected)) {
    assert.ok(workflow.includes(domain), `workflow missing ${domain}`);
    assert.ok(siteMap.includes(domain), `site map missing ${domain}`);
    assert.ok(readme.includes(domain), `README missing ${domain}`);
  }
  assert.match(footer, /href="\/outreach\/">Sender portfolio/);
  assert.match(siteMap, /`\/outreach\/`[\s\S]*noindex/);
});
