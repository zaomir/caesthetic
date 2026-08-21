/**
 * Executable CAESTHETIC Growth Score ops contract (DEC-848).
 * Human SSOT: docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md
 */
export const OPS_CONTRACT_VERSION = "growth-score-ops/1.0.0";
export const INTAKE_VERSION = "caesthetic-growth-score/2.0";
export const WORKFLOW_VERSION = "growth-score-workflow/3.0.0";
export const DEFAULT_OWNER_NAME = "Valerie Petra";
export const WEEKLY_CAPACITY_MAX = 3;
export const TRIAGE_SLA_HOURS = 8;
export const DELIVERY_SLA_DAYS = 5;
export const BACKLOG_EXTRA_DAYS = 7;
export const RATE_LIMIT_PER_IP_HOUR = 8;
export const RATE_LIMIT_PER_EMAIL_DAY = 3;
export const OUTBOX_MAX_ATTEMPTS = 8;

export const CASE_STATES = Object.freeze([
  "created",
  "researching",
  "draft_review",
  "fact_set_frozen",
  "report_review",
  "approved",
  "delivered",
  "closed",
]);

export const ALLOWED_TRANSITIONS = Object.freeze({
  created: Object.freeze(["researching", "closed"]),
  researching: Object.freeze(["draft_review", "closed"]),
  draft_review: Object.freeze(["fact_set_frozen", "researching", "closed"]),
  fact_set_frozen: Object.freeze(["report_review", "draft_review", "closed"]),
  report_review: Object.freeze(["approved", "fact_set_frozen", "closed"]),
  approved: Object.freeze(["delivered", "closed"]),
  delivered: Object.freeze(["closed"]),
  closed: Object.freeze([]),
});

export const HUMAN_GATED_STATES = Object.freeze([
  "fact_set_frozen",
  "approved",
  "delivered",
]);

export const NEXT_ACTIONS = Object.freeze({
  created: "triage_same_day",
  researching: "collect_public_evidence",
  draft_review: "human_verify_facts",
  fact_set_frozen: "review_constraint_top3",
  report_review: "approve_schema_v4",
  approved: "record_walkthrough_and_deliver",
  delivered: "measure_sprint_path",
  closed: "none",
  qa_archived: "qa_archived",
  backlogged: "capacity_hold_triage",
});

export const OUTBOX_JOB_TYPES = Object.freeze([
  "notify_internal_email",
  "notify_admin_telegram",
  "notify_customer_ack",
  "queue_manual_board",
  "emit_funnel_event",
]);

export const FUNNEL_EVENTS = Object.freeze([
  "lead_created",
  "case_created",
  "triaged",
  "approved",
  "delivered",
  "sprint_inquiry",
]);

export const CORS_ORIGINS = Object.freeze([
  "https://caesthetic.com",
  "https://www.caesthetic.com",
  "http://127.0.0.1",
  "http://localhost",
]);

export function isAllowedCorsOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (CORS_ORIGINS.includes(`${url.protocol}//${url.host}`)) return true;
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
      return url.protocol === "http:" || url.protocol === "https:";
    }
    return false;
  } catch {
    return false;
  }
}

export function assertTransition(fromState, toState) {
  const allowed = ALLOWED_TRANSITIONS[fromState] || [];
  if (!allowed.includes(toState)) {
    throw new TypeError(`transition ${fromState} → ${toState} is not permitted`);
  }
  return true;
}

export function isHumanGated(toState) {
  return HUMAN_GATED_STATES.includes(toState);
}

export function isCapacityBacklogged(openCreatedLast7Days) {
  return Number(openCreatedLast7Days) >= WEEKLY_CAPACITY_MAX;
}

export function computeSla({ createdAt, backlogged = false, now = new Date() } = {}) {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt || now);
  const triage = new Date(created.getTime() + TRIAGE_SLA_HOURS * 3600 * 1000);
  const delivery = new Date(created.getTime() + DELIVERY_SLA_DAYS * 86400 * 1000);
  if (backlogged) delivery.setUTCDate(delivery.getUTCDate() + BACKLOG_EXTRA_DAYS);
  return {
    triage_due_at: triage.toISOString(),
    delivery_due_at: delivery.toISOString(),
    capacity_state: backlogged ? "backlogged" : "accepted",
    next_action: backlogged ? NEXT_ACTIONS.backlogged : NEXT_ACTIONS.created,
  };
}

export function isTriageOverdue(caseRow, now = new Date()) {
  if (!caseRow?.triage_due_at) return false;
  if (!["created"].includes(caseRow.state)) return false;
  return new Date(caseRow.triage_due_at) < now;
}

export function isDeliveryOverdue(caseRow, now = new Date()) {
  if (!caseRow?.delivery_due_at) return false;
  if (["delivered", "closed"].includes(caseRow.state)) return false;
  return new Date(caseRow.delivery_due_at) < now;
}

export function nextActionForState(state, { qa = false, backlogged = false } = {}) {
  if (qa) return NEXT_ACTIONS.qa_archived;
  if (backlogged && state === "created") return NEXT_ACTIONS.backlogged;
  return NEXT_ACTIONS[state] || NEXT_ACTIONS.created;
}

export function fingerprintIdempotencyParts({
  email = "",
  practiceName = "",
  cityState = "",
  name = "",
} = {}) {
  return [
    "growth-score",
    String(email).trim().toLowerCase(),
    String(practiceName).trim().toLowerCase(),
    String(cityState).trim().toLowerCase(),
    String(name).trim().toLowerCase(),
  ].join("|");
}
