/**
 * CAESTHETIC Growth Score cockpit — inventory filters + sticky Sprint CTA.
 * Vanilla JS; no PII; respects prefers-reduced-motion.
 */
(function initGrowthCockpit() {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SURFACE_FILTERS = new Set(["search", "website", "social", "reputation"]);

  function initInventoryFilters() {
    const filterBar = document.querySelector(".cae-report-filters");
    if (!filterBar) return;

    const buttons = Array.from(filterBar.querySelectorAll("[data-filter]"));
    const problems = Array.from(document.querySelectorAll(".cae-report-problem"));
    if (!buttons.length || !problems.length) return;

    function problemMatchesFilter(problem, filter) {
      if (filter === "all") return true;
      if (filter === "high") {
        const priority = (problem.dataset.priority || "").toLowerCase();
        return priority === "high";
      }
      if (SURFACE_FILTERS.has(filter)) {
        return (problem.dataset.surface || "").toLowerCase() === filter;
      }
      return true;
    }

    function setActiveButton(active) {
      buttons.forEach((button) => {
        const isActive = button.dataset.filter === active;
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        button.classList.toggle("is-active", isActive);
      });
    }

    function applyFilter(filter) {
      const activeFilter = filter || "all";
      let visibleCount = 0;

      problems.forEach((problem) => {
        const show = problemMatchesFilter(problem, activeFilter);
        problem.hidden = !show;
        problem.classList.toggle("is-filtered-out", !show);
        if (show) visibleCount += 1;
      });

      filterBar.dataset.activeFilter = activeFilter;
      filterBar.dataset.visibleCount = String(visibleCount);
      setActiveButton(activeFilter);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        applyFilter(button.dataset.filter || "all");
      });
    });

    applyFilter("all");
  }

  function initStickySprint() {
    const sticky = document.querySelector(".cae-sticky-sprint");
    const diagnosis = document.getElementById("human-diagnosis");
    if (!sticky || !diagnosis) return;

    sticky.hidden = true;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      sticky.hidden = false;
      document.body.classList.add("cae-score-report--sticky-sprint");
      if (!reducedMotion) {
        sticky.classList.add("is-visible");
      }
    };

    if (!("IntersectionObserver" in window)) {
      window.addEventListener(
        "scroll",
        () => {
          const rect = diagnosis.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) reveal();
        },
        { passive: true },
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(diagnosis);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initInventoryFilters();
      initStickySprint();
    });
  } else {
    initInventoryFilters();
    initStickySprint();
  }
})();
