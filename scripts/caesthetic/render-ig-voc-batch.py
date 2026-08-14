#!/usr/bin/env python3
"""PHASE-1 FAIL-CLOSED (DEC-812 / CAESTHETIC_IG_GROWTH_PROGRAM.md §12).
Requires founder override CAE_PHASE0_STUDENT_VOC_ALLOW=1.

Batch-render CAESTHETIC student VOC carousels (pain → solution).

Writes:
  tmp/cae-ig-voc/batch/pains_8.csv
  tmp/cae-ig-voc/batch/COPY-VOC-0NN/slide-*.jpg
  tmp/cae-ig-voc/batch/captions.md
  tmp/cae-ig-voc/batch/copy_bank_seed.json

Run:
  tmp/cae-ig-voc/.venv-pil/bin/python scripts/caesthetic/render-ig-voc-batch.py

Upload (optional):
  rclone sync tmp/cae-ig-voc/batch/COPY-VOC-021/ dropbox:SIMON_OPS/content/B_CAE_IG/COPY-VOC-021/
"""
from __future__ import annotations


import sys
from pathlib import Path as _FailClosePath
sys.path.insert(0, str(_FailClosePath(__file__).resolve().parent))
from lib.phase1_fail_close import require_or_exit  # noqa: E402

if __name__ == "__main__":
    require_or_exit("scripts/caesthetic/render-ig-voc-batch.py")


import csv
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/var/www/grainee-v2")
OUT = ROOT / "tmp/cae-ig-voc/batch"

BG, BG2, DARK = (245, 247, 248), (240, 237, 230), (26, 23, 20)
TEXT, STRONG, MUTED = (26, 23, 20), (13, 11, 9), (107, 101, 96)
ACCENT, SIGNAL, BORDER = (28, 58, 74), (123, 36, 75), (212, 207, 197)
WHITE = (255, 255, 255)
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

# 8 packs — same template: cover → why → context → 4 steps-ish → mistake → CTA
PACKS: list[dict] = [
    {
        "copy_id": "COPY-VOC-021",
        "pain_id": "P01",
        "pain": "Certificate done. Calendar empty.",
        "pillar": "S1",
        "cta": "FIRST",
        "keyword": "FIRST",
        "slides": [
            ("Certificate done.", ["Calendar empty."]),
            ("This is normal.", ["Training teaches treatment.", "It does not build a pipeline."]),
            ("First patients need a stack.", ["Not another course.", "Not random boosts."]),
            ("Step 1 — One offer", ["Pick one entry treatment.", "Make the next step obvious."]),
            ("Step 2 — Warm circle", ["Cohort + clinic network.", "Ask for one intro this week."]),
            ("Step 3 — Trust basics", ["Maps / profile / proof.", "Strangers need a reason to book."]),
            ("Mistake", ["Waiting for the academy", "to send you patients."]),
            ("Comment FIRST", ["Get the first-patients checklist.", "Education only — not medical advice."]),
        ],
        "caption_ig": (
            "Certificate done. Calendar empty.\n\n"
            "That does not mean you failed training.\n"
            "It means you still need a first-patients stack:\n"
            "1) one offer\n2) warm intros\n3) trust basics\n\n"
            "Comment FIRST for the checklist."
        ),
        "caption_fb": (
            "After the certificate, quiet diaries are common.\n\n"
            "Build a first-patients stack before more courses or ads:\n"
            "• one clear offer\n• warm intros from your cohort\n• Maps / proof basics\n\n"
            "Comment FIRST if you want the checklist."
        ),
        "caption_li": (
            "Post-certificate reality: you can treat — and the diary is still quiet.\n\n"
            "First patients come from a stack, not from the certificate alone:\n"
            "1. One offer\n2. Warm network asks\n3. Trust layer (profile + proof)\n\n"
            "What week post-training are you in?"
        ),
    },
    {
        "copy_id": "COPY-VOC-022",
        "pain_id": "P02",
        "pain": "First consult feels scarier than injecting.",
        "pillar": "S1",
        "cta": "FIRST",
        "keyword": "FIRST",
        "slides": [
            ("First consult", ["feels scarier than injecting."]),
            ("Why", ["NHS habits meet", "private expectations — fast."]),
            ("You need a script,", ["not more confidence talks."]),
            ("Step 1 — Intake", ["What they want. What you can do.", "What you will not do today."]),
            ("Step 2 — Expectations", ["Timeline, limits, aftercare.", "Say it before you treat."]),
            ("Step 3 — Plan + follow-up", ["Photos. Next step. Who messages whom."]),
            ("Mistake", ["Improvising the consult", "like a ward handover."]),
            ("Comment FIRST", ["First-consult checklist.", "Systems — not clinical advice."]),
        ],
        "caption_ig": (
            "Your first aesthetic consult shouldn’t feel scarier than the injecting.\n\n"
            "Use a simple arc:\n"
            "intake → expectations → photos → plan → follow-up.\n\n"
            "Comment FIRST for the checklist."
        ),
        "caption_fb": (
            "First private consult anxiety is common after NHS training.\n\n"
            "Structure beats improvisation:\n"
            "intake, expectations, photos, plan, follow-up.\n\n"
            "Comment FIRST for the first-consult checklist."
        ),
        "caption_li": (
            "The first private aesthetic consultation is often more stressful than the procedure.\n\n"
            "A repeatable consult arc reduces anxiety and protects standards:\n"
            "intake → expectations → documentation → plan → follow-up.\n\n"
            "What part of the consult still feels unclear?"
        ),
    },
    {
        "copy_id": "COPY-VOC-023",
        "pain_id": "P03",
        "pain": "Week 1 felt nothing like the course.",
        "pillar": "S2",
        "cta": "LAUNCH",
        "keyword": "LAUNCH",
        "slides": [
            ("Week 1 after the course", ["felt nothing like training."]),
            ("Why", ["Courses teach technique.", "Monday needs systems."]),
            ("Launch checklist", ["beats another certificate."]),
            ("1 — One service focus", ["Master the offer you can deliver", "safely and repeatedly."]),
            ("2 — Booking path", ["One link / number / form.", "Remove friction."]),
            ("3 — Reply SLA", ["Who answers. How fast.", "What happens after hours."]),
            ("Mistake", ["Learning 10 techniques", "before one working offer."]),
            ("Comment LAUNCH", ["Week-1 launch checklist.", "After the certificate."]),
        ],
        "caption_ig": (
            "Newly qualified practitioners say the same thing:\n"
            "early months felt nothing like the course.\n\n"
            "Week-1 needs: one offer, booking path, reply SLA, proof plan.\n\n"
            "Comment LAUNCH."
        ),
        "caption_fb": (
            "The course taught injecting.\nWeek 1 teaches chaos — unless you launch with a checklist.\n\n"
            "Comment LAUNCH for the week-1 systems page."
        ),
        "caption_li": (
            "Training environments and live practice are different operating systems.\n\n"
            "Week-1 essentials after certification:\n"
            "• one service focus\n• one booking path\n• reply ownership / SLA\n• a simple proof plan\n\n"
            "Which of the four is missing for you right now?"
        ),
    },
    {
        "copy_id": "COPY-VOC-024",
        "pain_id": "P04",
        "pain": "Clinical skill ≠ busy practice.",
        "pillar": "S4",
        "cta": "NEXT",
        "keyword": "NEXT",
        "slides": [
            ("Clinics don’t die", ["from bad injecting."]),
            ("They die from", ["no demand system."]),
            ("You can treat.", ["Your phone is still quiet."]),
            ("Step 1 — One clear offer", ["Not 12 treatments", "“just in case.”"]),
            ("Step 2 — Trust layer", ["Maps profile + proof.", "Strangers need a reason."]),
            ("Step 3 — Content", ["Answer ONE patient fear.", "Not “day at the academy.”"]),
            ("Then ads — mistake", ["Paid traffic into", "an empty profile."]),
            ("Comment NEXT", ["Post-academy systems brief.", "Education only."]),
        ],
        "caption_ig": (
            "Clinics don’t die from bad injecting.\n"
            "They die from no demand system.\n\n"
            "Stack: one offer → trust → content → then ads.\n\n"
            "Comment NEXT."
        ),
        "caption_fb": (
            "Clinical skill ≠ busy practice.\n\n"
            "Fix demand architecture before scaling spend.\n"
            "Comment NEXT for the post-academy systems brief."
        ),
        "caption_li": (
            "Most new aesthetic practices don’t fail clinically.\n"
            "They fail on demand architecture.\n\n"
            "1) One offer\n2) Trust layer\n3) Content for one fear\n4) Paid media only after basics\n\n"
            "Ads into an empty profile is expensive hope.\n\n"
            "What broke first in your first 90 days?"
        ),
    },
    {
        "copy_id": "COPY-VOC-025",
        "pain_id": "P05",
        "pain": "What should I charge?",
        "pillar": "S2",
        "cta": "NEXT",
        "keyword": "NEXT",
        "slides": [
            ("“What should I charge?”", ["Wrong first question."]),
            ("Price follows", ["positioning + proof."]),
            ("Start with who you help", ["and what outcome you can", "stand behind ethically."]),
            ("Entry offer", ["One clear package.", "What’s included / not."]),
            ("Signature offer", ["Your strongest, safest lane.", "Not the full menu."]),
            ("Say the number", ["with scope and follow-up.", "Ambiguity kills trust."]),
            ("Mistake", ["Copying the clinic", "next door’s price list."]),
            ("Comment NEXT", ["Positioning before price.", "Systems brief."]),
        ],
        "caption_ig": (
            "Stop asking “what should I charge?” first.\n"
            "Ask who you can prove outcomes for — then package it.\n\n"
            "Comment NEXT."
        ),
        "caption_fb": (
            "Pricing panic after training is common.\n"
            "Positioning + one entry offer beats copying a neighbour’s menu.\n\n"
            "Comment NEXT."
        ),
        "caption_li": (
            "New practitioners often start with pricing anxiety.\n\n"
            "A cleaner sequence:\n"
            "1. Who you serve\n2. One entry offer with clear scope\n3. One signature lane\n4. Then the number\n\n"
            "Where do you get stuck — offer design or saying the price?"
        ),
    },
    {
        "copy_id": "COPY-VOC-026",
        "pain_id": "P06",
        "pain": "Posting a lot. Inbox quiet.",
        "pillar": "S4",
        "cta": "NEXT",
        "keyword": "NEXT",
        "slides": [
            ("Posting a lot.", ["Inbox still quiet."]),
            ("Volume ≠ demand.", ["Unclear posts don’t convert."]),
            ("One post = one job", ["One fear. One CTA."]),
            ("Weekly rhythm", ["1 carousel teach", "1 reel hook", "1 proof / process"]),
            ("Hooks from real pain", ["Empty diary. First consult.", "Week-1 chaos."]),
            ("CTA every time", ["FIRST / LAUNCH / MAPS / NEXT", "— pick one."]),
            ("Mistake", ["Only “today in training”", "with no next step."]),
            ("Comment NEXT", ["Content → systems brief."]),
        ],
        "caption_ig": (
            "Posting more won’t fix a quiet inbox.\n"
            "One pain. One lesson. One CTA.\n\n"
            "Comment NEXT."
        ),
        "caption_fb": (
            "Busy feed, empty DMs — usually a clarity problem, not a algorithm curse.\n\n"
            "Comment NEXT for the systems brief."
        ),
        "caption_li": (
            "Content without a job is decoration.\n\n"
            "For early-stage aesthetic practices:\n"
            "• one fear per post\n• one clear CTA\n• weekly mix of teach / hook / proof\n\n"
            "What are you asking the reader to do after each post?"
        ),
    },
    {
        "copy_id": "COPY-VOC-027",
        "pain_id": "P07",
        "pain": "New patient has no reason to trust me.",
        "pillar": "S3",
        "cta": "MAPS",
        "keyword": "MAPS",
        "slides": [
            ("New patient.", ["No reason to trust you yet."]),
            ("Trust is a stack", ["You can build — honestly."]),
            ("No ranking promises", ["We don’t sell “#1 on Maps”.", "We fix what you control."]),
            ("Profile completeness", ["Hours, photos, categories,", "services — finished beats fancy."]),
            ("Response quality", ["Same-day replies signal care.", "Silence is also a message."]),
            ("Proof without fiction", ["Process, education, real labels.", "No bought review schemes."]),
            ("Mistake", ["Chasing rank hacks", "before a complete profile."]),
            ("Comment MAPS", ["Reputation stack outline.", "No guarantees — real work."]),
        ],
        "caption_ig": (
            "Empty trust layer = silent phone.\n"
            "Complete profile. Reply well. Honest proof.\n"
            "No ranking guarantees.\n\n"
            "Comment MAPS."
        ),
        "caption_fb": (
            "Before ads: can a stranger trust you from your public profile?\n\n"
            "Comment MAPS for the reputation stack outline."
        ),
        "caption_li": (
            "Reputation work for new aesthetic practices is operational, not magical.\n\n"
            "Control: completeness, response quality, honest proof.\n"
            "Do not control: guaranteed map rank.\n\n"
            "What’s incomplete on your public profile today?"
        ),
    },
    {
        "copy_id": "COPY-VOC-028",
        "pain_id": "P08",
        "pain": "Still shopping courses instead of first patients.",
        "pillar": "S2",
        "cta": "NEXT",
        "keyword": "NEXT",
        "slides": [
            ("Still asking", ["“which course?”"]),
            ("You may be solving", ["the wrong problem."]),
            ("Another certificate", ["won’t fill next week’s diary."]),
            ("After training", ["you need patients + systems,", "not only more modules."]),
            ("Use schools for skills", ["Use a growth stack", "for demand."]),
            ("Our lane", ["After the certificate.", "Not instead of your academy."]),
            ("Mistake", ["Collecting badges", "while the phone stays quiet."]),
            ("Comment NEXT", ["Post-academy next steps.", "Education — not a product pitch."]),
        ],
        "caption_ig": (
            "If you’re still only shopping courses,\n"
            "you might be delaying first patients.\n\n"
            "Skills from academies. Systems after the certificate.\n\n"
            "Comment NEXT."
        ),
        "caption_fb": (
            "Courses build capability.\n"
            "Demand systems fill diaries.\n\n"
            "Comment NEXT for post-academy next steps."
        ),
        "caption_li": (
            "Continuous training is valuable.\n"
            "Using another certificate to avoid commercial basics is costly.\n\n"
            "Sequence: competent offer → trust → first patients → then advanced modules.\n\n"
            "Are you collecting skills — or delaying launch?"
        ),
    },
]


def F(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def wrap(d: ImageDraw.ImageDraw, t: str, f: ImageFont.ImageFont, mw: int) -> list[str]:
    lines, cur = [], ""
    for w in t.split():
        x = (cur + " " + w).strip()
        if d.textlength(x, font=f) <= mw:
            cur = x
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def chrome(w: int, h: int, bg: tuple, dark: bool = False):
    im = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(im)
    rule = (180, 175, 165) if dark else DARK
    d.rectangle([64, 64, w - 64, 68], fill=rule)
    brand = (200, 210, 215) if dark else ACCENT
    mute = (158, 152, 147) if dark else MUTED
    d.text((64, 88), "CAESTHETIC", fill=brand, font=F(SANS_B, 28))
    d.text((64, 124), "After the certificate", fill=mute, font=F(SANS, 22))
    d.rectangle([64, h - 96, w - 64, h - 92], fill=(70, 65, 60) if dark else BORDER)
    d.text((64, h - 72), "caesthetic.growth", fill=mute, font=F(SANS, 22))
    return im, d


def render_pack(pack: dict) -> None:
    folder = pack["copy_id"]
    n = len(pack["slides"])
    for i, (title, paras) in enumerate(pack["slides"], 1):
        dark = i in (1, n)  # cover + CTA dark
        bg = DARK if dark else (BG if i % 2 else BG2)
        im, d = chrome(1080, 1350, bg, dark)
        mute = (158, 152, 147) if dark else MUTED
        d.text((900, 88), f"{i}/{n}", fill=mute, font=F(MONO, 28))
        tc = WHITE if dark else STRONG
        bc = (220, 215, 208) if dark else TEXT
        y = 200
        tf = F(SERIF, 58)
        for line in wrap(d, title, tf, 1080 - 140):
            d.text((64, y), line, fill=tc, font=tf)
            y += 70
        y += 28
        bf = F(SANS, 34)
        for p in paras:
            for line in wrap(d, p, bf, 1080 - 140):
                d.text((64, y), line, fill=bc, font=bf)
                y += 46
            y += 14
        if i == n:
            d.text(
                (64, 1350 - 160),
                f"Comment {pack['keyword']}",
                fill=(220, 160, 180) if dark else SIGNAL,
                font=F(SANS_B, 30),
            )
        path = OUT / folder / f"slide-{i:02d}.jpg"
        path.parent.mkdir(parents=True, exist_ok=True)
        im.save(path, "JPEG", quality=92, optimize=True)
        print("wrote", path)
    # cover alias
    cover = OUT / folder / "cover.jpg"
    Image.open(OUT / folder / "slide-01.jpg").save(cover, "JPEG", quality=92)
    print("wrote", cover)


def write_csv(packs: list[dict]) -> Path:
    path = OUT / "pains_8.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "copy_id",
        "pain_id",
        "pain",
        "pillar",
        "cta",
        "keyword",
        "slide_1",
        "slide_2",
        "slide_3",
        "slide_4",
        "slide_5",
        "slide_6",
        "slide_7",
        "slide_8",
        "caption_ig",
        "caption_fb",
        "caption_li",
        "status",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for p in packs:
            row = {
                "copy_id": p["copy_id"],
                "pain_id": p["pain_id"],
                "pain": p["pain"],
                "pillar": p["pillar"],
                "cta": p["cta"],
                "keyword": p["keyword"],
                "caption_ig": p["caption_ig"],
                "caption_fb": p["caption_fb"],
                "caption_li": p["caption_li"],
                "status": "DRAFT",
            }
            for i, (title, paras) in enumerate(p["slides"], 1):
                row[f"slide_{i}"] = title + " | " + " / ".join(paras)
            w.writerow(row)
    return path


def write_captions(packs: list[dict]) -> Path:
    path = OUT / "captions.md"
    lines = ["# CAESTHETIC VOC batch — captions (COPY-VOC-021…028)", ""]
    for p in packs:
        lines += [
            f"## {p['copy_id']} — {p['pain']}",
            f"Pillar `{p['pillar']}` · CTA `{p['cta']}`",
            "",
            "### IG",
            "```",
            p["caption_ig"],
            "```",
            "",
            "### FB",
            "```",
            p["caption_fb"],
            "```",
            "",
            "### LI",
            "```",
            p["caption_li"],
            "```",
            "",
            f"Assets: `tmp/cae-ig-voc/batch/{p['copy_id']}/`",
            "",
        ]
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def write_seed_json(packs: list[dict]) -> Path:
    path = OUT / "copy_bank_seed.json"
    rows = []
    for p in packs:
        rows.append(
            {
                "copy_id": p["copy_id"],
                "surface_id": "B_CAE_IG",
                "pillar": p["pillar"],
                "keyword": p["keyword"],
                "hook": p["slides"][0][0] + " " + " ".join(p["slides"][0][1]),
                "body": p["caption_ig"],
                "cta": f"Comment {p['keyword']}",
                "format": "carousel",
                "image_brief": f"8 slides 1080x1350 Clinical Editorial; folder {p['copy_id']}",
                "image_asset_url": f"tmp/cae-ig-voc/batch/{p['copy_id']}/",
                "caption_fb": p["caption_fb"],
                "caption_li": p["caption_li"],
                "compliance_ok": "true",
                "isolation_ok": "true",
                "status": "DRAFT",
                "pain_id": p["pain_id"],
                "pain": p["pain"],
            }
        )
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    csv_path = write_csv(PACKS)
    cap_path = write_captions(PACKS)
    seed_path = write_seed_json(PACKS)
    for p in PACKS:
        render_pack(p)
    print("CSV", csv_path)
    print("captions", cap_path)
    print("seed", seed_path)
    print("DONE →", OUT)


if __name__ == "__main__":
    main()
