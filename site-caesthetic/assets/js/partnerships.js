/* Uses the existing durable public-request service. No CRM or eligibility writes. */
(() => {
 'use strict';
 const ru = document.documentElement.lang === 'ru';
 const copy = ru ? {
  sending:'Отправляем запрос…', sent:'Запрос получен CAESTHETIC. Ответим по электронной почте и уточним детали партнёрства.',
  failed:'Не удалось подтвердить отправку. Повторите попытку или напишите на info@caesthetic.com.',
  limited:'Слишком много запросов. Попробуйте позже или напишите на info@caesthetic.com.'
 } : {
  sending:'Sending your request…', sent:'CAESTHETIC has received your request. We will reply by email to discuss the partnership.',
  failed:'We could not confirm delivery. Please retry or email info@caesthetic.com.',
  limited:'Too many requests. Please try later or email info@caesthetic.com.'
 };
 const expert = new URLSearchParams(location.search).get('program') === 'expert-dental-kg';
 const program = expert ? 'expert-dental-kg' : 'general';
 document.querySelectorAll('[data-partnership-context]').forEach(el => { el.hidden = !expert; });
 document.querySelectorAll('[data-partnership-locale]').forEach(a => {
  if(expert){const url=new URL(a.href);url.searchParams.set('program',program);url.hash=location.hash;a.href=url.toString();}
 });
 const form=document.querySelector('[data-partnership-form]');
 if(!form)return;
 const button=form.querySelector('button[type="submit"]');
 const status=form.querySelector('[data-partnership-status]');
 let busy=false, sent=false;
 form.addEventListener('submit',async event => {
  event.preventDefault();
  if(busy||sent||!form.reportValidity())return;
  const data=new FormData(form), name=String(data.get('name')||'').trim();
  if(!name){form.elements.name.value='';form.elements.name.reportValidity();return;}
  const goal=['campaign','event','client'].includes(data.get('goal'))?data.get('goal'):'campaign';
  const page=new URL(location.pathname,'https://caesthetic.com');
  if(expert)page.searchParams.set('program',program);
  busy=true;button.disabled=true;form.setAttribute('aria-busy','true');status.dataset.error='false';status.textContent=copy.sending;
  const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),20000);
  try {
   const endpoint=window.CAESTHETIC_API?.request;
   if(!endpoint)throw Error('unavailable');
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({action:'caesthetic_public_request',name,email:String(data.get('email')||'').trim(),intent:`partnership:${program}:${goal}:${ru?'ru':'en'}`,page_url:page.toString()})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result.ok!==true||result.notification_sent!==true)throw Error(response.status===429?'limited':'failed');
   sent=true;status.textContent=copy.sent;
   form.querySelectorAll('input,select').forEach(el=>{el.disabled=true;});
   window.caestheticAnalytics?.track?.('partnership_request_submitted',{program,goal,locale:ru?'ru':'en'});
  } catch(error) {status.dataset.error='true';status.textContent=error.message==='limited'?copy.limited:copy.failed;}
  finally {clearTimeout(timeout);busy=false;form.removeAttribute('aria-busy');button.disabled=sent;status.focus({preventScroll:true});}
 });
})();
