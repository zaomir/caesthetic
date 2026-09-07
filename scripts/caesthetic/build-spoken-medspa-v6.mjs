import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {renderGrowthReport} from './render-growth-score.mjs';
import {CLIENT_V6} from './growth-score-client-v6.mjs';
import {validateConsistency,validateResearchPublication} from './consistency-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const V6_CASE='docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/revisions/v6';
const previous='docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/revisions/v3';
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
export function generateSpokenV6() {
  const release=json(`${V6_CASE}/release.json`);
  for(const [p,digest] of Object.entries(release.inputs)) if(hash(read(p))!==digest) throw Error(`V6 source changed: ${p}`);
  const v3=json(`${previous}/release.json`), matrix=json(`${previous}/consistency.json`), registry=json(`${previous}/source-register.json`);
  validateConsistency(matrix,registry,{clientRelease:false});
  validateResearchPublication(v3,matrix,registry);
  const choices=json(`${previous}/choice-questions.json`).questions;
  const output=new Map();
  for(const locale of ['ru','en']) {
    const report=json(`${previous}/approved-report.${locale==='en'?'en-US':locale}.json`);
    const model=json(`${V6_CASE}/copy.${locale}.json`);
    report.public_source_observations={questions:choices};
    report.presentation={...report.presentation,layout_contract:CLIENT_V6,v6_public_assets:true,v6:model};
    const slug='spoken-medspa-snellville-9d7f3a5c2e184b61'+(locale==='ru'?'-rus':'');
    const dir=`site-caesthetic/score/${slug}/v6`;
    const html=renderGrowthReport(report);
    if(/source-export:|Design reference:|Дизайн-референс:|support\.js|__PLACEHOLDER__/.test(html)) throw Error('V6 preview content leaked');
    output.set(`${dir}/index.html`,html);
    output.set(`${dir}/presentation.json`,JSON.stringify({layout_contract:CLIENT_V6,revision:'6',stage:'owner_published_presentation',source_ref:release.source_ref,source_input_digest:hash(JSON.stringify(release.inputs)),research_status:'retained_source_observations',owner_changes:release.owner_changes},null,2)+'\n');
  }
  const tokens=read('scripts/caesthetic/report-v6/tokens.css').toString();
  output.set('site-caesthetic/assets/css/growth-score-v6.css',tokens.split('\n')[0]+'\n'+tokens.slice(tokens.indexOf('*,*::before'))+'\n'+read('scripts/caesthetic/report-v6/layout.css'));
  output.set('site-caesthetic/assets/js/growth-score-v6.js',read('scripts/caesthetic/report-v6/client.mjs'));
  output.set('site-caesthetic/assets/brand/report-v6-logo.png',read('scripts/caesthetic/report-v6/logo.png'));
  return output;
}
export function writeSpokenV6({check=false}={}) {
  const output=generateSpokenV6();
  for(const [p,content]of output) {
    if(check){if(!read(p).equals(Buffer.from(content)))throw Error(`V6 build drift: ${p}`);}
    else{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),content);}
  }
  return output;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){writeSpokenV6({check:process.argv.includes('--check')});console.log('Spoken v6 paired build PASS');}
