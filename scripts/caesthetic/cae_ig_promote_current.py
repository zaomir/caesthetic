#!/usr/bin/env python3
"""Fail-closed CAESTHETIC Instagram CURRENT writer.

Dropbox's ``update`` upload mode is a compare-and-swap on the file revision.
Consequently a writer that read an older CURRENT cannot overwrite a newer one.
The checked-in policy is an additional release gate: changing the protected
release requires review in Git; historical-only releases can never be promoted.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable


HERE = Path(__file__).resolve().parent
DEFAULT_POLICY = HERE / "cae_ig_current_policy.json"


class CurrentConflict(RuntimeError):
    """The pointer changed after this writer read it."""


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def validate_candidate(candidate: dict[str, Any], policy: dict[str, Any]) -> None:
    release_id = candidate.get("release_id")
    protected = policy.get("protected_release_id")
    if not isinstance(release_id, str) or not release_id:
        raise ValueError("candidate release_id is required")
    for pattern in policy.get("historical_only_release_patterns", []):
        if re.search(pattern, release_id):
            raise ValueError(f"release {release_id} is historical-only")
    if release_id != protected:
        raise ValueError(
            f"release {release_id} is not protected CURRENT {protected}; "
            "update the reviewed policy before promotion"
        )
    required_execution = policy.get("required_execution_allowed")
    if candidate.get("execution_allowed") is not required_execution:
        raise ValueError(f"execution_allowed must be {required_execution!r}")
    canonical = candidate.get("canonical_master")
    expected_fragment = f"/releases/{release_id}/canonical_master.csv"
    if not isinstance(canonical, str) or not canonical.endswith(expected_fragment):
        raise ValueError("canonical_master must be immutable and match release_id")


def guarded_promote(
    candidate: dict[str, Any],
    policy: dict[str, Any],
    fetch: Callable[[str], tuple[dict[str, Any], str]],
    upload_update: Callable[[str, bytes, str], None],
    expected_release: str,
) -> str:
    """Validate, read CURRENT, then conditionally replace its exact revision."""
    validate_candidate(candidate, policy)
    pointer = policy["current_pointer"]
    current, revision = fetch(pointer)
    actual_release = current.get("release_id")
    if actual_release != expected_release:
        raise CurrentConflict(
            f"STALE_RELEASE: expected CURRENT {expected_release}, found {actual_release}"
        )
    body = (json.dumps(candidate, indent=2, sort_keys=True) + "\n").encode("utf-8")
    upload_update(pointer, body, revision)
    return revision


class DropboxTransport:
    def __init__(self, token: str):
        if not token:
            raise ValueError("DROPBOX_ACCESS_TOKEN is required")
        self.token = token

    def fetch(self, path: str) -> tuple[dict[str, Any], str]:
        request = urllib.request.Request(
            "https://content.dropboxapi.com/2/files/download",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Dropbox-API-Arg": json.dumps({"path": path}),
            },
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            metadata = json.loads(response.headers["Dropbox-API-Result"])
            current = json.loads(response.read().decode("utf-8"))
        return current, metadata["rev"]

    def upload_update(self, path: str, body: bytes, revision: str) -> None:
        request = urllib.request.Request(
            "https://content.dropboxapi.com/2/files/upload",
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": json.dumps(
                    {
                        "path": path,
                        "mode": {".tag": "update", "update": revision},
                        "autorename": False,
                        "mute": True,
                        "strict_conflict": True,
                    }
                ),
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=30):
                return
        except urllib.error.HTTPError as exc:
            if exc.code == 409:
                raise CurrentConflict("CURRENT_CONFLICT: Dropbox revision changed") from exc
            raise


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate", type=Path, required=True)
    parser.add_argument("--expected-current-release", required=True)
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    try:
        policy = load_json(args.policy)
        candidate = load_json(args.candidate)
        transport = DropboxTransport(os.environ.get("DROPBOX_ACCESS_TOKEN", ""))
        guarded_promote(
            candidate,
            policy,
            transport.fetch,
            transport.upload_update,
            args.expected_current_release,
        )
    except (CurrentConflict, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 3
    print(json.dumps({"status": "success", "release_id": candidate["release_id"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
