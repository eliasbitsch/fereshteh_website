import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { validateSession } from "~/lib/auth";
import { normalizeProjectFilename } from "~/lib/projects-pdf";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

export async function POST(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "No title provided" }, { status: 400 });
    }

    const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
    const fileExt = extname(file.name).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: "Only image files (PNG, JPG, JPEG, WebP, AVIF) are allowed" },
        { status: 400 }
      );
    }

    const thumbnailsDir = join(process.cwd(), "public", "projects-thumbnails");

    // Ensure directory exists
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true });
    }

    // Normalize title for consistent filename
    const normalizedTitle = normalizeProjectFilename(title);

    if (!normalizedTitle) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    console.log(
      `[Thumbnail Upload] Original title: "${title}", Normalized: "${normalizedTitle}"`
    );

    // Remove existing thumbnails with various naming patterns
    const cleanupCandidates = [title, normalizedTitle, title.toLowerCase()];
    let removedCount = 0;

    for (const candidate of cleanupCandidates) {
      for (const ext of validExtensions) {
        const existingPath = join(thumbnailsDir, `${candidate}${ext}`);
        if (existsSync(existingPath)) {
          try {
            await unlink(existingPath);
            removedCount++;
            console.log(
              `[Thumbnail Upload] Removed old thumbnail: ${candidate}${ext}`
            );
          } catch (err) {
            console.error(
              `[Thumbnail Upload] Failed to remove ${candidate}${ext}:`,
              err
            );
          }
        }
      }
    }

    if (removedCount > 0) {
      console.log(
        `[Thumbnail Upload] Cleaned up ${removedCount} old thumbnail(s)`
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original with normalized title + original ext
    const originalPath = join(thumbnailsDir, `${normalizedTitle}${fileExt}`);
    await writeFile(originalPath, buffer);
    console.log(
      `[Thumbnail Upload] Saved original: ${normalizedTitle}${fileExt}`
    );

    // Create AVIF thumbnail (400px width, cover). Use higher quality for better visuals.
    try {
      const thumbBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: "cover" })
        .avif({ quality: 85, effort: 6 })
        .toBuffer();

      const avifPath = join(thumbnailsDir, `${normalizedTitle}.avif`);
      await writeFile(avifPath, thumbBuffer);
      console.log(
        `[Thumbnail Upload] Created AVIF thumbnail: ${normalizedTitle}.avif`
      );

      return NextResponse.json({
        success: true,
        thumbnailPath: `/projects-thumbnails/${normalizedTitle}.avif`,
        normalizedFilename: normalizedTitle,
      });
    } catch (err) {
      console.error(
        "[Thumbnail Upload] Failed to convert thumbnail to AVIF:",
        err
      );
      // fallback to original saved
      return NextResponse.json({
        success: true,
        thumbnailPath: `/projects-thumbnails/${normalizedTitle}${fileExt}`,
        warning: "Conversion failed",
        normalizedFilename: normalizedTitle,
      });
    }
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload thumbnail" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body as { title: string };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const thumbnailsDir = join(process.cwd(), "public", "projects-thumbnails");

    if (!existsSync(thumbnailsDir)) {
      return NextResponse.json({ success: true });
    }

    const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
    const normalizedTitle = normalizeProjectFilename(title);
    const candidates = [title, normalizedTitle, title.toLowerCase()];

    console.log(
      `[Thumbnail Delete] Deleting thumbnails for title: "${title}", Normalized: "${normalizedTitle}"`
    );

    let deletedCount = 0;
    for (const candidate of candidates) {
      for (const ext of validExtensions) {
        const thumbPath = join(thumbnailsDir, `${candidate}${ext}`);
        if (existsSync(thumbPath)) {
          try {
            await unlink(thumbPath);
            deletedCount++;
            console.log(`[Thumbnail Delete] Deleted: ${candidate}${ext}`);
          } catch (err) {
            console.error(
              `[Thumbnail Delete] Failed to delete ${candidate}${ext}:`,
              err
            );
          }
        }
      }
    }

    console.log(`[Thumbnail Delete] Deleted ${deletedCount} thumbnail(s)`);
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Thumbnail delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete thumbnail" },
      { status: 500 }
    );
  }
}
