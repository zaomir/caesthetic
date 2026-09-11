#!/usr/bin/env python3
"""Recurring discovery budget, geography, merge, and recovery checks."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "scripts/caesthetic/medspa-discovery"))

from budget import quote_rows, remaining_caps, reserve, save_state, settle
from geography import load_geography, mark_success, rotate_markets, window_for_market
from outscraper_adapter import ingest_rows, is_test_fixture_row, merge_lead, save_job, unfinished_jobs
from recurring import recover_unfinished, run_recurring_discovery


def main() -> None:
    store = Path(tempfile.mkdtemp(prefix="cae-medspa-rec-"))
    for sub in ("inbox", "ingested", "queues", "enrichment", "canary", "audit", "locks", "raw", "jobs"):
        (store / sub).mkdir()
    (store / "registry.json").write_text(
        json.dumps(
            {
                "locations": [
                    {
                        "lead_id": "keep-1",
                        "status": "excluded",
                        "identity": {"place_id": "ChIJkeep1"},
                        "business": {"name": "Keep Spa", "email": "hidden@example.com"},
                        "source": {"source_file": "prior.csv", "first_seen_at": "2026-09-01T00:00:00Z"},
                        "outreach": {"history": ["sent"]},
                    },
                    {
                        "lead_id": "ChIJtest",
                        "identity": {"place_id": "ChIJtest"},
                        "business": {"name": "Recovery Spa"},
                        "source": {"source_file": "recovery-dummy.csv"},
                    },
                ]
            }
        )
        + "\n",
        encoding="utf-8",
    )

    over = quote_rows(400, 3.0)
    assert over["ok"] is False and over["stop_reason"] == "quoted_price_exceeds_budget"
    ok = quote_rows(10, 3.0)
    assert ok["ok"] is True
    reserve(store, run_id="r1", quoted_usd=3.0, geography={"market_id": "scottsdale"}, window={})
    settle(store, run_id="r1", actual_usd=3.0, provider_job_id="job-1")
    reserve(store, run_id="r2", quoted_usd=3.0, geography={"market_id": "tampa"}, window={})
    settle(store, run_id="r2", actual_usd=3.0)
    reserve(store, run_id="r3", quoted_usd=3.0, geography={"market_id": "austin"}, window={})
    settle(store, run_id="r3", actual_usd=3.0)
    week = remaining_caps(store)
    assert week["stop_week"] is True
    assert week["week_spent_usd"] >= 9

    geo = load_geography()
    assert len(geo["queues"]["A"]["markets"]) == 9
    assert len(geo["queues"]["B"]["markets"]) == 4
    assert len(geo["queues"]["C"]["markets"]) == 8
    assert geo["queues"]["B"]["markets"][0]["coverage"] == "selected_municipalities_not_full_metro"
    first = rotate_markets(geo, store)
    assert first[0]["queue"] == "A"
    mark_success(store, "scottsdale", window={"added_from": 1}, run_id="r")
    window = window_for_market(geo, store, {"id": "scottsdale"})
    assert window["overlap_days"] == 3
    assert window["first_collect"] is False

    quotes = {
        "scottsdale": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "nashville": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "charlotte": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "tampa": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "raleigh": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "austin": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "naples": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "charleston": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "greenville": {"ok": True, "quoted_usd": 0.2, "estimated_rows": 5, "max_rows": 5},
        "miami_corridor": {"ok": True, "quoted_usd": 1.0, "estimated_rows": 5, "max_rows": 5},
        "la_westside": {"ok": False, "stop_reason": "unknown_cost_upper_bound"},
    }
    expand_store = Path(tempfile.mkdtemp(prefix="cae-medspa-exp-"))
    for sub in ("inbox", "ingested", "queues", "enrichment", "canary", "audit", "locks", "raw", "jobs"):
        (expand_store / sub).mkdir()
    (expand_store / "registry.json").write_text(json.dumps({"locations": []}) + "\n", encoding="utf-8")
    result = run_recurring_discovery(
        expand_store,
        {
            "dry_run": True,
            "allow_offline": True,
            "budget_usd": 3,
            "week_budget_usd": 9,
            "quotes": quotes,
            "run_id": "unit-expand",
        },
        public_index=expand_store / "public.json",
    )
    assert result["ok"] is True
    assert result["quoted_usd"] <= 3
    assert result["catch_up"] is False
    assert any(row.get("id") == "miami_corridor" for row in result["markets_attempted"])
    assert any(row.get("reason") == "unknown_cost_upper_bound" for row in result["markets_skipped"])

    existing = json.loads((store / "registry.json").read_text(encoding="utf-8"))["locations"][0]
    incoming = {
        "lead_id": "keep-1",
        "identity": {"place_id": "ChIJkeep1"},
        "business": {"name": "Keep Spa Changed"},
        "source": {"source_observations": [{"email_present": True}], "first_seen_at": "2026-09-11T00:00:00Z"},
        "verification": {"classification": "fresh_card"},
    }
    merged = merge_lead(existing, incoming)
    assert merged["status"] == "excluded"
    assert merged["outreach"]["history"] == ["sent"]
    assert merged["business"]["name"] == "Keep Spa"

    out = ingest_rows(
        store,
        [
            {"place_id": "ChIJnew1", "name": "New Independent Spa", "city": "Tampa", "state": "FL"},
            {"place_id": "ChIJtest", "name": "Recovery Spa"},
        ],
        source_file="run.csv",
    )
    assert out["excluded_fixtures"] >= 1
    keep = [
        row
        for row in json.loads((store / "registry.json").read_text(encoding="utf-8"))["locations"]
        if (row.get("identity") or {}).get("place_id") == "ChIJkeep1"
    ][0]
    assert keep["status"] == "excluded"
    assert keep.get("outreach") == {"history": ["sent"]}
    names = [((row.get("business") or {}).get("name")) for row in json.loads((store / "registry.json").read_text(encoding="utf-8"))["locations"]]
    assert "Recovery Spa" not in names

    save_job(store, {"job_id": "job-unknown", "status": "unknown"})
    recovered = recover_unfinished(store, 3.0)
    assert recovered.get("ok") is False
    assert recovered.get("stop_reason") == "recover_before_new_purchase"
    assert unfinished_jobs(store)

    assert is_test_fixture_row({"identity": {"place_id": "ChIJtest"}, "business": {"name": "Recovery Spa"}}) is True
    assert is_test_fixture_row({"identity": {"place_id": "ChIJreal"}, "business": {"name": "Palm"}}) is False

    skip_store = Path(tempfile.mkdtemp(prefix="cae-medspa-skip-"))
    for sub in ("inbox", "ingested", "queues", "enrichment", "canary", "audit", "locks", "raw", "jobs"):
        (skip_store / sub).mkdir()
    (skip_store / "registry.json").write_text(json.dumps({"locations": []}) + "\n", encoding="utf-8")
    save_state(skip_store, {"skip_next_scheduled": True, "replaced_scheduled_slot": "2026-09-14T12:00:00Z"})
    skipped = run_recurring_discovery(
        skip_store,
        {"allow_offline": True, "dry_run": True, "run_id": "skip-slot"},
        public_index=skip_store / "public.json",
    )
    assert skipped["status"] == "skipped_replaced_slot"
    assert skipped.get("catch_up") is False
    assert skipped.get("actual_usd") == 0

    print(json.dumps({"ok": True, "store": str(store)}))


if __name__ == "__main__":
    main()
