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
test('both immutable originals are copied byte-for-byte and registered',()=>{
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
 assert.match(main,/<source media="\(max-width: 767px\)" srcset="[^\"]+mobile-v1\.png"/);
 assert.match(main,/<img src="[^\"]+journey-v1\.png"/);
 assert.doesNotMatch(main,/<(?:svg|canvas)\b|<img[^>]+\.svg|mailto:|data-media-state="placeholder"/i);
 assert.match(main,/aesthetic-practice example uses patient terminology/);
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
