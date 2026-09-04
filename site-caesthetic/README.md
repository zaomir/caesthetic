# CAESTHETIC — site-caesthetic

**Canonical domain:** `caesthetic.com`  
**Direct cold sender:** `caesthetic.co` · **conditional historical/professional senders:** `bototox.com`, `toxifillers.com`
**Brand logos:** `assets/brand/logo-square.{svg,png}` (circular frames) · `assets/brand/logo-long.{svg,png}` (horizontal) · aliases under `/brand/`  
**Public IA:** US independent aesthetic practices → Growth Score → conditional Lead-to-Revenue Check where internal outcome uncertainty remains → 30-Day Sprint → optional Growth System

## Public pages (Phase 1)

| URL | Role |
|-----|------|
| `/` | Positioning → Growth Score |
| `/growth-score/` | Score explainer + 4-field form |
| `/lead-to-revenue-check/` | Conditional, evidence-gated internal-path diagnostic · fixed $500 · credited once toward the directly following $2,500 Sprint |
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

Public pricing exposes the free Growth Score, the conditional fixed $500 Lead-to-Revenue Check and the fixed $2,500 Sprint. A Check is not mandatory and does not replace the Growth Score; when it continues directly into the next Sprint for the verified constraint, its $500 is credited once toward the Sprint total. Sprint Extension stays internal, and recurring commercial values come only from a client-specific Commercial Schedule.

## Archive

Pre-rebuild multi-vertical HTML: `docs/archive/caesthetic-multivertical-2026-08/`.  
Private client packs remain under `private/`.

## Design

Clinical Editorial Intelligence — `DESIGN.md`, `assets/css/tokens.css`, `assets/css/caesthetic.css`.
