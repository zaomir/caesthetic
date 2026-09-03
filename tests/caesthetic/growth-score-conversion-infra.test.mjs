import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SITE = resolve(REPO, "site-caesthetic");
const analytics = readFileSync(resolve(SITE, "assets/js/analytics.js"), "utf8");
const growth = readFileSync(resolve(SITE, "assets/js/growth.js"), "utf8");
const sprint = readFileSync(resolve(SITE, "sprint/index.html"), "utf8");
const intake = readFileSync(resolve(SITE, "growth-score/index.html"), "utf8");
const check = readFileSync(resolve(SITE, "lead-to-revenue-check/index.html"), "utf8");
const pricing = readFileSync(resolve(SITE, "pricing/index.html"), "utf8");
const footer = readFileSync(resolve(SITE, "templates/footer.html"), "utf8");
const sitemap = readFileSync(resolve(SITE, "sitemap.xml"), "utf8");
const payment = readFileSync(resolve(SITE, "pay/index.html"), "utf8");
const css = readFileSync(resolve(SITE, "assets/css/growth.css"), "utf8");
const ef = readFileSync(resolve(REPO, "supabase/functions/submit-caesthetic-growth-score/index.ts"), "utf8");
const generated = readFileSync(resolve(SITE, "assets/js/caesthetic-pricing.generated.js"), "utf8");
const pricingTs = readFileSync(resolve(SITE, "src/config/pricing.ts"), "utf8");

test("conversion analytics emit the canonical funnel events plus UTM persistence", () => {
  for (const eventName of [
    "score_request_submitted",
    "score_page_viewed",
    "sprint_page_viewed",
    "sprint_scope_requested",
    "lead_to_revenue_check_page_viewed",
    "lead_to_revenue_check_scope_requested",
    "page_view",
  ]) {
    assert.match(analytics + growth, new RegExp(`["']${eventName}["']`));
  }
  assert.match(analytics, /path\.indexOf\("\/growth-score\/"\) === 0/);
  assert.match(analytics, /path\.indexOf\("\/sprint\/"\) === 0/);
  assert.match(analytics, /path\.indexOf\("\/lead-to-revenue-check\/"\) === 0/);
  assert.match(analytics, /STORAGE_KEY = "caesthetic_utm"/);
  assert.match(growth, /utm_source: utm\.utm_source/);
  assert.match(growth, /referrer: document\.referrer/);
});

test("GA4 uses Advanced Consent Mode with denied storage by default", () => {
  assert.match(analytics, /CONSENT_KEY = "caesthetic_analytics_consent"/);
  assert.match(analytics, /setGoogleConsentDefault\(consent === "granted" \? "granted" : "denied"\)/);
  assert.match(analytics, /if \(c\.ga4MeasurementId\) loadGa4\(c\.ga4MeasurementId\)/);
  assert.match(analytics, /window\.gtag\("consent", "default"/);
  assert.match(analytics, /window\.gtag\("consent", "update"/);
  assert.match(analytics, /send_page_view: false/);
  assert.match(analytics, /data-cae-consent-accept/);
  assert.match(analytics, /data-cae-consent-reject/);
  assert.match(analytics, /ad_storage: "denied"/);
  assert.match(analytics, /ad_personalization: "denied"/);
});

test("Sprint public path does not invent Stripe checkout", () => {
  assert.match(sprint, /data-cae-sprint-inquiry/);
  assert.match(sprint, /data-cae-sprint-price/);
  assert.doesNotMatch(sprint, /style=/);
  assert.doesNotMatch(sprint + growth, /stripe|checkout\.session|payment_link|data-cae-checkout/i);
});

test("canonical Sprint price is generated from pricing.ts", () => {
  const sandbox = {};
  runInNewContext(generated, sandbox);
  assert.match(pricingTs, /growthSprintUsd: 2500/);
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintPriceUsd, 2500);
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintPriceLabel, "$2,500");
  assert.match(sprint, /data-cae-sprint-price>\$2,500</);
});

test("Lead-to-Revenue Check has one canonical, fixed-price and safely routed public contract", () => {
  const sandbox = {};
  runInNewContext(generated, sandbox);
  assert.match(pricingTs, /leadToRevenueCheckUsd: 500/);
  assert.equal(sandbox.CAESTHETIC_PRICING.leadToRevenueCheckUsd, 500);
  assert.equal(sandbox.CAESTHETIC_PRICING.leadToRevenueCheckLabel, "$500");
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintAfterCheckBalanceUsd, 2000);
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintAfterCheckBalanceLabel, "$2,000");
  assert.match(check, /data-page="lead-to-revenue-check"/);
  assert.match(check, /rel="canonical" href="https:\/\/caesthetic\.com\/lead-to-revenue-check\/"/);
  assert.match(check, /data-cae-check-price>\$500</);
  assert.match(check, /data-cae-sprint-after-check-balance>\$2,000</);
  assert.match(check, /data-cae-check-inquiry/);
  assert.equal((check.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(check, /\sstyle=/);
  assert.match(pricing, /href="\/lead-to-revenue-check\/"/);
  assert.match(footer, /href="\/lead-to-revenue-check\/"/);
  assert.match(sitemap, /https:\/\/caesthetic\.com\/lead-to-revenue-check\//);
  assert.match(payment, /lead_to_revenue_check: 'CAESTHETIC Lead-to-Revenue Check'/);
  assert.match(payment, /productLabels\[data\.product_code\]/);
});

test("intake remains three-stage, skippable, and free of revenue/PHI/credential gates", () => {
  assert.match(intake, /data-cae-score-stage="1"/);
  assert.match(intake, /data-cae-score-stage="2"/);
  assert.match(intake, /data-cae-score-stage="3"/);
  assert.match(intake, /data-cae-optional-skip/);
  const fieldNames = [...intake.matchAll(/\bname="([^"]+)"/gi)].map((match) => match[1].toLowerCase());
  for (const forbidden of ["revenue", "budget", "phi", "credentials", "password", "ssn"]) {
    assert.equal(fieldNames.includes(forbidden), false, `forbidden field ${forbidden}`);
  }
});

test("mobile intake uses 16px fields, 48px tap targets and stacked actions", () => {
  assert.match(css, /font-size: var\(--cae-text-base\)/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /\.cae-score-intake__actions \.cae-btn \{ width: 100%/);
});

test("submit function creates an owner_intake score case after required capture", () => {
  assert.match(ef, /ensureScoreCase/);
  assert.match(ef, /caesthetic_score_cases/);
  assert.match(ef, /source_kind: "owner_intake"/);
  assert.match(ef, /qa_marker === true/);
});
