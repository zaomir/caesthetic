#!/usr/bin/env python3
"""Durable iteration journal. No external actions are executed by this CLI."""
import argparse
import contextlib
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from datetime import datetime, timezone

def now():
    return datetime.now(timezone.utc).isoformat()

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

@contextlib.contextmanager
def lock(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(str(path) + ".lock", "a") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        yield

def save(path, state):
    state["revision"] += 1
    state["updated_at"] = now()
    state["history"].append({"revision": state["revision"], "at": state["updated_at"],
                             "event": state.pop("_event"), "next_action": state["next_action"]})
    fd, temp = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w") as handle:
            json.dump(state, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, path)
        directory = os.open(path.parent, os.O_DIRECTORY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)

def evidence(path):
    # Store references/hashes only; caller supplies sanitized evidence.
    ref = Path(path)
    if not ref.is_file():
        raise ValueError("Evidence file missing")
    return {"path": str(ref), "sha256": digest(ref)}

def check(state):
    if state.get("schema") != "atomic-iteration/1":
        raise ValueError("Unsupported checkpoint schema")
    if not isinstance(state.get("revision"), int) or not state.get("next_action"):
        raise ValueError("Invalid checkpoint revision/next action")
    for event in state["history"]:
        if "evidence" in event and digest(event["evidence"]["path"]) != event["evidence"]["sha256"]:
            raise ValueError("Reconciliation evidence drift")
    for stage in state["verified"].values():
        for item in stage["evidence"]:
            if digest(item["path"]) != item["sha256"]:
                raise ValueError("Evidence drift: " + item["path"])

def operate(args):
    path = Path(args.state)
    with lock(path):
        if args.command == "init":
            if path.exists():
                state = json.loads(path.read_text())
                check(state)
                if state["task_id"] != args.task or state["base_sha"] != args.base_sha:
                    raise ValueError("Existing journal belongs to different task/base; resume it")
                return {"decision": "resume", "next_action": state["next_action"]}
            if not re.fullmatch(r"[0-9a-f]{40}", args.base_sha):
                raise ValueError("Full base SHA required")
            state = {"schema": "atomic-iteration/1", "task_id": args.task,
                     "base_sha": args.base_sha, "revision": 0, "updated_at": now(),
                     "next_action": args.next_action, "pending": None,
                     "verified": {}, "history": [], "policy": {
                         "max_iteration_seconds": 300, "max_work_units": 1,
                         "max_poll_seconds": 60, "progress_interval_seconds": 60}}
            state["_event"] = "initialized"
        else:
            state = json.loads(path.read_text())
            check(state)
            if args.command == "resume":
                return {"decision": "reconcile" if state["pending"] else "continue",
                        "task_id": state["task_id"], "revision": state["revision"],
                        "next_action": state["next_action"], "pending": state["pending"],
                        "verified_keys": list(state["verified"])}
            if args.revision != state["revision"]:
                raise ValueError("Revision conflict; read checkpoint before retry")
            if args.command == "begin":
                if args.key in state["verified"]:
                    if state["verified"][args.key]["input_sha256"] != args.input_sha256:
                        raise ValueError("Key reused with different inputs")
                    return {"decision": "skip_verified", "next_action": state["next_action"]}
                if state["pending"]:
                    raise ValueError("Pending action must be reconciled; no blind retry")
                if not re.fullmatch(r"[0-9a-f]{64}", args.input_sha256):
                    raise ValueError("Input SHA-256 required")
                state["pending"] = {"key": args.key, "action": args.action,
                                    "input_sha256": args.input_sha256,
                                    "started_at": now()}
                state["next_action"] = "reconcile:" + args.key
                state["_event"] = "began:" + args.key
            elif args.command == "verify":
                pending = state["pending"]
                if not pending or pending["key"] != args.key:
                    raise ValueError("Matching pending action required")
                items = [evidence(p) for p in args.evidence]
                state["verified"][args.key] = {**pending, "verified_at": now(),
                                               "evidence": items}
                state["pending"] = None
                state["next_action"] = args.next_action
                state["_event"] = "verified:" + args.key
            elif args.command == "retry":
                if not state["pending"] or state["pending"]["key"] != args.key:
                    raise ValueError("Matching pending action required")
                proof = evidence(args.no_effect_evidence)
                # This is a recorded assertion, not automated provider reconciliation.
                state["history"].append({"event": "reconciled_no_effect:" + args.key,
                                         "evidence": proof, "at": now()})
                state["pending"] = None
                state["next_action"] = args.next_action
                state["_event"] = "retry_ready:" + args.key
            elif args.command == "heartbeat":
                state["heartbeat_at"] = now()
                state["_event"] = "heartbeat"
        save(path, state)
        return {"decision": "saved", "revision": state["revision"],
                "next_action": state["next_action"]}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", required=True)
    sub = parser.add_subparsers(dest="command", required=True)
    init = sub.add_parser("init")
    init.add_argument("--task", required=True)
    init.add_argument("--base-sha", required=True)
    init.add_argument("--next-action", required=True)
    sub.add_parser("resume")
    for command in ("begin", "verify", "retry", "heartbeat"):
        child = sub.add_parser(command)
        child.add_argument("--revision", type=int, required=True)
        if command != "heartbeat":
            child.add_argument("--key", required=True)
        if command == "begin":
            child.add_argument("--action", required=True)
            child.add_argument("--input-sha256", required=True)
        if command == "verify":
            child.add_argument("--evidence", action="append", required=True)
        if command == "retry":
            child.add_argument("--no-effect-evidence", required=True)
        if command in ("verify", "retry"):
            child.add_argument("--next-action", required=True)
    try:
        print(json.dumps(operate(parser.parse_args()), ensure_ascii=False))
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        print(json.dumps({"decision": "blocked", "reason": str(error)}))
        sys.exit(2)

if __name__ == "__main__":
    main()
