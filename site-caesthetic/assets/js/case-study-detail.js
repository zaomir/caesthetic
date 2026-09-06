(function () {
  'use strict';

  var goalLabels = { bookings: 'More bookings', conversion: 'Better conversion', retention: 'Retention', reputation: 'Reputation', 'multi-location': 'Multi-location' };
  var relevanceLabels = { 'closest-match': 'Closest practice match', 'adjacent-model': 'Adjacent operating model', 'transferable-pattern': 'Transferable operating pattern' };
  var evidenceLabels = { verified: 'Verified evidence', client_reported: 'Client-reported result' };
  var returnPath = '/case-studies/#case-library';

  function isPublicCatalogCase(item) {
    if (!item || !item.id) return false;
    var id = String(item.id);
    var title = String(item.title || '').trim();
    if (/^test[-_]/i.test(id)) return false;
    if (/^TEST\b/i.test(title)) return false;
    return true;
  }

  function track(eventName, detail) {
    if (!Array.isArray(window.dataLayer)) return;
    window.dataLayer.push(Object.assign({ event: eventName }, detail || {}));
  }

  function safeReturnPath(value) {
    if (!value) return '';
    try {
      var url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin) return '';
      if (url.pathname.indexOf('/case-studies/') !== 0 || url.pathname.indexOf('/case-studies/case/') === 0) return '';
      return url.pathname + url.search + (url.hash || '#case-library');
    } catch (error) {
      return '';
    }
  }

  function configureReturnPath() {
    var params = new URLSearchParams(window.location.search);
    var candidate = safeReturnPath(params.get('return'));
    if (!candidate) {
      try { candidate = safeReturnPath(sessionStorage.getItem('cae.caseCatalogReturn')); } catch (error) { candidate = ''; }
    }
    returnPath = candidate || returnPath;
    document.querySelectorAll('[data-case-back]').forEach(function (link) { link.href = returnPath; });
  }

  function caseDetailHref(id) {
    return '/case-studies/case/?id=' + encodeURIComponent(id) + '&return=' + encodeURIComponent(returnPath);
  }

  function setText(selector, value, fallback) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value || fallback || '';
  }
  function create(tag, className, copy) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof copy === 'string') node.textContent = copy;
    return node;
  }
  function metrics(item) {
    if (Array.isArray(item.metrics) && item.metrics.length) return item.metrics;
    return [{
      id: 'primary', name: 'Primary business metric', definition: item.metricDefinition || '',
      before: { display: item.baseline || 'Baseline documented', denominator: item.denominator || '' },
      after: { display: item.outcome || 'Outcome documented', denominator: item.denominator || '' },
      delta: { display: item.delta || 'Change documented' }, timeframe: item.timeframe || '',
      source: item.dataSource || '', evidenceLevel: item.evidenceLevel || 'client_reported', caveat: item.limitations || '', isHeadline: true
    }];
  }
  function evidenceValue(item, key, fallback) {
    var value = item[key];
    if (typeof value === 'string' && value) return value;
    var evidence = item.evidence || {};
    value = evidence[key];
    if (value && typeof value === 'object' && typeof value.display === 'string') return value.display;
    if (typeof value === 'string' && value) return value;
    return fallback;
  }
  function renderMetrics(item) {
    var container = document.querySelector('[data-metric-grid]');
    container.replaceChildren();
    metrics(item).slice(0, 6).forEach(function (metric, index) {
      var card = create('article', 'cae-case-metric' + (index === 0 ? ' cae-case-metric--primary' : ''));
      var head = create('div', 'cae-case-metric__head');
      head.append(create('span', '', index === 0 ? 'Headline metric' : 'Supporting metric'), create('b', '', evidenceLabels[metric.evidenceLevel] || 'Evidence documented'));
      var title = create('h3', 'cae-h3', metric.name || 'Business metric');
      var flow = create('div', 'cae-case-metric__flow');
      var before = create('div', 'cae-case-metric__point');
      before.append(create('span', '', 'Before'), create('strong', '', (metric.before || {}).display || 'Baseline documented'));
      var arrow = create('span', 'cae-case-metric__arrow', '→');
      arrow.setAttribute('aria-hidden', 'true');
      var after = create('div', 'cae-case-metric__point');
      after.append(create('span', '', 'After'), create('strong', '', (metric.after || {}).display || 'Outcome documented'));
      flow.append(before, arrow, after);
      var delta = create('p', 'cae-case-metric__delta', (metric.delta || {}).display || 'Change documented');
      var meta = create('dl', 'cae-case-metric__meta');
      [['Window', metric.timeframe], ['Denominator', (metric.after || {}).denominator || (metric.before || {}).denominator], ['Source', metric.source]].forEach(function (pair) {
        if (!pair[1]) return;
        var row = create('div');
        row.append(create('dt', '', pair[0]), create('dd', '', pair[1]));
        meta.appendChild(row);
      });
      card.append(head, title, flow, delta);
      if (metric.definition) card.appendChild(create('p', 'cae-case-metric__definition', metric.definition));
      if (meta.childElementCount) card.appendChild(meta);
      if (metric.caveat) card.appendChild(create('p', 'cae-case-metric__caveat', metric.caveat));
      container.appendChild(card);
    });
  }
  function renderInterventions(item) {
    var list = document.querySelector('[data-interventions]');
    list.replaceChildren();
    var interventions = Array.isArray(item.interventions) ? item.interventions : [];
    if (!interventions.length && item.workstreams) interventions = item.workstreams.split(/\r?\n/).filter(Boolean);
    if (!interventions.length) interventions = ['Intervention sequence documented in the case'];
    interventions.slice(0, 8).forEach(function (copy, index) {
      var row = create('li');
      row.append(create('span', '', String(index + 1).padStart(2, '0')), create('p', '', copy));
      list.appendChild(row);
    });
  }
  function renderLinkedAudit(item) {
    var audit = item.linkedAudit;
    if (!audit || !audit.url || audit.permission !== 'approved' || audit.redactionStatus !== 'verified' || audit.accessLevel === 'internal_only') return;
    var section = document.querySelector('[data-audit-section]');
    var nav = document.querySelector('[data-audit-nav]');
    var link = document.querySelector('[data-audit-link]');
    section.hidden = false;
    nav.hidden = false;
    setText('[data-audit-title]', audit.title, 'Anonymized source audit');
    setText('[data-audit-access]', audit.accessLevel === 'request_nda' ? 'Extended copy by request / NDA' : 'Anonymized public copy');
    setText('[data-audit-meta]', [audit.pageCount ? audit.pageCount + ' pages' : '', audit.reviewedDate ? 'Reviewed ' + audit.reviewedDate : ''].filter(Boolean).join(' · '), 'Redaction verified');
    link.href = audit.url;
    link.textContent = audit.accessLevel === 'request_nda' ? 'Request the extended audit' : 'Open anonymized audit';
    link.addEventListener('click', function () { track('case_audit_open', { case_id: item.id, access_level: audit.accessLevel }); });
  }
  function renderPagination(item, cases) {
    var index = cases.indexOf(item);
    var previous = cases[(index - 1 + cases.length) % cases.length];
    var next = cases[(index + 1) % cases.length];
    var previousLink = document.querySelector('[data-prev-link]');
    var nextLink = document.querySelector('[data-next-link]');
    if (cases.length < 2) {
      document.querySelector('[data-case-pagination]').hidden = true;
      return;
    }
    previousLink.href = caseDetailHref(previous.id);
    nextLink.href = caseDetailHref(next.id);
    setText('[data-prev-title]', previous.title);
    setText('[data-next-title]', next.title);
  }
  function setCase(item, cases) {
    var primaryGoal = (item.goals || [])[0] || 'bookings';
    var headline = metrics(item)[0];
    var evidenceStatus = evidenceLabels[item.evidenceLevel] || item.evidenceStatus || 'Evidence documented';
    document.title = item.title + ' | CAESTHETIC';
    setText('[data-case-id]', item.caseCode || item.id);
    setText('[data-goal-label]', goalLabels[primaryGoal], 'Business growth');
    setText('[data-case-meta]', [item.industry, item.country, item.businessModel].filter(Boolean).join(' · '));
    setText('[data-case-title]', item.title);
    setText('[data-case-summary]', item.summary);
    setText('[data-relevance-label]', relevanceLabels[item.relevanceTier], 'Practice relevance');
    setText('[data-evidence-status]', evidenceStatus);
    setText('[data-client-name]', item.clientName, 'Anonymized practice');
    setText('[data-context-industry]', item.industry, 'Industry documented');
    setText('[data-context-country]', [item.city, item.country].filter(Boolean).join(', '), 'Market documented');
    setText('[data-context-model]', item.businessModel, 'Operating model documented');
    setText('[data-context-scale]', item.practiceScale || item.locationCount, 'Scale documented');
    setText('[data-applicability]', item.applicability, 'The operating pattern and its transfer limits are documented in this case.');
    setText('[data-before-copy]', item.before || item.situationBefore, 'The starting condition is documented in the case evidence.');
    setText('[data-diagnosis-copy]', item.diagnosis || item.bindingConstraint, 'The binding constraint is documented in the case evidence.');
    setText('[data-diagnosis-evidence]', item.constraintEvidence, 'The diagnosis was checked against the available operating evidence.');
    setText('[data-after-copy]', item.after || item.resultNarrative, 'The resulting operating change is documented in the case evidence.');
    setText('[data-attribution]', item.attribution, 'Attribution is limited to the available evidence.');
    setText('[data-ledger-baseline]', (headline.before || {}).display, evidenceValue(item, 'baseline', 'Baseline documented'));
    setText('[data-ledger-denominator]', (headline.after || {}).denominator || (headline.before || {}).denominator, evidenceValue(item, 'denominator', 'Denominator documented'));
    setText('[data-ledger-timeframe]', headline.timeframe, evidenceValue(item, 'timeframe', 'Measurement window documented'));
    setText('[data-ledger-budget]', evidenceValue(item, 'budgetContext', 'Budget context documented'));
    setText('[data-ledger-practice-contribution]', evidenceValue(item, 'practiceContribution', 'Practice contribution documented'));
    setText('[data-ledger-limitations]', evidenceValue(item, 'limitations', 'Limitations documented'));
    setText('[data-ledger-source]', headline.source || evidenceValue(item, 'dataSource', 'Source documented'));
    setText('[data-ledger-relationship]', evidenceValue(item, 'caestheticRole', 'CAESTHETIC role documented'));
    renderMetrics(item);
    renderInterventions(item);
    renderLinkedAudit(item);
    renderPagination(item, cases);
    var cover = document.querySelector('[data-case-cover]');
    cover.removeAttribute('src');
    cover.setAttribute('data-media-id', (window.CAESTHETIC_MEDIA && window.CAESTHETIC_MEDIA.coverMediaId(item)) || item.mediaId || 'case.library.hero.abstract');
    cover.setAttribute('data-media-fallback', item.mediaId || 'case.library.hero.abstract');
    cover.setAttribute('alt', 'Illustrative cover for ' + item.title);
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(document.querySelector('[data-case-cover-slot]'));
    document.querySelector('[data-case-content]').hidden = false;
    track('case_detail_view', { case_id: item.id, evidence_level: item.evidenceLevel || 'documented' });
  }
  function showError() {
    document.querySelector('[data-case-content]').hidden = true;
    document.querySelector('[data-case-error]').hidden = false;
    document.title = 'Case unavailable | CAESTHETIC';
  }

  configureReturnPath();
  var requestedId = new URLSearchParams(window.location.search).get('id');
  if (!requestedId || /^test[-_]/i.test(requestedId)) return showError();
  fetch('/case-studies/intake/api/public-cases?id=' + encodeURIComponent(requestedId), { credentials: 'same-origin' })
    .then(function (response) { if (!response.ok) throw new Error('Published case unavailable'); return response.json(); })
    .then(function (data) {
      var cases = (data && Array.isArray(data.cases) ? data.cases : []).filter(isPublicCatalogCase);
      var item = cases.find(function (candidate) { return candidate.id === requestedId; });
      if (!item) throw new Error('Case not found');
      return fetch('/case-studies/intake/api/public-cases', { credentials: 'same-origin' })
        .then(function (response) { return response.ok ? response.json() : { cases: [item] }; })
        .then(function (all) {
          var siblings = (Array.isArray(all.cases) ? all.cases : []).filter(isPublicCatalogCase);
          setCase(item, siblings.length ? siblings : [item]);
        });
    })
    .catch(showError);
}());
