#!/usr/bin/env python3
"""
Generate the Mobile Station favicon, Apple touch icon, PWA icon set, and OpenGraph image
from the source brand assets at the repository root.

Usage:
  python3 scripts/generate-brand-assets.py
"""

from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC_ICON = ROOT / "mobile-station-icon.png"
SRC_WORDMARK = ROOT / "mobile-station-name.png"

STOREFRONT_PUBLIC = ROOT / "apps" / "storefront" / "public"
BACKEND_STATIC = ROOT / "apps" / "backend" / "static"
BRAND_ASSETS_DIR = ROOT / "packages" / "brand" / "assets"

OBSIDIAN_BG = (11, 15, 23, 255)        # #0B0F17
OBSIDIAN_ELEVATED = (19, 26, 38, 255)  # #131A26
GOLD_ACCENT = (229, 160, 29, 255)      # #E5A01D
CHROME_TEXT = (226, 232, 240, 255)     # #E2E8F0
MUTED_TEXT = (148, 163, 184, 255)      # #94A3B8


def trim_transparent(img: Image.Image, alpha_threshold: int = 12, margin: int = 4) -> Image.Image:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    mask = alpha.point(lambda v: 255 if v >= alpha_threshold else 0)
    bbox = mask.getbbox()
    if not bbox:
        return rgba
    x0 = max(0, bbox[0] - margin)
    y0 = max(0, bbox[1] - margin)
    x1 = min(rgba.width, bbox[2] + margin)
    y1 = min(rgba.height, bbox[3] + margin)
    return rgba.crop((x0, y0, x1, y1))


def fit_square_canvas(
    fg: Image.Image,
    size: int,
    padding_ratio: float = 0.12,
    bg_color: tuple[int, int, int, int] | None = None,
    corner_radius_ratio: float = 0.0,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), bg_color if bg_color else (0, 0, 0, 0))
    if bg_color and corner_radius_ratio > 0:
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        r = int(size * corner_radius_ratio)
        draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=r, fill=255)
        rounded_bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        rounded_bg.paste(canvas, (0, 0), mask)
        canvas = rounded_bg

    inner = int(round(size * (1 - 2 * padding_ratio)))
    ratio = min(inner / fg.width, inner / fg.height)
    new_w = max(1, int(round(fg.width * ratio)))
    new_h = max(1, int(round(fg.height * ratio)))
    resized = fg.resize((new_w, new_h), Image.Resampling.LANCZOS)
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/Arial Bold.ttf",
        ]
        if bold
        else [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/Arial.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default(size=size)


def generate_og_image(icon: Image.Image, wordmark: Image.Image, out_path: Path) -> None:
    w, h = 1200, 630
    canvas = Image.new("RGBA", (w, h), OBSIDIAN_BG)
    draw = ImageDraw.Draw(canvas)

    # Subtle architectural grid behind a clean center band
    for i in range(0, w, 60):
        draw.line([(i, 0), (i, h)], fill=(255, 255, 255, 6), width=1)
    for j in range(0, h, 60):
        draw.line([(0, j), (w, j)], fill=(255, 255, 255, 6), width=1)

    # Elevated center studio card so text & logo sit cleanly without grid noise
    draw.rounded_rectangle([(48, 84), (w - 48, h - 84)], radius=28, fill=OBSIDIAN_ELEVATED, outline=(229, 160, 29, 75), width=2)

    # Top and bottom gold hairline accent
    draw.rectangle([(0, 0), (w, 6)], fill=GOLD_ACCENT)
    draw.rectangle([(0, h - 6), (w, h)], fill=GOLD_ACCENT)

    # Center-left badge backdrop for MS icon (tighter crop & larger fill)
    icon_box = fit_square_canvas(icon, 240, padding_ratio=0.07, bg_color=OBSIDIAN_BG, corner_radius_ratio=0.22)
    draw_box = ImageDraw.Draw(icon_box)
    draw_box.rounded_rectangle([(2, 2), (237, 237)], radius=52, outline=(229, 160, 29, 140), width=2)
    canvas.paste(icon_box, (88, 195), icon_box)

    # Wordmark on the right (tightly cropped, crisp vertical centering)
    wm_target_w = 740
    wm_ratio = wm_target_w / wordmark.width
    wm_h = int(round(wordmark.height * wm_ratio))
    wm_resized = wordmark.resize((wm_target_w, wm_h), Image.Resampling.LANCZOS)
    canvas.paste(wm_resized, (366, 224), wm_resized)

    # Tagline + trust strip below wordmark
    font_lg = load_font(26, bold=True)
    font_sm = load_font(19, bold=False)
    draw.text((370, 344), "Mobiles  |  Tablets  |  Laptops  |  Audio  |  Peripherals", fill=CHROME_TEXT, font=font_lg)
    draw.text((370, 392), "Official Brand Warranty  |  GST Tax Invoice  |  Pan-India & Bihar Express Hub", fill=MUTED_TEXT, font=font_sm)

    canvas.convert("RGB").save(out_path, format="PNG", optimize=True)


def main() -> None:
    if not SRC_ICON.exists():
        raise FileNotFoundError(f"Missing source icon: {SRC_ICON}")
    if not SRC_WORDMARK.exists():
        raise FileNotFoundError(f"Missing source wordmark: {SRC_WORDMARK}")

    icon_trimmed = trim_transparent(Image.open(SRC_ICON))
    wordmark_trimmed = trim_transparent(Image.open(SRC_WORDMARK))

    for d in [
        STOREFRONT_PUBLIC,
        STOREFRONT_PUBLIC / "icons",
        STOREFRONT_PUBLIC / "brand",
        BACKEND_STATIC,
        BRAND_ASSETS_DIR,
    ]:
        d.mkdir(parents=True, exist_ok=True)

    # Copy crisp source brand assets
    icon_trimmed.save(STOREFRONT_PUBLIC / "brand" / "mobile-station-icon.png", format="PNG", optimize=True)
    wordmark_trimmed.save(STOREFRONT_PUBLIC / "brand" / "mobile-station-wordmark.png", format="PNG", optimize=True)
    icon_trimmed.save(BRAND_ASSETS_DIR / "mobile-station-icon-trimmed.png", format="PNG", optimize=True)
    wordmark_trimmed.save(BRAND_ASSETS_DIR / "mobile-station-wordmark-trimmed.png", format="PNG", optimize=True)

    # Transparent favicons (tightly cropped for maximum visibility at 16px/32px)
    fav_16 = fit_square_canvas(icon_trimmed, 16, padding_ratio=0.02)
    fav_32 = fit_square_canvas(icon_trimmed, 32, padding_ratio=0.03)
    fav_48 = fit_square_canvas(icon_trimmed, 48, padding_ratio=0.04)
    fav_512 = fit_square_canvas(icon_trimmed, 512, padding_ratio=0.05)

    for target_dir in (STOREFRONT_PUBLIC, BACKEND_STATIC):
        fav_16.save(target_dir / "favicon-16x16.png", format="PNG", optimize=True)
        fav_32.save(target_dir / "favicon-32x32.png", format="PNG", optimize=True)
        fav_512.save(target_dir / "favicon.png", format="PNG", optimize=True)
        fav_48.save(
            target_dir / "favicon.ico",
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)],
        )

    # Apple touch icon & PWA icons use sleek Obsidian rounded square backdrop with tight fit
    apple_icon = fit_square_canvas(icon_trimmed, 180, padding_ratio=0.08, bg_color=OBSIDIAN_BG)
    apple_icon.convert("RGB").save(STOREFRONT_PUBLIC / "apple-touch-icon.png", format="PNG", optimize=True)

    pwa_192 = fit_square_canvas(icon_trimmed, 192, padding_ratio=0.08, bg_color=OBSIDIAN_BG, corner_radius_ratio=0.22)
    pwa_512 = fit_square_canvas(icon_trimmed, 512, padding_ratio=0.08, bg_color=OBSIDIAN_BG, corner_radius_ratio=0.22)
    maskable_192 = fit_square_canvas(icon_trimmed, 192, padding_ratio=0.14, bg_color=OBSIDIAN_BG)
    maskable_512 = fit_square_canvas(icon_trimmed, 512, padding_ratio=0.14, bg_color=OBSIDIAN_BG)

    pwa_192.save(STOREFRONT_PUBLIC / "icons" / "icon-192.png", format="PNG", optimize=True)
    pwa_512.save(STOREFRONT_PUBLIC / "icons" / "icon-512.png", format="PNG", optimize=True)
    maskable_192.convert("RGB").save(STOREFRONT_PUBLIC / "icons" / "icon-maskable-192.png", format="PNG", optimize=True)
    maskable_512.convert("RGB").save(STOREFRONT_PUBLIC / "icons" / "icon-maskable-512.png", format="PNG", optimize=True)

    # OpenGraph share preview
    generate_og_image(icon_trimmed, wordmark_trimmed, STOREFRONT_PUBLIC / "og-image.png")

    manifest = {
        "name": "Mobile Station — Electronics, Mobiles, Laptops & Tech Accessories",
        "short_name": "Mobile Station",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0B0F17",
        "theme_color": "#0B0F17",
        "description": "Shop genuine smartphones, tablets, laptops, earphones, keyboards, mice, and certified tech accessories across India with official brand warranty and GST invoicing.",
        "orientation": "portrait-primary",
        "prefer_related_applications": False,
        "icons": [
            {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (STOREFRONT_PUBLIC / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(
        f"Generated brand & favicon assets. Icon bbox: {icon_trimmed.size}, Wordmark bbox: {wordmark_trimmed.size}"
    )


if __name__ == "__main__":
    main()
