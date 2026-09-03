import assert from "node:assert/strict";
import test from "node:test";
import {
  DECISION_VIEWS_ARTIFACT_VERSION,
  scoreGrowthReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";
import {
  createDecisionViewsFixture,
  createV5Report,
} from "./helpers/growth-score-v5-fixture.mjs";

const clone = (value) => structuredClone(value);

test("five decision views derive from existing evidence without changing Four-Surface scores or Overall", () => {
  const base = scoreGrowthReport(createV5Report());
  const result = scoreGrowthReport(createV5Report(undefined, { decisionViews: createDecisionViewsFixture() }));

  assert.equal(result.decisionViews.artifact_version, DECISION_VIEWS_ARTIFACT_VERSION);
  assert.deepEqual(result.surfaces, base.surfaces);
  assert.deepEqual(result.crossSurface, base.crossSurface);
  assert.deepEqual(result.overall, base.overall);
  assert.equal(Object.keys(result.surfaces).length, 4);
  assert.equal(result.decisionViews.treatment_opportunity_matrix.items.length, 1);
  assert.equal(result.decisionViews.provider_visibility_map.items.length, 1);
  assert.equal(result.decisionViews.trust_chain.items[0].status, "broken");
  assert.equal(result.decisionViews.patient_friction_index.items[0].status, "broken");
  assert.equal(result.decisionViews.patient_friction_index.items[0].coverage_status, "complete");
  assert.equal(result.decisionViews.do_not_promote_yet_by_treatment.items[0].decision, "do_not_promote_yet");
  assert.equal("score" in result.decisionViews.patient_friction_index.items[0], false);
});

test("decision views fail closed on automation, unsupported evidence, inference and approval", () => {
  for (const field of [
    "automatic_score_change",
    "automatic_binding_constraint_selection",
    "automatic_focus_selection",
    "automatic_promotion_decision",
  ]) {
    const decisionViews = createDecisionViewsFixture({ [field]: true });
    assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews })), new RegExp(`decisionViews\\.${field} must be false`));
  }

  const unknownEvidence = createDecisionViewsFixture();
  unknownEvidence.treatments[0].surfaces.search.evidence_refs = ["linkedin.profile"];
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews: unknownEvidence })), /unknown evidence reference linkedin\.profile/);

  const inferenceWithoutMethod = createDecisionViewsFixture();
  delete inferenceWithoutMethod.treatments[0].surfaces.website.method;
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews: inferenceWithoutMethod })), /\.method/);

  const pendingReview = createDecisionViewsFixture();
  pendingReview.review.status = "pending";
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews: pendingReview })), /review\.status must be approved/);

  const wrongReviewer = createDecisionViewsFixture();
  wrongReviewer.review.reviewed_by = "Different Reviewer";
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews: wrongReviewer })), /must match humanDiagnosis\.reviewer\.name/);

  const automaticPromotion = createDecisionViewsFixture();
  automaticPromotion.promotion_holds[0].decision = "promote";
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews: automaticPromotion })), /decision must be do_not_promote_yet/);
});

test("renderer embeds the five views inside the existing nine-section cockpit", () => {
  const html = renderGrowthReport(createV5Report(undefined, { decisionViews: createDecisionViewsFixture() }));
  const gapMap = html.indexOf('id="gap-map" data-cockpit-order="1"');
  const focusGaps = html.indexOf('id="focus-gaps" data-cockpit-order="2"');
  const doNotFund = html.indexOf('id="do-not-fund" data-cockpit-order="5"');
  const inventory = html.indexOf('id="gap-inventory" data-cockpit-order="6"');

  assert.match(html, /Treatment Opportunity Matrix/);
  assert.match(html, /Provider Visibility Map/);
  assert.match(html, /Trust Chain/);
  assert.match(html, /Patient Friction Index/);
  assert.match(html, /Do Not Promote Yet by Treatment/);
  assert.match(html, /CATEGORICAL · UNSCORED/);
  assert.match(html, /reviewed Growth Score evidence/i);
  assert.equal((html.match(/data-cockpit-order=/g) || []).length, 9);
  assert.ok(gapMap < html.indexOf("Treatment Opportunity Matrix") && html.indexOf("Patient Friction Index") < focusGaps);
  assert.ok(doNotFund < html.indexOf("Do Not Promote Yet by Treatment") && html.indexOf("Do Not Promote Yet by Treatment") < inventory);

  const treatmentTable = html.slice(html.indexOf('data-decision-view="treatment-opportunity-matrix"'), html.indexOf('data-decision-view="provider-visibility-map"'));
  for (const header of ["SEARCH", "WEBSITE", "SOCIAL", "REPUTATION"]) assert.match(treatmentTable, new RegExp(`<th>${header}</th>`));
});

test("missing decision artifact renders explicit not-assessed states, never implicit permission", () => {
  const report = createV5Report();
  delete report.decisionViews;
  const html = renderGrowthReport(report);

  assert.equal((html.match(/Needs verification/g) || []).length >= 5, true);
  assert.match(html, /Missing evidence stays unscored/);
  assert.match(html, /This is not permission to promote a treatment/);
  assert.doesNotMatch(html, /data-decision-view="do-not-promote-yet-by-treatment"/);
});

test("not-assessed artifact requires empty source-derived collections", () => {
  const decisionViews = clone(createDecisionViewsFixture());
  decisionViews.assessment_status = "not_assessed";
  assert.throws(() => scoreGrowthReport(createV5Report(undefined, { decisionViews })), /must be empty when not_assessed/);
});
