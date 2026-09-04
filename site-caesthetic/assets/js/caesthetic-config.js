/**
 * CAESTHETIC runtime config — US aesthetic growth funnel (Phase 1).
 * Payment provider credentials and provider URLs remain server-side only.
 */
window.CAESTHETIC_API = {
  supabaseFunctions: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1",
  submitScore: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-growth-score",
  payment: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/caesthetic-payment",
  request: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-request",
};

window.CAESTHETIC = {
  ...(window.CAESTHETIC_PRICING || {}),
  brand: "CAESTHETIC",
  domain: "caesthetic.com",
  currency: "USD",
  scoreTurnaround: "",
  contactEmail: "info@caesthetic.com",
  billingEmail: "info@caesthetic.com",
  /* Signed Order -> private CAESTHETIC payment request -> Wise execution rail.
     No reusable Wise/Stripe payment URL is stored in public runtime. */
  approvedSprintPaymentPolicy: "signed_order_then_controlled_payment_request",
  phoneDisplay: "",
  phoneE164: "",
  legalEntity: "OXFORD PROJETS",
  companyAddress: "#100, 600 W 7th St, Los Angeles, California 90017, US",
  analyst: {
    name: "Valerie Petra",
    role: "Growth Analyst",
    linkedin: "https://www.linkedin.com/in/valeriia-petrova-uk/",
    linkedinVerified: true,
    photo: "/assets/img/team/valerie-petra-office-portrait.webp",
  },
  /* Approved GA4 web stream. Meta stays dataLayer-only until separately approved. */
  ga4MeasurementId: "G-PNQB0W9YB2",
  metaPixelId: "",
};

/* Owner-facing accountability layer. The component itself decides which page types qualify. */
(() => {
  const href = "/assets/css/point-of-contact.css";
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  const src = "/assets/js/point-of-contact.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();

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
