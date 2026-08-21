#!/usr/bin/env node
/**
 * CAESTHETIC Evidence Bank — CLI for scaffolding, validating and promoting
 * evidence units. SSOT: docs/ssot/CAESTHETIC_EVIDENCE_BANK.md (DEC-842)
 *
 * Storage layout (local mirror of the Dropbox namespace):
 *   Production/evidence-bank/<unit_id>/
 *     manifest.json
 *     raw/       (unredacted originals — never read by any render pipeline)
 *     clean/     (redacted, publishable artifacts)
 *
 * Usage:
 *   node scripts/caesthetic/evidence/new-unit.mjs new <unit_id> [--label <EpistemicLabel>]
 *   node scripts/caesthetic/evidence/new-unit.mjs status <unit_id>
 *   node scripts/caesthetic/evidence/new-unit.mjs promote <unit_id>
 *   node scripts/caesthetic/evidence/new-unit.mjs list
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPromoteToPublishable, EPISTEMIC_LABELS, validateManifest } from "./schema.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
export const BANK_ROOT = process.env.CAE_EVIDENCE_BANK_ROOT
  || path.join(REPO_ROOT, "Production/evidence-bank");

const UNIT_ID_RE = /^[A-Za-z0-9._-]{6,80}$/;

export function assertUnitId(id) {
  if (!UNIT_ID_RE.test(String(id || ""))) {
    throw Object.assign(new Error(`invalid_unit_id:${id}`), { code: "invalid_unit_id" });
  }
  return id;
}

export function unitDir(unitId, root = BANK_ROOT) {
  return path.join(root, assertUnitId(unitId));
}

export function manifestPath(unitId, root = BANK_ROOT) {
  return path.join(unitDir(unitId, root), "manifest.json");
}

export function readManifest(unitId, root = BANK_ROOT) {
  const file = manifestPath(unitId, root);
  if (!fs.existsSync(file)) {
    throw Object.assign(new Error(`unit_not_found:${unitId}`), { code: "unit_not_found" });
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeManifest(unitId, manifest, root = BANK_ROOT) {
  const dir = unitDir(unitId, root);
  fs.mkdirSync(path.join(dir, "raw"), { recursive: true });
  fs.mkdirSync(path.join(dir, "clean"), { recursive: true });
  fs.writeFileSync(manifestPath(unitId, root), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function scaffoldUnit(unitId, { label = "Observed", source = "" } = {}, root = BANK_ROOT) {
  assertUnitId(unitId);
  if (fs.existsSync(manifestPath(unitId, root))) {
    throw Object.assign(new Error(`unit_already_exists:${unitId}`), { code: "unit_already_exists" });
  }
  if (!EPISTEMIC_LABELS.includes(label)) {
    throw Object.assign(new Error(`invalid_epistemic_label:${label}`), { code: "invalid_epistemic_label" });
  }
  const manifest = {
    unit_id: unitId,
    source: source || "",
    capture_date: new Date().toISOString().slice(0, 10),
    epistemic_label: label,
    verified_observation: "",
    allowed_public_wording: "",
    method_scope: "",
    rights_status: label === "Illustrative" ? "public_source" : "",
    consent_ref: "",
    redaction_status: label === "Illustrative" ? "not_applicable" : "pending",
    reviewer: "",
    lifecycle_state: "CAPTURED",
    reuse: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return writeManifest(unitId, manifest, root);
}

export function promoteUnit(unitId, root = BANK_ROOT) {
  const manifest = readManifest(unitId, root);
  const decision = canPromoteToPublishable(manifest);
  if (!decision.ok) return { unitId, promoted: false, ...decision };
  manifest.lifecycle_state = "PUBLISHABLE";
  manifest.updated_at = new Date().toISOString();
  writeManifest(unitId, manifest, root);
  return { unitId, promoted: true, errors: [], missing: [] };
}

export function statusUnit(unitId, root = BANK_ROOT) {
  const manifest = readManifest(unitId, root);
  const validation = validateManifest(manifest);
  const promotion = canPromoteToPublishable(manifest);
  return { unitId, lifecycle_state: manifest.lifecycle_state, validation, can_promote: promotion.ok, promotion };
}

export function listUnits(root = BANK_ROOT) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "manifest.json")))
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  const [, , cmd, unitId, ...rest] = process.argv;
  try {
    if (cmd === "new") {
      const labelFlag = rest.indexOf("--label");
      const label = labelFlag >= 0 ? rest[labelFlag + 1] : "Observed";
      const sourceFlag = rest.indexOf("--source");
      const source = sourceFlag >= 0 ? rest[sourceFlag + 1] : "";
      const manifest = scaffoldUnit(unitId, { label, source });
      console.log(JSON.stringify({ ok: true, unitId, manifest }, null, 2));
    } else if (cmd === "status") {
      console.log(JSON.stringify(statusUnit(unitId), null, 2));
    } else if (cmd === "promote") {
      console.log(JSON.stringify(promoteUnit(unitId), null, 2));
    } else if (cmd === "list") {
      console.log(JSON.stringify({ units: listUnits() }, null, 2));
    } else {
      console.error(`Usage:
  node scripts/caesthetic/evidence/new-unit.mjs new <unit_id> [--label <EpistemicLabel>] [--source <text>]
  node scripts/caesthetic/evidence/new-unit.mjs status <unit_id>
  node scripts/caesthetic/evidence/new-unit.mjs promote <unit_id>
  node scripts/caesthetic/evidence/new-unit.mjs list`);
      process.exit(cmd ? 1 : 0);
    }
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message, code: err.code || "internal" }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
