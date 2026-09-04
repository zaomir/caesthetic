import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const js = fs.readFileSync(path.join(root, "site-caesthetic/assets/js/growth-cockpit.js"), "utf8");
const css = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report-mobile.css"), "utf8");
const reportCss = fs.readFileSync(path.join(root, "site-caesthetic/assets/css/growth-report.css"), "utf8");
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
  assert.match(js, /growth-score-mobile-ui\/1\.1\.3/);
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
  assert.match(reportCss, /\.cae-journey-graph__canvas--desktop\s*\{\s*display:\s*none;/);
  assert.match(reportCss, /\.cae-journey-graph__mobile\s*\{\s*display:\s*block;/);
  assert.match(reportCss, /data-mobile-primary-journey|\.cae-journey-graph__mobile/);
  assert.match(reportCss, /\.cae-lead-revenue ol\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(reportCss, /\.cae-journey-graph__edge summary\s*\{\s*min-height:\s*44px;/);
});

test("one commercial CTA appears only after Sprint Fit", () => {
  assert.match(js, /const gate = document\.getElementById\("sprint-fit"\)/);
  assert.match(js, /growth_score_sprint_cta_view/);
  assert.match(js, /\/sprint\//);
  assert.match(js, /\$2,500/);
  assert.match(contract, /CTA appears only after the reader reaches the 30-day feasibility section/i);
});

test("Multi-Location keeps its network decision story and one package CTA", () => {
  assert.match(js, /function isNetworkParent/);
  assert.match(js, /function isFocusLocationChild/);
  assert.match(js, /if \(isNetworkParent\(\)\) return;/);
  assert.match(js, /if \(isNetworkParent\(\) \|\| isFocusLocationChild\(\)\) return;/);
  assert.match(js, /sticky\?\.remove\(\)/);
  assert.match(js, /root\.dataset\.packageRole/);
});

test("Demand Journey copy remains separated and regular controls meet the 44px target", () => {
  const demandListRule = css.match(/\.cae-score-report--mobile-story \.cae-report-demand ol\s*\{[\s\S]*?\}/)?.[0] || "";
  const demandStageRule = css.match(/\.cae-score-report--mobile-story \.cae-report-demand__stage\s*\{[\s\S]*?\}/)?.[0] || "";
  const desktopDemandRules = css.match(/@media \(min-width: 900px\)\s*\{[\s\S]*?@media \(max-width: 520px\)/)?.[0] || "";

  assert.match(css, /\.cae-score-report--mobile-story \.cae-report-demand__stage > \.cae-mobile-demand-copy\s*\{[\s\S]*?display:\s*grid/);
  assert.match(demandListRule, /grid-template-columns:\s*1fr/);
  assert.match(demandStageRule, /height:\s*auto/);
  assert.match(css, /\.cae-score-report--mobile-story \.cae-report-demand__stage \+ \.cae-report-demand__stage\s*\{[\s\S]*?margin-top:\s*0/);
  assert.match(desktopDemandRules, /\.cae-score-report--mobile-story \.cae-report-demand ol\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopDemandRules, /\.cae-score-report--mobile-story \.cae-report-demand__stage\s*\{[\s\S]*?height:\s*auto/);
  assert.match(js, /growth-report-mobile\.css\?v=1\.1\.3/);
  assert.match(css, /\.cae-mobile-report-nav__brand\s*\{[\s\S]*?min-height:\s*44px/);
  assert.doesNotMatch(css, /min-height:\s*42px/);
  assert.match(js, /evidenceCountLabel/);
  assert.match(js, /inventoryMonitor/);
});

test("analytics payload is limited to non-PII context", () => {
  assert.match(js, /report_kind/);
  assert.match(js, /vertical_context/);
  assert.match(js, /report_locale/);
  assert.doesNotMatch(js, /practice_name\s*:/);
  assert.doesNotMatch(js, /reviewer_name\s*:/);
  assert.doesNotMatch(js, /email\s*:/);
});
