#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveJourneyGraphNotAssessed,
  createGrowthScoreReportTemplate,
} from "./growth-score-report-template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const slug = "prestige-ru-pilot-520-20260901-c6d8e2";
const collectedAt = "2026-09-01";
const approvedAt = "2026-09-01T12:16:22Z";

const urls = Object.freeze({
  maps: "https://www.google.com/maps/search/Prestige+barbershop+Las+Americas+Tenerife",
  booksy: "https://booksy.com/es-es/169779_prestige-barbershop-and-hairdressers_barberia_71155_playa-de-los-cristianos",
  instagram: "https://www.instagram.com/prestige_barber_las_americas/",
  network: "https://booksy.com/es-es/s/barberia/71234_alcala",
  perillan: "https://www.google.com/maps/search/Perillan+Barber+Tattoo+Studio+Tenerife",
  belgium: "https://www.google.com/maps/search/Barber+Belgium+Playa+de+las+Americas",
  figueroa: "https://www.google.com/maps/search/Figueroa+Morales+Tenerife",
  american: "https://www.google.com/maps/search/Barber+American+Style+Shop+Tenerife",
});

const metricLabels = Object.freeze({
  map_visibility: "Видимость на карте",
  gbp_treatment_category_completeness: "Полнота категории и услуг",
  entity_integrity: "Целостность сущности",
  gbp_conversion_readiness: "Готовность карточки к записи",
  freshness: "Свежесть поиска",
  branded_search_control: "Контроль брендового поиска",
  booking_friction: "Трение на пути к записи",
  treatment_clarity: "Ясность услуг",
  mobile_performance: "Мобильная производительность",
  above_fold_conversion: "Понятность первого экрана",
  clinician_trust_proof: "Доказательства специалистов и доверия",
  mystery_shopper: "Проверка клиентского пути",
  technical_booking_integrity: "Техническая целостность записи",
  priority_treatment_presence: "Наличие приоритетных услуг",
  clinician_expertise: "Экспертность специалистов",
  proof_quality: "Качество доказательств",
  recency: "Свежесть",
  profile_to_booking: "Путь от профиля к записи",
  local_offer_clarity: "Ясность локального предложения",
  review_velocity_90d: "Темп отзывов за 90 дней",
  rating: "Публичный рейтинг",
  review_depth: "Глубина отзывов",
  response_coverage: "Покрытие ответами",
  response_speed: "Скорость ответов",
  negative_review_handling: "Работа с негативными отзывами",
  treatment_clinician_proof: "Доказательства услуг и специалистов",
  treatment_presence: "Наличие услуг между поверхностями",
  positioning_coherence: "Согласованность позиционирования",
  proof_continuity: "Непрерывность доказательств",
  conversion_continuity: "Непрерывность пути к записи",
  identity_coherence: "Согласованность идентичности",
});

const unavailable = (metric) => ({
  ...metric,
  label: metricLabels[metric.metric_id],
  unavailable_reason: "Недостаточно доказательств для публикации оценки.",
});

const approved = (metric, raw_value, source, finding) => {
  const { unavailable_reason: _unavailableReason, ...base } = metric;
  return {
    ...base,
    label: metricLabels[metric.metric_id],
    raw_value,
    normalized_score: null,
    evidence_class: "A",
    source,
    collected_at: collectedAt,
    reviewer_status: "approved",
    finding,
  };
};

const makeSurface = (template, id, summary, strength, problem, priority, approvedMetrics) => ({
  id,
  summary,
  owner_card: { strength, problem, priority },
  metrics: template.surfaces.find((surface) => surface.id === id).metrics.map((metric) => {
    const input = approvedMetrics[metric.metric_id];
    return input ? approved(metric, ...input) : unavailable(metric);
  }),
});

const gap = ({ id, title, diagnosis_state = "verified_gap", surfaces, journey_stage, evidence_refs = [], why_it_matters, mode = "backlog", outcome, steps, dependencies = [], owner_role, done_when, day_30_outcome, beyond_day_30 }) => ({
  id,
  title,
  diagnosis_state,
  surfaces,
  journey_stage,
  evidence_refs,
  why_it_matters,
  sprint_fit: { mode },
  repair_plan: {
    outcome,
    diy_steps: steps,
    dependencies,
    owner_role,
    done_when,
    ...(mode === "start_in_30_days" ? { day_30_outcome, beyond_day_30 } : {}),
  },
});

const insufficientCell = (finding) => ({
  status: "insufficient_evidence",
  finding,
  evidence_refs: [],
  limitation: "Недостаточно сопоставимых доказательств для вывода по этой поверхности.",
});

const competitor = ({ id, name, type = "local", url, reason, choice, advantage, ratingNote }) => ({
  id,
  name,
  competitor_type: type,
  selection_reason: reason,
  branch_scope: "Публичное предложение в зоне Las Americas и более широком рынке юга Тенерифе.",
  patient_choice_reason: choice,
  observable_advantage: advantage,
  observable_gap: "Недостаточно доказательств для полного сравнения сайта, социальных сетей и операционной конверсии.",
  repeat: "Ясно связывать локальную сущность с услугой, локацией и следующим шагом.",
  improve: "Сделать путь единым для сети, не копируя чужие заявления или оформление.",
  do_not_copy: "Не копировать рейтинги, обещания результата или недоказанные внутренние практики.",
  strategic_implication: "Prestige нужно сократить наблюдаемый разрыв публичного пути, сохранив собственное позиционирование.",
  constraint_effect: "Показывает, что клиент может сравнивать локальные альтернативы до перехода к записи.",
  priority_effect: "Поддерживает приоритет единого пути услуга → филиал → запись.",
  modernization_implication: "Изучить как публичный ориентир, но проверить решение на собственных доказательствах.",
  strengths: [advantage],
  weaknesses_or_risks: ["Недостаточно доказательств для вывода о качестве услуг, выручке или эффективности маркетинга."],
  limitations: "insufficient repetition: сохранён только ограниченный публичный снимок; повторяющиеся темы отзывов не утверждаются.",
  sources: [{ url_or_snapshot: url, source_type: "maps", collected_at: collectedAt, sample_note: ratingNote }],
  surface_evidence: {
    search: insufficientCell(`Публичный поисковый результат сохранён как ограниченный ориентир: ${ratingNote}`),
    website: insufficientCell("Сопоставимый собственный сайт не исследован полностью."),
    social: insufficientCell("Сопоставимое окно социальных публикаций не собрано."),
    reputation: insufficientCell("Полный сопоставимый корпус отзывов и ответов не собран."),
  },
  repeated_positive_themes: [],
  repeated_negative_themes: [],
  evidence_refs: ["search.entity_integrity"],
});

const decision = (title, rationale, evidence_refs) => ({ title, rationale, evidence_refs });
const template = createGrowthScoreReportTemplate();

const surfaces = [
  makeSurface(template, "search",
    "Prestige находится в Google, но видимые названия, адресные единицы и способы записи не образуют одну однозначную сетевую сущность.",
    "Карточка Las Americas имеет публичный рейтинг 4,9 по 58 отзывам и телефон.",
    "Google и Booksy показывают разные адресные единицы и не объясняют общий путь сети.", "HIGH", {
      entity_integrity: [{ "название в Google": "Prestige barbershop", "адрес Google": "Avenida Playa de las Américas 9, local 13", "название в Booksy": "Prestige barbershop And Hairdressers", "адрес Booksy": "Av. las Américas 9, local 2 Unidad" }, `${urls.maps}; ${urls.booksy}`, "Публичные карточки используют разные адресные единицы и не объясняют их отношение."],
    }),
  makeSurface(template, "website",
    "В текущем публичном поиске не найден один управляемый сетевой источник, который связывает услуги, филиалы и запись.",
    "Booksy предоставляет действующий маршрут выбора услуги и времени для Las Americas.",
    "Путь зависит от отдельных площадок и не объясняет сеть из одного контролируемого назначения.", "HIGH", {
      booking_friction: [{ "единая управляемая страница сети найдена": "нет", "отдельная запись Las Americas найдена": "да" }, `${urls.booksy}; ${urls.network}`, "Действующая запись существует, но единого управляемого пути сети в сохранённой публичной выборке не найдено."],
    }),
  makeSurface(template, "social",
    "Instagram показывает активный профиль Las Americas, но смешивает барбершоп, парикмахерскую и более широкий контекст Prestige.",
    "У профиля Las Americas есть заметная аудитория и видимые примеры услуг.",
    "Роль профиля и переход к конкретной услуге, филиалу и записи остаются неоднозначными.", "HIGH", {
      profile_to_booking: [{ "локальный профиль найден": "да", "единый путь сети подтверждён": "нет", "путь Facebook в сохранённой проверке": "недоступен" }, urls.instagram, "Профиль Las Americas найден, но единый подтверждённый переход профиля к услуге, филиалу и записи не наблюдался."],
      local_offer_clarity: [{ "видимые роли": ["барбершоп", "парикмахерская", "академия"], "разделение ролей": "не подтверждено" }, `${urls.instagram}; ${urls.network}`, "Публичные роли барбершопа, парикмахерской и академии не разведены в одну ясную архитектуру."],
    }),
  makeSurface(template, "reputation",
    "Google показывает сильный рейтинг Las Americas, но рейтинги площадок и филиалов нельзя объединять.",
    "Las Americas имеет рейтинг Google 4,9 по 58 отзывам в сохранённом снимке.",
    "Полное 90-дневное окно отзывов, ответов и филиальная сопоставимость не собраны.", "MEDIUM", {
      rating: [{ "площадка": "Google", "филиал": "Las Americas", "рейтинг": "4,9", "отзывов": "58" }, urls.maps, "Рейтинг Google 4,9 по 58 отзывам относится только к проверенной карточке Las Americas."],
    }),
];

const crossSurface = {
  summary: "Поиск, Booksy и Instagram не сходятся в одном публичном пути Prestige от услуги и филиала к записи.",
  metrics: template.crossSurface.metrics.map((metric) => {
    const inputs = {
      positioning_coherence: [{ "видимые роли": ["барбершоп", "парикмахерская", "академия"], "единая иерархия": "не подтверждена" }, `${urls.maps}; ${urls.instagram}; ${urls.network}`, "Публичные роли и филиалы не представлены как одна понятная архитектура."],
      conversion_continuity: [{ "единый путь услуга — филиал — запись": "не найден", "отдельная запись Las Americas": "найдена" }, `${urls.maps}; ${urls.booksy}; ${urls.instagram}`, "Поверхности обнаружения не приводят к одному подтверждённому маршруту услуга → филиал → запись."],
      identity_coherence: [{ "единая публичная сущность сети": "не подтверждена", "адресные единицы расходятся": "да" }, `${urls.maps}; ${urls.booksy}; ${urls.network}`, "Названия и адресные единицы не объясняют отношения между локациями и предложениями Prestige."],
    };
    return inputs[metric.metric_id] ? approved(metric, ...inputs[metric.metric_id]) : unavailable(metric);
  }),
};

const gaps = [
  gap({ id: "PRE-26-01", title: "Несогласованная публичная архитектура сети и клиентского пути", surfaces: ["search", "cross_surface"], journey_stage: "enquiry", evidence_refs: ["search.entity_integrity", "cross.identity_coherence", "cross.conversion_continuity"], why_it_matters: "Клиент не получает одного ясного ответа, какая услуга доступна, в каком филиале и куда перейти для записи.", mode: "close_in_30_days", outcome: "Утверждён один публичный реестр сущностей и маршрут от поиска Prestige к услуге, филиалу и записи.", steps: ["Сверить названия, адреса, телефоны и назначения Google, Booksy и Instagram для Las Americas и San Isidro.", "Утвердить роли барбершопа, парикмахерской и академии и закрепить одно следующее действие для каждого входа.", "Исправить расхождения в доступных владельцу полях и сохранить доказательства до и после."], dependencies: ["Доступ владельца к публичным профилям", "Утверждение сетевого реестра"], owner_role: "Владелец бизнеса и менеджер публичных профилей", done_when: ["Есть утверждённый реестр сущностей и назначений.", "Google, Booksy и Instagram не противоречат выбранной архитектуре.", "Тестовый путь от брендового поиска до записи зафиксирован по каждой локации."] }),
  gap({ id: "PRE-26-02", title: "Нет единой управляемой страницы сети, филиалов и способов записи", surfaces: ["website", "cross_surface"], journey_stage: "booking", evidence_refs: ["website.booking_friction", "cross.conversion_continuity"], why_it_matters: "Отдельные площадки дают частичные маршруты, но не объясняют весь выбор услуги и филиала из одного контролируемого места.", mode: "start_in_30_days", outcome: "Запущена первая управляемая страница сети с услугами, филиалами и проверенными переходами к записи.", steps: ["Определить минимальную структуру: предложение, выбор филиала, основные услуги, контакты и запись.", "Собрать первую mobile-first версию на контролируемом назначении.", "Проверить все переходы на Las Americas и San Isidro без сбора клинических данных."], dependencies: ["Утверждённый реестр из PRE-26-01", "Контроль домена или утверждённого назначения"], owner_role: "Владелец цифрового назначения и веб-исполнитель", done_when: ["Страница открывается на мобильном устройстве.", "Каждая услуга ведёт к верному филиалу и способу записи.", "Публичная форма не запрашивает клинические или чувствительные данные."], day_30_outcome: "Опубликована и проверена минимальная страница с обоими филиальными контекстами и рабочими маршрутами записи.", beyond_day_30: "Расширять доказательства услуг и измерять путь только после подтверждения базовой целостности." }),
  gap({ id: "PRE-26-03", title: "Неясно разведены барбершоп, парикмахерская и академия", surfaces: ["social", "cross_surface"], journey_stage: "trust", evidence_refs: ["social.local_offer_clarity", "cross.positioning_coherence"], why_it_matters: "Смешанные роли затрудняют понимание, какое предложение относится к клиенту, ученику или конкретной локации.", mode: "close_in_30_days", outcome: "Роли трёх предложений разведены, но связаны общей архитектурой Prestige.", steps: ["Назначить каждому профилю одну основную роль, аудиторию и географию.", "Обновить описания и закреплённые материалы с указанием филиала и следующего шага.", "Оставить возможную коллаборацию с академией отдельной гипотезой до её проверки."], dependencies: ["Утверждённая архитектура PRE-26-01"], owner_role: "Ответственный за бренд и социальные сети", done_when: ["В каждом профиле понятны роль, локация и следующий шаг.", "Барбершоп, парикмахерская и академия не выданы за одно и то же предложение.", "Гипотеза коллаборации не используется как доказанный факт."] }),
  gap({ id: "PRE-26-04", title: "Разные адресные единицы Las Americas требуют подтверждения", surfaces: ["search"], journey_stage: "booking", evidence_refs: ["search.entity_integrity"], why_it_matters: "Расхождение local 13 и local 2 Unidad может создать ошибку назначения.", outcome: "Адресные единицы подтверждены владельцем и синхронизированы.", steps: ["Проверить документы и фактический вход.", "Обновить доступные публичные карточки."], owner_role: "Менеджер локации", done_when: ["Владелец письменно подтвердил адрес.", "Публичные карточки показывают согласованное назначение."] }),
  gap({ id: "PRE-26-05", title: "Недоступный путь Facebook требует отдельной проверки", diagnosis_state: "insufficient_evidence", surfaces: ["social"], journey_stage: "enquiry", why_it_matters: "Недоступность в сохранённой проверке не доказывает поломку для всех пользователей.", outcome: "Путь проверен из нейтральной сессии и с мобильного устройства.", steps: ["Повторить проверку без авторизации.", "Зафиксировать конечное назначение."], owner_role: "Менеджер социальных сетей", done_when: ["Сохранены дата, устройство и конечный адрес проверки."] }),
  gap({ id: "PRE-26-06", title: "Полная эффективность внутренних процессов не оценивалась", diagnosis_state: "insufficient_evidence", surfaces: ["cross_surface"], journey_stage: "treatment", why_it_matters: "Публичные источники не показывают внутреннюю конверсию, загрузку, выручку или качество обработки обращений.", outcome: "Внутренние показатели остаются вне публичного диагноза до отдельного разрешённого доступа.", steps: ["Не делать внутренних причинных выводов.", "При необходимости согласовать отдельный безопасный сбор агрегированных данных."], owner_role: "Владелец бизнеса", done_when: ["Отчёт не содержит неподтверждённых внутренних утверждений."] }),
];

const competitors = [
  competitor({ id: "perillan", name: "Perillan Barber & Tattoo Studio", url: urls.perillan, reason: "Близкая локальная альтернатива в поиске барбершопа.", choice: "Клиент может сравнить близость, рейтинг и видимое предложение.", advantage: "В сохранённом публичном снимке видны 4,9 и 293 отзыва.", ratingNote: "Наблюдалось 4,9 и 293 отзыва; показатели не объединяются с другими площадками." }),
  competitor({ id: "belgium", name: "Barber Belgium Playa de las Americas", url: urls.belgium, reason: "Прямая альтернатива в той же географии.", choice: "Клиент может выбрать её как локальный барбершоп в Playa de las Americas.", advantage: "В сохранённом публичном снимке видны 4,9 и 150 отзывов.", ratingNote: "Наблюдалось 4,9 и 150 отзывов; полный корпус не собирался." }),
  competitor({ id: "figueroa", name: "Figueroa & Morales", type: "positioning_reference", url: urls.figueroa, reason: "Ориентир более широкого рынка парикмахерских услуг.", choice: "Клиент может сравнивать более широкое предложение волос и ухода.", advantage: "Показывает отдельный контекст более широкого парикмахерского рынка.", ratingNote: "Сохранён только публичный поисковый контекст без сопоставимого корпуса отзывов." }),
  competitor({ id: "american", name: "Barber American Style Shop", type: "category_leader", url: urls.american, reason: "Ориентир по объёму публичных репутационных доказательств.", choice: "Большой объём отзывов может влиять на выбор в поиске, но не доказывает результат услуги.", advantage: "В сохранённом публичном снимке видны 4,9 и 860 отзывов.", ratingNote: "Наблюдалось 4,9 и 860 отзывов; это не доказательство выручки или числа клиентов." }),
];

const report = {
  ...template,
  journeyGraph: approveJourneyGraphNotAssessed(template.journeyGraph, {
    artifactId: "prestige-tenerife-2026-journey-graph-v1",
    reviewedBy: "Амир",
    reviewedAt: approvedAt,
  }),
  reportState: "approved_report",
  reportVersion: "prestige-ru-pilot-2026-09-01",
  verifiedFactSetVersion: "prestige-public-evidence-2026-09-01-approved-amir",
  reportKind: "real",
  presentation: {
    kind: "pilot",
    official_names: ["Perillan Barber & Tattoo Studio", "Barber Belgium Playa de las Americas", "Barber American Style Shop", "Figueroa & Morales", "Google Business Profile", "30-Day Growth Sprint", "Growth Score", "CAESTHETIC", "Prestige", "Google", "Instagram", "Facebook", "Booksy", "WhatsApp", "Paid Ads"],
  },
  reportContext: { vertical_context: "beauty_salon", report_locale: "ru", vertical_source: "human_resolved", locale_source: "user_selected" },
  audit: { project_id: "prestige-tenerife-2026", subject_type: "beauty_salon", format: "single_location", package_role: "manager_pilot", focus_location: "Las Americas", network_context: "San Isidro" },
  catalog: { visibility: "private", public_listing_approved: false },
  disclosure: "Управленческий пилот по открытым источникам, а не финальный клиентский отчёт. Клиентские отношения, доступ к внутренним операциям и коммерческие результаты не предполагаются. Рейтинги площадок и филиалов не объединяются.",
  practice: { name: "Prestige", location: "Las Americas; сетевой контекст San Isidro, Тенерифе, Испания", preparedAt: collectedAt, preparedFor: "Управленческий пилот" },
  executiveSummary: "Главное ограничение — отсутствие одного ясного публичного пути от поиска Prestige к услуге, филиалу и записи.",
  surfaces,
  crossSurface,
  humanDiagnosis: {
    reviewer_status: "approved",
    reviewer: { name: "Амир", approved_at: approvedAt },
    objective_strength: { title: "Карточка Las Americas уже имеет сильный публичный рейтинг Google 4,9 по 58 отзывам.", evidence_refs: ["reputation.rating"] },
    strongest_surface: "reputation",
    binding_constraint: { title: "Нет единого пути от поиска Prestige к услуге, филиалу и записи", statement: "Google, Booksy и Instagram не объясняют одним последовательным маршрутом, какую услугу выбрать, к какому филиалу она относится и где завершить запись.", demand_stage: "enquiry", evidence_refs: ["search.entity_integrity", "website.booking_friction", "cross.conversion_continuity"], gap_ref: "PRE-26-01" },
    current_state: { strengths: ["Las Americas имеет рейтинг Google 4,9 по 58 отзывам.", "Для Las Americas доступна публичная запись через Booksy."], constraint_label: "Единый публичный путь Prestige", constraint_detail: "Существующие поверхности не сходятся в одной архитектуре услуги, филиала и записи.", priority_line: "Сначала согласовать сущности и назначения, затем запустить единый управляемый путь и развести роли предложений." },
    gap_inventory: gaps,
    focus_selection: { primary_gap_id: "PRE-26-01", supporting_gap_ids: ["PRE-26-02", "PRE-26-03"], selected_by: "Амир", selected_at: approvedAt, rationale: "PRE-26-01 закрывает основное несоответствие; PRE-26-02 начинает единое управляемое назначение; PRE-26-03 закрывает неоднозначность барбершопа, парикмахерской и академии." },
    do_not_do: { title: "Не финансировать Paid Ads до проверки единого публичного пути", rationale: "Дополнительный платный спрос направит внимание в неподтверждённый маршрут между услугой, филиалом и записью.", evidence_refs: ["search.entity_integrity", "website.booking_friction", "cross.conversion_continuity"], revisit_after: ["Единый реестр сущностей утверждён.", "Маршрут услуга → филиал → запись проверен из поиска и социальных сетей.", "Назначения Google, Booksy и Instagram согласованы."] },
    competitors: {
      status: "applicable",
      selection_method: "Три локальные или рыночные альтернативы и один ориентир по объёму публичных репутационных доказательств.",
      sample_limitations: "Использованы ограниченные публичные снимки; полные окна сайтов, социальных сетей, отзывов и ответов не собирались.",
      comparison_window: { start: collectedAt, end: collectedAt },
      review_sample_rule: "Числа сохраняются отдельно по площадке и сущности; повторяющаяся тема требует не менее двух подходящих наблюдений.",
      branch_scope: "Las Americas как фокус; San Isidro только как сетевой контекст.",
      entries: competitors,
      comparison_matrix: {
        subject_name: "Prestige",
        rows: [
          { entity_ref: "subject", entity_name: "Prestige", entity_type: "subject", search: "Google 4,9 по 58 отзывам; адресная единица отличается от Booksy.", website: "Единый управляемый сетевой источник в сохранённом поиске не найден.", social: "Локальный профиль смешивает роли барбершопа, парикмахерской и сетевого контекста.", reputation: "Рейтинг относится только к карточке Las Americas и не объединяется с Booksy или San Isidro.", evidence_refs: ["search.entity_integrity", "website.booking_friction", "social.local_offer_clarity", "reputation.rating"] },
          ...competitors.map((entry) => ({ entity_ref: entry.id, entity_name: entry.name, entity_type: "competitor", search: entry.observable_advantage, website: "Недостаточно доказательств.", social: "Недостаточно доказательств.", reputation: entry.sources[0].sample_note, evidence_refs: ["search.entity_integrity"] })),
        ],
      },
      decision_summary: {
        defend: [decision("Сохранить локальное доверие Las Americas", "Рейтинг Google 4,9 по 58 отзывам — наблюдаемая сильная сторона конкретной карточки.", ["reputation.rating"])],
        close: [decision("Закрыть разрыв единого назначения", "Локальные альтернативы усиливают необходимость ясного пути из поиска к записи.", ["search.entity_integrity", "cross.conversion_continuity"])],
        differentiate: [decision("Развести три роли Prestige", "Ясная архитектура барбершопа, парикмахерской и академии может убрать наблюдаемую неоднозначность без копирования конкурентов.", ["social.local_offer_clarity", "cross.positioning_coherence"])],
        do_not_copy: [decision("Не копировать рейтинги и обещания результата", "Публичные числа конкурентов не доказывают их выручку, число клиентов или качество услуги.", ["reputation.rating", "search.entity_integrity"])],
      },
      market_practice_gap: { status: "insufficient_evidence", reason: "Недостаточно сопоставимых доказательств для отдельного вывода о разрыве с современной рыночной практикой.", recommendations: [] },
    },
    walkthrough: { status: "pending", url: null, placeholder: "Русскоязычный видеоразбор ожидается. Запись или доставка не предполагаются до отдельного утверждения и проверки качества." },
    coordination_burden: { diagnosed_issues: 6, high_priority_fixes: 3, systems_involved: 4, dependencies: 4, specialist_roles: 3 },
  },
  implementation_paths: { diy: "Использовать доказательства и полные шаги трёх фокусных разрывов внутри команды.", other_provider: "Передать отчёт и проверяемые условия готовности квалифицированному подрядчику.", defer: "Сохранить доказательства и не увеличивать платный спрос в неподтверждённый путь.", caesthetic: "Отдельно письменно определить объём 30-Day Growth Sprint только вокруг утверждённых фокусных разрывов." },
  why_caesthetic: { evidence_advantage: "Публичные доказательства, ограничения и порядок зависимостей собраны в одном отчёте.", coordination_advantage: "Исправление требует согласовать Google, Booksy, Instagram, роли предложений и управляемое назначение.", sprint_boundary: "Ни один шаг не включён автоматически; письменный объём спринта подтверждается отдельно.", ownership: "Отчёт, доказательства и планы исправления могут использоваться без CAESTHETIC." },
  methodology: { sources: Object.values(urls), collectedAt, competitorSelection: "Ограниченная выборка локальных альтернатив и публичных ориентиров юга Тенерифе.", limitations: "Не использовались внутренние данные, звонки, сообщения, формы, выручка, загрузка, конверсия, полный девяностодневный корпус отзывов, полное окно социальных публикаций или подтверждение всех сетевых локаций. Возможная коллаборация с академией остаётся гипотезой. При недостатке доказательств оценки поверхностей и общая оценка не публикуются." },
  estimates: [],
};

export { report, slug };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const directory = path.join(root, "site-caesthetic/score", slug);
  fs.mkdirSync(directory, { recursive: true });
  const reportPath = path.join(directory, "report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(reportPath);
}
