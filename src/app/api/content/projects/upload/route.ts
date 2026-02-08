import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

function startBackgroundConversion(pdfPath: string, outputDir: string): void {
  const baseName = basename(pdfPath, ".pdf");
  // Replace spaces with hyphens for URL-safe filenames
  const safeBaseName = baseName.toLowerCase().replace(/\s+/g, "-");
  const outputPath = join(outputDir, `${safeBaseName}.jpg`);
  const scriptPath = join(process.cwd(), "scripts", "convert-single-pdf.ts");

  // Spawn detached process that runs in background
  const child = spawn("bun", ["run", scriptPath, pdfPath, outputPath], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: true,
  });

  // Unref to allow parent to exit without waiting
  child.unref();

  console.log(`Started background conversion for ${pdfPath}`);
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

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const projectsDir = join(process.cwd(), "public", "projects");
    const jpgDir = join(process.cwd(), "public", "projects-jpg");

    // Ensure directories exist
    if (!existsSync(projectsDir)) {
      await mkdir(projectsDir, { recursive: true });
    }
    if (!existsSync(jpgDir)) {
      await mkdir(jpgDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save PDF file
    const pdfPath = join(projectsDir, file.name);
    await writeFile(pdfPath, buffer);

    // Start conversion in background (don't wait)
    startBackgroundConversion(pdfPath, jpgDir);

    return NextResponse.json({
      success: true,
      filename: file.name,
      message: "File uploaded. Image conversion started in background.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
