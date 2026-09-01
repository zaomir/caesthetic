import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const submit = fs.readFileSync(
  path.join(root, "supabase/functions/submit-caesthetic-growth-score/index.ts"),
  "utf8",
);
const growth = fs.readFileSync(
  path.join(root, "site-caesthetic/assets/js/growth.js"),
  "utf8",
);
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260821190000_caesthetic_growth_score_intake_reliability.sql"),
  "utf8",
);

test("required intake is a single RPC transaction with outbox jobs", () => {
  assert.match(migration, /create_caesthetic_growth_score_intake/);
  assert.match(migration, /caesthetic_score_outbox/);
  assert.match(migration, /notify_internal_email/);
  assert.match(migration, /notify_customer_ack/);
  assert.match(migration, /EXCEPTION\s+WHEN unique_violation/);
  assert.match(submit, /admin\.rpc\(\s*"create_caesthetic_growth_score_intake"/);
  assert.match(submit, /function drainOutbox/);
});

test("idempotency is fingerprint-scoped so a second clinic is a new request", () => {
  assert.match(growth, /function requestFingerprint/);
  assert.match(growth, /parsed\.fp === fingerprint/);
  assert.match(submit, /\|\$\{name\}`/);
});

test("abuse controls restrict CORS and return 429 on rate_limited", () => {
  assert.match(submit, /origin_not_allowed/);
  assert.match(submit, /return json\(429, \{ ok: false, error: "rate_limited" \}/);
  assert.match(migration, /RAISE EXCEPTION 'rate_limited'/);
  assert.doesNotMatch(submit, /Access-Control-Allow-Origin": "\*"/);
});

test("QA leads auto-close and skip customer acknowledgement", () => {
  assert.match(migration, /WHEN v_qa THEN 'qa_archived'/);
  assert.match(migration, /IF NOT v_qa THEN/);
  assert.match(migration, /reason, payload\s+\) VALUES \(\s+v_case_id, 'created', 'closed', 'system:qa', 'qa_archive'/);
  assert.match(submit, /customer_ack_sent/);
});

test("intake preserves the canonical vertical and locale adapters", () => {
  assert.match(submit, /aesthetic_practice.*dental_practice.*beauty_salon/s);
  assert.match(submit, /"en", "ru", "es", "fr", "uk"/);
  assert.match(submit, /body\.vertical_context \?\? body\.vertical/);
  assert.match(submit, /body\.report_locale \?\? body\.locale/);
  assert.match(submit, /vertical_context: verticalContext/);
  assert.match(submit, /report_locale: reportLocale/);
});
