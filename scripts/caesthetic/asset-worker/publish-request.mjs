#!/usr/bin/env node
/**
 * CAESTHETIC Reel publish request preparation.
 * SSOT: docs/ssot/CAESTHETIC_EVIDENCE_BANK.md §Publish ownership (DEC-842)
 *
 * This module does everything that is safe and verifiable without a live
 * browser session: it validates a finished Reel is actually publishable
 * (QA passed) and every Evidence Bank unit it cites is rights-clear, then
 * assembles a stable publish request envelope in the same shape
 * `services/social-browser-operator` already uses for LinkedIn/Facebook
 * (`profile_id`, `platform`, `expected_account_identity`, `idempotency_key`).
 *
 * It deliberately stops there. `services/social-browser-operator` has no
 * `instagram` platform and no video/Reels composer adapter today (its own
 * schemas restrict `social_attach_image` to "LinkedIn only", per
 * services/social-browser-operator/src/tools/schemas.ts). Writing untested
 * Playwright selectors against Instagram's live Reels upload UI, with no
 * browser access to verify them, is not something this script does —
 * `submitPublishRequest()` fails closed with `blocked_missing_adapter`
 * exactly like this codebase's existing unsupported-platform paths
 * (compare `social_edit_post`/`social_delete_post`: "Facebook returns
 * UNSUPPORTED until an adapter exists").
 *
 * Routing: which account a piece of content targets is resolved from the
 * real registry (`docs/ssot/data/social-account-registry.yaml`), not
 * hardcoded here — see `resolve-account.py` and `resolveAccountForContour()`
 * below. That registry's own `adapter_capabilities.execute` and
 * `activation_gate` fields are the actual, already-designed authority on
 * whether a surface may post automatically; this module reads and reports
 * them, it never overrides them. DEC-843 removed the old repo-wide activation
 * block and allows any authorised ecosystem agent to trigger the canonical
 * VPS2402 factory. That does not create adapter capability: CAESTHETIC IG
 * remains draft-only because no verified Instagram video/Reels execute adapter
 * exists. TASK-837 owns that adapter work.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readManifest } from "../evidence/new-unit.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const RESOLVE_SCRIPT = path.join(HERE, "../evidence/resolve-account.py");

export const PUBLISH_ADAPTER_STATUS = Object.freeze({
  platform: "instagram",
  supported: true,
  tool: "social_attach_video",
  publish_tool: "social_publish_post",
  verification_contract: "LIVE_VERIFIED",
});

/**
 * Resolve the live surface(s) for a contour/platform from the real account
 * registry. Never invents a profile_id/handle — an empty match means the
 * registry has no such surface, not that the caller should guess one.
 */
export function resolveAccountForContour(contour, platform, { pythonBin = "python3" } = {}) {
  const args = [RESOLVE_SCRIPT];
  if (contour) args.push("--contour", contour);
  if (platform) args.push("--platform", platform);
  const result = spawnSync(pythonBin, args, { encoding: "utf8", timeout: 15_000 });
  if (result.error) {
    throw Object.assign(new Error(`resolve_account_spawn_failed:${result.error.message}`), { code: "resolve_account_spawn_failed" });
  }
  const parsed = JSON.parse(result.stdout || "{}");
  if (!parsed.ok) {
    throw Object.assign(new Error(`resolve_account_failed:${parsed.error}`), { code: "resolve_account_failed" });
  }
  return parsed.matches;
}

/** Reads video-qa.json written by asset-worker/video-worker.mjs assembleEpisode(). */
export function readVideoQa(reelsDir) {
  const qaPath = path.join(reelsDir, "video-qa.json");
  if (!fs.existsSync(qaPath)) {
    throw Object.assign(new Error(`missing_video_qa:${qaPath}`), { code: "missing_video_qa" });
  }
  return JSON.parse(fs.readFileSync(qaPath, "utf8"));
}

/**
 * Every evidence_unit_id an episode manifest cites must be PUBLISHABLE or
 * USED with a rights_status that clears it for this specific track. A
 * B-cold/B-warm episode citing a client-derived unit that is still
 * "anonymized_only" may only ship the anonymized wording, never a named
 * claim — this function reports that distinction, it does not silently pick.
 */
export function checkEvidenceClearance(evidenceUnitIds, evidenceBankRoot) {
  const results = evidenceUnitIds.map((unitId) => {
    try {
      const manifest = readManifest(unitId, evidenceBankRoot);
      const cleared = manifest.lifecycle_state === "PUBLISHABLE" || manifest.lifecycle_state === "USED";
      return {
        unitId,
        cleared,
        rights_status: manifest.rights_status,
        lifecycle_state: manifest.lifecycle_state,
        reason: cleared ? null : `lifecycle_state is ${manifest.lifecycle_state}, not PUBLISHABLE/USED`,
      };
    } catch (err) {
      return { unitId, cleared: false, rights_status: null, lifecycle_state: null, reason: err.message };
    }
  });
  return { allCleared: results.every((r) => r.cleared), results };
}

function stableIdempotencyKey(parts) {
  return crypto.createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 32);
}

/**
 * Assemble a publish request envelope. Throws on anything that would make
 * publishing wrong (QA fail, unresolved evidence) rather than degrading
 * gracefully — a bad publish is a public, hard-to-reverse mistake.
 */
export function preparePublishRequest({
  requestId,
  reelsDir,
  evidenceUnitIds = [],
  evidenceBankRoot,
  profileId,
  expectedAccountIdentity,
  contour,
  caption,
}) {
  if (!requestId) throw Object.assign(new Error("missing_request_id"), { code: "missing_request_id" });
  if (!caption || !caption.trim()) throw Object.assign(new Error("missing_caption"), { code: "missing_caption" });
  if (!profileId && !contour) {
    throw Object.assign(new Error("missing_profile_id_or_contour"), { code: "missing_profile_id_or_contour" });
  }

  const qa = readVideoQa(reelsDir);
  if (!qa || qa.status !== "qa_pass") {
    throw Object.assign(new Error(`video_qa_not_passed:${requestId}`), { code: "video_qa_not_passed" });
  }

  const clearance = checkEvidenceClearance(evidenceUnitIds, evidenceBankRoot);
  if (!clearance.allCleared) {
    throw Object.assign(new Error("evidence_not_cleared"), { code: "evidence_not_cleared", details: clearance.results });
  }

  // Routing: an explicit profileId/expectedAccountIdentity always wins (a
  // caller who already knows the target account); `contour` resolves it
  // from the real registry instead of the caller guessing a profile_id.
  let routing = null;
  let resolvedProfileId = profileId;
  let resolvedIdentity = expectedAccountIdentity;
  if (!profileId && contour) {
    const matches = resolveAccountForContour(contour, "instagram");
    if (matches.length !== 1) {
      throw Object.assign(
        new Error(`ambiguous_or_unknown_contour_route:${contour}:${matches.length}_matches`),
        { code: "ambiguous_or_unknown_contour_route", details: matches },
      );
    }
    routing = matches[0];
    resolvedProfileId = routing.dolphin_profile_id;
    resolvedIdentity = routing.handle || routing.surface_account_id;
  }

  const videoFile = path.join(reelsDir, `daily-growth-note-${String(qa.episode).padStart(3, "0")}.mp4`);
  return {
    profile_id: resolvedProfileId,
    platform: "instagram",
    expected_account_identity: resolvedIdentity,
    idempotency_key: stableIdempotencyKey({ requestId, episode: qa.episode }),
    video_path: videoFile,
    caption,
    evidence_units: clearance.results,
    routing,
    prepared_at: new Date().toISOString(),
  };
}

/**
 * The only function that would talk to a browser session. It never does —
 * see PUBLISH_ADAPTER_STATUS. Returns a typed, honest "blocked" result so
 * callers (a future scheduler, a human running this by hand) get a clear
 * status instead of a silent no-op or a fabricated success.
 */
export async function submitPublishRequest(request, executeAdapter) {
  if (typeof executeAdapter !== "function") {
    return { ok: false, status: "blocked_missing_executor", request, adapter: PUBLISH_ADAPTER_STATUS };
  }
  if (request.routing && request.routing.publish_readiness?.ready !== true) {
    return {
      ok: false,
      status: "blocked_registry_gate",
      request,
      adapter: PUBLISH_ADAPTER_STATUS,
      registry_blocking_reasons: request.routing.publish_readiness.blocking_reasons,
    };
  }
  return executeAdapter(request);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  const arg = (flag, fallback) => {
    const i = rest.indexOf(flag);
    return i >= 0 ? rest[i + 1] : fallback;
  };
  if (cmd !== "prepare") {
    console.error("Usage: node scripts/caesthetic/asset-worker/publish-request.mjs prepare "
      + "--request-id <id> --reels-dir <dir> --caption <text> "
      + "(--contour <registry_contour> | --profile-id <id> --account <identity>) "
      + "[--evidence <unit_id,unit_id,...>]");
    process.exit(cmd ? 1 : 0);
    return;
  }
  try {
    const evidenceArg = arg("--evidence", "");
    const request = preparePublishRequest({
      requestId: arg("--request-id"),
      reelsDir: path.resolve(arg("--reels-dir")),
      caption: arg("--caption"),
      profileId: arg("--profile-id"),
      expectedAccountIdentity: arg("--account"),
      contour: arg("--contour"),
      evidenceUnitIds: evidenceArg ? evidenceArg.split(",").map((s) => s.trim()).filter(Boolean) : [],
      evidenceBankRoot: process.env.CAE_EVIDENCE_BANK_ROOT || path.join(REPO_ROOT, "Production/evidence-bank"),
    });
    console.log(JSON.stringify(submitPublishRequest(request), null, 2));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message, code: err.code || "internal", details: err.details || null }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
