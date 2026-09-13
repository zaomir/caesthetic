#!/usr/bin/env node
/** Public partnership copy is owned here. Generated HTML must stay reproducible. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'scripts/caesthetic/partnerships');
const copy = {
 ru: {
  title: 'Партнёрства брендов — CAESTHETIC',
  description: 'CAESTHETIC подбирает релевантные бренды и организует совместные кампании, рассылки и мероприятия для привлечения клиентов и публичности.',
  tag: 'Партнёрства брендов', home: 'На главную', skip: 'К содержанию', language: 'Язык страницы',
  kicker: 'CAESTHETIC Partnerships', headline: 'Новые клиенты. Больше внимания к вашему бренду.',
  intro: 'Объединяем компании, которым полезна аудитория друг друга. Организуем совместные кампании, взаимные рассылки и мероприятия — от подбора участников до отчёта о результатах.',
  cta: 'Обсудить партнёрство', formatsLink: 'Посмотреть форматы',
  benefitTitle: 'Что получает ваша компания',
  benefits: [
   ['01 · Привлечение клиентов', 'Ваше предложение — у подходящей аудитории', 'Подбираем бизнесы с пересекающимися интересами клиентов и дополняющими друг друга услугами. Согласуем предложение и размещения в рассылках, приложениях, клубах и других собственных каналах участников.', 'Измеряем: переходы, обращения и покупки, которые можно связать с кампанией.'],
   ['02 · Публичность и контакты', 'Ваш бренд — среди релевантных участников', 'Собираем семинары, встречи, выставки и тематические события. Участие может включать выступление, демонстрацию продукта, стенд или размещение в материалах мероприятия.', 'Измеряем: выполненные размещения, регистрации, посещаемость и согласованные деловые контакты.']
  ],
  formatsTitle: 'Начать можно с одного совместного проекта', examples: 'Примеры форматов, которые можно согласовать. Это не объявления о действующих партнёрствах.',
  formats: [
   ['Совместная кампания', 'Фитнес-клуб + стоматология', 'Фитнес-клуб рассказывает о стоматологической привилегии, клиника — о предложении клуба. У каждой стороны своё предложение, своя рассылка и отдельная ссылка для оценки отклика.'],
   ['Встреча двух организаций', 'Банк + сервисный бизнес', 'Камерный семинар для клиентов или сотрудников банка. Сервисный бизнес делится экспертизой, банк приглашает аудиторию, CAESTHETIC согласует формат и организует подготовку.'],
   ['Многостороннее мероприятие', 'День здоровья с тремя и более организациями', 'Клиники, фитнес, страховые и поставщики могут дополнить программу друг друга. Для спонсоров и экспонентов согласуем платное участие: стенд, выступление, демонстрацию и другие конкретные размещения.']
  ],
  exchangeTitle: 'У каждого участника — понятный вклад', exchangeLead: 'До запуска фиксируем, кто что предоставляет и что получает. Обмен рассылками не означает обмен клиентскими базами.',
  exchange: [['Ваша компания', 'Аудитория, предложение, экспертиза, площадка или бюджет участия. Вы выбираете подходящий вклад.'], ['Другие участники', 'Дополняющие услуги и согласованные каналы продвижения. Состав зависит от цели, города и аудитории.'], ['CAESTHETIC', 'Подбор и переговоры, общие материалы, план запуска, координация и отчёт по согласованным показателям.']],
  scopeTitle: 'Один организатор. Разные рынки и отрасли.', scope: 'CAESTHETIC ведёт взаимодействие с партнёрами в интересах конкретного клиента. В каждом проекте заранее называем заказчика, участников и их роли. Проект может работать без стоматологии и без участия Expert Dental.',
  pilot: 'Первый пилот — Expert Dental в Бишкеке.', pilotLink: 'Посмотреть предложение с Expert Dental',
  moneyTitle: 'Как согласуем коммерческие условия', money: 'Возможны взаимные размещения, отдельная оплата организации кампании и платное участие в мероприятии. Стоимость работы CAESTHETIC, вклад сторон и состав размещений фиксируем до запуска. Взаимная рассылка сама по себе не делает организацию проекта бесплатной.', boundary: 'Мы не гарантируем количество клиентов или продажи. Имена участников, охват и даты публикуем после подтверждения. Абонементы и подарочные привилегии включаем только с согласованным финансированием, условиями и лимитом.',
  stepsTitle: 'Начинаем в переписке', steps: [['Вы оставляете контакт', 'Ответим по электронной почте и уточним компанию, город, аудиторию и задачу.'], ['Предлагаем совместный проект', 'Согласуем участников, предложение, вклад, бюджет и способ измерения результата. При необходимости созвонимся.'], ['Запускаем и сверяем результат', 'Готовим материалы и ссылки, координируем участников и собираем отчёт. Решаем, что повторить или изменить.']],
  requestTitle: 'Какое партнёрство вам интересно?', requestIntro: 'Для первого контакта достаточно имени и электронной почты. Обсудим детали письмом; личная встреча для начала работы не нужна.',
  goal: 'Ваша задача', goals: [['campaign','Привлечь клиентов совместной кампанией'],['event','Участвовать в мероприятии или стать спонсором'],['client','Организовать партнёрский канал для моего бизнеса']],
  name: 'Имя', email: 'Рабочая электронная почта', send: 'Отправить запрос', privacy: 'Используем контакт, чтобы ответить на ваш запрос.', privacyLink: 'Конфиденциальность', fallback: 'Можно написать напрямую:',
  expertContext: 'Запрос о партнёрстве с Expert Dental · Бишкек. Организатор — CAESTHETIC.',
  footer: 'Партнёрства организует CAESTHETIC. Услуги клиентам оказывают соответствующие участники проекта.'
 },
 en: {
  title: 'Brand Partnerships — CAESTHETIC',
  description: 'CAESTHETIC connects relevant brands and organizes joint campaigns, audience communications and events to support customer acquisition and brand visibility.',
  tag: 'Brand partnerships', home: 'Home', skip: 'Skip to content', language: 'Page language',
  kicker: 'CAESTHETIC Partnerships', headline: 'New customers. More visibility for your brand.',
  intro: 'We bring together businesses whose audiences are relevant to each other. We organize joint campaigns, reciprocal communications and events — from participant selection to results reporting.',
  cta: 'Discuss a partnership', formatsLink: 'Explore the formats', benefitTitle: 'What your business gains',
  benefits: [
   ['01 · Customer acquisition', 'Your offer reaches a relevant audience', 'We identify businesses with shared customer interests and complementary services. We agree the offer and placements in newsletters, apps, clubs and other channels owned by participants.', 'We measure: visits, enquiries and purchases that can be attributed to the campaign.'],
   ['02 · Visibility and connections', 'Your brand meets relevant participants', 'We organize seminars, meetings, exhibitions and themed events. Participation can include a speaking slot, product demonstration, exhibition space or placement in event materials.', 'We measure: delivered placements, registrations, attendance and agreed business contacts.']
  ],
  formatsTitle: 'Start with one joint project', examples: 'Illustrative formats to discuss. These are not announcements of active partnerships.',
  formats: [
   ['Joint campaign', 'Fitness club + dental practice', 'The fitness club shares a dental benefit; the practice shares the club’s offer. Each business has its own offer, its own communications and a separate link to measure response.'],
   ['Two-organization event', 'Bank + service business', 'A small seminar for the bank’s customers or employees. The service business brings expertise, the bank invites its audience, and CAESTHETIC agrees the format and coordinates preparation.'],
   ['Multi-party event', 'A health day with three or more organizations', 'Clinics, fitness businesses, insurers and suppliers can contribute complementary content. Paid sponsorship and exhibitor packages can include a stand, talk, demonstration and other specified placements.']
  ],
  exchangeTitle: 'A clear contribution from each participant', exchangeLead: 'Before launch, we agree what each party contributes and receives. Reciprocal communications do not require exchanging customer databases.',
  exchange: [['Your business', 'An audience, an offer, expertise, a venue or a participation budget. Choose a contribution that fits.'], ['Other participants', 'Complementary services and agreed promotional channels. The mix depends on the objective, city and audience.'], ['CAESTHETIC', 'Selection and negotiations, shared materials, launch planning, coordination and reporting against agreed measures.']],
  scopeTitle: 'One organizer. Different markets and industries.', scope: 'CAESTHETIC manages partner relationships on behalf of a specific client. We identify the commissioning client, participants and their roles before each project. Projects can operate outside dentistry and without Expert Dental.',
  pilot: 'Our first pilot is Expert Dental in Bishkek.', pilotLink: 'Explore the Expert Dental proposal (Russian)',
  moneyTitle: 'How commercial terms work', money: 'Options include reciprocal placements, a separate campaign organization fee and paid event participation. We agree CAESTHETIC’s fee, each party’s contribution and the deliverables before launch. Reciprocal communications do not automatically make project organization free.', boundary: 'We do not guarantee customer numbers or sales. Participant names, reach and dates are published after confirmation. Memberships and gift benefits require agreed funding, terms and capacity.',
  stepsTitle: 'Start by email', steps: [['Leave your contact details', 'We reply by email and ask about your business, city, audience and objective.'], ['Agree a joint project', 'We agree participants, the offer, contributions, budget and how results will be measured. A call can help if needed.'], ['Launch and review', 'We prepare materials and links, coordinate participants and compile a report. Together, we decide what to repeat or change.']],
  requestTitle: 'What would you like to work on?', requestIntro: 'Your name and email are enough to start. We will discuss the details by email; no in-person meeting is needed to get started.',
  goal: 'Your objective', goals: [['campaign','Attract customers through a joint campaign'],['event','Join or sponsor an event'],['client','Build a partner channel for my business']],
  name: 'Name', email: 'Work email', send: 'Send request', privacy: 'We use your contact details to respond to your enquiry.', privacyLink: 'Privacy', fallback: 'You can also email us:',
  expertContext: 'Enquiry about an Expert Dental partnership · Bishkek. Organized by CAESTHETIC.',
  footer: 'Partnerships are organized by CAESTHETIC. Services are delivered by the relevant project participants.'
 }
};
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const href = lang => lang === 'ru' ? '/ru/partnerships/' : '/partnerships/';
function central(lang) {
 const c=copy[lang], canonical=`https://caesthetic.com${href(lang)}`;
 return `<!doctype html>
<html lang="${lang}" data-page="partnerships"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin">
<title>${c.title}</title><meta name="description" content="${esc(c.description)}"><link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ru" href="https://caesthetic.com/ru/partnerships/"><link rel="alternate" hreflang="en" href="https://caesthetic.com/partnerships/"><link rel="alternate" hreflang="x-default" href="https://caesthetic.com/partnerships/">
<meta property="og:type" content="website"><meta property="og:title" content="${c.title}"><meta property="og:description" content="${esc(c.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://caesthetic.com/assets/brand/logo-square.png">
<link rel="icon" href="/assets/brand/favicon.png"><link rel="stylesheet" href="/assets/css/caesthetic.css"><link rel="stylesheet" href="/assets/css/caesthetic-impeccable.css"><link rel="stylesheet" href="/assets/css/partnerships.css">
<script src="/assets/js/caesthetic-config.js" defer></script><script src="/assets/js/caesthetic.js" defer></script><script src="/assets/js/partnerships.js" defer></script>
</head><body class="cae-partnerships">
<a class="cpp-skip" href="#content">${c.skip}</a>
<header class="cae-header"><div class="cae-wrap cpp-header"><a class="cae-brand" href="/" aria-label="CAESTHETIC · ${c.home}"><span class="cae-brand__text"><span class="cae-brand__name">CAESTHETIC</span><span class="cae-brand__tag">${c.tag}</span></span></a><nav class="cpp-languages" aria-label="${c.language}"><a href="/ru/partnerships/" lang="ru" hreflang="ru" data-partnership-locale${lang==='ru'?' aria-current="page"':''}>RU</a><a href="/partnerships/" lang="en" hreflang="en" data-partnership-locale${lang==='en'?' aria-current="page"':''}>EN</a></nav></div></header>
<main id="content">
<section class="cae-section cpp-hero"><div class="cae-wrap"><p class="cae-kicker">${c.kicker}</p><h1 class="cae-h1">${c.headline}</h1><p class="cae-lead">${c.intro}</p><div class="cpp-actions"><a class="cae-btn cae-btn--primary" href="#request">${c.cta}</a><a class="cpp-text-link" href="#formats">${c.formatsLink}</a></div></div></section>
<section class="cae-section cpp-ruled"><div class="cae-wrap"><h2 class="cae-h2">${c.benefitTitle}</h2><div class="cpp-benefits">${c.benefits.map(b=>`<article><p class="cae-kicker">${b[0]}</p><h3 class="cae-h3">${b[1]}</h3><p>${b[2]}</p><p class="cpp-measure">${b[3]}</p></article>`).join('')}</div></div></section>
<section class="cae-section cae-section--soft" id="formats"><div class="cae-wrap"><h2 class="cae-h2">${c.formatsTitle}</h2><p class="cpp-note">${c.examples}</p><div class="cpp-formats">${c.formats.map((f,i)=>`<article class="cpp-format"><div><p class="cae-kicker">0${i+1} · ${f[0]}</p><h3 class="cae-h3">${f[1]}</h3></div><p>${f[2]}</p></article>`).join('')}</div></div></section>
<section class="cae-section"><div class="cae-wrap cpp-split"><div><h2 class="cae-h2">${c.exchangeTitle}</h2><p>${c.exchangeLead}</p></div><dl class="cpp-contributions">${c.exchange.map(e=>`<div><dt>${e[0]}</dt><dd>${e[1]}</dd></div>`).join('')}</dl></div></section>
<section class="cae-section cpp-ruled"><div class="cae-wrap cpp-split"><div><h2 class="cae-h2">${c.scopeTitle}</h2></div><div><p>${c.scope}</p><p>${c.pilot}</p><a class="cpp-text-link" href="https://raimsmile.com/partners/">${c.pilotLink}</a></div></div></section>
<section class="cae-section cae-section--soft"><div class="cae-wrap cpp-split"><h2 class="cae-h2">${c.moneyTitle}</h2><div><p>${c.money}</p><p class="cpp-note">${c.boundary}</p></div></div></section>
<section class="cae-section"><div class="cae-wrap"><h2 class="cae-h2">${c.stepsTitle}</h2><ol class="cpp-steps">${c.steps.map(s=>`<li><h3 class="cae-h3">${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol></div></section>
<section class="cae-section cpp-ruled" id="request"><div class="cae-wrap cpp-split"><div><p class="cae-kicker">CAESTHETIC</p><h2 class="cae-h2">${c.requestTitle}</h2><p>${c.requestIntro}</p><p class="cpp-context" data-partnership-context hidden>${c.expertContext}</p><p>${c.fallback} <a href="mailto:info@caesthetic.com">info@caesthetic.com</a></p></div><form class="cpp-form" data-partnership-form>
<label for="cpp-goal">${c.goal}</label><select id="cpp-goal" name="goal">${c.goals.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
<label for="cpp-name">${c.name}</label><input id="cpp-name" name="name" autocomplete="name" required maxlength="160">
<label for="cpp-email">${c.email}</label><input id="cpp-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="320">
<p class="cpp-note">${c.privacy} <a href="/legal/privacy/">${c.privacyLink}</a>.</p><button type="submit" class="cae-btn cae-btn--primary">${c.send}</button><p class="cpp-status" role="status" aria-live="polite" tabindex="-1" data-partnership-status></p><noscript><p>${c.fallback} <a href="mailto:info@caesthetic.com">info@caesthetic.com</a></p></noscript>
</form></div></section></main>
<footer class="cae-footer"><div class="cae-wrap cpp-footer"><p>${c.footer}</p><p>© 2026 CAESTHETIC · OXFORD PROJETS</p><a href="/legal/privacy/">${c.privacyLink}</a></div></footer></body></html>\n`;
}
function raim() {
 const link='https://caesthetic.com/ru/partnerships/?program=expert-dental-kg#request';
 const body=`
<section class="page-hero partners-hero">${fs.readFileSync(path.join(source,'raim-hero.html'),'utf8')}<div class="hero-shade"></div><div class="hero-copy shell"><p class="kicker light">CAESTHETIC × Expert Dental · Бишкек</p><h1>Ваш бренд и Expert Dental. Больше возможностей вместе.</h1><p>Совместные кампании помогают знакомить друг друга с новой аудиторией. Мероприятия дают публичность и деловые контакты. CAESTHETIC подбирает формат и организует взаимодействие.</p><a class="button inverse" href="#request">Обсудить партнёрство</a></div></section>
<section class="section shell"><p class="kicker">Что получает партнёр</p><h2>Клиенты через сотрудничество. Публичность через события.</h2><div class="rp-benefits"><article><h3>Привлечение клиентов</h3><p>Согласуем полезное предложение и взаимные размещения: рассылки, публикации, разделы привилегий и специальные кампании. У каждой организации остаются её аудитория и каналы связи.</p><p>Отклик оцениваем по переходам, обращениям и покупкам, которые можно связать с кампанией.</p></article><article><h3>Внимание к вашему бренду</h3><p>Организуем семинары, тематические встречи и мероприятия с несколькими участниками. Ваш вклад может быть выступлением, полезной услугой, площадкой, демонстрацией продукта или спонсорским участием.</p><p>Фиксируем размещения, регистрации, посещаемость и согласованные деловые контакты.</p></article></div></section>
<section class="section soft"><div class="shell"><p class="kicker">Возможные форматы</p><h2>Одна кампания, камерная встреча или общее событие.</h2><p>Ниже — примеры для обсуждения. Они не означают, что перечисленные категории компаний уже участвуют в программе.</p><div class="rp-formats"><article><p class="kicker">01 · Совместная кампания</p><h3>Фитнес-клуб + Expert Dental</h3><p>Клуб рассказывает о стоматологической привилегии, клиника — о предложении клуба. CAESTHETIC согласует условия, готовит материалы и отдельные ссылки для оценки отклика.</p></article><article><p class="kicker">02 · Две организации</p><h3>Семинар для аудитории банка</h3><p>Банк приглашает клиентов или сотрудников, Expert Dental делится экспертизой. CAESTHETIC организует подготовку. Формат может быть онлайн — личные встречи для согласования не обязательны.</p></article><article><p class="kicker">03 · Три и более организации</p><h3>Общий день здоровья</h3><p>Стоматология, фитнес, страховая и поставщик оборудования могут органично дополнить программу. Спонсоры и экспоненты оплачивают согласованные возможности участия: стенд, выступление или демонстрацию.</p></article></div></div></section>
<section class="section shell rp-split"><div><p class="kicker">Привилегия для вашей аудитории</p><h2>«Год заботы» может стать частью проекта.</h2></div><div><p>В совместное предложение можно включить утверждённый стоматологический абонемент, организационную помощь координатора и семейные условия. Конкретные услуги и право на привилегию подтверждаем до запуска.</p><p>Возможны покупка абонементов компанией для сотрудников и ограниченная подарочная квота с согласованным финансированием. Подарочный абонемент не означает бесплатное лечение без ограничений.</p><a href="/god-zaboty/">О программе «Год заботы»</a></div></section>
<section class="section soft"><div class="shell rp-split"><div><p class="kicker">Кто за что отвечает</p><h2>CAESTHETIC организует. Expert Dental оказывает медицинские услуги.</h2></div><div><p><strong>CAESTHETIC</strong> ведёт переговоры в интересах Expert Dental, подбирает участников, согласует вклад сторон, готовит материалы, координирует запуск и собирает отчёт.</p><p><strong>Expert Dental</strong> согласует медицинское предложение и возможности приёма, проводит диагностику и лечение. Условия лечения определяются клиникой.</p><p><strong>Ваша компания</strong> назначает контактного сотрудника и предоставляет согласованный вклад: размещение, экспертизу, площадку или бюджет.</p><p>Партнёр самостоятельно приглашает свою аудиторию. Передавать клиентскую базу или медицинские сведения не нужно.</p></div></div></section>
<section class="section shell rp-split"><h2>Условия фиксируем до запуска.</h2><div><p>Взаимные размещения, работа CAESTHETIC, производство мероприятия и спонсорские пакеты согласуются отдельно. Определяем цель, участников, бюджет, сроки и показатели результата. Количество клиентов и продажи не гарантируются.</p><p>Начать можно в переписке и по телефону. После первого контакта предложим подходящий формат; офлайн нужен только там, где он имеет смысл для самого проекта.</p></div></section>
<section class="section soft" id="request"><div class="shell rp-split"><div><p class="kicker">Следующий шаг</p><h2>Обсудите идею с CAESTHETIC.</h2><p>На сайте CAESTHETIC оставьте имя и электронную почту. Контекст Expert Dental сохранится. Ответим письмом и уточним вашу компанию, аудиторию и задачу.</p></div><div class="rp-request"><a class="button" href="${link}">Перейти к форме CAESTHETIC</a><p>Для совместных проектов в других отраслях и городах:</p><a href="https://caesthetic.com/ru/partnerships/">Все форматы партнёрств CAESTHETIC</a></div></div></section>
<!-- RAIM_PRICE_BRIDGE_START --><section class="price-bridge shell" aria-labelledby="price-bridge-title"><p class="kicker">Цены текущей клиники</p><h2 id="price-bridge-title">Медицинские услуги оплачиваются по условиям клиники</h2><p>Прайс Expert Dental помогает отделить стоимость лечения от условий партнёрской программы. Он не устанавливает партнёрские выплаты или персональные привилегии.</p><a class="button" href="/prices/#diagnostics">Посмотреть стоимость</a></section><!-- RAIM_PRICE_BRIDGE_END -->`;
 return fs.readFileSync(path.join(source,'raim-shell.html'),'utf8').replace('{{CONTENT}}',body);
}
export function buildPartnershipPages({raimOnly=false, check=false}={}) {
 const entries=[['site-raimovdental/raim-smile/partners/index.html',raim()]];
 if(!raimOnly) for(const lang of ['ru','en']) entries.push([`site-caesthetic${href(lang)}index.html`,central(lang)]);
 for(const [file,content] of entries){const p=path.join(root,file);if(check){if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==content)throw Error(`Generated partnership page drift: ${file}`);}else{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);}}
 return entries.map(([file])=>file);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log(buildPartnershipPages({check:process.argv.includes('--check'),raimOnly:process.argv.includes('--raim-only')}).join('\n'));
