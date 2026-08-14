# CAESTHETIC Pricing — Apple QA Audit (pre-merge)

**Date:** 2026-07-31  
**PR:** https://github.com/zaomir/grainee-v2/pull/571  
**Branch:** `cursor/caesthetic-pricing-page-22f0`  
**Auditor:** independent re-check (not trusting PR description)  
**Deploy:** still gated — do not merge/deploy until founder accepts this audit

## Verdict

**READY FOR MERGE / DEPLOY GATED**

Commercial formula, bundle logic, SSOT, compliance, SEO, analytics and browser matrix all **PASS**. The only remaining gate is founder authorization for undraft → merge → production deploy → prod smoke. That gate is procedural, not a content/quality blocker.

Non-blocking note: closed mobile nav may paint nodes outside the viewport (shared shell); document `overflow-x` remains false and this does not block the pricing page.

## 1. Commercial formula — PASS

Source: `site-caesthetic/src/config/pricing.ts`

```ts
monthlyPartnershipFee = Math.max(
  partnershipMinimum(fixedFee),   // Fixed × 0.30
  revenueShareAmount(revenue),    // ACR × 0.07
)
```

Live checks (`node --experimental-strip-types`):

| Case | Result |
|------|--------|
| Fixed $4,000 / ACR $10,000 | **$1,200** (minimum) |
| Fixed $4,000 / ACR $40,000 | **$2,800** (7%) |
| Same case ≠ $1,200+$2,800 | **PASS (not additive)** |

Browser API (`pricing-api.js`) uses the same `Math.max` and reads rates from JSON only.

## 2. Bundle logic — PASS

`bundlePartnershipFee(fees, revenue)` sums Fixed Fees once, then applies `monthlyPartnershipFee` once.

Four-service case (Maps $1,500 + Website $2,500 + Acquisition $3,000 + CRM $2,000 = $9,000):

| ACR | Fee | Notes |
|-----|-----|-------|
| $50,000 | **$3,500** | 7% once; not 4×$3,500 |
| $10,000 | **$2,700** | 30% of sum |

`BUNDLE_RULES.partnershipRevenueShareApplicationsPerBusiness === 1`

Unit test added: `monthly fee uses max, not 30% plus 7%` + 4-service assertions.

## 3. Pricing SSOT — PASS

Hardcode guard + repo scan: rate/fee literals only in:

- `src/config/pricing.ts`
- `assets/data/pricing.json`
- `assets/js/pricing-api.js` (reads config; no embedded 0.07/0.30/0.03)

No JSX. HTML/CSS/page JS inject amounts via JSON. Locale copy uses `{minimumRate}` / `{shareRate}` placeholders.

## 4. Content wording — PASS

Forbidden phrases absent on pricing surfaces:

- 70% discount / 70% off / Save 70%
- Guaranteed growth / We only get paid when you win

Present: **70% lower fixed fee**, shared growth, operating control, Adjusted Collected Revenue.

## 5. Legal safety — PASS

No patient commission, review payment, medical-procedure %, or guaranteed revenue claims in pricing copy/pages. Explicit “we do not claim named patients” block present.

## 6. SEO — PASS

EN `/pricing/` and RU `/ru/pricing/`:

- title, description
- canonical (exact locale URL)
- hreflang en / ru / x-default
- Open Graph type/title/description/url/image
- Service schema only — **no AggregateOffer**

Sitemap includes both URLs. No competing public pricing URL elsewhere on caesthetic.com.

## 7. Analytics — PASS (after fix)

Allowlist now:

`pricing_view`, `pricing_model_toggle`, `pricing_fixed_cta`, `pricing_partnership_cta`, **`pricing_contact_cta`**, `pricing_example_expand`, `pricing_faq_expand`

Browser smoke observed `page_view` + `pricing_view` + `pricing_example_expand`. Contact CTA was previously silent — fixed in this audit. Payload filter strips revenue/PII/medical/assessment fields.

## 8. UX / browser regression — PASS (with notes)

Evidence: `docs/audits/caesthetic/evidence/2026-07-31-pricing-apple-qa/`

| Check | EN | RU |
|-------|----|----|
| HTTP 200 | yes | yes |
| 9 services rendered from JSON | yes | yes |
| Example shows $4,000 / $1,200 / $40,000 / $2,800 | yes | yes (NBSP formatting) |
| Models stack to 1 column ≤820px | yes | yes |
| No document horizontal scroll | yes | yes |
| Sticky CTA ≤620px | yes | yes |
| FAQ count | 8 | 8 |

**Fixed in audit:** RU hero was a long explanatory sentence; aligned to DoD punchline «Выберите определённость или совместный рост.» Sticky mobile CTA bar added.

**Note (non-blocking):** closed mobile nav link nodes can paint outside the viewport (pre-existing shell pattern); document `overflow-x` remains false.

## Automated suite

```bash
node tests/caesthetic/run-pricing.mjs
# 18/18 PASS
```

## Audit fixes shipped on branch

1. Contact analytics event + wiring  
2. Stronger formula/bundle unit tests + OG SEO assertions  
3. Sticky mobile CTA  
4. RU/EN hero alignment to DoD  

## Merge / deploy recommendation

**Status: READY FOR MERGE / DEPLOY GATED**

After an explicit founder command only:

1. Undraft PR #571
2. Merge into `main`
3. `bash scripts/deploy-caesthetic.sh`
4. Prod smoke: `/pricing/` and `/ru/pricing/` → 200

Do not treat the mobile nav paint note as a merge blocker.
