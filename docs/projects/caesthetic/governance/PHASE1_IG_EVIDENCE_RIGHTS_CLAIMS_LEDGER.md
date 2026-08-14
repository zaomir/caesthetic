# CAESTHETIC Phase-1 IG — Evidence / Rights / Claims Ledger

**Status:** ACTIVE template + initial rows  
**Surface:** `B_CAE_IG` · `@caesthetic.growth`  
**Canon:** `docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md` · `docs/founder-notes/DEC-812.md`  
**Gate:** `docs/projects/caesthetic/governance/PHASE1_IG_PUBLISH_COMPLIANCE_CHECKLIST.md`  
**Banned terms:** `scripts/guards/cae-phase1-banned-terms.mjs`

## Purpose

Every Phase-1 Instagram feed/story unit that makes a factual or commercial claim must have a ledger row before founder APPROVED → publish. Student/VOC Phase-0 packs (`COPY-VOC-*`, Comment FIRST/NEXT) are **out of scope** and fail-closed.

## Row schema

| Field | Required | Notes |
|-------|----------|-------|
| `asset_id` | yes | Stable id (e.g. `LAUNCH-07`, `GS-MIAMI-01`) |
| `surface` | yes | `feed` / `reel` / `story` / `carousel` |
| `claim_text` | yes | Exact claim as published (or draft) |
| `claim_class` | yes | `A_observable` / `B_estimate_labeled` / `C_method` / `D_product` |
| `evidence_ref` | yes | Path, URL, screenshot id, research note |
| `rights_status` | yes | `public_data` / `owned` / `licensed` / `client_authorized` / `n/a` |
| `phi_risk` | yes | `none` / `review_required` / `blocked` |
| `banned_term_scan` | yes | `pass` / `fail` + date |
| `approver` | yes | Named human / founder |
| `publish_status` | yes | `draft` / `approved` / `published` / `killed` |
| `notes` | no | Miami city-series vs student-VOC conflict clarifications, etc. |

## Initial rows (Phase-1 launch grid)

| asset_id | surface | claim_text | claim_class | evidence_ref | rights_status | phi_risk | banned_term_scan | approver | publish_status | notes |
|----------|---------|------------|-------------|--------------|---------------|----------|------------------|----------|----------------|-------|
| LAUNCH-01 | carousel | Practices lose patients across four surfaces, not four separate problems | C_method | CAESTHETIC_IG_GROWTH_PROGRAM.md §2 | n/a | none | pending | founder | draft | Four-Surface model |
| LAUNCH-02 | carousel | We score aesthetic practices before we pitch them | D_product | DEC-812 · Growth Score $0 | n/a | none | pending | founder | draft | Growth Score entry |
| LAUNCH-03 | carousel | After Growth Score → $2,500 30-Day Sprint → optional Growth System | D_product | DEC-812 · pricing SSOT | n/a | none | pending | founder | draft | No retainer claim |
| LAUNCH-04 | static | Consistency Gap across Search/Web/Social/Reputation | C_method | program §2 Cross-Surface Consistency | n/a | none | pending | founder | draft | |
| LAUNCH-05 | carousel | Google Maps rating alone is not enough | C_method | program §3 P2 | public_data | none | pending | founder | draft | Observable ops claim |
| LAUNCH-06 | carousel | Booking flow is part of marketing | C_method | program §3 P2 | n/a | none | pending | founder | draft | |
| LAUNCH-07 | carousel | Growth Score Breakdown: Miami Med Spa (public/observable only) | A_observable | city research pack TBD | public_data | none | pending | founder | draft | **Miami = city series OK.** Not Miami student/VOC conflict scheduling. |
| LAUNCH-08 | static | Don't buy more traffic yet | C_method | program launch unit 8 | n/a | none | pending | founder | draft | |
| LAUNCH-09 | carousel | How we think about reviews (neutral capture / velocity) | C_method | program §8 | n/a | none | pending | founder | draft | No review gating |

## Explicit non-rows (fail-closed)

Do **not** add ledger rows for:

- `COPY-VOC-021…028` or any `COPY-VOC-*`
- Comment FIRST / Comment NEXT keyword magnets
- Academy student attraction packs (DEC-793 Phase-0)
- TG Story CTA as controller of Phase-1 feed cadence
- London Europe work-window as Phase-1 CAE publish authority (US Phase-1; London window is Valerie/Simon fleet default only)

## How to extend

1. Draft claim → add row with `publish_status=draft`.
2. Attach evidence + rights.
3. Run `node scripts/guards/cae-phase1-banned-terms.mjs <caption-or-slides.txt>`.
4. Complete compliance checklist.
5. Founder APPROVED → `publish_status=approved` then `published`.
