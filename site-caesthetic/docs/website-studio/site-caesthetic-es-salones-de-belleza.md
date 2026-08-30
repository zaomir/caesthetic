---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /es/salones-de-belleza/
updated: 2026-08-28
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/founder-notes/DEC-856.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Beauty Salons ES

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `docs/founder-notes/DEC-856.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from approved canon; Spanish copy is a full localized decision surface, not a JavaScript translation.

- Audience: Spanish-speaking beauty-salon owners.
- Desired action: request the free Salon Growth Score.
- Brand attributes: evidence-led, calm, editorial and precise.
- Anti-attributes: spa styling, stock models, generic agency promises, gradients, fake proof and guaranteed outcomes.
- Signature idea: the salon demand route with one illustrative leak and an evidence ledger.
- Hard constraints: four surfaces only; paid acquisition is not a fifth surface; internal causes are not inferred without access; pricing remains generated.

## Impeccable execution

**SURFACE MODE:** persuade

**REPRESENTATIVE SURFACE:** `/es/salones-de-belleza/`; compared with English, Russian and French routes for structural parity.

**IMPECCABLE PASSES:**

- [x] `/impeccable clarify`: localized promise, one primary CTA and owner decision outputs.
- [x] `/impeccable distill`: no channel-package or broad-agency catalogue.
- [x] `/impeccable typeset`: accents and long Spanish strings preserve hierarchy and readability.
- [x] `/impeccable layout`: same ruled route, grids and evidence ledger as the canonical surface.
- [x] `/impeccable colorize`: project tokens only.
- [x] `/impeccable adapt`: desktop, tablet and 390px mobile checked for wrapping and overflow.
- [x] `/impeccable animate`: N/A with reason — no motion is necessary for comprehension.
- [x] Final `/impeccable audit`: locale copy, CTA, form labels, pricing, links and truth boundaries checked.

**DETECT TARGET:** Spanish route at 1440px and 390px; shared CSS/JS and reciprocal locale navigation.

- Static detector: no inline styles, gradients, hard-coded colors or stock-image dependencies.
- Structure detector: one H1, unique IDs, four required fields, self-canonical and five alternate links.
- Truth detector: synthetic example explicitly disclosed; no real case or outcome claim.
- Responsive detector: no representative horizontal overflow.
- Approved exception: none.

## Accessibility, SEO and reliability

- [x] First-screen language selector uses native controls and ordinary links.
- [x] Focus states use the project token; headings and landmarks are semantic.
- [x] Static HTML contains all main content.
- [x] Existing `caesthetic-growth-score/2.0` intake contract is reused.
- [x] Analytics emits only non-PII locale/vertical events.
- [x] Generated pricing markers are present.
- [x] Spanish title, description, canonical, Open Graph and reciprocal `hreflang` are present.

## Test evidence

- Targeted multilingual suite: 7/7 passed before PR.
- JavaScript syntax: passed.
- Desktop/mobile representative inspection: passed.
- Production smoke: required after corrected Agent API deploy.

## Closeout pass (2026-08-28)

Same IA as `/beauty-salons/`. Spanish is a full localized decision surface. Language selector, four surfaces, Cross-Surface Consistency, synthetic disclosure, generated pricing and required-then-optional intake verified.

## Release decision

- [x] No P0 blocker in the route implementation.
- [x] Website Studio + IMPECCABLE evidence recorded.
- [x] Route may ship after CI and production smoke pass.
