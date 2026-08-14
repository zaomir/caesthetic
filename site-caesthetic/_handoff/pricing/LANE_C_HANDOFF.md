# CAESTHETIC Pricing — Lane C Handoff

**Lane:** C — QA, analytics, compliance
**Date:** 2026-07-31
**Deploy:** NOT IN SCOPE

## Automated status

Command:

```bash
node tests/caesthetic/run-pricing.mjs
```

Current result against the shared Lane A/B workspace: **FAIL — 16 passed, 1 failed, 0 skipped**.

Passing:

- formula boundaries, bundles, zero revenue, invalid input, USD/monthly metadata;
- RU/EN copy key and non-empty-value parity;
- forbidden-phrase compliance;
- pricing SEO metadata, canonical, hreflang, language, and no `AggregateOffer`;
- analytics event allowlist, safe payload filtering, load order, and no-op behavior;
- generated browser pricing API reads `assets/data/pricing.json`.

Failing:

- `pricing-hardcode-guard.test.mjs`: Lane A duplicates `30%`, `7%`, `3%`, and worked-example dollar amounts in `src/i18n/pricing.en.ts` and `src/i18n/pricing.ru.ts`.

This is a contract failure, not a test exception. The requested allowlist permits literals only in `src/config/pricing.ts`, generated `assets/data/pricing.json`, and the API that reads that JSON. Locale copy needs placeholders/formatting sourced from the config rather than embedded commercial values.

## Lane B integration status

The EN/RU pages pass metadata tests and load base analytics before the safe pricing wrapper. Lane B now provides `pricing-page.js` and `telegram.js`; pricing runtime bindings cover view, model toggle, both commercial CTAs, worked example, and FAQ events.

Remaining B/final-integrator work is browser, keyboard, responsive, reduced-motion, and local HTTP asset smoke from `QA_CHECKLIST.md`. Lane B files were present but not yet committed when this handoff was written.

The final integrator should re-run the suite after A/B reconciliation and perform the static smoke. A production build is N/A for this static site.

## Analytics delivery

`assets/js/pricing-analytics.js` defines only six safe wrappers over the existing `window.caestheticAnalytics.track` transport. It rejects unknown events and strips revenue, amount/price, medical, PII, assessment, nested, and arbitrary payload fields.

No changes were made to `assets/js/analytics.js`.

## Compliance verdict

**VERDICT: COMPLIANT**
**Zone:** white B2B public pricing
**Violations:** 0 prohibited claims in pricing copy
**Separate QA blocker:** duplicated rate/price literals violate pricing SSOT placement, not claim compliance.
