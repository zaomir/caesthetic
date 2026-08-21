#!/usr/bin/env python3
"""Second-pass enrichment for CAESTHETIC pre-Score qualification (TASK-848 / DEC-845).

Resolves Research rows from public pages + VDS masters + 9-city harvest.
Does not invent facts. Does not produce leak / mini-audit / 4444 diagnosis.
"""
from __future__ import annotations

import csv
import json
import re
import socket
import ssl
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from datetime import datetime, timezone
from html import unescape
from typing import Any
from urllib.parse import urljoin, urlparse

MASTERS_COMPANIES = "/var/www/grainee-v2/data/master/master_companies.csv"
MASTERS_CONTACTS = "/var/www/grainee-v2/data/master/master_contacts.csv"
HARVEST = "dropbox:Projects/CAESTHETIC/icp/9-city-ig-usernames-2026-08/master_usernames.csv"
HARVEST_SSOT = "dropbox:CAESTHETIC/icp/9-city-ig-usernames-2026-08/master_usernames.csv"

US_STATE_CODES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
}
US_STATE_NAMES = {
    "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA","colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA","hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY",
}
PHASE1_CITIES = {
    "scottsdale": "AZ", "nashville": "TN", "charlotte": "NC", "tampa": "FL",
    "raleigh": "NC", "austin": "TX", "naples": "FL", "charleston": "SC", "greenville": "SC",
}
FOREIGN = re.compile(
    r"\b(united kingdom|england|scotland|wales|ireland|canada|australia|new zealand|"
    r"germany|france|italy|spain|portugal|netherlands|belgium|switzerland|austria|"
    r"colombia|brazil|mexico|argentina|chile|peru|pakistan|india|sri lanka|uae|dubai|"
    r"london|manchester|sheffield|surrey|melbourne|sydney|toronto|vancouver|halifax|"
    r"hamburg|essen|barranquilla|sincelejo)\b",
    re.I,
)
PRACTICE = re.compile(
    r"\b(med\s*spa|medspa|medical spa|medical aesthetics?|aesthetic medicine|aesthetic clinic|"
    r"aesthetics clinic|cosmetic clinic|plastic surgery|plastic surgeon|dermatolog|skin clinic|"
    r"injectables?|injector|botox|dysport|xeomin|filler|sculptra|microneedling|laser|"
    r"body contour|facial aesthetics?)\b",
    re.I,
)
COMMERCIAL = re.compile(
    r"\b(book|booking|appointment|schedule|consult|consultation|call|text|walk[- ]?ins?|"
    r"payment plans?|carecredit|cherry|services|treatments?|now accepting)\b",
    re.I,
)
OWNER_WORD = re.compile(r"\b(founder|owner|co-owner|cofounder|co-founder)\b", re.I)
CHAIN = re.compile(
    r"\b(franchise|nationwide|national chain|locations nationwide|20\+ locations|50\+ locations)\b|"
    r"\b(ovme|viomedspa|ideal image|laseraway|skinspirit)\b",
    re.I,
)
SOCIAL_HOSTS = re.compile(
    r"(instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com|youtube\.com)", re.I
)
LINK_HOSTS = re.compile(r"(linktr\.ee|bio\.site|beacons\.ai|msha\.ke|stan\.store|lnk\.bio)", re.I)
BOOKING_HOSTS = re.compile(
    r"(vagaro|fresha|booksy|mypatientnow|mangomint|janeapp|square\.site|schedul|booking)", re.I
)
LEAK_BANNED = re.compile(r"\b(1-minute leak|mini-audit|4444|leak diagnosis|leak hunt)\b", re.I)

UA = "Mozilla/5.0 (compatible; CAESTHETIC-qualification/2.1; +https://caesthetic.com)"
CTX = ssl.create_default_context()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def norm(v: Any) -> str:
    return str(v or "").strip()


def low(v: Any) -> str:
    return norm(v).lower()


def username(v: Any) -> str:
    s = low(v).lstrip("@")
    if "instagram.com/" in s:
        s = s.split("instagram.com/", 1)[1].split("?", 1)[0].strip("/").split("/", 1)[0]
    return re.sub(r"[^a-z0-9._]", "", s)


def sanitize_text(v: Any) -> str:
    s = norm(v)
    return LEAK_BANNED.sub("", s).strip()


def html_to_text(html: str) -> str:
    html = re.sub(r"(?is)<(script|style|noscript).*?>.*?</\1>", " ", html)
    html = re.sub(r"(?is)<!--.*?-->", " ", html)
    html = re.sub(r"(?is)<[^>]+>", " ", html)
    html = unescape(html)
    return re.sub(r"\s+", " ", html)[:80000]


def parse_ld_blocks(html: str) -> list[Any]:
    out: list[Any] = []
    for m in re.finditer(
        r'(?is)<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html
    ):
        raw = m.group(1).strip()
        if not raw:
            continue
        try:
            out.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return out


def walk_ld(obj: Any, hits: dict[str, str], depth: int = 0, seen: set[int] | None = None) -> None:
    if depth > 8:
        return
    if seen is None:
        seen = set()
    if isinstance(obj, list):
        for item in obj[:40]:
            walk_ld(item, hits, depth + 1, seen)
        return
    if not isinstance(obj, dict):
        return
    obj_id = id(obj)
    if obj_id in seen:
        return
    seen.add(obj_id)
    addr = obj.get("address")
    if isinstance(addr, dict):
        region = norm(addr.get("addressRegion") or addr.get("address_region"))
        country = norm(addr.get("addressCountry") or addr.get("address_country"))
        locality = norm(addr.get("addressLocality") or addr.get("address_locality"))
        if region:
            hits["region"] = region
        if country:
            hits["country"] = country
        if locality:
            hits["locality"] = locality
        street = " ".join(
            x for x in [norm(addr.get("streetAddress")), locality, region, country] if x
        )
        if street:
            hits["address"] = street[:240]
    founder = obj.get("founder") or obj.get("founderName")
    if isinstance(founder, dict):
        name = norm(founder.get("name"))
        if name:
            hits["founder"] = name
    elif isinstance(founder, str) and founder.strip():
        hits["founder"] = founder.strip()
    if low(obj.get("@type")) in {"person"} and OWNER_WORD.search(str(obj.get("jobTitle") or "")):
        name = norm(obj.get("name"))
        if name:
            hits.setdefault("founder", name)
    for value in obj.values():
        if isinstance(value, (dict, list)):
            walk_ld(value, hits, depth + 1, seen)


def extract_state(text: str) -> str:
    t = low(text)
    for name, code in US_STATE_NAMES.items():
        if re.search(rf"\b{re.escape(name)}\b", t):
            return code
    m = re.search(r"(?:,|\s)([A-Z]{2})(?:\b|\s|,)", text)
    if m and m.group(1).upper() in US_STATE_CODES:
        return m.group(1).upper()
    return ""


def extract_phase1_city(text: str) -> tuple[str, str]:
    t = low(text)
    for city, state in PHASE1_CITIES.items():
        if re.search(rf"\b{re.escape(city)}\b", t):
            return city.title(), state
    return "", ""


def person_name(value: str) -> bool:
    n = norm(value)
    if not n or len(n) > 90:
        return False
    if re.search(
        r"\b(medspa|med spa|clinic|aesthetics|aesthetic|skin|wellness|plastic surgery|"
        r"dermatology|center|centre|studio|spa)\b",
        n,
        re.I,
    ):
        prefix = re.split(r"[|•—–-]", n, maxsplit=1)[0].strip()
        return bool(re.match(r"^[A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+", prefix))
    return bool(re.match(r"^[A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+", n))


def fetch_url(url: str, timeout: int = 8) -> dict[str, Any]:
    out = {
        "ok": False,
        "final_url": url,
        "status": 0,
        "html": "",
        "text": "",
        "error": "",
        "observed_at": now_iso(),
    }
    if not url or not url.startswith(("http://", "https://")):
        out["error"] = "not_http_url"
        return out
    host = urlparse(url).netloc.lower()
    if SOCIAL_HOSTS.search(host):
        out["error"] = "social_skipped"
        return out
    socket.setdefaulttimeout(timeout)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as resp:
            out["status"] = int(getattr(resp, "status", 200) or 200)
            out["final_url"] = str(resp.geturl() or url)
            raw = resp.read(250_000)
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "html" not in ctype and "text" not in ctype and ctype:
                out["error"] = f"non_html:{ctype[:40]}"
                return out
            html = raw.decode("utf-8", errors="replace")
            out["html"] = html[:250_000]
            out["text"] = html_to_text(html)
            out["ok"] = True
            return out
    except urllib.error.HTTPError as exc:
        out["status"] = int(exc.code)
        out["error"] = f"http_{exc.code}"
    except Exception as exc:  # noqa: BLE001 — bounded public fetch
        out["error"] = type(exc).__name__
    return out


def first_business_link(html: str, base: str) -> str:
    hrefs = re.findall(r'(?is)<a[^>]+href=["\'](https?://[^"\']+)["\']', html)
    for href in hrefs:
        host = urlparse(href).netloc.lower()
        if not host:
            continue
        if SOCIAL_HOSTS.search(host) or LINK_HOSTS.search(host):
            continue
        if any(x in host for x in ("linktr.ee", "facebook.", "instagram.", "tiktok.", "youtube.")):
            continue
        return href
    for href in re.findall(r'(?is)href=["\'](/[^"\']+)["\']', html[:20000]):
        abs_url = urljoin(base, href)
        if abs_url.startswith("http"):
            return abs_url
    return ""


def page_signals(fetch: dict[str, Any]) -> dict[str, Any]:
    html = fetch.get("html") or ""
    text = fetch.get("text") or ""
    hits: dict[str, str] = {}
    for block in parse_ld_blocks(html):
        walk_ld(block, hits)
    blob = " ".join([text, hits.get("address", ""), hits.get("locality", ""), hits.get("region", "")])
    country_raw = low(hits.get("country"))
    us_state = ""
    if hits.get("region"):
        region = hits["region"].strip()
        if region.upper() in US_STATE_CODES:
            us_state = region.upper()
        else:
            us_state = US_STATE_NAMES.get(low(region), "")
    if not us_state:
        us_state = extract_state(blob)
    city, city_state = extract_phase1_city(blob)
    if city_state and not us_state:
        us_state = city_state
    foreign = bool(FOREIGN.search(blob))
    us_country = country_raw in {"us", "usa", "united states", "united states of america"}
    if country_raw and country_raw not in {"us", "usa", "united states", "united states of america", ""}:
        foreign = True
    founder = hits.get("founder", "")
    owner_line = ""
    m = OWNER_WORD.search(text)
    if m:
        window = text[max(0, m.start() - 80) : m.end() + 80]
        nm = re.search(r"\b([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,2})\b", window)
        if nm and person_name(nm.group(1)):
            owner_line = nm.group(1)
    return {
        "source_url": fetch.get("final_url") or "",
        "observed_at": fetch.get("observed_at") or now_iso(),
        "http_ok": bool(fetch.get("ok")),
        "us_state": us_state,
        "city": city,
        "address": hits.get("address", ""),
        "jsonld": bool(hits),
        "us_country": us_country,
        "foreign": foreign and not us_country,
        "practice": bool(PRACTICE.search(text)),
        "commercial": bool(COMMERCIAL.search(text) or BOOKING_HOSTS.search(fetch.get("final_url") or "")),
        "chain": bool(CHAIN.search(text)),
        "owner_signal": bool(OWNER_WORD.search(text) or founder),
        "owner_name": founder or owner_line,
        "text_excerpt": text[:400],
    }


def load_company_index() -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    with open(MASTERS_COMPANIES, newline="", encoding="utf-8", errors="replace") as fh:
        for row in csv.DictReader(fh):
            u = username(row.get("instagram"))
            if u:
                out[u] = row
    return out


def load_contact_index() -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    with open(MASTERS_CONTACTS, newline="", encoding="utf-8", errors="replace") as fh:
        for row in csv.DictReader(fh):
            u = username(row.get("instagram"))
            if u and u not in out:
                out[u] = row
    return out


def load_harvest_index(text: str) -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for row in csv.DictReader(text.splitlines()):
        u = username(row.get("instagram_username") or row.get("username"))
        if u:
            out[u] = row
    return out


def merge_public_sources(
    row: dict[str, str],
    companies: dict[str, dict[str, str]],
    contacts: dict[str, dict[str, str]],
    harvest: dict[str, dict[str, str]],
) -> dict[str, str]:
    u = username(row.get("username"))
    company = companies.get(u) or {}
    contact = contacts.get(u) or {}
    hv = harvest.get(u) or {}
    merged = dict(row)
    if not norm(merged.get("city")):
        merged["city"] = norm(hv.get("city") or company.get("city"))
    if not norm(merged.get("state")):
        merged["state"] = norm(hv.get("state"))
    if not norm(merged.get("external_url")):
        merged["external_url"] = norm(hv.get("external_url") or company.get("website"))
    if not norm(merged.get("biography")):
        merged["biography"] = norm(hv.get("biography"))
    if not norm(merged.get("full_name")):
        merged["full_name"] = norm(hv.get("full_name") or company.get("company_name"))
    if not norm(merged.get("email")):
        merged["email"] = norm(row.get("email") or contact.get("email") or company.get("email"))
    if not norm(merged.get("icp_proxy")):
        merged["icp_proxy"] = norm(hv.get("icp_proxy"))
    if not norm(merged.get("followers")):
        merged["followers"] = norm(hv.get("followers") or row.get("followers"))
    country = norm(company.get("country"))
    if country:
        merged["master_country"] = country
    fn = norm(contact.get("first_name"))
    ln = norm(contact.get("last_name"))
    contact_name = " ".join(x for x in [fn, ln] if x).strip()
    if contact_name:
        merged["master_contact_name"] = contact_name
    if str(company.get("do_not_contact") or contact.get("do_not_contact") or "").strip().lower() in {
        "1",
        "true",
        "yes",
        "y",
    }:
        merged["master_dnc"] = "true"
    if hv:
        merged["harvest_collected_at"] = norm(hv.get("collected_at"))
        merged["harvest_evidence_url"] = norm(hv.get("evidence_url") or hv.get("instagram_url"))
    merged["company_website"] = norm(company.get("website"))
    return merged


def website_candidates(row: dict[str, str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for raw in [row.get("external_url"), row.get("company_website")]:
        url = norm(raw)
        if not url:
            continue
        if url.startswith("www."):
            url = "https://" + url
        if url.startswith("//"):
            url = "https:" + url
        if not url.startswith(("http://", "https://")):
            continue
        key = url.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(url)
    return out


def enrich_one(row: dict[str, str]) -> dict[str, Any]:
    result: dict[str, Any] = {
        "second_pass": "attempted",
        "second_pass_source": "",
        "page": {},
        "resolved_fields": {},
    }
    urls = website_candidates(row)
    if not urls:
        result["second_pass"] = "no_public_url"
        return result
    page: dict[str, Any] = {}
    hop_url = ""
    for url in urls:
        fetch = fetch_url(url)
        if not fetch.get("ok"):
            result["fetch_error"] = fetch.get("error") or "fetch_failed"
            continue
        host = urlparse(fetch.get("final_url") or url).netloc
        if LINK_HOSTS.search(host) and fetch.get("html"):
            hop_url = first_business_link(fetch["html"], fetch.get("final_url") or url)
        page = page_signals(fetch)
        page["entry_url"] = url
        if page.get("http_ok"):
            break
    if hop_url and (not page.get("us_state") or not page.get("practice")):
        hop = fetch_url(hop_url)
        if hop.get("ok"):
            hopped = page_signals(hop)
            hopped["entry_url"] = hop_url
            if hopped.get("us_state") or hopped.get("practice"):
                page = hopped
    result["page"] = page
    result["second_pass_source"] = page.get("source_url") or ""
    resolved: dict[str, str] = {}
    if page.get("city") and not norm(row.get("city")):
        resolved["city"] = page["city"]
    if page.get("us_state") and not norm(row.get("state")):
        resolved["state"] = page["us_state"]
    if page.get("owner_name") and person_name(page["owner_name"]):
        resolved["enrich_owner_name"] = page["owner_name"]
    if page.get("foreign"):
        resolved["enrich_foreign"] = "yes"
    if page.get("us_country") or page.get("us_state"):
        resolved["enrich_us"] = "yes"
    if page.get("practice"):
        resolved["enrich_practice"] = "yes"
    if page.get("commercial"):
        resolved["enrich_commercial"] = "yes"
    if page.get("chain"):
        resolved["enrich_chain"] = "yes"
    if page.get("owner_signal"):
        resolved["enrich_owner_signal"] = "yes"
    if page.get("jsonld"):
        resolved["enrich_jsonld"] = "yes"
    result["resolved_fields"] = resolved
    result["second_pass"] = "fetched" if page.get("http_ok") else "fetch_failed"
    return result


def apply_page_to_row(row: dict[str, str], enrichment: dict[str, Any]) -> dict[str, str]:
    out = dict(row)
    resolved = enrichment.get("resolved_fields") or {}
    page = enrichment.get("page") or {}
    out["second_pass_status"] = enrichment.get("second_pass") or ""
    out["second_pass_source_url"] = sanitize_text(page.get("source_url") or enrichment.get("second_pass_source") or "")
    out["second_pass_observed_at"] = page.get("observed_at") or ""
    for key, value in resolved.items():
        if key == "city" and not norm(out.get("city")):
            out["city"] = value
        elif key == "state" and not norm(out.get("state")):
            out["state"] = value
        else:
            out[key] = value
    if page.get("text_excerpt"):
        extra = sanitize_text(page["text_excerpt"])
        out["enrich_text"] = extra
        out["biography"] = (norm(out.get("biography")) + " " + extra).strip()
    return out


def second_pass_rows(
    rows: list[dict[str, str]],
    *,
    need: set[str],
    workers: int = 24,
) -> tuple[list[dict[str, str]], dict[str, int]]:
    stats = {"attempted": 0, "fetched": 0, "fetch_failed": 0, "no_public_url": 0, "skipped": 0}
    indexed = list(rows)
    jobs: list[tuple[int, dict[str, str]]] = []
    for i, row in enumerate(indexed):
        u = username(row.get("username"))
        if u not in need:
            stats["skipped"] += 1
            continue
        jobs.append((i, row))
        stats["attempted"] += 1
    if not jobs:
        return indexed, stats

    def work(item: tuple[int, dict[str, str]]) -> tuple[int, dict[str, Any]]:
        idx, row = item
        return idx, enrich_one(row)

    done = 0
    deadline = time.time() + max(180, min(360, len(jobs) * 0.8))
    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        future_map = {pool.submit(work, item): item[0] for item in jobs}
        pending = set(future_map)
        while pending:
            remaining = deadline - time.time()
            if remaining <= 0:
                stats["timed_out"] = len(pending)
                print(f"[second-pass] global timeout, abandon {len(pending)}", flush=True)
                break
            finished, pending = wait(pending, timeout=min(12, remaining), return_when=FIRST_COMPLETED)
            if not finished:
                continue
            for fut in finished:
                try:
                    idx, enrichment = fut.result(timeout=1)
                except Exception as exc:  # noqa: BLE001
                    idx = future_map[fut]
                    enrichment = {"second_pass": "fetch_failed", "page": {}, "resolved_fields": {}, "error": type(exc).__name__}
                status = enrichment.get("second_pass") or "fetch_failed"
                stats[status] = stats.get(status, 0) + 1
                indexed[idx] = apply_page_to_row(indexed[idx], enrichment)
                done += 1
                if done % 50 == 0 or done == len(jobs):
                    print(f"[second-pass] {done}/{len(jobs)} { {k:v for k,v in stats.items() if v} }", flush=True)
    return indexed, stats
