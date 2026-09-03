---
owner: CAESTHETIC
status: active
project: caesthetic
updated: 2026-09-03
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
---

# SITE_MAP — CAESTHETIC

| URL | Purpose | Audience intent | Primary proof | CTA | Indexing |
|---|---|---|---|---|---|
| `/` | Positioning and entry | Understand the offer | Four-Surface model | Get Growth Score | index |
| `/growth-score/` | Explain public-evidence diagnosis and show examples | Evaluate method | Three labeled demos | Request Growth Score | index |
| `/lead-to-revenue-check/` | Explain the conditional internal-path diagnostic | Resolve internal outcome uncertainty after a Growth Score | Authorized evidence boundary, eight-stage path and fixed commercial terms | Request Check scope | index |
| `/audit/` · `/audits/` · `/multi-location-growth-score/` | Synonym compatibility aliases | Reach the canonical audit product | Canonical handoff | Continue to `/growth-score/` | noindex |
| `/sprint/` | Explain finite implementation | Evaluate paid next step | Scope and fixed pricing | Request scope and payment instructions | index |
| `/growth-system/` | Explain recurring operating ownership | Evaluate optional ongoing work | Growth Budget parts, minimum scope and evidence maturity | Discuss Growth System | index |
| `/pricing/` | Compare the public product ladder | Understand commercial model | Generated public-stage pricing and client-specific recurring boundaries | Choose a stage | index |
| `/beauty-salons/` | English beauty-salon vertical | Diagnose salon growth constraints | Salon demand route and synthetic evidence ledger | Request Salon Growth Score | index |
| `/es/salones-de-belleza/` | Spanish beauty-salon vertical | Diagnose salon growth constraints in Spanish | Same localized salon decision system | Request Salon Growth Score | index |
| `/ru/salony-krasoty/` | Russian beauty-salon vertical | Diagnose salon growth constraints in Russian | Same localized salon decision system | Request Salon Growth Score | index |
| `/fr/salons-de-beaute/` | French beauty-salon vertical | Diagnose salon growth constraints in French | Same localized salon decision system | Request Salon Growth Score | index |
| `/about/` | Public identity and legal operator | Understand who leads delivery | Valerie Petra and entity details | Start with Growth Score | index |
| `/support/` | Customer support and safe-contact guidance | Resolve a service, billing, privacy or technical question | Verified support address and legal entity | Email customer support | index |
| `/privacy/` | Compatibility alias for external merchant profiles | Reach the canonical Privacy Policy | Canonical redirect to `/legal/privacy/` | Continue to policy | noindex |
| `/terms/` | Compatibility alias for external merchant profiles | Reach the canonical Terms of Use | Canonical redirect to `/legal/terms/` | Continue to terms | noindex |
| `/legal/cookies/` | Disclose measurement state | Understand tracking | Conditional analytics and no replay | Contact | index |
| `/score/` | Safe project catalog | Inspect publishable examples | Synthetic or explicitly approved public cases only | Request Growth Score | noindex |
| `/score/demo-medical-aesthetics-search-gap/` | Demonstrate the full written score structure | Inspect report structure | Synthetic evidence ledger | View all demos | noindex |
| `/score/demo-injector-practice-booking-friction/` | Demonstrate insufficient evidence | Inspect publication threshold | Synthetic evidence ledger | View all demos | noindex |
| `/score/demo-aesthetics-clinic-reputation-gap/` | Demonstrate safe reputation diagnosis | Inspect review policy | Synthetic evidence ledger | View all demos | noindex |

## Internal linking

- `/` links to `/growth-score/` and `/growth-system/`; primary navigation remains focused on the aesthetic-practice funnel. The Lead-to-Revenue Check stays a conditional branch rather than a fourth mandatory stage.
- The global footer links the isolated `/beauty-salons/` vertical; each salon locale links all four locale routes directly.
- `/growth-score/` links to every demo, the safe `/score/` catalog, the request form and the conditional `/lead-to-revenue-check/` branch. `/pricing/` links to every public product stage and conditional diagnostic.
- The global footer links `/lead-to-revenue-check/`; Sprint, Growth System, About, Support, the audit catalog and relevant localized vertical pages explain the branch only where internal outcome uncertainty is material.
- Every demo links back to the demo index. `/score/`, demos and all real report routes stay out of the sitemap.

## Locale contract

The salon routes are standalone static documents with reciprocal `hreflang` values `en`, `es`, `ru`, `fr` and `x-default` to `/beauty-salons/`. Locale choice is explicit; there is no automatic IP or browser-language redirect.

## Redirects and legacy

The retired Aurora sample remains a noindex explanation page and links to the labeled demos. `/privacy/` and `/terms/` are noindex compatibility aliases for external merchant settings and immediately hand off to the canonical `/legal/` routes. `/audit/`, `/audits/` and `/multi-location-growth-score/` preserve safe query/hash data and hand off to the canonical `/growth-score/` product route.

Salon aliases keep safe query/UTM and 301 to the English Beauty Salons route:

| From | To |
|---|---|
| `/beauty/` | `/beauty-salons/` |
| `/go/new-salon-launch/` | `/beauty-salons/` |
| `/go/salon-growth/` | `/beauty-salons/` |

## Brand assets (not nav)

| URL | Purpose |
|---|---|
| `/assets/brand/logo-square.svg` · `.png` | Square mark for circular frames |
| `/assets/brand/logo-long.svg` · `.png` | Horizontal lockup |
| `/brand/logo-square.*` · `/brand/logo-long.*` | Short aliases to the same files |

## Excluded routes

Private client reports and `/private/` assets are not public navigation surfaces. The `/score/` catalog generator excludes private client names, locations and unguessable routes. Catalog/demo routes are crawlable only so their `noindex` directive can be applied.

The production header, footer, favicon and Open Graph metadata use the canonical assets under `/assets/brand/`.
