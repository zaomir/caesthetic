#!/usr/bin/env node
import fs from 'node:fs';
import {clientV6Document,V6_UI} from './growth-score-client-v6.mjs';
const root=new URL('../../docs/caesthetic/design/report-v6/',import.meta.url);
for (const locale of ['ru','en']) {
  const model=JSON.parse(fs.readFileSync(new URL(`spoken-reference.${locale}.json`,root),'utf8'));
  const html=clientV6Document(model,{notice:V6_UI[locale].preview});
  const out=new URL(`preview.${locale}.html`,root);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(out) || fs.readFileSync(out,'utf8')!==html) throw new Error(`v6 ${locale} reference drift`);
  } else fs.writeFileSync(out,html);
}
console.log('V6 bilingual design references PASS');
