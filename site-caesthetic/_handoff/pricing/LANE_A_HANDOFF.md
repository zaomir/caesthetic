# CAESTHETIC Pricing — Lane A contract

**Lane:** A — pricing SSOT and commercial copy
**Branch:** `cursor/caesthetic-pricing-page-22f0`
**Canonical source:** `site-caesthetic/src/config/pricing.ts`

## 1. TypeScript contract

`src/config/pricing.ts` exports:

- Types: `ServiceId`, `Currency`, `BillingPeriod`, `EngagementModel`, `PricingRates`, `ServicePricing`, `PricingCtaId`, `PricingCta`, `EligibilityId`, `ExclusionId`, `AdjustedRevenueDeductionId`, `AdjustedRevenueExcludedId`.
- Commercial data: `RATES`, `CURRENCY_MINOR_UNIT_DIGITS`, `CURRENCY_MINOR_UNIT_SCALE`, `SERVICES`, `CTA`, `ELIGIBILITY`, `EXCLUSIONS`, `ADJUSTED_COLLECTED_REVENUE`, `ACTIVATION_BUDGET`, `BUNDLE_RULES`, `WORKED_EXAMPLE`.
- Formula helpers: `fixedFeeAmount`, `partnershipMinimum`, `revenueShareAmount`, `monthlyPartnershipFee`, `bundlePartnershipFee`.
- Aggregate export: named and default `PRICING`.

The contract encodes:

```text
Fixed Fee = 100% of the listed full price; revenue-share rate = 0
partnership minimum = Fixed Fee × 30%
revenue-share amount = Adjusted Collected Revenue × 7%
monthly partnership fee = max(partnership minimum, revenue-share amount)
bundle minimum = sum(selected Fixed Fees) × 30%
bundle revenue share = 7% once per business
activation commitment ≥ 3% of revenue, separately funded
```

`bundlePartnershipFee` requires at least two selected service fees and applies the variable rate once to the business.
All computed USD amounts are normalized to the currency’s two minor-unit digits.

## 2. Service IDs

| ID                    | Fixed Fee USD/month | Partnership minimum |
| --------------------- | ------------------: | ------------------: |
| `dental`              |               4,000 |               1,200 |
| `beauty`              |               4,000 |               1,200 |
| `aesthetic_medicine`  |               4,000 |               1,200 |
| `maps_reputation`     |               1,500 |                 450 |
| `websites_seo`        |               2,500 |                 750 |
| `patient_acquisition` |               3,000 |                 900 |
| `crm_conversion`      |               2,000 |                 600 |
| `personal_brand`      |               1,500 |                 450 |
| `multi_location`      |               3,500 |               1,050 |

Use `SERVICES`; do not reproduce this table as a second code source.

## 3. CTA contract

| Key               | ID                        | Href                                  |
| ----------------- | ------------------------- | ------------------------------------- |
| `CTA.fixed`       | `pricing_fixed_cta`       | `/assessment/?engagement=fixed`       |
| `CTA.partnership` | `pricing_partnership_cta` | `/assessment/?engagement=partnership` |
| `CTA.contact`     | `pricing_contact_cta`     | `/contact/`                           |

The contact route is the only configured fallback. No Telegram destination is defined.

## 4. Adjusted Collected Revenue

`ADJUSTED_COLLECTED_REVENUE` defines:

```text
collected revenue
− VAT or sales tax
− refunds
− agreed pass-through clinical costs
```

Credits, investments and intra-group transfers are excluded from collected revenue. Copy labels and explanations live in the locale decks.

## 5. Runtime JSON

`assets/data/pricing.json` is the browser serialization of the TypeScript source. It mirrors:

- currency, minor-unit scale and billing period;
- all rate values and formula IDs;
- all service IDs, full fees and calculated minimums;
- bundle and activation rules;
- Adjusted Collected Revenue component IDs;
- eligibility and exclusion IDs;
- CTA IDs and hrefs;
- the worked example.

When `pricing.ts` changes, update `pricing.json` in the same commit.

## 6. Browser formula API

Load `assets/js/pricing-api.js`. It uses an existing `window.CAESTHETIC_PRICING` object when present; otherwise it fetches `/assets/data/pricing.json`.

```js
window.CAESTHETIC_PRICING_API.ready.then(function () {
  var fee = window.CAESTHETIC_PRICING_API.monthlyPartnershipFee(
    fixedFee,
    adjustedRevenue,
  );
});
```

Available synchronous methods after `ready` resolves:

```ts
partnershipMinimum(fixedFee: number): number
revenueShareAmount(adjustedRevenue: number): number
monthlyPartnershipFee(fixedFee: number, adjustedRevenue: number): number
bundlePartnershipFee(fixedFees: number[], adjustedRevenue: number): number
```

The JavaScript helper contains no embedded commercial rates; every calculation reads the loaded config.

## 7. Copy modules

- English: `src/i18n/pricing.en.ts` → `pricingEn`
- Russian: `src/i18n/pricing.ru.ts` → `pricingRu`
- Shared shape: `PricingCopy`, exported by `pricing.en.ts`

`pricingRu` is checked against `PricingCopy`, so Lane B can use the same rendering keys for both locales.

### Copy key map

| Page area                | Keys                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| Hero                     | `hero.eyebrow`, `hero.title`, `hero.lede`, `hero.note`                         |
| Reusable UI labels       | `labels.*`                                                                     |
| Commercial model cards   | `models.title`, `models.intro`, `models.fixed.*`, `models.partnership.*`       |
| Diagram / flow labels    | `flowLabels.*`                                                                 |
| Service price rows/cards | `services.title`, `services.intro`, `services.items[serviceId].title`, `.body` |
| Multi-service rule       | `bundle.title`, `bundle.body`, `bundle.formula`                                |
| Calculation example      | `workedExample.*`                                                              |
| Revenue definition       | `adjustedRevenue.definition`, `.formula`, `.deductions[id]`, `.excluded[id]`   |
| Attribution and control  | `operatingControl.*`                                                           |
| Partnership checklist    | `eligibility.items[eligibilityId].title`, `.body`, `eligibility.ineligible`    |
| Separate costs           | `exclusions.items[exclusionId].title`, `.body`, `exclusions.note`              |
| Process                  | `howItWorks.steps[]`                                                           |
| FAQ                      | `faq.items[]`                                                                  |
| Closing CTAs             | `closing.fixedCta`, `closing.partnershipCta`, `closing.contactCta`             |

## 8. Rendering rules for Lane B

1. Render amounts, rates and CTA hrefs from config/JSON, not from copy strings.
2. The worked-example display strings are editorial labels; calculation assertions must use `WORKED_EXAMPLE` or the browser API.
3. Keep the phrase **“70% lower fixed fee”** in the English model and avoid promotional discount framing.
4. Keep the operating-control and individual-attribution sections visible; they are part of the commercial model, not optional footnotes.
5. Keep activation costs visibly separate from the CAESTHETIC fee.
6. Preserve medical-cautious service copy and the outcome/review limitations.
