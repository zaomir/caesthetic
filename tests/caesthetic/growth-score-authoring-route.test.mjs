import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {routeGrowthScoreAuditIntent,resolveGrowthScoreAuditTemplateRoute} from '../../scripts/caesthetic/growth-score-intent-router.mjs';
import * as factories from '../../scripts/caesthetic/growth-score-report-template.mjs';
test('audit/report/score assignments use the same Russian-first v6 route',()=>{
 for(const text of ['Сделай аудит Spoken','Подготовь отчёт для клиники','Собери отчет','Create a report','score','diagnostic','проверка бизнеса','поиск утечек','Top 3 gaps','binding constraint','Создай отчёт по шаблону v6','Сделай аудит по канону']) {
  const route=routeGrowthScoreAuditIntent(text,{audit_format:'single_location'});
  assert.equal(route.action,'start_manager_interview',text);
  assert.equal(route.workflow.translation_gate,'approved_russian_pilot_and_frozen_decisions');
  const tpl=route.template_route;
  const draft=factories[tpl.template_factory](tpl.template_arguments);
  assert.equal(draft.schemaVersion,5);
  assert.equal(draft.reportContext.report_locale,'ru');
  assert.equal(draft.presentation.layout_contract,'growth-score-client/v6.0.0');
  assert.equal(draft.presentation.v6.business_name,null);
  assert.equal(draft.presentation.v6.commercial.included_check,false);
  assert.equal(draft.humanDiagnosis.reviewer_status,'pending');
 }
});
test('CLI defaults to Russian v6; legacy is explicit',()=>{
 const cli=new URL('../../scripts/caesthetic/growth-score-report-template.mjs',import.meta.url);
 const draft=JSON.parse(execFileSync(process.execPath,[cli.pathname],{encoding:'utf8'}));
 assert.equal(draft.presentation.layout_contract,'growth-score-client/v6.0.0');
 assert.equal(draft.reportContext.report_locale,'ru');
 const legacy=JSON.parse(execFileSync(process.execPath,[cli.pathname,'--presentation','legacy'],{encoding:'utf8'}));
 assert.equal(legacy.presentation.layout_contract,undefined);
});
test('continuations and canon tasks never restart client intake',()=>{
 const active={active_intent:'growth_score_audit'};
 assert.equal(routeGrowthScoreAuditIntent('Valerie',active).action,'continue_manager_interview');
 assert.equal(routeGrowthScoreAuditIntent('Переведи на американский',{...active,active_stage:'translation'}).action,'resume_existing_audit');
 assert.equal(routeGrowthScoreAuditIntent('Замени заголовок отчёта',{existing_audit:true}).action,'resume_existing_audit');
 assert.equal(routeGrowthScoreAuditIntent('Обнови отчёт по шаблону v6',{existing_audit:true}).action,'resume_existing_audit');
 for(const text of ['Настрой роутинг для аудита','Напомни канон отчётов','Обнови шаблон отчёта']) assert.equal(routeGrowthScoreAuditIntent(text).action,'maintain_audit_canon');
 for(const text of ['financial report','аудит кода','football score','credit score','Исследуй аудиторию']) assert.equal(routeGrowthScoreAuditIntent(text).matched,false,text);
});
test('Multi-Location retains its paired network profile',()=>{
 for(const role of ['network_parent','focus_location']) {
  const route=resolveGrowthScoreAuditTemplateRoute({audit_format:'multi_location',package_role:role});
  assert.equal(route.template_factory,'createMultiLocationGrowthScoreReportTemplate');
  assert.equal(route.internal_pilot_locale,'ru');
  assert.equal(route.workflow.internal_pilot_locale,'ru');
  assert.equal(factories[route.template_factory](route.template_arguments).reportContext.report_locale,'ru');
 }
});
test('all entrypoints point to the same versioned authoring route',()=>{
 for(const path of ['AGENTS.md','.cursorrules','docs/ROUTER.md','docs/chatgpt-project/INSTRUCTIONS.md','docs/chatgpt-project/INSTRUCTIONS_SHORT.md','docs/chatgpt-project/CURSOR_MULTITASK_PROTOCOL.md','docs/projects/caesthetic/AGENTS.md','docs/projects/caesthetic/ROUTER.md','docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md']) {
  const s=fs.readFileSync(new URL('../../'+path,import.meta.url),'utf8');
  assert.ok(s.includes('canonical-authoring-route'),path);
  assert.ok(s.includes('v6'),path);
 }
});
