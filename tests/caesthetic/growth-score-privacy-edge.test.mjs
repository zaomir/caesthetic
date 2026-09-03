import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("CAESTHETIC score access is fail-closed and every real client report is PIN-protected", (t) => {
  if (!fs.existsSync(path.join(root, "infra/cloudflare/router/src/index.ts"))) {
    t.skip("runtime router is intentionally absent from the public satellite repository");
    return;
  }
  const router = read("infra/cloudflare/router/src/index.ts");
  const manifest = JSON.parse(read("infra/cloudflare/brands/caesthetic.manifest.json"));
  const cutover = read("scripts/cf-caesthetic-cutover.sh");
  const prestigePilotPath = "site-caesthetic/score/prestige-ru-pilot-520-20260901-c6d8e2/index.html";
  const prestigePilot = fs.existsSync(path.join(root, prestigePilotPath))
    ? read(prestigePilotPath)
    : null;
  const sitemap = read("site-caesthetic/sitemap.xml");
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
  assert.deepEqual(
    manifest.scoreProtectedPaths.map(({ prefix, accessGroupId }) => ({ prefix, accessGroupId })),
    [
      {
        prefix: "/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/",
        accessGroupId: "nvr-odesa-2026-08-31",
      },
      {
        prefix: "/score/prestige-ru-pilot-520-20260901-c6d8e2/",
        accessGroupId: "prestige-ru-pilot-20260901",
      },
      {
        prefix: "/score/spoken-medspa-snellville-9d7f3a5c2e184b61/",
        accessGroupId: "spoken-medspa-snellville-2026-09-03",
      },
    ],
  );
  for (const entry of manifest.scoreProtectedPaths) {
    assert.match(entry.pinSalt, /^caesthetic:/);
    assert.match(entry.pinHash, /^[0-9a-f]{64}$/);
  }
  assert.deepEqual(manifest.scorePublicPaths, []);
  if (prestigePilot) {
    assert.match(prestigePilot, /data-report-kind="pilot"/);
    assert.match(prestigePilot, /noindex,nofollow,noarchive,nosnippet/);
  } else {
    const syncManifest = read("docs/projects/caesthetic/SYNC_MANIFEST.yml");
    assert.match(syncManifest, /site-caesthetic\/score\/prestige-ru-pilot-520-20260901-c6d8e2\/\*\*/);
  }
  assert.doesNotMatch(sitemap, /prestige-ru-pilot-520-20260901-c6d8e2/);
  assert.match(cutover, /SCORE_PROTECTED_PATHS/);
  assert.match(cutover, /SCORE_PUBLIC_PATHS/);
  assert.match(cutover, /select_cloudflare_auth/);
  assert.match(cutover, /CLOUDFLARE_API_TOKEN2:-.*CLOUDFLARE_API_TOKEN_BOTOTOX:-.*CLOUDFLARE_API_TOKEN:-.*CF_API_TOKEN:-/);
  assert.match(cutover, /CLOUDFLARE_GLOBAL_API_KEY/);
  assert.match(cutover, /X-Auth-Email/);
  assert.match(cutover, /X-Auth-Key/);
  assert.match(cutover, /auth_mode=\$\{CF_AUTH_MODE\}/);
  assert.doesNotMatch(cutover, /echo "\$\{?(?:tok|key|email)\}?"/);
});
test("DEC-829 excludes client score artifacts and protects canonical Growth Score authorities", () => {
  const manifest = read("docs/projects/caesthetic/SYNC_MANIFEST.yml");
  const sync = read("scripts/caesthetic/sync_agents_bidirectional.py");
  assert.match(manifest, /site-caesthetic\/score\/prestige-ru-preview-[^\n]+\/\*\*/);
  assert.match(sync, /"site-caesthetic\/score\/prestige-ru-preview-/);
  for (const privateArtifact of [
    "site-caesthetic/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/",
    "site-caesthetic/docs/website-studio/site-caesthetic-score-nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8.md",
    "site-caesthetic/score/prestige-ru-pilot-520-20260901-c6d8e2/",
    "site-caesthetic/docs/website-studio/site-caesthetic-score-prestige-ru-pilot-520-20260901-c6d8e2.md",
  ]) {
    const escaped = privateArtifact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(manifest, new RegExp(escaped));
    assert.match(sync, new RegExp(`"${escaped}`));
  }
  for (const authority of [
    "docs/ssot/CAESTHETIC.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md",
    "docs/caesthetic/growth_score_spec.md",
    "scripts/caesthetic/growth-score-report-template.mjs",
    "scripts/caesthetic/render-growth-score.mjs",
    "scripts/caesthetic/score-pin-runtime.mjs",
  ]) {
    assert.match(manifest, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(sync, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
