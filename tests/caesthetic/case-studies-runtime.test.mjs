import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("../..", import.meta.url).pathname);
const read = (path) => readFileSync(resolve(root, path), "utf8");
const runtime = read("site-caesthetic/assets/js/case-studies.js");
const detail = read("site-caesthetic/assets/js/case-study-detail.js");
const media = read("site-caesthetic/assets/js/media-registry.js");
const catalogue = read("site-caesthetic/case-studies/index.html");
const router = read("infra/cloudflare/router/src/index.ts");
const smoke = read("scripts/caesthetic-case-intake-production-smoke.sh");
const intake = read("site-caesthetic/case-studies/intake/index.html");
const header = read("site-caesthetic/templates/header.html");
const registry = JSON.parse(read("site-caesthetic/media/registry.json"));

test("case catalogue consumes published JSON and exposes a consistent failure state", () => {
  assert.match(runtime, /fetch\('\/case-studies\/intake\/api\/public-cases'/);
  assert.match(runtime, /isPublicCatalogCase/);
  assert.match(runtime, /function showLoadError/);
  assert.ok(runtime.includes("document.querySelector('[data-load-error]').hidden = false"));
  assert.ok(runtime.includes("document.querySelector('[data-library-content]').hidden = true"));
  assert.doesNotMatch(catalogue, />25 cases</);
  assert.match(catalogue, /Loading published cases…/);
  assert.match(catalogue, /Loading case…/);
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

test("public catalog hides TEST records at the proxy and in catalogue/detail runtime", () => {
  assert.match(router, /function isPublicCatalogCase/);
  assert.match(router, /data\.cases = data\.cases\.filter\(isPublicCatalogCase\)/);
  assert.match(runtime, /function isPublicCatalogCase/);
  assert.match(detail, /function isPublicCatalogCase/);
  assert.match(detail, /\/\^test\[-_\]\/i\.test\(requestedId\)/);
  assert.match(catalogue, /Modeled records are labeled and are not client results/);
  assert.doesNotMatch(catalogue, /Test records are explicitly labeled/);
});

test("published Miami case has a registered niche cover", () => {
  const entry = registry.entries["case.miami-concierge-medspa-consult-path.cover"];
  assert.ok(entry);
  assert.equal(entry.state, "approved");
  assert.match(entry.src, /miami-concierge-medspa-consult-path\.webp$/);
  assert.match(media, /coverMediaId/);
  assert.match(runtime, /coverMediaId\(item\)/);
  assert.match(detail, /coverMediaId\(item\)/);
});
