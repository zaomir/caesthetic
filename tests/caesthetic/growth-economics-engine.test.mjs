import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateGrowthEconomics } from '../../scripts/caesthetic/growth-economics-engine.mjs';
import {
  adaptAestheticsEconomics,
  adaptDentalEconomics,
} from '../../scripts/caesthetic/growth-economics-adapters.mjs';

function treatment(overrides = {}) {
  return {
    id: 'event-1',
    serviceCode: 'SERVICE-A',
    status: 'completed',
    attributable: true,
    attributionClass: 'new_acquisition',
    attributionEvidence: 'crm:event-1',
    attributionTimestamp: '2026-08-01T00:00:00Z',
    attributionWindowDays: 30,
    completedAt: '2026-08-05T00:00:00Z',
    paymentMethod: 'card',
    discountPercent: 0,
    refundAmount: 0,
    chargebackAmount: 0,
    ...overrides,
  };
}

function commercialSchedule(overrides = {}) {
  return {
    currency: 'USD',
    committedGrowthBudget: 10_000,
    fixedManagementFee: 2_000,
    openingRollover: 1_000,
    clientTopUps: 500,
    approvedAdditionalWorkFees: 750,
    actualExternalGrowthSpend: 3_000,
    ...overrides,
  };
}

function approvedPerformance(overrides = {}) {
  return {
    mode: 'revenue_delta',
    scheduleStatus: 'signed',
    baselineRevenueMonths: [90_000, 100_000, 110_000],
    currentMeasuredMonthRevenue: 130_000,
    agreedPerformanceRate: 0.2,
    ...overrides,
  };
}

function input(overrides = {}) {
  return {
    vertical: 'aesthetics',
    priceBook: {
      frozenAt: '2026-08-01',
      currency: 'USD',
      entries: [{ serviceCode: 'SERVICE-A', referencePrice: 1_000, standardVariableCost: 200 }],
    },
    treatments: [treatment()],
    measurement: { refundsReduceAgc: true },
    commercialSchedule: commercialSchedule(),
    performance: { mode: 'disabled' },
    ...overrides,
  };
}

test('AGV and AGC remain operational analytics and never become an invoice basis', () => {
  const result = calculateGrowthEconomics(input({
    treatments: [
      treatment({ id: 'a', discountPercent: 0, paymentMethod: 'card' }),
      treatment({ id: 'b', discountPercent: 50, paymentMethod: 'cash' }),
      treatment({ id: 'c', discountPercent: 100, paymentMethod: 'financing' }),
    ],
  }));

  assert.equal(result.attribution.agv, 3_000);
  assert.equal(result.attribution.agc, 2_400);
  assert.equal(result.attribution.invoiceBasis, false);
  assert.equal(result.operationalAnalytics, result.attribution);
  assert.match(result.disclosures.observed, /operational analytics only/i);
  assert.equal(result.performance.status, 'not_activated');
  assert.equal(result.performance.fee, null);
});

test('operational attribution excludes non-qualifying, duplicate and unsupported events', () => {
  const result = calculateGrowthEconomics(input({
    treatments: [
      treatment({ id: 'cancelled', status: 'cancelled' }),
      treatment({ id: 'no-show', status: 'no_show' }),
      treatment({ id: 'consultation', status: 'consultation_only' }),
      treatment({ id: 'goodwill', excludedReason: 'staff_family_internal_goodwill' }),
      treatment({ id: 'expired', attributionWindowDays: 2 }),
      treatment({ id: 'missing-evidence', attributionEvidence: '' }),
      treatment({ id: 'valid' }),
      treatment({ id: 'valid', discountPercent: 100 }),
    ],
  }));

  assert.equal(result.attribution.agv, 1_000);
  assert.equal(result.attribution.qualifyingTreatmentCount, 1);
  assert.equal(result.attribution.excludedTreatmentCount, 6);
  assert.equal(result.attribution.duplicateTreatmentCount, 1);
});

test('refund and chargeback treatment follows the Measurement Schedule and AGC floors at zero', () => {
  const included = calculateGrowthEconomics(input({
    treatments: [treatment({ refundAmount: 700, chargebackAmount: 500 })],
  }));
  assert.equal(included.attribution.agc, 0);

  const excluded = calculateGrowthEconomics(input({
    measurement: { refundsReduceAgc: false },
    treatments: [treatment({ refundAmount: 700, chargebackAmount: 500 })],
  }));
  assert.equal(excluded.attribution.agc, 800);
});

test('the frozen price-book snapshot controls operational AGV, not the collected amount', () => {
  const result = calculateGrowthEconomics(input({
    treatments: [treatment({ actualCollected: 1, discountPercent: 100 })],
  }));

  assert.equal(result.attribution.agv, 1_000);
  assert.equal(result.attribution.agc, 800);
});

test('Fixed Management Fee is a visible client-specific line inside the Committed Growth Budget', () => {
  const result = calculateGrowthEconomics(input());

  assert.equal(result.growthBudget.status, 'complete');
  assert.equal(result.growthBudget.committedGrowthBudget, 10_000);
  assert.equal(result.growthBudget.fixedManagementFee, 2_000);
  assert.equal(result.growthBudget.variableGrowthBudget, 8_000);
  assert.equal(result.growthBudget.openingRollover, 1_000);
  assert.equal(result.growthBudget.clientTopUps, 500);
  assert.equal(result.growthBudget.periodFunding, 11_500);
  assert.equal(result.growthBudget.closingUnspentGrowthBalance, 5_750);
  assert.equal(result.growthBudget.carryOut, 5_750);
  assert.equal(result.totalCommercialAmount, 10_500);
  assert.equal(Object.hasOwn(result.growthBudget, 'baseCaestheticFee'), false);
  assert.equal(Object.hasOwn(result.growthBudget, 'totalGrowthAllocationLow'), false);
  assert.match(result.disclosures.allocation, /Fixed Management Fee is a visible line inside/i);
});

test('top-ups increase period funding and Additional Work Fees are counted exactly once', () => {
  const withoutTopUp = calculateGrowthEconomics(input({
    commercialSchedule: commercialSchedule({ clientTopUps: 0 }),
  }));
  const withTopUp = calculateGrowthEconomics(input());

  assert.equal(withoutTopUp.growthBudget.periodFunding, 11_000);
  assert.equal(withoutTopUp.growthBudget.carryOut, 5_250);
  assert.equal(withTopUp.growthBudget.periodFunding, 11_500);
  assert.equal(withTopUp.growthBudget.carryOut, 5_750);
  assert.equal(withTopUp.totalCommercialAmount, 10_500);
  assert.equal(
    withTopUp.growthBudget.periodFunding
      - withTopUp.growthBudget.fixedManagementFee
      - withTopUp.growthBudget.approvedAdditionalWorkFees
      - withTopUp.growthBudget.actualExternalGrowthSpend,
    withTopUp.growthBudget.carryOut,
  );
});

test('Fixed Management Fee cannot exceed the client-specific Committed Growth Budget', () => {
  const result = calculateGrowthEconomics(input({
    commercialSchedule: commercialSchedule({
      committedGrowthBudget: 1_000,
      fixedManagementFee: 1_500,
      openingRollover: 1_000,
      clientTopUps: 1_000,
      approvedAdditionalWorkFees: 0,
      actualExternalGrowthSpend: 0,
    }),
  }));

  assert.equal(result.growthBudget.status, 'invalid');
  assert.equal(result.growthBudget.reason, 'fixed_management_fee_exceeds_committed_growth_budget');
  assert.equal(result.growthBudget.carryOut, null);
  assert.equal(result.totalCommercialAmount, null);
});

test('Growth Budget cannot go negative and requires a top-up or reprioritization', () => {
  const result = calculateGrowthEconomics(input({
    commercialSchedule: commercialSchedule({
      committedGrowthBudget: 3_000,
      fixedManagementFee: 2_000,
      openingRollover: 0,
      clientTopUps: 0,
      approvedAdditionalWorkFees: 500,
      actualExternalGrowthSpend: 1_001,
    }),
  }));

  assert.equal(result.status, 'invalid');
  assert.equal(result.growthBudget.status, 'invalid');
  assert.equal(result.growthBudget.reason, 'growth_budget_would_go_negative');
  assert.equal(result.growthBudget.closingUnspentGrowthBalance, null);
  assert.equal(result.growthBudget.carryOut, null);
  assert.equal(result.totalCommercialAmount, null);
  assert.match(result.warnings.join('\n'), /may not go negative/i);
});

test('missing or invalid Commercial Schedule data never falls back to reusable defaults', () => {
  const missing = calculateGrowthEconomics(input({ commercialSchedule: undefined }));
  assert.equal(missing.status, 'insufficient_data');
  assert.equal(missing.growthBudget.status, 'insufficient_data');
  assert.deepEqual(missing.growthBudget.missing, ['commercialSchedule']);
  for (const field of [
    'committedGrowthBudget',
    'fixedManagementFee',
    'variableGrowthBudget',
    'periodFunding',
    'carryOut',
  ]) assert.equal(missing.growthBudget[field], null, `${field} must fail closed`);

  const invalid = calculateGrowthEconomics(input({
    commercialSchedule: commercialSchedule({ clientTopUps: -1 }),
  }));
  assert.equal(invalid.growthBudget.status, 'insufficient_data');
  assert.ok(invalid.growthBudget.missing.includes('commercialSchedule.clientTopUps'));
  assert.equal(invalid.totalCommercialAmount, null);
});

test('standard Performance Fee uses the frozen three-month revenue average and client-specific rate', () => {
  const result = calculateGrowthEconomics(input({ performance: approvedPerformance() }));

  assert.equal(result.performance.status, 'complete');
  assert.equal(result.performance.mode, 'revenue_delta');
  assert.equal(result.performance.frozen3MonthAverageRevenue, 100_000);
  assert.equal(result.performance.currentMeasuredMonthRevenue, 130_000);
  assert.equal(result.performance.positiveRevenueDelta, 30_000);
  assert.equal(result.performance.agreedPerformanceRate, 0.2);
  assert.equal(result.performance.fee, 6_000);
  assert.equal(result.performance.placement, 'above_growth_budget');
  assert.equal(result.totalCommercialAmount, 16_500);
  assert.equal(Object.hasOwn(result.performance, 'cap'), false);
  assert.equal(Object.hasOwn(result.performance, 'capMultiplier'), false);
});

test('equal or lower measured revenue produces zero Performance Fee without negative carryforward', () => {
  for (const currentMeasuredMonthRevenue of [100_000, 80_000]) {
    const result = calculateGrowthEconomics(input({
      performance: approvedPerformance({ currentMeasuredMonthRevenue }),
    }));

    assert.equal(result.performance.status, 'complete');
    assert.equal(result.performance.positiveRevenueDelta, 0);
    assert.equal(result.performance.fee, 0);
    assert.equal(result.totalCommercialAmount, 10_500);
    assert.equal(Object.hasOwn(result.performance, 'negativeCarryforward'), false);
  }
});

test('Performance Fee requires a signed client-specific schedule without a healthcare legal gate', () => {
  for (const scheduleStatus of ['draft', 'disabled', undefined]) {
    const result = calculateGrowthEconomics(input({
      performance: approvedPerformance({ scheduleStatus }),
    }));

    assert.equal(result.performance.status, 'not_activated');
    assert.equal(result.performance.reason, 'signed_performance_schedule_required');
    assert.equal(result.performance.fee, null);
    assert.equal(result.growthBudget.status, 'complete');
    assert.equal(result.growthBudget.carryOut, 5_750);
    assert.equal(result.totalCommercialAmount, 10_500);
  }
});

test('legacy healthcare legal-status fields do not block a signed Performance Fee schedule', () => {
  for (const legalStatus of ['pending', 'disabled', undefined]) {
    const result = calculateGrowthEconomics(input({
      performance: approvedPerformance({ legalStatus }),
    }));

    assert.equal(result.performance.status, 'complete');
    assert.equal(result.performance.scheduleStatus, 'signed');
    assert.equal(result.performance.fee, 6_000);
  }
});

test('missing baseline, measured revenue or agreed rate is insufficient data, never a default', () => {
  const cases = [
    approvedPerformance({ baselineRevenueMonths: [90_000, 100_000] }),
    approvedPerformance({ currentMeasuredMonthRevenue: undefined }),
    approvedPerformance({ agreedPerformanceRate: undefined }),
  ];

  for (const performance of cases) {
    const result = calculateGrowthEconomics(input({ performance }));
    assert.equal(result.performance.status, 'insufficient_data');
    assert.equal(result.performance.fee, null);
    assert.ok(result.performance.missing.length > 0);
    assert.equal(Object.hasOwn(result.performance, 'cap'), false);
    assert.equal(result.totalCommercialAmount, 10_500);
  }
});

test('legacy AGC-share and fixed-milestone modes cannot become invoice calculations', () => {
  for (const performance of [
    { mode: 'agc_share', scheduleStatus: 'signed', agreedPerformanceRate: 0.9 },
    { mode: 'fixed_milestones', scheduleStatus: 'signed', milestones: [{ fixedBonus: 9_999 }] },
  ]) {
    const result = calculateGrowthEconomics(input({ performance }));
    assert.equal(result.performance.status, 'not_activated');
    assert.equal(result.performance.reason, 'unsupported_or_missing_performance_mode');
    assert.equal(result.performance.fee, null);
    assert.equal(Object.hasOwn(result.performance, 'safeFallback'), false);
    assert.equal(Object.hasOwn(result.performance, 'cap'), false);
  }
});

test('Performance Fee is not capped by Fixed Management Fee and ignores operational AGC', () => {
  const result = calculateGrowthEconomics(input({
    priceBook: {
      frozenAt: '2026-08-01',
      currency: 'USD',
      entries: [{ serviceCode: 'SERVICE-A', referencePrice: 500_000, standardVariableCost: 0 }],
    },
    commercialSchedule: commercialSchedule({ fixedManagementFee: 1_000 }),
    performance: approvedPerformance({
      baselineRevenueMonths: [100_000, 100_000, 100_000],
      currentMeasuredMonthRevenue: 200_000,
      agreedPerformanceRate: 0.5,
    }),
  }));

  assert.equal(result.attribution.agc, 500_000);
  assert.equal(result.attribution.invoiceBasis, false);
  assert.equal(result.performance.fee, 50_000);
  assert.ok(result.performance.fee > result.growthBudget.fixedManagementFee * 2);
  assert.equal(Object.hasOwn(result.performance, 'cap'), false);
});

test('aesthetics and dental adapters preserve the same client schedule and neutral economics', () => {
  const shared = {
    commercialSchedule: commercialSchedule(),
    performance: approvedPerformance(),
    measurement: { refundsReduceAgc: true },
  };
  const event = {
    status: 'completed',
    attributable: true,
    attributionClass: 'reactivation',
    attributionEvidence: 'crm:1',
    attributionTimestamp: '2026-08-01T00:00:00Z',
    attributionWindowDays: 30,
    completedAt: '2026-08-05T00:00:00Z',
    paymentMethod: 'cash',
    refundAmount: 0,
    chargebackAmount: 0,
  };

  const aesthetics = calculateGrowthEconomics(adaptAestheticsEconomics({
    ...shared,
    priceBook: {
      frozenAt: '2026-08-01',
      currency: 'USD',
      entries: [{
        treatmentCode: 'A',
        referenceTreatmentPrice: 1_000,
        drugMaterialCost: 150,
        variableProviderComp: 50,
      }],
    },
    completedTreatments: [{ ...event, treatmentId: 'a1', treatmentCode: 'A' }],
  }));
  const dental = calculateGrowthEconomics(adaptDentalEconomics({
    ...shared,
    priceBook: {
      frozenAt: '2026-08-01',
      currency: 'USD',
      entries: [{
        procedureCode: 'D',
        referenceProductionFee: 1_000,
        labMaterialCost: 150,
        variableProviderComp: 50,
      }],
    },
    completedProcedures: [{ ...event, procedureId: 'd1', procedureCode: 'D' }],
  }));

  assert.deepEqual(aesthetics.attribution, dental.attribution);
  assert.deepEqual(aesthetics.growthBudget, dental.growthBudget);
  assert.deepEqual(aesthetics.performance, dental.performance);
  assert.equal(aesthetics.totalCommercialAmount, dental.totalCommercialAmount);
  assert.equal(aesthetics.totalCommercialAmount, 16_500);
});
