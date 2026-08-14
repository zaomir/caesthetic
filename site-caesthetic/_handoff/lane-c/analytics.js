(function () {
  "use strict";

  var UTM_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id"
  ];
  var STORAGE_KEY = "caesthetic_utm";
  var FORM_STARTED = "caeAnalyticsStarted";
  var STEP_PREFIX = "caeAnalyticsStep";
  var DEBUG = new URLSearchParams(window.location.search).get("debug_analytics") === "1";

  window.dataLayer = window.dataLayer || [];

  function safeJsonParse(value) {
    if (!value) return {};
    try {
      return JSON.parse(value) || {};
    } catch (error) {
      return {};
    }
  }

  function readStoredUtm() {
    try {
      return safeJsonParse(window.sessionStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return {};
    }
  }

  function writeStoredUtm(value) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      // sessionStorage can be unavailable in private or restricted contexts.
    }
  }

  function persistUtm() {
    var params = new URLSearchParams(window.location.search);
    var stored = readStoredUtm();
    var next = {};
    var changed = false;

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        next[key] = value.slice(0, 180);
        changed = true;
      } else if (stored[key]) {
        next[key] = stored[key];
      }
    });

    if (changed) {
      writeStoredUtm(next);
    }

    return changed ? next : stored;
  }

  var utm = persistUtm();

  function closestData(element, name) {
    if (!element || !element.closest) return "";
    var node = element.closest("[data-" + name + "]");
    return node ? node.getAttribute("data-" + name) || "" : "";
  }

  function inferProduct(pathname) {
    if (pathname.indexOf("/dental/") === 0) return "dental";
    if (pathname.indexOf("/beauty/") === 0) return "beauty";
    if (pathname.indexOf("/aesthetic-medicine/") === 0) return "aesthetic-medicine";
    if (pathname.indexOf("/maps-reputation/") === 0 || pathname.indexOf("/go/maps-analysis/") === 0) return "maps-reputation";
    if (pathname.indexOf("/assessment/") === 0) return "assessment";
    if (pathname.indexOf("/partners/") === 0) return "partners";
    return "";
  }

  function getFormLocationsCount(form) {
    if (!form) return "";
    var field = form.querySelector("[name='locations_count'], [name='locations'], [data-locations-count]");
    if (!field) return "";
    return (field.getAttribute("data-locations-count") || field.value || "").toString().slice(0, 80);
  }

  function baseDimensions(sourceElement) {
    var params = new URLSearchParams(window.location.search);
    var form = sourceElement && sourceElement.closest ? sourceElement.closest("form") : null;
    var dimensions = {
      industry: closestData(sourceElement, "industry") || params.get("industry") || document.documentElement.getAttribute("data-industry") || "",
      product: closestData(sourceElement, "product") || params.get("product") || inferProduct(window.location.pathname),
      offer: closestData(sourceElement, "offer") || params.get("offer") || "",
      landing_page: window.location.pathname,
      language: document.documentElement.lang || document.documentElement.getAttribute("data-lang") || "en",
      locations_count: closestData(sourceElement, "locations-count") || params.get("locations_count") || params.get("locations") || getFormLocationsCount(form)
    };

    UTM_KEYS.forEach(function (key) {
      dimensions[key] = params.get(key) || utm[key] || "";
    });

    return dimensions;
  }

  function trimText(value, limit) {
    return (value || "").replace(/\s+/g, " ").trim().slice(0, limit || 120);
  }

  function safeHref(href) {
    if (!href) return "";
    if (href.indexOf("mailto:") === 0) return "mailto:";
    if (href.indexOf("tel:") === 0) return "tel:";
    if (/whatsapp\.com|wa\.me/i.test(href)) return "whatsapp:";
    try {
      var url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) return url.pathname;
      return url.origin;
    } catch (error) {
      return "";
    }
  }

  function cleanPayload(payload) {
    var result = {};
    Object.keys(payload || {}).forEach(function (key) {
      var value = payload[key];
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "string") {
        result[key] = value.slice(0, 240);
        return;
      }
      result[key] = value;
    });
    return result;
  }

  function track(eventName, payload, sourceElement) {
    if (!eventName) return;

    var eventPayload = cleanPayload(Object.assign(
      {
        event: eventName,
        event_source: "caesthetic",
        page_path: window.location.pathname,
        page_title: document.title
      },
      baseDimensions(sourceElement),
      payload || {}
    ));

    window.dataLayer.push(eventPayload);

    if (DEBUG && window.console && typeof window.console.debug === "function") {
      window.console.debug("[caesthetic analytics]", eventPayload);
    }
  }

  function trackPageView() {
    track("page_view", {
      page_location: window.location.href.split("#")[0],
      referrer: document.referrer || ""
    });
  }

  function linkPayload(link) {
    return {
      link_url: safeHref(link.getAttribute("href") || ""),
      link_text: trimText(link.textContent, 80),
      cta_id: link.getAttribute("data-cta") || link.id || ""
    };
  }

  function handleClick(event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var link = target.closest("a[href]");
    var button = target.closest("button, [role='button']");
    var clickable = link || button;
    if (!clickable) return;

    var href = link ? link.getAttribute("href") || "" : "";
    var payload = link ? linkPayload(link) : {
      button_text: trimText(clickable.textContent, 80),
      cta_id: clickable.getAttribute("data-cta") || clickable.id || ""
    };

    if (link && href.indexOf("tel:") === 0) {
      track("phone_click", payload, link);
      return;
    }

    if (link && href.indexOf("mailto:") === 0) {
      track("email_click", payload, link);
      return;
    }

    if (link && /whatsapp\.com|wa\.me/i.test(href)) {
      track("whatsapp_click", payload, link);
      return;
    }

    if (clickable.matches(".cae-btn, [data-cta], [data-analytics-cta]")) {
      track("cta_click", payload, clickable);
    }

    var product = closestData(clickable, "product") || inferProduct(link ? new URL(href, window.location.origin).pathname : "");
    if (product && link && /^\/(dental|beauty|aesthetic-medicine|maps-reputation|assessment|partners)\//.test(new URL(href, window.location.origin).pathname)) {
      track("product_select", Object.assign({ product: product }, payload), clickable);
    }

    if (clickable.matches("[data-case-open], [data-case-id]")) {
      track("case_open", {
        case_id: clickable.getAttribute("data-case-id") || clickable.getAttribute("href") || "",
        case_title: trimText(clickable.textContent, 100)
      }, clickable);
    }
  }

  function formName(form) {
    return form.getAttribute("data-form-name") || form.getAttribute("name") || form.id || "form";
  }

  function handleFormFocus(event) {
    var field = event.target;
    var form = field && field.closest ? field.closest("form") : null;
    if (!form || form.dataset[FORM_STARTED] === "1") return;

    form.dataset[FORM_STARTED] = "1";
    track("form_start", {
      form_name: formName(form)
    }, field);
  }

  function handleFormStep(event) {
    var field = event.target;
    if (!field || !field.closest) return;
    var form = field.closest("form");
    if (!form) return;

    var step = closestData(field, "analytics-step") || field.getAttribute("name") || field.id || "";
    if (!step) return;

    var key = STEP_PREFIX + step.replace(/[^a-z0-9_-]/gi, "_");
    if (form.dataset[key] === "1") return;
    if (field.required && typeof field.checkValidity === "function" && !field.checkValidity()) return;

    form.dataset[key] = "1";
    track("form_step_complete", {
      form_name: formName(form),
      form_step: step
    }, field);
  }

  function handleFormSubmit(event) {
    var form = event.target;
    if (!form || !form.matches || !form.matches("form")) return;

    track("form_submit", {
      form_name: formName(form),
      form_method: (form.getAttribute("method") || "get").toLowerCase()
    }, form);
  }

  function handleDetailsToggle(event) {
    var details = event.target;
    if (!details || !details.matches || !details.matches("details[open]")) return;
    if (details.dataset.caeAnalyticsCaseOpen === "1") return;
    details.dataset.caeAnalyticsCaseOpen = "1";

    track("case_open", {
      case_id: details.getAttribute("data-case-id") || details.id || "",
      case_title: trimText(details.querySelector("summary") ? details.querySelector("summary").textContent : "", 100)
    }, details);
  }

  function init() {
    trackPageView();
    document.addEventListener("click", handleClick, true);
    document.addEventListener("focusin", handleFormFocus, true);
    document.addEventListener("change", handleFormStep, true);
    document.addEventListener("blur", handleFormStep, true);
    document.addEventListener("submit", handleFormSubmit, true);
    document.addEventListener("toggle", handleDetailsToggle, true);

    window.addEventListener("caesthetic:analytics", function (event) {
      var detail = event.detail || {};
      track(detail.event || detail.eventName, detail.data || detail.payload || {}, document.activeElement);
    });
  }

  window.caestheticAnalytics = {
    track: track,
    dimensions: baseDimensions,
    utm: function () {
      return Object.assign({}, utm);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
