---
title: ТЗ — Review Hub без тупика «ссылка недействительна» + «уже оставил отзыв»
status: SUPERSEDED BY CANON — partial ship
version: 1.1
created: 2026-08-06
updated: 2026-08-10
priority: P0 UX
pilot: https://clinic.raimovdental.com/feedback/
canon:
  - docs/raimov/operations/expert-dental/reputation/POST_VISIT_FEEDBACK_LOOP.md
  - docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md §4.1
code_surface: site-raimovdental/feedback-hub/
---

# ТЗ — Review Hub: нет тупика + «уже оставил» (актуализация 2026-08-10)

> **Канон маршрута (обязателен):**  
> `/feedback/` → звёзды → **1–3★** recovery only → **4–5★** `/write` (guidance) → `/maps` (площадки).  
> Анонимный shortcut на карты (`/feedback/out/*`, landing с тремя кнопками) **запрещён**.

## 1. Проблема (историческая)

Ранее `/feedback/` без токена или с битым токеном мог выглядеть как «ссылка недействительна». Это тупик.

**Принцип:** токен нужен для трекинга; пациент всегда получает полезный экран — сейчас это **экран звёзд**, не карты.

## 2. Цель (актуально)

1. Любой заход на Hub (нет токена / unknown / malformed) → **новый цикл → CSAT 1–5★** (фото команды + звёзды). Не error-dead-end. Не кнопки карт.
2. На `/maps` (только после 4–5★ и после guidance) — малозаметное «Я уже оставил отзыв на этой карте».
3. Не ломать anti-spam лестницу и журнал там, где token есть.

## 3. Scope

| В scope | Вне scope |
|---|---|
| UX `/feedback/` и `/feedback/<token>/*` | Главная clinic site, IA, patient-site CSS |
| Entry → stars; `/write` → `/maps` | WhatsApp API / авто-дожимы (фаза D) |
| Кнопки «уже оставил» на `/maps` | Баллы/скидки за отзыв (запрещено) |

## 4. Поведение по URL (канон)

### 4.1. `GET /feedback/` / `GET /feedback/demo` / unknown|malformed

- **302/303** на новый ephemeral token → экран **звёзд**.
- **Не** показывать три кнопки карт.
- Legacy `/feedback/out/*` → тот же restart на звёзды (не внешняя карта).

### 4.2. Valid token — ветки

| Оценка | Маршрут |
|---|---|
| нет score | intro / звёзды |
| 1–3★ | recovery (Атабек) — **без** карт |
| 4–5★ | `/write` (только подсказки) → POST `/ready` → `/maps` (площадки) → внешняя карта |

### 4.3. «Уже оставил» — только на `/maps`

Для каждой незакрытой площадки:

- основная кнопка → POST `/continue` → внешняя карта + `platform_clicked`;
- вторичная «Я уже оставил отзыв на этой карте» → `platform_already_reviewed`, остаёмся на `/maps`.

## 5. События

| Событие | Когда |
|---|---|
| `hub_cycle_started` | mint token с `/feedback/` / demo / legacy-out |
| `hub_opened` | открыт token page |
| `csat_scored` | оценка 1–5 |
| `review_guidance_viewed` | экран `/write` / markGuidanceViewed |
| `platform_selected` / `platform_clicked` | выход с `/maps` на площадку |
| `platform_already_reviewed` | «уже оставил» на `/maps` |

`anon_hub_opened` / `anon_platform_clicked` — **сняты** с канона (нет анонимного map-exit).

## 6. Acceptance (обновлённые)

- [x] `/feedback/` → звёзды (не карты, не «недействительна»).
- [x] unknown token → новый цикл со звёздами.
- [x] 4–5★: `/write` без platform buttons → `/maps` с тремя площадками + «уже оставил».
- [x] 1–3★: recovery only.
- [x] `/feedback/out/*` не уводит на Google/Яндекс/2ГИС.
- [x] `check-feedback-hub` / smoke отражают канон.

## 7. Историческая заметка

v1.0 этого ТЗ предлагала marketing fallback с **тремя кнопками карт** на `/feedback/`. Founder override 2026-08-10: entry = звёзды; карты только после 4–5★ и после guidance. Этот файл приведён к канону; не использовать v1.0 map-landing.
