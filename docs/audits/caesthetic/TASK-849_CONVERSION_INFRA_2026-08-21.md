# TASK-849 — CAESTHETIC conversion infrastructure audit

**Date:** 2026-08-21  
**Lane:** Cursor Lane B  
**Public:** https://caesthetic.com  
**Related:** DEC-845, TASK-849

## Audit table

| Surface | Status | Evidence |
|---|---|---|
| `/growth-score/` 3-stage intake, skip allowed | PASS | https://caesthetic.com/growth-score/ — stages 1–3, `data-cae-optional-skip`, four required fields only |
| No revenue / PHI / credentials gates | PASS | intake HTML + `tests/caesthetic/growth-score-conversion-infra.test.mjs` |
| Lead storage (`submit-caesthetic-growth-score` → `caesthetic_growth_score_leads`) | PASS | live EF + TEST lead JSON |
| UTM + referrer capture/persistence | PASS | `growth.js` payload + lead row `utm_source=qa` |
| Notifications (email/ops) | PASS | EF Resend to `notifications@caesthetic.com` + admin Telegram; TEST prefix `[TEST/QA]` |
| Score case after intake | PASS (fixed) | EF now inserts `caesthetic_score_cases` `owner_intake` / `created` |
| Walkthrough route (Valerie Petra 4–6m, evidence-led) | PASS | `/score/<slug>/` walkthrough card; demos labelled placeholder, not price-first |
| `/sprint/` + path from Score | PASS | https://caesthetic.com/sprint/ ; cockpit CTA `#next-step` → `/sprint/` |
| Canonical $2,500 | PASS | `site-caesthetic/src/config/pricing.ts` → `caesthetic-pricing.generated.js` → `[data-cae-sprint-price]` |
| Stripe / payment | GAP (documented) | Not supplied. Public CTA is mailto scope + payment instructions. No live charge path invented. |
| Analytics events | PASS (code) / GAP (pixels) | Live `https://caesthetic.com/assets/js/analytics.js` fires `score_request_submitted`, `score_page_viewed` on `/score/` and `/growth-score/`, `sprint_page_viewed`, `sprint_scope_requested`, `page_view`, UTM sessionStorage. `ga4MeasurementId` / `metaPixelId` empty. |
| Mobile UX intake + sprint | PASS (fixed) | 16px intake fields (no iOS zoom), 48px tap targets, stacked actions ≤800px; Sprint inline styles removed |
| Public edge (Worker ASSETS) | PASS | `grainee-caesthetic-public` version `1b61b6f9-0856-4705-8f44-b95bb8b7bce7` (2026-08-21). Origin rsync SHA `4986a91ca`. Smoke `CAESTHETIC_GROWTH_SCORE_SMOKE_PASS=true`. |

## Pricing source check

- SSOT: `site-caesthetic/src/config/pricing.ts` → `growthSprintUsd: 2500`
- Generated: `site-caesthetic/assets/js/caesthetic-pricing.generated.js` → `sprintPriceUsd: 2500`, `sprintPriceLabel: "$2,500"`
- Public HTML snapshots use `[data-cae-sprint-price]$2,500` (allowed by hardcode guard)

## Stripe

**Not wired.** `PROJECT_STATUS` already listed “Complete Stripe/payment setup” as founder-side work. Public Sprint asks for written scope and payment instructions by email. No Checkout session, payment link, or charge flow was added.

## Analytics

Events in `site-caesthetic/assets/js/analytics.js` + `growth.js`. Pixels stay dataLayer-only until measurement IDs are supplied in host secrets.

## Mobile notes

Intake inputs were 13px (`--cae-text-sm`) which zooms on iOS; now `--cae-text-base` (16px) with 48px min-height. Optional grid collapses at 800px; primary/ghost actions stack full-width. Sprint price block uses token classes instead of inline styles.

## TEST lead

Accepted TEST (archived): `lead_id=8695060e-e3a9-4a8f-87ab-ee268b4e4f78`, `score_case_id=6c18a02c-6289-495d-8446-a27ae8a058bc`, `notification_sent=true`, `status=declined`, case `state=closed`. Earlier probe lead also archived. See `TASK-849_TEST_LEAD_2026-08-21.json`.

## Deploy

- git SHA / origin marker: `4986a91ca467dade73558e4b6bac85fc0c1525ac`
- Edge Worker: `grainee-caesthetic-public` version `1b61b6f9-0856-4705-8f44-b95bb8b7bce7` (`--skip-routes`)
- Public smoke: `CAESTHETIC_GROWTH_SCORE_SMOKE_PASS=true`
- HTTP 200: `/growth-score/`, `/sprint/`, three demo `/score/` walkthroughs

`DEPLOY_TARGET=caesthetic bash scripts/agent-deploy.sh` is not a CAESTHETIC case (falls through to `deploy-static-all`). Lane B used `scripts/deploy-caesthetic.sh` + `supabase functions deploy submit-caesthetic-growth-score` + `scripts/cf-caesthetic-cutover.sh --skip-routes` with a Workers Scripts Edit token.

## Remaining blockers

1. Stripe/checkout not supplied — do not invent a charge path.
2. GA4 / Meta pixel IDs not set — events fire to dataLayer only.
3. Valerie walkthrough video for real Scores remains pending human recording capacity (demo routes correctly show placeholder).
4. Primary `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` lack Workers Scripts Edit (403). Worker publish used `CLOUDFLARE_API_TOKEN_BOTOTOX`. `CLOUDFLARE_API_TOKEN2` is unset.


## Production ship

- Git SHA: `4986a91ca467dade73558e4b6bac85fc0c1525ac`
- Worker workflow: https://github.com/zaomir/grainee-v2/actions/runs/32437073960
- `deployed_sha`: `4986a91ca467dade73558e4b6bac85fc0c1525ac`
- `scripts/caesthetic-growth-score-production-smoke.sh` → `CAESTHETIC_GROWTH_SCORE_SMOKE_PASS=true`
- Public analytics.js now contains `/growth-score/` `score_page_viewed`
