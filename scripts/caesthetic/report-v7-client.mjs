const share=document.querySelector('#share'),status=document.querySelector('#share-status');
share?.addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:document.title,url:location.href});status.textContent='Отчёт отправлен';}else{await navigator.clipboard.writeText(location.href);status.textContent='Ссылка скопирована';}}catch(e){status.textContent=e.name==='AbortError'?'':'Скопируйте адрес страницы из браузера';}});
let previous=[];
addEventListener('beforeprint',()=>{previous=[...document.querySelectorAll('details')].map(d=>[d,d.open]);previous.forEach(([d])=>{d.open=true;});});
addEventListener('afterprint',()=>{previous.forEach(([d,open])=>{d.open=open;});});
