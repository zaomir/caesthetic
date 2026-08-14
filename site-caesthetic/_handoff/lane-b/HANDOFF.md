# Lane B Visual System Handoff — Clinical Editorial Intelligence
**Branch:** `cursor/caesthetic-full-rebuild-cc22`  
**Lane:** B (Frontend — design system rebuild)  
**Status:** Production-ready drafts — awaiting integrator merge  
**Date:** July 2026

---

## Summary of what Lane B delivers

A complete replacement of the CAESTHETIC visual system, retiring the dark purple/magenta/cyan SaaS gradient direction and replacing it with **Clinical Editorial Intelligence**: warm parchment surface, Source Serif 4 + IBM Plex Sans + IBM Plex Mono typography, clinical navy + crimson signal palette, and signature evidence strip / demand map components.

All production conflicts are resolved via draft files — do NOT directly edit existing paths until reading this document.

---

## Files in this handoff

| Handoff file | Target production path | Action |
|---|---|---|
| `_handoff/lane-b/tokens.css` | `assets/css/tokens.css` | Replace entirely |
| `_handoff/lane-b/caesthetic.css` | `assets/css/caesthetic.css` | Replace entirely |
| `_handoff/lane-b/header.html` | `templates/header.html` | Replace entirely |
| `_handoff/lane-b/footer.html` | `templates/footer.html` | Replace entirely |

### Already committed to production path (not in conflict list)
| File | Status |
|---|---|
| `assets/js/caesthetic.js` | ✅ Updated in-place |
| `DESIGN.md` | ✅ Written to canonical path |

---

## Merge procedure (integrator)

```bash
cd /var/www/grainee-v2
git pull --ff-only origin cursor/caesthetic-full-rebuild-cc22

# 1. Backup existing production files
cp site-caesthetic/assets/css/tokens.css     site-caesthetic/assets/css/tokens.css.bak
cp site-caesthetic/assets/css/caesthetic.css site-caesthetic/assets/css/caesthetic.css.bak
cp site-caesthetic/templates/header.html     site-caesthetic/templates/header.html.bak
cp site-caesthetic/templates/footer.html     site-caesthetic/templates/footer.html.bak

# 2. Copy handoff files to production paths
cp site-caesthetic/_handoff/lane-b/tokens.css     site-caesthetic/assets/css/tokens.css
cp site-caesthetic/_handoff/lane-b/caesthetic.css site-caesthetic/assets/css/caesthetic.css
cp site-caesthetic/_handoff/lane-b/header.html    site-caesthetic/templates/header.html
cp site-caesthetic/_handoff/lane-b/footer.html    site-caesthetic/templates/footer.html

# 3. Stage and commit
git add site-caesthetic/assets/css/ site-caesthetic/templates/
git commit -m "feat(caesthetic): promote Lane B Clinical Editorial visual system to production"

# 4. Push and deploy
git push origin cursor/caesthetic-full-rebuild-cc22
bash scripts/deploy-caesthetic.sh

# 5. Smoke check
curl -sI https://caesthetic.com/ | head -5
curl -s https://caesthetic.com/ | grep -c "cae-header"
```

---

## Typography setup required

The new token system uses Google Fonts (Source Serif 4 + IBM Plex Sans + IBM Plex Mono). For best performance, add these `<link>` tags to **every HTML page `<head>`**, before the stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap">
```

The `@import` in `tokens.css` serves as a CSS fallback if the `<link>` tags are absent. Both are included for belt-and-suspenders delivery — remove the `@import` once `<link>` tags are in all pages (the `@import` adds a serial render-blocking request).

**Self-hosting alternative:** Download `.woff2` files from Google Fonts Helper, place under `assets/fonts/`, and add `@font-face` declarations to `tokens.css`. The `assets/fonts/` directory is already scaffolded.

---

## New HTML elements in header/footer

### New in `header.html`
1. **Solutions dropdown** — requires a `cae-nav__item` wrapper with `cae-nav__dropdown` panel. JS (`caesthetic.js v2.0`) drives open/close, keyboard navigation (Enter/Space/Escape/ArrowDown/ArrowUp), and click-outside close.
2. **Mobile menu button** — button now uses `<span class="cae-menu-btn__bar">` for animated X transform. Old `<span></span>` pattern should be replaced.
3. **Insights link** — new nav item `/insights/` — confirm page exists or remove link.
4. **aria-label** on menu button is explicit.

### New in `footer.html`
1. **4-column grid** — was 3-column. Added "Solutions" as a 3rd column.
2. **Legal links row** — Privacy policy, Terms, Cookies, Accessibility at `/legal/privacy/`, `/legal/terms/`, `/legal/cookies/`, `/accessibility/`. Create these pages or update hrefs to `/404/` temporarily.
3. **Full disclaimer** — expanded from single sentence to multi-sentence covering rankings, reviews, revenue.
4. **`cae-footer__corp`** — replaces old `cae-footer__bottom` text pattern.

---

## CSS class changes: backward compatibility

All existing `cae-*` class names from caesthetic.css v1 are preserved in v2. New classes added:
- `cae-evidence-strip` / `cae-evidence-strip__cell` / `cae-evidence-strip__value` / `cae-evidence-strip__delta` / `cae-evidence-strip__priority`
- `cae-demand-map` / `cae-demand-map__stage`
- `cae-case-card` / `cae-article-card`
- `cae-testimonial-placeholder`
- `cae-comparison-table`
- `cae-rating-dist` / `cae-rating-hero`
- `cae-network-block`
- `cae-legal-page`
- `cae-404`
- `cae-badge` variants
- `cae-btn--accent` / `cae-btn--signal` / `cae-btn--ghost` / `cae-btn--outline-inv`
- `cae-form-step` / `cae-form-progress`

**Removed/replaced token variables** (update in any inline usage):
| Old | New |
|---|---|
| `--cae-purple` | `--cae-accent` (navy) |
| `--cae-magenta` | removed |
| `--cae-pink` | removed |
| `--cae-rose` | removed |
| `--cae-cyan` | removed |
| `--cae-gradient-brand` | removed |
| `--cae-gradient-hero` | removed |
| `--cae-gradient-cta` | removed |
| `--cae-gradient-card` | removed |
| `--cae-bg` (was `#07050d`) | `--cae-bg` (now `#F7F5F0` — light parchment) |
| `--cae-surface` | `--cae-bg-2` |
| `--cae-border-strong` (was magenta) | `--cae-border-strong` (now near-black) |
| `--cae-font` (was Inter) | `--cae-font` (now IBM Plex Sans) |
| `--cae-font-display` (was Inter) | `--cae-font-display` (Source Serif 4) |
| `--cae-shadow-glow` | removed |
| `--cae-radius-pill` | removed |

---

## JavaScript changes: caesthetic.js v2.0

- Modules: shell, year, active-nav, mobile-nav, dropdown, evidence, demand-map, multi-step form, forms, rating bars, smooth scroll
- `prefers-reduced-motion` respected at JS level (counter animation, smooth scroll)
- No external dependencies — vanilla IIFE, IE11-compatible syntax
- `caesthetic-config.js` no longer needed if it was a stub — can be removed from pages
- `window.onload` / `DOMContentLoaded` mount pattern preserved

---

## Pages requiring updates post-merge

These pages reference old `data-page` values or navigation items:

| File | Change needed |
|---|---|
| `index.html` | Add Google Fonts `<link>` tags |
| All `*/index.html` | Add Google Fonts `<link>` tags |
| `about/index.html` | `data-page="about"` ✅ unchanged |
| New: `/insights/` | Create index.html with `data-page="insights"` |
| New: `/legal/privacy/` | Legal page template |
| New: `/legal/terms/` | Legal page template |
| New: `/legal/cookies/` | Legal page template |
| New: `/accessibility/` | Accessibility statement |

If `/insights/` does not exist, remove the nav link from `header.html` before merge (the footer link can remain pointing to a 404 redirect temporarily).

---

## Smoke tests for Verifier

```bash
# HTML loads
curl -sI https://caesthetic.com/ | grep "200"

# CSS loads
curl -sI https://caesthetic.com/assets/css/caesthetic.css | grep "200"
curl -sI https://caesthetic.com/assets/css/tokens.css | grep "200"

# JS loads
curl -sI https://caesthetic.com/assets/js/caesthetic.js | grep "200"

# Evidence strip class in CSS
grep -c "cae-evidence-strip" site-caesthetic/assets/css/caesthetic.css

# No purple/magenta hex in handoff CSS
grep -n "#a855f7\|#e879f9\|#c026d3\|#ec4899\|818cf8" \
  site-caesthetic/_handoff/lane-b/tokens.css \
  site-caesthetic/_handoff/lane-b/caesthetic.css

# No inline styles in handoff HTML
grep -n 'style="' \
  site-caesthetic/_handoff/lane-b/header.html \
  site-caesthetic/_handoff/lane-b/footer.html

# No Tailwind CDN
grep -n "tailwindcss\|tailwind.config" \
  site-caesthetic/_handoff/lane-b/caesthetic.css

# prefers-reduced-motion present
grep -c "prefers-reduced-motion" site-caesthetic/assets/css/caesthetic.css
```

Expected failures: the purple/magenta hex grep should return 0 matches. The reduced-motion grep should return ≥2.

---

## Design thesis summary

See `site-caesthetic/DESIGN.md` for full thesis. Key points:
- **Surface:** Light warm parchment (#F7F5F0) — NOT dark SaaS
- **Typography:** Source Serif 4 (display) + IBM Plex Sans (UI) + IBM Plex Mono (data)
- **Accent:** Clinical navy `--cae-accent: #1C3A4A`
- **Signal:** Crimson `--cae-signal: #7B244B` (retained from v1)
- **No gradients** on brand elements — solid borders as primary structure
- **Signature component:** `cae-evidence-strip` — demand map data readout
- **Nav breakpoint:** 1024px (was 980px)
