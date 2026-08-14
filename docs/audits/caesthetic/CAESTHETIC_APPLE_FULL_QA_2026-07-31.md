# CAESTHETIC Apple Full Site QA — 2026-07-31

**Role:** Apple-style production QA (polish + functional + responsive + a11y smoke)  
**Production URL:** https://caesthetic.com/  
**Edge:** `x-grainee-edge: stage5` · Worker `grainee-caesthetic-public` · Version `1d93f12a-ff90-4b29-90ce-f8fba71b6aad`  
**Evidence:** `docs/audits/caesthetic/evidence/2026-07-31-apple/`  
**Harness:** `scripts/qa/caesthetic-apple-full-qa.mjs` + corrected scroll/bleed pass + Stage 5 cutover smoke

## Verdict

# **PASS** (after HIGH fix shipped)

Open findings after fix + regression: **BLOCKER 0 · HIGH 0 · MEDIUM 1 · LOW 1**

---

## Scope

### Viewport matrix (Playwright Chromium / Safari UA)

| Class | Viewports |
|-------|-----------|
| Mobile | `320×568`, `375×812`, `390×844`, `430×932` |
| Tablet | `768×1024` |
| Desktop | `1024×768`, `1280×800`, `1440×900`, `1920×1080` |

### Pages

`/`, `/dental/`, `/beauty/`, `/aesthetic-medicine/`, `/maps-reputation/`, `/assessment/`, `/contact/`, `/work/`, `/insights/`, `/process/`, `/about/`, `/faq/`, `/solutions/`, `/go/`, `/go/maps-analysis/`, `/go/dental-growth/`, `/go/salon-growth/`, `/legal/privacy/`, branded `/404/`

### Checks

- HTTP 200 + `stage5` edge on core IA
- Legacy Skin Rejuvenation 301s + unknown path 404
- `www` → apex 301, robots.txt (`Disallow: /go/`), sitemap core URLs
- Assets CSS/JS/logo 200
- **Usable** horizontal scroll (`window.scrollX` force) — not raw `body.scrollWidth` (off-canvas nav inflates scrollWidth; `overflow-x: clip` already in place)
- Header / mobile drawer open-close
- CTA path home → dental → assessment; form fill + Tab focus
- Console / pageerror (filtered)
- Visual screenshots key pages @ 320/375/390/430/1440/1920
- Stage 5 private + SEO cutover smoke (`SMOKE_PASS=true`)
- Acceptance lens (offer, four products, no fake proof, no Skin Rejuvenation)

---

## Finding fixed during this QA

| Sev | Issue | Fix |
|-----|-------|-----|
| HIGH | Final product CTA (`.cae-wrap.cae-cta` = `grid 1fr auto`) kept two columns through ≤1024px. Dark-section dual buttons (`Request … assessment` + outline) sat past the right edge (~24–92px). Clipped by `overflow-x: clip` → not scrollable, but CTA partially unusable on iPhone widths. Affects dental / beauty / aesthetic-medicine (and same pattern elsewhere). | `site-caesthetic/assets/css/caesthetic.css` @ `max-width: 1024px`: collapse `.cae-cta` to 1 column; stack `.cae-actions` + full-width buttons; column-flex `.cae-cta-block` |

---

## HTTP / SEO (curl)

| Check | Result |
|-------|--------|
| Core IA titles | New IA (Growth systems / Dental / Beauty / Aesthetic / Maps Reputation) |
| Edge | `x-grainee-edge: stage5` |
| Legacy `/networks/skin-rejuvenation/`, `/treatments/morpheus8/` | **301** → `/aesthetic-medicine/` |
| `/cities/paris/` | **301** → `/assessment/?market=paris` |
| `/partners/` | **301** → `/contact/` |
| `/infrastructure/` | **301** → `/process/` |
| Missing path | **404** |
| `www` → apex | **301** |
| robots / sitemap / assets | **PASS** |
| Cutover smoke private + gates | **SMOKE_PASS=true** |
| Origin direct TLS `185.216.214.28` | WARN self-signed without `-k` (edge path is production) — residual LOW/ops |

---

## Browser / Apple lens

| Gate | Result |
|------|--------|
| Usable horizontal scroll (all matrix) | **PASS** (`canScrollX=false`, `html.scrollWidth==clientWidth`) |
| Mobile nav open | **PASS** (no scrollX; drawer usable) |
| Interactive: menu → Dental → Assessment → fill fields → Tab | **PASS** |
| Assessment form fields | Present (segment, company, contact, consent…) |
| Console pageerrors (core) | **PASS** |
| Visual first viewport (home / dental / aesthetic @ 390 & 1440) | Clean brand-forward hero; stacked CTAs; serif/sans system intact |

### Screenshot set

Under `docs/audits/caesthetic/evidence/2026-07-31-apple/` — includes `m390-home.png`, `m390-dental.png`, `m390-nav-open.png`, `m390-assessment-filled.png`, `d1440-home.png`, full-page homes, product + maps + contact matrix.

---

## Acceptance Audit

| Question | Result |
|----------|--------|
| Offer clear in 5 seconds? | **PASS** — “Built to be found. Trusted. Chosen.” |
| Four products distinct? | **PASS** |
| Enough honest proof? | **PASS** — no fake star walls / “trusted by 10k” |
| AI-slop? | **PASS** — specific clinical/commercial language |
| Skin Rejuvenation gone from primary IA? | **PASS** |
| One next action? | **PASS** — Assessment / maps CTAs dominate |

---

## Residual (non-blocking)

| Sev | Note |
|-----|------|
| MEDIUM | Branded `/404/` has no canonical (acceptable for error page; optional add) |
| LOW | Origin Origin-CA / direct IP TLS still self-signed without `-k` |
| LOW | Inline `style=` residues on some product FAQ blocks — cleanup, not release-blocking |
| Note | First harness pass mis-flagged HIGH via `body.scrollWidth` (off-canvas `.cae-nav`). Correct gate = force `scrollTo(x)` + `html.scrollWidth` |

---

## Regression after CTA CSS fix

Re-check final dark CTA on `/aesthetic-medicine/`, `/dental/`, `/beauty/`, `/maps-reputation/` @ 320/375/390/430: `.cae-cta` → single column (`grid-template-columns` one track); actions `overflow ≤ 0`; `canScrollX=false`. Evidence: `m390-aesthetic-cta-after-fix.png`.

**Machine:** `docs/audits/caesthetic/evidence/2026-07-31-apple/apple_qa_findings.json` (initial) + post-fix probe log in report ship commit.

---

## Final verdict

**PASS** — https://caesthetic.com meets Apple-style production QA bar after shipping the mobile final-CTA stack fix.
