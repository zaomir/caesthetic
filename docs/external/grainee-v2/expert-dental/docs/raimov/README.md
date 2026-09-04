# RAIMOV ecosystem operating index

**Status:** INTERNAL_REPO  
**Architecture authority:** `docs/ssot/RAIMOV_ECOSYSTEM_PROJECT_ARCHITECTURE.md`  
**Strategy authority:** `docs/ssot/EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md`  
**Master routing:** `docs/ssot/RAIMOV.md`

This namespace contains operating documentation for Expert Dental Studio, RAIMOV DENTAL as Atabek's personal expert platform, RAIM SMILE brand/system/operator network, Raimov Clinical Case Club, future Raimov Academy and the future ELITE DENTAL network. It does not replace strategy, evidence, legal gates or public copy.

```text
governance/       decisions, ownership, dependencies and change control
corporate/        entities, domains, brands, licences and corporate records
clinic-growth/    baseline, offers, capacity, operator and platform unit economics
patient-funnel/   lead, operator routing, booking, visit, diagnosis, plan, payment, recall and referral
patient-routing/  boundary from personal platform to RAIM SMILE Second Opinion and licensed operator
clinical-system/  RAIM SMILE SYSTEM modules, internal referrals and quality standards
personal-brand/   Atabek positioning, narratives, channels and measurement
professional/     doctor journey and Raimov Clinical Case Club
academy/          future education products after methodology/demand/programme gates
evidence-public-profile/ claim-to-evidence and public-profile boundary
copy-runtime-boundaries/ strategy, copy, runtime and release ownership
elite-dental/     future partner/franchise model; private until explicitly unlocked
content/          route, CTA, case, content and editorial registers
design/           brand, assets, components, rights and accessibility decisions
technology/       build, analytics, CRM interfaces, security and runtime map
release/          blockers, manifests, gates, smoke and rollback evidence
operations/       roles, operator registry, SOPs, reporting cadence and data ownership
```

## Personal Brand Model v1

Authority: `docs/ssot/RAIMOV_PERSONAL_BRAND_MODEL.md` and `DEC-863`.

```text
RAIMOV DENTAL = Atabek's personal expert platform
patient first = RAIM SMILE Second Opinion
professional first = Raimov Clinical Case Club
later = Raimov Academy
```

This architecture adoption is `NO_RUNTIME_CHANGE` and does not rewrite RAIM SMILE or BALAM contracts.

## RAIM SMILE current operator and network

Current binding:

```text
Bishkek
routing_mode = DESIGNATED_OPERATOR
current_operator = Expert Dental Studio
```

Expert Dental is current, not permanent/exclusive. Portable operator and marketplace authority:

- decision: `../founder-notes/DEC-859_raim-smile-current-operator-and-qualified-lead-marketplace.md`;
- operator/network SSOT: `../ssot/RAIM_SMILE_OPERATOR_NETWORK_AND_ROUTING_MODEL.md`;
- current CRM contract: `patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md`;
- multi-operator routing: `patient-funnel/RAIM_SMILE_MULTI_OPERATOR_ROUTING_CONTRACT.md`;
- operator registry/transition: `operations/RAIM_SMILE_OPERATOR_REGISTRY_STANDARD.md`;
- focused legal gates: `../legal/raimov/RAIM_SMILE_OPERATOR_MARKETPLACE_LEGAL_GATES.md`;
- operator and platform economics: `clinic-growth/RAIM_SMILE_PROFITABILITY_INPUT.md`.

`QUALIFIED_LEAD_MARKETPLACE` remains `DESIGNED_NOT_ACTIVE`. Highest bid may be used only after operator eligibility, counsel, privacy, disclosure and patient-consent gates. No PHI enters a bid round.

## Expert Dental operating root

Текущая работа действующей клиники Expert Dental — планы, отчёты, материалы и ссылки — ведётся здесь:

`docs/raimov/operations/expert-dental/README.md`

Ключевые файлы:

- архитектура: `operations/expert-dental/FILE_ARCHITECTURE.md`;
- планирование и отчётность: `operations/expert-dental/PLANNING_AND_REPORTING.md`;
- материалы: `operations/expert-dental/MATERIALS_REGISTER.md`;
- ссылки: `operations/expert-dental/LINKS_REGISTER.md`;
- первый месяц: `operations/expert-dental/periods/month-01/`;
- RAIM SMILE Second Opinion: `patient-funnel/RAIM_SMILE_SECOND_OPINION_PRODUCT.md`;
- RAIM SMILE Treatment Coordinator: `operations/expert-dental/RAIM_SMILE_TREATMENT_COORDINATOR_STANDARD.md`.

Клиентская витрина: `https://raimovdental.com/ru/valeria/` (открытый URL, `noindex`).

Materialise operational files only when there is a real owner, task, decision or evidence source. Do not create empty evidence, medical, legal or financial documents.
