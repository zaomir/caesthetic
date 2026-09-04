import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  JOURNEY_GRAPH_ARTIFACT_VERSION,
  analyzeJourneyGraph,
  scoreGrowthReport,
  validateJourneyGraphArtifact,
} from "../../site-caesthetic/assets/js/growth-score-engine.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";
import {
  createJourneyGraphFixture,
  createV5Report,
} from "./helpers/growth-score-v5-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const approvedHeroAsset = "site-caesthetic/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png";
const approvedHeroSrc = "/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png";
const approvedHeroSha256 = "64d54a5a5fbb1aaddbfdc9f7641103a0beab53c09e8b79ff38892e8a3348ca05";

test("Cross-Surface Journey Graph is one reviewed evidence artifact and never a fifth surface", () => {
  const baseline = createV5Report();
  const withGraph = createV5Report(undefined, { journeyGraph: createJourneyGraphFixture() });
  const baselineResult = scoreGrowthReport(baseline);
  const graphResult = scoreGrowthReport(withGraph);

  assert.equal(withGraph.journeyGraph.artifact_version, JOURNEY_GRAPH_ARTIFACT_VERSION);
  assert.equal(withGraph.journeyGraph.automatic_score_change, false);
  assert.equal(withGraph.surfaces.length, 4);
  assert.deepEqual(graphResult.surfaces, baselineResult.surfaces);
  assert.deepEqual(graphResult.crossSurface, baselineResult.crossSurface);
  assert.deepEqual(graphResult.overall, baselineResult.overall);
  assert.ok(graphResult.journeyGraph);
});

test("reachability detects clean and friction routes plus technical and semantic breaks", () => {
  const graph = createJourneyGraphFixture();
  const analysis = validateJourneyGraphArtifact(graph, { publication: true });
  assert.deepEqual(analysis, analyzeJourneyGraph(graph));

  const search = analysis.reachability.find((item) => item.entry_node_id === "search-listing");
  const social = analysis.reachability.find((item) => item.entry_node_id === "social-profile");
  const reviews = analysis.reachability.find((item) => item.entry_node_id === "reviews-listing");
  assert.deepEqual(search, {
    entry_node_id: "search-listing",
    reachable_to_intake: true,
    route_status: "clean",
    shortest_clean_hops: 2,
    alternate_clean_route: false,
    best_path_edge_ids: ["search-to-website", "website-to-intake"],
  });
  assert.equal(social.route_status, "friction");
  assert.equal(reviews.route_status, "friction");
  assert.deepEqual(analysis.diagnostics.technical_breaks, ["social-to-intake-missing"]);
  assert.deepEqual(analysis.diagnostics.context_breaks, [{ edge_id: "social-to-intake-missing", dimensions: ["treatment", "offer"] }]);
  assert.deepEqual(analysis.diagnostics.identity_breaks, []);
  assert.deepEqual(analysis.diagnostics.location_breaks, []);
  assert.deepEqual(analysis.diagnostics.treatment_breaks, ["social-to-intake-missing"]);
  assert.deepEqual(analysis.diagnostics.offer_breaks, ["social-to-intake-missing"]);
  assert.deepEqual(analysis.diagnostics.proof_breaks, []);
});

test("unknown path evidence stays not assessed and a clean parallel route cannot hide a broken surface edge", () => {
  const graph = createJourneyGraphFixture();
  const direct = graph.edges.find((edge) => edge.id === "social-to-intake-missing");
  direct.status = "not_assessed";
  direct.exists = null;
  direct.technical_integrity = { status: "not_assessed", observed_behavior: "The direct route was not tested." };
  direct.context_integrity = {
    status: "not_assessed",
    observed_behavior: "Context preservation was not tested.",
    dimensions: Object.fromEntries(["identity", "location", "treatment", "offer", "proof"].map((dimension) => [dimension, "not_assessed"])),
  };
  direct.next_action_available = null;
  direct.source = null;
  direct.collected_at = null;
  direct.evidence_refs = [];
  graph.edges.find((edge) => edge.id === "social-to-website").status = "broken";
  graph.edges.find((edge) => edge.id === "social-to-website").technical_integrity.status = "broken";

  const analysis = validateJourneyGraphArtifact(graph, { publication: true });
  assert.equal(analysis.reachability.find((item) => item.entry_node_id === "social-profile").route_status, "not_assessed");
  assert.equal(
    analysis.surface_edges.find((edge) => edge.from === "social" && edge.to === "website").status,
    "broken",
  );
});

test("graph diagnostics expose loops, dead ends and orphaned public assets", () => {
  const graph = createJourneyGraphFixture();
  graph.nodes.push({
    id: "orphan-profile",
    kind: "public_asset",
    surface: "social",
    asset_type: "stale_social_profile",
    label: "Orphan profile",
    canonical_destination: "fixture://orphan",
    ownership: "unknown",
    observability: "observed",
    evidence_refs: ["social-path"],
  });
  graph.edges.push({
    id: "website-to-social",
    from: "website-service",
    to: "social-profile",
    expectation: "observed",
    action_type: "link",
    exists: true,
    status: "friction",
    technical_integrity: { status: "clean", observed_behavior: "The social link resolves." },
    context_integrity: {
      status: "friction",
      observed_behavior: "The route leaves the owned booking path.",
      dimensions: { identity: "clean", location: "clean", treatment: "friction", offer: "friction", proof: "clean" },
    },
    next_action_available: true,
    source: "fixture://website-booking",
    collected_at: "2026-08-11T12:00:00Z",
    evidence_refs: ["website-booking"],
    why_it_matters: "The detour can keep a prospect circulating between public surfaces.",
    repair_implication: "Keep booking primary and social secondary.",
  });
  const analysis = validateJourneyGraphArtifact(graph, { publication: true });
  assert.deepEqual(analysis.diagnostics.loops, [["social-profile", "website-service"]]);
  assert.deepEqual(analysis.diagnostics.dead_ends, ["orphan-profile"]);
  assert.deepEqual(analysis.diagnostics.orphans, ["orphan-profile"]);
});

test("publication fails closed on pending review, unapproved evidence and invented optional missing edges", () => {
  const pending = createJourneyGraphFixture();
  pending.review.status = "pending";
  assert.throws(() => validateJourneyGraphArtifact(pending, { publication: true }), /review.status must be approved/);

  const unapprovedEvidence = createJourneyGraphFixture();
  unapprovedEvidence.evidence[0].reviewer_status = "ai_draft";
  assert.throws(() => validateJourneyGraphArtifact(unapprovedEvidence, { publication: true }), /must be approved for publication/);

  const optionalMissing = createJourneyGraphFixture();
  optionalMissing.edges.find((edge) => edge.id === "social-to-intake-missing").expectation = "optional";
  assert.throws(() => validateJourneyGraphArtifact(optionalMissing, { publication: true }), /cannot mark an optional/);

  const hiddenContextBreak = createJourneyGraphFixture();
  const cleanEdge = hiddenContextBreak.edges.find((edge) => edge.id === "search-to-website");
  cleanEdge.context_integrity.dimensions.identity = "broken";
  assert.throws(() => validateJourneyGraphArtifact(hiddenContextBreak, { publication: true }), /dimensions must all be clean/);
});

test("metric links are evidence-only and restricted to existing approved metrics", () => {
  const graph = createJourneyGraphFixture();
  graph.metric_links[0].metric_ref = "cross.new_network_score";
  assert.throws(() => validateJourneyGraphArtifact(graph, { publication: true }), /not an approved existing metric/);

  const scoreMutation = createJourneyGraphFixture();
  scoreMutation.automatic_score_change = true;
  assert.throws(() => validateJourneyGraphArtifact(scoreMutation, { publication: true }), /automatic_score_change must be false/);
});

test("approved Hero is the exact immutable raster while the artifact still renders Broken Connections", () => {
  const graph = createJourneyGraphFixture();
  const report = createV5Report(undefined, { journeyGraph: graph });
  const html = renderGrowthReport(report);
  const assetBytes = fs.readFileSync(path.join(root, approvedHeroAsset));
  const assetHash = crypto.createHash("sha256").update(assetBytes).digest("hex");
  const approvedAssetDirectory = path.dirname(path.join(root, approvedHeroAsset));
  const heroPngs = fs.readdirSync(approvedAssetDirectory).filter((name) => name.endsWith(".png"));
  const heroStart = html.indexOf('<figure class="cae-approved-hero-asset"');
  const heroEnd = html.indexOf("</figure>", heroStart);
  const hero = html.slice(heroStart, heroEnd + "</figure>".length);
  const rendererSource = fs.readFileSync(path.join(root, "scripts/caesthetic/render-growth-score.mjs"), "utf8");

  assert.equal(assetHash, approvedHeroSha256);
  assert.equal(assetBytes.length, 1056049);
  assert.ok(heroPngs.includes(path.basename(approvedHeroAsset)));
  assert.equal((html.match(/data-artifact-id="fixture-journey-graph-v1"/g) || []).length, 2);
  assert.match(html, /data-graph-view="hero"/);
  assert.match(hero, new RegExp(`src="${approvedHeroSrc.replaceAll("/", "\\/")}"`));
  assert.match(hero, new RegExp(`data-approved-asset-sha256="${approvedHeroSha256}"`));
  assert.match(hero, /width="6912" height="3456"/);
  assert.match(hero, /alt="Where Clients Are Gained - and Lost"/);
  assert.equal((hero.match(/<img\b/g) || []).length, 1);
  assert.doesNotMatch(hero, /<(?:svg|canvas|picture)\b|srcset=|<figcaption\b|data-edge-id=|data-mobile-primary-journey/);
  assert.doesNotMatch(rendererSource, /function\s+(?:selectJourneyGraphLayout|practiceIdentitySvg|primaryJourneyMobileHtml|graphLegendHtml)\b/);
  assert.match(html, /Broken Connections Map/);
  assert.ok(html.indexOf("Broken Connections Map") < html.indexOf('id="focus-gaps"'));
  assert.match(html, /social-to-intake-missing/);
});

test("Broken Connections uses exact edge states while the locked Hero remains isolated", () => {
  const graph = createJourneyGraphFixture();
  graph.edges.push({
    id: "reviews-to-intake-unverified",
    from: "reviews-listing",
    to: "lead-intake",
    expectation: "conditional",
    action_type: "native_navigation",
    exists: null,
    status: "not_assessed",
    technical_integrity: { status: "not_assessed", observed_behavior: "The route was not verified." },
    context_integrity: {
      status: "not_assessed",
      observed_behavior: "Context continuity was not verified.",
      dimensions: Object.fromEntries(["identity", "location", "treatment", "offer", "proof"].map((dimension) => [dimension, "not_assessed"])),
    },
    next_action_available: null,
    source: null,
    collected_at: null,
    evidence_refs: [],
    why_it_matters: "No route conclusion is supported.",
    repair_implication: "Verify the route before recommending a change.",
  });
  graph.edges.push({
    id: "optional-reviews-to-social",
    from: "reviews-listing",
    to: "social-profile",
    expectation: "optional",
    action_type: "native_navigation",
    exists: null,
    status: "not_assessed",
    technical_integrity: { status: "not_assessed", observed_behavior: "Optional relationship not assessed." },
    context_integrity: {
      status: "not_assessed",
      observed_behavior: "Optional relationship not assessed.",
      dimensions: Object.fromEntries(["identity", "location", "treatment", "offer", "proof"].map((dimension) => [dimension, "not_assessed"])),
    },
    next_action_available: null,
    source: null,
    collected_at: null,
    evidence_refs: [],
    why_it_matters: "The relationship is optional.",
    repair_implication: "Do not infer a repair.",
  });

  const analysis = validateJourneyGraphArtifact(graph, { publication: true });
  assert.equal(analysis.surface_edges.some((edge) => edge.edge_ids.includes("optional-reviews-to-social")), false);
  assert.equal(analysis.surface_edges.find((edge) => edge.from === "reputation" && edge.to === "lead_intake").status, "not_assessed");

  const html = renderGrowthReport(createV5Report(undefined, { journeyGraph: graph }));
  const hero = html.slice(html.indexOf('data-graph-view="hero"'), html.indexOf("</figure>", html.indexOf('data-graph-view="hero"')));
  assert.doesNotMatch(html, /data-edge-id="optional-reviews-to-social"/);
  assert.match(html, /data-edge-id="reviews-to-intake-unverified" data-status="not_assessed"/);
  assert.doesNotMatch(hero, /data-edge-id=/);
  assert.doesNotMatch(hero, /data-edge-id="optional-reviews-to-social"/);
  assert.doesNotMatch(html, /data-edge-id="reviews-to-intake-unverified" data-status="clean"/);
  assert.match(html, /data-edge-id="social-to-intake-missing" data-status="broken"/);
  assert.doesNotMatch(html, /data-edge-id="social-to-intake-missing" data-status="clean"/);
  assert.match(graph.edges.find((edge) => edge.id === "social-to-intake-missing").technical_integrity.observed_behavior, /no clear next step/i);
});

test("outside-in Lead-to-Revenue map stays gray and publishes only the canonical Check price and credit", () => {
  const html = renderGrowthReport(createV5Report(undefined, { journeyGraph: createJourneyGraphFixture() }));
  const start = html.indexOf('class="cae-lead-revenue"');
  const end = html.indexOf("</section>", start);
  const block = html.slice(start, end);

  assert.equal((block.match(/data-status="not_assessed"/g) || []).length, 8);
  assert.doesNotMatch(block, /data-status="(?:working|friction|confirmed_leak)"/);
  assert.match(block, /data-copy-contract="check500-section\/en-US\/1\.0\.0"/);
  assert.match(block, /Lead-to-Revenue Check · \$500/);
  assert.match(block, /Check My Lead-to-Revenue Path/);
  assert.match(block, /credited toward the \$2,500 Sprint total/);
  assert.match(block, /does not infer response, booking, attendance, consultation or payment performance/i);
  assert.doesNotMatch(block, /guaranteed|increase in (?:inquiries|bookings|revenue)|bad receptionist|broken CRM/i);

  const recommendedHtml = renderGrowthReport(createV5Report(undefined, {
    journeyGraph: createJourneyGraphFixture(),
    leadToRevenueCheck: {
      recommendation: "recommended",
      reason: "Public evidence stops at Lead Intake, so the internal path remains unresolved.",
      evidence_refs: ["website.booking_friction"],
    },
  }));
  const recommendedStart = recommendedHtml.indexOf('class="cae-lead-revenue"');
  const recommendedEnd = recommendedHtml.indexOf("</section>", recommendedStart);
  const recommendedBlock = recommendedHtml.slice(recommendedStart, recommendedEnd);

  assert.equal((recommendedBlock.match(/data-status="not_assessed"/g) || []).length, 8);
  assert.match(recommendedBlock, /data-copy-contract="check500-section\/en-US\/1\.0\.0"/);
  assert.match(recommendedBlock, /Lead-to-Revenue Check/);
  assert.match(recommendedBlock, /\$500/);
  assert.match(recommendedBlock, /credited toward the \$2,500 Sprint total/);
  assert.doesNotMatch(recommendedBlock, /Public evidence stops at Lead Intake|Supporting evidence/);
  assert.doesNotMatch(recommendedBlock, /guaranteed|increase in (?:inquiries|bookings|revenue)|bad receptionist|broken CRM/i);
});
