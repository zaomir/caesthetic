#!/usr/bin/env python3
"""Discover CAESTHETIC entertainment videos and select the next safe rotation item.

This controller never publishes. It appends Dropbox inbox discoveries to the
SIMON_OPS rotation ledger and selects only fully cleared, founder-approved rows.
The existing Hooppy creative pipeline remains the only scheduling executor.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SHEET_ID = os.environ.get("SIMON_OPS_SHEET_ID", "1yy8YgFgFix9NLnvlpjiyM69RjCPjChyFuhJf8uYH99M")
SHEET_TAB = "CAE_Entertainment_Rotation"
SA_PATH = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "/etc/evo/google_service_account.json")
DROPBOX_INBOX = os.environ.get(
    "CAE_ENTERTAINMENT_INBOX",
    "dropbox:Projects/CAESTHETIC/CAESTHETIC MEDIA/Huck/reels/reels-inbox/top50_2026-08-19 2",
)
PLATFORMS = ("instagram", "facebook", "tiktok", "youtube", "linkedin")
BASE_HEADERS = (
    "rotation_id", "source_file_id", "source_path", "source_filename", "source_modified_at",
    "source_size_bytes", "discovered_at", "intake_status", "rights_status", "audio_status",
    "privacy_status", "claims_status", "visual_qa_status", "approved_publish", "cycle_number",
    "sequence_position", "times_published", "last_published_at", "next_eligible_at",
    "rotation_status", "linked_content_id", "linked_version", "error_note",
)
PLATFORM_HEADERS = tuple(
    field
    for platform in PLATFORMS
    for field in (
        f"{platform}_asset_url", f"{platform}_caption", f"{platform}_status",
        f"{platform}_hooppy_post_id", f"{platform}_scheduled_at", f"{platform}_live_url",
        f"{platform}_published_at",
    )
)
HEADERS = BASE_HEADERS + PLATFORM_HEADERS


def truth(value: Any) -> bool:
    return str(value or "").strip().upper() in {"TRUE", "YES", "1", "GO", "APPROVED", "PASS"}


def parse_time(value: Any) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def gate_ready(row: dict[str, Any]) -> bool:
    return all(str(row.get(key) or "").strip().upper() == "GO" for key in (
        "rights_status", "audio_status", "privacy_status", "claims_status", "visual_qa_status"
    )) and truth(row.get("approved_publish"))


def platform_ready(row: dict[str, Any]) -> bool:
    for platform in PLATFORMS:
        if not str(row.get(f"{platform}_asset_url") or "").strip():
            return False
        if not str(row.get(f"{platform}_caption") or "").strip():
            return False
        if str(row.get(f"{platform}_status") or "").strip().upper() not in {
            "READY", "READY_FOR_APPROVAL", "SCHEDULED", "LIVE"
        }:
            return False
    return True


def select_next(rows: list[dict[str, Any]], now: datetime | None = None) -> dict[str, Any] | None:
    now = now or datetime.now(timezone.utc)
    eligible = []
    for row in rows:
        if str(row.get("rotation_status") or "").upper() == "ARCHIVED":
            continue
        if not gate_ready(row) or not platform_ready(row):
            continue
        next_at = parse_time(row.get("next_eligible_at"))
        if next_at and next_at > now:
            continue
        eligible.append(row)
    if not eligible:
        return None
    minimum = min(int(row.get("times_published") or 0) for row in eligible)
    wave = [row for row in eligible if int(row.get("times_published") or 0) == minimum]
    dated = [row for row in eligible if parse_time(row.get("last_published_at"))]
    if len(wave) > 1 and dated:
        last = max(dated, key=lambda row: parse_time(row.get("last_published_at")))
        wave = [row for row in wave if row.get("rotation_id") != last.get("rotation_id")] or wave
    return min(wave, key=lambda row: (int(row.get("sequence_position") or 10**9), str(row.get("rotation_id") or "")))


def run_json(command: list[str]) -> Any:
    proc = subprocess.run(command, text=True, capture_output=True, check=False, timeout=120)
    if proc.returncode:
        raise RuntimeError((proc.stderr or proc.stdout).strip()[-2000:])
    return json.loads(proc.stdout)


def discover() -> list[dict[str, Any]]:
    raw = run_json(["rclone", "lsjson", DROPBOX_INBOX, "--files-only", "--recursive"])
    videos = [item for item in raw if Path(str(item.get("Name") or item.get("Path") or "")).suffix.lower() in {".mp4", ".mov", ".m4v"}]
    return sorted(videos, key=lambda item: (str(item.get("ModTime") or ""), str(item.get("Path") or "")))


def sheets_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    if not os.path.isfile(SA_PATH):
        raise RuntimeError("missing_google_service_account")
    credentials = service_account.Credentials.from_service_account_file(
        SA_PATH, scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def read_rows(service) -> list[dict[str, Any]]:
    values = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID, range=f"'{SHEET_TAB}'!A1:BF2000"
    ).execute().get("values", [])
    if not values or tuple(values[0]) != HEADERS:
        raise RuntimeError("entertainment_rotation_sheet_schema_mismatch")
    return [
        {header: row[index] if index < len(row) else "" for index, header in enumerate(HEADERS)}
        for row in values[1:] if any(str(value).strip() for value in row)
    ]


def sync_inbox(service, discoveries: list[dict[str, Any]]) -> dict[str, Any]:
    rows = read_rows(service)
    known = {(str(row.get("source_filename") or "").casefold(), int(row.get("source_size_bytes") or 0)) for row in rows}
    next_id = max([int(str(row.get("rotation_id") or "0").rsplit("-", 1)[-1]) for row in rows] or [0]) + 1
    next_position = max([int(row.get("sequence_position") or 0) for row in rows] or [0]) + 1
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    additions = []
    for item in discoveries:
        name = str(item.get("Name") or Path(str(item.get("Path") or "")).name)
        size = int(item.get("Size") or 0)
        if (name.casefold(), size) in known:
            continue
        relative = str(item.get("Path") or name).lstrip("/")
        base = [
            f"CAE-ENT-ROT-{next_id:03d}", "", f"{DROPBOX_INBOX}/{relative}", name,
            str(item.get("ModTime") or ""), size, now, "DISCOVERED", "REVIEW_REQUIRED",
            "REVIEW_REQUIRED", "REVIEW_REQUIRED", "REVIEW_REQUIRED", "REVIEW_REQUIRED", "FALSE",
            1, next_position, 0, "", "", "BLOCKED_RIGHTS_REVIEW", "", "",
            "Inbox discovery only; recurring publish requires rights and audio clearance.",
        ]
        additions.append(base + [value for _ in PLATFORMS for value in ("", "", "NOT_READY", "", "", "", "")])
        known.add((name.casefold(), size))
        next_id += 1
        next_position += 1
    if additions:
        service.spreadsheets().values().append(
            spreadsheetId=SHEET_ID, range=f"'{SHEET_TAB}'!A1", valueInputOption="RAW",
            insertDataOption="INSERT_ROWS", body={"values": additions}
        ).execute()
    return {"discovered": len(discoveries), "appended": len(additions)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sync-inbox", action="store_true")
    parser.add_argument("--select-next", action="store_true")
    parser.add_argument("--rows-json", type=Path, help="Dry-run selection from a JSON row array")
    args = parser.parse_args()
    if not args.sync_inbox and not args.select_next:
        parser.error("choose --sync-inbox and/or --select-next")
    service = None if args.rows_json else sheets_service()
    result: dict[str, Any] = {"ok": True}
    if args.sync_inbox:
        if args.rows_json:
            parser.error("--rows-json cannot be used with --sync-inbox")
        result["inbox"] = sync_inbox(service, discover())
    if args.select_next:
        rows = json.loads(args.rows_json.read_text()) if args.rows_json else read_rows(service)
        selected = select_next(rows)
        result["next"] = selected
        result["status"] = "READY" if selected else "NO_ELIGIBLE_ITEM"
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
