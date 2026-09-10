let previousOpen = [];
window.addEventListener('beforeprint', () => {
  previousOpen = [...document.querySelectorAll('details')].map(el => [el, el.open]);
  previousOpen.forEach(([el]) => { el.open = true; });
});
window.addEventListener('afterprint', () => {
  previousOpen.forEach(([el, open]) => { el.open = open; });
});
document.querySelector('[data-expert-print]')?.addEventListener('click', () => window.print());
