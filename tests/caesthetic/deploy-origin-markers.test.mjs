import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const deploy = fs.readFileSync(path.join(root, 'scripts/deploy-caesthetic.sh'), 'utf8');
const markers = deploy.split('# Current funnel markers\n')[1].split('\nfor demo in ')[0];
function probe(addition = '') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cae-origin-marker-'));
  try {
    fs.mkdirSync(path.join(dir, 'assets/js'), { recursive: true });
    fs.copyFileSync(path.join(root, 'site-caesthetic/index.html'), path.join(dir, 'index.html'));
    fs.copyFileSync(path.join(root, 'site-caesthetic/assets/js/caesthetic-config.js'), path.join(dir, 'assets/js/caesthetic-config.js'));
    fs.appendFileSync(path.join(dir, 'index.html'), addition);
    return spawnSync('bash', ['-s'], { input: 'set -euo pipefail\n' + markers, env: { ...process.env, CAE_ROOT: dir }, encoding: 'utf8' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
test('origin accepts current public assets without depending on an old config comment', () => {
  const result = probe();
  assert.equal(result.status, 0, result.stderr);
});
for (const markup of [
  '<script src="/assets/js/growth-report-funnel.js"></script>',
  '<script>const script=document.createElement("script");script.src="/assets/js/growth-report-funnel.js";</script>',
]) test(`origin rejects actual retired adapter loading: ${markup}`, () => {
  const result = probe(markup);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /FATAL: retired universal report adapter is loaded/);
});
