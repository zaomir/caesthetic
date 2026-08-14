# CAESTHETIC Full Site QA + Acceptance Audit — 2026-07-31

**Production URL:** https://caesthetic.com/  
**HEAD SHA:** `25a6d2ae016c451df880960bbd2b0a3ce1fe7ab5`  
**Worker:** `grainee-caesthetic-public`  
**Worker version (final regression):** `f7419345-ca9a-4e7c-bd86-10d63197bff3`  
**Origin:** `185.216.214.28` (VPS2402) · routes attached · `x-grainee-edge: stage5`  
**Evidence:** `docs/audits/caesthetic/evidence/2026-07-31/`

## Verdict

# **PASS**

All required Production QA gates and Acceptance Audit criteria cleared. Open findings at BLOCKER / HIGH / MEDIUM = **0** after fix + regression.

---

## Scope executed

### Viewport matrix

| Class | Viewports |
|-------|-----------|
| Desktop | `1280×800`, `1440×900`, `1920×1080` |
| Mobile | `320×568`, `375×812`, `390×844`, `430×932` |

### Pages

`/`, `/dental/`, `/beauty/`, `/aesthetic-medicine/`, `/maps-reputation/`, `/assessment/`, `/contact/`, `/work/`, `/insights/`, `/go/` + all `/go/*` landings, `/404/` (branded), plus legacy URL probes.

### Checks

Horizontal scroll (usable `window.scrollX`), header / mobile menu, CTA + forms, focus/keyboard on forms, console errors, canonical, robots + `/go/` noindex, legacy 301s, sitemap, robots.txt site rules, responsive typography, absence of Skin Rejuvenation primary content on new IA paths.

---

## Fixes shipped during QA (required for PASS)

| Sev | Issue | Fix |
|-----|-------|-----|
| BLOCKER | Legacy Skin Rejuvenation URLs (`/networks/*`, `/treatments/*`, `/cities/*`, `/partners/`, `/infrastructure/`, …) returned **200** with old content (nginx redirects not active on Worker) | Added `CAESTHETIC_LEGACY_REDIRECTS` in `infra/cloudflare/router/src/index.ts` (brand-gated); redeployed Worker |
| HIGH | Unknown paths returned homepage **200** (SPA `not_found_handling`) | Cutover wrangler: `not_found_handling = "404-page"`, `SPA_FALLBACK=false` |
| HIGH | Mobile horizontal overflow from off-canvas `.cae-nav` (`translateX(100%)` expanded scroll area) + inline `grid-template-columns` on `.cae-flow` | `overflow-x: clip` on `html/body`; drawer `translate3d` + `pointer-events`; responsive overrides for inline grids; 430px header CTA shrink |
| — | Routes Edit previously blocked full cutover | Unblocked earlier; full cutover with routes already live |

---

## Production HTTP / SEO (curl)

| Check | Result |
|-------|--------|
| Core IA paths | 200 · `x-grainee-edge: stage5` · new titles (Growth systems / Dental / Beauty / Aesthetic / Maps Reputation) |
| Skin Rejuvenation on core + `/go/*` | **Absent** |
| `/go/*` robots meta | `noindex, follow` |
| Canonicals | Present on sampled core + go pages |
| `robots.txt` | Site rules present after CF managed block: `Disallow: /go/`, `/internal/`, `/private/`, `/_handoff/` + Sitemap |
| `sitemap.xml` | 200 · includes core IA URLs |
| Legacy `/networks/skin-rejuvenation/` | **301** → `/aesthetic-medicine/` |
| Legacy `/treatments/morpheus8/` | **301** → `/aesthetic-medicine/` |
| Legacy `/cities/paris/` | **301** → `/assessment/?market=paris` |
| `/partners/` | **301** → `/contact/` |
| `/infrastructure/` | **301** → `/process/` |
| Missing path | **404** (branded 404 page) |
| `www` → apex | 301 |

---

## Viewport evidence

Screenshots (home, maps-reputation, assessment @ 1440 / 375 / 390):

- `docs/audits/caesthetic/evidence/2026-07-31/reg-d1440-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-d1440-maps-reputation-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-d1440-assessment-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m375-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m375-maps-reputation-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m375-assessment-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m390-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m390-maps-reputation-.png`
- `docs/audits/caesthetic/evidence/2026-07-31/reg-m390-assessment-.png`

Machine log: `docs/audits/caesthetic/evidence/2026-07-31/regression_findings.json` → counts `{BLOCKER:0,HIGH:0,MEDIUM:0}`.

---

## Acceptance Audit (business lens)

| Question | Result | Notes |
|----------|--------|-------|
| Offer clear in 5 seconds? | **PASS** | Home H1: “Built to be found. Trusted. Chosen.” + specialist growth systems framing |
| Four products distinct? | **PASS** | Dental / Beauty / Aesthetic medicine / Maps reputation — separate hubs + nav |
| Enough proof? | **PASS** | Work “Evidence without exaggeration”; maps page depth (~15k text) with operating model; no fake client logos |
| AI-slop? | **PASS** | Specific clinical/commercial language; constrained claims; not generic agency filler |
| Empty/weak pages? | **PASS** | Contact includes details + form + assessment CTA; Work intentionally restrained (consent) |
| One next action per page? | **PASS** | Assessment / maps analysis / contact CTAs dominate; `/go/*` funnel to assessment |
| Maps reputation = ROVLEX-grade product? | **PASS** | Dedicated product page, `/go/maps-analysis/`, `/go/multi-location-snapshot/`, network framing without ranking guarantees |

---

## Residual LOW (not blocking PASS)

- Some pages still carry inline `style=` residues (hex / grids) from Lane A — visual rules partly migrated to CSS overrides; full purge is cleanup, not release-blocking.
- `--cae-muted-2` already at `#4E5963` (≥ prior contrast fix).
- Origin direct TLS to `185.216.214.28` still self-signed without `-k` (edge path is production).

---

## Regression

Re-ran full Playwright matrix + HTTP legacy/404 probes after fixes.

**Result:** `BLOCKER=0` · `HIGH=0` · `MEDIUM=0`

---

## Final verdict

**PASS** — https://caesthetic.com ready for public launch on Worker version `f7419345-ca9a-4e7c-bd86-10d63197bff3`.
