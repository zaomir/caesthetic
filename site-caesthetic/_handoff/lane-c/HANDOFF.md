# CAESTHETIC Lane C handoff

Date: 2026-07-30  
Lane: C - SEO/AEO, analytics, accessibility, performance and QA  
Branch: `cursor/caesthetic-full-rebuild-cc22`  
Production paths intentionally not edited by Lane C.

## Files delivered

| File | Purpose |
|---|---|
| `site-caesthetic/_handoff/lane-c/sitemap.xml` | New indexable-only sitemap with 10 canonical URLs |
| `site-caesthetic/_handoff/lane-c/robots.txt` | Robots policy for public site and blocked prefixes |
| `site-caesthetic/_handoff/lane-c/redirect-map.md` | Human-readable 30-row redirect map |
| `site-caesthetic/_handoff/lane-c/nginx-redirects.conf` | Nginx redirect include for legacy public URLs |
| `site-caesthetic/_handoff/lane-c/seo-metadata.json` | Per-URL title, description, canonical, OG/Twitter, robots, schema and breadcrumbs |
| `site-caesthetic/_handoff/lane-c/analytics.js` | Vanilla analytics layer using `dataLayer.push` and UTM session persistence |
| `site-caesthetic/_handoff/lane-c/caesthetic-analytics-snippet.html` | Include snippet and integration notes |
| `site-caesthetic/_handoff/lane-c/QA_CHECKLIST.md` | WCAG 2.2 AA, Web Vitals, forms, browser and analytics QA checklist |
| `docs/audits/caesthetic/LANE_C_SEO_ANALYTICS_PLAN_2026-07-30.md` | SEO/AEO/analytics/QA plan and assumptions |

## Integrator merge order

1. Merge Lane A/B content and shell changes first.
2. Confirm final public URL set. Current Lane C sitemap assumes these 10 indexable URLs:
   - `/`
   - `/about/`
   - `/dental/`
   - `/beauty/`
   - `/aesthetic-medicine/`
   - `/maps-reputation/`
   - `/assessment/`
   - `/infrastructure/`
   - `/partners/`
   - `/contact/`
3. Copy `site-caesthetic/_handoff/lane-c/sitemap.xml` to `site-caesthetic/sitemap.xml` only after confirming no additional Lane A/B public pages need indexation.
4. Copy `site-caesthetic/_handoff/lane-c/robots.txt` to `site-caesthetic/robots.txt`.
5. Apply redirects:
   - If production is Nginx-origin for CAESTHETIC, include `nginx-redirects.conf` inside the `server_name caesthetic.com` block before `location /`.
   - If production is Cloudflare Worker static routing, port the same 30 redirect rows to the Worker router instead of Nginx.
6. Move `analytics.js` to the final public asset path, recommended:
   - from `_handoff/lane-c/analytics.js`
   - to `site-caesthetic/assets/js/analytics.js`
7. Add the snippet from `caesthetic-analytics-snippet.html` to all public pages and `/go/` pages before `</body>`.
8. Translate `seo-metadata.json` into page `<head>` tags and JSON-LD injection:
   - canonical self on every indexable page;
   - `noindex,follow` on `/go/`;
   - Organization + WebSite on home;
   - Service where service copy exists;
   - BreadcrumbList where breadcrumbs are visible or IA-supported.
9. Run `QA_CHECKLIST.md` and write tester evidence to:
   - `docs/audits/caesthetic/QA_REPORT_2026-07-30.md`

## SEO/AEO decisions

- Sitemap excludes `/go/`, `/internal/`, `/paris/`, `/private/`, `/_handoff/`, old `/networks/`, old `/treatments/`, and old `/cities/`.
- `/go/` remains live but `noindex,follow`, one-CTA, UTM-persistent, and not in sitemap.
- No `AggregateRating` or `Review` schema.
- No `FAQPage` until visible FAQ content exists.
- No fake proof, fake metrics, fake testimonials or fake awards.

## Analytics contract

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

Debug:

```text
https://caesthetic.com/?debug_analytics=1
```

The analytics file does not include third-party IDs. It only pushes to `window.dataLayer` and logs payloads in debug mode.

## Pre-ship validation

Run before production deploy:

```bash
python3 - <<'PY'
import json, pathlib, xml.etree.ElementTree as ET
base = pathlib.Path('site-caesthetic/_handoff/lane-c')
ET.parse(base / 'sitemap.xml')
json.load(open(base / 'seo-metadata.json'))
print('lane-c xml/json ok')
PY
node --check site-caesthetic/_handoff/lane-c/analytics.js
```

Then run browser QA and production curl smoke after deploy:

```bash
curl -I https://caesthetic.com/
curl -I https://caesthetic.com/sitemap.xml
curl -I https://caesthetic.com/robots.txt
curl -I https://caesthetic.com/treatments/morpheus8/
curl -I https://caesthetic.com/go/maps-analysis/
```

Expected:

- root, sitemap and robots return 200;
- old treatment URL returns 301 to `/aesthetic-medicine/`;
- `/go/maps-analysis/` returns 200 and remains `noindex,follow`.

## Blockers / assumptions

- No production page/CSS/template files were edited by Lane C.
- Domain inventory says `caesthetic.com` is currently Cloudflare Worker-served; Nginx redirect handoff may need Worker translation.
- Final page count may change if Lane A/B add or remove public URLs after this handoff.
