import hashlib
import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts" / "caesthetic" / "sync_agents_bidirectional.py"
MANIFEST_PATH = ROOT / "docs" / "projects" / "caesthetic" / "SYNC_MANIFEST.yml"
SPEC = importlib.util.spec_from_file_location("caesthetic_repo_sync", MODULE_PATH)
SYNC = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = SYNC
SPEC.loader.exec_module(SYNC)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def manifest_list(key: str):
    values = []
    active = False
    for line in MANIFEST_PATH.read_text().splitlines():
        if active and line and not line[0].isspace():
            break
        if line == f"{key}:":
            active = True
            continue
        if active:
            stripped = line.strip()
            if stripped.startswith("- "):
                values.append(stripped[2:].strip().strip("\"'"))
    return values


def normalize_manifest_prefix(value: str) -> str:
    return value[:-2] if value.endswith("**") else value


class DecideDeletionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.g = root / "g"
        self.s = root / "s"
        self.g.mkdir()
        self.s.mkdir()

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, root: Path, rel: str, value: str):
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)

    def test_grainee_deletion_propagates(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.s, rel, "same")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("same")})
        self.assertEqual((action.direction, action.operation, action.reason),
                         ("g2s", "delete", "grainee_deleted"))

    def test_satellite_deletion_propagates(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.g, rel, "same")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("same")})
        self.assertEqual((action.direction, action.operation, action.reason),
                         ("s2g", "delete", "satellite_deleted"))

    def test_modification_wins_over_deletion(self):
        rel = "docs/caesthetic/example.md"
        self.write(self.s, rel, "new")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("old")})
        self.assertEqual((action.direction, action.operation), ("s2g", "copy"))

    def test_protected_grainee_deletion_wins(self):
        rel = "site-caesthetic/example.html"
        self.write(self.s, rel, "new")
        action = SYNC.decide(rel, self.g / rel, self.s / rel, {rel: digest("old")})
        self.assertEqual((action.direction, action.operation), ("g2s", "delete"))

    def test_commit_helper_stages_tracked_deletion_and_ignores_unknown_path(self):
        repo = Path(self.tmp.name) / "repo"
        repo.mkdir()
        subprocess.run(["git", "init", "-b", "main"], cwd=repo, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
        tracked = repo / "docs" / "caesthetic" / "deleted.md"
        tracked.parent.mkdir(parents=True)
        tracked.write_text("old")
        subprocess.run(["git", "add", "."], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-m", "seed"], cwd=repo, check=True,
                       stdout=subprocess.DEVNULL)
        tracked.unlink()

        SYNC.git_commit_push(
            repo,
            "sync deletion",
            ["docs/caesthetic/deleted.md", "optional-never-created.md"],
            True,
            False,
        )

        self.assertEqual(
            subprocess.check_output(["git", "show", "--format=", "--name-status", "HEAD"],
                                    cwd=repo, text=True).strip(),
            "D\tdocs/caesthetic/deleted.md",
        )

    def test_canonical_sop_is_mirrored_and_grainee_protected(self):
        for rel in (
            "docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md",
            "docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md",
            "docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md",
        ):
            self.write(self.g, rel, "canonical")
            self.assertIn(rel, SYNC.collect_rels(self.g))
            self.assertTrue(SYNC.is_protected(rel))

    def test_systemd_units_are_in_mirror_contract(self):
        for rel in (
            "deploy/systemd/caesthetic-repo-sync.service",
            "deploy/systemd/caesthetic-repo-sync.timer",
        ):
            self.write(self.g, rel, "unit")
            self.assertIn(rel, SYNC.collect_rels(self.g))
        service = (ROOT / "deploy" / "systemd" / "caesthetic-repo-sync.service").read_text()
        self.assertIn("ReadWritePaths=/var/lib/caesthetic-repo-sync", service)
        self.assertIn("/var/www/caesthetic.com", service)
        self.assertNotIn("ReadWritePaths=/var/www ", service)

    def test_sync_tool_contract_matches_manifest(self):
        self.assertEqual(SYNC.TREES, manifest_list("trees"))
        self.assertEqual(SYNC.SSOT_GLOBS, manifest_list("ssot_globs"))
        self.assertEqual(SYNC.EXTRA_FILES, manifest_list("extra_files"))

        manifest_path_excludes = [
            normalize_manifest_prefix(value)
            for value in manifest_list("excludes")
            if "/" in value
        ]
        self.assertEqual(list(SYNC.EXCLUDE_REL_PREFIXES), manifest_path_excludes)

        manifest_name_excludes = {
            value for value in manifest_list("excludes") if "/" not in value
        }
        self.assertEqual(
            manifest_name_excludes,
            set(SYNC.EXCLUDE_DIR_NAMES) | {".env", ".env.*", "*.pyc", "*.pyo"},
        )
        self.assertEqual(SYNC.EXCLUDE_FILE_PREFIXES, (".env",))
        self.assertEqual(SYNC.EXCLUDE_FILE_SUFFIXES, (".pyc", ".pyo"))

        protected = [
            normalize_manifest_prefix(value)
            for value in manifest_list("protected_in_target")
        ]
        self.assertEqual(list(SYNC.PROTECTED_PREFIXES), protected)

    def test_retired_cron_installer_routes_to_continuous_timer(self):
        wrapper = (ROOT / "scripts" / "caesthetic" / "install-agents-sync-cron.sh").read_text()
        self.assertIn("install-continuous-sync.sh", wrapper)
        self.assertIn("exec bash", wrapper)
        self.assertNotIn("deploy/cron.d/caesthetic-agents-sync", wrapper)
        self.assertNotIn("install -m 644", wrapper)

    def test_installer_uses_isolated_checkouts(self):
        installer = (ROOT / "scripts" / "caesthetic" / "install-continuous-sync.sh").read_text()
        timer = (ROOT / "deploy" / "systemd" / "caesthetic-repo-sync.timer").read_text()
        self.assertIn("$DATA_ROOT/grainee", installer)
        self.assertIn("$DATA_ROOT/satellite", installer)
        self.assertIn("git clone --shared --no-checkout", installer)
        self.assertIn("sparse-checkout set", installer)
        self.assertNotIn("copy_git_auth_config", installer)
        self.assertIn('git clone --shared --no-checkout "$authority_repo"', installer)
        self.assertIn("checkout -B main refs/remotes/origin/main", installer)
        self.assertIn("push --dry-run", installer)
        self.assertIn("CAESTHETIC_SYNC_SATELLITE_AUTHORITY_REMOTE", installer)
        self.assertIn("CAESTHETIC_REPO_SYNC_QUARANTINED", installer)
        self.assertIn("timeout 30s systemctl stop caesthetic-repo-sync.service", installer)
        self.assertIn("systemctl reset-failed caesthetic-repo-sync.service", installer)
        self.assertIn("systemctl start --no-block caesthetic-repo-sync.service", installer)
        self.assertNotIn("sync_terminal", installer)
        self.assertIn("OnCalendar=*-*-* *:*:00,15,30,45", timer)
        self.assertNotIn("OnUnitActiveSec", timer)
        self.assertNotIn("OnUnitInactiveSec", timer)


    def test_runner_skips_full_reconcile_when_remote_heads_are_unchanged(self):
        root = Path(self.tmp.name)
        bare_g = root / "g.git"
        bare_s = root / "s.git"
        work_g = root / "work-g"
        install_root = root / "install"
        install_root.mkdir()
        for bare in (bare_g, bare_s):
            subprocess.run(["git", "init", "--bare", "--initial-branch=main", str(bare)],
                           check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "clone", str(bare_g), str(work_g)], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=work_g, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=work_g, check=True)
        (work_g / "seed").write_text("g")
        subprocess.run(["git", "add", "."], cwd=work_g, check=True)
        subprocess.run(["git", "commit", "-m", "seed"], cwd=work_g, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "push", "origin", "main"], cwd=work_g, check=True,
                       stdout=subprocess.DEVNULL)
        seed_s = root / "seed-s"
        subprocess.run(["git", "clone", str(bare_s), str(seed_s)], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=seed_s, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=seed_s, check=True)
        (seed_s / "seed").write_text("s")
        subprocess.run(["git", "add", "."], cwd=seed_s, check=True)
        subprocess.run(["git", "commit", "-m", "seed"], cwd=seed_s, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "push", "origin", "main"], cwd=seed_s, check=True,
                       stdout=subprocess.DEVNULL)

        calls = root / "calls"
        fake = install_root / "sync_agents_bidirectional.py"
        fake.write_text(f"from pathlib import Path\nPath({str(calls)!r}).write_text('called')\n")
        test_bin = root / "bin"
        test_bin.mkdir()
        fake_flock = test_bin / "flock"
        fake_flock.write_text(
            "#!/bin/sh\n"
            "[ \"$1\" = \"-n\" ] && shift\n"
            "shift\n"
            "exec \"$@\"\n"
        )
        fake_flock.chmod(0o755)
        env = {
            **dict(__import__("os").environ),
            "PATH": f"{test_bin}:{__import__('os').environ.get('PATH', '')}",
            "CAESTHETIC_SYNC_INSTALL_ROOT": str(install_root),
            "GRAINEE_ROOT": str(work_g),
            "CAESTHETIC_AGENTS_DIR": str(root / "satellite"),
            "CAESTHETIC_AGENTS_REPO_URL": str(bare_s),
            "CAESTHETIC_SYNC_LOCK": str(root / "lock"),
            "CAESTHETIC_SYNC_REMOTE_STATE": str(root / "remote-heads"),
        }
        runner = ROOT / "scripts" / "caesthetic" / "continuous-sync-runner.sh"
        first = subprocess.run(["bash", str(runner)], env=env, check=True,
                               capture_output=True, text=True)
        self.assertIn("CAESTHETIC_REPO_SYNC_APPLIED", first.stdout)
        calls.unlink()
        second = subprocess.run(["bash", str(runner)], env=env, check=True,
                                capture_output=True, text=True)
        self.assertIn("CAESTHETIC_REPO_SYNC_IDLE", second.stdout)
        self.assertFalse(calls.exists())

        Path(env["CAESTHETIC_SYNC_REMOTE_STATE"]).unlink()
        fake.write_text("raise SystemExit(7)\n")
        failed = subprocess.run(["bash", str(runner)], env=env,
                                capture_output=True, text=True)
        self.assertEqual(failed.returncode, 7)
        self.assertNotIn("CAESTHETIC_REPO_SYNC_APPLIED", failed.stdout)
        self.assertFalse(Path(env["CAESTHETIC_SYNC_REMOTE_STATE"]).exists())

    def test_sync_main_checkout_fast_forwards_then_pushes_local_ahead(self):
        root = Path(self.tmp.name)
        bare = root / "remote.git"
        a = root / "a"
        b = root / "b"
        subprocess.run(["git", "init", "--bare", "--initial-branch=main", str(bare)],
                       check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "clone", str(bare), str(a)], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for repo in (a,):
            subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo,
                           check=True)
        (a / "history").write_text("one\n")
        subprocess.run(["git", "add", "."], cwd=a, check=True)
        subprocess.run(["git", "commit", "-m", "one"], cwd=a, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "push", "origin", "main"], cwd=a, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "clone", str(bare), str(b)], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=b, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=b,
                       check=True)
        (b / "history").write_text("one\ntwo\n")
        subprocess.run(["git", "add", "."], cwd=b, check=True)
        subprocess.run(["git", "commit", "-m", "two"], cwd=b, check=True,
                       stdout=subprocess.DEVNULL)
        subprocess.run(["git", "push", "origin", "main"], cwd=b, check=True,
                       stdout=subprocess.DEVNULL)

        SYNC.sync_main_checkout(a)
        self.assertEqual((a / "history").read_text(), "one\ntwo\n")
        (a / "local").write_text("preserve")
        subprocess.run(["git", "add", "."], cwd=a, check=True)
        subprocess.run(["git", "commit", "-m", "local"], cwd=a, check=True,
                       stdout=subprocess.DEVNULL)
        SYNC.sync_main_checkout(a)
        local = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=a,
                                        text=True).strip()
        remote = subprocess.check_output(["git", "ls-remote", str(bare),
                                          "refs/heads/main"], text=True).split()[0]
        self.assertEqual(local, remote)

    def test_isolated_commit_pushes_through_existing_authority_checkout(self):
        root = Path(self.tmp.name)
        bare = root / "authority-remote.git"
        authority = root / "authority"
        isolated = root / "isolated"
        subprocess.run(["git", "init", "--bare", "--initial-branch=main", str(bare)], check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "clone", str(bare), str(authority)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=authority, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=authority, check=True)
        (authority / "seed").write_text("one\n")
        subprocess.run(["git", "add", "."], cwd=authority, check=True)
        subprocess.run(["git", "commit", "-m", "seed"], cwd=authority, check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "push", "origin", "main"], cwd=authority, check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "clone", str(bare), str(isolated)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=isolated, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=isolated, check=True)
        (isolated / "isolated-change").write_text("two\n")
        subprocess.run(["git", "add", "."], cwd=isolated, check=True)
        subprocess.run(["git", "commit", "-m", "isolated"], cwd=isolated, check=True, stdout=subprocess.DEVNULL)
        keys = ("GRAINEE_ROOT", "CAESTHETIC_SYNC_GRAINEE_AUTHORITY_ROOT", "CAESTHETIC_SYNC_GRAINEE_AUTHORITY_REMOTE")
        old = {key: os.environ.get(key) for key in keys}
        try:
            os.environ["GRAINEE_ROOT"] = str(isolated)
            os.environ["CAESTHETIC_SYNC_GRAINEE_AUTHORITY_ROOT"] = str(authority)
            os.environ["CAESTHETIC_SYNC_GRAINEE_AUTHORITY_REMOTE"] = "origin"
            SYNC.push_main(isolated)
        finally:
            for key, value in old.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value
        remote = subprocess.check_output(["git", "ls-remote", str(bare), "refs/heads/main"], text=True).split()[0]
        self.assertEqual(remote, subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=isolated, text=True).strip())


if __name__ == "__main__":
    unittest.main()
