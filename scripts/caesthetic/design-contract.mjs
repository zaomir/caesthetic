import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const CONTRACT = "docs/caesthetic/design/contract.json";
export const sha = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
export function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    )
    .sort();
}
export function relative(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}
export function issues(root = ROOT) {
  const found = [];
  const paths = files(path.join(root, "site-caesthetic")).filter(
    (p) => /\.(css|html)$/.test(p) && !p.includes("/_handoff/"),
  );
  const all = paths.map((p) => fs.readFileSync(p, "utf8")).join("\n");
  const defined = new Set(
    [...all.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
  );
  defined.add("--cae-score");
  for (const p of paths) {
    const text = fs.readFileSync(p, "utf8");
    const rel = path.relative(root, p);
    const css = p.endsWith(".css")
      ? text
      : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
          .map((m) => m[1])
          .join("\n") +
        "\n" +
        [...text.matchAll(/style="([^"]*)"/gi)].map((m) => m[1]).join(";");
    const add = (rule, value, index = 0) => {
      const open = css.lastIndexOf("{", index);
      const before = Math.max(
        css.lastIndexOf("}", open - 1),
        css.lastIndexOf("{", open - 1),
      );
      const selector =
        open < 0
          ? "inline"
          : css
              .slice(before + 1, open)
              .replace(/\/\*[\s\S]*?\*\//g, "")
              .trim();
      found.push({ file: rel, selector, rule, value: value.trim() });
    };
    if (!p.endsWith("/tokens.css"))
      for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
        if (m[1] === "--cae-score" && /^\d+(?:\.\d+)?$/.test(m[2].trim()))
          continue;
        add("scoped-token", m[0], m.index);
      }
    for (const m of css.matchAll(/var\((--cae-[\w-]+)\)/g))
      if (!defined.has(m[1])) add("undefined-token", m[1], m.index);
    for (const m of css.matchAll(
      /font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem)\s*[;}]/g,
    ))
      if (Number(m[1]) * (m[2] === "rem" ? 16 : 1) < 14)
        add("small-text", m[0].slice(0, -1), m.index);
    for (const m of css.matchAll(/(?:linear|radial)-gradient\([^;]+/g))
      add("ornamental-gradient", m[0], m.index);
    for (const m of css.matchAll(
      /(?:padding(?:-[a-z]+)?|margin(?:-[a-z]+)?|gap)\s*:\s*([^;{}]+)/g,
    )) {
      const pixels = [...m[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((v) =>
        Number(v[1]),
      );
      if (
        pixels.some(
          (v) =>
            ![0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96].includes(
              Math.abs(v),
            ),
        )
      )
        add("spacing-scale", m[0], m.index);
    }
    for (const m of css.matchAll(/font-weight\s*:\s*(800|900)/g))
      add("synthetic-weight", m[0], m.index);
    if (!p.endsWith("/tokens.css") && !p.endsWith("/access.css"))
      for (const m of css.matchAll(
        /(?:color|background(?:-color)?|border-color)\s*:\s*(#[\da-fA-F]{3,8})\b/g,
      ))
        add("literal-color", m[0], m.index);
  }
  const counts = new Map();
  for (const v of found) {
    const key = sha(JSON.stringify(v));
    const prev = counts.get(key);
    if (prev) prev.count++;
    else counts.set(key, { id: key, ...v, count: 1 });
  }
  return [...counts.values()];
}
export function validate(root = ROOT) {
  const contract = JSON.parse(
    fs.readFileSync(path.join(root, CONTRACT), "utf8"),
  );
  const errors = [];
  const canon = fs.readFileSync(path.join(root, contract.ssot), "utf8");
  if (!canon.includes(`version: ${contract.version}`))
    errors.push("SSOT version drift");
  for (const [token, value] of Object.entries(contract.tokens)) {
    const css = fs.readFileSync(
      path.join(root, "site-caesthetic/assets/css/tokens.css"),
      "utf8",
    );
    if (!css.includes(`${token}:`) && !new RegExp(`${token}\\s+:`).test(css))
      errors.push(`Missing token ${token}`);
    const actual = css
      .match(new RegExp(`${token}\\s*:\\s*([^;]+)`))?.[1]
      .trim();
    if (actual !== value) errors.push(`Token contract drift: ${token}`);
    if (!canon.includes("| `" + token + "` | `" + value + "` |"))
      errors.push(`SSOT token table drift: ${token}`);
  }
  const tokenSource = fs.readFileSync(
    path.join(root, "site-caesthetic/assets/css/tokens.css"),
    "utf8",
  );
  const rootDeclarations = [...tokenSource.matchAll(/(--cae-[\w-]+)\s*:/g)].map(
    (m) => m[1],
  );
  for (const token of rootDeclarations)
    if (!(token in contract.tokens))
      errors.push(`Unregistered token: ${token}`);
  if (new Set(rootDeclarations).size !== rootDeclarations.length)
    errors.push("Duplicate root token declarations");
  const html = files(path.join(root, "site-caesthetic"))
    .filter((p) => p.endsWith(".html"))
    .map((p) => path.relative(root, p));
  for (const p of html)
    if (!contract.pages.some((x) => x.source === p))
      errors.push(`Unregistered HTML: ${p}`);
  for (const p of contract.pages) {
    if (!html.includes(p.source))
      errors.push(`Missing registered source: ${p.source}`);
    if (!contract.profiles.includes(p.profile))
      errors.push(`Unknown profile: ${p.source}`);
  }
  for (const [p, hash] of Object.entries(contract.immutable))
    if (
      !fs.existsSync(path.join(root, p)) ||
      sha(fs.readFileSync(path.join(root, p))) !== hash
    )
      errors.push(`Immutable asset drift: ${p}`);
  for (const [p, limit] of Object.entries(contract.assetBudgets))
    if (fs.statSync(path.join(root, p)).size > limit)
      errors.push(`Asset budget: ${p}`);
  const existing = new Map(contract.exceptions.map((e) => [e.id, e]));
  const scoped = new Map((contract.scopedTokens || []).map((e) => [e.id, e]));
  const currentIssues = issues(root);
  for (const e of [...contract.exceptions, ...(contract.scopedTokens || [])])
    if (!currentIssues.some((i) => i.id === e.id))
      errors.push(`Remove resolved exception ${e.id}`);
  for (const issue of currentIssues) {
    if (issue.rule === "scoped-token") {
      if (scoped.get(issue.id)?.count !== issue.count)
        errors.push(
          `Unregistered scoped token: ${issue.file}: ${issue.value.slice(0, 100)}`,
        );
      continue;
    }
    const e = existing.get(issue.id);
    if (!e || issue.count !== e.count)
      errors.push(
        `New design deviation: ${issue.file}: ${issue.rule}: ${issue.value.slice(0, 100)}`,
      );
    else if (
      !e.reason ||
      !e.owner ||
      !e.task ||
      !Number.isFinite(Date.parse(e.expires)) ||
      Date.parse(e.expires) < Date.now()
    )
      errors.push(`Invalid/expired exception ${e.id}`);
  }
  for (const p of contract.pages.filter((p) => p.profile !== "fragment")) {
    const html = fs.readFileSync(path.join(root, p.source), "utf8");
    if (
      html.includes("caesthetic-config.js") &&
      !html.includes('href="/assets/css/caesthetic-impeccable.css"')
    )
      errors.push(`Late/missing visual CSS: ${p.source}`);
  }
  return { errors, contract };
}

export function identity() {
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, CONTRACT)));
  const runtime = files(path.join(ROOT, "site-caesthetic"))
    .filter((p) => !p.includes("/docs/") && !p.includes("/_handoff/"))
    .map((p) => [relative(p), sha(fs.readFileSync(p))]);
  return {
    sha: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim(),
    runtimeHash: sha(JSON.stringify(runtime)),
    ssotHash: sha(fs.readFileSync(path.join(ROOT, contract.ssot))),
    contractHash: sha(fs.readFileSync(path.join(ROOT, CONTRACT))),
  };
}
