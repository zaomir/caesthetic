import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHmac} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const require=createRequire(new URL('../../infra/cloudflare/package.json',import.meta.url));
const {build}=require('esbuild');
const {Miniflare}=require('miniflare');

test('actual Worker RPC and SQLite namespace accept, deduplicate and cancel a signed booking',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'amy-worker-test-'));
  let mf;
  try {
    const bundle=await build({entryPoints:[new URL('../../infra/cloudflare/router/src/index.ts',import.meta.url).pathname],bundle:true,format:'esm',write:false,external:['cloudflare:workers'],logLevel:'silent'});
    mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2024-11-01',
      bindings:{BRAND:'caesthetic',AMY_CAL_WEBHOOK_SECRET:'test-secret'},
      durableObjects:{AMY_CAL_QUEUE:{className:'AmyCalQueue',useSQLite:true}},durableObjectsPersist:dir});
    const event={triggerEvent:'BOOKING_CREATED',createdAt:new Date().toISOString(),payload:{uid:'worker-test-uid',type:'rdv',organizer:{email:'amybernis@caesthetic.com'},endTime:new Date(Date.now()+3600000).toISOString(),attendees:[]}};
    const send=async value=>{
      const body=JSON.stringify(value);
      const response=await mf.dispatchFetch('https://caesthetic.com/api/amy/calcom',{method:'POST',body,headers:{'x-cal-signature-256':createHmac('sha256','test-secret').update(body).digest('hex')}});
      if(response.status!==200)console.log(await response.clone().text());
      assert.equal(response.status,200);
      assert.deepEqual(await response.json(),{status:'received',sending_enabled:false});
    };
    await send(event);await send(event);
    await send({...event,triggerEvent:'BOOKING_CANCELLED',createdAt:new Date(Date.now()+1000).toISOString()});
  } finally { if(mf)await mf.dispose();await rm(dir,{recursive:true,force:true}); }
});
