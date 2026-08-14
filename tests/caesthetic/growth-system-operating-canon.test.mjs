import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const master = readFileSync(resolve(REPO, 'docs/ssot/CAESTHETIC.md'), 'utf8');
const operating = readFileSync(
  resolve(REPO, 'docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md'),
  'utf8',
);
const economics = readFileSync(
  resolve(REPO, 'docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md'),
  'utf8',
);
const retrospective = readFileSync(
  resolve(REPO, 'docs/ssot/EXPERT_DENTAL_MONTH_1_RETROSPECTIVE.md'),
  'utf8',
);

test('Growth System economics v2.1 puts client-specific management inside the Growth Budget', () => {
  assert.match(master, /client-specific Fixed Management Fee inside the Growth Budget buys recurring operating ownership/i);
  assert.match(master, /not a bank of hours or a fixed quota/i);
  assert.match(master, /at least one active optimization cycle per month/i);
  assert.match(master, /Excluded from the fixed management scope are ad spend/i);
  assert.match(master, /Committed Growth Budget = Fixed Management Fee \+ Variable Growth Budget/i);
  assert.match(master, /Unused variable funds remain the client's growth funds/i);
  assert.match(master, /Performance Fee is client-specific, earned separately above the Growth Budget/i);
  assert.match(operating, /Fixed Management Fee is a separately visible line inside the Growth Budget/i);
  assert.match(operating, /They route to the Variable Growth Budget, an add-on\/SOW/i);
  assert.match(economics, /former reusable construction `base fee \+ Growth Budget` is superseded/i);
  assert.match(economics, /No reusable dollar amount, percentage, cap or negotiation floor exists/i);
  assert.match(economics, /may not use reusable Fixed Management Fee, Growth Budget rate, Performance Fee rate or cap defaults/i);
  assert.doesNotMatch(master + operating + economics, /\$1,500(?:\/month)?|Total Growth Allocation|AGC share|\b10\s*%/i);
});

test('Client Growth Statement remains verified, short and result oriented', () => {
  assert.match(operating, /short, mobile-first, owner-facing monthly surface/i);
  assert.match(operating, /What became better in the practice during the last 30 days/i);
  assert.match(operating, /Shipped → Adopted → Impact → Maturing/);
  assert.match(operating, /AI may not:[\s\S]*invent, interpolate/i);
  assert.match(operating, /Publication requires that human's approval/i);
});

test('Growth Ledger architecture and vendor gates do not authorize runtime', () => {
  assert.match(operating, /Supabase is the preferred source-of-truth/i);
  assert.match(operating, /n8n.*optional integration\/orchestration layer/is);
  assert.match(operating, /PostHog.*privacy and compliance review/is);
  assert.match(operating, /Session replay for healthcare-sensitive journeys is off by default/i);
  assert.match(operating, /does \*\*not\*\* authorize a new runtime service/i);
});

test('Client Request Router preserves four classes and internal-only add-on grid', () => {
  for (const serviceClass of [
    'Included Optimization',
    'Growth Budget Cost',
    'Growth Add-on',
    'Practice Operations Add-on',
  ]) {
    assert.ok(operating.includes(serviceClass), `missing request class ${serviceClass}`);
  }
  assert.match(operating, /Price = max\(Module Floor, Direct Delivery Cost \/ \(1 - Target Gross Margin\)\)/);
  assert.match(operating, /Small \| \$500–900/);
  assert.match(operating, /not public pricing/i);
  assert.match(operating, /site-caesthetic\/src\/config\/pricing\.ts/);
});

test('Expert Dental lessons are future-facing and preserve the historical plan', () => {
  assert.match(retrospective, /does not add, remove, merge, reinterpret or retroactively reprice/i);
  assert.match(retrospective, /3–6 Category A main constraints/i);
  assert.match(retrospective, /1–5 Category B processes/i);
  assert.match(retrospective, /solid line to clinic \/ dotted operational line to CAESTHETIC Patient Operations/i);
  assert.match(retrospective, /non-clinical concierge\/service fee/i);
});
