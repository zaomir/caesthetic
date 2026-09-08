import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {serveAmyCal,normalizeEvent,phoneE164,purgeAmyCal} from '../../infra/cloudflare/router/src/amy-calcom.ts';

const secret='test-only-not-a-production-secret';
const now=Date.now();
const payload=(event='BOOKING_CREATED',uid='test-booking',at=now)=>({triggerEvent:event,createdAt:new Date(at).toISOString(),payload:{
  uid,type:'rdv',organizer:{email:'amybernis@caesthetic.com'},endTime:new Date(now+3600000).toISOString(),
  attendees:[{name:'Test Person',phoneNumber:'+33600000000'}],responses:{'whatsapp-review-consent':{value:true}},
  additionalNotes:'PRIVATE_DO_NOT_STORE',description:'PRIVATE_DO_NOT_STORE'
}});
function database(){
  const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../../infra/cloudflare/router/amy-cal-schema.sql',import.meta.url),'utf8'));
  return {sql, prepare(query){let args=[];return {query,bind(...v){args=v;return this;},first:async()=>sql.prepare(query).get(...args),run:()=>sql.prepare(query).run(...args)};},
    async batch(statements){sql.exec('BEGIN');try{const results=statements.map(s=>s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
function request(value,options={}){
  const body=typeof value==='string'?value:JSON.stringify(value);
  return new Request('https://caesthetic.com/api/amy/calcom',{method:'POST',body,headers:{'x-cal-signature-256':createHmac('sha256',secret).update(body).digest('hex'),...options}});
}
const env=db=>({AMY_CAL_DB:db,AMY_CAL_WEBHOOK_SECRET:secret});
test('fails closed before configuration and on wrong signature; stores nothing',async()=>{
  const db=database();assert.equal((await serveAmyCal(request(payload()),{})).status,503);
  assert.equal((await serveAmyCal(request(payload(),{'x-cal-signature-256':'0'.repeat(64)}),env(db))).status,401);
  assert.equal(db.sql.prepare('SELECT count(*) AS n FROM amy_cal_events').get().n,0);
});
test('authentic events persist a single queue row; duplicate and old deliveries do not regress state',async()=>{
  const db=database();const p=payload();
  for(let i=0;i<3;i++)assert.equal((await serveAmyCal(request(p),env(db))).status,200);
  assert.equal(db.sql.prepare('SELECT count(*) AS n FROM amy_cal_events').get().n,1);
  let row=db.sql.prepare('SELECT * FROM amy_review_queue').get();
  assert.equal(row.phone,'+33600000000');assert.equal(row.consent,1);assert.equal(row.state,'awaiting_visit');
  assert.ok(!JSON.stringify(row).includes('PRIVATE_DO_NOT_STORE'));
  await serveAmyCal(request(payload('BOOKING_CANCELLED','test-booking',now+1000)),env(db));
  await serveAmyCal(request(p),env(db));row=db.sql.prepare('SELECT * FROM amy_review_queue').get();
  assert.equal(row.state,'cancelled');assert.equal(row.phone,null);
});
test('flat meeting end is not proof of attendance, and no-show updates work without organizer fields',async()=>{
  const db=database();await serveAmyCal(request(payload()),env(db));
  const ended={...payload().payload,triggerEvent:'MEETING_ENDED',createdAt:new Date(now+1000).toISOString()};
  assert.equal((await serveAmyCal(request(ended),env(db))).status,200);
  let row=db.sql.prepare('SELECT * FROM amy_review_queue').get();assert.equal(row.ended,1);assert.equal(row.state,'awaiting_visit');
  await serveAmyCal(request({triggerEvent:'BOOKING_NO_SHOW_UPDATED',createdAt:new Date(now+2000).toISOString(),payload:{bookingUid:'test-booking',attendees:[{noShow:true}]}}),env(db));
  row=db.sql.prepare('SELECT * FROM amy_review_queue').get();assert.equal(row.state,'no_show');assert.equal(row.no_show,1);
});
test('unknown partial event retries instead of silently dropping it',async()=>{
  const db=database();const p={...payload().payload,triggerEvent:'MEETING_ENDED',createdAt:new Date(now).toISOString()};
  assert.equal((await serveAmyCal(request(p),env(db))).status,503);
});
test('out-of-order reschedule tombstones original UID',async()=>{
  const db=database();const moved=payload('BOOKING_RESCHEDULED','new-booking',now+1000);moved.payload.rescheduleUid='test-booking';
  await serveAmyCal(request(moved),env(db));await serveAmyCal(request(payload()),env(db));
  assert.equal(db.sql.prepare("SELECT state FROM amy_review_queue WHERE uid='test-booking'").get().state,'rescheduled');
  assert.equal(db.sql.prepare("SELECT state FROM amy_review_queue WHERE uid='new-booking'").get().state,'awaiting_visit');
});
test('wrong practice/slug, unknown trigger ignored; unsupported version, malformed and oversized data rejected',async()=>{
  const db=database();let p=payload();p.payload.organizer.email='someone@example.com';
  assert.equal((await (await serveAmyCal(request(p),env(db))).json()).status,'ignored');
  p=payload();p.payload.type='30min';assert.equal((await (await serveAmyCal(request(p),env(db))).json()).status,'ignored');
  assert.equal((await serveAmyCal(request(payload(),{'x-cal-webhook-version':'2026-07-27'}),env(db))).status,422);
  assert.equal((await serveAmyCal(request('{broken'),env(db))).status,400);
  assert.equal((await serveAmyCal(request('x'.repeat(65537)),env(db))).status,413);
  assert.equal(db.sql.prepare('SELECT count(*) AS n FROM amy_review_queue').get().n,0);
});
test('only literal checkbox true grants consent; phone requires explicit international prefix',()=>{
  assert.equal(phoneE164('06 00 00 00 00'),null);assert.equal(phoneE164('+33 6 00 00 00 00'),'+33600000000');
  for(const value of ['true','yes',false,undefined]){const p=payload();p.payload.responses['whatsapp-review-consent'].value=value;assert.notEqual(normalizeEvent(p,now).consent,1);}
  const stale=payload('BOOKING_CREATED','test-booking',now-8*86400000);assert.throws(()=>normalizeEvent(stale,now));
});
test('storage failure returns retryable error; retention deletes expired records',async()=>{
  const db=database();await serveAmyCal(request(payload()),env(db));
  db.sql.exec('UPDATE amy_review_queue SET expires_at=0; UPDATE amy_cal_events SET received_at=0');
  await purgeAmyCal(env(db));assert.equal(db.sql.prepare('SELECT count(*) AS n FROM amy_review_queue').get().n,0);
  assert.equal(db.sql.prepare('SELECT count(*) AS n FROM amy_cal_events').get().n,0);
  db.batch=async()=>{throw new Error('offline')};assert.equal((await serveAmyCal(request(payload()),env(db))).status,503);
});
