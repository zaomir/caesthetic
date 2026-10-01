#!/usr/bin/env python3
"""Check package integrity, recovery behavior and recorded task journals."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / ".agent-execution"

def main():
    config = json.loads((PACKAGE / "config.json").read_text())
    if config.get("schema") != "agent-execution-install/1":
        raise ValueError("Unsupported installation")
    spec = importlib.util.spec_from_file_location("atomic_checkpoint", PACKAGE / "atomic_checkpoint.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    for name, expected in config["source_files_sha256"].items():
        if module.digest(PACKAGE / name) != expected:
            raise ValueError("Canonical copy drift: " + name)
    policy = {"max_iteration_seconds": 300, "max_work_units": 1,
              "max_poll_seconds": 60, "progress_interval_seconds": 60}
    if config["policy"] != policy:
        raise ValueError("Budget policy drift; explicit source upgrade required")
    subprocess.run([sys.executable, "-m", "unittest", "discover", "-s",
                    str(PACKAGE), "-p", "test_atomic_checkpoint.py", "-v"],
                   cwd=ROOT, check=True)
    count = 0
    for root in config["state_roots"]:
        for path in sorted((ROOT / root).rglob("*.checkpoint.json")):
            state = json.loads(path.read_text())
            module.check(state)
            if state["policy"] != policy:
                raise ValueError("Journal policy drift")
            count += 1
    print(json.dumps({"status": "pass", "journal_count": count,
                      "repository": config["repository"], "source_sha": config["source_sha"]}))

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "blocked", "reason": str(error)}))
        sys.exit(2)
