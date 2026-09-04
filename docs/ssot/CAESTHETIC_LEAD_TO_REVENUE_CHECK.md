---
owner: CAESTHETIC
status: active
version: 1.3
created: 2026-09-02
updated: 2026-09-04
scope: canonical commercial and evidence contract for the CAESTHETIC Lead-to-Revenue Check
copy_contract: check500-section/en-US/1.0.0
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
supersedes_scope:
  - any prior statement that the Lead-to-Revenue Check price is proposed, configurable, non-canonical or awaiting pricing approval
  - any prior client-report or Journey Graph working note that suppresses the $500 amount solely because pricing authority had not approved it
  - any prior rule that makes Lead-to-Revenue Check recommendation conditional on unresolved post-enquiry uncertainty
  - any prior report-routing rule that permits a single-location or Multi-Location Growth Score to omit the Lead-to-Revenue Check recommendation section
---

# CAESTHETIC Lead-to-Revenue Check — canonical contract

## 1. Product role

**Lead-to-Revenue Check — $500 fixed price.**

The Lead-to-Revenue Check is an evidence-gated internal conversion diagnostic for the path after a public enquiry reaches the practice. It is not a fifth surface, not part of the Four Surfaces score, not a general business audit and not a replacement for the free Growth Score.

**Canonical recommendation rule:** the Lead-to-Revenue Check is **always recommended** in every approved CAESTHETIC Growth Score and every approved Multi-Location Growth Score. Every new report must contain the standard `Lead-to-Revenue Check · $500` recommendation section.

This universal recommendation is a product-policy recommendation to verify the internal lead-to-revenue path after the outside-in assessment. It is **not** evidence that an internal leak, weak receptionist, broken CRM, staffing problem or any other internal cause exists. The internal path remains `Not assessed` / `Insufficient evidence` until authorized internal evidence supports a finding.

The canonical sequence is:

```text
Growth Score — outside-in diagnosis across the Four Surfaces
→ Lead-to-Revenue Check ($500) — always recommended as the internal-path verification layer
→ independently, when an actionable constraint is verified: fix in-house / another provider / optional 30-Day Growth Sprint ($2,500)
```

The public headline funnel remains `Growth Score → 30-Day Growth Sprint → optional Growth System`. The Check is a standard recommended diagnostic complement to every Growth Score, but it does not become a fourth headline product and purchasing it is never mandatory.

## 2. Fixed commercial rule

- Price: **$500**.
- Every approved Growth Score and Multi-Location Growth Score renders `Lead-to-Revenue Check · $500` as a standard recommendation.
- Recommendation is universal; purchase remains optional.
- If the client proceeds directly from this Check into the next CAESTHETIC 30-Day Growth Sprint addressing a verified constraint, the **$500 is credited once toward that Sprint**. The canonical Sprint total remains **$2,500**; the remaining balance after the credit is **$2,000**.
- The credit is not a separate discount, cash-equivalent, refund promise or recurring balance. It applies only to the next qualifying CAESTHETIC Sprint purchased as the direct continuation of the Check.
- The Check recommendation does not alter the Growth Score binding constraint, Top 3, Do Not Fund Yet or any Four-Surface score.
- No revenue, patient, ROI, ranking or conversion outcome is guaranteed.

## 3. Evidence boundary

The Check may evaluate only evidence the practice has authorized CAESTHETIC to access. Depending on the approved scope, evidence may include non-clinical CRM records, telephony/call logs and recordings where lawful and authorized, messages, booking/scheduling records, form submissions, workflow states and aggregated conversion events.

Do not request, store or expose PHI or patient-level clinical data when it is not necessary for the diagnostic purpose. Apply least-privilege access and the applicable privacy/security authority.

The canonical internal path is:

`Lead Received → Response → Qualification → Booking → Confirmation → Show → Consultation → Payment`.

Optional downstream retention/reactivation analysis may be added only when evidence and scope justify it; it does not change the core map.

## 4. Stage states and claim rules

Each assessed stage uses only:

- `working` / green;
- `friction` / amber;
- `confirmed_leak` / red;
- `not_assessed` / gray.

A downstream stage does not become red merely because an upstream stage is broken. If it cannot be evaluated, it remains gray.

The Check may state observable facts such as:

- first-response delay;
- unanswered enquiries;
- missed-call recovery status;
- whether a next action was assigned;
- whether a concrete appointment was offered;
- follow-up presence/cadence;
- booking abandonment;
- confirmation / cancellation / no-show recovery status;
- consultation follow-up status;
- financing/payment-path friction;
- failed-payment recovery where observable.

It may not infer a cause such as `bad receptionist`, `broken CRM`, `poor training` or `staffing shortage` unless the required evidence supports that conclusion.

The universal recommendation to buy/use the Check is not itself an internal diagnostic finding and therefore does not require evidence references asserting an internal defect.

## 5. Owner-facing output

The Check returns a compact decision package:

1. **Lead-to-Revenue Map** with evidence-backed stage states.
2. The **main internal constraint**, or `Insufficient evidence` when one cannot be established.
3. The most material supporting friction points.
4. Evidence references and limitations.
5. What to fix first.
6. A complete implementation/verification path suitable for the practice, another provider or CAESTHETIC.
7. A decision: `fix in-house / another provider / 30-Day Sprint / defer / collect more evidence`.

The Check does not automatically create a Sprint sale. If no material internal constraint is verified, say so and do not manufacture work.

## 6. Mandatory Growth Score presentation

In the free Growth Score, the `Lead Intake` ring remains the outside-in boundary. The Lead-to-Revenue Map remains gray by default unless valid internal evidence already exists.

**Every approved single-location Growth Score and every approved Multi-Location Growth Score must show the standard recommendation section defined in §7.**

The section must make clear that:

- the Check is always recommended;
- buying it is optional;
- the recommendation does not mean an internal problem has already been found;
- missing internal evidence stays gray / `Not assessed`;
- an externally verified Sprint priority remains valid and is not displaced merely because the Check is also recommended.

The Check recommendation is a persistent standard section, not a mutually exclusive replacement for the report's primary evidence-backed action. If the Growth Score verifies an external priority suitable for Sprint, the report may still present that primary action while also showing the standard Check recommendation section.

For Multi-Location Growth Score, render one canonical network-level Check recommendation section in the parent report. Focus-location child views must not duplicate additional commercial Check sections.

## 7. Canonical reusable Check500 section copy

Copy contract ID: **`check500-section/en-US/1.0.0`**.

Every full English Check500 offer section on a relevant CAESTHETIC website page, every approved single-location Growth Score, and the network parent of every approved Multi-Location Growth Score must render the following visible copy exactly, in this order:

- **H2:** `Do all your enquiries make it to a booking?`
- **Product line:** `Lead-to-Revenue Check · $500`
- **Body:** `See what happens after a prospective patient contacts your practice — from the first response and follow-up to booking, consultation and payment — and find where enquiries may be getting lost.`
- **CTA:** `Check My Lead-to-Revenue Path`
- **Fine print:** `If you move directly into the next qualifying 30-Day Growth Sprint, your $500 Check fee is credited toward the $2,500 Sprint total.`

This is an exact copy lock:

- the H2, product line, body, CTA label and fine print must not be paraphrased, shortened, expanded or reordered inside a full Check500 offer section;
- source markup may split the generated price into a pricing span only when the visible product line and fine print remain byte-for-byte equivalent to the locked copy;
- the fine print remains visibly subordinate but accessible and may not be hidden in a tooltip, modal or legal-only page;
- compact navigation, footer, comparison-table and legal references may use the canonical product label without reproducing the full section;
- localized pages and localized reports must derive from this English source lock, but a translated lock requires its own approved locale/version before it replaces the English source wording;
- explanatory copy outside the locked section must preserve the universal recommendation, optional purchase, evidence boundary and no-internal-leak conclusion.

The standard section is universal because the outside-in Growth Score does not assess the authorized internal path. Its question and phrase `may be getting lost` identify what the Check will examine; they do not state that a leak exists.

## 8. Public website and report-routing contract

- Canonical indexable product route: `/lead-to-revenue-check/`.
- The primary header remains focused on the headline funnel. The Check is discoverable through the global footer and contextual decision boundaries on Home, Growth Score, the Check product page, Pricing, Sprint, Growth System, About, Support, the audit catalog and relevant localized vertical pages. Whenever one of those surfaces renders a full Check500 offer section rather than a compact reference, it uses `check500-section/en-US/1.0.0` exactly.
- Public pricing values come from `site-caesthetic/src/config/pricing.ts` through the generated pricing artifact. Runtime code must not create a second price source.
- New Growth Score authoring must always emit `leadToRevenueCheck.recommendation = "recommended"`.
- `leadToRevenueCheck.recommendation = "not_recommended"`, an absent `leadToRevenueCheck` block, or report logic that hides the standard Check section is non-canonical for newly authored single-location reports and Multi-Location parent reports. The focus-location child is the sole exception because it must not duplicate the parent commercial section.
- The universal recommendation may use a canonical policy rationale and does not require evidence references alleging an internal problem. Any diagnostic claim inside the section still requires the normal evidence and named-human approval gates.
- The Check section no longer replaces an evidence-backed Sprint CTA. The two answer different decisions: Check verifies the internal path; Sprint implements a verified priority constraint.
- A Multi-Location parent renders one Check recommendation section; focus children do not add duplicate commercial CTAs.
- Canonical measurement events remain `lead_to_revenue_check_page_viewed` and `lead_to_revenue_check_scope_requested`.
- Scope is confirmed in writing before CAESTHETIC issues a private controlled payment request.

## 9. Authority and conflicts

This file is the specific active pricing/evidence/recommendation authority for the Lead-to-Revenue Check. It supplements `docs/ssot/CAESTHETIC.md` without changing the immutable Four Surfaces or the public headline funnel.

As of **2026-09-04**, this file supersedes subordinate rules that describe the Check recommendation as conditional, optional-to-render, hidden by default, mutually exclusive with the Sprint CTA, dependent on first proving unresolved post-enquiry uncertainty, or free to paraphrase the full Check500 section.

Any later change to the fixed `$500` price, universal recommendation rule, Sprint credit rule, product role or `check500-section/en-US/1.0.0` wording requires an explicit canon update and a new copy-contract version.
