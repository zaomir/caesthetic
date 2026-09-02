import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const js = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/growth-cockpit.js"), "utf8");
const css = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report-mobile.css"), "utf8");
const contract = fs.readFileSync(path.join(root, "docs/caesthetic/GROWTH_SCORE_MOBILE_DECISION_UI.md"), "utf8");

const orderedSections = [
  "gap-map",
  "focus-gaps",
  "sprint-fit",
  "repair-paths",
  "do-not-fund",
  "gap-inventory",
  "evidence-and-competitors",
  "scores-and-methodology",
  "next-step",
];

test("mobile decision UI keeps the canonical nine-section machine order", () => {
  assert.match(js, /growth-score-mobile-ui\/1\.0\.0/);
  orderedSections.forEach((id) => assert.match(js, new RegExp(`"${id}"`)));
  assert.match(contract, /one unnumbered Intro and exactly nine machine sections/i);
  assert.doesNotMatch(contract, /tenth section|10-section cockpit/i);
});

test("client-visible attribution and walkthrough cards are removed without weakening internal approval", () => {
  assert.match(js, /removeClientVisibleAttribution/);
  assert.match(js, /\.cae-report-walkthrough, \.cae-report-header__byline/);
  assert.match(js, /Amir/);
  assert.match(js, /Valerie Petra/);
  assert.match(contract, /Named-human approval remains mandatory and auditable/i);
  assert.match(contract, /Client HTML must not display/i);
  assert.match(contract, /walkthrough may remain a separate delivery artifact/i);
});

test("demand journey is evidence-aware and never assumes earlier stages are green", () => {
  assert.match(js, /demand_journey/);
  assert.match(js, /binding_constraint\?\.demand_stage/);
  assert.match(js, /diagnosis_state === "working"/);
  assert.match(js, /status: "unknown"/);
  assert.match(contract, /must never mark earlier stages green solely because they occur before the constraint/i);
  for (const status of ["strong", "friction", "constraint"]) {
    assert.match(css, new RegExp(`data-status="${status}"`));
  }
  assert.match(css, /--cae-mobile-unknown/);
});

test("presentation is mobile-first and progressively enhanced", () => {
  assert.match(css, /width:\s*min\(100% - 36px, 1120px\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(min-width: 900px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /document\.createElement\("details"\)/);
});

test("one commercial CTA appears only after Sprint Fit", () => {
  assert.match(js, /const gate = document\.getElementById\("sprint-fit"\)/);
  assert.match(js, /growth_score_sprint_cta_view/);
  assert.match(js, /\/sprint\//);
  assert.match(js, /\$2,500/);
  assert.match(contract, /CTA appears only after the reader reaches the 30-day feasibility section/i);
});

test("analytics payload is limited to non-PII context", () => {
  assert.match(js, /report_kind/);
  assert.match(js, /vertical_context/);
  assert.match(js, /report_locale/);
  assert.doesNotMatch(js, /practice_name\s*:/);
  assert.doesNotMatch(js, /reviewer_name\s*:/);
  assert.doesNotMatch(js, /email\s*:/);
});
