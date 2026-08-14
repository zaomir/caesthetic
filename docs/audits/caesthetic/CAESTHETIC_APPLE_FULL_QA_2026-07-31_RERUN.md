# CAESTHETIC Apple Full Site QA — 2026-07-31 RERUN

**Role:** Independent Apple-style production QA (do not trust prior PASS)  
**Production URL:** https://caesthetic.com/  
**Fix commit SHA:** `6fd7b0a71`  
**Docs commit SHA:** `f1b660c0f`  
**Pre-fix Worker:** `grainee-caesthetic-public` · `1d93f12a-ff90-4b29-90ce-f8fba71b6aad`  
**Post-fix Worker:** `grainee-caesthetic-public` · `effe4e10-82b2-4e82-b849-1db425a37ef3`  
**Edge:** `x-grainee-edge: stage5`  
**Evidence:** `docs/audits/caesthetic/evidence/2026-07-31-apple-rerun/`  
**Regression evidence:** `docs/audits/caesthetic/evidence/2026-07-31-apple-rerun-regression/`  
**Harness:** `scripts/qa/caesthetic-apple-full-qa.mjs`

## Verdict

# **PASS**

Open findings after fix + regression: **BLOCKER 0 · HIGH 0 · MEDIUM 0 · LOW 0**

---

## Baseline (bootstrap)

| Field | Value |
|-------|--------|
| Brand | CAESTHETIC |
| Legal | OXFORD PROJECTS LTD |
| Production H1 | Built to be found. Trusted. Chosen. |
| Title | CAESTHETIC — Growth systems for specialist practices |
| `x-grainee-edge` | stage5 |
| Authority blob SHA256 | see `evidence/.../authority_blob_sha256.txt` |
| index.html | `82a5128b806f5032885904ce7fb4f91bc42bce40d279d9c553a183a3122af1e6` |
| caesthetic.css (pre-fix) | `429a86c8b382615ad4aade7fbfc770702953409f9ca29803b8fb731bd883a63e` |

---

## §2 User-Agent matrix (cache-bust)

All UAs received the **new B2B site**. No UA branching / Skin Rejuvenation payload.

| UA | HTTP | cf-cache | edge | Growth systems | Demand Infra | Skin Rejuvenation Network |
|----|------|----------|------|----------------|--------------|---------------------------|
| Chrome desktop | 200 | HIT | stage5 | present | 0 | 0 |
| Safari-like | 200 | HIT | stage5 | present | 0 | 0 |
| Googlebot | 200 | HIT | stage5 | present | 0 | 0 |
| Bingbot | 200 | HIT | stage5 | present | 0 | 0 |
| curl default | 200 | HIT | stage5 | present | 0 | 0 |

Evidence: `evidence/2026-07-31-apple-rerun/ua_matrix.json`

**Conclusion:** Prior crawler Skin Rejuvenation sighting is **not** reproducible on current production for any checked UA. Likely stale cache / old Worker version / historical crawl — not live UA branching.

---

## Viewport matrix

`320×568`, `375×812`, `390×844`, `430×932`, `768×1024`, `1024×768`, `1280×800`, `1440×900`, `1920×1080`

## Pages covered

`/`, `/dental/`, `/beauty/`, `/aesthetic-medicine/`, `/maps-reputation/`, `/solutions/`, `/work/`, `/insights/`, `/process/`, `/about/`, `/assessment/`, `/contact/`, `/faq/`, `/legal/privacy|terms|cookies/`, `/accessibility/`, all `/go/*` landings listed in SSOT, branded `/404/`, unknown path.

## HTTP / SEO / routing

| Check | Result |
|-------|--------|
| Core IA | New B2B titles + H1s |
| Legacy Skin / treatments / cities / partners / infrastructure | **301** to new IA |
| Unknown URL | **404** branded page (not SPA fallback) |
| www → apex | **301** |
| HTTP → HTTPS | **301** |
| robots.txt | `Disallow: /go/` present (CF managed signals prepended) |
| sitemap | Core products present; `/go/` absent |
| `/go/*` | `noindex,follow` |
| Assets CSS/JS/logo | 200 |
| Cutover smoke | `SMOKE_PASS=true` |

---

## Interactive

Home → mobile menu → Dental → Assessment → fill fields → Tab → submit → **success state**  
Escape closes menu; body unlocks; `prefers-reduced-motion` exercised in interactive context.

Screens: `m390-nav-open.png`, `m390-assessment-filled.png`, `m390-assessment-submit.png`

---

## Finding fixed during this RERUN

| Sev | Issue | Fix |
|-----|-------|-----|
| HIGH | `/assessment/` form lives in `.cae-section--dark` but labels/list used light-theme near-black text (`#0B1013`) → unreadable on charcoal. Visible after submit in first Apple pass screenshots. | Dark-section form/list token overrides in `site-caesthetic/assets/css/caesthetic.css`; remove hex inline styles; add `.cae-form__consent` / `.cae-form__note` in `assessment/index.html` |

Deployed: static rsync to `.194` + Worker cutover → Version `effe4e10-82b2-4e82-b849-1db425a37ef3` + CF file purge (`CF_API_TOKEN`).

---

## Harness hardening (non-product)

- Expanded page list to full DoD set  
- Usable overflow gate (`canScrollX`) instead of off-canvas `scrollWidth` false positives  
- Visible/non-nav clipped-CTA filter  
- Assessment focus skips hidden fields  
- PASS requires BLOCKER=HIGH=MEDIUM=0  

---

## Acceptance audit

| Question | Result |
|----------|--------|
| Offer clear in 5s? | **PASS** — Built to be found. Trusted. Chosen. |
| Four products distinct? | **PASS** |
| Maps Reputation = ROVLEX logic, no rating/review guarantees? | **PASS** (disclaimers present; no buy-reviews / guaranteed ranking claims) |
| Proof honest? | **PASS** — selected work / no fake star walls |
| Skin Rejuvenation gone from public core? | **PASS** |
| One next step? | **PASS** — Assessment / maps analysis CTAs |

---

## Regression

Key pages × `320/375/390/430/1440` + UA spot-check Chrome/Googlebot → **PASS** (`regression.json`).  
Dark assessment labels compute to `#F5F7F8` / muted-on-dark after fix.

---

## Residual LOW (non-blocking)

| Sev | Note | Owner |
|-----|------|-------|
| LOW | Origin IP `185.216.214.28` TLS fails without `-k` (Origin CA path) | Platform / CF Origin CA |
| LOW | Purge Everything requires zone-cache token (`CF_API_TOKEN`); Workers token alone returns 401 | Ops |

---

## Final verdict

**PASS** — https://caesthetic.com independent Apple-style RERUN complete; UA matrix clean; contrast HIGH fixed and redeployed; regression PASS.
