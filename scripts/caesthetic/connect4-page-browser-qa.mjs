import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,IMAGES,hash} from './build-connect4-page.mjs';
const {chromium}=createRequire('/tmp/connect4-qa/package.json')('playwright');
const out=path.join(ROOT,'artifacts/connect4'); fs.mkdirSync(out,{recursive:true});
const results={status:'RUNNING',mode:process.env.C4_BASE?'production':'local',source_sha:process.env.C4_EXPECTED_SHA||null,deployed_sha:process.env.C4_BASE?(process.env.C4_EXPECTED_SHA||null):null,checked_at:new Date().toISOString(),widths:[],asset_hashes:[],form:{},owner_image_count:IMAGES.length,remaining_image_pairs:['engagement-path-owner-image']};
let server; let browser;
try {
 let base=process.env.C4_BASE;
 if(!base){server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'); let filename=path.resolve(ROOT,'site-caesthetic','.'+decodeURIComponent(url.pathname));
  if(!filename.startsWith(path.join(ROOT,'site-caesthetic')+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
  if(!fs.existsSync(filename)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'}[path.extname(filename)]||'application/octet-stream'));
  res.end(fs.readFileSync(filename));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
 results.url=base+'/connect4/';
 if(process.env.C4_BASE){
  assert.equal(base,'https://caesthetic.com','Production target is fixed');
  assert.match(results.deployed_sha||'',/^[a-f0-9]{40}$/);
  for(const file of ['connect4/index.html','assets/css/connect4.css',...IMAGES.map(i=>i.src.slice(1))]){
   const route=file==='connect4/index.html'?'connect4/':file;
   const response=await fetch(base+'/'+route+'?connect4_verify='+results.deployed_sha,{signal:AbortSignal.timeout(30000)});
   assert.equal(response.status,200,route);
   const actual=hash(Buffer.from(await response.arrayBuffer()));
   assert.equal(actual,hash(fs.readFileSync(path.join(ROOT,'site-caesthetic',file))),`Production bytes differ: ${file}`);
   results.asset_hashes.push({path:route,sha256:actual});
  }
 }
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'});
 const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 let requests=[]; let responseMode='success';
 const intercept=async route=>{
  const req=route.request();
  if(req.method()!=='POST')return route.continue();
  let body;try{body=req.postDataJSON();}catch{body=null;}
  if(body?.action==='caesthetic_public_request'){
   requests.push(body);
   return route.fulfill({status:responseMode==='error'?503:200,contentType:'application/json',body:JSON.stringify(responseMode==='error'?{ok:false}:{ok:true,notification_sent:true})});
  }
  return route.fulfill({status:204,body:''});
 };
 await page.route('**/*',intercept);
 await page.goto(results.url,{waitUntil:'networkidle'});
 const reject=page.getByRole('button',{name:'Reject analytics',exact:true});
 if(await reject.isVisible())await reject.click();
 for(const width of [320,360,390,430,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  const selected=[];
  for(const role of ['system','journey','stop']){
   const image=page.locator(`picture[data-connect4-picture="${role}"] img`);
   const expected=IMAGES.find(i=>i.role===role&&i.format===(width<=767?'mobile':'desktop'));
   await image.scrollIntoViewIfNeeded();
   await page.waitForFunction(({role,src})=>{const el=document.querySelector(`picture[data-connect4-picture="${role}"] img`);return el&&el.currentSrc.endsWith(src)&&el.complete&&el.naturalWidth>0;},{role,src:expected.src});
   await image.evaluate(el=>el.decode());
   const actual=await image.evaluate(el=>({src:el.currentSrc,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
   assert.ok(actual.src.endsWith(expected.src),`Wrong ${role} source at ${width}`);
   assert.ok(Math.abs(actual.width/actual.height-expected.width/expected.height)<0.015,`Distorted ${role} at ${width}`);
   selected.push({role,src:expected.src});
  }
  const problems=await page.locator('main').evaluate((main,w)=>[...main.querySelectorAll('h1,h2,h3,p,summary,button,picture')].filter(el=>{
   const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
   return r.width>0&&r.height>0&&s.display!=='none'&&(r.left< -1||r.right>w+1);
  }).map(el=>el.outerHTML.slice(0,160)),width);
  assert.deepEqual(problems,[],`Overflow at ${width}`);
  assert.equal(await page.locator('main [data-surface]').count(),4);
  await page.evaluate(()=>window.scrollTo(0,0));
  if([390,1440].includes(width))await page.screenshot({path:path.join(out,`connect4-${width}.png`),fullPage:true});
  results.widths.push({width,status:'PASS',images:selected});
 }
 await page.locator('.c4-alternate-view summary').click();
 const alternate=page.locator('picture[data-connect4-picture="alternate"] img');
 await alternate.scrollIntoViewIfNeeded();await alternate.evaluate(el=>el.decode());
 assert.ok((await alternate.evaluate(el=>el.currentSrc)).endsWith('connect4-patient-journey-recolored.png'));
 await page.locator('.c4-alternate-view summary').click();
 assert.equal(await page.locator('[data-engagement-step]').count(),5);
 for(const id of ['check','extension','system'])assert.equal(await page.locator(`[data-engagement-step="${id}"]`).getAttribute('data-optional'),'true');
 assert.ok((await page.locator('#working-together').innerText()).includes('12-month agreement'));
 assert.equal(await page.locator('[data-c4-engagement-media-slot] img').count(),0);
 results.engagement={five_stages:true,conditional_check:true,optional_extensions_after_day30:true,optional_annual_agreement:true,future_image_not_faked:true};
 await page.setViewportSize({width:390,height:844});
 const modal=page.locator('dialog.cae-request-modal');
 for(const id of ['connect4-start','connect4-final']){
  await page.locator('#'+id).click(); await modal.waitFor({state:'visible'});
  assert.equal(await modal.locator('input').count(),2);
  assert.deepEqual(await modal.locator('input').evaluateAll(nodes=>nodes.map(el=>el.name)),['name','email']);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),id);
 }
 await page.locator('#connect4-start').click();
 await modal.locator('button[type=submit]').click(); assert.equal(requests.length,0,'Required validation should block empty submission');
 await modal.locator('[name=name]').fill('CAESTHETIC Connect4 QA');
 await modal.locator('[name=email]').fill('connect4-qa@example.com');
 responseMode='error';await modal.locator('button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('.cae-request-modal__status').textContent.includes('could not'));
 assert.equal(await modal.locator('button[type=submit]').isEnabled(),true);
 responseMode='success';await modal.locator('button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('.cae-request-modal__status').textContent.includes('Request sent'));
 assert.equal(requests.at(-1).intent,'free_growth_score');assert.ok(requests.at(-1).page_url.includes('/connect4/'));
 results.form={two_fields:true,required_validation:true,error_and_retry:true,success:true,focus_return:true,source_and_intent:true,backend:'mocked'};
 await page.keyboard.press('Escape');
 await page.locator('#questions summary').first().click();assert.equal(await page.locator('#questions details').first().getAttribute('open'),'');
 await page.addStyleTag({content:'html { font-size: 200% !important; }'});
 const overflow=await page.locator('main').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false,'Text zoom overflow');
 results.text_zoom_200_percent='PASS';
 if(process.env.C4_SUBMIT==='true'){
  assert.ok(process.env.C4_BASE,'Live submission only in explicit production mode');
  await page.unroute('**/*',intercept);await page.reload({waitUntil:'networkidle'});
  await page.locator('#connect4-start').click();
  await modal.locator('[name=name]').fill('CAESTHETIC QA — Connect4 smoke; not a customer');
  await modal.locator('[name=email]').fill('connect4-qa@example.com');
  const pending=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postData()?.includes('caesthetic_public_request'));
  await modal.locator('button[type=submit]').click();const response=await pending;const payload=await response.json();
  assert.equal(response.ok(),true);assert.equal(payload.ok,true);assert.equal(payload.notification_sent,true);
  results.form.backend='production';results.form.notification_sent=true;
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const p=await nojs.newPage();await p.goto(results.url);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('main [data-surface]').count(),4);await nojs.close();
 results.static_content_without_javascript='PASS';
 assert.deepEqual(errors,[],'Browser errors');results.javascript_errors=errors;results.status='PASS';
} catch(error){results.status='FAIL';results.error=error.stack;process.exitCode=1;}
finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));}
