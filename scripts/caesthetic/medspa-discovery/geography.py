"""Discovery geography queues. Does not mutate canonical pilot cities.json."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

DEFAULT_GEO_PATH = Path("/var/www/grainee-v2/docs/ops/caesthetic-new-medspa-discovery/discovery-geography.json")
QUEUE_ORDER = ("A", "B", "C", "D")


def now_dt() -> datetime:
    return datetime.now(timezone.utc)


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


def load_geography(path: Path | None = None) -> dict:
    geo_path = path or DEFAULT_GEO_PATH
    return json.loads(geo_path.read_text(encoding="utf-8"))


def iter_markets(geo: dict) -> list[dict]:
    markets = []
    queues = geo.get("queues") or {}
    niches = geo.get("niches") or [{"id": "medspa", "types": ["medical spa"], "enabled": True, "priority": 1}]
    for queue_id in sorted(queues, key=lambda key: (int(queues[key].get("priority") or 99), key)):
        queue = queues.get(queue_id) or {}
        for market in queue.get("markets") or []:
            row = dict(market)
            row["queue"] = queue_id
            row["queue_priority"] = int(queue.get("priority") or 99)
            for niche in niches:
                if not niche.get("enabled", False):
                    continue
                if niche.get("market_ids") is not None and market["id"] not in niche["market_ids"]:
                    continue
                tile = dict(row)
                tile["geography_id"] = market["id"]
                tile["niche_id"] = niche["id"]
                tile["types"] = list(niche["types"])
                tile["niche_priority"] = int(niche.get("priority") or 99)
                tile["niche_review_rule"] = niche.get("review_rule")
                # Legacy medspa IDs/cursors stay intact. New niches never inherit them.
                if niche["id"] != "medspa":
                    tile["id"] = market["id"] + "__" + niche["id"]
                markets.append(tile)
    return markets


def market_state_path(store: Path) -> Path:
    return store / "market-state.json"


def load_market_state(store: Path) -> dict:
    path = market_state_path(store)
    if not path.exists():
        return {"markets": {}, "updated_at": None}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"markets": {}, "updated_at": None}


def save_market_state(store: Path, doc: dict) -> None:
    store.mkdir(parents=True, exist_ok=True)
    doc["updated_at"] = now_dt().strftime("%Y-%m-%dT%H:%M:%SZ")
    market_state_path(store).write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")


def mark_success(store: Path, market_id: str, *, window: dict, run_id: str) -> None:
    doc = load_market_state(store)
    markets = doc.setdefault("markets", {})
    current = markets.get(market_id) or {}
    current["last_success_at"] = now_dt().strftime("%Y-%m-%dT%H:%M:%SZ")
    current["last_window"] = window
    current["last_run_id"] = run_id
    markets[market_id] = current
    save_market_state(store, doc)


def rotate_markets(geo: dict, store: Path) -> list[dict]:
    """Oldest successful market/niche first, so budget cannot starve later queues."""
    state = load_market_state(store).get("markets") or {}
    ranked = []
    for market in iter_markets(geo):
        seen = parse_utc((state.get(market["id"]) or {}).get("last_success_at"))
        ranked.append((market["queue_priority"], seen or datetime(1970, 1, 1, tzinfo=timezone.utc), market["priority_inside_queue"], market))
    ranked.sort(key=lambda item: (item[1], item[0], item[3].get("niche_priority", 1), item[2], item[3]["id"]))
    return [item[3] for item in ranked]


def window_for_market(geo: dict, store: Path, market: dict, *, now: datetime | None = None) -> dict:
    cfg = geo.get("window") or {}
    overlap = int(cfg.get("overlap_days") or 3)
    first_days = int(cfg.get("first_window_days") or 14)
    current = now or now_dt()
    state = (load_market_state(store).get("markets") or {}).get(market["id"]) or {}
    last_success = parse_utc(state.get("last_success_at"))
    last_window = state.get("last_window") if isinstance(state.get("last_window"), dict) else {}
    if last_success:
        start = last_success - timedelta(days=overlap)
    elif last_window.get("added_from"):
        start = parse_utc(last_window.get("added_from")) or (current - timedelta(days=first_days))
    else:
        start = current - timedelta(days=first_days)
    added_from = int(start.timestamp())
    added_to = int(current.timestamp())
    return {
        "added_from": added_from,
        "added_to": added_to,
        "added_from_iso": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "added_to_iso": current.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "overlap_days": overlap,
        "first_collect": last_success is None,
        "kept_failed_interval": bool(last_window) and not last_success,
    }


def paid_hashes(geo: dict) -> dict[str, str]:
    out = {}
    for item in geo.get("do_not_repurchase") or []:
        name = item.get("file")
        digest = item.get("sha256")
        if name and digest:
            out[str(name)] = str(digest)
    return out
