import test from 'node:test';
import assert from 'node:assert/strict';
import {serveAmy} from '../../infra/cloudflare/router/src/amy-host.ts';
test('Amy host confines asset access and keeps foreign product routes private',async()=>{
 const requests=[];const assets={fetch:async r=>{requests.push(r.url);return new Response('Amy',{status:200});}};
 assert.equal((await serveAmy(new Request('https://amy.caesthetic.com/'),assets)).headers.get('Location'),'/fr/');
 for(const p of ['/fr/','/fr/tarifs/','/fr/avis/','/en/','/en/prices/','/en/reviews/','/assets/site.js','/release.json']){
  const response=await serveAmy(new Request('https://amy.caesthetic.com'+p),assets);assert.equal(response.status,200);assert.equal(new URL(requests.at(-1)).pathname,'/amy'+p);assert.equal(response.headers.get('X-Amy-Site'),'acl-amy-lannion');
 }
 const count=requests.length;
 for(const p of ['/score/private/','/api/','/private/','/assets/../../score/','/internal/','/other/'])assert.equal((await serveAmy(new Request('https://amy.caesthetic.com'+p),assets)).status,404);
 assert.equal(requests.length,count);
 assert.equal((await serveAmy(new Request('https://amy.caesthetic.com/fr/avis/',{method:'POST'}),assets)).status,405);
});
test('asset redirects cannot leak the backing /amy path',async()=>{
 const response=await serveAmy(new Request('https://amy.caesthetic.com/fr/'),{fetch:async()=>new Response(null,{status:308,headers:{Location:'/amy/en/'}})});
 assert.equal(response.headers.get('Location'),'https://amy.caesthetic.com/en/');
});
test('guide fails closed and protects content with signed expiring cookies',async()=>{
 const assets={fetch:async()=>{throw Error('Guide must never use public assets');}};
 const url='https://amy.caesthetic.com/guide/';const secret='test-only-session-key';
 assert.equal((await serveAmy(new Request(url),assets)).status,503);
 const login=await serveAmy(new Request(url),assets,secret);assert.doesNotMatch(await login.text(),/amybernis@/);assert.equal(login.headers.get('Cache-Control'),'no-store');
 const post=(password,origin='https://amy.caesthetic.com')=>new Request(url,{method:'POST',headers:{Origin:origin},body:new URLSearchParams({password})});
 assert.equal((await serveAmy(post('2927','https://evil.example'),assets,secret)).status,403);
 assert.equal((await serveAmy(post('wrong'),assets,secret)).status,401);
 assert.equal((await serveAmy(post('x'.repeat(2048)),assets,secret)).status,413);
 const success=await serveAmy(post('2927'),assets,secret);assert.equal(success.status,303);
 const setCookie=success.headers.get('Set-Cookie');assert.match(setCookie,/HttpOnly; Secure; SameSite=Strict/);
 const cookie=setCookie.split(';')[0];
 const guide=await serveAmy(new Request(url,{headers:{Cookie:cookie}}),assets,secret);assert.match(await guide.text(),/Continue with Google/);
 const tampered=await serveAmy(new Request(url,{headers:{Cookie:cookie+'0'}}),assets,secret);assert.doesNotMatch(await tampered.text(),/amybernis@/);
 const rotated=await serveAmy(new Request(url,{headers:{Cookie:cookie}}),assets,'new-key');assert.doesNotMatch(await rotated.text(),/amybernis@/);
 const logout=await serveAmy(new Request(url+'logout',{method:'POST',headers:{Origin:new URL(url).origin}}),assets,secret);assert.match(logout.headers.get('Set-Cookie'),/Max-Age=0/);
});
test('private demo exposes form for 1–3 and clearly labelled example for 4–5 only after login',async()=>{
 const assets={fetch:async()=>new Response('asset')};const secret='test-demo';const base='https://amy.caesthetic.com';
 const auth=await serveAmy(new Request(base+'/guide/',{method:'POST',headers:{Origin:base},body:'password=2927'}),assets,secret);
 const cookie=auth.headers.get('Set-Cookie').split(';')[0];
 for(let rating=1;rating<=5;rating++){
  const url=base+'/guide/demo/?rating='+rating;
  const anonymous=await serveAmy(new Request(url),assets,secret);assert.doesNotMatch(await anonymous.text(),/maps.app.goo.gl|demo-feedback/);
  const response=await serveAmy(new Request(url,{headers:{Cookie:cookie}}),assets,secret);const html=await response.text();assert.match(html,/Présentation uniquement/);
  if(rating<=3){assert.match(html,/id="demo-feedback"/);assert.match(html,/amy-feedback-portrait.jpg/);assert.doesNotMatch(html,/maps.app.goo.gl/);}
  else{assert.match(html,/maps.app.goo.gl\/XmWJ4xw78mhmk2M47/);assert.match(html,/ne pas publier d’avis/);assert.doesNotMatch(html,/id="demo-feedback"/);}
 }
 const blocked=await serveAmy(new Request(base+'/guide/demo/',{method:'POST',headers:{Origin:base,Cookie:cookie},body:'message=test'}),assets,secret);assert.equal(blocked.status,405);
});
