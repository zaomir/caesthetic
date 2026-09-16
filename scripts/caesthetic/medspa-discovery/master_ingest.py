"""Stage verified source files through the existing canonical company ingest.

No arbitrary path or command is accepted from Agent API requests. Masters are
never created when absent. Source identity conflicts stay excluded.
"""
import contextlib
import csv
import hashlib
import importlib.util
import io
import json
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from company_resolution import CompanyResolver, text
from niches import source_category_allowed


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def name_key(value):
    return "".join(c for c in unicodedata.normalize("NFKC", text(value)) if c.isalnum())


def package_rows(rows, public_rows):
    blockers = {}
    for row in public_rows:
        reason = row.get("blocker")
        if reason and reason != "paid_csv_not_on_vds":
            blockers[name_key(row.get("name"))] = reason
    selected, skipped = {}, {}
    for row in rows:
        pid, name = row.get("place_id", "").strip(), row.get("name", "").strip()
        reason = blockers.get(name_key(name))
        if not reason and (not pid or not name or not row.get("city") or row.get("country_code") != "US"):
            reason = "missing_source_identity"
        if not reason and not source_category_allowed(row.get("category")):
            reason = "source_category_out_of_scope"
        if reason:
            skipped[reason] = skipped.get(reason, 0) + 1
            continue
        item = {"company_name": name, "city": row["city"], "country": "US",
                "phone": row.get("phone", ""), "category": str(row["category"]).strip(),
                "website": row.get("website", ""),
                "map_url": "https://www.google.com/maps/search/?api=1&query=Business&query_place_id=" + pid,
                "tags": "CAESTHETIC discovery,not_send_ready",
                "do_not_contact": "false",
                "notes": "Outscraper source identity; recipient ownership and narrative clearance pending"}
        if pid in selected:
            # The same business can occur in several category queries. Keep
            # its original source category; reject identity conflicts only.
            if any(selected[pid][key] != item[key] for key in item if key != "category"):
                raise ValueError("source_identity_conflict")
            continue
        selected[pid] = item
    return list(selected.values()), skipped


def discovery_source_rows(store, run_id):
    """Read only completed worker runs and verify every private raw file hash."""
    import re
    if not isinstance(run_id, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,180}", run_id):
        raise ValueError("invalid_discovery_run_id")
    receipt_path = store / "run-results" / (hashlib.sha256(run_id.encode()).hexdigest() + ".json")
    receipt = json.loads(receipt_path.read_text())
    if receipt.get("run_id") != run_id or receipt.get("status") != "success" or receipt.get("dry_run"):
        raise ValueError("discovery_run_not_completed")
    rows = []
    for market in receipt.get("markets_attempted") or []:
        market_id = market.get("id")
        if not isinstance(market_id, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", market_id):
            raise ValueError("invalid_discovery_market_id")
        path = store / "raw" / run_id / (market_id + ".json")
        if not market.get("raw_sha256") or digest(path) != market["raw_sha256"]:
            raise ValueError("discovery_raw_hash_mismatch")
        raw = json.loads(path.read_text())
        if not isinstance(raw.get("rows"), list):
            raise ValueError("discovery_raw_schema_invalid")
        for source in raw["rows"]:
            row = dict(source)
            row["category"] = source.get("category") or source.get("type") or ""
            row["website"] = source.get("website") or source.get("site") or ""
            # Country is fixed by the authenticated collector's US-only query.
            # A contradictory explicit provider country is never overwritten.
            row["country_code"] = source.get("country_code") or "US"
            rows.append(row)
    return rows


def canonical_ingest(repo, store, public_index, source_hashes, *, apply=False, discovery_run_id=None):
    master_dir = repo / "data/master"
    resolver = CompanyResolver(master_dir)
    if resolver.error:
        return {"ok": False, "status": "blocked", "error": resolver.error}
    paths = [master_dir / name for name in ("master_companies.csv", "master_contacts.csv")]
    before = {p.name: digest(p) for p in paths}
    raw_rows = []
    if discovery_run_id is not None:
        try:
            raw_rows = discovery_source_rows(store, discovery_run_id)
        except (OSError, ValueError, TypeError, KeyError):
            return {"ok": False, "status": "blocked", "error": "discovery_source_unverified"}
    for name, expected in sorted(({} if discovery_run_id is not None else source_hashes).items()):
        source = next((store / folder / name for folder in ("ingested", "inbox") if (store / folder / name).is_file()), None)
        if source is None or digest(source) != expected:
            return {"ok": False, "status": "blocked", "error": "paid_source_missing_or_hash_mismatch"}
        with source.open(newline="", encoding="utf-8-sig") as f:
            raw_rows.extend(csv.DictReader(f))
    public = json.loads(public_index.read_text())
    candidates, skipped = package_rows(raw_rows, public.get("locations", []))
    if not candidates:
        return {"ok": True, "status": "dry_run_ok", "candidate_count": 0, "skipped": skipped, "applied": False}
    spec = importlib.util.spec_from_file_location("caesthetic_canonical_ingest", repo / "scripts/outreach/ingest.py")
    ingest = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = ingest
    try:
        spec.loader.exec_module(ingest)
    except ModuleNotFoundError as exc:
        return {"ok": False, "status": "blocked", "error": "canonical_ingest_dependency_missing", "dependency": exc.name, "python_executable": sys.executable, "applied": False}
    # Existing canonical IDs are reused; conflicting phone-key matches stop apply.
    package_ids = {}
    for row in candidates:
        cid, _ = ingest.company_id_for(row["company_name"], row["city"], row["phone"])
        if cid in package_ids and package_ids[cid] != row["map_url"]:
            return {"ok": False, "status": "blocked", "error": "package_company_identity_conflict"}
        package_ids[cid] = row["map_url"]
        existing = resolver.companies.get(cid)
        if existing and (text(existing["company_name"]) != text(row["company_name"]) or text(existing["city"]) != text(row["city"])):
            return {"ok": False, "status": "blocked", "error": "canonical_ingest_identity_conflict"}
    package_hash = hashlib.sha256(json.dumps(candidates, sort_keys=True).encode()).hexdigest()
    work = store / "master-ingest"
    work.mkdir(parents=True, exist_ok=True)
    package = work / ("medspa-company-" + package_hash[:16] + ".csv")
    with package.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(candidates[0]))
        writer.writeheader()
        writer.writerows(candidates)
    captured = io.StringIO()
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        detected = ingest.process_file(package, detect_only=True)
        if detected.file_type != "companies":
            return {"ok": False, "status": "blocked", "error": "canonical_package_mapping_invalid"}
        stats = ingest.process_file(package, dry_run=True)
    fields = ("rows_in", "companies_before", "companies_after", "companies_added", "companies_enriched", "contacts_before", "contacts_after", "contacts_added", "contacts_enriched", "unmatched", "orphan_contacts", "rejected_invalid")
    summary = {key: getattr(stats, key) for key in fields}
    result = {"ok": True, "status": "dry_run_ok", "version": "canonical-ingest-v2", "candidate_count": len(candidates), "skipped": skipped, "counts": summary, "package_sha256": package_hash, "applied": False}
    # The documented shared masters already contain companies AND contacts.
    # Never bootstrap a replacement from empty placeholders or sync it to Drive.
    if not stats.companies_before or not stats.contacts_before:
        return {**result, "ok": False, "status": "blocked", "error": "canonical_master_baseline_empty"}
    if stats.unmatched or stats.orphan_contacts or stats.rejected_invalid:
        return {**result, "ok": False, "status": "blocked", "error": "canonical_package_rejected"}
    if not apply or not (stats.companies_added or stats.companies_enriched):
        return result
    # Existing two-master writer is used only after an unchanged dry-run snapshot.
    if any(digest(p) != before[p.name] for p in paths):
        return {**result, "ok": False, "status": "blocked", "error": "masters_changed_during_preview"}
    backup = work / ("backup-" + package_hash[:16])
    if backup.exists():
        return {**result, "ok": False, "status": "blocked", "error": "prior_apply_requires_reconciliation"}
    backup.mkdir()
    for p in paths:
        shutil.copy2(p, backup / p.name)
    (backup / "receipt.json").write_text(json.dumps({"state": "apply_pending", "before": before}))
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        applied = ingest.process_file(package, apply=True)
    after = {p.name: digest(p) for p in paths}
    (backup / "receipt.json").write_text(json.dumps({"state": "applied", "before": before, "after": after}))
    sync_result = sync_master_mirror(repo, store)
    log = work / "drive-sync-last.log"
    if sync_result.get("drive_sync") != "unknown" and log.exists():
        shutil.copy2(log, backup / "drive-sync.log")
    return {**result, "status": "success", "applied": True,
            "counts": {key: getattr(applied, key) for key in fields},
            "master_sha256": after, "drive_sync": sync_result.get("drive_sync", "unknown")}


def sync_master_mirror(repo, store):
    """Use an existing SDK-capable interpreter; never install packages or expose keys."""
    candidates = [store / "drive-venv/bin/python", Path(sys.executable), repo / ".venv/bin/python",
                  repo / "venv/bin/python", Path("/srv/monya/.venv/bin/python"),
                  Path("/srv/monya/venv/bin/python")]
    selected = sys.executable
    sdk_found = False
    for executable in candidates:
        if not executable.is_file():
            continue
        try:
            probe = subprocess.run([str(executable), "-c",
                                    "import google.oauth2.service_account; import googleapiclient.discovery"],
                                   capture_output=True, timeout=15)
            if probe.returncode == 0:
                selected, sdk_found = str(executable), True
                break
        except (OSError, subprocess.TimeoutExpired):
            continue
    work = store / "master-ingest"
    work.mkdir(parents=True, exist_ok=True)
    try:
        done = subprocess.run([selected, str(repo / "scripts/outreach/sync_master_to_drive.py"),
                               "--apply", "--allow-create"], cwd=repo,
                              capture_output=True, text=True, timeout=120)
        (work / "drive-sync-last.log").write_text(done.stdout + done.stderr)
        return {"ok": done.returncode == 0, "status": "success" if done.returncode == 0 else "blocked",
                "drive_sync": "success" if done.returncode == 0 else "error",
                "exit_code": done.returncode, "sdk_interpreter_found": sdk_found,
                "python_executable": selected, "master_apply_attempted": False}
    except (OSError, subprocess.TimeoutExpired):
        return {"ok": False, "status": "blocked", "drive_sync": "unknown",
                "sdk_interpreter_found": sdk_found, "master_apply_attempted": False}


def setup_drive_runtime(repo, store):
    """Provision only this application's optional Drive SDK in its private venv."""
    environment = store / "drive-venv"
    work = store / "master-ingest"
    work.mkdir(parents=True, exist_ok=True)
    python = environment / "bin/python"
    steps = []
    if not python.is_file():
        steps.append(("create_venv", [sys.executable, "-m", "venv", str(environment)]))
    steps.append(("install_sdk", [str(python), "-m", "pip", "install", "--no-input",
                                 "--disable-pip-version-check", "--only-binary=:all:",
                                 "--index-url", "https://pypi.org/simple",
                                 "google-api-python-client"]))
    for name, command in steps:
        try:
            done = subprocess.run(command, cwd=repo, capture_output=True, text=True, timeout=120)
        except (OSError, subprocess.TimeoutExpired):
            return {"ok": False, "status": "blocked", "error": "drive_runtime_setup_incomplete",
                    "stage": name, "master_apply_attempted": False}
        (work / ("drive-runtime-" + name + ".log")).write_text(done.stdout + done.stderr)
        if done.returncode:
            return {"ok": False, "status": "blocked", "error": "drive_runtime_setup_failed",
                    "stage": name, "exit_code": done.returncode, "master_apply_attempted": False}
    frozen = subprocess.run([str(python), "-m", "pip", "freeze"], capture_output=True, text=True, timeout=20)
    if frozen.returncode == 0:
        (work / "drive-runtime-requirements.lock").write_text(frozen.stdout)
    return sync_master_mirror(repo, store)
