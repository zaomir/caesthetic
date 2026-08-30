#!/usr/bin/env python3
"""Build CAESTHETIC platform video variants, sync the Sheet, and schedule via Hooppy.

The safe default is build-only. Dropbox, Google Sheets and Hooppy writes require
explicit flags. Hooppy scheduling additionally requires APPROVED_PUBLISH in the
manifest and never uses publish-now.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


SHEET_ID = os.environ.get(
    "SIMON_OPS_SHEET_ID", "1yy8YgFgFix9NLnvlpjiyM69RjCPjChyFuhJf8uYH99M"
)
SHEET_TAB = "CAE_Creative_Pipeline"
SA_PATH = os.environ.get(
    "GOOGLE_SERVICE_ACCOUNT_JSON", "/etc/evo/google_service_account.json"
)
HOOPPY_BASE_URL = os.environ.get("HOOPPY_API_BASE_URL", "https://api.hooppy.ru/api").rstrip("/")
DROPBOX_ROOT = "SIMON_OPS/content/B_CAE_IG"
CONTENT_ID_RE = re.compile(r"^[A-Z0-9][A-Z0-9._-]{2,79}$")
VERSION_RE = re.compile(r"^v?[1-9][0-9]{0,3}$")


@dataclass(frozen=True)
class Platform:
    name: str
    source_id: int
    page_id: int
    width: int
    height: int
    suffix: str
    settings: dict[str, Any] | None = None


PLATFORMS = {
    "instagram": Platform("instagram", 10, 2442190, 1080, 1920, "ig-reel"),
    "facebook": Platform("facebook", 3, 1977644, 1080, 1920, "fb-reel"),
    "tiktok": Platform("tiktok", 14, 2446140, 1080, 1920, "tiktok"),
    "youtube": Platform(
        "youtube", 17, 2443192, 1080, 1920, "youtube-short", {"publish_as_shorts": True}
    ),
    "linkedin": Platform("linkedin", 18, 2442189, 1080, 1920, "linkedin-vertical"),
}

BASE_HEADERS = [
    "content_id",
    "version",
    "copy_id",
    "topic_id",
    "pain_cluster",
    "master_asset_url",
    "master_sha256",
    "production_status",
    "qa_status",
    "claims_ok",
    "rights_ok",
    "privacy_ok",
    "approved_script",
    "approved_publish",
    "scheduled_at",
    "timezone",
    "updated_at",
    "error_note",
]
PLATFORM_HEADERS = [
    field
    for name in PLATFORMS
    for field in (
        f"{name}_asset_url",
        f"{name}_spec",
        f"{name}_sha256",
        f"{name}_caption",
        f"{name}_status",
        f"{name}_hooppy_post_id",
        f"{name}_live_url",
    )
]
SHEET_HEADERS = BASE_HEADERS + PLATFORM_HEADERS


def column_name(number: int) -> str:
    if number < 1:
        raise ValueError("column_number_must_be_positive")
    out = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        out = chr(65 + remainder) + out
    return out


def run(command: list[str], *, timeout: int = 600) -> str:
    proc = subprocess.run(command, text=True, capture_output=True, timeout=timeout, check=False)
    if proc.returncode:
        detail = (proc.stderr or proc.stdout).strip()[-2000:]
        raise RuntimeError(f"command_failed:{command[0]}:{proc.returncode}:{detail}")
    return proc.stdout.strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def truth(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value or "").strip().upper() in {"TRUE", "YES", "1", "APPROVED", "PASS"}


def validate_manifest(raw: dict[str, Any]) -> dict[str, Any]:
    content_id = str(raw.get("content_id") or "").strip()
    version = str(raw.get("version") or "").strip()
    if not CONTENT_ID_RE.fullmatch(content_id):
        raise ValueError("invalid_content_id")
    if not VERSION_RE.fullmatch(version):
        raise ValueError("invalid_version")
    version = version if version.startswith("v") else f"v{version}"
    master = str(raw.get("master_asset_url") or raw.get("master") or "").strip()
    if not master:
        raise ValueError("missing_master_asset_url")
    captions = raw.get("captions")
    if not isinstance(captions, dict):
        raise ValueError("missing_captions")
    missing_captions = [name for name in PLATFORMS if not str(captions.get(name) or "").strip()]
    if missing_captions:
        raise ValueError(f"missing_platform_captions:{','.join(missing_captions)}")
    expected_master_sha256 = str(raw.get("expected_master_sha256") or "").strip().lower()
    if expected_master_sha256 and not re.fullmatch(r"[a-f0-9]{64}", expected_master_sha256):
        raise ValueError("invalid_expected_master_sha256")
    if truth(raw.get("approved_publish")):
        required = ["approved_script", "claims_ok", "rights_ok", "privacy_ok"]
        missing_gates = [key for key in required if not truth(raw.get(key))]
        if missing_gates:
            raise ValueError(f"publish_gate_incomplete:{','.join(missing_gates)}")
    out = dict(raw)
    out["content_id"] = content_id
    out["version"] = version
    out["master_asset_url"] = master
    out["expected_master_sha256"] = expected_master_sha256
    out["captions"] = {name: str(captions[name]).strip() for name in PLATFORMS}
    out.setdefault("timezone", "Europe/London")
    return out


def load_manifest(path: Path) -> dict[str, Any]:
    return validate_manifest(json.loads(path.read_text(encoding="utf-8")))


def resolve_master(master_ref: str, work_dir: Path) -> Path:
    if master_ref.startswith("dropbox:"):
        local = work_dir / Path(master_ref.removeprefix("dropbox:")).name
        run(["rclone", "copyto", master_ref, str(local)])
        return local
    local = Path(master_ref).expanduser().resolve()
    if not local.is_file():
        raise FileNotFoundError(f"missing_master:{local}")
    return local


def probe(path: Path) -> dict[str, Any]:
    return json.loads(
        run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt",
                "-of",
                "json",
                str(path),
            ],
            timeout=60,
        )
    )


def render_variant(master: Path, output: Path, platform: Platform) -> dict[str, Any]:
    output.parent.mkdir(parents=True, exist_ok=True)
    vf = (
        f"scale={platform.width}:{platform.height}:force_original_aspect_ratio=decrease,"
        f"pad={platform.width}:{platform.height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(master),
            "-map",
            "0:v:0",
            "-map",
            "0:a?",
            "-vf",
            vf,
            "-r",
            "30",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-movflags",
            "+faststart",
            str(output),
        ]
    )
    info = probe(output)
    streams = info.get("streams") or []
    video = next((x for x in streams if x.get("codec_type") == "video"), {})
    audio = next((x for x in streams if x.get("codec_type") == "audio"), None)
    checks = {
        "width": int(video.get("width") or 0) == platform.width,
        "height": int(video.get("height") or 0) == platform.height,
        "video_codec": video.get("codec_name") == "h264",
        "pixel_format": video.get("pix_fmt") == "yuv420p",
        "audio_codec": audio is None or audio.get("codec_name") == "aac",
        "duration": float((info.get("format") or {}).get("duration") or 0) > 0,
        "size": int((info.get("format") or {}).get("size") or 0) > 0,
    }
    if not all(checks.values()):
        raise RuntimeError(f"variant_qa_failed:{platform.name}:{checks}")
    return {
        "local_path": str(output),
        "spec": f"{platform.width}x{platform.height} h264/aac mp4",
        "sha256": sha256(output),
        "duration_seconds": round(float(info["format"]["duration"]), 3),
        "qa": checks,
    }


def dropbox_dir(manifest: dict[str, Any], platform: str) -> str:
    return f"{DROPBOX_ROOT}/{manifest['content_id']}/{manifest['version']}/{platform}"


def build_package(manifest: dict[str, Any], output_root: Path, *, sync_dropbox: bool) -> dict[str, Any]:
    package_dir = output_root / manifest["content_id"] / manifest["version"]
    package_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="cae-hooppy-master-") as temp:
        master = resolve_master(manifest["master_asset_url"], Path(temp))
        master_sha256 = sha256(master)
        expected_master_sha256 = str(manifest.get("expected_master_sha256") or "")
        if expected_master_sha256 and master_sha256 != expected_master_sha256:
            raise RuntimeError("master_checksum_mismatch")
        result: dict[str, Any] = {
            **manifest,
            "master_sha256": master_sha256,
            "production_status": "PLATFORM_VARIANTS_READY",
            "qa_status": "PASS",
            "updated_at": datetime.now(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z"),
            "platforms": {},
        }
        for name, platform in PLATFORMS.items():
            filename = f"{manifest['content_id']}-{manifest['version']}-{platform.suffix}.mp4"
            output = package_dir / name / filename
            built = render_variant(master, output, platform)
            remote_dir = dropbox_dir(manifest, name)
            remote_url = f"dropbox:{remote_dir}/{filename}"
            if sync_dropbox:
                run(["rclone", "copyto", str(output), remote_url])
            built.update(
                {
                    "asset_url": remote_url,
                    "caption": manifest["captions"][name],
                    "status": "READY_FOR_APPROVAL",
                    "source_id": platform.source_id,
                    "hooppy_page_id": platform.page_id,
                    "hooppy_post_id": "",
                    "live_url": "",
                }
            )
            result["platforms"][name] = built
    publish_path = package_dir / "publish.json"
    publish_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if sync_dropbox:
        run(
            [
                "rclone",
                "copyto",
                str(publish_path),
                f"dropbox:{DROPBOX_ROOT}/{manifest['content_id']}/{manifest['version']}/publish.json",
            ]
        )
    result["publish_manifest"] = str(publish_path)
    return result


def sheet_row(package: dict[str, Any]) -> dict[str, str]:
    row = {
        "content_id": package["content_id"],
        "version": package["version"],
        "copy_id": str(package.get("copy_id") or ""),
        "topic_id": str(package.get("topic_id") or ""),
        "pain_cluster": str(package.get("pain_cluster") or ""),
        "master_asset_url": package["master_asset_url"],
        "master_sha256": package.get("master_sha256", ""),
        "production_status": package.get("production_status", ""),
        "qa_status": package.get("qa_status", ""),
        "claims_ok": "TRUE" if truth(package.get("claims_ok")) else "FALSE",
        "rights_ok": "TRUE" if truth(package.get("rights_ok")) else "FALSE",
        "privacy_ok": "TRUE" if truth(package.get("privacy_ok")) else "FALSE",
        "approved_script": "TRUE" if truth(package.get("approved_script")) else "FALSE",
        "approved_publish": "TRUE" if truth(package.get("approved_publish")) else "FALSE",
        "scheduled_at": str(package.get("scheduled_at") or ""),
        "timezone": str(package.get("timezone") or "Europe/London"),
        "updated_at": str(package.get("updated_at") or ""),
        "error_note": str(package.get("error_note") or ""),
    }
    for name in PLATFORMS:
        variant = (package.get("platforms") or {}).get(name) or {}
        row.update(
            {
                f"{name}_asset_url": str(variant.get("asset_url") or ""),
                f"{name}_spec": str(variant.get("spec") or ""),
                f"{name}_sha256": str(variant.get("sha256") or ""),
                f"{name}_caption": str(variant.get("caption") or ""),
                f"{name}_status": str(variant.get("status") or ""),
                f"{name}_hooppy_post_id": str(variant.get("hooppy_post_id") or ""),
                f"{name}_live_url": str(variant.get("live_url") or ""),
            }
        )
    return row


def sheets_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    creds = service_account.Credentials.from_service_account_file(
        SA_PATH, scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def ensure_sheet(service) -> None:
    meta = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    tabs = {sheet["properties"]["title"] for sheet in meta.get("sheets", [])}
    if SHEET_TAB not in tabs:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SHEET_ID,
            body={
                "requests": [
                    {
                        "addSheet": {
                            "properties": {
                                "title": SHEET_TAB,
                                "gridProperties": {"rowCount": 2000, "columnCount": len(SHEET_HEADERS)},
                            }
                        }
                    }
                ]
            },
        ).execute()
    values = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=f"'{SHEET_TAB}'!A1:{column_name(len(SHEET_HEADERS))}1")
        .execute()
        .get("values", [])
    )
    if not values:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"'{SHEET_TAB}'!A1",
            valueInputOption="RAW",
            body={"values": [SHEET_HEADERS]},
        ).execute()
    elif values[0] != SHEET_HEADERS:
        raise RuntimeError("creative_pipeline_sheet_schema_mismatch")


def upsert_sheet(package: dict[str, Any]) -> dict[str, Any]:
    if not os.path.isfile(SA_PATH):
        raise RuntimeError("missing_google_service_account")
    service = sheets_service()
    ensure_sheet(service)
    values = (
        service.spreadsheets()
        .values()
        .get(
            spreadsheetId=SHEET_ID,
            range=f"'{SHEET_TAB}'!A1:{column_name(len(SHEET_HEADERS))}2000",
        )
        .execute()
        .get("values", [])
    )
    headers = values[0]
    row_map = sheet_row(package)
    key = f"{package['content_id']}#{package['version']}"
    row_number = None
    for index, existing in enumerate(values[1:], start=2):
        existing_key = f"{existing[0] if existing else ''}#{existing[1] if len(existing) > 1 else ''}"
        if existing_key == key:
            row_number = index
            break
    row = [row_map.get(header, "") for header in headers]
    if row_number:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"'{SHEET_TAB}'!A{row_number}",
            valueInputOption="RAW",
            body={"values": [row]},
        ).execute()
        action = "updated"
    else:
        service.spreadsheets().values().append(
            spreadsheetId=SHEET_ID,
            range=f"'{SHEET_TAB}'!A1",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]},
        ).execute()
        action = "appended"
    return {"sheet_id": SHEET_ID, "tab": SHEET_TAB, "key": key, "action": action}


def load_sheet_package(content_id: str, version: str) -> dict[str, Any]:
    if not CONTENT_ID_RE.fullmatch(content_id):
        raise ValueError("invalid_content_id")
    if not VERSION_RE.fullmatch(version):
        raise ValueError("invalid_version")
    version = version if version.startswith("v") else f"v{version}"
    if not os.path.isfile(SA_PATH):
        raise RuntimeError("missing_google_service_account")
    service = sheets_service()
    ensure_sheet(service)
    values = (
        service.spreadsheets()
        .values()
        .get(
            spreadsheetId=SHEET_ID,
            range=f"'{SHEET_TAB}'!A1:{column_name(len(SHEET_HEADERS))}2000",
        )
        .execute()
        .get("values", [])
    )
    headers = values[0]
    found = None
    for row in values[1:]:
        data = {header: row[index] if index < len(row) else "" for index, header in enumerate(headers)}
        if data.get("content_id") == content_id and data.get("version") == version:
            found = data
            break
    if found is None:
        raise RuntimeError("creative_pipeline_row_not_found")
    package: dict[str, Any] = {key: found.get(key, "") for key in BASE_HEADERS}
    package["platforms"] = {}
    for name in PLATFORMS:
        package["platforms"][name] = {
            "asset_url": found.get(f"{name}_asset_url", ""),
            "spec": found.get(f"{name}_spec", ""),
            "sha256": found.get(f"{name}_sha256", ""),
            "caption": found.get(f"{name}_caption", ""),
            "status": found.get(f"{name}_status", ""),
            "hooppy_post_id": found.get(f"{name}_hooppy_post_id", ""),
            "live_url": found.get(f"{name}_live_url", ""),
        }
    return package


def request_json(method: str, url: str, token: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:2000]
        raise RuntimeError(f"hooppy_http_{exc.code}:{detail}") from exc


def upload_media(path: Path, token: str) -> dict[str, Any]:
    boundary = f"----caesthetic-{uuid.uuid4().hex}"
    content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        (
            f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
            f"Content-Type: {content_type}\r\n\r\n"
        ).encode()
    )
    body.extend(path.read_bytes())
    body.extend(f"\r\n--{boundary}--\r\n".encode())
    request = urllib.request.Request(
        f"{HOOPPY_BASE_URL}/files/media/upload",
        data=bytes(body),
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:2000]
        raise RuntimeError(f"hooppy_upload_http_{exc.code}:{detail}") from exc
    media = result.get("photo")
    if not isinstance(media, dict) or not media.get("id"):
        raise RuntimeError("hooppy_upload_missing_media")
    return media


def publication_date(package: dict[str, Any]) -> dict[str, str]:
    raw = str(package.get("scheduled_at") or "").strip()
    if not raw:
        raise ValueError("missing_scheduled_at")
    tz = ZoneInfo(str(package.get("timezone") or "Europe/London"))
    moment = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=tz)
    moment = moment.astimezone(tz)
    return {"date": moment.strftime("%d.%m.%Y"), "hours": moment.strftime("%H"), "minutes": moment.strftime("%M")}


def schedule_package(
    package: dict[str, Any],
    *,
    execute: bool,
    after_each=None,
    platform_names: list[str] | None = None,
) -> dict[str, Any]:
    if not truth(package.get("approved_publish")):
        raise RuntimeError("APPROVED_PUBLISH_required")
    for gate in ("approved_script", "claims_ok", "rights_ok", "privacy_ok"):
        if not truth(package.get(gate)):
            raise RuntimeError(f"publish_gate_incomplete:{gate}")
    date = publication_date(package)
    token = os.environ.get("HOOPPY_BEARER_TOKEN", "") if execute else ""
    if execute and not token:
        raise RuntimeError("missing_HOOPPY_BEARER_TOKEN")
    if package.get("production_status") != "PLATFORM_VARIANTS_READY" or package.get("qa_status") != "PASS":
        raise RuntimeError("platform_variant_qa_required")
    selected = platform_names or list(PLATFORMS)
    unknown = [name for name in selected if name not in PLATFORMS]
    if unknown:
        raise ValueError(f"unknown_platform:{','.join(unknown)}")
    planned: dict[str, Any] = {}
    with tempfile.TemporaryDirectory(prefix="cae-hooppy-schedule-") as temp:
        temp_dir = Path(temp)
        for name in selected:
            platform = PLATFORMS[name]
            variant = package["platforms"][name]
            if variant.get("hooppy_post_id"):
                planned[name] = {"status": "SKIPPED_ALREADY_QUEUED", "hooppy_post_id": variant["hooppy_post_id"]}
                continue
            if variant.get("status") == "DELIVERY_UNVERIFIED":
                raise RuntimeError(f"reconcile_required_before_retry:{name}")
            if not variant.get("asset_url") or not variant.get("sha256") or not variant.get("caption"):
                raise RuntimeError(f"incomplete_platform_variant:{name}")
            payload = {
                "publication_when_type": 2,
                "publication_how_type": 1,
                "publication_date": date,
                "selected_pages_ids": [platform.page_id],
                "texts": [{"text": variant["caption"], "source_id": platform.source_id}],
                "attachments": [],
            }
            if platform.settings:
                payload["attachments"].append({"type": "settings", "data": platform.settings})
            if execute:
                local_ref = str(variant.get("local_path") or "")
                local = Path(local_ref) if local_ref else temp_dir / Path(variant["asset_url"]).name
                if not local.is_file():
                    if not str(variant["asset_url"]).startswith("dropbox:"):
                        raise RuntimeError(f"missing_local_variant:{name}")
                    run(["rclone", "copyto", str(variant["asset_url"]), str(local)])
                if sha256(local) != variant["sha256"]:
                    raise RuntimeError(f"variant_checksum_mismatch:{name}")
                media = upload_media(local, token)
                payload["attachments"].insert(0, {"type": "photos", "data": [media]})
                try:
                    response = request_json("POST", f"{HOOPPY_BASE_URL}/posts", token, payload)
                except Exception as exc:
                    variant["status"] = "DELIVERY_UNVERIFIED"
                    package["error_note"] = f"unknown_create_result:{name}:{str(exc)[:500]}"
                    package["updated_at"] = datetime.now(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z")
                    if after_each:
                        after_each(package)
                    raise
                post_id = response.get("id")
                if not post_id:
                    raise RuntimeError(f"hooppy_create_missing_id:{name}")
                variant["hooppy_post_id"] = str(post_id)
                variant["status"] = "SCHEDULED"
                planned[name] = {"status": "SCHEDULED", "hooppy_post_id": str(post_id)}
                package["updated_at"] = datetime.now(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z")
                if after_each:
                    after_each(package)
            else:
                payload["attachments"].insert(0, {"type": "photos", "data": [{"id": "DRY_RUN_MEDIA"}]})
                planned[name] = {"status": "DRY_RUN", "payload": payload}
    package["updated_at"] = datetime.now(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z")
    return planned


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path, nargs="?")
    parser.add_argument("--from-sheet", nargs=2, metavar=("CONTENT_ID", "VERSION"))
    parser.add_argument("--output-root", type=Path, default=Path("tmp/caesthetic-hooppy"))
    parser.add_argument("--sync-dropbox", action="store_true")
    parser.add_argument("--sync-sheet", action="store_true")
    parser.add_argument("--schedule-dry-run", action="store_true")
    parser.add_argument("--schedule", action="store_true")
    parser.add_argument("--platform", action="append", choices=tuple(PLATFORMS))
    args = parser.parse_args()
    try:
        if args.from_sheet:
            if args.manifest:
                raise ValueError("manifest_and_from_sheet_are_mutually_exclusive")
            package = load_sheet_package(args.from_sheet[0], args.from_sheet[1])
        else:
            if not args.manifest:
                raise ValueError("manifest_or_from_sheet_required")
            manifest = load_manifest(args.manifest)
            package = build_package(manifest, args.output_root, sync_dropbox=args.sync_dropbox)
        output: dict[str, Any] = {"ok": True, "package": package}
        if args.schedule_dry_run or args.schedule:
            if args.schedule and not args.sync_sheet:
                raise RuntimeError("schedule_requires_sync_sheet_for_idempotency")
            output["hooppy"] = schedule_package(
                package,
                execute=args.schedule,
                after_each=upsert_sheet if args.schedule else None,
                platform_names=args.platform,
            )
            if package.get("publish_manifest"):
                Path(package["publish_manifest"]).write_text(
                    json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
                )
        if args.sync_sheet:
            output["sheet"] = upsert_sheet(package)
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
