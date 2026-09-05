import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const OWNER_MANIFEST_PATH='site-caesthetic/assets/connect4/owner-20260905/manifest.json';
const manifest=JSON.parse(fs.readFileSync(path.join(root,OWNER_MANIFEST_PATH),'utf8'));
const roleFor = name => name.includes('four-surfaces')?'system':name.includes('fix-the-leaks')?'stop':name.includes('recolored')?'alternate':'journey';
export const OWNER_IMAGES=manifest.files.map(file=>({...file,source:'site-caesthetic'+file.src,role:roleFor(file.name),format:file.name.includes('portrait')?'mobile':file.name.includes('recolored')?'alternate':'desktop',id:`connect4.owner.${roleFor(file.name)}.${file.name.includes('portrait')?'mobile':file.name.includes('recolored')?'alternate':'desktop'}`}));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text={
 system:{alt:'Four connected public surfaces: Search and Maps, Website, Social, and Reviews and Reputation. Lead Intake is shown separately below.',caption:'Four connected surfaces. One accountable lead coordinates the work. This illustration uses an aesthetic-practice example; it is not a client diagnosis.'},
 journey:{alt:'One possible client journey through Search and Maps, Website, and Reviews and Reputation, followed by the separate Lead Intake process. Social remains part of the system.',caption:'One possible route—not a required sequence. An inquiry still needs a response and follow-up. A booked consultation is a possible next step, not a guaranteed outcome.'},
 stop:{alt:'Paid traffic enters the four-surface system. Conflicting information can cause friction before an inquiry; no response or an unclear next step can cause friction inside Lead Intake.',caption:'Illustrative losses—not measured results. This is a readiness check for the relevant route, not a blanket ban on advertising or a diagnosis of your business.'},
 alternate:{alt:'An alternate overview of one possible journey from discovery through an inquiry and follow-up to a booked consultation.',caption:'Another view of the same illustrative journey. It is not a separate process or evidence that every client follows this route.'}
};
export function ownerFigure(role,{priority=false}={}){
 const items=OWNER_IMAGES.filter(i=>i.role===role);const d=items.find(i=>i.format==='desktop')||items[0];const m=items.find(i=>i.format==='mobile');
 if(!d||!text[role])throw new Error(`Missing owner image role: ${role}`);
 const t=text[role];const sources=m?`<source media="(max-width: 767px)" srcset="${m.src}" width="${m.width}" height="${m.height}">`:'';
 const links=m?`<a class="c4-art-link c4-art-link--desktop" href="${d.src}" target="_blank" rel="noopener">View full-size image</a><a class="c4-art-link c4-art-link--mobile" href="${m.src}" target="_blank" rel="noopener">View full-size image</a>`:`<a class="c4-art-link" href="${d.src}" target="_blank" rel="noopener">View full-size image</a>`;
 return `<figure class="c4-figure c4-figure--${role}" data-owner-figure="${role}"><picture data-connect4-picture="${role}">${sources}<img data-media-id="${d.id}" src="${d.src}" width="${d.width}" height="${d.height}" alt="${esc(t.alt)}" loading="${priority?'eager':'lazy'}"${priority?' fetchpriority="high"':''} decoding="async" aria-describedby="c4-${role}-caption"></picture><figcaption id="c4-${role}-caption">${esc(t.caption)} ${links}</figcaption></figure>`;
}
export function engagementCopy(md){
 const raw=md.split('<!-- connect4-engagement-json:start -->')[1]?.split('<!-- connect4-engagement-json:end -->')[0]?.match(/```json\s*([\s\S]*?)```/)?.[1];
 if(!raw)throw new Error('Missing approved engagement path in SSOT');const copy=JSON.parse(raw);
 if(copy.contract!=='connect4-engagement-path/1.0.0')throw new Error('Unexpected engagement contract');
 for(const lang of ['en','ru']){
  if(copy[lang].steps.map(s=>s.id).join(',')!=='score,check,sprint,extension,system')throw new Error('Engagement stage drift');
  for(const id of ['check','extension','system'])if(copy[lang].steps.find(s=>s.id===id).optional!==true)throw new Error('Optionality drift');
 }
 return copy;
}
export function engagementMarkup(copy){
 const c=copy.en;
 return `<section id="working-together" class="c4-section c4-soft" data-engagement-contract="${copy.contract}" aria-labelledby="working-together-title" tabindex="-1"><div class="c4-wrap"><div class="c4-section-heading"><p class="c4-label">The engagement</p><h2 id="working-together-title">${esc(c.heading)}</h2></div><p class="c4-prose">${esc(c.intro)}</p><div data-c4-engagement-media-slot data-media-status="awaiting-owner-image"></div><ol class="c4-engagement">${c.steps.map((s,i)=>`<li data-engagement-step="${s.id}" data-optional="${s.optional}"><span class="c4-stage-number">0${i+1}</span><div><h3>${esc(s.title)}</h3><p class="c4-engagement-price">${esc(s.price)}${s.optional&&s.id!=='system'?' · Optional':''}</p><p>${esc(s.description)}</p></div></li>`).join('')}</ol><p class="c4-prose c4-after">${esc(c.outro)}</p></div></section>`;
}
