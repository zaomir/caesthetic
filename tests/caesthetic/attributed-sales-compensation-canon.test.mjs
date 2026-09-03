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
const master = read('docs/ssot/CAESTHETIC.md');
const manifest = read('agents/manifests/caesthetic.yaml');

for (const text of [decision, standard]) {
  assert.match(text, /Attributed Sales Performance Fee/);
  assert.match(text, /NetCollectedAttributedSales|Net Collected Attributed Sales/);
  assert.match(text, /sourced|прив[её]л|реактивировал/i);
  assert.match(text, /refund|chargeback/i);
  assert.match(text, /attribution window/i);
  assert.match(text, /source marker|source was fixed|источник зафиксирован/i);
  assert.match(text, /dedup/i);
  assert.match(text, /bilateral reconciliation|двусторонн/i);
  assert.match(text, /no double|двойн/i);
}

assert.match(
  standard,
  /CAESTHETIC может получать согласованный процент от продаж клиентам/i,
);
assert.match(master, /Attributed Sales Performance Fee/);
assert.match(
  standard,
  /medical_attributed_sales_fee_status\s*=\s*COMMERCIAL_SCHEDULE_AND_ATTRIBUTION_GATED/i,
);
assert.match(standard, /current_payable_rate\s*=\s*CONTRACT_DEFINED/i);
assert.match(standard, /Coordinator medical sales percentage\s*=\s*0%/i);
assert.match(standard, /Clinician medical sales percentage\s*=\s*0%/i);
assert.match(master, /medical and dental sales use the ordinary activation path/i);
assert.match(master, /Coordinator medical sales percentage and clinician referral\/sales percentage remain `0%`/i);
assert.doesNotMatch(master, /CAESTHETIC\/coordinator treatment revenue share is `0%`/i);
assert.match(decision, /DEC-862/);
assert.match(decision, /0%.*переста[её]т быть запретом или специальным activation state/is);
assert.match(
  manifest,
  /attributed_sales_compensation:\s+docs\/ssot\/CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_STANDARD\.md/,
);
assert.match(
  manifest,
  /Medical and dental attributed-sales fees use the ordinary signed Commercial Schedule and attribution rules without special legal\/fiscal\/advertising\/privacy\/fee-splitting activation gates/,
);
for (const text of [decision, standard, master, manifest]) {
  assert.doesNotMatch(text, /LEGAL_FISCAL_ACTIVATION_GATED|LEGAL_FISCAL_ADVERTISING_PRIVACY_FEE_SPLITTING_GATED/i);
  assert.doesNotMatch(text, /current payable rate (?:is|=) `?0% \/ NOT ACTIVE|0% until all applicable gates close/i);
}

console.log('CAESTHETIC_ATTRIBUTED_SALES_COMPENSATION_CANON_PASS');
