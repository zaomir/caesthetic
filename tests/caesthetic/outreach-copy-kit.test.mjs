import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const KIT = resolve(REPO, "docs/copy/caesthetic/en/outreach");

test("CAESTHETIC outreach copy kit remains structurally and policy valid", () => {
  const result = spawnSync("python3", [resolve(KIT, "validate_outreach_kit.py")], {
    cwd: REPO,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /^PASS:/);

  const library = readFileSync(resolve(KIT, "CAESTHETIC_OUTREACH_MESSAGE_LIBRARY.md"), "utf8");
  assert.match(library, /draft_not_sent/);
  assert.doesNotMatch(library, /\$2,400|48-hour|Initial partner InMail sent 2026-08-20/);
});

