import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, V3_PACKAGE, V3_PARENTS, buildV3, loadV3Package, generateV3, writeV3 } from '../../scripts/caesthetic/build-spoken-medspa-v3.mjs';
import { renderGrowthReport } from '../../scripts/caesthetic/render-growth-score.mjs';
import { scoreGrowthReport } from '../../site-caesthetic/assets/js/growth-score-engine.mjs';
import { OWNER_V3, V3_SECTION_IDS, ownerV3Model, approvedAction } from '../../scripts/caesthetic/growth-score-owner-v3-model.mjs';
import { validateConsistency, validateResearchPublication, digest, reviewDigest, assertReviewed, safeURL, SURFACES } from '../../scripts/caesthetic/consistency-contract.mjs';
import { CHOICE_IDS, validateChoiceQuestions } from '../../scripts/caesthetic/choice-questions-contract.mjs';
import { italicizeV3Keyword } from '../../scripts/caesthetic/growth-score-owner-v3.mjs';
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const count = (s,re) => [...s.matchAll(re)].length;
const p = loadV3Package();
const fixture = () => {
 const matrix=structuredClone(p.matrix),registry=structuredClone(p.registry);
 registry.observations=[];
 for(const q of matrix.queries)for(const s of SURFACES)q.cells[s]={status:'insufficient_evidence',observations:[]};
 return {matrix,registry};
};
// Synthetic signatures are test fixtures only, never delivery evidence or actual human approval.
const approveFixture = value => { value.review = { status:'approved', by:'SYNTHETIC TEST REVIEWER', at:'2026-09-05T18:00:00Z', content_sha256:reviewDigest(value) }; return value; };
function withObservedFixture(status='exact_match') {
 const x=fixture(), q=x.matrix.queries[0];
 const s=x.registry.sources.find(s=>s.surface==='website');
 const o={ id:'TEST-OBS-001', case_id:x.matrix.case_id, source_id:s.id, content_type:'service_page', author_role:'practice', excerpt:`Test-only example: ${q.phrase}.`, collected_at:'2026-09-05T18:00:00Z' };
 x.registry.observations.push(o);
 q.cells.website={status,observations:[{observation_id:o.id,status}]};
 return x;
}
for(const locale of Object.keys(V3_PARENTS)) {
 test(`${locale}: v3 preserves approved diagnosis and score, pins history`,()=>{
  const report=buildV3(locale), orig=p.reports[locale];
  const {presentation:_,...a}=report, {presentation:__,...b}=orig;
  assert.deepEqual(a,b);assert.deepEqual(scoreGrowthReport(report),scoreGrowthReport(orig));
  assert.equal(report.presentation.layout_contract,OWNER_V3);
  assert.equal(report.presentation.v3.release.stage,'review_preview');
 });
 test(`${locale}: deterministic output and complete semantic narrative`,()=>{
  const html=renderGrowthReport(buildV3(locale));
  assert.equal(html,read(`site-caesthetic/score/${V3_PARENTS[locale]}/v3/index.html`));
  assert.deepEqual([...html.matchAll(/<section[^>]* id="([^"]+)" data-cockpit-order="(\d)"/g)].map(x=>x[1]),V3_SECTION_IDS);
  assert.equal(count(html,/data-gap-role="primary"/g),0);assert.equal(count(html,/data-gap-role="supporting"/g),0);
  assert.equal(count(html,/data-inventory-gap=/g),0);assert.equal(count(html,/data-surface=/g),4);
  assert.equal(count(html,/data-cae-check-inquiry/g),2);assert.equal(count(html,/data-cae-sprint-inquiry/g),1);
  assert.equal(count(html,/data-cae-question /g),1);assert.equal(count(html,/data-v3-share=/g),2);
  assert.equal(count(html,/data-v3-query=/g),0);
  assert.equal(count(html,/data-connect4-conclusion/g),1);
  assert.ok(html.indexOf('id="choice-competitors"')<html.indexOf('id="connect4-conclusion"'));
  assert.doesNotMatch(html,/data-team-fixes|Продолжение — отдельное решение|Небольшие правки для команды|Порядок работы над выбранным маршрутом/);
  assert.match(html,/data-commercial-selection="not_supported"/);
  assert.doesNotMatch(html,/id="priority-SMS|id="inventory-SMS|низкочастотн|low-frequency|три главные помехи|Below are the three main barriers/);
  assert.doesNotMatch(html,/What public booking showed|Что показала публичная форма записи/);
  assert.doesNotMatch(html,/Источники этого ответа|Sources for this answer|id="evidence-and-competitors"|id="scores-and-methodology"|href="\/connect4\/"/);
  assert.equal(count(html,/data-expense-illustration/g),1);

  assert.ok(html.indexOf('id="report-intro"')<html.indexOf('id="method-intro"'));
  assert.ok(html.indexOf('id="gap-map"')<html.indexOf('id="choice-offer"'));
  assert.ok(html.indexOf('id="method-intro"')<html.indexOf('id="report-navigation"'));
  assert.ok(html.indexOf('id="method-intro"')<html.indexOf('id="focus-gaps"'));
  assert.doesNotMatch(html,/id="consistency-matrix"/);
  assert.deepEqual([...html.matchAll(/<article[^>]*data-choice-question="([^"]+)"/g)].map(m=>m[1]),CHOICE_IDS);
  assert.equal(count(html,/data-choice-part=/g),24);
  assert.equal(count(html,/data-choice-sources=/g),0);
  assert.doesNotMatch(html,/v3-choice-limit|v3-choice-provenance/);
  assert.doesNotMatch(html.match(/<figure[^>]*data-v3-media="system"[\s\S]*?<\/figure>/)[0],/<figcaption/);
  assert.doesNotMatch(html,/<details[^>]*data-choice-question/);
  assert.ok(html.indexOf('data-cae-sprint-inquiry')>html.indexOf('id="next-step"'));
  assert.match(html,/data-v3-preview-banner/);assert.match(html,/data-release-stage="review_preview"/);
  assert.match(html,/v3-welcome/);assert.doesNotMatch(html,/<details[^>]*class="[^"]*welcome/);
  assert.match(html,/class="v3-signature"/);assert.doesNotMatch(html,/v2-primary|v2-protect|growth-cockpit\.js|growth-report\.css/);
  if(locale==='en-US') assert.doesNotMatch(html,/[А-Яа-яЁё]/);
  assert.doesNotMatch(html.replace(/<[^>]+>/g,''),/clinician_trust_proof/,'public source labels are readable');
  for(const ref of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${ref[1]}"`),`Unresolved ${ref[1]}`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,'duplicate IDs');
 });
 test(`${locale}: exact approved picture pairs only, no private packet in public HTML`,()=>{
  const html=renderGrowthReport(buildV3(locale));
  assert.equal(count(html,/<picture>/g),4);
  for(const [role,pair] of Object.entries(p.release.assets)) for(const asset of Object.values(pair)) assert.equal(html.includes(asset.src),role!=="engagement");
  const allowed=new Set(Object.values(p.release.assets).flatMap(pair=>Object.values(pair).map(a=>a.src)));
  for(const image of html.matchAll(/<(?:img|source)\b[^>]*\b(?:src|srcset)="([^"]+)"/g)) assert.ok(allowed.has(image[1]),`Unapproved image ${image[1]}`);
  assert.doesNotMatch(html,/report\.json|approved-report|source-register\.json|client_release_approval|SYNTHETIC TEST REVIEWER|selected_by|reviewer_status|content_sha256/);
  const publicMeta=JSON.parse(read(`site-caesthetic/score/${V3_PARENTS[locale]}/v3/presentation.json`));
  assert.deepEqual(Object.keys(publicMeta).sort(),['layout_contract','matrix_status','revision','source_input_digest','source_ref','stage'].sort());
 });
 test(`${locale}: Check500 preserved twice from its declared versioned locale copy source`,()=>{
  const report=buildV3(locale),html=renderGrowthReport(report),copy=report.presentation.owner_copy.check_offer;
  // Compare visible content via stable text escaping; exact source lock is not silently rewritten.
  assert.equal(count(html,/data-cae-check500-section/g),2);
  assert.equal(count(html,/data-cae-check500-credit/g),2);
  const title=locale==='ru'?'Все ли обращения доходят до записи?':'Do all your inquiries make it to a booking?';
  assert.equal(html.split(title).length-1,2);
 });
}
test('baseline parent/v2 files and all eight approved PNGs are unmodified',()=>{
 for(const [file,hash] of Object.entries(p.release.frozen_baseline))assert.equal(digest(fs.readFileSync(path.join(ROOT,file))),hash,file);
 for(const pair of Object.values(p.release.assets))for(const a of Object.values(pair))assert.equal(digest(fs.readFileSync(path.join(ROOT,'site-caesthetic'+a.src))),a.sha256,a.src);
});
test('client release refuses a preview before any file is written',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'v3-write-test-'));
 try {assert.throws(()=>writeV3({outputRoot:out,clientRelease:true}),/REVIEW_REQUIRED/);assert.deepEqual(fs.readdirSync(out),[]);}finally{fs.rmSync(out,{recursive:true,force:true});}
});
test('changed pinned package input fails before touching either output',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'v3-package-test-'));
 try{
  fs.cpSync(path.join(ROOT,V3_PACKAGE),path.join(temp,'packet'),{recursive:true});
  const out=path.join(temp,'output');fs.mkdirSync(out);fs.writeFileSync(path.join(out,'sentinel'),'keep');
  fs.appendFileSync(path.join(temp,'packet/copy.en-US.json'),' ');
  assert.throws(()=>writeV3({packageDir:path.join(temp,'packet'),outputRoot:out}),/V3_INPUT_CHANGED/);
  assert.deepEqual(fs.readdirSync(out),['sentinel']);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('repeat builds produce identical bytes and do not inject execution time',()=>{
 assert.deepEqual([...generateV3()],[...generateV3()]);assert.doesNotThrow(()=>writeV3({check:true}));
});
test('another case or unsupported locale cannot render as Spoken v3',()=>{
 const r=buildV3('ru');r.audit.project_id='other-case';assert.throws(()=>renderGrowthReport(r),/V3_INVALID/);
 assert.throws(()=>buildV3('fr'),/unsupported locale/);
});
test('preview masks all draft findings even when draft observations are added',()=>{
 const r=buildV3('en-US'),f=withObservedFixture();r.presentation.v3.matrix=f.matrix;r.presentation.v3.registry=f.registry;
 delete r.presentation.v3.release.presentation_mode;
 const html=renderGrowthReport(r);assert.doesNotMatch(html,/Test-only example/);
 const model=ownerV3Model(r,scoreGrowthReport(r));
 assert.ok(model.queries.every(q=>Object.values(q.cells).every(c=>c.status==='insufficient_evidence')));
});
test('compact view retains forty source-bound cells in the validated research model',()=>{
 assert.equal(validateResearchPublication(p.release,p.matrix,p.registry),true);
 const html=renderGrowthReport(buildV3('ru'));
 const model=ownerV3Model(buildV3("ru"),scoreGrowthReport(buildV3("ru")));
 assert.equal(model.observations.size,p.registry.observations.length);assert.equal(model.queries.length,10);
 assert.equal(count(html,/data-source-observation=/g),0);
 assert.doesNotMatch(html,/Ожидает проверки|Черновые фразы|pending_review|нет подтверждённых наблюдений/i);
 for(const q of p.matrix.queries){assert.equal(q.frequency,null);for(const s of SURFACES){
  assert.ok(q.cells[s].observations.length);assert.ok(q.cells[s].coverage.ru);
  for(const match of q.cells[s].observations)assert.ok(model.observations.has(match.observation_id));
 }}
 for(const o of p.registry.observations){assert.ok(o.method.ru&&o.limitations.ru);assert.notEqual(o.review?.status,'approved');}
 const changed=structuredClone(p.registry);changed.observations[0].excerpt+=' changed';
 assert.throws(()=>validateResearchPublication(p.release,p.matrix,changed),/changed after freeze/);
 assert.throws(()=>validateResearchPublication({...p.release,stage:'client_release'},p.matrix,p.registry),/impersonate/);
 delete changed.observations[0].method;
 assert.throws(()=>validateResearchPublication({...p.release,research_package_digest:digest({matrix:p.matrix,registry:changed})},p.matrix,changed),/research provenance/);
});
test('Russian keyword inflections are italic without corrupting markup or double wrapping',()=>{
 const input='<p title="соответствие">Соответствие и соответствия <em>соответствием</em>.</p><script>const x="соответствие";</script>';
 const expected='<p title="соответствие"><em>Соответствие</em> и <em>соответствия</em> <em>соответствием</em>.</p><script>const x="соответствие";</script>';
 assert.equal(italicizeV3Keyword(input),expected);assert.equal(italicizeV3Keyword(expected),expected);
});
for(const [name,mutate,re] of [
 ['nine phrases',f=>f.matrix.queries.pop(),/exactly 10/],
 ['fifth surface',f=>f.matrix.surfaces.push('paid_ads'),/four ordered/],
 ['same phrase twice',f=>f.matrix.queries[1].phrase=f.matrix.queries[0].phrase,/unique phrase/],
 ['different case',f=>f.registry.case_id='wrong',/case identity/],
 ['wrong source surface',f=>f.registry.sources[0].surface='lead_intake',/source surface/],
 ['JavaScript URL',f=>f.registry.sources[0].url='javascript:alert(1)',/unsafe source/],
 ['embedded credentials',f=>f.registry.sources[0].url='https://secret:password@example.com',/unsafe source/],
 ['dangling query provenance',f=>f.matrix.queries[0].source_ids=['unknown'],/query basis/],
 ['candidate invented volume',f=>f.matrix.queries[0].frequency={monthly_searches:10},/candidate cannot/],
 ['unverified claimed frequency',f=>f.matrix.queries[0].status='verified_query',/frequency provenance/],
 ['empty cell is not absence',f=>f.matrix.queries[0].cells.website.status='not_found_in_sample',/empty cell/],
 ['empty cell is not match',f=>f.matrix.queries[0].cells.website.status='exact_match',/empty cell/],
 ['missing TikTok coverage',f=>f.registry.coverage=f.registry.coverage.filter(c=>c.platform!=='TikTok'),/social discovery/],
])test(`contract rejects ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>validateConsistency(f.matrix,f.registry),re);});
test('exact matches require the source phrase, not a paraphrase',()=>{
 const f=withObservedFixture();assert.doesNotThrow(()=>validateConsistency(f.matrix,f.registry));
 f.registry.observations[0].excerpt='Not the same wording at all';assert.throws(()=>validateConsistency(f.matrix,f.registry),/exact match cannot/);
});
test('video transcripts require timestamp and origin',()=>{
 const f=withObservedFixture();f.registry.observations[0].content_type='video_transcript';assert.throws(()=>validateConsistency(f.matrix,f.registry),/transcript provenance/);
});
test('reply observations require the parent comment or review',()=>{
 const f=withObservedFixture();f.registry.observations[0].content_type='owner_review_reply';assert.throws(()=>validateConsistency(f.matrix,f.registry),/reply context/);
});
test('negative sample requires bounded, real source references',()=>{
 const f=withObservedFixture('not_found_in_sample');const match=f.matrix.queries[0].cells.website.observations[0];
 assert.throws(()=>validateConsistency(f.matrix,f.registry),/bounded sample/);
 match.sample={count:2,start:'2026-01-01',end:'2026-01-02',source_ids:['wrong']};assert.throws(()=>validateConsistency(f.matrix,f.registry),/bounded sample/);
});
test('final evidence approval is bound to content, including the fixed query set',()=>{
 const f=withObservedFixture();approveFixture(f.registry.observations[0]);approveFixture(f.matrix.queries[0].cells.website.observations[0]);
 f.matrix.query_set_review={status:'approved',by:'SYNTHETIC TEST REVIEWER',at:'2026-09-05T18:00:00Z',content_sha256:digest(f.matrix.queries.map(({cells,...q})=>q))};
 approveFixture(f.registry);approveFixture(f.matrix);assert.doesNotThrow(()=>validateConsistency(f.matrix,f.registry,{clientRelease:true}));
 f.registry.observations[0].excerpt += ' changed after review';assert.throws(()=>validateConsistency(f.matrix,f.registry,{clientRelease:true}),/REVIEW_REQUIRED/);
});
test('root release review does not remain valid after input hash changes',()=>{
 const release=approveFixture({stage:'client_release',inputs:{one:'abc'}});assert.doesNotThrow(()=>assertReviewed(release,'test'));
 release.inputs.one='def';assert.throws(()=>assertReviewed(release,'test'),/REVIEW_REQUIRED/);
});
test('safe request/navigation actions do not invent payment',()=>{
 assert.deepEqual(approvedAction({type:'request',intent:'sprint'}),{type:'request',intent:'sprint'});
 assert.throws(()=>approvedAction({type:'payment',href:'https://buy.stripe.com/guessed'}),/missing signed order/);
 assert.throws(()=>approvedAction({type:'navigate',href:'javascript:alert(1)'}),/ACTION_INVALID/);
 assert.equal(safeURL('https://example.com/safe'),'https://example.com/safe');
});

test("US spelling correction is opt-in, not a mutation of old artifacts",()=>{const h=renderGrowthReport(buildV3("en-US"));assert.match(h,/check500-section\/en-US\/1\.1\.0/);assert.match(h,/your inquiries/);assert.match(read(`site-caesthetic/score/${V3_PARENTS["en-US"]}/v2/index.html`),/your enquiries/);});

test('private source/revision artifacts do not mirror to the public satellite',()=>{
 const sync=read('scripts/caesthetic/sync_agents_bidirectional.py');
 const exclude=sync.split('EXCLUDE_REL_PREFIXES = (')[1].split('\n)')[0];
 assert.ok(exclude.includes('spoken-medspa-snellville-2026/revisions/'));
 assert.ok(exclude.includes('spoken-medspa-snellville-2026/v3-acceptance/'));
 const policy=JSON.parse(read('infra/cloudflare/brands/caesthetic.manifest.json'));
 assert.ok(policy.scorePublicPaths.includes(`/score/${V3_PARENTS.ru}/`));
 assert.ok(policy.scoreProtectedPaths.some(e=>e.prefix===`/score/${V3_PARENTS['en-US']}/`));
 assert.doesNotMatch(read('site-caesthetic/sitemap.xml'),/spoken-medspa/);
});

const choiceFixture = () => {
 const report=buildV3('ru'), model=ownerV3Model(report,scoreGrowthReport(report));
 return {packet:structuredClone(p.choices),context:{release:structuredClone(p.release),registry:{sources:new Map(model.sources),observations:new Map([...model.observations].map(([k,v])=>[k,structuredClone(v)]))},metrics:model.metrics,inventory:model.inventory}};
};
for(const [name,change,re] of [
 ['question order',f=>f.packet.questions.reverse(),/four ordered/],
 ['missing niche criterion',f=>delete f.packet.questions[0].ideal,/ideal and observed deviation/],
 ['untraceable criterion',f=>f.packet.questions[0].criterion_refs=['UNKNOWN'],/criterion source reference/],
 ['unsafe criterion source',f=>f.packet.criteria_sources[0].url='javascript:alert(1)',/criterion provenance/],
 ['undated criterion',f=>delete f.packet.criteria_sources[0].checked_at,/criterion provenance/],
 ['missing translation',f=>delete f.packet.questions[0].answer.ru,/paired text/],
 ['dangling source',f=>f.packet.questions[0].evidence_refs=['observation:missing'],/dangling observation/],
 ['unapproved metric',f=>f.packet.questions[0].evidence_refs=['metric:missing'],/unapproved or missing/],
 ['missing addendum',f=>f.packet.questions[0].repair_addendum_ref='missing',/dangling repair addendum/],
 ['missing repair',f=>{delete f.packet.questions[0].preserve;f.packet.questions[0].repair_ref='missing';},/dangling repair/],
 ['duplicate review',f=>f.context.registry.observations.get('O-REVIEW-AZIA').author_key='google-florence-nonon',/duplicate review/],
 ['reply as recurrence',f=>f.context.registry.observations.get('O-REVIEW-AZIA').content_type='owner_review_reply',/independent reviews/],
 ['unstated sample',f=>delete f.packet.questions[2].recurrence.window,/bounded review sample/],
 ['fifth question',f=>f.packet.questions.push(structuredClone(f.packet.questions[0])),/four ordered/],
 ['missing synthesis',f=>delete f.packet.connect4_conclusion,/separate Connect4/],
 ['out-of-catalog action',f=>f.packet.questions[0].catalog_modules=['B99'],/out-of-catalog publication/],
 ['minor fix promoted',f=>f.packet.team_fixes[0].materiality='priority',/cannot inflate paid scope/],
 ['missing value result',f=>delete f.packet.commercial_selection.finding,/actual result/],
 ['filler priorities',f=>f.packet.commercial_selection.priority_ids=['SMS-26-01'],/actual result/],
 ['unsupported approval',f=>{f.packet.commercial_selection.status='approved';f.packet.commercial_selection.priority_ids=['SMS-26-01','SMS-26-02','SMS-26-03'];},/separate patient and delivery value/],
 ['preservation without check',f=>delete f.packet.questions[1].preserve.verify,/preservation check/]
])test(`choice contract rejects ${name}`,()=>{
 const f=choiceFixture();change(f);f.context.release.choice_questions_digest=digest(f.packet);
 assert.throws(()=>validateChoiceQuestions(f.packet,f.context),re);
});
test('choice copy is frozen and does not inherit engineering approval',()=>{
 const f=choiceFixture();f.packet.questions[0].answer.ru+=' changed';
 assert.throws(()=>validateChoiceQuestions(f.packet,f.context),/after freeze/);
 const fresh=choiceFixture();fresh.context.release.stage='client_release';
 assert.throws(()=>validateChoiceQuestions(fresh.packet,fresh.context),/REVIEW_REQUIRED/);
});


test('paid selection requires current per-priority value review and a content-bound selection review',()=>{
 const f=choiceFixture(), selection=f.packet.commercial_selection;
 selection.status='approved'; selection.priority_ids=['SMS-26-01','SMS-26-02','SMS-26-03'];
 // Synthetic value evidence is only for exercising the gate, never a Spoken finding.
 f.context.inventory=structuredClone(f.context.inventory);
 for(const id of selection.priority_ids){
  const g=f.context.inventory.find(g=>g.id===id);
  g.patient_choice_materiality={ru:'Тестовый путь', 'en-US':'Synthetic path'};
  g.delivery_value={ru:'Тестовый результат', 'en-US':'Synthetic outcome'};
  g.catalog_modules=['A08'];approveFixture(g);
 }
 f.context.release.choice_questions_digest=digest(f.packet);
 assert.throws(()=>validateChoiceQuestions(f.packet,f.context),/commercial selection/);
 approveFixture(selection);f.context.release.choice_questions_digest=digest(f.packet);
 assert.doesNotThrow(()=>validateChoiceQuestions(f.packet,f.context));
 const primary=f.context.inventory.find(g=>g.id===selection.priority_ids[0]), retained=primary.evidence_refs;
 primary.evidence_refs=[];approveFixture(primary);assert.throws(()=>validateChoiceQuestions(f.packet,f.context),/retained approved evidence/);
 primary.evidence_refs=retained;approveFixture(primary);
 f.context.inventory.find(g=>g.id===selection.priority_ids[0]).delivery_value.ru+=' changed';
 assert.throws(()=>validateChoiceQuestions(f.packet,f.context),/commercial priority/);
});
