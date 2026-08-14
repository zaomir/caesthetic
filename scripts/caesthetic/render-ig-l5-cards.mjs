#!/usr/bin/env node
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const html = path.join(root, "docs/projects/caesthetic/operations/ig-growth/footage/L5/cards.html");
const outDir = path.dirname(html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`file://${html}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const cards = await page.$$eval(".card", (nodes) =>
  nodes.map((n) => ({ id: n.id, file: n.getAttribute("data-file") })),
);

for (const card of cards) {
  const el = page.locator(`#${card.id}`);
  await el.screenshot({ path: path.join(outDir, card.file), type: "png" });
}

await browser.close();
console.log(`wrote ${cards.length} cards → ${outDir}`);
