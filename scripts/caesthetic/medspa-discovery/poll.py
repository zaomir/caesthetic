#!/usr/bin/env python3
"""Poll origin/main for type=caesthetic_medspa requests and write results."""
from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run import handle_bridge

REPO = Path("/var/www/grainee-v2")
REQUESTS = REPO / "docs/agent-api/requests"
RESULTS = REPO / "docs/agent-api/results"
STATUS = Path("/var/lib/caesthetic-medspa/status.json")
RETRY_STATUSES = {"queued", "queued_on_vds", "processing"}


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=REPO, text=True).strip()


def sync_main() -> None:
    git("fetch", "origin", "main", "-q")
    head = git("rev-parse", "HEAD")
    remote = git("rev-parse", "origin/main")
    if head != remote:
        git("merge", "--ff-only", "origin/main")


def read_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def request_id_for(path: Path, req: dict | None = None) -> str:
    req = req if isinstance(req, dict) else read_json(path)
    return str((req or {}).get("request_id") or path.stem)


def is_medspa_request(path: Path) -> bool:
    if path.name.startswith("TEMPLATE") or path.suffix != ".json":
        return False
    req = read_json(path)
    return str((req or {}).get("type") or "") == "caesthetic_medspa"


def origin_has(path: Path) -> bool:
    rel = str(path.relative_to(REPO))
    return subprocess.run(
        ["git", "cat-file", "-e", f"origin/main:{rel}"],
        cwd=REPO,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def should_run(path: Path) -> bool:
    if not is_medspa_request(path):
        return False
    rid = request_id_for(path)
    result = RESULTS / f"{rid}.json"
    if not result.exists():
        return True
    existing = read_json(result)
    if existing is None:
        return True
    return existing.get("status") in RETRY_STATUSES


def terminal_local_result(path: Path) -> Path | None:
    if not is_medspa_request(path):
        return None
    rid = request_id_for(path)
    result = RESULTS / f"{rid}.json"
    if not result.exists() or origin_has(result):
        return None
    existing = read_json(result)
    if existing is None or existing.get("status") in RETRY_STATUSES:
        return None
    return result


def write_error_result(request: dict, output: Path, exc: Exception) -> None:
    host = subprocess.check_output(["hostname", "-s"], text=True).strip() or "unknown"
    payload = {
        "request_id": request.get("request_id"),
        "type": "caesthetic_medspa",
        "operation": str(request.get("operation") or request.get("action") or "status"),
        "status": "error",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ok": False,
        "worker": {"host": host, "canonical_host": "vps2402"},
        "data": {"redacted": True},
        "warnings": [],
        "errors": [{"code": "internal_error", "message": exc.__class__.__name__}],
        "providers_used": [],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def commit_push(paths: list[str], message: str) -> None:
    subprocess.check_call(["git", "add", *paths], cwd=REPO)
    staged = subprocess.run(["git", "diff", "--staged", "--quiet"], cwd=REPO)
    if staged.returncode == 0:
        return
    subprocess.check_call(["git", "commit", "-m", message], cwd=REPO)
    try:
        subprocess.check_call(["git", "push", "origin", "HEAD:main"], cwd=REPO)
    except subprocess.CalledProcessError:
        git("fetch", "origin", "main", "-q")
        git("rebase", "origin/main")
        subprocess.check_call(["git", "push", "origin", "HEAD:main"], cwd=REPO)


def main() -> None:
    STATUS.parent.mkdir(parents=True, exist_ok=True)
    sync_main()
    paths = sorted(REQUESTS.glob("*.json"))
    processed = 0
    recovered = 0
    last_id = None
    for path in paths:
        pending = terminal_local_result(path)
        if pending is not None:
            rid = request_id_for(path)
            last_id = rid
            commit_push(
                [str(pending.relative_to(REPO))],
                f"chore(caesthetic-medspa): result {rid} [skip ci]",
            )
            recovered += 1
            continue
        if not should_run(path):
            continue
        req = json.loads(path.read_text(encoding="utf-8"))
        rid = str(req.get("request_id") or path.stem)
        last_id = rid
        out = RESULTS / f"{rid}.json"
        try:
            handle_bridge(req, out)
        except Exception as exc:
            write_error_result(req, out, exc)
        commit_push(
            [str(out.relative_to(REPO))],
            f"chore(caesthetic-medspa): result {rid} [skip ci]",
        )
        processed += 1
    STATUS.write_text(
        json.dumps(
            {
                "last_heartbeat_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "processed": processed,
                "recovered": recovered,
                "current_request_id": last_id,
                "next_poll": "cron */5",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"ok": True, "processed": processed, "recovered": recovered, "last_id": last_id}))


if __name__ == "__main__":
    main()
