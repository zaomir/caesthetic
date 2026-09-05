(() => {
  const ru = document.documentElement.lang === "ru";
  for (const button of document.querySelectorAll("[data-v2-share]"))
    button.addEventListener("click", async () => {
      const url = new URL(location.href);
      url.hash = "";
      url.search = "";
      const status = button.nextElementSibling;
      try {
        if (navigator.share)
          await navigator.share({ title: document.title, url: url.href });
        else {
          await navigator.clipboard.writeText(url.href);
          status.textContent = ru ? "Ссылка скопирована" : "Link copied";
        }
      } catch (error) {
        if (error.name !== "AbortError")
          status.textContent = ru
            ? "Скопируйте адрес страницы из браузера."
            : "Copy the page address from your browser.";
      }
    });
  const reveal = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    let p = target;
    while (p) {
      if (p.tagName === "DETAILS") p.open = true;
      p = p.parentElement;
    }
    target.scrollIntoView({ block: "start" });
  };
  // Shared smooth scrolling does not expand disclosure ancestors. Handle v2 anchors first.
  document.addEventListener(
    "click",
    (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href").slice(1);
      if (!document.getElementById(id)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      history.pushState(null, "", "#" + id);
      reveal();
    },
    true,
  );
  window.addEventListener("hashchange", reveal);
  reveal();
})();
