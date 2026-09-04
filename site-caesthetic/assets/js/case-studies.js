(function () {
  'use strict';

  var goalLabels = { bookings: 'More bookings', conversion: 'Better conversion', retention: 'Retention', reputation: 'Reputation', 'multi-location': 'Multi-location' };
  var evidenceLabels = { verified: 'Verified evidence', client_reported: 'Client-reported', modeled: 'Modeled result' };
  var state = { cases: [], activeGoal: 'bookings', filters: { goal: '', industry: '', country: '', businessModel: '', evidenceLevel: '', sort: 'relevance' }, visible: 10 };
  var list = document.querySelector('[data-case-list]');
  if (!list) return;

  function element(tag, className, copy) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof copy === 'string') node.textContent = copy;
    return node;
  }

  function goals(item) { return Array.isArray(item.goals) ? item.goals : []; }
  function metric(item) { return item.headlineMetric || (Array.isArray(item.metrics) ? item.metrics[0] : null) || {}; }
  function metricPart(item, key, fallback) {
    var part = metric(item)[key];
    if (part && typeof part.display === 'string' && part.display) return part.display;
    if (typeof item[key] === 'string' && item[key]) return item[key];
    return fallback;
  }
  function uniqueValues(key) { return Array.from(new Set(state.cases.map(function (item) { return item[key]; }).filter(Boolean))).sort(); }
  function populateSelect(selector, values) {
    document.querySelectorAll(selector).forEach(function (select) {
      values.forEach(function (value) {
        if (Array.from(select.options).some(function (option) { return option.value === value; })) return;
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  }
  function relevanceScore(item) {
    var tier = { 'closest-match': 0, 'adjacent-model': 10, 'transferable-pattern': 20 }[item.relevanceTier] || 30;
    return tier + (goals(item).indexOf(state.activeGoal) === -1 ? 5 : 0);
  }
  function filteredCases(filters) {
    var active = filters || state.filters;
    return state.cases.filter(function (item) {
      return (!active.goal || goals(item).indexOf(active.goal) !== -1) && (!active.industry || item.industry === active.industry) &&
        (!active.country || item.country === active.country) && (!active.businessModel || item.businessModel === active.businessModel) &&
        (!active.evidenceLevel || item.evidenceLevel === active.evidenceLevel);
    }).sort(function (a, b) {
      if (active.sort === 'title') return a.title.localeCompare(b.title);
      if (active.sort === 'country') return a.country.localeCompare(b.country) || a.title.localeCompare(b.title);
      return relevanceScore(a) - relevanceScore(b) || a.title.localeCompare(b.title);
    });
  }
  function makeMedia(item) {
    var figure = element('figure', 'cae-media-slot cae-case-row__visual');
    var frame = element('div', 'cae-media-slot__frame');
    var image = document.createElement('img');
    image.setAttribute('data-media-id', item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('alt', 'Illustrative cover for ' + item.title);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    var fallback = element('span', 'cae-media-slot__fallback', 'Case visual');
    fallback.setAttribute('aria-hidden', 'true');
    frame.append(image, fallback);
    figure.appendChild(frame);
    return figure;
  }
  function makeMetric(item) {
    var headline = metric(item);
    var block = element('div', 'cae-case-before-after');
    var before = element('div', 'cae-case-before-after__point');
    before.append(element('span', '', 'Before'), element('strong', '', metricPart(item, 'before', 'Baseline documented')));
    var arrow = element('span', 'cae-case-before-after__arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    var after = element('div', 'cae-case-before-after__point');
    after.append(element('span', '', 'After'), element('strong', '', metricPart(item, 'after', 'Outcome documented')));
    block.append(before, arrow, after);
    var delta = item.delta || (headline.delta || {}).display;
    if (delta) block.appendChild(element('b', 'cae-case-before-after__delta', delta));
    return block;
  }
  function makeCaseRow(item) {
    var article = element('article', 'cae-case-row');
    article.setAttribute('data-case-id', item.id);
    article.appendChild(makeMedia(item));
    var story = element('div', 'cae-case-row__story');
    story.appendChild(element('p', 'cae-case-meta', [item.industry, item.country, item.businessModel].filter(Boolean).join(' · ')));
    var title = element('h3', 'cae-h3');
    var titleLink = element('a', 'cae-case-title-link', item.title);
    titleLink.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    title.appendChild(titleLink);
    story.append(title, element('p', '', item.summary));
    article.appendChild(story);
    var proof = element('div', 'cae-case-row__proof');
    proof.appendChild(makeMetric(item));
    proof.appendChild(element('span', 'cae-case-evidence-badge', evidenceLabels[item.evidenceLevel] || item.evidenceStatus || 'Evidence documented'));
    proof.appendChild(element('span', 'cae-case-timeframe', item.timeframe || 'Measurement window documented'));
    var link = element('a', 'cae-case-link', 'See what changed →');
    link.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    link.setAttribute('aria-label', 'See what changed: ' + item.title);
    proof.appendChild(link);
    article.appendChild(proof);
    return article;
  }
  function setFeatured() {
    var item = state.cases.slice().sort(function (a, b) { return relevanceScore(a) - relevanceScore(b); })[0];
    var section = document.querySelector('[data-featured-section]');
    if (!item) { section.hidden = true; return; }
    section.hidden = false;
    document.querySelector('[data-featured-title]').textContent = item.title;
    document.querySelector('[data-featured-summary]').textContent = item.summary;
    document.querySelector('[data-featured-meta]').textContent = [item.industry, item.country, item.businessModel].filter(Boolean).join(' · ');
    document.querySelector('[data-featured-before]').textContent = metricPart(item, 'before', 'Baseline documented');
    document.querySelector('[data-featured-after]').textContent = metricPart(item, 'after', 'Outcome documented');
    document.querySelector('[data-featured-delta]').textContent = item.delta || (metric(item).delta || {}).display || 'Change documented';
    document.querySelector('[data-featured-window]').textContent = item.timeframe || 'Measurement window documented';
    document.querySelector('[data-featured-status]').textContent = evidenceLabels[item.evidenceLevel] || item.evidenceStatus || 'Evidence documented';
    var link = document.querySelector('[data-featured-link]');
    link.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    link.setAttribute('aria-label', 'See what changed: ' + item.title);
    var image = document.querySelector('[data-featured-media] img');
    image.removeAttribute('src');
    image.setAttribute('data-media-id', item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('alt', 'Illustrative cover for ' + item.title);
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(document.querySelector('[data-featured-media]'));
  }
  function activeFilterCount() { return ['goal', 'industry', 'country', 'businessModel', 'evidenceLevel'].filter(function (key) { return state.filters[key]; }).length; }
  function setUrl() {
    var params = new URLSearchParams();
    params.set('goal', state.activeGoal);
    Object.keys(state.filters).forEach(function (key) { if (state.filters[key] && key !== 'sort') params.set(key, state.filters[key]); });
    if (state.filters.sort !== 'relevance') params.set('sort', state.filters.sort);
    history.replaceState(null, '', '?' + params.toString() + '#case-library');
  }
  function render() {
    var items = filteredCases();
    list.replaceChildren();
    items.slice(0, state.visible).forEach(function (item) { list.appendChild(makeCaseRow(item)); });
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(list);
    var countLabel = items.length + (items.length === 1 ? ' case' : ' cases');
    var rankingLabel = 'Ranked for ' + (goalLabels[state.activeGoal] || 'your goal');
    document.querySelector('[data-result-count]').textContent = countLabel + ' · ' + rankingLabel;
    document.querySelector('[data-result-count-mobile]').textContent = countLabel;
    document.querySelector('[data-active-goal-mobile]').textContent = rankingLabel;
    document.querySelector('[data-filter-count]').textContent = activeFilterCount();
    document.querySelector('[data-visible-range]').textContent = items.length ? 'Showing 1–' + Math.min(state.visible, items.length) : 'Showing 0';
    document.querySelector('[data-library-total]').textContent = state.cases.length;
    document.querySelector('[data-empty-state]').hidden = items.length !== 0;
    list.hidden = items.length === 0;
    var loadMore = document.querySelector('[data-load-more]');
    loadMore.hidden = state.visible >= items.length;
    loadMore.textContent = 'Show ' + Math.min(10, Math.max(items.length - state.visible, 0)) + ' more cases';
    document.querySelector('[data-clear-filters]').disabled = activeFilterCount() === 0 && state.filters.sort === 'relevance';
  }
  function syncControls() {
    document.querySelectorAll('[data-filter]').forEach(function (control) { control.value = state.filters[control.getAttribute('data-filter')]; });
    document.querySelectorAll('[data-mobile-filter]').forEach(function (control) { control.value = state.filters[control.getAttribute('data-mobile-filter')]; });
  }
  function clearFilters() {
    state.filters = { goal: '', industry: '', country: '', businessModel: '', evidenceLevel: '', sort: 'relevance' };
    state.visible = 10;
    syncControls();
    setUrl();
    render();
  }
  function bind() {
    document.querySelectorAll('[data-case-goal]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.activeGoal = button.getAttribute('data-case-goal');
        document.querySelectorAll('[data-case-goal]').forEach(function (candidate) {
          var active = candidate === button;
          candidate.classList.toggle('is-active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });
        state.visible = 10;
        setFeatured();
        setUrl();
        render();
      });
    });
    document.querySelectorAll('[data-filter]').forEach(function (control) {
      control.addEventListener('change', function () {
        state.filters[control.getAttribute('data-filter')] = control.value;
        state.visible = 10;
        syncControls();
        setUrl();
        render();
      });
    });
    document.querySelector('[data-load-more]').addEventListener('click', function () { state.visible += 10; render(); });
    document.querySelector('[data-clear-filters]').addEventListener('click', clearFilters);
    document.querySelector('[data-empty-clear]').addEventListener('click', clearFilters);
    var dialog = document.querySelector('[data-filter-dialog]');
    document.querySelector('[data-open-filters]').addEventListener('click', function () {
      syncControls();
      document.querySelector('[data-dialog-result-count]').textContent = filteredCases(state.filters).length;
      dialog.showModal();
    });
    document.querySelector('[data-close-filters]').addEventListener('click', function () { dialog.close(); });
    document.querySelector('[data-mobile-clear]').addEventListener('click', function () {
      document.querySelectorAll('[data-mobile-filter]').forEach(function (control) { control.value = ''; });
      document.querySelector('[data-dialog-result-count]').textContent = state.cases.length;
    });
    document.querySelectorAll('[data-mobile-filter]').forEach(function (control) {
      control.addEventListener('change', function () {
        var preview = Object.assign({}, state.filters);
        document.querySelectorAll('[data-mobile-filter]').forEach(function (input) { preview[input.getAttribute('data-mobile-filter')] = input.value; });
        document.querySelector('[data-dialog-result-count]').textContent = filteredCases(preview).length;
      });
    });
    document.querySelector('[data-mobile-filter-form]').addEventListener('submit', function () {
      document.querySelectorAll('[data-mobile-filter]').forEach(function (control) { state.filters[control.getAttribute('data-mobile-filter')] = control.value; });
      state.visible = 10;
      syncControls();
      setUrl();
      render();
    });
  }
  function showLoadError() {
    document.querySelector('[data-load-error]').hidden = false;
    document.querySelector('[data-library-content]').hidden = true;
    document.querySelector('[data-featured-section]').hidden = true;
  }
  function initialize(cases) {
    state.cases = cases;
    var params = new URLSearchParams(window.location.search);
    if (goalLabels[params.get('goal')]) state.activeGoal = params.get('goal');
    Object.keys(state.filters).forEach(function (key) { if (params.get(key)) state.filters[key] = params.get(key); });
    populateSelect('[data-filter="industry"], [data-mobile-filter="industry"]', uniqueValues('industry'));
    populateSelect('[data-filter="country"], [data-mobile-filter="country"]', uniqueValues('country'));
    populateSelect('[data-filter="businessModel"], [data-mobile-filter="businessModel"]', uniqueValues('businessModel'));
    document.querySelectorAll('[data-case-goal]').forEach(function (button) {
      var active = button.getAttribute('data-case-goal') === state.activeGoal;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    syncControls();
    bind();
    setFeatured();
    render();
  }
  fetch('/case-studies/intake/api/public-cases', { credentials: 'same-origin' })
    .then(function (response) { if (!response.ok) throw new Error('Published case data unavailable'); return response.json(); })
    .then(function (data) {
      var cases = data && Array.isArray(data.cases) ? data.cases : [];
      if (!cases.length) throw new Error('No published cases');
      initialize(cases);
    })
    .catch(showLoadError);
}());
