#!/usr/bin/env node
/**
 * CAESTHETIC Evidence Bank — extract candidate units from a delivered
 * Growth Score report. SSOT: docs/ssot/CAESTHETIC_EVIDENCE_BANK.md (DEC-842)
 *
 * Reads the same report.json shape scored by
 * site-caesthetic/assets/js/growth-score-engine.mjs and drafts one
 * CAPTURED evidence unit per metric that is:
 *   - reviewer_status === "approved"
 *   - evidence_class === "A" (independently observed, not an estimate)
 *   - carries a non-empty `finding` (a human-readable observation)
 *
 * Every drafted unit is conservative by construction: rights_status starts
 * at "anonymized_only" and redaction_status at "pending" regardless of the
 * source metric, because a client's own Score data needs an explicit
 * consent decision before it can become "client_consented" — this script
 * never makes that call. A human promotes with new-unit.mjs after review.
 *
 * Usage:
 *   node scripts/caesthetic/evidence/from-score.mjs <report.json> --client <label>
 */
import fs from "node:fs";
import path from "node:path";
import { scaffoldUnit, writeManifest } from "./new-unit.mjs";

const SURFACES = Object.freeze(["search", "website", "social", "reputation", "cross"]);

export function extractCandidates(report) {
  const candidates = [];
  for (const surfaceId of SURFACES) {
    const surface = report?.surfaces?.[surfaceId];
    const metrics = Array.isArray(surface?.metrics) ? surface.metrics : [];
    for (const metric of metrics) {
      const eligible = metric?.reviewer_status === "approved"
        && metric?.evidence_class === "A"
        && typeof metric?.finding === "string"
        && metric.finding.trim().length > 0;
      if (!eligible) continue;
      candidates.push({
        surfaceId,
        metricId: metric.metric_id,
        finding: metric.finding.trim(),
        source: metric.source || "",
        collectedAt: metric.collected_at || "",
        rawValue: metric.raw_value,
      });
    }
  }
  return candidates;
}

function slug(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function draftUnitsFromScore(report, { clientLabel = "client", root } = {}) {
  const candidates = extractCandidates(report);
  const results = [];
  for (const candidate of candidates) {
    const unitId = `score-${slug(clientLabel)}-${candidate.surfaceId}-${slug(candidate.metricId)}-${slug(candidate.collectedAt).slice(0, 10) || "nodate"}`;
    try {
      const manifest = scaffoldUnit(unitId, { label: "Observed", source: candidate.source }, root);
      manifest.verified_observation = candidate.finding;
      manifest.allowed_public_wording = candidate.finding;
      manifest.capture_date = (candidate.collectedAt || manifest.capture_date).slice(0, 10);
      manifest.rights_status = "anonymized_only";
      manifest.redaction_status = "pending";
      manifest.updated_at = new Date().toISOString();
      writeManifest(unitId, manifest, root);
      results.push({ unitId, drafted: true });
    } catch (err) {
      results.push({ unitId, drafted: false, error: err.message, code: err.code });
    }
  }
  return results;
}

async function main() {
  const [, , reportPath, ...rest] = process.argv;
  if (!reportPath) {
    console.error("Usage: node scripts/caesthetic/evidence/from-score.mjs <report.json> --client <label>");
    process.exit(2);
  }
  const clientFlag = rest.indexOf("--client");
  const clientLabel = clientFlag >= 0 ? rest[clientFlag + 1] : "client";
  const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), "utf8"));
  const results = draftUnitsFromScore(report, { clientLabel });
  console.log(JSON.stringify({
    ok: true,
    candidates_found: results.length,
    drafted: results.filter((r) => r.drafted).length,
    results,
    next_step: "Review each draft manifest, set reviewer + redaction_status, then run new-unit.mjs promote once rights_status is decided.",
  }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
