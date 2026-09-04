import { SignatureProvider } from '../signature-provider.mjs';

export class ZohoSignAdapter extends SignatureProvider {
  constructor(env = process.env) {
    const enabled = env.ZOHO_SIGN_ENABLED === 'true' && env.EXPERT_ESIGN_MODE !== 'test';
    super({ name: 'zoho-sign', enabled, mode: enabled ? 'vendor-gated' : 'disabled-vendor-gate' });
    this.baseUrl = env.ZOHO_SIGN_BASE_URL || '';
    this.oauthToken = env.ZOHO_SIGN_OAUTH_TOKEN || '';
    this.webhookSecret = env.ZOHO_SIGN_WEBHOOK_SECRET || '';
  }
  #gate() {
    if (!this.enabled || !this.baseUrl || !this.oauthToken || !this.webhookSecret) throw new Error('zoho_sign_vendor_gate_open');
  }
  async createEnvelope() { this.#gate(); throw new Error('zoho_sign_endpoint_mapping_not_approved'); }
  async createSigningSession() { this.#gate(); throw new Error('zoho_sign_in_person_flow_not_approved'); }
  async getEnvelope() { this.#gate(); throw new Error('zoho_sign_endpoint_mapping_not_approved'); }
  async getArtifacts() { this.#gate(); throw new Error('zoho_sign_artifact_mapping_not_approved'); }
  verifyWebhook() { this.#gate(); throw new Error('zoho_sign_webhook_contract_not_approved'); }
  normalizeWebhook() { this.#gate(); throw new Error('zoho_sign_webhook_contract_not_approved'); }
}
