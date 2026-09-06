import { check500USCopy } from "./check500-copy.mjs";
import { SURFACES, validateConsistency, validateResearchPublication, assertReviewed, digest, safeURL } from "./consistency-contract.mjs";
import { validateChoiceQuestions } from "./choice-questions-contract.mjs";
export const OWNER_V3 = "owner-decision-report/3.1.0";
export const SPOKEN_CASE = "spoken-medspa-snellville-2026";
export const V3_SECTION_IDS = Object.freeze(["gap-map", "focus-gaps", "sprint-fit", "repair-paths", "do-not-fund", "gap-inventory", "evidence-and-competitors", "scores-and-methodology", "next-step"]);
export function ownerV3Model(report, score) {
  const ctx = report?.presentation?.v3;
  if (report?.audit?.project_id !== SPOKEN_CASE || report.reportState !== "approved_report" || !ctx || ctx.release.layout_contract !== OWNER_V3) throw new Error("V3_INVALID: approved Spoken case and versioned inputs required");
  const locale = report.reportContext.report_locale === "ru" ? "ru" : "en-US";
  if (!["ru", "en", "en-US"].includes(report.reportContext.report_locale) || ctx.copy.locale !== locale) throw new Error("V3_INVALID: locale mismatch");
  if (!["review_preview", "client_release"].includes(ctx.release.stage)) throw new Error("V3_INVALID: unknown release stage");
  const preview = ctx.release.stage === "review_preview";
  if (digest(check500USCopy()) !== ctx.release.check500_us_copy_digest) throw new Error("V3_INVALID: Check500 copy changed after input freeze");
  const registry = validateConsistency(ctx.matrix, ctx.registry, { clientRelease: !preview });
  const research = validateResearchPublication(ctx.release, ctx.matrix, ctx.registry);
  if (!preview) { assertReviewed(ctx.release.research_alignment, "Research Alignment"); assertReviewed(ctx.release, "client release"); }
  const selection = report.humanDiagnosis.focus_selection;
  const selectedIds = [selection.primary_gap_id, ...selection.supporting_gap_ids];
  if (selectedIds.length !== 3 || new Set(selectedIds).size !== 3) throw new Error("V3_INVALID: exactly one primary and two supporting priorities");
  const inventory = report.humanDiagnosis.gap_inventory;
  if (!Array.isArray(inventory) || inventory.some(g => !/^[A-Za-z0-9_-]+$/.test(g.id)) || new Set(inventory.map(g => g.id)).size !== inventory.length) throw new Error("V3_INVALID: unsafe or duplicate gap identifier");
  const metrics = new Map([...report.surfaces.flatMap(s => s.metrics.map(m => [`${s.id}.${m.metric_id}`, m])), ...report.crossSurface.metrics.map(m => [`cross.${m.metric_id}`, m])]);
  const approvedMetrics = [...metrics].filter(([, m]) => m.reviewer_status === "approved" && m.finding && m.source && m.collected_at);
  selectedIds.map((id, i) => {
    const item = inventory.find(g => g.id === id);
    if (!item) throw new Error(`V3_INVALID: missing priority ${id}`);
    return { ...item, display_title: ctx.copy.priority_titles[i], refs: item.evidence_refs.filter(id => metrics.has(id)), role: i ? "supporting" : "primary" };
  });
  for (const g of inventory) for (const ref of g.evidence_refs || []) if (!metrics.has(ref)) throw new Error(`V3_INVALID: dangling evidence reference ${ref}`);
  for (const role of ["system", "journey", "stop", "engagement"]) for (const format of ["desktop", "mobile"]) {
    const a = ctx.release.assets?.[role]?.[format];
    if (!a || !/^\/assets\/connect4\/(owner|engagement)-20260905\/[^/]+\.png$/.test(a.src) || !/^[a-f0-9]{64}$/.test(a.sha256) || !Number.isInteger(a.width) || !Number.isInteger(a.height)) throw new Error(`V3_INVALID: approved asset ${role}/${format}`);
  }
  if (ctx.copy.section_titles?.length !== 9 || ctx.copy.surface_names?.length !== 4) throw new Error("V3_INVALID: copy structure");
  // Drafts stay masked unless the scoped, frozen source-observation package validates.
  const queries = ctx.matrix.queries.map(q => ({ ...q, cells: Object.fromEntries(SURFACES.map(surface => [surface, preview && !research ? { status: "insufficient_evidence", observations: [] } : q.cells[surface]])) }));
  const choices = (research || !preview) ? validateChoiceQuestions(ctx.choices, { release: ctx.release, registry, metrics, inventory }) : [];
  const narrative = choices.length ? ctx.choices : null;
  // Frozen decisions remain source history. Only a newly reviewed value-gated
  // selection can become a personalized offer in the revised presentation.
  const selected = narrative?.commercial_selection.status === 'approved' ? narrative.commercial_selection.priority_ids.map((id, i) => { const g = inventory.find(g => g.id === id); return { ...g, display_title: g.title, refs: g.evidence_refs, role: i ? 'supporting' : 'primary' }; }) : [];
  return { narrative, addenda: narrative?.repair_addenda || [], choices, locale, preview, research, coverage: ctx.registry.coverage, copy: ctx.copy, ownerCopy: { ...report.presentation.owner_copy, check500: locale === "en-US" ? check500USCopy() : report.presentation.owner_copy.check500 }, release: ctx.release, queries, sources: registry.sources, observations: registry.observations, selected, selectedIds: selected.map(g => g.id), inventory, metrics, approvedMetrics, score, report, sourceVersion: report.verifiedFactSetVersion, inputDigest: digest(ctx.release.inputs) };
}
export function approvedAction(action) {
  if (action?.type === "request" && ["sprint", "check", "question"].includes(action.intent)) return action;
  if (action?.type === "navigate" && (action.href?.startsWith("#") || safeURL(action.href))) return action;
  // A generic payment URL is not a signed, scoped order. No payment action is invented.
  throw new Error("V3_ACTION_INVALID: unsupported action or missing signed order");
}
