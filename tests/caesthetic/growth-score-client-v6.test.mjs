import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createGrowthScoreV6ReportTemplate} from '../../scripts/caesthetic/growth-score-report-template.mjs';
import {CLIENT_V6,clientV6Document,createV6Content,renderClientV6Report} from '../../scripts/caesthetic/growth-score-client-v6.mjs';
import {stickyVisible,shareReport} from '../../scripts/caesthetic/report-v6/client.mjs';
const reference=new URL('../../docs/caesthetic/design/report-v6/',import.meta.url);
const model=locale=>JSON.parse(fs.readFileSync(new URL(`spoken-reference.${locale}.json`,reference),'utf8'));

test('paired v6 references keep the design structure and safe product hierarchy',()=>{
  for (const locale of ['ru','en']) {
    const html=clientV6Document(model(locale));
    assert.ok(html.includes(`lang="${locale}"`));
    assert.ok(html.includes(CLIENT_V6));
    assert.equal((html.match(/class="v6-question"/g)||[]).length,4);
    assert.equal((html.match(/class="v6-plan-item"/g)||[]).length,3);
    assert.equal((html.match(/class="v6-surface"/g)||[]).length,4);
    assert.equal((html.match(/data-check500-placement=/g)||[]).length,2);
    assert.equal((html.match(/href="https:\/\/caesthetic\.com\/sprint\/\?offer=spoken-four-surface-sprint-v1"/g)||[]).length,1);
    assert.ok(html.includes('data-v6-sticky hidden'));
    assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|=|>)/);
    assert.doesNotMatch(html,/support\.js|DCLogic|<x-dc|<sc-if|onClick=|\{\{/);
    if(locale==='en') assert.doesNotMatch(html,/[А-Яа-яЁё]/);
  }
});

test('new reports have no inherited client facts and incomplete content fails',()=>{
  const blank=createV6Content('en');
  assert.equal(blank.business_name,null);
  assert.equal(blank.commercial.included_check,false);
  assert.throws(()=>clientV6Document(blank),/must be completed/);
  assert.throws(()=>createV6Content('fr'),/ru and en/);
});

test('Spoken commercial conditions cannot leak into another client',()=>{
  const m=model('en');m.business_name='Another Practice';
  assert.throws(()=>clientV6Document(m),/another business/);
  m.commercial.offer_id=null;
  assert.throws(()=>clientV6Document(m),/scoped offer/);
  m.commercial={offer_id:null,included_check:false,continuation:'separate',credit:false};
  const html=clientV6Document(m);
  assert.ok(html.includes('href="https://caesthetic.com/sprint/"'));
  assert.doesNotMatch(html,/below the Sprint price|leaving \$2,000|already includes the Lead-to-Revenue/);
});

test('all report content is escaped rather than executed',()=>{
  const m=model('en');m.summary='</p><script>alert(1)</script>';m.questions[0].title='<img src=x onerror=alert(2)>';
  const html=clientV6Document(m);
  assert.doesNotMatch(html,/<script>alert\(1\)|<img src=x/);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('the main renderer adapter preserves identity, selected gaps and report evidence',()=>{
  const m=model('en');
  const report={practice:{name:m.business_name},reportContext:{report_locale:'en'},humanDiagnosis:{focus_selection:{primary_gap_id:'visit',supporting_gap_ids:['routes','trust']},gap_inventory:[{evidence_refs:['OBS-1']}]},presentation:{v6:m}};
  assert.throws(()=>renderClientV6Report(report),/evidence references/);
  [...m.questions,...m.plan].forEach(item=>{item.evidence_refs=['OBS-1'];});
  assert.ok(renderClientV6Report(report).includes(CLIENT_V6));
  m.plan.reverse();assert.throws(()=>renderClientV6Report(report),/approved Primary/);m.plan.reverse();
  report.practice.name='Wrong';assert.throws(()=>renderClientV6Report(report),/identity\/locale/);
  report.audit={format:'multi_location'};assert.throws(()=>renderClientV6Report(report),/network report/);
});

test('sticky CTA disappears at the final offer and restores on reverse scrolling',()=>{
  assert.equal(stickyVisible(400,2000,3000,800),false);
  assert.equal(stickyVisible(-10,1000,2000,800),true);
  assert.equal(stickyVisible(-500,500,1500,800),false);
  assert.equal(stickyVisible(-10,1000,2000,800),true);
  assert.equal(stickyVisible(400,2000,3000,800),false);
});

test('share reports success only after a successful native share or copy',async()=>{
  const data={url:'https://caesthetic.com/score/example/',title:'Report'};
  assert.equal(await shareReport({share:async()=>{}},data),'shared');
  assert.equal(await shareReport({share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}},data),'cancelled');
  let copied='';assert.equal(await shareReport({clipboard:{writeText:async s=>{copied=s;}}},data),'copied');assert.equal(copied,data.url);
  assert.equal(await shareReport({clipboard:{writeText:async()=>{throw Error('denied');}}},data),'manual');
  assert.equal(await shareReport({},data),'manual');
});

test('source archive and exact imported logo are preserved',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('source-manifest.json',reference),'utf8'));
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest(fs.readFileSync(new URL('claude-project.zip',reference))),manifest.archive_sha256);
  assert.equal(digest(fs.readFileSync(new URL('../../scripts/caesthetic/report-v6/logo.png',import.meta.url))),manifest.source_files['assets/brand/logo-square.png']);
});


test('canonical authoring factory selects v6 while keeping diagnostic schema v5',()=>{
  for (const locale of ['ru','en']) {
    const report=createGrowthScoreV6ReportTemplate({locale});
    assert.equal(report.schemaVersion,5);
    assert.equal(report.reportContext.report_locale,locale);
    assert.equal(report.presentation.layout_contract,CLIENT_V6);
    assert.equal(report.presentation.v6.locale,locale);
    assert.equal(report.presentation.v6.business_name,null);
    assert.equal(report.humanDiagnosis.focus_selection.primary_gap_id,null);
  }
});
