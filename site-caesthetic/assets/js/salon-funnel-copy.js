/** CAESTHETIC beauty-salon funnel copy adapter — keeps EN/ES/RU/FR shells on the canonical funnel. */
(function () {
  "use strict";

  function run() {
    var locale = (document.documentElement.getAttribute("data-locale") || document.documentElement.lang || "en").toLowerCase().split("-")[0];
    var copy = {
      en: {
        intake: "Four required fields: name, work email, salon name, and city/state.",
        faq: "Yes. The public Score costs $0 and starts with four required fields: name, work email, salon name, and city/state.",
        check: "Lead-to-Revenue Check · $500",
        question: "Ask a question"
      },
      es: {
        intake: "Cuatro campos obligatorios: nombre, email de trabajo, nombre del salón y ciudad/estado.",
        faq: "Sí. El Score público cuesta $0 y empieza con cuatro campos obligatorios: nombre, email de trabajo, nombre del salón y ciudad/estado.",
        check: "Lead-to-Revenue Check · $500",
        question: "Hacer una pregunta"
      },
      ru: {
        intake: "Четыре обязательных поля: имя, рабочий email, название салона и город/регион.",
        faq: "Да. Публичный Score стоит $0 и начинается с четырёх обязательных полей: имя, рабочий email, название салона и город/регион.",
        check: "Lead-to-Revenue Check · $500",
        question: "Задать вопрос"
      },
      fr: {
        intake: "Quatre champs obligatoires : nom, e-mail professionnel, nom du salon et ville/État ou région.",
        faq: "Oui. Le Score public coûte $0 et commence par quatre champs obligatoires : nom, e-mail professionnel, nom du salon et ville/État ou région.",
        check: "Lead-to-Revenue Check · $500",
        question: "Poser une question"
      }
    }[locale] || null;
    if (!copy) return;

    var intake = document.querySelector(".cae-salon-form-section .cae-lead");
    if (intake) intake.textContent = copy.intake;

    document.querySelectorAll(".cae-salon-faq details p").forEach(function (node) {
      if (/required fields|campos obligatorios|обязательн|champs obligatoires/i.test(node.textContent || "")) {
        node.textContent = copy.faq;
      }
    });

    var productColumn = Array.from(document.querySelectorAll(".cae-salon-footer__links")).find(function (links) {
      return !!links.querySelector('a[href="/growth-score/"]');
    });
    if (productColumn && !productColumn.querySelector('a[href="/lead-to-revenue-check/"]')) {
      var check = document.createElement("a");
      check.href = "/lead-to-revenue-check/";
      check.textContent = copy.check;
      var sprint = productColumn.querySelector('a[href="/sprint/"]');
      if (sprint) productColumn.insertBefore(check, sprint);
      else productColumn.appendChild(check);
    }
    if (productColumn && !productColumn.querySelector('a[href="/support/"]')) {
      var question = document.createElement("a");
      question.href = "/support/";
      question.textContent = copy.question;
      productColumn.appendChild(question);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
