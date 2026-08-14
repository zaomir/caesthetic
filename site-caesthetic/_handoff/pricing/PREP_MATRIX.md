# CAESTHETIC Pricing — §1 Prep Matrix

**Date:** 2026-07-31  
**Branch:** `cursor/caesthetic-pricing-page-22f0`  
**SSOT sync:** `origin/main` @ `1d3e93a91` — **0 ahead / 0 behind**  
**Workdir note:** Cloud agent uses `/workspace` (clone of `zaomir/grainee-v2`); VDS path `/var/www/grainee-v2` not mounted.

## Architecture findings

| Item | Finding |
|------|---------|
| Site root | `site-caesthetic/` — static HTML, Clinical Editorial Intelligence |
| Locale today | EN-only at root paths (`lang="en"`). No `/ru/` or `/en/` trees yet. |
| Canonical pricing URL | **New:** `/pricing/` (EN default) + `/ru/pricing/` (RU) with hreflang |
| Pricing SSOT path | `site-caesthetic/src/config/pricing.ts` (project-relative `src/config/pricing.ts`) |
| Assessment | `/assessment/` — keep form; CTAs deep-link with query only |
| Commercial brief CTA | No dedicated `/brief/` page → Fixed Fee CTA → `/assessment/?engagement=fixed` |
| Partnership CTA | `/assessment/?engagement=partnership` |
| Telegram | **No existing CAESTHETIC deeplink** in repo/prod. Helper pattern from Raimov; config key only — **do not invent** `t.me` URL. Fallback: `/contact/` + mailto/tel |
| Analytics | `site-caesthetic/assets/js/analytics.js` — extend events in Lane C |
| AI routes | Untouched; remain EVO `/ru/text`, `/en/text` only |
| Deploy | Explicitly **out of scope** until founder command (§4.12) |

## Baseline public prices

**Confirmed:** `https://caesthetic.com/pricing/` → **404**. No hardcoded public service fees in product HTML.

Private Expert Dental estimate v7 (non-public) reference amounts (do not change those private files):

- Maps Full Management option: **$1,500**
- Task worked example Fixed Fee: **$4,000**

### Service matrix (first public publish — numbers live only in pricing.ts)

| service_id | service_name_en | fixed_fee_usd | billing_period | partnership_minimum | revenue_share | activation_commitment | external_costs_excluded | amount_source |
|---|---|---|---|---|---|---|---|---|
| dental | Dental growth system | 4000 | monthly | 1200 | 0.07 | 0.03 | true | task example / vertical parity |
| beauty | Beauty growth system | 4000 | monthly | 1200 | 0.07 | 0.03 | true | vertical parity with dental |
| aesthetic_medicine | Aesthetic medicine growth | 4000 | monthly | 1200 | 0.07 | 0.03 | true | vertical parity with dental |
| maps_reputation | Maps reputation | 1500 | monthly | 450 | 0.07 | 0.03 | true | private estimate Full Management option |
| websites_seo | Websites & SEO | 2500 | monthly | 750 | 0.07 | 0.03 | true | solution package (first publish) |
| patient_acquisition | Patient acquisition | 3000 | monthly | 900 | 0.07 | 0.03 | true | solution package (first publish) |
| crm_conversion | CRM & conversion | 2000 | monthly | 600 | 0.07 | 0.03 | true | solution package (first publish) |
| personal_brand | Personal brand | 1500 | monthly | 450 | 0.07 | 0.03 | true | private Media tier reference |
| multi_location | Multi-location | 3500 | monthly | 1050 | 0.07 | 0.03 | true | solution package (first publish) |

**Formula:** `monthly_partnership_fee = max(fixed_fee * 0.30, adjusted_collected_revenue * 0.07)`  
**Bundles:** 7% once per business; minimum = 30% × sum(selected Fixed Fees).

## Worked example (page)

- Fixed Fee: $4,000  
- Partnership minimum: $1,200  
- Adjusted revenue: $40,000 → 7% = $2,800  
- Monthly fee: **$2,800**

## Baseline prod smoke (prep)

| URL | HTTP |
|-----|------|
| https://caesthetic.com/ | 200 |
| https://caesthetic.com/pricing/ | 404 (expected pre-ship) |
| https://caesthetic.com/assessment/ | (existing) |
| https://caesthetic.com/dental/ | (existing) |

Lighthouse / screenshots: deferred to Lane C local smoke after page exists (no pricing page to baseline yet).

## Lane exclusivity

| Zone | Owner |
|------|-------|
| `site-caesthetic/src/config/pricing.ts` + i18n pricing copy | Lane A |
| `site-caesthetic/pricing/`, `site-caesthetic/ru/pricing/`, `site-caesthetic/src/components/pricing/*`, pricing CSS/JS UI | Lane B |
| `tests/caesthetic/*`, analytics event defs/tests | Lane C |
| Header/Footer/nav, sitemap, robots, layout metadata | Final integrator only |
