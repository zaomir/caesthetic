# CAESTHETIC redirect map — Lane C handoff

Date: 2026-07-30  
Canonical host: `https://caesthetic.com`  
Status: handoff only; integrator applies to production routing after Lane A/B merge.

## Rules

- Use `301` for all public legacy URLs below.
- Keep `/go/`, `/internal/`, `/paris/`, `/private/`, and `/_handoff/` out of sitemap.
- `/go/` stays `noindex,follow` and must not be redirected here unless a later DEC changes funnel architecture.
- Redirect old treatment/network/city URLs to the closest new product or assessment route.

## Redirects

| # | Old URL | New URL | Reason |
|---:|---|---|---|
| 1 | `/networks/` | `/aesthetic-medicine/` | Old network hub replaced by aesthetic medicine product page |
| 2 | `/networks/skin-rejuvenation/` | `/aesthetic-medicine/` | Old skin rejuvenation network consolidated |
| 3 | `/treatments/` | `/aesthetic-medicine/` | Old technology hub consolidated |
| 4 | `/treatments/morpheus8/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 5 | `/treatments/hifu/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 6 | `/treatments/rf-microneedling/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 7 | `/treatments/hydrafacial/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 8 | `/treatments/prx-t33/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 9 | `/treatments/laser-treatments/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 10 | `/treatments/skin-rejuvenation/` | `/aesthetic-medicine/` | Treatment-specific page consolidated |
| 11 | `/treatments/hair-restoration/` | `/aesthetic-medicine/` | High-ticket aesthetic demand consolidated |
| 12 | `/treatments/body-contouring/` | `/aesthetic-medicine/` | High-ticket aesthetic demand consolidated |
| 13 | `/treatments/recovery-technologies/` | `/aesthetic-medicine/` | Old low-intent page consolidated |
| 14 | `/treatments/longevity/` | `/aesthetic-medicine/` | Old low-intent page consolidated |
| 15 | `/cities/` | `/assessment/` | City hub replaced by assessment entry |
| 16 | `/cities/paris/` | `/assessment/?market=paris` | Old city page replaced by assessment with market context |
| 17 | `/cities/london/` | `/assessment/?market=london` | Old city page replaced by assessment with market context |
| 18 | `/cities/dubai/` | `/assessment/?market=dubai` | Old city page replaced by assessment with market context |
| 19 | `/paris/` | `/assessment/?market=paris` | Paris development area is noindex/internal-facing |
| 20 | `/paris/morpheus8/` | `/assessment/?market=paris&amp;product=morpheus8` | Paris treatment dev page consolidated |
| 21 | `/paris/hifu/` | `/assessment/?market=paris&amp;product=hifu` | Paris treatment dev page consolidated |
| 22 | `/paris/rf-microneedling/` | `/assessment/?market=paris&amp;product=rf-microneedling` | Paris treatment dev page consolidated |
| 23 | `/paris/hydrafacial/` | `/assessment/?market=paris&amp;product=hydrafacial` | Paris treatment dev page consolidated |
| 24 | `/paris/prx-t33/` | `/assessment/?market=paris&amp;product=prx-t33` | Paris treatment dev page consolidated |
| 25 | `/provider-partnership/` | `/partners/` | Partner alias |
| 26 | `/partnerships/` | `/partners/` | Partner alias |
| 27 | `/partners.html` | `/partners/` | Static-file legacy alias |
| 28 | `/network-infrastructure/` | `/infrastructure/` | Infrastructure alias |
| 29 | `/demand-infrastructure/` | `/infrastructure/` | Infrastructure alias |
| 30 | `/infrastructure.html` | `/infrastructure/` | Static-file legacy alias |

## Explicit non-redirects

| URL family | Handling |
|---|---|
| `/go/` | Keep route, `noindex,follow`, one CTA, UTM persistence, excluded from sitemap |
| `/internal/` | Block from robots and sitemap; admin/token-gated implementation only |
| `/private/` | Block from robots and sitemap; private client artifacts only |
| `/_handoff/` | Block from robots and sitemap; never deploy as public indexable content |
