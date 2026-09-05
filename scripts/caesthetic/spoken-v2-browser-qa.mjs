import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { ROOT, PARENTS } from "./build-spoken-medspa-v2.mjs";
// Use the same provisioned browser QA runtime as connect4-page-browser-qa.mjs.
const { chromium } = createRequire(
  process.env.CAE_QA_PACKAGE || "/tmp/connect4-qa/package.json",
)("playwright");
const { default: AxeBuilder } = createRequire(
  process.env.CAE_QA_PACKAGE || "/tmp/connect4-qa/package.json",
)("@axe-core/playwright");
const out = process.env.CAE_QA_OUT || "/tmp/spoken-v2-qa";
fs.mkdirSync(out, { recursive: true });
const base = process.env.CAE_QA_BASE || "http://127.0.0.1:8765";
const result = {
  base,
  checked_at: new Date().toISOString(),
  widths: [],
  dialogs: [],
  errors: [],
};
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => result.errors.push(e.message));
  // Production QA must never send a real request or analytics event.
  await page.route("**/*", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 204, body: "" })
      : route.continue(),
  );
  const production = base === "https://caesthetic.com";
  if (!production && !base.startsWith("http://127.0.0.1:"))
    throw new Error("QA targets are local or caesthetic.com only");
  if (production) {
    result.deployed_sha = process.env.CAE_EXPECTED_SHA;
    assert.match(result.deployed_sha || "", /^[a-f0-9]{40}$/);
    const baseline = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "tests/caesthetic/fixtures/spoken-v1-hashes.json"),
      ),
    );
    const files = [
      ...Object.keys(baseline.files).filter(
        (f) => !f.includes(PARENTS.en + "/"),
      ),
      `site-caesthetic/score/${PARENTS.ru}/v2/index.html`,
      "site-caesthetic/assets/css/growth-score-owner-v2.css",
      "site-caesthetic/assets/js/growth-score-owner-v2.js",
    ];
    result.byte_checks = [];
    for (const file of files) {
      const url =
        base +
        "/" +
        file.replace("site-caesthetic/", "").replace(/index\.html$/, "");
      const response = await fetch(url);
      assert.equal(response.status, 200, url);
      if (file.endsWith("index.html"))
        assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
      const hash = createHash("sha256")
        .update(Buffer.from(await response.arrayBuffer()))
        .digest("hex");
      const expected =
        baseline.files[file] ||
        createHash("sha256")
          .update(fs.readFileSync(path.join(ROOT, file)))
          .digest("hex");
      assert.equal(hash, expected, file);
      result.byte_checks.push(file);
    }
    for (const suffix of ["", "v2/"]) {
      const response = await fetch(`${base}/score/${PARENTS.en}/${suffix}`);
      const body = await response.text();
      assert.match(body, /id="score-password"/);
      assert.doesNotMatch(body, /data-layout-contract/);
    }
    result.english_access = "protected";
  }
  for (const locale of production ? ["ru"] : ["ru", "en"]) {
    const response = await page.goto(`${base}/score/${PARENTS[locale]}/v2/`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const reject = page.getByRole("button", {
      name: locale === "ru" ? "Отказаться" : "Reject analytics",
      exact: true,
    });
    if (await reject.isVisible()) await reject.click();
    for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const data = await page.evaluate(() => {
        const width = innerWidth;
        const visible = (el) => el.getClientRects().length > 0;
        const els = [
          ...document.querySelectorAll(
            "main :is(h1,h2,h3,p,a,summary,button,img,article)",
          ),
        ].filter(visible);
        const overflow = els
          .filter(
            (el) =>
              !el.closest(".v2-table-scroll") &&
              (el.getBoundingClientRect().left < -1 ||
                el.getBoundingClientRect().right > width + 1),
          )
          .map((el) => el.outerHTML.slice(0, 120));
        const types = [
          ...new Set(els.map((el) => getComputedStyle(el).fontSize)),
        ];
        const families = [
          ...new Set(els.map((el) => getComputedStyle(el).fontFamily)),
        ];
        const cards = [...document.querySelectorAll(".v2-repairs>details")].map(
          (el) => ({
            top: el.offsetTop,
            height: el.getBoundingClientRect().height,
          }),
        );
        return {
          overflow,
          types,
          families,
          cards,
          rootOverflow: getComputedStyle(document.documentElement).overflow,
          bodyOverflow: getComputedStyle(document.body).overflow,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
      assert.deepEqual(data.overflow, [], `${locale} overflow at ${width}`);
      assert.ok(data.scrollWidth <= width, `Body overflow ${width}`);
      assert.ok(data.types.length <= 3, `Too many text sizes: ${data.types}`);
      assert.ok(data.families.length <= 2, `Too many fonts: ${data.families}`);
      for (const card of data.cards)
        for (const other of data.cards.filter((c) => c.top === card.top))
          assert.ok(
            Math.abs(card.height - other.height) < 1,
            "Repair card heights",
          );
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: path.join(out, `${locale}-${width}-top.png`),
        });
        for (const id of ["focus-gaps", "repair-paths", "next-step"])
          await page.locator("#" + id).screenshot({
            path: path.join(out, `${locale}-${width}-${id}.png`),
          });
      }
      result.widths.push({ locale, width, ...data });
    }
    const axe = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `${locale} accessibility`,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [selector, kind] of [
      ["[data-cae-sprint-inquiry]", "sprint"],
      ["[data-cae-check-inquiry]", "check"],
      ["[data-cae-question]", "question"],
    ]) {
      await page.locator(selector).first().click();
      assert.equal(await page.locator("dialog[open]").count(), 1);
      assert.equal(await page.locator("dialog input").count(), 2);
      const box = await page.locator("dialog[open]").boundingBox();
      assert.ok(
        box.x >= 0 &&
          box.x + box.width <= 390 &&
          box.y >= 0 &&
          box.y + box.height <= 844,
        "Mobile dialog fits viewport",
      );
      result.dialogs.push({
        locale,
        kind,
        title: await page.locator("#cae-request-modal-title").innerText(),
      });
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog[open]").count(), 0);
    }
    await page.locator("#focus-gaps .v2-refs a").first().click();
    await page.waitForFunction(
      () =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.getClientRects().length > 0,
    );
    const missing = await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src),
      );
    assert.deepEqual(missing, []);
  }
  assert.deepEqual(result.errors, []);
  result.status = "PASS";
} catch (error) {
  result.status = "FAIL";
  result.error = error.stack;
  throw error;
} finally {
  fs.writeFileSync(
    path.join(out, "result.json"),
    JSON.stringify(result, null, 2),
  );
  await browser.close();
}
console.log(
  JSON.stringify({
    status: result.status,
    widths: result.widths.length,
    dialogs: result.dialogs.length,
    out,
  }),
);
