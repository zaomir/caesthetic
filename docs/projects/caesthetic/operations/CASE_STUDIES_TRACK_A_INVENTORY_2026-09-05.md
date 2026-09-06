---
owner: CAESTHETIC
status: blocked
created: 2026-09-05
scope: Track A inventory for https://caesthetic.com/case-studies/
parent: docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md
prod_sha_at_inventory: ef9fbf5e5
main_at_record: e56d2d2de
---

# Case studies Track A inventory — 2026-09-05

Operator pass against `docs/ssot/CAESTHETIC_CASE_STUDIES_COLLECTION.md`. No Track A was published. Modeled rows were not relabeled. Track B was not unpublished (that step runs only after ≥1 permissioned Track A is live).

Public catalog snapshot: `GET https://caesthetic.com/case-studies/intake/api/public-cases` at 2026-09-05T19:34:34.535Z — **33 cases, all `evidenceLevel=modeled`, `attribution=not_claimed`, `clientName=Anonymized practice`**. Catalog HTML remains `noindex`.

## Track A result

| slug | track | source report | permission | evidenceLevel | public URL | prod SHA |
|---|---|---|---|---|---|---|
| — | — | none eligible | none on file | — | none | `ef9fbf5e5` (catalog unchanged) |

**Empty set.** A modeled catalog is worse than an empty verified catalog, and a relabeled modeled catalog is forbidden. Until a permissioned Track A exists, the 33 Modeled cards stay on the shelf with the Modeled label visible.

## Public Track B shelf (do not upgrade)

None of these slugs is the same legal practice as a real report. They remain Track B.

`london-harley-whatsapp-consult`, `raleigh-cary-consult-routing`, `greenville-physician-portal-path`, `charlotte-cliff-cameron-paid-consult-form`, `scottsdale-san-salvador-treatment-or-consult`, `scottsdale-north-card-hold-booking`, `paradise-valley-consult-credit-path`, `charlotte-cumberland-physician-consult`, `charlotte-pineville-form-sla`, `tampa-dale-mabry-portal-membership`, `austin-bee-caves-two-office-path`, `greenville-woods-crossing-consult-first`, `charleston-multi-location-next-step`, `addison-derm-phone-hours-path`, `atlanta-four-office-derm-routing`, `dallas-coit-derm-contact-split`, `denver-derm-consult-path`, `nashville-restorative-dental-request`, `austin-westlake-dental-consult`, `charlotte-southpark-dental-handoff`, `london-manchester-academy-sites`, `london-paris-dual-city-handoff`, `paris-iena-consult-or-phone`, `manchester-paris-waitlist-whatsapp`, `naples-consult-call-path`, `houston-medspa-portal-split`, `nashville-midtown-call-or-request`, `london-harley-dental-consult`, `dallas-preston-derm-transparency-path`, `charlotte-randolph-consult-wait`, `scottsdale-mescal-phone-text-path`, `scottsdale-hayden-consult-split`, `miami-concierge-medspa-consult-path`.

`miami-concierge-medspa-consult-path` is a Downtown Miami modeled pattern study. It is not Spoken Med Spa (Snellville, GA) and is not a random Miami GBP. Do not match by niche/city.

## Real reports reviewed

| Practice | Vertical | Report | Kind / state | Sprint / Day-30 | Permission | Catalog decision |
|---|---|---|---|---|---|---|
| Spoken Med Spa, Snellville GA | aesthetic_practice | `site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/report.json` (+ `-rus`); audit `docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/` | `reportKind=real`, `reportState=approved_report`, preparedFor Ivy Cleveland | none | **missing** — no email/signature covering name vs city-type vs anonymization, numbers, quotes, or linking the Score as a case study | Skip Track A. A2 candidate only after written owner permission. Score route is `noindex` / not a public linked audit. |
| Aesthetemed Beauty & Wellness Clinic, Hallandale Beach FL | aesthetic (public-evidence test) | `site-caesthetic/score/aesthetemed-public-evidence-7c3e91b4a8f26d50/report.json` | real / approved_report; disclosure: “no client relationship is implied” | none | n/a — not a client | Skip. Not Track A. |
| Prestige, Las Americas / Tenerife | beauty_salon | `site-caesthetic/score/prestige-ru-pilot-520-20260901-c6d8e2/report.json` | real / approved_report; managerial pilot, not a client report | none | n/a | Skip. Beauty-salon-as-category is excluded from this catalog. |
| «Ноги в Руки» / Nohy v Ruky, Odesa | beauty salon network | `site-caesthetic/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/report.json` | real / approved_report | none | Gate B in `docs/projects/caesthetic/clients/nogi-v-ruki/public-page/PUBLICATION_GATE.md` is unchecked | Skip. Excluded from `/case-studies/`. |
| demo-* / synthetic publish-control-plane | n/a | `site-caesthetic/score/demo-*` | `reportKind=demo` | n/a | n/a | Skip. Synthetic. |

No other `reportKind=real` + `approved_report` files exist under `site-caesthetic/score/` or `docs/audits/caesthetic/growth-score/cases/` (non-demo). `docs/projects/caesthetic/clients/` contains only `nogi-v-ruki`. No Sprint / Day-30 / Growth Ledger evidence packs with CRM/GA4/GBP-history source files were found for an aesthetic or dental practice.

## Spoken A2 note (blocked; do not publish)

If written permission arrives from the owner, Spoken is an A2 diagnosis case only (CAESTHETIC work = the Score). Approved Class A observed facts in the EN report include `treatment_clarity`, `above_fold_conversion`, `clinician_trust_proof`, `rating` (4.9 / ~250 reviews on Maps, 2026-09-04), `negative_review_handling`, `positioning_coherence`, `proof_continuity`. Headline must be a diagnosis, not a win. Forbidden on A2: modeled conversion lift, Sprint impact, paid-traffic claims. Named publication vs city-type vs full anonymization is the owner’s written choice. The live Score at `https://caesthetic.com/score/spoken-medspa-snellville-9d7f3a5c2e184b61/` is HTTP 200 with `X-Robots-Tag: noindex` — not a public linked audit until redaction + case-study permission are verified.

## What is still missing (exact artifacts)

| Practice | Missing artifact |
|---|---|
| Spoken Med Spa | Written publication permission (email or signature) for case-study use of name/numbers/quotes/linked Score. No Day-30 pack (A1 not available). |
| Aesthetemed | Client relationship (explicitly not implied). |
| Prestige Tenerife | Wrong vertical (`beauty_salon`); not a client report. |
| Nogi v Ruki | Excluded vertical for this catalog; Gate B permission unchecked. |
| All 33 public slugs | Same-practice real report + permission (none match). |
| Any US/UK/Paris aesthetic or dental delivery client | 30-Day Sprint / Growth System Day-30 evidence pack (baseline window, after window, denominator, source system, limitations, role). |

Resume: when a permission file exists, fill `docs/caesthetic/case_study_intake_template.md`, publish via Case Intake `mode=publish` at `caseIntakeOrigin` (`https://caesthetic-case-intake.webtra.chatgpt.site`), register cover, then unpublish remaining Track B.
