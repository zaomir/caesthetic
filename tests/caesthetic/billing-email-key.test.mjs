import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = stripTypeScriptTypes(readFileSync(new URL('../../supabase/functions/_shared/caesthetic-billing-email.ts', import.meta.url), 'utf8')).replace('export ', '');
for (const dedicated of [true, false]) {
  test(`CAESTHETIC sender key isolation: dedicated=${dedicated}`, async () => {
    let used;
    const ctx = vm.createContext({ console, AbortSignal,
      Deno: { env: { get: key => ({ CAESTHETIC_RESEND_API_KEY: dedicated ? 'dedicated-test' : undefined, RESEND_API_KEY: 'shared-test' })[key] } },
      fetch: async (_url, opts) => { used = opts.headers.Authorization; return new Response(JSON.stringify({ id: 'test-email' })); },
    });
    vm.runInContext(source, ctx);
    const result = await ctx.sendCaestheticBillingEmail({ to: 'qa@example.com', subject: 'test', html: 'test' });
    assert.equal(result.ok, true);
    assert.equal(used, `Bearer ${dedicated ? 'dedicated-test' : 'shared-test'}`);
  });
}
