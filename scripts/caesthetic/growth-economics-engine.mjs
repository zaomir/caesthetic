/**
 * CAESTHETIC Growth Economics Engine v2.2.
 *
 * Pure, vertical-neutral calculations. Recurring commercial inputs come only
 * from a client-specific Commercial Schedule. There are no reusable fee,
 * budget-rate, Performance Fee rate or cap defaults.
 */

export const ATTRIBUTION_CLASSES = Object.freeze([
  'new_acquisition',
  'reactivation',
  'lead_recovery',
  'expansion',
]);

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const nonNegative = (value) => isFiniteNumber(value) && value >= 0;
const positive = (value) => isFiniteNumber(value) && value > 0;
const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

function buildPriceBook(priceBook, missing, warnings) {
  if (!priceBook || !priceBook.frozenAt || !Array.isArray(priceBook.entries)) {
    missing.push('priceBook.frozenAt', 'priceBook.entries');
    return null;
  }

  const byCode = new Map();
  for (const entry of priceBook.entries) {
    if (!entry?.serviceCode || !nonNegative(entry.referencePrice) || !nonNegative(entry.standardVariableCost)) {
      warnings.push(`Invalid price-book entry ignored: ${entry?.serviceCode || 'unknown'}`);
      continue;
    }
    if (byCode.has(entry.serviceCode)) {
      warnings.push(`Duplicate price-book serviceCode ignored: ${entry.serviceCode}`);
      continue;
    }
    byCode.set(entry.serviceCode, entry);
  }
  if (byCode.size === 0) missing.push('priceBook.validEntries');
  return byCode;
}

function calculateOperationalAttribution(input, missing, warnings) {
  const priceBook = buildPriceBook(input.priceBook, missing, warnings);
  if (!Array.isArray(input.treatments)) {
    missing.push('treatments');
    return {
      status: 'insufficient_data',
      invoiceBasis: false,
      agv: null,
      agc: null,
      standardVariableCosts: null,
      refundsAndChargebacks: null,
      qualifyingTreatmentCount: 0,
      excludedTreatmentCount: 0,
      duplicateTreatmentCount: 0,
    };
  }

  let agv = 0;
  let variableCosts = 0;
  let refundsAndChargebacks = 0;
  let qualifyingTreatmentCount = 0;
  let excludedTreatmentCount = 0;
  let duplicateTreatmentCount = 0;
  const seen = new Set();
  const refundsReduceAgc = input.measurement?.refundsReduceAgc !== false;

  for (const treatment of input.treatments) {
    if (!treatment?.id) {
      excludedTreatmentCount += 1;
      warnings.push('Treatment without id excluded');
      continue;
    }
    if (seen.has(treatment.id)) {
      duplicateTreatmentCount += 1;
      warnings.push(`Duplicate treatment id excluded: ${treatment.id}`);
      continue;
    }
    seen.add(treatment.id);

    const attributionAt = Date.parse(treatment.attributionTimestamp);
    const completedAt = Date.parse(treatment.completedAt);
    const withinWindow = positive(treatment.attributionWindowDays)
      && Number.isFinite(attributionAt)
      && Number.isFinite(completedAt)
      && completedAt >= attributionAt
      && completedAt - attributionAt <= treatment.attributionWindowDays * 86_400_000;
    const qualifying = treatment.status === 'completed'
      && treatment.attributable === true
      && ATTRIBUTION_CLASSES.includes(treatment.attributionClass)
      && typeof treatment.attributionEvidence === 'string'
      && treatment.attributionEvidence.trim() !== ''
      && withinWindow
      && !treatment.excludedReason;

    if (!qualifying) {
      excludedTreatmentCount += 1;
      continue;
    }

    const price = priceBook?.get(treatment.serviceCode);
    if (!price) {
      excludedTreatmentCount += 1;
      warnings.push(`No frozen reference price for ${treatment.serviceCode || 'unknown service'}`);
      continue;
    }

    qualifyingTreatmentCount += 1;
    agv += price.referencePrice;
    variableCosts += price.standardVariableCost;
    if (refundsReduceAgc) {
      refundsAndChargebacks += nonNegative(treatment.refundAmount) ? treatment.refundAmount : 0;
      refundsAndChargebacks += nonNegative(treatment.chargebackAmount) ? treatment.chargebackAmount : 0;
    }
  }

  if (missing.some((field) => field.startsWith('priceBook'))) {
    return {
      status: 'insufficient_data',
      invoiceBasis: false,
      agv: null,
      agc: null,
      standardVariableCosts: null,
      refundsAndChargebacks: null,
      qualifyingTreatmentCount,
      excludedTreatmentCount,
      duplicateTreatmentCount,
    };
  }

  return {
    status: 'complete',
    invoiceBasis: false,
    agv: money(agv),
    agc: money(Math.max(0, agv - variableCosts - refundsAndChargebacks)),
    standardVariableCosts: money(variableCosts),
    refundsAndChargebacks: money(refundsAndChargebacks),
    qualifyingTreatmentCount,
    excludedTreatmentCount,
    duplicateTreatmentCount,
    method: 'Operational analytics only: frozen reference price across qualifying completed attributable services, less agreed variable costs and attributable refunds/chargebacks.',
  };
}

function calculateGrowthBudget(schedule, missing, warnings) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    missing.push('commercialSchedule');
    return {
      status: 'insufficient_data',
      committedGrowthBudget: null,
      fixedManagementFee: null,
      variableGrowthBudget: null,
      periodFunding: null,
      closingUnspentGrowthBalance: null,
      carryOut: null,
      missing: ['commercialSchedule'],
    };
  }

  const required = ['committedGrowthBudget', 'fixedManagementFee'];
  for (const field of required) {
    if (!nonNegative(schedule[field])) missing.push(`commercialSchedule.${field}`);
  }
  const optional = ['openingRollover', 'clientTopUps', 'approvedAdditionalWorkFees', 'actualExternalGrowthSpend'];
  for (const field of optional) {
    if (schedule[field] !== undefined && !nonNegative(schedule[field])) {
      missing.push(`commercialSchedule.${field}`);
    }
  }
  const scheduleMissing = missing.filter((field) => field.startsWith('commercialSchedule'));
  if (scheduleMissing.length > 0) {
    return {
      status: 'insufficient_data',
      committedGrowthBudget: null,
      fixedManagementFee: null,
      variableGrowthBudget: null,
      periodFunding: null,
      closingUnspentGrowthBalance: null,
      carryOut: null,
      missing: scheduleMissing,
    };
  }

  const committedGrowthBudget = money(schedule.committedGrowthBudget);
  const fixedManagementFee = money(schedule.fixedManagementFee);
  const openingRollover = money(schedule.openingRollover || 0);
  const clientTopUps = money(schedule.clientTopUps || 0);
  const approvedAdditionalWorkFees = money(schedule.approvedAdditionalWorkFees || 0);
  const actualExternalGrowthSpend = money(schedule.actualExternalGrowthSpend || 0);
  if (fixedManagementFee > committedGrowthBudget) {
    warnings.push('Fixed Management Fee must fit inside the signed Committed Growth Budget');
    return {
      status: 'invalid',
      reason: 'fixed_management_fee_exceeds_committed_growth_budget',
      committedGrowthBudget,
      fixedManagementFee,
      variableGrowthBudget: null,
      openingRollover,
      clientTopUps,
      approvedAdditionalWorkFees,
      actualExternalGrowthSpend,
      periodFunding: money(openingRollover + committedGrowthBudget + clientTopUps),
      closingUnspentGrowthBalance: null,
      carryOut: null,
      missing: [],
    };
  }

  const periodFunding = money(openingRollover + committedGrowthBudget + clientTopUps);
  const closing = money(
    periodFunding
      - fixedManagementFee
      - approvedAdditionalWorkFees
      - actualExternalGrowthSpend,
  );
  if (closing < 0) {
    warnings.push('Growth Budget may not go negative; top-up or reprioritization required');
    return {
      status: 'invalid',
      reason: 'growth_budget_would_go_negative',
      committedGrowthBudget,
      fixedManagementFee,
      variableGrowthBudget: money(Math.max(0, committedGrowthBudget - fixedManagementFee)),
      openingRollover,
      clientTopUps,
      approvedAdditionalWorkFees,
      actualExternalGrowthSpend,
      periodFunding,
      closingUnspentGrowthBalance: null,
      carryOut: null,
      missing: [],
    };
  }

  return {
    status: 'complete',
    committedGrowthBudget,
    fixedManagementFee,
    variableGrowthBudget: money(Math.max(0, committedGrowthBudget - fixedManagementFee)),
    openingRollover,
    clientTopUps,
    approvedAdditionalWorkFees,
    actualExternalGrowthSpend,
    periodFunding,
    closingUnspentGrowthBalance: closing,
    carryOut: money(Math.max(0, closing)),
    missing: [],
    method: 'Period funding equals opening rollover plus committed Growth Budget plus client top-ups; the reconciled unused balance rolls forward.',
  };
}

function calculatePerformance(performance, warnings) {
  if (!performance || performance.mode === 'disabled') {
    return {
      status: 'not_activated',
      mode: 'disabled',
      placement: 'above_growth_budget',
      fee: null,
      reason: 'signed_performance_schedule_required',
    };
  }
  if (performance.mode !== 'revenue_delta') {
    return {
      status: 'not_activated',
      mode: performance.mode || 'unspecified',
      placement: 'above_growth_budget',
      fee: null,
      reason: 'unsupported_or_missing_performance_mode',
    };
  }
  if (performance.scheduleStatus !== 'signed') {
    return {
      status: 'not_activated',
      mode: 'revenue_delta',
      placement: 'above_growth_budget',
      fee: null,
      reason: 'signed_performance_schedule_required',
    };
  }

  const missing = [];
  if (!Array.isArray(performance.baselineRevenueMonths) || performance.baselineRevenueMonths.length !== 3
      || performance.baselineRevenueMonths.some((value) => !nonNegative(value))) {
    missing.push('performance.baselineRevenueMonths[3]');
  }
  if (!nonNegative(performance.currentMeasuredMonthRevenue)) {
    missing.push('performance.currentMeasuredMonthRevenue');
  }
  if (!positive(performance.agreedPerformanceRate) || performance.agreedPerformanceRate >= 1) {
    missing.push('performance.agreedPerformanceRate');
  }
  if (missing.length > 0) {
    return {
      status: 'insufficient_data',
      mode: 'revenue_delta',
      placement: 'above_growth_budget',
      fee: null,
      missing,
    };
  }

  const frozen3MonthAverageRevenue = money(
    performance.baselineRevenueMonths.reduce((sum, value) => sum + value, 0) / 3,
  );
  const positiveRevenueDelta = money(Math.max(
    0,
    performance.currentMeasuredMonthRevenue - frozen3MonthAverageRevenue,
  ));
  const fee = money(performance.agreedPerformanceRate * positiveRevenueDelta);
  if (positiveRevenueDelta === 0) warnings.push('No positive revenue delta; Performance Fee is zero');

  return {
    status: 'complete',
    mode: 'revenue_delta',
    scheduleStatus: 'signed',
    placement: 'above_growth_budget',
    frozen3MonthAverageRevenue,
    currentMeasuredMonthRevenue: money(performance.currentMeasuredMonthRevenue),
    positiveRevenueDelta,
    agreedPerformanceRate: performance.agreedPerformanceRate,
    fee,
    method: 'Agreed Performance Fee rate multiplied by the positive difference between current closed revenue and the frozen three-month average.',
  };
}

/**
 * @param {object} input normalized vertical-neutral economics input
 */
export function calculateGrowthEconomics(input = {}) {
  const missing = [];
  const warnings = [];
  const attribution = calculateOperationalAttribution(input, missing, warnings);
  const growthBudget = calculateGrowthBudget(input.commercialSchedule, missing, warnings);
  const performance = calculatePerformance(input.performance, warnings);
  const commercialReady = growthBudget.status === 'complete';
  const totalCommercialAmount = commercialReady
    ? money(
      growthBudget.committedGrowthBudget
        + growthBudget.clientTopUps
        + (performance.status === 'complete' ? performance.fee : 0),
    )
    : null;

  return {
    status: commercialReady ? 'complete' : growthBudget.status,
    vertical: input.vertical || 'unspecified',
    currency: input.priceBook?.currency || input.commercialSchedule?.currency || 'USD',
    dataQuality: commercialReady && warnings.length === 0 ? 'high' : commercialReady ? 'medium' : 'low',
    confidence: commercialReady && warnings.length === 0 ? 'high' : commercialReady ? 'medium' : 'low',
    missing: [...new Set(missing)],
    warnings: [...new Set(warnings)],
    attribution,
    operationalAnalytics: attribution,
    growthBudget,
    performance,
    totalCommercialAmount,
    disclosures: {
      observed: 'AGV and AGC, when present, are operational analytics only and are not the reusable invoice basis.',
      estimate: 'Any planning estimate is Class B and must state assumptions; no reusable Growth Budget rate applies.',
      payment: 'Recurring commercial values come only from the signed client-specific Commercial Schedule.',
      allocation: 'The Fixed Management Fee is a visible line inside the Growth Budget. Variable funds reconcile and roll forward; any earned Performance Fee is separate above the Growth Budget.',
    },
  };
}
