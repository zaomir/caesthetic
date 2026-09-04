---
title: Expert Dental — reconciliation прайса, $0-продуктов, CTA и Review Hub
status: COMPLETED
date: 2026-08-06
updated: 2026-08-29
owner: Cursor
scope: clinic.raimovdental.com patient site and feedback hub
---

# План реализации

## Решение по источникам истины

1. `origin/main` репозитория `zaomir/grainee-v2` — единственный SSOT кода.
2. Цены и статусы продуктов читаются только из
   `docs/raimov/operations/expert-dental/pricing/PRICE_CATALOG.json`.
3. Live `clinic.raimovdental.com` используется как проверка результата, а не как источник нового факта.
4. Satellite `zaomir/raimovdental` — транспорт для агентских материалов. Полезные формулировки из PR #4
   переносятся после сверки с SSOT; противоречащий `proposed`-дубль эстетики не переносится.
5. DEC-800 supersedes the former Care 12 publication hold: страница, статья, подтверждённые цены и
   WhatsApp inquiry публикуются как `clinic_confirmed_public`. Checkout, автоматическая активация и
   заявление о полном operational launch остаются закрыты.
6. DEC-861 supersedes only the public naming and route: current binding is shown
   as `RAIM SMILE · SmileCare 12` at `/services/smilecare-12/`; the old route is a
   permanent redirect. The three prices and benefit boundaries stay unchanged.

## Объём

1. Уточнить в каталоге границу трёх продуктов за 0 сом: только скрининг и маршрут, без диагноза,
   снимков и плана с ценами. Не использовать «бесплатная консультация».
2. Создать две подтверждённые service pages:
   `/services/smile-preview/` и `/services/named-checkup/`.
   Current Care 12 binding публикуется как `RAIM SMILE · SmileCare 12` по URL
   `/services/smilecare-12/`; legacy `/services/care-12/` перенаправляется по DEC-861.
3. Сделать CTA контекстными: label, `data-cta-context` и WhatsApp prefill описывают один продукт,
   услугу, статью или врача. Generic prefill остаётся только в точках выбора.
4. Развести консультации 550 / 1 500 / 3 000 / 5 000 сом по объёму приёма без оценочных сравнений.
5. Уточнить эстетику: клиническая сложность E-max, ориентиры 6/8/10 без подготовки,
   границы композитной реставрации, отдельная ночная каппа, отбеливание до виниров,
   wax-up внутри диагностики. Не выдумывать, является ли 15 000 сом за временные виниры ценой
   за зуб или комплект: до подтверждения показывать исходную строку с явным уточнением у администратора.
6. Добавить статьи по действующему article contract: цифровая примерка, именной чек-ап и Care 12.
   Reviewer указывается как editorial assignment;
   публичная medical-review attestation появляется только после `reviewedAt + reviewEvidence`.
7. Review Hub entry (канон 2026-08-10):
   `/feedback/` и unknown/malformed token → новый цикл → экран звёзд (не три карты);
   4–5★ → `/write` → `/maps`; 1–3★ → recovery only; «уже оставил» только на `/maps`.
8. Исключить `/null`, `proposed`, DEC и approval-маркеры из публичного HTML. Отдельно проверить
   legacy Tilda `/price`; менять его только через доступный управляемый канал, не через patient-site build.
9. Синхронизировать канон обратно в satellite после ship, чтобы не осталось параллельных цифр.

## WEBSITE / VISUAL QUALITY CANON READ

✓ `START.md` / `AGENTS.md` / `docs/ROUTER.md`  
✓ `docs/ssot/WEBSITE_STUDIO_STANDARD.md`  
✓ `docs/ssot/IMPECCABLE_WEBSITE_AGENT_STANDARD.md`  
✓ project SSOT: `RAIMOV.md`, `RAIMOV_DENTAL_WEBSITE_STRATEGY.md`,
  `EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md`, `RAIMOV_LEGAL_GATES.md`  
✓ project brief/router: `docs/projects/raimovdental/AGENTS.md`,
  `docs/projects/raimovdental/ROUTER.md`  
✓ design canon: `site-raimovdental/DESIGN.md`; patient pages preserve their existing production system  
✓ production templates: `patient-site/templates/*.mjs`, `patient-site/assets/css/site.css`,
  `feedback-hub/*`  
✓ testing/deploy: `scripts/raimov/check-patient-site.mjs`,
  `scripts/raimov/check-feedback-hub.mjs`, `tests/raimovdental/`,
  `scripts/raimov/deploy-*.sh`

SURFACE MODE: `persuade` for service/article pages; `operate` for Review Hub.  
DESIGN DISCOVERY: complete; preserve the current visual system and rights-cleared assets.  
IMPECCABLE PASSES: clarify → adapt → audit.  
REPRESENTATIVE SURFACE: `/services/smile-preview/` and anonymous `/feedback/`.  
DETECT TARGET: patient-site templates/assets and feedback-hub.

## Acceptance

- Build uses one publishable catalog; Care 12 renders only while catalog and all three SKUs are
  `clinic_confirmed_public`.
- Two confirmed $0 service pages return 200, appear in sitemap and interlink with doctors/services/articles.
- Every scoped CTA has matching visible intent, context marker and decoded WhatsApp message.
- New articles pass author/reviewer/reference/FAQ/related-link gates without fabricated review evidence.
- `/feedback/` and invalid token return useful 200 fallback; valid CSAT/recovery remains functional.
- No public `/null`, internal status marker, reward-for-review or 5-star pressure.
- Static checks, accessibility, browser/mobile, dead-link, schema, sitemap and Impeccable detector pass.
- Changes are pushed to `origin/main`, staging is deployed, and public smoke verifies routes, CTA and Hub.

## Реализовано 2026-08-06

- `PRICE_CATALOG.json` принят как единственный ручной источник цен; `PRICE_TABLE.md` теперь
  генерируется из него через `scripts/raimov/sync-price-table.mjs`, а deploy проверяет отсутствие drift.
- DEC-800 подтвердил публикационную границу Care 12; DEC-861 меняет только display name и
  canonical route на `/services/smilecare-12/`. Статья, три прежних SKU и WhatsApp inquiry
  разрешены; checkout и автоматическая активация не добавляются.
- Созданы страницы `/services/smile-preview/` и `/services/named-checkup/`, две статьи,
  двусторонние связи с врачами и смежными услугами, FAQ и Schema.org.
- CTA услуг, статей и врачей получили контекстные labels, `data-cta-context` и WhatsApp drafts.
- `/services/price` перенаправляется на канонический `/services/`; `/null` и внутренние статусы
  блокируются quality gate.
- Review Hub: `/feedback/` → звёзды; 4–5★ `/write`→`/maps`; 1–3★ recovery; `platform_already_reviewed` на `/maps`.
- `$0`-карточки показывают длительность, ограничения и ручную проверку именного права администратором.
- Карточки врачей показывают все применимые консультационные тарифы; формы записи требуют явного
  согласия на обработку данных.
- Review Hub ограничивает создание ссылок одним циклом за 90 дней по псевдонимному patient HMAC.
  Recovery хранит только allowlisted темы: свободный текст удалён из формы и отбрасывается сервером.
- Google Maps честно обозначен как переход в карточку до получения Place ID/direct review URL от клиники.
