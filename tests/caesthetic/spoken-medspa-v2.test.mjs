import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  ROOT,
  PARENTS,
  buildV2,
} from "../../scripts/caesthetic/build-spoken-medspa-v2.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";
import { scoreGrowthReport } from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const count = (s, re) => [...s.matchAll(re)].length;
for (const locale of ["ru", "en"])
  test(`${locale} v2 keeps approved facts, full inventory, semantic sections and CTA contract`, () => {
    const parent = `site-caesthetic/score/${PARENTS[locale]}`;
    const v1 = JSON.parse(read(`${parent}/report.json`)),
      v2 = buildV2(locale);
    const { presentation: _, ...facts1 } = v1,
      { presentation: __, ...facts2 } = v2;
    assert.deepEqual(facts1, facts2);
    assert.deepEqual(scoreGrowthReport(v1), scoreGrowthReport(v2));
    assert.equal(
      JSON.parse(read(`${parent}/v2/presentation.json`)).source_report,
      `/score/${PARENTS[locale]}/report.json`,
    );
    const html = renderGrowthReport(v2);
    assert.equal(html, read(`${parent}/v2/index.html`));
    const sections = [
      ...html.matchAll(/<section id="([^"]+)" data-cockpit-order="(\d)"/g),
    ].map((m) => [m[1], +m[2]]);
    assert.deepEqual(
      sections.map((x) => x[0]),
      [
        "gap-map",
        "focus-gaps",
        "sprint-fit",
        "repair-paths",
        "do-not-fund",
        "gap-inventory",
        "evidence-and-competitors",
        "scores-and-methodology",
        "next-step",
      ],
    );
    assert.deepEqual(
      sections.map((x) => x[1]),
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
    assert.equal(count(html, /data-inventory-gap=/g), 7);
    assert.equal(count(html, /data-surface=/g), 4);
    assert.equal(count(html, /data-cae-check-inquiry/g), 2);
    assert.equal(count(html, /data-cae-sprint-inquiry/g), 1);
    assert.equal(count(html, /data-cae-question /g), 1);
    assert.equal(count(html, /data-v2-share=/g), 2);
    assert.match(html, /data-gap-role="primary" open/);
    assert.match(html, locale === "ru" ? /Отложить/ : /Defer/);
    assert.match(
      html,
      locale === "ru"
        ? /Матрица результатов не заполнена/
        : /No results matrix has been populated/,
    );
    assert.ok(
      html.indexOf("data-cae-sprint-inquiry") > html.indexOf('id="next-step"'),
    );
    assert.doesNotMatch(
      html,
      /growth-report\.css|growth-cockpit\.js|Evidence:|Factset|Reviewer:/,
    );
    if (locale === "en") assert.doesNotMatch(html, /[А-Яа-яЁё]/);
    for (const ref of html.matchAll(/href="#([^"]+)"/g))
      assert.ok(html.includes(`id="${ref[1]}"`), `Missing anchor ${ref[1]}`);
  });
test("v1 documents and shared runtime assets retain the baseline bytes", () => {
  const baseline = JSON.parse(
    read("tests/caesthetic/fixtures/spoken-v1-hashes.json"),
  );
  for (const [file, hash] of Object.entries(baseline.files))
    assert.equal(
      createHash("sha256")
        .update(fs.readFileSync(path.join(ROOT, file)))
        .digest("hex"),
      hash,
      file,
    );
});
test("version-specific copy cannot silently render a different case", () => {
  const report = buildV2("ru");
  report.audit.project_id = "other-practice";
  assert.throws(
    () => renderGrowthReport(report),
    /limited to the approved Spoken case/,
  );
});
