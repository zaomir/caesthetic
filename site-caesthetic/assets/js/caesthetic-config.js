/**
 * CAESTHETIC runtime config — US aesthetic growth funnel (Phase 1).
 * Payment provider credentials and provider URLs remain server-side only.
 */
window.CAESTHETIC_API = {
  supabaseFunctions: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1",
  submitScore: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-growth-score",
  payment: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/caesthetic-payment",
  request: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-growth-score",
};

window.CAESTHETIC = {
  ...(window.CAESTHETIC_PRICING || {}),
  brand: "CAESTHETIC",
  domain: "caesthetic.com",
  currency: "USD",
  scoreTurnaround: "",
  contactEmail: "info@caesthetic.com",
  billingEmail: "info@caesthetic.com",
  /* Signed Order -> private CAESTHETIC payment request -> configured provider.
     Stripe ACH is the recommended US-bank route and Wise is the alternative.
     No reusable Stripe/Wise checkout URL is stored in public runtime. */
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
  const src = "/assets/js/point-of-contact.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();

/* Growth Score report commercial routing is renderer-owned.
   Do not auto-load /assets/js/growth-report-funnel.js: each eligible report owns
   two always-visible Check sections plus at most one evidence-backed Sprint CTA;
   Multi-Location focus children return to the parent decision instead. */

/* Localized Beauty Salon shells use a separate footer/copy surface. */
(() => {
  const salonPrefixes = [
    "/beauty-salons",
    "/es/salones-de-belleza",
    "/ru/salony-krasoty",
    "/fr/salons-de-beaute",
  ];
  const isSalonRoute = salonPrefixes.some((prefix) =>
    location.pathname === prefix ||
    location.pathname === `${prefix}/` ||
    location.pathname.startsWith(`${prefix}/`)
  );
  if (!isSalonRoute) return;
  const src = "/assets/js/salon-funnel-copy.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();
