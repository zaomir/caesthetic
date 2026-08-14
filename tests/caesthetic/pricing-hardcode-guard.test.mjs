import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const EXCLUDED_DIRS = new Set(['private', '_handoff', 'node_modules']);
const SCANNED_EXTENSIONS = /\.(?:html|js|mjs|json|ts)$/i;
const ALLOWED_PRICING_FILES = new Set([
  'src/config/pricing.ts',
  'assets/js/caesthetic-pricing.generated.js',
]);
const PUBLIC_PRICING_KEYS = [
  'growthScoreLabel',
  'growthScoreUsd',
  'recurringCommercialTerms',
  'sprintPriceLabel',
  'sprintPriceUsd',
];
const FEE_LITERAL = /\$\s*(?:1[, \u00a0]?500|2[, \u00a0]?500|3[, \u00a0]?000)\b/g;

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (EXCLUDED_DIRS.has(entry)) continue;
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (SCANNED_EXTENSIONS.test(entry)) files.push(path);
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

test('commercial amounts live only in pricing SSOT/generated artifact or verified HTML snapshots', () => {
  const sandbox = {};
  runInNewContext(readFileSync(resolve(SITE, 'assets/js/caesthetic-pricing.generated.js'), 'utf8'), sandbox);
  const allowedHtml = new Set([
    `<span data-cae-score-price>${sandbox.CAESTHETIC_PRICING.growthScoreLabel}</span>`,
    `<span data-cae-sprint-price>${sandbox.CAESTHETIC_PRICING.sprintPriceLabel}</span>`,
  ]);
  const violations = [];

  for (const path of walk(SITE)) {
    const siteRelative = relative(SITE, path).replaceAll('\\', '/');
    if (ALLOWED_PRICING_FILES.has(siteRelative)) continue;
    let source = readFileSync(path, 'utf8');
    for (const snapshot of allowedHtml) source = source.replaceAll(snapshot, '');
    for (const match of source.matchAll(FEE_LITERAL)) {
      violations.push(`${siteRelative}:${lineNumber(source, match.index)} fee ${JSON.stringify(match[0])}`);
    }
  }

  assert.deepEqual(violations, [], `Hardcoded CAESTHETIC pricing outside verified outputs:\n${violations.join('\n')}`);
});

test('generated pricing exposes finite products plus a client-specific recurring marker only', () => {
  const source = readFileSync(resolve(SITE, 'assets/js/caesthetic-pricing.generated.js'), 'utf8');
  const sandbox = {};
  runInNewContext(source, sandbox);

  assert.deepEqual(Object.keys(sandbox.CAESTHETIC_PRICING).sort(), PUBLIC_PRICING_KEYS);
  assert.equal(sandbox.CAESTHETIC_PRICING.recurringCommercialTerms, 'client_specific');
  assert.doesNotMatch(
    source,
    /sprintExtensionPrice|growthSystemBaseMonthly|agcShareTarget|performanceCapMultiplier/,
  );
});

test('browser config consumes the generated pricing object', () => {
  const source = readFileSync(resolve(SITE, 'assets/js/caesthetic-config.js'), 'utf8');
  assert.match(source, /CAESTHETIC_PRICING/);
  assert.doesNotMatch(source, /sprintPriceUsd:\s*2500/);
  assert.doesNotMatch(
    source,
    /sprintExtensionPrice|growthSystemBaseMonthly|agcShareTarget|performanceCapMultiplier|stripeCheckoutUrl/,
  );
});
