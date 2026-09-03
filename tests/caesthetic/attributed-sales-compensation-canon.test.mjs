#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const decision = read(
  'docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md',
);
const standard = read(
  'docs/ssot/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD.md',
);
const manifest = read('agents/manifests/caesthetic.yaml');

for (const text of [decision, standard]) {
  assert.match(text, /Attributed Sales Performance Fee/);
  assert.match(text, /NetCollectedAttributedSales|Net Collected Attributed Sales/);
  assert.match(text, /sourced|прив[её]л|реактивировал/i);
  assert.match(text, /refund|chargeback/i);
  assert.match(text, /attribution window/i);
  assert.match(text, /no double|двойн/i);
}

assert.match(
  standard,
  /CAESTHETIC может получать согласованный процент от продаж клиентам/i,
);
assert.match(
  standard,
  /medical_attributed_sales_fee_status\s*=\s*LEGAL_FISCAL_ACTIVATION_GATED/i,
);
assert.match(standard, /current_payable_rate\s*=\s*0%/i);
assert.match(standard, /Coordinator medical sales percentage\s*=\s*0%/i);
assert.match(standard, /Clinician medical sales percentage\s*=\s*0%/i);
assert.match(decision, /DEC-862/);
assert.match(decision, /0%.*текущим fail-closed activation state/is);
assert.match(
  manifest,
  /attributed_sales_compensation:\s+docs\/ssot\/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD\.md/,
);
assert.match(
  manifest,
  /Healthcare attributed-sales fees remain jurisdiction\/legal\/fiscal\/contract gated/,
);

console.log('CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_CANON_PASS');
