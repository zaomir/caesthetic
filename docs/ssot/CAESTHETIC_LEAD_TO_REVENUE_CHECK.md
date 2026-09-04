---
owner: CAESTHETIC
status: active
version: 1.6
created: 2026-09-02
updated: 2026-09-04
scope: canonical commercial and evidence contract for the CAESTHETIC Lead-to-Revenue Check
copy_contract: check500-section/en-US/1.0.0
placement_contract: check500-two-placement/1.0.0
style_contract: check500-style/1.0.0
style_reference: docs/ssot/assets/caesthetic/check500-section-style-v1.png
style_reference_sha256: 1d8d9d0732176f0f459e8ddd76fbd50ed2425baea3e7bda3c83559836a22a375
commercial_parent: caesthetic-4444-commercial-core/1.0.0
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
supersedes_scope:
  - any prior statement that the Lead-to-Revenue Check price is proposed, configurable, non-canonical or awaiting pricing approval
  - any prior client-report or Journey Graph working note that suppresses the $500 amount solely because pricing authority had not approved it
  - any prior rule that presents the Lead-to-Revenue Check as a mandatory step before the Sprint
  - any prior rule that renders the Lead-to-Revenue Check only once, hides it until self-selection or infers user hesitation from page behavior
---

# CAESTHETIC Lead-to-Revenue Check — canonical contract

## 1. Product role

**Lead-to-Revenue Check — $500 fixed price.**

The Lead-to-Revenue Check is an evidence-gated internal conversion diagnostic for the path after a public enquiry reaches the practice. It is not a fifth surface, not part of the Four Surfaces score, not a general business audit and not a replacement for the free Growth Score.

**Canonical visibility rule:** every approved single-location Growth Score and every approved Multi-Location parent renders the Lead-to-Revenue Check in exactly two always-visible places. The first is a contextual section in the middle of the report, immediately after the explanation or map of what happens after a patient enquiry. The second is an alternative-start section at the end, immediately after the primary `$2,500` Sprint offer. A Multi-Location focus child renders neither section because its parent owns the commercial decision.

Always-visible availability is not a recommendation to buy the Check, and it is not evidence that an internal leak, weak receptionist, broken CRM, staffing problem or any other internal cause exists. The internal path remains `Not assessed` / `Insufficient evidence` until authorized internal evidence supports a finding.

The canonical sequence is:

```text
Growth Score — outside-in diagnosis across the Four Surfaces
→ mid-report: explain the post-enquiry boundary, then show the optional Lead-to-Revenue Check ($500)
→ continue the evidence, priorities and implementation guidance
→ final decision: primary 30-Day Growth Sprint ($2,500)
→ immediately after it: optional Lead-to-Revenue Check ($500) as a smaller first engagement
```

The public headline funnel remains `Growth Score → 30-Day Growth Sprint → optional Growth System`. 4444 remains the primary CAESTHETIC product, and the `$2,500` Sprint remains the primary paid action for implementing its approved priority. The Check is a secondary way to understand the post-enquiry path or begin with a smaller engagement; it does not become a fourth headline product, a gate before the Sprint or an automatic upsell.

## 2. Fixed commercial rule

- Price: **$500**.
- Every supported report locale renders both Check placements defined below; purchase remains optional.
- Both placements are visible in the report without self-selection, behavior-based reveal, modal-only presentation or recommendation gating.
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

User interest in the Check is not itself an internal diagnostic finding and does not authorize evidence-free claims about an internal defect.

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

## 6. Two-placement Growth Score presentation

In the free Growth Score, the `Lead Intake` ring remains the outside-in boundary. The Lead-to-Revenue Map remains gray by default unless valid internal evidence already exists.

Every approved single-location Growth Score and every approved Multi-Location parent must render these two instances:

1. **Middle contextual section — after the post-enquiry explanation or Lead-to-Revenue Map.** Its job is to explain that public evidence cannot establish what happens after a patient contacts the practice and that the `$500` Check can examine that authorized internal path. It must not imply that an internal leak has already been found.
2. **Final alternative-start section — immediately after the primary `$2,500` Sprint offer to implement the approved 4444 priority.** Its job is to offer a smaller first engagement for a person who wants to understand the post-enquiry path and experience how CAESTHETIC works before choosing a larger implementation engagement. It must remain visually and commercially secondary to 4444 and the Sprint.

Both instances are sections, not hidden tooltips, modal-only content or behavior-triggered replacements. They identify the product, fixed `$500` price, purpose, route/action and direct-continuation credit. Their placement and visibility do not depend on `leadToRevenueCheck.recommendation`, scroll depth, dwell time, return visits, CTA reversals or any other inferred intent.

All supported language versions preserve both placements and the same meaning. Client-facing wording must not call the person doubtful, afraid, confused, unqualified or unwilling to pay. Neutral wording such as `Want to understand what happens after a patient enquiry first?` or `Prefer to start with a smaller step?` is appropriate.

Behavioral measurement may measure engagement with each placement, but may not hide, delay, reorder or suppress either one. It must use non-PII events and may not capture form answers, patient data or clinical context. The page must not automatically redirect, open checkout or change the approved diagnosis.

For Multi-Location Growth Score, render both canonical network-level placements in the parent report. Focus-location child views must not duplicate either commercial Check section.

## 7. Canonical reusable Check500 section copy

Copy contract ID: **`check500-section/en-US/1.0.0`**.

Every full English Check500 offer section that is intentionally rendered on a relevant CAESTHETIC website page or report must use the following visible copy exactly, in this order:

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
- all locale variants must preserve `check500-two-placement/1.0.0`: one contextual middle section and one secondary final section after the primary Sprint offer;
- explanatory copy outside the locked section must preserve optional purchase, the evidence boundary and the no-internal-leak conclusion.

The section's question and phrase `may be getting lost` identify what the Check will examine; they do not state that a leak exists.

### 7.1 Canonical visual style

Style contract ID: **`check500-style/1.0.0`**.

The approved reference raster is `docs/ssot/assets/caesthetic/check500-section-style-v1.png`, SHA-256 `1d8d9d0732176f0f459e8ddd76fbd50ed2425baea3e7bda3c83559836a22a375`, dimensions `1536×1024`. The hash identifies the exact owner-approved style reference. It is not the runtime copy source and must not replace accessible semantic HTML/CSS; the text lock above remains authoritative for every character, including the middle dot `·`.

The visual language is locked as follows:

- warm ivory `#F0EDE6` field with a very subtle tactile paper grain, no photograph and no decorative scene;
- centered editorial composition with generous negative space and thin deep-navy horizontal rules at the top and bottom;
- one small burgundy circular accent centered in the upper rule and one short burgundy rule between the H2 and product line;
- oversized high-contrast deep-navy editorial serif H2, centered and allowed to wrap naturally to two lines on desktop;
- bold deep-navy sans-serif product line, readable centered body copy in a narrower measure, and no additional labels or icons;
- one wide centered burgundy `#7B244B` CTA with high-contrast white sans-serif text and restrained corners;
- fine print centered immediately below the CTA in smaller deep-navy sans-serif text, clearly readable and visually subordinate;
- no gradients, shadows, floating card shell, glass effects, stock photography, medical imagery, extra illustrations, browser chrome, badges, labels, extra copy or generic SaaS decoration.

Responsive implementations preserve the same hierarchy and calm spacing. On mobile, the H2 and body reflow without shrinking below readable sizes, the CTA may become full-width inside the content gutter, the rules remain thin, and the fine print remains visible. The middle and final report placements use this same visual family; the final alternative-start instance remains one hierarchy step below the preceding primary Sprint offer without changing the locked Check500 copy.

Any replacement of the reference PNG or material change to its palette, hierarchy, composition, typography relationship or decoration rules requires an explicit canon update, a new SHA-256 and a new style-contract version.

## 8. Public website and report-routing contract

- Canonical indexable product route: `/lead-to-revenue-check/`.
- The primary header remains focused on the headline funnel. The Check is discoverable through the global footer and contextual decision boundaries on Home, Growth Score, the Check product page, Pricing, Sprint, Growth System, About, Support, the audit catalog and relevant localized vertical pages. Whenever one of those surfaces renders a full Check500 offer section rather than a compact reference, it uses `check500-section/en-US/1.0.0` exactly.
- Public pricing values come from `site-caesthetic/src/config/pricing.ts` through the generated pricing artifact. Runtime code must not create a second price source.
- New Growth Score authoring must not mark the Check `recommended` merely because the outside-in report cannot assess the internal path. A specific recommendation requires the normal evidence and named-human approval contract.
- An absent or `not_recommended` report recommendation does not remove either always-visible placement; it suppresses only the claim that CAESTHETIC specifically recommends the Check for this case.
- The Check section does not replace an evidence-backed Sprint CTA. The two answer different decisions: Check reduces uncertainty about the internal path; Sprint implements a verified priority constraint.
- A Multi-Location parent renders both placements; focus children do not add duplicate commercial CTAs.
- Canonical measurement events remain `lead_to_revenue_check_page_viewed` and `lead_to_revenue_check_scope_requested`; the page-view event should distinguish `mid_report` from `final_alternative` without collecting PII.
- Scope is confirmed in writing before CAESTHETIC issues a private controlled payment request.

## 9. Authority and conflicts

This file is the specific active pricing/evidence/recommendation authority for the Lead-to-Revenue Check. It supplements `docs/ssot/CAESTHETIC.md` without changing the immutable Four Surfaces or the public headline funnel.

As of **2026-09-04**, this file supersedes subordinate rules that render the Check only once, hide it until self-selection, make it mutually exclusive with the Sprint CTA, automatically select it from passive behavior, or permit a Multi-Location focus child to duplicate the parent's commercial sections.

Any later change to the fixed `$500` price, two-placement rule, Sprint credit rule, product role, `check500-section/en-US/1.0.0` wording or `check500-style/1.0.0` visual language requires an explicit canon update and a new contract version.
