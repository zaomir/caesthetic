/**
 * Growth Score lead flow — Playwright E2E + Instagram in-app browser UA.
 * Serves site-caesthetic locally and intercepts submit API.
 */
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { appendSafeRedirectQuery } from "../../infra/cloudflare/router/src/redirect-query.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteRoot = path.join(root, "site-caesthetic");
const require = createRequire(import.meta.url);

function resolvePlaywright() {
  for (const base of [
    path.join(root, "node_modules/playwright"),
    path.join(root, "services/social-browser-operator/node_modules/playwright"),
  ]) {
    if (!fs.existsSync(path.join(base, "index.mjs"))) continue;
    try {
      require.resolve("playwright", { paths: [base] });
      return base;
    } catch {
      /* next */
    }
  }
  return null;
}

function contentType(filePath) {
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/html; charset=utf-8";
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith("/")) rel += "index.html";
      if (rel === "/index.html" && url.pathname === "/") rel = "/index.html";
      const filePath = path.join(siteRoot, rel.replace(/^\//, ""));
      if (!filePath.startsWith(siteRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(fs.readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

const pwRoot = resolvePlaywright();
const skipReason = pwRoot ? false : "playwright not installed";

async function fillRequiredStages(page, {
  name = "Alex Owner",
  email = "owner@example.com",
  practice = "Sunset Med Spa",
  cityState = "Scottsdale, AZ",
} = {}) {
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.click("[data-cae-contact-continue]");
  await page.waitForSelector('[data-cae-score-stage="2"]:not([hidden])');
  await page.fill('input[name="practice_name"]', practice);
  await page.fill('input[name="city_state"]', cityState);
}

test("E2E submit returns lead_id and preserves UTM on growth-score links", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  const captured = [];
  let submitCount = 0;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      submitCount += 1;
      const body = route.request().postDataJSON();
      captured.push(body);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, lead_id: "00000000-0000-4000-8000-000000000099" }),
      });
    });

    await page.goto(`${baseUrl}/?utm_source=ig&utm_campaign=phase1`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const link = document.querySelector('a[href*="utm_source=ig"]');
      return !!link;
    });
    const growthHref = await page.locator('a[href*="utm_source=ig"]').first().getAttribute("href");
    assert.match(growthHref || "", /utm_source=ig/);
    assert.match(growthHref || "", /utm_campaign=phase1/);

    await page.fill('input[name="practice_name"]', "Sunset Med Spa");
    await page.fill('input[name="city_state"]', "Scottsdale, AZ");
    await page.fill('input[name="name"]', "Alex Owner");
    await page.fill('input[name="email"]', "owner@example.com");
    await page.click('button[type="submit"]');
    await page.waitForSelector(".cae-form-success:not([hidden])");

    assert.equal(submitCount, 1);
    assert.equal(captured[0].practice_name, "Sunset Med Spa");
    assert.equal(captured[0].utm_source, "ig");
    assert.equal(captured[0].utm_campaign, "phase1");
    assert.ok(captured[0].idempotency_key);

    const duplicate = await page.evaluate(async () => {
      const stored = window.sessionStorage.getItem("caesthetic_growth_score_idem");
      const key = stored && stored.startsWith("{") ? JSON.parse(stored).key : stored;
      const payload = {
        practice_name: "Sunset Med Spa",
        city_state: "Scottsdale, AZ",
        name: "Alex Owner",
        email: "owner@example.com",
        intake_version: "caesthetic-growth-score/2.0",
        intake_stage: "required",
        required_submitted_at: new Date().toISOString(),
        source_page: "/",
        source_domain: "caesthetic.com",
        referrer: null,
        idempotency_key: key,
        utm_source: "ig",
        utm_campaign: "phase1",
      };
      const api = window.CAESTHETIC_API.submitScore;
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status, body: await res.json(), key };
    });

    assert.equal(submitCount, 2);
    assert.equal(duplicate.status, 200);
    assert.equal(captured[0].idempotency_key, duplicate.key);
    assert.equal(captured[0].idempotency_key, captured[1].idempotency_key);
  } finally {
    await browser.close();
    server.close();
  }
});

test("delayed API response cannot show early success or schedule a mailto fallback", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  let submitCount = 0;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout.bind(window);
      window.__caeMailtoScheduled = false;
      window.setTimeout = (handler, delay, ...args) => {
        if (typeof handler === "function" && String(handler).includes("mailto:")) {
          window.__caeMailtoScheduled = true;
          return 0;
        }
        return nativeSetTimeout(handler, delay, ...args);
      };
    });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      submitCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, lead_id: "00000000-0000-4000-8000-0000000000bb" }),
      });
    });

    await page.goto(`${baseUrl}/growth-score/`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page, {
      name: "Taylor Owner",
      email: "taylor@example.com",
      practice: "Delayed Response Med Spa",
      cityState: "Miami, FL",
    });
    await page.click("[data-cae-required-submit]");

    await page.waitForTimeout(450);
    assert.equal(submitCount, 1);
    assert.equal(await page.locator(".cae-form-success").isHidden(), true);
    assert.equal(await page.locator("[data-cae-required-submit]").textContent(), "Submitting…");
    assert.equal(await page.evaluate(() => window.__caeMailtoScheduled), false);

    await page.waitForSelector(".cae-form-success:not([hidden])");
    assert.equal(await page.locator("[data-cae-required-submit]").textContent(), "Request received");
    assert.equal(await page.evaluate(() => window.__caeMailtoScheduled), false);
  } finally {
    await browser.close();
    server.close();
  }
});

test("negative success flag, invalid lead_id and API failure keep success hidden and restore retry", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  let submitCount = 0;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      submitCount += 1;
      await route.fulfill({
        status: submitCount < 3 ? 200 : 500,
        contentType: "application/json",
        body: JSON.stringify(
          submitCount === 1
            ? { ok: false, lead_id: "00000000-0000-4000-8000-0000000000cc", error: "not_recorded" }
            : submitCount === 2
              ? { ok: true, lead_id: "not-a-valid-lead-id" }
              : { ok: false, error: "insert_failed" },
        ),
      });
    });

    await page.goto(`${baseUrl}/growth-score/`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page, {
      name: "Morgan Owner",
      email: "morgan@example.com",
      practice: "Retry Med Spa",
      cityState: "Denver, CO",
    });

    await page.click("[data-cae-required-submit]");
    await page.waitForSelector(".cae-form-error:not([hidden])");
    assert.match((await page.locator("[data-cae-required-error]").textContent()) || "", /not_recorded/);
    assert.equal(await page.locator(".cae-form-success").isHidden(), true);
    assert.equal(await page.locator("[data-cae-required-submit]").isEnabled(), true);

    await page.click("[data-cae-required-submit]");
    await page.waitForFunction(() => document.querySelector(".cae-form-error")?.textContent.includes("submit_failed"));
    assert.equal(await page.locator(".cae-form-success").isHidden(), true);
    assert.equal(await page.locator("[data-cae-required-submit]").isEnabled(), true);

    await page.click("[data-cae-required-submit]");
    await page.waitForFunction(() => document.querySelector(".cae-form-error")?.textContent.includes("insert_failed"));
    assert.equal(submitCount, 3);
    assert.equal(await page.locator(".cae-form-success").isHidden(), true);
    assert.equal(await page.locator("[data-cae-required-submit]").isEnabled(), true);
  } finally {
    await browser.close();
    server.close();
  }
});

test("required intake persists before optional enrichment and analytics contain no answers", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  const captured = [];
  const leadId = "00000000-0000-4000-8000-0000000000dd";

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 720 } });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      captured.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, lead_id: leadId }),
      });
    });

    await page.goto(`${baseUrl}/growth-score/`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page, {
      name: "Avery Owner",
      email: "avery@example.com",
      practice: "North Star Aesthetics",
      cityState: "Portland, OR",
    });
    assert.equal(captured.length, 0);

    await page.click("[data-cae-required-submit]");
    await page.waitForSelector('[data-cae-score-stage="3"]:not([hidden])');
    assert.equal(captured.length, 1);
    assert.equal(captured[0].intake_stage, "required");
    assert.equal(captured[0].intake_version, "caesthetic-growth-score/2.0");
    assert.match(captured[0].required_submitted_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal("self_reported" in captured[0], false);
    assert.equal(await page.locator(".cae-form-success").isVisible(), true);

    await page.fill('input[name="website_url"]', "https://northstar.example");
    await page.fill('textarea[name="priority_treatments"]', "Injectables and laser treatments");
    await page.fill('input[name="preferred_contact_phone"]', "Email preferred");
    await page.check('input[name="enquiry_path_permission"]');
    await page.click("[data-cae-optional-save]");
    await page.waitForSelector("[data-cae-optional-complete]:not([hidden])");

    assert.equal(captured.length, 2);
    assert.equal(captured[1].intake_stage, "optional");
    assert.equal(captured[1].lead_id, leadId);
    assert.equal(captured[1].idempotency_key, captured[0].idempotency_key);
    assert.deepEqual(captured[1].self_reported, {
      website_url: "https://northstar.example",
      priority_treatments: "Injectables and laser treatments",
      preferred_contact_phone: "Email preferred",
    });
    assert.equal(captured[1].enquiry_path_permission, true);
    assert.equal(captured[1].enquiry_path_permission_at, captured[1].optional_submitted_at);

    const intakeEvents = await page.evaluate(() =>
      window.dataLayer.filter((item) => item && /^growth_score_(?:intake|contact|required|optional)/.test(item.event || "")),
    );
    assert.deepEqual(
      intakeEvents.map((event) => event.event),
      [
        "growth_score_intake_view",
        "growth_score_contact_continue",
        "growth_score_required_submit_success",
        "growth_score_optional_saved",
      ],
    );
    const eventJson = JSON.stringify(intakeEvents);
    for (const forbidden of [
      "Avery Owner",
      "avery@example.com",
      "North Star Aesthetics",
      "Portland, OR",
      "northstar.example",
      "Injectables and laser treatments",
      leadId,
    ]) {
      assert.equal(eventJson.includes(forbidden), false, `analytics leaked ${forbidden}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test("Skip keeps the required case successful without an optional request", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  let submitCount = 0;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 720 } });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      submitCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, lead_id: "00000000-0000-4000-8000-0000000000ee" }),
      });
    });

    await page.goto(`${baseUrl}/growth-score/`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page);
    await page.click("[data-cae-required-submit]");
    await page.waitForSelector('[data-cae-score-stage="3"]:not([hidden])');
    await page.click("[data-cae-optional-skip]");
    await page.waitForSelector("[data-cae-optional-complete]:not([hidden])");

    assert.equal(submitCount, 1);
    assert.equal(await page.locator(".cae-form-success").isVisible(), true);
    assert.match((await page.locator("[data-cae-optional-complete]").textContent()) || "", /request is complete/i);
  } finally {
    await browser.close();
    server.close();
  }
});

test("optional save failure does not revoke the successful required case", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  let submitCount = 0;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      submitCount += 1;
      await route.fulfill({
        status: submitCount === 1 ? 200 : 500,
        contentType: "application/json",
        body: JSON.stringify(
          submitCount === 1
            ? { ok: true, lead_id: "00000000-0000-4000-8000-0000000000ff" }
            : { ok: false, error: "optional_update_failed" },
        ),
      });
    });

    await page.goto(`${baseUrl}/growth-score/`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page);
    await page.click("[data-cae-required-submit]");
    await page.waitForSelector('[data-cae-score-stage="3"]:not([hidden])');
    await page.fill('textarea[name="main_concern"]', "Booking drop-off");
    await page.click("[data-cae-optional-save]");
    await page.waitForSelector("[data-cae-optional-error]:not([hidden])");

    assert.equal(submitCount, 2);
    assert.equal(await page.locator(".cae-form-success").isVisible(), true);
    assert.equal(await page.locator("[data-cae-optional-skip]").isEnabled(), true);
    await page.click("[data-cae-optional-skip]");
    await page.waitForSelector("[data-cae-optional-complete]:not([hidden])");
    assert.equal(await page.locator(".cae-form-success").isVisible(), true);
  } finally {
    await browser.close();
    server.close();
  }
});

test("Sprint CTA opens a scoped inquiry and never starts checkout", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${baseUrl}/sprint/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-cae-sprint-inquiry-state="request"]');

    const button = page.locator("[data-cae-sprint-inquiry]");
    assert.equal(await button.textContent(), "Request Sprint scope and payment instructions");
    assert.match((await button.getAttribute("href")) || "", /^mailto:info@caesthetic\.com\?/);
    assert.equal(await page.locator("[data-cae-checkout]").count(), 0);

    const events = await page.evaluate(async () => {
      window.__caeSprintEvents = [];
      window.caestheticAnalytics = {
        track: (name, detail) => window.__caeSprintEvents.push({ name, detail }),
      };
      const inquiry = document.querySelector("[data-cae-sprint-inquiry]");
      inquiry.addEventListener("click", (event) => event.preventDefault(), { capture: true });
      inquiry.click();
      await Promise.resolve();
      return window.__caeSprintEvents;
    });
    assert.deepEqual(events, [
      {
        name: "sprint_scope_requested",
        detail: { product: "30_day_growth_sprint", value: 2500, currency: "USD" },
      },
    ]);
  } finally {
    await browser.close();
    server.close();
  }
});

test("Instagram in-app browser UA can submit Growth Score form", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  const igUa =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 312.0.0.0.118 (iPhone14,3; iOS 17_0; en_US; en-US)";

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      userAgent: igUa,
      viewport: { width: 390, height: 844 },
    });
    await page.route("**/submit-caesthetic-growth-score", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, lead_id: "00000000-0000-4000-8000-0000000000aa" }),
      });
    });

    await page.goto(`${baseUrl}/growth-score/?utm_source=instagram`, { waitUntil: "domcontentloaded" });
    await fillRequiredStages(page, {
      name: "Jamie Lee",
      email: "jamie@example.com",
      practice: "Desert Glow Med Spa",
      cityState: "Austin, TX",
    });
    await page.click("[data-cae-required-submit]");
    await page.waitForSelector(".cae-form-success:not([hidden])");
    const success = await page.locator(".cae-form-success").textContent();
    assert.match(success || "", /Request recorded/);
  } finally {
    await browser.close();
    server.close();
  }
});

test("pricing pages consume finite labels and client-specific recurring terms", { skip: skipReason }, async () => {
  const { chromium } = await import(path.join(pwRoot, "index.mjs"));
  const { server, baseUrl } = await startStaticServer();
  const generated = {
    growthScoreUsd: 17,
    growthScoreLabel: "$17",
    sprintPriceUsd: 23,
    sprintPriceLabel: "$23",
    recurringCommercialTerms: "client_specific",
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/assets/js/caesthetic-pricing.generated.js", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: `globalThis.CAESTHETIC_PRICING = Object.freeze(${JSON.stringify(generated)});`,
      });
    });

    await page.goto(`${baseUrl}/pricing/`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-cae-score-price]").textContent(), "$17");
    const sprintPrices = await page.locator("[data-cae-sprint-price]").allTextContents();
    assert.equal(sprintPrices.length, 2);
    assert.deepEqual(sprintPrices, ["$23", "$23"]);
    assert.equal(await page.locator('[data-cae-growth-budget-model="management-inside-budget"]').textContent(), "Client-specific");
    assert.equal(await page.locator("[data-cae-system-base-price]").count(), 0);
    assert.equal(await page.evaluate(() => window.CAESTHETIC.recurringCommercialTerms), "client_specific");
    assert.equal(await page.locator('script[src="/assets/js/analytics.js"]').count(), 1);

    await page.goto(`${baseUrl}/growth-system/`, { waitUntil: "networkidle" });
    assert.equal(
      await page.locator('[data-cae-growth-budget-model="management-inside-budget"]').count(),
      1,
    );
    assert.equal(await page.locator("[data-cae-system-base-price]").count(), 0);
    assert.equal(await page.evaluate(() => window.CAESTHETIC.recurringCommercialTerms), "client_specific");
    assert.equal(await page.locator('script[src="/assets/js/analytics.js"]').count(), 1);
  } finally {
    await browser.close();
    server.close();
  }
});

test("legacy redirect preserves attribution and drops arbitrary sensitive query data", () => {
  const source = new URL(
    "https://caesthetic.com/assessment/?utm_source=instagram&utm_medium=organic_social&utm_campaign=phase1_launch&utm_content=bio&utm_id=ig-launch&diagnosis=private",
  );
  const target = appendSafeRedirectQuery(
    source,
    new URL("/growth-score/", source.origin),
  );

  assert.equal(target.pathname, "/growth-score/");
  assert.equal(target.searchParams.get("utm_source"), "instagram");
  assert.equal(target.searchParams.get("utm_medium"), "organic_social");
  assert.equal(target.searchParams.get("utm_campaign"), "phase1_launch");
  assert.equal(target.searchParams.get("utm_content"), "bio");
  assert.equal(target.searchParams.get("utm_id"), "ig-launch");
  assert.equal(target.searchParams.has("diagnosis"), false);
});
