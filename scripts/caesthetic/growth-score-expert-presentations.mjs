import fs from 'node:fs';
import {validateV6Content, renderClientV6Report, V6_UI} from './growth-score-client-v6.mjs';

export const CLIENT_V61 = 'growth-score-client/v6.1.0';
export const CLIENT_V62 = 'growth-score-client/v6.2.0';
export const EXPERT_PROFILES = Object.freeze([CLIENT_V61, CLIENT_V62]);
const css = fs.readFileSync(new URL('./report-expert/expert.css', import.meta.url), 'utf8');
const additions = fs.readFileSync(new URL('./report-expert/interaction.css', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('./report-expert/client.mjs', import.meta.url), 'utf8');
const pricing = fs.readFileSync(new URL('../../site-caesthetic/src/config/pricing.ts', import.meta.url), 'utf8');
const price = key => {
  const value = pricing.match(new RegExp(`\\b${key}:\\s*([0-9.]+)`));
  if (!value) throw new TypeError(`Canonical price missing: ${key}`);
  return `$${new Intl.NumberFormat('en-US').format(Number(value[1]))}`;
};
const sprintMode = pricing.match(/\bgrowthSprintPricing:\s*"([^"]+)"/);
if (!sprintMode || sprintMode[1] !== 'scoped_to_work_required') {
  throw new TypeError('Canonical Sprint pricing must be scoped_to_work_required');
}
const sprintLabel = 'price confirmed after scope review';
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p = value => `<p>${e(value)}</p>`;
const surfaceIds = ['search', 'website', 'social', 'reputation'];

export function createExpertContent() {
  return {
    diagnosis_title: null, diagnosis: null,
    platforms: surfaceIds.map(surface_id => ({surface_id, title:null, headline:null, observation:null, implication:null, action:null, evidence_refs:[], screenshot:null})),
    services: null, pricing: null, education: null, review_response: null,
    risks: [],
    before_after: [1,2,3].map(() => ({gap_id:null, before:null, after:null, verification:null, evidence_refs:[]})),
    sources: [],
  };
}

function required(value, field) {
  if (typeof value !== 'string' || !value.trim() || /__[A-Z_]+__|\{\{/.test(value)) throw new TypeError(`expert.${field} must be completed`);
}

function safeUrl(value, {image=false}={}) {
  required(value, 'url');
  if (/\s|[<>"'\\]/.test(value)) throw new TypeError('Unsafe evidence URL');
  if (/^https:\/\//.test(value)) {
    const u = new URL(value);
    if (u.username || u.password) throw new TypeError('Credentials are not allowed in evidence URLs');
    return e(value);
  }
  if (image && /^(?:\.\/|\.\.\/|\/(?!\/))[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/.test(value)) return e(value);
  throw new TypeError('Evidence links must use HTTPS; screenshot paths may be local');
}

export function validateExpertContent(m, x) {
  validateV6Content(m);
  if (m.locale !== 'ru') throw new TypeError('Expert presentations currently support Russian only');
  if (!x) throw new TypeError('presentation.expert is required');
  ['diagnosis_title','diagnosis','services','pricing','education','review_response'].forEach(k => required(x[k], k));
  if (!Array.isArray(x.sources) || !x.sources.length) throw new TypeError('Expert sources are required');
  const known = new Set();
  for (const s of x.sources) {
    ['id','title','url','checked_at'].forEach(k => required(s[k], `sources.${k}`));
    if (known.has(s.id)) throw new TypeError('Duplicate evidence source');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked_at) || !Number.isFinite(Date.parse(s.checked_at))) throw new TypeError('Source date must be ISO');
    safeUrl(s.url); known.add(s.id);
  }
  const refs = item => {
    if (!Array.isArray(item.evidence_refs) || !item.evidence_refs.length || item.evidence_refs.some(id => !known.has(id))) throw new TypeError('Expert evidence references must resolve to sources');
  };
  if (!Array.isArray(x.platforms) || x.platforms.length !== 4 || x.platforms.some((s,i) => s.surface_id !== surfaceIds[i])) throw new TypeError('Expert needs the four canonical surfaces in order');
  for (const s of x.platforms) {
    ['title','headline','observation','implication','action'].forEach(k => required(s[k], `platform.${k}`)); refs(s);
    if (s.screenshot) {
      const shot=s.screenshot;
      ['src','alt','caption','evidence_ref'].forEach(k => required(shot[k], `screenshot.${k}`));
      safeUrl(shot.src, {image:true});
      if (!s.evidence_refs.includes(shot.evidence_ref)) throw new TypeError('Screenshot must resolve to its platform evidence');
    }
  }
  if (!Array.isArray(x.before_after) || x.before_after.length !== 3 || x.before_after.some((row,i) => row.gap_id !== m.plan[i].id)) throw new TypeError('Before/after must follow the same ordered Top 3');
  for (const row of x.before_after) {['before','after','verification'].forEach(k => required(row[k], `before_after.${k}`)); refs(row);}
  if (!Array.isArray(x.risks)) throw new TypeError('risks must be an array');
  for (const row of x.risks) {['observation','meaning','action'].forEach(k=>required(row[k],`risk.${k}`)); refs(row);}
  [...m.questions,...m.plan].forEach(refs);
  return x;
}

export function expertDocument(model, expert, {version='v6.2', preview=false, notice=''}={}) {
  const contracts={'v6.1':CLIENT_V61,'v6.2':CLIENT_V62};
  if (!contracts[version]) throw new TypeError('Unknown Expert presentation');
  const m=model, x=validateExpertContent(m,expert), u=V6_UI.ru;
  const sprint=sprintLabel, checkPrice=price('leadToRevenueCheckUsd');
  const sources=refs=>`<div class="evidence-links">${refs.map(id=>{const s=x.sources.find(s=>s.id===id);return `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)}</a><span> · ${e(s.checked_at)}</span>`;}).join('<br>')}</div>`;
  const question=(q, compact=false)=>`${p(q.observation)}${p(q.why)}${compact?'':p(q.change)}${sources(q.evidence_refs)}<details class="expert-details"><summary>Обоснование и проверка</summary>${p(q.criterion)}${p(q.departure)}${p(q.verification)}</details>`;
  const platforms=x.platforms.map(s=>`<article class="platform-panel"><div class="platform-bar"><div class="left"><strong>${e(s.title)}</strong><span>${e(s.headline)}</span></div></div><div class="platform-body${!s.screenshot&&!preview?' without-shot':''}"><div class="platform-copy"><h3>${e(s.headline)}</h3><div class="platform-note">${sources(s.evidence_refs)}</div><ul><li><strong>Что увидели:</strong> ${e(s.observation)}</li><li><strong>Почему важно:</strong> ${e(s.implication)}</li></ul><div class="platform-summary">${e(s.action)}</div></div>${s.screenshot?`<figure class="platform-shot"><img src="${safeUrl(s.screenshot.src,{image:true})}" alt="${e(s.screenshot.alt)}" loading="lazy" decoding="async"><figcaption>${e(s.screenshot.caption)}</figcaption></figure>`:preview?'<div class="platform-shot evidence-slot"><p>Скриншот источника</p><span>В готовом отчёте здесь размещается подтверждение наблюдения.</span></div>':''}</div></article>`).join('');
  const beforeAfter=`<p class="expert-caption">«После» показывает согласованный результат работы. Это план, пока исправление не проверено.</p><div class="table-wrap" tabindex="0" role="region" aria-label="Сейчас и после изменений"><table><thead><tr><th scope="col">Сейчас</th><th scope="col">После изменений</th><th scope="col">Как проверим</th></tr></thead><tbody>${x.before_after.map(r=>`<tr><td>${e(r.before)}${sources(r.evidence_refs)}</td><td>${e(r.after)}</td><td>${e(r.verification)}</td></tr>`).join('')}</tbody></table></div>`;
  const plan=m.plan.map((r,i)=>`<div class="expert-plan"><h3>${i+1}. ${e(r.title)}</h3><p><strong>Результат:</strong> ${e(r.result)}</p><p><strong>Готово, когда:</strong> ${e(r.done_when)}</p><details class="expert-details"><summary>Состав работ</summary>${p(r.materials)}${sources(r.evidence_refs)}</details></div>`).join('');
  const check=placement=>`<aside class="expert-check" data-check500-placement="${placement}"><h3>Проверка пути от обращения до оплаты · ${e(checkPrice)}</h3>${p('Отдельный необязательный шаг при согласованном доступе к данным.')}<a class="expert-button secondary" href="https://caesthetic.com/lead-to-revenue-check/">Начать с проверки →</a></aside>`;
  const intake=m.intake_body.map(p).join('')+`<details class="expert-details"><summary>Что потребуется для проверки</summary>${p(m.intake_details)}</details>`+check('mid_report');
  const terms=(m.commercial.continuation==='scoped-below-sprint'?u.spokenTerms:u.standardTerms);
  const offer=`${p(m.offer_body)}<div class="expert-price">${e(sprint)} · 30 дней</div>${p(m.coordination)}${p(terms)}${m.commercial.included_check?p(u.included):''}<a class="expert-button" data-expert-sprint href="https://caesthetic.com/sprint/${m.commercial.offer_id?'?offer='+encodeURIComponent(m.commercial.offer_id):''}">Перейти к реализации плана →</a>${m.commercial.credit?p(u.credit):''}${check('final_alternative')}<details class="expert-details"><summary>Что произойдёт дальше</summary>${m.limitations.map(p).join('')}</details>`;
  const risks=x.risks.length?`<div class="table-wrap" tabindex="0" role="region" aria-label="Риски выбора"><table><thead><tr><th>Наблюдение</th><th>Что это значит для клиента</th><th>Изменение</th></tr></thead><tbody>${x.risks.map(r=>`<tr><td>${e(r.observation)}${sources(r.evidence_refs)}</td><td>${e(r.meaning)}</td><td>${e(r.action)}</td></tr>`).join('')}</tbody></table></div>`:p('Дополнительные риски не установлены.');
  const questions=`<div class="expert-questions">${m.questions.map(q=>`<details class="expert-question"><summary><h3>${e(q.title)}</h3><span>${e(q.summary)}</span></summary><div>${question(q)}</div></details>`).join('')}</div>`;
  const classic=[
    ['diagnosis','Главный диагноз',p(x.diagnosis)],
    ['journey','Что клиенту нужно понять до обращения',m.synthesis_body.map(p).join('')+'<h3>Сравнение с альтернативами</h3>'+question(m.questions[3])],
    ['platforms','Подробный разбор площадок',platforms,'card-breakdown'],
    ['website','Сайт и первый шаг',question(m.questions[0])],
    ['services','Приоритетные услуги и вопросы клиента',p(x.services)],
    ['provider','Специалист как основание доверия',question(m.questions[1])],
    ['prices','Цена и условия первого визита',p(x.pricing)],
    ['education','Материалы, которые помогают принять решение',p(x.education)],
    ['reviews','Что говорят отзывы',question(m.questions[2])],
    ['risks','Что может мешать выбору',risks],
    ['responses','Как клинике отвечать на отзывы',p(x.review_response)],
    ['after-enquiry','Что происходит после обращения',intake],
    ['plan','Что мы берём на себя',plan],
    ['before-after','До / После',beforeAfter],
    ['next-step','Первый шаг',offer],
    ['conclusion','Финальный вывод',p(x.diagnosis)+p(m.defer)+sources(x.sources.map(s=>s.id))],
  ];
  const mixed=[
    ['four-questions','Четыре вопроса при выборе клиники',p(m.questions_intro)+questions],
    ['platforms','На чём основаны выводы',platforms,'card-breakdown'],
    ['before-after','До / После',beforeAfter],
    ['plan','Что сделаем за 30 дней',p(m.plan_intro)+plan+`<details class="expert-details"><summary>Какие расходы пока отложить</summary>${p(m.defer)}</details>`],
    ['after-enquiry',m.intake_title,intake],
    ['next-step','Кто выполнит изменения',offer],
  ];
  const sections=version==='v6.1'?classic:mixed;
  const navItems=version==='v6.1'?sections:sections.filter(s=>['four-questions','platforms','before-after','plan','next-step'].includes(s[0]));
  return `<!doctype html>
<html lang="ru" data-page="growth-score-report" data-layout-contract="${contracts[version]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${e(m.business_name)} · ${version} · CAESTHETIC</title><style>${css}</style><style>${additions}</style></head>
<body><a class="expert-skip" href="#report">Перейти к отчёту</a><button class="print-btn" type="button" data-expert-print>Печать / PDF</button><main class="wrap" id="report">
<header class="hero"><div class="pill">${preview?'Шаблон · пример заполнения':'Индивидуальный аудит'}</div><div><div class="eyebrow">CAESTHETIC · ${version}</div><h1>${e(version==='v6.1'?'Стратегия системного роста '+m.business_name:m.business_name)}</h1></div><p class="lead">${e(m.summary)}</p><div class="forbox"><h3>${e(m.greeting)}</h3>${p(m.address)}${p(m.research_date)}${notice?p(notice):''}${preview?p('Учебные данные для сравнения представлений. Не аудит действующей клиники.'):''}<cite>Валерия Петра · CAESTHETIC</cite></div></header>
<nav class="nav" aria-label="Разделы отчёта">${navItems.map(s=>`<a href="#${s[0]}">${e(s[1])}</a>`).join('')}</nav><div class="highlight"><h2>${e(x.diagnosis_title)}</h2>${p(x.diagnosis)}</div>
${sections.map(([id,title,body,cls],i)=>`<section class="${cls||'section'}" id="${id}"><div class="section-kicker">${String(i+1).padStart(2,'0')}</div><h2>${e(title)}</h2>${body}</section>`).join('\n')}
<footer class="footer"><span>Валерия Петра · CAESTHETIC</span><span>${version} · ${e(m.research_date)}</span><a href="mailto:info@caesthetic.com">Задать вопрос</a></footer></main><script type="module">${client}</script></body></html>\n`;
}

export function renderExpertReport(report) {
  const contract=report.presentation?.layout_contract;
  if (!EXPERT_PROFILES.includes(contract)) throw new TypeError('Unknown Expert layout contract');
  // Reuse the established identity, selected-gap and evidence checks without changing the v6 adapter.
  renderClientV6Report(report);
  const m=report.presentation.v6, x=validateExpertContent(m,report.presentation.expert);
  const known=new Set();
  const collect=value=>{
    if (!value || typeof value!=='object') return;
    for(const [key,child] of Object.entries(value)) {
      if(key==='presentation') continue;
      if(key==='evidence_refs' && Array.isArray(child)) child.forEach(id=>known.add(id));
      else collect(child);
    }
  };
  collect(report);
  if (x.sources.some(s=>s.id.startsWith('source-export:')||!known.has(s.id))) throw new TypeError('Expert sources must resolve to the underlying report');
  return expertDocument(m,x,{version:contract===CLIENT_V61?'v6.1':'v6.2',notice:report.disclosure});
}
