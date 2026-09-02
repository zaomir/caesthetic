# CAESTHETIC — Design Thesis: Clinical Editorial Intelligence
**Version:** 2.1 · September 2026
**Status:** Active
**Previous direction:** dark purple/magenta SaaS gradient — fully replaced

---

## 1. Design Concept

**Clinical Editorial Intelligence**

### Design Thesis

CAESTHETIC should read like a specialist diagnostic brief: evidence before persuasion, explicit uncertainty and editorial hierarchy rather than dashboard decoration.

### Anti-attributes

No synthetic client proof, beauty-spa styling, generic AI SaaS treatment, card soup, gradients, glassmorphism, ornamental motion or anonymous “success” claims.

### Signature Idea

The signature is an evidence ledger: ruled surface summaries, mono data values and traceable evidence rows that make each diagnostic judgment inspectable.

The visual language of a specialized industry journal, analytical intelligence report, and premium B2B operating system — serving specialist practitioners (dental, aesthetic medicine, beauty) who make evidence-based business decisions.

**What it is NOT:**
- Not AI SaaS (no glowing orbs, no gradient everything)
- Not beauty spa (no soft pink, no floral metaphors)
- Not luxury cosmetics (no pseudo-serif italic, no gold)
- Not generic marketing agency (no stock handshakes, no "we grow brands" genericness)
- Not crypto/startup landing (no glassmorphism, no particle effects)

**The emotional register:** A client looking at this site should feel they are reading a well-researched intelligence brief — authoritative, precise, unfussy, and completely in command of the subject.

---

## 2. Typography System

### Primary pairing: Source Serif 4 + IBM Plex Sans

| Role | Family | Weights | Use |
|------|--------|---------|-----|
| Display / Headings | Source Serif 4 | 300, 400, 600 | H1, H2, H3, pull quotes |
| Body / UI | IBM Plex Sans | 300, 400, 500, 600, 700 | All body text, labels, nav, buttons |
| Data / Code | IBM Plex Mono | 400, 500 | Ratings, numbers, evidence strip values |

**Rationale:**
- **Source Serif 4:** A contemporary optical-size-aware serif with unusual readability at large display sizes and genuine warmth at smaller sizes. Used widely in scientific publishing and editorial design. Carries "institution" not "luxury."
- **IBM Plex Sans:** Systems-grade, technical credibility, distinct enough to be recognizable. Used in IBM documentation, developer tools, data dashboards. Carries "precision operating system."
- **IBM Plex Mono:** For the evidence numbers, ratings, and data outputs — signals that numbers came from measurement, not marketing copy.

### Anti-patterns avoided
- Inter, Roboto, Arial, system-ui as primary (too generic)
- Pseudo-luxury italic serif (Canela, Freight Display — too spa/cosmetics)
- Weight mixing chaos (no pairing 9 different weights)

### Google Fonts URL (production `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap">
```

**Self-hosting alternative:** Download from Google Fonts helpers and place `.woff2` files under `site-caesthetic/assets/fonts/`. Update `@font-face` declarations in `tokens.css`. Fonts directory at `assets/fonts/` is scaffolded but empty — integrator fills in if self-hosting is preferred.

---

## 3. Color System

### Philosophy: Warm Parchment + Clinical Precision

Light editorial surface (not dark) because this is analytical intelligence, not night-mode SaaS. The surface reads like a premium printed report.

### Token palette

| Token | Value | Role |
|-------|-------|------|
| `--cae-bg` | `#F5F7F8` | Cool clinical paper — primary background |
| `--cae-bg-2` | `#F0EDE6` | Slightly deeper — section alternation |
| `--cae-bg-3` | `#E8E4DB` | Tonal depth — pulled sections, data panels |
| `--cae-bg-dark` | `#1A1714` | Editorial dark — reversed sections |
| `--cae-bg-dark-2` | `#231F1C` | Dark surface — footer, dark cards |
| `--cae-border` | `#D4CFC5` | Standard rule |
| `--cae-border-strong` | `#1A1714` | Ink rule — primary emphasis |
| `--cae-border-data` | `#B8B2A6` | Data table rule |
| `--cae-text` | `#1A1714` | Charcoal — primary text |
| `--cae-text-strong` | `#0D0B09` | Editorial black — headlines |
| `--cae-muted` | `#6B6560` | Warm stone — secondary text |
| `--cae-muted-2` | `#9E9893` | Lighter — captions, footnotes |
| `--cae-accent` | `#1C3A4A` | Clinical navy — institutional confidence |
| `--cae-accent-light` | `#E8EFF3` | Accent tint — table headers, highlights |
| `--cae-signal` | `#7B244B` | Crimson signal — CTAs, priority flags, alerts |
| `--cae-signal-light` | `#F5E8EC` | Signal tint — priority backgrounds |
| `--cae-data-positive` | `#2A5C40` | Clinical green |
| `--cae-data-positive-bg` | `#E8F2EC` | — |
| `--cae-data-negative` | `#7B1F1F` | Risk red |
| `--cae-data-negative-bg` | `#F5E8E8` | — |
| `--cae-data-warning` | `#7A4000` | Amber |
| `--cae-data-warning-bg` | `#F5EDDB` | — |
| `--cae-data-neutral` | `#3D4F5A` | Reference/benchmark |

### Banned
- Hex values in component CSS (use tokens only)
- Purple (`#a855f7`, `#818cf8`, etc.) — entirely removed
- Magenta (`#e879f9`, `#c026d3`) — entirely removed
- Gradients on brand surfaces (allowed only in data visualization contexts, scoped)
- Glowing shadows (`box-shadow: 0 0 60px rgba(...)`)

---

## 4. Geometry

### Philosophy: Clinical precision over decorative radius

| Token | Value | Rationale |
|-------|-------|-----------|
| `--cae-radius-sm` | `2px` | Barely-there — signals precision |
| `--cae-radius` | `4px` | Default panels |
| `--cae-radius-lg` | `6px` | Form elements |

- No pill/rounded shapes (999px) — too SaaS/marketing
- Borders are the primary structural separator (horizontal rules, not shadows or cards)
- No `box-shadow` on structural elements — borders only
- Focus states use `outline` + `--cae-outline-focus` token

---

## 5. Signature Component: Demand Map / Evidence Strip

The `cae-evidence-strip`, `cae-demand-map` and canonical Growth Score Hero Client Journey Map are the defining visual artifacts of CAESTHETIC.

### Growth Score Hero Client Journey Map

The canonical title is `Where Clients Are Gained - and Lost`. Production uses deterministic HTML/SVG, never the raster reference. Its visual signature is a client identity at centre, gray Lead Intake boundary ring, four status-coded surface orbits, evidence-coded asymmetric paths, a strict right legend, three-part decision block and a navy Outside-In Diagnosis strip.

Diagnostic color is semantic and duplicated in labels. Surface health (`PROTECT / WATCH / FIX NOW / NEEDS VERIFICATION`) is visually distinct from journey-edge state (`CLEAN / FRICTION / BROKEN / NOT ASSESSED`). A route segment never inherits another node/segment's color. On mobile, show one evidence-backed representative route vertically instead of scaling the desktop SVG.

### Evidence Strip (`cae-evidence-strip`)

A data readout bar showing the full commercial evidence profile for a location. Looks like a diagnostic instrument panel.

**Semantics:**
```html
<div class="cae-evidence-strip" data-animate="true" role="region" aria-label="Location evidence">
  <div class="cae-evidence-strip__cell">
    <span class="cae-evidence-strip__label">Rating</span>
    <span class="cae-evidence-strip__value" data-count="4.7">4.7</span>
    <span class="cae-evidence-strip__unit">/ 5.0</span>
  </div>
  <div class="cae-evidence-strip__cell">
    <span class="cae-evidence-strip__label">Reviews</span>
    <span class="cae-evidence-strip__value" data-count="312">312</span>
    <span class="cae-evidence-strip__delta cae-evidence-strip__delta--positive">+47 MoM</span>
  </div>
  <div class="cae-evidence-strip__cell">
    <span class="cae-evidence-strip__label">vs nearest competitor</span>
    <span class="cae-evidence-strip__value cae-evidence-strip__value--negative">–41</span>
    <span class="cae-evidence-strip__delta cae-evidence-strip__delta--negative">reviews behind</span>
  </div>
  <div class="cae-evidence-strip__cell">
    <span class="cae-evidence-strip__label">Network coverage</span>
    <span class="cae-evidence-strip__value">3 <span class="cae-evidence-strip__of">of 5</span></span>
    <span class="cae-evidence-strip__sub">platforms active</span>
  </div>
  <div class="cae-evidence-strip__cell cae-evidence-strip__cell--priority">
    <span class="cae-evidence-strip__label">Fix priority</span>
    <span class="cae-evidence-strip__priority" data-level="high">Response rate</span>
    <span class="cae-evidence-strip__priority-sub">23% unanswered</span>
  </div>
</div>
```

**Modifier classes:**
- `cae-evidence-strip__value--positive` — applies green ink
- `cae-evidence-strip__value--negative` — applies red ink
- `cae-evidence-strip__delta--positive` / `--negative` — delta badges
- `cae-evidence-strip__cell--priority` — signals the priority fix cell with crimson accent
- `data-level="high|medium|low"` on `.cae-evidence-strip__priority` — color-codes urgency

### Demand Map (`cae-demand-map`)

A horizontal journey visualization: Search → Trust → Enquiry → Booking → Visit → Return. Clickable/hoverable stages with fault highlighting.

```html
<div class="cae-demand-map" role="list" aria-label="Demand journey stages">
  <div class="cae-demand-map__stage is-active" role="listitem" data-stage="search">
    <span class="cae-demand-map__num">01</span>
    <div class="cae-demand-map__content">
      <strong class="cae-demand-map__title">Search</strong>
      <span class="cae-demand-map__sub">Local discovery</span>
    </div>
  </div>
  <!-- 5 more stages: Trust, Enquiry, Booking, Visit, Return -->
</div>
```

**Stage states:**
- Default: neutral bordered stage
- `.is-active` — navy left border, label in `--cae-accent`
- `.is-fault` — crimson signal border, label in `--cae-signal`
- Stage click (JS) calls `cae-demand-map__stage--detail` panel below

---

## 6. Motion Policy

**Principle: motion serves comprehension, never decoration.**

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Mobile nav open/close | `translateX` slide | 220ms `ease-out` |
| Dropdown open/close | `opacity` + `translateY(4px)` | 140ms |
| Evidence strip appear (IntersectionObserver) | `opacity` 0→1 + `translateY(8px)→0` | 380ms staggered |
| Evidence strip counter (JS) | Number count-up | 800ms |
| Priority cell highlight | Background flash | 220ms |
| Demand stage active | Left border grow | 140ms |
| Form step transition | `opacity` cross-fade | 220ms |
| CTA hover | Border color + text transition | 140ms |

**All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)` and suppressed otherwise.**

---

## 7. Layout Philosophy

- **Primary grid:** editorial columns separated by border rules, not gaps/shadows
- **No identical 3-column card soup everywhere** — vary grid density by content type
- **Numbered items** (01, 02, 03) throughout — reinforces systematic, analytical character
- **Horizontal rules** as primary structural separator
- **Evidence-first hierarchy:** data panels precede prose explanations
- **Pull stats:** large mono-font numbers in parchment cells

---

## 8. Anti-patterns Reference

| Forbidden pattern | Why | Alternative |
|---|---|---|
| `background: linear-gradient(135deg, #c026d3 0%, ...)` | SaaS/AI slop | Solid `--cae-accent` |
| `box-shadow: 0 0 60px rgba(192, 38, 211, 0.18)` | Glowing orb | `border: 1px solid --cae-border-strong` |
| `border-radius: 999px` | Pill soup | `border-radius: var(--cae-radius-sm)` |
| Stock "doctor photo", women in towels | Unrelated imagery | Evidence data, location maps, actual metrics |
| Autoplay carousels | Scrolljacking | Static evidence grid |
| Fake testimonials placeholder | Dishonest | `cae-testimonial-placeholder` honest empty state |
| `font-family: Inter, system-ui` | Generic | `IBM Plex Sans` |
| `font-family: Georgia, Times` | Too generic serif | `Source Serif 4` |

---

## 9. Responsive Strategy

Breakpoints supported (no horizontal overflow at any):

| px | Context | Key changes |
|---|---|---|
| 320 | Small phones | Single column, hero text ≥2.8rem |
| 360–390 | Android/iPhone standard | Default mobile |
| 430 | iPhone Pro Max | Relaxed padding |
| 768 | Tablet | 2-column layouts emerge |
| 1024 | Desktop start | Full nav visible, evidence strip inline |
| 1280–1440 | Standard desktop | Full layouts |
| 1920 | Wide | Max-width container contains layout |

Nav breakpoint: 1024px (switch from hamburger to desktop nav)

---

## 10. File Handoff

| File | Purpose |
|------|---------|
| `_handoff/lane-b/tokens.css` | Replace `assets/css/tokens.css` |
| `_handoff/lane-b/caesthetic.css` | Replace `assets/css/caesthetic.css` |
| `_handoff/lane-b/header.html` | Replace `templates/header.html` |
| `_handoff/lane-b/footer.html` | Replace `templates/footer.html` |
| `_handoff/lane-b/HANDOFF.md` | Merge instructions for integrator |
| `assets/js/caesthetic.js` | Updated in place (not in conflict list) |

See `_handoff/lane-b/HANDOFF.md` for exact merge procedure.


## Integrator palette correction (2026-07-30)

Surface tokens were cooled from warm parchment to clinical paper (`#F5F7F8`) to avoid the generic AI cream/beige look while preserving Clinical Editorial Intelligence.
