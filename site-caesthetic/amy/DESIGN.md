# ACL Amy Concept Laser — DESIGN

Status: active
Updated: 2026-09-14

## Design thesis

The public site should feel like a calm, polished extension of Amy’s Instagram presence rather than a generic clinic template. The signature is **soft beauty editorial + direct booking**: blush/pink/lilac fields, rounded photo cards, Amy’s real imagery, compact brand lockup, and clear Lannion identity.

## Brand identity

- Public name: **ACL Amy Concept Laser**.
- Practitioner: Amy Bernis.
- Primary location: Lannion, France.
- Social authority: `https://www.instagram.com/acl_amy/`.
- Core visual motif: blush backgrounds, berry-pink accent, rounded Instagram-like media cards, restrained gradients.
- Avoid: generic medical-blue UI, anonymous “cabinet laser” identity, invented credentials/results, before/after guarantees, stock imagery.

## Content and conversion

Primary conversion is **choose appointment type → Cal.com**. Website, Instagram and booking must use the same identity and Lannion context. Google Business Profile is not yet available and must not be simulated with an unrelated listing.

The reputation page is non-gated: all ratings receive the same ability to contact Amy. When the practice receives its own GBP, the public Google review destination must be shown equally for every rating.

## Blog

The French blog is a helpful local patient-education surface, not an SEO content farm. Articles use primary regulatory/health sources where appropriate, avoid individual medical advice, and link back to tariffs and booking.

## QA

- Validator: `node scripts/caesthetic/build-amy-site.mjs --check`
- Test home/prices/reviews/booking/blog/article on desktop, tablet and mobile.
- No `private_laser_studio` references are allowed.
- No Google review link until Amy’s own GBP exists.
