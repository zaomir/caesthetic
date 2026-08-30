import assert from "node:assert/strict";
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
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../../..");
const FIXTURES = path.join(PACKAGE_ROOT, "tests/fixtures/evidence-v2-real-shadow");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "cae-real-shadow-4444-"));
const bank = path.join(temp, "bank");
const staging = path.join(temp, "staging");
const audit = path.join(temp, "audit");
const fixedNow = new Date("2026-08-24T12:00:00.000Z");
const testKeyMaterial = "REAL_SHADOW_TEST_KEY_NOT_PRODUCTION_SECRET_0001";

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
  const manifest = JSON.parse(fs.readFileSync(path.join(FIXTURES, "render-manifest.json"), "utf8"));
  const unitFile = path.join(bank, "CAE-EV-4444-001/manifest.json");
  const artifactFile = path.join(bank, "CAE-EV-4444-001/clean/accepted-reel-structure.json");
  const unitBefore = fs.readFileSync(unitFile);
  const cleanArtifact = JSON.parse(fs.readFileSync(artifactFile, "utf8"));

  const sourceManifestPath = path.join(
    REPO_ROOT,
    "docs/projects/caesthetic/operations/ig-growth/reels/episodes/003-instagram-interest-no-booking.yaml",
  );
  const sourceManifest = fs.readFileSync(sourceManifestPath, "utf8");
  assert.equal(cleanArtifact.content_id, "CAE-REEL-A-IG-4444-001");
  assert.equal(
    cleanArtifact.accepted_master_sha256,
    "b213fbbff3193b04d8beb41ecb6cf203b5fd39aea0fdb0d4b0766749a3685da6",
  );
  assert.match(sourceManifest, new RegExp(cleanArtifact.accepted_master_sha256));
  assert.equal(cleanArtifact.observed_structure.journey_count, 1);
  assert.deepEqual(
    [...cleanArtifact.observed_structure.surfaces].sort(),
    ["reputation", "search", "social", "website"],
  );
  assert.equal(cleanArtifact.observed_structure.website_booking_action, "not_present_in_inspected_route");
  for (const marker of ["Instagram", "Website", "Reputation", "Maps", "no booking button"]) {
    assert.match(sourceManifest, new RegExp(marker, "i"));
  }

  const signingService = new SyntheticSigningService([
    {key_id: "real-shadow-test-k1", secret: testKeyMaterial, status: "active"},
  ]);
  const resolution = resolveShadow({
    manifest,
    sceneId: "S01",
    bankRoot: bank,
    stagingRoot: staging,
    auditRoot: audit,
    renderRequestId: "REAL-SHADOW-4444-0001",
    nonce: "real_shadow_nonce_4444_0001",
    signingService,
    keyId: "real-shadow-test-k1",
    now: fixedNow,
  });
  const scene = verifyShadowForSyntheticRender({
    resolution,
    manifest,
    renderRequestId: "REAL-SHADOW-4444-0001",
    signingService,
    replayStore: new InMemoryReplayStore(),
    now: fixedNow,
  });

  assert.equal(scene.headline, "4 SURFACES. 1 JOURNEY.");
  assert.equal(scene.binding_constraint.surface_id, "website");
  assert.deepEqual(scene.evidence.evidence_ids, ["CAE-EV-4444-001"]);

  const wrapperSource = fs.readFileSync(path.join(PACKAGE_ROOT, "src/ValidatedFourSurfaceMap.tsx"), "utf8");
  if (!wrapperSource.includes("Production rendering is disabled until PUBLISHABLE evidence resolution succeeds")) {
    throw new Error("production_throw_missing");
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
  const first = path.join(temp, "real-shadow-4444-a.png");
  const second = path.join(temp, "real-shadow-4444-b.png");
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
  if (!a.equals(b)) throw new Error("real_shadow_render_not_deterministic");
  if (!fs.readFileSync(unitFile).equals(unitBefore)) throw new Error("source_unit_mutated");
  const unitAfter = JSON.parse(fs.readFileSync(unitFile, "utf8"));
  if (unitAfter.lifecycle_state !== "CAPTURED") throw new Error("source_unit_promoted");

  process.stdout.write(`${JSON.stringify({
    ok: true,
    mode: resolution.attestation.mode,
    decision: resolution.attestation.decision,
    claim: scene.headline,
    evidence_unit_id: unitAfter.unit_id,
    source_unit_state: unitAfter.lifecycle_state,
    production_throw_present: true,
    accepted_master_sha256: cleanArtifact.accepted_master_sha256,
    clean_artifact_sha256: crypto.createHash("sha256").update(fs.readFileSync(artifactFile)).digest("hex"),
    attestation_sha256: crypto.createHash("sha256").update(JSON.stringify(resolution.attestation)).digest("hex"),
    render_sha256: crypto.createHash("sha256").update(a).digest("hex"),
    render_bytes: a.length,
    deterministic_second_render: true,
    audit_record_created: fs.existsSync(resolution.audit_path),
  }, null, 2)}\n`);
} finally {
  makeWritableForCleanup(temp);
  fs.rmSync(temp, {recursive: true, force: true});
}
