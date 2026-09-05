import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { ROOT, CONTRACT, sha, identity } from "./design-contract.mjs";
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, CONTRACT)));
const out = process.env.CAE_DESIGN_OUTPUT || "/tmp/caesthetic-design-browser";
fs.mkdirSync(out, { recursive: true });
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
};
const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (p === "/__design-kit/") {
    res.setHeader("Content-Type", "text/html");
    res.end(
      fs.readFileSync(
        path.join(ROOT, "tests/caesthetic/fixtures/design-system.html"),
      ),
    );
    return;
  }
  let f = path.resolve(ROOT, "site-caesthetic", "." + p);
  if (
    !f.startsWith(path.join(ROOT, "site-caesthetic") + path.sep) &&
    f !== path.join(ROOT, "site-caesthetic")
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    if (fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    res.setHeader(
      "Content-Type",
      types[path.extname(f)] || "application/octet-stream",
    );
    res.end(fs.readFileSync(f));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base =
  process.env.CAE_DESIGN_BASE || `http://127.0.0.1:${server.address().port}`;
const browser = await { chromium, firefox, webkit }[
  process.env.CAE_DESIGN_ENGINE || "chromium"
].launch({ headless: true });
const results = [];
const errors = [];
const testedIdentity = identity();
const engine = process.env.CAE_DESIGN_ENGINE || "chromium";
const browserVersion = browser.version();
try {
  const queue = [
    ...contract.pages.filter((p) => p.profile !== "fragment"),
    ...(!process.env.CAE_DESIGN_BASE ? contract.fixtures || [] : []),
  ].filter(
    (p) =>
      !process.env.CAE_DESIGN_FAMILIES_ONLY ||
      [
        "/",
        "/pricing/",
        "/beauty-salons/",
        "/connect4/",
        "/lead-to-revenue-check/",
        "/score/demo-multi-location-growth-score/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v2/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v3/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v3/",
        "/__design-kit/",
      ].includes(p.route),
  );
  async function worker() {
    while (queue.length) {
      const entry = queue.shift();
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.route("**/*", (route) => {
        const req = route.request();
        if (
          !["GET", "HEAD"].includes(req.method()) ||
          /supabase.co|google-analytics|googletagmanager/.test(req.url())
        )
          return route.abort();
        return route.continue();
      });
      const page = await context.newPage();
      for (const width of entry.viewports) {
        await page.setViewportSize({ width, height: 900 });
        await page
          .goto(base + entry.route, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});
        await page.evaluate(() =>
          Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 5000)),
          ]),
        );
        await page.waitForTimeout(200);
        const result = await page.evaluate(() => {
          const visible = (e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return (
              r.width > 0 &&
              r.height > 0 &&
              s.visibility !== "hidden" &&
              s.display !== "none"
            );
          };
          const scrollParent = (e) => {
            for (
              let p = e.parentElement;
              p && p !== document.body;
              p = p.parentElement
            )
              if (
                ["auto", "scroll"].includes(getComputedStyle(p).overflowX) &&
                p.scrollWidth > p.clientWidth
              )
                return true;
            return false;
          };
          const clipped = [
            ...document.querySelectorAll(
              "main h1, main h2, main h3, main p, main .cae-btn, main input",
            ),
          ]
            .filter(visible)
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                (r.left < -2 || r.right > innerWidth + 2) && !scrollParent(e)
              );
            })
            .map(
              (e) => e.tagName.toLowerCase() + "." + [...e.classList].join("."),
            );
          const smallActions = [
            ...document.querySelectorAll(
              ".cae-btn,input:not([type=hidden]):not([type=checkbox]):not([type=radio])",
            ),
          ]
            .filter(visible)
            .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16)
            .map(
              (e) => e.tagName.toLowerCase() + "." + [...e.classList].join("."),
            );
          return {
            clipped: [...new Set(clipped)],
            smallActions: [...new Set(smallActions)],
            missingImages: [...document.images]
              .filter((e) => visible(e) && e.complete && !e.naturalWidth)
              .map((e) => new URL(e.src).pathname),
            access: !!document.querySelector("input[type=password]"),
          };
        });
        if (width === 390) {
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          result.axe = axe.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target.join(" ")),
          }));
        }
        results.push({
          route: entry.route,
          profile: entry.profile,
          width,
          ...result,
        });
        if (
          [
            "/",
            "/pricing/",
            "/connect4/",
            "/score/demo-multi-location-growth-score/",
          ].includes(entry.route) &&
          width === 390
        )
          await page.screenshot({
            path: path.join(out, sha(entry.route).slice(0, 10) + ".png"),
            fullPage: true,
          });
      }
      await context.close();
      console.log(`Checked ${entry.route}`);
      fs.writeFileSync(path.join(out, "partial.json"), JSON.stringify(results));
    }
  }
  await Promise.all([worker(), worker(), worker()]);
} finally {
  await browser.close();
  server.close();
}
const baselinePath = path.join(
  ROOT,
  "docs/caesthetic/design/browser-exceptions.json",
);
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath))
  : [];
for (const r of results) {
  for (const kind of ["clipped", "smallActions", "missingImages", "axe"])
    for (const v of r[kind] || []) {
      const issue = { route: r.route, width: r.width, kind, value: v };
      const known = baseline.find(
        (b) => JSON.stringify(b.issue) === JSON.stringify(issue),
      );
      if (!known || Date.parse(known.expires) < Date.now()) errors.push(issue);
    }
}
fs.writeFileSync(
  path.join(out, "results.json"),
  JSON.stringify(
    {
      identity: testedIdentity,
      engine,
      browserVersion,
      base,
      checkedAt: new Date().toISOString(),
      results,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    observations: results.length,
    newViolations: errors.length,
    evidence: out,
  }),
);
if (errors.length) process.exitCode = 1;
