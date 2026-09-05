import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validate, sha } from "../../scripts/caesthetic/design-contract.mjs";
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cae-contract-"));
  const write = (p, s) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), s);
  };
  write(
    "site-caesthetic/assets/css/tokens.css",
    ":root { --cae-text: #14191C; }",
  );
  write("site-caesthetic/index.html", "<html><main>Example</main></html>");
  write("site-caesthetic/assets/locked.png", "locked");
  write(
    "docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md",
    "version: 3.0.0\n| `--cae-text` | `#14191C` |",
  );
  write(
    "docs/caesthetic/design/contract.json",
    JSON.stringify({
      ssot: "docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md",
      version: "3.0.0",
      tokens: { "--cae-text": "#14191C" },
      profiles: ["marketing"],
      pages: [{ source: "site-caesthetic/index.html", profile: "marketing" }],
      immutable: { "site-caesthetic/assets/locked.png": sha("locked") },
      assetBudgets: {},
      exceptions: [],
    }),
  );
  return {
    root,
    write,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}
for (const [name, mutate, pattern] of [
  [
    "unregistered root token",
    (f) =>
      f.write(
        "site-caesthetic/assets/css/tokens.css",
        ":root{--cae-text:#14191C;--cae-new:#ff0000;}",
      ),
    /Unregistered token/,
  ],
  [
    "unregistered scoped token",
    (f) =>
      f.write(
        "site-caesthetic/new.css",
        ".component{--custom:#ff0000;background:var(--custom)}",
      ),
    /Unregistered scoped token/,
  ],
  [
    "new route",
    (f) => f.write("site-caesthetic/new/index.html", "<main>New</main>"),
    /Unregistered HTML/,
  ],
  [
    "new literal",
    (f) => f.write("site-caesthetic/new.css", "a{color:#ff0000}"),
    /New design deviation/,
  ],
  [
    "small action",
    (f) => f.write("site-caesthetic/new.css", "button{font-size:11px}"),
    /small-text/,
  ],
  [
    "unknown token",
    (f) => f.write("site-caesthetic/new.css", "a{color:var(--cae-unknown)}"),
    /undefined-token/,
  ],
  [
    "locked asset",
    (f) => f.write("site-caesthetic/assets/locked.png", "changed"),
    /Immutable asset drift/,
  ],
  [
    "token drift",
    (f) =>
      f.write(
        "site-caesthetic/assets/css/tokens.css",
        ":root{--cae-text:#000000;}",
      ),
    /Token contract drift/,
  ],
  [
    "missing initial CSS",
    (f) =>
      f.write(
        "site-caesthetic/index.html",
        '<script src="caesthetic-config.js"></script>',
      ),
    /Late\/missing/,
  ],
])
  test(`design gate rejects ${name}`, () => {
    const f = fixture();
    try {
      assert.deepEqual(validate(f.root).errors, []);
      mutate(f);
      assert.match(validate(f.root).errors.join("\n"), pattern);
    } finally {
      f.cleanup();
    }
  });
