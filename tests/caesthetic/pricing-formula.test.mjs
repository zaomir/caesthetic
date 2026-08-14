import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { calculateGrowthEconomics } from '../../scripts/caesthetic/growth-economics-engine.mjs';
import { CAESTHETIC_PRICING } from '../../site-caesthetic/src/config/pricing.ts';

const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const publicPricingPath = resolve(
  repoRoot,
  'site-caesthetic/assets/js/caesthetic-pricing.generated.js',
);

function recurringInput(overrides = {}) {
  return {
    vertical: 'aesthetics',
    priceBook: {
      frozenAt: '2026-08-01',
      currency: 'USD',
      entries: [{ serviceCode: 'A', referencePrice: 500_000, standardVariableCost: 0 }],
    },
    treatments: [{
      id: 'a',
      serviceCode: 'A',
      status: 'completed',
      attributable: true,
      attributionClass: 'new_acquisition',
      attributionEvidence: 'crm:a',
      attributionTimestamp: '2026-08-01T00:00:00Z',
      attributionWindowDays: 30,
      completedAt: '2026-08-02T00:00:00Z',
    }],
    commercialSchedule: {
      currency: 'USD',
      committedGrowthBudget: 5_000,
      fixedManagementFee: 1_000,
      openingRollover: 250,
      clientTopUps: 500,
      approvedAdditionalWorkFees: 0,
      actualExternalGrowthSpend: 0,
    },
    performance: {
      mode: 'revenue_delta',
      legalStatus: 'approved',
      baselineRevenueMonths: [100_000, 100_000, 100_000],
      currentMeasuredMonthRevenue: 200_000,
      agreedPerformanceRate: 0.5,
    },
    ...overrides,
  };
}

test('public product pricing contains only free Growth Score and the finite $2,500 Sprint', () => {
  assert.deepEqual(CAESTHETIC_PRICING, {
    growthScoreUsd: 0,
    growthSprintUsd: 2_500,
  });
  assert.equal(Object.isFrozen(CAESTHETIC_PRICING), true);

  for (const legacyOrRecurringField of [
    'sprintExtensionUsd',
    'growthSystemBaseMonthlyUsd',
    'growthBudgetRate',
    'agcShareTarget',
    'performanceFeeRate',
    'performanceCapMultiplier',
  ]) {
    assert.equal(
      Object.hasOwn(CAESTHETIC_PRICING, legacyOrRecurringField),
      false,
      `${legacyOrRecurringField} must not be a reusable pricing default`,
    );
  }
});

test('generated public pricing artifact exposes no extension or recurring monetary defaults', () => {
  const source = readFileSync(publicPricingPath, 'utf8');
  const context = {};
  runInNewContext(source, context, { filename: publicPricingPath });
  const generated = JSON.parse(JSON.stringify(context.CAESTHETIC_PRICING));

  assert.deepEqual(generated, {
    growthScoreUsd: 0,
    growthScoreLabel: '$0',
    sprintPriceUsd: 2_500,
    sprintPriceLabel: '$2,500',
    recurringCommercialTerms: 'client_specific',
  });
  assert.equal(Object.isFrozen(context.CAESTHETIC_PRICING), true);

  for (const prohibitedField of [
    'sprintExtensionPriceUsd',
    'sprintExtensionPriceLabel',
    'growthSystemBaseMonthlyUsd',
    'growthBudgetRate',
    'agcShareTarget',
    'performanceFeeRate',
    'performanceCapMultiplier',
  ]) {
    assert.equal(Object.hasOwn(generated, prohibitedField), false);
    assert.doesNotMatch(source, new RegExp(`['\"]?${prohibitedField}['\"]?\\s*:`));
  }
});

test('client-specific recurring formula has no cap and never invoices from AGC', () => {
  const result = calculateGrowthEconomics(recurringInput());

  assert.equal(result.growthBudget.committedGrowthBudget, 5_000);
  assert.equal(result.growthBudget.fixedManagementFee, 1_000);
  assert.equal(result.attribution.agc, 500_000);
  assert.equal(result.attribution.invoiceBasis, false);
  assert.equal(result.performance.frozen3MonthAverageRevenue, 100_000);
  assert.equal(result.performance.positiveRevenueDelta, 100_000);
  assert.equal(result.performance.fee, 50_000);
  assert.ok(result.performance.fee > result.growthBudget.fixedManagementFee * 2);
  assert.equal(Object.hasOwn(result.performance, 'cap'), false);
  assert.equal(result.totalCommercialAmount, 55_500);
});

test('missing recurring schedule values and Performance Fee rate fail closed without defaults', () => {
  const missingSchedule = calculateGrowthEconomics(recurringInput({
    commercialSchedule: undefined,
  }));
  assert.equal(missingSchedule.growthBudget.status, 'insufficient_data');
  assert.equal(missingSchedule.totalCommercialAmount, null);

  const missingRateInput = recurringInput();
  delete missingRateInput.performance.agreedPerformanceRate;
  const missingRate = calculateGrowthEconomics(missingRateInput);
  assert.equal(missingRate.performance.status, 'insufficient_data');
  assert.deepEqual(missingRate.performance.missing, ['performance.agreedPerformanceRate']);
  assert.equal(missingRate.performance.fee, null);
  assert.equal(missingRate.totalCommercialAmount, 5_500);
});
