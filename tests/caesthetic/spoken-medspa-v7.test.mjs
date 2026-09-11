import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generateSpokenV7,CASE,ROUTE} from '../../scripts/caesthetic/build-spoken-medspa-v7.mjs';
const outputs=generateSpokenV7();
const html=outputs.get(`site-caesthetic${ROUTE}index.html`);
const copy=JSON.parse(fs.readFileSync(`${CASE}/v6/copy.ru.json`));
test('v7 preserves three priorities, research dates and the client-specific offer',()=>{
  const meta=JSON.parse(outputs.get(`site-caesthetic${ROUTE}presentation.json`));
  assert.deepEqual(meta.priorities,copy.plan.map(p=>p.id));assert.deepEqual(meta.commercial,copy.commercial);
  assert.equal(meta.research_status,'retained_source_observations');
  assert.match(html,/не являются повторной проверкой/);
  for(const p of copy.plan){assert.ok(html.includes(p.result));assert.ok(html.includes(p.done_when));}
  assert.equal((html.match(/data-gap-id=/g)||[]).length,3);
  assert.equal((html.match(/data-check500-placement=/g)||[]).length,2);
  assert.match(html,/sprint\/\?offer=spoken-four-surface-sprint-v1/);
  assert.doesNotMatch(html,/\$300|\$500 per location/);
});
test('v7 has inspectable evidence, all 40 cells and scoped English service links',()=>{
  assert.equal((html.match(/class="v7-cell"/g)||[]).length,40);
  assert.equal((html.match(/data-surface=/g)||[]).length,4);
  assert.match(html,/https:\/\/www.spokenmedspa.com\/neurotoxins-snellville-ga/);
  assert.match(html,/https:\/\/caesthetic.com\/connect4\/location-alignment\//);
  assert.match(html,/https:\/\/caesthetic.com\/blog\/consistent-business-information\//);
  assert.doesNotMatch(html,/private-source\.example|source-export:|__PLACEHOLDER__|\/connect4\/[^" ]+\/ru\//);
  assert.match(html,/noindex,nofollow/);assert.match(html,/<html lang="ru"/);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
});
test('builder writes only the additional v7 presentation',()=>{
  assert.equal(outputs.size,2);for(const p of outputs.keys())assert.ok(p.startsWith(`site-caesthetic${ROUTE}`));
  const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]));
  for(const [,target]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(target),target);
});
