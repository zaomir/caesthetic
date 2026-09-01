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
  assert.match(source, /create_caesthetic_growth_score_intake/);
  assert.match(source, /return json\(200, \{\s*ok: true,\s*lead_id: leadId,/);
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
    "location_count",
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
  const optionalEnd = source.indexOf("const practiceName", optionalReturn);
  const optionalSlice = source.slice(optionalBranch, optionalEnd > optionalReturn ? optionalEnd : source.length);
  assert.ok(optionalBranch > 0);
  assert.ok(optionalReturn > optionalBranch);
  assert.equal(optionalSlice.includes("drainOutbox"), false);
  assert.equal(optionalSlice.includes("await sendInternalReceipt"), false);
  assert.equal(optionalSlice.includes("await sendAdminTelegram"), false);
  assert.ok(source.indexOf("await drainOutbox", optionalReturn) > optionalReturn);
});

test("skip and abandonment need no state-changing backend call", () => {
  assert.doesNotMatch(source, /intake_stage\s*===?\s*["']skip/);
  assert.doesNotMatch(migration, /optional_(?:required|gate)/i);
  assert.match(migration, /intake_state IN \('required_complete', 'optional_saved'\)/);
});

test("required intake persists canonical vertical and locale without overwriting optional fields", () => {
  assert.match(source, /VERTICAL_CONTEXTS = new Set\(\["aesthetic_practice", "dental_practice", "beauty_salon"\]\)/);
  assert.match(source, /REPORT_LOCALES = new Set\(\["en", "ru", "es", "fr", "uk"\]\)/);
  assert.match(source, /mergedSelfReported\.vertical_context = existingMeta\.vertical_context/);
  assert.match(source, /mergedSelfReported\.report_locale = existingMeta\.report_locale/);
});

test("required intake creates an owner_intake score case and TEST marker prefixes notifications", () => {
  assert.match(source, /const WORKFLOW_VERSION = "growth-score-workflow\/3\.0\.0"/);
  assert.match(source, /from\("caesthetic_score_cases"\)/);
  assert.match(source, /source_kind: "owner_intake"/);
  assert.match(source, /state: "created"/);
  assert.match(source, /score_case_id: scoreCaseId/);
  assert.match(source, /function isQaTestLead/);
  assert.match(source, /\[TEST\/QA\]/);
  assert.match(source, /qa_marker === true/);
  assert.match(source, /emailSent \|\| telegramSent/);
  assert.match(source, /create_caesthetic_growth_score_intake/);
  assert.match(source, /notify_customer_ack/);
  assert.doesNotMatch(source, /Access-Control-Allow-Origin": "\*"/);
  assert.match(source, /https:\/\/caesthetic\.com/);
  assert.match(source, /rate_limited/);
});
