---
owner: CAESTHETIC / ROVLEX
status: active
created: 2026-09-15
updated: 2026-09-16
scope: staged Bishkek first-touch queue after ROVLEX v3.0 positioning update
authority:
  - docs/ssot/ROVLEX_BUSINESS_MODEL.md
  - docs/ssot/ROVLEX_MARKETING_POSITIONING.md
  - docs/ssot/ROVLEX_EVENTS_COMMUNICATION_STANDARD.md
  - docs/ssot/OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md
  - docs/caesthetic/events/BISHKEK_OUTREACH_100_STATUS.md
---

# Bishkek ROVLEX v3.0 — staged queue of 20

## State

The legacy `a@caesthetic.com` Bishkek lane remains stopped. New Bishkek first touches use the separately approved Instantly lane across all warmed `@rovlex.com` mailboxes under `ROVLEX_EVENTS_COMMUNICATION_STANDARD.md` v1.3. Existing `a@caesthetic.com` conversations stay on their original sender.

The ROVLEX lane has its own deliverability denominator but inherits all shared company/recipient suppressions. One-company canary #87 Technopark KG was sent on 2026-09-16 and had 0 recorded hard bounces/replies at the first post-send inspection. It is no longer part of the pending queue.

All remaining staged routes passed the prior Instantly fallback/probe on 2026-09-15. **That probe is not canonical send authorization.** Fresh EmailVerifier.io validation remains mandatory before every new admission under `OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md`.

## ROVLEX v3.0 message contract

For a potential host, lead with the host's own client relationship:

> Give your clients more reasons to value their relationship with you.

ROVLEX develops themed client events under the host company's brand. Complementary providers form a useful circle of services, connections and experiences around the host's clients. The host invites its own audience; it does not hand over its customer database. ROVLEX registers guests for the agreed event flow.

Every registered guest receives access to a gift service pass from **every participating provider in that event**. Interests may change sequencing and follow-up but do not remove passes from the guaranteed set. Issuance, delivery, activation, booking, redemption/service delivery and any later purchase are separate states.

For a candidate provider, explain the proposed thematic role and the value of being introduced appropriately to the host's relevant audience. Do not present a speculative company as confirmed and do not make the recipient invent the event product.

External identity for new Bishkek first touch:

```text
Actual warmed @rovlex.com mailbox identity
CAESTHETIC
ROVLEX — Partnerships & Events division
```

Use the actual mailbox first name; do not impersonate Alex or Valeriia. Valeriia / `v@caesthetic.com` enters only after a concrete action-readiness signal.

## Queue

| Candidate | Organisation | Likely role / opening angle | Current route state |
|---:|---|---|---|
| 6 | Solutel Hotel | Host / hospitality: client event under hotel brand, venue + guest experience | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 7 | Park Hotel Bishkek | Host / hospitality: curated client experience and venue | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 8 | Garden Hotel | Host / hospitality: thematic event / conference capability | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 13 | Damas International Hotel | Host / hospitality: business-client event and venue | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 15 | Smart Hotel Bishkek | Host / hospitality: curated event for business/international guests | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 18 | Supara Ethno Complex | Host / experience: cultural and gastronomic event magnet | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 41 | Intellect Pro School | Host / audience: family and child-development programme | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 42 | Hope Academy | Host / audience: family and education-themed client/community event | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 43 | Lomonosov School | Host / audience: family and child-development programme | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 49 | Tensai Private School | Host / audience: family and education-themed event | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 50 | Salymbekov Business School | Host / audience: founder/executive client-community programme | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 51 | Kut Stroy | Host / audience: home, design and resident/buyer client event | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 52 | BRK Group | Host / audience: home, design and premium resident/buyer experience | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 54 | ARTWIN | Host / audience: home, design and client experience | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 56 | Imarat Stroy | Host / audience: home, design and resident/buyer event | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 70 | ENESAI Development | Host / audience: home, lifestyle and resident/buyer event | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 87 | Technopark KG | Host / audience / experience: entrepreneur and technology community | **SENT 2026-09-16 via ROVLEX canary lane** |
| 90 | ORO Multibrand Jewelry | Provider / experience: style, jewellery and private-preview contribution | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 95 | NoviNomad | Provider / experience: travel and discovery programme | PROBE_VALID; fresh EmailVerifier + suppression recheck required |
| 100 | Gapar Aitiev Fine Arts Museum | Host / experience: art and cultural event magnet | PROBE_VALID; fresh EmailVerifier + suppression recheck required |

## Excluded route from this batch

Bishkek Boutique Hotel was researched but its tested route failed the fallback verification probe. This is a route-level failure, not an account-level rejection; research an alternate verified route later.

## Release gates before each additional send

1. ROVLEX lane is below its own hard-bounce stop threshold and has no complaint/material sender warning.
2. Recipient route passes **fresh canonical EmailVerifier.io** validation.
3. No prior send, substantive reply, suppression or conflicting active narrative exists for the account across Gmail, Instantly, blocklist and private shared sources.
4. Sending mailbox has real remaining provider capacity; never raise account limits or disable slow ramp to create capacity.
5. First-touch copy follows ROVLEX v3.0 host/provider framing and contains one CTA.

After every new send, confirm the provider outgoing receipt and recheck bounce/reply/suppression state before admitting another lead. At hard bounces / confirmed ROVLEX first touches >=2%, or any complaint/material warning, pause the lane.