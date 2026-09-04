# RAIM SMILE partnerships — operating architecture

Owner decisions: `docs/founder-notes/DEC-865_raim-smile-clinic-funded-premium-tier-programs.md` and `docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md`.

This folder is the operating layer for the partnership network. Strategic truth lives in `docs/ssot/RAIM_SMILE_PARTNERSHIP_NETWORK.md`; the master acquisition/business strategy is `docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md`.

## Files

- `RAIM_SMILE_PARTNER_PROGRAM_MATRIX.md` — clinic-funded gift model, Premium Individual / Private / Top Tier differentiation, family allocation, partner-type programs, one-window fallback and pre-dashboard reporting.
- `PARTNER_PACKAGES.md` — reusable co-branded packages implementing the program matrix.
- `GULBARA_VIP_COORDINATOR.md` — role, four languages, 10-minute first-response target, access and escalation boundary for the first Partner & VIP Coordinator.
- `RAIM_SMILE_PARTNERSHIP_ECONOMICS_CONTRACT.md` — paid and clinic-funded modes, CAESTHETIC compensation, 100% Coordination Fee, Commercial-Schedule/attribution-gated Attributed Sales Performance Fee, max-use and settlement rules.
- `RAIM_SMILE_VIP_ACCESS_CONTRACT.md` — phone eligibility-key flow, neutral mismatch, two CTA, HMAC/rate-limit/audit/expiry contract; runtime not implemented.
- `BISHKEK_PARTNER_PIPELINE.md` — first partner categories, named research targets and proposed offers; no active-partner claim by listing.
- `RAIM_SMILE_PARTNERSHIP_PAGE_STRATEGY_V3.md` — canonical `/partners/` message hierarchy, Premium tiers, runtime markers, form and release/smoke gates.
- `RAIM_SMILE_PARTNERSHIP_PAGE_STRATEGY.md` — superseded v2 shim retained for history.
- `SMILECARE_12_NAMING_MIGRATION.md` — completed public naming boundary and remaining expanded-product gates.
- `../operations/expert-dental/membership/` — product contract, pilot checklist and operating contour for the strengthened SmileCare 12 architecture.

Target product SSOT: `docs/ssot/RAIM_SMILE_SMILECARE_12_PRODUCT_STANDARD.md`.

## Current owner-approved partner formula

```text
Partner privilege
= capped clinic-funded SmileCare 12 gift
+ one-window non-clinical Dental Concierge
+ Premium-tier and family allocation
```

The baseline gift allocation costs the partner zero. It is not reserved for the full client base: each participant opts in, passes eligibility and clinical qualification, and consumes a place only after activation. Exact quotas and family allocations are set in the signed pilot charter.

Default negotiation levels:

- `Premium Individual` — primary holder;
- `Private / Infinite` — holder plus one selected dependent within quota;
- `Top Tier / World Elite` — holder, one additional adult and up to two children within family allocation.

These labels are templates, not claims about a named bank before agreement.

## Operating flow

```text
target partner
→ select partner program and Premium tiers
→ set clinic-funded quota and capacity
→ sign pilot charter
→ recurring distribution without client-list transfer
→ participant opt-in and eligibility
→ operator clinical qualification
→ individual activation
→ coordinator ownership and operator handoff
→ aggregate review
→ continue / change / stop
```

## Current operator and alternative-provider boundary

Current primary medical operator in Bishkek: **Expert Dental Studio**. RAIM SMILE itself is not a clinic.

If the primary clinic lacks capacity or a required specialist, the coordinator arranges a prequalified alternative and remains the organisational owner until handoff. SmileCare 12 benefits do not automatically transfer; the alternative clinic normally uses its own agreement and price list.

## Data boundary

Partner data may hold partner name, contact, package, Premium tier, audience estimate, source, commercial status, next action, activation/quota state and aggregate service metrics.

Patient records, diagnosis, images, clinical plan IDs, treatment plans and clinical notes stay inside the approved medical operator system. Partners receive no client medical data.

## Naming, benefits and funding

Public membership name: **RAIM SMILE · SmileCare 12**. The current Adult / Additional Adult / Kids prices, benefits and SKU IDs remain unchanged. Expanded Essential/Perio/Kids & Teens/Family Account, checkout and broader portability remain gated.

For a paid approved membership, the 30% CAESTHETIC fee uses only actual retained membership revenue after all approvals. For a pure clinic-funded gift with no actual settlement, the 30% basis is zero. CAESTHETIC may receive a separately signed fixed pilot/activation fee and/or Coordination Fee. Under `DEC-866`, a later verified collected sale to a customer sourced or documentably reactivated by CAESTHETIC may also use a contract-specific Attributed Sales Performance Fee, without double counting. Medical/dental sales use the ordinary signed Commercial Schedule and verified attribution path without special legal/fiscal/advertising/privacy/fee-splitting activation gates; coordinator and clinician medical-sales percentages remain `0%`.

## Concierge and reporting

First named coordinator: **Гульбара** — Russian, Kyrgyz, English and French.

Owner-approved target for covered pilot shifts: first human organisational response within 10 minutes. `24/7 non-clinical Dental Concierge` becomes an external promise only after staffing, backup, escalation, measurement and clinical fallback are operational.

A live partner dashboard is deferred. The pilot uses a short aggregate report without names or medical information.
