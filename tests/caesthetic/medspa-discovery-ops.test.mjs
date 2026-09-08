import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(repo, "scripts/caesthetic/medspa-discovery/run.py");

function run(op, env = {}) {
  const r = spawnSync("python3", [cli, op], { encoding: "utf8", cwd: repo, env: { ...process.env, ...env } });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  return JSON.parse(r.stdout);
}

function isolatedStore() {
  const store = mkdtempSync(path.join(tmpdir(), "cae-medspa-"));
  for (const sub of ["inbox", "ingested", "queues", "enrichment", "canary", "audit", "locks"]) {
    mkdirSync(path.join(store, sub), { recursive: true });
  }
  writeFileSync(path.join(store, "registry.json"), JSON.stringify({ locations: [] }) + "\n");
  writeFileSync(
    path.join(store, "inbox", "sample.csv"),
    "place_id,name,email,site,instagram,facebook,linkedin,phone,city,state\n" +
      "pid-1,Palm Beach Med Spa,hidden@example.com,https://palm.example,https://instagram.com/palm,https://facebook.com/palm,https://linkedin.com/company/palm,+15551212,Miami,FL\n",
  );
  return store;
}

function bridge(request, store) {
  const dir = mkdtempSync(path.join(tmpdir(), "cae-medspa-req-"));
  const input = path.join(dir, "request.json");
  const output = path.join(dir, "result.json");
  writeFileSync(input, JSON.stringify(request, null, 2));
  const r = spawnSync("python3", [cli, "--request-file", input, "--output", output], {
    encoding: "utf8",
    cwd: repo,
    env: {
      ...process.env,
      CAESTHETIC_MEDSPA_STORE: store,
      CAESTHETIC_MEDSPA_REPO: repo,
      INSTANTLY_API_KEY: "",
      OUTSCRAPER_API_KEY: "",
    },
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  return JSON.parse(readFileSync(output, "utf8"));
}

const dry = run("dry_run");
assert.equal(dry.ok, true);
assert.equal(dry.send, false);
assert.equal(dry.reimport, false);
assert.equal(dry.expected.canary_ready, 6);

const bad = run("activate");
assert.equal(bad.ok, false);
assert.match(String(bad.error), /unsupported_operation/);

const publicIndex = JSON.parse(
  readFileSync(path.join(repo, "docs/ops/caesthetic-new-medspa-discovery/public-index.json"), "utf8"),
);
assert.equal(publicIndex.no_raw_emails, true);
assert.doesNotMatch(JSON.stringify(publicIndex), /@/);
assert.equal(publicIndex.counts.canary, 6);

const quote = run("quote_discovery");
assert.match(String(quote.paid_ops), /blocked/);
assert.equal(quote.quote.would_checkout, false);

const adapter = spawnSync(
  "python3",
  [
    "-c",
    "import json,sys; sys.path.insert(0,'scripts/caesthetic/medspa-discovery'); from outscraper_adapter import parse_csv_text; print(json.dumps(parse_csv_text('place_id,name,email\\nabc,Test Spa,hidden@example.com\\nabc,Test Spa,hidden@example.com\\n', source_file='t.csv')))",
  ],
  { encoding: "utf8", cwd: repo },
);
assert.equal(adapter.status, 0, adapter.stderr || adapter.stdout);
const parsed = JSON.parse(adapter.stdout);
assert.equal(parsed.unique_place_ids, 1);
assert.doesNotMatch(JSON.stringify(parsed), /hidden@example.com/);

const first = spawnSync("python3", [cli, "dry_run"], { encoding: "utf8", cwd: repo });
const second = spawnSync("python3", [cli, "dry_run"], { encoding: "utf8", cwd: repo });
assert.equal(first.status, 0, first.stderr || first.stdout);
assert.equal(second.status, 0, second.stderr || second.stdout);
assert.equal(JSON.parse(first.stdout).ok, true);
assert.equal(JSON.parse(second.stdout).ok, true);

const healthAlias = run("healthcheck");
assert.equal(healthAlias.ok, true);
assert.equal(healthAlias.operation, "health");
assert.equal(healthAlias.alias, "healthcheck");

const store = isolatedStore();
const ingestAlias = bridge(
  { request_id: "t-ingest-alias", type: "caesthetic_medspa", operation: "ingest_csv", params: {} },
  store,
);
assert.equal(ingestAlias.operation, "ingest_inbox");
assert.equal(ingestAlias.status, "success");

const inlineBlocked = bridge(
  {
    request_id: "t-ingest-inline",
    type: "caesthetic_medspa",
    operation: "stage_inbox",
    params: {
      source: "github_release",
      release_tag: "medspa-inbox-unit",
      files: [
        {
          filename: "medical_spa_new_york_US_2026_Sep_08-7.csv",
          sha256: "0f6f68bd86d814354679d45b0737715cea5c967d9f784a4c0d9bfe6235979e71",
          content_base64: "bm90LWEtcmVhbC1jc3Y=",
        },
      ],
    },
  },
  store,
);
assert.equal(inlineBlocked.status, "error");
assert.match(String(inlineBlocked.errors[0]?.message || ""), /inline_payload_forbidden/);
assert.doesNotMatch(JSON.stringify(inlineBlocked), /not-a-real-csv|bm90LWEtcmVhbC1jc3Y=/);

const transferPy = spawnSync(
  "python3",
  [
    "-c",
    [
      "import hashlib, json, os, sys, tempfile",
      "from pathlib import Path",
      "sys.path.insert(0, 'scripts/caesthetic/medspa-discovery')",
      "os.environ['CAESTHETIC_MEDSPA_TEST_TRANSFER'] = '1'",
      "from inbox_transfer import inline_payload_keys, stage_inbox",
      "assert inline_payload_keys({'files': [{'content_base64': 'x'}]}) == ['files.content_base64']",
      "body = b'place_id,name\\nChIJtransfer1,Transfer Spa\\n'",
      "digest = hashlib.sha256(body).hexdigest()",
      "name = 'medical_spa_new_york_US_2026_Sep_08-7.csv'",
      "inbox = Path(tempfile.mkdtemp()) / 'inbox'",
      "result = stage_inbox({'source': 'test_payloads', 'files': [{'filename': name, 'sha256': digest, 'payload_bytes': body}]}, inbox, allowed_hashes={name: digest})",
      "assert result['ok'] is True, result",
      "assert (inbox / name).read_bytes() == body",
      "print(json.dumps({'ok': True, 'sha256': digest, 'bytes': len(body)}))",
    ].join("; "),
  ],
  { encoding: "utf8", cwd: repo },
);
assert.equal(transferPy.status, 0, transferPy.stderr || transferPy.stdout);
assert.equal(JSON.parse(transferPy.stdout).ok, true);

const badTag = bridge(
  {
    request_id: "t-ingest-bad-tag",
    type: "caesthetic_medspa",
    operation: "ingest_inbox",
    params: { source: "github_release", release_tag: "../evil" },
  },
  isolatedStore(),
);
assert.equal(badTag.status, "error");
assert.match(String(badTag.errors[0]?.message || ""), /release_tag_rejected|inbox_transfer_failed/);

const forbidden = bridge(
  {
    request_id: "t-forbidden",
    type: "caesthetic_medspa",
    operation: "status",
    command: "rm -rf /",
    params: { shell: "bash", exec: "true" },
  },
  store,
);
assert.equal(forbidden.ok, false);
assert.match(JSON.stringify(forbidden.errors), /forbidden_keys/);

const discover = bridge(
  {
    request_id: "t-discover",
    type: "caesthetic_medspa",
    operation: "discover_channels",
    params: { batch_id: "unit-batch", markets: ["FL"], limit: 10 },
  },
  store,
);
assert.equal(discover.status, "success");
assert.ok(discover.data.output_path.startsWith(store));
assert.equal(typeof discover.data.counts.email, "number");
assert.doesNotMatch(JSON.stringify(discover), /hidden@example.com/);
assert.equal(discover.worker.host.length > 0, true);

const prepare = bridge(
  {
    request_id: "t-prepare",
    type: "caesthetic_medspa",
    operation: "prepare_outreach",
    params: {
      batch_id: "unit-batch",
      channels: ["email", "linkedin", "instagram", "facebook"],
      message_profile: "growth_score_v6",
      dry_run: true,
    },
  },
  store,
);
assert.ok(["success", "dry_run_ok"].includes(prepare.status));
assert.ok(prepare.data.queue_id);
assert.doesNotMatch(JSON.stringify(prepare), /hidden@example.com/);
assert.match(JSON.stringify(prepare.data.sample_messages || []), /Free Growth Score/);
assert.doesNotMatch(JSON.stringify(prepare.data.sample_messages || []), /revenue|ROI|patients|ranking/i);

const canaryOver = bridge(
  {
    request_id: "t-canary-over",
    type: "caesthetic_medspa",
    operation: "send_canary",
    params: { queue_id: prepare.data.queue_id, channels: ["email"], limit: 6, dry_run: true },
  },
  store,
);
assert.equal(canaryOver.status, "blocked");
assert.match(String(canaryOver.errors[0]?.message || ""), /hard_max/);

const canaryDry = bridge(
  {
    request_id: "t-canary-dry",
    type: "caesthetic_medspa",
    operation: "send_canary",
    params: { queue_id: prepare.data.queue_id, channels: ["email"], limit: 3, dry_run: true },
  },
  store,
);
assert.equal(canaryDry.status, "dry_run_ok");
assert.equal(canaryDry.data.sent_count, 0);
assert.equal(canaryDry.data.send_attempted, false);

const batchBlocked = bridge(
  {
    request_id: "t-batch-blocked",
    type: "caesthetic_medspa",
    operation: "send_batch",
    params: { queue_id: prepare.data.queue_id, channels: ["email"], limit: 10, dry_run: true },
  },
  store,
);
assert.equal(batchBlocked.status, "blocked");
assert.match(String(batchBlocked.errors[0]?.message || ""), /canary_evidence/);

const fixtureStore = isolatedStore();
writeFileSync(
  path.join(fixtureStore, "registry.json"),
  JSON.stringify({
    locations: [
      {
        lead_id: "ChIJtest",
        name: "Recovery Spa",
        identity: { place_id: "ChIJtest" },
        business: { name: "Recovery Spa" },
        source: { source_file: "recovery-dummy.csv", source_observations: [{ email_present: true }] },
      },
    ],
  }) + "\n",
);
const fixturePrepare = bridge(
  {
    request_id: "t-fixture-skip",
    type: "caesthetic_medspa",
    operation: "prepare_outreach",
    params: {
      batch_id: "fixture-guard",
      channels: ["email", "linkedin", "instagram", "facebook"],
      dry_run: true,
    },
  },
  fixtureStore,
);
assert.doesNotMatch(JSON.stringify(fixturePrepare), /Recovery Spa/);
assert.doesNotMatch(JSON.stringify(fixturePrepare), /ChIJtest/);
writeFileSync(
  path.join(fixtureStore, "queues", "q-old-fixture.json"),
  JSON.stringify({
    queue_id: "q-old-fixture",
    items: [{ lead_id: "ChIJtest", name: "Recovery Spa", channels: ["email"], email: "hidden@example.com" }],
  }) + "\n",
);
const fixtureSend = bridge(
  {
    request_id: "t-fixture-canary",
    type: "caesthetic_medspa",
    operation: "send_canary",
    params: { queue_id: "q-old-fixture", channels: ["email"], limit: 3, dry_run: true },
  },
  fixtureStore,
);
assert.equal(fixtureSend.status, "dry_run_ok");
assert.equal(fixtureSend.data.sent_count, 0);
assert.ok(fixtureSend.data.skipped_count >= 1);
assert.doesNotMatch(JSON.stringify(fixtureSend), /hidden@example.com/);
