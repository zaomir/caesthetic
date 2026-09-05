import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  validate,
  identity,
} from "./design-contract.mjs";
const [mode, file] = process.argv.slice(2);
if (!["create", "verify"].includes(mode) || !file)
  throw Error("Usage: design-receipt.mjs create|verify FILE");
const { errors, contract } = validate();
if (errors.length) throw Error(errors.join("\n"));
const acceptedIdentity = identity();
if (mode === "create") {
  const report = JSON.parse(
    fs.readFileSync(
      path.join(
        process.env.CAE_DESIGN_OUTPUT || "/tmp/caesthetic-design-browser",
        "results.json",
      ),
    ),
  );
  for (const [key, value] of Object.entries(acceptedIdentity))
    if (report.identity?.[key] !== value)
      throw Error(`Browser results are stale: ${key}`);
  const expected = [
    ...contract.pages.filter((p) => p.profile !== "fragment"),
    ...(contract.fixtures || []),
  ]
    .flatMap((p) => p.viewports.map((w) => `${p.route}:${w}`))
    .sort();
  const actual = report.results.map((r) => `${r.route}:${r.width}`).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw Error("Rendered route/viewport coverage mismatch");
  if (
    report.errors.length ||
    report.results.length !==
      [
        ...contract.pages.filter((p) => p.profile !== "fragment"),
        ...(contract.fixtures || []),
      ].reduce((n, p) => n + p.viewports.length, 0)
  )
    throw Error("Rendered acceptance missing or failed");
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        ...acceptedIdentity,
        status: "PASS",
        runId: process.env.GITHUB_RUN_ID || "local",
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + "\n",
  );
} else {
  const receipt = JSON.parse(fs.readFileSync(file));
  for (const [k, v] of Object.entries(acceptedIdentity))
    if (receipt[k] !== v) throw Error(`Stale design receipt: ${k}`);
  if (receipt.status !== "PASS") throw Error("No design PASS");
  const age = Date.now() - Date.parse(receipt.createdAt);
  if (!Number.isFinite(age) || age < -300000 || age > 86400000)
    throw Error("Expired design receipt");
  console.log("Design receipt matches commit and runtime bytes");
}
