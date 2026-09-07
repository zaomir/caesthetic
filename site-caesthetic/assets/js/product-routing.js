/** CAESTHETIC paid-product routing contract.
 * Any non-product surface -> product page.
 * Product page -> controlled /pay/ order page.
 */
(function () {
  "use strict";

  var SPRINT_PAGE = "/sprint/";
  var CHECK_PAGE = "/lead-to-revenue-check/";
  var params = new URLSearchParams(window.location.search);
  var localLegacyQa = /^(127\.0\.0\.1|localhost)$/.test(window.location.hostname) && !params.has("cae_product_routing_test");

  function currentPath() {
    var path = window.location.pathname || "/";
    return path.endsWith("/") ? path : path + "/";
  }

  function destination(kind, trigger) {
    var path = currentPath();
    if (kind === "sprint") {
      var offer = (trigger && trigger.getAttribute('data-cae-offer')) || (path === SPRINT_PAGE ? params.get('offer') : '');
      var target = path === SPRINT_PAGE ? "/pay/?product=growth_sprint" : SPRINT_PAGE;
      if (offer === 'spoken-four-surface-sprint-v1') target += (target.indexOf('?') === -1 ? '?' : '&') + 'offer=' + offer;
      return target;
    }
    return path === CHECK_PAGE ? "/pay/?product=lead_to_revenue_check" : CHECK_PAGE;
  }

  function track(kind, target) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "caesthetic_product_route_selected",
      product: kind === "sprint" ? "growth_sprint" : "lead_to_revenue_check",
      destination: target,
      source_path: currentPath()
    });
  }

  function setTextByNeedle(needle, replacement) {
    document.querySelectorAll("main p, main h2").forEach(function (node) {
      if ((node.textContent || "").trim().indexOf(needle) !== -1) node.textContent = replacement;
    });
  }

  function syncProductCopy() {
    var path = currentPath();
    if (path === SPRINT_PAGE) {
      document.querySelectorAll("[data-cae-sprint-inquiry]").forEach(function (node) {
        node.textContent = "Continue to order · $2,500";
      });
      setTextByNeedle("Both request flows ask only for Name and Email", "Continue to the secure order page with three fields: practice or business name, your name and work email. The fixed product and price are recorded before you open Wise.");
      setTextByNeedle("The public request asks only for Name and Email", "The secure order page asks only for practice or business name, your name and work email. Your electronic order records the fixed $2,500 product before Wise opens.");
      setTextByNeedle("The written Order states the practice-specific scope before payment", "Your electronic order confirms the fixed product and price before payment. The priority scope, access dependencies and Sprint Start Date are confirmed before implementation begins.");
    } else if (path === CHECK_PAGE) {
      document.querySelectorAll("[data-cae-check-inquiry]").forEach(function (node) {
        node.textContent = "Continue to order · $500";
      });
      setTextByNeedle("The request asks only for Name and Email", "Continue to the secure order page with three fields: practice or business name, your name and work email. The $500 product is recorded before you open Wise; evidence access is confirmed before any internal data is shared.");
    } else if (path === "/pricing/") {
      setTextByNeedle("Commercial request forms use Name and Email only", "Paid public products use a secure three-field order: practice or business name, your name and work email. Product and price are locked server-side; no revenue, budget or patient data is requested.");
      setTextByNeedle("Written scope before private payment", "Electronic order before Wise payment.");
      setTextByNeedle("Paid products follow commercial request", "Paid public products follow product page → electronic order → Wise → confirmed payment. CAESTHETIC creates the commercial order before the provider opens and treats payment as received only after credited funds are reconciled.");
    }
  }

  function boot() {
    syncProductCopy();
    if (localLegacyQa) return;
    document.addEventListener("click", function (event) {
      var trigger = event.target && event.target.closest
        ? event.target.closest("[data-cae-sprint-inquiry],[data-cae-check-inquiry]")
        : null;
      if (!trigger) return;
      var kind = trigger.hasAttribute("data-cae-sprint-inquiry") ? "sprint" : "check";
      var target = destination(kind, trigger);
      event.preventDefault();
      event.stopImmediatePropagation();
      track(kind, target);
      window.location.assign(target);
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
