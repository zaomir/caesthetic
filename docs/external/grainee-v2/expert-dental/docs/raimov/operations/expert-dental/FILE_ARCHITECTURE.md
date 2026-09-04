---
title: Expert Dental Studio — архитектура файлов
status: CANON
version: 1.0
created: 2026-08-03
last_updated: 2026-08-14
---

# Архитектура файлов проекта Expert Dental

## Назначение

Архитектура разделяет:

- неизменные решения и стратегию;
- планы по периодам;
- фактический статус исполнения;
- промежуточные и итоговые отчёты;
- созданные материалы;
- внешние и внутренние ссылки;
- шаблоны;
- историю изменений.

Она не заменяет родительскую архитектуру `docs/ssot/RAIMOV_ECOSYSTEM_PROJECT_ARCHITECTURE.md`.

## Каноническое дерево

```text
docs/raimov/operations/expert-dental/
├── README.md
├── FILE_ARCHITECTURE.md
├── PLANNING_AND_REPORTING.md
├── MATERIALS_REGISTER.md
├── LINKS_REGISTER.md
├── CHANGELOG.md
├── DOCTORS_REGISTER.md
├── pricing/
│   ├── PRICE_CATALOG.json   ← clinic-confirmed SSOT
│   ├── PRICE_TABLE.md
│   ├── MARKETING_FAQ_PRICE_WORKBOOK.md  ← PDF/RTF extract, not catalog override
│   └── QUESTIONS_FOR_ATABEK_ASSISTANT_2026-08-05.md
├── reputation/
│   ├── POST_VISIT_FEEDBACK_LOOP.md       ← CSAT / отзывы / recovery (DEC-787)
│   └── IMPLEMENTATION_PLAN_ATOMIC.md     ← атомы внедрения на clinic.raimovdental.com
├── periods/
│   └── month-01/
│       ├── PLAN.md
│       ├── STATUS.md
│       └── reports/
│           ├── README.md
│           └── 2026-08-02-first-two-weeks.md
└── templates/
    ├── REPORT_TEMPLATE.md
    └── MATERIAL_ENTRY_TEMPLATE.md
```

Врачи / консультации / слоты (не прайс лечения): `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md`.

Tilda Zero Block прайса: `docs/projects/raimovdental/tilda/price-table-zero-block.html`.

Новые периоды создаются по модели:

```text
periods/<period-id>/
├── PLAN.md
├── STATUS.md
└── reports/
    ├── README.md
    ├── <YYYY-MM-DD>-interim-<slug>.md
    └── <YYYY-MM-DD>-final.md
```

## Границы ответственности файлов

| Файл | Что хранит | Чего не хранит |
|---|---|---|
| `README.md` | маршрутизацию и канонические источники | подробные планы и отчёты |
| `FILE_ARCHITECTURE.md` | дерево, правила имён и границы | бизнес-стратегию |
| `PLANNING_AND_REPORTING.md` | процесс планирования и отчётности | фактический отчёт конкретного периода |
| `MATERIALS_REGISTER.md` | каждый созданный артефакт | показатели без материального результата |
| `LINKS_REGISTER.md` | все подтверждённые или предоставленные URL | придуманные или предполагаемые URL |
| `PLAN.md` | утверждённый состав работ периода | выполненные результаты |
| `STATUS.md` | текущую операционную картину по пунктам плана | новую стратегию и новые задачи |
| `reports/*.md` | факты за конкретный отчётный срез | неподтверждённые выводы |
| `CHANGELOG.md` | изменения архитектуры и реестров | ежедневный рабочий журнал |

## Правила именования

- Периоды: `month-01`, `month-02`, далее по фактическому согласованию.
- Промежуточные отчёты: `<YYYY-MM-DD>-interim-<slug>.md`.
- Итоговый отчёт: `<YYYY-MM-DD>-final.md`.
- Материалы получают постоянный ID `ED-MAT-###`.
- Ссылки получают постоянный ID `ED-LINK-###`.
- После присвоения ID не переиспользуется для другого объекта.

## Правило единственного писателя

- Стратегические решения меняются только в соответствующем SSOT.
- Состав первого месяца меняется только в `docs/ssot/EXPERT_DENTAL_MONTH_1_PLAN_AND_REPORTS.md` по прямой команде пользователя.
- Операционный статус меняется в `periods/<period>/STATUS.md`.
- Клиентская веб-витрина генерируется из `site-raimovdental/work-reports/content.mjs` и является производным представлением, а не отдельным источником истины.
- `MATERIALS_REGISTER.md` и `LINKS_REGISTER.md` обновляются вместе с созданием или передачей материала.

## Протокол нового материала

Перед завершением любой задачи по Expert Dental необходимо:

1. определить связанный пункт плана или пометить материал как вне текущего периода;
2. присвоить `ED-MAT-###`;
3. записать название, тип, владельца, статус, путь к источнику и дату;
4. добавить URL в `LINKS_REGISTER.md`, если он существует;
5. указать материал в соответствующем отчёте;
6. не записывать пациентские данные, пароли или секреты.

## Что хранится вне этого каталога

| Класс | Каноническая зона |
|---|---|
| Стратегия | `docs/ssot/EXPERT_DENTAL*.md`, `docs/ssot/RAIMOV*.md` |
| Публичная и клиентская веб-реализация | `site-raimovdental/` |
| Сайт клиники и его канон | `docs/ssot/EXPERT_DENTAL_WEBSITE_SSOT.md` и Tilda |
| Исследования и аудиты | `docs/research/raimov/`, `docs/audits/raimov/` |
| Профиль и доказательства Атабека | `research/raimov-profile/` |
| Медицинские и персональные данные | только в разрешённых системах клиники, не в Git |
