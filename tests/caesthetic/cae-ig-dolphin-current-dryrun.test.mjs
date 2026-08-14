#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_MASTER as PHASE1_DATED_EXPORT } from "../../scripts/caesthetic/us_spa_ig_dolphin_phase1_dryrun.mjs";
import {
  DEFAULT_CURRENT,
  FORBIDDEN_CANDIDATE_TAG,
  FORBIDDEN_DATED_EXPORT,
  buildCurrentDryRunReport,
  parseRegistryText,
  reportContainsUsernames,
} from "../../scripts/caesthetic/cae_ig_dolphin_current_dryrun.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(REPO, "scripts/caesthetic/cae_ig_dolphin_current_dryrun.mjs");

const fixtureCsv = `username,surface,motion,action_queue,status,project,country,dm_eligible,state,source,notes
fake_warm_ok,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,AZ,apify_9_city,
fake_warm_fl,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,,FL,partner_referral,
fake_denied_alpha,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,TX,apify_9_city,
fake_override_suppress,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,NC,apify_9_city,
fake_dm_true,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,true,CA,apify_9_city,
fake_student_skip,B_CAE_IG,motion_d,warm,ready_for_warm,caesthetic,US,false,CA,students.csv,
fake_research_skip,B_CAE_IG,motion_d,research,ready_for_warm,caesthetic,US,false,AZ,apify_9_city,
`;

const fixtureCurrent = {
  registry_id: "cae_us_medspa_ig",
  release_id: "r20260813T154900Z-bootstrap",
  status: "BOOTSTRAP_CURRENT_WITH_DENY_OVERLAY",
  execution_allowed: true,
  selection_id: "CAE_MEDSPA_IG_FINAL_V1",
  selection_tag: "sel_cae_medspa_ig_final_v1",
  canonical_master: "dropbox:CAESTHETIC/audience/us-spa-ig-master/releases/r20260813T154900Z-bootstrap/canonical_master.csv",
  ready_for_warm: 2,
  legacy_ready_for_warm: 4,
  deny_usernames: ["fake_denied_alpha", "unused_deny_handle"],
  dm_eligible: false,
  dolphin_profile_id: "833304152",
  surface: "B_CAE_IG",
  motion: "motion_d",
};

const fixtureOverrides = `username,decision,reason
fake_override_suppress,suppress,fixture_suppress
fake_warm_ok,include,keep
`;

const fixtureUsernames = [
  "fake_warm_ok",
  "fake_warm_fl",
  "fake_denied_alpha",
  "fake_override_suppress",
  "fake_dm_true",
  "fake_student_skip",
  "unused_deny_handle",
];

const fixtureRegistry = {
  registries: {
    cae_us_medspa_ig: {
      project: "caesthetic",
      current_pointer: DEFAULT_CURRENT,
      waves_root: "dropbox:CAESTHETIC/audience/us-spa-ig-master/waves",
      final_selection_id: "CAE_MEDSPA_IG_FINAL_V1",
      candidate_selection_id: "CAE_MEDSPA_IG_V1",
      dolphin_profile_id: "833304152",
      dm_eligible_default: false,
    },
  },
};

describe("CAESTHETIC IG Dolphin CURRENT dry-run", () => {
  it("does not default to the dated export or candidate selection", () => {
    assert.equal(DEFAULT_CURRENT, "dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json");
    assert.equal(FORBIDDEN_DATED_EXPORT, PHASE1_DATED_EXPORT);
    assert.notEqual(DEFAULT_CURRENT, FORBIDDEN_DATED_EXPORT);
    assert.equal(FORBIDDEN_CANDIDATE_TAG, "sel_cae_medspa_ig_v1");
    assert.match(FORBIDDEN_DATED_EXPORT, /us-spa-ig-master-2026-08/);
    assert.doesNotMatch(DEFAULT_CURRENT, /us-spa-ig-master-2026-08/);
  });

  it("FAILS when wave is missing (wave_exists gate)", () => {
    const report = buildCurrentDryRunReport({
      csvText: fixtureCsv,
      current: fixtureCurrent,
      currentSource: DEFAULT_CURRENT,
      registry: fixtureRegistry.registries.cae_us_medspa_ig,
      registryMeta: { source: "fixture", path: "fixture-registry.json" },
      overridesText: fixtureOverrides,
      wave: { status: "missing", wave_id: "cae_medspa_ig_final_v1_w002" },
      inputSource: "fixture.csv",
    });
    assert.equal(report.ok, false);
    assert.equal(report.dry_run_status, "FAIL");
    assert.equal(report.wave_gates.wave_exists, false);
    assert.equal(report.wave.wave_status, "missing");
  });

  it("applies deny overlay + override suppress, requires wave, keeps DM hard-off, omits usernames", () => {
    const report = buildCurrentDryRunReport({
      csvText: fixtureCsv,
      current: fixtureCurrent,
      currentSource: DEFAULT_CURRENT,
      registry: fixtureRegistry.registries.cae_us_medspa_ig,
      registryMeta: { source: "fixture", path: "fixture-registry.json" },
      overridesText: fixtureOverrides,
      wave: {
        status: "draft",
        wave_id: "cae_medspa_ig_final_v1_w002",
        dm_eligible: false,
        dolphin_profile_id: "833304152",
        usernames: ["fake_warm_ok", "fake_warm_fl"],
      },
      inputSource: "fixture.csv",
    });

    assert.equal(report.ok, true);
    assert.equal(report.dry_run_status, "PASS");
    assert.equal(report.browser_actions.dms, false);
    assert.equal(report.browser_actions.likes, false);
    assert.equal(report.browser_actions.follows, false);
    assert.equal(report.browser_actions.comments, false);
    assert.equal(report.guard.dm_hard_off, true);
    assert.equal(report.guard.dm_true_selected_count, 0);
    assert.equal(report.guard.dated_export_used, false);
    assert.equal(report.release.dated_export_default, false);
    assert.equal(report.totals.selected_warm_after_deny, 2);
    assert.equal(report.totals.deny_overlay_excluded, 1);
    assert.equal(report.totals.override_excluded, 1);
    assert.equal(report.ready_for_warm_alignment.ready_for_warm_claimed, 2);
    assert.equal(report.ready_for_warm_alignment.selected_after_deny, 2);
    assert.equal(report.registry_resolved, true);
    assert.equal(report.current.release_id, "r20260813T154900Z-bootstrap");
    assert.equal(report.current.deny_overlay_count, 2);
    assert.equal(report.wave.wave_status, "draft");
    assert.equal(report.wave.wave_username_count, 2);
    assert.equal(report.wave.selected_in_wave, 2);
    assert.equal(report.wave_gates.passed, true);
    assert.equal(report.dolphin.instagram_actions, "NOT EXECUTED");
    assert.ok(report.registry.current_pointer);
    assert.ok(report.current.source);

    const leaked = reportContainsUsernames(JSON.stringify(report), fixtureUsernames);
    assert.deepEqual(leaked, []);
  });

  it("parses git-style YAML registry maps", () => {
    const parsed = parseRegistryText(`version: 1
registries:
  cae_us_medspa_ig:
    project: caesthetic
    current_pointer: dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json
    waves_root: dropbox:CAESTHETIC/audience/us-spa-ig-master/waves
    dm_eligible_default: false
`);
    assert.equal(
      parsed.registries.cae_us_medspa_ig.current_pointer,
      DEFAULT_CURRENT
    );
    assert.equal(parsed.registries.cae_us_medspa_ig.dm_eligible_default, false);
  });

  it("CLI writes aggregate JSON with resolution fields and no username leak", () => {
    const dir = mkdtempSync(join(tmpdir(), "cae-ig-current-test-"));
    try {
      const input = join(dir, "fixture.csv");
      const currentPath = join(dir, "CURRENT.json");
      const registryPath = join(dir, "registry.json");
      const overridesPath = join(dir, "overrides.csv");
      const output = join(dir, "report.json");
      writeFileSync(input, fixtureCsv);
      writeFileSync(
        currentPath,
        JSON.stringify({
          ...fixtureCurrent,
          canonical_master: input,
          overrides: overridesPath,
        })
      );
      const wavesRoot = join(dir, "waves");
      const waveDir = join(wavesRoot, "cae_medspa_ig_final_v1_w002");
      writeFileSync(
        registryPath,
        JSON.stringify({
          registries: {
            cae_us_medspa_ig: {
              ...fixtureRegistry.registries.cae_us_medspa_ig,
              current_pointer: currentPath,
              waves_root: wavesRoot,
            },
          },
        })
      );
      writeFileSync(overridesPath, fixtureOverrides);
      mkdirSync(waveDir, { recursive: true });
      writeFileSync(
        join(waveDir, "manifest.json"),
        JSON.stringify({
          wave_id: "cae_medspa_ig_final_v1_w002",
          status: "draft",
          dm_eligible: false,
          dolphin_profile_id: "833304152",
          usernames: ["fake_warm_ok", "fake_warm_fl"],
        })
      );

      const result = spawnSync(
        process.execPath,
        [
          SCRIPT,
          "--registry",
          registryPath,
          "--current",
          currentPath,
          "--input",
          input,
          "--overrides",
          overridesPath,
          "--wave-id",
          "cae_medspa_ig_final_v1_w002",
          "--output",
          output,
          "--no-dolphin",
        ],
        { cwd: REPO, encoding: "utf8" }
      );
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const reportText = readFileSync(output, "utf8");
      for (const name of fixtureUsernames) {
        assert.doesNotMatch(reportText, new RegExp(name, "i"));
      }
      const report = JSON.parse(reportText);
      assert.equal(report.totals.selected_warm_after_deny, 2);
      assert.equal(report.guard.dm_hard_off, true);
      assert.equal(report.guard.dated_export_used, false);
      assert.equal(report.release.dated_export_default, false);
      assert.doesNotMatch(String(report.input.source), /us-spa-ig-master-2026-08/);
      assert.doesNotMatch(String(report.current.canonical_master), /us-spa-ig-master-2026-08/);
      assert.equal(report.browser_actions.dms, false);
      assert.ok(report.registry.current_pointer);
      assert.ok(report.current.release_id);
      assert.equal(report.dolphin.preflight, "SKIPPED");
      assert.equal(report.wave.wave_status, "draft");
      assert.equal(report.wave_gates.passed, true);
      assert.equal(report.dry_run_status, "PASS");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
