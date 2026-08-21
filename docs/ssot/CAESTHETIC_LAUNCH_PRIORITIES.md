---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-21
updated: 2026-08-21
scope: launch order, launch gates, first-cohort boundary and deliberate deferrals
parents:
  - docs/ssot/CAESTHETIC_ACQUISITION_DIAGNOSTIC_GROWTH_CONTROL_SYSTEM.md
  - docs/ssot/CAESTHETIC_STRATEGY_TAXONOMY.md
  - docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md
project_master: docs/ssot/CAESTHETIC.md
---

# CAESTHETIC — Launch Priorities

> Каноническая очередность запуска. Этот документ не создаёт новую стратегию: acquisition-модель определяет DEC-845, классификацию — DEC-846, техническую готовность — DEC-847.

## 1. Приоритет каналов

| Приоритет | Lane | Решение |
|---|---|---|
| P0 | Signal-based Cold Email | Основной scalable acquisition после закрытия deliverability gate. Только квалифицированные accounts, подтверждённый signal/context, verified email и suppression. |
| P0 | Partner / Referral | Запускается параллельно как самый быстрый warm path. Ведёт в тот же Growth Score funnel. |
| P1 | Selective LinkedIn ABM | Только Tier A: доступ к decision-maker и professional trust. Не mass outreach. |
| P1 | Instagram | Warming / trust surface. Cold DM **OFF**. Контент и разрешённые familiarity touches поддерживают email, partners и inbound. |

Один funnel для всех lanes:

```text
Growth Score
→ human-approved walkthrough
→ 30-Day Growth Sprint — $2,500
→ Stripe payment
```

**Stripe обязателен до масштабирования.** Sprint не становится cold offer; payment path включается после Score, walkthrough и согласованного scope.

## 2. Первая когорта

- Первая controlled cohort: **30–50 activation-ready accounts**.
- Source authority: канонический защищённый `CURRENT` на **646** записей (`r20260821T014534Z-qualified-646-contract`).
- Выбор когорты выполняется из `CURRENT`, с владельцами, контактами, signals, tier и suppression state.
- **Не пересобирать CURRENT**, пока нет отдельного deliberate release decision с новой immutable release, проверкой и атомарным переключением pointer.
- Не ждать полного дополнительного анализа всех 646 перед первой когортой.

## 3. Wave approval gate

Wave получает `GO` только когда одновременно подтверждены:

1. email каждого адресата verified;
2. deliverability принята: sending inboxes, SPF/DKIM/DMARC, warmup/inbox placement и send limits;
3. suppression / DNC / conflict checks fail closed;
4. назначен reply owner и подтверждена реальная capacity на Growth Score;
5. `/growth-score/` и lead routing работают end-to-end;
6. Score production, human approval и walkthrough готовы;
7. Sprint scope и **Stripe payment path** проверены end-to-end.

Нет полного gate — нет отправки. Активность, список или доступ к инструменту не заменяют Wave approval.

## 4. Что должно быть готово до запуска

- qualified accounts, decision-makers/owners и датированные signals;
- verified email infrastructure, suppression и reply routing;
- согласованные Instagram и LinkedIn trust surfaces;
- Growth Score intake, production, human approval и walkthrough delivery;
- reply playbook, named reply owner, response SLA и capacity;
- UTM/source tracking, lead status и минимальная attribution loop;
- Stripe для Sprint $2,500;
- ManyChat inbound routing для Instagram; cold outbound automation запрещена.

## 5. Что не блокирует запуск

Не ставить первую controlled cohort на паузу ради:

- большой SEO/content library;
- 50 Reels;
- одновременного запуска всех 9 городов;
- Clay, Airtable, Pipedrive или n8n;
- полного дополнительного анализа всех 646 записей;
- custom SaaS / собственной платформы.

Разрешены простые ручные процессы, если они сохраняют ownership, suppression, evidence и измеримость.

## 6. После funnel evidence

Только после evidence из реального funnel — human-approved Scores, qualified dialogues, paid Sprint, cycle time и отсутствие suppression/release failures — рассматривать масштабирование:

- Google Search Ads;
- SEO / authority content;
- Meta B2B;
- first-party retargeting;
- CITY CHECK как scaling mechanic;
- следующие city cohorts.

Schools / academies — более поздний **partner track**, не первая acquisition cohort.

## 7. Governance

- DEC-845 остаётся authority для acquisition, qualification, signals и pre-Score boundary.
- DEC-846 остаётся authority для категорий Products / Data / Tools / Materials / Signals / Mechanics / Channels / Funnels / Processes / Governance.
- DEC-847 остаётся authority для factual readiness и tool-by-stage audit.
- Этот документ имеет приоритет только в вопросах **launch order, first-cohort boundary, Wave approval и deliberate deferrals**.
- Любое расширение после первой когорты требует evidence, а не calendar pressure или наличия списка.
