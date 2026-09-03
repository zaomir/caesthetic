---
owner: Design + Engineering
status: draft_visual_review
project: caesthetic
route: /case-studies/case/
updated: 2026-09-02
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md, docs/ssot/IMAGE_ASSET_REGISTRY.md]
release: blocked_placeholder_content
---

# WEBSITE STUDIO QA MANIFEST — CAESTHETIC Full Case Preview

## Impeccable discovery

**DESIGN DISCOVERY:** the detail route extends the approved Clinical Editorial Intelligence direction and the 25-case catalog without introducing a second visual language.

**SURFACE MODE:** persuade, substantiate and continue.

**REPRESENTATIVE SURFACE:** `/case-studies/case/?id=case-01` with all 25 placeholder records resolved through the same route.

- Audience: United States aesthetic-practice owners and directors evaluating whether CAESTHETIC understands operating constraints, attribution and implementation limits.
- Primary task: inspect one case from owner question through intervention sequence, evidence ledger and adjacent-case navigation.
- Signature structure: editorial case file with a four-field evidence snapshot, ruled workstreams, operating sequence and explicit claim boundary.
- Responsive model: two-column editorial hero and sticky contents rail on desktop; single-column narrative, 2×2 evidence snapshot and stacked ledger/navigation on mobile.
- Brand constraints: Source Serif 4, IBM Plex Sans, IBM Plex Mono, clinical paper, navy and restrained signal crimson.
- Anti-patterns excluded: fake dashboards, invented metrics, patient imagery, testimonials, gradients, glass surfaces, sticky conversion CTA and generic card grids.

## Final Impeccable pass

**IMPECCABLE PASS:** clarify, distill, typeset, layout, colorize and adapt were completed for the protected detail-page prototype.

- [x] Clarify: the page opens with the operating question and separates placeholder status from evidence.
- [x] Distill: content is organized into owner question, constraint, workstreams, operating sequence, ledger and claim boundary.
- [x] Typeset: display, interface and data typography follow the CAESTHETIC roles.
- [x] Layout: desktop hierarchy and mobile stacking are explicitly defined without horizontal overflow.
- [x] Colorize: signal crimson is limited to status, navigation cues and evidence emphasis.
- [x] Adapt: interactive targets are at least 44px and the 430px breakpoint collapses the ledger to label/value rows.
- [x] Executive evidence, denominator, practice scale, budget context and CAESTHETIC role appear before the long-form narrative.
- [x] U.S. aesthetic-practice applicability is explicit and distinguishes direct, adjacent and transferable evidence.
- [x] Mobile retains 2×2 evidence/context grids and hides non-evidentiary placeholder artwork below 430px.

## Detector evidence

**DETECT TARGET:** `/case-studies/case/?id=case-11`, `/assets/css/case-study-detail.css` and `/assets/js/case-study-detail.js`.

**Detector result:** protected-browser runtime checks and repository static checks passed for the detail route; final public-content audit remains blocked on verified evidence and approved media.

- Browser target: protected internal preview of `/case-studies/case/?id=case-11`.
- Browser result: dynamic H1, title, placeholder media and previous/next records resolved; 4 snapshot cells, 3 workstreams and 8 ledger rows present.
- Reflow result: no horizontal document overflow at the tested 1363px viewport; mobile behavior is encoded at 768px and 430px breakpoints.
- Runtime console: no page-origin errors observed; extension-only metadata warnings were excluded.
- Static checks: `node --check` passes for `case-study-detail.js`; the placeholder media registry check passes.
- Contract check: `check-case-study-contract.mjs` validates all 25 drafts and blocks publishable records without comparable metrics, dates, denominator, attribution, permission and approved media.

## Placeholder and evidence governance

- [x] The detail route reads stable semantic `media_id` values from the shared case data.
- [x] No patient, testimonial, dashboard, commercial metric or clinical outcome is fabricated.
- [x] Baseline, outcome, timeframe, denominator, budget, limitations, source and relationship fields remain visibly pending.
- [x] A page-level disclosure and `noindex,nofollow,noarchive` remain in place.
- [x] Invalid case IDs produce a deliberate unavailable state and a route back to the library.
- [ ] Replace every placeholder field with verified, client-approved evidence before public release.
- [ ] Replace neutral preview media with rights-cleared assets and factual alt text before public release.

## UX and accessibility

- [x] Semantic landmarks, headings, definition lists, ordered lists and adjacent-case navigation are used.
- [x] Keyboard-visible links and tap-safe controls are present.
- [x] The catalog provides a descriptive accessible name for every full-case link.
- [x] Previous and next case navigation wraps across the 25-record set.
- [ ] Complete 390×844 and 320px rendered reviews after approved content is loaded.
- [ ] Complete a screen-reader spot check after factual image alt text is approved.

## Release decision

- [ ] Founder approves the detail-page visual direction.
- [ ] Placeholder narratives and evidence fields are replaced.
- [ ] Claims, permissions, rights and consent are approved.
- [ ] Clean public slugs, canonical metadata and sitemap entries are generated.
- [ ] Production deployment is authorised.

**Current decision:** suitable for protected visual review only; blocked for public release.
