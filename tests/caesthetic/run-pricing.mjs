#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const TESTS = [
  "tests/caesthetic/pricing-formula.test.mjs",
  "tests/caesthetic/pricing-hardcode-guard.test.mjs",
  "tests/caesthetic/pricing-compliance.test.mjs",
  "tests/caesthetic/growth-economics-engine.test.mjs",
];

const result = spawnSync(
  process.execPath,
  [
    "--experimental-strip-types",
    "--test",
    "--test-reporter=spec",
    ...TESTS,
  ],
  {
    cwd: REPO,
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
if (result.signal) {
  console.error(`CAESTHETIC pricing QA terminated by ${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
