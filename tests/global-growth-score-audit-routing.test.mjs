import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const opening = "Вы создаёте новый аудит? Ответьте на вопросы.";

test("CAESTHETIC satellite applies the universal audit pre-router before local routing", () => {
  const agents = fs.readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");
  const cursor = fs.readFileSync(new URL("../.cursorrules", import.meta.url), "utf8");
  for (const content of [agents, cursor]) {
    assert.match(content, /Multi-Location Growth Score/);
    assert.match(content, /Growth Score/);
    assert.match(content, /аудит/u);
    assert.ok(content.includes(opening));
  }
  assert.ok(agents.indexOf("Universal Growth Score audit pre-router") < agents.indexOf("This repository is"));
});
