/**
 * CAESTHETIC Beauty Salons vertical:
 * locale navigation, safe funnel analytics, pricing labels and Growth Score intake.
 */
(function () {
  "use strict";

  var INTAKE_VERSION = "caesthetic-growth-score/2.0";
  var STORAGE_KEY = "caesthetic_salon_growth_score_idem";
  var OPTIONAL_FIELDS = [
    "website_url",
    "gbp_url",
    "instagram_url",
    "booking_url_system",
    "location_count",
    "priority_treatments",
    "main_concern"
  ];

  function config() {
    return window.CAESTHETIC || {};
  }

  function locale() {
    return (document.documentElement.getAttribute("data-locale") || document.documentElement.lang || "en")
      .toLowerCase()
      .split("-")[0];
  }

  function route() {
    return window.location.pathname || "";
  }

  function safeDetail(extra) {
    var detail = {
      locale: locale(),
      vertical: "beauty_salon",
      route: route()
    };
    if (extra && extra.cta_position) detail.cta_position = extra.cta_position;
    if (extra && extra.form_type) detail.form_type = extra.form_type;
    if (extra && extra.stage) detail.stage = extra.stage;
    return detail;
  }

  function track(name, extra) {
    if (window.caestheticAnalytics && typeof window.caestheticAnalytics.track === "function") {
      window.caestheticAnalytics.track(name, safeDetail(extra || {}));
    }
  }

  function readUtm() {
    if (window.caestheticAnalytics && typeof window.caestheticAnalytics.utm === "function") {
      return window.caestheticAnalytics.utm() || {};
    }
    var params = new URLSearchParams(window.location.search);
    var out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"].forEach(function (key) {
      var value = params.get(key);
      if (value) out[key] = value.slice(0, 180);
    });
    return out;
  }

  function fieldValue(form, name) {
    var field = form.elements.namedItem(name);
    return field ? String(field.value || "").trim() : "";
  }

  function requestFingerprint(form) {
    return [
      fieldValue(form, "email"),
      fieldValue(form, "practice_name"),
      fieldValue(form, "city_state"),
      fieldValue(form, "name"),
      locale()
    ].join("|").toLowerCase();
  }

  function idempotencyKey(form) {
    var fp = requestFingerprint(form);
    try {
      var stored = window.sessionStorage.getItem(STORAGE_KEY);
      var parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.fp === fp && parsed.key) return parsed.key;
      var key =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fp: fp, key: key }));
      return key;
    } catch (e) {
      return null;
    }
  }

  function isQa(form) {
    var blob = [
      fieldValue(form, "name"),
      fieldValue(form, "email"),
      fieldValue(form, "practice_name")
    ].join("\n").toLowerCase();
    return /\btest\b/.test(blob) || /\bqa\b/.test(blob);
  }

  function pricing() {
    document.querySelectorAll("[data-cae-score-price]").forEach(function (node) {
      if (config().growthScoreLabel) node.textContent = config().growthScoreLabel;
    });
    document.querySelectorAll("[data-cae-sprint-price]").forEach(function (node) {
      if (config().sprintPriceLabel) node.textContent = config().sprintPriceLabel;
    });
  }

  function bindLanguageSelector() {
    document.querySelectorAll("[data-cae-language-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        track("beauty_language_selected", {
          cta_position: link.getAttribute("hreflang") || "language"
        });
      });
    });
  }

  function bindCtas() {
    document.querySelectorAll("[data-cae-salon-cta]").forEach(function (link) {
      link.addEventListener("click", function () {
        track("beauty_score_cta_clicked", {
          cta_position: link.getAttribute("data-cae-salon-cta") || "unknown"
        });
      });
    });
  }

  function localized(form, key, fallback) {
    return form.getAttribute("data-" + key) || fallback;
  }

  function showError(form, message) {
    var error = form.querySelector("[data-cae-salon-form-error]");
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  }

  function clearError(form) {
    var error = form.querySelector("[data-cae-salon-form-error]");
    if (error) error.hidden = true;
  }

  function validate(form) {
    var fields = ["name", "email", "practice_name", "city_state"];
    for (var i = 0; i < fields.length; i += 1) {
      var field = form.elements.namedItem(fields[i]);
      if (!field || !field.checkValidity()) {
        if (field) {
          field.reportValidity();
          field.focus();
        }
        return false;
      }
    }
    return true;
  }

  function optionalPayload(form, leadId, requestKey) {
    var selfReported = {};
    OPTIONAL_FIELDS.forEach(function (name) {
      var value = fieldValue(form, name);
      if (value) selfReported[name] = value;
    });
    var submittedAt = new Date().toISOString();
    return {
      intake_version: INTAKE_VERSION,
      intake_stage: "optional",
      lead_id: leadId,
      idempotency_key: requestKey,
      optional_submitted_at: submittedAt,
      self_reported: selfReported,
      enquiry_path_permission: false,
      enquiry_path_permission_at: null
    };
  }

  function postScore(api, payload) {
    return fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        return { response: response, data: data };
      });
    });
  }

  function bindOptional(form, leadId, requestKey) {
    var optional = form.querySelector("[data-cae-salon-optional]");
    var required = form.querySelector("[data-cae-salon-required]");
    var heading = form.querySelector("[data-cae-optional-heading]");
    var save = form.querySelector("[data-cae-optional-save]");
    var skip = form.querySelector("[data-cae-optional-skip]");
    var complete = form.querySelector("[data-cae-optional-complete]");
    var optionalError = form.querySelector("[data-cae-optional-error]");
    var fields = form.querySelector("[data-cae-optional-fields]");
    if (required) required.hidden = true;
    if (optional) optional.hidden = false;
    if (heading) heading.focus();

    function finish() {
      if (fields) fields.hidden = true;
      if (save) save.hidden = true;
      if (skip) skip.hidden = true;
      if (optionalError) optionalError.hidden = true;
      if (complete) {
        complete.hidden = false;
        complete.focus();
      }
    }

    if (skip && skip.getAttribute("data-bound") !== "1") {
      skip.setAttribute("data-bound", "1");
      skip.addEventListener("click", finish);
    }

    if (save && save.getAttribute("data-bound") !== "1") {
      save.setAttribute("data-bound", "1");
      save.addEventListener("click", function () {
        var api = (window.CAESTHETIC_API && window.CAESTHETIC_API.submitScore) || "";
        if (!api) {
          if (optionalError) optionalError.hidden = false;
          return;
        }
        var saveLabel = save.textContent;
        save.disabled = true;
        if (skip) skip.disabled = true;
        save.textContent = localized(form, "label-optional-saving", "Saving…");
        postScore(api, optionalPayload(form, leadId, requestKey))
          .then(function (result) {
            if (!result.response.ok || !result.data || result.data.ok !== true) {
              throw new Error("optional_failed");
            }
            finish();
          })
          .catch(function () {
            if (optionalError) optionalError.hidden = false;
            save.disabled = false;
            if (skip) skip.disabled = false;
            save.textContent = saveLabel;
          });
      });
    }
  }

  function bindForm() {
    document.querySelectorAll("[data-cae-salon-score-form]").forEach(function (form) {
      var started = false;
      form.addEventListener("focusin", function () {
        if (started) return;
        started = true;
        track("beauty_score_form_started");
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearError(form);
        if (!validate(form)) return;

        var button = form.querySelector('button[type="submit"]');
        var initialLabel = button ? button.textContent : "";
        if (button) {
          button.disabled = true;
          button.textContent = localized(form, "label-submitting", "Submitting…");
        }

        var api = (window.CAESTHETIC_API && window.CAESTHETIC_API.submitScore) || "";
        if (!api) {
          showError(form, localized(form, "error-unavailable", "Submission is temporarily unavailable."));
          if (button) {
            button.disabled = false;
            button.textContent = initialLabel;
          }
          return;
        }

        var utm = readUtm();
        var pageLocale = locale();
        var requestKey = idempotencyKey(form);
        var payload = {
          name: fieldValue(form, "name"),
          email: fieldValue(form, "email"),
          practice_name: fieldValue(form, "practice_name"),
          city_state: fieldValue(form, "city_state"),
          intake_version: INTAKE_VERSION,
          intake_stage: "required",
          required_submitted_at: new Date().toISOString(),
          source_page: window.location.pathname,
          source_domain: config().domain || "caesthetic.com",
          referrer: document.referrer || null,
          idempotency_key: requestKey,
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null,
          utm_term: utm.utm_term || null,
          utm_content: utm.utm_content || ("beauty_salon_" + pageLocale),
          utm_id: utm.utm_id || null,
          vertical: "beauty_salon",
          locale: pageLocale
        };
        if (isQa(form)) payload.qa_marker = true;

        postScore(api, payload)
          .then(function (result) {
            if (!result.response.ok || !result.data || result.data.ok !== true || !result.data.lead_id) {
              var code = result.data && result.data.error ? " (" + result.data.error + ")" : "";
              throw new Error("submit_failed" + code);
            }
            track("score_request_submitted", {
              form_type: "growth_score",
              stage: "required",
              cta_position: "form"
            });
            var success = form.querySelector("[data-cae-salon-form-success]");
            if (success) {
              success.hidden = false;
              success.focus();
            }
            form.querySelectorAll("[data-cae-salon-required] input").forEach(function (input) {
              input.disabled = true;
            });
            if (button) {
              button.textContent = localized(form, "label-success", "Request received");
              button.disabled = true;
            }
            bindOptional(form, result.data.lead_id, requestKey);
          })
          .catch(function (error) {
            var network = error && String(error.message || "").indexOf("submit_failed") === -1;
            showError(
              form,
              network
                ? localized(form, "error-network", "Network error. Try again.")
                : localized(form, "error-submit", "We could not record your request. Try again.")
            );
            if (button) {
              button.disabled = false;
              button.textContent = initialLabel;
            }
          });
      });
    });
  }

  function boot() {
    pricing();
    bindLanguageSelector();
    bindCtas();
    bindForm();
    track("beauty_salon_page_viewed");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
