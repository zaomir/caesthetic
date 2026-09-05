---
owner: CAESTHETIC
status: active
project: caesthetic
updated: 2026-09-05
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
funnel_standard: docs/ssot/CAESTHETIC_FUNNEL_ROUTING_STANDARD.md
---

# SITE_MAP — CAESTHETIC

| URL | Purpose | Audience intent | Primary proof | CTA | Indexing |
|---|---|---|---|---|---|
| `/` | Positioning and entry | Understand the offer | Four-Surface model | Free Growth Score; $500 Check; $2,500 Sprint | index |
| `/connect4/` | Explain Connect4, owner imagery and the optional engagement path | Understand implementation, handoff and annual continuation | Three approved responsive image pairs plus one alternate; not client results | Free Growth Score request (Name + Email); optional stages explained, no forced bundle | index |
| `/growth-score/` | Explain public-evidence diagnosis, show examples and accept the free request | Evaluate method / start diagnosis | Three labeled demos + dedicated four-field intake | Start free Growth Score | index |
| `/lead-to-revenue-check/` | Explain the always-available smaller paid internal-path diagnostic | Start smaller before implementation or inspect post-enquiry uncertainty | Authorized evidence boundary, eight-stage path and fixed commercial terms | Start $500 Check | index |
| `/audit/` · `/audits/` · `/multi-location-growth-score/` | Synonym compatibility aliases | Reach the canonical audit product | Canonical handoff | Continue to `/growth-score/` | noindex |
| `/sprint/` | Explain finite implementation | Evaluate or request the paid implementation step | Scope and fixed pricing | Request Sprint · $2,500; start smaller with $500 Check | index |
| `/growth-system/` | Explain recurring operating ownership | Evaluate optional ongoing work | Evidence/adoption/impact operating loop | Ask about Growth System | index |
| `/pricing/` | Compare the public product ladder and optional tripwire | Understand commercial model | Generated public-stage pricing and client-specific recurring boundaries | Choose Score / Check / Sprint / System | index |
| `/beauty-salons/` | English beauty-salon vertical | Diagnose salon growth constraints | Salon demand route and synthetic evidence ledger | Start four-field Salon Growth Score | index |
| `/es/salones-de-belleza/` | Spanish beauty-salon vertical | Diagnose salon growth constraints in Spanish | Same localized salon decision system | Start four-field Salon Growth Score | index |
| `/ru/salony-krasoty/` | Russian beauty-salon vertical | Diagnose salon growth constraints in Russian | Same localized salon decision system | Start four-field Salon Growth Score | index |
| `/fr/salons-de-beaute/` | French beauty-salon vertical | Diagnose salon growth constraints in French | Same localized salon decision system | Start four-field Salon Growth Score | index |
| `/about/` | Public identity and legal operator | Understand the operating model | Entity details and evidence standard | Start with Growth Score | index |
| `/support/` | Customer support and safe-contact guidance | Resolve a service, billing, privacy or technical question | Verified support address and legal entity | Ask a Question (Name + Email) or direct email | index |
| `/privacy/` | Compatibility alias for external merchant profiles | Reach the canonical Privacy Policy | Canonical redirect to `/legal/privacy/` | Continue to policy | noindex |
| `/terms/` | Compatibility alias for external merchant profiles | Reach the canonical Terms of Use | Canonical redirect to `/legal/terms/` | Continue to terms | noindex |
| `/legal/cookies/` | Disclose measurement state | Understand tracking | Conditional analytics and no replay | Support / footer routes | index |
| `/pay/` | Private payment shell | Pay a written Order | Order/invoice/token + payer authorization | Stripe ACH or Wise only with valid private token | noindex |
| `/score/` | Safe project catalog | Inspect publishable examples | Synthetic or explicitly approved public cases only | Open report / Free Growth Score | noindex |
| `/score/demo-medical-aesthetics-search-gap/` | Demonstrate the full written score structure | Inspect report structure | Synthetic evidence ledger | Sprint + $500 Check + Question decision block | noindex |
| `/score/demo-injector-practice-booking-friction/` | Demonstrate insufficient evidence | Inspect publication threshold | Synthetic evidence ledger | Sprint + $500 Check + Question decision block | noindex |
| `/score/demo-aesthetics-clinic-reputation-gap/` | Demonstrate safe reputation diagnosis | Inspect review policy | Synthetic evidence ledger | Sprint + $500 Check + Question decision block | noindex |

## Internal linking

- `/` sends the primary acquisition path directly to the dedicated `/growth-score/` intake. The $500 Check is always available as a smaller paid tripwire and the $2,500 Sprint remains the implementation product.
- The primary header stays focused on Growth Score, Sprint, Growth System, Pricing, About and Support. Case Studies remain direct-accessible but hidden from primary navigation while the catalog is still being populated.
- The global footer exposes Free Growth Score, Lead-to-Revenue Check · $500, 30-Day Growth Sprint · $2,500, Growth System and an `Ask a question` escape hatch.
- `/growth-score/` contains the dedicated four-field form (`Name`, `Work email`, `Practice name`, `City, State`). No generic popup precedes it.
- `/lead-to-revenue-check/` is always accessible by customer choice. A Growth Score may separately *recommend* it only when the approved reason and supporting evidence satisfy the Check authority.
- `/sprint/` and `/pricing/` expose the $500 Check as a smaller optional paid route rather than a mandatory gateway.
- A standalone or Multi-Location parent Growth Score final decision area shows Sprint + $500 Check + Question. If the Check is evidence-backed recommended, it may receive visual priority; otherwise Sprint normally remains primary.
- A Multi-Location focus child does not create its own commercial decision and returns to the network parent.
- The global footer links the isolated `/beauty-salons/` vertical; each salon locale links all four locale routes directly and uses the same four-field Score intake contract.
- Every demo links back to the demo index. `/score/`, demos and all real report routes stay out of the public sitemap.

## Public form contract

| Funnel | Visible named controls before payment |
|---|---:|
| Free Growth Score | 4 |
| Salon Growth Score | 4 |
| Sprint request | 2 |
| Lead-to-Revenue Check request | 2 |
| Growth System inquiry | 2 |
| Ask a Question | 2 |
| Private payment payer authorization | 4 |

No pre-payment form may exceed four named controls. Delivery/access questions belong after the commercial step is confirmed and, where appropriate, after payment.

## Payment routing

The public site does not contain a reusable Stripe/Wise checkout URL. Paid products follow:

`commercial request → written scope / signed Order → private /pay/?token=… → payer authorization → configured provider`

Stripe ACH is the recommended US-bank route where configured; Wise is the alternate provider rail. An eligible completed $500 Check may receive the one-time $500 credit toward the next $2,500 Sprint, leaving a $2,000 balance; written Order/backend state determines eligibility.

## Sender-domain public-route contract

| Sender entry | Edge scope | Public behavior |
|---|---|---|
| `https://caesthetic.co/` | Full host | 308 to canonical CAESTHETIC home, with safe attribution only |
| `https://bebofix.com/caesthetic/` | `/caesthetic/` only | Retired bridge; HTTP 404 |
| `https://bebonow.com/caesthetic/` | `/caesthetic/` only | Retired bridge; HTTP 404 |
| `https://bototox.com/caesthetic/` | `/caesthetic/` only | No generic public historical-reactivation bridge; HTTP 404 |
| `https://grainee.com/caesthetic/` | `/caesthetic/` only | Retired bridge; HTTP 404 |
| `https://toxifillers.com/caesthetic/` | No CAESTHETIC Worker route | HTTP 404 from its owning runtime |

The sender-domain Worker redirects only the direct `caesthetic.co` alias to `https://caesthetic.com/`, preserving only allowlisted attribution values. Retired/non-public bridges return 404 and cannot redirect to a user-supplied destination. Existing roots on BeboFix, BeboNow, Bototox/Toxifillers and GRAINEE remain outside the CAESTHETIC route.

## Locale contract

The salon routes are standalone static documents with reciprocal `hreflang` values `en`, `es`, `ru`, `fr` and `x-default` to `/beauty-salons/`. Locale choice is explicit; there is no automatic IP or browser-language redirect.

## Redirects and legacy

The retired Aurora sample remains a noindex explanation page and links to the labeled demos. `/privacy/` and `/terms/` are noindex compatibility aliases for external merchant settings and immediately hand off to the canonical `/legal/` routes. `/audit/`, `/audits/` and `/multi-location-growth-score/` preserve safe query/hash data and hand off to the canonical `/growth-score/` product route. The retired outreach verification route has no redirect authority and returns HTTP 404.

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

## Spoken versioned private report views

- `/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v2/` — unlisted RU direct-link presentation v2; original parent URL remains v1.
- `/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v2/` — paired protected EN presentation v2.
- Presentation children reference existing approved source reports and are not separate audit/catalog records; neither is added to the public sitemap.
