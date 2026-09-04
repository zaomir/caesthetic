import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const read = (path) => readFileSync(resolve(REPO, path), "utf8");

const master = read("docs/ssot/CAESTHETIC.md");
const reportStandard = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md");
const reportSpec = read("docs/caesthetic/growth_score_spec.md");
const productionSop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
const check = read("docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md");
const growthSystem = read("docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md");

const CONTRACT = "caesthetic-4444-commercial-core/1.0.0";

test("4444 is the shared primary commercial product contract", () => {
  for (const [name, source] of [
    ["master", master],
    ["client report standard", reportStandard],
    ["detailed report spec", reportSpec],
    ["production SOP", productionSop],
    ["Lead-to-Revenue Check", check],
    ["Growth System operating model", growthSystem],
  ]) {
    assert.ok(source.includes(CONTRACT), `${name} must reference ${CONTRACT}`);
  }

  assert.match(master, /4444 is the primary CAESTHETIC product/i);
  assert.match(master, /30-Day Growth Sprint — \$2,500/i);
  assert.match(master, /precise long-tail queries that express clearer booking intent/i);
  assert.match(master, /compliant system for increasing honest review participation/i);
});

test("Growth Score and Sprint lead the client into the approved 4444 priority", () => {
  assert.match(reportStandard, /primary commercial recommendation is to implement the approved 4444 priority/i);
  assert.match(reportStandard, /primary paid action is the \*\*30-Day Growth Sprint — \$2,500\*\*/i);
  assert.match(reportSpec, /primary CAESTHETIC action is the `\$2,500` Sprint to implement the approved 4444 priority/i);
  assert.match(productionSop, /Sprint CTA to implement the approved 4444 priority/i);
});

test("Check500 and technical fixes remain secondary while continuation maintains 4444", () => {
  assert.match(check, /4444 remains the primary CAESTHETIC product/i);
  assert.match(check, /Check is a secondary way to understand the post-enquiry path/i);
  assert.match(reportStandard, /not the center of the commercial story/i);
  assert.match(growthSystem, /optional continuation of the 4444 product/i);
  assert.match(growthSystem, /increasing honest review participation/i);
  assert.match(growthSystem, /repeatedly verify Four-Surface consistency/i);
});
