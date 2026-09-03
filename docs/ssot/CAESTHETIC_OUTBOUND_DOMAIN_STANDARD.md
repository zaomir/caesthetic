# CAESTHETIC_OUTBOUND_DOMAIN_STANDARD

**Status:** active  
**Version:** 2.0  
**Effective:** 2026-09-03  
**Owner:** CAESTHETIC / founder  
**Research basis:** `docs/research/caesthetic/OUTBOUND_DOMAIN_IDENTITY_REVIEW_2026-09-03.md`

## 1. Founder decision

CAESTHETIC may use exactly these five domains for cold-outbound email:

- `caesthetic.co`
- `bebofix.com`
- `bebonow.com`
- `bototox.com`
- `grainee.com`

Each is an `approved_portfolio_sender_domain`.

This is one CAESTHETIC product system with five controlled campaign entries, not five competing products, five copied websites, or permission to rotate domains around suppression. `caesthetic.com` remains the canonical product, legal, support, intake, and reporting website.

## 2. Product and public-web contract

| Sender domain | Campaign role | Public entry | Distinct canonical explanation |
|---|---|---|---|
| `caesthetic.co` | Direct CAESTHETIC | `https://caesthetic.co/` | `https://caesthetic.com/outreach/direct-caesthetic/` |
| `bebofix.com` | Fix Before You Fund | `https://bebofix.com/caesthetic/` | `https://caesthetic.com/outreach/fix-before-you-fund/` |
| `bebonow.com` | Booking Readiness Now | `https://bebonow.com/caesthetic/` | `https://caesthetic.com/outreach/booking-readiness-now/` |
| `bototox.com` | Professional Aesthetic Practice Growth | `https://bototox.com/caesthetic/` | `https://caesthetic.com/outreach/professional-aesthetics-growth/` |
| `grainee.com` | Search and Reputation Evidence | `https://grainee.com/caesthetic/` | `https://caesthetic.com/outreach/search-reputation-evidence/` |

The public implementation uses five distinct noindex verification pages. Every page has its own title, headline, explanation, evidence angle, and campaign-specific copy. Shared legal identity, unsubscribe, Four Surfaces, and product boundaries may repeat because they are common controls, not SEO landing-page content.

The sender entry returns a permanent `308` to its fixed canonical explanation. Query propagation is allowlisted. Arbitrary redirect targets are rejected.

`caesthetic.co` is the only full-host CAESTHETIC sender edge. The other four domains preserve their existing product roots and expose only `/caesthetic/` and descendants. No CAESTHETIC release may capture or replace their root websites without a separate runtime decision.

The verification hub at `https://caesthetic.com/outreach/` lists the five entries and links to their distinct pages. The hub and all five pages remain `noindex`, outside the primary navigation, and outside the XML sitemap.

## 3. One product, different opening narratives

Every route leads to the same canonical funnel:

`Free Growth Score → 30-Day Growth Sprint ($2,500) when evidence supports a finite priority → optional Growth System`

The domain changes the relevant first conversation, not the product:

- **Direct CAESTHETIC:** general constraint-first growth control.
- **Fix Before You Fund:** inspect the public system before increasing demand or funding another change.
- **Booking Readiness Now:** evaluate whether a current provider, treatment, location, launch, or booking-path change is publicly coherent.
- **Professional Aesthetic Practice Growth:** connect treatment visibility, provider credibility, proof, and booking without implying procurement history.
- **Search and Reputation Evidence:** begin with Search, GBP, Maps, or Reviews evidence while still evaluating all four surfaces.

One account has one active opening narrative and one assigned sender domain. A second domain is not a follow-up strategy and may not be used to bypass silence, rejection, an unsubscribe, a complaint, or a do-not-contact instruction.

## 4. Evidence and message boundary

Pre-Score outreach may use one current, verified public signal and one low-friction permission question. It may not state that a Growth Score, binding constraint, internal conversion diagnosis, or loss estimate has already been completed.

All five pages and messages preserve exactly the Four Surfaces:

1. Search / Google Business Profile
2. Website
3. Social
4. Reputation / Reviews

Cross-Surface Consistency is a metric across the four surfaces, not a fifth surface. Paid Ads remain the Demand Layer.

CRM, call handling, reception, patient data, close rate, revenue, capacity, follow-up, and internal conversion remain `Not assessed` or `Insufficient evidence` without authorized access and evidence.

The message must not promise rankings, review volume, patients, revenue, ROI, or guaranteed growth. Review gating and selective routing of only satisfied patients to public review platforms are prohibited.

For `bototox.com`, the message and page must state that the route does not imply purchase history, a trade account, or an existing procurement relationship. Product procurement, clinical advice, dosing, treatment suitability, and medical decisions remain separate from CAESTHETIC growth work.

## 5. Identity and link contract

Every email must:

- identify the named sender and CAESTHETIC in the visible `From` identity;
- use an approved mailbox on the assigned sender domain;
- keep `Reply-To` aligned with the operating mailbox unless a documented escalation uses `info@caesthetic.com`;
- use valid SPF, DKIM and DMARC alignment for the actual sending domain;
- link only to the assigned sender entry, `caesthetic.com`, or an approved aligned tracking domain;
- include the legal postal address and a visible unsubscribe path;
- avoid passwords, patient records, card details, payment, or sensitive-access requests in first touch.

Attachments, multiple CTAs, price-led first touches, and calendar links remain disallowed unless a later reply creates a documented reason.

## 6. Shared suppression

One unsubscribe, hard bounce, complaint, refusal, or do-not-contact instruction suppresses future CAESTHETIC marketing outreach across all five domains.

Suppression is account/contact scoped and cross-domain. A domain change never resets consent, relevance, complaint history, or campaign ownership.

Bototox/Toxifillers commerce suppression and CAESTHETIC suppression remain separately attributable, but a clear global do-not-contact instruction is respected across projects.

## 7. Technical readiness

Every mailbox and campaign starts in technical `HOLD`. Technical `HOLD` is a readiness state, not a product prohibition and not a reversal of the five-domain founder decision.

A sender may move to `GO` only after verification of:

1. working MX and reply handling;
2. SPF, DKIM and DMARC alignment;
3. valid TLS and sending infrastructure identity;
4. approved aligned tracking or disabled click tracking;
5. visible unsubscribe and RFC 8058 one-click unsubscribe where required;
6. suppression processing within 48 hours;
7. bounce, complaint, and provider-block monitoring;
8. reviewed B2B audience source and verified business email;
9. gradual volume ramp;
10. successful public entry, distinct-page, apex/`www`, and production smoke.

Operational complaint targets remain below `0.1%`, with `0.3%` treated as a stop condition.

## 8. Machine authority and release contract

The machine-readable portfolio is:

`infra/cloudflare/caesthetic-outreach/domains.json`

It is the runtime source for the five domains, campaigns, entries, destinations, markers, routes, and DNS mutation boundary.

Production acceptance requires:

- five approved entries returning `308`;
- five different canonical paths on `caesthetic.com`;
- five pages returning `200`, each with a unique content marker and unique headline;
- `noindex` plus a self-canonical URL on every page;
- preserved roots for BeboFix, BeboNow, Bototox, and GRAINEE;
- shared legal identity and unsubscribe;
- passing `tests/caesthetic/outbound-domain-identity.test.mjs`;
- passing `scripts/caesthetic-outreach-domain-smoke.sh`;
- successful canonical CAESTHETIC and protected Growth Score smoke;
- deployed SHA recorded in `.deploy/caesthetic.last-success`.

Mail DNS is outside the web-page deploy mutation boundary. The existing `caesthetic.co` web-DNS provisioner may touch only A, AAAA, and CNAME as explicitly configured; it never mutates MX, TXT, SPF, DKIM, or DMARC.
