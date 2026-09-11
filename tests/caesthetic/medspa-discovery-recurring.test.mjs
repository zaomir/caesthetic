import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const py = spawnSync("python3", [path.join(repo, "tests/caesthetic/medspa_discovery_recurring.py")], {
  encoding: "utf8",
  cwd: repo,
});
assert.equal(py.status, 0, py.stderr || py.stdout);
assert.equal(JSON.parse(py.stdout).ok, true);

const publicIndex = JSON.parse(
  readFileSync(path.join(repo, "docs/ops/caesthetic-new-medspa-discovery/public-index.json"), "utf8"),
);
assert.equal(publicIndex.no_raw_emails, true);
assert.doesNotMatch(JSON.stringify(publicIndex), /@/);
