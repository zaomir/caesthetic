import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const episodePath = new URL(
  "../../docs/projects/caesthetic/operations/ig-growth/reels/episodes/001-more-traffic-not-yet.yaml",
  import.meta.url,
);
const registryPath = new URL(
  "../../docs/projects/caesthetic/operations/ig-growth/reels/REGISTRY.yaml",
  import.meta.url,
);

const episode = readFileSync(episodePath, "utf8");
const registry = readFileSync(registryPath, "utf8");

test("CAE-REEL-001 pins Reel System V3.1", () => {
  assert.match(episode, /spec_version: "Reel System V3\.1"/);
  assert.match(registry, /spec_version: "Reel System V3\.1"/);
});

test("opening master begins speech at frame 0 without artificial silence", () => {
  const opening = episode.match(/  - scene_id: S01[\s\S]*?(?=\n  - scene_id: S02)/)?.[0];
  assert.ok(opening, "S01 opening contract must exist");
  assert.match(opening, /starts_at_frame: 0/);
  assert.match(opening, /leading_silence_s: 0/);
  assert.match(opening, /continuous_through_1a_1b: true/);
  assert.doesNotMatch(opening, /silent_open_s|starts_after_headline_exit|silent_motion_plate/);
});
