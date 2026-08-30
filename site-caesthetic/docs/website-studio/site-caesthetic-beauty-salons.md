---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /beauty-salons/
updated: 2026-08-28
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/founder-notes/DEC-856.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — Beauty Salons EN

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `docs/founder-notes/DEC-856.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from the approved CAESTHETIC canon and the founder request.

- Audience: owners of independent beauty salons and small multi-location salon groups.
- Desired action: request a free Salon Growth Score after understanding the constraint-first method.
- Brand attributes: evidence-led, calm, editorial, precise and commercially inspectable.
- Anti-attributes: spa-pink styling, stock model photography, generic marketing-agency copy, SaaS card soup, gradients, fake testimonials and guaranteed outcomes.
- Signature idea: an editorial salon demand route from discovery to booking and repeat visit, with one possible leak highlighted as illustrative rather than diagnosed.
- Proof boundary: one clearly labelled synthetic example; no real client identity or outcome claim.
- Hard constraints: four surfaces only; paid acquisition is not a fifth surface; internal operations remain not assessed without access; pricing is generated from `src/config/pricing.ts`.

## Impeccable execution

**SURFACE MODE:** persuade

**REPRESENTATIVE SURFACE:** `/beauty-salons/`; all four locale routes were inspected as one shared visual and interaction system.

**IMPECCABLE PASSES:**

- [x] `/impeccable clarify`: one promise, one primary CTA and one owner decision package.
- [x] `/impeccable distill`: removed channel-package and broad-agency framing.
- [x] `/impeccable typeset`: editorial display type with readable body and data labels.
- [x] `/impeccable layout`: ruled grids, demand route and evidence ledger replace decorative cards.
- [x] `/impeccable colorize`: CAESTHETIC tokens only; navy plus burgundy signal.
- [x] `/impeccable adapt`: 1440px, 768px and 390px layouts preserve hierarchy and controls.
- [x] `/impeccable animate`: N/A with reason — no decorative motion is needed; meaning is static.
- [x] `/impeccable delight`: restrained constraint highlight and language selector provide the signature moments.
- [x] Final `/impeccable audit`: copy, form contract, pricing markers, locale links, responsive layout and truth boundaries checked.

**DETECT TARGET:** English route at desktop 1440 and mobile 390; shared `beauty-salons.css`, `beauty-salons.js`, all locale documents and the four-field intake.

- Static detector: no hard-coded palette values, gradients, glowing shadows, inline style attributes or stock-image dependencies.
- Structure detector: one H1, unique IDs, four required form fields, reciprocal locale links and self-canonical metadata.
- Truth detector: synthetic example disclosure present; no testimonial, result guarantee or unverified benchmark.
- Responsive detector: no horizontal overflow in representative desktop/mobile inspection.
- Approved exception: none.

## Strategy, accessibility and reliability

- [x] Audience, problem, method and CTA are explicit above the fold.
- [x] Language selector is visible on the first screen and uses native `<details>`, `<summary>` and ordinary links.
- [x] Keyboard focus uses the canonical focus token.
- [x] Main content is available in static HTML without client JavaScript.
- [x] Form reuses `caesthetic-growth-score/2.0`, records `source_page` and fails closed when the API is unavailable.
- [x] Analytics contains no form answers or PII.
- [x] Score and Sprint labels use the generated pricing artifact.
- [x] Canonical, Open Graph and reciprocal `hreflang` metadata are present.

## Test evidence

- Targeted salon vertical suite: 7/7 passed before PR.
- JavaScript syntax check: passed.
- Representative desktop 1440 and mobile 390 inspection: passed; no duplicate IDs or overflow found.
- CI fast guards and bundle integrity: passed before Website Studio manifest gate.
- Production smoke: required after the corrected Agent API deploy.

## Closeout pass (2026-08-28)

Shared IA locked across EN/ES/RU/FR: hero + language selector, owner problem, four surfaces, client journey, New/Established/Multi-location, operational floor, Do Not Fund, Score output 01–09, Score → Sprint → optional Growth System, two-location synthetic example, FAQ, intake, footer. Header is CAESTHETIC + language + primary CTA. Optional self-reported fields appear only after required success. Analytics events are `beauty_salon_page_viewed`, `beauty_language_selected`, `beauty_score_cta_clicked`, `beauty_score_form_started`, `score_request_submitted` with locale/vertical/route/cta_position only.

**DETECT TARGET:** 1440 / 768 / 390 / 320; language selector and CTA remain usable; Russian/French labels wrap; FAQ and optional actions keep 44px targets; reduced-motion safe.

## Release decision

- [x] No P0 blocker in the route implementation.
- [x] Website Studio + Impeccable evidence recorded.
- [x] Route may ship after CI and production smoke pass.
