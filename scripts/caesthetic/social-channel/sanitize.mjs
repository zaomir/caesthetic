import { createHash } from "node:crypto";
import { HOOPPY_PAGE_SAFE_FIELDS, HOOPPY_POST_SAFE_FIELDS, HOOPPY_HARD_DENY_PAGE_IDS } from "./allowlist.mjs";

const SECRET_KEY_RE =
  /^(access_token|refresh_token|bot_token|token|bearer|authorization|cookie|cookies|password|secret|api_key|cdp|ws_endpoint|devtools|proxy_password)$/i;

const SECRET_VALUE_RE = [
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]+/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /AIza[0-9A-Za-z\-_]{20,}/g,
];

export function pickFields(obj, fields) {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  for (const field of fields) {
    if (obj[field] !== undefined) out[field] = obj[field];
  }
  return out;
}

export function stripSecrets(value, seen = new WeakSet()) {
  if (value == null) return value;
  if (typeof value === "string") {
    let out = value;
    for (const re of SECRET_VALUE_RE) {
      re.lastIndex = 0;
      out = out.replace(re, "[REDACTED]");
    }
    return out;
  }
  if (typeof value !== "object") return value;
  if (seen.has(value)) return "[cycle]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => stripSecrets(item, seen));
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY_RE.test(key)) continue;
    out[key] = stripSecrets(child, seen);
  }
  return out;
}

export function assertNoSecretPayload(obj) {
  const json = JSON.stringify(obj);
  for (const re of SECRET_VALUE_RE) {
    re.lastIndex = 0;
    if (re.test(json)) {
      throw Object.assign(new Error("secret_leak_detected"), { code: "secret_leak" });
    }
  }
  if (/access_token|refresh_token|bot_token/i.test(json) && /"[A-Za-z0-9._\-]{20,}"/.test(json)) {
    const hasRawTokenKey = /"(access_token|refresh_token|bot_token)"\s*:\s*"(?!\[REDACTED\])[^"]+"/i.test(json);
    if (hasRawTokenKey) {
      throw Object.assign(new Error("secret_leak_detected:hooppy_provider_token"), { code: "secret_leak" });
    }
  }
}

export function sanitizeHooppyPage(raw) {
  const page = pickFields(raw, HOOPPY_PAGE_SAFE_FIELDS);
  page.id = String(page.id || "");
  page.denied = HOOPPY_HARD_DENY_PAGE_IDS.includes(page.id);
  if (page.social_page_name) page.social_page_name = String(page.social_page_name).slice(0, 120);
  return stripSecrets(page);
}

export function sanitizeHooppyPost(raw) {
  const post = pickFields(raw, HOOPPY_POST_SAFE_FIELDS);
  if (post.published_url && !/^https:\/\//i.test(String(post.published_url))) delete post.published_url;
  return stripSecrets(post);
}

export function contentRefHash(value) {
  return createHash("sha256").update(String(value || "")).digest("hex").slice(0, 16);
}

export function aggregateInbox(privateThreads, { read = true } = {}) {
  if (!read || privateThreads == null) {
    return {
      thread_count: null,
      unread_count: null,
      draft_count: null,
      read: false,
      private_store: "host_only",
      refs: [],
    };
  }
  const threads = Array.isArray(privateThreads) ? privateThreads : [];
  return {
    thread_count: threads.length,
    unread_count: threads.filter((row) => row.unread === true).length,
    draft_count: threads.filter((row) => row.draft_ref).length,
    read: true,
    private_store: "host_only",
    refs: threads.slice(0, 50).map((row) => ({
      thread_ref: row.thread_ref || null,
      platform: row.platform || null,
      unread: Boolean(row.unread),
      draft_ref: row.draft_ref || null,
    })),
  };
}
