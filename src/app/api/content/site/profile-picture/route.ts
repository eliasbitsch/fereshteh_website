import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { validateSession } from "~/lib/auth";
import { incrementProfilePictureVersion } from "~/lib/content";
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
    const ext = extname(file.name).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const profileDir = join(process.cwd(), "public", "profile-picture");

    if (!existsSync(profileDir)) {
      await mkdir(profileDir, { recursive: true });
    }

    // Keep original file and also write converted AVIF as fereshteh_portrait.avif
    const originalExt = extname(file.name).toLowerCase() || ".jpg";
    const originalName = `fereshteh_portrait_original${originalExt}`;
    const avifName = `fereshteh_portrait.avif`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original
    const originalPath = join(profileDir, originalName);
    await writeFile(originalPath, buffer);

    // Convert to AVIF synchronously and save (higher quality)
    try {
      const avifBuffer = await sharp(buffer).avif({ quality: 90, effort: 6 }).toBuffer();
      const avifPath = join(profileDir, avifName);
      await writeFile(avifPath, avifBuffer);
    } catch (err) {
      console.error("Failed to convert profile picture to AVIF:", err);
      // still return success for original saved
      return NextResponse.json({ success: true, filename: originalName, warning: "Conversion failed" });
    }

    // Increment version to bust cache
    const newVersion = incrementProfilePictureVersion();

    // Revalidate homepage to show new image immediately
    revalidatePath("/");

    return NextResponse.json({ success: true, filename: avifName, version: newVersion });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
