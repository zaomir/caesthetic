import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=(process.env.AMY_BASE||'http://127.0.0.1:4187/amy').replace(/\/$/,'');
const out=process.env.AMY_QA_OUTPUT||'/tmp/amy-browser-qa';fs.mkdirSync(out,{recursive:true});
const routes=['/fr/','/fr/tarifs/','/fr/avis/','/en/','/en/prices/','/en/reviews/'];
const browser=await chromium.launch({headless:true});const results=[];
try{
 for(const route of routes)for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.complete?null:new Promise(resolve=>{el.onload=resolve;el.onerror=resolve;}));}
  await page.evaluate(()=>window.scrollTo(0,0));
  const state=await page.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>window.innerWidth,broken:[...document.images].filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src),images:document.images.length,h1:document.querySelectorAll('h1').length,body:document.body.textContent,links:[...document.querySelectorAll('a[href]')].map(a=>a.href)}));
  assert.equal(state.lang,route.startsWith('/fr/')?'fr':'en');assert.equal(state.overflow,false,route+' horizontal overflow '+width);assert.equal(state.h1,1);assert.deepEqual(state.broken,[]);assert.deepEqual(errors,[]);
  assert.ok(state.body.includes('20 place du Marchallac’h, 22300 Lannion, France'));
  assert.ok(!state.links.some(x=>x.includes('XmWJ4xw78mhmk2M47')||x.includes('raimov')));
  assert.ok(state.links.includes('https://cal.com/amybernis.lannion/rdv'));
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
  assert.deepEqual(violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],route+' accessibility '+width);
  if(/avis|reviews/.test(route)){
   let mutations=0;page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))mutations++;});
   for(const score of [1,2,3,4,5]){await page.locator(`[data-rating="${score}"]`).click();assert.equal(await page.locator(`[data-rating="${score}"]`).getAttribute('aria-pressed'),'true');assert.ok((await page.locator('[data-response-title]').textContent()).length>3);assert.equal(new URL(page.url()).pathname,new URL(base+route).pathname);assert.equal(await page.locator('video').count(),0);}
   await page.locator('[data-reset]').click();assert.equal(await page.locator('[data-rating][aria-pressed=true]').count(),0);assert.equal(mutations,0);
  }
  const languageHref=await page.locator('.language').getAttribute('href');const alternate=await context.request.get(new URL(languageHref,page.url()).toString());assert.equal(alternate.status(),200);
  await page.screenshot({path:path.join(out,route.replaceAll('/','_')+width+'.png')});
  results.push({route,width,status:'PASS',images:state.images,axeViolations:0,overflow:false});await context.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,checkedAt:new Date().toISOString(),status:'PASS',results},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:results.length,base,output:out}));
}finally{await browser.close();}
