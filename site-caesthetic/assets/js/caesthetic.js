/**
 * CAESTHETIC — shared public-site behavior.
 * caesthetic.js v2.2
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function loadSlot(path, slot) {
    if (!slot) return Promise.resolve();
    return fetch(path, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("Template load failed: " + path);
        return r.text();
      })
      .then(function (html) { slot.innerHTML = html; });
  }

  function initYear() {
    var el = document.getElementById("cae-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initActiveNav() {
    var page = document.documentElement.getAttribute("data-page");
    if (!page) return;
    qsa("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function initMobileNav() {
    var nav = document.getElementById("cae-nav");
    var btn = document.getElementById("cae-menu-btn");
    if (!nav || !btn || btn.getAttribute("data-cae-nav-bound") === "1") return;
    btn.setAttribute("data-cae-nav-bound", "1");

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
      document.documentElement.classList.toggle("cae-nav-open", isOpen);
    }

    btn.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    qsa("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  function initDropdowns() {
    qsa(".cae-nav__dropdown-toggle").forEach(function (toggle) {
      var controlledId = toggle.getAttribute("aria-controls");
      var panel = controlledId ? document.getElementById(controlledId) : null;
      if (!panel) return;

      function openDropdown() { toggle.setAttribute("aria-expanded", "true"); panel.classList.add("is-open"); }
      function closeDropdown() { toggle.setAttribute("aria-expanded", "false"); panel.classList.remove("is-open"); }
      function toggleDropdown() { toggle.getAttribute("aria-expanded") === "true" ? closeDropdown() : openDropdown(); }

      toggle.addEventListener("click", function (e) { e.stopPropagation(); toggleDropdown(); });
      toggle.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDropdown();
        } else if (e.key === "Escape") {
          closeDropdown();
          toggle.focus();
        } else if (e.key === "ArrowDown" && toggle.getAttribute("aria-expanded") === "true") {
          e.preventDefault();
          var firstLink = qs(".cae-nav__dropdown-link", panel);
          if (firstLink) firstLink.focus();
        }
      });
      panel.addEventListener("keydown", function (e) {
        var links = qsa(".cae-nav__dropdown-link", panel);
        var idx = links.indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          var next = links[idx + 1] || links[0];
          if (next) next.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          var prev = links[idx - 1];
          if (prev) prev.focus(); else { toggle.focus(); closeDropdown(); }
        } else if (e.key === "Escape") {
          closeDropdown();
          toggle.focus();
        } else if (e.key === "Tab") closeDropdown();
      });
      document.addEventListener("click", function (e) {
        var item = toggle.closest(".cae-nav__item");
        if (item && !item.contains(e.target)) closeDropdown();
      });
    });
  }

  function countUp(el, target, duration) {
    var start = performance.now();
    var isFloat = String(target).indexOf(".") !== -1;
    var decimals = isFloat ? String(target).split(".")[1].length : 0;
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = eased * target;
      el.textContent = isFloat ? value.toFixed(decimals) : Math.round(value).toString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initEvidenceStrips() {
    var strips = qsa(".cae-evidence-strip[data-animate='true']");
    if (!strips.length || typeof IntersectionObserver === "undefined") return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var strip = entry.target;
        strip.classList.add("is-visible");
        if (!prefersReducedMotion) {
          qsa("[data-count]", strip).forEach(function (el, i) {
            var target = parseFloat(el.getAttribute("data-count"));
            if (!isNaN(target)) setTimeout(function () { countUp(el, target, 800); }, i * 80);
          });
        }
        observer.unobserve(strip);
      });
    }, { threshold: 0.2 });
    strips.forEach(function (s) { observer.observe(s); });
  }

  function initDemandMaps() {
    qsa(".cae-demand-map").forEach(function (map) {
      var stages = qsa(".cae-demand-map__stage", map);
      var detailPanel = map.nextElementSibling;
      if (detailPanel && !detailPanel.classList.contains("cae-demand-map__detail")) detailPanel = null;
      stages.forEach(function (stage) {
        stage.setAttribute("tabindex", "0");
        stage.setAttribute("role", "button");
        function activateStage() {
          stages.forEach(function (s) { s.classList.remove("is-active"); });
          stage.classList.add("is-active");
          if (detailPanel) {
            var content = stage.getAttribute("data-detail") || "";
            if (content) {
              detailPanel.innerHTML = "<p>" + content + "</p>";
              detailPanel.classList.add("is-open");
            } else detailPanel.classList.remove("is-open");
          }
        }
        stage.addEventListener("click", activateStage);
        stage.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateStage(); }
        });
      });
    });
  }

  function initMultiStepForms() {
    qsa(".cae-form[data-multistep]").forEach(function (form) {
      var steps = qsa(".cae-form-step", form);
      var progressSteps = qsa(".cae-form-progress__step", form);
      var currentStep = 0;
      function showStep(idx) {
        steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
        progressSteps.forEach(function (p, i) {
          p.classList.remove("is-current", "is-done");
          if (i < idx) p.classList.add("is-done");
          if (i === idx) p.classList.add("is-current");
        });
        currentStep = idx;
      }
      form.addEventListener("click", function (e) {
        var next = e.target.closest("[data-step-next]");
        var prev = e.target.closest("[data-step-prev]");
        if (next && currentStep < steps.length - 1) showStep(currentStep + 1);
        if (prev && currentStep > 0) showStep(currentStep - 1);
      });
      showStep(0);
    });
  }

  function initForms() {
    qsa(".cae-form:not([data-multistep]):not([data-cae-score-form]):not([data-cae-salon-score-form])").forEach(function (form) {
      var successEl = qs(".cae-form-success", form);
      if (successEl) successEl.hidden = true;
    });
  }

  function initSalonScoreLaunchers() {
    var locale = (document.documentElement.getAttribute("data-locale") || document.documentElement.lang || "en").toLowerCase().split("-")[0];
    var copy = {
      en: { name: "Your name", email: "Work email", practice: "Salon name", city: "City, State", submit: "Start my free Salon Growth Score", submitting: "Submitting…", received: "Request received", unavailable: "Submission is temporarily unavailable.", network: "Network error. Try again.", failed: "We could not record your request. Try again.", success: "Request recorded. We will reply by email.", note: "Four required fields. No revenue or budget questions before the request is recorded." },
      es: { name: "Nombre", email: "Email de trabajo", practice: "Nombre del salón", city: "Ciudad, Estado", submit: "Iniciar mi Salon Growth Score gratis", submitting: "Enviando…", received: "Solicitud recibida", unavailable: "El envío no está disponible temporalmente.", network: "Error de red. Inténtalo de nuevo.", failed: "No pudimos registrar tu solicitud. Inténtalo de nuevo.", success: "Solicitud registrada. Responderemos por email.", note: "Cuatro campos obligatorios. Sin preguntas sobre ingresos o presupuesto antes de registrar la solicitud." },
      ru: { name: "Имя", email: "Рабочий email", practice: "Название салона", city: "Город, регион", submit: "Начать бесплатный Salon Growth Score", submitting: "Отправляем…", received: "Запрос получен", unavailable: "Отправка временно недоступна.", network: "Ошибка сети. Попробуйте ещё раз.", failed: "Не удалось зарегистрировать запрос. Попробуйте ещё раз.", success: "Запрос зарегистрирован. Мы ответим по email.", note: "Четыре обязательных поля. Без вопросов о выручке или бюджете до регистрации запроса." },
      fr: { name: "Nom", email: "E-mail professionnel", practice: "Nom du salon", city: "Ville, État / région", submit: "Commencer mon Salon Growth Score gratuit", submitting: "Envoi…", received: "Demande reçue", unavailable: "L’envoi est temporairement indisponible.", network: "Erreur réseau. Réessayez.", failed: "Nous n’avons pas pu enregistrer votre demande. Réessayez.", success: "Demande enregistrée. Nous répondrons par e-mail.", note: "Quatre champs obligatoires. Aucune question sur le chiffre d’affaires ou le budget avant l’enregistrement." }
    }[locale] || null;
    if (!copy) copy = { name: "Your name", email: "Work email", practice: "Salon name", city: "City, State", submit: "Start my free Salon Growth Score", submitting: "Submitting…", received: "Request received", unavailable: "Submission is temporarily unavailable.", network: "Network error. Try again.", failed: "We could not record your request. Try again.", success: "Request recorded. We will reply by email.", note: "Four required fields. No revenue or budget questions before the request is recorded." };

    qsa(".cae-salon-form.cae-request-launch").forEach(function (mount) {
      if (mount.querySelector("[data-cae-salon-score-form]")) return;
      mount.classList.remove("cae-request-launch");
      mount.innerHTML =
        '<form class="cae-form cae-form--score" data-cae-salon-score-form novalidate data-label-submitting="' + copy.submitting + '" data-label-success="' + copy.received + '" data-error-unavailable="' + copy.unavailable + '" data-error-network="' + copy.network + '" data-error-submit="' + copy.failed + '">' +
          '<div data-cae-salon-required>' +
            '<label>' + copy.name + '<input name="name" required autocomplete="name" maxlength="80"></label>' +
            '<label>' + copy.email + '<input type="email" name="email" required autocomplete="email" inputmode="email" maxlength="120"></label>' +
            '<label>' + copy.practice + '<input name="practice_name" required autocomplete="organization" maxlength="120"></label>' +
            '<label>' + copy.city + '<input name="city_state" required autocomplete="address-level2" maxlength="80"></label>' +
            '<p class="cae-form-error" data-cae-salon-form-error role="alert" hidden></p>' +
            '<button class="cae-btn cae-btn--primary" type="submit">' + copy.submit + '</button>' +
            '<p class="cae-disclaimer">' + copy.note + '</p>' +
          '</div>' +
          '<p class="cae-form-success" data-cae-salon-form-success tabindex="-1" hidden>' + copy.success + '</p>' +
        '</form>';
    });

    qsa(".cae-salon-footer__legal").forEach(function (node) {
      node.innerHTML = node.innerHTML
        .replace(/\s*Resultados no garantizados\.?/gi, "")
        .replace(/\s*Результаты не гарантируются\.?/gi, "")
        .replace(/\s*Résultats non garantis\.?/gi, "")
        .replace(/\s*Results are not guaranteed\.?/gi, "");
    });
  }

  function initRequestModal() {
    if (document.body.classList.contains("cae-score-report--focus-location")) {
      qsa("[data-cae-question]").forEach(function (trigger) { trigger.remove(); });
    }

    var requestButtons = qsa([
      "a[data-cae-request]",
      "button[data-cae-request]",
      "a[data-cae-sprint-inquiry]",
      "button[data-cae-sprint-inquiry]",
      "a[data-cae-check-inquiry]",
      "button[data-cae-check-inquiry]",
      "a[data-cae-growth-system-inquiry]",
      "button[data-cae-growth-system-inquiry]",
      "a[data-cae-question]",
      "button[data-cae-question]"
    ].join(","));
    if (!requestButtons.length) return;

    var requestLocale = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
    var requestCopy = requestLocale === "ru" ? {
      close: "Закрыть форму", kicker: "Запрос", title: "Оставьте ваши данные", intro: "Мы ответим по электронной почте.",
      name: "Имя", email: "Электронная почта", send: "Отправить запрос", sending: "Отправляем…", sent: "Отправлено",
      success: "Запрос отправлен. Мы ответим по электронной почте и предложим следующий шаг.",
      questionSuccess: "Вопрос отправлен. Мы ответим по электронной почте.", failed: "Не удалось отправить запрос. Попробуйте ещё раз."
    } : {
      close: "Close request form", kicker: "Request", title: "Leave your details", intro: "We will reply by email.",
      name: "Name", email: "Email", send: "Send request", sending: "Sending…", sent: "Sent",
      success: "Request sent. We will reply by email with the next commercial step.",
      questionSuccess: "Question sent. We will reply by email.", failed: "We could not send the request. Please try again."
    };
    var dialog = document.createElement("dialog");
    dialog.className = "cae-request-modal";
    dialog.setAttribute("aria-labelledby", "cae-request-modal-title");
    dialog.innerHTML =
      '<div class="cae-request-modal__panel">' +
        '<button class="cae-request-modal__close" type="button" aria-label="' + requestCopy.close + '">×</button>' +
        '<p class="cae-kicker" data-cae-request-kicker>' + requestCopy.kicker + '</p>' +
        '<h2 class="cae-h2" id="cae-request-modal-title">' + requestCopy.title + '</h2>' +
        '<p class="cae-request-modal__intro" data-cae-request-intro>' + requestCopy.intro + '</p>' +
        '<form class="cae-request-modal__form">' +
          '<label for="cae-request-name">' + requestCopy.name + '</label>' +
          '<input id="cae-request-name" name="name" type="text" autocomplete="name" required>' +
          '<label for="cae-request-email">' + requestCopy.email + '</label>' +
          '<input id="cae-request-email" name="email" type="email" autocomplete="email" inputmode="email" required>' +
          '<button class="cae-btn cae-btn--primary" type="submit">' + requestCopy.send + '</button>' +
          '<p class="cae-request-modal__status" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(dialog);

    var form = qs("form", dialog);
    var close = qs(".cae-request-modal__close", dialog);
    var status = qs(".cae-request-modal__status", dialog);
    var kicker = qs("[data-cae-request-kicker]", dialog);
    var title = qs("#cae-request-modal-title", dialog);
    var intro = qs("[data-cae-request-intro]", dialog);
    var activeTrigger = null;
    var requestIntent = "CAESTHETIC request";
    var requestKind = "request";

    function metaFor(trigger) {
      var explicitIntent = trigger && trigger.getAttribute("data-cae-intent");
      var russian = requestLocale === "ru";
      if (trigger && trigger.hasAttribute("data-cae-sprint-inquiry")) return { kind:"sprint", intent:explicitIntent || "30_day_growth_sprint_2500", kicker:russian ? "Спринт на 30 дней · $2,500" : "30-Day Growth Sprint · $2,500", title:russian ? "Запросить спринт" : "Request your Sprint", intro:russian ? "Нужны только имя и электронная почта. Мы письменно подтвердим объём работ и отправим личные инструкции по оплате." : "Name and email only. We will confirm the practice-specific scope and send the written Order and private payment instructions.", submit:russian ? "Запросить спринт" : "Request Sprint" };
      if (trigger && trigger.hasAttribute("data-cae-check-inquiry")) return { kind:"check", intent:explicitIntent || "lead_to_revenue_check_500", kicker:russian ? "Проверка пути после обращения · $500" : "Lead-to-Revenue Check · $500", title:russian ? "Запросить проверку" : "Start the Lead-to-Revenue Check", intro:russian ? "Нужны только имя и электронная почта. До оплаты мы письменно подтвердим, что именно проверяем, и отправим личные инструкции по оплате." : "Name and email only. We will confirm the evidence scope, written Order and private payment instructions before payment.", submit:russian ? "Запросить проверку за $500" : "Request the $500 Check" };
      if (trigger && trigger.hasAttribute("data-cae-growth-system-inquiry")) return { kind:"growth_system", intent:explicitIntent || "growth_system_inquiry", kicker:russian ? "Система роста" : "Growth System", title:russian ? "Спросить о постоянном сопровождении" : "Ask about recurring ownership", intro:russian ? "Оставьте имя и электронную почту. Условия работы определяются для каждой клиники отдельно." : "Leave your name and email. Commercial scope and economics stay client-specific.", submit:russian ? "Отправить запрос" : "Send Growth System request" };
      if (trigger && trigger.hasAttribute("data-cae-question")) return { kind:"question", intent:explicitIntent || "question", kicker:russian ? "Вопрос" : "Question", title:russian ? "Задать вопрос CAESTHETIC" : "Ask CAESTHETIC a question", intro:russian ? "Нужны только имя и электронная почта. Мы уже знаем, с какой страницы вы пришли, и ответим письмом." : "Name and email only. We will reply by email and already know which page you asked from.", submit:russian ? "Отправить вопрос" : "Send question" };
      return russian
        ? { kind:"request", intent:explicitIntent || (trigger && trigger.textContent ? trigger.textContent.trim() : "Запрос CAESTHETIC"), kicker:"Запрос", title:"Оставьте ваши данные", intro:"Нужны только имя и электронная почта. Мы ответим письмом.", submit:"Отправить запрос" }
        : { kind:"request", intent:explicitIntent || (trigger && trigger.textContent ? trigger.textContent.trim() : "CAESTHETIC request"), kicker:"Request", title:"Leave your details", intro:"Name and email only. We will reply by email.", submit:"Send request" };
    }

    function closeDialog() {
      dialog.close();
      if (activeTrigger) activeTrigger.focus();
    }
    function openDialog(trigger) {
      activeTrigger = trigger || null;
      var meta = metaFor(trigger);
      requestIntent = meta.intent;
      requestKind = meta.kind;
      kicker.textContent = meta.kicker;
      title.textContent = meta.title;
      intro.textContent = meta.intro;
      status.textContent = "";
      form.reset();
      var modalSubmit = qs('button[type="submit"]', form);
      modalSubmit.disabled = false;
      modalSubmit.textContent = meta.submit;
      dialog.showModal();
      qs('input[name="name"]', form).focus();
    }

    close.addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (event) { if (event.target === dialog) closeDialog(); });
    requestButtons.forEach(function (button) {
      button.addEventListener("click", function (event) { event.preventDefault(); openDialog(button); });
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submit = qs('button[type="submit"]', form);
      var payload = {
        action: "caesthetic_public_request",
        name: String(new FormData(form).get("name") || "").trim(),
        email: String(new FormData(form).get("email") || "").trim(),
        intent: requestIntent,
        page_url: window.location.href
      };
      submit.disabled = true;
      status.textContent = requestCopy.sending;
      fetch((window.CAESTHETIC_API && window.CAESTHETIC_API.request) || "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok || data.ok !== true || data.notification_sent !== true) throw new Error("request_failed");
          return data;
        });
      }).then(function () {
        status.textContent = requestKind === "question" ? requestCopy.questionSuccess : requestCopy.success;
        submit.textContent = requestCopy.sent;
        if (window.caestheticAnalytics && typeof window.caestheticAnalytics.track === "function") {
          window.caestheticAnalytics.track("caesthetic_request_submitted", { request_kind: requestKind, intent: requestIntent });
        }
      }).catch(function () {
        status.textContent = requestCopy.failed;
        submit.disabled = false;
      });
    });
  }

  function initRatingBars() {
    var blocks = qsa(".cae-rating-dist");
    if (!blocks.length || typeof IntersectionObserver === "undefined") return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        qsa(".cae-rating-dist__bar-fill", entry.target).forEach(function (fill) {
          var width = fill.getAttribute("data-width") || fill.style.width;
          if (width && !prefersReducedMotion) {
            fill.style.width = "0";
            void fill.offsetWidth;
            fill.style.width = width;
          }
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    blocks.forEach(function (b) { observer.observe(b); });
  }

  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var target = document.getElementById(anchor.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    });
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-cae-analytics], script[src$="/assets/js/analytics.js"]')) return;
    var s = document.createElement("script");
    s.src = "/assets/js/analytics.js";
    s.async = true;
    s.setAttribute("data-cae-analytics", "1");
    document.head.appendChild(s);
  }

  function init() {
    initYear();
    initActiveNav();
    initMobileNav();
    initDropdowns();
    initEvidenceStrips();
    initDemandMaps();
    initMultiStepForms();
    initForms();
    initRequestModal();
    initRatingBars();
    initSmoothScroll();
    loadAnalytics();
    if (window.caestheticGrowth && typeof window.caestheticGrowth.preserveQueryOnLinks === "function") window.caestheticGrowth.preserveQueryOnLinks();
  }

  function mount() {
    Promise.all([
      loadSlot("/templates/header.html", document.getElementById("cae-header-slot")),
      loadSlot("/templates/footer.html", document.getElementById("cae-footer-slot"))
    ]).then(init).catch(function (err) {
      console.warn("[caesthetic.js] Shell load issue:", err);
      init();
    });
  }

  /* Run before the deferred beauty-salons adapter binds its form. */
  initSalonScoreLaunchers();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
