#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir=path.join(root, 'docs/caesthetic/design/report-presentations');
const check=process.argv.includes('--check');
const write=(relative,content)=>{
  const file=path.join(root,relative);
  if(check) {
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content) throw new Error(`Template drift: ${relative}`);
  } else {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
};
const sourcePath='site-caesthetic/private/expert-dental/index.html';
const source=fs.readFileSync(path.join(root,sourcePath),'utf8');
const blob=createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
if(blob!=='7680e492b8679a52feaf14621f6a7dcb35b468a3') throw new Error('Expert source changed: review the reference before importing another design');
const css=[...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
write('scripts/caesthetic/report-expert/expert.css',css);
// Import after the stylesheet exists; the reusable renderer embeds this exact source.
const {createGrowthScorePresentationTemplate}=await import('./growth-score-report-template.mjs');
const {clientV6Document}=await import('./growth-score-client-v6.mjs');
const {expertDocument}=await import('./growth-score-expert-presentations.mjs');
const demo=JSON.parse(fs.readFileSync(path.join(dir,'example.ru.json'),'utf8'));
const profiles=['v6','v6.1','v6.2'];
for(const version of profiles) {
  write(`docs/caesthetic/design/report-presentations/template.${version}.ru.json`,JSON.stringify(createGrowthScorePresentationTemplate({version,locale:'ru'}),null,2)+'\n');
  const html=version==='v6'?clientV6Document(demo.v6,{notice:'Учебные данные для сравнения представлений. Не аудит действующей клиники.'}):expertDocument(demo.v6,demo.expert,{version,preview:true});
  write(`docs/caesthetic/design/report-presentations/preview.${version}.ru.html`,html);
}
write('docs/caesthetic/design/report-presentations/source-manifest.json',JSON.stringify({
  source:sourcePath,source_url:'https://caesthetic.com/private/expert-dental/',source_blob_sha:blob,
  css_path:'scripts/caesthetic/report-expert/expert.css',css_sha256:createHash('sha256').update(css).digest('hex'),
  profiles,locale:'ru',default_profile:'v6',preview_data:'synthetic',
  stylesheet_policy:'Exact Expert source CSS. Functional/mobile/print additions are separate in interaction.css.',
},null,2)+'\n');
console.log(`${check?'Verified':'Built'} Russian v6, v6.1 and v6.2 templates and previews.`);

