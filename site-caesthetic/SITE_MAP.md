---
owner: CAESTHETIC
status: active
project: caesthetic
updated: 2026-08-13
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
---

# SITE_MAP — CAESTHETIC

| URL | Purpose | Audience intent | Primary proof | CTA | Indexing |
|---|---|---|---|---|---|
| `/` | Positioning and entry | Understand the offer | Four-Surface model | Get Growth Score | index |
| `/growth-score/` | Explain diagnosis and show examples | Evaluate method | Three labeled demos | Request Growth Score | index |
| `/sprint/` | Explain finite implementation | Evaluate paid next step | Scope and fixed pricing | Request scope and payment instructions | index |
| `/growth-system/` | Explain recurring operating ownership | Evaluate optional ongoing work | Growth Budget parts, minimum scope and evidence maturity | Discuss Growth System | index |
| `/pricing/` | Compare the public product ladder | Understand commercial model | Generated public-stage pricing and client-specific recurring boundaries | Choose a stage | index |
| `/about/` | Public identity and legal operator | Understand who leads delivery | Valerie Petra and entity details | Start with Growth Score | index |
| `/legal/cookies/` | Disclose measurement state | Understand tracking | Conditional analytics and no replay | Contact | index |
| `/score/demo-medical-aesthetics-search-gap/` | Demonstrate the full written score structure | Inspect report structure | Synthetic evidence ledger | View all demos | noindex |
| `/score/demo-injector-practice-booking-friction/` | Demonstrate insufficient evidence | Inspect publication threshold | Synthetic evidence ledger | View all demos | noindex |
| `/score/demo-aesthetics-clinic-reputation-gap/` | Demonstrate safe reputation diagnosis | Inspect review policy | Synthetic evidence ledger | View all demos | noindex |

## Internal linking

- `/` links to `/growth-score/` and `/growth-system/`; the global navigation links Growth Score, Sprint, Growth System and Pricing.
- `/growth-score/` links to every demo and the request form. `/pricing/` links to every public product stage.
- Every demo links back to the demo index. Demo routes stay out of the sitemap.

## Redirects and legacy

The retired Aurora sample remains a noindex explanation page and links to the labeled demos.

## Brand assets (not nav)

| URL | Purpose |
|---|---|
| `/assets/brand/logo-square.svg` · `.png` | Square mark for circular frames |
| `/assets/brand/logo-long.svg` · `.png` | Horizontal lockup |
| `/brand/logo-square.*` · `/brand/logo-long.*` | Short aliases to the same files |

## Excluded routes

Private client reports and `/private/` assets are not public navigation surfaces. Demo routes are crawlable only so their `noindex` directive can be applied.

The production header, footer, favicon and Open Graph metadata use the canonical assets under `/assets/brand/`.
