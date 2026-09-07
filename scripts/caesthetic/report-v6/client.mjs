export function stickyVisible(offerBottom, finalTop, finalBottom, viewportHeight) {
  return offerBottom <= 0 && !(finalTop < viewportHeight && finalBottom > 0);
}

export async function shareReport(nav, data) {
  if (nav.share) {
    try { await nav.share(data); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  if (nav.clipboard?.writeText) {
    try { await nav.clipboard.writeText(data.url); return 'copied'; } catch {}
  }
  return 'manual';
}

if (typeof document !== 'undefined') {
  const ui = JSON.parse(document.getElementById('v6-ui').textContent);
  const bar = document.querySelector('[data-v6-sticky]');
  const offer = document.querySelector('[data-v6-offer]');
  const final = document.querySelector('[data-v6-sprint]');
  const update = () => {
    const a = offer.getBoundingClientRect();
    const b = final.getBoundingClientRect();
    bar.hidden = !stickyVisible(a.bottom, b.top, b.bottom, innerHeight);
    if (!bar.hidden) document.documentElement.style.setProperty('--v6-sticky-height', `${bar.offsetHeight}px`);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(update);
    observer.observe(offer); observer.observe(final);
    addEventListener('resize', update, { passive: true });
    addEventListener('pageshow', update); update();
  }
  document.querySelectorAll('[data-v6-share]').forEach(button => {
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      const url = location.origin + location.pathname;
      const status = document.querySelector('[data-v6-share-status]');
      const fallback = document.querySelector('[data-v6-share-fallback]');
      status.textContent = ''; fallback.hidden = true;
      if (!['https:', 'http:'].includes(location.protocol)) {
        status.textContent = ui.unpublished; button.disabled = false; return;
      }
      const result = await shareReport(navigator, { title: document.title, url });
      button.disabled = false;
      if (result === 'copied' || result === 'shared') status.textContent = ui[result];
      if (result === 'manual') {
        status.textContent = ui.manual;
        fallback.hidden = false; fallback.value = url; fallback.focus(); fallback.select();
      }
    });
  });
  let printState = [];
  addEventListener('beforeprint', () => {
    printState = Array.from(document.querySelectorAll('details'), node => [node, node.open]);
    printState.forEach(([node]) => { node.open = true; });
  });
  addEventListener('afterprint', () => { printState.forEach(([node, open]) => { node.open = open; }); });
}
