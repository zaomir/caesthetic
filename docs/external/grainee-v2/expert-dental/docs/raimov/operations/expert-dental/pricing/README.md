# Expert Dental — цены и публикация

Публичные суммы: `PRICE_CATALOG.json` — единственный утверждённый источник. `PRICE_TABLE.md` — производное представление. `MARKETING_FAQ_PRICE_WORKBOOK.json` / `.md` — 110 строк справочного брифа, не автоматическое обновление каталога. `QUESTIONS_FOR_ATABEK_ASSISTANT_2026-08-05.md` — исторические вопросы, которые нужно сверять с более новыми решениями.

Для сайта RAIM SMILE:

- Решение, тексты, UX, ограничения и оставшиеся вопросы: `docs/ssot/RAIM_SMILE_PRICING_PRESENTATION.md`.
- Построчный аудит всех 96 записей каталога и 110 строк workbook: `RAIM_SMILE_PRICE_AUDIT.json` (создаётся проверенной сборкой).
- Runtime: `site-raimovdental/raim-smile/prices/index.html` и контекстные ссылки на страницах сайта.
- Сборка: `node scripts/raimov/build-raim-smile-prices.mjs`; интегрирована в существующий `scripts/generate-raim-smile-v3.mjs`.
- Проверки: `tests/raimovdental/raim-smile-prices.test.mjs` и `raim-smile-prices.browser.mjs`.
- Выпуск: только существующий `.github/workflows/deploy-raimsmile.yml`; production attestation `assets/prices-release.json`.

Новые цены вносятся в каталог после подтверждения клиникой, а не в HTML, workbook, этот README или пользовательскую форму. Три суммы первого выпуска удержаны: элайнеры в USD, установка брекетов с неуточнённым объёмом и временные виниры с неуточнённым комплектом. Названия и способ уточнения остаются доступны.

В git не помещаются пациентские сметы, договоры, персональные данные и записи звонков. Подтверждение публикации фиксируется в release evidence после фактического production smoke.
