// Versioned presentation module, invoked only by the canonical Growth Score renderer.
// Frozen case data and decisions are read-only; qualifications live in presentation copy.
export const OWNER_V2 = "owner-decision-report/2.0.0";
const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export function ownerV2Document(report, result) {
  if (
    report.audit?.project_id !== "spoken-medspa-snellville-2026" ||
    report.reportState !== "approved_report" ||
    !["ru", "en"].includes(report.reportContext.report_locale)
  )
    throw new Error(
      "Owner v2 is limited to the approved Spoken case and its RU/EN presentation.",
    );
  const ru = report.reportContext.report_locale === "ru";
  const t = (r, e) => (ru ? r : e);
  const d = report.humanDiagnosis,
    c = report.presentation.owner_copy;
  const ids = [
    d.focus_selection.primary_gap_id,
    ...d.focus_selection.supporting_gap_ids,
  ];
  const selected = ids.map((id) => d.gap_inventory.find((g) => g.id === id));
  const surfaces = [
    ["search", t("Поиск и Google Maps", "Search & Maps")],
    ["website", t("Сайт", "Website")],
    ["social", t("Социальные сети", "Social")],
    ["reputation", t("Отзывы и репутация", "Reviews & Reputation")],
  ];
  const unknown = t("Недостаточно данных", "Needs verification");
  const list = (items) =>
    `<ul>${(items || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const links = (sources) =>
    [...new Set(sources)]
      .filter((s) => /^https?:\/\//.test(s))
      .map(
        (s, i) =>
          `<a href="${esc(s)}" target="_blank" rel="noopener noreferrer">${esc(t("Источник", "Source"))} ${i + 1} · ${esc(new URL(s).hostname)}</a>`,
      )
      .join(" ");
  const metrics = new Map([
    ...report.surfaces.flatMap((s) =>
      s.metrics.map((m) => [`${s.id}.${m.metric_id}`, m]),
    ),
    ...report.crossSurface.metrics.map((m) => [`cross.${m.metric_id}`, m]),
  ]);
  const refLinks = (refs) =>
    `<p class="v2-refs">${(refs || []).map((ref) => `<a href="#metric-${esc(ref)}">${esc(metrics.get(ref)?.label || ref)}</a>`).join(" · ")}</p>`;
  const section = (id, n, title, body) =>
    `<section id="${id}" data-cockpit-order="${n}" class="v2-section"><p class="v2-meta">${String(n).padStart(2, "0")}</p><h2>${esc(title)}</h2>${body}</section>`;
  const disclosure = (title, body, attrs = "") =>
    `<details ${attrs}><summary>${esc(title)}</summary><div class="v2-details-body">${body}</div></details>`;
  const share = (where) =>
    `<div class="v2-share"><button type="button" data-v2-share="${where}">${t("Поделиться отчётом", "Share report")}</button><span role="status" aria-live="polite"></span></div>`;
  const qualifier = t(
    "Вывод основан на публичных материалах. Внутренний план клиники не проверялся; его отсутствие не установлено.",
    "This conclusion is limited to public materials. The practice’s internal plan was not assessed; its absence has not been established.",
  );
  const problemTitles = ru
    ? [
        "Связь точных запросов между каналами не подтверждена",
        "Регулярная связь блога с четырьмя каналами не подтверждена",
        "Сильные отзывы требуют последовательной поддержки",
      ]
    : [
        "Cross-surface query alignment is not established",
        "An ongoing four-surface blog plan is not established",
        "Strong reviews need consistent support",
      ];
  const consequences = ru
    ? [
        "Пациенту может быть труднее узнать ту же услугу при переходе между каналами.",
        "Полезные статьи могут не поддерживать один понятный путь к услуге и записи.",
        "Общие ответы и повторяющиеся жалобы могут ослаблять доверие.",
      ]
    : [
        "Patients may find it harder to recognize the same service across channels.",
        "Useful articles may not support one clear route to a service and booking.",
        "Generic replies and recurring complaints may weaken trust.",
      ];
  const repair = (g) =>
    `<h3>${t("Результат работы", "Deliverable")}</h3><p>${esc(g.repair_plan.outcome)}</p><h3>${t("Шаги", "Steps")}</h3><ol>${g.repair_plan.diy_steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><h3>${t("Зависимости", "Dependencies")}</h3>${list(g.repair_plan.dependencies)}<h3>${t("Ответственный", "Accountable role")}</h3><p>${esc(g.repair_plan.owner_role)}</p><h3>${t("Как принять работу", "Acceptance evidence")}</h3>${list(g.repair_plan.done_when)}${g.repair_plan.day_30_outcome ? `<p>${esc(g.repair_plan.day_30_outcome)}</p>` : ""}${g.repair_plan.beyond_day_30 ? `<p>${esc(g.repair_plan.beyond_day_30)}</p>` : ""}`;
  const check = (placement) =>
    `<article class="v2-check v2-check--${placement}" data-cae-check-placement="${placement}" data-check500-contract="check500-two-placement/1.0.0" data-check500-style-contract="check500-style/1.0.0"><h2>${esc(c.check500.title)}</h2><p class="v2-product">${esc(c.check500.product_line)}</p><p>${esc(c.check500.body)}</p><a class="cae-btn cae-btn--primary" href="/lead-to-revenue-check/" data-cae-check-inquiry>${esc(c.check500.cta)}</a><p class="v2-meta">${esc(c.check500.fine_print)}</p><p class="v2-meta">${esc(c.check500.boundary)}</p><p class="v2-meta">${t("Можно выбрать отдельно; проверка не обязательна перед спринтом.", "Available separately; this check is not required before the Sprint.")}</p></article>`;
  const snapshots = `<div class="v2-grid v2-surfaces">${surfaces
    .map(([id, label]) => {
      const ms = report.surfaces.find((s) => s.id === id).metrics;
      const count = ms.filter(
        (m) => m.reviewer_status === "approved" && m.finding && m.source,
      ).length;
      return `<article data-surface="${id}"><h3>${esc(label)}</h3><p class="v2-state">${result.surfaces[id].sufficient ? esc(t("Оценка доступна", "Score available")) : unknown}</p><p>${t("Подтверждённых наблюдений", "Approved observations")}: ${count}. ${t("Полнота оценки раскрыта ниже.", "Scoring coverage is disclosed below.")}</p><a href="#evidence-${id}">${t("Посмотреть основания", "View supporting sources")}</a></article>`;
    })
    .join("")}</div>`;
  const matrix = `<div class="v2-note" id="consistency-matrix"><h3>${t("Матрица соответствия · 10 фраз × 4 поверхности", "Consistency Matrix · 10 queries × 4 surfaces")}</h3><p>${t("В этой версии кейса нет утверждённого набора из 10 фраз и проверки каждой фразы по четырём поверхностям. Матрица результатов не заполнена.", "This case version has no approved set of 10 queries and no query-by-query assessment across the four surfaces. No results matrix has been populated.")}</p><p>${t("Чтобы её составить, потребуется отдельно согласованное публичное исследование. Недоступность данных не означает отсутствия фразы.", "Completing it requires separately aligned public research. Unavailable data does not mean a query is absent.")}</p><a href="#evidence-cross">${t("Что уже известно о соответствии", "Existing cross-surface observations")}</a></div>`;
  const status = (g) =>
    g.diagnosis_state === "insufficient_evidence"
      ? unknown
      : g.diagnosis_state === "monitor"
        ? t("Наблюдать", "Monitor")
        : t("Подтверждённый приоритет", "Verified priority");
  const metricBlock = (id, label, ms) =>
    disclosure(
      label,
      ms
        .map(
          (m) =>
            `<article id="metric-${id}.${esc(m.metric_id)}" class="v2-metric"><h3>${esc(m.label)}</h3><p class="v2-meta">${m.reviewer_status === "approved" && m.finding && m.source ? `${t("Проверено", "Reviewed")} · ${esc(m.collected_at)} · ${t("Класс", "Class")} ${esc(m.evidence_class)}` : unknown}</p><p>${esc(m.reviewer_status === "approved" && m.finding && m.source ? m.finding : m.unavailable_reason || unknown)}</p>${links((m.source || "").split(";").map((s) => s.trim()))}${m.assumptions ? `<p>${esc(m.assumptions)}</p>` : ""}</article>`,
        )
        .join(""),
      `id="evidence-${id}"`,
    );
  const comp = d.competitors;
  const competition = disclosure(
    t(
      "Сравнение с четырьмя местными альтернативами",
      "Comparison with four local alternatives",
    ),
    `<p>${esc(comp.selection_method)}</p><p class="v2-meta">${esc(comp.comparison_window.start)} — ${esc(comp.comparison_window.end)}</p><p>${esc(comp.sample_limitations)}</p><p>${t("В таблице сохранены наблюдения и рекомендации исходного отчёта. Рекомендации не доказывают отсутствие внутренних процессов.", "The table retains observations and recommendations from the original report. Recommendations do not establish the absence of internal processes.")}</p><div class="v2-table-scroll" role="region" tabindex="0" aria-label="${t("Сравнение по четырём поверхностям", "Four-surface comparison")}"><table><caption>${t("Сравнение по четырём поверхностям", "Four-surface comparison")}</caption><thead><tr><th>${t("Клиника", "Practice")}</th>${surfaces.map(([, l]) => `<th>${esc(l)}</th>`).join("")}</tr></thead><tbody>${comp.comparison_matrix.rows.map((row) => `<tr><th scope="row">${esc(row.entity_name)}</th>${surfaces.map(([id]) => `<td>${esc(row[id])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${comp.entries.map((e) => disclosure(e.name, `<h3>${t("Почему включена", "Why included")}</h3><p>${esc(e.selection_reason)}</p><h3>${t("Почему пациент может выбрать её", "Why a patient may choose it")}</h3><p>${esc(e.patient_choice_reason)}</p><h3>${t("Сильные стороны", "Strengths")}</h3>${list(e.strengths)}<h3>${t("Риски и ограничения", "Risks and limitations")}</h3>${list(e.weaknesses_or_risks)}<p>${esc(e.limitations)}</p>${links(e.sources.map((s) => s.url_or_snapshot))}`)).join("")}`,
  );
  const decisionSummary = `<div class="v2-grid">${[
    ["defend", t("Сохранить", "Defend")],
    ["close", t("Исправить", "Close")],
    ["differentiate", t("Выделить", "Differentiate")],
    ["do_not_copy", t("Не копировать", "Do not copy")],
  ]
    .map(
      ([key, label]) =>
        `<article><h3>${label}</h3>${comp.decision_summary[key].map((x) => `<p><strong>${esc(x.title)}</strong></p><p>${esc(x.rationale)}</p>`).join("")}</article>`,
    )
    .join("")}</div>`;
  const methodIntro = `<section class="v2-section" id="report-intro" data-report-intro><p class="v2-meta">${t("Как пользоваться отчётом", "How to use this report")}</p><h2>${t("От решения — к основаниям и плану", "From a decision to its sources and plan")}</h2><p>${t("Сначала прочитайте главное ограничение и три приоритета. Затем — что можно сделать за 30 дней, что пока не финансировать и кто возьмёт работу. Подробные источники раскрываются ниже.", "Start with the main constraint and three priorities. Then consider the 30-day scope, what not to fund yet and who will own implementation. Detailed sources are available below.")}</p><div id="method-intro" class="v2-method"><h3>${t("Как работает Connect4", "How Connect4 works")}</h3><p>${t("Мы сопоставляем язык услуг и путь к записи в поиске, на сайте, в социальных сетях и отзывах. Для нового исследования выбирается один набор из 10 фраз; точные и смысловые совпадения, противоречия и непроверенное показываются раздельно.", "We compare service language and the route to booking across search, the website, social and reviews. A new study uses one set of 10 queries, distinguishing exact and semantic matches, contradictions and unavailable evidence.")}</p><ol class="v2-four">${surfaces.map(([, label]) => `<li>${esc(label)}</li>`).join("")}</ol><p class="v2-meta">${t("Блог относится к сайту. Ответы владельца — к репутации. Обработка обращения начинается за пределами этих четырёх поверхностей.", "The blog belongs to Website. Owner replies belong to Reputation. Inquiry handling begins beyond these four surfaces.")}</p></div></section>`;
  const sections = [
    section(
      "gap-map",
      1,
      t(
        "Четыре поверхности и границы проверки",
        "Four surfaces and assessment boundaries",
      ),
      `${snapshots}${matrix}<h3>Where Clients Are Gained - and Lost</h3><figure class="v2-hero-image"><img src="/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png" width="6912" height="3456" alt="Where Clients Are Gained - and Lost" loading="lazy"></figure><p class="v2-meta">${t("Общая схема объясняет метод. Она не является измеренной картой маршрутов Spoken.", "This general illustration explains the method; it is not a measured map of Spoken’s routes.")}</p>${disclosure(t("Связи, услуги, специалисты и путь пациента", "Connections, treatments, providers and patient friction"), `<p>${t("Маршруты между поверхностями, карты услуг и специалистов, цепочки доверия и трение по этапам в этом кейсе не оценены. Пустой набор наблюдений не означает исправный или сломанный путь.", "Cross-surface routes, treatment and provider maps, trust chains and journey friction are not assessed in this case. An empty observation set indicates neither a working nor a broken journey.")}</p>`)}`,
    ),
    section(
      "focus-gaps",
      2,
      t("Три приоритета", "Three priorities"),
      `<p>${qualifier}</p><div class="v2-focus">${selected
        .map((g, i) =>
          disclosure(
            `${i + 1}. ${problemTitles[i]}. ${consequences[i]}`,
            `<p><strong>${t("Возможное последствие", "Potential consequence")}:</strong> ${consequences[i]}</p><h3>${t("Что подтверждено источниками", "What the sources establish")}</h3>${list(
              g.evidence_refs
                .map((ref) => metrics.get(ref))
                .filter((m) => m?.reviewer_status === "approved" && m.finding)
                .map((m) => m.finding),
            )}${refLinks(g.evidence_refs)}<p><strong>${t("Результат работы", "Deliverable")}:</strong> ${esc(g.repair_plan.outcome)}</p><a href="#repair-${esc(g.id)}">${t("Полная инструкция", "Full repair plan")}</a>`,
            `data-gap-id="${g.id}" data-gap-role="${i === 0 ? "primary" : "supporting"}" ${i === 0 ? "open" : ""}`,
          ),
        )
        .join("")}</div>`,
    ),
    section(
      "sprint-fit",
      3,
      t("Что реально сделать за 30 дней", "What is feasible in 30 days"),
      `<p>${t("Это план внедрения утверждённых приоритетов. Объём и зависимости согласуются письменно до начала; календарь не означает уже купленную работу.", "This is an implementation plan for the approved priorities. Scope and dependencies are agreed in writing before work starts; this calendar is not purchased scope.")}</p><div class="v2-grid">${selected.map((g) => `<article><h3>${esc(g.title)}</h3><p>${esc(g.repair_plan.day_30_outcome || g.repair_plan.outcome)}</p><p class="v2-meta">${g.sprint_fit.mode === "start_in_30_days" ? t("Начать за 30 дней; продолжение согласуется отдельно.", "Start within 30 days; further work is agreed separately.") : t("Цель — завершить согласованный объём за 30 дней.", "Target: complete the agreed scope within 30 days.")}</p></article>`).join("")}</div><h3>${t("После обращения: отдельная граница", "After the inquiry: a separate boundary")}</h3><p>${t("Ответ, запись, визит и оплата не проверялись по внутренним данным. Причины потерь и результат работы команды не установлены.", "Response, booking, attendance and payment have not been assessed with internal data. Internal loss causes and team performance are not established.")}</p><figure><img src="${esc(c.internal_boundary.asset_src)}" width="1600" height="900" loading="lazy" alt="${esc(c.internal_boundary.asset_alt)}"></figure>${check("mid")}`,
    ),
    section(
      "repair-paths",
      4,
      t("Пошаговые инструкции", "Complete repair plans"),
      `<p>${t("План можно выполнить своей командой или передать специалистам.", "Your team or another provider can implement these plans.")}</p><div class="v2-grid v2-repairs">${selected.map((g) => disclosure(g.title, repair(g), `id="repair-${g.id}"`)).join("")}</div>`,
    ),
    section(
      "do-not-fund",
      5,
      t("Пока не финансировать", "Do not fund yet"),
      `<div class="v2-stop"><h3>${esc(d.do_not_do.title)}</h3><p>${t("Сохранённое решение: сначала выполнить и проверить выбранные приоритеты. Недостаток публичных данных сам по себе не доказывает потери рекламного бюджета.", "Retained decision: implement and verify the selected priorities first. Limited public evidence alone does not establish wasted advertising spend.")}</p>${refLinks(d.do_not_do.evidence_refs)}<h3>${t("Когда пересмотреть решение", "Revisit conditions")}</h3>${list(d.do_not_do.revisit_after)}</div><p class="v2-meta">${t("Отдельная оценка запрета продвижения каждой услуги не выполнена. Это не разрешение на масштабирование.", "Treatment-specific promotion holds have not been assessed. This is not clearance to scale.")}</p>`,
    ),
    section(
      "gap-inventory",
      6,
      t("Полный реестр: 7 пунктов", "Complete inventory: 7 items"),
      `<p>${t("Приоритеты, наблюдение и недостаток данных разделены. Неоценённое не получает нулевую оценку.", "Priorities, monitoring and missing evidence remain distinct. Unassessed does not mean zero.")}</p>${d.gap_inventory.map((g) => disclosure(`${g.id} · ${status(g)} · ${g.title}`, `<p>${ids.includes(g.id) ? qualifier : esc(g.why_it_matters)}</p>${refLinks(g.evidence_refs)}${repair(g)}`, `data-inventory-gap="${g.id}"`)).join("")}`,
    ),
    section(
      "evidence-and-competitors",
      7,
      t("Источники и конкуренты", "Sources and competitors"),
      `${decisionSummary}${competition}<h3>${t("Проверенные наблюдения и пробелы", "Reviewed observations and evidence gaps")}</h3>${surfaces.map(([id, l]) => metricBlock(id, l, report.surfaces.find((s) => s.id === id).metrics)).join("")}${metricBlock("cross", t("Соответствие между поверхностями", "Cross-surface consistency"), report.crossSurface.metrics)}`,
    ),
    section(
      "scores-and-methodology",
      8,
      t("Оценки и методология", "Scores and methodology"),
      `<p>${t("Баллы — вторичная навигация. Веса: поиск 30%, сайт 25%, социальные сети 15%, репутация 30%. Соответствие оценивается отдельно.", "Scores are secondary navigation. Weights: Search 30%, Website 25%, Social 15%, Reputation 30%. Consistency is assessed separately.")}</p><div class="v2-grid">${surfaces.map(([id, l]) => `<article><h3>${esc(l)}</h3><p>${result.surfaces[id].sufficient ? esc(result.surfaces[id].rawScore) : unknown}</p><p class="v2-meta">${t("Покрытие для расчёта", "Scoring coverage")}: ${Math.round(result.surfaces[id].coverage * 100)}%</p></article>`).join("")}</div><p><strong>${t("Общая оценка", "Overall")}:</strong> ${result.overall.status === "insufficient_evidence" ? unknown : esc(result.overall.score)}</p><p class="v2-meta">${t("Дата исходного исследования", "Original research date")}: ${esc(report.methodology.collectedAt)}</p><p>${esc(report.methodology.limitations)}</p><p>${t("Класс A — проверенное наблюдение. Класс B — вывод или оценка с методом и допущениями. Внедрено, используется и доказало влияние — разные состояния. Измеренный эффект этого плана пока не установлен.", "Class A means a reviewed observation. Class B means an inference or estimate with method and assumptions. Shipped, adopted and impact verified are different states. The measured impact of this plan is not yet established.")}</p>`,
    ),
    section(
      "next-step",
      9,
      t("Выберите способ внедрения", "Choose an implementation path"),
      `<p>${t("Connect4 связывает работу над запросами, контентом и репутацией. Вы сохраняете отчёт и инструкции при любом выборе.", "Connect4 coordinates query, content and reputation work. You keep the report and instructions whichever path you choose.")}</p><div class="v2-grid v2-paths">${c.implementation_options.map((o, i) => `<article><h3>${esc(o.title)}</h3><p>${i === 2 ? t("Передать согласованную работу по четырём поверхностям CAESTHETIC.", "Ask CAESTHETIC to implement the agreed four-surface scope.") : esc(o.body)}</p><p>${esc(o.coordination)}</p></article>`).join("")}<article><h3>${t("Отложить", "Defer")}</h3><p>${t("Не начинать платную работу сейчас. Сохранить план и вернуться к нему после уточнения приоритетов, доступов и ресурсов.", "Do not begin paid work now. Keep the plan and revisit after priorities, access and resources are clear.")}</p></article></div><article class="v2-sprint"><p class="v2-meta">${t("Основной вариант CAESTHETIC", "Primary CAESTHETIC option")}</p><h2>30-Day Growth Sprint · $2,500</h2><p>${esc(c.sprint_offer.body)}</p>${list(c.sprint_offer.items)}<p>${esc(c.sprint_offer.client_input)}</p><p>${esc(c.sprint_offer.boundary)}</p><a class="cae-btn cae-btn--primary" href="/sprint/" data-cae-sprint-inquiry>${esc(c.sprint_offer.cta)}</a></article>${check("final")}<p>${t("После 30-го дня можно продолжить самостоятельно, остановиться или отдельно согласовать следующий этап. Growth System — необязательное дальнейшее сопровождение на индивидуальных условиях.", "After Day 30 you can continue independently, stop or separately agree the next stage. Growth System is optional ongoing ownership under client-specific terms.")}</p><button type="button" data-cae-question data-cae-intent="growth_score_report_question">${t("Задать вопрос", "Ask a question")}</button>${share("end")}`,
    ),
  ];
  return `<!doctype html><html lang="${ru ? "ru" : "en-US"}" data-page="growth-score-report" data-report-kind="real" data-layout-contract="${OWNER_V2}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>Spoken Med Spa · Growth Score v2</title><link rel="stylesheet" href="/assets/css/caesthetic.css"><link rel="stylesheet" href="/assets/css/growth-score-owner-v2.css"><link rel="icon" href="/assets/brand/logo-square.png"><link rel="stylesheet" href="/assets/css/point-of-contact.css">
<link rel="stylesheet" href="/assets/css/caesthetic-impeccable.css">
</head><body class="cae-score-v2"><a class="v2-skip" href="#report-overview">${t("К отчёту", "Skip to report")}</a><header class="v2-bar"><a href="/">CAESTHETIC</a><span>Spoken Med Spa · v2</span><a href="../">${t("Версия 1", "Version 1")}</a><a href="#report-navigation">${t("Разделы", "Contents")}</a></header><main class="v2-wrap"><section id="report-overview" class="v2-overview"><p class="v2-meta">Growth Score · v2 · ${esc(report.practice.preparedAt)}</p><h1>Spoken Med Spa</h1><p class="v2-meta">${esc(report.practice.location)}</p><p class="v2-meta">${esc(report.disclosure)}</p>${share("start")}<section class="v2-welcome" aria-labelledby="welcome-title"><h2 id="welcome-title">${t("Приветствие и изученные ссылки", "Welcome and studied links")}</h2><div class="v2-details-body"><p>${t("Здравствуйте, Ivy. В отчёте — выбранные приоритеты, их основания и план работы.", "Hello Ivy. This report presents the selected priorities, their supporting sources and the implementation plan.")}</p><p class="v2-signature">${t("Валерия Петра", "Valerie Petra")} · CAESTHETIC</p><p class="v2-meta">${t("Изученные ссылки", "Studied links")}</p>${c.research_scope.links.map(([l, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(new URL(u).hostname === "msha.ke" ? t("Страница ссылок", "Link-in-bio page") : l)}</a>`).join(" · ")}</div></section></section>${methodIntro}<nav id="report-navigation" aria-label="${t("Разделы отчёта", "Report contents")}">${sections
    .map((s, i) => {
      const id = s.match(/id="([^"]+)"/)[1];
      const title = s.match(/<h2>(.*?)<\/h2>/)[1];
      return `<a href="#${id}">${i + 1}. ${title}</a>`;
    })
    .join(
      "",
    )}</nav>${sections.join("")}</main><footer class="v2-wrap"><p class="v2-meta">CAESTHETIC · ${t("Версия представления 2. Исходное исследование сохранено.", "Presentation version 2. Original research retained.")}</p></footer><script src="/assets/js/caesthetic-config.js"></script><script src="/assets/js/caesthetic.js" defer></script><script src="/assets/js/growth-score-owner-v2.js" defer></script></body></html>`;
}
