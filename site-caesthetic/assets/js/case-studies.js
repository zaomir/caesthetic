(function () {
  'use strict';
  var library = window.CAESTHETIC_CASES;
  var list = document.querySelector('[data-case-list]');
  if (!list || !library) return;
  var state = { cases: [], summaries: {}, visible: 8, filters: { goal: '', industry: '', country: '', scale: '', sort: 'relevance' } };
  function make(tag, name, copy) { var node = document.createElement(tag); if (name) node.className = name; if (copy) node.textContent = copy; return node; }
  function track(name, data) { if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, data)); }
  function scale(item) { return String(item.locationCount || ''); }
  function filtered() {
    var f = state.filters;
    return state.cases.filter(function (item) { return (!f.goal || (item.goals || []).includes(f.goal)) && (!f.industry || item.industry === f.industry) && (!f.country || item.country === f.country) && (!f.scale || scale(item) === f.scale); }).sort(function (a, b) {
      if (f.sort === 'title') return library.view(a, state.summaries).title.localeCompare(library.view(b, state.summaries).title);
      if (f.sort === 'country') return (a.country || '').localeCompare(b.country || '') || a.title.localeCompare(b.title);
      var order = { 'closest-match': 0, 'adjacent-model': 1, 'transferable-pattern': 2 };
      return (order[a.relevanceTier] ?? 3) - (order[b.relevanceTier] ?? 3) || a.title.localeCompare(b.title);
    });
  }
  function returnPath() { return location.pathname + location.search + '#case-library'; }
  function remember() { try { sessionStorage.setItem('cae.caseCatalogReturn', returnPath()); sessionStorage.setItem('cae.caseCatalogScroll', String(scrollY)); sessionStorage.setItem('cae.caseCatalogVisible', String(state.visible)); } catch (error) { /* storage is optional */ } }
  function row(item) {
    var data = library.view(item, state.summaries);
    var article = make('article', 'cae-case-row'); article.dataset.caseId = item.id;
    var story = make('div', 'cae-case-row__story'); story.append(make('p', 'cae-case-meta', data.context), make('h3', 'cae-h3', data.title));
    var situation = make('div', 'cae-case-row__statement'); situation.append(make('strong', '', 'The situation'), make('p', '', data.situation)); story.append(situation);
    var panel = make('div', 'cae-case-row__proof');
    var approach = make('div', 'cae-case-row__approach'); approach.append(make('strong', 'cae-case-label', 'The approach'), make('p', '', data.approach)); panel.append(approach);
    if (data.metrics.length) {
      var metric = data.metrics.find(function (m) { return m.isHeadline; }) || data.metrics[0]; var result = make('div', 'cae-case-row__result');
      result.append(make('p', 'cae-case-label', library.evidenceLabel(metric)), make('strong', 'cae-case-label', metric.name), make('p', 'cae-case-result-value', library.metricValue(metric, metric.before) + ' → ' + library.metricValue(metric, metric.after)), make('p', 'cae-case-meta', metric.timeframe), make('p', 'cae-case-source', metric.source)); panel.append(result);
    }
    var link = make('a', 'cae-case-link', 'Read the case →'); link.href = '/case-studies/case/?id=' + encodeURIComponent(item.id) + '&return=' + encodeURIComponent(returnPath()); link.setAttribute('aria-label', 'Read the case: ' + data.title);
    link.addEventListener('click', function () { remember(); track('case_card_open', { case_id: item.id, source: 'card_cta' }); });
    panel.append(link); article.append(story, panel); return article;
  }
  function updateUrl(preserveHash) { var params = new URLSearchParams(); Object.keys(state.filters).forEach(function (k) { if (state.filters[k] && !(k === 'sort' && state.filters[k] === 'relevance')) params.set(k, state.filters[k]); }); history.replaceState(null, '', location.pathname + (params.size ? '?' + params.toString() : '') + (preserveHash ? location.hash : '#case-library')); }
  function render() {
    var items = filtered(); list.replaceChildren(); items.slice(0, state.visible).forEach(function (item) { list.append(row(item)); }); list.hidden = !items.length;
    document.querySelector('[data-empty-state]').hidden = !!items.length;
    document.querySelector('[data-result-count]').textContent = items.length + (items.length === 1 ? ' case' : ' cases');
    document.querySelector('[data-visible-range]').textContent = items.length ? 'Showing ' + Math.min(state.visible, items.length) + ' of ' + items.length : '';
    var more = document.querySelector('[data-load-more]'); more.hidden = state.visible >= items.length; more.textContent = 'Show ' + Math.min(8, Math.max(0, items.length - state.visible)) + ' more cases';
    document.querySelector('[data-clear-filters]').disabled = !Object.keys(state.filters).some(function (k) { return state.filters[k] && !(k === 'sort' && state.filters[k] === 'relevance'); });
    var advanced = ['country', 'scale'].filter(function (key) { return state.filters[key]; }).length; document.querySelector('[data-more-filters-label]').textContent = 'More filters' + (advanced ? ' · ' + advanced + ' active' : '');
  }
  function clear() { Object.keys(state.filters).forEach(function (k) { state.filters[k] = k === 'sort' ? 'relevance' : ''; }); state.visible = 8; document.querySelectorAll('[data-filter]').forEach(function (e) { e.value = state.filters[e.dataset.filter]; }); updateUrl(); render(); }
  function restoreScroll(y) {
    var cancelled = false;
    function cancel() { cancelled = true; }
    ['wheel', 'touchstart', 'keydown'].forEach(function (event) { window.addEventListener(event, cancel, { once: true, passive: true }); });
    var shellReady = new Promise(function (resolve) {
      var slot = document.getElementById('cae-header-slot');
      if (!slot || slot.childElementCount) return resolve();
      var observer = new MutationObserver(function () { if (slot.childElementCount) finish(); });
      var timer = setTimeout(finish, 3000);
      function finish() { observer.disconnect(); clearTimeout(timer); resolve(); }
      observer.observe(slot, { childList: true });
    });
    shellReady.then(function () { return document.fonts ? document.fonts.ready : Promise.resolve(); }).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (!cancelled) scrollTo({ top: y, left: 0, behavior: 'instant' });
        ['wheel', 'touchstart', 'keydown'].forEach(function (event) { window.removeEventListener(event, cancel); });
      }); });
    });
  }
  function initialize(data) {
    state.cases = data.cases; state.summaries = data.summaries; var params = new URLSearchParams(location.search);
    document.querySelectorAll('[data-filter]').forEach(function (select) {
      var key = select.dataset.filter;
      if (key !== 'sort') {
        var values = key === 'goal' ? Array.from(new Set(state.cases.flatMap(function (i) { return i.goals || []; }))) : Array.from(new Set(state.cases.map(function (i) { return key === 'scale' ? scale(i) : i[key]; }).filter(Boolean)));
        values.sort().forEach(function (value) { var option = make('option', '', key === 'goal' ? (library.labels[value] || value) : key === 'scale' ? value + (value === '1' ? ' location' : ' locations') : value); option.value = value; select.append(option); });
      }
      var wanted = params.get(key); if (wanted && Array.from(select.options).some(function (o) { return o.value === wanted; })) state.filters[key] = wanted; select.value = state.filters[key];
      select.addEventListener('change', function () { state.filters[key] = select.value; state.visible = 8; updateUrl(); render(); track('case_filter_change', { filter: key, value: select.value || 'all' }); });
    });
    document.querySelector('[data-clear-filters]').addEventListener('click', clear); document.querySelector('[data-empty-clear]').addEventListener('click', function () { clear(); document.querySelector('[data-library-content]').focus(); });
    document.querySelector('[data-load-more]').addEventListener('click', function () { var old = state.visible; state.visible += 8; render(); var link = list.children[old] && list.children[old].querySelector('a'); if (link) link.focus(); track('case_load_more', { visible: state.visible }); });
    try { if (sessionStorage.getItem('cae.caseCatalogReturn') === returnPath()) state.visible = Math.max(8, Math.min(state.cases.length, Number(sessionStorage.getItem('cae.caseCatalogVisible')) || 8)); } catch (error) { /* no-op */ }
    render(); updateUrl(true);
    try { if (sessionStorage.getItem('cae.caseCatalogReturn') === returnPath()) { var y = Number(sessionStorage.getItem('cae.caseCatalogScroll')); if (y > 0) restoreScroll(y); sessionStorage.removeItem('cae.caseCatalogScroll'); } } catch (error) { /* no-op */ }
    track('case_library_view', { count: state.cases.length });
  }
  document.querySelector('[data-retry-cases]').addEventListener('click', function () { location.reload(); });
  library.load().then(initialize).catch(function () { document.querySelector('[data-load-error]').hidden = false; document.querySelector('[data-library-content]').hidden = true; track('case_library_error'); });
}());
