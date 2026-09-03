import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const read = (path) => readFileSync(resolve(SITE, path), 'utf8');

const home = read('index.html');
const score = read('growth-score/index.html');
const sprint = read('sprint/index.html');
const system = read('growth-system/index.html');
const about = read('about/index.html');
const support = read('support/index.html');
const privacyAlias = read('privacy/index.html');
const termsAlias = read('terms/index.html');
const header = read('templates/header.html');
const footer = read('templates/footer.html');
const sitemap = read('sitemap.xml');
const config = read('assets/js/caesthetic-config.js');
const pricingArtifact = read('assets/js/caesthetic-pricing.generated.js');

test('homepage publishes v2 positioning and canonical owner problems', () => {
  assert.match(home, /The growth operating system for independent aesthetic practices\./);
  for (const marker of [
    'The leads are coming in. Why are booked and attended appointments still low?',
    'Should I increase ad spend, or fix the website, booking path and follow-up first?',
    'People visit the website. Why are they not booking?',
    'Reach and followers are growing. Why is the appointment calendar not?',
    'How do I avoid paying for activity reports that cannot show what improved?',
  ]) assert.ok(home.includes(marker), `missing owner problem: ${marker}`);
});

test('Growth Score remains AI-assisted and human-verified', () => {
  assert.match(score, /AI-assisted, human-verified/i);
  assert.match(score, /AI handles evidence collection/i);
  assert.match(score, /A human verifies observable facts/i);
  assert.match(score, /At least 80% of published findings are Class A/i);
  assert.match(score, /All synthetic/i);
});

test('Sprint is diagnosis-led rather than a fixed package', () => {
  assert.match(sprint, /3–6 main constraints/i);
  assert.match(sprint, /1–5 longer-horizon processes/i);
  assert.match(sprint, /not quotas or a fixed package/i);
  assert.match(sprint, /data-cae-sprint-inquiry/);
  assert.match(sprint, /Request Sprint scope and payment instructions/i);
  assert.match(sprint, /Practice-specific scope and payment instructions are confirmed in writing before purchase/i);
  assert.doesNotMatch(sprint, /data-cae-checkout|Start Stripe Checkout|Request a secure payment link/i);
});

test('Growth System publishes economics v2.1 money layers and evidence lifecycle', () => {
  assert.match(system, /operating ownership—not a bank of hours, posts, campaigns, calls or tasks/i);
  for (const marker of [
    'Growth management and prioritization',
    'Measurement and attribution',
    'Client Growth Statement',
    'Conversion optimization',
    'Retention and reactivation',
    'Reputation operations',
    'Growth Budget management',
    'One active optimization cycle',
    'Fixed Management Fee',
    'Variable Growth Budget',
    'Committed Growth Budget',
    'Performance Fee',
    'verified positive growth',
    'signed client-specific Commercial Schedule',
    "Unused variable funds roll forward as the client's growth balance",
    'Shipped',
    'Adopted',
    'Impact',
    'Maturing',
  ]) assert.ok(system.includes(marker), `missing Growth System marker: ${marker}`);
  assert.match(system, /data-cae-growth-budget-model="management-inside-budget"/);
  assert.doesNotMatch(system, /\$1,500|Total Growth Allocation|\b10\s*%|10 percent|AGC share|performance cap/i);
});

test('Valerie Petra is the public identity without an invented LinkedIn URL', () => {
  assert.match(home, /Valerie Petra/);
  assert.match(about, /Valerie Petra/);
  assert.match(config, /name: "Valerie Petra"/);
  assert.match(config, /linkedin: ""/);
  assert.doesNotMatch(home + about + config, /Valeriia Petrova|valeriia-petrova-uk/i);
  assert.doesNotMatch(about, /"sameAs"/);
});

test('public contact identity is info@caesthetic.com', () => {
  const sources = [
    home,
    score,
    sprint,
    system,
    about,
    header,
    footer,
    read('legal/privacy/index.html'),
    read('legal/terms/index.html'),
    read('assets/js/caesthetic.js'),
    read('assets/js/growth.js'),
  ];
  assert.match(sources.join('\n'), /info@caesthetic\.com/);
  assert.doesNotMatch(sources.join('\n'), /team@caesthetic\.com|hello@caesthetic\.com|contact@caesthetic\.com/);
});

test('nav and sitemap expose Growth System', () => {
  assert.match(header, /href="\/growth-system\/"[^>]*data-nav="growth-system"/);
  assert.match(footer, /href="\/growth-system\/"/);
  assert.match(sitemap, /https:\/\/caesthetic\.com\/growth-system\//);
});

test('Customer Support publishes safe contact and legal details', () => {
  assert.match(support, /<html lang="en-US" data-page="support">/);
  assert.match(support, /<link rel="canonical" href="https:\/\/caesthetic\.com\/support\/">/);
  assert.match(support, /<h1 class="cae-h1">Customer Support<\/h1>/);
  assert.match(support, /mailto:info@caesthetic\.com/);
  assert.match(support, /We aim to respond within one business day/);
  assert.match(support, /OXFORD PROJECTS LTD/);
  assert.match(support, /Company number 16953799/);
  assert.match(support, /128 City Road, London, United Kingdom, EC1V 2NX/);
  for (const href of ['/legal/privacy/', '/legal/terms/', '/legal/cookies/']) {
    assert.ok(support.includes(`href="${href}"`), `missing support legal link: ${href}`);
  }
  assert.match(support, /Do not send patient information, medical records or protected health information \(PHI\)/);
  assert.match(support, /Do not send passwords, API keys or access credentials/);
  assert.match(support, /Do not send card details/);
  assert.doesNotMatch(support, /noindex|telephone|live chat|guaranteed response|guaranteed refund/i);
  assert.match(header, /href="\/support\/"[^>]*data-nav="support"/);
  assert.match(footer, /href="\/support\/"/);
  assert.match(sitemap, /https:\/\/caesthetic\.com\/support\//);
});

test('Stripe-facing legal aliases resolve to canonical policies and publish company identity', () => {
  assert.match(privacyAlias, /http-equiv="refresh" content="0; url=\/legal\/privacy\/"/);
  assert.match(privacyAlias, /rel="canonical" href="https:\/\/caesthetic\.com\/legal\/privacy\/"/);
  assert.match(termsAlias, /http-equiv="refresh" content="0; url=\/legal\/terms\/"/);
  assert.match(termsAlias, /rel="canonical" href="https:\/\/caesthetic\.com\/legal\/terms\/"/);
  for (const source of [privacyAlias, termsAlias, footer]) {
    assert.match(source, /OXFORD PROJECTS LTD/);
    assert.match(source, /16953799/);
    assert.match(source, /128 City Road, London, United Kingdom, EC1V 2NX/);
    assert.match(source, /info@caesthetic\.com/);
  }
  assert.match(privacyAlias + termsAlias, /noindex,follow/);
  assert.doesNotMatch(sitemap, /https:\/\/caesthetic\.com\/(?:privacy|terms)\//);
});

test('public pricing artifact contains only public product prices and client-specific recurring terms', () => {
  const sandbox = {};
  runInNewContext(pricingArtifact, sandbox);
  const pricingSource = read('src/config/pricing.ts');
  const score = Number(pricingSource.match(/growthScoreUsd:\s*([0-9.]+)/)[1]);
  const sprintPrice = Number(pricingSource.match(/growthSprintUsd:\s*([0-9.]+)/)[1]);
  assert.equal(sandbox.CAESTHETIC_PRICING.growthScoreUsd, score);
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintPriceUsd, sprintPrice);
  assert.equal(sandbox.CAESTHETIC_PRICING.growthScoreLabel, '$0');
  assert.equal(sandbox.CAESTHETIC_PRICING.sprintPriceLabel, '$2,500');
  assert.equal(sandbox.CAESTHETIC_PRICING.recurringCommercialTerms, 'client_specific');
  for (const forbiddenKey of [
    'sprintExtensionPriceUsd',
    'sprintExtensionPriceLabel',
    'growthSystemBaseMonthlyUsd',
    'growthSystemBaseMonthlyLabel',
    'agcShareTarget',
    'performanceCapMultiplier',
  ]) {
    assert.equal(forbiddenKey in sandbox.CAESTHETIC_PRICING, false, `public pricing leaked ${forbiddenKey}`);
  }
  assert.doesNotMatch(pricingSource, /sprintExtensionUsd|growthSystemBaseMonthlyUsd|agcShareTarget|performanceCapMultiplier/);
  assert.doesNotMatch(pricingArtifact, /\$1,500|Total Growth Allocation|\b10\s*%|performance.{0,20}cap/i);
});

test('Sprint CTA opens a scoped inquiry and never records a checkout start', () => {
  const growthJs = read('assets/js/growth.js');
  assert.match(growthJs, /function initSprintInquiry\(\)/);
  assert.match(growthJs, /data-cae-sprint-inquiry/);
  assert.match(growthJs, /data-cae-sprint-inquiry-state/);
  assert.match(growthJs, /track\("sprint_scope_requested"/);
  assert.match(growthJs, /Scope request — 30-Day Growth Sprint/);
  assert.doesNotMatch(growthJs, /data-cae-checkout|checkout_started|payment_link_requested/);
});
