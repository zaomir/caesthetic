---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /pay/
updated: 2026-08-24
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/projects/caesthetic/legal/CAESTHETIC_CHARGEBACK_DISPUTE_STRATEGY_REVIEW.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Private Payment Request

## Canon and discovery

**DESIGN DISCOVERY:** this is a private, noindex transactional surface governed by the final consultant-approved CAESTHETIC payment architecture in `CAESTHETIC_CHARGEBACK_DISPUTE_STRATEGY_REVIEW.md` §10.

- [x] Read Website Studio, Impeccable, CAESTHETIC and current legal/payment surfaces.
- Audience: one authorized payer acting for one named practice after a signed Order exists.
- Desired action: verify practice, invoice/SOW and exact amount; attest payer authority; continue to the external payment provider.
- Brand attributes: explicit, calm, low-friction, trustworthy, evidence-first.
- Anti-attributes: generic checkout, sales pressure, hidden amount, reusable provider URL, medical/patient data, card/bank credential capture.
- Signature idea: the exact amount is the dominant visual anchor; the page intentionally resembles an invoice review rather than an ecommerce checkout.
- Hard constraints: `noindex,nofollow,noarchive`; no public Wise/Stripe base URL; no PHI; no payment credentials; no redirect-completion-as-payment-success; personal and business accounts both permitted when controlled by the authorized payer.

## Impeccable execution

**SURFACE MODE:** transact

**REPRESENTATIVE SURFACE:** `/pay/?token=<opaque>` using the shipped CAESTHETIC shell (`cae-hero-simple`, `cae-section`, `cae-wrap`, `cae-price-block`, `cae-actions`, `cae-btn`). No new global CSS or color system is introduced.

**IMPECCABLE PASSES:** clarify/distill — only practice, service, invoice, SOW, seller, amount and payer authorization are shown; typeset/layout — amount is visually dominant and the authorization follows it; adapt — mobile-first single-column flow; accessibility — native labels, inputs, select, required checkbox and button; final audit — provider URL absent from HTML/JS, exact-amount warning present, private token excluded from marketing analytics by policy.

**DETECT TARGET:** `site-caesthetic/pay/index.html`, `site-caesthetic/assets/js/caesthetic-config.js`.

- No new global CSS file or visual token introduced.
- HTML/design lint must pass in PR CI.
- Automated authority: `tests/caesthetic/payment-runtime.test.mjs` verifies no reusable provider URL, noindex, exact amount warning, payer account type/relationship, explicit attestation, server-side Wise secret and reconciliation gates.
- Security review: opaque token generated with 32 random bytes; DB stores SHA-256 only; token never persists in billing outbox; closed/expired requests cannot create a new redirect; provider transaction ID is unique.
- Approved exception: none.

## States and reliability

- [x] Loading state is explicit.
- [x] Missing/invalid token fails closed.
- [x] Expired request fails closed.
- [x] Credited/delivery-started/refunded/returned request cannot restart payment.
- [x] Missing Wise provider secret fails closed without exposing the base provider URL.
- [x] Payer must accept authorization before redirect.
- [x] Exact amount and instruction not to alter amount/reference are shown before redirect.
- [x] Redirect completion never marks payment credited.
- [x] `reference_missing`, `partial`, `overpaid`, and `unmatched` receipts stay in manual review.
- [x] No PHI, patient data, card numbers or bank credentials are collected by the page.
- [x] Production smoke required after deploy: `/pay/` without token returns the static surface and fails closed client-side; real opaque-token E2E smoke follows only after `CAESTHETIC_WISE_OPEN_LINK` is installed.
