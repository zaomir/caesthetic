import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildAuditStorageIndex, checkAuditStorage } from "../../scripts/caesthetic/audit-storage.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("every current audit has one shared case and every approved report record is owned", () => {
  const index = buildAuditStorageIndex({ repoRoot: root });
  assert.equal(index.counts.audits, 9);
  assert.equal(index.counts.approved_report_records, 12);
  assert.equal(new Set(index.cases.map((entry) => entry.audit_id)).size, index.cases.length);
  assert.equal(index.cases.some((entry) => entry.audit_id === "prestige-tenerife-2026"), true);
  assert.equal(index.cases.some((entry) => entry.audit_id === "spoken-medspa-snellville-2026"), true);
});

test("shared cases are public-evidence only and available in both repositories", () => {
  const index = buildAuditStorageIndex({ repoRoot: root });
  for (const entry of index.cases) {
    assert.equal(entry.evidence_policy, "public_sources_only");
    assert.deepEqual(entry.repository_access, ["zaomir/grainee-v2", "zaomir/caesthetic"]);
    assert.equal(entry.report_paths.every((value) => value.startsWith("docs/audits/caesthetic/growth-score/cases/")), true);
    assert.equal(entry.production_report_paths.every((value) => value.endsWith("/report.json")), true);
    assert.equal(entry.report_paths.some((value) => value.endsWith("/index.html")), false);
  }
});

test("generated audit navigation index is current", () => {
  assert.equal(checkAuditStorage({ repoRoot: root }), true);
  const text = fs.readFileSync(path.join(root, "docs/audits/caesthetic/growth-score/index.generated.json"), "utf8");
  assert.doesNotMatch(text, /password|password_hash|access_code|authorization|cookie/i);
});
