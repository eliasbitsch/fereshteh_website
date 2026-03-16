#!/usr/bin/env python3
"""
Convert PDF pages to WebP images using pdftoppm + cwebp.
Renders entire pages at once, then slices into strips. Uses JPEG intermediate
format and cwebp for fast multi-threaded WebP encoding.

Usage: python3 convert-pdf.py <pdf_path> <output_dir> <base_name>
"""

import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from pathlib import Path

from pdf2image import pdfinfo_from_path

MAX_WIDTH = 3000
MAX_HEIGHT = 8000
MIN_DPI = 100
MAX_RENDER_PIXELS = 100_000_000  # 100MP — safe for 4GB RAM
IMAGE_QUALITY = 85
IMAGE_EXT = "webp"
BASE_DPI = 200
STRIP_HEIGHT_PX = 2000
MAX_WORKERS = 4

LOCK_FILE = "/tmp/pdf-convert.lock"
QUEUE_FILE = "/tmp/pdf-convert-queue.json"


# ── Status ──

def write_status(status_path, status, current_page=0, total_pages=0, error=None):
    data = {"status": status, "currentPage": current_page, "totalPages": total_pages}
    if error:
        data["error"] = error
    Path(status_path).write_text(json.dumps(data))


# ── Lock & Queue ──

def acquire_lock():
    if os.path.exists(LOCK_FILE):
        try:
            pid = int(Path(LOCK_FILE).read_text().strip())
            os.kill(pid, 0)
            return False
        except (ProcessLookupError, ValueError, OSError):
            pass
    Path(LOCK_FILE).write_text(str(os.getpid()))
    return True


def release_lock():
    try:
        os.remove(LOCK_FILE)
    except OSError:
        pass


def read_queue():
    try:
        if os.path.exists(QUEUE_FILE):
            return json.loads(Path(QUEUE_FILE).read_text())
    except Exception:
        pass
    return []


def write_queue(jobs):
    Path(QUEUE_FILE).write_text(json.dumps(jobs))


def enqueue(job):
    queue = read_queue()
    if not any(j["baseName"] == job["baseName"] for j in queue):
        queue.append(job)
        write_queue(queue)
    status_path = os.path.join(job["outputDir"], f"{job['baseName']}.status.json")
    write_status(status_path, "queued")


def dequeue():
    queue = read_queue()
    if not queue:
        return None
    job = queue.pop(0)
    write_queue(queue)
    return job


# ── Helpers ──

def has_cwebp():
    return shutil.which("cwebp") is not None


def convert_to_webp_cwebp(input_path, output_path, quality, max_width):
    """Convert image to WebP using cwebp with multi-threading."""
    cmd = [
        "cwebp", "-q", str(quality),
        "-resize", str(max_width), "0",
        "-mt",
        input_path, "-o", output_path,
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"cwebp failed: {result.stderr.decode()}")


def convert_to_webp_pillow(input_path, output_path, quality, max_width):
    """Fallback: convert image to WebP using Pillow."""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    img = Image.open(input_path)
    if img.width != max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, round(img.height * ratio)), Image.LANCZOS)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    img.save(output_path, format="WEBP", quality=quality)
    del img


def convert_to_webp(input_path, output_path, quality=IMAGE_QUALITY, max_width=MAX_WIDTH):
    if has_cwebp():
        convert_to_webp_cwebp(input_path, output_path, quality, max_width)
    else:
        convert_to_webp_pillow(input_path, output_path, quality, max_width)


def get_page_dimensions(pdf_path):
    """Get page dimensions in points using pdfinfo."""
    try:
        info = pdfinfo_from_path(pdf_path)
        size = info.get("Page size")
        pages = info.get("Pages", 1)
        if size:
            parts = size.lower().replace("pts", "").replace("pt", "").split("x")
            if len(parts) == 2:
                w_pt = float(parts[0].strip())
                h_pt = float(parts[1].strip())
                return pages, w_pt, h_pt
        return pages, None, None
    except Exception as e:
        print(f"    Could not determine page info: {e}")
        return 1, None, None


def calculate_dpi(w_pt, h_pt):
    """Calculate optimal DPI. Never below MIN_DPI, never above BASE_DPI."""
    if w_pt is None:
        return BASE_DPI
    w_in = w_pt / 72
    ideal_dpi = int(MAX_WIDTH / w_in)
    dpi = max(ideal_dpi, MIN_DPI)
    dpi = min(dpi, BASE_DPI)
    return dpi


def render_page_jpeg(pdf_path, page_num, dpi, tmpdir):
    """Render a single page to JPEG using pdftoppm."""
    prefix = os.path.join(tmpdir, f"page-{page_num:03d}")
    cmd = [
        "pdftoppm",
        "-r", str(dpi),
        "-f", str(page_num), "-l", str(page_num),
        "-jpeg", "-jpegopt", "quality=95",
        "-singlefile",
        pdf_path, prefix,
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"pdftoppm failed for page {page_num}: {result.stderr.decode()}")
    jpeg_path = prefix + ".jpg"
    if not os.path.exists(jpeg_path):
        raise RuntimeError(f"pdftoppm produced no output for page {page_num}")
    return jpeg_path


def render_all_pages_jpeg(pdf_path, total_pages, dpi, tmpdir):
    """Render all pages at once using a single pdftoppm call (batch mode)."""
    prefix = os.path.join(tmpdir, "page")
    cmd = [
        "pdftoppm",
        "-r", str(dpi),
        "-jpeg", "-jpegopt", "quality=95",
        pdf_path, prefix,
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"pdftoppm batch failed: {result.stderr.decode()}")

    # pdftoppm outputs: page-01.jpg, page-02.jpg, ... or page-1.jpg depending on page count
    pages = {}
    for f in sorted(os.listdir(tmpdir)):
        if f.startswith("page-") and f.endswith(".jpg"):
            # Extract page number from filename like page-01.jpg or page-1.jpg
            num_str = f.replace("page-", "").replace(".jpg", "")
            try:
                num = int(num_str)
                pages[num] = os.path.join(tmpdir, f)
            except ValueError:
                pass
    return pages


def slice_jpeg_into_strips(jpeg_path, strip_height, tmpdir, base_prefix):
    """Slice a JPEG into horizontal strips using Pillow. Returns list of (strip_path, width, height)."""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    img = Image.open(jpeg_path)
    w, h = img.size

    if h <= strip_height:
        # No slicing needed
        return [(jpeg_path, w, h)]

    strips = []
    num_strips = math.ceil(h / strip_height)
    for i in range(num_strips):
        top = i * strip_height
        bottom = min((i + 1) * strip_height, h)
        strip = img.crop((0, top, w, bottom))
        strip_path = os.path.join(tmpdir, f"{base_prefix}-strip-{i:03d}.jpg")
        strip.save(strip_path, format="JPEG", quality=95)
        strips.append((strip_path, strip.width, strip.height))
        del strip
    del img
    return strips


def needs_strip_rendering(w_pt, h_pt, dpi):
    """Check if a page is too large to render+convert in one piece."""
    if w_pt is None or h_pt is None:
        return False
    render_w = int((w_pt / 72) * dpi)
    render_h = int((h_pt / 72) * dpi)
    return render_w * render_h > MAX_RENDER_PIXELS


def render_strip_to_webp(pdf_path, dpi, page_num, y_px, h_px, w_pt, output_path, quality, max_width):
    """Render a strip directly from the PDF via pdftoppm crop, then encode to WebP.

    This is a top-level function so ProcessPoolExecutor can pickle it.
    Each worker renders only one strip (~36MB), keeping memory low.
    """
    import subprocess as sp
    import tempfile as tf

    with tf.TemporaryDirectory() as tmpdir:
        prefix = os.path.join(tmpdir, "strip")
        render_w = int(w_pt / 72 * dpi)
        cmd = [
            "pdftoppm", "-r", str(dpi),
            "-f", str(page_num), "-l", str(page_num),
            "-x", "0", "-y", str(y_px),
            "-W", str(render_w), "-H", str(h_px),
            "-png", "-singlefile", pdf_path, prefix,
        ]
        result = sp.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"pdftoppm strip failed: {result.stderr.decode()}")

        png_path = prefix + ".png"
        if shutil.which("cwebp"):
            cwebp_cmd = [
                "cwebp", "-q", str(quality),
                "-resize", str(max_width), "0",
                "-mt",
                png_path, "-o", output_path,
            ]
            r = sp.run(cwebp_cmd, capture_output=True)
            if r.returncode != 0:
                raise RuntimeError(f"cwebp failed: {r.stderr.decode()}")
        else:
            from PIL import Image
            Image.MAX_IMAGE_PIXELS = None
            img = Image.open(png_path)
            if img.width != max_width:
                ratio = max_width / img.width
                img = img.resize((max_width, round(img.height * ratio)), Image.LANCZOS)
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.save(output_path, format="WEBP", quality=quality)
            del img

    return os.path.getsize(output_path)


# ── Conversion ──

def convert_one(pdf_path, output_dir, base_name):
    status_path = os.path.join(output_dir, f"{base_name}.status.json")
    os.makedirs(output_dir, exist_ok=True)

    total_pages, w_pt, h_pt = get_page_dimensions(pdf_path)
    dpi = calculate_dpi(w_pt, h_pt)

    print(f"  {total_pages} page(s), DPI={dpi}, cwebp={'yes' if has_cwebp() else 'no (fallback to Pillow)'}")
    if w_pt and h_pt:
        render_w = int((w_pt / 72) * dpi)
        render_h = int((h_pt / 72) * dpi)
        print(f"  Page dimensions: {w_pt:.0f}x{h_pt:.0f}pt → {render_w}x{render_h}px")

    # Pre-estimate total tiles (may be refined as pages are processed)
    # For giant/tall pages, tiles > pages, so we track dynamically
    total_tiles = total_pages  # initial estimate: 1 tile per page
    write_status(status_path, "converting", 0, total_tiles)

    tile_counter = 0
    use_batch = not needs_strip_rendering(w_pt, h_pt, dpi)

    with tempfile.TemporaryDirectory() as tmpdir:
        if use_batch and total_pages > 1:
            print(f"  Batch rendering {total_pages} pages...")
            page_jpegs = render_all_pages_jpeg(pdf_path, total_pages, dpi, tmpdir)
        else:
            page_jpegs = None

        for page_num in range(1, total_pages + 1):
            print(f"  Page {page_num}/{total_pages}...", flush=True)

            is_giant = needs_strip_rendering(w_pt, h_pt, dpi)

            if is_giant:
                # ── Giant page: render strips directly from PDF in parallel ──
                render_w = int((w_pt / 72) * dpi)
                render_h = int((h_pt / 72) * dpi)
                num_strips = math.ceil(render_h / STRIP_HEIGHT_PX)
                # This page produces num_strips tiles instead of 1; adjust total
                total_tiles += (num_strips - 1)
                print(f"    Giant page ({render_w}x{render_h}px) → {num_strips} strips (parallel direct rendering)")

                strips_to_render = []
                for i in range(num_strips):
                    y = i * STRIP_HEIGHT_PX
                    h = min(STRIP_HEIGHT_PX, render_h - y)
                    t_num = tile_counter + i + 1
                    out_path = os.path.join(output_dir, f"{base_name}-page-{t_num:03d}.{IMAGE_EXT}")
                    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
                        print(f"    Strip {i+1}/{num_strips} — already exists, skipping")
                        continue
                    strips_to_render.append((i, t_num, y, h, out_path))

                if strips_to_render:
                    workers = min(os.cpu_count() or 4, len(strips_to_render))
                    print(f"    Rendering {len(strips_to_render)} strips with {workers} workers...")

                    with ProcessPoolExecutor(max_workers=workers) as executor:
                        futures = {}
                        for i, t_num, y, h, out_path in strips_to_render:
                            f = executor.submit(
                                render_strip_to_webp,
                                pdf_path, dpi, page_num, y, h, w_pt,
                                out_path, IMAGE_QUALITY, MAX_WIDTH,
                            )
                            futures[f] = (i, num_strips, t_num)

                        for f in as_completed(futures):
                            i, total, t_num = futures[f]
                            size_kb = f.result() / 1024
                            print(f"    Strip {i+1}/{total} → {size_kb:.0f}KB")
                            write_status(status_path, "converting", t_num, total_tiles)

                tile_counter += num_strips

            else:
                # ── Normal page: render full page, convert to WebP ──
                if page_jpegs and page_num in page_jpegs:
                    jpeg_path = page_jpegs[page_num]
                else:
                    jpeg_path = render_page_jpeg(pdf_path, page_num, dpi, tmpdir)

                from PIL import Image
                Image.MAX_IMAGE_PIXELS = None
                img = Image.open(jpeg_path)
                page_w, page_h = img.size
                del img

                if page_h > MAX_HEIGHT:
                    # Tall but not giant — slice then convert
                    strips = slice_jpeg_into_strips(jpeg_path, STRIP_HEIGHT_PX, tmpdir, f"p{page_num}")
                    num_strips = len(strips)
                    # This page produces num_strips tiles instead of 1; adjust total
                    total_tiles += (num_strips - 1)
                    print(f"    Tall page ({page_w}x{page_h}) → {num_strips} strips")

                    strip_args = [(i, sp, sw, sh) for i, (sp, sw, sh) in enumerate(strips)]
                    workers = min(MAX_WORKERS, len(strip_args))
                    with ThreadPoolExecutor(max_workers=workers) as executor:
                        def _convert_strip(args):
                            strip_idx, strip_path, sw, sh = args
                            t_num = tile_counter + strip_idx + 1
                            out = os.path.join(output_dir, f"{base_name}-page-{t_num:03d}.{IMAGE_EXT}")
                            if os.path.exists(out) and os.path.getsize(out) > 0:
                                print(f"    Strip {strip_idx+1}/{num_strips} — exists, skipping")
                                return t_num
                            convert_to_webp(strip_path, out)
                            print(f"    Strip {strip_idx+1}/{num_strips} → {os.path.getsize(out)/1024:.0f}KB")
                            return t_num

                        futures = {executor.submit(_convert_strip, a): a for a in strip_args}
                        for future in as_completed(futures):
                            t_num = future.result()
                            write_status(status_path, "converting", t_num, total_tiles)

                    tile_counter += num_strips
                else:
                    # Single tile
                    tile_counter += 1
                    out_path = os.path.join(output_dir, f"{base_name}-page-{tile_counter:03d}.{IMAGE_EXT}")

                    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
                        print(f"    Page {page_num} — already exists, skipping")
                        write_status(status_path, "converting", tile_counter, total_tiles)
                        continue

                    convert_to_webp(jpeg_path, out_path)
                    size_kb = os.path.getsize(out_path) / 1024
                    print(f"    {page_w}x{page_h} → {size_kb:.0f}KB")

            write_status(status_path, "converting", tile_counter, total_tiles)

    # Clean up old tiles beyond the new tile count
    old_tile_num = tile_counter + 1
    while True:
        found = False
        for ext in ("webp", "avif", "jpg", "png"):
            old_path = os.path.join(output_dir, f"{base_name}-page-{old_tile_num:03d}.{ext}")
            if os.path.exists(old_path):
                os.remove(old_path)
                found = True
        if not found:
            break
        old_tile_num += 1

    # Clean up legacy single-image files
    for ext in ("jpg", "jpeg", "png", "webp", "avif"):
        legacy = os.path.join(output_dir, f"{base_name}.{ext}")
        if os.path.exists(legacy):
            os.remove(legacy)

    write_status(status_path, "done", total_tiles, total_tiles)
    print(f"  Done: {tile_counter} tile(s)")


# ── Main ──

def main():
    if len(sys.argv) < 4:
        print("Usage: python3 convert-pdf.py <pdf_path> <output_dir> <base_name>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    base_name = sys.argv[3]

    job = {"pdfPath": pdf_path, "outputDir": output_dir, "baseName": base_name}

    if not acquire_lock():
        print("Another conversion is running. Adding to queue.")
        enqueue(job)
        sys.exit(0)

    try:
        status_path = os.path.join(output_dir, f"{base_name}.status.json")
        write_status(status_path, "queued")

        print(f"Converting: {pdf_path}")
        convert_one(pdf_path, output_dir, base_name)

        while True:
            next_job = dequeue()
            if not next_job:
                break
            print(f"\nQueue: {next_job['pdfPath']}")
            try:
                convert_one(next_job["pdfPath"], next_job["outputDir"], next_job["baseName"])
            except Exception as e:
                print(f"  Failed: {e}")
                sp = os.path.join(next_job["outputDir"], f"{next_job['baseName']}.status.json")
                write_status(sp, "error", error=str(e))

    except Exception as e:
        print(f"Conversion failed: {e}")
        status_path = os.path.join(output_dir, f"{base_name}.status.json")
        write_status(status_path, "error", error=str(e))

        while True:
            next_job = dequeue()
            if not next_job:
                break
            try:
                convert_one(next_job["pdfPath"], next_job["outputDir"], next_job["baseName"])
            except Exception as qe:
                sp = os.path.join(next_job["outputDir"], f"{next_job['baseName']}.status.json")
                write_status(sp, "error", error=str(qe))

        sys.exit(1)
    finally:
        release_lock()


if __name__ == "__main__":
    main()
