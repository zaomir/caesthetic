import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("CAESTHETIC score access is fail-closed and Nohy remains server-side protected", () => {
  const router = read("infra/cloudflare/router/src/index.ts");
  const manifest = JSON.parse(read("infra/cloudflare/brands/caesthetic.manifest.json"));
  const cutover = read("scripts/cf-caesthetic-cutover.sh");
  assert.match(router, /env\.BRAND !== 'caesthetic' \|\| !pathname\.startsWith\('\/score\/'\)/);
  assert.match(router, /pathname === '\/score\/'/);
  assert.match(router, /pathname === '\/score\/catalog\.json'/);
  assert.match(router, /pathname\.startsWith\('\/score\/demo-'\)/);
  assert.match(router, /isConfiguredPublicScorePath\(env\.SCORE_PUBLIC_PATHS, pathname\)/);
  assert.match(router, /isConfiguredProtectedScorePath\(env\.SCORE_PROTECTED_PATHS, url\.pathname\)/);
  assert.match(router, /isConfiguredPublicScorePath\(env\.SCORE_PUBLIC_PATHS, url\.pathname\)[\s\S]*isConfiguredProtectedScorePath\(env\.SCORE_PROTECTED_PATHS, url\.pathname\)[\s\S]*headers\.set\('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet'\)/);
  assert.match(router, /X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet'/);
  assert.match(router, /This private Growth Score is not available/);
  assert.match(router, /protectedResponse\([\s\S]*404/);
  assert.deepEqual(manifest.scoreProtectedPaths, [{
    prefix: "/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/",
    accessGroupId: "nvr-odesa-2026-08-31",
  }]);
  assert.deepEqual(manifest.scorePublicPaths, []);
  assert.match(cutover, /SCORE_PROTECTED_PATHS/);
  assert.match(cutover, /SCORE_PUBLIC_PATHS/);
});
test("DEC-829 excludes client score artifacts and protects canonical Growth Score authorities", () => {
  const manifest = read("docs/projects/caesthetic/SYNC_MANIFEST.yml");
  const sync = read("scripts/caesthetic/sync_agents_bidirectional.py");
  assert.match(manifest, /site-caesthetic\/score\/prestige-ru-preview-[^\n]+\/\*\*/);
  assert.match(sync, /"site-caesthetic\/score\/prestige-ru-preview-/);
  for (const authority of [
    "docs/ssot/CAESTHETIC.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md",
    "docs/caesthetic/growth_score_spec.md",
    "scripts/caesthetic/growth-score-report-template.mjs",
    "scripts/caesthetic/render-growth-score.mjs",
  ]) {
    assert.match(manifest, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(sync, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
