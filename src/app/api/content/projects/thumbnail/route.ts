import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { validateSession } from "~/lib/auth";
import sharp from "sharp";

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

    // Remove existing thumbnails for this title (all known exts)
    const lowercaseTitle = title.toLowerCase();
    const candidates = [title, lowercaseTitle];

    for (const candidate of candidates) {
      for (const ext of validExtensions) {
        const existingPath = join(thumbnailsDir, `${candidate}${ext}`);
        if (existsSync(existingPath)) {
          await unlink(existingPath);
        }
      }
    }

    // Convert file to buffer and save original + AVIF thumbnail (400x)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original with lowercase title + original ext
    const originalPath = join(thumbnailsDir, `${lowercaseTitle}${fileExt}`);
    await writeFile(originalPath, buffer);

    // Create AVIF thumbnail (400px width, cover). Use higher quality for better visuals.
    try {
      const thumbBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: "cover" })
        .avif({ quality: 85, effort: 6 })
        .toBuffer();

      const avifPath = join(thumbnailsDir, `${lowercaseTitle}.avif`);
      await writeFile(avifPath, thumbBuffer);

      return NextResponse.json({ success: true, thumbnailPath: `/projects-thumbnails/${lowercaseTitle}.avif` });
    } catch (err) {
      console.error("Failed to convert thumbnail to AVIF:", err);
      // fallback to original saved
      return NextResponse.json({ success: true, thumbnailPath: `/projects-thumbnails/${lowercaseTitle}${fileExt}`, warning: "Conversion failed" });
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
    const lowercaseTitle = title.toLowerCase();
    const candidates = [title, lowercaseTitle];

    for (const candidate of candidates) {
      for (const ext of validExtensions) {
        const thumbPath = join(thumbnailsDir, `${candidate}${ext}`);
        if (existsSync(thumbPath)) {
          await unlink(thumbPath);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Thumbnail delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete thumbnail" },
      { status: 500 }
    );
  }
}
