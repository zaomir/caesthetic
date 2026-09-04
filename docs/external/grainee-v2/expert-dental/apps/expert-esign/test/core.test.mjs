import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot, canonicalHash, interpolate, retentionDaysFor, sha256, stableStringify, validateTemplateFields } from '../lib/core.mjs';

test('stableStringify is deterministic', () => {
  assert.equal(stableStringify({ b:2, a:1 }), stableStringify({ a:1, b:2 }));
  assert.equal(canonicalHash({ b:2, a:1 }), canonicalHash({ a:1, b:2 }));
});

test('sha256 produces a 64-character digest', () => {
  assert.match(sha256('expert-dental'), /^[a-f0-9]{64}$/);
});

test('interpolate renders structured values without executing HTML', () => {
  assert.equal(interpolate('Пациент: {{name}}', { name:'Иванов И.И.' }), 'Пациент: Иванов И.И.');
  assert.match(interpolate('План: {{items}}', { items:['этап 1','этап 2'] }), /этап 1; этап 2/);
});

test('required template fields are enforced', () => {
  const template={fields:[{key:'diagnosis',label:'Диагноз',required:true},{key:'note',label:'Примечание',required:false}]};
  assert.equal(validateTemplateFields(template,{diagnosis:'Кариес'}).length,0);
  assert.equal(validateTemplateFields(template,{}).length,1);
});

test('snapshot binds template, patient and immutable document number', () => {
  const template={code:'ED-TEST',version:'1.0.0',title:'Тест',category:'test',status:'ACTIVE',retentionClass:'CLINICAL_25Y_PROVISIONAL',requiredSigners:['patient'],fields:[{key:'diagnosis',label:'Диагноз'}],acknowledgements:['Понял'],sections:[{heading:'Диагноз',paragraphs:['{{diagnosis}}']}]};
  const snapshot=buildSnapshot(template,{patient:{id:'p1',fullName:'Пациент'},episode:null,doctor:null,representative:null,clinic:{legalName:'ИП',license:'№1',address:'Бишкек'},fields:{diagnosis:'Кариес'},system:{generated_at:'2026-08-29T00:00:00.000Z',document_number:'ED-2026-1'}});
  assert.equal(snapshot.sections[0].paragraphs[0],'Кариес');
  assert.equal(snapshot.documentNumber,'ED-2026-1');
  assert.match(canonicalHash(snapshot),/^[a-f0-9]{64}$/);
});

test('retention defaults are conservative and deletion is not inferred', () => {
  assert.equal(retentionDaysFor('CLINICAL_25Y_PROVISIONAL',{}),9125);
  assert.equal(retentionDaysFor('CONTRACT_10Y_PROVISIONAL',{}),3650);
});
