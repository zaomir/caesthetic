import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const require=createRequire(path.join(root,'infra/cloudflare/package.json'));
const {build}=require('esbuild');

test('partnership routes reach assets while unrelated legacy routes still redirect',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'partnership-router-'));
 try{
  const outfile=path.join(dir,'router.mjs');
  await build({entryPoints:[path.join(root,'infra/cloudflare/router/src/index.ts')],outfile,bundle:true,platform:'neutral',format:'esm',plugins:[{
   name:'unrelated-service-boundaries',setup(b){
    b.onResolve({filter:/^\.\/(cprp|amy-host|amy-calcom|amy-cal-queue)$/},a=>({path:a.path,namespace:'unrelated'}));
    b.onLoad({filter:/.*/,namespace:'unrelated'},()=>({contents:'export async function serveCPRP(){return null} export class CaestheticPartnerRegistry{} export async function serveAmy(){return null} export async function serveAmyCal(){return null} export class AmyCalQueue{}',loader:'js'}));
   }
  }]});
  const {default:worker}=await import(pathToFileURL(outfile));
  const requests=[];
  const env={BRAND:'caesthetic',PREVIEW_MODE:'false',SPA_FALLBACK:'false',ASSETS:{fetch:async request=>{requests.push(new URL(request.url).pathname);return new Response('partnership asset',{headers:{'Content-Type':'text/html'}});}}};
  for(const route of ['/partnerships/','/ru/partnerships/']){
   const response=await worker.fetch(new Request('https://caesthetic.com'+route),env);
   assert.equal(response.status,200);assert.equal(await response.text(),'partnership asset');assert.equal(response.headers.get('location'),null);assert.equal(requests.at(-1),route);
  }
  const retired=await worker.fetch(new Request('https://caesthetic.com/provider-partnership/'),env);
  assert.equal(retired.status,301);assert.equal(retired.headers.get('location'),'https://caesthetic.com/about/');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
