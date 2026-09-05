---
owner: CAESTHETIC / Design + Product
status: active
authority: canonical component standard
version: 1.0.0
created: 2026-09-05
updated: 2026-09-05
scope: reusable Lead-to-Revenue Check · $500 section across CAESTHETIC public pages and Growth Score reports
parent: docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md
design_authority: docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md
website_authority: docs/ssot/WEBSITE_STUDIO_STANDARD.md
copy_contract: check500-section/en-US/1.0.0
placement_contract: check500-two-placement/1.0.0
style_contract: check500-style/1.0.0
reference_asset: docs/ssot/assets/caesthetic/check500-section-style-v1.png
reference_sha256: 1d8d9d0732176f0f459e8ddd76fbd50ed2425baea3e7bda3c83559836a22a375
supersedes_scope:
  - page-local or report-local Check500 styling that diverges from the approved CAESTHETIC Design System and check500-style/1.0.0
  - ad hoc Check500 cards, gradients, rounded SaaS shells, alternate CTA colors, alternate type systems or hidden fine print
---

# CAESTHETIC Check500 reusable section — canonical component standard

## 1. Purpose and authority

This document makes the approved CAESTHETIC Design System operational for the reusable **Lead-to-Revenue Check · $500** section.

It does not change product semantics, price, placement or evidence rules. Those remain controlled by `CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`.

Visual authority is resolved in this order:

1. `CAESTHETIC_LEAD_TO_REVENUE_CHECK.md` — product, exact copy, placement, commercial and evidence meaning.
2. `CAESTHETIC_DESIGN_SYSTEM.md` v3.1+ — shared typography, spacing, accessibility, component and QA rules.
3. This file — exact reusable Check500 component composition using the scoped `check500-style/1.0.0` exception already authorized by the Design System.
4. `site-caesthetic/assets/css/tokens.css` — machine-readable shared tokens.
5. Runtime CSS/HTML — implementation evidence only; it may not silently redefine this contract.

The scoped Check500 palette does **not** redefine the global CAESTHETIC marketing palette and does not authorize other sections to copy the warm-ivory exception automatically.

## 2. Exact copy lock

Every full English Check500 offer section uses exactly this visible copy and order:

1. **H2** — `Do all your enquiries make it to a booking?`
2. **Product line** — `Lead-to-Revenue Check · $500`
3. **Body** — `See what happens after a prospective patient contacts your practice — from the first response and follow-up to booking, consultation and payment — and find where enquiries may be getting lost.`
4. **CTA** — `Check My Lead-to-Revenue Path`
5. **Fine print** — `If you move directly into the next qualifying 30-Day Growth Sprint, your $500 Check fee is credited toward the $2,500 Sprint total.`

No extra eyebrow, badge, price chip, icon label, testimonial, secondary CTA or explanatory sentence may be inserted inside the canonical component. Surrounding page/report content may explain context outside the component as allowed by the parent Check SSOT.

## 3. Visual profile

Style profile: **`check500-style/1.0.0`**.

The component is an editorial decision section, not a SaaS card and not an advertising banner.

### 3.1 Canvas and silhouette

- Section is **full-bleed** across its host surface.
- Scoped background: **warm ivory `#F0EDE6`**.
- Primary text in this component: **deep navy `#0B2438`**.
- Signal/CTA: shared CAESTHETIC signal burgundy **`#7B244B`**; hover/focus-compatible signal variation may use the canonical `--cae-signal-2` role.
- A **1px deep-navy horizontal rule** spans the section at the top and bottom.
- No outer card shell, no elevation, no structural drop shadow, no gradient and no photograph/illustration.
- Alignment is centered from headline through fine print.
- The visual density must remain calm and editorial, with substantial negative space around the content.

### 3.2 Content container

**Website:**

- inner content uses the canonical narrow measure: `--cae-wrap-narrow = min(880px, calc(100% - 40px))`;
- never widen Check500 copy to the default 1180px marketing container merely to fill the viewport.

**Growth Score / Multi-Location parent report:**

- preserve the report host container and print rules;
- Check500 inner content remains no wider than **880px** and never exceeds the report content column;
- on report mobile profile, preserve at least the canonical 20px side gutter;
- Multi-Location focus children do not render this commercial component, per the parent Check SSOT.

### 3.3 Vertical rhythm

Use the CAESTHETIC spacing scale only.

**Desktop / tablet >768px:**

- section block padding: **96px** top and bottom (`--cae-space-24`);
- burgundy dot → H2: **24px**;
- H2 → short burgundy separator: **24px**;
- separator → product line: **24px**;
- product line → body: **16px**;
- body → CTA: **32px**;
- CTA → fine print: **16px**.

**Mobile ≤768px:**

- section block padding: **64px** top and bottom (`--cae-space-16`);
- retain the same relationship between content groups; individual gaps may collapse only to the nearest approved spacing token, never below 16px between semantic blocks.

Do not use fixed section height. The component must grow naturally with translation, text resizing and viewport width.

## 4. Typography

Use only the CAESTHETIC fonts already approved in the Design System and loaded by `tokens.css`.

### 4.1 H2

- Family: **Source Serif 4** / `--cae-font-display`.
- Weight: **300**.
- Size: canonical shared H2 role **`clamp(2rem, 4vw, 3.8rem)`**.
- Line-height: **1.0**.
- Letter-spacing: **-0.03em**.
- Color: scoped deep navy `#0B2438`.
- Text-align: center.
- Measure: approximately **20ch max**; natural two-line wrap is preferred on desktop when the available width produces it.
- Do not force manual `<br>` placement unless an approved locale-specific layout requires it.

### 4.2 Product line

- Family: **IBM Plex Sans** / `--cae-font`.
- Weight: **600**.
- Size: **`--cae-text-xl` (1.25rem / 20px)** on desktop; may resolve to `--cae-text-lg` (1.125rem / 18px) on small mobile only if needed for clean wrapping.
- Line-height: **1.3**.
- Color: scoped deep navy `#0B2438`.
- Centered.
- No pill/badge/background behind the price.

### 4.3 Body

- Family: **IBM Plex Sans** / `--cae-font`.
- Weight: **400**.
- Size: shared lead role **`clamp(1rem, 1.6vw, 1.2rem)`**.
- Line-height: **1.65**.
- Color: scoped deep navy `#0B2438`.
- Maximum readable measure: **60ch**.
- Centered.

### 4.4 Fine print

- Family: **IBM Plex Sans** / `--cae-font`.
- Weight: **400**.
- Size: **`--cae-text-sm` = 0.875rem / 14px minimum**.
- Line-height: **1.5** or greater.
- Color: scoped deep navy `#0B2438` without opacity that compromises contrast.
- Maximum measure: **72ch**.
- Centered and always visible.
- Because the Sprint credit is a material commercial condition, the fine print may not be smaller than 14px, hidden in a tooltip, collapsed, faded to decorative contrast or moved to a separate legal-only surface.

## 5. Canonical motif

The component contains exactly two non-text decorative accents:

1. **Burgundy dot** — one centered circular dot, approximately **8px × 8px**, using `#7B244B`.
2. **Short burgundy separator** — one centered rule, approximately **48px × 2px**, using `#7B244B`, between the H2 and product line.

Both are decorative and MUST be `aria-hidden="true"` or implemented as CSS pseudo-elements so they do not enter the accessibility tree.

Do not add icons, arrows, chevrons, stars, medical symbols, decorative line art, additional dots or product illustrations.

## 6. CTA contract

Visible label is locked to **`Check My Lead-to-Revenue Path`**.

### 6.1 Geometry and typography

- Single centered CTA only.
- Width: **100% up to 520px max**.
- Min-height: **48px**.
- Horizontal/vertical padding follows the shared button baseline: approximately **12px 22–24px**.
- Radius: **2px** / `--cae-radius-sm`.
- Background: **`#7B244B` / `--cae-signal`**.
- Text: white/high-contrast, IBM Plex Sans, **600**, **at least 16px**.
- No uppercase transformation and no exaggerated tracking.
- Long/localized labels may wrap; never clip or use `white-space: nowrap` when it harms 320px layouts.

### 6.2 Interaction states

- Hover: use the canonical signal hover role (`--cae-signal-2`) without scale, glow or shadow animation.
- Keyboard focus: use the canonical visible CAESTHETIC focus treatment (`--cae-outline-focus`) or an equal/higher-contrast implementation.
- Active: preserve label readability and rectangular geometry; no bounce/scale effect.
- Links navigate; `<button>` acts. Use an `<a>` when the CTA navigates to `/lead-to-revenue-check/` or a controlled Check route.
- If loading/submission is ever used in a host context, duplicate activation must be prevented and state must be announced in text/semantics, not only color.

The component itself does not auto-open checkout, auto-submit or redirect based on scroll/dwell behavior.

## 7. Responsive behavior

### Desktop / tablet

- Maintain centered editorial hierarchy.
- The H2 must remain the dominant visual element.
- Product line is clearly second.
- CTA is wide but never becomes a full-browser-width banner.
- Full-bleed rules remain visually thin.

### Mobile ≤768px

- Use **20px side gutters** through the narrow container formula.
- Section padding becomes **64px** top/bottom.
- H2 retains the canonical minimum **2rem**; do not shrink it into body-like typography.
- Body remains at least **16px**.
- Fine print remains at least **14px**.
- CTA becomes full width of the content column while preserving 48px minimum height.
- No horizontal scrolling at 320px.
- No fixed-height box, text clipping or overlap with adjacent sections.

### Text enlargement / zoom

At 200% browser zoom or enlarged text:

- all locked copy remains visible;
- CTA text may wrap;
- no content overlaps the top/bottom rules;
- no horizontal scrolling is introduced by the component itself.

## 8. Accessibility and semantics

- Section uses semantic `<section>` or the equivalent report section structure.
- The locked question is a semantic heading at the correct document level, normally `<h2>`; if host hierarchy requires another heading level, visual role remains H2 and document outline must remain correct.
- Decorative dot and short rule are hidden from assistive technology.
- CTA is keyboard reachable and has visible focus.
- Color is not used to communicate evidence state or necessity of purchase.
- The question `Do all your enquiries make it to a booking?` and `may be getting lost` remain exploratory product language, not a diagnostic claim.
- Material commercial fine print is always perceivable and readable.
- Respect `prefers-reduced-motion`; the canonical component requires no motion and SHOULD remain static.

## 9. Website and report consistency

The website and report versions MUST preserve the same:

- exact copy;
- order;
- centered hierarchy;
- warm-ivory field;
- deep-navy typography;
- burgundy dot and short rule;
- burgundy single CTA;
- visible fine print;
- square/near-square geometry;
- relative spacing and visual calm.

Host-specific adaptation is limited to:

- available content width;
- semantic heading level;
- CTA destination approved for that host;
- report print/PDF pagination behavior.

For PDF/print output, keep the component together on one page where practicable. The CTA must remain a real hyperlink in digital PDF output; never rasterize the full section merely to imitate the reference image.

## 10. Prohibited deviations

The following are non-canonical without an explicit versioned canon update:

- converting the section into a floating card;
- rounded shell radius above the shared 2–4px editorial geometry;
- drop shadow, glow, glass or gradient treatment;
- changing the warm-ivory / deep-navy / burgundy profile;
- using the global cool page background in place of the scoped Check500 field when rendering a full offer section;
- changing Source Serif 4 / IBM Plex Sans roles;
- left-aligning the canonical full offer section;
- adding a second CTA inside the component;
- turning `$500` into a badge, chip or oversized standalone metric;
- adding imagery, icons or stock aesthetic/medical photography;
- hiding or visually minimizing the Sprint-credit fine print below 14px;
- inserting testimonials, guarantees, ROI/patient/revenue claims or unsupported diagnostic language;
- making the section look like a fifth Four-Surfaces tile;
- page-local copy, palette, spacing or component overrides that bypass the design-system contract.

## 11. Implementation mapping

Production implementation SHOULD reuse shared CAESTHETIC tokens and components instead of copying literal values, except for the scoped `check500-style/1.0.0` palette values explicitly authorized here and in Design System §10.

Shared machine authority:

- `site-caesthetic/assets/css/tokens.css`
- `site-caesthetic/assets/css/caesthetic.css`
- report CSS/profile defined by `CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`

Recommended reusable hook/class contract when runtime implementation is standardized:

- root: `[data-cae-check500-section]`
- headline: `[data-cae-check500-title]`
- product line: `[data-cae-check500-product]`
- body: `[data-cae-check500-body]`
- CTA: `[data-cae-check500-cta]`
- fine print: `[data-cae-check500-credit]`

These names are implementation hooks, not permission for page-local style forks.

## 12. Acceptance checklist

A full Check500 section is conformant only when all are true:

- exact `check500-section/en-US/1.0.0` copy is present;
- product line renders `Lead-to-Revenue Check · $500` visibly;
- section background is `#F0EDE6`;
- headline/body are deep navy `#0B2438`;
- CTA is burgundy `#7B244B`, single, centered and at least 48px high;
- Source Serif 4 is used for the H2 and IBM Plex Sans for product/body/CTA/fine print;
- narrow content measure is respected;
- top/bottom rules, one dot and one short separator are present;
- no card shell, gradients, shadows, imagery or extra CTA are present;
- fine print is visible at 14px minimum;
- 320px mobile has no overflow or clipped copy;
- keyboard focus is visible;
- 200% zoom/text enlargement does not hide content;
- report/PDF version preserves readable hierarchy and a functioning link;
- the section does not imply a proven internal leak or a fifth scored surface.

## 13. Change control

A material change to any of the following requires a new version of this standard and, where applicable, a synchronized update to the parent Check SSOT and Design System scoped profile:

- palette;
- typography roles;
- copy order;
- CTA hierarchy;
- width/silhouette;
- motif;
- minimum text sizes;
- fine-print visibility;
- placement semantics.

Runtime implementation, applicable report templates and QA evidence must be updated together when a future version changes production behavior.


## Versioned US spelling opt-in — 2026-09-05

Spoken v3 opts into `check500-section/en-US/1.1.0` from the parent Check SSOT,
changing only enquiries to inquiries. Its build copy comes from the one
versioned parent JSON block. This exception changes no visual, placement,
price, credit or action semantics; other frozen instances retain 1.0.0.
