import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SITE = resolve(REPO, "site-caesthetic");
const PUBLIC_PRICING_KEYS = [
  "growthScoreLabel",
  "growthScoreUsd",
  "recurringCommercialTerms",
  "sprintPriceLabel",
  "sprintPriceUsd",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("public pricing copy consumes finite product values and keeps recurring terms client-specific", () => {
  const pricingPage = readFileSync(resolve(SITE, "pricing/index.html"), "utf8");
  const generated = readFileSync(resolve(SITE, "assets/js/caesthetic-pricing.generated.js"), "utf8");
  const sandbox = {};
  runInNewContext(generated, sandbox);

  assert.deepEqual(Object.keys(sandbox.CAESTHETIC_PRICING).sort(), PUBLIC_PRICING_KEYS);
  assert.equal(sandbox.CAESTHETIC_PRICING.recurringCommercialTerms, "client_specific");
  assert.doesNotMatch(
    generated,
    /sprintExtensionPrice|growthSystemBaseMonthly|agcShareTarget|performanceCapMultiplier/,
  );

  assert.match(
    pricingPage,
    new RegExp(`data-cae-score-price>${escapeRegex(sandbox.CAESTHETIC_PRICING.growthScoreLabel)}<`),
  );
  assert.match(
    pricingPage,
    new RegExp(`data-cae-sprint-price>${escapeRegex(sandbox.CAESTHETIC_PRICING.sprintPriceLabel)}<`),
  );
  assert.match(pricingPage, /data-cae-growth-budget-model="management-inside-budget">Client-specific</);
  assert.match(pricingPage, /Growth Budget includes the Fixed Management Fee/i);
  assert.match(pricingPage, /Performance Fee may be activated only through a signed client-specific Commercial Schedule/i);
  assert.doesNotMatch(pricingPage, /data-cae-system-base-price/);
  assert.doesNotMatch(pricingPage, /Sprint Extension/i);
  assert.doesNotMatch(pricingPage, /\b10\s*%|\$1,500|\$3,000/i);
});
