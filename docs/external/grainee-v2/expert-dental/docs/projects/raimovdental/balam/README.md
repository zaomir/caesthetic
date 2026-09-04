# BALAM — presentation contour

**Status:** PRE-APPROVAL / PRIVATE ONE-PAGE PRESENTATION ONLY  
**Authority:** `docs/ssot/RAIMOV_BALAM.md`  
**Decision:** `docs/founder-notes/DEC-814_balam-first-presentation-gate.md`

## Purpose

Эта папка держит подготовку BALAM до решения Атабека Саидовича. Текущий deliverable — **одна упрощённая презентационная страница**. Это не доказательство существования отдельной детской клиники и не разрешение на public launch.

## Read order

1. `docs/ssot/RAIMOV_BALAM.md` — стратегия, children-first, clinical anchor, one-page scope, approval boundary.
2. `docs/ssot/BALAM.md` — бренд, домен, logo DNA.
3. `docs/ssot/RAIMOV_LEGAL_GATES.md` — Gate 1.3 answered + Gate 1.3A execution blocker + Gate 1.5.
4. `docs/legal/raimov/clearances/BALAM_KG_LICENSING_COUNSEL_2026-08-13.md` — зафиксированный ответ юриста.
5. `docs/ssot/RAIMOV_MODEL_EXPANSION.md` — feeder/B2B/franchise rationale.
6. `research/raimov-profile/evidence/excerpts/expertdental-doctor-cards.md` — evidence по текущей карточке Чолпон; не повышать claims без clinic confirmation.

## Current decision boundary

### GO now
- one-page private presentation website;
- pediatric competitor research;
- current Expert Dental pediatric cohort measurement design;
- team/role model around Чолпон as initial clinical anchor;
- service/capacity/economics hypotheses;
- brand assets and presentation copy.

### HOLD until Atabek approval
- public patient acquisition;
- public `balamdental.com` activation;
- local `.kg` / `.kz` / `.uz` registration or activation as if approved;
- real clinic hiring/offers, leases, capex and new-entity contracts;
- claims that BALAM is already operating;
- medical-director title or enhanced credentials not clinic-confirmed.

Trademark search / registrability check is allowed pre-GO; trademark filings wait until post-GO founder/legal decision.

### HOLD until licensing/legal/operational gates
Even after Atabek GO, clinic launch waits for Gate 1.3A (actual licence/extension + address/services + СЭЗ + staffing/equipment) and applicable Gate 1.5 plus consents, data/CRM, capacity and clinical ownership.

## One-page content boundary

The current presentation page should contain only what helps Atabek make the decision:
- brand hero;
- why children first;
- ecosystem/lifecycle logic;
- conceptual patient journey;
- team around Cholpon;
- post-GO licensing/implementation sequence;
- decision CTA.

Do not expand now into prices, booking, service catalog, blog, maps, reviews, cases, SEO or patient CRM.

## Preview root

`site-raimovdental/balam-preview/` holds the one-page Atabek presentation (TASK-816).

Build publishes it to `site-raimovdental/dist/ru/balam/` → live `https://raimovdental.com/ru/balam/` behind the existing password gate (`0726`, no username) with `noindex`. No booking/lead forms/prices.

## Promotion after approval

Do not create a separate runtime project before Atabek GO.

After GO, default Phase B is **BALAM as a branded pediatric direction inside the existing Expert Dental contour**, not a separate clinic entity by default and not a claim that the current Expert Dental licence already covers pediatric scope.

Before executing Phase B under the existing licensee, collect the exact Expert Dental licence/applications, confirm Cholpon credentials and obtain narrow counsel clearance on use of the separate BALAM brand by the existing licensee.

Separate clinic / new entity / formal branch promotion requires a dedicated architecture DEC, legal structure/licensing path, Gate 1.3A execution closure and only then `balam` runtime + `site-balam/` + approved `balamdental.com` deployment.
