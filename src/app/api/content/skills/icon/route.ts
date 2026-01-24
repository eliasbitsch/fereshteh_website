import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { validateSession } from "~/lib/auth";

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
    const name = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "No name provided" }, { status: 400 });
    }

    const ext = extname(file.name).toLowerCase();
    if (ext !== ".svg") {
      return NextResponse.json({ error: "Only SVG files are allowed" }, { status: 400 });
    }

    const iconsDir = join(process.cwd(), "public", "icons");

    if (!existsSync(iconsDir)) {
      await mkdir(iconsDir, { recursive: true });
    }

    // Sanitize name for filename
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `${safeName}.svg`;
    const filePath = join(iconsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      iconPath: `/icons/${filename}`
    });
  } catch (error) {
    console.error("Icon upload error:", error);
    return NextResponse.json({ error: "Failed to upload icon" }, { status: 500 });
  }
}
