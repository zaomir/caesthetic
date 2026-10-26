import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validLinkedInAttestation, surfaceIdentity } from '../../scripts/caesthetic/social-channel/operators.mjs';
const sourceSha = createHash('sha256').update(readFileSync(new URL('../../scripts/caesthetic/social-channel/operators.mjs', import.meta.url))).digest('hex');
const now = Date.now();
const fixture = () => ({ probed: true, identity_verified: true, identity_state: 'verified', messaging_open: true, generated_at: new Date(now).toISOString(), platform: 'linkedin', profile_id: '833304152', surface_account_id: 'valeria-lana-linkedin', identity_proof: 'linkedin_in_me_v1', observed_url_host: 'www.linkedin.com', probe_source_sha256: sourceSha });
test('CAESTHETIC shared directory stores a LinkedIn proof, never an Instagram attestation', () => {
  const p = fixture();
  assert.equal(surfaceIdentity('valeria-lana-linkedin', p).identity_verified, true);
  assert.equal(surfaceIdentity('caesthetic-instagram', p).identity_verified, false);
  assert.equal(surfaceIdentity('caesthetic-instagram', p).code, 'SURFACE_NOT_PROBED');
});
test('untyped, wrong-platform/account/source and future cache cannot prove ownership', () => {
  const p = fixture();
  assert.equal(validLinkedInAttestation(p, { now }), true);
  for (const bad of [{ ...p, platform: undefined }, { ...p, platform: 'instagram' }, { ...p, profile_id: '830274558' },
    { ...p, surface_account_id: 'caesthetic-instagram' }, { ...p, observed_url_host: 'www.instagram.com' },
    { ...p, probe_source_sha256: 'old-release' }, { ...p, generated_at: new Date(now + 60000).toISOString() },
    { ...p, generated_at: new Date(now - 1200001).toISOString() }]) {
    assert.equal(validLinkedInAttestation(bad, { now }), false);
    assert.equal(surfaceIdentity('valeria-lana-linkedin', bad).identity_verified, false);
  }
});
