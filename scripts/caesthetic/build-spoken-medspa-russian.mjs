#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderGrowthReport } from "./render-growth-score.mjs";
import { OWNER_BRIEF_LAYOUT_CONTRACT } from "./owner-brief-contract.mjs";
import { CHECK500_STYLE_CONTRACT } from "./growth-score-report-template.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sourceSlug = "spoken-medspa-snellville-9d7f3a5c2e184b61";
export const slug = `${sourceSlug}-rus`;
export const sourceReportPath = path.join(repoRoot, "site-caesthetic", "score", sourceSlug, "report.json");
export const englishReportPath = sourceReportPath;
export const englishHtmlPath = path.join(repoRoot, "site-caesthetic", "score", sourceSlug, "index.html");
export const reportPath = path.join(repoRoot, "site-caesthetic", "score", slug, "report.json");
export const htmlPath = path.join(repoRoot, "site-caesthetic", "score", slug, "index.html");
export const englishAuditReportPath = path.join(
  repoRoot,
  "docs",
  "audits",
  "caesthetic",
  "growth-score",
  "cases",
  "spoken-medspa-snellville-2026",
  "reports",
  "standalone.json",
);
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
  "Legacy identity friction; Search coverage unmeasured.": "Старая идентичность создаёт трение; охват в поиске не измерен.",
  "Current brand is clear.": "Текущий бренд обозначен ясно.",
  "Strong Botox/Ivy asset; routing/proof repair needed.": "Страница Botox понятна и показывает опыт Ivy Cleveland. Другие части пути нужно привести к тому же уровню.",
  "Botox page + Ivy authority.": "Понятная страница Botox и опыт Ivy Cleveland.",
  "Mixed audiences and uneven filler proof.": "На сайте смешаны материалы для пациентов и специалистов. Страница филлеров объяснена слабее.",
  "Botox is clearer than fillers.": "Страница Botox понятнее страницы филлеров.",
  "Patient and Academy offers share the public path.": "Материалы для пациентов и Академии находятся в одном разделе сайта.",
  "Ivy Cleveland has visible NP and injector/instructor authority.": "На сайте указаны квалификация Ivy Cleveland и её опыт как специалиста и преподавателя.",
  "Branded link hub exists.": "Существует фирменная страница со ссылками.",
  "Dated sample not retained.": "Датированная выборка не сохранена.",
  "Directional reputation signal only.": "Есть только ориентировочный сигнал о репутации.",
  "Direct 90-day sample not retained.": "Прямая выборка за 90 дней не сохранена.",
  "Identity, audience and proof friction observed.": "Обнаружено трение в идентичности, разделении аудиторий и связности доказательств.",
  "Patient and professional journeys are not consistently separated.": "Путь пациента и путь специалиста разделены не везде.",
  "Proof continuity is stronger on Botox than fillers.": "На странице Botox больше причин доверять услуге, чем на странице филлеров.",
  "Strong Botox/provider authority centered on Ivy Cleveland.": "Сильная страница Botox и профессиональный авторитет Ivy Cleveland.",
  "Identity and trust continuity remain unsynchronized": "Согласованность идентичности и доверия остаётся незавершённой",
  "Strong Botox page and Ivy authority.": "Сильная страница Botox и профессиональный авторитет Ivy Cleveland.",
  "Identity/trust continuity": "Согласованность идентичности и доверия",
  "Rebrand, audience routing and proof are not fully synchronized.": "Переход на новый бренд, маршруты аудиторий и доказательства синхронизированы не полностью.",
  "Fix identity, then audiences, then filler proof.": "Сначала исправить идентичность, затем разделить аудитории и после этого усилить доказательства по филлерам.",
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
  "Identity friction; geo-grid unmeasured.": "Встречаются два названия клиники; видимость на карте не измерена.",
  "Strong Botox/Ivy; routing/proof gaps.": "Страница Botox и опыт Ivy Cleveland — сильная сторона. Путь пациента и страница филлеров слабее.",
  "Defend Ivy authority": "Сохранить профессиональный авторитет Ivy Cleveland",
  "Named-provider authority is visible.": "Профессиональный авторитет названного специалиста виден.",
  "Close identity/trust gap": "Закрыть разрыв в идентичности и доверии",
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
  report.reportVersion = "spoken-medspa-snellville-public-evidence/ru/1.6.2";
  report.verifiedFactSetVersion = "spoken-medspa-snellville-2026-09-04/4444-v1";
  report.disclosure = "Отчёт составлен по открытым источникам. Мы не проверяли внутренние процессы, данные пациентов, выручку и результаты лечения.";
  report.executiveSummary = "У Spoken уже есть сильная страница Botox, активный блог и высокий рейтинг в Google. Главная задача — связать точные запросы пациентов, регулярные материалы и работу с отзывами в одну систему.";
  report.crossSurface.summary = "Сайт, блог, Google, социальные сети и отзывы должны повторять один язык спроса: одинаковые услуги, специалисты, местоположение и точные запросы пациентов.";

  const findMetric = (surfaceId, metricId) => report.surfaces
    .find((surface) => surface.id === surfaceId)
    ?.metrics.find((metric) => metric.metric_id === metricId);
  const findCrossMetric = (metricId) => report.crossSurface.metrics
    .find((metric) => metric.metric_id === metricId);
  const resetMetric = (metric) => {
    Object.assign(metric, {
      raw_value: null,
      normalized_score: null,
      evidence_class: "A",
      source: null,
      collected_at: null,
      reviewer_status: "pending",
    });
    delete metric.finding;
  };
  resetMetric(findMetric("search", "entity_integrity"));
  resetMetric(findCrossMetric("identity_coherence"));

  Object.assign(findMetric("website", "treatment_clarity"), {
    raw_value: "Botox, филлеры и тематические статьи",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.spokenmedspa.com/neurotoxins-snellville-ga; https://www.spokenmedspa.com/dermal-fillers-snellville-ga; https://www.spokenmedspa.com/blog",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Страницы услуг и активный блог отвечают на вопросы пациентов, но в открытых материалах не видна единая карта точных запросов и их распределения.",
  });
  Object.assign(findCrossMetric("proof_continuity"), {
    raw_value: "материалы не связаны одной картой запросов",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.spokenmedspa.com/neurotoxins-snellville-ga; https://www.spokenmedspa.com/dermal-fillers-snellville-ga; https://www.spokenmedspa.com/blog; https://www.spokenmedspa.com/clients; https://msha.ke/spokenmedspa/",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Полезные материалы существуют, но их связь с одинаковыми точными запросами на сайте, в Google и социальных сетях не показана как единая система.",
  });
  Object.assign(findMetric("reputation", "rating"), {
    raw_value: "4,9 и около 250 отзывов",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "У Spoken высокий рейтинг 4,9 и около 250 отзывов. Это сильная основа, которую нужно регулярно поддерживать.",
  });
  Object.assign(findMetric("reputation", "negative_review_handling"), {
    raw_value: "повторяется тема общения по телефону и на стойке регистрации",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "В нескольких низких оценках повторяется тема общения по телефону и на стойке регистрации. Ответы владельца есть, но часть из них общая, а один видимый ответ не соответствует жалобе.",
  });

  const searchCard = report.surfaces.find((surface) => surface.id === "search")?.owner_card;
  const websiteCard = report.surfaces.find((surface) => surface.id === "website")?.owner_card;
  const reputationCard = report.surfaces.find((surface) => surface.id === "reputation")?.owner_card;
  Object.assign(searchCard, {
    strength: "Карточка Google показывает высокий рейтинг и ведёт на сайт.",
    problem: "Точные запросы по приоритетным услугам не распределены между четырьмя каналами.",
    priority: "HIGH",
  });
  Object.assign(websiteCard, {
    strength: "Есть сильная страница Botox и активный блог.",
    problem: "Страницы услуг и статьи не объединены одной картой точных запросов.",
    priority: "HIGH",
  });
  Object.assign(reputationCard, {
    strength: "Рейтинг 4,9 и около 250 отзывов создают сильную основу доверия.",
    problem: "Рост честных отзывов и качество ответов владельца требуют постоянной системы.",
    priority: "HIGH",
  });

  const diagnosis = report.humanDiagnosis;
  diagnosis.objective_strength.title = "У Spoken есть сильная страница Botox, активный блог и рейтинг 4,9 в Google.";
  diagnosis.binding_constraint.title = "Нет единой системы запросов, контента и отзывов";
  diagnosis.binding_constraint.statement = "Точные запросы пациентов ещё не собраны в одну карту, блог не связан с постоянным планом для четырёх каналов, а рост отзывов и ответы владельца не оформлены как регулярная система.";
  diagnosis.binding_constraint.evidence_refs = [
    "website.treatment_clarity",
    "cross.proof_continuity",
    "reputation.rating",
    "reputation.negative_review_handling",
  ];
  diagnosis.binding_constraint.gap_ref = "SMS-26-01";
  diagnosis.current_state.strengths = [
    "Страница Botox понятно описывает услугу и показывает опыт Ivy Cleveland.",
    "Активный блог, рейтинг 4,9 и около 250 отзывов дают сильную основу доверия.",
  ];
  diagnosis.current_state.constraint_label = "Запросы, контент и отзывы ещё не работают как одна система";
  diagnosis.current_state.constraint_detail = "У клиники уже есть нужные части. Теперь их нужно связать: выбрать точные запросы, распределить их между четырьмя каналами и поддерживать единый смысл в публикациях, отзывах и ответах владельца.";
  diagnosis.current_state.priority_line = "Сначала собрать карту запросов. Затем привязать к ней план блога и постоянную систему честных отзывов с содержательными ответами владельца.";
  diagnosis.focus_selection.rationale = "Исправление этих трёх разрывов поможет пациенту быстрее найти нужную услугу, убедиться в выборе и перейти к записи.";

  const copyByGap = {
    "SMS-26-01": {
      title: "Собрать карту точных запросов",
      surfaces: ["search", "website", "social", "reputation", "cross_surface"],
      evidence_refs: ["website.treatment_clarity", "cross.proof_continuity"],
      why_it_matters: "Страницы услуг и статьи уже отвечают на разные вопросы пациентов. Но без одной карты непонятно, какой точный запрос ведёт на какую страницу и как он должен повторяться в Google, социальных сетях, отзывах и ответах владельца.",
      outcome: "Для каждой приоритетной услуги выбраны точные запросы с намерением записаться и указано, где использовать каждый запрос.",
      diy_steps: [
        "Выбрать приоритетные услуги и вопросы, которые пациент задаёт перед записью.",
        "Собрать основные и низкочастотные запросы с ясным намерением записаться.",
        "Утвердить единые названия услуг, специалистов и местоположения.",
        "Распределить запросы между страницами сайта, блогом, карточкой Google, социальными сетями и ответами владельца на отзывы.",
      ],
      dependencies: ["Список приоритетных услуг, данные о специалистах и местоположении."],
      owner_role: "Один человек, который утверждает карту запросов и общий словарь для четырёх каналов.",
      done_when: [
        "У каждой приоритетной услуги есть набор точных запросов с намерением записаться.",
        "Каждый запрос закреплён за страницей, статьёй, публикацией или ответом владельца.",
      ],
    },
    "SMS-26-02": {
      title: "Сделать блог регулярной системой",
      surfaces: ["website", "search", "social", "cross_surface"],
      evidence_refs: ["website.treatment_clarity", "cross.proof_continuity"],
      why_it_matters: "Блог ведётся: новые материалы опубликованы в августе и сентябре 2026 года. Но публикации выходят сериями, а постоянная связь каждой статьи с точным запросом, страницей услуги, Google и социальными сетями не показана.",
      outcome: "Блог выходит по понятному графику, отвечает на реальные вопросы пациентов и поддерживает одни и те же запросы во всех четырёх каналах.",
      diy_steps: [
        "Составить план материалов на восемь недель по приоритетным услугам и точным запросам.",
        "Для каждой статьи выбрать один вопрос пациента, одну страницу услуги и один следующий шаг к записи.",
        "После проверки медицинского текста сделать короткие версии для Google и социальных сетей.",
        "Раз в месяц проверять частоту публикаций и одинаковый ли смысл сохраняется во всех четырёх каналах.",
      ],
      dependencies: ["Карта точных запросов и человек, который проверяет медицинский текст."],
      owner_role: "Редактор и специалист, который подтверждает медицинскую точность материалов.",
      day_30_outcome: "Утверждён план на восемь недель. Первый материал опубликован в блоге и связан со страницей услуги, Google и социальными сетями.",
      beyond_day_30: "Продолжать публикации по графику, обновлять запросы и переносить один смысл на четыре канала.",
      done_when: [
        "Для ближайших восьми недель есть темы, запросы, ответственные и даты.",
        "Каждая статья ведёт на нужную страницу услуги и к понятному следующему шагу.",
      ],
    },
    "SMS-26-03": {
      title: "Регулярно собирать честные отзывы и улучшить ответы",
      surfaces: ["reputation", "search", "cross_surface"],
      evidence_refs: ["reputation.rating", "reputation.negative_review_handling"],
      why_it_matters: "Рейтинг 4,9 и около 250 отзывов — сильная основа. При этом About Face Skin Care имеет 5,0 и 726 отзывов, а в нескольких низких оценках Spoken повторяется тема общения по телефону и на стойке регистрации. Часть ответов владельца слишком общая.",
      outcome: "Все подходящие пациенты получают одинаковую честную просьбу об отзыве, а каждый ответ владельца учитывает содержание отзыва и сохраняет конфиденциальность.",
      diy_steps: [
        "Просить честный отзыв у всех подходящих пациентов по одному правилу — без отбора, оплаты и готового текста.",
        "Отвечать на каждый отзыв по существу. Не подтверждать лечение и не раскрывать личные данные.",
        "Раз в месяц отмечать повторяющиеся темы отзывов и передавать их в план сайта и блога.",
        "Сверять слова пациентов и ответы владельца с общей картой услуг, специалистов и местоположения без навязывания ключевых фраз.",
      ],
      dependencies: ["Единое правило просьбы об отзыве, ответственный сотрудник и правила конфиденциальности."],
      owner_role: "Один сотрудник Spoken, который следит за просьбами об отзыве, ответами и повторяющимися темами.",
      day_30_outcome: "Система честного сбора отзывов запущена. На новые отзывы даны содержательные ответы. Повторяющиеся темы переданы в план контента.",
      beyond_day_30: "Продолжать честный сбор отзывов, отвечать по существу и ежемесячно сверять повторяющиеся темы с четырьмя каналами.",
      done_when: [
        "Просьбу об отзыве получают все подходящие пациенты по одному правилу.",
        "Ответы владельца относятся к содержанию отзыва и не раскрывают личные данные.",
        "Повторяющиеся темы отзывов попадают в план улучшений и контента.",
      ],
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
    if (copy.surfaces) gap.surfaces = copy.surfaces;
    if (copy.evidence_refs) gap.evidence_refs = copy.evidence_refs;
    gap.why_it_matters = copy.why_it_matters;
    gap.repair_plan = {
      ...gap.repair_plan,
      outcome: copy.outcome,
      diy_steps: copy.diy_steps,
      dependencies: copy.dependencies,
      owner_role: copy.owner_role,
      ...(copy.day_30_outcome ? { day_30_outcome: copy.day_30_outcome } : {}),
      ...(copy.beyond_day_30 ? { beyond_day_30: copy.beyond_day_30 } : {}),
      done_when: copy.done_when,
    };
  }

  diagnosis.do_not_do.title = "Пока не увеличивать рекламный бюджет на Botox и филлеры";
  diagnosis.do_not_do.rationale = "Сначала нужно собрать карту точных запросов, связать с ней регулярные материалы и наладить честный сбор отзывов с содержательными ответами. Иначе реклама приведёт больше людей в несогласованный путь.";
  diagnosis.do_not_do.evidence_refs = [
    "website.treatment_clarity",
    "cross.proof_continuity",
    "reputation.rating",
    "reputation.negative_review_handling",
  ];
  diagnosis.do_not_do.revisit_after = [
    "Для каждой приоритетной услуги выбраны точные запросы с намерением записаться.",
    "Запросы распределены между сайтом, блогом, Google, социальными сетями, отзывами и ответами владельца.",
    "Утверждён и запущен регулярный план материалов.",
    "Запущена система честного сбора отзывов и содержательных ответов.",
    "Путь от поиска до записи проверен.",
  ];

  const competitorCopy = {
    "dermani-medspa-snellville": "Понятный путь: услуга → запись.",
    "about-face-snellville": "Понятно показаны специалисты и услуги.",
    "harper-haus": "Всё предложение строится вокруг одного специалиста.",
    "a-defined-image": "Сразу видны специалист и инъекционные услуги.",
  };
  for (const competitor of diagnosis.competitors.entries) {
    competitor.patient_choice_reason = competitorCopy[competitor.id] || competitor.patient_choice_reason;
    competitor.observable_advantage = competitorCopy[competitor.id] || competitor.observable_advantage;
    competitor.constraint_effect = "Помогает сравнить ясность предложения, объём отзывов и качество публичного доверия.";
    competitor.priority_effect = "Поддерживает работу с запросами, контентом и отзывами.";
  }
  diagnosis.competitors.sample_limitations = "Сайты проверены у четырёх локальных альтернатив. Рейтинг и число отзывов в Google сохранены для Spoken, dermani MEDSPA® Snellville, About Face Skin Care и A Defined Image Medical Wellness Centre; социальные сети сопоставлены не полностью.";
  diagnosis.competitors.review_sample_rule = "Сравниваем только видимые рейтинг, число отзывов, повторяющиеся темы и ответы владельца. Не делаем выводов о внутренних причинах.";
  diagnosis.competitors.comparison_window = { start: "2026-09-03", end: "2026-09-04" };

  const reputationBenchmarks = {
    "dermani-medspa-snellville": {
      finding: "Рейтинг 4,8 и 196 отзывов. Spoken выше по рейтингу и числу отзывов.",
      source: "https://www.google.com/maps/search/?api=1&query=dermani+MEDSPA+Snellville",
    },
    "about-face-snellville": {
      finding: "Рейтинг 5,0 и 726 отзывов. Это заметно больше отзывов, чем у Spoken.",
      source: "https://www.google.com/maps/search/?api=1&query=About+Face+Skin+Care+Snellville",
    },
    "a-defined-image": {
      finding: "Рейтинг 5,0 и 78 отзывов. Spoken заметно сильнее по числу отзывов.",
      source: "https://www.google.com/maps/search/?api=1&query=A+Defined+Image+Medical+Wellness+Centre+Snellville",
    },
  };
  for (const competitor of diagnosis.competitors.entries) {
    const benchmark = reputationBenchmarks[competitor.id];
    if (!benchmark) continue;
    const sourceEntry = {
      url_or_snapshot: benchmark.source,
      source_type: "maps",
      collected_at: "2026-09-04",
      sample_note: "Публичная карточка Google",
    };
    const existingIndex = competitor.sources.findIndex((candidate) => candidate.url_or_snapshot === benchmark.source);
    if (existingIndex >= 0) competitor.sources[existingIndex] = sourceEntry;
    else competitor.sources.push(sourceEntry);
    competitor.surface_evidence.reputation = {
      status: "observed",
      finding: benchmark.finding,
      evidence_refs: ["reputation.rating"],
    };
    competitor.observable_gap = benchmark.finding;
    competitor.limitations = "Сравнение рейтинга и числа отзывов сделано по видимой карточке Google на дату проверки. Полная выборка отзывов не выгружалась; повторений недостаточно для вывода о темах.";
  }
  for (const row of diagnosis.competitors.comparison_matrix.rows) {
    if (row.entity_ref === "subject") {
      row.search = "Карточка Google имеет рейтинг 4,9 и около 250 отзывов. Карта точных запросов по услугам не показана.";
      row.website = "Есть сильная страница Botox и активный блог. Их нужно связать одной картой запросов и постоянным планом материалов.";
      row.social = "Нужно повторять согласованные запросы и темы сайта и блога.";
      row.reputation = "Сильный рейтинг; нужен регулярный честный сбор отзывов и более содержательные ответы владельца.";
      row.evidence_refs = ["website.treatment_clarity", "reputation.rating", "reputation.negative_review_handling"];
      continue;
    }
    const benchmark = reputationBenchmarks[row.entity_ref];
    if (benchmark) {
      row.reputation = benchmark.finding;
      row.evidence_refs = [...new Set([...row.evidence_refs, "reputation.rating"])];
    }
  }
  diagnosis.competitors.decision_summary.defend[0].title = "Сохранить сильную сторону: опыт Ivy Cleveland";
  diagnosis.competitors.decision_summary.defend[0].rationale = "Опыт Ivy Cleveland уже помогает доверять Spoken.";
  diagnosis.competitors.decision_summary.close[0].title = "Наращивать объём отзывов и улучшать ответы";
  diagnosis.competitors.decision_summary.close[0].rationale = "У Spoken сильный рейтинг, но About Face Skin Care имеет почти втрое больше отзывов. Регулярный честный сбор и содержательные ответы помогут защищать доверие.";
  diagnosis.competitors.decision_summary.close[0].evidence_refs = ["reputation.rating", "reputation.negative_review_handling"];
  diagnosis.competitors.decision_summary.differentiate[0].title = "Показывать опыт Ivy Cleveland как преподавателя";
  diagnosis.competitors.decision_summary.differentiate[0].rationale = "Этот факт подтверждает её опыт без громких обещаний.";
  diagnosis.competitors.decision_summary.do_not_copy[0].title = "Не копировать скидки и громкие заявления";
  diagnosis.competitors.decision_summary.do_not_copy[0].rationale = "Скидки и громкие обещания ещё не доказывают качество или окупаемость.";

  report.implementation_paths = {
    diy: "Сделать всё своей командой по инструкциям ниже.",
    other_provider: "Передать отдельные задачи своим специалистам.",
    caesthetic: "Поручить CAESTHETIC спринт на 30 дней за $2,500. Мы согласуем четыре канала вокруг главного приоритета.",
    defer: "Сохранить отчёт и вернуться к нему позже.",
  };
  report.why_caesthetic = {
    evidence_advantage: "Факты и порядок работ уже собраны.",
    coordination_advantage: "CAESTHETIC согласует Google, сайт, социальные сети, отзывы и ответы владельца.",
    sprint_boundary: "За 30 дней внедряем один согласованный приоритет. Список работ утверждаем письменно. Стоимость — $2,500.",
    ownership: "Отчёт и инструкции остаются у Spoken. Ими можно пользоваться без CAESTHETIC.",
  };
}

function applyPlainOwnerCopyEnglish(report) {
  report.reportVersion = "spoken-medspa-snellville-public-evidence/en/1.6.2";
  report.verifiedFactSetVersion = "spoken-medspa-snellville-2026-09-04/4444-v1";
  report.disclosure = "This report uses public sources only. We did not assess internal operations, patient data, revenue, or treatment outcomes.";
  report.executiveSummary = "Spoken already has a strong Botox page, an active blog, and a high Google rating. The main task is to connect specific patient queries, consistent content, and reputation work into one system.";
  report.crossSurface.summary = "The website, blog, Google presence, social media, reviews, and owner responses should use one demand language: consistent services, providers, location, and specific patient queries.";

  const findMetric = (surfaceId, metricId) => report.surfaces
    .find((surface) => surface.id === surfaceId)
    ?.metrics.find((metric) => metric.metric_id === metricId);
  const findCrossMetric = (metricId) => report.crossSurface.metrics
    .find((metric) => metric.metric_id === metricId);
  const resetMetric = (metric) => {
    Object.assign(metric, {
      raw_value: null,
      normalized_score: null,
      evidence_class: "A",
      source: null,
      collected_at: null,
      reviewer_status: "pending",
    });
    delete metric.finding;
  };
  resetMetric(findMetric("search", "entity_integrity"));
  resetMetric(findCrossMetric("identity_coherence"));

  Object.assign(findMetric("website", "treatment_clarity"), {
    raw_value: "Botox, fillers, and related articles",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.spokenmedspa.com/neurotoxins-snellville-ga; https://www.spokenmedspa.com/dermal-fillers-snellville-ga; https://www.spokenmedspa.com/blog",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Service pages and the active blog answer patient questions, but the public materials do not show one map of specific queries and where each query should be used.",
  });
  Object.assign(findCrossMetric("proof_continuity"), {
    raw_value: "content is not connected through one query map",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.spokenmedspa.com/neurotoxins-snellville-ga; https://www.spokenmedspa.com/dermal-fillers-snellville-ga; https://www.spokenmedspa.com/blog; https://www.spokenmedspa.com/clients; https://msha.ke/spokenmedspa/",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Useful content exists, but its connection to the same specific queries across the website, Google, and social media is not presented as one system.",
  });
  Object.assign(findMetric("reputation", "rating"), {
    raw_value: "4.9 with about 250 reviews",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Spoken has a strong 4.9 rating with about 250 reviews. This is a strong foundation that should be maintained consistently.",
  });
  Object.assign(findMetric("reputation", "negative_review_handling"), {
    raw_value: "phone and front-desk communication appears repeatedly",
    normalized_score: null,
    evidence_class: "A",
    source: "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville",
    collected_at: "2026-09-04",
    reviewer_status: "approved",
    finding: "Several lower-rated reviews repeat concerns about phone and front-desk communication. Owner responses are present, but some are generic and one visible response does not address the complaint.",
  });

  const searchCard = report.surfaces.find((surface) => surface.id === "search")?.owner_card;
  const websiteCard = report.surfaces.find((surface) => surface.id === "website")?.owner_card;
  const reputationCard = report.surfaces.find((surface) => surface.id === "reputation")?.owner_card;
  Object.assign(searchCard, {
    strength: "The Google listing shows a high rating and links to the website.",
    problem: "Specific queries for priority services are not allocated across the four surfaces.",
    priority: "HIGH",
  });
  Object.assign(websiteCard, {
    strength: "Spoken has a strong Botox page and an active blog.",
    problem: "Service pages and articles are not connected through one map of specific queries.",
    priority: "HIGH",
  });
  Object.assign(reputationCard, {
    strength: "A 4.9 rating and about 250 reviews provide a strong trust foundation.",
    problem: "Consistent honest review collection and the quality of owner responses need an ongoing system.",
    priority: "HIGH",
  });

  const diagnosis = report.humanDiagnosis;
  diagnosis.objective_strength.title = "Spoken has a strong Botox page, an active blog, and a 4.9 Google rating.";
  diagnosis.binding_constraint.title = "Queries, content, and reviews are not yet one system";
  diagnosis.binding_constraint.statement = "Specific patient queries have not yet been organized into one map, the blog is not connected to an ongoing four-surface content plan, and review growth and owner responses are not managed as a consistent system.";
  diagnosis.binding_constraint.evidence_refs = [
    "website.treatment_clarity",
    "cross.proof_continuity",
    "reputation.rating",
    "reputation.negative_review_handling",
  ];
  diagnosis.binding_constraint.gap_ref = "SMS-26-01";
  diagnosis.current_state.strengths = [
    "The Botox page explains the service clearly and shows Ivy Cleveland's experience.",
    "An active blog, a 4.9 rating, and about 250 reviews provide a strong trust foundation.",
  ];
  diagnosis.current_state.constraint_label = "Queries, content, and reviews do not yet work as one system";
  diagnosis.current_state.constraint_detail = "Spoken already has the necessary parts. The next step is to connect them: choose specific patient queries, allocate them across the four surfaces, and preserve one meaning in content, reviews, and owner responses.";
  diagnosis.current_state.priority_line = "First build the query map. Then connect it to a regular blog plan and an ongoing system for honest reviews and substantive owner responses.";
  diagnosis.focus_selection.rationale = "Closing these three gaps will help patients find the right service, feel confident in their choice, and move toward booking.";

  const copyByGap = {
    "SMS-26-01": {
      title: "Build a map of specific patient queries",
      surfaces: ["search", "website", "social", "reputation", "cross_surface"],
      evidence_refs: ["website.treatment_clarity", "cross.proof_continuity"],
      why_it_matters: "Service pages and articles already answer different patient questions. Without one map, however, it is unclear which specific query should lead to which page and how that language should carry through Google, social media, reviews, and owner responses.",
      outcome: "Each priority service has specific booking-intent queries and a defined place where each query should be used.",
      diy_steps: [
        "Choose the priority services and questions patients ask before booking.",
        "Collect core and long-tail queries with clear booking intent.",
        "Approve consistent names for services, providers, and the location.",
        "Allocate the queries across website pages, the blog, Google Business Profile, social media, reviews, and owner responses.",
      ],
      dependencies: ["A list of priority services plus confirmed provider and location details."],
      owner_role: "One person who approves the query map and shared vocabulary for all four surfaces.",
      done_when: [
        "Every priority service has a set of specific queries with booking intent.",
        "Every query is assigned to a page, article, post, or owner response.",
      ],
    },
    "SMS-26-02": {
      title: "Turn the blog into a consistent system",
      surfaces: ["website", "search", "social", "cross_surface"],
      evidence_refs: ["website.treatment_clarity", "cross.proof_continuity"],
      why_it_matters: "The blog is active, with new articles published in August and September 2026. However, posts appear in batches, and the public materials do not show a consistent link between every article, a specific query, the relevant service page, Google, and social media.",
      outcome: "The blog follows a clear schedule, answers real patient questions, and reinforces the same queries across all four surfaces.",
      diy_steps: [
        "Create an eight-week content plan around priority services and specific queries.",
        "Give each article one patient question, one service page, and one clear next step toward booking.",
        "After medical review, create shorter versions for Google and social media.",
        "Review publication cadence monthly and confirm that the same meaning remains consistent across all four surfaces.",
      ],
      dependencies: ["The approved query map and a person responsible for medical accuracy."],
      owner_role: "An editor and a qualified reviewer who confirms medical accuracy.",
      day_30_outcome: "An eight-week plan is approved. The first article is published and connected to its service page, Google, and social media.",
      beyond_day_30: "Continue publishing on schedule, update the query map, and carry one consistent meaning across all four surfaces.",
      done_when: [
        "The next eight weeks have topics, queries, owners, and publication dates.",
        "Every article links to the relevant service page and a clear next step.",
      ],
    },
    "SMS-26-03": {
      title: "Collect honest reviews consistently and improve owner responses",
      surfaces: ["reputation", "search", "cross_surface"],
      evidence_refs: ["reputation.rating", "reputation.negative_review_handling"],
      why_it_matters: "A 4.9 rating with about 250 reviews is a strong foundation. About Face Skin Care has a 5.0 rating and 726 reviews, while several lower-rated Spoken reviews repeat concerns about phone and front-desk communication. Some owner responses are too generic.",
      outcome: "Every eligible patient receives the same honest review request, and every owner response addresses the review while protecting privacy.",
      diy_steps: [
        "Ask every eligible patient for an honest review under one consistent rule—without filtering, payment, incentives, or prewritten text.",
        "Respond to each review substantively. Do not confirm treatment or disclose personal information.",
        "Identify recurring review themes monthly and feed them into the website and blog plan.",
        "Compare patient language and owner responses with the shared map of services, providers, and location without forcing keywords into patient speech.",
      ],
      dependencies: ["One review-request rule, an accountable owner, and privacy-safe response guidance."],
      owner_role: "One Spoken team member who owns review requests, responses, and recurring-theme review.",
      day_30_outcome: "The honest review-request system is live. New reviews receive substantive responses, and recurring themes are included in the content plan.",
      beyond_day_30: "Continue requesting honest reviews, respond substantively, and compare recurring themes with the four-surface plan each month.",
      done_when: [
        "Every eligible patient receives the same review request under one rule.",
        "Owner responses address the review and do not disclose personal information.",
        "Recurring review themes enter the improvement and content plan.",
      ],
    },
    "SMS-26-04": {
      title: "Remove stray and placeholder copy from secondary pages",
      why_it_matters: "Unrelated copy weakens the overall website experience.",
      outcome: "Adjacent pages contain only reviewed, service-relevant copy.",
      diy_steps: ["Review adjacent pages and remove unrelated or placeholder content."],
      dependencies: [],
      owner_role: "Website owner.",
      done_when: ["Known unrelated and placeholder copy is removed."],
    },
  };
  for (const gap of diagnosis.gap_inventory) {
    const copy = copyByGap[gap.id];
    if (!copy) continue;
    gap.title = copy.title;
    if (copy.surfaces) gap.surfaces = copy.surfaces;
    if (copy.evidence_refs) gap.evidence_refs = copy.evidence_refs;
    gap.why_it_matters = copy.why_it_matters;
    gap.repair_plan = {
      ...gap.repair_plan,
      outcome: copy.outcome,
      diy_steps: copy.diy_steps,
      dependencies: copy.dependencies,
      owner_role: copy.owner_role,
      ...(copy.day_30_outcome ? { day_30_outcome: copy.day_30_outcome } : {}),
      ...(copy.beyond_day_30 ? { beyond_day_30: copy.beyond_day_30 } : {}),
      done_when: copy.done_when,
    };
  }

  diagnosis.do_not_do.title = "Do not increase paid media for Botox or fillers yet";
  diagnosis.do_not_do.rationale = "First build the specific-query map, connect it to consistent content, and establish an honest review system with substantive owner responses. Otherwise, paid media would send more people into an inconsistent journey.";
  diagnosis.do_not_do.evidence_refs = [
    "website.treatment_clarity",
    "cross.proof_continuity",
    "reputation.rating",
    "reputation.negative_review_handling",
  ];
  diagnosis.do_not_do.revisit_after = [
    "Specific booking-intent queries are selected for every priority service.",
    "Queries are allocated across the website, blog, Google, social media, reviews, and owner responses.",
    "A consistent content plan is approved and active.",
    "The honest review-request and substantive-response system is active.",
    "The journey from search to booking has been checked.",
  ];

  const competitorCopy = {
    "dermani-medspa-snellville": "A clear service-to-booking path.",
    "about-face-snellville": "Providers and services are easy to understand.",
    "harper-haus": "The entire offer is organized around one named provider.",
    "a-defined-image": "The provider and injectable services are immediately visible.",
  };
  for (const competitor of diagnosis.competitors.entries) {
    competitor.patient_choice_reason = competitorCopy[competitor.id] || competitor.patient_choice_reason;
    competitor.observable_advantage = competitorCopy[competitor.id] || competitor.observable_advantage;
    competitor.constraint_effect = "Helps compare offer clarity, review volume, and the quality of public trust.";
    competitor.priority_effect = "Supports the work on queries, content, and reviews.";
  }
  diagnosis.competitors.sample_limitations = "Websites were reviewed for four local alternatives. Google rating and review count were retained for Spoken, dermani MEDSPA® Snellville, About Face Skin Care, and A Defined Image Medical Wellness Centre; social media was not compared comprehensively.";
  diagnosis.competitors.review_sample_rule = "We compare only visible ratings, review counts, recurring themes, and owner responses. We do not infer internal causes.";
  diagnosis.competitors.comparison_window = { start: "2026-09-03", end: "2026-09-04" };

  const reputationBenchmarks = {
    "dermani-medspa-snellville": {
      finding: "4.8 rating with 196 reviews. Spoken has a higher rating and more reviews.",
      source: "https://www.google.com/maps/search/?api=1&query=dermani+MEDSPA+Snellville",
    },
    "about-face-snellville": {
      finding: "5.0 rating with 726 reviews. This is substantially more review volume than Spoken.",
      source: "https://www.google.com/maps/search/?api=1&query=About+Face+Skin+Care+Snellville",
    },
    "a-defined-image": {
      finding: "5.0 rating with 78 reviews. Spoken has substantially more review volume.",
      source: "https://www.google.com/maps/search/?api=1&query=A+Defined+Image+Medical+Wellness+Centre+Snellville",
    },
  };
  for (const competitor of diagnosis.competitors.entries) {
    const benchmark = reputationBenchmarks[competitor.id];
    if (!benchmark) continue;
    const sourceEntry = {
      url_or_snapshot: benchmark.source,
      source_type: "maps",
      collected_at: "2026-09-04",
      sample_note: "Public Google listing",
    };
    const existingIndex = competitor.sources.findIndex((candidate) => candidate.url_or_snapshot === benchmark.source);
    if (existingIndex >= 0) competitor.sources[existingIndex] = sourceEntry;
    else competitor.sources.push(sourceEntry);
    competitor.surface_evidence.reputation = {
      status: "observed",
      finding: benchmark.finding,
      evidence_refs: ["reputation.rating"],
    };
    competitor.observable_gap = benchmark.finding;
    competitor.limitations = "The rating and review-count comparison uses the visible Google listing on the review date. The full review corpus was not exported, so there is insufficient repetition to conclude comparative themes.";
  }
  for (const row of diagnosis.competitors.comparison_matrix.rows) {
    if (row.entity_ref === "subject") {
      row.search = "The Google listing has a 4.9 rating with about 250 reviews. A map of specific service queries is not shown.";
      row.website = "Spoken has a strong Botox page and an active blog. They should be connected through one query map and a consistent content plan.";
      row.social = "Social content should repeat the approved queries and themes from the website and blog.";
      row.reputation = "Strong rating; consistent honest review collection and more substantive owner responses are needed.";
      row.evidence_refs = ["website.treatment_clarity", "reputation.rating", "reputation.negative_review_handling"];
      continue;
    }
    const benchmark = reputationBenchmarks[row.entity_ref];
    if (benchmark) {
      row.reputation = benchmark.finding;
      row.evidence_refs = [...new Set([...row.evidence_refs, "reputation.rating"])];
    }
  }
  diagnosis.competitors.decision_summary.defend[0].title = "Protect Ivy Cleveland's experience as a strength";
  diagnosis.competitors.decision_summary.defend[0].rationale = "Ivy Cleveland's experience already supports trust in Spoken.";
  diagnosis.competitors.decision_summary.close[0].title = "Grow review volume and improve owner responses";
  diagnosis.competitors.decision_summary.close[0].rationale = "Spoken has a strong rating, but About Face Skin Care has nearly three times as many reviews. Consistent honest review requests and substantive responses will help protect trust.";
  diagnosis.competitors.decision_summary.close[0].evidence_refs = ["reputation.rating", "reputation.negative_review_handling"];
  diagnosis.competitors.decision_summary.differentiate[0].title = "Show Ivy Cleveland's experience as an educator";
  diagnosis.competitors.decision_summary.differentiate[0].rationale = "This verified fact supports experience without an inflated claim.";
  diagnosis.competitors.decision_summary.do_not_copy[0].title = "Do not copy discounts or inflated claims";
  diagnosis.competitors.decision_summary.do_not_copy[0].rationale = "Discounts and broad claims do not prove quality or return on investment.";

  report.implementation_paths = {
    diy: "Implement the complete plan with the Spoken team.",
    other_provider: "Assign individual workstreams to your existing specialists.",
    caesthetic: "Ask CAESTHETIC to run a $2,500 30-Day Growth Sprint that aligns all four surfaces around the primary priority.",
    defer: "Keep the report and revisit it later.",
  };
  report.why_caesthetic = {
    evidence_advantage: "The facts and dependency order are already assembled.",
    coordination_advantage: "CAESTHETIC aligns Google, the website, social media, reviews, and owner responses.",
    sprint_boundary: "We implement one agreed priority in 30 days. The exact scope is confirmed in writing. Price: $2,500.",
    ownership: "Spoken keeps the report and instructions and may use them without CAESTHETIC.",
  };
}

export function buildEnglishReport(source = JSON.parse(fs.readFileSync(sourceReportPath, "utf8"))) {
  const report = structuredClone(source);
  report.reportContext.report_locale = "en";
  report.reportContext.locale_source = "user_selected";
  applyPlainOwnerCopyEnglish(report);
  report.leadToRevenueCheck = {
    recommendation: "recommended",
    reason: "Public evidence shows only the journey up to the enquiry. Response, booking, attendance, and payment require a separate review of authorized internal evidence.",
    evidence_refs: [
      "website.above_fold_conversion",
      "cross.positioning_coherence",
    ],
  };
  report.presentation = {
    kind: "localized_client",
    strict_locale: "en",
    copy_profile: "plain_owner_en",
    layout_contract: OWNER_BRIEF_LAYOUT_CONTRACT,
    vertical_profile: "med_spa",
    hide_unassessed: true,
    commercial_contract: "caesthetic-4444-commercial-core/1.0.0",
    check500_placement_contract: "check500-two-placement/1.0.0",
    check500_style_contract: CHECK500_STYLE_CONTRACT,
    owner_copy: {
      header: {
        kicker: "Executive brief · Growth Score",
        prepared_label: "Prepared",
      },
      assessment_state: "Facts verified. Action plan ready.",
      ui: {
        header_kicker: "Executive brief · Growth Score",
        prepared_label: "Prepared",
        assessment_label: "Status",
        constraint_label: "Constraint",
        observed_label: "What we found",
        impact_label: "Why it matters",
        outcome_label: "What should change",
        done_label: "How to know it is complete",
        open_sources_label: "Open facts and sources",
        open_source_label: "Open source",
        cross_surface_label: "Connections across the four surfaces",
        competitor_sources_label: "Competitor sources",
        why_included_label: "Why included",
        why_chosen_label: "Why a patient may choose them",
        observed_advantage_label: "What is visible",
        source_date_label: "Reviewed",
        repair_intro: "Open the relevant item. Complete it in-house or assign it to your specialists.",
        repair_outcome_label: "What should change",
        repair_steps_label: "What to do",
        repair_dependencies_label: "What is needed",
        repair_owner_label: "Who owns it",
        repair_done_label: "How to verify",
        revisit_label: "When to revisit paid media",
        paths_coordination_label: "How to coordinate",
        paths_risk_label: "Risk",
        sprint_client_input_label: "What we need from Spoken",
        sprint_acceptance_label: "What we verify on Day 30",
        conclusion_title: "What to do first",
        strength_label: "What is already working",
        check_aria_label: "Lead-to-Revenue Check for $500",
        check_mid_placement_label: "middle of report",
        check_final_placement_label: "end of report",
      },
      surface_labels: {
        search: "Search",
        website: "Website",
        social: "Social",
        reputation: "Reviews and owner responses",
        cross_surface: "Connections across the four surfaces",
      },
      greeting: {
        kicker: "A note from Valerie",
        title: "Hello, Ivy.",
        body: "We reviewed your patient's journey: how they find Spoken, compare practices, and decide where to book. Below are the three main barriers and a straightforward action plan.",
        signature: "Valerie Petra · CAESTHETIC",
      },
      research_scope: {
        kicker: "What we reviewed",
        title: "Sources reviewed",
        links: [
          ["Website", "https://www.spokenmedspa.com/"],
          ["Google Maps", "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville"],
          ["Social media", "https://msha.ke/spokenmedspa/"],
        ],
      },
      intro: {
        kicker: "How to use this report",
        title: "What this report will show you",
        items: [
          "where a patient may leave",
          "what competitors make easier to understand",
          "what to fix in 30 days",
          "what not to fund yet",
          "how to implement the changes in-house or with specialists",
        ],
        note: "Start with the three main constraints. Then choose an implementation path and open the step-by-step instructions.",
      },
      method_intro: {
        kicker: "Where the review begins",
        title: "How Connect4 checks consistency across all four surfaces",
        intro: "First, we identify 10 key phrases patients use to find your services. Then we check whether the same language carries through Google, the website, social media, reviews, and your team's responses.",
        list_title: "What we check",
        surfaces: [
          { title: "Search and Google", body: "Services, descriptions, posts, and the business profile." },
          { title: "Website and blog", body: "Service pages, articles, key wording, and the path to booking." },
          { title: "Social media", body: "Instagram, Facebook, TikTok, and YouTube; post copy, video transcripts, comments, and replies." },
          { title: "Reviews and reputation", body: "Patient reviews, their wording, owner responses, and recurring themes." },
        ],
        center: "Connect4",
        conclusion: "This is Connect4 consistency. A patient may start with Google, Instagram, the website, or reviews—but they should recognize the same service, the same wording, and the same meaning everywhere.",
      },
      section_titles: [
        "The three primary constraints",
        "A brief map of the patient journey",
        "What cannot be verified without practice data",
        "Competitor research",
        "STOP",
        "CONCLUSION",
        "Choose who will implement the changes",
        "Order of work",
        "Step-by-step instructions",
      ],
      section_kickers: [
        "What gets in the way of booking",
        "Patient journey",
        "What happens after a patient enquiry",
        "What competitors make easier to understand",
        "Do not fund yet",
        "Primary conclusion",
        "Three implementation paths",
        "30-day plan",
        "For your team and specialists",
      ],
      thirty_day_steps: [
        ["Days 1–7", "Choose priority services. Collect core and long-tail queries with clear booking intent."],
        ["Days 8–14", "Approve consistent service, provider, and location names. Allocate queries across the website, blog, Google, social media, reviews, and owner responses."],
        ["Days 15–21", "Create an eight-week content plan. Publish the first article and connect it to the relevant service page, Google, and social media."],
        ["Days 22–30", "Launch one honest review request for every eligible patient and substantive owner responses."],
        ["Day 30", "Recheck demand language across all four surfaces, verify the path to booking, and record the result."],
      ],
      thirty_day_note: "This is the recommended order for in-house implementation, not a pre-purchased scope of services.",
      internal_boundary: {
        kicker: "What happens after a patient enquiry",
        title: "What cannot be verified without practice data",
        body: "Public sources show only the journey up to the enquiry. Finding losses after that point requires authorized internal evidence about response, booking, attendance, consultation, and payment.",
        public_label: "Visible without access",
        public_path: "Search → website → enquiry",
        private_label: "Requires authorized access",
        private_path: "Response → booking → attendance → consultation → payment",
        asset_src: "/assets/img/growth-score/lead-to-revenue-map-en.svg",
        asset_alt: "Patient journey after an enquiry, from response through payment",
        asset_caption: "Public sources do not show these stages. Reviewing them requires authorized practice data.",
      },
      competitor: {
        kicker: "Competitor comparison",
        title: "Why a patient may choose another practice",
        intro: "We reviewed the websites of four local practices. Below is only what matters to Spoken's decision.",
        decision_labels: ["Defend", "Close", "Differentiate", "Do not copy"],
      },
      evidence: {
        title: "Verified facts and source links",
        intro: "The report shows only conclusions that can be checked. The original sources are available here.",
      },
      conclusion: "Start with the map of specific patient queries. Then connect it to a regular blog, Google, social media, reviews, and owner responses. This turns three separate activities into one Connect4 system.",
      caesthetic_path_title: "Ask CAESTHETIC to implement",
      caesthetic_path_body: "CAESTHETIC keeps one meaning and one set of names consistent across Google, the website, social media, reviews, and owner responses.",
      implementation_options: [
        {
          title: "Implement in-house",
          body: "Assign one accountable owner and complete the plan with the Spoken team.",
          coordination: "One person approves the names, sequence, and acceptance criteria across all four surfaces.",
          risk: "Without shared oversight, Google, the website, social media, reviews, and owner responses may drift apart again.",
        },
        {
          title: "Use your existing specialists",
          body: "Assign workstreams to your specialists while keeping overall coordination inside Spoken.",
          coordination: "One coordinator gives every specialist the same names, phrases, and acceptance criteria.",
          risk: "Each specialist may improve an individual channel without improving the complete patient journey.",
        },
        {
          title: "Ask CAESTHETIC to implement",
          body: "Give CAESTHETIC the primary Connect4 priority: align all four surfaces.",
          coordination: "We preserve one meaning and one set of names across Google, the website, social media, reviews, and owner responses.",
          risk: "Spoken must provide timely medical review, the required access, and one accountable decision-maker.",
        },
      ],
      sprint_offer: {
        kicker: "Primary recommendation",
        title: "Align all four surfaces in 30 days",
        price: "$2,500 · 30 days",
        body: "CAESTHETIC aligns Google, the website, social media, reviews, and owner responses. The exact worklist is confirmed in writing before the Sprint begins.",
        items: [
          "Core and specific patient queries for priority services.",
          "Consistent names and query allocation across all four surfaces.",
          "Regular content, honest review requests, and substantive owner responses.",
          "A Day-30 recheck across all four surfaces.",
        ],
        client_input: "Confirmed service and provider names, medically reviewed copy, required access, and one accountable decision-maker.",
        acceptance: "Changes are live. All four surfaces are checked again. The result and remaining issues are recorded.",
        boundary: "No specific rankings, patient volume, revenue, or return on investment are promised.",
        cta: "Discuss the 30-Day Growth Sprint",
      },
      check500: {
        copy_contract: "check500-section/en-US/1.0.0",
        product_line: "Lead-to-Revenue Check · $500",
        price: "$500",
        title: "Do all your enquiries make it to a booking?",
        body: "See what happens after a prospective patient contacts your practice — from the first response and follow-up to booking, consultation and payment — and find where enquiries may be getting lost.",
        cta: "Check My Lead-to-Revenue Path",
        fine_print: "If you move directly into the next qualifying 30-Day Growth Sprint, your $500 Check fee is credited toward the $2,500 Sprint total.",
        boundary: "The Check does not promise a specific revenue, patient, or return-on-investment outcome.",
        mid: {
          kicker: "Review the internal journey",
        },
        final: {
          kicker: "If you prefer a smaller first step",
        },
        final_intro: "The $500 Check is available separately and is not required before the Sprint.",
      },
    },
    official_names: [
      "CAESTHETIC",
      "Connect4",
      "Spoken Med Spa",
      "Spoken",
      "Ivy",
      "Ivy Cleveland",
      "Botox",
      "Spoken Aesthetic Academy",
      "Academy",
      "Google",
      "Instagram",
      "Facebook",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "dermani MEDSPA® Snellville",
      "About Face Skin Care - Snellville",
      "About Face Skin Care",
      "Harper Haus Aesthetics & Wellness",
      "A Defined Image Medical Wellness Centre",
    ],
  };
  report.audit = {
    ...report.audit,
    project_id: source.audit.project_id,
    access_group_id: source.audit.access_group_id,
    public_direct_link: false,
  };
  report.catalog = {
    visibility: "private",
    public_listing_approved: false,
  };
  return report;
}

export function buildRussianReport(source = JSON.parse(fs.readFileSync(sourceReportPath, "utf8"))) {
  const report = translateStrings(buildEnglishReport(source));
  report.reportContext.report_locale = "ru";
  report.reportContext.locale_source = "user_selected";
  applyPlainOwnerCopy(report);
  report.leadToRevenueCheck = {
    recommendation: "recommended",
    reason: "По открытым данным виден только путь до обращения. Чтобы найти потери после него, нужно отдельно проверить ответ, запись, визит и оплату.",
    evidence_refs: [
      "website.above_fold_conversion",
      "cross.positioning_coherence",
    ],
  };
  report.presentation = {
    kind: "localized_client",
    strict_locale: "ru",
    copy_profile: "plain_owner_ru",
    layout_contract: OWNER_BRIEF_LAYOUT_CONTRACT,
    vertical_profile: "med_spa",
    hide_unassessed: true,
    commercial_contract: "caesthetic-4444-commercial-core/1.0.0",
    check500_placement_contract: "check500-two-placement/1.0.0",
    check500_style_contract: CHECK500_STYLE_CONTRACT,
    owner_copy: {
      header: {
        kicker: "Краткий обзор · Оценка роста",
        prepared_label: "Подготовлено",
      },
      assessment_state: "Факты проверены. План действий готов.",
      ui: {
        header_kicker: "Краткий обзор · Оценка роста",
        prepared_label: "Подготовлено",
        assessment_label: "Что готово",
        constraint_label: "Проблема",
        observed_label: "Что нашли",
        impact_label: "Почему это мешает",
        outcome_label: "Что должно измениться",
        done_label: "Как понять, что готово",
        open_sources_label: "Открыть факты и источники",
        open_source_label: "Открыть источник",
        cross_surface_label: "Связи между четырьмя каналами",
        competitor_sources_label: "Источники о конкурентах",
        why_included_label: "Почему включён",
        why_chosen_label: "Почему пациент может выбрать",
        observed_advantage_label: "Что видно",
        source_date_label: "Проверено",
        repair_intro: "Откройте нужный пункт. Сделайте сами или передайте специалистам.",
        repair_outcome_label: "Что должно измениться",
        repair_steps_label: "Что сделать",
        repair_dependencies_label: "Что нужно",
        repair_owner_label: "Кто отвечает",
        repair_done_label: "Как проверить",
        revisit_label: "Когда вернуться к рекламе",
        paths_coordination_label: "Как организовать работу",
        paths_risk_label: "Риск",
        sprint_client_input_label: "Что нужно от Spoken",
        sprint_acceptance_label: "Что проверим на 30-й день",
        conclusion_title: "Что делать сначала",
        strength_label: "Что уже хорошо",
        check_aria_label: "Проверка пути после обращения за 500 долларов",
        check_mid_placement_label: "середина отчёта",
        check_final_placement_label: "конец отчёта",
      },
      surface_labels: {
        search: "Поиск",
        website: "Сайт",
        social: "Социальные сети",
        reputation: "Отзывы и ответы владельца",
        cross_surface: "Связи между четырьмя каналами",
      },
      greeting: {
        kicker: "Приветствие от Валерии",
        title: "Здравствуйте, Ivy.",
        body: "Мы проверили путь вашего пациента: как он находит Spoken, сравнивает клиники и выбирает, куда записаться. Ниже — три главные помехи и простой план действий.",
        signature: "Валерия Петра · CAESTHETIC",
      },
      research_scope: {
        kicker: "Что мы изучили",
        title: "Изученные ссылки",
        links: [
          ["Сайт", "https://www.spokenmedspa.com/"],
          ["Карты Google", "https://www.google.com/maps/search/?api=1&query=Spoken+Med+Spa+Snellville"],
          ["Социальные сети", "https://msha.ke/spokenmedspa/"],
        ],
      },
      intro: {
        kicker: "Как пользоваться отчётом",
        title: "Что вы узнаете из отчёта",
        items: [
          "где пациент может уйти",
          "что у конкурентов понятнее",
          "что исправить за 30 дней",
          "куда пока не вкладывать деньги",
          "как внедрить изменения самим или с помощью специалистов",
        ],
        note: "Сначала прочитайте три главные проблемы. Затем выберите способ внедрения и откройте пошаговые инструкции.",
      },
      method_intro: {
        kicker: "С чего начинается проверка",
        title: "Проверяем соответствие во всех четырёх плоскостях",
        intro: "Сначала мы определяем 10 ключевых фраз, по которым пациенты ищут ваши услуги. Затем проверяем, одинаково ли этот язык проходит через Google, сайт, социальные сети, отзывы и ответы вашей команды.",
        list_title: "Что мы проверяем",
        surfaces: [
          { title: "Поиск и Google", body: "Услуги, описания, публикации, карточка компании." },
          { title: "Сайт и блог", body: "Страницы услуг, статьи, ключевые формулировки, путь к записи." },
          { title: "Социальные сети", body: "Instagram, Facebook, TikTok, YouTube; тексты постов, транскрипции видео, комментарии и ответы." },
          { title: "Отзывы и репутация", body: "Отзывы пациентов, их формулировки, ответы владельца и повторяющиеся темы." },
        ],
        center: "10 ключевых фраз",
        conclusion: "Это и есть соответствие. Пациент может начать путь с Google, Instagram, сайта или отзывов — но везде он должен узнавать ту же услугу, те же формулировки и тот же смысл.",
      },
      section_titles: [
        "Три главные ограничения",
        "Краткая карта пути пациента",
        "Что нельзя проверить без данных клиники",
        "Исследование конкурентов",
        "СТОП",
        "ВЫВОДЫ",
        "Выберите, кто внедрит изменения",
        "Порядок работ",
        "Пошаговые инструкции",
      ],
      section_kickers: [
        "Что мешает записи",
        "Путь пациента",
        "Что происходит после обращения пациента",
        "Что у конкурентов понятнее",
        "Пока не финансировать",
        "Главный вывод",
        "Только три варианта",
        "План на 30 дней",
        "Для своей команды и подрядчиков",
      ],
      thirty_day_steps: [
        ["Дни 1–7", "Выбрать приоритетные услуги. Собрать основные и низкочастотные запросы с намерением записаться."],
        ["Дни 8–14", "Утвердить единые названия услуг, специалистов и местоположения. Распределить запросы между сайтом, блогом, Google, социальными сетями, отзывами и ответами владельца."],
        ["Дни 15–21", "Составить план материалов на восемь недель. Опубликовать первый материал и связать его со страницей услуги, Google и социальными сетями."],
        ["Дни 22–30", "Запустить одинаковую честную просьбу об отзыве для всех подходящих пациентов и содержательные ответы владельца."],
        ["День 30", "Сверить язык спроса во всех четырёх каналах, проверить путь к записи и сохранить результат."],
      ],
      thirty_day_note: "Это рекомендуемый порядок самостоятельной работы, а не заранее купленный объём услуг.",
      internal_boundary: {
        kicker: "Что происходит после обращения пациента",
        title: "Что нельзя проверить без данных клиники",
        body: "Публично виден только путь до обращения. Чтобы найти потери после него, нужно проверить скорость ответа, запись, визит и оплату по внутренним данным.",
        public_label: "Видно без доступа",
        public_path: "Поиск → сайт → обращение",
        private_label: "Можно проверить только с доступом",
        private_path: "Ответ → запись → визит → оплата",
        asset_src: "/assets/img/growth-score/lead-to-revenue-map-ru.svg",
        asset_alt: "Путь пациента после обращения: от ответа до оплаты",
        asset_caption: "Открытые источники не показывают эти этапы. Для проверки нужен доступ к данным клиники.",
      },
      competitor: {
        kicker: "Сравнение с конкурентами",
        title: "Почему пациент может выбрать другую клинику",
        intro: "Мы посмотрели сайты четырёх местных клиник. Ниже — только то, что важно для решения Spoken.",
        decision_labels: ["Сохранить", "Исправить", "Выделить", "Не копировать"],
      },
      evidence: {
        title: "Проверенные факты и ссылки на источники",
        intro: "В отчёте показаны только выводы, которые можно проверить. Здесь находятся исходные страницы.",
      },
      conclusion: "Начните с карты точных запросов. Затем свяжите с ней регулярный блог, Google, социальные сети, отзывы и ответы владельца. Так три отдельных действия станут одной системой 4444.",
      caesthetic_path_title: "Поручить внедрение CAESTHETIC",
      caesthetic_path_body: "CAESTHETIC сохранит один смысл и одни названия в Google, на сайте, в социальных сетях, отзывах и ответах владельца.",
      implementation_options: [
        {
          title: "Сделать внутри команды",
          body: "Назначить одного ответственного и выполнить план силами Spoken.",
          coordination: "Один человек утверждает названия, порядок работ и результат во всех четырёх каналах.",
          risk: "Без общего контроля Google, сайт, социальные сети, отзывы и ответы владельца снова начнут говорить по-разному.",
        },
        {
          title: "Поручить своим специалистам",
          body: "Раздать задачи подрядчикам, но оставить общее управление внутри Spoken.",
          coordination: "Один координатор даёт всем одинаковые названия, фразы и критерии готовности.",
          risk: "Каждый подрядчик может улучшить свой канал, но не общий путь пациента.",
        },
        {
          title: "Поручить внедрение CAESTHETIC",
          body: "Передать CAESTHETIC главный приоритет 4444: согласовать четыре канала.",
          coordination: "Мы сохраняем один смысл и одни названия в Google, на сайте, в социальных сетях, отзывах и ответах владельца.",
          risk: "Spoken должна вовремя подтвердить медицинский текст, дать доступы и согласовать результат.",
        },
      ],
      sprint_offer: {
        kicker: "Основная рекомендация",
        title: "Согласовать четыре канала за 30 дней",
        price: "$2,500 · 30 дней",
        body: "CAESTHETIC согласует Google, сайт, социальные сети, отзывы и ответы владельца. Точный список работ утвердим письменно до начала.",
        items: [
          "Основные и точные поисковые запросы для важных услуг.",
          "Единые названия и распределение запросов между четырьмя каналами.",
          "Регулярные материалы, честные отзывы и ответы владельца.",
          "Повторная проверка четырёх каналов на 30-й день.",
        ],
        client_input: "Названия услуг и специалистов, согласованный медицинский текст, нужные доступы и один ответственный.",
        acceptance: "Изменения опубликованы. Четыре канала проверены снова. Результат и оставшиеся проблемы записаны.",
        boundary: "Мы не обещаем конкретные позиции в поиске, число пациентов, выручку или окупаемость.",
        cta: "Обсудить спринт на 30 дней",
      },
      check500: {
        copy_contract: "check500-section/en-US/1.0.0",
        product_line: "Проверка пути от обращения до оплаты · $500",
        price: "$500",
        title: "Все ли обращения доходят до записи?",
        body: "Проверим путь после обращения: первый ответ, повторную связь, запись, консультацию и оплату. Покажем, на каком шаге могут теряться обращения.",
        cta: "Проверить обращения за $500",
        fine_print: "Если после проверки вы сразу заказываете подходящий спринт, $500 войдут в его стоимость $2,500.",
        boundary: "Проверка не обещает рост выручки, число пациентов или окупаемость.",
        mid: {
          kicker: "Проверка внутреннего пути",
        },
        final: {
          kicker: "Если сначала нужен меньший шаг",
        },
        final_intro: "Проверку за $500 можно заказать отдельно. Она не обязательна перед спринтом. Мы проверим, что происходит после обращения пациента. Если затем вы сразу закажете подходящий спринт, $500 войдут в его стоимость $2,500.",
      },
    },
    official_names: [
      "CAESTHETIC",
      "Spoken Med Spa",
      "Spoken",
      "Ivy",
      "Ivy Cleveland",
      "Botox",
      "Spoken Aesthetic Academy",
      "Academy",
      "Google",
      "Instagram",
      "Facebook",
      "TikTok",
      "YouTube",
      "LinkedIn",
      "dermani MEDSPA® Snellville",
      "About Face Skin Care - Snellville",
      "About Face Skin Care",
      "Harper Haus Aesthetics & Wellness",
      "A Defined Image Medical Wellness Centre",
    ],
  };
  for (const surface of report.surfaces) {
    for (const metric of surface.metrics) metric.label = METRIC_LABELS_RU[metric.metric_id];
  }
  for (const metric of report.crossSurface.metrics) metric.label = METRIC_LABELS_RU[metric.metric_id];
  const { public_direct_link: _sourcePublicDirectLink, ...sourceAudit } = report.audit;
  report.audit = {
    ...sourceAudit,
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
  const retiredObservation = ["ju", "rney"].join("");
  if (JSON.stringify(report).toLowerCase().includes(retiredObservation)) {
    throw new Error("Russian client report contains a retired observation");
  }
  return report;
}

export const englishReport = buildEnglishReport();
export const report = buildRussianReport();

export function writeSpokenReports() {
  const englishSerialized = `${JSON.stringify(englishReport, null, 2)}\n`;
  for (const target of [englishReportPath, englishAuditReportPath]) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, englishSerialized);
  }
  fs.writeFileSync(englishHtmlPath, renderGrowthReport(englishReport));

  const russianSerialized = `${JSON.stringify(report, null, 2)}\n`;
  for (const target of [reportPath, auditReportPath]) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, russianSerialized);
  }
  fs.writeFileSync(htmlPath, renderGrowthReport(report));
}

export const writeRussianReport = writeSpokenReports;

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  writeSpokenReports();
  console.log(`Built ${path.relative(repoRoot, englishReportPath)}`);
  console.log(`Rendered ${path.relative(repoRoot, englishHtmlPath)}`);
  console.log(`Built ${path.relative(repoRoot, reportPath)}`);
  console.log(`Rendered ${path.relative(repoRoot, htmlPath)}`);
}
