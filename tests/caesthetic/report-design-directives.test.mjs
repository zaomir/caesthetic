import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("../..", import.meta.url).pathname);
const renderer = readFileSync(resolve(root, "scripts/caesthetic/render-growth-score.mjs"), "utf8");
const css = readFileSync(resolve(root, "site-caesthetic/assets/css/growth-report-base.css"), "utf8");
const report = readFileSync(resolve(root, "site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/index.html"), "utf8");
const image = resolve(root, "site-caesthetic/assets/img/growth-score/lead-to-revenue-map.png");

test("Spoken report uses the approved Lead-to-Revenue image instead of Cross-Surface overview", () => {
  assert.equal(existsSync(image), true);
  assert.match(report, /lead-to-revenue-map\.png/);
  assert.doesNotMatch(report, /Cross-Surface Connections Overview/i);
  assert.match(renderer, /lead-to-revenue-map\.png/);
});

test("report support cards are equal-height and Check500 is visible", () => {
  assert.match(report, /cae-report-hero__support-grid/);
  assert.match(report, /What already works/);
  assert.match(report, /Fix first/);
  assert.match(css, /\.cae-report-hero__support-grid[\s\S]*align-items:\s*stretch/);
  assert.match(css, /\.cae-report-hero__support-grid\s*>\s*\.cae-report-state[\s\S]*height:\s*100%/);
  assert.match(report, /Lead-to-Revenue Check[\s\S]*\$500/);
});

test("report keeps typography and spacing directives", () => {
  assert.match(css, /--cae-report-type-small:\s*0\.875rem/);
  assert.match(css, /--cae-report-type-body:\s*1\.125rem/);
  assert.match(css, /--cae-report-type-heading:/);
  assert.match(css, /cae-report-method__grid[\s\S]*padding:\s*clamp/);
  assert.match(css, /cae-report-market-gap[\s\S]*padding:\s*clamp/);
  assert.doesNotMatch(report, /Evidence:\s*(?:website|social|search|reputation)\./i);
});
