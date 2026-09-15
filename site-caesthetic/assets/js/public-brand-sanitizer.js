(() => {
  "use strict";

  const patterns = [
    [/OXFORD\s+PROJETS\s+trading\s+as\s+CAESTHETIC/gi, "CAESTHETIC"],
    [/OXFORD\s+PROJETS/gi, "CAESTHETIC"],
  ];

  function clean(value) {
    return patterns.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
  }

  function sanitize(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const next = clean(root.nodeValue || "");
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = clean(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
    });

    if (root.querySelectorAll) {
      root.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        const next = clean(script.textContent || "");
        if (next !== script.textContent) script.textContent = next;
      });
    }
  }

  sanitize(document);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach(sanitize));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
