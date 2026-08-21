import assert from "node:assert/strict";
import test from "node:test";
import {
  ALLOWED_TRANSITIONS,
  CORS_ORIGINS,
  FUNNEL_EVENTS,
  HUMAN_GATED_STATES,
  INTAKE_VERSION,
  OPS_CONTRACT_VERSION,
  WEEKLY_CAPACITY_MAX,
  assertTransition,
  computeSla,
  fingerprintIdempotencyParts,
  isAllowedCorsOrigin,
  isCapacityBacklogged,
  isHumanGated,
  nextActionForState,
} from "../../scripts/caesthetic/growth-score-ops-contract.mjs";

test("ops contract versions and capacity stay canonical", () => {
  assert.equal(OPS_CONTRACT_VERSION, "growth-score-ops/1.0.0");
  assert.equal(INTAKE_VERSION, "caesthetic-growth-score/2.0");
  assert.equal(WEEKLY_CAPACITY_MAX, 3);
  assert.equal(isCapacityBacklogged(2), false);
  assert.equal(isCapacityBacklogged(3), true);
});

test("allowlisted transitions reject illegal jumps", () => {
  assertTransition("created", "researching");
  assertTransition("approved", "delivered");
  assert.throws(() => assertTransition("created", "delivered"), /not permitted/);
  assert.deepEqual(ALLOWED_TRANSITIONS.closed, []);
  for (const state of HUMAN_GATED_STATES) assert.equal(isHumanGated(state), true);
});

test("SLA and next actions encode same-day triage plus backlog hold", () => {
  const sla = computeSla({ createdAt: "2026-08-21T12:00:00.000Z", backlogged: false });
  assert.equal(sla.next_action, "triage_same_day");
  assert.equal(sla.capacity_state, "accepted");
  assert.equal(sla.triage_due_at, "2026-08-21T20:00:00.000Z");
  assert.equal(nextActionForState("created", { qa: true }), "qa_archived");
  assert.equal(nextActionForState("created", { backlogged: true }), "capacity_hold_triage");
});

test("CORS allowlist is origin-restricted and idempotency fingerprint changes with clinic", () => {
  assert.ok(CORS_ORIGINS.includes("https://caesthetic.com"));
  assert.equal(isAllowedCorsOrigin("https://caesthetic.com"), true);
  assert.equal(isAllowedCorsOrigin("https://evil.example"), false);
  const a = fingerprintIdempotencyParts({
    email: "a@x.com",
    practiceName: "Clinic A",
    cityState: "Austin, TX",
    name: "Pat",
  });
  const b = fingerprintIdempotencyParts({
    email: "a@x.com",
    practiceName: "Clinic B",
    cityState: "Austin, TX",
    name: "Pat",
  });
  assert.notEqual(a, b);
});

test("funnel events stay non-personal and include Sprint", () => {
  assert.deepEqual([...FUNNEL_EVENTS], [
    "lead_created",
    "case_created",
    "triaged",
    "approved",
    "delivered",
    "sprint_inquiry",
  ]);
});
