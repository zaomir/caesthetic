#!/usr/bin/env python3
"""PHASE-1 FAIL-CLOSED (DEC-812 / CAESTHETIC_IG_GROWTH_PROGRAM.md §12).
Requires founder override CAE_PHASE0_STUDENT_VOC_ALLOW=1.

Seed Audience_IG_Students (Priority A) + W34 B_CAE_IG DRAFT maker pack (DEC-793).

Does NOT set APPROVED — founder gate unchanged.
Private data stays out of git; reads tmp/Dropbox workbook export JSON.
"""
from __future__ import annotations


import sys
from pathlib import Path as _FailClosePath
sys.path.insert(0, str(_FailClosePath(__file__).resolve().parent))
from lib.phase1_fail_close import require_or_exit  # noqa: E402


import json
import os
import sys
from datetime import datetime, timezone

SHEET_ID = os.environ.get(
    "SIMON_OPS_SHEET_ID", "1yy8YgFgFix9NLnvlpjiyM69RjCPjChyFuhJf8uYH99M"
)
SA_PATH = os.environ.get(
    "GOOGLE_SERVICE_ACCOUNT_JSON", "/etc/evo/google_service_account.json"
)
PRIORITY_JSON = os.environ.get(
    "AUDIENCE_IG_PRIORITY_JSON",
    "/var/www/grainee-v2/tmp/audience_ig_students_priority_a.json",
)

AUDIENCE_HEADERS = [
    "username",
    "profile_url",
    "source",
    "segment",
    "confidence",
    "stage_guess",
    "priority",
    "narrative",
    "source_academy",
    "source_country",
    "primary_email",
    "followers",
    "evidence",
    "last_touch_utc",
    "touch_type",
    "status",
    "notes",
]


def svc():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    creds = service_account.Credentials.from_service_account_file(
        SA_PATH, scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def tab_ids(service) -> dict[str, int]:
    meta = (
        service.spreadsheets()
        .get(spreadsheetId=SHEET_ID, fields="sheets.properties")
        .execute()
    )
    return {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta["sheets"]}


def ensure_audience_tab(service) -> None:
    titles = tab_ids(service)
    if "Audience_IG_Students" not in titles:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SHEET_ID,
            body={
                "requests": [
                    {
                        "addSheet": {
                            "properties": {
                                "title": "Audience_IG_Students",
                                "index": 7,
                            }
                        }
                    }
                ]
            },
        ).execute()
        print(json.dumps({"ok": True, "created_tab": "Audience_IG_Students"}))
    else:
        print(json.dumps({"ok": True, "tab_exists": "Audience_IG_Students"}))


def seed_audience(service, rows: list[dict]) -> int:
    ensure_audience_tab(service)
    # Clear + rewrite header + data (idempotent full Priority A seed)
    body_rows = [AUDIENCE_HEADERS]
    for r in rows:
        body_rows.append(
            [
                str(r.get("username") or ""),
                str(r.get("profile_url") or ""),
                "workbook_2026-08-02",
                str(r.get("segment") or ""),
                str(r.get("confidence") or ""),
                str(r.get("stage_guess") or "UNKNOWN"),
                "A",
                "ACADEMY_GRADUATE_SUPPORT",
                str(r.get("academy") or ""),
                str(r.get("country") or ""),
                str(r.get("email") or ""),
                str(r.get("followers") or ""),
                str(r.get("evidence") or "")[:240],
                "",
                "",
                "research",
                "DEC-793 Priority A seed; warm before cold; username≠licence",
            ]
        )
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID, range="'Audience_IG_Students'!A:Z"
    ).execute()
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range="'Audience_IG_Students'!A1",
        valueInputOption="RAW",
        body={"values": body_rows},
    ).execute()
    print(json.dumps({"ok": True, "audience_rows": len(rows)}))
    return len(rows)


def upsert_by_key(service, tab: str, key_col: str, key: str, row_map: dict) -> None:
    vals = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=f"'{tab}'!A1:AZ300")
        .execute()
        .get("values", [])
    )
    hdr = vals[0]
    ki = hdr.index(key_col)
    data = {h: "" for h in hdr}
    row_idx = None
    for i, r in enumerate(vals[1:], start=2):
        if len(r) > ki and r[ki] == key:
            row_idx = i
            for j, h in enumerate(hdr):
                if j < len(r):
                    data[h] = r[j]
            break
    for k, v in row_map.items():
        if k in data:
            data[k] = "" if v is None else str(v)
    out = [data.get(h, "") for h in hdr]
    if row_idx:
        end_col = chr(ord("A") + len(hdr) - 1) if len(hdr) <= 26 else "AZ"
        # handle >26 cols
        def col_letter(n: int) -> str:
            s = ""
            while n:
                n, r = divmod(n - 1, 26)
                s = chr(65 + r) + s
            return s

        end_col = col_letter(len(hdr))
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"'{tab}'!A{row_idx}:{end_col}{row_idx}",
            valueInputOption="RAW",
            body={"values": [out]},
        ).execute()
        print(json.dumps({"ok": True, "tab": tab, "updated": key, "row": row_idx}))
    else:
        service.spreadsheets().values().append(
            spreadsheetId=SHEET_ID,
            range=f"'{tab}'!A1",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": [out]},
        ).execute()
        print(json.dumps({"ok": True, "tab": tab, "appended": key}))


def w34_maker_pack(service) -> None:
    """DEC-793 W1 student-aware week = ISO W34 (after existing APPROVED W33)."""
    packs = [
        {
            "copy": {
                "copy_id": "COPY-CAE-017",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "lang": "EN",
                "title_internal": "W34 Mon IG carousel — P1 11-minute rule",
                "body": (
                    "The 11-minute rule.\n\n"
                    "If a high-ticket enquiry waits past the first response window, "
                    "your ads paid for someone else's consult.\n\n"
                    "Save for your next ops meeting.\n\n"
                    "Link in bio → written growth assessment."
                ),
                "first_comment": "Link in bio → growth assessment",
                "asset_url": "",
                "compliance_ok": "TRUE",
                "isolation_ok": "TRUE",
                "status": "DRAFT",
                "version": "1",
                "parent_copy_id": "",
                "notes": "DEC-793 W34 maker pack · pillar P1 · agent DRAFT — founder APPROVED gate",
                "format": "carousel",
                "hashtags": "#clinicops #aestheticclinic #patientenquiry #caesthetic #growth",
                "link_placement": "bio",
                "image_brief": (
                    "IG carousel 1080×1350, 7 slides: (1) big hook '11 minutes'; "
                    "(2) enquiry clock diagram; (3) who owns the thread; "
                    "(4) after-hours trap; (5) 3-line checklist; "
                    "(6) save for ops meeting; (7) CTA link in bio. "
                    "Clinical Editorial Intelligence — no before/after, no ranking claims."
                ),
                "image_asset_url": "dropbox:SIMON_OPS/content/B_CAE_IG/COPY-CAE-017/",
                "blog_article_url": "",
                "utm_link": "https://caesthetic.com/assessment/?utm_source=B_CAE_IG&utm_medium=social&utm_campaign=CAL-2026W34-01",
            },
            "cal": {
                "cal_id": "CAL-2026W34-01",
                "local_date": "2026-08-17",
                "local_time": "12:00",
                "tz": "Europe/London",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "copy_id": "COPY-CAE-017",
                "status": "DRAFT",
                "approved_by": "",
                "approved_at": "",
                "published_at_utc": "",
                "publish_url": "",
                "twin_of_cal_id": "",
                "agent": "cursor",
                "notes": "DEC-793 W34 · P1 owner pillar · DRAFT",
                "repost_of_cal_id": "",
                "notify_status": "PENDING",
                "notify_sent_at": "",
            },
        },
        {
            "copy": {
                "copy_id": "COPY-CAE-018",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "lang": "EN",
                "title_internal": "W34 Wed IG Reel — S2 Certificate / Week 1 (student)",
                "body": (
                    "Certificate done. Week 1 starts here.\n\n"
                    "Not product catalogues — first-patient systems: "
                    "where enquiries come from, who replies, what you measure.\n\n"
                    "Comment LAUNCH for the 1-page launch checklist.\n\n"
                    "(Education only. Not medical advice. Not a product offer.)"
                ),
                "first_comment": "Comment LAUNCH · checklist via DM · no product pitch",
                "asset_url": "",
                "compliance_ok": "TRUE",
                "isolation_ok": "TRUE",
                "status": "DRAFT",
                "version": "1",
                "parent_copy_id": "",
                "notes": (
                    "DEC-793 student pillar S2 · keyword LAUNCH · "
                    "narrative ACADEMY_GRADUATE_SUPPORT · DRAFT — no Toxifillers"
                ),
                "format": "reel",
                "hashtags": "#aestheticmedicine #injectortraining #practicelaunch #caesthetic",
                "link_placement": "bio",
                "image_brief": (
                    "IG Reel 1080×1920, 25–35s: hook 'Certificate done' in 1.5s; "
                    "3 beats (enquiry source / reply owner / week-1 scoreboard); "
                    "end card COMMENT LAUNCH. No clinical procedures, no SKUs, "
                    "no before/after. Burned-in captions."
                ),
                "image_asset_url": "dropbox:SIMON_OPS/content/B_CAE_IG/COPY-CAE-018/",
                "blog_article_url": "",
                "utm_link": "https://caesthetic.com/?utm_source=B_CAE_IG&utm_medium=social&utm_campaign=CAL-2026W34-02",
            },
            "cal": {
                "cal_id": "CAL-2026W34-02",
                "local_date": "2026-08-19",
                "local_time": "12:00",
                "tz": "Europe/London",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "copy_id": "COPY-CAE-018",
                "status": "DRAFT",
                "approved_by": "",
                "approved_at": "",
                "published_at_utc": "",
                "publish_url": "",
                "twin_of_cal_id": "",
                "agent": "cursor",
                "notes": "DEC-793 W34 · S2 student pillar · keyword LAUNCH · DRAFT",
                "repost_of_cal_id": "",
                "notify_status": "PENDING",
                "notify_sent_at": "",
            },
        },
        {
            "copy": {
                "copy_id": "COPY-CAE-019",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "lang": "EN",
                "title_internal": "W34 Fri IG carousel — P2 reputation stack",
                "body": (
                    "Reputation stack without buying reviews.\n\n"
                    "Complete profile. Same-day replies. Honest labels. "
                    "No ranking guarantees — just the trust work you control.\n\n"
                    "Save this. Link in bio for assessment."
                ),
                "first_comment": "Link in bio → growth assessment",
                "asset_url": "",
                "compliance_ok": "TRUE",
                "isolation_ok": "TRUE",
                "status": "DRAFT",
                "version": "1",
                "parent_copy_id": "",
                "notes": "DEC-793 W34 maker pack · pillar P2 · DRAFT — no #1 maps claims",
                "format": "carousel",
                "hashtags": "#mapsreputation #clinicmarketing #aesthetics #caesthetic",
                "link_placement": "bio",
                "image_brief": (
                    "IG carousel 1080×1350, 6 slides: reputation stack overview; "
                    "profile completeness; response quality; photo hygiene; "
                    "what we never promise (ranking); CTA link in bio. "
                    "No fabricated stars/metrics."
                ),
                "image_asset_url": "dropbox:SIMON_OPS/content/B_CAE_IG/COPY-CAE-019/",
                "blog_article_url": "",
                "utm_link": "https://caesthetic.com/assessment/?utm_source=B_CAE_IG&utm_medium=social&utm_campaign=CAL-2026W34-03",
            },
            "cal": {
                "cal_id": "CAL-2026W34-03",
                "local_date": "2026-08-21",
                "local_time": "12:00",
                "tz": "Europe/London",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "copy_id": "COPY-CAE-019",
                "status": "DRAFT",
                "approved_by": "",
                "approved_at": "",
                "published_at_utc": "",
                "publish_url": "",
                "twin_of_cal_id": "",
                "agent": "cursor",
                "notes": "DEC-793 W34 · P2 owner pillar · DRAFT",
                "repost_of_cal_id": "",
                "notify_status": "PENDING",
                "notify_sent_at": "",
            },
        },
        {
            "copy": {
                "copy_id": "COPY-CAE-020",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "lang": "EN",
                "title_internal": "W34 Story bank (5 frames) — student-aware",
                "body": (
                    "STORY BANK (publish 1–4 frames most weekdays, daytime London):\n"
                    "1) Poll: Training / New practice / Multi-location\n"
                    "2) Soft tip: reply window after enquiry\n"
                    "3) Student: 'After the certificate — week 1 checklist' → highlight Graduate toolkit\n"
                    "4) Save reminder pointing to Mon carousel\n"
                    "5) Link sticker → bio assessment (no cold DM pitch)"
                ),
                "first_comment": "",
                "asset_url": "",
                "compliance_ok": "TRUE",
                "isolation_ok": "TRUE",
                "status": "DRAFT",
                "version": "1",
                "parent_copy_id": "",
                "notes": "DEC-793 Story bank · not a feed slot · DRAFT",
                "format": "story",
                "hashtags": "",
                "link_placement": "bio",
                "image_brief": "5 Story frames 1080×1920; light type; poll sticker on #1; link sticker on #5 only.",
                "image_asset_url": "dropbox:SIMON_OPS/content/B_CAE_IG/COPY-CAE-020/",
                "blog_article_url": "",
                "utm_link": "https://caesthetic.com/assessment/?utm_source=B_CAE_IG&utm_medium=story&utm_campaign=CAL-2026W34-ST",
            },
            "cal": {
                "cal_id": "CAL-2026W34-ST",
                "local_date": "2026-08-17",
                "local_time": "09:30",
                "tz": "Europe/London",
                "surface_id": "B_CAE_IG",
                "track": "brand_cae",
                "copy_id": "COPY-CAE-020",
                "status": "DRAFT",
                "approved_by": "",
                "approved_at": "",
                "published_at_utc": "",
                "publish_url": "",
                "twin_of_cal_id": "",
                "agent": "cursor",
                "notes": "DEC-793 Story bank week — use frames across Mon–Fri",
                "repost_of_cal_id": "",
                "notify_status": "PENDING",
                "notify_sent_at": "",
            },
        },
    ]
    for p in packs:
        upsert_by_key(service, "Copy_Bank", "copy_id", p["copy"]["copy_id"], p["copy"])
        upsert_by_key(service, "Content_Calendar", "cal_id", p["cal"]["cal_id"], p["cal"])


def patch_readme_note(service) -> None:
    """Append a line to README if not present — best-effort."""
    vals = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range="'README'!A1:A40")
        .execute()
        .get("values", [])
    )
    flat = "\n".join(r[0] for r in vals if r)
    note = (
        f"Audience_IG_Students tab — DEC-793 Priority A seed "
        f"{datetime.now(timezone.utc).strftime('%Y-%m-%d')} "
        f"(941 workbook; warm before cold; DRAFT content W34)."
    )
    if "Audience_IG_Students" in flat:
        print(json.dumps({"ok": True, "readme": "already mentions Audience_IG_Students"}))
        return
    next_row = len(vals) + 1
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"'README'!A{next_row}",
        valueInputOption="RAW",
        body={"values": [[note]]},
    ).execute()
    print(json.dumps({"ok": True, "readme_appended": next_row}))


def main() -> int:
    require_or_exit("scripts/caesthetic/seed-ig-students-w34.py")
    if not os.path.exists(PRIORITY_JSON):
        print(f"missing {PRIORITY_JSON}", file=sys.stderr)
        return 2
    rows = json.load(open(PRIORITY_JSON))
    s = svc()
    n = seed_audience(s, rows)
    w34_maker_pack(s)
    patch_readme_note(s)
    print(
        json.dumps(
            {
                "ok": True,
                "priority_a": n,
                "copies": ["COPY-CAE-017", "COPY-CAE-018", "COPY-CAE-019", "COPY-CAE-020"],
                "cals": ["CAL-2026W34-01", "CAL-2026W34-02", "CAL-2026W34-03", "CAL-2026W34-ST"],
                "status": "DRAFT_only",
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
