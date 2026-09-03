#!/usr/bin/env node
import { fileURLToPath } from "node:url";

export const GROWTH_SCORE_AUDIT_INTENT = "growth_score_audit";
export const GROWTH_SCORE_AUDIT_OPENING_RU = "Вы создаёте новый аудит? Ответьте на вопросы.";

export const GROWTH_SCORE_AUDIT_SYNONYMS_BY_LANGUAGE = Object.freeze({
  ru: Object.freeze([
    "аудит",
    "бизнес-аудит",
    "маркетинговый аудит",
    "аудит маркетинга",
    "аудит роста",
    "аудит клиники",
    "аудит салона",
    "аудит локации",
    "аудит сети",
    "сетевой аудит",
    "аудит филиалов",
    "мульти-локационный аудит",
    "мультилокационный аудит",
    "мини-аудит",
    "оценка роста",
    "диагностика роста",
    "маркетинговая диагностика",
    "диагностика 4444",
    "разбор 4444",
    "гроус скор",
    "проверка бизнеса",
    "поиск утечек",
  ]),
  en: Object.freeze([
    "Growth Score",
    "Free Growth Score",
    "Partner Growth Score",
    "Growth Score audit",
    "Multi-Location Growth Score",
    "MultiLocation Growth Score",
    "multi-site Growth Score",
    "network Growth Score",
    "growth assessment",
    "written growth assessment",
    "growth diagnostic",
    "business audit",
    "marketing audit",
    "digital audit",
    "online presence audit",
    "clinic audit",
    "practice audit",
    "salon audit",
    "location audit",
    "network audit",
    "multi-location audit",
    "multi-site audit",
    "four-surface audit",
    "4444 audit",
    "mini-audit",
    "1-minute leak",
    "leak diagnosis",
    "score",
    "diagnostic",
    "audit report",
    "Top 3 gaps",
    "binding constraint",
  ]),
});

export const GROWTH_SCORE_AUDIT_SYNONYMS = Object.freeze([
  ...new Set(Object.values(GROWTH_SCORE_AUDIT_SYNONYMS_BY_LANGUAGE).flat()),
]);

export const GROWTH_SCORE_AUDIT_AUTHORITY = Object.freeze({
  required_preflight: Object.freeze([
    "docs/ssot/CAESTHETIC.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md",
    "docs/caesthetic/growth_score_spec.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
    "docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md",
    "docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md",
  ]),
  conditional_preflight: Object.freeze({
    competitor_work: "docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md",
    evidence_or_impact_work: "docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md",
    publication_work: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md",
  }),
  spec: "docs/caesthetic/growth_score_spec.md",
  production_sop: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
  template: "scripts/caesthetic/growth-score-report-template.mjs",
  workflow: "scripts/caesthetic/growth-score-workflow.mjs",
  renderer: "scripts/caesthetic/render-growth-score.mjs",
  publication: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md",
});

export const GROWTH_SCORE_AUDIT_PIPELINE = Object.freeze([
  "manager_interview",
  "quick_public_reconnaissance",
  "named_manager_research_alignment_approval",
  "full_public_research",
  "complete_gap_inventory",
  "named_human_focus_selection",
  "approved_report",
  "protected_route_qa",
  "client_link_delivery",
]);

export const GROWTH_SCORE_MANAGER_QUESTIONS_RU = Object.freeze([
  Object.freeze({
    id: "is_new_audit",
    required: true,
    prompt: "Это новый аудит или работа с уже существующим аудитом?",
  }),
  Object.freeze({
    id: "business_name",
    required: true,
    prompt: "Как называется бизнес или проект? Укажите известные варианты названия.",
  }),
  Object.freeze({
    id: "public_identifiers",
    required: true,
    prompt: "Дайте официальный сайт и известные публичные профили. Не присылайте логины, пароли, CRM-выгрузки или закрытые данные.",
  }),
  Object.freeze({
    id: "audit_format",
    required: true,
    prompt: "Это одна локация или сеть с несколькими локациями?",
  }),
  Object.freeze({
    id: "locations",
    required: true,
    prompt: "Перечислите город, регион и страну для одной локации либо все заявленные локации сети.",
  }),
  Object.freeze({
    id: "business_model",
    required: true,
    prompt: "Как вы понимаете суть бизнеса: что он продаёт, кому, в каком рынке и как клиент принимает решение?",
  }),
  Object.freeze({
    id: "priority_offers",
    required: true,
    prompt: "Какие продукты, услуги или направления нужно исследовать в первую очередь?",
  }),
  Object.freeze({
    id: "known_competitors",
    required: false,
    prompt: "Каких конкурентов уже считает релевантными менеджер или клиент? Можно указать названия и публичные ссылки.",
  }),
  Object.freeze({
    id: "client_goal",
    required: true,
    prompt: "Какой вопрос, проблема или цель клиента стали причиной аудита?",
  }),
  Object.freeze({
    id: "delivery_context",
    required: true,
    prompt: "Кому предназначен отчёт, на каком языке он нужен и кто из менеджеров будет утверждать приоритетные дыры?",
  }),
  Object.freeze({
    id: "network_context",
    required: false,
    condition: "audit_format=multi_location",
    prompt: "Для сети: какие активы общие для всех локаций, какие локальные, и какую локацию менеджер считает кандидатом на полный Growth Score v5?",
  }),
  Object.freeze({
    id: "constraints",
    required: false,
    prompt: "Есть ли ограничения, исключения или публичные источники, которые нельзя использовать?",
  }),
]);

const normalize = (value) => String(value ?? "")
  .normalize("NFKC")
  .toLocaleLowerCase("ru-RU")
  .replace(/[‐‑‒–—−_-]+/g, " ")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim()
  .replace(/\s+/g, " ");

const NORMALIZED_SYNONYMS = Object.freeze(
  GROWTH_SCORE_AUDIT_SYNONYMS
    .map((synonym) => normalize(synonym))
    .sort((left, right) => right.length - left.length),
);

export function matchedGrowthScoreAuditSynonym(value) {
  const normalized = normalize(value);
  const text = ` ${normalized} `;
  const explicit = NORMALIZED_SYNONYMS.find((synonym) => text.includes(` ${synonym} `));
  if (explicit) return explicit;
  if (/(?:^|\s)audit(?:s|ed|ing)?(?:\s|$)/u.test(normalized)) return "audit";
  if (/(?:^|\s)аудит(?:а|у|ом|е|ы|ов|ам|ами|ах)?(?:\s|$)/u.test(normalized)) return "аудит";
  return null;
}

export function mentionsGrowthScoreAudit(value) {
  return matchedGrowthScoreAuditSynonym(value) !== null;
}

export function routeGrowthScoreAuditIntent(value, { active_intent = null } = {}) {
  const matched_synonym = matchedGrowthScoreAuditSynonym(value);
  if (!matched_synonym) {
    return Object.freeze({ matched: false, canonical_intent: null, action: null });
  }

  if (active_intent === GROWTH_SCORE_AUDIT_INTENT) {
    return Object.freeze({
      matched: true,
      canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
      action: "continue_manager_interview",
      opening: null,
      repository_context: "any_supported_repository",
      source_policy: "public_open_sources_only",
      matched_synonym,
      authority: GROWTH_SCORE_AUDIT_AUTHORITY,
      pipeline: GROWTH_SCORE_AUDIT_PIPELINE,
      questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
    });
  }

  return Object.freeze({
    matched: true,
    canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
    matched_synonym,
    synonyms: GROWTH_SCORE_AUDIT_SYNONYMS,
    action: "start_manager_interview",
    opening: GROWTH_SCORE_AUDIT_OPENING_RU,
    repository_context: "any_supported_repository",
    source_policy: "public_open_sources_only",
    full_research_gate: "named_manager_research_alignment_approval",
    authority: GROWTH_SCORE_AUDIT_AUTHORITY,
    pipeline: GROWTH_SCORE_AUDIT_PIPELINE,
    focus_selection_contract: Object.freeze({
      selected_by: "named_human_manager",
      purpose: "30_day_growth_sprint",
      primary_gap_count: 1,
      sprint_candidate_supporting_gap_range: Object.freeze([2, 3]),
      supporting_gap_count: 2,
      requested_third_supporting_gap: "BLOCKED: focus cardinality conflict",
    }),
    multi_location_contract: Object.freeze({
      deliverable: "comparative_network_overview_plus_one_linked_full_focus_location_report",
      shared_focus_selection: true,
    }),
    questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv.slice(2).join(" ");
  process.stdout.write(`${JSON.stringify(routeGrowthScoreAuditIntent(input), null, 2)}\n`);
}
