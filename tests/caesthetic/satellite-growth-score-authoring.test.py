#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SYNC_PATH = ROOT / "scripts" / "caesthetic" / "sync_agents_bidirectional.py"

spec = importlib.util.spec_from_file_location("cae_sync", SYNC_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Unable to load {SYNC_PATH}")
cae_sync = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = cae_sync
spec.loader.exec_module(cae_sync)


AUTHORABLE_PATHS = (
    "docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md",
    "docs/caesthetic/growth_score_spec.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md",
    "scripts/caesthetic/growth-score-report-template.mjs",
    "scripts/caesthetic/render-growth-score.mjs",
    "site-caesthetic/assets/js/growth-score-engine.mjs",
    "site-caesthetic/assets/js/growth-cockpit.js",
    "site-caesthetic/assets/css/growth-report.css",
    "tests/caesthetic/growth-score-renderer.test.mjs",
    "tests/caesthetic/growth-score-journey-graph.test.mjs",
)


class SatelliteGrowthScoreAuthoringContract(unittest.TestCase):
    def test_authorable_paths_are_in_bidirectional_sync_scope(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for rel in AUTHORABLE_PATHS:
                path = root / rel
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("same\n", encoding="utf-8")
            collected = cae_sync.collect_rels(root)
            for rel in AUTHORABLE_PATHS:
                self.assertIn(rel, collected, rel)

    def test_satellite_only_change_wins_even_for_protected_growth_score_path(self) -> None:
        rel = "scripts/caesthetic/growth-score-report-template.mjs"
        self.assertTrue(cae_sync.is_protected(rel))
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            grainee = base / "grainee"
            satellite = base / "satellite"
            g_path = grainee / rel
            s_path = satellite / rel
            g_path.parent.mkdir(parents=True, exist_ok=True)
            s_path.parent.mkdir(parents=True, exist_ok=True)
            g_path.write_text("baseline\n", encoding="utf-8")
            s_path.write_text("satellite edit\n", encoding="utf-8")
            previous = {rel: cae_sync.sha256_file(g_path)}
            action = cae_sync.decide(rel, g_path, s_path, previous)
            self.assertIsNotNone(action)
            self.assertEqual("s2g", action.direction)
            self.assertEqual("satellite_changed", action.reason)

    def test_concurrent_protected_conflict_still_fails_toward_grainee_authority(self) -> None:
        rel = "docs/caesthetic/growth_score_spec.md"
        self.assertTrue(cae_sync.is_protected(rel))
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            g_path = base / "g" / rel
            s_path = base / "s" / rel
            g_path.parent.mkdir(parents=True, exist_ok=True)
            s_path.parent.mkdir(parents=True, exist_ok=True)
            baseline = base / "baseline"
            baseline.write_text("baseline\n", encoding="utf-8")
            previous = {rel: cae_sync.sha256_file(baseline)}
            g_path.write_text("grainee edit\n", encoding="utf-8")
            s_path.write_text("satellite edit\n", encoding="utf-8")
            action = cae_sync.decide(rel, g_path, s_path, previous)
            self.assertIsNotNone(action)
            self.assertEqual("g2s", action.direction)
            self.assertEqual("conflict_protected_grainee", action.reason)

    def test_journey_graph_authorities_are_protected(self) -> None:
        for rel in (
            "docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md",
            "docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md",
            "tests/caesthetic/growth-score-journey-graph.test.mjs",
            "tests/caesthetic/satellite-growth-score-authoring.test.py",
        ):
            self.assertTrue(cae_sync.is_protected(rel), rel)


if __name__ == "__main__":
    unittest.main()
