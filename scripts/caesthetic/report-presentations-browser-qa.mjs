#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try {playwright=require('playwright');} catch {playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2), out=args.includes('--out')?path.resolve(args[args.indexOf('--out')+1]):path.join(root,'.tmp/report-presentations-qa');
fs.mkdirSync(out,{recursive:true});
const result={profiles:[],checks:[],screenshots:[],errors:[]};
const assert=(ok,name)=>{result.checks.push({name,status:ok?'pass':'fail'});if(!ok)throw new Error(name);};
const browser=await playwright.chromium.launch({headless:true});
try {
  for(const version of ['v6','v6.1','v6.2']) {
    result.profiles.push(version);
    for(const width of [320,390,768,1440]) {
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      page.on('pageerror',err=>result.errors.push(`${version}/${width}: ${err.message}`));
      await page.route(/^https?:/,r=>r.abort());
      await page.goto(pathToFileURL(path.join(root,`docs/caesthetic/design/report-presentations/preview.${version}.ru.html`)).href);
      assert(await page.locator('html').getAttribute('lang')==='ru',`${version}/${width}: Russian`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${version}/${width}: no page overflow`);
      assert(await page.locator('h1').count()===1,`${version}/${width}: one heading`);
      const targets=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.hash).filter(id=>id.length>1).every(id=>document.getElementById(decodeURIComponent(id.slice(1)))));
      assert(targets,`${version}/${width}: anchor targets`);
      if(version!=='v6') {
        assert(await page.locator('[data-check500-placement]').count()===2,`${version}/${width}: two Check placements`);
        const nav=page.locator('.nav a[href="#before-after"]');
        await nav.click();
        assert(await page.evaluate(()=>location.hash)==='#before-after',`${version}/${width}: before-after navigation`);
        const bounds=await page.locator('#before-after').boundingBox();
        assert(bounds.y>=0&&bounds.y<200,`${version}/${width}: sticky navigation does not hide heading`);
        const summary=page.locator('#plan details summary').first();
        await summary.focus();await page.keyboard.press('Enter');
        assert(await page.locator('#plan details').first().getAttribute('open')!==null,`${version}/${width}: keyboard disclosure`);
        const before=await page.locator('details[open]').count();
        await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
        assert(await page.locator('details[open]').count()===await page.locator('details').count(),`${version}/${width}: print expands evidence`);
        await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
        assert(await page.locator('details[open]').count()===before,`${version}/${width}: print restores state`);
        if(width===390||width===1440) {
          await page.locator('#before-after').scrollIntoViewIfNeeded();
          const file=`${version}-${width}-before-after.png`;await page.screenshot({path:path.join(out,file)});result.screenshots.push(file);
          await page.evaluate(()=>scrollTo(0,0));
          const top=`${version}-${width}-top.png`;await page.screenshot({path:path.join(out,top)});result.screenshots.push(top);
        }
      }
      await page.close();
    }
  }
  assert(result.errors.length===0,'No browser script errors');
} finally {
  await browser.close();fs.writeFileSync(path.join(out,'browser-qa.json'),JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(c=>c.status==='fail').length,errors:result.errors,screenshots:result.screenshots.length}));
