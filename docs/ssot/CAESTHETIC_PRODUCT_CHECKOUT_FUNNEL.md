---
owner: CAESTHETIC
status: active
version: 1.3
created: 2026-09-07
updated: 2026-09-07
scope: paid public product routing, electronic order, Wise handoff and payment confirmation for Lead-to-Revenue Check and 30-Day Growth Sprint
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md
  - docs/projects/caesthetic/legal/CAESTHETIC_PAYMENT_EVIDENCE_RUNTIME.md
  - docs/ssot/EF_PLACEMENT.md
---

# CAESTHETIC paid-product checkout funnel

## Decision

For the two fixed-price public paid products, the canonical route is:

`any approved product CTA → product page → three-field electronic Order → controlled Wise rail → confirmed funds → payment confirmation page`.

This routing supersedes only the older public `CTA → Name/Email request modal → manual/private payment request` path for the `$500` Lead-to-Revenue Check and `$2,500` 30-Day Growth Sprint. It does not change the Four Surfaces, Growth Score diagnosis, Check evidence rules, Sprint outcome boundaries, Growth System, or evidence/impact standards.

The customer-facing CAESTHETIC purchase path remains on `caesthetic.com` until the browser intentionally opens Wise. No CAESTHETIC product-order API on another public website is part of the customer route.

## Route contract

- A Sprint CTA clicked anywhere except `/sprint/` routes to `/sprint/`.
- A Check CTA clicked anywhere except `/lead-to-revenue-check/` routes to `/lead-to-revenue-check/`.
- On `/sprint/`, the Sprint purchase CTA routes to `/pay/?product=growth_sprint`.
- On `/lead-to-revenue-check/`, the Check purchase CTA routes to `/pay/?product=lead_to_revenue_check`.
- Cross-product CTAs still go to the other product page first.
- Questions/contact CTAs keep the existing two-field Name + Email request flow.

## Product Order

The public fixed-product order contains exactly three named text inputs:

1. `Practice or business name`;
2. `Your name`;
3. `Work email`.

The product code, price, currency and standard scope identifier are server-owned and cannot be supplied by the browser. Clicking `Continue to payment` records the electronic standard Order and the purchaser's confirmation that they are authorized to purchase and pay for the named practice/business. The same screen links the Payment Terms and Terms of Use. No revenue, budget, patient, appointment, treatment or clinical data is requested.

Canonical fixed prices remain:

- `lead_to_revenue_check` — `$500 USD`;
- `growth_sprint` — `$2,500 USD`.

## Product boundaries after purchase

### Lead-to-Revenue Check

Payment purchases the fixed diagnostic. It does **not** assert that an internal leak exists and does not authorize CAESTHETIC to access internal data automatically. The authorized non-clinical evidence scope and access method must be confirmed before any CRM, telephony, message, booking or other internal evidence is shared. Existing `$500 → qualifying Sprint` credit rules remain unchanged.

### 30-Day Growth Sprint

Payment reserves the fixed Sprint product; it does not start the 30-day clock by itself. Before implementation, CAESTHETIC confirms the priority constraint to be implemented, required access/approvals and the Sprint Start Date. If a useful executable priority cannot be established, the operator must stop and resolve scope rather than fabricate work. No ranking, patient, booking, revenue, ROI or growth result is guaranteed.

## Wise and payment evidence

Wise is a payment rail, not CAESTHETIC's commercial source of truth. Provider URLs and provider configuration remain server-side. The browser receives a Wise destination only after a valid CAESTHETIC Commercial Order and Payment Request exist.

A Wise redirect, browser return, screenshot or user statement is never `Payment received`. The confirmation page may render **Payment received.** only when the CAESTHETIC payment request is `credited` or `delivery_started` after confirmed funds have been reconciled. Before that, the page renders **We're confirming your payment.**

Once credited, canonical customer copy is:

> **Payment received.**
> Thank you. We've received your payment for [product]. CAESTHETIC will contact you within 24 hours with the next step.

The 24-hour commitment is a contact/handoff commitment, not an implementation or outcome guarantee.

## Runtime placement

The customer-facing product-order endpoint is same-origin:

`https://caesthetic.com/api/v1/caesthetic-product-order`

Cloudflare treats `/api/` as a CAESTHETIC runtime prefix and sends it to the canonical VPS2402 origin. The CAESTHETIC nginx origin proxies only this exact path to the local self-hosted edge runtime at `127.0.0.1:54321/caesthetic-product-order`. The browser therefore remains on `caesthetic.com`; the local runtime host and provider configuration are not exposed as a second public CAESTHETIC website.

The handler source remains under `supabase/functions/` because the self-hosted VDS Edge Runtime synchronizes that source tree, but it is **not deployed as a new Supabase Edge Function**. This follows the active EF placement rule that new functions default to VDS and avoids consuming another Supabase slot while the project is at the platform function cap.

The handler writes the canonical CAESTHETIC Commercial Order / Payment Request / payment-evidence tables in Supabase using server-side VDS credentials. No Supabase service credential or Wise provider URL is exposed to the browser.

## Wise rail resolution

Server-side order runtime resolves the rail in this order:

1. product-specific `CAESTHETIC_WISE_CHECK_LINK` or `CAESTHETIC_WISE_SPRINT_LINK`;
2. `CAESTHETIC_WISE_OPEN_LINK`, with server-generated amount/currency/description when it is an open Wise Business payment link;
3. the existing approved fixed `CAESTHETIC_WISE_PAYMENT_LINK` only for the `$500` Check legacy fixed request.

The known fixed `$500` request must never be reused for the `$2,500` Sprint. Sprint checkout fails closed when neither an approved Sprint-specific link nor an approved open Wise Business link is configured.

## Acceptance

Production acceptance requires:

- non-product Sprint/Check CTA routes to the relevant product page, not a request modal;
- same-product CTA on the product page routes to the three-field order page;
- product Order API is same-origin on `caesthetic.com`;
- browser cannot change product price;
- order exists before Wise opens;
- `$500` and `$2,500` are enforced server-side;
- provider URL is absent from public source/config;
- Check Wise rail is live;
- Sprint Wise rail is live or the runtime fails closed with an explicit infrastructure blocker;
- pending/unverified payments never show `Payment received`;
- credited payment shows the confirmation and 24-hour contact message.


## Spoken case offer continuity (2026-09-07)

Owner-approved remediation extends the existing RU case offer through the canonical
product and Order path, without changing generic pricing or the English report:
`RU Spoken report → /sprint/?offer=spoken-four-surface-sprint-v1 → /pay/?product=growth_sprint&offer=spoken-four-surface-sprint-v1`.

The selector is an allowlisted offer identity, never browser-supplied price or scope.
`supabase/functions/caesthetic-product-order/spoken-offer.mjs` is the executable,
versioned terms snapshot; `build-spoken-offer.mjs` deterministically copies its public
counterpart. The server validates product and named practice, stores its `sow_id`,
full terms snapshot and digest in order evidence, and restores the identity from
the stored order. Unknown offers fail closed. Generic orders remain unchanged.

The included Check covers enquiry through payment with agreed non-clinical access;
additional internal implementation remains separate. The finite proposed material
set and all four editable surfaces are confirmed before implementation and the
30-day clock. A proposal is not a newly approved binding diagnostic constraint.

A qualifying prior Check receives one $500 credit, leaving $2,000. Eligibility and
credited funds must be verified by the operator in the existing commercial-order
process before issuing the balance order. The public $2,500 checkout does not apply
an automatic credit, accept a coupon, or infer eligibility from a query parameter,
email or practice name. Product and order pages explicitly direct prior Check
buyers to credit verification before ordering. No new payment rail is introduced.

Optional scoped monthly support below $2,500 retains the case-specific master
terms; no automatic renewal or universal Growth System price is introduced.
