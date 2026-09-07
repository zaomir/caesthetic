# RAIMOV ECOSYSTEM PROJECT STATUS

**Date:** 2026-09-05  
**Status:** STAGE_B_PUBLIC_LIVE / EXPERT_DENTAL_PATIENT_CONVERSION_CONTINUITY_IMPLEMENTATION_OWNER_APPROVED / RAIM_SMILE_MASTER_BUSINESS_CONTENT_V2 / RAIM_SMILE_CURRENT_OPERATOR_EXPERT_DENTAL / OPERATOR_PORTABILITY_ACCEPTED / PARTNERSHIP_NETWORK_OWNER_APPROVED_PILOT_GATED / PARTNERSHIP_PAGE_PROTECTED_SOURCE_PREVIEW_NOT_DEPLOYED / SMILECARE12_CURRENT_BINDING_PUBLIC_NAMING_LIVE_EXPANDED_V2_GATED / QUALIFIED_MARKETPLACE_DESIGNED_NOT_ACTIVE / SECOND_OPINION_DESIGNED_NOT_ACTIVE / COORDINATOR_STANDARD_DESIGNED_NOT_ACTIVE / RAIM_SMILE_INTAKE_PREIMPLEMENTATION / OPERATIONAL_PILOT_NOT_STARTED
**Current operating business:** Expert Dental Studio, Bishkek  
**Master brand:** RAIMOV DENTAL  
**Public site:** Stage B at `/ru/`; Access & Continuity at `/ru/access-continuity/`; Stage A protected at `/stage-a/`

## Naming update — 2026-09-07

Owner decision `DEC-RAIM-SMILE-YEAR-OF-CARE-20260907`: public display name =
**RAIM SMILE · Год заботы**; internal/legacy = `SmileCare 12 / care12`.
Current routes, prices, benefits, technical identifiers, economics and VIP mechanics preserved.
Release: PR #1549 merged; deployed SHA `9e0cb3cfd1bcc63b9e55e3d199e40911c49a5941`; workflow 34071859482 SUCCESS; production smoke PASS.
Evidence: `docs/audits/raimov/releases/year-of-care/RELEASE.md`.
The existing operational and future-product statuses below are not changed by this naming release.

## Главный вывод

Owner approved the post-competitive-audit **Expert Dental Patient Conversion & Continuity Implementation** as the active implementation strategy. Canon: `docs/ssot/EXPERT_DENTAL_PATIENT_CONVERSION_CONTINUITY_IMPLEMENTATION.md`. It converts the audit into one clinic-wide program across Public Truth, office journey, administrators, clinicians/internal referrals, Treatment Coordinator, document flow, infrastructure/SQNS/telephony, sites/social, reputation/continuity and paid-demand gates. It also establishes a separate IT-architect RACI: system architecture, SQNS/telephony/guidebook/e-sign technical layer, data/PHI boundaries, event architecture, vendor verification, observability, release/smoke/rollback and technical acceptance. This is docs/control-plane adoption only: no runtime, product activation, public claim, e-sign go-live or paid-media launch is implied.

The canonical implementation order is now: `P0 Public Truth → baseline/SQNS discipline → admin adoption → warm handoff/treatment-plan continuity → IT voice/SQNS E2E proof → coordinator bounded pilot → one complex route → one recovery loop → cohort measurement → limited paid/partner demand → scale/observe/stop`.

RAIMOV DENTAL now publicly explains its first applied system module: **Access & Continuity System**.

The module connects:

`обращение → триаж → срочная помощь → Паспорт V0 → записанный чек-ап → Паспорт V1 → диагностика → комплексный план → лечение → профилактика`

DEC-786 adds the clinic retention canon: **Expert Dental Patient Motivation System** (Continuity + SmileCare 12 + Expert Points). DEC-800 approves current benefit information, confirmed prices and WhatsApp inquiry; DEC-861 approves the public name and route cutover. Checkout, automatic activation, expanded v2 and Expert Points remain operationally deferred.

DEC-787 adds **Post-Visit Feedback Loop** inside Layer A: WhatsApp/CSAT 1–5 after eligible visits → 4–5: `/write` then `/maps` / 1–3: private recovery + manager alert. Entry `/feedback/` always opens stars. No review rewards.

The website is live, but the clinical operational pilot is not launched by this release. It still requires Atabek/clinic approval of triage, the exact free-check-up composition, capacity, staff responsibilities, medical/data consents and cohort economics.

DEC-856 adds a separate RAIM SMILE adult patient-acquisition contour. Owner-confirmed bindings: Expert Dental Studio is the **current** medical operator in Bishkek; dedicated phone/WhatsApp is `+996 500 700 200`; a 90-day anonymised economics export is possible. Intake remains `PREIMPLEMENTATION`: number activation/inbox access, CRM write, duty coverage, privacy/counsel wording, capacity and the actual economics export are not yet verified.

DEC-858 keeps RAIM SMILE permanently tied to the Raimov clinical school/methodology as a brand protocol and not a promise of personal treatment by Atabek. It designs Second Opinion as the first wedge and a Treatment Coordinator standard with clinical questions returned to doctors and no incentive from medical revenue.

DEC-859 clarifies the commercial architecture: Expert Dental is current, not permanent or automatically exclusive. RAIM SMILE may replace the operator, add operators or later operate a qualified lead marketplace. Highest commercial bid may decide only among operators that already passed licence, program, quality, capacity, privacy, contract and patient-consent gates. Medical data is excluded from bid rounds. Marketplace remains `DESIGNED_NOT_ACTIVE` pending counsel and implementation.

The RAIM SMILE Partnership Network is now integrated into the master strategy as a first-class acquisition and product layer. It creates co-branded privileges instead of flyer swaps: Private Dental Concierge, structured products, multilingual coordination, partner-specific attribution and measurable distribution contracts. Gulbara is the first named Partner & VIP Coordinator in Bishkek; her role is non-clinical and public 24/7 medical-care claims remain forbidden without staffing/capacity/clinical gates.

**RAIM SMILE · SmileCare 12** is the owner-approved public name for the current Expert Dental Adult / Additional Adult / Kids binding. Prices, benefits and SKU IDs remain unchanged. Expanded Essential/Perio/Kids & Teens/Family Account, trademark counsel, clinic/fiscal, capacity, contract, ledger and pilot gates remain open.

The generic `/partners/` representative source is implemented in authoritative `grainee-v2` at `site-raimovdental/raim-smile-partners-preview/`. It is Basic Auth/noindex/no-store, outside the production `raimsmile.com` deploy source and not live. It covers Private Banking, Premium Club and Resident Community, uses a non-submitting business-only form, and creates no partner-specific routes, CRM record or public claim.

## Live surfaces

- `https://raimovdental.com/ru/`
- `https://raimovdental.com/ru/access-continuity/`
- `https://raimovdental.com/stage-a/` — Basic Auth, noindex/no-store
- `https://clinic.raimovdental.com/services/smilecare-12/` — noindex patient-site information / inquiry under owner-approved name; legacy `/services/care-12/` redirects

## Production evidence

- Feature PR: `#578`
- Feature merge: `ef1b9b49f03ca9b471a79f5b9f25d952c90375fb`
- Cutover smoke fix PR: `#588`
- Production source SHA: `cb65d499ca886efe14329ef33855302dbebb153d`
- Successful deployment run: `30674593146`
- Backup: `/root/raimovdental-cutover-backups/20260801T000521Z`
- Evidence: `docs/audits/raimov/releases/access-continuity/PRODUCTION_DEPLOY_2026-08-01.md`

## Live acceptance

- `/ru/` → `200` and contains the Access & Continuity teaser;
- `/ru/access-continuity/` → `200`;
- sitemap contains the new route;
- public pages remain indexable and do not require authentication;
- `/stage-a/` without auth → `401`;
- wrong Stage A password → `401`;
- current valid Stage A credentials → `200`;
- Stage A noindex/no-store preserved.

## Accepted strategy

- `EXPERT_DENTAL_PATIENT_CONVERSION_CONTINUITY_IMPLEMENTATION.md` is the owner-approved implementation SSOT for post-audit zone ownership, 90-day sequencing, adoption/impact criteria and IT-architect RACI; it specializes but does not replace the broader Expert Dental / RAIMOV / ELITE strategy.
- `RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md` v2.0 is the single master for RAIM SMILE business, products, partnerships and `raimsmile.com` content architecture; partnership/operator/product docs are subordinate contracts by scope.
- The domain content strategy defines patient-first audience priority, B2B `/partners/`, route-level JTBD/proof/CTA/operator disclosure/media/conversion, selective future indexing, protected `/system/`, noindex partner-specific routes, cross-channel pillars, production gates and owner dashboards.
- DEC-774 defines Access & Continuity as the first applied RAIM SMILE SYSTEM module.
- It is a service line/pilot inside Expert Dental Studio, not a separate cheap clinic.
- Free triage/routing and paid diagnostics/treatment are explicitly separated.
- The main conversion KPI is a pre-booked next check-up, not certificate count.
- Passport V0/V1 and warm specialist handoff provide continuity.
- One hundred urgent cases prove the process, not a new-location investment case.
- SmileCare 12 current-binding information/inquiry and public name are approved; checkout, automatic activation, expanded plans and capacity require later gates.
- Pre-filtering only “happy” patients before the ask, and incentives tied to review tone, are prohibited.
- DEC-787 allows post-CSAT follow-up routing after a universal ask.
- DEC-786 defines Patient Motivation System: Continuity foundation + gated SmileCare 12 operations + Expert Points (no review rewards).
- DEC-856 defines RAIM SMILE as a brand/acquisition layer, not a clinic.
- DEC-858 defines RAIM SMILE as the permanent Raimov-school brand protocol; no personal Atabek-treatment promise.
- DEC-859 defines Expert Dental as current operator, operator replacement and qualified multi-operator modes.
- Partnership Network is a RAIM SMILE asset, not an Expert Dental-owned distribution list.
- Partnership means a measurable co-branded benefit with recurring access, eligibility, source attribution, obligations and stop rules.
- Gulbara is a dedicated personal coordinator for approved member/VIP flows, not a doctor or general public hotline.
- DEC-862 makes CAESTHETIC the separate Partnership Network Operator and employer/compensation owner for the coordinator; exact legal employer/payroll remains counsel/document gated.
- Approved partner/VIP SmileCare 12 economics are 30% of actually collected/non-refunded membership revenue to CAESTHETIC plus 100% of a separate Coordination Fee, preferably B2B partner-funded. Separately, CAESTHETIC medical/dental Attributed Sales Performance Fee is activatable through an ordinary signed Commercial Schedule and verified attribution without special industry activation gates; coordinator and clinician medical-sales percentages remain 0%.
- Future VIP access uses phone as an eligibility key, not a password, with no first-step OTP; active match exposes only Call/WhatsApp coordinator, while neutral mismatch/HMAC/rate-limit/audit/expiry controls remain runtime-gated.
- `DESIGNATED_OPERATOR` is current mode; `QUALIFIED_ROTATION` and `QUALIFIED_LEAD_MARKETPLACE` are future gated modes.
- Highest bid is a commercial tie/final criterion only inside an eligible pool, never a licence/quality criterion.
- A patient must be told the selected medical operator and must have the required transfer choice/consent.
- Contact is disclosed only to the selected operator; PHI/medical packet is never broadcast to bidders or stored in partner CRM.
- Second Opinion is the first approved wedge strategy; exact price/credit terms, clinical packet/deliverable, SLA and remote KZ path remain gated.
- Treatment Coordinator owns organisational/financial continuity only; medical objections return to the clinician and pay is not tied to medical revenue.
- RAIM SMILE dedicated number is `+996 500 700 200`, but operational activation and CRM readback remain unverified.
- Case-level 90-day economics export is feasible according to the owner; source/access details and anonymised data are still missing.
- Platform and PartnershipContribution are separate from operator CaseContribution; no live marketplace or signed partner channel currently produces these economics.

## Completed

- Owner-approved `EXPERT_DENTAL_PATIENT_CONVERSION_CONTINUITY_IMPLEMENTATION.md` created and registered in the raimovdental manifest; docs/control-plane only, no runtime activation.
- RAIM SMILE master business + content strategy v2.0 and authority/drift map; no runtime, public copy, indexation, form or deploy change.
- Public Stage B RU-only strategic platform.
- Protected Stage A presentation.
- DEC-774 and `RAIMOV_ACCESS_CONTINUITY_SYSTEM.md`.
- DEC-786 and `EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md`.
- DEC-787 Post-Visit Feedback Loop + ops SOP `reputation/POST_VISIT_FEEDBACK_LOOP.md`.
- DEC-858, `RAIM_SMILE_SECOND_OPINION_PRODUCT.md` and `RAIM_SMILE_TREATMENT_COORDINATOR_STANDARD.md` as docs/control-plane contracts.
- DEC-859, operator network SSOT, multi-operator routing contract, operator registry standard and focused legal-gate brief as docs/control-plane architecture.
- RAIM SMILE Partnership Network SSOT, reusable packages, Gulbara role boundary and Bishkek partner pipeline as owner-approved docs/control-plane architecture.
- DEC-862, CAESTHETIC partnership economics contract and phone-key VIP access/UX contract as owner-approved docs/control-plane architecture; no runtime route, fee settlement or partner cohort activated.
- DEC-861 owner-approved SmileCare 12 current-binding naming/route migration recorded without price or benefit expansion.
- Protected `/partners/` representative source, responsive visual system, Basic Auth/no-store server and business-only non-submitting form in authoritative `grainee-v2`; production and live surfaces unchanged.
- DEC-800 current benefit publication boundary and three confirmed public SKU prices; DEC-861 public naming cutover.
- Public home teaser and dedicated strategy route.
- Deterministic build, robots and sitemap integration.
- Contract tests plus Playwright/Axe responsive gate.
- Rollback-safe production deploy and Cloudflare smoke PASS for the existing live surfaces.

## Next operational milestone

### Expert Dental Patient Conversion & Continuity

1. Close P0 Public Truth and establish the Public Truth Register.
2. Establish baseline + minimum SQNS source/outcome/next-action discipline without inventing conversion problems before evidence.
3. Move existing admin guidebook/scripts from `Shipped` to supervised `Adopted`.
4. Implement warm handoff and treatment-plan continuity in clinic operations.
5. IT architect proves the ordinary voice/SQNS end-to-end path and event/data boundaries with no second CRM and no PHI in the guidebook layer.
6. Run a bounded Treatment Coordinator pilot with primary/backup/clinical escalation owner.
7. Prove one complex route end-to-end.
8. Adopt one recovery loop.
9. Measure the cohort.
10. Only then run limited paid/partner demand and make `scale / continue observing / stop` decision.

### Existing clinic/system

11. Atabek approves triage and clinical boundaries.
12. Clinic fixes the exact composition and real standard price of the free check-up.
13. Urgent slots, duty schedule and capacity are confirmed.
14. Marketing CRM and medical-system data boundaries are implemented.
15. Passport V0/V1, certificate and consent templates are approved.
16. Pilot starts inside Expert Dental Studio.
17. Cohorts are measured for 30/60/90 days.

### RAIM SMILE current-operator product

18. Clinic/medical owner confirms Second Opinion exact scope, price/credit rule, secure upload, clinician roster and SLA.
19. Clinic names coordinator/backup/escalation owners and validates ten synthetic no-PHI cases.
20. Number/WhatsApp/CRM path passes end-to-end non-patient test.
21. Counsel/privacy clears KG public wording for RAIM SMILE and Expert Dental current-operator disclosure.

### Partnership Network / SmileCare 12

22. Obtain trademark counsel clearance for KG/KZ; owner GO is recorded in DEC-861.
23. Approve expanded-v2 operator-specific SKU/prices, fiscal treatment, contracts, ledger and capacity before activation.
24. Confirm Gulbara covered hours, backup and escalation; keep public wording at “dedicated personal coordinator” until proven.
25. Qualify Crocus Fitness, AmCham, BAKAI Premium, Elite House/resident operator and BIS/QSI by recurring distribution, eligibility, attribution, exclusivity and operational/legal simplicity.
26. Sign only pilots with measurable audience access, benefit rules, operator capacity, privacy, review date and stop rule.
27. Run 30–60 day partner cohorts and keep/change/stop based on activation, booked/showed, benefit utilisation, satisfaction, renewal signal and PartnershipContribution.
28. Before any `/partners/` deploy, approve exact controller/processors/retention, counsel wording, form delivery/read-back, review owner/SLA, Gulbara coverage/backup and a protected staging route.
29. Obtain legal/fiscal/labour counsel and signed schedules for the 30% membership fee, 100% Coordination Fee, exact employing/invoicing entities, refund rules and max-use economics.
30. Before any VIP access implementation, approve registry authority/expiry/revocation, HMAC secret rotation, rate limits/anti-enumeration, privacy audit retention, coordinator staffing/backup/SLA, staging and rollback.

### Operator portability / marketplace

31. Counsel answers CPL/referral/bidding/fee-splitting, ranking disclosure, data-controller and tax questions.
32. Operator agreement, Commercial Schedule, DPA, invalid-lead and dispute templates are approved.
33. Expert Dental is entered into the full operator registry evidence standard.
34. A second operator is due-diligenced before any multi-operator pilot.
35. Shadow routing proves anonymous lead envelope, no-PHI bidding, patient choice/consent and audit trail.
36. Owner approves a limited fixed-fee/rotation pilot before dynamic bidding.
37. Dynamic highest-qualified-bid starts only after separate GO and legal/privacy acceptance.

## Deferred / blocked

- Paid demand scale before the Patient Conversion & Continuity gates and cohort evidence.
- Patient emergency-booking funnel before operational readiness.
- Separate urgent-care clinic/card/profile.
- 24/7 in-person or medical-care claims.
- any 24/7 wording until staffing/backup/SLA; later wording remains non-clinical coordination only.
- VIP phone-key runtime, registry and CTA before security/privacy/staffing/release gates.
- SmileCare 12 checkout and automatic activation.
- Expanded-v2 or cross-operator SmileCare 12 activation before complete clinical/fiscal/capacity/ledger/pilot gates.
- Complimentary or partner-funded SmileCare 12 cohorts before capacity/fiscal/economics approval.
- Named partner claims or public Concierge SLA before signed activation.
- Any staging or production deployment of the source-only `/partners/` preview before an approved protected runtime and form/legal/privacy gates.
- Expert Points operational ledger.
- Stage C cases/service pages and EN site.
- Public Second Opinion CTA, payment/credit claim or remote Kazakhstan intake before its activation gates.
- Any promise that Atabek personally reviews or treats every RAIM SMILE case.
- Live multi-operator bidding, per-lead invoicing or operator replacement before legal, registry, contract, consent and transition gates.
- Any broadcast of patient contact or medical data to multiple clinics.
- Any claim that the highest bidder is the medically best operator.
