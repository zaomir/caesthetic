# Expert Dental — Tilda drafts

Черновики Zero Block для `expertdental.kg` (не runtime `site-raimovdental`).

| File | Purpose |
|------|---------|
| `homepage-zero-block.html` | Канон главной (HTML+CSS+JS) для вставки в Tilda |
| `price-table-zero-block.html` | Таблица прайса + отдельный информационный блок RAIM SMILE · SmileCare 12 |
| `PRICE_SECTION_TILDA_AI_PROMPT.md` | Промпт для ИИ Tilda: ala-carte таблица + отдельный SKU Care (без −20% на всё) |
| `doctors/MIR_ALI_GNATHOLOGIST_TILDA.md` | Инструкция: карточка Мир-Али как гнатолог |

## Прайс `/price` (2026-08-05)

1. SSOT каталога: `docs/raimov/operations/expert-dental/pricing/PRICE_CATALOG.json`
2. Markdown-таблица: `docs/raimov/operations/expert-dental/pricing/PRICE_TABLE.md`
3. Вставка в Tilda: открыть страницу `Цены` (`/price`) → Zero Block → вставить содержимое `price-table-zero-block.html` (body + style; без внешней шапки/меню Tilda)
4. Удалить старые карточки T847 с дублирующим прайсом, чтобы осталась одна таблица
5. DEC-800 + DEC-861 разрешают информационную публикацию **RAIM SMILE · SmileCare 12** с прежними benefits/prices и WhatsApp inquiry; checkout и автоматическую активацию не добавлять
6. После публикации: smoke `https://expertdental.kg/price`

**Запрещено:** колонка «цена по подписке» на всех услугах; правила «≤2000=0» и «−20% на всё».

Канон URL каталога услуг и цен в долгосрочной архитектуре — `/services/` (`EXPERT_DENTAL_WEBSITE_SSOT.md`). Пока жив legacy-алиас `/price` — публикуем сюда.

## Fixes in homepage-zero-block (2026-07-30)

- CTA «Все услуги и цены» → `/services` (не `/prices`)
- Кнопки: прозрачный фон по умолчанию; Tilda `.t-btnflex` перебивается через `!important`
- WhatsApp (блок контактов): outline `#25D366` → заливка на hover
- FAQ: `hidden` на ответах; padding снизу под mobile panel; layout featured-карточки услуг
