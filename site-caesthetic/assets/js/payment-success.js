/** CAESTHETIC verified post-payment handoff. */
(function () {
  "use strict";

  var token = new URLSearchParams(window.location.search).get("token") || "";
  var timer = null;
  function $(id) { return document.getElementById(id); }
  function api() { return window.CAESTHETIC_API && window.CAESTHETIC_API.productOrder; }
  function money(minor, currency) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format((minor || 0) / 100);
  }
  function fail(message) {
    if (timer) clearInterval(timer);
    $("payment-success-confirming").hidden = true;
    $("payment-success-paid").hidden = true;
    $("payment-success-error").hidden = false;
    $("payment-success-error").textContent = message;
    $("payment-success-error").focus();
  }
  function confirming(status) {
    $("payment-success-error").hidden = true;
    $("payment-success-paid").hidden = true;
    $("payment-success-confirming").hidden = false;
    $("payment-success-title").textContent = "Confirming your payment.";
    $("payment-success-lead").textContent = "We’ll show payment received only after the CAESTHETIC payment record confirms credited funds.";
    $("payment-success-confirming-order").textContent = status && status.order_number ? "Order " + status.order_number : "";
  }
  function paid(status) {
    if (timer) clearInterval(timer);
    $("payment-success-error").hidden = true;
    $("payment-success-confirming").hidden = true;
    $("payment-success-paid").hidden = false;
    $("payment-success-title").textContent = "Payment received.";
    $("payment-success-lead").textContent = "Your payment has been confirmed in the CAESTHETIC payment record.";
    $("payment-success-product").textContent = status.product_label || "your CAESTHETIC order";
    $("payment-success-amount").textContent = money(status.amount_minor, status.currency || "USD");
    $("payment-success-order").textContent = status.order_number || "—";
    $("payment-success-paid").focus({ preventScroll: true });
    if (window.caestheticAnalytics && typeof window.caestheticAnalytics.track === "function") {
      window.caestheticAnalytics.track("caesthetic_payment_confirmed", { product: status.product_code || "unknown" });
    }
  }
  async function check() {
    if (!token || !api()) return fail("This payment confirmation link is incomplete. Please use the link from your CAESTHETIC order or contact info@caesthetic.com.");
    try {
      var response = await fetch(api() + "?token=" + encodeURIComponent(token), { headers: { Accept: "application/json" } });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || "payment_status_unavailable");
      if (data.paid === true) paid(data);
      else confirming(data);
    } catch (e) {
      fail("We could not confirm this payment yet. Please try the order link again or contact info@caesthetic.com.");
    }
  }
  function boot() {
    confirming(null);
    check();
    timer = setInterval(check, 8000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
