"""Read-only linkage to the two canonical VDS masters. Never creates company IDs.

Maps identity or an exact US phone/name/city tuple is required. No fuzzy,
name-only or email-domain matches. Private source data never enters the summary.
"""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import parse_qs, urlparse


def text(value):
    return " ".join(str(value or "").casefold().split())


def phone(value):
    digits = re.sub(r"\D", "", str(value or ""))
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""


def place_id(value):
    parsed = urlparse(str(value or ""))
    query = parse_qs(parsed.query)
    for key in ("query_place_id", "place_id"):
        if len(query.get(key, [])) == 1:
            return query[key][0]
    query_value = query.get("q", [""])[0]
    if query_value.startswith("place_id:"):
        return query_value[len("place_id:"):]
    return ""


def stop_value(value):
    value = text(value)
    # Keep token semantics identical to scripts/outreach/ingest.py.
    if value in {"true", "1", "yes", "y", "t"}:
        return True
    if value in {"false", "0", "no", "n", "f", ""}:
        return False
    raise ValueError("unknown_do_not_contact")


class CompanyResolver:
    def __init__(self, master_dir):
        self.error = None
        self.companies = {}
        self.maps = defaultdict(set)
        self.tuples = defaultdict(set)
        self.stopped = set()
        try:
            with (Path(master_dir) / "master_companies.csv").open(newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                if not {"company_id", "company_name", "city", "country", "phone", "map_url", "do_not_contact"}.issubset(reader.fieldnames or []):
                    raise ValueError("master_companies_schema_invalid")
                for row in reader:
                    cid = row["company_id"].strip()
                    if not cid or cid in self.companies:
                        raise ValueError("master_company_identity_invalid")
                    self.companies[cid] = row
                    if stop_value(row["do_not_contact"]):
                        self.stopped.add(cid)
                    pid = place_id(row["map_url"])
                    if pid:
                        self.maps[pid].add(cid)
                    number = phone(row["phone"])
                    name, city = text(row["company_name"]), text(row["city"])
                    if text(row["country"]) in {"us", "usa", "united states", "united states of america"} and number and name and city:
                        self.tuples[(number, name, city)].add(cid)
            with (Path(master_dir) / "master_contacts.csv").open(newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                if not {"company_id", "do_not_contact"}.issubset(reader.fieldnames or []):
                    raise ValueError("master_contacts_schema_invalid")
                for row in reader:
                    # A refusal by any linked contact conservatively stops the company.
                    if stop_value(row["do_not_contact"]):
                        self.stopped.add(row["company_id"].strip())
        except FileNotFoundError:
            self.error = "canonical_master_files_missing"
        except PermissionError:
            self.error = "canonical_master_files_unreadable"
        except (OSError, UnicodeError, csv.Error, ValueError, AttributeError):
            self.error = "canonical_master_data_invalid"

    def resolve(self, row):
        if self.error:
            return None, self.error
        identity = row.get("identity") or {}
        business = row.get("business") or {}
        location = row.get("location") or {}
        pid = str(row.get("place_id") or identity.get("place_id") or "").strip()
        by_map = self.maps.get(pid, set()) if pid else set()
        key = (phone(row.get("phone") or business.get("phone")),
               text(row.get("name") or business.get("name")),
               text(row.get("city") or location.get("city")))
        by_tuple = self.tuples.get(key, set()) if all(key) else set()
        candidates = set(by_map) | set(by_tuple)
        if len(candidates) > 1:
            return None, "canonical_company_match_conflict"
        if not candidates:
            return None, "canonical_company_not_matched"
        cid = next(iter(candidates))
        if row.get("company_id") and row["company_id"] != cid:
            return None, "canonical_company_id_conflict"
        if cid in self.stopped:
            return None, "canonical_company_do_not_contact"
        return cid, "exact_maps_identity" if by_map else "exact_us_phone_name_city"

    def bind(self, records):
        counts = Counter()
        result = []
        for source in records:
            row = dict(source)
            cid, reason = self.resolve(row)
            # A stale caller-supplied ID cannot bypass the authoritative lookup.
            row.pop("company_id", None)
            if cid:
                row["company_id"] = cid
            else:
                row["blocker"] = row.get("blocker") or reason
            counts[reason] += 1
            result.append(row)
        return result, {"version": "canonical-masters-v1", "error": self.error,
                        "record_count": len(result), "reasons": dict(counts)}
