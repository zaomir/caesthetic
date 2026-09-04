#!/usr/bin/env python3
"""Hybrid Expert Dental knowledge mirror between grainee-v2 and caesthetic.

Allowlisted non-PHI project documents can write back to their same relative
paths in grainee-v2. Legal, runtime, SSOT, deploy and agent routing remain
one-way from the grainee-v2 authority. This stays separate from DEC-829's
bidirectional CAESTHETIC trees.
"""
from __future__ import annotations

import hashlib
import argparse
import json
import re
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
WRITEBACK_TREES = (
    "docs/projects/healthcare-ecosystem",
    "docs/projects/raimovdental",
    "docs/raimov",
)
WRITEBACK_SUFFIXES = {".md", ".json", ".jsonl", ".yaml", ".yml", ".txt", ".csv", ".tsv"}
PROTECTED_FILENAMES = {"AGENTS.md", "START.md"}
FORBIDDEN_PARTS = {
    ".env", "secrets", "private", "patients", "patient-records", "raw-recordings",
    "recordings", "credentials", "credentials-archive", "media", "node_modules", "dist", "__pycache__",
}
SECRET_PATTERNS = (
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"\b(?:ghp|github_pat|sk_live|sk_test)_[A-Za-z0-9_-]{12,}"),
    re.compile(
        r"(?im)^\s*(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*"
        r"(?!<|\$\{|REDACTED|PLACEHOLDER|EXAMPLE)[\"']?[A-Za-z0-9_./+=-]{12,}"
    ),
)


class MirrorAuthorityError(RuntimeError):
    """Raised when a protected or conflicting mirror edit would cross authority."""
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


def is_writeback_allowed(rel: str) -> bool:
    path = Path(rel)
    if path.name in PROTECTED_FILENAMES or path.suffix.lower() not in WRITEBACK_SUFFIXES:
        return False
    lowered = {part.lower() for part in path.parts}
    if lowered & FORBIDDEN_PARTS:
        return False
    return any(rel == tree or rel.startswith(f"{tree}/") for tree in WRITEBACK_TREES)


def is_safe_writeback(path: Path, rel: str) -> bool:
    if not is_writeback_allowed(rel) or not path.is_file() or path.stat().st_size > 2 * 1024 * 1024:
        return False
    try:
        body = path.read_text()
    except UnicodeDecodeError:
        return False
    return not any(pattern.search(body) for pattern in SECRET_PATTERNS)


def optional_sha256(path: Path) -> str | None:
    return sha256_file(path) if path.is_file() else None


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
        "schema": "caesthetic.expert-dental-hybrid-mirror.v2",
        "authority": "zaomir/grainee-v2 main",
        "source_sha": source_sha,
        "direction": "hybrid-bidirectional-allowlisted",
        "writeback": {
            "allowed_trees": list(WRITEBACK_TREES),
            "authority_after_sync": "zaomir/grainee-v2 main",
            "protected": "legal, runtime, SSOT, deploy, agent routing, PHI, secrets and private evidence",
        },
        "files": files,
    }


def sync_mirror(grainee: Path, satellite: Path, source_sha: str, apply: bool) -> dict:
    destination = satellite / MIRROR_DEST
    manifest_path = destination / ".mirror-manifest.json"
    current_manifest = {}
    if manifest_path.is_file():
        try:
            current_manifest = json.loads(manifest_path.read_text())
        except (json.JSONDecodeError, OSError):
            current_manifest = {}
    base_files = current_manifest.get("files", {}) if isinstance(current_manifest.get("files"), dict) else {}

    source_rels = set(collect_source_files(grainee))
    current_files: set[str] = set()
    if destination.exists():
        current_files = {
            path.relative_to(destination).as_posix()
            for path in destination.rglob("*") if path.is_file() and path.name != ".mirror-manifest.json"
        }

    writeback_changed: list[str] = []
    writeback_removed: list[str] = []
    conflicts: list[str] = []
    authority_violations: list[str] = []
    has_manifest = bool(base_files)
    for rel in sorted(source_rels | current_files | set(base_files)):
        source = grainee / rel
        target = destination / rel
        source_hash = optional_sha256(source)
        target_hash = optional_sha256(target)
        base_hash = base_files.get(rel)
        allowed = is_writeback_allowed(rel)

        if base_hash is None:
            if source_hash is not None and target_hash is not None and source_hash != target_hash and has_manifest:
                (conflicts if allowed else authority_violations).append(rel)
            elif source_hash is None and target_hash is not None:
                if allowed and is_safe_writeback(target, rel):
                    writeback_changed.append(rel)
                elif allowed:
                    authority_violations.append(f"{rel}:unsafe_writeback")
                elif has_manifest:
                    authority_violations.append(rel)
            continue

        source_changed = source_hash != base_hash
        target_changed = target_hash != base_hash
        if allowed:
            if source_changed and target_changed and source_hash != target_hash:
                conflicts.append(rel)
            elif target_changed and not source_changed:
                if target_hash is None:
                    writeback_removed.append(rel)
                elif is_safe_writeback(target, rel):
                    writeback_changed.append(rel)
                else:
                    authority_violations.append(f"{rel}:unsafe_writeback")
        elif target_changed and (not source_changed or source_hash != target_hash):
            authority_violations.append(rel)

    if conflicts or authority_violations:
        return {
            "files": len(source_rels),
            "changed": [],
            "removed": [],
            "writeback_changed": writeback_changed,
            "writeback_removed": writeback_removed,
            "conflicts": conflicts,
            "authority_violations": authority_violations,
            "manifest": current_manifest,
        }

    if apply:
        for rel in writeback_changed:
            source = grainee / rel
            source.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(destination / rel, source)
        for rel in writeback_removed:
            source = grainee / rel
            if source.is_file():
                source.unlink()

    rels = collect_source_files(grainee)
    expected = manifest(grainee, rels, source_sha)
    changed = []
    reverse_planned = set(writeback_changed) | set(writeback_removed)
    for rel in rels:
        if not apply and rel in reverse_planned:
            continue
        target = destination / rel
        if not target.is_file() or sha256_file(target) != expected["files"][rel]:
            changed.append(rel)
            if apply:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(grainee / rel, target)
    removed = sorted((current_files - set(rels)) - (set(writeback_changed) if not apply else set()))
    if apply:
        for rel in removed:
            (destination / rel).unlink()
        destination.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(expected, indent=2, sort_keys=True) + "\n")
    return {
        "files": len(rels),
        "changed": changed,
        "removed": removed,
        "writeback_changed": writeback_changed,
        "writeback_removed": writeback_removed,
        "conflicts": [],
        "authority_violations": [],
        "manifest": expected,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate one-way Expert Dental reference mirror")
    parser.add_argument("--grainee", type=Path, required=True)
    parser.add_argument("--satellite", type=Path, required=True)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    result = sync_mirror(args.grainee.resolve(), args.satellite.resolve(), args.source_sha, args.apply)
    print(
        "EXPERT_DENTAL_MIRROR "
        f"files={result['files']} changed={len(result['changed'])} removed={len(result['removed'])} "
        f"writeback={len(result['writeback_changed'])} writeback_removed={len(result['writeback_removed'])} "
        f"conflicts={len(result['conflicts'])} authority_violations={len(result['authority_violations'])} "
        f"apply={args.apply}"
    )
    if result["conflicts"] or result["authority_violations"]:
        raise MirrorAuthorityError(
            f"mirror sync blocked; conflicts={result['conflicts']} "
            f"authority_violations={result['authority_violations']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
