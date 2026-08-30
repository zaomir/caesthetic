---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /fr/salons-de-beaute/
updated: 2026-08-28
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/founder-notes/DEC-856.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Beauty Salons FR

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `docs/founder-notes/DEC-856.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from approved canon; French copy is a standalone localized decision surface.

- Audience: French-speaking beauty-salon owners.
- Desired action: request the free Salon Growth Score.
- Brand attributes: evidence-led, calm, editorial and commercially precise.
- Anti-attributes: spa styling, stock models, generic agency claims, gradients, fake proof and guaranteed outcomes.
- Signature idea: an editorial client route from discovery to repeat visit with one illustrative leak and an evidence ledger.
- Hard constraints: four surfaces only; paid acquisition is not a fifth surface; internal causes remain unassessed without access; pricing stays generated.

## Impeccable execution

**SURFACE MODE:** persuade

**REPRESENTATIVE SURFACE:** `/fr/salons-de-beaute/`; compared with English, Spanish and Russian routes for structural parity.

**IMPECCABLE PASSES:**

- [x] `/impeccable clarify`: localized promise, one primary CTA and owner decision package.
- [x] `/impeccable distill`: removed broad agency and fixed-channel framing.
- [x] `/impeccable typeset`: accents and longer French strings preserve hierarchy and reading width.
- [x] `/impeccable layout`: ruled route, surface grid and evidence ledger remain canonical.
- [x] `/impeccable colorize`: project tokens only.
- [x] `/impeccable adapt`: desktop, tablet and 390px mobile checked for wrapping and overflow.
- [x] `/impeccable animate`: N/A with reason — no motion is required to understand the decision system.
- [x] Final `/impeccable audit`: locale copy, form, CTA, pricing, metadata and truth boundaries checked.

**DETECT TARGET:** French route at 1440px and 390px; shared CSS/JS, form and reciprocal locale navigation.

- Static detector: no inline styles, gradients, hard-coded palette or stock-image dependency.
- Structure detector: one H1, unique IDs, four required fields, self-canonical and five alternate links.
- Truth detector: synthetic example explicitly disclosed; no real case or claimed outcome.
- Responsive detector: no representative horizontal overflow.
- Approved exception: none.

## Accessibility, SEO and reliability

- [x] First-screen language selector uses native controls and ordinary links.
- [x] Keyboard focus uses the project token; semantic headings and landmarks are present.
- [x] Main content remains static HTML.
- [x] Existing `caesthetic-growth-score/2.0` intake contract is reused.
- [x] Analytics contains only non-PII locale and vertical events.
- [x] Generated pricing markers are present.
- [x] French title, description, canonical, Open Graph and reciprocal `hreflang` are present.

## Test evidence

- Targeted multilingual suite: 7/7 passed before PR.
- JavaScript syntax: passed.
- Desktop/mobile representative inspection: passed.
- Production smoke: required after corrected Agent API deploy.

## Closeout pass (2026-08-28)

Same IA as `/beauty-salons/`. French is a full localized decision surface. Language selector, four surfaces, Cross-Surface Consistency, synthetic disclosure, generated pricing and required-then-optional intake verified.

## Release decision

- [x] No P0 blocker in the route implementation.
- [x] Website Studio + IMPECCABLE evidence recorded.
- [x] Route may ship after CI and production smoke pass.
