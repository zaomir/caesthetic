export const ENVELOPE_TRANSITIONS = Object.freeze({
  DRAFT: new Set(['DOCTOR_APPROVAL_PENDING', 'READY']),
  DOCTOR_APPROVAL_PENDING: new Set(['READY', 'VOIDED']),
  READY: new Set(['SENT', 'VOIDED']),
  SENT: new Set(['VIEWED', 'SIGNED', 'DECLINED', 'VOIDED', 'EXPIRED']),
  VIEWED: new Set(['SIGNED', 'DECLINED', 'VOIDED', 'EXPIRED']),
  SIGNED: new Set(['SEALED']),
  SEALED: new Set(['ARCHIVED']),
  ARCHIVED: new Set([]),
  DECLINED: new Set([]),
  VOIDED: new Set([]),
  EXPIRED: new Set([]),
});

export function transitionEnvelope(current, next) {
  if (current === next) return next;
  if (!ENVELOPE_TRANSITIONS[current]?.has(next)) {
    throw new Error(`invalid_envelope_transition:${current}->${next}`);
  }
  return next;
}

export function initialEnvelopeState({ doctorApprovalRequired }) {
  return doctorApprovalRequired ? 'DOCTOR_APPROVAL_PENDING' : 'READY';
}
