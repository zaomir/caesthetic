/**
 * CAESTHETIC Asset Worker — deny-by-default allowlists.
 * SSOT: docs/ssot/CAESTHETIC_ASSET_WORKER.md
 */

import os from "node:os";

export const REPO_ROOT = process.env.CAE_ASSET_REPO_ROOT || "/var/www/grainee-v2";
export const STORAGE_PATH = process.env.STORAGE_PATH || "/opt/caesthetic-assets";
export const RCLONE_REMOTE = process.env.CAESTHETIC_RCLONE_REMOTE || "dropbox:";
export const AUDIT_LOG = "/var/log/grainee/caesthetic-assets-audit.jsonl";

/** Agent/worker runtime is VPS2402 only (DEC-836). `.121` / vdska is forbidden. */
export const CANONICAL_AGENT_HOST = Object.freeze({
  hostname: "vps2402",
  ip: "185.216.214.28",
  forbidden_hostnames: Object.freeze(["vdska"]),
  forbidden_ips: Object.freeze(["213.155.28.121"]),
});

export function runtimeHostInfo(info = {}) {
  const hostname = String(info.hostname || os.hostname() || "")
    .split(".")[0]
    .toLowerCase();
  const ips = String(info.ips || "")
    .split(/[\s,]+/)
    .map((s) => s.replace(/\/\d+$/, ""))
    .filter(Boolean);
  return { hostname, ips, canonical_hostname: CANONICAL_AGENT_HOST.hostname, canonical_ip: CANONICAL_AGENT_HOST.ip };
}

export function assertCanonicalAgentHost(info = {}) {
  if (process.env.CAE_ASSET_SKIP_HOST_GUARD === "1") {
    return { ...runtimeHostInfo(info), skipped: true };
  }
  const host = runtimeHostInfo(info);
  if (host.hostname === CANONICAL_AGENT_HOST.hostname || host.ips.includes(CANONICAL_AGENT_HOST.ip)) {
    return { ...host, canonical: true };
  }
  const label = host.ips.find((ip) => CANONICAL_AGENT_HOST.forbidden_ips.includes(ip))
    || (CANONICAL_AGENT_HOST.forbidden_hostnames.includes(host.hostname) ? "213.155.28.121" : host.hostname || "unknown");
  throw Object.assign(new Error(`forbidden_host:${label}`), { code: "forbidden_host" });
}

export const ALLOWED_OPERATIONS = Object.freeze([
  "healthcheck",
  "list_source",
  "render_stories",
]);

export const ALLOWED_TEMPLATES = Object.freeze(["VALERIE_EDITORIAL_STORY_CARD_V2"]);

export const ALLOWED_ASSET_ROLES = Object.freeze([
  "editorial_opener",
  "evidence_explanation",
  "pause_trigger",
  "closing_card",
]);

export const ALLOWED_SOURCES = Object.freeze(["Dropbox", "dropbox", "rclone"]);

/** Logical folder id → rclone path under CAESTHETIC/CAESTHETIC MEDIA */
export const SOURCE_FOLDERS = Object.freeze({
  "Valerie-avatar-plates": [
    "CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/01-pose-library",
    "CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/02-clean-plates",
  ],
  "pose-library": ["CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/01-pose-library"],
  "clean-plates": ["CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates/02-clean-plates"],
});

export const DEST_FOLDERS = Object.freeze({
  stories: "CAESTHETIC/CAESTHETIC MEDIA/Huck/stories",
  reels: "CAESTHETIC/CAESTHETIC MEDIA/Huck/reels",
  thumbnails: "CAESTHETIC/CAESTHETIC MEDIA/Huck/thumbnails",
  archive: "CAESTHETIC/CAESTHETIC MEDIA/Huck/archive",
});

export const MAX_CARDS = 20;
export const PHOTO_RE = /^[A-Za-z0-9._-]+\.(png|jpe?g)$/i;
export const REQUEST_ID_RE = /^[A-Za-z0-9._-]{8,80}$/;

export const FORBIDDEN_REQUEST_KEYS = Object.freeze([
  "command",
  "shell",
  "script",
  "argv",
  "bash",
  "sh",
  "exec",
  "curl",
  "ssh",
  "env",
  "path",
  "file",
  "url",
  "rclone_flags",
  "dest",
]);

export function assertAllowedOperation(op) {
  if (!ALLOWED_OPERATIONS.includes(op)) {
    throw Object.assign(new Error(`forbidden_operation:${op}`), { code: "forbidden_operation" });
  }
}

export function assertAllowedTemplate(template) {
  if (!ALLOWED_TEMPLATES.includes(template)) {
    throw Object.assign(new Error(`forbidden_template:${template}`), { code: "forbidden_template" });
  }
  return template;
}

export function assertAllowedFolder(folder) {
  const id = String(folder || "Valerie-avatar-plates");
  if (!SOURCE_FOLDERS[id]) {
    throw Object.assign(new Error(`forbidden_folder:${id}`), { code: "forbidden_folder" });
  }
  return SOURCE_FOLDERS[id];
}

export function assertAllowedDestKind(kind) {
  const id = String(kind || "stories");
  if (!DEST_FOLDERS[id]) {
    throw Object.assign(new Error(`forbidden_dest:${id}`), { code: "forbidden_dest" });
  }
  return { kind: id, remotePath: DEST_FOLDERS[id] };
}

export function assertPhotoName(name) {
  if (name === undefined || name === null || String(name).trim() === "") {
    throw Object.assign(new Error("missing_photo"), { code: "missing_photo" });
  }
  const raw = String(name || "");
  if (raw.includes("/") || raw.includes("\\") || raw.includes("..")) {
    throw Object.assign(new Error(`forbidden_photo:${name}`), { code: "forbidden_photo" });
  }
  if (!PHOTO_RE.test(raw)) {
    throw Object.assign(new Error(`forbidden_photo:${name}`), { code: "forbidden_photo" });
  }
  return raw;
}

export function assertAllowedAssetRole(role) {
  if (role === undefined || role === null || String(role).trim() === "") return "";
  const value = String(role).trim().toLowerCase();
  if (!ALLOWED_ASSET_ROLES.includes(value)) {
    throw Object.assign(new Error(`forbidden_asset_role:${role}`), { code: "forbidden_asset_role" });
  }
  return value;
}

export function assertRequestId(id) {
  const value = String(id || "");
  if (!REQUEST_ID_RE.test(value)) {
    throw Object.assign(new Error("invalid_request_id"), { code: "invalid_request_id" });
  }
  return value;
}

export function findForbiddenFields(obj, prefix = "") {
  const errors = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return errors;
  for (const [key, value] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_REQUEST_KEYS.includes(key.toLowerCase())) {
      errors.push({ code: "forbidden_field", message: keyPath });
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      errors.push(...findForbiddenFields(value, keyPath));
    }
  }
  return errors;
}

export function normalizeHeadline(value) {
  if (Array.isArray(value)) {
    return value.map((line) => String(line).trim()).filter(Boolean).slice(0, 4);
  }
  const text = String(value || "").trim();
  if (!text) return [];
  if (text.includes("\n")) {
    return text.split(/\n/).map((line) => line.trim()).filter(Boolean).slice(0, 4);
  }
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const word of words) {
    const trial = cur ? `${cur} ${word}` : word;
    if (trial.length <= 16 || !cur) cur = trial;
    else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}
