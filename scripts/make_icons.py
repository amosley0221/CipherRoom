#!/usr/bin/env python3
# Generate PWA raster icons. Run from repo root: python3 scripts/make_icons.py
# Produces icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png.

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)

BG = (12, 21, 48, 255)        # navy (#0c1530)
ACCENT = (247, 212, 75, 255)  # yellow (#f7d44b)


def find_serif_italic():
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        "/Library/Fonts/Georgia Italic.ttf",
        "/System/Library/Fonts/Georgia.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return p
    return None


def find_mono():
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    for p in candidates:
        if Path(p).exists():
            return p
    return None


def render(size: int, maskable: bool, path: Path):
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Maskable icons need ~10% safe-area padding so launcher masks don't crop content.
    scale = 0.78 if maskable else 1.0

    # Concentric rings
    for r_frac, alpha, w in ((0.34, 46, max(2, int(size * 0.012))),
                             (0.235, 102, max(2, int(size * 0.006)))):
        r = int(size * r_frac * scale)
        d.ellipse((cx - r, cy - r, cx + r, cy + r),
                  outline=(ACCENT[0], ACCENT[1], ACCENT[2], alpha), width=w)

    # Big italic C
    serif_path = find_serif_italic()
    if serif_path:
        font_size = int(size * 0.46 * scale)
        font = ImageFont.truetype(serif_path, font_size)
        bbox = d.textbbox((0, 0), "C", font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1] - size * 0.02 * scale),
               "C", fill=ACCENT, font=font)

    # CIPHER tracking under the C
    mono_path = find_mono()
    if mono_path:
        label_size = max(8, int(size * 0.07 * scale))
        label_font = ImageFont.truetype(mono_path, label_size)
        label = "C I P H E R"
        bbox = d.textbbox((0, 0), label, font=label_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((cx - tw / 2 - bbox[0], cy + size * 0.18 * scale - bbox[1]),
               label, fill=ACCENT, font=label_font)

    img.save(path, "PNG")
    print(f"wrote {path.relative_to(ROOT)} ({size}x{size}{' maskable' if maskable else ''})")


render(192, False, OUT / "icon-192.png")
render(512, False, OUT / "icon-512.png")
render(512, True, OUT / "icon-maskable-512.png")
