import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const SITE_ROOT = join(process.cwd(), "site-caesthetic");
const MIME = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function indexRoutes(directory = SITE_ROOT) {
  const routes = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) routes.push(...await indexRoutes(path));
    if (entry.isFile() && entry.name === "index.html") {
      const route = relative(SITE_ROOT, directory).split(sep).join("/");
      routes.push(`/${route ? `${route}/` : ""}`);
    }
  }
  return routes;
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://local.test").pathname);
      let file = join(SITE_ROOT, pathname);
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      response.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server;
}

test("every CAESTHETIC page passes WCAG color contrast on mobile and desktop", { timeout: 120_000 }, async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const { port } = server.address();
  const findings = [];

  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      for (const route of (await indexRoutes()).sort()) {
        await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded" });
        const result = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        for (const violation of result.violations) {
          for (const node of violation.nodes) {
            findings.push({ route, viewport: viewport.width, target: node.target, summary: node.failureSummary });
          }
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  assert.deepEqual(findings, []);
});
