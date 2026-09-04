import crypto from 'node:crypto';
import { canonicalHash, sha256 } from './core.mjs';
import { initialEnvelopeState, transitionEnvelope } from './state-machine.mjs';
import { validateSqnsSnapshot, sealedDocumentCallback } from './crm-contract.mjs';

export class SigningCore {
  constructor({ providers, artifactStore, crm, now = () => new Date() }) {
    this.providers = providers;
    this.artifactStore = artifactStore;
    this.crm = crm;
    this.now = now;
    this.envelopes = new Map();
    this.processedEvents = new Set();
  }

  createDraft({ provider, template, sqns, signers }) {
    if (!template?.sourceSha256 || template.effective || template.evidenceBlocked) {
      throw new Error('template_authority_or_gate_invalid');
    }
    if (provider !== 'mock' && !template.effective) throw new Error('template_not_effective');
    if (provider === 'mock' && !template.testEligible) throw new Error('template_not_test_eligible');
    const snapshot = validateSqnsSnapshot(sqns);
    const envelope = {
      id: crypto.randomUUID(), provider, template, sqns: snapshot, signers,
      status: initialEnvelopeState({ doctorApprovalRequired: template.requiredApproverRole === 'doctor' }),
      createdAt: this.now().toISOString(), providerEnvelopeId: null, artifacts: [],
    };
    this.envelopes.set(envelope.id, envelope);
    return envelope;
  }

  approveByDoctor({ envelopeId, doctorRef }) {
    const envelope = this.#get(envelopeId);
    if (envelope.status !== 'DOCTOR_APPROVAL_PENDING') throw new Error('doctor_approval_not_pending');
    if (doctorRef !== envelope.sqns.doctorRef) throw new Error('doctor_approval_actor_mismatch');
    envelope.status = transitionEnvelope(envelope.status, 'READY');
    envelope.doctorApproval = { doctorRef, approvedAt: this.now().toISOString(), snapshotSha256: canonicalHash({ template: envelope.template, sqns: envelope.sqns }) };
    return envelope;
  }

  async openAdminSession({ envelopeId, adminSessionId, deviceCode }) {
    const envelope = this.#get(envelopeId);
    if (envelope.status !== 'READY') throw new Error('envelope_not_ready');
    if (!adminSessionId || !deviceCode) throw new Error('admin_ipad_session_required');
    const provider = this.providers.get(envelope.provider);
    const providerEnvelope = await provider.createEnvelope({
      patientDisplayName: envelope.sqns.displayName,
      templateCode: envelope.template.code,
      templateVersion: envelope.template.version,
      sourceSha256: envelope.template.sourceSha256,
      signers: envelope.signers,
    });
    envelope.providerEnvelopeId = providerEnvelope.id;
    envelope.status = transitionEnvelope(envelope.status, 'SENT');
    envelope.session = await provider.createSigningSession({ envelopeId: providerEnvelope.id, adminSessionId, deviceCode });
    return envelope;
  }

  async seal({ envelopeId }) {
    const envelope = this.#get(envelopeId);
    const provider = this.providers.get(envelope.provider);
    const remote = await provider.getEnvelope(envelope.providerEnvelopeId);
    if (remote.status !== 'SIGNED') throw new Error('provider_envelope_not_signed');
    envelope.status = transitionEnvelope(envelope.status, 'SIGNED');
    const artifacts = await provider.getArtifacts({ envelopeId: envelope.providerEnvelopeId });
    const retainUntil = new Date(this.now().getTime() + 3650 * 86400000);
    for (const artifact of artifacts) {
      const stored = await this.artifactStore.putLocked({
        key: `envelopes/${envelope.id}/${artifact.kind}`,
        body: artifact.body,
        contentType: artifact.contentType,
        retainUntil,
        metadata: { sha256: artifact.sha256, provider: envelope.provider },
      });
      envelope.artifacts.push({ ...stored, kind: artifact.kind, sha256: artifact.sha256 });
    }
    const manifest = {
      schema: 'expert-esign.evidence-manifest.v2', envelopeId: envelope.id,
      provider: envelope.provider, providerEnvelopeId: envelope.providerEnvelopeId,
      template: { code: envelope.template.code, version: envelope.template.version, sourceSha256: envelope.template.sourceSha256 },
      artifacts: envelope.artifacts, sealedAt: this.now().toISOString(),
    };
    const manifestBody = Buffer.from(JSON.stringify(manifest, null, 2));
    const manifestStored = await this.artifactStore.putLocked({
      key: `envelopes/${envelope.id}/manifest.json`, body: manifestBody,
      contentType: 'application/json', retainUntil,
      metadata: { sha256: sha256(manifestBody), provider: envelope.provider },
    });
    envelope.artifacts.push({ ...manifestStored, kind: 'evidence_manifest', sha256: sha256(manifestBody) });
    envelope.status = transitionEnvelope(envelope.status, 'SEALED');
    const signedPdf = envelope.artifacts.find((item) => item.kind === 'signed_pdf');
    envelope.crmCallback = sealedDocumentCallback({
      envelopeId: envelope.id, providerEnvelopeId: envelope.providerEnvelopeId,
      patientRef: envelope.sqns.patientRef, visitRef: envelope.sqns.visitRef,
      documentId: envelope.template.code, documentVersion: envelope.template.version,
      artifactSha256: signedPdf.sha256, sealedAt: manifest.sealedAt,
    });
    await this.crm.notify({ ...envelope.crmCallback, idempotencyKey: `sealed:${envelope.id}:${signedPdf.sha256}` });
    return envelope;
  }

  acceptWebhook({ provider, event }) {
    const key = `${provider}:${event.id}`;
    if (this.processedEvents.has(key)) return { duplicate: true };
    this.processedEvents.add(key);
    const envelope = [...this.envelopes.values()].find((item) => item.provider === provider && item.providerEnvelopeId === event.envelopeId);
    if (!envelope) throw new Error('webhook_envelope_not_found');
    return { duplicate: false, envelopeId: envelope.id };
  }

  #get(id) {
    const envelope = this.envelopes.get(id);
    if (!envelope) throw new Error('envelope_not_found');
    return envelope;
  }
}
