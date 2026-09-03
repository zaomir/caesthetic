import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const opening = "Вы создаёте новый аудит? Ответьте на вопросы.";
const enforcementPath =
  "docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md";

const instructionSurfaces = [
  "AGENTS.md",
  ".cursorrules",
  "CLAUDE.md",
  "GEMINI.md",
  ".github/copilot-instructions.md",
  ".cursor/rules/00-growth-score-audit.mdc",
  ".clinerules/00-growth-score-audit.md",
  ".roo/rules/00-growth-score-audit.md",
  ".windsurfrules",
  ".windsurf/rules/00-growth-score-audit.md",
  ".amazonq/rules/00-growth-score-audit.md",
  ".continue/rules/00-growth-score-audit.md",
  ".junie/guidelines.md",
];

function read(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("universal audit pre-router precedes CAESTHETIC repository routing", () => {
  const agents = read("AGENTS.md");
  assert.ok(agents.indexOf("Universal Growth Score audit pre-router") < agents.indexOf("This repository is"));
  assert.ok(agents.includes(enforcementPath));
});

test("every supported AI-agent instruction surface enforces the same fail-closed pre-router", () => {
  for (const relativePath of instructionSurfaces) {
    const content = read(relativePath);
    assert.match(content, /Multi-Location\s+Growth\s+Score/, relativePath);
    assert.match(content, /Growth\s+Score/, relativePath);
    assert.match(content, /аудит/u, relativePath);
    assert.ok(content.includes(opening), relativePath);
    assert.ok(content.includes(enforcementPath), relativePath);
    assert.match(content, /public\/open sources only|open sources only/, relativePath);
    assert.match(content, /Research Alignment/, relativePath);
    assert.match(content, /BLOCKED|fail.closed/is, relativePath);
  }
});

test("Aider loads the root and audit enforcement instructions", () => {
  const aider = read(".aider.conf.yml");
  assert.match(aider, /AGENTS\.md/);
  assert.ok(aider.includes(enforcementPath));
});

test("the local adapter contains the current-main authority preflight and every mandatory gate", () => {
  const policy = read(enforcementPath);
  assert.match(policy, /version: 2\.4/);
  assert.ok(policy.includes(opening));

  for (const required of [
    "Mandatory current-main authority preflight",
    "Mandatory Manager Interview",
    "Public/open-source-only boundary",
    "Research Alignment gate",
    "Full research and evidence",
    "Human-only decisions and delivery gates",
    "Fail-closed rule",
    "Primary Gap",
    "Supporting Gaps",
    "https://caesthetic.com/score/",
    "Insufficient evidence",
    "BLOCKED: missing",
    "Search / Google Business Profile",
    "Cross-Surface Consistency",
    "Lead-to-Revenue",
    "Paid Ads",
  ]) {
    assert.ok(policy.includes(required), required);
  }

  const orderedAuthorities = [
    "docs/ssot/CAESTHETIC.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md",
    "docs/caesthetic/growth_score_spec.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
    "docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md",
    "docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md",
    "docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md",
    "docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md",
  ];
  const preflight = policy.slice(
    policy.indexOf("## 2. Mandatory current-main authority preflight"),
    policy.indexOf("## 3. Mandatory Manager Interview"),
  );
  let previousIndex = -1;
  for (const authority of orderedAuthorities) {
    const index = preflight.indexOf(authority);
    assert.ok(index > previousIndex, authority);
    previousIndex = index;
  }

  for (const trigger of [
    "Multi-Location Growth Score",
    "Growth Score",
    "аудит",
    "score",
    "diagnostic",
    "audit report",
    "проверка бизнеса",
    "поиск утечек",
    "Top 3 gaps",
    "binding constraint",
  ]) {
    assert.ok(policy.includes(trigger), trigger);
  }

  for (const forbiddenInput of [
    "CRM",
    "EHR",
    "PHI",
    "GA4",
    "GSC",
    "form submissions",
    "appointment creation",
  ]) {
    assert.ok(policy.includes(forbiddenInput), forbiddenInput);
  }
});

test("all read-first entry points load the mandatory enforcement adapter", () => {
  for (const relativePath of [
    "START.md",
    "docs/projects/caesthetic/AGENTS.md",
    "agents/manifests/caesthetic.yaml",
  ]) {
    assert.ok(read(relativePath).includes(enforcementPath), relativePath);
  }
});
