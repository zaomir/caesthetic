import { SignatureProvider } from '../signature-provider.mjs';

export class DocuSignAdapter extends SignatureProvider {
  constructor(env = process.env) {
    const enabled = env.DOCUSIGN_ENABLED === 'true' && env.EXPERT_ESIGN_MODE !== 'test';
    super({ name: 'docusign', enabled, mode: enabled ? 'vendor-gated' : 'disabled-vendor-gate' });
    this.accountId = env.DOCUSIGN_ACCOUNT_ID || '';
    this.integrationKey = env.DOCUSIGN_INTEGRATION_KEY || '';
    this.privateKey = env.DOCUSIGN_PRIVATE_KEY || '';
    this.webhookSecret = env.DOCUSIGN_WEBHOOK_SECRET || '';
  }
  #gate() {
    if (!this.enabled || !this.accountId || !this.integrationKey || !this.privateKey || !this.webhookSecret) throw new Error('docusign_vendor_gate_open');
  }
  async createEnvelope() { this.#gate(); throw new Error('docusign_endpoint_mapping_not_approved'); }
  async createSigningSession() { this.#gate(); throw new Error('docusign_in_person_flow_not_approved'); }
  async getEnvelope() { this.#gate(); throw new Error('docusign_endpoint_mapping_not_approved'); }
  async getArtifacts() { this.#gate(); throw new Error('docusign_artifact_mapping_not_approved'); }
  verifyWebhook() { this.#gate(); throw new Error('docusign_connect_contract_not_approved'); }
  normalizeWebhook() { this.#gate(); throw new Error('docusign_connect_contract_not_approved'); }
}
