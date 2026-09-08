"""Private paid-CSV transfer into /var/lib/caesthetic-medspa/inbox/.

Bytes never enter grainee-v2 git. Request JSON may only carry a pointer
(github_release / github_gist / dropbox) plus filename+sha256.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

INLINE_KEYS = frozenset(
    {
        "content",
        "content_base64",
        "csv",
        "csv_text",
        "data_base64",
        "file_bytes",
        "file_content",
        "files_b64",
    }
)
POINTER_FORBIDDEN = frozenset({"href", "path", "rclone_flags", "url"})
ALLOWED_SOURCES = frozenset({"github_release", "github_gist", "dropbox", "test_payloads"})
RELEASE_TAG_RE = re.compile(r"^medspa-inbox-[A-Za-z0-9._-]{1,40}$")
GIST_ID_RE = re.compile(r"^[0-9a-fA-F]{20,64}$")
FILENAME_RE = re.compile(r"^[A-Za-z0-9._-]+\.csv$")
MAX_BYTES = 1_000_000
DROPBOX_PREFIX = "Projects/CAESTHETIC/private-inbox"
DEFAULT_REPO = "zaomir/grainee-v2"
UA = "GraineeMedspaInbox/1.0"


def inline_payload_keys(params: dict | None) -> list[str]:
    found: list[str] = []
    if not isinstance(params, dict):
        return found
    for key in params:
        lower = str(key).lower()
        if lower in INLINE_KEYS or lower in POINTER_FORBIDDEN:
            found.append(str(key))
    for item in params.get("files") or []:
        if not isinstance(item, dict):
            continue
        for key in item:
            lower = str(key).lower()
            if lower in INLINE_KEYS or lower in POINTER_FORBIDDEN:
                found.append(f"files.{key}")
    return sorted(set(found))


def needs_transfer(params: dict | None) -> bool:
    if not isinstance(params, dict):
        return False
    if params.get("source") or params.get("gist_id") or params.get("release_tag"):
        return True
    if params.get("dropbox_folder") or params.get("tag"):
        return True
    return bool(inline_payload_keys(params))


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def resolve_github_token() -> str:
    for key in ("GITHUB_TOKEN", "GITHUB_PAT", "GITHUB_PERSONAL_ACCESS_TOKEN"):
        value = os.environ.get(key) or ""
        if value.strip():
            return value.strip()
    try:
        token = subprocess.check_output(["gh", "auth", "token"], text=True, timeout=8).strip()
    except (OSError, subprocess.SubprocessError):
        return ""
    return token


def github_request(token: str, url: str, *, accept: str = "application/vnd.github+json", method: str = "GET") -> bytes:
    request = urllib.request.Request(
        url,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": accept,
            "User-Agent": UA,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"github_http_{exc.code}") from exc


def write_inbox_file(inbox: Path, filename: str, payload: bytes, expected_sha: str) -> dict:
    if not FILENAME_RE.match(filename):
        return {"ok": False, "file": filename, "reason": "filename_rejected"}
    if len(payload) > MAX_BYTES:
        return {"ok": False, "file": filename, "reason": "too_large"}
    digest = sha256_bytes(payload)
    if digest != expected_sha:
        return {"ok": False, "file": filename, "reason": "hash_mismatch"}
    inbox.mkdir(parents=True, exist_ok=True)
    dest = inbox / filename
    dest.write_bytes(payload)
    return {"ok": True, "file": filename, "sha256": digest, "bytes": len(payload)}


def _allowed_entry(filename: str, declared_sha: str | None, allowed_hashes: dict[str, str]) -> str | None:
    expected = allowed_hashes.get(filename)
    if not expected:
        return None
    if declared_sha and declared_sha != expected:
        return None
    return expected


def _requested_files(params: dict, allowed_hashes: dict[str, str]) -> list[dict]:
    requested = []
    for item in params.get("files") or []:
        if isinstance(item, dict) and item.get("filename"):
            requested.append(item)
    if requested:
        return requested
    return [{"filename": name, "sha256": digest} for name, digest in allowed_hashes.items()]


def _delete_after(params: dict) -> bool:
    return params.get("delete_after", True) is not False


def stage_from_test_payloads(params: dict, inbox: Path, allowed_hashes: dict[str, str]) -> dict:
    if os.environ.get("CAESTHETIC_MEDSPA_TEST_TRANSFER") != "1":
        return {"ok": False, "error": "test_payloads_forbidden"}
    accepted = []
    rejected = []
    for item in params.get("files") or []:
        filename = str(item.get("filename") or "")
        payload = item.get("payload_bytes")
        if isinstance(payload, str):
            payload = payload.encode("utf-8")
        if not isinstance(payload, (bytes, bytearray)):
            rejected.append({"file": filename, "reason": "missing_payload"})
            continue
        expected = _allowed_entry(filename, item.get("sha256"), allowed_hashes)
        if not expected:
            rejected.append({"file": filename, "reason": "filename_or_hash_not_allowlisted"})
            continue
        written = write_inbox_file(inbox, filename, bytes(payload), expected)
        (accepted if written.get("ok") else rejected).append(written if written.get("ok") else {"file": filename, "reason": written.get("reason")})
    return {"ok": bool(accepted) and not rejected, "accepted": accepted, "rejected": rejected, "source": "test_payloads"}


def stage_from_github_release(params: dict, inbox: Path, allowed_hashes: dict[str, str], token: str) -> dict:
    tag = str(params.get("release_tag") or params.get("tag") or "")
    if not RELEASE_TAG_RE.match(tag):
        return {"ok": False, "error": "release_tag_rejected"}
    if not token:
        return {"ok": False, "error": "github_token_absent_on_vds"}
    repo = str(params.get("repo") or os.environ.get("CAESTHETIC_MEDSPA_GITHUB_REPO") or DEFAULT_REPO)
    if repo != DEFAULT_REPO:
        return {"ok": False, "error": "repo_rejected"}
    meta = json.loads(github_request(token, f"https://api.github.com/repos/{repo}/releases/tags/{tag}"))
    assets = {str(asset.get("name")): asset for asset in meta.get("assets") or []}
    accepted = []
    rejected = []
    for item in _requested_files(params, allowed_hashes):
        filename = str(item.get("filename") or "")
        expected = _allowed_entry(filename, item.get("sha256"), allowed_hashes)
        if not expected:
            rejected.append({"file": filename, "reason": "filename_or_hash_not_allowlisted"})
            continue
        asset = assets.get(filename)
        if not asset:
            rejected.append({"file": filename, "reason": "asset_missing"})
            continue
        payload = github_request(
            token,
            str(asset.get("url")),
            accept="application/octet-stream",
        )
        written = write_inbox_file(inbox, filename, payload, expected)
        if written.get("ok"):
            accepted.append(written)
        else:
            rejected.append({"file": filename, "reason": written.get("reason")})
    deleted = False
    delete_error = None
    if accepted and not rejected and _delete_after(params) and meta.get("id"):
        try:
            github_request(token, f"https://api.github.com/repos/{repo}/releases/{meta['id']}", method="DELETE")
            deleted = True
        except RuntimeError as exc:
            delete_error = str(exc)
    return {
        "ok": bool(accepted) and not rejected,
        "accepted": accepted,
        "rejected": rejected,
        "source": "github_release",
        "release_tag": tag,
        "deleted_after": deleted,
        "delete_error": delete_error,
    }


def stage_from_github_gist(params: dict, inbox: Path, allowed_hashes: dict[str, str], token: str) -> dict:
    gist_id = str(params.get("gist_id") or "")
    if not GIST_ID_RE.match(gist_id):
        return {"ok": False, "error": "gist_id_rejected"}
    if not token:
        return {"ok": False, "error": "github_token_absent_on_vds"}
    meta = json.loads(github_request(token, f"https://api.github.com/gists/{gist_id}"))
    if meta.get("public") is True:
        return {"ok": False, "error": "gist_must_be_secret"}
    gist_files = meta.get("files") or {}
    accepted = []
    rejected = []
    for item in _requested_files(params, allowed_hashes):
        filename = str(item.get("filename") or "")
        expected = _allowed_entry(filename, item.get("sha256"), allowed_hashes)
        if not expected:
            rejected.append({"file": filename, "reason": "filename_or_hash_not_allowlisted"})
            continue
        info = gist_files.get(filename) or {}
        payload = None
        raw_url = info.get("raw_url")
        if raw_url and str(raw_url).startswith("https://gist.githubusercontent.com/"):
            payload = github_request(token, str(raw_url), accept="text/plain")
        elif isinstance(info.get("content"), str):
            payload = info["content"].encode("utf-8")
        if payload is None:
            rejected.append({"file": filename, "reason": "gist_file_missing"})
            continue
        written = write_inbox_file(inbox, filename, payload, expected)
        if written.get("ok"):
            accepted.append(written)
        else:
            rejected.append({"file": filename, "reason": written.get("reason")})
    deleted = False
    delete_error = None
    if accepted and not rejected and _delete_after(params):
        try:
            github_request(token, f"https://api.github.com/gists/{gist_id}", method="DELETE")
            deleted = True
        except RuntimeError as exc:
            delete_error = str(exc)
    return {
        "ok": bool(accepted) and not rejected,
        "accepted": accepted,
        "rejected": rejected,
        "source": "github_gist",
        "gist_id": gist_id,
        "deleted_after": deleted,
        "delete_error": delete_error,
    }


def stage_from_dropbox(params: dict, inbox: Path, allowed_hashes: dict[str, str]) -> dict:
    folder = str(params.get("dropbox_folder") or DROPBOX_PREFIX).strip().strip("/")
    if folder != DROPBOX_PREFIX:
        return {"ok": False, "error": "dropbox_folder_rejected"}
    accepted = []
    rejected = []
    for item in _requested_files(params, allowed_hashes):
        filename = str(item.get("filename") or "")
        expected = _allowed_entry(filename, item.get("sha256"), allowed_hashes)
        if not expected:
            rejected.append({"file": filename, "reason": "filename_or_hash_not_allowlisted"})
            continue
        remote = f"dropbox:{DROPBOX_PREFIX}/{filename}"
        dest = inbox / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        copied = subprocess.run(
            ["rclone", "copyto", remote, str(dest), "--retries", "1"],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if copied.returncode != 0 or not dest.is_file():
            rejected.append({"file": filename, "reason": "dropbox_copy_failed"})
            if dest.exists():
                dest.unlink()
            continue
        payload = dest.read_bytes()
        written = write_inbox_file(inbox, filename, payload, expected)
        if written.get("ok"):
            accepted.append(written)
        else:
            dest.unlink(missing_ok=True)
            rejected.append({"file": filename, "reason": written.get("reason")})
    return {
        "ok": bool(accepted) and not rejected,
        "accepted": accepted,
        "rejected": rejected,
        "source": "dropbox",
        "folder": DROPBOX_PREFIX,
    }


def stage_inbox(params: dict, inbox: Path, *, allowed_hashes: dict[str, str], token: str | None = None) -> dict:
    blocked = inline_payload_keys(params)
    if blocked:
        return {
            "ok": False,
            "error": f"inline_payload_forbidden:{','.join(blocked)}",
            "note": "Do not put CSV bytes in git. Use github_release, github_gist, or dropbox.",
        }
    source = str(params.get("source") or "")
    if not source and (params.get("release_tag") or params.get("tag")):
        source = "github_release"
    elif not source and params.get("gist_id"):
        source = "github_gist"
    elif not source and params.get("dropbox_folder"):
        source = "dropbox"
    if source not in ALLOWED_SOURCES:
        return {"ok": False, "error": "transfer_source_rejected", "allowed_sources": sorted(ALLOWED_SOURCES - {"test_payloads"})}
    if source == "test_payloads":
        return stage_from_test_payloads(params, inbox, allowed_hashes)
    if source == "dropbox":
        return stage_from_dropbox(params, inbox, allowed_hashes)
    auth = token if token is not None else resolve_github_token()
    if source == "github_release":
        return stage_from_github_release(params, inbox, allowed_hashes, auth)
    return stage_from_github_gist(params, inbox, allowed_hashes, auth)
