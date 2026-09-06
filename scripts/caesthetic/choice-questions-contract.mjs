/** Presentation references, not a second diagnosis or evidence store. */
import { assertReviewed, digest } from './consistency-contract.mjs';
export const CHOICE_IDS = Object.freeze(['offer', 'practitioner', 'reviews', 'competitors']);
const ensure = (value, message) => { if (!value) throw new Error(`CHOICE_INVALID: ${message}`); };
const paired = value => value && ['ru', 'en-US'].every(l => typeof value[l] === 'string' && value[l].trim());
export function validateChoiceQuestions(packet, { release, registry, metrics, inventory }) {
  ensure(packet?.contract === 'caesthetic-choice-synthesis/1.0.0' && packet.case_id === release.case_id, 'contract/case');
  ensure(release.choice_questions_digest === digest(packet), 'answers changed after freeze');
  ensure(JSON.stringify(packet.questions?.map(q => q.id)) === JSON.stringify(CHOICE_IDS), 'four ordered questions');
  const addenda = new Map();
  for (const a of packet.repair_addenda || []) {
    ensure(/^[a-z-]+$/.test(a.id) && !addenda.has(a.id) && inventory.some(g => g.id === a.repair_ref) && paired(a.change) && paired(a.verify), 'repair addendum');
    if (release.stage === 'client_release') assertReviewed(a, `repair addendum ${a.id}`);
    addenda.set(a.id, a);
  }
  const conclusion = packet.connect4_conclusion;
  ensure(conclusion?.id === 'connect4', 'separate Connect4 conclusion');
  for (const q of [...packet.questions, conclusion, ...(packet.team_fixes || [])]) {
    for (const key of ['title', 'answer', 'observed', 'why', 'limitations']) ensure(paired(q[key]), `${q.id}/${key} paired text`);
    ensure(Array.isArray(q.evidence_refs) && q.evidence_refs.length && new Set(q.evidence_refs).size === q.evidence_refs.length, `${q.id} evidence`);
    for (const ref of q.evidence_refs) {
      const colon = ref.indexOf(':'), kind = ref.slice(0, colon), id = ref.slice(colon + 1);
      if (kind === 'observation') {
        ensure(registry.observations.has(id), `${q.id} dangling observation`);
        if (release.stage === 'client_release') assertReviewed(registry.observations.get(id), `question evidence ${id}`);
      } else {
        const metric = metrics.get(id);
        ensure(kind === 'metric' && metric?.reviewer_status === 'approved' && metric.finding && metric.source && metric.collected_at, `${q.id} unapproved or missing metric`);
      }
    }
    ensure(Boolean(q.repair_ref) !== Boolean(q.preserve), `${q.id} exactly one repair or preserve action`);
    if (q.repair_ref) ensure(inventory.some(g => g.id === q.repair_ref && g.repair_plan?.outcome && g.repair_plan.done_when?.length), `${q.id} dangling repair`);
    if (q.repair_addendum_ref) ensure(q.repair_ref && addenda.has(q.repair_addendum_ref) && addenda.get(q.repair_addendum_ref).repair_ref === q.repair_ref, `${q.id} dangling repair addendum`);
    if (q.preserve) ensure(paired(q.preserve.change) && paired(q.preserve.verify), `${q.id} preservation check`);
    ensure(Array.isArray(q.catalog_modules) && q.catalog_modules.length && q.catalog_modules.every(id => /^A(?:0[1-9]|10)$/.test(id)), `${q.id} supported Month-1 catalog modules; out-of-catalog publication rejected`);
    if (q.id === 'reviews') {
      const r = q.recurrence;
      ensure(r && Array.isArray(r.observation_ids) && r.observation_ids.length >= 2 && r.retained_reviews === r.observation_ids.length && Number.isInteger(r.visible_cards) && r.visible_cards >= r.retained_reviews && r.window, 'bounded review sample');
      const authors = new Set(), sources = new Set();
      for (const id of r.observation_ids) {
        const ob = registry.observations.get(id);
        ensure(q.evidence_refs.includes(`observation:${id}`) && ob?.content_type === 'review' && ob.author_role === 'independent_user' && ob.author_key, 'recurrence requires independent reviews');
        authors.add(ob.author_key); sources.add(registry.sources.get(ob.source_id)?.url);
      }
      ensure(authors.size === r.observation_ids.length && sources.size === r.observation_ids.length, 'duplicate review identity/source');
    } else ensure(!q.recurrence, 'recurrence belongs to reviews');
    if (release.stage === 'client_release') assertReviewed(q, `choice answer ${q.id}`);
  }
  ensure(packet.team_fixes?.every(q => q.materiality === 'minor_diy' && !q.repair_ref), 'team fixes cannot inflate paid scope');
  const selection = packet.commercial_selection;
  ensure(selection && ['not_supported', 'approved'].includes(selection.status), 'commercial selection status');
  if (selection.status === 'not_supported') {
    ensure(selection.priority_ids?.length === 0 && paired(selection.finding) && paired(selection.next_research), 'unsupported selection must retain actual result and research direction');
    ensure(release.stage !== 'client_release', 'client release needs a reviewed material priority set');
  } else {
    ensure(paired(selection.finding) && paired(selection.next_research), 'reviewed selection needs a bounded finding and next direction');
    ensure(selection.priority_ids?.length === 3 && new Set(selection.priority_ids).size === 3, 'one primary and two supporting priorities');
    for (const id of selection.priority_ids) {
      const g = inventory.find(g => g.id === id);
      ensure(g && paired(g.patient_choice_materiality) && paired(g.delivery_value) && g.catalog_modules?.length && g.catalog_modules.every(x => /^A(?:0[1-9]|10)$/.test(x)), 'priority needs separate patient and delivery value within catalog');
      ensure(g.diagnosis_state === 'verified_gap' && g.evidence_refs?.length && g.evidence_refs.every(ref => { const metric = metrics.get(ref); return metric?.reviewer_status === 'approved' && metric.finding && metric.source && metric.collected_at; }), 'priority requires retained approved evidence');
      ensure(['close_in_30_days', 'start_in_30_days'].includes(g.sprint_fit?.mode) && g.repair_plan?.outcome && g.repair_plan.done_when?.length && g.repair_plan.owner_role && Array.isArray(g.repair_plan.dependencies), 'priority requires feasible plan, owner, dependencies and acceptance');
      assertReviewed(g, `commercial priority ${id}`);
    }
    ensure(selection.priority_ids.filter(id => inventory.find(g => g.id === id).sprint_fit.mode === 'close_in_30_days').length >= 2, 'at least two priorities close in Month 1');
    assertReviewed(selection, 'commercial selection');
  }
  if (release.stage === 'client_release') assertReviewed(packet, 'four-question synthesis packet');
  return packet.questions;
}
