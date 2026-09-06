(function () {
  'use strict';
  var library = window.CAESTHETIC_CASES;
  var params = new URLSearchParams(location.search);
  var returnPath = library.safeReturn(params.get('return'));
  if (!params.has('return')) { try { returnPath = library.safeReturn(sessionStorage.getItem('cae.caseCatalogReturn')); } catch (error) { /* optional storage */ } }
  document.querySelectorAll('[data-case-back]').forEach(function (link) { link.href = returnPath; });
  function set(selector, value) { var node = document.querySelector(selector); if (node) { node.textContent = library.text(value); node.hidden = !library.text(value); } }
  function make(tag, name, copy) { var node = document.createElement(tag); if (name) node.className = name; if (copy) node.textContent = copy; return node; }
  function track(event, data) { if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: event }, data)); }
  function href(id) { return '/case-studies/case/?id=' + encodeURIComponent(id) + '&return=' + encodeURIComponent(returnPath); }
  function renderMetrics(metrics) {
    var grid = document.querySelector('[data-metric-grid]'); grid.replaceChildren();
    metrics.slice(0, 6).forEach(function (metric) {
      var article = make('article', 'cae-case-metric');
      article.append(make('p', 'cae-case-label', library.evidenceLabel(metric)), make('h3', 'cae-h3', metric.name));
      if (metric.definition) article.append(make('p', '', metric.definition));
      var flow = make('div', 'cae-case-metric__flow');
      [['Before', metric.before], ['After', metric.after]].forEach(function (pair) { var part = make('div'); part.append(make('span', '', pair[0]), make('strong', '', pair[1].display)); if (pair[1].denominator) part.append(make('p', 'cae-case-source', pair[1].denominator)); flow.append(part); }); article.append(flow);
      var meta = make('dl'); [['Period', metric.timeframe], ['Source', metric.source], ['Context', metric.caveat]].forEach(function (pair) { if (!pair[1]) return; var row = make('div'); row.append(make('dt', '', pair[0]), make('dd', '', pair[1])); meta.append(row); }); article.append(meta); grid.append(article);
    });
  }
  function render(item, data) {
    var view = library.view(item, data.summaries); document.title = view.title + ' | CAESTHETIC';
    set('[data-case-id]', item.caseCode); set('[data-goal-label]', library.labels[(item.goals || [])[0]] || 'Case study'); set('[data-case-meta]', view.context); set('[data-case-title]', view.title); set('[data-owner-question]', item.ownerQuestion); set('[data-short-situation]', view.situation); set('[data-short-approach]', view.approach);
    var context = document.querySelector('[data-case-context]');
    [['Practice', item.clientName], ['Location', [item.city, item.country].filter(Boolean).join(', ')], ['Operating model', item.businessModel], ['Scale', item.practiceScale || item.locationCount]].forEach(function (pair) { if (!pair[1]) return; var row = make('div'); row.append(make('dt', '', pair[0]), make('dd', '', pair[1])); context.append(row); });
    set('[data-before-copy]', item.situationBefore || item.before); set('[data-diagnosis-copy]', item.bindingConstraint || item.diagnosis); set('[data-diagnosis-evidence]', item.constraintEvidence);
    var steps = Array.isArray(item.interventions) ? item.interventions : (item.workstreams || '').split(/\r?\n/); steps.filter(Boolean).slice(0, 8).forEach(function (copy) { document.querySelector('[data-interventions]').append(make('li', '', copy)); });
    set('[data-caesthetic-role]', item.caestheticRole); set('[data-practice-contribution]', item.practiceContribution);
    renderMetrics(view.metrics); set('[data-results-note]', view.metrics.length ? 'Read each result with its source, period and measurement context.' : 'No sourced before-and-after result is available for this case. The approach and its source context are documented below.');
    if (view.metrics.length) set('[data-after-copy]', item.resultNarrative || item.after);
    set('[data-data-source]', item.dataSource || 'A source has not been provided.'); set('[data-limitations]', item.limitations || 'Additional context has not been provided.');
    if (item.budgetContext) { document.querySelector('[data-budget-section]').hidden = false; set('[data-budget]', item.budgetContext); }
    set('[data-applicability]', item.applicability);
    var audit = item.linkedAudit;
    if (audit && /^https:\/\//i.test(audit.url || '') && audit.permission === 'approved' && audit.redactionStatus === 'verified' && ['public_redacted', 'request_nda'].includes(audit.accessLevel)) {
      document.querySelector('[data-audit-section]').hidden = false; set('[data-audit-title]', audit.title || 'Anonymized source audit'); set('[data-audit-meta]', [audit.pageCount ? audit.pageCount + ' pages' : '', audit.reviewedDate ? 'Reviewed ' + audit.reviewedDate : ''].filter(Boolean).join(' · ')); var link = document.querySelector('[data-audit-link]'); link.href = audit.url; link.textContent = audit.accessLevel === 'request_nda' ? 'Request the extended audit →' : 'Open anonymized audit →'; link.addEventListener('click', function () { track('case_audit_open', { case_id: item.id }); });
    }
    if (data.cases.length > 1) {
      var index = data.cases.findIndex(function (c) { return c.id === item.id; }); var previous = data.cases[(index - 1 + data.cases.length) % data.cases.length]; var next = data.cases[(index + 1) % data.cases.length];
      document.querySelector('[data-case-pagination]').hidden = false; document.querySelector('[data-prev-link]').href = href(previous.id); document.querySelector('[data-next-link]').href = href(next.id); set('[data-prev-title]', library.view(previous, data.summaries).title); set('[data-next-title]', library.view(next, data.summaries).title);
    }
    document.querySelector('[data-case-loading]').hidden = true; document.querySelector('[data-case-content]').hidden = false; track('case_detail_view', { case_id: item.id });
  }
  function error(unavailable) { document.querySelector('[data-case-loading]').hidden = true; document.querySelector('[data-case-error]').hidden = false; if (!unavailable) { set('[data-error-title]', 'We couldn’t load this case.'); set('[data-error-copy]', 'Please reload the page to try again, or return to the case studies.'); } document.title = 'Case unavailable | CAESTHETIC'; }
  var id = params.get('id'); if (!id || /^test[-_]/i.test(id)) return error(true);
  library.load().then(function (data) { var item = data.cases.find(function (c) { return c.id === id; }); if (!item) return error(true); render(item, data); }).catch(function () { error(false); });
}());
