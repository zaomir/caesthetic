# Report v6 — Claude Design handoff

The owner supplied **Страница отчёта по аудиту.zip** on 2026-09-07 and selected it as the reusable design for future reports. Visual authority remains `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md` and `CAESTHETIC_DESIGN_SYSTEM.md`. This folder is an implementation/reference package, not a separate product canon.

## Use for the next report

For a new single-location report in Russian or English, use the v6 authoring route:

```bash
node scripts/caesthetic/growth-score-report-template.mjs --presentation v6 --locale ru
node scripts/caesthetic/growth-score-report-template.mjs --presentation v6 --locale en
```

Programmatic entry: `createGrowthScoreV6ReportTemplate({locale})` in the existing authoring module. The result keeps diagnostic `schemaVersion: 5`, the existing scoring template version, and the existing evidence/approval process. Presentation is separately versioned as **`growth-score-client/v6.0.0`**. Its client-facing label is **v6**.

Complete the underlying report as usual, then fill `presentation.v6` with the reviewed client narrative. The factory contains no Spoken facts. `business_name` and locale must match the report; the three plan IDs must match the existing Primary and two Supporting Gap IDs, in order. Question/plan `evidence_refs` must exist in the underlying report. `source-export:*` references are design-reference markers and cannot pass the main report adapter.

Render through the same entry point:

```bash
node scripts/caesthetic/render-growth-score.mjs --report path/to/report.json --out path/to/index.html
```

The existing scoring, named review, real-report route and publication controls run before the v6 renderer. Register the concrete route/profile with the existing design/access contracts when publishing a new case. The template import does not create a public report or alter a published URL. Network parents and focus children retain their existing Multi-Location renderer; this single-location design does not hide network decisions.

## Reproduce and check this handoff

```bash
node scripts/caesthetic/build-v6-reference.mjs
node scripts/caesthetic/build-v6-reference.mjs --check
node --test tests/caesthetic/growth-score-client-v6.test.mjs
```

- `preview.ru.html` and `preview.en.html`: standalone design references with an explicit reference notice. They are not approved new clinical/marketing findings or published client reports.
- `spoken-reference.ru.json`: client copy extracted from the supplied mockup.
- `spoken-reference.en.json`: paired English translation of that reference, not an independent diagnosis.
- `claude-project.zip`: exact original upload, retained unchanged.
- `source-manifest.json`: archive and contained-file SHA-256 values.
- `scripts/caesthetic/growth-score-client-v6.mjs`: reusable renderer, content validation and canonical-price integration.
- `scripts/caesthetic/report-v6/`: exact logo, imported tokens, ported layout and native browser behavior.

The generated documents embed their CSS, logo and interaction code. Fonts use the source's Google Fonts families with local fallback stacks. Claude Design `support.js`, React/DCLogic, editor controls and `{{...}}` expressions are never loaded by the new renderer. Uploaded source code is retained as provenance, not executed.

## Design and interaction contract

Surface mode: **read → decide**. Audience: the practice owner reading primarily on a phone. Preserve the supplied cool-paper editorial layout: a 720px text measure, restrained serif headings, Sans prose, Mono dates/prices, ruled disclosures, a dark implementation offer and a dominant burgundy Sprint action. No extra diagrams, decorative images or dashboard panels.

Five reading blocks: introduction/proposal; four questions and synthesis; 30-day plan; post-enquiry Check boundary; implementation offer. Hero and proposal are adjacent semantic sections within the first reading block. Evidence remains in the underlying report even when the client view is compact.

- Four independent native `details` elements, closed initially; title and short answer always visible. No nested accordions. All four titles are H3; the Four Questions label is bold.
- The month proposal follows the italic Valerie Petra byline and share action. The upper plan action targets `#next-step`.
- The sticky Sprint strip starts hidden, appears only after the upper offer leaves above the viewport, hides while the final Sprint button is visible, and correctly restores on reverse scrolling.
- One main paid Sprint action; exactly two visible secondary Check placements. Product URLs are canonical and the selected offer parameter is retained.
- Prices come from `site-caesthetic/src/config/pricing.ts`. Included Check, credit and a follow-on tariff below the Sprint price are restricted to the named Spoken offer. They are not default terms for another practice.
- Native share with clipboard fallback; success is announced only after the operation succeeds. Denied clipboard access exposes a selectable link. Local-file previews do not pretend to have a published URL.
- Native keyboard disclosures, visible focus, reduced-motion support, 44px controls, no horizontal clipping, one-column surface rows on small screens. Print expands details and restores their state afterwards.

## Deliberate portability corrections

The supplied visual direction is retained. Implementation fixes: light text on the burgundy CTA; italic author; readable metadata/control sizes; mobile one-column offer rows; sticky-state restoration; truthful clipboard feedback; complete print details. The case-specific recurring price remains scoped. The original editor's sticky shadow is replaced by the design system's rule border.

No frozen v3 HTML, image pixels, checkout implementation or existing report data is regenerated by this tooling change. To migrate an existing report, create its new version through the canonical case process and preserve the old route.

## Owner-approved Spoken publication

Owner approval and subsequent copy edits on 2026-09-07 are tracked in `docs/runtime/projects/caesthetic/sessions/2026-09-07-v6-publication.json`. The concrete paired publication package is `docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/revisions/v6/`; build with `node scripts/caesthetic/build-spoken-medspa-v6.mjs`. New `/v6/` routes preserve old versions and existing access policies. The public page excludes design-preview notes, uses canonical external tokens and preserves the source research status. Presentation approval does not convert pending research reviews into approved findings.

Paired CTAs: Check — «Начать с проверки →» / “Start with a Check →”; Sprint — «Перейти к реализации плана →» / “Put the plan into action →”. Prices remain visible beside their respective actions. Proposal subline: «Привести маркетинг в порядок» / “Get your marketing in order”. The four-question introduction explains the reading purpose; final copy explains email contact, scope, start date, access and progress after ordering.
