/**
 * CAESTHETIC Phase 1 — Growth Score form + Sprint inquiry helpers.
 */
(function () {
  "use strict";

  var IDEM_STORAGE_KEY = "caesthetic_growth_score_idem";
  var INTAKE_VERSION = "caesthetic-growth-score/2.0";
  var REQUIRED_FIELDS = ["name", "email", "practice_name", "city_state"];
  var OPTIONAL_FIELDS = [
    "website_url",
    "gbp_url",
    "instagram_url",
    "priority_treatments",
    "booking_url_system",
    "main_concern",
    "relevant_competitors",
    "preferred_contact_phone",
  ];

  function cfg() {
    return window.CAESTHETIC || {};
  }

  function track(name, detail) {
    if (window.caestheticAnalytics && typeof window.caestheticAnalytics.track === "function") {
      window.caestheticAnalytics.track(name, detail || {});
    }
  }

  function readUtm() {
    if (window.caestheticAnalytics && typeof window.caestheticAnalytics.utm === "function") {
      return window.caestheticAnalytics.utm() || {};
    }
    return {};
  }

  function idempotencyKey() {
    try {
      var existing = window.sessionStorage.getItem(IDEM_STORAGE_KEY);
      if (existing) return existing;
      var next =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
      window.sessionStorage.setItem(IDEM_STORAGE_KEY, next);
      return next;
    } catch (e) {
      return null;
    }
  }

  function appendQuery(path) {
    var search = window.location.search;
    if (!search || search === "?") return path;
    return path.indexOf("?") >= 0 ? path + "&" + search.slice(1) : path + search;
  }

  function preserveQueryOnLinks() {
    if (!window.location.search) return;
    document.querySelectorAll('a[href="/growth-score/"], a[href="/assessment/"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "/assessment/") href = "/growth-score/";
      link.setAttribute("href", appendQuery(href));
    });
    document.querySelectorAll('form[action="/growth-score/"]').forEach(function (form) {
      form.setAttribute("action", appendQuery("/growth-score/"));
    });
  }

  function applyContactOverrides() {
    var c = cfg();
    var phoneWrap = document.getElementById("cae-footer-phone-wrap");
    var phone = document.getElementById("cae-footer-phone");
    if (phoneWrap && phone && c.phoneDisplay && c.phoneE164) {
      phone.textContent = c.phoneDisplay;
      phone.setAttribute("href", "tel:" + c.phoneE164);
      phoneWrap.hidden = false;
    }
    document.querySelectorAll("[data-cae-sprint-price]").forEach(function (el) {
      if (c.sprintPriceLabel) el.textContent = c.sprintPriceLabel;
    });
    document.querySelectorAll("[data-cae-score-price]").forEach(function (el) {
      if (c.growthScoreLabel) el.textContent = c.growthScoreLabel;
    });
  }

  function showFormError(form, message) {
    var err = form.querySelector(".cae-form-error:not([data-cae-optional-error])");
    if (!err) {
      err = document.createElement("p");
      err.className = "cae-form-error";
      err.setAttribute("data-cae-required-error", "");
      err.setAttribute("role", "alert");
      form.insertBefore(err, form.firstChild);
    }
    err.textContent = message;
    err.hidden = false;
  }

  function clearFormError(form) {
    var err = form.querySelector(".cae-form-error:not([data-cae-optional-error])");
    if (err) err.hidden = true;
  }

  function analyticsDetail(stage) {
    return {
      form_type: "growth_score",
      intake_version: INTAKE_VERSION,
      stage: stage,
    };
  }

  function trackIntake(name, stage) {
    track(name, analyticsDetail(stage));
  }

  function fieldValue(form, name) {
    var field = form.elements.namedItem(name);
    return field ? String(field.value || "").trim() : "";
  }

  function validateFields(form, names) {
    for (var i = 0; i < names.length; i++) {
      var field = form.elements.namedItem(names[i]);
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

  function setScoreStage(form, stage) {
    form.setAttribute("data-cae-current-stage", String(stage));
    form.querySelectorAll("[data-cae-score-stage]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-cae-score-stage") !== String(stage);
    });
    form.querySelectorAll("[data-cae-progress-step]").forEach(function (item) {
      var itemStage = Number(item.getAttribute("data-cae-progress-step"));
      item.classList.toggle("is-complete", itemStage < stage);
      item.classList.toggle("is-current", itemStage === stage);
      if (itemStage === stage) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  }

  function requiredPayload(form, requestKey) {
    var utm = readUtm();
    return {
      name: fieldValue(form, "name"),
      email: fieldValue(form, "email"),
      practice_name: fieldValue(form, "practice_name"),
      city_state: fieldValue(form, "city_state"),
      intake_version: INTAKE_VERSION,
      intake_stage: "required",
      required_submitted_at: new Date().toISOString(),
      source_page: window.location.pathname,
      source_domain: cfg().domain || "caesthetic.com",
      referrer: document.referrer || null,
      idempotency_key: requestKey,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_term: utm.utm_term || null,
      utm_content: utm.utm_content || null,
      utm_id: utm.utm_id || null,
    };
  }

  function optionalPayload(form, leadId, requestKey) {
    var selfReported = {};
    OPTIONAL_FIELDS.forEach(function (name) {
      var value = fieldValue(form, name);
      if (value) selfReported[name] = value;
    });
    var permissionField = form.elements.namedItem("enquiry_path_permission");
    var permission = !!(permissionField && permissionField.checked);
    var submittedAt = new Date().toISOString();
    return {
      intake_version: INTAKE_VERSION,
      intake_stage: "optional",
      lead_id: leadId,
      idempotency_key: requestKey,
      optional_submitted_at: submittedAt,
      self_reported: selfReported,
      enquiry_path_permission: permission,
      enquiry_path_permission_at: permission ? submittedAt : null,
    };
  }

  function postScore(api, payload) {
    return fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().catch(function () {
        return {};
      }).then(function (data) {
        return { res: res, data: data };
      });
    });
  }

  function isValidLeadId(value) {
    return (
      typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    );
  }

  function initScoreForm() {
    var forms = document.querySelectorAll("[data-cae-score-form]");
    if (!forms.length) return;

    forms.forEach(function (form) {
      if (form.getAttribute("data-cae-score-bound") === "1") return;
      form.setAttribute("data-cae-score-bound", "1");

      var isMultistage = form.hasAttribute("data-cae-multistage-score-form");
      var successEl = form.querySelector(".cae-form-success");
      var requestKey = idempotencyKey();
      var leadId = null;
      if (successEl) successEl.hidden = true;

      if (isMultistage) {
        setScoreStage(form, 1);
        trackIntake("growth_score_intake_view", "view");

        var continueButton = form.querySelector("[data-cae-contact-continue]");
        var backButton = form.querySelector("[data-cae-score-back]");
        if (continueButton) {
          continueButton.addEventListener("click", function () {
            if (!validateFields(form, ["name", "email"])) return;
            trackIntake("growth_score_contact_continue", "contact");
            setScoreStage(form, 2);
            var practiceField = form.elements.namedItem("practice_name");
            if (practiceField) practiceField.focus();
          });
        }
        if (backButton) {
          backButton.addEventListener("click", function () {
            setScoreStage(form, 1);
            var nameField = form.elements.namedItem("name");
            if (nameField) nameField.focus();
          });
        }
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearFormError(form);

        if (isMultistage && form.getAttribute("data-cae-current-stage") === "1") {
          if (!validateFields(form, ["name", "email"])) return;
          trackIntake("growth_score_contact_continue", "contact");
          setScoreStage(form, 2);
          var practiceField = form.elements.namedItem("practice_name");
          if (practiceField) practiceField.focus();
          return;
        }
        if (isMultistage && form.getAttribute("data-cae-current-stage") !== "2") return;

        if (!validateFields(form, REQUIRED_FIELDS)) return;

        var payload = requiredPayload(form, requestKey);

        var btn = form.querySelector("[data-cae-required-submit]") || form.querySelector('button[type="submit"]');
        var btnLabel = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Submitting…";
        }

        var api = (window.CAESTHETIC_API && window.CAESTHETIC_API.submitScore) || "";
        if (!api) {
          showFormError(form, "Submission is temporarily unavailable. Email " + (cfg().contactEmail || "info@caesthetic.com") + ".");
          if (btn) {
            btn.disabled = false;
            btn.textContent = btnLabel;
          }
          return;
        }

        postScore(api, payload)
          .then(function (result) {
            if (
              !result.res.ok ||
              !result.data ||
              result.data.ok !== true ||
              !isValidLeadId(result.data.lead_id)
            ) {
              var errCode = (result.data && result.data.error) || "submit_failed";
              showFormError(
                form,
                "We could not record your request (" + errCode + "). Try again or email " +
                  (cfg().contactEmail || "info@caesthetic.com") + "."
              );
              if (btn) {
                btn.disabled = false;
                btn.textContent = btnLabel;
              }
              return;
            }

            leadId = result.data.lead_id;
            track("score_request_submitted", analyticsDetail("required"));
            trackIntake("growth_score_required_submit_success", "required");

            if (successEl) {
              successEl.hidden = false;
            }
            if (isMultistage) {
              setScoreStage(form, 3);
              var optionalHeading = form.querySelector("[data-cae-optional-heading]");
              if (optionalHeading) optionalHeading.focus();
            } else if (successEl) {
              successEl.focus();
            }
            if (btn) btn.textContent = "Request received";
          })
          .catch(function () {
            showFormError(
              form,
              "Network error. Try again or email " + (cfg().contactEmail || "info@caesthetic.com") + "."
            );
            if (btn) {
              btn.disabled = false;
              btn.textContent = btnLabel;
            }
          });
      });

      if (isMultistage) {
        var optionalSave = form.querySelector("[data-cae-optional-save]");
        var optionalSkip = form.querySelector("[data-cae-optional-skip]");
        var optionalFields = form.querySelector("[data-cae-optional-fields]");
        var optionalComplete = form.querySelector("[data-cae-optional-complete]");
        var optionalError = form.querySelector("[data-cae-optional-error]");

        function finishOptional(eventName) {
          if (optionalFields) optionalFields.hidden = true;
          if (optionalComplete) {
            optionalComplete.hidden = false;
            optionalComplete.focus();
          }
          if (optionalError) optionalError.hidden = true;
          trackIntake(eventName, "optional");
        }

        if (optionalSkip) {
          optionalSkip.addEventListener("click", function () {
            finishOptional("growth_score_optional_skipped");
          });
        }

        if (optionalSave) {
          optionalSave.addEventListener("click", function () {
            if (!leadId) return;
            if (optionalError) optionalError.hidden = true;
            var optionalSaveLabel = optionalSave.textContent;
            optionalSave.disabled = true;
            if (optionalSkip) optionalSkip.disabled = true;
            optionalSave.textContent = "Saving…";

            var api = (window.CAESTHETIC_API && window.CAESTHETIC_API.submitScore) || "";
            if (!api) {
              if (optionalError) optionalError.hidden = false;
              optionalSave.disabled = false;
              if (optionalSkip) optionalSkip.disabled = false;
              optionalSave.textContent = optionalSaveLabel;
              return;
            }

            postScore(api, optionalPayload(form, leadId, requestKey))
              .then(function (result) {
                if (
                  !result.res.ok ||
                  !result.data ||
                  result.data.ok !== true ||
                  result.data.lead_id !== leadId
                ) {
                  if (optionalError) optionalError.hidden = false;
                  optionalSave.disabled = false;
                  if (optionalSkip) optionalSkip.disabled = false;
                  optionalSave.textContent = optionalSaveLabel;
                  return;
                }
                finishOptional("growth_score_optional_saved");
              })
              .catch(function () {
                if (optionalError) optionalError.hidden = false;
                optionalSave.disabled = false;
                if (optionalSkip) optionalSkip.disabled = false;
                optionalSave.textContent = optionalSaveLabel;
              });
          });
        }
      }
    });
  }

  function initSprintInquiry() {
    var buttons = document.querySelectorAll("[data-cae-sprint-inquiry]");
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      var contactEmail = cfg().contactEmail || "info@caesthetic.com";
      var price = cfg().sprintPriceLabel || "the published price";
      var inquiryUrl =
        "mailto:" +
        contactEmail +
        "?subject=" +
        encodeURIComponent("Scope request — 30-Day Growth Sprint") +
        "&body=" +
        encodeURIComponent(
          "I want to review the scope and payment instructions for the 30-Day Growth Sprint (" +
            price +
            ", USD)."
        );

      btn.setAttribute("href", inquiryUrl);
      btn.setAttribute("data-cae-sprint-inquiry-state", "request");
      btn.textContent = "Request Sprint scope and payment instructions";

      btn.addEventListener("click", function () {
        track("sprint_scope_requested", {
          product: "30_day_growth_sprint",
          value: cfg().sprintPriceUsd || 0,
          currency: "USD",
        });
      });
    });
  }

  function boot() {
    applyContactOverrides();
    preserveQueryOnLinks();
    initScoreForm();
    initSprintInquiry();
  }

  window.caestheticGrowth = {
    preserveQueryOnLinks: preserveQueryOnLinks,
    intakeVersion: INTAKE_VERSION,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
