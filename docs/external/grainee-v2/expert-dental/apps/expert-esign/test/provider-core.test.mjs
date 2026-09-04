import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createProviderRegistry } from '../lib/providers/index.mjs';
import { SigningCore } from '../lib/signing-core.mjs';
import { hmacVerify } from '../lib/signature-provider.mjs';
import { createCrmAdapter } from '../lib/integrations.mjs';

test('provider registry fails closed for vendor-gated providers in TEST', () => {
  const registry = createProviderRegistry({ EXPERT_ESIGN_MODE: 'test', ZOHO_SIGN_ENABLED: 'true', DOCUSIGN_ENABLED: 'true' });
  assert.match(registry.get('mock').health().mode, /synthetic/);
  assert.throws(() => registry.get('zoho-sign'), /disabled/);
  assert.throws(() => registry.get('docusign'), /disabled/);
});

test('CRM callback remains outbound-disabled in TEST even if a URL is supplied', async () => {
  const crm = createCrmAdapter({ EXPERT_ESIGN_MODE: 'test', CRM_CALLBACK_URL: 'https://invalid.example/callback' });
  assert.equal(crm.configured, false);
  assert.deepEqual(await crm.notify({ event: 'synthetic' }), { status: 'SKIPPED_TEST_MODE' });
});

test('webhook verification rejects replay-window timestamps and bad HMAC', () => {
  const rawBody = '{"eventId":"evt-1"}';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac('sha256', 'secret').update(`${timestamp}.${rawBody}`).digest('hex');
  assert.equal(hmacVerify({ secret: 'secret', rawBody, signature, timestamp }), true);
  assert.equal(hmacVerify({ secret: 'secret', rawBody, signature: '00', timestamp }), false);
  assert.equal(hmacVerify({ secret: 'secret', rawBody, signature, timestamp: '1' }), false);
});

test('MockSignatureAdapter completes the synthetic SQNS to sealed evidence flow', async () => {
  const registry = createProviderRegistry({ EXPERT_ESIGN_MODE: 'test' });
  const stored = [];
  const callbacks = [];
  const core = new SigningCore({
    providers: registry,
    artifactStore: { async putLocked(input) { stored.push(input); return { key: input.key, versionId: `v${stored.length}` }; } },
    crm: { async notify(event) { callbacks.push(event); return { status: 'captured-test-only' }; } },
    now: () => new Date('2026-09-04T12:00:00Z'),
  });
  const template = {
    code: 'ED-CON-002', version: '1.0.0', sourceSha256: 'a'.repeat(64),
    effective: false, testEligible: true, evidenceBlocked: false, requiredApproverRole: null,
  };
  const envelope = core.createDraft({
    provider: 'mock', template,
    sqns: { patientRef: 'sqns-test-p1', visitRef: 'sqns-test-v1', doctorRef: 'sqns-test-d1', serviceRefs: ['synthetic'], displayName: 'ТЕСТ Пациент' },
    signers: [{ type: 'patient', ref: 'sqns-test-p1' }],
  });
  await core.openAdminSession({ envelopeId: envelope.id, adminSessionId: 'admin-test-session', deviceCode: 'managed-ipad-test' });
  const mock = registry.get('mock');
  await mock.complete(envelope.providerEnvelopeId);
  const sealed = await core.seal({ envelopeId: envelope.id });
  assert.equal(sealed.status, 'SEALED');
  assert.equal(stored.length, 3);
  assert.equal(callbacks.length, 1);
  assert.equal(callbacks[0].contractVersion, 'expert-esign.sqns-boundary.v1');
  assert.match(callbacks[0].idempotencyKey, /^sealed:/);
  const event = { id: 'evt-1', envelopeId: envelope.providerEnvelopeId };
  assert.equal(core.acceptWebhook({ provider: 'mock', event }).duplicate, false);
  assert.equal(core.acceptWebhook({ provider: 'mock', event }).duplicate, true);
});

test('doctor approval gate binds the assigned SQNS doctor before iPad session', async () => {
  const core = new SigningCore({
    providers: createProviderRegistry({ EXPERT_ESIGN_MODE: 'test' }),
    artifactStore: { putLocked: async () => ({ key: 'x', versionId: '1' }) },
    crm: { notify: async () => ({ status: 'captured' }) },
  });
  const envelope = core.createDraft({
    provider: 'mock',
    template: { code: 'ED-TEST', version: '1', sourceSha256: 'b'.repeat(64), effective: false, testEligible: true, evidenceBlocked: false, requiredApproverRole: 'doctor' },
    sqns: { patientRef: 'p', visitRef: 'v', doctorRef: 'doctor-1', displayName: 'TEST Patient' },
    signers: [{ type: 'patient', ref: 'p' }, { type: 'doctor', ref: 'doctor-1' }],
  });
  await assert.rejects(() => core.openAdminSession({ envelopeId: envelope.id, adminSessionId: 'a', deviceCode: 'ipad' }), /not_ready/);
  assert.throws(() => core.approveByDoctor({ envelopeId: envelope.id, doctorRef: 'doctor-2' }), /actor_mismatch/);
  core.approveByDoctor({ envelopeId: envelope.id, doctorRef: 'doctor-1' });
  await core.openAdminSession({ envelopeId: envelope.id, adminSessionId: 'a', deviceCode: 'ipad' });
  assert.equal(envelope.status, 'SENT');
});
