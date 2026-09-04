import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const read = (file) => readFile(path.join(root, file), 'utf8');
const registryPath = 'infra/cloudflare/caesthetic-outreach/domains.json';
const retiredPagePath = 'site-caesthetic/outreach/index.html';
const workerPath = 'infra/cloudflare/caesthetic-outreach/index.mjs';

const expected = Object.freeze({
  'caesthetic.co': {
    status: 'active_brand_alias',
    action: 'redirect_canonical_home',
    entry: 'https://caesthetic.co/',
    fullHost: true,
  },
  'bebofix.com': {
    status: 'retired_caesthetic_bridge',
    action: 'not_found',
    entry: 'https://bebofix.com/caesthetic/',
  },
  'bebonow.com': {
    status: 'retired_caesthetic_bridge',
    action: 'not_found',
    entry: 'https://bebonow.com/caesthetic/',
  },
  'bototox.com': {
    status: 'conditional_historical_sender_no_public_bridge',
    action: 'not_found',
    entry: 'https://bototox.com/caesthetic/',
  },
  'grainee.com': {
    status: 'retired_caesthetic_bridge',
    action: 'not_found',
    entry: 'https://grainee.com/caesthetic/',
  },
});

async function registry() {
  return JSON.parse(await read(registryPath));
}

function publicHtmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicHtmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

test('runtime registry retires the public outreach hub without changing owning product roots', async () => {
  const config = await registry();
  const rows = new Map(config.domains.map((row) => [row.domain, row]));

  assert.equal(config.version, 3);
  assert.equal(config.worker, 'grainee-caesthetic-outreach');
  assert.equal(config.canonical_url, 'https://caesthetic.com/');
  assert.deepEqual([...rows.keys()].sort(), Object.keys(expected).sort());

  for (const [domain, contract] of Object.entries(expected)) {
    const row = rows.get(domain);
    assert.ok(row, `missing fixed runtime route ${domain}`);
    assert.equal(row.status, contract.status);
    assert.equal(row.action, contract.action);
    assert.equal(row.entry_url, contract.entry);
    assert.equal(row.routes.length, 2);
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
});

test('retired /outreach/ page and internal links stay absent', async () => {
  await assert.rejects(access(path.join(root, retiredPagePath)));
  const footer = await read('site-caesthetic/templates/footer.html');
  const siteMap = await read('site-caesthetic/SITE_MAP.md');
  const sitemap = await read('site-caesthetic/sitemap.xml');
  const readme = await read('site-caesthetic/README.md');
  const linkedFiles = [];
  for (const file of publicHtmlFiles(path.join(root, 'site-caesthetic'))) {
    if ((await readFile(file, 'utf8')).includes('/outreach/')) {
      linkedFiles.push(path.relative(root, file));
    }
  }

  assert.deepEqual(linkedFiles, [], 'public HTML must not link to /outreach/');
  assert.doesNotMatch(footer, /href=["']\/outreach\/?["']/);
  assert.doesNotMatch(sitemap, /\/outreach\//);
  assert.doesNotMatch(siteMap, /`\/outreach\/`/);
  assert.doesNotMatch(readme, /`\/outreach\/`/);
  assert.match(siteMap, /retired outreach verification route[\s\S]{0,120}HTTP 404/i);
});

test('sender-domain Worker redirects only caesthetic.co to the canonical home', async () => {
  const workerUrl = `${pathToFileURL(path.join(root, workerPath)).href}?redirect=${Date.now()}`;
  const { default: worker, SENDER_DOMAIN_ROUTES, buildCanonicalTarget, resolveRoute } = await import(workerUrl);
  assert.deepEqual(Object.keys(SENDER_DOMAIN_ROUTES).sort(), Object.keys(expected).sort());

  for (const source of [
    'https://caesthetic.co/unexpected/path?utm_campaign=pilot&utm_content=owner&ref=source&unsafe=https://evil.example',
    'https://www.caesthetic.co/',
  ]) {
    const route = resolveRoute(source);
    assert.equal(route.domain, 'caesthetic.co');
    assert.equal(route.action, 'redirect_canonical_home');

    const target = buildCanonicalTarget(source);
    assert.equal(target.origin, 'https://caesthetic.com');
    assert.equal(target.pathname, '/');
    assert.equal(target.searchParams.get('utm_source'), 'caesthetic.co');
    assert.equal(target.searchParams.get('utm_medium'), 'sender-domain');
    assert.ok(target.searchParams.get('utm_campaign'));
    assert.equal(target.searchParams.has('unsafe'), false);

    const response = await worker.fetch(new Request(source));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), target.toString());
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive, nosnippet');
  }
});

test('retired and non-public bridge paths return 404 while existing roots remain untouched', async () => {
  const workerUrl = `${pathToFileURL(path.join(root, workerPath)).href}?negative=${Date.now()}`;
  const { default: worker, buildCanonicalTarget, resolveRoute } = await import(workerUrl);

  for (const domain of ['bebofix.com', 'bebonow.com', 'bototox.com', 'grainee.com']) {
    assert.equal(resolveRoute(`https://${domain}/`), null);
    const rootResponse = await worker.fetch(new Request(`https://${domain}/`));
    assert.equal(rootResponse.status, 404);

    const bridge = `https://${domain}/caesthetic/source-check`;
    assert.equal(resolveRoute(bridge).action, 'not_found');
    assert.equal(buildCanonicalTarget(bridge), null);
    const bridgeResponse = await worker.fetch(new Request(bridge));
    assert.equal(bridgeResponse.status, 404);
    assert.equal(bridgeResponse.headers.get('location'), null);
  }

  const unknown = await worker.fetch(new Request('https://example.com/caesthetic/'));
  assert.equal(unknown.status, 404);
  const post = await worker.fetch(new Request('https://caesthetic.co/', { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('deployment scripts use the fixed cleanup registry and preserve mail DNS', async () => {
  const deployer = await read('scripts/deploy-caesthetic-outreach-edge.py');
  const zoneConfig = await read('scripts/configure-caesthetic-outreach-dns.py');
  const wrapper = await read('scripts/cf-caesthetic-outreach-domain.sh');
  const wrangler = await read('infra/cloudflare/caesthetic-outreach/wrangler.toml');

  assert.match(deployer, /REGISTRY_PATH/);
  assert.match(deployer, /EXPECTED_ROUTE_BEHAVIOR/);
  assert.match(deployer, /grouped\.setdefault\(access\.account_id/);
  assert.match(deployer, /deploy Worker for account_domains/);
  assert.match(deployer, /incomplete sender-domain route cleanup/);
  assert.match(zoneConfig, /provision_web_dns/);
  assert.match(zoneConfig, /proxy_existing_web_record/);
  assert.match(zoneConfig, /MX, TXT, DKIM, DMARC/);
  assert.match(zoneConfig, /for pattern in row\["routes"\]/);
  assert.match(wrapper, /deploy-caesthetic-outreach-edge\.py/);
  assert.doesNotMatch(wrapper, /DOMAIN.*caesthetic\.co/);
  assert.doesNotMatch(wrangler, /\[\[routes\]\]/);
});

test('release workflow deploys and smokes route removal', async () => {
  const workflow = await read('.github/workflows/deploy-caesthetic.yml');
  const smoke = await read('scripts/caesthetic-outreach-domain-smoke.sh');

  assert.match(workflow, /sender-domain route cleanup/);
  assert.match(workflow, /node --test tests\/caesthetic\/outbound-domain-identity\.test\.mjs/);
  assert.match(workflow, /bash scripts\/cf-caesthetic-outreach-domain\.sh/);
  assert.match(workflow, /bash scripts\/caesthetic-outreach-domain-smoke\.sh/);
  assert.match(workflow, /outreach_removed_http=404/);
  assert.doesNotMatch(workflow, /outreach_identity_url=/);
  assert.match(smoke, /CAESTHETIC_OUTREACH_ROUTE_REMOVED_PASS=true http=404/);
  assert.match(smoke, /toxifillers\.com\/caesthetic\//);
});
