---
owner: Design + Engineering
status: implemented_noindex_review
project: caesthetic
route: /case-studies/
updated: 2026-09-05
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md, docs/ssot/IMAGE_ASSET_REGISTRY.md]
release: production_noindex_test_content
---

# WEBSITE STUDIO QA MANIFEST — CAESTHETIC Case Studies

## 2026-09-05 Connect4 How we work update

This entry supersedes the method-section description below; the earlier catalog prototype record is retained as history.

- Scope: `/case-studies/#how-we-work`, its scoped CSS, one approved system diagram, and semantic full-size media links. Hero, catalog, Full Case Page, intake and Growth Score implementations are unchanged.
- Audience / task: US practice owners understand how four coordinated surfaces support a clear patient decision, then inspect case evidence.
- Surface mode: persuade and read. Existing Clinical Editorial Intelligence tokens and typography are retained.
- Canon: `CAESTHETIC_CONNECT4_CONCEPT.md` v1.4.0; four surfaces with Lead Intake as a separate operational layer. Cross-Surface Consistency is the relationship between surfaces.
- Copy explains shared service/provider/location facts, coordinated specialist work, one accountable lead, honest review invitations and inquiry handling. No invented outcomes, guarantees, scripted patient reviews or review gating.
- Founder follow-up: explain specific lower-volume searches and their connection to service pages, blog articles, Maps, social posts and practice-owned comments/replies. Organic discovery is a goal, not a guaranteed rank or volume. Independent patient content is studied, not keyword-scripted.
- Additional services are separately scoped: feedback systems, inquiry automation, recruitment support, administrator training, call-center workflows and legal-adviser-coordinated documentation/consent processes. Grounded in `EXPERT_DENTAL_MONTH_1_RETROSPECTIVE.md`, `EXPERT_DENTAL_INFRASTRUCTURE.md` and `EXPERT_DENTAL_OMNICHANNEL_COMMUNICATIONS.md`; no claim that every proposed Expert Dental integration is already live or included in Connect4.
- Owner-supplied image is used byte-for-byte: `case.method.connect4.system`, SHA-256 `d08d308928b9e780a5974eee286ef79b66d7c3687a7c28fec2a7f5261443fd9a`, 1536 × 1024, 331,661 bytes. Its registry entry alone is approved for public use by the explicit image-placement request. Existing placeholder entries retain their restrictions.
- Responsive implementation: full uncropped image, readable HTML explanation, one-column text below 768px, and a native full-size-image link. The desktop image is an overview on mobile, not a claim that its embedded labels are readable at 320px.
- Accessibility: descriptive alt text, figure/caption, semantic heading hierarchy, ordered steps, existing keyboard-focus and 44px link rules; no new motion or dialog.
- Impeccable passes: clarify, distill, typeset, layout, adapt and scoped manual polish.
- Automated checks passed: JS syntax, original image hash/size, registry references, duplicate IDs, fragment targets, mobile rule presence; comparison confirms HTML outside the section and all prior media entries are unchanged.
- Detector attempted: `npx --offline impeccable detect site-caesthetic/case-studies/index.html`; unavailable with `ENOTCACHED`. This is an environment limitation, not a detector pass.
- Production cache correction: returning-browser smoke exposed an old cached media registry during rollout. Version the catalog stylesheet, media resolver and registry request together so the approved diagram and full-size link resolve for returning visitors. The live image SHA was verified against the supplied original.
- Browser preview limitation: the connected browser cannot reach the local static preview (`ERR_BLOCKED_BY_CLIENT`). No local rendered desktop/mobile or assistive-technology pass is claimed. Static responsive checks do not replace rendered testing. Production browser smoke follows deployment when reachable.
- Release scope is the approved Connect4 section. This change does not approve placeholder case evidence or change the route's existing indexing policy.


## 2026-09-04 implementation

- Page architecture is now `Hero → How we work → Case studies → CTA` in one continuous document with two section anchors.
- `How we work` exposes the canonical evidence-to-impact method in five owner-readable stages without changing the underlying operating loop.
- Goal chips moved into Case studies and now act as the same filter state as the goal select.
- Featured case is shown only for the unfiltered catalog; filtered results do not compete with an unrelated featured record.
- Catalog cards expose market, practice type, scale, constraint, first intervention, Before, After, delta, timeframe and evidence level.
- Desktop uses a two-column ruled evidence library; mobile uses a one-column sequence and a native filter sheet.
- Filter state is shareable in the URL and the Full Case Page receives a validated same-origin return path.
- Catalog and Full Case Page continue to fail closed on unavailable published data. Placeholder JSON remains a test fixture and is not a runtime fallback.
- The route remains `noindex,nofollow,noarchive` while the only published record is an explicitly labeled synthetic workflow test.

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/IMAGE_ASSET_REGISTRY.md`
- [x] `docs/ssot/CAESTHETIC_VISUAL_ASSET_LIBRARY.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from the approved CAESTHETIC canon and the founder's request for a 25-case desktop/mobile visual prototype.

**SURFACE MODE:** persuade and explore.

**REPRESENTATIVE SURFACES:** `/case-studies/` and `/case-studies/case/?id=case-01`; shared header and footer are the only connected surfaces changed.

- Audience: United States aesthetic-practice owners and directors comparing CAESTHETIC to their current growth setup.
- Primary task: find the closest operating problem and inspect the evidence structure before starting a Growth Score.
- Signature structure: one owner-goal selector, one featured case and a ruled editorial evidence library instead of a wall of marketing cards.
- Responsive model: complete desktop filter rail; one mobile Filters action opening a native bottom-sheet dialog; no sticky conversion CTA.
- Brand constraints: Clinical Editorial Intelligence, Source Serif 4 + IBM Plex Sans + IBM Plex Mono, clinical paper, navy and restrained signal crimson.
- Anti-patterns excluded: generic agency claims, invented dashboards, fake patient imagery, invented testimonials, spa stock, gradients, glass effects and unsubstantiated metrics.

**IMPECCABLE PASSES:** clarify, distill, typeset, layout, colorize and adapt are represented in the implemented preview. Final `/impeccable audit` remains open until rendered founder review and real evidence replacement.

**DETECT TARGET:** `/case-studies/`, `/assets/css/case-studies.css`, `/assets/js/case-studies.js` and `/assets/js/media-registry.js`.

- Runtime detector: N/A with reason — browser QA is intentionally deferred to the protected visual-review step; it is a release blocker below.
- Static detector result: repository CSS/HTML design lint is the required automated gate for this branch.

## Placeholder and media governance

- [x] Every replaceable visual is addressed by stable semantic `media_id`.
- [x] Physical asset paths exist only in `/media/registry.json`.
- [x] All preview media entries remain `state: placeholder` and are restricted to `local` and `protected-preview` channels.
- [x] Neutral SVGs preserve final aspect ratios without depicting clients, patients, treatment outcomes or dashboards.
- [x] Every case record is marked `isPlaceholder: true`, and all evidence fields say pending/not evidence.
- [x] A visible page-level disclosure states that names, markets, copy and images are placeholders.
- [x] The route contains `noindex,nofollow,noarchive` while content is unapproved.
- [ ] Replace all 26 media slots with approved assets, rights metadata and consent status before release.

## UX and accessibility

- [x] Native headings, landmarks, buttons, selects and dialog semantics are used.
- [x] Goal buttons expose pressed state; result counts use a polite live region.
- [x] Keyboard focus styles and minimum 44px touch targets are present.
- [x] Empty, loading-failure and incremental-loading states are defined.
- [x] Mobile rows retain case context, placeholder proof fields and tap-safe controls.
- [x] Ranking goal and explicit filter state use distinct labels.
- [x] Non-evidentiary thumbnails are removed from mobile result rows.
- [ ] Rendered desktop review at 1440×900.
- [ ] Rendered mobile review at 390×844 and 320px reflow.
- [x] Every placeholder case opens a complete, keyboard-accessible detail route with previous/next navigation.
- [ ] Screen-reader spot check after approved factual alt text is added.

## Content and evidence

- [x] Prototype metrics cannot display a fabricated baseline, outcome or timeframe.
- [x] Cases are separated into closest match, adjacent model and transferable pattern.
- [x] Final evidence requirements are stated on-page: baseline, denominator, timeframe, budget context, practice contribution, limitations, source and CAESTHETIC relationship.
- [ ] Replace placeholder cases with verified client-approved narratives.
- [ ] Complete claim-by-claim evidence, legal and consent review.
- [x] Add a non-indexable reusable placeholder detail route for protected visual review.
- [ ] Generate crawlable clean-slug case-detail pages only after their evidence is approved.

## Technical checks

- [x] `node --check site-caesthetic/assets/js/media-registry.js`.
- [x] `node --check site-caesthetic/assets/js/case-studies.js`.
- [x] `node scripts/caesthetic/check-case-studies-media.mjs` returns `CAESTHETIC_CASE_STUDIES_PLACEHOLDER_CHECK_PASS`.
- [x] `node scripts/caesthetic/check-case-study-contract.mjs` returns `CAESTHETIC_CASE_STUDY_CONTRACT_PASS` and fail-closes publishable records.
- [x] Shared header and footer include the route only in the review branch.
- [x] Production deployment is excluded from this draft review.
- [ ] Repository CI passes after this manifest is included.

## Release decision

- [ ] Visual direction approved by founder.
- [ ] All placeholder content replaced.
- [ ] All required registry entries approved for the public channel.
- [ ] Sitemap and SEO release metadata approved.
- [ ] Production deployment authorised.

**Current decision:** blocked for public release; suitable only for protected visual review.
