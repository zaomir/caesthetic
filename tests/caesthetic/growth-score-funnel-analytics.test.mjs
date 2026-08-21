import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
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

test("analytics doc says IDs stay empty / consent", () => {
  assert.match(ANALYTICS_DOC, /ga4MeasurementId/);
  assert.match(ANALYTICS_DOC, /metaPixelId/);
  assert.match(ANALYTICS_DOC, /stay empty/i);
  assert.match(ANALYTICS_DOC, /consent mode/i);
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

test("caesthetic-config.js still has empty ga4MeasurementId and metaPixelId", () => {
  assert.match(CONFIG, /ga4MeasurementId:\s*""/);
  assert.match(CONFIG, /metaPixelId:\s*""/);
  assert.doesNotMatch(CONFIG, /ga4MeasurementId:\s*"[^"]+/);
  assert.doesNotMatch(CONFIG, /metaPixelId:\s*"[^"]+/);
});
