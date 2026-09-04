import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("../..", import.meta.url).pathname);
const read = (path) => readFileSync(resolve(root, path), "utf8");
const runtime = read("site-caesthetic/assets/js/case-studies.js");
const catalogue = read("site-caesthetic/case-studies/index.html");
const router = read("infra/cloudflare/router/src/index.ts");
const smoke = read("scripts/caesthetic-case-intake-production-smoke.sh");
const intake = read("site-caesthetic/case-studies/intake/index.html");
const header = read("site-caesthetic/templates/header.html");

test("case catalogue consumes already-parsed data and exposes a consistent failure state", () => {
  assert.match(runtime, /loadCaseData\(\)\s*\.then\(function \(data\)/);
  assert.doesNotMatch(runtime, /loadCaseData\(\)\s*\.then\(function \(response\)[\s\S]{0,180}response\.json/);
  assert.ok(runtime.includes("document.querySelector('[data-result-count]').textContent = 'Cases unavailable';"));
  assert.ok(runtime.includes("document.querySelector('[data-result-count-mobile]').textContent = 'Cases unavailable';"));
  assert.ok(runtime.includes("document.querySelector('[data-visible-range]').textContent = 'Showing 0';"));
  assert.doesNotMatch(catalogue, />25 cases</);
  assert.match(catalogue, /Loading case data…/);
});

test("Case Studies stays published while internal intake and guide fail closed", () => {
  assert.match(header, /href="\/case-studies\/"/);
  assert.match(router, /url\.pathname === `\$\{CASE_INTAKE_PREFIX\}\/api\/public-cases`/);
  assert.match(router, /proxyPublicCaseData/);
  assert.match(router, /protectedCaseIntakeResponse\(\)/);
  assert.match(router, /X-CAESTHETIC-Case-Intake', 'public-cases'/);
  assert.match(smoke, /probe_closed "\$ROOT_URL\/guide" guide/);
  assert.match(smoke, /probe_closed "\$ROOT_URL\/api\/cases" internal-api/);
  assert.match(smoke, /probe_public_cases/);
  assert.doesNotMatch(intake, /webtra\.chatgpt\.site|location\.replace/);
});
