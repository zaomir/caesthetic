import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const read = (path) => readFileSync(resolve(REPO, path), "utf8");

const check = read("docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md");
const master = read("docs/ssot/CAESTHETIC.md");
const reportStandard = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md");
const reportSpec = read("docs/caesthetic/growth_score_spec.md");
const productionSop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
const journeyProfile = read("docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md");
const siteContract = read("site-caesthetic/README.md");

const COPY_ID = "check500-section/en-US/1.0.0";
const LOCKED_FIELDS = [
  "- **H2:** `Do all your enquiries make it to a booking?`",
  "- **Product line:** `Lead-to-Revenue Check · $500`",
  "- **Body:** `See what happens after a prospective patient contacts your practice — from the first response and follow-up to booking, consultation and payment — and find where enquiries may be getting lost.`",
  "- **CTA:** `Check My Lead-to-Revenue Path`",
  "- **Fine print:** `If you move directly into the next qualifying 30-Day Growth Sprint, your $500 Check fee is credited toward the $2,500 Sprint total.`",
];

test("Check500 SSOT locks the exact reusable English section", () => {
  assert.match(check, new RegExp(`copy_contract: ${COPY_ID.replaceAll("/", "\\/")}`));
  for (const field of LOCKED_FIELDS) assert.ok(check.includes(field), `missing locked field: ${field}`);
});

test("shared website and both Growth Score report contracts point to the same copy lock", () => {
  for (const [name, source] of [
    ["master", master],
    ["client report standard", reportStandard],
    ["detailed report spec", reportSpec],
    ["production SOP", productionSop],
    ["Journey Graph profile", journeyProfile],
    ["website contract", siteContract],
  ]) {
    assert.ok(source.includes(COPY_ID), `${name} must reference ${COPY_ID}`);
  }
});

test("canon keeps the universal recommendation separate from an internal-leak finding", () => {
  assert.match(check, /always recommended/i);
  assert.match(check, /do(?:es)? not state that a leak exists/i);
  assert.match(master, /does not itself prove an internal leak/i);
  assert.doesNotMatch(reportStandard, /Check when explicitly recommended, otherwise Sprint/i);
  assert.doesNotMatch(reportSpec, /"recommendation": "not_recommended"/);
});
