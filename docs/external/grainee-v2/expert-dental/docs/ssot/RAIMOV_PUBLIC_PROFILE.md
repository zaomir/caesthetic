# RAIMOV_PUBLIC_PROFILE.md — living SSOT публичной информации

**Версия:** 1.3
**Дата:** 2026-08-14  
**Статус:** LIVING / INTERNAL — **не** готовый patient-site bio  
**Репозиторий:** `zaomir/grainee-v2` · `main`  
**DEC:** DEC-727 (evidence gates), DEC-728 (этот SSOT = канон накопления)  
**Evidence pack:** `research/raimov-profile/`  
**Codex public-ready subset:** `research/raimov-profile/RAIMOV_PUBLIC_PROFILE.md` (only gated public facts)  
**Codex access handoff:** `research/raimov-profile/evidence/CODEX_ACCESS_HANDOFF.md`  
**Patient site:** `https://raimovdental.com` · код `site-raimovdental/`  
**Rights:** founder confirmed 2026-07-21 → archive OK (`research/raimov-profile/RIGHTS_GRANT.md`); patient-site copy still medical/copy-gated

**Strategy/evidence boundary (DEC-864):** RAIMOV WHOLE PERSON, Whole-Person Assessment, Study Club and Treatment Planning Intensive are owner-approved strategy/product directions, not credentials or proof of launched programmes. They do not make any new clinical claim publishable and do not override the evidence statuses below.

---

## 0. Зачем этот файл

Единая точка, куда складываем **всю публично наблюдаемую и локально зафиксированную** информацию про:

- Раимова Атабека Саидовича / Atabek Raimov;
- бренды **Expert Dental Studio** и **RAIMOV DENTAL**;
- врачей / команду;
- контакты, карты, соцсети, события, медиа.

Файл **будем дополнять**. Новые данные — только через §13 (Append log) + строка в таблице с источником и статусом.

### Правила (жёстко)

1. Пишем **наблюдение + источник**, не домысел.
2. HTTP 200 / найденный URL ≠ «официально подтверждено клиникой».
3. **Expert Dental Studio** и **RAIMOV DENTAL** — разные бренд-ярлыки, пока клиника письменно не подтвердит связь/переход.
4. Специальности, ВНЧС, «автор протокола», Академия-как-программа, рейтинги, «400+ работ», отзывы пациентов — **не** в публичный patient-site без clinic + (где нужно) medical review / rights.
5. Запрещённые бренды в публичных текстах: Saidov Dental · Saidov System · Saidov Academy · Atabek Saidov.
6. Автопубликация в `site-raimovdental/src/data/*` из этого SSOT **запрещена** без отдельного gate.

---

## 1. Словарь статусов (DEC-727)

| Статус | Смысл |
|---|---|
| `repo_reference_only` | Только в нашем репо / черновике |
| `discovered` | Увидели на публичной странице / в HTML |
| `needs_manual_validation` | Нужна ручная проверка карточки (Maps и т.п.) |
| `clinic_confirmation_required` | Нужно письмо/пакет от клиники |
| `clinic_brief` | Есть во внутреннем брифе клиники; на публичном сайте на дату снимка не подтверждено |
| `third_party_unverified` | Справочник / агрегатор / зеркало |
| `unverified` | Упоминание есть, первоисточника нет |
| `rights_pending` | Нет прав на использование медиа |
| `excluded` | Нельзя тащить на patient-site (PII, отзывы, спекуляции) |

**Publish gate для patient-site:** статус сам по себе не открывает публикацию. Нужны clinic OK + medical/rights где указано + правка SSOT/JSON.

Редакционные ярлыки A/B/C/D/E: `research/raimov-profile/FACT_EDITORIAL_CLASSIFICATION.md`.

---

## 2. Brand lock (канон имён)

| Токен | Источник | Статус | Примечание |
|---|---|---|---|
| RAIMOV DENTAL | `site-raimovdental/src/config/site.ts` | `repo_reference_only` | Канонический бренд patient-site |
| RAIM SMILE SYSTEM | `site.ts` + doctor draft | `repo_reference_only` | Черновая пациентская/клиническая система; не «авторский протокол» без gate |
| Raimov Academy | `site.ts` | `repo_reference_only` | **Brand token**, не доказанный работающий образовательный проект |
| Atabek Raimov / Атабек Раимов | `site.ts`, doctor JSON, публичные страницы | `discovered` / `repo_reference_only` | Публичное имя |
| Раимов Атабек Саидович | clinic site + drafts | `discovered` | Полное ФИО на expertdental.kg |

---

## 3. Сущности брендов / клиник

| ID | Сущность | Что известно | Статус | Источники |
|---|---|---|---|---|
| ENT-001 | Expert Dental Studio / «Эксперт дентал студия» | Публичный сайт клиники; title «Стоматология "Эксперт дентал студия"» | `discovered` | https://www.expertdental.kg · probe 2026-07-21 |
| ENT-002 | RAIMOV DENTAL | Patient-site бренд + host `raimovdental.com`; title «RAIMOV DENTAL — комплексная стоматология в Бишкеке» | `discovered` + `repo_reference_only` | https://raimovdental.com · `site.ts` |
| ENT-003 | Связь ENT-001 ↔ ENT-002 | Общий телефон/адрес в источниках; юридическая/брендовая тождественность **не** установлена | `clinic_confirmation_required` | offer SSOT + site configs — **не** утверждать как одну юрсущность |
| ENT-004 | Юрлицо / лицензии | Не зафиксированы в публичном каноне | `clinic_confirmation_required` | `CONTENT_REQUIRED_FROM_CLINIC.md` |

Внутренний коммерческий контекст (не публичный факт): `docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md` — ЛПР Раимов, рост Expert Dental, закрытый offer на caesthetic.com.

---

## 4. Персона — Раимов Атабек Саидович

### 4.1 Установленные наблюдения (не credential proof)

| ID | Поле | Значение | Статус | Источник | Patient-site? |
|---|---|---|---|---|---|
| P-001 | Полное ФИО | Раимов Атабек Саидович | `discovered` | expertdental.kg doctor card | После clinic OK |
| P-002 | Публичное имя | Атабек Раимов / Atabek Raimov | `repo_reference_only` + `discovered` | `site.ts`, raimovdental.com | После clinic OK |
| P-003 | Самоописание роли на сайте Expert Dental (цитата) | «Ортодонт - гнатолог, Функциональный стоматолог» | `discovered` + `clinic_confirmation_required` + medical review | expertdental.kg | **Нет** как факт до OK |
| P-004 | Маркетинговый био-текст Expert Dental (цитата, сокращ.) | Упоминания спикерства DemMed, ОртоКомьюнити, курсов, «более 400 завершенных работ», основатель Expert brands; ВНЧС-формулировки в карточке | `unverified` / marketing | expertdental.kg | Case count / ВНЧС / membership → **не публиковать** без gate |
| P-005 | Официальная должность (patient-site) | `null` / `pending_clinic_confirmation` | `repo_reference_only` | `doctor.ru.json` | Нет |
| P-006 | Education / certificates / publications / speaking (JSON) | Пустые массивы | `repo_reference_only` | `doctor.ru.json` | Нет |
| P-007 | RAIM SMILE SYSTEM | Диагностика → проектирование → консилиум → поэтапный план → наблюдение; без франшизы ELITE DENTAL | `repo_reference_only` | `doctor.ru.json` `raimovSystemRole` | Черновик; medical review |
| P-008 | Фото | `photo.src = null`; исторический файл в другом контуре | `rights_pending` | doctor JSON · MED-001 | Нет |

### 4.2 Что сознательно НЕ фиксируем как факт

- Подтверждённая специализация ВНЧС / гнатология как лицензированный scope
- Авторство «диагностического протокола» шире черновика RAIM SMILE SYSTEM
- Существование работающей Raimov Academy как образовательной программы
- Принадлежность Instagram `@doctor_raimov` без clinic OK
- DOB / био с who.ca-news.org (`excluded`)

---

## 5. Контакты и локация

| ID | Поле | Значение | Статус | Источники |
|---|---|---|---|---|
| C-001 | Телефон / WhatsApp | +996 555 255 455 (`+996555255455`) | `discovered` на Expert Dental; также в `site.ts` | expertdental.kg · `site.ts` · wa.me |
| C-002 | Адрес (кратко) | г. Бишкек, ул. Киевская, 88 | `discovered` / `repo_reference_only` | expertdental.kg · `site.ts` · offer |
| C-003 | Адрес (расширенный, внутренний) | Киевская 88, Первомайский р-н, Бишкек, 720040; пер. бульвар Эркиндик (на сайте) | `discovered` / `clinic_confirmation_required` для канона | offer · expertdental.kg |
| C-004 | Email | пусто в `site.ts` | `clinic_confirmation_required` | `site.ts` |
| C-005 | Часы | «По предварительной записи» / By appointment | `repo_reference_only` | `site.ts` |
| C-006 | 2GIS firm id | `70000001089655879` | `needs_manual_validation` | offer · audit JSON · probe |
| C-007 | Yandex house URL | из `site.ts` / raimovdental.com | `needs_manual_validation` | `site.ts` |
| C-008 | Google Maps | search URL; Place ID **не** зафиксирован | `needs_manual_validation` | audit JSON |
| C-009 | Доп. телефоны в 2GIS payload (наблюдение) | +996557255455, +996755294385 | `unverified` | research note — **не** публиковать без clinic |

---

## 6. Публичные каналы

| ID | Канал | URL | Статус | Patient-site link? |
|---|---|---|---|---|
| CH-001 | Expert Dental website | https://www.expertdental.kg | `discovered` | После clinic OK на brand policy |
| CH-002 | RAIMOV DENTAL | https://raimovdental.com | `discovered` | n/a (сам сайт) |
| CH-003 | Instagram clinic | https://www.instagram.com/expert_dental_studio/ | `discovered` + rights | После OK |
| CH-004 | Instagram doctor handle | https://www.instagram.com/doctor_raimov/ | `clinic_confirmation_required` | Нет до ownership OK |
| CH-005 | Telegram | https://t.me/doctor_raimov | `clinic_confirmation_required` | После OK |
| CH-006 | WhatsApp | https://wa.me/996555255455 | `discovered` + clinic OK for canon | После OK |
| CH-007 | 2GIS | https://2gis.kg/bishkek/firm/70000001089655879 | `needs_manual_validation` | После OK; **без** рейтинга |
| CH-008 | Google Maps search | query Expert Dental + Kyivskaya 88 | `needs_manual_validation` | Нужен Place ID |
| CH-009 | Yandex Maps house | URL из site config | `needs_manual_validation` | После OK |
| CH-010 | YDoc directory | https://ydoc.kg/bishkek/vrach/48904-raimov/ | `third_party_unverified` | Research only; отзывы `excluded` |
| CH-011 | CA-News who | https://who.ca-news.org/people:62637 | `third_party_unverified` | **`excluded`** (PII/DOB) |
| CH-012 | Congress listing | https://bishkek.events/event/stomatologicheskij-kongress/ | `discovered` | После clinic + medical wording |
| CH-013 | GorodWiki reviews | kg.gorodwiki.ru … expert-dental … | `third_party_unverified` | **`excluded`** |
| CH-014 | Instagram @mir_ali55 | linked from expertdental.kg | `clinic_confirmation_required` | Нет до roster OK |

Полный access report: `research/raimov-profile/EXTERNAL_ACCESS_REPORT.md`.

---

## 7. Команда / врачи

### 7.1 Состояние patient-site

`site-raimovdental/src/data/team.ru.json` → **`members: []`**. Lead stub: Атабек Раимов, role `TBD`.  
**Не заполнять** из таблицы ниже без clinic consent + права на фото/био.

### 7.2 Обнаружено на публичном сайте Expert Dental (2026-07-21)

Строки **ролей — цитаты с сайта**, не наши подтверждённые credentials.

| ID | ФИО (как на сайте) | Роль (цитата) | Статус | Patient-site? |
|---|---|---|---|---|
| TM-001 | Раимов Атабек Саидович | Ортодонт - гнатолог, Функциональный стоматолог | `discovered` | Нет до OK |
| TM-002 | Талышханов Мир-Али | **Гнатолог** · хирург-имплантолог, ортопед | `clinic_instructed` 2026-08-05 (было: Хирург-имплантолог, Ортопед) | Tilda specialty update pending; photo asset in ops media/team |
| TM-003 | Грибанова Марина Николаевна | Врач стоматолог - терапевт | `discovered` | Нет до OK |
| TM-004 | Халбаев Исламбек Якубжанович | Врач хирург - ортопед | `discovered` | Нет до OK |
| TM-005 | Дуйшеева Айдай Болотовна | Врач Стоматолог - ортодонт | `discovered` + clinic brief: детский и взрослый ортодонт | Нет до OK |
| TM-006 | Керимкулова Айпери Турсуналиевна | Врач Стоматолог терапевт - гигиенист | `discovered` · briefing spelling **Куримкулова**; терапия с 10 лет под микроскопом | Нет до OK |
| TM-007 | Эргешова Бегимай Эргешовна | Врач Стоматолог - терапевт | `discovered` | Нет до OK |
| TM-008 | Таалайбекова Чолпон Таалайбековна | Детский и взрослый врач - стоматолог терапевт | `discovered` · briefing: приоритет дети, герметизация молочных | Нет до OK |
| TM-009 | Исакулов Амир Равшанбекович | Стоматолог-терапевт-ортопед | `clinic_brief` 2026-08-14 · нет на сайте 2026-07-21 | Нет до roster + OK |
| TM-010 | Акрамов Асадбек Илхомович | Цифровой ортодонт | `clinic_brief` 2026-08-14 · нет на сайте 2026-07-21 | Нет до roster + OK |
| TM-011 | Гусейнов Намик Рамильевич | Цифровой ортодонт | `clinic_brief` 2026-08-14 · нет на сайте 2026-07-21 | Нет до roster + OK |

Источник ролей TM-001…TM-008: https://www.expertdental.kg (doctor cards, 2026-07-21).  
Источник услуг / консультаций / слотов: `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md` (Pages-бриф клиники, ingest 2026-08-14).  
Маркетинговые био-абзацы врачей **не** копируем в patient-site без clinic + medical review.

Mentors named in TM-002 bio (Бернацкий, Юров, Ярошевич) — внешние преподаватели, **не** штат клиники.

---

## 8. Услуги / коммерческий фокус (наблюдения)

| ID | Наблюдение | Статус | Источник | Примечание |
|---|---|---|---|---|
| S-001 | На Expert Dental заявлены направления имплантация / виниры / ортодонтия (и др.) | `discovered` | expertdental.kg · audit JSON | Не прайс RAIMOV |
| S-002 | Публичная страница цен Expert Dental `/price` | `discovered` | http://expertdental.kg/price | Не переносить цены без утверждённого прайса |
| S-003 | Внутренний offer: All-on-4/6, ВНЧС, сложная ортодонтия как коммерческий фокус | `unverified` / internal | EXPERT_DENTAL_GROWTH_OFFER | Не публичный medical claim |
| S-004 | Focus areas в doctor draft (диагностика, виниры, имплантация, ортодонтия взрослых, полное восстановление) | `repo_reference_only` · `publishable: false` | doctor.ru.json | Pending clinic |

---

## 9. Выступления / события

Канон-реестр: `research/raimov-profile/SPEAKING_REGISTER.md`.

| ID | Наблюдение | Статус | Архив |
|---|---|---|---|
| E-001 / SPK-001 | Listing: спикер «Атабек Раимов @doctor_raimov», тема «Микроимпланты в ортодонтии (минивинты)»; DemMed; 16.03.2024 Ош / 30.03.2024 Бишкек | `discovered` | `evidence/pages/congress-bishkek-events.html` · `evidence/excerpts/speaking-demmed-congress-2024.md` |
| E-002 / SPK-002 | Первичный PDF/программа DemMed | `needs_manual_validation` | не получен |

---

## 10. Медиа, тексты, упоминания (после прав 2026-07-21)

**Права на архив:** подтверждены основателем → `research/raimov-profile/RIGHTS_GRANT.md`.  
**Patient-site publish** клинических формулировок по-прежнему требует medical/copy gate.

| Реестр | Путь | Содержание |
|---|---|---|
| Media | `research/raimov-profile/MEDIA_MANIFEST.json` | ~91 items / ~18 MB: portraits + expertdental/Tilda assets + SHA-256 |
| Texts | `research/raimov-profile/TEXTS_REGISTER.md` | выдержки био врачей, meta, speaking |
| Mentions | `research/raimov-profile/MENTIONS_REGISTER.md` | сайты / соц / карты / справочники |
| Speaking | `research/raimov-profile/SPEAKING_REGISTER.md` | SPK-001+ |
| Pages | `research/raimov-profile/evidence/pages/` | HTML captures |
| Excerpts | `research/raimov-profile/evidence/excerpts/` | markdown цитаты |

| ID | Актив | Статус архива | Примечание |
|---|---|---|---|
| MED-PORTRAIT-001…004 | `media/portraits/atabek-*` | archive OK | исторические портреты + hero SVG |
| MED-ED-* | `media/clinic/` + `media/team/` | archive OK | скачано с expertdental.kg / Tilda CDN |
| MED-IG | Instagram feeds | не bulk-архивированы | только handles в MENTIONS |
| TXT-002 | Doctor cards (8 ФИО + био-цитаты) | archive OK | medical review перед patient-site |

---

## 11. Черновик patient-site (repo snapshot)

| Область | Состояние | Путь |
|---|---|---|
| Brand / contacts | Заполнены черновые phone, address, mapsUrl | `site-raimovdental/src/config/site.ts` |
| Doctor | Большинство полей `pending_clinic_confirmation` / `publishable: false` | `src/data/doctor.ru.json` |
| Team | `members: []` | `src/data/team.ru.json` |
| Checklist от клиники | Открыт | `site-raimovdental/CONTENT_REQUIRED_FROM_CLINIC.md` |
| Compact clinic packet | Research | `research/raimov-profile/CLINIC_PENDING_PACKET.md` |

---

## 12. Открытые пробелы (дополнять сюда чеклистом)

- [ ] Письменное подтверждение связи Expert Dental ↔ RAIMOV DENTAL / юрлицо
- [ ] Канонические Maps URLs (Google Place ID, 2GIS, Yandex org)
- [ ] Ownership Instagram/Telegram doctor handles
- [ ] Official title + specializations (medical review)
- [ ] Education / certificates
- [x] Media archive rights (founder 2026-07-21) — photos/texts archived
- [ ] Team roster: выбрать кого публиковать на RAIMOV DENTAL + medical wording
- [ ] Approved RAIM SMILE SYSTEM / Academy wording
- [ ] Speaking: DemMed primary PDF / доп. выступления
- [ ] Written license PDF (если counsel потребует сверх founder grant)
- [ ] Price list для RAIMOV DENTAL
- [ ] Email / hours schedule

---

## 13. Append log (как дополнять)

Формат новой строки в логе:

```text
YYYY-MM-DD | who | section ID(s) added/changed | source URL or path | status | notes
```

| Date | Who | Change | Source | Status |
|---|---|---|---|---|
| 2026-07-21 | Cursor | v1.0 initial living SSOT from research pack + public HTML observations | expertdental.kg, raimovdental.com, bishkek.events, repo | mixed — see tables |
| 2026-07-21 | Cursor | v1.1 media+texts+speaking archive after «право получено» | `research/raimov-profile/media|evidence|TEXTS|SPEAKING|MENTIONS|RIGHTS_GRANT` | archive OK; patient-site still gated |
| 2026-07-21 | Cursor | Pointer to Codex path `research/raimov-profile/RAIMOV_PUBLIC_PROFILE.md` + CODEX_ACCESS_HANDOFF | research pack | docs link only |
| 2026-08-14 | Cursor | v1.2 team +3 (TM-009…011); clinic briefing for services/slots | `EXPERT_DENTAL_MARKETING_FAQ.md` ← Pages drop | `clinic_brief`; not patient-site |

**Процедура агента:**

1. Добавить/обновить строку в нужной таблице (§3–10).
2. Добавить строку в Append log.
3. При внешнем URL — обновить `research/raimov-profile/EXTERNAL_ACCESS_REPORT.md` / probes при необходимости.
4. **Не** трогать `site-raimovdental/src/data/*` без явного publish-gate.
5. Закоммитить SSOT (+ INDEX если новый файл).

---

## 14. Связанные файлы

| Файл | Роль |
|---|---|
| `research/raimov-profile/RAIMOV_PUBLIC_PROFILE.md` | Codex public-ready subset |
| `research/raimov-profile/evidence/CODEX_ACCESS_HANDOFF.md` | Codex access matrix (no secrets) |
| `research/raimov-profile/README.md` | Evidence pack principles |
| `research/raimov-profile/RIGHTS_GRANT.md` | Founder rights confirmation |
| `research/raimov-profile/MEDIA_MANIFEST.json` | Photo/image archive + SHA |
| `research/raimov-profile/TEXTS_REGISTER.md` | Text excerpts index |
| `research/raimov-profile/SPEAKING_REGISTER.md` | Speaking inventory |
| `research/raimov-profile/MENTIONS_REGISTER.md` | Mentions inventory |
| `research/raimov-profile/FACT_REGISTER.csv` | Observation facts Commit-1 |
| `research/raimov-profile/FACT_EDITORIAL_CLASSIFICATION.md` | A/B/C/D/E triage |
| `research/raimov-profile/SOURCE_REGISTER.md` | Local sources |
| `research/raimov-profile/PUBLIC_CHANNELS.md` | Channel discovery |
| `research/raimov-profile/CLINIC_PENDING_PACKET.md` | Clinic ask list |
| `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md` | Clinic briefing: who treats what, consult fees, slot times |
| `docs/ssot/EXPERT_DENTAL_GROWTH_OFFER.md` | Internal growth offer (Expert Dental) |
| `docs/ssot/PRACTICE_GROWTH_BLUEPRINT.md` | Blueprint; Expert Dental first instance |
| `site-raimovdental/CONTENT_REQUIRED_FROM_CLINIC.md` | Publish checklist |
| `docs/founder-notes/DEC-727_*.md` | Evidence status gates |
| `docs/founder-notes/DEC-728_*.md` | This SSOT as living canon |

---

*RAIMOV_PUBLIC_PROFILE v1.2 · 2026-08-14 · living document · archive rights granted · not auto patient-site copy*


---

## Append log

### 2026-07-21 — Founder attestation / Commit-3 partial publish

- Carrier: founder chat — clinic confirmation is canonical; full packet in lawyer archive (not ingested).
- Evidence: `research/raimov-profile/evidence/clinic-packet/FOUNDER_ATTESTATION.md`
- Patient-site unlocked: role, specializations, contacts, maps, Expert Dental as related brand, DemMed speaking.
- Still blocked: education/certificates lists, portrait, team members[], license numbers.
- ENT-003: public brand relationship **clinic_confirmed** for patient-facing link; legal-entity numbers remain counsel-only.
