# CAESTHETIC pricing — PRODUCTION PASS (2026-07-31)

## Release chain
- PR #571 undrafted: yes
- PR #571 merged: yes → merge SHA `32f2e7760837c3645d0e9ce8f00c0ab4477abbee`
- Expected head SHA matched: `8d5444bd9e5731b83bf05db84aa84f095f02c141`
- Pre-merge tests: 18/18 PASS (`tests/caesthetic/run-pricing.mjs`)
- Edge unblock PR #573 merge SHA `515324cd6b8940f66676f1a9ba450431a817ab7d`
- VDS deploy GHA: https://github.com/zaomir/grainee-v2/actions/runs/30654717378 → `deployed_commit=515324cd6…`
- CF cutover GHA: https://github.com/zaomir/grainee-v2/actions/runs/30654716068 → SUCCESS

## Production smoke
| Check | Result |
|-------|--------|
| EN https://caesthetic.com/pricing/ | HTTP 200; Fixed Fee + Growth Partnership |
| RU https://caesthetic.com/ru/pricing/ | HTTP 200; Fixed Fee + Growth Partnership |
| Formula | EN: "Greater of 30% of the Fixed Fee or 7% of Adjusted Collected Revenue."; API `Math.max` / JSON `max(partnershipMinimum, revenueShareAmount)` |
| Activation | EN: "At least 3%…"; RU: "Не менее 3 %…" — billed separately |
| No 70% off / Save 70% | PASS |
| Canonical / hreflang | EN↔RU + x-default correct |
| CTA Fixed / Partnership | `/assessment/?engagement=fixed` / `…=partnership` (all primary CTAs) |
| Mobile H-scroll | none @390px |
| pricing.json / pricing-api.js / pricing-page.js | HTTP 200; edge == workers.dev byte lengths |
| Browser console | no page errors |

## Edge / origin consistency
- Production serves Cloudflare Worker assets (`x-grainee-edge: stage5`), not stale Worker
- workers.dev `/pricing/` HTTP 200; HTML 15800 bytes matches edge
- Origin `.194` updated by `deploy-caesthetic.sh` (rollback webroot); live edge = Worker ASSETS from cutover of main

## Status
**PRODUCTION PASS**
