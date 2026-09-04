---
title: Expert Dental Workspace — промпты атомов для копипаста
status: ACTIVE
created: 2026-08-07
atomic_plan: WORKSPACE_INTERFACE_ATOMIC_PLAN.md
usage: Один атом = один новый чат Composer 2.5 Fast. Копируй блок целиком.
---

# Промпты атомов (копипаст)

Перед каждым атомом в Cursor:

1. Модель: **Composer 2.5 Fast**
2. Workdir: `/var/www/grainee-v2`
3. Новый чат на атом
4. После Done — commit/push/deploy по правилам репо

Общий префикс (можно не повторять, если уже в правилах чата) — он уже внутри каждого блока.

---

## I0 — инвентаризация

### I0.1

```text
Атом I0.1 только. Не делай следующие атомы.

Workdir: /var/www/grainee-v2
План: docs/raimov/operations/expert-dental/periods/month-01/WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: выгрузить 25 скриптов из материалов месяца-1 (ED-MAT-051 / ED-LINK-029, отчёт scripts) в файл:
site-raimovdental/public/assets/img/workspace/content/scripts-25.json

Формат каждой записи: id, title, goal, body, next_action, source_ref
Ровно 25 записей. Без выдуманного текста — только из источников. Без PHI.

Done: файл есть, count=25, source_ref заполнен.
Ship: commit + push main. Без UI-правок, без деплоя презентации.
```

### I0.2

```text
Атом I0.2 только. Не делай другие атомы.

Workdir: /var/www/grainee-v2
План: docs/raimov/operations/expert-dental/periods/month-01/WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: выгрузить 9 правил повторных касаний (ED-MAT-051 / ED-LINK-029) в:
site-raimovdental/public/assets/img/workspace/content/recontact-9.json

Формат: id, rule, channel, delay, owner_role, source_ref
Ровно 9 записей. Без выдумок. Без PHI.

Done: файл есть, count=9.
Ship: commit + push main. Только этот файл (+ LAST_SYNC если нужно).
```

### I0.3

```text
Атом I0.3 только.

Workdir: /var/www/grainee-v2
План: WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: путь пациента + 3 маршрута услуг (ED-MAT-051 / ED-LINK-028) →
site-raimovdental/public/assets/img/workspace/content/patient-path.json

Нужно: 14 этапов + маршруты veneers | implants | ortho.
Поля с source_ref. Без выдумок. Без PHI.

Done: JSON валиден, 14 этапов, 3 маршрута.
Ship: commit + push main.
```

### I0.4

```text
Атом I0.4 только. НЕ трогай Review Hub / feedback-hub / clinic.raimovdental.com.

Workdir: /var/www/grainee-v2
План: WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: инструкции админа по отзывам (п.5 плана) →
site-raimovdental/public/assets/img/workspace/content/admin-feedback-sop.json

Включить: момент запроса, нейтральные тексты, QR/3 площадки, запреты (вкл. no reward-for-review), чеклист после визита.
Источники: ED-MAT-051 / ED-LINK-030 + POST_VISIT_FEEDBACK_LOOP (только тексты регламента).

Done: JSON полный для уроков UI. Без деплоя Hub.
Ship: commit + push main.
```

### I0.5

```text
Атом I0.5 только. Зависит от I0.1–I0.4 (должны уже быть в репо).

Workdir: /var/www/grainee-v2
План: WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: карта пробелов для пунктов 10, 11, 8 →
site-raimovdental/public/assets/img/workspace/content/gaps.md

Для каждого пункта: что берём из SSOT, чего нет, нужен ли draft_pending_clinic, кто утверждает.
Отметь I0.1–I0.4 ✅ в WORKSPACE_INTERFACE_ATOMIC_PLAN.md статусной таблице.

Done: gaps.md + обновлённые статусы I0.* в атомарном плане.
Ship: commit + push main.
```

---

## I7 — пункт 7 · скрипты

### I7.1

```text
Атом I7.1 только. Зависит от I0.1.

Workdir: /var/www/grainee-v2
План: WORKSPACE_INTERFACE_ATOMIC_PLAN.md
Контент: site-raimovdental/public/assets/img/workspace/content/scripts-25.json
UI: workspace и/или /render/ (site-raimovdental/public/assets/img/admin/)

Задача: добавить навигацию/раздел «Скрипты» в админском контуре; список грузится из scripts-25.json без ошибок.

Done: раздел открывается, видно все 25 названий.
Ship: commit + push main + deploy workspace/render + curl smoke.
Обнови статус I7.1 в атомарном плане.
```

### I7.2

```text
Атом I7.2 только. Зависит от I7.1.

Workdir: /var/www/grainee-v2
План: WORKSPACE_INTERFACE_ATOMIC_PLAN.md

Задача: карточка скрипта — для каждого из 25 показывать goal, body, next_action, и «чего не говорить» если есть в источнике/JSON.

Done: открытие любого скрипта показывает поля; пустые поля не выдумывать.
Ship: commit + push + deploy + smoke. Статус I7.2 ✅.
```

### I7.3

```text
Атом I7.3 только. Зависит от I7.2.

Workdir: /var/www/grainee-v2
Поверхность: /render/ (assets/img/admin/)

Задача: быстрые сценарии «цена» и «страхи» ведут на соответствующие скрипты; подсказки видны в ходе звонка.

Done: клик сценария открывает нужный скрипт/подсказки.
Ship: commit + push + deploy + smoke. I7.3 ✅.
```

### I7.4

```text
Атом I7.4 только. Зависит от I0.2 и I7.1.

Workdir: /var/www/grainee-v2
Контент: workspace/content/recontact-9.json

Задача: экран «Повторные касания» — показать 9 правил; из правила создать демо-задачу (срок · канал · владелец).

Done: 9 правил видны; задача создаётся в локальном демо-состоянии.
Ship: commit + push + deploy + smoke. I7.4 ✅.
```

### I7.5

```text
Атом I7.5 только. Зависит от I7.4.

Workdir: /var/www/grainee-v2
Поверхность: журнал /render/

Задача: фильтр «пропущен / без результата»; кнопка «Вернуть в работу» создаёт задачу с дедлайном и владельцем.

Done: фильтр работает; задача появляется в очереди смены/задачах.
Ship: commit + push + deploy + smoke. I7.5 ✅.
```

### I7.6

```text
Атом I7.6 только. Зависит от I7.2 и I7.4.

Workdir: /var/www/grainee-v2
Поверхность: workspace app.html · роль admin · Обучение

Задача: ≥3 вопроса по скриптам/повторным касаниям; critical 100%; pass ≥90%; без pass доступ к работе ограничен (как в WORKSPACE_MVP).

Done: тест проходит/валит по правилам; статус допуска меняется.
Ship: commit + push + deploy + smoke. I7.6 ✅. Пункт 7 UI DoD проверить по атомарному плану.
```

---

## I5 — пункт 5 · инструкции отзывов

### I5.1

```text
Атом I5.1 только. Зависит от I0.4 (и каркас обучения после I7.6).

Workdir: /var/www/grainee-v2
Контент: workspace/content/admin-feedback-sop.json

Задача: урок «Когда просить отзыв» в Обучении админа + кнопка «прочитал».

Done: урок виден из sop JSON; подтверждение сохраняется в demo state.
НЕ трогай feedback-hub runtime.
Ship: commit + push + deploy + smoke. I5.1 ✅.
```

### I5.2

```text
Атом I5.2 только. Зависит от I5.1.

Задача: урок «QR и три площадки» — Яндекс / 2ГИС / Google равны; запрет reward-for-review; без обещания публикации рейтинга.

Done: урок в Обучении админа.
Ship: commit + push + deploy + smoke. I5.2 ✅.
```

### I5.3

```text
Атом I5.3 только. Зависит от I5.1.

Задача: демо-карточка «визит состоялся» на смене/обращениях → чеклист запроса отзыва из admin-feedback-sop.json.

Done: чеклист открывается и отмечается в demo state.
Ship: commit + push + deploy + smoke. I5.3 ✅.
```

### I5.4

```text
Атом I5.4 только. Зависит от I5.2.

Задача: ≥2 вопроса в допуске админа по регламенту отзывов; вопрос про запрет reward — critical 100%.

Done: тест влияет на допуск.
Ship: commit + push + deploy + smoke. I5.4 ✅.
```

### I5.5

```text
Атом I5.5 только. Зависит от I5.4.

Задача: у управляющего — % прошедших урок отзывов + кнопка «Назначить пересдачу».

Done: видно на экране Команда/обучение.
Ship: commit + push + deploy + smoke. I5.5 ✅.
```

---

## I4 — пункт 4 · путь пациента

### I4.1

```text
Атом I4.1 только. Зависит от I0.3.

Контент: workspace/content/patient-path.json
Задача: экран/блок этапов пути пациента (от обращения до консультации/плана) для админа и/или врача.

Done: этапы из JSON отображаются.
Ship: commit + push + deploy + smoke. I4.1 ✅.
```

### I4.2

```text
Атом I4.2 только. Зависит от I4.1.

Задача: переключатель маршрута услуги veneers | implants | ortho меняет подсказки next step.

Done: смена маршрута меняет UI-подсказки.
Ship: commit + push + deploy + smoke. I4.2 ✅.
```

### I4.3

```text
Атом I4.3 только. Зависит от I4.1.

Задача: у демо-обращения видна текущая позиция на пути пациента.

Done: позиция отображается на карточке кейса.
Ship: commit + push + deploy + smoke. I4.3 ✅.
```

### I4.4

```text
Атом I4.4 только. Зависит от I4.2 и I7.2.

Задача: нельзя закрыть контакт/передачу без next action (gate).

Done: UI блокирует завершение без следующего действия; есть понятное сообщение.
Ship: commit + push + deploy + smoke. I4.4 ✅.
```

---

## I1 — пункт 1 · обработка заявок

### I1.1

```text
Атом I1.1 только. Зависит от I7.5.

Задача: единый inbox обращений с каналами-демо: звонок / WhatsApp / форма.

Done: список виден в админском work/inbox.
Ship: commit + push + deploy + smoke. I1.1 ✅.
```

### I1.2

```text
Атом I1.2 только. Зависит от I1.1.

Задача: статусы SLA: новое · в работе · записан · упущен · передан врачу — на карточке и в списке.

Done: статусы переключаются в demo state.
Ship: commit + push + deploy + smoke. I1.2 ✅.
```

### I1.3

```text
Атом I1.3 только. Зависит от I1.2.

Задача: единая карточка обращения: канал, потребность, источник (можно заглушка до I8), next action, владелец.

Done: все поля на одной карточке.
Ship: commit + push + deploy + smoke. I1.3 ✅.
```

### I1.4

```text
Атом I1.4 только. Зависит от I1.3.

Задача: у управляющего чеклист аудита обработки заявок + ≥1 демо-нарушение.

Done: экран/карточка видна в роли manager.
Ship: commit + push + deploy + smoke. I1.4 ✅.
Не заявляй, что закрыт аудит карт/Instagram — только обработка заявок.
```

---

## I10 — пункт 10 · внутренний маркетинг

### I10.1

```text
Атом I10.1 только. Зависит от I0.5.

Задача: создать workspace/content/internal-marketing.json
Роли терапевт/гигиенист, границы, когда направлять на виниры/импланты/орто.
Если medical-формулировки не из SSOT — пометь draft_pending_clinic. Без PHI. Без выдуманных кейсов пациентов.

Done: JSON есть.
Ship: commit + push main (контент). I10.1 ✅.
```

### I10.2

```text
Атом I10.2 только. Зависит от I10.1.

Задача: в интерфейсе врача бейдж/выбор «терапевт» / «гигиенист» меняет набор задач.

Done: переключение роли меняет UI.
Ship: commit + push + deploy + smoke. I10.2 ✅.
```

### I10.3

```text
Атом I10.3 только. Зависит от I10.1.

Задача: урок внутреннего направления в Обучении врача + «прочитал».

Done: урок из internal-marketing.json.
Ship: commit + push + deploy + smoke. I10.3 ✅.
```

### I10.4

```text
Атом I10.4 только. Зависит от I10.2.

Задача: кнопка «Предложить консультацию узкого» создаёт внутреннее направление: услуга · причина · next step · получатель.

Done: направление видно в списке задач/передач (демо).
Ship: commit + push + deploy + smoke. I10.4 ✅.
```

### I10.5

```text
Атом I10.5 только. Зависит от I10.4.

Задача: у управляющего демо-метрики: создано / принято / потеряно внутренних направлений.

Done: метрики на экране Команда.
Ship: commit + push + deploy + smoke. I10.5 ✅.
```

---

## I11 — пункт 11 · речевые маркеры

### I11.1

```text
Атом I11.1 только. Зависит от I0.5 и I7.1.

Задача: workspace/content/speech-markers-before.json + UI маркеров «до кресла» для админа (/render/ или обучение).
Без выдуманных медсоветов; draft_pending_clinic если нет канона.

Done: JSON + отображение в UI.
Ship: commit + push + deploy + smoke. I11.1 ✅.
```

### I11.2

```text
Атом I11.2 только. Зависит от I10.2.

Задача: workspace/content/speech-markers-chair.json + UI врача «в кресле» + блок «когда не говорить».

Done: JSON + экран врача.
Ship: commit + push + deploy + smoke. I11.2 ✅.
```

### I11.3

```text
Атом I11.3 только. Зависит от I10.4 и I11.2.

Задача: журнал внутренних передач: от кого → к кому → услуга → статус принятия; видно врачу и управляющему.

Done: запись создаётся и читается в обеих ролях.
Ship: commit + push + deploy + smoke. I11.3 ✅.
```

### I11.4

```text
Атом I11.4 только. Зависит от I11.1 и I4.2.

Задача: выбор маркера предлагает маршрут veneers|implants|ortho и next step.

Done: связка маркер → маршрут работает в UI.
Ship: commit + push + deploy + smoke. I11.4 ✅.
```

### I11.5

```text
Атом I11.5 только. Зависит от I11.1 и I11.2.

Задача: тест на маркеры в обучении врача и админа; critical 100%.

Done: тест влияет на допуск.
Ship: commit + push + deploy + smoke. I11.5 ✅.
```

---

## I8 — пункт 8 · источники

### I8.1

```text
Атом I8.1 только. Зависит от I0.5.

Задача: workspace/content/sources.json
Значения: карты / сайт / Instagram / WhatsApp / рекомендация / другое.

Done: JSON есть.
Ship: commit + push. I8.1 ✅.
```

### I8.2

```text
Атом I8.2 только. Зависит от I8.1 и I1.3.

Задача: обязательный источник в карточке обращения — без источника нельзя закрыть контакт (gate).

Done: блокировка + сообщение.
Ship: commit + push + deploy + smoke. I8.2 ✅.
```

### I8.3

```text
Атом I8.3 только. Зависит от I8.2.

Задача: сводка у управляющего — обращения → записи → визиты → упущенные по источникам (демо-цифры + логика).

Done: экран/блок виден в manager.
Ship: commit + push + deploy + smoke. I8.3 ✅.
```

### I8.4

```text
Атом I8.4 только. Зависит от I8.3.

Задача: у владельца — clinic health + блок источников + ссылка на https://raimovdental.com/ru/valeria/month-1/plan/

Done: экран owner обновлён.
Ship: commit + push + deploy + smoke. I8.4 ✅.
```

### I8.5

```text
Атом I8.5 только. Зависит от I8.2.

Задача: в обучении админа вопрос «источник обязателен» в допуске.

Done: вопрос в тесте.
Ship: commit + push + deploy + smoke. I8.5 ✅.
```

---

## IP — упаковка

### IP.1

```text
Атом IP.1 только. Делай после функциональных атомов I7/I5/I4/I1/I10/I11/I8.

Задача: расширить tests/raimovdental/workspace-mvp.test.mjs (или соседний тест):
проверка наличия/счётчиков scripts-25, recontact-9, sources, speech markers, admin-feedback-sop keys.

Done: node tests/raimovdental/workspace-mvp.test.mjs (и связанные) PASS после build/preserve.
Ship: commit + push. IP.1 ✅.
```

### IP.2

```text
Атом IP.2 только.

Задача: обновить презентацию Атабека
site-raimovdental/public/assets/img/workspace/presentation/
Новые скриншоты + таблица «пункт плана → экран» для 1/4/5/7/8/10/11.
Скриншоты только с live/local UI, без мокапов.

Done: презентация обновлена.
Ship: commit + push + deploy presentation + smoke. IP.2 ✅.
```

### IP.3

```text
Атом IP.3 только. Зависит от IP.2.

Задача: обновить hub workspace/index.html блок «Как презентовать владельцу» — сценарий 7 → 5 → 4 → 1 → 10 → 11 → 8.

Done: текст сценария на хабе.
Ship: commit + push + deploy + smoke. IP.3 ✅.
```

### IP.4

```text
Атом IP.4 только.

Задача: MATERIALS_REGISTER + LINKS_REGISTER + CHANGELOG для content pack и обновлённых поверхностей (новые ED-MAT/ED-LINK по свободным ID).

Done: реестры без коллизий ID.
Ship: commit + push. IP.4 ✅.
```

### IP.5

```text
Атом IP.5 только.

Задача: deploy workspace + /render/ + presentation на raimovdental.com; prod curl 200 + noindex; ключевые строки на месте.
Evidence: docs/audits/raimovdental-workspace/ (новый или обновлённый LAST_RUN / PRESENTATION).

Done: smoke PASS, evidence файл.
Ship: commit evidence + push. IP.5 ✅.
```

### IP.6

```text
Атом IP.6 только. Зависит от IP.5.

Задача: в periods/month-01/STATUS.md для пунктов 1/4/5/7/8/10/11 добавить блок «закрыто интерфейсом» со ссылками на атомы.
Не помечай пункт плана «Выполнено» целиком, если вне-UI часть ещё открыта.
Обнови статусы всех атомов ✅ в WORKSPACE_INTERFACE_ATOMIC_PLAN.md.

Done: STATUS честный; атомарный план закрыт.
Ship: commit + push. IP.6 ✅.
```

---

## Порядок копипаста (чеклист)

```text
I0.1 → I0.2 → I0.3 → I0.4 → I0.5
→ I7.1 → I7.2 → I7.3 → I7.4 → I7.5 → I7.6
→ I5.1 → I5.2 → I5.3 → I5.4 → I5.5
→ I4.1 → I4.2 → I4.3 → I4.4
→ I1.1 → I1.2 → I1.3 → I1.4
→ I10.1 → I10.2 → I10.3 → I10.4 → I10.5
→ I11.1 → I11.2 → I11.3 → I11.4 → I11.5
→ I8.1 → I8.2 → I8.3 → I8.4 → I8.5
→ IP.1 → IP.2 → IP.3 → IP.4 → IP.5 → IP.6
```
