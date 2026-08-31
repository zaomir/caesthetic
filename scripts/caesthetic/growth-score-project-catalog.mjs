#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INTERNAL_CATALOG_PATH = "docs/audits/caesthetic/growth-score-projects.generated.json";
const PUBLIC_CATALOG_PATH = "site-caesthetic/score/catalog.json";
const PUBLIC_INDEX_PATH = "site-caesthetic/score/index.html";
const APPROVED_STATE = "approved_report";

const toPosix = (value) => value.split(path.sep).join("/");
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function walkReportFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkReportFiles(target));
    if (entry.isFile() && entry.name === "report.json") files.push(target);
  }
  return files.sort();
}

function resolveVisibility(report) {
  if (report.reportKind === "demo") return "synthetic";
  const requested = report.catalog?.visibility ?? report.catalog_visibility ?? "private";
  if (requested === "public_case" && report.catalog?.public_listing_approved === true) return "public_case";
  return "private";
}

function resolveFormat(report) {
  const value = report.audit?.format ?? report.audit_format ?? "single_location";
  if (!["single_location", "multi_location"].includes(value)) {
    throw new TypeError(`Unsupported audit format: ${value}`);
  }
  return value;
}

function recordFromReport({ report, reportFile, repoRoot, scoreRoot }) {
  const relativeDirectory = toPosix(path.relative(scoreRoot, path.dirname(reportFile)));
  if (!relativeDirectory || relativeDirectory.startsWith("..")) {
    throw new TypeError(`Report must live under site-caesthetic/score: ${reportFile}`);
  }
  const route = `/score/${relativeDirectory}/`;
  const visibility = resolveVisibility(report);
  const displayName = report.practice?.name ?? report.subject?.name;
  const location = report.practice?.location ?? report.subject?.location ?? null;
  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new TypeError(`Approved report requires a display name: ${reportFile}`);
  }

  const projectId = report.audit?.project_id ?? relativeDirectory.replaceAll("/", "--");
  const listedName = visibility === "public_case"
    ? report.catalog?.display_name
    : visibility === "synthetic" ? displayName : null;
  const listedLocation = visibility === "public_case"
    ? report.catalog?.display_location ?? null
    : visibility === "synthetic" ? location : null;
  if (visibility === "public_case" && (typeof listedName !== "string" || !listedName.trim())) {
    throw new TypeError(`Public client case requires catalog.display_name: ${reportFile}`);
  }

  return {
    project_id: projectId,
    display_name: displayName,
    location,
    subject_type: report.audit?.subject_type ?? report.reportContext?.subject_type ?? "public_business",
    audit_format: resolveFormat(report),
    package_role: report.audit?.package_role ?? "standalone",
    report_kind: report.reportKind ?? "real",
    report_state: report.reportState,
    schema_version: report.schemaVersion,
    prepared_at: report.practice?.preparedAt ?? report.subject?.preparedAt ?? null,
    catalog_visibility: visibility,
    listed_name: listedName,
    listed_location: listedLocation,
    access_group_id: report.audit?.access_group_id ?? null,
    route,
    canonical_url: `https://caesthetic.com${route}`,
    source_path: toPosix(path.relative(repoRoot, reportFile)),
  };
}

function reportReference(record) {
  return {
    role: record.package_role,
    route: record.route,
    canonical_url: record.canonical_url,
    schema_version: record.schema_version,
    source_path: record.source_path,
  };
}

function groupProjectRecords(records) {
  const grouped = new Map();
  for (const record of records) {
    const bucket = grouped.get(record.project_id) ?? [];
    bucket.push(record);
    grouped.set(record.project_id, bucket);
  }

  return [...grouped.values()].map((bucket) => {
    if (bucket.length === 1) {
      return { ...bucket[0], report_refs: [reportReference(bucket[0])] };
    }
    if (bucket.length !== 2 || bucket.some((record) => record.audit_format !== "multi_location")) {
      throw new TypeError(`Duplicate audit project_id without one valid Multi-Location pair: ${bucket[0].project_id}`);
    }
    const parent = bucket.find((record) => record.package_role === "network_parent");
    const child = bucket.find((record) => record.package_role === "focus_location");
    if (!parent || !child) {
      throw new TypeError(`Multi-Location project requires network_parent and focus_location reports: ${bucket[0].project_id}`);
    }
    if (parent.catalog_visibility !== child.catalog_visibility) {
      throw new TypeError(`Multi-Location catalog visibility mismatch: ${parent.project_id}`);
    }
    if (parent.access_group_id && child.access_group_id && parent.access_group_id !== child.access_group_id) {
      throw new TypeError(`Multi-Location access_group_id mismatch: ${parent.project_id}`);
    }
    return {
      ...parent,
      access_group_id: parent.access_group_id ?? child.access_group_id,
      detail_schema_version: child.schema_version,
      focus_location: {
        display_name: child.display_name,
        location: child.location,
        route: child.route,
        canonical_url: child.canonical_url,
      },
      report_refs: [reportReference(parent), reportReference(child)],
    };
  });
}

function publicRecord(record) {
  return {
    project_id: record.project_id,
    display_name: record.listed_name,
    location: record.listed_location,
    audit_format: record.audit_format,
    report_kind: record.report_kind,
    schema_version: record.schema_version,
    prepared_at: record.prepared_at,
    route: record.route,
    ...(record.audit_format === "multi_location" ? { focus_location_route: record.focus_location?.route ?? null } : {}),
  };
}

export function buildGrowthScoreProjectCatalog({ repoRoot = defaultRepoRoot } = {}) {
  const scoreRoot = path.join(repoRoot, "site-caesthetic/score");
  const reportRecords = walkReportFiles(scoreRoot)
    .map((reportFile) => ({ reportFile, report: JSON.parse(fs.readFileSync(reportFile, "utf8")) }))
    .filter(({ report }) => report.reportState === APPROVED_STATE)
    .map(({ reportFile, report }) => recordFromReport({ report, reportFile, repoRoot, scoreRoot }))
    .sort((a, b) => a.project_id.localeCompare(b.project_id));
  const projects = groupProjectRecords(reportRecords).sort((a, b) => a.project_id.localeCompare(b.project_id));

  for (const project of projects) {
    if (!project.canonical_url.startsWith("https://caesthetic.com/score/")) {
      throw new TypeError(`Audit is outside caesthetic.com: ${project.canonical_url}`);
    }
    if (project.report_refs.some((report) => !report.canonical_url.startsWith("https://caesthetic.com/score/"))) {
      throw new TypeError(`Audit report reference is outside caesthetic.com: ${project.project_id}`);
    }
  }

  const listedProjects = projects
    .filter((project) => ["synthetic", "public_case"].includes(project.catalog_visibility))
    .map(publicRecord);
  const privateProjects = projects.filter((project) => project.catalog_visibility === "private");

  const internal = {
    schema_version: 1,
    authority: "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
    generated_from: "approved site-caesthetic/score/**/report.json files",
    counts: {
      total: projects.length,
      private: privateProjects.length,
      listed: listedProjects.length,
    },
    projects,
  };
  const publicCatalog = {
    schema_version: 1,
    canonical_url: "https://caesthetic.com/score/",
    listing_policy: "synthetic demos and explicitly approved public cases only",
    projects: listedProjects,
  };

  const privateTokens = privateProjects.flatMap((project) => [
    project.display_name,
    project.location,
    project.route,
    project.focus_location?.display_name,
    project.focus_location?.location,
    ...project.report_refs.map((report) => report.route),
  ]).filter(Boolean);
  const publicSerialized = JSON.stringify(publicCatalog);
  for (const token of privateTokens) {
    if (publicSerialized.includes(token)) throw new TypeError(`Private audit leaked into public catalog: ${token}`);
  }

  return { internal, publicCatalog, publicIndex: renderPublicCatalogHtml(publicCatalog) };
}

export function renderPublicCatalogHtml(publicCatalog) {
  const items = publicCatalog.projects.map((project) => `
        <a href="${escapeHtml(project.route)}"><span>${project.report_kind === "demo" ? "Synthetic demonstration" : "Approved public case"}</span><strong>${escapeHtml(project.display_name)}</strong><small>${escapeHtml(project.location ?? "Location not published")} · Growth Score v${escapeHtml(project.schema_version)}</small></a>`).join("");
  return `<!doctype html>
<html lang="en-US" data-page="growth-score-catalog">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Growth Score project catalog — CAESTHETIC</title>
  <meta name="description" content="CAESTHETIC Growth Score demonstrations and explicitly approved public audit cases.">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <link rel="canonical" href="https://caesthetic.com/score/">
  <link rel="icon" href="/assets/brand/logo-square.png">
  <link rel="stylesheet" href="/assets/css/caesthetic.css">
</head>
<body>
<div id="cae-header-slot"></div>
<main>
  <section class="cae-hero-simple">
    <div class="cae-wrap cae-wrap--narrow">
      <p class="cae-kicker">Growth Score project catalog</p>
      <h1 class="cae-h1">Audits that may be shown publicly.</h1>
      <p class="cae-lead">This page lists synthetic demonstrations and client cases with explicit public-listing approval. Private client audits are registered internally and never exposed by this catalog.</p>
    </div>
  </section>
  <section class="cae-section">
    <div class="cae-wrap">
      <p class="cae-kicker">Published examples</p>
      <h2 class="cae-h2">Evidence-led Growth Score reports</h2>
      <div class="cae-demo-list">${items}
      </div>
      <p class="cae-disclaimer">Every real audit uses public/open evidence, human approval, an unguessable noindex route and protected access. Synthetic examples do not represent client relationships or outcomes.</p>
      <a class="cae-btn cae-btn--primary" href="/growth-score/">Request a Growth Score</a>
    </div>
  </section>
</main>
<div id="cae-footer-slot"></div>
<script src="/assets/js/caesthetic-pricing.generated.js"></script>
<script src="/assets/js/caesthetic-config.js"></script>
<script src="/assets/js/caesthetic.js" defer></script>
<script src="/assets/js/analytics.js" defer></script>
</body>
</html>
`;
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function catalogArtifacts({ repoRoot = defaultRepoRoot } = {}) {
  const catalog = buildGrowthScoreProjectCatalog({ repoRoot });
  return new Map([
    [INTERNAL_CATALOG_PATH, serializeJson(catalog.internal)],
    [PUBLIC_CATALOG_PATH, serializeJson(catalog.publicCatalog)],
    [PUBLIC_INDEX_PATH, catalog.publicIndex],
  ]);
}

export function writeGrowthScoreProjectCatalog({ repoRoot = defaultRepoRoot, check = false } = {}) {
  const artifacts = catalogArtifacts({ repoRoot });
  const drift = [];
  for (const [relativePath, content] of artifacts) {
    const target = path.join(repoRoot, relativePath);
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
    if (current !== content) drift.push(relativePath);
    if (!check && current !== content) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
  }
  if (check && drift.length) throw new Error(`Growth Score project catalog drift: ${drift.join(", ")}`);
  return { checked: check, changed: check ? [] : drift, projects: buildGrowthScoreProjectCatalog({ repoRoot }).internal.counts };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = writeGrowthScoreProjectCatalog({ check: process.argv.includes("--check") });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
