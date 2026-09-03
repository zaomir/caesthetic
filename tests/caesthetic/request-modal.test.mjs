import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("../..", import.meta.url).pathname);
const site = resolve(root, "site-caesthetic");
const js = readFileSync(resolve(site, "assets/js/caesthetic.js"), "utf8");
const css = readFileSync(resolve(site, "assets/css/caesthetic.css"), "utf8");
const config = readFileSync(resolve(site, "assets/js/caesthetic-config.js"), "utf8");
const fn = readFileSync(resolve(root, "supabase/functions/submit-caesthetic-request/index.ts"), "utf8");
const migration = readFileSync(resolve(root, "supabase/migrations/20260903221000_caesthetic_public_requests.sql"), "utf8");
const supabase = readFileSync(resolve(root, "supabase/config.toml"), "utf8");

test("request CTAs open one shared modal with exactly name and email fields", () => {
  assert.match(js, /a\.cae-btn\[href\^="mailto:"\]/);
  assert.match(js, /<dialog|createElement\("dialog"\)/);
  const inputNames = [...js.matchAll(/<input\b[^>]*\bname="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(inputNames.filter((name) => ["name", "email"].includes(name)), ["name", "email"]);
  assert.doesNotMatch(js, /name="(?:phone|company|budget|message)"/);
  assert.match(js, /dialog\.showModal\(\)/);
  assert.match(js, /window\.CAESTHETIC_API\.request/);
  assert.match(css, /\.cae-request-modal/);
});

test("two-field request endpoint validates, rate-limits and stores requests privately", () => {
  assert.match(config, /functions\/v1\/submit-caesthetic-request/);
  assert.match(fn, /name_and_email_required/);
  assert.match(fn, /rate_limited/);
  assert.match(fn, /origin_not_allowed/);
  assert.match(fn, /caesthetic_public_requests/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL[\s\S]*anon, authenticated/);
  assert.match(supabase, /\[functions\.submit-caesthetic-request\][\s\S]*verify_jwt\s*=\s*false/);
});
