#!/usr/bin/env node
import { fileURLToPath } from "node:url";

export const GROWTH_SCORE_AUDIT_INTENT = "growth_score_audit";
export const GROWTH_SCORE_AUDIT_OPENING_RU = "Вы создаёте новый аудит? Ответьте на вопросы.";

export const GROWTH_SCORE_AUDIT_SYNONYMS = Object.freeze([
  "Growth Score",
  "Multi-Location Growth Score",
  "аудит",
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

export function mentionsGrowthScoreAudit(value) {
  const text = ` ${normalize(value)} `;
  if (text.includes(" growth score ")) return true;
  if (text.includes(" multi location growth score ")) return true;
  if (/(?:^|\s)audits?(?:\s|$)/u.test(text.trim())) return true;
  return /(?:^|\s)аудит(?:а|у|ом|е|ы|ов|ам|ами|ах)?(?:\s|$)/u.test(text.trim());
}

export function routeGrowthScoreAuditIntent(value, { active_intent = null } = {}) {
  if (!mentionsGrowthScoreAudit(value)) {
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
      questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
    });
  }

  return Object.freeze({
    matched: true,
    canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
    synonyms: GROWTH_SCORE_AUDIT_SYNONYMS,
    action: "start_manager_interview",
    opening: GROWTH_SCORE_AUDIT_OPENING_RU,
    repository_context: "any_supported_repository",
    source_policy: "public_open_sources_only",
    full_research_gate: "named_manager_research_alignment_approval",
    questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv.slice(2).join(" ");
  process.stdout.write(`${JSON.stringify(routeGrowthScoreAuditIntent(input), null, 2)}\n`);
}
