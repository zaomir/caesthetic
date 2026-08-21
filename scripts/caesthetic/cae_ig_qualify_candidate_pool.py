#!/usr/bin/env python3
"""Classify CAESTHETIC's private Instagram candidate pool without doing a mini-audit.

Founder rule 2026-08-20:
- Before a prospect requests the free Growth Score, do NOT perform a mini-audit or leak hunt.
- Mass qualification is cheap and automation-first.
- For each candidate establish only:
  1) US or not;
  2) patient-facing practice or not;
  3) independent/local or not;
  4) website presence;
  5) owner / decision-maker candidate.
- Diagnostic work across 4444 starts only after a Free Growth Score request.

Private row-level outputs stay in Dropbox. Git/public result contains aggregates only.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cae_ig_qualify_enrich import (
    load_company_index,
    load_contact_index,
    load_harvest_index,
    merge_public_sources,
    second_pass_rows,
)
from cae_ig_promote_current import DropboxTransport, guarded_promote, load_json

REPO = Path("/var/www/grainee-v2")
CANDIDATE = "dropbox:CAESTHETIC/audience/medspa-ig-outreach-v1/registry.csv"
OVERRIDES = "dropbox:CAESTHETIC/audience/us-spa-ig-master/overrides.csv"
CURRENT = "dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json"
ROOT = "dropbox:CAESTHETIC/audience/us-spa-ig-master"
STAGING = f"{ROOT}/qualification-staging"
RELEASES = f"{ROOT}/releases"
SELECTION_ID = "CAE_MEDSPA_IG_FINAL_V1"
SELECTION_TAG = "sel_cae_medspa_ig_final_v1"
CRITERIA_VERSION = "caesthetic_pre_score_qualification_v2_2026-08-21"
LIVE_RELEASE_ID = "r20260821T014534Z-qualified-646-contract"
DBX_ROOTS = ("dropbox:Projects/CAESTHETIC", "dropbox:CAESTHETIC")
HARVEST = ""

PHASE1 = {
    ("scottsdale", "AZ"), ("nashville", "TN"), ("charlotte", "NC"),
    ("tampa", "FL"), ("raleigh", "NC"), ("austin", "TX"),
    ("naples", "FL"), ("charleston", "SC"), ("greenville", "SC"),
}
US_STATE_CODES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
}
US_STATE_NAMES = {
    "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA","colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA","hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY",
}

FOREIGN = re.compile(
    r"\b(united kingdom|england|scotland|wales|ireland|canada|australia|new zealand|"
    r"germany|france|italy|spain|portugal|netherlands|belgium|switzerland|austria|"
    r"colombia|brazil|mexico|argentina|chile|peru|pakistan|india|sri lanka|uae|dubai|"
    r"london|manchester|sheffield|surrey|melbourne|sydney|toronto|vancouver|halifax|"
    r"hamburg|essen|barranquilla|sincelejo)\b", re.I,
)
NON_PATIENT = re.compile(
    r"\b(marketing agency|digital agency|social media manager|software|saas|crm|"
    r"manufacturer|distributor|supplier|wholesale|medical device sales|association|"
    r"industry council|production team|content studio|influencer marketing)\b|"
    r"dm for credit|credit/removal|daily dose of aesthetic|aesthetic vibes", re.I,
)
EDUCATION = re.compile(r"\b(academy|school|training only|training academy|online courses?|education platform|educator only)\b", re.I)
DENTAL = re.compile(r"\b(dental|dentist|dentistry|orthodont|endodont)\b", re.I)
BEAUTY_ONLY = re.compile(r"\b(hair salon|hairdresser|barber|barbershop|nail salon|nails only|lash studio|lashes only|tanning salon)\b", re.I)
PRACTICE = re.compile(
    r"\b(med\s*spa|medspa|medical spa|medical aesthetics?|aesthetic medicine|aesthetic clinic|"
    r"aesthetics clinic|cosmetic clinic|plastic surgery|plastic surgeon|dermatolog|skin clinic|"
    r"injectables?|injector|botox|dysport|xeomin|filler|sculptra|microneedling|laser|"
    r"body contour|facial aesthetics?|regenerative aesthetics?|wellness.*aesthetic|aesthetic.*wellness)\b", re.I,
)
COMMERCIAL = re.compile(
    r"\b(book|booking|appointment|schedule|consult|consultation|call|text|walk[- ]?ins?|"
    r"payment plans?|carecredit|cherry|services|treatments?|now accepting)\b", re.I,
)
OWNER_WORD = re.compile(r"\b(founder|owner|co-owner|cofounder|co-founder)\b", re.I)
PROVIDER = re.compile(r"\b(md|do|np|fnp|dnp|rn|bsn|pa-c|physician assistant|nurse practitioner|crna|injector|doctor|dr\.)\b", re.I)
CHAIN = re.compile(
    r"\b(franchise|nationwide|national chain|locations nationwide|20\+ locations|50\+ locations)\b|"
    r"\b(ovme|viomedspa|ideal image|laseraway|skinspirit)\b", re.I,
)
BOOKING_HOSTS = re.compile(r"(vagaro|fresha|booksy|mypatientnow|mangomint|janeapp|square\.site|schedul|booking)", re.I)
LINK_HOSTS = re.compile(r"(linktr\.ee|bio\.site|beacons\.ai|msha\.ke|stan\.store|lnk\.bio)", re.I)
SOCIAL_HOSTS = re.compile(r"(instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com|youtube\.com)", re.I)


def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    p = subprocess.run(args, text=True, capture_output=True)
    if check and p.returncode:
        raise RuntimeError(f"command failed: {' '.join(args[:3])}: {(p.stderr or p.stdout)[-500:]}")
    return p


def copyto(src: str, dst: str) -> None:
    run("rclone", "copyto", src, dst, "-q")


def cat(src: str) -> str:
    return run("rclone", "cat", src).stdout


def exists(src: str) -> bool:
    return run("rclone", "lsf", src, check=False).returncode == 0



def resolve_dbx(*rel: str) -> str:
    suffix = "/".join(rel)
    for root in DBX_ROOTS:
        path = f"{root}/{suffix}"
        if exists(path):
            return path
    raise RuntimeError(f"dropbox path not found: {suffix}")


def bind_dropbox_paths() -> None:
    global CANDIDATE, OVERRIDES, CURRENT, ROOT, STAGING, RELEASES, HARVEST
    ROOT = resolve_dbx("audience", "us-spa-ig-master")
    CANDIDATE = resolve_dbx("audience", "medspa-ig-outreach-v1", "registry.csv")
    OVERRIDES = f"{ROOT}/overrides.csv"
    CURRENT = f"{ROOT}/CURRENT.json"
    STAGING = f"{ROOT}/qualification-staging"
    RELEASES = f"{ROOT}/releases"
    try:
        HARVEST = resolve_dbx("icp", "9-city-ig-usernames-2026-08", "master_usernames.csv")
    except RuntimeError:
        HARVEST = ""

def norm(v: Any) -> str:
    return str(v or "").strip()


def low(v: Any) -> str:
    return norm(v).lower()


def username(v: Any) -> str:
    s = low(v).lstrip("@")
    if "instagram.com/" in s:
        s = s.split("instagram.com/", 1)[1].split("?", 1)[0].strip("/").split("/", 1)[0]
    return re.sub(r"[^a-z0-9._]", "", s)


def row_text(r: dict[str, str]) -> str:
    return " ".join([r.get("username", ""), r.get("full_name", ""), r.get("biography", ""), r.get("external_url", ""), r.get("city", ""), r.get("state", "")])


def explicit_us_state(text: str) -> str:
    t = low(text)
    for name, code in US_STATE_NAMES.items():
        if re.search(rf"\b{re.escape(name)}\b", t):
            return code
    m = re.search(r"(?:,|\s)([A-Z]{2})(?:\b|\s)", text)
    if m and m.group(1).upper() in US_STATE_CODES:
        return m.group(1).upper()
    return ""


def us_status(r: dict[str, str], text: str) -> tuple[str, str, str]:
    if FOREIGN.search(text):
        return "no", "explicit_foreign_signal", "high"
    state = norm(r.get("state")).upper()
    city = low(r.get("city"))
    explicit = explicit_us_state(text)
    if explicit:
        return "yes", f"explicit_us_state:{explicit}", "high"
    if state in US_STATE_CODES and city:
        return "likely", f"source_us_geo:{city},{state}", "medium"
    return "unknown", "us_geo_unverified", "low"


def patient_status(r: dict[str, str], text: str) -> tuple[str, str, str]:
    if NON_PATIENT.search(text):
        return "no", "explicit_non_patient_business", "high"
    if EDUCATION.search(text) and not (PRACTICE.search(text) and COMMERCIAL.search(text)):
        return "no", "education_only", "high"
    if DENTAL.search(text) and not PRACTICE.search(text):
        return "no", "dental_only", "high"
    if BEAUTY_ONLY.search(text) and not PRACTICE.search(text):
        return "no", "generic_beauty_only", "high"
    practice = bool(PRACTICE.search(text))
    commercial = bool(COMMERCIAL.search(text) or BOOKING_HOSTS.search(norm(r.get("external_url"))))
    if practice and commercial:
        return "yes", "practice_and_patient_booking_signal", "high"
    if practice and low(r.get("icp_proxy")) == "icp_proxy_strong":
        return "likely", "practice_signal_plus_strong_icp_proxy", "medium"
    if practice:
        return "likely", "practice_signal_without_booking_confirmation", "medium"
    return "unknown", "patient_facing_unverified", "low"


def independence_status(r: dict[str, str], text: str, patient: str) -> tuple[str, str, str]:
    if CHAIN.search(text):
        return "no", "chain_or_franchise_signal", "high"
    if patient not in {"yes", "likely"}:
        return "unknown", "not_evaluated_until_patient_facing", "low"
    if OWNER_WORD.search(text):
        return "yes", "founder_owner_signal", "high"
    if PROVIDER.search(norm(r.get("full_name"))) and norm(r.get("city")):
        return "likely", "named_provider_local_market", "medium"
    if "9city_medspa" in norm(r.get("source_sets")) and norm(r.get("city")):
        return "likely", "local_practice_source_no_chain_signal", "medium"
    return "unknown", "independence_unverified", "low"


def website_status(r: dict[str, str]) -> tuple[str, str, str]:
    url = norm(r.get("external_url"))
    if not url:
        return "missing", "no_external_url", "high"
    if SOCIAL_HOSTS.search(url):
        return "social_only", "external_url_is_social", "high"
    if LINK_HOSTS.search(url):
        return "link_hub", "link_hub_present", "high"
    if BOOKING_HOSTS.search(url):
        return "booking", "booking_url_present", "high"
    return "owned_or_business", "business_website_present", "medium"


def person_candidate(name: str) -> bool:
    n = norm(name)
    if not n or len(n) > 90:
        return False
    if re.search(r"\b(medspa|med spa|clinic|aesthetics|aesthetic|skin|wellness|plastic surgery|dermatology|center|centre|studio|spa)\b", n, re.I):
        prefix = re.split(r"[|•—–-]", n, maxsplit=1)[0].strip()
        return bool(PROVIDER.search(prefix) or re.match(r"^[A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+", prefix))
    return bool(PROVIDER.search(n) or re.match(r"^[A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+", n))


def owner_status(r: dict[str, str], text: str) -> tuple[str, str, str, str]:
    name = norm(r.get("full_name"))
    if OWNER_WORD.search(text) and person_candidate(name):
        return "yes", "named_owner_or_founder", "high", name
    if person_candidate(name):
        return "decision_maker_candidate", "named_provider_candidate", "medium", name
    return "unknown", "owner_name_unverified", "low", ""


def phase1_scope(r: dict[str, str], us: str) -> str:
    city = low(r.get("city")); state = norm(r.get("state")).upper()
    if (city, state) in PHASE1 and us in {"yes", "likely"}: return "yes"
    if us == "no": return "no"
    if state in US_STATE_CODES and city: return "no"
    return "unknown"


def load_overrides(text: str) -> dict[str, tuple[str, str]]:
    out: dict[str, tuple[str, str]] = {}
    for r in csv.DictReader(text.splitlines()):
        u = username(r.get("username"))
        if u: out[u] = (low(r.get("decision")), norm(r.get("reason")))
    return out


def classify(r: dict[str, str], overrides: dict[str, tuple[str, str]], deny: set[str]) -> dict[str, str]:
    u = username(r.get("username")); text = row_text(r)
    decision, decision_reason = overrides.get(u, ("", ""))
    if u in deny or decision == "suppress":
        return {"disposition":"Reject","tier":"","qualification_reason":f"suppressed:{decision_reason or 'deny_overlay'}","us_status":"unknown","us_reason":"not_evaluated","patient_facing_status":"unknown","patient_facing_reason":"not_evaluated","independent_local_status":"unknown","independent_local_reason":"not_evaluated","website_status":"unknown","website_reason":"not_evaluated","owner_status":"unknown","owner_reason":"not_evaluated","owner_candidate":"","phase1_scope":"unknown","qualification_confidence":"high"}

    us, us_reason, us_conf = us_status(r, text)
    patient, patient_reason, patient_conf = patient_status(r, text)
    indep, indep_reason, indep_conf = independence_status(r, text, patient)
    website, website_reason, website_conf = website_status(r)
    owner, owner_reason, owner_conf, owner_name = owner_status(r, text)
    scope = phase1_scope(r, us)

    hard_no = []
    if us == "no": hard_no.append("non_us")
    if patient == "no": hard_no.append("not_patient_facing")
    if indep == "no": hard_no.append("not_independent_local")
    if hard_no:
        disposition, tier, reason = "Reject", "", "+".join(hard_no)
    elif decision == "research":
        disposition, tier, reason = "Research", "R", f"explicit_research:{decision_reason or 'manual'}"
    elif us == "unknown" or patient == "unknown" or indep == "unknown":
        disposition, tier, reason = "Research", "R", "critical_qualification_unknown"
    else:
        disposition = "Qualified"
        if us == "yes" and patient == "yes" and indep == "yes" and website == "owned_or_business" and owner == "yes":
            tier, reason = "A", "fully_qualified_and_owner_reachable"
        elif patient == "yes" and indep in {"yes","likely"} and (website in {"owned_or_business","booking","link_hub"} or owner in {"yes","decision_maker_candidate"}):
            tier, reason = "B", "strong_qualified_fit_some_reachability_gap"
        else:
            tier, reason = "C", "qualified_fit_but_weak_identity_or_reachability_data"

    conf_values = {"high":3,"medium":2,"low":1}
    confs = [us_conf, patient_conf, indep_conf, website_conf, owner_conf]
    overall = min(confs, key=lambda x: conf_values[x]) if confs else "low"
    if disposition == "Qualified" and overall == "low" and us != "unknown" and patient != "unknown" and indep != "unknown": overall = "medium"
    return {
        "disposition":disposition,"tier":tier,"qualification_reason":reason,
        "us_status":us,"us_reason":us_reason,"patient_facing_status":patient,"patient_facing_reason":patient_reason,
        "independent_local_status":indep,"independent_local_reason":indep_reason,"website_status":website,"website_reason":website_reason,
        "owner_status":owner,"owner_reason":owner_reason,"owner_candidate":owner_name,"phase1_scope":scope,"qualification_confidence":overall,
    }


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""): h.update(chunk)
    return h.hexdigest()


def write_csv(path: Path, fields: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore"); w.writeheader(); w.writerows(rows)


def classify_rows(rows, overrides, deny):
    extra = ["disposition","qualification_tier","qualification_reason","observed_at","us_status","us_reason","patient_facing_status","patient_facing_reason","independent_local_status","independent_local_reason","website_status","website_reason","owner_status","owner_reason","owner_candidate","phase1_scope","qualification_confidence"]
    out = []
    for r in rows:
        q = classify(r, overrides, deny)
        x = dict(r); x.update(q); x["qualification_tier"] = x.pop("tier"); x.setdefault("observed_at", datetime.now(timezone.utc).isoformat())
        out.append(x)
    fields = list(dict.fromkeys(list(rows[0].keys()) + extra)) if rows else extra
    return out, fields


def stamp_contract(row: dict[str, str]) -> dict[str, str]:
    row = dict(row)
    row.update({
        "project": "caesthetic", "country": "US", "surface": "B_CAE_IG", "motion": "motion_d",
        "action_queue": "warm", "status": "ready_for_warm", "dm_eligible": "false",
        "selection_id": SELECTION_ID, "selection_tag": SELECTION_TAG, "narrative": "GROWTH_SCORE",
        "source": "cae_medspa_ig_qualified_v2",
    })
    return row


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["dry-run", "apply"], default="dry-run")
    ap.add_argument("--request-id", required=True)
    ap.add_argument(
        "--expected-current-release",
        default=LIVE_RELEASE_ID,
        help="CURRENT release observed by the caller; promotion fails if it changed",
    )
    args = ap.parse_args()
    bind_dropbox_paths()
    now = datetime.now(timezone.utc)
    run_id = now.strftime("%Y%m%dT%H%M%SZ")
    with tempfile.TemporaryDirectory(prefix="cae-qualify-") as td:
        tmp = Path(td)
        copyto(CANDIDATE, str(tmp / "registry.csv"))
        copyto(OVERRIDES, str(tmp / "overrides.csv"))
        current = json.loads(cat(CURRENT))
        harvest_text = cat(HARVEST) if HARVEST else ""
        deny = {username(x) for x in current.get("deny_usernames", []) if username(x)}
        overrides = load_overrides((tmp / "overrides.csv").read_text(encoding="utf-8", errors="replace"))
        companies = load_company_index()
        contacts = load_contact_index()
        harvest = load_harvest_index(harvest_text)
        rows = []
        seen: set[str] = set()
        with (tmp / "registry.csv").open(newline="", encoding="utf-8", errors="replace") as f:
            for r in csv.DictReader(f):
                u = username(r.get("username"))
                if not u or u in seen:
                    continue
                seen.add(u)
                r["username"] = u
                rows.append(merge_public_sources(r, companies, contacts, harvest))
        first_rows, _ = classify_rows(rows, overrides, deny)
        research_need = {x["username"] for x in first_rows if x["disposition"] == "Research"}
        enriched, pass_stats = second_pass_rows(first_rows, need=research_need, workers=20)
        out_rows, fields = classify_rows(enriched, overrides, deny)
        out_rows.sort(key=lambda x: (x["disposition"], x.get("qualification_tier", ""), x["username"]))
        write_csv(tmp / "classification.csv", fields, out_rows)
        final = [stamp_contract(x) for x in out_rows if x["disposition"] == "Qualified" and x["phase1_scope"] == "yes" and x["qualification_tier"] in {"A", "B", "C"}]
        final.sort(key=lambda x: ({"A": 0, "B": 1, "C": 2}[x["qualification_tier"]], low(x.get("city")), x["username"]))
        remaining_research = sum(1 for x in out_rows if x["disposition"] == "Research")
        summary = {
            "schema": "caesthetic-pre-score-qualification/v2",
            "criteria_version": CRITERIA_VERSION,
            "generated_at": now.isoformat(),
            "mode": args.mode,
            "dropbox_root": ROOT,
            "candidate_unique": len(rows),
            "disposition_counts": dict(Counter(x["disposition"] for x in out_rows)),
            "qualified_tier_counts": dict(Counter(x.get("qualification_tier", "") for x in out_rows if x["disposition"] == "Qualified")),
            "phase1_final_count": len(final),
            "phase1_tier_counts": dict(Counter(x.get("qualification_tier", "") for x in final)),
            "research_first_pass": len(research_need),
            "research_resolved": max(0, len(research_need) - remaining_research),
            "research_remaining": remaining_research,
            "second_pass_stats": pass_stats,
            "diagnostic_performed": False,
            "leak_scan_performed": False,
            "growth_score_performed": False,
            "social_writes": False,
            "current_updated": False,
            "candidate_is_write_authority": False,
        }
        sample = []
        for key in ["A", "B", "C", "R", "Reject"]:
            pool = [x for x in out_rows if (x.get("qualification_tier") == key or (key == "Reject" and x["disposition"] == "Reject"))]
            sample.extend(pool[:25])
        write_csv(tmp / "REVIEW_SAMPLE.csv", fields, sample)
        (tmp / "SUMMARY.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        stage = f"{STAGING}/{run_id}-{args.mode}"
        for name in ["classification.csv", "REVIEW_SAMPLE.csv", "SUMMARY.json"]:
            copyto(str(tmp / name), f"{stage}/{name}")
        live_id = str(current.get("release_id") or "")
        if args.mode == "apply" and live_id == LIVE_RELEASE_ID:
            print(f"[qualify] refusing CURRENT overwrite of live TASK-848 release {LIVE_RELEASE_ID}", flush=True)
            args.mode = "dry-run"
            summary["current_overwrite_refused"] = LIVE_RELEASE_ID
        if args.mode == "apply":
            release_id = f"r{run_id}-qualified-{len(final)}"
            release_root = f"{RELEASES}/{release_id}"
            if exists(release_root):
                raise RuntimeError(f"immutable release exists: {release_root}")
            master_fields = list(final[0].keys()) if final else fields
            write_csv(tmp / "canonical_master.csv", master_fields, final)
            (tmp / "outreach_usernames.txt").write_text("\n".join(x["username"] for x in final) + ("\n" if final else ""), encoding="utf-8")
            release_summary = dict(summary)
            release_summary.update({
                "release_id": release_id,
                "selection_id": SELECTION_ID,
                "selection_tag": SELECTION_TAG,
                "immutable": True,
                "sha256": {
                    "canonical_master.csv": sha256(tmp / "canonical_master.csv"),
                    "outreach_usernames.txt": sha256(tmp / "outreach_usernames.txt"),
                },
            })
            (tmp / "RELEASE_SUMMARY.json").write_text(json.dumps(release_summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            for local, remote in [("canonical_master.csv", "canonical_master.csv"), ("outreach_usernames.txt", "outreach_usernames.txt"), ("RELEASE_SUMMARY.json", "SUMMARY.json")]:
                copyto(str(tmp / local), f"{release_root}/{remote}")
            names = [x.strip().lower().lstrip("@") for x in cat(f"{release_root}/outreach_usernames.txt").splitlines() if x.strip()]
            if len(names) != len(final) or len(set(names)) != len(final):
                raise RuntimeError("release count/uniqueness verification failed")
            new_current = {
                "registry_id": "cae_us_medspa_ig",
                "release_id": release_id,
                "status": "QUALIFIED_CURRENT_PENDING_RUNTIME_ACCEPTANCE",
                "execution_allowed": False,
                "selection_id": SELECTION_ID,
                "selection_tag": SELECTION_TAG,
                "candidate_selection_id": "CAE_MEDSPA_IG_V1",
                "candidate_selection_tag": "sel_cae_medspa_ig_v1",
                "private_root": ROOT,
                "canonical_master": f"{release_root}/canonical_master.csv",
                "summary": f"{release_root}/SUMMARY.json",
                "overrides": OVERRIDES,
                "candidate_pool_reference": len(rows),
                "qualified_final_count": len(final),
                "ready_for_warm": len(final),
                "tier_counts": release_summary["phase1_tier_counts"],
                "criteria_version": CRITERIA_VERSION,
                "dm_eligible": False,
                "dolphin_profile_id": "833304152",
                "surface": "B_CAE_IG",
                "motion": "motion_d",
                "narrative": "GROWTH_SCORE",
                "diagnostic_policy": "No mini-audit before explicit Free Growth Score request",
                "next_release_rule": "reclassify full candidate pool; immutable release first; CURRENT last",
            }
            (tmp / "CURRENT.json").write_text(json.dumps(new_current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            policy = load_json(Path(__file__).resolve().parent / "cae_ig_current_policy.json")
            transport = DropboxTransport(os.environ.get("DROPBOX_ACCESS_TOKEN", ""))
            guarded_promote(
                new_current,
                policy,
                transport.fetch,
                transport.upload_update,
                args.expected_current_release,
            )
            activation = [x for x in final if x["qualification_tier"] in {"A", "B"}][:50]
            for row in activation:
                row["opening_narrative"] = "GROWTH_SCORE"
            act_fields = ["username", "city", "state", "qualification_tier", "owner_candidate", "email", "external_url", "qualification_reason", "qualification_confidence", "observed_at", "opening_narrative"]
            write_csv(tmp / "activation_ready.csv", act_fields, activation)
            act_root = f"{ROOT}/activation/{release_id}"
            copyto(str(tmp / "activation_ready.csv"), f"{act_root}/activation_ready.csv")
            summary.update({"release_id": release_id, "release_root": release_root, "current_updated": True, "activation_ready_count": len(activation), "activation_root": act_root, "sha256": release_summary["sha256"]})
        result_dir = REPO / "docs/agent-api/results"
        result_dir.mkdir(parents=True, exist_ok=True)
        result = dict(summary)
        result["private_staging"] = stage
        (result_dir / f"{args.request_id}.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
