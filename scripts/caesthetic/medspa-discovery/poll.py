#!/usr/bin/env python3
"""Poll origin/main for type=caesthetic_medspa requests and write results."""
from __future__ import annotations

import json
import os
import tempfile
import time
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
LAST_SYNC_FAILURE = {}


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
        blob = subprocess.run(
            ["git", "show", f"origin/main:docs/agent-api/requests/{name}"],
            cwd=REPO, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
        ).stdout
        dest = REQUESTS / name
        dest.write_bytes(blob)


def reconcile_published_worktree() -> None:
    """Restore only unstaged control files whose exact bytes already exist upstream."""
    prefixes = ("docs/agent-api/results/", "docs/ops/caesthetic-new-medspa-discovery/control/", "docs/agent-api/requests/")
    paths = git("diff", "--name-only", "HEAD").splitlines()
    paths += git("ls-files", "--others", "--exclude-standard").splitlines()
    for rel in sorted(set(paths)):
        if not rel.startswith(prefixes) or not rel.endswith(".json"):
            continue
        path = REPO / rel
        if not path.is_file() or path.is_symlink():
            continue
        # Staged operator changes are never touched.
        if git("diff", "--cached", "--name-only", "--", rel):
            continue
        remote = subprocess.run(["git", "show", "origin/main:" + rel], cwd=REPO, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        if remote.returncode or remote.stdout != path.read_bytes():
            continue
        tracked = subprocess.run(["git", "cat-file", "-e", "HEAD:" + rel], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if tracked.returncode == 0:
            git("restore", "--source=HEAD", "--worktree", "--", rel)
        else:
            path.unlink()  # Exact contents are durable in fetched origin/main.


def merge_main_with_retry() -> None:
    """Retry a concurrent shared-checkout merge without resetting local work."""
    for attempt in range(3):
        reconcile_published_worktree()
        try:
            git("merge", "--ff-only", "origin/main")
            return
        except subprocess.CalledProcessError:
            if attempt == 2:
                raise
            # Other pollers share this checkout. Let their short Git transaction
            # finish, then re-check only files already durable in origin/main.
            time.sleep(2)


def sync_main() -> str | None:
    """Fast-forward to origin/main. Git contention must not skip pending requests."""
    subprocess.run(
        ["bash", str(REPO / "scripts/lib/git-stale-lock.sh"), str(REPO)],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
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
    reconcile_published_worktree()
    head = git("rev-parse", "HEAD")
    remote = git("rev-parse", "origin/main")
    if head == remote:
        materialize_origin_requests()
        return None
    try:
        merge_main_with_retry()
        materialize_origin_requests()
        return None
    except subprocess.CalledProcessError as exc:
        # Publish only fixed categories and already-public task paths, never raw stderr.
        detail = (exc.stderr or "") + (exc.stdout or "")
        categories = [label for needle, label in (
            ("index.lock", "git_index_lock"),
            ("would be overwritten", "worktree_would_be_overwritten"),
            ("Not possible to fast-forward", "not_fast_forward"),
            ("unmerged", "unmerged_paths"),
        ) if needle.lower() in detail.lower()]
        prefixes = ("docs/agent-api/", "docs/ops/caesthetic-new-medspa-discovery/",
                    "scripts/caesthetic/medspa-discovery/")
        public_paths = []
        for line in detail.splitlines():
            candidate = line.strip()
            if candidate.startswith(prefixes) and all(c.isalnum() or c in "/._-" for c in candidate):
                public_paths.append(candidate)
        LAST_SYNC_FAILURE.update({
            "categories": categories or ["unclassified_merge_error"],
            "blocking_public_paths": sorted(set(public_paths)),
            "head": git("rev-parse", "HEAD", check=False),
            "origin_main": git("rev-parse", "origin/main", check=False),
            "ahead_behind": git("rev-list", "--left-right", "--count", "HEAD...origin/main", check=False),
        })
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


def origin_result(rid: str) -> dict | None:
    blob = git("show", f"origin/main:docs/agent-api/results/{rid}.json", check=False)
    if not blob:
        return None
    try:
        data = json.loads(blob)
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def is_terminal_status(doc: dict | None) -> bool:
    return isinstance(doc, dict) and doc.get("status") not in RETRY_STATUSES


def should_run(path: Path) -> bool:
    if not is_medspa_request(path):
        return False
    rid = request_id_for(path)
    result = RESULTS / f"{rid}.json"
    existing = read_json(result) if result.exists() else None
    remote = origin_result(rid)
    # A queued_on_vds placeholder is not an execution receipt.
    if is_terminal_status(remote):
        return False
    if is_terminal_status(existing) and is_terminal_status(remote):
        return False
    if is_terminal_status(existing) and remote is None:
        return False
    return True


def terminal_local_result(path: Path) -> Path | None:
    if not is_medspa_request(path):
        return None
    rid = request_id_for(path)
    result = RESULTS / f"{rid}.json"
    if not result.exists():
        return None
    existing = read_json(result)
    if not is_terminal_status(existing):
        return None
    remote = origin_result(rid)
    # If origin still has only a queued placeholder, re-execute instead of
    # publishing a stale local crash receipt.
    if remote is None:
        return result
    return None


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


def push_main_with_retry() -> bool:
    """Push HEAD to origin/main; autostash so materialized requests do not break rebase."""
    try:
        subprocess.check_call(["git", "push", "origin", "HEAD:main"], cwd=REPO)
        return True
    except subprocess.CalledProcessError:
        pass
    git("fetch", "origin", "main", "-q")
    pull = subprocess.run(
        ["git", "pull", "--rebase", "--autostash", "origin", "main"],
        cwd=REPO,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if pull.returncode != 0:
        subprocess.run(["git", "rebase", "--abort"], cwd=REPO, check=False)
        try:
            git("merge", "--ff-only", "origin/main")
        except subprocess.CalledProcessError:
            return False
    try:
        subprocess.check_call(["git", "push", "origin", "HEAD:main"], cwd=REPO)
        return True
    except subprocess.CalledProcessError:
        return False


def commit_push(paths: list[str], message: str) -> bool:
    """Publish control receipts on current main with an isolated Git index.

    Never stage unrelated VDS files or rebase the live application's checkout.
    A concurrent main update is retried against its new parent.
    """
    allowed_prefixes = ("docs/agent-api/results/", "docs/ops/caesthetic-new-medspa-discovery/control/")
    if not paths or any(not p.startswith(allowed_prefixes) or ".." in Path(p).parts or not p.endswith(".json") for p in paths):
        raise ValueError("receipt_publication_path_rejected")
    for path in paths:
        doc = read_json(REPO / path)
        if not isinstance(doc, dict):
            raise ValueError("receipt_publication_invalid_json")
    with tempfile.TemporaryDirectory(prefix="medspa-receipt-index-") as tmp:
        env = {**os.environ, "GIT_INDEX_FILE": str(Path(tmp) / "index")}
        def command(*args):
            return subprocess.run(["git", *args], cwd=REPO, env=env, text=True,
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, timeout=45).stdout.strip()
        for _attempt in range(3):
            try:
                command("fetch", "origin", "main", "-q")
                parent = command("rev-parse", "origin/main")
                command("read-tree", parent)
                command("add", "--", *paths)
                tree = command("write-tree")
                if tree == command("rev-parse", parent + "^{tree}"):
                    return True
                commit = command("commit-tree", tree, "-p", parent, "-m", message)
                command("push", "origin", commit + ":refs/heads/main")
                return True
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
                continue
    return False


def autonomous_tick(sync_error):
    from run import dispatch
    result = {"generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
              "version": "autonomous-tick-v1", "sync_error": sync_error}
    if sync_error:
        return {**result, "ok": False, "status": "runtime_sync_blocked", "sync_diagnostics": dict(LAST_SYNC_FAILURE)}
    config = read_json(REPO / "docs/ops/caesthetic-new-medspa-discovery/autonomous-runtime.json") or {}
    for name, operation, params in (
        ("reply_poll", "instantly_control", {"action": "poll_replies", "dry_run": False}),
        ("discovery_tick", "run_discovery", {"scheduled": True}),
    ):
        if not config.get(name + "_enabled"):
            continue
        try:
            result[name] = dispatch(operation, params)
        except SystemExit as exc:
            if name == "discovery_tick" and "locked:run_discovery" in str(exc):
                result[name] = {
                    "ok": True,
                    "status": "scheduled_run_in_progress",
                    "paid_ops": "none",
                    "lock_contended": True,
                }
            else:
                result[name] = {"ok": False, "error": type(exc).__name__}
        except Exception as exc:
            result[name] = {"ok": False, "error": type(exc).__name__}
    result["ok"] = all(value.get("ok", True) for value in result.values() if isinstance(value, dict))
    return result


def main() -> None:
    STATUS.parent.mkdir(parents=True, exist_ok=True)
    try:
        sync_error = sync_main()
    except Exception as exc:
        sync_error = f"sync:{exc.__class__.__name__}"
    # Load handlers after sync so a newly received request uses the updated code.
    from run import handle_bridge
    tick = autonomous_tick(sync_error)
    tick_path = REPO / "docs/ops/caesthetic-new-medspa-discovery/control/autonomous-runtime-latest.json"
    tick_path.parent.mkdir(parents=True, exist_ok=True)
    tick_path.write_text(json.dumps(tick, indent=2) + "\n")
    tick_published = commit_push([str(tick_path.relative_to(REPO))], "chore(caesthetic-medspa): runtime heartbeat [skip ci]")

    paths = sorted(REQUESTS.glob("*.json"))
    processed = 0
    recovered = 0
    push_failures = 0 if tick_published else 1
    last_id = None
    for path in paths:
        pending = terminal_local_result(path)
        if pending is not None:
            rid = request_id_for(path)
            last_id = rid
            if commit_push(
                [str(pending.relative_to(REPO))],
                f"chore(caesthetic-medspa): result {rid} [skip ci]",
            ):
                recovered += 1
            else:
                push_failures += 1
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
        if commit_push(
            [str(out.relative_to(REPO))],
            f"chore(caesthetic-medspa): result {rid} [skip ci]",
        ):
            processed += 1
        else:
            push_failures += 1
    STATUS.write_text(
        json.dumps(
            {
                "last_heartbeat_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "processed": processed,
                "recovered": recovered,
                "current_request_id": last_id,
                "next_poll": "cron */5",
                "sync_error": sync_error,
                "push_failures": push_failures,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "ok": push_failures == 0,
                "processed": processed,
                "recovered": recovered,
                "push_failures": push_failures,
                "last_id": last_id,
                "sync_error": sync_error,
            }
        )
    )


if __name__ == "__main__":
    main()
