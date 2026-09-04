import crypto from 'node:crypto';
import { SignatureProvider, hmacVerify, providerEventId } from '../signature-provider.mjs';
import { sha256 } from '../core.mjs';

export class MockSignatureAdapter extends SignatureProvider {
  #envelopes = new Map();
  constructor({ webhookSecret = 'synthetic-test-secret' } = {}) {
    super({ name: 'mock', enabled: true, mode: 'synthetic-test-only' });
    this.webhookSecret = webhookSecret || 'synthetic-test-secret';
  }
  async createEnvelope(input) {
    if (!/^(TEST|DEMO|ТЕСТ|ДЕМО)(?:\s|[-_:])/i.test(input.patientDisplayName || '')) throw new Error('mock_requires_synthetic_patient');
    const id = crypto.randomUUID();
    const envelope = { id, provider: this.name, status: 'SENT', createdAt: new Date().toISOString(), ...input };
    this.#envelopes.set(id, envelope);
    return envelope;
  }
  async createSigningSession({ envelopeId, adminSessionId }) {
    if (!adminSessionId) throw new Error('admin_session_required');
    const envelope = await this.getEnvelope(envelopeId);
    return { envelopeId, url: `mock://sign/${envelope.id}`, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() };
  }
  async complete(envelopeId) {
    const envelope = await this.getEnvelope(envelopeId);
    envelope.status = 'SIGNED';
    envelope.completedAt = new Date().toISOString();
    envelope.pdf = Buffer.from(`SYNTHETIC SIGNED PDF ${envelope.id}`);
    return envelope;
  }
  async getEnvelope(id) {
    const envelope = this.#envelopes.get(id);
    if (!envelope) throw new Error('mock_envelope_not_found');
    return envelope;
  }
  async getArtifacts({ envelopeId }) {
    const envelope = await this.getEnvelope(envelopeId);
    if (envelope.status !== 'SIGNED') throw new Error('mock_envelope_not_signed');
    const audit = Buffer.from(JSON.stringify({ envelopeId, provider: 'mock', completedAt: envelope.completedAt }));
    return [
      { kind: 'signed_pdf', contentType: 'application/pdf', body: envelope.pdf, sha256: sha256(envelope.pdf) },
      { kind: 'completion_evidence', contentType: 'application/json', body: audit, sha256: sha256(audit) },
    ];
  }
  verifyWebhook({ rawBody, headers }) {
    return hmacVerify({ secret: this.webhookSecret, rawBody, signature: headers['x-expert-signature'], timestamp: headers['x-expert-timestamp'] });
  }
  normalizeWebhook(payload) {
    return { id: payload.eventId || providerEventId(this.name, payload), envelopeId: payload.envelopeId, type: payload.type, occurredAt: payload.occurredAt };
  }
}
