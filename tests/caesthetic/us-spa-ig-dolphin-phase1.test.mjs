#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  buildDryRunReport,
  DEFAULT_MASTER,
} from "../../scripts/caesthetic/us_spa_ig_dolphin_phase1_dryrun.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(REPO, "scripts/caesthetic/us_spa_ig_dolphin_phase1_dryrun.mjs");
const STUDENT_SEED = join(REPO, "scripts/caesthetic/seed-ig-students-w34.py");

const fixtureCsv = `ig_username,surface,motion,action_queue,status,project,country,dm_eligible,state,source,notes
warm_ok_az,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,AZ,apify_9_city,
warm_ok_fl_missing_dm,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,,FL,partner_referral,
research_skip,B_CAE_IG,motion_d,research,ready_for_warm,caesthetic,US,false,AZ,apify_9_city,
suppressed_skip,B_CAE_IG,motion_d,warm,suppressed,caesthetic,US,false,NC,apify_9_city,
dm_true_skip,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,true,TX,apify_9_city,
student_source_skip,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,CA,students.csv,
voc_skip,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,TN,COPY-VOC-021,
wrong_country_skip,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,CA,false,ON,apify_9_city,
`;

describe("CAESTHETIC US spa IG Dolphin Phase-1 dry-run", () => {
  it("selects only canonical warm rows with DM hard-off", () => {
    const report = buildDryRunReport(fixtureCsv, { inputSource: "fixture.csv" });

    assert.equal(report.ok, true);
    assert.equal(report.dry_run, true);
    assert.equal(report.browser_actions.dolphin_start, false);
    assert.equal(report.browser_actions.dms, false);
    assert.equal(report.totals.selected_warm_targets, 2);
    assert.deepEqual(report.counts_by_state, { AZ: 1, FL: 1 });
    assert.deepEqual(report.counts_by_source, {
      apify_9_city: 1,
      partner_referral: 1,
    });
    assert.equal(report.guard.dm_hard_off, true);
    assert.equal(report.guard.dm_true_selected_count, 0);
    assert.equal(report.guard.hard_excluded_selected_count, 0);
    assert.equal(report.guard.untagged_selected_count, 0);
    assert.equal(report.excluded_reasons.contract_action_queue, 1);
    assert.equal(report.excluded_reasons.contract_status, 1);
    assert.equal(report.excluded_reasons.contract_dm_eligible, 1);
    assert.equal(report.excluded_reasons.students_csv, 1);
    assert.equal(report.excluded_reasons.voc, 1);
  });

  it("CLI writes an aggregate JSON report and does not leak raw target handles", () => {
    const dir = mkdtempSync(join(tmpdir(), "cae-us-spa-ig-test-"));
    try {
      const input = join(dir, "fixture.csv");
      const output = join(dir, "report.json");
      writeFileSync(input, fixtureCsv);

      const result = spawnSync(process.execPath, [SCRIPT, "--input", input, "--output", output], {
        cwd: REPO,
        encoding: "utf8",
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const reportText = readFileSync(output, "utf8");
      assert.doesNotMatch(reportText, /warm_ok_az|warm_ok_fl_missing_dm/);
      const report = JSON.parse(reportText);
      assert.equal(report.totals.selected_warm_targets, 2);
      assert.equal(report.input.default_pointer, false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails closed when a selected row lacks state/source report tags", () => {
    const badCsv = `surface,motion,action_queue,status,project,country,dm_eligible
B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false
`;
    const report = buildDryRunReport(badCsv, { inputSource: "bad-fixture.csv" });

    assert.equal(report.ok, false);
    assert.equal(report.guard.untagged_selected_count, 1);
    assert.deepEqual(report.guard_details.untagged_selected_rows[0].reasons, [
      "missing_source",
      "missing_state",
    ]);
  });

  it("student runner remains PHASE1_FAIL_CLOSE by default", () => {
    const env = { ...process.env };
    delete env.CAE_PHASE0_STUDENT_VOC_ALLOW;
    const result = spawnSync("python3", [STUDENT_SEED], {
      cwd: REPO,
      env,
      encoding: "utf8",
    });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stderr}\n${result.stdout}`, /PHASE1_FAIL_CLOSE/);
  });

  it("documents the default private Dropbox master pointer", () => {
    assert.equal(
      DEFAULT_MASTER,
      "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv"
    );
  });
});
