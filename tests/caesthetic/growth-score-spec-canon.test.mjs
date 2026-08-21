import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("detailed spec follows the current 13-section cockpit instead of the legacy block model", () => {
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const sections = [
    "Executive Overview",
    "Human-approved diagnosis",
    "Exactly Top 3 priorities",
    "Complete Remediation Plan",
    "Four-Surface score navigator",
    "Evidence drill-down",
    "Full Problem Inventory",
    "Do Not Fund Yet",
    "Four implementation paths",
    "Why CAESTHETIC / coordination burden",
    "Illustrative 30-day sequencing preview",
    "Optional Sprint CTA",
    "Methodology and limitations",
  ];

  let cursor = -1;
  for (const section of sections) {
    const next = spec.indexOf(`**${section}**`, cursor + 1);
    assert.ok(next > cursor, `${section} must appear in canonical cockpit order`);
    cursor = next;
  }

  assert.doesNotMatch(spec, /12 \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u0445|\u0411\u043b\u043e\u043a 10|Block 10|\u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0431\u043b\u043e\u043a\u043e\u0432 \u043d\u0435 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u0432\u043b\u044f\u0442\u044c/i);
  assert.doesNotMatch(spec, /The first two items above are what the 30-Day Sprint covers/i);
});
test("Free Score route, walkthrough and Mystery Shopper boundaries remain explicit", () => {
  const master = read("docs/ssot/CAESTHETIC.md");
  const spec = read("docs/caesthetic/growth_score_spec.md");
  const walkthrough = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md");

  assert.match(master, /\/score\/<unguessable-slug>\/.*outside the sitemap.*not password-gated/is);
  assert.match(master, /every `\/score\/` route remains `noindex` and outside the sitemap/i);
  assert.match(spec, /3\u20138 minute Valerie Petra walkthrough/);
  assert.match(spec, /metric\/evidence capability/);
  assert.match(spec, /not part of the standard Free Score research or spoken walkthrough/i);
  assert.match(walkthrough, /3\u20138 minutes/);
  assert.match(walkthrough, /must not:[\s\S]*Mystery Shopper as part of the Free Score/i);
});
