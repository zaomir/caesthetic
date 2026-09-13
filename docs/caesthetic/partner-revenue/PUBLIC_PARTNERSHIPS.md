---
title: CAESTHETIC Partnerships — public offer and delivery
status: IMPLEMENTED_IN_PR / RELEASE_BLOCKED
version: 1.0.0
last_updated: 2026-09-12
owner: CAESTHETIC
parent: docs/ssot/CAESTHETIC_PARTNER_REVENUE_PLATFORM.md
issue: '#1618'
---

# CAESTHETIC Partnerships

## Decision and value

Owner-authorized solution: launch **CAESTHETIC Partnerships** on the existing CAESTHETIC domain, with paired `/partnerships/` EN and `/ru/partnerships/` RU. Keep `raimsmile.com/partners/` as the Expert Dental/Bishkek-specific proposal and link it to the common CAESTHETIC intake. No additional domain or standalone software brand is needed for this launch.

For a partner, the first read answers what it gains: relevant customer acquisition through brand collaborations and reciprocal communications; visibility and business contacts through events. For a commissioning client, CAESTHETIC owns selection, negotiations, coordination and measurement. For CAESTHETIC, this creates a reusable multi-client entry point and supports separately scoped campaign-management fees, program economics and sponsorship/exhibitor revenue.

This is a business rationale, not measured proof of incremental revenue. Expert remains the first pilot; named banks, clubs or suppliers are not represented as signed participants. The core CAESTHETIC aesthetic-practice funnel stays unchanged. Partnerships can be included in a relevant client offer under a separate SOW; no automatic Sprint inclusion or universal 30/10 tariff.

## Experience and copy ownership

- Shared heading: RU «Новые клиенты. Больше внимания к вашему бренду.» / EN “New customers. More visibility for your brand.”
- Two benefit columns, followed by explicitly illustrative formats: reciprocal campaign, two-organization event, event with three or more organizations.
- A contribution map explains what the company, other participants and CAESTHETIC provide. This is the signature process visual; it makes the exchange concrete without inventing performance data or photography.
- Commercial terms distinguish reciprocal placements from paid organization and sponsorship deliverables. Privileges require agreed funding and capacity.
- One first-contact CTA and a short form: objective, name, work email. Company, city, audience and scope are clarified by reply. No passport, eligibility or participant data is collected on this B2B page.
- RAIM describes the specific pilot, preserves the approved RAIM identity/media and clinic price boundary, and sends requests to CAESTHETIC rather than the clinic's personal messenger.
- Remote-first: email to start, phone/video as useful, physical presence only when needed for the project or event.

Design thesis: a clear editorial proposal with ruled rows and a contribution map. Attributes: concrete, reciprocal, accountable. Avoid: concierge-first generic promise, fake partner logos, card grids, guaranteed customer numbers. Use CAESTHETIC cool-paper/navy/burgundy tokens and existing typography; preserve the RAIM-specific brand on its domain. The paired language control is visible at every viewport; pilot context persists across languages.

`scripts/caesthetic/build-partnership-pages.mjs` owns all three generated pages. RAIM shell and approved hero picture live in `scripts/caesthetic/partnerships/`; the old RAIM generator skips its legacy partner definition and invokes this module. Generate with `node scripts/caesthetic/build-partnership-pages.mjs`; verify with `--check`.

## Routing and implementation

| Surface | Responsibility | Destination |
|---|---|---|
| CAESTHETIC EN/RU | General partner/client/event enquiry | Existing CAESTHETIC public-request endpoint |
| RAIM `/partners/` | Expert Dental in Bishkek | CAESTHETIC RU with `program=expert-dental-kg#request` |
| CAESTHETIC shared footer | Discovery from other public pages | General EN/RU partnership routes |
| Relevant client offers | Optional scoped capability | This page + existing `OFFER_REUSE.md` SOW rules |

The former `/partnerships/` → `/about/` redirect must be removed from both `infra/cloudflare/router/src/index.ts` and `deploy/nginx/snippets/caesthetic-legacy-redirects.conf`. Deploy both the static origin and the Cloudflare Worker; uploading HTML alone cannot activate the EN route.

The page script reuses `CAESTHETIC_API.request`, action `caesthetic_public_request`. Existing server validation, IP rate limit, durable `caesthetic_public_requests` insertion and notification acknowledgement remain authoritative. Intent is `partnership:{general|expert-dental-kg}:{campaign|event|client}:{ru|en}`. The URL sent to the endpoint is reconstructed from the canonical path and the allowlisted program only; arbitrary query parameters and fragments are excluded. Analytics receives program/goal/locale only, never name/email.

Required fields, busy state, retry, 429 explanation, timeout, truthful error and confirmed success are handled explicitly. A server 200 alone is not success: both `ok` and `notification_sent` must be true. No customer lists, medical records or passport identifiers enter this form. Direct CAESTHETIC email remains available if JavaScript or delivery fails.

Twenty and the client CRM adapter remain deferred. These public enquiry pages do not depend on either, do not activate an employee membership and do not change HR quotas, passkeys or the ledger. The production CPRP smoke retains registration, authorization and quota checks; Twenty readback must remain a separately documented outstanding acceptance item rather than a claim made by these pages.

## Acceptance and remaining questions

Acceptance: generated-source consistency; all routes registered in design contract; one H1, canonical/paired hreflang and sitemap; 320/390/1440 responsive checks; both locales' validation, failed notification, rate limit, retry, success and duplicate prevention; Expert handoff/context; real production HTTP and deployed source identity. Browser delivery-state tests mock endpoint responses and do not send notifications to staff; those results must not be described as a fresh real notification test.

Open commercial work, outside publication: first named commissioning client mandate and partner list; each party's audience/channel contribution; campaign budget and CAESTHETIC fee; sponsor inventory and confirmed event participants; funded membership scope/capacity; attribution and data-sharing schedules by market. No public tariff, guaranteed reach or date is invented while these are open.

Release evidence and exact remaining technical checks are recorded in the task session and its delivery receipt. Until those receipts exist, this document does not assert production completion.

## Release observation — 2026-09-12

Implementation is in PR #1620, not on production. Local browser checks passed all three routes at 320/390/1440 and both enquiry flows; the worker route test passes after removing the old EN redirect at both edge and origin. The required GitHub Actions runs terminate as `startup_failure` with zero jobs; the same condition exists on earlier main commits. GitHub rejected retry with HTTP 403, “This workflow run cannot be retried”. The available API does not expose the underlying account/service cause.

Release is blocked until Actions can execute required checks and both deployments. `type=deploy` for CAESTHETIC dispatches that same workflow and is not an independent release channel. Do not mark this task complete, claim notifications were freshly delivered, or treat the old live RAIM page as the new release. Evidence: `docs/runtime/projects/caesthetic/evidence/2026-09-12-partnership-pages/`.
