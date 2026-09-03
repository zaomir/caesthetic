(function () {
  'use strict';

  var goalLabels = {
    bookings: 'More bookings',
    conversion: 'Better conversion',
    retention: 'Retention',
    reputation: 'Reputation',
    'multi-location': 'Multi-location'
  };

  var relevanceLabels = {
    'closest-match': 'Closest practice match',
    'adjacent-model': 'Adjacent operating model',
    'transferable-pattern': 'Transferable operating pattern'
  };

  var ownerQuestions = {
    bookings: 'Where is the first measurable constraint between demand and a confirmed booking?',
    conversion: 'Which decision gap is preventing a qualified enquiry from becoming a consultation?',
    retention: 'Where does the patient relationship lose continuity after the first transaction?',
    reputation: 'Which operating signal is weakening trust before a prospective patient makes contact?',
    'multi-location': 'Which shared operating standard will make location performance comparable?'
  };

  var ownerContexts = {
    bookings: 'The final case should help an owner distinguish a demand problem from a journey, response or scheduling problem before adding spend.',
    conversion: 'The final case should show where intent was lost, how the decision path changed and which denominator was used to verify improvement.',
    retention: 'The final case should separate communication activity from repeat behavior, with a defined cohort and observation window.',
    reputation: 'The final case should connect the visible trust signal to a documented practice workflow rather than treating reviews as a campaign.',
    'multi-location': 'The final case should show which operating definitions were standardized and where local variation remained necessary.'
  };

  var workstreamCopy = {
    bookings: 'Placeholder scope: repair the highest-friction step between local discovery, consultation request, response and confirmed booking.',
    conversion: 'Placeholder scope: reorganize proof, service information and response steps around the questions required for a confident decision.',
    retention: 'Placeholder scope: define the post-visit cadence, ownership and cohort signal used to evaluate continuity.',
    reputation: 'Placeholder scope: connect service recovery, review response and local trust signals to one accountable workflow.',
    'multi-location': 'Placeholder scope: establish shared definitions, templates and reporting while preserving necessary location-level context.'
  };

  var transferStatements = {
    bookings: 'The transferable question is whether qualified demand survives discovery, response and scheduling without an avoidable handoff loss.',
    conversion: 'The transferable pattern is a clearer decision path from high-intent enquiry to a booked consultation, with one defined denominator.',
    retention: 'The transferable pattern is an owned post-visit workflow tied to a repeat-behavior cohort rather than communication volume alone.',
    reputation: 'The transferable pattern is a documented service-recovery and review workflow that protects trust before a patient makes contact.',
    'multi-location': 'The transferable pattern is a shared operating definition that makes location performance comparable without erasing local context.'
  };

  function evidenceValue(item, key, fallback) {
    var evidence = item.evidence || {};
    var value = evidence[key];
    if (value && typeof value === 'object' && typeof value.display === 'string') return value.display;
    if (typeof value === 'string' && value) return value;
    if (typeof item[key] === 'string' && item[key]) return item[key];
    return fallback;
  }

  function applicability(item, primaryGoal) {
    var prefix = item.relevanceTier === 'closest-match'
      ? 'This is the closest available practice match. '
      : item.relevanceTier === 'adjacent-model'
        ? 'This is an adjacent operating model, not direct aesthetic-practice proof. '
        : 'This is a transferable operating pattern, not industry-specific proof. ';
    return prefix + (transferStatements[primaryGoal] || transferStatements.bookings);
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function renderLinkedAudit(item) {
    var audit = item.linkedAudit;
    if (!audit || audit.accessLevel === 'internal_only') return;

    var section = document.querySelector('[data-audit-section]');
    var nav = document.querySelector('[data-audit-nav]');
    var link = document.querySelector('[data-audit-link]');
    var redaction = audit.redaction || {};
    var checksComplete = redaction.identifiersRemoved === true && redaction.patientDataRemoved === true &&
      redaction.linksReviewed === true && redaction.screenshotsReviewed === true && redaction.metadataRemoved === true;
    var canExpose = audit.permission === 'approved' && audit.redactionStatus === 'verified' && checksComplete &&
      typeof audit.url === 'string' && /^https:\/\//.test(audit.url);

    section.hidden = false;
    nav.hidden = false;
    setText('[data-audit-title]', audit.title || 'Anonymized source audit');
    setText('[data-audit-access]', audit.accessLevel === 'request_nda' ? 'Extended copy available by request / NDA' : 'Anonymized public copy');
    setText('[data-audit-meta]', [audit.pageCount ? audit.pageCount + ' pages' : '', audit.reviewedDate ? 'Reviewed ' + audit.reviewedDate : ''].filter(Boolean).join(' · ') || 'Review status pending');

    if (canExpose) {
      link.href = audit.url;
      link.textContent = audit.accessLevel === 'request_nda' ? 'Request the extended audit' : 'Open anonymized audit';
      link.removeAttribute('aria-disabled');
      setText('[data-audit-note]', 'The linked copy passed permission and redaction review. No patient-level or clinical information is included.');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.textContent = 'Audit link pending review';
      setText('[data-audit-note]', 'The link stays locked until permission and every redaction check are verified.');
    }
  }

  function setCase(item, cases) {
    var primaryGoal = item.goals[0] || 'bookings';
    var baseline = evidenceValue(item, 'baseline', 'Baseline pending');
    var outcome = evidenceValue(item, 'outcome', 'Outcome pending');
    var timeframe = evidenceValue(item, 'timeframe', 'Timeframe pending');
    var evidenceStatus = evidenceValue(item, 'evidenceStatus', 'Placeholder — not evidence');
    var denominator = evidenceValue(item, 'denominator', 'Denominator pending');
    var practiceScale = evidenceValue(item, 'practiceScale', 'Scale pending');
    var budgetContext = evidenceValue(item, 'budgetContext', 'Budget context pending');
    var caestheticRole = evidenceValue(item, 'caestheticRole', 'Relationship pending');
    var practiceContribution = evidenceValue(item, 'practiceContribution', 'Practice contribution pending');
    var limitations = evidenceValue(item, 'limitations', 'Limitations pending');
    var dataSource = evidenceValue(item, 'dataSource', 'Data source pending');
    var index = cases.indexOf(item);
    var previous = cases[(index - 1 + cases.length) % cases.length];
    var next = cases[(index + 1) % cases.length];

    document.title = item.title + ' | CAESTHETIC';
    setText('[data-case-id]', item.id.toUpperCase());
    setText('[data-goal-label]', goalLabels[primaryGoal] || 'Owner goal');
    setText('[data-case-meta]', [item.industry, item.country, item.businessModel].join(' · '));
    setText('[data-case-title]', item.title);
    setText('[data-case-summary]', item.summary);
    setText('[data-relevance-label]', relevanceLabels[item.relevanceTier] || 'Practice relevance');
    setText('[data-applicability]', applicability(item, primaryGoal));
    setText('[data-baseline]', baseline);
    setText('[data-outcome]', outcome);
    setText('[data-timeframe]', timeframe);
    setText('[data-evidence-status]', evidenceStatus);
    setText('[data-denominator]', denominator);
    setText('[data-practice-scale]', practiceScale);
    setText('[data-budget-context]', budgetContext);
    setText('[data-caesthetic-role]', caestheticRole);
    setText('[data-context-industry]', item.industry);
    setText('[data-context-country]', item.country);
    setText('[data-context-model]', item.businessModel);
    setText('[data-context-evidence]', evidenceStatus);
    setText('[data-owner-question]', ownerQuestions[primaryGoal] || ownerQuestions.bookings);
    setText('[data-owner-context]', ownerContexts[primaryGoal] || ownerContexts.bookings);
    setText('[data-context-copy]', 'The final ' + item.industry.toLowerCase() + ' case will establish the ' + item.businessModel.toLowerCase() + ' operating model, market context, decision path and commercial baseline before describing any intervention.');
    setText('[data-workstream-copy]', workstreamCopy[primaryGoal] || workstreamCopy.bookings);
    setText('[data-ledger-baseline]', baseline === 'Baseline pending' ? 'Pending verified case data' : baseline);
    setText('[data-ledger-denominator]', denominator === 'Denominator pending' ? 'Pending verified case data' : denominator);
    setText('[data-ledger-timeframe]', timeframe === 'Timeframe pending' ? 'Pending verified case data' : timeframe);
    setText('[data-ledger-budget]', budgetContext === 'Budget context pending' ? 'Pending verified case data' : budgetContext);
    setText('[data-ledger-practice-contribution]', practiceContribution === 'Practice contribution pending' ? 'Pending verified case data' : practiceContribution);
    setText('[data-ledger-limitations]', limitations === 'Limitations pending' ? 'Pending verified case data' : limitations);
    setText('[data-ledger-source]', dataSource === 'Data source pending' ? 'Pending verified case data' : dataSource);
    setText('[data-ledger-relationship]', caestheticRole === 'Relationship pending' ? 'Pending verified case data' : caestheticRole);
    renderLinkedAudit(item);

    var cover = document.querySelector('[data-case-cover]');
    var coverFallback = document.querySelector('[data-case-cover-slot] .cae-media-slot__fallback');
    cover.removeAttribute('src');
    cover.setAttribute('data-media-id', item.mediaId);
    coverFallback.textContent = item.mediaId;
    if (window.CAESTHETIC_MEDIA) window.CAESTHETIC_MEDIA.resolve(document.querySelector('[data-case-cover-slot]'));

    var previousLink = document.querySelector('[data-prev-link]');
    var nextLink = document.querySelector('[data-next-link]');
    previousLink.href = '/case-studies/case/?id=' + encodeURIComponent(previous.id);
    nextLink.href = '/case-studies/case/?id=' + encodeURIComponent(next.id);
    setText('[data-prev-title]', previous.title);
    setText('[data-next-title]', next.title);
  }

  function showError() {
    Array.from(document.querySelectorAll('.cae-case-detail > :not([data-case-error])')).forEach(function (node) {
      node.hidden = true;
    });
    document.querySelector('[data-case-error]').hidden = false;
    document.title = 'Case unavailable | CAESTHETIC';
  }

  fetch('/assets/data/case-studies.placeholder.json', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('Case data unavailable');
      return response.json();
    })
    .then(function (data) {
      var requestedId = new URLSearchParams(window.location.search).get('id') || 'case-01';
      var item = data.cases.find(function (candidate) { return candidate.id === requestedId; });
      if (!item) {
        showError();
        return;
      }
      setCase(item, data.cases);
    })
    .catch(showError);
}());
