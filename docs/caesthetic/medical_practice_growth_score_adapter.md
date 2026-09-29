---
owner: CAESTHETIC
status: active_adapter_pending_coordinated_release
version: 1.0
updated: 2026-09-03
vertical_context: medical_practice
parent: docs/caesthetic/growth_score_spec.md
decision: docs/founder-notes/DEC-867_medical-practice-growth-score-vertical.md
related:
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
---

# CAESTHETIC Growth Score — `medical_practice` adapter

This adapter specializes the existing Growth Score metric catalogue for licensed outpatient medical practices. It does not add metrics, surfaces, scores, weights or a separate product.

## 1. Eligibility

Use `medical_practice` only when the resolved business is a medical practice/provider and a meaningful public patient-choice journey is observable across Search / GBP, Website, Social and Reputation / Reviews.

ENT / otolaryngology is the first supported specialty context. Specialty labels remain case context; they are not new `vertical_context` values.

If entity identity, practice status or the public decision journey cannot be resolved, use the normal clarification / `not_applicable` / `insufficient_evidence` path rather than forcing eligibility.

## 2. Four Surfaces

Exactly four surfaces remain canonical:

1. Search / Google Business Profile
2. Website
3. Social
4. Reputation / Reviews

Cross-Surface Consistency remains separate. Lead Intake is a boundary. Lead-to-Revenue and Paid Ads are not additional surfaces.

## 3. Metric interpretation

The canonical metric IDs and weights are unchanged.

### Search / GBP

Interpret priority-treatment/service coverage using the actual specialty and patient task. For ENT this may include, when publicly offered, same-day ENT evaluation, sinus/nasal care, ear/hearing care, allergy, sleep, pediatric ENT, diagnostics and office procedures.

`map_visibility` still requires the canonical reproducible geo-grid method for scoring. Manual map checks may support reconnaissance/entity evidence but do not substitute for the geo-grid score.

`entity_integrity` must distinguish the medical practice, parent/partner practice, location, suite/unit and any duplicate/rebrand/move entities. Co-location alone does not prove that two profiles should be merged.

### Website

`treatment_clarity` evaluates whether a patient can understand the relevant condition/service pathway, clinician context and next step without turning marketing copy into a clinical recommendation.

`booking_friction` and `technical_booking_integrity` observe the public path only up to non-submission in standard Free Growth Score research.

### Social

`clinician_expertise` requires attributable real-clinician evidence where observable. Generic health education or brand copy is not automatically clinician proof.

Treatment/procedure content is assessed for decision support and continuity, not clinical superiority.

### Reputation / Reviews

Use disclosed, comparable windows and samples. Review claims remain reviewer-reported experiences unless independently observed. A repeated theme requires the recurrence rule in the competitive authority.

Do not infer quality of clinical care from star rating alone.

### Cross-Surface Consistency

Compare identity, location, priority service, positioning, proof and next-step continuity across the same four surfaces. A technically working transition can still have context friction; missing optional links are not automatically defects.

## 4. Public research boundary

Allowed public evidence includes public Maps/GBP/SERP/directories, website pages, public booking navigation without submission, public social, public reviews/responses, date-stamped performance measurements and comparable public competitor surfaces.

Free Growth Score must not request or use PHI, patient records, EHR/CRM access, private call/message transcripts or internal conversion data as public evidence.

Internal causes such as reception performance, CRM defects, staffing or training remain `Not assessed` / `Insufficient evidence` without the required authorized evidence.

## 5. Competitive Decision Analysis

Select 3–5 material alternatives according to the global standard. For multi-location practices, use branch-specific local alternatives where geography materially changes patient choice.

For medical practices, visible adoption of a device, drug, procedure or protocol is only a market-practice signal. Marketing analysis may identify a patient-decision gap but cannot declare clinical superiority, obsolescence, safety or efficacy without qualified review and appropriate evidence.

The decision layer remains:

- Defend
- Close
- Differentiate
- Do not copy

No competitor score is created.

## 6. ENT initial specialty context

For ENT cases, useful research intent families may include brand/local discovery and publicly offered service intents such as ENT specialist, same-day ENT, sinus/nasal symptoms, chronic sinus evaluation, ear/hearing, allergy, sleep or other manager-approved priority services.

These are research-query families, not promises that every ENT practice provides every service. The Research Alignment Card freezes the actual service/query scope before full research.

## 7. Claim boundary

Use evidence-first language:

- verified public mismatch / friction / break;
- patient-decision risk;
- probable constraint when evidence supports it;
- `Insufficient evidence` when it does not.

Do not state that a public friction “lost X patients”, “cost $Y”, caused revenue decline or proves internal operational failure without the separate evidence required by `EVIDENCE_AND_IMPACT_STANDARD.md`.

## 8. Release condition

This adapter becomes production-active only when DEC-867's coordinated release gate is complete in current `main`. Until then it documents the approved specialization but does not override a conflicting runtime or higher-authority vertical enum.