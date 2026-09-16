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
            "cost_upper_bound_usd",
            "cost_basis",
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
        if job.get("sync"):
            return {"ok": False, "error": "synchronous_request_requires_reconciliation", "stop_reason": "recover_before_new_purchase", "recovered": [{"request_id": job_id, "status": job.get("status")}], "remaining_usd": remaining_usd}
        polled = wait_for_job(store, job_id, timeout_s=90)
        recovered.append(
            {
                "job_id": job_id,
                "status": polled.get("status"),
                "timeout": bool(polled.get("timeout")),
                "rows": len(polled.get("rows") or []),
            }
        )
        if polled.get("status") in {"unknown", "pending"}:
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
    if params.get("quotes") is not None and not dry_run:
        return {"ok": False, "status": "blocked", "stop_reason": "live_quote_override_not_allowed"}
    starter = bool(params.get("starter") or params.get("replace_next_scheduled"))
    run_cap = min(RUN_CAP_USD, float(params.get("budget_usd") or RUN_CAP_USD))
    week_cap = min(WEEK_CAP_USD, float(params.get("week_budget_usd") or WEEK_CAP_USD))
    geo_path = Path(params.get("geography_path") or DEFAULT_GEO_PATH)
    geo = load_geography(geo_path)
    markets = rotate_markets(geo, store)
    if params.get("market_ids") is not None:
        ids = params["market_ids"]
        known = {market["id"]: market for market in markets}
        if not isinstance(ids, list) or not ids or any(not isinstance(mid, str) or mid not in known for mid in ids) or len(set(ids)) != len(ids):
            return {"ok": False, "status": "blocked", "stop_reason": "invalid_market_ids"}
        markets = [known[mid] for mid in ids]
    run_id = str(params.get("run_id") or f"disc-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}")
    caps = remaining_caps(store, run_cap=run_cap, week_cap=week_cap)
    state = load_state(store)
    next_slot = next_scheduled_after()
    if starter and not dry_run and (os.environ.get("OUTSCRAPER_API_KEY") or params.get("allow_offline")):
        state["skip_next_scheduled"] = True
        state["replaced_scheduled_slot"] = next_slot.strftime("%Y-%m-%dT%H:%M:%SZ")
        save_state(store, state)
    if not starter and not dry_run and state.get("skip_next_scheduled"):
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
    recovered = {"ok": True, "recovered": []} if dry_run else recover_unfinished(store, caps["remaining_run_usd"])
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
    completed_markets = 0
    for market in markets:
        if params.get("max_markets") and len(attempted) >= int(params["max_markets"]):
            break
        if remaining <= 0:
            skipped.append({"id": market["id"], "reason": "run_cap"})
            break
        window = window_for_market(geo, store, market)
        zips = list(market.get("postal_codes") or [])
        filters = catalog_filters(postal_codes=zips, added_from=window["added_from"], added_to=window["added_to"], types=market.get("types"))
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
            skipped.append({"id": market["id"], "queue": market.get("queue"), "reason": reason, "error": (quote or {}).get("error"), "http": (quote or {}).get("http")})
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
                "geography_id": market.get("geography_id", market["id"]),
                "niche_id": market.get("niche_id", "medspa"),
                "types": market.get("types", ["medical spa"]),
                "window": window,
                "quoted_usd": max_cost,
            }
        )
        if dry_run:
            quoted_total += max_cost
            remaining = round(remaining - max_cost, 4)
            continue
        purchase_id = run_id + ":" + market["id"]
        reservation = reserve(store, run_id=purchase_id, quoted_usd=max_cost, geography={"market_id": market["id"], "queue": market.get("queue")}, window=window)
        if not reservation.get("ok"):
            skipped.append({"id": market["id"], "reason": "reservation_rejected"})
            break
        quoted_total += max_cost
        job = start_or_recover_catalog(store=store, filters=filters, limit=limit)
        attempted[-1]["request_id"] = job.get("job_id")
        if job.get("job_id") and not job.get("sync"):
            job_ids.append(job["job_id"])
        if job.get("status") == "pending":
            job = wait_for_job(store, job["job_id"], timeout_s=int(params.get("timeout_s") or 180))
        if job.get("status") in {"unknown", "pending"}:
            settle(store, run_id=purchase_id, actual_usd=0.0, provider_job_id=job.get("job_id"), status="unknown_no_repurchase")
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
            settle(store, run_id=purchase_id, actual_usd=0.0, provider_job_id=job.get("job_id"), status="failed_unpaid")
            skipped.append({"id": market["id"], "reason": "provider_failure", "job_id": job.get("job_id")})
            continue
        rows = job.get("rows") or []
        raw = save_raw(
            store,
            run_id=run_id,
            market_id=market["id"],
            rows=rows,
            extra={"window": window, "quote": quote, "job_id": job.get("job_id"), "at": now(), "niche_id": market.get("niche_id", "medspa"), "types": filters["types"]},
        )
        ingest = ingest_rows(store, rows, source_file=f"{run_id}-{market['id']}.json")
        new_unique += int(ingest.get("added") or 0)
        duplicates += int(ingest.get("updated") or 0)
        excluded += int(ingest.get("excluded_fixtures") or 0)
        cost_upper = round(min(max_cost, len(rows) * float(quote["unit_usd"])), 4)
        settle(store, run_id=purchase_id, actual_usd=cost_upper, provider_job_id=job.get("job_id"), status="settled_upper_bound")
        actual = round(actual + cost_upper, 4)
        remaining = round(remaining - cost_upper, 4)
        attempted[-1]["cost_upper_bound_usd"] = cost_upper
        if job.get("window_complete", False):
            mark_success(store, market["id"], window=window, run_id=run_id)
            completed_markets += 1
            from outscraper_adapter import save_job
            job["ingested"] = True
            save_job(store, job)
        else:
            skipped.append({"id": market["id"], "reason": "incomplete_window_reconcile_before_repurchase"})
            from outscraper_adapter import save_job
            job["status"] = "unknown"
            job["reason"] = "incomplete_window_reconcile_before_repurchase"
            save_job(store, job)
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
        "ok": bool(attempted) and (dry_run or completed_markets == len(attempted)),
        "status": ("dry_run_ok" if dry_run else "success") if attempted and (dry_run or completed_markets == len(attempted)) else "blocked",
        "stop_reason": (skipped[0]["reason"] if skipped else "no_markets") if not attempted or (not dry_run and completed_markets != len(attempted)) else None,
        "dry_run": dry_run,
        "run_id": run_id,
        "iso_week": iso_week_key(),
        "quoted_usd": round(quoted_total, 4),
        "actual_usd": None,
        "cost_upper_bound_usd": actual,
        "cost_basis": "conservative_reservation_not_provider_invoice",
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
    if not dry_run:
        (store / "last-run.json").write_text(json.dumps(public_run_summary(result), indent=2) + "\n", encoding="utf-8")
    return result
