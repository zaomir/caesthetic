/**
 * CAESTHETIC — Clinical Editorial Intelligence
 * caesthetic.js v2.0
 *
 * Modules:
 *   shell      — load header + footer templates, set year, active nav link
 *   nav        — mobile menu toggle (hamburger ↔ close)
 *   dropdown   — Solutions keyboard-accessible desktop dropdown
 *   evidence   — IntersectionObserver appear + counter animation
 *   demandMap  — stage click / keyboard interaction
 *   form       — multi-step form + legacy enquiry mailto fallback
 *
 * Motion: all transitions respect prefers-reduced-motion via CSS;
 * counter animation is skipped when reduced motion is preferred.
 */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────────
     UTILS
  ────────────────────────────────────────────────────────────── */

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ──────────────────────────────────────────────────────────────
     SHELL: load header.html + footer.html into slots
  ────────────────────────────────────────────────────────────── */

  function loadSlot(path, slot) {
    if (!slot) return Promise.resolve();
    return fetch(path, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("Template load failed: " + path);
        return r.text();
      })
      .then(function (html) {
        slot.innerHTML = html;
      });
  }

  /* ──────────────────────────────────────────────────────────────
     YEAR
  ────────────────────────────────────────────────────────────── */

  function initYear() {
    var el = document.getElementById("cae-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ──────────────────────────────────────────────────────────────
     ACTIVE NAV STATE
  ────────────────────────────────────────────────────────────── */

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

  /* ──────────────────────────────────────────────────────────────
     MOBILE NAV TOGGLE
  ────────────────────────────────────────────────────────────── */

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

    btn.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    /* Close when a leaf nav link is clicked (keep open for in-menu toggles) */
    qsa("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     SOLUTIONS DROPDOWN (desktop + mobile)
  ────────────────────────────────────────────────────────────── */

  function initDropdowns() {
    qsa(".cae-nav__dropdown-toggle").forEach(function (toggle) {
      var controlledId = toggle.getAttribute("aria-controls");
      var panel = controlledId ? document.getElementById(controlledId) : null;
      if (!panel) return;

      function openDropdown() {
        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }

      function closeDropdown() {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
      }

      function toggleDropdown() {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        if (isOpen) { closeDropdown(); } else { openDropdown(); }
      }

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleDropdown();
      });

      /* Keyboard: Enter/Space to open, Escape to close */
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

      /* Arrow-key navigation within dropdown */
      panel.addEventListener("keydown", function (e) {
        var links = qsa(".cae-nav__dropdown-link", panel);
        var focused = document.activeElement;
        var idx = links.indexOf(focused);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          var next = links[idx + 1] || links[0];
          if (next) next.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          var prev = links[idx - 1];
          if (prev) { prev.focus(); } else { toggle.focus(); closeDropdown(); }
        } else if (e.key === "Escape") {
          closeDropdown();
          toggle.focus();
        } else if (e.key === "Tab") {
          closeDropdown();
        }
      });

      /* Click outside to close */
      document.addEventListener("click", function (e) {
        var item = toggle.closest(".cae-nav__item");
        if (item && !item.contains(e.target)) {
          closeDropdown();
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     EVIDENCE STRIP: IntersectionObserver appear + counter
  ────────────────────────────────────────────────────────────── */

  function countUp(el, target, duration) {
    var start = performance.now();
    var isFloat = String(target).indexOf(".") !== -1;
    var decimals = isFloat ? String(target).split(".")[1].length : 0;

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
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

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var strip = entry.target;
          strip.classList.add("is-visible");

          /* Animate numbers if reduced motion not preferred */
          if (!prefersReducedMotion) {
            qsa("[data-count]", strip).forEach(function (el, i) {
              var target = parseFloat(el.getAttribute("data-count"));
              if (!isNaN(target)) {
                setTimeout(function () {
                  countUp(el, target, 800);
                }, i * 80);
              }
            });
          }

          observer.unobserve(strip);
        });
      },
      { threshold: 0.2 }
    );

    strips.forEach(function (s) { observer.observe(s); });
  }

  /* ──────────────────────────────────────────────────────────────
     DEMAND MAP: stage click / keyboard navigation
  ────────────────────────────────────────────────────────────── */

  function initDemandMaps() {
    qsa(".cae-demand-map").forEach(function (map) {
      var stages = qsa(".cae-demand-map__stage", map);
      /* Detail panel — placed immediately after .cae-demand-map in DOM */
      var detailPanel = map.nextElementSibling;
      if (detailPanel && !detailPanel.classList.contains("cae-demand-map__detail")) {
        detailPanel = null;
      }

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
            } else {
              detailPanel.classList.remove("is-open");
            }
          }
        }

        stage.addEventListener("click", activateStage);
        stage.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activateStage();
          }
        });
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     MULTI-STEP FORM
  ────────────────────────────────────────────────────────────── */

  function initMultiStepForms() {
    qsa(".cae-form[data-multistep]").forEach(function (form) {
      var steps = qsa(".cae-form-step", form);
      var progressSteps = qsa(".cae-form-progress__step", form);
      var currentStep = 0;

      function showStep(idx) {
        steps.forEach(function (s, i) {
          s.classList.toggle("is-active", i === idx);
        });
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

        if (next && currentStep < steps.length - 1) {
          showStep(currentStep + 1);
        }
        if (prev && currentStep > 0) {
          showStep(currentStep - 1);
        }
      });

      showStep(0);
    });
  }

  /* ──────────────────────────────────────────────────────────────
     SINGLE-STEP LEGACY ENQUIRY FORM (Growth Score is API-only in growth.js)
  ────────────────────────────────────────────────────────────── */

  function initForms() {
    qsa(".cae-form:not([data-multistep]):not([data-cae-score-form])").forEach(function (form) {
      var successEl = qs(".cae-form-success", form);
      if (successEl) successEl.hidden = true;
    });
  }

  /* ──────────────────────────────────────────────────────────────
     TWO-FIELD REQUEST MODAL
  ────────────────────────────────────────────────────────────── */

  function initRequestModal() {
    var requestButtons = qsa('a[data-cae-request], button[data-cae-request], a[data-cae-sprint-inquiry], a.cae-btn[href="/growth-score/"], a.cae-btn[href="#salon-score-form"], [data-cae-score-form] button[type="submit"], [data-cae-salon-score-form] button[type="submit"], .cae-form:not([data-multistep]) button[type="submit"]');
    var requestForms = qsa(".cae-form:not([data-multistep]), [data-cae-score-form], [data-cae-salon-score-form]");
    if (!requestButtons.length && !requestForms.length) return;

    var dialog = document.createElement("dialog");
    dialog.className = "cae-request-modal";
    dialog.setAttribute("aria-labelledby", "cae-request-modal-title");
    dialog.innerHTML =
      '<div class="cae-request-modal__panel">' +
        '<button class="cae-request-modal__close" type="button" aria-label="Close request form">×</button>' +
        '<p class="cae-kicker">Request</p>' +
        '<h2 class="cae-h2" id="cae-request-modal-title">Leave your details</h2>' +
        '<p class="cae-request-modal__intro">We will reply by email.</p>' +
        '<form class="cae-request-modal__form">' +
          '<label for="cae-request-name">Name</label>' +
          '<input id="cae-request-name" name="name" type="text" autocomplete="name" required>' +
          '<label for="cae-request-email">Email</label>' +
          '<input id="cae-request-email" name="email" type="email" autocomplete="email" inputmode="email" required>' +
          '<button class="cae-btn cae-btn--primary" type="submit">Send request</button>' +
          '<p class="cae-request-modal__status" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(dialog);

    var form = qs("form", dialog);
    var close = qs(".cae-request-modal__close", dialog);
    var status = qs(".cae-request-modal__status", dialog);
    var activeTrigger = null;
    var requestIntent = "";

    function closeDialog() {
      dialog.close();
      if (activeTrigger) activeTrigger.focus();
    }

    function openDialog(trigger) {
      activeTrigger = trigger || null;
      requestIntent = trigger && trigger.textContent
        ? trigger.textContent.trim()
        : "CAESTHETIC request";
      status.textContent = "";
      form.reset();
      var modalSubmit = qs('button[type="submit"]', form);
      modalSubmit.disabled = false;
      modalSubmit.textContent = "Send request";
      dialog.showModal();
      qs('input[name="name"]', form).focus();
    }

    close.addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeDialog();
    });

    requestButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        openDialog(button);
      });
    });

    requestForms.forEach(function (requestForm) {
      requestForm.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openDialog(qs('button[type="submit"]', requestForm));
      }, true);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submit = qs('button[type="submit"]', form);
      var payload = {
        name: String(new FormData(form).get("name") || "").trim(),
        email: String(new FormData(form).get("email") || "").trim(),
        intent: requestIntent,
        page_url: window.location.href
      };
      submit.disabled = true;
      status.textContent = "Sending…";
      fetch((window.CAESTHETIC_API && window.CAESTHETIC_API.request) || "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) throw new Error("request_failed");
        status.textContent = "Request sent. We will reply by email.";
        submit.textContent = "Sent";
      }).catch(function () {
        status.textContent = "We could not send the request. Please try again.";
        submit.disabled = false;
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     RATING BAR ANIMATION (on scroll into view)
  ────────────────────────────────────────────────────────────── */

  function initRatingBars() {
    var blocks = qsa(".cae-rating-dist");
    if (!blocks.length || typeof IntersectionObserver === "undefined") return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          qsa(".cae-rating-dist__bar-fill", entry.target).forEach(function (fill) {
            var width = fill.getAttribute("data-width") || fill.style.width;
            if (width && !prefersReducedMotion) {
              fill.style.width = "0";
              /* Force reflow then animate */
              void fill.offsetWidth;
              fill.style.width = width;
            }
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    blocks.forEach(function (b) { observer.observe(b); });
  }

  /* ──────────────────────────────────────────────────────────────
     SMOOTH ANCHOR SCROLL (respects prefers-reduced-motion)
  ────────────────────────────────────────────────────────────── */

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

  /* ──────────────────────────────────────────────────────────────
     INIT: wire everything up after shell loads
  ────────────────────────────────────────────────────────────── */

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
    if (window.caestheticGrowth && typeof window.caestheticGrowth.preserveQueryOnLinks === "function") {
      window.caestheticGrowth.preserveQueryOnLinks();
    }
  }

  /* ──────────────────────────────────────────────────────────────
     MOUNT: load shell templates → then init
  ────────────────────────────────────────────────────────────── */

  function mount() {
    Promise.all([
      loadSlot("/templates/header.html", document.getElementById("cae-header-slot")),
      loadSlot("/templates/footer.html",  document.getElementById("cae-footer-slot"))
    ])
      .then(init)
      .catch(function (err) {
        /* Even if template load fails, init page-level functionality */
        console.warn("[caesthetic.js] Shell load issue:", err);
        init();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

})();
