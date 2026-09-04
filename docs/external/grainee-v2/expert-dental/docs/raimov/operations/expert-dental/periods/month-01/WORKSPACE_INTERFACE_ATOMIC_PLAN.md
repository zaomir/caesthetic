---
title: Expert Dental Workspace — атомарный план закрытия пунктов месяца-1
status: COMPLETE
version: 1.1
created: 2026-08-07
last_updated: 2026-08-08T15:30Z
parent_plan: docs/raimov/operations/expert-dental/periods/month-01/WORKSPACE_INTERFACE_CLOSURE_PLAN.md
plan_points: [1, 4, 5, 7, 8, 10, 11]
surfaces:
  code_workspace: site-raimovdental/public/assets/img/workspace/
  code_render: site-raimovdental/public/assets/img/admin/
  content: site-raimovdental/public/assets/img/workspace/content/
  presentation: site-raimovdental/public/assets/img/workspace/presentation/
  prod_workspace: https://raimovdental.com/assets/img/workspace/
  prod_render: https://raimovdental.com/render/
canon:
  - docs/ssot/EXPERT_DENTAL_MONTH_1_PLAN_AND_REPORTS.md
  - docs/ssot/EXPERT_DENTAL_WORKSPACE_MVP.md
  - docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md
---

# Атомарный план закрытия интерфейсных пунктов месяца-1

Цель каждого атома: **один результат · один владелец · один критерий Done**.  
Не начинать следующий атом без Done предыдущего, если указана зависимость.  
Состав 16 пунктов плана месяца **не меняется** — только закрытие связанных пунктов контентом UI.

## Статус атомов

| Атом | Пункт | Статус | Чем закрыт |
|---|---:|---|---|
| I0.1 | — | ✅ | `workspace/content/scripts-25.json` · commit `00d5c8741` |
| I0.2 | — | ✅ | `workspace/content/recontact-9.json` · followupMatrix ×9 |
| I0.3 | — | ✅ | `workspace/content/patient-path.json` · 14 steps + 3 routes · `60de349db` |
| I0.4 | — | ✅ | `workspace/content/admin-feedback-sop.json` · SOP×8 + 3 platforms |
| I0.5 | — | ✅ | `workspace/content/gaps.md` · gaps 10/11/8 |
| I7.1 | 7 | ✅ | `/render/` кнопка «Скрипты» + modal · `scripts-25.json` · commit `50f9babd5` · prod |
| I7.2 | 7 | ✅ | `/render/` карточка скрипта · goal/body/next_action/dont_say · commit `1f7862106` · prod |
| I7.3 | 7 | ✅ | quick «Стоимость»→S05 / «Страхи»→S08 · guide + catalog openById · commit `d8c76dd78` · prod |
| I7.4 | 7 | ✅ | `/render/` «Повторные касания» · 9 правил · демо-задача · commit `60938dfe4` · prod |
| I7.5 | 7 | ✅ | журнал «пропущен / без результата» + «Вернуть в работу» · commit `6401a234e` · prod |
| I7.6 | 7 | ✅ | admin quiz scripts/recontact · ≥3Q · ≥90% · critical 100% · commit `8a0f946da` · prod |
| I5.1 | 5 | ✅ | урок «Когда просить отзыв» · admin-feedback-sop.json · «Прочитал» · commit `9cd6fc4af` · prod |
| I5.2 | 5 | ✅ | урок «QR и три площадки» · equal Yandex/2GIS/Google · no reward · commit `cee5434f8` · prod |
| I5.3 | 5 | ✅ | post-visit checklist · «визит состоялся» · post_visit_checklist · commit `66d213812` · prod |
| I5.4 | 5 | ✅ | допуск: ≥2 Q отзывы · critical reward 100% · commit `cd8a6c882` · prod |
| I5.5 | 5 | ✅ | % уроков отзывов + «Назначить пересдачу» · commit `1148bd2c3` · prod |
| I4.1 | 4 | ✅ | экран «Путь» · P07–P11 из patient-path.json · `data-atom="i41-patient-path"` · commit `c74443063` · prod |
| I4.2 | 4 | ✅ | route switch veneers\|implants\|ortho · `i42-route-switch` · commit `d48516f7f` · prod |
| I4.3 | 4 | ✅ | демо-кейс позиция P08 · `i43-demo-path-position` · commit `bf51bde2a` · prod |
| I4.4 | 4 | ✅ | gate next action · `i44-next-action-gate` · commit `f8d3a0e5c` · prod |
| I1.1 | 1 | ✅ | единый inbox · `i11-unified-inbox` · каналы звонок/WhatsApp/форма · commit `ac0bd82ab` · prod |
| I1.2 | 1 | ✅ | SLA статусы inbox · `i12-sla-status` · commit `9343bc3db` · prod |
| I1.3 | 1 | ✅ | единая карточка · `i13-inquiry-card` · commit `900042168` · prod |
| I1.4 | 1 | ✅ | чеклист аудита · `i14-inquiry-audit` · демо-нарушение · commit `1af21f5aa` · prod |
| I10.1 | 10 | ✅ | `internal-marketing.json` · therapist/hygienist · draft_pending_clinic · commit `ec302a0cb` |
| I10.2 | 10 | ✅ | бейдж/выбор терапевт\|гигиенист · `i102-doctor-role` · task set · commit `618a5e1a8` · prod |
| I10.3 | 10 | ✅ | урок врача · `i103-internal-lesson` · «Прочитал» · commit `243cbc6d0` · prod |
| I10.4 | 10 | ✅ | «Предложить консультацию узкого» · `i104-propose-consult` · список передач · commit `19facf3ca` · prod |
| I10.5 | 10 | ✅ | контроль создано/принято/потеряно · `i105-referral-metrics` · commit `a4169f73d` · prod |
| I11.1 | 11 | ✅ | `speech-markers-before.json` + `/render/` UI · `i111-speech-markers-before` · commit `f5ea48992` · prod |
| I11.2 | 11 | ✅ | `speech-markers-chair.json` + UI врача · `i112-speech-markers-chair` · commit `0fd9f7942` · prod |
| I11.3 | 11 | ✅ | журнал внутренних передач · `i113-handoff-journal` · от кого→к кому→услуга→статус · commit `ab8d3905e` · prod |
| I11.4 | 11 | ✅ | связка маркер → маршрут · `i114-marker-route` · commit `27061c01c` · prod |
| I11.5 | 11 | ✅ | тест на маркеры · `i115-markers-quiz` · врач + админ · critical 100% · commit `e4f3645bb` · prod |
| I8.1 | 8 | ✅ | `sources.json` · maps/site/instagram/whatsapp/referral/other · commit `047fdb316` |
| I8.2 | 8 | ✅ | обязательный источник · `i82-source-gate` · commit `c4704378f` · prod |
| I8.3 | 8 | ✅ | сводка воронки · `i83-source-funnel` · manager · DEMO_SOURCE_FUNNEL |
| I8.4 | 8 | ✅ | clinic health + источники · `i84-owner-sources` · `/ru/valeria/month-1/plan/` |
| I8.5 | 8 | ✅ | тест «источник обязателен» · `i85-source-quiz` · admin · critical 100% |
| IP.1 | — | ✅ | content pack markers · scripts-25 · recontact-9 · sources · speech markers · admin-feedback-sop |
| IP.2 | — | ✅ | presentation · shots 01–12 · plan-map table 1/4/5/7/8/10/11 |
| IP.3 | — | ✅ | hub «Как презентовать» · сценарий 7→5→4→1→10→11→8 · `ip3-present-scenario` |
| IP.4 | — | ✅ | ED-MAT-060–061 · ED-LINK-037–039 · CHANGELOG 2026-08-08 |
| IP.5 | — | ✅ | prod smoke workspace+/render/+presentation · LAST_RUN success |
| IP.6 | — | ✅ | STATUS.md «закрыто интерфейсом» 1/4/5/7/8/10/11 · граница UI vs план |

Легенда: ⬜ не начат · 🟡 в работе · ✅ done · ⛔ blocked

---

## 0. Границы

| Контур | Трогаем | Не трогаем |
|---|---|---|
| Workspace UI | `workspace/**`, `admin/**` (`/render/`), presentation | patient-site, feedback-hub, Tilda expertdental.kg |
| Контент | JSON/MD в `workspace/content/` из ED-MAT-051 / SOP | Выдуманные отзывы, реальные PHI, обещания рейтинга |
| План месяца | атрибуция к пунктам 1/4/5/7/8/10/11 | Добавление/удаление пунктов 1–16 |
| Runtime next | — | CRM write, PBX, серверные пароли (отдельный этап) |

**Владелец атомов по умолчанию:** workspace-агент / Дмитрий.  
**Приёмка:** curl smoke + тест-маркеры в `tests/raimovdental/workspace-mvp.test.mjs` (+ точечные атомарные asserts).

---

## Фаза I0 — Инвентаризация контента

### I0.1. Каталог 25 скриптов
- **Done:** файл `workspace/content/scripts-25.json` с 25 записями: `id`, `title`, `goal`, `body`, `next_action`, `source_ref`
- **Владелец:** workspace-агент
- **Зависит от:** —
- **Источник:** ED-MAT-051 / ED-LINK-029 (scripts)

### I0.2. Каталог 9 правил повторных касаний
- **Done:** `workspace/content/recontact-9.json`: `id`, `rule`, `channel`, `delay`, `owner_role`, `source_ref`
- **Владелец:** workspace-агент
- **Зависит от:** —
- **Источник:** ED-MAT-051 / ED-LINK-029

### I0.3. Путь пациента + 3 маршрута услуг
- **Done:** `workspace/content/patient-path.json`: 14 этапов + маршруты `veneers|implants|ortho`
- **Владелец:** workspace-агент
- **Зависит от:** —
- **Источник:** ED-MAT-051 / ED-LINK-028

### I0.4. SOP инструкций админа по отзывам (п.5)
- **Done:** `workspace/content/admin-feedback-sop.json`: момент запроса, нейтральные тексты, QR/3 площадки, запреты, чеклист после визита
- **Владелец:** workspace-агент
- **Зависит от:** —
- **Источник:** ED-MAT-051 / ED-LINK-030 + POST_VISIT_FEEDBACK_LOOP (только тексты регламента)
- **Не делать:** деплой Review Hub

### I0.5. Карта пробелов 10 / 11 / 8
- **Done:** `workspace/content/gaps.md` — что берём из SSOT, что требует черновика контента, кто утверждает у клиники
- **Владелец:** workspace-агент
- **Зависит от:** I0.1–I0.4

**DoD фазы I0:** все 4 JSON + `gaps.md` в репо; parent plan Phase 0 = done.

---

## Фаза I7 — Пункт 7 · скрипты (полностью)

### I7.1. Раздел «Скрипты» в UI
- **Done:** в админском контуре есть навигация «Скрипты»; список из `scripts-25.json` открывается без ошибок
- **Владелец:** workspace-агент
- **Зависит от:** I0.1
- **Поверхность:** `/render/` и/или `workspace/admin` work view

### I7.2. Карточка скрипта
- **Done:** у каждого из 25: цель, текст, следующий шаг, «чего не говорить» (если есть в источнике)
- **Владелец:** workspace-агент
- **Зависит от:** I7.1

### I7.3. Сценарии «цена» и «страхи»
- **Done:** быстрые сценарии в `/render/` ведут на соответствующие скрипты; подсказки видны в звонке
- **Владелец:** workspace-агент
- **Зависит от:** I7.2

### I7.4. Экран «Повторные касания»
- **Done:** 9 правил отображаются; из правила создаётся демо-задача: срок · канал · владелец
- **Владелец:** workspace-агент
- **Зависит от:** I0.2, I7.1

### I7.5. Возврат упущенных из журнала
- **Done:** фильтр журнала «пропущен / без результата»; кнопка «Вернуть в работу» создаёт задачу с дедлайном
- **Владелец:** workspace-агент
- **Зависит от:** I7.4

### I7.6. Тест допуска по скриптам
- **Done:** в `Обучение` админа ≥3 вопроса (критические 100%); без pass доступ к работе ограничен
- **Владелец:** workspace-агент
- **Зависит от:** I7.2, I7.4

**DoD пункта 7:** атомы I7.1–I7.6 ✅; админ проходит звонок → скрипт → повторное касание → задачу на упущенное без выхода из UI.

---

## Фаза I5 — Пункт 5 · инструкции админа (остаток)

### I5.1. Урок «Когда просить отзыв»
- **Done:** урок в `Обучение` из `admin-feedback-sop.json`; есть «прочитал»
- **Владелец:** workspace-агент
- **Зависит от:** I0.4, I7.6 (общий каркас обучения)

### I5.2. Урок «QR и три площадки»
- **Done:** равные Яндекс / 2ГИС / Google; запрет reward-for-review; без обещания публикации
- **Владелец:** workspace-агент
- **Зависит от:** I5.1

### I5.3. Чеклист после визита
- **Done:** на смене/обращениях демо-карточка «визит состоялся» → чеклист запроса отзыва
- **Владелец:** workspace-агент
- **Зависит от:** I5.1

### I5.4. Тест по регламенту отзывов
- **Done:** ≥2 вопроса в допуске админа; critical про запрет reward = 100%
- **Владелец:** workspace-агент
- **Зависит от:** I5.2

### I5.5. Контроль у управляющего
- **Done:** % прошедших урок отзывов + «Назначить пересдачу»
- **Владелец:** workspace-агент
- **Зависит от:** I5.4

**DoD пункта 5 (UI):** I5.1–I5.5 ✅. Runtime Review Hub не требуется.

---

## Фаза I4 — Пункт 4 · операционный хвост пути пациента

### I4.1. Экран этапов пути
- **Done:** UI показывает этапы из `patient-path.json`, релевантные персоналу (от обращения → консультация/план)
- **Владелец:** workspace-агент
- **Зависит от:** I0.3

### I4.2. Переключатель маршрута услуги
- **Done:** виниры / импланты / орто меняют подсказки next step
- **Владелец:** workspace-агент
- **Зависит от:** I4.1

### I4.3. Текущая позиция демо-кейса
- **Done:** у демо-обращения виден текущий этап пути
- **Владелец:** workspace-агент
- **Зависит от:** I4.1

### I4.4. Gate «нет next action — нельзя закрыть»
- **Done:** завершение контакта / передачи блокируется без следующего действия
- **Владелец:** workspace-агент
- **Зависит от:** I4.2, I7.2

**DoD пункта 4 (UI):** I4.1–I4.4 ✅; маркетинговый вход «карты→сайт» вне scope.

---

## Фаза I1 — Пункт 1 · обработка заявок

### I1.1. Единый inbox
- **Done:** список обращений с каналами-демо: звонок / WhatsApp / форма
- **Владелец:** workspace-агент
- **Зависит от:** I7.5 (журнал)

### I1.2. Статусы SLA
- **Done:** статусы: новое · в работе · записан · упущен · передан врачу; видны в карточке
- **Владелец:** workspace-агент
- **Зависит от:** I1.1

### I1.3. Единая карточка обращения
- **Done:** канал, потребность, источник (заглушка до I8), next action, владелец — на одной карточке
- **Владелец:** workspace-агент
- **Зависит от:** I1.2

### I1.4. Чеклист аудита обработки у управляющего
- **Done:** экран/карточка «как проверять обработку заявок» + ≥1 демо-нарушение
- **Владелец:** workspace-агент
- **Зависит от:** I1.3

**DoD пункта 1 (UI):** I1.1–I1.4 ✅. Аудит карт/сайта/Instagram вне scope.

---

## Фаза I10 — Пункт 10 · внутренний маркетинг с врачами

### I10.1. Черновик контента терапевта/гигиениста
- **Done:** `workspace/content/internal-marketing.json` (роли, границы, когда направлять)
- **Владелец:** workspace-агент (+ утверждение клиники если medical)
- **Зависит от:** I0.5

### I10.2. Ролевые карточки в интерфейсе врача
- **Done:** выбор/бейдж «терапевт» / «гигиенист» меняет рабочий набор задач
- **Владелец:** workspace-агент
- **Зависит от:** I10.1

### I10.3. Урок внутреннего направления
- **Done:** урок в `Обучение` врача + «прочитал»
- **Владелец:** workspace-агент
- **Зависит от:** I10.1

### I10.4. Действие «Предложить консультацию узкого»
- **Done:** кнопка создаёт внутреннее направление: услуга · причина · next step · получатель · список передач демо · `i104-propose-consult`
- **Владелец:** workspace-агент
- **Зависит от:** I10.2

### I10.5. Контроль у управляющего
- **Done:** метрики демо: создано / принято / потеряно
- **Владелец:** workspace-агент
- **Зависит от:** I10.4

**DoD пункта 10 (UI):** I10.1–I10.5 ✅.

---

## Фаза I11 — Пункт 11 · речевые маркеры

### I11.1. Банк маркеров «до кресла»
- **Done:** `workspace/content/speech-markers-before.json` + UI в админ `/render/` / обучении
- **Владелец:** workspace-агент
- **Зависит от:** I0.5, I7.1

### I11.2. Банк маркеров «в кресле»
- **Done:** `workspace/content/speech-markers-chair.json` + UI врача; блок «когда не говорить»
- **Владелец:** workspace-агент
- **Зависит от:** I10.2

### I11.3. Журнал внутренних передач
- **Done:** запись: от кого → к кому → услуга → статус принятия; видно врачу и управляющему · `i113-handoff-journal` · create/read в обеих ролях
- **Владелец:** workspace-агент
- **Зависит от:** I10.4, I11.2

### I11.4. Связка маркер → маршрут услуги
- **Done:** выбор маркера предлагает виниры / импланты / орто и next step
- **Владелец:** workspace-агент
- **Зависит от:** I11.1, I4.2

### I11.5. Тест на маркеры
- **Done:** тест в обучении врача и админа; critical 100%
- **Владелец:** workspace-агент
- **Зависит от:** I11.1, I11.2

**DoD пункта 11 (UI):** I11.1–I11.5 ✅.

---

## Фаза I8 — Пункт 8 · базовая аналитика источников

### I8.1. Справочник источников
- **Done:** `workspace/content/sources.json`: карты / сайт / Instagram / WhatsApp / рекомендация / другое
- **Владелец:** workspace-агент
- **Зависит от:** I0.5

### I8.2. Обязательный источник в карточке
- **Done:** без источника контакт нельзя закрыть (gate)
- **Владелец:** workspace-агент
- **Зависит от:** I8.1, I1.3

### I8.3. Сводка по источникам у управляющего
- **Done:** обращения → записи → визиты → упущенные (демо-цифры) по источникам
- **Владелец:** workspace-агент
- **Зависит от:** I8.2

### I8.4. Сводка у владельца
- **Done:** clinic health + блок источников + ссылка на план месяца (`/ru/valeria/month-1/plan/`)
- **Владелец:** workspace-агент
- **Зависит от:** I8.3

### I8.5. Тест «источник обязателен»
- **Done:** в обучении админа вопрос про фиксацию источника
- **Владелец:** workspace-агент
- **Зависит от:** I8.2

**DoD пункта 8 (UI):** I8.1–I8.5 ✅.

---

## Фаза IP — Упаковка и приёмка

### IP.1. Расширить automated tests
- **Done:** `workspace-mvp.test.mjs` (или соседний) проверяет маркеры контента: scripts-25 count, recontact-9, sources, speech markers, feedback sop keys
- **Владелец:** workspace-агент
- **Зависит от:** I7.6, I5.5, I4.4, I1.4, I10.5, I11.5, I8.5

### IP.2. Обновить презентацию Атабека
- **Done:** новые скриншоты + таблица «пункт → экран» для 1/4/5/7/8/10/11
- **Владелец:** workspace-агент
- **Зависит от:** IP.1 (логически после функционала; скрины после деплоя контента)

### IP.3. Обновить hub «Как презентовать»
- **Done:** сценарий показа: 7 → 5 → 4 → 1 → 10 → 11 → 8
- **Владелец:** workspace-агент
- **Зависит от:** IP.2

### IP.4. Реестры MATERIALS / LINKS / CHANGELOG
- **Done:** новые ED-MAT/ED-LINK на content pack + обновлённые поверхности; запись в CHANGELOG
- **Владелец:** workspace-агент
- **Зависит от:** IP.2

### IP.5. Deploy + prod smoke
- **Done:** workspace + `/render/` + presentation = 200 / noindex; CTA и ключевые строки на месте
- **Владелец:** workspace-агент
- **Зависит от:** IP.1–IP.4
- **Evidence:** `docs/audits/raimovdental-workspace/`

### IP.6. STATUS: интерфейсное закрытие
- **Done:** в `STATUS.md` для пунктов 1/4/5/7/8/10/11 колонка/блок «закрыто интерфейсом» со ссылкой на атомы; без ложного «пункт плана выполнен», если вне-UI часть ещё открыта
- **Владелец:** workspace-агент
- **Зависит от:** IP.5

**DoD всего атомарного плана:** все атомы ✅; parent closure plan фазы 0–8 = done.

---

## Критический путь (зависимости)

```text
I0.1 ─┬─► I7.1 ► I7.2 ► I7.3
I0.2 ─┤         │
      └─► I7.4 ► I7.5 ► I7.6 ─┬─► I5.* ► …
                              │
I0.3 ──► I4.1 ► I4.2 ► I4.3 ─┴─► I4.4
I0.4 ──► I5.1 ► I5.2 ► I5.3 ► I5.4 ► I5.5
I7.5 ──► I1.1 ► I1.2 ► I1.3 ► I1.4
I0.5 ──► I10.1 ► I10.2 ► I10.3 ► I10.4 ► I10.5
         I11.1 ──────────────► I11.4
         I10.2 ► I11.2 ► I11.3 ► I11.5
I0.5 ──► I8.1 ► I8.2 ► I8.3 ► I8.4 ► I8.5
всё функциональное ──► IP.1 ► IP.2 ► IP.3 ► IP.4 ► IP.5 ► IP.6
```

**Параллель после I0:** подготовка `I10.1` / `I11.1` / `I8.1` контента параллельно с `I7.*`, если не править одни и те же runtime-файлы без координации.

---

## Правило старта следующего атома

1. Предыдущий атом по зависимости = ✅.  
2. Контент только из источника или явно помечен `draft_pending_clinic` в JSON.  
3. Нет реальных телефонов/ФИО пациентов.  
4. После группы атомов пункта — короткий smoke локально; полный prod smoke на IP.5.

---

## Следующий атом к исполнению

**—** · все атомы I0–IP.6 ✅ · parent closure plan фазы 0–8 = done.
