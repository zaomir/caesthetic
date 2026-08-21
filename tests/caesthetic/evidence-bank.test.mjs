import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateManifest, canPromoteToPublishable, EPISTEMIC_LABELS } from "../../scripts/caesthetic/evidence/schema.mjs";
import {
  scaffoldUnit,
  readManifest,
  promoteUnit,
  statusUnit,
  listUnits,
  assertUnitId,
} from "../../scripts/caesthetic/evidence/new-unit.mjs";
import { extractCandidates, draftUnitsFromScore } from "../../scripts/caesthetic/evidence/from-score.mjs";

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cae-evidence-bank-"));
}

test("EPISTEMIC_LABELS matches the six V3.2 §2 classes", () => {
  assert.deepEqual(EPISTEMIC_LABELS, ["Observed", "Measured", "Calculated", "Benchmark", "Estimated", "Illustrative"]);
});

test("validateManifest flags every missing required field", () => {
  const { ok, missing } = validateManifest({});
  assert.equal(ok, false);
  for (const field of ["unit_id", "source", "capture_date", "epistemic_label", "verified_observation", "allowed_public_wording", "rights_status", "redaction_status", "lifecycle_state"]) {
    assert.ok(missing.includes(field), `expected ${field} in missing`);
  }
});

test("validateManifest requires method_scope for Calculated/Benchmark/Estimated but not Observed", () => {
  const base = {
    unit_id: "u1", source: "public GBP listing", capture_date: "2026-08-19",
    verified_observation: "x", allowed_public_wording: "x",
    rights_status: "public_source", redaction_status: "clean",
    lifecycle_state: "CAPTURED", reviewer: "Валерия Иванова",
  };
  const observed = validateManifest({ ...base, epistemic_label: "Observed" });
  assert.equal(observed.ok, true);

  const estimated = validateManifest({ ...base, epistemic_label: "Estimated" });
  assert.equal(estimated.ok, false);
  assert.ok(estimated.missing.includes("method_scope"));

  const withScope = validateManifest({ ...base, epistemic_label: "Estimated", method_scope: "map-pack CTR model, see growth_score_spec.md" });
  assert.equal(withScope.ok, true);
});

test("validateManifest does not require a reviewer for Illustrative units", () => {
  const manifest = {
    unit_id: "u2", source: "model example", capture_date: "2026-08-19",
    epistemic_label: "Illustrative", verified_observation: "x", allowed_public_wording: "x",
    rights_status: "public_source", redaction_status: "not_applicable", lifecycle_state: "CAPTURED",
  };
  assert.equal(validateManifest(manifest).ok, true);
});

test("validateManifest requires reviewer for non-Illustrative units", () => {
  const manifest = {
    unit_id: "u3", source: "GBP screenshot", capture_date: "2026-08-19",
    epistemic_label: "Observed", verified_observation: "x", allowed_public_wording: "x",
    rights_status: "public_source", redaction_status: "clean", lifecycle_state: "CAPTURED",
  };
  const { ok, missing } = validateManifest(manifest);
  assert.equal(ok, false);
  assert.ok(missing.includes("reviewer"));
});

test("validateManifest requires consent_ref when rights_status is client_consented", () => {
  const manifest = {
    unit_id: "u4", source: "client booking flow", capture_date: "2026-08-19",
    epistemic_label: "Observed", verified_observation: "x", allowed_public_wording: "x",
    rights_status: "client_consented", redaction_status: "clean", lifecycle_state: "CAPTURED",
    reviewer: "Валерия Иванова",
  };
  const { ok, missing } = validateManifest(manifest);
  assert.equal(ok, false);
  assert.ok(missing.includes("consent_ref"));
});

test("canPromoteToPublishable blocks a pending redaction even if all fields present", () => {
  const manifest = {
    unit_id: "u5", source: "client GBP", capture_date: "2026-08-19",
    epistemic_label: "Observed", verified_observation: "x", allowed_public_wording: "x",
    rights_status: "anonymized_only", redaction_status: "pending", lifecycle_state: "CAPTURED",
    reviewer: "Валерия Иванова",
  };
  const decision = canPromoteToPublishable(manifest);
  assert.equal(decision.ok, false);
});

test("assertUnitId rejects unsafe ids (path traversal, spaces, too short)", () => {
  assert.throws(() => assertUnitId("../etc/passwd"), /invalid_unit_id/);
  assert.throws(() => assertUnitId("a b"), /invalid_unit_id/);
  assert.throws(() => assertUnitId("ab"), /invalid_unit_id/);
  assert.doesNotThrow(() => assertUnitId("valid-unit_id.001"));
});

test("scaffoldUnit -> promoteUnit end-to-end lifecycle", () => {
  const root = tmpRoot();
  scaffoldUnit("e2e-unit-001", { label: "Observed", source: "public Google Maps listing" }, root);
  let manifest = readManifest("e2e-unit-001", root);
  assert.equal(manifest.lifecycle_state, "CAPTURED");

  // Not promotable yet: required narrative fields are still empty.
  let status = statusUnit("e2e-unit-001", root);
  assert.equal(status.can_promote, false);

  manifest.verified_observation = "Competitor added 37 reviews in 90 days; this practice added 6.";
  manifest.allowed_public_wording = "Competitor review velocity is roughly 6x this practice's over 90 days.";
  manifest.reviewer = "Валерия Иванова";
  manifest.rights_status = "public_source";
  manifest.redaction_status = "clean";
  fs.writeFileSync(path.join(root, "e2e-unit-001", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const promotion = promoteUnit("e2e-unit-001", root);
  assert.equal(promotion.promoted, true);
  manifest = readManifest("e2e-unit-001", root);
  assert.equal(manifest.lifecycle_state, "PUBLISHABLE");

  assert.deepEqual(listUnits(root), ["e2e-unit-001"]);
});

test("scaffoldUnit refuses to overwrite an existing unit", () => {
  const root = tmpRoot();
  scaffoldUnit("dup-unit", { label: "Observed" }, root);
  assert.throws(() => scaffoldUnit("dup-unit", { label: "Observed" }, root), /unit_already_exists/);
});

test("extractCandidates: only approved, Class A metrics with a finding are eligible", () => {
  const report = {
    surfaces: {
      search: {
        metrics: [
          { metric_id: "map_visibility", reviewer_status: "approved", evidence_class: "A", finding: "Not visible in 4/5 grid points for target term.", source: "Local Falcon grid 2026-08-15", collected_at: "2026-08-15", raw_value: 0.2 },
          { metric_id: "freshness", reviewer_status: "pending", evidence_class: "A", finding: "would be eligible if approved", source: "x", collected_at: "2026-08-15" },
          { metric_id: "entity_integrity", reviewer_status: "approved", evidence_class: "B", finding: "estimate, not eligible (Class B)", source: "x", collected_at: "2026-08-15" },
          { metric_id: "branded_search_control", reviewer_status: "approved", evidence_class: "A", finding: "", source: "x", collected_at: "2026-08-15" },
        ],
      },
      website: { metrics: [] },
      social: { metrics: [] },
      reputation: {
        metrics: [
          { metric_id: "review_velocity_90d", reviewer_status: "approved", evidence_class: "A", finding: "6 new reviews vs named competitor's 37 over the same 90 days.", source: "Google review timestamps, captured 2026-08-15", collected_at: "2026-08-15", raw_value: 6 },
        ],
      },
      cross: { metrics: [] },
    },
  };
  const candidates = extractCandidates(report);
  assert.equal(candidates.length, 2);
  assert.deepEqual(candidates.map((c) => c.metricId).sort(), ["map_visibility", "review_velocity_90d"]);
});

test("draftUnitsFromScore writes conservative CAPTURED drafts, never auto-consents", () => {
  const root = tmpRoot();
  const report = {
    surfaces: {
      search: { metrics: [{ metric_id: "map_visibility", reviewer_status: "approved", evidence_class: "A", finding: "Not visible in 4/5 grid points.", source: "Local Falcon grid", collected_at: "2026-08-15" }] },
      website: { metrics: [] },
      social: { metrics: [] },
      reputation: { metrics: [] },
      cross: { metrics: [] },
    },
  };
  const results = draftUnitsFromScore(report, { clientLabel: "Acme Med Spa", root });
  assert.equal(results.length, 1);
  assert.equal(results[0].drafted, true);
  const manifest = readManifest(results[0].unitId, root);
  assert.equal(manifest.lifecycle_state, "CAPTURED");
  assert.equal(manifest.rights_status, "anonymized_only");
  assert.equal(manifest.redaction_status, "pending");
  assert.equal(manifest.verified_observation, "Not visible in 4/5 grid points.");
});

test("draftUnitsFromScore is a no-op on a report with no eligible metrics", () => {
  const root = tmpRoot();
  const report = { surfaces: { search: { metrics: [] }, website: { metrics: [] }, social: { metrics: [] }, reputation: { metrics: [] }, cross: { metrics: [] } } };
  const results = draftUnitsFromScore(report, { clientLabel: "Empty Client", root });
  assert.equal(results.length, 0);
  assert.deepEqual(listUnits(root), []);
});
