#!/usr/bin/env python3
"""Poll origin/main for type=caesthetic_medspa requests and write results."""
from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

REPO = Path("/var/www/grainee-v2")
REQUESTS = REPO / "docs/agent-api/requests"
RESULTS = REPO / "docs/agent-api/results"
STATUS = Path("/var/lib/caesthetic-medspa/status.json")
RETRY_STATUSES = {"queued", "queued_on_vds", "processing"}


def git(*args: str, check: bool = True) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=REPO,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and completed.returncode != 0:
        raise subprocess.CalledProcessError(
            completed.returncode,
            completed.args,
            completed.stdout,
            completed.stderr,
        )
    return (completed.stdout or "").strip()


def materialize_origin_requests() -> None:
    """Copy request JSON from origin/main without touching the git index."""
    listing = git("ls-tree", "--name-only", "origin/main:docs/agent-api/requests")
    REQUESTS.mkdir(parents=True, exist_ok=True)
    for name in listing.splitlines():
        if not name.endswith(".json") or name.startswith("TEMPLATE"):
            continue
        blob = git("show", f"origin/main:docs/agent-api/requests/{name}")
        dest = REQUESTS / name
        dest.write_text(blob if blob.endswith("\n") else blob + "\n", encoding="utf-8")


def sync_main() -> str | None:
    """Fast-forward to origin/main. Git contention must not skip pending requests."""
    fetch_err = None
    for _attempt in range(2):
        try:
            git("fetch", "origin", "main", "-q")
            fetch_err = None
            break
        except subprocess.CalledProcessError as exc:
            fetch_err = f"fetch:{exc.returncode}"
    if fetch_err:
        return fetch_err
    head = git("rev-parse", "HEAD")
    remote = git("rev-parse", "origin/main")
    if head == remote:
        return None
    try:
        git("merge", "--ff-only", "origin/main")
        return None
    except subprocess.CalledProcessError as exc:
        try:
            materialize_origin_requests()
        except subprocess.CalledProcessError:
            return f"merge:{exc.returncode}"
        return f"merge_fallback:{exc.returncode}"


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
    existing = read_json(result) if result.exists() else None
    if existing is None and origin_has(result):
        return False
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
    try:
        sync_error = sync_main()
    except Exception as exc:
        sync_error = f"sync:{exc.__class__.__name__}"
    # Load handlers after sync so a newly received request uses the updated code.
    from run import handle_bridge

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
                "sync_error": sync_error,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "ok": True,
                "processed": processed,
                "recovered": recovered,
                "last_id": last_id,
                "sync_error": sync_error,
            }
        )
    )


if __name__ == "__main__":
    main()
