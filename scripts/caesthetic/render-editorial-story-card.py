#!/usr/bin/env python3
"""Render VALERIE_EDITORIAL_STORY_CARD_V2 stills from pose-library plates."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

import argparse

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/var/www/grainee-v2")
CARD_DIR = ROOT / "docs/projects/caesthetic/operations/ig-growth/editorial-story-card"
POSE_DIR = ROOT / "docs/projects/caesthetic/operations/ig-growth/footage/valerie-pose-library"
OUT_DIR = POSE_DIR / "_editorial-v2"
W, H = 1080, 1920


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


def tracked_width(draw: ImageDraw.ImageDraw, text: str, fnt, tracking_em: float) -> float:
    if not text:
        return 0.0
    space = fnt.size * tracking_em
    return sum(draw.textlength(ch, font=fnt) for ch in text) + space * (len(text) - 1)


def draw_tracked(draw, text, xy, fnt, fill, tracking_em: float) -> None:
    x, y = xy
    space = fnt.size * tracking_em
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + space


def load_hex_mark(src: Path, size: int) -> Image.Image:
    cache = CARD_DIR / f"_hex-mark-{size}.png"
    if cache.exists():
        return Image.open(cache).convert("RGBA")
    im = Image.open(src).convert("RGBA")
    im.thumbnail((220, 220), Image.Resampling.LANCZOS)
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 210 and g > 200 and b > 185 and abs(r - g) < 28:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im = im.resize((size, size), Image.Resampling.LANCZOS)
    cache.parent.mkdir(parents=True, exist_ok=True)
    im.save(cache, "PNG")
    return im


def is_hair(r: int, g: int, b: int) -> bool:
    # Ginger/copper only — exclude golden-hour stone (high L, lower red dominance).
    return r >= 130 and r > g + 35 and r > b + 50 and 35 < g < 125 and b < 90 and (r + g + b) < 430


def is_skin(r: int, g: int, b: int) -> bool:
    return (
        145 <= r <= 225
        and 75 <= g <= 175
        and 55 <= b <= 145
        and (r - g) >= 15
        and (r - b) >= 28
        and (g - b) >= 0
        and (max(r, g, b) - min(r, g, b)) >= 28
    )


def _pts_bbox(pts: list[tuple[int, int]], scale: int, w: int, h: int, pad=16):
    if len(pts) < 10:
        return None
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return {
        "x0": max(0, min(xs) * scale - pad),
        "y0": max(0, min(ys) * scale - pad),
        "x1": min(w, max(xs) * scale + pad),
        "y1": min(h, max(ys) * scale + pad),
    }


def _density_clusters(pts: list[tuple[int, int]], bin_size: int = 10, min_count: int = 8) -> list[list[tuple[int, int]]]:
    if not pts:
        return []
    bins: dict[tuple[int, int], int] = {}
    for x, y in pts:
        bins[(x // bin_size, y // bin_size)] = bins.get((x // bin_size, y // bin_size), 0) + 1
    peaks = sorted(bins.items(), key=lambda kv: kv[1], reverse=True)
    used = set()
    clusters = []
    for (bx, by), count in peaks:
        if count < min_count or (bx, by) in used:
            continue
        cx, cy = bx * bin_size + bin_size / 2, by * bin_size + bin_size / 2
        cluster = [p for p in pts if abs(p[0] - cx) < 32 and abs(p[1] - cy) < 40]
        if len(cluster) < 12:
            continue
        clusters.append(cluster)
        for ox in range(bx - 3, bx + 4):
            for oy in range(by - 3, by + 4):
                used.add((ox, oy))
        if len(clusters) >= 3:
            break
    return clusters


def analyze(im: Image.Image, spec: dict) -> dict:
    scale = spec["analysis"]["downscale"]
    small = im.resize((im.width // scale, im.height // scale), Image.Resampling.BILINEAR)
    sw, sh = small.size
    px = small.load()
    fy0 = max(0, spec["analysis"]["face_band"]["y0"] // scale)
    fy1 = min(sh, spec["analysis"]["face_band"]["y1"] // scale)

    skin_pts = []
    hair_raw = []
    for y in range(sh):
        for x in range(sw):
            r, g, b = px[x, y][:3]
            if is_skin(r, g, b) and fy0 <= y <= fy1:
                skin_pts.append((x, y))
            if is_hair(r, g, b):
                hair_raw.append((x, y))

    face_clusters = _density_clusters(skin_pts)
    face = _pts_bbox(face_clusters[0], scale, im.width, im.height, pad=20) if face_clusters else None
    second_face = None
    if len(face_clusters) >= 2 and face:
        other = _pts_bbox(face_clusters[1], scale, im.width, im.height, pad=16)
        if other:
            dx = abs((other["x0"] + other["x1"]) / 2 - (face["x0"] + face["x1"]) / 2)
            dy = abs((other["y0"] + other["y1"]) / 2 - (face["y0"] + face["y1"]) / 2)
            if dx > 180 or dy > 220:
                second_face = other

    if face:
        fx0 = face["x0"] / scale - 36
        fx1 = face["x1"] / scale + 36
        fy_top = face["y0"] / scale - 24
        fy_bot = face["y1"] / scale + 28
        hair_pts = [p for p in hair_raw if fx0 <= p[0] <= fx1 and fy_top <= p[1] <= fy_bot]
    else:
        hair_pts = []
    hair = _pts_bbox(hair_pts, scale, im.width, im.height, pad=12)

    hands = None
    eyes = None
    if face:
        fh = max(1, face["y1"] - face["y0"])
        fw = face["x1"] - face["x0"]
        eyes = {
            "x0": face["x0"] + int(fw * 0.14),
            "y0": face["y0"] + int(fh * 0.22),
            "x1": face["x1"] - int(fw * 0.14),
            "y1": face["y0"] + int(fh * 0.50),
        }

    if face:
        subject_x0 = face["x0"] - 12
        subject_x1 = face["x1"] + 12
        if hair:
            subject_x0 = min(subject_x0, hair["x0"])
            subject_x1 = max(subject_x1, hair["x1"])
        subject_cx = (face["x0"] + face["x1"]) / 2
    else:
        subject_x0, subject_x1, subject_cx = int(W * 0.35), int(W * 0.65), W / 2
    if second_face:
        subject_x0 = min(subject_x0, second_face["x0"])
        subject_x1 = max(subject_x1, second_face["x1"])
    subject_x0 = max(0, int(subject_x0))
    subject_x1 = min(W, int(subject_x1))

    left_free = subject_x0
    right_free = W - subject_x1

    def band_noise(x0: int, x1: int) -> float:
        x0s, x1s = max(0, x0 // scale), min(sw, max(x0, x1) // scale)
        if x1s <= x0s:
            return 0.0
        y0s, y1s = 90 // scale, 300 // scale
        acc = n = 0
        for x in range(x0s, x1s, 2):
            for y in range(y0s, y1s, 2):
                r, g, b = px[x, y][:3]
                acc += max(r, g, b) - min(r, g, b)
                n += 1
        return (acc / n) / 255 if n else 0.0

    return {
        "left_free_px": left_free,
        "right_free_px": right_free,
        "left_noise": round(band_noise(0, max(1, left_free)), 4),
        "right_noise": round(band_noise(W - max(1, right_free), W), 4),
        "face": face,
        "eyes": eyes,
        "hair": hair,
        "hands": hands,
        "second_face": second_face,
        "subject_cx": subject_cx,
        "subject_x0": subject_x0,
        "subject_x1": subject_x1,
    }


def intersects(a: dict | None, b: tuple[int, int, int, int], pad: int = 0) -> bool:
    if not a:
        return False
    x0, y0, x1, y1 = b
    return not (
        a["x1"] + pad <= x0 or a["x0"] - pad >= x1 or a["y1"] + pad <= y0 or a["y0"] - pad >= y1
    )


def cover_window(src: Image.Image, prefer: str | None) -> tuple[Image.Image, dict]:
    im = src.convert("RGB")
    scale = max(W / im.width, H / im.height)
    nw, nh = int(im.width * scale + 0.5), int(im.height * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    max_x = max(0, nw - W)
    max_y = max(0, nh - H)
    left = max_x // 2
    top = max_y // 2
    if prefer == "left":
        left = 0
    elif prefer == "right":
        left = max_x
    crop = im.crop((left, top, left + W, top + H))
    meta = {"scale": scale, "src_w": src.width, "src_h": src.height, "left": left, "top": top}
    return crop, meta


def cover_preserve_side(src: Image.Image, prefer: str | None) -> Image.Image:
    crop, _ = cover_window(src, prefer)
    return crop


def map_frac_box(frac: list[float] | None, meta: dict) -> dict | None:
    if not frac or len(frac) != 4:
        return None
    x0, y0, x1, y1 = frac
    return {
        "x0": int(x0 * meta["src_w"] * meta["scale"] - meta["left"]),
        "y0": int(y0 * meta["src_h"] * meta["scale"] - meta["top"]),
        "x1": int(x1 * meta["src_w"] * meta["scale"] - meta["left"]),
        "y1": int(y1 * meta["src_h"] * meta["scale"] - meta["top"]),
    }


def analysis_from_safety(safety: dict, meta: dict) -> dict:
    face = map_frac_box(safety.get("face"), meta)
    hair = map_frac_box(safety.get("hair"), meta)
    hands = map_frac_box(safety.get("hands"), meta)
    second = map_frac_box(safety.get("second_face"), meta)
    sx0 = int(safety["subject_x0"] * meta["src_w"] * meta["scale"] - meta["left"])
    sx1 = int(safety["subject_x1"] * meta["src_w"] * meta["scale"] - meta["left"])
    sx0 = max(0, min(W, sx0))
    sx1 = max(0, min(W, sx1))
    eyes = None
    if face:
        fh = max(1, face["y1"] - face["y0"])
        fw = face["x1"] - face["x0"]
        eyes = {
            "x0": face["x0"] + int(fw * 0.14),
            "y0": face["y0"] + int(fh * 0.22),
            "x1": face["x1"] - int(fw * 0.14),
            "y1": face["y0"] + int(fh * 0.50),
        }
    return {
        "left_free_px": sx0,
        "right_free_px": W - sx1,
        "left_noise": 0.12,
        "right_noise": 0.18,
        "face": face,
        "eyes": eyes,
        "hair": hair,
        "hands": hands,
        "second_face": second if safety.get("second_person") else None,
        "subject_cx": (sx0 + sx1) / 2,
        "subject_x0": sx0,
        "subject_x1": sx1,
    }


def pick_layout(analysis: dict, spec: dict) -> dict:
    min_w = int(W * spec["side"]["min_safe_ratio"])
    col_w = spec["side"]["column_w"]
    margin = spec["side"]["margin_x"]
    hy = spec["side"]["headline_y"]
    text_h = 420
    left_box = (margin, hy - 40, margin + col_w, hy + text_h)
    right_box = (W - margin - col_w, hy - 40, W - margin, hy + text_h)
    hard = [analysis.get("face"), analysis.get("eyes")]

    def side_ok(free_px: int, box: tuple[int, int, int, int]) -> bool:
        if free_px < min_w:
            return False
        for m in hard:
            if intersects(m, box, pad=12):
                return False
        hair = analysis.get("hair")
        if hair and intersects(hair, box, pad=0):
            overlap_w = min(box[2], hair["x1"]) - max(box[0], hair["x0"])
            if overlap_w > col_w * 0.22:
                return False
        return True

    if analysis.get("second_face"):
        left_ok = False
        right_ok = False
    else:
        left_ok = side_ok(analysis["left_free_px"], left_box)
        right_ok = side_ok(analysis["right_free_px"], right_box)

    if left_ok and right_ok:
        left_score = analysis["left_free_px"] - analysis["left_noise"] * 180
        right_score = analysis["right_free_px"] - analysis["right_noise"] * 180
        cx = analysis.get("subject_cx") or W / 2
        # do not compete with gaze / subject direction
        if cx > W * 0.55:
            left_score += 40
        elif cx < W * 0.45:
            right_score += 40
        chosen = "SIDE_EDITORIAL_LEFT" if left_score >= right_score else "SIDE_EDITORIAL_RIGHT"
    elif left_ok:
        chosen = "SIDE_EDITORIAL_LEFT"
    elif right_ok:
        chosen = "SIDE_EDITORIAL_RIGHT"
    else:
        chosen = "BOTTOM_EDITORIAL"

    return {
        "layout": chosen,
        "left_ok": left_ok,
        "right_ok": right_ok,
        "left_box": left_box,
        "right_box": right_box,
    }


def _alpha_ramp(n: int, max_a: float, power: float, reverse: bool = False) -> Image.Image:
    strip = Image.new("L", (max(1, n), 1))
    px = strip.load()
    last = max(1, n - 1)
    for x in range(n):
        t = x / last
        a = int(255 * max_a * ((1 - t) ** power))
        px[x, 0] = a
    if reverse:
        strip = strip.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return strip.resize((n, H), Image.Resampling.BILINEAR)


def cream_side_gradient(side: str, fade_end: int, spec: dict) -> Image.Image:
    cream = hex_rgb(spec["colors"]["cream_warm"])
    max_a = spec["side"]["gradient"]["max_alpha"]
    power = spec["side"]["gradient"]["power"]
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if side == "left":
        n = max(1, min(W, fade_end))
        alpha = _alpha_ramp(n, max_a, power)
        color = Image.new("RGBA", (n, H), (*cream, 255))
        color.putalpha(alpha)
        overlay.paste(color, (0, 0), color)
    else:
        n = max(1, W - fade_end)
        alpha = _alpha_ramp(n, max_a, power, reverse=True)
        color = Image.new("RGBA", (n, H), (*cream, 255))
        color.putalpha(alpha)
        overlay.paste(color, (W - n, 0), color)
    return overlay


def cream_bottom_panel(base: Image.Image, spec: dict) -> Image.Image:
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
    strip = Image.new("L", (1, h))
    px = strip.load()
    for i in range(h):
        y = start + i
        if y < panel_top:
            t = (y - start) / max(1, fade)
            px[0, i] = int(255 * max_a * (t**1.35))
        else:
            px[0, i] = int(255 * max_a)
    alpha = strip.resize((W, h), Image.Resampling.BILINEAR)
    color = Image.new("RGBA", (W, h), (*cream, 255))
    color.putalpha(alpha)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    overlay.paste(color, (0, start), color)
    return Image.alpha_composite(work, overlay)


def brand_readability(base: Image.Image, spec: dict) -> Image.Image:
    rspec = spec["brand_anchor"]["readability"]
    sample = base.crop((rspec["x"], rspec["y"], rspec["x"] + rspec["w"], rspec["y"] + rspec["h"])).convert("L")
    hist = sample.histogram()
    pixels = sum(hist) or 1
    mean = sum(i * c for i, c in enumerate(hist)) / pixels
    # navy wordmark needs a light local field on dark/busy plates
    if mean > 168:
        strength = 0.22
    elif mean > 110:
        strength = 0.38
    elif mean > 70:
        strength = 0.58
    else:
        strength = 0.78
    cream = hex_rgb(spec["colors"]["cream"])
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = overlay.load()
    x0, y0, rw, rh = rspec["x"], rspec["y"], rspec["w"], rspec["h"]
    for y in range(y0, y0 + rh):
        vy = abs((y - y0) / max(1, rh - 1) - 0.42)
        for x in range(x0, x0 + rw):
            vx = (x - x0) / max(1, rw - 1)
            fall = (1 - vx) ** 1.4 * (1 - min(1, vy * 1.8))
            a = int(255 * strength * fall)
            if a > 0:
                px[x, y] = (*cream, a)
    return Image.alpha_composite(base.convert("RGBA"), overlay)


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
        parts = line.split(highlight) if highlight and highlight in line else [line]
        if highlight and highlight in line:
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

    return {
        "highlight_count": highlight_used,
        "text_box": (x, rule_y1, x + col_w, y),
        "headline_y": y_head,
    }


def draw_brand(base: Image.Image, spec: dict, hex_mark: Image.Image, episode_no: int) -> Image.Image:
    im = brand_readability(base, spec)
    im.paste(hex_mark, (spec["hex_mark"]["x"], spec["hex_mark"]["y"]), hex_mark)
    draw = ImageDraw.Draw(im)
    mark_f = font(spec["fonts"]["mark"], spec["brand_anchor"]["wordmark"]["size_px"])
    ser_f = font(spec["fonts"]["series"], spec["brand_anchor"]["series"]["size_px"])
    ax, ay = spec["brand_anchor"]["x"], spec["brand_anchor"]["y"]
    wm = spec["brand_anchor"]["wordmark"]
    se = spec["brand_anchor"]["series"]
    draw_tracked(
        draw,
        wm["text"],
        (ax + wm["dx"], ay + wm["dy"]),
        mark_f,
        hex_rgba(wm["color"]),
        wm["tracking_em"],
    )
    label = f"{se['prefix']} {episode_no:03d}"
    draw_tracked(
        draw,
        label,
        (ax + se["dx"], ay + se["dy"]),
        ser_f,
        hex_rgba(se["color"]),
        se["tracking_em"],
    )
    return im


def render_one(src: Path, episode: dict, spec: dict, hex_mark: Image.Image, dest: Path, debug_dir: Path) -> dict:
    raw = Image.open(src)
    if isinstance(episode.get("headline"), str):
        episode = {**episode, "headline": [episode["headline"]]}
    safety = episode.get("safety")
    if safety:
        prefer = "left" if safety.get("subject_x0", 0) >= 0.30 else "right"
        if safety.get("second_person") or (safety.get("subject_x1", 1) - safety.get("subject_x0", 0)) > 0.70:
            prefer = None
        base, meta = cover_window(raw, prefer)
        analysis = analysis_from_safety(safety, meta)
    else:
        probe = cover_preserve_side(raw, None)
        probe_an = analyze(probe, spec)
        prefer = "left" if probe_an["left_free_px"] >= probe_an["right_free_px"] else "right"
        base, meta = cover_window(raw, prefer)
        analysis = analyze(base, spec)
    choice = pick_layout(analysis, spec)
    layout = choice["layout"]

    work = base.convert("RGBA")
    if layout == "SIDE_EDITORIAL_LEFT":
        col_end = spec["side"]["margin_x"] + spec["side"]["column_w"] + 36
        fade_end = max(col_end, 400)
        if analysis.get("face"):
            fade_end = min(fade_end + 80, analysis["face"]["x0"] - spec["side"]["gradient"]["stop_before_subject_px"])
        fade_end = max(400, fade_end)
        left_luma = work.crop((0, 360, 360, 1100)).convert("L")
        hist = left_luma.histogram()
        mean = sum(i * c for i, c in enumerate(hist)) / (sum(hist) or 1)
        local = json.loads(json.dumps(spec))
        if mean < 80:
            local["side"]["gradient"]["max_alpha"] = 0.94
            local["side"]["gradient"]["power"] = 1.12
        work = Image.alpha_composite(work, cream_side_gradient("left", fade_end, local))
        side_x = spec["side"]["margin_x"]
    elif layout == "SIDE_EDITORIAL_RIGHT":
        fade_start = max(
            W - spec["side"]["margin_x"] - spec["side"]["column_w"] - 24,
            min(int(W - analysis["right_free_px"] + spec["side"]["gradient"]["stop_before_subject_px"]), W - 360),
        )
        if analysis.get("face"):
            fade_start = max(fade_start, analysis["face"]["x1"] + spec["side"]["gradient"]["stop_before_subject_px"])
        fade_start = min(W - 340, fade_start)
        work = Image.alpha_composite(work, cream_side_gradient("right", fade_start, spec))
        side_x = W - spec["side"]["margin_x"] - spec["side"]["column_w"]
    else:
        work = cream_bottom_panel(work, spec)
        side_x = spec["bottom"]["margin_x"]

    work = draw_brand(work, spec, hex_mark, episode["episode"])
    draw = ImageDraw.Draw(work)
    copy_info = draw_copy(draw, spec, layout, episode, side_x)

    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = work.convert("RGB")
    rgb.save(dest, "PNG")

    debug = rgb.copy()
    d = ImageDraw.Draw(debug)
    for key, color in (
        ("face", (0, 180, 80)),
        ("eyes", (220, 40, 40)),
        ("hair", (180, 120, 20)),
        ("hands", (40, 80, 200)),
        ("second_face", (160, 40, 160)),
    ):
        box = analysis.get(key)
        if box:
            d.rectangle((box["x0"], box["y0"], box["x1"], box["y1"]), outline=color, width=3)
    d.rectangle(copy_info["text_box"], outline=(123, 36, 75), width=2)
    d.text((40, 1860), layout, fill=(11, 36, 56))
    debug_dir.mkdir(parents=True, exist_ok=True)
    debug.save(debug_dir / dest.name, "PNG")

    face_hit = intersects(analysis.get("face"), copy_info["text_box"])
    eyes_hit = intersects(analysis.get("eyes"), copy_info["text_box"])
    qa = {
        "file": dest.name,
        "source": src.name,
        "layout": layout,
        "episode": episode["episode"],
        "brand_xy": [spec["brand_anchor"]["x"], spec["brand_anchor"]["y"]],
        "hex_size": spec["hex_mark"]["size_px"],
        "headline_y": copy_info["headline_y"],
        "highlight": episode.get("highlight"),
        "highlight_count": copy_info["highlight_count"],
        "face_overlap": face_hit,
        "eyes_overlap": eyes_hit,
        "left_free_px": analysis["left_free_px"],
        "right_free_px": analysis["right_free_px"],
        "left_ok": choice["left_ok"],
        "right_ok": choice["right_ok"],
        "side_preferred_if_space": bool(choice["left_ok"] or choice["right_ok"]),
        "pass": (not face_hit) and (not eyes_hit) and spec["brand_anchor"]["x"] == 72 and spec["brand_anchor"]["y"] == 92,
    }
    return qa


def contact_sheet(paths: list[Path], labels: list[str], dest: Path) -> None:
    cols = 3
    rows = math.ceil(len(paths) / cols)
    tw, th = 360, 640
    pad = 16
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * pad, rows * th + (rows + 1) * pad + 48), (240, 237, 230))
    draw = ImageDraw.Draw(sheet)
    fnt = font("/usr/share/fonts/truetype/ibm-plex/IBMPlexSans-SemiBold.ttf", 18)
    draw.text((pad, 14), "VALERIE_EDITORIAL_STORY_CARD_V2  ·  series lock", fill=(11, 36, 56), font=fnt)
    for i, path in enumerate(paths):
        r, c = divmod(i, cols)
        thumb = Image.open(path).convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        x = pad + c * (tw + pad)
        y = 48 + pad + r * (th + pad)
        sheet.paste(thumb, (x, y))
        draw.rectangle((x, y + th - 36, x + tw, y + th), fill=(11, 36, 56))
        draw.text((x + 10, y + th - 28), labels[i], fill=(240, 237, 230), font=fnt)
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, "PNG")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render VALERIE_EDITORIAL_STORY_CARD_V2 stills")
    parser.add_argument("--job", help="Job JSON with cards[] (asset worker)")
    parser.add_argument("--input-dir", help="Directory with source photos")
    parser.add_argument("--out-dir", help="Directory for PNG output")
    return parser.parse_args()


def output_filename(item: dict) -> str:
    raw = str(item.get("output_name") or f"{Path(item['photo']).stem}.png")
    if Path(raw).name != raw or not re.fullmatch(r"[A-Za-z0-9._-]{1,120}\.png", raw):
        raise ValueError(f"invalid_output_name:{raw}")
    return raw


def main() -> int:
    args = parse_args()
    spec = load_json(CARD_DIR / "VALERIE_EDITORIAL_STORY_CARD_V2.json")
    if args.job:
        pack = load_json(Path(args.job))
        input_dir = Path(args.input_dir) if args.input_dir else POSE_DIR
        out_dir = Path(args.out_dir) if args.out_dir else OUT_DIR
    else:
        pack = load_json(CARD_DIR / "pose-library-preview.json")
        input_dir = POSE_DIR
        out_dir = OUT_DIR
    hex_mark = load_hex_mark(ROOT / spec["hex_mark"]["source"], spec["hex_mark"]["size_px"])
    debug_dir = out_dir / "_debug"
    reports = []
    for item in pack["cards"]:
        src = input_dir / item["photo"]
        dest = out_dir / output_filename(item)
        reports.append(render_one(src, item, spec, hex_mark, dest, debug_dir))
        print(f"{item['photo']} → {reports[-1]['layout']} pass={reports[-1]['pass']}")

    side = [r for r in reports if r["layout"].startswith("SIDE")]
    bottom = [r for r in reports if r["layout"] == "BOTTOM_EDITORIAL"]
    sheet_items = side[:3] + bottom[:3]
    if len(sheet_items) < 6:
        sheet_items = reports[:6]
    contact_sheet(
        [out_dir / r["file"] for r in sheet_items],
        [f"{r['file'][:2]}  {r['layout'].replace('_EDITORIAL', '')}" for r in sheet_items],
        out_dir / "contact-sheet.png",
    )
    qa_path = out_dir / "qa-report.json"
    qa_path.write_text(json.dumps({"template": spec["id"], "cards": reports}, indent=2) + "\n")
    print(f"wrote {len(reports)} cards + contact sheet → {out_dir}")
    return 0 if all(r["pass"] for r in reports) else 1


if __name__ == "__main__":
    sys.exit(main())
