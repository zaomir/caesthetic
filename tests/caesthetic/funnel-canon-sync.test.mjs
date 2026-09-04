import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("Growth Score keeps two required stages and optional enrichment after success", async () => {
  const html = await read("site-caesthetic/growth-score/index.html");

  assert.match(html, /data-cae-score-form/);
  assert.match(html, /data-cae-multistage-score-form/);
  assert.match(html, /data-cae-score-stage="1"/);
  assert.match(html, /data-cae-score-stage="2"/);
  assert.match(html, /data-cae-score-stage="3"/);
  assert.match(html, /data-cae-contact-continue/);
  assert.match(html, /data-cae-required-submit/);
  assert.match(html, /data-cae-optional-skip/);
  assert.match(html, /Thank you — this is enough for us to start\./);

  for (const field of ["name", "email", "practice_name", "city_state"]) {
    assert.match(html, new RegExp(`name="${field}"[^>]*required|required[^>]*name="${field}"`));
  }

  assert.doesNotMatch(html, /data-cae-request/);
  assert.doesNotMatch(html, /The Check is always available/i);
});

test("Growth Score report commercial routing stays renderer-owned and follows the current Check500 contract", async () => {
  const config = await read("site-caesthetic/assets/js/caesthetic-config.js");
  const renderer = await read("scripts/caesthetic/render-growth-score.mjs");
  const template = await read("scripts/caesthetic/growth-score-report-template.mjs");
  const standard = await read("docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md");
  const check = await read("docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md");

  assert.doesNotMatch(config, /document\.documentElement\.getAttribute\("data-page"\)[\s\S]{0,240}growth-score-report/);
  assert.match(config, /report commercial routing is renderer-owned/i);
  assert.match(renderer, /CHECK500_COPY_CONTRACT/);
  assert.match(renderer, /CHECK500_STYLE_CONTRACT/);
  assert.match(template, /check500-section\/en-US\/1\.0\.0/);
  assert.match(template, /check500-style\/1\.0\.0/);
  assert.match(renderer, /Check My Lead-to-Revenue Path/);
  assert.match(template, /recommendation: "not_recommended"/);
  assert.match(standard, /exactly two always-visible Check500 placements/i);
  assert.match(check, /check500-two-placement\/1\.0\.0/);
});

test("generic request modal does not intercept Growth Score intake", async () => {
  const js = await read("site-caesthetic/assets/js/caesthetic.js");
  const currentModalBlock = js.slice(js.indexOf("function initRequestModal()"), js.indexOf("function initRatingBars()"));
  assert.ok(currentModalBlock, "request modal block not found");
  assert.doesNotMatch(currentModalBlock, /data-cae-score-form|data-cae-salon-score-form|href="\/growth-score\/"/);
});
