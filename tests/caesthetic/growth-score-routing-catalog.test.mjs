import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  GROWTH_SCORE_AUDIT_AUTHORITY,
  GROWTH_SCORE_AUDIT_INTENT,
  GROWTH_SCORE_AUDIT_OPENING_RU,
  GROWTH_SCORE_AUDIT_PIPELINE,
  GROWTH_SCORE_AUDIT_SYNONYMS_BY_LANGUAGE,
  mentionsGrowthScoreAudit,
  routeGrowthScoreAuditIntent,
} from "../../scripts/caesthetic/growth-score-intent-router.mjs";
import {
  buildGrowthScoreProjectCatalog,
  writeGrowthScoreProjectCatalog,
} from "../../scripts/caesthetic/growth-score-project-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("all bilingual Growth Score/audit synonyms route to one mandatory interview", () => {
  const phrases = [
    ...GROWTH_SCORE_AUDIT_SYNONYMS_BY_LANGUAGE.ru,
    ...GROWTH_SCORE_AUDIT_SYNONYMS_BY_LANGUAGE.en,
    "Займёмся аудитом найденных разрывов",
    "These locations were audited yesterday",
    "Start AUDITING this practice",
  ];
  for (const phrase of phrases) {
    assert.equal(mentionsGrowthScoreAudit(phrase), true, phrase);
    const route = routeGrowthScoreAuditIntent(phrase);
    assert.equal(route.canonical_intent, GROWTH_SCORE_AUDIT_INTENT);
    assert.equal(route.action, "start_manager_interview");
    assert.equal(route.opening, GROWTH_SCORE_AUDIT_OPENING_RU);
    assert.equal(route.source_policy, "public_open_sources_only");
    assert.equal(route.full_research_gate, "named_manager_research_alignment_approval");
    assert.deepEqual(route.authority, GROWTH_SCORE_AUDIT_AUTHORITY);
    assert.deepEqual(route.pipeline, GROWTH_SCORE_AUDIT_PIPELINE);
    assert.equal(route.focus_selection_contract.purpose, "30_day_growth_sprint");
    assert.equal(route.focus_selection_contract.primary_gap_count, 1);
    assert.deepEqual(route.focus_selection_contract.sprint_candidate_supporting_gap_range, [2, 3]);
    assert.equal(route.focus_selection_contract.supporting_gap_count, 2);
    assert.equal(route.focus_selection_contract.requested_third_supporting_gap, "BLOCKED: focus cardinality conflict");
    assert.ok(route.questions.filter((question) => question.required).length >= 8);
  }
  assert.equal(mentionsGrowthScoreAudit("Нужно обновить pricing"), false);
  assert.equal(mentionsGrowthScoreAudit("Исследуем аудиторию"), false);
  assert.equal(mentionsGrowthScoreAudit("The audition starts tomorrow"), false);
  assert.equal(mentionsGrowthScoreAudit("Review the pull request"), false);
});

test("an active audit mention continues the same interview without restarting it", () => {
  const route = routeGrowthScoreAuditIntent("Вернёмся к маркетинговому аудиту", {
    active_intent: GROWTH_SCORE_AUDIT_INTENT,
  });
  assert.equal(route.action, "continue_manager_interview");
  assert.equal(route.opening, null);
  assert.deepEqual(route.authority, GROWTH_SCORE_AUDIT_AUTHORITY);
  assert.deepEqual(route.pipeline, GROWTH_SCORE_AUDIT_PIPELINE);
});

test("the router reports the most specific normalized synonym", () => {
  const route = routeGrowthScoreAuditIntent("Сделай мультилокационный аудит сети");
  assert.equal(route.matched_synonym, "мультилокационный аудит");
});

test("current approved reports auto-register while private client data stays out of public artifacts", () => {
  const { internal, publicCatalog, publicIndex } = buildGrowthScoreProjectCatalog({ repoRoot: root });
  assert.equal(internal.counts.total, internal.projects.length);
  assert.equal(internal.counts.total, internal.counts.private + internal.counts.listed);
  assert.ok(internal.counts.listed >= 4);
  assert.equal(publicCatalog.projects.length, internal.counts.listed);
  assert.equal(internal.projects.every((project) => project.canonical_url.startsWith("https://caesthetic.com/score/")), true);

  const publicSurface = `${JSON.stringify(publicCatalog)}\n${publicIndex}`;
  assert.doesNotMatch(publicSurface, /Aesthetemed Beauty & Wellness Clinic/i);
  assert.doesNotMatch(publicSurface, /aesthetemed-public-evidence-7c3e91b4a8f26d50/i);
  assert.doesNotMatch(publicSurface, /Nohy V Ruky|nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/i);
  assert.doesNotMatch(publicSurface, /Prestige|prestige-ru-pilot-520-20260901-c6d8e2/i);
  assert.match(publicIndex, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(publicIndex, /Private client audits are registered internally and never exposed/i);
});

test("a newly approved report is discovered without a manual registry edit", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cae-audit-catalog-"));
  try {
    const scoreRoot = path.join(tempRoot, "site-caesthetic/score");
    fs.mkdirSync(path.join(scoreRoot, "new-project-a1b2c3d4e5f60708"), { recursive: true });
    fs.mkdirSync(path.join(scoreRoot, "draft-project"), { recursive: true });
    fs.writeFileSync(path.join(scoreRoot, "new-project-a1b2c3d4e5f60708/report.json"), JSON.stringify({
      schemaVersion: 5,
      reportState: "approved_report",
      reportKind: "real",
      practice: { name: "Private New Project", location: "Private City", preparedAt: "2026-08-30" },
      audit: { project_id: "project-new", subject_type: "public_business", format: "single_location" },
    }));
    fs.writeFileSync(path.join(scoreRoot, "draft-project/report.json"), JSON.stringify({
      schemaVersion: 5,
      reportState: "draft",
      reportKind: "real",
      practice: { name: "Draft Project", location: "Draft City" },
    }));

    const catalog = buildGrowthScoreProjectCatalog({ repoRoot: tempRoot });
    assert.equal(catalog.internal.counts.total, 1);
    assert.equal(catalog.internal.projects[0].project_id, "project-new");
    assert.equal(catalog.publicCatalog.projects.length, 0);
    assert.doesNotMatch(catalog.publicIndex, /Private New Project|Private City/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("a Multi-Location parent and focus-location v5 report become one catalog project", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cae-audit-multi-"));
  try {
    const parent = path.join(tempRoot, "site-caesthetic/score/network-a1b2c3d4e5f60708");
    const child = path.join(parent, "focus-location-b1c2d3e4f5a60718");
    fs.mkdirSync(child, { recursive: true });
    const common = {
      reportState: "approved_report",
      reportKind: "real",
      audit: {
        project_id: "network-project",
        subject_type: "public_business_network",
        format: "multi_location",
        access_group_id: "runtime-access-group-reference",
      },
    };
    fs.writeFileSync(path.join(parent, "report.json"), JSON.stringify({
      ...common,
      schemaVersion: 1,
      practice: { name: "Private Network", location: "Three declared locations" },
      audit: { ...common.audit, package_role: "network_parent" },
    }));
    fs.writeFileSync(path.join(child, "report.json"), JSON.stringify({
      ...common,
      schemaVersion: 5,
      practice: { name: "Private Focus Location", location: "Focus City" },
      audit: { ...common.audit, package_role: "focus_location" },
    }));

    const catalog = buildGrowthScoreProjectCatalog({ repoRoot: tempRoot });
    assert.equal(catalog.internal.counts.total, 1);
    assert.equal(catalog.internal.projects[0].audit_format, "multi_location");
    assert.equal(catalog.internal.projects[0].detail_schema_version, 5);
    assert.equal(catalog.internal.projects[0].report_refs.length, 2);
    assert.equal(catalog.internal.projects[0].focus_location.display_name, "Private Focus Location");
    assert.equal(catalog.publicCatalog.projects.length, 0);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("public real-case listing is fail-closed without explicit permission and safe display name", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cae-audit-consent-"));
  try {
    const directory = path.join(tempRoot, "site-caesthetic/score/consent-test-a1b2c3d4e5f60708");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "report.json"), JSON.stringify({
      schemaVersion: 5,
      reportState: "approved_report",
      reportKind: "real",
      practice: { name: "Hidden Client", location: "Hidden City" },
      catalog: { visibility: "public_case", public_listing_approved: false, display_name: "Safe Case" },
    }));
    const catalog = buildGrowthScoreProjectCatalog({ repoRoot: tempRoot });
    assert.equal(catalog.internal.projects[0].catalog_visibility, "private");
    assert.equal(catalog.publicCatalog.projects.length, 0);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated catalog, site aliases and SSOT routing stay in sync", () => {
  const catalog = buildGrowthScoreProjectCatalog({ repoRoot: root });
  if (catalog.internal.counts.private > 0) {
    assert.doesNotThrow(() => writeGrowthScoreProjectCatalog({ repoRoot: root, check: true }));
  } else {
    // The public satellite intentionally omits private report sources. In that
    // checkout, regenerating canonical catalog artifacts would delete records
    // that only the production repository is allowed to see.
    assert.match(read("SYNC_MANIFEST.yml"), /site-caesthetic\/private\/\*\*/);
  }
  const sop = read("docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md");
  const agents = read("docs/projects/caesthetic/AGENTS.md");
  assert.match(sop, /canonical `growth_score_audit` intent/i);
  assert.match(sop, /Вы создаёте новый аудит\? Ответьте на вопросы\./);
  assert.match(sop, /recursively discovers every `approved_report`/i);
  assert.match(sop, /production eligibility is limited to `aesthetic_practice`, `dental_practice` and `beauty_salon`/i);
  assert.match(sop, /generic audit wrapper cannot add a fourth vertical or a second product contract/i);
  assert.match(agents, /Highest-priority universal audit pre-router/i);
  for (const route of ["audit", "audits", "multi-location-growth-score"]) {
    const html = read(`site-caesthetic/${route}/index.html`);
    assert.match(html, /canonical" href="https:\/\/caesthetic\.com\/growth-score\/"/);
    assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
  }
});
