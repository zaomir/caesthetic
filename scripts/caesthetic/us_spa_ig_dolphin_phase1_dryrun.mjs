#!/usr/bin/env node
/**
 * CAESTHETIC US spa IG Dolphin Phase-1 dry-run consumer.
 *
 * Dry-run only: reads the canonical master, filters the warm queue, and writes
 * aggregate counts. It never opens Dolphin, browsers, or social surfaces.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_MASTER =
  "dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv";
export const MASTER_ENV = "CAE_US_SPA_IG_MASTER";
export const REPORT_ENV = "CAE_US_SPA_IG_DOLPHIN_REPORT";

export const REQUIRED_CONTRACT = Object.freeze({
  surface: "B_CAE_IG",
  motion: "motion_d",
  action_queue: "warm",
  status: "ready_for_warm",
  project: "caesthetic",
  country: "US",
});

const TRUE_VALUES = new Set(["1", "true", "yes", "y", "on"]);
const FALSE_VALUES = new Set(["", "0", "false", "no", "n", "off"]);
const HARD_EXCLUDE_PATTERNS = Object.freeze([
  { id: "student", re: /\bstudents?\b/i },
  { id: "academy", re: /\bacadem(?:y|ies)\b/i },
  { id: "students_csv", re: /students\.csv/i },
  { id: "voc", re: /\bvoc\b|copy-voc/i },
  { id: "unionpayru", re: /unionpayru/i },
]);

const SOURCE_FIELDS = Object.freeze([
  "source",
  "source_file",
  "source_path",
  "source_url",
  "source_id",
  "list_source",
]);
const STATE_FIELDS = Object.freeze(["state", "state_code", "region", "us_state"]);

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function hasOwn(row, key) {
  return Object.prototype.hasOwnProperty.call(row, key);
}

export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((cells) => cells.some((cell) => normalize(cell) !== ""));
  if (!nonEmptyRows.length) {
    return { headers: [], rows: [] };
  }

  const headers = nonEmptyRows[0].map((header, index) => {
    const clean = normalize(header).replace(/^\uFEFF/, "");
    return clean || `column_${index + 1}`;
  });

  return {
    headers,
    rows: nonEmptyRows.slice(1).map((cells, index) => {
      const obj = { __row_number: index + 2 };
      headers.forEach((header, col) => {
        obj[header] = normalize(cells[col]);
      });
      return obj;
    }),
  };
}

export function isDmFalseOrMissing(row) {
  if (!hasOwn(row, "dm_eligible")) return true;
  return FALSE_VALUES.has(normalizeLower(row.dm_eligible));
}

export function isDmTrue(row) {
  return TRUE_VALUES.has(normalizeLower(row.dm_eligible));
}

export function isDmInvalid(row) {
  if (!hasOwn(row, "dm_eligible")) return false;
  const value = normalizeLower(row.dm_eligible);
  return !TRUE_VALUES.has(value) && !FALSE_VALUES.has(value);
}

export function contractMismatch(row) {
  const mismatches = [];
  for (const [key, expected] of Object.entries(REQUIRED_CONTRACT)) {
    if (normalizeLower(row[key]) !== expected.toLowerCase()) {
      mismatches.push(key);
    }
  }
  if (!isDmFalseOrMissing(row)) {
    mismatches.push("dm_eligible");
  }
  return mismatches;
}

function rowHaystack(row) {
  const preferred = [
    ...SOURCE_FIELDS,
    "audience_source",
    "segment",
    "list_name",
    "source_type",
    "notes",
  ];
  const parts = preferred
    .filter((key) => hasOwn(row, key))
    .map((key) => row[key]);
  return parts.join(" ");
}

export function hardExcludeReasons(row) {
  const reasons = [];
  const haystack = rowHaystack(row);
  for (const { id, re } of HARD_EXCLUDE_PATTERNS) {
    if (re.test(haystack)) reasons.push(id);
  }
  if (["research", "none"].includes(normalizeLower(row.action_queue))) {
    reasons.push(`action_queue_${normalizeLower(row.action_queue)}`);
  }
  if (["needs_qualification", "suppressed"].includes(normalizeLower(row.status))) {
    reasons.push(`status_${normalizeLower(row.status)}`);
  }
  return reasons;
}

function firstPresent(row, fields) {
  for (const field of fields) {
    if (normalize(row[field])) return normalize(row[field]);
  }
  return "";
}

function stateFor(row) {
  return firstPresent(row, STATE_FIELDS) || "UNSET";
}

function sourceFor(row) {
  return firstPresent(row, SOURCE_FIELDS) || "UNSET";
}

function increment(map, key, count = 1) {
  map[key] = (map[key] || 0) + count;
}

function sortedObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, "en", { sensitivity: "base" }))
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

export function buildDryRunReport(csvText, { inputSource = "fixture" } = {}) {
  const parsed = parseCsv(csvText);
  const selected = [];
  const excludedReasons = {};
  let hardExcludedRows = 0;
  let invalidDmRows = 0;

  for (const row of parsed.rows) {
    if (isDmInvalid(row)) invalidDmRows += 1;

    const hardReasons = hardExcludeReasons(row);
    if (hardReasons.length) {
      hardExcludedRows += 1;
      for (const reason of hardReasons) increment(excludedReasons, reason);
    }

    const mismatches = contractMismatch(row);
    if (mismatches.length || hardReasons.length) {
      for (const reason of mismatches) increment(excludedReasons, `contract_${reason}`);
      continue;
    }

    selected.push(row);
  }

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
    if (hardReasons.length) selectedHardExcluded.push({ row: row.__row_number, reasons: hardReasons });
    const untaggedReasons = selectedUntaggedReasons(row);
    if (untaggedReasons.length) {
      selectedUntagged.push({ row: row.__row_number, reasons: untaggedReasons });
    }
  }

  const guard = {
    dm_hard_off: true,
    dm_true_selected_count: selectedDmTrue.length,
    hard_excluded_selected_count: selectedHardExcluded.length,
    untagged_selected_count: selectedUntagged.length,
    invalid_dm_value_rows: invalidDmRows,
  };
  guard.passed =
    guard.dm_true_selected_count === 0 &&
    guard.hard_excluded_selected_count === 0 &&
    guard.untagged_selected_count === 0;

  return {
    ok: guard.passed,
    generated_at: new Date().toISOString(),
    dry_run: true,
    phase: "Dolphin Phase-1 warm consumer",
    input: {
      source: inputSource,
      rows_read: parsed.rows.length,
      headers: parsed.headers,
    },
    contract: {
      ...REQUIRED_CONTRACT,
      dm_eligible: "false_or_missing",
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
      dolphin_start: false,
      follows: false,
      likes: false,
      comments: false,
      dms: false,
    },
    totals: {
      rows_read: parsed.rows.length,
      selected_warm_targets: selected.length,
      excluded_rows: parsed.rows.length - selected.length,
      hard_excluded_rows: hardExcludedRows,
      invalid_dm_value_rows: invalidDmRows,
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
  };
}

function parseArgs(argv) {
  const args = {
    input: process.env[MASTER_ENV] || DEFAULT_MASTER,
    output: process.env[REPORT_ENV] || "",
    pretty: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") {
      args.input = argv[++i];
    } else if (arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "--compact") {
      args.pretty = false;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function isRemotePath(value) {
  return /^[A-Za-z0-9_-]+:.+/.test(value);
}

function rcloneCopyTo(source, destination) {
  const result = spawnSync("rclone", ["copyto", source, destination], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });
  if (result.status !== 0) {
    const err = new Error(
      `rclone copyto failed for ${source} -> ${destination}: ${result.stderr || result.stdout}`
    );
    err.code = "RCLONE_COPY_FAILED";
    err.status = result.status;
    throw err;
  }
}

function readInput(input) {
  if (!isRemotePath(input)) {
    return {
      text: readFileSync(resolve(input), "utf8"),
      cleanup: () => {},
      resolvedVia: "local",
    };
  }

  const dir = mkdtempSync(join(tmpdir(), "cae-us-spa-ig-master-"));
  const local = join(dir, basename(input) || "canonical_master.csv");
  rcloneCopyTo(input, local);
  return {
    text: readFileSync(local, "utf8"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
    resolvedVia: "rclone",
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

  const dir = mkdtempSync(join(tmpdir(), "cae-us-spa-ig-report-"));
  const local = join(dir, "dolphin_dryrun_report.json");
  try {
    writeFileSync(local, body);
    rcloneCopyTo(local, output);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function printHelp() {
  const script = basename(fileURLToPath(import.meta.url));
  console.log(`Usage: node scripts/caesthetic/${script} [--input CSV_OR_RCLONE] [--output JSON_OR_RCLONE]

Environment:
  ${MASTER_ENV}   Override master CSV source.
  ${REPORT_ENV}  Optional JSON report path or rclone destination.

Default master:
  ${DEFAULT_MASTER}

Safety:
  Dry-run only. No Dolphin start, no browser automation, no follows/likes/comments/DM.`);
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return 0;
  }

  let input;
  try {
    input = readInput(args.input);
  } catch (error) {
    const body = JSON.stringify(
      {
        ok: false,
        dry_run: true,
        status: "INPUT_UNAVAILABLE",
        input: { source: args.input },
        error: error.code || "INPUT_READ_FAILED",
        message: error.message,
        browser_actions: {
          dolphin_start: false,
          follows: false,
          likes: false,
          comments: false,
          dms: false,
        },
      },
      null,
      2
    );
    console.error(body);
    return 3;
  }

  try {
    const report = buildDryRunReport(input.text, {
      inputSource: args.input,
    });
    report.input.resolved_via = input.resolvedVia;
    report.input.default_pointer = args.input === DEFAULT_MASTER;
    const body = JSON.stringify(report, null, args.pretty ? 2 : 0);
    writeOutput(args.output, `${body}\n`);
    console.log(body);
    return report.ok ? 0 : 2;
  } finally {
    input.cleanup();
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
