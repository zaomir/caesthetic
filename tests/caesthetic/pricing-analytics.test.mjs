import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SITE = resolve(REPO, "site-caesthetic");
const WRAPPER_PATH = resolve(SITE, "assets/js/pricing-analytics.js");
const HAS_WRAPPER = existsSync(WRAPPER_PATH);
const ALLOWED_EVENTS = [
  "pricing_view",
  "pricing_model_toggle",
  "pricing_fixed_cta",
  "pricing_partnership_cta",
  "pricing_contact_cta",
  "pricing_example_expand",
  "pricing_faq_expand",
];

function loadWrapper(withTracker = true) {
  const calls = [];
  const window = {};
  if (withTracker) {
    window.caestheticAnalytics = {
      track(eventName, payload) {
        calls.push({ eventName, payload });
      },
    };
  }
  vm.runInNewContext(readFileSync(WRAPPER_PATH, "utf8"), { window });
  return { api: window.caestheticPricingAnalytics, calls };
}

test("pricing analytics publishes the exact event allowlist", { skip: !HAS_WRAPPER }, () => {
  const source = readFileSync(WRAPPER_PATH, "utf8");
  const declared = [
    ...new Set(
      [...source.matchAll(/["'](pricing_[a-z_]+)["']/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  assert.deepEqual(declared, ALLOWED_EVENTS);

  const { api } = loadWrapper();
  assert.deepEqual(Array.from(api.events), ALLOWED_EVENTS);
  assert.equal(Object.isFrozen(api), true);
});

test("pricing analytics strips revenue, medical data, PII, and form values", { skip: !HAS_WRAPPER }, () => {
  const { api, calls } = loadWrapper();
  const unsafePayload = {
    model: "fixed",
    service_id: "dental",
    placement: "hero",
    locale: "en",
    example_id: "example-1",
    faq_id: "faq-1",
    expanded: true,
    revenue: 40000,
    adjusted_revenue: 40000,
    amount: 2800,
    price: 4000,
    patient_name: "Private Patient",
    diagnosis: "private",
    medical_data: { condition: "private" },
    assessment_form_values: { email: "person@example.com" },
    email: "person@example.com",
    phone: "+44 7361 630001",
    name: "Private Person",
  };

  for (const eventName of ALLOWED_EVENTS) {
    assert.equal(api.track(eventName, unsafePayload), true);
  }
  assert.equal(calls.length, ALLOWED_EVENTS.length);
  for (const call of calls) {
    assert.ok(ALLOWED_EVENTS.includes(call.eventName));
    assert.deepEqual(JSON.parse(JSON.stringify(call.payload)), {
      model: "fixed",
      service_id: "dental",
      placement: "hero",
      locale: "en",
      example_id: "example-1",
      faq_id: "faq-1",
      expanded: true,
    });
  }
});

test("pricing analytics rejects unknown events and PII hidden in allowed fields", { skip: !HAS_WRAPPER }, () => {
  const { api, calls } = loadWrapper();
  assert.equal(api.track("pricing_revenue_entered", { revenue: 10000 }), false);
  assert.equal(calls.length, 0);

  assert.equal(
    api.fixedCta({
      service_id: "person@example.com",
      placement: "+44 7361 630001",
      locale: "en",
    }),
    true,
  );
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].payload)), { locale: "en" });
});

test("pricing analytics safely no-ops before base analytics is available", { skip: !HAS_WRAPPER }, () => {
  const { api } = loadWrapper(false);
  assert.equal(api.view({ locale: "en" }), false);
});

test("pricing pages only reference allowlisted pricing events", (t) => {
  const pagePaths = [
    resolve(SITE, "pricing/index.html"),
    resolve(SITE, "ru/pricing/index.html"),
  ];
  const present = pagePaths.filter(existsSync);
  if (!present.length) {
    t.skip("waiting for Lane B pricing pages");
    return;
  }

  for (const path of present) {
    const source = readFileSync(path, "utf8");
    const events = [
      ...source.matchAll(
        /\bdata-cae-analytics\s*=\s*(?:"(pricing_[a-z_]+)"|'(pricing_[a-z_]+)')/g,
      ),
    ].map((match) => match[1] ?? match[2]);
    for (const eventName of events) {
      assert.ok(
        ALLOWED_EVENTS.includes(eventName),
        `${path} references non-allowlisted event ${eventName}`,
      );
    }

    const baseAnalytics = source.indexOf('/assets/js/analytics.js');
    assert.ok(baseAnalytics >= 0, `${path} must load base analytics`);
    const pricingAnalytics = source.indexOf('/assets/js/pricing-analytics.js');
    if (HAS_WRAPPER) {
      assert.ok(pricingAnalytics >= 0, `${path} must load the available pricing analytics wrapper`);
      assert.ok(baseAnalytics < pricingAnalytics, `${path} must load base analytics before pricing analytics`);
    } else {
      assert.equal(pricingAnalytics, -1, `${path} must not claim an unavailable pricing analytics wrapper`);
    }
  }
});
