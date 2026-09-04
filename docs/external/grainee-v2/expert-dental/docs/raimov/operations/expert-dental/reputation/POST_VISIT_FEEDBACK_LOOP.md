---
title: Expert Dental — Post-Visit Feedback Loop (SOP)
status: DRAFT — strategy accepted; operational pilot gated
version: 1.3
created: 2026-08-05
last_updated: 2026-08-09
pilot_host: https://clinic.raimovdental.com
canon:
  - docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md §4.1
  - docs/ssot/RAIMOV_ACCESS_CONTINUITY_SYSTEM.md §8
---
# Post-Visit Feedback Loop — операционный SOP

Система собирает честную обратную связь и помогает пациенту перейти на публичную площадку. Баллы, скидки и вознаграждения за оценку или публикацию запрещены.

## 1. Канонический UX
```text
/feedback/ ──► mint token ──► нейтральная оценка 1–5★
                                 │
                                 ├── 4–5★ ──► /write (подсказки, как писать)
                                 │                 │
                                 │                 └─► /maps (Яндекс · 2ГИС · Google)
                                 │                        └─► внешняя карта
                                 │
                                 └── 1–3★ ──► recovery (видео Атабека + форма)
                                               · без публичных карт
```

**Ключевые invariants:**
- `/feedback/` и битые ссылки всегда открывают экран звёзд — не shortcut на карты.
- 1–3★: только recovery (замена карт).
- 4–5★: сначала guidance (`/write`), затем отдельный выбор карт (`/maps`).

## 2. Guidance перед внешней площадкой
После выбора Google / Яндекс / 2ГИС пациент видит короткую подсказку, а не генератор отзыва.

Допустимые prompts:
- с чем вы обратились;
- если комфортно — какую услугу или лечение получили;
- что особенно запомнилось;
- что было важно в работе врача или команды;
- что вы сказали бы человеку, который выбирает клинику.

Обязательная оговорка: это только идеи; пациент пишет собственный реальный опыт своими словами. Система не генерирует, не предзаполняет и не предлагает copy/paste текста, не просит конкретную оценку и не обещает reward.

`serviceCategory` и `doctorCode` не используются для персонализированного steering текста. Они остаются внутренними coarse metadata.

## 3. Runtime и события
Runtime: `site-raimovdental/feedback-hub/`, сервис loopback `:8613`, namespace `/feedback/*`.

Основные события (4–5★):
`hub_cycle_started` / `hub_opened` → `csat_scored` → `review_guidance_viewed` (`/write`) → `platform_selected` / `platform_clicked` (с `/maps`).
Дополнительно: `platform_already_reviewed`, `recovery_submitted`, `review_cycle_stopped`, `publish_detected`.

`platform_clicked` фиксируется только при выходе с `/maps` на площадку — после прохождения guidance.

## 4. Review Hub states
| Состояние | UI |
|---|---|
| `/feedback/` / demo / unknown token | редирект на новый цикл → CSAT 1–5★ |
| После 4–5★ | `/write` — только подсказки, без кнопок карт |
| После «Далее» с guidance | `/maps` — три публичные площадки |
| После клика наружу | площадка серая при возврате на `/maps` |
| После 1–3★ | только recovery (видео + темы), без карт |
| После recovery submit | подтверждение + WhatsApp; карты недоступны |
| Opt-out | прекращение review reminders |
| Legacy `/feedback/out/*` | редирект на звёзды (не на карту) |

## 5. Recovery 1–3★
Структурированные темы: сервис, ожидание, коммуникация, чистота, результат этапа, стоимость (без «Другое»). Опциональный многострочный комментарий (placeholder: «Опишите что именно не понравилось и имена врачей.»), до 2000 символов; уходит в email-алерт. Privacy consent обязателен и не предвыбран; consent на контакт отдельный.

SLA: alert ≤15 мин в рабочие часы; первый контакт ≤4 рабочих часов; план ≤24 ч; закрытие/эскалация ≤48 ч.

## 6. Data minimisation + alerts
Store не содержит телефон, диагноз, CRM visit notes. Token TTL 60 дней. Patient-level frequency cap 90 дней. Опциональный patient comment в recovery допускается (может содержать имена врачей).

**Email (LIVE):** `FEEDBACK_ALERT_EMAIL` (default `wsc8eq@gmail.com`) via Resend.
- 4–5★ + клик на карту → «Клиент токен … оставил N★ на карте Яндекс|2ГИС|Google».
- 1–3★ recovery submit → «Клиент токен … оставил N★ с комментариями:» + темы + текст комментария.

**Telegram:** отложен; когда появится `TELEGRAM_BOT_TOKEN` — только opaque ID (без оценки/тем). Имя пациента в store нет — в письме короткий token id.

## 7. Anti-gating / compliance invariants
- публичный review path только для 4–5★; 1–3★ — только recovery;
- no reward / discount / bonus;
- no request for five stars;
- no review generation or prefill;
- no pre-filtering eligible patients by expected sentiment (запрещённый review gating); разный follow-up 4–5★ vs 1–3★ — допустим по DEC-787 / §4.1 мотивации;
- no endless reminders;
- click ≠ publication; `publish_detected` сверяется отдельно.

## 8. Nudge ladder
Только для ветки **4–5★** (лестница площадок). Ветка 1–3★ получает N0 (CSAT) и recovery SLA; map-дожимы не отправляются.

N0 +60–120 мин после eligible visit; N1 +1–2 дня после первого выхода; N2 +3–7 дней; N3 одно weekly; N4 одно monthly; затем STOP. Quiet hours 09:00–20:00.

## 9. Weekly review
Sent → opened → scored → guidance_viewed (`/write`) → platform_selected / platform_clicked (`/maps`) → publish_detected. Отдельно: recovery SLA, opt-outs, drop-off write→maps, доля циклов с 2+ площадками.

## 10. Routing
- runtime entry: `site-raimovdental/feedback-hub/server.mjs`
- state: `site-raimovdental/feedback-hub/lib/store.mjs`
- UI: `site-raimovdental/feedback-hub/lib/render.mjs`
- copy: `site-raimovdental/feedback-hub/content.mjs`
- implementation: `docs/raimov/operations/expert-dental/reputation/IMPLEMENTATION_PLAN_ATOMIC.md`
- gate: `scripts/raimov/check-feedback-hub.mjs`
- deploy: `scripts/raimov/deploy-feedback-hub.sh`

Публикация, рейтинг и позиции зависят от пациента и модерации площадок и не гарантируются.
