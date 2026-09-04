# CAESTHETIC — site-caesthetic

**Canonical domain:** `caesthetic.com`  
**Direct cold sender:** `caesthetic.co` · **conditional historical/professional senders:** `bototox.com`, `toxifillers.com`
**Brand logos:** `assets/brand/logo-square.{svg,png}` (circular frames) · `assets/brand/logo-long.{svg,png}` (horizontal) · aliases under `/brand/`  
**Public IA:** US independent aesthetic practices → Growth Score → 30-Day Sprint → optional Growth System. Lead-to-Revenue Check is the always-recommended, optional-to-buy diagnostic complement for the authorized internal path; it is not a fourth headline product.

## Public pages (Phase 1)

| URL | Role |
|-----|------|
| `/` | Positioning → Growth Score |
| `/growth-score/` | Score explainer + 4-field form |
| `/lead-to-revenue-check/` | Always-recommended, optional-to-buy, evidence-gated internal-path diagnostic · fixed $500 · credited toward the next qualifying direct-continuation $2,500 Sprint |
| `/audit/`, `/audits/`, `/multi-location-growth-score/` | Noindex synonym aliases to `/growth-score/` |
| `/sprint/` | Diagnosis-led 30-Day Growth Sprint · generated fixed price · written scope/payment inquiry |
| `/growth-system/` | Optional recurring ownership · client-specific Growth Budget with its Fixed Management Fee inside |
| `/pricing/` | Public comparison using generated pricing artifacts |
| `/about/` | Corporate category, operating model and evidence standard; no Valerie identity block |
| `/legal/privacy/` | Privacy + CCPA/CPRA |
| `/legal/terms/` | Terms |
| `/score/[slug]/` | Private practice reports (`noindex`, not in sitemap) |
| `/score/` | Public-safe, noindex audit catalog; private client entries never render here |
| `/score/demo-*/` | Clearly labeled fictional, synthetic demonstrations (`noindex`, linked from `/growth-score/`) |

Growth Score source data lives in each route's `report.json`. Render and verify semantic HTML with:

```bash
node scripts/caesthetic/render-growth-score.mjs
node scripts/caesthetic/render-growth-score.mjs --check
node scripts/caesthetic/growth-score-project-catalog.mjs
node scripts/caesthetic/growth-score-project-catalog.mjs --check
node --test tests/caesthetic/growth-score-*.test.mjs
```

Every approved `site-caesthetic/score/**/report.json` is discovered automatically. The complete generated registry lives at `docs/audits/caesthetic/growth-score-projects.generated.json`; `/score/catalog.json` and `/score/index.html` contain only synthetic demos or client cases with explicit public-listing approval. Real client reports default to private.

## Shared Check500 section contract

`docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md` owns the single English copy source `check500-section/en-US/1.0.0`. Every relevant website surface that renders a full Check500 offer section must use its exact H2, product line, body, CTA and fine print in the locked order. Compact navigation, footer, comparison-table and legal references may use the canonical product label without repeating the full section.

Full Check500 sections use `check500-style/1.0.0`. The hash-locked reference is `docs/ssot/assets/caesthetic/check500-section-style-v1.png`: warm ivory tactile field, centered editorial hierarchy, deep-navy serif H2, deep-navy sans-serif supporting copy, thin navy rules, restrained burgundy accents and a wide burgundy CTA. Implement this as accessible responsive HTML/CSS; do not ship the reference raster as the live UI or add unrelated decoration.

Every approved single-location Growth Score and every approved Multi-Location parent renders exactly two always-visible `check500-two-placement/1.0.0` sections: one immediately after the post-enquiry explanation or Lead-to-Revenue Map, and one at the end immediately after the primary `$2,500` Sprint offer as a smaller optional first engagement. The focus-location child remains navigation-only. Behavior may measure engagement but may not hide, delay, reorder or suppress either section. Visibility or interest is not evidence that an internal leak exists, and the Check does not displace a separate evidence-backed Sprint action.

## Sender-domain web behavior

`docs/ssot/CAESTHETIC_OUTBOUND_DOMAIN_STANDARD.md` is the send authority. The public website does not expose a sender-portfolio or outreach-verification hub.

| Domain entry | Public behavior |
|---|---|
| `https://caesthetic.co/` | Brand-domain handoff to the canonical CAESTHETIC home page |
| `https://bebofix.com/caesthetic/` | Retired CAESTHETIC bridge; HTTP 404 |
| `https://bebonow.com/caesthetic/` | Retired CAESTHETIC bridge; HTTP 404 |
| `https://bototox.com/caesthetic/` | No generic public bridge; HTTP 404 |
| `https://grainee.com/caesthetic/` | Retired CAESTHETIC bridge; HTTP 404 |
| `https://toxifillers.com/caesthetic/` | No generic public bridge; HTTP 404 |

`caesthetic.com` remains the one public product, legal and support site. Removing a bridge does not change the owning product at the domain root. Historical/professional eligibility is established in campaign records and message identity, not by a public verification page.

The Worker reads the fixed runtime registry at `infra/cloudflare/caesthetic-outreach/domains.json`. It redirects only `caesthetic.co` to the canonical home page and returns 404 for retired or non-public bridge paths. It does not accept arbitrary redirect targets.

Operational invariants:

- one account → one active sender domain → one opening narrative;
- no domain hopping after nonresponse, refusal, complaint or unsubscribe;
- one unsubscribe suppresses CAESTHETIC marketing across all five domains;
- a domain is product-approved, while each mailbox still requires its own SPF/DKIM/DMARC, reply, unsubscribe and deliverability readiness evidence;
- `bototox.com` use never implies order history or an existing procurement relationship;
- all campaign angles preserve the outside-in, Four-Surface evidence boundary.

Validate the contract with:

```bash
python3 -m json.tool infra/cloudflare/caesthetic-outreach/domains.json >/dev/null
python3 -m py_compile scripts/deploy-caesthetic-outreach-edge.py scripts/configure-caesthetic-outreach-dns.py
node --test tests/caesthetic/outbound-domain-identity.test.mjs
bash scripts/caesthetic-outreach-domain-smoke.sh
```

## Not in the public IA

Sprint Extension, `/clinic-launch/`, `/launch/`, cases and product procurement pages. Sprint Extension remains an unpublished post-delivery option only when finite continuation is objectively justified.

## Config

`assets/js/caesthetic-config.js`:

- `ga4MeasurementId`, `metaPixelId` — optional approved measurement IDs; empty values mean no active GA4/Meta claim
- `phoneDisplay` / `phoneE164` — optional US phone for footer
- `analyst` — repository-authorized Valerie Petra identity, portrait and canonical LinkedIn URL used by the reusable point-of-contact component

## Deploy

```bash
bash scripts/deploy-caesthetic.sh
```

Origin: VPS2402 `185.216.214.28` → `/var/www/caesthetic.com/`  
Canonical edge: Cloudflare Worker `grainee-caesthetic-public` (legacy redirects and protected reports in `infra/cloudflare/router`).  
Sender-domain cleanup edge: Worker codebase `grainee-caesthetic-outreach`, deployed into each owning Cloudflare account and attached only to the fixed routes in `domains.json`.

## Project docs (strategy, specs)

Master authority: `docs/ssot/CAESTHETIC.md`. The read-only `docs/caesthetic/` Dropbox mirror is provenance and working detail, not a competing SSOT.

Public pricing exposes the free Growth Score, the always-recommended but optional-to-buy fixed $500 Lead-to-Revenue Check and the fixed $2,500 Sprint. The Check does not replace the Growth Score or prove an internal leak; when it continues directly into the next qualifying Sprint for the verified constraint, its $500 fee is credited toward the Sprint total. Sprint Extension stays internal, and recurring commercial values come only from a client-specific Commercial Schedule.

## Archive

Pre-rebuild multi-vertical HTML: `docs/archive/caesthetic-multivertical-2026-08/`.  
Private client packs remain under `private/`.

## Design

Clinical Editorial Intelligence — `DESIGN.md`, `assets/css/tokens.css`, `assets/css/caesthetic.css`.
