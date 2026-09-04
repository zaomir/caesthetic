---
owner: RAIMOV healthcare + Engineering
status: test-runtime
version: 1.0
project: Expert Dental e-sign
updated: 2026-09-04
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
---

# DESIGN.md — Expert Dental e-sign TEST

## Design thesis

The surface is a restrained clinical operations tool: it helps a named staff
member select an approved template, verify the synthetic patient context and
hand a managed iPad to the signer without presenting the tool as a public
marketing page or as proof of legal effectiveness.

## Audience and decision

- Primary audience: Expert Dental administrator, doctor and compliance staff.
- Visit context: staff-authenticated clinic workflow on a managed iPad.
- Main decision: whether the synthetic document is ready for test signing.
- Primary CTA: begin the administrator-controlled signing session.

## Must be

1. Explicitly marked TEST and synthetic-data-only.
2. Legible, calm and operable by touch.
3. Fail-closed when a legal, medical, provider or managed-device gate is open.

## Must not be

1. A generic promotional landing page.
2. A substitute for SQNS or a second CRM.
3. A claim that any current form is effective for real patients.

## Anti-attributes

Promotional, playful, luxurious, social-first, diagnostic, or visually
ambiguous about the TEST status.

## Signature idea

A quiet clinical document workspace whose strongest visual element is the
unavoidable TEST/synthetic-data status, followed by one clear workflow action.

## Visual and interaction system

- Signature: high-contrast clinic document workspace, not decorative imagery.
- Palette: white, deep navy text, muted blue controls; red TEST banner injected
  by the canonical deploy script.
- Typography: system sans-serif for predictable Cyrillic rendering.
- Layout: single-column workflow, compact cards, touch-sized controls.
- Motion: none required; state changes remain understandable without animation.
- Responsive: full-width controls below tablet breakpoint; no horizontal data
  tables on the signer route.

## Accessibility and performance

- Native landmarks, labels and buttons are retained.
- Keyboard focus uses browser-visible focus and semantic controls.
- No remote fonts, marketing trackers or third-party client scripts.
- The shell is small; signed PDF generation and evidence storage are server-side.

## Approved exceptions

No production visual approval is asserted. This artifact governs the isolated
TEST runtime only; real-patient activation remains blocked by VERSION_REGISTRY.
