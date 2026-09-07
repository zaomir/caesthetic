/**
 * CAESTHETIC runtime config — US aesthetic growth funnel.
 * Payment provider credentials and provider URLs remain server-side only.
 */
window.CAESTHETIC_API = {
  supabaseFunctions: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1",
  submitScore: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/submit-caesthetic-growth-score",
  payment: "https://lwyumrgygbuowndwcsvc.supabase.co/functions/v1/caesthetic-payment",
  productOrder: "/api/v1/caesthetic-product-order",
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
  /* Public paid-product path:
     product page -> three-field electronic Order -> controlled Wise rail ->
     confirmed funds. Provider URLs stay server-side; provider redirect is not
     proof of payment. */
  approvedSprintPaymentPolicy: "product_page_then_electronic_order_then_wise",
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
  ga4MeasurementId: "G-PNQB0W9YB2",
  metaPixelId: "",
};

(() => {
  const src = "/assets/js/product-routing.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();

(() => {
  const src = "/assets/js/point-of-contact.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();

(() => {
  const src = "/assets/js/form-confirmation.js";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
})();

/* Growth Score report commercial routing is renderer-owned for placement and
   evidence semantics. The global paid-product router controls only where
   approved Sprint/Check CTAs navigate after the user clicks them. */

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
