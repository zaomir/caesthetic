#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const execFileAsync=promisify(execFile);
const assetCache=new Map();
async function publicAsset(url){if(!assetCache.has(url))assetCache.set(url,execFileAsync('curl',['-fsSL','--max-time','20',url],{encoding:'buffer',maxBuffer:8*1024*1024}).then(r=>r.stdout));return assetCache.get(url);}
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=process.env.CPP_QA_OUT||'/tmp/caesthetic-partnerships-qa';fs.mkdirSync(out,{recursive:true});
const live=process.env.CPP_QA_LIVE==='1', results=[];
const servers=[];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
async function serve(folder,origin){
 const server=http.createServer(async(req,res)=>{
  try{
   const pathname=new URL(req.url,'http://localhost').pathname;
   const file=path.resolve(root,folder,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
   if(!file.startsWith(path.join(root,folder)+path.sep)){res.writeHead(403);res.end();return;}
   if(fs.existsSync(file)){res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));return;}
   // Optional partial-checkout asset fallback; CI uses checked-in assets.
   if(process.env.CPP_QA_ASSET_FALLBACK==='1' && /^\/(assets|templates)\//.test(pathname)){
    const bytes=await publicAsset(origin+pathname);res.setHeader('Content-Type',mime[path.extname(pathname)]||'application/octet-stream');res.end(bytes);return;
   }
   res.writeHead(404);res.end();
  }catch{res.writeHead(502);res.end();}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));servers.push(server);return `http://127.0.0.1:${server.address().port}`;
}
const cae=live?'https://caesthetic.com':await serve('site-caesthetic','https://caesthetic.com');
const raim=live?'https://raimsmile.com':await serve('site-raimovdental/raim-smile','https://raimsmile.com');
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.CPP_CHROMIUM_PATH?{executablePath:process.env.CPP_CHROMIUM_PATH,args:['--no-sandbox']}: {})});
 for(const [site,route,locale] of [[cae,'/ru/partnerships/','ru'],[cae,'/partnerships/','en'],[raim,'/partners/','ru']]){
  for(const width of [320,390,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   if(process.env.CPP_QA_ASSET_FALLBACK==='1')await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,async r=>{try{const body=await publicAsset(r.request().url());await r.fulfill({body,contentType:r.request().url().includes('googleapis')?'text/css':'font/woff2'});}catch{await r.abort();}});
   await page.route(/google-analytics|googletagmanager|facebook\.net/,r=>r.abort());
   const response=await page.goto(site+route,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>[...document.images].filter(i=>i.loading!=='lazy').every(i=>i.complete));
   const decline=page.getByRole('button',{name:/^(Отклонить|Отказаться|Decline|Reject)$/});if(await decline.count())await decline.click();
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.locator('html').getAttribute('lang'),locale);
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.getBoundingClientRect().width&&i.complete&&!i.naturalWidth).map(i=>i.src)}));
   assert.equal(layout.overflow,false,`${route} overflow at ${width}`);assert.deepEqual(layout.broken,[]);assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(out,`${route.replaceAll('/','-')}-${width}.png`),fullPage:true});
   await page.screenshot({path:path.join(out,`${route.replaceAll('/','-')}-${width}-hero.png`)});
   results.push({route,locale,width,status:'pass',http:response.status(),layout});await page.close();
  }
 }
 for(const locale of ['ru','en']){
  const route=locale==='ru'?'/ru/partnerships/':'/partnerships/';
  const page=await browser.newPage();let calls=0,payload;
  // Deterministic delivery-state tests never send synthetic notifications to staff.
  let mode='failed';
  await page.route('**/functions/v1/submit-caesthetic-growth-score',async r=>{calls++;payload=r.request().postDataJSON();await r.fulfill({status:mode==='limited'?429:200,contentType:'application/json',body:JSON.stringify({ok:true,notification_sent:mode==='success'})});});
  await page.goto(cae+route+'?program=expert-dental-kg&email=must-not-leak@example.invalid#request');
  assert.equal(await page.locator('[data-partnership-context]').isVisible(),true);
  assert.match(await page.locator('[data-partnership-locale]').first().getAttribute('href'),/program=expert-dental-kg/);
  const form=page.locator('[data-partnership-form]');
  await form.locator('button').click();assert.equal(calls,0);
  await form.locator('[name="name"]').fill('Partnership QA');await form.locator('[name="email"]').fill('qa@example.invalid');await form.locator('[name="goal"]').selectOption('event');
  for(const state of ['failed','limited','success']){
   mode=state;await form.locator('button').click();await page.waitForFunction(()=>!document.querySelector('[data-partnership-form]').hasAttribute('aria-busy'));
   assert.equal(await form.locator('[data-partnership-status]').getAttribute('data-error'),state==='success'?'false':'true');
   assert.equal(await form.locator('button').isDisabled(),state==='success');
  }
  assert.equal(payload.intent,`partnership:expert-dental-kg:event:${locale}`);
  assert.equal(payload.page_url,`https://caesthetic.com${route}?program=expert-dental-kg`);
  assert.equal(calls,3);results.push({route,locale,form:'pass',checks:['required-fields','notification-failure','rate-limit','retry','success','duplicate-prevention','context','no-query-PII'],delivery:'mocked; no staff notification sent'});await page.close();
 }
 const page=await browser.newPage();await page.goto(raim+'/partners/');
 assert.equal(await page.locator('a[href="https://caesthetic.com/ru/partnerships/?program=expert-dental-kg#request"]').count(),1);
 assert.equal(await page.locator('form.handoff-form').count(),0);
 results.push({route:'/partners/',handoff:'pass',destination:'CAESTHETIC; Expert context retained'});await page.close();
}finally{await browser?.close();for(const server of servers)server.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({mode:live?'production':'local',checkedAt:new Date().toISOString(),results},null,2)+'\n');}
console.log(JSON.stringify({status:'pass',checks:results.length,out}));
