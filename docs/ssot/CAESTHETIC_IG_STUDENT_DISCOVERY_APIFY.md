# Instagram: поиск студентов aesthetic-академий через Apify

> **SUPERSEDED for CAESTHETIC Phase-1 feed / ICP (2026-08-11).**  
> Academy student discovery must **not** steer `@caesthetic.growth` Phase-1 (US owner-operator ICP).  
> Canon: [`CAESTHETIC_IG_GROWTH_PROGRAM.md`](./CAESTHETIC_IG_GROWTH_PROGRAM.md) §12.1 · DEC-812.  
> Scripts refuse with `PHASE1_FAIL_CLOSE` unless `CAE_PHASE0_STUDENT_VOC_ALLOW=1` (default OFF).  
> Kept as Phase-0 archive runbook only.

Самодостаточная инструкция. Git / внутренние SSOT / доступ к репозиторию **не нужны**. Нужны только Apify-токен и место, куда сохранить результат (таблица / xlsx / Drive).

---

## Цель

Две базы (канон с 2026-08-09):

1. **Schools** — Apify сам находит / обогащает academy handles (`keywordDiscovery` + seed).
2. **Students** — followers школ + likers/commenters/tags их постов → сегментация.

Скрипты: `cae_ig_schools_students_apify.py` · expand `cae_ig_two_base_expand.py` · rebuild `cae_ig_two_base_rebuild.py`  
Кап эталона: **≤ $15** (факт 2026-08-09 wave1+expand: **$13.19** → schools **71**, students **1142**, harvest **20** academies).  
Выход: `dropbox:CAESTHETIC/audience/two-base-2026-08-09/` (`schools.csv`, `students.csv`, `students_priority_a.csv`).

Legacy single-workbook (ниже) остаётся как golden 2026-08-02: школы были **seed-входом**, не отдельной базой.

Это **не** проверка лицензии и **не** готовая база под product-cold DM.

Для **контент-тем / pain clusters** (не лиды) — отдельный lane: `CAESTHETIC_IG_VOC_CONTENT_APIFY.md` (DEC-799).

### Two-base budget bands (≤ $15)

| Lane | Mode (afanasenko profile scraper / post scraper) | Cap USD |
|------|---------------------------------------------------|---------|
| 0 schools discover | `keywordDiscovery` maxCountDiscovery≈40 | ≤ 2.0 |
| 0b seed enrich | `analyzeSpecificAccounts` ~25 seeds | ≤ 2.5 |
| 1 followers | `analyzeFollowersFollowing` 8–10 schools, maxCount≤450 | ≤ 6.5 |
| 2 posts | `apify/instagram-post-scraper` detailedData | ≤ 2.0 |
| 3 engagers | `postEngagementDiscovery` ≤280 | ≤ 3.5 |

Rebuild without spend after raw dumps exist: `python3 scripts/outreach/cae_ig_two_base_rebuild.py`.

---

## Legacy goal (2026-08-02 workbook)

Найти Instagram-юзернеймы людей, связанных со **студентами / выпускниками / trainee** aesthetic-академий:

1. взять аккаунты школ (ручной seed);
2. скачать их свежие посты (теги, меншены, комментарии);
3. собрать уникальные юзернеймы;
4. обогатить публичные профили (bio, email если есть, сайт);
5. разметить: кто кандидат в студенты, кто клиника, кто сама школа.

---

## Что нужно заранее

| Нужно | Зачем |
|--------|--------|
| `APIFY_TOKEN` | запуск акторов |
| Список IG-школ (handles без `@`) | вход Lane B |
| (Опционально) старый список aesthetic-юзернеймов | Lane A — обогащение уже известных |
| Бюджет-кап | не раздувать spend |
| Куда писать результат | Google Sheet / xlsx / CSV — **не** в публичный git |

Проверка токена:

```bash
curl -sS "https://api.apify.com/v2/users/me" \
  -H "Authorization: Bearer $APIFY_TOKEN"
```

---

## Акторы (проверенная связка)

| Шаг | Actor | ID |
|-----|--------|-----|
| Профили (email/bio/сайт) | `afanasenko/instagram-profile-scraper` | `r4hZOdD5FiHYo1bYa` |
| Посты школ | `apify/instagram-post-scraper` | `nH2AHrwxeTRJoN5hX` |

На каждый run ставь `maxTotalChargeUsd`. Не меняй акторы без причины — эта пара уже отработала end-to-end.

---

## Пайплайн (как делали мы)

```text
Pilot (3 профиля) → OK?
        │
        ▼
Lane A (опционально): profile-scrape старого списка юзернеймов
        │
        ▼
Lane B posts: post-scrape аккаунтов школ
        │
        ▼
Из постов вытащить username:
  taggedUsers + mentions + commenters − сами школы − уже известные
        │
        ▼
Lane B profiles: profile-scrape только НОВЫХ username
        │
        ▼
Сегментация + таблица результатов
```

Ориентир по деньгам на полный проход (~40 школ, ~600 старых + ~340 новых профилей): **~$8.5 при капе $20**.

| Шаг | Кап USD | Факт эталона |
|-----|---------|--------------|
| Pilot | 0.10 | ~0.03 |
| Lane A profiles | 5.00 | ~4.43 (443 профиля) |
| Lane B posts | 2.50 | ~1.66 (722 поста) |
| Lane B new profiles | 3.50 | ~2.39 (239 профилей) |
| **Итого** | **≤ 20** | **~8.51** |

---

## Шаг 0 — Pilot

Actor: profile scraper.

Ключевые поля input:

- `operationMode`: `analyzeSpecificAccounts`
- `specificUsernamesList`: 3 известных handle
- `extractEmail`: true
- `extractWebsiteUrl`: true
- `extractPosts`: false
- `maxCountEngagers`: 0
- `maxCountDiscovery`: 0
- options: `maxTotalChargeUsd: 0.10`

Если FAIL → стоп. Полные lane не запускать.

---

## Шаг 1 — Lane A (опционально): обогатить старый список

Тот же profile scraper:

- `specificUsernamesList`: весь исходный список (эталон: ~596 → успешно ~443)
- `extractEmail`: true
- `extractWebsiteUrl`: true
- `extractBusinessCategory`: true
- `extractPosts`: false
- `maxTotalChargeUsd`: ~5.00

Сохрани dataset: username, full name, bio, email, external URL, followers, category.

---

## Шаг 2 — Lane B: посты школ

Actor: `apify/instagram-post-scraper`.

Input-шаблон:

```json
{
  "username": ["school_handle_1", "school_handle_2"],
  "resultsLimit": 20,
  "skipPinnedPosts": true,
  "onlyPostsNewerThan": "2024-08-02",
  "dataDetailLevel": "detailedData"
}
```

- `resultsLimit`: 15–20 постов на школу  
- `onlyPostsNewerThan`: lookback ~12 месяцев  
- **`dataDetailLevel: detailedData`** — обязательно (комменты + tagged users)  
- `maxTotalChargeUsd`: ~2.50  

### Пример seed школ (40 шт., эталонный прогон)

```text
empiremedicaltraining
facialesthetics
nationallaserinst
theaestheticimmersion
aroseinstitute
aestheticmentor
aptinjectiontraining
nainstitute
cbam.aesthetic.board
thmaconsulting
canadiancosmeticacademy
harley_academy
acquisitionaesthetics
derma_medical
interfaceaesthetics
cosmeticcourses
ilamedinternational
primemedtc
dubaiderma
ima_dubai
instituto_inaamed
immesmx
imefc_oficial
anmba_sc
escuelaaminariza
omora.academy
contox.colombia
aacds_australia
aacds_crowsnest
achw.australia
juvae_au
aima_training
cpdinstituteaustralia
cosmeticnurse_trainingacademy
cliniccursos
facial.academy
institutovelasco_play
facop.saopaulo
isbrae
dafaceensino
```

Критерий школы: training / academy / courses для injectors/nurses/dentists. Не путать с обычной medspa-страницей «про услуги пациентам», если у неё нет учебного контура.

Новые школы можно добавлять тем же правилом. После прогона смотри, кто дал больше кандидатов (в эталоне лидировали `dafaceensino`, `thmaconsulting`, `interfaceaesthetics`, `omora.academy`, `ilamedinternational`, `escuelaaminariza`).

---

## Шаг 3 — Вытащить юзернеймы из постов

По каждому посту собрать unique handles из:

1. `taggedUsers[].username`
2. `mentions[]` / @ в caption
3. `latestComments[].ownerUsername` (+ replies, если есть)
4. `coauthorProducers[].username` (часто тренеры/орги — обычно не «студент»)

Выкинуть:

- handle самой школы и её sister-аккаунты;
- уже есть в Lane A / прошлых результатах;
- пустые / битые.

У каждого кандидата сохранить:

- `username`
- `source_academy` (= `ownerUsername` поста)
- `source_post_url`
- тип сигнала: tag / mention / comment

---

## Шаг 4 — Lane B: профили новых username

Снова profile scraper:

- `specificUsernamesList` = только новые (эталон: 344 на входе → ~239 charged)
- `extractEmail`: true
- website + category: true
- posts/engagers: выкл
- `maxTotalChargeUsd`: ~`$0.01 × N` + запас (эталон ~2.39)

---

## Шаг 5 — Сегментация

Каждому профилю — один сегмент:

| Segment | Когда | Приоритет outreach |
|---------|--------|--------------------|
| `academy_post_candidate` | тег/меншен/самоидентификация на посте школы | **A**, если confidence high/medium |
| `student_or_new_practitioner` | в bio явный student / new injector / trainee | **A** (маленький сет) |
| `aesthetic_professional_or_practice` | действующая клиника / injector | **B** — не фреймить как студента |
| `academy_or_training_org` | сама школа / институт | **X** — не в student DM |
| `unclear` / beauty / other | слабый сигнал | **C** — только research, без cold DM |

Confidence:

| Evidence | Confidence |
|----------|------------|
| Прямой tag/mention на graduation/cohort-посте | `high` |
| Коммент «я студент / выпускник / только закончил» | `medium` |
| Просто commenter | `low` |
| Только bio из старого списка, без academy-post | `unverified` |

**Priority A для первого касания** =  
все `academy_post_candidate` с high/medium **+** все `student_or_new_practitioner`.

Эталон: **46** Priority A из **941** всего (344 новых + 597 из старого списка).

Тег на всех: «студент/trainee неверифицирован — username ≠ лицензия».

---

## Шаг 6 — Формат результата

Сделай 4 вкладки/файла:

1. **Summary** — даты, run id Apify, $, counts по сегментам, кап  
2. **Email Contacts** — только уникальные публичные email  
3. **All Usernames** — все handles + segment / confidence / source_academy / source_post_url / bio / followers  
4. **Profile Source Data** — сырой вывод profile scraper по lane  

Имя файла пример: `aesthetic_academy_student_contacts_YYYY-MM-DD.xlsx`

В Summary полезно зафиксировать:

- Total usernames  
- New vs original  
- Profiles with email  
- Academies/orgs excluded  
- Paid runs: units / status / USD  

---

## Как звать Apify API (минимум)

Создать run:

```bash
# posts
curl -sS -X POST \
  "https://api.apify.com/v2/acts/nH2AHrwxeTRJoN5hX/runs?token=$APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": ["harley_academy","interfaceaesthetics"],
    "resultsLimit": 20,
    "skipPinnedPosts": true,
    "onlyPostsNewerThan": "2024-08-02",
    "dataDetailLevel": "detailedData"
  }'
```

В options run (через API body actor input + run options) всегда ограничивай `maxTotalChargeUsd`.

Забрать результат: `defaultDatasetId` из ответа run →  
`GET /v2/datasets/{id}/items`.

Input уже завершённого run:

```bash
# узнать store id
curl -sS "https://api.apify.com/v2/actor-runs/{RUN_ID}" \
  -H "Authorization: Bearer $APIFY_TOKEN"

# INPUT
curl -sS "https://api.apify.com/v2/key-value-stores/{STORE_ID}/records/INPUT" \
  -H "Authorization: Bearer $APIFY_TOKEN"
```

---

## Запрещено

- Считать username = лицензия / право на supply  
- Blind cold-blast всех найденных одним шаблоном  
- Product / filler / toxin pitch в первом касании студентам  
- Скрапить followers graph / engagers farm вместо постов школ (дорого и шумно)  
- Поднимать budget cap молча, если run упёрся в лимит — сначала уменьшить batch  
- Класть PII (email, полные дампы) в публичный репозиторий  

После поиска: сначала warm (лайк/коммент/фоллоу по Priority A), cold DM — только малым капом и с education-нарративом, не product.

---

## Чеклист агента

- [ ] Pilot OK  
- [ ] Lane B: только школы, `detailedData`  
- [ ] Новые username с `source_academy` + URL поста  
- [ ] Профили новых обогащены  
- [ ] Spend ≤ кап, run id записаны  
- [ ] Сегменты + Priority A отделены; школы в Exclude  
- [ ] Результат сохранён вне git (Sheet/xlsx/Drive)  

---

## Эталонный прогон (для сверки)

| | |
|--|--|
| Дата | 2026-08-02 |
| Школ в post-crawl | 40 |
| Всего username | 941 (344 new / 597 original) |
| Org/academy exclude | 18 |
| Email-строк | ~260 |
| Spend | **$8.51** |
| Apify runs | pilot `frLOVvgbE3RCAjAbx` · Lane A `hg5YXsmpcOpwhv37K` · posts `vsu35o3rMBCPLd0hr` · new profiles `ZYpq1ZNRvWZ9hLWiM` |

Повторяй эту логику. Меняй только seed школ / lookback / капы, когда явно просят **новый** discovery pass.
