/**
 * CAESTHETIC runtime config — US aesthetic growth funnel (Phase 1).
 * Set measurement and checkout IDs in deploy secrets / host override before go-live ads.
 */
window.CAESTHETIC_API = {
  supabaseFunctions: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1",
  submitScore: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-growth-score",
};

window.CAESTHETIC = {
  ...(window.CAESTHETIC_PRICING || {}),
  brand: "CAESTHETIC",
  domain: "caesthetic.com",
  currency: "USD",
  scoreTurnaround: "",
  contactEmail: "info@caesthetic.com",
  phoneDisplay: "",
  phoneE164: "",
  legalEntity: "OXFORD PROJECTS LTD",
  analyst: {
    name: "Valerie Petra",
    role: "Growth Analyst",
    linkedin: "",
    photo: "/assets/img/team/valerie-petra.svg",
  },
  /* Set before Meta/Google ads. Empty = dataLayer only. */
  ga4MeasurementId: "",
  metaPixelId: "",
};

/* Global Impeccable execution layer */
(() => {
  const href = "/assets/css/caesthetic-impeccable.css";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
})();
