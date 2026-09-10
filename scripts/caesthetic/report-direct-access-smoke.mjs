import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'infra/cloudflare/brands/caesthetic.manifest.json')));
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]):[];
const prefixes=manifest.scorePublicPaths||[];
const legacy=['bonita','expert-dental','expert-dental-estimate','expert-dental-estimate-v2','nogi-v-ruki','faina-perukarnya','faina-perukarnya-v2','fermerskiy-ostrovok'];
const files=walk(path.join(root,'site-caesthetic/score')).filter(f=>f.endsWith('/index.html')&&prefixes.some(p=>('/'+path.relative(path.join(root,'site-caesthetic'),f)).startsWith(p)));
for(const name of legacy)files.push(...walk(path.join(root,'site-caesthetic/private',name)).filter(f=>f.endsWith('/index.html')));
const results=[];
for(let offset=0;offset<files.length;offset+=4){
  await Promise.all(files.slice(offset,offset+4).map(async file=>{
    const route='/'+path.relative(path.join(root,'site-caesthetic'),file).replace(/index\.html$/,'');
    try{
      const response=await fetch('https://caesthetic.com'+route,{signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});
      const content=await response.text();
      if(response.status!==200)throw Error('HTTP '+response.status);
      if(/<input\b[^>]*type=["']password["']|<body\b[^>]*class=["'](?:audit|is)-locked["']/.test(content))throw Error('Password gate remains');
      if(!/noindex/.test(content))throw Error('noindex missing');
      const source=fs.readFileSync(file,'utf8');
      // Redirect pages are verified at their resolved destination; normal pages match this release exactly.
      if(!/http-equiv=["']refresh/.test(source)&&content!==source)throw Error('Content differs from deployed source');
      results.push({route,status:'pass',http:200,anonymous:true,contentSha256:createHash('sha256').update(content).digest('hex'),finalUrl:response.url});
    }catch(e){results.push({route,status:'fail',error:e.message});}
  }));
}
const out=process.env.CAE_REPORT_ACCESS_OUTPUT||'/tmp/caesthetic-report-access/results.json';fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify({policy:'password-only-on-direct-instruction',sourceSha:process.env.GITHUB_SHA||null,results:results.sort((a,b)=>a.route.localeCompare(b.route))},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,failed:results.filter(r=>r.status==='fail')}));
if(!results.length||results.some(r=>r.status==='fail'))process.exitCode=1;
