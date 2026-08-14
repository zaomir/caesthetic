#!/usr/bin/env node
/**
 * CAESTHETIC IG Dolphin CURRENT-pointer dry-run.
 *
 * Authority: registry → CURRENT.json → immutable release canonical_master.csv
 * plus CURRENT deny overlay + overrides.csv suppress/research.
 *
 * Never uses the dated export us-spa-ig-master-2026-08 as default.
 * Never uses sel_cae_medspa_ig_v1 as execution authority.
 * Aggregate JSON only — no usernames in stdout/report.
 * Instagram writes are forbidden (DM/like/follow/comment stay hard-off).
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  REQUIRED_CONTRACT,
  contractMismatch,
  hardExcludeReasons,
  isDmInvalid,
  isDmTrue,
  parseCsv,
} from "./us_spa_ig_dolphin_phase1_dryrun.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");

export const REGISTRY_ID = "cae_us_medspa_ig";
export const GIT_REGISTRY_REL = "docs/ssot/data/outreach-username-registries.yaml";
export const FALLBACK_REGISTRY =
  "dropbox:CAESTHETIC/audience/REGISTRY_INDEX.json";
export const DEFAULT_CURRENT =
  "dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json";
export const FORBIDDEN_DATED_EXPORT =
  "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv";
export const FORBIDDEN_CANDIDATE_TAG = "sel_cae_medspa_ig_v1";
export const FORBIDDEN_CANDIDATE_SELECTION = "CAE_MEDSPA_IG_V1";
export const FINAL_SELECTION_ID = "CAE_MEDSPA_IG_FINAL_V1";
/** Learning wave (size 25). Draft w001 (161) remains immutable history, not default. */
export const DEFAULT_WAVE_ID = "cae_medspa_ig_final_v1_w002";
export const DEFAULT_DOLPHIN_PROFILE_ID = "833304152";
export const DEFAULT_REPORT =
  "dropbox:CAESTHETIC/audience/us-spa-ig-master/dolphin_current_dryrun_report.json";
export const LOCAL_REPORT = "/tmp/cae_ig_dolphin_current_dryrun_report.json";

const USERNAME_FIELDS = Object.freeze([
  "username",
  "ig_username",
  "handle",
  "instagram",
  "ig",
]);
const OVERRIDE_EXCLUDE = new Set(["suppress", "research"]);
const SECRET_RE =
  /password|passwd|changeIpUrl|api[_-]?key|Bearer\s+[A-Za-z0-9._-]+/gi;

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

export function normalizeUsername(value) {
  return normalizeLower(value).replace(/^@+/, "");
}

function hasOwn(row, key) {
  return Object.prototype.hasOwnProperty.call(row, key);
}

function increment(map, key, count = 1) {
  map[key] = (map[key] || 0) + count;
}

function sortedObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    )
  );
}

function coerceYamlScalar(raw) {
  const value = String(raw ?? "").trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (value !== "" && Number.isFinite(Number(value))) return Number(value);
  return value;
}

/** Indent-based map parser (JSON also accepted). Enough for the registry file. */
export function parseRegistryText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const raw of trimmed.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indent = raw.match(/^ */)[0].length;
    const line = raw.trim();
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().replace(/^['"]|['"]$/g, "");
    const value = line.slice(colon + 1).trim();
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (value === "" || value === "|" || value === ">") {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parent[key] = coerceYamlScalar(value);
    }
  }
  return root;
}

export function isForbiddenDatedExport(path) {
  return /us-spa-ig-master-2026-08/.test(String(path || ""));
}

export function isRemotePath(value) {
  return /^[A-Za-z0-9_-]+:.+/.test(String(value || ""));
}

function rcloneCopyTo(source, destination) {
  const result = spawnSync("rclone", ["copyto", source, destination], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0) {
    const err = new Error(
      `rclone copyto failed for ${source}: ${(result.stderr || result.stdout || "").slice(0, 240)}`
    );
    err.code = "RCLONE_COPY_FAILED";
    throw err;
  }
}

function rcloneCat(source) {
  const result = spawnSync("rclone", ["cat", source], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0) {
    const err = new Error(
      `rclone cat failed for ${source}: ${(result.stderr || result.stdout || "").slice(0, 240)}`
    );
    err.code = "RCLONE_CAT_FAILED";
    throw err;
  }
  return result.stdout;
}

function rcloneLsf(source, extra = []) {
  const result = spawnSync("rclone", ["lsf", source, ...extra], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
  });
  if (result.status !== 0) return [];
  return String(result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function readText(input) {
  if (!input) {
    const err = new Error("missing input path");
    err.code = "INPUT_MISSING";
    throw err;
  }
  if (!isRemotePath(input)) {
    return {
      text: readFileSync(resolve(input), "utf8"),
      cleanup: () => {},
      resolvedVia: "local",
      source: input,
    };
  }
  const dir = mkdtempSync(join(tmpdir(), "cae-ig-current-"));
  const local = join(dir, basename(String(input).split("?")[0]) || "payload.bin");
  rcloneCopyTo(input, local);
  return {
    text: readFileSync(local, "utf8"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
    resolvedVia: "rclone",
    source: input,
  };
}

function writeOutput(output, body) {
  if (!output) return;
  if (!isRemotePath(output)) {
    const local = resolve(output);
    mkdirSync(dirname(local), { recursive: true });
    writeFileSync(local, body);
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "cae-ig-current-report-"));
  const local = join(dir, "dolphin_current_dryrun_report.json");
  try {
    writeFileSync(local, body);
    rcloneCopyTo(local, output);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function usernameOf(row) {
  for (const field of USERNAME_FIELDS) {
    if (hasOwn(row, field) && normalize(row[field])) {
      return normalizeUsername(row[field]);
    }
  }
  return "";
}

export function parseOverrides(text) {
  const parsed = parseCsv(text || "");
  const decisions = new Map();
  for (const row of parsed.rows) {
    const username = usernameOf(row);
    if (!username) continue;
    decisions.set(username, normalizeLower(row.decision || row.action || ""));
  }
  return decisions;
}

export function denySetFromCurrent(current) {
  const list = Array.isArray(current?.deny_usernames) ? current.deny_usernames : [];
  return new Set(list.map(normalizeUsername).filter(Boolean));
}

function firstPresent(row, fields) {
  for (const field of fields) {
    if (normalize(row[field])) return normalize(row[field]);
  }
  return "";
}

function stateFor(row) {
  return firstPresent(row, ["state", "state_code", "region", "us_state"]) || "UNSET";
}

function sourceFor(row) {
  return (
    firstPresent(row, [
      "source",
      "source_file",
      "source_path",
      "source_url",
      "source_id",
      "list_source",
    ]) || "UNSET"
  );
}

function selectedUntaggedReasons(row) {
  const reasons = [];
  for (const key of Object.keys(REQUIRED_CONTRACT)) {
    if (!normalize(row[key])) reasons.push(`missing_${key}`);
  }
  if (sourceFor(row) === "UNSET") reasons.push("missing_source");
  if (stateFor(row) === "UNSET") reasons.push("missing_state");
  return reasons;
}

function extraExcludeReasons(row, { denySet, overrideDecisions }) {
  const reasons = [];
  const username = usernameOf(row);
  if (username && denySet.has(username)) reasons.push("deny_overlay");
  const decision = username ? overrideDecisions.get(username) : "";
  if (OVERRIDE_EXCLUDE.has(decision)) reasons.push(`override_${decision}`);
  return reasons;
}

export function collectKnownUsernames({ csvText = "", current = {}, overridesText = "", wave = {} } = {}) {
  const names = new Set();
  for (const name of denySetFromCurrent(current)) names.add(name);
  for (const name of parseOverrides(overridesText).keys()) names.add(name);
  for (const row of parseCsv(csvText).rows) {
    const username = usernameOf(row);
    if (username) names.add(username);
  }
  const waveNames = wave.usernames || wave.handles || [];
  if (Array.isArray(waveNames)) {
    for (const name of waveNames) {
      const username = normalizeUsername(name);
      if (username) names.add(username);
    }
  }
  return [...names].filter((name) => name.length >= 3);
}

export function reportContainsUsernames(reportText, usernames) {
  const haystack = String(reportText || "").toLowerCase();
  return usernames.filter((name) => haystack.includes(normalizeUsername(name)));
}

function publicCurrent(current, source) {
  return {
    source,
    registry_id: current?.registry_id || "",
    release_id: current?.release_id || "",
    status: current?.status || "",
    selection_id: current?.selection_id || "",
    selection_tag: current?.selection_tag || "",
    execution_allowed: Boolean(current?.execution_allowed),
    canonical_master: current?.canonical_master || "",
    overrides: current?.overrides || "",
    ready_for_warm_claimed: Number(current?.ready_for_warm ?? 0),
    legacy_ready_for_warm: Number(current?.legacy_ready_for_warm ?? 0),
    deny_overlay_count: Array.isArray(current?.deny_usernames)
      ? current.deny_usernames.length
      : 0,
    dm_eligible: current?.dm_eligible === false || current?.dm_eligible === "false"
      ? false
      : current?.dm_eligible ?? false,
    dolphin_profile_id: String(current?.dolphin_profile_id || DEFAULT_DOLPHIN_PROFILE_ID),
    surface: current?.surface || REQUIRED_CONTRACT.surface,
    motion: current?.motion || REQUIRED_CONTRACT.motion,
  };
}

function publicRegistry(registryEntry, { source, path }) {
  return {
    source,
    path,
    registry_id: REGISTRY_ID,
    project: registryEntry?.project || "",
    current_pointer: registryEntry?.current_pointer || DEFAULT_CURRENT,
    waves_root: registryEntry?.waves_root || "",
    releases_root: registryEntry?.releases_root || "",
    final_selection_id: registryEntry?.final_selection_id || "",
    candidate_selection_id: registryEntry?.candidate_selection_id || "",
    dolphin_profile_id: String(
      registryEntry?.dolphin_profile_id || DEFAULT_DOLPHIN_PROFILE_ID
    ),
    dm_eligible_default: registryEntry?.dm_eligible_default ?? false,
  };
}

export function resolveRegistryEntry(parsed) {
  const registries = parsed?.registries || parsed;
  const entry = registries?.[REGISTRY_ID] || parsed?.[REGISTRY_ID];
  if (!entry || typeof entry !== "object") {
    const err = new Error(`registry ${REGISTRY_ID} not found`);
    err.code = "REGISTRY_NOT_FOUND";
    throw err;
  }
  return entry;
}

export function buildCurrentDryRunReport({
  csvText,
  current = {},
  currentSource = DEFAULT_CURRENT,
  registry = {},
  registryMeta = { source: "fixture", path: "fixture" },
  overridesText = "",
  wave = { status: "missing", wave_id: DEFAULT_WAVE_ID },
  inputSource = "fixture",
  dolphin = {
    enabled: false,
    control_plane: "skipped",
    preflight: "SKIPPED",
  },
} = {}) {
  if (isForbiddenDatedExport(inputSource) || isForbiddenDatedExport(current?.canonical_master)) {
    const err = new Error("dated export is not execution authority");
    err.code = "FORBIDDEN_DATED_EXPORT";
    throw err;
  }

  const parsed = parseCsv(csvText || "");
  const denySet = denySetFromCurrent(current);
  const overrideDecisions = parseOverrides(overridesText);
  const waveListRaw = Array.isArray(wave.usernames)
    ? wave.usernames
    : Array.isArray(wave.handles)
      ? wave.handles
      : [];
  const waveList = waveListRaw.map(normalizeUsername).filter(Boolean);
  const waveNames = new Set(waveList);
  const waveFilterOn = waveNames.size > 0;
  const waveStatus = normalizeLower(wave.status || wave.wave_status || "missing");
  const waveResolved = ["draft", "approved"].includes(waveStatus);
  const waveUnique = waveList.length === waveNames.size;
  const waveDmEligible = wave.dm_eligible;
  const waveDmHardOff =
    waveDmEligible === undefined ||
    waveDmEligible === null ||
    waveDmEligible === false ||
    normalizeLower(waveDmEligible) === "false" ||
    normalizeLower(waveDmEligible) === "";

  const selected = [];
  const excludedReasons = {};
  let hardExcludedRows = 0;
  let invalidDmRows = 0;
  let denyExcluded = 0;
  let overrideExcluded = 0;
  let readyForWarmRows = 0;
  let readyForWarmAfterDeny = 0;

  for (const row of parsed.rows) {
    if (normalizeLower(row.status) === "ready_for_warm") readyForWarmRows += 1;
    if (isDmInvalid(row)) invalidDmRows += 1;

    const extra = extraExcludeReasons(row, { denySet, overrideDecisions });
    if (extra.includes("deny_overlay")) denyExcluded += 1;
    if (extra.some((reason) => reason.startsWith("override_"))) overrideExcluded += 1;

    const hardReasons = hardExcludeReasons(row);
    if (hardReasons.length) {
      hardExcludedRows += 1;
      for (const reason of hardReasons) increment(excludedReasons, reason);
    }
    for (const reason of extra) increment(excludedReasons, reason);

    const mismatches = contractMismatch(row);
    if (mismatches.length || hardReasons.length || extra.length) {
      for (const reason of mismatches) increment(excludedReasons, `contract_${reason}`);
      continue;
    }

    if (normalizeLower(row.status) === "ready_for_warm") readyForWarmAfterDeny += 1;
    selected.push(row);
  }

  const selectedUsernames = new Set(selected.map((row) => usernameOf(row)).filter(Boolean));
  const selectedInWave = waveFilterOn
    ? selected.filter((row) => waveNames.has(usernameOf(row)))
    : selected;
  const waveMissingFromWarm = waveFilterOn
    ? [...waveNames].filter((name) => !selectedUsernames.has(name)).length
    : 0;

  const countsByState = {};
  const countsBySource = {};
  const countsBySourceAndState = {};
  const selectedDmTrue = [];
  const selectedHardExcluded = [];
  const selectedUntagged = [];

  for (const row of selected) {
    const state = stateFor(row);
    const source = sourceFor(row);
    increment(countsByState, state);
    increment(countsBySource, source);
    countsBySourceAndState[source] = countsBySourceAndState[source] || {};
    increment(countsBySourceAndState[source], state);
    if (isDmTrue(row)) selectedDmTrue.push(row.__row_number);
    const hardReasons = hardExcludeReasons(row);
    if (hardReasons.length) {
      selectedHardExcluded.push({ row: row.__row_number, reasons: hardReasons });
    }
    const untaggedReasons = selectedUntaggedReasons(row);
    if (untaggedReasons.length) {
      selectedUntagged.push({ row: row.__row_number, reasons: untaggedReasons });
    }
  }

  const claimed = Number(current?.ready_for_warm ?? 0);
  const selectedAfterDeny = selected.length;
  const readyForWarmAlignment =
    claimed > 0 && claimed !== selectedAfterDeny
      ? "ready_for_warm_claimed_mismatch"
      : claimed === 0
        ? "ready_for_warm_claimed_unset"
        : "aligned";

  const dolphinProfileId = String(
    current?.dolphin_profile_id ||
      registry?.dolphin_profile_id ||
      wave?.dolphin_profile_id ||
      DEFAULT_DOLPHIN_PROFILE_ID
  );
  const releaseExists = Boolean(
    normalize(current?.release_id) && (current?.canonical_master || inputSource)
  );

  const waveGates = {
    release_exists: releaseExists,
    wave_exists: waveResolved,
    usernames_unique: waveFilterOn ? waveUnique : false,
    wave_non_empty: waveFilterOn,
    suppression_applied: denySet.size > 0 || overrideExcluded > 0 || denyExcluded > 0,
    dm_eligible_false: waveDmHardOff && selectedDmTrue.length === 0,
    dolphin_profile_expected: dolphinProfileId === DEFAULT_DOLPHIN_PROFILE_ID,
    wave_members_in_warm_pool: waveFilterOn ? waveMissingFromWarm === 0 : false,
  };
  waveGates.passed = Object.values(waveGates).every(Boolean);

  const guard = {
    dm_hard_off: true,
    dm_true_selected_count: selectedDmTrue.length,
    hard_excluded_selected_count: selectedHardExcluded.length,
    untagged_selected_count: selectedUntagged.length,
    invalid_dm_value_rows: invalidDmRows,
    dated_export_used: false,
    candidate_selection_used: false,
    instagram_actions: "NOT EXECUTED",
    wave_gates_passed: waveGates.passed,
  };
  guard.passed =
    guard.dm_true_selected_count === 0 &&
    guard.hard_excluded_selected_count === 0 &&
    guard.untagged_selected_count === 0 &&
    !guard.dated_export_used &&
    !guard.candidate_selection_used &&
    waveGates.passed;

  const registryPublic = publicRegistry(registry, registryMeta);
  const currentPublic = publicCurrent(current, currentSource);

  return {
    ok: guard.passed,
    generated_at: new Date().toISOString(),
    dry_run: true,
    dry_run_status: guard.passed ? "PASS" : "FAIL",
    phase: "Dolphin CURRENT warm consumer",
    registry: registryPublic,
    registry_resolved: Boolean(registryPublic.current_pointer),
    current: currentPublic,
    release: {
      release_id: currentPublic.release_id,
      canonical_master: currentPublic.canonical_master || inputSource,
      dated_export_default: false,
      forbidden_dated_export: FORBIDDEN_DATED_EXPORT,
      forbidden_candidate_tag: FORBIDDEN_CANDIDATE_TAG,
      exists: releaseExists,
    },
    wave: {
      wave_id: wave.wave_id || DEFAULT_WAVE_ID,
      wave_status: waveStatus || "missing",
      wave_resolved: waveResolved,
      wave_username_count: waveFilterOn ? waveNames.size : 0,
      wave_list_count: waveList.length,
      selected_in_wave: waveFilterOn ? selectedInWave.length : 0,
      usernames_unique: waveUnique,
      dm_eligible: waveDmHardOff ? false : Boolean(waveDmEligible),
      members_missing_from_warm_pool: waveMissingFromWarm,
    },
    wave_gates: waveGates,
    contract: {
      ...REQUIRED_CONTRACT,
      dm_eligible: "false_or_missing",
      deny_overlay: true,
      overrides_exclude: ["suppress", "research"],
      hard_exclude: [
        "academy/student",
        "action_queue=research|none",
        "status=needs_qualification|suppressed",
        "students.csv",
        "VOC",
        "unionpayru",
      ],
    },
    browser_actions: {
      dolphin_start: Boolean(dolphin?.started),
      follows: false,
      likes: false,
      comments: false,
      dms: false,
    },
    dolphin: {
      profile_id: String(
        current?.dolphin_profile_id ||
          registry?.dolphin_profile_id ||
          DEFAULT_DOLPHIN_PROFILE_ID
      ),
      control_plane: dolphin?.control_plane || "skipped",
      preflight: dolphin?.preflight || "SKIPPED",
      instagram_actions: "NOT EXECUTED",
      note: dolphin?.note || "default --no-dolphin",
    },
    totals: {
      rows_read: parsed.rows.length,
      ready_for_warm_in_release: readyForWarmRows,
      ready_for_warm_claimed: claimed,
      ready_for_warm_after_deny: readyForWarmAfterDeny,
      selected_warm_after_deny: selectedAfterDeny,
      selected_warm_targets: selectedAfterDeny,
      deny_overlay_excluded: denyExcluded,
      override_excluded: overrideExcluded,
      excluded_rows: parsed.rows.length - selectedAfterDeny,
      hard_excluded_rows: hardExcludedRows,
      invalid_dm_value_rows: invalidDmRows,
    },
    ready_for_warm_alignment: {
      finding: readyForWarmAlignment,
      ready_for_warm_claimed: claimed,
      selected_after_deny: selectedAfterDeny,
    },
    counts_by_state: sortedObject(countsByState),
    counts_by_source: sortedObject(countsBySource),
    counts_by_source_and_state: Object.fromEntries(
      Object.entries(countsBySourceAndState)
        .sort(([a], [b]) => a.localeCompare(b, "en", { sensitivity: "base" }))
        .map(([source, states]) => [source, sortedObject(states)])
    ),
    excluded_reasons: sortedObject(excludedReasons),
    guard,
    guard_details: {
      dm_true_selected_rows: selectedDmTrue,
      hard_excluded_selected_rows: selectedHardExcluded,
      untagged_selected_rows: selectedUntagged,
    },
    input: {
      source: inputSource,
      rows_read: parsed.rows.length,
      headers: parsed.headers,
      default_pointer: inputSource === DEFAULT_CURRENT,
      dated_export: false,
    },
  };
}

function gitRegistryPath() {
  return join(REPO, GIT_REGISTRY_REL);
}

export function resolveRegistrySource({ registryPath } = {}) {
  if (registryPath) {
    return { path: registryPath, source: isRemotePath(registryPath) ? "cli_remote" : "cli_local" };
  }
  const gitPath = gitRegistryPath();
  if (existsSync(gitPath)) {
    return { path: gitPath, source: "git_yaml" };
  }
  return { path: FALLBACK_REGISTRY, source: "registry_index" };
}

export function resolveWaveManifest(wavesRoot, waveId = DEFAULT_WAVE_ID) {
  if (!wavesRoot) {
    return { status: "missing", wave_id: waveId };
  }
  const candidates = [
    `${wavesRoot.replace(/\/$/, "")}/${waveId}/manifest.json`,
    `${wavesRoot.replace(/\/$/, "")}/${waveId}.json`,
    `${wavesRoot.replace(/\/$/, "")}/${waveId}/draft.json`,
    `${wavesRoot.replace(/\/$/, "")}/${waveId}/approved.json`,
  ];
  for (const path of candidates) {
    try {
      const loaded = readText(path);
      try {
        const manifest = JSON.parse(loaded.text);
        const status = normalizeLower(manifest.status || manifest.wave_status || "draft");
        if (!["draft", "approved"].includes(status) && status !== "missing") {
          // still accept unknown as draft if a manifest existed
        }
        const resolvedStatus = ["draft", "approved"].includes(status) ? status : "draft";
        return {
          status: resolvedStatus,
          wave_id: manifest.wave_id || waveId,
          usernames: manifest.usernames || manifest.handles || [],
          path,
          resolved_via: loaded.resolvedVia,
        };
      } finally {
        loaded.cleanup();
      }
    } catch {
      // try next candidate
    }
  }
  const listing = isRemotePath(wavesRoot)
    ? rcloneLsf(wavesRoot, ["--dirs-only"])
    : existsSync(wavesRoot)
      ? []
      : [];
  const hit = listing.find((name) => normalizeLower(name).includes(normalizeLower(waveId)));
  if (hit) {
    return resolveWaveManifest(`${wavesRoot.replace(/\/$/, "")}/${hit.replace(/\/$/, "")}`, waveId);
  }
  return { status: "missing", wave_id: waveId };
}

function redactSecrets(text) {
  return String(text || "").replace(SECRET_RE, "[redacted]");
}

function parseJsonLenient(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function runDolphinControlPlane({
  profileId = DEFAULT_DOLPHIN_PROFILE_ID,
  repo = REPO,
} = {}) {
  const lockPath = `/var/lib/dolphin-profile-control/locks/${profileId}.lock`;
  const preflightScript = join(
    repo,
    "mcp-server/dolphin-profile-control/scripts/proxy-preflight.mjs"
  );
  const inspectScript = join(
    repo,
    "mcp-server/dolphin-profile-control/scripts/smoke-inspect.mjs"
  );
  const startScript = join(
    repo,
    "mcp-server/dolphin-profile-control/scripts/operator-start.mjs"
  );
  const stopScript = join(
    repo,
    "mcp-server/dolphin-profile-control/scripts/operator-stop.mjs"
  );

  const preflight = spawnSync(process.execPath, [preflightScript, profileId], {
    cwd: repo,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
  });
  const preflightJson = parseJsonLenient(preflight.stdout);
  const preflightOk = preflight.status === 0 && preflightJson?.ok === true;
  const locked = existsSync(lockPath);

  const inspect = spawnSync(process.execPath, [inspectScript, profileId], {
    cwd: join(repo, "mcp-server/dolphin-profile-control"),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
  });
  const inspectJson = parseJsonLenient(inspect.stdout);
  const inspected = inspect.status === 0 || Boolean(inspectJson);

  if (locked) {
    return {
      enabled: true,
      started: false,
      control_plane: inspected ? "inspected" : "blocked",
      preflight: preflightOk ? "PASS" : "FAIL",
      note: "profile lock present — inspect only, session not stolen",
      preflight_ok: preflightOk,
      inspect_ok: inspected,
      stderr: redactSecrets(preflight.stderr || inspect.stderr || "").slice(0, 400),
    };
  }

  if (!preflightOk) {
    return {
      enabled: true,
      started: false,
      control_plane: inspected ? "inspected" : "blocked",
      preflight: "FAIL",
      note: "proxy preflight FAIL — BLOCKER, did not start",
      preflight_ok: false,
      inspect_ok: inspected,
      stderr: redactSecrets(preflight.stderr || preflight.stdout || "").slice(0, 400),
    };
  }

  const start = spawnSync(
    process.execPath,
    [startScript, profileId, "--holder=cae-ig-readiness-dryrun"],
    {
      cwd: repo,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 4,
    }
  );
  const started = start.status === 0;
  const stop = spawnSync(process.execPath, [stopScript, profileId], {
    cwd: repo,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
  });

  if (!started) {
    return {
      enabled: true,
      started: false,
      control_plane: "blocked",
      preflight: "PASS",
      note: "start blocked (proxy/IP/session lock) — inspect only",
      preflight_ok: true,
      inspect_ok: inspected,
      stop_status: stop.status,
      stderr: redactSecrets(start.stderr || start.stdout || "").slice(0, 400),
    };
  }

  return {
    enabled: true,
    started: true,
    control_plane: "started_stopped",
    preflight: "PASS",
    note: "started then immediately stopped; no Instagram navigation",
    preflight_ok: true,
    inspect_ok: inspected,
    stop_status: stop.status,
    stderr: redactSecrets(stop.stderr || "").slice(0, 200),
  };
}

function parseArgs(argv) {
  const args = {
    registry: "",
    current: "",
    input: "",
    overrides: "",
    output: process.env.CAE_IG_CURRENT_DOLPHIN_REPORT || "",
    waveId: DEFAULT_WAVE_ID,
    pretty: true,
    dolphin: false,
    localReport: LOCAL_REPORT,
    localReportExplicit: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--registry") args.registry = argv[++i];
    else if (arg === "--current") args.current = argv[++i];
    else if (arg === "--input") args.input = argv[++i];
    else if (arg === "--overrides") args.overrides = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--wave-id") args.waveId = argv[++i];
    else if (arg === "--local-report") {
      args.localReport = argv[++i];
      args.localReportExplicit = true;
    }
    else if (arg === "--compact") args.pretty = false;
    else if (arg === "--dolphin-control-plane") args.dolphin = true;
    else if (arg === "--no-dolphin") args.dolphin = false;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printHelp() {
  const script = basename(fileURLToPath(import.meta.url));
  console.log(`Usage: node scripts/caesthetic/${script} [options]

Resolve registry → CURRENT.json → immutable release, apply deny overlay,
emit aggregate JSON only. Default --no-dolphin (no browser lifecycle).

  --registry PATH          Git yaml / REGISTRY_INDEX.json / local fixture
  --current PATH           CURRENT.json (default from registry pointer)
  --input CSV              Override canonical_master (tests only)
  --overrides CSV          Override overrides.csv
  --output JSON            Report path or rclone dest
  --wave-id ID             Default ${DEFAULT_WAVE_ID}
  --no-dolphin             Skip browser lifecycle (default)
  --dolphin-control-plane  Proxy preflight + inspect + optional start/stop
                           of profile ${DEFAULT_DOLPHIN_PROFILE_ID} only.
                           Never opens Instagram write flows.

Authority: CURRENT pointer, not ${FORBIDDEN_DATED_EXPORT}
Forbidden execution source: ${FORBIDDEN_CANDIDATE_TAG}`);
}

function failPayload(message, extra = {}) {
  return {
    ok: false,
    dry_run: true,
    dry_run_status: "FAIL",
    error: extra.code || "DRYRUN_FAILED",
    message,
    browser_actions: {
      dolphin_start: false,
      follows: false,
      likes: false,
      comments: false,
      dms: false,
    },
    ...extra,
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return 0;
  }

  const cleanups = [];
  try {
    const registrySource = resolveRegistrySource({ registryPath: args.registry });
    const registryLoaded = readText(registrySource.path);
    cleanups.push(registryLoaded.cleanup);
    const registryParsed = parseRegistryText(registryLoaded.text);
    const registryEntry = resolveRegistryEntry(registryParsed);
    const currentPath = args.current || registryEntry.current_pointer || DEFAULT_CURRENT;
    const currentLoaded = readText(currentPath);
    cleanups.push(currentLoaded.cleanup);
    const current = JSON.parse(currentLoaded.text);

    if (current.selection_tag === FORBIDDEN_CANDIDATE_TAG) {
      throw Object.assign(new Error("candidate selection is not execution authority"), {
        code: "FORBIDDEN_CANDIDATE_SELECTION",
      });
    }
    if (
      current.selection_id === FORBIDDEN_CANDIDATE_SELECTION &&
      current.selection_id !== FINAL_SELECTION_ID
    ) {
      throw Object.assign(new Error("candidate selection id is not execution authority"), {
        code: "FORBIDDEN_CANDIDATE_SELECTION",
      });
    }

    const masterPath = args.input || current.canonical_master;
    if (!masterPath) {
      throw Object.assign(new Error("CURRENT.json missing canonical_master"), {
        code: "CURRENT_MASTER_MISSING",
      });
    }
    if (isForbiddenDatedExport(masterPath) && !args.input) {
      throw Object.assign(new Error("CURRENT.json points at dated export"), {
        code: "FORBIDDEN_DATED_EXPORT",
      });
    }

    const masterLoaded = readText(masterPath);
    cleanups.push(masterLoaded.cleanup);

    let overridesText = "";
    const overridesPath = args.overrides || current.overrides;
    if (overridesPath) {
      try {
        const overridesLoaded = readText(overridesPath);
        cleanups.push(overridesLoaded.cleanup);
        overridesText = overridesLoaded.text;
      } catch (error) {
        if (args.overrides) throw error;
        overridesText = "";
      }
    }

    const wave = resolveWaveManifest(registryEntry.waves_root, args.waveId);

    const dolphin = args.dolphin
      ? runDolphinControlPlane({
          profileId: String(current.dolphin_profile_id || DEFAULT_DOLPHIN_PROFILE_ID),
          repo: REPO,
        })
      : {
          enabled: false,
          started: false,
          control_plane: "skipped",
          preflight: "SKIPPED",
          note: "default --no-dolphin",
        };

    const report = buildCurrentDryRunReport({
      csvText: masterLoaded.text,
      current,
      currentSource: currentPath,
      registry: registryEntry,
      registryMeta: registrySource,
      overridesText,
      wave,
      inputSource: masterPath,
      dolphin,
    });
    report.input.resolved_via = masterLoaded.resolvedVia;
    report.registry.resolved_via = registryLoaded.resolvedVia;
    report.current.resolved_via = currentLoaded.resolvedVia;

    const known = collectKnownUsernames({
      csvText: masterLoaded.text,
      current,
      overridesText,
      wave,
    });
    const body = `${JSON.stringify(report, null, args.pretty ? 2 : 0)}\n`;
    const leaked = reportContainsUsernames(body, known);
    if (leaked.length) {
      const safe = failPayload("username leak in aggregate report", {
        code: "USERNAME_LEAK",
        leaked_count: leaked.length,
      });
      const safeBody = `${JSON.stringify(safe, null, 2)}\n`;
      console.error(safeBody);
      return 2;
    }

    const output = args.output || DEFAULT_REPORT;
    writeOutput(output, body);
    if ((!args.output || args.localReportExplicit) && args.localReport && args.localReport !== output) {
      writeOutput(args.localReport, body);
    }
    console.log(body.trimEnd());
    if (!report.registry_resolved || !report.current.release_id) return 3;
    return report.guard.passed ? 0 : 2;
  } catch (error) {
    const body = JSON.stringify(
      failPayload(redactSecrets(error.message), {
        code: error.code || "DRYRUN_FAILED",
      }),
      null,
      2
    );
    console.error(body);
    return error.code === "FORBIDDEN_DATED_EXPORT" ||
      error.code === "FORBIDDEN_CANDIDATE_SELECTION"
      ? 2
      : 3;
  } finally {
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch {
        /* ignore */
      }
    }
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
