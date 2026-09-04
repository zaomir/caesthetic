import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseCsv, validateRow } from "../../scripts/caesthetic/growth-preview-wave.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const migration = read("supabase/migrations/20260904150000_caesthetic_growth_preview_v1.sql");
const handler = read("supabase/functions/submit-caesthetic-growth-score/index.ts");
const renderer = read("supabase/functions/_shared/caesthetic-growth-preview.ts");
const router = read("infra/cloudflare/router/src/index.ts");
const headers = read("infra/cloudflare/router/src/headers.ts");
const enforcement = read("docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md");

const functionBody = (name, next) => {
  const start = migration.indexOf(`FUNCTION public.${name}`);
  const end = next ? migration.indexOf(`FUNCTION public.${next}`, start + 1) : migration.length;
  assert.ok(start >= 0 && end > start, `${name} SQL function must exist`);
  return migration.slice(start, end);
};

test("issuance is O(1) and cannot create research or a Score case", () => {
  const issue = functionBody("issue_caesthetic_growth_preview", "open_caesthetic_growth_preview");
  assert.match(issue, /token_hash/);
  assert.match(issue, /approved_evidence_required/);
  assert.doesNotMatch(issue, /caesthetic_score_cases|candidate_evidence|fetch|crawl|screenshot|llm|model/i);
});

test("GET/open is render-only and stale, expired, or suppressed evidence fails closed", () => {
  const open = functionBody("open_caesthetic_growth_preview", "continue_caesthetic_growth_preview");
  assert.doesNotMatch(open, /INSERT INTO public\.caesthetic_growth_score_leads|INSERT INTO public\.caesthetic_score_cases/);
  assert.match(open, /outreach_suppression/);
  assert.match(open, /evidence_expires_at <= v_now/);
  assert.match(open, /evidence_observed_at < v_now - interval '120 days'/);
  assert.match(open, /'unavailable'/);
});

test("Continue is atomic and idempotently creates exactly one canonical case", () => {
  const continued = functionBody("continue_caesthetic_growth_preview", null);
  assert.match(continued, /FOR UPDATE/);
  assert.match(continued, /IF v_row\.state = 'continued'/);
  assert.equal((continued.match(/INSERT INTO public\.caesthetic_score_cases/g) || []).length, 1);
  assert.equal((continued.match(/INSERT INTO public\.caesthetic_growth_score_leads/g) || []).length, 1);
  assert.match(continued, /source_kind[\s\S]*'outbound_preview'/);
  assert.match(continued, /caesthetic_score_outbox/);
  assert.match(continued, /system:qa[\s\S]*qa_archive/);
});

test("preview analytics exclude personal dimensions", () => {
  assert.match(migration, /preview_issued[\s\S]*preview_opened[\s\S]*preview_rendered[\s\S]*preview_continued[\s\S]*score_case_created/);
  assert.match(migration, /events_no_pii_check/);
  assert.match(migration, /'email'.*'name'.*'first_name'.*'phone'.*'practice_name'.*'site_url'/s);
  const eventColumns = migration.match(/CREATE TABLE public\.caesthetic_growth_preview_events \([\s\S]*?\n\);/)?.[0] || "";
  assert.doesNotMatch(eventColumns, /^\s+(email|first_name|practice_name|site_url)\s/m);
});

test("private page is deterministic, noindex, practice-only, and non-diagnostic", () => {
  assert.match(renderer, /Continue to My Free Growth Score/);
  assert.match(renderer, /Search \/ Google Business Profile.*Website.*Social.*Reputation \/ Reviews/s);
  assert.match(renderer, /Locked · not assessed in this preview/);
  assert.match(renderer, /This preview does not score them or draw a conclusion/);
  assert.match(renderer, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(renderer, /Referrer-Policy.*no-referrer/s);
  assert.doesNotMatch(renderer, /view\.first_name|view\.email/);
  assert.match(renderer, /url\.protocol === "https:" \|\| url\.protocol === "http:"/);
  assert.doesNotMatch(renderer, /\b(?:[1-9][0-9]?|100)\s*\/\s*100\b/);
});

test("edge route accepts only a 32-byte opaque token and keeps strict private headers", () => {
  assert.ok(router.includes("/^\\/preview\\/([A-Za-z0-9_-]{43})\\/$/"));
  assert.match(router, /GROWTH_PREVIEW_ORIGIN/);
  assert.match(router, /X-CAESTHETIC-Growth-Preview-Proxy/);
  assert.match(headers, /pathname\.startsWith\('\/preview\/'\)/);
  assert.match(headers, /headers\.get\(key\) === 'no-referrer'/);
});

test("wave rows fail closed on every launch prerequisite", () => {
  const fixture = parseCsv(read("tests/fixtures/caesthetic-growth-preview-synthetic.csv"))[0];
  assert.deepEqual(validateRow(fixture, new Date("2026-09-04T12:00:00Z")), []);
  for (const [field, expected] of [
    ["emailVerified", "verified_email_required"], ["suppressionClear", "suppression_clear_required"],
    ["conflictClear", "conflict_clear_required"], ["evidenceApproved", "approved_evidence_required"],
  ]) {
    assert.ok(validateRow({ ...fixture, [field]: "false" }, new Date("2026-09-04T12:00:00Z")).includes(expected));
  }
  assert.ok(validateRow({ ...fixture, activeNarrativeCount: "2" }, new Date("2026-09-04T12:00:00Z")).includes("one_active_narrative_required"));
  assert.ok(validateRow({ ...fixture, verifiedSignal: "Your binding constraint caused revenue loss" }, new Date("2026-09-04T12:00:00Z")).includes("diagnostic_language_forbidden"));
});

test("named-human Growth Score delivery authority remains intact", () => {
  assert.match(enforcement, /named human/i);
  assert.match(enforcement, /approval/i);
  assert.doesNotMatch(migration, /UPDATE public\.caesthetic_score_cases SET state = 'approved'/);
  assert.doesNotMatch(handler, /state:\s*["']approved["']/);
});
