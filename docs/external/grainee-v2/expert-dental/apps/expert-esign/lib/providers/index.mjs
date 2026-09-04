import { ProviderRegistry } from '../signature-provider.mjs';
import { MockSignatureAdapter } from './mock.mjs';
import { ZohoSignAdapter } from './zoho-sign.mjs';
import { DocuSignAdapter } from './docusign.mjs';

export function createProviderRegistry(env = process.env) {
  return new ProviderRegistry()
    .register(new MockSignatureAdapter({ webhookSecret: env.MOCK_SIGNATURE_WEBHOOK_SECRET }))
    .register(new ZohoSignAdapter(env))
    .register(new DocuSignAdapter(env));
}
