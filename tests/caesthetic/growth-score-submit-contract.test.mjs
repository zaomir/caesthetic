import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = fs.readFileSync(
  path.join(root, "supabase/functions/submit-caesthetic-growth-score/index.ts"),
  "utf8",
);
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260814170000_caesthetic_growth_score_runtime.sql"),
  "utf8",
);

test("required intake persists version and success timestamp before enrichment", () => {
  assert.match(source, /const INTAKE_VERSION = "caesthetic-growth-score\/2\.0"/);
  assert.match(source, /intakeStage === "optional"/);
  assert.match(source, /required_submitted_at: requiredSubmittedAt/);
  assert.match(source, /intake_state: "required_complete"/);
  assert.match(source, /return json\(200, \{ ok: true, lead_id: leadId \}\)/);
  assert.match(migration, /required_submitted_at timestamptz/);
  assert.match(migration, /intake_version text/);
});

test("optional enrichment is allowlisted and updates only the matching case identity", () => {
  for (const field of [
    "website_url",
    "gbp_url",
    "instagram_url",
    "priority_treatments",
    "booking_url_system",
    "main_concern",
    "relevant_competitors",
    "preferred_contact_phone",
  ]) assert.match(source, new RegExp(`${field}: \\d+`));

  assert.match(source, /self_reported_field_not_allowed/);
  assert.match(source, /\.eq\("id", leadId\)[\s\S]+\.eq\("idempotency_key", idempotencyKey\)[\s\S]+\.eq\("intake_version", INTAKE_VERSION\)/);
  assert.match(source, /enquiry_path_permission_at_required/);
  assert.match(source, /optional_saved: true/);
  assert.match(migration, /self_reported jsonb/);
  assert.match(migration, /enquiry_path_permission boolean/);
  assert.match(migration, /enquiry_path_permission_at timestamptz/);
});

test("optional save returns before notifications and cannot resend the required receipt", () => {
  const optionalBranch = source.indexOf('if (intakeStage === "optional")');
  const optionalReturn = source.indexOf("optional_saved: true", optionalBranch);
  const emailCall = source.indexOf("await sendInternalReceipt", optionalReturn);
  const telegramCall = source.indexOf("await sendAdminTelegram", optionalReturn);
  assert.ok(optionalBranch > 0);
  assert.ok(optionalReturn > optionalBranch);
  assert.ok(emailCall > optionalReturn);
  assert.ok(telegramCall > optionalReturn);
});

test("skip and abandonment need no state-changing backend call", () => {
  assert.doesNotMatch(source, /intake_stage\s*===?\s*["']skip/);
  assert.doesNotMatch(migration, /optional_(?:required|gate)/i);
  assert.match(migration, /intake_state IN \('required_complete', 'optional_saved'\)/);
});
