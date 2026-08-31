import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_TRANSITIONS,
  HUMAN_GATED_STATES,
} from "../../scripts/caesthetic/growth-score-ops-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lifecycleSql = [
  fs.readFileSync(path.join(root, "supabase/migrations/20260821191000_caesthetic_growth_score_queue_lifecycle.sql"), "utf8"),
  fs.readFileSync(path.join(root, "supabase/migrations/20260830190000_caesthetic_growth_score_gap_map_v5.sql"), "utf8"),
].join("\n");
const opsCli = fs.readFileSync(path.join(root, "scripts/caesthetic/growth-score-ops.mjs"), "utf8");
const runbook = fs.readFileSync(
  path.join(root, "docs/projects/caesthetic/operations/GROWTH_SCORE_OPERATOR_RUNBOOK.md"),
  "utf8",
);

test("ALLOWED transitions from contract appear in lifecycle SQL migration", () => {
  for (const [from, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
    for (const to of targets) {
      const inList = new RegExp(`v_from = '${from}' AND p_to_state IN \\([^)]*'${to}'`);
      const single = new RegExp(`v_from = '${from}' AND p_to_state = '${to}'`);
      assert.ok(
        inList.test(lifecycleSql) || single.test(lifecycleSql),
        `expected ${from} → ${to} in transition_caesthetic_score_case`,
      );
    }
  }
});

test("ops CLI does not direct UPDATE case state — uses transition RPC", () => {
  assert.match(opsCli, /rpc\("transition_caesthetic_score_case"/);
  assert.match(opsCli, /rpc\("record_caesthetic_score_delivery"/);
  assert.doesNotMatch(opsCli, /caesthetic_score_cases[\s\S]*\.update\([\s\S]*state:/i);
  assert.doesNotMatch(opsCli, /UPDATE\s+public\.caesthetic_score_cases[\s\S]*SET[\s\S]*state/i);
});

test("human-gated states require named actor in SQL", () => {
  assert.match(lifecycleSql, /named_human_actor_required/);
  assert.match(lifecycleSql, /p_actor_name NOT LIKE '% %'/);
  for (const state of HUMAN_GATED_STATES) {
    assert.match(lifecycleSql, new RegExp(`'${state}'`));
  }
});

test("delivery RPC requires approved state", () => {
  assert.match(lifecycleSql, /delivery_requires_approved/);
  assert.match(lifecycleSql, /IF v_state <> 'approved'/);
});

test("overdue view excludes qa_test cases", () => {
  assert.match(lifecycleSql, /WHERE c\.qa_test IS FALSE/);
  const viewBody = lifecycleSql.slice(
    lifecycleSql.indexOf("CREATE OR REPLACE VIEW public.caesthetic_score_overdue"),
    lifecycleSql.indexOf("CREATE OR REPLACE FUNCTION public.record_caesthetic_score_delivery"),
  );
  assert.doesNotMatch(viewBody, /qa_test IS TRUE/);
});

test("runbook documents drain, overdue, and 2–3/week capacity", () => {
  assert.match(runbook, /\bdrain\b/i);
  assert.match(runbook, /\boverdue\b/i);
  assert.match(runbook, /2[–-]3/i);
  assert.match(runbook, /grainee-v2/);
  assert.match(runbook, /Asana is not the source of truth/i);
  assert.match(runbook, /do not re-queue.*qa/i);
});
