/**
 * CAESTHETIC owner-facing point-of-contact component.
 * Identity comes from window.CAESTHETIC.analyst.
 * LinkedIn is deliberately fail-closed: it renders only when both a canonical URL
 * and linkedinVerified=true are present in repository-backed runtime config.
 */
(function () {
  "use strict";

  var AUTO_PAGES = new Set([
    "growth-score",
    "growth-score-report",
    "sprint",
    "lead-to-revenue-check",
    "growth-system",
    "pricing",
    "support"
  ]);

  function validLinkedIn(url) {
    if (typeof url !== "string" || !url.trim()) return false;
    try {
      var parsed = new URL(url);
      var host = parsed.hostname.toLowerCase();
      return parsed.protocol === "https:" &&
        (host === "linkedin.com" || host === "www.linkedin.com") &&
        parsed.pathname && parsed.pathname !== "/";
    } catch (_) {
      return false;
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function ensureAutomaticSlot() {
    if (document.querySelector("[data-cae-point-of-contact]")) return;
    var page = document.documentElement && document.documentElement.dataset.page;
    if (!AUTO_PAGES.has(page)) return;

    var main = document.querySelector("main");
    if (!main) return;
    var sections = Array.from(main.children).filter(function (child) {
      return child.tagName === "SECTION";
    });
    if (!sections.length) return;

    var slot = document.createElement("div");
    slot.setAttribute("data-cae-point-of-contact", "");
    main.insertBefore(slot, sections[sections.length - 1]);
  }

  function render(slot) {
    var analyst = window.CAESTHETIC && window.CAESTHETIC.analyst;
    if (!analyst || !analyst.name || !analyst.role) return;

    var section = el("section", "cae-section cae-point-of-contact");
    section.setAttribute("data-cae-point-of-contact-component", "");

    var wrap = el("div", "cae-wrap cae-wrap--narrow");
    var person = el("div", "cae-point-of-contact__person");

    if (analyst.photo) {
      var image = document.createElement("img");
      image.src = analyst.photo;
      image.width = 140;
      image.height = 140;
      image.alt = analyst.name + " monogram";
      image.loading = "lazy";
      person.appendChild(image);
    }

    var copy = document.createElement("div");
    copy.appendChild(el("p", "cae-kicker", "Your CAESTHETIC point of contact"));
    copy.appendChild(el("h2", "cae-h2", analyst.name));

    var lead = el("p", "cae-lead");
    lead.appendChild(document.createTextNode(
      analyst.name + " · " + analyst.role +
      " is your owner-facing point of contact for this process. She coordinates CAESTHETIC's work around the agreed scope, presents the findings, and makes sure you know what happens next. Specialist execution may involve other members of the distributed team; your owner-facing accountability stays clear."
    ));
    copy.appendChild(lead);

    if (analyst.linkedinVerified === true && validLinkedIn(analyst.linkedin)) {
      var actions = el("div", "cae-actions");
      var link = el("a", "cae-btn cae-btn--outline", "View Valerie on LinkedIn");
      link.href = analyst.linkedin;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.appendChild(link);
      copy.appendChild(actions);
    }

    person.appendChild(copy);
    wrap.appendChild(person);
    section.appendChild(wrap);
    slot.replaceWith(section);
  }

  function init() {
    ensureAutomaticSlot();
    Array.from(document.querySelectorAll("[data-cae-point-of-contact]")).forEach(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
