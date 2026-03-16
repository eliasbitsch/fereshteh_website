#!/usr/bin/env python3
"""
Quick local PDF-to-WebP converter. Run on your dev PC, copy results to server.
Requires: pip install pdf2image Pillow
Also needs poppler installed (brew install poppler / apt install poppler-utils)

Usage: python3 convert-local.py <pdf_file> [output_dir]
Example: python3 convert-local.py HAPTO.pdf ./output
"""

import math
import os
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from pdf2image import convert_from_path, pdfinfo_from_path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

MAX_WIDTH = 3000
STRIP_HEIGHT_PX = 2000
IMAGE_QUALITY = 80
BASE_DPI = 150
MIN_DPI = 100


def get_info(pdf_path):
    info = pdfinfo_from_path(pdf_path)
    size = info.get("Page size", "")
    pages = info.get("Pages", 1)
    parts = size.lower().replace("pts", "").replace("pt", "").split("x")
    if len(parts) == 2:
        return pages, float(parts[0].strip()), float(parts[1].strip())
    return pages, None, None


def render_strip(pdf_path, dpi, page_num, y_px, h_px, w_pt):
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as tmpdir:
        prefix = os.path.join(tmpdir, "strip")
        cmd = [
            "pdftoppm", "-r", str(dpi),
            "-f", str(page_num), "-l", str(page_num),
            "-x", "0", "-y", str(y_px),
            "-W", str(int(w_pt / 72 * dpi)), "-H", str(h_px),
            "-png", "-singlefile", pdf_path, prefix,
        ]
        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"pdftoppm failed: {result.stderr.decode()}")
        img = Image.open(prefix + ".png")
        img.load()
        return img


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert-local.py <pdf_file> [output_dir]")
        sys.exit(1)

    pdf_path = os.path.abspath(sys.argv[1])
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    base_name = Path(pdf_path).stem.lower().replace(" ", "-")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Converting: {pdf_path}")
    print(f"Output: {output_dir}/{base_name}-page-*.webp")

    pages, w_pt, h_pt = get_info(pdf_path)
    print(f"  Pages: {pages}, Size: {w_pt}x{h_pt} pt")

    tile_counter = 0
    for page_num in range(1, pages + 1):
        if w_pt:
            w_in = w_pt / 72
            dpi = max(min(int(MAX_WIDTH / w_in), BASE_DPI), MIN_DPI)
            render_w = int(w_in * dpi)
            render_h = int((h_pt / 72) * dpi)
        else:
            dpi, render_w, render_h = BASE_DPI, MAX_WIDTH, 8000

        print(f"  Page {page_num}: {render_w}x{render_h}px at {dpi} DPI")

        num_strips = math.ceil(render_h / STRIP_HEIGHT_PX)
        strips = []
        for i in range(num_strips):
            y = i * STRIP_HEIGHT_PX
            h = min(STRIP_HEIGHT_PX, render_h - y)
            tile_counter += 1
            out = os.path.join(output_dir, f"{base_name}-page-{tile_counter:03d}.webp")
            if os.path.exists(out):
                print(f"    Strip {i+1}/{num_strips} — exists, skipping")
                continue
            strips.append((i, tile_counter, y, h, out))

        if not strips:
            continue

        workers = min(os.cpu_count() or 4, len(strips))
        print(f"  Rendering {len(strips)} strips with {workers} workers...")

        with ProcessPoolExecutor(max_workers=workers) as executor:
            futures = {}
            for i, tile_num, y, h, out in strips:
                f = executor.submit(render_strip, pdf_path, dpi, page_num, y, h, w_pt)
                futures[f] = (i, num_strips, out)

            for f in as_completed(futures):
                i, total, out = futures[f]
                img = f.result()
                if img.width != MAX_WIDTH:
                    ratio = MAX_WIDTH / img.width
                    img = img.resize((MAX_WIDTH, round(img.height * ratio)), Image.LANCZOS)
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGB")
                img.save(out, format="WEBP", quality=IMAGE_QUALITY)
                kb = os.path.getsize(out) / 1024
                print(f"    Strip {i+1}/{total} → {img.width}x{img.height} → {kb:.0f}KB")
                del img

    print(f"\nDone! {tile_counter} tile(s) in {output_dir}/")
    print(f"Copy to server: scp {output_dir}/{base_name}-page-*.webp server:~/git/fereshteh_website/public/projects-jpg/")


if __name__ == "__main__":
    main()
