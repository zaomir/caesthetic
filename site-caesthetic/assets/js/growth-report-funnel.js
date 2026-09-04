/**
 * CAESTHETIC Growth Score funnel adapter.
 * Applies one commercial decision block across rendered report variants without
 * changing evidence, scoring, human approval, or focus-location ownership.
 */
(function () {
  "use strict";

  var REQUEST_API = "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-request";
  var locale = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  var copy = {
    en: {
      kicker: "Choose the next step",
      title: "Use the report yourself, start smaller, or ask CAESTHETIC to implement.",
      sprint: "Start the 30-Day Sprint · $2,500",
      check: "Start smaller · Lead-to-Revenue Check · $500",
      question: "Ask a question",
      sprintCopy: "A finite 30-day implementation around the confirmed priority. Scope and the written Order are confirmed before private payment.",
      checkCopy: "An always-available smaller paid diagnostic of the authorized path from enquiry to payment. It is not mandatory before a Sprint.",
      recommended: "Recommended diagnostic",
      recommendedCopy: "This report has an evidence-backed reason to verify the internal path before selecting implementation.",
      evidence: "Supporting evidence",
      modalName: "Name",
      modalEmail: "Email",
      send: "Send request",
      sent: "Request sent. We will reply by email with the next step.",
      sending: "Sending…",
      failed: "We could not send the request. Please try again.",
      sprintTitle: "Request your 30-Day Sprint",
      checkTitle: "Start the Lead-to-Revenue Check",
      questionTitle: "Ask CAESTHETIC a question",
      twoFields: "Name and email only. We already know which report you came from."
    },
    ru: {
      kicker: "Выберите следующий шаг",
      title: "Используйте отчёт сами, начните с меньшего шага или поручите внедрение CAESTHETIC.",
      sprint: "Начать 30-дневный Sprint · $2,500",
      check: "Начать с меньшего · Lead-to-Revenue Check · $500",
      question: "Задать вопрос",
      sprintCopy: "Ограниченный 30-дневный объём внедрения вокруг подтверждённого приоритета. Scope и письменный Order согласуются до приватной оплаты.",
      checkCopy: "Всегда доступная небольшая платная диагностика разрешённого пути от обращения до оплаты. Она не обязательна перед Sprint.",
      recommended: "Рекомендованная диагностика",
      recommendedCopy: "В этом отчёте есть подтверждённая доказательствами причина проверить внутренний путь до выбора внедрения.",
      evidence: "Подтверждающие доказательства",
      modalName: "Имя",
      modalEmail: "Email",
      send: "Отправить запрос",
      sent: "Запрос отправлен. Мы ответим по email со следующим шагом.",
      sending: "Отправляем…",
      failed: "Не удалось отправить запрос. Попробуйте ещё раз.",
      sprintTitle: "Запросить 30-дневный Sprint",
      checkTitle: "Начать Lead-to-Revenue Check",
      questionTitle: "Задать вопрос CAESTHETIC",
      twoFields: "Только имя и email. Мы уже знаем, из какого отчёта вы пришли."
    },
    es: {
      kicker: "Elige el siguiente paso",
      title: "Usa el informe internamente, empieza con algo más pequeño o pide a CAESTHETIC que implemente.",
      sprint: "Iniciar el Sprint de 30 días · $2,500",
      check: "Empezar más pequeño · Lead-to-Revenue Check · $500",
      question: "Hacer una pregunta",
      sprintCopy: "Implementación limitada de 30 días alrededor de la prioridad confirmada. El alcance y la Orden escrita se confirman antes del pago privado.",
      checkCopy: "Diagnóstico pagado más pequeño y siempre disponible del recorrido autorizado desde la consulta hasta el pago. No es obligatorio antes de un Sprint.",
      recommended: "Diagnóstico recomendado",
      recommendedCopy: "Este informe contiene una razón respaldada por evidencia para verificar la ruta interna antes de elegir la implementación.",
      evidence: "Evidencia de apoyo",
      modalName: "Nombre",
      modalEmail: "Email",
      send: "Enviar solicitud",
      sent: "Solicitud enviada. Responderemos por email con el siguiente paso.",
      sending: "Enviando…",
      failed: "No pudimos enviar la solicitud. Inténtalo de nuevo.",
      sprintTitle: "Solicitar el Sprint de 30 días",
      checkTitle: "Iniciar Lead-to-Revenue Check",
      questionTitle: "Preguntar a CAESTHETIC",
      twoFields: "Solo nombre y email. Ya sabemos desde qué informe llegaste."
    },
    fr: {
      kicker: "Choisissez la prochaine étape",
      title: "Utilisez le rapport vous-même, commencez plus petit ou demandez à CAESTHETIC de mettre en œuvre.",
      sprint: "Démarrer le Sprint de 30 jours · $2,500",
      check: "Commencer plus petit · Lead-to-Revenue Check · $500",
      question: "Poser une question",
      sprintCopy: "Mise en œuvre limitée à 30 jours autour de la priorité confirmée. Le périmètre et l’Order écrit sont confirmés avant le paiement privé.",
      checkCopy: "Diagnostic payant plus petit et toujours disponible du parcours autorisé entre la demande et le paiement. Il n’est pas obligatoire avant un Sprint.",
      recommended: "Diagnostic recommandé",
      recommendedCopy: "Ce rapport contient une raison étayée par des preuves de vérifier le parcours interne avant de choisir la mise en œuvre.",
      evidence: "Preuves à l’appui",
      modalName: "Nom",
      modalEmail: "E-mail",
      send: "Envoyer la demande",
      sent: "Demande envoyée. Nous répondrons par e-mail avec la prochaine étape.",
      sending: "Envoi…",
      failed: "Impossible d’envoyer la demande. Réessayez.",
      sprintTitle: "Demander le Sprint de 30 jours",
      checkTitle: "Démarrer Lead-to-Revenue Check",
      questionTitle: "Poser une question à CAESTHETIC",
      twoFields: "Nom et e-mail uniquement. Nous savons déjà de quel rapport vous venez."
    }
  }[locale] || null;
  if (!copy) copy = {
    kicker:"Choose the next step", title:"Use the report yourself, start smaller, or ask CAESTHETIC to implement.", sprint:"Start the 30-Day Sprint · $2,500", check:"Start smaller · Lead-to-Revenue Check · $500", question:"Ask a question", sprintCopy:"A finite 30-day implementation around the confirmed priority. Scope and the written Order are confirmed before private payment.", checkCopy:"An always-available smaller paid diagnostic of the authorized path from enquiry to payment. It is not mandatory before a Sprint.", recommended:"Recommended diagnostic", recommendedCopy:"This report has an evidence-backed reason to verify the internal path before selecting implementation.", evidence:"Supporting evidence", modalName:"Name", modalEmail:"Email", send:"Send request", sent:"Request sent. We will reply by email with the next step.", sending:"Sending…", failed:"We could not send the request. Please try again.", sprintTitle:"Request your 30-Day Sprint", checkTitle:"Start the Lead-to-Revenue Check", questionTitle:"Ask CAESTHETIC a question", twoFields:"Name and email only. We already know which report you came from."
  };

  var reportData = null;
  var dialog = null;
  var observer = null;
  var activeIntent = "";
  var activeKind = "";

  function isFocusChild() {
    return reportData && reportData.audit && reportData.audit.format === "multi_location" && reportData.audit.package_role === "focus_location";
  }

  function isRecommended() {
    return reportData && reportData.leadToRevenueCheck && reportData.leadToRevenueCheck.recommendation === "recommended";
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "cae-request-modal cae-report-funnel-modal";
    dialog.innerHTML = '<div class="cae-request-modal__panel">' +
      '<button class="cae-request-modal__close" type="button" aria-label="Close">×</button>' +
      '<p class="cae-kicker" data-modal-kicker>CAESTHETIC</p>' +
      '<h2 class="cae-h2" data-modal-title></h2>' +
      '<p data-modal-intro></p>' +
      '<form class="cae-request-modal__form">' +
        '<label>' + copy.modalName + '<input name="name" type="text" autocomplete="name" required></label>' +
        '<label>' + copy.modalEmail + '<input name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
        '<button class="cae-btn cae-btn--primary" type="submit">' + copy.send + '</button>' +
        '<p class="cae-request-modal__status" role="status" aria-live="polite"></p>' +
      '</form></div>';
    document.body.appendChild(dialog);
    dialog.querySelector(".cae-request-modal__close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
    dialog.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var status = dialog.querySelector(".cae-request-modal__status");
      var submit = form.querySelector('button[type="submit"]');
      var fd = new FormData(form);
      submit.disabled = true;
      status.textContent = copy.sending;
      fetch(REQUEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || "").trim(),
          email: String(fd.get("email") || "").trim(),
          intent: activeIntent,
          page_url: window.location.href
        })
      }).then(function (response) {
        if (!response.ok) throw new Error("request_failed");
        status.textContent = copy.sent;
        submit.textContent = "Sent";
        if (window.dataLayer) window.dataLayer.push({ event:"growth_score_commercial_request", product:activeKind, report_url:window.location.pathname });
      }).catch(function () {
        status.textContent = copy.failed;
        submit.disabled = false;
      });
    });
    return dialog;
  }

  function openModal(kind) {
    var d = ensureDialog();
    activeKind = kind;
    activeIntent = kind === "sprint" ? "growth_score_report_sprint_2500" : kind === "check" ? "growth_score_report_check_500" : "growth_score_report_question";
    d.querySelector("form").reset();
    d.querySelector(".cae-request-modal__status").textContent = "";
    var submit = d.querySelector('button[type="submit"]');
    submit.disabled = false;
    submit.textContent = copy.send;
    d.querySelector("[data-modal-kicker]").textContent = kind === "sprint" ? "$2,500" : kind === "check" ? "$500" : "CAESTHETIC";
    d.querySelector("[data-modal-title]").textContent = kind === "sprint" ? copy.sprintTitle : kind === "check" ? copy.checkTitle : copy.questionTitle;
    d.querySelector("[data-modal-intro]").textContent = copy.twoFields;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    d.querySelector('input[name="name"]').focus();
  }

  function normalizeCheckCard() {
    var card = document.querySelector(".cae-lead-revenue__check");
    if (!card) return;
    var recommended = isRecommended();
    card.setAttribute("data-cae-check-recommended", recommended ? "true" : "false");
    var paragraphs = card.querySelectorAll("p");
    if (!recommended && paragraphs[0]) paragraphs[0].textContent = copy.checkCopy;
    if (recommended && reportData.leadToRevenueCheck) {
      var reason = reportData.leadToRevenueCheck.reason;
      if (paragraphs[0] && reason) paragraphs[0].innerHTML = "<strong>" + copy.recommended + ":</strong> " + reason.replace(/[&<>]/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]; });
      var refs = reportData.leadToRevenueCheck.evidence_refs || [];
      var existing = card.querySelector("[data-cae-check-evidence]");
      if (refs.length && !existing) {
        var evidence = document.createElement("p");
        evidence.setAttribute("data-cae-check-evidence", "");
        evidence.innerHTML = "<strong>" + copy.evidence + ":</strong> " + refs.map(function (ref) { return String(ref); }).join(", ");
        card.appendChild(evidence);
      }
    }
    var link = card.querySelector("a");
    if (link) {
      link.href = "/lead-to-revenue-check/";
      link.textContent = copy.check;
    }
  }

  function removeLegacyCommercialCta(wrap) {
    var mobileOffer = wrap.querySelector(".cae-mobile-sprint-offer");
    if (mobileOffer) mobileOffer.remove();
    var legacy = wrap.querySelector(":scope > a[data-cae-request], :scope > button[data-cae-request]");
    if (!legacy) return;
    var node = legacy;
    var removable = [];
    while (node && ["A", "BUTTON", "P", "H2"].indexOf(node.tagName) >= 0) {
      removable.push(node);
      node = node.previousElementSibling;
    }
    removable.forEach(function (item) { item.remove(); });
  }

  function renderRouter() {
    var section = document.getElementById("next-step");
    var wrap = section && section.querySelector(":scope > .cae-wrap");
    if (!wrap || !reportData) return;
    if (isFocusChild()) {
      wrap.querySelectorAll(".cae-report-funnel-router, .cae-mobile-sprint-offer").forEach(function (node) { node.remove(); });
      var sticky = document.querySelector(".cae-sticky-sprint");
      if (sticky) sticky.remove();
      return;
    }
    if (wrap.querySelector(".cae-report-funnel-router")) return;
    removeLegacyCommercialCta(wrap);
    normalizeCheckCard();

    var recommended = isRecommended();
    var router = document.createElement("section");
    router.className = "cae-report-funnel-router";
    router.setAttribute("aria-label", copy.kicker);
    router.innerHTML = '<p class="cae-kicker">' + (recommended ? copy.recommended : copy.kicker) + '</p>' +
      '<h2 class="cae-h2">' + (recommended ? copy.recommendedCopy : copy.title) + '</h2>' +
      '<div class="cae-report-funnel-router__grid">' +
        '<article data-product="sprint"><strong>' + copy.sprint + '</strong><p>' + copy.sprintCopy + '</p><button class="cae-btn ' + (recommended ? 'cae-btn--outline' : 'cae-btn--primary') + '" type="button" data-report-sprint>' + copy.sprint + '</button></article>' +
        '<article data-product="check"' + (recommended ? ' aria-current="step"' : '') + '><strong>' + copy.check + '</strong><p>' + (recommended ? copy.recommendedCopy : copy.checkCopy) + '</p><button class="cae-btn ' + (recommended ? 'cae-btn--primary' : 'cae-btn--outline') + '" type="button" data-report-check>' + copy.check + '</button></article>' +
      '</div>' +
      '<button class="cae-link-button" type="button" data-report-question>' + copy.question + '</button>';
    router.querySelector("[data-report-sprint]").addEventListener("click", function () { openModal("sprint"); });
    router.querySelector("[data-report-check]").addEventListener("click", function () { openModal("check"); });
    router.querySelector("[data-report-question]").addEventListener("click", function () { openModal("question"); });
    wrap.appendChild(router);
  }

  function watchNextStep() {
    var section = document.getElementById("next-step");
    if (!section || !window.MutationObserver) return;
    observer = new MutationObserver(function () { window.setTimeout(renderRouter, 0); });
    observer.observe(section, { childList:true, subtree:true });
  }

  function boot() {
    fetch(new URL("report.json", window.location.href), { credentials:"same-origin" })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (data) {
        reportData = data;
        if (!reportData) return;
        normalizeCheckCard();
        renderRouter();
        watchNextStep();
        window.setTimeout(renderRouter, 250);
        window.setTimeout(renderRouter, 1000);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
})();
