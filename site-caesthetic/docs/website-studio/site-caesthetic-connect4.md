# Connect4 page — implementation and QA manifest

Owner: CAESTHETIC
Updated: 2026-09-05
Route: `/connect4/`
Runtime: `site-caesthetic/connect4/index.html`
Authority: `docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md`, `connect4-explanation/1.0.0`
Standards: `WEBSITE_STUDIO_STANDARD`, `IMPECCABLE_WEBSITE_AGENT_STANDARD`, existing `site-caesthetic/DESIGN.md` and production tokens.

## DESIGN DISCOVERY / surface_mode

Mode: persuade + read. Audience: independent aesthetic/beauty business owners and marketing decision makers. Job: understand what Connect4 connects, what work is implemented, who owns it, and what the business retains. Generic copy uses potential client/business/inquiry. Existing raster journey remains an explicitly labeled aesthetic-practice example; patient wording inside the locked image is not rewritten.

The 2026-09-05 implementation instruction authorizes the page, not invented evidence or replacement artwork. Signature: restrained editorial sections with a real explanatory raster and inspectable implementation boundaries. No code-drawn diagrams, fake dashboards, synthetic growth graphs, gradients or decorative animation. Historical DESIGN.md instructions for programmatically drawn report diagrams do not apply to this raster-only page.

## REPRESENTATIVE SURFACE and completed checks

The first static build and browser run passed in Actions run `33970174572` from source `0b1563b21d8453750d687577488ceb1111520542`. Generated output is checked by `build-connect4-page.mjs --check`. Six Node tests cover source approval, paired copy, stable output, immutable images, four surfaces, section order, anchors, discoverability and request launchers.

Browser widths: 320, 360, 390, 430, 768, 1024, 1440, 1920. The browser checks actual `currentSrc`, image decoding, content bounds, native FAQ, two-field dialog, native required-field validation, error/retry/success, Escape/focus return, 200% text size and static content without JavaScript. Local submission is intercepted; local QA is NOT proof of backend delivery. Production was subsequently verified separately below.

IMPECCABLE PASS: manual clarify/layout/typeset/adapt/polish review of rendered desktop and mobile screenshots. The original cookie-consent state obscured content in captures; later screenshots reject analytics before review. Desktop/mobile production screenshots were reviewed with the image intact and the page text outside the illustration.

Detector target: `site-caesthetic/connect4/index.html`. The detector returned exit 2 with 12 heuristic warnings; it was advisory, **not a clean detector pass**. Review: section padding warnings ignore the inset `.c4-wrap`; the 3px Stop divider is a full-width semantic separator, not a decorative card tab; remaining warnings concern the inherited header/footer and root clipping, including a small shared-footer follow label. Actual content bounds and dialog focus checks passed. These results are not a claim of full WCAG certification, zero design findings, measured Core Web Vitals, or a completed five-pair visual system.

## Media contract and remaining scope

Exactly one complete approved pair is available in this release:

| Format | Source | SHA-256 |
|---|---|---|
| Desktop | `docs/ssot/assets/caesthetic/connect4-patient-journey-v1.png` | `229821d3ef70194dedd278fff76841e1cea671148e8e06807177d9f26781b180` |
| Mobile | `docs/ssot/assets/caesthetic/connect4-patient-journey-mobile-v1.png` | `68ec264d36113b954c7b770bb956d687ce35a7b8615a2fc28f6fcfff09f43a56` |

Copies in `site-caesthetic/assets/connect4/` are byte-identical. The native HTML picture uses the mobile composition up to 767px and the desktop composition above it; the image is never drawn in SVG, canvas or CSS. Both are registered in the existing media registry. The full textual explanation and descriptive caption remain readable without the image or JavaScript. This is a journey example, not a substitute for an ownership diagram. One accountable owner is explained separately in text.

**Graphic-set status: PARTIAL.** Four planned pairs remain unavailable: system, service example, delivery/handoff, paid-traffic readiness. Their content is explained in normal text; no fake placeholder or code reconstruction is published. The desktop-only system JPG and mobile-only Stop PNG do not constitute complete pairs and are not silently adapted. The user will provide/select remaining files. Their introduction must preserve original approval/rights, meanings of dashed connection and solid ownership frame, and be verified in both formats. The complete planned text/image alternation is not claimed in this first release.

## Content and request contract

`scripts/caesthetic/build-connect4-page.mjs` projects approved EN/RU core and reusable section to `assets/data/connect4-copy.generated.json`, and emits static English HTML. It is a derivative, not a competing copy SSOT. It also copies the approved pair and adds the footer/sitemap entry. The shared header/footer remain the existing site shell.

Primary request launchers use the shared Name + Email dialog with `intent=free_growth_score` and `page_url`. They request the existing offer; the receipt does not by itself create or approve an audit. Internal intake, prices, private payment routing and client reports are not redefined. No mass migration of old pages or reports is included. The reusable section data is prepared; embedding that section into existing reports or Case Studies was not performed by this release.

## Release acceptance — verified 2026-09-05

Live page: `https://caesthetic.com/connect4/`.
Actual deployed SHA: `9852ab9d391df7742b62c8ec233e986cce6ffefb`.
Canonical deploy run: `33970670429`, successful.
Bridge record: `docs/agent-api/results/deploy-caesthetic-connect4-20260905-1403.json`.
Dedicated production browser run: `33970815117`, test step successful.
Durable machine record: `docs/audits/caesthetic/connect4-page/production-9852ab9d391df7742b62c8ec233e986cce6ffefb.json`.
Artifact: `9970883077`, SHA-256 `b6bebc96ae012a4e10b2c1391e747cd2667e73d1d20fd83f6b5e84c3e7a84314`.

Acceptance evidence:
- `/connect4/`, scoped CSS and both PNGs returned HTTP 200 and matched the selected checkout byte-for-byte;
- eight widths passed, with the appropriate actual mobile/desktop image source;
- required fields, simulated error/retry, success, Escape/focus return, 200% text size and static content without JavaScript passed;
- one explicitly synthetic request through the actual production form was accepted with API `ok=true` and `notification_sent=true`. This is a server notification acknowledgement, not independent inbox-delivery confirmation;
- no captured JavaScript page errors. Website Studio guard passed for the new public route.

The production run failed only in its final git persistence step: a shallow exact-SHA checkout caused generic rebase to replay unrelated history. No failing rebase was pushed. The verified artifact was retrieved and the result persisted through the GitHub connector. The workflow now replays exactly its own one generated commit via `git rebase --onto origin/main HEAD^`, with run-specific evidence paths so later no-submit checks cannot overwrite this actual-submission record. Do not describe the original production workflow conclusion as green; its browser acceptance is independently preserved.

`.deploy/connect4.verify.json` is a scoped verification trigger with only `sha`, `request_id` and optional boolean `submit_request`. It does not accept a target URL or arbitrary command. Default build runs do not send real requests. Further layout-only verification should not repeat a real submission unless necessary.

## Rollback and scope

Task-scoped paths: page, Connect4 CSS, builder/tests/QA workflow, generated copy, two copied images, two added media entries, footer link and sitemap entry. Preserve existing report/private routes and original SSOT assets. Roll back the page release and related discovery entries through a normal commit and canonical deploy if its critical path fails. Do not revert concurrent unrelated changes or modify protected images.


## Owner-media update — 2026-09-05T14:18:08Z

The owner supplied all seven PNGs in `connect4-caesthetic-recolored`. Import preserved every byte and checked Dropbox content hashes. Three complete pairs now fill the system, journey/Lead Intake, and late Stop positions. The seventh landscape journey is an expandable alternate view next to the service example; it is not falsely described as a responsive pair. Older locked files remain untouched.

The new plain-text “How we work together” section projects the EN/RU contract `connect4-engagement-path/1.0.0` from the same concept SSOT. The Check is optional, further Sprint(s) are considered only after Day 30 and separately scoped, and ongoing work is optional under an individually agreed 12-month contract. Initial work never enrolls a client automatically. Main pricing and operating-model records carry this owner-approved clarification.

`connect4.engagement.desktop` and `.mobile` are reserved in the existing media registry. Until the owner supplies the engagement picture, the page shows its complete text without a fake diagram, visible placeholder, or blank spacer. Pending artwork is the remaining blocker for that illustration only, not for publication of the supplied seven images.

Validation for this update covers all seven PNGs, all three viewport selections, unchanged aspect ratios, placement of Stop after Lead Intake, optionality/annual copy, anchored navigation, static HTML and the shared two-field request interaction. See the new run-specific evidence, not the first-release single-pair record, for this update's acceptance.
