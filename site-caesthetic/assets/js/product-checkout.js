/** CAESTHETIC controlled product checkout over the existing payment evidence layer. */
(function () {
  "use strict";

  var query = new URLSearchParams(window.location.search);
  var productCode = query.get("product") || "";
  var token = query.get("token") || "";
  var offerId = query.get("offer") || "";
  var offerModule, selectedOffer;
  var thankYouMode = query.get("thankyou") === "1";
  var pollTimer = null;

  var products = {
    lead_to_revenue_check: {
      label: "Lead-to-Revenue Check",
      price: "$500",
      amount: 500,
      kicker: "Lead-to-Revenue Check · $500",
      title: "Start your Lead-to-Revenue Check.",
      lead: "One practice. One fixed $500 diagnostic. We confirm the authorized non-clinical evidence access before any internal records are shared.",
      scope: "Map Lead Received → Response → Qualification → Booking → Confirmation → Show → Consultation → Payment and return an evidence-backed decision report."
    },
    growth_sprint: {
      label: "30-Day Growth Sprint",
      price: "price confirmed after scope review",
      amount: null,
      kicker: "30-Day Growth Sprint · pricing scoped to the work",
      title: "Request your Sprint.",
      lead: "Name and email only. We will confirm the practice-specific scope and send the written Order and private payment instructions.",
      scope: "Implement the agreed 30-day priority across the surfaces named in the written Order."
    }
  };

  function $(id) { return document.getElementById(id); }
  function api() { return window.CAESTHETIC_API && window.CAESTHETIC_API.productOrder; }
  function paymentApi() { return window.CAESTHETIC_API && window.CAESTHETIC_API.payment; }
  function hideAll() {
    ["checkout-panel","payment-ready-panel","confirming-panel","thank-you-panel","legacy-panel","payment-error"].forEach(function (id) {
      var node = $(id); if (node) node.hidden = true;
    });
  }
  function show(id) { hideAll(); var node = $(id); if (node) node.hidden = false; }
  function error(message) {
    show("payment-error");
    $("payment-error").textContent = message;
    $("payment-error").focus();
  }
  function money(minor, currency) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format((minor || 0) / 100);
  }
  async function jsonFetch(url, options) {
    var response = await fetch(url, options);
    var data = await response.json().catch(function () { return {}; });
    return { response: response, data: data };
  }

  function applyProduct(spec) {
    $("payment-kicker").textContent = spec.kicker;
    $("payment-title").textContent = spec.title;
    $("payment-status").textContent = spec.lead;
    $("order-product").textContent = spec.label;
    $("order-price").textContent = spec.amount == null ? spec.price : spec.price + " USD";
    $("order-scope").textContent = spec.scope;
  }

  function applyOffer(offer) {
    selectedOffer = offer;
    var box = $('order-offer-details');
    box.replaceChildren(); box.hidden = !offer;
    if (!offer) return;
    $('payment-title').textContent = 'Your practice Sprint.';
    $('payment-status').textContent = 'Four connected surfaces, a finite first-visit project and an included Lead-to-Revenue Check. Exact price is confirmed in the written Sprint Order.';
    $('order-scope').textContent = offer.scope;
    var ul = document.createElement('ul');
    offer.deliverables.forEach(function (text) { var li = document.createElement('li'); li.textContent = text; ul.appendChild(li); });
    box.appendChild(ul);
    var included = document.createElement('p'); included.textContent = offer.included_check; box.appendChild(included);
    var details = document.createElement('details'), summary = document.createElement('summary');
    summary.textContent = 'Delivery and continuation terms'; details.appendChild(summary);
    ['acceptance','credit','continuation','boundary'].forEach(function (key) { var p = document.createElement('p'); p.textContent = offer[key]; details.appendChild(p); });
    box.appendChild(details);
    var link = document.createElement('a'); link.href = '/sprint/?offer=' + encodeURIComponent(offer.id); link.textContent = 'Already paid for a Check? Verify your credit before ordering.'; box.appendChild(link);
    var input = document.querySelector('[name=practice_name]'); if (!input.value) input.value = offer.practice;
  }

  function renderPaymentReady(status) {
    show("payment-ready-panel");
    var spec = products[status.product_code] || products[productCode];
    if (spec) {
      $("ready-product").textContent = spec.label;
      $("ready-amount").textContent = money(status.amount_minor || Math.round(spec.amount * 100), status.currency || "USD");
    }
    $("ready-order").textContent = status.order_number || "—";
    $('ready-offer-scope').hidden = !status.offer_id;
    $('ready-offer-scope').textContent = status.offer_scope || '';
    $("payment-waiting").textContent = status.wise_ready === false
      ? "Wise payment for this product is not configured yet. Your order is recorded, but no payment has been taken."
      : "Open Wise in the payment tab. Keep this CAESTHETIC page available; it will show Payment received only after the funds are credited and reconciled.";
    $("wise-open").disabled = status.wise_ready === false;
  }

  function renderConfirming(status) {
    show("confirming-panel");
    var spec = products[status.product_code] || products[productCode];
    $("confirming-product").textContent = spec ? spec.label : "your CAESTHETIC order";
    $("confirming-order").textContent = status.order_number || "—";
  }

  function renderThankYou(status) {
    if (pollTimer) clearInterval(pollTimer);
    show("thank-you-panel");
    var spec = products[status.product_code] || products[productCode];
    $("thanks-product").textContent = spec ? spec.label : "your CAESTHETIC order";
    $("thanks-amount").textContent = money(status.amount_minor, status.currency || "USD");
    $("thanks-order").textContent = status.order_number || "—";
    var url = new URL(window.location.href);
    url.searchParams.delete("product");
    url.searchParams.set("thankyou", "1");
    url.searchParams.set("token", token);
    history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
    $("thank-you-panel").focus();
  }

  async function loadStatus() {
    if (!token || !api()) return null;
    var result = await jsonFetch(api() + "?token=" + encodeURIComponent(token), { headers: { Accept: "application/json" } });
    if (!result.response.ok) throw new Error(result.data.error || "payment_status_unavailable");
    if (result.data.offer_id) {
      offerModule = offerModule || await import('/assets/js/spoken-offer-data.js');
      applyOffer(offerModule.resolveSpokenOffer(result.data.offer_id, result.data.product_code));
    } else if (selectedOffer) { applyProduct(products[result.data.product_code]); applyOffer(null); }
    if (result.data.paid === true) renderThankYou(result.data);
    else if (thankYouMode) renderConfirming(result.data);
    else renderPaymentReady(result.data);
    return result.data;
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () { loadStatus().catch(function () {}); }, 8000);
  }

  async function createOrder(event) {
    event.preventDefault();
    var spec = products[productCode];
    if (!spec || !api()) return error("This product order is not available. Please contact info@caesthetic.com.");
    var form = event.currentTarget;
    if (!form.reportValidity()) return;
    var button = form.querySelector("button[type=submit]");
    var formError = $("order-error");
    formError.hidden = true;
    button.disabled = true;
    button.textContent = "Creating your order…";
    var fd = new FormData(form);
    try {
      var result = await jsonFetch(api(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          product_code: productCode,
          offer_id: selectedOffer ? selectedOffer.id : undefined,
          practice_name: String(fd.get("practice_name") || "").trim(),
          signer_name: String(fd.get("signer_name") || "").trim(),
          signer_email: String(fd.get("signer_email") || "").trim(),
          source_url: document.referrer || window.location.href,
          terms_accepted: true
        })
      });
      if (!result.response.ok || !result.data.token) throw new Error(result.data.error || "order_creation_failed");
      token = result.data.token;
      var url = new URL(window.location.href);
      url.searchParams.set("product", productCode);
      url.searchParams.set("token", token);
      url.searchParams.delete("thankyou");
      history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
      renderPaymentReady(result.data);
      $("payment-ready-panel").focus();
    } catch (e) {
      formError.textContent = "We could not create your order. No payment was taken. Please try again or contact info@caesthetic.com.";
      formError.hidden = false;
      formError.focus();
    } finally {
      button.disabled = false;
      button.textContent = "Continue to payment";
    }
  }

  async function openWise() {
    if (!token || !api()) return error("This payment step is not available. Please contact info@caesthetic.com.");
    var popup = window.open("about:blank", "_blank");
    $("wise-open").disabled = true;
    try {
      var result = await jsonFetch(api(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wise", token: token })
      });
      if (!result.response.ok || !result.data.redirect_url) {
        if (popup) popup.close();
        if (result.data.error === "wise_product_not_configured") {
          $("payment-waiting").textContent = "Wise payment for this product is not configured yet. Your order remains recorded and no payment was taken. Please contact info@caesthetic.com.";
          return;
        }
        throw new Error(result.data.error || "wise_unavailable");
      }
      if (popup) popup.location.replace(result.data.redirect_url);
      else window.location.assign(result.data.redirect_url);
      $("payment-waiting").textContent = "Wise is open. This page is checking for confirmed funds. You can also use “I've paid — check status”.";
      startPolling();
    } catch (e) {
      if (popup) popup.close();
      $("payment-waiting").textContent = "We could not open Wise. No new charge was created. Please try again or contact info@caesthetic.com.";
    } finally {
      $("wise-open").disabled = false;
    }
  }

  async function initLegacyPayment() {
    if (!token || !paymentApi()) return error("The payment link is incomplete. Please use the link issued by CAESTHETIC.");
    show("legacy-panel");
    try {
      var result = await jsonFetch(paymentApi() + "?token=" + encodeURIComponent(token), { headers: { Accept: "application/json" } });
      if (!result.response.ok) throw new Error(result.data.error || "payment_request_unavailable");
      if (["credited","delivery_started"].includes(result.data.status)) {
        token = query.get("token") || token;
        renderThankYou(result.data);
        return;
      }
      $("legacy-practice").textContent = result.data.practice_name || "—";
      $("legacy-service").textContent = ({ growth_sprint:"30-Day Growth Sprint", lead_to_revenue_check:"Lead-to-Revenue Check", growth_system:"Growth System", performance_fee:"Performance Fee" })[result.data.product_code] || "CAESTHETIC service";
      $("legacy-invoice").textContent = result.data.invoice_number || result.data.order_number || "—";
      $("legacy-amount").textContent = money(result.data.amount_minor, result.data.currency || "USD");
      $("payment-kicker").textContent = "Private payment request";
      $("payment-title").textContent = "Review before you pay.";
      $("payment-status").textContent = "Confirm the invoice and payer authorization before continuing.";
    } catch (e) {
      error("We could not load this payment request. Please contact info@caesthetic.com.");
    }
  }

  async function submitLegacy(event) {
    event.preventDefault();
    var button = event.submitter;
    var action = button && button.dataset.paymentAction || "authorize_stripe";
    var fd = new FormData(event.currentTarget);
    button.disabled = true;
    try {
      var result = await jsonFetch(paymentApi(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action,
          token: token,
          payer_name: String(fd.get("payer_name") || ""),
          payer_relationship: String(fd.get("payer_relationship") || ""),
          payer_account_type: String(fd.get("payer_account_type") || "unknown"),
          attestation_accepted: fd.get("attest") === "on"
        })
      });
      if (!result.response.ok || !result.data.redirect_url) throw new Error(result.data.error || "payment_provider_unavailable");
      window.location.assign(result.data.redirect_url);
    } catch (e) {
      error("We could not continue to the payment provider. Please contact info@caesthetic.com.");
    } finally { button.disabled = false; }
  }

  async function boot() {
    $("product-order-form").addEventListener("submit", createOrder);
    $("wise-open").addEventListener("click", openWise);
    $("check-payment").addEventListener("click", function () { loadStatus().catch(function () { error("We could not confirm payment yet. Please try again shortly."); }); });
    $("legacy-payer-form").addEventListener("submit", submitLegacy);

    if (productCode && products[productCode]) {
      applyProduct(products[productCode]);
      if (offerId && !token) {
        try { offerModule = await import('/assets/js/spoken-offer-data.js'); applyOffer(offerModule.resolveSpokenOffer(offerId, productCode)); }
        catch (_) { return error('This practice-specific offer is unavailable. Return to your report or contact info@caesthetic.com before ordering.'); }
      }
      if (token) {
        loadStatus().then(function (status) { if (status && !status.paid) startPolling(); }).catch(function () { error("We could not load this order. Please contact info@caesthetic.com."); });
      } else show("checkout-panel");
      return;
    }
    if (thankYouMode && token) {
      loadStatus().then(function (status) { if (status && !status.paid) startPolling(); }).catch(function () { error("We could not confirm this payment. Please contact info@caesthetic.com."); });
      return;
    }
    if (token) { initLegacyPayment(); return; }
    error("Choose a CAESTHETIC product before continuing to payment.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
