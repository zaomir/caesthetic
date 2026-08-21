#!/usr/bin/env python3
"""Compose one Template Reel example: Valerie stills + accent headlines."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path("/root/.cursor/projects/var-www-grainee-v2/assets")
OUT = Path(
    "/var/www/grainee-v2/docs/projects/caesthetic/operations/ig-growth/footage/template-reel-example-01"
)
W, H = 1080, 1920
WHITE = (255, 255, 255, 255)
ACCENT = (196, 92, 50, 255)  # burnt sienna — key words, as in the approved cover grid
MUTED = (230, 224, 216, 255)
NAVY = (28, 58, 74, 255)

FONT_DIR = Path("/usr/share/fonts/truetype/ibm-plex")
FONT_BOLD = FONT_DIR / "IBMPlexSans-Bold.ttf"
FONT_SEMI = FONT_DIR / "IBMPlexSans-SemiBold.ttf"
FONT_REG = FONT_DIR / "IBMPlexSans-Regular.ttf"

FRAMES = [
    {
        "src": "v01-hook.png",
        "out": "01-hook.png",
        "kicker": "MAPS  ·  01 / 05",
        "lines": [
            [("4.9", "accent")],
            [("CAN STILL HIDE", "white")],
            [("A DEMAND LEAK", "white")],
        ],
    },
    {
        "src": "v02-rating.png",
        "out": "02-rating.png",
        "kicker": "MAPS  ·  02 / 05",
        "lines": [
            [("RATING IS NOT", "white")],
            [("DEMAND", "accent")],
        ],
    },
    {
        "src": "v03-velocity.png",
        "out": "03-velocity.png",
        "kicker": "MAPS  ·  03 / 05",
        "lines": [
            [("CHECK", "white"), ("  VELOCITY", "accent")],
            [("CHECK REPLIES", "white")],
        ],
    },
    {
        "src": "v04-card.png",
        "out": "04-card.png",
        "kicker": "MAPS  ·  04 / 05",
        "lines": [
            [("WE SCORE THE", "white")],
            [("CARD", "accent")],
            [("NOT THE STAR", "white")],
        ],
    },
    {
        "src": "v05-end.png",
        "out": "05-end.png",
        "kicker": "FREE  ·  05 / 05",
        "lines": [
            [("FREE", "white")],
            [("GROWTH SCORE", "accent")],
        ],
        "sub": "caesthetic.com/growth-score",
    },
]


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def cover_resize(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    scale = max(W / im.width, H / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = max(0, (nh - H) // 2 - 80)
    return im.crop((left, top, left + W, top + H))


def add_bottom_gradient(base: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    top = 980
    for y in range(top, H):
        t = (y - top) / (H - top)
        alpha = int(210 * (t**1.15))
        draw.line([(0, y), (W, y)], fill=(10, 8, 6, alpha))
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def draw_mixed_line(draw: ImageDraw.ImageDraw, parts, x: int, y: int, fnt, fill_map) -> int:
    cx = x
    for text, kind in parts:
        draw.text((cx, y), text, font=fnt, fill=fill_map[kind])
        cx += int(draw.textlength(text, font=fnt))
    return y + int(fnt.size * 1.08)


def compose(spec: dict) -> Path:
    raw = Image.open(SRC / spec["src"])
    frame = add_bottom_gradient(cover_resize(raw))
    draw = ImageDraw.Draw(frame)

    mark = font(FONT_SEMI, 22)
    kicker_f = font(FONT_SEMI, 20)
    headline = font(FONT_BOLD, 78 if len(spec["lines"]) > 2 else 92)
    sub_f = font(FONT_REG, 28)
    chip_f = font(FONT_SEMI, 20)

    draw.text((80, 88), "CAESTHETIC", font=mark, fill=WHITE)
    draw.text((80, 128), spec["kicker"], font=kicker_f, fill=ACCENT)

    fills = {"white": WHITE, "accent": ACCENT}
    y = 1240 if len(spec["lines"]) < 3 else 1180
    for line in spec["lines"]:
        y = draw_mixed_line(draw, line, 80, y, headline, fills)

    if spec.get("sub"):
        draw.text((80, y + 18), spec["sub"], font=sub_f, fill=MUTED)

    chip = "// VALERIE PETRA"
    tw = int(draw.textlength(chip, font=chip_f))
    pad_x, pad_y = 22, 12
    bx1, by1 = 80, 1768
    bx2, by2 = 80 + tw + pad_x * 2, 1768 + 20 + pad_y * 2
    draw.rounded_rectangle((bx1, by1, bx2, by2), radius=4, fill=NAVY)
    draw.text((bx1 + pad_x, by1 + pad_y - 2), chip, font=chip_f, fill=WHITE)

    dest = OUT / spec["out"]
    frame.convert("RGB").save(dest, "PNG", optimize=True)
    return dest


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    written = [compose(spec) for spec in FRAMES]
    print("\n".join(str(p) for p in written))


if __name__ == "__main__":
    main()
