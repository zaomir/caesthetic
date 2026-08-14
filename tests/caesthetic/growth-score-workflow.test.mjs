import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { CANONICAL_METRICS } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import {
  validateApprovedReportRecord,
  validateCandidateEvidenceRecord,
  validateDraftRecord,
  validateLearningCandidateRecord,
  validateLearningPromotion,
  validateReviewEventRecord,
  validateRuleReleaseRecord,
  validateScoreCaseRecord,
  validateVerifiedFactSetRecord,
  validateWorkflowRecord,
} from "../../scripts/caesthetic/growth-score-workflow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ids = {
  case: "11111111-1111-4111-8111-111111111111",
  evidence: "22222222-2222-4222-8222-222222222222",
  facts: "33333333-3333-4333-8333-333333333333",
  draft: "44444444-4444-4444-8444-444444444444",
  event: "55555555-5555-4555-8555-555555555555",
  report: "66666666-6666-4666-8666-666666666666",
  learning: "77777777-7777-4777-8777-777777777777",
  release: "88888888-8888-4888-8888-888888888888",
};
const createdAt = "2026-08-14T12:10:00Z";
const approvedAt = "2026-08-14T12:00:00Z";

const metrics = (surface) => Object.keys(CANONICAL_METRICS[surface]).map((metric_id) => ({
  metric_id,
  raw_value: `observed:${metric_id}`,
  normalized_score: 70,
  evidence_class: "A",
  source: `fixture://${surface}/${metric_id}`,
  collected_at: "2026-08-14T10:00:00Z",
  reviewer_status: "approved",
  finding: `${metric_id} fixture finding`,
}));

function report() {
  return {
    schemaVersion: 3,
    reportState: "approved_report",
    reportVersion: "case-report/1.0.0",
    verifiedFactSetVersion: "case-facts/1.0.0",
    reportKind: "demo",
    disclosure: "Synthetic fixture; no client relationship.",
    surfaces: ["search", "website", "social", "reputation"].map((id) => ({ id, metrics: metrics(id) })),
    crossSurface: { metrics: metrics("cross") },
    humanDiagnosis: {
      reviewer_status: "approved",
      reviewer: { name: "Morgan Reed", approved_at: approvedAt },
      objective_strength: { title: "Observed reputation strength", evidence_refs: ["reputation.rating"] },
      strongest_surface: "reputation",
      binding_constraint: { title: "Observed discovery constraint", evidence_refs: ["search.map_visibility"] },
      top_priorities: [
        { id: "p1", problem_refs: ["problem-1"], title: "Correct discovery", evidence_refs: ["search.map_visibility"], impact: "Restore a usable discovery path." },
        { id: "p2", problem_refs: ["problem-1"], title: "Verify booking", evidence_refs: ["website.booking_friction"], impact: "Remove observed booking friction." },
        { id: "p3", problem_refs: ["problem-1"], title: "Align proof", evidence_refs: ["social.proof_quality"], impact: "Make observed proof coherent." },
      ],
      do_not_do: { title: "Do not add spend before the measured constraint is fixed.", evidence_refs: ["search.map_visibility"] },
      competitors: { status: "applicable", selection_method: "Same market and treatment.", entries: [{ name: "Fictional Peer", evidence_refs: ["search.map_visibility"] }] },
      walkthrough: { status: "pending", url: null, placeholder: "Valerie Petra walkthrough pending." },
      problem_inventory: [{
        id: "problem-1",
        surface: "search",
        title: "Discovery gap",
        evidence_refs: ["search.map_visibility"],
        impact: "Relevant demand may not find the practice.",
        task_refs: ["task-1"],
        suggested_horizon: "Immediate",
        status: "diagnosed",
      }],
      remediation_tasks: [{
        id: "task-1",
        problem_refs: ["problem-1"],
        outcome: "Correct priority-treatment discovery fields.",
        steps: ["Capture the before state.", "Apply the owner-approved correction."],
        evidence_refs: ["search.map_visibility"],
        prerequisites_access: ["Owner approval"],
        dependencies: [],
        sequence: { order: 1, rationale: "Discovery is the binding constraint." },
        owner_role: "Local-search operator",
        effort_complexity: "Medium — requires profile review and coordination.",
        implementation_risk: "Reverification may be triggered; preserve access and snapshots.",
        horizon: "One to two weeks to implement; outcomes are not guaranteed.",
        acceptance_evidence: ["Live profile state", "Dated follow-up export"],
        next_action: "Capture the current category and service export.",
      }],
    },
    implementation_paths: {
      diy: "The owner can execute the complete steps internally.",
      other_provider: "The owner can give the evidence and task plan to another provider.",
      defer: "The owner can preserve the baseline and defer selected work.",
      caesthetic: "CAESTHETIC can separately scope selected tasks.",
    },
    why_caesthetic: {
      evidence_advantage: "The reviewed evidence is already assembled.",
      coordination_advantage: "The dependency order and acceptance checks are already mapped.",
      sprint_boundary: "A written 30-day scope is separate and does not include every task automatically.",
      ownership: "The client owns the report, evidence and task plan without lock-in.",
    },
    estimates: [],
    methodology: {
      sources: ["Synthetic source"],
      collectedAt: "2026-08-14T10:00:00Z",
      competitorSelection: "Same market and treatment.",
      limitations: "Synthetic data; no outcome guarantee.",
    },
  };
}

const scoreCase = () => ({
  record_type: "score_case",
  id: ids.case,
  source_kind: "owner_intake",
  intake_version: "caesthetic-growth-score/2.0",
  workflow_version: "growth-score-workflow/3.0.0",
  state: "created",
  self_reported_context: { main_concern: "Improve the public enquiry path" },
  created_at: createdAt,
  updated_at: createdAt,
});

const candidate = () => ({
  record_type: "candidate_evidence",
  id: ids.evidence,
  score_case_id: ids.case,
  surface: "search",
  metric_id: "map_visibility",
  raw_value: { top_three_coverage: 0.2 },
  source_kind: "verified_tool",
  source_ref: "snapshot://grid-1",
  collected_at: "2026-08-14T10:00:00Z",
  collection_method: "Local grid export",
  workflow_version: "growth-score-workflow/3.0.0",
  proposed_evidence_class: "A",
  verification_state: "approved",
  supersedes_candidate_id: null,
  created_at: createdAt,
});

const facts = () => ({
  record_type: "verified_fact_set",
  id: ids.facts,
  score_case_id: ids.case,
  state: "frozen",
  version: "case-facts/1.0.0",
  candidate_evidence_ids: [ids.evidence],
  frozen_by: "Morgan Reed",
  frozen_at: approvedAt,
  created_at: createdAt,
});

const draft = () => ({
  record_type: "draft",
  id: ids.draft,
  score_case_id: ids.case,
  state: "ai_draft",
  publishable: false,
  version: "case-draft/1.0.0",
  model_version: "model/fixture",
  workflow_version: "growth-score-workflow/3.0.0",
  template_version: "growth-score-template/3.0.0",
  rule_bundle_version: "growth-score-rules/1.0.0",
  content: { proposed_constraint: "Candidate only" },
  created_at: createdAt,
});

const reviewEvent = () => ({
  record_type: "review_event",
  id: ids.event,
  score_case_id: ids.case,
  draft_id: ids.draft,
  append_only: true,
  reviewer_name: "Morgan Reed",
  reason_code: "evidence_correction",
  field_path: "humanDiagnosis.binding_constraint",
  before_value: "Draft constraint",
  after_value: "Verified constraint",
  reviewed_at: approvedAt,
  model_version: "model/fixture",
  workflow_version: "growth-score-workflow/3.0.0",
  template_version: "growth-score-template/3.0.0",
  rule_bundle_version: "growth-score-rules/1.0.0",
  created_at: createdAt,
});

const learning = () => ({
  record_type: "learning_candidate",
  id: ids.learning,
  score_case_id: ids.case,
  source_review_event_id: ids.event,
  candidate_type: "rubric",
  state: "promoted",
  deidentified: true,
  global_activation: false,
  content: { pattern: "Require a dated source before accepting this anchor." },
  created_by: "Morgan Reed",
  created_at: createdAt,
});

const release = () => ({
  record_type: "rule_release",
  id: ids.release,
  release_type: "rubric",
  scope: "website.treatment_clarity",
  version: "rubric/2.1.0",
  state: "approved",
  activation_mode: "explicit_human_release",
  source_learning_candidate_ids: [ids.learning],
  approved_by: "Taylor Quinn",
  changelog: "Require dated treatment-page evidence before applying the anchor.",
  effective_at: createdAt,
  validation_eval_result: { status: "passed", suite: "growth-score-rubric-eval", result: "20/20 fixtures passed", tested_at: approvedAt },
  rollback: { target_version: "rubric/2.0.0", instructions: "Restore the previous approved bundle and rerun the eval." },
  created_at: createdAt,
});

test("keeps every workflow record type separable and auditable", () => {
  assert.equal(validateScoreCaseRecord(scoreCase()).record_type, "score_case");
  assert.equal(validateCandidateEvidenceRecord(candidate()).record_type, "candidate_evidence");
  assert.equal(validateVerifiedFactSetRecord(facts()).state, "frozen");
  assert.equal(validateDraftRecord(draft()).publishable, false);
  assert.equal(validateReviewEventRecord(reviewEvent()).append_only, true);
  assert.equal(validateWorkflowRecord(scoreCase()).record_type, "score_case");
});

test("self-reported intake context cannot become Class A or verified evidence", () => {
  const selfReported = candidate();
  Object.assign(selfReported, {
    source_kind: "self_reported",
    proposed_evidence_class: "A",
    verification_state: "approved",
  });
  assert.throws(() => validateCandidateEvidenceRecord(selfReported), /self-reported context cannot be proposed as Class A/);

  const promotedContext = scoreCase();
  promotedContext.self_reported_context = { normalized_score: 90 };
  assert.throws(() => validateScoreCaseRecord(promotedContext), /cannot promote self-reported context into evidence/);
});

test("AI drafts are never publishable and approved reports bind named approval to frozen facts", () => {
  const leaked = draft();
  leaked.publishable = true;
  assert.throws(() => validateDraftRecord(leaked), /publishable must be false/);

  const approved = {
    record_type: "approved_report",
    id: ids.report,
    score_case_id: ids.case,
    draft_id: ids.draft,
    verified_fact_set_id: ids.facts,
    state: "approved",
    report_version: "case-report/1.0.0",
    verified_fact_set_version: "case-facts/1.0.0",
    report_digest: "sha256:fixture",
    approved_by: "Morgan Reed",
    approved_at: approvedAt,
    report_json: report(),
    created_at: createdAt,
  };
  assert.equal(validateApprovedReportRecord(approved).state, "approved");

  approved.approved_by = "Taylor Quinn";
  assert.throws(() => validateApprovedReportRecord(approved), /approver does not match/);
});

test("review events are explicitly append-only audit records", () => {
  const mutable = reviewEvent();
  mutable.append_only = false;
  assert.throws(() => validateReviewEventRecord(mutable), /append_only must be true/);
});

test("corrections never auto-activate and promotion requires explicit release, eval and rollback", () => {
  const candidateRule = learning();
  const approvedRelease = release();
  assert.deepEqual(validateLearningPromotion(candidateRule, approvedRelease), {
    candidate_id: ids.learning,
    release_id: ids.release,
    version: "rubric/2.1.0",
    approved_by: "Taylor Quinn",
    activation_mode: "explicit_human_release",
  });

  const auto = learning();
  auto.global_activation = true;
  assert.throws(() => validateLearningCandidateRecord(auto), /global_activation must remain false/);

  const pii = learning();
  pii.content = { email: "owner@example.com" };
  assert.throws(() => validateLearningCandidateRecord(pii), /not allowed in de-identified learning content/);

  const noRollback = release();
  noRollback.rollback.target_version = "";
  assert.throws(() => validateRuleReleaseRecord(noRollback), /rollback\.target_version is required/);

  const failedEval = release();
  failedEval.validation_eval_result.status = "failed";
  assert.throws(() => validateRuleReleaseRecord(failedEval), /status must be passed/);
});

test("migration enforces private RLS workflow tables and append-only review storage", () => {
  const migration = fs.readFileSync(
    path.join(root, "supabase/migrations/20260814170000_caesthetic_growth_score_runtime.sql"),
    "utf8",
  );
  for (const table of [
    "caesthetic_score_cases",
    "caesthetic_score_candidate_evidence",
    "caesthetic_score_verified_fact_sets",
    "caesthetic_score_drafts",
    "caesthetic_score_review_events",
    "caesthetic_score_approved_reports",
    "caesthetic_score_learning_candidates",
    "caesthetic_score_rule_releases",
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE public\\.${table}`));
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
  }
  assert.match(migration, /BEFORE UPDATE OR DELETE ON public\.caesthetic_score_review_events/);
  assert.match(migration, /publishable boolean NOT NULL DEFAULT false CHECK \(publishable IS FALSE\)/);
  assert.match(migration, /global_activation boolean NOT NULL DEFAULT false CHECK \(global_activation IS FALSE\)/);
  assert.match(migration, /activation_mode = 'explicit_human_release'/);
  assert.match(migration, /approved_at timestamptz NOT NULL/);
  assert.match(migration, /source_kind <> 'self_reported'/);
  assert.match(migration, /proposed_evidence_class = 'B'/);
  assert.match(migration, /REVOKE ALL ON TABLE[\s\S]+FROM anon, authenticated/);
});
