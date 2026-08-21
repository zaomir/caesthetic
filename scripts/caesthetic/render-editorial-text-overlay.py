#!/usr/bin/env python3
"""Preview renderer for VALERIE_EDITORIAL_TEXT_OVERLAY_V1. Not locked."""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/var/www/grainee-v2")
SPEC_DIR = ROOT / "docs/projects/caesthetic/operations/ig-growth/editorial-overlay"
POSE_DIR = ROOT / "docs/projects/caesthetic/operations/ig-growth/footage/valerie-pose-library"
OUT_DIR = POSE_DIR / "_overlay-v1-preview"
W, H = 1080, 1920

# Reuse composition analysis from the locked still-card renderer.
sys.path.insert(0, str(ROOT / "scripts/caesthetic"))
from importlib.machinery import SourceFileLoader

_card = SourceFileLoader(
    "render_editorial_story_card",
    str(ROOT / "scripts/caesthetic/render-editorial-story-card.py"),
).load_module()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    r, g, b = hex_rgb(value)
    return r, g, b, alpha


def cream_atmosphere_side(side: str, fade_end: int, text_cy: int, spec: dict) -> Image.Image:
    """Localized cream wash around the text column — not a full-height slab."""
    cream = hex_rgb(spec["colors"]["cream"])
    atm = spec["side"]["atmosphere"]
    max_a = atm["edge_alpha"]
    half_y = atm["vertical_half_px"]
    px_pow = atm["power_x"]
    py_pow = atm["power_y"]
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = overlay.load()
    if side == "left":
        n = max(1, min(W, fade_end))
        x0, x1 = 0, n
    else:
        n = max(1, W - fade_end)
        x0, x1 = W - n, W
    y0 = max(0, text_cy - half_y)
    y1 = min(H, text_cy + half_y)
    last_x = max(1, n - 1)
    for y in range(y0, y1):
        ty = abs(y - text_cy) / half_y
        fy = max(0.0, 1.0 - ty) ** py_pow
        if fy <= 0:
            continue
        for x in range(x0, x1):
            if side == "left":
                tx = x / last_x
                fx = (1.0 - tx) ** px_pow
            else:
                tx = (x - x0) / last_x
                fx = tx ** px_pow
            a = int(255 * max_a * fx * fy)
            if a > 0:
                px[x, y] = (*cream, a)
    return overlay


def cream_bottom_page(base: Image.Image, spec: dict) -> Image.Image:
    ratio = spec["bottom"]["panel_ratio"]
    fade = spec["bottom"]["fade_px"]
    max_a = spec["bottom"]["panel_max_alpha"]
    cream = hex_rgb(spec["colors"]["cream"])
    panel_top = int(H * (1 - ratio))
    work = base.convert("RGBA")
    blur_band = work.crop((0, max(0, panel_top - fade), W, H)).filter(
        ImageFilter.GaussianBlur(spec["bottom"]["blur_px"])
    )
    work.paste(blur_band, (0, max(0, panel_top - fade)))
    start = max(0, panel_top - fade)
    h = H - start
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = overlay.load()
    for i in range(h):
        y = start + i
        if y < panel_top:
            t = (y - start) / max(1, fade)
            row_a = max_a * (t**1.55)
        else:
            row_a = max_a
        for x in range(W):
            edge = min(x, W - 1 - x) / 72
            side_keep = min(1.0, 0.55 + 0.45 * min(1.0, edge))
            a = int(255 * row_a * side_keep)
            if a > 0:
                px[x, y] = (*cream, a)
    return Image.alpha_composite(work, overlay)


def wrap_words(text: str, draw, fnt, max_w: int, max_lines: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for word in words:
        trial = word if not cur else f"{cur} {word}"
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines[:max_lines]


def draw_copy(draw, spec, layout: str, episode: dict, side_x: int) -> dict:
    navy = hex_rgba(spec["colors"]["navy"])
    burgundy = hex_rgba(spec["colors"]["burgundy"])
    if layout.startswith("SIDE"):
        block = spec["side"]
        x = side_x
        y_head = block["headline_y"]
        col_w = block["column_w"]
    else:
        block = spec["bottom"]
        x = block["margin_x"]
        y_head = block["headline_y"]
        col_w = block["column_w"]

    head_f = font(spec["fonts"]["headline"], block["headline_size_px"])
    sup_f = font(spec["fonts"]["support"], block["support_size_px"])
    rule = spec["accent_line"]
    highlight = (episode.get("highlight") or "").upper()
    lines = [ln.upper() for ln in episode["headline"]]

    rule_y1 = y_head - rule["gap_before_headline_px"] - rule["h"]
    draw.rectangle((x, rule_y1, x + rule["w"], rule_y1 + rule["h"]), fill=burgundy)

    y = y_head
    lh = int(block["headline_size_px"] * block["headline_line_height"])
    highlight_used = 0
    for line in lines:
        cursor = x
        if highlight and highlight in line:
            parts = line.split(highlight)
            for i, part in enumerate(parts):
                if part:
                    draw.text((cursor, y), part, font=head_f, fill=navy)
                    cursor += draw.textlength(part, font=head_f)
                if i < len(parts) - 1:
                    draw.text((cursor, y), highlight, font=head_f, fill=burgundy)
                    cursor += draw.textlength(highlight, font=head_f)
                    highlight_used += 1
        else:
            draw.text((x, y), line, font=head_f, fill=navy)
        y += lh

    rule_y2 = y + rule["gap_after_headline_px"]
    draw.rectangle((x, rule_y2, x + rule["w"], rule_y2 + rule["h"]), fill=burgundy)
    y = rule_y2 + rule["h"] + rule["gap_after_rule_to_support_px"]
    support_lines = wrap_words(episode["support"], draw, sup_f, col_w, block["support_max_lines"])
    slh = int(block["support_size_px"] * block["support_line_height"])
    for line in support_lines:
        draw.text((x, y), line, font=sup_f, fill=navy)
        y += slh
    return {"highlight_count": highlight_used, "text_box": (x, rule_y1, x + col_w, y), "headline_y": y_head}


def draw_tracked(draw, text, xy, fnt, fill, tracking_em: float) -> None:
    x, y = xy
    space = fnt.size * tracking_em
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + space


def lockup_atmosphere(base: Image.Image, spec: dict) -> Image.Image:
    """Soft cream wash under the lockup only — not a bar."""
    cream = hex_rgb(spec["colors"]["cream"])
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = overlay.load()
    cx, cy = 210, 118
    rx, ry = 210, 70
    for y in range(max(0, cy - ry), min(H, cy + ry)):
        for x in range(max(0, cx - rx), min(W, cx + rx)):
            nx = (x - cx) / rx
            ny = (y - cy) / ry
            d = nx * nx + ny * ny
            if d >= 1:
                continue
            a = int(255 * 0.55 * ((1 - d) ** 1.8))
            if a > 0:
                px[x, y] = (*cream, a)
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def draw_brand(base: Image.Image, spec: dict, hex_mark: Image.Image, episode_no: int) -> Image.Image:
    im = lockup_atmosphere(base, spec)
    im.paste(hex_mark, (spec["hex_mark"]["x"], spec["hex_mark"]["y"]), hex_mark)
    draw = ImageDraw.Draw(im)
    mark_f = font(spec["fonts"]["mark"], spec["brand_lockup"]["wordmark"]["size_px"])
    ser_f = font(spec["fonts"]["series"], spec["brand_lockup"]["series"]["size_px"])
    ax, ay = spec["brand_lockup"]["x"], spec["brand_lockup"]["y"]
    wm = spec["brand_lockup"]["wordmark"]
    se = spec["brand_lockup"]["series"]
    draw_tracked(draw, wm["text"], (ax + wm["dx"], ay + wm["dy"]), mark_f, hex_rgba(wm["color"]), wm["tracking_em"])
    label = f"{se['prefix']} {episode_no:03d}"
    draw_tracked(draw, label, (ax + se["dx"], ay + se["dy"]), ser_f, hex_rgba(se["color"]), se["tracking_em"])
    return im


def render_one(src: Path, episode: dict, spec: dict, hex_mark: Image.Image, dest: Path) -> dict:
    raw = Image.open(src)
    analysis_spec = {
        **spec,
        "analysis": {
            **spec["analysis"],
            "occupancy_threshold": 0.11,
            "hair_core_threshold": 0.16,
            "text_band": {"y0": 360, "y1": 1180},
        },
    }
    safety = episode.get("safety")
    if safety:
        prefer = "left" if safety.get("subject_x0", 0) >= 0.30 else "right"
        if safety.get("second_person") or (safety.get("subject_x1", 1) - safety.get("subject_x0", 0)) > 0.70:
            prefer = None
        base, meta = _card.cover_window(raw, prefer)
        analysis = _card.analysis_from_safety(safety, meta)
    else:
        probe = _card.cover_preserve_side(raw, None)
        probe_an = _card.analyze(probe, analysis_spec)
        prefer = "left" if probe_an["left_free_px"] >= probe_an["right_free_px"] else "right"
        if probe_an.get("second_face"):
            prefer = None
        base, _meta = _card.cover_window(raw, prefer)
        analysis = _card.analyze(base, analysis_spec)
    choice = _card.pick_layout(analysis, spec)
    layout = episode.get("force_layout") or choice["layout"]

    work = base.convert("RGBA")
    text_cy = spec["side"]["headline_y"] + 140
    if layout == "SIDE_EDITORIAL_LEFT":
        fade_end = spec["side"]["margin_x"] + spec["side"]["column_w"] + 28
        if analysis.get("face"):
            fade_end = min(fade_end + 40, analysis["face"]["x0"] - spec["side"]["atmosphere"]["stop_before_subject_px"])
        fade_end = max(360, fade_end)
        work = Image.alpha_composite(work, cream_atmosphere_side("left", fade_end, text_cy, spec))
        side_x = spec["side"]["margin_x"]
    elif layout == "SIDE_EDITORIAL_RIGHT":
        fade_start = W - spec["side"]["margin_x"] - spec["side"]["column_w"] - 28
        if analysis.get("face"):
            fade_start = max(fade_start, analysis["face"]["x1"] + spec["side"]["atmosphere"]["stop_before_subject_px"])
        fade_start = min(W - 340, fade_start)
        work = Image.alpha_composite(work, cream_atmosphere_side("right", fade_start, text_cy, spec))
        side_x = W - spec["side"]["margin_x"] - spec["side"]["column_w"]
    else:
        work = cream_bottom_page(work, spec)
        side_x = spec["bottom"]["margin_x"]

    work = draw_brand(work, spec, hex_mark, episode["episode"])
    draw = ImageDraw.Draw(work)
    copy_info = draw_copy(draw, spec, layout, episode, side_x)
    dest.parent.mkdir(parents=True, exist_ok=True)
    work.convert("RGB").save(dest, "PNG")

    face_hit = _card.intersects(analysis.get("face"), copy_info["text_box"])
    eyes_hit = _card.intersects(analysis.get("eyes"), copy_info["text_box"])
    hands_hit = _card.intersects(analysis.get("hands"), copy_info["text_box"])
    return {
        "file": dest.name,
        "scene": episode["scene"],
        "source": src.name,
        "layout": layout,
        "episode": episode["episode"],
        "brand_xy": [spec["brand_lockup"]["x"], spec["brand_lockup"]["y"]],
        "highlight_count": copy_info["highlight_count"],
        "face_overlap": face_hit,
        "eyes_overlap": eyes_hit,
        "hands_overlap": hands_hit,
        "left_ok": choice["left_ok"],
        "right_ok": choice["right_ok"],
        "pass": (not face_hit) and (not eyes_hit) and spec["brand_lockup"]["x"] == 72 and spec["brand_lockup"]["y"] == 90,
    }


def contact_sheet(paths: list[Path], labels: list[str], dest: Path) -> None:
    cols = 3
    rows = math.ceil(len(paths) / cols)
    tw, th = 360, 640
    pad = 16
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * pad, rows * th + (rows + 1) * pad + 48), (245, 239, 230))
    draw = ImageDraw.Draw(sheet)
    fnt = font("/usr/share/fonts/truetype/ibm-plex/IBMPlexSans-SemiBold.ttf", 16)
    draw.text((pad, 14), "VALERIE_EDITORIAL_TEXT_OVERLAY_V1  ·  preview — not locked", fill=(11, 36, 56), font=fnt)
    for i, path in enumerate(paths):
        r, c = divmod(i, cols)
        thumb = Image.open(path).convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        x = pad + c * (tw + pad)
        y = 48 + pad + r * (th + pad)
        sheet.paste(thumb, (x, y))
        draw.rectangle((x, y + th - 36, x + tw, y + th), fill=(11, 36, 56))
        draw.text((x + 10, y + th - 28), labels[i], fill=(245, 239, 230), font=fnt)
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, "PNG")


def main() -> int:
    spec = load_json(SPEC_DIR / "VALERIE_EDITORIAL_TEXT_OVERLAY_V1.json")
    pack = load_json(SPEC_DIR / "preview-6.json")
    hex_mark = _card.load_hex_mark(ROOT / spec["hex_mark"]["source"], spec["hex_mark"]["size_px"])
    reports = []
    for item in pack["cards"]:
        src = ROOT / item["photo"]
        dest = OUT_DIR / f"{item['scene']}.png"
        reports.append(render_one(src, item, spec, hex_mark, dest))
        print(f"{item['scene']} → {reports[-1]['layout']} pass={reports[-1]['pass']}")
    contact_sheet(
        [OUT_DIR / r["file"] for r in reports],
        [f"{r['scene']}  {r['layout'].replace('_EDITORIAL', '')}" for r in reports],
        OUT_DIR / "contact-sheet.png",
    )
    (OUT_DIR / "qa-report.json").write_text(json.dumps({"template": spec["id"], "status": spec["status"], "cards": reports}, indent=2) + "\n")
    print(f"wrote {len(reports)} previews → {OUT_DIR}")
    return 0 if all(r["pass"] for r in reports) else 1


if __name__ == "__main__":
    sys.exit(main())
