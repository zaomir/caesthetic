/**
 * CAESTHETIC social execution channel — deny-by-default allowlists.
 * Type: caesthetic_social. SSOT: docs/ssot/CAESTHETIC_SOCIAL_CHANNEL.md
 */
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

export const REQUEST_TYPE = "caesthetic_social";
export const REPO_ROOT = process.env.CAE_SOCIAL_REPO_ROOT || "/var/www/grainee-v2";
export const PRIVATE_ROOT = process.env.CAE_SOCIAL_PRIVATE_ROOT || "/var/lib/caesthetic-social";
export const FLEET_STATE_DIR = process.env.SBO_FLEET_STATE_DIR || "/var/lib/social-fleet";
export const DOLPHIN_PROFILE_ID = "833304152";
export const DOLPHIN_EXECUTOR = "legacy-vds-121";
export const DOLPHIN_LOCAL_API = process.env.DOLPHIN_LOCAL_API_URL || "http://127.0.0.1:3001";
export const HOOPPY_BASE_URL = (process.env.HOOPPY_API_BASE_URL || "https://api.hooppy.ru/api").replace(/\/$/, "");
export const PROJECT_ID = "caesthetic";

export const CANONICAL_AGENT_HOST = Object.freeze({
  hostname: "vps2402",
  ip: "185.216.214.28",
  forbidden_hostnames: Object.freeze(["vdska"]),
  forbidden_ips: Object.freeze(["213.155.28.121"]),
});

export const ALLOWED_OPERATIONS = Object.freeze([
  "health",
  "healthcheck",
  "readiness",
  "status",
  "inbox",
  "execute",
  "publish",
  "full_run",
  "reconcile",
  "stop",
  "recover_hold",
]);

export const EXECUTE_ACTIONS = Object.freeze(["message", "inmail", "comment", "reaction", "invite"]);

export const FORBIDDEN_REQUEST_KEYS = Object.freeze([
  "command",
  "shell",
  "script",
  "exec",
  "curl",
  "ssh",
  "bash",
  "cdp",
  "headers",
  "authorization",
  "cookie",
  "cookies",
  "token",
  "bearer",
  "password",
  "ws_endpoint",
  "devtools",
]);

export const FORBIDDEN_PII_KEYS = Object.freeze([
  "recipient",
  "recipients",
  "email",
  "emails",
  "phone",
  "message",
  "body",
  "subject",
  "text",
  "caption",
  "inmail_body",
  "dm_text",
  "cookie",
  "cookies",
  "access_token",
  "refresh_token",
  "bot_token",
]);

export const HOOPPY_PAGE_SAFE_FIELDS = Object.freeze([
  "id",
  "source_id",
  "account_id",
  "social_page_id",
  "social_page_name",
  "is_admin",
  "connection_checked",
]);

export const HOOPPY_POST_SAFE_FIELDS = Object.freeze([
  "id",
  "is_published",
  "publication_date",
  "source_id",
  "account_id",
  "page_id",
  "errors_for_source_ids",
  "published_url",
]);

export const HOOPPY_CAESTHETIC_PAGES = Object.freeze({
  "2442190": { platform: "instagram", source_id: 10, public: "https://www.instagram.com/caesthetic.growth/" },
  "1977644": { platform: "facebook", source_id: 3, public: "https://facebook.com/caesthetic.growth" },
  "2446140": { platform: "tiktok", source_id: 14, public: "https://www.tiktok.com/@caesthetic.growth" },
  "2443192": { platform: "youtube", source_id: 17, public: "https://www.youtube.com/@caesthetic.growth" },
  "2442189": { platform: "linkedin", source_id: 18, public: "https://www.linkedin.com/in/valeriia-petrova-uk/" },
});

export const HOOPPY_HARD_DENY_PAGE_IDS = Object.freeze(["1226338"]);

export const VALERIE_INMAIL_CAPS = Object.freeze({
  day: 20,
  week: 140,
  month: 600,
});

export const SURFACES = Object.freeze({
  "valeria-lana-linkedin": {
    surface_account_id: "valeria-lana-linkedin",
    account_id: "valeria-lana",
    platform: "linkedin",
    profile_id: DOLPHIN_PROFILE_ID,
    expected_url: "https://www.linkedin.com/in/valeriia-petrova-uk/",
    project_origin: "caesthetic",
    execute: true,
    youtube_dolphin: false,
    hooppy_page_id: "2442189",
    inmail_caps: VALERIE_INMAIL_CAPS,
  },
  "valeria-lana-facebook": {
    surface_account_id: "valeria-lana-facebook",
    account_id: "valeria-lana",
    platform: "facebook",
    profile_id: DOLPHIN_PROFILE_ID,
    expected_url: null,
    project_origin: "caesthetic",
    execute: true,
    verify: false,
    youtube_dolphin: false,
  },
  "caesthetic-instagram": {
    surface_account_id: "caesthetic-instagram",
    account_id: "valeria-lana",
    platform: "instagram",
    profile_id: DOLPHIN_PROFILE_ID,
    expected_url: "https://www.instagram.com/caesthetic.growth/",
    project_origin: "caesthetic",
    execute: false,
    cold_dm: false,
    hooppy_page_id: "2442190",
  },
  "caesthetic-facebook-page": {
    surface_account_id: "caesthetic-facebook-page",
    account_id: "caesthetic-brand",
    platform: "facebook",
    profile_id: DOLPHIN_PROFILE_ID,
    expected_url: "https://facebook.com/caesthetic.growth",
    project_origin: "caesthetic",
    execute: false,
    hooppy_page_id: "1977644",
    page_external_id: "987019634498026",
  },
  "caesthetic-tiktok": {
    surface_account_id: "caesthetic-tiktok",
    account_id: "caesthetic-tiktok",
    platform: "tiktok",
    profile_id: DOLPHIN_PROFILE_ID,
    expected_url: "https://www.tiktok.com/@caesthetic.growth",
    project_origin: "caesthetic",
    execute: false,
    hooppy_page_id: "2446140",
  },
  "caesthetic-youtube": {
    surface_account_id: "caesthetic-youtube",
    account_id: "caesthetic-brand",
    platform: "youtube",
    profile_id: null,
    expected_url: "https://www.youtube.com/@caesthetic.growth",
    project_origin: "caesthetic",
    execute: false,
    dolphin_forbidden: true,
    hooppy_page_id: "2443192",
  },
  "robertas-lobanovskis-linkedin": {
    surface_account_id: "robertas-lobanovskis-linkedin",
    account_id: "robertas-lobanovskis",
    platform: "linkedin",
    profile_id: null,
    expected_url: "https://www.linkedin.com/in/robert-lob/",
    project_origin: "rovlex",
    execute: false,
    blocked_code: "NO_DOLPHIN_BINDING",
  },
  "viktorija-jonane-linkedin": {
    surface_account_id: "viktorija-jonane-linkedin",
    account_id: "viktorija-jonane",
    platform: "linkedin",
    profile_id: null,
    expected_url: "https://www.linkedin.com/in/vikky-jon/",
    project_origin: "rovlex",
    execute: false,
    blocked_code: "NO_DOLPHIN_BINDING",
  },
});

export function allowedPrivateRoots() {
  return [
    "/var/lib/social-fleet",
    "/var/lib/caesthetic-social",
    process.env.SBO_FLEET_STATE_DIR,
    process.env.CAE_SOCIAL_PRIVATE_ROOT,
  ]
    .filter(Boolean)
    .map((dir) => path.resolve(dir));
}

export function runtimeHostInfo(info = {}) {
  const hostname = String(info.hostname || os.hostname() || "")
    .split(".")[0]
    .toLowerCase();
  const ips = String(info.ips || "")
    .split(/[\s,]+/)
    .map((s) => s.replace(/\/\d+$/, ""))
    .filter(Boolean);
  return {
    hostname,
    ips,
    canonical_hostname: CANONICAL_AGENT_HOST.hostname,
    canonical_ip: CANONICAL_AGENT_HOST.ip,
  };
}

export function assertCanonicalAgentHost(info = {}) {
  if (process.env.CAE_SOCIAL_SKIP_HOST_GUARD === "1") {
    return { ...runtimeHostInfo(info), skipped: true };
  }
  const host = runtimeHostInfo(info);
  if (host.hostname === CANONICAL_AGENT_HOST.hostname || host.ips.includes(CANONICAL_AGENT_HOST.ip)) {
    return { ...host, canonical: true };
  }
  const label =
    host.ips.find((ip) => CANONICAL_AGENT_HOST.forbidden_ips.includes(ip)) ||
    (CANONICAL_AGENT_HOST.forbidden_hostnames.includes(host.hostname)
      ? "213.155.28.121"
      : host.hostname || "unknown");
  throw Object.assign(new Error(`forbidden_host:${label}`), { code: "forbidden_host" });
}

export function assertRequestId(value) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,120}$/.test(id)) {
    throw Object.assign(new Error("invalid_request_id"), { code: "invalid_request_id" });
  }
  return id;
}

export function normalizeOperation(value) {
  const op = String(value || "").trim().toLowerCase();
  if (op === "healthcheck") return "health";
  return op;
}

export function assertAllowedOperation(value) {
  const op = normalizeOperation(value);
  if (!ALLOWED_OPERATIONS.includes(op) && op !== "health") {
    throw Object.assign(new Error(`unsupported_operation:${value || ""}`), {
      code: "unsupported_operation",
    });
  }
  if (!ALLOWED_OPERATIONS.includes(op)) {
    throw Object.assign(new Error(`unsupported_operation:${value || ""}`), {
      code: "unsupported_operation",
    });
  }
  return op;
}

export function assertSurface(value) {
  const id = String(value || "").trim();
  const surface = SURFACES[id];
  if (!surface) {
    throw Object.assign(new Error(`unknown_surface:${id || "missing"}`), {
      code: "unknown_surface",
    });
  }
  return surface;
}

export function assertExecuteAction(value) {
  const action = String(value || "").trim().toLowerCase();
  if (!EXECUTE_ACTIONS.includes(action)) {
    throw Object.assign(new Error(`unsupported_action:${value || ""}`), {
      code: "unsupported_action",
    });
  }
  return action;
}

export function assertHooppyPageId(value) {
  const id = String(value || "").trim();
  if (HOOPPY_HARD_DENY_PAGE_IDS.includes(id)) {
    throw Object.assign(new Error("hooppy_page_denied:1226338"), { code: "hooppy_page_denied" });
  }
  if (!HOOPPY_CAESTHETIC_PAGES[id]) {
    throw Object.assign(new Error(`hooppy_page_not_allowlisted:${id || "missing"}`), {
      code: "hooppy_page_not_allowlisted",
    });
  }
  return id;
}

export function assertPrivateRef(value, label = "content_ref") {
  const raw = String(value || "").trim();
  if (!raw) {
    throw Object.assign(new Error(`missing_${label}`), { code: `missing_${label}` });
  }
  if (raw.includes("..") || raw.includes("\0")) {
    throw Object.assign(new Error(`forbidden_${label}`), { code: `forbidden_${label}` });
  }
  const resolved = path.resolve(raw);
  const allowed = allowedPrivateRoots().some(
    (root) => resolved === root || resolved.startsWith(`${root}/`),
  );
  if (!allowed) {
    throw Object.assign(new Error(`forbidden_${label}`), { code: `forbidden_${label}` });
  }
  return resolved;
}

function walkForbidden(node, prefix, keys, found) {
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (keys.has(String(key).toLowerCase())) found.push(pathKey);
    if (value && typeof value === "object") walkForbidden(value, pathKey, keys, found);
  }
}

export function findForbiddenFields(req) {
  const found = [];
  walkForbidden(req, "", new Set(FORBIDDEN_REQUEST_KEYS), found);
  return found.map((field) => ({ code: "forbidden_field", message: field }));
}

export function findPiiFields(req) {
  const found = [];
  const skip = new Set(["request_id", "type", "operation", "created_at", "requested_by"]);
  const walk = (node, prefix) => {
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (skip.has(key) && !prefix) continue;
      const pathKey = prefix ? `${prefix}.${key}` : key;
      if (FORBIDDEN_PII_KEYS.includes(String(key).toLowerCase()) && value != null && value !== "") {
        found.push(pathKey);
      }
      if (value && typeof value === "object") walk(value, pathKey);
    }
  };
  walk(req, "");
  return found;
}

export function loadSecretEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  }
  return out;
}

export function hooppyTokenPresent(env = process.env) {
  if (String(env.HOOPPY_BEARER_TOKEN || "").trim()) return { present: true, source: "env" };
  for (const file of ["/etc/evo/secrets.env", "/etc/social-fleet/hooppy.env", "/root/.cursor/secrets.env"]) {
    const loaded = loadSecretEnvFile(file);
    if (String(loaded.HOOPPY_BEARER_TOKEN || "").trim()) return { present: true, source: file };
  }
  return { present: false, source: null };
}

export function loadHooppyToken(env = process.env) {
  const direct = String(env.HOOPPY_BEARER_TOKEN || "").trim();
  if (direct) return direct;
  for (const file of ["/etc/evo/secrets.env", "/etc/social-fleet/hooppy.env", "/root/.cursor/secrets.env"]) {
    const loaded = loadSecretEnvFile(file);
    const token = String(loaded.HOOPPY_BEARER_TOKEN || "").trim();
    if (token) return token;
  }
  return "";
}

export function remainingInMail(used, caps = VALERIE_INMAIL_CAPS) {
  const dayUsed = Math.max(0, Number(used?.day || 0));
  const weekUsed = Math.max(0, Number(used?.week || 0));
  const monthUsed = Math.max(0, Number(used?.month || 0));
  return {
    day: Math.max(0, caps.day - dayUsed),
    week: Math.max(0, caps.week - weekUsed),
    month: Math.max(0, caps.month - monthUsed),
    ceiling: caps,
    used: { day: dayUsed, week: weekUsed, month: monthUsed },
  };
}
