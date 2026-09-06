/** Version-specific QA. Production mode is read-only; all submissions are mocked. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { ROOT, V3_PARENTS, loadV3Package } from './build-spoken-medspa-v3.mjs';
import { digest } from './consistency-contract.mjs';
import { CHOICE_IDS } from './choice-questions-contract.mjs';
import { V3_SECTION_IDS } from './growth-score-owner-v3-model.mjs';
const out = process.env.CAE_V3_QA_OUT || '/tmp/spoken-v3-qa';
fs.mkdirSync(out, { recursive: true });
const engine = process.env.CAE_V3_QA_ENGINE || 'chromium';
assert.ok(['chromium','firefox','webkit'].includes(engine));
const production = process.env.CAE_V3_QA_BASE === 'https://caesthetic.com';
if (process.env.CAE_V3_QA_BASE && !production) throw new Error('Only canonical production or the internal test server may be used');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server = http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(ROOT,'site-caesthetic','.'+pathname),base=path.join(ROOT,'site-caesthetic');
 if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=production?'https://caesthetic.com':`http://127.0.0.1:${server.address().port}`;
const browser = await {chromium,firefox,webkit}[engine].launch({headless:true});
const result={status:'RUNNING',engine,browser:browser.version(),base,mode:production?'production-read-only':'local-build',checked_at:new Date().toISOString(),viewports:[],actions:[],errors:[],byte_checks:[]};
try {
 if(production){
  assert.match(process.env.CAE_EXPECTED_SHA||'',/^[a-f0-9]{40}$/);result.expected_sha=process.env.CAE_EXPECTED_SHA;
  for(const rel of [`score/${V3_PARENTS.ru}/v3/index.html`,`score/${V3_PARENTS.ru}/v3/presentation.json`,'assets/css/growth-score-owner-v3.css','assets/js/growth-score-owner-v3.js']){
   const r=await fetch(base+'/'+rel);assert.equal(r.status,200,rel);const data=Buffer.from(await r.arrayBuffer());assert.equal(digest(data),digest(fs.readFileSync(path.join(ROOT,'site-caesthetic',rel))),rel);result.byte_checks.push(rel);
  }
  for(const suffix of ['v3/','v3/index.html','v3/presentation.json']){
   const r=await fetch(`${base}/score/${V3_PARENTS['en-US']}/${suffix}`);const body=await r.text();
   assert.match(body,/score-password|password|access/i);assert.doesNotMatch(body,/data-layout-contract="owner-decision-report\/3/);assert.doesNotMatch(body,/source_input_digest/);
  }
  result.english_access='protected shell verified; unlocked client content not asserted';
 }
 for(const locale of production?['ru']:['ru','en-US']){
  const context=await browser.newContext({reducedMotion:'reduce'});let mockFailure=false,posts=[];
  await context.route('**/*',async route=>{
   const req=route.request();
   if(!['GET','HEAD'].includes(req.method())){
    posts.push({url:req.url(),body:req.postData()});
    return route.fulfill({status:mockFailure?503:200,contentType:'application/json',body:JSON.stringify(mockFailure?{ok:false}:{ok:true,notification_sent:true})});
   }
   if(/google-analytics|googletagmanager|supabase\.co/.test(req.url()))return route.abort();
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>result.errors.push(`${locale}: ${e.message}`));
  const url=`${base}/score/${V3_PARENTS[locale]}/v3/`;
  const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.documentElement.dataset.v3Ready==='true');
  await page.evaluate(()=>document.fonts.ready);
  assert.deepEqual(await page.locator('[data-choice-question]').evaluateAll(a=>a.map(e=>e.dataset.choiceQuestion)),CHOICE_IDS);
  assert.equal(await page.locator('[data-choice-part]:visible').count(),16);
  assert.equal(await page.locator('[data-connect4-conclusion]').count(),1);
  assert.equal(await page.locator('[data-gap-role]').count(),0);
  assert.equal(await page.locator('[data-commercial-selection]').getAttribute('data-commercial-selection'),'not_supported');
  assert.ok(await page.locator('[data-team-fixes]').evaluate(e => e === e.parentElement.lastElementChild));
  assert.equal(await page.locator('[data-choice-sources][open]').count(),0);
  await page.locator('[data-choice-sources="offer"] summary').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-choice-sources="offer"]').getAttribute('open'),'');
  await page.keyboard.press('Enter');
  const reject=page.getByRole('button',{name:locale==='ru'?'Отказаться':'Reject analytics',exact:true});if(await reject.isVisible())await reject.click();
  for(const width of [320,375,390,430,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(async()=>{const imgs=[...document.images];imgs.forEach(i=>i.loading='eager');await new Promise(requestAnimationFrame);await Promise.allSettled(imgs.map(i=>i.decode()));});
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   const measured=await page.evaluate(()=>{
    const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    const elements=[...document.querySelectorAll('main :is(h1,h2,h3,p,a,summary,button,img,article)')].filter(visible);
    const outside=elements.filter(e=>!e.closest('.v3-table-desktop')&&(e.getBoundingClientRect().left < -1||e.getBoundingClientRect().right > innerWidth+1));
    const ordinary=elements.filter(e=>!e.closest('.v3-check500'));
    const meta=document.querySelector('.v3-research>.v3-meta'),address=document.querySelector('.v3-overview>.v3-meta:nth-of-type(2)');
    const role=e=>{const s=getComputedStyle(e);return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight];};
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:outside.map(e=>e.outerHTML.slice(0,140)),sizeDetails:ordinary.filter(e=>getComputedStyle(e).fontSize==='16px').map(e=>e.outerHTML.slice(0,180)),sizes:[...new Set(ordinary.map(e=>getComputedStyle(e).fontSize))],families:[...new Set(ordinary.map(e=>getComputedStyle(e).fontFamily))],signature:getComputedStyle(document.querySelector('.v3-signature')).fontStyle,metadata:role(meta),address:role(address),images:[...document.images].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),buttons:[...document.querySelectorAll('main button, main .cae-btn')].filter(visible).map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width}))};
   });
   assert.deepEqual(measured.overflow,[],`${locale} ${width}`);assert.ok(measured.scrollWidth<=width,`${locale} body overflow ${width}`);
   assert.ok(measured.sizes.length<=3,`Type roles ${measured.sizes}: ${JSON.stringify(measured.sizeDetails)}`);assert.ok(measured.families.length<=2,`Font roles ${measured.families}`);
   assert.equal(measured.signature,'italic');assert.deepEqual(measured.metadata,measured.address);
   assert.ok(measured.images.every(i=>i.loaded));assert.ok(measured.buttons.every(b=>b.height>=44&&b.width>=44));
   const sys=measured.images.find(i=>i.src.includes('four-surfaces'));
   assert.ok(sys.src.includes(width<=767?'portrait':'landscape'),'approved art direction');
   result.viewports.push({locale,...measured});
   if([390,1440].includes(width)){
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${locale}-${width}-top.png`)});
    for(const id of ['method-intro','choice-offer','choice-reviews','gap-map','focus-gaps'])await page.locator('#'+id).screenshot({path:path.join(out,`${locale}-${width}-${id}.png`),style:'.v3-bar { visibility: hidden; }'});
    await page.locator('[data-cae-check-placement="mid"]').screenshot({path:path.join(out,`${locale}-${width}-check.png`),style:'.v3-bar { visibility: hidden; }'});
   }
  }
  await page.setViewportSize({width:390,height:844});
  // Source observations remain usable after opening the complete research package.
  await page.evaluate(()=>document.querySelectorAll('#gap-map details, #consistency-matrix details, #source-observations details, #source-observations').forEach(e=>e.open=true));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'expanded source observations overflow');
  assert.equal(await page.locator('[data-source-observation]').count(),loadV3Package().registry.observations.length);
  if(locale==='ru')assert.deepEqual(await page.evaluate(()=>{
   const bad=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){const n=walker.currentNode;if(/соответстви[еяюий]|соответствием/iu.test(n.textContent)&&!n.parentElement.closest('script,style')&&getComputedStyle(n.parentElement).fontStyle!=='italic')bad.push(n.textContent);}
   return bad;
  }),[],'all Russian keyword inflections use italic');
  await page.locator('#query-K01 a[href^="#observation-"]').first().click();
  await page.waitForFunction(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.open);
  await page.locator('#source-observations').screenshot({path:path.join(out,`${locale}-390-source-observations.png`),style:'.v3-bar { visibility: hidden; }'});
  await page.evaluate(()=>document.querySelectorAll('#gap-map details, #consistency-matrix details, #source-observations details, #source-observations').forEach(e=>e.open=false));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  result.actions.push({locale,kind:'source-provenance-and-keyword',status:'PASS'});
  // Hash navigation opens nested disclosures and leaves target below the sticky bar.
  await page.locator('#choice-practitioner .v3-choice-provenance a').first().click();
  assert.equal(await page.locator('#evidence-register').getAttribute('open'),'');
  await page.waitForFunction(()=>document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top>=document.querySelector('.v3-bar').offsetHeight,{},{timeout:5000});
  await page.evaluate(()=>{location.hash='query-K10';});await page.waitForFunction(()=>document.querySelector('#remaining-queries').open&&document.querySelector('#query-K10').open);
  await page.evaluate(()=>{document.querySelectorAll('.v3-query-list details').forEach(e=>e.open=true);});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Every semantic section, including tall content and the final document edge.
  for(const id of V3_SECTION_IDS){
   await page.evaluate(id=>{const el=document.getElementById(id);scrollTo(0,el.getBoundingClientRect().top+scrollY-document.querySelector('.v3-bar').offsetHeight-24);},id);
   await page.waitForFunction(id=>document.querySelector('#report-navigation a[aria-current="location"]')?.getAttribute('href')==='#'+id,id,{timeout:5000});
  }
  // Native keyboard disclosures and focus restoration in all three request intents.
  for(const [selector,kind] of [['[data-cae-sprint-inquiry]','sprint'],['[data-cae-check-inquiry]','check'],['[data-cae-question]','question']]){
   const trigger=page.locator(selector).first();await trigger.click();
   const dialog=page.locator('dialog[open]');await dialog.waitFor({state:'visible',timeout:5000});assert.equal(await dialog.count(),1);
   assert.deepEqual(await dialog.locator('input').evaluateAll(a=>a.map(e=>e.name).sort()),['email','name']);
   const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844,'dialog fits');
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden',timeout:5000});
   await page.waitForFunction(selector=>document.querySelector(selector)===document.activeElement,selector,{timeout:5000});result.actions.push({locale,kind,status:'PASS'});
  }
  // Failure, retained input, retry, success and duplicate prevention without real leads.
  await page.locator('[data-cae-question]').click();const dialog=page.locator('dialog[open]');
  await dialog.locator('[name="name"]').fill('QA Synthetic');await dialog.locator('[name="email"]').fill('qa@example.invalid');
  mockFailure=true;await dialog.locator('button[type="submit"]').click();await page.waitForTimeout(300);
  assert.equal(await dialog.locator('[name="email"]').inputValue(),'qa@example.invalid');assert.ok(await dialog.locator('button[type="submit"]').isEnabled());
  mockFailure=false;await dialog.locator('button[type="submit"]').click();await page.waitForTimeout(300);assert.ok(await dialog.locator('button[type="submit"]').isDisabled());await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden',timeout:5000});
  result.actions.push({locale,kind:'mocked-error-retry-success',status:'PASS',mocked_requests:posts.length});
  await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__v3Shared=data;}});Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});});
  await page.locator('[data-v3-share="end"]').click();assert.ok(await page.evaluate(()=>window.__v3Shared.url.endsWith('/v3/')&&!window.__v3Shared.url.includes('#')));
  const accessibility=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(accessibility.violations.map(v=>({id:v.id,nodes:v.nodes.length})),[]);result.actions.push({locale,kind:'axe-main',status:'PASS'});
  await context.close();
  if(!production){const noJS=await browser.newContext({javaScriptEnabled:false});const plain=await noJS.newPage();await plain.goto(url);assert.equal(await plain.locator('[data-cockpit-order]').count(),9);assert.equal(await plain.locator('picture').count(),4);assert.equal(await plain.locator('[data-choice-part]:visible').count(),16);assert.equal(await plain.locator('[data-connect4-conclusion]').count(),1);await noJS.close();}
 }
 assert.deepEqual(result.errors,[]);result.status='PASS';
}catch(error){
 result.status='FAIL';result.failure=error.stack;process.exitCode=1;
 const failedPage=browser.contexts().flatMap(c=>c.pages()).at(-1);
 if(failedPage)try{
  result.failed_navigation=await failedPage.evaluate(()=>{const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));return {hash:location.hash,targetTop:t?.getBoundingClientRect().top,barHeight:document.querySelector('.v3-bar')?.offsetHeight,scrollY,scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  await failedPage.screenshot({path:path.join(out,'failure.png')});
 }catch{}
}
finally{fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');await browser.close();await new Promise(r=>server.close(r));}
console.log(JSON.stringify({status:result.status,engine,viewports:result.viewports.length,actions:result.actions.length,out,failure:result.failure||null}));
