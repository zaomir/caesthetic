# CAESTHETIC Lane C SEO / AEO / analytics / QA plan

Date: 2026-07-30  
Lane: C  
Branch: `cursor/caesthetic-full-rebuild-cc22`  
Scope: Handoff artifacts only; production `site-caesthetic/sitemap.xml`, `robots.txt`, page HTML, shared shell and CSS are not edited by this lane.

## SSOT loaded

- `docs/ROUTER.md`
- `docs/ssot/ROUTING_MAP.md` (deprecated; ROUTER is canonical)
- `docs/ssot/COMPLIANCE_ZONES.md`
- `docs/ssot/I18N_MULTICURRENCY.md`
- `docs/ssot/NARRATIVE.md`
- `docs/ssot/CAESTHETIC.md`
- `docs/ssot/CAESTHETIC_TRANSFORMATION_NETWORK.md`
- `docs/ssot/WEBSITE_STUDIO_STANDARD.md`
- `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`
- `docs/ssot/DOMAIN_INVENTORY.md`

## URL structure

Canonical host: `https://caesthetic.com`

### Indexable URLs

| URL | Intent | Primary CTA |
|---|---|---|
| `/` | Brand and product routing | Growth assessment |
| `/about/` | Trust / company explanation | Assessment or contact |
| `/dental/` | Dental clinic growth system | Dental assessment |
| `/beauty/` | Beauty business growth system | Beauty assessment |
| `/aesthetic-medicine/` | Aesthetic medicine practice growth | Aesthetic assessment |
| `/maps-reputation/` | Maps / reputation diagnostic | Maps analysis |
| `/assessment/` | Cross-product assessment intake | Submit assessment |
| `/infrastructure/` | Demand infrastructure explanation | Partner / assessment |
| `/partners/` | Provider partnership | Partner form |
| `/contact/` | Contact and routing | Email / partner form |

### Non-indexable

| URL family | Rule |
|---|---|
| `/go/` | `noindex,follow`; one CTA; UTM persistence; not in sitemap |
| `/internal/` | robots disallow; not in sitemap |
| `/paris/` | robots disallow; not in sitemap; legacy/dev pages redirected where public |
| `/private/` | robots disallow; not in sitemap |
| `/_handoff/` | robots disallow; not in sitemap |

### Hreflang

- Current production content is EN-only.
- Use self-referencing canonical on every page.
- Do not add RU/FR/AR alternate links until translated pages exist.
- If future languages launch, follow `I18N_MULTICURRENCY.md`: language is URL/path driven; currency/payment logic is separate and not inferred from language.

## Semantic core

### High-frequency / commercial

- dental marketing - commercial
- dental clinic marketing - commercial
- beauty salon marketing - commercial
- aesthetic clinic marketing - commercial
- med spa marketing - commercial
- medical aesthetics marketing - commercial
- reputation management for local business - commercial
- Google Maps reputation management - commercial
- local business marketing - commercial
- clinic growth system - commercial

### Mid-frequency

- dental practice growth system - commercial
- maps reputation analysis - commercial
- multi location reputation management - commercial
- aesthetic practice growth - commercial
- beauty business growth - commercial
- clinic website and reputation system - commercial
- treatment demand marketing - commercial
- medical spa consultation conversion - commercial
- local ratings and reviews audit - commercial
- provider partnership aesthetic clinics - commercial

### Long-tail / AEO prompts

- how to improve Google Maps reputation for a clinic - informational
- why dental clinics lose implant patients before the first call - informational
- how beauty salons can improve repeat bookings - informational
- what should a clinic growth assessment include - informational
- how to compare ratings across multiple locations - informational
- why aesthetic clinics should market treatments instead of discounts - informational
- how to diagnose weak local trust signals - informational
- how maps reviews affect patient choice - informational
- what is demand infrastructure for specialist practices - informational
- how to connect reputation, website and front desk conversion - informational

## Title / Description / H1 drafts

Copywriter handoff: these are SEO drafts. Adapt final copy to `docs/ssot/NARRATIVE.md` and CAESTHETIC tone.

| URL | Title <= 60 | Description <= 160 | H1 direction |
|---|---|---|---|
| `/` | CAESTHETIC - Specialist Practice Growth Systems | Marketing, maps reputation and conversion systems for dental, beauty and aesthetic medicine practices. | Built to be found. Trusted. Chosen. |
| `/about/` | About CAESTHETIC - Evidence-Led Growth | CAESTHETIC connects maps, reputation, websites, acquisition and conversion for specialist practices. | Specialist growth, built around evidence. |
| `/dental/` | Dental Marketing System - CAESTHETIC | A connected growth system for dental clinics: treatment demand, maps, websites, reputation and conversion. | A growth system for the whole clinic. |
| `/beauty/` | Beauty Business Marketing - CAESTHETIC | Local discovery, reputation, booking surfaces and retention systems for salons and beauty businesses. | Turn local visibility into booked clients. |
| `/aesthetic-medicine/` | Aesthetic Medicine Marketing - CAESTHETIC | Treatment-led growth, doctor authority, maps reputation and consultation conversion for aesthetic practices. | Build demand around expertise, not discounts. |
| `/maps-reputation/` | Maps Reputation - CAESTHETIC | Maps and reputation management for local and multi-location businesses, ratings, reviews and profiles. | See how your business is judged before the first call. |
| `/assessment/` | Growth Assessment - CAESTHETIC | Request a structured assessment of discovery, reputation, website, acquisition and conversion constraints. | Find the constraint before choosing the solution. |
| `/infrastructure/` | Network Infrastructure - CAESTHETIC | How CAESTHETIC network infrastructure moves demand from map assets to consultation routing. | Network Infrastructure |
| `/partners/` | Provider Partnership - CAESTHETIC | Partner with CAESTHETIC to reach treatment-specific demand and increase qualified consultations. | Partner With CAESTHETIC |
| `/contact/` | Contact CAESTHETIC | Contact CAESTHETIC for provider network, partnership and specialist growth system inquiries. | Get in Touch |

## Schema.org plan

Allowed schema types in this handoff:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Service`

Omitted until content supports them:

- `FAQPage`
- `Article`
- `Person`

Forbidden:

- `AggregateRating`
- `Review`
- fake testimonials, fake awards, fake client logos, fake metrics

Implementation source:

- `site-caesthetic/_handoff/lane-c/seo-metadata.json`

## Internal linking

### From home

- Home -> `/dental/` with anchor "Explore dental"
- Home -> `/beauty/` with anchor "Explore beauty"
- Home -> `/aesthetic-medicine/` with anchor "Explore aesthetics"
- Home -> `/maps-reputation/` with anchor "Explore maps"
- Home -> `/assessment/` with anchor "Get a growth assessment"

### From product pages

- `/dental/` -> `/assessment/?industry=dental`
- `/beauty/` -> `/assessment/?industry=beauty`
- `/aesthetic-medicine/` -> `/assessment/?industry=aesthetic`
- `/maps-reputation/` -> `/go/maps-analysis/` (noindex funnel) or `/assessment/?industry=maps`

### From trust / operational pages

- `/about/` -> `/assessment/`, `/contact/`
- `/infrastructure/` -> `/partners/`, `/assessment/`
- `/partners/` -> `/contact/`
- `/contact/` -> `/partners/` for clinic/operator inquiries

## Sitemap / robots

- Add to sitemap: yes for the 10 indexable URLs only.
- Exclude from sitemap: `/go/`, `/internal/`, `/paris/`, `/private/`, `/_handoff/`, old `/networks/`, old `/treatments/`, old `/cities/`.
- Robots: allow root and disallow blocked prefixes.
- Canonical: every indexable page self-canonical.

## Redirect plan

Source files:

- `site-caesthetic/_handoff/lane-c/redirect-map.md`
- `site-caesthetic/_handoff/lane-c/nginx-redirects.conf`

Redirect count: 30.

Key consolidation:

- Old `/treatments/*` -> `/aesthetic-medicine/`
- Old `/networks/*` -> `/aesthetic-medicine/`
- Old `/cities/*` -> `/assessment/` with market context
- Old `/paris/*` -> `/assessment/` with market/product context
- Partner aliases -> `/partners/`
- Infrastructure aliases -> `/infrastructure/`

## Analytics plan

Source files:

- `site-caesthetic/_handoff/lane-c/analytics.js`
- `site-caesthetic/_handoff/lane-c/caesthetic-analytics-snippet.html`

Events:

- `page_view`
- `product_select`
- `case_open`
- `cta_click`
- `form_start`
- `form_step_complete`
- `form_submit`
- `phone_click`
- `email_click`
- `whatsapp_click`

Dimensions:

- `industry`
- `product`
- `offer`
- `landing_page`
- `language`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `utm_id`
- `locations_count`

Rules:

- UTM persisted in `sessionStorage`.
- No invented third-party IDs.
- Push to `window.dataLayer`.
- Debug with `?debug_analytics=1`.
- Do not push raw phone numbers, emails, patient medical data or free-text form messages.

## Accessibility and performance budgets

Detailed checklist:

- `site-caesthetic/_handoff/lane-c/QA_CHECKLIST.md`

Headline budgets:

- LCP <= 2.5s mobile p75 target
- INP <= 200ms
- CLS <= 0.10
- TTFB <= 800ms
- JS transfer <= 80 KB gzip excluding future third-party adapters
- CSS transfer <= 80 KB gzip

WCAG:

- Target WCAG 2.2 AA.
- Keyboard navigation, focus, landmarks, one H1, labels, contrast, reduced motion and form states are release blockers.

## QA report stub path

Tester should fill:

```text
docs/audits/caesthetic/QA_REPORT_2026-07-30.md
```

The directory `docs/audits/caesthetic/` exists in the repository.

## SEO metrics

### Month 1

- Index coverage: all 10 indexable URLs discovered and indexed.
- Technical: no duplicate canonical, no sitemap-only 404, no noindex mismatch.
- Analytics: 95%+ public page views include page, product/industry and UTM dimensions when applicable.

### Month 3

- Rankings: top 30 for at least 5 mid/long-tail commercial queries.
- Organic traffic: first qualified non-brand clicks to product pages.
- Conversion: baseline assessment and maps-analysis conversion rate established.

### Month 6

- Rankings: top 10 for at least 5 long-tail queries and top 20 for at least 3 commercial mid-tail queries.
- Organic traffic: measurable growth in dental, beauty, aesthetic medicine and maps-reputation clusters.
- Conversion: improve assessment/form conversion against Month 3 baseline; segment by industry and locations_count.

## Blockers / assumptions

- Production serving layer may be Cloudflare Worker, not Nginx. Redirects may need Worker translation.
- Final public URL set can change when Lane A/B content is merged.
- CAESTHETIC has no public prices in current page content; `Product`/`Offer` schema is intentionally not used.
- No public FAQ content confirmed; `FAQPage` schema is intentionally not used.
