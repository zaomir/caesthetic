# Connect4 services and blog — 2026-09-11

Owner-authorized implementation: two English-only service pages remain services; two English editorial articles explain the problems and link to implementation. Russian service routes redirect. Main navigation is unchanged.

## Routes and linking

- `/blog/` lists both articles.
- `/blog/consistent-business-information/` → `/connect4/location-alignment/`.
- `/blog/customer-reviews-and-feedback/` → `/connect4/review-system/`.
- Each service links back to its corresponding article; articles cross-link.
- Connect4 explains both implementation options after the engagement section and links to both articles.
- Growth Score adds an after-audit explanation linking to alignment.
- Sprint links to both as possible written-scope tasks; public prices and client-specific offers remain unchanged.
- The case catalog links from its general method explanation. Existing summaries do not establish actual delivery of these specific services, so no individual case is recast as proof. Add a case-specific link only after checking the published work and attribution.
- ENT Russian report generators now point directly to English services; the approved frozen translation source is preserved. English audit links were already direct.

## Copy and design

Shared marketing tokens, existing header/footer, editorial article type scale and readable single-column body. No new imagery, arbitrary palette, language switch, forced lead form or public ENT case listing. The article stylesheet is scoped to `.cae-blog`; contract registers every new route at 320, 390 and 1440px.

Primary sources checked for editorial claims: Google local ranking guidance, Google Search Central AI feature guidance, and Google Maps contribution policy. Original practical examples are explicitly illustrative. No guaranteed rankings, exact-match keyword requirement, review gating, incentives, invented metrics or internal feedback-routing details.

## Validation

Blog, service and Russian/English ENT generators pass deterministic checks. Scoped HTML checks confirm English blog copy, one article H1, direct English service links and unchanged report evidence. English network/child navigation, service redirects and review-system disclosure verified on live pages in `english-browser-2026-09-11.json`. Blog visual and production verification pending canonical deployment.

## Text enlargement correction

Connect4 QA reproduced a 320px/200% text-zoom overflow in the existing `#implementation .c4-stages` grid: main client width 305px, scroll width 317px; the stage grid client width was 265px and scroll width 297px. The default `1fr` track retained intrinsic minimum content width. The correction uses `minmax(0,1fr)` tracks on desktop/mobile and `min-width:0` on the stage items. No overflow clipping or assertion waiver. The existing browser check now records geometry on failure; its required assertion is unchanged. Reverification pending.

The corrected Connect4 grid passed the complete browser check at source `1840c449d374a13dd77fe3b3f3159ca0bae51dcb` (run 34612948805), including 200% text enlargement. Live article URLs already resolve, but the Worker retained a legacy `/blog/` → `/` redirect. Remove only that obsolete index redirect to enable the owner-requested blog; the unrelated retired article redirect remains. No access or authentication rules change.

Live article review confirms the layout and links. Article section headings now explicitly use the canonical Source Serif 4 / 400 editorial role instead of the browser default heading weight.
