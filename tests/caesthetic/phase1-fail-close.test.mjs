#!/usr/bin/env node
/**
 * Lane C — CAESTHETIC Phase-1 student/VOC fail-close + banned-term tests.
 */
import { spawnSync } from "node:child_process";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  overrideEnabled,
  refuse,
  CODE,
  OVERRIDE_ENV,
} from "../../scripts/caesthetic/lib/phase1_fail_close.mjs";
import {
  scanText,
  BANNED_PATTERNS,
} from "../../scripts/guards/cae-phase1-banned-terms.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed += 1;
    console.error(`FAIL ${name}:`, e.message || e);
  }
};

check("override defaults off", () => {
  assert.equal(overrideEnabled({}), false);
  assert.equal(overrideEnabled({ [OVERRIDE_ENV]: "" }), false);
  assert.equal(overrideEnabled({ [OVERRIDE_ENV]: "0" }), false);
});

check("override accepts 1/true", () => {
  assert.equal(overrideEnabled({ [OVERRIDE_ENV]: "1" }), true);
  assert.equal(overrideEnabled({ [OVERRIDE_ENV]: "true" }), true);
});

check("refuse returns PHASE1_FAIL_CLOSE code 78", () => {
  const chunks = [];
  const code = refuse("test-entry", {
    stream: { write: (s) => chunks.push(s) },
  });
  assert.equal(code, 78);
  assert.match(chunks.join(""), new RegExp(CODE));
});

const pyScripts = [
  "scripts/caesthetic/render-ig-voc-batch.py",
  "scripts/caesthetic/seed-ig-students-w34.py",
  "scripts/outreach/cae_ig_voc_content_apify.py",
  "scripts/outreach/cae_ig_schools_students_apify.py",
  "scripts/outreach/cae_ig_two_base_expand.py",
  "scripts/outreach/cae_ig_two_base_rebuild.py",
];

for (const rel of pyScripts) {
  check(`fail-close ${rel}`, () => {
    const env = { ...process.env };
    delete env[OVERRIDE_ENV];
    const r = spawnSync("python3", [join(root, rel)], {
      env,
      encoding: "utf8",
      cwd: root,
    });
    assert.notEqual(r.status, 0, `${rel} must exit non-zero`);
    assert.match(`${r.stderr}\n${r.stdout}`, /PHASE1_FAIL_CLOSE/);
  });
}

check("fail-close sync-ig-voc-dropbox.sh", () => {
  const env = { ...process.env };
  delete env[OVERRIDE_ENV];
  const r = spawnSync("bash", [join(root, "scripts/caesthetic/sync-ig-voc-dropbox.sh")], {
    env,
    encoding: "utf8",
    cwd: root,
  });
  assert.equal(r.status, 78);
  assert.match(r.stderr, /PHASE1_FAIL_CLOSE/);
});

check("fail-close VOC publisher mjs", () => {
  const env = { ...process.env };
  delete env[OVERRIDE_ENV];
  const r = spawnSync(
    process.execPath,
    [
      join(
        root,
        "services/social-browser-operator/scripts/run-cae-publish-voc-meta-carousel-833304152.mjs"
      ),
    ],
    { env, encoding: "utf8", cwd: root }
  );
  assert.equal(r.status, 78);
  assert.match(r.stderr, /PHASE1_FAIL_CLOSE/);
});

check("fail-close fill-and-follow mjs", () => {
  const env = { ...process.env };
  delete env[OVERRIDE_ENV];
  const r = spawnSync(
    process.execPath,
    [
      join(
        root,
        "services/social-browser-operator/scripts/run-cae-ig-fill-and-follow-833304152.mjs"
      ),
    ],
    { env, encoding: "utf8", cwd: root }
  );
  assert.equal(r.status, 78);
  assert.match(r.stderr, /PHASE1_FAIL_CLOSE/);
});

check("banned terms catch Comment FIRST / VOC / academy", () => {
  assert.ok(BANNED_PATTERNS.length >= 8);
  const hits = scanText(
    "Comment FIRST for the checklist. COPY-VOC-021 post-academy aesthetic academy students. Guaranteed results."
  );
  const ids = new Set(hits.map((h) => h.id));
  assert.ok(ids.has("comment_first"));
  assert.ok(ids.has("copy_voc"));
  assert.ok(ids.has("guaranteed_results"));
});

check("banned terms allow clean Phase-1 Growth Score copy", () => {
  const hits = scanText(
    "Get your free Growth Score. We review Search, Website, Social, and Reviews for US aesthetic practices."
  );
  assert.equal(hits.length, 0);
});

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nAll phase1-fail-close tests passed");
