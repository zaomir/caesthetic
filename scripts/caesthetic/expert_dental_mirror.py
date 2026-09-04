#!/usr/bin/env python3
"""One-way generated Expert Dental knowledge mirror: grainee-v2 -> caesthetic.

This is deliberately separate from DEC-829's bidirectional CAESTHETIC trees.
Nothing under MIRROR_DEST is ever copied back to grainee-v2.
"""
from __future__ import annotations

import hashlib
import argparse
import json
import shutil
from pathlib import Path
from typing import Iterable

MIRROR_DEST = "docs/external/grainee-v2/expert-dental"
SOURCE_FILES = (
    "AGENTS.md",
    "START.md",
    "agents/manifests/healthcare-ecosystem.yaml",
    "agents/manifests/raimovdental.yaml",
    ".github/workflows/deploy-expert-esign-test.yml",
    ".github/workflows/record-expert-esign-deploy.yml",
    "scripts/raimov/deploy-expert-esign-test.sh",
)
SOURCE_TREES = (
    "docs/projects/healthcare-ecosystem",
    "docs/projects/raimovdental",
    "docs/raimov",
    "docs/legal/raimov/expert-dental",
    "apps/expert-esign",
)
SSOT_GLOBS = (
    "RAIMOV*.md",
    "EXPERT_DENTAL*.md",
    "ELITE_DENTAL*.md",
)
FORBIDDEN_PARTS = {
    ".env", "secrets", "private", "patients", "patient-records", "raw-recordings",
    "recordings", "credentials", "credentials-archive", "media", "node_modules", "dist", "__pycache__",
}
FORBIDDEN_SUFFIXES = {
    ".zip", ".docx", ".pdf", ".mp3", ".wav", ".mp4", ".mov",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".tif", ".tiff",
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def is_allowed(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    lowered = {part.lower() for part in rel.parts}
    if lowered & FORBIDDEN_PARTS:
        return False
    if path.suffix.lower() in FORBIDDEN_SUFFIXES:
        return False
    if path.name.startswith(".env") or path.is_symlink():
        return False
    return path.is_file()


def collect_source_files(grainee: Path) -> list[str]:
    rels: set[str] = set()
    for rel in SOURCE_FILES:
        path = grainee / rel
        if path.exists() and is_allowed(path, grainee):
            rels.add(rel)
    for tree in SOURCE_TREES:
        base = grainee / tree
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if is_allowed(path, grainee):
                rels.add(path.relative_to(grainee).as_posix())
    ssot = grainee / "docs/ssot"
    for pattern in SSOT_GLOBS:
        for path in ssot.glob(pattern):
            if is_allowed(path, grainee):
                rels.add(path.relative_to(grainee).as_posix())
    return sorted(rels)


def manifest(grainee: Path, rels: Iterable[str], source_sha: str) -> dict:
    files = {rel: sha256_file(grainee / rel) for rel in rels}
    return {
        "schema": "caesthetic.expert-dental-read-through-mirror.v1",
        "authority": "zaomir/grainee-v2 main",
        "source_sha": source_sha,
        "direction": "grainee-v2-to-caesthetic-only",
        "writeback": "forbidden; use docs/projects/caesthetic/expert-dental-contributions/",
        "files": files,
    }


def sync_mirror(grainee: Path, satellite: Path, source_sha: str, apply: bool) -> dict:
    rels = collect_source_files(grainee)
    expected = manifest(grainee, rels, source_sha)
    destination = satellite / MIRROR_DEST
    current_files = set()
    if destination.exists():
        current_files = {
            path.relative_to(destination).as_posix()
            for path in destination.rglob("*") if path.is_file() and path.name != ".mirror-manifest.json"
        }
    changed = []
    for rel in rels:
        target = destination / rel
        if not target.is_file() or sha256_file(target) != expected["files"][rel]:
            changed.append(rel)
            if apply:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(grainee / rel, target)
    removed = sorted(current_files - set(rels))
    if apply:
        for rel in removed:
            (destination / rel).unlink()
        destination.mkdir(parents=True, exist_ok=True)
        (destination / ".mirror-manifest.json").write_text(json.dumps(expected, indent=2, sort_keys=True) + "\n")
    return {"files": len(rels), "changed": changed, "removed": removed, "manifest": expected}


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate one-way Expert Dental reference mirror")
    parser.add_argument("--grainee", type=Path, required=True)
    parser.add_argument("--satellite", type=Path, required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    result = sync_mirror(args.grainee.resolve(), args.satellite.resolve(), args.source_sha, args.apply)
    print(f"EXPERT_DENTAL_MIRROR files={result['files']} changed={len(result['changed'])} removed={len(result['removed'])} apply={args.apply}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
