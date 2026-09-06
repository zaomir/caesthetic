import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = stripTypeScriptTypes(readFileSync(new URL('../../supabase/functions/_shared/admin_handlers/admin-caesthetic-billing.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;$/gm, '').replace('export default ', '');
function setup({ signed = true, attached = true, status = 'invoice_created', gate = true, mail = true } = {}) {
  let sends = 0;
  const row = { id: 'test', status, provider_invoice_id: attached ? 'TEST' : '', provider_payment_link: attached ? 'https://wise.com/test' : '', caesthetic_commercial_orders: { signed_at: signed ? '2026-09-06' : null, signer_email: 'qa@example.com' } };
  const db = { from() {
    let updating = false, expected;
    const query = {
      select() { return query; }, eq(key, value) { if (key === 'status') expected = value; return query; },
      update() { updating = true; return query; },
      async single() { return { data: row }; },
      async maybeSingle() {
        assert.equal(updating, true);
        if (row.status !== expected) return { data: null };
        row.status = 'draft';
        return { data: { id: row.id } };
      },
    };
    return query;
  } };
  const ctx = vm.createContext({ Request, Response, URL, AbortSignal, console, createClient: () => db,
    assertAdminCookie: async () => ({ ok: gate }), Deno: { env: { get: () => 'test' } },
    sendPreparedInvoice: async () => { sends++; return { ok: mail }; },
  });
  vm.runInContext(source, ctx);
  return { row, sends: () => sends, send: () => ctx.handler(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ action: 'send', payment_request_id: 'test' }) })) };
}
test('concurrent send has exactly one winner and one provider request', async () => {
  const h = setup(); const results = await Promise.all([h.send(), h.send()]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]); assert.equal(h.sends(), 1);
});
for (const options of [{ signed: false }, { attached: false }, { status: 'invoice_sent' }, { status: 'credited' }]) {
  test('send guard ' + JSON.stringify(options), async () => {
    const h = setup(options); assert.equal((await h.send()).status, 409); assert.equal(h.sends(), 0);
  });
}
test('unauthenticated send denied', async () => { const h = setup({ gate: false }); assert.equal((await h.send()).status, 401); assert.equal(h.sends(), 0); });
test('unconfirmed email does not claim success or retry automatically', async () => {
  const h = setup({ mail: false }); assert.equal((await h.send()).status, 424); assert.equal((await h.send()).status, 409); assert.equal(h.sends(), 1);
});
