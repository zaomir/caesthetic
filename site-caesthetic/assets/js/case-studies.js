(function () {
  'use strict';

  var labels = {
    bookings: 'More bookings',
    conversion: 'Better conversion',
    retention: 'Retention',
    reputation: 'Reputation',
    'multi-location': 'Multi-location'
  };

  var tierLabels = {
    'closest-match': 'Closest practice match',
    'adjacent-model': 'Adjacent operating model',
    'transferable-pattern': 'Transferable pattern'
  };

  var state = {
    cases: [],
    activeGoal: 'bookings',
    filters: { goal: '', industry: '', country: '', businessModel: '', sort: 'relevance' },
    visible: 10
  };

  var list = document.querySelector('[data-case-list]');
  if (!list) return;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function uniqueValues(key) {
    return Array.from(new Set(state.cases.map(function (item) { return item[key]; }))).sort();
  }

  function populateSelect(selector, values) {
    document.querySelectorAll(selector).forEach(function (select) {
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  }

  function relevanceScore(item) {
    var tier = { 'closest-match': 0, 'adjacent-model': 10, 'transferable-pattern': 20 }[item.relevanceTier] || 30;
    return tier + (item.goals.indexOf(state.activeGoal) === -1 ? 5 : 0);
  }

  function filteredCases(filters) {
    var workingFilters = filters || state.filters;
    var items = state.cases.filter(function (item) {
      return (!workingFilters.goal || item.goals.indexOf(workingFilters.goal) !== -1) &&
        (!workingFilters.industry || item.industry === workingFilters.industry) &&
        (!workingFilters.country || item.country === workingFilters.country) &&
        (!workingFilters.businessModel || item.businessModel === workingFilters.businessModel);
    });

    return items.sort(function (a, b) {
      if (workingFilters.sort === 'title') return a.title.localeCompare(b.title);
      if (workingFilters.sort === 'country') return a.country.localeCompare(b.country) || a.title.localeCompare(b.title);
      return relevanceScore(a) - relevanceScore(b) || a.title.localeCompare(b.title);
    });
  }

  function makeMedia(item) {
    var figure = element('figure', 'cae-media-slot cae-case-row__visual');
    var frame = element('div', 'cae-media-slot__frame');
    var image = document.createElement('img');
    image.setAttribute('data-media-id', item.mediaId);
    image.setAttribute('alt', '');
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    var fallback = element('span', 'cae-media-slot__fallback', item.mediaId);
    fallback.setAttribute('aria-hidden', 'true');
    frame.append(image, fallback);
    figure.appendChild(frame);
    return figure;
  }

  function makeCaseRow(item) {
    var article = element('article', 'cae-case-row');
    article.setAttribute('data-case-id', item.id);
    article.appendChild(makeMedia(item));

    var story = element('div', 'cae-case-row__story');
    story.appendChild(element('span', 'cae-case-row__tier', tierLabels[item.relevanceTier]));
    story.appendChild(element('p', 'cae-case-meta', [item.industry, item.country, item.businessModel].join(' · ')));
    var title = element('h3', 'cae-h3');
    var titleLink = element('a', 'cae-case-title-link', item.title);
    titleLink.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    title.appendChild(titleLink);
    story.appendChild(title);
    story.appendChild(element('p', '', item.summary));
    article.appendChild(story);

    var proof = element('div', 'cae-case-row__proof');
    proof.appendChild(element('strong', '', item.baseline + ' → ' + item.outcome.toLowerCase()));
    proof.appendChild(element('span', '', item.timeframe));
    proof.appendChild(element('span', '', item.evidenceStatus));
    var caseLink = element('a', 'cae-case-link', 'Read case →');
    caseLink.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    caseLink.setAttribute('aria-label', 'Read case: ' + item.title);
    proof.appendChild(caseLink);
    article.appendChild(proof);
    return article;
  }

  function setFeatured() {
    var item = state.cases.slice().sort(function (a, b) {
      return relevanceScore(a) - relevanceScore(b);
    })[0];
    if (!item) return;

    document.querySelector('[data-featured-title]').textContent = item.title;
    document.querySelector('[data-featured-summary]').textContent = item.summary;
    document.querySelector('[data-featured-meta]').textContent = [item.industry, item.country, item.businessModel].join(' · ');
    document.querySelector('[data-featured-outcome]').textContent = item.baseline + ' → ' + item.outcome.toLowerCase();
    document.querySelector('[data-featured-window]').textContent = item.timeframe;

    var featuredLink = document.querySelector('[data-featured-link]');
    featuredLink.href = '/case-studies/case/?id=' + encodeURIComponent(item.id);
    featuredLink.setAttribute('aria-label', 'Read full case: ' + item.title);

    var image = document.querySelector('[data-featured-media] img');
    var fallback = document.querySelector('[data-featured-media] .cae-media-slot__fallback');
    image.removeAttribute('src');
    image.setAttribute('data-media-id', item.mediaId);
    fallback.textContent = item.mediaId;
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(document.querySelector('[data-featured-media]'));
  }

  function activeFilterCount() {
    return ['goal', 'industry', 'country', 'businessModel'].filter(function (key) { return state.filters[key]; }).length;
  }

  function render() {
    var items = filteredCases();
    var visibleItems = items.slice(0, state.visible);
    list.replaceChildren();
    visibleItems.forEach(function (item) { list.appendChild(makeCaseRow(item)); });
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(list);

    var countLabel = items.length + (items.length === 1 ? ' case' : ' cases');
    var rankingLabel = 'Ranked for ' + labels[state.activeGoal];
    var filterLabel = state.filters.goal ? ' · Filtered by ' + labels[state.filters.goal] : '';
    document.querySelector('[data-result-count]').textContent = countLabel + ' · ' + rankingLabel + filterLabel;
    document.querySelector('[data-result-count-mobile]').textContent = countLabel;
    document.querySelector('[data-active-goal-mobile]').textContent = rankingLabel + filterLabel;
    document.querySelector('[data-filter-count]').textContent = activeFilterCount();
    document.querySelector('[data-visible-range]').textContent = items.length ? 'Showing 1–' + Math.min(state.visible, items.length) : 'Showing 0';

    var empty = document.querySelector('[data-empty-state]');
    empty.hidden = items.length !== 0;
    list.hidden = items.length === 0;

    var loadMore = document.querySelector('[data-load-more]');
    loadMore.hidden = state.visible >= items.length;
    loadMore.textContent = 'Show ' + Math.min(10, items.length - state.visible) + ' more cases';

    var clear = document.querySelector('[data-clear-filters]');
    clear.disabled = activeFilterCount() === 0 && state.filters.sort === 'relevance';
  }

  function syncControls() {
    document.querySelectorAll('[data-filter]').forEach(function (control) {
      control.value = state.filters[control.getAttribute('data-filter')];
    });
    document.querySelectorAll('[data-mobile-filter]').forEach(function (control) {
      control.value = state.filters[control.getAttribute('data-mobile-filter')];
    });
  }

  function clearFilters() {
    state.filters = { goal: '', industry: '', country: '', businessModel: '', sort: 'relevance' };
    state.visible = 10;
    syncControls();
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
        render();
        history.replaceState(null, '', '?goal=' + encodeURIComponent(state.activeGoal) + '#case-library');
      });
    });

    document.querySelectorAll('[data-filter]').forEach(function (control) {
      control.addEventListener('change', function () {
        state.filters[control.getAttribute('data-filter')] = control.value;
        state.visible = 10;
        syncControls();
        render();
      });
    });

    document.querySelector('[data-load-more]').addEventListener('click', function () {
      state.visible += 10;
      render();
    });
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
      var clearedPreview = Object.assign({}, state.filters, { goal: '', industry: '', country: '', businessModel: '' });
      document.querySelector('[data-dialog-result-count]').textContent = filteredCases(clearedPreview).length;
    });
    document.querySelectorAll('[data-mobile-filter]').forEach(function (control) {
      control.addEventListener('change', function () {
        var previewFilters = Object.assign({}, state.filters);
        document.querySelectorAll('[data-mobile-filter]').forEach(function (input) {
          previewFilters[input.getAttribute('data-mobile-filter')] = input.value;
        });
        document.querySelector('[data-dialog-result-count]').textContent = filteredCases(previewFilters).length;
      });
    });
    document.querySelector('[data-mobile-filter-form]').addEventListener('submit', function () {
      document.querySelectorAll('[data-mobile-filter]').forEach(function (control) {
        state.filters[control.getAttribute('data-mobile-filter')] = control.value;
      });
      state.visible = 10;
      syncControls();
      render();
    });
  }

  fetch('/assets/data/case-studies.placeholder.json', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('Case data unavailable');
      return response.json();
    })
    .then(function (data) {
      state.cases = data.cases;
      var requestedGoal = new URLSearchParams(window.location.search).get('goal');
      if (labels[requestedGoal]) state.activeGoal = requestedGoal;
      populateSelect('[data-filter="industry"], [data-mobile-filter="industry"]', uniqueValues('industry'));
      populateSelect('[data-filter="country"], [data-mobile-filter="country"]', uniqueValues('country'));
      document.querySelectorAll('[data-case-goal]').forEach(function (button) {
        var active = button.getAttribute('data-case-goal') === state.activeGoal;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      bind();
      setFeatured();
      render();
    })
    .catch(function () {
      list.replaceChildren(element('p', 'cae-case-data-error', 'Placeholder case data could not be loaded.'));
      document.querySelector('[data-load-more]').hidden = true;
    });
}());
