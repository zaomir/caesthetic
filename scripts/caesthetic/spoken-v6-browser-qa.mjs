import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'../..');
const output=process.env.CAE_V6_QA_OUT||'/tmp/spoken-v6-qa';fs.mkdirSync(output,{recursive:true});
const production=!!process.env.CAE_V6_QA_BASE;
const server=http.createServer((req,res)=>{try{let p=path.resolve(root,'site-caesthetic','.'+new URL(req.url,'http://local').pathname);assert.ok(p.startsWith(path.join(root,'site-caesthetic')+path.sep));if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.json':'application/json'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
if(!production)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.CAE_V6_QA_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
const result={status:'RUNNING',base,expected_sha:process.env.CAE_EXPECTED_SHA||null,checked_at:new Date().toISOString(),byte_checks:[],checks:[]};
try {
  const routes=['/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v6/',...(!production?['/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v6/']:[])];
  if(production)for(const rel of [routes[0]+'index.html',routes[0]+'presentation.json','/assets/css/growth-score-v6.css','/assets/js/growth-score-v6.js','/assets/brand/report-v6-logo.png']){
    const response=await fetch(base+rel);assert.equal(response.status,200);const actual=Buffer.from(await response.arrayBuffer()),expected=fs.readFileSync(path.join(root,'site-caesthetic',rel));assert.equal(createHash('sha256').update(actual).digest('hex'),createHash('sha256').update(expected).digest('hex'));result.byte_checks.push(rel);
  }
  for(const route of routes)for(const width of [320,390,1440]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+route,{waitUntil:'load'});
    await page.waitForFunction(()=>document.querySelectorAll('.v6-question').length===4);
    assert.equal(await page.locator('.v6-question[open]').count(),0);
    assert.doesNotMatch(await page.locator('body').innerText(),/Дизайн-референс|Design reference|Мы не обещаем|source-export:/);
    if(route.includes('-rus')){assert.match(await page.locator('#proposal').innerText(),/Привести маркетинг в порядок/);assert.match(await page.locator('#four-questions > .v6-wrap > p').innerText(),/Что пациенту важно понять до записи/);assert.match(await page.locator('.v6-limits').innerText(),/После оформления заказа/);}
    await page.locator('.v6-question summary').first().click();assert.equal(await page.locator('.v6-question[open]').count(),1);
    await page.locator('.v6-question summary').first().click();
    await page.locator('[data-v6-offer]').click();await page.waitForFunction(()=>location.hash==='#next-step');
    const sprint=page.locator('[data-v6-sprint]');assert.equal(await sprint.getAttribute('href'),'https://caesthetic.com/sprint/?offer=spoken-four-surface-sprint-v1');
    assert.equal(await page.locator('[data-check500-placement] a').count(),2);
    for(const a of await page.locator('[data-check500-placement] a').all())assert.equal(await a.getAttribute('href'),'https://caesthetic.com/lead-to-revenue-check/');
    await sprint.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-v6-sticky]').hidden);
    await page.locator('#plan').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('[data-v6-sticky]').hidden);
    await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{}});});
    await page.locator('[data-v6-share]').first().click();await page.waitForFunction(()=>document.querySelector('[data-v6-share-status]').textContent.length>0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);assert.deepEqual(errors,[]);
    result.checks.push({route,width,disclosures:'pass',offer_anchor:'pass',product_links:'pass',sticky:'pass',share:'pass',no_overflow:'pass'});await context.close();
  }
  result.status='PASS';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;}
finally{await browser.close();server.close();fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
