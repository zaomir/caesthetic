import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ssot = readFileSync(new URL("../../docs/ssot/CAESTHETIC_REEL_AUTOMATION.md", import.meta.url), "utf8");
const dec = readFileSync(new URL("../../docs/founder-notes/DEC-854.md", import.meta.url), "utf8");
const reading = readFileSync(new URL("../../docs/READING_ORDER.md", import.meta.url), "utf8");
const index = readFileSync(new URL("../../docs/ssot/INDEX.md", import.meta.url), "utf8");

test("reel automation SSOT is the agent answer surface", () => {
  assert.match(ssot, /## 0\. Agent answer card/);
  assert.match(ssot, /voice `lxYfHSkYm1EzQzGhdbfc`/);
  assert.match(ssot, /VPS2402/);
  assert.match(ssot, /ELEVENLABS_API_KEY/);
  assert.match(ssot, /provisioned 2026-08-26/);
  assert.match(ssot, /approved_for_production/);
  assert.match(ssot, /approved_publish/);
  assert.match(ssot, /Do not reactivate DEC-831/);
  assert.match(ssot, /Factory stays \*\*on hold\*\*/);
});

test("DEC-854 points at the automation SSOT and does not unfreeze V3", () => {
  assert.match(dec, /CAESTHETIC_REEL_AUTOMATION\.md/);
  assert.match(dec, /does \*\*not\*\* amend V3\.3/);
  assert.match(dec, /DEC-831 Template Factory stays on hold/);
});

test("index and reading order discover the automation SSOT", () => {
  assert.match(index, /CAESTHETIC_REEL_AUTOMATION\.md/);
  assert.match(reading, /CAESTHETIC_REEL_AUTOMATION\.md/);
});
