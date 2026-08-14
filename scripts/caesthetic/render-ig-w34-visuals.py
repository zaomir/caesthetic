#!/usr/bin/env python3
"""Render CAESTHETIC W34 IG visuals (Clinical Editorial tokens) → tmp/cae-ig-w34/.

Upload: rclone sync tmp/cae-ig-w34/COPY-CAE-0NN/ dropbox:SIMON_OPS/content/B_CAE_IG/COPY-CAE-0NN/
Fonts: DejaVu stand-in for Source Serif 4 / IBM Plex (DESIGN.md).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("/var/www/grainee-v2/tmp/cae-ig-w34")
BG, BG2, DARK = (245, 247, 248), (240, 237, 230), (26, 23, 20)
TEXT, STRONG, MUTED = (26, 23, 20), (13, 11, 9), (107, 101, 96)
ACCENT, SIGNAL, BORDER = (28, 58, 74), (123, 36, 75), (212, 207, 197)
WHITE = (255, 255, 255)
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def F(p, n): return ImageFont.truetype(p, n)

def wrap(d, t, f, mw):
    lines, cur = [], ""
    for w in t.split():
        x = (cur + " " + w).strip()
        if d.textlength(x, font=f) <= mw: cur = x
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def chrome(w, h, bg, dark=False):
    im = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(im)
    rule = (180, 175, 165) if dark else DARK
    d.rectangle([64, 64, w - 64, 68], fill=rule)
    brand = (200, 210, 215) if dark else ACCENT
    mute = (158, 152, 147) if dark else MUTED
    d.text((64, 88), "CAESTHETIC", fill=brand, font=F(SANS_B, 28))
    d.text((64, 124), "Growth systems for specialist practices", fill=mute, font=F(SANS, 22))
    d.rectangle([64, h - 96, w - 64, h - 92], fill=(70, 65, 60) if dark else BORDER)
    d.text((64, h - 72), "caesthetic.com", fill=mute, font=F(SANS, 22))
    return im, d

def body(im, d, title, paras, foot=None, dark=False):
    w, h = im.size
    tc = WHITE if dark else STRONG
    bc = (220, 215, 208) if dark else TEXT
    y = 200
    tf = F(SERIF, 64)
    for line in wrap(d, title, tf, w - 140):
        d.text((64, y), line, fill=tc, font=tf); y += 78
    y += 36
    bf = F(SANS, 36)
    for p in paras:
        for line in wrap(d, p, bf, w - 140):
            d.text((64, y), line, fill=bc, font=bf); y += 48
        y += 20
    if foot:
        d.text((64, h - 160), foot, fill=(220, 160, 180) if dark else SIGNAL, font=F(SANS_B, 28))

def save(im, folder, name):
    p = OUT / folder / name
    p.parent.mkdir(parents=True, exist_ok=True)
    im.save(p, "JPEG", quality=92, optimize=True)
    print("wrote", p)

def main():
    s017 = [
        ("The 11-minute rule.", ["If a high-ticket enquiry waits past the first response window, your ads paid for someone else's consult."], "Save for your ops meeting"),
        ("The enquiry clock", ["First reply window is an ops metric — not an admin courtesy.", "Track median minutes to first human response."], None),
        ("Who owns the thread?", ["Name one owner per unfinished enquiry.", "If ownership is \"the inbox\", it is no one."], None),
        ("After-hours trap", ["Leads after 18:00 still need a rule: who answers, when, and what happens next morning."], None),
        ("3-line checklist", ["1. Timestamp every new enquiry.", "2. Assign owner within the window.", "3. Review unfinished threads daily."], None),
        ("Save this", ["Bring it to your next ops meeting.", "Compare your real median reply time — not the hoped-for one."], None),
        ("Written growth assessment", ["Link in bio.", "Maps, demand, CRM, reputation — as one system."], "caesthetic.com · assessment"),
    ]
    for i, (t, paras, foot) in enumerate(s017, 1):
        dark = i == 7
        im, d = chrome(1080, 1350, DARK if dark else (BG if i % 2 else BG2), dark)
        d.text((940, 88), f"{i}/7", fill=(158, 152, 147) if dark else MUTED, font=F(MONO, 28))
        body(im, d, t, paras, foot, dark); save(im, "COPY-CAE-017", f"slide-{i:02d}.jpg")

    frames = [
        ("Certificate done.", ["Week 1 starts here."], True),
        ("Not a product catalogue.", ["First-patient systems: where enquiries come from, who replies, what you measure."], False),
        ("Three beats", ["1. Enquiry source", "2. Reply owner", "3. Week-1 scoreboard"], False),
        ("Comment LAUNCH", ["Get the 1-page launch checklist in DM.", "Education only. Not medical advice. Not a product offer."], True),
    ]
    for i, (t, paras, dark) in enumerate(frames, 1):
        im = Image.new("RGB", (1080, 1920), DARK if dark else BG)
        d = ImageDraw.Draw(im)
        d.rectangle([64, 80, 1016, 84], fill=(180, 175, 165) if dark else DARK)
        d.text((64, 110), "CAESTHETIC", fill=(200, 210, 215) if dark else ACCENT, font=F(SANS_B, 32))
        d.text((64, 160), "After the certificate", fill=(158, 152, 147) if dark else MUTED, font=F(SANS, 26))
        y = 420
        tc = WHITE if dark else STRONG
        for line in wrap(d, t, F(SERIF, 72), 950):
            d.text((64, y), line, fill=tc, font=F(SERIF, 72)); y += 90
        y += 40
        for p in paras:
            for line in wrap(d, p, F(SANS, 40), 950):
                d.text((64, y), line, fill=(220, 215, 208) if dark else TEXT, font=F(SANS, 40)); y += 54
            y += 18
        d.rectangle([64, 1800, 1016, 1804], fill=(70, 65, 60) if dark else BORDER)
        d.text((64, 1830), "Comment LAUNCH  ·  caesthetic.growth", fill=(220, 160, 180) if dark else SIGNAL, font=F(SANS_B, 28))
        save(im, "COPY-CAE-018", f"frame-{i:02d}.jpg")
    Image.open(OUT / "COPY-CAE-018" / "frame-01.jpg").save(OUT / "COPY-CAE-018" / "cover.jpg", "JPEG", quality=92)

    s019 = [
        ("Reputation stack — without buying reviews.", ["The trust work you control. No ranking guarantees."], None),
        ("Profile completeness", ["Hours, photos, categories, services — finished beats fancy."], None),
        ("Same-day replies", ["Response quality is visible. Silence is also a signal."], None),
        ("Honest labels", ["Say what is fact vs estimate. Invented proof destroys trust."], None),
        ("What we never promise", ["No \"#1 on maps\". No bought review schemes. No fabricated metrics."], None),
        ("Next step", ["Save this. Link in bio for a written growth assessment."], "caesthetic.com · assessment"),
    ]
    for i, (t, paras, foot) in enumerate(s019, 1):
        dark = i == 6
        im, d = chrome(1080, 1350, DARK if dark else (BG if i % 2 else BG2), dark)
        d.text((940, 88), f"{i}/6", fill=(158, 152, 147) if dark else MUTED, font=F(MONO, 28))
        body(im, d, t, paras, foot, dark); save(im, "COPY-CAE-019", f"slide-{i:02d}.jpg")

    stories = [
        ("Where are you?", "Poll sticker: Training · New practice · Multi-location", False),
        ("Ops tip", "Reply window after a new enquiry is an ops metric — not admin courtesy.", False),
        ("After the certificate", "Week-1 checklist lives in Highlights → Graduate toolkit.", False),
        ("Save reminder", "Mon carousel: the 11-minute rule. Save for your ops meeting.", False),
        ("Assessment", "Link sticker → bio. Written growth brief — not a product pitch.", True),
    ]
    for i, (t, para, dark) in enumerate(stories, 1):
        im = Image.new("RGB", (1080, 1920), DARK if dark else BG2)
        d = ImageDraw.Draw(im)
        d.rectangle([64, 80, 1016, 84], fill=(180, 175, 165) if dark else DARK)
        d.text((64, 110), "CAESTHETIC", fill=(200, 210, 215) if dark else ACCENT, font=F(SANS_B, 32))
        d.text((64, 160), f"Story {i}/5", fill=(158, 152, 147) if dark else MUTED, font=F(MONO, 24))
        y = 520
        for line in wrap(d, t, F(SERIF, 64), 950):
            d.text((64, y), line, fill=WHITE if dark else STRONG, font=F(SERIF, 64)); y += 80
        y += 40
        for line in wrap(d, para, F(SANS, 38), 950):
            d.text((64, y), line, fill=(220, 215, 208) if dark else TEXT, font=F(SANS, 38)); y += 52
        d.text((64, 1830), "caesthetic.growth", fill=(158, 152, 147) if dark else MUTED, font=F(SANS, 26))
        save(im, "COPY-CAE-020", f"story-{i:02d}.jpg")
    print("DONE →", OUT)
    print("Then: ffmpeg slideshow for COPY-CAE-018 + rclone sync to Dropbox")

if __name__ == "__main__":
    main()
