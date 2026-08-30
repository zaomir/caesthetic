import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";

import {InMemoryReplayStore, resolveShadow, verifyShadowForSyntheticRender} from "../../evidence-v2-shadow/shadow-resolver.mjs";
import {SyntheticSigningService} from "../../evidence-v2-shadow/synthetic-signing-service.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..");
const FIXTURES = path.join(PACKAGE_ROOT, "tests/fixtures/evidence-v2");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "cae-synthetic-e2e-"));
const bank = path.join(temp, "bank");
const staging = path.join(temp, "staging");
const audit = path.join(temp, "audit");
const fixedNow = new Date("2026-08-24T10:00:00.000Z");
const testKeyMaterial = "SYNTHETIC_TEST_KEY_MATERIAL_NOT_SECRET_0001";

function makeWritableForCleanup(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.lstatSync(target);
  if (stat.isDirectory()) {
    fs.chmodSync(target, 0o700);
    for (const entry of fs.readdirSync(target)) makeWritableForCleanup(path.join(target, entry));
  } else if (!stat.isSymbolicLink()) {
    fs.chmodSync(target, 0o600);
  }
}

try {
  fs.cpSync(path.join(FIXTURES, "bank"), bank, {recursive: true});
  const manifest = JSON.parse(fs.readFileSync(path.join(FIXTURES, "production-manifest.json"), "utf8"));
  const unitFile = path.join(bank, "SYNTH-EV-001/manifest.json");
  const unitBefore = fs.readFileSync(unitFile);

  const signingService = new SyntheticSigningService([
    {key_id: "synthetic-k1", secret: testKeyMaterial, status: "active"},
  ]);
  const resolution = resolveShadow({
    manifest,
    sceneId: "S01",
    bankRoot: bank,
    stagingRoot: staging,
    auditRoot: audit,
    renderRequestId: "SYNTH-E2E-RENDER-0001",
    nonce: "synthetic_e2e_nonce_0001",
    signingService,
    keyId: "synthetic-k1",
    now: fixedNow,
  });
  const scene = verifyShadowForSyntheticRender({
    resolution,
    manifest,
    renderRequestId: "SYNTH-E2E-RENDER-0001",
    signingService,
    replayStore: new InMemoryReplayStore(),
    now: fixedNow,
  });

  const wrapperSource = fs.readFileSync(path.join(PACKAGE_ROOT, "src/ValidatedFourSurfaceMap.tsx"), "utf8");
  if (!wrapperSource.includes("Production rendering is disabled until PUBLISHABLE evidence resolution succeeds")) {
    throw new Error("production_throw_missing");
  }
  const rootSource = fs.readFileSync(path.join(PACKAGE_ROOT, "src/Root.tsx"), "utf8");
  if (/ProductionRoot|ProductionFourSurfaceMap|production composition/i.test(rootSource)) {
    throw new Error("production_composition_leaked_into_default_root");
  }

  const serveUrl = await bundle({
    entryPoint: path.join(PACKAGE_ROOT, "tests/synthetic-shadow-entry.tsx"),
    webpackOverride: (config) => config,
  });
  const composition = await selectComposition({
    serveUrl,
    id: "SyntheticShadowFourSurfaceMap",
    inputProps: {scene},
  });
  const first = path.join(temp, "synthetic-e2e-a.png");
  const second = path.join(temp, "synthetic-e2e-b.png");
  for (const output of [first, second]) {
    await renderStill({
      serveUrl,
      composition,
      inputProps: {scene},
      output,
      frame: 179,
      imageFormat: "png",
    });
  }
  const a = fs.readFileSync(first);
  const b = fs.readFileSync(second);
  if (!a.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) {
    throw new Error("synthetic_render_not_png");
  }
  if (!a.equals(b)) throw new Error("synthetic_render_not_deterministic");
  if (!fs.readFileSync(unitFile).equals(unitBefore)) throw new Error("source_unit_mutated");
  const unitAfter = JSON.parse(fs.readFileSync(unitFile, "utf8"));
  if (unitAfter.lifecycle_state !== "CAPTURED") throw new Error("source_unit_promoted");

  const result = {
    ok: true,
    mode: resolution.attestation.mode,
    decision: resolution.attestation.decision,
    source_unit_state: unitAfter.lifecycle_state,
    production_throw_present: true,
    default_root_has_production_composition: false,
    attestation_sha256: crypto.createHash("sha256").update(JSON.stringify(resolution.attestation)).digest("hex"),
    render_sha256: crypto.createHash("sha256").update(a).digest("hex"),
    render_bytes: a.length,
    deterministic_second_render: true,
    audit_record_created: fs.existsSync(resolution.audit_path),
    staged_artifacts: resolution.staged_artifacts.length,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  makeWritableForCleanup(temp);
  fs.rmSync(temp, {recursive: true, force: true});
}
