import fs from 'node:fs';

export const CLIENT_V6 = 'growth-score-client/v6.0.0';
const asset = name => fs.readFileSync(new URL(`./report-v6/${name}`, import.meta.url));
const css = `${asset('tokens.css')}\n${asset('layout.css')}`;
const client = asset('client.mjs').toString();
const logo = `data:image/png;base64,${asset('logo.png').toString('base64')}`;
const pricingSource=fs.readFileSync(new URL('../../site-caesthetic/src/config/pricing.ts',import.meta.url),'utf8');
const amount=key=>{
  const match=pricingSource.match(new RegExp(`\\b${key}:\\s*([0-9.]+)`));
  if(!match) throw new Error(`Canonical price missing: ${key}`);
  return Number(match[1]);
};
const sprintMode=pricingSource.match(/\bgrowthSprintPricing:\s*"([^"]+)"/);
if (!sprintMode || sprintMode[1] !== 'scoped_to_work_required') {
  throw new Error('Canonical Sprint pricing must be scoped_to_work_required');
}
const usd=value=>`$${new Intl.NumberFormat('en-US').format(value)}`;
const checkAmount=amount('leadToRevenueCheckUsd');
const SPRINT_LABEL={ru:'price confirmed after scope review',en:'price confirmed after scope review'};
const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');

export const V6_UI = Object.freeze({
  ru: {
    score:'Оценка роста', public:'Публичные наблюдения', author:'Валерия Петра · CAESTHETIC',
    share:'Поделиться отчётом', copied:'Ссылка скопирована', shared:'Отчёт отправлен', manual:'Скопируйте ссылку из поля.',
    unpublished:'У этого предпросмотра ещё нет опубликованной ссылки.', link:'Ссылка на отчёт', skip:'Перейти к отчёту', days:'30 дней', proposalLabel:'Привести маркетинг в порядок', planLink:'Посмотреть план от Caesthetic →',
    shortPlan:'Посмотреть план →', questions:'Четыре вопроса при выборе клиники', observation:'Что увидели.',
    why:'Почему это важно при выборе.', change:'Что изменить.', verification:'Как проверить исправление.',
    criteria:'Критерий и обнаруженное отклонение', criterion:'Как должно быть устроено.', departure:'Где есть отклонение.',
    conclusion:'И сделали выводы', plan:'Что сделаем за 30 дней', result:'Результат:', done:'Готово, когда:',
    materials:'Состав материалов', defer:'Какие расходы пока отложить', intakeDetails:'Детали проверки и границы данных',
    check:'Хотите сначала проверить путь от обращения до оплаты? Начните с Check за $500.', checkButton:'Начать с проверки →',
    included:'Для этого предложения Lead-to-Revenue Check уже включён в Sprint — отдельно оплачивать его не нужно.',
    who:'Кто выполнит изменения', terms:'Условия оплаты', sprint:'Перейти к реализации плана →',
    standardTerms:'Цена Sprint на 30 дней подтверждается после согласования объёма. Точный объём и дату старта фиксируем до начала работы. Дальнейшее сопровождение необязательно; его объём и условия согласуются отдельно.',
    spokenTerms:'price confirmed after scope review за Sprint на 30 дней. Дальнейшее сопровождение — по желанию, по отдельному ежемесячному тарифу ниже стоимости Sprint. Объём и цену согласуем по итогам первых 30 дней.',
    credit:'Можно начать с Check за $500. Если сразу после него вы переходите к согласованному Sprint, зачтём оплату полностью — останется доплатить $2,000. Зачёт подтверждает менеджер.',
    question:'Задать вопрос', preview:'Дизайн-референс: содержание из макета, без новой публикации или утверждения исследования.',
  },
  en: {
    score:'Growth Score', public:'Public observations', author:'Valerie Petra · CAESTHETIC',
    share:'Share report', copied:'Link copied', shared:'Report shared', manual:'Copy the link from the field.',
    unpublished:'This preview does not have a published link yet.', link:'Report link', skip:'Skip to report', days:'30 days', proposalLabel:'Get your marketing in order', planLink:'View the plan from Caesthetic →',
    shortPlan:'View the plan →', questions:'Four questions when choosing a practice', observation:'What we observed.',
    why:'Why it matters when choosing.', change:'What to change.', verification:'How to verify the change.',
    criteria:'Criterion and observed gap', criterion:'What should be clear.', departure:'Where the gap is.',
    conclusion:'Our conclusions', plan:'What we will do in 30 days', result:'Deliverable:', done:'Done when:',
    materials:'Materials included', defer:'Which expenses to defer for now', intakeDetails:'Check details and data boundaries',
    check:'Would you like to check the path from enquiry to payment first? Start with Check for $500.', checkButton:'Start with a Check →',
    included:'This offer already includes the Lead-to-Revenue Check in the Sprint; no separate payment is needed.',
    who:'Who will implement the changes', terms:'Payment terms', sprint:'Put the plan into action →',
    standardTerms:'Sprint price is confirmed after we agree the 30-day scope and start date. Continued support is optional; its scope and terms are agreed separately.',
    spokenTerms:'price confirmed after scope review for a 30-day Sprint. Continued support is optional, at a separate monthly fee below the Sprint price. We will agree the scope and price after the first 30 days.',
    credit:'You can start with Check for $500. If you move directly from it to an agreed Sprint, we credit the full payment, leaving $2,000 to pay. A manager confirms the credit.',
    question:'Ask a question', preview:'Design reference: content from the mockup, without a new publication or research approval.',
  },
});

const QUESTION_FIELDS = ['title','summary','observation','why','change','verification','criterion','departure'];
const PLAN_FIELDS = ['title','result','done_when','materials'];
const TOP_FIELDS = ['business_name','address','research_date','greeting','summary','proposal_title','proposal_summary','questions_intro','synthesis_title','plan_intro','defer','intake_title','intake_details','offer_title','offer_body','coordination'];
const text = (value, key) => {
  if (typeof value !== 'string' || !value.trim() || /__[A-Z_]+__/.test(value)) throw new TypeError(`v6.${key} must be completed`);
};
const list = (items, key, length) => {
  if (!Array.isArray(items) || !items.length || (length && items.length !== length)) throw new TypeError(`v6.${key} has invalid length`);
};

export function createV6Content(locale = 'en') {
  if (!V6_UI[locale]) throw new TypeError('v6 supports ru and en');
  return {
    locale, ...Object.fromEntries(TOP_FIELDS.map(key => [key, null])),
    questions: ['offer','provider','reviews','competitors'].map(id => ({id,...Object.fromEntries(QUESTION_FIELDS.map(key => [key,null])),evidence_refs:[]})),
    synthesis_body: [], plan: [1,2,3].map(() => ({id:null,...Object.fromEntries(PLAN_FIELDS.map(key => [key,null])),evidence_refs:[]})),
    intake_body: [], surfaces: [], limitations: [],
    commercial: {offer_id:null,included_check:false,continuation:'separate',credit:false},
  };
}

export function validateV6Content(m) {
  if (!m || !V6_UI[m.locale]) throw new TypeError('v6 supports ru and en');
  TOP_FIELDS.forEach(key => text(m[key],key));
  for (const [key,fields,count] of [['questions',QUESTION_FIELDS,4],['plan',PLAN_FIELDS,3]]) {
    list(m[key],key,count);
    if (new Set(m[key].map(item=>item.id)).size !== count) throw new TypeError(`v6.${key} ids must be unique`);
    m[key].forEach((item,index) => {
      text(item.id,`${key}.${index}.id`);
      fields.forEach(field => text(item[field],`${key}.${index}.${field}`));
      list(item.evidence_refs,`${key}.${index}.evidence_refs`);
      item.evidence_refs.forEach(ref=>text(ref,'evidence_ref'));
    });
  }
  for (const key of ['synthesis_body','intake_body','limitations']) {list(m[key],key);m[key].forEach(item=>text(item,key));}
  list(m.surfaces,'surfaces',4);m.surfaces.forEach(item=>{text(item.title,'surface.title');text(item.body,'surface.body');});
  const c=m.commercial;
  if (!c || ![null,'spoken-four-surface-sprint-v1'].includes(c.offer_id)) throw new TypeError('Unknown commercial offer');
  if (typeof c.included_check!=='boolean' || typeof c.credit!=='boolean' || !['separate','scoped-below-sprint'].includes(c.continuation)) throw new TypeError('Invalid commercial options');
  if (c.offer_id==='spoken-four-surface-sprint-v1' && !['Private Aesthetic Practice','частная эстетическая клиника'].includes(m.business_name)) throw new TypeError('Scoped offer cannot be reused for another practice');
  if ((c.included_check || c.credit || c.continuation==='scoped-below-sprint') && c.offer_id!=='spoken-four-surface-sprint-v1') throw new TypeError('Custom commercial terms require their scoped offer');
  return m;
}

export function clientV6Document(model, {notice = '', publicAssets = false} = {}) {
  const m=validateV6Content(model), c=m.commercial;
  const prices={sprint:SPRINT_LABEL[m.locale],check:usd(checkAmount)};
  const u=Object.fromEntries(Object.entries(V6_UI[m.locale]).map(([key,value])=>[key,value.replaceAll('$500',prices.check)]));
  const p=value=>`<p>${e(value)}</p>`;
  const label=(key,value)=>`<p><strong>${e(u[key])}</strong> ${e(value)}</p>`;
  const share=()=>`<button type="button" class="v6-button" data-v6-share>${e(u.share)}</button>`;
  const included=()=>c.included_check?`<div class="v6-included">${p(u.included)}</div>`:'';
  const check=placement=>`<aside class="v6-check" data-check500-placement="${placement}">${p(u.check)}<a class="v6-button v6-button-secondary" href="https://caesthetic.com/lead-to-revenue-check/">${e(u.checkButton)}</a></aside>`;
  const more=(title,body)=>`<details class="v6-more"><summary>${e(title)}</summary>${p(body)}</details>`;
  const sprintUrl='https://caesthetic.com/sprint/'+(c.offer_id?`?offer=${encodeURIComponent(c.offer_id)}`:'');
  return `<!doctype html>
<html lang="${m.locale}" data-page="growth-score-report" data-layout-contract="${CLIENT_V6}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${e(m.business_name)} · ${e(u.score)} · CAESTHETIC</title>${publicAssets?'<link rel="stylesheet" href="/assets/css/tokens.css"><link rel="stylesheet" href="/assets/css/growth-score-v6.css">':`<style>${css}</style>`}</head>
<body><a class="v6-skip" href="#report">${e(u.skip)}</a>
<header class="v6-header"><div class="v6-wrap"><img class="v6-logo" src="${publicAssets?'/assets/brand/report-v6-logo.png':logo}" width="34" height="34" alt="CAESTHETIC"><span class="v6-kicker v6-mono">${e(u.public)} · ${e(m.research_date)}</span></div></header>
<main id="report">
<section class="v6-section v6-hero v6-soft"><div class="v6-wrap">
<p class="v6-kicker v6-mono">${e(u.score)} · ${e(m.research_date)}</p><h1>${e(m.business_name)}</h1><p class="v6-muted v6-address">${e(m.address)}</p>
<p class="v6-greeting">${e(m.greeting)}</p><p class="v6-lead">${e(m.summary)}</p>${notice?`<p class="v6-muted">${e(notice)}</p>`:''}
<div class="v6-byline"><cite>${e(u.author)}</cite>${share()}</div>
<p class="v6-share-status" role="status" aria-live="polite" data-v6-share-status></p><input class="v6-share-fallback" data-v6-share-fallback readonly hidden aria-label="${e(u.link)}">
</div></section>
<section class="v6-section" id="proposal"><div class="v6-wrap"><h2>${e(m.proposal_title)}</h2><p class="v6-muted v6-lead">${e(m.proposal_summary)}</p>
<div class="v6-offer-strip"><div><p class="v6-price">${e(u.days)} · ${e(prices.sprint)}</p><p class="v6-subprice">${e(u.proposalLabel)}</p></div><a class="v6-button v6-button-light" href="#next-step" data-v6-offer>${e(u.planLink)}</a></div></div></section>
<section class="v6-section" id="four-questions"><div class="v6-wrap"><h2 class="v6-kicker v6-question-label">${e(u.questions)}</h2><p class="v6-muted">${e(m.questions_intro)}</p><div class="v6-questions">
${m.questions.map((q,i)=>`<details class="v6-question" id="question-${i+1}"><summary><h3><span>${i+1} / 4 · ${e(q.title)}</span><small>${e(q.summary)}</small></h3></summary><div class="v6-detail">${['observation','why','change','verification'].map(key=>label(key,q[key])).join('')}<div class="v6-inset"><p class="v6-kicker">${e(u.criteria)}</p>${label('criterion',q.criterion)}${label('departure',q.departure)}</div></div></details>`).join('\n')}
</div><div class="v6-synthesis"><p class="v6-kicker v6-question-label">${e(u.conclusion)}</p><h3>${e(m.synthesis_title)}</h3>${m.synthesis_body.map(p).join('')}</div></div></section>
<section class="v6-section v6-soft" id="plan"><div class="v6-wrap"><h2>${e(u.plan)}</h2><p class="v6-muted">${e(m.plan_intro)}</p><div class="v6-plan">
${m.plan.map((item,i)=>`<article class="v6-plan-item"><p class="v6-kicker v6-mono">0${i+1}</p><h3>${e(item.title)}</h3>${label('result',item.result)}${label('done',item.done_when)}${more(u.materials,item.materials)}</article>`).join('\n')}
</div>${more(u.defer,m.defer)}</div></section>
<section class="v6-section" id="after-enquiry"><div class="v6-wrap"><h2>${e(m.intake_title)}</h2>${m.intake_body.map(p).join('')}${included()}${more(u.intakeDetails,m.intake_details)}${check('internal-conversion')}</div></section>
<section class="v6-section v6-dark" id="next-step"><div class="v6-wrap"><p class="v6-kicker">${e(u.who)} · 30-Day Growth Sprint</p><h2 class="v6-final-title">${e(m.offer_title)}</h2><p class="v6-price">${e(prices.sprint)} · ${e(u.days)}</p>${p(m.offer_body)}
<div class="v6-surfaces">${m.surfaces.map(s=>`<div class="v6-surface"><h3>${e(s.title)}</h3>${p(s.body)}</div>`).join('')}</div>
${c.included_check?p(u.included):''}${p(m.coordination)}<div class="v6-terms"><h3>${e(u.terms)}</h3>${p(c.continuation==='scoped-below-sprint'?u.spokenTerms:u.standardTerms)}</div>
<a class="v6-button v6-button-primary" href="${e(sprintUrl)}" data-v6-sprint>${e(u.sprint)}</a>${c.credit?`<p class="v6-credit">${e(u.credit)}</p>`:''}${check('final-offer')}<div class="v6-limits">${m.limitations.map(p).join('')}</div></div></section>
</main><footer class="v6-footer"><div class="v6-wrap"><span>CAESTHETIC · v6 · ${e(m.research_date)}</span><a class="v6-button" href="mailto:info@caesthetic.com">${e(u.question)}</a>${share()}</div></footer>
<nav class="v6-sticky" data-v6-sticky hidden aria-label="${e(u.who)}"><span class="v6-mono">Sprint · ${e(prices.sprint)}</span><a class="v6-button v6-button-light" href="#next-step">${e(u.shortPlan)}</a></nav>
<script id="v6-ui" type="application/json">${json({copied:u.copied,shared:u.shared,manual:u.manual,unpublished:u.unpublished})}</script>${publicAssets?'<script type="module" src="/assets/js/growth-score-v6.js"></script>':`<script type="module">${client}</script>`}</body></html>\n`;
}

export function renderClientV6Report(report) {
  if (report.audit?.format==='multi_location') throw new TypeError('v6 single-location profile cannot replace a network report');
  const m=validateV6Content(report.presentation.v6);
  const locale=report.reportContext?.report_locale==='en-US'?'en':report.reportContext?.report_locale;
  if (m.locale!==locale || m.business_name!==report.practice.name) throw new TypeError('v6 content does not match the report identity/locale');
  const selected=[report.humanDiagnosis.focus_selection.primary_gap_id,...report.humanDiagnosis.focus_selection.supporting_gap_ids];
  if (m.plan.some((item,i)=>item.id!==selected[i])) throw new TypeError('v6 plan must follow the existing approved Primary and two Supporting gaps');
  const knownRefs=new Set();
  const collect=value=>{
    if (!value || typeof value!=='object') return;
    for (const [key,child] of Object.entries(value)) {
      if (key==='presentation') continue;
      if (key==='evidence_refs' && Array.isArray(child)) child.forEach(ref=>knownRefs.add(ref));
      else collect(child);
    }
  };
  collect(report);
  for (const item of [...m.questions,...m.plan]) for (const ref of item.evidence_refs) {
    if (ref.startsWith('source-export:') || !knownRefs.has(ref)) throw new TypeError('v6 evidence references must resolve to the underlying report');
  }
  return clientV6Document(m,{notice:report.disclosure,publicAssets:report.presentation.v6_public_assets===true});
}
