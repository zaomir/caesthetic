---
owner: CAESTHETIC
status: active
version: 1.0
updated: 2026-08-28
runtime: site-caesthetic
decision: docs/founder-notes/DEC-856.md
---

# CAESTHETIC Beauty Salons Vertical Pilot

## 1. Decision

CAESTHETIC may operate one isolated public vertical for beauty salons without replacing or diluting the primary US aesthetic-practice funnel.

The public locale routes are:

- English: `https://caesthetic.com/beauty-salons/`
- Spanish: `https://caesthetic.com/es/salones-de-belleza/`
- Russian: `https://caesthetic.com/ru/salony-krasoty/`
- French: `https://caesthetic.com/fr/salons-de-beaute/`

The primary homepage, primary navigation and medical-aesthetics Growth Score remain unchanged. The salon vertical is discoverable from the global footer and from direct campaigns.

## 2. Positioning

> Find where the salon loses clients before spending more to attract them.

The page is not positioned as a generic beauty marketing agency, social-management offer or fixed channel package. It applies the CAESTHETIC growth-control loop:

```text
Evidence
→ Constraint
→ Priority
→ Decision
→ Intervention
→ Adoption
→ Verified Impact
→ Learning
```

The owner-facing output contains one binding constraint, exactly three priorities and one `Do Not Fund Yet`.

## 3. Salon adapter of the Four Surfaces

1. **Search & Maps** — identity, local discovery, locations, categories, services, hours, freshness and route to booking.
2. **Website & Booking** — service, specialist, location, price/range, duration, available time and confirmation.
3. **Social** — current work, specialist expertise, service focus, location clarity and route to booking.
4. **Reputation** — review recency, volume, depth, service/specialist/location proof, replies and incident recovery.

Cross-Surface Consistency remains a separate decision metric, not a fifth surface. Paid acquisition remains a demand mechanism, not a fifth surface.

The medical-aesthetics public weights `30/25/15/30` are not automatically reused for salons. The public pilot therefore explains the surfaces without publishing an unvalidated salon scoring-weight formula.

## 4. Salon demand routes

The diagnostic separates three routes:

```text
New client:
Discovery → Proof → Price/location → Available time → Confirmation

Returning client:
Visit → Rebooking prompt → Reminder → Direct booking → Return

Multi-location client:
Brand → Nearest location → Available specialist → Consistent service → One booking system
```

The route, not the channel list, determines the initial constraint.

## 5. Internal operating floor

Response time, missed enquiries, booking handoff, reminders, no-shows, rebooking, reactivation, CRM workflow and capacity may be relevant. They are not diagnosed from external evidence alone.

The public Score must state `Not assessed` or `Insufficient evidence` when valid access is absent. Internal operations are interventions against a verified constraint, not standalone public product categories.

## 6. Product path

```text
Salon Growth Score — $0
→ 30-Day Salon Growth Sprint — canonical generated public price
→ optional Growth System — client-specific
```

No later stage is mandatory. Commercial numbers remain in `site-caesthetic/src/config/pricing.ts` and generated browser artifacts.

## 7. Proof and claim safety

- No fabricated testimonials, outcomes, rankings or benchmarks.
- The launch page uses one clearly labelled synthetic example.
- The real “Ноги в Руки” material remains private and publication-gated.
- AI may organize evidence; a named human must approve the diagnosis and public wording.
- Every uncertainty stays visible.
- Activity is not adoption; adoption is not verified impact.

## 8. Locale and form contract

Each locale is a standalone static HTML document with:

- self-canonical;
- reciprocal `hreflang` for `en`, `es`, `ru`, `fr`;
- `x-default` to English;
- a first-screen language selector using ordinary links;
- no automatic IP redirect;
- a four-field Growth Score form: name, work email, salon name, city/country.

The form posts the existing `caesthetic-growth-score/2.0` required payload. `source_page` preserves the exact locale route; salon/locale attribution is added to analytics and `utm_content` when campaign content is absent.

## 9. Visual canon

Use Clinical Editorial Intelligence:

- cool clinical paper;
- clinical navy and burgundy signal;
- Source Serif 4, IBM Plex Sans and IBM Plex Mono;
- border-led editorial layouts;
- evidence ledger and decision route;
- no gradients, spa-pink treatment, stock model imagery, card soup or invented social proof.

## 10. Acceptance

The pilot is accepted only when all four routes return HTTP 200 in production, the language selector is keyboard-usable, the form preserves the validated existing intake contract, pricing remains generated, the sitemap contains all routes and the production deploy reports `deployed_sha` with smoke success.
