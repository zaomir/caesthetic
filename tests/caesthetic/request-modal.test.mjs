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

const requestPages = [
  "index.html",
  "growth-score/index.html",
  "lead-to-revenue-check/index.html",
  "sprint/index.html",
  "growth-system/index.html",
  "support/index.html",
  "outreach/index.html",
  "beauty-salons/index.html",
  "es/salones-de-belleza/index.html",
  "ru/salony-krasoty/index.html",
  "fr/salons-de-beaute/index.html",
].map((path) => readFileSync(resolve(site, path), "utf8"));

test("request CTAs open one shared modal with exactly name and email fields", () => {
  assert.match(js, /a\[data-cae-request\]/);
  assert.match(js, /a\.cae-btn\[href="\/growth-score\/"\]/);
  assert.match(js, /\[data-cae-score-form\] button\[type="submit"\]/);
  assert.match(js, /\[data-cae-salon-score-form\] button\[type="submit"\]/);
  assert.match(js, /<dialog|createElement\("dialog"\)/);
  const inputNames = [...js.matchAll(/<input\b[^>]*\bname="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(inputNames, ["name", "email"]);
  assert.doesNotMatch(js, /name="(?:phone|company|budget|message)"/);
  assert.doesNotMatch(js, /window\.location\.href\s*=\s*["']mailto:/);
  assert.match(js, /dialog\.showModal\(\)/);
  assert.match(js, /window\.CAESTHETIC_API\.request/);
  assert.match(css, /\.cae-request-modal/);
});

test("request CTA pages contain no mailto buttons and load the modal runtime", () => {
  for (const html of requestPages) {
    assert.doesNotMatch(html, /<a\b[^>]*class="[^"]*cae-btn[^"]*"[^>]*href="mailto:/i);
    assert.match(html, /\/assets\/js\/caesthetic\.js/);
  }
});

test("public score entry points expose only the shared request launcher", () => {
  const scorePages = requestPages.filter((html) => /(?:Get your Growth Score|Salon Growth Score|Growth Score intake)/i.test(html));
  for (const html of scorePages) {
    assert.doesNotMatch(html, /<form\b[^>]*(?:data-cae-score-form|data-cae-salon-score-form)/i);
    assert.match(html, /data-cae-request/);
  }
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
