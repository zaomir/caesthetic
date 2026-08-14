# Instagram VOC → контент-матрица (aesthetic academies)

> **SUPERSEDED for CAESTHETIC Phase-1 feed (2026-08-11).**  
> Student/VOC content must **not** drive `@caesthetic.growth` under DEC-812.  
> Canon: [`CAESTHETIC_IG_GROWTH_PROGRAM.md`](./CAESTHETIC_IG_GROWTH_PROGRAM.md) §12.1.  
> Entrypoints refuse with `PHASE1_FAIL_CLOSE` unless founder sets `CAE_PHASE0_STUDENT_VOC_ALLOW=1` (default OFF).  
> This runbook remains as Phase-0 archive / research reference only — not a Phase-1 publish path.

Самодостаточный runbook. Цель: **вопросы и боли** студентов/фолловеров англоязычных школ эстетики → кластеры → hooks / Reels / carousels для `@caesthetic.growth` (pillars S1–S4).

Это **не** student discovery (лиды). Discovery: `CAESTHETIC_IG_STUDENT_DISCOVERY_APIFY.md`.  
Контент-программа: `CAESTHETIC_IG_GROWTH_PROGRAM.md` (DEC-791/793).  
Решение: DEC-799.

---

## Принцип экономии

| Этап | Затратный | Экономный (канон) |
|------|-----------|-------------------|
| Посты | Вся история аккаунта | 15–20 свежих / школа |
| Комменты | Full comment scrape всех постов | Сначала `latestComments` из post-scraper; deep scrape только топ-постов |
| Фильтр | LLM | Локальный Python (длина + антиспам + pain score) |
| Анализ | 1 коммент = 1 LLM-вызов | Батч-кластеризация (Cursor / дешёвая модель) |
| Частота | Ежедневно | 1–2× / месяц |

Hard rule: всегда `maxTotalChargeUsd`. Пилот ≤ **$1.50**. Месячный срез 5–10 школ ≤ **$5**.

---

## Акторы

| Шаг | Actor | ID |
|-----|--------|-----|
| Посты школ | `apify/instagram-post-scraper` | `nH2AHrwxeTRJoN5hX` |
| Deep comments (опц.) | `apify/instagram-comment-scraper` | `SbK00X0JYCPblD2wp` |

Не менять без причины. Токен: `APIFY_TOKEN` из `/etc/evo/secrets.env` (не в git).

---

## Пайплайн

```text
Pilot 3–5 EN academies
        │
        ▼
Lane P: post-scraper (resultsLimit 15–20, detailedData)
        │
        ▼
Extract latestComments + caption signals
        │
        ▼
Local filter (spam out, pain score ≥ threshold)
        │
        ▼
[Optional] Lane C: comment-scraper ONLY on top 10–20 post URLs
        │
        ▼
Cluster → Top-5 pain clusters
        │
        ▼
Content matrix → S1–S4 pillars + Copy_Bank drafts
```

---

## Seed EN academies (пилот)

Предпочитать англоязычные training / academy аккаунты (injectors / nurses / dentists):

```text
harley_academy
acquisitionaesthetics
interfaceaesthetics
derma_medical
cosmeticcourses
facialesthetics
empiremedicaltraining
theaestheticimmersion
aestheticmentor
aptinjectiontraining
nainstitute
nationallaserinst
aroseinstitute
```

Критерий: учебный контур. Не обычная medspa «для пациентов».

---

## Lane P — посты

```json
{
  "username": ["harley_academy", "acquisitionaesthetics", "interfaceaesthetics", "derma_medical", "cosmeticcourses"],
  "resultsLimit": 15,
  "skipPinnedPosts": true,
  "onlyPostsNewerThan": "2025-08-01",
  "dataDetailLevel": "detailedData"
}
```

`maxTotalChargeUsd`: **1.50** (пилот).

### Отбор «богатых» постов (локально)

**Пилот 2026-08-06 (5 EN academies):** comment sections почти бесполезны для marketing VOC —
доминируют keyword-CTA (`JAW` / `LEARN` / `CONSULTATION`) и emoji-congrats.
**Сильный сигнал — captions** академий про newly qualified / first consult / business systems.
Deep-comment имеет смысл только на постах с business-caption, не на award/promo.

Приоритет deep-comment:

1. **caption** содержит business / newly qualified / first patient / consultation / grow / booking (главный критерий);
2. затем `commentsCount` высокий;
3. не чистый promo / award / selfie; **не** посты «Comment KEYWORD» (там только keyword spam).

Параллельно всегда майнить captions → `caption_voc.json` (часто важнее comments).

---

## Локальный фильтр (обязателен до LLM)

Отбросить:

- длина `< 20` символов;
- только эмодзи / «🔥❤️»;
- spam: `dm me`, `collab`, `check my page`, crypto, NSFW promo;
- комменты самой школы / коавторов.

Оставить / повысить score при:

- `?` или how / why / anyone else;
- pain lexicon: `client`, `book`, `booking`, `charge`, `price`, `slow`, `ads`, `lead`, `leads`, `marketing`, `instagram`, `portfolio`, `graduate`, `after course`, `first patient`, `no inquiries`, `struggle`, `help`, `grow`, `business`.

Порог пилота: `pain_score >= 2` **или** (`len >= 40` и есть `?`).

---

## Lane C — deep comments (опционально)

Только если после Lane P `< ~30` релевантных строк.

Input: `directUrls` = **post URLs** (не профили).  
Лимит: ≤ 50–100 комментов / пост, ≤ 20 URL, `maxTotalChargeUsd` отдельно ≤ **2.00**.

---

## Кластеризация → контент-матрица

Выходные артефакты (вне публичного git PII; CSV ок в `tmp/`):

| Файл | Содержание |
|------|------------|
| `tmp/cae-ig-voc/raw_posts.json` | сырой dataset постов |
| `tmp/cae-ig-voc/raw_comments.csv` | все извлечённые комменты |
| `tmp/cae-ig-voc/filtered_pain.csv` | после фильтра |
| `tmp/cae-ig-voc/content_matrix.md` | Top-5 кластеров + hooks |

На каждый кластер:

1. имя кластера + map на pillar **S1–S4** (или P1–P5 если owner-side);
2. 2–3 **парафраза** реальных вопросов (не публиковать @username без нужды);
3. 1 Reel hook;
4. 1 angle / решение (Approved Claims only — без medical advice, без grey product);
5. 1 CTA (`FIRST` / `LAUNCH` / `MAPS` / `NEXT` или assessment).

---

## Скрипт

```bash
set -a; source /etc/evo/secrets.env; set +a
python3 scripts/outreach/cae_ig_voc_content_apify.py \
  --schools harley_academy,acquisitionaesthetics,interfaceaesthetics,derma_medical,cosmeticcourses \
  --posts-limit 15 \
  --newer-than 2025-08-01 \
  --max-usd 1.50 \
  --out-dir tmp/cae-ig-voc
```

Флаги:

- `--deep-comments` — включить Lane C на топ-постах;
- `--skip-apify` — только локальный фильтр/кластер из уже скачанного `raw_posts.json`.

---

## Compliance

- VOC-lane ≠ cold DM lane. Не сливать filtered CSV в Instantly / bulk DM.
- Хуки — парафраз; без doxxing commenters.
- Нет ranking guarantees / medical advice / Toxifillers grey names в публичном контенте.
- PII (если всплывёт) не коммитить.

---

## Чеклист агента

- [ ] Pilot 3–5 EN школ, spend ≤ кап
- [ ] `detailedData` + локальный фильтр
- [ ] Deep comments только при нехватке сигнала
- [ ] `content_matrix.md` с Top-5 → S1–S4
- [ ] Run id + USD в Summary
- [ ] Не путать с student discovery workbook

---

## Связанные

- `CAESTHETIC_IG_STUDENT_DISCOVERY_APIFY.md` — юзернеймы / Priority A
- `CAESTHETIC_IG_GROWTH_PROGRAM.md` — pillars + maker loop
- `CAESTHETIC_AUDIENCE_LISTS.md` — audience sheets
- DEC-799

## Batch content render (maker)

```bash
# once: python3 -m venv tmp/cae-ig-voc/.venv-pil && tmp/cae-ig-voc/.venv-pil/bin/pip install Pillow
tmp/cae-ig-voc/.venv-pil/bin/python scripts/caesthetic/render-ig-voc-batch.py
```

Output (gitignored `tmp/`):

- `tmp/cae-ig-voc/batch/pains_8.csv` — 8 pains × slides × captions IG/FB/LI
- `tmp/cae-ig-voc/batch/COPY-VOC-021…028/` — 8× carousel JPG (1080×1350)
- `tmp/cae-ig-voc/batch/captions.md` + `copy_bank_seed.json` (DRAFT seed)

Optional Dropbox: `rclone sync tmp/cae-ig-voc/batch/COPY-VOC-0NN/ dropbox:SIMON_OPS/content/B_CAE_IG/COPY-VOC-0NN/`

