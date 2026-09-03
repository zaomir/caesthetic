import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
  collectMirroredRels,
  parseSyncManifest,
} from "../../scripts/caesthetic/dec829-parity-guard.mjs";
import { FUNNEL_EVENTS } from "../../scripts/caesthetic/growth-score-ops-contract.mjs";
import {
  emitFunnelEvent,
  PII_FORBIDDEN_KEYS,
} from "../../scripts/caesthetic/growth-score-funnel-report.mjs";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SQL = readFileSync(
  resolve(REPO, "supabase/migrations/20260821192000_caesthetic_growth_score_funnel_events.sql"),
  "utf8",
);
const ANALYTICS_DOC = readFileSync(
  resolve(REPO, "docs/projects/caesthetic/operations/GROWTH_SCORE_FUNNEL_ANALYTICS.md"),
  "utf8",
);
const PARITY_GUARD = readFileSync(
  resolve(REPO, "scripts/caesthetic/dec829-parity-guard.mjs"),
  "utf8",
);
const SYNC_MANIFEST = readFileSync(
  resolve(REPO, "docs/projects/caesthetic/SYNC_MANIFEST.yml"),
  "utf8",
);
const REPORT = readFileSync(
  resolve(REPO, "scripts/caesthetic/growth-score-funnel-report.mjs"),
  "utf8",
);
const CONFIG = readFileSync(
  resolve(REPO, "site-caesthetic/assets/js/caesthetic-config.js"),
  "utf8",
);

test("FUNNEL_EVENTS match SQL CHECK on caesthetic_score_funnel_events", () => {
  assert.deepEqual([...FUNNEL_EVENTS], [
    "lead_created",
    "case_created",
    "triaged",
    "approved",
    "delivered",
    "sprint_inquiry",
  ]);
  assert.match(SQL, /CHECK \(event_name IN \(/);
  assert.match(REPORT, /FUNNEL_EVENTS/);
  for (const eventName of FUNNEL_EVENTS) {
    assert.match(SQL, new RegExp(`'${eventName}'`));
  }
  const checked = [
    ...SQL.matchAll(/'(lead_created|case_created|triaged|approved|delivered|sprint_inquiry)'/g),
  ].map((match) => match[1]);
  assert.deepEqual([...new Set(checked)], [...FUNNEL_EVENTS]);
});

test("emit function rejects email/name/phone/practice_name", async () => {
  assert.deepEqual([...PII_FORBIDDEN_KEYS], ["email", "name", "phone", "practice_name"]);
  assert.match(SQL, /funnel_event_pii_forbidden/);
  assert.match(SQL, /p \? 'email' OR p \? 'name' OR p \? 'phone' OR p \? 'practice_name'/);
  await assert.doesNotReject(() =>
    emitFunnelEvent({
      event_name: "lead_created",
      source_class: "organic_social",
      utm_source: "instagram",
    }),
  );
  for (const key of PII_FORBIDDEN_KEYS) {
    await assert.rejects(
      () => emitFunnelEvent({ event_name: "lead_created", [key]: "redacted" }),
      /funnel_event_pii_forbidden/,
    );
  }
});

test("analytics doc records approved GA4 and Advanced Consent Mode", () => {
  assert.match(ANALYTICS_DOC, /ga4MeasurementId/);
  assert.match(ANALYTICS_DOC, /metaPixelId/);
  assert.match(ANALYTICS_DOC, /G-PNQB0W9YB2/);
  assert.match(ANALYTICS_DOC, /denied` consent by default/i);
  assert.match(ANALYTICS_DOC, /Advanced Consent Mode/i);
  assert.match(ANALYTICS_DOC, /cookieless measurements/i);
  assert.match(ANALYTICS_DOC, /Never print PII|no PII|non-personal/i);
  assert.match(ANALYTICS_DOC, /sync-agents-bidirectional\.sh/);
  assert.match(ANALYTICS_DOC, /not a deploy source/);
});

test("parity guard script references SYNC_MANIFEST and grainee-v2 deploy authority", () => {
  assert.match(PARITY_GUARD, /SYNC_MANIFEST/);
  assert.match(PARITY_GUARD, /docs\/projects\/caesthetic\/SYNC_MANIFEST\.yml/);
  assert.match(PARITY_GUARD, /grainee-v2/);
  assert.match(PARITY_GUARD, /deploy authority/i);
  assert.match(PARITY_GUARD, /zaomir\/grainee-v2/);
  assert.match(PARITY_GUARD, /satellite_is_not_deploy_source/);
  assert.match(PARITY_GUARD, /not a deploy source/);
  assert.match(PARITY_GUARD, /CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS\.md/);
  assert.match(PARITY_GUARD, /CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT\.md/);
  assert.match(
    PARITY_GUARD,
    /sync-agents-bidirectional\.sh --apply --commit --push/,
  );
});

test("parity guard includes the production SOP and systemd extras from the current manifest", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "caesthetic-parity-manifest-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (rel, value = rel) => {
    const path = resolve(root, rel);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, value);
  };
  write("docs/ssot/CAESTHETIC.md");
  write("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
  write("deploy/systemd/caesthetic-repo-sync.service");
  write("deploy/systemd/caesthetic-repo-sync.timer");
  write("scripts/caesthetic/ignored.pyc");

  const rels = collectMirroredRels(root, parseSyncManifest(SYNC_MANIFEST));
  assert.ok(rels.has("docs/ssot/CAESTHETIC.md"));
  assert.ok(rels.has("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md"));
  assert.ok(rels.has("deploy/systemd/caesthetic-repo-sync.service"));
  assert.ok(rels.has("deploy/systemd/caesthetic-repo-sync.timer"));
  assert.ok(!rels.has("scripts/caesthetic/ignored.pyc"));
});

test("caesthetic-config.js has the approved GA4 ID and keeps Meta disabled", () => {
  assert.match(CONFIG, /ga4MeasurementId:\s*"G-PNQB0W9YB2"/);
  assert.match(CONFIG, /metaPixelId:\s*""/);
  assert.doesNotMatch(CONFIG, /metaPixelId:\s*"[^"]+/);
});
