import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { preparePublishRequest, submitPublishRequest, checkEvidenceClearance, readVideoQa } from "../../scripts/caesthetic/asset-worker/publish-request.mjs";
import { scaffoldUnit, promoteUnit } from "../../scripts/caesthetic/evidence/new-unit.mjs";

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeQa(dir, overrides = {}) {
  const qa = { episode: 1, status: "qa_pass", qa: { pass: true }, ...overrides };
  fs.writeFileSync(path.join(dir, "video-qa.json"), JSON.stringify(qa));
  return qa;
}

test("readVideoQa throws a typed error when video-qa.json is missing", () => {
  const dir = tmpDir("cae-pub-noqa-");
  assert.throws(() => readVideoQa(dir), /missing_video_qa/);
});

test("checkEvidenceClearance: PUBLISHABLE units clear, CAPTURED units block", () => {
  const bank = tmpDir("cae-pub-bank-");
  scaffoldUnit("clearance-a", { label: "Observed", source: "public GBP" }, bank);
  const manifestPath = path.join(bank, "clearance-a", "manifest.json");
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  m.verified_observation = "x"; m.allowed_public_wording = "x"; m.reviewer = "Валерия Иванова";
  m.rights_status = "public_source"; m.redaction_status = "clean";
  fs.writeFileSync(manifestPath, JSON.stringify(m));
  const promoted = promoteUnit("clearance-a", bank);
  assert.equal(promoted.promoted, true);

  scaffoldUnit("clearance-b", { label: "Observed", source: "client booking flow" }, bank);

  const result = checkEvidenceClearance(["clearance-a", "clearance-b"], bank);
  assert.equal(result.allCleared, false);
  const a = result.results.find((r) => r.unitId === "clearance-a");
  const b = result.results.find((r) => r.unitId === "clearance-b");
  assert.equal(a.cleared, true);
  assert.equal(b.cleared, false);
});

test("checkEvidenceClearance reports a clear reason for a unit that does not exist", () => {
  const bank = tmpDir("cae-pub-bank-missing-");
  const result = checkEvidenceClearance(["does-not-exist"], bank);
  assert.equal(result.allCleared, false);
  assert.match(result.results[0].reason, /unit_not_found/);
});

test("preparePublishRequest throws video_qa_not_passed when QA failed", () => {
  const reelsDir = tmpDir("cae-pub-reels-fail-");
  writeQa(reelsDir, { status: "qa_pending" });
  assert.throws(
    () => preparePublishRequest({
      requestId: "req-1", reelsDir, caption: "caption",
      profileId: "p1", expectedAccountIdentity: "acct", evidenceUnitIds: [], evidenceBankRoot: tmpDir("cae-pub-bank-empty-"),
    }),
    /video_qa_not_passed/,
  );
});

test("preparePublishRequest throws missing_caption on empty caption", () => {
  const reelsDir = tmpDir("cae-pub-reels-nocap-");
  writeQa(reelsDir);
  assert.throws(
    () => preparePublishRequest({
      requestId: "req-1", reelsDir, caption: "   ",
      profileId: "p1", expectedAccountIdentity: "acct", evidenceUnitIds: [], evidenceBankRoot: tmpDir("cae-pub-bank-empty2-"),
    }),
    /missing_caption/,
  );
});

test("preparePublishRequest throws evidence_not_cleared when a cited unit is not PUBLISHABLE", () => {
  const reelsDir = tmpDir("cae-pub-reels-ev-");
  writeQa(reelsDir);
  const bank = tmpDir("cae-pub-bank-ev-");
  scaffoldUnit("uncleared-unit", { label: "Observed", source: "x" }, bank);
  assert.throws(
    () => preparePublishRequest({
      requestId: "req-1", reelsDir, caption: "caption",
      profileId: "p1", expectedAccountIdentity: "acct", evidenceUnitIds: ["uncleared-unit"], evidenceBankRoot: bank,
    }),
    /evidence_not_cleared/,
  );
});

test("preparePublishRequest succeeds end-to-end and produces a stable idempotency_key", () => {
  const reelsDir = tmpDir("cae-pub-reels-ok-");
  writeQa(reelsDir, { episode: 7 });
  const bank = tmpDir("cae-pub-bank-ok-");

  const params = {
    requestId: "req-stable", reelsDir, caption: "Reviews are coming in — is anyone answering them?",
    profileId: "p1", expectedAccountIdentity: "@caesthetic.growth", evidenceUnitIds: [], evidenceBankRoot: bank,
  };
  const req1 = preparePublishRequest(params);
  const req2 = preparePublishRequest(params);
  assert.equal(req1.idempotency_key, req2.idempotency_key, "same inputs must yield the same idempotency_key");
  assert.equal(req1.platform, "instagram");
  assert.match(req1.video_path, /daily-growth-note-007\.mp4$/);
});

test("preparePublishRequest throws missing_profile_id_or_contour when neither is given", () => {
  const reelsDir = tmpDir("cae-pub-reels-nocontour-");
  writeQa(reelsDir);
  assert.throws(
    () => preparePublishRequest({
      requestId: "req-1", reelsDir, caption: "caption", evidenceUnitIds: [], evidenceBankRoot: tmpDir("cae-pub-bank-nc-"),
    }),
    /missing_profile_id_or_contour/,
  );
});

test("preparePublishRequest resolves --contour and the registry gate blocks execution", async () => {
  const reelsDir = tmpDir("cae-pub-reels-contour-");
  writeQa(reelsDir);
  const bank = tmpDir("cae-pub-bank-contour-");
  const request = preparePublishRequest({
    requestId: "req-contour", reelsDir, caption: "caption",
    contour: "caesthetic", evidenceUnitIds: [], evidenceBankRoot: bank,
  });
  assert.equal(request.profile_id, "833304152");
  assert.equal(request.expected_account_identity, "caesthetic.growth");
  assert.ok(request.routing, "routing must be attached when resolved via --contour");
  assert.equal(request.routing.surface_account_id, "valeria-lana-caesthetic-instagram");
  assert.equal(request.routing.publish_readiness.ready, false);
  assert.ok(request.routing.publish_readiness.blocking_reasons.length > 0);

  const submitted = await submitPublishRequest(request, async () => ({ ok: true }));
  assert.equal(submitted.status, "blocked_registry_gate");
  assert.deepEqual(submitted.registry_blocking_reasons, request.routing.publish_readiness.blocking_reasons);
});

test("preparePublishRequest throws ambiguous_or_unknown_contour_route for a contour with no registry match", () => {
  const reelsDir = tmpDir("cae-pub-reels-badcontour-");
  writeQa(reelsDir);
  assert.throws(
    () => preparePublishRequest({
      requestId: "req-1", reelsDir, caption: "caption",
      contour: "definitely-not-a-real-contour", evidenceUnitIds: [], evidenceBankRoot: tmpDir("cae-pub-bank-bc-"),
    }),
    /ambiguous_or_unknown_contour_route/,
  );
});

test("an explicit profile_id always wins over --contour, even if both are given", () => {
  const reelsDir = tmpDir("cae-pub-reels-explicit-");
  writeQa(reelsDir);
  const request = preparePublishRequest({
    requestId: "req-explicit", reelsDir, caption: "caption",
    profileId: "explicit-profile", expectedAccountIdentity: "explicit-account",
    contour: "caesthetic", evidenceUnitIds: [], evidenceBankRoot: tmpDir("cae-pub-bank-explicit-"),
  });
  assert.equal(request.profile_id, "explicit-profile");
  assert.equal(request.routing, null, "routing must not be resolved when profile_id is explicit");
});

test("submitPublishRequest requires an executor and delegates when gates are clear", async () => {
  const reelsDir = tmpDir("cae-pub-reels-submit-");
  writeQa(reelsDir);
  const bank = tmpDir("cae-pub-bank-submit-");
  const request = preparePublishRequest({
    requestId: "req-submit", reelsDir, caption: "caption",
    profileId: "p1", expectedAccountIdentity: "acct", evidenceUnitIds: [], evidenceBankRoot: bank,
  });
  const result = await submitPublishRequest(request);
  assert.equal(result.ok, false);
  assert.equal(result.status, "blocked_missing_executor");
  assert.equal(result.adapter.platform, "instagram");
  assert.equal(result.adapter.supported, true);

  const delegated = await submitPublishRequest(request, async (value) => ({ ok: true, status: "LIVE_VERIFIED", value }));
  assert.equal(delegated.status, "LIVE_VERIFIED");
});
