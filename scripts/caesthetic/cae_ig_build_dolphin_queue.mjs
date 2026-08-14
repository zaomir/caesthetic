#!/usr/bin/env node
/**
 * Build private Dolphin/SBO Instagram queue for @caesthetic.growth (833304152).
 *
 * Source of truth for THIS queue (coverage / day runners, DEC-823/824):
 *   dropbox:CAESTHETIC/audience/medspa-ig-outreach-v1/usernames.txt
 *   = CAE_MEDSPA_IG_V1 candidate (NON-EXECUTION), rebuilt with TASK-814.
 *
 * Deny overlay: CURRENT.json deny_usernames (same list as execution bootstrap).
 * Optional priority: TASK-814 strong proxies first (private harvest CSV).
 *
 * Does NOT move CURRENT.json and is NOT CAE_MEDSPA_IG_FINAL_V1 write authority.
 * Aggregate stdout only — no usernames printed.
 *
 * Usage:
 *   node scripts/caesthetic/cae_ig_build_dolphin_queue.mjs
 *   node scripts/caesthetic/cae_ig_build_dolphin_queue.mjs --out /var/www/grainee-v2/tmp/cae-ig-queue
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");

const CANDIDATE_USERNAMES =
  process.env.CAE_IG_CANDIDATE_USERNAMES ??
  "dropbox:CAESTHETIC/audience/medspa-ig-outreach-v1/usernames.txt";
const CURRENT_POINTER =
  process.env.CAE_IG_CURRENT_JSON ??
  "dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json";
const TASK814_MASTER =
  process.env.CAE_IG_TASK814_MASTER ??
  "dropbox:CAESTHETIC/icp/9-city-ig-usernames-2026-08/master_usernames.csv";
const DEFAULT_OUT = join(REPO, "tmp/cae-ig-queue");
const LEGACY_OUT = join(REPO, "tmp/cae-ig-869");

function parseArgs(argv) {
  const out = { outDir: DEFAULT_OUT, syncLegacy: true };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--out") out.outDir = resolve(argv[++i] || DEFAULT_OUT);
    else if (a === "--no-legacy-sync") out.syncLegacy = false;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

function rcloneCat(remote) {
  const r = spawnSync("rclone", ["cat", remote], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(`rclone cat failed: ${remote}\n${r.stderr || r.stdout}`);
  }
  return r.stdout || "";
}

function rcloneCopyto(local, remote) {
  const r = spawnSync("rclone", ["copyto", local, remote, "-q"], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`rclone copyto failed: ${remote}\n${r.stderr || r.stdout}`);
  }
}

function normUser(raw) {
  return String(raw || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function parseUsernameList(text) {
  const out = [];
  const seen = new Set();
  for (const line of String(text || "").split(/\r?\n/)) {
    const u = normUser(line.split(/[,\t]/)[0]);
    if (!u || u === "username" || u === "instagram_username") continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function parseDenyFromCurrent(text) {
  const j = JSON.parse(text);
  const list = Array.isArray(j.deny_usernames) ? j.deny_usernames : [];
  return new Set(list.map(normUser).filter(Boolean));
}

/** Minimal RFC4180-ish CSV split (handles quoted commas in bios). */
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/** Prefer icp_proxy_strong from TASK-814 harvest when ranking the candidate pool. */
function parseTask814Priority(csvText) {
  const strong = new Set();
  const weak = new Set();
  // Prefer Python csv (bios contain commas/quotes); fallback to line parser.
  const tmp = join(REPO, "tmp/cae-ig-queue/_task814_priority.json");
  mkdirSync(dirname(tmp), { recursive: true });
  const src = join(REPO, "tmp/cae-ig-queue/_task814_master.csv");
  writeFileSync(src, csvText.endsWith("\n") ? csvText : `${csvText}\n`);
  const py = spawnSync(
    "python3",
    [
      "-c",
      "import csv,json,sys\nstrong=set(); weak=set()\nwith open(sys.argv[1],newline='',encoding='utf-8',errors='replace') as f:\n  for r in csv.DictReader(f):\n    u=(r.get('instagram_username') or '').strip().lstrip('@').lower()\n    if not u: continue\n    p=(r.get('icp_proxy') or '').strip().lower()\n    if p=='icp_proxy_strong': strong.add(u)\n    elif p=='icp_proxy_weak': weak.add(u)\njson.dump({'strong':sorted(strong),'weak':sorted(weak)}, open(sys.argv[2],'w'))\n",
      src,
      tmp,
    ],
    { encoding: "utf8" },
  );
  if (py.status === 0 && existsSync(tmp)) {
    const j = JSON.parse(readFileSync(tmp, "utf8"));
    for (const u of j.strong || []) strong.add(normUser(u));
    for (const u of j.weak || []) weak.add(normUser(u));
    return { strong, weak };
  }
  const lines = String(csvText || "").split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return { strong, weak };
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const ui = header.indexOf("instagram_username");
  const pi = header.indexOf("icp_proxy");
  if (ui < 0) return { strong, weak };
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const u = normUser(cols[ui]);
    if (!u) continue;
    const proxy = String(cols[pi] || "").trim().toLowerCase();
    if (proxy === "icp_proxy_strong") strong.add(u);
    else if (proxy === "icp_proxy_weak") weak.add(u);
  }
  return { strong, weak };
}

function rankQueue(all, { strong, weak }) {
  const a = [];
  const b = [];
  const c = [];
  for (const u of all) {
    if (strong.has(u)) a.push(u);
    else if (weak.has(u)) b.push(u);
    else c.push(u);
  }
  return [...a, ...b, ...c];
}

function loadPriorFollowed(statePath) {
  if (!existsSync(statePath)) return new Set();
  try {
    const st = JSON.parse(readFileSync(statePath, "utf8"));
    return new Set(
      [...(st.followed || []), ...(st.skipped || [])].map(normUser).filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage: node scripts/caesthetic/cae_ig_build_dolphin_queue.mjs [--out DIR]
Builds private queue for SBO run-cae-ig-869-day1-833304152.mjs (DEC-823/824).
Prints aggregate counts only.`);
    process.exit(0);
  }

  const outDir = args.outDir;
  mkdirSync(outDir, { recursive: true });

  const candidateText = rcloneCat(CANDIDATE_USERNAMES);
  const currentText = rcloneCat(CURRENT_POINTER);
  let task814Csv = "";
  try {
    task814Csv = rcloneCat(TASK814_MASTER);
  } catch (err) {
    console.error(`[warn] TASK-814 master unavailable; ranking without priority: ${err.message}`);
  }

  const candidates = parseUsernameList(candidateText);
  const deny = parseDenyFromCurrent(currentText);
  const prio = parseTask814Priority(task814Csv);
  const afterDeny = candidates.filter((u) => !deny.has(u));
  const ranked = rankQueue(afterDeny, prio);

  const legacyState = join(LEGACY_OUT, "state.json");
  const statePath = existsSync(join(outDir, "state.json"))
    ? join(outDir, "state.json")
    : legacyState;
  const already = loadPriorFollowed(statePath);
  const remaining = ranked.filter((u) => !already.has(u));
  const deferred = ranked.filter((u) => already.has(u));
  // Keep untouched progress at the end so day runners still see full universe if needed
  const queue = [...remaining, ...deferred];

  const usernamesPath = join(outDir, "usernames.txt");
  const queuePath = join(outDir, "queue.txt");
  const metaPath = join(outDir, "queue_meta.json");
  const currentLocal = join(outDir, "CURRENT.json");

  writeFileSync(usernamesPath, `${candidates.join("\n")}\n`);
  writeFileSync(queuePath, `${queue.join("\n")}\n`);
  writeFileSync(currentLocal, currentText.endsWith("\n") ? currentText : `${currentText}\n`);

  const meta = {
    built_at: new Date().toISOString(),
    surface: "B_CAE_IG",
    dolphin_profile_id: "833304152",
    account: "caesthetic.growth",
    selection_tag: "sel_cae_medspa_ig_v1",
    selection_id: "CAE_MEDSPA_IG_V1",
    status: "NON-EXECUTION_QUEUE_FOR_COVERAGE",
    note: "Coverage/follow queue for SBO day runners. Not CURRENT.json / CAE_MEDSPA_IG_FINAL_V1. Do not commit usernames.",
    source_candidate: CANDIDATE_USERNAMES,
    source_deny: CURRENT_POINTER,
    source_priority: TASK814_MASTER,
    agent_card: "docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md",
    builder: "scripts/caesthetic/cae_ig_build_dolphin_queue.mjs",
    runner: "services/social-browser-operator/scripts/run-cae-ig-869-day1-833304152.mjs",
    raw: candidates.length,
    unique: candidates.length,
    deny_excluded: candidates.length - afterDeny.length,
    queue: queue.length,
    remaining_unfollowed: remaining.length,
    already_touched: deferred.length,
    priority_strong_in_queue: ranked.filter((u) => prio.strong.has(u)).length,
    priority_weak_in_queue: ranked.filter((u) => prio.weak.has(u)).length,
    deny_usernames: [...deny].sort(),
    out_dir: outDir,
    queue_path: queuePath,
  };
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  if (args.syncLegacy && outDir !== LEGACY_OUT) {
    mkdirSync(LEGACY_OUT, { recursive: true });
    copyFileSync(queuePath, join(LEGACY_OUT, "queue.txt"));
    copyFileSync(usernamesPath, join(LEGACY_OUT, "usernames.txt"));
    copyFileSync(metaPath, join(LEGACY_OUT, "queue_meta.json"));
    copyFileSync(currentLocal, join(LEGACY_OUT, "CURRENT.json"));
    if (!existsSync(join(LEGACY_OUT, "state.json")) && existsSync(statePath)) {
      copyFileSync(statePath, join(LEGACY_OUT, "state.json"));
    }
  }

  // Private Dropbox mirror (counts + paths; usernames stay in private folders only)
  try {
    rcloneCopyto(
      metaPath,
      "dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/queue_meta.json",
    );
    rcloneCopyto(
      queuePath,
      "dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/queue.txt",
    );
    rcloneCopyto(
      usernamesPath,
      "dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/usernames.txt",
    );
    meta.dropbox_mirror = "dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/";
    writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
  } catch (err) {
    console.error(`[warn] Dropbox mirror skipped: ${err.message}`);
  }

  const publicSummary = {
    ok: true,
    raw: meta.raw,
    queue: meta.queue,
    deny_excluded: meta.deny_excluded,
    remaining_unfollowed: meta.remaining_unfollowed,
    already_touched: meta.already_touched,
    priority_strong_in_queue: meta.priority_strong_in_queue,
    priority_weak_in_queue: meta.priority_weak_in_queue,
    out_dir: meta.out_dir,
    dropbox_mirror: meta.dropbox_mirror || null,
    runner_env: {
      CAE_IG_QUEUE: queuePath,
      CAE_IG_869_QUEUE: join(LEGACY_OUT, "queue.txt"),
    },
  };
  console.log(JSON.stringify(publicSummary, null, 2));
}

main();
