# CAESTHETIC Pricing — Lane B UI handoff

**Lane:** B — pricing page UI/UX
**Routes:** `/pricing/` (EN), `/ru/pricing/` (RU)
**Compliance:** public B2B commercial page; no per-patient fee, bought reviews, guaranteed outcomes or fake offer schema

## Files

- `pricing/index.html` — EN page and SEO metadata.
- `ru/pricing/index.html` — RU parity page and locale metadata.
- `assets/css/pricing.css` — editorial pricing ledgers, responsive states and accessible disclosures using only `var(--cae-*)` colour tokens.
- `assets/js/pricing-page.js` — loads the central JSON/API, renders all services, calculation example, revenue definition, eligibility, exclusions and FAQ.
- `assets/js/telegram.js` — reads optional `window.CAESTHETIC_API.telegramDeepLink`; falls back to the configured `/contact/` route without embedding a Telegram URL.

## Page structure

1. Pricing hero and model jump actions.
2. Equal Fixed Fee and Growth Partnership model comparison; Partnership is the visual primary where eligible.
3. All service rows from `assets/data/pricing.json`.
4. Partnership operating sequence.
5. Worked example from `workedExample`.
6. Demand → Response → Booking → Purchase → Repeat flow.
7. Individual-patient attribution limitation and Adjusted Collected Revenue definition.
8. Eligibility checklist from `eligibilityIds`.
9. Separate-cost exclusions from `exclusionIds`.
10. Keyboard-native FAQ and example disclosures.
11. Fixed, Partnership and contact closing actions.

## Runtime dependencies

- Lane A: `assets/data/pricing.json` and `assets/js/pricing-api.js`.
- Lane C: `assets/js/analytics.js` and `assets/js/pricing-analytics.js`.
- Existing shell: `templates/header.html`, `templates/footer.html`, `assets/js/caesthetic.js`.

Amounts, rates, formula labels and CTA destinations are read from the pricing config. HTML and page CSS contain no commercial fee amounts or rate literals.

## CTA and analytics wiring

- Fixed: config `ctas.fixed` → `pricing_fixed_cta`.
- Partnership: config `ctas.partnership` → `pricing_partnership_cta`.
- Contact: config `ctas.contact`; `telegram.js` may replace it only when `telegramDeepLink` is configured.
- Model controls use `aria-pressed`; example and FAQ use native `<details>`.
- Events: `pricing_view`, `pricing_model_toggle`, `pricing_fixed_cta`, `pricing_partnership_cta`, `pricing_example_expand`, `pricing_faq_expand`.
- Event payloads contain only allowlisted model/placement/locale/ID state; no fee, revenue, medical or form values.

## Local smoke

```bash
python3 -m http.server 8765 --directory site-caesthetic
curl -fsSI http://127.0.0.1:8765/pricing/
curl -fsSI http://127.0.0.1:8765/ru/pricing/
node tests/caesthetic/run-pricing.mjs
pnpm impeccable:detect -- site-caesthetic/pricing site-caesthetic/ru/pricing site-caesthetic/assets/css/pricing.css site-caesthetic/assets/js/pricing-page.js
```

## Verification completed

- EN and RU routes and required CSS/JS/JSON assets return local HTTP 200.
- Chrome dynamic rendering resolves every service and the worked-example values from JSON.
- Representative screenshots reviewed at EN 320 px, RU 390 px and EN 1440 px.
- JavaScript syntax checks pass.
- Impeccable detector passes after removal of the flagged side-tab treatment.
- No inline styles, CSS hex colours, raw Telegram destination, `AggregateOffer`, fake rating, promotional discount phrasing or commercial rate literals in Lane B runtime files.

## Final integrator actions / known gaps

- Add `/pricing/` and `/ru/pricing/` to shared navigation and sitemap; those files are outside Lane B ownership.
- Keep base analytics before `pricing-analytics.js`.
- Re-run `node tests/caesthetic/run-pricing.mjs` after Lane A removes rate and fee literals from its TypeScript locale copy. The current hardcode-guard failure points only to `src/i18n/pricing.en.ts` and `src/i18n/pricing.ru.ts`, not Lane B runtime files.
- Production deployment is intentionally outside this lane.
