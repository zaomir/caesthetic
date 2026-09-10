#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {renderGrowthReport, isAllowedRealScoreOutput} from './render-growth-score.mjs';
import {validateExpertContent, CLIENT_V61, CLIENT_V62} from './growth-score-expert-presentations.mjs';
import {CLIENT_V6} from './growth-score-client-v6.mjs';

export function buildReportPresentations(report, outDir) {
  if(report.audit?.format==='multi_location') throw new TypeError('Keep the network parent/focus package; this builder is for single-location reports');
  validateExpertContent(report.presentation?.v6,report.presentation?.expert);
  const base=structuredClone(report); delete base.presentation;
  const factHash=createHash('sha256').update(JSON.stringify(base)).digest('hex');
  const results=[];
  for(const [version,contract] of [['v6',CLIENT_V6],['v6.1',CLIENT_V61],['v6.2',CLIENT_V62]]) {
    const copy=structuredClone(report); copy.presentation.layout_contract=contract;
    const output=path.resolve(outDir,version,'index.html');
    if(copy.reportKind==='real' && copy.presentation.kind!=='pilot' && !isAllowedRealScoreOutput(copy,output)) throw new TypeError('Real Growth Score output must use an unguessable /score/<slug>/ directory');
    // Validate all three versions before writing any output.
    results.push({version,copy,output,markup:renderGrowthReport(copy),layout_contract:contract,facts_sha256:factHash,report:`${version}/report.json`,html:`${version}/index.html`});
  }
  for(const r of results) {
    fs.mkdirSync(path.dirname(r.output),{recursive:true});
    fs.writeFileSync(path.join(path.dirname(r.output),'report.json'),JSON.stringify(r.copy,null,2)+'\n');
    fs.writeFileSync(r.output,r.markup);
  }
  const manifest=results.map(({copy,output,markup,...r})=>r);
  fs.writeFileSync(path.resolve(outDir,'presentations.json'),JSON.stringify({locale:'ru',facts_sha256:factHash,versions:manifest},null,2)+'\n');
  return manifest;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const args=process.argv.slice(2), get=key=>args[args.indexOf(key)+1];
  if(!args.includes('--report')||!args.includes('--out')) throw new TypeError('Usage: --report path/to/report.json --out path/to/package');
  const report=JSON.parse(fs.readFileSync(get('--report'),'utf8'));
  console.log(JSON.stringify(buildReportPresentations(report,get('--out')),null,2));
}
