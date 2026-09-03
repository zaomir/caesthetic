# CAESTHETIC_OUTBOUND_DOMAIN_STANDARD

**Status:** active
**Version:** 2.0
**Effective:** 2026-09-03
**Owner:** CAESTHETIC / founder
**Supersedes:** Version 1.0, including the single-sender-domain restriction
**Research basis:** `docs/research/caesthetic/OUTBOUND_DOMAIN_IDENTITY_REVIEW_2026-09-03.md`

## 1. Founder decision

CAESTHETIC uses an approved portfolio of five cold-outbound sender domains:

- `bebofix.com`;
- `bebonow.com`;
- `caesthetic.co`;
- `bototox.com`;
- `grainee.com`.

Every domain above has status `approved_portfolio_sender_domain`. There is no project-level prohibition against using any of the five as a CAESTHETIC `From`, `Reply-To`, sender-verification link or campaign identity, provided the mailbox and campaign satisfy the operating contract in this standard.

`caesthetic.com` remains the canonical public website, product, legal, privacy and customer-support domain. The five sender domains are campaign doors into one CAESTHETIC funnel; they are not five separate products, five separate Growth Scores or five competing public sites.

## 2. Product role by domain

| Domain | Campaign role | Approved verification entry | Assignment logic | Root behavior |
|---|---|---|---|---|
| `caesthetic.co` | **Direct CAESTHETIC** | `https://caesthetic.co/` | General owner/decision-maker outreach where the CAESTHETIC category itself is the relevant opening. | Full host may act as the CAESTHETIC sender-verification edge. |
| `bebofix.com` | **Fix Before You Fund** | `https://bebofix.com/caesthetic/` | A current public signal shows new demand spend, a new site, a service launch or a new location; the permission question is whether to inspect the system before adding more spend. | Existing BeboFix root and product remain intact; only the narrow `/caesthetic/` route is used by CAESTHETIC. |
| `bebonow.com` | **Booking Readiness Now** | `https://bebonow.com/caesthetic/` | A visible launch, provider, service or booking-path change creates a timely public-readiness question. No internal conversion claim is implied. | Existing root remains intact; only the narrow `/caesthetic/` route is used by CAESTHETIC. |
| `bototox.com` | **Professional Aesthetic Practice Growth** | `https://bototox.com/caesthetic/` | Outreach to a professional-aesthetics audience where practice growth is relevant. The message must not imply order history, customer status or procurement knowledge. | Bototox/Toxifillers procurement remains a separate commercial motion; only `/caesthetic/` is the CAESTHETIC bridge. |
| `grainee.com` | **Search and Reputation Evidence** | `https://grainee.com/caesthetic/` | The opening signal comes from Maps, Google Business Profile or public review evidence. The requested Growth Score still covers all four surfaces. | Existing GRAINEE/EVO/ROVLEX root remains intact; only `/caesthetic/` is the CAESTHETIC bridge. |

The campaign role controls the opening narrative. It does not authorize an unsupported diagnosis. Pre-Score remains qualification plus a verified public signal; the real Growth Score begins only after the practice requests it.

## 3. One product and one canonical destination

All five domain routes hand off to the noindex sender-verification surface at:

`https://caesthetic.com/outreach/`

That surface must:

1. identify all five approved sender domains and their campaign roles;
2. identify `caesthetic.com` as the canonical product, legal and support site;
3. explain the one-product/five-campaign-door model;
4. preserve exactly the Four Surfaces — Search / Google Business Profile, Website, Social, Reputation / Reviews;
5. state that CRM, call handling, reception, patient data, revenue and internal conversion remain not assessed without appropriate access;
6. state that one opt-out suppresses CAESTHETIC marketing outreach across all five domains;
7. publish the legal operator, postal address, verification contact and unsubscribe control;
8. remain `noindex` and outside the primary product navigation.

The route may preserve only approved attribution parameters. It must not accept an arbitrary redirect destination.

## 4. Account-to-domain assignment

The portfolio is not a rotation mechanism for repeatedly contacting the same prospect.

```text
one account
→ one active opening narrative
→ one assigned sender domain
→ one active sequence
```

Rules:

- choose the domain from the strongest current verified signal, not randomly;
- record `sender_domain`, `campaign_role`, `reason_for_relevance`, `source_url`, `verified_at`, `account_owner` and `wave_id` before send;
- do not run concurrent opening sequences to one company from different portfolio domains;
- do not move a non-responder to another domain merely to reset recognition or provider limits;
- a material new signal may justify a later reassignment only after the prior sequence is closed and suppression is clear;
- all five campaigns use the same master company/contact records and the same suppression system.

## 5. Message identity contract

A CAESTHETIC message may originate from a mailbox on any approved portfolio domain. Every message must still make the commercial identity clear:

- the visible `From` name identifies the named sender and CAESTHETIC;
- the signature states CAESTHETIC and, when the domain name is not self-explanatory, the campaign role or relationship;
- `Reply-To` stays on the active sender mailbox or uses the documented CAESTHETIC support escalation at `info@caesthetic.com`;
- the subject and originating domain are not deceptive;
- the message contains one verified public signal, one relevance statement and one low-friction reply question;
- the message does not claim that a Growth Score, binding constraint or internal diagnostic has already been completed;
- the message does not request passwords, patient information, medical records, card details or payment;
- the message does not promise rankings, patient volume, revenue, ROI or guaranteed growth;
- the visible destination is the sender-domain verification route or `caesthetic.com`;
- the message includes the legal postal address and a visible unsubscribe path.

Attachments, multiple CTAs, calendar links and price-led first touches remain outside the approved first-touch pattern.

## 6. Bototox and cross-product boundary

Using `bototox.com` as an approved sender domain does not merge the procurement product with CAESTHETIC.

- Do not infer that a recipient bought from Bototox/Toxifillers.
- Do not use order, account or treatment information as an outreach fact unless a separately authorized lawful workflow explicitly permits it.
- Do not place product procurement and the Growth Score in the same first-touch offer.
- An unsubscribe or do-not-contact instruction applies to CAESTHETIC marketing across the five-domain portfolio; the underlying product systems keep their own lawful transactional boundaries.

The same principle applies to existing BeboFix and GRAINEE roots: the `/caesthetic/` bridge authorizes a transparent campaign relationship, not a silent rebranding of the root product.

## 7. Technical readiness is per mailbox, not a domain prohibition

All five domains are approved in product policy. A specific mailbox or sending stream may nevertheless remain `HOLD` until its actual configuration is verified:

1. working MX and reply handling;
2. SPF, DKIM and DMARC with appropriate alignment;
3. TLS and valid sending infrastructure identity;
4. an approved aligned tracking configuration or no click tracking;
5. one-click unsubscribe where required by the provider/sending class, plus a visible body unsubscribe;
6. unsubscribe and global suppression processing within 48 hours;
7. bounce, complaint and provider-block monitoring;
8. verified business addresses and a reviewed audience source;
9. gradual volume ramp rather than immediate bulk scaling.

A technical `HOLD` is a readiness state for the mailbox or campaign, not a ban on the approved domain. The operator may activate each domain independently as its mailbox evidence becomes available.

## 8. Global suppression across the portfolio

- One unsubscribe, explicit stop, complaint, hard bounce or do-not-contact instruction blocks CAESTHETIC marketing across all five domains.
- Suppression is applied at contact and company level where the instruction requires it.
- A suppressed address or practice may not be retried through a different sender domain.
- A substantive reply stops the active automated sequence and receives a named human owner.
- Domain performance is measured separately, but suppression and account ownership are shared.

## 9. Minimum portfolio measurement

Track at least:

```text
sender_domain
campaign_role
mailbox
wave_id
sent
delivered
hard_bounce
soft_bounce
reply
positive_reply
unsubscribe
complaint
meeting_or_growth_score_request
```

Compare domains only after audience, offer, verification quality and volume are sufficiently comparable. A high reply rate alone does not prove the domain caused the result.

## 10. Release contract

Production acceptance for the portfolio is:

- `https://caesthetic.com/outreach/` → HTTP 200 with all five domain roles, Four Surfaces, legal identity and portfolio-wide opt-out;
- `https://caesthetic.co/` and `www` → fixed sender edge → canonical verification page;
- `https://bebofix.com/caesthetic/` and `www` → fixed sender edge → canonical verification page;
- `https://bebonow.com/caesthetic/` and `www` → fixed sender edge → canonical verification page;
- `https://bototox.com/caesthetic/` and `www` → fixed sender edge → canonical verification page;
- `https://grainee.com/caesthetic/` and `www` → fixed sender edge → canonical verification page;
- existing non-CAESTHETIC roots remain outside the CAESTHETIC Worker route;
- any hostname carrying a narrow `/caesthetic/` Worker route must be Cloudflare-proxied with valid edge TLS; enabling proxy-only mode may not change the existing DNS record type or destination;
- contract tests and production smoke pass;
- the exact deployed SHA is recorded.

## 11. Supersession note

The founder decision on 2026-09-03 removed the Version 1.0 domain-level restrictions. Any older text saying that only `caesthetic.co` is authorized, or that the other four domains are prohibited for CAESTHETIC outbound, is superseded by this Version 2.0 standard.
