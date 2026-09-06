/**
 * CAESTHETIC public form confirmation layer.
 *
 * Existing submit handlers remain authoritative for success/failure. This file
 * only standardizes the copy and accessibility of success states after those
 * handlers reveal them; it never marks a form successful by itself.
 */
(function () {
  "use strict";

  var locale = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  var copy = {
    en: {
      score: "Request sent successfully. We will email you when your Growth Score is ready. Questions: info@caesthetic.com.",
      salon: "Request sent successfully. We will reply by email."
    },
    ru: {
      score: "Запрос успешно отправлен. Мы напишем вам по электронной почте, когда Growth Score будет готов. Вопросы: info@caesthetic.com.",
      salon: "Запрос успешно отправлен. Мы ответим по электронной почте."
    },
    es: {
      score: "Solicitud enviada correctamente. Te escribiremos por email cuando tu Growth Score esté listo. Preguntas: info@caesthetic.com.",
      salon: "Solicitud enviada correctamente. Responderemos por email."
    },
    fr: {
      score: "Demande envoyée avec succès. Nous vous écrirons par e-mail lorsque votre Growth Score sera prêt. Questions : info@caesthetic.com.",
      salon: "Demande envoyée avec succès. Nous vous répondrons par e-mail."
    }
  }[locale] || null;

  if (!copy) copy = {
    score: "Request sent successfully. We will email you when your Growth Score is ready. Questions: info@caesthetic.com.",
    salon: "Request sent successfully. We will reply by email."
  };

  function prepare(node, text) {
    if (!node) return;
    node.textContent = text;
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.setAttribute("aria-atomic", "true");
    if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
  }

  function normalize(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-cae-score-form] .cae-form-success").forEach(function (node) {
      prepare(node, copy.score);
    });
    scope.querySelectorAll("[data-cae-salon-score-form] [data-cae-salon-form-success]").forEach(function (node) {
      prepare(node, copy.salon);
    });
    if (root && root.matches) {
      if (root.matches("[data-cae-score-form] .cae-form-success")) prepare(root, copy.score);
      if (root.matches("[data-cae-salon-score-form] [data-cae-salon-form-success]")) prepare(root, copy.salon);
    }
  }

  function boot() {
    normalize(document);
    if (typeof MutationObserver === "undefined") return;
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node && node.nodeType === 1) normalize(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
