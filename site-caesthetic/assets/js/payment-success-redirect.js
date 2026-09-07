/** Move a verified paid state from /pay/ to the dedicated post-payment page. */
(function () {
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var token = params.get("token") || "";
  if (!token) return;
  var panel = document.getElementById("thank-you-panel");
  if (!panel) return;
  function redirectIfPaid() {
    if (panel.hidden) return;
    var target = "/payment-success/?token=" + encodeURIComponent(token);
    if (window.location.pathname !== "/payment-success/") window.location.replace(target);
  }
  var observer = new MutationObserver(redirectIfPaid);
  observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  redirectIfPaid();
})();
