# CAESTHETIC Lane C QA checklist

Date: 2026-07-30  
Scope: CAESTHETIC full site rebuild handoff layer: SEO/AEO, analytics, accessibility, performance and release QA.  
Tester report path: `docs/audits/caesthetic/QA_REPORT_2026-07-30.md` (tester-owned stub path; directory already exists).

## 1. Route and SEO smoke

### Indexable URLs

- [ ] `GET /` returns 200, canonical `https://caesthetic.com/`.
- [ ] `GET /about/` returns 200, canonical self.
- [ ] `GET /dental/` returns 200, canonical self.
- [ ] `GET /beauty/` returns 200, canonical self.
- [ ] `GET /aesthetic-medicine/` returns 200, canonical self.
- [ ] `GET /maps-reputation/` returns 200, canonical self.
- [ ] `GET /assessment/` returns 200, canonical self.
- [ ] `GET /infrastructure/` returns 200, canonical self.
- [ ] `GET /partners/` returns 200, canonical self.
- [ ] `GET /contact/` returns 200, canonical self.

### Non-indexable / blocked URLs

- [ ] `/go/maps-analysis/` returns 200 with `<meta name="robots" content="noindex,follow">`.
- [ ] `/go/` URLs are not included in sitemap.
- [ ] `/internal/` is blocked in robots and not included in sitemap.
- [ ] `/paris/` is blocked in robots and not included in sitemap.
- [ ] `/private/` is blocked in robots and not included in sitemap.
- [ ] `/_handoff/` is blocked in robots and not included in sitemap.

### Sitemap / robots

- [ ] `sitemap.xml` is valid XML.
- [ ] Sitemap contains exactly 10 indexable URLs.
- [ ] Sitemap excludes `/go/`, `/internal/`, `/paris/`, `/private/`, `/networks/`, `/treatments/`, `/cities/`.
- [ ] `robots.txt` contains `Allow: /`, the required disallow lines and `Sitemap: https://caesthetic.com/sitemap.xml`.

## 2. Redirect QA

Run after integrator applies redirects.

- [ ] All 30 rows in `redirect-map.md` return `301`.
- [ ] `Location` header uses `https://caesthetic.com` canonical host or root-relative target behind the same host.
- [ ] No redirect chain longer than one hop.
- [ ] Old treatment URLs redirect to `/aesthetic-medicine/`.
- [ ] Old city URLs redirect to `/assessment/` with market context.
- [ ] Old Paris dev URLs redirect to `/assessment/` with market and product context.
- [ ] Partner aliases redirect to `/partners/`.
- [ ] Infrastructure aliases redirect to `/infrastructure/`.

## 3. Structured data / AEO

- [ ] Organization JSON-LD uses CAESTHETIC name, logo, URL, public email, phone and London address.
- [ ] WebSite JSON-LD appears on homepage only unless integrator intentionally shares site graph globally.
- [ ] Service JSON-LD appears only where page content supports a service.
- [ ] BreadcrumbList JSON-LD matches visible IA and canonical URLs.
- [ ] No `AggregateRating`, `Review`, fake testimonial, fake award, fake client logo or fake metric schema.
- [ ] No FAQPage schema unless visible FAQ copy exists on the page.
- [ ] Schema validates in Rich Results Test or Schema.org validator with warnings triaged.
- [ ] AI/AEO answerability: homepage clearly states who CAESTHETIC serves, what it does and what the next action is in plain HTML.

## 4. Accessibility - WCAG 2.2 AA

### Keyboard and focus

- [ ] All navigation, CTA and form controls are reachable by keyboard.
- [ ] Focus order follows visual order.
- [ ] Visible focus indicator meets contrast requirements.
- [ ] No keyboard trap in mobile menu or forms.
- [ ] Skip link exists or first-tab focus path is acceptable for short static pages.

### Semantics

- [ ] One logical `<h1>` per page.
- [ ] Heading hierarchy does not skip levels for layout only.
- [ ] Header, main and footer landmarks are present.
- [ ] Forms have explicit labels associated with inputs.
- [ ] Required fields expose `required` and clear error messaging.
- [ ] Decorative images use empty `alt`; meaningful images have useful `alt`.

### Contrast and readability

- [ ] Text contrast >= 4.5:1 for normal text.
- [ ] Large text contrast >= 3:1.
- [ ] Non-text UI contrast >= 3:1.
- [ ] Text remains readable at 200% zoom.
- [ ] Mobile text line length and spacing remain usable.

### Motion and interaction

- [ ] No essential information depends on hover only.
- [ ] Any animation respects `prefers-reduced-motion`.
- [ ] Form success/failure states are announced or focusable.

## 5. Performance budgets

Test on mobile throttling and desktop, with cache disabled and then warm cache.

| Metric | Budget |
|---|---:|
| LCP | <= 2.5s mobile p75 target |
| INP | <= 200ms |
| CLS | <= 0.10 |
| TTFB | <= 800ms |
| Total blocking time lab proxy | <= 200ms |
| JS transfer on public pages | <= 80 KB gzip excluding shared analytics adapter |
| CSS transfer | <= 80 KB gzip |
| Image hero candidate | <= 200 KB compressed, explicit dimensions |

Checks:

- [ ] CSS and JS are served with compression.
- [ ] Static assets have appropriate cache headers.
- [ ] Logo and SVG assets do not block LCP.
- [ ] No render-blocking third-party scripts added by Lane C.
- [ ] Analytics snippet does not require a third-party network request.

## 6. Forms and conversion QA

### Assessment / product forms

- [ ] Required fields block empty submit.
- [ ] Email field rejects invalid addresses.
- [ ] Phone/WhatsApp field accepts international format and does not require local-only masks.
- [ ] Success state is visible and focusable.
- [ ] Failure state is visible and does not erase user input.
- [ ] Duplicate submit is prevented or harmless.
- [ ] `industry`, `product`, `offer`, `landing_page`, `language`, `utm_*`, `locations_count` dimensions are available for analytics.

### `/go/` funnel rules

- [ ] Page has `noindex,follow`.
- [ ] Page has one primary CTA.
- [ ] UTM values persist in `sessionStorage`.
- [ ] No sitemap inclusion.
- [ ] No broad navigation that distracts from the CTA.

## 7. Analytics QA

Use `?debug_analytics=1`.

- [ ] `page_view` fires once per page load.
- [ ] `cta_click` fires for primary buttons.
- [ ] `product_select` fires for product links (`/dental/`, `/beauty/`, `/aesthetic-medicine/`, `/maps-reputation/`, `/assessment/`, `/partners/`).
- [ ] `case_open` fires for `[data-case-open]`, `[data-case-id]` or opened `<details>`.
- [ ] `form_start` fires once per form.
- [ ] `form_step_complete` fires after valid step interaction.
- [ ] `form_submit` fires on submit.
- [ ] `phone_click`, `email_click`, `whatsapp_click` fire on matching links.
- [ ] No phone number, email value, patient data or free-text message value is pushed to `dataLayer`.
- [ ] UTM values persist across same-tab navigation through `sessionStorage`.

## 8. Browser and device matrix

### Desktop

- [ ] Chrome latest, macOS/Windows.
- [ ] Safari latest, macOS.
- [ ] Firefox latest, macOS/Windows.
- [ ] Edge latest, Windows.

### Mobile / tablet

- [ ] Safari iOS latest on iPhone.
- [ ] Chrome Android latest.
- [ ] iPad Safari landscape and portrait.

### Breakpoints

- [ ] 360px mobile.
- [ ] 390px mobile.
- [ ] 768px tablet.
- [ ] 1024px tablet/desktop.
- [ ] 1440px desktop.

## 9. Security and privacy

- [ ] No secrets or admin tokens in public HTML/JS.
- [ ] No patient medical data stored in analytics payloads.
- [ ] No third-party analytics IDs invented by Lane C.
- [ ] Contact and provider forms avoid logging raw personal data in client-side console outside debug payloads.
- [ ] `/internal/` and `/private/` remain non-indexable and excluded from sitemap.

## 10. Release evidence to attach

- [ ] XML validation output.
- [ ] JSON validation output for `seo-metadata.json`.
- [ ] JS syntax check output for analytics.
- [ ] Redirect smoke output for 30 redirect rows.
- [ ] Lighthouse or WebPageTest summary.
- [ ] Axe or equivalent accessibility output.
- [ ] Analytics debug screenshots or console excerpts.
- [ ] Final production curl smoke for sitemap, robots and representative pages.
