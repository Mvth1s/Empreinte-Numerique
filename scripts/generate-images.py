#!/usr/bin/env python3
"""Génère les favicons, icônes PWA, le logo WebP et l'image Open Graph depuis public/logo.png.

Usage : python3 scripts/generate-images.py   (Pillow requis : pip install pillow)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONTS = PUBLIC / "fonts"

BG = (10, 10, 15)          # --bg   #0a0a0f
FG = (240, 240, 240)       # --fg   #f0f0f0
MUTE = (154, 154, 174)     # --mute-2
CYAN = (0, 229, 255)       # --cyan
LINE = (31, 31, 43)        # --line

logo = Image.open(PUBLIC / "logo.png").convert("RGBA")
logo = logo.crop(logo.getbbox())  # retire la marge transparente


def fit(img: Image.Image, size: int) -> Image.Image:
    img = img.copy()
    img.thumbnail((size, size), Image.LANCZOS)
    return img


def icon(size: int, padding: float, background: tuple | None) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background + (255,) if background else (0, 0, 0, 0))
    mark = fit(logo, round(size * (1 - 2 * padding)))
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return canvas


def save_png(img: Image.Image, name: str, opaque: bool = False) -> None:
    (img.convert("RGB") if opaque else img).save(PUBLIC / name, optimize=True)
    print(f"public/{name}  {img.width}x{img.height}")


# ---- Favicons & icônes ----
save_png(icon(32, 0.02, None), "favicon-32x32.png")
save_png(icon(180, 0.12, BG), "apple-touch-icon.png", opaque=True)
save_png(icon(192, 0.12, BG), "icon-192.png", opaque=True)
save_png(icon(512, 0.12, BG), "icon-512.png", opaque=True)

# ---- Logo UI en WebP (440 px = 2x la taille max affichée de 220 px) ----
logo_ui = icon(440, 0, None)
logo_ui.save(PUBLIC / "logo.webp", "WEBP", quality=90, method=6)
print("public/logo.webp  440x440")

# ---- Image Open Graph 1200x630 ----
W, H = 1200, 630
og = Image.new("RGBA", (W, H), BG + (255,))

# Halo cyan discret derrière le logo
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((60, 95, 500, 535), fill=CYAN + (38,))
og.alpha_composite(glow.filter(ImageFilter.GaussianBlur(90)))

# Grille de fond (identique à body::before : pas de 48 px)
grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(grid)
for x in range(0, W, 48):
    gd.line([(x, 0), (x, H)], fill=(255, 255, 255, 8))
for y in range(0, H, 48):
    gd.line([(0, y), (W, y)], fill=(255, 255, 255, 8))
og.alpha_composite(grid)

mark = fit(logo, 380)
og.alpha_composite(mark, (90, (H - mark.height) // 2))

d = ImageDraw.Draw(og)


def sans(size: int, weight: int) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(FONTS / "dm-sans-latin-wght.woff2"), size)
    f.set_variation_by_axes([weight])
    return f


def mono(size: int, weight: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / f"ibm-plex-mono-latin-{weight}-normal.woff2"), size)


def spaced(xy: tuple, text: str, font, fill, spacing: float) -> None:
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + spacing


tx = 540
spaced((tx, 170), "EMPREINTE NUMÉRIQUE", mono(24, 500), CYAN, 5)
d.rectangle((tx, 214, tx + 64, 217), fill=CYAN)
d.multiline_text((tx, 245), "Ce que chaque site\nsait sur vous", font=sans(60, 500), fill=FG, spacing=10)
d.text((tx, 420), "Outil éducatif · 100 % côté client · open-source", font=sans(24, 400), fill=MUTE)
d.line([(tx, 478), (W - 80, 478)], fill=LINE, width=1)
d.text((tx, 496), "empreinte-numerique.vercel.app", font=mono(22, 400), fill=MUTE)

og.convert("RGB").save(PUBLIC / "og-cover.png", optimize=True)
print(f"public/og-cover.png  {W}x{H}")
