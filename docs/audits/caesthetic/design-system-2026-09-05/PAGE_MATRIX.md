# Every page: design conformance matrix

Source snapshot: `5dad5f00ed2a1105a0542ff42841bdd612ec4374`. All 56 route candidates rendered at 320/390/1440px; seven non-route fragments inspected as source. Protected production screens and local report source are separate observations. Refreshed local data replaces the earlier fallback.

**REVIEW** means measured subset, not a conformance pass. Overflow candidates include legitimate horizontally scrollable tables/tabs and require interpretation. DS IDs refer to the prioritized [remediation plan](README.md). Essential-type/cascade migration affects shared pages even where automated accessibility checks find no violation.

| Source / route | Profile / HTTP | Rendered coverage | Specific plan / evidence |
|---|---|---|---|
| `site-caesthetic/404.html`<br>`/404.html` | public; 307 | Live 320,390,1440; local 320,390,1440 | DS-02 |
| `site-caesthetic/_handoff/lane-b/footer.html`<br>`/_handoff/lane-b/footer.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/_handoff/lane-b/header.html`<br>`/_handoff/lane-b/header.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/_handoff/lane-c/caesthetic-analytics-snippet.html`<br>`/_handoff/lane-c/caesthetic-analytics-snippet.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/about/index.html`<br>`/about/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; Overflow review 320,390 |
| `site-caesthetic/audit/index.html`<br>`/audit/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/audits/index.html`<br>`/audits/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/beauty-salons/index.html`<br>`/beauty-salons/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; DS-03; axe: link-in-text-block; Overflow review 320 |
| `site-caesthetic/case-studies/case/index.html`<br>`/case-studies/case/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/case-studies/index.html`<br>`/case-studies/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-05; axe: aria-prohibited-attr; Overflow review 320,390 |
| `site-caesthetic/case-studies/intake/index.html`<br>`/case-studies/intake/` | public; 404 | Live 320,390,1440; local 320,390,1440 | DS-10; access/error only live |
| `site-caesthetic/connect4/index.html`<br>`/connect4/` | public; 200 | Live 320,390,1440 | DS-08 |
| `site-caesthetic/es/salones-de-belleza/index.html`<br>`/es/salones-de-belleza/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; DS-03; axe: link-in-text-block; Overflow review 320 |
| `site-caesthetic/fr/salons-de-beaute/index.html`<br>`/fr/salons-de-beaute/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; DS-03; axe: link-in-text-block; Overflow review 320,390 |
| `site-caesthetic/growth-score/index.html`<br>`/growth-score/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/growth-system/index.html`<br>`/growth-system/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/index.html`<br>`/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; Overflow review 320,390 |
| `site-caesthetic/lead-to-revenue-check/index.html`<br>`/lead-to-revenue-check/` | scoped Check500; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/legal/cookies/index.html`<br>`/legal/cookies/` | public; 200 | Live 320,390,1440 | DS-08 |
| `site-caesthetic/legal/index.html`<br>`/legal/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/legal/payment-terms/index.html`<br>`/legal/payment-terms/` | public; 200 | Live 320,390,1440 | DS-08 |
| `site-caesthetic/legal/privacy/index.html`<br>`/legal/privacy/` | public; 200 | Live 320,390,1440 | DS-08 |
| `site-caesthetic/legal/terms/index.html`<br>`/legal/terms/` | public; 200 | Live 320,390,1440 | DS-08 |
| `site-caesthetic/multi-location-growth-score/index.html`<br>`/multi-location-growth-score/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/pay/index.html`<br>`/pay/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/pricing/index.html`<br>`/pricing/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; Overflow review 320,390 |
| `site-caesthetic/privacy/index.html`<br>`/privacy/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/private/bonita/offer/index.html`<br>`/private/bonita/offer/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/expert-dental/index.html`<br>`/private/expert-dental/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/expert-dental/offer/index.html`<br>`/private/expert-dental/offer/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/expert-dental-estimate/index.html`<br>`/private/expert-dental-estimate/` | private; 200 | Live 320,390,1440 | DS-02; DS-11; Overflow review 320 |
| `site-caesthetic/private/expert-dental-estimate-v2/index.html`<br>`/private/expert-dental-estimate-v2/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-11; DS-10; access/error only live |
| `site-caesthetic/private/faina-perukarnya/index.html`<br>`/private/faina-perukarnya/` | private; 200 | Live 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/faina-perukarnya-v2/index.html`<br>`/private/faina-perukarnya-v2/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/fermerskiy-ostrovok/index.html`<br>`/private/fermerskiy-ostrovok/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/nogi-v-ruki/index.html`<br>`/private/nogi-v-ruki/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/nogi-v-ruki/offer/index.html`<br>`/private/nogi-v-ruki/offer/` | redirect; 200 | Live 320,390,1440 | DS-10; access/error only live |
| `site-caesthetic/private/prodavay-kak-faunder/assets/decks/pisarevsky-events.html`<br>`/private/prodavay-kak-faunder/assets/decks/pisarevsky-events.html` | private; 307 | Live 320,390,1440; local 320,390,1440 | DS-11; axe: color-contrast |
| `site-caesthetic/private/prodavay-kak-faunder/index.html`<br>`/private/prodavay-kak-faunder/` | private; 200 | Live 320,390,1440; local 320,390,1440 | DS-11; DS-10; access/error only live |
| `site-caesthetic/private/prodavay-kak-faunder/transcript-body.html`<br>`/private/prodavay-kak-faunder/transcript-body.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/ru/salony-krasoty/index.html`<br>`/ru/salony-krasoty/` | public; 200 | Live 320,390,1440 | DS-02; DS-08; DS-01; DS-03; axe: link-in-text-block; Overflow review 320,390 |
| `site-caesthetic/score/aesthetemed-public-evidence-7c3e91b4a8f26d50/index.html`<br>`/score/aesthetemed-public-evidence-7c3e91b4a8f26d50/` | warm report; 404 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-08; DS-12; DS-10; access/error only live; axe: html-has-lang; Overflow review 320,390 |
| `site-caesthetic/score/aurora-medspa-x7k9m2/index.html`<br>`/score/aurora-medspa-x7k9m2/` | warm report; 404 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-12; DS-10; access/error only live; axe: html-has-lang |
| `site-caesthetic/score/demo-aesthetics-clinic-reputation-gap/index.html`<br>`/score/demo-aesthetics-clinic-reputation-gap/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/demo-injector-practice-booking-friction/index.html`<br>`/score/demo-injector-practice-booking-friction/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/demo-medical-aesthetics-search-gap/index.html`<br>`/score/demo-medical-aesthetics-search-gap/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/demo-multi-location-growth-score/focus-location/index.html`<br>`/score/demo-multi-location-growth-score/focus-location/` | warm report; 200 | Live 320,390,1440 | DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/demo-multi-location-growth-score/index.html`<br>`/score/demo-multi-location-growth-score/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12; DS-04; axe: scrollable-region-focusable; Overflow review 320,390 |
| `site-caesthetic/score/demo-publish-control-plane-network/focus-location/index.html`<br>`/score/demo-publish-control-plane-network/focus-location/` | warm report; 200 | Live 320,390,1440 | DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/demo-publish-control-plane-network/index.html`<br>`/score/demo-publish-control-plane-network/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12; Overflow review 320,390 |
| `site-caesthetic/score/index.html`<br>`/score/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/index.html`<br>`/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/` | warm report; 200 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-08; DS-12; DS-10; access/error only live; Overflow review 320,390 |
| `site-caesthetic/score/prestige-ru-pilot-520-20260901-c6d8e2/index.html`<br>`/score/prestige-ru-pilot-520-20260901-c6d8e2/` | warm report; 200 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-12; DS-10; access/error only live; Overflow review 320,390 |
| `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/index.html`<br>`/score/spoken-medspa-snellville-9d7f3a5c2e184b61/` | warm report; 200 | Live 320,390,1440; local 320,390,1440 | DS-02; DS-08; DS-12; DS-10; access/error only live; Overflow review 320 |
| `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v2/index.html`<br>`/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v2/` | isolated v2; 200 | Live 320,390,1440; local 320,390,1440 | DS-08; Scoped v2; preserve profile; DS-10; access/error only live; Overflow review 320,390 |
| `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/index.html`<br>`/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/` | warm report; 200 | Live 320,390,1440 | DS-02; DS-08; DS-12 |
| `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v2/index.html`<br>`/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v2/` | isolated v2; 200 | Live 320,390,1440 | DS-08; Scoped v2; preserve profile; Overflow review 320,390 |
| `site-caesthetic/sprint/index.html`<br>`/sprint/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/support/index.html`<br>`/support/` | public; 200 | Live 320,390,1440 | DS-02; DS-08 |
| `site-caesthetic/templates/footer.html`<br>`/templates/footer.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/templates/header.html`<br>`/templates/header.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/templates/partner-tech-fieldset.html`<br>`/templates/partner-tech-fieldset.html` | fragment; NOT_APPLICABLE | Source only (non-route fragment) | REVIEW; no confirmed issue in measured subset |
| `site-caesthetic/terms/index.html`<br>`/terms/` | redirect; 200 | Live 320,390,1440 | REVIEW; no confirmed issue in measured subset |

## Dynamic and edge-state coverage

| Route/state | Widths | Result / next action |
|---|---|---|
| `/case-studies/case/?id=miami-concierge-medspa-consult-path` | 320, 390, 1440 | Published content resolved at all tested widths; shared DS-02/08 review |
| `/case-studies/case/?id=test-ai-booking-friction` | 320, 390, 1440 | Published content resolved at all tested widths; shared DS-02/08 review |
| `/preview/design-system-review-invalid/` | 320, 390, 1440 | Error/access state reviewed; DS-10 applies; successful authorized state not assessed |
| `/case-studies/intake/guide/` | 320, 390, 1440 | Error/access state reviewed; DS-10 applies; successful authorized state not assessed |
| `/definitely-not-existing-design-review` | 320, 390, 1440 | Error/access state reviewed; DS-10 applies; successful authorized state not assessed |
