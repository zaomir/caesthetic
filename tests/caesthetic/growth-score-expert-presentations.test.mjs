import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createGrowthScorePresentationTemplate} from '../../scripts/caesthetic/growth-score-report-template.mjs';
import {expertDocument,renderExpertReport,CLIENT_V61,CLIENT_V62} from '../../scripts/caesthetic/growth-score-expert-presentations.mjs';
import {resolveGrowthScoreAuditTemplateRoute,routeGrowthScoreAuditIntent} from '../../scripts/caesthetic/growth-score-intent-router.mjs';
import {buildReportPresentations} from '../../scripts/caesthetic/build-report-presentations.mjs';
import {isAllowedRealScoreOutput} from '../../scripts/caesthetic/render-growth-score.mjs';
import {createV5Report} from './helpers/growth-score-v5-fixture.mjs';

const dir=new URL('../../docs/caesthetic/design/report-presentations/',import.meta.url);
const sample=()=>JSON.parse(fs.readFileSync(new URL('example.ru.json',dir),'utf8'));

test('all three blank templates retain schema v5 and contain no inherited client data',()=>{
  for(const version of ['v6','v6.1','v6.2']) {
    const report=createGrowthScorePresentationTemplate({version});
    assert.equal(report.schemaVersion,5);
    assert.equal(report.presentation.v6.business_name,null);
    assert.equal(report.humanDiagnosis.focus_selection.primary_gap_id,null);
    assert.equal(report.presentation.v6.commercial.offer_id,null);
    assert.equal(report.presentation.v6.commercial.included_check,false);
  }
  assert.throws(()=>createGrowthScorePresentationTemplate({version:'v6.3'}),/Unknown/);
  assert.throws(()=>createGrowthScorePresentationTemplate({version:'v6.1',locale:'en'}),/Russian/);
});

test('both Expert profiles embed the exact original stylesheet',()=>{
  const original=fs.readFileSync(new URL('../../site-caesthetic/private/expert-dental/index.html',import.meta.url),'utf8');
  const css=[...original.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
  const manifest=JSON.parse(fs.readFileSync(new URL('source-manifest.json',dir),'utf8'));
  assert.equal(createHash('sha256').update(css).digest('hex'),manifest.css_sha256);
  for(const version of ['v6.1','v6.2']) {
    const s=sample(), html=expertDocument(s.v6,s.expert,{version});
    assert.ok(html.includes(`<style>${css}</style>`));
    assert.equal((html.match(/data-check500-placement=/g)||[]).length,2);
    assert.equal((html.match(/data-expert-sprint/g)||[]).length,1);
    assert.equal((html.match(/<article class="platform-panel"/g)||[]).length,4);
    assert.equal((html.match(/<section class=/g)||[]).length,version==='v6.1'?16:6);
    for(const q of s.v6.questions) assert.ok(html.includes(q.observation));
    assert.ok(html.includes('«После» показывает согласованный результат работы'));
    assert.doesNotMatch(html,/<form|id="audit-password"|Expert Dental|Spoken|class="platform-shot evidence-slot"/);
  }
});

test('selected order, traceable evidence and screenshot source are enforced',()=>{
  let s=sample();s.expert.before_after.reverse();assert.throws(()=>expertDocument(s.v6,s.expert),/ordered Top 3/);
  s=sample();s.expert.platforms[0].evidence_refs=['missing'];assert.throws(()=>expertDocument(s.v6,s.expert),/resolve/);
  s=sample();s.expert.platforms[0].screenshot={src:'https://example.org/map.png',alt:'Карта',caption:'Подтверждение',evidence_ref:'DEMO-WEB'};
  assert.throws(()=>expertDocument(s.v6,s.expert),/Screenshot/);
  s=sample();s.expert.sources[0].url='javascript:alert(1)';assert.throws(()=>expertDocument(s.v6,s.expert),/HTTPS/);
  s=sample();s.expert.platforms[0].screenshot={src:'//bad.example/map.png',alt:'Карта',caption:'Подтверждение',evidence_ref:'DEMO-MAPS'};
  assert.throws(()=>expertDocument(s.v6,s.expert),/HTTPS/);
});

test('client text is escaped and missing screenshots do not become fake evidence',()=>{
  const s=sample();s.expert.diagnosis='<img src=x onerror=alert(1)>';
  const html=expertDocument(s.v6,s.expert);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(html,/<img src=x|class="platform-shot evidence-slot"/);
  assert.ok(expertDocument(s.v6,s.expert,{preview:true}).includes('Учебные данные'));
});

test('report adapter preserves identity, evidence and network boundary',()=>{
  const s=sample();
  const r={practice:{name:s.v6.business_name},reportContext:{report_locale:'ru'},humanDiagnosis:{focus_selection:{primary_gap_id:'visit',supporting_gap_ids:['routes','trust']},gap_inventory:[{evidence_refs:s.expert.sources.map(x=>x.id)}]},presentation:{v6:s.v6,expert:s.expert,layout_contract:CLIENT_V61}};
  assert.ok(renderExpertReport(r).includes(CLIENT_V61));
  r.presentation.layout_contract=CLIENT_V62;assert.ok(renderExpertReport(r).includes(CLIENT_V62));
  r.humanDiagnosis.gap_inventory[0].evidence_refs.pop();assert.throws(()=>renderExpertReport(r),/evidence/);
  r.humanDiagnosis.gap_inventory[0].evidence_refs=s.expert.sources.map(x=>x.id);
  r.practice.name='Another';assert.throws(()=>renderExpertReport(r),/identity/);
  r.practice.name=s.v6.business_name;r.audit={format:'multi_location'};assert.throws(()=>renderExpertReport(r),/network/);
});

test('router keeps default v6, supports explicit variants and protects network packages',()=>{
  assert.equal(resolveGrowthScoreAuditTemplateRoute({audit_format:'single'}).template_factory,'createGrowthScoreV6ReportTemplate');
  for(const presentation of ['v6.1','v6.2']) {
    const r=routeGrowthScoreAuditIntent('собрать аудит',{audit_format:'single',presentation});
    assert.equal(r.template_route.template_arguments.version,presentation);
    assert.throws(()=>resolveGrowthScoreAuditTemplateRoute({audit_format:'network',presentation}),/network/);
  }
});

test('three-view builder cannot turn an unapproved draft into a rendered report',()=>{
  const s=sample(), r=createGrowthScorePresentationTemplate({version:'v6.1'});
  r.presentation.v6=s.v6;r.presentation.expert=s.expert;
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'report-views-')), out=path.join(temp,'out');
  try {assert.throws(()=>buildReportPresentations(r,out));assert.equal(fs.existsSync(out),false);} finally {fs.rmSync(temp,{recursive:true,force:true});}
});

test('versioned outputs keep the unguessable score package boundary',()=>{
  const r={presentation:{layout_contract:CLIENT_V61}};
  assert.equal(isAllowedRealScoreOutput(r,'/repo/site-caesthetic/score/demo-1234567890abcdef/v6.1/index.html'),true);
  assert.equal(isAllowedRealScoreOutput(r,'/repo/site-caesthetic/score/demo/v6.1/index.html'),false);
  assert.equal(isAllowedRealScoreOutput(r,'/repo/site-caesthetic/score/demo-1234567890abcdef/v6.2/index.html'),false);
  assert.equal(isAllowedRealScoreOutput(r,'/repo/public/demo-1234567890abcdef/v6.1/index.html'),false);
});

test('one validated synthetic report produces three views with identical diagnostic facts',()=>{
  const s=sample(), r=createV5Report();
  r.reportContext.report_locale='ru';s.v6.business_name=r.practice.name;
  const ids=[r.humanDiagnosis.focus_selection.primary_gap_id,...r.humanDiagnosis.focus_selection.supporting_gap_ids];
  const map=Object.fromEntries(s.expert.sources.map((source,i)=>[source.id,['search.map_visibility','website.booking_friction','social.proof_quality','reputation.rating','search.map_visibility'][i]]));
  const rebind=value=>{if(!value||typeof value!=='object')return;for(const [key,child] of Object.entries(value)){if(key==='evidence_refs')value[key]=child.map(id=>map[id]);else rebind(child);}};
  rebind(s);s.expert.sources.forEach(source=>{source.id=map[source.id];});
  s.expert.sources=s.expert.sources.filter((source,i,all)=>all.findIndex(other=>other.id===source.id)===i);
  s.v6.plan.forEach((item,i)=>{item.id=ids[i];s.expert.before_after[i].gap_id=ids[i];});
  r.presentation={v6:s.v6,expert:s.expert,layout_contract:CLIENT_V61};
  const original=JSON.stringify(r), out=fs.mkdtempSync(path.join(os.tmpdir(),'three-presentations-'));
  try {
    const manifest=buildReportPresentations(r,out);
    assert.equal(manifest.length,3);assert.equal(new Set(manifest.map(x=>x.facts_sha256)).size,1);
    const facts=manifest.map(entry=>{const copy=JSON.parse(fs.readFileSync(path.join(out,entry.report)));delete copy.presentation;return copy;});
    assert.deepEqual(facts[0],facts[1]);assert.deepEqual(facts[1],facts[2]);
    manifest.forEach(entry=>assert.ok(fs.readFileSync(path.join(out,entry.html),'utf8').includes(entry.layout_contract)));
    assert.equal(JSON.stringify(r),original);
  } finally {fs.rmSync(out,{recursive:true,force:true});}
});
