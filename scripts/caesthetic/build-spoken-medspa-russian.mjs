#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderGrowthReport } from "./render-growth-score.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sourceSlug = "spoken-medspa-snellville-9d7f3a5c2e184b61";
export const slug = `${sourceSlug}-rus`;
export const sourceReportPath = path.join(repoRoot, "site-caesthetic", "score", sourceSlug, "report.json");
export const reportPath = path.join(repoRoot, "site-caesthetic", "score", slug, "report.json");
export const htmlPath = path.join(repoRoot, "site-caesthetic", "score", slug, "index.html");
export const auditReportPath = path.join(
  repoRoot,
  "docs",
  "audits",
  "caesthetic",
  "growth-score",
  "cases",
  "spoken-medspa-snellville-2026",
  "reports",
  "standalone-ru.json",
);

const EXACT_TRANSLATIONS = new Map(Object.entries({
  "Outside-in Growth Score using public evidence only. Internal operations, patient data, revenue and outcomes are not assessed.": "Оценка роста снаружи внутрь, основанная только на публичных доказательствах. Внутренние процессы, данные пациентов, выручка и результаты не оценивались.",
  "2121 Fountain Drive, Suite M, Snellville, GA 30078, United States": "2121 Фаунтин-драйв, помещение M, Снеллвилл, Джорджия 30078, США",
  "Spoken has a strong Botox/Ivy authority asset. The binding constraint is incomplete identity/trust continuity after the Jurney-to-Spoken transition, with mixed patient/Academy routing and uneven filler proof continuity.": "У Spoken есть сильная опора доверия: страница Botox и профессиональная репутация Ivy Cleveland. Главное ограничение — незавершённая согласованность идентичности и доверия после перехода от Jurney к Spoken, смешение маршрутов пациентов и Академии, а также неравномерная связность доказательств по филлерам.",
  "Legacy identity friction; Search coverage unmeasured.": "Старая идентичность создаёт трение; охват в поиске не измерен.",
  "Current brand is clear.": "Текущий бренд обозначен ясно.",
  "Legacy Jurney signals.": "Сохранились сигналы старого бренда Jurney.",
  "Current Spoken and legacy Jurney signals coexist.": "Текущая идентичность Spoken сосуществует с устаревшими сигналами Jurney.",
  "Strong Botox/Ivy asset; routing/proof repair needed.": "Страница Botox и авторитет Ivy Cleveland сильны; маршрутизацию и связность доказательств нужно исправить.",
  "Botox page + Ivy authority.": "Страница Botox и профессиональный авторитет Ivy Cleveland.",
  "Mixed audiences and uneven filler proof.": "Аудитории смешаны, а доказательства по филлерам представлены неравномерно.",
  "Botox is clearer than fillers.": "Предложение Botox раскрыто яснее, чем предложение филлеров.",
  "Patient and Academy offers share the public path.": "Предложения для пациентов и Академии находятся в одном публичном маршруте.",
  "Ivy Cleveland has visible NP and injector/instructor authority.": "На сайте видны квалификация Ivy Cleveland как практикующей медсестры и её профессиональный авторитет специалиста и преподавателя инъекционных методик.",
  "Branded link hub exists.": "Существует фирменная страница со ссылками.",
  "Dated sample not retained.": "Датированная выборка не сохранена.",
  "Directional reputation signal only.": "Есть только ориентировочный сигнал о репутации.",
  "Direct 90-day sample not retained.": "Прямая выборка за 90 дней не сохранена.",
  "Identity, audience and proof friction observed.": "Обнаружено трение в идентичности, разделении аудиторий и связности доказательств.",
  "Patient and professional journeys are not consistently separated.": "Маршруты пациентов и профессиональной аудитории разделены непоследовательно.",
  "Proof continuity is stronger on Botox than fillers.": "Связность доказательств сильнее для Botox, чем для филлеров.",
  "Current and legacy identity signals are not fully synchronized.": "Текущие и устаревшие сигналы идентичности синхронизированы не полностью.",
  "Strong Botox/provider authority centered on Ivy Cleveland.": "Сильная страница Botox и профессиональный авторитет Ivy Cleveland.",
  "Identity and trust continuity remain unsynchronized": "Согласованность идентичности и доверия остаётся незавершённой",
  "Legacy Jurney signals and mixed audience paths create public friction before booking.": "Устаревшие сигналы Jurney и смешанные маршруты аудиторий создают публичное трение до записи.",
  "Strong Botox page and Ivy authority.": "Сильная страница Botox и профессиональный авторитет Ivy Cleveland.",
  "Identity/trust continuity": "Согласованность идентичности и доверия",
  "Rebrand, audience routing and proof are not fully synchronized.": "Переход на новый бренд, маршруты аудиторий и доказательства синхронизированы не полностью.",
  "Fix identity, then audiences, then filler proof.": "Сначала исправить идентичность, затем разделить аудитории и после этого усилить доказательства по филлерам.",
  "Legacy Jurney identity remains": "Сохранилась устаревшая идентичность Jurney",
  "Identity uncertainty appears before booking.": "Неопределённость идентичности возникает до записи.",
  "One current Spoken identity.": "Единая актуальная идентичность Spoken.",
  "Freeze current facts; inventory and update controlled endpoints; retain before/after evidence.": "Зафиксировать актуальные данные, составить перечень управляемых точек контакта, обновить их и сохранить доказательства состояния до и после.",
  "Confirmed current facts": "Подтверждённые актуальные данные",
  "Web/GBP/social owner": "Ответственный за сайт, профиль компании в Google и социальные сети",
  "Controlled surfaces match current Spoken facts.": "Все управляемые поверхности соответствуют актуальным данным Spoken.",
  "Patient and Academy journeys are mixed": "Маршруты пациентов и Академии смешаны",
  "Different audiences share one action path.": "Разные аудитории используют один маршрут действий.",
  "Patient-first path + separate professional lane.": "Маршрут прежде всего для пациента и отдельное направление для профессионалов.",
  "Create a clear professional lane and separate patient vs Academy CTAs.": "Создать понятное направление для профессионалов и разделить призывы к действию для пациентов и Академии.",
  "UX/web owner": "Ответственный за пользовательский путь и сайт",
  "Priority patient journeys contain patient actions; Academy has one explicit entry.": "В приоритетных маршрутах пациентов остаются только действия для пациентов, а у Академии есть отдельная явная точка входа.",
  "Filler trust continuity trails Botox": "Связность доверия по филлерам уступает Botox",
  "Botox has a stronger Who/Trust/Proof chain.": "Для Botox лучше выстроена цепочка «кто оказывает услугу — почему доверять — какие есть доказательства».",
  "Consistent Botox/filler trust architecture.": "Единая структура доверия для Botox и филлеров.",
  "Use Botox as template; add verified provider/proof to fillers; remove unrelated copy.": "Использовать страницу Botox как образец, добавить к филлерам подтверждённые сведения о специалисте и доказательства, убрать нерелевантный текст.",
  "Clinical-content/web owner": "Ответственный за клинический контент и сайт",
  "Both priority pages pass one trust-chain checklist.": "Обе приоритетные страницы проходят единый перечень проверки цепочки доверия.",
  "Secondary page QA debt": "Недочёты контроля качества на второстепенных страницах",
  "Unrelated copy can reduce polish.": "Нерелевантный текст снижает цельность и качество впечатления.",
  "Reviewed relevant copy.": "Проверенный релевантный текст.",
  "QA priority/adjacent pages.": "Проверить качество приоритетных и соседних страниц.",
  "Web owner": "Ответственный за сайт",
  "Known unrelated/placeholder copy removed.": "Известный нерелевантный и временный текст удалён.",
  "Local map visibility not measured": "Локальная видимость на картах не измерена",
  "Manual search cannot establish geographic visibility.": "Ручной поиск не позволяет определить географическую видимость.",
  "Reproducible Search baseline.": "Воспроизводимый исходный уровень видимости в поиске.",
  "Capture approved 5×5 geo-grids.": "Собрать утверждённые геосетки 5×5.",
  "Search analyst": "Специалист по поиску",
  "Dated grids retained.": "Датированные геосетки сохранены.",
  "90-day reputation baseline not measured": "Исходный уровень репутации за 90 дней не измерен",
  "Third-party snapshots are not a direct comparable window.": "Снимки сторонних источников не образуют прямое сопоставимое окно.",
  "Direct reputation baseline.": "Прямой исходный уровень репутации.",
  "Capture direct 90-day sample for subject and competitors.": "Собрать прямую 90-дневную выборку по практике и конкурентам.",
  "Reputation analyst": "Специалист по репутации",
  "Source/window/sample retained.": "Источник, период и выборка сохранены.",
  "Internal lead handling not assessed": "Внутренняя обработка обращений не оценивалась",
  "Public evidence cannot establish internal causes.": "Публичные доказательства не позволяют установить внутренние причины.",
  "No unsupported internal diagnosis.": "Никаких неподтверждённых выводов о внутренних процессах.",
  "Do not infer internal causes.": "Не делать выводов о внутренних причинах.",
  "Practice owner": "Владелец практики",
  "Internal causes remain not assessed.": "Внутренние причины остаются неоценёнными.",
  "Identity is the binding dependency.": "Идентичность — ключевая зависимость для остальных исправлений.",
  "Do not scale paid Botox/filler demand before identity repair and Search/booking verification": "Не увеличивать платный спрос на Botox и филлеры до исправления идентичности и проверки поиска и записи",
  "Demand shortage is unproven; destination friction is observable.": "Недостаток спроса не доказан, а трение в точках назначения наблюдается напрямую.",
  "Current identity synchronized.": "Актуальная идентичность синхронизирована.",
  "Audience paths separated.": "Маршруты аудиторий разделены.",
  "Search and booking baselines verified.": "Исходные уровни поиска и записи подтверждены.",
  "Four approved local Snellville comparators.": "Четыре утверждённые локальные альтернативы в Снеллвилле.",
  "Four approved local comparators.": "Четыре утверждённые локальные альтернативы.",
  "Website evidence only; other comparable surfaces insufficient.": "Есть доказательства только по сайтам; для остальных сопоставимых поверхностей доказательств недостаточно.",
  "No review-theme conclusion without a direct comparable sample.": "Нельзя делать выводы по темам отзывов без прямой сопоставимой выборки.",
  "Spoken Med Spa, Snellville, GA": "Spoken Med Spa, Снеллвилл, Джорджия",
  "Approved local comparator.": "Утверждённая локальная альтернатива.",
  "Snellville, GA": "Снеллвилл, Джорджия",
  "Relevant local alternative.": "Релевантная локальная альтернатива.",
  "Clear local treatment-to-booking architecture.": "Чёткая локальная структура пути от услуги до записи.",
  "Structured medical authority and treatment depth.": "Хорошо структурированы медицинский авторитет и глубина описания услуг.",
  "Simple named-provider proposition.": "Простое предложение, построенное вокруг названного специалиста.",
  "Local provider/injectables relevance.": "Релевантность локального специалиста и инъекционных услуг.",
  "Full Four-Surface sample not retained.": "Полная выборка по четырём поверхностям не сохранена.",
  "Adapt clear journey structure.": "Адаптировать ясную структуру пути клиента.",
  "Differentiate through Ivy authority.": "Отстроиться за счёт профессионального авторитета Ivy Cleveland.",
  "Do not copy claims/discounts as proof.": "Не копировать заявления и скидки, принимая их за доказательство.",
  "Context only.": "Только контекст для решения.",
  "Supports identity repair first.": "Поддерживает первоочередное исправление идентичности.",
  "No Top 3 change.": "Не меняет утверждённую тройку приоритетов.",
  "No superiority inferred.": "Превосходство не предполагается.",
  "Incomplete sample.": "Неполная выборка.",
  "Website-only context; review-theme repetition was not assessed and remains insufficient evidence.": "Контекст только по сайту; повторяемость тем в отзывах не оценивалась, поэтому доказательств недостаточно.",
  "Public website": "Публичный сайт",
  "Insufficient evidence.": "Недостаточно доказательств.",
  "Insufficient evidence": "Недостаточно доказательств",
  "Not retained.": "Не сохранено.",
  "Identity friction; geo-grid unmeasured.": "Трение в идентичности; геосетка не измерена.",
  "Strong Botox/Ivy; routing/proof gaps.": "Сильны Botox и авторитет Ivy Cleveland; есть разрывы в маршрутах и доказательствах.",
  "Defend Ivy authority": "Сохранить профессиональный авторитет Ivy Cleveland",
  "Named-provider authority is visible.": "Профессиональный авторитет названного специалиста виден.",
  "Close identity/trust gap": "Закрыть разрыв в идентичности и доверии",
  "Patients should not reconcile Spoken/Jurney signals.": "Пациенты не должны самостоятельно сопоставлять сигналы Spoken и Jurney.",
  "Use injector-educator authority as trust evidence": "Использовать авторитет специалиста-преподавателя как доказательство доверия",
  "Use education as expertise evidence without superiority claims.": "Использовать преподавательскую деятельность как доказательство компетентности без заявлений о превосходстве.",
  "Do not copy visible tactics as proof": "Не принимать видимые тактики за доказательство",
  "Visibility does not establish ROI or clinical superiority.": "Видимая активность не доказывает окупаемость или клиническое превосходство.",
  "Separate delivery artifact.": "Отдельный материал для передачи клиенту.",
  "Implement in-house.": "Внедрить внутри команды.",
  "Use another qualified provider.": "Привлечь другого квалифицированного подрядчика.",
  "Preserve evidence and revisit later.": "Сохранить доказательства и вернуться к решению позже.",
  "Ask CAESTHETIC to scope selected work separately.": "Попросить CAESTHETIC отдельно определить объём выбранных работ.",
  "Evidence and dependency order are assembled.": "Доказательства и порядок зависимостей уже собраны.",
  "Repair spans identity, website, Search destinations and proof.": "Исправления охватывают идентичность, сайт, точки назначения из поиска и доказательства.",
  "No task is automatic; written 30-Day Sprint scope is separate. Sprint price: $2,500.": "Ни одна задача не включается автоматически; письменный объём 30-дневного спринта подтверждается отдельно. Стоимость спринта: 2 500 долларов.",
  "Report and repair paths may be used without CAESTHETIC; no lock-in.": "Отчёт и пути исправления можно использовать без CAESTHETIC; привязки к подрядчику нет.",
  "No 5×5 geo-grid, complete direct GBP audit, dated representative Social sample, direct comparable 90-day Google review corpus, Lighthouse, enquiry submission, appointment, internal ops, patient, lead/revenue or clinical-outcome data. Missing evidence remains unavailable.": "Не собраны геосетка 5×5, полная прямая проверка профиля компании в Google, датированная репрезентативная выборка социальных сетей, прямая сопоставимая 90-дневная выборка отзывов Google, измерение производительности, отправка обращения, запись на приём, данные внутренних процессов, пациентов, обращений, выручки или клинических результатов. Отсутствующие доказательства остаются недоступными.",
}));

const METRIC_LABELS_RU = Object.freeze({
  map_visibility: "видимость на картах",
  gbp_treatment_category_completeness: "полнота категорий и услуг в профиле компании Google",
  entity_integrity: "целостность данных о компании",
  gbp_conversion_readiness: "готовность профиля компании в Google к обращению",
  freshness: "актуальность",
  branded_search_control: "контроль поиска по бренду",
  booking_friction: "трение на пути к записи",
  treatment_clarity: "ясность приоритетных услуг",
  mobile_performance: "производительность на мобильных устройствах",
  above_fold_conversion: "ясность первого экрана",
  clinician_trust_proof: "доказательства доверия к специалисту",
  mystery_shopper: "проверочное обращение",
  technical_booking_integrity: "техническая исправность записи",
  priority_treatment_presence: "присутствие приоритетных услуг",
  clinician_expertise: "экспертность специалистов",
  proof_quality: "качество доказательств",
  recency: "актуальность",
  profile_to_booking: "путь от профиля к записи",
  local_offer_clarity: "ясность локального предложения",
  review_velocity_90d: "скорость поступления отзывов за 90 дней",
  rating: "рейтинг",
  review_depth: "содержательность отзывов",
  response_coverage: "доля отзывов с ответом",
  response_speed: "скорость ответа",
  negative_review_handling: "работа с негативными отзывами",
  treatment_clinician_proof: "упоминания услуг и специалистов в отзывах",
  treatment_presence: "присутствие услуг",
  positioning_coherence: "согласованность позиционирования",
  proof_continuity: "связность доказательств",
  conversion_continuity: "непрерывность пути к обращению",
  identity_coherence: "согласованность идентичности",
});

function translateStrings(value) {
  if (Array.isArray(value)) return value.map(translateStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, translateStrings(child)]));
  }
  if (typeof value !== "string") return value;
  return EXACT_TRANSLATIONS.get(value) ?? value;
}

function applyPlainOwnerCopy(report) {
  report.reportVersion = "spoken-medspa-snellville-public-evidence/ru/1.1.0";
  report.disclosure = "Отчёт основан только на публичной информации. Внутренние процессы, данные пациентов, выручка и результаты лечения не изучались.";
  report.executiveSummary = "В интернете одновременно встречаются Spoken и старое название Jurney. Сайт также смешивает путь пациента с материалами Академии, а страница филлеров объясняет доверие слабее страницы Botox.";
  report.crossSurface.summary = "Три найденные проблемы связаны: сначала нужно убрать путаницу с названием, затем разделить аудитории и после этого усилить доверие к странице филлеров.";

  const diagnosis = report.humanDiagnosis;
  diagnosis.objective_strength.title = "Страница Botox хорошо объясняет услугу и показывает профессиональный авторитет Ivy Cleveland.";
  diagnosis.binding_constraint.title = "Пациент может запутаться ещё до записи";
  diagnosis.binding_constraint.statement = "В интернете одновременно встречаются Spoken и старое название Jurney. Кроме того, сайт смешивает путь пациента с материалами Академии.";
  diagnosis.current_state.strengths = ["Страница Botox хорошо объясняет услугу и показывает профессиональный авторитет Ivy Cleveland."];
  diagnosis.current_state.constraint_label = "Путаница между Spoken и Jurney";
  diagnosis.current_state.constraint_detail = "Пациент может увидеть два названия одной клиники и усомниться, что попал в нужное место.";
  diagnosis.current_state.priority_line = "Сначала убрать старое название Jurney, затем разделить пути пациентов и специалистов, после этого усилить страницу филлеров.";
  diagnosis.focus_selection.rationale = "Сначала нужно убрать путаницу с названием: от этого зависят остальные исправления.";

  const copyByGap = {
    "SMS-26-01": {
      title: "Убрать старое название Jurney",
      why_it_matters: "Одновременно видимые названия Spoken и Jurney могут вызвать сомнение, что это одна и та же клиника.",
      outcome: "Во всех управляемых каналах используется только актуальное название Spoken.",
      diy_steps: [
        "Составить список управляемых страниц Spoken в Google, на сайте и в социальных сетях.",
        "Сверить на каждой странице название, адрес, телефон и ссылку для записи.",
        "Заменить устаревшее название Jurney и сохранить снимки до и после изменений.",
      ],
      dependencies: ["Актуальные название, адрес, телефон и ссылка для записи."],
      owner_role: "Специалист, который управляет сайтом, профилем компании в Google и социальными сетями.",
      done_when: ["На всех управляемых страницах указаны одинаковые актуальные данные Spoken."],
    },
    "SMS-26-02": {
      title: "Разделить путь пациента и путь специалиста",
      why_it_matters: "Пациенту нужна понятная запись на процедуру, а специалисту — отдельный вход в Академию.",
      outcome: "Пациентские страницы ведут к записи, а материалы Академии находятся в отдельном разделе.",
      diy_steps: [
        "Определить один основной следующий шаг для пациента на главной странице и страницах услуг.",
        "Создать отдельный понятный вход в Академию для специалистов.",
        "Убрать предложения Академии из основных маршрутов пациента к записи.",
      ],
      dependencies: ["Сначала привести все страницы к актуальному названию Spoken."],
      owner_role: "Специалист по сайту и пути пользователя.",
      done_when: ["На страницах для пациентов остаются действия для пациентов, а у Академии есть отдельный вход."],
    },
    "SMS-26-03": {
      title: "Усилить страницу филлеров",
      why_it_matters: "Страница Botox яснее показывает, кто проводит процедуру, почему специалисту можно доверять и чем подтверждена его квалификация.",
      outcome: "Страницы Botox и филлеров одинаково ясно объясняют услугу и основания для доверия.",
      diy_steps: [
        "Использовать структуру страницы Botox как образец для страницы филлеров.",
        "Добавить подтверждённые сведения о специалисте и его квалификации.",
        "Убрать нерелевантный текст и проверить, что следующий шаг к записи понятен.",
      ],
      dependencies: ["Сначала привести все страницы к актуальному названию Spoken."],
      owner_role: "Специалист по клиническому содержанию и сайту.",
      done_when: ["Обе страницы отвечают на вопросы: кто проводит процедуру, почему доверять и как записаться."],
    },
    "SMS-26-04": {
      title: "Убрать случайный и временный текст со второстепенных страниц",
      why_it_matters: "Нерелевантный текст снижает общее впечатление от сайта.",
      outcome: "На соседних страницах остаётся только проверенный и относящийся к услуге текст.",
      diy_steps: ["Проверить соседние страницы и удалить нерелевантные или временные фрагменты."],
      dependencies: [],
      owner_role: "Специалист по сайту.",
      done_when: ["Известный нерелевантный и временный текст удалён."],
    },
  };
  for (const gap of diagnosis.gap_inventory) {
    const copy = copyByGap[gap.id];
    if (!copy) continue;
    gap.title = copy.title;
    gap.why_it_matters = copy.why_it_matters;
    gap.repair_plan = {
      ...gap.repair_plan,
      outcome: copy.outcome,
      diy_steps: copy.diy_steps,
      dependencies: copy.dependencies,
      owner_role: copy.owner_role,
      done_when: copy.done_when,
    };
  }

  diagnosis.do_not_do.title = "Пока не увеличивать рекламный бюджет на Botox и филлеры";
  diagnosis.do_not_do.rationale = "Сначала нужно убрать путаницу с названием, разделить пути на сайте и проверить дорогу пациента к записи. Иначе реклама приведёт больше людей в путь, где уже есть потери.";
  diagnosis.do_not_do.revisit_after = [
    "Во всех управляемых каналах используются актуальные данные Spoken.",
    "Пути пациентов и специалистов разделены.",
    "Путь из поиска к записи проверен повторно.",
  ];

  const competitorCopy = {
    "dermani-medspa-snellville": "Понятный местный путь от страницы услуги к записи.",
    "about-face-snellville": "Подробно показаны квалификация специалистов и содержание услуг.",
    "harper-haus": "Простое предложение, построенное вокруг конкретного специалиста.",
    "a-defined-image": "Понятная связь местного специалиста с инъекционными услугами.",
  };
  for (const competitor of diagnosis.competitors.entries) {
    competitor.patient_choice_reason = competitorCopy[competitor.id] || competitor.patient_choice_reason;
    competitor.observable_advantage = competitorCopy[competitor.id] || competitor.observable_advantage;
  }
  diagnosis.competitors.decision_summary.defend[0].title = "Сохранить профессиональный авторитет Ivy Cleveland";
  diagnosis.competitors.decision_summary.defend[0].rationale = "Это заметное преимущество Spoken, которое уже поддерживает доверие.";
  diagnosis.competitors.decision_summary.close[0].title = "Убрать путаницу между Spoken и Jurney";
  diagnosis.competitors.decision_summary.close[0].rationale = "Пациент не должен самостоятельно выяснять, относятся ли два названия к одной клинике.";
  diagnosis.competitors.decision_summary.differentiate[0].title = "Показывать опыт преподавателя как основание для доверия";
  diagnosis.competitors.decision_summary.differentiate[0].rationale = "Преподавательская работа Ivy Cleveland подтверждает профессиональный опыт без заявлений о превосходстве.";
  diagnosis.competitors.decision_summary.do_not_copy[0].title = "Не копировать скидки и громкие заявления";
  diagnosis.competitors.decision_summary.do_not_copy[0].rationale = "Видимая активность конкурента не доказывает качество, окупаемость или превосходство.";

  report.implementation_paths = {
    diy: "Выполнить изменения внутри команды по инструкциям из отчёта.",
    other_provider: "Передать инструкции своим специалистам или другому квалифицированному подрядчику.",
    caesthetic: "Поручить CAESTHETIC согласованный объём работ на 30 дней.",
    defer: "Сохранить отчёт и вернуться к изменениям позже.",
  };
  report.why_caesthetic = {
    evidence_advantage: "Факты и правильный порядок работ уже собраны.",
    coordination_advantage: "CAESTHETIC может согласовать изменения между сайтом, Google и социальными сетями и проверить результат.",
    sprint_boundary: "Точный объём работ подтверждается письменно. Стоимость 30-дневного спринта — $2,500.",
    ownership: "Отчёт и инструкции остаются у Spoken. Их можно использовать без CAESTHETIC.",
  };
}

export function buildRussianReport(source = JSON.parse(fs.readFileSync(sourceReportPath, "utf8"))) {
  const report = translateStrings(structuredClone(source));
  report.reportContext.report_locale = "ru";
  report.reportContext.locale_source = "user_selected";
  applyPlainOwnerCopy(report);
  report.presentation = {
    kind: "localized_client",
    strict_locale: "ru",
    copy_profile: "plain_owner_ru",
    hide_unassessed: true,
    owner_copy: {
      greeting: {
        kicker: "Приветствие от Валерии",
        title: "Здравствуйте, Ivy.",
        body: "Мы посмотрели на Spoken глазами человека, который впервые находит клинику, сравнивает варианты и решает, записываться ли. Ниже — три причины, которые могут мешать записи, и понятный порядок исправлений.",
        signature: "Валерия Петра · CAESTHETIC",
      },
      intro: {
        kicker: "Как пользоваться отчётом",
        title: "Пять ответов, которые помогут принять решение",
        items: [
          "где могут теряться обращения",
          "почему пациент может выбрать другую клинику",
          "что исправить в ближайшие 30 дней",
          "на что пока не стоит тратить деньги",
          "как выполнить исправления самостоятельно или с привлечением специалистов",
        ],
        note: "Для каждого из трёх приоритетов ниже есть полные инструкции по самостоятельному внедрению.",
      },
      section_titles: [
        "Где теряется спрос",
        "Что исправить сначала",
        "Что реально изменить за 30 дней",
        "Инструкции по самостоятельному внедрению",
        "На что пока не тратить бюджет",
        "Полный реестр подтверждённых разрывов",
        "Источники и подтверждения",
        "Выводы",
        "Четыре допустимых пути",
      ],
      section_kickers: [
        "Краткая карта пути пациента",
        "Один главный и два поддерживающих приоритета",
        "Понятный порядок работ",
        "Полные пошаговые инструкции",
        "Одна остановка расходов",
        "Только подтверждённые проблемы",
        "Исследование конкурентов и публичные источники",
        "Что означает весь отчёт",
        "Выберите способ внедрения",
      ],
      thirty_day_steps: [
        ["Дни 1–10", "Убрать старое название Jurney и привести к единым данным все управляемые каналы."],
        ["Дни 11–20", "Разделить путь пациента к записи и отдельный путь специалиста в Академию."],
        ["Дни 21–30", "Усилить страницу филлеров по понятной структуре страницы Botox."],
        ["День 30", "Повторно пройти путь пациента и сохранить подтверждение выполненных изменений."],
      ],
      internal_boundary: {
        kicker: "Что происходит после обращения",
        title: "Внутренние причины нельзя определить по открытым данным",
        body: "Этот аудит показывает путь пациента до обращения. Скорость ответа, обработку обращения, запись, явку и оплату можно достоверно оценить только с разрешённым доступом к внутренним данным.",
        public_label: "Видно публично",
        public_path: "Поиск → сайт → обращение",
        private_label: "Нужен разрешённый доступ",
        private_path: "Ответ → запись → визит → оплата",
      },
      competitor: {
        kicker: "Исследование конкурентов",
        title: "Почему пациент может выбрать другую клинику",
        intro: "Мы сравнили публичные сайты четырёх местных альтернатив. Ниже показаны только наблюдения, которые помогают принять решение для Spoken.",
      },
      evidence: {
        title: "Проверенные факты и ссылки на источники",
        intro: "В основной части отчёта показаны только выводы, подтверждённые публичными источниками. Здесь можно открыть исходные страницы.",
      },
      conclusion: "Это не три отдельные проблемы, а одна последовательность. Сначала Spoken должна выглядеть как одна и та же клиника во всех каналах. После этого можно разделить аудитории, усилить доверие к услугам и только затем увеличивать привлечение.",
      offer: {
        kicker: "Вариант с CAESTHETIC",
        title: "30-дневный спринт роста",
        price: "$2,500 · 30 дней",
        body: "Мы согласуем письменный объём работ вокруг трёх подтверждённых приоритетов, координируем внедрение и проверяем результат. Отчёт не обязывает вас покупать услугу.",
        cta: "Поручить внедрение CAESTHETIC",
      },
    },
    official_names: [
      "CAESTHETIC",
      "Spoken Med Spa",
      "Spoken",
      "Jurney",
      "Ivy",
      "Ivy Cleveland",
      "Botox",
      "Spoken Aesthetic Academy",
      "Academy",
      "Google",
      "dermani MEDSPA® Snellville",
      "About Face Skin Care - Snellville",
      "Harper Haus Aesthetics & Wellness",
      "A Defined Image Medical Wellness Centre",
    ],
  };
  for (const surface of report.surfaces) {
    for (const metric of surface.metrics) metric.label = METRIC_LABELS_RU[metric.metric_id];
  }
  for (const metric of report.crossSurface.metrics) metric.label = METRIC_LABELS_RU[metric.metric_id];
  report.audit = {
    ...report.audit,
    project_id: source.audit.project_id,
    access_group_id: null,
    translation_of_project_id: source.audit.project_id,
    translation_of_route: `/score/${sourceSlug}/`,
    public_direct_link: true,
  };
  report.catalog = {
    visibility: "private",
    public_listing_approved: false,
  };
  return report;
}

export const report = buildRussianReport();

export function writeRussianReport() {
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  for (const target of [reportPath, auditReportPath]) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, serialized);
  }
  fs.writeFileSync(htmlPath, renderGrowthReport(report));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  writeRussianReport();
  console.log(`Built ${path.relative(repoRoot, reportPath)}`);
  console.log(`Rendered ${path.relative(repoRoot, htmlPath)}`);
}
