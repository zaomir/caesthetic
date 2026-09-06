---
owner: CAESTHETIC / Design + Engineering
status: active
authority: canonical
version: 3.1.0
created: 2026-09-05
updated: 2026-09-07
scope: CAESTHETIC brand visual system, public website, reports and derived materials
supersedes: site-caesthetic/DESIGN.md visual rules v2.1
baseline_ref: 5dad5f00ed2a1105a0542ff42841bdd612ec4374
---

# CAESTHETIC Design System

## 1. Authority and release state

This is the ONE visual-system SSOT for CAESTHETIC. `site-caesthetic/DESIGN.md` is its entry shim, not another palette or component specification. The founder's 2026-09-05 request authorizes consolidation of the design canon and a sitewide conformance review; version 3.0 consolidated documentation; version 3.1 implements shared components and enforced delivery checks. Remaining exact legacy exceptions are recorded in the machine contract and do not authorize new deviations.

Resolve authority by subject, not by CSS load order:

1. `CAESTHETIC.md` controls identity, product, facts, claims and commercial semantics.
2. Explicit asset/copy contracts control their exact scope: `CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`, `CAESTHETIC_CONNECT4_CONCEPT.md`, `CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md` and `docs/caesthetic/growth_score_spec.md`.
3. This document controls shared visual roles, components and quality requirements. Scoped exceptions in §10 override only the listed shared rules.
4. `WEBSITE_STUDIO_STANDARD.md` and `IMPECCABLE_WEBSITE_AGENT_STANDARD.md` control execution quality. The EVO/ROVLEX Design Kit is not the CAESTHETIC palette or template source.
5. Runtime CSS/HTML/JS are implementation evidence, not authority to silently change the canon. Deviations become remediation work; historical CSS and handoff folders are not reusable design authority.

Normative keywords: MUST = conformance requirement; SHOULD = default with a documented reason for deviation. **Baseline** describes existing code; **migration requirement** is newly explicit and must not be represented as already shipped. Future changes update this SSOT, implementation, applicable templates and QA evidence together. Do not create an additional approval gate in this document; existing content/asset authority remains unchanged.

## 2. Brand and content model

**Clinical Editorial Intelligence**: a specialist diagnostic brief with editorial hierarchy, traceable evidence and explicit uncertainty. Audience: owners and decision makers of independent aesthetic practices. Surface modes: public site `persuade`; client report `read/operate`; forms `operate`.

Brand attributes: precise, calm, accountable, analytical, readable. Signature: evidence ledger, ruled rows, numbered sequence, measured data, clear next action. Large type is editorial; diagrams explain decisions.

Positioning: **The growth operating system for independent aesthetic practices.** Public program name: Connect4. Exactly four surfaces: Search / Google Business Profile; Website; Social; Reputation / Reviews. Cross-Surface Consistency is cross-cutting; Lead Intake is a separate operational boundary; Paid Ads is a demand layer. Visual nodes must not imply a fifth scored surface or an unobserved causal result.

Use `BEHAVIORAL_COMMUNICATION_SYSTEM.md`: evidence → tension → discovery → agency. Show source, scope, date and uncertainty where material. Keep facts, estimates, examples and verified impact distinct. No fabricated proof, rating/patient/revenue/ROI guarantees or decorative metrics. Prices and commercial copy are references to product SSOT/generated pricing, never a second design-owned price table.

## 3. Semantic color system

Implementation authority: `site-caesthetic/assets/css/tokens.css`. Preserve existing token names. The complete baseline token table is generated in §3.1 below. The shared marketing palette is cool clinical paper, charcoal, navy and restrained burgundy. The standard owner-report profile has its separately approved warm paper palette (§10); a unified canon does not erase that intentional distinction. Do not use the obsolete warm palette table from DESIGN v2.1.

Use `bg` for the page, `bg-2` for tonal sections, `bg-3` for denser information, `bg-dark` for reversed sections. `text` is prose, `text-strong` headings; `muted` is secondary prose and `muted-2` metadata (the names do not imply monotonic lightness). `accent` is navy structure/action; `signal` is burgundy emphasis. Negative data red and brand burgundy are different roles.

Positive/negative/warning/neutral colors MUST be paired with a text/icon/shape label. A diagram route receives its own evidenced status, not its neighbour's color. Gray/unassessed is not failure. Color alone never conveys meaning.

New shared CSS MUST use semantic tokens. Literal colors belong in token definitions or an explicitly scoped contract; never promote a stray existing literal into the palette. Do not weaken contrast with opacity without testing the final composited colors.

### 3.1 Baseline tokens

| Token | Baseline value |
|---|---|
| `--cae-bg` | `#F5F7F8` |
| `--cae-bg-2` | `#EEF1F3` |
| `--cae-bg-3` | `#E4E9ED` |
| `--cae-bg-dark` | `#14191C` |
| `--cae-bg-dark-2` | `#1A2228` |
| `--cae-border` | `#C9D1D7` |
| `--cae-border-strong` | `#14191C` |
| `--cae-border-data` | `#A8B3BC` |
| `--cae-border-accent` | `#1C3A4A` |
| `--cae-text` | `#14191C` |
| `--cae-text-strong` | `#0B1013` |
| `--cae-muted` | `#5A646C` |
| `--cae-muted-2` | `#4E5963` |
| `--cae-accent` | `#1C3A4A` |
| `--cae-accent-2` | `#274E63` |
| `--cae-accent-light` | `#E8EFF3` |
| `--cae-signal` | `#7B244B` |
| `--cae-signal-2` | `#96325E` |
| `--cae-signal-light` | `#F5E8EC` |
| `--cae-data-positive` | `#2A5C40` |
| `--cae-data-positive-bg` | `#E8F2EC` |
| `--cae-data-negative` | `#7B1F1F` |
| `--cae-data-negative-bg` | `#F5E8E8` |
| `--cae-data-warning` | `#7A4000` |
| `--cae-data-warning-bg` | `#F5EDDB` |
| `--cae-data-neutral` | `#3D4F5A` |
| `--cae-data-neutral-bg` | `#ECF0F3` |
| `--cae-font` | `"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif` |
| `--cae-font-display` | `"Source Serif 4", Georgia, "Times New Roman", serif` |
| `--cae-font-mono` | `"IBM Plex Mono", "Courier New", monospace` |
| `--cae-text-xs` | `0.875rem` |
| `--cae-text-sm` | `0.875rem` |
| `--cae-text-base` | `1rem` |
| `--cae-text-lg` | `1.125rem` |
| `--cae-text-xl` | `1.25rem` |
| `--cae-text-2xl` | `1.5rem` |
| `--cae-space-1` | `4px` |
| `--cae-space-2` | `8px` |
| `--cae-space-3` | `12px` |
| `--cae-space-4` | `16px` |
| `--cae-space-5` | `20px` |
| `--cae-space-6` | `24px` |
| `--cae-space-7` | `28px` |
| `--cae-space-8` | `32px` |
| `--cae-space-10` | `40px` |
| `--cae-space-12` | `48px` |
| `--cae-space-16` | `64px` |
| `--cae-space-20` | `80px` |
| `--cae-space-24` | `96px` |
| `--cae-radius-sm` | `2px` |
| `--cae-radius` | `4px` |
| `--cae-radius-lg` | `6px` |
| `--cae-header-h` | `74px` |
| `--cae-wrap` | `min(1180px, calc(100% - 40px))` |
| `--cae-wrap-narrow` | `min(880px, calc(100% - 40px))` |
| `--cae-wrap-wide` | `min(1440px, calc(100% - 40px))` |
| `--cae-ease` | `cubic-bezier(0.25, 0, 0.25, 1)` |
| `--cae-ease-out` | `cubic-bezier(0, 0, 0.25, 1)` |
| `--cae-duration-fast` | `140ms` |
| `--cae-duration` | `220ms` |
| `--cae-duration-slow` | `380ms` |
| `--cae-outline-focus` | `0 0 0 3px rgba(28, 58, 74, 0.35)` |
| `--cae-text-strong-on-dark` | `#F5F7F8` |
| `--cae-muted-on-dark` | `rgba(247, 245, 240, 0.65)` |

## 4. Typography

| Role | Family | Approved loaded weights |
|---|---|---|
| Editorial headings | Source Serif 4 | 300, 400, 600 |
| Prose / UI | IBM Plex Sans | 300, 400, 500, 600, 700 |
| Data / numbering | IBM Plex Mono | 400, 500 |

Fallback stacks remain the stacks in tokens.css. Italic Source Serif 4 300/400 is available but is not a decorative luxury motif. Avoid synthetic 800 where only 700 is loaded: use a loaded weight unless a deliberate font-source change is included. Localization MUST verify actual glyph coverage and fallback metrics.

### 4.1 Shared marketing scale (baseline)

| Style | Size | Weight / line height | Measure |
|---|---|---|---|
| body | 1rem | 400 / 1.6 | Prose usually 60–72ch |
| H1 | clamp(2.8rem,7vw,6.4rem) | 300 / .94 | 14ch |
| H2 | clamp(2rem,4vw,3.8rem) | 300 / 1 | Content-led |
| H3 | clamp(1.35rem,2.2vw,1.75rem) | 400 / 1.15 | Content-led |
| H4 | 1rem Sans | 600 | Content-led |
| lead | clamp(1rem,1.6vw,1.2rem) | 400 / 1.65 | 60ch |

H1–H3 tracking: -.03em. Current home `.cae-hero-simple` overrides H1 to clamp(2.8rem,4.5vw,4rem), 16ch. Page hero: clamp(2.5rem,5.5vw,5.2rem), 16ch. Article hero: clamp(2.2rem,4.5vw,4rem), weight 400, 22ch. These are named variants, not four competing systems.

Before v3.1, shared UI used 11px uppercase labels/CTAs and 13px fields. The implemented shared requirement is now: essential labels, hints, captions and fine print at least 14px; inputs and action text at least 16px; long-form report body 18px (17px permitted by its existing profile), line height 1.5–1.65. 11–13px tokens may remain only for genuinely secondary, non-essential compact data, never the sole location of price conditions, errors or an action label. This is a CAESTHETIC usability rule, not a WCAG minimum-font-size claim.

Kickers are optional navigation aids, not repeated decoration. Preserve uppercase for short metadata; migration default for action labels is sentence case with normal tracking. Long action text MUST wrap; no nowrap clipping at 320px or text enlargement. The shared button implements this rule in v3.1; any independent legacy variant remains an explicit migration exception.

Do not flatten report-v2's 14/18/32px profile into the marketing display scale. See §10.

## 5. Layout and spacing

Spacing scale (px): **4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96**. Prefer these tokens; fluid interpolation between named bounds is allowed. Content-driven component dimensions (e.g. 22px button inline padding) are not spacing tokens.

| Container | Baseline |
|---|---|
| default | min(1180px, calc(100% - 40px)) |
| narrow | min(880px, calc(100% - 40px)) |
| wide | min(1440px, calc(100% - 40px)) |
| header | min(1600px, calc(100% - 40px)) |
| Connect4 / report v2 | min(1120px, calc(100% - 48px)); mobile profile may use 20px gutters |

Shared section: 96px block padding, 64px at ≤768px. Shared hero: 96/64px; page hero 80/48px. Home simple hero uses clamp(3rem,8vw,5.5rem) top and clamp(2.5rem,6vw,4rem) bottom. Major gaps: 48–64px. Group related content at 8–24px.

Prefer ruled editorial rows, asymmetric split layouts and content-led grids. Base hero ratio 1.2/.8; section heading .85/1.15; asymmetric split 1.3/.7. Never choose three columns only to fill a template. Reading and DOM order MUST match. Use minmax(0,1fr), min-width:0 and tested wrapping rather than clipping overflow.

Borders: 1px standard, 2–3px meaningful emphasis. Radius: 2px buttons, 4px fields/panels where needed, 6px dialogs; editorial panels use 0. No structural drop shadows. Functional circular dots/close controls are permitted. No pill cards, ornamental gradients, floating orbs, generic beige page treatment or beauty-spa imagery.

## 6. Component contract

### Navigation

Sticky solid header, height token 74px. The outer #cae-header-slot owns sticky positioning when the header is mounted; its child is relative. Full horizontal nav at **≥1600px**; drawer at **≤1599px**. This content-fit boundary replaces the obsolete 1024px statement. Header logo uses square brand asset plus live wordmark/tagline. Hide tagline at ≤430px; never hide the primary identity or menu control.

Drawer sits below header, max available dynamic viewport height, own vertical scroll. MUST support focus entry, containment while modal, background inertness or an equivalent non-modal keyboard model, Escape, close control, return focus and scroll restoration. Closed drawer links MUST not be focusable. Disclosure controls expose aria-expanded/controls. No hover-only navigation. Sticky layers MUST not fully obscure focused controls or target headings. One z-index hierarchy: content → sticky subnav → header → open drawer → dialog/consent, with explicit focus/stacking tests.

### Buttons and links

Shared default primary: text-strong background, bg text; hover accent. Outline: transparent, text-strong border; hover dark with light text. Accent: navy; Signal: burgundy, only when semantically selected. One visually primary next action per decision group; legitimate alternatives remain visible.

Buttons: min-height 48px, at least 44px width, radius 2px, padding baseline 12px 22px; text rule §4.1. Links navigate; buttons act. Prose links are visibly identifiable without relying solely on hue. Destructive, disabled, loading, success and failure states require text/semantics, not only color. Loading prevents duplicate submission and preserves a stable accessible name/status. Disabled is not conveyed only by low contrast.

### Cards, ledgers and data

The production Impeccable overlay makes cae-panel transparent, square and shadowless; grid-3/4 panels use top rules rather than closed card shells. Baseline panel padding 32px 24px/min-height 220px is a named component, not a universal equal-height requirement. Align peer cards where comparison benefits; never fixed-height crop prose.

Evidence strip base 5 columns; content breakpoints 2 then 1. Numbers need units, period, source and status where applicable. Tables need captions/headers; mobile may stack labelled records or use a labelled local scroll region when genuine two-dimensional comparison is essential. Never shrink a full table to unreadable type. Data visualizations need textual equivalents; no fabricated metrics or false status coloring.

### Text-first case catalog and case page — 2026-09-06

Use the existing v3.1.0 tokens, typography and ruled editorial surfaces. The library follows a compact introduction; the Connect4 explanation follows the library. A single column of wide case rows presents context and situation beside approach on desktop and stacks those groups on mobile. A row contains one descriptive case link. Cards and case-page summaries MUST NOT contain cover images, image placeholders or reserved image columns. Approved method and contact imagery outside those components retains its existing contract.

The case page progresses from an executive brief through situation, approach, supported results, source/limitations and applicability. Missing supported results collapse the numeric module and show a plain source-availability note; they do not produce invented values or a decorative evidence badge. Short editorial fields must remain source-grounded under `CAESTHETIC_CASE_STUDIES_COLLECTION.md`.

Use native, labelled goal and practice-type selectors, with country, scale and sorting under an additional-filters disclosure. Preserve shareable filter URLs and the reader's loaded results and return position. Verify keyboard focus, narrow-width reflow, loading/error/empty states and both supported-result and no-result cases. This component adds no palette, imagery or publication-approval exception.

### Forms and dialogs

Persistent visible labels, proper input type/autocomplete, hint and error association, required state in text, status announcements, clear recovery and retained valid entries. Do not use placeholder as label. Default fields radius 4px, min-height 48px, font floor 16px. Textarea grows vertically. A form's accessible purpose and progress must remain clear without JavaScript.

Request modal baseline width min(560px,100% - 32px), radius 6px, close target 44×44px. MUST fit dynamic viewport, scroll internally when keyboard is open, trap focus through native dialog or equivalent, close on Escape and return focus. Do not add unrequested fields. Test success/error offline with intercepted requests; never create real leads during visual QA.

The shared public request dialog replaces its form and introductory prompt only after the backend confirms success. Show an 80px navy outlined circle with a burgundy check, a concise localized message in a polite atomic status region, and keep the close control. Move focus to confirmation, never auto-close, reset on reopening, and ignore responses from prior openings. Error and pending states retain fields; they never display the check. The dedicated multi-stage Growth Score intake retains its optional stage.

### Footer, FAQ, errors

Footer baseline 1.4/.7/.7/.7 → 2 → 1 columns. Do not shrink legal/help links below the essential-text floor. FAQ uses native details/summary or an equivalent keyboard-accessible disclosure. 404, redirects, loading, empty, access/password and payment states belong to the system; protection is not a design failure. Their success and error states require explicit coverage.

## 7. Responsive, accessibility and motion acceptance

Required representative widths: **320, 360/390, 430, 768, 1024, 1440, 1600/1920px**. Every route needs a desktop/mobile result or a precise unavailable state; a family sample is not a per-page visual pass.

Content breakpoints are component-specific: 1024 shared split; 900 editorial overlays/report enhancement; 800 growth grids/contact; 768 section rhythm; 767 Connect4 picture sources; 620 shared card grid/CTA; 430 header tagline. CSS selector specificity and loaded overlays MUST be included in computed-style checks.

Target **WCAG 2.2 AA**. Test text contrast ≥4.5:1, large text ≥3:1 (large means ≥24 CSS px regular or about 18.67px bold), non-text UI meaning ≥3:1. Under WCAG 2.5.8 AA, pointer targets are 24×24 CSS px or meet the listed exceptions; CAESTHETIC's stricter component default is **44×44px**, buttons/inputs 48px high. Do not incorrectly call 44px an AA requirement.

Test 200% text resize, 400% browser zoom/equivalent 320 CSS px reflow, WCAG text-spacing overrides, keyboard operation, logical focus order, focus visibility and no complete focus obstruction. No hidden content from overflow-x:clip, fixed heights or ellipsis. Essential two-dimensional tables/maps may scroll locally with an accessible explanation; page body must not require two-axis scrolling. Information inside locked diagrams needs an accessible equivalent outside the immutable asset, respecting its contract.

Adopt a visible 3px focus outline with ≥3:1 contrast and 3–4px offset as a CAESTHETIC implementation target; current semi-transparent shadow-only focus is migration debt and must be measured on each background. Do not label this chosen thickness a universal WCAG AA requirement.

Motion tokens: 140/220/380ms, standard cubic-bezier(.25,0,.25,1), out cubic-bezier(0,0,.25,1). Only functional transitions. Reduced-motion MUST suppress non-essential animation and smooth scrolling without hiding content. No autoplay carousels or decorative count-ups in new report work. Existing animations are not proof of compliance.

## 8. Assets and brand applications

Canonical brand kit: `site-caesthetic/assets/brand/logo-square.{svg,png}` and `logo-long.{svg,png}`. Preserve proportions and embedded artwork. The long lockup has its own subtitle; header live wordmark is a separate approved pattern. Do not recreate a logo using a similar font. Legacy assets/img/logo.png and old handoff templates are not authoring sources.

Approved point-of-contact photo: `/assets/img/team/valerie-petra-office-portrait.webp`; follow `CAESTHETIC.md` and point-of-contact.js for eligible pages. Its baseline square crop is 140px, mobile 112px. Report rules may exclude persona blocks. Do not apply a marketing contact card to every report.

Replaceable assets use semantic media IDs/registry, provenance, rights, consent, channel/route scope and approved derivatives. Required unresolved slots block publication; optional unresolved slots collapse, never become fake proof. No client facts, private screenshots or credentials in public galleries or analytics. AI diagrams may explain approved concepts but are labelled illustrative and never evidence of a client outcome.

Images need dimensions/aspect ratio, useful alt or empty alt for decorative duplication, responsive art direction only when authorized. Do not lazy-load the LCP image; below-fold images should be deferred. Font/logo assets must be profiled: an SVG wrapping an embedded raster is not an infinitely scalable vector and does not automatically outperform PNG.

For decks, proposals, PDF, social and email preserve color/typography roles and evidence hierarchy, not literal web pixel sizes. One message per slide, readable export at actual viewing size, captions and sources preserved. Email has tested fallback fonts. Channel-specific frozen templates remain scoped. CMYK/Pantone, print minimum logo size, universal safe area and a complete icon library are **not established** by the current repository; do not invent them as historical canon.

## 9. Delivery and performance

CSS cascade MUST be deterministic and documented. Shared mandatory styles should be available in the initial document/build output; dynamically appended visual CSS and duplicate imports are migration debt because first paint and no-JS appearance can diverge. Consolidate without flattening scoped profiles.

Use loaded font weights, font-display strategy with stable fallback metrics, avoid duplicate font delivery and unnecessary families per page. Self-hosting is an implementation option, not an automatic requirement; preserve font licences. Reserve image dimensions and avoid layout shifts when late components load.

Core Web Vitals target at the 75th percentile, mobile/desktop separately: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. These require field data; a single lab run cannot certify them. Missing field coverage = Not assessed. Lab traces/Lighthouse are diagnostic, not a substitute for field evidence or manual accessibility.

No-JS failure must leave core content, navigation/contact alternative and form recovery discoverable. Mark private routes noindex/access-protected as applicable; canonical/hreflang must match visible language. A 200 shell, placeholder or redirect does not prove route content was reviewed.

## 10. Scoped profiles and conflict resolutions

| ID | Scope | Rule / exception |
|---|---|---|
| marketing/editorial | public marketing | Shared cool palette, serif display, ruled sections; primary almost black |
| connect4/editorial | /connect4/ | 1120px container; Sans 18px desktop/16px mobile; Serif 400 navy; approved desktop/mobile PNG pairs at 767px; literal artifact proportions retained |
| check500-style/1.0.0 | full Check500 offer sections | Ivory #F0EDE6, deep navy #0B2438, burgundy #7B244B, centered hierarchy, rules/dot, wide burgundy CTA; exact copy and placement authority in Check SSOT |
| growth-score-mobile-ui | v5 owner reports | Approved warm profile: bg #F0EDE6, bg-2 #E7E2D9, accent #0B2438, signal #7B244B, border #C9C3B8 (growth-report-base.css and Client Report Standard §8); Body 17–18px, one card/row initially, nine semantic sections plus Intro; scores are secondary; evidence disclosure; preserve parent/focus-child roles |
| owner-decision-report/2.0.0 | existing Spoken RU/EN /v2/ | Isolated 14/18/32px scale, two font families, sentence-case controls and its existing scoped surface cascade; not global migration of other reports |
| hero-raster-lock | Where Clients Are Gained - and Lost | Exact PNG bytes/hash in master/report standard; no redraw, crop, recolor, translation, overlay, srcset derivative or mobile replacement; proportional scaling only |
| lead-to-revenue-raster-lock | approved Lead-to-Revenue Map | Exact bytes per project status/contract, no automatic re-encoding |
| brand-artwork | approved logo assets | Preserve embedded artwork; do not treat artwork colors/text as new UI tokens |

Check500 reference PNG is a style reference to implement in accessible HTML/CSS, unlike the immutable report Hero which MUST be the PNG itself. Approved warm illustrations do not switch the page palette. Explicit product/asset contract wins over old generic anti-pattern wording. This document does not rewrite client facts, scoring, offers or annual/commercial terms.

Concurrent main refresh 5dad5f00 preserves the already-shipped header-slot, focus-loop and scroll-lock fixes; they are not pending work.

Resolved old conflicts: warm DESIGN v2.1 palette → actual cool tokens; nav 1024 → 1600 fit boundary; adaptive Hero prose/checklists → immutable raster; all-CTA-burgundy → semantic variants; card soup → final loaded editorial panels; synthetic 800 → loaded weight; 11px essential controls → explicit migration target; arbitrary literal CSS → token debt or scoped exception.

## 11. Verification and governance

Each review records source SHA/date, URL/source path, page kind, applicable profile, live status, rendered viewport coverage, findings, evidence and limitations. Statuses: PASS for checked criteria only; FAIL with reproducible evidence; REVIEW for a heuristic; NOT_ASSESSED for unavailable checks; REDIRECT/FRAGMENT for non-page sources. Never award blanket compliance from HTTP/static checks or from a representative sample.

Review all generated instances as well as templates. Fix shared source/generator before regenerating pages. Preserve approved historical report data, protected routes and locked assets. A style migration does not authorize new research or new diagnostic conclusions.

Remediation order: inaccessible/broken/obscured critical actions → type/contrast/reflow → shared cascade/fonts/components → page-family consistency → performance/media → UI Kit and regression coverage. Every fix has an owner, affected routes, acceptance criteria and rollback path. Visual/runtime work must then follow main → canonical deploy → live SHA/smoke; this docs-only consolidation needs no deploy.

External primary references checked 2026-09-05:

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — conformance criteria, including contrast, text resize/spacing, semantics and keyboard.
- [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24px AA and exceptions.
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — 320 CSS px and legitimate two-dimensional exceptions.
- [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) — author-created sticky/modal layers.
- [Core Web Vitals](https://web.dev/articles/vitals) — field thresholds and 75th percentile.
- [Optimize LCP](https://web.dev/articles/optimize-lcp) — resource discovery and render delays.

Sitewide evidence/remediation register: `docs/audits/caesthetic/design-system-2026-09-05/README.md`.

## 11. Enforced implementation contract (3.1.0)

The shared XS/SM tokens now both mean 14px; actions and inputs use 16px. This intentionally removes the historical 11/13px shared floor. The table above reflects the implemented token values; historical prose marked baseline/migration describes the pre-3.1 review. Independent frozen presentation profiles retain their explicit scope.

Machine projection: `docs/caesthetic/design/contract.json`. It records every HTML source, profile, viewport coverage, token values, immutable originals, optimized-logo delivery budgets and exact existing style exceptions. It is subordinate to this SSOT; changes update both in the same commit. No blanket exemptions for an entire future page or directory. Resolved exception IDs cannot be reintroduced; temporary entries expire and block release. New patterns require a recorded rationale and corresponding component/QA updates, not a silent baseline refresh.

`caesthetic-design-gate` performs contract rejection tests and rendered checks; the canonical deploy workflow requires its receipt for the exact SHA, runtime bytes, SSOT and machine contract. Both origin and Worker deployment entry scripts reject a missing, stale or mismatched receipt. Repository administrators remain able to change workflows/settings: this is not a claim of protection against administrators or of enabled GitHub branch protection on the current plan.

New pages and profile changes must update the route registry, source/generator, states and applicable tests together. Shared changes exercise all routes. The existing Website Studio guard follows the SSOT shim. The local-only component fixture is `tests/caesthetic/fixtures/design-system.html`; it is never a public proof page.

The 2026-09-05 implementation replaces JS-injected visual styles with initial HTML stylesheet links, uses losslessly preserved source logos plus smaller delivery PNGs, repairs mobile grids/CTA wrapping and report table keyboard access, and aligns access/error shells with shared tokens. It does not change protected image bytes, report evidence or commercial terms. Field CWV and exhaustive manual assistive-technology certification are separate evidence requirements; automated PASS is not a WCAG certificate.


### Public service examples — 2026-09-06 (#1523)

The existing marketing-profile ruled list supports the service examples on
`/sprint/` and `/growth-system/`. `service-examples.css` is scoped to these
sections: 16px body type, 65ch text measure, token-based spacing, underlined
links and anchor clearance below the shared header. Target sections use
`tabindex="-1"` so the existing keyboard anchor handler transfers focus.
The stylesheet is registered for both pages; no global tokens, protected media
or report profiles change. Rationale, module mapping and scoped QA:
`docs/caesthetic/PUBLIC_SERVICE_EXAMPLES.md`.

### Historical owner-report v3 profile — 2026-09-05

`owner-decision-report/3.0.0` is the isolated Spoken RU/EN preview/release profile;
its current stage is declared separately from layout version. Retain the warm
owner-report palette and two-family 14/18/32px hierarchy. The following scoped
aliases on `.cae-score-v3` are intentional names for the already approved report
colors, not global palette changes: `--v3-paper:#F0EDE6`, `--v3-soft:#E7E2D9`,
`--v3-ink:#0B2438`, `--v3-line:#C9C3B8`. Their exact declarations are registered in
`contract.json`. Main reading gutters are 20px mobile/24px desktop; native
sections/disclosures use spacing tokens. Check500 retains its independent
centered typography, 96/64px rhythm and navy/burgundy/ivory contract.

Exact system/journey/Stop/engagement image pairs are selected from the owner's
Dropbox collection by semantic role and at 767px. The explicit v3 image-placement
exception is recorded in Client Report Standard and the active Mobile Decision
UI spec. Old Hero locks still apply outside v3. No reconstruction, new stock
artwork, crop, re-encoding or color-only status is introduced.

Register both child routes, readable states and private browser acceptance.
The working preview is not a certification of new query evidence or commercial
impact. Legacy routes remain regression-tested; input/review packages and raw
browser captures are excluded from the public satellite mirror.

### Spoken v3 shared-site presentation — 2026-09-07

The owner's explicit request to match the approved CAESTHETIC website supersedes
the warm 14/18/32px v3 profile for the two Spoken `/v3/` routes only.
`owner-decision-report/3.2.0` uses the shared cool `bg/bg-2`, charcoal `text`,
`text-strong`, border and almost-black primary-button tokens. Use the shared
page-hero H1, editorial H2/H3 scale and 1180px container, with 96/64px section
rhythm. Long-form body remains 18px; metadata 14px and action text 16px.

The four existing `--v3-*` layout aliases now resolve shared semantic tokens.
Only `.v3-check500` retains its exact ivory/navy aliases, burgundy CTA and existing
18px action typography under `check500-style/1.0.0`. This migration does not
recolor approved raster art or alter parent/v2 styles.

Owner-requested reading cleanup removes the two research/method sections and
per-answer source disclosures from this client view. Keep compact dated public
links beside the answers and retain all underlying evidence and validation.
The fix-the-leaks pair also appears below the expense-deferral paragraph; its
earlier urgent-plan placement remains. Four picture elements reuse the approved system, journey and Stop pairs.
The engagement picture is omitted with the removed continuation block; all eight
original PNGs remain immutable in the asset register. The Connect4 system figure remains after its introduction.

The Sprint offer reuses the website's `cae-price-block` from `growth.css`: dark
field, light editorial headings, the published-price typographic role and
responsive token padding. Its one primary button retains a visible light border
inside the dark field. Preserve copy, inquiry behavior and the two adjacent
Check sections. The report question trigger omits the redundant introductory
paragraph through the shared modal's explicit `data-cae-request-omit-intro` flag;
other triggers retain their existing introductory copy.
