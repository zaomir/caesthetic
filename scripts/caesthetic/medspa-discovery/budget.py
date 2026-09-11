"""Standing Outscraper spend ledger. Unused budget does not roll over."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

RUN_CAP_USD = 3.0
WEEK_CAP_USD = 9.0
# Conservative published catalog rate after free tier: $3 / 1_000 records.
PUBLISHED_USD_PER_1K = 3.0
# Observed checkout on 2026-09-08 city-filter exports.
OBSERVED_USD_PER_ROW = 0.01
FREE_TIER_ROWS_PUBLISHED = 500
FREE_TIER_ROWS_OBSERVED = 50


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_utc(value: str | None) -> datetime | None:
    if not value:
        return None
    text = str(value).strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def iso_week_key(when: datetime | None = None) -> str:
    dt = when or datetime.now(timezone.utc)
    iso = dt.isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


def ledger_path(store: Path) -> Path:
    return store / "spend-ledger.jsonl"


def state_path(store: Path) -> Path:
    return store / "budget-state.json"


def load_state(store: Path) -> dict:
    path = state_path(store)
    if not path.exists():
        return {
            "run_cap_usd": RUN_CAP_USD,
            "week_cap_usd": WEEK_CAP_USD,
            "rollover": False,
            "skip_next_scheduled": False,
            "last_run_id": None,
            "updated_at": None,
        }
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"run_cap_usd": RUN_CAP_USD, "week_cap_usd": WEEK_CAP_USD, "rollover": False}


def save_state(store: Path, state: dict) -> None:
    store.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = now()
    state_path(store).write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def read_ledger(store: Path) -> list[dict]:
    path = ledger_path(store)
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def append_ledger(store: Path, row: dict) -> None:
    store.mkdir(parents=True, exist_ok=True)
    clean = {key: value for key, value in row.items() if key not in {"email", "emails", "csv", "raw"}}
    with ledger_path(store).open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(clean, ensure_ascii=False) + "\n")


def week_spent_usd(store: Path, when: datetime | None = None) -> float:
    key = iso_week_key(when)
    settled_runs = set()
    reserved = 0.0
    settled = 0.0
    for row in read_ledger(store):
        if row.get("iso_week") != key:
            continue
        if row.get("status") in {"void", "recovered_unpaid", "failed_unpaid", "unknown_no_repurchase"}:
            continue
        run_id = row.get("run_id")
        if row.get("event") == "settle" and row.get("actual_usd") is not None:
            settled += float(row.get("actual_usd") or 0.0)
            settled_runs.add(run_id)
        elif row.get("event") == "reserve" and run_id not in settled_runs:
            reserved += float(row.get("reserved_usd") or 0.0)
    open_reserved = 0.0
    for row in read_ledger(store):
        if row.get("iso_week") != key or row.get("event") != "reserve":
            continue
        if row.get("run_id") in settled_runs:
            continue
        open_reserved += float(row.get("reserved_usd") or 0.0)
    return round(settled + open_reserved, 4)


def remaining_caps(store: Path, when: datetime | None = None, run_cap: float = RUN_CAP_USD, week_cap: float = WEEK_CAP_USD) -> dict:
    spent_week = week_spent_usd(store, when)
    remaining_week = max(0.0, round(week_cap - spent_week, 4))
    remaining_run = min(run_cap, remaining_week)
    return {
        "iso_week": iso_week_key(when),
        "run_cap_usd": run_cap,
        "week_cap_usd": week_cap,
        "week_spent_usd": spent_week,
        "remaining_week_usd": remaining_week,
        "remaining_run_usd": remaining_run,
        "rollover": False,
        "stop_run": remaining_run <= 0,
        "stop_week": remaining_week <= 0,
    }


def conservative_unit_usd(live_unit: float | None = None) -> float:
    """Upper-bound unit price used before a paid request. Never assume leftover free rows."""
    candidates = [OBSERVED_USD_PER_ROW, PUBLISHED_USD_PER_1K / 1000.0]
    if live_unit and live_unit > 0:
        candidates.append(float(live_unit))
    return max(candidates)


def max_rows_for_budget(budget_usd: float, *, live_unit: float | None = None, free_remaining: int | None = None) -> dict:
    if budget_usd is None or budget_usd < 0:
        return {"ok": False, "error": "budget_unknown", "max_rows": 0}
    unit = conservative_unit_usd(live_unit)
    if unit <= 0:
        return {"ok": False, "error": "unit_price_unknown", "max_rows": 0}
    free = max(0, int(free_remaining or 0))
    payable = max(0.0, float(budget_usd))
    paid_rows = int(payable // unit)
    return {
        "ok": True,
        "unit_usd": unit,
        "free_remaining_assumed": free,
        "max_rows": free + paid_rows,
        "max_paid_usd": round(paid_rows * unit, 4),
        "note": "Free remaining is 0 unless the provider confirmed unused free rows.",
    }


def quote_rows(estimated_rows: int, budget_usd: float, *, live_unit: float | None = None, free_remaining: int | None = None) -> dict:
    cap = max_rows_for_budget(budget_usd, live_unit=live_unit, free_remaining=free_remaining)
    if not cap.get("ok"):
        return {
            "ok": False,
            "would_checkout": False,
            "error": cap.get("error") or "quote_unknown",
            "stop_reason": "unknown_cost_upper_bound",
        }
    rows = max(0, int(estimated_rows))
    unit = float(cap["unit_usd"])
    free = int(cap["free_remaining_assumed"])
    billable = max(0, rows - free)
    quoted = round(billable * unit, 4)
    allowed = float(budget_usd or 0.0)
    if rows > int(cap["max_rows"]):
        return {
            "ok": False,
            "would_checkout": False,
            "quoted_usd": quoted,
            "budget_usd": allowed,
            "estimated_rows": rows,
            "max_rows": cap["max_rows"],
            "unit_usd": unit,
            "stop_reason": "quoted_price_exceeds_budget",
        }
    if quoted > allowed + 1e-9:
        return {
            "ok": False,
            "would_checkout": False,
            "quoted_usd": quoted,
            "budget_usd": allowed,
            "estimated_rows": rows,
            "unit_usd": unit,
            "stop_reason": "quoted_price_exceeds_budget",
        }
    return {
        "ok": True,
        "would_checkout": False,
        "quoted_usd": quoted,
        "budget_usd": allowed,
        "estimated_rows": rows,
        "max_rows": cap["max_rows"],
        "unit_usd": unit,
        "free_remaining_assumed": free,
        "stop_reason": None,
    }


def reserve(store: Path, *, run_id: str, quoted_usd: float, geography: dict, window: dict, provider_job_id: str | None = None) -> dict:
    caps = remaining_caps(store)
    if quoted_usd > caps["remaining_run_usd"] + 1e-9:
        return {"ok": False, "error": "run_cap", "caps": caps}
    row = {
        "at": now(),
        "iso_week": caps["iso_week"],
        "run_id": run_id,
        "event": "reserve",
        "status": "reserved",
        "reserved_usd": round(float(quoted_usd), 4),
        "actual_usd": None,
        "provider_job_id": provider_job_id,
        "geography": geography,
        "window": window,
    }
    append_ledger(store, row)
    return {"ok": True, "caps": remaining_caps(store), "row": row}


def settle(store: Path, *, run_id: str, actual_usd: float, provider_job_id: str | None = None, status: str = "settled") -> dict:
    append_ledger(
        store,
        {
            "at": now(),
            "iso_week": iso_week_key(),
            "run_id": run_id,
            "event": "settle",
            "status": status,
            "reserved_usd": None,
            "actual_usd": round(float(actual_usd), 4),
            "provider_job_id": provider_job_id,
        },
    )
    return {"ok": True, "caps": remaining_caps(store)}
