---
id: DEC-867
title: CAESTHETIC Growth Score medical_practice vertical
status: accepted / owner-approved product decision / coordinated-release gated
date: 2026-09-03
owner: Total / CAESTHETIC
applies_to:
  - caesthetic
  - growth-score
  - multi-location-growth-score
links_to:
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
  - docs/caesthetic/growth_score_spec.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
---

# DEC-867: `medical_practice` становится поддерживаемым Growth Score vertical

## Контекст

Текущий Growth Score v5 использует один продукт, один schema/template contract и ровно четыре публичные поверхности: Search / Google Business Profile, Website, Social и Reputation / Reviews. До этого production `vertical_context` был ограничен эстетическими практиками, dental practices и beauty salons.

Появилась необходимость проводить тот же outside-in Growth Score для медицинских практик, где пациентский выбор публично наблюдаем через те же четыре поверхности. Первый подтверждённый use case — ENT / otolaryngology, включая multi-location practice networks.

Создание узкого `ent_urgent_care` vertical привязало бы продукт к одной специальности и создало бы лишний schema fork. Поэтому требуется более общий reusable context.

## Решение

### 1. Новый разрешённый vertical

Добавить canonical `vertical_context`:

```text
medical_practice
```

`medical_practice` означает лицензированную медицинскую практику или outpatient medical provider, у которой есть осмысленный публичный patient-choice journey через Four Surfaces.

ENT / otolaryngology является первым adapter/use case внутри `medical_practice`, а не отдельным vertical или отдельным продуктом.

### 2. Что не меняется

Этот DEC не создаёт:

- пятую поверхность;
- новый Growth Score продукт;
- отдельный competitor score;
- Network Score;
- новые outer weights;
- автоматический выбор binding constraint или Top 3;
- новый public funnel или цену;
- право диагностировать внутреннюю работу reception, CRM, staffing или clinical operations из публичных данных.

Сохраняются `schemaVersion = 5`, `growth-score-report-template/5.2.0`, одна Primary Gap + две Supporting Gaps, named-human Focus Selection и текущий Russian-first approval flow.

### 3. Medical adapter boundary

Для `medical_practice` те же canonical metric IDs интерпретируются через медицинский patient-choice context. Service/treatment examples могут включать specialty consultation, urgent/same-day access, diagnostics, procedures, clinician expertise и location-specific access, если они реально предлагаются исследуемой практикой.

Нельзя переносить факты, benchmarks, treatment economics, competitor evidence или clinical conclusions из aesthetic/dental/beauty контекстов.

Priority services определяются как research context из manager intake и публичной evidence, а не как медицинская рекомендация.

### 4. Clinical / regulatory gate

Growth Score остаётся маркетинговым outside-in diagnostic. Он может наблюдать публичные claims, service availability, booking paths, clinician proof, reviews и market-practice signals.

Он не может:

- утверждать клиническое превосходство treatment/device/drug/protocol без подходящей qualified evidence/review;
- рекомендовать изменение клинического решения;
- делать diagnosis/prognosis;
- выводить безопасность или эффективность из marketing adoption;
- использовать PHI или patient records в Free Growth Score.

Market-practice findings следуют `COMPETITIVE_DECISION_ANALYSIS_STANDARD.md` и соответствующим clinical/regulatory gates.

### 5. Evidence и impact

Публичный Growth Score для `medical_practice` использует те же evidence rules: missing evidence остаётся unavailable / insufficient evidence, а не нулём. Наблюдаемая friction не превращается автоматически в claim о потерянных пациентах, revenue или causality.

Internal Lead-to-Revenue stages остаются `NOT ASSESSED`, пока нет отдельного разрешённого evidence access.

### 6. Multi-Location

`medical_practice` разрешён для single-location и Multi-Location Growth Score при соблюдении общего factory contract:

- complete declared-location registry;
- reviewed / not_found / ambiguous / closed_or_moved / excluded states;
- shared-vs-local asset topology;
- location-specific competitor sets, когда geography меняет выбор;
- один manager-selected focus location;
- один общий final Top 3 для пакета;
- no aggregate Network Score.

### 7. Coordinated release gate

Решение считается production-active только после согласованного изменения:

1. master/spec/SOP vertical eligibility language;
2. runtime `GROWTH_SCORE_VERTICAL_CONTEXTS` validation;
3. medical-practice adapter/rubric guidance;
4. renderer/template compatibility verification;
5. regression tests proving acceptance of `medical_practice` and rejection of unsupported contexts.

До прохождения этого gate один DEC сам по себе не разрешает публиковать medical Growth Score как current canonical production report.

## Acceptance

Release принят, когда текущий `main` одновременно:

- содержит обязательные evidence/competitive authorities;
- перечисляет `medical_practice` в действующем vertical contract;
- runtime принимает `medical_practice` без подмены его на другой vertical;
- Four Surfaces, weights, schema/template и human gates не изменены;
- regression tests подтверждают fail-closed поведение для неизвестных verticals;
- ENT может быть resolved как `medical_practice` без создания специального ENT product contract.

---

**Decision:** expand the reusable Growth Score context to `medical_practice`; ENT is the first adapter, not a new product or fifth surface.