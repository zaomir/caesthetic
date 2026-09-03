---
owner: CAESTHETIC
status: active
version: 1.1
created: 2026-09-02
updated: 2026-09-03
scope: canonical commercial and evidence contract for the CAESTHETIC Lead-to-Revenue Check
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md
supersedes_scope:
  - any prior statement that the Lead-to-Revenue Check price is proposed, configurable, non-canonical or awaiting pricing approval
  - any prior client-report or Journey Graph working note that suppresses the $500 amount solely because pricing authority had not approved it
---

# CAESTHETIC Lead-to-Revenue Check — canonical contract

## 1. Product role

**Lead-to-Revenue Check — $500 fixed price.**

The Lead-to-Revenue Check is an evidence-gated internal conversion diagnostic for the path after a public enquiry reaches the practice. It is not a fifth surface, not part of the Four Surfaces score, not a general business audit and not a replacement for the free Growth Score.

It is used when the outside-in Growth Score cannot responsibly determine what happens after `Lead Intake`, or when valid evidence indicates that the likely next constraint may sit inside the internal conversion / patient-operations layer.

The canonical sequence is conditional:

```text
Growth Score
→ external constraint verified: 30-Day Growth Sprint ($2,500)
OR
→ internal conversion uncertainty: Lead-to-Revenue Check ($500)
   → verified finite constraint: optional 30-Day Growth Sprint ($2,500 total)
```

The public headline funnel remains `Growth Score → 30-Day Growth Sprint → optional Growth System`. The Check is a conditional diagnostic branch, not a mandatory extra step.

## 2. Fixed commercial rule

- Price: **$500**.
- The price is canonical and may be rendered directly in an approved Growth Score report as `Lead-to-Revenue Check · $500` when the internal layer is a material unresolved decision.
- If the client proceeds directly from this Check into the next CAESTHETIC 30-Day Growth Sprint addressing the verified constraint, the **$500 is credited once toward that Sprint**. The canonical Sprint total remains **$2,500**; the remaining balance after the credit is **$2,000**.
- The credit is not a separate discount, cash-equivalent, refund promise or recurring balance. It applies only to the next CAESTHETIC Sprint purchased as the direct continuation of the Check.
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

## 6. Growth Score presentation

In the free Growth Score, the `Lead Intake` ring remains the outside-in boundary. The Lead-to-Revenue Map is gray by default unless valid internal evidence already exists.

When the Check is the appropriate next diagnostic step, the report may show:

**Lead-to-Revenue Check · $500**

with concise language explaining that Growth Score shows how demand reaches the practice while the Check shows what happens after it arrives.

The Check remains secondary to a directly verified external Sprint path. Do not insert it as an automatic upsell when the Growth Score has already established an actionable external binding constraint.

## 7. Public runtime and report-routing contract

- Canonical indexable product route: `/lead-to-revenue-check/`.
- The primary header remains focused on the headline funnel. The Check is discoverable through the global footer and contextual decision boundaries on Growth Score, Pricing, Sprint, Growth System, About, Support, the audit catalog and relevant localized vertical pages.
- Public pricing values come from `site-caesthetic/src/config/pricing.ts` through the generated pricing artifact. Runtime code must not create a second price source.
- A Growth Score report shows the commercial Check card only when its approved source contains `leadToRevenueCheck.recommendation = "recommended"`, a non-empty reason and at least one evidence reference.
- Absence of that field, or `recommendation = "not_recommended"`, keeps the internal map gray without a Check offer. The report's single late commercial CTA remains the Sprint unless the approved Check recommendation replaces it. A Multi-Location focus child never adds a second commercial CTA.
- Canonical measurement events are `lead_to_revenue_check_page_viewed` and `lead_to_revenue_check_scope_requested`.
- Scope is confirmed in writing before CAESTHETIC issues a private controlled payment request.

## 8. Authority and conflicts

This file is the specific active pricing/evidence authority for the Lead-to-Revenue Check. It supplements `docs/ssot/CAESTHETIC.md` without changing the immutable Four Surfaces or the public headline funnel.

Where older subordinate Growth Score documents say that the `$500` amount is proposed, configurable, non-canonical or awaiting pricing approval, **this file supersedes those statements as of 2026-09-02**.

Any later change to the fixed `$500` price, Sprint credit rule or product role requires an explicit canon update.