import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_METRICS,
  GROWTH_SCORE_REPORT_TEMPLATE_VERSION,
  scoreGrowthReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scoreRoot = path.join(root, "site-caesthetic/score");
const routes = [
  "demo-medical-aesthetics-search-gap",
  "demo-injector-practice-booking-friction",
  "demo-aesthetics-clinic-reputation-gap",
];
const reports = routes.map((route) => JSON.parse(fs.readFileSync(path.join(scoreRoot, route, "report.json"), "utf8")));

test("retired demo route directories do not remain as duplicate canonical URLs", () => {
  assert.equal(fs.existsSync(path.join(scoreRoot, "demo-cosmetic-dental-booking-friction")), false);
  assert.equal(fs.existsSync(path.join(scoreRoot, "demo-beauty-studio-reputation-gap")), false);
});

test("publishes three clearly synthetic v5 demos through the same approved-report contract", () => {
  const hub = fs.readFileSync(path.join(root, "site-caesthetic/growth-score/index.html"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "site-caesthetic/sitemap.xml"), "utf8");
  assert.match(reports[0].practice.name, /Med Spa/);
  assert.match(reports[1].practice.name, /Injector Practice/);
  assert.match(reports[2].practice.name, /Aesthetics Clinic/);

  reports.forEach((report, index) => {
    const route = routes[index];
    const html = fs.readFileSync(path.join(scoreRoot, route, "index.html"), "utf8");
    const result = scoreGrowthReport(report);
    assert.equal(report.schemaVersion, 5);
    assert.equal(report.templateVersion, GROWTH_SCORE_REPORT_TEMPLATE_VERSION);
    assert.deepEqual(report.reportContext, {
      vertical_context: "aesthetic_practice",
      report_locale: "en",
      vertical_source: "human_resolved",
      locale_source: "user_selected",
    });
    assert.equal(report.reportKind, "demo");
    assert.equal(report.reportState, "approved_report");
    assert.ok(report.reportVersion);
    assert.ok(report.verifiedFactSetVersion);
    assert.equal("economics" in report, false, "the free Score demo must not imply commercial intake inputs");
    assert.match(report.disclosure, /Fictional practice, synthetic data, no client relationship/);
    assert.match(report.methodology.limitations, /people.*synthetic/i);
    assert.match(report.humanDiagnosis.reviewer.name, /^Fictional\s+\S+\s+\S+/);
    assert.match(report.humanDiagnosis.reviewer.approved_at, /T.*Z$/);
    assert.equal(report.humanDiagnosis.reviewer_status, "approved");
    assert.ok(report.humanDiagnosis.gap_inventory.length >= 4);
    assert.equal(typeof report.humanDiagnosis.focus_selection.primary_gap_id, "string");
    assert.ok(report.humanDiagnosis.focus_selection.supporting_gap_ids.length >= 2);
    assert.ok(report.humanDiagnosis.focus_selection.supporting_gap_ids.length <= 3);
    assert.equal("top_priorities" in report.humanDiagnosis, false);
    assert.equal("problem_inventory" in report.humanDiagnosis, false);
    assert.equal("remediation_tasks" in report.humanDiagnosis, false);
    assert.ok(result.evidence.classARatio >= 0.8);
    assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
    assert.match(html, /SYNTHETIC DEMO/);
    assert.match(html, /no client relationship/i);
    assert.match(html, /Valerie Petra/);
    assert.match(html, /Approved · Fictional/);
    assert.match(html, /Competitive Decision Analysis/);
    assert.match(html, /Comparison Matrix/);
    assert.match(html, /Competitor Card/);
    assert.match(html, /Defend/);
    assert.match(html, /Close/);
    assert.match(html, /Differentiate/);
    assert.match(html, /Do not copy/);
    assert.match(html, /Market Practice Gap/);
    assert.match(html, /Gap Map/);
    assert.match(html, /Focus Gaps/);
    assert.match(html, /Approximate \/ secondary navigation/);
    assert.match(html, /Cross-Surface Consistency/);
    assert.match(html, /Full Gap Inventory/);
    assert.match(html, /Do it in-house/);
    assert.match(html, /Use another provider/);
    assert.match(html, /no (?:exclusive method or )?lock-in|without CAESTHETIC/i);
    assert.match(html, /href="\/growth-score\/#demo-growth-scores"/);
    assert.doesNotMatch(html, /Growth economics|Growth Budget|Total Growth Allocation|Performance Fee/);
    assert.equal((html.match(/href="\/sprint\/"/g) || []).length, 1);
    assert.ok(hub.includes(`/score/${route}/`));
    assert.ok(!sitemap.includes(`/score/${route}/`));
  });
});

test("demo competitive decisions preserve four surfaces, recurrence and modernization boundaries", () => {
  for (const report of reports) {
    const competitors = report.humanDiagnosis.competitors;
    assert.equal(competitors.status, "applicable");
    assert.ok(competitors.entries.length >= 3 && competitors.entries.length <= 5);
    assert.equal(competitors.comparison_matrix.rows.length, competitors.entries.length + 1);
    for (const entry of competitors.entries) {
      assert.deepEqual(Object.keys(entry.surface_evidence).sort(), ["reputation", "search", "social", "website"]);
      assert.ok(entry.repeated_positive_themes.every((theme) => theme.mentions >= 2 && theme.mentions <= theme.sample_size));
      assert.ok(entry.repeated_negative_themes.every((theme) => theme.mentions >= 2 && theme.mentions <= theme.sample_size));
      assert.ok(entry.patient_choice_reason && entry.strategic_implication && entry.modernization_implication);
    }
    for (const field of ["defend", "close", "differentiate", "do_not_copy"]) assert.ok(competitors.decision_summary[field].length > 0);
    assert.match(competitors.market_practice_gap.status, /^(applicable|no_material_gap|insufficient_evidence)$/);
    for (const item of competitors.market_practice_gap.recommendations) {
      assert.match(item.decision, /^(keep|evaluate|pilot|replace|do_not_adopt)$/);
      assert.match(item.specialist_validation, /qualified clinician|clinical|regulatory/i);
    }
  }
});

test("demo metrics use the exact canonical ids and no caller weights", () => {
  for (const report of reports) {
    for (const surface of report.surfaces) {
      assert.deepEqual(surface.metrics.map((metric) => metric.metric_id).sort(), Object.keys(CANONICAL_METRICS[surface.id]).sort());
      assert.ok(surface.metrics.every((metric) => !("weight" in metric) && !("canonical_weight" in metric)));
    }
    assert.deepEqual(report.crossSurface.metrics.map((metric) => metric.metric_id).sort(), Object.keys(CANONICAL_METRICS.cross).sort());
  }
});

test("every Focus Gap has DIY repair evidence and leftover holes stay visible", () => {
  for (const report of reports) {
    const diagnosis = report.humanDiagnosis;
    const gaps = new Map(diagnosis.gap_inventory.map((gap) => [gap.id, gap]));
    const selected = [diagnosis.focus_selection.primary_gap_id, ...diagnosis.focus_selection.supporting_gap_ids];
    assert.ok(selected.length >= 3 && selected.length <= 4);
    assert.ok(diagnosis.binding_constraint.gap_ref === diagnosis.focus_selection.primary_gap_id);
    assert.ok(diagnosis.binding_constraint.statement);
    assert.match(diagnosis.binding_constraint.demand_stage, /^(discovery|trust|enquiry|booking|treatment)$/);
    assert.ok(diagnosis.current_state.strengths.length >= 1 && diagnosis.current_state.strengths.length <= 2);
    assert.ok(diagnosis.do_not_do.rationale);
    assert.ok(diagnosis.do_not_do.revisit_after.length >= 2);
    assert.equal(diagnosis.walkthrough.status, "pending");
    assert.equal("duration" in diagnosis.walkthrough, false);
    for (const field of ["diagnosed_issues", "high_priority_fixes", "systems_involved", "dependencies", "specialist_roles"]) {
      assert.equal(typeof diagnosis.coordination_burden[field], "number");
    }
    for (const surface of report.surfaces) {
      assert.match(surface.owner_card.priority, /^(HIGH|MEDIUM|LOW)$/);
      assert.ok(surface.owner_card.strength);
      assert.ok(surface.owner_card.problem);
    }
    assert.equal("owner_card" in report.crossSurface, false);
    for (const gapId of selected) {
      const gap = gaps.get(gapId);
      assert.ok(gap, `selected gap ${gapId} must exist`);
      assert.equal(gap.diagnosis_state, "verified_gap");
      assert.ok(gap.repair_plan.diy_steps.length > 0);
      assert.ok(gap.repair_plan.done_when.length > 0);
      assert.ok(gap.repair_plan.owner_role);
      assert.ok(gap.evidence_refs.length > 0);
      assert.match(gap.sprint_fit.mode, /^(close_in_30_days|start_in_30_days)$/);
    }
    assert.ok(diagnosis.gap_inventory.some((gap) => !selected.includes(gap.id)), "unselected holes must remain visible");
  }
});

test("booking-constrained demo withholds Social and Overall below 70% coverage", () => {
  const result = scoreGrowthReport(reports[1]);
  assert.equal(result.surfaces.social.observedWeight, 60);
  assert.equal(result.surfaces.social.rawScore, null);
  assert.equal(result.overall.rawScore, null);
  const html = fs.readFileSync(path.join(scoreRoot, routes[1], "index.html"), "utf8");
  assert.match(html, /Social · Insufficient evidence/);
  assert.match(html, /60% of canonical Social weight/);
  assert.match(html, /Insufficient evidence/);
});

test("Class B demo context declares estimate method and assumptions without affecting coverage", () => {
  const [estimate] = reports[0].estimates;
  const result = scoreGrowthReport(reports[0]);
  assert.equal(estimate.evidence_class, "B");
  assert.equal(estimate.finding_type, "estimate");
  assert.ok(estimate.method);
  assert.ok(estimate.assumptions.length > 0);
  assert.ok(result.evidence.classARatio >= 0.8);
  const html = fs.readFileSync(path.join(scoreRoot, routes[0], "index.html"), "utf8");
  assert.match(html, /Class B assumptions/);
  assert.match(html, /Assumptions:/);
});

test("three demos stay visibly different on constraint, scores, do_not_do and demand_stage", () => {
  const scored = reports.map((report) => scoreGrowthReport(report));
  const constraints = reports.map((report) => report.humanDiagnosis.binding_constraint.title);
  const stages = reports.map((report) => report.humanDiagnosis.binding_constraint.demand_stage);
  const guardrails = reports.map((report) => report.humanDiagnosis.do_not_do.title);
  const overall = scored.map((result) => result.overall.rawScore);
  const searchScores = scored.map((result) => result.surfaces.search.rawScore);
  const websiteScores = scored.map((result) => result.surfaces.website.rawScore);
  const reputationScores = scored.map((result) => result.surfaces.reputation.rawScore);

  assert.equal(new Set(constraints).size, 3);
  assert.equal(new Set(guardrails).size, 3);
  assert.deepEqual(new Set(stages), new Set(["discovery", "booking", "trust"]));
  assert.equal(stages[0], "discovery");
  assert.equal(stages[1], "booking");
  assert.equal(stages[2], "trust");
  assert.equal(new Set(overall.map(String)).size, 3);
  assert.equal(new Set(searchScores).size, 3);
  assert.equal(new Set(websiteScores).size, 3);
  assert.equal(new Set(reputationScores).size, 3);
  assert.ok(searchScores[0] < searchScores[1] && searchScores[0] < searchScores[2]);
  assert.ok(websiteScores[1] < websiteScores[0] && websiteScores[1] < websiteScores[2]);
  assert.ok(reputationScores[2] < reputationScores[0] && reputationScores[2] < reputationScores[1]);
  assert.match(reports[0].humanDiagnosis.do_not_do.rationale, /paid ads|traffic|search/i);
  assert.match(reports[1].humanDiagnosis.do_not_do.rationale, /booking path|traffic/i);
  assert.match(reports[2].humanDiagnosis.do_not_do.rationale, /acquisition|trust|reputation/i);
});

test("review-system demo explicitly forbids gating", () => {
  const report = fs.readFileSync(path.join(scoreRoot, routes[2], "report.json"), "utf8");
  assert.match(report, /Do not use incentives, sentiment filtering, selective routing, or any form of review gating/);
});

test("deploy and Agent API smoke markers still match the public demo hub", () => {
  const hub = fs.readFileSync(path.join(root, "site-caesthetic/growth-score/index.html"), "utf8");
  const demo = fs.readFileSync(path.join(scoreRoot, routes[0], "index.html"), "utf8");
  const productionSmoke = fs.readFileSync(path.join(root, "scripts/caesthetic-growth-score-production-smoke.sh"), "utf8");
  const deployScript = fs.readFileSync(path.join(root, "scripts/deploy-caesthetic.sh"), "utf8");
  const allowlist = fs.readFileSync(path.join(root, "scripts/agent-api/lib/deploy-allowlist.mjs"), "utf8");

  for (const source of [productionSmoke, allowlist]) {
    assert.match(source, /Four surfaces\. One separate consistency check\./);
    assert.match(source, /SYNTHETIC DEMO/);
    assert.match(source, /Gap Map/);
    assert.match(source, /Focus Gaps/);
    assert.doesNotMatch(source, /Four surfaces\. Fixed weights\./);
  }
  assert.match(deployScript, /SYNTHETIC DEMO/);
  assert.match(hub, /Four surfaces\. One separate consistency check\./);
  assert.match(demo, /SYNTHETIC DEMO/);
});
