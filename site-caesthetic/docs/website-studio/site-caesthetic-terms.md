---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /terms/
updated: 2026-08-21
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/founder-notes/DEC-737_website-studio-standard.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Terms alias

## Canon and discovery

**DESIGN DISCOVERY:** assumptions recorded from the supplied Stripe merchant-profile URLs and approved CAESTHETIC legal canon.

- [x] Read Website Studio, Impeccable, CAESTHETIC, Design and Site Map canons.
- Audience: customers and payment-provider reviewers following the merchant-profile terms URL.
- Desired action: reach `/legal/terms/` without a 404 or duplicate indexable document.
- Brand attributes: explicit, calm, legally consistent and low-friction.
- Anti-attributes: invented terms, fake checkout, redirect chains and dead links.
- Signature idea: a minimal branded handoff that still exposes verified company identity when automatic navigation is unavailable.
- Hard constraints: canonical + `noindex,follow`; same-origin destination; no analytics event or payment claim.

## Impeccable execution

**SURFACE MODE:** read

**REPRESENTATIVE SURFACE:** `/terms/`; canonical `/legal/terms/` inspected as the connected surface.

**IMPECCABLE PASSES:** clarify, distill, typeset, layout, colorize and adapt reuse the existing legal-page shell. Animate and delight are N/A because trust and immediate functional navigation are the intended result. Final audit verifies canonical, noindex, company identity, fallback link and sitemap exclusion.

**DETECT TARGET:** `site-caesthetic/terms/index.html`, `site-caesthetic/templates/footer.html`.

- Detector: `pnpm impeccable:detect -- site-caesthetic/terms/index.html site-caesthetic/templates/footer.html` — PASS.
- Approved exception: immediate compatibility navigation is required by the external merchant-profile URL contract.

## Reliability and release

- [x] Destination is the existing canonical Terms of Use.
- [x] Alias is outside the sitemap and marked `noindex,follow`.
- [x] OXFORD PROJECTS LTD, company number, registered office and support email match supplied details.
- [x] No payment, refund, result or response-time guarantee is introduced.
- [x] Route/canon tests pass; production HTTP and destination smoke required after deploy.
- [x] Score ≥85/100; no category below 70%; no P0 blockers.
