/* Progressive enhancement. The client report and navigation remain readable without JS. */
(() => {
  "use strict";
  if (document.documentElement.dataset.layoutContract !== "owner-decision-report/3.2.0") return;
  const ru = document.documentElement.lang === "ru";
  const targetFromHash = () => {
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return null; }
  };
  function revealTarget({ focus = true } = {}) {
    const target = targetFromHash();
    if (!target) return;
    for (let p = target; p; p = p.parentElement) if (p.tagName === "DETAILS") p.open = true;
    if (focus) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    const align = () => {
      if (targetFromHash() !== target) return;
      const top = target.getBoundingClientRect().top + scrollY - (document.querySelector(".v3-bar")?.offsetHeight || 0) - 24;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    };
    align();
    // Firefox can apply native disclosure/scroll anchoring after the first layout.
    // Re-align the same navigation target after that layout has settled.
    requestAnimationFrame(() => requestAnimationFrame(align));
  }
  document.addEventListener("click", event => {
    const a = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!a || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(a.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    history.pushState(null, "", a.hash); revealTarget();
  }, true);
  window.addEventListener("hashchange", () => revealTarget());
  window.addEventListener("popstate", () => revealTarget());
  for (const button of document.querySelectorAll("[data-v3-share]")) {
    button.addEventListener("click", async () => {
      if (button.disabled) return;
      const url = new URL(location.href); url.hash = ""; url.search = "";
      const status = button.parentElement.querySelector('[role="status"]');
      button.disabled = true; status.textContent = "";
      try {
        const data = { title: document.title, url: url.href };
        if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) await navigator.share(data);
        else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url.href);
        else throw new Error("Sharing unavailable");
        status.textContent = ru ? "Готово. Ссылка на версию v3." : "Done. Link to version 3.";
      } catch (e) {
        if (e.name !== "AbortError") status.textContent = ru ? "Скопируйте адрес страницы из браузера." : "Copy the page address from your browser.";
      } finally { button.disabled = false; }
    });
  }
  const sections = [...document.querySelectorAll("[data-cockpit-order]")];
  let pending = false;
  function markCurrent() {
    pending = false;
    const line = (document.querySelector(".v3-bar")?.offsetHeight || 0) + 48;
    let active = null;
    for (const section of sections) if (section.getBoundingClientRect().top <= line) active = section;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = sections.at(-1);
    for (const a of document.querySelectorAll("#report-navigation nav a")) {
      if (active && a.hash === `#${active.id}`) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    }
  }
  window.addEventListener("scroll", () => { if (!pending) { pending = true; requestAnimationFrame(markCurrent); } }, { passive: true });
  window.addEventListener("resize", markCurrent);
  revealTarget({ focus: false }); markCurrent();
  document.documentElement.dataset.v3Ready = "true";
})();
