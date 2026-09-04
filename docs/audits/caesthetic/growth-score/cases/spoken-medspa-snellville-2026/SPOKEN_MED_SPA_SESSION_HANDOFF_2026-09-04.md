# Spoken Med Spa session handoff — 2026-09-04

## Localization authority

- Russian is the working language for owner review and discussion.
- English is the final client language for the protected Spoken Med Spa Growth Score.
- Every approved Russian decision from the 2026-09-04 review must be carried into the English report. Translation must preserve meaning, evidence status, priority order, commercial boundaries, and the approved Top 3; it must read as natural US English rather than as a literal translation.
- New or revised English client copy uses the public program name `Connect4`; `4444` remains only in stable internal contract IDs and historical Russian copy, per `docs/ssot/CAESTHETIC.md` §2.
- The Russian runtime remains the reference for approved decision state. A localization change must not silently alter verified facts, evidence references, reviewer approval, Top 3 IDs, or the Russian client artifact.

## Source of build

- Paired builder: `scripts/caesthetic/build-spoken-medspa-russian.mjs`
- Shared renderer: `scripts/caesthetic/render-growth-score.mjs`
- English runtime source: `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/report.json`
- English runtime page: `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/index.html`
- Russian runtime source: `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/report.json`
- Russian runtime page: `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/index.html`
- English audit artifact: `docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/reports/standalone.json`
- Russian audit artifact: `docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/reports/standalone-ru.json`

Running the paired builder must regenerate both languages and both HTML pages in one operation. The generated artifacts are committed; direct edits to generated `report.json` or `index.html` files are not authoritative.

## Required parity checks

- Same approved Top 3 IDs, order, reviewer metadata, evidence references, repair plans, implementation paths, and commercial placement contracts.
- Same owner-facing sequence, including the unnumbered Connect4 method introduction immediately after “How to use this report” and before the Top 3.
- English method copy and its responsive diagram cover the same four surfaces and social platforms as Russian while using the public `Connect4` name.
- English Lead-to-Revenue visual is `site-caesthetic/assets/img/growth-score/lead-to-revenue-map-en.svg`; Russian continues to use the approved Russian asset.
- Exactly two $500 Check placements, one Sprint CTA, two report-share controls, and one question control.
- English remains protected and `noindex`; Russian remains an unlisted direct-link route and `noindex`.
- Tests must verify deterministic paired output and reject Cyrillic leakage in the English client page.

## Release procedure

1. Start from the latest `main` and confirm the touched source blobs have not moved.
2. Change the paired builder or shared renderer, never only a generated artifact.
3. Regenerate both `report.json` and `index.html` variants and the standalone audit artifacts.
4. Run the Spoken parity test, 4444 policy guard, owner-brief contract, deterministic rebuild, and mobile checks at 320–430 px plus desktop.
5. Merge through `main`.
6. Use the canonical CAESTHETIC deploy request for `site-caesthetic` to `caesthetic`.
7. Record the deployed SHA and production smoke result for both live routes.
