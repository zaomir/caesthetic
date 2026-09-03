# CAESTHETIC_OUTBOUND_DOMAIN_STANDARD

**Status:** active  
**Version:** 1.0  
**Effective:** 2026-09-03  
**Owner:** CAESTHETIC / founder  
**Research basis:** `docs/research/caesthetic/OUTBOUND_DOMAIN_IDENTITY_REVIEW_2026-09-03.md`

## 1. Decision

CAESTHETIC has one public commercial identity and one approved cold-outbound sender domain:

- `caesthetic.com` — canonical public website, product, legal and customer-support domain;
- `caesthetic.co` — `approved_cold_outbound_sender` and sender-verification entry for CAESTHETIC.

The other domains reviewed in this decision are separate products, unresolved assets or separate runtimes. They are not aliases, campaign brands or alternative identities of CAESTHETIC. Creating five CAESTHETIC mini-sites would produce identity mismatch, duplicate the funnel and weaken evidence boundaries.

## 2. Product role by domain

| Domain | Current product role | CAESTHETIC outbound status | Required public-web behavior |
|---|---|---|---|
| `caesthetic.co` | Dedicated CAESTHETIC sender identity | `approved_cold_outbound_sender` | Root and `www` redirect through the CAESTHETIC sender-domain Worker to the noindex verification page at `https://caesthetic.com/outreach/`. No separate product catalogue, pricing or intake form. |
| `bebofix.com` | Independent UK home-services marketplace and home-services marketing offer | `not_authorized_for_caesthetic_outbound` | Preserve BeboFix identity. Do not place CAESTHETIC copy on the root and do not send CAESTHETIC email from this domain. |
| `bebonow.com` | Unresolved beauty-marketplace asset; current public surface contains template/placeholder content | `not_authorized_for_caesthetic_outbound` | Quarantine from sending. Do not redirect or rebrand as CAESTHETIC until a separate product brief, operator, runtime, legal identity and release decision exist. |
| `bototox.com` | Bototox/Toxifillers professional aesthetic procurement entry | `not_authorized_for_caesthetic_outbound` | Preserve the professional-commerce handoff to Toxifillers. The CAESTHETIC US growth funnel remains isolated from product procurement. |
| `grainee.com` | Separate GRAINEE/EVO/ROVLEX maps-and-reputation runtime | `not_authorized_for_caesthetic_outbound` | Preserve its own product and audience. Do not present it as the parent website of CAESTHETIC without a new canonical architecture decision. |

`not_authorized_for_caesthetic_outbound` means no `From`, `Reply-To`, tracking hostname, signature website, CTA link or disguised campaign identity for CAESTHETIC cold email.

## 3. Sender-verification surface

`https://caesthetic.com/outreach/` is an identity and control surface, not a new funnel stage or paid product. It must:

1. identify `caesthetic.co` as the only currently approved CAESTHETIC cold-outreach domain;
2. identify `caesthetic.com` as the canonical website, product, legal and support domain;
3. explain why a legitimate practice may have been contacted;
4. preserve the pre-Score boundary: a public signal can justify a question, but is not a completed diagnosis;
5. name exactly the Four Surfaces — Search / Google Business Profile, Website, Social, Reputation / Reviews;
6. state that CRM, call handling, reception, patient data, revenue and internal conversion remain not assessed without separate authorized access;
7. provide visible unsubscribe and verification contacts;
8. publish the legal operator and postal address;
9. remain `noindex` and outside primary navigation.

The sender domain may redirect to this page. It must not host a forked CAESTHETIC site, duplicate form or different offer.

## 4. Message identity contract

Every CAESTHETIC cold email must follow all of these rules:

- the visible `From` name identifies the named sender and CAESTHETIC;
- the `From` address is an approved mailbox at `@caesthetic.co`;
- `Reply-To` stays on the same sender mailbox unless a documented operational escalation uses `info@caesthetic.com`;
- the originating domain, DKIM signing domain and/or SPF envelope domain produce valid DMARC alignment;
- links point only to `caesthetic.com`, `caesthetic.co`, or an approved aligned tracking subdomain recorded in the sending configuration;
- the opening is Reply-first: one current verified public signal, one relevance statement and one low-friction question;
- it does not claim that a Growth Score, constraint diagnosis or internal assessment has already been completed;
- it does not request passwords, patient information, medical records, card details or payment;
- it does not promise rankings, patient volume, revenue, ROI or guaranteed growth;
- its commercial identity and subject are not deceptive;
- it includes the legal postal address and a visible unsubscribe path.

Attachments, multiple CTAs, calendar links and price-led first touches remain disallowed by the global outbound standard.

## 5. Technical and deliverability gate

A mailbox or campaign remains `HOLD` until the accountable operator verifies:

1. working MX and mailbox reply handling;
2. SPF, DKIM and DMARC on `caesthetic.co` with direct-mail alignment;
3. TLS and valid sending infrastructure identity;
4. an approved, domain-aligned tracking configuration or no click tracking;
5. RFC 8058 one-click unsubscribe where the sending class/provider requires it, plus a visible body unsubscribe;
6. unsubscribe processing and global suppression within **48 hours**;
7. bounce, complaint and provider-block monitoring;
8. Gmail Postmaster or equivalent reputation monitoring once data is available;
9. gradual volume ramp after warm-up rather than immediate bulk scaling;
10. a reviewed audience source, legitimate B2B relevance and verified business email.

The operational target is to keep user-reported spam below `0.1%` and never allow it to reach `0.3%`. Technical authentication is necessary but does not make unsolicited or irrelevant email acceptable.

## 6. Suppression and domain separation

- Unsubscribe, hard bounce, complaint and explicit “do not contact” events enter the shared CAESTHETIC suppression registry.
- A suppressed address or practice may not be retried through another sender mailbox or domain.
- Bototox/Toxifillers commerce outreach and CAESTHETIC growth outreach remain separate motions. Cross-product contact is allowed only when the new purpose has its own lawful and operational basis and suppression is still respected.
- Transactional notifications remain on the canonical role defined in `docs/ssot/CAESTHETIC.md`; they are not moved to `caesthetic.co`.

## 7. Change gate

Adding any sender domain requires all of the following before use:

- active product/domain registration in `PROJECT_DOMAIN_REGISTRY.md`;
- explicit relationship to CAESTHETIC in an approved SSOT;
- truthful public sender-verification surface;
- legal operator and contact disclosure;
- SPF, DKIM, DMARC, unsubscribe and suppression verification;
- mailbox warm-up and deliverability `GO`;
- production URL, deployed SHA and smoke evidence.

Domain availability, ownership or an aesthetic-sounding name is not enough.

## 8. Release contract

Production acceptance for the current decision is:

- `https://caesthetic.com/outreach/` → HTTP 200 with the identity markers above;
- `https://caesthetic.co/` → HTTP 308 to the canonical verification page and final HTTP 200;
- `https://www.caesthetic.co/` → final canonical verification page and HTTP 200;
- deployed `grainee-caesthetic-outreach` Worker routes for apex and `www`;
- passing `tests/caesthetic/outbound-domain-identity.test.mjs` and production smoke;
- no runtime or content mutation to BeboFix, BeboNow, Bototox/Toxifillers or GRAINEE as part of this CAESTHETIC release.
