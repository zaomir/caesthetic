import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const require=createRequire(new URL('../../infra/cloudflare/package.json',import.meta.url));
const {buildSync}=require('esbuild');

test('Twenty reconciliation pages beyond 16 programs within the request budget and preserves failed outbox work',async()=>{
  const dir=mkdtempSync(path.join(tmpdir(),'cprp-twenty-'));
  const originalFetch=globalThis.fetch;
  const db=new DatabaseSync(':memory:');
  try {
    const outfile=path.join(dir,'registry.cjs');
    buildSync({stdin:{contents:"export {CaestheticPartnerRegistry} from './infra/cloudflare/router/src/cprp'; export {schema} from './infra/cloudflare/router/src/cprp-schema';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile,logLevel:'silent'});
    const {CaestheticPartnerRegistry,schema}=require(outfile);db.exec(schema);
    const registry=Object.create(CaestheticPartnerRegistry.prototype);
    registry.state={storage:{transactionSync(fn){db.exec('BEGIN');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}}};
    registry.env={TWENTY_API_KEY:'synthetic-test-key',CPRP_IDENTITY_KEY:'synthetic',CPRP_ORIGIN:'https://caesthetic.com'};
    registry.sql={exec(query,...args){return db.prepare(query).all(...args);}};
    for(let i=0;i<26;i++){
      const id='program-'+String(i).padStart(2,'0');
      db.prepare("INSERT INTO programs(id,slug,client_id,partner_id,market,name,client_name,partner_name,product,currency,membership_bps,treatment_bps,created_at) VALUES(?,?,'client','partner','KG',?,'Client','Partner','QA','KGS',3000,1000,?)").run(id,id,id,i);
      db.prepare("INSERT INTO outbox(program_id,kind,entity_ref,created_at) VALUES(?,'test',?,?)").run(id,id,i);
    }
    const records=new Map();let calls=0,failId=null;
    globalThis.fetch=async(url,init={})=>{
      assert.ok(++calls<=50,'Worker subrequest budget exceeded');
      const parsed=new URL(url);assert.equal(parsed.origin,'https://controlcenter.me');
      if(init.method==='GET'){
        const id=parsed.searchParams.get('filter').split(':')[1];
        if(id===failId)return new Response('{}',{status:503});
        return Response.json({data:{cprpPrograms:records.has(id)?[records.get(id)]:[]}});
      }
      const row=JSON.parse(init.body);records.set(row.externalId,{id:row.externalId,...row});return Response.json({ok:true});
    };
    let after='',seen=[];
    do {
      calls=0;const result=await registry.syncTwenty(false,'',after);
      assert.ok(result.results.length<=10);assert.ok(result.results.every(r=>r.ok));
      assert.ok(calls<=30);seen.push(...result.results.map(r=>r.program_id));after=result.next_cursor;
    } while(after);
    assert.equal(new Set(seen).size,26);assert.equal(seen.length,26);assert.equal(records.size,26);
    calls=0;const selected=await registry.syncTwenty(false,'program-25');
    assert.deepEqual(selected.results,[{program_id:'program-25',ok:true}]);assert.equal(calls,3);
    db.prepare("INSERT INTO outbox(program_id,kind,entity_ref,created_at) VALUES('program-25','retry','test',100)").run();
    calls=0;failId='program-25';const failed=await registry.syncTwenty();
    assert.equal(failed.results[0].ok,false);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM outbox WHERE delivered_at IS NULL').get().n,1);
    calls=0;failId=null;assert.equal((await registry.syncTwenty()).results[0].ok,true);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM outbox WHERE delivered_at IS NULL').get().n,0);
    const request=id=>new Request('https://caesthetic.com/api/cprp/staff/twenty',{method:'POST',headers:{Origin:'https://caesthetic.com','Content-Type':'application/json'},body:JSON.stringify({action:'sync',program_id:id})});
    registry.actor=async()=>({id:'ops',role:'ops',scopes:'["program-25"]',disabled:0});
    calls=0;assert.equal((await registry.fetch(request('program-00'))).status,403);assert.equal(calls,0);
    assert.equal((await registry.fetch(request(undefined))).status,403);
    assert.equal((await registry.fetch(request('program-25'))).status,200);assert.equal(calls,3);
    registry.actor=async()=>({id:'hr',role:'hr',scopes:'["program-25"]',disabled:0});
    calls=0;assert.equal((await registry.fetch(request('program-25'))).status,403);assert.equal(calls,0);
  } finally {globalThis.fetch=originalFetch;db.close();rmSync(dir,{recursive:true,force:true});}
});
