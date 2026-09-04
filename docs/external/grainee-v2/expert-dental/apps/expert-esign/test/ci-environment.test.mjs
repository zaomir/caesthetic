import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// The CI workflow validates the real production compose files. The application compose
// references a root-only production env path, so CI supplies an isolated synthetic env via
// GITHUB_ENV. This never runs outside GitHub Actions and contains no real credentials.
test('GitHub Actions compose validation uses a synthetic env file', () => {
  if (!process.env.GITHUB_ACTIONS) return;
  const source = fs.readFileSync(path.resolve('.env.example'), 'utf8');
  const target = '/tmp/expert-esign-ci-service.env';
  fs.writeFileSync(
    target,
    `${source}\nENV_FILE=${target}\nCI_EXPECT_API_BIND=127.0.0.1:8787\nCI_EXPECT_WAHA_BIND=127.0.0.1:3000\n`,
    { mode: 0o600 },
  );
  assert.ok(process.env.GITHUB_ENV, 'GITHUB_ENV must be available');
  fs.appendFileSync(process.env.GITHUB_ENV, `ENV_FILE=${target}\n`);
  assert.equal(fs.statSync(target).mode & 0o777, 0o600);
});

test('runtime source keeps TEST and managed-device gates explicit', () => {
  const server = fs.readFileSync(path.resolve('server.mjs'), 'utf8');
  const database = fs.readFileSync(path.resolve('lib/db.mjs'), 'utf8');
  assert.match(server, /test_mode_requires_synthetic_patient_prefix/);
  assert.match(server, /outbound_delivery_disabled_in_test_mode/);
  assert.match(server, /managed_signing_device_required/);
  assert.match(server, /provider_webhook_receipts/);
  assert.match(server, /WHERE status <> 'RETIRED'/);
  assert.match(database, /SET status='RETIRED'/);
  assert.doesNotMatch(database, /SET status='RETIRED',\s*updated_at/);
});
