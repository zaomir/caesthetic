/**
 * Vertical adapters for the CAESTHETIC Growth Economics Engine.
 * They normalize source records only; all economics remain in the neutral core.
 */

function normalizePriceBook(priceBook, mapEntry) {
  return {
    frozenAt: priceBook?.frozenAt || null,
    currency: priceBook?.currency || 'USD',
    entries: Array.isArray(priceBook?.entries) ? priceBook.entries.map(mapEntry) : [],
  };
}

function sharedInput(input) {
  return {
    commercialSchedule: input.commercialSchedule,
    performance: input.performance,
    measurement: input.measurement,
  };
}

export function adaptAestheticsEconomics(input = {}) {
  return {
    ...sharedInput(input),
    vertical: 'aesthetics',
    priceBook: normalizePriceBook(input.priceBook, (entry) => ({
      serviceCode: entry.treatmentCode,
      referencePrice: entry.referenceTreatmentPrice,
      standardVariableCost: (entry.drugMaterialCost || 0) + (entry.variableProviderComp || 0),
    })),
    treatments: Array.isArray(input.completedTreatments) ? input.completedTreatments.map((item) => ({
      id: item.treatmentId,
      serviceCode: item.treatmentCode,
      status: item.status,
      attributable: item.attributable,
      attributionClass: item.attributionClass,
      attributionEvidence: item.attributionEvidence,
      attributionTimestamp: item.attributionTimestamp,
      attributionWindowDays: item.attributionWindowDays,
      completedAt: item.completedAt,
      paymentMethod: item.paymentMethod,
      discountPercent: item.discountPercent,
      refundAmount: item.refundAmount,
      chargebackAmount: item.chargebackAmount,
      excludedReason: item.excludedReason,
    })) : null,
  };
}

export function adaptDentalEconomics(input = {}) {
  return {
    ...sharedInput(input),
    vertical: 'dental',
    monthlyCollections: input.monthlyCollections,
    priceBook: normalizePriceBook(input.priceBook, (entry) => ({
      serviceCode: entry.procedureCode,
      referencePrice: entry.referenceProductionFee,
      standardVariableCost: (entry.labMaterialCost || 0) + (entry.variableProviderComp || 0),
    })),
    treatments: Array.isArray(input.completedProcedures) ? input.completedProcedures.map((item) => ({
      id: item.procedureId,
      serviceCode: item.procedureCode,
      status: item.status,
      attributable: item.attributable,
      attributionClass: item.attributionClass,
      attributionEvidence: item.attributionEvidence,
      attributionTimestamp: item.attributionTimestamp,
      attributionWindowDays: item.attributionWindowDays,
      completedAt: item.completedAt,
      paymentMethod: item.paymentMethod,
      discountPercent: item.discountPercent,
      refundAmount: item.refundAmount,
      chargebackAmount: item.chargebackAmount,
      excludedReason: item.excludedReason,
    })) : null,
  };
}
