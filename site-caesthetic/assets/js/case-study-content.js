(function () {
  'use strict';
  var labels = { bookings: 'Consultation requests', conversion: 'Consultation booking', retention: 'Patient follow-up', reputation: 'Reviews and trust', 'multi-location': 'Multiple locations' };
  function text(value) { return typeof value === 'string' ? value.trim() : ''; }
  function isPublic(item) { return !!(item && item.id && !/^test[-_]/i.test(item.id) && !/^TEST\b/i.test(text(item.title))); }
  function clean(item) {
    var result = Object.assign({}, item);
    if (result.evidenceLevel === 'modeled' || !result.evidenceLevel) delete result.evidenceLevel;
    if (result.attribution === 'not_claimed' || !result.attribution) delete result.attribution;
    if (result.evidenceStatus === 'Modeled result') delete result.evidenceStatus;
    delete result.mediaId; delete result.coverMediaId;
    if (Array.isArray(result.metrics)) result.metrics = result.metrics.map(clean);
    if (result.headlineMetric) result.headlineMetric = clean(result.headlineMetric);
    return result;
  }
  function evidenceLabel(metric) {
    if (/publisher confirms|confirmed by (?:the )?case publisher/i.test(text(metric.source))) return "Publisher-confirmed";
    return metric.evidenceLevel === "verified" ? "Verified against source" : "Client-reported";
  }
  function metricValue(metric, observation) {
    var value = text(observation.value), unit = text(metric.unit);
    return value && /^-?\d+(?:[.,]\d+)?$/.test(value) ? value + (unit === '%' ? '%' : unit ? ' ' + unit : '') : text(observation.display);
  }
  function supportedMetrics(item) {
    return (Array.isArray(item.metrics) ? item.metrics : []).filter(function (metric) {
      var before = metric.before || {}, after = metric.after || {};
      return ['verified', 'client_reported'].includes(metric.evidenceLevel) && text(metric.source) && text(metric.timeframe) && text(before.display) && text(after.display) && !/documented|withheld/i.test([before.display, after.display, metric.source, metric.timeframe].join(' ')) && !/\b(modeled|modelled|hypothetical|synthetic)\b/i.test([metric.source, metric.caveat, item.dataSource, item.limitations, item.caestheticRole].join(' '));
    });
  }
  function view(item, summaries) {
    var saved = summaries && summaries[item.id];
    if (saved && (saved.sourceTitle !== item.title || saved.sourceUpdatedAt !== item.updatedAt)) saved = null;
    var short = item.card || {};
    return {
      title: text(short.title) || text(saved && saved.title) || text(item.title),
      situation: text(short.situation) || text(saved && saved.situation) || text(item.situationBefore || item.before),
      approach: text(short.approach) || text(saved && saved.approach) || text(item.interventionSummary) || (item.interventions || []).map(text).filter(Boolean).slice(0, 2).join(' '),
      context: [item.industry, item.city || item.country, item.locationCount ? item.locationCount + (String(item.locationCount) === '1' ? ' location' : ' locations') : ''].filter(Boolean).join(' · '),
      metrics: supportedMetrics(item)
    };
  }
  function safeReturn(value) {
    try { var url = new URL(value || '/case-studies/#case-library', location.origin); if (url.origin === location.origin && url.pathname === '/case-studies/') return url.pathname + url.search + '#case-library'; } catch (error) { /* use default */ }
    return '/case-studies/#case-library';
  }
  function load(id) {
    return Promise.all([
      fetch('/case-studies/intake/api/public-cases' + (id ? '?id=' + encodeURIComponent(id) : ''), { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('Case data unavailable'); return r.json(); }),
      fetch('/assets/data/case-study-summaries.json?v=text-cases-20260906').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
    ]).then(function (data) { return { cases: (data[0].cases || []).filter(isPublic).map(clean), summaries: data[1].cases || {} }; });
  }
  window.CAESTHETIC_CASES = { labels: labels, evidenceLabel: evidenceLabel, metricValue: metricValue, text: text, clean: clean, view: view, isPublic: isPublic, safeReturn: safeReturn, load: load };
}());
