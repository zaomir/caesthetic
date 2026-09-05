import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {OWNER_IMAGES,ownerFigure,engagementCopy,engagementMarkup} from './connect4-media.mjs';

// Static presentation derived from the approved SSOT. No diagram rendering.
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SSOT = 'docs/ssot/CAESTHETIC_CONNECT4_CONCEPT.md';
export const CONTRACT = 'connect4-explanation/1.0.0';
export const IMAGES = OWNER_IMAGES;
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function field(md, label) {
  const line = md.split('\n').find(s => s.startsWith(`**${label}:** `));
  if (!line) throw new Error(`Missing approved field: ${label}`);
  return line.slice(`**${label}:** `.length).trim().replaceAll('**','');
}
export function getCopy(md) {
  if (!md.includes('explanation_copy_status: approved') || !md.includes(`explanation_contract: ${CONTRACT}`)) throw new Error('Connect4 approval/contract drift');
  const section = md.split('### 10.7 ')[1]?.split('### 10.8 ')[0];
  if (!section) throw new Error('Missing approved reusable section');
  const enSection = section.split('**EN**')[1]?.split('**RU')[0];
  const ruSection = section.split('**RU — смысловой эквивалент**')[1]?.split('Общий текст не диагностирует')[0];
  if (!enSection || !ruSection) throw new Error('Missing paired EN/RU section');
  const plain = s => s.trim().split('\n\n').filter(p => !p.startsWith('[')).join('\n\n');
  const core=md.split('### 10.3 ')[1]?.split('### 10.4 ')[0];
  const ru=[...(core||'').matchAll(/^\*\*RU:\*\* (.+)$/gm)].map(m=>m[1]);
  if(ru.length<3) throw new Error('RU core incomplete');
  return { contract:CONTRACT, source:SSOT, source_sha256:hash(md), engagement:engagementCopy(md),
    en:{ definition:field(md,'Определение EN'), value:field(md,'Коммерческая формулировка EN'), explanation:field(md,'Пояснение EN'), section:plain(enSection) },
    ru:{ definition:ru[0], value:ru[1], explanation:ru[2], section:plain(ruSection) }
  };
}
const cta = (id='') => `<button type="button" class="cae-btn cae-btn--primary c4-cta" data-cae-request data-cae-intent="free_growth_score"${id ? ` id="${id}"` : ''}>Get my free Growth Score</button>`;
const section = (id, number, title, content, cls='') => `<section id="${id}" class="c4-section ${cls}" aria-labelledby="${id}-title" tabindex="-1"><div class="c4-wrap"><div class="c4-section-heading"><p class="c4-label">${number}</p><h2 id="${id}-title">${title}</h2></div>${content}</div></section>`;
export function render(copy, header, footer) {
  const surfaces = [
    ['Search & Maps','Find the right service and location.','Accurate business information and a relevant place to go next.'],
    ['Website','Understand the offer and the next step.','Clear service explanations, the right specialists, and evidence people can check.'],
    ['Social','Get to know the people and expertise behind it.','Content that supports the same real services—in a format that fits the channel.'],
    ['Reviews & Reputation','Hear from real clients and see how the business responds.','Independent experiences, honest review invitations, and useful replies.']
  ];
  const stages = [
    ['Understand & prioritize','Start with an evidence-backed priority, not an assumption that every channel is broken.','A clear starting point and a focused scope.'],
    ['Define the shared foundation','Connect the language clients use with your actual services, specialists, locations, evidence, and next steps.','A demand-language map and one shared reference.'],
    ['Implement the agreed changes','Update the materials and connections that the priority depends on. Establish the agreed review and response process.','Completed work, not just a recommendation list.'],
    ['Verify the handoff','Identify where inquiries arrive and who owns the next step. Internal checks require agreed scope and appropriate access.','A verified handoff—or an explicit not-assessed boundary.'],
    ['Put it into use','Give the team clear roles, update instructions, and a practical way to maintain the work.','A process people can actually use.'],
    ['Review & decide','Separate delivery, team use, and any business effect the evidence supports.','A record of what changed and a choice about what comes next.']
  ];
  const faq = [
    ['Do we have to replace our current marketer?','No. Existing specialists can keep managing their channels. Connect4 adds shared priorities, coordinated changes, and responsibility for the connections. If that system already works, we preserve it rather than sell a duplicate.'],
    ['Who is accountable?','Your engagement names one Connect4 lead for the shared plan, coordination, and verification. Different specialists may do the work. Clinical claims and care remain with the clinical team.'],
    ['What does our team need to do?','Appoint a contact, confirm service and specialist information, approve relevant content, provide the access required by the scope, and use the agreed update process.'],
    ['Does one Sprint rebuild every channel?','No. The 30-Day Growth Sprint implements the agreed priority and the dependencies it needs. It is not a promise to rebuild every service, location, and internal workflow in 30 days.'],
    ['Can a multi-location business use the same approach?','Yes, with shared standards and accurate local facts. Services, specialists, availability, and conditions may differ by location. The scope must reflect those differences.'],
    ['Is ongoing management required?','No. You keep the completed materials and operating instructions within the agreed scope. Your team, your marketer, or CAESTHETIC can maintain the system. When you choose ongoing Growth System work, it is covered by a separate 12-month agreement with individually agreed terms. Third-party platforms and licenses remain subject to their own terms.']
  ];
  const body = `
<a class="c4-skip" href="#main-content">Skip to content</a>
${header}
<main id="main-content" class="c4-page" data-copy-contract="${CONTRACT}" tabindex="-1">
<section class="c4-hero"><div class="c4-wrap">
<p class="c4-label">How we work · Connect4</p>
<h1>Make your marketing<br class="c4-desktop-break"> work as one.</h1>
<div class="c4-hero-bottom"><div><p class="c4-intro">${esc(copy.en.definition)}</p><p>${esc(copy.en.value)}</p></div><div class="c4-hero-actions">${cta('connect4-start')}<a class="c4-link" href="#four-surfaces">See how it works <span aria-hidden="true">↓</span></a><p class="c4-caption">Name and email. We will reply by email.</p></div></div>
${ownerFigure('system',{priority:true})}
<nav class="c4-toc" aria-label="On this page"><a href="#four-surfaces">The four surfaces</a><a href="#service-example">One service</a><a href="#implementation">The work</a><a href="#lead-intake">After an inquiry</a><a href="#handoff">What you keep</a><a href="#working-together">Working together</a></nav>
</div></section>
${section('connections','01 / The question','A website. Social posts. Reviews.<br>But who connects the dots?',`<div class="c4-prose"><p>Your service page says one thing. A social post points to an old offer. A specialist is visible on Instagram but hard to find on the website. These are possible gaps—not a diagnosis of your business.</p><p>Connect4 checks whether the pieces help people understand the same offer. It protects what already works and coordinates what needs to change.</p></div>`)}
${section('four-surfaces','02 / Connect4','Four surfaces. One clear offer.',`<dl class="c4-surfaces">${surfaces.map(([name,role,desc],i)=>`<div data-surface="${['search','website','social','reputation'][i]}"><dt><span class="c4-surface-number">0${i+1}</span>${esc(name)}</dt><dd><strong>${esc(role)}</strong><p>${esc(desc)}</p></dd></div>`).join('')}</dl><div class="c4-owner"><h3>One accountable lead.</h3><p>Different specialists can do the work. One named lead coordinates the shared facts, priorities, and updates across all four. Consistency means the same reality—not identical text or simultaneous posts.</p></div><details class="c4-details"><summary>Read the image explanation</summary><div><p>Four public surfaces surround the business. The dashed connection means they belong to one system. The four surfaces are not a required sequence. The separate journey illustration below shows one possible route; Social remains part of the system even when that person does not visit it.</p><p>After the decision to contact, an inquiry enters Lead Intake: response, follow-up, and an appropriate next step. A booked consultation is one possible outcome, not a promise. Conflicting information or an unclear response can introduce friction; the illustration does not establish that either is happening in your business.</p></div></details>`,'c4-soft')}
${section('service-example','03 / An illustrative example','Follow one service across all four.',`<div class="c4-prose"><p>Imagine a business with two locations. Laser hair removal is available only at Location A. The first step for this service is a consultation request.</p><p class="c4-caption">Illustrative example—not a client result.</p></div><div class="c4-comparison" role="list">${[
['Search & Maps','The service links to a general page.','Confirm the correct location and point to the relevant service explanation.'],
['Website','It is unclear which location offers the service.','Explain the service, confirmed specialist information, Location A, and how to request a consultation.'],
['Social','A post still points to an expired offer.','Update the conditions, explanation, and next step without copying the website word for word.'],
['Reviews & Reputation','Review invitations and business replies have no consistent process.','Set up neutral invitations and useful, privacy-conscious replies. Clients choose their own words and ratings.']
].map(([name,before,after])=>`<article role="listitem"><h3>${esc(name)}</h3><div><p class="c4-label">The gap</p><p>${esc(before)}</p></div><div><p class="c4-label">The agreed change</p><p>${esc(after)}</p></div></article>`).join('')}</div><p class="c4-prose c4-after">The result we can check here is a coherent explanation and working next step. More bookings would require separate, comparable evidence.</p><details class="c4-details c4-alternate-view"><summary>See another view of the journey</summary><div>${ownerFigure('alternate')}</div></details>`)}
${section('implementation','04 / The work','We build it, put it to work,<br>and hand it over.',`<ol class="c4-stages">${stages.map(([name,action,deliverable],i)=>`<li><span class="c4-stage-number">0${i+1}</span><div><h3>${name}</h3><p>${action}</p><p class="c4-deliverable"><strong>You keep:</strong> ${deliverable}</p></div></li>`).join('')}</ol><p class="c4-caption c4-after">These are stages of the working process—not six products or a promise to complete every possible improvement in one Sprint. Scope follows the verified priority.</p>`,'c4-soft')}
${section('reviews','05 / Independent experiences','A real review process.<br>Not scripted praise.',`<div class="c4-prose"><p>We establish neutral review invitations, clear responsibilities, and useful, privacy-conscious replies. Clients choose their own words and ratings. No incentives, scripted reviews, or screening by satisfaction.</p><p>The business owns the invitation and response process—not the opinions people publish. Critical feedback can reveal something to investigate, not something to edit away.</p></div>`)}
${section('lead-intake','06 / After someone reaches out','Getting in touch is not<br>the same as getting booked.',`<div class="c4-two-column"><div><p>Once an inquiry arrives, someone must receive it, respond, and help the person take the next appropriate step. Lead Intake is this separate operational layer—not a fifth marketing surface.</p><p>A call from Maps, a website form, or a social message may enter a different route. Each needs an identified owner and a clear handoff.</p></div><div class="c4-note"><h3>Where this work begins—and ends</h3><p>Internal workflow work requires agreed scope and the right access. A public website alone cannot tell us whether your team, follow-up, or CRM is working well.</p><p>The next step might be a confirmed booking, a meeting, or a request for an estimate. An inquiry is not automatically a sale.</p></div></div>${ownerFigure('journey')}`,'c4-soft')}
${section('handoff','07 / Ownership','Your foundation.<br>Your choice of who runs it.',`<div class="c4-two-column"><div class="c4-prose"><p>You keep the completed materials, the shared service and location reference, the content map, the review and response process, and the rules for keeping everything current.</p><p><strong>Your team, your marketer, or CAESTHETIC can maintain the system. Ongoing management is optional.</strong></p></div><div class="c4-note"><h3>A working basis—not a one-time document</h3><p>The handoff includes responsibilities and update instructions. Services and teams change; someone still needs to keep the information current.</p><p>For a group, common standards remain shared while local services, specialists, and availability stay accurate.</p></div></div>`)}
${section('verification','08 / Evidence','See what changed.<br>See what the data supports.',`<div class="c4-proof"><article><p class="c4-label">Delivered</p><h3>The change is in place.</h3><p>The agreed pages, profiles, links, or instructions have been completed and checked.</p></article><article><p class="c4-label">In use</p><h3>The team uses it.</h3><p>The intended people follow the update, review, and handoff process in practice.</p></article><article><p class="c4-label">Measured impact</p><h3>The evidence supports an effect.</h3><p>Comparable data, agreed definitions, a baseline, and a measurement window support the conclusion—with limitations made clear.</p></article></div><p class="c4-prose c4-after">A corrected page is not proof of more bookings. When there is not enough evidence, we say so. Real client findings stay separate from the general explanation on this page.</p><a class="c4-link" href="/case-studies/">See the work behind the cases <span aria-hidden="true">→</span></a>`,'c4-soft')}
${section('before-ads','09 / What not to fund yet','Before you increase ad spend,<br>check where the next client will land.',`<div class="c4-prose"><p>Fix an evidence-backed gap on the relevant journey before sending more paid traffic into it. If the constraint is too little qualified demand, paid acquisition may be appropriate once the journey, capacity, and economics are ready.</p><p><strong>When the cause is unclear, test before scaling.</strong> This is not a blanket ban on advertising or a requirement to make every channel perfect.</p></div>${ownerFigure('stop')}`)}
${engagementMarkup(copy.engagement)}
${section('start','10 / Your next step','Start with the priority—not<br>a bigger to-do list.',`<div class="c4-two-column"><div><p>${esc(copy.en.explanation)}</p><p>Start with a free Growth Score. When an actionable priority is verified, the <a href="/sprint/">30-Day Growth Sprint</a> implements the agreed work for <span data-cae-sprint-price>$2,500</span>. Continued <a href="/growth-system/">Growth System</a> ownership is optional and uses a separate annual agreement.</p><p class="c4-caption">The Sprint is a focused implementation scope, not every channel and location rebuilt in 30 days. A separate <a href="/lead-to-revenue-check/">$500 Lead-to-Revenue Check</a> can clarify unresolved questions after an inquiry; it is not a mandatory step.</p></div><div class="c4-hero-actions">${cta('connect4-final')}<p class="c4-caption">Tell us your name and email.<br>We will reply with the next step.</p><button type="button" class="c4-link c4-question" data-cae-question data-cae-intent="connect4_question">Ask a question</button></div></div>`,'c4-soft')}
<section id="questions" class="c4-section" aria-labelledby="questions-title"><div class="c4-wrap"><div class="c4-section-heading"><p class="c4-label">Questions</p><h2 id="questions-title">Before we start.</h2></div><div class="c4-faq">${faq.map(([q,a])=>`<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('')}</div></div></section>
<noscript><p class="c4-wrap c4-after">JavaScript is needed to open the request form. You can still read this page and visit <a href="/support/">Support</a>.</p></noscript>
</main>
${footer}
<script src="/assets/js/caesthetic-pricing.generated.js"></script><script src="/assets/js/caesthetic-config.js"></script><script src="/assets/js/caesthetic.js" defer></script><script src="/assets/js/analytics.js" defer></script>`;
  return `<!doctype html>\n<html lang="en-US" data-page="connect4"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>How Connect4 Works — CAESTHETIC</title><meta name="description" content="Connect4 connects Search &amp; Maps, Website, Social, and Reviews &amp; Reputation. See what we build, how we implement it, and what your team keeps."><link rel="canonical" href="https://caesthetic.com/connect4/"><meta property="og:type" content="website"><meta property="og:title" content="How Connect4 Works — CAESTHETIC"><meta property="og:description" content="A marketing foundation you own—and your team can run."><meta property="og:url" content="https://caesthetic.com/connect4/"><meta property="og:image" content="https://caesthetic.com/assets/brand/logo-square.png"><link rel="icon" href="/assets/brand/favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/assets/css/caesthetic.css"><link rel="stylesheet" href="/assets/css/connect4.css"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:'How Connect4 Works',url:'https://caesthetic.com/connect4/',description:copy.en.definition,isPartOf:{'@type':'WebSite',name:'CAESTHETIC',url:'https://caesthetic.com/'}})}</script><link rel="stylesheet" href="/assets/css/point-of-contact.css">
<link rel="stylesheet" href="/assets/css/caesthetic-impeccable.css">
</head><body class="connect4-page">${body}</body></html>\n`;
}
export function build(check=false) {
  const md=read(SSOT); const copy=getCopy(md);
  const outputs=new Map();
  const oldFooter=read('site-caesthetic/templates/footer.html');
  const footer=oldFooter.includes('href="/connect4/"')?oldFooter:oldFooter.replace('<a href="/growth-score/">Free Growth Score</a>','<a href="/connect4/">How Connect4 works</a>\n        <a href="/growth-score/">Free Growth Score</a>');
  outputs.set('site-caesthetic/templates/footer.html',footer);
  const header=read('site-caesthetic/templates/header.html');
  outputs.set('site-caesthetic/connect4/index.html',render(copy,header,footer));
  outputs.set('site-caesthetic/assets/data/connect4-copy.generated.json',JSON.stringify(copy,null,2)+'\n');
  const registry=JSON.parse(read('site-caesthetic/media/registry.json'));
  for(const image of IMAGES){
    const bytes=fs.readFileSync(path.join(ROOT,image.source));
    if(hash(bytes)!==image.sha256) throw new Error(`Approved PNG changed: ${image.source}`);
    outputs.set('site-caesthetic'+image.src,bytes);
    registry.entries[image.id]={media_id:image.id,src:image.src,type:'image',kind:'approved-conceptual-illustration',state:'approved',purpose:`Owner-provided ${image.role} conceptual illustration; approved for Connect4 by the 2026-09-05 instruction, not client evidence.`,alt:`Connect4 ${image.role} illustration in ${image.format} format.`,width:image.width,height:image.height,sha256:image.sha256,format:image.format,source:image.source,rights:{status:'approved',source:SSOT+'#connect4-engagement-path',approval:image.approval||'Owner instruction 2026-09-05T14:18:08Z'},consent:{required:false,status:'not_required'},allowed_channels:['public','local','protected-preview'],allowed_routes:['/connect4/'],transformations:'none; original bytes locked'};
  }
  registry.updated='2026-09-05';
  outputs.set('site-caesthetic/media/registry.json',JSON.stringify(registry,null,2)+'\n');
  const sitemapPath='site-caesthetic/sitemap.xml';
  if(fs.existsSync(path.join(ROOT,sitemapPath))){let xml=read(sitemapPath); if(!xml.includes('https://caesthetic.com/connect4/')) xml=xml.replace('</urlset>','  <url><loc>https://caesthetic.com/connect4/</loc></url>\n</urlset>'); outputs.set(sitemapPath,xml);}
  for(const [name,data] of outputs){const full=path.join(ROOT,name); const expected=Buffer.isBuffer(data)?data:Buffer.from(data); if(check){if(!fs.existsSync(full)||!fs.readFileSync(full).equals(expected))throw new Error(`Generated output drift: ${name}`);}else{fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,expected);}}
  console.log(JSON.stringify({status:'PASS',mode:check?'check':'build',contract:CONTRACT,output_files:[...outputs.keys()],published_image_pairs:4,owner_images:IMAGES.length,remaining_image_pairs:[]},null,2));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) build(process.argv.includes('--check'));
