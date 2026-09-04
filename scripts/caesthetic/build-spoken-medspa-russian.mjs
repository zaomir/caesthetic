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
  report.reportVersion = "spoken-medspa-snellville-public-evidence/ru/1.6.1";
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
  diagnosis.focus_selection.rationale = "Эти три ограничения напрямую соответствуют продукту 4444: карта точных запросов, регулярный контент и система честных отзывов с содержательными ответами.";

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
    competitor.sources.push({
      url_or_snapshot: benchmark.source,
      source_type: "maps",
      collected_at: "2026-09-04",
      sample_note: "Публичная карточка Google",
    });
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

export function buildRussianReport(source = JSON.parse(fs.readFileSync(sourceReportPath, "utf8"))) {
  const report = translateStrings(structuredClone(source));
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
        body: "Мы проверили путь нового пациента: как он находит Spoken, сравнивает клиники и выбирает, куда записаться. Ниже — три главные помехи и простой план действий.",
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
  const retiredObservation = ["ju", "rney"].join("");
  if (JSON.stringify(report).toLowerCase().includes(retiredObservation)) {
    throw new Error("Russian client report contains a retired observation");
  }
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
