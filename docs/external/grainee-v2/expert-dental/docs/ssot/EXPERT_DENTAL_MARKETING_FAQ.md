---
owner: Expert Dental / RAIMOV ops
status: active
version: 1.1
updated: 2026-08-14
scope: clinic marketing/admin FAQ — doctors, services, consultation fees, slot durations + workbook prices
parent: docs/ssot/RAIMOV.md
source: docs/temp/Ответы на вопросы маркетинг.pdf + .rtf (2026-08-14); Pages original same day
---

# Expert Dental — ответы на маркетинговые вопросы (врачи / запись)

## 1. Purpose and authority

This file is the canonical **clinic briefing** for reception, WhatsApp, ads and site copy about **who treats what, how long a slot is, and which consultation tariff applies**.

It transcribes the founder-dropped Apple Pages document «Ответы на вопросы» for Expert Dental Studio. It does **not** replace:

| Subject | Still canonical |
|---|---|
| Ala-carte / Care 12 prices (site canon) | `docs/raimov/operations/expert-dental/pricing/PRICE_CATALOG.json` |
| Full workbook extract (110 rows, service↔price) | `docs/raimov/operations/expert-dental/pricing/MARKETING_FAQ_PRICE_WORKBOOK.md` |
| Public-fact status / publish gates | `docs/ssot/RAIMOV_PUBLIC_PROFILE.md` (DEC-727/728) |
| Live Tilda specialty for Мир-Али | `DOCTORS_REGISTER.md` — **гнатолог** (`clinic_instructed` 2026-08-05) |
| Patient-site team JSON | empty until clinic + medical/copy gate |

Do not copy this briefing onto `raimovdental.com` or `expertdental.kg` without the usual clinic + medical wording gate.

## 2. Source and conflicts

- **Ingested:** 2026-08-14. Same document in three files under `docs/temp/` (gitignored): `.pages`, `.pdf` (22 pp, exported 2026-08-14 19:03), `.rtf`.
- **Pages metadata:** `2022-08-19T17:14:53+0600`, locale `ru_KG`. Treat as a clinic operations brief, not as a dated override of 2026-08 confirmed prices.
- **Price tables:** 110 rows reconstructed reliably from RTF table cells (columns: № · услуга · клиника · цена · единица · длительность). Names cross-checked against Pages IWA strings. Full extract: `MARKETING_FAQ_PRICE_WORKBOOK.json` / `.md`.
- **Do not overwrite** `PRICE_CATALOG.json`. Workbook overlaps most ala-carte numbers and adds SKUs the catalog never listed (All-on-4/6, named brace systems, CBCT, splint package, ortho activations).

### Conflicts that newer SSOT wins

| Topic | This briefing | Newer canon (wins) |
|---|---|---|
| Мир-Али — роль | врач хирург-ортопед | **Гнатолог** · хирург-имплантолог, ортопед (`clinic_instructed` 2026-08-05) |
| Мир-Али — консультация ортопедия/импланты | 550 сом | **1 500 сом** (согласовано 2026-08-04) |
| TM-006 фамилия | **Куримкулова** | На сайте Expert Dental: **Керимкулова**. Keep both; do not silently rename |

Гнатология 5 000 + МРТ ВНЧС и орто-консультация Атабека 3 000 **совпадают** с текущим прайсом.

## 3. Clinic-wide booking rules

1. Default slot is **45 minutes**, including consultation.
2. Installing orthodontic appliances (braces, plates, and similar) is **not** a 45-minute default — the doctor states the time.
3. For complex procedures, reception **must ask the doctor** for the procedure time before confirming the slot.
4. Gnathology consult (Атабек / Мир-Али): **5 000 сом**, patient **must bring TMJ MRI**.
5. «Общие» врачи (терапевт / ортодонт кроме Атабека / хирург-ортопед кроме актуального тарифа Мир-Али): consultation **550 сом**.
6. Only **Атабек** bills orthodontic consultation at **3 000 сом**. Other orthodontists in this briefing are **550 сом**. This answers open Q12 in `QUESTIONS_FOR_ATABEK_ASSISTANT_2026-08-05.md`.

## 4. Doctor cards (from the briefing)

IDs TM-001…TM-008 match `RAIMOV_PUBLIC_PROFILE.md` §7. TM-009…TM-011 are **new** in this source (not on the 2026-07-21 Expert Dental site snapshot).

### TM-001 — Раимов Атабек Саидович

- **Role in briefing:** врач ортодонт-гнатолог
- **Treats:** orthodontics for children and adults, **adult treatment is the priority**. Braces, aligners, alignment plates. Gnathology for adults **from age 14**: joint pain, muscle pain, chewing fatigue, headaches. Pre-prosthetic preparation. Axiography, digital TMJ diagnostics.
- **Consultation:** 45 min · ortho **3 000 сом** · gnathology **5 000 сом** (bring TMJ MRI)
- **Slots:** all visits 45 min except appliance installation (doctor specifies)

### TM-002 — Талышханов Мир-Али

- **Role in briefing:** врач хирург-ортопед → **superseded specialty label:** гнатолог (2026-08-05)
- **Treats:** implantation and related (gum plastics, etc.). Prosthodontics on teeth and implants: veneers, crowns, overlays. Gnathology for adults **from age 14** (same symptom list as Атабек).
- **Consultation in briefing:** 550 сом · gnathology **5 000 сом** (bring TMJ MRI)
- **Consultation now:** orthopedics/implants **1 500 сом** (2026-08-04) · gnathology **5 000 сом**
- **Slots:** consult 45 min · extraction **1 hour** · wisdom tooth **1.5 hours or more** · 1 implant **1.5 hours** · prosthetics (prep + impressions/scan) **from 1.5 hours**

### TM-003 — Грибанова Марина Николаевна

- **Role:** врач стоматолог-терапевт
- **Treats:** adult therapy **from age 12**: caries, root canals, professional hygiene. Artistic restoration of anterior and posterior teeth.
- **Consultation:** 45 min
- **Slots:** caries 1 tooth **1.5 hours** · hygiene **1 hour** · 1-root / anterior endo **1 hour + 1 hour filling = 2 hours** · 2–3-root endo **2 hours + 1 hour filling = 3 hours**

### TM-004 — Халбаев Исламбек Якубжанович

- **Role:** врач хирург-ортопед
- **Treats:** implantation and related (gum plastics, etc.). Prosthodontics on teeth and implants: crowns, overlays (veneers **not** listed).
- **Consultation:** 550 сом · 45 min
- **Slots:** same surgical/prosthetic timings as Мир-Али in this briefing (extraction 1 h / wisdom 1.5+ / implant 1.5 h / prosthetics from 1.5 h)

### TM-005 — Дуйшеева Айдай Болотовна

- **Role in briefing:** врач детский и взрослый ортодонт (site quote was «Стоматолог - ортодонт»)
- **Treats:** orthodontics for children and adults. Braces, aligners, alignment plates.
- **Consultation:** 45 min · **550 сом**
- **Slots:** 45 min except appliance installation (doctor specifies)

### TM-006 — Керимкулова / Куримкулова Айпери Турсуналиевна

- **Role in briefing:** врач стоматолог-терапевт · therapy **from age 10 under microscope**: caries, canals, hygiene, artistic restoration
- **Site quote (2026-07-21):** «терапевт - гигиенист» · spelling **Керимкулова**
- **Consultation:** 45 min
- **Slots:** same therapy timings as Грибанова

### TM-007 — Эргешова Бегимай Эргешовна

- **Role:** врач стоматолог-терапевт (briefing typo «терапев»)
- **Treats:** adult therapy **from age 12**: caries, canals, hygiene, artistic restoration
- **Consultation:** 45 min
- **Slots:** same therapy timings as Грибанова

### TM-008 — Таалайбекова Чолпон Таалайбековна

- **Role:** врач стоматолог-терапевт, детский и взрослый
- **Treats:** children **and** adults, **children are the priority**: caries, canals, hygiene, sealing of primary teeth
- **Consultation:** 45 min
- **Slots:** same adult therapy timings; **primary/children’s teeth: 30 minutes less**

### TM-009 — Исакулов Амир Равшанбекович *(new vs 2026-07-21 site snapshot)*

- **Role:** врач стоматолог-терапевт-ортопед
- **Treats:** adult therapy **from age 12 under microscope**: caries, canals, hygiene; ceramic crowns and overlays; artistic restoration
- **Consultation:** 45 min
- **Slots:** same therapy timings as Грибанова

### TM-010 — Акрамов Асадбек Илхомович *(new vs 2026-07-21 site snapshot)*

- **Role:** врач цифровой ортодонт
- **Treats:** **adult** orthodontics. Braces, aligners, alignment. Also **axiography** and intraoral scanning.
- **Consultation:** 45 min · **550 сом**
- **Slots:** 45 min except appliance installation (doctor specifies)

### TM-011 — Гусейнов Намик Рамильевич *(new vs 2026-07-21 site snapshot)*

- **Role:** врач цифровой ортодонт
- **Treats:** orthodontics for children and adults. Braces, aligners, plates. Also **axiography** and intraoral scanning.
- **Consultation:** 45 min · **550 сом**
- **Slots:** 45 min except appliance installation (doctor specifies)

## 5. Duration cheat-sheet (reception)

| Procedure | Book |
|---|---|
| Typical visit / consult | 45 min |
| Ortho appliance install (braces, plates, …) | ask the doctor |
| Complex / unspecified procedure | ask the doctor |
| Extraction | 1 hour |
| Wisdom tooth | 1.5 hours or more |
| 1 implant | 1.5 hours |
| Prosthetics: prep + impressions/scan | from 1.5 hours |
| Hygiene | 1 hour |
| Caries, 1 tooth | 1.5 hours |
| Endo, 1-root / anterior + filling | 2 hours |
| Endo, 2–3 roots + filling | 3 hours |
| Primary tooth (Таалайбекова) | adult time minus 30 min |

## 6. Consultation tariff cheat-sheet

Use **current** prices (briefing + later clinic confirms):

| Visit type | Who | Price |
|---|---|---|
| Orthodontic consult | Атабек only | 3 000 сом |
| Gnathology | Атабек or Мир-Али | 5 000 сом · bring TMJ MRI |
| Orthopedics / implants consult | Мир-Али | 1 500 сом *(2026-08-04; briefing 550 is stale)* |
| General consult | other listed doctors | 550 сом |

Axiography as a **priced diagnostic** remains **80 000 сом** in `PRICE_CATALOG.json`. This briefing only says who *performs* axiography/scanning (Атабек, Акрамов, Гусейнов) — it does not restate that fee.

## 7. Editorial / ads use

- Safe for **internal** admin, WhatsApp routing and slot planning.
- Public copy may use role + age floor + «консультация 45 минут» only after clinic OK.
- Do not invent mentor lists, case counts, or «лучший/единственный».
- Do not publish TM-009…TM-011 on patient-site until the clinic confirms they are still on the roster and photo/bio rights exist.
- Distinguish consultation price from treatment price. Treatment quotes stay with `PRICE_CATALOG.json` after examination.

## 8. Price workbook (PDF/RTF)

110 rows: `docs/raimov/operations/expert-dental/pricing/MARKETING_FAQ_PRICE_WORKBOOK.md`.

Pairs are reliable (RTF `\cell`). This is **not** a publish gate and does not replace `PRICE_CATALOG.json`.

Commercially new vs catalog (ask clinic before site/ads):

| Workbook | Price | Slot |
|---|---:|---|
| All-on-4 Megagen + PMMA | 300 000 | 5 ч |
| All-on-6 Megagen + PMMA | 400 000 | 6 ч |
| Цирконий на титановой балке | 250 000 | 2 ч |
| Damon Q Ormco | 90 000 | 2 ч |
| biomim Orthoclassic | 88 000 | 2 ч |
| Orthoclassic H4 | 180 000 | 2 ч |
| OC H4 | 150 000 | 2 ч |
| Сплинт-терапия (аксиография + скан + каппа) | 55 000 | 1 ч |
| КЛКТ | 6 500 | 30 мин |
| Наращивание кости (ретромоляр) | 10 000 | 2,5 ч |
| Виниры (одна цифра, не E-max 33 000) | 26 400 | 1,5 ч |

Damon Ormco **9 000** looks like a different/incomplete package next to Damon Q **90 000** — do not publish.

## 9. Full first-page transcription

Normalized from the Pages body (punctuation lightly cleaned; meaning unchanged):

> **Ответы на вопросы**
>
> **Раимов Атабек Саидович** — врач ортодонт-гнатолог. Ортодонтическое лечение детей и взрослых, в приоритете взрослое лечение. Брекет-система, элайнеры, пластины, выравнивание зубов. Гнатологическое лечение взрослых с 14 лет. Боли в суставах, мышечные боли, усталость при жевании, головные боли. Подготовка к протезированию. Аксиография, цифровая диагностика ВНЧС. Время консультации — 45 минут. Стоимость консультации ортодонтической 3000 сом. Гнатологическая консультация 5000 сом (при себе иметь МРТ ВНЧС). Все приёмы 45 минут, за исключением установки ортодонтических аппаратов — брекет-система, пластины и т.д. (на такие процедуры обычно доктор сам говорит, сколько времени нужно оставлять).
>
> **Талышханов Мир-Али** — врач хирург-ортопед. Имплантация и всё, что связано с ней (пластика десны и т.д.). Ортопедическое лечение. Протезирование на зубах и имплантах, виниры, коронки, накладки и т.д. Гнатологическое лечение взрослых с 14 лет. Боли в суставах, мышечные боли, усталость при жевании, головные боли. Консультация 550 сом. Важно! Гнатологическая консультация — 5000 сом (при себе иметь МРТ ВНЧС). Время консультации 45 минут. Время для удаления зубов 1 час, для зубов мудрости 1,5 часа и более. Время для имплантации — 1,5 часа на 1 имплантат. Время для протезирования — обточка, снятие слепков (сканирование) — от 1,5 часов и более.
>
> **Грибанова Марина Николаевна** — врач стоматолог-терапевт. Терапевтическое лечение взрослых пациентов с 12 лет: лечение кариеса, лечение каналов, профессиональная гигиена полости рта и т.д. Художественная реставрация фронтальных и боковых зубов. Время консультации 45 минут. Время лечения кариеса 1 зуба 1,5 часа. Гигиена полости рта 1 час. Время лечения каналов 1-корневых зубов (передние зубы 1 час) + всегда учитывать пломбирование таких зубов +1 час, в общем 2 часа. Лечение каналов 2–3-корневых зубов 2 часа + 1 час пломбирование зуба, в общем 3 часа.
>
> **Халбаев Исламбек Якубжанович** — врач хирург-ортопед. Имплантация и всё, что связано с ней (пластика десны и т.д.). Ортопедическое лечение. Протезирование на зубах и имплантах, коронки, накладки и т.д. Консультация 550 сом. Время консультации 45 минут. Время для удаления зубов 1 час, для зубов мудрости 1,5 часа и более. Время для имплантации — 1,5 часа на 1 имплантат. Время для протезирования — обточка, снятие слепков (сканирование) — от 1,5 часов и более.
>
> **Дуйшеева Айдай Болотовна** — врач детский и взрослый ортодонт. Ортодонтическое лечение детей и взрослых. Брекет-система, элайнеры, пластины, выравнивание зубов. Время консультации — 45 минут. Стоимость консультации ортодонтической 550 сом. Все приёмы 45 минут, за исключением установки ортодонтических аппаратов — брекет-система, пластины и т.д. (на такие процедуры обычно доктор сам говорит, сколько времени нужно оставлять).
>
> **Куримкулова Айпери Турсуналиевна** — врач стоматолог-терапевт. Терапевтическое лечение взрослых пациентов с 10 лет под микроскопом: лечение кариеса, лечение каналов, профессиональная гигиена полости рта и т.д. Художественная реставрация фронтальных и боковых зубов. Те же тайминги, что у Грибановой.
>
> **Эргешова Бегимай Эргешовна** — врач стоматолог-терапевт. Терапевтическое лечение взрослых пациентов с 12 лет: кариес, каналы, гигиена, художественная реставрация. Те же тайминги.
>
> **Таалайбекова Чолпон Таалайбековна** — врач стоматолог-терапевт, детский и взрослый. Терапевтическое лечение детей и взрослых (в приоритете дети): кариес, каналы, гигиена, герметизация молочных зубов. Те же тайминги; детские зубы по времени на полчаса меньше.
>
> **Исакулов Амир Равшанбекович** — врач стоматолог-терапевт-ортопед. Терапия взрослых с 12 лет под микроскопом; протезирование — керамические коронки, накладки; художественная реставрация. Те же терапевтические тайминги.
>
> **Акрамов Асадбек Илхомович** — врач цифровой ортодонт. Ортодонтическое лечение взрослых. Брекет-система, элайнеры, выравнивание зубов. Консультация 45 минут, 550 сом. Также проводит аксиографию и сканирование зубов. Слоты 45 минут, кроме установки аппаратов.
>
> **Гусейнов Намик Рамильевич** — врач цифровой ортодонт. Ортодонтическое лечение детей и взрослых: брекет-система, элайнеры, пластины. Консультация 45 минут, 550 сом. Также проводит аксиографию и сканирование зубов. Слоты 45 минут, кроме установки аппаратов.
>
> **Важно!** На сложные процедуры уточнять время самой процедуры у докторов.
