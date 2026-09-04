#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VERSION = "caesthetic-growth-preview/1.0";
const ALLOWED_VARIANTS = new Set([
  "private-preview-permission-v1",
  "private-preview-direct-v1",
  "historical-preview-v1",
  "synthetic-smoke-v1",
]);
const DIAGNOSTIC_LANGUAGE = /\b(overall score|binding constraint|gap inventory|top 3|repair plan|do not fund yet|roi|revenue loss|caused by|preventing your growth)\b/i;

export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (rows.length < 2) return [];
  const headers = rows[0].map((value) => value.trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()])));
}

const yes = (value) => /^(1|true|yes|approved|clear)$/i.test(String(value || ""));
const iso = (value) => Number.isFinite(Date.parse(String(value || "")));
const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));

export function validateRow(row, now = new Date()) {
  const errors = [];
  for (const field of ["accountId", "email", "firstName", "practiceName", "city", "state", "verifiedSignal", "signalClass", "evidenceRef", "evidenceObservedAt", "evidenceApprovedAt", "evidenceExpiresAt", "expiresAt", "campaignVariant", "openingNarrative"]) {
    if (!String(row[field] || "").trim()) errors.push(`${field}_required`);
  }
  if (!emailOk(row.email) || !yes(row.emailVerified)) errors.push("verified_email_required");
  if (row.siteUrl && !/^https?:\/\//i.test(row.siteUrl)) errors.push("site_url_invalid");
  if (row.senderId && !/^[a-z0-9][a-z0-9:_-]{0,79}$/.test(row.senderId)) errors.push("sender_id_must_be_non_personal_ref");
  if (!yes(row.suppressionClear)) errors.push("suppression_clear_required");
  if (!yes(row.conflictClear)) errors.push("conflict_clear_required");
  if (String(row.activeNarrativeCount || "") !== "1") errors.push("one_active_narrative_required");
  if (!yes(row.evidenceApproved)) errors.push("approved_evidence_required");
  if (!ALLOWED_VARIANTS.has(row.campaignVariant)) errors.push("campaign_variant_invalid");
  for (const field of ["evidenceObservedAt", "evidenceApprovedAt", "evidenceExpiresAt", "expiresAt"]) {
    if (!iso(row[field])) errors.push(`${field}_invalid`);
  }
  if (iso(row.evidenceObservedAt) && Date.parse(row.evidenceObservedAt) < now.valueOf() - 120 * 864e5) errors.push("evidence_stale");
  if (iso(row.evidenceExpiresAt) && Date.parse(row.evidenceExpiresAt) <= now.valueOf()) errors.push("evidence_expired");
  if (iso(row.expiresAt) && Date.parse(row.expiresAt) <= now.valueOf()) errors.push("preview_expired");
  if (DIAGNOSTIC_LANGUAGE.test(`${row.verifiedSignal || ""} ${row.openingNarrative || ""}`)) errors.push("diagnostic_language_forbidden");
  if (row.campaignVariant === "historical-preview-v1" && !yes(row.priorProfessionalRelationship)) errors.push("historical_relationship_required");
  if (row.qaTest && !yes(row.qaTest)) errors.push("qa_test_invalid");
  return [...new Set(errors)];
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, fields) {
  return `${fields.join(",")}\n${rows.map((row) => fields.map((field) => csvCell(row[field])).join(",")).join("\n")}\n`;
}

function isInsideRepo(target) {
  const rel = path.relative(REPO, path.resolve(target));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function argsFrom(argv) {
  const command = argv[2];
  const args = {};
  for (let index = 3; index < argv.length; index += 2) args[argv[index].replace(/^--/, "")] = argv[index + 1];
  return { command, args };
}

function readRows(input) {
  if (!input) throw new Error("--input is required");
  const rows = parseCsv(fs.readFileSync(path.resolve(input), "utf8"));
  if (isInsideRepo(input) && !rows.every((row) => yes(row.qaTest))) {
    throw new Error("row-level prospect CSV must stay outside Git; in-repo input is synthetic QA only");
  }
  return rows;
}

function requirePrivateOutput(target) {
  if (!target) throw new Error("--output or --out-dir is required");
  if (isInsideRepo(target)) throw new Error("private wave output must be outside the Git worktree");
}

function apiConfig() {
  const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return { url: url.replace(/\/$/, ""), key };
}

async function rpc(name, payload) {
  const { url, key } = apiConfig();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${name}: ${data.message || response.status}`);
  return data;
}

function assertValid(rows) {
  const problems = rows.flatMap((row, index) => validateRow(row).map((error) => ({ row: index + 2, accountId: row.accountId, error })));
  if (problems.length) throw new Error(`validation failed:\n${problems.map((item) => `row ${item.row} ${item.accountId || "unknown"}: ${item.error}`).join("\n")}`);
}

async function prepare(rows, outDir) {
  requirePrivateOutput(outDir);
  assertValid(rows);
  fs.mkdirSync(path.resolve(outDir), { recursive: true, mode: 0o700 });
  const prepared = [];
  for (const row of rows) {
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const emailHash = crypto.createHash("sha256").update(row.email.toLowerCase()).digest("hex");
    const issued = await rpc("issue_caesthetic_growth_preview", { p: {
      account_id: row.accountId, contact_id: row.contactId || null, campaign_id: row.campaignId || null,
      campaign_variant: row.campaignVariant, sender_id: row.senderId || null, sender_class: row.senderClass || null,
      token_hash: tokenHash, email: row.email.toLowerCase(), email_hash: emailHash,
      first_name: row.firstName, practice_name: row.practiceName, city: row.city, state: row.state,
      site_url: row.siteUrl || null, verified_signal: row.verifiedSignal, signal_class: row.signalClass,
      evidence_ref: row.evidenceRef, evidence_observed_at: row.evidenceObservedAt,
      evidence_approved_at: row.evidenceApprovedAt, evidence_expires_at: row.evidenceExpiresAt,
      evidence_approved: true, verified_email: row.email, suppression_clear: true, conflict_clear: true,
      opening_narrative: row.openingNarrative, icp_segment: row.icpSegment || null,
      preview_version: VERSION, preview_payload: {}, qa_test: yes(row.qaTest), expires_at: row.expiresAt,
    }});
    prepared.push({ ...row, previewId: issued.preview_id, token, previewUrl: `https://caesthetic.com/preview/${token}/` });
  }
  const output = path.resolve(outDir, "growth-preview-private.jsonl");
  fs.writeFileSync(output, `${prepared.map((row) => JSON.stringify(row)).join("\n")}\n`, { mode: 0o600 });
  return { count: prepared.length, privateOutput: output };
}

function readJsonl(input) {
  return fs.readFileSync(path.resolve(input), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function exportRows(input, output) {
  requirePrivateOutput(output);
  const rows = readJsonl(input);
  const fields = ["email", "firstName", "practiceName", "accountId", "previewId", "previewUrl", "signalClass", "verifiedSignal", "evidenceObservedAt", "campaignVariant"];
  fs.writeFileSync(path.resolve(output), toCsv(rows, fields), { mode: 0o600 });
  return { count: rows.length, output: path.resolve(output) };
}

async function reconcile(input, output) {
  requirePrivateOutput(output);
  const source = readJsonl(input);
  const { url, key } = apiConfig();
  const rows = [];
  for (const row of source) {
    const response = await fetch(`${url}/rest/v1/caesthetic_growth_previews?preview_id=eq.${encodeURIComponent(row.previewId)}&select=preview_id,state,lead_id,score_case_id,issued_at,opened_at,rendered_at,continued_at,expires_at,suppressed_at`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) throw new Error(`reconcile failed: ${response.status}`);
    rows.push((await response.json())[0] || { preview_id: row.previewId, state: "missing" });
  }
  fs.writeFileSync(path.resolve(output), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, { mode: 0o600 });
  return { count: rows.length, output: path.resolve(output) };
}

async function main() {
  const { command, args } = argsFrom(process.argv);
  if (command === "validate") {
    const rows = readRows(args.input); assertValid(rows); console.log(JSON.stringify({ ok: true, command, count: rows.length })); return;
  }
  if (command === "prepare") { console.log(JSON.stringify({ ok: true, command, ...(await prepare(readRows(args.input), args["out-dir"])) })); return; }
  if (command === "export") { console.log(JSON.stringify({ ok: true, command, ...exportRows(args.input, args.output) })); return; }
  if (command === "reconcile") { console.log(JSON.stringify({ ok: true, command, ...(await reconcile(args.input, args.output)) })); return; }
  throw new Error("usage: growth-preview-wave.mjs <prepare|validate|export|reconcile> --input <private.csv|private.jsonl> [--out-dir <private-dir>|--output <private-file>]");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`GROWTH_PREVIEW_WAVE_BLOCKED: ${error.message}`); process.exitCode = 1; });
}
