---
owner: QA + Design + Engineering
status: release-candidate
project: caesthetic
route: /lead-to-revenue-check/
updated: 2026-09-03
standards:
  - docs/ssot/WEBSITE_STUDIO_STANDARD.md
  - docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md
decision: docs/founder-notes/DEC-737_website-studio-standard.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — CAESTHETIC Lead-to-Revenue Check

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`
- [x] `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from approved product, report, commercial and visual canon.

- Known context reused: fixed $500 diagnostic; optional after Growth Score; one-time credit toward a direct-continuation $2,500 Sprint; eight-stage internal path; authorized non-clinical evidence only.
- Material unknowns: none that change the approved service-page direction.
- Questions asked: N/A — the user asked for autonomous implementation and the product/brand decisions are explicit in SSOT.
- Desired effect/action: understand why the Check is conditional, see what it examines, and request written evidence scope before payment.
- Audience and context: US aesthetic-practice owner/operator, primarily mobile email/social visit with desktop review also expected.
- Brand attributes: evidence-led, calm, inspectable, commercially explicit, privacy-aware.
- Anti-attributes: generic agency service menu, forced funnel step, checkout pressure, card soup, luxury gloss, invented outcome proof.
- Signature idea: a ruled three-way decision boundary followed by the canonical eight-stage internal path.
- Reference principles: reuse the existing Clinical Editorial Intelligence system, pricing block and evidence-led report grammar.
- Real proof/assets: product scope and commercial terms only; no testimonial, logo, patient, revenue or result proof is claimed.
- Hard constraints: no fifth surface, no outcome guarantee, no unnecessary PHI, no password-by-email, no public reusable payment URL, no primary-header promotion.

## Impeccable execution

**SURFACE MODE:** persuade

**REPRESENTATIVE SURFACE:** `/lead-to-revenue-check/`; connected Home, Growth Score, Pricing, Sprint, Growth System and footer placements were reviewed for funnel hierarchy.

**IMPECCABLE PASSES:**

- [x] `/impeccable clarify`: separates public diagnosis, internal uncertainty and implementation before explaining features.
- [x] `/impeccable distill`: one service decision, one price, one deliverable set and one scope-request action; no fourth-stage ladder framing.
- [x] `/impeccable typeset`: existing project type scale, display/body roles and readable editorial line lengths only.
- [x] `/impeccable layout`: three-way branch, eight-stage evidence path and split commercial rule use information structure rather than generic cards.
- [x] `/impeccable colorize`: project tokens only; diagnostic state colors are not used without actual stage evidence.
- [x] `/impeccable adapt`: all new grids collapse to one column at the existing 800px breakpoint; native actions inherit the mobile full-width pattern.
- [x] `/impeccable animate`: N/A; motion would not improve comprehension.
- [x] `/impeccable delight`: restrained stage numbering makes the internal path memorable without decorative imagery.
- [x] Final `/impeccable audit`: hierarchy, truth, price, legal boundary, semantic HTML and responsive rules inspected in source; live browser evidence is recorded after deployment.

**DETECT TARGET:** `/lead-to-revenue-check/`, `assets/css/growth.css`, shared contextual entry points and generated Growth Score output.

- Detector/CI result: repository design lint, HTMLHint, Website Studio guard and targeted CAESTHETIC tests are required on PR.
- Findings resolved: automatic report upsell removed; CTA count made fail-closed; hardcoded price duplication removed through generated pricing; private payment label constrained to an allowlist.
- Approved exceptions: production browser and performance measurements are post-deploy release evidence because this connector has no branch preview URL. Owner: QA + Engineering. Risk: low; static content remains useful without JavaScript and the route reuses production CSS/JS. Review: same release, before final handoff.

## Strategy and truth

- [x] Audience, intent and CTA are explicit.
- [x] Price, credit and scope come from active CAESTHETIC SSOT.
- [x] No invented facts, proof, testimonials, results, metrics or logos.
- [x] No placeholder or mock evidence is present.
- [x] The Check remains conditional and the free Growth Score remains the primary entry product.

## Visual and responsive evidence

- [x] Source-level desktop composition reviewed: hero split, three-column branch, four-column stage path and commercial split.
- [x] Source-level mobile composition reviewed: all Check grids collapse to one column at ≤800px.
- [x] Brand remains recognisable without a logo or unrelated imagery.
- [x] Signature decision boundary and eight-stage map are visible without client JavaScript.
- [x] No generic gradient, glassmorphism, floating orb, stock imagery or decorative chart.
- [ ] Production desktop screenshot/overflow check — post-deploy release gate.
- [ ] Production mobile 390px/320px screenshot, overflow and touch-target check — post-deploy release gate.
- [ ] Production 200% zoom/reduced-motion check — post-deploy release gate.

## Accessibility

- [x] Skip link, main landmark, one H1, ordered path and native links/details are present.
- [x] Information does not rely on color alone.
- [x] CTA remains a native keyboard-focusable link.
- [x] Main content is available without JavaScript.
- [ ] Production keyboard/focus/zoom spot-check — post-deploy release gate.

## Performance

- [x] No new raster image, video, font, framework or third-party script.
- [x] Page reuses existing CSS and deferred JavaScript assets.
- [x] Static HTML owns all decision-critical content.
- [ ] Production CLS/console/network spot-check — post-deploy release gate.

## SEO/AEO

- [x] Unique title, H1, description, canonical and Open Graph metadata.
- [x] Indexable canonical route added to sitemap and crawlable footer.
- [x] Service JSON-LD matches visible name, price, provider and scope.
- [x] Contextual links use the canonical route.

## Reliability, privacy and legal

- [x] Scope request is email-first and does not invent a public checkout.
- [x] The private payment request remains signed-order-controlled.
- [x] Authorized non-clinical evidence, least privilege, no unnecessary PHI and no password-by-email boundaries are explicit.
- [x] Legal Terms, Payment Terms and Privacy are aligned with the product.
- [x] Rollback is the prior deployed CAESTHETIC SHA through the allowlisted deploy channel.

## Test evidence

- Route smoke: new page, price, inquiry and sitemap markers added to both deploy smoke contracts.
- Browser test: post-deploy release gate at desktop, 390px and 320px.
- Accessibility test: semantic source review complete; production keyboard/focus/zoom spot-check pending.
- Performance baseline: no new media or third-party dependency; production console/network spot-check pending.
- Production smoke: required before final handoff.

## Exceptions

Only the same-release post-deploy browser evidence described above. It does not permit shipment handoff until the live checks pass.

## Release decision

- [x] Source review score ≥85/100.
- [x] No source-review category below 70%.
- [x] No P0 source blockers.
- [ ] Website Studio + Impeccable production gate closes after live browser QA.
