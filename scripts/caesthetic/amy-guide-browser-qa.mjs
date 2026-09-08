import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveAmy} from '../../infra/cloudflare/router/src/amy-host.ts';
let base=process.env.AMY_BASE;let server;
if(!base){
 const root=fileURLToPath(new URL('../../site-caesthetic/',import.meta.url));
 const assets={fetch:async request=>{let p=new URL(request.url).pathname;if(p.endsWith('/'))p+='index.html';try{return new Response(await readFile(path.join(root,p)),{headers:{'Content-Type':p.endsWith('.jpg')?'image/jpeg':'text/html'}});}catch{return new Response('Not found',{status:404});}}};
 server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const request=new Request(base+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const response=await serveAmy(request,assets,'browser-test-key');res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Local test error');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://localhost:'+server.address().port;
}
const output=process.env.AMY_QA_OUTPUT||'/tmp/amy-guide-qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
try{
 await page.goto(base+'/guide/demo/?rating=5');
 assert.equal(await page.getByRole('link',{name:/Bebo/}).count(),0);
 await page.locator('input[name=password]').fill('2927');
 await Promise.all([page.waitForURL(base+'/guide/'),page.getByRole('button',{name:'Ouvrir le guide'}).click()]);
 await page.getByRole('heading',{name:'Bienvenue, Amy'}).waitFor();
 assert.match(await page.locator('body').innerText(),/Continue with Google/);
 const posts=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
 for(let rating=1;rating<=5;rating++){
  await page.goto(base+'/guide/demo/');
  await page.getByRole('button',{name:rating+' étoile'+(rating>1?'s':'') ,exact:true}).click();
  if(rating<=3){
   await page.locator('textarea').fill('Exemple fictif pour vérifier la démonstration.');
   await page.getByRole('button',{name:'Tester le formulaire sans envoi'}).click();
   assert.match(await page.locator('[role=status]').innerText(),/Aucun message n’a été envoyé/);
   assert.equal(await page.locator('a[href*="maps.app"]').count(),0);
   assert.ok(await page.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0));
  }else{
   assert.equal(await page.locator('a[href*="maps.app"]').getAttribute('href'),'https://maps.app.goo.gl/XmWJ4xw78mhmk2M47');
   assert.equal(await page.locator('textarea').count(),0);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:output+'/demo-'+rating+'.png'});
 }
 assert.deepEqual(posts,[]);
 await page.goto(base+'/guide/');await page.getByRole('button',{name:'Se déconnecter'}).click();
 await page.locator('input[name=password]').waitFor();
 const result={status:'PASS',base,ratings:5,formPosts:0,protected:true,logout:true};
 await writeFile(output+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
