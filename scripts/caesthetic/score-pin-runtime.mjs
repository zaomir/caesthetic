#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = path.join(root, "infra/cloudflare/brands/caesthetic.manifest.json");
const PIN_RE = /^\d{4}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function recoverPin(salt, pinHash) {
  if (typeof salt !== "string" || !salt) throw new Error("pinSalt is required");
  if (!SHA256_RE.test(pinHash || "")) throw new Error("pinHash must be 64 lowercase hex");
  for (let n = 0; n <= 9999; n += 1) {
    const pin = String(n).padStart(4, "0");
    if (sha256(`${salt}:${pin}`) === pinHash) return pin;
  }
  throw new Error("pinHash does not resolve to a 4-digit PIN");
}

function protectedEntries() {
  const manifest = readJson(manifestPath);
  return (manifest.scoreProtectedPaths || []).map((entry) => {
    if (!entry?.prefix || !entry?.accessGroupId) throw new Error("protected route requires prefix and internal accessGroupId");
    if (!entry?.pinSalt || !entry?.pinHash) return { ...entry, legacy: true };
    const pin = recoverPin(entry.pinSalt, entry.pinHash);
    if (!PIN_RE.test(pin)) throw new Error(`invalid 4-digit PIN for ${entry.prefix}`);
    return { ...entry, pin, legacy: false };
  });
}

function existingAccessGroups() {
  try {
    const parsed = JSON.parse(process.env.CAESTHETIC_SCORE_ACCESS_CONFIG || "{}");
    return Array.isArray(parsed.access_groups) ? parsed.access_groups : [];
  } catch {
    return [];
  }
}

function existingSmokePasswords() {
  try {
    const parsed = JSON.parse(process.env.CAESTHETIC_SCORE_PUBLISH_PASSWORDS || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function buildAccessConfig() {
  const legacy = new Map(existingAccessGroups().map((group) => [group?.access_group_id, group]));
  const groups = [];
  for (const entry of protectedEntries()) {
    if (entry.legacy) {
      const group = legacy.get(entry.accessGroupId);
      if (!group) throw new Error(`legacy protected route lacks runtime config: ${entry.prefix}`);
      groups.push(group);
      continue;
    }
    groups.push({
      access_group_id: entry.accessGroupId,
      salt: entry.pinSalt,
      password_hash: entry.pinHash,
      session_secret: sha256(`caesthetic-pin-session:${entry.accessGroupId}:${entry.pinHash}`),
    });
  }
  return { access_groups: groups };
}

function buildSmokePasswords() {
  const passwords = { ...existingSmokePasswords() };
  for (const entry of protectedEntries()) {
    if (!entry.legacy) passwords[entry.accessGroupId] = entry.pin;
  }
  return passwords;
}

function buildPendingPublicationRuntime(satelliteRoot) {
  const requestRoot = path.join(satelliteRoot, "docs/projects/caesthetic/publish-growth-score/requests");
  const resultRoot = path.join(satelliteRoot, "docs/projects/caesthetic/publish-growth-score/results");
  const accessGroups = new Map(buildAccessConfig().access_groups.map((group) => [group.access_group_id, group]));
  const passwords = buildSmokePasswords();
  if (!fs.existsSync(requestRoot)) return { access_groups: [...accessGroups.values()], passwords };
  for (const name of fs.readdirSync(requestRoot).filter((value) => value.endsWith(".json"))) {
    if (fs.existsSync(path.join(resultRoot, name))) continue;
    const request = readJson(path.join(requestRoot, name));
    if (request.type !== "caesthetic_growth_score_publish") continue;
    const packageFile = path.join(satelliteRoot, request.package_manifest_path || "");
    if (!fs.existsSync(packageFile)) continue;
    const pkg = readJson(packageFile);
    if (pkg.visibility !== "private") continue;
    const groupId = pkg.access_group_id;
    const pinSalt = pkg.pin_salt;
    const pinHash = pkg.pin_hash;
    if (!groupId || !pinSalt || !pinHash) throw new Error(`private package ${pkg.request_id || name} requires access_group_id + pin_salt + pin_hash`);
    const pin = recoverPin(pinSalt, pinHash);
    accessGroups.set(groupId, {
      access_group_id: groupId,
      salt: pinSalt,
      password_hash: pinHash,
      session_secret: sha256(`caesthetic-pin-session:${groupId}:${pinHash}`),
    });
    passwords[groupId] = pin;
  }
  return { access_groups: [...accessGroups.values()], passwords };
}

function main() {
  const [command = "access-config", arg] = process.argv.slice(2);
  if (command === "access-config") {
    process.stdout.write(JSON.stringify(buildAccessConfig()));
    return;
  }
  if (command === "smoke-passwords") {
    process.stdout.write(JSON.stringify(buildSmokePasswords()));
    return;
  }
  if (command === "pending-runtime") {
    const satellite = path.resolve(arg || process.env.CAESTHETIC_AGENTS_DIR || "/var/lib/caesthetic-repo-sync/satellite");
    const value = buildPendingPublicationRuntime(satellite);
    process.stdout.write(JSON.stringify(value));
    return;
  }
  if (command === "recover") {
    const [salt, hash] = process.argv.slice(3);
    process.stdout.write(recoverPin(salt, hash));
    return;
  }
  throw new Error(`unknown command: ${command}`);
}

try { main(); } catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
