/**
 * CAESTHETIC analytics — GA4 + Meta Pixel + dataLayer.
 * Events: score_request_submitted, score_page_viewed, sprint_page_viewed,
 * sprint_scope_requested, page_view.
 */
(function () {
  "use strict";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"];
  var STORAGE_KEY = "caesthetic_utm";
  var DEBUG = new URLSearchParams(window.location.search).get("debug_analytics") === "1";

  window.dataLayer = window.dataLayer || [];

  function cfg() {
    return window.CAESTHETIC || {};
  }

  function safeJsonParse(value) {
    if (!value) return {};
    try {
      return JSON.parse(value) || {};
    } catch (e) {
      return {};
    }
  }

  function readStoredUtm() {
    try {
      return safeJsonParse(window.sessionStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return {};
    }
  }

  function writeStoredUtm(value) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) { /* ignore */ }
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
    if (changed) writeStoredUtm(next);
    return changed ? next : stored;
  }

  var utm = persistUtm();

  function push(eventName, detail) {
    var payload = Object.assign(
      {
        event: eventName,
        page_path: location.pathname,
        page_title: document.title,
      },
      utm,
      detail || {}
    );
    window.dataLayer.push(payload);
    if (DEBUG) console.info("[cae-analytics]", payload);

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail || {});
    }
    if (typeof window.fbq === "function") {
      var metaMap = {
        score_request_submitted: "Lead",
        sprint_scope_requested: "Lead",
        page_view: "PageView",
      };
      var metaEvent = metaMap[eventName];
      if (metaEvent) {
        window.fbq("track", metaEvent);
      } else {
        window.fbq("trackCustom", eventName, detail || {});
      }
    }
  }

  function loadGa4(id) {
    if (!id || window.__caeGa4Loaded) return;
    window.__caeGa4Loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  function loadMeta(id) {
    if (!id || window.__caeMetaLoaded) return;
    window.__caeMetaLoaded = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function bootPixels() {
    var c = cfg();
    if (c.ga4MeasurementId) loadGa4(c.ga4MeasurementId);
    if (c.metaPixelId) loadMeta(c.metaPixelId);
  }

  function routeEvents() {
    var path = location.pathname;
    if (path.indexOf("/score/") === 0 || path.indexOf("/growth-score/") === 0) {
      push("score_page_viewed");
    }
    if (path.indexOf("/sprint/") === 0) push("sprint_page_viewed");
    push("page_view");
  }

  window.caestheticAnalytics = {
    track: push,
    utm: function () {
      return utm;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bootPixels();
      routeEvents();
    });
  } else {
    bootPixels();
    routeEvents();
  }
})();
