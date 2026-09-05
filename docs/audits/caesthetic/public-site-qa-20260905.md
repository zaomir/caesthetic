# CAESTHETIC — исправление QA, 2026-09-05

Статус до deployment: исправления готовы, локальные проверки PASS. Production evidence добавляется после canonical deploy. Это не подтверждение полного интерактивного QA production.

## Основание

Источник: `zaomir/grainee-v2/main`, первоначально `1c60e6381bba7b15c09b670918cf9ce8b801652e`, затем синхронизирован `a41e8b1300a122c0b0abc5a7bbceefea53e2e07c`. Прочитаны START, docs/ROUTER, project AGENTS/manifest, WEBSITE_STUDIO_STANDARD, DESIGN, PROJECT_STATUS/active presentation spec, architecture/domain registry, CAESTHETIC master, enforcement и CHATGPT_SERVER_OPS. User явно изменил задачу с read-only QA на исправление до main/deploy/smoke.

Проверки ниже — локальный Chromium 140 / Playwright 1.55, высота 900, ширины 320/390/1440/1920. Внешние запросы в новой suite заблокированы, API заглушены; шрифты fallback. Скриншоты не выдаются за production или проверку Safari/iOS. No real leads, email submissions or payments.

## Исправленные дефекты

| ID / приоритет | URL / воспроизведение | Actual до исправления | Expected и исправление | Проверка |
|---|---|---|---|---|
| QA-01 / P1 | Все shared-header страницы; `/`, 390 px, scrollY=900 | Шапка уходила до top=-900: sticky находился внутри короткого slot | Sticky перенесён на `#cae-header-slot`; вложенный header relative; остаётся top=0 при scroll | top→bottom→top, до/после, 112 page-width combinations |
| QA-02 / P1 | `/`, открыть drawer и увеличить ширину до 1920 | Нет обработчика breakpoint; скрытая desktop drawer могла оставлять body scroll заблокированным | Общий overlay scroll lock, matchMedia/pageshow close, восстановление overflow; фокус ограничен открытым меню | Wheel lock, Shift+Tab, resize unlock, Escape/return focus PASS |
| QA-03 / P2 | `/support/`, 390 px, analytics undecided → Menu → Social | Баннер аналитики перекрывал нижние ссылки Social | Open drawer stacking выше consent; закрытие возвращает обычный порядок | Screenshot, elementFromPoint у последней ссылки, все 5 ссылок видимы |
| QA-04 / P2 | Четыре salon locale, footer Ask a question | Поздняя ссылка не имела modal marker; прямой переход в английский Support | Adapter добавляет question/intent marker; delegated listener; Name+Email popup, EN/RU/ES/FR | 350ms delayed adapter; click, 2 fields, translated title, no navigation, wheel lock, Escape/focus PASS |
| QA-05 / P2 | Четыре salon locale, конец страницы | Literal `\n` после script виден как текст | Настоящий перенос строки в HTML | DOM no literal text + static checks |
| QA-06 / P2 | `/lead-to-revenue-check/`, верх страницы | Unstyled Skip to content занимал строку, header top=25.59px | Fixed offscreen skip link; видим при keyboard focus | top=0; Tab/Enter; main не перекрыт header |
| QA-07 / P2 | `/score/`, верх/список примеров | Нет growth.css; список inline, подписи слипаются, hero без отступов | Подключён существующий growth.css в HTML и генераторе | Screenshot before/after, computed display:grid, hero padding, generator sync |

Новых подтверждённых P0 не найдено; отсутствие P0 на непроверенных путях не утверждается. Изменения не меняют продукты, цены, факты отчётов или locked illustrations. Общие CSS/JS hash fixtures обновлены с явной причиной; остальные frozen hashes сохранены.

## URL и покрытие

28 canonical страниц × 4 ширины = **112 page-width combinations**, **3408 scroll samples**, **296 открытий request popup**. Машинный журнал: [page-coverage.json](public-site-qa-20260905/page-coverage.json). В каждой комбинации выполнен top→bottom→top; проверены header position и horizontal overflow. Все наблюдаемые ошибки runtime собирались с создания страницы. Failures: 0. Это browser regression, не ручной просмотр каждого пикселя.

- [https://caesthetic.com/](https://caesthetic.com/)
- [https://caesthetic.com/growth-score/](https://caesthetic.com/growth-score/)
- [https://caesthetic.com/sprint/](https://caesthetic.com/sprint/)
- [https://caesthetic.com/growth-system/](https://caesthetic.com/growth-system/)
- [https://caesthetic.com/pricing/](https://caesthetic.com/pricing/)
- [https://caesthetic.com/lead-to-revenue-check/](https://caesthetic.com/lead-to-revenue-check/)
- [https://caesthetic.com/connect4/](https://caesthetic.com/connect4/)
- [https://caesthetic.com/about/](https://caesthetic.com/about/)
- [https://caesthetic.com/support/](https://caesthetic.com/support/)
- [https://caesthetic.com/case-studies/](https://caesthetic.com/case-studies/)
- [https://caesthetic.com/case-studies/case/](https://caesthetic.com/case-studies/case/)
- [https://caesthetic.com/legal/privacy/](https://caesthetic.com/legal/privacy/)
- [https://caesthetic.com/legal/terms/](https://caesthetic.com/legal/terms/)
- [https://caesthetic.com/legal/cookies/](https://caesthetic.com/legal/cookies/)
- [https://caesthetic.com/legal/payment-terms/](https://caesthetic.com/legal/payment-terms/)
- [https://caesthetic.com/pay/](https://caesthetic.com/pay/)
- [https://caesthetic.com/beauty-salons/](https://caesthetic.com/beauty-salons/)
- [https://caesthetic.com/es/salones-de-belleza/](https://caesthetic.com/es/salones-de-belleza/)
- [https://caesthetic.com/ru/salony-krasoty/](https://caesthetic.com/ru/salony-krasoty/)
- [https://caesthetic.com/fr/salons-de-beaute/](https://caesthetic.com/fr/salons-de-beaute/)
- [https://caesthetic.com/score/demo-aesthetics-clinic-reputation-gap/](https://caesthetic.com/score/demo-aesthetics-clinic-reputation-gap/)
- [https://caesthetic.com/score/demo-injector-practice-booking-friction/](https://caesthetic.com/score/demo-injector-practice-booking-friction/)
- [https://caesthetic.com/score/demo-medical-aesthetics-search-gap/](https://caesthetic.com/score/demo-medical-aesthetics-search-gap/)
- [https://caesthetic.com/score/demo-multi-location-growth-score/](https://caesthetic.com/score/demo-multi-location-growth-score/)
- [https://caesthetic.com/score/demo-multi-location-growth-score/focus-location/](https://caesthetic.com/score/demo-multi-location-growth-score/focus-location/)
- [https://caesthetic.com/score/demo-publish-control-plane-network/](https://caesthetic.com/score/demo-publish-control-plane-network/)
- [https://caesthetic.com/score/demo-publish-control-plane-network/focus-location/](https://caesthetic.com/score/demo-publish-control-plane-network/focus-location/)
- [https://caesthetic.com/score/](https://caesthetic.com/score/)

Alias/служебные URL проверяются отдельно HTTP и canonical smoke. `/case-studies/intake/` и внутренние API ожидаемо закрыты 404 с noindex/no-store; это не broken public CTA. `/pay/` без token и `/case-studies/case/` без id проверены только в unavailable state. Public cases в локальной suite используют пустую mock-выборку.

## Menu / CTA matrix

| Группа | Проверка | Результат и граница |
|---|---|---|
| Primary 7 links | Реальные clicks в 390 и 1920, destination и aria-current | PASS |
| Drawer | Open/Escape во время scroll на страницах, focus trap, wheel lock, resize | PASS local |
| Social | Toggle/Escape, 5 links, отсутствие consent overlay | PASS UI; внешние профили после перехода не проверены |
| Sprint / Check / System / Question | Все видимые marked request triggers в каждой комбинации | 296 popup openings PASS; exactly name+email |
| Salon question 4 locales | Delayed adapter, translated popup, scroll lock, close/focus | PASS |
| Request API | Mock first returns notification_sent:false, retry true | Ошибка не маскируется успехом; повторная отправка и payload PASS; actual email delivery не проверена |
| Growth Score intake | Main→dedicated form, UTM, required stages, retry, optional save/skip, failure, Instagram UA | 10/10 tests PASS; mocked submit |
| Footer navigation / header logo + CTA | 14 общих footer destinations физически кликнуты в 390/1920; отдельно header logo + Score CTA; rejection consent сохраняется | PASS; не каждый повтор ссылки на каждой странице кликнут |
| Anchor / skip | Skip keyboard Enter and header clearance; existing renderer local-target guards | PASS проверенного сценария; все anchor offsets вручную не проверены |
| Catalog | 5 synthetic report links; grid/hero styles; catalog consistency | PASS local; private cases не включены |
| Payment/checkout | Missing token state + static payment runtime guard | PASS границы; реальная оплата и внешняя checkout page не пройдены |
| FAQ / case filters / compare / cockpit | Вне изменённого UI; local scroll и runtime observations | Не полный функциональный прогон этих компонентов |

## Проверки

- navigation browser suite: 9/9 PASS, 27 страниц × 4; дополнение catalog и повторные targeted checks: 10/10 PASS, каталог × 4.
- Footer/header destination regression: 1/1 PASS, обе ширины; см. footer.txt.
- lead flow: 10/10 PASS. Два старых теста приведены к уже действующему main: dedicated Score intake вместо отсутствующей формы Home, popup вместо прежнего mailto Sprint.
- request/funnel/connect4/salon/check500/payment static guards: 39/39 PASS.
- renderer + v2 compatibility: 26/26 PASS; catalog routing: 7/7 PASS.
- Website Studio gate: новых public routes нет; gate skipped как предусмотрено. Syntax/diff checks PASS.

## Evidence

- Header [до](public-site-qa-20260905/header-before.png) / [после](public-site-qa-20260905/header-after.png).
- Social и consent [до](public-site-qa-20260905/social-before.png) / [после](public-site-qa-20260905/social-after.png).
- Catalog [до](public-site-qa-20260905/catalog-before.png) / [после](public-site-qa-20260905/catalog-after.png).
- [French question popup](public-site-qa-20260905/question-fr-after.png).
- Логи и JSON расположены рядом. Исходный live HTTP/DOM реестр сохранён в workspace `qa-caesthetic-20260905/`, не перезаписан исправленным состоянием.

## Blockers / не проверено

Live browser отказал: «Browser security check unavailable; admin-enforced policy could not be verified; access not granted». Обход ограничения не выполнялся. Поэтому full interactive production QA, реальные Safari/iOS/Android, live console/network waterfall, внешние social/checkout назначения, фактическая доставка email и оплата остаются непроверенными. Доступные local regression и canonical production HTTP smoke выполняются независимо. Нет claim «весь сайт без дефектов».

## Main merge recovery

During final sync, upstream `3f913bda` deleted the newly deployed v2 renderer module/supporting source/tests/spec evidence while `render-growth-score.mjs` still imported it. Local test confirmed `ERR_MODULE_NOT_FOUND`. The merge restores exactly the existing committed files (with the already documented shared-runtime fixture hashes) and preserves newer ops/sync records. No case facts or rendering feature were changed. Renderer tests repeated after recovery.

Upstream `77be33f0` subsequently restored the same dependencies and added sync protection. This release incorporates that newer recovery and its updated evidence/tooling, keeping the authorized shared-runtime hashes.
