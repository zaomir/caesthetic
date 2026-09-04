# Expert Dental / RAIM SMILE — membership operating contour

**Status:** current-binding public naming approved; expanded-v2 clinical, fiscal, capacity, ledger and pilot gates open.

## Authority

- Target product standard: `docs/ssot/RAIM_SMILE_SMILECARE_12_PRODUCT_STANDARD.md`
- Machine-readable contract: `smilecare12-product.contract.json`
- Pilot gate checklist: `PILOT_GATE_CHECKLIST.md`
- Current public authority: `docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md`
- Current prices/SKUs: `../pricing/PRICE_CATALOG.json`
- Naming migration: `../../../partnerships/SMILECARE_12_NAMING_MIGRATION.md`

## Current binding

```text
public_product = RAIM SMILE · SmileCare 12
current_route = /services/smilecare-12/
legacy_redirect = /services/care-12/ -> 301
checkout = false
automatic_activation = false
expanded_v2_plans_active = false
product_architecture_gate = CLOSED
owner_naming_gate = CLOSED (DEC-861)
trademark/clinical/fiscal/capacity/ledger/pilot/expanded-v2 gates = OPEN
```

Do not change prices, SKU ids, benefits, contracts or checkout from this folder alone. Any future expansion must update the contract first, close the relevant gate with evidence and preserve fail-closed tests.

## Operating sequence

`protocol → economics/capacity → legal/fiscal → ledger/billing → clinic pilot → partner cohort → naming/runtime migration`

No partner may assign a clinical plan or receive medical-tier data. Family Account is a coordination/payment layer; every person retains an individual clinical plan and benefit ledger.
