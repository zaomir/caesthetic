import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {mergeReviewPages,REVIEW_REGISTRY,reviewCheckPlacementCount} from '../../scripts/caesthetic/review-pages.mjs';
const base={profiles:['marketing','redirect','growth-score-client/v6.0.0'],pages:[{route:'/',source:'site-caesthetic/index.html',profile:'marketing'}]};
const page={source:'site-caesthetic/score/review/ru/v6/index.html',route:'/score/review/ru/v6/',profile:'growth-score-client/v6.0.0',stage:'manager_review',locale:'ru',accessGroupId:'review',viewports:[320,390,1440]};
function fixture(entries){const root=fs.mkdtempSync(path.join(os.tmpdir(),'review-pages-'));const p=path.join(root,REVIEW_REGISTRY);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify({schema:1,pages:entries}));return{root,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};}
test('review pages extend the same contract without mutating it',()=>{const f=fixture([page]);try{assert.equal(mergeReviewPages(f.root,base).pages.length,2);assert.equal(base.pages.length,1);}finally{f.cleanup()}});
for (const [name,delta,pattern] of [['wrong language',{locale:'en'},/Russian/],['unprotected',{accessGroupId:null},/protected/],['path traversal',{route:'/score/../review/'},/mapping/],['unknown profile',{profile:'new-template'},/Unknown/],['missing mobile',{viewports:[1440]},/viewports/],['false approval',{stage:'approved'},/stage/]])test(`review registry rejects ${name}`,()=>{const f=fixture([{...page,...delta}]);try{assert.throws(()=>mergeReviewPages(f.root,base),pattern)}finally{f.cleanup()}});
test('duplicate registrations fail closed',()=>{const f=fixture([page,page]);try{assert.throws(()=>mergeReviewPages(f.root,base),/Duplicate/)}finally{f.cleanup()}});
test('real review pages have server-side PIN routes and honest draft metadata',()=>{
  const root=path.resolve(import.meta.dirname,'../..');
  const registry=JSON.parse(fs.readFileSync(path.join(root,REVIEW_REGISTRY),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'infra/cloudflare/brands/caesthetic.manifest.json'),'utf8'));
  for(const p of registry.pages.filter(p=>p.stage==='manager_review')){
    const access=manifest.scoreProtectedPaths.find(x=>p.route.startsWith(x.prefix)&&x.accessGroupId===p.accessGroupId);
    assert.ok(access,'Review must have an actual protected prefix');assert.ok(access.pinSalt);assert.match(access.pinHash,/^[a-f0-9]{64}$/);
    assert.ok(!manifest.scorePublicPaths.some(x=>p.route.startsWith(x)));
    const html=fs.readFileSync(path.join(root,p.source),'utf8');
    assert.match(html,/<html lang="ru"/);assert.match(html,/data-review-state="manager_review"/);assert.match(html,/name="robots" content="noindex/);
    assert.equal((html.match(/class="v6-question"/g)||[]).length,4);
    assert.equal((html.match(/data-check500-placement=/g)||[]).length,reviewCheckPlacementCount(p));
    if(p.packageRole)assert.ok(html.includes(`data-package-role="${p.packageRole}"`));
    if(p.packageRole==='focus_location')assert.ok(html.includes('href="../#next-step"'));
    assert.ok(!/passwordHash|var PASSWORD|sessionStorage/.test(html));
  }
});
test('focus review cannot establish a second commercial funnel or orphan package',()=>{
  const parent={...page,packageRole:'network_parent',case_id:'test'};
  const child={...page,source:'site-caesthetic/score/review/ru/v6/focus/index.html',route:'/score/review/ru/v6/focus/',packageRole:'focus_location',parentRoute:page.route,case_id:'test'};
  const good=fixture([parent,child]);
  try{const merged=mergeReviewPages(good.root,base);assert.equal(reviewCheckPlacementCount(merged.pages[1]),2);assert.equal(reviewCheckPlacementCount(merged.pages[2]),0);}finally{good.cleanup()}
  for(const entries of [[child],[parent,{...child,accessGroupId:'another'}],[parent,{...child,packageRole:'skip-checks'}]]){
    const bad=fixture(entries);try{assert.throws(()=>mergeReviewPages(bad.root,base),/parent|role/)}finally{bad.cleanup()}
  }
});
