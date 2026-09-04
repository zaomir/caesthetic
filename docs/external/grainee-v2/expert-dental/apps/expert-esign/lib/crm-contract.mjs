export const SQNS_CONTRACT_VERSION = 'expert-esign.sqns-boundary.v1';

export function validateSqnsSnapshot(input) {
  const allowed = ['patientRef', 'visitRef', 'doctorRef', 'serviceRefs', 'displayName', 'phoneE164'];
  const unknown = Object.keys(input || {}).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`sqns_contract_unknown_fields:${unknown.join(',')}`);
  for (const key of ['patientRef', 'visitRef', 'doctorRef', 'displayName']) {
    if (!input?.[key]) throw new Error(`sqns_contract_missing:${key}`);
  }
  return { contractVersion: SQNS_CONTRACT_VERSION, ...input };
}

export function sealedDocumentCallback({ envelopeId, providerEnvelopeId, patientRef, visitRef, documentId, documentVersion, artifactSha256, sealedAt }) {
  return {
    contractVersion: SQNS_CONTRACT_VERSION,
    event: 'sealed_document_available',
    envelopeId,
    providerEnvelopeId,
    patientRef,
    visitRef,
    document: { id: documentId, version: documentVersion },
    artifact: { sha256: artifactSha256 },
    sealedAt,
  };
}
