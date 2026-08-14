import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const site = path.join(root, "site-caesthetic");

test("config points Growth Score submit to dedicated edge function", () => {
  const config = fs.readFileSync(path.join(site, "assets/js/caesthetic-config.js"), "utf8");
  assert.match(config, /submit-caesthetic-growth-score/);
  assert.doesNotMatch(config, /submit-caesthetic-partner/);
  assert.match(config, /contactEmail: "info@caesthetic\.com"/);
  assert.match(config, /scoreTurnaround: ""/);
  assert.match(config, /name: "Valerie Petra"/);
  assert.match(config, /linkedin: ""/);
  assert.doesNotMatch(config, /Valeriia Petrova/);
  assert.doesNotMatch(config, /linkedin\.com\/in\/valeriia-petrova-uk/);
  assert.doesNotMatch(config, /5 business days/);
});

test("growth.js posts lead payload with UTM, referrer and idempotency", () => {
  const growth = fs.readFileSync(path.join(site, "assets/js/growth.js"), "utf8");
  assert.match(growth, /idempotency_key/);
  assert.match(growth, /utm_source/);
  assert.match(growth, /referrer/);
  assert.match(growth, /lead_id/);
  assert.match(growth, /appendQuery/);
  assert.match(growth, /data-cae-score-price/);
  assert.match(growth, /c\.growthScoreLabel/);
  assert.match(growth, /caesthetic-growth-score\/2\.0/);
  assert.match(growth, /intake_stage: "required"/);
  assert.match(growth, /required_submitted_at/);
  assert.doesNotMatch(growth, /mailto:.*Growth Score request/);
});

test("Growth Score intake has exactly four required fields across two stages", () => {
  const hub = fs.readFileSync(path.join(site, "growth-score/index.html"), "utf8");
  const requiredTags = [...hub.matchAll(/<(?:input|select|textarea)\b[^>]*\brequired\b[^>]*>/gi)];
  const requiredNames = requiredTags
    .map((match) => match[0].match(/\bname="([^"]+)"/i)?.[1])
    .filter(Boolean)
    .sort();

  assert.deepEqual(requiredNames, ["city_state", "email", "name", "practice_name"]);
  assert.match(hub, /data-cae-score-stage="1"/);
  assert.match(hub, /data-cae-score-stage="2" hidden/);
  assert.match(hub, /data-cae-score-stage="3" hidden/);
  assert.match(hub, /Thank you — this is enough for us to start\./);
});

test("optional enrichment is self-reported, skippable and contains no forbidden intake fields", () => {
  const hub = fs.readFileSync(path.join(site, "growth-score/index.html"), "utf8");
  const optionalStart = hub.indexOf('data-cae-score-stage="3"');
  const optionalEnd = hub.indexOf("</fieldset>", optionalStart);
  const optionalStage = hub.slice(optionalStart, optionalEnd);
  const expectedOptionalNames = [
    "website_url",
    "gbp_url",
    "instagram_url",
    "priority_treatments",
    "booking_url_system",
    "main_concern",
    "relevant_competitors",
    "preferred_contact_phone",
    "enquiry_path_permission",
  ];

  assert.ok(optionalStart >= 0 && optionalEnd > optionalStart);
  for (const field of expectedOptionalNames) {
    assert.match(optionalStage, new RegExp(`name="${field}"`));
  }
  assert.doesNotMatch(optionalStage, /\brequired\b/);
  assert.match(optionalStage, /Skip — my request is complete/);
  assert.match(optionalStage, /optional and self-reported context/);
  assert.match(optionalStage, /truthful, non-clinical test/);

  const fieldNames = [...hub.matchAll(/\bname="([^"]+)"/gi)].map((match) => match[1].toLowerCase());
  for (const forbidden of [
    "revenue",
    "budget",
    "patient_data",
    "phi",
    "credentials",
    "password",
    "account_access",
    "vendor_access",
  ]) {
    assert.equal(fieldNames.includes(forbidden), false, `forbidden field ${forbidden}`);
  }
});

test("required persistence precedes optional stage and optional writes never gate completion", () => {
  const growth = fs.readFileSync(path.join(site, "assets/js/growth.js"), "utf8");
  const leadRecorded = growth.indexOf("leadId = result.data.lead_id");
  const optionalShown = growth.indexOf("setScoreStage(form, 3)");
  const skipHandlerStart = growth.indexOf('optionalSkip.addEventListener("click"');
  const optionalSaveStart = growth.indexOf("if (optionalSave)", skipHandlerStart);
  const skipHandler = growth.slice(skipHandlerStart, optionalSaveStart);

  assert.ok(leadRecorded >= 0 && optionalShown > leadRecorded);
  assert.match(growth, /intake_stage: "optional"/);
  assert.match(growth, /self_reported: selfReported/);
  assert.match(growth, /enquiry_path_permission_at/);
  assert.match(growth, /result\.data\.lead_id !== leadId/);
  assert.match(skipHandler, /growth_score_optional_skipped/);
  assert.doesNotMatch(skipHandler, /postScore|fetch/);
});

test("Growth Score stage analytics use metadata only, never PII or field answers", () => {
  const growth = fs.readFileSync(path.join(site, "assets/js/growth.js"), "utf8");
  const detailStart = growth.indexOf("function analyticsDetail");
  const detailEnd = growth.indexOf("function trackIntake", detailStart);
  const analyticsContract = growth.slice(detailStart, detailEnd);

  assert.match(analyticsContract, /form_type: "growth_score"/);
  assert.match(analyticsContract, /intake_version: INTAKE_VERSION/);
  assert.match(analyticsContract, /stage: stage/);
  assert.doesNotMatch(
    analyticsContract,
    /name|email|practice_name|city_state|website_url|gbp_url|instagram_url|lead_id|self_reported|permission/,
  );
  assert.doesNotMatch(growth, /score_request_submitted[\s\S]{0,180}lead_id/);
});

test("legacy forms exclude Growth Score and use the canonical contact email", () => {
  const legacy = fs.readFileSync(path.join(site, "assets/js/caesthetic.js"), "utf8");
  assert.match(legacy, /:not\(\[data-cae-score-form\]\)/);
  assert.match(legacy, /script\[src\$=\"\/assets\/js\/analytics\.js\"\]/);
  assert.doesNotMatch(legacy, /mailto:team@caesthetic\.com/);
  assert.match(legacy, /info@caesthetic\.com/);
});

test("Sprint CTA is a scope inquiry, not checkout", () => {
  const growth = fs.readFileSync(path.join(site, "assets/js/growth.js"), "utf8");
  assert.match(growth, /initSprintInquiry/);
  assert.match(growth, /data-cae-sprint-inquiry/);
  assert.match(growth, /data-cae-sprint-inquiry-state/);
  assert.match(growth, /Request Sprint scope and payment instructions/);
  assert.match(growth, /sprint_scope_requested/);
  assert.doesNotMatch(growth, /data-cae-checkout|checkout_started|payment_link_requested|stripeCheckoutUrl/);
});

test("homepage uses Four Surfaces copy, not six leak points", () => {
  const home = fs.readFileSync(path.join(site, "index.html"), "utf8");
  assert.match(home, /Four surfaces where demand can break/);
  assert.match(home, /four surfaces/i);
  assert.doesNotMatch(home, /six points where demand can break/i);
  assert.doesNotMatch(home, /six leak points/i);
});

test("growth score hub labels the three current aesthetic-practice scenarios", () => {
  const hub = fs.readFileSync(path.join(site, "growth-score/index.html"), "utf8");
  assert.match(hub, /Med spa · synthetic/);
  assert.match(hub, /Injector practice · synthetic/);
  assert.match(hub, /Aesthetics clinic · synthetic/);
  assert.doesNotMatch(hub, /Cosmetic dental · synthetic/);
  assert.doesNotMatch(hub, /Beauty studio · synthetic/);
});

test("migration defines growth score lead table with idempotency", () => {
  const migration = fs.readFileSync(
    path.join(root, "supabase/migrations/20260811143000_caesthetic_growth_score_leads.sql"),
    "utf8",
  );
  assert.match(migration, /caesthetic_growth_score_leads/);
  assert.match(migration, /idempotency_key/);
  assert.match(migration, /utm_source/);
  assert.match(migration, /referrer/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
});

test("edge function returns lead_id on success and avoids fake 200 on insert failure", () => {
  const ef = fs.readFileSync(
    path.join(root, "supabase/functions/submit-caesthetic-growth-score/index.ts"),
    "utf8",
  );
  assert.match(ef, /lead_id/);
  assert.match(ef, /notifications@caesthetic\.com/);
  assert.match(ef, /23505/);
  assert.match(ef, /insert_failed/);
  assert.match(ef, /sendResendHtmlEmail/);
});

test("demo fixtures use Phase-1 aesthetic-practice scenarios", () => {
  const expectedPractices = new Map([
    ["demo-medical-aesthetics-search-gap", "Fictional Meridian Med Spa"],
    ["demo-injector-practice-booking-friction", "Fictional Lumen Injector Practice"],
    ["demo-aesthetics-clinic-reputation-gap", "Fictional Sable Aesthetics Clinic"],
  ]);
  for (const [slug, practiceName] of expectedPractices) {
    const report = fs.readFileSync(path.join(site, "score", slug, "report.json"), "utf8");
    assert.match(report, new RegExp(practiceName));
    assert.doesNotMatch(report, /Illustrative (?:Practice|Med Spa)/);
  }
});
