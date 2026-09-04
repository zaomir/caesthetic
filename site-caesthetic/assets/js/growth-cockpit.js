/**
 * CAESTHETIC Growth Score mobile decision story.
 *
 * Presentation-only layer over the schema-v5 / template-5.2 report contract.
 * The evidence model, named-human approval and private delivery rules remain
 * authoritative in the report JSON and workflow. Client-visible attribution is
 * intentionally removed.
 */
(function initGrowthCockpit() {
  "use strict";

  const CLIENT_UI_VERSION = "growth-score-mobile-ui/1.1.2";
  const STAGES = ["discovery", "trust", "enquiry", "booking", "treatment"];
  const SECTION_IDS = [
    "gap-map",
    "focus-gaps",
    "sprint-fit",
    "repair-paths",
    "do-not-fund",
    "gap-inventory",
    "evidence-and-competitors",
    "scores-and-methodology",
    "next-step",
  ];

  const COPY = {
    en: {
      brand: "CAESTHETIC",
      report: "GROWTH SCORE",
      menu: "Report sections",
      close: "Close",
      primaryConstraint: "Main constraint",
      strongPoint: "What already works",
      firstAction: "Fix first",
      evidence: "Show evidence",
      hideEvidence: "Hide evidence",
      sectionTitles: [
        "Where demand breaks",
        "What to fix first",
        "What can change in 30 days",
        "How to fix it",
        "What not to fund yet",
        "Every diagnosed gap",
        "Why we reached this decision",
        "The state of the four surfaces",
        "Who will implement it",
      ],
      sectionKickers: [
        "Constraint and demand journey",
        "One primary and two supporting priorities",
        "Close · Start · Later",
        "Complete implementation instructions",
        "One spending stop",
        "Full gap inventory",
        "Evidence and comparable alternatives",
        "Scores are secondary navigation",
        "Four valid implementation paths",
      ],
      journey: "Demand journey",
      stages: {
        discovery: "They find you",
        trust: "They check you",
        enquiry: "They contact you",
        booking: "They book",
        treatment: "They receive the service",
      },
      statuses: {
        strong: "Working",
        friction: "Friction",
        constraint: "Main constraint",
        unknown: "Not assessed",
      },
      selectedPriorities: "Three priorities for action",
      primary: "Primary",
      supporting: "Supporting",
      close30: "Close in 30 days",
      start30: "Start in 30 days",
      later: "Later",
      repairIntro: "Open a priority to see the complete implementation path. The instructions may be used in-house, with another provider or with CAESTHETIC.",
      outcome: "Outcome",
      steps: "Steps",
      needs: "Dependencies",
      owner: "Who can do it",
      doneWhen: "Done when",
      day30: "Day-30 outcome",
      beyond30: "After Day 30",
      inventoryAll: "All",
      inventoryNow: "Now",
      inventoryLater: "Later",
      inventoryMonitor: "Monitor",
      inventoryUnknown: "Needs verification",
      openGap: "Open details",
      closeGap: "Close details",
      competitorMatrix: "Open full comparison matrix",
      allEvidence: "Show all evidence",
      methodology: "How we calculated it",
      scoreStrong: "Strong surface",
      scorePartial: "Working with leakage",
      scoreConstraint: "Constraining the decision",
      scoreUnknown: "Insufficient evidence",
      pathways: ["Do it in-house", "Use another provider", "Defer", "Ask CAESTHETIC"],
      whyCaesthetic: "Why CAESTHETIC is the simplest executor",
      sprintTitle: "30-Day Growth Sprint",
      sprintCopy: "We prepare a written scope around the verified priorities. Scope is confirmed separately; no ranking, patient, revenue or ROI outcome is promised.",
      sprintPrice: "$2,500 · 30 days",
      cta: "Ask CAESTHETIC to implement",
      noCommitment: "The report does not commit you to a service.",
    },
    ru: {
      brand: "CAESTHETIC",
      report: "GROWTH SCORE",
      menu: "Разделы отчёта",
      close: "Закрыть",
      primaryConstraint: "Главное ограничение",
      strongPoint: "Что уже работает",
      firstAction: "Исправить первым",
      evidence: "Показать доказательства",
      hideEvidence: "Скрыть доказательства",
      sectionTitles: [
        "Где теряется спрос",
        "Что исправить сначала",
        "Что реально изменить за 30 дней",
        "Как это исправить",
        "На что пока не тратить деньги",
        "Все найденные разрывы",
        "Почему мы так решили",
        "Состояние четырёх поверхностей",
        "Кто будет внедрять",
      ],
      sectionKickers: [
        "Ограничение и путь спроса",
        "Один главный и два поддерживающих приоритета",
        "Закрыть · Начать · Позже",
        "Полные инструкции по внедрению",
        "Одна остановка расходов",
        "Полный реестр разрывов",
        "Доказательства и сопоставимые альтернативы",
        "Баллы — вспомогательная навигация",
        "Четыре допустимых пути",
      ],
      journey: "Путь спроса",
      stages: {
        discovery: "Находят вас",
        trust: "Проверяют вас",
        enquiry: "Обращаются",
        booking: "Записываются",
        treatment: "Получают услугу",
      },
      statuses: {
        strong: "Работает",
        friction: "Есть трение",
        constraint: "Главное ограничение",
        unknown: "Не оценивалось",
      },
      selectedPriorities: "Три приоритета для действий",
      primary: "Главный",
      supporting: "Поддерживающий",
      close30: "Закрыть за 30 дней",
      start30: "Начать за 30 дней",
      later: "Позже",
      repairIntro: "Откройте приоритет, чтобы увидеть полный путь внедрения. Инструкции можно использовать внутри команды, передать другому подрядчику или реализовать с CAESTHETIC.",
      outcome: "Результат",
      steps: "Шаги",
      needs: "Зависимости",
      owner: "Кто может выполнить",
      doneWhen: "Готово, когда",
      day30: "Результат к 30-му дню",
      beyond30: "После 30-го дня",
      inventoryAll: "Все",
      inventoryNow: "Сейчас",
      inventoryLater: "Позже",
      inventoryMonitor: "Наблюдать",
      inventoryUnknown: "Нужно проверить",
      openGap: "Открыть детали",
      closeGap: "Закрыть детали",
      competitorMatrix: "Открыть полную матрицу сравнения",
      allEvidence: "Показать все доказательства",
      methodology: "Как мы считали",
      scoreStrong: "Сильная поверхность",
      scorePartial: "Работает с потерями",
      scoreConstraint: "Ограничивает решение",
      scoreUnknown: "Недостаточно данных",
      pathways: ["Сделать внутри команды", "Отдать своему подрядчику", "Отложить", "Поручить CAESTHETIC"],
      whyCaesthetic: "Почему CAESTHETIC — самый простой исполнитель",
      sprintTitle: "30-Day Growth Sprint",
      sprintCopy: "Мы подготовим письменный scope вокруг подтверждённых приоритетов. Scope согласуется отдельно; мы не обещаем ranking, пациентов, выручку или ROI.",
      sprintPrice: "$2,500 · 30 дней",
      cta: "Поручить внедрение CAESTHETIC",
      noCommitment: "Отчёт не обязывает вас покупать услугу.",
    },
    es: {
      brand: "CAESTHETIC",
      report: "GROWTH SCORE",
      menu: "Secciones del informe",
      close: "Cerrar",
      primaryConstraint: "Restricción principal",
      strongPoint: "Lo que ya funciona",
      firstAction: "Corregir primero",
      evidence: "Ver evidencia",
      hideEvidence: "Ocultar evidencia",
      sectionTitles: [
        "Dónde se pierde la demanda",
        "Qué corregir primero",
        "Qué puede cambiar en 30 días",
        "Cómo corregirlo",
        "Qué no financiar todavía",
        "Todas las brechas detectadas",
        "Por qué llegamos a esta decisión",
        "Estado de las cuatro superficies",
        "Quién lo implementará",
      ],
      sectionKickers: [
        "Restricción y recorrido de demanda",
        "Una prioridad principal y dos de apoyo",
        "Cerrar · Iniciar · Más adelante",
        "Instrucciones completas de implementación",
        "Una pausa de inversión",
        "Inventario completo de brechas",
        "Evidencia y alternativas comparables",
        "Las puntuaciones son navegación secundaria",
        "Cuatro caminos válidos",
      ],
      journey: "Recorrido de demanda",
      stages: {
        discovery: "Te encuentran",
        trust: "Te comprueban",
        enquiry: "Contactan",
        booking: "Reservan",
        treatment: "Reciben el servicio",
      },
      statuses: { strong: "Funciona", friction: "Hay fricción", constraint: "Restricción principal", unknown: "No evaluado" },
      selectedPriorities: "Tres prioridades para actuar",
      primary: "Principal",
      supporting: "Apoyo",
      close30: "Cerrar en 30 días",
      start30: "Iniciar en 30 días",
      later: "Más adelante",
      repairIntro: "Abre una prioridad para ver la ruta completa. Puedes usarla internamente, con otro proveedor o con CAESTHETIC.",
      outcome: "Resultado",
      steps: "Pasos",
      needs: "Dependencias",
      owner: "Quién puede hacerlo",
      doneWhen: "Terminado cuando",
      day30: "Resultado al día 30",
      beyond30: "Después del día 30",
      inventoryAll: "Todas",
      inventoryNow: "Ahora",
      inventoryLater: "Más adelante",
      inventoryMonitor: "Observar",
      inventoryUnknown: "Requiere verificación",
      openGap: "Abrir detalles",
      closeGap: "Cerrar detalles",
      competitorMatrix: "Abrir matriz completa",
      allEvidence: "Ver toda la evidencia",
      methodology: "Cómo lo calculamos",
      scoreStrong: "Superficie fuerte",
      scorePartial: "Funciona con pérdidas",
      scoreConstraint: "Limita la decisión",
      scoreUnknown: "Evidencia insuficiente",
      pathways: ["Hacerlo internamente", "Usar otro proveedor", "Aplazar", "Pedirlo a CAESTHETIC"],
      whyCaesthetic: "Por qué CAESTHETIC es el ejecutor más sencillo",
      sprintTitle: "30-Day Growth Sprint",
      sprintCopy: "Preparamos un alcance escrito alrededor de las prioridades verificadas. El alcance se confirma por separado y no prometemos ranking, pacientes, ingresos ni ROI.",
      sprintPrice: "$2,500 · 30 días",
      cta: "Pedir a CAESTHETIC que lo implemente",
      noCommitment: "El informe no te compromete a contratar un servicio.",
    },
    fr: {
      brand: "CAESTHETIC",
      report: "GROWTH SCORE",
      menu: "Sections du rapport",
      close: "Fermer",
      primaryConstraint: "Contrainte principale",
      strongPoint: "Ce qui fonctionne déjà",
      firstAction: "À corriger en premier",
      evidence: "Voir les preuves",
      hideEvidence: "Masquer les preuves",
      sectionTitles: [
        "Où la demande se perd",
        "Quoi corriger en premier",
        "Ce qui peut changer en 30 jours",
        "Comment le corriger",
        "Quoi ne pas financer pour l'instant",
        "Tous les écarts détectés",
        "Pourquoi nous arrivons à cette décision",
        "État des quatre surfaces",
        "Qui va le mettre en œuvre",
      ],
      sectionKickers: [
        "Contrainte et parcours de demande",
        "Une priorité principale et deux de soutien",
        "Fermer · Commencer · Plus tard",
        "Instructions complètes de mise en œuvre",
        "Une dépense à arrêter",
        "Inventaire complet des écarts",
        "Preuves et alternatives comparables",
        "Les scores sont une navigation secondaire",
        "Quatre chemins valides",
      ],
      journey: "Parcours de demande",
      stages: {
        discovery: "Ils vous trouvent",
        trust: "Ils vous vérifient",
        enquiry: "Ils vous contactent",
        booking: "Ils réservent",
        treatment: "Ils reçoivent le service",
      },
      statuses: { strong: "Fonctionne", friction: "Friction", constraint: "Contrainte principale", unknown: "Non évalué" },
      selectedPriorities: "Trois priorités d'action",
      primary: "Principale",
      supporting: "Soutien",
      close30: "Fermer en 30 jours",
      start30: "Commencer en 30 jours",
      later: "Plus tard",
      repairIntro: "Ouvrez une priorité pour voir le parcours complet. Vous pouvez l'utiliser en interne, avec un autre prestataire ou avec CAESTHETIC.",
      outcome: "Résultat",
      steps: "Étapes",
      needs: "Dépendances",
      owner: "Qui peut le faire",
      doneWhen: "Terminé lorsque",
      day30: "Résultat au jour 30",
      beyond30: "Après le jour 30",
      inventoryAll: "Tous",
      inventoryNow: "Maintenant",
      inventoryLater: "Plus tard",
      inventoryMonitor: "Surveiller",
      inventoryUnknown: "À vérifier",
      openGap: "Ouvrir les détails",
      closeGap: "Fermer les détails",
      competitorMatrix: "Ouvrir la matrice complète",
      allEvidence: "Voir toutes les preuves",
      methodology: "Comment nous avons calculé",
      scoreStrong: "Surface forte",
      scorePartial: "Fonctionne avec des pertes",
      scoreConstraint: "Limite la décision",
      scoreUnknown: "Preuves insuffisantes",
      pathways: ["Mettre en œuvre en interne", "Utiliser un autre prestataire", "Différer", "Demander à CAESTHETIC"],
      whyCaesthetic: "Pourquoi CAESTHETIC est l'exécutant le plus simple",
      sprintTitle: "30-Day Growth Sprint",
      sprintCopy: "Nous préparons un périmètre écrit autour des priorités vérifiées. Le périmètre est confirmé séparément; aucun classement, patient, revenu ou ROI n'est promis.",
      sprintPrice: "$2,500 · 30 jours",
      cta: "Demander à CAESTHETIC de mettre en œuvre",
      noCommitment: "Le rapport ne vous engage pas à acheter un service.",
    },
    uk: {
      brand: "CAESTHETIC",
      report: "GROWTH SCORE",
      menu: "Розділи звіту",
      close: "Закрити",
      primaryConstraint: "Головне обмеження",
      strongPoint: "Що вже працює",
      firstAction: "Виправити першим",
      evidence: "Показати докази",
      hideEvidence: "Сховати докази",
      sectionTitles: [
        "Де втрачається попит",
        "Що виправити спочатку",
        "Що реально змінити за 30 днів",
        "Як це виправити",
        "На що поки не витрачати гроші",
        "Усі знайдені розриви",
        "Чому ми дійшли цього рішення",
        "Стан чотирьох поверхонь",
        "Хто буде впроваджувати",
      ],
      sectionKickers: [
        "Обмеження і шлях попиту",
        "Один головний і два підтримувальні пріоритети",
        "Закрити · Почати · Пізніше",
        "Повні інструкції з упровадження",
        "Одна зупинка витрат",
        "Повний реєстр розривів",
        "Докази і зіставні альтернативи",
        "Бали — допоміжна навігація",
        "Чотири допустимі шляхи",
      ],
      journey: "Шлях попиту",
      stages: {
        discovery: "Знаходять вас",
        trust: "Перевіряють вас",
        enquiry: "Звертаються",
        booking: "Записуються",
        treatment: "Отримують послугу",
      },
      statuses: { strong: "Працює", friction: "Є тертя", constraint: "Головне обмеження", unknown: "Не оцінено" },
      selectedPriorities: "Три пріоритети для дій",
      primary: "Головний",
      supporting: "Підтримувальний",
      close30: "Закрити за 30 днів",
      start30: "Почати за 30 днів",
      later: "Пізніше",
      repairIntro: "Відкрийте пріоритет, щоб побачити повний шлях упровадження. Інструкції можна використати всередині команди, передати іншому підряднику або реалізувати з CAESTHETIC.",
      outcome: "Результат",
      steps: "Кроки",
      needs: "Залежності",
      owner: "Хто може виконати",
      doneWhen: "Готово, коли",
      day30: "Результат до 30-го дня",
      beyond30: "Після 30-го дня",
      inventoryAll: "Усі",
      inventoryNow: "Зараз",
      inventoryLater: "Пізніше",
      inventoryMonitor: "Спостерігати",
      inventoryUnknown: "Потрібно перевірити",
      openGap: "Відкрити деталі",
      closeGap: "Закрити деталі",
      competitorMatrix: "Відкрити повну матрицю",
      allEvidence: "Показати всі докази",
      methodology: "Як ми рахували",
      scoreStrong: "Сильна поверхня",
      scorePartial: "Працює з втратами",
      scoreConstraint: "Обмежує рішення",
      scoreUnknown: "Недостатньо даних",
      pathways: ["Зробити всередині команди", "Віддати своєму підряднику", "Відкласти", "Доручити CAESTHETIC"],
      whyCaesthetic: "Чому CAESTHETIC — найпростіший виконавець",
      sprintTitle: "30-Day Growth Sprint",
      sprintCopy: "Ми підготуємо письмовий scope навколо підтверджених пріоритетів. Scope погоджується окремо; ми не обіцяємо ranking, пацієнтів, виручку або ROI.",
      sprintPrice: "$2,500 · 30 днів",
      cta: "Доручити впровадження CAESTHETIC",
      noCommitment: "Звіт не зобов'язує вас купувати послугу.",
    },
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const body = document.body;
  let reportData = null;
  let context = { report_kind: root.dataset.reportKind || "", vertical_context: "", locale: "en" };

  function localeKey() {
    const lang = (root.lang || "en").toLowerCase();
    if (lang.startsWith("ru")) return "ru";
    if (lang.startsWith("es")) return "es";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("uk") || lang.startsWith("ua")) return "uk";
    return "en";
  }

  const locale = localeKey();
  const t = COPY[locale] || COPY.en;

  function isNetworkParent() {
    return reportData?.audit?.format === "multi_location" && reportData.audit.package_role === "network_parent";
  }

  function isFocusLocationChild() {
    return reportData?.audit?.format === "multi_location" && reportData.audit.package_role === "focus_location";
  }

  function sectionTitle(id, index) {
    if (!isNetworkParent()) return t.sectionTitles[index];
    return document.getElementById(id)?.querySelector(".cae-h2")?.textContent?.trim() || t.sectionTitles[index];
  }

  function evidenceCountLabel(count) {
    const forms = {
      en: count === 1 ? "evidence source" : "evidence sources",
      ru: count === 1 ? "источник" : (count > 1 && count < 5 ? "источника" : "источников"),
      es: count === 1 ? "fuente" : "fuentes",
      fr: count === 1 ? "source" : "sources",
      uk: count === 1 ? "джерело" : (count > 1 && count < 5 ? "джерела" : "джерел"),
    };
    return `${count} ${forms[locale] || forms.en}`;
  }

  function injectPresentationStyles() {
    if (document.querySelector('link[data-cae-mobile-report]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assets/css/growth-report-mobile.css?v=1.1.2";
    link.dataset.caeMobileReport = CLIENT_UI_VERSION;
    document.head.append(link);
    root.dataset.growthScoreUi = CLIENT_UI_VERSION;
    body.classList.add("cae-score-report--mobile-story");
  }

  function track(name, payload) {
    const data = {
      event: name,
      report_kind: context.report_kind,
      vertical_context: context.vertical_context,
      report_locale: context.locale,
      ...(payload || {}),
    };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(data);
    if (typeof window.gtag === "function") window.gtag("event", name, data);
  }

  function removeClientVisibleAttribution() {
    document.querySelectorAll(".cae-report-walkthrough, .cae-report-header__byline").forEach((node) => node.remove());

    document.querySelectorAll(".cae-report-header .cae-report-meta").forEach((node, index) => {
      if (index === 0) return;
      node.remove();
    });

    const neutralizePatterns = [
      /\bAmir\b/gi,
      /\bАмира?\b/gi,
      /\bValerie Petra\b/gi,
      /\bВалери(?:я)? Петра\b/gi,
      /\bSelected by\b[^.·<]*/gi,
      /\bApproved by\b[^.·<]*/gi,
      /\bReviewed by\b[^.·<]*/gi,
      /\bвыбрал(?:а)?\b[^.·<]*/gi,
      /\bутвердил(?:а)?\b[^.·<]*/gi,
    ];

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      let value = node.nodeValue || "";
      neutralizePatterns.forEach((pattern) => { value = value.replace(pattern, ""); });
      node.nodeValue = value.replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1");
    });
  }

  function setSectionCopy() {
    if (isNetworkParent()) return;
    SECTION_IDS.forEach((id, index) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.dataset.clientTitle = t.sectionTitles[index];
      const wrap = section.querySelector(":scope > .cae-wrap");
      const kicker = wrap?.querySelector(":scope > .cae-kicker");
      const title = wrap?.querySelector(":scope > .cae-h2");
      if (kicker) kicker.textContent = t.sectionKickers[index];
      if (title) title.textContent = t.sectionTitles[index];
    });

    const focusTitle = document.querySelector("#focus-gaps .cae-h2");
    if (focusTitle) focusTitle.textContent = t.selectedPriorities;
    const focusRationale = document.querySelector("#focus-gaps .cae-h2 + p");
    if (focusRationale) focusRationale.classList.add("cae-mobile-focus-rationale");
  }

  function buildMobileNavigation() {
    if (document.querySelector(".cae-mobile-report-nav")) return;
    const practiceName = document.querySelector(".cae-report-header h1")?.textContent?.trim() || t.report;
    const nav = document.createElement("header");
    nav.className = "cae-mobile-report-nav";
    nav.innerHTML = `
      <a class="cae-mobile-report-nav__brand" href="/" aria-label="CAESTHETIC home">${t.brand}</a>
      <span class="cae-mobile-report-nav__practice"></span>
      <button class="cae-mobile-report-nav__progress" type="button" aria-haspopup="dialog" aria-expanded="false">1 / 9</button>`;
    nav.querySelector(".cae-mobile-report-nav__practice").textContent = practiceName;

    const dialog = document.createElement("dialog");
    dialog.className = "cae-mobile-report-sheet";
    dialog.setAttribute("aria-label", t.menu);
    const list = document.createElement("ol");
    SECTION_IDS.forEach((id, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${id}`;
      link.dataset.sectionIndex = String(index + 1);
      link.innerHTML = `<span>${index + 1}</span><strong></strong>`;
      link.querySelector("strong").textContent = sectionTitle(id, index);
      item.append(link);
      list.append(item);
    });
    const close = document.createElement("button");
    close.type = "button";
    close.className = "cae-mobile-report-sheet__close";
    close.textContent = t.close;
    dialog.append(list, close);
    body.prepend(dialog);
    const firstContent = document.querySelector("main") || body.firstChild;
    body.insertBefore(nav, firstContent);

    const progress = nav.querySelector(".cae-mobile-report-nav__progress");
    const open = () => {
      progress.setAttribute("aria-expanded", "true");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };
    const closeDialog = () => {
      progress.setAttribute("aria-expanded", "false");
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      progress.focus();
    };
    progress.addEventListener("click", open);
    close.addEventListener("click", closeDialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeDialog));

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const setCurrent = (index) => {
      progress.textContent = `${index + 1} / 9`;
      dialog.querySelectorAll("a").forEach((link, linkIndex) => {
        if (linkIndex === index) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      track("growth_score_section_view", { section_id: SECTION_IDS[index] });
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = sections.indexOf(visible.target);
        if (index >= 0) setCurrent(index);
      }, { threshold: [0.15, 0.35, 0.6], rootMargin: "-25% 0px -55% 0px" });
      sections.forEach((section) => observer.observe(section));
    }
    setCurrent(0);
  }

  function journeyStatusFromReport(stage) {
    const explicit = reportData?.humanDiagnosis?.demand_journey?.find((item) => item.stage === stage);
    if (explicit && ["strong", "friction", "constraint", "unknown"].includes(explicit.status)) return explicit;

    const diagnosis = reportData?.humanDiagnosis;
    if (diagnosis?.binding_constraint?.demand_stage === stage) {
      return { stage, status: "constraint", summary: diagnosis.binding_constraint.statement || t.statuses.constraint };
    }
    const gaps = (diagnosis?.gap_inventory || []).filter((gap) => gap.journey_stage === stage);
    const working = gaps.find((gap) => gap.diagnosis_state === "working");
    if (working) return { stage, status: "strong", summary: working.why_it_matters || t.statuses.strong };
    const friction = gaps.find((gap) => !["working", "insufficient_evidence"].includes(gap.diagnosis_state));
    if (friction) return { stage, status: "friction", summary: friction.why_it_matters || t.statuses.friction };
    return { stage, status: "unknown", summary: t.statuses.unknown };
  }

  function rebuildDemandJourney() {
    const demand = document.querySelector(".cae-report-demand");
    if (!demand) return;
    demand.setAttribute("aria-label", t.journey);
    const kicker = demand.querySelector(".cae-kicker");
    if (kicker) kicker.textContent = t.journey;
    const list = demand.querySelector("ol");
    if (!list) return;
    list.replaceChildren();
    STAGES.forEach((stage) => {
      const item = journeyStatusFromReport(stage);
      const li = document.createElement("li");
      li.className = "cae-report-demand__stage";
      li.dataset.status = item.status;
      li.setAttribute("aria-label", `${t.stages[stage]}. ${t.statuses[item.status]}. ${item.summary || ""}`);
      li.innerHTML = `
        <span class="cae-mobile-demand-dot" aria-hidden="true"></span>
        <span class="cae-mobile-demand-copy"><strong></strong><small></small><em></em></span>`;
      li.querySelector("strong").textContent = t.stages[stage];
      li.querySelector("small").textContent = t.statuses[item.status];
      li.querySelector("em").textContent = item.summary || "";
      list.append(li);
    });
  }

  function rebuildHero() {
    const hero = document.querySelector(".cae-report-hero");
    const state = hero?.querySelector(".cae-report-state");
    if (!hero || !state) return;
    hero.classList.add("cae-mobile-hero");
    const headerKicker = hero.querySelector(".cae-report-header > .cae-kicker");
    if (headerKicker) headerKicker.textContent = `${t.brand} ${t.report}`;
    const stateKicker = state.querySelector(".cae-kicker");
    if (stateKicker) stateKicker.textContent = t.primaryConstraint;

    state.querySelectorAll(".cae-report-note").forEach((node) => node.remove());
    const demand = document.querySelector(".cae-report-demand");
    if (demand && demand.parentElement !== state) {
      const heading = state.querySelector("h2");
      heading?.insertAdjacentElement("afterend", demand);
    }

    const strengths = state.querySelector("ul");
    if (strengths) {
      const card = document.createElement("div");
      card.className = "cae-mobile-hero-card cae-mobile-hero-card--strength";
      const label = document.createElement("span");
      label.textContent = t.strongPoint;
      card.append(label, strengths);
      state.append(card);
    }

    const paragraphs = Array.from(state.querySelectorAll(":scope > p"));
    const start = paragraphs.find((node) => /Start with:|Начать с:|Empezar|Commencez|Почати/i.test(node.textContent || ""));
    if (start) {
      start.className = "cae-mobile-hero-card cae-mobile-hero-card--action";
      const strong = start.querySelector("strong");
      if (strong) strong.textContent = `${t.firstAction}:`;
    }
  }

  function enhanceFocusGaps() {
    const focus = reportData?.humanDiagnosis?.focus_selection;
    const inventory = reportData?.humanDiagnosis?.gap_inventory || [];
    document.querySelectorAll(".cae-focus-gap").forEach((card) => {
      const gapId = (card.id || "").replace(/^gap-/, "");
      const gap = inventory.find((item) => item.id === gapId);
      const isPrimary = gapId && focus?.primary_gap_id === gapId;
      card.classList.toggle("cae-focus-gap--primary", isPrimary);
      card.classList.toggle("cae-focus-gap--supporting", !isPrimary);
      card.dataset.collapsed = isPrimary ? "false" : "true";

      const rank = card.querySelector(".cae-focus-gap__rank");
      if (rank) rank.textContent = isPrimary ? `1 · ${t.primary}` : `${rank.textContent?.trim().charAt(0) || ""} · ${t.supporting}`;

      if (gap) {
        const meta = document.createElement("div");
        meta.className = "cae-mobile-priority-meta";
        const sprint = gap.sprint_fit?.mode === "close_in_30_days" ? t.close30 : gap.sprint_fit?.mode === "start_in_30_days" ? t.start30 : t.later;
        const evidenceCount = Array.isArray(gap.evidence_refs) ? gap.evidence_refs.length : 0;
        [sprint, evidenceCountLabel(evidenceCount)].forEach((label) => {
          const pill = document.createElement("span");
          pill.textContent = label;
          meta.append(pill);
        });
        card.querySelector("h3")?.insertAdjacentElement("afterend", meta);
      }

      if (!isPrimary) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "cae-mobile-card-toggle";
        toggle.textContent = t.openGap;
        toggle.setAttribute("aria-expanded", "false");
        toggle.addEventListener("click", () => {
          const open = card.dataset.collapsed === "true";
          card.dataset.collapsed = open ? "false" : "true";
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          toggle.textContent = open ? t.closeGap : t.openGap;
          track("growth_score_focus_expand", { gap_id: gapId, expanded: open });
        });
        card.append(toggle);
      }
    });
  }

  function rebuildRepairPaths() {
    if (isNetworkParent()) return;
    const section = document.getElementById("repair-paths");
    const wrap = section?.querySelector(":scope > .cae-wrap");
    const diagnosis = reportData?.humanDiagnosis;
    if (!wrap || !diagnosis) return;
    const focusIds = [diagnosis.focus_selection?.primary_gap_id, ...(diagnosis.focus_selection?.supporting_gap_ids || [])].filter(Boolean);
    const selected = focusIds.map((id) => diagnosis.gap_inventory.find((gap) => gap.id === id)).filter(Boolean);

    wrap.replaceChildren();
    const kicker = document.createElement("p");
    kicker.className = "cae-kicker";
    kicker.textContent = t.sectionKickers[3];
    const title = document.createElement("h2");
    title.className = "cae-h2";
    title.textContent = t.sectionTitles[3];
    const intro = document.createElement("p");
    intro.className = "cae-report-intro";
    intro.textContent = t.repairIntro;
    const list = document.createElement("div");
    list.className = "cae-mobile-repair-list";

    selected.forEach((gap, index) => {
      const details = document.createElement("details");
      details.className = "cae-mobile-repair";
      if (index === 0) details.open = true;
      const summary = document.createElement("summary");
      summary.innerHTML = `<span>${index + 1}</span><strong></strong><small></small>`;
      summary.querySelector("strong").textContent = gap.title;
      summary.querySelector("small").textContent = gap.repair_plan?.outcome || "";
      details.append(summary);

      const bodyNode = document.createElement("div");
      bodyNode.className = "cae-mobile-repair__body";
      const appendBlock = (label, value, listMode) => {
        if (value === undefined || value === null || (Array.isArray(value) && !value.length)) return;
        const heading = document.createElement("h3");
        heading.textContent = label;
        bodyNode.append(heading);
        if (listMode) {
          const ol = document.createElement("ol");
          value.forEach((item) => { const li = document.createElement("li"); li.textContent = item; ol.append(li); });
          bodyNode.append(ol);
        } else {
          const p = document.createElement("p");
          p.textContent = Array.isArray(value) ? value.join("; ") : value;
          bodyNode.append(p);
        }
      };
      appendBlock(t.outcome, gap.repair_plan?.outcome, false);
      appendBlock(t.steps, gap.repair_plan?.diy_steps, true);
      appendBlock(t.needs, gap.repair_plan?.dependencies, false);
      appendBlock(t.owner, gap.repair_plan?.owner_role, false);
      appendBlock(t.doneWhen, gap.repair_plan?.done_when, true);
      if (gap.sprint_fit?.mode === "start_in_30_days") {
        appendBlock(t.day30, gap.repair_plan?.day_30_outcome, false);
        appendBlock(t.beyond30, gap.repair_plan?.beyond_day_30, false);
      }
      details.append(bodyNode);
      details.addEventListener("toggle", () => track("growth_score_repair_expand", { gap_id: gap.id, expanded: details.open }));
      list.append(details);
    });

    wrap.append(kicker, title, intro, list);
  }

  function enhanceInventory() {
    const filters = document.querySelector(".cae-report-filters");
    if (filters) {
      const buttons = Array.from(filters.querySelectorAll("[data-filter]"));
      const labels = [t.inventoryAll, t.inventoryNow, t.inventoryLater, t.inventoryMonitor, t.inventoryUnknown];
      buttons.forEach((button, index) => { button.textContent = labels[index] || button.textContent; });
    }

    document.querySelectorAll(".cae-report-problem").forEach((article) => {
      if (article.tagName === "DETAILS") return;
      const details = document.createElement("details");
      details.className = `${article.className} cae-mobile-gap`;
      Object.assign(details.dataset, article.dataset);
      details.id = article.id;
      const title = article.querySelector("h3")?.textContent?.trim() || t.openGap;
      const kicker = article.querySelector(".cae-kicker")?.textContent?.trim() || "";
      const summary = document.createElement("summary");
      summary.innerHTML = `<small></small><strong></strong><span>${t.openGap}</span>`;
      summary.querySelector("small").textContent = kicker;
      summary.querySelector("strong").textContent = title;
      const bodyNode = document.createElement("div");
      bodyNode.className = "cae-mobile-gap__body";
      while (article.firstChild) bodyNode.append(article.firstChild);
      details.append(summary, bodyNode);
      details.addEventListener("toggle", () => {
        summary.querySelector("span").textContent = details.open ? t.closeGap : t.openGap;
        track("growth_score_gap_expand", { gap_id: details.id.replace(/^inventory-/, ""), expanded: details.open });
      });
      article.replaceWith(details);
    });
  }

  function initInventoryFilters() {
    const filterBar = document.querySelector(".cae-report-filters");
    if (!filterBar) return;
    const buttons = Array.from(filterBar.querySelectorAll("[data-filter]"));
    const problems = Array.from(document.querySelectorAll(".cae-report-problem"));
    const matches = (problem, filter) => filter === "all" || (problem.dataset.filterGroup || "") === filter;
    const apply = (filter) => {
      buttons.forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      problems.forEach((problem) => { problem.hidden = !matches(problem, filter); });
      track("growth_score_inventory_filter", { filter });
    };
    buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset.filter || "all")));
    apply("all");
  }

  function enhanceCompetitors() {
    const cards = document.querySelector(".cae-report-competitor-cards");
    if (cards && cards.children.length > 1) {
      const articles = Array.from(cards.children);
      const tabs = document.createElement("div");
      tabs.className = "cae-mobile-competitor-tabs";
      tabs.setAttribute("role", "tablist");
      articles.forEach((article, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "tab");
        button.textContent = article.querySelector("h3")?.textContent?.trim() || `#${index + 1}`;
        const activate = () => {
          articles.forEach((candidate, candidateIndex) => {
            candidate.hidden = candidateIndex !== index;
            candidate.setAttribute("role", "tabpanel");
          });
          tabs.querySelectorAll("button").forEach((candidate, candidateIndex) => {
            candidate.setAttribute("aria-selected", candidateIndex === index ? "true" : "false");
          });
          track("growth_score_competitor_switch", { competitor_index: index + 1 });
        };
        button.addEventListener("click", activate);
        tabs.append(button);
        if (index === 0) activate();
      });
      cards.before(tabs);
    }

    const matrix = document.querySelector(".cae-report-comparison-wrap");
    if (matrix && matrix.parentElement?.tagName !== "DETAILS") {
      const details = document.createElement("details");
      details.className = "cae-mobile-comparison";
      const summary = document.createElement("summary");
      summary.textContent = t.competitorMatrix;
      matrix.replaceWith(details);
      details.append(summary, matrix);
      details.addEventListener("toggle", () => track("growth_score_competitor_matrix", { expanded: details.open }));
    }
  }

  function scoreStatus(score) {
    if (!Number.isFinite(score)) return t.scoreUnknown;
    if (score >= 70) return t.scoreStrong;
    if (score >= 50) return t.scorePartial;
    return t.scoreConstraint;
  }

  function enhanceScores() {
    document.querySelectorAll(".cae-report-surface-card").forEach((card) => {
      const valueNode = card.querySelector("header strong");
      const value = Number.parseFloat(valueNode?.textContent || "");
      const bar = document.createElement("div");
      bar.className = "cae-mobile-score-bar";
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${valueNode?.textContent || t.scoreUnknown}. ${scoreStatus(value)}`);
      const fill = document.createElement("span");
      fill.style.setProperty("--cae-score", Number.isFinite(value) ? String(Math.max(0, Math.min(100, value))) : "0");
      bar.append(fill);
      const status = document.createElement("p");
      status.className = "cae-mobile-score-status";
      status.textContent = scoreStatus(value);
      card.querySelector("header")?.insertAdjacentElement("afterend", bar);
      bar.insertAdjacentElement("afterend", status);
    });

    const methodologyGrid = document.querySelector(".cae-report-method__grid");
    if (methodologyGrid && methodologyGrid.parentElement?.tagName !== "DETAILS") {
      const details = document.createElement("details");
      details.className = "cae-mobile-methodology";
      const summary = document.createElement("summary");
      summary.textContent = t.methodology;
      methodologyGrid.replaceWith(details);
      details.append(summary, methodologyGrid);
      details.addEventListener("toggle", () => track("growth_score_methodology_open", { expanded: details.open }));
    }
  }

  function rebuildNextStep() {
    if (isNetworkParent() || isFocusLocationChild()) return;
    const section = document.getElementById("next-step");
    const wrap = section?.querySelector(":scope > .cae-wrap");
    if (!wrap || !reportData) return;
    wrap.replaceChildren();
    const kicker = document.createElement("p");
    kicker.className = "cae-kicker";
    kicker.textContent = t.sectionKickers[8];
    const title = document.createElement("h2");
    title.className = "cae-h2";
    title.textContent = t.sectionTitles[8];
    const paths = document.createElement("div");
    paths.className = "cae-mobile-paths";
    const pathValues = [
      reportData.implementation_paths?.diy,
      reportData.implementation_paths?.other_provider,
      reportData.implementation_paths?.defer,
      reportData.implementation_paths?.caesthetic,
    ];
    t.pathways.forEach((label, index) => {
      const article = document.createElement("article");
      article.innerHTML = `<span>${index + 1}</span><h3></h3><p></p>`;
      article.querySelector("h3").textContent = label;
      article.querySelector("p").textContent = pathValues[index] || "";
      if (index === 3) article.classList.add("is-caesthetic");
      paths.append(article);
    });

    const burden = reportData.humanDiagnosis?.coordination_burden || {};
    const numeric = Object.entries(burden).filter(([, value]) => Number.isInteger(value));
    const burdenNode = document.createElement("div");
    burdenNode.className = "cae-mobile-burden";
    numeric.forEach(([key, value]) => {
      const item = document.createElement("p");
      item.innerHTML = `<strong>${value}</strong><span></span>`;
      item.querySelector("span").textContent = key.replaceAll("_", " ");
      burdenNode.append(item);
    });

    const offer = document.createElement("article");
    offer.className = "cae-mobile-sprint-offer";
    offer.innerHTML = `<p class="cae-kicker"></p><h3></h3><p class="cae-mobile-sprint-price"></p><p class="cae-mobile-sprint-copy"></p><a class="cae-btn cae-btn--primary" href="/sprint/"></a><small></small>`;
    offer.querySelector(".cae-kicker").textContent = t.whyCaesthetic;
    offer.querySelector("h3").textContent = t.sprintTitle;
    offer.querySelector(".cae-mobile-sprint-price").textContent = t.sprintPrice;
    offer.querySelector(".cae-mobile-sprint-copy").textContent = t.sprintCopy;
    offer.querySelector("a").textContent = t.cta;
    offer.querySelector("small").textContent = t.noCommitment;
    offer.querySelector("a").addEventListener("click", () => track("growth_score_sprint_cta_click", { location: "next-step" }));

    wrap.append(kicker, title, paths);
    if (numeric.length) wrap.append(burdenNode);
    wrap.append(offer);
  }

  function initStickySprint() {
    const sticky = document.querySelector(".cae-sticky-sprint");
    if (isFocusLocationChild()) {
      sticky?.remove();
      return;
    }
    const gate = document.getElementById("sprint-fit");
    if (!sticky || !gate) return;
    sticky.textContent = t.cta;
    sticky.href = "#next-step";
    sticky.hidden = true;
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      sticky.hidden = false;
      body.classList.add("cae-score-report--sticky-sprint");
      requestAnimationFrame(() => sticky.classList.add("is-visible"));
      track("growth_score_sprint_cta_view", { after_section: "sprint-fit" });
    };
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            reveal();
            observer.disconnect();
          }
        });
      }, { threshold: 0 });
      observer.observe(gate);
    } else {
      window.addEventListener("scroll", () => { if (gate.getBoundingClientRect().bottom < 0) reveal(); }, { passive: true });
    }
    sticky.addEventListener("click", () => track("growth_score_sprint_cta_click", { location: "sticky" }));
  }

  function initGapMapLinks() {
    document.querySelectorAll(".cae-gap-map__mark").forEach((link) => {
      link.addEventListener("click", () => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: reducedMotion });
      });
    });
  }

  async function loadReportData() {
    try {
      const response = await fetch(new URL("report.json", window.location.href), { credentials: "same-origin" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  async function boot() {
    injectPresentationStyles();
    removeClientVisibleAttribution();
    reportData = await loadReportData();
    if (reportData) {
      context = {
        report_kind: reportData.reportKind || root.dataset.reportKind || "",
        vertical_context: reportData.reportContext?.vertical_context || "",
        locale: reportData.reportContext?.report_locale || locale,
      };
      root.dataset.verticalContext = context.vertical_context;
      root.dataset.reportLocale = context.locale;
      root.dataset.auditFormat = reportData.audit?.format || "single_location";
      root.dataset.packageRole = reportData.audit?.package_role || "standalone";
    }
    setSectionCopy();
    buildMobileNavigation();
    rebuildDemandJourney();
    rebuildHero();
    enhanceFocusGaps();
    rebuildRepairPaths();
    enhanceInventory();
    initInventoryFilters();
    enhanceCompetitors();
    enhanceScores();
    rebuildNextStep();
    initStickySprint();
    initGapMapLinks();
    track("growth_score_mobile_ui_ready", { ui_version: CLIENT_UI_VERSION });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
