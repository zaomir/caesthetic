---
owner: CAESTHETIC
status: active
version: 1.1.0
updated: 2026-09-06
visibility: internal
scope: Source-backed case stories, blog and social content packages; private pilot production and publishing handoff
parent: docs/ssot/CAESTHETIC.md
issue: "#1524"
related:
  - docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md
  - docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md
  - docs/ssot/CAESTHETIC_PRODUCTS_AND_SERVICES.md
  - docs/ssot/HOOPPY_API.md
  - docs/caesthetic/social-cases/ARTIFACTS.md
---

# CAESTHETIC Social Cases — «Истории кейса»

## Authority and routing

CAESTHETIC «соцкейсы», «истории кейса», «пакет кейса», «карусели кейсов», Case Notes, case-to-blog/social, «комбайн кейсов» route here. This is the sole case-repurposing contract. The public case record remains factual authority; the master owns products/funnel, the design SSOT owns identity, the services catalog owns eligible implementation scope and Hooppy SSOT owns publishing transport and exact account routing.

User direction, 2026-09-06: use real cases as the foundation; adapt the story to each case; omit identifying case/client names from publication; include unsuccessful cases honestly; derive blog articles, carousels, short posts and later MP4s from one content package; consolidate prior artifacts and start one complete pilot. Production of this package is authorized. This release does not deploy a blog or schedule external posts.

## Publication language — owner correction, 2026-09-06

All publication copy is **American English (`en-US`)**: case titles and subtitles, article bodies, slide text, short-post cards, platform captions, optional first comments, image briefs and alt text, CTA labels, narration scripts and operator-facing package instructions. This applies to CN-001 and every subsequent case package.

The current publication JSON contains `languages.en` only. The renderer rejects additional publication languages and Cyrillic copy. Release archives contain only the English publication assets and current English production inputs. Russian discussion remains a valid working language: carry substantive corrections into the English master. A Russian review translation is optional, produced only if explicitly requested, and stays outside the publication package and scheduler payload.

The original bilingual package, Russian manuscript and prior proposal remain historical records with their original hashes and versions. They are not current publication payloads. This correction changes language and export scope, not facts, design, offer, metrics or scheduling authorization.

## Source and collection

- Source: `https://caesthetic.com/case-studies/intake/api/public-cases`, active published snapshots only. Exclude draft/review/TEST rows. Pin a dated export and SHA-256 for each batch; retain source ID, revision and source URL internally.
- Baseline export, 2026-09-06: **33 cases — 24 Med spa, 5 Dermatology, 4 Dental**. The accompanying Russian manuscript contains 33 histories, six sections each, 38 pages. All 33 headline measurements in this export are positive; no failed cases were invented to fill a quota.
- One case produces three base editorial units: article, carousel, short post; video is a fourth derivative. For 33 cases: **99 base units / 132 including video / 264 carousel slides** at eight slides per carousel. These counts are editorial units, not file counts or existing publications.
- Existing export classifications and limitations are preserved. Never restore obsolete `modeled`/`not_claimed` labels by default or promote missing classifications to verified. “Publisher-confirmed” describes the publisher's verification, not an independent examination of private CRM data.
- Facts, measured dates, denominators, budget context, CAESTHETIC role and client contribution stay tied to the same source record. A later public observation is not proof of a historical operating condition. The baseline export includes 2026-09-05 observation dates and 2025 measurement windows; these are different kinds of evidence.
- Do not fabricate owner quotations, rejected alternatives, staff resistance, rework, automation, dashboards, clinical outcomes or revenue. If a requested narrative detail is absent, use the supported limitation or omit it. A recommendation is labelled as a next step, never recast as completed implementation.

## Public identity and outcome treatment

Public series: **CAESTHETIC Case Notes**. Stable aliases: `CN-001` onward. A public title names the problem/change, not the source case title. Public images, captions, article copy, alt text, metadata and filenames omit client name, city, source slug, staff names, identifiable screenshots and original internal case IDs. The internal manifest retains the exact mapping for checking and updates.

Anonymization here means removal of direct identifiers; precise published metrics can still be matched to an existing public case. Do not describe this as irreversible de-identification. Public article URLs use the neutral alias/title. Do not link an anonymized story to an identifying original case page; keep that source link inside the editorial pack.

| Outcome | Editorial handling |
| --- | --- |
| Positive | State the exact measured change, period, definition and material limits; do not promise the same result to another practice. |
| Partial or mixed | Explain what improved and what stayed unresolved. Do not call a case successful solely because one metric improved. |
| Zero or negative | Publish the attempted solution, what happened, evidence limits and next decision. Add **`#CAESTHETICDidntWork`**. Also apply the tag when a documented target was missed, even if an intermediate metric improved. Do not use it for a successful case with ordinary remaining limitations. |
| Not yet measurable | Explain implementation/adoption and when measurement is possible. Do not create a result badge. |

Success is not a selection filter. Outcomes do not determine whether a real, publishable case enters the content queue. Missing or contradictory evidence affects the claim made, not an invented story to fill the gap.

## One editorial content contract

The English case package is the source for every publication format. Required logical fields:

- `schema_version`, public alias, source ID/revision/URL, dated source snapshot/hash, outcome class, production status.
- Factual context, selected constraint, rationale supported by the source, interventions, roles, remaining limits, measured result, lesson/recommended next step.
- Metric name, unit, exact before/after numerators and denominators, actual dates, rounding, evidence classification and attribution wording.
- American English publication copy; apply feedback given in Russian to this English master. Optional private review translations follow the current English facts, offer, limits and CTA, and are excluded from release assets.
- English title, subtitle, article outline/body, eight slide payloads, short-card title/subtitle, platform captions, separate first comments, alt text, CTA label/destination, service mappings, related published URLs.
- Asset names/checksums/dimensions, render profile/version, source provenance and output manifest; no credentials or patient data.

The pilot's concrete JSON and renderer are linked from the artifact register. Do not assume future cases share CN-001's bottleneck, intervention, service mapping, result direction or visual metric treatment. Exact field names are owned by the versioned JSON/renderer together; change both when the contract evolves.

## Blog article

Give each case its own supported angle and lesson: forms, portal, phone, location choice or response ownership. Different numbers alone do not justify 33 near-identical articles, and facts never move between cases. Target **400–900 English words when the source supports that depth**; shorter is preferable to invented detail. Six story sections remain the backbone, with concise insertion blocks where useful.

| Order | Block | Content |
| --- | --- | --- |
| 1 | Series, title, subtitle | CN alias; owner-recognizable problem and scope; one clear result or decision without a guarantee. |
| 2 | Executive brief | Practice type without identity; starting problem; intervention; outcome and measurement window. |
| 3 | What was happening | Supported situation and why it mattered to the owner. |
| 4 | Why this solution | Constraint and source-supported rationale; rejected alternatives only if documented. |
| 5 | Who did what | CAESTHETIC's work and the practice team's actions; preserve responsibility boundaries. |
| 6 | What remained unresolved | Friction, limitations and missing evidence; actual mistakes only when documented. |
| 7 | How the result was checked | Before/after, denominators, dates, budget and attribution; a compact evidence block can accompany the numbers. |
| 8 | Lesson and next step | Transferable lesson; explicitly proposed continuation. |
| 9 | Relevant services and reading | One or two service connections and up to two already-published related articles, only if relevant. |
| 10 | Action | One main CTA; the same action may be repeated after the result and at the end. |

Useful inserts: a before/after comparison, a short route diagram, a factual “What this does not show” note, or a checklist of signals an owner can recognize. Do not add decorative quotes or generic statistics merely to lengthen the article.

Service mapping is internal: module ID and why it fits this intervention from `CAESTHETIC_PRODUCTS_AND_SERVICES.md`. Public links use a verified relevant live product/method page; do not expose the GitHub catalog or invent a separate paid SKU/service landing page. First Sprint and Inside-out eligibility remain distinct. CRM/telephony automation is not implied by a website or response-rule fix.

Default action: **Get your free Growth Score** → `https://caesthetic.com/growth-score/`. A case about material post-inquiry uncertainty may link to the existing conditional Lead-to-Revenue Check when its relevance is supported; do not make it the automatic CTA for every case. Public product prices and buttons retain their current master/runtime authority. Use the existing product destination and its native component; this contract does not change form fields or payment routes.

As observed during this task, `/blog/` redirects to the home page. The pilot article is a draft artifact, not a live blog URL. Do not queue a post promising a full article until the intended destination exists and has been checked. Published related-article links are optional; empty is valid when no relevant live article is available.

## Carousel and the derived video

Default: **eight slides**, `1080 × 1350` PNG, plus an eight-page PDF for review/document-carousel channels where supported. One thought per slide; a short heading and a small amount of readable body copy.

| Slide | Structure | Visual treatment |
| --- | --- | --- |
| 1 | Series/alias; headline; explanatory subtitle | Large serif title, short sans subtitle, one factual tension; no client photo. |
| 2 | Situation | Short context; a simple before-state statement. |
| 3 | Bottleneck | The precise point where the path broke; small route/connection diagram when supported. |
| 4 | Changes | Up to three concrete implemented changes; numbered or ruled rows. |
| 5 | Roles | CAESTHETIC / practice team responsibilities in two clearly labelled groups. |
| 6 | Result | Largest numeric contrast; metric label, source period and compact denominators; direction and evidence remain explicit. |
| 7 | Limit + lesson | What the result does not establish or what remained unresolved, followed by the practical conclusion. |
| 8 | Next action | One CTA, plain destination instruction and recognizable brand. |

A button drawn on a PNG or MP4 is **not clickable**. It is an action cue. The clickable destination comes from the platform caption/link field, profile or a supported link sticker. A PDF link is useful only where the host preserves it. Never tell readers to tap a painted button as if it were a native control.

Video uses the same eight content records with a separate **`1080 × 1920` reflow**, rather than stretching/cropping the carousel. Baseline duration **39 seconds**, within the requested 30–45 seconds; timing can be tuned to actual reading speed. Export MP4 H.264/yuv420p and AAC; the pilot may use a silent audio track. Voiceover/music is optional and requires a separate supplied/licensed asset, not a fabricated speaker. Add restrained transitions; preserve enough time for result and CTA. The video and carousel must contain the same facts and limitations.

The vertical working profile places essential content 192 px from the top (72 + 120) and 328 px from the bottom (88 + 240). These safe areas are an editorial working profile, not a universal platform guarantee. Preview each destination and keep critical copy clear of its overlay UI. The vertical-first video contract in `HOOPPY_API.md` remains authoritative for video routing; it does not forbid a distinct 4:5 still carousel.

## Companion text and short post

**Carousel caption:** target 500–800 characters, excluding a separately stored first comment. Start with the owner's problem, add the relevant decision, give the qualified result/lesson, end with one action and the appropriate destination instruction. Include essential limitations in the post/creative, not only behind a link.

**Short post:** one static `1080 × 1350` card with headline, optional subtitle and one supporting fact/lesson. Its image brief describes layout and real text, not a fictional clinic, patient or testimonial. Caption target 500–900 characters: hook → factual mini-story → result with context → lesson → one CTA. A short post can focus on a different decision from the same case but cannot add a new claim.

Maintain separate variants and counts per platform. Instagram caption hard limit: 2,200 characters; LinkedIn post hard limit: 3,000 characters, including hashtags and URLs where present. These are dated platform limits, checked during this task; recheck before changing adapter rules. Editorial targets above are intentionally shorter. Other platform adapters must record their own supported type/limit rather than reuse an Instagram assumption.

`first_comment` is an independent field containing a short explanation and the relevant link. Do not include it in the caption body. Link placement is a channel decision: Instagram caption/comments normally do not provide a standard clickable web link, so use a profile destination instruction; LinkedIn/Facebook can use a clickable URL where supported. No guarantee is made that moving a link to the first comment improves reach. Compare actual outcomes if this is tested.

## Creative design profile

Profile **`social-case-editorial/1.0.0`** applies current **CAESTHETIC design-system 3.1.0** to exported content. It is an adapter, not a replacement visual SSOT.

| Element | Rule |
| --- | --- |
| Foundation | Cool light background `#F5F7F8`, ink `#14191C`, structural accent `#1C3A4A`, restrained signal `#7B244B`; consume the canonical token snapshot and record its hash. |
| Typography | **Source Serif 4** for editorial headlines and the large result figures; **IBM Plex Sans** for copy, labels and metadata. Two families throughout; no added monospace family. Font licenses/provenance accompany the renderer assets. |
| Layout | 72 px base padding on the 1080 px still canvas; clear grid, aligned baselines, generous gaps, thin rules and square sections. Reflow long copy; never shrink until unreadable. |
| Brand | Use the exact canonical logo, with source/hash recorded. Preserve its geometry and colors. No redrawn or generated logo. |
| Hierarchy | Headline first, one focal number/decision second, evidence note third. Use the signal color for a limited cue; not every line or statistic. |
| Imagery | Type-led case creatives with source-backed diagrams and comparisons. No stock clinic/medical photo, invented dashboard or author portrait required. |
| Consistency | Same alias, section rhythm, footer, slide numbers and CTA treatment across the pack. Vary the factual composition, not the brand system. |

A supplied background can be an input asset after checking contrast, clear space and rights/provenance. Preserve the background as provided; lay out editable text/diagrams separately so all 33 packages can be regenerated. Do not create 33 one-off designs or bake essential typography into an AI-generated background.

## Build, QA and delivery

Pipeline: active published export → normalize/map source → six-section story → English publication JSON → article/captions → deterministic visual render → factual/layout checks → packaged outputs/manifest → publisher adapter → observed publication receipt.

Check the actual risks: source ID/hash mapping; arithmetic and percentage-points wording; dates/denominators; no inferred service implementations; direct identifiers absent from public outputs; English-only payload and consistency with the source; link destinations; caption lengths; eight slides and expected dimensions; no clipping/overlap; MP4 duration/codec; file checksums. Inspect one complete pilot at readable size before expanding the renderer to all 33. These are production checks, not new approval gates.

Keep status distinct: `draft`, `rendered`, `validated`, `queued`, `published`, `failed`. An API create response is not proof of a visible publication. Record platform post ID, planned and actual timestamp, URL, error and retry history. Package/version + platform + slot form the idempotency key; check existing remote state before retrying a timed-out write. Updating source facts invalidates derived outputs and requires regeneration.

The artifact register contains the actual pilot paths, build command, dependencies, provenance, deliverable locations and checksums. Source scripts/JSON/Markdown may be versioned in Git; heavy output media are delivered as linked artifacts. Internal source maps and manuscripts do not enter a public website bundle.

## Hooppy / Dolphin and recurring publication

Use **Hooppy as the primary scheduler** through the existing integration; preserve the exact CAESTHETIC account allowlist from `HOOPPY_API.md` §11.1. The known baseline routes are Instagram `2442190`, Facebook `1977644`, TikTok `2446140`, YouTube `2443192` and LinkedIn `2442189`. These IDs are dated routing evidence, not authorization to post this pilot now. Never substitute another brand/account or discover/log raw provider credentials.

Existing Hooppy transport has verified upload/create/scheduled-post behavior. **First-comment automation is documented in the UI but API support is not verified in this task. LinkedIn PDF/document-carousel delivery through Hooppy is also unverified.** Keep these as adapter capabilities to confirm, not falsely completed automation. If a format is unavailable, preserve its file and use a supported native path or an explicitly selected alternative format. Do not silently turn a PDF carousel into an unrelated video post.

Dolphin is a controlled fallback for a platform action the available API cannot perform; use the existing profile/queue/evidence contract. It is not a parallel scheduler for the same slot. Outreach, invites and DMs remain separate from organic case publishing. Do not create duplicate schedules in Hooppy and Dolphin.

Proposed starting rhythm: one case family per week, with article first, carousel and short post separated across the week; use the derivative video as a later placement. This is a default editorial proposal, not a created schedule. Select actual account-local times and avoid colliding with the existing CAESTHETIC rotation. Each format has a distinct hook and purpose; never send all versions simultaneously to the same audience.

The operator-ready handoff needs case/package version, platform/account, asset reference/checksum, caption, first comment capability/result, destination/UTM, schedule slot, idempotency key and publication status/URL. Blog publication uses the site's own deployment workflow, not an assumed Hooppy blog endpoint. Full automation is complete only after the actual adapter paths are exercised and publication receipts are recorded.

## Version and artifact precedence

- Version 1.1.0 makes English the sole publication language and replaces the bilingual CN-001 delivery with an English-only release. Historical originals remain available through their recorded version-0 references.

- This version supersedes the **format/layout recommendations** in the earlier `CAESTHETIC_Case_Publishing_Plan_RU.md`: eight slides, current cool design tokens, one content contract and verified capability boundaries now control.
- `CAESTHETIC_Case_Stories_RU.docx` remains the dated 33-story editorial manuscript, not a new factual source over the active case records.
- `case_stories_editorial.json` and the pinned public export preserve structured provenance; they are internal inputs, not publication payloads.
- Artifact inventory and pilot reproduction: [ARTIFACTS.md](../caesthetic/social-cases/ARTIFACTS.md).
- User-requested scope of this release: one actual pilot package plus SSOT/routing. Remaining 32 packages, live blog deployment and scheduled social distribution are subsequent work; no automatic schedule is claimed here.

## Dated platform references — 2026-09-06

- [LinkedIn post limits](https://www.linkedin.com/help/linkedin/answer/a528176): 3,000-character post limit.
- [Instagram media API reference](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media): 2,200-character caption limit.
- [Hooppy OpenAPI](https://hooppy.ru/openapi.yaml): use documented API fields; a first-comment field is not established by this task.
- [Hooppy autoposting guide](https://blog.hooppy.ru/autoposting/) and [first-comment announcement](https://t.me/hooppy_ru/284): UI feature evidence does not establish API parity.
- [Hooppy publishing description](https://hooppy.ru/landing/autoposting/): Excel bulk publishing and Instagram carousel descriptions are not a universal CSV contract. PDF upload support alone does not verify LinkedIn document-carousel placement.
