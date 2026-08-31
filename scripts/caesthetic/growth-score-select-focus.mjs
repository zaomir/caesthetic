#!/usr/bin/env node
/**
 * Apply a named human's Focus Selection. The CLI never ranks gaps by score.
 *
 * Usage:
 *   node scripts/caesthetic/growth-score-select-focus.mjs \
 *     --report path/to/draft.json \
 *     --primary search-gap \
 *     --supporting booking-gap,proof-gap \
 *     --selected-by "Morgan Reed" \
 *     --rationale "Discovery is the binding leak." \
 *     [--selected-at 2026-08-30T12:00:00Z] \
 *     [--out path/to/focus-selection.json]
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  EvidenceIncompleteError,
  assessGapInventory,
  selectedFocusGapIds,
  validateFocusSelectionContract,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { validateFocusSelectionRecord } from "./growth-score-workflow.mjs";

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) return null;
  return args[index + 1];
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function usage() {
  console.error("Usage: growth-score-select-focus.mjs --report <draft.json> --primary <id> --supporting <id,id[,id]> --selected-by \"First Last\" --rationale \"...\"");
  process.exit(2);
}

function evidenceIndexFromReport(report) {
  const index = new Map();
  for (const surface of report.surfaces || []) {
    for (const metricInput of surface.metrics || []) {
      index.set(`${surface.id}.${metricInput.metric_id}`, metricInput);
    }
  }
  for (const metricInput of report.crossSurface?.metrics || []) {
    index.set(`cross.${metricInput.metric_id}`, metricInput);
  }
  return index;
}

export function applyHumanFocusSelection({
  report,
  primaryGapId,
  supportingGapIds,
  selectedBy,
  selectedAt,
  rationale,
  scoreCaseId = "11111111-1111-4111-8111-111111111111",
  verifiedFactSetId = "33333333-3333-4333-8333-333333333333",
} = {}) {
  if (!report || typeof report !== "object") throw new TypeError("report is required");
  const assessment = assessGapInventory(report);
  if (assessment.status === "evidence_incomplete") {
    throw new EvidenceIncompleteError();
  }

  const selected = [primaryGapId, ...supportingGapIds].filter(Boolean);
  if (selected.length === 2 || selected.length >= 5) {
    throw new TypeError(`Focus Selection must contain 3 or 4 unique gaps; received ${selected.length}`);
  }

  const diagnosis = {
    ...report.humanDiagnosis,
    binding_constraint: {
      ...(report.humanDiagnosis?.binding_constraint || {}),
      gap_ref: primaryGapId,
    },
    focus_selection: {
      primary_gap_id: primaryGapId,
      supporting_gap_ids: supportingGapIds,
      selected_by: selectedBy,
      selected_at: selectedAt,
      rationale,
    },
  };

  validateFocusSelectionContract(diagnosis, evidenceIndexFromReport(report));

  const record = {
    record_type: "focus_selection",
    id: randomUUID(),
    score_case_id: scoreCaseId,
    verified_fact_set_id: verifiedFactSetId,
    created_at: selectedAt,
    append_only: true,
    gap_ids: (report.humanDiagnosis?.gap_inventory || []).map((gap) => gap.id),
    primary_gap_id: primaryGapId,
    supporting_gap_ids: supportingGapIds,
    selected_by: selectedBy,
    selected_at: selectedAt,
    rationale,
    report_json_focus: diagnosis.focus_selection,
  };
  validateFocusSelectionRecord(record);

  return {
    report: {
      ...report,
      humanDiagnosis: diagnosis,
    },
    focus_selection_record: record,
    selected_ids: selectedFocusGapIds(diagnosis.focus_selection),
  };
}

function runCli() {
  const args = process.argv.slice(2);
  const reportPath = argValue(args, "--report");
  const primaryGapId = argValue(args, "--primary");
  const supportingGapIds = parseList(argValue(args, "--supporting"));
  const selectedBy = argValue(args, "--selected-by");
  const rationale = argValue(args, "--rationale");
  const selectedAt = argValue(args, "--selected-at") || new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const outPath = argValue(args, "--out");
  if (!reportPath || !primaryGapId || !supportingGapIds.length || !selectedBy || !rationale) usage();

  const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), "utf8"));
  const result = applyHumanFocusSelection({
    report,
    primaryGapId,
    supportingGapIds,
    selectedBy,
    selectedAt,
    rationale,
  });
  const payload = JSON.stringify({
    ok: true,
    selected_ids: result.selected_ids,
    focus_selection_record: result.focus_selection_record,
    report: result.report,
  }, null, 2);
  if (outPath) fs.writeFileSync(path.resolve(outPath), `${payload}\n`);
  else process.stdout.write(`${payload}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
