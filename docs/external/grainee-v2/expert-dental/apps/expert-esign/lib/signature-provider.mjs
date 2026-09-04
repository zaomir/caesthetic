import crypto from 'node:crypto';
import { stableStringify } from './core.mjs';

export class SignatureProvider {
  constructor({ name, enabled = false, mode = 'disabled' }) {
    if (new.target === SignatureProvider) throw new Error('signature_provider_is_abstract');
    this.name = name;
    this.enabled = enabled;
    this.mode = mode;
  }
  async createEnvelope() { throw new Error('not_implemented:createEnvelope'); }
  async createSigningSession() { throw new Error('not_implemented:createSigningSession'); }
  async getEnvelope() { throw new Error('not_implemented:getEnvelope'); }
  async getArtifacts() { throw new Error('not_implemented:getArtifacts'); }
  verifyWebhook() { throw new Error('not_implemented:verifyWebhook'); }
  normalizeWebhook() { throw new Error('not_implemented:normalizeWebhook'); }
  health() { return { name: this.name, enabled: this.enabled, mode: this.mode }; }
}

export function hmacVerify({ secret, rawBody, signature, timestamp, toleranceSeconds = 300, now = Date.now() }) {
  if (!secret || !signature || !timestamp) return false;
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Math.floor(now / 1000) - seconds) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature).replace(/^sha256=/, ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function providerEventId(provider, payload) {
  return crypto.createHash('sha256').update(`${provider}:${stableStringify(payload)}`).digest('hex');
}

export class ProviderRegistry {
  #providers = new Map();
  register(provider) {
    if (!(provider instanceof SignatureProvider)) throw new Error('invalid_signature_provider');
    if (this.#providers.has(provider.name)) throw new Error(`duplicate_signature_provider:${provider.name}`);
    this.#providers.set(provider.name, provider);
    return this;
  }
  get(name) {
    const provider = this.#providers.get(name);
    if (!provider) throw new Error(`unknown_signature_provider:${name}`);
    if (!provider.enabled) throw new Error(`signature_provider_disabled:${name}`);
    return provider;
  }
  health() { return [...this.#providers.values()].map((provider) => provider.health()); }
}
