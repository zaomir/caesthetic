#!/usr/bin/env python3
"""Audit private CAESTHETIC LinkedIn masters without putting PII in Git.

The script uses only the Python standard library to read XLSX workbooks.  It
writes a safe aggregate report and, only when explicitly requested, a private
row-level registry outside the repository.  It never calls LinkedIn or sends
messages.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from xml.etree import ElementTree as ET


NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
DOC_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
DECISION_RE = re.compile(
    r"\b(owner|founder|co-founder|ceo|chief executive|president|medical director|"
    r"practice manager|operations|managing partner|director)\b",
    re.I,
)
HEALTH_RE = re.compile(r"medical practice|hospital|health|wellness|pharma|cosmetic|beauty", re.I)
PRACTICE_RE = re.compile(r"med\s*spa|medical spa|aesthetic|plastic surgery|dermat|inject|skin|wellness|cosmetic", re.I)
PARTNER_RE = re.compile(
    r"medical device|pharmaceutical|professional training|academy|education|software|"
    r"ehr|emr|booking|financ|payment|recruit|staffing|supplier|distributor|association|society",
    re.I,
)
PORTFOLIO_RE = re.compile(r"aesthetic partners|medaesthetic partners|practice platform|portfolio", re.I)


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def col_index(ref: str) -> int:
    letters = re.match(r"[A-Z]+", ref.upper())
    if not letters:
        return 0
    total = 0
    for char in letters.group(0):
        total = total * 26 + ord(char) - 64
    return total - 1


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    return ["".join(node.itertext()) for node in root.findall("m:si", NS)]


def workbook_sheets(archive: zipfile.ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("r:Relationship", REL_NS)}
    result: dict[str, str] = {}
    for sheet in workbook.findall("m:sheets/m:sheet", NS):
        rel_id = sheet.attrib[f"{{{DOC_REL}}}id"]
        target = targets[rel_id].lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        result[sheet.attrib["name"]] = target
    return result


def read_xlsx(path: Path, sheet_name: str) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        strings = shared_strings(archive)
        sheets = workbook_sheets(archive)
        if sheet_name not in sheets:
            raise ValueError(f"sheet {sheet_name!r} not found in {path.name}")
        root = ET.fromstring(archive.read(sheets[sheet_name]))
        matrix: list[list[str]] = []
        for row in root.findall(".//m:sheetData/m:row", NS):
            values: dict[int, str] = {}
            for cell in row.findall("m:c", NS):
                index = col_index(cell.attrib.get("r", "A1"))
                cell_type = cell.attrib.get("t")
                if cell_type == "inlineStr":
                    value = "".join(cell.itertext())
                else:
                    node = cell.find("m:v", NS)
                    value = node.text if node is not None and node.text is not None else ""
                    if cell_type == "s" and value:
                        value = strings[int(value)]
                values[index] = clean(value)
            if values:
                width = max(values) + 1
                matrix.append([values.get(i, "") for i in range(width)])
        if not matrix:
            return []
        headers = [clean(value) for value in matrix[0]]
        rows: list[dict[str, str]] = []
        for values in matrix[1:]:
            values += [""] * (len(headers) - len(values))
            rows.append({header: values[i] for i, header in enumerate(headers) if header})
        return rows


def pick(row: dict[str, str], *names: str) -> str:
    for name in names:
        if name in row:
            return clean(row[name])
    return ""


def norm_url(value: str) -> str:
    value = clean(value)
    if not value:
        return ""
    if not re.match(r"^https?://", value, re.I):
        value = "https://" + value.lstrip("/")
    parts = urlsplit(value)
    host = parts.netloc.lower().removeprefix("www.")
    path = re.sub(r"/+", "/", parts.path).rstrip("/").lower()
    return urlunsplit(("https", host, path, "", ""))


def domain(value: str) -> str:
    value = norm_url(value)
    return urlsplit(value).netloc.removeprefix("www.") if value else ""


def norm_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", clean(value).lower())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_source(value: str) -> tuple[str, Path, str]:
    if "=" not in value or "#" not in value:
        raise ValueError("source must be LABEL=/absolute/file.xlsx#SheetName")
    label, rest = value.split("=", 1)
    file_name, sheet = rest.rsplit("#", 1)
    return clean(label), Path(file_name).expanduser().resolve(), clean(sheet)


def outside_repo(path: Path, repo: Path) -> bool:
    try:
        path.resolve().relative_to(repo.resolve())
        return False
    except ValueError:
        return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", action="append", required=True, help="LABEL=/absolute/file.xlsx#SheetName")
    parser.add_argument("--summary-out", type=Path, required=True)
    parser.add_argument("--private-out", type=Path, help="optional row-level JSONL; must be outside Git")
    parser.add_argument("--clinic-master", type=Path, help="optional BOTOX master for aggregate overlap only")
    parser.add_argument("--clinic-sheet", default="4_Maps_Clinics")
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[2]
    if args.private_out and not outside_repo(args.private_out, repo):
        raise SystemExit("refusing to write private row-level data inside the repository")

    all_rows: list[dict[str, object]] = []
    source_evidence: list[dict[str, object]] = []
    for label, path, sheet in map(parse_source, args.source):
        rows = [
            row for row in read_xlsx(path, sheet)
            if any((
                pick(row, "Company Name"),
                pick(row, "First Name"),
                pick(row, "Last Name"),
                pick(row, "Person Linkedin Url", "Person Linkedin"),
                pick(row, "Company Linkedin Url", "Company Linkedin"),
                pick(row, "Website"),
                pick(row, "Title"),
            ))
        ]
        source_evidence.append({"label": label, "file": path.name, "sheet": sheet, "rows": len(rows), "sha256": sha256(path)})
        for raw in rows:
            company = pick(raw, "Company Name")
            website = pick(raw, "Website")
            company_linkedin = norm_url(pick(raw, "Company Linkedin Url", "Company Linkedin"))
            person_linkedin = norm_url(pick(raw, "Person Linkedin Url", "Person Linkedin"))
            title = pick(raw, "Title")
            industry = pick(raw, "Industry")
            location = pick(raw, "Location", "Company Address")
            country = pick(raw, "Country")
            state = pick(raw, "State")
            keywords = pick(raw, "Keywords")
            signal = " | ".join((company, industry, title, keywords))
            is_us = bool(
                re.search(r"United States|\bUS\b|\bUSA\b", country + " | " + location, re.I)
                or (not country and state)
            )
            health_relevant = bool(HEALTH_RE.search(industry) or PRACTICE_RE.search(signal))
            is_partner = bool(PARTNER_RE.search(signal))
            if PORTFOLIO_RE.search(signal):
                lane = "PORTFOLIO_PLATFORM"
            elif is_partner:
                lane = "CHANNEL_PARTNER"
            elif DECISION_RE.search(title):
                lane = "PRACTICE_DECISION_MAKER"
            elif health_relevant:
                lane = "PRACTICE_PROVIDER"
            else:
                lane = "REJECT_STALE"
            all_rows.append({
                "source": label,
                "company_name": company,
                "website": website,
                "company_domain": domain(website),
                "company_linkedin": company_linkedin,
                "person_name": clean(pick(raw, "First Name") + " " + pick(raw, "Last Name")),
                "person_linkedin": person_linkedin,
                "title": title,
                "industry": industry,
                "location": location,
                "country": country,
                "state": state,
                "is_us": is_us,
                "health_relevant": health_relevant,
                "decision_role": bool(DECISION_RE.search(title)),
                "lane": lane,
            })

    valid_people = [row for row in all_rows if "linkedin.com/in/" in str(row["person_linkedin"])]
    valid_companies = [row for row in all_rows if "linkedin.com/company/" in str(row["company_linkedin"])]
    unique_people = {str(row["person_linkedin"]): row for row in valid_people}
    unique_companies = {str(row["company_linkedin"]): row for row in valid_companies}
    us_people = {key: row for key, row in unique_people.items() if row["is_us"]}
    us_decision = {
        key: row for key, row in us_people.items()
        if row["health_relevant"] and row["decision_role"]
    }

    overlap: dict[str, object] | None = None
    if args.clinic_master:
        clinics = read_xlsx(args.clinic_master.resolve(), args.clinic_sheet)
        clinic_names = {norm_name(pick(row, "title")) for row in clinics if pick(row, "title")}
        clinic_domains = {clean(pick(row, "website_domain")).lower().removeprefix("www.") for row in clinics if pick(row, "website_domain")}
        matched_rows = {
            key: row for key, row in unique_people.items()
            if norm_name(str(row["company_name"])) in clinic_names
            or (row["company_domain"] and str(row["company_domain"]) in clinic_domains)
        }
        matched_companies = {
            str(row["company_linkedin"]) or norm_name(str(row["company_name"]))
            for row in matched_rows.values()
        }
        overlap = {
            "clinic_rows": len(clinics),
            "unique_linkedin_companies_matching_clinic_name_or_domain": len(matched_companies),
            "unique_linkedin_people_within_matching_companies": len(matched_rows),
            "master_file": args.clinic_master.name,
            "sheet": args.clinic_sheet,
            "sha256": sha256(args.clinic_master),
        }

    observed_at = datetime.now(timezone.utc).isoformat()
    summary = {
        "schema": "caesthetic-linkedin-master-audit/v1",
        "observed_at": observed_at,
        "writes_performed": False,
        "linkedin_automation": "OFF",
        "sources": source_evidence,
        "counts": {
            "rows": len(all_rows),
            "unique_valid_person_profiles": len(unique_people),
            "unique_valid_company_pages": len(unique_companies),
            "duplicate_person_rows": len(valid_people) - len(unique_people),
            "unique_us_person_profiles": len(us_people),
            "unique_us_health_decision_roles": len(us_decision),
        },
        "lane_counts_us_unique_people": dict(sorted(Counter(str(row["lane"]) for row in us_people.values()).items())),
        "clinic_master_overlap": overlap,
        "privacy": "aggregate only; row-level names, profile URLs and contact data are excluded",
    }
    args.summary_out.parent.mkdir(parents=True, exist_ok=True)
    args.summary_out.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.private_out:
        args.private_out.parent.mkdir(parents=True, exist_ok=True)
        with args.private_out.open("w", encoding="utf-8") as handle:
            for row in unique_people.values():
                handle.write(json.dumps({**row, "verified_at": observed_at}, ensure_ascii=False) + "\n")

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
