import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const operatorPath = "docs/ssot/CAESTHETIC_HOOPPY_POSTING_OPERATOR.md";
const operator = read(operatorPath);

test("operator contract fixes the controlled accounts and vertical placements", () => {
  for (const pageId of ["2442190", "1977644", "2446140", "2443192", "2442189"]) {
    assert.ok(operator.includes(pageId), `missing Hooppy page ${pageId}`);
  }
  assert.match(operator, /@caesthetic\.growth/);
  assert.match(operator, /The Aesthetic Collective/);
  assert.match(operator, /YouTube receives only the vertical Short variant/);
  assert.match(operator, /separate physical file and a separate Hooppy upload\/media ID/);
});

test("operator contract is fail-closed and uses the approved New York schedule", () => {
  for (const gate of [
    "rights_status=GO",
    "audio_status=GO",
    "privacy_status=GO",
    "claims_status=GO",
    "visual_qa_status=GO",
    "approved_publish=TRUE",
  ]) {
    assert.ok(operator.includes(gate), `missing gate ${gate}`);
  }
  assert.match(operator, /America\/New_York/);
  assert.match(operator, /Informational content: weekdays only/);
  assert.match(operator, /Entertainment content may use weekends/);
  assert.match(operator, /never instead of the protected Wednesday/);
  assert.match(operator, /Never send New York wall-clock hours blindly/);
});

test("another agent can submit a secret-free, exact posting job", () => {
  assert.match(operator, /schema: caesthetic-hooppy-posting-job\/1\.0\.0/);
  assert.match(operator, /sheet:/);
  assert.match(operator, /approval:/);
  assert.match(operator, /schedule:/);
  assert.match(operator, /destinations:/);
  assert.match(operator, /expected_sha256: REQUIRED/);
  assert.match(operator, /Do not put Bearer\/JWT/);
  assert.match(operator, /If any named field is missing.*exact missing\n?\s*gate/s);
});

test("delivery uses the current media attachment shape and terminal evidence", () => {
  assert.match(operator, /"type": "photos"/);
  assert.match(operator, /"data": \[\{ "id": "MEDIA_ID", "type": "video" \}\]/);
  assert.match(operator, /GET \/posts reconcile/);
  assert.match(operator, /GET \/notifications reconcile/);
  assert.match(operator, /correct-account public URL/);
  assert.match(operator, /only then write LIVE/);
  assert.match(operator, /DELIVERY_UNVERIFIED/);
});

test("shared and CAESTHETIC routers expose the operator contract", () => {
  const sharedRouter = read("docs/ROUTER.md");
  const projectRouter = read("docs/projects/caesthetic/ROUTER.md");
  const controlPlane = read("docs/ssot/SOCIAL_ACCOUNT_CONTROL_PLANE.md");
  const registry = read("agents/registry.yaml");
  const manifest = read("agents/manifests/caesthetic.yaml");
  const scriptsReadme = read("scripts/caesthetic/README.md");

  for (const routedDocument of [sharedRouter, projectRouter, controlPlane, registry, manifest, scriptsReadme]) {
    assert.ok(routedDocument.includes("CAESTHETIC_HOOPPY_POSTING_OPERATOR.md"));
  }
  assert.match(registry, /hooppy_or_caesthetic_posting:/);
  assert.match(manifest, /posting_job:/);
  assert.match(manifest, /hooppy_schedule_dry_run:/);
  assert.match(scriptsReadme, /caesthetic-hooppy-posting-job\/1\.0\.0/);
});
