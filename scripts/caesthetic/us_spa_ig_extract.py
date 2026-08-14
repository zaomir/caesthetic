#!/usr/bin/env python3
"""Extract Instagram profile usernames from private CAESTHETIC source files.

The extractor intentionally accepts only:
  1. explicit instagram.com profile URLs in any source column; or
  2. username/Instagram-labelled columns.

It does not derive Instagram usernames from business names, website domains, or
other contact fields. Row-level output is for private storage only.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Iterator


NS_MAIN = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
NS_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"

USERNAME_RE = re.compile(r"^(?!.*\.\.)[a-z0-9._]{1,30}$")
INSTAGRAM_URL_RE = re.compile(
    r"(?:https?://)?(?:www\.)?instagram\.com/([a-zA-Z0-9._]{1,30})(?:[/?#][^\s\"'<>]*)?",
    re.IGNORECASE,
)
AT_HANDLE_RE = re.compile(r"^@?([a-zA-Z0-9._]{1,30})$")

RESERVED_IG_PATHS = {
    "about",
    "accounts",
    "api",
    "developer",
    "directory",
    "explore",
    "graphql",
    "legal",
    "oauth",
    "p",
    "privacy",
    "reel",
    "reels",
    "stories",
    "terms",
}

USERNAME_COLUMN_KEYS = {
    "handle",
    "ig",
    "ig_handle",
    "ig_profile",
    "ig_username",
    "instagram",
    "instagram_account",
    "instagram_handle",
    "instagram_profile",
    "instagram_url",
    "instagram_user",
    "instagram_username",
    "profile_url",
    "username",
    "user_name",
}

BUSINESS_NAME_KEYS = (
    "business_name",
    "company",
    "company_name",
    "display_name",
    "full_name",
    "name",
    "place_name",
    "title",
)
CITY_KEYS = ("city", "locality", "market_city", "town")
STATE_KEYS = ("state", "state_code", "market_state", "province", "region")


@dataclass(frozen=True)
class Source:
    source_project: str
    source_file: str
    local_path: Path
    state: str = ""
    city: str = ""
    include_in_extract: bool = True
    source_type: str = "business"
    notes: str = ""


def norm_key(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(value or "").strip().lower()).strip("_")


def clean(value: object) -> str:
    return str(value or "").strip()


def parse_sources(path: Path) -> list[Source]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("--sources-json must contain a JSON array")
    sources: list[Source] = []
    for item in payload:
        local_path = Path(item["local_path"])
        sources.append(
            Source(
                source_project=clean(item.get("source_project")) or "unknown",
                source_file=clean(item.get("source_file")) or str(local_path),
                local_path=local_path,
                state=clean(item.get("state")),
                city=clean(item.get("city")),
                include_in_extract=bool(item.get("include_in_extract", True)),
                source_type=clean(item.get("source_type")) or "business",
                notes=clean(item.get("notes")),
            )
        )
    return sources


def col_to_index(cell_ref: str) -> int:
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    idx = 0
    for ch in letters:
        idx = idx * 26 + (ord(ch) - ord("A") + 1)
    return max(idx - 1, 0)


def read_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for si in root.findall(f"{NS_MAIN}si"):
        parts = [node.text or "" for node in si.iter(f"{NS_MAIN}t")]
        values.append("".join(parts))
    return values


def workbook_sheets(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels_root = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rels = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels_root.findall(f"{REL_NS}Relationship")
    }
    sheets: list[tuple[str, str]] = []
    for sheet in workbook.findall(f"{NS_MAIN}sheets/{NS_MAIN}sheet"):
        name = sheet.attrib.get("name", "Sheet")
        rel_id = sheet.attrib.get(f"{NS_REL}id", "")
        target = rels.get(rel_id)
        if not target:
            continue
        target = target.lstrip("/")
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        sheets.append((name, target))
    return sheets


def cell_text(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.iter(f"{NS_MAIN}t")).strip()
    value_node = cell.find(f"{NS_MAIN}v")
    if value_node is None or value_node.text is None:
        return ""
    raw = value_node.text
    if cell_type == "s":
        try:
            return shared_strings[int(raw)].strip()
        except (ValueError, IndexError):
            return ""
    return raw.strip()


def xlsx_rows(path: Path) -> Iterator[tuple[str, int, list[str]]]:
    with zipfile.ZipFile(path) as zf:
        shared_strings = read_shared_strings(zf)
        for sheet_name, sheet_path in workbook_sheets(zf):
            if sheet_path not in zf.namelist():
                continue
            root = ET.fromstring(zf.read(sheet_path))
            for row in root.findall(f"{NS_MAIN}sheetData/{NS_MAIN}row"):
                row_number = int(float(row.attrib.get("r", "0") or "0"))
                cells: dict[int, str] = {}
                max_index = -1
                for cell in row.findall(f"{NS_MAIN}c"):
                    idx = col_to_index(cell.attrib.get("r", "A"))
                    cells[idx] = cell_text(cell, shared_strings)
                    max_index = max(max_index, idx)
                if max_index < 0:
                    continue
                values = [cells.get(idx, "") for idx in range(max_index + 1)]
                yield sheet_name, row_number, values


def csv_rows(path: Path) -> Iterator[tuple[str, int, list[str]]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        sample = handle.read(8192)
        handle.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample) if sample.strip() else csv.excel
        except csv.Error:
            dialect = csv.excel
        reader = csv.reader(handle, dialect)
        for idx, row in enumerate(reader, start=1):
            yield "csv", idx, [clean(value) for value in row]


def table_rows(path: Path) -> Iterator[tuple[str, int, dict[str, str], list[str]]]:
    suffix = path.suffix.lower()
    raw_rows = xlsx_rows(path) if suffix == ".xlsx" else csv_rows(path)
    headers_by_sheet: dict[str, list[str]] = {}
    fallback_headers_by_sheet: dict[str, list[str]] = {}

    for sheet_name, row_number, values in raw_rows:
        non_empty = [clean(v) for v in values if clean(v)]
        if not non_empty:
            continue
        fallback_headers = fallback_headers_by_sheet.setdefault(
            sheet_name, [f"col_{idx + 1}" for idx in range(len(values))]
        )
        if sheet_name not in headers_by_sheet:
            # Treat the first multi-column row as the header when it looks label-like.
            labelish = sum(1 for v in non_empty if len(v) <= 80)
            if len(non_empty) >= 2 and labelish >= max(2, len(non_empty) // 2):
                headers_by_sheet[sheet_name] = [
                    norm_key(value) or f"col_{idx + 1}" for idx, value in enumerate(values)
                ]
                continue
            headers = fallback_headers
        else:
            headers = headers_by_sheet[sheet_name]
        if len(headers) < len(values):
            headers = headers + [f"col_{idx + 1}" for idx in range(len(headers), len(values))]
        row = {
            headers[idx]: clean(value)
            for idx, value in enumerate(values)
            if clean(value) and idx < len(headers)
        }
        yield sheet_name, row_number, row, values


def valid_username(candidate: str) -> str:
    username = clean(candidate).strip("@").lower()
    username = username.rstrip("/").split("?", 1)[0].split("#", 1)[0].strip()
    if username in RESERVED_IG_PATHS or ".." in username:
        return ""
    if not USERNAME_RE.match(username):
        return ""
    return username


def extract_from_url(text: str) -> tuple[str, str]:
    for match in INSTAGRAM_URL_RE.finditer(text):
        username = valid_username(match.group(1))
        if username:
            return username, f"https://www.instagram.com/{username}/"
    return "", ""


def extract_from_username_column(value: str) -> str:
    text = clean(value)
    if not text:
        return ""
    username, _ = extract_from_url(text)
    if username:
        return username
    match = AT_HANDLE_RE.match(text)
    if not match:
        return ""
    return valid_username(match.group(1))


def first_value(row: dict[str, str], keys: Iterable[str]) -> str:
    for key in keys:
        value = clean(row.get(key))
        if value:
            return value
    return ""


def extract_row(row: dict[str, str], raw_values: list[str]) -> tuple[str, str, str]:
    # URL evidence may appear in any column, including a website/social field.
    username, url = extract_from_url(" ".join(clean(value) for value in raw_values if clean(value)))
    if username:
        return username, url, "url"

    # Bare handles/usernames are accepted only from explicit username/Instagram columns.
    for key, value in row.items():
        key_norm = norm_key(key)
        if key_norm in USERNAME_COLUMN_KEYS or "instagram" in key_norm:
            username = extract_from_username_column(value)
            if username:
                return username, f"https://www.instagram.com/{username}/", "username"
    return "", "", "none"


def process_source(source: Source) -> tuple[list[dict[str, str]], dict[str, object]]:
    rows_out: list[dict[str, str]] = []
    stats = {
        "source_file": source.source_file,
        "source_project": source.source_project,
        "local_path": str(source.local_path),
        "source_type": source.source_type,
        "include_in_extract": source.include_in_extract,
        "notes": source.notes,
        "raw_business_rows": 0,
        "rows_with_instagram_url": 0,
        "valid_instagram_usernames": 0,
        "extract_kind_counts": Counter(),
        "per_state_counts": Counter(),
        "per_city_counts": Counter(),
        "sheets": Counter(),
        "error": "",
    }
    if not source.local_path.exists():
        stats["error"] = "local_path_missing"
        return rows_out, stats
    if source.local_path.suffix.lower() not in {".csv", ".xlsx"}:
        stats["error"] = "unsupported_extension"
        return rows_out, stats

    for sheet_name, row_number, row, raw_values in table_rows(source.local_path):
        stats["raw_business_rows"] += 1
        stats["sheets"][sheet_name] += 1
        username, url, extract_kind = extract_row(row, raw_values)
        stats["extract_kind_counts"][extract_kind] += 1
        if extract_kind == "url":
            stats["rows_with_instagram_url"] += 1
        state = clean(first_value(row, STATE_KEYS)) or source.state
        city = clean(first_value(row, CITY_KEYS)) or source.city
        if state:
            stats["per_state_counts"][state] += 1
        if city:
            stats["per_city_counts"][city] += 1
        if username:
            stats["valid_instagram_usernames"] += 1
        if source.include_in_extract and username:
            rows_out.append(
                {
                    "source_file": source.source_file,
                    "source_row": f"{sheet_name}!{row_number}",
                    "source_project": source.source_project,
                    "state": state,
                    "city": city,
                    "business_name": first_value(row, BUSINESS_NAME_KEYS),
                    "instagram_username": username,
                    "instagram_url": url,
                    "extract_kind": extract_kind,
                }
            )

    stats["extract_kind_counts"] = dict(sorted(stats["extract_kind_counts"].items()))
    stats["per_state_counts"] = dict(sorted(stats["per_state_counts"].items()))
    stats["per_city_counts"] = dict(sorted(stats["per_city_counts"].items()))
    stats["sheets"] = dict(sorted(stats["sheets"].items()))
    return rows_out, stats


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = [
        "source_file",
        "source_row",
        "source_project",
        "state",
        "city",
        "business_name",
        "instagram_username",
        "instagram_url",
        "extract_kind",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def json_default(value: object) -> object:
    if isinstance(value, Counter):
        return dict(value)
    raise TypeError(f"unsupported JSON value: {type(value).__name__}")


def write_json(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False, sort_keys=True, default=json_default)
        + "\n",
        encoding="utf-8",
    )


def build_audit(rows: list[dict[str, str]], source_stats: list[dict[str, object]]) -> dict[str, object]:
    unique_usernames = {row["instagram_username"] for row in rows if row.get("instagram_username")}
    duplicate_rows = len(rows) - len(unique_usernames)
    per_state = Counter(row.get("state") or "unknown" for row in rows)
    per_source = Counter(row.get("source_file") or "unknown" for row in rows)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "privacy": "Row-level usernames/contact data stay in Dropbox/private tmp; git-safe docs contain aggregates only.",
        "sources_found": len(source_stats),
        "sources_in_extract": sum(1 for item in source_stats if item.get("include_in_extract")),
        "source_stats": source_stats,
        "raw_business_rows": sum(int(item.get("raw_business_rows") or 0) for item in source_stats if item.get("source_type") == "business"),
        "rows_with_instagram_url": sum(int(item.get("rows_with_instagram_url") or 0) for item in source_stats if item.get("include_in_extract")),
        "valid_instagram_usernames": sum(int(item.get("valid_instagram_usernames") or 0) for item in source_stats if item.get("include_in_extract")),
        "extracted_rows": len(rows),
        "unique_valid_instagram_usernames": len(unique_usernames),
        "duplicate_extracted_rows": duplicate_rows,
        "per_state_counts": dict(sorted(per_state.items())),
        "per_source_extracted_rows": dict(sorted(per_source.items())),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources-json", type=Path, required=True)
    parser.add_argument("--output-csv", type=Path, required=True)
    parser.add_argument("--audit-json", type=Path, required=True)
    parser.add_argument("--print-summary", action="store_true")
    args = parser.parse_args()

    all_rows: list[dict[str, str]] = []
    source_stats: list[dict[str, object]] = []
    for source in parse_sources(args.sources_json):
        rows, stats = process_source(source)
        all_rows.extend(rows)
        source_stats.append(stats)

    all_rows.sort(
        key=lambda row: (
            row.get("state", ""),
            row.get("city", ""),
            row.get("instagram_username", ""),
            row.get("source_file", ""),
            row.get("source_row", ""),
        )
    )
    audit = build_audit(all_rows, source_stats)
    write_csv(args.output_csv, all_rows)
    write_json(args.audit_json, audit)
    if args.print_summary:
        print(
            json.dumps(
                {
                    "sources_found": audit["sources_found"],
                    "raw_business_rows": audit["raw_business_rows"],
                    "rows_with_instagram_url": audit["rows_with_instagram_url"],
                    "valid_instagram_usernames": audit["valid_instagram_usernames"],
                    "extracted_rows": audit["extracted_rows"],
                    "unique_valid_instagram_usernames": audit["unique_valid_instagram_usernames"],
                    "per_state_counts": audit["per_state_counts"],
                },
                indent=2,
                ensure_ascii=False,
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
