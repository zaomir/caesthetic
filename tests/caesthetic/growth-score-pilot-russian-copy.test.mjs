import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scoreRoot = path.join(root, "site-caesthetic", "score");
const expectedSections = [
  "gap-map",
  "focus-gaps",
  "sprint-fit",
  "repair-paths",
  "do-not-fund",
  "gap-inventory",
  "evidence-and-competitors",
  "scores-and-methodology",
  "next-step",
];

function pilotFiles() {
  if (!fs.existsSync(scoreRoot)) return [];
  return fs.readdirSync(scoreRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(scoreRoot, entry.name, "index.html"))
    .filter((file) => fs.existsSync(file))
    .filter((file) => fs.readFileSync(file, "utf8").includes('data-report-kind="pilot"'));
}

function visibleTextWithoutBrands(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*data-brand[^>]*>[\s\S]*?<\/[^>]+>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\bPRE-\d{2}-\d{2}\b/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, " и ")
    .replace(/\s+/g, " ")
    .trim();
}

test("каждый русский пилот использует шаблон 5.2.0 и только русскую видимую лексику вне названий брендов и машинных идентификаторов", (t) => {
  const files = pilotFiles();
  if (files.length === 0) {
    t.skip("client pilot artifacts are intentionally absent from the public satellite repository");
    return;
  }

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /<html lang="ru"/);
    assert.match(html, /data-template-version="growth-score-report-template\/5\.2\.0"/);

    const intro = html.indexOf('id="report-intro"');
    const first = html.indexOf('id="gap-map" data-cockpit-order="1"');
    assert.ok(intro >= 0 && intro < first, `${file}: ненумерованное введение должно быть перед первым разделом`);
    assert.doesNotMatch(html.slice(intro, html.indexOf("</section>", intro)), /data-cockpit-order/);

    let previous = -1;
    expectedSections.forEach((id, index) => {
      const marker = `id="${id}" data-cockpit-order="${index + 1}"`;
      const position = html.indexOf(marker);
      assert.ok(position > previous, `${file}: нарушен порядок раздела ${id}`);
      previous = position;
    });
    assert.equal((html.match(/data-cockpit-order=/g) || []).length, 9, `${file}: должно быть ровно девять нумерованных разделов`);

    const visible = visibleTextWithoutBrands(html);
    const latin = visible.match(/[A-Za-z]+/g) || [];
    assert.deepEqual(latin, [], `${file}: найдены иностранные слова вне официальных названий: ${latin.join(", ")}`);
  }
});
