---
owner: Design + Engineering
status: pass
project: CAESTHETIC
route: /
updated: 2026-08-01
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
impeccable: docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md
---

# CAESTHETIC homepage — Impeccable QA manifest

## Canon read
- [x] `START.md`, root `AGENTS.md`, Website Studio and Impeccable SSOT
- [x] `docs/ssot/CAESTHETIC.md`
- [x] `site-caesthetic/DESIGN.md`
- [x] Existing production homepage, component CSS and July production QA

## Design discovery
- Audience: owners and operators of dental, beauty and aesthetic medicine practices.
- Decision: request a diagnostic assessment before buying more marketing.
- Desired perception: forensic, specialist, calm, commercially sharp.
- Anti-attributes: generic agency, SaaS dashboard, beauty spa, cosmetic luxury, AI card soup.
- Signature idea: expose the hidden break between demand and booked treatment.
- Assumption: illustrative metrics are explicitly labelled and are not presented as client results.

## Surface and representative work
- Surface mode: `persuade`.
- Representative surface: homepage `/`.
- Diagnostic narrative replaces product catalogue rhythm.
- Production components added: case file, diagnostic journey, evidence plate, route index.
- Global execution layer: `/assets/css/caesthetic-impeccable.css`, loaded idempotently by `caesthetic-config.js`.

## Impeccable passes
- [x] `clarify`: one commercial question and one primary conversion.
- [x] `distill`: 13 repeated sections reduced to five narrative movements.
- [x] `layout`: asymmetric hero, evidence-first hierarchy, ruled editorial composition.
- [x] `typeset`: mono evidence labels separated from serif arguments and sans UI.
- [x] `colorize`: only existing project tokens; signal colour encodes faults and priorities.
- [x] `adapt`: 900px and 560px reflow rules; no fixed desktop grid retained.
- [x] `delight`: one signature case-file/evidence language, no decorative motion.
- [x] `polish`: repeated panel/kicker rhythm reduced globally.

## Truth and proof
- [x] No client names, testimonials or outcomes invented.
- [x] Sample values labelled `Illustrative output` or `illustrative`.
- [x] Claims describe operating logic, not guaranteed results.

## Static self-check
- [x] One H1 and one primary assessment CTA.
- [x] Semantic sections, articles and list roles.
- [x] Existing header/footer and JS contracts preserved.
- [x] Existing canonical, Organization JSON-LD and contact data preserved.
- [x] New CSS uses project tokens except dark-rule values already present in the existing system.
- [x] Responsive rules collapse all new multi-column structures.

## Detector review
Manual equivalent completed against repository anti-slop rules:
- generic gradient/glassmorphism: 0
- rounded card/pill soup: 0
- placeholder proof surfaces: 0 on homepage
- repeated 3/4-card product catalogue: 0 on homepage
- vague primary proposition: replaced with explicit patient-loss diagnosis
- unresolved finding: production visual smoke required after deploy

## Release decision
PASS FOR DEPLOY. Production screenshot and HTTP smoke must confirm asset loading, reflow and CTA routes. Roll back homepage, config and new CSS together if regression is found.
