/** The approved case offer supplements the product page without repricing any product. */
(function () {
  'use strict';
  var id = new URLSearchParams(location.search).get('offer');
  if (!id) return;
  import('/assets/js/spoken-offer-data.js').then(function (module) {
    var offer = module.resolveSpokenOffer(id, 'growth_sprint');
    var host = document.getElementById('spoken-offer');
    if (!host || !offer) return;
    host.hidden = false;
    host.querySelector('[data-spoken-offer-title]').textContent = offer.title;
    host.querySelector('[data-spoken-offer-scope]').textContent = offer.scope;
    var list = host.querySelector('[data-spoken-deliverables]');
    offer.deliverables.forEach(function (text) { var li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
    ['included_check','acceptance','credit','continuation','boundary'].forEach(function (key) { host.querySelector('[data-spoken-'+key+']').textContent = offer[key]; });
    document.querySelectorAll('[data-cae-sprint-inquiry]').forEach(function (a) {
      a.dataset.caeOffer = offer.id;
      a.href = '/pay/?product=growth_sprint&offer=' + encodeURIComponent(offer.id);
    });
    document.querySelectorAll('[data-generic-sprint-section]').forEach(function (s) { s.hidden = true; });
  }).catch(function () {
    var host = document.getElementById('spoken-offer');
    if (host) { host.hidden = false; host.textContent = 'This practice-specific offer could not be loaded. Please reload before ordering.'; }
    document.querySelectorAll('[data-cae-sprint-inquiry]').forEach(function (a) { a.removeAttribute('data-cae-sprint-inquiry'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); });
  });
})();
