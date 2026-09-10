---
owner: CAESTHETIC
status: active
version: 1.0.0
created: 2026-09-10
updated: 2026-09-10
scope: three Russian single-location report presentations
authority: presentation variants only
operating_ssot: docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
---

## Report access — owner decision 2026-09-10

Cases, reports and manager-review pages open by direct link without a password by default. Set a password only on a direct instruction for the named page/package, recorded with its source. Preserve noindex, catalog rules and diagnostic review status. Authority: `docs/ssot/CAESTHETIC_GROWTH_SCORE_ACCESS_STANDARD.md`. Earlier mandatory PIN/password language is superseded; private catalog visibility is not authentication.


# Три представления отчёта CAESTHETIC

## 1. Что читать агенту

Этот файл является единой инструкцией по сборке **v6, v6.1 и v6.2**.
Пользователь 10 сентября 2026 запросил два русских представления:
v6.1 в формате Expert; v6.2 со структурой и аккуратностью v6,
конкретикой и «До / После» из Expert. Для обеих новых версий прямо задано
точное соответствие оформлению Expert.

Порядок чтения:

1. Этот SSOT: версии, поля, дизайн и сборка.
2. `CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md#canonical-authoring-route`: исследование и выпуск.
3. Пакет клиента: факты, источники, приоритеты и состояние согласования.
4. `../caesthetic/design/report-presentations/example.ru.json`: только пример заполнения.

Новая версия оформления не является новым исследованием, моделью оценки или продуктом.
По умолчанию остаётся v6. Запрос «три версии» означает сборку всех трёх из одного набора данных.
Работа с шаблонами не запускает интервью о новом клиенте.

## 2. Выбор версии

| Версия | Структура | Дизайн | Контракт |
|---|---|---|---|
| v6 | Действующая компактная форма: введение, предложение, четыре вопроса, вывод, план, внутренний путь, реализация | Согласованное оформление Spoken v6 | `growth-score-client/v6.0.0` |
| v6.1 | Последовательный разбор как у Expert: 16 разделов от диагноза до финального вывода | Точный исходный CSS Expert | `growth-score-client/v6.1.0` |
| v6.2 | Короткий диагноз, четыре вопроса, подтверждения, «До / После», три результата за 30 дней, следующий шаг | Тот же CSS Expert; компактная подача | `growth-score-client/v6.2.0` |

v6.1 и v6.2 пока имеют только русский языковой контракт.
Схема исследования остаётся `schemaVersion: 5`; версия представления хранится отдельно.

## 3. Точное оформление Expert

Источник: `site-caesthetic/private/expert-dental/index.html`.
Git blob: `7680e492b8679a52feaf14621f6a7dcb35b468a3`.

Исходные блоки CSS извлечены без переписывания в
`scripts/caesthetic/report-expert/expert.css`. Контрольная сумма:
`../caesthetic/design/report-presentations/source-manifest.json`.
Сборка останавливается при изменении исходного Expert до явного пересмотра референса.

Сохраняются фон `#07060b`, акцент `#f07bf2`, градиенты, системный шрифт с Inter,
ширина 1180px, крупные заголовки, радиусы 20–30px, закреплённое горизонтальное
меню, номера разделов, `.platform-panel`, `.platform-shot`, `.highlight` и `.table-wrap`.
Это заданное пользователем исключение для двух профилей, не новая палитра сайта.

`interaction.css` содержит дополнения для новых элементов, клавиатуры,
мобильного отображения, контраста кнопок, якорей и печати. Исходный CSS
остаётся отдельным проверяемым файлом. Пароль, gate.js, контакты клиента,
рейтинги, цены клиники и тексты Expert в шаблон не переносятся.
Не перерисовывать дизайн «по мотивам» и не подключать поверх него CSS маркетингового сайта.

## 4. Один набор данных

Во всех версиях совпадают бизнес, локация, дата, ограничения, факты,
источники, оценки, главный вывод, ровно один главный и два поддерживающих
приоритета в одинаковом порядке, работы, критерии готовности, отложенные
расходы, цена, условия и статус согласования.

Общий клиентский текст: `presentation.v6`. Дополнение: `presentation.expert`.

| Поле дополнения | Что заполнять |
|---|---|
| `diagnosis_title`, `diagnosis` | Короткий заголовок и вывод из тех же фактов |
| `platforms` | Ровно Search, Website, Social, Reputation: наблюдение, значение, действие, источники |
| `platforms[].screenshot` | Снимок, alt, подпись, ID источника; `null`, если снимка нет |
| `services`, `pricing`, `education`, `review_response` | Детализация исследованных тем для v6.1 |
| `risks` | Подтверждённые наблюдения, их значение и исправления |
| `before_after` | Три строки по ID и порядку плана: сейчас, планируемое состояние, проверка |
| `sources` | Уникальный ID, название, HTTPS-адрес и дата проверки |

Все `evidence_refs` разрешаются в реестре источников и в исходном отчёте.
Скриншот связан с источником своей площадки. «После» означает план до проверки
внедрения, не достигнутый эффект. Не добавлять неподтверждённые потери или
прирост выручки. Пробелы данных не превращать в нули, плохие оценки или новые
проблемы. Дополнительная детализация не создаёт новые приоритеты.

Для снимков предпочтительны HTTPS-адреса или пути от корня сайта. Если путь
относительный, агент размещает файл относительно каждой выходной папки версии;
сборщик не загружает и не копирует доказательства автоматически.

## 5. Готовые файлы

Каталог: `docs/caesthetic/design/report-presentations/`.

- `template.v6.ru.json`, `template.v6.1.ru.json`, `template.v6.2.ru.json`: пустые шаблоны полного отчёта.
- `preview.v6.ru.html`, `preview.v6.1.ru.html`, `preview.v6.2.ru.html`: автономные HTML-примеры.
- `example.ru.json`: явно учебные данные, не доказательства и не реальный клиент.
- `source-manifest.json`: происхождение дизайна и контрольная сумма.

HTML открывается напрямую. Пустой JSON не проходит выпуск до заполнения и
существующих проверок. Места для скриншотов видны только в учебных примерах.
В реальном отчёте нет снимка: изображение не показывается, текст и источники остаются.

## 6. Команды

Создать отдельный пустой шаблон:

```bash
node scripts/caesthetic/growth-score-report-template.mjs --presentation v6 --locale ru
node scripts/caesthetic/growth-score-report-template.mjs --presentation v6.1 --locale ru
node scripts/caesthetic/growth-score-report-template.mjs --presentation v6.2 --locale ru
```

Программно: `createGrowthScorePresentationTemplate({version: "v6.2", locale: "ru"})`.
Заполнить общий `presentation.v6` и `presentation.expert` один раз.

Собрать три представления проверенного отчёта:

```bash
node scripts/caesthetic/build-report-presentations.mjs \
  --report path/to/approved-report.json \
  --out site-caesthetic/score/client-0123456789abcdef
```

Slug выше является примером. Для клиента нужен новый непредсказуемый ID.
Результат: `v6/`, `v6.1/`, `v6.2/`, в каждом `report.json` и `index.html`.
`presentations.json` фиксирует одинаковый SHA-256 фактов всех трёх версий.
Все версии проходят проверку до записи результатов. Исходный отчёт не изменяется.

Собрать одну заполненную версию:

```bash
node scripts/caesthetic/render-growth-score.mjs --report path/to/report.json --out path/to/index.html
```

Действующий рендерер проверяет схему, доказательства и согласование до выбора дизайна.
Сборка не публикует отчёт. Для размещения зарегистрировать реальные маршруты
и общую группу доступа, затем выполнить обычные publication/access QA.
Не перезаписывать замороженную опубликованную v6 без задания на миграцию.

## 7. Сетевые аудиты

Эта поставка добавляет представления **одной локации** по референсу Expert.
Она не заменяет Royal Petrol и действующий Multi-Location-контракт.
Сеть сохраняет общий отчёт, выбор человеком одной точки и отдельный полный
моно-аудит, общий Top 3 и единую коммерческую точку решения.
Не удалять `audit.format=multi_location` или роль дочернего отчёта ради запуска рендерера.
Адаптация новых профилей для сетевого родителя и потомка является отдельным
изменением с сохранением матрицы локаций, охвата и правил CTA.

## 8. Проверка и передача

```bash
node scripts/caesthetic/build-report-presentation-templates.mjs --check
node --test tests/caesthetic/growth-score-expert-presentations.test.mjs
node scripts/caesthetic/report-presentations-browser-qa.mjs
```

Проверить 320, 390, 768 и 1440px; меню, якоря, клавиатуру, раскрытия,
читаемость таблиц, печать и отсутствие горизонтальной прокрутки всей страницы.
Один основной переход к реализации и два Check-блока сохраняются;
скидки Spoken не становятся условиями нового клиента.

Для передачи агенту достаточно ссылки на этот SSOT и пути к пакету клиента:
«Из одного проверенного русского набора фактов собери v6, v6.1 и v6.2.
Сохрани Top 3 и условия. Покажи три HTML и проверки; состояние публикации укажи отдельно».

