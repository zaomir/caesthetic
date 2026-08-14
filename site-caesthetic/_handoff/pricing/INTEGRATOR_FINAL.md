# CAESTHETIC Pricing — Final integrator report

**Branch:** `cursor/caesthetic-pricing-page-22f0`  
**Date:** 2026-07-31  
**Deploy:** NOT executed (awaiting explicit founder command per §4.12)

## DoD checklist

| Item | Status |
|------|--------|
| Prices/rates only in `src/config/pricing.ts` (+ JSON mirror / API reader) | PASS |
| Fixed Fee + Partnership for every service | PASS |
| Formula max(30% Fixed, 7% ACR) + multi-service once | PASS (17/17 tests) |
| 3% activation + external costs explained | PASS |
| No patient attribution / review pay / guarantees | PASS |
| Wording “70% lower fixed fee” (not “70% off”) | PASS |
| RU/EN pages + hreflang | PASS |
| CTA Fixed → assessment `?engagement=fixed` | PASS |
| CTA Partnership → assessment `?engagement=partnership` | PASS |
| Assessment states partnership is not auto-accepted | PASS |
| Telegram helper without inventing t.me URL | PASS (fallback `/contact/`) |
| Nav + sitemap wired | PASS |
| AI routes untouched | PASS |
| Unit/QA suite | PASS `node tests/caesthetic/run-pricing.mjs` |
| Local static smoke | PASS 200 on `/pricing/`, `/ru/pricing/`, assets |
| Production deploy | BLOCKED until explicit command |

## Canonical URLs

- https://caesthetic.com/pricing/
- https://caesthetic.com/ru/pricing/

## Next (founder)

```bash
cd /var/www/grainee-v2 && git pull --ff-only origin main
# after merge
bash scripts/deploy-caesthetic.sh
curl -fsS -o /dev/null -w '%{http_code}\n' https://caesthetic.com/pricing/
curl -fsS -o /dev/null -w '%{http_code}\n' https://caesthetic.com/ru/pricing/
```
