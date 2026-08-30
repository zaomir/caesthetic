---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /legal/payment-terms/
updated: 2026-08-24
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/projects/caesthetic/legal/CAESTHETIC_CHARGEBACK_DISPUTE_STRATEGY_REVIEW.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Payment Terms

## Canon and discovery

**DESIGN DISCOVERY:** assumptions recorded from the approved chargeback/dispute strategy review and the founder's final Phase-0 decision: CAESTHETIC Order/Payment Request is the commercial source of truth; Wise is only the payment execution rail.

- [x] Read Website Studio, Impeccable, CAESTHETIC, Design and Site Map canons.
- Audience: prospective and existing CAESTHETIC clients checking payment, receipt timing, authorized-payer and cancellation/refund terms before or after paying a request.
- Desired action: understand how the controlled payment request works and where to raise a billing concern before escalating to a bank/card dispute.
- Brand attributes: explicit, calm, legally consistent, low-friction — same voice as the existing Terms/Privacy pages.
- Anti-attributes: reusable/anonymous checkout language, waiver-sounding dispute language, invented guarantees, claims that Wise prefilled amounts are locked.
- Signature idea: none introduced — this page deliberately carries no new visual signature; it extends the existing legal-page family so payment terms read as one continuous canon with Terms and Privacy rather than a bolted-on page.
- Reference principles, not clones: structurally identical to `/legal/terms/` and `/legal/privacy/` (same shell, same `cae-*` classes); no new component, color or layout introduced.
- Hard constraints: no PHI or payment credentials enter CAESTHETIC payment records; personal owner accounts may be used when controlled and authorized; provider redirect is never payment proof; dispute-contact language may not read as a waiver of bank/card rights.

## Impeccable execution

**SURFACE MODE:** read

**REPRESENTATIVE SURFACE:** `/legal/payment-terms/`; `/legal/terms/` and `/legal/privacy/` inspected as the existing representative surfaces this page reuses verbatim (same head boilerplate, `cae-hero-simple`/`cae-section`/`cae-wrap`/`cae-h1`/`cae-h2` shell, same header/footer slots and script includes).

**IMPECCABLE PASSES:** clarify, distill, typeset, layout, colorize and adapt are inherited unchanged from the already-shipped Terms/Privacy shell — no new CSS, JS or component was added. Animate and delight are N/A for a read-mode legal page. Final audit verifies the page states: client-specific request, exact amount/reference, confirmed-credit reconciliation, personal/company authorized payer, private opaque link and PHI/payment-credential exclusion.

**DETECT TARGET:** `site-caesthetic/legal/payment-terms/index.html`, `site-caesthetic/templates/footer.html`.

- Primary verification: `node --test tests/caesthetic/growth-score-sprint-canon.test.mjs tests/caesthetic/payment-runtime.test.mjs` plus adjacent CAESTHETIC canon/deploy suites.
- Approved exception: none required.

## Reliability and release

- [x] Payment request, receipt timing, authorized payer, cancellation/refund, cure and PHI/payment-data statements match the founder-approved decision and consultant §10.
- [x] Wise open-link amount/currency/reference are treated as prefill, never as locked payment proof.
- [x] Missing reference, partial payment, overpayment and unmatched receipts cannot activate service automatically.
- [x] Dispute-before-chargeback language explicitly preserves the right to dispute with a bank/card issuer (no waiver).
- [x] No payment, refund, result or response-time guarantee beyond what the applicable written order states is introduced.
- [x] Linked from the shared footer Legal column; canonical set; indexable (not noindex), consistent with Terms/Privacy.
- [ ] Production HTTP smoke required after deploy; real payment E2E requires the server-side Wise open-link secret.
