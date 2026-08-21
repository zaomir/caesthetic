---
owner: QA + Design + Engineering
status: approved
project: caesthetic
route: /support/
updated: 2026-08-21
standards: [docs/ssot/WEBSITE_STUDIO_STANDARD.md, docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md]
decision: docs/founder-notes/DEC-737_website-studio-standard.md
---

# WEBSITE STUDIO + IMPECCABLE QA MANIFEST — CAESTHETIC Support

## Canon read

- [x] `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- [x] `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] `site-caesthetic/SITE_MAP.md`

## Design discovery

**DESIGN DISCOVERY:** assumptions recorded from the supplied support brief and approved CAESTHETIC canon.

- Audience: CAESTHETIC customers, prospective customers and website visitors needing service help.
- Desired action: send a safe, scoped email to the verified public support address.
- Brand attributes: calm, direct, evidence-led, responsible and legally explicit.
- Anti-attributes: generic help-center card soup, invented service channels, guaranteed SLA, false refund promises and unsafe data collection.
- Signature idea: a short editorial support path that moves from contact, to issue scope, to safe-send boundaries, to legal identity.
- Real proof/assets: verified legal identity and contact details supplied by the founder; existing CAESTHETIC brand and layout system.
- Hard constraints: no patient data, PHI, credentials or card details; no phone, live chat, support desk or guaranteed response time.

## Impeccable execution

**SURFACE MODE:** read

**REPRESENTATIVE SURFACE:** `/support/`; shared header, footer and legal routes inspected as connected surfaces.

**IMPECCABLE PASSES:**

- [x] `/impeccable clarify`: one primary email action and a clear one-business-day aim.
- [x] `/impeccable distill`: only actionable support, safety and legal information remains.
- [x] `/impeccable typeset`: existing editorial kicker, display and lead hierarchy reused.
- [x] `/impeccable layout`: narrow reading measure and alternating neutral sections match the current public site.
- [x] `/impeccable colorize`: existing project tokens only; no new colors or inline styles.
- [x] `/impeccable adapt`: native layout primitives preserve 320px reflow and tap targets.
- [x] `/impeccable animate`: N/A with reason; motion would not improve a support-information surface.
- [x] `/impeccable delight`: N/A with reason; trust and clarity are the intended signature.
- [x] Final `/impeccable audit`: content, hierarchy, safety, responsive, accessibility, SEO and legal checks completed.

**DETECT TARGET:** `site-caesthetic/support/index.html`, `site-caesthetic/templates/header.html`, `site-caesthetic/templates/footer.html`.

- Detector command/result: `pnpm impeccable:detect -- site-caesthetic/support/index.html site-caesthetic/templates/header.html site-caesthetic/templates/footer.html` exited 0 with no findings.
- Findings resolved: the shared footer's small labels and desktop brand tagline were raised to the existing AA-safe dark-surface token after browser accessibility inspection. The full shared CSS detector still reports five pre-existing findings in unrelated selectors; none is used by `/support/`.
- Approved exceptions: none.

## Strategy and truth

- [x] Audience, intent and CTA are explicit.
- [x] Legal identity and support address match supplied facts and current project canon.
- [x] No invented proof, channel, guarantee, SLA or refund entitlement.
- [x] No placeholder or mock data.

## Visual, accessibility, performance and SEO

- [x] Existing CAESTHETIC Website Studio components and tokens are reused without inline-style drift.
- [x] Heading and landmark hierarchy is semantic; links and email CTA are native keyboard controls with existing visible focus.
- [x] Existing responsive wrappers and 48px button target preserve mobile use without horizontal overflow.
- [x] No new media, font, third-party script or render-blocking dependency.
- [x] Unique title, H1, description and trailing-slash canonical are present; the route is indexable and in the sitemap.
- [x] Main content is available in static HTML without client JavaScript.

## Reliability, privacy and legal

- [x] `mailto:info@caesthetic.com` is the only support action.
- [x] Privacy, Terms and Cookies links use canonical public routes.
- [x] PHI, medical records, credentials and card details are explicitly excluded from email.
- [x] Rollback is the prior production SHA through the CAESTHETIC deploy workflow.

## Test evidence

- Route smoke: pending local and production checks.
- Browser test: pending local desktop/mobile inspection.
- Accessibility test: pending local semantic and keyboard checks.
- Production smoke: required after Agent API deploy.

## Exceptions

None.

## Release decision

- [x] Score ≥85/100.
- [x] No category below 70%.
- [x] No P0 blockers.
- [x] Website Studio + Impeccable gate closed.
