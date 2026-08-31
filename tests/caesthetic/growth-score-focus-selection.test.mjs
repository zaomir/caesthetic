import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  EvidenceIncompleteError,
  scoreGrowthReport,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { applyHumanFocusSelection } from "../../scripts/caesthetic/growth-score-select-focus.mjs";
import { convertAesthetemedToSchemaV5 } from "../../scripts/caesthetic/build-aesthetemed-growth-score.mjs";
import { createSixteenToFourReport, createV5Report } from "./helpers/growth-score-v5-fixture.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixturePath = path.join(root, "tests/fixtures/caesthetic/growth-score-focus-selection-16-to-4.json");

test("16 found holes collapse to 4 human-selected Focus Gaps", () => {
  const report = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  assert.equal(report.humanDiagnosis.gap_inventory.length, 16);
  const selected = [
    report.humanDiagnosis.focus_selection.primary_gap_id,
    ...report.humanDiagnosis.focus_selection.supporting_gap_ids,
  ];
  assert.equal(selected.length, 4);
  assert.equal(new Set(selected).size, 4);
  const selectedGaps = report.humanDiagnosis.gap_inventory.filter((gap) => selected.includes(gap.id));
  const deferred = report.humanDiagnosis.gap_inventory.filter((gap) => !selected.includes(gap.id));
  assert.equal(deferred.length, 12);
  assert.equal(selectedGaps.filter((gap) => gap.sprint_fit.mode === "close_in_30_days").length, 3);
  assert.equal(selectedGaps.filter((gap) => gap.sprint_fit.mode === "start_in_30_days").length, 1);
  assert.equal("remediation_tasks" in report.humanDiagnosis, false);
  assert.equal("top_priorities" in report.humanDiagnosis, false);
  assert.ok(!report.humanDiagnosis.gap_inventory.some((gap) => gap.selected_for_repair === true));
  const scored = scoreGrowthReport(report);
  assert.equal(scored.overall.sufficient, true);
  const html = renderGrowthReport(report);
  assert.equal((html.match(/class="cae-focus-gap"/g) || []).length, 4);
  assert.match(html, /Not now/);
  assert.doesNotMatch(html, /automatically included|auto-included Sprint/i);
});

test("CLI applies only the named human's IDs and never ranks by score", () => {
  const draft = createV5Report({ search: 10, website: 90, social: 90, reputation: 90, cross: 80 });
  delete draft.humanDiagnosis.focus_selection;
  const applied = applyHumanFocusSelection({
    report: draft,
    primaryGapId: "search-gap",
    supportingGapIds: ["booking-gap", "proof-gap"],
    selectedBy: "Morgan Reed",
    selectedAt: "2026-08-30T12:00:00Z",
    rationale: "Discovery remains the binding leak even though Search has the lowest score.",
  });
  assert.deepEqual(applied.selected_ids, ["search-gap", "booking-gap", "proof-gap"]);
  assert.equal(applied.focus_selection_record.append_only, true);
  assert.equal(applied.focus_selection_record.selected_by, "Morgan Reed");
  assert.equal(applied.report.humanDiagnosis.binding_constraint.gap_ref, "search-gap");

  const inverted = createV5Report({ search: 90, website: 10, social: 10, reputation: 10, cross: 10 });
  const sameChoice = applyHumanFocusSelection({
    report: inverted,
    primaryGapId: "search-gap",
    supportingGapIds: ["booking-gap", "proof-gap"],
    selectedBy: "Morgan Reed",
    selectedAt: "2026-08-30T12:00:00Z",
    rationale: "The reviewer kept the same Focus Gaps despite inverted scores.",
  });
  assert.deepEqual(sameChoice.selected_ids, applied.selected_ids);
});

test("Focus Selection CLI stops on two, five or unproven gaps", () => {
  const report = createV5Report();
  assert.throws(
    () => applyHumanFocusSelection({
      report,
      primaryGapId: "search-gap",
      supportingGapIds: ["booking-gap"],
      selectedBy: "Morgan Reed",
      selectedAt: "2026-08-30T12:00:00Z",
      rationale: "Too few.",
    }),
    /2|3 or 4/,
  );
  assert.throws(
    () => applyHumanFocusSelection({
      report,
      primaryGapId: "search-gap",
      supportingGapIds: ["booking-gap", "proof-gap", "response-backlog", "freshness-monitor"],
      selectedBy: "Morgan Reed",
      selectedAt: "2026-08-30T12:00:00Z",
      rationale: "Too many.",
    }),
    /5|3 or 4/,
  );

  const unproven = createV5Report();
  unproven.humanDiagnosis.gap_inventory[0].diagnosis_state = "insufficient_evidence";
  unproven.humanDiagnosis.gap_inventory[0].sprint_fit.mode = "backlog";
  assert.throws(
    () => applyHumanFocusSelection({
      report: unproven,
      primaryGapId: "search-gap",
      supportingGapIds: ["booking-gap", "proof-gap"],
      selectedBy: "Morgan Reed",
      selectedAt: "2026-08-30T12:00:00Z",
      rationale: "Cannot choose an unproven hole.",
    }),
    /verified_gap|cannot be selected/,
  );
});

test("Aesthetemed is not mechanically converted to schema v5", () => {
  assert.throws(() => convertAesthetemedToSchemaV5(), EvidenceIncompleteError);
  const generated = createSixteenToFourReport();
  assert.equal(generated.humanDiagnosis.gap_inventory.length, 16);
  assert.equal(generated.humanDiagnosis.focus_selection.supporting_gap_ids.length, 3);
});
