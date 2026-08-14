import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SITE = resolve(REPO, "site-caesthetic");
const read = (path) => readFileSync(resolve(SITE, path), "utf8");
const readRepo = (path) => readFileSync(resolve(REPO, path), "utf8");

test("homepage uses v2 positioning, audience and Valerie Petra identity", () => {
  const home = read("index.html");
  const about = read("about/index.html");
  assert.match(home, /<h1[^>]*>The growth operating system for independent aesthetic practices\.<\/h1>/);
  assert.match(home, /independent injectors, aesthetic doctors, and small med spas in the United States/i);
  assert.match(home, /Valerie Petra/);
  assert.match(about, /Valerie Petra/);
  assert.doesNotMatch(home + about, /Valeriia Petrova|valeriia-petrova-uk/i);
});

test("Growth Score states AI-assisted, human-verified evidence boundaries without SLA", () => {
  const score = read("growth-score/index.html");
  assert.match(score, /AI-assisted, human-verified/i);
  assert.match(score, /primarily on observable Class A evidence/i);
  assert.match(score, /Class B assumptions/i);
  assert.doesNotMatch(score, /5 business days|5-day/i);
});

test("Growth System publishes ownership, economics v2.1 and maturity canon", () => {
  const system = read("growth-system/index.html");
  assert.match(system, /recurring operating ownership/i);
  assert.match(system, /data-cae-growth-budget-model="management-inside-budget"/);
  assert.match(system, /Fixed Management Fee[\s\S]*inside the Growth Budget/i);
  assert.match(system, /Variable Growth Budget/i);
  assert.match(system, /Committed Growth Budget/i);
  assert.match(system, /Performance Fee[\s\S]*verified positive growth[\s\S]*legal review[\s\S]*signed rider/i);
  assert.match(system, /Unused variable funds roll forward as the client's growth balance/i);
  assert.match(system, /Shipped → Adopted → Impact → Maturing/);
  assert.doesNotMatch(system, /data-cae-system-base-price|\$1,500|Total Growth Allocation|\b10\s*%|\$3,000|AGC share|performance cap/i);
});

test("all public commercial surfaces omit superseded recurring defaults", () => {
  const publicCommercialCopy = [
    "index.html",
    "sprint/index.html",
    "growth-system/index.html",
    "pricing/index.html",
    "assets/js/caesthetic-pricing.generated.js",
    "assets/js/growth.js",
  ].map(read).join("\n");
  const pricing = read("pricing/index.html");
  assert.doesNotMatch(publicCommercialCopy, /\$1,500|Total Growth Allocation|growthSystemBaseMonthly|AGC share/i);
  assert.doesNotMatch(publicCommercialCopy, /(?:Performance Fee|performance compensation)[^\n.]{0,120}\b\d+(?:\.\d+)?\s*%/i);
  assert.doesNotMatch(publicCommercialCopy, /\b(?:Performance Fee|performance compensation) cap\b[^\n.]{0,60}(?:\$\s*\d|\d+(?:\.\d+)?\s*[×x])/i);
  assert.match(pricing, /no percentage, cap or availability is advertised as a public default/i);
});

test("legal copy does not claim active analytics and prohibits replay", () => {
  const privacy = read("legal/privacy/index.html");
  const cookies = read("legal/cookies/index.html");
  assert.match(privacy, /only if an approved measurement configuration is enabled/i);
  assert.match(cookies, /does not represent Google Analytics 4, Meta Pixel.*as active/is);
  assert.match(cookies, /does not use session replay/i);
});

test("restored pricing and cookie notice are not intercepted by legacy edge redirects", () => {
  const router = readRepo("infra/cloudflare/router/src/index.ts");
  assert.doesNotMatch(router, /['"]\/pricing\/['"]\s*:\s*['"]\/sprint\/['"]/);
  assert.doesNotMatch(router, /['"]\/legal\/cookies\/['"]\s*:\s*['"]\/legal\/privacy\/['"]/);
});

test("evidence panels can shrink and wrap on 320px score reports", () => {
  const css = read("assets/css/caesthetic.css");
  const growthCss = read("assets/css/growth.css");
  assert.match(css, /\.cae-panel\s*\{[^}]*min-width:\s*0;/s);
  assert.match(css, /\.cae-panel p\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  assert.match(growthCss, /\.cae-diagnosis\s*>\s*\*\s*\{[^}]*min-width:\s*0;/s);
  assert.match(growthCss, /\.cae-diagnosis \.cae-disclaimer\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
});

test("all primary public surfaces use info email and canonical brand assets", () => {
  const publicCopy = [
    "index.html", "growth-score/index.html", "sprint/index.html", "growth-system/index.html",
    "pricing/index.html", "about/index.html", "legal/privacy/index.html", "legal/terms/index.html",
    "legal/cookies/index.html", "templates/header.html", "templates/footer.html",
  ].map(read).join("\n");
  assert.doesNotMatch(publicCopy, /team@caesthetic\.com/i);
  assert.doesNotMatch(publicCopy, /valeriia-petrova-uk|Valeriia Petrova/i);
  assert.match(publicCopy, /info@caesthetic\.com/i);
  assert.match(publicCopy, /assets\/brand\/logo-square/);
});
