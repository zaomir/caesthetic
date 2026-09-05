/** Connect4 evidence contract. A preview is not permission to publish new findings. */
import { createHash } from "node:crypto";
export const CONSISTENCY_CONTRACT = "caesthetic-consistency-matrix/1.0.0";
export const SURFACES = Object.freeze(["search", "website", "social", "reputation"]);
export const SOCIAL_PLATFORMS = Object.freeze(["Instagram", "Facebook", "TikTok", "YouTube"]);
export const MATCH_STATES = Object.freeze(["exact_match", "semantic_match", "contradiction", "not_found_in_sample", "insufficient_evidence"]);
export const CONTENT_TYPES = Object.freeze(["profile_text", "post_text", "video_description", "video_transcript", "user_comment", "practice_comment_reply", "review", "owner_review_reply", "service_page", "blog", "gbp_listing", "search_result", "booking_page", "external_reference"]);
export function stableJSON(value) {
  if (Array.isArray(value)) return "[" + value.map(stableJSON).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + stableJSON(value[k])).join(",") + "}";
  return JSON.stringify(value);
}
export const digest = value => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : stableJSON(value)).digest("hex");
export function reviewDigest(value) {
  const { review, ...payload } = value;
  return digest(payload);
}
export function assertReviewed(value, label) {
  const review = value?.review;
  if (review?.status !== "approved" || typeof review.by !== "string" || !review.by.trim() || !Number.isFinite(Date.parse(review.at)) || review.content_sha256 !== reviewDigest(value)) {
    throw new Error(`REVIEW_REQUIRED: ${label} has no current named-human approval`);
  }
}
export function safeURL(value) {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) return null;
    return u.href;
  } catch { return null; }
}
const ensure = (condition, message) => { if (!condition) throw new Error(`CONSISTENCY_INVALID: ${message}`); };
export function validateConsistency(matrix, registry, { clientRelease = false } = {}) {
  ensure(matrix?.contract === CONSISTENCY_CONTRACT, "contract");
  ensure(registry?.contract === "caesthetic-public-source-register/1.0.0", "source register contract");
  ensure(typeof matrix.case_id === "string" && matrix.case_id && matrix.case_id === registry?.case_id, "case identity");
  ensure(JSON.stringify(matrix.surfaces) === JSON.stringify(SURFACES), "exactly four ordered surfaces");
  ensure(Array.isArray(matrix.queries) && matrix.queries.length === 10, "exactly 10 query phrases");
  ensure(Array.isArray(registry.sources) && Array.isArray(registry.observations), "source and observation registries");
  const sources = new Map();
  for (const s of registry.sources) {
    ensure(typeof s.id === "string" && !sources.has(s.id), "duplicate source ID");
    ensure(safeURL(s.url), `unsafe source URL ${s.id}`);
    ensure(SURFACES.includes(s.surface), `source surface ${s.id}`);
    ensure(s.case_id === matrix.case_id, `source belongs to another case: ${s.id}`);
    sources.set(s.id, s);
  }
  ensure(SOCIAL_PLATFORMS.every(p => registry.coverage?.some(c => c.platform === p)), "all four social discovery records");
  const observations = new Map();
  for (const o of registry.observations) {
    ensure(typeof o.id === "string" && !observations.has(o.id), "duplicate observation ID");
    ensure(sources.has(o.source_id), `unknown source: ${o.id}`);
    ensure(CONTENT_TYPES.includes(o.content_type), `content type: ${o.id}`);
    ensure(["practice", "independent_user", "third_party"].includes(o.author_role), `authorship: ${o.id}`);
    ensure(typeof o.excerpt === "string" && o.excerpt.trim(), `excerpt: ${o.id}`);
    ensure(Number.isFinite(Date.parse(o.collected_at)), `collection timestamp: ${o.id}`);
    ensure(o.case_id === matrix.case_id, `observation belongs to another case: ${o.id}`);
    if (o.content_type === "video_transcript") {
      ensure(Number.isFinite(o.start_seconds) && o.start_seconds >= 0 && ["published", "author_captions", "automatic_captions", "speech_recognition"].includes(o.transcript_origin), `transcript provenance: ${o.id}`);
    }
    if (["practice_comment_reply", "owner_review_reply"].includes(o.content_type)) ensure(o.parent_url && safeURL(o.parent_url), `reply context: ${o.id}`);
    observations.set(o.id, o);
  }
  const ids = new Set(), phrases = new Set();
  matrix.queries.forEach((q, i) => {
    ensure(q.id === `K${String(i + 1).padStart(2, "0")}` && !ids.has(q.id), "stable ordered K01–K10 identifiers");
    ids.add(q.id);
    ensure(typeof q.phrase === "string" && q.phrase.trim().length > 3 && !phrases.has(q.phrase.toLowerCase()), `unique phrase ${q.id}`);
    phrases.add(q.phrase.toLowerCase());
    ensure(q.language && q.geography && q.service && q.intent && q.basis, `query provenance ${q.id}`);
    ensure(["candidate_query", "verified_query"].includes(q.status), `query status ${q.id}`);
    if (q.status === "candidate_query") ensure(q.frequency === null, `candidate cannot invent frequency ${q.id}`);
    if (q.status === "verified_query") ensure(q.frequency && safeURL(q.frequency.source) && q.frequency.period && q.frequency.geography && q.frequency.method && Number.isFinite(q.frequency.monthly_searches) && q.frequency.monthly_searches >= 0, `frequency provenance ${q.id}`);
    ensure(Array.isArray(q.source_ids) && q.source_ids.length && q.source_ids.every(id => sources.has(id)), `query basis source ${q.id}`);
    ensure(q.cells && JSON.stringify(Object.keys(q.cells).sort()) === JSON.stringify([...SURFACES].sort()), `four cells ${q.id}`);
    for (const surface of SURFACES) {
      const cell = q.cells[surface];
      ensure(Array.isArray(cell.observations), `observation array ${q.id}/${surface}`);
      ensure(MATCH_STATES.includes(cell.status), `cell status ${q.id}/${surface}`);
      if (!cell.observations.length) ensure(cell.status === "insufficient_evidence", `empty cell cannot assert match or absence ${q.id}/${surface}`);
      if (cell.status !== "insufficient_evidence") ensure(cell.observations.some(o => o.status === cell.status), `aggregate has no matching observation ${q.id}/${surface}`);
      for (const match of cell.observations) {
        ensure(MATCH_STATES.includes(match.status), `observation state ${q.id}/${surface}`);
        const o = observations.get(match.observation_id);
        ensure(o && sources.get(o.source_id).surface === surface, `observation surface/ref ${q.id}/${surface}`);
        if (match.status === "exact_match") {
          const norm = x => x.normalize("NFKC").toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
          ensure(norm(o.excerpt).includes(norm(q.phrase)), `exact match cannot be translation or paraphrase ${q.id}`);
        }
        if (match.status === "not_found_in_sample") ensure(match.sample && Number.isInteger(match.sample.count) && match.sample.count > 0 && Number.isFinite(Date.parse(match.sample.start)) && Number.isFinite(Date.parse(match.sample.end)) && Date.parse(match.sample.start) <= Date.parse(match.sample.end) && match.sample.source_ids?.length && match.sample.source_ids.every(id => sources.has(id) && sources.get(id).surface === surface), `absence requires bounded sample ${q.id}`);
        if (match.status === "semantic_match" || match.status === "contradiction") ensure(typeof match.rationale === "string" && match.rationale.trim(), `interpretation rationale ${q.id}`);
        if (clientRelease) { assertReviewed(o, `observation ${o.id}`); assertReviewed(match, `match ${q.id}/${surface}`); }
      }
    }
  });
  if (clientRelease) {
    assertReviewed(registry, "source register");
    assertReviewed(matrix, "ten-query matrix");
    ensure(matrix.queries.some(q => SURFACES.some(s => q.cells[s].status !== "insufficient_evidence")), "client matrix cannot be entirely unassessed");
    ensure(matrix.query_set_review?.status === "approved" && matrix.query_set_review.by && Number.isFinite(Date.parse(matrix.query_set_review.at)) && matrix.query_set_review.content_sha256 === digest(matrix.queries.map(({ cells, ...q }) => q)), "query set approval");
  }
  return { sources, observations, queryCount: ids.size };
}
