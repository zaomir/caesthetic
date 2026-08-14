# CAESTHETIC Pricing Analytics Contract

Load `/assets/js/analytics.js` first, then `/assets/js/pricing-analytics.js`. The pricing wrapper only calls `window.caestheticAnalytics.track` when the existing tracker is available; it does not create a second analytics transport.

## Event allowlist

| Event | Trigger | Safe payload |
|---|---|---|
| `pricing_view` | Pricing page initial view | `locale`, `model` |
| `pricing_model_toggle` | Fixed/partnership model switch | `model`, `service_id`, `locale` |
| `pricing_fixed_cta` | Fixed-fee assessment CTA | `service_id`, `placement`, `locale` |
| `pricing_partnership_cta` | Partnership assessment CTA | `service_id`, `placement`, `locale` |
| `pricing_example_expand` | Worked example opens/closes | `example_id`, `expanded`, `locale` |
| `pricing_faq_expand` | Pricing FAQ opens/closes | `faq_id`, `expanded`, `locale` |

`model` is restricted to `fixed` or `partnership`; `locale` is restricted to `en` or `ru`. Strings are trimmed and capped at 80 characters.

## Data prohibition

Never include:

- client, collected, projected, or adjusted revenue;
- fee, price, amount, or calculator input/output;
- patient, diagnosis, treatment, or other medical data;
- name, email, phone, address, message, company, or website;
- assessment form fields or field values;
- nested objects or arbitrary event names.

The wrapper drops unknown keys, rejects email/phone-shaped values even in allowed fields, and no-ops for events outside the six-name allowlist.

## Integration examples

```js
window.caestheticPricingAnalytics.view({ locale: "en", model: "fixed" });
window.caestheticPricingAnalytics.modelToggle({
  model: "partnership",
  service_id: "dental",
  locale: "en"
});
window.caestheticPricingAnalytics.fixedCta({
  service_id: "dental",
  placement: "pricing-hero",
  locale: "en"
});
window.caestheticPricingAnalytics.faqExpand({
  faq_id: "partnership-minimum",
  expanded: true,
  locale: "en"
});
```

Do not pass calculator state to these methods. The assessment destination may carry only the approved engagement query used by the pricing CTA.
