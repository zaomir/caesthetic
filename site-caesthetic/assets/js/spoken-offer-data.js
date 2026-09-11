/** Versioned, case-specific commercial terms. Price and eligibility stay server-owned. */
export const SPOKEN_OFFER = Object.freeze({
  id: 'spoken-four-surface-sprint-v1',
  contract: 'spoken-four-surface-sprint/1.0.0',
  sow_id: 'CAESTHETIC-SPOKEN-FOUR-SURFACE-2026-09-07-V1',
  practice: 'Private Aesthetic Practice',
  product_code: 'growth_sprint',
  amount_minor: null,
  currency: 'USD',
  title: 'One clear first visit. Four connected surfaces.',
  scope: 'A 30-day implementation project for Private Aesthetic Practice: align the agreed first-visit information and enquiry routes across Google, website and blog, social profiles and posts, and reputation pages and practice replies.',
  deliverables: [
    'A shared first-visit brief; an updated neurotoxin page, practitioner introduction and one patient-question article.',
    'Agreed enquiry routes from Google, the website, Instagram/Facebook and the link page, plus one verified reputation listing; each route checked on mobile and desktop.',
    'Two core posts adapted for Instagram and Facebook, one Google post, six question-response prompts and up to six relevant practice replies to real reviews or comments.'
  ],
  included_check: 'Lead-to-Revenue Check is included at no additional charge: enquiry, response, booking, visit, consultation and payment, using agreed authorized non-clinical access. You receive findings and a next-step plan; additional internal implementation is scoped separately.',
  acceptance: 'Before implementation, confirm the exact materials, editable platforms, clinical copy, required access and Sprint Start Date. At Day 30, receive published changes, recorded route checks, team instructions and the Check findings. The 30-day clock starts only after these prerequisites are confirmed.',
  credit: 'A prior Lead-to-Revenue Check may inform the Sprint scope. Any commercial treatment is stated in the written Sprint Order; no credit or balance is assumed from this page.',
  continuation: 'Optional monthly marketing support after this Sprint is scoped separately. It is not an automatic renewal or the separate fixed-scope Sprint Extension.',
  boundary: 'Materials and settings remain with the practice. Search rankings, patient numbers, revenue and permanent organic visibility are not guaranteed; patient reviews remain independently authored.'
});
export function resolveSpokenOffer(id, code, practice) {
  if (id == null || id === '') return null;
  if (id !== SPOKEN_OFFER.id || code !== SPOKEN_OFFER.product_code) throw new Error('unsupported_offer');
  if (practice != null && !/^privateaestheticpractice(?:llc)?$/.test(String(practice).toLowerCase().replace(/[^a-z]/g, ''))) throw new Error('offer_practice_mismatch');
  return SPOKEN_OFFER;
}
