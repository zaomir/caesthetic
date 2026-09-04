# RAIM SMILE — profitability input contract

**Status:** export possible / source access not yet identified  
**Date:** 2026-08-29  
**Decision:** DEC-856 · DEC-859

## Purpose

Нельзя выбирать «самые прибыльные услуги», оператора или bid strategy по прайсу или headline CPL. Этот контракт задаёт два раздельных расчёта:

1. `CaseContribution` медицинского оператора;
2. `PlatformContribution` RAIM SMILE acquisition/routing layer.

Смешивать их в одну маржу запрещено.

## A. One row per treatment case — operator economics

Required fields:

| Field | Meaning |
|---|---|
| case_id | обезличенный ID |
| operator_id | medical operator, current default `expert_dental_studio` |
| market_country / market_city | рынок и локация |
| program_candidate | second_opinion / full_mouth / functional_aesthetics / adult_bite_tmj / other |
| treatment_start_date | дата начала |
| treatment_status | active / completed / paused / refunded |
| collected_revenue_kgs | реально полученные деньги |
| invoiced_or_plan_value_kgs | стоимость утверждённого плана |
| lab_cost_kgs | лабораторные затраты |
| implant_material_cost_kgs | импланты/материалы/компоненты |
| other_direct_material_cost_kgs | прочие прямые материалы |
| variable_doctor_comp_kgs | переменная оплата врачей по случаю |
| discount_kgs | фактическая скидка |
| refund_kgs | возвраты |
| remake_direct_cost_kgs | прямые затраты на переделки |
| chair_hours_total | суммарные занятые clinical chair hours |
| visits_total | количество визитов |
| primary_doctor | код/имя врача, без patient data |
| providers_count | количество вовлечённых врачей |
| lead_origin | existing / referral / maps / instagram / paid / raim_smile / unknown |
| first_enquiry_date | если доступно |
| first_visit_date | если доступно |
| plan_presented_date | если доступно |
| first_deposit_date | если доступно |
| last_payment_date | если доступно |
| lost_or_redirected_reason | если план не стартовал |

### Derived operator metrics

```text
DirectCaseCost =
  lab_cost
+ implant_material_cost
+ other_direct_material_cost
+ variable_doctor_comp
+ discount
+ refund
+ remake_direct_cost

CaseContribution = collected_revenue - DirectCaseCost

ContributionMargin = CaseContribution / collected_revenue

ContributionPerChairHour = CaseContribution / chair_hours_total

CashLagDays = last_payment_date - treatment_start_date
```

## B. One row per accepted lead — platform economics

Required fields:

| Field | Meaning |
|---|---|
| lead_id_hash | необратимо/защищённо обезличенный ID для analytics |
| operator_id | selected operator |
| market / program | routing scope |
| routing_mode | designated / rotation / marketplace / patient_selected |
| selection_basis | designated / patient_choice / highest_qualified_bid / other allowed code |
| source / campaign / creative | first-touch attribution |
| acquisition_spend_kgs | attributable media spend under approved method |
| intake_cost_kgs | coordinator/call/processing direct cost allocation |
| routing_tech_cost_kgs | direct platform/usage allocation |
| verification_qa_cost_kgs | operator verification/quality cost allocation |
| payment_processing_cost_kgs | fee collection cost |
| qualified_lead_fee_kgs | invoiced/earned fee under Commercial Schedule |
| operator_subscription_alloc_kgs | optional allocated recurring fee |
| onboarding_qa_fee_alloc_kgs | optional allocated fee |
| lead_fee_event_status | billable / collected / credited / disputed / void |
| fee_collected_date | cash date where available |
| operator_acceptance_at | SLA evidence |
| invalid_or_dispute_reason | if applicable |

Forbidden in platform dataset: patient name, phone, diagnosis, symptoms, scans, medical files, treatment plan details and medical free text.

### Derived platform metrics

```text
PlatformDirectCost =
  acquisition_spend
+ intake_cost
+ routing_tech_cost
+ verification_qa_cost
+ payment_processing_cost

PlatformRevenue =
  collected_qualified_lead_fee
+ allocated_operator_subscription
+ allocated_onboarding_qa_fee
+ other_approved_platform_fee

PlatformContribution = PlatformRevenue - PlatformDirectCost

PlatformContributionMargin = PlatformContribution / PlatformRevenue
```

Do not count planned bid or invoice as collected PlatformRevenue unless the management view explicitly separates accrued and collected.

## Decision output by program and operator

### Clinical/operator report

- cases count;
- completed/mature cases count;
- median and mean collected revenue;
- median and mean CaseContribution;
- median ContributionMargin;
- median ContributionPerChairHour;
- median chair hours;
- median cash lag;
- provider capacity;
- booking/show/diagnostics/plan/deposit conversion where attribution exists;
- complaints/remakes/redirected warning;
- sample-size warning;
- confidence label: `INSUFFICIENT / MATURING / USABLE`.

### Platform report

- qualified and accepted leads;
- acceptance and transfer-consent rates;
- fee revenue collected;
- acquisition cost per qualified lead;
- direct cost per accepted lead;
- PlatformContribution;
- invalid/duplicate/dispute rate;
- operator acceptance SLA;
- operator concentration;
- quality/privacy incidents;
- sample-size/confidence label.

A higher lead bid is not superior if support, dispute, quality or acquisition costs erase PlatformContribution or create unacceptable patient/brand risk.

## Privacy rule

Do not place names, phone numbers, medical images, diagnoses, radiographs or free-text anamnesis in either dataset. Use anonymised IDs only. Operator/platform joins require protected access and are never committed to Git.

## Source discovery · 2026-08-29

Owner confirmed that a 90-day clinic export can be produced. Current read-only discovery found:

| Surface | Verified result | Use for this contract |
|---|---|---|
| `EXPERT_DENTAL_WORKING_BASE_V1_1.xlsx` manifest / derived report | numeric source was received on 2026-08-03, but current report fields for funnel and payments remain null / `Не получено` | structure and requested KPI only; not case economics |
| Clinic price catalog | current clinic-confirmed prices | segmentation/reference only; price is not collected revenue or contribution |
| Month-1 WhatsApp/CRM worksheet | field map and audit method; real write/read access absent | source/SLA design only |
| Google Drive folder `Expert Dental` | five visual/brand files; no finance, CRM or schedule export | no economics data |
| Connected browser history/bookmarks | no confirmed clinic CRM, booking, accounting or billing system | no access route discovered |
| Git repository | no case-level collected revenue, direct costs, chair hours or variable doctor compensation | no calculation possible |

The actual source system names, export owner and access path are still unknown. Do not infer them from generic dental software names.

Marketplace platform data also does not yet exist because routing mode remains `DESIGNATED_OPERATOR` and no signed per-lead Commercial Schedule is active.

## Required extraction map

One clinic export may combine several source systems, but each field group must name its actual source:

| Field group | Required source class | Owner to identify |
|---|---|---|
| collected revenue, refunds, payment dates | clinic cash/accounting/receipt ledger | operator finance / clinic manager |
| plan value, treatment status, case dates | medical/practice-management system | authorised operator |
| visits and chair hours | appointment schedule + actual visit log | operator administrator |
| laboratory and implant/material costs | lab invoices / procurement / case cost ledger | operator finance / procurement |
| variable doctor compensation | payroll/doctor compensation calculation | operator finance / owner |
| enquiry, source and conversion dates | RAIM SMILE marketing CRM / call / WhatsApp journal | RAIM SMILE intake owner |
| routing/bid/acceptance events | routing platform audit log | RAIM SMILE platform owner |
| lead fees, credits, disputes and collection | billing/Commercial Schedule ledger | RAIM SMILE finance |

Default clinical window: rolling 90 days ending on the operator export date. Include mature completed cases and clearly label active cases; do not silently treat planned revenue as collected cash.

Default marketplace learning window is defined by accepted-lead count and maturation horizon, not calendar alone.

## Current blockers

### Clinical economics

`BLOCKED_ACCESS_DETAILS`: export feasibility is confirmed, but the clinic has not yet named the source systems, authorised export owner or provided the anonymised export. Direct-cost and case-level chair-hour data are absent from canonical sources.

### Platform economics

`NOT_YET_GENERATED`: no second operator, signed lead fee, live routing, billing or dispute ledger exists. Dynamic marketplace is legally and operationally gated.

Until data is received and validated:

- the three clinical routes remain a commercial hypothesis, not a verified profitability ranking;
- Expert Dental remains current designated operator, not proven best operator by economics;
- no highest-bid marketplace may claim superior platform economics.
