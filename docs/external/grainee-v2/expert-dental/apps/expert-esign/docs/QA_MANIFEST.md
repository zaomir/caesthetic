---
owner: QA + RAIMOV healthcare + Engineering
status: test-release-candidate
project: Expert Dental e-sign
route: /esign/
updated: 2026-09-04
standards:
  - docs/ssot/WEBSITE_STUDIO_STANDARD.md
  - docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md
decision: docs/founder-notes/DEC-737_website-studio-standard.md
---

# WEBSITE STUDIO QA — Expert Dental e-sign TEST

**DESIGN DISCOVERY:** complete from approved clinic operations, legal/version
SSOT and the existing PR #1164 interface; no new brand or clinical assumption
was introduced.

**REPRESENTATIVE SURFACE:** `apps/expert-esign/public/index.html` and its
authenticated/signer states in `public/app.js`; live screenshots remain a
post-deploy verification item.

**IMPECCABLE PASS:** source-level `/impeccable audit` completed for hierarchy,
copy boundaries, responsive CSS, TEST-state visibility and dependency surface.

**DETECT TARGET:** N/A with reason — this small internal PWA has no supported
design-detector integration in the repository; the Website Studio guard,
HTML/CSS lint, source contract tests and live smoke are the applicable checks.

## Canon and design discovery

- [x] RAIMOV, Expert Dental infrastructure and legal/version SSOT read.
- [x] Audience and action limited to staff-managed synthetic signing.
- [x] Signature idea: quiet clinical document workspace with an unavoidable TEST banner.
- [x] No marketing claims, testimonials, patient imagery or remote visual assets.
- [x] `DESIGN.md` and `SITE_MAP.md` recorded.

## Implementation checks

- [x] Semantic HTML shell, native controls and labels.
- [x] Tablet/mobile single-column reflow and touch-sized actions.
- [x] No animation dependency and no remote font/client tracking dependency.
- [x] TEST mode rejects names without TEST/DEMO/ТЕСТ/ДЕМО prefix.
- [x] Managed-device, doctor-approval and template-effectiveness gates are server-side.
- [x] WAHA, CRM callback, Zoho Sign, DocuSign and RFC3161 outbound calls disabled in TEST deploy.
- [x] Source and generated template SHA drift tests pass.
- [x] No secret or PHI file is part of the application package.

## Evidence

- Unit/source contract: 13 tests pass locally.
- Legal import: 19 templates; all `NOT_EFFECTIVE`.
- Container build: required in GitHub deploy workflow (local Docker unavailable).
- Desktop/mobile screenshots: pending deployed TEST smoke; no production visual approval claimed.
- Live route/health/deployed SHA: required before this manifest can be considered closed.

## Release decision

- [x] Source is eligible for isolated TEST deployment.
- [ ] Live TEST route and deployed SHA verified.
- [ ] Production or real-patient use approved.

Production and real-patient use remain blocked.
