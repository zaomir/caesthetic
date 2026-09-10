#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import {
  CHECK500_COPY_CONTRACT,
  CHECK500_PARENT_PLACEMENTS,
  CHECK500_PLACEMENT_CONTRACT,
  CHECK500_STYLE_CONTRACT,
  CHECK500_STYLE_REFERENCE,
  CHECK500_STYLE_REFERENCE_SHA256,
} from "./growth-score-report-template.mjs";

export const GROWTH_SCORE_AUDIT_INTENT = "growth_score_audit";
export const GROWTH_SCORE_AUDIT_OPENING_RU = "Вы создаёте новый аудит? Ответьте на вопросы.";

export const GROWTH_SCORE_AUDIT_SYNONYMS = Object.freeze([
  "Growth Score",
  "Multi-Location Growth Score",
  "аудит",
  "отчёт", "отчет", "score", "audit", "audit report", "report",
  "диагностика бизнеса", "diagnostic", "проверка бизнеса", "поиск утечек",
  "Top 3 gaps", "binding constraint",
]);

export const GROWTH_SCORE_AUTHORING_WORKFLOW = Object.freeze({
  contract: "growth-score-authoring-route/3.0.0",
  authority: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md#canonical-authoring-route",
  internal_pilot_locale: "ru",
  single_location_layout: "growth-score-client/v6.0.0",
  presentation_variants_ssot: "docs/ssot/CAESTHETIC_REPORT_PRESENTATIONS.md",
  single_location_presentations: Object.freeze(["v6", "v6.1", "v6.2"]),
  full_research_gate: "resolved_subject_and_public_scope",
  first_work_review: "complete_russian_audit",
  intermediate_work_approval_required: false,
  translation_gate: "approved_russian_pilot_and_frozen_decisions",
  translation_qa: "named_human_ru_delivery_parity",
  frozen_decisions: Object.freeze(["facts", "evidence_refs", "scores", "binding_constraint", "ordered_top_3", "do_not_fund_yet", "repair_plans"]),
  stages: Object.freeze(["manager_interview", "research_scope_recorded", "public_research", "russian_pilot", "russian_approval", "fact_freeze", "translation", "translation_qa", "publication_qa", "delivery"]),
});

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
  const explicit = /growth score|caesthetic|connect4|spoken/u.test(text);
  // Generic reports/scores in other domains do not create a clinic audit.
  if (!explicit && /\b(?:credit|football|soccer|financial|security|code|test|coverage)\b|кредитн|футбол|финансов|бухгалтер|безопасност|аудит кода|отч[её]т о тест/u.test(text)) return false;
  if (text.includes(" growth score ")) return true;
  if (text.includes(" multi location growth score ")) return true;
  if (/(?:^|\s)audits?(?:\s|$)/u.test(text.trim())) return true;
  if (/(?:^|\s)аудит(?:а|у|ом|е|ы|ов|ам|ами|ах)?(?:\s|$)/u.test(text.trim())) return true;
  return /(?:^|\s)(?:отч[её]т(?:а|у|ом|е|ы|ов|ам|ами|ах)?|reports?|scores?|diagnostics?|диагностик[ауи]|проверка бизнеса|поиск утечек|top 3 gaps|binding constraint)(?:\s|$)/u.test(text.trim());
}

const normalizeAuditFormat = (value) => normalize(value).replaceAll(" ", "_");

export function resolveGrowthScoreAuditTemplateRoute({ audit_format, package_role = null, presentation = "v6" } = {}) {
  if (!["v6", "v6.1", "v6.2"].includes(presentation)) throw new TypeError("Unknown presentation profile");
  const format = normalizeAuditFormat(audit_format);
  const role = normalizeAuditFormat(package_role);
  const check500 = (ownsPlacements) => Object.freeze({
    copy_contract: CHECK500_COPY_CONTRACT,
    placement_contract: CHECK500_PLACEMENT_CONTRACT,
    style_contract: CHECK500_STYLE_CONTRACT,
    style_reference: CHECK500_STYLE_REFERENCE,
    style_reference_sha256: CHECK500_STYLE_REFERENCE_SHA256,
    placements: Object.freeze(ownsPlacements ? [...CHECK500_PARENT_PLACEMENTS] : []),
    placement_owner: ownsPlacements ? "this_report" : "network_parent",
  });

  if (["single", "single_location", "one_location"].includes(format)) {
    if (role && !["single", "single_location"].includes(role)) {
      throw new TypeError("single-location audit cannot use a Multi-Location package role");
    }
    return Object.freeze({
      audit_format: "single_location",
      package_role: "single_location",
      template_module: "scripts/caesthetic/growth-score-report-template.mjs",
      template_factory: presentation === "v6" ? "createGrowthScoreV6ReportTemplate" : "createGrowthScorePresentationTemplate",
      template_arguments: Object.freeze(presentation === "v6" ? { locale: "ru" } : { version: presentation, locale: "ru" }),
      layout_contract: {"v6":"growth-score-client/v6.0.0","v6.1":"growth-score-client/v6.1.0","v6.2":"growth-score-client/v6.2.0"}[presentation],
      workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
      check500: check500(true),
    });
  }

  if (["multi", "multi_location", "network"].includes(format)) {
    if (presentation !== "v6") throw new TypeError("Expert single-location presentations cannot replace the network package");
    const packageRole = role || "network_parent";
    if (!["network_parent", "focus_location"].includes(packageRole)) {
      throw new TypeError("Multi-Location package_role must be network_parent or focus_location");
    }
    return Object.freeze({
      audit_format: "multi_location",
      package_role: packageRole,
      template_module: "scripts/caesthetic/growth-score-report-template.mjs",
      template_factory: "createMultiLocationGrowthScoreReportTemplate",
      template_arguments: Object.freeze({ packageRole, locale: "ru" }),
      internal_pilot_locale: "ru",
      workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
      check500: check500(packageRole === "network_parent"),
    });
  }

  throw new TypeError("audit_format must resolve to single_location or multi_location");
}

export function routeGrowthScoreAuditIntent(value, {
  active_intent = null,
  audit_format = null,
  package_role = null,
  presentation = "v6",
  active_stage = "manager_interview",
  existing_audit = false,
  task_kind = null,
} = {}) {
  if (!mentionsGrowthScoreAudit(value) && active_intent !== GROWTH_SCORE_AUDIT_INTENT) {
    return Object.freeze({ matched: false, canonical_intent: null, action: null });
  }

  const wording = normalize(value);
  const governance = task_kind === "governance" || /напомни|как проводить/u.test(wording)
    || /(?:настро\p{L}*|обнов\p{L}*|измен\p{L}*|закреп\p{L}*|исправ\p{L}*|maintain|update|configure)\s+(?:(?:единый|новый|этот|the|audit|report)\s+)*(?:канон|роутинг|routing|шаблон|template|методик)/u.test(wording);
  if (governance) return Object.freeze({
    matched: true, canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
    action: "maintain_audit_canon", opening: null,
    workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
  });

  if (existing_audit || (active_intent === GROWTH_SCORE_AUDIT_INTENT && active_stage !== "manager_interview")) {
    return Object.freeze({
      matched: true, canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
      action: "resume_existing_audit", opening: null,
      active_stage, workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
      source_policy: "public_open_sources_only",
      preserve_approved_facts: true,
      template_route: null, // Resolve the stored case profile; never reset a frozen report.
    });
  }

  if (active_intent === GROWTH_SCORE_AUDIT_INTENT) {
    return Object.freeze({
      matched: true,
      canonical_intent: GROWTH_SCORE_AUDIT_INTENT,
      action: "continue_manager_interview",
      opening: null,
      repository_context: "any_supported_repository",
      source_policy: "public_open_sources_only",
      workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
      questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
      template_route: audit_format
        ? resolveGrowthScoreAuditTemplateRoute({ audit_format, package_role, presentation })
        : null,
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
    workflow: GROWTH_SCORE_AUTHORING_WORKFLOW,
    full_research_gate: "resolved_subject_and_public_scope",
    questions: GROWTH_SCORE_MANAGER_QUESTIONS_RU,
    template_route: audit_format
      ? resolveGrowthScoreAuditTemplateRoute({ audit_format, package_role, presentation })
      : null,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv.slice(2).join(" ");
  process.stdout.write(`${JSON.stringify(routeGrowthScoreAuditIntent(input), null, 2)}\n`);
}
