import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderGrowthReport } from "./render-growth-score.mjs";
import { OWNER_V2 } from "./growth-score-owner-v2.mjs";
export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const PARENTS = {
  ru: "spoken-medspa-snellville-9d7f3a5c2e184b61-rus",
  en: "spoken-medspa-snellville-9d7f3a5c2e184b61",
};
export function buildV2(locale) {
  const source = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "site-caesthetic/score", PARENTS[locale], "report.json"),
      "utf8",
    ),
  );
  source.presentation = {
    ...source.presentation,
    layout_contract: OWNER_V2,
    hide_unassessed: false,
    revision: "2",
    source_route: `/score/${PARENTS[locale]}/`,
  };
  return source;
}
export function writeV2() {
  for (const locale of ["ru", "en"]) {
    const out = path.join(ROOT, "site-caesthetic/score", PARENTS[locale], "v2");
    fs.mkdirSync(out, { recursive: true });
    const report = buildV2(locale);
    fs.writeFileSync(
      path.join(out, "presentation.json"),
      JSON.stringify(
        {
          layout_contract: OWNER_V2,
          revision: "2",
          source_report: report.presentation.source_route + "report.json",
          verified_fact_set: report.verifiedFactSetVersion,
        },
        null,
        2,
      ) + "\n",
    );
    fs.writeFileSync(path.join(out, "index.html"), renderGrowthReport(report));
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  writeV2();
