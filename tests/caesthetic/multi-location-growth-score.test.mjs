import test from "node:test";
import assert from "node:assert/strict";

import {
  createMultiLocationGrowthScoreReportTemplate,
} from "../../scripts/caesthetic/growth-score-report-template.mjs";
import {
  validateMultiLocationNetworkReport,
  validateMultiLocationPackage,
} from "../../scripts/caesthetic/multi-location-growth-score.mjs";
import {
  buildMultiLocationPresentationModel,
} from "../../scripts/caesthetic/multi-location-growth-score-view-model.mjs";
import { renderGrowthReport } from "../../scripts/caesthetic/render-growth-score.mjs";
import { createV5Report } from "./helpers/growth-score-v5-fixture.mjs";

const clone = (value) => structuredClone(value);

function networkScope(scope, affected) {
  return {
    scope,
    affected_location_ids: affected,
    observed_in_reviewed_count: affected.length,
    rollout_plan: {
      pilot_location_id: "focus",
      replication_conditions: "Replicate only after the focus-location acceptance evidence passes.",
      done_when_focus_location: "The repaired public path passes the documented focus-location check.",
      done_when_network_rollout: "Every approved rollout location passes the same documented check.",
    },
  };
}

export function packageFixture() {
  const parent = createV5Report(undefined, {
    practice: { name: "Fixture Network", location: "Two fictional markets", preparedAt: "2026-09-02", preparedFor: "Fixture owner" },
  });
  parent.audit = {
    format: "multi_location",
    package_role: "network_parent",
    project_id: "fixture-network-project",
    access_group_id: "fixture-access-group",
    parent_route: "/score/fixture-network-parent-0123456789abcdef/",
    child_route: "/score/fixture-network-parent-0123456789abcdef/focus-location/",
  };
  parent.network = {
    id: "fixture-network",
    name: "Fixture Network",
    declared_location_count: 3,
    reviewed_location_count: 2,
    focus_location_id: "focus",
    focus_location_selection_rationale: "Focus has the highest-risk observed public journey among the reviewed locations; this is not a business-performance ranking.",
    locations: [
      { id: "focus", name: "Focus Location", public_location: "Market A", state: "reviewed" },
      { id: "peer", name: "Peer Location", public_location: "Market B", state: "reviewed" },
      { id: "unresolved", name: "Unresolved Location", public_location: "Market C", state: "ambiguous" },
    ],
    shared_assets: [
      { id: "shared-site", surface: "website", public_url: "https://example.test/", used_by_location_ids: ["focus", "peer"] },
    ],
    local_assets: [
      { id: "focus-gbp", location_id: "focus", surface: "search", public_url: "https://example.test/focus-gbp" },
      { id: "peer-gbp", location_id: "peer", surface: "search", public_url: "https://example.test/peer-gbp" },
    ],
    location_graph_refs: [
      { location_id: "focus", artifact_id: "journey-focus-v1" },
      { location_id: "peer", artifact_id: "journey-peer-v1" },
    ],
    repeated_patterns: [
      {
        id: "booking-pattern",
        title: "Shared booking route loses location context",
        surface: "cross_surface",
        affected_location_ids: ["focus", "peer"],
        observed_in_reviewed_count: 2,
        evidence_refs: ["website.booking_friction"],
      },
    ],
    comparison_matrix: ["focus", "peer"].map((location_id, row) => ({
      location_id,
      search: { state: row ? "protect" : "fix_now", summary: row ? "Search is the strongest observed local pattern." : "Discovery evidence supports repair.", evidence_refs: ["search.map_visibility"] },
      website: { state: "watch", summary: "Shared route needs location-context monitoring.", evidence_refs: ["website.booking_friction"] },
      social: { state: "needs_verification", summary: "Comparable local evidence is incomplete.", evidence_refs: [] },
      reputation: { state: "protect", summary: "Observed public proof is usable.", evidence_refs: ["reputation.rating"] },
    })),
  };
  parent.humanDiagnosis.gap_inventory = parent.humanDiagnosis.gap_inventory.map((gap) => ({
    ...gap,
    ...(gap.id === "search-gap" ? { network_scope: networkScope("focus_location", ["focus"]) } : {}),
    ...(gap.id === "booking-gap" ? { network_scope: networkScope("shared_asset", ["focus", "peer"]) } : {}),
    ...(gap.id === "proof-gap" ? { network_scope: networkScope("repeated_pattern", ["focus", "peer"]) } : {}),
  }));

  const child = createV5Report(undefined, {
    practice: { name: "Focus Location", location: "Market A", preparedAt: "2026-09-02", preparedFor: "Fixture owner" },
  });
  child.audit = {
    format: "multi_location",
    package_role: "focus_location",
    project_id: parent.audit.project_id,
    access_group_id: parent.audit.access_group_id,
    parent_route: parent.audit.parent_route,
    child_route: parent.audit.child_route,
    focus_location_id: "focus",
  };
  return { parent, child };
}

test("Multi-Location authoring profile extends schema v5 without a second score", () => {
  const parent = createMultiLocationGrowthScoreReportTemplate({ packageRole: "network_parent" });
  const child = createMultiLocationGrowthScoreReportTemplate({ packageRole: "focus_location" });
  assert.equal(parent.schemaVersion, 5);
  assert.equal(parent.audit.package_role, "network_parent");
  assert.ok(parent.network);
  assert.equal(child.schemaVersion, 5);
  assert.equal(child.audit.package_role, "focus_location");
  assert.equal("network" in child, false);
  assert.equal("network_score" in parent, false);
});

test("validates one parent and one focus child with one shared ordered Top 3", () => {
  const { parent, child } = packageFixture();
  assert.equal(validateMultiLocationNetworkReport(parent), parent);
  assert.deepEqual(validateMultiLocationPackage(parent, child), { parent, child });
});

test("fails closed on coverage, package priority or aggregate-score drift", () => {
  const coverage = packageFixture();
  coverage.parent.network.reviewed_location_count = 3;
  assert.throws(() => validateMultiLocationNetworkReport(coverage.parent), /reviewed_location_count/);

  const priorities = packageFixture();
  priorities.child.humanDiagnosis.focus_selection.supporting_gap_ids.reverse();
  assert.throws(() => validateMultiLocationPackage(priorities.parent, priorities.child), /same ordered Top 3/);

  const score = packageFixture();
  score.parent.network.network_score = 71;
  assert.throws(() => validateMultiLocationNetworkReport(score.parent), /aggregate Network Score/);
});

test("network presentation model translates audit data without changing the approved priorities", () => {
  const { parent } = packageFixture();
  const view = buildMultiLocationPresentationModel(parent);
  assert.deepEqual(view.coverage, {
    declared: 3,
    reviewed: 2,
    not_reviewed: 1,
    method: "Public sources only",
  });
  assert.equal(view.locations[0].name, "Focus Location");
  assert.equal(view.locations.at(-1).state_label, "Not verified");
  assert.deepEqual(view.selected_gaps.map((gap) => gap.id), ["search-gap", "booking-gap", "proof-gap"]);
  assert.deepEqual(view.selected_gaps.map((gap) => gap.scope_label), ["Focus location", "Shared system", "Repeated pattern"]);
  assert.equal(view.primary_comparison_rows[0].location_name, "Focus Location");
});

test("network parent renders early comparison, one compact Top 3 and no network score navigator", () => {
  const { parent } = packageFixture();
  const html = renderGrowthReport(parent);
  assert.match(html, /Network overview/);
  assert.match(html, /Declared locations/);
  assert.match(html, /Internal network comparison/);
  assert.match(html, /Detailed location audit/);
  assert.match(html, /Observed in 2 of 2 reviewed locations/);
  assert.match(html, /No aggregate Network Score/);
  assert.doesNotMatch(html, /class="cae-report-score-nav"/);
  assert.doesNotMatch(html, /class="cae-focus-summary"/);
  assert.ok(html.indexOf('id="network-comparison"') < html.indexOf('id="focus-gaps"'));
  assert.equal((html.match(/class="cae-network-comparison"/g) || []).length, 1);
  assert.equal((html.match(/class="cae-report-disclosure-panel"/g) || []).length, 2);
  assert.equal((html.match(/Start the 30-Day Growth Sprint/g) || []).length, 1);
});

test("focus child keeps location presentation and returns to the parent without a second CTA", () => {
  const { child } = packageFixture();
  const html = renderGrowthReport(child);
  assert.match(html, /aria-label="Multi-Location package"/);
  assert.match(html, />Network analysis</);
  assert.match(html, /aria-current="page">Focus Location/);
  assert.match(html, /Return to the network implementation decision/);
  assert.doesNotMatch(html, /Start the 30-Day Growth Sprint/);
  assert.doesNotMatch(html, /Network overview/);
});
