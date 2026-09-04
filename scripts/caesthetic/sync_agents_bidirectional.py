#!/usr/bin/env python3
"""Bidirectional sync: zaomir/caesthetic ↔ grainee-v2 mapped trees (DEC-829).

Per-file rules (after pull both remotes):
  - identical content → skip
  - only on one side → copy to the other
  - both differ from last sync state → conflict:
      * protected paths → grainee wins
      * else newer mtime wins (ties → grainee)
  - only one side changed since last sync → that side wins

State: docs/projects/caesthetic/.agents-sync-state.json (mirrored into both trees).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent))
from expert_dental_mirror import MIRROR_DEST, sync_mirror

GRAINEE_DEFAULT = Path("/var/www/grainee-v2")
SAT_DEFAULT = Path("/var/www/caesthetic")
SAT_URL = os.environ.get(
    "CAESTHETIC_AGENTS_REPO_URL", "https://github.com/zaomir/caesthetic.git"
)

TREES = [
    "site-caesthetic",
    "docs/projects/caesthetic",
    "docs/caesthetic",
    "docs/audits/caesthetic",
    "scripts/caesthetic",
    "tests/caesthetic",
]

SSOT_GLOBS = [
    "docs/ssot/CAESTHETIC*.md",
]

EXTRA_FILES = [
    "agents/manifests/caesthetic.yaml",
    "docs/founder-notes/DEC-829.md",
    "docs/founder-notes/DEC-866_caesthetic-attributed-sales-performance-fee.md",
    "docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md",
    "docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md",
    "docs/projects/caesthetic/EXPERT_DENTAL_MIRROR.yml",
    "scripts/caesthetic/expert_dental_mirror.py",
    "deploy/systemd/caesthetic-repo-sync.service",
    "deploy/systemd/caesthetic-repo-sync.timer",
]

EXCLUDE_DIR_NAMES = {
    "node_modules",
    "dist",
    ".baseline",
    ".git",
    ".DS_Store",
    "__pycache__",
}
EXCLUDE_FILE_PREFIXES = (".env",)
EXCLUDE_FILE_SUFFIXES = (".pyc", ".pyo")
EXCLUDE_REL_PREFIXES = (
    "site-caesthetic/private/",
    "site-caesthetic/score/aurora-medspa-x7k9m2/",
    "site-caesthetic/score/aesthetemed-public-evidence-7c3e91b4a8f26d50/",
    "site-caesthetic/docs/website-studio/site-caesthetic-score-aesthetemed-public-evidence-7c3e91b4a8f26d50.md",
    "site-caesthetic/score/nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8/",
    "site-caesthetic/docs/website-studio/site-caesthetic-score-nohy-v-ruky-odesa-bf9f3b12aeeaf13915a0c5c8.md",
    "site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/",
    "site-caesthetic/score/prestige-ru-preview-20260901-a7f3d9/",
    "site-caesthetic/score/prestige-ru-manager-preview-20260901-b4c2e7/",
    "site-caesthetic/score/prestige-ru-pilot-520-20260901-c6d8e2/",
    "site-caesthetic/docs/website-studio/site-caesthetic-score-prestige-ru-pilot-520-20260901-c6d8e2.md",
    "docs/projects/caesthetic/operations/ig-growth/footage/",
    "docs/projects/caesthetic/operations/ig-growth/daily-growth-note/footage/",
    "docs/projects/caesthetic/clients/",
    "docs/projects/caesthetic/operations/growth-score-board.jsonl",
    "docs/projects/caesthetic/operations/ig-growth/editorial-story-card/_hex-mark-52.png",
)

SCORE_MIRROR_ALLOW_PREFIXES = (
    "site-caesthetic/score/catalog.json",
    "site-caesthetic/score/index.html",
    "site-caesthetic/score/demo-medical-aesthetics-search-gap/",
    "site-caesthetic/score/demo-injector-practice-booking-friction/",
    "site-caesthetic/score/demo-aesthetics-clinic-reputation-gap/",
    "site-caesthetic/score/demo-multi-location-growth-score/",
)

PROTECTED_PREFIXES = (
    "deploy/systemd/caesthetic-repo-sync.service",
    "deploy/systemd/caesthetic-repo-sync.timer",
    "site-caesthetic/",
    "docs/founder-notes/DEC-829.md",
    "docs/ssot/CAESTHETIC.md",
    "docs/ssot/CAESTHETIC_OUTBOUND_DOMAIN_STANDARD.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md",
    "docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md",
    "docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md",
    "docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md",
    "docs/projects/caesthetic/EXPERT_DENTAL_MIRROR.yml",
    "scripts/caesthetic/expert_dental_mirror.py",
    "docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md",
    "docs/caesthetic/growth_score_spec.md",
    "docs/caesthetic/competitive_decision_analysis.md",
    "docs/projects/caesthetic/ROUTER.md",
    "scripts/caesthetic/build-spoken-medspa-russian.mjs",
    "scripts/caesthetic/growth-score-report-template.mjs",
    "scripts/caesthetic/growth-score-select-focus.mjs",
    "scripts/caesthetic/growth-score-workflow.mjs",
    "scripts/caesthetic/multi-location-decision-view-model.mjs",
    "scripts/caesthetic/multi-location-growth-score-view-model.mjs",
    "scripts/caesthetic/multi-location-growth-score.mjs",
    "scripts/caesthetic/owner-brief-contract.mjs",
    "scripts/caesthetic/install-continuous-sync.sh",
    "scripts/caesthetic/publish-growth-score-control-plane.mjs",
    "scripts/caesthetic/publish-growth-score-deploy.sh",
    "scripts/caesthetic/render-growth-score.mjs",
    "scripts/caesthetic/score-pin-runtime.mjs",
    "scripts/caesthetic/sync_agents_bidirectional.py",
    "tests/caesthetic/growth-score-engine.test.mjs",
    "tests/caesthetic/growth-score-decision-views.test.mjs",
    "tests/caesthetic/growth-score-journey-graph.test.mjs",
    "tests/caesthetic/growth-score-renderer.test.mjs",
    "tests/caesthetic/report-design-directives.test.mjs",
    "tests/caesthetic/growth-score-publish-control-plane.test.mjs",
    "tests/caesthetic/growth-score-routing-catalog.test.mjs",
    "tests/caesthetic/growth-score-spec-canon.test.mjs",
    "tests/caesthetic/outbound-domain-identity.test.mjs",
    "tests/caesthetic/owner-brief-contract.test.mjs",
    "tests/caesthetic/spoken-medspa-russian.test.mjs",
    "tests/caesthetic/agents_sync_bidirectional_test.py",
    "tests/caesthetic/satellite-growth-score-authoring.test.py",
    "docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/reports/standalone.json",
    "docs/audits/caesthetic/growth-score/cases/spoken-medspa-snellville-2026/reports/standalone-ru.json",
    "scripts/caesthetic/asset-worker/poll.mjs",
    "scripts/caesthetic/asset-worker/repo-sync-worker.mjs",
    "scripts/caesthetic/caesthetic-repo-sync-contract.mjs",
    "scripts/caesthetic/continuous-sync-runner.sh",
)

STATE_REL = "docs/projects/caesthetic/.agents-sync-state.json"
MARKER_REL = "docs/projects/caesthetic/AGENTS_REPO_SYNC.md"
CONFLICTS_REL = "docs/projects/caesthetic/AGENTS_SYNC_CONFLICTS.md"


def run(cmd: List[str], cwd: Optional[Path] = None) -> None:
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def run_out(cmd: List[str], cwd: Optional[Path] = None) -> str:
    return subprocess.check_output(cmd, cwd=str(cwd) if cwd else None, text=True).strip()


def authority_for(repo: Path) -> Optional[Tuple[Path, str]]:
    grainee = os.environ.get("GRAINEE_ROOT")
    satellite = os.environ.get("CAESTHETIC_AGENTS_DIR")
    if grainee and repo.resolve() == Path(grainee).resolve():
        value = os.environ.get("CAESTHETIC_SYNC_GRAINEE_AUTHORITY_ROOT")
        remote = os.environ.get("CAESTHETIC_SYNC_GRAINEE_AUTHORITY_REMOTE", "origin")
        return (Path(value), remote) if value else None
    if satellite and repo.resolve() == Path(satellite).resolve():
        value = os.environ.get("CAESTHETIC_SYNC_SATELLITE_AUTHORITY_ROOT")
        remote = os.environ.get("CAESTHETIC_SYNC_SATELLITE_AUTHORITY_REMOTE", "origin")
        return (Path(value), remote) if value else None
    return None


def fetch_origin_main(repo: Path) -> None:
    authority_config = authority_for(repo)
    if not authority_config:
        run(["git", "fetch", "origin", "main", "-q"], cwd=repo)
        return
    authority, remote = authority_config
    run(["git", "fetch", remote, "main", "-q"], cwd=authority)
    authority_ref = f"refs/remotes/{remote}/main"
    run(["git", "fetch", "--no-tags", str(authority),
         f"+{authority_ref}:refs/remotes/origin/main", "-q"], cwd=repo)


def push_main(repo: Path) -> None:
    authority_config = authority_for(repo)
    if not authority_config:
        run(["git", "push", "origin", "main"], cwd=repo)
        return
    authority, remote = authority_config
    sha = run_out(["git", "rev-parse", "HEAD"], cwd=repo)
    run(["git", "fetch", "--no-tags", str(repo), sha, "-q"], cwd=authority)
    run(["git", "push", remote, f"{sha}:main"], cwd=authority)
    run(["git", "update-ref", "refs/remotes/origin/main", sha], cwd=repo)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _norm_rel(rel: str, is_dir: bool = False) -> str:
    out = rel.replace("\\", "/")
    if is_dir and out and not out.endswith("/"):
        out += "/"
    return out


def should_skip(rel: str, name: str, is_dir: bool) -> bool:
    if name in EXCLUDE_DIR_NAMES:
        return True
    if any(name.startswith(p) for p in EXCLUDE_FILE_PREFIXES):
        return True
    if any(name.endswith(p) for p in EXCLUDE_FILE_SUFFIXES):
        return True
    rel_n = _norm_rel(rel, is_dir)
    if rel_n.startswith("site-caesthetic/score/") and rel_n != "site-caesthetic/score/" and not any(
            rel_n == prefix or rel_n.startswith(prefix)
            for prefix in SCORE_MIRROR_ALLOW_PREFIXES
    ):
        return True
    for prefix in EXCLUDE_REL_PREFIXES:
        if rel_n == prefix or rel_n.startswith(prefix):
            return True
        if is_dir and rel_n.rstrip("/") == prefix.rstrip("/"):
            return True
    return False


def iter_files(root: Path, rel_root: str) -> Iterable[str]:
    base = root / rel_root
    if not base.exists():
        return
    if base.is_file():
        yield rel_root
        return
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [
            d
            for d in dirnames
            if not should_skip(
                str(Path(dirpath, d).relative_to(root)), d, True
            )
        ]
        for fn in filenames:
            full = Path(dirpath) / fn
            rel = str(full.relative_to(root))
            if should_skip(rel, fn, False):
                continue
            yield rel


def expand_ssot(root: Path) -> List[str]:
    out: List[str] = []
    ssot = root / "docs" / "ssot"
    if not ssot.is_dir():
        return out
    for p in sorted(ssot.glob("CAESTHETIC*.md")):
        rel = str(p.relative_to(root))
        if should_skip(rel, p.name, False):
            continue
        out.append(rel)
    return out


def collect_rels(root: Path) -> Set[str]:
    rels: Set[str] = set()
    for tree in TREES:
        for rel in iter_files(root, tree):
            rels.add(rel)
    for rel in expand_ssot(root):
        rels.add(rel)
    for rel in EXTRA_FILES:
        if (root / rel).is_file():
            rels.add(rel)
    return rels


def is_protected(rel: str) -> bool:
    for p in PROTECTED_PREFIXES:
        if p.endswith("/") and rel.startswith(p):
            return True
        if rel == p:
            return True
    return False


def load_state(path: Path) -> Dict[str, str]:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text())
        files = data.get("files") or {}
        return {str(k): str(v) for k, v in files.items()}
    except Exception:
        return {}


@dataclass
class Action:
    rel: str
    direction: str  # g2s | s2g
    reason: str
    operation: str = "copy"  # copy | delete


def decide(
    rel: str,
    g_path: Path,
    s_path: Path,
    last: Dict[str, str],
) -> Optional[Action]:
    g_exists = g_path.is_file()
    s_exists = s_path.is_file()

    if not g_exists and not s_exists:
        return None
    prev = last.get(rel)

    if g_exists and not s_exists:
        g_hash = sha256_file(g_path)
        if prev is None:
            return Action(rel, "g2s", "only_in_grainee")
        if is_protected(rel):
            return Action(rel, "g2s", "protected_satellite_deletion_refused")
        if g_hash == prev:
            return Action(rel, "s2g", "satellite_deleted", "delete")
        # Modification and deletion raced. Preserve the modified file. Protected
        # paths also remain grainee-authoritative.
        return Action(rel, "g2s", "conflict_grainee_modified_satellite_deleted")
    if s_exists and not g_exists:
        s_hash = sha256_file(s_path)
        if prev is None:
            return Action(rel, "s2g", "only_in_satellite")
        if s_hash == prev:
            return Action(rel, "g2s", "grainee_deleted", "delete")
        if is_protected(rel):
            return Action(rel, "g2s", "conflict_protected_grainee_deleted", "delete")
        # Preserve a concurrently modified satellite file over a deletion.
        return Action(rel, "s2g", "conflict_satellite_modified_grainee_deleted")

    g_hash = sha256_file(g_path)
    s_hash = sha256_file(s_path)
    if g_hash == s_hash:
        return None

    g_changed = prev is None or g_hash != prev
    s_changed = prev is None or s_hash != prev

    if prev is None:
        if is_protected(rel):
            return Action(rel, "g2s", "bootstrap_protected_grainee")
        g_m = g_path.stat().st_mtime
        s_m = s_path.stat().st_mtime
        if s_m > g_m:
            return Action(rel, "s2g", "bootstrap_newer_satellite")
        return Action(rel, "g2s", "bootstrap_newer_grainee")

    if g_changed and not s_changed:
        return Action(rel, "g2s", "grainee_changed")
    if s_changed and not g_changed:
        if is_protected(rel):
            return Action(rel, "g2s", "protected_satellite_change_refused")
        return Action(rel, "s2g", "satellite_changed")

    if is_protected(rel):
        return Action(rel, "g2s", "conflict_protected_grainee")
    g_m = g_path.stat().st_mtime
    s_m = s_path.stat().st_mtime
    if s_m > g_m:
        return Action(rel, "s2g", "conflict_newer_satellite")
    return Action(rel, "g2s", "conflict_newer_grainee")


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def delete_file(path: Path) -> None:
    if path.is_file() or path.is_symlink():
        path.unlink()


def sync_main_checkout(repo: Path) -> None:
    """Bring a clean local main to origin/main without discarding local commits."""
    fetch_origin_main(repo)
    run(["git", "checkout", "main"], cwd=repo)
    dirty = run_out(["git", "status", "--porcelain"], cwd=repo)
    if dirty:
        raise RuntimeError(f"dirty_checkout:{repo}")

    local = run_out(["git", "rev-parse", "HEAD"], cwd=repo)
    remote = run_out(["git", "rev-parse", "origin/main"], cwd=repo)
    if local == remote:
        return

    local_is_ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", local, remote], cwd=str(repo)
    ).returncode == 0
    if local_is_ancestor:
        run(["git", "merge", "--ff-only", "origin/main"], cwd=repo)
        return

    remote_is_ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", remote, local], cwd=str(repo)
    ).returncode == 0
    if remote_is_ancestor:
        # Preserve an earlier sync commit that was created locally but whose
        # push was interrupted. This remains a normal fast-forward push.
        push_main(repo)
        return

    # Both sides advanced. Rebase preserves local commits and obeys the repo's
    # no-force policy; any conflict aborts and leaves the timer failed/visible.
    try:
        run(["git", "rebase", "origin/main"], cwd=repo)
    except subprocess.CalledProcessError:
        subprocess.run(["git", "rebase", "--abort"], cwd=str(repo), check=False)
        raise RuntimeError(f"diverged_checkout_rebase_conflict:{repo}")


def ensure_satellite(sat: Path) -> None:
    if not (sat / ".git").is_dir():
        run(["git", "clone", SAT_URL, str(sat)])
    else:
        sync_main_checkout(sat)


def git_commit_push(repo: Path, message: str, paths: List[str], do_commit: bool, do_push: bool) -> None:
    if not do_commit:
        return
    # Keep tracked deleted paths in the pathspec: `git add -A -- <path>` is what
    # stages a propagated deletion. Ignore only paths that neither exist nor
    # have ever been tracked (for example the optional conflicts report).
    existing: List[str] = []
    for p in paths:
        tracked = subprocess.run(
            ["git", "ls-files", "--error-unmatch", "--", p],
            cwd=str(repo),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ).returncode == 0
        if (repo / p).exists() or tracked:
            existing.append(p)
    for extra in (STATE_REL, MARKER_REL, CONFLICTS_REL):
        if (repo / extra).exists() and extra not in existing:
            existing.append(extra)
    if not existing:
        print(f"[{repo.name}] nothing to add")
        return
    # Skip gitignored paths (e.g. leftover pycache) so add does not fail.
    addable: List[str] = []
    for p in existing:
        chk = subprocess.run(
            ["git", "check-ignore", "-q", "--", p],
            cwd=str(repo),
        )
        if chk.returncode == 0:
            continue
        addable.append(p)
    if not addable:
        print(f"[{repo.name}] nothing addable")
        return
    run(["git", "add", "-A", "--"] + addable, cwd=repo)
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=str(repo))
    if diff.returncode == 0:
        print(f"[{repo.name}] nothing staged")
        return
    name = run_out(["git", "log", "-1", "--format=%an"], cwd=repo) or "grainee-bot"
    email = run_out(["git", "log", "-1", "--format=%ae"], cwd=repo) or "bot@local"
    run(
        ["git", "-c", f"user.name={name}", "-c", f"user.email={email}", "commit", "-m", message],
        cwd=repo,
    )
    if do_push:
        push_main(repo)


def write_marker(grainee: Path, sat: Path, summary: str) -> None:
    g_sha = run_out(["git", "rev-parse", "HEAD"], cwd=grainee)
    s_sha = run_out(["git", "rev-parse", "HEAD"], cwd=sat)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    body = f"""# Agents repo sync marker

- **Mode:** bidirectional (DEC-829)
- **Grainee SHA (pre-commit):** `{g_sha}`
- **Satellite SHA (pre-commit):** `{s_sha}`
- **Synced at (UTC):** {now}
- **Script:** `scripts/caesthetic/sync-agents-bidirectional.sh`
- **Summary:** {summary}

Production deploy still ships only from grainee-v2.
"""
    path = grainee / MARKER_REL
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body)
    copy_file(path, sat / MARKER_REL)


def main() -> int:
    ap = argparse.ArgumentParser(description="Bidirectional CAESTHETIC Agents ↔ grainee sync")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--commit", action="store_true")
    ap.add_argument("--push", action="store_true")
    ap.add_argument("--grainee", type=Path, default=Path(os.environ.get("GRAINEE_ROOT", GRAINEE_DEFAULT)))
    ap.add_argument("--satellite", type=Path, default=Path(os.environ.get("CAESTHETIC_AGENTS_DIR", SAT_DEFAULT)))
    args = ap.parse_args()
    if args.push:
        args.commit = True

    grainee: Path = args.grainee.resolve()
    sat: Path = args.satellite.resolve()

    print("== Bidirectional CAESTHETIC Agents ↔ grainee sync ==")
    print(f"grainee:   {grainee}")
    print(f"satellite: {sat}")
    print(f"mode:      {'APPLY' if args.apply else 'DRY-RUN'}")

    sync_main_checkout(grainee)
    ensure_satellite(sat)

    last = load_state(grainee / STATE_REL)
    if not last and (sat / STATE_REL).is_file():
        last = load_state(sat / STATE_REL)

    rels = collect_rels(grainee) | collect_rels(sat)
    rels.discard(STATE_REL)
    rels.discard(MARKER_REL)

    actions: List[Action] = []
    conflicts: List[Action] = []
    for rel in sorted(rels):
        act = decide(rel, grainee / rel, sat / rel, last)
        if not act:
            continue
        actions.append(act)
        if act.reason.startswith("conflict_"):
            conflicts.append(act)

    g2s = [a for a in actions if a.direction == "g2s"]
    s2g = [a for a in actions if a.direction == "s2g"]
    print(f"planned: grainee→sat={len(g2s)} sat→grainee={len(s2g)} conflicts={len(conflicts)}")
    for a in actions[:50]:
        print(f"  {a.direction}\t{a.operation}\t{a.reason}\t{a.rel}")
    if len(actions) > 50:
        print(f"  ... +{len(actions) - 50} more")

    if not args.apply:
        mirror = sync_mirror(grainee, sat, run_out(["git", "rev-parse", "HEAD"], cwd=grainee), False)
        print(f"expert-mirror: files={mirror['files']} changed={len(mirror['changed'])} removed={len(mirror['removed'])}")
        print("DRY-RUN complete (no writes)")
        return 0

    for a in actions:
        if a.operation == "delete":
            target = sat / a.rel if a.direction == "g2s" else grainee / a.rel
            delete_file(target)
        elif a.direction == "g2s":
            copy_file(grainee / a.rel, sat / a.rel)
        else:
            copy_file(sat / a.rel, grainee / a.rel)

    new_state_files: Dict[str, str] = {}
    for rel in sorted(collect_rels(grainee) | collect_rels(sat)):
        if rel in (STATE_REL, MARKER_REL):
            continue
        g_p = grainee / rel
        s_p = sat / rel
        if g_p.is_file():
            new_state_files[rel] = sha256_file(g_p)
        elif s_p.is_file():
            new_state_files[rel] = sha256_file(s_p)

    state_obj = {
        "version": 1,
        "updated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "policy": "bidirectional_hash_lww_protected_grainee",
        "files": new_state_files,
    }
    state_path = grainee / STATE_REL
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state_obj, indent=2, sort_keys=True) + "\n")
    copy_file(state_path, sat / STATE_REL)

    if conflicts:
        lines = [
            "# Agents sync conflicts (auto-resolved)",
            "",
            f"UTC: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}",
            "",
            "| Rel | Winner | Reason |",
            "|-----|--------|--------|",
        ]
        for a in conflicts:
            winner = "grainee→satellite" if a.direction == "g2s" else "satellite→grainee"
            lines.append(f"| `{a.rel}` | {winner} | `{a.reason}` |")
        lines.append("")
        conf_path = grainee / CONFLICTS_REL
        conf_path.write_text("\n".join(lines) + "\n")
        copy_file(conf_path, sat / CONFLICTS_REL)

    mirror = sync_mirror(grainee, sat, run_out(["git", "rev-parse", "HEAD"], cwd=grainee), True)
    summary = f"g2s={len(g2s)} s2g={len(s2g)} conflicts={len(conflicts)} expert_mirror_changed={len(mirror['changed'])}"
    write_marker(grainee, sat, summary)

    mapped_files = sorted(
        (collect_rels(grainee) | collect_rels(sat))
        | {a.rel for a in actions}
        | {MIRROR_DEST}
        | {STATE_REL, MARKER_REL, CONFLICTS_REL}
    )

    if args.commit:
        git_commit_push(
            grainee,
            f"sync(caesthetic): bidirectional Agents↔grainee ({summary})",
            mapped_files,
            True,
            args.push,
        )
        git_commit_push(
            sat,
            f"sync(caesthetic): bidirectional Agents↔grainee ({summary})",
            mapped_files,
            True,
            args.push,
        )

    print(f"DONE {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
