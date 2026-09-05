(function () {
  'use strict';

  var goalLabels = {
    bookings: 'More bookings',
    conversion: 'Better conversion',
    retention: 'Retention',
    reputation: 'Reputation',
    'multi-location': 'Multi-location'
  };
  var evidenceLabels = {
    verified: 'Verified evidence',
    client_reported: 'Client-reported',
    modeled: 'Modeled result'
  };
  var evidenceDescriptions = {
    verified: 'Checked against an available source',
    client_reported: 'Reported by the clinic',
    modeled: 'Analytical scenario—not a client outcome'
  };
  var filterLabels = {
    goal: 'Goal',
    industry: 'Practice type',
    country: 'Market',
    scale: 'Scale',
    evidenceLevel: 'Evidence'
  };
  var emptyFilters = { goal: '', industry: '', country: '', scale: '', evidenceLevel: '', sort: 'relevance' };
  function isPublicCatalogCase(item) {
    if (!item || !item.id) return false;
    var id = String(item.id);
    var title = String(item.title || '').trim();
    if (/^test[-_]/i.test(id)) return false;
    if (/^TEST\b/i.test(title)) return false;
    return true;
  }
  var state = { cases: [], filters: Object.assign({}, emptyFilters), visible: 8 };
  var list = document.querySelector('[data-case-list]');
  if (!list) return;

  function element(tag, className, copy) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof copy === 'string') node.textContent = copy;
    return node;
  }

  function track(eventName, detail) {
    if (!Array.isArray(window.dataLayer)) return;
    window.dataLayer.push(Object.assign({ event: eventName }, detail || {}));
  }

  function goals(item) { return Array.isArray(item.goals) ? item.goals : []; }
  function metric(item) { return item.headlineMetric || (Array.isArray(item.metrics) ? item.metrics[0] : null) || {}; }
  function scaleValue(item) {
    var value = item.practiceScale || item.locationCount || item.businessModel || '';
    return String(value).trim();
  }
  function metricPart(item, key) {
    var part = metric(item)[key];
    if (part && typeof part.display === 'string' && part.display) return part.display;
    if (typeof item[key] === 'string' && item[key]) return item[key];
    return 'Not measured';
  }
  function constraintCopy(item) {
    return item.diagnosis || item.bindingConstraint || item.summary || 'Constraint documented in the full case file.';
  }
  function changeCopy(item) {
    if (Array.isArray(item.interventions) && item.interventions.length) return item.interventions[0];
    if (typeof item.workstreams === 'string' && item.workstreams.trim()) return item.workstreams.split(/\r?\n/)[0];
    return item.interventionSummary || item.summary || 'Operating change documented in the full case file.';
  }
  function uniqueValues(resolver) {
    return Array.from(new Set(state.cases.map(resolver).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b); });
  }
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
  function relevanceScore(item, filters) {
    var tier = { 'closest-match': 0, 'adjacent-model': 10, 'transferable-pattern': 20 }[item.relevanceTier] || 30;
    return tier + (filters.goal && goals(item).indexOf(filters.goal) === -1 ? 5 : 0);
  }
  function filteredCases(filters) {
    var active = filters || state.filters;
    return state.cases.filter(function (item) {
      return (!active.goal || goals(item).indexOf(active.goal) !== -1) &&
        (!active.industry || item.industry === active.industry) &&
        (!active.country || item.country === active.country) &&
        (!active.scale || scaleValue(item) === active.scale) &&
        (!active.evidenceLevel || item.evidenceLevel === active.evidenceLevel);
    }).sort(function (a, b) {
      if (active.sort === 'title') return a.title.localeCompare(b.title);
      if (active.sort === 'country') return (a.country || '').localeCompare(b.country || '') || a.title.localeCompare(b.title);
      return relevanceScore(a, active) - relevanceScore(b, active) || a.title.localeCompare(b.title);
    });
  }

  function catalogReturnPath() {
    return window.location.pathname + window.location.search + '#case-library';
  }
  function rememberCatalogPosition() {
    try {
      sessionStorage.setItem('cae.caseCatalogReturn', catalogReturnPath());
      sessionStorage.setItem('cae.caseCatalogScroll', String(window.scrollY));
    } catch (error) {
      // Navigation remains functional when storage is unavailable.
    }
  }
  function caseHref(item) {
    return '/case-studies/case/?id=' + encodeURIComponent(item.id) + '&return=' + encodeURIComponent(catalogReturnPath());
  }
  function bindCaseLink(link, item, source) {
    link.href = caseHref(item);
    link.addEventListener('click', function () {
      rememberCatalogPosition();
      track('case_card_open', { case_id: item.id, source: source });
    });
  }

  function makeMedia(item) {
    var figure = element('figure', 'cae-media-slot cae-case-row__visual');
    var frame = element('div', 'cae-media-slot__frame');
    var image = document.createElement('img');
    image.setAttribute('data-media-id', (window.CAESTHETIC_MEDIA && window.CAESTHETIC_MEDIA.coverMediaId(item)) || item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('data-media-fallback', item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('alt', item.imageAlt || 'Context image for ' + item.title);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    var fallback = element('span', 'cae-media-slot__fallback', 'Case context');
    fallback.setAttribute('aria-hidden', 'true');
    frame.append(image, fallback);
    figure.appendChild(frame);
    return figure;
  }
  function makeMetric(item) {
    var headline = metric(item);
    var block = element('div', 'cae-case-before-after');
    var before = element('div', 'cae-case-before-after__point');
    before.append(element('span', '', 'Before'), element('strong', '', metricPart(item, 'before')));
    var arrow = element('span', 'cae-case-before-after__arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    var after = element('div', 'cae-case-before-after__point');
    after.append(element('span', '', 'After'), element('strong', '', metricPart(item, 'after')));
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
    story.appendChild(element('p', 'cae-case-meta', [item.country, item.industry, scaleValue(item)].filter(Boolean).join(' · ')));
    if (goals(item)[0]) story.appendChild(element('p', 'cae-case-row__goal', goalLabels[goals(item)[0]] || goals(item)[0]));
    var title = element('h3', 'cae-h3');
    var titleLink = element('a', 'cae-case-title-link', item.title);
    bindCaseLink(titleLink, item, 'title');
    title.appendChild(titleLink);
    story.appendChild(title);

    var diagnosis = element('p', 'cae-case-row__statement');
    diagnosis.append(element('strong', '', 'Constraint'), document.createTextNode(constraintCopy(item)));
    var changed = element('p', 'cae-case-row__statement');
    changed.append(element('strong', '', 'What changed'), document.createTextNode(changeCopy(item)));
    story.append(diagnosis, changed);
    article.appendChild(story);

    var proof = element('div', 'cae-case-row__proof');
    proof.appendChild(makeMetric(item));
    var evidence = element('span', 'cae-case-evidence-badge', evidenceLabels[item.evidenceLevel] || item.evidenceStatus || 'Evidence documented');
    evidence.setAttribute('title', evidenceDescriptions[item.evidenceLevel] || 'Evidence boundary documented in the full case');
    evidence.setAttribute('tabindex', '0');
    proof.appendChild(evidence);
    proof.appendChild(element('span', 'cae-case-timeframe', item.timeframe || 'Measurement window documented'));
    var link = element('a', 'cae-case-link', 'See what changed →');
    link.setAttribute('aria-label', 'See what changed: ' + item.title);
    bindCaseLink(link, item, 'card_cta');
    proof.appendChild(link);
    article.appendChild(proof);
    return article;
  }

  function activeFilterKeys(filters) {
    var active = filters || state.filters;
    return ['goal', 'industry', 'country', 'scale', 'evidenceLevel'].filter(function (key) { return active[key]; });
  }
  function activeFilterCount(filters) { return activeFilterKeys(filters).length; }
  function filterValueLabel(key, value) {
    if (key === 'goal') return goalLabels[value] || value;
    if (key === 'evidenceLevel') return evidenceLabels[value] || value;
    return value;
  }
  function renderActiveFilters() {
    var container = document.querySelector('[data-active-filters]');
    var keys = activeFilterKeys();
    container.replaceChildren();
    container.hidden = keys.length === 0;
    keys.forEach(function (key) {
      var button = element('button', 'cae-active-filter', filterLabels[key] + ': ' + filterValueLabel(key, state.filters[key]) + ' ×');
      button.type = 'button';
      button.setAttribute('aria-label', 'Remove ' + filterLabels[key] + ' filter');
      button.addEventListener('click', function () {
        state.filters[key] = '';
        state.visible = 8;
        syncControls();
        setUrl();
        render();
        track('case_filter_change', { filter: key, action: 'remove' });
      });
      container.appendChild(button);
    });
  }

  function setFeatured() {
    var section = document.querySelector('[data-featured-section]');
    if (activeFilterCount() > 0) { section.hidden = true; return; }
    var item = state.cases.find(function (candidate) { return candidate.featured === true; }) || filteredCases()[0];
    if (!item) { section.hidden = true; return; }
    section.hidden = false;
    document.querySelector('[data-featured-title]').textContent = item.title;
    document.querySelector('[data-featured-summary]').textContent = constraintCopy(item);
    document.querySelector('[data-featured-meta]').textContent = [item.country, item.industry, scaleValue(item)].filter(Boolean).join(' · ');
    document.querySelector('[data-featured-before]').textContent = metricPart(item, 'before');
    document.querySelector('[data-featured-after]').textContent = metricPart(item, 'after');
    document.querySelector('[data-featured-delta]').textContent = item.delta || (metric(item).delta || {}).display || 'Change documented';
    document.querySelector('[data-featured-window]').textContent = item.timeframe || 'Measurement window documented';
    document.querySelector('[data-featured-status]').textContent = evidenceLabels[item.evidenceLevel] || item.evidenceStatus || 'Evidence documented';
    var link = document.querySelector('[data-featured-link]');
    link.href = caseHref(item);
    link.setAttribute('aria-label', 'See what changed: ' + item.title);
    link.onclick = function () {
      rememberCatalogPosition();
      track('featured_case_open', { case_id: item.id });
    };
    var image = document.querySelector('[data-featured-media] img');
    image.removeAttribute('src');
    image.setAttribute('data-media-id', (window.CAESTHETIC_MEDIA && window.CAESTHETIC_MEDIA.coverMediaId(item)) || item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('data-media-fallback', item.mediaId || 'case.library.hero.abstract');
    image.setAttribute('alt', item.imageAlt || 'Context image for ' + item.title);
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(document.querySelector('[data-featured-media]'));
  }

  function setUrl() {
    var params = new URLSearchParams();
    Object.keys(state.filters).forEach(function (key) {
      if (state.filters[key] && !(key === 'sort' && state.filters[key] === 'relevance')) params.set(key, state.filters[key]);
    });
    var query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + '#case-library');
  }
  function render() {
    var items = filteredCases();
    list.replaceChildren();
    items.slice(0, state.visible).forEach(function (item) { list.appendChild(makeCaseRow(item)); });
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(list);
    var countLabel = items.length + (items.length === 1 ? ' published case' : ' published cases');
    var goalLabel = state.filters.goal ? 'Goal · ' + (goalLabels[state.filters.goal] || state.filters.goal) : 'All published cases';
    document.querySelector('[data-result-count]').textContent = countLabel;
    document.querySelector('[data-result-count-mobile]').textContent = countLabel;
    document.querySelector('[data-active-goal-mobile]').textContent = goalLabel;
    document.querySelector('[data-filter-count]').textContent = activeFilterCount();
    document.querySelector('[data-visible-range]').textContent = items.length ? 'Showing ' + Math.min(state.visible, items.length) + ' of ' + items.length : 'Showing 0';
    document.querySelector('[data-library-total]').textContent = state.cases.length;
    document.querySelector('[data-empty-state]').hidden = items.length !== 0;
    list.hidden = items.length === 0;
    var loadMore = document.querySelector('[data-load-more]');
    loadMore.hidden = state.visible >= items.length;
    loadMore.textContent = 'Show ' + Math.min(8, Math.max(items.length - state.visible, 0)) + ' more cases';
    document.querySelector('[data-clear-filters]').disabled = activeFilterCount() === 0 && state.filters.sort === 'relevance';
    document.querySelectorAll('[data-case-goal]').forEach(function (button) {
      var active = button.getAttribute('data-case-goal') === state.filters.goal;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderActiveFilters();
    setFeatured();
  }
  function syncControls() {
    document.querySelectorAll('[data-filter]').forEach(function (control) { control.value = state.filters[control.getAttribute('data-filter')]; });
    document.querySelectorAll('[data-mobile-filter]').forEach(function (control) { control.value = state.filters[control.getAttribute('data-mobile-filter')]; });
  }
  function clearFilters() {
    state.filters = Object.assign({}, emptyFilters);
    state.visible = 8;
    syncControls();
    setUrl();
    render();
    track('case_filter_change', { action: 'clear_all' });
  }

  function bindSectionNavigation() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.from(document.querySelectorAll('[data-section-link]'));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var active = link.getAttribute('data-section-link') === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
    ['how-we-work', 'case-library'].forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
  function bind() {
    document.querySelectorAll('[data-case-goal]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.filters.goal = button.getAttribute('data-case-goal');
        state.visible = 8;
        syncControls();
        setUrl();
        render();
        track('case_filter_change', { filter: 'goal', value: state.filters.goal || 'all', source: 'goal_chip' });
      });
    });
    document.querySelectorAll('[data-filter]').forEach(function (control) {
      control.addEventListener('change', function () {
        var key = control.getAttribute('data-filter');
        state.filters[key] = control.value;
        state.visible = 8;
        syncControls();
        setUrl();
        render();
        track('case_filter_change', { filter: key, value: control.value || 'all', source: 'desktop' });
      });
    });
    document.querySelector('[data-load-more]').addEventListener('click', function () {
      state.visible += 8;
      render();
      track('case_load_more', { visible: state.visible });
    });
    document.querySelector('[data-clear-filters]').addEventListener('click', clearFilters);
    document.querySelector('[data-empty-clear]').addEventListener('click', clearFilters);

    var dialog = document.querySelector('[data-filter-dialog]');
    document.querySelector('[data-open-filters]').addEventListener('click', function () {
      syncControls();
      document.querySelector('[data-dialog-result-count]').textContent = filteredCases(state.filters).length;
      dialog.showModal();
      track('case_filter_open', { active_filters: activeFilterCount() });
    });
    document.querySelector('[data-close-filters]').addEventListener('click', function () { dialog.close(); });
    document.querySelector('[data-mobile-clear]').addEventListener('click', function () {
      document.querySelectorAll('[data-mobile-filter]').forEach(function (control) { control.value = ''; });
      var preview = Object.assign({}, state.filters, { goal: '', industry: '', country: '', scale: '', evidenceLevel: '' });
      document.querySelector('[data-dialog-result-count]').textContent = filteredCases(preview).length;
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
      state.visible = 8;
      syncControls();
      setUrl();
      render();
      track('case_filter_change', { source: 'mobile', active_filters: activeFilterCount() });
    });
    bindSectionNavigation();
  }
  function restoreCatalogPosition() {
    var storedPath;
    var storedScroll;
    try {
      storedPath = sessionStorage.getItem('cae.caseCatalogReturn');
      storedScroll = Number(sessionStorage.getItem('cae.caseCatalogScroll'));
    } catch (error) {
      return;
    }
    var current = window.location.pathname + window.location.search + '#case-library';
    if (storedPath !== current || !Number.isFinite(storedScroll) || storedScroll < 1) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.scrollTo(0, storedScroll);
        try { sessionStorage.removeItem('cae.caseCatalogScroll'); } catch (error) { /* no-op */ }
      });
    });
  }
  function showLoadError() {
    document.querySelector('[data-load-error]').hidden = false;
    document.querySelector('[data-library-content]').hidden = true;
    track('case_library_error');
  }
  function initialize(cases) {
    state.cases = cases;
    var params = new URLSearchParams(window.location.search);
    Object.keys(state.filters).forEach(function (key) { if (params.get(key)) state.filters[key] = params.get(key); });
    if (state.filters.goal && !goalLabels[state.filters.goal]) state.filters.goal = '';
    populateSelect('[data-filter="industry"], [data-mobile-filter="industry"]', uniqueValues(function (item) { return item.industry || ''; }));
    populateSelect('[data-filter="country"], [data-mobile-filter="country"]', uniqueValues(function (item) { return item.country || ''; }));
    populateSelect('[data-filter="scale"], [data-mobile-filter="scale"]', uniqueValues(scaleValue));
    syncControls();
    bind();
    render();
    restoreCatalogPosition();
  }

  fetch('/case-studies/intake/api/public-cases', { credentials: 'same-origin' })
    .then(function (response) { if (!response.ok) throw new Error('Published case data unavailable'); return response.json(); })
    .then(function (data) {
      var cases = (data && Array.isArray(data.cases) ? data.cases : []).filter(isPublicCatalogCase);
      if (!cases.length) throw new Error('No published cases');
      initialize(cases);
    })
    .catch(showLoadError);
}());
