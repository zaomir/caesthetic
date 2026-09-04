---
title: RAIM SMILE — partnership page strategy v3
status: CANONICAL_ROUTE_SPEC / PUBLIC_NOINDEX_ROUTE_ACTIVE / NAMED_PARTNER_PROGRAMS_GATED
version: 3.0
created: 2026-09-03
last_updated: 2026-09-03
owner: RAIM SMILE partnerships + CAESTHETIC
decision: docs/founder-notes/DEC-865_raim-smile-clinic-funded-premium-tier-programs.md
master_strategy: docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
program_matrix: docs/raimov/partnerships/RAIM_SMILE_PARTNER_PROGRAM_MATRIX.md
target_route: https://raimsmile.com/partners/
supersedes: docs/raimov/partnerships/RAIM_SMILE_PARTNERSHIP_PAGE_STRATEGY.md
---

# RAIM SMILE — каноническая стратегия `/partners/` v3

## 0. Current state

The generic `/partners/` page is active on `raimsmile.com` with `noindex,nofollow,noarchive,nosnippet`. It is a B2B explanation and pilot-request surface, not proof that any named organisation is an active partner.

The page uses the current clinic-confirmed public name `RAIM SMILE · SmileCare 12`. Expanded Essential/Perio/Kids & Teens/Family Account, a named partner launch and phone-key runtime remain separately gated.

## 1. Primary offer

The first read now leads with the tangible partner benefit:

> **A premium dental privilege funded by the clinic:** SmileCare 12 for an eligible participant, one-window Dental Concierge and different family conditions by Premium tier.

The baseline clinic-funded quota costs the partner zero. It is capped and consumed only after voluntary activation, eligibility confirmation, clinical qualification and capacity confirmation.

Primary CTA: **Запросить проект 60-дневного пилота**.

## 2. Authoritative page order

1. hero: clinic-funded privilege, SmileCare 12, Dental Concierge and 60-day pilot;
2. clear explanation that the partner does not pay for baseline memberships or transfer a client list;
3. current SmileCare 12 benefit boundary;
4. Premium tier matrix:
   - Premium Individual;
   - Private / Infinite;
   - Top Tier / World Elite;
5. program selector by partner type;
6. coordinator languages and 10-minute first-response target with staffing boundary;
7. one-window primary/alternative operator rule;
8. partner workload and data boundary;
9. 60-day capped pilot;
10. aggregate reporting now, live dashboard later;
11. public-vs-contract-only disclosures;
12. short partner request form.

This order supersedes the v2 rule that kept SmileCare 12 as an optional module below the first read.

## 3. Programs shown publicly

- Private Banking / Premium Cards;
- Executive & Employee programs for large, foreign and approved public-sector organisations;
- Resident & Family programs for developers/property managers;
- Premium Club / fitness programs;
- International Family programs through parent-facing channels;
- Guest Dental Concierge for hotels/expat channels;
- Executive Member programs for business clubs/chambers.

The page does not display names/logos of pipeline targets or imply an agreement with a bank before signed brand approval.

## 4. Premium differentiation

The page may disclose the default negotiation matrix:

- **Premium Individual:** one primary holder;
- **Private / Infinite:** holder plus one selected dependent within quota;
- **Top Tier / World Elite:** holder, one additional adult and up to two children within family allocation.

Exact tier names, age rules, substitutions, free places and total quota are contract-only fields. The matrix does not activate expanded SmileCare 12 plans or create an unlimited family entitlement.

## 5. Funding message

Public wording:

- baseline SmileCare 12 gift inventory is funded by the clinic;
- partner price for that bounded quota is zero;
- no whole-audience reservation occurs;
- paid extensions or special service lines require a separate agreement.

Internal 30% CAESTHETIC economics are not public page copy. For a pure gift with no actual membership settlement, the 30% revenue basis is zero. A fixed pilot/activation fee or Coordination Fee requires a separately signed schedule.

## 6. Concierge and operator truth

The page may state that Gulbara speaks Russian, Kyrgyz, English and French.

A 10-minute target means first human organisational response during covered pilot shifts. `24/7` may describe only non-clinical coordination and only after primary/backup staffing, escalation and measurement are operational.

Expert Dental Studio is the current primary medical operator in Bishkek. If it lacks capacity or a required specialist, the coordinator may arrange a prequalified alternative and stay responsible for organisational follow-up. SmileCare 12 benefits do not transfer automatically; the alternative clinic normally uses its own agreement and price list.

## 7. Partner workload and privacy

The partner provides recurring distribution, an accountable owner and a lawful eligibility method. It does not transfer a client list or medical information.

The public request form collects only business contact information and must not accept patient lists, diagnosis, imaging or medical narratives.

## 8. Reporting and dashboard

The first pilot uses a short aggregate report: reach estimate, activations, coordinator contacts, arranged appointments, attendance, measured response time, complaints/opt-outs and remaining quota.

A live dashboard is explicitly deferred until pilot evidence proves which metrics are useful. It must never expose individual medical data or use treatment revenue as coordinator quality.

## 9. Release and smoke contract

Every runtime change to `/partners/` must pass:

- content depth and forbidden-claim tests;
- responsive/accessibility project gates;
- source marker checks for clinic-funded gift, Premium tiers and dashboard-later boundary;
- rollback-safe deploy;
- origin and public-edge HTTP 200;
- marker verification on the deployed `/partners/` response;
- noindex/private-cache headers for the current protected public phase;
- legacy-route smoke for the wider RAIM SMILE surface.

Named partner programs, direct coordinator access and partner-specific routes require their own signed charter, capacity, legal/privacy, staffing and rollback evidence.
