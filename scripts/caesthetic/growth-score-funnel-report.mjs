#!/usr/bin/env node
/**
 * Weekly Growth Score funnel from caesthetic_score_funnel_events (DEC-848).
 * Service-role only. Never prints name / email / phone / practice_name.
 *
 *   node scripts/caesthetic/growth-score-funnel-report.mjs
 *   node scripts/caesthetic/growth-score-funnel-report.mjs --fixture
 *   node scripts/caesthetic/growth-score-funnel-report.mjs --fixture path.json
 *   node scripts/caesthetic/growth-score-funnel-report.mjs --from 2026-08-14 --to 2026-08-21
 *   node scripts/caesthetic/growth-score-funnel-report.mjs --days 7
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { FUNNEL_EVENTS } from "./growth-score-ops-contract.mjs";

export { FUNNEL_EVENTS };

export const PII_FORBIDDEN_KEYS = Object.freeze([
  "email",
  "name",
  "phone",
  "practice_name",
]);

export const FUNNEL_TABLE = "caesthetic_score_funnel_events";
export const EMIT_RPC = "emit_caesthetic_score_funnel_event";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_SUPABASE_URL = "https://lwyumrgygbuowndwcsvc.supabase.co";
const ALLOWED_EVENT_FIELDS = Object.freeze([
  "event_name",
  "source_class",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "created_at",
  "score_case_id",
  "lead_id",
]);

function hasOwn(object, key) {
  return object != null && Object.prototype.hasOwnProperty.call(object, key);
}

export function loadEnv() {
  for (const file of [resolve(ROOT, ".env"), "/root/.cursor/secrets.env", "/etc/evo/secrets.env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

export function assertNoFunnelPii(payload) {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("funnel_event_payload_invalid");
  }
  for (const key of PII_FORBIDDEN_KEYS) {
    if (hasOwn(payload, key)) {
      throw new TypeError("funnel_event_pii_forbidden");
    }
  }
  return true;
}

export function sanitizeFunnelPayload(payload) {
  assertNoFunnelPii(payload);
  const eventName = String(payload.event_name || "").trim();
  if (!FUNNEL_EVENTS.includes(eventName)) {
    throw new TypeError(`funnel_event_unknown: ${eventName}`);
  }
  const clean = { event_name: eventName };
  for (const key of ALLOWED_EVENT_FIELDS) {
    if (key === "event_name" || !hasOwn(payload, key)) continue;
    const value = payload[key];
    if (value == null) continue;
    const text = String(value).trim();
    if (text) clean[key] = text;
  }
  return clean;
}

/**
 * Client-side emit guard matching SQL emit_caesthetic_score_funnel_event.
 * Rejects email / name / phone / practice_name. persist:true posts via service role.
 */
export async function emitFunnelEvent(payload, options = {}) {
  const clean = sanitizeFunnelPayload(payload);
  if (!options.persist) {
    return { ok: true, dry_run: true, event_name: clean.event_name };
  }
  const creds = readDbCreds();
  if (!creds) {
    throw new Error("funnel_event_persist_requires_service_role");
  }
  const res = await fetch(`${creds.url}/rest/v1/rpc/${EMIT_RPC}`, {
    method: "POST",
    headers: serviceHeaders(creds.key),
    body: JSON.stringify(clean),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.ok !== true) {
    throw new Error(`funnel_event_persist_failed:${res.status}`);
  }
  return { ok: true, id: body.id || null, event_name: clean.event_name };
}

export function defaultFixtureEvents(now = new Date("2026-08-21T18:00:00.000Z")) {
  const day = (offsetHours) =>
    new Date(now.getTime() - offsetHours * 3600 * 1000).toISOString();
  const rows = [];
  const push = (event_name, source_class, utm_source, hoursAgo) => {
    rows.push({ event_name, source_class, utm_source, created_at: day(hoursAgo) });
  };
  for (let i = 0; i < 10; i += 1) {
    push("lead_created", "organic_social", "instagram", 20 + i);
    push("case_created", "organic_social", "instagram", 19 + i);
  }
  for (let i = 0; i < 8; i += 1) push("triaged", "organic_social", "instagram", 16 + i);
  for (let i = 0; i < 6; i += 1) push("approved", "organic_social", "instagram", 12 + i);
  for (let i = 0; i < 5; i += 1) push("delivered", "organic_social", "instagram", 8 + i);
  push("sprint_inquiry", "organic_social", "instagram", 4);

  for (let i = 0; i < 4; i += 1) {
    push("lead_created", "outbound", "email", 30 + i);
    push("case_created", "outbound", "email", 29 + i);
  }
  for (let i = 0; i < 3; i += 1) push("triaged", "outbound", "email", 24 + i);
  for (let i = 0; i < 2; i += 1) push("approved", "outbound", "email", 18 + i);
  push("delivered", "outbound", "email", 10);
  return rows;
}

export function ratio(numerator, denominator) {
  const n = Number(numerator) || 0;
  const d = Number(denominator) || 0;
  if (d <= 0) return 0;
  return Number((n / d).toFixed(4));
}

function inWindow(iso, fromMs, toMs) {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= fromMs && t <= toMs;
}

function emptyCounts() {
  return Object.fromEntries(FUNNEL_EVENTS.map((name) => [name, 0]));
}

function bumpGroup(map, key, eventName) {
  const label = key || "(none)";
  if (!map[label]) map[label] = emptyCounts();
  map[label][eventName] += 1;
}

export function aggregateFunnel(events, { from, to } = {}) {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 7 * 86400 * 1000);
  const fromMs = fromDate.getTime();
  const toMs = toDate.getTime();
  const counts = emptyCounts();
  const by_source_class = {};
  const by_utm_source = {};

  for (const raw of events || []) {
    assertNoFunnelPii(raw);
    const eventName = String(raw.event_name || "").trim();
    if (!FUNNEL_EVENTS.includes(eventName)) continue;
    if (!inWindow(raw.created_at, fromMs, toMs)) continue;
    counts[eventName] += 1;
    bumpGroup(by_source_class, raw.source_class, eventName);
    bumpGroup(by_utm_source, raw.utm_source, eventName);
  }

  return {
    window: {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    },
    counts,
    conversions: {
      lead_to_delivered: ratio(counts.delivered, counts.lead_created),
      delivered_to_sprint_inquiry: ratio(counts.sprint_inquiry, counts.delivered),
    },
    by_source_class,
    by_utm_source,
  };
}

function isChannelGroupPath(path) {
  const leaf = path.split(".").pop();
  return leaf === "by_utm_source" || leaf === "by_source_class";
}

function assertNoPiiKeys(value, path = "") {
  if (value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoPiiKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const next = path ? `${path}.${key}` : key;
    const groupLabel = isChannelGroupPath(path);
    if (PII_FORBIDDEN_KEYS.includes(key) && !groupLabel) {
      throw new TypeError("funnel_event_pii_forbidden");
    }
    if (groupLabel) continue;
    assertNoPiiKeys(child, next);
  }
}

export function stripPiiFromReport(report) {
  assertNoPiiKeys(report);
  return report;
}

function readDbCreds() {
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!key) return null;
  return { url, key };
}

function serviceHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function parseArgs(argv) {
  const out = { fixture: false, fixturePath: "", from: "", to: "", days: 7 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--fixture") {
      out.fixture = true;
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        out.fixturePath = next;
        i += 1;
      }
    } else if (arg === "--from") {
      out.from = argv[++i] || "";
    } else if (arg === "--to") {
      out.to = argv[++i] || "";
    } else if (arg === "--days") {
      out.days = Number(argv[++i]) || 7;
    }
  }
  return out;
}

function loadFixtureEvents(fixturePath) {
  if (!fixturePath) return defaultFixtureEvents();
  const raw = JSON.parse(readFileSync(resolve(fixturePath), "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.events;
  if (!Array.isArray(rows)) {
    throw new TypeError("fixture must be an array or { events: [] }");
  }
  return rows.map((row) => sanitizeFunnelPayload(row));
}

async function fetchFunnelEvents(creds, fromIso, toIso) {
  const select = [
    "event_name",
    "source_class",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "created_at",
  ].join(",");
  const query = new URLSearchParams({
    select,
    created_at: `gte.${fromIso}`,
    order: "created_at.asc",
  });
  const res = await fetch(`${creds.url}/rest/v1/${FUNNEL_TABLE}?${query}`, {
    headers: serviceHeaders(creds.key),
  });
  if (!res.ok) {
    throw new Error(`funnel_events_fetch_failed:${res.status}`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows)) {
    throw new Error("funnel_events_fetch_invalid");
  }
  return rows
    .filter((row) => {
      const created = new Date(row.created_at).getTime();
      return created <= new Date(toIso).getTime();
    })
    .map((row) => sanitizeFunnelPayload(row));
}

export function buildReport({ events, from, to, mode }) {
  const aggregated = aggregateFunnel(events, { from, to });
  return stripPiiFromReport({
    ok: true,
    mode,
    fixture: mode === "fixture",
    table: FUNNEL_TABLE,
    event_names: [...FUNNEL_EVENTS],
    grouping: ["source_class", "utm_source"],
    pii: false,
    ...aggregated,
  });
}

export async function runFunnelReport(argv = process.argv.slice(2)) {
  loadEnv();
  const args = parseArgs(argv);
  const to = args.to || new Date().toISOString();
  const spanMs = (Number(args.days) || 7) * 86400 * 1000;
  const from = args.from || new Date(new Date(to).getTime() - spanMs).toISOString();
  const creds = readDbCreds();
  const forceFixture = args.fixture || !creds;
  const mode = forceFixture ? "fixture" : "service_role";
  const events = forceFixture
    ? loadFixtureEvents(args.fixturePath)
    : await fetchFunnelEvents(creds, from, to);
  const report = buildReport({ events, from, to, mode });
  report.window_days = Number(args.days) || 7;
  report.input_rows = events.length;
  report.fingerprint = createHash("sha256")
    .update(JSON.stringify(report.counts))
    .digest("hex")
    .slice(0, 12);
  if (!creds && !args.fixture) {
    report.note = "no DB creds; used --fixture contract events";
  }
  return report;
}

function isDirect() {
  return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (isDirect()) {
  const report = await runFunnelReport();
  console.log(JSON.stringify(report, null, 2));
}
