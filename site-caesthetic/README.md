# CAESTHETIC — site-caesthetic

**Domain:** `caesthetic.com` (unchanged) · email brand `caesthetic.co`  
**Brand logos:** `assets/brand/logo-square.{svg,png}` (circular frames) · `assets/brand/logo-long.{svg,png}` (horizontal) · aliases under `/brand/`  
**Production logo:** `assets/brand/logo-square.{svg,png}` in header, footer, favicon and Open Graph metadata
**Public IA:** US independent aesthetic practices → Growth Score → 30-Day Sprint → optional Growth System

## Public pages (Phase 1)

| URL | Role |
|-----|------|
| `/` | Positioning → Growth Score |
| `/growth-score/` | Score explainer + 4-field form |
| `/audit/`, `/audits/`, `/multi-location-growth-score/` | Noindex synonym aliases to `/growth-score/` |
| `/sprint/` | Diagnosis-led 30-Day Growth Sprint · generated fixed price · written scope/payment inquiry |
| `/growth-system/` | Optional recurring ownership · client-specific Growth Budget with its Fixed Management Fee inside |
| `/pricing/` | Public comparison using generated pricing artifacts |
| `/about/` | Entity + public face Valerie Petra |
| `/legal/privacy/` | Privacy + CCPA/CPRA |
| `/legal/terms/` | Terms |
| `/score/[slug]/` | Private practice reports (`noindex`, not in sitemap) |
| `/score/` | Public-safe, noindex audit catalog; private client entries never render here |
| `/score/demo-*/` | Clearly labeled fictional, synthetic demonstrations (`noindex`, linked from `/growth-score/`) |

Growth Score source data lives in each route's `report.json`. Render and verify semantic HTML with:

```bash
node scripts/caesthetic/render-growth-score.mjs
node scripts/caesthetic/render-growth-score.mjs --check
node scripts/caesthetic/growth-score-project-catalog.mjs
node scripts/caesthetic/growth-score-project-catalog.mjs --check
node --test tests/caesthetic/growth-score-*.test.mjs
```

Every approved `site-caesthetic/score/**/report.json` is discovered automatically. The complete generated registry lives at `docs/audits/caesthetic/growth-score-projects.generated.json`; `/score/catalog.json` and `/score/index.html` contain only synthetic demos or client cases with explicit public-listing approval. Real client reports default to private.

## Not in the public IA

Sprint Extension, `/clinic-launch/`, `/launch/`, cases and product procurement pages. Sprint Extension remains an unpublished post-delivery option only when finite continuation is objectively justified.

## Config

`assets/js/caesthetic-config.js`:

- `ga4MeasurementId`, `metaPixelId` — optional approved measurement IDs; empty values mean no active GA4/Meta claim
- `phoneDisplay` / `phoneE164` — optional US phone for footer

## Deploy

```bash
bash scripts/deploy-caesthetic.sh
```

Origin: VPS2402 `185.216.214.28` → `/var/www/caesthetic.com/`  
Edge: Cloudflare Worker `grainee-caesthetic-public` (legacy redirects in `infra/cloudflare/router`).

## Project docs (strategy, specs)

Master authority: `docs/ssot/CAESTHETIC.md`. The read-only `docs/caesthetic/` Dropbox mirror is provenance and working detail, not a competing SSOT.

Public pricing exposes only the free Growth Score and the fixed Sprint. Sprint Extension stays internal, and recurring commercial values come only from a client-specific Commercial Schedule.

## Archive

Pre-rebuild multi-vertical HTML: `docs/archive/caesthetic-multivertical-2026-08/`.  
Private client packs remain under `private/`.

## Design

Clinical Editorial Intelligence — `DESIGN.md`, `assets/css/tokens.css`, `assets/css/caesthetic.css`.
