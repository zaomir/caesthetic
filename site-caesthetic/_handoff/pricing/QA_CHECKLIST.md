# CAESTHETIC Pricing QA Checklist

Run automated gates:

```bash
node tests/caesthetic/run-pricing.mjs
```

Skipped tests are integration gaps, not completed checks. Re-run after Lane A/B artifacts are merged.

## Formula and SSOT

- [x] Lane A `src/config/pricing.ts` is present and imports under Node type stripping.
- [x] 7% below the minimum returns 30% of selected fixed fees.
- [x] 7% above the minimum returns 7% once.
- [x] Multi-service minimum uses 30% of the fixed-fee sum.
- [x] Zero adjusted revenue returns the minimum.
- [x] Missing/invalid fixed fee throws or returns a safe null sentinel.
- [x] Exposed billing metadata is USD/monthly.
- [ ] No pricing rates or service-fee dollar amounts are hardcoded outside the central config/generated API.

## RU/EN parity

- [x] Pricing copy dictionaries have identical leaf keys.
- [x] Both locale values are non-empty.
- [ ] EN `/pricing/` and RU `/ru/pricing/` expose equivalent sections, services, CTA choices, examples, FAQ, and limitations.
- [ ] Currency, decimal, and percentage formatting is locale-appropriate without changing the underlying values.

## Accessibility

- [ ] All controls and links work with keyboard only in logical order.
- [ ] Focus is visible and not obscured by sticky content.
- [ ] Toggle state is conveyed programmatically (`aria-pressed`, radio semantics, or equivalent).
- [ ] FAQ/example disclosure controls expose expanded state.
- [ ] Inputs and controls have persistent labels; meaning does not rely on placeholders.
- [ ] Text, controls, borders, and focus indicators meet WCAG AA contrast.
- [ ] Headings form one logical hierarchy with one H1.
- [ ] Screen-reader output does not repeat decorative pricing text.
- [ ] `prefers-reduced-motion: reduce` removes non-essential transitions/animation.
- [ ] Zoom at 200% and text spacing do not clip content.

## SEO

- [x] EN and RU pages each have a non-empty title and description.
- [x] Canonicals are self-referencing HTTPS URLs.
- [x] Both pages include `hreflang` for `en`, `ru`, and `x-default`.
- [x] `<html lang>` matches the page language.
- [x] No `AggregateOffer` schema.
- [ ] Visible claims support any `Service`, `FAQPage`, or breadcrumb schema used.
- [ ] Final integrator adds both routes to sitemap/navigation as required.

## Analytics and privacy

- [x] Only the six events in `LANE_C_ANALYTICS.md` are accepted by the wrapper.
- [x] The base analytics script loads before `pricing-analytics.js`.
- [x] No revenue, amount, price, medical data, PII, or assessment values enter wrapper payloads.
- [ ] Model toggles, both CTAs, example disclosure, and FAQ disclosure emit once per interaction.
- [ ] Analytics failure or blocking does not affect pricing UI or navigation.

## Compliance

- [x] No “70% off” or “save 70%”; only “70% lower fixed fee” (and faithful RU equivalent).
- [x] No referral fee, per-patient commission, paid/bought reviews, or guaranteed growth/revenue/ranking.
- [ ] External costs and partnership-minimum limitations remain visible.
- [ ] No invented proof, outcomes, testimonials, or client metrics.

## Responsive mobile matrix

| Viewport | Check |
|---|---|
| 320 × 568 | No horizontal scroll; cards, toggle, formulas, and CTAs remain usable. |
| 375 × 667 | Primary mobile layout, disclosure controls, and sticky elements do not overlap. |
| 390 × 844 | Long RU copy wraps without clipping or orphaned controls. |
| 768 × 1024 | Tablet grid and model comparison keep a clear reading order. |
| 1024 × 768 | Landscape/tablet layout has no overflow or unexpected mobile navigation. |
| 1440 × 900 | Desktop max-width, alignment, and comparison hierarchy are balanced. |

## Browser smoke

- [ ] Current Chrome/Chromium: EN + RU, keyboard, toggle, CTAs, disclosures.
- [ ] Current Firefox: EN + RU, focus, grid wrapping, disclosures.
- [ ] Current Safari/WebKit: EN + RU, sticky layout, reduced motion, links.
- [ ] Current Edge: EN + RU, analytics no-op/failure behavior.
- [ ] No console errors, failed local assets, mixed content, or broken links.

## Static smoke and release boundary

- [ ] Production build: **N/A — CAESTHETIC is static.**
- [ ] Serve `site-caesthetic/` locally and request both pricing routes with HTTP 200.
- [ ] Confirm CSS, pricing data/API, base analytics, and pricing analytics assets return 200.
- [ ] Verify fixed CTA → `/assessment/?engagement=fixed`.
- [ ] Verify partnership CTA → `/assessment/?engagement=partnership`.
- [ ] Deployment: **NOT IN SCOPE for Lane C.**
