import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT,SSOT,CONTRACT,IMAGES,getCopy,hash,build} from '../../scripts/caesthetic/build-connect4-page.mjs';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
test('Connect4 derives paired copy from the approved SSOT',()=>{
 const copy=getCopy(read(SSOT));
 assert.equal(copy.contract,CONTRACT);
 assert.match(copy.en.definition,/^Connect4 aligns Search & Maps/);
 assert.match(copy.en.value,/^We build a marketing foundation/);
 assert.match(copy.ru.definition,/^Connect4/);
 assert.match(copy.ru.value,/^Мы создаём маркетинговую основу/);
 assert.ok(copy.en.section.includes('One accountable lead'));
 assert.ok(copy.ru.section.includes('Готовые материалы'));
});
test('unapproved or unexpected copy contract fails closed',()=>{
 assert.throws(()=>getCopy(read(SSOT).replace('explanation_copy_status: approved','explanation_copy_status: draft')));
});
test('generated page and registry are reproducible',()=>build(true));
test('all nine owner PNGs remain byte-identical and registered',()=>{
 const registry=JSON.parse(read('site-caesthetic/media/registry.json'));
 for(const image of IMAGES){
  const b=fs.readFileSync(path.join(ROOT,'site-caesthetic'+image.src));
  assert.equal(hash(b),image.sha256);
  assert.ok(b.equals(fs.readFileSync(path.join(ROOT,image.source))));
  assert.equal(registry.entries[image.id].state,'approved');
  assert.ok(registry.entries[image.id].allowed_routes.includes('/connect4/'));
 }
});
test('page has four surfaces, static raster art direction and no drawn diagrams',()=>{
 const html=read('site-caesthetic/connect4/index.html');
 const main=html.match(/<main[\s\S]+<\/main>/)[0];
 assert.equal((main.match(/data-surface=/g)||[]).length,4);
 assert.equal((main.match(/<source media="\(max-width: 767px\)"/g)||[]).length,4);
 assert.equal((main.match(/data-owner-figure=/g)||[]).length,5);
 for(const image of IMAGES)assert.ok(main.includes(image.src));
 assert.doesNotMatch(main,/<(?:svg|canvas)\b|<img[^>]+\.svg|mailto:|data-media-state="placeholder"/i);
 assert.match(main,/aesthetic-practice example/);
 assert.ok(main.indexOf('id="before-ads"')>main.indexOf('id="lead-intake"'));
 assert.match(main,/Ongoing management is optional/);
 assert.match(main,/Measured impact/);
 assert.equal((main.match(/<h1\b/g)||[]).length,1);
 const ids=[...html.matchAll(/\sid="([^\"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/href="#([^\"]+)"/g)) assert.ok(ids.includes(m[1]),`Broken anchor ${m[1]}`);
});
test('requests use the shared two-field flow and page is discoverable',()=>{
 const html=read('site-caesthetic/connect4/index.html');
 assert.equal((html.match(/data-cae-intent="free_growth_score"/g)||[]).length,2);
 assert.match(html,/data-cae-question data-cae-intent="connect4_question"/);
 assert.match(html,/\/assets\/js\/caesthetic\.js/);
 assert.match(read('site-caesthetic/templates/footer.html'),/href="\/connect4\/"/);
 assert.match(read('site-caesthetic/sitemap.xml'),/https:\/\/caesthetic.com\/connect4\//);
});

test('engagement path keeps Check, extensions and annual work optional in both languages',()=>{
 const copy=getCopy(read(SSOT)).engagement;
 assert.equal(copy.contract,'connect4-engagement-path/1.0.0');
 for(const lang of ['en','ru']){
  assert.equal(copy[lang].steps.length,5);
  for(const id of ['check','extension','system'])assert.equal(copy[lang].steps.find(s=>s.id===id).optional,true);
 }
 const html=read('site-caesthetic/connect4/index.html');
 assert.match(html,/You can move directly to the Sprint/);
 assert.match(html,/After Day 30/);
 assert.match(html,/No automatic renewal/);
 assert.match(html,/separate 12-month agreement/);
 assert.match(html,/data-c4-engagement-media-slot/);
 assert.equal((html.match(/data-engagement-step=/g)||[]).length,5);
 assert.doesNotMatch(html,/<img[^>]+(?:null|undefined|placeholder)/);
});
test('four responsive image pairs and one alternate are complete, not invented pairs',()=>{
 assert.equal(IMAGES.length,9);
 for(const role of ['system','journey','stop','engagement'])assert.deepEqual(IMAGES.filter(i=>i.role===role).map(i=>i.format).sort(),['desktop','mobile']);
 assert.equal(IMAGES.filter(i=>i.role==='alternate').length,1);
 const registry=JSON.parse(read('site-caesthetic/media/registry.json'));
 for(const format of ['desktop','mobile']){
  assert.equal(registry.entries[`connect4.engagement.${format}`].state,'approved');
  assert.match(registry.entries[`connect4.engagement.${format}`].src,/how-we-work-together-/);
 }
});

test('engagement originals are locked to the supplied files, not substitutes',()=>{
 const expected={desktop:'ab589361037be7efe1b2feb621d8010267885eaba4eb2b222dbd85c7ca3bc2e1',mobile:'67a01b7185153de99fb8e57592680f71882d5e48f39d42a64db6a0e88c85f0d6'};
 for(const [format,sha] of Object.entries(expected)){
  const image=IMAGES.find(i=>i.role==='engagement'&&i.format===format);
  assert.equal(hash(fs.readFileSync(path.join(ROOT,image.source))),sha);
  assert.equal(image.sha256,sha);
 }
});
