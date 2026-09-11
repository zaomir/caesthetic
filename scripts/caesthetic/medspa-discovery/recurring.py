"""One recurring Outscraper collector. Quote first. Recover jobs before buying again."""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from budget import (
    RUN_CAP_USD,
    WEEK_CAP_USD,
    iso_week_key,
    load_state,
    remaining_caps,
    reserve,
    save_state,
    settle,
)
from geography import (
    DEFAULT_GEO_PATH,
    load_geography,
    mark_success,
    rotate_markets,
    window_for_market,
)
from outreach import discover_channels
from outscraper_adapter import (
    catalog_filters,
    ingest_rows,
    quote_live,
    save_raw,
    start_or_recover_catalog,
    unfinished_jobs,
    wait_for_job,
)

PUBLIC_INDEX_DEFAULT = Path("/var/www/grainee-v2/docs/ops/caesthetic-new-medspa-discovery/public-index.json")


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def next_scheduled_after(when: datetime | None = None) -> datetime:
    current = when or datetime.now(timezone.utc)
    weekday = current.weekday()  # Mon=0
    candidates = []
    for day in (0, 2, 4):
        delta = (day - weekday) % 7
        slot = current.replace(hour=12, minute=0, second=0, microsecond=0) + timedelta(days=delta)
        if slot <= current:
            slot += timedelta(days=7)
        candidates.append(slot)
    return min(candidates)


def public_run_summary(result: dict) -> dict:
    return {
        key: result.get(key)
        for key in (
            "ok",
            "run_id",
            "status",
            "quoted_usd",
            "actual_usd",
            "markets_attempted",
            "markets_skipped",
            "new_unique",
            "duplicates",
            "excluded_fixtures",
            "enrichment",
            "provider_job_ids",
            "next_scheduled_utc",
            "stop_reason",
            "replaced_scheduled_slot",
        )
        if key in result
    }


def recover_unfinished(store: Path, remaining_usd: float) -> dict:
    recovered = []
    spent = 0.0
    for job in unfinished_jobs(store):
        job_id = job.get("job_id")
        if not job_id:
            continue
        if str(job.get("status") or "") == "unknown" and not os.environ.get("OUTSCRAPER_API_KEY"):
            return {
                "ok": False,
                "error": "unfinished_job_status_unknown",
                "stop_reason": "recover_before_new_purchase",
                "recovered": recovered + [{"job_id": job_id, "status": "unknown"}],
                "remaining_usd": remaining_usd,
            }
        polled = wait_for_job(store, job_id, timeout_s=90)
        recovered.append(
            {
                "job_id": job_id,
                "status": polled.get("status"),
                "timeout": bool(polled.get("timeout")),
                "rows": len(polled.get("rows") or []),
            }
        )
        if polled.get("status") == "unknown":
            return {
                "ok": False,
                "error": "unfinished_job_status_unknown",
                "stop_reason": "recover_before_new_purchase",
                "recovered": recovered,
                "remaining_usd": remaining_usd,
            }
        if polled.get("status") == "success":
            ingest = ingest_rows(
                store,
                polled.get("rows") or [],
                source_file=f"outscraper-job-{job_id}",
            )
            recovered[-1]["ingest"] = ingest
    return {"ok": True, "recovered": recovered, "spent_usd": spent, "remaining_usd": remaining_usd}


def run_recurring_discovery(store: Path, params: dict | None = None, *, public_index: Path | None = None) -> dict:
    params = params if isinstance(params, dict) else {}
    dry_run = bool(params.get("dry_run"))
    starter = bool(params.get("starter") or params.get("replace_next_scheduled"))
    run_cap = float(params.get("budget_usd") or RUN_CAP_USD)
    week_cap = float(params.get("week_budget_usd") or WEEK_CAP_USD)
    geo_path = Path(params.get("geography_path") or DEFAULT_GEO_PATH)
    geo = load_geography(geo_path)
    run_id = str(params.get("run_id") or f"disc-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}")
    caps = remaining_caps(store, run_cap=run_cap, week_cap=week_cap)
    state = load_state(store)
    next_slot = next_scheduled_after()
    if starter and (dry_run or os.environ.get("OUTSCRAPER_API_KEY") or params.get("allow_offline")):
        state["skip_next_scheduled"] = True
        state["replaced_scheduled_slot"] = next_slot.strftime("%Y-%m-%dT%H:%M:%SZ")
        save_state(store, state)
    if not starter and state.get("skip_next_scheduled"):
        skip_until = state.get("replaced_scheduled_slot")
        state["skip_next_scheduled"] = False
        save_state(store, state)
        return {
            "ok": True,
            "status": "skipped_replaced_slot",
            "run_id": run_id,
            "replaced_scheduled_slot": skip_until,
            "next_scheduled_utc": next_scheduled_after().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "quoted_usd": 0,
            "actual_usd": 0,
            "catch_up": False,
        }
    if caps["stop_week"]:
        return {
            "ok": False,
            "status": "blocked",
            "run_id": run_id,
            "stop_reason": "week_cap",
            "caps": caps,
            "next_scheduled_utc": next_slot.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
    if caps["stop_run"]:
        return {
            "ok": False,
            "status": "blocked",
            "run_id": run_id,
            "stop_reason": "run_cap",
            "caps": caps,
            "next_scheduled_utc": next_slot.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
    recovered = recover_unfinished(store, caps["remaining_run_usd"])
    if not recovered.get("ok"):
        recovered.update({"run_id": run_id, "status": "blocked", "next_scheduled_utc": next_slot.strftime("%Y-%m-%dT%H:%M:%SZ")})
        return recovered
    if not os.environ.get("OUTSCRAPER_API_KEY") and not dry_run and not params.get("allow_offline"):
        return {
            "ok": False,
            "status": "blocked",
            "run_id": run_id,
            "error": "OUTSCRAPER_API_KEY_absent_on_vds",
            "stop_reason": "outscraper_key_absent",
            "caps": caps,
            "next_scheduled_utc": next_slot.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

    remaining = caps["remaining_run_usd"]
    actual = 0.0
    quoted_total = 0.0
    attempted = []
    skipped = []
    job_ids = []
    new_unique = 0
    duplicates = 0
    excluded = 0
    for market in rotate_markets(geo, store):
        if remaining <= 0:
            skipped.append({"id": market["id"], "reason": "run_cap"})
            break
        window = window_for_market(geo, store, market)
        zips = list(market.get("postal_codes") or [])
        if params.get("quotes") is not None:
            if market["id"] not in params["quotes"]:
                skipped.append({"id": market["id"], "queue": market.get("queue"), "reason": "not_in_quote_set"})
                continue
            quote = params["quotes"].get(market["id"])
        else:
            quote = quote_live(
                postal_codes=zips,
                added_from=window["added_from"],
                added_to=window["added_to"],
                budget_usd=remaining,
            )
        if not quote or not quote.get("ok"):
            reason = (quote or {}).get("stop_reason") or (quote or {}).get("error") or "unknown_cost_upper_bound"
            skipped.append({"id": market["id"], "queue": market.get("queue"), "reason": reason})
            if reason == "unknown_cost_upper_bound":
                break
            continue
        max_cost = float(quote.get("quoted_usd") or 0.0)
        if max_cost > remaining + 1e-9:
            skipped.append({"id": market["id"], "queue": market.get("queue"), "reason": "quoted_price_exceeds_remaining"})
            continue
        limit = int(quote.get("estimated_rows") or quote.get("max_rows") or 0)
        if limit <= 0:
            skipped.append({"id": market["id"], "queue": market.get("queue"), "reason": "unknown_cost_upper_bound"})
            break
        attempted.append(
            {
                "id": market["id"],
                "queue": market.get("queue"),
                "coverage": market.get("coverage"),
                "postal_codes": zips,
                "window": window,
                "quoted_usd": max_cost,
            }
        )
        if dry_run:
            quoted_total += max_cost
            remaining = round(remaining - max_cost, 4)
            continue
        reserve(store, run_id=run_id, quoted_usd=max_cost, geography={"market_id": market["id"], "queue": market.get("queue")}, window=window)
        quoted_total += max_cost
        filters = catalog_filters(postal_codes=zips, added_from=window["added_from"], added_to=window["added_to"])
        job = start_or_recover_catalog(store=store, filters=filters, limit=limit)
        if job.get("job_id"):
            job_ids.append(job["job_id"])
        if job.get("status") == "pending":
            job = wait_for_job(store, job["job_id"], timeout_s=int(params.get("timeout_s") or 180))
        if job.get("status") == "unknown":
            settle(store, run_id=run_id, actual_usd=0.0, provider_job_id=job.get("job_id"), status="unknown_no_repurchase")
            return {
                "ok": False,
                "status": "blocked",
                "run_id": run_id,
                "stop_reason": "recover_before_new_purchase",
                "provider_job_ids": job_ids,
                "markets_attempted": attempted,
                "quoted_usd": round(quoted_total, 4),
                "actual_usd": actual,
                "next_scheduled_utc": next_scheduled_after().strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
        if job.get("status") != "success":
            settle(store, run_id=run_id, actual_usd=0.0, provider_job_id=job.get("job_id"), status="failed_unpaid")
            skipped.append({"id": market["id"], "reason": "provider_failure", "job_id": job.get("job_id")})
            continue
        rows = job.get("rows") or []
        raw = save_raw(
            store,
            run_id=run_id,
            market_id=market["id"],
            rows=rows,
            extra={"window": window, "quote": quote, "job_id": job.get("job_id"), "at": now()},
        )
        ingest = ingest_rows(store, rows, source_file=f"{run_id}-{market['id']}.json")
        new_unique += int(ingest.get("added") or 0)
        duplicates += int(ingest.get("updated") or 0)
        excluded += int(ingest.get("excluded_fixtures") or 0)
        settle(store, run_id=run_id, actual_usd=max_cost, provider_job_id=job.get("job_id"))
        actual = round(actual + max_cost, 4)
        remaining = round(remaining - max_cost, 4)
        mark_success(store, market["id"], window=window, run_id=run_id)
        attempted[-1]["raw_sha256"] = raw.get("sha256")
        attempted[-1]["job_id"] = job.get("job_id")
        attempted[-1]["ingest"] = {key: ingest.get(key) for key in ("added", "updated", "excluded_fixtures")}

    enrichment = None
    if not dry_run and new_unique and remaining >= 0:
        enrichment = discover_channels(
            store,
            public_index or PUBLIC_INDEX_DEFAULT,
            {"batch_id": run_id, "dry_run": False},
        )
        enrichment = {
            "record_count": enrichment.get("record_count"),
            "counts": enrichment.get("counts"),
            "output_path": enrichment.get("output_path"),
            "paid": False,
            "note": "Catalog fields only. Paid contact add-ons skipped unless a remaining quote fits.",
        }

    next_after = next_scheduled_after()
    if starter:
        next_after = next_scheduled_after(next_slot)
    result = {
        "ok": True,
        "status": "success" if not dry_run else "dry_run_ok",
        "dry_run": dry_run,
        "run_id": run_id,
        "iso_week": iso_week_key(),
        "quoted_usd": round(quoted_total, 4),
        "actual_usd": actual,
        "remaining_run_usd": remaining,
        "caps": remaining_caps(store, run_cap=run_cap, week_cap=week_cap),
        "markets_attempted": attempted,
        "markets_skipped": skipped,
        "new_unique": new_unique,
        "duplicates": duplicates,
        "excluded_fixtures": excluded,
        "enrichment": enrichment,
        "provider_job_ids": job_ids,
        "recovered": recovered.get("recovered"),
        "next_scheduled_utc": next_after.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "replaced_scheduled_slot": state.get("replaced_scheduled_slot") if starter else None,
        "geography_path": str(geo_path),
        "catch_up": False,
    }
    (store / "last-run.json").write_text(json.dumps(public_run_summary(result), indent=2) + "\n", encoding="utf-8")
    return result
