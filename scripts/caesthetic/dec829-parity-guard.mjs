#!/usr/bin/env node
/**
 * DEC-829 parity guard: grainee-v2 vs zaomir/caesthetic satellite.
 *
 * Deploy authority is grainee-v2 only. The satellite is a public mirror,
 * not a deploy source. This script audits hash/presence drift. It does
 * not run sync-agents-bidirectional.sh --apply.
 *
 * Reads docs/projects/caesthetic/SYNC_MANIFEST.yml mirrored trees.
 *
 *   node scripts/caesthetic/dec829-parity-guard.mjs
 *   node scripts/caesthetic/dec829-parity-guard.mjs --satellite /var/www/caesthetic
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export const DEPLOY_AUTHORITY = "zaomir/grainee-v2";
export const SATELLITE_REPO = "zaomir/caesthetic";
export const SYNC_MANIFEST_REL = "docs/projects/caesthetic/SYNC_MANIFEST.yml";
export const SYNC_AFTER_SHIP =
  "bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push";

export const REQUIRED_PARITY_FILES = Object.freeze([
  "docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md",
  "docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md",
  "docs/projects/caesthetic/ROUTER.md",
  "site-caesthetic/assets/js/growth.js",
]);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SAT_DEFAULT = process.env.CAESTHETIC_SATELLITE_ROOT || "/var/www/caesthetic";
const SAT_URL =
  process.env.CAESTHETIC_AGENTS_REPO_URL || "https://github.com/zaomir/caesthetic.git";

function normRel(rel) {
  return String(rel || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function parseSimpleYamlList(text, key) {
  const lines = text.split(/\r?\n/);
  const values = [];
  let inKey = false;
  for (const line of lines) {
    if (/^\S/.test(line) && inKey) break;
    if (new RegExp(`^${key}:\\s*$`).test(line)) {
      inKey = true;
      continue;
    }
    if (!inKey) continue;
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item) values.push(item[1].trim());
  }
  return values;
}

function parseSimpleYamlScalar(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s+(\\S+)`, "m"));
  return match ? match[1].trim() : "";
}

export function parseSyncManifest(text) {
  return {
    source_repo: parseSimpleYamlScalar(text, "source_repo") || SATELLITE_REPO,
    target_repo: parseSimpleYamlScalar(text, "target_repo") || DEPLOY_AUTHORITY,
    direction: parseSimpleYamlScalar(text, "direction") || "bidirectional",
    trees: parseSimpleYamlList(text, "trees"),
    ssot_globs: parseSimpleYamlList(text, "ssot_globs"),
    extra_files: parseSimpleYamlList(text, "extra_files"),
    excludes: parseSimpleYamlList(text, "excludes"),
    protected_in_target: parseSimpleYamlList(text, "protected_in_target"),
  };
}

export function loadSyncManifest(root = ROOT) {
  const path = resolve(root, SYNC_MANIFEST_REL);
  if (!existsSync(path)) {
    throw new Error(`SYNC_MANIFEST missing: ${SYNC_MANIFEST_REL}`);
  }
  return parseSyncManifest(readFileSync(path, "utf8"));
}

function excludeMatchers(excludes) {
  const names = new Set();
  const prefixes = [];
  const exact = new Set();
  for (const raw of excludes) {
    const rule = normRel(raw);
    if (rule.endsWith("/**")) {
      prefixes.push(rule.slice(0, -3).replace(/\/?$/, "/"));
      continue;
    }
    if (rule === ".env.*" || rule.endsWith(".*")) {
      names.add(rule.replace(/\.\*$/, ""));
      continue;
    }
    if (!rule.includes("/") && !rule.includes("*")) {
      names.add(rule);
      continue;
    }
    exact.add(rule);
  }
  return { names, prefixes, exact };
}

function shouldSkip(rel, name, excludes) {
  const { names, prefixes, exact } = excludeMatchers(excludes);
  if (names.has(name)) return true;
  if (name.startsWith(".env")) return true;
  const relN = normRel(rel);
  if (exact.has(relN)) return true;
  for (const prefix of prefixes) {
    if (relN === prefix.slice(0, -1) || relN.startsWith(prefix)) return true;
  }
  return false;
}

function walkFiles(root, relRoot, excludes) {
  const base = join(root, relRoot);
  const out = [];
  if (!existsSync(base)) return out;
  if (statSync(base).isFile()) {
    if (!shouldSkip(relRoot, relRoot.split("/").pop(), excludes)) out.push(normRel(relRoot));
    return out;
  }
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = normRel(relative(root, full).split(sep).join("/"));
      if (shouldSkip(rel, entry.name, excludes)) continue;
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(rel);
    }
  }
  return out;
}

function expandSsotGlobs(root, globs) {
  const out = [];
  for (const glob of globs) {
    const match = glob.match(/^(.*)\/([^/]*\*[^/]*)$/);
    if (!match) {
      if (existsSync(join(root, glob))) out.push(normRel(glob));
      continue;
    }
    const dir = join(root, match[1]);
    const pattern = match[2];
    if (!existsSync(dir)) continue;
    const prefix = pattern.split("*")[0];
    const suffix = pattern.endsWith(".md") ? ".md" : "";
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.startsWith(prefix)) continue;
      if (suffix && !entry.name.endsWith(suffix)) continue;
      out.push(normRel(`${match[1]}/${entry.name}`));
    }
  }
  return out;
}

export function collectMirroredRels(root, manifest) {
  const rels = new Set();
  for (const tree of manifest.trees) {
    for (const rel of walkFiles(root, tree, manifest.excludes)) rels.add(rel);
  }
  for (const rel of expandSsotGlobs(root, manifest.ssot_globs)) rels.add(rel);
  for (const rel of manifest.extra_files) {
    if (existsSync(join(root, rel))) rels.add(normRel(rel));
  }
  for (const rel of REQUIRED_PARITY_FILES) rels.add(rel);
  return rels;
}

function ensureSatellite(satelliteRoot, { cloneIfMissing = true } = {}) {
  if (existsSync(join(satelliteRoot, ".git")) || existsSync(join(satelliteRoot, SYNC_MANIFEST_REL))) {
    return { root: satelliteRoot, cloned: false };
  }
  if (!cloneIfMissing) {
    throw new Error(`satellite missing: ${satelliteRoot}`);
  }
  const cloned = spawnSync("git", ["clone", "--depth", "1", SAT_URL, satelliteRoot], {
    encoding: "utf8",
  });
  if (cloned.status !== 0) {
    throw new Error(`satellite clone failed: ${(cloned.stderr || cloned.stdout || "").trim()}`);
  }
  return { root: satelliteRoot, cloned: true };
}

function fileState(root, rel) {
  const path = join(root, rel);
  if (!existsSync(path) || !statSync(path).isFile()) {
    return { exists: false, sha: null };
  }
  return { exists: true, sha: sha256File(path) };
}

export function compareParity({
  graineeRoot = ROOT,
  satelliteRoot = SAT_DEFAULT,
  cloneIfMissing = true,
} = {}) {
  const manifest = loadSyncManifest(graineeRoot);
  const sat = ensureSatellite(satelliteRoot, { cloneIfMissing });
  const graineeRels = collectMirroredRels(graineeRoot, manifest);
  const satelliteRels = collectMirroredRels(sat.root, manifest);
  const all = new Set([...graineeRels, ...satelliteRels, ...REQUIRED_PARITY_FILES]);
  const drifted = [];
  const required = [];

  for (const rel of [...all].sort()) {
    const g = fileState(graineeRoot, rel);
    const s = fileState(sat.root, rel);
    let reason = null;
    if (g.exists && !s.exists) reason = "only_in_grainee";
    else if (!g.exists && s.exists) reason = "only_in_satellite";
    else if (g.exists && s.exists && g.sha !== s.sha) reason = "hash_mismatch";
    const row = {
      rel,
      reason,
      grainee_sha: g.sha,
      satellite_sha: s.sha,
    };
    if (REQUIRED_PARITY_FILES.includes(rel)) {
      required.push({ ...row, required: true });
    }
    if (reason) drifted.push(row);
  }

  return {
    ok: drifted.length === 0,
    deploy_authority: DEPLOY_AUTHORITY,
    satellite: SATELLITE_REPO,
    satellite_repo: manifest.source_repo || SATELLITE_REPO,
    satellite_is_not_deploy_source: true,
    target_repo: manifest.target_repo || DEPLOY_AUTHORITY,
    sync_manifest: SYNC_MANIFEST_REL,
    manifest_present: true,
    after_ship_sync: SYNC_AFTER_SHIP,
    sync_after_ship: SYNC_AFTER_SHIP,
    grainee_root: graineeRoot,
    satellite_root: sat.root,
    satellite_cloned: sat.cloned,
    compared: all.size,
    required,
    drifted,
  };
}

function parseArgs(argv) {
  const out = { satellite: SAT_DEFAULT, json: false, noClone: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--satellite") out.satellite = argv[++i] || SAT_DEFAULT;
    else if (arg === "--json") out.json = true;
    else if (arg === "--no-clone") out.noClone = true;
  }
  return out;
}

export function formatDriftList(result) {
  if (result.ok) {
    return "DEC-829 parity: OK (grainee-v2 deploy authority; satellite is not a deploy source)";
  }
  const lines = [
    "DEC-829 parity: DRIFT",
    `deploy_authority=${result.deploy_authority}`,
    `satellite=${result.satellite_repo} (not a deploy source)`,
    `sync_manifest=${result.sync_manifest}`,
    `after grainee-v2 ship: ${result.sync_after_ship}`,
    "files:",
  ];
  for (const row of result.drifted) {
    lines.push(`  ${row.reason.padEnd(18)} ${row.rel}`);
  }
  return lines.join("\n");
}

function isDirect() {
  return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (isDirect()) {
  const args = parseArgs(process.argv.slice(2));
  const result = compareParity({
    satelliteRoot: args.satellite,
    cloneIfMissing: !args.noClone,
  });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else console.log(formatDriftList(result));
  process.exit(result.ok ? 0 : 1);
}
