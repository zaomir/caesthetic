# SmileCare 12 — pilot activation checklist

**Status:** NOT READY FOR CLINIC OR PARTNER ACTIVATION  
**Owner architecture approval:** complete  
**All remaining gates:** fail-closed

The owner-approved public naming cutover in DEC-861 is limited to the existing,
clinic-confirmed Adult / Additional Adult / Kids benefit binding. It does not
activate Essential, Perio, Kids & Teens, Family Account, checkout or a partner
cohort, and therefore does not imply that G1-G6 are complete.

A checkbox may be marked only with a dated evidence link, named owner and reviewer. Intent, discussion or an unpublished spreadsheet is not evidence.

## Current Adult checkup revision — 2026-09-07

The owner-approved current Adult / Additional Adult composition is now two comprehensive checkups, with indicated fluoride at no surcharge. Current naming, IDs, prices and Kids stay unchanged. This does not close expanded-v2 activation gates.

- [ ] Chief clinician confirms fluoride protocol, indications/contraindications and material.
- [ ] Clinic management records material cost, chair time and revised max-use economics/capacity.
- [ ] Problem-focused extra exam remains candidate until its clinical scope, capacity, terms and individual entitlement tracking are confirmed.

Authority: `RAIM_SMILE_SMILECARE_12_PRODUCT_STANDARD.md` §1.1 and `smilecare12-product.contract.json.currentPublicBinding.adultCheckupBinding`.

## G1 — clinical protocol

- [ ] Essential inclusion/exclusion approved by chief clinician.
- [ ] Perio entry criteria and 3/4/6-month protocol approved.
- [ ] Kids & Teens risk, fluoride, sealant and occlusion rules approved.
- [ ] Problem-focused visit scope approved or removed.
- [ ] Candidate preventive add-on catalog approved or removed.
- [ ] Wrong-plan correction and clinical escalation SOP approved.

## G2 — unit economics and capacity

- [ ] Max-use cost calculated separately for Essential, Perio and Kids & Teens.
- [ ] Chair time, clinician/hygienist cost, consumables and coordinator cost included.
- [ ] Payment processing, no-show/refund reserve and partner servicing included.
- [ ] Target contribution margin and stop threshold approved.
- [ ] Capacity calendar proves included care can be delivered within term.
- [ ] Pilot cap set; default maximum is 60 members.
- [ ] Current 9 900 / 7 900 / 5 500 prices are either validated for mapped plans or replaced through clinic/fiscal approval.

## G3 — legal, fiscal and patient terms

- [x] Current public binding states that the product is not insurance — owner:
  RAIM SMILE owner; reviewer: automated public-copy contract; evidence:
  `DEC-861`, `PRICE_CATALOG.json`, `smilecare12-public-cutover.test.mjs`
  (2026-08-29). Expanded-v2 patient terms remain open below.
- [ ] Membership agreement and operator disclosure approved.
- [ ] Monthly commitment, cancellation and used-service reconciliation approved.
- [ ] Invoice/VAT/cash-register treatment approved.
- [ ] Consent/privacy versions approved.
- [ ] Partner-funded/co-funded schedule reviewed separately.

## G4 — ledger, billing and operations

- [ ] Individual entitlement ledger implemented and append-only audited.
- [ ] Family Account keeps individual, non-transferable benefits.
- [ ] Pre-book, reminder, transfer and no-show workflows tested.
- [ ] Failed payment and reinstatement rules tested.
- [ ] Annual reassessment, plan change and renewal workflows tested.
- [ ] Partner reporting excludes plan_id, diagnosis and other medical data.
- [ ] Administrator and coordinator training passed.

## G5 — Expert Dental clinic pilot

- [ ] Cohort ≤60 approved and documented.
- [ ] Every member clinically qualified before activation.
- [ ] Essential, Perio and Kids & Teens cohorts represented without forced quotas.
- [ ] Included visits pre-booked.
- [ ] 30/60/90 review owners and dashboard assigned.
- [ ] Capacity, payment, wrong-plan, complaint and privacy stop rules enabled.
- [ ] 90-day operating review passed.
- [ ] 6–12 month economics/renewal evidence or conservative max-use approval completed.

## G6 — partner cohort

- [ ] G5 accepted.
- [ ] Exactly one limited partner cohort selected.
- [ ] Eligible audience, proof, cap, source ID and activation flow fixed.
- [ ] Funding occurs on activation unless explicit inventory model approved.
- [ ] Partner cannot select or receive clinical tier.
- [ ] Distribution obligations and stop rule signed.
- [ ] 30/60/90 partner review scheduled.

## G7 — naming and runtime migration

- [x] Exact endorsed name and owner naming GO recorded — owner: RAIM SMILE
  owner; reviewer: SSOT contract test; evidence: `DEC-861` and
  `smilecare12-product.contract.json` (2026-08-29).
- [ ] Trademark/name clearance completed for intended markets.
- [x] Existing Adult / Additional Adult / Kids SKU display mapping approved
  without changing SKU IDs, prices or benefit boundaries — owner: RAIM SMILE
  owner; reviewer: price-catalog contract test; evidence: `DEC-861`,
  `PRICE_CATALOG.json`, `smilecare12-public-cutover.test.mjs` (2026-08-29).
- [ ] Essential/Perio/Kids & Teens/Family Account SKU, price and benefit mapping approved.
- [x] Current-binding public copy and operator disclosure updated atomically —
  owner: RAIM SMILE owner; reviewer: patient-site release contract; evidence:
  `DEC-861`, production audit and deployed HTML (2026-08-29).
- [ ] Expanded-v2 contracts, invoices and operator-specific fulfilment terms approved.
- [x] URL/redirect/canonical/sitemap plan implemented — owner: RAIM SMILE
  owner; reviewer: patient-site smoke; evidence: production audit, deployed SHA
  `69cf3e8849f2ec8447607439ed3a98dce65d4104` (2026-08-29).
- [x] Current-binding analytics events migrated to `smilecare12_*` — owner:
  RAIM SMILE owner; reviewer: automated cutover test; evidence:
  `smilecare12-public-cutover.test.mjs` (2026-08-29).
- [x] Old/new naming, unchanged checkout boundary and redirect tests pass —
  owner: RAIM SMILE owner; reviewer: required CI and production smoke; evidence:
  grainee-v2 PR #1156 and workflow run `33276329764` (2026-08-29).
- [ ] Entitlement-ledger and expanded-v2 checkout tests pass.
- [x] Production deploy records deployed SHA and smoke 200 — owner: RAIM SMILE
  owner; reviewer: typed Raimov ops result; evidence:
  `docs/agent-api/results/ops-deploy-patient-site-33276329764.json` and
  production audit (2026-08-29).
- [ ] A production rollback drill is executed and recorded. The deploy is
  rollback-safe, but no rollback drill was required or performed in this release.

## Activation rule

```text
clinic_pilot_active = G1 && G2 && G3 && G4
partner_pilot_active = clinic_pilot_active && G5 && G6
public_smilecare12_active = partner_pilot_active && G7
```

`public_smilecare12_active` means expanded-v2 activation. The current-binding
public naming cutover is controlled separately by DEC-861 and cannot issue new
entitlements. Any missing activation evidence evaluates to `false`.
