import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, files, relative, sha, validate } from "./design-contract.mjs";
const { errors, contract } = validate();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const runtime = files(path.join(ROOT, "site-caesthetic"))
  .filter((p) => !p.includes("/docs/") && !p.includes("/_handoff/"))
  .map((p) => [relative(p), sha(fs.readFileSync(p))]);
const result = {
  schema: 1,
  sha: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim(),
  ssotVersion: contract.version,
  ssotHash: sha(fs.readFileSync(path.join(ROOT, contract.ssot))),
  runtimeHash: sha(JSON.stringify(runtime)),
  checkedAt: new Date().toISOString(),
  status: "PASS",
  scope: "static-contract; rendered acceptance is a separate required job",
};
const i = process.argv.indexOf("--output");
if (i >= 0)
  fs.writeFileSync(process.argv[i + 1], JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
