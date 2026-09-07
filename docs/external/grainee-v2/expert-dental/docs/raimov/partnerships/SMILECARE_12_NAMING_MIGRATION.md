# RAIM SMILE — SmileCare 12 naming and migration gate

## Публичное имя — решение владельца 2026-09-07

Действующее публичное имя: **RAIM SMILE · Год заботы**. Короткое имя: **Год заботы**.
`publicName: Год заботы`; `internalName: SmileCare 12 / care12`.
`SmileCare 12`, `Care 12` и `Expert Care 12` — временные internal/legacy aliases, не публичные display names.
Authority: `docs/founder-notes/DEC-RAIM-SMILE-YEAR-OF-CARE-20260907.md`, superseding только naming в DEC-861.
Все цены, benefits, economics, VIP mechanics, SKU ids, contractId, file paths и аналитические mappings сохранены.
`raimsmile.com/smilecare-12/` остаётся canonical продукта; на patient-site сохраняются
`/services/smilecare-12/`, `/blog/smilecare-12/` и их legacy redirects. Нового slug нет.
Предыдущие решения и release evidence ниже остаются историческими; legacy wording
в технических/операционных разделах обозначает тот же продукт.


**Status:** OWNER_NAMING_GO_RECORDED / CURRENT_BINDING_CUTOVER_APPROVED / EXPANDED_V2_AND_TRADEMARK_COUNSEL_GATED
**Current public product:** `RAIM SMILE · Год заботы` with unchanged legacy benefit binding
**Legacy product name:** `Expert Care 12`
**Approved endorsed form:** `RAIM SMILE · Год заботы`
**Target product standard:** `docs/ssot/RAIM_SMILE_SMILECARE_12_PRODUCT_STANDARD.md`

## Previous DEC-861 cutover context (historical)

## Why

`Expert Care 12` is tied to the current medical operator. A portable RAIM SMILE partnership/operator network needs a product name and product architecture that can survive operator change while keeping the actual medical operator, clinical plan and fulfilment terms explicit.

Public spelling should omit the hyphen. Use the hyphen only in the future URL slug:

- display: `Год заботы`;
- endorsed display: `RAIM SMILE · Год заботы`;
- stable ID: `smilecare_12`;
- future slug: `smilecare-12`.

## Product architecture approval and naming approval are separate

The owner approved the strengthened target architecture on 2026-08-29:

- `Essential`;
- `Perio`;
- `Kids & Teens`;
- `Family Account` as a coordination/payment layer, not a clinical plan;
- individual entitlement ledger;
- max-use economics;
- clinic pilot before partner activation.

This closes product-architecture gate G0. `DEC-861` separately closes the exact owner naming GO and authorises a reversible current-binding public cutover. It does **not** close trademark counsel, expanded-plan clinical/fiscal/capacity, contract, ledger or pilot gates.

## Approved current-binding cutover

The safe cutover is deliberately narrower than activation of the target v2 architecture:

- public/current name is `RAIM SMILE · Год заботы`;
- canonical route is `/services/smilecare-12/`; `/services/care-12/` redirects permanently;
- existing Adult/Additional Adult/Kids SKU IDs, prices and benefit boundaries remain authoritative;
- current `care12-family-addon` means Additional Adult, not a functioning Family Account;
- Perio has no active SKU or approved price;
- candidate benefits in the target standard are not included in the current contract;
- partner-funded cohorts remain activation-gated.

Public copy must always disclose `Expert Dental Studio` as medical operator and must not imply that RAIM SMILE is the clinic or medical provider.

## Atomic migration checklist

1. [x] owner confirms exact display name and endorsed form — `DEC-861`;
2. [ ] name/trademark clearance for intended markets, at minimum KG/KZ;
3. [ ] clinic and fiscal approval of expanded benefits, prices and accounting treatment;
4. [ ] clinical protocols approved for Essential, Perio and Kids & Teens;
5. [x] legacy Adult/Additional Adult/Kids SKU display mapping approved without price/benefit change — `DEC-861`;
6. [ ] target Essential/Perio/Kids & Teens/Family Account SKU and price mapping approved;
7. [ ] individual entitlement ledger, billing, no-show, transfer, plan-change and renewal rules implemented;
8. [ ] operator-specific fulfilment, capacity, activation and utilisation rules approved;
9. Expert Dental clinic pilot accepted before any partner cohort;
10. partner/operator contract and benefit-funding updates;
11. [ ] expanded-v2 patient terms, consent, privacy and invoice updates; current-binding operator disclosure is required in the naming release;
12. [x] canonical URL, redirect and sitemap implementation for current binding;
13. [x] public analytics namespace migration with legacy CRM aliases documented;
14. [x] tests for old/new naming, unchanged benefits, redirects and structured data;
15. [x] current-binding production deployed SHA and smoke evidence —
    `69cf3e8849f2ec8447607439ed3a98dce65d4104`, workflow `33276329764`;
16. [ ] production rollback drill evidence (rollback-safe mechanism exists; no
    rollback drill was executed for this successful release).

The current-binding cutover must remain atomic across canonical patient surfaces. The old name may remain only in historical decisions, audit evidence, migration documentation and redirect tests. Expanded v2 names must not be inferred from this release.
