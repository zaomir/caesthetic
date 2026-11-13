---
owner: Founder + Design + Engineering
status: active
version: 2.1
created: 2026-07-25
last_updated: 2026-08-30
scope: all website, page, presentation and public visual-artifact work performed by Cursor, Codex, Claude, Gemini, Copilot, OpenCode, Roo, Eva and other LLM agents
external_source: https://impeccable.style
---

# IMPECCABLE VISUAL DESIGN AGENT STANDARD

## 0. Решение

Impeccable принят как обязательный, автоматически активируемый design-quality layer для разработки и доработки:

- сайтов, лендингов и любых публичных страниц;
- интерфейсов, UI kits, visual systems и design tokens;
- презентаций, pitch decks, one-page HTML-презентаций и PDF-слайдов;
- визуальных отчётов, аудитов, коммерческих предложений и иных брендовых digital-артефактов.

Пользователь не обязан отдельно напоминать об Impeccable. Сам факт появления задачи на создание, изменение, аудит или polish визуального артефакта является триггером.

Impeccable **не заменяет** project/product/legal SSOT, `WEBSITE_STUDIO_STANDARD.md`, project brief, `DESIGN.md`, proof inventory, content truth и утверждённые production tokens/components.

Project SSOT определяет факты, оффер, идентичность, legal и ограничения. Impeccable определяет качество визуального исполнения, anti-slop review, композицию, типографику, цвет, motion, адаптацию и финальный polish.

## 1. Автоматические триггеры

Стандарт обязателен при любом запросе, содержащем по смыслу хотя бы одно действие:

- создать, собрать, сверстать, оформить, нарисовать, разработать;
- изменить, заменить секцию, улучшить, адаптировать, освежить, переделать;
- провести редизайн, аудит, polish, visual QA;
- сделать страницу, лендинг, homepage, service page, article page, dashboard surface;
- сделать презентацию, pitch deck, proposal, коммерческое предложение, визуальный отчёт, HTML/PDF deck;
- изменить layout, typography, palette, imagery, icons, components, charts, motion или responsive behavior.

Триггер действует независимо от стека, формата, модели и масштаба. Даже одна новая секция или один новый слайд проходят соответствующий Impeccable workflow.

## 2. Обязательный порядок

1. Синхронизировать `origin/main` и определить проект/домен.
2. Прочитать `START.md`, root `AGENTS.md`, `docs/ROUTER.md`, manifest и authority docs проекта.
3. Для сайтов прочитать `WEBSITE_STUDIO_STANDARD.md`; для презентаций — project brief, presentation/design canon и источники фактов.
4. Прочитать этот стандарт и project `DESIGN.md` либо эквивалентный visual-language документ.
5. Использовать уже известный контекст пользователя и проекта. Не задавать повторно вопросы, ответы на которые есть в SSOT, переписке или материалах.
6. Провести Design Discovery Gate из раздела 3.
7. Зафиксировать surface mode: `persuade`, `operate`, `read` или `experience`.
8. Реализовать один representative surface: ключевую страницу, секцию или 2–3 характерных слайда.
9. Выполнить только релевантные Impeccable passes.
10. Выполнить финальный `/impeccable polish` или `/impeccable audit`.
11. Запустить detector для затронутой UI-зоны, где он применим.
12. Пройти форматные QA-гейты: mobile/a11y/performance/SEO для web; readability, hierarchy, overflow, projection/mobile/PDF checks для decks.

## 3. Design Discovery Gate — когда и что спрашивать

### 3.1 Принцип

Вопросы нужны не всегда. Агент сначала извлекает ответы из project SSOT, `PRODUCT.md`, `DESIGN.md`, существующего сайта/презентации и предыдущих решений пользователя.

Вопрос задаётся только когда ответ:

- существенно меняет визуальную концепцию;
- не зафиксирован в доступном каноне;
- не может быть безопасно выведен из контекста;
- нужен до начала необратимого масштабирования.

Не блокировать небольшую правку вопросами. Для локального изменения сохранить действующую систему и выполнить работу автономно.

### 3.2 Максимум вопросов

Обычно задавать одним сообщением **3–5 вопросов**, объединённых по смыслу. Не проводить длинное интервью и не спрашивать про технические детали, которые агент может определить сам.

### 3.3 Обязательные неизвестные

При создании нового визуального направления выяснить недостающие пункты:

1. **Главный эффект:** что человек должен понять, почувствовать и сделать.
2. **Аудитория и контекст просмотра:** мобильный сайт, desktop, встреча, проектор, отправка PDF, приватная ссылка.
3. **Характер бренда:** 3–5 желаемых качеств и 3–5 anti-attributes.
4. **Отличие:** что должно сделать результат узнаваемым и не похожим на типовой AI-template.
5. **Референсы:** что нравится и, важнее, какой конкретный принцип нравится; референс не копируется целиком.
6. **Proof/materials:** реальные фото, кейсы, цифры, документы, логотипы, диаграммы и права на них.
7. **Жёсткие ограничения:** брендовые цвета/шрифты, языки, legal, сроки, CMS/runtime, формат/соотношение сторон.

### 3.4 Как формулировать вопросы

Вопросы должны предлагать профессионально отобранные направления, а не перекладывать дизайн на пользователя. Пример подхода:

- не «Какой стиль хотите?»;
- а «Для этой аудитории вижу одно сильное направление: строгая editorial-система с архитектурной сеткой и документальными доказательствами. Подтвердите, что избегаем luxury-gloss, glassmorphism и стартапных градиентов?»

Агент рекомендует **одно решение**, объясняет его кратко и просит уточнить только критическую неизвестную.

### 3.5 Если ответа нет

Если задача не терпит остановки или пользователь просит действовать автономно, агент:

- выбирает одно профессиональное направление на основании бренда и аудитории;
- явно фиксирует assumptions в brief/`DESIGN.md`;
- не выдумывает proof;
- делает representative surface до масштабирования.

## 4. Anti-neuroslop design brief

До масштабирования должны быть зафиксированы:

- audience/JTBD и primary conversion;
- surface mode;
- design thesis одним абзацем;
- 3–5 brand attributes;
- 3–5 anti-attributes;
- одна signature idea, связанная с сущностью бренда;
- typography logic;
- composition/grid logic;
- image/data-visualization language;
- media-slot registry, placeholder release policy и rights/provenance boundary;
- color role system;
- density, radius and elevation rules;
- motion rule;
- responsive or slide-format behavior;
- список запрещённых клише.

Недопустимо использовать «современно», «премиально», «минималистично» как достаточный design thesis без конкретной визуальной механики.

## 5. Impeccable passes

Агент выбирает только необходимые проходы:

- `/impeccable clarify` — намерение и иерархия;
- `/impeccable distill` — удаление шума и лишней сложности;
- `/impeccable typeset` — типографическая система;
- `/impeccable layout` — композиция, сетка и ритм;
- `/impeccable colorize` — цветовые роли внутри brand canon;
- `/impeccable adapt` — responsive, формат и состояния;
- `/impeccable animate` — только функциональный motion;
- `/impeccable delight` — одна осмысленная signature detail;
- `/impeccable polish` — финальный визуальный проход;
- `/impeccable audit` — production-quality review;
- `/impeccable document` — синхронизация переносимого visual canon.

Команды не дают права менять факты, оффер, legal copy, CTA semantics или brand identity без отдельного решения.

## 6. Anti-slop gate

Без осознанной причины запрещены:

- generic gradients, glassmorphism, AI beige и floating orbs;
- card soup, pill soup и одинаковые блоки равного веса;
- псевдо-luxury serif + italic cliché;
- vague headlines, декоративные kicker labels и generic CTA;
- бессмысленные 3-column grids;
- случайные радиусы, shadows, spacing и icon styles;
- stock-photo handshakes и несвязанные lifestyle images;
- декоративные графики без информационной функции;
- motion, не помогающий comprehension/action;
- переполненные слайды и «документ, уменьшенный до слайда»;
- placeholder proof, invented testimonials, fake metrics и fake logos;
- новый визуальный стиль для каждой страницы/слайда.

Detector finding является задачей. Исключение требует записи: finding, причина, owner, риск, срок пересмотра.

## 6.1 Canonical media-slot enforcement for websites

Все новые сайты, page families и major redesigns обязаны применять раздел 10
WEBSITE_STUDIO_STANDARD.md:

- replaceable media подключаются только по stable semantic media ID через registry/resolver;
- project имеет воспроизводимые inventory, ingest, check и contact-sheet commands;
- source replacement versioned и reversible; generated derivatives вручную не перезаписываются;
- rights, consent, operator, route, channel, expiry и withdrawal scope fail closed;
- placeholder разрешён только для local/UI Kit/access-controlled preview и не считается proof;
- noindex сам по себе не разрешает placeholder на public production;
- required public slot имеет state approved, optional unresolved slot скрывается;
- case, testimonial, doctor, partner-logo, result, metric, certificate и product-screen proof не получают fictional placeholder;
- media-changing PR/release показывает status delta и representative mobile/desktop crops.

Impeccable polish не может превратить placeholder в evidence и не закрывает
medical/legal/privacy/media-rights gate.

## 7. Специальные правила презентаций

Для презентации агент обязан:

- определить narrative arc и одно сообщение на слайд;
- проектировать для реального способа просмотра;
- использовать устойчивую master-system, а не набор несвязанных постеров;
- обеспечивать читаемость без zoom и отсутствие overflow;
- визуализировать данные честно, без декоративной инфографики;
- держать подробности в appendix, notes или второй части, а не перегружать основную историю;
- проверить export в целевой формат и representative screenshots.

Для HTML-презентации дополнительно действуют web responsive/accessibility/performance gates.

## 8. Установка и команды

```bash
pnpm impeccable:install
pnpm impeccable:update
pnpm impeccable:detect -- <target>
pnpm website:quality
```

Upstream требует Node.js 22.12+. В среде с системным Node 20 использовать настроенный Node через nvm и тот же PATH для Impeccable-команд.

## 9. Definition of Done

Визуальная задача готова только когда:

1. Загружены project canon, факты, brief и visual-language source.
2. Design Discovery Gate пройден: неизвестные выяснены либо assumptions зафиксированы.
3. Определены surface mode, design thesis, attributes, anti-attributes и signature idea.
4. Representative surface подтверждает систему до масштабирования.
5. Выполнен минимум один целевой Impeccable pass и финальный polish/audit.
6. Нет unresolved detector findings либо есть approved exceptions.
7. Пройдены релевантные format QA gates.
8. Нет unresolved required placeholders на public release, fake proof и нейрослоп-клише; protected-preview placeholders учтены и не выдаются за evidence.
9. Для website scope media registry/resolver, rights scope, contact sheet и replacement/rollback workflow синхронизированы с implementation.
10. `DESIGN.md`/presentation canon, UI Kit/templates и implementation синхронизированы.
11. Изменения находятся в `origin/main`.