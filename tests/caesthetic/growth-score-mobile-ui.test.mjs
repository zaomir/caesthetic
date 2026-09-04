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
const renderer = fs.readFileSync(path.join(root, "scripts/caesthetic/render-growth-score.mjs"), "utf8");

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
  assert.match(js, /growth-score-mobile-ui\/1\.1\.6/);
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

test("demand journey remains machine data and is absent from the client UI", () => {
  assert.match(renderer, /binding_constraint\.demand_stage must be discovery\|trust\|enquiry\|booking\|treatment/);
  assert.doesNotMatch(renderer, /class="cae-report-demand/);
  assert.doesNotMatch(js, /rebuildDemandJourney|\.cae-report-demand|demand_journey/);
  assert.doesNotMatch(css, /\.cae-report-demand|\.cae-mobile-demand/);
  assert.doesNotMatch(reportCss, /\.cae-report-demand/);
  assert.match(contract, /not rendered as a client-visible section/i);
});

test("presentation is mobile-first and progressively enhanced", () => {
  assert.match(css, /width:\s*min\(100% - 36px, 1120px\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(min-width: 900px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /const currentSectionIndex = \(\) =>/);
  assert.match(js, /const readingLine = viewportTop \+ \(\(viewportBottom - viewportTop\) \* 0\.4\)/);
  assert.match(js, /window\.addEventListener\("scroll", scheduleProgressUpdate, \{ passive: true \}\)/);
  assert.match(js, /index === currentIndex/);
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
  assert.match(renderer, /data-cae-\$\{kind\}-inquiry/);
  assert.match(renderer, /\$2,500/);
  assert.match(contract, /CTA appears only after the reader reaches the 30-day feasibility section/i);
});

test("Multi-Location keeps its network decision story and one package CTA", () => {
  assert.match(js, /function isNetworkParent/);
  assert.match(js, /function isFocusLocationChild/);
  assert.match(js, /if \(isNetworkParent\(\)\) return;/);
  assert.match(js, /if \(isFocusLocationChild\(\)\)/);
  assert.match(js, /sticky\?\.remove\(\)/);
  assert.match(js, /root\.dataset\.packageRole/);
});

test("regular controls keep the 44px target after demand journey removal", () => {
  assert.match(js, /growth-report-mobile\.css\?v=1\.1\.6/);
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

test("report sharing uses the native mobile sheet with a clean-link fallback", () => {
  assert.match(renderer, /reportShareHtml\(report, "start"\)/);
  assert.match(renderer, /reportShareHtml\(report, "end"\)/);
  assert.match(js, /typeof navigator\.share === "function"/);
  assert.match(js, /await navigator\.share\(shareData\)/);
  assert.match(js, /navigator\.clipboard\?\.writeText/);
  assert.match(js, /url\.hash = ""/);
  assert.match(reportCss, /\.cae-report-share__button[\s\S]*?width:\s*100%[\s\S]*?min-height:\s*52px/);
  assert.match(contract, /one native share button near the beginning and one after the final report content/i);
});
