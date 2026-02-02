import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const documentsDir = join(process.cwd(), "public", "documents");

    // Delete old CV if exists
    const oldCvPath = join(documentsDir, "cv_Fereshteh_Hosseini.pdf");
    if (existsSync(oldCvPath)) {
      await unlink(oldCvPath);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save new CV
    const cvPath = join(documentsDir, "cv_Fereshteh_Hosseini.pdf");
    await writeFile(cvPath, buffer);

    return NextResponse.json({
      success: true,
      filename: "cv_Fereshteh_Hosseini.pdf",
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 }
    );
  }
}
