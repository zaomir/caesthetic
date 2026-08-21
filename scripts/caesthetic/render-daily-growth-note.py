#!/usr/bin/env python3
"""Render a CAESTHETIC Daily Growth Note from shared Text Card + episode config."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/var/www/grainee-v2")
DGN = ROOT / "docs/projects/caesthetic/operations/ig-growth/daily-growth-note"
ASSETS = Path("/root/.cursor/projects/var-www-grainee-v2/assets")
W, H = 1080, 1920
FPS = 24


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    r, g, b = int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)
    return (r, g, b, alpha)


def cover(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    scale = max(W / im.width, H / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = max(0, (nh - H) // 2)
    return im.crop((left, top, left + W, top + H))


def tracked(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], fnt, fill, tracking_em: float) -> None:
    x, y = xy
    space = fnt.size * tracking_em
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + space


def gradient(base: Image.Image, from_y: int, alpha: int) -> Image.Image:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(from_y, H):
        t = (y - from_y) / max(1, H - from_y)
        draw.line([(0, y), (W, y)], fill=(11, 8, 6, int(alpha * (t**1.1))))
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def resolve_plate(name: str, dest: Path) -> Path:
    src = ASSETS / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.exists():
        Image.open(src).convert("RGB").save(dest, "PNG")
        return dest
    if dest.exists():
        return dest
    raise FileNotFoundError(src)


def render_text_card(card: dict, episode_no: int, body: str, footer: str | None, dest: Path) -> Path:
    im = Image.new("RGB", (W, H), card["background"])
    draw = ImageDraw.Draw(im)
    mark_f = font(card["font_file"], card["mark"]["size_px"])
    num_f = font(card["font_file"], card["series_number"]["size_px"])
    head_f = font(card["font_file"], card["headline"]["size_px"])
    foot_f = font(card["font_file"], card["footer"]["size_px"])

    tracked(
        draw,
        card["mark"]["text"],
        (card["mark"]["x"], card["mark"]["y"]),
        mark_f,
        hex_rgba(card["mark"]["color"]),
        card["mark"]["tracking_em"],
    )
    number = f"{card['series_number']['prefix']}  {episode_no:03d}"
    draw.text(
        (card["series_number"]["x"], card["series_number"]["y"]),
        number,
        font=num_f,
        fill=hex_rgba(card["series_number"]["color"]),
    )
    rule = card["accent_rule"]
    draw.rectangle(
        (rule["x"], rule["y"], rule["x"] + rule["w"], rule["y"] + rule["h"]),
        fill=hex_rgba(rule["color"]),
    )

    y = card["headline"]["top_offset_px"]
    lh = int(card["headline"]["size_px"] * card["headline"]["line_height"])
    x = card["headline"]["margin_left_px"]
    for line in body.strip().splitlines():
        draw.text((x, y), line, font=head_f, fill=hex_rgba(card["headline"]["color"]))
        y += lh

    if footer:
        tracked(
            draw,
            footer,
            (card["footer"]["x"], card["footer"]["y"]),
            foot_f,
            hex_rgba(card["footer"]["color"]),
            card["footer"]["tracking_em"],
        )

    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)
    return dest


def render_avatar_hook(plate: Path, series: dict, hook: list[str], subline: str, dest: Path) -> Path:
    ov = series["hook_overlay"]
    im = gradient(cover(Image.open(plate)), ov["gradient"]["from_y"], ov["gradient"]["alpha"])
    draw = ImageDraw.Draw(im)
    head_f = font(ov["font_file"], ov["headline_size_px"])
    sub_f = font(ov["subline_font_file"], ov["subline_size_px"])
    y = ov["headline_y"]
    lh = int(ov["headline_size_px"] * ov["headline_line_height"])
    for line in hook:
        draw.text((ov["x"], y), line, font=head_f, fill=hex_rgba(ov["headline_color"]))
        y += lh
    draw.text((ov["x"], y + 18), subline, font=sub_f, fill=hex_rgba(ov["subline_color"]))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(dest, "PNG", optimize=True)
    return dest


def render_video_still(plate: Path, series: dict, label: str, dest: Path, warning: bool = False) -> Path:
    ov = series["video_overlay"]
    im = gradient(cover(Image.open(plate)), 240, 90)
    # Soften any accidental readable UI generated on the plate.
    screen = im.crop((0, 420, W, 1500)).filter(ImageFilter.GaussianBlur(radius=0.6))
    im.paste(screen, (0, 420))
    draw = ImageDraw.Draw(im)
    fnt = font(ov["font_file"], ov["size_px"])
    tracked(draw, label, (ov["x"], ov["y"]), fnt, hex_rgba(ov["color"]), ov["tracking_em"])
    if warning:
        draw.rectangle((88, 380, 136, 383), fill=hex_rgba("#7B244B"))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(dest, "PNG", optimize=True)
    return dest


def ken_burns(src: Path, dest: Path, seconds: float, zoom_end: float = 1.08) -> None:
    frames = max(1, int(round(seconds * FPS)))
    vf = (
        f"scale=1404:2496:force_original_aspect_ratio=increase,"
        f"crop=1404:2496,"
        f"zoompan=z='min({zoom_end},1+({zoom_end}-1)*on/{frames})'"
        f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":d={frames}:s=1080x1920:fps={FPS},"
        f"format=yuv420p"
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-loop", "1", "-i", str(src),
            "-vf", vf, "-frames:v", str(frames),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest),
        ],
        check=True,
    )


def still_hold(src: Path, dest: Path, seconds: float, fade_in: float = 0.35) -> None:
    frames = max(1, int(round(seconds * FPS)))
    fade_frames = int(round(fade_in * FPS))
    vf = f"scale=1080:1920,format=yuv420p,fade=t=in:st=0:d={fade_in}"
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-loop", "1", "-i", str(src),
            "-vf", vf, "-frames:v", str(frames),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", str(dest),
        ],
        check=True,
    )
    _ = fade_frames


def concat(parts: list[Path], dest: Path) -> None:
    listing = dest.with_suffix(".concat.txt")
    listing.write_text("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-i", str(listing),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(dest),
        ],
        check=True,
    )


def probe(path: Path) -> tuple[int, int, float]:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,duration",
            "-of", "csv=p=0",
            str(path),
        ],
        text=True,
    ).strip()
    w, h, d = out.split(",")
    return int(w), int(h), float(d)


def main() -> None:
    episode_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DGN / "episodes/001-dont-buy-more-leads-yet.yaml"
    ep = yaml.safe_load(episode_path.read_text())
    series = load_json((episode_path.parent / ep["series_config"]).resolve())
    card = load_json((episode_path.parent / ep["text_card"]).resolve())
    out_dir = DGN / "footage" / f"{ep['episode_number']:03d}"
    work = out_dir / "_work"
    work.mkdir(parents=True, exist_ok=True)

    plates = {
        "s1": resolve_plate("dgn001-s1-avatar.png", out_dir / "scene-1-avatar.png"),
        "s2a": resolve_plate("dgn001-s2a-search.png", out_dir / "scene-2a-search.png"),
        "s2b": resolve_plate("dgn001-s2b-website.png", out_dir / "scene-2b-website.png"),
        "s4a": resolve_plate("dgn001-s4a-booking.png", out_dir / "scene-4a-booking.png"),
        "s4b": resolve_plate("dgn001-s4b-response.png", out_dir / "scene-4b-response.png"),
    }

    hook = render_avatar_hook(
        plates["s1"], series, ep["hook"], ep["hook_subline"], out_dir / "scene-1-hook.png"
    )
    card1 = render_text_card(
        card, ep["episode_number"], ep["scenes"][2]["text"], None, out_dir / "scene-3-text-card.png"
    )
    card2 = render_text_card(
        card,
        ep["episode_number"],
        ep["scenes"][4]["text"],
        ep["scenes"][4]["footer"],
        out_dir / "scene-5-text-card.png",
    )
    v2a = render_video_still(plates["s2a"], series, "SEARCH → WEBSITE", out_dir / "scene-2a-overlay.png")
    v2b = render_video_still(plates["s2b"], series, "SEARCH → WEBSITE", out_dir / "scene-2b-overlay.png")
    v4a = render_video_still(
        plates["s4a"], series, "BOOKING", out_dir / "scene-4a-overlay.png", warning=True
    )
    v4b = render_video_still(
        plates["s4b"], series, "RESPONSE", out_dir / "scene-4b-overlay.png", warning=True
    )

    segs = [
        work / "01.mp4",
        work / "02a.mp4",
        work / "02b.mp4",
        work / "03.mp4",
        work / "04a.mp4",
        work / "04b.mp4",
        work / "05.mp4",
    ]
    still_hold(hook, segs[0], 2.5)
    ken_burns(v2a, segs[1], 2.2)
    ken_burns(v2b, segs[2], 2.3, zoom_end=1.06)
    still_hold(card1, segs[3], 2.5)
    ken_burns(v4a, segs[4], 2.5)
    ken_burns(v4b, segs[5], 3.0, zoom_end=1.06)
    still_hold(card2, segs[6], 4.0)

    dest = DGN / ep["output"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    concat(segs, dest)
    w, h, dur = probe(dest)
    if (w, h) != (1080, 1920):
        raise SystemExit(f"QA FAIL size {w}x{h}")
    if not (15.0 <= dur <= 20.0):
        raise SystemExit(f"QA FAIL duration {dur}")
    print(f"OK {dest} {w}x{h} {dur:.2f}s")


if __name__ == "__main__":
    main()
